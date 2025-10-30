-- ============================================================================
-- Ver la definición de la función problemática
-- ============================================================================

SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'fn_activar_bono_al_pagar'
  AND routine_schema = 'public';

-- Ver el código fuente completo
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'fn_activar_bono_al_pagar';
