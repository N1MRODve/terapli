-- =====================================================
-- MÓDULO DE RECURSOS TERAPÉUTICOS COMPARTIDOS
-- Psicóloga Karem Peña - Sistema Clínico
-- =====================================================

-- Tabla: recursos
-- Almacena los recursos terapéuticos subidos por los terapeutas
CREATE TABLE IF NOT EXISTS public.recursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('PDF', 'Audio', 'Video', 'Ejercicio', 'Lectura', 'Guía', 'Enlace', 'Otro')),
    url TEXT NOT NULL,
    archivo_nombre TEXT,
    archivo_tipo TEXT,
    creado_por UUID REFERENCES public.terapeutas(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: recursos_pacientes
-- Relación entre recursos y pacientes (asignaciones)
CREATE TABLE IF NOT EXISTS public.recursos_pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recurso_id UUID REFERENCES public.recursos(id) ON DELETE CASCADE NOT NULL,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE NOT NULL,
    terapeuta_id UUID REFERENCES public.terapeutas(id) ON DELETE SET NULL,
    mensaje TEXT,
    notificacion_enviada BOOLEAN DEFAULT FALSE,
    visto BOOLEAN DEFAULT FALSE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_visto TIMESTAMP WITH TIME ZONE,
    UNIQUE(recurso_id, paciente_id)
);

-- Tabla: notificaciones
-- Sistema de notificaciones para pacientes
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo TEXT DEFAULT 'recurso' CHECK (tipo IN ('recurso', 'cita', 'sesion', 'mensaje', 'sistema')),
    recurso_id UUID REFERENCES public.recursos(id) ON DELETE CASCADE,
    visto BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    leido_at TIMESTAMP WITH TIME ZONE
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_recursos_creado_por ON public.recursos(creado_por);
CREATE INDEX IF NOT EXISTS idx_recursos_tipo ON public.recursos(tipo);
CREATE INDEX IF NOT EXISTS idx_recursos_pacientes_paciente ON public.recursos_pacientes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_recursos_pacientes_recurso ON public.recursos_pacientes(recurso_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_paciente ON public.notificaciones(paciente_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_visto ON public.notificaciones(visto);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS: recursos
-- =====================================================

-- Los terapeutas pueden ver todos los recursos
CREATE POLICY "Terapeutas pueden ver todos los recursos"
    ON public.recursos FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.terapeutas
            WHERE terapeutas.user_id = auth.uid()
        )
    );

-- Los terapeutas pueden crear recursos
CREATE POLICY "Terapeutas pueden crear recursos"
    ON public.recursos FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.terapeutas
            WHERE terapeutas.user_id = auth.uid()
            AND terapeutas.id = recursos.creado_por
        )
    );

-- Solo el creador puede actualizar su recurso
CREATE POLICY "Terapeutas pueden actualizar sus propios recursos"
    ON public.recursos FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.terapeutas
            WHERE terapeutas.user_id = auth.uid()
            AND terapeutas.id = recursos.creado_por
        )
    );

-- Solo el creador puede eliminar su recurso
CREATE POLICY "Terapeutas pueden eliminar sus propios recursos"
    ON public.recursos FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.terapeutas
            WHERE terapeutas.user_id = auth.uid()
            AND terapeutas.id = recursos.creado_por
        )
    );

-- Los pacientes pueden ver recursos asignados a ellos
CREATE POLICY "Pacientes pueden ver sus recursos asignados"
    ON public.recursos FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.recursos_pacientes rp
            JOIN public.pacientes p ON p.id = rp.paciente_id
            WHERE p.user_id = auth.uid()
            AND rp.recurso_id = recursos.id
        )
    );

-- =====================================================
-- POLÍTICAS: recursos_pacientes
-- =====================================================

-- Terapeutas pueden ver todas las asignaciones
CREATE POLICY "Terapeutas pueden ver todas las asignaciones"
    ON public.recursos_pacientes FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.terapeutas
            WHERE terapeutas.user_id = auth.uid()
        )
    );

-- Terapeutas pueden crear asignaciones
CREATE POLICY "Terapeutas pueden crear asignaciones"
    ON public.recursos_pacientes FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.terapeutas
            WHERE terapeutas.user_id = auth.uid()
            AND terapeutas.id = recursos_pacientes.terapeuta_id
        )
    );

-- Terapeutas pueden actualizar asignaciones
CREATE POLICY "Terapeutas pueden actualizar asignaciones"
    ON public.recursos_pacientes FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.terapeutas
            WHERE terapeutas.user_id = auth.uid()
        )
    );

-- Terapeutas pueden eliminar asignaciones
CREATE POLICY "Terapeutas pueden eliminar asignaciones"
    ON public.recursos_pacientes FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.terapeutas
            WHERE terapeutas.user_id = auth.uid()
        )
    );

-- Pacientes pueden ver sus propias asignaciones
CREATE POLICY "Pacientes pueden ver sus asignaciones"
    ON public.recursos_pacientes FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pacientes
            WHERE pacientes.user_id = auth.uid()
            AND pacientes.id = recursos_pacientes.paciente_id
        )
    );

-- Pacientes pueden actualizar el estado 'visto' de sus asignaciones
CREATE POLICY "Pacientes pueden marcar recursos como vistos"
    ON public.recursos_pacientes FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pacientes
            WHERE pacientes.user_id = auth.uid()
            AND pacientes.id = recursos_pacientes.paciente_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pacientes
            WHERE pacientes.user_id = auth.uid()
            AND pacientes.id = recursos_pacientes.paciente_id
        )
    );

-- =====================================================
-- POLÍTICAS: notificaciones
-- =====================================================

-- Terapeutas pueden crear notificaciones
CREATE POLICY "Terapeutas pueden crear notificaciones"
    ON public.notificaciones FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.terapeutas
            WHERE terapeutas.user_id = auth.uid()
        )
    );

-- Pacientes solo pueden ver sus propias notificaciones
CREATE POLICY "Pacientes pueden ver sus notificaciones"
    ON public.notificaciones FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pacientes
            WHERE pacientes.user_id = auth.uid()
            AND pacientes.id = notificaciones.paciente_id
        )
    );

-- Pacientes pueden actualizar sus notificaciones (marcar como vistas)
CREATE POLICY "Pacientes pueden marcar notificaciones como vistas"
    ON public.notificaciones FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.pacientes
            WHERE pacientes.user_id = auth.uid()
            AND pacientes.id = notificaciones.paciente_id
        )
    );

-- Terapeutas pueden ver todas las notificaciones
CREATE POLICY "Terapeutas pueden ver todas las notificaciones"
    ON public.notificaciones FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.terapeutas
            WHERE terapeutas.user_id = auth.uid()
        )
    );

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para recursos
DROP TRIGGER IF EXISTS update_recursos_updated_at ON public.recursos;
CREATE TRIGGER update_recursos_updated_at
    BEFORE UPDATE ON public.recursos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función: crear notificación automática al asignar recurso
CREATE OR REPLACE FUNCTION crear_notificacion_recurso()
RETURNS TRIGGER AS $$
DECLARE
    v_recurso_titulo TEXT;
BEGIN
    -- Obtener el título del recurso
    SELECT titulo INTO v_recurso_titulo
    FROM public.recursos
    WHERE id = NEW.recurso_id;

    -- Crear la notificación
    INSERT INTO public.notificaciones (
        paciente_id,
        titulo,
        mensaje,
        tipo,
        recurso_id
    ) VALUES (
        NEW.paciente_id,
        'Nuevo recurso compartido',
        CASE 
            WHEN NEW.mensaje IS NOT NULL AND NEW.mensaje != '' 
            THEN CONCAT('Tu terapeuta ha compartido: ', v_recurso_titulo, '. Mensaje: ', NEW.mensaje)
            ELSE CONCAT('Tu terapeuta ha compartido contigo: ', v_recurso_titulo)
        END,
        'recurso',
        NEW.recurso_id
    );

    -- Marcar como notificación enviada
    NEW.notificacion_enviada = TRUE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear notificación al asignar recurso
DROP TRIGGER IF EXISTS trigger_crear_notificacion_recurso ON public.recursos_pacientes;
CREATE TRIGGER trigger_crear_notificacion_recurso
    BEFORE INSERT ON public.recursos_pacientes
    FOR EACH ROW
    EXECUTE FUNCTION crear_notificacion_recurso();

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Comentar o descomentar según necesidad
/*
INSERT INTO public.recursos (titulo, descripcion, tipo, url, creado_por) VALUES
('Guía de Respiración Consciente', 'Ejercicios básicos de respiración para manejo de ansiedad', 'Guía', 'https://ejemplo.com/respiracion.pdf', (SELECT id FROM terapeutas LIMIT 1)),
('Audio: Meditación Guiada', 'Meditación de 10 minutos para principiantes', 'Audio', 'https://ejemplo.com/meditacion.mp3', (SELECT id FROM terapeutas LIMIT 1)),
('Video: Técnicas de Relajación', 'Tutorial sobre técnicas de relajación muscular progresiva', 'Video', 'https://youtube.com/watch?v=ejemplo', (SELECT id FROM terapeutas LIMIT 1));
*/

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
