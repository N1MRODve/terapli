-- ============================================================================
-- MIGRACIÓN: Configuración de Pagos para Terapeutas
-- ============================================================================
-- Fecha: 26 de diciembre de 2025
-- Objetivo: Agregar campos de configuración de tarifas y pagos a la tabla terapeutas
-- ============================================================================

-- ============================================================================
-- PASO 1: Agregar columnas de configuración de precios a terapeutas
-- ============================================================================

DO $$ BEGIN
    -- Precio base por sesión individual
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='terapeutas' AND column_name='precio_sesion_base') THEN
        ALTER TABLE public.terapeutas
        ADD COLUMN precio_sesion_base numeric(10, 2) DEFAULT 50.00;
        COMMENT ON COLUMN public.terapeutas.precio_sesion_base IS 'Precio base por sesión individual en euros';
    END IF;

    -- Duración estándar de sesión en minutos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='terapeutas' AND column_name='duracion_sesion_minutos') THEN
        ALTER TABLE public.terapeutas
        ADD COLUMN duracion_sesion_minutos integer DEFAULT 60;
        COMMENT ON COLUMN public.terapeutas.duracion_sesion_minutos IS 'Duración estándar de sesión en minutos';
    END IF;

    -- Porcentaje de comisión de la plataforma (lo que retiene Teraplí)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='terapeutas' AND column_name='porcentaje_comision') THEN
        ALTER TABLE public.terapeutas
        ADD COLUMN porcentaje_comision numeric(5, 2) DEFAULT 30.00;
        COMMENT ON COLUMN public.terapeutas.porcentaje_comision IS 'Porcentaje de comisión de la plataforma (ej: 30.00 = 30%)';
    END IF;

    -- Métodos de pago aceptados (array de strings)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='terapeutas' AND column_name='metodos_pago_aceptados') THEN
        ALTER TABLE public.terapeutas
        ADD COLUMN metodos_pago_aceptados text[] DEFAULT ARRAY['efectivo', 'transferencia', 'bizum'];
        COMMENT ON COLUMN public.terapeutas.metodos_pago_aceptados IS 'Array de métodos de pago aceptados';
    END IF;

    -- Configuración de bonos predefinidos (JSON con precios de cada tipo de bono)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='terapeutas' AND column_name='configuracion_bonos') THEN
        ALTER TABLE public.terapeutas
        ADD COLUMN configuracion_bonos jsonb DEFAULT '{
            "semanal": {"sesiones": 4, "precio": 180, "descuento_porcentaje": 10},
            "quincenal": {"sesiones": 2, "precio": 95, "descuento_porcentaje": 5},
            "mensual": {"sesiones": 4, "precio": 180, "descuento_porcentaje": 10}
        }'::jsonb;
        COMMENT ON COLUMN public.terapeutas.configuracion_bonos IS 'Configuración de precios y sesiones para cada tipo de bono';
    END IF;

    RAISE NOTICE '✅ Columnas de configuración de precios agregadas a terapeutas';
END $$;

-- ============================================================================
-- PASO 2: Agregar campos de pago a la tabla citas (para sesiones individuales)
-- ============================================================================

DO $$ BEGIN
    -- Precio de la sesión (puede ser diferente al precio base)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='citas' AND column_name='precio_sesion') THEN
        ALTER TABLE public.citas
        ADD COLUMN precio_sesion numeric(10, 2);
        COMMENT ON COLUMN public.citas.precio_sesion IS 'Precio de esta sesión específica (puede diferir del precio base)';
    END IF;

    -- Estado de pago de la sesión
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='citas' AND column_name='estado_pago') THEN
        ALTER TABLE public.citas
        ADD COLUMN estado_pago text DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'bonificado', 'cancelado'));
        COMMENT ON COLUMN public.citas.estado_pago IS 'Estado del pago: pendiente, pagado, bonificado (usó bono), cancelado';
    END IF;

    -- Método de pago utilizado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='citas' AND column_name='metodo_pago') THEN
        ALTER TABLE public.citas
        ADD COLUMN metodo_pago text CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'bizum', 'paypal', 'bono', 'otro'));
        COMMENT ON COLUMN public.citas.metodo_pago IS 'Método de pago utilizado para esta sesión';
    END IF;

    -- Fecha de pago
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='citas' AND column_name='fecha_pago') THEN
        ALTER TABLE public.citas
        ADD COLUMN fecha_pago timestamptz;
        COMMENT ON COLUMN public.citas.fecha_pago IS 'Fecha y hora en que se registró el pago';
    END IF;

    -- Notas de pago
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='citas' AND column_name='notas_pago') THEN
        ALTER TABLE public.citas
        ADD COLUMN notas_pago text;
        COMMENT ON COLUMN public.citas.notas_pago IS 'Notas adicionales sobre el pago';
    END IF;

    RAISE NOTICE '✅ Columnas de pago agregadas a citas';
END $$;

-- ============================================================================
-- PASO 3: Trigger para auto-establecer precio en citas nuevas
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_set_precio_cita()
RETURNS TRIGGER AS $$
DECLARE
    precio_base numeric(10, 2);
BEGIN
    -- Solo establecer precio si no viene especificado
    IF NEW.precio_sesion IS NULL THEN
        -- Obtener precio base del terapeuta
        SELECT precio_sesion_base INTO precio_base
        FROM public.terapeutas
        WHERE id = NEW.terapeuta_id;

        -- Usar precio del terapeuta o default de 50€
        NEW.precio_sesion := COALESCE(precio_base, 50.00);
    END IF;

    -- Si la cita usa bono, marcar como bonificado
    IF NEW.bono_id IS NOT NULL AND NEW.descontar_de_bono = true THEN
        NEW.estado_pago := 'bonificado';
        NEW.metodo_pago := 'bono';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger solo si no existe
DROP TRIGGER IF EXISTS tr_set_precio_cita ON public.citas;
CREATE TRIGGER tr_set_precio_cita
    BEFORE INSERT ON public.citas
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_precio_cita();

COMMENT ON FUNCTION fn_set_precio_cita() IS 'Establece automáticamente el precio de la sesión basado en la configuración del terapeuta';

-- ============================================================================
-- PASO 4: Función RPC para registrar pago de sesión
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_registrar_pago_sesion(
    p_cita_id uuid,
    p_metodo_pago text,
    p_monto numeric DEFAULT NULL,
    p_notas text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
    v_cita RECORD;
    v_resultado jsonb;
BEGIN
    -- Obtener información de la cita
    SELECT
        c.id,
        c.estado,
        c.estado_pago,
        c.precio_sesion,
        c.bono_id,
        c.paciente_id,
        c.terapeuta_id,
        p.nombre_completo as paciente_nombre
    INTO v_cita
    FROM public.citas c
    LEFT JOIN public.pacientes p ON c.paciente_id = p.id
    WHERE c.id = p_cita_id;

    -- Validaciones
    IF v_cita.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cita no encontrada'
        );
    END IF;

    IF v_cita.estado_pago = 'pagado' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Esta sesión ya está pagada'
        );
    END IF;

    IF v_cita.estado_pago = 'bonificado' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Esta sesión fue cubierta por un bono'
        );
    END IF;

    -- Registrar el pago
    UPDATE public.citas
    SET
        estado_pago = 'pagado',
        metodo_pago = p_metodo_pago,
        precio_sesion = COALESCE(p_monto, precio_sesion),
        fecha_pago = now(),
        notas_pago = p_notas,
        updated_at = now()
    WHERE id = p_cita_id;

    -- Retornar resultado
    RETURN jsonb_build_object(
        'success', true,
        'mensaje', 'Pago registrado correctamente',
        'cita_id', p_cita_id,
        'monto', COALESCE(p_monto, v_cita.precio_sesion),
        'metodo_pago', p_metodo_pago,
        'paciente', v_cita.paciente_nombre
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_registrar_pago_sesion IS 'Registra el pago de una sesión individual';

-- Permisos para la función
GRANT EXECUTE ON FUNCTION fn_registrar_pago_sesion TO authenticated;

-- ============================================================================
-- PASO 5: Vista para resumen financiero del terapeuta
-- ============================================================================

CREATE OR REPLACE VIEW vista_resumen_financiero_terapeuta AS
SELECT
    t.id as terapeuta_id,
    t.nombre_completo as terapeuta_nombre,
    t.precio_sesion_base,
    t.porcentaje_comision,

    -- Sesiones de esta semana
    COUNT(c.id) FILTER (
        WHERE c.fecha_cita >= date_trunc('week', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('week', CURRENT_DATE) + interval '7 days'
    ) as sesiones_semana,

    -- Ingresos esta semana (pagados)
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

    -- Ingresos este mes (pagados)
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
GROUP BY t.id, t.nombre_completo, t.precio_sesion_base, t.porcentaje_comision;

COMMENT ON VIEW vista_resumen_financiero_terapeuta IS 'Resumen financiero agregado por terapeuta con métricas semanales y mensuales';

-- ============================================================================
-- PASO 6: Actualizar citas existentes con precio si no tienen
-- ============================================================================

DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Actualizar citas sin precio usando el precio base del terapeuta
    UPDATE public.citas c
    SET precio_sesion = COALESCE(
        (SELECT precio_sesion_base FROM public.terapeutas t WHERE t.id = c.terapeuta_id),
        50.00
    )
    WHERE c.precio_sesion IS NULL;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✅ Actualizadas % citas con precio de sesión', updated_count;

    -- Marcar citas con bono como bonificadas
    UPDATE public.citas
    SET
        estado_pago = 'bonificado',
        metodo_pago = 'bono'
    WHERE bono_id IS NOT NULL
    AND descontar_de_bono = true
    AND estado_pago IS NULL;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✅ Marcadas % citas como bonificadas', updated_count;

    -- Establecer estado pendiente para el resto
    UPDATE public.citas
    SET estado_pago = 'pendiente'
    WHERE estado_pago IS NULL;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✅ Establecidas % citas con estado de pago pendiente', updated_count;
END $$;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

DO $$
DECLARE
    col_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 VERIFICACIÓN DE MIGRACIÓN';
    RAISE NOTICE '========================================';

    -- Verificar columnas en terapeutas
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'terapeutas'
    AND column_name IN ('precio_sesion_base', 'duracion_sesion_minutos', 'porcentaje_comision', 'metodos_pago_aceptados', 'configuracion_bonos');

    RAISE NOTICE '✓ Columnas de configuración en terapeutas: %/5', col_count;

    -- Verificar columnas en citas
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'citas'
    AND column_name IN ('precio_sesion', 'estado_pago', 'metodo_pago', 'fecha_pago', 'notas_pago');

    RAISE NOTICE '✓ Columnas de pago en citas: %/5', col_count;

    -- Verificar función RPC
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_registrar_pago_sesion') THEN
        RAISE NOTICE '✓ Función fn_registrar_pago_sesion creada';
    END IF;

    -- Verificar vista
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'vista_resumen_financiero_terapeuta') THEN
        RAISE NOTICE '✓ Vista vista_resumen_financiero_terapeuta creada';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '========================================';
END $$;
