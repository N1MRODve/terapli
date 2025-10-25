-- ============================================================================
-- FIX DEFINITIVO: Eliminar TODA política con subquery a profiles
-- ============================================================================
-- El problema persiste porque CUALQUIER subquery a profiles causa recursión
-- incluso con is_staff. La solución es NO usar subqueries en políticas RLS.
-- ============================================================================

-- PASO 1: Eliminar TODAS las políticas (incluyendo las recursivas)
-- ============================================================================
DROP POLICY IF EXISTS "enable_read_all_for_staff" ON public.profiles;
DROP POLICY IF EXISTS "access_all_temporal_profiles" ON public.profiles;
DROP POLICY IF EXISTS "disable_delete_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Los perfiles se crean automáticamente" ON public.profiles;
DROP POLICY IF EXISTS "enable_insert_for_service_role" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_self_or_staff" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;

-- ============================================================================
-- RESULTADO FINAL: Solo 2 políticas simples SIN recursión
-- ============================================================================

-- Primero eliminar si existen
DROP POLICY IF EXISTS "enable_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "enable_update_own_profile" ON public.profiles;

-- ✅ Política 1: Cada usuario ve su propio perfil
-- No tiene subquery, usa auth.uid() directamente
CREATE POLICY "enable_read_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ✅ Política 2: Cada usuario actualiza su propio perfil
-- No tiene subquery, usa auth.uid() directamente
CREATE POLICY "enable_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ RECURSIÓN ELIMINADA - SOLUCIÓN DEFINITIVA';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Políticas activas:';
    RAISE NOTICE '  1. enable_read_own_profile - Usuario ve su perfil';
    RAISE NOTICE '  2. enable_update_own_profile - Usuario actualiza su perfil';
    RAISE NOTICE '';
    RAISE NOTICE '❌ Política eliminada:';
    RAISE NOTICE '  - enable_read_all_for_staff (causaba recursión)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE:';
    RAISE NOTICE '  - Ahora los usuarios SOLO ven su propio perfil';
    RAISE NOTICE '  - Si staff necesita ver otros perfiles, usa SERVICE_ROLE_KEY';
    RAISE NOTICE '  - O implementa una tabla separada staff_access';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Siguiente paso:';
    RAISE NOTICE '  1. Vuelve a la app y recarga (Cmd+Shift+R)';
    RAISE NOTICE '  2. Intenta login nuevamente';
    RAISE NOTICE '  3. ✅ NO debe haber error de recursión';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- Ver políticas finales
SELECT 
    policyname,
    cmd as operacion,
    qual as condicion_using,
    with_check as condicion_with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;
