-- ============================================
-- CREAR USUARIO DE COORDINACIÓN - DEMO
-- Psicóloga Karem - Acceso para Belmaris
-- ============================================

-- IMPORTANTE: Ejecuta este script DESPUÉS de crear el usuario en Supabase Auth

-- ============================================
-- OPCIÓN 1: Si ya creaste el usuario en Supabase Auth
-- ============================================

-- Actualizar el rol del usuario existente
-- Reemplaza el email si usaste otro
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{rol}',
  '"coordinacion"'
)
WHERE email = 'coordinacion@psicologakarem.com';

-- Actualizar en tabla profiles
UPDATE profiles 
SET 
  rol = 'coordinacion',
  nombre = 'Coordinación Clínica'
WHERE email = 'coordinacion@psicologakarem.com';

-- ============================================
-- VERIFICAR USUARIO
-- ============================================

-- Ver el usuario creado
SELECT 
  id,
  email,
  raw_user_meta_data->>'rol' as rol_metadata,
  created_at
FROM auth.users
WHERE email = 'coordinacion@psicologakarem.com';

-- Ver en profiles
SELECT 
  id,
  email,
  nombre,
  rol,
  created_at
FROM profiles
WHERE email = 'coordinacion@psicologakarem.com';

-- ============================================
-- CREDENCIALES DE ACCESO
-- ============================================

-- Email: coordinacion@psicologakarem.com
-- Password: (la que estableciste en Supabase Auth)
-- 
-- Si usaste el Dashboard de Supabase:
-- 1. Ve a Authentication > Users
-- 2. Click en "Add User"
-- 3. Email: coordinacion@psicologakarem.com
-- 4. Password: Coord2025! (o la que prefieras)
-- 5. Auto Confirm User: ✓ (activado)
-- 
-- Luego ejecuta este script para actualizar el rol

-- ============================================
-- TESTING DE ACCESO
-- ============================================

-- Verificar políticas RLS
SELECT 
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE policyname LIKE '%coordinacion%'
ORDER BY tablename;

-- Verificar que puede ver sesiones (simulado)
-- Este query debería funcionar cuando el usuario esté logueado
SELECT COUNT(*) as sesiones_visibles
FROM sesiones
WHERE EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.rol = 'coordinacion'
);

-- ============================================
-- MENSAJE DE ÉXITO
-- ============================================

SELECT 
  '✅ Usuario de coordinación configurado' as status,
  'Email: coordinacion@psicologakarem.com' as credenciales,
  'URL: /coordinacion/login' as url_acceso;
