-- ============================================
-- ACTUALIZACIÓN: SISTEMA DE MENSAJERÍA INTERNA SEGURA
-- Plataforma Clínica - Psicóloga Karem
-- ============================================
-- Este script complementa la tabla 'mensajes' existente
-- y añade notificaciones + funcionalidades

-- ============================================
-- 1. TABLA DE NOTIFICACIONES (Nueva)
-- ============================================

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

COMMENT ON TABLE public.notificaciones IS 'Sistema de notificaciones internas para mensajes y eventos';

-- Índices para optimizar consultas de notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON public.notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_visto ON public.notificaciones(visto);
CREATE INDEX IF NOT EXISTS idx_notificaciones_created_at ON public.notificaciones(created_at DESC);

-- ============================================
-- 2. ÍNDICES ADICIONALES PARA MENSAJES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_mensajes_autor ON public.mensajes(autor_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_receptor ON public.mensajes(receptor_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_created_at ON public.mensajes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_leido ON public.mensajes(leido) WHERE leido = false;

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en notificaciones (mensajes ya lo tiene)
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para NOTIFICACIONES
DROP POLICY IF EXISTS "usuarios_ven_sus_notificaciones" ON public.notificaciones;
CREATE POLICY "usuarios_ven_sus_notificaciones"
ON public.notificaciones FOR SELECT
USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "sistema_crea_notificaciones" ON public.notificaciones;
CREATE POLICY "sistema_crea_notificaciones"
ON public.notificaciones FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "usuarios_actualizan_sus_notificaciones" ON public.notificaciones;
CREATE POLICY "usuarios_actualizan_sus_notificaciones"
ON public.notificaciones FOR UPDATE
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "usuarios_eliminan_sus_notificaciones" ON public.notificaciones;
CREATE POLICY "usuarios_eliminan_sus_notificaciones"
ON public.notificaciones FOR DELETE
USING (auth.uid() = usuario_id);

-- Asegurar políticas en MENSAJES (si no existen)
DROP POLICY IF EXISTS "usuarios_ven_sus_mensajes" ON public.mensajes;
CREATE POLICY "usuarios_ven_sus_mensajes"
ON public.mensajes FOR SELECT
USING (
    auth.uid() = autor_id OR 
    auth.uid() = receptor_id
);

DROP POLICY IF EXISTS "usuarios_envian_mensajes" ON public.mensajes;
CREATE POLICY "usuarios_envian_mensajes"
ON public.mensajes FOR INSERT
WITH CHECK (auth.uid() = autor_id);

DROP POLICY IF EXISTS "receptor_marca_leido" ON public.mensajes;
CREATE POLICY "receptor_marca_leido"
ON public.mensajes FOR UPDATE
USING (auth.uid() = receptor_id)
WITH CHECK (auth.uid() = receptor_id);

-- ============================================
-- 4. FUNCIÓN: Crear notificación al enviar mensaje
-- ============================================

CREATE OR REPLACE FUNCTION public.crear_notificacion_mensaje()
RETURNS TRIGGER AS $$
DECLARE
    nombre_autor TEXT;
    rol_autor public.user_role;
BEGIN
    -- Obtener información del autor
    SELECT p.nombre_completo, p.rol INTO nombre_autor, rol_autor
    FROM public.profiles p
    WHERE p.id = NEW.autor_id;

    -- Crear notificación para el receptor
    INSERT INTO public.notificaciones (
        usuario_id,
        titulo,
        mensaje,
        tipo,
        relacionado_id
    ) VALUES (
        NEW.receptor_id,
        'Nuevo mensaje',
        CASE 
            WHEN rol_autor = 'psicologa' THEN 'Tu terapeuta te ha enviado un mensaje'
            ELSE COALESCE(nombre_autor, 'Un usuario') || ' te ha enviado un mensaje'
        END,
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
-- 5. FUNCIÓN: Obtener conversaciones del usuario
-- ============================================

CREATE OR REPLACE FUNCTION public.obtener_conversaciones(p_usuario_id UUID)
RETURNS TABLE (
    interlocutor_id UUID,
    interlocutor_nombre TEXT,
    interlocutor_rol public.user_role,
    ultimo_mensaje TEXT,
    ultima_fecha TIMESTAMP WITH TIME ZONE,
    mensajes_no_leidos BIGINT,
    ultimo_es_mio BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH mensajes_usuario AS (
        SELECT 
            CASE 
                WHEN m.autor_id = p_usuario_id THEN m.receptor_id
                ELSE m.autor_id
            END AS interlocutor,
            m.contenido,
            m.created_at,
            m.leido,
            m.receptor_id,
            m.autor_id
        FROM public.mensajes m
        WHERE m.autor_id = p_usuario_id OR m.receptor_id = p_usuario_id
    ),
    ultimos_mensajes AS (
        SELECT DISTINCT ON (interlocutor)
            interlocutor,
            contenido,
            created_at,
            autor_id
        FROM mensajes_usuario
        ORDER BY interlocutor, created_at DESC
    )
    SELECT 
        um.interlocutor AS interlocutor_id,
        p.nombre_completo AS interlocutor_nombre,
        p.rol AS interlocutor_rol,
        um.contenido AS ultimo_mensaje,
        um.created_at AS ultima_fecha,
        COUNT(*) FILTER (
            WHERE mu.leido = false 
            AND mu.receptor_id = p_usuario_id
        ) AS mensajes_no_leidos,
        um.autor_id = p_usuario_id AS ultimo_es_mio
    FROM ultimos_mensajes um
    LEFT JOIN mensajes_usuario mu ON mu.interlocutor = um.interlocutor
    LEFT JOIN public.profiles p ON p.id = um.interlocutor
    GROUP BY um.interlocutor, p.nombre_completo, p.rol, um.contenido, um.created_at, um.autor_id
    ORDER BY um.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. FUNCIÓN: Marcar mensajes como leídos
-- ============================================

CREATE OR REPLACE FUNCTION public.marcar_mensajes_leidos(
    p_autor_id UUID,
    p_receptor_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    mensajes_actualizados INTEGER;
BEGIN
    UPDATE public.mensajes
    SET leido = true
    WHERE autor_id = p_autor_id
        AND receptor_id = p_receptor_id
        AND leido = false;
    
    GET DIAGNOSTICS mensajes_actualizados = ROW_COUNT;
    RETURN mensajes_actualizados;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. VISTA: Resumen de mensajes no leídos
-- ============================================

CREATE OR REPLACE VIEW public.vista_mensajes_no_leidos AS
SELECT 
    m.receptor_id AS usuario_id,
    m.autor_id AS remitente_id,
    p.nombre_completo AS remitente_nombre,
    COUNT(*) AS cantidad_mensajes,
    MAX(m.created_at) AS ultimo_mensaje_fecha
FROM public.mensajes m
JOIN public.profiles p ON p.id = m.autor_id
WHERE m.leido = false
GROUP BY m.receptor_id, m.autor_id, p.nombre_completo;

COMMENT ON VIEW public.vista_mensajes_no_leidos IS 'Resumen de mensajes no leídos agrupados por remitente';

-- ============================================
-- 8. GRANTS (Permisos)
-- ============================================

-- Permisos para notificaciones
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificaciones TO authenticated;
GRANT USAGE ON SEQUENCE notificaciones_id_seq TO authenticated;

-- Permisos para funciones
GRANT EXECUTE ON FUNCTION public.obtener_conversaciones TO authenticated;
GRANT EXECUTE ON FUNCTION public.marcar_mensajes_leidos TO authenticated;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
