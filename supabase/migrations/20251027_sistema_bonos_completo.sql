-- #############################################################################
-- #                                                                           #
-- #        SISTEMA ROBUSTO DE GESTIÓN DE BONOS - PSICOLOGAKAREM            #
-- #                                                                           #
-- #############################################################################
-- # Autor: GitHub Copilot
-- # Fecha: 27 de octubre de 2025
-- # Versión: 1.0
-- #
-- # DESCRIPCIÓN:
-- # Sistema completo de gestión de bonos (paquetes de sesiones) con control
-- # de renovaciones automáticas, seguimiento de pagos, alertas de vencimiento
-- # y métricas administrativas.
-- #
-- # CARACTERÍSTICAS:
-- # • Bonos quincenales y mensuales con frecuencias personalizadas
-- # • Control de sesiones incluidas y restantes
-- # • Sistema de renovación automática o manual
-- # • Seguimiento de pagos y confirmaciones
-- # • Alertas de bonos próximos a vencer
-- # • Métricas y KPIs para coordinación y administración
-- # • Compatibilidad total con tablas existentes (pacientes, psicologas, citas)
-- #
-- #############################################################################

-- =============================================================================
-- SECCIÓN 1: TIPOS ENUMERADOS
-- =============================================================================

-- Los ENUMs ya existen en tu base de datos:
-- estado_bono: activo, agotado, pausado, cerrado
-- tipo_bono: semanal, quincenal, mensual, otro

-- IMPORTANTE: Los valores ENUM deben agregarse en transacciones separadas
-- y committearse antes de poder usarlos.

-- Agregar 'pendiente' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'estado_bono' AND e.enumlabel = 'pendiente'
    ) THEN
        ALTER TYPE estado_bono ADD VALUE 'pendiente';
    END IF;
END $$;

-- Agregar 'completado' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'estado_bono' AND e.enumlabel = 'completado'
    ) THEN
        ALTER TYPE estado_bono ADD VALUE 'completado';
    END IF;
END $$;

-- Agregar 'vencido' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'estado_bono' AND e.enumlabel = 'vencido'
    ) THEN
        ALTER TYPE estado_bono ADD VALUE 'vencido';
    END IF;
END $$;

-- Agregar 'cancelado' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'estado_bono' AND e.enumlabel = 'cancelado'
    ) THEN
        ALTER TYPE estado_bono ADD VALUE 'cancelado';
    END IF;
END $$;

-- Agregar 'personalizado' a tipo_bono si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'tipo_bono' AND e.enumlabel = 'personalizado'
    ) THEN
        ALTER TYPE tipo_bono ADD VALUE 'personalizado';
    END IF;
END $$;

-- =============================================================================
-- SECCIÓN 2: ACTUALIZACIÓN DE TABLA BONOS
-- =============================================================================

-- La tabla bonos ya existe, solo agregamos columnas faltantes

-- Eliminar vistas que dependen de la tabla bonos antes de modificarla
DROP VIEW IF EXISTS public.vista_dashboard_bonos CASCADE;
DROP VIEW IF EXISTS public.vista_dashboard_bonos_completo CASCADE;
DROP VIEW IF EXISTS public.vista_pagos_por_bono CASCADE;

-- Agregar columnas faltantes si no existen (idempotente)
DO $$ BEGIN
    -- Columna psicologa_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='bonos' AND column_name='psicologa_id') THEN
        ALTER TABLE public.bonos ADD COLUMN psicologa_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Columna psicologa_id agregada';
    END IF;
    
    -- Columna frecuencia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='bonos' AND column_name='frecuencia') THEN
        ALTER TABLE public.bonos ADD COLUMN frecuencia text;
        RAISE NOTICE '✅ Columna frecuencia agregada';
    END IF;
    
    -- Renombrar total_sesiones a sesiones_totales (ya existe como total_sesiones)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema='public' AND table_name='bonos' AND column_name='total_sesiones')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema='public' AND table_name='bonos' AND column_name='sesiones_totales') THEN
        ALTER TABLE public.bonos RENAME COLUMN total_sesiones TO sesiones_totales;
        RAISE NOTICE '✅ Columna total_sesiones renombrada a sesiones_totales';
    END IF;
    
    -- Columna fecha_inicio (derivada de created_at si es necesario)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='bonos' AND column_name='fecha_inicio') THEN
        ALTER TABLE public.bonos ADD COLUMN fecha_inicio date;
        -- Inicializar con created_at para registros existentes
        UPDATE public.bonos SET fecha_inicio = created_at::date WHERE fecha_inicio IS NULL;
        RAISE NOTICE '✅ Columna fecha_inicio agregada';
    END IF;
    
    -- Renombrar fecha_expiracion a fecha_fin
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema='public' AND table_name='bonos' AND column_name='fecha_expiracion')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema='public' AND table_name='bonos' AND column_name='fecha_fin') THEN
        ALTER TABLE public.bonos RENAME COLUMN fecha_expiracion TO fecha_fin;
        ALTER TABLE public.bonos ALTER COLUMN fecha_fin TYPE date USING fecha_fin::date;
        RAISE NOTICE '✅ Columna fecha_expiracion renombrada a fecha_fin';
    END IF;
    
    -- Renombrar precio_total a monto
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema='public' AND table_name='bonos' AND column_name='precio_total')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema='public' AND table_name='bonos' AND column_name='monto') THEN
        ALTER TABLE public.bonos RENAME COLUMN precio_total TO monto;
        RAISE NOTICE '✅ Columna precio_total renombrada a monto';
    END IF;
    
    -- Columna pagado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='bonos' AND column_name='pagado') THEN
        ALTER TABLE public.bonos ADD COLUMN pagado boolean DEFAULT false;
        -- Marcar como pagado los bonos activos existentes
        UPDATE public.bonos SET pagado = true WHERE estado = 'activo';
        RAISE NOTICE '✅ Columna pagado agregada';
    END IF;
    
    -- Columna renovacion_automatica
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='bonos' AND column_name='renovacion_automatica') THEN
        ALTER TABLE public.bonos ADD COLUMN renovacion_automatica boolean DEFAULT false;
        RAISE NOTICE '✅ Columna renovacion_automatica agregada';
    END IF;
    
    -- Columna tipo (mapear tipo_bono a tipo si es necesario)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='bonos' AND column_name='tipo') THEN
        -- Crear columna tipo como referencia adicional si tipo_bono ya existe
        ALTER TABLE public.bonos ADD COLUMN tipo tipo_bono;
        -- Sincronizar con tipo_bono
        UPDATE public.bonos SET tipo = tipo_bono WHERE tipo IS NULL;
        RAISE NOTICE '✅ Columna tipo agregada';
    END IF;
    
END $$;

-- =============================================================================
-- NOTA IMPORTANTE: MIGRACIÓN DE DATOS
-- =============================================================================
-- Los siguientes UPDATE requieren que los valores ENUM estén committed.
-- Ejecuta estos comandos MANUALMENTE después de que esta migración complete:
--
-- -- Migrar estado 'cerrado' -> 'vencido' si la fecha ya pasó
-- UPDATE public.bonos SET estado = 'vencido'
-- WHERE estado = 'cerrado' AND fecha_fin < CURRENT_DATE;
--
-- -- Migrar estado 'cerrado' -> 'completado' si las sesiones terminaron  
-- UPDATE public.bonos SET estado = 'completado'
-- WHERE estado = 'cerrado' AND sesiones_restantes = 0 AND fecha_fin >= CURRENT_DATE;
-- =============================================================================

-- Agregar comentarios a las columnas NUEVAS solamente
COMMENT ON COLUMN public.bonos.psicologa_id IS 'Psicóloga asignada al bono (opcional)';
COMMENT ON COLUMN public.bonos.frecuencia IS 'Descripción de la frecuencia: ej. "lunes", "martes", "15 días"';
COMMENT ON COLUMN public.bonos.fecha_inicio IS 'Fecha de inicio del bono';
COMMENT ON COLUMN public.bonos.pagado IS 'Indica si el bono ha sido pagado completamente';
COMMENT ON COLUMN public.bonos.renovacion_automatica IS 'Si está activa, el bono se renovará automáticamente al completarse';

-- Índices para optimizar consultas (solo crear los que no existen)
CREATE INDEX IF NOT EXISTS idx_bonos_paciente_id ON public.bonos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_bonos_psicologa_id ON public.bonos(psicologa_id) WHERE psicologa_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bonos_estado ON public.bonos(estado);
CREATE INDEX IF NOT EXISTS idx_bonos_fecha_fin ON public.bonos(fecha_fin) WHERE fecha_fin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bonos_activos ON public.bonos(estado, paciente_id);
CREATE INDEX IF NOT EXISTS idx_bonos_proximos_vencer ON public.bonos(fecha_fin, estado) WHERE fecha_fin IS NOT NULL;

-- =============================================================================
-- SECCIÓN 3: TABLA PAGOS_BONOS
-- =============================================================================

-- Tabla para registrar pagos y renovaciones de bonos
CREATE TABLE IF NOT EXISTS public.pagos_bonos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bono_id uuid NOT NULL REFERENCES public.bonos(id) ON DELETE CASCADE,
    fecha_pago date NOT NULL DEFAULT CURRENT_DATE,
    monto numeric(10,2) NOT NULL CHECK (monto >= 0),
    metodo_pago text CHECK (metodo_pago IN ('transferencia', 'tarjeta', 'efectivo', 'bizum', 'paypal', 'otro')),
    confirmado boolean DEFAULT false,
    confirmado_por uuid REFERENCES public.profiles(id),
    fecha_confirmacion timestamptz,
    comprobante_url text, -- URL al comprobante de pago en storage
    notas text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pagos_bonos IS 'Registro de pagos asociados a bonos de sesiones';
COMMENT ON COLUMN public.pagos_bonos.bono_id IS 'Bono al que pertenece este pago';
COMMENT ON COLUMN public.pagos_bonos.fecha_pago IS 'Fecha en que se realizó el pago';
COMMENT ON COLUMN public.pagos_bonos.monto IS 'Cantidad pagada';
COMMENT ON COLUMN public.pagos_bonos.metodo_pago IS 'Método utilizado para el pago';
COMMENT ON COLUMN public.pagos_bonos.confirmado IS 'Si el pago ha sido verificado/confirmado';
COMMENT ON COLUMN public.pagos_bonos.confirmado_por IS 'Usuario que confirmó el pago';
COMMENT ON COLUMN public.pagos_bonos.comprobante_url IS 'URL del comprobante de pago en Supabase Storage';
COMMENT ON COLUMN public.pagos_bonos.metadata IS 'Información adicional: referencia de transacción, gateway, etc.';

-- Índices para pagos_bonos
CREATE INDEX IF NOT EXISTS idx_pagos_bonos_bono_id ON public.pagos_bonos(bono_id);
CREATE INDEX IF NOT EXISTS idx_pagos_bonos_fecha ON public.pagos_bonos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_bonos_confirmado ON public.pagos_bonos(confirmado);
CREATE INDEX IF NOT EXISTS idx_pagos_bonos_pendientes ON public.pagos_bonos(bono_id, confirmado) 
    WHERE confirmado = false;

-- =============================================================================
-- SECCIÓN 4: TABLA RENOVACIONES_BONOS
-- =============================================================================

-- Tabla para controlar renovaciones automáticas y manuales de bonos
CREATE TABLE IF NOT EXISTS public.renovaciones_bonos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bono_original_id uuid NOT NULL REFERENCES public.bonos(id) ON DELETE CASCADE,
    nuevo_bono_id uuid REFERENCES public.bonos(id) ON DELETE SET NULL,
    fecha_renovacion date NOT NULL DEFAULT CURRENT_DATE,
    renovado_por uuid REFERENCES public.profiles(id),
    tipo_renovacion text CHECK (tipo_renovacion IN ('automatica', 'manual')) DEFAULT 'manual',
    motivo text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.renovaciones_bonos IS 'Historial de renovaciones de bonos (automáticas y manuales)';
COMMENT ON COLUMN public.renovaciones_bonos.bono_original_id IS 'Bono que fue renovado';
COMMENT ON COLUMN public.renovaciones_bonos.nuevo_bono_id IS 'Nuevo bono creado por la renovación';
COMMENT ON COLUMN public.renovaciones_bonos.fecha_renovacion IS 'Fecha en que se realizó la renovación';
COMMENT ON COLUMN public.renovaciones_bonos.renovado_por IS 'Usuario que realizó la renovación (null si fue automática)';
COMMENT ON COLUMN public.renovaciones_bonos.tipo_renovacion IS 'Si la renovación fue automática o manual';
COMMENT ON COLUMN public.renovaciones_bonos.motivo IS 'Razón de la renovación';
COMMENT ON COLUMN public.renovaciones_bonos.metadata IS 'Información adicional sobre la renovación';

-- Índices para renovaciones_bonos
CREATE INDEX IF NOT EXISTS idx_renovaciones_bono_original ON public.renovaciones_bonos(bono_original_id);
CREATE INDEX IF NOT EXISTS idx_renovaciones_nuevo_bono ON public.renovaciones_bonos(nuevo_bono_id) 
    WHERE nuevo_bono_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_renovaciones_fecha ON public.renovaciones_bonos(fecha_renovacion);
CREATE INDEX IF NOT EXISTS idx_renovaciones_tipo ON public.renovaciones_bonos(tipo_renovacion);

-- =============================================================================
-- SECCIÓN 5: FUNCIONES AUXILIARES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Función: Actualizar timestamp updated_at automáticamente
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.set_updated_at() IS 
'Función de trigger para actualizar automáticamente el campo updated_at';

-- Aplicar trigger a tabla bonos
DROP TRIGGER IF EXISTS trigger_bonos_updated_at ON public.bonos;
CREATE TRIGGER trigger_bonos_updated_at
    BEFORE UPDATE ON public.bonos
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- SECCIÓN 6: TRIGGERS DE AUTOMATIZACIÓN
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger: Actualizar sesiones_restantes cuando se crea una cita
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.actualizar_sesiones_restantes()
RETURNS TRIGGER AS $$
DECLARE
    bono_record record;
BEGIN
    -- Solo ejecutar si hay un bono asociado y debe descontar
    IF NEW.bono_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Si la cita se marca como realizada, descontar
    IF NEW.estado = 'realizada' AND (OLD IS NULL OR OLD.estado != 'realizada') THEN
        
        -- Obtener información del bono con lock
        SELECT * INTO bono_record
        FROM public.bonos
        WHERE id = NEW.bono_id
        FOR UPDATE;
        
        -- Validar que el bono tenga sesiones disponibles
        IF bono_record.sesiones_restantes > 0 THEN
            -- Decrementar sesiones restantes
            UPDATE public.bonos
            SET 
                sesiones_restantes = sesiones_restantes - 1,
                estado = CASE 
                    WHEN sesiones_restantes - 1 <= 0 THEN 'agotado'
                    ELSE estado
                END,
                updated_at = now()
            WHERE id = NEW.bono_id;
            
            -- Log del descuento
            RAISE NOTICE 'Sesión descontada del bono %. Sesiones restantes: %', 
                         NEW.bono_id, bono_record.sesiones_restantes - 1;
            
            -- Si el bono se agotó y tiene renovación automática, crear alerta
            IF bono_record.sesiones_restantes - 1 = 0 AND bono_record.renovacion_automatica THEN
                -- Aquí se puede agregar lógica para crear notificación
                RAISE NOTICE 'Bono % agotado - Renovación automática pendiente', NEW.bono_id;
            END IF;
        ELSE
            RAISE WARNING 'El bono % no tiene sesiones disponibles', NEW.bono_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.actualizar_sesiones_restantes() IS 
'Descuenta automáticamente sesiones del bono cuando una cita se marca como realizada';

-- Aplicar trigger a tabla citas si existe
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='citas') THEN
        DROP TRIGGER IF EXISTS trigger_actualizar_sesiones ON public.citas;
        CREATE TRIGGER trigger_actualizar_sesiones
            AFTER INSERT OR UPDATE ON public.citas
            FOR EACH ROW
            EXECUTE FUNCTION public.actualizar_sesiones_restantes();
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- Trigger: Cambiar estado del bono a activo al confirmar pago
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.activar_bono_al_pagar()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el pago se marca como confirmado, activar el bono si está pendiente
    IF NEW.confirmado = true AND (OLD.confirmado = false OR OLD.confirmado IS NULL) THEN
        UPDATE public.bonos
        SET 
            estado = CASE 
                WHEN estado::text = 'pendiente' THEN 'activo'::estado_bono
                ELSE estado
            END,
            pagado = true,
            updated_at = now()
        WHERE id = NEW.bono_id;
        
        RAISE NOTICE 'Bono % activado tras confirmación de pago %', NEW.bono_id, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.activar_bono_al_pagar() IS 
'Activa el bono automáticamente cuando se confirma un pago';

-- Aplicar trigger a pagos_bonos
DROP TRIGGER IF EXISTS trigger_activar_bono ON public.pagos_bonos;
CREATE TRIGGER trigger_activar_bono
    AFTER INSERT OR UPDATE ON public.pagos_bonos
    FOR EACH ROW
    EXECUTE FUNCTION public.activar_bono_al_pagar();

-- -----------------------------------------------------------------------------
-- Trigger: Renovación automática de bonos
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.renovar_bono_automatico()
RETURNS TRIGGER AS $$
DECLARE
    nuevo_bono_id uuid;
BEGIN
    -- Solo ejecutar si:
    -- 1. El bono tiene renovación automática activa
    -- 2. El estado cambió a 'agotado' o 'completado'
    -- 3. El bono original estaba activo
    IF NEW.renovacion_automatica = true 
       AND NEW.estado::text IN ('agotado', 'completado')
       AND (OLD.estado IS NULL OR OLD.estado::text NOT IN ('agotado', 'completado')) THEN
        
        -- Crear nuevo bono duplicando el original
        INSERT INTO public.bonos (
            paciente_id,
            psicologa_id,
            tipo,
            frecuencia,
            sesiones_totales,
            sesiones_restantes,
            fecha_inicio,
            fecha_fin,
            estado,
            monto,
            pagado,
            renovacion_automatica,
            notas
        ) VALUES (
            NEW.paciente_id,
            NEW.psicologa_id,
            NEW.tipo,
            NEW.frecuencia,
            NEW.sesiones_totales,
            NEW.sesiones_totales, -- Restaurar sesiones completas
            now(), -- Nueva fecha de inicio
            CASE 
                WHEN NEW.fecha_fin IS NOT NULL THEN 
                    -- Calcular nueva fecha de fin basada en la duración original
                    now() + (NEW.fecha_fin - NEW.fecha_inicio)
                ELSE NULL
            END,
            'pendiente', -- Nuevo bono empieza pendiente hasta que se pague
            NEW.monto,
            false, -- No está pagado inicialmente
            NEW.renovacion_automatica,
            'Renovación automática de bono ' || NEW.id
        ) RETURNING id INTO nuevo_bono_id;
        
        -- Registrar la renovación
        INSERT INTO public.renovaciones_bonos (
            bono_original_id,
            nuevo_bono_id,
            fecha_renovacion,
            tipo_renovacion,
            motivo
        ) VALUES (
            NEW.id,
            nuevo_bono_id,
            now(),
            'automatica',
            'Renovación automática por agotamiento de sesiones'
        );
        
        RAISE NOTICE 'Bono % renovado automáticamente. Nuevo bono: %', NEW.id, nuevo_bono_id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.renovar_bono_automatico() IS 
'Crea automáticamente un nuevo bono cuando el actual se agota si tiene renovación automática activa';

-- Aplicar trigger a bonos
DROP TRIGGER IF EXISTS trigger_renovar_bono ON public.bonos;
CREATE TRIGGER trigger_renovar_bono
    AFTER UPDATE ON public.bonos
    FOR EACH ROW
    EXECUTE FUNCTION public.renovar_bono_automatico();

-- -----------------------------------------------------------------------------
-- Trigger: Verificar bonos vencidos por fecha
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verificar_bonos_vencidos()
RETURNS void AS $$
BEGIN
    -- Actualizar bonos que han pasado su fecha de fin
    UPDATE public.bonos
    SET 
        estado = 'vencido',
        updated_at = now()
    WHERE estado::text IN ('activo', 'pendiente')
      AND fecha_fin IS NOT NULL
      AND fecha_fin < CURRENT_DATE;
    
    -- Log de la operación
    IF FOUND THEN
        RAISE NOTICE 'Bonos vencidos actualizados: %', ROW_COUNT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.verificar_bonos_vencidos() IS 
'Función para marcar como vencidos los bonos que han pasado su fecha de fin. Ejecutar periódicamente con pg_cron';

-- =============================================================================
-- SECCIÓN 7: FUNCIONES DE CONSULTA Y MÉTRICAS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Función: Obtener estadísticas completas de un bono
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.obtener_estadisticas_bono(uuid);

CREATE OR REPLACE FUNCTION public.obtener_estadisticas_bono(p_bono_id uuid)
RETURNS jsonb AS $$
DECLARE
    resultado jsonb;
BEGIN
    SELECT jsonb_build_object(
        'bono_id', b.id,
        'paciente_id', b.paciente_id,
        'paciente_nombre', COALESCE(pac_prof.nombre, pac_prof.email),
        'psicologa_id', b.psicologa_id,
        'psicologa_nombre', COALESCE(psi_prof.nombre, psi_prof.email),
        'tipo', b.tipo::text,
        'frecuencia', b.frecuencia,
        'sesiones_totales', b.sesiones_totales,
        'sesiones_restantes', b.sesiones_restantes,
        'sesiones_usadas', b.sesiones_totales - b.sesiones_restantes,
        'porcentaje_usado', ROUND(((b.sesiones_totales - b.sesiones_restantes)::numeric / 
                                   NULLIF(b.sesiones_totales, 0)) * 100, 2),
        'estado', b.estado::text,
        'fecha_inicio', b.fecha_inicio,
        'fecha_fin', b.fecha_fin,
        'dias_restantes', CASE 
            WHEN b.fecha_fin IS NOT NULL THEN (b.fecha_fin - CURRENT_DATE)
            ELSE NULL
        END,
        'monto', b.monto,
        'pagado', b.pagado,
        'renovacion_automatica', b.renovacion_automatica,
        'total_pagado', COALESCE(
            (SELECT SUM(monto) FROM public.pagos_bonos WHERE bono_id = b.id AND confirmado = true),
            0
        ),
        'pagos_pendientes', COALESCE(
            (SELECT COUNT(*) FROM public.pagos_bonos WHERE bono_id = b.id AND confirmado = false),
            0
        ),
        'citas_realizadas', COALESCE(
            (SELECT COUNT(*) FROM public.citas WHERE bono_id = b.id AND estado = 'realizada'),
            0
        ),
        'citas_programadas', COALESCE(
            (SELECT COUNT(*) FROM public.citas WHERE bono_id = b.id AND estado IN ('pendiente', 'confirmada')),
            0
        ),
        'created_at', b.created_at,
        'updated_at', b.updated_at
    ) INTO resultado
    FROM public.bonos b
    LEFT JOIN public.pacientes pac ON pac.id = b.paciente_id
    LEFT JOIN public.profiles pac_prof ON pac_prof.id = pac.id
    LEFT JOIN public.psicologas psi ON psi.id = b.psicologa_id
    LEFT JOIN public.profiles psi_prof ON psi_prof.id = psi.id
    WHERE b.id = p_bono_id;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.obtener_estadisticas_bono(uuid) IS 
'Devuelve estadísticas completas de un bono en formato JSON';

-- -----------------------------------------------------------------------------
-- Función: Obtener bonos próximos a vencer (alerta)
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.obtener_bonos_proximos_vencer(int);

CREATE OR REPLACE FUNCTION public.obtener_bonos_proximos_vencer(dias_anticipacion int DEFAULT 7)
RETURNS TABLE (
    bono_id uuid,
    paciente_id uuid,
    paciente_nombre text,
    psicologa_nombre text,
    sesiones_restantes integer,
    fecha_fin date,
    dias_restantes integer,
    estado text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as bono_id,
        b.paciente_id,
        COALESCE(pac_prof.nombre, pac_prof.email) as paciente_nombre,
        COALESCE(psi_prof.nombre, psi_prof.email) as psicologa_nombre,
        b.sesiones_restantes,
        b.fecha_fin,
        (b.fecha_fin - CURRENT_DATE) as dias_restantes,
        b.estado::text
    FROM public.bonos b
    LEFT JOIN public.pacientes pac ON pac.id = b.paciente_id
    LEFT JOIN public.profiles pac_prof ON pac_prof.id = pac.id
    LEFT JOIN public.psicologas psi ON psi.id = b.psicologa_id
    LEFT JOIN public.profiles psi_prof ON psi_prof.id = psi.id
    WHERE b.estado::text IN ('activo', 'pendiente')
      AND b.fecha_fin IS NOT NULL
      AND b.fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + dias_anticipacion
    ORDER BY b.fecha_fin ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.obtener_bonos_proximos_vencer(int) IS 
'Devuelve bonos que vencerán en los próximos N días (por defecto 7)';

-- -----------------------------------------------------------------------------
-- Función: Obtener bonos con pocas sesiones restantes
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.obtener_bonos_pocas_sesiones(int);

CREATE OR REPLACE FUNCTION public.obtener_bonos_pocas_sesiones(sesiones_minimas int DEFAULT 2)
RETURNS TABLE (
    bono_id uuid,
    paciente_id uuid,
    paciente_nombre text,
    psicologa_nombre text,
    sesiones_restantes integer,
    sesiones_totales integer,
    tipo text,
    renovacion_automatica boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as bono_id,
        b.paciente_id,
        COALESCE(pac_prof.nombre, pac_prof.email) as paciente_nombre,
        COALESCE(psi_prof.nombre, psi_prof.email) as psicologa_nombre,
        b.sesiones_restantes,
        b.sesiones_totales,
        b.tipo::text,
        b.renovacion_automatica
    FROM public.bonos b
    LEFT JOIN public.pacientes pac ON pac.id = b.paciente_id
    LEFT JOIN public.profiles pac_prof ON pac_prof.id = pac.id
    LEFT JOIN public.psicologas psi ON psi.id = b.psicologa_id
    LEFT JOIN public.profiles psi_prof ON psi_prof.id = psi.id
    WHERE b.estado::text = 'activo'
      AND b.sesiones_restantes <= sesiones_minimas
      AND b.sesiones_restantes > 0
    ORDER BY b.sesiones_restantes ASC, pac_prof.nombre ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.obtener_bonos_pocas_sesiones(int) IS 
'Devuelve bonos activos con pocas sesiones restantes (por defecto 2 o menos)';

-- -----------------------------------------------------------------------------
-- Función: Calcular métricas de bonos para dashboard administrativo
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.calcular_metricas_bonos();

CREATE OR REPLACE FUNCTION public.calcular_metricas_bonos()
RETURNS jsonb AS $$
DECLARE
    resultado jsonb;
BEGIN
    SELECT jsonb_build_object(
        'total_bonos', COUNT(*),
        'bonos_activos', COUNT(*) FILTER (WHERE estado::text = 'activo'),
        'bonos_pendientes', COUNT(*) FILTER (WHERE estado::text = 'pendiente'),
        'bonos_completados', COUNT(*) FILTER (WHERE estado::text = 'completado'),
        'bonos_vencidos', COUNT(*) FILTER (WHERE estado::text = 'vencido'),
        'bonos_agotados', COUNT(*) FILTER (WHERE estado::text = 'agotado'),
        'bonos_con_renovacion_auto', COUNT(*) FILTER (WHERE renovacion_automatica = true),
        'total_sesiones_contratadas', COALESCE(SUM(sesiones_totales), 0),
        'total_sesiones_restantes', COALESCE(SUM(sesiones_restantes), 0),
        'total_sesiones_usadas', COALESCE(SUM(sesiones_totales - sesiones_restantes), 0),
        'monto_total_bonos', COALESCE(SUM(monto), 0),
        'monto_bonos_activos', COALESCE(SUM(monto) FILTER (WHERE estado::text = 'activo'), 0),
        'monto_bonos_pagados', COALESCE(SUM(monto) FILTER (WHERE pagado = true), 0),
        'monto_bonos_pendientes_pago', COALESCE(SUM(monto) FILTER (WHERE pagado = false), 0),
        'bonos_proximos_vencer_7dias', (
            SELECT COUNT(*) FROM public.bonos 
            WHERE estado::text IN ('activo', 'pendiente')
              AND fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
        ),
        'bonos_pocas_sesiones', (
            SELECT COUNT(*) FROM public.bonos 
            WHERE estado::text = 'activo' AND sesiones_restantes <= 2 AND sesiones_restantes > 0
        ),
        'tasa_renovacion', ROUND(
            (COUNT(*) FILTER (WHERE renovacion_automatica = true)::numeric / 
             NULLIF(COUNT(*), 0)) * 100, 2
        ),
        'fecha_calculo', now()
    ) INTO resultado
    FROM public.bonos;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.calcular_metricas_bonos() IS 
'Calcula KPIs y métricas generales del sistema de bonos para dashboard administrativo';

-- -----------------------------------------------------------------------------
-- Función: Renovar bono manualmente
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.renovar_bono_manual(uuid, uuid, text);

CREATE OR REPLACE FUNCTION public.renovar_bono_manual(
    p_bono_id uuid,
    p_usuario_id uuid,
    p_motivo text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    bono_original record;
    nuevo_bono_id uuid;
BEGIN
    -- Obtener información del bono original
    SELECT * INTO bono_original
    FROM public.bonos
    WHERE id = p_bono_id;
    
    IF bono_original IS NULL THEN
        RAISE EXCEPTION 'El bono % no existe', p_bono_id;
    END IF;
    
    -- Crear nuevo bono
    INSERT INTO public.bonos (
        paciente_id,
        psicologa_id,
        tipo,
        frecuencia,
        sesiones_totales,
        sesiones_restantes,
        fecha_inicio,
        fecha_fin,
        estado,
        monto,
        pagado,
        renovacion_automatica,
        notas
    ) VALUES (
        bono_original.paciente_id,
        bono_original.psicologa_id,
        bono_original.tipo,
        bono_original.frecuencia,
        bono_original.sesiones_totales,
        bono_original.sesiones_totales,
        now(),
        CASE 
            WHEN bono_original.fecha_fin IS NOT NULL THEN 
                now() + (bono_original.fecha_fin - bono_original.fecha_inicio)
            ELSE NULL
        END,
        'pendiente',
        bono_original.monto,
        false,
        bono_original.renovacion_automatica,
        'Renovación manual de bono ' || p_bono_id || '. ' || COALESCE(p_motivo, '')
    ) RETURNING id INTO nuevo_bono_id;
    
    -- Registrar la renovación
    INSERT INTO public.renovaciones_bonos (
        bono_original_id,
        nuevo_bono_id,
        fecha_renovacion,
        renovado_por,
        tipo_renovacion,
        motivo
    ) VALUES (
        p_bono_id,
        nuevo_bono_id,
        now(),
        p_usuario_id,
        'manual',
        COALESCE(p_motivo, 'Renovación manual solicitada')
    );
    
    -- Marcar bono original como completado si aún está activo
    UPDATE public.bonos
    SET estado = 'completado'::estado_bono, updated_at = now()
    WHERE id = p_bono_id AND estado::text IN ('activo', 'agotado');
    
    RETURN nuevo_bono_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.renovar_bono_manual(uuid, uuid, text) IS 
'Renueva manualmente un bono, creando uno nuevo y registrando la operación';

-- =============================================================================
-- SECCIÓN 8: VISTAS ÚTILES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Vista: Dashboard de bonos con información completa
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.vista_dashboard_bonos_completo AS
SELECT 
    b.id as bono_id,
    b.paciente_id,
    COALESCE(pac_prof.nombre, pac_prof.email) as paciente_nombre,
    pac_prof.email as paciente_email,
    pac_prof.telefono as paciente_telefono,
    b.psicologa_id,
    psi_prof.nombre as psicologa_nombre,
    psi_prof.email as psicologa_email,
    b.tipo::text as tipo,
    b.frecuencia,
    b.sesiones_totales,
    b.sesiones_restantes,
    (b.sesiones_totales - b.sesiones_restantes) as sesiones_usadas,
    ROUND(((b.sesiones_totales - b.sesiones_restantes)::numeric / 
           NULLIF(b.sesiones_totales, 0)) * 100, 2) as porcentaje_usado,
    b.estado::text as estado,
    b.fecha_inicio,
    b.fecha_fin,
    CASE 
        WHEN b.fecha_fin IS NOT NULL THEN (b.fecha_fin - CURRENT_DATE)
        ELSE NULL
    END as dias_restantes,
    b.monto,
    b.pagado,
    b.renovacion_automatica,
    b.notas,
    -- Información de pagos
    COALESCE((SELECT SUM(pb.monto) FROM public.pagos_bonos pb 
              WHERE pb.bono_id = b.id AND pb.confirmado = true), 0) as total_pagado,
    COALESCE((SELECT COUNT(*) FROM public.pagos_bonos pb 
              WHERE pb.bono_id = b.id AND pb.confirmado = false), 0) as pagos_pendientes,
    -- Información de citas
    COALESCE((SELECT COUNT(*) FROM public.citas c 
              WHERE c.bono_id = b.id AND c.estado = 'realizada'), 0) as citas_realizadas,
    COALESCE((SELECT COUNT(*) FROM public.citas c 
              WHERE c.bono_id = b.id AND c.estado IN ('pendiente', 'confirmada')), 0) as citas_programadas,
    -- Alertas
    CASE 
        WHEN b.estado::text = 'activo' AND b.sesiones_restantes <= 2 THEN true
        ELSE false
    END as alerta_pocas_sesiones,
    CASE 
        WHEN b.estado::text IN ('activo', 'pendiente') 
             AND b.fecha_fin IS NOT NULL 
             AND b.fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + 7 THEN true
        ELSE false
    END as alerta_proximo_vencer,
    -- Fechas
    b.created_at,
    b.updated_at
FROM public.bonos b
LEFT JOIN public.pacientes pac ON pac.id = b.paciente_id
LEFT JOIN public.profiles pac_prof ON pac_prof.id = pac.id
LEFT JOIN public.psicologas psi ON psi.id = b.psicologa_id
LEFT JOIN public.profiles psi_prof ON psi_prof.id = psi.id
ORDER BY b.updated_at DESC;

COMMENT ON VIEW public.vista_dashboard_bonos_completo IS 
'Vista completa con toda la información de bonos, pagos, citas y alertas para el dashboard';

-- -----------------------------------------------------------------------------
-- Vista: Resumen de pagos por bono
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.vista_pagos_por_bono AS
SELECT 
    b.id as bono_id,
    b.paciente_id,
    COALESCE(pac_prof.nombre, pac_prof.email) as paciente_nombre,
    b.monto as monto_bono,
    COUNT(pb.id) as total_pagos,
    COUNT(pb.id) FILTER (WHERE pb.confirmado = true) as pagos_confirmados,
    COUNT(pb.id) FILTER (WHERE pb.confirmado = false) as pagos_pendientes,
    COALESCE(SUM(pb.monto) FILTER (WHERE pb.confirmado = true), 0) as total_pagado,
    COALESCE(SUM(pb.monto) FILTER (WHERE pb.confirmado = false), 0) as total_pendiente,
    (b.monto - COALESCE(SUM(pb.monto) FILTER (WHERE pb.confirmado = true), 0)) as saldo_restante,
    b.pagado as bono_pagado_completo,
    b.estado::text as estado
FROM public.bonos b
LEFT JOIN public.pacientes pac ON pac.id = b.paciente_id
LEFT JOIN public.profiles pac_prof ON pac_prof.id = pac.id
LEFT JOIN public.pagos_bonos pb ON pb.bono_id = b.id
GROUP BY b.id, b.paciente_id, pac_prof.nombre, pac_prof.email, b.monto, b.pagado, b.estado;

COMMENT ON VIEW public.vista_pagos_por_bono IS 
'Resumen de pagos asociados a cada bono con totales y saldos';

-- =============================================================================
-- SECCIÓN 9: ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.bonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_bonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renovaciones_bonos ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Políticas RLS para tabla bonos
-- -----------------------------------------------------------------------------

-- Función auxiliar para verificar si el usuario es staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND rol IN ('admin', 'coordinadora', 'psicologa')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usuarios pueden ver sus propios bonos o todos si son staff
DROP POLICY IF EXISTS "usuarios_ver_bonos" ON public.bonos;
CREATE POLICY "usuarios_ver_bonos"
ON public.bonos FOR SELECT
TO authenticated
USING (
    paciente_id = auth.uid() 
    OR psicologa_id = auth.uid()
    OR public.is_staff()
);

-- Solo staff puede crear, actualizar y eliminar bonos
DROP POLICY IF EXISTS "staff_gestionar_bonos" ON public.bonos;
CREATE POLICY "staff_gestionar_bonos"
ON public.bonos FOR ALL
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- -----------------------------------------------------------------------------
-- Políticas RLS para tabla pagos_bonos
-- -----------------------------------------------------------------------------

-- Usuarios pueden ver pagos de sus bonos
DROP POLICY IF EXISTS "usuarios_ver_pagos_bonos" ON public.pagos_bonos;
CREATE POLICY "usuarios_ver_pagos_bonos"
ON public.pagos_bonos FOR SELECT
TO authenticated
USING (
    bono_id IN (
        SELECT id FROM public.bonos 
        WHERE paciente_id = auth.uid() 
           OR psicologa_id = auth.uid()
    )
    OR public.is_staff()
);

-- Solo staff puede gestionar pagos
DROP POLICY IF EXISTS "staff_gestionar_pagos_bonos" ON public.pagos_bonos;
CREATE POLICY "staff_gestionar_pagos_bonos"
ON public.pagos_bonos FOR ALL
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- -----------------------------------------------------------------------------
-- Políticas RLS para tabla renovaciones_bonos
-- -----------------------------------------------------------------------------

-- Usuarios pueden ver renovaciones de sus bonos
DROP POLICY IF EXISTS "usuarios_ver_renovaciones" ON public.renovaciones_bonos;
CREATE POLICY "usuarios_ver_renovaciones"
ON public.renovaciones_bonos FOR SELECT
TO authenticated
USING (
    bono_original_id IN (
        SELECT id FROM public.bonos 
        WHERE paciente_id = auth.uid()
           OR psicologa_id = auth.uid()
    )
    OR public.is_staff()
);

-- Solo staff puede gestionar renovaciones
DROP POLICY IF EXISTS "staff_gestionar_renovaciones" ON public.renovaciones_bonos;
CREATE POLICY "staff_gestionar_renovaciones"
ON public.renovaciones_bonos FOR ALL
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- =============================================================================
-- SECCIÓN 10: GRANTS Y PERMISOS
-- =============================================================================

-- Otorgar permisos de ejecución a funciones
GRANT EXECUTE ON FUNCTION public.obtener_estadisticas_bono(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_bonos_proximos_vencer(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_bonos_pocas_sesiones(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calcular_metricas_bonos() TO authenticated;
GRANT EXECUTE ON FUNCTION public.renovar_bono_manual(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_bonos_vencidos() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

-- Otorgar permisos de lectura en vistas
GRANT SELECT ON public.vista_dashboard_bonos_completo TO authenticated;
GRANT SELECT ON public.vista_pagos_por_bono TO authenticated;

-- =============================================================================
-- SECCIÓN 11: DATOS DE EJEMPLO (OPCIONAL - COMENTADO)
-- =============================================================================

/*
-- Ejemplo de bono quincenal
INSERT INTO public.bonos (
    paciente_id, 
    psicologa_id, 
    tipo, 
    frecuencia, 
    sesiones_totales, 
    sesiones_restantes,
    fecha_inicio,
    fecha_fin,
    estado,
    monto,
    pagado,
    renovacion_automatica
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid, -- ID del paciente
    '00000000-0000-0000-0000-000000000002'::uuid, -- ID de la psicóloga
    'quincenal',
    'Cada 15 días',
    8,
    8,
    CURRENT_DATE,
    CURRENT_DATE + interval '4 months',
    'activo',
    400.00,
    true,
    true
);

-- Ejemplo de pago de bono
INSERT INTO public.pagos_bonos (
    bono_id,
    fecha_pago,
    monto,
    metodo_pago,
    confirmado
) VALUES (
    (SELECT id FROM public.bonos LIMIT 1),
    CURRENT_DATE,
    400.00,
    'transferencia',
    true
);
*/

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================

-- Log de éxito
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ========================================================================';
    RAISE NOTICE '   SISTEMA DE GESTIÓN DE BONOS INSTALADO CORRECTAMENTE';
    RAISE NOTICE '   ========================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 TABLAS CREADAS/ACTUALIZADAS:';
    RAISE NOTICE '   ✅ bonos - Actualizada con todos los campos necesarios';
    RAISE NOTICE '   ✅ pagos_bonos - Registro de pagos de bonos';
    RAISE NOTICE '   ✅ renovaciones_bonos - Historial de renovaciones';
    RAISE NOTICE '';
    RAISE NOTICE '⚙️  TRIGGERS INSTALADOS:';
    RAISE NOTICE '   ✅ Actualización automática de updated_at';
    RAISE NOTICE '   ✅ Descuento de sesiones al completar citas';
    RAISE NOTICE '   ✅ Activación de bono al confirmar pago';
    RAISE NOTICE '   ✅ Renovación automática de bonos';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 FUNCIONES DISPONIBLES:';
    RAISE NOTICE '   ✅ obtener_estadisticas_bono(bono_id) - Stats completas';
    RAISE NOTICE '   ✅ obtener_bonos_proximos_vencer(dias) - Alertas de vencimiento';
    RAISE NOTICE '   ✅ obtener_bonos_pocas_sesiones(min_sesiones) - Alertas de sesiones';
    RAISE NOTICE '   ✅ calcular_metricas_bonos() - KPIs generales';
    RAISE NOTICE '   ✅ renovar_bono_manual(bono_id, usuario_id, motivo) - Renovación manual';
    RAISE NOTICE '   ✅ verificar_bonos_vencidos() - Marcar bonos vencidos (ejecutar con cron)';
    RAISE NOTICE '';
    RAISE NOTICE '📊 VISTAS CREADAS:';
    RAISE NOTICE '   ✅ vista_dashboard_bonos_completo - Dashboard con alertas';
    RAISE NOTICE '   ✅ vista_pagos_por_bono - Resumen de pagos';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 SEGURIDAD:';
    RAISE NOTICE '   ✅ Row Level Security (RLS) habilitado';
    RAISE NOTICE '   ✅ Políticas para pacientes, psicólogas y staff';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 PRÓXIMOS PASOS:';
    RAISE NOTICE '   1. Ejecutar migraciones de datos manualmente (ver NOTA arriba)';
    RAISE NOTICE '   2. Ejecutar: npx supabase db push (si usas CLI)';
    RAISE NOTICE '   3. Actualizar tipos TypeScript: npx supabase gen types typescript';
    RAISE NOTICE '   4. Configurar pg_cron para verificar_bonos_vencidos() diariamente';
    RAISE NOTICE '   5. Implementar el frontend con composables para bonos';
    RAISE NOTICE '   6. Crear dashboard administrativo usando las vistas y funciones';
    RAISE NOTICE '';
    RAISE NOTICE '📚 CARACTERÍSTICAS IMPLEMENTADAS:';
    RAISE NOTICE '   ✅ Bonos quincenales y mensuales';
    RAISE NOTICE '   ✅ Control de sesiones incluidas y restantes';
    RAISE NOTICE '   ✅ Renovaciones automáticas y manuales';
    RAISE NOTICE '   ✅ Sistema de pagos y confirmaciones';
    RAISE NOTICE '   ✅ Alertas de vencimiento y pocas sesiones';
    RAISE NOTICE '   ✅ Métricas y KPIs para administración';
    RAISE NOTICE '   ✅ Integración con sistema de citas existente';
    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '';
END $$;
