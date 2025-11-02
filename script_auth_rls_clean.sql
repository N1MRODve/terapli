-- SCRIPT MASIVO: Corregir Auth RLS InitPlan Errors
-- Reemplazar auth.<function>() con (select auth.<function>()) para optimizar rendimiento

-- ============================================
-- TABLA: profiles
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
-- TABLA: pacientes
-- ============================================

-- 4. Terapeutas pueden ver sus pacientes
DROP POLICY IF EXISTS "Terapeutas pueden ver sus pacientes" ON public.pacientes;
CREATE POLICY "Terapeutas pueden ver sus pacientes" ON public.pacientes
FOR ALL TO authenticated
USING (
  terapeuta_asignado_id IN (
    SELECT t.id FROM public.terapeutas t
    JOIN public.profiles p ON t.email = p.email
    WHERE p.user_id = (select auth.uid())
  )
);

-- 5. read_pacientes_by_role
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

-- 6. staff_can_delete_pacientes
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

-- 7. staff_can_insert_pacientes
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

-- 8. update_pacientes_by_role
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
-- TABLA: bonos
-- ============================================

-- 9. paciente_read_own_bonos
DROP POLICY IF EXISTS "paciente_read_own_bonos" ON public.bonos;
CREATE POLICY "paciente_read_own_bonos" ON public.bonos
FOR SELECT TO authenticated
USING (
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE profile_id = (select auth.uid())
  )
);

-- 10. psicologa_ve_bonos_de_sus_pacientes
DROP POLICY IF EXISTS "psicologa_ve_bonos_de_sus_pacientes" ON public.bonos;
CREATE POLICY "psicologa_ve_bonos_de_sus_pacientes" ON public.bonos
FOR SELECT TO authenticated
USING (
  paciente_id IN (
    SELECT p.id FROM public.pacientes p
    JOIN public.terapeutas t ON p.terapeuta_asignado_id = t.id
    JOIN public.profiles prof ON t.email = prof.email
    WHERE prof.user_id = (select auth.uid())
  )
);

-- 11. staff_full_access_bonos
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
-- TABLA: sesiones
-- ============================================

-- 12. paciente_read_own_sesiones
DROP POLICY IF EXISTS "paciente_read_own_sesiones" ON public.sesiones;
CREATE POLICY "paciente_read_own_sesiones" ON public.sesiones
FOR SELECT TO authenticated
USING (
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE profile_id = (select auth.uid())
  )
);

-- 13. staff_full_access_sesiones
DROP POLICY IF EXISTS "staff_full_access_sesiones" ON public.sesiones;
CREATE POLICY "staff_full_access_sesiones" ON public.sesiones
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- ============================================
-- TABLA: pagos
-- ============================================

-- 14. Pacientes can view own pagos
DROP POLICY IF EXISTS "Pacientes can view own pagos" ON public.pagos;
CREATE POLICY "Pacientes can view own pagos" ON public.pagos
FOR SELECT TO authenticated
USING (
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE profile_id = (select auth.uid())
  )
);

-- 15. Solo staff gestiona pagos
DROP POLICY IF EXISTS "Solo staff gestiona pagos" ON public.pagos;
CREATE POLICY "Solo staff gestiona pagos" ON public.pagos
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora')
  )
);

-- 16. Ver pagos según rol
DROP POLICY IF EXISTS "Ver pagos según rol" ON public.pagos;
CREATE POLICY "Ver pagos según rol" ON public.pagos
FOR SELECT TO authenticated, anon, authenticator, dashboard_user
USING (
  -- Admin y coordinadora ven todo
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora')
  )
  OR
  -- Pacientes ven sus propios pagos
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE profile_id = (select auth.uid())
  )
);

-- ============================================
-- TABLA: recursos
-- ============================================

-- 17. Solo psicólogas gestionan recursos
DROP POLICY IF EXISTS "Solo psicólogas gestionan recursos" ON public.recursos;
CREATE POLICY "Solo psicólogas gestionan recursos" ON public.recursos
FOR ALL TO authenticated, anon, authenticator, dashboard_user
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 18. Ver recursos según visibilidad
DROP POLICY IF EXISTS "Ver recursos según visibilidad" ON public.recursos;
CREATE POLICY "Ver recursos según visibilidad" ON public.recursos
FOR SELECT TO authenticated, anon, authenticator, dashboard_user
USING (
  visibilidad = 'publico' 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- ============================================
-- TABLA: mensajes
-- ============================================

-- 19. Eliminar mensajes propios
DROP POLICY IF EXISTS "Eliminar mensajes propios" ON public.mensajes;
CREATE POLICY "Eliminar mensajes propios" ON public.mensajes
FOR DELETE TO authenticated
USING (
  remitente_id = (select auth.uid()) OR destinatario_id = (select auth.uid())
);

-- 20. Marcar mensajes como leído
DROP POLICY IF EXISTS "Marcar mensajes como leído" ON public.mensajes;
CREATE POLICY "Marcar mensajes como leído" ON public.mensajes
FOR UPDATE TO authenticated
USING (destinatario_id = (select auth.uid()));

-- 21. Pacientes can insert own mensajes
DROP POLICY IF EXISTS "Pacientes can insert own mensajes" ON public.mensajes;
CREATE POLICY "Pacientes can insert own mensajes" ON public.mensajes
FOR INSERT TO authenticated
WITH CHECK (remitente_id = (select auth.uid()));

-- 22. Pacientes can update leido status
DROP POLICY IF EXISTS "Pacientes can update leido status" ON public.mensajes;
CREATE POLICY "Pacientes can update leido status" ON public.mensajes
FOR UPDATE TO authenticated
USING (destinatario_id = (select auth.uid()));

-- 23. Pacientes can view own mensajes
DROP POLICY IF EXISTS "Pacientes can view own mensajes" ON public.mensajes;
CREATE POLICY "Pacientes can view own mensajes" ON public.mensajes
FOR SELECT TO authenticated
USING (
  remitente_id = (select auth.uid()) OR destinatario_id = (select auth.uid())
);

-- 24. Ver solo mensajes propios
DROP POLICY IF EXISTS "Ver solo mensajes propios" ON public.mensajes;
CREATE POLICY "Ver solo mensajes propios" ON public.mensajes
FOR SELECT TO authenticated
USING (
  remitente_id = (select auth.uid()) OR destinatario_id = (select auth.uid())
);

-- ============================================
-- TABLA: notas_terapeuticas
-- ============================================

-- 25. Solo psicólogas gestionan notas
DROP POLICY IF EXISTS "Solo psicólogas gestionan notas" ON public.notas_terapeuticas;
CREATE POLICY "Solo psicólogas gestionan notas" ON public.notas_terapeuticas
FOR ALL TO authenticated, anon, authenticator, dashboard_user
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 26. Solo psicólogas ven notas
DROP POLICY IF EXISTS "Solo psicólogas ven notas" ON public.notas_terapeuticas;
CREATE POLICY "Solo psicólogas ven notas" ON public.notas_terapeuticas
FOR SELECT TO authenticated, anon, authenticator, dashboard_user
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- ============================================
-- TABLA: logs_evento
-- ============================================

-- 27. Solo admin ve logs
DROP POLICY IF EXISTS "Solo admin ve logs" ON public.logs_evento;
CREATE POLICY "Solo admin ve logs" ON public.logs_evento
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- ============================================
-- TABLA: registros_emocionales
-- ============================================

-- 28. Crear registros emocionales
DROP POLICY IF EXISTS "Crear registros emocionales" ON public.registros_emocionales;
CREATE POLICY "Crear registros emocionales" ON public.registros_emocionales
FOR INSERT TO authenticated, anon, authenticator, dashboard_user
WITH CHECK (
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 29. Modificar registros emocionales
DROP POLICY IF EXISTS "Modificar registros emocionales" ON public.registros_emocionales;
CREATE POLICY "Modificar registros emocionales" ON public.registros_emocionales
FOR ALL TO authenticated, anon, authenticator, dashboard_user
USING (
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 30. Ver registros emocionales según rol
DROP POLICY IF EXISTS "Ver registros emocionales según rol" ON public.registros_emocionales;
CREATE POLICY "Ver registros emocionales según rol" ON public.registros_emocionales
FOR SELECT TO authenticated, anon, authenticator, dashboard_user
USING (
  -- Paciente ve sus propios registros
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  -- Staff ve todos los registros
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- ============================================
-- TABLA: metricas_bienestar
-- ============================================

-- 31. Gestionar métricas propias
DROP POLICY IF EXISTS "Gestionar métricas propias" ON public.metricas_bienestar;
CREATE POLICY "Gestionar métricas propias" ON public.metricas_bienestar
FOR ALL TO authenticated, anon, authenticator, dashboard_user
USING (
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 32. Ver métricas según rol
DROP POLICY IF EXISTS "Ver métricas según rol" ON public.metricas_bienestar;
CREATE POLICY "Ver métricas según rol" ON public.metricas_bienestar
FOR SELECT TO authenticated, anon, authenticator, dashboard_user
USING (
  -- Paciente ve sus propias métricas
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  -- Staff ve todas las métricas
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- ============================================
-- TABLA: ejercicios_bienestar
-- ============================================

-- 33. Solo psicólogas gestionan ejercicios
DROP POLICY IF EXISTS "Solo psicólogas gestionan ejercicios" ON public.ejercicios_bienestar;
CREATE POLICY "Solo psicólogas gestionan ejercicios" ON public.ejercicios_bienestar
FOR ALL TO authenticated, anon, authenticator, dashboard_user
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 34. Ver ejercicios públicos
DROP POLICY IF EXISTS "Ver ejercicios públicos" ON public.ejercicios_bienestar;
CREATE POLICY "Ver ejercicios públicos" ON public.ejercicios_bienestar
FOR SELECT TO authenticated, anon, authenticator, dashboard_user
USING (
  es_publico = true 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- ============================================
-- TABLA: ejercicios_asignados
-- ============================================

-- 35. Gestionar ejercicios asignados
DROP POLICY IF EXISTS "Gestionar ejercicios asignados" ON public.ejercicios_asignados;
CREATE POLICY "Gestionar ejercicios asignados" ON public.ejercicios_asignados
FOR ALL TO authenticated, anon, authenticator, dashboard_user
USING (
  -- Paciente gestiona sus ejercicios asignados
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  -- Staff gestiona todos los ejercicios
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- 36. Ver ejercicios asignados
DROP POLICY IF EXISTS "Ver ejercicios asignados" ON public.ejercicios_asignados;
CREATE POLICY "Ver ejercicios asignados" ON public.ejercicios_asignados
FOR SELECT TO authenticated, anon, authenticator, dashboard_user
USING (
  -- Paciente ve sus ejercicios asignados
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  -- Staff ve todos los ejercicios asignados
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- ============================================
-- TABLA: terapeutas
-- ============================================

-- 37. Coordinación puede ver todos los terapeutas
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

-- 38. Terapeutas pueden ver su propio perfil
DROP POLICY IF EXISTS "Terapeutas pueden ver su propio perfil" ON public.terapeutas;
CREATE POLICY "Terapeutas pueden ver su propio perfil" ON public.terapeutas
FOR SELECT TO authenticated
USING (
  email IN (
    SELECT email FROM public.profiles 
    WHERE user_id = (select auth.uid())
  )
);

-- 38. Terapeutas pueden ver su propio perfil
DROP POLICY IF EXISTS "Terapeutas pueden ver su propio perfil" ON public.terapeutas;
CREATE POLICY "Terapeutas pueden ver su propio perfil" ON public.terapeutas
FOR SELECT TO authenticated
USING (profile_id = (select auth.uid()));

-- ============================================
-- TABLA: citas
-- ============================================

-- 39. Actualizar citas propias
DROP POLICY IF EXISTS "Actualizar citas propias" ON public.citas;
CREATE POLICY "Actualizar citas propias" ON public.citas
FOR UPDATE TO authenticated
USING (
  -- Paciente actualiza sus citas
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  -- Terapeuta actualiza citas de sus pacientes
  terapeuta_id IN (
    SELECT t.id FROM public.terapeutas t
    JOIN public.profiles p ON t.email = p.email
    WHERE p.user_id = (select auth.uid())
  )
  OR
  -- Staff actualiza cualquier cita
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora')
  )
);

-- 40. Crear citas propias
DROP POLICY IF EXISTS "Crear citas propias" ON public.citas;
CREATE POLICY "Crear citas propias" ON public.citas
FOR INSERT TO authenticated
WITH CHECK (
  -- Paciente crea sus citas
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  -- Terapeuta crea citas para sus pacientes
  terapeuta_id IN (
    SELECT t.id FROM public.terapeutas t
    JOIN public.profiles p ON t.email = p.email
    WHERE p.user_id = (select auth.uid())
  )
  OR
  -- Staff crea cualquier cita
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora')
  )
);

-- 41. Eliminar citas propias
DROP POLICY IF EXISTS "Eliminar citas propias" ON public.citas;
CREATE POLICY "Eliminar citas propias" ON public.citas
FOR DELETE TO authenticated
USING (
  -- Paciente elimina sus citas
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  -- Terapeuta elimina citas de sus pacientes
  terapeuta_id IN (
    SELECT t.id FROM public.terapeutas t
    JOIN public.profiles p ON t.email = p.email
    WHERE p.user_id = (select auth.uid())
  )
  OR
  -- Staff elimina cualquier cita
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora')
  )
);

-- 42. Ver citas propias
DROP POLICY IF EXISTS "Ver citas propias" ON public.citas;
CREATE POLICY "Ver citas propias" ON public.citas
FOR SELECT TO authenticated
USING (
  -- Paciente ve sus citas
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  -- Terapeuta ve citas de sus pacientes
  terapeuta_id IN (
    SELECT t.id FROM public.terapeutas t
    JOIN public.profiles p ON t.email = p.email
    WHERE p.user_id = (select auth.uid())
  )
  OR
  -- Staff ve todas las citas
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora')
  )
);

-- 40. Crear citas propias
DROP POLICY IF EXISTS "Crear citas propias" ON public.citas;
CREATE POLICY "Crear citas propias" ON public.citas
FOR INSERT TO authenticated
WITH CHECK (
  -- Paciente crea sus citas
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  -- Terapeuta crea citas para sus pacientes
  terapeuta_id IN (
    SELECT id FROM public.terapeutas 
    WHERE profile_id = (select auth.uid())
  )
  OR
  -- Staff crea cualquier cita
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora')
  )
);

-- 41. Eliminar citas propias
DROP POLICY IF EXISTS "Eliminar citas propias" ON public.citas;
CREATE POLICY "Eliminar citas propias" ON public.citas
FOR DELETE TO authenticated
USING (
  -- Paciente elimina sus citas
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  -- Terapeuta elimina citas de sus pacientes
  terapeuta_id IN (
    SELECT id FROM public.terapeutas 
    WHERE profile_id = (select auth.uid())
  )
  OR
  -- Staff elimina cualquier cita
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora')
  )
);

-- 42. Ver citas propias
DROP POLICY IF EXISTS "Ver citas propias" ON public.citas;
CREATE POLICY "Ver citas propias" ON public.citas
FOR SELECT TO authenticated
USING (
  -- Paciente ve sus citas
  paciente_id IN (
    SELECT id FROM public.pacientes 
    WHERE user_id = (select auth.uid())
  )
  OR
  -- Terapeuta ve citas de sus pacientes
  terapeuta_id IN (
    SELECT id FROM public.terapeutas 
    WHERE profile_id = (select auth.uid())
  )
  OR
  -- Staff ve todas las citas
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora')
  )
);

-- ============================================
-- TABLA: movimientos_bonos
-- ============================================

-- 43. select_movimientos_bonos
DROP POLICY IF EXISTS "select_movimientos_bonos" ON public.movimientos_bonos;
CREATE POLICY "select_movimientos_bonos" ON public.movimientos_bonos
FOR SELECT TO authenticated
USING (
  -- Paciente ve movimientos de sus bonos
  bono_id IN (
    SELECT b.id FROM public.bonos b
    JOIN public.pacientes p ON b.paciente_id = p.id
    WHERE p.user_id = (select auth.uid())
  )
  OR
  -- Staff ve todos los movimientos
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = (select auth.uid()) 
    AND role IN ('admin', 'coordinadora', 'psicologa')
  )
);

-- ============================================
-- TABLA: notificaciones
-- ============================================

-- 44. Usuarios pueden actualizar sus propias notificaciones
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias notificaciones" ON public.notificaciones;
CREATE POLICY "Usuarios pueden actualizar sus propias notificaciones" ON public.notificaciones
FOR UPDATE TO authenticated
USING (usuario_id = (select auth.uid()));

-- 45. Usuarios pueden eliminar sus propias notificaciones
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias notificaciones" ON public.notificaciones;
CREATE POLICY "Usuarios pueden eliminar sus propias notificaciones" ON public.notificaciones
FOR DELETE TO authenticated
USING (usuario_id = (select auth.uid()));

-- 46. Usuarios pueden ver sus propias notificaciones
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias notificaciones" ON public.notificaciones;
CREATE POLICY "Usuarios pueden ver sus propias notificaciones" ON public.notificaciones
FOR SELECT TO authenticated
USING (usuario_id = (select auth.uid()));

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Contar políticas corregidas
SELECT 
    'RESUMEN: Auth RLS InitPlan Errors Corregidos' as status,
    count(*) as total_policies_updated
FROM pg_policies 
WHERE schemaname = 'public' 
AND (
    qual LIKE '%select auth.%' 
    OR with_check LIKE '%select auth.%'
);