-- ============================================================================
-- VERIFICAR Y CORREGIR POLÍTICAS RLS DE LA TABLA PACIENTES
-- ============================================================================
-- El error "Usuario no autenticado" al crear paciente sugiere que
-- faltan políticas RLS en la tabla pacientes
-- ============================================================================

-- PASO 1: Ver políticas actuales de pacientes
-- ============================================================================
SELECT 
    '📋 Políticas RLS de pacientes:' as info,
    policyname,
    cmd as operacion,
    CASE 
        WHEN permissive = 'PERMISSIVE' THEN 'Permisivo'
        ELSE 'Restrictivo'
    END as tipo
FROM pg_policies 
WHERE tablename = 'pacientes'
ORDER BY cmd, policyname;

-- PASO 2: Verificar si RLS está habilitado
-- ============================================================================
SELECT 
    '🔒 Estado de RLS:' as info,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ Habilitado'
        ELSE '❌ Deshabilitado'
    END as rls_estado
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'pacientes';

-- PASO 3: Ver estructura de la tabla pacientes
-- ============================================================================
SELECT 
    '📊 Estructura de pacientes:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'pacientes'
ORDER BY ordinal_position;
