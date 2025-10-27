-- ============================================================================
-- FUNCIÓN RPC: Crear Paciente con Profile Automático
-- ============================================================================
-- Fecha: 27 de octubre de 2025
-- Propósito: Crear paciente correctamente con sincronización de profiles

-- Esta función debe ejecutarse con privilegios elevados para poder crear
-- usuarios en auth.users y sincronizar con profiles y pacientes

-- IMPORTANTE: Esta función debe ejecutarse desde el Dashboard de Supabase
-- en la sección SQL Editor con una cuenta que tenga permisos de admin

CREATE OR REPLACE FUNCTION public.crear_paciente_con_profile(
  p_email text,
  p_nombre_completo text,
  p_telefono text DEFAULT NULL,
  p_area_acompanamiento text DEFAULT NULL,
  p_tipo_bono text DEFAULT NULL,
  p_psicologa_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Necesario para acceder a auth.users
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
  v_paciente_id uuid;
  v_result jsonb;
  v_password text;
BEGIN
  -- Validar email
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email es requerido';
  END IF;

  -- Generar contraseña temporal (el paciente la cambiará después)
  v_password := encode(gen_random_bytes(16), 'base64');

  -- 1. Verificar si el email ya existe en auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  -- Si no existe, crear usuario en auth.users
  IF v_user_id IS NULL THEN
    -- Crear usuario en auth.users
    -- NOTA: Esta parte requiere usar la API de Supabase Admin
    -- desde el cliente, no se puede hacer directamente desde SQL
    -- por razones de seguridad
    
    -- Por ahora, verificamos si existe en profiles
    SELECT id INTO v_profile_id
    FROM public.profiles
    WHERE email = p_email;
    
    IF v_profile_id IS NULL THEN
      -- Si no existe en profiles, crear directamente
      -- (esto es temporal hasta que se implemente la creación en auth)
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
      -- Crear profile si no existe (no debería pasar)
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

  -- 2. Crear registro en pacientes con el profile_id correcto
  INSERT INTO public.pacientes (
    profile_id,
    psicologa_id,
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
    p_psicologa_id,
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
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;

-- Comentario de la función
COMMENT ON FUNCTION public.crear_paciente_con_profile IS 
'Crea un paciente con su profile asociado correctamente. 
Debe ejecutarse desde el cliente usando la API de Supabase.';

-- ============================================================================
-- PERMISOS: Permitir que psicólogas ejecuten esta función
-- ============================================================================

-- Dar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.crear_paciente_con_profile TO authenticated;

-- ============================================================================
-- FUNCIÓN ALTERNATIVA: Crear Profile Simple (sin auth.users)
-- ============================================================================
-- Esta función es más simple y no requiere crear usuarios en auth
-- El paciente se creará solo en profiles y pacientes (sin acceso al sistema)

CREATE OR REPLACE FUNCTION public.crear_paciente_simple(
  p_email text,
  p_nombre_completo text,
  p_telefono text DEFAULT NULL,
  p_area_acompanamiento text DEFAULT NULL,
  p_tipo_bono text DEFAULT NULL,
  p_psicologa_id uuid DEFAULT NULL,
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

  -- 3. Crear registro en pacientes con el profile_id
  INSERT INTO public.pacientes (
    profile_id,
    psicologa_id,
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
    p_psicologa_id,
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
      'error', 'La psicóloga especificada no existe',
      'code', 'INVALID_PSICOLOGA',
      'psicologa_id', p_psicologa_id
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

-- Comentario
COMMENT ON FUNCTION public.crear_paciente_simple IS 
'Crea un paciente con su profile asociado (sin crear usuario en auth.users).
El paciente no tendrá acceso al sistema hasta que se le cree una cuenta.
Esta es la función RECOMENDADA para usar desde el modal de nuevo paciente.';

-- Permisos
GRANT EXECUTE ON FUNCTION public.crear_paciente_simple TO authenticated;

-- ============================================================================
-- POLÍTICA RLS: Permitir a psicólogas crear profiles de pacientes
-- ============================================================================

-- Habilitar RLS en profiles si no está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para que psicólogas puedan ver profiles de sus pacientes
CREATE POLICY "Psicólogas pueden ver profiles de sus pacientes"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Si es su propio profile
  id = auth.uid()
  OR
  -- Si es un paciente de la psicóloga
  EXISTS (
    SELECT 1 FROM public.pacientes
    WHERE pacientes.profile_id = profiles.id
    AND pacientes.psicologa_id = auth.uid()
  )
);

-- ============================================================================
-- ÍNDICE: Optimizar búsquedas por email en profiles
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email_lower 
ON public.profiles (LOWER(email));

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Funciones creadas:';
  RAISE NOTICE '   - crear_paciente_con_profile (con auth)';
  RAISE NOTICE '   - crear_paciente_simple (sin auth) ← RECOMENDADA';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Uso desde el cliente:';
  RAISE NOTICE '   const { data } = await supabase.rpc(''crear_paciente_simple'', {';
  RAISE NOTICE '     p_email: ''paciente@email.com'',';
  RAISE NOTICE '     p_nombre_completo: ''Juan Pérez'',';
  RAISE NOTICE '     p_psicologa_id: ''<uuid>'',';
  RAISE NOTICE '     p_tipo_bono: ''quincenal''';
  RAISE NOTICE '   })';
END $$;
