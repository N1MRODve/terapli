-- ============================================================================
-- Ver triggers activos en la tabla bonos
-- ============================================================================

SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'bonos'
ORDER BY trigger_name;
