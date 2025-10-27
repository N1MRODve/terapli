-- ============================================================================
-- FIX: Asegurar que la tabla bonos tiene todas las columnas necesarias
-- ============================================================================
-- Fecha: 27 de octubre de 2025
-- Propósito: Corregir columnas faltantes en tabla bonos para que el modal
--            de nuevo paciente funcione correctamente

-- 1. Verificar y agregar columna 'tipo' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bonos' 
        AND column_name = 'tipo'
    ) THEN
        -- Si existe tipo_bono, crear tipo y copiar valores
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bonos' 
            AND column_name = 'tipo_bono'
        ) THEN
            ALTER TABLE public.bonos ADD COLUMN tipo text;
            UPDATE public.bonos SET tipo = tipo_bono::text WHERE tipo IS NULL;
            RAISE NOTICE '✅ Columna tipo agregada y sincronizada con tipo_bono';
        ELSE
            ALTER TABLE public.bonos ADD COLUMN tipo text;
            RAISE NOTICE '✅ Columna tipo agregada';
        END IF;
    END IF;
END $$;

-- 2. Verificar y agregar columna 'monto_total' si no existe
--    (alias de 'monto' para compatibilidad)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bonos' 
        AND column_name = 'monto_total'
    ) THEN
        -- Si existe monto, agregar monto_total como alias
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bonos' 
            AND column_name = 'monto'
        ) THEN
            ALTER TABLE public.bonos ADD COLUMN monto_total numeric(10,2);
            UPDATE public.bonos SET monto_total = monto WHERE monto_total IS NULL;
            RAISE NOTICE '✅ Columna monto_total agregada y sincronizada con monto';
        ELSE
            ALTER TABLE public.bonos ADD COLUMN monto_total numeric(10,2);
            RAISE NOTICE '✅ Columna monto_total agregada';
        END IF;
    END IF;
END $$;

-- 3. Verificar y agregar columna 'sesiones_totales' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bonos' 
        AND column_name = 'sesiones_totales'
    ) THEN
        -- Si existe total_sesiones, renombrar
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bonos' 
            AND column_name = 'total_sesiones'
        ) THEN
            ALTER TABLE public.bonos RENAME COLUMN total_sesiones TO sesiones_totales;
            RAISE NOTICE '✅ Columna total_sesiones renombrada a sesiones_totales';
        ELSE
            ALTER TABLE public.bonos ADD COLUMN sesiones_totales integer DEFAULT 1;
            RAISE NOTICE '✅ Columna sesiones_totales agregada';
        END IF;
    END IF;
END $$;

-- 4. Verificar y agregar columna 'psicologa_id' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bonos' 
        AND column_name = 'psicologa_id'
    ) THEN
        ALTER TABLE public.bonos ADD COLUMN psicologa_id uuid;
        ALTER TABLE public.bonos ADD CONSTRAINT fk_bonos_psicologa 
            FOREIGN KEY (psicologa_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Columna psicologa_id agregada con foreign key';
    END IF;
END $$;

-- 5. Verificar y agregar columna 'fecha_inicio' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bonos' 
        AND column_name = 'fecha_inicio'
    ) THEN
        ALTER TABLE public.bonos ADD COLUMN fecha_inicio date DEFAULT CURRENT_DATE;
        -- Inicializar con created_at para registros existentes
        UPDATE public.bonos SET fecha_inicio = created_at::date WHERE fecha_inicio IS NULL;
        RAISE NOTICE '✅ Columna fecha_inicio agregada';
    END IF;
END $$;

-- 6. Verificar y agregar columna 'fecha_fin' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bonos' 
        AND column_name = 'fecha_fin'
    ) THEN
        -- Si existe fecha_expiracion, renombrar
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bonos' 
            AND column_name = 'fecha_expiracion'
        ) THEN
            ALTER TABLE public.bonos RENAME COLUMN fecha_expiracion TO fecha_fin;
            RAISE NOTICE '✅ Columna fecha_expiracion renombrada a fecha_fin';
        ELSE
            ALTER TABLE public.bonos ADD COLUMN fecha_fin date;
            RAISE NOTICE '✅ Columna fecha_fin agregada';
        END IF;
    END IF;
END $$;

-- 7. Verificar y agregar columna 'pagado' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bonos' 
        AND column_name = 'pagado'
    ) THEN
        ALTER TABLE public.bonos ADD COLUMN pagado boolean DEFAULT false;
        RAISE NOTICE '✅ Columna pagado agregada';
    END IF;
END $$;

-- 8. Verificar y agregar columna 'renovacion_automatica' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bonos' 
        AND column_name = 'renovacion_automatica'
    ) THEN
        ALTER TABLE public.bonos ADD COLUMN renovacion_automatica boolean DEFAULT false;
        RAISE NOTICE '✅ Columna renovacion_automatica agregada';
    END IF;
END $$;

-- 9. Verificar y agregar columna 'notas' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bonos' 
        AND column_name = 'notas'
    ) THEN
        ALTER TABLE public.bonos ADD COLUMN notas text;
        RAISE NOTICE '✅ Columna notas agregada';
    END IF;
END $$;

-- 10. Verificar y agregar columna 'metadata' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bonos' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.bonos ADD COLUMN metadata jsonb DEFAULT '{}';
        RAISE NOTICE '✅ Columna metadata agregada';
    END IF;
END $$;

-- 11. Trigger para sincronizar monto y monto_total
CREATE OR REPLACE FUNCTION sync_monto_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se actualiza monto, sincronizar monto_total
    IF NEW.monto IS DISTINCT FROM OLD.monto THEN
        NEW.monto_total := NEW.monto;
    END IF;
    
    -- Si se actualiza monto_total, sincronizar monto
    IF NEW.monto_total IS DISTINCT FROM OLD.monto_total THEN
        NEW.monto := NEW.monto_total;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger solo si no existe
DROP TRIGGER IF EXISTS trg_sync_monto_fields ON public.bonos;
CREATE TRIGGER trg_sync_monto_fields
    BEFORE INSERT OR UPDATE ON public.bonos
    FOR EACH ROW
    EXECUTE FUNCTION sync_monto_fields();

-- 12. Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_bonos_tipo ON public.bonos(tipo);
CREATE INDEX IF NOT EXISTS idx_bonos_psicologa ON public.bonos(psicologa_id) WHERE psicologa_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bonos_fechas ON public.bonos(fecha_inicio, fecha_fin);

-- 13. Comentarios informativos
COMMENT ON COLUMN public.bonos.tipo IS 'Tipo de bono: a_demanda, quincenal, semanal';
COMMENT ON COLUMN public.bonos.monto_total IS 'Monto total del bono (sincronizado con monto)';
COMMENT ON COLUMN public.bonos.sesiones_totales IS 'Número total de sesiones incluidas en el bono';
COMMENT ON COLUMN public.bonos.psicologa_id IS 'ID de la psicóloga que gestiona el bono';
COMMENT ON COLUMN public.bonos.fecha_inicio IS 'Fecha de inicio del bono';
COMMENT ON COLUMN public.bonos.fecha_fin IS 'Fecha de expiración del bono';
COMMENT ON COLUMN public.bonos.pagado IS 'Indica si el bono ha sido pagado';
COMMENT ON COLUMN public.bonos.renovacion_automatica IS 'Si el bono se renueva automáticamente';
COMMENT ON COLUMN public.bonos.notas IS 'Notas adicionales sobre el bono';
COMMENT ON COLUMN public.bonos.metadata IS 'Metadata JSON adicional';

-- ============================================================================
-- Verificación final
-- ============================================================================

DO $$
DECLARE
    columnas_requeridas text[] := ARRAY[
        'tipo', 'monto_total', 'sesiones_totales', 'psicologa_id',
        'fecha_inicio', 'fecha_fin', 'pagado', 'renovacion_automatica',
        'notas', 'metadata'
    ];
    columna text;
    falta boolean := false;
BEGIN
    RAISE NOTICE '🔍 Verificando columnas de la tabla bonos...';
    
    FOREACH columna IN ARRAY columnas_requeridas
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bonos' 
            AND column_name = columna
        ) THEN
            RAISE WARNING '❌ Falta columna: %', columna;
            falta := true;
        ELSE
            RAISE NOTICE '✅ Columna % existe', columna;
        END IF;
    END LOOP;
    
    IF NOT falta THEN
        RAISE NOTICE '🎉 Todas las columnas necesarias están presentes';
    END IF;
END $$;
