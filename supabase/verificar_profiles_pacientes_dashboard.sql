-- ============================================================================
-- SCRIPT DE VERIFICACIÓN: Sincronización Profiles y Pacientes
-- ============================================================================
-- VERSIÓN: Supabase Dashboard SQL Editor (SIN comandos \echo)
-- Ejecutar después de aplicar la migración 20251027_fix_crear_paciente_profile.sql
-- 
-- INSTRUCCIONES:
-- 1. Copiar TODO este archivo
-- 2. Pegar en Supabase Dashboard → SQL Editor
-- 3. Click "Run"
-- 4. Revisar resultados de cada query
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR FUNCIONES RPC
-- ============================================================================
-- Debería mostrar 2 funciones: crear_paciente_simple y crear_paciente_con_profile

SELECT 
  routine_name as funcion,
  routine_type as tipo,
  security_type as seguridad,
  data_type as retorna
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%crear_paciente%'
ORDER BY routine_name;


-- ============================================================================
-- 2. VERIFICAR ESTRUCTURA DE TABLA PROFILES
-- ============================================================================
-- Debe incluir: id, email, nombre, telefono, rol

SELECT 
  column_name as columna,
  data_type as tipo,
  is_nullable as nullable,
  column_default as default_value
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;


-- ============================================================================
-- 3. VERIFICAR ESTRUCTURA DE TABLA PACIENTES
-- ============================================================================
-- Debe incluir: profile_id con foreign key a profiles

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


-- ============================================================================
-- 4. VERIFICAR FOREIGN KEYS
-- ============================================================================
-- Debe mostrar: pacientes_profile_id_fkey y pacientes_psicologa_id_fkey

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


-- ============================================================================
-- 5. VERIFICAR ÍNDICES
-- ============================================================================
-- Debe incluir índices de profile_id y email

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


-- ============================================================================
-- 6. VERIFICAR POLÍTICAS RLS
-- ============================================================================
-- Debe mostrar políticas para ambas tablas

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as comando
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'pacientes')
ORDER BY tablename, policyname;


-- ============================================================================
-- 7. ESTADÍSTICAS - PROFILES TOTALES
-- ============================================================================

SELECT 
  'Profiles Totales' as metrica,
  COUNT(*) as cantidad
FROM profiles;


-- ============================================================================
-- 8. ESTADÍSTICAS - PROFILES POR ROL
-- ============================================================================

SELECT 
  'Profiles por Rol' as categoria,
  rol,
  COUNT(*) as cantidad
FROM profiles
GROUP BY rol
ORDER BY COUNT(*) DESC;


-- ============================================================================
-- 9. ESTADÍSTICAS - PACIENTES TOTALES
-- ============================================================================

SELECT 
  'Pacientes Totales' as metrica,
  COUNT(*) as cantidad
FROM pacientes;


-- ============================================================================
-- 10. ESTADÍSTICAS - PACIENTES CON PROFILE_ID
-- ============================================================================
-- Este número debe ser igual al total de pacientes

SELECT 
  'Pacientes con Profile ID' as metrica,
  COUNT(*) as cantidad
FROM pacientes
WHERE profile_id IS NOT NULL;


-- ============================================================================
-- 11. ⚠️ PROBLEMA: PACIENTES SIN PROFILE_ID
-- ============================================================================
-- ⚠️ CRÍTICO: Este número DEBE SER 0
-- Si es mayor a 0, ejecutar la migración al final de este script

SELECT 
  'Pacientes SIN Profile ID (⚠️ PROBLEMA)' as metrica,
  COUNT(*) as cantidad,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '❌ CORREGIR'
  END as estado
FROM pacientes
WHERE profile_id IS NULL;


-- ============================================================================
-- 12. VERIFICAR SINCRONIZACIÓN - EMAILS COINCIDEN
-- ============================================================================
-- Los emails de pacientes y profiles deben coincidir

SELECT 
  'Pacientes con Profile Sincronizado' as estado,
  COUNT(*) as cantidad
FROM pacientes pac
INNER JOIN profiles prof ON pac.profile_id = prof.id
WHERE pac.email = prof.email;


-- ============================================================================
-- 13. ⚠️ PROBLEMA: EMAILS DESINCRONIZADOS
-- ============================================================================
-- ⚠️ Este número DEBE SER 0

SELECT 
  'Pacientes con Email Desincronizado (⚠️)' as estado,
  COUNT(*) as cantidad,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '❌ CORREGIR'
  END as resultado
FROM pacientes pac
INNER JOIN profiles prof ON pac.profile_id = prof.id
WHERE pac.email != prof.email OR pac.email IS NULL OR prof.email IS NULL;


-- ============================================================================
-- 14. LISTAR PACIENTES SIN PROFILE_ID (si existen)
-- ============================================================================
-- Si esta query devuelve resultados, ejecutar migración al final

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


-- ============================================================================
-- 15. LISTAR PACIENTES CON EMAIL DESINCRONIZADO (si existen)
-- ============================================================================

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


-- ============================================================================
-- 16. VERIFICAR PERMISOS DE FUNCIONES RPC
-- ============================================================================
-- Debe mostrar permisos EXECUTE para authenticated

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
-- ✅ FIN DE VERIFICACIÓN
-- ============================================================================
-- 
-- CHECKLIST DE RESULTADOS:
-- 
-- ✅ Query 1:  2 funciones (crear_paciente_simple, crear_paciente_con_profile)
-- ✅ Query 2:  Columnas de profiles incluyen id, email, nombre, rol
-- ✅ Query 3:  Columna profile_id existe en pacientes
-- ✅ Query 4:  2 foreign keys (profile_id → profiles, psicologa_id → psicologas)
-- ✅ Query 5:  Índices incluyen idx_profiles_email, idx_pacientes_profile_id
-- ✅ Query 6:  Políticas RLS configuradas
-- ✅ Query 11: Pacientes SIN profile_id = 0 (CRÍTICO)
-- ✅ Query 13: Emails desincronizados = 0 (CRÍTICO)
-- ✅ Query 16: Permisos incluyen 'authenticated' con EXECUTE
-- 
-- Si las queries 11 o 13 muestran problemas, ejecutar migración abajo ⬇️
-- ============================================================================


-- ============================================================================
-- MIGRACIÓN: CORREGIR PACIENTES SIN PROFILE_ID
-- ============================================================================
-- ⚠️ EJECUTAR SOLO SI LA QUERY 11 MOSTRÓ PACIENTES SIN PROFILE_ID
-- 
-- INSTRUCCIONES:
-- 1. Copiar SOLO esta sección (desde aquí hasta el final)
-- 2. Pegar en una nueva query en SQL Editor
-- 3. Ejecutar
-- 4. Volver a ejecutar las verificaciones anteriores
-- ============================================================================

/*

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

-- Paso 3: Verificar resultado (debe mostrar sin_profile = 0)
SELECT 
  COUNT(*) as total_pacientes,
  COUNT(profile_id) as con_profile,
  COUNT(*) - COUNT(profile_id) as sin_profile
FROM pacientes;

*/
