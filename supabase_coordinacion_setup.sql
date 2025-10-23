-- ============================================
-- SISTEMA DE COORDINACIÓN CLÍNICA
-- Psicóloga Karem - Panel de Belmaris
-- ============================================

-- ============================================
-- PASO 1: Agregar rol de coordinación
-- ============================================

-- Modificar constraint de rol en profiles (si existe)
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_rol_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_rol_check 
CHECK (rol IN ('paciente', 'terapeuta', 'coordinacion', 'administracion'));

-- Asegurar que la columna rol existe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS rol text DEFAULT 'paciente';

-- Crear usuario de coordinación (ajustar email según necesidad)
-- Nota: El usuario debe crearse primero en Supabase Auth
-- UPDATE profiles SET rol = 'coordinacion' WHERE email = 'belmaris@psicologakarem.com';

-- ============================================
-- PASO 2: Políticas RLS para coordinación
-- ============================================

-- Coordinación puede ver todos los perfiles
DROP POLICY IF EXISTS "coordinacion_read_profiles" ON profiles;
CREATE POLICY "coordinacion_read_profiles"
ON profiles FOR SELECT
USING (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
);

-- Coordinación puede ver todas las sesiones
DROP POLICY IF EXISTS "coordinacion_read_sesiones" ON sesiones;
CREATE POLICY "coordinacion_read_sesiones"
ON sesiones FOR SELECT
USING (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
);

-- Coordinación puede actualizar sesiones
DROP POLICY IF EXISTS "coordinacion_update_sesiones" ON sesiones;
CREATE POLICY "coordinacion_update_sesiones"
ON sesiones FOR UPDATE
USING (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
);

-- Coordinación puede crear sesiones
DROP POLICY IF EXISTS "coordinacion_insert_sesiones" ON sesiones;
CREATE POLICY "coordinacion_insert_sesiones"
ON sesiones FOR INSERT
WITH CHECK (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
);

-- Coordinación puede eliminar sesiones
DROP POLICY IF EXISTS "coordinacion_delete_sesiones" ON sesiones;
CREATE POLICY "coordinacion_delete_sesiones"
ON sesiones FOR DELETE
USING (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
);

-- ============================================
-- PASO 3: Políticas para pagos
-- ============================================

-- Verificar que tabla pagos existe
CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sesion_id uuid REFERENCES sesiones(id) ON DELETE CASCADE,
  paciente_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  terapeuta_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  monto numeric(10,2) NOT NULL,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado_paciente', 'confirmado_admin', 'rechazado')),
  metodo_pago text,
  referencia text,
  notas text,
  confirmado_por uuid REFERENCES profiles(id),
  fecha_pago timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para pagos
CREATE INDEX IF NOT EXISTS idx_pagos_sesion ON pagos(sesion_id);
CREATE INDEX IF NOT EXISTS idx_pagos_paciente ON pagos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);

-- Habilitar RLS
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Coordinación puede ver todos los pagos
DROP POLICY IF EXISTS "coordinacion_read_pagos" ON pagos;
CREATE POLICY "coordinacion_read_pagos"
ON pagos FOR SELECT
USING (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
);

-- Coordinación puede actualizar pagos
DROP POLICY IF EXISTS "coordinacion_update_pagos" ON pagos;
CREATE POLICY "coordinacion_update_pagos"
ON pagos FOR UPDATE
USING (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
);

-- Coordinación puede crear pagos
DROP POLICY IF EXISTS "coordinacion_insert_pagos" ON pagos;
CREATE POLICY "coordinacion_insert_pagos"
ON pagos FOR INSERT
WITH CHECK (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
);

-- ============================================
-- PASO 4: Políticas para mensajes
-- ============================================

-- Coordinación puede ver todos los mensajes
DROP POLICY IF EXISTS "coordinacion_read_mensajes" ON mensajes;
CREATE POLICY "coordinacion_read_mensajes"
ON mensajes FOR SELECT
USING (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
);

-- Coordinación puede enviar mensajes
DROP POLICY IF EXISTS "coordinacion_insert_mensajes" ON mensajes;
CREATE POLICY "coordinacion_insert_mensajes"
ON mensajes FOR INSERT
WITH CHECK (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
  AND auth.uid() = remitente_id
);

-- ============================================
-- PASO 5: Políticas para notificaciones
-- ============================================

-- Coordinación puede crear notificaciones para cualquier usuario
DROP POLICY IF EXISTS "coordinacion_insert_notificaciones" ON notificaciones;
CREATE POLICY "coordinacion_insert_notificaciones"
ON notificaciones FOR INSERT
WITH CHECK (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
);

-- Coordinación puede ver todas las notificaciones
DROP POLICY IF EXISTS "coordinacion_read_notificaciones" ON notificaciones;
CREATE POLICY "coordinacion_read_notificaciones"
ON notificaciones FOR SELECT
USING (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
);

-- ============================================
-- PASO 6: Tabla de recordatorios programados
-- ============================================

CREATE TABLE IF NOT EXISTS recordatorios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sesion_id uuid REFERENCES sesiones(id) ON DELETE CASCADE NOT NULL,
  paciente_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('24h', '4h', 'custom')),
  mensaje text NOT NULL,
  fecha_envio timestamp with time zone NOT NULL,
  enviado boolean DEFAULT false,
  canal text DEFAULT 'notificacion' CHECK (canal IN ('notificacion', 'whatsapp', 'email', 'todos')),
  created_at timestamp with time zone DEFAULT now(),
  enviado_at timestamp with time zone
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_recordatorios_sesion ON recordatorios(sesion_id);
CREATE INDEX IF NOT EXISTS idx_recordatorios_paciente ON recordatorios(paciente_id);
CREATE INDEX IF NOT EXISTS idx_recordatorios_fecha_envio ON recordatorios(fecha_envio);
CREATE INDEX IF NOT EXISTS idx_recordatorios_enviado ON recordatorios(enviado) WHERE enviado = false;

-- Habilitar RLS
ALTER TABLE recordatorios ENABLE ROW LEVEL SECURITY;

-- Coordinación puede gestionar recordatorios
DROP POLICY IF EXISTS "coordinacion_all_recordatorios" ON recordatorios;
CREATE POLICY "coordinacion_all_recordatorios"
ON recordatorios FOR ALL
USING (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
);

-- ============================================
-- PASO 7: Funciones auxiliares
-- ============================================

-- Función para obtener sesiones del día para coordinación
CREATE OR REPLACE FUNCTION obtener_sesiones_hoy_coordinacion()
RETURNS TABLE (
  id uuid,
  fecha timestamp with time zone,
  modalidad text,
  estado text,
  terapeuta_id uuid,
  terapeuta_nombre text,
  terapeuta_avatar text,
  paciente_id uuid,
  paciente_nombre text,
  paciente_avatar text,
  paciente_telefono text,
  pago_estado text,
  notas text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.fecha,
    s.modalidad,
    s.estado,
    s.terapeuta_id,
    t.nombre as terapeuta_nombre,
    t.avatar_url as terapeuta_avatar,
    s.paciente_id,
    p.nombre as paciente_nombre,
    p.avatar_url as paciente_avatar,
    p.telefono as paciente_telefono,
    pg.estado as pago_estado,
    s.notas
  FROM sesiones s
  INNER JOIN profiles t ON t.id = s.terapeuta_id
  INNER JOIN profiles p ON p.id = s.paciente_id
  LEFT JOIN pagos pg ON pg.sesion_id = s.id
  WHERE DATE(s.fecha) = CURRENT_DATE
    AND s.estado != 'cancelada'
  ORDER BY s.fecha ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener pagos pendientes
CREATE OR REPLACE FUNCTION obtener_pagos_pendientes_coordinacion()
RETURNS TABLE (
  id uuid,
  sesion_id uuid,
  monto numeric,
  estado text,
  fecha_pago timestamp with time zone,
  paciente_id uuid,
  paciente_nombre text,
  paciente_telefono text,
  terapeuta_id uuid,
  terapeuta_nombre text,
  sesion_fecha timestamp with time zone,
  metodo_pago text,
  referencia text,
  notas text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pg.id,
    pg.sesion_id,
    pg.monto,
    pg.estado,
    pg.fecha_pago,
    pg.paciente_id,
    p.nombre as paciente_nombre,
    p.telefono as paciente_telefono,
    pg.terapeuta_id,
    t.nombre as terapeuta_nombre,
    s.fecha as sesion_fecha,
    pg.metodo_pago,
    pg.referencia,
    pg.notas
  FROM pagos pg
  INNER JOIN profiles p ON p.id = pg.paciente_id
  INNER JOIN profiles t ON t.id = pg.terapeuta_id
  LEFT JOIN sesiones s ON s.id = pg.sesion_id
  WHERE pg.estado IN ('pendiente', 'confirmado_paciente')
  ORDER BY pg.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para programar recordatorios automáticos
CREATE OR REPLACE FUNCTION programar_recordatorios_sesion(p_sesion_id uuid)
RETURNS void AS $$
DECLARE
  v_sesion record;
BEGIN
  -- Obtener datos de la sesión
  SELECT s.*, p.id as paciente_id, p.nombre as paciente_nombre, t.nombre as terapeuta_nombre
  INTO v_sesion
  FROM sesiones s
  INNER JOIN profiles p ON p.id = s.paciente_id
  INNER JOIN profiles t ON t.id = s.terapeuta_id
  WHERE s.id = p_sesion_id;

  -- Recordatorio 24 horas antes
  INSERT INTO recordatorios (sesion_id, paciente_id, tipo, mensaje, fecha_envio, canal)
  VALUES (
    v_sesion.id,
    v_sesion.paciente_id,
    '24h',
    'Hola ' || v_sesion.paciente_nombre || ', te recordamos que mañana tienes sesión con ' || v_sesion.terapeuta_nombre || ' a las ' || to_char(v_sesion.fecha, 'HH24:MI') || '. 🌟',
    v_sesion.fecha - interval '24 hours',
    'todos'
  )
  ON CONFLICT DO NOTHING;

  -- Recordatorio 4 horas antes
  INSERT INTO recordatorios (sesion_id, paciente_id, tipo, mensaje, fecha_envio, canal)
  VALUES (
    v_sesion.id,
    v_sesion.paciente_id,
    '4h',
    'Hola ' || v_sesion.paciente_nombre || ', tu sesión con ' || v_sesion.terapeuta_nombre || ' es en 4 horas (' || to_char(v_sesion.fecha, 'HH24:MI') || '). Te esperamos 🌸',
    v_sesion.fecha - interval '4 hours',
    'todos'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para programar recordatorios automáticamente
CREATE OR REPLACE FUNCTION trigger_programar_recordatorios()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'confirmada' AND (TG_OP = 'INSERT' OR OLD.estado != 'confirmada') THEN
    PERFORM programar_recordatorios_sesion(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_programar_recordatorios ON sesiones;
CREATE TRIGGER trg_programar_recordatorios
AFTER INSERT OR UPDATE ON sesiones
FOR EACH ROW EXECUTE FUNCTION trigger_programar_recordatorios();

-- ============================================
-- PASO 8: Función para confirmar pago
-- ============================================

CREATE OR REPLACE FUNCTION confirmar_pago_coordinacion(
  p_pago_id uuid,
  p_confirmado_por uuid,
  p_notas text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_pago record;
  v_admin_id uuid;
BEGIN
  -- Obtener datos del pago
  SELECT * INTO v_pago FROM pagos WHERE id = p_pago_id;
  
  IF v_pago IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pago no encontrado');
  END IF;

  -- Actualizar pago
  UPDATE pagos
  SET 
    estado = 'confirmado_paciente',
    confirmado_por = p_confirmado_por,
    notas = COALESCE(p_notas, notas),
    updated_at = now()
  WHERE id = p_pago_id;

  -- Buscar usuario administración
  SELECT id INTO v_admin_id 
  FROM profiles 
  WHERE rol = 'administracion' 
  LIMIT 1;

  -- Notificar a administración si existe
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, referencia_id)
    VALUES (
      v_admin_id,
      'Pago confirmado por coordinación',
      'El pago de ' || (SELECT nombre FROM profiles WHERE id = v_pago.paciente_id) || ' por $' || v_pago.monto || ' está listo para revisión financiera.',
      'pago',
      p_pago_id
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'pago_id', p_pago_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 9: Comentarios
-- ============================================

COMMENT ON TABLE recordatorios IS 'Recordatorios programados para sesiones (24h y 4h antes)';
COMMENT ON COLUMN recordatorios.tipo IS 'Tipo de recordatorio: 24h, 4h, custom';
COMMENT ON COLUMN recordatorios.canal IS 'Canal de envío: notificacion, whatsapp, email, todos';

COMMENT ON FUNCTION obtener_sesiones_hoy_coordinacion() IS 'Obtiene sesiones del día con información completa para coordinación';
COMMENT ON FUNCTION obtener_pagos_pendientes_coordinacion() IS 'Obtiene pagos pendientes de confirmación';
COMMENT ON FUNCTION programar_recordatorios_sesion(uuid) IS 'Programa recordatorios automáticos 24h y 4h antes de la sesión';
COMMENT ON FUNCTION confirmar_pago_coordinacion(uuid, uuid, text) IS 'Confirma pago y notifica a administración';

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT 
  '✅ Configuración de coordinación completada' as status,
  (SELECT COUNT(*) FROM profiles WHERE rol = 'coordinacion') as usuarios_coordinacion,
  (SELECT COUNT(*) FROM recordatorios) as recordatorios_programados;

-- ============================================
-- INSTRUCCIONES POST-INSTALACIÓN
-- ============================================

-- 1. Crear usuario de Belmaris en Supabase Auth
-- 2. Ejecutar: UPDATE profiles SET rol = 'coordinacion' WHERE email = 'belmaris@psicologakarem.com';
-- 3. Configurar Edge Function para procesar recordatorios (ver supabase/functions/recordatorios)
-- 4. Configurar integración de WhatsApp API (opcional)
