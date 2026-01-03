-- ============================================================================
-- MIGRACIÓN: Corregir estados inconsistentes de bonos
-- ============================================================================
-- Fecha: 4 de enero de 2026
-- Problema: Bonos con sesiones_restantes > 0 pero estado = 'agotado'
-- ============================================================================

-- PASO 0: Deshabilitar TODOS los triggers en bonos para evitar interferencias
DROP TRIGGER IF EXISTS trigger_sync_bono_estado ON public.bonos;
DROP TRIGGER IF EXISTS trigger_sync_sesiones_bono ON public.bonos;
DROP TRIGGER IF EXISTS trigger_actualizar_estado_bono ON public.bonos;
DROP TRIGGER IF EXISTS trigger_validar_estado_bono ON public.bonos;
DROP TRIGGER IF EXISTS trg_sync_bono_estado ON public.bonos;

-- Paso 1: Mostrar bonos afectados ANTES de la corrección
DO $$
DECLARE
    afectados INTEGER;
    b RECORD;
BEGIN
    SELECT COUNT(*) INTO afectados
    FROM public.bonos
    WHERE sesiones_restantes > 0
      AND estado::text IN ('agotado', 'completado');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CORRECCIÓN DE ESTADOS DE BONOS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Bonos con estado incorrecto: %', afectados;

    IF afectados > 0 THEN
        RAISE NOTICE 'Listado de bonos a corregir:';
        FOR b IN
            SELECT id, sesiones_restantes, estado::text
            FROM public.bonos
            WHERE sesiones_restantes > 0 AND estado::text IN ('agotado', 'completado')
        LOOP
            RAISE NOTICE '  - ID: %, sesiones_restantes: %, estado: %', b.id, b.sesiones_restantes, b.estado;
        END LOOP;
    END IF;
END $$;

-- Paso 2: Corregir bonos que tienen sesiones_restantes > 0 pero estado 'agotado' o 'completado'
-- Estos bonos deberían estar 'activo'
UPDATE public.bonos
SET
    estado = 'activo'::estado_bono,
    updated_at = NOW()
WHERE sesiones_restantes > 0
  AND estado::text IN ('agotado', 'completado');

-- Paso 3: Corregir bonos que tienen sesiones_restantes = 0 pero estado 'activo' o 'pendiente'
-- Estos bonos deberían estar 'agotado' o 'completado' según si están pagados
UPDATE public.bonos
SET
    estado = CASE
        WHEN pagado = true THEN 'completado'::estado_bono
        ELSE 'agotado'::estado_bono
    END,
    updated_at = NOW()
WHERE sesiones_restantes = 0
  AND estado::text IN ('activo', 'pendiente');

-- Paso 4: Mostrar resultado DESPUÉS de la corrección
DO $$
DECLARE
    total_bonos INTEGER;
    activos INTEGER;
    pendientes INTEGER;
    agotados INTEGER;
    completados INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_bonos FROM public.bonos;
    SELECT COUNT(*) INTO activos FROM public.bonos WHERE estado::text = 'activo';
    SELECT COUNT(*) INTO pendientes FROM public.bonos WHERE estado::text = 'pendiente';
    SELECT COUNT(*) INTO agotados FROM public.bonos WHERE estado::text = 'agotado';
    SELECT COUNT(*) INTO completados FROM public.bonos WHERE estado::text = 'completado';

    RAISE NOTICE '';
    RAISE NOTICE 'ESTADO DESPUÉS DE CORRECCIÓN:';
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Total bonos: %', total_bonos;
    RAISE NOTICE '  - Activos: %', activos;
    RAISE NOTICE '  - Pendientes: %', pendientes;
    RAISE NOTICE '  - Agotados: %', agotados;
    RAISE NOTICE '  - Completados: %', completados;
    RAISE NOTICE '========================================';
END $$;

-- Paso 5: Crear un trigger para mantener consistencia automática en el futuro
-- El trigger se ejecutará BEFORE UPDATE en bonos
CREATE OR REPLACE FUNCTION public.sync_bono_estado()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Si las sesiones restantes llegan a 0, marcar como agotado o completado
    IF NEW.sesiones_restantes = 0 AND NEW.estado::text NOT IN ('agotado', 'completado') THEN
        IF NEW.pagado = true THEN
            NEW.estado := 'completado'::estado_bono;
        ELSE
            NEW.estado := 'agotado'::estado_bono;
        END IF;
    END IF;

    -- Si las sesiones restantes son > 0 y el estado es agotado, cambiar a activo
    IF NEW.sesiones_restantes > 0 AND NEW.estado::text = 'agotado' THEN
        NEW.estado := 'activo'::estado_bono;
    END IF;

    -- Si las sesiones restantes son > 0 y el estado es completado pero no pagado, cambiar a activo
    -- (completado con sesiones solo tiene sentido si está pagado)
    IF NEW.sesiones_restantes > 0 AND NEW.estado::text = 'completado' AND NEW.pagado = false THEN
        NEW.estado := 'activo'::estado_bono;
    END IF;

    RETURN NEW;
END;
$$;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS trigger_sync_bono_estado ON public.bonos;

-- Crear el trigger
CREATE TRIGGER trigger_sync_bono_estado
    BEFORE INSERT OR UPDATE ON public.bonos
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_bono_estado();

-- Verificación final
DO $$
DECLARE
    inconsistentes INTEGER;
BEGIN
    SELECT COUNT(*) INTO inconsistentes
    FROM public.bonos
    WHERE (sesiones_restantes > 0 AND estado::text IN ('agotado'))
       OR (sesiones_restantes = 0 AND estado::text IN ('activo', 'pendiente'));

    IF inconsistentes = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '✅ Todos los bonos tienen estados consistentes';
        RAISE NOTICE '✅ Trigger sync_bono_estado creado para mantener consistencia';
    ELSE
        RAISE WARNING '⚠️ Aún hay % bonos inconsistentes', inconsistentes;
    END IF;
END $$;

-- ============================================================================
-- PASO 6: Agregar columna numero_renovacion a bonos
-- ============================================================================
-- Esta columna indica cuántos bonos anteriores tuvo el paciente
-- Si es 1, es el primer bono; si es 2, es la primera renovación, etc.

-- Agregar columna si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'bonos'
        AND column_name = 'numero_renovacion'
    ) THEN
        ALTER TABLE public.bonos ADD COLUMN numero_renovacion INTEGER DEFAULT 1;
        RAISE NOTICE '✅ Columna numero_renovacion agregada a bonos';
    ELSE
        RAISE NOTICE 'ℹ️ Columna numero_renovacion ya existe';
    END IF;
END $$;

-- Calcular y asignar el número de renovación basado en el orden de creación
WITH bonos_ordenados AS (
    SELECT
        id,
        paciente_id,
        ROW_NUMBER() OVER (PARTITION BY paciente_id ORDER BY created_at ASC) as num_renovacion
    FROM public.bonos
)
UPDATE public.bonos b
SET numero_renovacion = bo.num_renovacion
FROM bonos_ordenados bo
WHERE b.id = bo.id;

-- Mostrar resultado
DO $$
DECLARE
    pacientes_con_renovaciones INTEGER;
    max_renovacion INTEGER;
BEGIN
    SELECT COUNT(DISTINCT paciente_id) INTO pacientes_con_renovaciones
    FROM public.bonos
    WHERE numero_renovacion > 1;

    SELECT MAX(numero_renovacion) INTO max_renovacion
    FROM public.bonos;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RENOVACIONES CALCULADAS:';
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Pacientes con renovaciones: %', pacientes_con_renovaciones;
    RAISE NOTICE 'Máximo número de renovación: %', max_renovacion;
    RAISE NOTICE '========================================';
END $$;

-- Crear trigger para asignar automáticamente el número de renovación en nuevos bonos
CREATE OR REPLACE FUNCTION public.asignar_numero_renovacion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    ultimo_numero INTEGER;
BEGIN
    -- Obtener el número más alto de renovación para este paciente
    SELECT COALESCE(MAX(numero_renovacion), 0) INTO ultimo_numero
    FROM public.bonos
    WHERE paciente_id = NEW.paciente_id
      AND id != NEW.id;

    -- Asignar el siguiente número
    NEW.numero_renovacion := ultimo_numero + 1;

    RETURN NEW;
END;
$$;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS trigger_asignar_renovacion ON public.bonos;

-- Crear el trigger solo para INSERT
CREATE TRIGGER trigger_asignar_renovacion
    BEFORE INSERT ON public.bonos
    FOR EACH ROW
    EXECUTE FUNCTION public.asignar_numero_renovacion();

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '✅ Trigger asignar_numero_renovacion creado';
    RAISE NOTICE '✅ Migración completada exitosamente';
END $$;
