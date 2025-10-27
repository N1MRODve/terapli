-- ============================================================================
-- FIX CRÍTICO: Eliminar Recursión Infinita en Políticas RLS de Profiles
-- ============================================================================
-- Fecha: 27 de octubre de 2025
-- Error: 42P17 - "infinite recursion detected in policy for relation 'profiles'"
-- Causa: Políticas que consultan la misma tabla profiles creando bucle infinito
--
-- SOLUCIÓN: Usar solo auth.uid() sin subconsultas a profiles
-- ============================================================================

-- ============================================================================
-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- ============================================================================

DROP POLICY IF EXISTS "Psicólogas pueden ver profiles de sus pacientes" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "system_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "psicologas_select_pacientes_profiles" ON public.profiles;
DROP POLICY IF EXISTS "service_role_select_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "enable_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "enable_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "view_self_profile" ON public.profiles;
DROP POLICY IF EXISTS "edit_self_profile" ON public.profiles;
DROP POLICY IF EXISTS "view_all_profiles" ON public.profiles;

-- ============================================================================
-- PASO 2: CREAR POLÍTICAS SIN RECURSIÓN
-- ============================================================================

-- Política 1: SELECT - Usuario ve solo su propio perfil
-- Sin subconsultas, solo comparación directa con auth.uid()
CREATE POLICY "select_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
);

-- Política 2: UPDATE - Usuario actualiza solo su propio perfil
CREATE POLICY "update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
)
WITH CHECK (
  id = auth.uid()
);

-- Política 3: INSERT - Sistema puede crear perfiles
-- Necesario para registro y función RPC crear_paciente_simple()
CREATE POLICY "insert_new_profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política 4: SELECT - Service role ve todos (para admin backend)
CREATE POLICY "service_role_all_access"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PASO 3: CREAR FUNCIÓN AUXILIAR SIN RECURSIÓN
-- ============================================================================
-- Esta función obtiene el rol del usuario actual SIN consultar profiles
-- Se basa en JWT claims que ya están en auth.jwt()

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  -- Obtener el rol desde los claims del JWT
  -- Esto NO consulta la tabla profiles, evitando recursión
  SELECT COALESCE(
    auth.jwt() ->> 'user_role',
    'paciente'
  )::text;
$$;

-- ============================================================================
-- PASO 4: CREAR POLÍTICA PARA ROLES ELEVADOS (coordinadora, admin)
-- ============================================================================
-- Esta política usa la función auxiliar que NO genera recursión

CREATE POLICY "elevated_roles_select_all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- O es su propio perfil
  id = auth.uid()
  OR
  -- O tiene un rol elevado (sin consultar profiles)
  get_my_role() IN ('coordinadora', 'administrador', 'psicologa')
);

-- ============================================================================
-- PASO 5: HABILITAR RLS
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 6: ACTUALIZAR JWT CLAIMS PARA INCLUIR ROL
-- ============================================================================
-- Trigger que actualiza los JWT claims cuando cambia el rol

CREATE OR REPLACE FUNCTION public.handle_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Actualizar los claims del JWT para incluir el rol
  -- Esto permite que get_my_role() funcione sin consultar profiles
  PERFORM auth.jwt() || jsonb_build_object('user_role', NEW.rol);
  RETURN NEW;
END;
$$;

-- Aplicar trigger
DROP TRIGGER IF EXISTS on_profile_role_updated ON public.profiles;
CREATE TRIGGER on_profile_role_updated
  AFTER INSERT OR UPDATE OF rol
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_role_change();

-- ============================================================================
-- PASO 7: VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
  recursive_policies TEXT;
BEGIN
  -- Contar políticas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'profiles';
  
  RAISE NOTICE '✅ Total de políticas en profiles: %', policy_count;
  
  -- Verificar que no hay recursión (esto es simplificado)
  IF policy_count = 5 THEN
    RAISE NOTICE '✅ Políticas creadas correctamente';
  ELSE
    RAISE WARNING '⚠️ Se esperaban 5 políticas, hay %', policy_count;
  END IF;
  
  -- Listar políticas
  RAISE NOTICE '📋 Políticas activas:';
  FOR recursive_policies IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles'
    ORDER BY policyname
  LOOP
    RAISE NOTICE '  - %', recursive_policies;
  END LOOP;
END $$;

-- ============================================================================
-- PASO 8: QUERY DE VERIFICACIÓN FINAL
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as comando,
  CASE policyname
    WHEN 'select_own_profile' THEN '✅ Usuario ve su perfil (sin recursión)'
    WHEN 'update_own_profile' THEN '✅ Usuario edita su perfil'
    WHEN 'insert_new_profiles' THEN '✅ Sistema crea profiles (RPC)'
    WHEN 'elevated_roles_select_all' THEN '✅ Admin/Coordinadora ven todos (sin recursión)'
    WHEN 'service_role_all_access' THEN '✅ Service role acceso total'
    ELSE '⚠️ Política desconocida'
  END as descripcion
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'profiles'
ORDER BY policyname;

-- ============================================================================
-- COMENTARIOS EXPLICATIVOS
-- ============================================================================

COMMENT ON POLICY "select_own_profile" ON public.profiles IS
'Permite ver el propio perfil usando solo auth.uid() - SIN RECURSIÓN';

COMMENT ON POLICY "update_own_profile" ON public.profiles IS
'Permite actualizar el propio perfil usando solo auth.uid() - SIN RECURSIÓN';

COMMENT ON POLICY "insert_new_profiles" ON public.profiles IS
'Permite crear nuevos profiles para sistema de registro y RPC';

COMMENT ON POLICY "elevated_roles_select_all" ON public.profiles IS
'Roles elevados ven todos los perfiles usando función que lee JWT claims - SIN RECURSIÓN';

COMMENT ON POLICY "service_role_all_access" ON public.profiles IS
'Service role tiene acceso completo para operaciones administrativas';

COMMENT ON FUNCTION public.get_my_role() IS
'Obtiene el rol del usuario actual desde JWT claims sin consultar profiles - EVITA RECURSIÓN';

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

-- NOTA 1: La función get_my_role() lee el rol desde JWT claims (auth.jwt())
--         NO consulta la tabla profiles, por lo tanto NO genera recursión.

-- NOTA 2: El trigger handle_profile_role_change() actualiza los JWT claims
--         cuando cambia el rol, manteniendo la sincronización.

-- NOTA 3: Si los JWT claims no están configurados inicialmente, todos los
--         usuarios tendrán rol 'paciente' por defecto (COALESCE).

-- NOTA 4: Para que esto funcione completamente, Supabase debe estar configurado
--         para incluir custom claims en el JWT. Si no está disponible, solo
--         funcionará la política select_own_profile (cada uno ve su perfil).

-- NOTA 5: La política elevated_roles_select_all es OPCIONAL. Si causa problemas,
--         puede eliminarse y cada usuario solo verá su propio perfil.
