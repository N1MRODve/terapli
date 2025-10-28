-- ============================================================================
-- SCRIPT: ASIGNACIÓN AUTOMÁTICA DE BONOS A CITAS
-- ============================================================================
-- Este script:
-- 1. Actualiza las citas existentes sin bono para asignarles el bono activo del paciente
-- 2. Crea un trigger para que futuras citas se asignen automáticamente al bono activo
-- ============================================================================

BEGIN;

-- ============================================================================
-- PARTE 1: Arreglar citas existentes
-- ============================================================================

-- Actualizar todas las citas que NO tienen bono asignado pero el paciente SÍ tiene bono activo
UPDATE public.citas c
SET bono_id = b.id
FROM public.bonos b
WHERE c.paciente_id = b.paciente_id
  AND c.bono_id IS NULL
  AND b.estado IN ('activo', 'pendiente')
  AND b.sesiones_restantes > 0
  AND c.estado NOT IN ('cancelada', 'borrador');

-- Mostrar cuántas citas se actualizaron
SELECT 
  'Citas actualizadas con bono' as accion,
  COUNT(*) as cantidad
FROM public.citas
WHERE bono_id IS NOT NULL;

-- ============================================================================
-- PARTE 2: Crear función para asignar bono automáticamente
-- ============================================================================

-- Función que asigna automáticamente el bono activo del paciente a la cita
CREATE OR REPLACE FUNCTION public.asignar_bono_automatico()
RETURNS TRIGGER AS $$
DECLARE
  v_bono_id uuid;
BEGIN
  -- Solo si la cita NO tiene bono asignado
  IF NEW.bono_id IS NULL THEN
    -- Buscar bono activo o pendiente del paciente con sesiones restantes
    SELECT id INTO v_bono_id
    FROM public.bonos
    WHERE paciente_id = NEW.paciente_id
      AND estado IN ('activo', 'pendiente')
      AND sesiones_restantes > 0
    ORDER BY 
      CASE estado 
        WHEN 'activo' THEN 1
        WHEN 'pendiente' THEN 2
        ELSE 3
      END,
      created_at DESC
    LIMIT 1;
    
    -- Si se encontró un bono, asignarlo
    IF v_bono_id IS NOT NULL THEN
      NEW.bono_id := v_bono_id;
      NEW.descontar_de_bono := true;
      
      RAISE NOTICE 'Bono % asignado automáticamente a cita %', v_bono_id, NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTE 3: Crear trigger para nuevas citas
-- ============================================================================

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_asignar_bono_automatico ON public.citas;

-- Crear trigger que se ejecuta ANTES de insertar o actualizar una cita
CREATE TRIGGER trigger_asignar_bono_automatico
  BEFORE INSERT OR UPDATE ON public.citas
  FOR EACH ROW
  EXECUTE FUNCTION public.asignar_bono_automatico();

COMMIT;

-- ============================================================================
-- Resumen
-- ============================================================================
SELECT 
  'Sistema de asignación automática de bonos instalado' as mensaje,
  (SELECT COUNT(*) FROM public.citas WHERE bono_id IS NOT NULL) as citas_con_bono,
  (SELECT COUNT(*) FROM public.citas WHERE bono_id IS NULL) as citas_sin_bono,
  (SELECT COUNT(*) FROM public.bonos WHERE estado IN ('activo', 'pendiente')) as bonos_activos;
