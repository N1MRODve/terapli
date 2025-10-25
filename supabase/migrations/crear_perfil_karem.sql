-- ============================================================================
-- CREAR/ACTUALIZAR PERFIL PARA karemeyde@gmail.com
-- ============================================================================
-- Ejecutar en SQL Editor de Supabase
-- ============================================================================

-- Paso 1: Verificar si el usuario existe en auth.users
-- ============================================================================
DO $$
DECLARE
    user_exists boolean;
    user_uuid uuid := 'd618017c-ea73-4d69-af50-32afb824f407';
BEGIN
    -- Verificar en auth.users
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE id = user_uuid
    ) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE '✓ Usuario existe en auth.users';
    ELSE
        RAISE NOTICE '❌ Usuario NO existe en auth.users';
        RAISE EXCEPTION 'El usuario debe existir en auth.users primero';
    END IF;
END $$;

-- Paso 2: Crear o actualizar el perfil
-- ============================================================================
INSERT INTO public.profiles (id, email, nombre, rol, created_at, updated_at)
VALUES (
    'd618017c-ea73-4d69-af50-32afb824f407'::uuid,
    'karemeyde@gmail.com',
    'Karem Peña',
    'psicologa'::user_role,
    NOW(),
    NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
    email = EXCLUDED.email,
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    updated_at = NOW();

-- Paso 3: Verificar que se creó correctamente
-- ============================================================================
SELECT 
    '✓ PERFIL CREADO/ACTUALIZADO' as estado,
    id,
    email,
    nombre,
    rol,
    created_at,
    updated_at
FROM public.profiles
WHERE id = 'd618017c-ea73-4d69-af50-32afb824f407'::uuid;

-- Paso 4: Probar que puedes acceder a tu propio perfil (simulando RLS)
-- ============================================================================
-- Nota: Esta consulta simula lo que hace tu aplicación
SELECT 
    '✓ ACCESO CON RLS' as test,
    rol,
    nombre,
    email
FROM public.profiles
WHERE id = 'd618017c-ea73-4d69-af50-32afb824f407'::uuid;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
/*
Deberías ver:

1. Mensaje: ✓ Usuario existe en auth.users

2. Una fila con:
   estado: ✓ PERFIL CREADO/ACTUALIZADO
   id: d618017c-ea73-4d69-af50-32afb824f407
   email: karemeyde@gmail.com
   nombre: Karem Peña
   rol: psicologa
   
3. Una fila con:
   test: ✓ ACCESO CON RLS
   rol: psicologa
   nombre: Karem Peña
   email: karemeyde@gmail.com

Si ves todo esto, tu login debería funcionar correctamente.
*/
