-- ============================================================================
-- SCRIPT DE DIAGNÓSTICO DE LOGIN
-- ============================================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- Esto te ayudará a identificar el problema con el login
-- ============================================================================

-- 1. VERIFICAR CONFIGURACIÓN DE LA TABLA PROFILES
-- ============================================================================
SELECT
    'INFO: Verificando estructura de la tabla profiles' as paso;

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. VERIFICAR RLS (Row Level Security)
-- ============================================================================
SELECT
    'INFO: Verificando si RLS está habilitado' as paso;

SELECT
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'profiles';

-- 3. VER TODAS LAS POLÍTICAS RLS DE PROFILES
-- ============================================================================
SELECT
    'INFO: Listando todas las políticas RLS de profiles' as paso;

SELECT
    policyname as nombre_politica,
    permissive as tipo,
    roles,
    cmd as operacion,
    qual as condicion_using,
    with_check as condicion_with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 4. LISTAR TODOS LOS USUARIOS EN AUTH.USERS
-- ============================================================================
SELECT
    'INFO: Listando todos los usuarios en auth.users' as paso;

SELECT
    id,
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at,
    CASE
        WHEN email_confirmed_at IS NULL THEN '❌ Email NO confirmado'
        ELSE '✅ Email confirmado'
    END as estado_email
FROM auth.users
ORDER BY created_at DESC;

-- 5. VERIFICAR RELACIÓN AUTH.USERS <-> PUBLIC.PROFILES
-- ============================================================================
SELECT
    'INFO: Verificando correspondencia entre auth.users y profiles' as paso;

SELECT
    u.id,
    u.email as email_auth,
    u.email_confirmed_at,
    p.id as profile_id,
    p.email as email_profile,
    p.nombre,
    p.rol,
    CASE
        WHEN p.id IS NULL THEN '❌ SIN PERFIL - ESTE ES EL PROBLEMA'
        WHEN p.rol IS NULL THEN '⚠️ PERFIL SIN ROL'
        ELSE '✅ OK'
    END as estado
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 6. CONTAR USUARIOS POR ROL
-- ============================================================================
SELECT
    'INFO: Contando usuarios por rol' as paso;

SELECT
    COALESCE(rol::text, '❌ SIN ROL') as rol,
    COUNT(*) as cantidad
FROM public.profiles
GROUP BY rol
ORDER BY cantidad DESC;

-- 7. VERIFICAR SI HAY USUARIOS SIN PERFIL
-- ============================================================================
SELECT
    'CRÍTICO: Usuarios en auth.users SIN perfil en profiles' as paso;

SELECT
    u.id,
    u.email,
    u.created_at,
    '❌ Este usuario NO tiene perfil. Debe crearse manualmente.' as problema
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- 8. VERIFICAR TRIGGER DE CREACIÓN AUTOMÁTICA
-- ============================================================================
SELECT
    'INFO: Verificando trigger handle_new_user' as paso;

SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%auth_user%' OR trigger_name LIKE '%new_user%';

-- ============================================================================
-- INSTRUCCIONES BASADAS EN RESULTADOS
-- ============================================================================
--
-- SI VES "❌ SIN PERFIL" en la sección 5:
--    Tu usuario NO tiene un registro en la tabla profiles.
--    Ejecuta el script de SOLUCIÓN al final de este archivo.
--
-- SI VES "⚠️ PERFIL SIN ROL":
--    Tu usuario tiene perfil pero no tiene rol asignado.
--    Ejecuta: UPDATE public.profiles SET rol = 'psicologa' WHERE email = 'TU_EMAIL';
--
-- SI VES "❌ Email NO confirmado":
--    Tu email no está confirmado. Ve a Authentication > Users en Supabase
--    y haz clic en "..." > "Send email confirmation"
--
-- ============================================================================
-- SCRIPT DE SOLUCIÓN: CREAR PERFIL MANUALMENTE
-- ============================================================================
-- Si tu usuario NO tiene perfil, descomenta y ejecuta esto (reemplaza los valores):

/*
INSERT INTO public.profiles (id, email, nombre, rol)
VALUES (
    'TU_USER_ID_AQUI'::uuid,  -- Reemplaza con el ID de auth.users (paso 4)
    'tu_email@ejemplo.com',     -- Tu email
    'Tu Nombre',                 -- Tu nombre
    'psicologa'::user_role      -- El rol que necesitas: 'psicologa', 'coordinadora', 'paciente', 'admin'
)
ON CONFLICT (id) DO UPDATE
SET
    email = EXCLUDED.email,
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    updated_at = NOW();
*/

-- EJEMPLO CONCRETO (ajusta según tus datos):
/*
INSERT INTO public.profiles (id, email, nombre, rol)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    'karem@psicologakarem.com',
    'Karem Peña',
    'psicologa'::user_role
)
ON CONFLICT (id) DO UPDATE
SET
    email = EXCLUDED.email,
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    updated_at = NOW();
*/

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================
-- Después de ejecutar el INSERT, verifica que el perfil se creó correctamente:

SELECT
    'VERIFICACIÓN FINAL: Tu perfil' as paso;

SELECT
    p.id,
    p.email,
    p.nombre,
    p.rol,
    p.created_at,
    u.last_sign_in_at,
    CASE
        WHEN p.rol IN ('psicologa', 'coordinadora', 'admin') THEN '✅ Tienes acceso al sistema'
        WHEN p.rol = 'paciente' THEN '⚠️ Solo tienes acceso como paciente'
        ELSE '❌ Rol inválido'
    END as estado_acceso
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email = 'TU_EMAIL_AQUI'  -- Reemplaza con tu email
ORDER BY p.created_at DESC;
