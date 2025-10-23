-- =====================================================
-- MÓDULO DE RECURSOS COMPARTIDOS
-- Repositorio colaborativo de documentos y materiales
-- para envío a pacientes
-- =====================================================

-- =====================================================
-- 1. TABLA PRINCIPAL: recursos
-- =====================================================

CREATE TABLE IF NOT EXISTS public.recursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Información del recurso
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('pdf', 'video', 'articulo', 'audio', 'ejercicio', 'imagen', 'otro')),
  
  -- Contenido
  url TEXT, -- URL externa (YouTube, artículo web, etc.)
  archivo_url TEXT, -- URL de archivo subido a Supabase Storage
  archivo_nombre VARCHAR(255), -- Nombre original del archivo
  archivo_tamano INTEGER, -- Tamaño en bytes
  
  -- Metadatos
  etiquetas TEXT[], -- Array de etiquetas para filtrado
  duracion_minutos INTEGER, -- Para videos/audios
  
  -- Visibilidad y autoría
  creado_por_terapeuta_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  es_publico BOOLEAN DEFAULT true, -- Si otros terapeutas pueden verlo
  
  -- Estadísticas
  veces_enviado INTEGER DEFAULT 0,
  veces_visto INTEGER DEFAULT 0,
  
  -- Timestamps
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_recursos_tipo ON public.recursos(tipo);
CREATE INDEX idx_recursos_creado_por ON public.recursos(creado_por_terapeuta_id);
CREATE INDEX idx_recursos_es_publico ON public.recursos(es_publico);
CREATE INDEX idx_recursos_etiquetas ON public.recursos USING GIN(etiquetas);
CREATE INDEX idx_recursos_creado_en ON public.recursos(creado_en DESC);

-- =====================================================
-- 2. TABLA: recursos_pacientes
-- Registro de recursos enviados a pacientes
-- =====================================================

CREATE TABLE IF NOT EXISTS public.recursos_pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referencias
  recurso_id UUID NOT NULL REFERENCES public.recursos(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  terapeuta_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Estado
  enviado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  visto_en TIMESTAMP WITH TIME ZONE,
  visto BOOLEAN DEFAULT false,
  
  -- Mensaje personalizado al enviar
  mensaje_terapeuta TEXT,
  
  -- Feedback del paciente (opcional)
  calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario_paciente TEXT,
  
  -- Timestamps
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_recursos_pacientes_recurso ON public.recursos_pacientes(recurso_id);
CREATE INDEX idx_recursos_pacientes_paciente ON public.recursos_pacientes(paciente_id);
CREATE INDEX idx_recursos_pacientes_terapeuta ON public.recursos_pacientes(terapeuta_id);
CREATE INDEX idx_recursos_pacientes_visto ON public.recursos_pacientes(visto);
CREATE UNIQUE INDEX idx_recursos_pacientes_unique ON public.recursos_pacientes(recurso_id, paciente_id);

-- =====================================================
-- 3. TRIGGER: Actualizar contador de envíos
-- =====================================================

CREATE OR REPLACE FUNCTION incrementar_contador_envios()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrementar veces_enviado en tabla recursos
  UPDATE public.recursos
  SET veces_enviado = veces_enviado + 1
  WHERE id = NEW.recurso_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_incrementar_envios
AFTER INSERT ON public.recursos_pacientes
FOR EACH ROW
EXECUTE FUNCTION incrementar_contador_envios();

-- =====================================================
-- 4. TRIGGER: Actualizar contador de visualizaciones
-- =====================================================

CREATE OR REPLACE FUNCTION incrementar_contador_vistas()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo incrementar si visto cambió a true
  IF NEW.visto = true AND (OLD.visto = false OR OLD.visto IS NULL) THEN
    UPDATE public.recursos
    SET veces_visto = veces_visto + 1
    WHERE id = NEW.recurso_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_incrementar_vistas
AFTER UPDATE ON public.recursos_pacientes
FOR EACH ROW
EXECUTE FUNCTION incrementar_contador_vistas();

-- =====================================================
-- 5. TRIGGER: Actualizar timestamp automático
-- =====================================================

CREATE OR REPLACE FUNCTION actualizar_timestamp_recursos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_recursos
BEFORE UPDATE ON public.recursos
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp_recursos();

CREATE TRIGGER trigger_actualizar_recursos_pacientes
BEFORE UPDATE ON public.recursos_pacientes
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp_recursos();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_pacientes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6.1 Políticas para RECURSOS
-- =====================================================

-- TERAPEUTAS pueden ver:
-- 1. Recursos públicos de todos
-- 2. Sus propios recursos privados
CREATE POLICY "Terapeutas pueden ver recursos disponibles"
ON public.recursos
FOR SELECT
USING (
  auth.jwt()->>'user_role' = 'terapeuta'
  AND (
    es_publico = true 
    OR creado_por_terapeuta_id = auth.uid()
  )
);

-- TERAPEUTAS pueden crear recursos
CREATE POLICY "Terapeutas pueden crear recursos"
ON public.recursos
FOR INSERT
WITH CHECK (
  auth.jwt()->>'user_role' = 'terapeuta'
  AND creado_por_terapeuta_id = auth.uid()
);

-- TERAPEUTAS solo pueden editar sus propios recursos
CREATE POLICY "Terapeutas pueden editar sus recursos"
ON public.recursos
FOR UPDATE
USING (
  auth.jwt()->>'user_role' = 'terapeuta'
  AND creado_por_terapeuta_id = auth.uid()
)
WITH CHECK (
  auth.jwt()->>'user_role' = 'terapeuta'
  AND creado_por_terapeuta_id = auth.uid()
);

-- TERAPEUTAS solo pueden eliminar sus propios recursos
CREATE POLICY "Terapeutas pueden eliminar sus recursos"
ON public.recursos
FOR DELETE
USING (
  auth.jwt()->>'user_role' = 'terapeuta'
  AND creado_por_terapeuta_id = auth.uid()
);

-- PACIENTES pueden ver recursos que les han sido enviados
CREATE POLICY "Pacientes pueden ver sus recursos"
ON public.recursos
FOR SELECT
USING (
  auth.jwt()->>'user_role' = 'paciente'
  AND EXISTS (
    SELECT 1 FROM public.recursos_pacientes
    WHERE recursos_pacientes.recurso_id = recursos.id
    AND recursos_pacientes.paciente_id IN (
      SELECT id FROM public.pacientes WHERE user_id = auth.uid()
    )
  )
);

-- =====================================================
-- 6.2 Políticas para RECURSOS_PACIENTES
-- =====================================================

-- TERAPEUTAS pueden ver sus propios envíos
CREATE POLICY "Terapeutas ven sus envíos"
ON public.recursos_pacientes
FOR SELECT
USING (
  auth.jwt()->>'user_role' = 'terapeuta'
  AND terapeuta_id = auth.uid()
);

-- TERAPEUTAS pueden enviar recursos a sus pacientes
CREATE POLICY "Terapeutas pueden enviar recursos"
ON public.recursos_pacientes
FOR INSERT
WITH CHECK (
  auth.jwt()->>'user_role' = 'terapeuta'
  AND terapeuta_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.pacientes
    WHERE pacientes.id = recursos_pacientes.paciente_id
    AND pacientes.terapeuta_id = auth.uid()
  )
);

-- PACIENTES pueden ver recursos enviados a ellos
CREATE POLICY "Pacientes ven sus recursos"
ON public.recursos_pacientes
FOR SELECT
USING (
  auth.jwt()->>'user_role' = 'paciente'
  AND paciente_id IN (
    SELECT id FROM public.pacientes WHERE user_id = auth.uid()
  )
);

-- PACIENTES pueden actualizar estado (visto, calificación, comentario)
CREATE POLICY "Pacientes pueden actualizar estado"
ON public.recursos_pacientes
FOR UPDATE
USING (
  auth.jwt()->>'user_role' = 'paciente'
  AND paciente_id IN (
    SELECT id FROM public.pacientes WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  auth.jwt()->>'user_role' = 'paciente'
  AND paciente_id IN (
    SELECT id FROM public.pacientes WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- 7. FUNCIÓN: Obtener recursos populares
-- =====================================================

CREATE OR REPLACE FUNCTION obtener_recursos_populares(limite INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  titulo VARCHAR,
  descripcion TEXT,
  tipo VARCHAR,
  veces_enviado INTEGER,
  veces_visto INTEGER,
  creado_por_terapeuta_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.titulo,
    r.descripcion,
    r.tipo,
    r.veces_enviado,
    r.veces_visto,
    r.creado_por_terapeuta_id
  FROM public.recursos r
  WHERE r.es_publico = true
  ORDER BY r.veces_enviado DESC, r.veces_visto DESC
  LIMIT limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. FUNCIÓN: Obtener estadísticas de terapeuta
-- =====================================================

CREATE OR REPLACE FUNCTION obtener_estadisticas_recursos_terapeuta(terapeuta_uuid UUID)
RETURNS JSON AS $$
DECLARE
  resultado JSON;
BEGIN
  SELECT json_build_object(
    'recursos_creados', (
      SELECT COUNT(*) FROM public.recursos 
      WHERE creado_por_terapeuta_id = terapeuta_uuid
    ),
    'recursos_enviados', (
      SELECT COUNT(*) FROM public.recursos_pacientes 
      WHERE terapeuta_id = terapeuta_uuid
    ),
    'recursos_vistos', (
      SELECT COUNT(*) FROM public.recursos_pacientes 
      WHERE terapeuta_id = terapeuta_uuid AND visto = true
    ),
    'recurso_mas_enviado', (
      SELECT json_build_object(
        'titulo', r.titulo,
        'veces', r.veces_enviado
      )
      FROM public.recursos r
      WHERE r.creado_por_terapeuta_id = terapeuta_uuid
      ORDER BY r.veces_enviado DESC
      LIMIT 1
    )
  ) INTO resultado;
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. VISTA: Recursos con información del creador
-- =====================================================

CREATE OR REPLACE VIEW vista_recursos_completa AS
SELECT 
  r.id,
  r.titulo,
  r.descripcion,
  r.tipo,
  r.url,
  r.archivo_url,
  r.archivo_nombre,
  r.archivo_tamano,
  r.etiquetas,
  r.duracion_minutos,
  r.es_publico,
  r.veces_enviado,
  r.veces_visto,
  r.creado_en,
  r.actualizado_en,
  r.creado_por_terapeuta_id,
  p.nombre_completo as creador_nombre,
  p.email as creador_email
FROM public.recursos r
LEFT JOIN public.perfiles p ON p.id = r.creado_por_terapeuta_id;

-- =====================================================
-- 10. DATOS INICIALES: Recursos de ejemplo
-- =====================================================

-- Nota: Estos recursos se insertarán sin terapeuta_id específico
-- Se pueden asignar más adelante o crear con es_publico = true

INSERT INTO public.recursos (titulo, descripcion, tipo, url, es_publico, etiquetas, duracion_minutos) VALUES
('Técnica de Respiración 4-7-8', 'Ejercicio de respiración para reducir ansiedad en momentos de estrés. Inhala 4 segundos, sostén 7 segundos, exhala 8 segundos.', 'ejercicio', NULL, true, ARRAY['ansiedad', 'respiracion', 'mindfulness'], 5),

('Guía de Higiene del Sueño', 'PDF con recomendaciones científicas para mejorar la calidad del sueño: horarios, ambiente, hábitos pre-sueño.', 'pdf', 'https://ejemplo.com/guia-sueno.pdf', true, ARRAY['sueno', 'habitos', 'descanso'], NULL),

('Meditación Guiada para Principiantes', 'Audio de meditación mindfulness de 10 minutos para reducir estrés y aumentar conciencia presente.', 'audio', 'https://ejemplo.com/meditacion.mp3', true, ARRAY['meditacion', 'mindfulness', 'estres'], 10),

('Diario de Emociones - Plantilla', 'Plantilla descargable para llevar un registro diario de emociones, pensamientos y situaciones desencadenantes.', 'pdf', 'https://ejemplo.com/diario-emociones.pdf', true, ARRAY['emociones', 'autoconocimiento', 'registro'], NULL),

('Cómo identificar pensamientos automáticos', 'Artículo educativo sobre terapia cognitiva: qué son los pensamientos automáticos y cómo cuestionarlos.', 'articulo', 'https://ejemplo.com/pensamientos-automaticos', true, ARRAY['terapia-cognitiva', 'pensamientos', 'educacion'], NULL),

('Ejercicios de Relajación Muscular Progresiva', 'Video tutorial de 15 minutos con ejercicios de tensión-relajación de grupos musculares para reducir tensión física.', 'video', 'https://youtube.com/ejemplo-relajacion', true, ARRAY['relajacion', 'ansiedad', 'ejercicio'], 15),

('Lista de Actividades Placenteras', 'Lista de 100 actividades simples para activación conductual en casos de depresión o apatía.', 'pdf', 'https://ejemplo.com/actividades-placenteras.pdf', true, ARRAY['depresion', 'activacion', 'bienestar'], NULL),

('Comunicación Asertiva - Guía Práctica', 'Guía con ejemplos de cómo expresar necesidades, establecer límites y comunicarse de forma saludable.', 'pdf', 'https://ejemplo.com/comunicacion-asertiva.pdf', true, ARRAY['comunicacion', 'asertividad', 'relaciones'], NULL);

-- =====================================================
-- 11. COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE public.recursos IS 'Repositorio colaborativo de recursos (PDFs, videos, artículos, ejercicios) que los terapeutas comparten entre sí y envían a pacientes';

COMMENT ON TABLE public.recursos_pacientes IS 'Registro de recursos enviados por terapeutas a pacientes específicos, con seguimiento de visualización';

COMMENT ON COLUMN public.recursos.es_publico IS 'Si es true, todos los terapeutas pueden ver y enviar este recurso. Si es false, solo el creador puede verlo';

COMMENT ON COLUMN public.recursos.veces_enviado IS 'Contador automático de cuántas veces se ha enviado este recurso a pacientes';

COMMENT ON COLUMN public.recursos.veces_visto IS 'Contador automático de cuántos pacientes han marcado este recurso como visto';

COMMENT ON COLUMN public.recursos_pacientes.visto IS 'Indica si el paciente ha abierto/leído el recurso';

COMMENT ON COLUMN public.recursos_pacientes.calificacion IS 'Calificación opcional del paciente (1-5 estrellas)';

-- =====================================================
-- ✅ MIGRACIÓN COMPLETADA
-- =====================================================

-- Este módulo proporciona:
-- ✅ Repositorio colaborativo de recursos
-- ✅ Control de visibilidad (público/privado)
-- ✅ Envío de recursos a pacientes específicos
-- ✅ Seguimiento de visualización
-- ✅ Estadísticas de uso
-- ✅ Feedback de pacientes
-- ✅ Seguridad con RLS
-- ✅ Recursos de ejemplo iniciales
