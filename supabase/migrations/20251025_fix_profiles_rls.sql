-- ============================================================================
-- SCRIPT DE CORRECCIÓN: Tabla profiles y políticas RLS
-- ============================================================================
-- Ejecutar en SQL Editor de Supabase Dashboard
-- Este script soluciona el error 500 al obtener perfiles
-- ============================================================================

-- Paso 1: Crear el tipo user_role si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM (
            'admin',
            'coordinadora',
            'psicologa',
            'paciente'
        );
        RAISE NOTICE '✓ Tipo user_role creado correctamente';
    ELSE
        RAISE NOTICE '✓ Tipo user_role ya existe';
    END IF;
END $$;

-- Paso 2: Crear tabla profiles si no existe
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    nombre text,
    telefono text,
    rol user_role NOT NULL DEFAULT 'paciente',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Paso 3: Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_rol ON public.profiles(rol);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Paso 4: Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Paso 5: ELIMINAR todas las políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Therapists can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Staff puede ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Coordinadora puede crear perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Coordinadora puede actualizar roles" ON public.profiles;

-- Paso 6: Crear políticas RLS CORRECTAS
-- ========================================

-- Política 1: Todos los usuarios autenticados pueden ver su propio perfil
CREATE POLICY "authenticated_users_select_own_profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Política 2: Todos los usuarios autenticados pueden actualizar su propio perfil
CREATE POLICY "authenticated_users_update_own_profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política 3: Staff (psicólogas y coordinadoras) pueden ver todos los perfiles
CREATE POLICY "staff_select_all_profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.rol IN ('psicologa', 'admin', 'coordinadora')
        )
    );

-- Política 4: Solo coordinadoras y admins pueden insertar nuevos perfiles
CREATE POLICY "coordinadora_insert_profiles"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.rol IN ('coordinadora', 'admin')
        )
    );

-- Política 5: Solo coordinadoras y admins pueden actualizar roles de otros usuarios
CREATE POLICY "coordinadora_update_other_profiles"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.rol IN ('coordinadora', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.rol IN ('coordinadora', 'admin')
        )
    );

-- Paso 7: Crear/Actualizar función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar perfil automáticamente cuando se crea un usuario en auth.users
    INSERT INTO public.profiles (id, email, nombre, rol)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'rol')::user_role, 'paciente'::user_role)
    )
    ON CONFLICT (id) DO NOTHING; -- Evitar errores si ya existe
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Si hay un error, registrar pero no fallar
        RAISE WARNING 'Error en handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 8: Crear trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Paso 9: Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Paso 10: Crear funciones auxiliares para consultas
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role AS $$
    SELECT rol FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, required_role user_role)
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id 
        AND rol = required_role
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- Paso 11: VERIFICAR Y CREAR PERFIL PARA USUARIOS EXISTENTES
-- ============================================================================

-- Crear perfiles para usuarios que existen en auth.users pero no en profiles
INSERT INTO public.profiles (id, email, nombre, rol)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'nombre', split_part(u.email, '@', 1)),
    COALESCE((u.raw_user_meta_data->>'rol')::user_role, 'paciente'::user_role)
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Ver todos los usuarios de auth.users y sus perfiles
SELECT 
    u.id,
    u.email as auth_email,
    u.created_at as auth_created,
    p.email as profile_email,
    p.nombre,
    p.rol,
    CASE 
        WHEN p.id IS NULL THEN '❌ SIN PERFIL'
        ELSE '✓ OK'
    END as estado
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Ver todas las políticas de profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Contar usuarios por rol
SELECT 
    COALESCE(rol::text, 'SIN ROL') as rol,
    COUNT(*) as cantidad
FROM public.profiles
GROUP BY rol
ORDER BY cantidad DESC;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- 
-- ✓ Tipo user_role existe
-- ✓ Tabla profiles existe con columnas correctas
-- ✓ RLS habilitado
-- ✓ 5 políticas creadas (select own, update own, staff select all, etc.)
-- ✓ Trigger handle_new_user creado
-- ✓ Funciones auxiliares creadas
-- ✓ Todos los usuarios de auth.users tienen perfil en profiles
-- 
-- Después de ejecutar este script, el error 500 debe desaparecer
-- ============================================================================
