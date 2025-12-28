-- ============================================================================
-- MIGRACION: Auto-completar Citas Pasadas
-- ============================================================================
-- Fecha: 26 de diciembre de 2025
-- Objetivo: Crear funcion para marcar automaticamente como realizadas las citas
--           pasadas que no fueron marcadas manualmente por el terapeuta
-- ============================================================================

-- ============================================================================
-- PASO 1: Funcion para auto-completar citas pasadas de un terapeuta
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_auto_completar_citas_pasadas(
    p_terapeuta_id uuid DEFAULT NULL,
    p_dias_atras integer DEFAULT 1
)
RETURNS jsonb AS $$
DECLARE
    v_fecha_limite date;
    v_citas_actualizadas integer := 0;
    v_cita record;
BEGIN
    -- Calcular fecha limite (por defecto, citas de ayer o antes)
    v_fecha_limite := CURRENT_DATE - p_dias_atras;

    -- Actualizar citas pasadas que estan pendientes o confirmadas
    -- y que no fueron marcadas como realizadas o canceladas
    UPDATE public.citas
    SET
        estado = 'realizada',
        estado_pago = CASE
            WHEN estado_pago IS NULL OR estado_pago = '' THEN 'pendiente'
            ELSE estado_pago
        END,
        updated_at = NOW(),
        notas_internas = COALESCE(notas_internas, '') ||
            CASE WHEN notas_internas IS NOT NULL AND notas_internas != '' THEN E'\n' ELSE '' END ||
            '[Auto-completada el ' || TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI') || ']'
    WHERE
        fecha_cita <= v_fecha_limite
        AND estado IN ('pendiente', 'confirmada')
        AND (p_terapeuta_id IS NULL OR terapeuta_id = p_terapeuta_id);

    GET DIAGNOSTICS v_citas_actualizadas = ROW_COUNT;

    -- Registrar en log si hay alguna tabla de auditoria
    -- (opcional, se puede agregar despues)

    RETURN jsonb_build_object(
        'success', true,
        'citas_actualizadas', v_citas_actualizadas,
        'fecha_limite', v_fecha_limite,
        'terapeuta_id', p_terapeuta_id,
        'mensaje', CASE
            WHEN v_citas_actualizadas = 0 THEN 'No habia citas pendientes de completar'
            WHEN v_citas_actualizadas = 1 THEN '1 cita marcada como realizada'
            ELSE v_citas_actualizadas || ' citas marcadas como realizadas'
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_auto_completar_citas_pasadas IS
'Marca automaticamente como realizadas las citas pasadas que no fueron marcadas manualmente.
Establece estado_pago como pendiente si no hay pago registrado.
Parametros:
- p_terapeuta_id: UUID del terapeuta (NULL para todos los terapeutas)
- p_dias_atras: Numero de dias atras desde hoy (default 1 = ayer)';

-- Permisos
GRANT EXECUTE ON FUNCTION fn_auto_completar_citas_pasadas TO authenticated;

-- ============================================================================
-- PASO 2: Funcion para ejecutar diariamente (cron job)
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_cron_auto_completar_citas()
RETURNS jsonb AS $$
DECLARE
    v_resultado jsonb;
BEGIN
    -- Ejecutar auto-completar para todas las citas de ayer o antes
    v_resultado := fn_auto_completar_citas_pasadas(NULL, 1);

    -- Log opcional
    RAISE NOTICE 'Cron auto-completar citas: %', v_resultado::text;

    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_cron_auto_completar_citas IS
'Funcion para ser ejecutada por un cron job diario.
Marca como realizadas todas las citas de ayer o antes que siguen pendientes/confirmadas.';

-- Permisos (solo service_role deberia poder ejecutar el cron)
GRANT EXECUTE ON FUNCTION fn_cron_auto_completar_citas TO service_role;

-- ============================================================================
-- PASO 3: Funcion para obtener citas pendientes de marcar como realizadas
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_obtener_citas_sin_completar(
    p_terapeuta_id uuid DEFAULT NULL,
    p_dias_atras integer DEFAULT 7
)
RETURNS TABLE (
    cita_id uuid,
    fecha_cita date,
    hora_inicio time,
    hora_fin time,
    paciente_id uuid,
    paciente_nombre text,
    estado text,
    estado_pago text,
    dias_pasados integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id as cita_id,
        c.fecha_cita,
        c.hora_inicio,
        c.hora_fin,
        c.paciente_id,
        p.nombre_completo as paciente_nombre,
        c.estado,
        c.estado_pago,
        (CURRENT_DATE - c.fecha_cita)::integer as dias_pasados
    FROM public.citas c
    LEFT JOIN public.pacientes p ON c.paciente_id = p.id
    WHERE
        c.fecha_cita <= CURRENT_DATE - 1
        AND c.fecha_cita >= CURRENT_DATE - p_dias_atras
        AND c.estado IN ('pendiente', 'confirmada')
        AND (p_terapeuta_id IS NULL OR c.terapeuta_id = p_terapeuta_id)
    ORDER BY c.fecha_cita DESC, c.hora_inicio ASC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_obtener_citas_sin_completar IS
'Obtiene las citas de los ultimos N dias que aun no han sido marcadas como realizadas o canceladas.
Util para mostrar alertas al terapeuta sobre citas que necesitan atencion.';

-- Permisos
GRANT EXECUTE ON FUNCTION fn_obtener_citas_sin_completar TO authenticated;

-- ============================================================================
-- VERIFICACION FINAL
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACION DE MIGRACION';
    RAISE NOTICE '========================================';

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_auto_completar_citas_pasadas') THEN
        RAISE NOTICE '✓ Funcion fn_auto_completar_citas_pasadas creada';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_cron_auto_completar_citas') THEN
        RAISE NOTICE '✓ Funcion fn_cron_auto_completar_citas creada';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_obtener_citas_sin_completar') THEN
        RAISE NOTICE '✓ Funcion fn_obtener_citas_sin_completar creada';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRACION COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Para ejecutar manualmente:';
    RAISE NOTICE '  SELECT fn_auto_completar_citas_pasadas();';
    RAISE NOTICE '';
    RAISE NOTICE 'Para ver citas sin completar:';
    RAISE NOTICE '  SELECT * FROM fn_obtener_citas_sin_completar();';
    RAISE NOTICE '';
    RAISE NOTICE 'Nota: Configure un cron job en Supabase para ejecutar';
    RAISE NOTICE '      fn_cron_auto_completar_citas() diariamente.';
    RAISE NOTICE '';
END $$;
