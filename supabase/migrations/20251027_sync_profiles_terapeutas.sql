-- ============================================================================
-- ACTUALIZACIÓN: Trigger de Sincronización Profiles → Terapeutas
-- ============================================================================
-- Fecha: 27 de octubre de 2025
-- Objetivo: Reemplazar sync_psicologa_from_profile con sync_terapeuta_from_profile
-- ============================================================================

-- ============================================================================
-- PASO 1: ELIMINAR TRIGGER Y FUNCIÓN ANTIGUA (si existe)
-- ============================================================================

DROP TRIGGER IF EXISTS tr_sync_psicologa ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_psicologa_from_profile();

RAISE NOTICE '✅ Trigger y función antigua eliminados';

-- ============================================================================
-- PASO 2: CREAR FUNCIÓN DE SINCRONIZACIÓN CON TERAPEUTAS
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
Se ejecuta en INSERT/UPDATE de profiles.
Evita duplicados con ON CONFLICT.
Incluye logging con RAISE NOTICE para debugging.';

-- ============================================================================
-- PASO 3: CREAR TRIGGER NUEVO
-- ============================================================================

CREATE TRIGGER tr_sync_terapeuta
  AFTER INSERT OR UPDATE OF rol, nombre, email, telefono
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_terapeuta_from_profile();

COMMENT ON TRIGGER tr_sync_terapeuta ON public.profiles IS
'Trigger que ejecuta sync_terapeuta_from_profile() después de INSERT/UPDATE
en la tabla profiles cuando cambia el rol, nombre, email o teléfono.';

-- ============================================================================
-- PASO 4: SINCRONIZAR TERAPEUTAS EXISTENTES
-- ============================================================================

-- Sincronizar todos los profiles con rol psicologa/terapeuta que no estén en terapeutas
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
  p.nombre,
  p.email,
  p.telefono,
  true,
  COALESCE(p.metadata, '{}'::jsonb),
  p.created_at,
  now()
FROM public.profiles p
WHERE p.rol IN ('psicologa', 'terapeuta')
AND NOT EXISTS (
  SELECT 1 FROM public.terapeutas t WHERE t.id = p.id
)
ON CONFLICT (id) DO UPDATE
SET 
  nombre_completo = EXCLUDED.nombre_completo,
  email = EXCLUDED.email,
  telefono = EXCLUDED.telefono,
  updated_at = now();

-- ============================================================================
-- PASO 5: VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  profiles_terapeutas INTEGER;
  terapeutas_count INTEGER;
  sync_count INTEGER;
BEGIN
  -- Contar terapeutas/psicólogas en profiles
  SELECT COUNT(*) INTO profiles_terapeutas
  FROM public.profiles
  WHERE rol IN ('psicologa', 'terapeuta');
  
  -- Contar terapeutas en tabla terapeutas
  SELECT COUNT(*) INTO terapeutas_count
  FROM public.terapeutas;
  
  -- Contar terapeutas sincronizados (que existen en ambas tablas)
  SELECT COUNT(*) INTO sync_count
  FROM public.profiles p
  INNER JOIN public.terapeutas t ON p.id = t.id
  WHERE p.rol IN ('psicologa', 'terapeuta');
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 ESTADÍSTICAS DE SINCRONIZACIÓN';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ Terapeutas/Psicólogas en profiles: %', profiles_terapeutas;
  RAISE NOTICE '✓ Terapeutas en tabla terapeutas: %', terapeutas_count;
  RAISE NOTICE '✓ Terapeutas sincronizados: %', sync_count;
  RAISE NOTICE '';
  
  IF profiles_terapeutas = sync_count THEN
    RAISE NOTICE '✅ Todos los terapeutas están sincronizados correctamente';
  ELSE
    RAISE WARNING '⚠️ Hay % terapeutas sin sincronizar', 
      profiles_terapeutas - sync_count;
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- QUERY DE VERIFICACIÓN FINAL
-- ============================================================================

-- Ver terapeutas sincronizados con sus datos de profiles
SELECT 
  p.id,
  p.nombre as nombre_profile,
  t.nombre_completo as nombre_terapeuta,
  p.email,
  p.rol,
  t.num_colegiada,
  t.activo,
  CASE 
    WHEN t.id IS NOT NULL THEN '✅ Sincronizado'
    ELSE '❌ Sin sincronizar'
  END as estado_sync,
  t.created_at as terapeuta_created_at,
  t.updated_at as terapeuta_updated_at,
  COUNT(pac.id) as pacientes_asignados
FROM public.profiles p
LEFT JOIN public.terapeutas t ON p.id = t.id
LEFT JOIN public.pacientes pac ON pac.terapeuta_id = t.id
WHERE p.rol IN ('psicologa', 'terapeuta')
GROUP BY p.id, p.nombre, t.nombre_completo, p.email, p.rol, t.num_colegiada, 
         t.activo, t.id, t.created_at, t.updated_at
ORDER BY p.created_at DESC;

-- ============================================================================
-- TEST DEL TRIGGER (Opcional - Descomentar para probar)
-- ============================================================================

/*
DO $$
DECLARE
  test_terapeuta_id uuid;
  test_email text;
BEGIN
  -- Obtener un terapeuta de prueba
  SELECT id, email INTO test_terapeuta_id, test_email
  FROM public.profiles
  WHERE rol IN ('psicologa', 'terapeuta')
  LIMIT 1;
  
  IF test_terapeuta_id IS NOT NULL THEN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TEST: Actualizando terapeuta % (%)', test_terapeuta_id, test_email;
    
    -- Actualizar nombre en profiles
    UPDATE public.profiles
    SET nombre = 'Test Actualización Terapeuta'
    WHERE id = test_terapeuta_id;
    
    -- Verificar que se sincronizó en terapeutas
    IF EXISTS (
      SELECT 1 FROM public.terapeutas
      WHERE id = test_terapeuta_id
      AND nombre_completo = 'Test Actualización Terapeuta'
    ) THEN
      RAISE NOTICE '✅ TEST EXITOSO: Trigger funcionando correctamente';
      
      -- Revertir cambio
      UPDATE public.profiles
      SET nombre = split_part(test_email, '@', 1)
      WHERE id = test_terapeuta_id;
      
      RAISE NOTICE '✓ Cambio revertido';
    ELSE
      RAISE WARNING '❌ TEST FALLIDO: Trigger no sincronizó correctamente';
    END IF;
  ELSE
    RAISE WARNING '⚠️ No hay terapeutas para probar';
  END IF;
  RAISE NOTICE '';
END $$;
*/

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

-- NOTA 1: El trigger se ejecuta AUTOMÁTICAMENTE en:
--         - INSERT de nuevo perfil con rol 'psicologa' o 'terapeuta'
--         - UPDATE que cambia el rol a 'psicologa' o 'terapeuta'
--         - UPDATE que cambia nombre, email o teléfono de un terapeuta

-- NOTA 2: El trigger usa ON CONFLICT para evitar duplicados
--         Si el registro ya existe, lo actualiza en lugar de fallar

-- NOTA 3: Los RAISE NOTICE ayudan a debugging durante desarrollo
--         Se pueden ver en los logs de Supabase

-- NOTA 4: SECURITY DEFINER permite que el trigger se ejecute con permisos
--         elevados, necesario para insertar en terapeutas

-- NOTA 5: Si un terapeuta cambia su rol a otro (ej: 'coordinacion'),
--         se marca como activo=false en terapeutas (no se elimina)

-- NOTA 6: Esta versión consolida ambos roles (psicologa y terapeuta)
--         en una sola tabla para simplificar la gestión
