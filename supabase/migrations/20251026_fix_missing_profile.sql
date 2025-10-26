-- Fix: Crear perfil para karemeyde@gmail.com si no existe
-- Fecha: 2025-10-26
-- Problema: Usuario autenticado pero sin perfil en tabla profiles

-- Verificar el estado actual
DO $$
DECLARE
  v_user_id uuid := 'd618017c-ea73-4d69-af50-32afb824f407';
  v_profile_exists boolean;
BEGIN
  -- Verificar si el perfil existe
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = v_user_id
  ) INTO v_profile_exists;

  RAISE NOTICE 'Usuario ID: %', v_user_id;
  RAISE NOTICE 'Perfil existe: %', v_profile_exists;

  -- Si el perfil NO existe, crearlo
  IF NOT v_profile_exists THEN
    RAISE NOTICE 'Creando perfil para karemeyde@gmail.com...';
    
    INSERT INTO public.profiles (
      id,
      email,
      nombre,
      rol,
      is_staff,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      'karemeyde@gmail.com',
      'Karem Eyde',
      'psicologa',
      true,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Perfil creado exitosamente!';
  ELSE
    RAISE NOTICE 'El perfil ya existe, no es necesario crearlo';
    
    -- Verificar que tenga is_staff = true
    UPDATE public.profiles
    SET is_staff = true,
        updated_at = NOW()
    WHERE id = v_user_id
      AND (is_staff IS NULL OR is_staff = false);
      
    IF FOUND THEN
      RAISE NOTICE 'is_staff actualizado a true';
    END IF;
  END IF;
END $$;

-- Verificar el resultado
SELECT 
  id,
  email,
  nombre,
  rol,
  is_staff,
  created_at
FROM public.profiles
WHERE email = 'karemeyde@gmail.com';
