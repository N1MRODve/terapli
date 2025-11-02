-- VERIFICAR ESTRUCTURA DE TABLA PACIENTES
-- Ejecutar para entender cómo se conecta pacientes con autenticación

-- 1. Verificar todas las columnas de pacientes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pacientes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar relaciones de clave foránea de pacientes
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'pacientes'
  AND tc.table_schema = 'public';

-- 3. Ver algunos registros de pacientes para entender la estructura
SELECT id, email, nombre, apellido FROM pacientes LIMIT 3;