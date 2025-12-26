-- =============================================================================
-- MIGRACIÓN: Tabla temporal para configuraciones de importación
-- =============================================================================
-- Guarda temporalmente las configuraciones de mapeo de columnas mientras
-- el usuario revisa y confirma la importación de pacientes.
--
-- Características:
-- - Expira automáticamente después de 1 hora
-- - Cada usuario solo puede ver sus propias configuraciones
-- - Se limpia automáticamente tras la importación o expiración
-- =============================================================================

-- Crear tabla import_configs
CREATE TABLE IF NOT EXISTS import_configs (
  -- Identificador único
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Usuario que creó la configuración
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Nombre del archivo original
  file_name text NOT NULL,

  -- Columnas detectadas del archivo (array de DetectedColumn)
  -- Estructura: [{ name, sampleValues, suggestedMapping }]
  detected_columns jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Mapeos elegidos por el usuario (array de ColumnMapping)
  -- Estructura: [{ sourceColumn, targetField }]
  mappings jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz,
  expires_at timestamptz NOT NULL,

  -- Validación: debe expirar después de crearse
  CONSTRAINT expires_after_creation CHECK (expires_at > created_at)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_import_configs_user_id ON import_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_import_configs_expires_at ON import_configs(expires_at);

-- Comentarios
COMMENT ON TABLE import_configs IS 'Configuraciones temporales de importación de pacientes';
COMMENT ON COLUMN import_configs.detected_columns IS 'Array JSON de columnas detectadas del archivo con valores de ejemplo';
COMMENT ON COLUMN import_configs.mappings IS 'Array JSON de mapeos columna origen → campo Teraplí';
COMMENT ON COLUMN import_configs.expires_at IS 'La configuración expira 1 hora después de crearse';

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE import_configs ENABLE ROW LEVEL SECURITY;

-- Política: usuarios solo ven sus propias configuraciones
CREATE POLICY "Users can view their own import configs"
  ON import_configs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuarios solo pueden insertar sus propias configuraciones
CREATE POLICY "Users can insert their own import configs"
  ON import_configs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuarios solo pueden actualizar sus propias configuraciones
CREATE POLICY "Users can update their own import configs"
  ON import_configs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: usuarios solo pueden eliminar sus propias configuraciones
CREATE POLICY "Users can delete their own import configs"
  ON import_configs
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- FUNCIÓN: Limpiar configuraciones expiradas
-- =============================================================================
-- Esta función se puede ejecutar manualmente o con un cron job

CREATE OR REPLACE FUNCTION cleanup_expired_import_configs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM import_configs
  WHERE expires_at < now();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION cleanup_expired_import_configs IS 'Elimina configuraciones de importación expiradas. Retorna el número de registros eliminados.';

-- =============================================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- =============================================================================

CREATE OR REPLACE FUNCTION update_import_configs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_import_configs_updated_at
  BEFORE UPDATE ON import_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_import_configs_updated_at();
