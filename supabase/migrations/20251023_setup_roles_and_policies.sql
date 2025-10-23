-- Script para crear usuarios de prueba en Supabase
-- Ejecutar en el SQL Editor de Supabase Dashboard

-- NOTA IMPORTANTE: 
-- Los usuarios deben crearse primero usando el Auth de Supabase
-- Después, se pueden actualizar sus roles con este script

-- ============================================
-- ACTUALIZAR ROL DE USUARIOS EXISTENTES
-- ============================================

-- 1. Actualizar usuario a rol 'psicologa'
-- Reemplazar 'email@psicologa.com' con el email real
UPDATE public.profiles 
SET 
  rol = 'psicologa',
  nombre = 'Dra. María González'
WHERE email = 'email@psicologa.com';

-- 2. Actualizar usuario a rol 'coordinadora'
-- Reemplazar 'email@coordinadora.com' con el email real
UPDATE public.profiles 
SET 
  rol = 'coordinadora',
  nombre = 'Ana Rodríguez'
WHERE email = 'email@coordinadora.com';

-- 3. Actualizar usuario a rol 'paciente'
-- Reemplazar 'email@paciente.com' con el email real
UPDATE public.profiles 
SET 
  rol = 'paciente',
  nombre = 'Juan Pérez'
WHERE email = 'email@paciente.com';

-- ============================================
-- VERIFICAR ROLES ACTUALES
-- ============================================

-- Ver todos los usuarios y sus roles
SELECT 
  id,
  email,
  nombre,
  rol,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- Contar usuarios por rol
SELECT 
  rol,
  COUNT(*) as cantidad
FROM public.profiles
GROUP BY rol;

-- ============================================
-- CREAR TRIGGER AUTOMÁTICO PARA NUEVOS USUARIOS
-- ============================================

-- Este trigger crea automáticamente un perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'rol')::user_role, 'paciente'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger si no existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- POLÍTICAS RLS PARA LA TABLA PROFILES
-- ============================================

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política: Psicólogas y coordinadora pueden ver todos los perfiles
DROP POLICY IF EXISTS "Staff puede ver todos los perfiles" ON public.profiles;
CREATE POLICY "Staff puede ver todos los perfiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND rol IN ('psicologa', 'coordinadora')
    )
  );

-- Política: Solo coordinadora puede crear nuevos perfiles
DROP POLICY IF EXISTS "Coordinadora puede crear perfiles" ON public.profiles;
CREATE POLICY "Coordinadora puede crear perfiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND rol = 'coordinadora'
    )
  );

-- Política: Solo coordinadora puede cambiar roles
DROP POLICY IF EXISTS "Coordinadora puede actualizar roles" ON public.profiles;
CREATE POLICY "Coordinadora puede actualizar roles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND rol = 'coordinadora'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND rol = 'coordinadora'
    )
  );

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para obtener el rol de un usuario
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT rol FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para verificar si un usuario tiene un rol específico
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_role user_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND rol = required_role
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para verificar si un usuario tiene alguno de varios roles
CREATE OR REPLACE FUNCTION public.has_any_role(user_id UUID, roles user_role[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND rol = ANY(roles)
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- EJEMPLOS DE USO DE LAS FUNCIONES
-- ============================================

-- Verificar el rol del usuario actual
SELECT public.get_user_role(auth.uid());

-- Verificar si el usuario actual es psicóloga
SELECT public.has_role(auth.uid(), 'psicologa');

-- Verificar si el usuario es staff (psicóloga o coordinadora)
SELECT public.has_any_role(auth.uid(), ARRAY['psicologa', 'coordinadora']::user_role[]);

-- ============================================
-- DATOS DE PRUEBA
-- ============================================

-- IMPORTANTE: Primero debes crear los usuarios en Authentication de Supabase
-- Después ejecuta estos UPDATE para asignar roles

-- Ejemplo de estructura para crear usuarios manualmente:
/*
1. Ve a Authentication > Users en Supabase Dashboard
2. Click en "Add User"
3. Ingresa:
   - Email: psicologa@test.com
   - Password: Test123456!
   - User metadata: {"nombre": "Dra. María González", "rol": "psicologa"}
4. Repite para otros usuarios
*/

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Verificar que todo está configurado correctamente
SELECT 
  tablename,
  schemaname,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Ver todas las políticas de profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'profiles';

-- Verificar que el trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- LIMPIAR DATOS DE PRUEBA (SI ES NECESARIO)
-- ============================================

-- CUIDADO: Esto eliminará todos los perfiles de prueba
-- Solo usar en desarrollo
/*
DELETE FROM public.profiles 
WHERE email LIKE '%@test.com';
*/
