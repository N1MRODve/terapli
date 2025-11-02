-- PASO 2: Tabla PACIENTES - Auth RLS InitPlan Fix
-- Usando conexión por email ya que profile_id es NULL

-- 4. Pacientes pueden ver su propio perfil (por email)
DROP POLICY IF EXISTS "paciente_can_view_own_profile" ON public.pacientes;
CREATE POLICY "paciente_can_view_own_profile" ON public.pacientes
FOR SELECT TO authenticated
USING (
  email IN (
    SELECT email FROM public.profiles 
    WHERE id = (select auth.uid())
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
    WHERE p.id = (select auth.uid())
  )
);

-- 6. Staff puede ver todos los pacientes
DROP POLICY IF EXISTS "read_pacientes_by_role" ON public.pacientes;
CREATE POLICY "read_pacientes_by_role" ON public.pacientes
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) 
    AND rol IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 7. Staff puede eliminar pacientes
DROP POLICY IF EXISTS "staff_can_delete_pacientes" ON public.pacientes;
CREATE POLICY "staff_can_delete_pacientes" ON public.pacientes
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) 
    AND rol IN ('admin', 'coordinadora')
  )
);

-- 8. Staff puede insertar pacientes
DROP POLICY IF EXISTS "staff_can_insert_pacientes" ON public.pacientes;
CREATE POLICY "staff_can_insert_pacientes" ON public.pacientes
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) 
    AND rol IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 9. Staff puede actualizar pacientes
DROP POLICY IF EXISTS "update_pacientes_by_role" ON public.pacientes;
CREATE POLICY "update_pacientes_by_role" ON public.pacientes
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) 
    AND rol IN ('admin', 'coordinadora', 'psicologa')
  )
);