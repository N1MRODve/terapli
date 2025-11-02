-- SCRIPT CORREGIDO: Sintaxis perfecta para Auth RLS InitPlan Fix
-- PASO 1: Tabla PROFILES

-- 1. elevated_roles_select_all
DROP POLICY IF EXISTS "elevated_roles_select_all" ON public.profiles;
CREATE POLICY "elevated_roles_select_all" ON public.profiles
FOR SELECT TO authenticated
USING (
  (select auth.uid()) IN (
    SELECT id FROM public.profiles 
    WHERE rol IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 2. select_own_profile  
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles
FOR SELECT TO authenticated
USING (id = (select auth.uid()));

-- 3. update_own_profile
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles
FOR UPDATE TO authenticated
USING (id = (select auth.uid()));