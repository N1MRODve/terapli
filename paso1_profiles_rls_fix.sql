-- SCRIPT PASO 1: Corregir políticas RLS de la tabla PROFILES
-- Ejecutar primero este script pequeño para validar el funcionamiento

-- ============================================
-- TABLA: profiles (PASO 1)
-- ============================================

-- 1. elevated_roles_select_all
DROP POLICY IF EXISTS "elevated_roles_select_all" ON public.profiles;
CREATE POLICY "elevated_roles_select_all" ON public.profiles
FOR SELECT TO authenticated
USING (
  (select auth.uid()) IN (
    SELECT user_id FROM public.profiles 
    WHERE role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 2. select_own_profile  
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles
FOR SELECT TO authenticated
USING (user_id = (select auth.uid()));

-- 3. update_own_profile
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles
FOR UPDATE TO authenticated
USING (user_id = (select auth.uid()));

-- Verificar que las políticas se crearon correctamente
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
WHERE schemaname = 'public' 
AND tablename = 'profiles'
ORDER BY policyname;