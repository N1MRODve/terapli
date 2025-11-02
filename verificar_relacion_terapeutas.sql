-- VERIFICAR RELACIÓN DE TERAPEUTAS CON AUTENTICACIÓN
-- Ejecutar estos queries uno por uno para entender la estructura

-- 1. Verificar si terapeutas tiene alguna relación con profiles
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
  AND tc.table_name = 'terapeutas'
  AND tc.table_schema = 'public';

-- 2. Verificar todas las columnas de terapeutas para buscar posibles conexiones
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'terapeutas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar si hay algún campo que pueda conectar con profiles por email
SELECT email FROM terapeutas LIMIT 3;

-- 4. Verificar si hay coincidencias de email entre terapeutas y profiles
SELECT 
    COUNT(*) as total_terapeutas,
    COUNT(CASE WHEN EXISTS (
        SELECT 1 FROM profiles p WHERE p.email = t.email
    ) THEN 1 END) as terapeutas_con_profile
FROM terapeutas t;