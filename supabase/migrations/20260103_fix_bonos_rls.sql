-- ============================================================================
-- MIGRACIÓN: Corregir políticas RLS de bonos
-- ============================================================================
-- Fecha: 3 de enero de 2026
-- Problema: Los terapeutas no pueden ver los bonos de sus pacientes
-- Causa: Conflicto entre múltiples políticas RLS
-- ============================================================================

-- Eliminar TODAS las políticas existentes de bonos
DROP POLICY IF EXISTS "terapeuta_ve_bonos_sus_pacientes" ON public.bonos;
DROP POLICY IF EXISTS "terapeuta_ve_bonos_pacientes" ON public.bonos;
DROP POLICY IF EXISTS "terapeuta_crea_bonos_sus_pacientes" ON public.bonos;
DROP POLICY IF EXISTS "terapeuta_actualiza_bonos_sus_pacientes" ON public.bonos;
DROP POLICY IF EXISTS "staff_elimina_bonos" ON public.bonos;
DROP POLICY IF EXISTS "terapeutas_ver_bonos" ON public.bonos;
DROP POLICY IF EXISTS "terapeutas_crear_bonos" ON public.bonos;
DROP POLICY IF EXISTS "terapeutas_actualizar_bonos" ON public.bonos;
DROP POLICY IF EXISTS "paciente_read_own_bonos" ON public.bonos;
DROP POLICY IF EXISTS "psicologa_ve_bonos_de_sus_pacientes" ON public.bonos;
DROP POLICY IF EXISTS "bonos_select_policy" ON public.bonos;
DROP POLICY IF EXISTS "bonos_insert_policy" ON public.bonos;
DROP POLICY IF EXISTS "bonos_update_policy" ON public.bonos;
DROP POLICY IF EXISTS "bonos_delete_policy" ON public.bonos;

-- Asegurarse de que RLS está habilitado
ALTER TABLE public.bonos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS SIMPLIFICADAS Y CORREGIDAS
-- ============================================================================

-- SELECT: Terapeuta ve bonos de SUS pacientes (via terapeuta_id del paciente O del bono)
CREATE POLICY "bonos_select" ON public.bonos
FOR SELECT TO authenticated
USING (
  -- El bono tiene terapeuta_id directamente (más eficiente)
  terapeuta_id = (SELECT public.get_my_terapeuta_id())
  OR
  -- O el paciente pertenece al terapeuta
  paciente_id IN (
    SELECT p.id FROM public.pacientes p
    WHERE p.terapeuta_id = (SELECT public.get_my_terapeuta_id())
  )
  OR
  -- Staff puede ver todo
  public.is_staff()
  OR
  -- El paciente ve sus propios bonos
  paciente_id IN (
    SELECT id FROM public.pacientes
    WHERE email IN (SELECT email FROM public.profiles WHERE id = auth.uid())
  )
);

-- INSERT: Terapeuta crea bonos para sus pacientes
CREATE POLICY "bonos_insert" ON public.bonos
FOR INSERT TO authenticated
WITH CHECK (
  -- El bono tiene el terapeuta_id del usuario actual
  terapeuta_id = (SELECT public.get_my_terapeuta_id())
  OR
  -- O el paciente pertenece al terapeuta
  paciente_id IN (
    SELECT p.id FROM public.pacientes p
    WHERE p.terapeuta_id = (SELECT public.get_my_terapeuta_id())
  )
  OR
  -- Staff puede crear cualquier bono
  public.is_staff()
);

-- UPDATE: Terapeuta actualiza bonos de sus pacientes
CREATE POLICY "bonos_update" ON public.bonos
FOR UPDATE TO authenticated
USING (
  terapeuta_id = (SELECT public.get_my_terapeuta_id())
  OR
  paciente_id IN (
    SELECT p.id FROM public.pacientes p
    WHERE p.terapeuta_id = (SELECT public.get_my_terapeuta_id())
  )
  OR
  public.is_staff()
)
WITH CHECK (
  terapeuta_id = (SELECT public.get_my_terapeuta_id())
  OR
  paciente_id IN (
    SELECT p.id FROM public.pacientes p
    WHERE p.terapeuta_id = (SELECT public.get_my_terapeuta_id())
  )
  OR
  public.is_staff()
);

-- DELETE: Solo staff puede eliminar bonos
CREATE POLICY "bonos_delete" ON public.bonos
FOR DELETE TO authenticated
USING (public.is_staff());

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bonos';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS BONOS CORREGIDO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Políticas en tabla bonos: %', policy_count;
    RAISE NOTICE '• bonos_select: Terapeuta ve bonos de sus pacientes';
    RAISE NOTICE '• bonos_insert: Terapeuta crea bonos';
    RAISE NOTICE '• bonos_update: Terapeuta actualiza bonos';
    RAISE NOTICE '• bonos_delete: Solo staff elimina';
    RAISE NOTICE '========================================';
END $$;
