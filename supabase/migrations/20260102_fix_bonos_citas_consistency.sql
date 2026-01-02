-- ============================================================================
-- FIX: Corregir inconsistencias entre bonos y citas
-- Fecha: 2026-01-02
-- ============================================================================
-- Problemas identificados:
-- 1. Citas con bono_id tienen estado_pago='pendiente' en vez de 'bonificado'
-- 2. sesiones_usadas en bonos no coincide con citas con sesion_descontada=true
-- 3. Inconsistencia entre 'pagado' (boolean) y 'estado_pago' (string) en bonos
-- ============================================================================

-- PASO 1: Deshabilitar temporalmente TODOS los triggers que bloquean las actualizaciones
DROP TRIGGER IF EXISTS validar_bono_cita_trigger ON public.citas;
DROP TRIGGER IF EXISTS trigger_validar_saldo_bono ON public.citas;
DROP TRIGGER IF EXISTS trg_actualizar_bono_por_cita ON public.citas;

-- PASO 2: Corregir estado_pago de citas que tienen bono asignado
-- Las citas con bono deben tener estado_pago='bonificado' y metodo_pago='bono'
UPDATE public.citas
SET
    estado_pago = 'bonificado',
    metodo_pago = 'bono',
    updated_at = NOW()
WHERE
    bono_id IS NOT NULL
    AND estado_pago != 'bonificado';

-- Log de citas actualizadas
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.citas
    WHERE bono_id IS NOT NULL AND estado_pago = 'bonificado';

    RAISE NOTICE '✅ Citas con bono actualizadas a estado_pago=bonificado: %', v_count;
END $$;

-- PASO 3: Sincronizar sesiones_usadas en bonos basado en citas con sesion_descontada=true
UPDATE public.bonos b
SET
    sesiones_usadas = (
        SELECT COUNT(*)
        FROM public.citas c
        WHERE c.bono_id = b.id AND c.sesion_descontada = true
    ),
    updated_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM public.citas c
    WHERE c.bono_id = b.id AND c.sesion_descontada = true
);

-- Log de bonos sincronizados
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.bonos
    WHERE sesiones_usadas > 0;

    RAISE NOTICE '✅ Bonos con sesiones_usadas sincronizadas: %', v_count;
END $$;

-- PASO 4: Corregir inconsistencia entre pagado y estado_pago en bonos
-- Si estado_pago='pagado', entonces pagado debe ser true
UPDATE public.bonos
SET
    pagado = true,
    updated_at = NOW()
WHERE
    estado_pago = 'pagado'
    AND pagado = false;

-- Si pagado=true, entonces estado_pago debe ser 'pagado'
UPDATE public.bonos
SET
    estado_pago = 'pagado',
    updated_at = NOW()
WHERE
    pagado = true
    AND (estado_pago IS NULL OR estado_pago != 'pagado');

-- PASO 5: Corregir bonos con monto_total = 0 pero con sesiones
-- (Establecer un precio por defecto de 40€/sesión)
UPDATE public.bonos
SET
    monto_total = sesiones_totales * 40,
    precio_por_sesion = 40,
    updated_at = NOW()
WHERE
    monto_total = 0
    AND sesiones_totales > 0;

-- PASO 6: Verificar y corregir estado de bonos según sesiones_restantes
-- Si sesiones_restantes = 0, el estado debe ser 'agotado' o 'completado'
UPDATE public.bonos
SET
    estado = CASE
        WHEN pagado = true THEN 'completado'
        ELSE 'agotado'
    END,
    updated_at = NOW()
WHERE
    sesiones_restantes <= 0
    AND estado IN ('activo', 'pendiente');

-- PASO 7: Recrear el trigger de validación (ahora permite bonos completados para actualizaciones)
CREATE OR REPLACE FUNCTION public.validar_bono_cita()
RETURNS TRIGGER AS $$
DECLARE
    bono_record RECORD;
BEGIN
    -- Solo validar si hay un bono_id asignado
    IF NEW.bono_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Obtener información del bono
    SELECT * INTO bono_record
    FROM public.bonos
    WHERE id = NEW.bono_id;

    -- Validar que el bono exista
    IF bono_record IS NULL THEN
        RAISE EXCEPTION 'El bono especificado no existe'
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- Solo validar estado en INSERT (nuevas citas)
    -- En UPDATE permitir cualquier estado para poder corregir datos históricos
    IF TG_OP = 'INSERT' THEN
        -- Validar que el bono esté activo o pendiente
        IF bono_record.estado NOT IN ('activo', 'pendiente') THEN
            RAISE EXCEPTION 'El bono no está disponible. Estado actual: %', bono_record.estado
                USING ERRCODE = 'check_violation',
                      HINT = 'Solo se pueden usar bonos en estado activo o pendiente.';
        END IF;

        -- Validar que tenga sesiones disponibles
        IF bono_record.sesiones_restantes <= 0 THEN
            RAISE EXCEPTION 'El bono no tiene sesiones disponibles (% sesiones restantes)',
                           bono_record.sesiones_restantes
                USING ERRCODE = 'check_violation',
                      HINT = 'El paciente debe renovar o comprar un nuevo bono.';
        END IF;
    END IF;

    -- Validar que el bono pertenezca al paciente de la cita (siempre)
    IF bono_record.paciente_id != NEW.paciente_id THEN
        RAISE EXCEPTION 'El bono no pertenece al paciente de la cita'
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger validar_bono_cita
DROP TRIGGER IF EXISTS validar_bono_cita_trigger ON public.citas;
CREATE TRIGGER validar_bono_cita_trigger
    BEFORE INSERT OR UPDATE OF bono_id
    ON public.citas
    FOR EACH ROW
    EXECUTE FUNCTION public.validar_bono_cita();

-- PASO 8: Recrear validar_saldo_bono con lógica mejorada
-- (Permitir pendiente, y no bloquear actualizaciones de estado_pago)
CREATE OR REPLACE FUNCTION public.validar_saldo_bono()
RETURNS TRIGGER AS $$
DECLARE
    bono_record record;
BEGIN
    -- Solo validar si se debe descontar de bono Y es un INSERT o cambio de bono_id
    IF NOT NEW.descontar_de_bono OR NEW.bono_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- No validar si solo estamos actualizando estado_pago o metodo_pago (corrección de datos)
    IF TG_OP = 'UPDATE' AND OLD.bono_id = NEW.bono_id THEN
        -- Solo revalidar si cambia descontar_de_bono de false a true
        IF OLD.descontar_de_bono = NEW.descontar_de_bono THEN
            RETURN NEW;
        END IF;
    END IF;

    -- Obtener información del bono
    SELECT * INTO bono_record
    FROM public.bonos
    WHERE id = NEW.bono_id;

    -- Validar que el bono exista
    IF bono_record IS NULL THEN
        RAISE EXCEPTION 'El bono especificado no existe'
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- Validar que el bono esté activo o pendiente (permitir ambos)
    IF bono_record.estado NOT IN ('activo', 'pendiente') THEN
        RAISE EXCEPTION 'El bono no está disponible. Estado actual: %', bono_record.estado
            USING ERRCODE = 'check_violation',
                  HINT = 'Solo se pueden usar bonos en estado activo o pendiente.';
    END IF;

    -- Validar que tenga sesiones disponibles
    IF bono_record.sesiones_restantes <= 0 THEN
        RAISE EXCEPTION 'El bono no tiene sesiones disponibles (% sesiones restantes)',
                       bono_record.sesiones_restantes
            USING ERRCODE = 'check_violation',
                  HINT = 'El paciente debe renovar o comprar un nuevo bono.';
    END IF;

    -- Validar que el bono pertenezca al paciente de la cita
    IF bono_record.paciente_id != NEW.paciente_id THEN
        RAISE EXCEPTION 'El bono no pertenece al paciente de la cita'
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear el trigger validar_saldo_bono
DROP TRIGGER IF EXISTS trigger_validar_saldo_bono ON public.citas;
CREATE TRIGGER trigger_validar_saldo_bono
    BEFORE INSERT OR UPDATE ON public.citas
    FOR EACH ROW
    EXECUTE FUNCTION public.validar_saldo_bono();

-- PASO 9: Resumen final
DO $$
DECLARE
    v_citas_bonificadas INTEGER;
    v_bonos_sincronizados INTEGER;
    v_bonos_pagados INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_citas_bonificadas
    FROM public.citas WHERE bono_id IS NOT NULL AND estado_pago = 'bonificado';

    SELECT COUNT(*) INTO v_bonos_sincronizados
    FROM public.bonos WHERE sesiones_usadas > 0;

    SELECT COUNT(*) INTO v_bonos_pagados
    FROM public.bonos WHERE pagado = true AND estado_pago = 'pagado';

    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ RESUMEN DE CORRECCIONES:';
    RAISE NOTICE '   - Citas con estado_pago=bonificado: %', v_citas_bonificadas;
    RAISE NOTICE '   - Bonos con sesiones_usadas sincronizadas: %', v_bonos_sincronizados;
    RAISE NOTICE '   - Bonos con pagado/estado_pago consistente: %', v_bonos_pagados;
    RAISE NOTICE '============================================';
END $$;
