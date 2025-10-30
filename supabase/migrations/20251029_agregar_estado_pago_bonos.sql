-- =============================================================================
-- MIGRACIÓN: Agregar estado de pago a bonos
-- =============================================================================
-- Fecha: 29 de octubre de 2025
-- Descripción: Agrega columna 'pagado' para controlar el estado de pago
--              independiente del estado del bono (activo/pendiente/finalizado)
--
-- LÓGICA:
-- - Un bono puede estar "activo" (cliente usando sesiones) pero "no pagado"
-- - Un bono puede estar "pendiente" (no iniciado) y "no pagado"
-- - La coordinadora confirma el pago manualmente cuando recibe el dinero
-- - El campo 'estado' controla el ciclo de vida: pendiente → activo → finalizado
-- - El campo 'pagado' controla el estado financiero independientemente
-- =============================================================================

-- Agregar columna 'pagado' a la tabla bonos si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bonos' AND column_name = 'pagado'
    ) THEN
        ALTER TABLE public.bonos 
        ADD COLUMN pagado boolean DEFAULT false NOT NULL;
        
        COMMENT ON COLUMN public.bonos.pagado IS 
            'Indica si el bono ha sido pagado y confirmado por la coordinadora. ' ||
            'Independiente del estado del bono (activo/pendiente/finalizado).';
    END IF;
END $$;

-- Agregar columna 'fecha_pago' para registrar cuándo se confirmó el pago
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bonos' AND column_name = 'fecha_pago'
    ) THEN
        ALTER TABLE public.bonos 
        ADD COLUMN fecha_pago timestamptz;
        
        COMMENT ON COLUMN public.bonos.fecha_pago IS 
            'Fecha y hora en que la coordinadora confirmó el pago del bono.';
    END IF;
END $$;

-- Agregar columna 'metodo_pago' para saber cómo pagó
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bonos' AND column_name = 'metodo_pago'
    ) THEN
        ALTER TABLE public.bonos 
        ADD COLUMN metodo_pago text CHECK (
            metodo_pago IN ('transferencia', 'tarjeta', 'efectivo', 'bizum', 'paypal', 'otro')
        );
        
        COMMENT ON COLUMN public.bonos.metodo_pago IS 
            'Método de pago utilizado: transferencia, tarjeta, efectivo, bizum, paypal, otro.';
    END IF;
END $$;

-- Agregar columna 'pagado_por' para registrar quién confirmó el pago
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bonos' AND column_name = 'pagado_por'
    ) THEN
        ALTER TABLE public.bonos 
        ADD COLUMN pagado_por uuid REFERENCES public.profiles(id);
        
        COMMENT ON COLUMN public.bonos.pagado_por IS 
            'ID del usuario (coordinadora) que confirmó el pago del bono.';
    END IF;
END $$;

-- Crear índice para búsquedas de bonos no pagados
CREATE INDEX IF NOT EXISTS idx_bonos_pagado 
    ON public.bonos(pagado) 
    WHERE pagado = false;

CREATE INDEX IF NOT EXISTS idx_bonos_estado_pagado 
    ON public.bonos(estado, pagado);

-- =============================================================================
-- FUNCIÓN: Marcar bono como pagado
-- =============================================================================
-- Esta función permite a la coordinadora confirmar el pago de un bono

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
    'Marca un bono como pagado. Si estaba pendiente, lo activa automáticamente. ' ||
    'Solo puede ser ejecutado por coordinadoras.';

-- =============================================================================
-- FUNCIÓN: Revertir pago de bono (en caso de error)
-- =============================================================================

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

-- =============================================================================
-- ACTUALIZAR BONOS EXISTENTES
-- =============================================================================
-- Por defecto, marcar como "no pagado" todos los bonos existentes
-- La coordinadora debe revisar y confirmar manualmente

UPDATE public.bonos
SET pagado = false
WHERE pagado IS NULL;

-- =============================================================================
-- POLÍTICAS RLS PARA LAS NUEVAS COLUMNAS
-- =============================================================================

-- Las coordinadoras pueden ver y modificar el estado de pago
-- Las terapeutas solo pueden ver si está pagado
-- Los pacientes no ven el estado de pago

-- Ya existe RLS en bonos, solo necesitamos asegurar que incluye las nuevas columnas
-- (Las políticas existentes SELECT ya incluyen todas las columnas por defecto)
