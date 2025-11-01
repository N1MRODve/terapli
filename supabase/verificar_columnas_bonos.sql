-- Verificar columnas reales de la tabla bonos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bonos'
ORDER BY ordinal_position;

-- Ver algunos registros de ejemplo
SELECT * FROM bonos LIMIT 3;
