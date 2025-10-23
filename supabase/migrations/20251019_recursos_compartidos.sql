-- ============================================================================
-- Migración: Sistema de Recursos Compartidos
-- Fecha: 2025-10-19
-- Descripción: Permite a los terapeutas compartir recursos del repositorio
--              con pacientes específicos
-- ============================================================================

-- Tabla de recursos del repositorio (recursos del terapeuta)
-- Esta tabla almacena los recursos que los terapeutas tienen disponibles
CREATE TABLE IF NOT EXISTS public.recursos_repositorio (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    descripcion text,
    tipo text NOT NULL, -- 'Guía', 'Audio', 'Video', 'Ejercicio', 'Lectura', 'PDF'
    icono text DEFAULT '📄',
    url text NOT NULL,
    categoria text, -- 'Ansiedad', 'Mindfulness', 'TCC', 'Autoestima', etc.
    tags text[], -- array de tags para búsqueda
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    activo boolean DEFAULT true
);

COMMENT ON TABLE public.recursos_repositorio IS 'Repositorio de recursos terapéuticos disponibles para compartir';

-- Tabla de recursos compartidos (vincula recursos del repositorio con pacientes)
CREATE TABLE IF NOT EXISTS public.recursos_compartidos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recurso_id uuid NOT NULL REFERENCES public.recursos_repositorio(id) ON DELETE CASCADE,
    paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    terapeuta_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nota_personal text, -- nota opcional del terapeuta al compartir
    visto boolean DEFAULT false, -- si el paciente ha visto el recurso
    visto_at timestamptz,
    compartido_at timestamptz NOT NULL DEFAULT now(),
    archivado boolean DEFAULT false,
    UNIQUE(recurso_id, paciente_id) -- Un recurso solo se puede compartir una vez con el mismo paciente
);

COMMENT ON TABLE public.recursos_compartidos IS 'Recursos compartidos específicamente con pacientes';

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_recursos_repositorio_tipo ON public.recursos_repositorio(tipo);
CREATE INDEX IF NOT EXISTS idx_recursos_repositorio_categoria ON public.recursos_repositorio(categoria);
CREATE INDEX IF NOT EXISTS idx_recursos_repositorio_activo ON public.recursos_repositorio(activo);
CREATE INDEX IF NOT EXISTS idx_recursos_compartidos_paciente ON public.recursos_compartidos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_recursos_compartidos_terapeuta ON public.recursos_compartidos(terapeuta_id);
CREATE INDEX IF NOT EXISTS idx_recursos_compartidos_visto ON public.recursos_compartidos(visto);

-- Trigger para actualizar updated_at en recursos_repositorio
CREATE OR REPLACE FUNCTION update_recursos_repositorio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_recursos_repositorio_updated_at
    BEFORE UPDATE ON public.recursos_repositorio
    FOR EACH ROW
    EXECUTE FUNCTION update_recursos_repositorio_updated_at();

-- Políticas RLS (Row Level Security)
ALTER TABLE public.recursos_repositorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_compartidos ENABLE ROW LEVEL SECURITY;

-- Política: Terapeutas pueden ver todos los recursos activos del repositorio
CREATE POLICY "Terapeutas pueden ver recursos del repositorio"
    ON public.recursos_repositorio
    FOR SELECT
    USING (
        activo = true AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('psicologa', 'admin', 'coordinadora')
        )
    );

-- Política: Terapeutas pueden crear recursos en el repositorio
CREATE POLICY "Terapeutas pueden crear recursos"
    ON public.recursos_repositorio
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('psicologa', 'admin', 'coordinadora')
        )
    );

-- Política: Terapeutas pueden actualizar sus propios recursos
CREATE POLICY "Terapeutas pueden actualizar sus recursos"
    ON public.recursos_repositorio
    FOR UPDATE
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'coordinadora')
        )
    );

-- Política: Pacientes pueden ver recursos que han sido compartidos con ellos
CREATE POLICY "Pacientes ven recursos compartidos con ellos"
    ON public.recursos_compartidos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.pacientes
            WHERE pacientes.id = recursos_compartidos.paciente_id
            AND pacientes.user_id = auth.uid()
        )
    );

-- Política: Terapeutas pueden ver recursos que ellos han compartido
CREATE POLICY "Terapeutas ven recursos que compartieron"
    ON public.recursos_compartidos
    FOR SELECT
    USING (
        terapeuta_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'coordinadora')
        )
    );

-- Política: Terapeutas pueden compartir recursos con sus pacientes
CREATE POLICY "Terapeutas pueden compartir recursos"
    ON public.recursos_compartidos
    FOR INSERT
    WITH CHECK (
        terapeuta_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('psicologa', 'admin', 'coordinadora')
        )
    );

-- Política: Terapeutas pueden actualizar recursos compartidos (ej. archivar)
CREATE POLICY "Terapeutas pueden actualizar recursos compartidos"
    ON public.recursos_compartidos
    FOR UPDATE
    USING (terapeuta_id = auth.uid());

-- Política: Pacientes pueden marcar recursos como vistos
CREATE POLICY "Pacientes pueden marcar como visto"
    ON public.recursos_compartidos
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.pacientes
            WHERE pacientes.id = recursos_compartidos.paciente_id
            AND pacientes.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pacientes
            WHERE pacientes.id = recursos_compartidos.paciente_id
            AND pacientes.user_id = auth.uid()
        )
    );

-- Política: Terapeutas pueden eliminar recursos compartidos
CREATE POLICY "Terapeutas pueden eliminar recursos compartidos"
    ON public.recursos_compartidos
    FOR DELETE
    USING (terapeuta_id = auth.uid());

-- Insertar recursos de ejemplo en el repositorio
INSERT INTO public.recursos_repositorio (titulo, descripcion, tipo, icono, url, categoria, tags) VALUES
    ('Guía de Respiración Consciente', 'Ejercicios de respiración para manejo de ansiedad', 'Guía', '📋', 'https://www.youtube.com/watch?v=YRPh_GaiL8s', 'Ansiedad', ARRAY['respiración', 'ansiedad', 'mindfulness']),
    ('Meditación Guiada 10min', 'Audio de meditación para principiantes', 'Audio', '🎵', 'https://www.youtube.com/watch?v=O-6f5wQXSu8', 'Mindfulness', ARRAY['meditación', 'mindfulness', 'relajación']),
    ('Relajación Muscular Progresiva', 'Video tutorial de técnicas de relajación', 'Video', '🎥', 'https://www.youtube.com/watch?v=ihO02wUzgkc', 'Relajación', ARRAY['relajación', 'técnicas', 'estrés']),
    ('Diario de Gratitud', 'Plantilla para llevar un diario de gratitud', 'Ejercicio', '🧘', 'https://positivepsychology.com/gratitude-journal/', 'Autoestima', ARRAY['gratitud', 'autoestima', 'bienestar']),
    ('Mindfulness y Autocuidado', 'Artículo sobre mindfulness en la vida diaria', 'Lectura', '📖', 'https://www.mindful.org/meditation/mindfulness-getting-started/', 'Mindfulness', ARRAY['mindfulness', 'autocuidado', 'vida diaria']),
    ('Registro de Pensamientos TCC', 'Formato para registro de pensamientos automáticos', 'PDF', '📄', 'https://beckinstitute.org/cognitive-model/', 'TCC', ARRAY['tcc', 'pensamientos', 'terapia cognitiva'])
ON CONFLICT DO NOTHING;
