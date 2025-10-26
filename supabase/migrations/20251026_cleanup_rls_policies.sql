-- Cleanup: Consolidar y limpiar políticas RLS de sesiones y bonos
-- Fecha: 2025-10-26
-- Problema: Múltiples políticas conflictivas causando errores 406

BEGIN;

-- ============================================================================
-- SESIONES: Limpiar TODAS las políticas existentes
-- ============================================================================
DROP POLICY IF EXISTS "Pacientes can view own sesiones" ON public.sesiones;
DROP POLICY IF EXISTS "Solo staff gestiona sesiones" ON public.sesiones;
DROP POLICY IF EXISTS "Ver sesiones según rol" ON public.sesiones;
DROP POLICY IF EXISTS "staff_can_insert_sesiones" ON public.sesiones;
DROP POLICY IF EXISTS "staff_can_read_all_sesiones" ON public.sesiones;
DROP POLICY IF EXISTS "staff_can_update_sesiones" ON public.sesiones;
DROP POLICY IF EXISTS "staff_can_delete_sesiones" ON public.sesiones;

-- Crear políticas limpias y consolidadas para SESIONES
-- Policy 1: Staff puede hacer TODO
CREATE POLICY "staff_full_access_sesiones"
ON public.sesiones
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_staff = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_staff = true
  )
);

-- Policy 2: Pacientes solo ven sus propias sesiones
CREATE POLICY "paciente_read_own_sesiones"
ON public.sesiones
FOR SELECT
TO authenticated
USING (paciente_id = auth.uid());

-- ============================================================================
-- BONOS: Limpiar TODAS las políticas existentes
-- ============================================================================
DROP POLICY IF EXISTS "Pacientes can view own bonos" ON public.bonos;
DROP POLICY IF EXISTS "Solo staff gestiona bonos" ON public.bonos;
DROP POLICY IF EXISTS "Ver bonos según rol" ON public.bonos;
DROP POLICY IF EXISTS "access_all_temporal_bonos" ON public.bonos; -- ¡Peligrosa!
DROP POLICY IF EXISTS "staff_can_insert_bonos" ON public.bonos;
DROP POLICY IF EXISTS "staff_can_read_all_bonos" ON public.bonos;
DROP POLICY IF EXISTS "staff_can_update_bonos" ON public.bonos;
DROP POLICY IF EXISTS "staff_can_delete_bonos" ON public.bonos;

-- Crear políticas limpias y consolidadas para BONOS
-- Policy 1: Staff puede hacer TODO
CREATE POLICY "staff_full_access_bonos"
ON public.bonos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_staff = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_staff = true
  )
);

-- Policy 2: Pacientes solo ven sus propios bonos
CREATE POLICY "paciente_read_own_bonos"
ON public.bonos
FOR SELECT
TO authenticated
USING (paciente_id = auth.uid());

COMMIT;

-- Verificar el resultado final (debe haber solo 2 políticas por tabla)
SELECT 
  tablename,
  policyname,
  cmd as operacion,
  CASE 
    WHEN qual LIKE '%is_staff%' THEN 'Staff (Full Access)'
    WHEN qual LIKE '%paciente_id = auth.uid%' THEN 'Paciente (Read Only)'
    ELSE 'Otra'
  END as quien_aplica
FROM pg_policies
WHERE tablename IN ('sesiones', 'bonos')
ORDER BY tablename, policyname;
