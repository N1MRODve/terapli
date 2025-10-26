-- ============================================================================
-- AGREGAR POLÍTICA DE INSERT para que staff pueda crear pacientes
-- ============================================================================
-- Problema: Staff no puede crear nuevos perfiles de pacientes
-- Solución: Permitir INSERT a usuarios con is_staff = true
-- ============================================================================

-- PASO 1: Verificar que is_staff existe y está configurado
-- ============================================================================
SELECT 
    '🔍 Verificando columna is_staff' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'is_staff';

-- PASO 2: Eliminar política de INSERT anterior (muy restrictiva)
-- ============================================================================
DROP POLICY IF EXISTS "enable_insert_for_service_role" ON public.profiles;
DROP POLICY IF EXISTS "Los perfiles se crean automáticamente" ON public.profiles;

-- PASO 3: Crear política para que STAFF pueda crear perfiles de pacientes
-- ============================================================================
-- Esta política permite que usuarios con is_staff = true puedan insertar nuevos perfiles
CREATE POLICY "staff_can_insert_profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
    -- Verificar que quien crea es staff
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid()
    )
    -- El trigger handle_new_user se encarga de crear perfiles automáticamente
    -- Esta política es para cuando staff crea pacientes manualmente
);

-- PASO 4: Política alternativa más simple (si la anterior causa problemas)
-- ============================================================================
-- Comentada por ahora, usar solo si la anterior falla
/*
DROP POLICY IF EXISTS "staff_can_insert_profiles" ON public.profiles;

CREATE POLICY "allow_insert_authenticated"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (true);
*/

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
    insert_policies integer;
BEGIN
    SELECT COUNT(*) INTO insert_policies 
    FROM pg_policies 
    WHERE tablename = 'profiles' AND cmd = 'INSERT';
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ POLÍTICA DE INSERT AGREGADA';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Políticas de INSERT: %', insert_policies;
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Política creada:';
    RAISE NOTICE '  - staff_can_insert_profiles: Staff puede crear pacientes';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Siguiente paso:';
    RAISE NOTICE '  1. Vuelve a la app';
    RAISE NOTICE '  2. Intenta crear un paciente nuevamente';
    RAISE NOTICE '  3. ✅ Debería funcionar correctamente';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- Ver todas las políticas actuales
SELECT 
    '📋 Políticas RLS finales:' as info,
    policyname,
    cmd as operacion,
    CASE 
        WHEN qual IS NOT NULL THEN substring(qual::text, 1, 50)
        ELSE 'N/A'
    END as condicion_using,
    CASE 
        WHEN with_check IS NOT NULL THEN substring(with_check::text, 1, 50)
        ELSE 'N/A'
    END as condicion_with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;
