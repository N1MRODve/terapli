-- ============================================================================
-- SCRIPT DE VERIFICACIÓN RÁPIDA - Tabla Bonos
-- ============================================================================
-- Ejecuta este script para verificar el estado de tu tabla bonos
-- Fecha: 27 de octubre de 2025

\echo '🔍 Verificando estructura de tabla bonos...\n'

-- 1. Verificar que la tabla existe
\echo '📋 1. Verificación de existencia de tabla:'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'bonos'
        ) 
        THEN '✅ Tabla bonos existe'
        ELSE '❌ Tabla bonos NO existe'
    END as resultado;

\echo '\n📋 2. Columnas en tabla bonos:'
-- 2. Listar todas las columnas
SELECT 
    column_name as "Columna",
    data_type as "Tipo",
    CASE 
        WHEN is_nullable = 'YES' THEN '✓'
        ELSE '✗'
    END as "Nullable",
    column_default as "Default"
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bonos'
ORDER BY ordinal_position;

\echo '\n📋 3. Verificación de columnas requeridas:'
-- 3. Verificar columnas específicas
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bonos' AND column_name='tipo') 
         THEN '✅ tipo' ELSE '❌ tipo' END as col1,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bonos' AND column_name='monto_total') 
         THEN '✅ monto_total' ELSE '❌ monto_total' END as col2,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bonos' AND column_name='monto') 
         THEN '✅ monto' ELSE '❌ monto' END as col3,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bonos' AND column_name='sesiones_totales') 
         THEN '✅ sesiones_totales' ELSE '❌ sesiones_totales' END as col4,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bonos' AND column_name='psicologa_id') 
         THEN '✅ psicologa_id' ELSE '❌ psicologa_id' END as col5,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bonos' AND column_name='fecha_inicio') 
         THEN '✅ fecha_inicio' ELSE '❌ fecha_inicio' END as col6,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bonos' AND column_name='fecha_fin') 
         THEN '✅ fecha_fin' ELSE '❌ fecha_fin' END as col7,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bonos' AND column_name='pagado') 
         THEN '✅ pagado' ELSE '❌ pagado' END as col8,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bonos' AND column_name='renovacion_automatica') 
         THEN '✅ renovacion_automatica' ELSE '❌ renovacion_automatica' END as col9,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bonos' AND column_name='metadata') 
         THEN '✅ metadata' ELSE '❌ metadata' END as col10;

\echo '\n📋 4. Índices en tabla bonos:'
-- 4. Verificar índices
SELECT 
    indexname as "Índice",
    indexdef as "Definición"
FROM pg_indexes
WHERE tablename = 'bonos'
  AND schemaname = 'public'
ORDER BY indexname;

\echo '\n📋 5. Triggers en tabla bonos:'
-- 5. Verificar triggers
SELECT 
    trigger_name as "Trigger",
    event_manipulation as "Evento",
    action_timing as "Momento"
FROM information_schema.triggers
WHERE event_object_table = 'bonos'
  AND trigger_schema = 'public'
ORDER BY trigger_name;

\echo '\n📋 6. Último bono creado:'
-- 6. Mostrar último bono (si existe)
SELECT 
    id,
    tipo,
    sesiones_totales,
    sesiones_restantes,
    COALESCE(monto_total, monto) as monto,
    estado,
    pagado,
    fecha_inicio,
    fecha_fin,
    created_at
FROM bonos
ORDER BY created_at DESC
LIMIT 1;

\echo '\n📋 7. Resumen de bonos por estado:'
-- 7. Estadísticas generales
SELECT 
    estado as "Estado",
    COUNT(*) as "Cantidad",
    SUM(COALESCE(monto_total, monto, 0)) as "Total €",
    AVG(COALESCE(monto_total, monto, 0)) as "Promedio €"
FROM bonos
GROUP BY estado
ORDER BY estado;

\echo '\n✅ Verificación completa\n'
