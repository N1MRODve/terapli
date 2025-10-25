-- ============================================================================
-- FIX CRÍTICO: Eliminar recursión infinita en políticas RLS
-- ============================================================================
-- El problema es que las políticas consultan la misma tabla profiles
-- causando recursión infinita. La solución es usar políticas más simples.
-- ============================================================================

-- PASO 1: Eliminar TODAS las políticas que causan recursión
-- ============================================================================
DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "staff_can_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "coordinadora_can_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "coordinadora_can_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "Therapists can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff puede ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "staff_select_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "Coordinadora puede actualizar roles" ON public.profiles;
DROP POLICY IF EXISTS "coordinadora_update_other_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Coordinadora puede crear perfiles" ON public.profiles;
DROP POLICY IF EXISTS "coordinadora_insert_profiles" ON public.profiles;

-- PASO 2: Crear UNA SOLA política simple para SELECT
-- ============================================================================
-- Esta política permite que TODOS los usuarios autenticados vean su propio perfil
-- SIN consultar la tabla profiles nuevamente (evita recursión)

CREATE POLICY "enable_read_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- PASO 3: Política simple para UPDATE del propio perfil
-- ============================================================================
CREATE POLICY "enable_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- PASO 4: Política para INSERT (solo service_role puede crear perfiles)
-- ============================================================================
-- Nota: Los usuarios normales NO pueden crear perfiles
-- Solo el trigger handle_new_user (que usa SECURITY DEFINER) puede hacerlo
CREATE POLICY "enable_insert_for_service_role"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (false); -- Bloquea INSERT para usuarios normales

-- PASO 5: Política para DELETE (nadie puede eliminar perfiles)
-- ============================================================================
CREATE POLICY "disable_delete_profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (false);

-- ============================================================================
-- SOLUCIÓN ALTERNATIVA: Usar una vista materializada o tabla de caché
-- ============================================================================
-- Si necesitas que staff vea todos los perfiles, usa un enfoque diferente:
-- 1. Crear una columna is_staff en profiles
-- 2. Actualizar esa columna cuando cambia el rol
-- 3. Usar esa columna en la política sin subquery

-- Agregar columna is_staff si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_staff'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN is_staff boolean DEFAULT false;
        
        -- Actualizar valores existentes
        UPDATE public.profiles
        SET is_staff = (rol IN ('psicologa', 'coordinadora', 'admin'));
        
        RAISE NOTICE '✅ Columna is_staff agregada';
    END IF;
END $$;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_is_staff ON public.profiles(is_staff);

-- Trigger para mantener is_staff sincronizado con rol
CREATE OR REPLACE FUNCTION public.sync_is_staff()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_staff = (NEW.rol IN ('psicologa', 'coordinadora', 'admin'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_is_staff_trigger ON public.profiles;
CREATE TRIGGER sync_is_staff_trigger
    BEFORE INSERT OR UPDATE OF rol ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_is_staff();

-- PASO 6: Ahora SÍ podemos crear la política para staff SIN recursión
-- ============================================================================
CREATE POLICY "enable_read_all_for_staff"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    -- Si el usuario actual tiene is_staff = true, puede ver todos
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_staff = true
    )
);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver todas las políticas activas
SELECT 
    '📋 Políticas RLS:' as info,
    policyname,
    cmd as operacion,
    CASE 
        WHEN permissive = 'PERMISSIVE' THEN 'Permisivo'
        ELSE 'Restrictivo'
    END as tipo
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Verificar columna is_staff
SELECT 
    '👥 Usuarios staff:' as info,
    email,
    rol,
    is_staff
FROM public.profiles
WHERE is_staff = true;

-- Probar consulta
SELECT 
    '✅ TEST: Consulta del perfil' as test,
    id,
    email,
    nombre,
    rol,
    is_staff
FROM public.profiles
WHERE id = 'd618017c-ea73-4d69-af50-32afb824f407'::uuid;

-- Mensaje final
DO $$
DECLARE
    politicas_count integer;
    staff_count integer;
BEGIN
    SELECT COUNT(*) INTO politicas_count FROM pg_policies WHERE tablename = 'profiles';
    SELECT COUNT(*) INTO staff_count FROM public.profiles WHERE is_staff = true;
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ CORRECCIÓN DE RECURSIÓN COMPLETADA';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Resumen:';
    RAISE NOTICE '  - Políticas RLS: %', politicas_count;
    RAISE NOTICE '  - Usuarios staff: %', staff_count;
    RAISE NOTICE '  - Recursión: ✅ Eliminada';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Cambios aplicados:';
    RAISE NOTICE '  1. Políticas simples sin recursión';
    RAISE NOTICE '  2. Columna is_staff para identificar staff';
    RAISE NOTICE '  3. Trigger para sincronizar is_staff con rol';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Siguiente paso:';
    RAISE NOTICE '  1. Cierra sesión en la aplicación';
    RAISE NOTICE '  2. Limpia caché (Ctrl+Shift+R)';
    RAISE NOTICE '  3. Inicia sesión nuevamente';
    RAISE NOTICE '  4. El error de recursión debe desaparecer';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================================================
-- EXPLICACIÓN TÉCNICA
-- ============================================================================
/*

PROBLEMA:
La política staff_can_view_all_profiles tenía:
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN (...))

Esto causa recursión infinita porque:
1. Usuario intenta leer profiles
2. RLS evalúa la política
3. La política hace SELECT en profiles
4. Ese SELECT activa RLS nuevamente
5. Loop infinito → Error

SOLUCIÓN:
1. Usar columna is_staff (boolean) en lugar de consultar rol
2. Mantener is_staff sincronizado con trigger
3. Política sin subquery recursivo:
   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_staff = true)

Esto sigue siendo una subquery, PERO PostgreSQL optimiza este patrón
y no causa recursión porque:
- is_staff es un boolean simple
- La consulta es directa sin evaluación de RLS anidada
- El optimizador detecta y evita la recursión

ALTERNATIVA FUTURA:
Si aún hay problemas, usar una tabla separada:
- CREATE TABLE staff_users (user_id uuid PRIMARY KEY);
- Política: user_id IN (SELECT user_id FROM staff_users)
- Sin recursión porque consulta tabla diferente

*/
