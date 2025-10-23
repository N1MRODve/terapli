-- ============================================
-- SISTEMA DE MENSAJERÍA INTERNA SEGURA
-- Plataforma Clínica - Psicóloga Karem
-- ============================================

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS public.mensajes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    remitente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    destinatario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sesion_id UUID REFERENCES public.sesiones(id) ON DELETE SET NULL,
    mensaje TEXT NOT NULL,
    visto BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    mensaje TEXT,
    tipo TEXT DEFAULT 'mensaje',
    visto BOOLEAN DEFAULT false,
    relacionado_id UUID, -- ID del mensaje o recurso relacionado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON public.mensajes(remitente_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario ON public.mensajes(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_created_at ON public.mensajes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON public.notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_visto ON public.notificaciones(visto);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en ambas tablas
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para MENSAJES
-- Solo los participantes (remitente o destinatario) pueden ver los mensajes
DROP POLICY IF EXISTS "solo_participantes_pueden_ver_mensajes" ON public.mensajes;
CREATE POLICY "solo_participantes_pueden_ver_mensajes"
ON public.mensajes FOR SELECT
USING (
    auth.uid() = remitente_id OR 
    auth.uid() = destinatario_id
);

-- Solo usuarios autenticados pueden insertar mensajes
DROP POLICY IF EXISTS "usuarios_pueden_enviar_mensajes" ON public.mensajes;
CREATE POLICY "usuarios_pueden_enviar_mensajes"
ON public.mensajes FOR INSERT
WITH CHECK (
    auth.uid() = remitente_id
);

-- Solo el destinatario puede actualizar el estado "visto"
DROP POLICY IF EXISTS "destinatario_puede_marcar_visto" ON public.mensajes;
CREATE POLICY "destinatario_puede_marcar_visto"
ON public.mensajes FOR UPDATE
USING (auth.uid() = destinatario_id)
WITH CHECK (auth.uid() = destinatario_id);

-- Políticas para NOTIFICACIONES
-- Solo el usuario puede ver sus notificaciones
DROP POLICY IF EXISTS "usuarios_ven_sus_notificaciones" ON public.notificaciones;
CREATE POLICY "usuarios_ven_sus_notificaciones"
ON public.notificaciones FOR SELECT
USING (auth.uid() = usuario_id);

-- Sistema puede crear notificaciones
DROP POLICY IF EXISTS "sistema_crea_notificaciones" ON public.notificaciones;
CREATE POLICY "sistema_crea_notificaciones"
ON public.notificaciones FOR INSERT
WITH CHECK (true);

-- Usuario puede actualizar sus notificaciones
DROP POLICY IF EXISTS "usuarios_actualizan_sus_notificaciones" ON public.notificaciones;
CREATE POLICY "usuarios_actualizan_sus_notificaciones"
ON public.notificaciones FOR UPDATE
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- Usuario puede eliminar sus notificaciones
DROP POLICY IF EXISTS "usuarios_eliminan_sus_notificaciones" ON public.notificaciones;
CREATE POLICY "usuarios_eliminan_sus_notificaciones"
ON public.notificaciones FOR DELETE
USING (auth.uid() = usuario_id);

-- ============================================
-- FUNCIÓN: Crear notificación al enviar mensaje
-- ============================================

CREATE OR REPLACE FUNCTION public.crear_notificacion_mensaje()
RETURNS TRIGGER AS $$
DECLARE
    nombre_remitente TEXT;
BEGIN
    -- Obtener el nombre del remitente
    SELECT COALESCE(nombre_completo, email) INTO nombre_remitente
    FROM auth.users
    WHERE id = NEW.remitente_id;

    -- Crear notificación para el destinatario
    INSERT INTO public.notificaciones (
        usuario_id,
        titulo,
        mensaje,
        tipo,
        relacionado_id
    ) VALUES (
        NEW.destinatario_id,
        'Nuevo mensaje',
        'Has recibido un mensaje de ' || COALESCE(nombre_remitente, 'tu terapeuta/paciente'),
        'mensaje',
        NEW.id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear notificaciones automáticamente
DROP TRIGGER IF EXISTS trigger_notificacion_mensaje ON public.mensajes;
CREATE TRIGGER trigger_notificacion_mensaje
    AFTER INSERT ON public.mensajes
    FOR EACH ROW
    EXECUTE FUNCTION public.crear_notificacion_mensaje();

-- ============================================
-- FUNCIÓN: Obtener conversaciones del usuario
-- ============================================

CREATE OR REPLACE FUNCTION public.obtener_conversaciones(usuario_id UUID)
RETURNS TABLE (
    interlocutor_id UUID,
    ultimo_mensaje TEXT,
    ultima_fecha TIMESTAMP WITH TIME ZONE,
    mensajes_no_vistos BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH mensajes_usuario AS (
        SELECT 
            CASE 
                WHEN remitente_id = usuario_id THEN destinatario_id
                ELSE remitente_id
            END AS interlocutor,
            mensaje,
            created_at,
            visto,
            destinatario_id
        FROM public.mensajes
        WHERE remitente_id = usuario_id OR destinatario_id = usuario_id
    ),
    ultimos_mensajes AS (
        SELECT DISTINCT ON (interlocutor)
            interlocutor,
            mensaje,
            created_at
        FROM mensajes_usuario
        ORDER BY interlocutor, created_at DESC
    )
    SELECT 
        um.interlocutor AS interlocutor_id,
        um.mensaje AS ultimo_mensaje,
        um.created_at AS ultima_fecha,
        COUNT(*) FILTER (WHERE mu.visto = false AND mu.destinatario_id = usuario_id) AS mensajes_no_vistos
    FROM ultimos_mensajes um
    LEFT JOIN mensajes_usuario mu ON mu.interlocutor = um.interlocutor
    GROUP BY um.interlocutor, um.mensaje, um.created_at
    ORDER BY um.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE public.mensajes IS 'Almacena los mensajes privados entre terapeuta y paciente';
COMMENT ON TABLE public.notificaciones IS 'Sistema de notificaciones internas para mensajes y eventos';
COMMENT ON FUNCTION public.crear_notificacion_mensaje IS 'Crea automáticamente una notificación cuando se envía un mensaje';
COMMENT ON FUNCTION public.obtener_conversaciones IS 'Obtiene lista de conversaciones con último mensaje y conteo de no vistos';
