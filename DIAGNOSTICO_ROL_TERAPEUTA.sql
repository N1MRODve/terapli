-- ============================================================================
-- DIAGNÓSTICO COMPLETO: BUG DE ROL TERAPEUTA → PACIENTE
-- ============================================================================
-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR
-- Este script identifica POR QUÉ un terapeuta ve "Paciente" en el header
-- ============================================================================

-- 1. VERIFICAR USUARIO ESPECÍFICO (reemplaza con tu email de terapeuta)
-- ============================================================================
\set TERAPEUTA_EMAIL 'tu_email_terapeuta@ejemplo.com'

SELECT '═══════════════════════════════════════════════════════════' as separador;
SELECT '1. VERIFICANDO DATOS DEL USUARIO TERAPEUTA' as paso;
SELECT '═══════════════════════════════════════════════════════════' as separador;

SELECT
    u.id as user_id,
    u.email as auth_email,
    u.email_confirmed_at,
    u.last_sign_in_at,
    p.id as profile_id,
    p.email as profile_email,
    p.nombre,
    p.rol as rol_actual,
    p.created_at as profile_created_at,
    p.updated_at as profile_updated_at,
    CASE
        WHEN p.id IS NULL THEN '❌ CRÍTICO: NO HAY PERFIL - Usuario sin registro en profiles'
        WHEN p.rol IS NULL THEN '❌ CRÍTICO: PERFIL SIN ROL - Debe asignarse'
        WHEN p.rol = 'paciente' THEN '⚠️ ERROR: ROL ES PACIENTE (debería ser psicologa/terapeuta)'
        WHEN p.rol = 'psicologa' THEN '✅ CORRECTO: Rol es psicologa'
        WHEN p.rol = 'terapeuta' THEN '⚠️ ADVERTENCIA: Rol "terapeuta" no existe en enum (debe ser "psicologa")'
        ELSE '✓ Rol: ' || p.rol
    END as diagnostico
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = :'TERAPEUTA_EMAIL'
OR p.email = :'TERAPEUTA_EMAIL';

-- 2. VERIFICAR SI EL USUARIO ESTÁ EN LA TABLA TERAPEUTAS
-- ============================================================================
SELECT '═══════════════════════════════════════════════════════════' as separador;
SELECT '2. VERIFICANDO TABLA TERAPEUTAS' as paso;
SELECT '═══════════════════════════════════════════════════════════' as separador;

SELECT
    t.id,
    t.nombre_completo,
    t.email,
    t.activo,
    t.created_at,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = t.id
            AND p.rol = 'psicologa'
        ) THEN '✅ Perfil con rol correcto (psicologa)'
        WHEN EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = t.id
            AND p.rol = 'paciente'
        ) THEN '❌ PROBLEMA: Perfil con rol PACIENTE (debería ser psicologa)'
        WHEN EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = t.id
        ) THEN '⚠️ Perfil con rol: ' || (SELECT rol FROM profiles WHERE id = t.id)
        ELSE '❌ SIN PERFIL en tabla profiles'
    END as estado_perfil
FROM public.terapeutas t
WHERE t.email = :'TERAPEUTA_EMAIL';

-- 3. BUSCAR INCONSISTENCIAS: Usuario en TERAPEUTAS pero rol=PACIENTE
-- ============================================================================
SELECT '═══════════════════════════════════════════════════════════' as separador;
SELECT '3. BUSCANDO INCONSISTENCIAS CRÍTICAS' as paso;
SELECT '═══════════════════════════════════════════════════════════' as separador;

SELECT
    t.id,
    t.email as email_terapeuta,
    t.nombre_completo,
    p.rol as rol_en_profiles,
    '❌ INCONSISTENCIA DETECTADA: Usuario está en tabla terapeutas pero su rol es ' || p.rol as problema,
    'UPDATE public.profiles SET rol = ''psicologa'' WHERE id = ''' || t.id || ''';' as solucion_sql
FROM public.terapeutas t
INNER JOIN public.profiles p ON t.id = p.id
WHERE p.rol != 'psicologa'
AND t.email = :'TERAPEUTA_EMAIL';

-- 4. VERIFICAR ENUM USER_ROLE
-- ============================================================================
SELECT '═══════════════════════════════════════════════════════════' as separador;
SELECT '4. VERIFICANDO VALORES VÁLIDOS DEL ENUM user_role' as paso;
SELECT '═══════════════════════════════════════════════════════════' as separador;

SELECT
    enumlabel as valor_valido,
    enumsortorder as orden
FROM pg_enum
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'user_role'
)
ORDER BY enumsortorder;

-- 5. VERIFICAR METADATA EN AUTH.USERS
-- ============================================================================
SELECT '═══════════════════════════════════════════════════════════' as separador;
SELECT '5. VERIFICANDO METADATA EN auth.users' as paso;
SELECT '═══════════════════════════════════════════════════════════' as separador;

SELECT
    email,
    raw_user_meta_data,
    raw_user_meta_data->>'rol' as rol_en_metadata,
    raw_user_meta_data->>'nombre' as nombre_en_metadata,
    CASE
        WHEN raw_user_meta_data->>'rol' IS NULL THEN '⚠️ Sin rol en metadata (puede ser normal)'
        WHEN raw_user_meta_data->>'rol' != (SELECT rol::text FROM profiles WHERE profiles.id = users.id)
            THEN '❌ INCONSISTENCIA: Metadata rol (' || raw_user_meta_data->>'rol' || ') != profiles rol (' || (SELECT rol::text FROM profiles WHERE profiles.id = users.id) || ')'
        ELSE '✓ Metadata consistente con profiles'
    END as diagnostico_metadata
FROM auth.users
WHERE email = :'TERAPEUTA_EMAIL';

-- 6. BUSCAR TODOS LOS USUARIOS CON DOBLE ROL (en terapeutas Y pacientes)
-- ============================================================================
SELECT '═══════════════════════════════════════════════════════════' as separador;
SELECT '6. BUSCANDO USUARIOS CON MÚLTIPLES ROLES (CONFLICTO)' as paso;
SELECT '═══════════════════════════════════════════════════════════' as separador;

SELECT
    p.id,
    p.email,
    p.nombre,
    p.rol as rol_profiles,
    CASE WHEN EXISTS (SELECT 1 FROM terapeutas WHERE id = p.id) THEN '✓' ELSE '✗' END as en_terapeutas,
    CASE WHEN EXISTS (SELECT 1 FROM pacientes WHERE id = p.id) THEN '✓' ELSE '✗' END as en_pacientes,
    CASE
        WHEN EXISTS (SELECT 1 FROM terapeutas WHERE id = p.id)
         AND EXISTS (SELECT 1 FROM pacientes WHERE id = p.id)
         AND p.rol = 'paciente'
        THEN '❌ CONFLICTO: Usuario en ambas tablas con rol=paciente'
        WHEN EXISTS (SELECT 1 FROM terapeutas WHERE id = p.id)
         AND p.rol != 'psicologa'
        THEN '❌ ERROR: En terapeutas pero rol != psicologa'
        ELSE '✓ OK'
    END as diagnostico
FROM public.profiles p
WHERE p.email = :'TERAPEUTA_EMAIL';

-- ============================================================================
-- 7. SCRIPT DE CORRECCIÓN AUTOMÁTICA
-- ============================================================================
SELECT '═══════════════════════════════════════════════════════════' as separador;
SELECT '7. SCRIPT DE CORRECCIÓN (SOLO SI DETECTA PROBLEMAS)' as paso;
SELECT '═══════════════════════════════════════════════════════════' as separador;

-- ⚠️ EJECUTAR SOLO SI LOS DIAGNÓSTICOS ANTERIORES MUESTRAN ERRORES

/*
-- OPCIÓN A: Si el usuario está en terapeutas pero profiles.rol = 'paciente'
-- Ejecuta esto para corregir:

UPDATE public.profiles
SET
    rol = 'psicologa',
    updated_at = NOW()
WHERE email = :'TERAPEUTA_EMAIL'
AND EXISTS (
    SELECT 1 FROM public.terapeutas t WHERE t.id = profiles.id
);

-- Verificar que se actualizó:
SELECT id, email, nombre, rol, updated_at
FROM public.profiles
WHERE email = :'TERAPEUTA_EMAIL';
*/

/*
-- OPCIÓN B: Si el usuario NO tiene perfil en profiles
-- Ejecuta esto (ajusta los valores):

INSERT INTO public.profiles (id, email, nombre, rol)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'nombre', 'Terapeuta'),
    'psicologa'::user_role
FROM auth.users u
WHERE u.email = :'TERAPEUTA_EMAIL'
AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO UPDATE
SET
    rol = 'psicologa',
    updated_at = NOW();
*/

-- ============================================================================
-- INSTRUCCIONES DE USO
-- ============================================================================
--
-- 1. Reemplaza :'TERAPEUTA_EMAIL' con tu email real en la línea 8
--    Ejemplo: 'karem@psicologakarem.com'
--
-- 2. Ejecuta el script completo
--
-- 3. Lee los resultados de cada sección:
--
--    SECCIÓN 1: Muestra el estado actual del usuario
--               Si dice "❌ CRÍTICO" o "⚠️ ERROR" → hay problema
--
--    SECCIÓN 3: Si muestra filas → HAY INCONSISTENCIA
--               Ejecuta el SQL que aparece en la columna "solucion_sql"
--
--    SECCIÓN 6: Si muestra "❌ CONFLICTO" → Usuario tiene múltiples roles
--               Debes decidir cuál es el rol principal
--
-- 4. Si detecta problemas, descomenta y ejecuta OPCIÓN A u OPCIÓN B
--    según corresponda
--
-- 5. Después de corregir, ejecuta de nuevo el script para verificar
--
-- ============================================================================
