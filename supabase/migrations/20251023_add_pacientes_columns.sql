-- Migración para agregar columnas necesarias a la tabla pacientes
-- Fecha: 2025-10-23
-- La tabla actual solo tiene: id, psicologa_id, area_de_acompanamiento, frecuencia, activo, created_at, metadata, updated_at

-- Paso 1: Agregar columnas faltantes
DO $$ 
BEGIN
    -- email (esencial para identificar al paciente)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'pacientes' 
                   AND column_name = 'email') THEN
        ALTER TABLE public.pacientes ADD COLUMN email text;
        RAISE NOTICE 'Columna email agregada';
    END IF;

    -- nombre_completo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'pacientes' 
                   AND column_name = 'nombre_completo') THEN
        ALTER TABLE public.pacientes ADD COLUMN nombre_completo text;
        RAISE NOTICE 'Columna nombre_completo agregada';
    END IF;

    -- telefono
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'pacientes' 
                   AND column_name = 'telefono') THEN
        ALTER TABLE public.pacientes ADD COLUMN telefono text;
        RAISE NOTICE 'Columna telefono agregada';
    END IF;
END $$;

-- Crear índices para mejorar el rendimiento (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_pacientes_psicologa_id ON public.pacientes(psicologa_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON public.pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_activo ON public.pacientes(activo);

-- Actualizar política RLS para pacientes
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios datos" ON public.pacientes;
DROP POLICY IF EXISTS "Psicólogas pueden ver sus pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Psicólogas pueden crear pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Psicólogas pueden actualizar sus pacientes" ON public.pacientes;

-- Políticas nuevas
CREATE POLICY "Pacientes pueden ver sus propios datos"
  ON public.pacientes FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Psicólogas pueden ver sus pacientes"
  ON public.pacientes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'psicologa'
      AND pacientes.psicologa_id = auth.uid()
    )
  );

CREATE POLICY "Psicólogas pueden crear pacientes"
  ON public.pacientes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'psicologa'
      AND psicologa_id = auth.uid()
    )
  );

CREATE POLICY "Psicólogas pueden actualizar sus pacientes"
  ON public.pacientes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.rol = 'psicologa'
      AND pacientes.psicologa_id = auth.uid()
    )
  );

-- Comentarios para documentación
COMMENT ON COLUMN public.pacientes.psicologa_id IS 'ID de la psicóloga asignada al paciente';
COMMENT ON COLUMN public.pacientes.nombre_completo IS 'Nombre completo del paciente';
COMMENT ON COLUMN public.pacientes.area_de_acompanamiento IS 'Área principal de trabajo terapéutico';
COMMENT ON COLUMN public.pacientes.frecuencia IS 'Frecuencia de sesiones (semanal, quincenal, mensual)';
COMMENT ON COLUMN public.pacientes.activo IS 'Indica si el paciente está activo o ha finalizado el tratamiento';
COMMENT ON COLUMN public.pacientes.metadata IS 'Información adicional en formato JSON';
