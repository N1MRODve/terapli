-- ============================================================================
-- MIGRACIÓN: Precios por Frecuencia y Plantillas de Bonos
-- ============================================================================
-- Fecha: 26 de diciembre de 2025
-- Objetivo: Agregar campos para precios diferenciados por frecuencia y
--           plantillas de bonos personalizables
-- ============================================================================

-- ============================================================================
-- PASO 1: Agregar columna de precios por frecuencia a terapeutas
-- ============================================================================

DO $$ BEGIN
    -- Precios diferenciados por tipo de frecuencia del paciente
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='terapeutas' AND column_name='precios_frecuencia') THEN
        ALTER TABLE public.terapeutas
        ADD COLUMN precios_frecuencia jsonb DEFAULT '{
            "semanal": 40.00,
            "quincenal": 50.00,
            "unica": 60.00
        }'::jsonb;
        COMMENT ON COLUMN public.terapeutas.precios_frecuencia IS 'Precios por sesión según frecuencia del paciente (semanal, quincenal, única)';
    END IF;

    -- Plantillas de bonos personalizables
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='terapeutas' AND column_name='plantillas_bonos') THEN
        ALTER TABLE public.terapeutas
        ADD COLUMN plantillas_bonos jsonb DEFAULT '[]'::jsonb;
        COMMENT ON COLUMN public.terapeutas.plantillas_bonos IS 'Array de plantillas de bonos personalizadas del terapeuta';
    END IF;

    RAISE NOTICE '✅ Columnas de precios por frecuencia y plantillas de bonos agregadas a terapeutas';
END $$;

-- ============================================================================
-- PASO 2: Actualizar configuración de bonos por defecto con nuevos precios
-- ============================================================================

DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Actualizar terapeutas que tienen la configuración anterior de bonos
    UPDATE public.terapeutas
    SET configuracion_bonos = jsonb_build_object(
        'semanal', jsonb_build_object('sesiones', 4, 'precio', 160, 'descuento_porcentaje', 0),
        'quincenal', jsonb_build_object('sesiones', 4, 'precio', 200, 'descuento_porcentaje', 0),
        'mensual', jsonb_build_object('sesiones', 4, 'precio', 240, 'descuento_porcentaje', 0)
    )
    WHERE configuracion_bonos IS NULL
       OR configuracion_bonos->>'semanal' IS NULL;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✅ Actualizados % terapeutas con configuración de bonos por defecto', updated_count;
END $$;

-- ============================================================================
-- PASO 3: Función para obtener precio según frecuencia del paciente
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_obtener_precio_sesion(
    p_terapeuta_id uuid,
    p_frecuencia text DEFAULT 'unica'
)
RETURNS numeric AS $$
DECLARE
    v_precios jsonb;
    v_precio numeric;
    v_precio_base numeric;
BEGIN
    -- Obtener configuración del terapeuta
    SELECT precios_frecuencia, precio_sesion_base
    INTO v_precios, v_precio_base
    FROM public.terapeutas
    WHERE id = p_terapeuta_id;

    -- Si no hay terapeuta, devolver precio por defecto
    IF v_precios IS NULL THEN
        CASE p_frecuencia
            WHEN 'semanal' THEN RETURN 40.00;
            WHEN 'quincenal' THEN RETURN 50.00;
            ELSE RETURN 60.00;
        END CASE;
    END IF;

    -- Obtener precio según frecuencia
    v_precio := (v_precios->>p_frecuencia)::numeric;

    -- Si no existe el precio para esa frecuencia, usar precio base o default
    IF v_precio IS NULL THEN
        RETURN COALESCE(v_precio_base, 50.00);
    END IF;

    RETURN v_precio;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_obtener_precio_sesion IS 'Obtiene el precio de sesión según la frecuencia del paciente';

-- Permisos
GRANT EXECUTE ON FUNCTION fn_obtener_precio_sesion TO authenticated;

-- ============================================================================
-- PASO 4: Actualizar trigger de citas para usar precio según frecuencia
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_set_precio_cita()
RETURNS TRIGGER AS $$
DECLARE
    v_frecuencia text;
    v_precio numeric;
BEGIN
    -- Solo establecer precio si no viene especificado
    IF NEW.precio_sesion IS NULL THEN
        -- Obtener frecuencia del paciente
        SELECT frecuencia INTO v_frecuencia
        FROM public.pacientes
        WHERE id = NEW.paciente_id;

        -- Mapear frecuencia a tipo de precio
        CASE COALESCE(v_frecuencia, 'unica')
            WHEN 'semanal' THEN v_frecuencia := 'semanal';
            WHEN 'quincenal' THEN v_frecuencia := 'quincenal';
            WHEN 'mensual' THEN v_frecuencia := 'quincenal'; -- Mensual usa precio quincenal
            ELSE v_frecuencia := 'unica';
        END CASE;

        -- Obtener precio según frecuencia
        NEW.precio_sesion := fn_obtener_precio_sesion(NEW.terapeuta_id, v_frecuencia);
    END IF;

    -- Si la cita usa bono, marcar como bonificado
    IF NEW.bono_id IS NOT NULL AND NEW.descontar_de_bono = true THEN
        NEW.estado_pago := 'bonificado';
        NEW.metodo_pago := 'bono';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_set_precio_cita() IS 'Establece automáticamente el precio de la sesión basado en la frecuencia del paciente y configuración del terapeuta';

-- ============================================================================
-- PASO 5: Función para crear bono desde plantilla
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_crear_bono_desde_plantilla(
    p_terapeuta_id uuid,
    p_paciente_id uuid,
    p_plantilla_nombre text,
    p_fecha_inicio date DEFAULT CURRENT_DATE
)
RETURNS jsonb AS $$
DECLARE
    v_plantilla jsonb;
    v_plantillas jsonb;
    v_bono_id uuid;
    v_frecuencia text;
    v_sesiones integer;
    v_precio numeric;
BEGIN
    -- Obtener plantillas del terapeuta
    SELECT plantillas_bonos INTO v_plantillas
    FROM public.terapeutas
    WHERE id = p_terapeuta_id;

    IF v_plantillas IS NULL OR jsonb_array_length(v_plantillas) = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'El terapeuta no tiene plantillas de bonos configuradas'
        );
    END IF;

    -- Buscar la plantilla por nombre
    SELECT elem INTO v_plantilla
    FROM jsonb_array_elements(v_plantillas) elem
    WHERE elem->>'nombre' = p_plantilla_nombre
    LIMIT 1;

    IF v_plantilla IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Plantilla no encontrada: ' || p_plantilla_nombre
        );
    END IF;

    -- Extraer datos de la plantilla
    v_sesiones := (v_plantilla->>'sesiones')::integer;
    v_precio := (v_plantilla->>'precio')::numeric;
    v_frecuencia := COALESCE(v_plantilla->>'frecuencia', 'mensual');

    -- Mapear frecuencia a tipo de bono
    IF v_frecuencia = 'cualquiera' THEN
        v_frecuencia := 'mensual';
    END IF;

    -- Crear el bono
    INSERT INTO public.bonos (
        paciente_id,
        tipo,
        monto_total,
        sesiones_totales,
        sesiones_restantes,
        fecha_inicio,
        fecha_fin,
        estado,
        pagado
    ) VALUES (
        p_paciente_id,
        v_frecuencia,
        v_precio,
        v_sesiones,
        v_sesiones,
        p_fecha_inicio,
        p_fecha_inicio + interval '3 months',
        'activo',
        false
    )
    RETURNING id INTO v_bono_id;

    RETURN jsonb_build_object(
        'success', true,
        'bono_id', v_bono_id,
        'mensaje', 'Bono creado correctamente',
        'plantilla', p_plantilla_nombre,
        'sesiones', v_sesiones,
        'precio', v_precio
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_crear_bono_desde_plantilla IS 'Crea un bono para un paciente basándose en una plantilla del terapeuta';

-- Permisos
GRANT EXECUTE ON FUNCTION fn_crear_bono_desde_plantilla TO authenticated;

-- ============================================================================
-- PASO 6: Función para asignar bono a múltiples pacientes
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_asignar_bono_masivo(
    p_terapeuta_id uuid,
    p_paciente_ids uuid[],
    p_plantilla_nombre text,
    p_fecha_inicio date DEFAULT CURRENT_DATE
)
RETURNS jsonb AS $$
DECLARE
    v_paciente_id uuid;
    v_resultado jsonb;
    v_bonos_creados integer := 0;
    v_errores text[] := ARRAY[]::text[];
    v_bonos_ids uuid[] := ARRAY[]::uuid[];
BEGIN
    -- Validar que hay pacientes
    IF p_paciente_ids IS NULL OR array_length(p_paciente_ids, 1) IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Debes seleccionar al menos un paciente'
        );
    END IF;

    -- Crear bono para cada paciente
    FOREACH v_paciente_id IN ARRAY p_paciente_ids
    LOOP
        v_resultado := fn_crear_bono_desde_plantilla(
            p_terapeuta_id,
            v_paciente_id,
            p_plantilla_nombre,
            p_fecha_inicio
        );

        IF (v_resultado->>'success')::boolean THEN
            v_bonos_creados := v_bonos_creados + 1;
            v_bonos_ids := array_append(v_bonos_ids, (v_resultado->>'bono_id')::uuid);
        ELSE
            v_errores := array_append(v_errores, v_paciente_id::text || ': ' || (v_resultado->>'error'));
        END IF;
    END LOOP;

    -- Retornar resultado
    RETURN jsonb_build_object(
        'success', v_bonos_creados > 0,
        'bonos_creados', v_bonos_creados,
        'total_pacientes', array_length(p_paciente_ids, 1),
        'bonos_ids', v_bonos_ids,
        'errores', v_errores
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_asignar_bono_masivo IS 'Asigna un bono a múltiples pacientes basándose en una plantilla';

-- Permisos
GRANT EXECUTE ON FUNCTION fn_asignar_bono_masivo TO authenticated;

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
    AND column_name IN ('precios_frecuencia', 'plantillas_bonos');

    RAISE NOTICE '✓ Columnas nuevas en terapeutas: %/2', col_count;

    -- Verificar funciones
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_obtener_precio_sesion') THEN
        RAISE NOTICE '✓ Función fn_obtener_precio_sesion creada';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_crear_bono_desde_plantilla') THEN
        RAISE NOTICE '✓ Función fn_crear_bono_desde_plantilla creada';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_asignar_bono_masivo') THEN
        RAISE NOTICE '✓ Función fn_asignar_bono_masivo creada';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Precios por defecto configurados:';
    RAISE NOTICE '  - Semanal: 40.00 EUR';
    RAISE NOTICE '  - Quincenal: 50.00 EUR';
    RAISE NOTICE '  - Sesión única: 60.00 EUR';
    RAISE NOTICE '';
END $$;
