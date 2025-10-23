-- ============================================
-- CREAR USUARIO DE COORDINACIÓN - MÉTODO DIRECTO
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- ============================================

-- PASO 1: Habilitar extensión
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- PASO 2: Verificar si el usuario ya existe y eliminarlo si es necesario
DO $$
DECLARE
  existing_user_id uuid;
BEGIN
  -- Buscar usuario existente
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = 'coordinacion@local.test';
  
  -- Si existe, eliminarlo
  IF existing_user_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = existing_user_id;
    DELETE FROM profiles WHERE id = existing_user_id;
    RAISE NOTICE 'Usuario anterior eliminado';
  END IF;
END $$;

-- PASO 3: Crear el usuario nuevo
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
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
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"rol":"coordinacion","nombre":"Coordinación Test"}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- PASO 4: Crear perfil
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
WHERE email = 'coordinacion@local.test';

-- PASO 5: Verificar
SELECT 
  '✅ Usuario creado exitosamente' as estado,
  email,
  email_confirmed_at IS NOT NULL as email_confirmado,
  raw_user_meta_data->>'rol' as rol
FROM auth.users
WHERE email = 'coordinacion@local.test';

SELECT 
  '📝 Perfil creado' as estado,
  email,
  nombre,
  rol
FROM profiles
WHERE email = 'coordinacion@local.test';

-- ============================================
-- CREDENCIALES
-- ============================================
SELECT 
  '🔑 CREDENCIALES DE ACCESO' as " ",
  'coordinacion@local.test' as email,
  'Admin123!' as password,
  'http://localhost:3000/coordinacion/login' as url;
