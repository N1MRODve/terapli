-- ============================================================================
-- ACTUALIZACIÓN: Función crear_paciente_simple para usar terapeuta_id
-- ============================================================================
-- Fecha: 27 de octubre de 2025
-- Objetivo: Actualizar función RPC para usar terapeuta_id en lugar de psicologa_id
-- ============================================================================

-- ============================================================================
-- FUNCIÓN ACTUALIZADA: crear_paciente_simple con terapeuta_id
-- ============================================================================

CREATE OR REPLACE FUNCTION public.crear_paciente_simple(
  p_email text,
  p_nombre_completo text,
  p_telefono text DEFAULT NULL,
  p_area_acompanamiento text DEFAULT NULL,
  p_tipo_bono text DEFAULT NULL,
  p_terapeuta_id uuid DEFAULT NULL,  -- ← CAMBIO: era p_psicologa_id
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
  v_paciente_id uuid;
  v_result jsonb;
BEGIN
  -- Validar email
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email es requerido';
  END IF;

  -- Validar que el terapeuta existe (si se proporcionó)
  IF p_terapeuta_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.terapeutas 
      WHERE id = p_terapeuta_id AND activo = true
    ) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'El terapeuta especificado no existe o está inactivo',
        'code', 'INVALID_TERAPEUTA',
        'terapeuta_id', p_terapeuta_id
      );
    END IF;
  END IF;

  -- 1. Verificar si ya existe un profile con ese email
  SELECT id INTO v_profile_id
  FROM public.profiles
  WHERE email = p_email;

  -- 2. Si no existe, crear el profile
  IF v_profile_id IS NULL THEN
    INSERT INTO public.profiles (
      id,
      email,
      nombre,
      telefono,
      rol,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      p_email,
      p_nombre_completo,
      p_telefono,
      'paciente',
      now(),
      now()
    )
    RETURNING id INTO v_profile_id;
    
    RAISE NOTICE '✅ Profile creado con ID: %', v_profile_id;
  ELSE
    RAISE NOTICE '⚠️ Profile ya existe con ID: %', v_profile_id;
  END IF;

  -- 3. Crear registro en pacientes con terapeuta_id
  INSERT INTO public.pacientes (
    profile_id,
    terapeuta_id,        -- ← CAMBIO: era psicologa_id
    email,
    nombre_completo,
    telefono,
    area_de_acompanamiento,
    tipo_bono,
    activo,
    metadata,
    created_at,
    updated_at
  )
  VALUES (
    v_profile_id,
    p_terapeuta_id,      -- ← CAMBIO: era p_psicologa_id
    p_email,
    p_nombre_completo,
    p_telefono,
    p_area_acompanamiento,
    p_tipo_bono,
    true,
    p_metadata,
    now(),
    now()
  )
  RETURNING id INTO v_paciente_id;

  RAISE NOTICE '✅ Paciente creado con ID: %', v_paciente_id;

  -- 4. Construir respuesta
  v_result := jsonb_build_object(
    'success', true,
    'paciente_id', v_paciente_id,
    'profile_id', v_profile_id,
    'email', p_email,
    'nombre_completo', p_nombre_completo,
    'terapeuta_id', p_terapeuta_id,
    'mensaje', 'Paciente creado exitosamente'
  );

  RETURN v_result;

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ya existe un paciente o profile con ese email',
      'code', 'DUPLICATE_EMAIL',
      'email', p_email
    );
  WHEN foreign_key_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'El terapeuta especificado no existe',
      'code', 'INVALID_TERAPEUTA',
      'terapeuta_id', p_terapeuta_id
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'code', SQLSTATE,
      'detail', SQLERRM
    );
END;
$$;

-- Comentario actualizado
COMMENT ON FUNCTION public.crear_paciente_simple IS 
'Crea un paciente con su profile asociado (sin crear usuario en auth.users).
El paciente no tendrá acceso al sistema hasta que se le cree una cuenta.
ACTUALIZADO: Usa terapeuta_id en lugar de psicologa_id.';

-- Permisos
GRANT EXECUTE ON FUNCTION public.crear_paciente_simple TO authenticated;

-- ============================================================================
-- FUNCIÓN ADICIONAL: crear_paciente_con_profile actualizada
-- ============================================================================

CREATE OR REPLACE FUNCTION public.crear_paciente_con_profile(
  p_email text,
  p_nombre_completo text,
  p_telefono text DEFAULT NULL,
  p_area_acompanamiento text DEFAULT NULL,
  p_tipo_bono text DEFAULT NULL,
  p_terapeuta_id uuid DEFAULT NULL,  -- ← CAMBIO: era p_psicologa_id
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
  v_paciente_id uuid;
  v_result jsonb;
BEGIN
  -- Validar email
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email es requerido';
  END IF;

  -- Validar que el terapeuta existe (si se proporcionó)
  IF p_terapeuta_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.terapeutas 
      WHERE id = p_terapeuta_id AND activo = true
    ) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'El terapeuta especificado no existe o está inactivo',
        'code', 'INVALID_TERAPEUTA',
        'terapeuta_id', p_terapeuta_id
      );
    END IF;
  END IF;

  -- 1. Verificar si el email ya existe en auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  -- Si no existe, buscar o crear en profiles
  IF v_user_id IS NULL THEN
    SELECT id INTO v_profile_id
    FROM public.profiles
    WHERE email = p_email;
    
    IF v_profile_id IS NULL THEN
      -- Crear nuevo profile
      INSERT INTO public.profiles (
        id,
        email,
        nombre,
        telefono,
        rol,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        p_email,
        p_nombre_completo,
        p_telefono,
        'paciente',
        now(),
        now()
      )
      RETURNING id INTO v_profile_id;
      
      RAISE NOTICE 'Profile creado con ID: %', v_profile_id;
    END IF;
  ELSE
    -- Si existe en auth.users, obtener el profile_id
    SELECT id INTO v_profile_id
    FROM public.profiles
    WHERE id = v_user_id;
    
    IF v_profile_id IS NULL THEN
      -- Crear profile si no existe
      INSERT INTO public.profiles (
        id,
        email,
        nombre,
        telefono,
        rol
      )
      VALUES (
        v_user_id,
        p_email,
        p_nombre_completo,
        p_telefono,
        'paciente'
      )
      RETURNING id INTO v_profile_id;
    END IF;
  END IF;

  -- 2. Crear registro en pacientes con terapeuta_id
  INSERT INTO public.pacientes (
    profile_id,
    terapeuta_id,        -- ← CAMBIO: era psicologa_id
    email,
    nombre_completo,
    telefono,
    area_de_acompanamiento,
    tipo_bono,
    activo,
    metadata,
    created_at,
    updated_at
  )
  VALUES (
    v_profile_id,
    p_terapeuta_id,      -- ← CAMBIO: era p_psicologa_id
    p_email,
    p_nombre_completo,
    p_telefono,
    p_area_acompanamiento,
    p_tipo_bono,
    true,
    p_metadata,
    now(),
    now()
  )
  RETURNING id INTO v_paciente_id;

  -- 3. Construir respuesta
  v_result := jsonb_build_object(
    'success', true,
    'paciente_id', v_paciente_id,
    'profile_id', v_profile_id,
    'email', p_email,
    'terapeuta_id', p_terapeuta_id,
    'mensaje', 'Paciente creado exitosamente'
  );

  RETURN v_result;

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ya existe un paciente con ese email',
      'code', 'DUPLICATE_EMAIL'
    );
  WHEN foreign_key_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'El terapeuta especificado no existe',
      'code', 'INVALID_TERAPEUTA',
      'terapeuta_id', p_terapeuta_id
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;

COMMENT ON FUNCTION public.crear_paciente_con_profile IS 
'Crea un paciente con su profile asociado correctamente. 
ACTUALIZADO: Usa terapeuta_id en lugar de psicologa_id.';

GRANT EXECUTE ON FUNCTION public.crear_paciente_con_profile TO authenticated;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Funciones actualizadas para usar terapeuta_id:';
  RAISE NOTICE '   - crear_paciente_simple';
  RAISE NOTICE '   - crear_paciente_con_profile';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Uso desde el cliente:';
  RAISE NOTICE '   const { data } = await supabase.rpc(''crear_paciente_simple'', {';
  RAISE NOTICE '     p_email: ''paciente@email.com'',';
  RAISE NOTICE '     p_nombre_completo: ''Juan Pérez'',';
  RAISE NOTICE '     p_terapeuta_id: ''<uuid>'',  // ← CAMBIO';
  RAISE NOTICE '     p_tipo_bono: ''quincenal''';
  RAISE NOTICE '   })';
END $$;
