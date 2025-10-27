-- ============================================================================
-- SCRIPT DE VERIFICACIÓN: Sincronización Profiles y Pacientes
-- ============================================================================
-- VERSIÓN: psql (PostgreSQL Terminal Client)
-- Ejecutar después de aplicar la migración 20251027_fix_crear_paciente_profile.sql
--
-- USO:
-- psql "postgresql://user:pass@host:port/database" -f verificar_profiles_pacientes_psql.sql
--
-- O desde psql interactivo:
-- \i verificar_profiles_pacientes_psql.sql
-- ============================================================================

-- 1. Verificar que las funciones existen
-- ============================================================================
\echo '🔍 1. VERIFICANDO FUNCIONES RPC...'

SELECT 
  routine_name as funcion,
  routine_type as tipo,
  security_type as seguridad,
  data_type as retorna
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%crear_paciente%'
ORDER BY routine_name;

-- Debería mostrar:
-- crear_paciente_con_profile | FUNCTION | DEFINER | jsonb
-- crear_paciente_simple       | FUNCTION | DEFINER | jsonb

-- 2. Verificar estructura de la tabla profiles
-- ============================================================================
\echo ''
\echo '🔍 2. VERIFICANDO TABLA PROFILES...'

SELECT 
  column_name as columna,
  data_type as tipo,
  is_nullable as nullable,
  column_default as default_value
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Verificar estructura de la tabla pacientes
-- ============================================================================
\echo ''
\echo '🔍 3. VERIFICANDO TABLA PACIENTES...'

SELECT 
  column_name as columna,
  data_type as tipo,
  is_nullable as nullable,
  column_default as default_value
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'pacientes'
AND column_name IN ('id', 'profile_id', 'email', 'nombre_completo', 'psicologa_id', 'tipo_bono')
ORDER BY ordinal_position;

-- 4. Verificar foreign keys
-- ============================================================================
\echo ''
\echo '🔍 4. VERIFICANDO FOREIGN KEYS...'

SELECT 
  tc.constraint_name as nombre_constraint,
  tc.table_name as tabla_origen,
  kcu.column_name as columna_origen,
  ccu.table_name as tabla_referencia,
  ccu.column_name as columna_referencia
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'pacientes'
AND kcu.column_name IN ('profile_id', 'psicologa_id');

-- Debería mostrar:
-- pacientes_profile_id_fkey | pacientes | profile_id | profiles | id
-- pacientes_psicologa_id_fkey | pacientes | psicologa_id | psicologas | id

-- 5. Verificar índices
-- ============================================================================
\echo ''
\echo '🔍 5. VERIFICANDO ÍNDICES...'

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'pacientes')
AND (
  indexname LIKE '%profile%'
  OR indexname LIKE '%email%'
)
ORDER BY tablename, indexname;

-- 6. Verificar políticas RLS
-- ============================================================================
\echo ''
\echo '🔍 6. VERIFICANDO POLÍTICAS RLS...'

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as comando,
  qual as condicion
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'pacientes')
ORDER BY tablename, policyname;

-- 7. Estadísticas de datos actuales
-- ============================================================================
\echo ''
\echo '📊 7. ESTADÍSTICAS DE DATOS...'

-- Profiles totales
SELECT 
  'Profiles Totales' as metrica,
  COUNT(*) as cantidad
FROM profiles;

-- Profiles por rol
SELECT 
  'Profiles por Rol' as metrica,
  rol,
  COUNT(*) as cantidad
FROM profiles
GROUP BY rol
ORDER BY COUNT(*) DESC;

-- Pacientes totales
SELECT 
  'Pacientes Totales' as metrica,
  COUNT(*) as cantidad
FROM pacientes;

-- Pacientes con profile_id
SELECT 
  'Pacientes con Profile ID' as metrica,
  COUNT(*) as cantidad
FROM pacientes
WHERE profile_id IS NOT NULL;

-- Pacientes SIN profile_id (PROBLEMA)
SELECT 
  'Pacientes SIN Profile ID (⚠️ PROBLEMA)' as metrica,
  COUNT(*) as cantidad
FROM pacientes
WHERE profile_id IS NULL;

-- 8. Verificar sincronización profiles <-> pacientes
-- ============================================================================
\echo ''
\echo '🔗 8. VERIFICANDO SINCRONIZACIÓN...'

-- Pacientes que tienen profile sincronizado
SELECT 
  'Pacientes con Profile Sincronizado' as estado,
  COUNT(*) as cantidad
FROM pacientes pac
INNER JOIN profiles prof ON pac.profile_id = prof.id
WHERE pac.email = prof.email;

-- Pacientes con profile_id pero email no coincide (PROBLEMA)
SELECT 
  'Pacientes con Email Desincronizado (⚠️)' as estado,
  COUNT(*) as cantidad
FROM pacientes pac
INNER JOIN profiles prof ON pac.profile_id = prof.id
WHERE pac.email != prof.email OR pac.email IS NULL OR prof.email IS NULL;

-- 9. Listar pacientes problemáticos (si existen)
-- ============================================================================
\echo ''
\echo '⚠️ 9. PACIENTES CON PROBLEMAS...'

-- Pacientes sin profile_id
SELECT 
  'SIN PROFILE_ID' as problema,
  id,
  email,
  nombre_completo,
  created_at
FROM pacientes
WHERE profile_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- Pacientes con email desincronizado
SELECT 
  'EMAIL DESINCRONIZADO' as problema,
  pac.id as paciente_id,
  pac.email as paciente_email,
  prof.email as profile_email,
  pac.nombre_completo
FROM pacientes pac
INNER JOIN profiles prof ON pac.profile_id = prof.id
WHERE pac.email != prof.email
LIMIT 10;

-- 10. Verificar permisos de las funciones
-- ============================================================================
\echo ''
\echo '🔐 10. VERIFICANDO PERMISOS...'

SELECT 
  r.routine_name as funcion,
  r.security_type,
  p.grantee as usuario,
  p.privilege_type as permiso
FROM information_schema.routines r
LEFT JOIN information_schema.routine_privileges p 
  ON r.routine_name = p.routine_name
WHERE r.routine_schema = 'public'
AND r.routine_name LIKE '%crear_paciente%'
ORDER BY r.routine_name, p.grantee;

-- ============================================================================
-- RESUMEN DE VERIFICACIÓN
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo '✅ VERIFICACIÓN COMPLETADA'
\echo '============================================================================'
\echo ''
\echo 'Revisa los resultados anteriores:'
\echo ''
\echo '1. Las funciones crear_paciente_simple y crear_paciente_con_profile deben existir'
\echo '2. La tabla profiles debe tener columnas: id, email, nombre, telefono, rol'
\echo '3. La tabla pacientes debe tener columna profile_id con foreign key a profiles'
\echo '4. Los índices deben incluir idx_profiles_email y idx_pacientes_profile_id'
\echo '5. Deben existir políticas RLS para profiles y pacientes'
\echo '6. El número de pacientes SIN profile_id debe ser 0 (o corregirlos)'
\echo '7. El número de emails desincronizados debe ser 0'
\echo ''
\echo 'Si encuentras problemas, consulta FIX_PROFILE_SINCRONIZACION.md'
\echo '============================================================================'

-- ============================================================================
-- MIGRACIÓN DE PACIENTES EXISTENTES (Solo si hay pacientes sin profile_id)
-- ============================================================================
-- ⚠️ EJECUTAR SOLO SI LA VERIFICACIÓN #7 MOSTRÓ PACIENTES SIN PROFILE_ID

/*
\echo ''
\echo '🔧 MIGRANDO PACIENTES EXISTENTES...'

-- Paso 1: Crear profiles para pacientes sin profile_id
INSERT INTO profiles (id, email, nombre, telefono, rol, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.email,
  p.nombre_completo,
  p.telefono,
  'paciente',
  p.created_at,
  p.updated_at
FROM pacientes p
WHERE p.profile_id IS NULL
AND p.email IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM profiles pr WHERE pr.email = p.email
)
ON CONFLICT (email) DO NOTHING;

-- Paso 2: Actualizar profile_id en pacientes
UPDATE pacientes pac
SET profile_id = prof.id
FROM profiles prof
WHERE pac.email = prof.email
AND pac.profile_id IS NULL;

-- Paso 3: Verificar resultado
SELECT 
  COUNT(*) as total_pacientes,
  COUNT(profile_id) as con_profile,
  COUNT(*) - COUNT(profile_id) as sin_profile
FROM pacientes;

\echo '✅ Migración de pacientes completada'
*/
