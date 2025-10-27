-- ============================================================================
-- LIMPIEZA: Eliminar Políticas RLS Duplicadas en Profiles
-- ============================================================================
-- Fecha: 27 de octubre de 2025
-- Propósito: Limpiar políticas antiguas que quedaron duplicadas

-- ============================================================================
-- ELIMINAR POLÍTICAS ANTIGUAS/DUPLICADAS
-- ============================================================================

-- Eliminar políticas antiguas que quedaron después de la migración anterior
DROP POLICY IF EXISTS "enable_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "enable_update_own_profile" ON public.profiles;

-- ============================================================================
-- VERIFICAR RESULTADO
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'profiles';
  
  RAISE NOTICE '✅ Total de políticas en profiles después de limpieza: %', policy_count;
  
  IF policy_count = 5 THEN
    RAISE NOTICE '✅ Limpieza exitosa - 5 políticas correctas';
  ELSE
    RAISE WARNING '⚠️ Se esperaban 5 políticas, hay %', policy_count;
  END IF;
END $$;

-- ============================================================================
-- LISTAR POLÍTICAS FINALES
-- ============================================================================

SELECT 
  policyname,
  roles,
  cmd as comando,
  CASE 
    WHEN policyname = 'users_select_own_profile' THEN '✅ Usuario lee su perfil (FIX login)'
    WHEN policyname = 'users_update_own_profile' THEN '✅ Usuario actualiza su perfil'
    WHEN policyname = 'system_insert_profiles' THEN '✅ Sistema crea profiles (RPC)'
    WHEN policyname = 'psicologas_select_pacientes_profiles' THEN '✅ Psicólogas ven pacientes'
    WHEN policyname = 'service_role_select_all_profiles' THEN '✅ Admin acceso completo'
    ELSE '⚠️ Política desconocida'
  END as descripcion
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'profiles'
ORDER BY policyname;
