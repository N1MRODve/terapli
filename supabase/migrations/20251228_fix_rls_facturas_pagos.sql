-- =====================================================
-- MIGRACIÓN: Corrección de políticas RLS para facturas y pagos
-- Fecha: 2025-12-28
-- Descripción: Corrige las políticas RLS que fallaban por intentar
--              acceder a auth.users directamente en subconsultas.
-- =====================================================

-- Primero, eliminamos las políticas existentes que tienen el problema
DROP POLICY IF EXISTS "staff_full_access_facturas" ON facturas;
DROP POLICY IF EXISTS "terapeuta_ver_propias_facturas" ON facturas;
DROP POLICY IF EXISTS "staff_full_access_pagos_registros" ON pagos_registros;
DROP POLICY IF EXISTS "terapeuta_ver_propios_pagos" ON pagos_registros;

-- =====================================================
-- POLÍTICAS PARA FACTURAS
-- =====================================================

-- Staff puede hacer todo con facturas
CREATE POLICY "staff_full_access_facturas"
  ON facturas FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Terapeuta puede ver sus propias facturas
-- Usamos una comparación directa con el email del usuario actual
CREATE POLICY "terapeuta_ver_propias_facturas"
  ON facturas FOR SELECT
  TO authenticated
  USING (
    -- El terapeuta_id coincide con el auth.uid()
    terapeuta_id = auth.uid()
    OR
    -- O el terapeuta tiene el mismo email que el usuario actual
    EXISTS (
      SELECT 1 FROM terapeutas t
      WHERE t.id = facturas.terapeuta_id
      AND t.email = auth.jwt() ->> 'email'
    )
  );

-- Terapeuta puede insertar facturas propias
CREATE POLICY "terapeuta_insert_facturas"
  ON facturas FOR INSERT
  TO authenticated
  WITH CHECK (
    terapeuta_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM terapeutas t
      WHERE t.id = terapeuta_id
      AND t.email = auth.jwt() ->> 'email'
    )
  );

-- Terapeuta puede actualizar sus propias facturas
CREATE POLICY "terapeuta_update_facturas"
  ON facturas FOR UPDATE
  TO authenticated
  USING (
    terapeuta_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM terapeutas t
      WHERE t.id = facturas.terapeuta_id
      AND t.email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    terapeuta_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM terapeutas t
      WHERE t.id = terapeuta_id
      AND t.email = auth.jwt() ->> 'email'
    )
  );

-- =====================================================
-- POLÍTICAS PARA PAGOS_REGISTROS
-- =====================================================

-- Staff puede hacer todo con pagos
CREATE POLICY "staff_full_access_pagos_registros"
  ON pagos_registros FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Terapeuta puede ver sus propios pagos
CREATE POLICY "terapeuta_ver_propios_pagos"
  ON pagos_registros FOR SELECT
  TO authenticated
  USING (
    terapeuta_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM terapeutas t
      WHERE t.id = pagos_registros.terapeuta_id
      AND t.email = auth.jwt() ->> 'email'
    )
  );

-- Terapeuta puede insertar pagos propios
CREATE POLICY "terapeuta_insert_pagos"
  ON pagos_registros FOR INSERT
  TO authenticated
  WITH CHECK (
    terapeuta_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM terapeutas t
      WHERE t.id = terapeuta_id
      AND t.email = auth.jwt() ->> 'email'
    )
  );

-- Terapeuta puede actualizar sus propios pagos
CREATE POLICY "terapeuta_update_pagos"
  ON pagos_registros FOR UPDATE
  TO authenticated
  USING (
    terapeuta_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM terapeutas t
      WHERE t.id = pagos_registros.terapeuta_id
      AND t.email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    terapeuta_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM terapeutas t
      WHERE t.id = terapeuta_id
      AND t.email = auth.jwt() ->> 'email'
    )
  );

-- Terapeuta puede eliminar sus propios pagos
CREATE POLICY "terapeuta_delete_pagos"
  ON pagos_registros FOR DELETE
  TO authenticated
  USING (
    terapeuta_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM terapeutas t
      WHERE t.id = pagos_registros.terapeuta_id
      AND t.email = auth.jwt() ->> 'email'
    )
  );
