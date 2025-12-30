-- ============================================================================
-- TEST DE VERIFICACIÓN: Aislamiento RLS Multi-Tenant
-- ============================================================================
-- Este script verifica que las políticas RLS funcionan correctamente
-- EJECUTAR DESPUÉS DE: 20251230_rls_multi_tenant_completo.sql
-- ============================================================================

-- ============================================================================
-- PASO 1: VERIFICAR QUE RLS ESTÁ HABILITADO EN TODAS LAS TABLAS
-- ============================================================================

SELECT
  '🔒 VERIFICACIÓN RLS HABILITADO' as seccion;

SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Activo' ELSE '❌ RLS DESACTIVADO' END as estado_rls
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'pacientes', 'citas', 'bonos', 'terapeutas', 'profiles',
    'sesiones_bonos', 'recursos_compartidos', 'notificaciones', 'facturas', 'pagos_registros'
  )
ORDER BY tablename;

-- ============================================================================
-- PASO 2: LISTAR TODAS LAS POLÍTICAS ACTIVAS
-- ============================================================================

SELECT
  '📋 POLÍTICAS RLS ACTIVAS' as seccion;

SELECT
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as operacion,
  CASE WHEN permissive = 'PERMISSIVE' THEN '✅' ELSE '🛡️ RESTRICTIVE' END as tipo
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================================================
-- PASO 3: VERIFICAR FUNCIONES AUXILIARES
-- ============================================================================

SELECT
  '🔧 FUNCIONES AUXILIARES' as seccion;

SELECT
  routine_name,
  CASE
    WHEN routine_name = 'get_my_terapeuta_id' THEN '✅ Obtiene ID terapeuta actual'
    WHEN routine_name = 'is_staff' THEN '✅ Verifica si es admin/coordinadora'
    WHEN routine_name = 'is_terapeuta' THEN '✅ Verifica si es terapeuta'
    ELSE '⚪ Otra función'
  END as descripcion
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_my_terapeuta_id', 'is_staff', 'is_terapeuta');

-- ============================================================================
-- PASO 4: CONTAR REGISTROS POR TABLA (para verificar datos)
-- ============================================================================

SELECT
  '📊 CONTEO DE REGISTROS' as seccion;

SELECT 'terapeutas' as tabla, COUNT(*) as total FROM public.terapeutas
UNION ALL
SELECT 'pacientes', COUNT(*) FROM public.pacientes
UNION ALL
SELECT 'citas', COUNT(*) FROM public.citas
UNION ALL
SELECT 'bonos', COUNT(*) FROM public.bonos
ORDER BY tabla;

-- ============================================================================
-- PASO 5: VERIFICAR ÍNDICES PARA RENDIMIENTO RLS
-- ============================================================================

SELECT
  '⚡ ÍNDICES PARA RENDIMIENTO' as seccion;

SELECT
  tablename,
  indexname,
  CASE
    WHEN indexname LIKE '%terapeuta%' THEN '✅ Índice terapeuta_id'
    WHEN indexname LIKE '%paciente%' THEN '✅ Índice paciente_id'
    ELSE '⚪ Otro índice'
  END as tipo
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('pacientes', 'citas', 'bonos')
  AND (indexname LIKE '%terapeuta%' OR indexname LIKE '%paciente%')
ORDER BY tablename;

-- ============================================================================
-- PASO 6: CREAR ÍNDICES SI FALTAN (para rendimiento óptimo)
-- ============================================================================

-- Índice en pacientes por terapeuta_id
CREATE INDEX IF NOT EXISTS idx_pacientes_terapeuta_id ON public.pacientes(terapeuta_id);

-- Índice en citas por terapeuta_id
CREATE INDEX IF NOT EXISTS idx_citas_terapeuta_id_rls ON public.citas(terapeuta_id);

-- Índice en bonos por paciente_id (para joins con pacientes)
CREATE INDEX IF NOT EXISTS idx_bonos_paciente_id_rls ON public.bonos(paciente_id);

SELECT '✅ Índices creados/verificados para rendimiento óptimo' as resultado;

-- ============================================================================
-- PASO 7: RESUMEN FINAL
-- ============================================================================

SELECT
  '🎯 RESUMEN DE SEGURIDAD MULTI-TENANT' as titulo;

WITH stats AS (
  SELECT
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_politicas,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as tablas_con_rls,
    (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') as tablas_protegidas
)
SELECT
  total_politicas || ' políticas RLS activas' as politicas,
  tablas_con_rls || ' tablas con RLS habilitado' as tablas_rls,
  tablas_protegidas || ' tablas con políticas definidas' as tablas_politicas,
  CASE
    WHEN total_politicas >= 15 AND tablas_con_rls >= 5 THEN '✅ CONFIGURACIÓN COMPLETA'
    WHEN total_politicas >= 10 THEN '⚠️ CONFIGURACIÓN PARCIAL'
    ELSE '❌ CONFIGURACIÓN INCOMPLETA'
  END as estado
FROM stats;

-- ============================================================================
-- INSTRUCCIONES PARA TEST MANUAL
-- ============================================================================
/*
🧪 TESTS MANUALES RECOMENDADOS:

1. CREAR DOS TERAPEUTAS DE PRUEBA (si no existen):
   - Terapeuta A: terapeutaA@test.com
   - Terapeuta B: terapeutaB@test.com

2. CREAR PACIENTES PARA CADA TERAPEUTA:
   - Paciente A1, A2 -> terapeuta_id = ID de Terapeuta A
   - Paciente B1, B2 -> terapeuta_id = ID de Terapeuta B

3. CONECTAR COMO TERAPEUTA A y ejecutar:
   SELECT COUNT(*) FROM pacientes; -- Debe mostrar SOLO 2 (A1, A2)
   SELECT COUNT(*) FROM citas; -- Debe mostrar SOLO citas de A1, A2
   SELECT COUNT(*) FROM bonos; -- Debe mostrar SOLO bonos de A1, A2

4. CONECTAR COMO TERAPEUTA B y ejecutar:
   SELECT COUNT(*) FROM pacientes; -- Debe mostrar SOLO 2 (B1, B2)
   SELECT COUNT(*) FROM citas; -- Debe mostrar SOLO citas de B1, B2
   SELECT COUNT(*) FROM bonos; -- Debe mostrar SOLO bonos de B1, B2

5. CONECTAR COMO ADMIN y ejecutar:
   SELECT COUNT(*) FROM pacientes; -- Debe mostrar TODOS (4+)
   SELECT COUNT(*) FROM citas; -- Debe mostrar TODAS
   SELECT COUNT(*) FROM bonos; -- Debe mostrar TODOS

6. TEST DE INTENTO DE ACCESO CRUZADO (como Terapeuta A):
   UPDATE pacientes
   SET nombre_completo = 'HACK'
   WHERE terapeuta_id != (SELECT public.get_my_terapeuta_id());
   -- Resultado esperado: 0 rows affected

7. TEST DE INTENTO DE INSERCIÓN CRUZADA (como Terapeuta A):
   INSERT INTO pacientes (nombre_completo, email, terapeuta_id)
   VALUES ('Hack Patient', 'hack@test.com', 'ID-TERAPEUTA-B');
   -- Resultado esperado: ERROR o 0 rows (RLS bloquea)
*/

-- ============================================================================
-- FIN DEL SCRIPT DE VERIFICACIÓN
-- ============================================================================
