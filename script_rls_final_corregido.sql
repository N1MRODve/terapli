-- SCRIPT FINAL CORREGIDO: Auth RLS InitPlan Errors Fix
-- ESTRUCTURA REAL DESCUBIERTA:
-- - profiles.user_id -> auth.uid() 
-- - pacientes.email -> profiles.email (NO usa profile_id que es NULL)
-- - terapeutas.email -> profiles.email
-- - pacientes.terapeuta_id -> terapeutas.id

-- ============================================
-- PASO 1: TABLA PROFILES (Probado primero)
-- ============================================

-- 1. elevated_roles_select_all
DROP POLICY IF EXISTS "elevated_roles_select_all" ON public.profiles;
CREATE POLICY "elevated_roles_select_all" ON public.profiles
FOR SELECT TO authenticated
USING (
  (select auth.uid()) IN (
    SELECT user_id FROM public.profiles 
    WHERE role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 2. select_own_profile  
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles
FOR SELECT TO authenticated
USING (user_id = (select auth.uid()));

-- 3. update_own_profile
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles
FOR UPDATE TO authenticated
USING (user_id = (select auth.uid()));

-- ============================================
-- PASO 2: TABLA PACIENTES (Conexión por EMAIL)
-- ============================================

-- 4. Pacientes pueden ver su propio perfil (por email)
DROP POLICY IF EXISTS "paciente_can_view_own_profile" ON public.pacientes;
CREATE POLICY "paciente_can_view_own_profile" ON public.pacientes
FOR SELECT TO authenticated
USING (
  email IN (
    SELECT email FROM public.profiles 
    WHERE user_id = (select auth.uid())
  )
);

-- 5. Terapeutas pueden ver sus pacientes (por terapeuta_id)
DROP POLICY IF EXISTS "Terapeutas pueden ver sus pacientes" ON public.pacientes;
CREATE POLICY "Terapeutas pueden ver sus pacientes" ON public.pacientes
FOR ALL TO authenticated
USING (
  terapeuta_id IN (
    SELECT t.id FROM public.terapeutas t
    JOIN public.profiles p ON t.email = p.email
    WHERE p.user_id = (select auth.uid())
  )
);

-- 6. Staff puede ver todos los pacientes
DROP POLICY IF EXISTS "read_pacientes_by_role" ON public.pacientes;
CREATE POLICY "read_pacientes_by_role" ON public.pacientes
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 7. Staff puede eliminar pacientes
DROP POLICY IF EXISTS "staff_can_delete_pacientes" ON public.pacientes;
CREATE POLICY "staff_can_delete_pacientes" ON public.pacientes
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora')
  )
);

-- 8. Staff puede insertar pacientes
DROP POLICY IF EXISTS "staff_can_insert_pacientes" ON public.pacientes;
CREATE POLICY "staff_can_insert_pacientes" ON public.pacientes
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 9. Staff puede actualizar pacientes
DROP POLICY IF EXISTS "update_pacientes_by_role" ON public.pacientes;
CREATE POLICY "update_pacientes_by_role" ON public.pacientes
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- ============================================
-- PASO 3: TABLA TERAPEUTAS (Conexión por EMAIL)
-- ============================================

-- 10. Coordinación puede ver todos los terapeutas
DROP POLICY IF EXISTS "Coordinación puede ver todos los terapeutas" ON public.terapeutas;
CREATE POLICY "Coordinación puede ver todos los terapeutas" ON public.terapeutas
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora')
  )
);

-- 11. Terapeutas pueden ver su propio perfil
DROP POLICY IF EXISTS "Terapeutas pueden ver su propio perfil" ON public.terapeutas;
CREATE POLICY "Terapeutas pueden ver su propio perfil" ON public.terapeutas
FOR SELECT TO authenticated
USING (
  email IN (
    SELECT email FROM public.profiles 
    WHERE user_id = (select auth.uid())
  )
);

-- ============================================
-- PASO 4: TABLA BONOS
-- ============================================

-- 12. Pacientes pueden ver sus bonos (por email)
DROP POLICY IF EXISTS "paciente_read_own_bonos" ON public.bonos;
CREATE POLICY "paciente_read_own_bonos" ON public.bonos
FOR SELECT TO authenticated
USING (
  paciente_id IN (
    SELECT pac.id FROM public.pacientes pac
    JOIN public.profiles p ON pac.email = p.email
    WHERE p.user_id = (select auth.uid())
  )
);

-- 13. Psicólogas ven bonos de sus pacientes
DROP POLICY IF EXISTS "psicologa_ve_bonos_de_sus_pacientes" ON public.bonos;
CREATE POLICY "psicologa_ve_bonos_de_sus_pacientes" ON public.bonos
FOR SELECT TO authenticated
USING (
  paciente_id IN (
    SELECT p.id FROM public.pacientes p
    JOIN public.terapeutas t ON p.terapeuta_id = t.id
    JOIN public.profiles prof ON t.email = prof.email
    WHERE prof.user_id = (select auth.uid())
  )
);

-- 14. Staff acceso completo a bonos
DROP POLICY IF EXISTS "staff_full_access_bonos" ON public.bonos;
CREATE POLICY "staff_full_access_bonos" ON public.bonos
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora')
  )
);

-- ============================================
-- VERIFICACIÓN (Ejecutar al final)
-- ============================================

-- Contar políticas corregidas
SELECT 
    'RLS Policies Updated Successfully' as status,
    count(*) as total_policies_fixed
FROM pg_policies 
WHERE schemaname = 'public' 
AND (
    qual LIKE '%(select auth.%' 
    OR with_check LIKE '%(select auth.%'
);