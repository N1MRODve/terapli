-- ============================================================================
-- FIX: Políticas RLS para tabla CITAS
-- Problema: "permission denied for table users"
-- Solución: Usar tabla terapeutas en lugar de auth.users
-- ============================================================================

-- 1. Eliminar TODAS las políticas antiguas que puedan estar causando conflicto
DROP POLICY IF EXISTS "citas_select_policy" ON citas;
DROP POLICY IF EXISTS "citas_insert_policy" ON citas;
DROP POLICY IF EXISTS "citas_update_policy" ON citas;
DROP POLICY IF EXISTS "citas_delete_policy" ON citas;
DROP POLICY IF EXISTS "Terapeutas pueden ver sus citas" ON citas;
DROP POLICY IF EXISTS "Terapeutas pueden crear citas" ON citas;
DROP POLICY IF EXISTS "Terapeutas pueden actualizar sus citas" ON citas;
DROP POLICY IF EXISTS "Terapeutas pueden eliminar sus citas" ON citas;
-- Eliminar políticas antiguas que hacen referencia a auth.users
DROP POLICY IF EXISTS "Pacientes ven sus citas" ON citas;
DROP POLICY IF EXISTS "Solo staff elimina citas" ON citas;
DROP POLICY IF EXISTS "Staff y terapeuta actualizan citas" ON citas;
DROP POLICY IF EXISTS "Staff y terapeutas crean citas" ON citas;
DROP POLICY IF EXISTS "Terapeutas ven sus citas" ON citas;

-- 2. Habilitar RLS en la tabla citas
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas correctas usando la tabla terapeutas

-- POLÍTICA SELECT: Los terapeutas pueden ver sus propias citas
CREATE POLICY "Ver citas propias"
ON citas
FOR SELECT
TO authenticated
USING (
  -- El terapeuta es el dueño de la cita
  terapeuta_id IN (
    SELECT id 
    FROM terapeutas 
    WHERE email = auth.email() 
    AND activo = true
  )
  OR
  -- O el usuario tiene rol de coordinación/admin
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND rol IN ('coordinadora', 'admin')
  )
  OR
  -- O el paciente ve sus propias citas
  paciente_id = auth.uid()
);

-- POLÍTICA INSERT: Los terapeutas pueden crear citas
CREATE POLICY "Crear citas propias"
ON citas
FOR INSERT
TO authenticated
WITH CHECK (
  -- El terapeuta que crea la cita debe ser el mismo que está autenticado
  terapeuta_id IN (
    SELECT id 
    FROM terapeutas 
    WHERE email = auth.email() 
    AND activo = true
  )
  OR
  -- O el usuario tiene rol de coordinación/admin
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND rol IN ('coordinadora', 'admin')
  )
);

-- POLÍTICA UPDATE: Los terapeutas pueden actualizar sus citas
CREATE POLICY "Actualizar citas propias"
ON citas
FOR UPDATE
TO authenticated
USING (
  terapeuta_id IN (
    SELECT id 
    FROM terapeutas 
    WHERE email = auth.email() 
    AND activo = true
  )
  OR
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND rol IN ('coordinadora', 'admin')
  )
)
WITH CHECK (
  terapeuta_id IN (
    SELECT id 
    FROM terapeutas 
    WHERE email = auth.email() 
    AND activo = true
  )
  OR
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND rol IN ('coordinadora', 'admin')
  )
);

-- POLÍTICA DELETE: Los terapeutas pueden eliminar sus citas
CREATE POLICY "Eliminar citas propias"
ON citas
FOR DELETE
TO authenticated
USING (
  terapeuta_id IN (
    SELECT id 
    FROM terapeutas 
    WHERE email = auth.email() 
    AND activo = true
  )
  OR
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND rol IN ('coordinadora', 'admin')
  )
);

-- 4. Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'citas'
ORDER BY policyname;

-- ============================================================================
-- IMPORTANTE: Ejecuta este script completo en el SQL Editor de Supabase
-- ============================================================================
