-- ============================================================================
-- VERIFICACIÓN: Políticas RLS para que terapeutas vean estado de pago de bonos
-- ============================================================================

-- 1. Ver las políticas actuales de la tabla bonos
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'bonos'
    AND schemaname = 'public';

-- 2. Verificar que los terapeutas tengan acceso a las columnas de pago
-- Esto mostrará si hay restricciones de columna
SELECT 
    table_name,
    column_name,
    privilege_type
FROM information_schema.column_privileges
WHERE table_name = 'bonos'
    AND column_name IN ('pagado', 'fecha_pago', 'metodo_pago', 'pagado_por')
ORDER BY column_name, privilege_type;

-- 3. Ver los valores posibles del enum user_role
SELECT 
    enumlabel as rol_valido
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- 4. Ver usuarios en la tabla profiles (sin filtrar por rol específico)
SELECT 
    id,
    email,
    rol,
    nombre,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- 5. Buscar usuarios con email que contenga 'terapeuta' o buscar en tabla terapeutas
SELECT 
    p.id,
    p.email,
    p.rol,
    p.nombre,
    t.id as terapeuta_id,
    t.nombre as terapeuta_nombre
FROM profiles p
LEFT JOIN terapeutas t ON t.email = p.email
WHERE t.id IS NOT NULL
LIMIT 5;
