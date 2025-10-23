-- Script para verificar la estructura actual de la tabla pacientes
-- Ejecutar en el SQL Editor de Supabase

-- Ver todas las columnas de la tabla pacientes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'pacientes'
ORDER BY ordinal_position;
