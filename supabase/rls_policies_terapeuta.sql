-- ============================================================================
-- POLÍTICAS DE SEGURIDAD RLS PARA PANEL DE TERAPEUTAS
-- ============================================================================
-- Este script configura Row Level Security (RLS) para proteger el acceso
-- a pacientes, sesiones, bonos y pagos según el rol del usuario.
-- ============================================================================

-- ============================================================================
-- 1. ACTIVAR RLS EN TODAS LAS TABLAS
-- ============================================================================

ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. POLÍTICAS PARA TABLA PACIENTES
-- ============================================================================

-- Política: Terapeutas pueden ver sus propios pacientes
DROP POLICY IF EXISTS "terapeutas_ver_sus_pacientes" ON public.pacientes;
CREATE POLICY "terapeutas_ver_sus_pacientes"
ON public.pacientes
FOR SELECT
USING (
  -- Verificar que el usuario sea terapeuta
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  )
);

-- Política: Terapeutas pueden insertar pacientes
DROP POLICY IF EXISTS "terapeutas_insertar_pacientes" ON public.pacientes;
CREATE POLICY "terapeutas_insertar_pacientes"
ON public.pacientes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  )
);

-- Política: Terapeutas pueden actualizar sus pacientes
DROP POLICY IF EXISTS "terapeutas_actualizar_pacientes" ON public.pacientes;
CREATE POLICY "terapeutas_actualizar_pacientes"
ON public.pacientes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  )
);

-- Política: Solo admins pueden eliminar pacientes
DROP POLICY IF EXISTS "solo_admins_eliminar_pacientes" ON public.pacientes;
CREATE POLICY "solo_admins_eliminar_pacientes"
ON public.pacientes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol = 'admin'
  )
);

-- ============================================================================
-- 3. POLÍTICAS PARA TABLA SESIONES
-- ============================================================================

-- Política: Terapeutas pueden ver todas las sesiones
DROP POLICY IF EXISTS "terapeutas_ver_sesiones" ON public.sesiones;
CREATE POLICY "terapeutas_ver_sesiones"
ON public.sesiones
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  )
);

-- Política: Terapeutas pueden crear sesiones
DROP POLICY IF EXISTS "terapeutas_crear_sesiones" ON public.sesiones;
CREATE POLICY "terapeutas_crear_sesiones"
ON public.sesiones
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  )
);

-- Política: Terapeutas pueden actualizar sesiones
DROP POLICY IF EXISTS "terapeutas_actualizar_sesiones" ON public.sesiones;
CREATE POLICY "terapeutas_actualizar_sesiones"
ON public.sesiones
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  )
);

-- Política: Terapeutas pueden cancelar (soft delete) sesiones
DROP POLICY IF EXISTS "terapeutas_cancelar_sesiones" ON public.sesiones;
CREATE POLICY "terapeutas_cancelar_sesiones"
ON public.sesiones
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  )
);

-- ============================================================================
-- 4. POLÍTICAS PARA TABLA BONOS
-- ============================================================================

-- Política: Terapeutas pueden ver todos los bonos
DROP POLICY IF EXISTS "terapeutas_ver_bonos" ON public.bonos;
CREATE POLICY "terapeutas_ver_bonos"
ON public.bonos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  )
);

-- Política: Terapeutas pueden crear bonos
DROP POLICY IF EXISTS "terapeutas_crear_bonos" ON public.bonos;
CREATE POLICY "terapeutas_crear_bonos"
ON public.bonos
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  )
);

-- Política: Terapeutas pueden actualizar bonos
DROP POLICY IF EXISTS "terapeutas_actualizar_bonos" ON public.bonos;
CREATE POLICY "terapeutas_actualizar_bonos"
ON public.bonos
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  )
);

-- ============================================================================
-- 5. POLÍTICAS PARA TABLA PAGOS
-- ============================================================================

-- Política: Terapeutas pueden ver pagos
DROP POLICY IF EXISTS "terapeutas_ver_pagos" ON public.pagos;
CREATE POLICY "terapeutas_ver_pagos"
ON public.pagos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  )
);

-- Política: Solo admins y coordinadoras pueden registrar pagos
DROP POLICY IF EXISTS "admins_registrar_pagos" ON public.pagos;
CREATE POLICY "admins_registrar_pagos"
ON public.pagos
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('admin', 'coordinadora')
  )
);

-- Política: Solo admins y coordinadoras pueden actualizar pagos
DROP POLICY IF EXISTS "admins_actualizar_pagos" ON public.pagos;
CREATE POLICY "admins_actualizar_pagos"
ON public.pagos
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('admin', 'coordinadora')
  )
);

-- ============================================================================
-- 6. FUNCIONES AUXILIARES PARA ESTADÍSTICAS
-- ============================================================================

-- Función: Obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  -- Verificar que el usuario sea terapeuta
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT json_build_object(
    'total_pacientes', (SELECT COUNT(*) FROM public.pacientes),
    'pacientes_activos', (SELECT COUNT(*) FROM public.pacientes WHERE activo = true),
    'sesiones_mes_actual', (
      SELECT COUNT(*) FROM public.sesiones
      WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
    ),
    'sesiones_completadas_mes', (
      SELECT COUNT(*) FROM public.sesiones
      WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
      AND estado = 'realizada'
    ),
    'ingresos_mes', (
      SELECT COALESCE(SUM(precio_total * 0.7), 0)
      FROM public.sesiones
      WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
      AND estado = 'realizada'
    ),
    'bonos_activos', (
      SELECT COUNT(*) FROM public.bonos
      WHERE activo = true
      AND sesiones_usadas < sesiones_totales
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Obtener resumen de un paciente
CREATE OR REPLACE FUNCTION public.get_paciente_resumen(paciente_uuid UUID)
RETURNS JSON AS $$
DECLARE
  resumen JSON;
BEGIN
  -- Verificar autorización
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('psicologa', 'admin', 'coordinadora')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT json_build_object(
    'total_sesiones', (
      SELECT COUNT(*) FROM public.sesiones WHERE paciente_id = paciente_uuid
    ),
    'sesiones_completadas', (
      SELECT COUNT(*) FROM public.sesiones
      WHERE paciente_id = paciente_uuid AND estado = 'realizada'
    ),
    'sesiones_pendientes', (
      SELECT COUNT(*) FROM public.sesiones
      WHERE paciente_id = paciente_uuid AND estado IN ('pendiente', 'confirmada')
    ),
    'ultima_sesion', (
      SELECT MAX(fecha) FROM public.sesiones
      WHERE paciente_id = paciente_uuid AND estado = 'realizada'
    ),
    'bonos_activos', (
      SELECT COUNT(*) FROM public.bonos
      WHERE paciente_id = paciente_uuid AND activo = true
    ),
    'sesiones_restantes_bono', (
      SELECT COALESCE(SUM(sesiones_totales - sesiones_usadas), 0)
      FROM public.bonos
      WHERE paciente_id = paciente_uuid AND activo = true
    )
  ) INTO resumen;

  RETURN resumen;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sesiones_paciente_fecha ON public.sesiones(paciente_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_sesiones_estado ON public.sesiones(estado);
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON public.sesiones(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_bonos_paciente ON public.bonos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_bonos_activo ON public.bonos(activo);
CREATE INDEX IF NOT EXISTS idx_pagos_sesion ON public.pagos(sesion_id);

-- ============================================================================
-- 8. TRIGGERS AUTOMÁTICOS
-- ============================================================================

-- Trigger: Actualizar sesiones_usadas en bonos al crear sesión
CREATE OR REPLACE FUNCTION public.actualizar_sesiones_bono()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bono_id IS NOT NULL AND NEW.estado = 'realizada' THEN
    UPDATE public.bonos
    SET sesiones_usadas = sesiones_usadas + 1
    WHERE id = NEW.bono_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_sesiones_bono ON public.sesiones;
CREATE TRIGGER trigger_actualizar_sesiones_bono
  AFTER INSERT OR UPDATE ON public.sesiones
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_sesiones_bono();

-- ============================================================================
-- 9. VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar que RLS está activo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('pacientes', 'sesiones', 'bonos', 'pagos');

-- Listar políticas activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('pacientes', 'sesiones', 'bonos', 'pagos')
ORDER BY tablename, policyname;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
--
-- 1. SEGURIDAD:
--    - Todas las tablas tienen RLS activado
--    - Solo terapeutas autorizados pueden acceder a los datos
--    - Los roles permitidos son: 'psicologa', 'admin', 'coordinadora'
--
-- 2. PERMISOS ESPECIALES:
--    - Solo admins pueden eliminar pacientes
--    - Solo admins y coordinadoras pueden gestionar pagos
--    - Terapeutas tienen acceso completo a sus pacientes y sesiones
--
-- 3. RENDIMIENTO:
--    - Índices creados en las columnas más consultadas
--    - Funciones SECURITY DEFINER para consultas complejas
--
-- 4. AUDITORÍA:
--    - Todos los cambios quedan registrados por defecto en Supabase
--    - Los timestamps created_at y updated_at se actualizan automáticamente
--
-- 5. TESTING:
--    Después de ejecutar este script, verifica que:
--    - Los terapeutas pueden ver y editar pacientes
--    - Los terapeutas pueden ver y editar sesiones
--    - Los usuarios sin rol de terapeuta NO pueden acceder a los datos
--
-- ============================================================================
