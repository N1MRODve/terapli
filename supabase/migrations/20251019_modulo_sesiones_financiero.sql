-- #############################################################################
-- # MIGRACIÓN: MÓDULO DE SESIONES - GESTIÓN FINANCIERA PARA TERAPEUTAS
-- #############################################################################
-- # Fecha: 19/10/2025
-- # Descripción: Agrega campos para gestión financiera transparente
-- #              incluyendo precio, distribución de pagos y confirmaciones
-- #############################################################################

-- 1. Agregar campos financieros a la tabla sesiones
ALTER TABLE public.sesiones
ADD COLUMN IF NOT EXISTS precio_total numeric(10, 2) NOT NULL DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS pago_confirmado boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS observaciones text;

COMMENT ON COLUMN public.sesiones.precio_total IS 'Precio total de la sesión en euros';
COMMENT ON COLUMN public.sesiones.pago_confirmado IS 'Indica si el pago ha sido confirmado por administración';
COMMENT ON COLUMN public.sesiones.observaciones IS 'Observaciones adicionales sobre la sesión';

-- 2. Renombrar psicologa_id a terapeuta_id para mayor claridad
-- (Solo si aún no existe la columna terapeuta_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sesiones' 
        AND column_name = 'terapeuta_id'
    ) THEN
        ALTER TABLE public.sesiones RENAME COLUMN psicologa_id TO terapeuta_id;
    END IF;
END $$;

-- 3. Actualizar el enum estado_sesion para incluir 'completada'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'completada' 
        AND enumtypid = 'public.estado_sesion'::regtype
    ) THEN
        ALTER TYPE public.estado_sesion ADD VALUE 'completada';
    END IF;
END $$;

-- 4. Actualizar el enum estado_sesion: renombrar 'realizada' a 'confirmada'
-- Nota: PostgreSQL no permite renombrar valores de enum directamente
-- Por lo tanto, mantendremos ambos valores por compatibilidad
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'confirmada' 
        AND enumtypid = 'public.estado_sesion'::regtype
    ) THEN
        ALTER TYPE public.estado_sesion ADD VALUE 'confirmada';
    END IF;
END $$;

-- 5. Actualizar el enum estado_sesion: renombrar 'cancelada' a 'anulada'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'anulada' 
        AND enumtypid = 'public.estado_sesion'::regtype
    ) THEN
        ALTER TYPE public.estado_sesion ADD VALUE 'anulada';
    END IF;
END $$;

-- 6. Crear tabla pagos_terapeutas para registro de distribución financiera
CREATE TABLE IF NOT EXISTS public.pagos_terapeutas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    terapeuta_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sesion_id uuid NOT NULL REFERENCES public.sesiones(id) ON DELETE CASCADE,
    monto_terapeuta numeric(10, 2) NOT NULL,
    monto_consulta numeric(10, 2) NOT NULL,
    estado_pago text NOT NULL DEFAULT 'pendiente' 
        CHECK (estado_pago IN ('pendiente', 'confirmado', 'pagado')),
    fecha_pago timestamptz,
    notas text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Índices para mejorar consultas
    CONSTRAINT unique_sesion_pago UNIQUE(sesion_id)
);

COMMENT ON TABLE public.pagos_terapeutas IS 'Registro de distribución financiera para terapeutas (70/30)';
COMMENT ON COLUMN public.pagos_terapeutas.monto_terapeuta IS 'Monto correspondiente al terapeuta (70%)';
COMMENT ON COLUMN public.pagos_terapeutas.monto_consulta IS 'Monto correspondiente a la consulta (30%)';
COMMENT ON COLUMN public.pagos_terapeutas.estado_pago IS 'Estado del pago: pendiente, confirmado, pagado';

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_pagos_terapeutas_terapeuta 
    ON public.pagos_terapeutas(terapeuta_id);
CREATE INDEX IF NOT EXISTS idx_pagos_terapeutas_estado 
    ON public.pagos_terapeutas(estado_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_terapeutas_fecha 
    ON public.pagos_terapeutas(fecha_pago);

-- 7. Función para calcular y registrar automáticamente el pago del terapeuta
CREATE OR REPLACE FUNCTION public.registrar_pago_terapeuta()
RETURNS TRIGGER AS $$
DECLARE
    v_monto_terapeuta numeric(10, 2);
    v_monto_consulta numeric(10, 2);
BEGIN
    -- Solo procesar si el pago se marca como confirmado
    IF NEW.pago_confirmado = TRUE AND OLD.pago_confirmado = FALSE THEN
        -- Calcular distribución 70/30
        v_monto_terapeuta := NEW.precio_total * 0.70;
        v_monto_consulta := NEW.precio_total * 0.30;
        
        -- Insertar o actualizar registro en pagos_terapeutas
        INSERT INTO public.pagos_terapeutas (
            terapeuta_id,
            sesion_id,
            monto_terapeuta,
            monto_consulta,
            estado_pago
        ) VALUES (
            NEW.terapeuta_id,
            NEW.id,
            v_monto_terapeuta,
            v_monto_consulta,
            'confirmado'
        )
        ON CONFLICT (sesion_id) 
        DO UPDATE SET
            monto_terapeuta = v_monto_terapeuta,
            monto_consulta = v_monto_consulta,
            estado_pago = 'confirmado',
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Crear trigger para ejecutar la función automáticamente
DROP TRIGGER IF EXISTS trigger_registrar_pago_terapeuta ON public.sesiones;
CREATE TRIGGER trigger_registrar_pago_terapeuta
    AFTER UPDATE ON public.sesiones
    FOR EACH ROW
    WHEN (NEW.pago_confirmado IS DISTINCT FROM OLD.pago_confirmado)
    EXECUTE FUNCTION public.registrar_pago_terapeuta();

-- 9. Función para obtener resumen financiero del terapeuta
CREATE OR REPLACE FUNCTION public.obtener_resumen_financiero_terapeuta(p_terapeuta_id uuid)
RETURNS TABLE(
    pendientes bigint,
    confirmadas bigint,
    anuladas bigint,
    completadas bigint,
    monto_pendiente numeric,
    monto_confirmado numeric,
    monto_total numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
        COUNT(*) FILTER (WHERE estado IN ('confirmada', 'realizada', 'completada')) as confirmadas,
        COUNT(*) FILTER (WHERE estado IN ('cancelada', 'anulada')) as anuladas,
        COUNT(*) FILTER (WHERE estado = 'completada') as completadas,
        COALESCE(SUM(precio_total * 0.70) FILTER (WHERE estado = 'pendiente'), 0) as monto_pendiente,
        COALESCE(SUM(precio_total * 0.70) FILTER (WHERE estado IN ('confirmada', 'realizada', 'completada') AND pago_confirmado = true), 0) as monto_confirmado,
        COALESCE(SUM(precio_total * 0.70) FILTER (WHERE estado NOT IN ('cancelada', 'anulada')), 0) as monto_total
    FROM public.sesiones
    WHERE terapeuta_id = p_terapeuta_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Actualizar trigger para updated_at en pagos_terapeutas
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pagos_terapeutas_updated_at ON public.pagos_terapeutas;
CREATE TRIGGER update_pagos_terapeutas_updated_at
    BEFORE UPDATE ON public.pagos_terapeutas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Políticas de seguridad RLS para pagos_terapeutas
ALTER TABLE public.pagos_terapeutas ENABLE ROW LEVEL SECURITY;

-- Los terapeutas pueden ver solo sus propios registros de pago
DROP POLICY IF EXISTS "Terapeutas pueden ver sus propios pagos" ON public.pagos_terapeutas;
CREATE POLICY "Terapeutas pueden ver sus propios pagos" ON public.pagos_terapeutas
    FOR SELECT
    USING (terapeuta_id = auth.uid());

-- Solo administración puede insertar/actualizar pagos
DROP POLICY IF EXISTS "Admin puede gestionar pagos de terapeutas" ON public.pagos_terapeutas;
CREATE POLICY "Admin puede gestionar pagos de terapeutas" ON public.pagos_terapeutas
    FOR ALL
    USING (is_admin_or_coord());

-- 12. Actualizar políticas RLS para sesiones (permitir lectura de precio)
DROP POLICY IF EXISTS "Terapeutas pueden ver sus propias sesiones" ON public.sesiones;
CREATE POLICY "Terapeutas pueden ver sus propias sesiones" ON public.sesiones
    FOR SELECT
    USING (terapeuta_id = auth.uid() OR is_staff());

-- 13. Datos de ejemplo (comentados - descomentar si es necesario para testing)
/*
-- Insertar una sesión de ejemplo
INSERT INTO public.sesiones (
    paciente_id,
    terapeuta_id,
    fecha,
    modalidad,
    estado,
    precio_total,
    pago_confirmado,
    observaciones
) VALUES (
    'uuid-del-paciente',
    'uuid-del-terapeuta',
    now() + interval '2 days',
    'online',
    'pendiente',
    50.00,
    false,
    'Primera sesión de evaluación'
);
*/

-- #############################################################################
-- # FIN DE LA MIGRACIÓN
-- #############################################################################
-- Para aplicar esta migración en Supabase:
-- 1. Ve a SQL Editor en tu dashboard de Supabase
-- 2. Copia y pega este script completo
-- 3. Ejecuta la migración
-- 4. Verifica que no haya errores en los logs
-- #############################################################################
