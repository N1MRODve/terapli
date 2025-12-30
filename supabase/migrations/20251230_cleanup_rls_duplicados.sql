-- ============================================================================
-- LIMPIEZA: Eliminar políticas RLS duplicadas/antiguas
-- ============================================================================
-- Este script elimina políticas antiguas que pueden interferir con las nuevas
-- EJECUTAR DESPUÉS DE: 20251230_rls_multi_tenant_completo.sql
-- ============================================================================

-- ============================================================================
-- TABLA: PACIENTES - Limpiar políticas antiguas
-- ============================================================================
-- Mantener SOLO: terapeuta_ve_sus_pacientes, terapeuta_crea_pacientes,
--                terapeuta_actualiza_sus_pacientes, staff_elimina_pacientes

DROP POLICY IF EXISTS "terapeutas_pueden_ver_sus_pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "pacientes_pueden_ver_su_perfil" ON public.pacientes;
DROP POLICY IF EXISTS "staff_puede_ver_todos_pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "staff_puede_crear_pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "staff_puede_actualizar_pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "admin_puede_eliminar_pacientes" ON public.pacientes;

-- ============================================================================
-- TABLA: CITAS - Limpiar políticas antiguas
-- ============================================================================
-- Mantener SOLO: terapeuta_ve_sus_citas, terapeuta_crea_citas,
--                terapeuta_actualiza_sus_citas, terapeuta_elimina_sus_citas

DROP POLICY IF EXISTS "staff_puede_gestionar_citas" ON public.citas;
DROP POLICY IF EXISTS "staff_puede_ver_todas_citas" ON public.citas;
DROP POLICY IF EXISTS "pacientes_pueden_ver_sus_citas" ON public.citas;
DROP POLICY IF EXISTS "terapeutas_pueden_ver_sus_citas" ON public.citas;

-- ============================================================================
-- TABLA: BONOS - Limpiar políticas antiguas
-- ============================================================================
-- Mantener SOLO: terapeuta_ve_bonos_sus_pacientes, terapeuta_crea_bonos_sus_pacientes,
--                terapeuta_actualiza_bonos_sus_pacientes, staff_elimina_bonos

DROP POLICY IF EXISTS "bonos_select_simple" ON public.bonos;
DROP POLICY IF EXISTS "bonos_insert_simple" ON public.bonos;
DROP POLICY IF EXISTS "bonos_update_simple" ON public.bonos;
DROP POLICY IF EXISTS "bonos_delete_simple" ON public.bonos;

-- ============================================================================
-- TABLA: TERAPEUTAS - Limpiar políticas antiguas
-- ============================================================================
-- Mantener SOLO: ver_terapeutas, actualizar_terapeuta, staff_gestiona_terapeutas

DROP POLICY IF EXISTS "admin_puede_gestionar_terapeutas" ON public.terapeutas;
DROP POLICY IF EXISTS "staff_puede_ver_terapeutas" ON public.terapeutas;
DROP POLICY IF EXISTS "terapeutas_pueden_ver_su_perfil" ON public.terapeutas;

-- ============================================================================
-- TABLA: PROFILES - Limpiar políticas antiguas
-- ============================================================================
-- Mantener SOLO: ver_profiles, actualizar_own_profile, insert_profile

DROP POLICY IF EXISTS "admin_puede_ver_otros_perfiles" ON public.profiles;
DROP POLICY IF EXISTS "usuarios_pueden_ver_su_perfil" ON public.profiles;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_su_perfil" ON public.profiles;
DROP POLICY IF EXISTS "sistema_puede_insertar_perfiles" ON public.profiles;

-- ============================================================================
-- TABLA: FACTURAS - Limpiar políticas antiguas
-- ============================================================================
-- Mantener SOLO: terapeuta_ve_facturas (ALL)

DROP POLICY IF EXISTS "staff_full_access_facturas" ON public.facturas;
DROP POLICY IF EXISTS "terapeuta_insert_facturas" ON public.facturas;
DROP POLICY IF EXISTS "terapeuta_ver_propias_facturas" ON public.facturas;
DROP POLICY IF EXISTS "terapeuta_update_facturas" ON public.facturas;

-- ============================================================================
-- TABLA: PAGOS_REGISTROS - Limpiar políticas antiguas
-- ============================================================================
-- Mantener SOLO: terapeuta_ve_pagos (ALL)

DROP POLICY IF EXISTS "staff_full_access_pagos_registros" ON public.pagos_registros;
DROP POLICY IF EXISTS "terapeuta_delete_pagos" ON public.pagos_registros;
DROP POLICY IF EXISTS "terapeuta_insert_pagos" ON public.pagos_registros;
DROP POLICY IF EXISTS "terapeuta_ver_propios_pagos" ON public.pagos_registros;
DROP POLICY IF EXISTS "terapeuta_update_pagos" ON public.pagos_registros;

-- ============================================================================
-- TABLA: NOTIFICACIONES - Limpiar políticas antiguas
-- ============================================================================
-- Mantener SOLO: ver_notificaciones_propias (ALL)

DROP POLICY IF EXISTS "admin_puede_crear_notificaciones" ON public.notificaciones;
DROP POLICY IF EXISTS "usuarios_pueden_ver_sus_notificaciones" ON public.notificaciones;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_sus_notificaciones" ON public.notificaciones;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT '🧹 Limpieza de políticas duplicadas completada' as status;

-- Listar políticas restantes para tablas críticas
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('pacientes', 'citas', 'bonos', 'terapeutas', 'profiles')
ORDER BY tablename, cmd;

-- ============================================================================
-- RESUMEN DE POLÍTICAS ESPERADAS
-- ============================================================================
/*
PACIENTES (4 políticas):
- terapeuta_ve_sus_pacientes (SELECT)
- terapeuta_crea_pacientes (INSERT)
- terapeuta_actualiza_sus_pacientes (UPDATE)
- staff_elimina_pacientes (DELETE)

CITAS (4 políticas):
- terapeuta_ve_sus_citas (SELECT)
- terapeuta_crea_citas (INSERT)
- terapeuta_actualiza_sus_citas (UPDATE)
- terapeuta_elimina_sus_citas (DELETE)

BONOS (4 políticas):
- terapeuta_ve_bonos_sus_pacientes (SELECT)
- terapeuta_crea_bonos_sus_pacientes (INSERT)
- terapeuta_actualiza_bonos_sus_pacientes (UPDATE)
- staff_elimina_bonos (DELETE)

TERAPEUTAS (3 políticas):
- ver_terapeutas (SELECT)
- actualizar_terapeuta (UPDATE)
- staff_gestiona_terapeutas (ALL)

PROFILES (3 políticas):
- ver_profiles (SELECT)
- actualizar_own_profile (UPDATE)
- insert_profile (INSERT)
*/
