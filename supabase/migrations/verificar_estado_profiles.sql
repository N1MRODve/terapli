-- ============================================================================
-- SCRIPT DE VERIFICACIÓN RÁPIDA
-- ============================================================================
-- Ejecutar en SQL Editor de Supabase para diagnosticar el problema
-- ============================================================================

-- 1. VERIFICAR SI EXISTE LA TABLA PROFILES
-- ============================================================================
SELECT 
    EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    ) as tabla_profiles_existe;

-- 2. VERIFICAR SI EXISTE EL TIPO user_role
-- ============================================================================
SELECT 
    EXISTS (
        SELECT FROM pg_type 
        WHERE typname = 'user_role'
    ) as tipo_user_role_existe;

-- 3. VER ESTRUCTURA DE LA TABLA PROFILES (si existe)
-- ============================================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. VERIFICAR SI RLS ESTÁ HABILITADO
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'profiles';

-- 5. VER TODAS LAS POLÍTICAS RLS
-- ============================================================================
SELECT 
    policyname as politica,
    cmd as operacion,
    permissive as permisivo,
    roles,
    CASE 
        WHEN cmd = 'SELECT' THEN 'Lectura'
        WHEN cmd = 'UPDATE' THEN 'Actualización'
        WHEN cmd = 'INSERT' THEN 'Inserción'
        WHEN cmd = 'DELETE' THEN 'Eliminación'
    END as tipo_operacion
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 6. CONTAR USUARIOS EN auth.users
-- ============================================================================
SELECT COUNT(*) as total_usuarios_auth
FROM auth.users;

-- 7. CONTAR PERFILES EN profiles
-- ============================================================================
SELECT COUNT(*) as total_perfiles
FROM public.profiles;

-- 8. VER USUARIOS SIN PERFIL
-- ============================================================================
SELECT 
    u.id,
    u.email,
    u.created_at,
    '❌ SIN PERFIL' as estado
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 9. VER TODOS LOS PERFILES EXISTENTES
-- ============================================================================
SELECT 
    p.id,
    p.email,
    p.nombre,
    p.rol,
    p.created_at,
    '✓ CON PERFIL' as estado
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 10;

-- 10. BUSCAR EL USUARIO ESPECÍFICO (karemeyde@gmail.com)
-- ============================================================================
SELECT 
    'En auth.users' as ubicacion,
    u.id::text,
    u.email,
    u.created_at::text as created_at,
    u.email_confirmed_at::text as dato_1,
    u.last_sign_in_at::text as dato_2
FROM auth.users u
WHERE u.email = 'karemeyde@gmail.com'

UNION ALL

SELECT 
    'En profiles' as ubicacion,
    p.id::text,
    p.email,
    p.created_at::text,
    p.rol::text as dato_1,
    p.nombre as dato_2
FROM public.profiles p
WHERE p.email = 'karemeyde@gmail.com';

-- 11. VERIFICAR TRIGGERS
-- ============================================================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
OR trigger_name = 'update_profiles_updated_at';

-- 12. VERIFICAR FUNCIONES
-- ============================================================================
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (
    routine_name = 'handle_new_user'
    OR routine_name = 'get_user_role'
    OR routine_name = 'has_role'
)
ORDER BY routine_name;

-- ============================================================================
-- RESUMEN DE QUÉ REVISAR
-- ============================================================================
/*

CHECKLIST DE VERIFICACIÓN:

✓ tabla_profiles_existe = true
✓ tipo_user_role_existe = true
✓ rls_habilitado = true
✓ Debe haber al menos 3-5 políticas RLS
✓ total_usuarios_auth = total_perfiles (deben coincidir)
✓ Usuario karemeyde@gmail.com debe aparecer en AMBAS tablas
✓ Triggers on_auth_user_created y update_profiles_updated_at deben existir
✓ Funciones handle_new_user, get_user_role, has_role deben existir

SI ALGO FALLA:
1. Ejecutar: supabase/migrations/20251025_fix_profiles_rls.sql
2. Verificar nuevamente con este script

*/
