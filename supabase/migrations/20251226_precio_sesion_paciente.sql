-- ============================================================================
-- MIGRACIÓN: Precio de Sesión Personalizado por Paciente + Sesiones Iniciales en Bonos
-- ============================================================================
-- Fecha: 26 de diciembre de 2025
-- Objetivo:
--   1. Agregar campo precio_sesion a pacientes para precio personalizado
--   2. Modificar trigger para usar precio del paciente si existe
--   3. Agregar campo sesiones_usadas a bonos para migración desde otras plataformas
-- ============================================================================

-- ============================================================================
-- PASO 1: Agregar campo precio_sesion a pacientes
-- ============================================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='pacientes' AND column_name='precio_sesion') THEN
        ALTER TABLE public.pacientes
        ADD COLUMN precio_sesion numeric(10,2) DEFAULT NULL;

        COMMENT ON COLUMN public.pacientes.precio_sesion IS
            'Precio personalizado por sesión para este paciente. Si es NULL, se usa el precio del terapeuta según frecuencia.';

        RAISE NOTICE '✅ Campo precio_sesion agregado a pacientes';
    ELSE
        RAISE NOTICE 'ℹ️ Campo precio_sesion ya existe en pacientes';
    END IF;
END $$;

-- ============================================================================
-- PASO 2: Agregar campo sesiones_usadas a bonos (para migración)
-- ============================================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='bonos' AND column_name='sesiones_usadas') THEN
        ALTER TABLE public.bonos
        ADD COLUMN sesiones_usadas integer DEFAULT 0;

        COMMENT ON COLUMN public.bonos.sesiones_usadas IS
            'Número de sesiones ya consumidas. Usado para migración y tracking. sesiones_restantes = sesiones_totales - sesiones_usadas';

        RAISE NOTICE '✅ Campo sesiones_usadas agregado a bonos';
    ELSE
        RAISE NOTICE 'ℹ️ Campo sesiones_usadas ya existe en bonos';
    END IF;
END $$;

-- ============================================================================
-- PASO 3: Actualizar función fn_obtener_precio_sesion para considerar precio del paciente
-- ============================================================================

-- Eliminar versiones anteriores de la función para evitar ambigüedad
DROP FUNCTION IF EXISTS fn_obtener_precio_sesion(uuid, text);
DROP FUNCTION IF EXISTS fn_obtener_precio_sesion(uuid, text, uuid);

CREATE OR REPLACE FUNCTION fn_obtener_precio_sesion(
    p_terapeuta_id uuid,
    p_frecuencia text DEFAULT 'unica',
    p_paciente_id uuid DEFAULT NULL
)
RETURNS numeric AS $$
DECLARE
    v_precio_paciente numeric;
    v_precios jsonb;
    v_precio numeric;
    v_precio_base numeric;
BEGIN
    -- PRIORIDAD 1: Precio personalizado del paciente
    IF p_paciente_id IS NOT NULL THEN
        SELECT precio_sesion INTO v_precio_paciente
        FROM public.pacientes
        WHERE id = p_paciente_id;

        IF v_precio_paciente IS NOT NULL THEN
            RETURN v_precio_paciente;
        END IF;
    END IF;

    -- PRIORIDAD 2: Precio según frecuencia del terapeuta
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

COMMENT ON FUNCTION fn_obtener_precio_sesion(uuid, text, uuid) IS
    'Obtiene el precio de sesión. Prioridad: 1) Precio personalizado del paciente, 2) Precio por frecuencia del terapeuta';

-- ============================================================================
-- PASO 4: Actualizar trigger de citas para usar precio del paciente
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_set_precio_cita()
RETURNS TRIGGER AS $$
DECLARE
    v_frecuencia text;
    v_precio numeric;
    v_precio_paciente numeric;
BEGIN
    -- Solo establecer precio si no viene especificado
    IF NEW.precio_sesion IS NULL THEN

        -- PRIORIDAD 1: Verificar si el paciente tiene precio personalizado
        SELECT precio_sesion INTO v_precio_paciente
        FROM public.pacientes
        WHERE id = NEW.paciente_id;

        IF v_precio_paciente IS NOT NULL THEN
            NEW.precio_sesion := v_precio_paciente;
        ELSE
            -- PRIORIDAD 2: Usar precio según frecuencia del terapeuta
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

            -- Obtener precio según frecuencia (sin pasar paciente_id para evitar recursión)
            NEW.precio_sesion := fn_obtener_precio_sesion(NEW.terapeuta_id, v_frecuencia, NULL);
        END IF;
    END IF;

    -- Si la cita usa bono, marcar como bonificado
    IF NEW.bono_id IS NOT NULL AND NEW.descontar_de_bono = true THEN
        NEW.estado_pago := 'bonificado';
        NEW.metodo_pago := 'bono';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_set_precio_cita() IS
    'Establece automáticamente el precio de la sesión. Usa precio personalizado del paciente si existe, sino precio por frecuencia del terapeuta.';

-- ============================================================================
-- PASO 5: Trigger para sincronizar sesiones_usadas con sesiones_restantes
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_sync_sesiones_bono()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se modifica sesiones_usadas, actualizar sesiones_restantes
    IF TG_OP = 'UPDATE' AND NEW.sesiones_usadas IS DISTINCT FROM OLD.sesiones_usadas THEN
        NEW.sesiones_restantes := NEW.sesiones_totales - COALESCE(NEW.sesiones_usadas, 0);

        -- Actualizar estado si se agotaron
        IF NEW.sesiones_restantes <= 0 THEN
            NEW.estado := 'agotado';
        END IF;
    END IF;

    -- Si se crea un bono con sesiones_usadas, calcular restantes
    IF TG_OP = 'INSERT' AND COALESCE(NEW.sesiones_usadas, 0) > 0 THEN
        NEW.sesiones_restantes := NEW.sesiones_totales - COALESCE(NEW.sesiones_usadas, 0);

        IF NEW.sesiones_restantes <= 0 THEN
            NEW.estado := 'agotado';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS tr_sync_sesiones_bono ON public.bonos;
CREATE TRIGGER tr_sync_sesiones_bono
    BEFORE INSERT OR UPDATE ON public.bonos
    FOR EACH ROW
    EXECUTE FUNCTION fn_sync_sesiones_bono();

COMMENT ON FUNCTION fn_sync_sesiones_bono() IS
    'Sincroniza sesiones_restantes basándose en sesiones_usadas. Útil para migración de datos.';

-- ============================================================================
-- PASO 6: Función para actualizar precio de citas existentes de un paciente
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_actualizar_precios_citas_paciente(
    p_paciente_id uuid,
    p_nuevo_precio numeric DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
    v_precio_usar numeric;
    v_citas_actualizadas integer;
BEGIN
    -- Determinar qué precio usar
    IF p_nuevo_precio IS NOT NULL THEN
        v_precio_usar := p_nuevo_precio;

        -- Actualizar precio del paciente
        UPDATE public.pacientes
        SET precio_sesion = p_nuevo_precio
        WHERE id = p_paciente_id;
    ELSE
        -- Obtener precio actual del paciente
        SELECT precio_sesion INTO v_precio_usar
        FROM public.pacientes
        WHERE id = p_paciente_id;
    END IF;

    IF v_precio_usar IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'El paciente no tiene precio personalizado y no se especificó uno nuevo'
        );
    END IF;

    -- Actualizar citas pendientes o confirmadas (no las ya realizadas/pagadas)
    UPDATE public.citas
    SET precio_sesion = v_precio_usar
    WHERE paciente_id = p_paciente_id
      AND estado IN ('pendiente', 'confirmada')
      AND estado_pago IN ('pendiente', NULL);

    GET DIAGNOSTICS v_citas_actualizadas = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'precio_aplicado', v_precio_usar,
        'citas_actualizadas', v_citas_actualizadas,
        'mensaje', format('Precio actualizado a %s€ en %s citas pendientes', v_precio_usar, v_citas_actualizadas)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_actualizar_precios_citas_paciente IS
    'Actualiza el precio de sesión del paciente y sincroniza con citas pendientes';

GRANT EXECUTE ON FUNCTION fn_actualizar_precios_citas_paciente TO authenticated;

-- ============================================================================
-- PASO 7: Función para crear bono con sesiones ya consumidas (migración)
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_crear_bono_migracion(
    p_paciente_id uuid,
    p_terapeuta_id uuid,
    p_tipo text,
    p_sesiones_totales integer,
    p_sesiones_usadas integer DEFAULT 0,
    p_monto numeric DEFAULT NULL,
    p_estado text DEFAULT 'activo',
    p_fecha_inicio date DEFAULT CURRENT_DATE,
    p_frecuencia text DEFAULT 'semanal'
)
RETURNS jsonb AS $$
DECLARE
    v_bono_id uuid;
    v_sesiones_restantes integer;
    v_estado_final text;
BEGIN
    -- Calcular sesiones restantes
    v_sesiones_restantes := p_sesiones_totales - COALESCE(p_sesiones_usadas, 0);

    -- Determinar estado
    IF v_sesiones_restantes <= 0 THEN
        v_estado_final := 'agotado';
        v_sesiones_restantes := 0;
    ELSE
        v_estado_final := p_estado;
    END IF;

    -- Crear el bono
    INSERT INTO public.bonos (
        paciente_id,
        psicologa_id,
        tipo,
        frecuencia,
        sesiones_totales,
        sesiones_usadas,
        sesiones_restantes,
        monto_total,
        estado,
        pagado,
        fecha_inicio,
        fecha_fin
    ) VALUES (
        p_paciente_id,
        p_terapeuta_id,
        p_tipo,
        p_frecuencia,
        p_sesiones_totales,
        COALESCE(p_sesiones_usadas, 0),
        v_sesiones_restantes,
        COALESCE(p_monto, 0),
        v_estado_final,
        true, -- Asumimos que bonos migrados ya están pagados
        p_fecha_inicio,
        p_fecha_inicio + interval '3 months'
    )
    RETURNING id INTO v_bono_id;

    RETURN jsonb_build_object(
        'success', true,
        'bono_id', v_bono_id,
        'sesiones_totales', p_sesiones_totales,
        'sesiones_usadas', COALESCE(p_sesiones_usadas, 0),
        'sesiones_restantes', v_sesiones_restantes,
        'estado', v_estado_final,
        'mensaje', format('Bono creado con %s/%s sesiones disponibles', v_sesiones_restantes, p_sesiones_totales)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_crear_bono_migracion IS
    'Crea un bono con sesiones ya consumidas. Útil para migración desde otras plataformas como eholo.';

GRANT EXECUTE ON FUNCTION fn_crear_bono_migracion TO authenticated;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

DO $$
DECLARE
    col_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  VERIFICACIÓN DE MIGRACIÓN';
    RAISE NOTICE '========================================';

    -- Verificar columna en pacientes
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'pacientes' AND column_name = 'precio_sesion') THEN
        RAISE NOTICE '✅ Campo precio_sesion en pacientes: OK';
    ELSE
        RAISE NOTICE '❌ Campo precio_sesion en pacientes: FALTA';
    END IF;

    -- Verificar columna en bonos
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'bonos' AND column_name = 'sesiones_usadas') THEN
        RAISE NOTICE '✅ Campo sesiones_usadas en bonos: OK';
    ELSE
        RAISE NOTICE '❌ Campo sesiones_usadas en bonos: FALTA';
    END IF;

    -- Verificar funciones
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_actualizar_precios_citas_paciente') THEN
        RAISE NOTICE '✅ Función fn_actualizar_precios_citas_paciente: OK';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_crear_bono_migracion') THEN
        RAISE NOTICE '✅ Función fn_crear_bono_migracion: OK';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_sync_sesiones_bono') THEN
        RAISE NOTICE '✅ Función fn_sync_sesiones_bono: OK';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRACIÓN COMPLETADA';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'NUEVAS CAPACIDADES:';
    RAISE NOTICE '1. precio_sesion en pacientes - Precio personalizado por paciente';
    RAISE NOTICE '2. sesiones_usadas en bonos - Para migración con sesiones consumidas';
    RAISE NOTICE '3. fn_actualizar_precios_citas_paciente() - Sincroniza precios';
    RAISE NOTICE '4. fn_crear_bono_migracion() - Crea bonos con historial';
    RAISE NOTICE '';
    RAISE NOTICE 'USO:';
    RAISE NOTICE '  -- Establecer precio personalizado:';
    RAISE NOTICE '  UPDATE pacientes SET precio_sesion = 30 WHERE id = ''...'';';
    RAISE NOTICE '';
    RAISE NOTICE '  -- Sincronizar citas pendientes:';
    RAISE NOTICE '  SELECT fn_actualizar_precios_citas_paciente(paciente_id, 30);';
    RAISE NOTICE '';
    RAISE NOTICE '  -- Crear bono con sesiones ya usadas:';
    RAISE NOTICE '  SELECT fn_crear_bono_migracion(paciente_id, terapeuta_id, ''semanal'', 4, 3);';
    RAISE NOTICE '';
END $$;
