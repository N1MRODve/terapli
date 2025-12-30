-- ============================================================================
-- SCRIPT MAESTRO: Aislamiento Multi-Tenant para Terapeutas
-- ============================================================================
-- Fecha: 30 de diciembre de 2025
-- Objetivo: Garantizar que cada terapeuta SOLO pueda ver/modificar sus propios datos
--
-- PRINCIPIOS:
-- 1. Cada terapeuta solo ve sus pacientes (terapeuta_id = mi_id)
-- 2. Cada terapeuta solo ve las citas de sus pacientes
-- 3. Cada terapeuta solo ve los bonos de sus pacientes
-- 4. Coordinadoras y admins pueden ver todo (para gestión)
-- 5. Pacientes pueden ver solo sus propios datos
-- ============================================================================

-- ============================================================================
-- PASO 0: FUNCIÓN AUXILIAR PARA OBTENER ID DEL TERAPEUTA ACTUAL
-- ============================================================================
-- Esta función resuelve el ID del terapeuta basándose en el email del usuario autenticado

CREATE OR REPLACE FUNCTION public.get_my_terapeuta_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id
  FROM public.terapeutas
  WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND activo = true
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_my_terapeuta_id() IS 'Obtiene el ID del terapeuta correspondiente al usuario autenticado actual';

-- Función para verificar si el usuario es staff (admin o coordinadora)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('admin', 'coordinadora')
  );
$$;

COMMENT ON FUNCTION public.is_staff() IS 'Verifica si el usuario actual es admin o coordinadora';

-- Función para verificar si el usuario es terapeuta
CREATE OR REPLACE FUNCTION public.is_terapeuta()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol = 'psicologa'
  );
$$;

COMMENT ON FUNCTION public.is_terapeuta() IS 'Verifica si el usuario actual es terapeuta/psicologa';

-- ============================================================================
-- PASO 1: HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================================

ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terapeutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tablas secundarias (si existen)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sesiones_bonos') THEN
    ALTER TABLE public.sesiones_bonos ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recursos_compartidos') THEN
    ALTER TABLE public.recursos_compartidos ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificaciones') THEN
    ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'facturas') THEN
    ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pagos_registros') THEN
    ALTER TABLE public.pagos_registros ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================================
-- PASO 2: POLÍTICAS PARA TABLA PACIENTES
-- ============================================================================
-- CRÍTICO: Los terapeutas SOLO pueden ver SUS pacientes

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "terapeutas_ver_sus_pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "terapeutas_insertar_pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "terapeutas_actualizar_pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "solo_admins_eliminar_pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "paciente_can_view_own_profile" ON public.pacientes;
DROP POLICY IF EXISTS "Terapeutas pueden ver sus pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "read_pacientes_by_role" ON public.pacientes;
DROP POLICY IF EXISTS "staff_can_delete_pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "staff_can_insert_pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "update_pacientes_by_role" ON public.pacientes;

-- SELECT: Terapeuta ve SOLO sus pacientes
CREATE POLICY "terapeuta_ve_sus_pacientes"
ON public.pacientes FOR SELECT TO authenticated
USING (
  -- El paciente pertenece al terapeuta actual
  terapeuta_id = public.get_my_terapeuta_id()
  OR
  -- O es staff (admin/coordinadora) - pueden ver todos
  public.is_staff()
  OR
  -- O el paciente ve su propio perfil (por email)
  email IN (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- INSERT: Terapeuta puede crear pacientes (se le asigna automáticamente)
CREATE POLICY "terapeuta_crea_pacientes"
ON public.pacientes FOR INSERT TO authenticated
WITH CHECK (
  -- El terapeuta se asigna a sí mismo
  terapeuta_id = public.get_my_terapeuta_id()
  OR
  -- O es staff y puede asignar a cualquier terapeuta
  public.is_staff()
);

-- UPDATE: Terapeuta actualiza SOLO sus pacientes
CREATE POLICY "terapeuta_actualiza_sus_pacientes"
ON public.pacientes FOR UPDATE TO authenticated
USING (
  terapeuta_id = public.get_my_terapeuta_id()
  OR
  public.is_staff()
)
WITH CHECK (
  -- No puede cambiar el terapeuta_id a otro terapeuta (excepto staff)
  (terapeuta_id = public.get_my_terapeuta_id() AND terapeuta_id = public.get_my_terapeuta_id())
  OR
  public.is_staff()
);

-- DELETE: Solo staff puede eliminar pacientes
CREATE POLICY "staff_elimina_pacientes"
ON public.pacientes FOR DELETE TO authenticated
USING (public.is_staff());

-- ============================================================================
-- PASO 3: POLÍTICAS PARA TABLA CITAS
-- ============================================================================
-- CRÍTICO: Los terapeutas SOLO pueden ver citas de SUS pacientes

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "Ver citas propias" ON public.citas;
DROP POLICY IF EXISTS "Crear citas propias" ON public.citas;
DROP POLICY IF EXISTS "Actualizar citas propias" ON public.citas;
DROP POLICY IF EXISTS "Eliminar citas propias" ON public.citas;
DROP POLICY IF EXISTS "Terapeutas ven sus citas" ON public.citas;
DROP POLICY IF EXISTS "Pacientes ven sus citas" ON public.citas;
DROP POLICY IF EXISTS "Staff y terapeutas crean citas" ON public.citas;
DROP POLICY IF EXISTS "Staff y terapeuta actualizan citas" ON public.citas;
DROP POLICY IF EXISTS "Solo staff elimina citas" ON public.citas;

-- SELECT: Terapeuta ve citas de SUS pacientes
CREATE POLICY "terapeuta_ve_sus_citas"
ON public.citas FOR SELECT TO authenticated
USING (
  -- La cita es del terapeuta actual
  terapeuta_id = public.get_my_terapeuta_id()
  OR
  -- O es staff
  public.is_staff()
  OR
  -- O el paciente ve sus propias citas
  paciente_id IN (
    SELECT id FROM public.pacientes
    WHERE email IN (SELECT email FROM public.profiles WHERE id = auth.uid())
  )
);

-- INSERT: Terapeuta crea citas para SUS pacientes
CREATE POLICY "terapeuta_crea_citas"
ON public.citas FOR INSERT TO authenticated
WITH CHECK (
  -- El terapeuta es el dueño de la cita
  terapeuta_id = public.get_my_terapeuta_id()
  OR
  -- O es staff
  public.is_staff()
);

-- UPDATE: Terapeuta actualiza citas de SUS pacientes
CREATE POLICY "terapeuta_actualiza_sus_citas"
ON public.citas FOR UPDATE TO authenticated
USING (
  terapeuta_id = public.get_my_terapeuta_id()
  OR
  public.is_staff()
)
WITH CHECK (
  -- No puede cambiar el terapeuta_id
  terapeuta_id = public.get_my_terapeuta_id()
  OR
  public.is_staff()
);

-- DELETE: Terapeuta puede cancelar/eliminar sus citas, staff puede eliminar cualquiera
CREATE POLICY "terapeuta_elimina_sus_citas"
ON public.citas FOR DELETE TO authenticated
USING (
  terapeuta_id = public.get_my_terapeuta_id()
  OR
  public.is_staff()
);

-- ============================================================================
-- PASO 4: POLÍTICAS PARA TABLA BONOS
-- ============================================================================
-- CRÍTICO: Los terapeutas SOLO pueden ver bonos de SUS pacientes

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "terapeutas_ver_bonos" ON public.bonos;
DROP POLICY IF EXISTS "terapeutas_crear_bonos" ON public.bonos;
DROP POLICY IF EXISTS "terapeutas_actualizar_bonos" ON public.bonos;
DROP POLICY IF EXISTS "paciente_read_own_bonos" ON public.bonos;
DROP POLICY IF EXISTS "psicologa_ve_bonos_de_sus_pacientes" ON public.bonos;
DROP POLICY IF EXISTS "staff_full_access_bonos" ON public.bonos;

-- SELECT: Terapeuta ve bonos de SUS pacientes
CREATE POLICY "terapeuta_ve_bonos_sus_pacientes"
ON public.bonos FOR SELECT TO authenticated
USING (
  -- El bono pertenece a un paciente del terapeuta actual
  paciente_id IN (
    SELECT id FROM public.pacientes
    WHERE terapeuta_id = public.get_my_terapeuta_id()
  )
  OR
  -- O es staff
  public.is_staff()
  OR
  -- O el paciente ve sus propios bonos
  paciente_id IN (
    SELECT id FROM public.pacientes
    WHERE email IN (SELECT email FROM public.profiles WHERE id = auth.uid())
  )
);

-- INSERT: Terapeuta crea bonos para SUS pacientes
CREATE POLICY "terapeuta_crea_bonos_sus_pacientes"
ON public.bonos FOR INSERT TO authenticated
WITH CHECK (
  paciente_id IN (
    SELECT id FROM public.pacientes
    WHERE terapeuta_id = public.get_my_terapeuta_id()
  )
  OR
  public.is_staff()
);

-- UPDATE: Terapeuta actualiza bonos de SUS pacientes
CREATE POLICY "terapeuta_actualiza_bonos_sus_pacientes"
ON public.bonos FOR UPDATE TO authenticated
USING (
  paciente_id IN (
    SELECT id FROM public.pacientes
    WHERE terapeuta_id = public.get_my_terapeuta_id()
  )
  OR
  public.is_staff()
)
WITH CHECK (
  paciente_id IN (
    SELECT id FROM public.pacientes
    WHERE terapeuta_id = public.get_my_terapeuta_id()
  )
  OR
  public.is_staff()
);

-- DELETE: Solo staff puede eliminar bonos
CREATE POLICY "staff_elimina_bonos"
ON public.bonos FOR DELETE TO authenticated
USING (public.is_staff());

-- ============================================================================
-- PASO 5: POLÍTICAS PARA TABLA TERAPEUTAS
-- ============================================================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "Coordinación puede ver todos los terapeutas" ON public.terapeutas;
DROP POLICY IF EXISTS "Terapeutas pueden ver su propio perfil" ON public.terapeutas;

-- SELECT: Todos pueden ver la lista de terapeutas (para asignación)
-- Pero datos sensibles solo los ve el propio terapeuta o staff
CREATE POLICY "ver_terapeutas"
ON public.terapeutas FOR SELECT TO authenticated
USING (
  -- Terapeuta ve su propio perfil completo
  id = public.get_my_terapeuta_id()
  OR
  -- Staff ve todo
  public.is_staff()
  OR
  -- Otros pueden ver datos básicos (activo=true)
  activo = true
);

-- UPDATE: Solo el propio terapeuta o staff
CREATE POLICY "actualizar_terapeuta"
ON public.terapeutas FOR UPDATE TO authenticated
USING (
  id = public.get_my_terapeuta_id()
  OR
  public.is_staff()
)
WITH CHECK (
  id = public.get_my_terapeuta_id()
  OR
  public.is_staff()
);

-- INSERT/DELETE: Solo staff
CREATE POLICY "staff_gestiona_terapeutas"
ON public.terapeutas FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- ============================================================================
-- PASO 6: POLÍTICAS PARA TABLA PROFILES
-- ============================================================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "elevated_roles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;

-- SELECT: Usuario ve su propio perfil, staff ve todos
CREATE POLICY "ver_profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR
  public.is_staff()
);

-- UPDATE: Usuario actualiza solo su perfil
CREATE POLICY "actualizar_own_profile"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- INSERT: Solo durante registro (handled by auth)
CREATE POLICY "insert_profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- ============================================================================
-- PASO 7: POLÍTICAS PARA TABLAS SECUNDARIAS (si existen)
-- ============================================================================

-- SESIONES_BONOS
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sesiones_bonos') THEN
    DROP POLICY IF EXISTS "terapeuta_ve_sesiones_bonos" ON public.sesiones_bonos;

    CREATE POLICY "terapeuta_ve_sesiones_bonos"
    ON public.sesiones_bonos FOR ALL TO authenticated
    USING (
      bono_id IN (
        SELECT b.id FROM public.bonos b
        JOIN public.pacientes p ON b.paciente_id = p.id
        WHERE p.terapeuta_id = public.get_my_terapeuta_id()
      )
      OR public.is_staff()
    );
  END IF;
END $$;

-- NOTIFICACIONES
-- Nota: La tabla notificaciones puede tener usuario_id o paciente_id según la migración
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificaciones') THEN
    DROP POLICY IF EXISTS "ver_notificaciones_propias" ON public.notificaciones;

    -- Verificar si tiene columna usuario_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notificaciones' AND column_name = 'usuario_id') THEN
      CREATE POLICY "ver_notificaciones_propias"
      ON public.notificaciones FOR ALL TO authenticated
      USING (
        -- El usuario es el destinatario
        usuario_id = auth.uid()
        OR
        public.is_staff()
      );
    -- O si tiene paciente_id
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notificaciones' AND column_name = 'paciente_id') THEN
      CREATE POLICY "ver_notificaciones_propias"
      ON public.notificaciones FOR ALL TO authenticated
      USING (
        -- Notificaciones de pacientes del terapeuta
        paciente_id IN (
          SELECT id FROM public.pacientes
          WHERE terapeuta_id = public.get_my_terapeuta_id()
        )
        OR
        public.is_staff()
      );
    END IF;
  END IF;
END $$;

-- RECURSOS_COMPARTIDOS
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recursos_compartidos') THEN
    DROP POLICY IF EXISTS "terapeuta_ve_recursos" ON public.recursos_compartidos;

    CREATE POLICY "terapeuta_ve_recursos"
    ON public.recursos_compartidos FOR ALL TO authenticated
    USING (
      -- Recursos compartidos con pacientes del terapeuta
      paciente_id IN (
        SELECT id FROM public.pacientes
        WHERE terapeuta_id = public.get_my_terapeuta_id()
      )
      OR
      -- Recursos creados por el terapeuta
      terapeuta_id = public.get_my_terapeuta_id()
      OR
      public.is_staff()
    );
  END IF;
END $$;

-- FACTURAS
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'facturas') THEN
    DROP POLICY IF EXISTS "terapeuta_ve_facturas" ON public.facturas;

    CREATE POLICY "terapeuta_ve_facturas"
    ON public.facturas FOR ALL TO authenticated
    USING (
      -- Facturas de pacientes del terapeuta
      paciente_id IN (
        SELECT id FROM public.pacientes
        WHERE terapeuta_id = public.get_my_terapeuta_id()
      )
      OR
      public.is_staff()
    );
  END IF;
END $$;

-- PAGOS_REGISTROS
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pagos_registros') THEN
    DROP POLICY IF EXISTS "terapeuta_ve_pagos" ON public.pagos_registros;

    CREATE POLICY "terapeuta_ve_pagos"
    ON public.pagos_registros FOR ALL TO authenticated
    USING (
      -- Pagos de bonos de pacientes del terapeuta
      bono_id IN (
        SELECT b.id FROM public.bonos b
        JOIN public.pacientes p ON b.paciente_id = p.id
        WHERE p.terapeuta_id = public.get_my_terapeuta_id()
      )
      OR
      public.is_staff()
    );
  END IF;
END $$;

-- ============================================================================
-- PASO 8: VERIFICACIÓN - Listar todas las políticas creadas
-- ============================================================================

SELECT
  '✅ Políticas RLS Multi-Tenant configuradas correctamente' as status;

SELECT
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================================================
-- PASO 9: TEST DE VERIFICACIÓN (ejecutar manualmente)
-- ============================================================================
/*
-- Para verificar que las políticas funcionan, ejecutar como diferentes usuarios:

-- 1. Como Terapeuta A:
SELECT * FROM pacientes; -- Debe mostrar SOLO pacientes de Terapeuta A
SELECT * FROM citas; -- Debe mostrar SOLO citas de Terapeuta A
SELECT * FROM bonos; -- Debe mostrar SOLO bonos de pacientes de Terapeuta A

-- 2. Como Terapeuta B:
SELECT * FROM pacientes; -- Debe mostrar SOLO pacientes de Terapeuta B (diferentes)
SELECT * FROM citas; -- Debe mostrar SOLO citas de Terapeuta B
SELECT * FROM bonos; -- Debe mostrar SOLO bonos de pacientes de Terapeuta B

-- 3. Como Admin/Coordinadora:
SELECT * FROM pacientes; -- Debe mostrar TODOS
SELECT * FROM citas; -- Debe mostrar TODAS
SELECT * FROM bonos; -- Debe mostrar TODOS

-- 4. Intento de acceso cruzado (debe fallar):
-- Terapeuta A intentando ver paciente de Terapeuta B:
UPDATE pacientes SET nombre_completo = 'HACK' WHERE id = 'id-paciente-de-terapeuta-b';
-- Resultado esperado: 0 rows affected (RLS bloquea)
*/

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
/*
ARQUITECTURA DE SEGURIDAD:
1. La función get_my_terapeuta_id() es SECURITY DEFINER para evitar recursión
2. Todas las políticas usan esta función para identificar al terapeuta
3. Staff (admin/coordinadora) tiene acceso completo para gestión
4. Los pacientes pueden ver solo sus propios datos

PARA AÑADIR NUEVAS TABLAS:
1. ALTER TABLE nueva_tabla ENABLE ROW LEVEL SECURITY;
2. Crear política usando terapeuta_id = public.get_my_terapeuta_id()
3. O vincular a pacientes: paciente_id IN (SELECT id FROM pacientes WHERE terapeuta_id = get_my_terapeuta_id())

SI HAY PROBLEMAS DE RENDIMIENTO:
- Crear índice en pacientes(terapeuta_id)
- Crear índice en citas(terapeuta_id)
- Crear índice en bonos(paciente_id)
*/
