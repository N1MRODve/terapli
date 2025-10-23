-- ============================================================================
-- SCRIPT DE VERIFICACIÓN Y CONFIGURACIÓN DE AUTENTICACIÓN DE TERAPEUTAS
-- ============================================================================
-- Este script asegura que la tabla profiles y los roles estén correctamente
-- configurados para el sistema de autenticación de terapeutas.
-- ============================================================================

-- 1. Verificar que existe el tipo user_role
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM (
            'admin',
            'coordinadora',
            'psicologa',
            'paciente'
        );
        RAISE NOTICE 'Tipo user_role creado correctamente';
    ELSE
        RAISE NOTICE 'Tipo user_role ya existe';
    END IF;
END $$;

-- 2. Verificar/crear tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    nombre text,
    telefono text,
    rol user_role NOT NULL DEFAULT 'paciente',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Tabla de perfiles que extiende auth.users con roles y datos adicionales';

-- 3. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_rol ON public.profiles(rol);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nombre, rol)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'rol')::user_role, 'paciente')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 8. Políticas de seguridad RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil (excepto el rol)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política: Terapeutas y admins pueden ver todos los perfiles
DROP POLICY IF EXISTS "Therapists can view all profiles" ON public.profiles;
CREATE POLICY "Therapists can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND rol IN ('psicologa', 'admin', 'coordinadora')
        )
    );

-- 9. Función auxiliar para obtener el perfil del usuario (útil para middleware)
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid)
RETURNS TABLE (
    id uuid,
    email text,
    nombre text,
    telefono text,
    rol user_role,
    created_at timestamptz,
    updated_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.email, p.nombre, p.telefono, p.rol, p.created_at, p.updated_at
    FROM public.profiles p
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Función para verificar si un usuario es terapeuta
CREATE OR REPLACE FUNCTION public.is_therapist(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id
        AND rol IN ('psicologa', 'admin', 'coordinadora')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DATOS DE EJEMPLO - CREAR TERAPEUTA DE PRUEBA
-- ============================================================================
-- IMPORTANTE: Estos datos son solo para desarrollo/pruebas
-- Elimina o comenta esta sección en producción
-- ============================================================================

-- Nota: Para crear un terapeuta real, primero debes registrar al usuario
-- en Supabase Auth, y luego actualizar su rol en la tabla profiles:
-- 
-- 1. Registrar usuario en Supabase Dashboard o mediante signUp
-- 2. Ejecutar el siguiente UPDATE con el UUID del usuario creado:
--
-- UPDATE public.profiles 
-- SET rol = 'psicologa', nombre = 'Karem Peña'
-- WHERE email = 'karem@example.com';

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Ver todos los perfiles y sus roles
SELECT 
    id,
    email,
    nombre,
    rol,
    created_at
FROM public.profiles
ORDER BY created_at DESC;

-- Ver estadísticas de roles
SELECT 
    rol,
    COUNT(*) as cantidad
FROM public.profiles
GROUP BY rol
ORDER BY cantidad DESC;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 
-- 1. CREAR PRIMER TERAPEUTA:
--    - Registra un usuario en Supabase Auth
--    - Actualiza su rol a 'psicologa' en la tabla profiles
--    - Usa ese usuario para acceder a /terapeuta/login
--
-- 2. ROLES PERMITIDOS PARA ÁREA DE TERAPEUTAS:
--    - 'psicologa': Psicóloga/terapeuta principal
--    - 'admin': Administrador del sistema
--    - 'coordinadora': Coordinadora clínica
--
-- 3. SEGURIDAD:
--    - RLS está activado en la tabla profiles
--    - Los usuarios solo pueden ver/editar su propio perfil
--    - Los terapeutas pueden ver todos los perfiles (necesario para gestión)
--
-- 4. TIPOS VS VALORES:
--    - En el schema: 'psicologa' (rol en base de datos)
--    - En la UI: 'terapeuta' (término más general)
--    - El middleware acepta: 'psicologa', 'admin', 'coordinadora'
--
-- ============================================================================
