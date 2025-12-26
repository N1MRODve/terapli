-- =============================================================================
-- MIGRACIÓN: Añadir campos de perfil completo a pacientes
-- =============================================================================
-- Añade campos para rastrear si un paciente tiene su perfil completo
-- y qué campos le faltan. Esto permite mostrar alertas y filtrar pacientes
-- que necesitan completar su información.
-- =============================================================================

-- Añadir columna perfil_completo
ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS perfil_completo boolean DEFAULT true;

-- Añadir columna campos_faltantes (array de nombres de campo)
ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS campos_faltantes jsonb;

-- Añadir columna documento_identidad si no existe
ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS documento_identidad text;

-- Añadir columna direccion si no existe
ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS direccion text;

-- Añadir columna contacto_emergencia si no existe
ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS contacto_emergencia text;

-- Añadir columna derivacion si no existe
ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS derivacion text;

-- Añadir columna medicacion si no existe
ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS medicacion text;

-- Añadir columna orientacion_diagnostica si no existe
ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS orientacion_diagnostica text;

-- Añadir columna inicio_tratamiento si no existe
ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS inicio_tratamiento date;

-- Añadir columna precio_sesion si no existe
ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS precio_sesion numeric(10, 2);

-- Añadir columna comision si no existe
ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS comision numeric(5, 2);

-- Añadir columna fecha_nacimiento si no existe
ALTER TABLE pacientes
ADD COLUMN IF NOT EXISTS fecha_nacimiento date;

-- =============================================================================
-- ÍNDICES
-- =============================================================================

-- Índice para buscar pacientes con perfil incompleto
CREATE INDEX IF NOT EXISTS idx_pacientes_perfil_incompleto
  ON pacientes(perfil_completo)
  WHERE perfil_completo = false;

-- Índice para documento de identidad (búsquedas y duplicados)
CREATE INDEX IF NOT EXISTS idx_pacientes_documento_identidad
  ON pacientes(documento_identidad)
  WHERE documento_identidad IS NOT NULL;

-- =============================================================================
-- COMENTARIOS
-- =============================================================================

COMMENT ON COLUMN pacientes.perfil_completo IS 'Indica si el paciente tiene todos los campos importantes (email, teléfono, documento)';
COMMENT ON COLUMN pacientes.campos_faltantes IS 'Array JSON de campos que faltan ["email", "documento_identidad"]';
COMMENT ON COLUMN pacientes.documento_identidad IS 'DNI, NIE, Pasaporte u otro documento de identidad';
COMMENT ON COLUMN pacientes.direccion IS 'Dirección postal del paciente';
COMMENT ON COLUMN pacientes.contacto_emergencia IS 'Persona de contacto en caso de emergencia';
COMMENT ON COLUMN pacientes.derivacion IS 'Quién derivó al paciente (médico, otro terapeuta, etc.)';
COMMENT ON COLUMN pacientes.medicacion IS 'Medicación actual del paciente';
COMMENT ON COLUMN pacientes.orientacion_diagnostica IS 'Diagnóstico o hipótesis diagnóstica';
COMMENT ON COLUMN pacientes.inicio_tratamiento IS 'Fecha de inicio del tratamiento';
COMMENT ON COLUMN pacientes.precio_sesion IS 'Precio acordado por sesión en euros';
COMMENT ON COLUMN pacientes.comision IS 'Porcentaje de comisión aplicable';
COMMENT ON COLUMN pacientes.fecha_nacimiento IS 'Fecha de nacimiento del paciente';

-- =============================================================================
-- ACTUALIZAR PACIENTES EXISTENTES
-- =============================================================================
-- Marcar como incompletos los pacientes que no tienen email o documento

UPDATE pacientes
SET
  perfil_completo = CASE
    WHEN email IS NOT NULL AND telefono IS NOT NULL THEN true
    ELSE false
  END,
  campos_faltantes = (
    SELECT jsonb_agg(campo)
    FROM unnest(ARRAY[
      CASE WHEN email IS NULL OR email = '' THEN 'email' END,
      CASE WHEN telefono IS NULL OR telefono = '' THEN 'telefono' END,
      CASE WHEN documento_identidad IS NULL OR documento_identidad = '' THEN 'documento_identidad' END
    ]) AS campo
    WHERE campo IS NOT NULL
  )
WHERE perfil_completo IS NULL OR perfil_completo = true;

-- =============================================================================
-- FUNCIÓN: Calcular si perfil está completo
-- =============================================================================
-- Útil para validar antes de guardar

CREATE OR REPLACE FUNCTION calculate_perfil_completo(
  p_email text,
  p_telefono text,
  p_documento text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Perfil completo si tiene email Y teléfono
  -- (documento es deseable pero no obligatorio por ahora)
  RETURN (
    p_email IS NOT NULL AND p_email != '' AND
    p_telefono IS NOT NULL AND p_telefono != ''
  );
END;
$$;

COMMENT ON FUNCTION calculate_perfil_completo IS 'Calcula si un paciente tiene perfil completo basándose en email y teléfono';

-- =============================================================================
-- TRIGGER: Actualizar perfil_completo automáticamente
-- =============================================================================

CREATE OR REPLACE FUNCTION update_paciente_perfil_completo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  missing_fields jsonb;
BEGIN
  -- Calcular campos faltantes
  SELECT jsonb_agg(campo)
  INTO missing_fields
  FROM unnest(ARRAY[
    CASE WHEN NEW.email IS NULL OR NEW.email = '' THEN 'email' END,
    CASE WHEN NEW.telefono IS NULL OR NEW.telefono = '' THEN 'telefono' END,
    CASE WHEN NEW.documento_identidad IS NULL OR NEW.documento_identidad = '' THEN 'documento_identidad' END
  ]) AS campo
  WHERE campo IS NOT NULL;

  -- Actualizar campos
  NEW.perfil_completo := calculate_perfil_completo(NEW.email, NEW.telefono, NEW.documento_identidad);
  NEW.campos_faltantes := COALESCE(missing_fields, '[]'::jsonb);

  RETURN NEW;
END;
$$;

-- Crear trigger solo si no existe
DROP TRIGGER IF EXISTS trigger_update_paciente_perfil_completo ON pacientes;

CREATE TRIGGER trigger_update_paciente_perfil_completo
  BEFORE INSERT OR UPDATE OF email, telefono, documento_identidad ON pacientes
  FOR EACH ROW
  EXECUTE FUNCTION update_paciente_perfil_completo();
