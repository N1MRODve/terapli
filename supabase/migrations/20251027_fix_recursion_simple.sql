-- ============================================================================
-- FIX SIMPLE: Políticas RLS Sin Recursión (Versión Minimalista)
-- ============================================================================
-- Esta versión es más simple y garantizada funcionar
-- Solo permite a cada usuario ver/editar su propio perfil
-- Service role tiene acceso completo para operaciones admin
-- ============================================================================

-- LIMPIAR TODO
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "insert_new_profiles" ON public.profiles;
DROP POLICY IF EXISTS "elevated_roles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "service_role_all_access" ON public.profiles;
DROP POLICY IF EXISTS "Psicólogas pueden ver profiles de sus pacientes" ON public.profiles;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "system_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "psicologas_select_pacientes_profiles" ON public.profiles;
DROP POLICY IF EXISTS "service_role_select_all_profiles" ON public.profiles;

-- POLÍTICAS SIMPLES SIN RECURSIÓN

-- 1. Usuario ve su propio perfil
CREATE POLICY "simple_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 2. Usuario actualiza su propio perfil
CREATE POLICY "simple_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 3. Sistema puede crear profiles
CREATE POLICY "simple_insert"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Service role acceso total (para admin backend)
CREATE POLICY "simple_service_role"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verificar
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
