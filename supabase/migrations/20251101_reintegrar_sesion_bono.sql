-- ============================================================================
-- FUNCIÓN: Reintegrar sesión de bono al cancelar cita
-- ============================================================================
-- Fecha: 1 de noviembre de 2025
-- Propósito: Incrementar sesiones_restantes cuando se cancela una cita
-- y el usuario decide reintegrar la sesión al bono
-- ============================================================================

-- Eliminar función si existe
DROP FUNCTION IF EXISTS public.fn_reintegrar_sesion_bono(uuid, uuid, boolean);

-- Crear función para reintegrar sesión
CREATE OR REPLACE FUNCTION public.fn_reintegrar_sesion_bono(
    p_cita_id uuid,
    p_bono_id uuid,
    p_reintegrar boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cita_record record;
    v_bono_record record;
    v_horas_anticipacion numeric;
    v_puede_reintegrar boolean := false;
    v_sesiones_restantes_nuevas integer;
BEGIN
    -- Validar que la cita existe
    SELECT * INTO v_cita_record
    FROM public.citas
    WHERE id = p_cita_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cita no encontrada'
        );
    END IF;
    
    -- Validar que el bono existe
    SELECT * INTO v_bono_record
    FROM public.bonos
    WHERE id = p_bono_id
    FOR UPDATE; -- Lock para evitar condiciones de carrera
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Bono no encontrado'
        );
    END IF;
    
    -- Calcular cuántas horas de anticipación se está cancelando
    v_horas_anticipacion := EXTRACT(EPOCH FROM (
        (v_cita_record.fecha_cita + v_cita_record.hora_inicio) - NOW()
    )) / 3600;
    
    -- Determinar si se puede reintegrar (más de 24 horas de anticipación)
    v_puede_reintegrar := v_horas_anticipacion >= 24;
    
    -- Actualizar estado de la cita a cancelada
    UPDATE public.citas
    SET 
        estado = 'cancelada',
        observaciones = CASE 
            WHEN p_reintegrar AND v_puede_reintegrar THEN 
                COALESCE(observaciones, '') || 
                E'\n[Cancelada con reintegro de sesión - ' || 
                TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI') || ']'
            ELSE 
                COALESCE(observaciones, '') || 
                E'\n[Cancelada sin reintegro de sesión - ' || 
                TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI') || ']'
        END,
        updated_at = NOW()
    WHERE id = p_cita_id;
    
    -- Si se debe reintegrar Y es posible (más de 24 horas)
    IF p_reintegrar AND v_puede_reintegrar THEN
        -- Incrementar sesiones restantes
        UPDATE public.bonos
        SET 
            sesiones_restantes = sesiones_restantes + 1,
            -- Si el bono estaba agotado, cambiar estado a activo
            estado = CASE 
                WHEN estado::text = 'agotado' AND sesiones_restantes + 1 > 0 THEN 'activo'::estado_bono
                ELSE estado
            END,
            updated_at = NOW()
        WHERE id = p_bono_id;
        
        -- Obtener nuevo valor de sesiones restantes
        SELECT sesiones_restantes INTO v_sesiones_restantes_nuevas
        FROM public.bonos
        WHERE id = p_bono_id;
        
        RAISE NOTICE '✅ Sesión reintegrada al bono %. Sesiones restantes: %', 
                     p_bono_id, v_sesiones_restantes_nuevas;
        
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Cita cancelada y sesión reintegrada al bono',
            'sesiones_restantes', v_sesiones_restantes_nuevas,
            'sesiones_totales', v_bono_record.sesiones_totales,
            'horas_anticipacion', v_horas_anticipacion,
            'reintegrada', true
        );
    ELSE
        -- Cancelación sin reintegro
        RETURN jsonb_build_object(
            'success', true,
            'message', CASE 
                WHEN NOT v_puede_reintegrar THEN 
                    'Cita cancelada sin reintegro (menos de 24 horas de anticipación)'
                ELSE 
                    'Cita cancelada sin reintegro de sesión'
            END,
            'sesiones_restantes', v_bono_record.sesiones_restantes,
            'sesiones_totales', v_bono_record.sesiones_totales,
            'horas_anticipacion', v_horas_anticipacion,
            'reintegrada', false,
            'puede_reintegrar', v_puede_reintegrar
        );
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Comentario de la función
COMMENT ON FUNCTION public.fn_reintegrar_sesion_bono(uuid, uuid, boolean) IS 
'Cancela una cita y opcionalmente reintegra la sesión al bono si se cancela con más de 24 horas de anticipación';

-- Notificación de éxito
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ========================================================================';
    RAISE NOTICE '   FUNCIÓN fn_reintegrar_sesion_bono CREADA EXITOSAMENTE';
    RAISE NOTICE '   ========================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📝 USO:';
    RAISE NOTICE '   SELECT fn_reintegrar_sesion_bono(';
    RAISE NOTICE '       ''<cita_id>''::uuid,';
    RAISE NOTICE '       ''<bono_id>''::uuid,';
    RAISE NOTICE '       true  -- reintegrar sesión (true) o solo cancelar (false)';
    RAISE NOTICE '   );';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  REGLAS:';
    RAISE NOTICE '   • Reintegro permitido solo con +24 horas de anticipación';
    RAISE NOTICE '   • Si bono estaba agotado, vuelve a estado activo';
    RAISE NOTICE '   • La cita siempre se marca como cancelada';
    RAISE NOTICE '';
END $$;
