-- Agregar columna tipo_bono a la tabla pacientes
-- Esta columna reemplaza a frecuencia para definir el tipo de bono del paciente

ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS tipo_bono TEXT;

-- Agregar constraint para validar los valores permitidos
ALTER TABLE pacientes 
ADD CONSTRAINT check_tipo_bono CHECK (
  tipo_bono IS NULL OR 
  tipo_bono IN ('a_demanda', 'quincenal', 'semanal')
);

-- Comentario explicativo
COMMENT ON COLUMN pacientes.tipo_bono IS 'Tipo de bono del paciente: a_demanda (1 sesión), quincenal (2 sesiones/mes), semanal (4 sesiones/mes)';

-- Migrar datos existentes de frecuencia a tipo_bono (opcional, si existe la columna frecuencia)
-- Si quieres migrar los datos existentes, descomenta las siguientes líneas:

-- UPDATE pacientes 
-- SET tipo_bono = CASE 
--   WHEN frecuencia = 'semanal' THEN 'semanal'
--   WHEN frecuencia = 'quincenal' THEN 'quincenal'
--   WHEN frecuencia = 'mensual' THEN 'a_demanda'
--   ELSE NULL
-- END
-- WHERE frecuencia IS NOT NULL;

-- Si ya no necesitas la columna frecuencia, puedes eliminarla:
-- ALTER TABLE pacientes DROP COLUMN IF EXISTS frecuencia;
