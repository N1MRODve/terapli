-- ============================================================================
-- LIMPIEZA FINAL: Eliminar Política Peligrosa
-- ============================================================================
-- Fecha: 27 de octubre de 2025
-- Propósito: Eliminar política antigua "Admin puede ver todos los perfiles"
--            que tiene rol PUBLIC (inseguro)

-- ============================================================================
-- ELIMINAR POLÍTICA PELIGROSA
-- ============================================================================

-- Esta política permite a CUALQUIERA (public) ver todos los perfiles
-- Es un riesgo de seguridad y debe eliminarse
DROP POLICY IF EXISTS "Admin puede ver todos los perfiles" ON public.profiles;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
  public_policies INTEGER;
BEGIN
  -- Contar todas las políticas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'profiles';
  
  -- Contar políticas inseguras con rol PUBLIC
  SELECT COUNT(*) INTO public_policies
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND 'public' = ANY(roles);
  
  RAISE NOTICE '✅ Total de políticas en profiles: %', policy_count;
  
  IF public_policies > 0 THEN
    RAISE WARNING '⚠️ Aún hay % políticas con rol PUBLIC (INSEGURO)', public_policies;
  ELSE
    RAISE NOTICE '✅ No hay políticas inseguras con rol PUBLIC';
  END IF;
  
  IF policy_count = 5 THEN
    RAISE NOTICE '✅ Configuración perfecta - 5 políticas correctas';
  ELSE
    RAISE WARNING '⚠️ Se esperaban 5 políticas, hay %', policy_count;
  END IF;
END $$;

-- ============================================================================
-- LISTADO FINAL DE POLÍTICAS
-- ============================================================================

SELECT 
  policyname,
  roles,
  cmd as comando,
  CASE 
    WHEN 'public' = ANY(roles) THEN '❌ INSEGURO - Rol PUBLIC'
    WHEN policyname = 'select_own_profile' THEN '✅ Usuario ve su perfil'
    WHEN policyname = 'update_own_profile' THEN '✅ Usuario edita su perfil'
    WHEN policyname = 'insert_new_profiles' THEN '✅ Sistema crea profiles'
    WHEN policyname = 'elevated_roles_select_all' THEN '✅ Roles elevados ven todos'
    WHEN policyname = 'service_role_all_access' THEN '✅ Service role completo'
    ELSE '⚠️ Desconocida'
  END as estado,
  CASE 
    WHEN 'public' = ANY(roles) THEN '🔴 CRÍTICO'
    WHEN roles = '{authenticated}' THEN '🟢 Seguro'
    WHEN roles = '{service_role}' THEN '🟢 Seguro'
    ELSE '🟡 Revisar'
  END as seguridad
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'profiles'
ORDER BY 
  CASE WHEN 'public' = ANY(roles) THEN 0 ELSE 1 END,
  policyname;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- 
-- Después de esta limpieza, deberías tener EXACTAMENTE 5 políticas:
-- 
-- 1. select_own_profile          | {authenticated} | SELECT | ✅ Seguro
-- 2. update_own_profile          | {authenticated} | UPDATE | ✅ Seguro
-- 3. insert_new_profiles         | {authenticated} | INSERT | ✅ Seguro
-- 4. elevated_roles_select_all   | {authenticated} | SELECT | ✅ Seguro
-- 5. service_role_all_access     | {service_role}  | ALL    | ✅ Seguro
-- 
-- NINGUNA política debe tener rol 'public'
-- ============================================================================
