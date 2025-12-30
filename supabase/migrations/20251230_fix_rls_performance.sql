-- ============================================================================
-- MIGRACIÓN: Optimización de Rendimiento RLS
-- ============================================================================
-- Fecha: 30 de diciembre de 2025
-- Objetivo: Corregir auth_rls_initplan y multiple_permissive_policies
-- ============================================================================

-- ============================================================================
-- PARTE 1: Eliminar políticas duplicadas
-- ============================================================================

-- ejercicios_asignados: eliminar política genérica, mantener la específica de consulta
DROP POLICY IF EXISTS "ejercicios_asignados_policy" ON public.ejercicios_asignados;

-- ejercicios_bienestar: eliminar política genérica
DROP POLICY IF EXISTS "ejercicios_bienestar_policy" ON public.ejercicios_bienestar;

-- emociones: eliminar política genérica de anon para SELECT
DROP POLICY IF EXISTS "Todos leen catálogo de emociones" ON public.emociones;

-- ============================================================================
-- PARTE 2: Recrear políticas con (select auth.uid()) para mejor rendimiento
-- Solo tablas con columnas verificadas
-- ============================================================================

-- 2.1 Tabla: profiles (id = auth.uid())
DROP POLICY IF EXISTS "ver_profiles" ON public.profiles;
CREATE POLICY "ver_profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "actualizar_own_profile" ON public.profiles;
CREATE POLICY "actualizar_own_profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = (select auth.uid()))
    WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "insert_profile" ON public.profiles;
CREATE POLICY "insert_profile" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = (select auth.uid()));

-- 2.2 Tabla: notificaciones (usuario_id = auth.uid())
DROP POLICY IF EXISTS "ver_notificaciones_propias" ON public.notificaciones;
CREATE POLICY "ver_notificaciones_propias" ON public.notificaciones
    FOR ALL TO authenticated
    USING (usuario_id = (select auth.uid()));

-- 2.3 Tabla: import_configs (user_id = auth.uid())
DROP POLICY IF EXISTS "Users can view their own import configs" ON public.import_configs;
CREATE POLICY "Users can view their own import configs" ON public.import_configs
    FOR SELECT TO authenticated
    USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own import configs" ON public.import_configs;
CREATE POLICY "Users can insert their own import configs" ON public.import_configs
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own import configs" ON public.import_configs;
CREATE POLICY "Users can update their own import configs" ON public.import_configs
    FOR UPDATE TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own import configs" ON public.import_configs;
CREATE POLICY "Users can delete their own import configs" ON public.import_configs
    FOR DELETE TO authenticated
    USING (user_id = (select auth.uid()));

-- 2.4 Tabla: pacientes (usa función get_my_terapeuta_id())
DROP POLICY IF EXISTS "terapeuta_ve_sus_pacientes" ON public.pacientes;
CREATE POLICY "terapeuta_ve_sus_pacientes" ON public.pacientes
    FOR ALL TO authenticated
    USING (terapeuta_id = (select public.get_my_terapeuta_id()));

-- 2.5 Tabla: citas (usa función get_my_terapeuta_id())
DROP POLICY IF EXISTS "terapeuta_ve_sus_citas" ON public.citas;
CREATE POLICY "terapeuta_ve_sus_citas" ON public.citas
    FOR ALL TO authenticated
    USING (terapeuta_id = (select public.get_my_terapeuta_id()));

-- 2.6 Tabla: bonos (usa subquery con get_my_terapeuta_id())
DROP POLICY IF EXISTS "terapeuta_ve_bonos_sus_pacientes" ON public.bonos;
CREATE POLICY "terapeuta_ve_bonos_sus_pacientes" ON public.bonos
    FOR ALL TO authenticated
    USING (
        paciente_id IN (
            SELECT p.id FROM public.pacientes p
            WHERE p.terapeuta_id = (select public.get_my_terapeuta_id())
        )
    );

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'OPTIMIZACIÓN RLS COMPLETADA';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total de políticas en schema public: %', policy_count;
    RAISE NOTICE '• Políticas duplicadas eliminadas';
    RAISE NOTICE '• auth.uid() envuelto en (select ...) para rendimiento';
    RAISE NOTICE '========================================';
END $$;
