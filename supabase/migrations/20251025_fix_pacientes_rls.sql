-- ============================================================================
-- FIX: Limpiar y corregir políticas RLS de la tabla PACIENTES
-- ============================================================================
-- Problema: Políticas duplicadas y posiblemente conflictivas
-- Solución: Eliminar todas y crear políticas limpias y simples
-- ============================================================================

-- PASO 1: Eliminar TODAS las políticas existentes de pacientes
-- ============================================================================
DROP POLICY IF EXISTS "access_all_temporal_pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Psicólogas pueden crear pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Solo staff puede crear pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Pacientes can view own data" ON public.pacientes;
DROP POLICY IF EXISTS "Pacientes pueden ver sus propios datos" ON public.pacientes;
DROP POLICY IF EXISTS "Psicólogas pueden ver sus pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Ver pacientes según rol" ON public.pacientes;
DROP POLICY IF EXISTS "Actualizar pacientes según rol" ON public.pacientes;
DROP POLICY IF EXISTS "Pacientes can update own data" ON public.pacientes;
DROP POLICY IF EXISTS "Psicólogas pueden actualizar sus pacientes" ON public.pacientes;

-- ============================================================================
-- PASO 2: Crear políticas SIMPLES y CLARAS (sin recursión)
-- ============================================================================

-- ✅ INSERT: Staff puede crear pacientes
-- ============================================================================
CREATE POLICY "staff_can_insert_pacientes"
ON public.pacientes
FOR INSERT
TO authenticated
WITH CHECK (
    -- Verificar que quien inserta tiene is_staff = true en su perfil
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND is_staff = true
    )
);

-- ✅ SELECT: Ver pacientes según rol
-- ============================================================================
CREATE POLICY "read_pacientes_by_role"
ON public.pacientes
FOR SELECT
TO authenticated
USING (
    -- Staff puede ver todos los pacientes
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND is_staff = true
    )
    OR
    -- Pacientes solo ven su propio registro (si el id coincide)
    id = auth.uid()
);

-- ✅ UPDATE: Actualizar pacientes según rol
-- ============================================================================
CREATE POLICY "update_pacientes_by_role"
ON public.pacientes
FOR UPDATE
TO authenticated
USING (
    -- Staff puede actualizar cualquier paciente
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND is_staff = true
    )
    OR
    -- Pacientes pueden actualizar su propio registro
    id = auth.uid()
)
WITH CHECK (
    -- Misma lógica para WITH CHECK
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND is_staff = true
    )
    OR
    id = auth.uid()
);

-- ✅ DELETE: Solo staff puede eliminar (soft delete recomendado)
-- ============================================================================
CREATE POLICY "staff_can_delete_pacientes"
ON public.pacientes
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND is_staff = true
    )
);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
    total_policies integer;
BEGIN
    SELECT COUNT(*) INTO total_policies 
    FROM pg_policies 
    WHERE tablename = 'pacientes';
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ POLÍTICAS RLS DE PACIENTES CORREGIDAS';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Total de políticas: %', total_policies;
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Políticas creadas:';
    RAISE NOTICE '  1. staff_can_insert_pacientes - Staff crea pacientes';
    RAISE NOTICE '  2. read_pacientes_by_role - Ver según rol';
    RAISE NOTICE '  3. update_pacientes_by_role - Actualizar según rol';
    RAISE NOTICE '  4. staff_can_delete_pacientes - Solo staff elimina';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE:';
    RAISE NOTICE '  - Staff (is_staff = true) puede hacer todo';
    RAISE NOTICE '  - Pacientes solo ven/actualizan su registro';
    RAISE NOTICE '  - Usa is_staff (no causa recursión)';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Siguiente paso:';
    RAISE NOTICE '  1. Vuelve a la app';
    RAISE NOTICE '  2. Intenta crear un paciente';
    RAISE NOTICE '  3. ✅ Debería funcionar sin errores';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- Ver políticas finales
SELECT 
    '📋 Políticas finales de pacientes:' as info,
    policyname,
    cmd as operacion,
    CASE 
        WHEN qual IS NOT NULL THEN substring(qual::text, 1, 60)
        ELSE 'N/A'
    END as condicion_using
FROM pg_policies 
WHERE tablename = 'pacientes'
ORDER BY cmd, policyname;
