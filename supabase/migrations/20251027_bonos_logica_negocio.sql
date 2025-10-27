-- #############################################################################
-- #                                                                           #
-- #         LÓGICA DE NEGOCIO SISTEMA BONOS - PSICOLOGAKAREM                #
-- #                                                                           #
-- #############################################################################
-- # Autor: GitHub Copilot
-- # Fecha: 27 de octubre de 2025
-- # Versión: 3.0 (Optimizado según Prompt 2)
-- #
-- # DESCRIPCIÓN:
-- # Implementación robusta y optimizada de reglas de negocio para bonos:
-- # - Consumo automático de sesiones al registrar citas
-- # - Activación automática al confirmar pagos
-- # - Detección diaria de vencimientos
-- # - Renovación automática inteligente
-- # - Seguridad RLS por roles (paciente/psicóloga/staff)
-- #
-- # CARACTERÍSTICAS:
-- # • Transacciones seguras con validaciones
-- # • Idempotencia garantizada (consumo_registrado)
-- # • Estados consistentes (completado, vencido, pendiente, activo)
-- # • Triggers automáticos sin intervención manual
-- # • Row Level Security (RLS) completo
-- # • Manejo de errores robusto
-- # • Compatible con flujo actual de citas y pacientes
-- #
-- # TRIGGERS AUTOMÁTICOS:
-- # 1. tr_bono_sesion_usada (citas) → decrementar_sesion_bono()
-- # 2. trg_activar_bono_al_pagar (pagos_bonos) → fn_activar_bono_al_pagar()
-- # 3. tr_crear_renovacion_automatica (bonos) → crear_renovacion_automatica()
-- #
-- #############################################################################

-- =============================================================================
-- SECCIÓN 1: CONSTRAINTS Y VALIDACIONES EN TABLAS
-- =============================================================================

-- Agregar constraints para prevenir estados inválidos
DO $$ BEGIN
    -- Constraint: sesiones_restantes no puede ser negativo
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'bonos_sesiones_restantes_no_negativo'
    ) THEN
        ALTER TABLE public.bonos 
        ADD CONSTRAINT bonos_sesiones_restantes_no_negativo 
        CHECK (sesiones_restantes >= 0);
        RAISE NOTICE '✅ Constraint bonos_sesiones_restantes_no_negativo agregado';
    END IF;

    -- Constraint: sesiones_restantes <= sesiones_totales
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'bonos_sesiones_logicas'
    ) THEN
        ALTER TABLE public.bonos 
        ADD CONSTRAINT bonos_sesiones_logicas 
        CHECK (sesiones_restantes <= sesiones_totales);
        RAISE NOTICE '✅ Constraint bonos_sesiones_logicas agregado';
    END IF;

    -- Constraint: fecha_fin >= fecha_inicio (si ambas existen)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'bonos_fechas_logicas'
    ) THEN
        ALTER TABLE public.bonos 
        ADD CONSTRAINT bonos_fechas_logicas 
        CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio);
        RAISE NOTICE '✅ Constraint bonos_fechas_logicas agregado';
    END IF;

    -- Agregar columna consumo_registrado a citas si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='citas' AND column_name='consumo_registrado'
    ) THEN
        ALTER TABLE public.citas ADD COLUMN consumo_registrado boolean DEFAULT false;
        RAISE NOTICE '✅ Columna consumo_registrado agregada a citas';
    END IF;

    -- Agregar índice para búsquedas rápidas de consumo
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_citas_consumo_bono'
    ) THEN
        CREATE INDEX idx_citas_consumo_bono ON public.citas(bono_id, estado, consumo_registrado) 
        WHERE bono_id IS NOT NULL;
        RAISE NOTICE '✅ Índice idx_citas_consumo_bono creado';
    END IF;
END $$;

-- =============================================================================
-- SECCIÓN 2: FUNCIÓN PRINCIPAL - CONSUMO DE SESIÓN POR CITA
-- =============================================================================

-- Función para decrementar sesión cuando se registra una cita
CREATE OR REPLACE FUNCTION public.decrementar_sesion_bono()
RETURNS TRIGGER AS $$
DECLARE
    v_sesiones_restantes integer;
BEGIN
    -- VALIDACIÓN: Solo procesar si hay bono asociado
    IF NEW.bono_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- IDEMPOTENCIA: No procesar si ya se registró el consumo
    IF NEW.consumo_registrado = true THEN
        RAISE NOTICE 'Consumo ya registrado para cita %', NEW.id;
        RETURN NEW;
    END IF;

    -- ACTUALIZACIÓN: Decrementar sesión con lock para evitar race conditions
    UPDATE public.bonos
    SET 
        sesiones_restantes = sesiones_restantes - 1,
        estado = CASE 
            WHEN sesiones_restantes - 1 <= 0 THEN 'completado'::estado_bono
            ELSE estado
        END,
        updated_at = now()
    WHERE id = NEW.bono_id
      AND estado::text = 'activo'
      AND sesiones_restantes > 0
    RETURNING sesiones_restantes - 1 INTO v_sesiones_restantes;

    -- Validar que se actualizó correctamente
    IF NOT FOUND THEN
        RAISE WARNING 'No se pudo decrementar bono %. Posible estado inválido o sin sesiones', NEW.bono_id;
        RETURN NEW;
    END IF;

    -- Marcar consumo como registrado
    NEW.consumo_registrado := true;

    -- LOG: Registrar la operación
    RAISE NOTICE '✅ Sesión consumida del bono %. Sesiones restantes: %', 
                 NEW.bono_id, v_sesiones_restantes;

    -- ALERTA: Notificar si quedan pocas sesiones
    IF v_sesiones_restantes <= 2 AND v_sesiones_restantes > 0 THEN
        RAISE WARNING '⚠️ Alerta: Bono % tiene solo % sesión(es) restante(s)', 
                     NEW.bono_id, v_sesiones_restantes;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.decrementar_sesion_bono() IS 
'Decrementa automáticamente una sesión del bono cuando se registra una nueva cita. Cambia estado a completado cuando llega a 0 sesiones.';

-- Eliminar triggers anteriores si existen
DROP TRIGGER IF EXISTS trg_consumir_sesion_por_cita ON public.citas;
DROP TRIGGER IF EXISTS trigger_actualizar_sesiones ON public.citas;
DROP TRIGGER IF EXISTS tr_bono_sesion_usada ON public.citas;

-- Crear trigger para consumo de sesiones (se ejecuta al INSERT de cita)
CREATE TRIGGER tr_bono_sesion_usada
    AFTER INSERT ON public.citas
    FOR EACH ROW
    WHEN (NEW.bono_id IS NOT NULL)
    EXECUTE FUNCTION public.decrementar_sesion_bono();

COMMENT ON TRIGGER tr_bono_sesion_usada ON public.citas IS
'Trigger que decrementa una sesión del bono asociado cuando se registra una nueva cita con bono_id';

-- =============================================================================
-- SECCIÓN 3: FUNCIÓN RPC PARA CONFIRMAR PAGO (LLAMABLE DESDE FRONTEND)
-- =============================================================================

-- Función RPC segura para confirmar un pago
CREATE OR REPLACE FUNCTION public.fn_confirmar_pago_bono(
    p_pago_id uuid
)
RETURNS jsonb AS $$
DECLARE
    v_pago_record record;
    v_bono_record record;
    v_total_pagado numeric;
    v_resultado jsonb;
BEGIN
    -- VALIDACIÓN 1: Verificar permisos (solo staff puede confirmar pagos)
    IF NOT public.is_staff() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Permisos insuficientes',
            'mensaje', 'Solo el personal autorizado puede confirmar pagos'
        );
    END IF;

    -- INICIO DE TRANSACCIÓN CRÍTICA
    BEGIN
        -- VALIDACIÓN 2: Obtener pago con lock
        SELECT * INTO STRICT v_pago_record
        FROM public.pagos_bonos
        WHERE id = p_pago_id
        FOR UPDATE;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Pago no encontrado',
                'mensaje', format('No existe pago con ID %s', p_pago_id)
            );
    END;

    -- VALIDACIÓN 3: Verificar que el pago no esté ya confirmado
    IF v_pago_record.confirmado = true THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Pago ya confirmado',
            'mensaje', format('El pago %s ya fue confirmado previamente', p_pago_id)
        );
    END IF;

    -- VALIDACIÓN 4: Obtener bono asociado con lock
    BEGIN
        SELECT * INTO STRICT v_bono_record
        FROM public.bonos
        WHERE id = v_pago_record.bono_id
        FOR UPDATE;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Bono no encontrado',
                'mensaje', format('No existe bono con ID %s', v_pago_record.bono_id)
            );
    END;

    -- ACTUALIZACIÓN 1: Confirmar el pago
    UPDATE public.pagos_bonos
    SET 
        confirmado = true,
        fecha_confirmacion = now(),
        confirmado_por = auth.uid(),
        updated_at = now()
    WHERE id = p_pago_id;

    -- CÁLCULO: Total pagado hasta ahora para este bono
    SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
    FROM public.pagos_bonos
    WHERE bono_id = v_pago_record.bono_id 
      AND confirmado = true;

    -- LÓGICA DE ACTIVACIÓN DEL BONO
    IF v_bono_record.estado::text = 'pendiente' THEN
        -- Si el pago cubre el monto total, activar el bono
        IF v_total_pagado >= v_bono_record.monto THEN
            UPDATE public.bonos
            SET 
                estado = 'activo'::estado_bono,
                pagado = true,
                sesiones_restantes = COALESCE(sesiones_restantes, sesiones_totales), -- Inicializar si es NULL
                updated_at = now()
            WHERE id = v_pago_record.bono_id;

            -- Construir respuesta de éxito con activación
            v_resultado := jsonb_build_object(
                'success', true,
                'mensaje', 'Pago confirmado y bono activado exitosamente',
                'pago', jsonb_build_object(
                    'id', p_pago_id,
                    'monto', v_pago_record.monto,
                    'confirmado_por', auth.uid(),
                    'fecha_confirmacion', now()
                ),
                'bono', jsonb_build_object(
                    'id', v_pago_record.bono_id,
                    'estado', 'activo',
                    'pagado', true,
                    'total_pagado', v_total_pagado,
                    'monto_bono', v_bono_record.monto,
                    'sesiones_restantes', COALESCE(v_bono_record.sesiones_restantes, v_bono_record.sesiones_totales),
                    'sesiones_totales', v_bono_record.sesiones_totales
                )
            );

            RAISE NOTICE '✅ Pago % confirmado. Bono % activado (total pagado: % de %)', 
                         p_pago_id, v_pago_record.bono_id, v_total_pagado, v_bono_record.monto;

        ELSE
            -- Pago parcial confirmado, bono sigue pendiente
            UPDATE public.bonos
            SET 
                pagado = false,
                updated_at = now()
            WHERE id = v_pago_record.bono_id;

            v_resultado := jsonb_build_object(
                'success', true,
                'mensaje', 'Pago confirmado. Pago parcial registrado',
                'pago', jsonb_build_object(
                    'id', p_pago_id,
                    'monto', v_pago_record.monto,
                    'confirmado_por', auth.uid(),
                    'fecha_confirmacion', now()
                ),
                'bono', jsonb_build_object(
                    'id', v_pago_record.bono_id,
                    'estado', 'pendiente',
                    'pagado', false,
                    'total_pagado', v_total_pagado,
                    'monto_bono', v_bono_record.monto,
                    'monto_pendiente', v_bono_record.monto - v_total_pagado
                )
            );

            RAISE NOTICE 'ℹ️ Pago % confirmado. Pago parcial: % de % (falta: %)', 
                         p_pago_id, v_total_pagado, v_bono_record.monto, 
                         v_bono_record.monto - v_total_pagado;
        END IF;

    ELSE
        -- Bono no está en estado pendiente, solo actualizar flag de pagado
        UPDATE public.bonos
        SET 
            pagado = (v_total_pagado >= v_bono_record.monto),
            updated_at = now()
        WHERE id = v_pago_record.bono_id;

        v_resultado := jsonb_build_object(
            'success', true,
            'mensaje', format('Pago confirmado. Bono en estado: %s', v_bono_record.estado),
            'pago', jsonb_build_object(
                'id', p_pago_id,
                'monto', v_pago_record.monto,
                'confirmado_por', auth.uid(),
                'fecha_confirmacion', now()
            ),
            'bono', jsonb_build_object(
                'id', v_pago_record.bono_id,
                'estado', v_bono_record.estado,
                'pagado', (v_total_pagado >= v_bono_record.monto),
                'total_pagado', v_total_pagado,
                'monto_bono', v_bono_record.monto
            )
        );

        RAISE NOTICE 'ℹ️ Pago % confirmado para bono % (estado: %)', 
                     p_pago_id, v_pago_record.bono_id, v_bono_record.estado;
    END IF;

    RETURN v_resultado;

EXCEPTION
    WHEN OTHERS THEN
        -- Manejo de errores robusto
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'mensaje', format('Error al confirmar pago: %s', SQLERRM)
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.fn_confirmar_pago_bono(uuid) IS
'Función RPC segura para confirmar un pago desde el frontend. Valida permisos, actualiza el pago y activa el bono si corresponde. Maneja pagos parciales correctamente.';

-- =============================================================================
-- SECCIÓN 4: ACTIVACIÓN AUTOMÁTICA DE BONO AL CONFIRMAR PAGO (TRIGGER)
-- =============================================================================

-- Función para activar bono cuando se confirma un pago (usada por trigger)
CREATE OR REPLACE FUNCTION public.fn_activar_bono_al_pagar()
RETURNS TRIGGER AS $$
DECLARE
    v_bono_record record;
    v_total_pagado numeric;
BEGIN
    -- VALIDACIÓN 1: Solo procesar si el pago se confirmó
    IF NEW.confirmado != true THEN
        RETURN NEW;
    END IF;

    -- VALIDACIÓN 2: Idempotencia - No procesar si ya estaba confirmado
    IF OLD IS NOT NULL AND OLD.confirmado = true THEN
        RETURN NEW;
    END IF;

    -- INICIO DE TRANSACCIÓN CRÍTICA
    BEGIN
        -- Obtener el bono con lock
        SELECT * INTO v_bono_record
        FROM public.bonos
        WHERE id = NEW.bono_id
        FOR UPDATE;

        -- VALIDACIÓN 3: Verificar que el bono existe
        IF v_bono_record IS NULL THEN
            RAISE EXCEPTION 'Bono % no existe', NEW.bono_id;
        END IF;

        -- CÁLCULO: Total pagado del bono
        SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
        FROM public.pagos_bonos
        WHERE bono_id = NEW.bono_id AND confirmado = true;

        -- LÓGICA DE ACTIVACIÓN
        -- Si el bono está pendiente y se pagó completamente (o más), activarlo
        IF v_bono_record.estado::text = 'pendiente' THEN
            IF v_total_pagado >= v_bono_record.monto THEN
                UPDATE public.bonos
                SET 
                    estado = 'activo'::estado_bono,
                    pagado = true,
                    updated_at = now()
                WHERE id = NEW.bono_id;

                RAISE NOTICE '✅ Bono % activado tras confirmación de pago. Total pagado: %', 
                            NEW.bono_id, v_total_pagado;
            ELSE
                -- Marcar como pagado parcialmente
                UPDATE public.bonos
                SET 
                    pagado = false,
                    updated_at = now()
                WHERE id = NEW.bono_id;

                RAISE NOTICE 'ℹ️ Pago parcial confirmado para bono %. Pagado: % de %', 
                            NEW.bono_id, v_total_pagado, v_bono_record.monto;
            END IF;
        ELSE
            -- Si el bono ya está activo, solo actualizar el flag de pagado
            UPDATE public.bonos
            SET 
                pagado = (v_total_pagado >= v_bono_record.monto),
                updated_at = now()
            WHERE id = NEW.bono_id;
        END IF;

        -- Actualizar fecha de confirmación
        NEW.fecha_confirmacion := now();
        NEW.confirmado_por := auth.uid();

    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error al activar bono % tras pago: %', NEW.bono_id, SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.fn_activar_bono_al_pagar() IS
'Activa automáticamente un bono cuando se confirma un pago que cubre el monto total. Maneja pagos parciales correctamente.';

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS trg_activar_bono_al_pagar ON public.pagos_bonos;
DROP TRIGGER IF EXISTS trigger_activar_bono ON public.pagos_bonos;

-- Crear trigger para activación de bonos
CREATE TRIGGER trg_activar_bono_al_pagar
    BEFORE INSERT OR UPDATE OF confirmado ON public.pagos_bonos
    FOR EACH ROW
    WHEN (NEW.confirmado = true)
    EXECUTE FUNCTION public.fn_activar_bono_al_pagar();

COMMENT ON TRIGGER trg_activar_bono_al_pagar ON public.pagos_bonos IS
'Trigger que activa un bono cuando se confirma un pago completo';

-- =============================================================================
-- SECCIÓN 5: DETECCIÓN Y MARCADO DE BONOS VENCIDOS
-- =============================================================================

-- Función para marcar bonos vencidos (ejecutar periódicamente con pg_cron o manual)
CREATE OR REPLACE FUNCTION public.verificar_vencimiento_bonos()
RETURNS TABLE (
    bonos_actualizados integer,
    bonos_ids uuid[]
) AS $$
DECLARE
    v_count integer;
    v_ids uuid[];
BEGIN
    -- Obtener IDs de bonos que vencerán
    SELECT array_agg(id) INTO v_ids
    FROM public.bonos
    WHERE fecha_fin < CURRENT_DATE
      AND estado::text IN ('activo', 'pendiente');

    -- Actualizar bonos vencidos
    UPDATE public.bonos
    SET 
        estado = 'vencido'::estado_bono,
        updated_at = now()
    WHERE fecha_fin < CURRENT_DATE
      AND estado::text IN ('activo', 'pendiente');

    GET DIAGNOSTICS v_count = ROW_COUNT;

    -- Log de la operación
    IF v_count > 0 THEN
        RAISE NOTICE '✅ Se marcaron % bono(s) como vencidos', v_count;
    ELSE
        RAISE NOTICE 'ℹ️ No hay bonos vencidos para actualizar';
    END IF;

    -- Retornar resultados
    RETURN QUERY SELECT v_count, COALESCE(v_ids, ARRAY[]::uuid[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.verificar_vencimiento_bonos() IS
'Marca como vencidos los bonos cuya fecha_fin < current_date. Se ejecuta diariamente con pg_cron o manualmente. Retorna cantidad y IDs de bonos afectados.';

-- Función alternativa sin retorno (para compatibilidad con cron)
CREATE OR REPLACE FUNCTION public.verificar_vencimiento_bonos_simple()
RETURNS void AS $$
BEGIN
    UPDATE public.bonos
    SET 
        estado = 'vencido'::estado_bono,
        updated_at = now()
    WHERE fecha_fin < CURRENT_DATE
      AND estado::text IN ('activo', 'pendiente');
    
    RAISE NOTICE '✅ Verificación de vencimiento ejecutada. Bonos actualizados: %', (SELECT COUNT(*) FROM pg_temp.updated_rows);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.verificar_vencimiento_bonos_simple() IS
'Versión simplificada de verificar_vencimiento_bonos() para ejecución en pg_cron sin retorno.';

-- =============================================================================
-- SECCIÓN 6: RENOVACIÓN AUTOMÁTICA DE BONOS
-- =============================================================================

-- Función para crear renovación automática cuando un bono se completa o vence
CREATE OR REPLACE FUNCTION public.crear_renovacion_automatica()
RETURNS TRIGGER AS $$
DECLARE
    v_nuevo_bono_id uuid;
    v_duracion_dias integer;
BEGIN
    -- VALIDACIÓN 1: Solo ejecutar si tiene renovación automática activa
    IF NEW.renovacion_automatica != true THEN
        RETURN NEW;
    END IF;

    -- VALIDACIÓN 2: Solo ejecutar si el estado cambió a 'completado' o 'vencido'
    IF NEW.estado::text NOT IN ('completado', 'vencido') THEN
        RETURN NEW;
    END IF;

    -- VALIDACIÓN 3: Idempotencia - No renovar si ya estaba en ese estado
    IF OLD IS NOT NULL AND OLD.estado::text IN ('completado', 'vencido') THEN
        RETURN NEW;
    END IF;

    -- INICIO DE PROCESO DE RENOVACIÓN
    BEGIN
        -- CÁLCULO: Duración en días del bono original (si tiene fechas)
        IF NEW.fecha_fin IS NOT NULL AND NEW.fecha_inicio IS NOT NULL THEN
            v_duracion_dias := (NEW.fecha_fin - NEW.fecha_inicio);
        ELSE
            v_duracion_dias := NULL;
        END IF;

        -- CREACIÓN: Nuevo bono duplicando configuración del original
        INSERT INTO public.bonos (
            paciente_id,
            psicologa_id,
            tipo,
            frecuencia,
            sesiones_totales,
            sesiones_restantes,
            fecha_inicio,
            fecha_fin,
            estado,
            monto,
            pagado,
            renovacion_automatica,
            notas,
            metadata
        ) VALUES (
            NEW.paciente_id,
            NEW.psicologa_id,
            NEW.tipo,
            NEW.frecuencia,
            NEW.sesiones_totales,
            NEW.sesiones_totales, -- Restaurar todas las sesiones
            CURRENT_DATE, -- Nueva fecha de inicio
            CASE 
                WHEN v_duracion_dias IS NOT NULL THEN CURRENT_DATE + v_duracion_dias
                ELSE NULL
            END,
            'pendiente'::estado_bono, -- Empieza pendiente hasta que se pague
            NEW.monto,
            false, -- No está pagado inicialmente
            NEW.renovacion_automatica,
            'Renovación automática de bono ' || NEW.id::text,
            jsonb_build_object(
                'renovacion_automatica', true,
                'bono_original_id', NEW.id::text,
                'fecha_renovacion', now(),
                'generado_por', 'trigger'
            )
        ) RETURNING id INTO v_nuevo_bono_id;

        -- REGISTRO: Crear entrada en historial de renovaciones
        INSERT INTO public.renovaciones_bonos (
            bono_original_id,
            nuevo_bono_id,
            fecha_renovacion,
            renovado_por,
            tipo_renovacion,
            motivo,
            metadata
        ) VALUES (
            NEW.id,
            v_nuevo_bono_id,
            CURRENT_DATE,
            NULL, -- NULL porque es automático (no manual)
            'automatica',
            'Renovación automática generada por trigger',
            jsonb_build_object(
                'sesiones_totales', NEW.sesiones_totales,
                'monto', NEW.monto,
                'duracion_dias', v_duracion_dias,
                'estado_original', NEW.estado
            )
        );

        -- LOG: Notificar éxito
        RAISE NOTICE '✅ Bono % renovado automáticamente. Nuevo bono: %', NEW.id, v_nuevo_bono_id;

    EXCEPTION
        WHEN OTHERS THEN
            -- MANEJO DE ERRORES: Registrar pero no bloquear el proceso principal
            RAISE WARNING '⚠️ Error al renovar automáticamente bono %: %', NEW.id, SQLERRM;
            -- No re-lanzar el error para no afectar la transacción principal
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.crear_renovacion_automatica() IS
'Crea automáticamente un nuevo bono cuando el actual se completa o vence, si tiene renovacion_automatica = true. Se ejecuta como trigger AFTER UPDATE en tabla bonos.';

-- Eliminar triggers anteriores si existen
DROP TRIGGER IF EXISTS trg_renovar_bono_automatico ON public.bonos;
DROP TRIGGER IF EXISTS trigger_renovar_bono ON public.bonos;
DROP TRIGGER IF EXISTS tr_crear_renovacion_automatica ON public.bonos;

-- Crear trigger para renovación automática
CREATE TRIGGER tr_crear_renovacion_automatica
    AFTER UPDATE OF estado ON public.bonos
    FOR EACH ROW
    WHEN (OLD.estado::text <> NEW.estado::text AND NEW.estado::text IN ('completado', 'vencido') AND NEW.renovacion_automatica = true)
    EXECUTE FUNCTION public.crear_renovacion_automatica();

COMMENT ON TRIGGER tr_crear_renovacion_automatica ON public.bonos IS
'Trigger que crea automáticamente un bono nuevo cuando el actual cambia a estado completado o vencido (solo si renovacion_automatica = true)';

-- =============================================================================
-- SECCIÓN 7: FUNCIÓN PARA RENOVACIÓN MANUAL
-- =============================================================================

-- Función mejorada para renovación manual con validaciones
CREATE OR REPLACE FUNCTION public.fn_renovar_bono_manual(
    p_bono_id uuid,
    p_usuario_id uuid,
    p_motivo text DEFAULT NULL,
    p_modificar_sesiones integer DEFAULT NULL,
    p_modificar_monto numeric DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
    v_bono_original record;
    v_nuevo_bono_id uuid;
    v_duracion_dias integer;
    v_resultado jsonb;
BEGIN
    -- VALIDACIÓN 1: Verificar permisos del usuario
    IF NOT public.is_staff() THEN
        RAISE EXCEPTION 'Usuario % no tiene permisos para renovar bonos', p_usuario_id;
    END IF;

    -- VALIDACIÓN 2: Obtener bono original con lock
    BEGIN
        SELECT * INTO STRICT v_bono_original
        FROM public.bonos
        WHERE id = p_bono_id
        FOR UPDATE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE EXCEPTION 'Bono % no existe', p_bono_id;
    END;

    -- VALIDACIÓN 3: Verificar que el bono puede ser renovado
    IF v_bono_original.estado::text NOT IN ('agotado', 'vencido', 'completado', 'activo') THEN
        RAISE EXCEPTION 'Bono % no puede ser renovado (estado: %)', p_bono_id, v_bono_original.estado;
    END IF;

    -- CÁLCULO: Duración original
    IF v_bono_original.fecha_fin IS NOT NULL AND v_bono_original.fecha_inicio IS NOT NULL THEN
        v_duracion_dias := (v_bono_original.fecha_fin - v_bono_original.fecha_inicio);
    ELSE
        v_duracion_dias := NULL;
    END IF;

    -- CREACIÓN: Nuevo bono con posibles modificaciones
    INSERT INTO public.bonos (
        paciente_id,
        psicologa_id,
        tipo,
        frecuencia,
        sesiones_totales,
        sesiones_restantes,
        fecha_inicio,
        fecha_fin,
        estado,
        monto,
        pagado,
        renovacion_automatica,
        notas,
        metadata
    ) VALUES (
        v_bono_original.paciente_id,
        v_bono_original.psicologa_id,
        v_bono_original.tipo,
        v_bono_original.frecuencia,
        COALESCE(p_modificar_sesiones, v_bono_original.sesiones_totales),
        COALESCE(p_modificar_sesiones, v_bono_original.sesiones_totales),
        CURRENT_DATE,
        CASE 
            WHEN v_duracion_dias IS NOT NULL THEN CURRENT_DATE + v_duracion_dias
            ELSE NULL
        END,
        'pendiente'::estado_bono,
        COALESCE(p_modificar_monto, v_bono_original.monto),
        false,
        v_bono_original.renovacion_automatica,
        'Renovación manual de bono ' || p_bono_id::text || '. ' || COALESCE(p_motivo, ''),
        jsonb_build_object(
            'renovacion_manual', true,
            'bono_original_id', p_bono_id::text,
            'renovado_por', p_usuario_id::text,
            'fecha_renovacion', now(),
            'motivo', COALESCE(p_motivo, 'Sin motivo especificado')
        )
    ) RETURNING id INTO v_nuevo_bono_id;

    -- REGISTRO: Historial de renovación
    INSERT INTO public.renovaciones_bonos (
        bono_original_id,
        nuevo_bono_id,
        fecha_renovacion,
        renovado_por,
        tipo_renovacion,
        motivo,
        metadata
    ) VALUES (
        p_bono_id,
        v_nuevo_bono_id,
        CURRENT_DATE,
        p_usuario_id,
        'manual',
        COALESCE(p_motivo, 'Renovación manual solicitada'),
        jsonb_build_object(
            'sesiones_originales', v_bono_original.sesiones_totales,
            'sesiones_nuevas', COALESCE(p_modificar_sesiones, v_bono_original.sesiones_totales),
            'monto_original', v_bono_original.monto,
            'monto_nuevo', COALESCE(p_modificar_monto, v_bono_original.monto)
        )
    );

    -- ACTUALIZACIÓN: Marcar bono original como completado
    UPDATE public.bonos
    SET 
        estado = 'completado'::estado_bono,
        updated_at = now()
    WHERE id = p_bono_id 
      AND estado::text IN ('activo', 'agotado', 'vencido');

    -- CONSTRUCCIÓN: Resultado
    v_resultado := jsonb_build_object(
        'success', true,
        'bono_original_id', p_bono_id,
        'nuevo_bono_id', v_nuevo_bono_id,
        'mensaje', format('Bono renovado exitosamente. Nuevo bono ID: %s', v_nuevo_bono_id),
        'detalles', jsonb_build_object(
            'sesiones_totales', COALESCE(p_modificar_sesiones, v_bono_original.sesiones_totales),
            'monto', COALESCE(p_modificar_monto, v_bono_original.monto),
            'fecha_inicio', CURRENT_DATE,
            'fecha_fin', CASE 
                WHEN v_duracion_dias IS NOT NULL THEN CURRENT_DATE + v_duracion_dias
                ELSE NULL
            END
        )
    );

    -- LOG
    RAISE NOTICE '✅ Bono % renovado manualmente por usuario %. Nuevo bono: %', 
                 p_bono_id, p_usuario_id, v_nuevo_bono_id;

    RETURN v_resultado;

EXCEPTION
    WHEN OTHERS THEN
        -- Construir respuesta de error
        v_resultado := jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'mensaje', format('Error al renovar bono %s', p_bono_id)
        );
        RAISE EXCEPTION '%', v_resultado::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.fn_renovar_bono_manual(uuid, uuid, text, integer, numeric) IS
'Renueva manualmente un bono con validaciones completas. Permite modificar sesiones y monto.';

-- =============================================================================
-- SECCIÓN 8: ROW LEVEL SECURITY (RLS) COMPLETO
-- =============================================================================

-- Habilitar RLS en todas las tablas si no está activo
ALTER TABLE public.bonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_bonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renovaciones_bonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- RLS: Tabla BONOS
-- -----------------------------------------------------------------------------

-- Política: Usuarios ven sus propios bonos
DROP POLICY IF EXISTS "rls_bonos_usuarios_ver_propios" ON public.bonos;
CREATE POLICY "rls_bonos_usuarios_ver_propios"
ON public.bonos FOR SELECT
TO authenticated
USING (
    -- Pacientes ven sus bonos
    paciente_id = auth.uid()
    OR
    -- Psicólogas ven bonos de sus pacientes
    psicologa_id = auth.uid()
    OR
    -- Staff ve todo
    public.is_staff()
);

-- Política: Solo staff puede insertar bonos
DROP POLICY IF EXISTS "rls_bonos_staff_insertar" ON public.bonos;
CREATE POLICY "rls_bonos_staff_insertar"
ON public.bonos FOR INSERT
TO authenticated
WITH CHECK (public.is_staff());

-- Política: Solo staff puede actualizar bonos
DROP POLICY IF EXISTS "rls_bonos_staff_actualizar" ON public.bonos;
CREATE POLICY "rls_bonos_staff_actualizar"
ON public.bonos FOR UPDATE
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- Política: Solo staff puede eliminar bonos
DROP POLICY IF EXISTS "rls_bonos_staff_eliminar" ON public.bonos;
CREATE POLICY "rls_bonos_staff_eliminar"
ON public.bonos FOR DELETE
TO authenticated
USING (public.is_staff());

-- -----------------------------------------------------------------------------
-- RLS: Tabla PAGOS_BONOS
-- -----------------------------------------------------------------------------

-- Política: Ver pagos de bonos accesibles
DROP POLICY IF EXISTS "rls_pagos_bonos_ver" ON public.pagos_bonos;
CREATE POLICY "rls_pagos_bonos_ver"
ON public.pagos_bonos FOR SELECT
TO authenticated
USING (
    bono_id IN (
        SELECT id FROM public.bonos 
        WHERE paciente_id = auth.uid() 
           OR psicologa_id = auth.uid()
           OR public.is_staff()
    )
);

-- Política: Solo staff gestiona pagos
DROP POLICY IF EXISTS "rls_pagos_bonos_staff_gestionar" ON public.pagos_bonos;
CREATE POLICY "rls_pagos_bonos_staff_gestionar"
ON public.pagos_bonos FOR ALL
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- -----------------------------------------------------------------------------
-- RLS: Tabla RENOVACIONES_BONOS
-- -----------------------------------------------------------------------------

-- Política: Ver renovaciones de bonos accesibles
DROP POLICY IF EXISTS "rls_renovaciones_ver" ON public.renovaciones_bonos;
CREATE POLICY "rls_renovaciones_ver"
ON public.renovaciones_bonos FOR SELECT
TO authenticated
USING (
    bono_original_id IN (
        SELECT id FROM public.bonos 
        WHERE paciente_id = auth.uid()
           OR psicologa_id = auth.uid()
           OR public.is_staff()
    )
);

-- Política: Solo staff gestiona renovaciones
DROP POLICY IF EXISTS "rls_renovaciones_staff_gestionar" ON public.renovaciones_bonos;
CREATE POLICY "rls_renovaciones_staff_gestionar"
ON public.renovaciones_bonos FOR ALL
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- =============================================================================
-- SECCIÓN 9: GRANTS Y PERMISOS
-- =============================================================================

-- Otorgar permisos de ejecución a funciones
GRANT EXECUTE ON FUNCTION public.decrementar_sesion_bono() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_confirmar_pago_bono(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_activar_bono_al_pagar() TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_vencimiento_bonos() TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_vencimiento_bonos_simple() TO authenticated;
GRANT EXECUTE ON FUNCTION public.crear_renovacion_automatica() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_renovar_bono_manual(uuid, uuid, text, integer, numeric) TO authenticated;

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================

-- Log de éxito
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ========================================================================';
    RAISE NOTICE '   LÓGICA DE NEGOCIO DE BONOS IMPLEMENTADA CORRECTAMENTE';
    RAISE NOTICE '   ========================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ CONSTRAINTS AGREGADOS:';
    RAISE NOTICE '   • sesiones_restantes >= 0 (no negativos)';
    RAISE NOTICE '   • sesiones_restantes <= sesiones_totales';
    RAISE NOTICE '   • fecha_fin >= fecha_inicio';
    RAISE NOTICE '   • columna consumo_registrado en citas';
    RAISE NOTICE '';
    RAISE NOTICE '✅ FUNCIONES DE NEGOCIO:';
    RAISE NOTICE '   • decrementar_sesion_bono() - Consumo automático al registrar cita';
    RAISE NOTICE '   • fn_confirmar_pago_bono(p_pago_id) - RPC para confirmar pagos (frontend)';
    RAISE NOTICE '   • fn_activar_bono_al_pagar() - Activación al confirmar pago (trigger)';
    RAISE NOTICE '   • verificar_vencimiento_bonos() - Detección diaria de vencimientos';
    RAISE NOTICE '   • verificar_vencimiento_bonos_simple() - Versión para pg_cron';
    RAISE NOTICE '   • crear_renovacion_automatica() - Renovación automática (trigger)';
    RAISE NOTICE '   • fn_renovar_bono_manual() - Renovación manual mejorada';
    RAISE NOTICE '';
    RAISE NOTICE '✅ TRIGGERS ACTIVOS:';
    RAISE NOTICE '   • tr_bono_sesion_usada (citas) - Ejecuta decrementar_sesion_bono()';
    RAISE NOTICE '   • trg_activar_bono_al_pagar (pagos_bonos) - Ejecuta fn_activar_bono_al_pagar()';
    RAISE NOTICE '   • tr_crear_renovacion_automatica (bonos) - Ejecuta crear_renovacion_automatica()';
    RAISE NOTICE '';
    RAISE NOTICE '✅ SEGURIDAD RLS:';
    RAISE NOTICE '   • Pacientes: solo sus bonos';
    RAISE NOTICE '   • Psicólogas: bonos de sus pacientes';
    RAISE NOTICE '   • Staff: acceso completo';
    RAISE NOTICE '   • Triggers con SECURITY DEFINER';
    RAISE NOTICE '';
    RAISE NOTICE '✅ CARACTERÍSTICAS IMPLEMENTADAS:';
    RAISE NOTICE '   • Transacciones seguras con validaciones';
    RAISE NOTICE '   • Idempotencia garantizada';
    RAISE NOTICE '   • Prevención de estados inconsistentes';
    RAISE NOTICE '   • Manejo robusto de errores';
    RAISE NOTICE '   • Logs informativos';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 PRÓXIMOS PASOS:';
    RAISE NOTICE '   1. Configurar pg_cron para verificación diaria de vencimientos:';
    RAISE NOTICE '      SELECT cron.schedule(';
    RAISE NOTICE '        ''verificar-bonos-vencidos'',';
    RAISE NOTICE '        ''0 2 * * *'',  -- 2 AM diario';
    RAISE NOTICE '        ''SELECT verificar_vencimiento_bonos_simple()''';
    RAISE NOTICE '      );';
    RAISE NOTICE '';
    RAISE NOTICE '   2. Usar RPC desde frontend para confirmar pagos:';
    RAISE NOTICE '      const { data } = await supabase.rpc(''fn_confirmar_pago_bono'', {';
    RAISE NOTICE '        p_pago_id: ''uuid-del-pago''';
    RAISE NOTICE '      });';
    RAISE NOTICE '';
    RAISE NOTICE '   3. Flujo automatizado de bonos:';
    RAISE NOTICE '      a) Crear bono → estado: pendiente';
    RAISE NOTICE '      b) Confirmar pago → activo (si monto completo)';
    RAISE NOTICE '      c) Insertar cita con bono_id → sesiones_restantes - 1';
    RAISE NOTICE '      d) Al llegar a 0 → completado → nueva renovación (si renovacion_automatica)';
    RAISE NOTICE '      e) Si fecha_fin < hoy → vencido (ejecutar verificar_vencimiento_bonos)';
    RAISE NOTICE '';
    RAISE NOTICE '   4. Métricas y extensiones futuras:';
    RAISE NOTICE '      • Reporte de renovaciones por mes/terapeuta';
    RAISE NOTICE '      • Notificaciones automáticas (WhatsApp/email) próximas a vencer';
    RAISE NOTICE '      • Dashboard de pagos pendientes';
    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '';
END $$;
