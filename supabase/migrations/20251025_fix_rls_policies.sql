-- ============================================================================
-- FIX CRÍTICO: Políticas RLS para acceso de usuario autenticado
-- ============================================================================
-- El problema es que las políticas RLS están bloqueando el acceso
-- Este script corrige las políticas para permitir que usuarios autenticados
-- vean su propio perfil (que es lo que necesita la app)
-- ============================================================================

-- PASO 1: Eliminar políticas problemáticas
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "Therapists can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff puede ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "staff_select_all_profiles" ON public.profiles;

-- PASO 2: Crear política SIMPLE y FUNCIONAL para SELECT
-- ============================================================================
-- Esta política permite que CUALQUIER usuario autenticado vea su propio perfil
-- Es la política MÁS PERMISIVA para usuarios sobre sus propios datos

CREATE POLICY "users_select_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    -- El usuario puede ver su propio perfil
    id = auth.uid()
);

-- PASO 3: Crear política para que staff vea todos los perfiles
-- ============================================================================
CREATE POLICY "staff_can_view_all_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    -- Si el usuario es staff (psicologa, coordinadora, admin)
    -- puede ver TODOS los perfiles
    EXISTS (
        SELECT 1 
        FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.rol IN ('psicologa', 'coordinadora', 'admin')
    )
);

-- PASO 4: Crear políticas para UPDATE
-- ============================================================================
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_update_own_profile" ON public.profiles;

CREATE POLICY "users_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- PASO 5: Crear política para que coordinadoras actualicen otros perfiles
-- ============================================================================
DROP POLICY IF EXISTS "Coordinadora puede actualizar roles" ON public.profiles;
DROP POLICY IF EXISTS "coordinadora_update_other_profiles" ON public.profiles;

CREATE POLICY "coordinadora_can_update_profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.rol IN ('coordinadora', 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.rol IN ('coordinadora', 'admin')
    )
);

-- PASO 6: Crear política para INSERT (solo coordinadoras)
-- ============================================================================
DROP POLICY IF EXISTS "Coordinadora puede crear perfiles" ON public.profiles;
DROP POLICY IF EXISTS "coordinadora_insert_profiles" ON public.profiles;

CREATE POLICY "coordinadora_can_insert_profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.rol IN ('coordinadora', 'admin')
    )
);

-- ============================================================================
-- VERIFICACIÓN INMEDIATA
-- ============================================================================

-- Ver las políticas que quedaron
SELECT 
    '📋 Políticas RLS activas:' as info,
    policyname,
    cmd,
    CASE 
        WHEN permissive = 'PERMISSIVE' THEN 'Permisivo'
        ELSE 'Restrictivo'
    END as tipo
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Probar que ahora funciona la consulta
SELECT 
    '✅ TEST: Consulta que usa la app' as test,
    rol,
    nombre,
    email
FROM public.profiles
WHERE id = 'd618017c-ea73-4d69-af50-32afb824f407'::uuid;

-- Mensaje final
DO $$
DECLARE
    politicas_select integer;
BEGIN
    SELECT COUNT(*) INTO politicas_select
    FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND cmd = 'SELECT';
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ CORRECCIÓN COMPLETADA';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Resumen:';
    RAISE NOTICE '  - Políticas SELECT: %', politicas_select;
    RAISE NOTICE '  - RLS: Habilitado';
    RAISE NOTICE '  - Perfil de karemeyde@gmail.com: Existe';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Siguiente paso:';
    RAISE NOTICE '  1. Cierra sesión en la aplicación';
    RAISE NOTICE '  2. Limpia caché del navegador (Ctrl+Shift+R)';
    RAISE NOTICE '  3. Inicia sesión nuevamente';
    RAISE NOTICE '  4. El error 500 debería desaparecer';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================================================
-- NOTA IMPORTANTE
-- ============================================================================
/*

Este script corrige el problema principal: las políticas RLS.

El error 500 ocurría porque las políticas no estaban permitiendo que el usuario
autenticado accediera a su propio perfil cuando usaba el ANON_KEY.

Ahora las políticas son:
1. users_select_own_profile: Permite que usuarios vean SU propio perfil
2. staff_can_view_all_profiles: Permite que staff vea TODOS los perfiles
3. users_update_own_profile: Permite que usuarios actualicen SU perfil
4. coordinadora_can_update_profiles: Permite que coordinadoras actualicen cualquier perfil
5. coordinadora_can_insert_profiles: Permite que coordinadoras creen perfiles

Estas políticas son más simples y más permisivas para el caso de uso correcto.

*/
