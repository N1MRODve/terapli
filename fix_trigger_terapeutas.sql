-- ============================================================================
-- FIX: Reparar trigger sync_terapeuta_from_profile
-- ============================================================================
-- El error indica que hay una versión antigua del trigger que usa 'user_id'
-- Este script elimina completamente el trigger y lo recrea correctamente
-- ============================================================================

-- PASO 1: Eliminar trigger y función existentes (versión antigua)
-- ============================================================================
DROP TRIGGER IF EXISTS tr_sync_terapeuta ON public.profiles;
DROP TRIGGER IF EXISTS tr_sync_psicologa ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_terapeuta_from_profile() CASCADE;
DROP FUNCTION IF EXISTS public.sync_psicologa_from_profile() CASCADE;

SELECT '✅ Triggers antiguos eliminados' as status;

-- PASO 2: Verificar estructura de la tabla terapeutas
-- ============================================================================
-- Debe tener 'id' como primary key, NO 'user_id'
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'terapeutas'
ORDER BY ordinal_position;

-- PASO 3: Recrear función correcta (usa 'id', no 'user_id')
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_terapeuta_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo sincronizar si el rol es 'psicologa' o 'terapeuta'
  IF NEW.rol IN ('psicologa', 'terapeuta') THEN

    RAISE NOTICE '🔄 Sincronizando terapeuta: % (%) con rol %',
      NEW.nombre, NEW.email, NEW.rol;

    -- Insertar o actualizar registro en tabla terapeutas
    -- IMPORTANTE: Usa 'id' como columna, NO 'user_id'
    INSERT INTO public.terapeutas (
      id,                    -- ← Columna correcta
      nombre_completo,
      email,
      telefono,
      activo,
      metadata,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,                -- ← Valor del profile.id
      NEW.nombre,
      NEW.email,
      NEW.telefono,
      true,
      COALESCE(NEW.metadata, '{}'::jsonb),
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE  -- ← Conflict en 'id', no en 'user_id'
    SET
      nombre_completo = EXCLUDED.nombre_completo,
      email = EXCLUDED.email,
      telefono = EXCLUDED.telefono,
      metadata = COALESCE(EXCLUDED.metadata, terapeutas.metadata),
      updated_at = now();

    RAISE NOTICE '✅ Registro de terapeuta creado/actualizado en tabla terapeutas';

  ELSIF OLD.rol IS NOT NULL AND OLD.rol IN ('psicologa', 'terapeuta')
        AND NEW.rol NOT IN ('psicologa', 'terapeuta') THEN

    -- Si cambió de terapeuta/psicóloga a otro rol, marcar como inactivo
    UPDATE public.terapeutas
    SET activo = false, updated_at = now()
    WHERE id = NEW.id;

    RAISE NOTICE '⚠️ Terapeuta marcado como inactivo (cambió de rol a %)', NEW.rol;

  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.sync_terapeuta_from_profile() IS
'Sincroniza automáticamente profiles con rol psicologa/terapeuta a la tabla terapeutas.
Versión corregida que usa id como primary key (no user_id).';

SELECT '✅ Función recreada correctamente' as status;

-- PASO 4: Recrear trigger
-- ============================================================================
CREATE TRIGGER tr_sync_terapeuta
  AFTER INSERT OR UPDATE OF rol, nombre, email, telefono
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_terapeuta_from_profile();

COMMENT ON TRIGGER tr_sync_terapeuta ON public.profiles IS
'Sincroniza profiles con tabla terapeutas cuando cambia el rol a psicologa/terapeuta';

SELECT '✅ Trigger recreado correctamente' as status;

-- PASO 5: Verificar que el trigger está activo
-- ============================================================================
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'tr_sync_terapeuta'
AND event_object_table = 'profiles';

-- PASO 6: PRUEBA - Intentar actualizar un rol
-- ============================================================================
-- Descomenta para probar (cambia el email por uno real):
/*
UPDATE public.profiles
SET rol = 'psicologa'
WHERE email = 'karemeyde@gmail.com';

-- Verificar que se creó/actualizó en terapeutas:
SELECT id, nombre_completo, email, activo
FROM public.terapeutas
WHERE email = 'karemeyde@gmail.com';
*/

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- ✅ Trigger y función eliminados
-- ✅ Función recreada usando 'id' (no 'user_id')
-- ✅ Trigger activo
-- ✅ UPDATE de rol a 'psicologa' debe funcionar sin errores
-- ============================================================================

SELECT '🎉 CORRECCIÓN COMPLETADA - Ahora puedes cambiar roles sin errores' as resultado;
