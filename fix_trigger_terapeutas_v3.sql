-- ============================================================================
-- FIX V3: Reparar trigger sync_terapeuta_from_profile
-- ============================================================================
-- Correcciones:
-- 1. El enum 'user_role' no contiene 'terapeuta', solo 'psicologa'
-- 2. La tabla profiles NO tiene columna 'metadata'
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

-- PASO 2: Verificar estructura de la tabla profiles
-- ============================================================================
SELECT
    'INFO: Estructura de la tabla profiles' as paso;

SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- PASO 3: Eliminar trigger y función existentes (versión antigua)
-- ============================================================================
DROP TRIGGER IF EXISTS tr_sync_terapeuta ON public.profiles;
DROP TRIGGER IF EXISTS tr_sync_psicologa ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_terapeuta_from_profile() CASCADE;
DROP FUNCTION IF EXISTS public.sync_psicologa_from_profile() CASCADE;

SELECT '✅ Triggers antiguos eliminados' as status;

-- PASO 4: Verificar estructura de la tabla terapeutas
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

-- PASO 5: Recrear función CORRECTA
-- ============================================================================
-- Sin usar 'terapeuta' (no existe en enum)
-- Sin usar 'metadata' en profiles (no existe esa columna)
CREATE OR REPLACE FUNCTION public.sync_terapeuta_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo sincronizar si el rol es 'psicologa' (el único valor válido)
  IF NEW.rol = 'psicologa' THEN

    RAISE NOTICE '🔄 Sincronizando terapeuta: % (%) con rol %',
      NEW.nombre, NEW.email, NEW.rol;

    -- Insertar o actualizar registro en tabla terapeutas
    -- NO usar metadata de profiles porque no existe
    INSERT INTO public.terapeutas (
      id,
      nombre_completo,
      email,
      telefono,
      activo,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.nombre, split_part(NEW.email, '@', 1)),
      NEW.email,
      NEW.telefono,
      true,
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET
      nombre_completo = COALESCE(EXCLUDED.nombre_completo, terapeutas.nombre_completo),
      email = EXCLUDED.email,
      telefono = COALESCE(EXCLUDED.telefono, terapeutas.telefono),
      activo = true,  -- Reactivar si estaba inactivo
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
Versión corregida V3 que:
- Usa id como primary key (no user_id)
- Solo verifica rol = psicologa (no terapeuta)
- No usa metadata de profiles (columna no existe)';

SELECT '✅ Función recreada correctamente (V3)' as status;

-- PASO 6: Recrear trigger
-- ============================================================================
CREATE TRIGGER tr_sync_terapeuta
  AFTER INSERT OR UPDATE OF rol, nombre, email, telefono
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_terapeuta_from_profile();

COMMENT ON TRIGGER tr_sync_terapeuta ON public.profiles IS
'Sincroniza profiles con rol psicologa a tabla terapeutas';

SELECT '✅ Trigger recreado correctamente' as status;

-- PASO 7: Verificar que el trigger está activo
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

-- PASO 8: Sincronizar perfiles existentes con rol 'psicologa'
-- ============================================================================
SELECT
    'INFO: Sincronizando perfiles existentes con rol psicologa' as paso;

-- Insertar/actualizar todos los profiles con rol 'psicologa' en terapeutas
-- Sin usar metadata porque no existe en profiles
INSERT INTO public.terapeutas (
  id,
  nombre_completo,
  email,
  telefono,
  activo,
  created_at,
  updated_at
)
SELECT
  p.id,
  COALESCE(p.nombre, split_part(p.email, '@', 1)),
  p.email,
  p.telefono,
  true,
  p.created_at,
  now()
FROM public.profiles p
WHERE p.rol = 'psicologa'
ON CONFLICT (id) DO UPDATE
SET
  nombre_completo = COALESCE(EXCLUDED.nombre_completo, terapeutas.nombre_completo),
  email = EXCLUDED.email,
  telefono = COALESCE(EXCLUDED.telefono, terapeutas.telefono),
  activo = true,
  updated_at = now();

SELECT '✅ Perfiles existentes sincronizados' as status;

-- PASO 9: Verificar sincronización
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

-- PASO 10: Contar registros sincronizados
-- ============================================================================
SELECT
    'INFO: Resumen de sincronización' as paso;

SELECT
    COUNT(*) as total_psicologas,
    SUM(CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END) as sincronizadas,
    SUM(CASE WHEN t.id IS NULL THEN 1 ELSE 0 END) as sin_sincronizar
FROM public.profiles p
LEFT JOIN public.terapeutas t ON p.id = t.id
WHERE p.rol = 'psicologa';

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- ✅ Enum user_role mostrado (admin, coordinadora, psicologa, paciente)
-- ✅ Estructura de profiles mostrada (sin metadata)
-- ✅ Trigger y función eliminados
-- ✅ Función recreada sin usar metadata
-- ✅ Trigger activo
-- ✅ Perfiles con rol 'psicologa' sincronizados en tabla terapeutas
-- ✅ UPDATE de rol a 'psicologa' debe funcionar sin errores
-- ============================================================================

SELECT '🎉 CORRECCIÓN COMPLETADA V3 - Trigger reparado correctamente' as resultado;

-- ============================================================================
-- PRUEBA MANUAL (OPCIONAL)
-- ============================================================================
-- Descomenta para probar cambio de rol:
/*
-- Cambiar un paciente a psicologa
UPDATE public.profiles
SET rol = 'psicologa'
WHERE email = 'EMAIL_DEL_USUARIO';

-- Verificar que se sincronizó
SELECT
    p.id,
    p.email,
    p.rol,
    t.nombre_completo,
    t.activo
FROM public.profiles p
LEFT JOIN public.terapeutas t ON p.id = t.id
WHERE p.email = 'EMAIL_DEL_USUARIO';
*/
