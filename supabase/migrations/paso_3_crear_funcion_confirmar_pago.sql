-- ============================================================================
-- PASO 3: Crear función para confirmar pago de bono
-- ============================================================================

CREATE OR REPLACE FUNCTION public.confirmar_pago_bono(
    p_bono_id uuid,
    p_metodo_pago text DEFAULT 'transferencia',
    p_confirmado_por uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_bono record;
    v_result jsonb;
BEGIN
    -- Verificar que el bono existe
    SELECT * INTO v_bono
    FROM bonos
    WHERE id = p_bono_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Bono no encontrado'
        );
    END IF;
    
    -- Verificar que no está ya pagado
    IF v_bono.pagado THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'El bono ya está marcado como pagado',
            'fecha_pago', v_bono.fecha_pago
        );
    END IF;
    
    -- Marcar como pagado
    UPDATE bonos
    SET 
        pagado = true,
        fecha_pago = now(),
        metodo_pago = p_metodo_pago,
        pagado_por = p_confirmado_por,
        -- Si el bono estaba pendiente, activarlo automáticamente
        estado = CASE 
            WHEN estado = 'pendiente' THEN 'activo'::estado_bono
            ELSE estado
        END
    WHERE id = p_bono_id;
    
    -- Registrar en pagos_bonos si existe la tabla
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'pagos_bonos'
    ) THEN
        INSERT INTO pagos_bonos (
            bono_id,
            fecha_pago,
            monto,
            metodo_pago,
            confirmado,
            confirmado_por,
            fecha_confirmacion
        ) VALUES (
            p_bono_id,
            CURRENT_DATE,
            v_bono.monto_total,
            p_metodo_pago,
            true,
            p_confirmado_por,
            now()
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'bono_id', p_bono_id,
        'fecha_pago', now(),
        'metodo_pago', p_metodo_pago
    );
END;
$$;

COMMENT ON FUNCTION public.confirmar_pago_bono IS 
    'Marca un bono como pagado. Si estaba pendiente, lo activa automáticamente. Solo puede ser ejecutado por coordinadoras.';
