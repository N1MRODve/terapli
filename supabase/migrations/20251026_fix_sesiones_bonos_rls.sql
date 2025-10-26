-- Fix: RLS policies para sesiones y bonos
-- Fecha: 2025-10-26
-- Problema: Queries devuelven 406 Not Acceptable por RLS

BEGIN;

-- ============================================================================
-- SESIONES: Políticas RLS
-- ============================================================================

-- Limpiar policies existentes
DROP POLICY IF EXISTS "staff_can_read_all_sesiones" ON public.sesiones;
DROP POLICY IF EXISTS "staff_can_insert_sesiones" ON public.sesiones;
DROP POLICY IF EXISTS "staff_can_update_sesiones" ON public.sesiones;
DROP POLICY IF EXISTS "staff_can_delete_sesiones" ON public.sesiones;

-- Staff puede leer todas las sesiones
CREATE POLICY "staff_can_read_all_sesiones"
ON public.sesiones
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_staff = true
  )
);

-- Staff puede insertar sesiones
CREATE POLICY "staff_can_insert_sesiones"
ON public.sesiones
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_staff = true
  )
);

-- Staff puede actualizar sesiones
CREATE POLICY "staff_can_update_sesiones"
ON public.sesiones
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_staff = true
  )
);

-- ============================================================================
-- BONOS: Políticas RLS
-- ============================================================================

-- Limpiar policies existentes
DROP POLICY IF EXISTS "staff_can_read_all_bonos" ON public.bonos;
DROP POLICY IF EXISTS "staff_can_insert_bonos" ON public.bonos;
DROP POLICY IF EXISTS "staff_can_update_bonos" ON public.bonos;
DROP POLICY IF EXISTS "staff_can_delete_bonos" ON public.bonos;

-- Staff puede leer todos los bonos
CREATE POLICY "staff_can_read_all_bonos"
ON public.bonos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_staff = true
  )
);

-- Staff puede insertar bonos
CREATE POLICY "staff_can_insert_bonos"
ON public.bonos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_staff = true
  )
);

-- Staff puede actualizar bonos
CREATE POLICY "staff_can_update_bonos"
ON public.bonos
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_staff = true
  )
);

COMMIT;

-- Verificar políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('sesiones', 'bonos')
ORDER BY tablename, policyname;
