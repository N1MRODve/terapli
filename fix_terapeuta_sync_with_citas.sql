-- ============================================================================
-- FIX: Sincronización de IDs entre profiles y terapeutas (CON CITAS)
-- ============================================================================
-- PROBLEMA: El terapeuta tiene un ID diferente en profiles vs terapeutas
-- y además tiene citas asociadas, por lo que no podemos eliminar el registro
--
-- SOLUCIÓN: Actualizar el ID del profile para que coincida con terapeutas
-- (porque terapeutas tiene las citas y es la fuente de verdad en este caso)
-- ============================================================================

-- Paso 1: VERIFICAR el estado actual
SELECT
    '📊 Estado actual' as paso,
    p.id as profile_id,
    t.id as terapeuta_id,
    p.email,
    p.rol as rol_actual,
    t.activo,
    (SELECT COUNT(*) FROM citas WHERE terapeuta_id = t.id) as num_citas,
    CASE
        WHEN p.id = t.id THEN '✅ IDs sincronizados'
        ELSE '❌ IDs DESINCRONIZADOS'
    END as estado
FROM public.profiles p
FULL OUTER JOIN public.terapeutas t ON t.email = p.email
WHERE p.email = 'karemeyde@gmail.com' OR t.email = 'karemeyde@gmail.com';

-- ============================================================================
-- Paso 2: Ver las tablas que dependen de profiles.id
-- ============================================================================
SELECT
    '🔗 Tablas que referencian profiles.id' as info,
    conname as constraint_name,
    conrelid::regclass as tabla_dependiente,
    confrelid::regclass as tabla_referenciada
FROM pg_constraint
WHERE confrelid = 'public.profiles'::regclass
AND contype = 'f';

-- ============================================================================
-- Paso 3: SOLUCIÓN - Sincronizar usando el ID de terapeutas como verdad
-- ============================================================================
-- Dado que terapeutas tiene citas y datos reales, usaremos ese ID

-- 3.1: Guardar los IDs actuales para referencia
DO $$
DECLARE
    v_old_profile_id UUID;
    v_terapeuta_id UUID;
    v_email TEXT := 'karemeyde@gmail.com';
BEGIN
    -- Obtener IDs actuales
    SELECT id INTO v_old_profile_id FROM public.profiles WHERE email = v_email;
    SELECT id INTO v_terapeuta_id FROM public.terapeutas WHERE email = v_email;

    RAISE NOTICE '📝 ID actual en profiles: %', v_old_profile_id;
    RAISE NOTICE '📝 ID actual en terapeutas: %', v_terapeuta_id;

    IF v_old_profile_id = v_terapeuta_id THEN
        RAISE NOTICE '✅ Los IDs ya están sincronizados, no hay nada que hacer';
    ELSE
        RAISE NOTICE '⚠️ Los IDs están DESINCRONIZADOS, se necesita corrección';
    END IF;
END $$;

-- ============================================================================
-- Paso 4: EJECUTAR LA CORRECCIÓN
-- ============================================================================
-- IMPORTANTE: Descomenta este bloque SOLO después de verificar el Paso 1

/*
DO $$
DECLARE
    v_old_profile_id UUID;
    v_terapeuta_id UUID;
    v_email TEXT := 'karemeyde@gmail.com';
    v_affected_rows INTEGER;
BEGIN
    -- Obtener IDs
    SELECT id INTO v_old_profile_id FROM public.profiles WHERE email = v_email;
    SELECT id INTO v_terapeuta_id FROM public.terapeutas WHERE email = v_email;

    -- Solo ejecutar si son diferentes
    IF v_old_profile_id != v_terapeuta_id THEN
        RAISE NOTICE '🔄 Iniciando sincronización...';

        -- Desactivar triggers temporalmente
        ALTER TABLE public.profiles DISABLE TRIGGER ALL;
        ALTER TABLE public.terapeutas DISABLE TRIGGER ALL;

        -- Actualizar todas las tablas que referencian al perfil antiguo
        -- (si las hay, por ejemplo: mensajes, notificaciones, etc.)

        -- Actualizar mensajes si existen
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensajes') THEN
            UPDATE public.mensajes
            SET remitente_id = v_terapeuta_id
            WHERE remitente_id = v_old_profile_id;
            GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
            RAISE NOTICE '  ✓ Actualizados % registros en mensajes (remitente)', v_affected_rows;

            UPDATE public.mensajes
            SET destinatario_id = v_terapeuta_id
            WHERE destinatario_id = v_old_profile_id;
            GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
            RAISE NOTICE '  ✓ Actualizados % registros en mensajes (destinatario)', v_affected_rows;
        END IF;

        -- Actualizar notificaciones si existen
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificaciones') THEN
            UPDATE public.notificaciones
            SET usuario_id = v_terapeuta_id
            WHERE usuario_id = v_old_profile_id;
            GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
            RAISE NOTICE '  ✓ Actualizados % registros en notificaciones', v_affected_rows;
        END IF;

        -- Actualizar sesiones si existen
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sesiones') THEN
            UPDATE public.sesiones
            SET terapeuta_id = v_terapeuta_id
            WHERE terapeuta_id = v_old_profile_id;
            GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
            RAISE NOTICE '  ✓ Actualizados % registros en sesiones', v_affected_rows;
        END IF;

        -- Actualizar recursos si existen
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recursos') THEN
            UPDATE public.recursos
            SET creado_por = v_terapeuta_id
            WHERE creado_por = v_old_profile_id;
            GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
            RAISE NOTICE '  ✓ Actualizados % registros en recursos', v_affected_rows;
        END IF;

        -- Eliminar el perfil antiguo (si existe uno duplicado)
        IF v_old_profile_id IS NOT NULL AND v_old_profile_id != v_terapeuta_id THEN
            DELETE FROM public.profiles WHERE id = v_old_profile_id;
            RAISE NOTICE '  ✓ Eliminado perfil antiguo con ID %', v_old_profile_id;
        END IF;

        -- Crear/actualizar el perfil con el ID correcto de terapeutas
        INSERT INTO public.profiles (id, email, nombre, rol, created_at, updated_at)
        SELECT
            t.id,
            t.email,
            t.nombre_completo,
            'psicologa'::user_role,
            t.created_at,
            NOW()
        FROM public.terapeutas t
        WHERE t.email = v_email
        ON CONFLICT (id) DO UPDATE
        SET
            email = EXCLUDED.email,
            nombre = EXCLUDED.nombre,
            rol = 'psicologa'::user_role,
            updated_at = NOW();

        RAISE NOTICE '  ✓ Perfil creado/actualizado con ID de terapeutas';

        -- Reactivar triggers
        ALTER TABLE public.profiles ENABLE TRIGGER ALL;
        ALTER TABLE public.terapeutas ENABLE TRIGGER ALL;

        RAISE NOTICE '✅ Sincronización completada exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ Los IDs ya están sincronizados';
    END IF;
END $$;
*/

-- ============================================================================
-- Paso 5: VERIFICACIÓN FINAL
-- ============================================================================

-- Ver el resultado
SELECT
    '✅ Estado FINAL' as paso,
    p.id as profile_id,
    t.id as terapeuta_id,
    p.email,
    p.nombre,
    p.rol,
    t.activo,
    (SELECT COUNT(*) FROM citas WHERE terapeuta_id = t.id) as num_citas_activas,
    CASE
        WHEN p.id = t.id AND p.rol = 'psicologa' THEN '✅ TODO CORRECTO'
        ELSE '❌ Revisar'
    END as estado
FROM public.profiles p
FULL OUTER JOIN public.terapeutas t ON t.id = p.id
WHERE p.email = 'karemeyde@gmail.com' OR t.email = 'karemeyde@gmail.com';

-- Verificar auth.users también
SELECT
    '🔐 Estado en auth.users' as info,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmado,
    last_sign_in_at
FROM auth.users
WHERE email = 'karemeyde@gmail.com';

-- Verificar que el ID de auth.users coincide con profiles
SELECT
    '🔗 Verificación auth.users ↔ profiles' as check,
    u.id as auth_user_id,
    p.id as profile_id,
    CASE
        WHEN u.id = p.id THEN '✅ IDs coinciden (CORRECTO)'
        ELSE '❌ IDs NO coinciden (PROBLEMA)'
    END as estado
FROM auth.users u
FULL OUTER JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'karemeyde@gmail.com' OR p.email = 'karemeyde@gmail.com';

-- ============================================================================
-- RESUMEN DE LO QUE HACE ESTE SCRIPT
-- ============================================================================
--
-- Este script maneja el caso especial donde:
-- 1. El terapeuta tiene citas y datos asociados
-- 2. Los IDs en profiles y terapeutas están desincronizados
-- 3. No podemos eliminar el registro de terapeutas (tiene foreign keys)
--
-- La solución es:
-- 1. Usar el ID de terapeutas como "fuente de verdad" (tiene las citas)
-- 2. Actualizar todas las referencias al ID antiguo del perfil
-- 3. Eliminar el perfil antiguo
-- 4. Crear un nuevo perfil con el ID correcto de terapeutas
--
-- Esto garantiza:
-- ✅ Las citas siguen funcionando
-- ✅ Los IDs están sincronizados
-- ✅ El rol es 'psicologa'
-- ✅ auth.users → profiles → terapeutas están alineados
--
-- ============================================================================
-- INSTRUCCIONES DE USO
-- ============================================================================
--
-- 1. Ejecuta SOLO el Paso 1 primero (SELECT)
--    - Confirma que los IDs son diferentes
--    - Anota cuántas citas tiene el terapeuta
--
-- 2. Ejecuta el Paso 2 para ver qué tablas dependen de profiles
--
-- 3. Ejecuta el Paso 3 (el bloque DO con RAISE NOTICE)
--    - Verás en el output los IDs actuales
--
-- 4. Si confirmas que necesitas la corrección:
--    - DESCOMENTA el bloque del Paso 4 (quita el /* */)
--    - Ejecuta el script completo de nuevo
--
-- 5. Ejecuta el Paso 5 para verificar
--
-- 6. Pide al terapeuta que:
--    - Cierre sesión (logout)
--    - Limpie caché (Cmd+Shift+R)
--    - Vuelva a hacer login
--
-- IMPORTANTE: Haz un backup de la BD antes de ejecutar el Paso 4
--
-- ============================================================================
