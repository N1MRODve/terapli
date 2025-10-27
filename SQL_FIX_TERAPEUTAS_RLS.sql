-- ============================================================================
-- CONFIGURACIÓN COMPLETA: Tabla TERAPEUTAS y sus políticas RLS
-- ============================================================================

-- 1. Verificar/crear la tabla terapeutas si no existe
CREATE TABLE IF NOT EXISTS terapeutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  especialidad TEXT,
  num_colegiada TEXT,
  disponibilidad JSONB,
  activo BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_terapeutas_email ON terapeutas(email);
CREATE INDEX IF NOT EXISTS idx_terapeutas_activo ON terapeutas(activo);

-- 3. Eliminar políticas antiguas
DROP POLICY IF EXISTS "terapeutas_select_policy" ON terapeutas;
DROP POLICY IF EXISTS "terapeutas_insert_policy" ON terapeutas;
DROP POLICY IF EXISTS "terapeutas_update_policy" ON terapeutas;
DROP POLICY IF EXISTS "Terapeutas pueden ver sus datos" ON terapeutas;
DROP POLICY IF EXISTS "Terapeutas pueden actualizar sus datos" ON terapeutas;
DROP POLICY IF EXISTS "Sistema puede insertar terapeutas" ON terapeutas;

-- 4. Habilitar RLS
ALTER TABLE terapeutas ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICA SELECT: Todos los usuarios autenticados pueden ver terapeutas activos
CREATE POLICY "Usuarios autenticados pueden ver terapeutas activos"
ON terapeutas
FOR SELECT
TO authenticated
USING (activo = true);

-- 6. POLÍTICA INSERT: Permitir inserción para sincronización automática
-- Usar service_role o permitir que el sistema inserte basado en el perfil
CREATE POLICY "Sistema puede insertar terapeutas"
ON terapeutas
FOR INSERT
TO authenticated
WITH CHECK (
  -- Permitir si el email coincide con el email del usuario autenticado
  email = auth.email()
  OR
  -- O si el usuario tiene rol de admin/coordinación
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND rol IN ('coordinacion', 'admin')
  )
);

-- 7. POLÍTICA UPDATE: Los terapeutas pueden actualizar sus propios datos
CREATE POLICY "Terapeutas pueden actualizar sus datos"
ON terapeutas
FOR UPDATE
TO authenticated
USING (
  email = auth.email()
  OR
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND rol IN ('coordinacion', 'admin')
  )
)
WITH CHECK (
  email = auth.email()
  OR
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND rol IN ('coordinacion', 'admin')
  )
);

-- 8. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_terapeutas_updated_at ON terapeutas;
CREATE TRIGGER update_terapeutas_updated_at
  BEFORE UPDATE ON terapeutas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'terapeutas'
ORDER BY policyname;

-- ============================================================================
-- PRUEBA: Verificar que tu usuario tiene acceso
-- ============================================================================
-- Ejecuta esto después de correr el script principal:
SELECT * FROM terapeutas WHERE email = auth.email();

-- ============================================================================
-- IMPORTANTE: Ejecuta este script en el SQL Editor de Supabase
-- ============================================================================
