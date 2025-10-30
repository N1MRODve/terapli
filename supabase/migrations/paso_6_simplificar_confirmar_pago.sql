-- ============================================================================
-- PASO 6: Simplificar función confirmar_pago_bono
-- ============================================================================
-- Remover la inserción en pagos_bonos y asegurar que actualiza pagado=true

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
        END,
        updated_at = now()
    WHERE id = p_bono_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'bono_id', p_bono_id,
        'fecha_pago', now(),
        'metodo_pago', p_metodo_pago,
        'pagado', true
    );
END;
$$;

COMMENT ON FUNCTION public.confirmar_pago_bono IS 
    'Marca un bono como pagado directamente en la tabla bonos. Si estaba pendiente, lo activa automáticamente.';
