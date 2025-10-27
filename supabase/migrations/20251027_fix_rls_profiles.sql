-- ============================================================================
-- FIX: Políticas RLS para tabla Profiles
-- ============================================================================
-- Fecha: 27 de octubre de 2025
-- Problema: Error "No se pudo cargar el perfil después de todos los intentos"
-- Causa: Políticas RLS muy restrictivas que impiden leer el propio perfil

-- ============================================================================
-- 1. ELIMINAR POLÍTICAS EXISTENTES PROBLEMÁTICAS
-- ============================================================================

-- Eliminar todas las políticas existentes en profiles para empezar limpio
DROP POLICY IF EXISTS "Psicólogas pueden ver profiles de sus pacientes" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;

-- ============================================================================
-- 2. CREAR POLÍTICAS RLS CORRECTAS
-- ============================================================================

-- Política SELECT: Usuarios pueden ver su propio perfil
CREATE POLICY "users_select_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
);

-- Política UPDATE: Usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
)
WITH CHECK (
  id = auth.uid()
);

-- Política INSERT: Permitir crear profiles (para sistema de registro)
CREATE POLICY "system_insert_profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política SELECT: Psicólogas pueden ver profiles de sus pacientes
CREATE POLICY "psicologas_select_pacientes_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Si es su propio profile
  id = auth.uid()
  OR
  -- Si es un paciente de la psicóloga
  EXISTS (
    SELECT 1 FROM public.pacientes
    WHERE pacientes.profile_id = profiles.id
    AND pacientes.psicologa_id = auth.uid()
  )
  OR
  -- Si el usuario es staff (coordinadores, admin)
  EXISTS (
    SELECT 1 FROM public.profiles as p
    WHERE p.id = auth.uid()
    AND p.is_staff = true
  )
);

-- Política SELECT: Service role puede ver todos los profiles
CREATE POLICY "service_role_select_all_profiles"
ON public.profiles
FOR SELECT
TO service_role
USING (true);

-- ============================================================================
-- 3. ASEGURAR QUE RLS ESTÁ HABILITADO
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. VERIFICAR POLÍTICAS CREADAS
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'profiles';
  
  RAISE NOTICE '✅ Total de políticas en profiles: %', policy_count;
  
  IF policy_count < 4 THEN
    RAISE WARNING '⚠️ Se esperaban al menos 4 políticas, solo hay %', policy_count;
  ELSE
    RAISE NOTICE '✅ Políticas RLS configuradas correctamente';
  END IF;
END $$;

-- ============================================================================
-- 5. COMENTARIOS INFORMATIVOS
-- ============================================================================

COMMENT ON POLICY "users_select_own_profile" ON public.profiles IS
'Permite a cualquier usuario autenticado ver su propio perfil';

COMMENT ON POLICY "users_update_own_profile" ON public.profiles IS
'Permite a cualquier usuario autenticado actualizar su propio perfil';

COMMENT ON POLICY "system_insert_profiles" ON public.profiles IS
'Permite al sistema crear nuevos profiles durante registro';

COMMENT ON POLICY "psicologas_select_pacientes_profiles" ON public.profiles IS
'Permite a psicólogas ver profiles de sus pacientes y a staff ver todos';

COMMENT ON POLICY "service_role_select_all_profiles" ON public.profiles IS
'Permite al service role acceso completo para operaciones administrativas';

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as comando
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'profiles'
ORDER BY policyname;
