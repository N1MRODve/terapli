# 📝 SQL PASO A PASO - Sistema de Bonos

Esta guía te permite ejecutar el sistema de bonos en bloques pequeños y verificables.

---

## 📦 PASO 1: Agregar Valores a ENUMs Existentes

```sql
-- Agregar valores faltantes a estado_bono si no existen
DO $$ 
BEGIN
    -- Agregar 'pendiente' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'estado_bono' AND e.enumlabel = 'pendiente'
    ) THEN
        ALTER TYPE estado_bono ADD VALUE 'pendiente';
        RAISE NOTICE 'Valor "pendiente" agregado a estado_bono';
    END IF;
    
    -- Agregar 'completado' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'estado_bono' AND e.enumlabel = 'completado'
    ) THEN
        ALTER TYPE estado_bono ADD VALUE 'completado';
        RAISE NOTICE 'Valor "completado" agregado a estado_bono';
    END IF;
    
    -- Agregar 'vencido' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'estado_bono' AND e.enumlabel = 'vencido'
    ) THEN
        ALTER TYPE estado_bono ADD VALUE 'vencido';
        RAISE NOTICE 'Valor "vencido" agregado a estado_bono';
    END IF;
    
    -- Agregar 'cancelado' si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'estado_bono' AND e.enumlabel = 'cancelado'
    ) THEN
        ALTER TYPE estado_bono ADD VALUE 'cancelado';
        RAISE NOTICE 'Valor "cancelado" agregado a estado_bono';
    END IF;
END $$;
```

✅ **Verificar**:
```sql
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'estado_bono'
ORDER BY enumlabel;
```

---

## 📦 PASO 2: Agregar Valor a tipo_bono

```sql
-- Agregar 'personalizado' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'tipo_bono' AND e.enumlabel = 'personalizado'
    ) THEN
        ALTER TYPE tipo_bono ADD VALUE 'personalizado';
        RAISE NOTICE 'Valor "personalizado" agregado a tipo_bono';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al agregar valores a tipo_bono: %', SQLERRM;
END $$;
```

✅ **Verificar**:
```sql
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'tipo_bono'
ORDER BY enumlabel;
```

---

## 📦 PASO 3: Actualizar Tabla Bonos - Parte 1 (Agregar Columnas)

```sql
-- Agregar columnas faltantes
DO $$ BEGIN
    -- Columna psicologa_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='bonos' AND column_name='psicologa_id') THEN
        ALTER TABLE public.bonos ADD COLUMN psicologa_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Columna psicologa_id agregada';
    END IF;
    
    -- Columna frecuencia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='bonos' AND column_name='frecuencia') THEN
        ALTER TABLE public.bonos ADD COLUMN frecuencia text;
        RAISE NOTICE '✅ Columna frecuencia agregada';
    END IF;
    
    -- Columna fecha_inicio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='bonos' AND column_name='fecha_inicio') THEN
        ALTER TABLE public.bonos ADD COLUMN fecha_inicio date;
        RAISE NOTICE '✅ Columna fecha_inicio agregada';
    END IF;
    
    -- Columna pagado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='bonos' AND column_name='pagado') THEN
        ALTER TABLE public.bonos ADD COLUMN pagado boolean DEFAULT false;
        RAISE NOTICE '✅ Columna pagado agregada';
    END IF;
    
    -- Columna renovacion_automatica
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='bonos' AND column_name='renovacion_automatica') THEN
        ALTER TABLE public.bonos ADD COLUMN renovacion_automatica boolean DEFAULT false;
        RAISE NOTICE '✅ Columna renovacion_automatica agregada';
    END IF;
    
    -- Columna tipo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='bonos' AND column_name='tipo') THEN
        ALTER TABLE public.bonos ADD COLUMN tipo tipo_bono;
        RAISE NOTICE '✅ Columna tipo agregada';
    END IF;
END $$;
```

✅ **Verificar**:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'bonos'
ORDER BY ordinal_position;
```

---

## 📦 PASO 4: Actualizar Tabla Bonos - Parte 2 (Renombrar Columnas)

```sql
-- Renombrar columnas existentes
DO $$ BEGIN
    -- Renombrar total_sesiones a sesiones_totales
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema='public' AND table_name='bonos' AND column_name='total_sesiones')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema='public' AND table_name='bonos' AND column_name='sesiones_totales') THEN
        ALTER TABLE public.bonos RENAME COLUMN total_sesiones TO sesiones_totales;
        RAISE NOTICE '✅ Columna total_sesiones renombrada a sesiones_totales';
    END IF;
    
    -- Renombrar fecha_expiracion a fecha_fin
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema='public' AND table_name='bonos' AND column_name='fecha_expiracion')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema='public' AND table_name='bonos' AND column_name='fecha_fin') THEN
        ALTER TABLE public.bonos RENAME COLUMN fecha_expiracion TO fecha_fin;
        ALTER TABLE public.bonos ALTER COLUMN fecha_fin TYPE date USING fecha_fin::date;
        RAISE NOTICE '✅ Columna fecha_expiracion renombrada a fecha_fin';
    END IF;
    
    -- Renombrar precio_total a monto
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema='public' AND table_name='bonos' AND column_name='precio_total')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema='public' AND table_name='bonos' AND column_name='monto') THEN
        ALTER TABLE public.bonos RENAME COLUMN precio_total TO monto;
        RAISE NOTICE '✅ Columna precio_total renombrada a monto';
    END IF;
END $$;
```

✅ **Verificar**:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'bonos'
AND column_name IN ('sesiones_totales', 'fecha_fin', 'monto');
```

---

## 📦 PASO 5: Inicializar Datos en Columnas Nuevas

```sql
-- Inicializar fecha_inicio con created_at para registros existentes
UPDATE public.bonos 
SET fecha_inicio = created_at::date 
WHERE fecha_inicio IS NULL;

-- Marcar como pagado los bonos activos existentes
UPDATE public.bonos 
SET pagado = true 
WHERE estado = 'activo' AND pagado IS NULL;

-- Sincronizar tipo con tipo_bono
UPDATE public.bonos 
SET tipo = tipo_bono 
WHERE tipo IS NULL AND tipo_bono IS NOT NULL;
```

✅ **Verificar**:
```sql
SELECT 
  COUNT(*) as total_bonos,
  COUNT(fecha_inicio) as con_fecha_inicio,
  COUNT(CASE WHEN pagado = true THEN 1 END) as bonos_pagados
FROM public.bonos;
```

---

## 📦 PASO 6: Crear Índices en Tabla Bonos

```sql
-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_bonos_paciente_id ON public.bonos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_bonos_psicologa_id ON public.bonos(psicologa_id) WHERE psicologa_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bonos_estado ON public.bonos(estado);
CREATE INDEX IF NOT EXISTS idx_bonos_fecha_fin ON public.bonos(fecha_fin) WHERE fecha_fin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bonos_activos ON public.bonos(estado, paciente_id);
CREATE INDEX IF NOT EXISTS idx_bonos_proximos_vencer ON public.bonos(fecha_fin, estado) WHERE fecha_fin IS NOT NULL;
```

✅ **Verificar**:
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'bonos'
ORDER BY indexname;
```

---

## 📦 PASO 7: Crear Tabla pagos_bonos

```sql
-- Tabla para registrar pagos y renovaciones de bonos
CREATE TABLE IF NOT EXISTS public.pagos_bonos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bono_id uuid NOT NULL REFERENCES public.bonos(id) ON DELETE CASCADE,
    fecha_pago date NOT NULL DEFAULT CURRENT_DATE,
    monto numeric(10,2) NOT NULL CHECK (monto >= 0),
    metodo_pago text CHECK (metodo_pago IN ('transferencia', 'tarjeta', 'efectivo', 'bizum', 'paypal', 'otro')),
    confirmado boolean DEFAULT false,
    confirmado_por uuid REFERENCES public.profiles(id),
    fecha_confirmacion timestamptz,
    comprobante_url text,
    notas text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pagos_bonos IS 'Registro de pagos asociados a bonos de sesiones';

-- Índices
CREATE INDEX IF NOT EXISTS idx_pagos_bonos_bono_id ON public.pagos_bonos(bono_id);
CREATE INDEX IF NOT EXISTS idx_pagos_bonos_fecha ON public.pagos_bonos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_bonos_confirmado ON public.pagos_bonos(confirmado);
CREATE INDEX IF NOT EXISTS idx_pagos_bonos_pendientes ON public.pagos_bonos(bono_id, confirmado) 
    WHERE confirmado = false;
```

✅ **Verificar**:
```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pagos_bonos'
ORDER BY ordinal_position;
```

---

## 📦 PASO 8: Crear Tabla renovaciones_bonos

```sql
-- Tabla para controlar renovaciones automáticas y manuales de bonos
CREATE TABLE IF NOT EXISTS public.renovaciones_bonos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bono_original_id uuid NOT NULL REFERENCES public.bonos(id) ON DELETE CASCADE,
    nuevo_bono_id uuid REFERENCES public.bonos(id) ON DELETE SET NULL,
    fecha_renovacion date NOT NULL DEFAULT CURRENT_DATE,
    renovado_por uuid REFERENCES public.profiles(id),
    tipo_renovacion text CHECK (tipo_renovacion IN ('automatica', 'manual')) DEFAULT 'manual',
    motivo text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.renovaciones_bonos IS 'Historial de renovaciones de bonos (automáticas y manuales)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_renovaciones_bono_original ON public.renovaciones_bonos(bono_original_id);
CREATE INDEX IF NOT EXISTS idx_renovaciones_nuevo_bono ON public.renovaciones_bonos(nuevo_bono_id) 
    WHERE nuevo_bono_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_renovaciones_fecha ON public.renovaciones_bonos(fecha_renovacion);
CREATE INDEX IF NOT EXISTS idx_renovaciones_tipo ON public.renovaciones_bonos(tipo_renovacion);
```

✅ **Verificar**:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%bono%'
ORDER BY table_name;
```

---

## 📦 PASO 9: Crear Función set_updated_at

```sql
-- Función para actualizar timestamp updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.set_updated_at() IS 
'Función de trigger para actualizar automáticamente el campo updated_at';

-- Aplicar trigger a tabla bonos
DROP TRIGGER IF EXISTS trigger_bonos_updated_at ON public.bonos;
CREATE TRIGGER trigger_bonos_updated_at
    BEFORE UPDATE ON public.bonos
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
```

✅ **Verificar**:
```sql
SELECT tgname, tgrelid::regclass, tgtype
FROM pg_trigger 
WHERE tgname = 'trigger_bonos_updated_at';
```

---

## 📦 PASO 10: Crear Trigger actualizar_sesiones_restantes

```sql
CREATE OR REPLACE FUNCTION public.actualizar_sesiones_restantes()
RETURNS TRIGGER AS $$
DECLARE
    bono_record record;
BEGIN
    -- Solo ejecutar si hay un bono asociado y debe descontar
    IF NEW.bono_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Si la cita se marca como realizada, descontar
    IF NEW.estado = 'realizada' AND (OLD IS NULL OR OLD.estado != 'realizada') THEN
        
        -- Obtener información del bono con lock
        SELECT * INTO bono_record
        FROM public.bonos
        WHERE id = NEW.bono_id
        FOR UPDATE;
        
        -- Validar que el bono tenga sesiones disponibles
        IF bono_record.sesiones_restantes > 0 THEN
            -- Decrementar sesiones restantes
            UPDATE public.bonos
            SET 
                sesiones_restantes = sesiones_restantes - 1,
                estado = CASE 
                    WHEN sesiones_restantes - 1 <= 0 THEN 'agotado'
                    ELSE estado
                END,
                updated_at = now()
            WHERE id = NEW.bono_id;
            
            RAISE NOTICE 'Sesión descontada del bono %. Sesiones restantes: %', 
                         NEW.bono_id, bono_record.sesiones_restantes - 1;
        ELSE
            RAISE WARNING 'El bono % no tiene sesiones disponibles', NEW.bono_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger a tabla citas
DROP TRIGGER IF EXISTS trigger_actualizar_sesiones ON public.citas;
CREATE TRIGGER trigger_actualizar_sesiones
    AFTER INSERT OR UPDATE ON public.citas
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_sesiones_restantes();
```

✅ **Verificar**:
```sql
SELECT tgname, tgrelid::regclass
FROM pg_trigger 
WHERE tgname = 'trigger_actualizar_sesiones';
```

---

## 📦 PASO 11: Crear Trigger activar_bono_al_pagar

```sql
CREATE OR REPLACE FUNCTION public.activar_bono_al_pagar()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el pago se marca como confirmado, activar el bono si está pendiente
    IF NEW.confirmado = true AND (OLD.confirmado = false OR OLD.confirmado IS NULL) THEN
        UPDATE public.bonos
        SET 
            estado = CASE 
                WHEN estado = 'pendiente' THEN 'activo'
                ELSE estado
            END,
            pagado = true,
            updated_at = now()
        WHERE id = NEW.bono_id;
        
        RAISE NOTICE 'Bono % activado tras confirmación de pago %', NEW.bono_id, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger a pagos_bonos
DROP TRIGGER IF EXISTS trigger_activar_bono ON public.pagos_bonos;
CREATE TRIGGER trigger_activar_bono
    AFTER INSERT OR UPDATE ON public.pagos_bonos
    FOR EACH ROW
    EXECUTE FUNCTION public.activar_bono_al_pagar();
```

✅ **Verificar**:
```sql
SELECT tgname, tgrelid::regclass
FROM pg_trigger 
WHERE tgname = 'trigger_activar_bono';
```

---

## 📦 PASO 12: Crear Trigger renovar_bono_automatico

```sql
CREATE OR REPLACE FUNCTION public.renovar_bono_automatico()
RETURNS TRIGGER AS $$
DECLARE
    nuevo_bono_id uuid;
BEGIN
    -- Solo ejecutar si renovación automática activa y bono agotado/completado
    IF NEW.renovacion_automatica = true 
       AND NEW.estado IN ('agotado', 'completado')
       AND (OLD.estado IS NULL OR OLD.estado NOT IN ('agotado', 'completado')) THEN
        
        -- Crear nuevo bono duplicando el original
        INSERT INTO public.bonos (
            paciente_id,
            psicologa_id,
            tipo,
            frecuencia,
            sesiones_totales,
            sesiones_restantes,
            fecha_inicio,
            fecha_fin,
            estado,
            monto,
            pagado,
            renovacion_automatica,
            notas
        ) VALUES (
            NEW.paciente_id,
            NEW.psicologa_id,
            NEW.tipo,
            NEW.frecuencia,
            NEW.sesiones_totales,
            NEW.sesiones_totales,
            now(),
            CASE 
                WHEN NEW.fecha_fin IS NOT NULL THEN 
                    now() + (NEW.fecha_fin - NEW.fecha_inicio)
                ELSE NULL
            END,
            'pendiente',
            NEW.monto,
            false,
            NEW.renovacion_automatica,
            'Renovación automática de bono ' || NEW.id
        ) RETURNING id INTO nuevo_bono_id;
        
        -- Registrar la renovación
        INSERT INTO public.renovaciones_bonos (
            bono_original_id,
            nuevo_bono_id,
            fecha_renovacion,
            tipo_renovacion,
            motivo
        ) VALUES (
            NEW.id,
            nuevo_bono_id,
            now(),
            'automatica',
            'Renovación automática por agotamiento de sesiones'
        );
        
        RAISE NOTICE 'Bono % renovado automáticamente. Nuevo bono: %', NEW.id, nuevo_bono_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger a bonos
DROP TRIGGER IF EXISTS trigger_renovar_bono ON public.bonos;
CREATE TRIGGER trigger_renovar_bono
    AFTER UPDATE ON public.bonos
    FOR EACH ROW
    EXECUTE FUNCTION public.renovar_bono_automatico();
```

✅ **Verificar**:
```sql
SELECT tgname, tgrelid::regclass
FROM pg_trigger 
WHERE tgname = 'trigger_renovar_bono';
```

---

## 📦 PASO 13: Crear Funciones de Consulta

```sql
-- Función: Obtener estadísticas completas de un bono
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_bono(p_bono_id uuid)
RETURNS jsonb AS $$
DECLARE
    resultado jsonb;
BEGIN
    SELECT jsonb_build_object(
        'bono_id', b.id,
        'paciente_id', b.paciente_id,
        'paciente_nombre', COALESCE(pac.metadata->>'nombre_completo', pac.email),
        'psicologa_id', b.psicologa_id,
        'psicologa_nombre', COALESCE(psi.metadata->>'nombre_completo', psi.email),
        'tipo', b.tipo::text,
        'frecuencia', b.frecuencia,
        'sesiones_totales', b.sesiones_totales,
        'sesiones_restantes', b.sesiones_restantes,
        'sesiones_usadas', b.sesiones_totales - b.sesiones_restantes,
        'porcentaje_usado', ROUND(((b.sesiones_totales - b.sesiones_restantes)::numeric / 
                                   NULLIF(b.sesiones_totales, 0)) * 100, 2),
        'estado', b.estado::text,
        'fecha_inicio', b.fecha_inicio,
        'fecha_fin', b.fecha_fin,
        'dias_restantes', CASE 
            WHEN b.fecha_fin IS NOT NULL THEN (b.fecha_fin - CURRENT_DATE)
            ELSE NULL
        END,
        'monto', b.monto,
        'pagado', b.pagado,
        'renovacion_automatica', b.renovacion_automatica,
        'total_pagado', COALESCE(
            (SELECT SUM(monto) FROM public.pagos_bonos WHERE bono_id = b.id AND confirmado = true),
            0
        ),
        'pagos_pendientes', COALESCE(
            (SELECT COUNT(*) FROM public.pagos_bonos WHERE bono_id = b.id AND confirmado = false),
            0
        ),
        'citas_realizadas', COALESCE(
            (SELECT COUNT(*) FROM public.citas WHERE bono_id = b.id AND estado = 'realizada'),
            0
        ),
        'citas_programadas', COALESCE(
            (SELECT COUNT(*) FROM public.citas WHERE bono_id = b.id AND estado IN ('pendiente', 'confirmada')),
            0
        ),
        'created_at', b.created_at,
        'updated_at', b.updated_at
    ) INTO resultado
    FROM public.bonos b
    LEFT JOIN public.profiles pac ON pac.id = b.paciente_id
    LEFT JOIN public.profiles psi ON psi.id = b.psicologa_id
    WHERE b.id = p_bono_id;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.obtener_estadisticas_bono(uuid) IS 
'Devuelve estadísticas completas de un bono en formato JSON';
```

✅ **Verificar**:
```sql
-- Si tienes bonos, prueba:
-- SELECT * FROM obtener_estadisticas_bono('tu-bono-id');
SELECT proname, prorettype::regtype 
FROM pg_proc 
WHERE proname = 'obtener_estadisticas_bono';
```

---

## 📦 PASO 14: Crear Funciones de Alertas

```sql
-- Función: Obtener bonos próximos a vencer
CREATE OR REPLACE FUNCTION public.obtener_bonos_proximos_vencer(dias_anticipacion int DEFAULT 7)
RETURNS TABLE (
    bono_id uuid,
    paciente_id uuid,
    paciente_nombre text,
    psicologa_nombre text,
    sesiones_restantes integer,
    fecha_fin date,
    dias_restantes integer,
    estado text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as bono_id,
        b.paciente_id,
        COALESCE(pac.metadata->>'nombre_completo', pac.email) as paciente_nombre,
        COALESCE(psi.metadata->>'nombre_completo', psi.email) as psicologa_nombre,
        b.sesiones_restantes,
        b.fecha_fin,
        (b.fecha_fin - CURRENT_DATE) as dias_restantes,
        b.estado::text
    FROM public.bonos b
    LEFT JOIN public.profiles pac ON pac.id = b.paciente_id
    LEFT JOIN public.profiles psi ON psi.id = b.psicologa_id
    WHERE b.estado IN ('activo', 'pendiente')
      AND b.fecha_fin IS NOT NULL
      AND b.fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + dias_anticipacion
    ORDER BY b.fecha_fin ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Obtener bonos con pocas sesiones
CREATE OR REPLACE FUNCTION public.obtener_bonos_pocas_sesiones(sesiones_minimas int DEFAULT 2)
RETURNS TABLE (
    bono_id uuid,
    paciente_id uuid,
    paciente_nombre text,
    psicologa_nombre text,
    sesiones_restantes integer,
    sesiones_totales integer,
    tipo text,
    renovacion_automatica boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as bono_id,
        b.paciente_id,
        COALESCE(pac.metadata->>'nombre_completo', pac.email) as paciente_nombre,
        COALESCE(psi.metadata->>'nombre_completo', psi.email) as psicologa_nombre,
        b.sesiones_restantes,
        b.sesiones_totales,
        b.tipo::text,
        b.renovacion_automatica
    FROM public.bonos b
    LEFT JOIN public.profiles pac ON pac.id = b.paciente_id
    LEFT JOIN public.profiles psi ON psi.id = b.psicologa_id
    WHERE b.estado = 'activo'
      AND b.sesiones_restantes <= sesiones_minimas
      AND b.sesiones_restantes > 0
    ORDER BY b.sesiones_restantes ASC, pac.metadata->>'nombre_completo' ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

✅ **Verificar**:
```sql
SELECT proname FROM pg_proc 
WHERE proname LIKE '%bonos%'
ORDER BY proname;
```

---

## 📦 PASO 15: Crear Función de Métricas

```sql
CREATE OR REPLACE FUNCTION public.calcular_metricas_bonos()
RETURNS jsonb AS $$
DECLARE
    resultado jsonb;
BEGIN
    SELECT jsonb_build_object(
        'total_bonos', COUNT(*),
        'bonos_activos', COUNT(*) FILTER (WHERE estado = 'activo'),
        'bonos_pendientes', COUNT(*) FILTER (WHERE estado = 'pendiente'),
        'bonos_completados', COUNT(*) FILTER (WHERE estado = 'completado'),
        'bonos_vencidos', COUNT(*) FILTER (WHERE estado = 'vencido'),
        'bonos_agotados', COUNT(*) FILTER (WHERE estado = 'agotado'),
        'bonos_con_renovacion_auto', COUNT(*) FILTER (WHERE renovacion_automatica = true),
        'total_sesiones_contratadas', COALESCE(SUM(sesiones_totales), 0),
        'total_sesiones_restantes', COALESCE(SUM(sesiones_restantes), 0),
        'total_sesiones_usadas', COALESCE(SUM(sesiones_totales - sesiones_restantes), 0),
        'monto_total_bonos', COALESCE(SUM(monto), 0),
        'monto_bonos_activos', COALESCE(SUM(monto) FILTER (WHERE estado = 'activo'), 0),
        'monto_bonos_pagados', COALESCE(SUM(monto) FILTER (WHERE pagado = true), 0),
        'monto_bonos_pendientes_pago', COALESCE(SUM(monto) FILTER (WHERE pagado = false), 0),
        'bonos_proximos_vencer_7dias', (
            SELECT COUNT(*) FROM public.bonos 
            WHERE estado IN ('activo', 'pendiente')
              AND fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
        ),
        'bonos_pocas_sesiones', (
            SELECT COUNT(*) FROM public.bonos 
            WHERE estado = 'activo' AND sesiones_restantes <= 2 AND sesiones_restantes > 0
        ),
        'tasa_renovacion', ROUND(
            (COUNT(*) FILTER (WHERE renovacion_automatica = true)::numeric / 
             NULLIF(COUNT(*), 0)) * 100, 2
        ),
        'fecha_calculo', now()
    ) INTO resultado
    FROM public.bonos;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.calcular_metricas_bonos() IS 
'Calcula KPIs y métricas generales del sistema de bonos para dashboard administrativo';
```

✅ **Verificar**:
```sql
SELECT * FROM calcular_metricas_bonos();
```

---

## 📦 PASO 16: Crear Funciones de Renovación y Verificación

```sql
-- Función: Renovar bono manualmente
CREATE OR REPLACE FUNCTION public.renovar_bono_manual(
    p_bono_id uuid,
    p_usuario_id uuid,
    p_motivo text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    bono_original record;
    nuevo_bono_id uuid;
BEGIN
    -- Obtener información del bono original
    SELECT * INTO bono_original
    FROM public.bonos
    WHERE id = p_bono_id;
    
    IF bono_original IS NULL THEN
        RAISE EXCEPTION 'El bono % no existe', p_bono_id;
    END IF;
    
    -- Crear nuevo bono
    INSERT INTO public.bonos (
        paciente_id,
        psicologa_id,
        tipo,
        frecuencia,
        sesiones_totales,
        sesiones_restantes,
        fecha_inicio,
        fecha_fin,
        estado,
        monto,
        pagado,
        renovacion_automatica,
        notas
    ) VALUES (
        bono_original.paciente_id,
        bono_original.psicologa_id,
        bono_original.tipo,
        bono_original.frecuencia,
        bono_original.sesiones_totales,
        bono_original.sesiones_totales,
        now(),
        CASE 
            WHEN bono_original.fecha_fin IS NOT NULL THEN 
                now() + (bono_original.fecha_fin - bono_original.fecha_inicio)
            ELSE NULL
        END,
        'pendiente',
        bono_original.monto,
        false,
        bono_original.renovacion_automatica,
        'Renovación manual de bono ' || p_bono_id || '. ' || COALESCE(p_motivo, '')
    ) RETURNING id INTO nuevo_bono_id;
    
    -- Registrar la renovación
    INSERT INTO public.renovaciones_bonos (
        bono_original_id,
        nuevo_bono_id,
        fecha_renovacion,
        renovado_por,
        tipo_renovacion,
        motivo
    ) VALUES (
        p_bono_id,
        nuevo_bono_id,
        now(),
        p_usuario_id,
        'manual',
        COALESCE(p_motivo, 'Renovación manual solicitada')
    );
    
    -- Marcar bono original como completado si aún está activo
    UPDATE public.bonos
    SET estado = 'completado', updated_at = now()
    WHERE id = p_bono_id AND estado IN ('activo', 'agotado');
    
    RETURN nuevo_bono_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Verificar bonos vencidos
CREATE OR REPLACE FUNCTION public.verificar_bonos_vencidos()
RETURNS void AS $$
BEGIN
    -- Actualizar bonos que han pasado su fecha de fin
    UPDATE public.bonos
    SET 
        estado = 'vencido',
        updated_at = now()
    WHERE estado IN ('activo', 'pendiente')
      AND fecha_fin IS NOT NULL
      AND fecha_fin < CURRENT_DATE;
    
    -- Log de la operación
    IF FOUND THEN
        RAISE NOTICE 'Bonos vencidos actualizados: %', ROW_COUNT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

✅ **Verificar**:
```sql
SELECT proname, prorettype::regtype 
FROM pg_proc 
WHERE proname IN ('renovar_bono_manual', 'verificar_bonos_vencidos');
```

---

## 📦 PASO 17: Crear Vistas

```sql
-- Vista: Dashboard de bonos completo
CREATE OR REPLACE VIEW public.vista_dashboard_bonos_completo AS
SELECT 
    b.id as bono_id,
    b.paciente_id,
    COALESCE(pac.metadata->>'nombre_completo', pac.email) as paciente_nombre,
    pac.email as paciente_email,
    pac.telefono as paciente_telefono,
    b.psicologa_id,
    prof.metadata->>'nombre_completo' as psicologa_nombre,
    prof.email as psicologa_email,
    b.tipo::text as tipo,
    b.frecuencia,
    b.sesiones_totales,
    b.sesiones_restantes,
    (b.sesiones_totales - b.sesiones_restantes) as sesiones_usadas,
    ROUND(((b.sesiones_totales - b.sesiones_restantes)::numeric / 
           NULLIF(b.sesiones_totales, 0)) * 100, 2) as porcentaje_usado,
    b.estado::text as estado,
    b.fecha_inicio,
    b.fecha_fin,
    CASE 
        WHEN b.fecha_fin IS NOT NULL THEN (b.fecha_fin - CURRENT_DATE)
        ELSE NULL
    END as dias_restantes,
    b.monto,
    b.pagado,
    b.renovacion_automatica,
    b.notas,
    COALESCE((SELECT SUM(pb.monto) FROM public.pagos_bonos pb 
              WHERE pb.bono_id = b.id AND pb.confirmado = true), 0) as total_pagado,
    COALESCE((SELECT COUNT(*) FROM public.pagos_bonos pb 
              WHERE pb.bono_id = b.id AND pb.confirmado = false), 0) as pagos_pendientes,
    COALESCE((SELECT COUNT(*) FROM public.citas c 
              WHERE c.bono_id = b.id AND c.estado = 'realizada'), 0) as citas_realizadas,
    COALESCE((SELECT COUNT(*) FROM public.citas c 
              WHERE c.bono_id = b.id AND c.estado IN ('pendiente', 'confirmada')), 0) as citas_programadas,
    CASE 
        WHEN b.estado = 'activo' AND b.sesiones_restantes <= 2 THEN true
        ELSE false
    END as alerta_pocas_sesiones,
    CASE 
        WHEN b.estado IN ('activo', 'pendiente') 
             AND b.fecha_fin IS NOT NULL 
             AND b.fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + 7 THEN true
        ELSE false
    END as alerta_proximo_vencer,
    b.created_at,
    b.updated_at
FROM public.bonos b
LEFT JOIN public.profiles pac ON pac.id = b.paciente_id
LEFT JOIN public.profiles prof ON prof.id = b.psicologa_id
ORDER BY b.updated_at DESC;

-- Vista: Resumen de pagos por bono
CREATE OR REPLACE VIEW public.vista_pagos_por_bono AS
SELECT 
    b.id as bono_id,
    b.paciente_id,
    COALESCE(p.metadata->>'nombre_completo', p.email) as paciente_nombre,
    b.monto as monto_bono,
    COUNT(pb.id) as total_pagos,
    COUNT(pb.id) FILTER (WHERE pb.confirmado = true) as pagos_confirmados,
    COUNT(pb.id) FILTER (WHERE pb.confirmado = false) as pagos_pendientes,
    COALESCE(SUM(pb.monto) FILTER (WHERE pb.confirmado = true), 0) as total_pagado,
    COALESCE(SUM(pb.monto) FILTER (WHERE pb.confirmado = false), 0) as total_pendiente,
    (b.monto - COALESCE(SUM(pb.monto) FILTER (WHERE pb.confirmado = true), 0)) as saldo_restante,
    b.pagado as bono_pagado_completo,
    b.estado::text as estado
FROM public.bonos b
LEFT JOIN public.profiles p ON p.id = b.paciente_id
LEFT JOIN public.pagos_bonos pb ON pb.bono_id = b.id
GROUP BY b.id, b.paciente_id, p.metadata, p.email, b.monto, b.pagado, b.estado;
```

✅ **Verificar**:
```sql
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
AND viewname LIKE '%bono%';
```

---

## 📦 PASO 18: Configurar RLS

```sql
-- Habilitar RLS
ALTER TABLE public.bonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_bonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renovaciones_bonos ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para verificar si el usuario es staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND rol IN ('admin', 'coordinadora', 'psicologa')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para bonos
DROP POLICY IF EXISTS "usuarios_ver_bonos" ON public.bonos;
CREATE POLICY "usuarios_ver_bonos"
ON public.bonos FOR SELECT
TO authenticated
USING (
    paciente_id = auth.uid() 
    OR psicologa_id = auth.uid()
    OR public.is_staff()
);

DROP POLICY IF EXISTS "staff_gestionar_bonos" ON public.bonos;
CREATE POLICY "staff_gestionar_bonos"
ON public.bonos FOR ALL
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- Políticas para pagos_bonos
DROP POLICY IF EXISTS "usuarios_ver_pagos_bonos" ON public.pagos_bonos;
CREATE POLICY "usuarios_ver_pagos_bonos"
ON public.pagos_bonos FOR SELECT
TO authenticated
USING (
    bono_id IN (
        SELECT id FROM public.bonos 
        WHERE paciente_id = auth.uid() 
           OR psicologa_id = auth.uid()
    )
    OR public.is_staff()
);

DROP POLICY IF EXISTS "staff_gestionar_pagos_bonos" ON public.pagos_bonos;
CREATE POLICY "staff_gestionar_pagos_bonos"
ON public.pagos_bonos FOR ALL
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- Políticas para renovaciones_bonos
DROP POLICY IF EXISTS "usuarios_ver_renovaciones" ON public.renovaciones_bonos;
CREATE POLICY "usuarios_ver_renovaciones"
ON public.renovaciones_bonos FOR SELECT
TO authenticated
USING (
    bono_original_id IN (
        SELECT id FROM public.bonos 
        WHERE paciente_id = auth.uid()
           OR psicologa_id = auth.uid()
    )
    OR public.is_staff()
);

DROP POLICY IF EXISTS "staff_gestionar_renovaciones" ON public.renovaciones_bonos;
CREATE POLICY "staff_gestionar_renovaciones"
ON public.renovaciones_bonos FOR ALL
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());
```

✅ **Verificar**:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename LIKE '%bono%'
ORDER BY tablename, policyname;
```

---

## 📦 PASO 19: Otorgar Permisos

```sql
-- Otorgar permisos de ejecución a funciones
GRANT EXECUTE ON FUNCTION public.obtener_estadisticas_bono(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_bonos_proximos_vencer(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_bonos_pocas_sesiones(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calcular_metricas_bonos() TO authenticated;
GRANT EXECUTE ON FUNCTION public.renovar_bono_manual(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_bonos_vencidos() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

-- Otorgar permisos de lectura en vistas
GRANT SELECT ON public.vista_dashboard_bonos_completo TO authenticated;
GRANT SELECT ON public.vista_pagos_por_bono TO authenticated;
```

✅ **Verificar**:
```sql
SELECT routine_name, privilege_type, grantee
FROM information_schema.routine_privileges
WHERE routine_name LIKE '%bono%'
ORDER BY routine_name;
```

---

## ✅ PASO 20: Verificación Final

Ejecuta este script para verificar que todo esté correctamente instalado:

```sql
-- Resumen de instalación
SELECT 
    '✅ Tablas' as componente,
    COUNT(*) as cantidad
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%bono%'

UNION ALL

SELECT 
    '✅ Funciones',
    COUNT(*)
FROM pg_proc 
WHERE proname LIKE '%bono%'

UNION ALL

SELECT 
    '✅ Triggers',
    COUNT(*)
FROM pg_trigger 
WHERE tgname LIKE '%bono%' OR tgname LIKE '%renovar%' OR tgname LIKE '%sesion%'

UNION ALL

SELECT 
    '✅ Vistas',
    COUNT(*)
FROM pg_views 
WHERE schemaname = 'public' AND viewname LIKE '%bono%'

UNION ALL

SELECT 
    '✅ Políticas RLS',
    COUNT(*)
FROM pg_policies 
WHERE tablename LIKE '%bono%';
```

---

## 🎉 ¡Sistema Completado!

Si todos los pasos se ejecutaron sin errores, tu sistema de bonos está **100% operativo**.

### Próximos Pasos:

1. **Configurar pg_cron** para verificación diaria de vencimientos
2. **Generar tipos TypeScript**: `npx supabase gen types typescript`
3. **Implementar composables** en el frontend
4. **Crear dashboard administrativo**

---

## 📞 Ayuda Rápida

### Ver estado de tablas:
```sql
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columnas
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_name LIKE '%bono%'
ORDER BY table_name;
```

### Ver bonos existentes:
```sql
SELECT id, paciente_id, tipo::text, estado::text, sesiones_restantes, fecha_fin
FROM bonos
ORDER BY created_at DESC
LIMIT 10;
```

### Ver métricas:
```sql
SELECT * FROM calcular_metricas_bonos();
```
