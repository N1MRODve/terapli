-- #############################################################################
-- #                                                                           #
-- #        SISTEMA COMPLETO DE GESTIÓN DE CITAS Y BONOS - PSICOLOGAKAREM    #
-- #                                                                           #
-- #############################################################################
-- # Autor: GitHub Copilot
-- # Fecha: 26 de octubre de 2025
-- # Versión: 1.0
-- #
-- # DESCRIPCIÓN:
-- # Sistema robusto de gestión de citas con asignación automática de bonos,
-- # descuento de sesiones, validaciones de horario y seguridad RLS.
-- #
-- #############################################################################

-- =============================================================================
-- SECCIÓN 1: TIPOS ENUMERADOS
-- =============================================================================

-- Crear tipos ENUM si no existen
DO $$ BEGIN
    CREATE TYPE estado_cita AS ENUM ('pendiente', 'confirmada', 'realizada', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE modalidad_cita AS ENUM ('presencial', 'online', 'telefonica');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_bono AS ENUM ('semanal', 'quincenal', 'mensual', 'otro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- SECCIÓN 2: TABLA DE TERAPEUTAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.terapeutas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo text NOT NULL,
    email text UNIQUE NOT NULL,
    telefono text,
    especialidad text,
    num_colegiada text UNIQUE,
    disponibilidad jsonb DEFAULT '{}',
    activo boolean NOT NULL DEFAULT true,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.terapeutas IS 'Catálogo de terapeutas/psicólogos del sistema';
COMMENT ON COLUMN public.terapeutas.disponibilidad IS 'Horarios de disponibilidad en formato JSON: {lunes: ["09:00-13:00", "15:00-19:00"]}';
COMMENT ON COLUMN public.terapeutas.metadata IS 'Información adicional: bio, foto_url, años_experiencia, etc.';

-- Índices para terapeutas
CREATE INDEX IF NOT EXISTS idx_terapeutas_email ON public.terapeutas(email);
CREATE INDEX IF NOT EXISTS idx_terapeutas_activo ON public.terapeutas(activo) WHERE activo = true;

-- =============================================================================
-- SECCIÓN 3: ACTUALIZACIÓN DE TABLA BONOS
-- =============================================================================

-- Agregar columnas faltantes a la tabla bonos si no existen
DO $$ BEGIN
    -- Tipo de bono
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bonos' AND column_name='tipo_bono') THEN
        ALTER TABLE public.bonos ADD COLUMN tipo_bono tipo_bono DEFAULT 'mensual';
    END IF;
    
    -- Fecha de expiración
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bonos' AND column_name='fecha_expiracion') THEN
        ALTER TABLE public.bonos ADD COLUMN fecha_expiracion timestamptz;
    END IF;
    
    -- Precio unitario por sesión
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bonos' AND column_name='precio_por_sesion') THEN
        ALTER TABLE public.bonos ADD COLUMN precio_por_sesion numeric(10, 2);
    END IF;
    
    -- Metadata para información adicional
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bonos' AND column_name='metadata') THEN
        ALTER TABLE public.bonos ADD COLUMN metadata jsonb DEFAULT '{}';
    END IF;
    
    -- Notas administrativas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bonos' AND column_name='notas') THEN
        ALTER TABLE public.bonos ADD COLUMN notas text;
    END IF;
END $$;

-- Actualizar comentarios de la tabla bonos
COMMENT ON COLUMN public.bonos.tipo_bono IS 'Tipo de bono contratado (semanal, quincenal, mensual)';
COMMENT ON COLUMN public.bonos.fecha_expiracion IS 'Fecha de expiración del bono (nullable)';
COMMENT ON COLUMN public.bonos.precio_por_sesion IS 'Precio unitario de cada sesión del bono';
COMMENT ON COLUMN public.bonos.metadata IS 'Información adicional: descuentos, promociones, etc.';

-- =============================================================================
-- SECCIÓN 4: TABLA DE CITAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.citas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    terapeuta_id uuid NOT NULL REFERENCES public.terapeutas(id) ON DELETE RESTRICT,
    bono_id uuid REFERENCES public.bonos(id) ON DELETE SET NULL,
    
    -- Fecha y hora
    fecha_cita date NOT NULL,
    hora_inicio time NOT NULL,
    hora_fin time NOT NULL,
    duracion_minutos integer GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) / 60
    ) STORED,
    
    -- Detalles de la cita
    modalidad modalidad_cita NOT NULL DEFAULT 'online',
    estado estado_cita NOT NULL DEFAULT 'pendiente',
    
    -- Ubicación y enlaces
    ubicacion text,
    enlace_videollamada text,
    
    -- Observaciones
    observaciones text,
    notas_terapeuta text,
    
    -- Flags de control
    descontar_de_bono boolean NOT NULL DEFAULT false,
    sesion_descontada boolean NOT NULL DEFAULT false,
    recordatorio_enviado boolean NOT NULL DEFAULT false,
    
    -- Metadata
    metadata jsonb DEFAULT '{}',
    
    -- Auditoría
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT check_hora_valida CHECK (hora_inicio < hora_fin),
    CONSTRAINT check_duracion_minima CHECK (
        EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) >= 1800  -- Mínimo 30 min
    ),
    CONSTRAINT check_duracion_maxima CHECK (
        EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) <= 14400  -- Máximo 4 horas
    )
);

COMMENT ON TABLE public.citas IS 'Registro de citas programadas entre pacientes y terapeutas';
COMMENT ON COLUMN public.citas.duracion_minutos IS 'Duración calculada automáticamente en minutos';
COMMENT ON COLUMN public.citas.descontar_de_bono IS 'Indica si la cita debe descontar del bono al completarse';
COMMENT ON COLUMN public.citas.sesion_descontada IS 'Flag para evitar descuentos duplicados';
COMMENT ON COLUMN public.citas.observaciones IS 'Observaciones visibles para el paciente';
COMMENT ON COLUMN public.citas.notas_terapeuta IS 'Notas privadas del terapeuta';

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_citas_paciente_id ON public.citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_terapeuta_id ON public.citas(terapeuta_id);
CREATE INDEX IF NOT EXISTS idx_citas_bono_id ON public.citas(bono_id) WHERE bono_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON public.citas(fecha_cita);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON public.citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_terapeuta_fecha ON public.citas(terapeuta_id, fecha_cita);
CREATE INDEX IF NOT EXISTS idx_citas_paciente_fecha ON public.citas(paciente_id, fecha_cita);

-- Índice compuesto para búsquedas de disponibilidad
CREATE INDEX IF NOT EXISTS idx_citas_disponibilidad 
ON public.citas(terapeuta_id, fecha_cita, hora_inicio, hora_fin) 
WHERE estado IN ('confirmada', 'pendiente');

-- =============================================================================
-- SECCIÓN 5: FUNCIONES DE VALIDACIÓN
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Función: Validar que no haya solapamiento de citas para el mismo terapeuta
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_disponibilidad_terapeuta()
RETURNS TRIGGER AS $$
DECLARE
    citas_conflicto integer;
BEGIN
    -- Solo validar para citas no canceladas
    IF NEW.estado = 'cancelada' THEN
        RETURN NEW;
    END IF;
    
    -- Buscar citas que se solapen en horario
    SELECT COUNT(*) INTO citas_conflicto
    FROM public.citas
    WHERE terapeuta_id = NEW.terapeuta_id
      AND fecha_cita = NEW.fecha_cita
      AND estado IN ('pendiente', 'confirmada', 'realizada')
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
          -- La nueva cita empieza durante otra cita
          (NEW.hora_inicio >= hora_inicio AND NEW.hora_inicio < hora_fin) OR
          -- La nueva cita termina durante otra cita
          (NEW.hora_fin > hora_inicio AND NEW.hora_fin <= hora_fin) OR
          -- La nueva cita envuelve otra cita
          (NEW.hora_inicio <= hora_inicio AND NEW.hora_fin >= hora_fin)
      );
    
    IF citas_conflicto > 0 THEN
        RAISE EXCEPTION 'El terapeuta ya tiene una cita en ese horario. Por favor, elige otro horario.'
            USING ERRCODE = 'unique_violation',
                  HINT = 'Verifica la disponibilidad del terapeuta antes de agendar.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.validar_disponibilidad_terapeuta() IS 
'Trigger que valida que el terapeuta no tenga citas solapadas en el mismo horario';

-- Crear trigger para validación de disponibilidad
DROP TRIGGER IF EXISTS trigger_validar_disponibilidad ON public.citas;
CREATE TRIGGER trigger_validar_disponibilidad
    BEFORE INSERT OR UPDATE ON public.citas
    FOR EACH ROW
    EXECUTE FUNCTION public.validar_disponibilidad_terapeuta();

-- -----------------------------------------------------------------------------
-- Función: Validar que el paciente tenga saldo suficiente en su bono
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_saldo_bono()
RETURNS TRIGGER AS $$
DECLARE
    bono_record record;
BEGIN
    -- Solo validar si se debe descontar de bono
    IF NOT NEW.descontar_de_bono OR NEW.bono_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Obtener información del bono
    SELECT * INTO bono_record
    FROM public.bonos
    WHERE id = NEW.bono_id;
    
    -- Validar que el bono exista
    IF bono_record IS NULL THEN
        RAISE EXCEPTION 'El bono especificado no existe'
            USING ERRCODE = 'foreign_key_violation';
    END IF;
    
    -- Validar que el bono esté activo
    IF bono_record.estado != 'activo' THEN
        RAISE EXCEPTION 'El bono no está activo. Estado actual: %', bono_record.estado
            USING ERRCODE = 'check_violation',
                  HINT = 'Solo se pueden usar bonos en estado activo.';
    END IF;
    
    -- Validar que tenga sesiones disponibles
    IF bono_record.sesiones_restantes <= 0 THEN
        RAISE EXCEPTION 'El bono no tiene sesiones disponibles (% sesiones restantes)', 
                       bono_record.sesiones_restantes
            USING ERRCODE = 'check_violation',
                  HINT = 'El paciente debe renovar o comprar un nuevo bono.';
    END IF;
    
    -- Validar que el bono pertenezca al paciente de la cita
    IF bono_record.paciente_id != NEW.paciente_id THEN
        RAISE EXCEPTION 'El bono no pertenece al paciente de la cita'
            USING ERRCODE = 'foreign_key_violation';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.validar_saldo_bono() IS 
'Trigger que valida que el paciente tenga sesiones disponibles en su bono antes de agendar';

-- Crear trigger para validación de saldo
DROP TRIGGER IF EXISTS trigger_validar_saldo_bono ON public.citas;
CREATE TRIGGER trigger_validar_saldo_bono
    BEFORE INSERT OR UPDATE ON public.citas
    FOR EACH ROW
    EXECUTE FUNCTION public.validar_saldo_bono();

-- =============================================================================
-- SECCIÓN 6: FUNCIONES DE AUTOMATIZACIÓN
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Función: Descontar automáticamente sesión del bono al completar la cita
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.descontar_sesion_bono_automatico()
RETURNS TRIGGER AS $$
DECLARE
    bono_record record;
    nuevas_sesiones_restantes integer;
BEGIN
    -- Solo actuar si:
    -- 1. El estado cambió a 'realizada'
    -- 2. Debe descontar de bono
    -- 3. Tiene un bono asociado
    -- 4. No se ha descontado previamente
    IF NEW.estado = 'realizada' 
       AND (OLD.estado IS NULL OR OLD.estado != 'realizada')
       AND NEW.descontar_de_bono = true
       AND NEW.bono_id IS NOT NULL
       AND NEW.sesion_descontada = false THEN
        
        -- Obtener información actual del bono
        SELECT * INTO bono_record
        FROM public.bonos
        WHERE id = NEW.bono_id
        FOR UPDATE;  -- Lock para evitar condiciones de carrera
        
        -- Validar que el bono aún tenga sesiones
        IF bono_record.sesiones_restantes <= 0 THEN
            RAISE WARNING 'El bono % no tiene sesiones disponibles para descontar', NEW.bono_id;
            RETURN NEW;
        END IF;
        
        -- Calcular nuevas sesiones restantes
        nuevas_sesiones_restantes := bono_record.sesiones_restantes - 1;
        
        -- Actualizar el bono
        UPDATE public.bonos
        SET 
            sesiones_restantes = nuevas_sesiones_restantes,
            estado = CASE 
                WHEN nuevas_sesiones_restantes <= 0 THEN 'agotado'::estado_bono
                ELSE estado 
            END,
            updated_at = now()
        WHERE id = NEW.bono_id;
        
        -- Marcar la sesión como descontada
        NEW.sesion_descontada := true;
        
        -- Log de la operación
        RAISE NOTICE 'Sesión descontada del bono %. Sesiones restantes: %', 
                     NEW.bono_id, nuevas_sesiones_restantes;
        
        -- Si quedan pocas sesiones, registrar alerta
        IF nuevas_sesiones_restantes <= 2 THEN
            INSERT INTO public.logs_evento (tipo, detalle, actor_id)
            VALUES (
                'bono_sesiones_bajas',
                jsonb_build_object(
                    'bono_id', NEW.bono_id,
                    'paciente_id', NEW.paciente_id,
                    'sesiones_restantes', nuevas_sesiones_restantes,
                    'cita_id', NEW.id,
                    'mensaje', CASE 
                        WHEN nuevas_sesiones_restantes = 0 THEN 'Bono agotado - Informar al paciente'
                        WHEN nuevas_sesiones_restantes = 1 THEN 'Última sesión del bono - Considerar renovación'
                        ELSE 'Pocas sesiones restantes - Advertir al paciente'
                    END
                ),
                NEW.created_by
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.descontar_sesion_bono_automatico() IS 
'Trigger que descuenta automáticamente una sesión del bono cuando la cita se marca como realizada';

-- Crear trigger para descuento automático
DROP TRIGGER IF EXISTS trigger_descontar_sesion_bono ON public.citas;
CREATE TRIGGER trigger_descontar_sesion_bono
    BEFORE UPDATE ON public.citas
    FOR EACH ROW
    EXECUTE FUNCTION public.descontar_sesion_bono_automatico();

-- -----------------------------------------------------------------------------
-- Función: Registrar cambios de estado de cita en log de eventos
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.registrar_cambio_estado_cita()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar si el estado cambió
    IF OLD.estado IS NOT NULL AND NEW.estado != OLD.estado THEN
        INSERT INTO public.logs_evento (tipo, detalle, actor_id)
        VALUES (
            'cambio_estado_cita',
            jsonb_build_object(
                'cita_id', NEW.id,
                'paciente_id', NEW.paciente_id,
                'terapeuta_id', NEW.terapeuta_id,
                'estado_anterior', OLD.estado,
                'estado_nuevo', NEW.estado,
                'fecha_cita', NEW.fecha_cita,
                'hora_inicio', NEW.hora_inicio
            ),
            NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.registrar_cambio_estado_cita() IS 
'Trigger que registra cambios de estado de citas en el log de eventos para auditoría';

-- Crear trigger para registro de cambios
DROP TRIGGER IF EXISTS trigger_registrar_cambio_estado ON public.citas;
CREATE TRIGGER trigger_registrar_cambio_estado
    AFTER UPDATE ON public.citas
    FOR EACH ROW
    EXECUTE FUNCTION public.registrar_cambio_estado_cita();

-- =============================================================================
-- SECCIÓN 7: FUNCIONES DE CONSULTA Y UTILIDAD
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Función: Obtener estadísticas de bonos por paciente
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_bono(p_bono_id uuid)
RETURNS TABLE (
    bono_id uuid,
    paciente_id uuid,
    total_sesiones integer,
    sesiones_restantes integer,
    sesiones_usadas integer,
    porcentaje_usado numeric,
    citas_realizadas integer,
    citas_pendientes integer,
    estado text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as bono_id,
        b.paciente_id,
        CAST(b.total_sesiones AS integer),
        CAST(b.sesiones_restantes AS integer),
        CAST(b.total_sesiones - b.sesiones_restantes AS integer) as sesiones_usadas,
        ROUND(((b.total_sesiones - b.sesiones_restantes)::numeric / NULLIF(b.total_sesiones, 0)) * 100, 2) as porcentaje_usado,
        CAST(COUNT(c.id) FILTER (WHERE c.estado = 'realizada') AS integer) as citas_realizadas,
        CAST(COUNT(c.id) FILTER (WHERE c.estado IN ('pendiente', 'confirmada')) AS integer) as citas_pendientes,
        b.estado::text
    FROM public.bonos b
    LEFT JOIN public.citas c ON c.bono_id = b.id
    WHERE b.id = p_bono_id
    GROUP BY b.id, b.paciente_id, b.total_sesiones, b.sesiones_restantes, b.estado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.obtener_estadisticas_bono(uuid) IS 
'Devuelve estadísticas detalladas de uso de un bono específico';

-- -----------------------------------------------------------------------------
-- Función: Verificar disponibilidad de terapeuta en un horario
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verificar_disponibilidad_terapeuta(
    p_terapeuta_id uuid,
    p_fecha date,
    p_hora_inicio time,
    p_hora_fin time
)
RETURNS boolean AS $$
DECLARE
    citas_conflicto integer;
BEGIN
    SELECT COUNT(*) INTO citas_conflicto
    FROM public.citas
    WHERE terapeuta_id = p_terapeuta_id
      AND fecha_cita = p_fecha
      AND estado IN ('pendiente', 'confirmada', 'realizada')
      AND (
          (p_hora_inicio >= hora_inicio AND p_hora_inicio < hora_fin) OR
          (p_hora_fin > hora_inicio AND p_hora_fin <= hora_fin) OR
          (p_hora_inicio <= hora_inicio AND p_hora_fin >= hora_fin)
      );
    
    RETURN citas_conflicto = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.verificar_disponibilidad_terapeuta(uuid, date, time, time) IS 
'Verifica si un terapeuta está disponible en un horario específico';

-- -----------------------------------------------------------------------------
-- Función: Obtener próximas citas de un paciente
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.obtener_proximas_citas_paciente(
    p_paciente_id uuid,
    p_limite integer DEFAULT 10
)
RETURNS TABLE (
    cita_id uuid,
    terapeuta_nombre text,
    fecha_cita date,
    hora_inicio time,
    hora_fin time,
    modalidad text,
    estado text,
    dias_restantes integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as cita_id,
        t.nombre_completo as terapeuta_nombre,
        c.fecha_cita,
        c.hora_inicio,
        c.hora_fin,
        c.modalidad::text,
        c.estado::text,
        CAST(c.fecha_cita - CURRENT_DATE AS integer) as dias_restantes
    FROM public.citas c
    JOIN public.terapeutas t ON t.id = c.terapeuta_id
    WHERE c.paciente_id = p_paciente_id
      AND c.fecha_cita >= CURRENT_DATE
      AND c.estado IN ('pendiente', 'confirmada')
    ORDER BY c.fecha_cita, c.hora_inicio
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.obtener_proximas_citas_paciente(uuid, integer) IS 
'Devuelve las próximas citas programadas de un paciente';

-- =============================================================================
-- SECCIÓN 8: VISTAS ÚTILES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Vista: Resumen de citas con información completa
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.vista_citas_completas AS
SELECT 
    c.id as cita_id,
    c.fecha_cita,
    c.hora_inicio,
    c.hora_fin,
    c.duracion_minutos,
    c.modalidad,
    c.estado,
    
    -- Información del paciente
    p.id as paciente_id,
    COALESCE(p.metadata->>'nombre_completo', p.email) as paciente_nombre,
    p.email as paciente_email,
    p.telefono as paciente_telefono,
    
    -- Información del terapeuta
    t.id as terapeuta_id,
    t.nombre_completo as terapeuta_nombre,
    t.email as terapeuta_email,
    t.especialidad as terapeuta_especialidad,
    
    -- Información del bono
    b.id as bono_id,
    b.total_sesiones,
    b.sesiones_restantes,
    b.tipo_bono,
    c.descontar_de_bono,
    c.sesion_descontada,
    
    -- Observaciones
    c.observaciones,
    c.enlace_videollamada,
    
    -- Metadata
    c.created_at,
    c.updated_at
FROM public.citas c
JOIN public.pacientes p ON p.id = c.paciente_id
JOIN public.terapeutas t ON t.id = c.terapeuta_id
LEFT JOIN public.bonos b ON b.id = c.bono_id;

COMMENT ON VIEW public.vista_citas_completas IS 
'Vista consolidada con toda la información relevante de las citas';

-- -----------------------------------------------------------------------------
-- Vista: Dashboard de bonos por paciente
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.vista_dashboard_bonos AS
SELECT 
    b.id as bono_id,
    b.paciente_id,
    COALESCE(p.metadata->>'nombre_completo', p.email) as paciente_nombre,
    b.total_sesiones,
    b.sesiones_restantes,
    (b.total_sesiones - b.sesiones_restantes) as sesiones_usadas,
    ROUND(((b.total_sesiones - b.sesiones_restantes)::numeric / NULLIF(b.total_sesiones, 0)) * 100, 2) as porcentaje_usado,
    b.tipo_bono,
    b.estado,
    b.precio_total,
    b.fecha_expiracion,
    COUNT(c.id) FILTER (WHERE c.estado = 'realizada') as citas_completadas,
    COUNT(c.id) FILTER (WHERE c.estado IN ('pendiente', 'confirmada')) as citas_programadas,
    b.created_at as fecha_compra,
    b.updated_at as ultima_actualizacion
FROM public.bonos b
JOIN public.pacientes p ON p.id = b.paciente_id
LEFT JOIN public.citas c ON c.bono_id = b.id AND c.descontar_de_bono = true
GROUP BY b.id, b.paciente_id, p.metadata, p.email, b.total_sesiones, b.sesiones_restantes, 
         b.tipo_bono, b.estado, b.precio_total, b.fecha_expiracion, b.created_at, b.updated_at;

COMMENT ON VIEW public.vista_dashboard_bonos IS 
'Vista para dashboard con estadísticas completas de bonos por paciente';

-- =============================================================================
-- SECCIÓN 9: ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS en las tablas nuevas
ALTER TABLE public.terapeutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Políticas RLS para terapeutas
-- -----------------------------------------------------------------------------

-- Permitir lectura a todos los usuarios autenticados (para asignación de citas)
DROP POLICY IF EXISTS "Lectura pública de terapeutas activos" ON public.terapeutas;
CREATE POLICY "Lectura pública de terapeutas activos"
ON public.terapeutas FOR SELECT
TO authenticated
USING (activo = true);

-- Solo staff puede crear/actualizar terapeutas
DROP POLICY IF EXISTS "Staff puede gestionar terapeutas" ON public.terapeutas;
CREATE POLICY "Staff puede gestionar terapeutas"
ON public.terapeutas FOR ALL
TO authenticated
USING (is_staff())
WITH CHECK (is_staff());

-- -----------------------------------------------------------------------------
-- Políticas RLS para citas
-- -----------------------------------------------------------------------------

-- Terapeutas pueden ver sus propias citas
DROP POLICY IF EXISTS "Terapeutas ven sus citas" ON public.citas;
CREATE POLICY "Terapeutas ven sus citas"
ON public.citas FOR SELECT
TO authenticated
USING (
    terapeuta_id IN (
        SELECT id FROM public.terapeutas 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR is_staff()
);

-- Pacientes pueden ver sus propias citas
DROP POLICY IF EXISTS "Pacientes ven sus citas" ON public.citas;
CREATE POLICY "Pacientes ven sus citas"
ON public.citas FOR SELECT
TO authenticated
USING (
    paciente_id = auth.uid()
    OR is_staff()
);

-- Solo staff y terapeutas pueden crear citas
DROP POLICY IF EXISTS "Staff y terapeutas crean citas" ON public.citas;
CREATE POLICY "Staff y terapeutas crean citas"
ON public.citas FOR INSERT
TO authenticated
WITH CHECK (
    is_staff() OR
    terapeuta_id IN (
        SELECT id FROM public.terapeutas 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
);

-- Solo staff y el terapeuta asignado pueden actualizar citas
DROP POLICY IF EXISTS "Staff y terapeuta actualizan citas" ON public.citas;
CREATE POLICY "Staff y terapeuta actualizan citas"
ON public.citas FOR UPDATE
TO authenticated
USING (
    is_staff() OR
    terapeuta_id IN (
        SELECT id FROM public.terapeutas 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
)
WITH CHECK (
    is_staff() OR
    terapeuta_id IN (
        SELECT id FROM public.terapeutas 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
);

-- Solo staff puede eliminar citas
DROP POLICY IF EXISTS "Solo staff elimina citas" ON public.citas;
CREATE POLICY "Solo staff elimina citas"
ON public.citas FOR DELETE
TO authenticated
USING (is_staff());

-- =============================================================================
-- SECCIÓN 10: DATOS DE EJEMPLO (OPCIONAL - COMENTADO POR DEFECTO)
-- =============================================================================

-- Descomentar para insertar datos de ejemplo en desarrollo

/*
-- Insertar terapeuta de ejemplo
INSERT INTO public.terapeutas (
    nombre_completo, email, telefono, especialidad, num_colegiada, 
    disponibilidad, activo
) VALUES (
    'Dra. Karen González',
    'karen@psicologakarem.com',
    '+34 612 345 678',
    'Psicología Clínica',
    'COL-12345',
    '{"lunes": ["09:00-13:00", "15:00-19:00"], "martes": ["09:00-13:00", "15:00-19:00"], "miercoles": ["09:00-13:00", "15:00-19:00"], "jueves": ["09:00-13:00", "15:00-19:00"], "viernes": ["09:00-13:00"]}'::jsonb,
    true
) ON CONFLICT (email) DO NOTHING;
*/

-- =============================================================================
-- SECCIÓN 11: GRANTS Y PERMISOS
-- =============================================================================

-- Otorgar permisos de ejecución a funciones públicas
GRANT EXECUTE ON FUNCTION public.obtener_estadisticas_bono(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_disponibilidad_terapeuta(uuid, date, time, time) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_proximas_citas_paciente(uuid, integer) TO authenticated;

-- Otorgar permisos de lectura en vistas
GRANT SELECT ON public.vista_citas_completas TO authenticated;
GRANT SELECT ON public.vista_dashboard_bonos TO authenticated;

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================

-- Log de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Sistema de gestión de citas instalado correctamente';
    RAISE NOTICE '📋 Tablas creadas: terapeutas, citas (+ actualizaciones a bonos)';
    RAISE NOTICE '⚙️  Triggers instalados: validación de disponibilidad, validación de bonos, descuento automático';
    RAISE NOTICE '🔒 Políticas RLS configuradas';
    RAISE NOTICE '📊 Vistas y funciones auxiliares creadas';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Próximos pasos:';
    RAISE NOTICE '   1. Verificar que las tablas se crearon correctamente';
    RAISE NOTICE '   2. Insertar terapeutas en la tabla public.terapeutas';
    RAISE NOTICE '   3. Actualizar tipos de TypeScript con: npx supabase gen types typescript';
    RAISE NOTICE '   4. Implementar el frontend con los composables actualizados';
END $$;
