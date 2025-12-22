-- ============================================================================
-- FIX V2: Reparar trigger sync_terapeuta_from_profile
-- ============================================================================
-- Error: El enum 'user_role' no contiene 'terapeuta', solo 'psicologa'
-- Este script corrige el trigger para usar solo 'psicologa'
-- ============================================================================

-- PASO 1: Verificar valores del enum user_role
-- ============================================================================
SELECT
    'INFO: Valores actuales del enum user_role' as paso;

SELECT
    enumlabel as valor_permitido
FROM pg_enum
WHERE enumtypid = 'public.user_role'::regtype
ORDER BY enumsortorder;

-- PASO 2: Eliminar trigger y función existentes (versión antigua)
-- ============================================================================
DROP TRIGGER IF EXISTS tr_sync_terapeuta ON public.profiles;
DROP TRIGGER IF EXISTS tr_sync_psicologa ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_terapeuta_from_profile() CASCADE;
DROP FUNCTION IF EXISTS public.sync_psicologa_from_profile() CASCADE;

SELECT '✅ Triggers antiguos eliminados' as status;

-- PASO 3: Verificar estructura de la tabla terapeutas
-- ============================================================================
SELECT
    'INFO: Estructura de la tabla terapeutas' as paso;

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'terapeutas'
ORDER BY ordinal_position;

-- PASO 4: Recrear función CORRECTA (solo 'psicologa', sin 'terapeuta')
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_terapeuta_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo sincronizar si el rol es 'psicologa' (el único valor válido)
  -- NO usar 'terapeuta' porque no existe en el enum user_role
  IF NEW.rol = 'psicologa' THEN

    RAISE NOTICE '🔄 Sincronizando terapeuta: % (%) con rol %',
      NEW.nombre, NEW.email, NEW.rol;

    -- Insertar o actualizar registro en tabla terapeutas
    INSERT INTO public.terapeutas (
      id,
      nombre_completo,
      email,
      telefono,
      activo,
      metadata,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.nombre,
      NEW.email,
      NEW.telefono,
      true,
      COALESCE(NEW.metadata, '{}'::jsonb),
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET
      nombre_completo = EXCLUDED.nombre_completo,
      email = EXCLUDED.email,
      telefono = EXCLUDED.telefono,
      activo = true,  -- Reactivar si estaba inactivo
      metadata = COALESCE(EXCLUDED.metadata, terapeutas.metadata),
      updated_at = now();

    RAISE NOTICE '✅ Registro de terapeuta creado/actualizado en tabla terapeutas';

  ELSIF OLD.rol IS NOT NULL AND OLD.rol = 'psicologa'
        AND NEW.rol != 'psicologa' THEN

    -- Si cambió de psicóloga a otro rol, marcar como inactivo
    UPDATE public.terapeutas
    SET activo = false, updated_at = now()
    WHERE id = NEW.id;

    RAISE NOTICE '⚠️ Terapeuta marcado como inactivo (cambió de rol a %)', NEW.rol;

  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.sync_terapeuta_from_profile() IS
'Sincroniza automáticamente profiles con rol psicologa a la tabla terapeutas.
Versión corregida que:
- Usa id como primary key (no user_id)
- Solo verifica rol = psicologa (no terapeuta, que no existe en el enum)';

SELECT '✅ Función recreada correctamente (solo psicologa)' as status;

-- PASO 5: Recrear trigger
-- ============================================================================
CREATE TRIGGER tr_sync_terapeuta
  AFTER INSERT OR UPDATE OF rol, nombre, email, telefono
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_terapeuta_from_profile();

COMMENT ON TRIGGER tr_sync_terapeuta ON public.profiles IS
'Sincroniza profiles con rol psicologa a tabla terapeutas';

SELECT '✅ Trigger recreado correctamente' as status;

-- PASO 6: Verificar que el trigger está activo
-- ============================================================================
SELECT
    'INFO: Verificando trigger activo' as paso;

SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'tr_sync_terapeuta'
AND event_object_table = 'profiles';

-- PASO 7: Sincronizar perfiles existentes con rol 'psicologa'
-- ============================================================================
SELECT
    'INFO: Sincronizando perfiles existentes con rol psicologa' as paso;

-- Insertar/actualizar todos los profiles con rol 'psicologa' en terapeutas
INSERT INTO public.terapeutas (
  id,
  nombre_completo,
  email,
  telefono,
  activo,
  metadata,
  created_at,
  updated_at
)
SELECT
  p.id,
  COALESCE(p.nombre, split_part(p.email, '@', 1)),
  p.email,
  p.telefono,
  true,
  COALESCE(p.metadata, '{}'::jsonb),
  p.created_at,
  now()
FROM public.profiles p
WHERE p.rol = 'psicologa'
ON CONFLICT (id) DO UPDATE
SET
  nombre_completo = EXCLUDED.nombre_completo,
  email = EXCLUDED.email,
  telefono = EXCLUDED.telefono,
  activo = true,
  metadata = EXCLUDED.metadata,
  updated_at = now();

SELECT '✅ Perfiles existentes sincronizados' as status;

-- PASO 8: Verificar sincronización
-- ============================================================================
SELECT
    'INFO: Verificando sincronización profiles <-> terapeutas' as paso;

SELECT
    p.id,
    p.email,
    p.nombre as nombre_profile,
    p.rol,
    t.nombre_completo as nombre_terapeuta,
    t.activo,
    CASE
        WHEN t.id IS NULL THEN '❌ Sin registro en terapeutas'
        WHEN NOT t.activo THEN '⚠️ Inactivo en terapeutas'
        ELSE '✅ OK'
    END as estado
FROM public.profiles p
LEFT JOIN public.terapeutas t ON p.id = t.id
WHERE p.rol = 'psicologa'
ORDER BY p.created_at DESC;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- ✅ Enum user_role mostrado (debe contener: admin, coordinadora, psicologa, paciente)
-- ✅ Trigger y función eliminados
-- ✅ Función recreada usando solo 'psicologa' (no 'terapeuta')
-- ✅ Trigger activo
-- ✅ Perfiles con rol 'psicologa' sincronizados en tabla terapeutas
-- ✅ UPDATE de rol a 'psicologa' debe funcionar sin errores
-- ============================================================================

SELECT '🎉 CORRECCIÓN COMPLETADA V2 - Ahora puedes cambiar roles sin errores' as resultado;
