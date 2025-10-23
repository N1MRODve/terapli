-- ============================================
-- MIGRACIÓN: Tabla mensajes existente → Sistema completo
-- Psicóloga Karem - Actualización de esquema
-- ============================================

-- IMPORTANTE: Ejecuta SOLO después de hacer backup
-- CREATE TABLE mensajes_backup AS SELECT * FROM mensajes;

-- ============================================
-- PASO 1: Agregar nuevas columnas
-- ============================================

ALTER TABLE mensajes 
ADD COLUMN IF NOT EXISTS remitente_id uuid,
ADD COLUMN IF NOT EXISTS destinatario_id uuid,
ADD COLUMN IF NOT EXISTS sesion_id uuid,
ADD COLUMN IF NOT EXISTS mensaje text,
ADD COLUMN IF NOT EXISTS visto boolean DEFAULT false;

-- ============================================
-- PASO 2: Migrar datos existentes
-- ============================================

-- Primero, obtener el ID del terapeuta
DO $$
DECLARE
  terapeuta_uuid uuid;
BEGIN
  -- Intentar obtener el UUID del terapeuta desde la tabla profiles
  -- Ajusta esta query según tu esquema real
  SELECT id INTO terapeuta_uuid 
  FROM profiles 
  WHERE rol = 'terapeuta' OR rol = 'psicologa'
  LIMIT 1;

  -- Si no encuentra, usa el primer usuario que no sea paciente
  IF terapeuta_uuid IS NULL THEN
    SELECT id INTO terapeuta_uuid
    FROM profiles
    WHERE id NOT IN (SELECT id FROM profiles WHERE rol = 'paciente')
    LIMIT 1;
  END IF;

  -- Migrar datos
  UPDATE mensajes 
  SET 
    mensaje = COALESCE(contenido, ''),
    visto = COALESCE(leido, false),
    destinatario_id = paciente_id,
    remitente_id = CASE 
      WHEN de_psicologa THEN terapeuta_uuid
      ELSE paciente_id
    END
  WHERE mensaje IS NULL;  -- Solo actualizar filas no migradas

END $$;

-- ============================================
-- PASO 3: Validar migración
-- ============================================

-- Verificar que no hay nulos en campos críticos
SELECT 
  COUNT(*) as total,
  COUNT(remitente_id) as con_remitente,
  COUNT(destinatario_id) as con_destinatario,
  COUNT(mensaje) as con_mensaje
FROM mensajes;

-- Si todos los conteos son iguales, la migración fue exitosa

-- ============================================
-- PASO 4: Aplicar constraints
-- ============================================

-- Agregar foreign keys
ALTER TABLE mensajes 
ADD CONSTRAINT fk_mensajes_remitente 
  FOREIGN KEY (remitente_id) REFERENCES profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_mensajes_destinatario 
  FOREIGN KEY (destinatario_id) REFERENCES profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_mensajes_sesion 
  FOREIGN KEY (sesion_id) REFERENCES sesiones(id) ON DELETE SET NULL;

-- Hacer columnas NOT NULL
ALTER TABLE mensajes 
ALTER COLUMN remitente_id SET NOT NULL,
ALTER COLUMN destinatario_id SET NOT NULL,
ALTER COLUMN mensaje SET NOT NULL,
ALTER COLUMN visto SET NOT NULL;

-- Agregar check constraint
ALTER TABLE mensajes 
ADD CONSTRAINT chk_mensajes_diferentes 
CHECK (remitente_id <> destinatario_id);

-- ============================================
-- PASO 5: Crear índices optimizados
-- ============================================

-- Eliminar índices viejos si existen
DROP INDEX IF EXISTS idx_mensajes_paciente;

-- Crear nuevos índices
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente 
  ON mensajes(remitente_id);

CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario 
  ON mensajes(destinatario_id);

CREATE INDEX IF NOT EXISTS idx_mensajes_created_at 
  ON mensajes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion 
  ON mensajes(remitente_id, destinatario_id);

CREATE INDEX IF NOT EXISTS idx_mensajes_visto 
  ON mensajes(visto) WHERE visto = false;

-- ============================================
-- PASO 6: (OPCIONAL) Eliminar columnas antiguas
-- ============================================

-- SOLO ejecutar si estás SEGURO de no necesitar las columnas viejas
-- ADVERTENCIA: Esta operación NO es reversible

-- ALTER TABLE mensajes DROP COLUMN IF EXISTS contenido;
-- ALTER TABLE mensajes DROP COLUMN IF EXISTS de_psicologa;
-- ALTER TABLE mensajes DROP COLUMN IF EXISTS leido;
-- ALTER TABLE mensajes DROP COLUMN IF EXISTS paciente_id;

-- ============================================
-- PASO 7: Habilitar Row Level Security
-- ============================================

ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 8: Crear políticas RLS
-- ============================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "mensajes_select_participantes" ON mensajes;
DROP POLICY IF EXISTS "mensajes_insert_remitente" ON mensajes;
DROP POLICY IF EXISTS "mensajes_update_visto_destinatario" ON mensajes;

-- Crear nuevas políticas
CREATE POLICY "mensajes_select_participantes"
ON mensajes FOR SELECT
USING (
  auth.uid() = remitente_id OR auth.uid() = destinatario_id
);

CREATE POLICY "mensajes_insert_remitente"
ON mensajes FOR INSERT
WITH CHECK (auth.uid() = remitente_id);

CREATE POLICY "mensajes_update_visto_destinatario"
ON mensajes FOR UPDATE
USING (auth.uid() = destinatario_id)
WITH CHECK (auth.uid() = destinatario_id);

-- ============================================
-- PASO 9: Crear tabla de notificaciones
-- ============================================

CREATE TABLE IF NOT EXISTS notificaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  titulo text NOT NULL,
  mensaje text,
  tipo text DEFAULT 'mensaje',
  visto boolean DEFAULT false,
  referencia_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario 
  ON notificaciones(usuario_id);

CREATE INDEX IF NOT EXISTS idx_notificaciones_visto 
  ON notificaciones(visto) WHERE visto = false;

CREATE INDEX IF NOT EXISTS idx_notificaciones_created_at 
  ON notificaciones(created_at DESC);

-- Habilitar RLS para notificaciones
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notificaciones
DROP POLICY IF EXISTS "notificaciones_select_owner" ON notificaciones;
DROP POLICY IF EXISTS "notificaciones_insert_any" ON notificaciones;
DROP POLICY IF EXISTS "notificaciones_update_owner" ON notificaciones;

CREATE POLICY "notificaciones_select_owner"
ON notificaciones FOR SELECT
USING (auth.uid() = usuario_id);

CREATE POLICY "notificaciones_insert_any"
ON notificaciones FOR INSERT
WITH CHECK (true);

CREATE POLICY "notificaciones_update_owner"
ON notificaciones FOR UPDATE
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- ============================================
-- PASO 10: Crear trigger para notificaciones
-- ============================================

-- Función para crear notificación
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  remitente_nombre text;
BEGIN
  -- Obtener nombre del remitente
  SELECT nombre INTO remitente_nombre
  FROM profiles
  WHERE id = NEW.remitente_id;

  -- Crear notificación para el destinatario
  INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, referencia_id)
  VALUES (
    NEW.destinatario_id,
    'Nuevo mensaje',
    COALESCE('Mensaje de ' || remitente_nombre, 'Has recibido un mensaje en tu espacio'),
    'mensaje',
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
DROP TRIGGER IF EXISTS trg_notify_new_message ON mensajes;

CREATE TRIGGER trg_notify_new_message
AFTER INSERT ON mensajes
FOR EACH ROW EXECUTE PROCEDURE notify_new_message();

-- ============================================
-- PASO 11: Crear funciones auxiliares
-- ============================================

-- Función para contar mensajes no vistos
CREATE OR REPLACE FUNCTION contar_mensajes_no_vistos(usuario_id uuid)
RETURNS bigint AS $$
  SELECT COUNT(*)
  FROM mensajes
  WHERE destinatario_id = usuario_id
    AND visto = false;
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para obtener últimas conversaciones
CREATE OR REPLACE FUNCTION obtener_ultimas_conversaciones(usuario_id uuid)
RETURNS TABLE (
  otro_usuario_id uuid,
  ultimo_mensaje text,
  ultimo_mensaje_fecha timestamp with time zone,
  mensajes_no_vistos bigint,
  otro_usuario_nombre text,
  otro_usuario_avatar text
) AS $$
  SELECT DISTINCT ON (
    CASE 
      WHEN m.remitente_id = usuario_id THEN m.destinatario_id
      ELSE m.remitente_id
    END
  )
  CASE 
    WHEN m.remitente_id = usuario_id THEN m.destinatario_id
    ELSE m.remitente_id
  END as otro_usuario_id,
  m.mensaje as ultimo_mensaje,
  m.created_at as ultimo_mensaje_fecha,
  (
    SELECT COUNT(*)::bigint
    FROM mensajes m2
    WHERE m2.destinatario_id = usuario_id
      AND m2.visto = false
      AND m2.remitente_id = (
        CASE 
          WHEN m.remitente_id = usuario_id THEN m.destinatario_id
          ELSE m.remitente_id
        END
      )
  ) as mensajes_no_vistos,
  p.nombre as otro_usuario_nombre,
  p.avatar_url as otro_usuario_avatar
  FROM mensajes m
  INNER JOIN profiles p ON p.id = (
    CASE 
      WHEN m.remitente_id = usuario_id THEN m.destinatario_id
      ELSE m.remitente_id
    END
  )
  WHERE m.remitente_id = usuario_id OR m.destinatario_id = usuario_id
  ORDER BY otro_usuario_id, m.created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- PASO 12: Verificación final
-- ============================================

-- Ver estructura actualizada
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'mensajes'
ORDER BY ordinal_position;

-- Ver un mensaje de ejemplo
SELECT 
  id,
  remitente_id,
  destinatario_id,
  mensaje,
  visto,
  created_at
FROM mensajes
LIMIT 1;

-- Comentarios
COMMENT ON TABLE mensajes IS 'Mensajes privados entre paciente y terapeuta (migrado a sistema completo)';
COMMENT ON COLUMN mensajes.remitente_id IS 'Usuario que envía el mensaje';
COMMENT ON COLUMN mensajes.destinatario_id IS 'Usuario que recibe el mensaje';
COMMENT ON COLUMN mensajes.sesion_id IS 'Sesión relacionada (opcional)';
COMMENT ON COLUMN mensajes.mensaje IS 'Contenido del mensaje';
COMMENT ON COLUMN mensajes.visto IS 'Indica si el destinatario ha leído el mensaje';

-- ============================================
-- MIGRACIÓN COMPLETADA
-- ============================================

SELECT 
  '✅ Migración completada exitosamente' as status,
  COUNT(*) as mensajes_totales,
  SUM(CASE WHEN visto THEN 1 ELSE 0 END) as mensajes_vistos,
  SUM(CASE WHEN NOT visto THEN 1 ELSE 0 END) as mensajes_pendientes
FROM mensajes;
