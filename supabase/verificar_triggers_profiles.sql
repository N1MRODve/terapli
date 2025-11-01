-- Verificar si existe un trigger para crear profiles automáticamente
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('profiles', 'users')
ORDER BY trigger_name;

-- También verificar funciones relacionadas con profiles
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (routine_name ILIKE '%profile%' OR routine_name ILIKE '%user%')
ORDER BY routine_name;
