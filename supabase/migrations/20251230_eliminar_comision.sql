-- ============================================================================
-- MIGRACIÓN: Eliminar Comisión de Plataforma
-- ============================================================================
-- Fecha: 30 de diciembre de 2025
-- Objetivo: Eliminar el sistema de comisiones - Los terapeutas reciben el 100%
-- ============================================================================

-- ============================================================================
-- PASO 1: Eliminar la vista existente que referencia porcentaje_comision
-- ============================================================================

DROP VIEW IF EXISTS vista_resumen_financiero_terapeuta;

-- ============================================================================
-- PASO 2: Eliminar columna porcentaje_comision de terapeutas
-- ============================================================================

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name='terapeutas' AND column_name='porcentaje_comision') THEN
        ALTER TABLE public.terapeutas DROP COLUMN porcentaje_comision;
        RAISE NOTICE '✅ Columna porcentaje_comision eliminada de terapeutas';
    ELSE
        RAISE NOTICE 'ℹ️ Columna porcentaje_comision no existe, nada que eliminar';
    END IF;
END $$;

-- ============================================================================
-- PASO 3: Recrear la vista SIN la columna porcentaje_comision
-- ============================================================================

CREATE VIEW vista_resumen_financiero_terapeuta AS
SELECT
    t.id as terapeuta_id,
    t.nombre_completo as terapeuta_nombre,
    t.precio_sesion_base,

    -- Sesiones de esta semana
    COUNT(c.id) FILTER (
        WHERE c.fecha_cita >= date_trunc('week', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('week', CURRENT_DATE) + interval '7 days'
    ) as sesiones_semana,

    -- Ingresos esta semana (pagados) - 100% para el terapeuta
    COALESCE(SUM(c.precio_sesion) FILTER (
        WHERE c.estado_pago = 'pagado'
        AND c.fecha_cita >= date_trunc('week', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('week', CURRENT_DATE) + interval '7 days'
    ), 0) as ingresos_semana_cobrados,

    -- Ingresos esta semana (pendientes)
    COALESCE(SUM(c.precio_sesion) FILTER (
        WHERE c.estado_pago = 'pendiente'
        AND c.estado IN ('confirmada', 'realizada')
        AND c.fecha_cita >= date_trunc('week', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('week', CURRENT_DATE) + interval '7 days'
    ), 0) as ingresos_semana_pendientes,

    -- Sesiones de este mes
    COUNT(c.id) FILTER (
        WHERE c.fecha_cita >= date_trunc('month', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('month', CURRENT_DATE) + interval '1 month'
    ) as sesiones_mes,

    -- Ingresos este mes (pagados) - 100% para el terapeuta
    COALESCE(SUM(c.precio_sesion) FILTER (
        WHERE c.estado_pago = 'pagado'
        AND c.fecha_cita >= date_trunc('month', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('month', CURRENT_DATE) + interval '1 month'
    ), 0) as ingresos_mes_cobrados,

    -- Ingresos este mes (pendientes)
    COALESCE(SUM(c.precio_sesion) FILTER (
        WHERE c.estado_pago = 'pendiente'
        AND c.estado IN ('confirmada', 'realizada')
        AND c.fecha_cita >= date_trunc('month', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('month', CURRENT_DATE) + interval '1 month'
    ), 0) as ingresos_mes_pendientes,

    -- Sesiones bonificadas este mes (cubiertas por bonos)
    COUNT(c.id) FILTER (
        WHERE c.estado_pago = 'bonificado'
        AND c.fecha_cita >= date_trunc('month', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('month', CURRENT_DATE) + interval '1 month'
    ) as sesiones_bonificadas_mes

FROM public.terapeutas t
LEFT JOIN public.citas c ON t.id = c.terapeuta_id
GROUP BY t.id, t.nombre_completo, t.precio_sesion_base;

COMMENT ON VIEW vista_resumen_financiero_terapeuta IS 'Resumen financiero agregado por terapeuta con métricas semanales y mensuales - Sin comisiones';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ COMISIÓN ELIMINADA';
    RAISE NOTICE '========================================';
    RAISE NOTICE '• Los terapeutas reciben el 100%% de sus sesiones';
    RAISE NOTICE '• Sin retención de plataforma';
    RAISE NOTICE '========================================';
END $$;
