-- ============================================================================
-- PASO 4: Crear función para revertir pago de bono (en caso de error)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.revertir_pago_bono(
    p_bono_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar que el bono existe y está pagado
    IF NOT EXISTS (
        SELECT 1 FROM bonos 
        WHERE id = p_bono_id AND pagado = true
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Bono no encontrado o no está marcado como pagado'
        );
    END IF;
    
    -- Revertir estado de pago
    UPDATE bonos
    SET 
        pagado = false,
        fecha_pago = NULL,
        metodo_pago = NULL,
        pagado_por = NULL
    WHERE id = p_bono_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'bono_id', p_bono_id,
        'message', 'Pago revertido correctamente'
    );
END;
$$;

COMMENT ON FUNCTION public.revertir_pago_bono IS 
    'Revierte el estado de pago de un bono (solo coordinadoras, en caso de error).';
