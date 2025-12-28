-- =====================================================
-- MIGRACIÓN: Sistema de Facturación y Datos Fiscales
-- Fecha: 2025-12-28
-- Descripción: Crea el sistema de facturación con:
--   - Tabla de facturas
--   - Tabla de pagos manuales
--   - Campos de datos fiscales en terapeutas
--   - Funciones para numeración correlativa
-- =====================================================

-- =====================================================
-- 1. NUEVOS CAMPOS EN TERAPEUTAS
-- =====================================================

-- Datos fiscales del terapeuta (emisor de facturas)
ALTER TABLE terapeutas
ADD COLUMN IF NOT EXISTS datos_fiscales JSONB DEFAULT '{
  "nif": "",
  "razon_social": "",
  "direccion": "",
  "codigo_postal": "",
  "ciudad": "",
  "provincia": "",
  "regimen_iva": "exento",
  "numero_colegiado": ""
}'::jsonb;

-- Configuración de numeración de facturas
ALTER TABLE terapeutas
ADD COLUMN IF NOT EXISTS numeracion_facturas JSONB DEFAULT '{
  "prefijo": "F",
  "ultimo_numero": 0,
  "anio_actual": 2025
}'::jsonb;

-- Comentarios
COMMENT ON COLUMN terapeutas.datos_fiscales IS 'Datos fiscales del terapeuta para emisión de facturas (NIF, dirección, régimen IVA)';
COMMENT ON COLUMN terapeutas.numeracion_facturas IS 'Configuración de numeración correlativa de facturas';

-- =====================================================
-- 2. TABLA DE FACTURAS
-- =====================================================

CREATE TABLE IF NOT EXISTS facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terapeuta_id UUID NOT NULL REFERENCES terapeutas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,

  -- Identificación
  numero_factura TEXT NOT NULL,
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Tipo de cliente
  tipo_cliente TEXT NOT NULL DEFAULT 'particular' CHECK (tipo_cliente IN ('particular', 'empresa')),

  -- Datos del receptor
  receptor_nombre TEXT NOT NULL,
  receptor_nif TEXT,
  receptor_direccion TEXT,

  -- Importes (con precisión de 2 decimales)
  base_imponible NUMERIC(10,2) NOT NULL DEFAULT 0,
  porcentaje_iva NUMERIC(5,2) NOT NULL DEFAULT 0,
  importe_iva NUMERIC(10,2) NOT NULL DEFAULT 0,
  porcentaje_irpf NUMERIC(5,2) NOT NULL DEFAULT 0,
  importe_irpf NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- Concepto y detalle
  concepto TEXT NOT NULL,
  lineas_detalle JSONB DEFAULT '[]'::jsonb,

  -- Relaciones opcionales
  pago_id UUID,
  bono_id UUID REFERENCES bonos(id) ON DELETE SET NULL,

  -- Estado y metadatos
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'emitida', 'anulada')),
  motivo_anulacion TEXT,
  pdf_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint único por terapeuta
  CONSTRAINT facturas_numero_unico UNIQUE (terapeuta_id, numero_factura)
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_facturas_terapeuta ON facturas(terapeuta_id);
CREATE INDEX IF NOT EXISTS idx_facturas_paciente ON facturas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_emision DESC);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);

-- Comentarios
COMMENT ON TABLE facturas IS 'Facturas emitidas por terapeutas a sus pacientes';
COMMENT ON COLUMN facturas.numero_factura IS 'Número de factura con formato: PREFIJO-YYYY-XXXX';
COMMENT ON COLUMN facturas.tipo_cliente IS 'particular: IVA exento (configurable), empresa: IVA 21% + IRPF -15%';
COMMENT ON COLUMN facturas.lineas_detalle IS 'Array de líneas: [{descripcion, cantidad, precioUnitario, total}]';

-- =====================================================
-- 3. TABLA DE PAGOS MANUALES (REGISTROS)
-- =====================================================

CREATE TABLE IF NOT EXISTS pagos_registros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terapeuta_id UUID NOT NULL REFERENCES terapeutas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,

  -- Datos del pago
  fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
  monto NUMERIC(10,2) NOT NULL,
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'bizum', 'tarjeta', 'stripe')),
  concepto TEXT,

  -- Relaciones opcionales
  bono_id UUID REFERENCES bonos(id) ON DELETE SET NULL,
  factura_id UUID REFERENCES facturas(id) ON DELETE SET NULL,
  cita_id UUID REFERENCES citas(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pagos_registros_terapeuta ON pagos_registros(terapeuta_id);
CREATE INDEX IF NOT EXISTS idx_pagos_registros_paciente ON pagos_registros(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_registros_fecha ON pagos_registros(fecha_pago DESC);
CREATE INDEX IF NOT EXISTS idx_pagos_registros_bono ON pagos_registros(bono_id);

-- Comentarios
COMMENT ON TABLE pagos_registros IS 'Registro de pagos manuales (no asociados necesariamente a citas)';

-- =====================================================
-- 4. FUNCIONES AUXILIARES
-- =====================================================

-- Función para obtener el próximo número de factura
CREATE OR REPLACE FUNCTION fn_obtener_proximo_numero_factura(p_terapeuta_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config JSONB;
  v_prefijo TEXT;
  v_ultimo_numero INTEGER;
  v_anio_actual INTEGER;
  v_anio_config INTEGER;
  v_nuevo_numero INTEGER;
  v_numero_factura TEXT;
BEGIN
  -- Obtener configuración actual
  SELECT numeracion_facturas INTO v_config
  FROM terapeutas
  WHERE id = p_terapeuta_id;

  IF v_config IS NULL THEN
    v_config := '{"prefijo": "F", "ultimo_numero": 0, "anio_actual": 2025}'::jsonb;
  END IF;

  v_prefijo := COALESCE(v_config->>'prefijo', 'F');
  v_ultimo_numero := COALESCE((v_config->>'ultimo_numero')::integer, 0);
  v_anio_config := COALESCE((v_config->>'anio_actual')::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer);
  v_anio_actual := EXTRACT(YEAR FROM CURRENT_DATE)::integer;

  -- Si cambió el año, resetear numeración
  IF v_anio_actual > v_anio_config THEN
    v_nuevo_numero := 1;
  ELSE
    v_nuevo_numero := v_ultimo_numero + 1;
  END IF;

  -- Formatear número: PREFIJO-YYYY-XXXX
  v_numero_factura := v_prefijo || '-' || v_anio_actual::text || '-' || LPAD(v_nuevo_numero::text, 4, '0');

  -- Actualizar configuración
  UPDATE terapeutas
  SET numeracion_facturas = jsonb_build_object(
    'prefijo', v_prefijo,
    'ultimo_numero', v_nuevo_numero,
    'anio_actual', v_anio_actual
  ),
  updated_at = NOW()
  WHERE id = p_terapeuta_id;

  RETURN v_numero_factura;
END;
$$;

-- Función para crear factura con cálculos automáticos
CREATE OR REPLACE FUNCTION fn_crear_factura(
  p_terapeuta_id UUID,
  p_paciente_id UUID,
  p_tipo_cliente TEXT,
  p_receptor_nombre TEXT,
  p_receptor_nif TEXT,
  p_receptor_direccion TEXT,
  p_concepto TEXT,
  p_base_imponible NUMERIC,
  p_aplicar_iva BOOLEAN DEFAULT true,
  p_aplicar_irpf BOOLEAN DEFAULT false,
  p_lineas_detalle JSONB DEFAULT '[]'::jsonb,
  p_bono_id UUID DEFAULT NULL,
  p_pago_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_factura_id UUID;
  v_numero_factura TEXT;
  v_porcentaje_iva NUMERIC := 0;
  v_importe_iva NUMERIC := 0;
  v_porcentaje_irpf NUMERIC := 0;
  v_importe_irpf NUMERIC := 0;
  v_total NUMERIC;
  v_regimen_iva TEXT;
BEGIN
  -- Obtener régimen IVA del terapeuta
  SELECT COALESCE(datos_fiscales->>'regimen_iva', 'exento') INTO v_regimen_iva
  FROM terapeutas
  WHERE id = p_terapeuta_id;

  -- Calcular IVA según tipo de cliente y régimen
  IF p_tipo_cliente = 'empresa' THEN
    -- Empresa siempre tiene IVA 21%
    v_porcentaje_iva := 21;
    v_importe_iva := ROUND(p_base_imponible * 0.21, 2);
    -- IRPF -15% para empresas
    v_porcentaje_irpf := 15;
    v_importe_irpf := ROUND(p_base_imponible * 0.15, 2);
  ELSIF p_aplicar_iva AND v_regimen_iva = 'general' THEN
    -- Particular con régimen general
    v_porcentaje_iva := 21;
    v_importe_iva := ROUND(p_base_imponible * 0.21, 2);
  END IF;
  -- Si es particular y régimen exento, IVA = 0 (ya está en 0)

  -- Calcular total
  v_total := p_base_imponible + v_importe_iva - v_importe_irpf;

  -- Obtener número de factura
  v_numero_factura := fn_obtener_proximo_numero_factura(p_terapeuta_id);

  -- Insertar factura
  INSERT INTO facturas (
    terapeuta_id,
    paciente_id,
    numero_factura,
    fecha_emision,
    tipo_cliente,
    receptor_nombre,
    receptor_nif,
    receptor_direccion,
    base_imponible,
    porcentaje_iva,
    importe_iva,
    porcentaje_irpf,
    importe_irpf,
    total,
    concepto,
    lineas_detalle,
    bono_id,
    pago_id,
    estado
  ) VALUES (
    p_terapeuta_id,
    p_paciente_id,
    v_numero_factura,
    CURRENT_DATE,
    p_tipo_cliente,
    p_receptor_nombre,
    p_receptor_nif,
    p_receptor_direccion,
    p_base_imponible,
    v_porcentaje_iva,
    v_importe_iva,
    v_porcentaje_irpf,
    v_importe_irpf,
    v_total,
    p_concepto,
    p_lineas_detalle,
    p_bono_id,
    p_pago_id,
    'emitida'
  )
  RETURNING id INTO v_factura_id;

  RETURN v_factura_id;
END;
$$;

-- Función para anular factura
CREATE OR REPLACE FUNCTION fn_anular_factura(
  p_factura_id UUID,
  p_motivo TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE facturas
  SET
    estado = 'anulada',
    motivo_anulacion = p_motivo,
    updated_at = NOW()
  WHERE id = p_factura_id
    AND estado = 'emitida';

  RETURN FOUND;
END;
$$;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Trigger para actualizar updated_at en facturas
CREATE OR REPLACE FUNCTION fn_facturas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_facturas_updated_at ON facturas;
CREATE TRIGGER trg_facturas_updated_at
  BEFORE UPDATE ON facturas
  FOR EACH ROW
  EXECUTE FUNCTION fn_facturas_updated_at();

-- Trigger para actualizar updated_at en pagos_registros
DROP TRIGGER IF EXISTS trg_pagos_registros_updated_at ON pagos_registros;
CREATE TRIGGER trg_pagos_registros_updated_at
  BEFORE UPDATE ON pagos_registros
  FOR EACH ROW
  EXECUTE FUNCTION fn_facturas_updated_at();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_registros ENABLE ROW LEVEL SECURITY;

-- Políticas para facturas
-- Staff (coordinadoras, psicólogas) pueden gestionar todas las facturas
CREATE POLICY "staff_full_access_facturas"
  ON facturas FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Terapeutas pueden ver sus propias facturas (terapeuta_id coincide con su ID de auth)
CREATE POLICY "terapeuta_ver_propias_facturas"
  ON facturas FOR SELECT
  TO authenticated
  USING (
    terapeuta_id = auth.uid()
    OR
    -- También si el terapeuta tiene el mismo ID en la tabla terapeutas
    terapeuta_id IN (
      SELECT t.id FROM terapeutas t WHERE t.email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Políticas para pagos_registros
-- Staff puede gestionar todos los pagos
CREATE POLICY "staff_full_access_pagos_registros"
  ON pagos_registros FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Terapeutas pueden ver sus propios pagos
CREATE POLICY "terapeuta_ver_propios_pagos"
  ON pagos_registros FOR SELECT
  TO authenticated
  USING (
    terapeuta_id = auth.uid()
    OR
    terapeuta_id IN (
      SELECT t.id FROM terapeutas t WHERE t.email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- =====================================================
-- 7. GRANTS
-- =====================================================

-- Permisos para las funciones
GRANT EXECUTE ON FUNCTION fn_obtener_proximo_numero_factura(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_crear_factura(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, BOOLEAN, BOOLEAN, JSONB, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_anular_factura(UUID, TEXT) TO authenticated;
