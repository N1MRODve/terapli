-- ============================================================================
-- FIX: Error de constraint en tabla terapeutas
-- ============================================================================
-- PROBLEMA: El trigger sync_terapeuta_from_profile() intenta INSERT
-- pero ya existe un registro con ese email, causando error de duplicate key
-- ============================================================================

-- Paso 1: Verificar el estado actual del terapeuta
-- Reemplaza 'karemeyde@gmail.com' con el email del terapeuta
SELECT
    'Estado en tabla terapeutas' as info,
    t.id,
    t.email,
    t.nombre_completo,
    t.activo,
    t.created_at,
    p.rol as rol_en_profiles,
    CASE
        WHEN t.id = p.id THEN '✅ IDs coinciden'
        WHEN t.id IS NULL THEN '❌ No existe en terapeutas'
        ELSE '⚠️ IDs diferentes (PROBLEMA)'
    END as diagnostico
FROM public.terapeutas t
FULL OUTER JOIN public.profiles p ON t.email = 'karemeyde@gmail.com' AND p.email = 'karemeyde@gmail.com'
WHERE t.email = 'karemeyde@gmail.com' OR p.email = 'karemeyde@gmail.com';

-- ============================================================================
-- Paso 2: Ver el trigger problemático
-- ============================================================================
SELECT
    'Trigger actual' as info,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%terapeuta%'
AND event_object_table = 'profiles';

-- ============================================================================
-- Paso 3: SOLUCIÓN - Eliminar registro duplicado o desincronizado
-- ============================================================================

-- OPCIÓN A: Si el ID en terapeutas NO coincide con el ID en profiles
-- (significa que hay un registro viejo/corrupto)

-- Ver si hay desincronización de IDs
SELECT
    'Verificando sincronización' as paso,
    t.id as terapeuta_id,
    p.id as profile_id,
    t.email,
    CASE
        WHEN t.id = p.id THEN '✅ Sincronizado'
        ELSE '❌ DESINCRONIZADO - Eliminar registro en terapeutas y dejar que trigger lo recree'
    END as estado
FROM public.terapeutas t
JOIN public.profiles p ON t.email = p.email
WHERE t.email = 'karemeyde@gmail.com';

-- Si están DESINCRONIZADOS (IDs diferentes), ejecutar:
/*
DELETE FROM public.terapeutas
WHERE email = 'karemeyde@gmail.com'
AND id != (SELECT id FROM public.profiles WHERE email = 'karemeyde@gmail.com');
*/

-- ============================================================================
-- Paso 4: Actualizar el rol en profiles
-- ============================================================================

-- Ahora SÍ podemos actualizar el rol sin errores
UPDATE public.profiles
SET
    rol = 'psicologa',
    updated_at = NOW()
WHERE email = 'karemeyde@gmail.com';

-- ============================================================================
-- Paso 5: Verificar que todo está correcto
-- ============================================================================

-- Verificar profiles
SELECT
    '✅ Estado final en PROFILES' as tabla,
    id,
    email,
    nombre,
    rol,
    updated_at
FROM public.profiles
WHERE email = 'karemeyde@gmail.com';

-- Verificar terapeutas
SELECT
    '✅ Estado final en TERAPEUTAS' as tabla,
    id,
    email,
    nombre_completo,
    activo,
    created_at,
    updated_at
FROM public.terapeutas
WHERE email = 'karemeyde@gmail.com';

-- Verificar sincronización
SELECT
    '✅ Verificación de sincronización' as check,
    CASE
        WHEN t.id = p.id AND p.rol = 'psicologa' AND t.activo = true
        THEN '✅ TODO CORRECTO - Usuario sincronizado'
        ELSE '❌ Aún hay problemas'
    END as resultado,
    p.id as profile_id,
    t.id as terapeuta_id,
    p.rol,
    t.activo
FROM public.profiles p
JOIN public.terapeutas t ON t.email = p.email
WHERE p.email = 'karemeyde@gmail.com';

-- ============================================================================
-- ALTERNATIVA: Si quieres FORZAR la actualización sin eliminar
-- ============================================================================

/*
-- Esta opción actualiza el registro existente en terapeutas para que coincida
-- con el ID del profile (sincronización forzada)

-- ADVERTENCIA: Solo usar si estás SEGURO de que el profile es el correcto

-- 1. Desactivar temporalmente el trigger
ALTER TABLE public.profiles DISABLE TRIGGER sync_profile_to_terapeuta;

-- 2. Actualizar el rol en profiles
UPDATE public.profiles
SET
    rol = 'psicologa',
    updated_at = NOW()
WHERE email = 'karemeyde@gmail.com';

-- 3. Actualizar manualmente la tabla terapeutas para sincronizar IDs
UPDATE public.terapeutas
SET
    id = (SELECT id FROM public.profiles WHERE email = 'karemeyde@gmail.com'),
    nombre_completo = (SELECT COALESCE(nombre, split_part(email, '@', 1)) FROM public.profiles WHERE email = 'karemeyde@gmail.com'),
    activo = true,
    updated_at = NOW()
WHERE email = 'karemeyde@gmail.com';

-- 4. Reactivar el trigger
ALTER TABLE public.profiles ENABLE TRIGGER sync_profile_to_terapeuta;

-- 5. Verificar
SELECT
    p.id as profile_id,
    t.id as terapeuta_id,
    p.email,
    p.rol,
    t.activo,
    CASE WHEN p.id = t.id THEN '✅ IDs sincronizados' ELSE '❌ Aún desincronizados' END as estado
FROM public.profiles p
JOIN public.terapeutas t ON t.email = p.email
WHERE p.email = 'karemeyde@gmail.com';
*/

-- ============================================================================
-- INSTRUCCIONES DE USO
-- ============================================================================
--
-- 1. Ejecuta primero los SELECT de verificación (Paso 1)
--
-- 2. Si los IDs están DESINCRONIZADOS:
--    - Descomenta el DELETE del Paso 3
--    - Ejecuta el DELETE
--    - Luego ejecuta el UPDATE del Paso 4
--
-- 3. Si los IDs están SINCRONIZADOS pero sigue fallando:
--    - Usa la ALTERNATIVA al final del script
--    - Desactiva el trigger, actualiza, reactiva
--
-- 4. Ejecuta las verificaciones del Paso 5
--
-- 5. Pide al usuario que:
--    - Cierre sesión (logout)
--    - Limpie caché del navegador (Cmd+Shift+R)
--    - Vuelva a hacer login
--
-- ============================================================================
