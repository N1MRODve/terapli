-- ============================================================================
-- PASO 2: Agregar columnas de fecha_pago y metodo_pago
-- ============================================================================

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
        
        RAISE NOTICE 'Columna fecha_pago agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna fecha_pago ya existe';
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
        
        RAISE NOTICE 'Columna metodo_pago agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna metodo_pago ya existe';
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
        
        RAISE NOTICE 'Columna pagado_por agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna pagado_por ya existe';
    END IF;
END $$;

-- Crear índice compuesto para búsquedas
CREATE INDEX IF NOT EXISTS idx_bonos_estado_pagado 
    ON public.bonos(estado, pagado);
