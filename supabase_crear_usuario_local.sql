-- ============================================
-- CREAR USUARIO DE COORDINACIÓN - DESARROLLO LOCAL
-- Usuario de prueba para trabajar en localhost
-- ============================================

-- IMPORTANTE: Este script crea un usuario completo en tu base de datos LOCAL
-- NO requiere acceso al Dashboard de Supabase
-- Ejecuta este script DESPUÉS de supabase_coordinacion_setup.sql

-- ============================================
-- PASO 1: Habilitar extensión necesaria
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- PASO 2: Crear usuario en auth.users
-- ============================================

-- Insertar usuario de coordinación en la tabla de autenticación
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'coordinacion@local.test',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"rol":"coordinacion","nombre":"Coordinación Test"}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO UPDATE
SET 
  encrypted_password = crypt('Admin123!', gen_salt('bf')),
  email_confirmed_at = NOW(),
  raw_user_meta_data = '{"rol":"coordinacion","nombre":"Coordinación Test"}'::jsonb,
  updated_at = NOW();

-- ============================================
-- PASO 3: Crear o actualizar perfil en profiles
-- ============================================

-- Insertar en profiles (vinculado con auth.users)
INSERT INTO profiles (
  id,
  email,
  nombre,
  rol,
  created_at
)
SELECT 
  id,
  email,
  'Coordinación Test',
  'coordinacion',
  NOW()
FROM auth.users
WHERE email = 'coordinacion@local.test'
ON CONFLICT (id) DO UPDATE
SET 
  nombre = 'Coordinación Test',
  rol = 'coordinacion',
  email = 'coordinacion@local.test';

-- ============================================
-- PASO 4: Verificar creación
-- ============================================

-- Ver el usuario creado en auth.users
SELECT 
  id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmado,
  raw_user_meta_data->>'rol' as rol_metadata,
  created_at
FROM auth.users
WHERE email = 'coordinacion@local.test';

-- Ver el perfil en profiles
SELECT 
  id,
  email,
  nombre,
  rol,
  created_at
FROM profiles
WHERE email = 'coordinacion@local.test';

-- ============================================
-- CREDENCIALES DE ACCESO
-- ============================================

SELECT 
  '✅ Usuario de coordinación creado exitosamente' as status,
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separador,
  '🌐 URL de acceso:' as "",
  'http://localhost:3000/coordinacion/login' as url,
  '' as " ",
  '📧 Credenciales:' as "",
  'Email:    coordinacion@local.test' as email,
  'Password: Admin123!' as password,
  '' as "  ",
  '🚀 Pasos siguientes:' as "",
  '1. Ejecuta: npm run dev' as paso_1,
  '2. Abre: http://localhost:3000/coordinacion/login' as paso_2,
  '3. Ingresa las credenciales de arriba' as paso_3,
  '4. ¡Listo! Deberías ver el dashboard' as paso_4;

-- ============================================
-- BONUS: Crear datos de prueba (OPCIONAL)
-- ============================================

-- Descomenta las siguientes líneas si quieres datos de prueba

/*
-- Crear paciente de prueba
INSERT INTO profiles (id, email, nombre, rol, telefono)
VALUES (
  gen_random_uuid(),
  'paciente.prueba@local.test',
  'María García',
  'paciente',
  '+34612345678'
)
ON CONFLICT DO NOTHING;

-- Crear terapeuta de prueba
INSERT INTO profiles (id, email, nombre, rol)
VALUES (
  gen_random_uuid(),
  'terapeuta.prueba@local.test',
  'Dra. Karem Peña',
  'terapeuta'
)
ON CONFLICT DO NOTHING;

-- Crear sesión de prueba para hoy
INSERT INTO sesiones (
  terapeuta_id,
  paciente_id,
  fecha,
  modalidad,
  estado,
  notas
)
SELECT 
  (SELECT id FROM profiles WHERE rol = 'terapeuta' LIMIT 1),
  (SELECT id FROM profiles WHERE rol = 'paciente' LIMIT 1),
  NOW() + INTERVAL '2 hours',
  'presencial',
  'confirmada',
  'Sesión de prueba para testing local'
WHERE EXISTS (SELECT 1 FROM profiles WHERE rol = 'terapeuta')
  AND EXISTS (SELECT 1 FROM profiles WHERE rol = 'paciente');

-- Crear pago de prueba
INSERT INTO pagos (
  sesion_id,
  paciente_id,
  terapeuta_id,
  monto,
  estado,
  metodo_pago
)
SELECT 
  s.id,
  s.paciente_id,
  s.terapeuta_id,
  50.00,
  'pendiente',
  'transferencia'
FROM sesiones s
WHERE s.notas = 'Sesión de prueba para testing local'
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- RESUMEN FINAL
-- ============================================

\echo ''
\echo '✅ USUARIO CREADO EXITOSAMENTE'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''
\echo '🔑 CREDENCIALES DE ACCESO:'
\echo '   Email:    coordinacion@local.test'
\echo '   Password: Admin123!'
\echo ''
\echo '🌐 URL:'
\echo '   http://localhost:3000/coordinacion/login'
\echo ''
\echo '📝 PASOS SIGUIENTES:'
\echo '   1. Ejecuta: npm run dev'
\echo '   2. Abre el navegador en la URL de arriba'
\echo '   3. Ingresa las credenciales'
\echo '   4. ¡Empieza a trabajar!'
\echo ''
