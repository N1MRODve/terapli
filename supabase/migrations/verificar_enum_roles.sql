-- ============================================================================
-- VERIFICACIÓN: Ver los valores válidos del enum user_role
-- ============================================================================

-- Ver todos los valores posibles del enum user_role
SELECT 
    enumlabel as rol_valido
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- Ver la definición completa del tipo
SELECT 
    t.typname as tipo_nombre,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as valores_posibles
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'user_role'
GROUP BY t.typname;
