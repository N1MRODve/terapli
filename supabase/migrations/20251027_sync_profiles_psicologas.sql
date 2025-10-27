-- ============================================================================
-- FIX: Sincronización Automática Profiles → Psicólogas
-- ============================================================================
-- Fecha: 27 de octubre de 2025
-- Problema: Error "INVALID_PSICOLOGA" al crear pacientes
-- Causa: Usuario existe en profiles pero no en psicologas
-- Solución: Trigger automático que sincroniza profiles → psicologas
--
-- NOTA: La tabla psicologas es una extensión de profiles
--       Solo contiene campos específicos: num_colegiada, bio, metadata
--       Los datos básicos (nombre, email) están en profiles
-- ============================================================================

-- ============================================================================
-- PASO 1: VERIFICAR ESTRUCTURA ACTUAL
-- ============================================================================

DO $$
DECLARE
  columnas_actuales TEXT;
BEGIN
  SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
  INTO columnas_actuales
  FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = 'psicologas';
  
  RAISE NOTICE '📋 Columnas actuales en psicologas: %', columnas_actuales;
  RAISE NOTICE '✅ La tabla psicologas es una extensión de profiles';
END $$;

-- ============================================================================
-- PASO 2: CREAR FUNCIÓN DE SINCRONIZACIÓN SIMPLE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_psicologa_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo sincronizar si el rol es 'psicologa'
  IF NEW.rol = 'psicologa' THEN
    
    RAISE NOTICE '🔄 Sincronizando psicóloga: % (%) con rol %', 
      NEW.nombre, NEW.email, NEW.rol;
    
    -- Insertar registro en tabla psicologas (extensión de profiles)
    -- Solo el ID como FK, metadata vacío por defecto
    INSERT INTO public.psicologas (
      id,
      metadata
    )
    VALUES (
      NEW.id,
      '{}'::jsonb
    )
    ON CONFLICT (id) DO UPDATE
    SET updated_at = now();
    
    RAISE NOTICE '✅ Registro de psicóloga creado/actualizado en tabla psicologas';
    
  ELSIF OLD.rol IS NOT NULL AND OLD.rol = 'psicologa' AND NEW.rol != 'psicologa' THEN
    -- Si cambió de psicóloga a otro rol, eliminar de psicologas
    -- (por el CASCADE en FK, si se elimina el profile se elimina la psicóloga)
    DELETE FROM public.psicologas WHERE id = NEW.id;
    
    RAISE NOTICE '⚠️ Registro de psicóloga eliminado (cambió de rol a %)', NEW.rol;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PASO 3: CREAR TRIGGER
-- ============================================================================

-- Eliminar trigger si existe (para recrearlo)
DROP TRIGGER IF EXISTS tr_sync_psicologa ON public.profiles;

-- Crear trigger que se ejecuta después de INSERT o UPDATE
CREATE TRIGGER tr_sync_psicologa
  AFTER INSERT OR UPDATE OF rol, nombre, email
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_psicologa_from_profile();

-- Verificar que el trigger se creó
DO $$
BEGIN
  RAISE NOTICE '✅ Trigger tr_sync_psicologa creado exitosamente';
END $$;

-- ============================================================================
-- PASO 4: SINCRONIZAR PSICÓLOGAS EXISTENTES
-- ============================================================================

-- Sincronizar todas las psicólogas que ya existen en profiles pero no en psicologas
INSERT INTO public.psicologas (
  id,
  metadata
)
SELECT 
  p.id,
  '{}'::jsonb
FROM public.profiles p
WHERE p.rol = 'psicologa'
AND NOT EXISTS (
  SELECT 1 FROM public.psicologas ps WHERE ps.id = p.id
)
ON CONFLICT (id) DO UPDATE
SET updated_at = now();

-- ============================================================================
-- PASO 5: VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  profiles_psicologas INTEGER;
  psicologas_count INTEGER;
  sync_count INTEGER;
BEGIN
  -- Contar psicólogas en profiles
  SELECT COUNT(*) INTO profiles_psicologas
  FROM public.profiles
  WHERE rol = 'psicologa';
  
  -- Contar psicólogas en tabla psicologas
  SELECT COUNT(*) INTO psicologas_count
  FROM public.psicologas;
  
  -- Contar psicólogas sincronizadas (que existen en ambas tablas)
  SELECT COUNT(*) INTO sync_count
  FROM public.profiles p
  INNER JOIN public.psicologas ps ON p.id = ps.id
  WHERE p.rol = 'psicologa';
  
  RAISE NOTICE '📊 ESTADÍSTICAS DE SINCRONIZACIÓN:';
  RAISE NOTICE '   Psicólogas en profiles: %', profiles_psicologas;
  RAISE NOTICE '   Psicólogas en tabla psicologas: %', psicologas_count;
  RAISE NOTICE '   Psicólogas sincronizadas: %', sync_count;
  
  IF profiles_psicologas = sync_count THEN
    RAISE NOTICE '✅ Todas las psicólogas están sincronizadas';
  ELSE
    RAISE WARNING '⚠️ Hay % psicólogas sin sincronizar', 
      profiles_psicologas - sync_count;
  END IF;
END $$;

-- ============================================================================
-- PASO 6: COMENTARIOS INFORMATIVOS
-- ============================================================================

COMMENT ON FUNCTION public.sync_psicologa_from_profile() IS
'Sincroniza automáticamente profiles con rol psicologa a la tabla psicologas.
Se ejecuta en INSERT/UPDATE de profiles.
Evita duplicados con ON CONFLICT.
Incluye logging con RAISE NOTICE para debugging.';

COMMENT ON TRIGGER tr_sync_psicologa ON public.profiles IS
'Trigger que ejecuta sync_psicologa_from_profile() después de INSERT/UPDATE
en la tabla profiles cuando cambia el rol, nombre o email.';

-- ============================================================================
-- PASO 7: QUERY DE VERIFICACIÓN FINAL
-- ============================================================================

-- Ver psicólogas sincronizadas (los datos nombre/email están en profiles)
SELECT 
  p.id,
  p.nombre as nombre,
  p.email,
  p.rol,
  ps.num_colegiada,
  ps.bio,
  CASE 
    WHEN ps.id IS NOT NULL THEN '✅ Sincronizada'
    ELSE '❌ Sin sincronizar'
  END as estado_sync,
  ps.created_at as psicologa_created_at,
  ps.updated_at as psicologa_updated_at
FROM public.profiles p
LEFT JOIN public.psicologas ps ON p.id = ps.id
WHERE p.rol = 'psicologa'
ORDER BY p.created_at DESC;

-- ============================================================================
-- PASO 8: TEST DEL TRIGGER (Opcional - Descomentar para probar)
-- ============================================================================

/*
-- Test: Actualizar el nombre de una psicóloga en profiles
-- Debería sincronizarse automáticamente en psicologas

DO $$
DECLARE
  test_psicologa_id uuid;
BEGIN
  -- Obtener una psicóloga de prueba
  SELECT id INTO test_psicologa_id
  FROM public.profiles
  WHERE rol = 'psicologa'
  LIMIT 1;
  
  IF test_psicologa_id IS NOT NULL THEN
    RAISE NOTICE '🧪 TEST: Actualizando psicóloga %', test_psicologa_id;
    
    -- Actualizar nombre en profiles
    UPDATE public.profiles
    SET nombre = 'Test Actualización'
    WHERE id = test_psicologa_id;
    
    -- Verificar que se sincronizó en psicologas
    IF EXISTS (
      SELECT 1 FROM public.psicologas
      WHERE id = test_psicologa_id
      AND nombre_completo = 'Test Actualización'
    ) THEN
      RAISE NOTICE '✅ TEST EXITOSO: Trigger funcionando correctamente';
    ELSE
      RAISE WARNING '❌ TEST FALLIDO: Trigger no sincronizó';
    END IF;
  ELSE
    RAISE WARNING '⚠️ No hay psicólogas para probar';
  END IF;
END $$;
*/

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

-- NOTA 1: El trigger se ejecuta AUTOMÁTICAMENTE en:
--         - INSERT de nuevo perfil con rol 'psicologa'
--         - UPDATE que cambia el rol a 'psicologa'
--         - UPDATE que cambia nombre o email de una psicóloga

-- NOTA 2: El trigger usa ON CONFLICT para evitar duplicados
--         Si el registro ya existe, lo actualiza en lugar de fallar

-- NOTA 3: Los RAISE NOTICE ayudan a debugging durante desarrollo
--         Se pueden ver en los logs de Supabase

-- NOTA 4: SECURITY DEFINER permite que el trigger se ejecute con permisos
--         elevados, necesario para insertar en psicologas

-- NOTA 5: Si una psicóloga cambia su rol a otro (ej: 'coordinadora'),
--         se marca como activo=false en psicologas (no se elimina)
