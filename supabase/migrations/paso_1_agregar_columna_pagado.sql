-- ============================================================================
-- PASO 1: Agregar columna 'pagado' a la tabla bonos
-- ============================================================================

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
            'Indica si el bono ha sido pagado y confirmado por la coordinadora.';
        
        RAISE NOTICE 'Columna pagado agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna pagado ya existe';
    END IF;
END $$;

-- Crear índice para búsquedas de bonos no pagados
CREATE INDEX IF NOT EXISTS idx_bonos_pagado 
    ON public.bonos(pagado) 
    WHERE pagado = false;

-- Actualizar bonos existentes (marcar todos como no pagados por defecto)
UPDATE public.bonos
SET pagado = false
WHERE pagado IS NULL;
