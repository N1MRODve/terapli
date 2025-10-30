-- ============================================================================
-- VERIFICACIÓN: Comprobar que todo está correctamente instalado
-- ============================================================================

-- 1. Verificar nuevas columnas en tabla bonos
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'bonos' 
  AND column_name IN ('pagado', 'fecha_pago', 'metodo_pago', 'pagado_por')
ORDER BY column_name;

-- 2. Verificar funciones RPC creadas
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_name IN ('confirmar_pago_bono', 'revertir_pago_bono')
  AND routine_schema = 'public';

-- 3. Verificar índices creados
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'bonos' 
  AND indexname IN ('idx_bonos_pagado', 'idx_bonos_estado_pagado');

-- 4. Ver estado actual de los bonos
SELECT 
    id,
    paciente_id,
    estado,
    pagado,
    sesiones_totales,
    sesiones_restantes,
    monto_total
FROM bonos
ORDER BY created_at DESC
LIMIT 5;
