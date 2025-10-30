-- ============================================================================
-- CORRECCIÓN: Actualizar función fn_activar_bono_al_pagar
-- ============================================================================
-- Cambiar v_bono_record.monto por v_bono_record.monto_total

CREATE OR REPLACE FUNCTION public.fn_activar_bono_al_pagar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
            IF v_total_pagado >= v_bono_record.monto_total THEN
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
                            NEW.bono_id, v_total_pagado, v_bono_record.monto_total;
            END IF;
        ELSE
            -- Si el bono ya está activo, solo actualizar el flag de pagado
            UPDATE public.bonos
            SET 
                pagado = (v_total_pagado >= v_bono_record.monto_total),
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
$function$;
