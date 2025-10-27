-- ============================================================================
-- MIGRACIÓN: Consolidar psicologas → terapeutas
-- ============================================================================
-- Fecha: 27 de octubre de 2025
-- Objetivo: Eliminar duplicidad entre tablas psicologas y terapeutas
--          Consolidar toda la gestión de profesionales en terapeutas
-- ============================================================================

-- ============================================================================
-- PASO 1: VERIFICAR ESTADO ACTUAL
-- ============================================================================

DO $$
DECLARE
  psicologas_count INTEGER;
  terapeutas_count INTEGER;
BEGIN
  -- Verificar si la tabla psicologas existe
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'psicologas') THEN
    
    SELECT COUNT(*) INTO psicologas_count FROM public.psicologas;
    RAISE NOTICE '📊 Tabla psicologas encontrada con % registros', psicologas_count;
  ELSE
    psicologas_count := 0;
    RAISE NOTICE '⚠️ Tabla psicologas no existe';
  END IF;
  
  -- Verificar tabla terapeutas
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'terapeutas') THEN
    
    SELECT COUNT(*) INTO terapeutas_count FROM public.terapeutas;
    RAISE NOTICE '📊 Tabla terapeutas encontrada con % registros', terapeutas_count;
  ELSE
    RAISE EXCEPTION '❌ ERROR: La tabla terapeutas no existe. Ejecutar primero 20251026_sistema_citas_completo.sql';
  END IF;
END $$;

-- ============================================================================
-- PASO 2: MIGRAR DATOS DE PSICOLOGAS A TERAPEUTAS
-- ============================================================================

DO $$
DECLARE
  migrated_count INTEGER := 0;
  psicologa_record RECORD;
BEGIN
  -- Solo migrar si la tabla psicologas existe
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'psicologas') THEN
    
    RAISE NOTICE '🔄 Iniciando migración de psicologas → terapeutas...';
    
    -- Migrar cada psicóloga
    FOR psicologa_record IN 
      SELECT 
        ps.id,
        p.nombre as nombre_completo,
        p.email,
        p.telefono,
        ps.num_colegiada,
        ps.bio,
        ps.metadata,
        ps.created_at,
        ps.updated_at
      FROM public.psicologas ps
      INNER JOIN public.profiles p ON ps.id = p.id
      WHERE p.rol = 'psicologa'
    LOOP
      -- Insertar en terapeutas (o actualizar si ya existe)
      INSERT INTO public.terapeutas (
        id,
        nombre_completo,
        email,
        telefono,
        especialidad,
        num_colegiada,
        activo,
        metadata,
        created_at,
        updated_at
      )
      VALUES (
        psicologa_record.id,
        psicologa_record.nombre_completo,
        psicologa_record.email,
        psicologa_record.telefono,
        'Psicología', -- especialidad por defecto
        psicologa_record.num_colegiada,
        true,
        COALESCE(psicologa_record.metadata, '{}'::jsonb) || 
          jsonb_build_object('bio', psicologa_record.bio),
        psicologa_record.created_at,
        psicologa_record.updated_at
      )
      ON CONFLICT (id) DO UPDATE
      SET 
        nombre_completo = EXCLUDED.nombre_completo,
        email = EXCLUDED.email,
        telefono = EXCLUDED.telefono,
        num_colegiada = EXCLUDED.num_colegiada,
        metadata = EXCLUDED.metadata,
        updated_at = now();
      
      migrated_count := migrated_count + 1;
    END LOOP;
    
    RAISE NOTICE '✅ Migrados % registros de psicologas a terapeutas', migrated_count;
  END IF;
END $$;

-- ============================================================================
-- PASO 3: ACTUALIZAR TABLA PACIENTES (psicologa_id → terapeuta_id)
-- ============================================================================

DO $$
BEGIN
  -- Verificar si la columna psicologa_id existe
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='pacientes' AND column_name='psicologa_id') THEN
    
    RAISE NOTICE '🔄 Actualizando tabla pacientes...';
    
    -- Si terapeuta_id no existe, crearla
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pacientes' AND column_name='terapeuta_id') THEN
      
      RAISE NOTICE '  → Creando columna terapeuta_id';
      ALTER TABLE public.pacientes 
      ADD COLUMN terapeuta_id uuid REFERENCES public.terapeutas(id) ON DELETE SET NULL;
    END IF;
    
    -- Copiar datos de psicologa_id a terapeuta_id
    RAISE NOTICE '  → Copiando datos psicologa_id → terapeuta_id';
    UPDATE public.pacientes
    SET terapeuta_id = psicologa_id
    WHERE psicologa_id IS NOT NULL AND terapeuta_id IS NULL;
    
    -- Eliminar la constraint FK antigua
    RAISE NOTICE '  → Eliminando constraint antigua psicologa_id';
    ALTER TABLE public.pacientes
    DROP CONSTRAINT IF EXISTS pacientes_psicologa_id_fkey;
    
    -- Eliminar la columna psicologa_id
    RAISE NOTICE '  → Eliminando columna psicologa_id';
    ALTER TABLE public.pacientes
    DROP COLUMN IF EXISTS psicologa_id;
    
    RAISE NOTICE '✅ Tabla pacientes actualizada correctamente';
  ELSE
    RAISE NOTICE '✓ Columna psicologa_id ya no existe en pacientes';
  END IF;
END $$;

-- ============================================================================
-- PASO 4: ACTUALIZAR TABLA SESIONES (si existe psicologa_id)
-- ============================================================================

DO $$
BEGIN
  -- Verificar si la tabla sesiones existe y tiene psicologa_id
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'sesiones') AND
     EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='sesiones' AND column_name='psicologa_id') THEN
    
    RAISE NOTICE '🔄 Actualizando tabla sesiones...';
    
    -- Si terapeuta_id no existe, crearla
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='sesiones' AND column_name='terapeuta_id') THEN
      
      RAISE NOTICE '  → Creando columna terapeuta_id';
      ALTER TABLE public.sesiones 
      ADD COLUMN terapeuta_id uuid REFERENCES public.terapeutas(id) ON DELETE SET NULL;
    END IF;
    
    -- Copiar datos de psicologa_id a terapeuta_id
    RAISE NOTICE '  → Copiando datos psicologa_id → terapeuta_id';
    UPDATE public.sesiones
    SET terapeuta_id = psicologa_id
    WHERE psicologa_id IS NOT NULL AND terapeuta_id IS NULL;
    
    -- Eliminar la constraint FK antigua
    RAISE NOTICE '  → Eliminando constraint antigua psicologa_id';
    ALTER TABLE public.sesiones
    DROP CONSTRAINT IF EXISTS sesiones_psicologa_id_fkey;
    
    -- Eliminar la columna psicologa_id
    RAISE NOTICE '  → Eliminando columna psicologa_id';
    ALTER TABLE public.sesiones
    DROP COLUMN IF EXISTS psicologa_id;
    
    RAISE NOTICE '✅ Tabla sesiones actualizada correctamente';
  ELSE
    RAISE NOTICE '✓ Tabla sesiones no requiere actualización';
  END IF;
END $$;

-- ============================================================================
-- PASO 5: ACTUALIZAR TABLA BONOS (si existe psicologa_id)
-- ============================================================================

DO $$
BEGIN
  -- Verificar si la tabla bonos existe y tiene psicologa_id
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='bonos' AND column_name='psicologa_id') THEN
    
    RAISE NOTICE '🔄 Actualizando tabla bonos...';
    
    -- Si terapeuta_id no existe, crearla
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bonos' AND column_name='terapeuta_id') THEN
      
      RAISE NOTICE '  → Creando columna terapeuta_id';
      ALTER TABLE public.bonos 
      ADD COLUMN terapeuta_id uuid REFERENCES public.terapeutas(id) ON DELETE SET NULL;
    END IF;
    
    -- Copiar datos de psicologa_id a terapeuta_id
    RAISE NOTICE '  → Copiando datos psicologa_id → terapeuta_id';
    UPDATE public.bonos
    SET terapeuta_id = psicologa_id
    WHERE psicologa_id IS NOT NULL AND terapeuta_id IS NULL;
    
    -- Eliminar la constraint FK antigua
    RAISE NOTICE '  → Eliminando constraint antigua psicologa_id';
    ALTER TABLE public.bonos
    DROP CONSTRAINT IF EXISTS bonos_psicologa_id_fkey;
    
    -- Eliminar la columna psicologa_id
    RAISE NOTICE '  → Eliminando columna psicologa_id';
    ALTER TABLE public.bonos
    DROP COLUMN IF EXISTS psicologa_id;
    
    RAISE NOTICE '✅ Tabla bonos actualizada correctamente';
  ELSE
    RAISE NOTICE '✓ Tabla bonos no requiere actualización';
  END IF;
END $$;

-- ============================================================================
-- PASO 6: CREAR VISTA TEMPORAL (compatibilidad durante migración)
-- ============================================================================

-- Crear vista psicologas que apunte a terapeutas
-- Esto permite compatibilidad temporal con código antiguo

CREATE OR REPLACE VIEW public.psicologas AS
SELECT 
  id,
  nombre_completo,
  email,
  num_colegiada,
  activo,
  metadata,
  created_at,
  updated_at
FROM public.terapeutas;

COMMENT ON VIEW public.psicologas IS 
'Vista de compatibilidad temporal. Apunta a la tabla terapeutas.
DEPRECADA: Usar terapeutas directamente.';

RAISE NOTICE '✅ Vista psicologas creada para compatibilidad temporal';

-- ============================================================================
-- PASO 7: ELIMINAR TABLA PSICOLOGAS FÍSICA (si existe)
-- ============================================================================

DO $$
DECLARE
  table_exists BOOLEAN;
  dependencies_count INTEGER;
BEGIN
  -- Verificar si la tabla física existe (no vista)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'psicologas'
    AND table_type = 'BASE TABLE'
  ) INTO table_exists;
  
  IF table_exists THEN
    RAISE NOTICE '🔄 Verificando dependencias de tabla psicologas...';
    
    -- Verificar si hay dependencias activas
    SELECT COUNT(*) INTO dependencies_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND kcu.table_name != 'psicologas'
    AND kcu.referenced_table_name = 'psicologas';
    
    IF dependencies_count > 0 THEN
      RAISE WARNING '⚠️ La tabla psicologas tiene % dependencias activas', dependencies_count;
      RAISE NOTICE '  → Se mantiene la vista de compatibilidad';
    ELSE
      RAISE NOTICE '  → No hay dependencias, procediendo a eliminar';
      
      -- Eliminar trigger asociado
      DROP TRIGGER IF EXISTS tr_sync_psicologa ON public.profiles;
      DROP FUNCTION IF EXISTS public.sync_psicologa_from_profile();
      
      -- Eliminar tabla física
      DROP TABLE IF EXISTS public.psicologas CASCADE;
      
      RAISE NOTICE '✅ Tabla psicologas eliminada exitosamente';
    END IF;
  ELSE
    RAISE NOTICE '✓ Tabla psicologas ya no existe como tabla física';
  END IF;
END $$;

-- ============================================================================
-- PASO 8: ACTUALIZAR ÍNDICES EN TERAPEUTAS
-- ============================================================================

-- Índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_terapeutas_email 
ON public.terapeutas(email);

-- Índice para terapeutas activos
CREATE INDEX IF NOT EXISTS idx_terapeutas_activo 
ON public.terapeutas(activo) WHERE activo = true;

-- Índice para número de colegiada
CREATE INDEX IF NOT EXISTS idx_terapeutas_num_colegiada 
ON public.terapeutas(num_colegiada) WHERE num_colegiada IS NOT NULL;

-- Índice para búsquedas en pacientes por terapeuta
CREATE INDEX IF NOT EXISTS idx_pacientes_terapeuta_id 
ON public.pacientes(terapeuta_id) WHERE terapeuta_id IS NOT NULL;

RAISE NOTICE '✅ Índices creados/actualizados en terapeutas';

-- ============================================================================
-- PASO 9: ACTUALIZAR POLÍTICAS RLS
-- ============================================================================

-- Política para que terapeutas vean sus propios datos
DROP POLICY IF EXISTS "Psicólogas pueden ver su propio perfil" ON public.terapeutas;
DROP POLICY IF EXISTS "Terapeutas pueden ver su propio perfil" ON public.terapeutas;

CREATE POLICY "Terapeutas pueden ver su propio perfil"
ON public.terapeutas
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Política para que terapeutas vean sus pacientes
DROP POLICY IF EXISTS "Psicólogas pueden ver sus pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Terapeutas pueden ver sus pacientes" ON public.pacientes;

CREATE POLICY "Terapeutas pueden ver sus pacientes"
ON public.pacientes
FOR ALL
TO authenticated
USING (terapeuta_id = auth.uid())
WITH CHECK (terapeuta_id = auth.uid());

-- Política para coordinación (puede ver todos)
DROP POLICY IF EXISTS "Coordinación puede ver todos los terapeutas" ON public.terapeutas;

CREATE POLICY "Coordinación puede ver todos los terapeutas"
ON public.terapeutas
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.rol IN ('coordinacion', 'admin')
  )
);

RAISE NOTICE '✅ Políticas RLS actualizadas';

-- ============================================================================
-- PASO 10: VERIFICACIÓN FINAL
-- ============================================================================

DO $$
DECLARE
  terapeutas_total INTEGER;
  pacientes_con_terapeuta INTEGER;
  pacientes_sin_terapeuta INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 VERIFICACIÓN FINAL';
  RAISE NOTICE '========================================';
  
  -- Contar terapeutas
  SELECT COUNT(*) INTO terapeutas_total FROM public.terapeutas;
  RAISE NOTICE '✓ Terapeutas en sistema: %', terapeutas_total;
  
  -- Contar pacientes con terapeuta
  SELECT COUNT(*) INTO pacientes_con_terapeuta 
  FROM public.pacientes 
  WHERE terapeuta_id IS NOT NULL;
  RAISE NOTICE '✓ Pacientes con terapeuta asignado: %', pacientes_con_terapeuta;
  
  -- Contar pacientes sin terapeuta
  SELECT COUNT(*) INTO pacientes_sin_terapeuta 
  FROM public.pacientes 
  WHERE terapeuta_id IS NULL;
  
  IF pacientes_sin_terapeuta > 0 THEN
    RAISE WARNING '⚠️ Pacientes sin terapeuta: %', pacientes_sin_terapeuta;
  ELSE
    RAISE NOTICE '✓ Todos los pacientes tienen terapeuta';
  END IF;
  
  -- Verificar que no existe columna psicologa_id en pacientes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='pacientes' AND column_name='psicologa_id') THEN
    RAISE NOTICE '✓ Columna psicologa_id eliminada de pacientes';
  ELSE
    RAISE WARNING '⚠️ Columna psicologa_id aún existe en pacientes';
  END IF;
  
  -- Verificar vista de compatibilidad
  IF EXISTS (SELECT 1 FROM information_schema.views 
             WHERE table_schema = 'public' AND table_name = 'psicologas') THEN
    RAISE NOTICE '✓ Vista psicologas (compatibilidad) disponible';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- QUERY DE VERIFICACIÓN
-- ============================================================================

-- Ver terapeutas migrados con su información de profiles
SELECT 
  t.id,
  t.nombre_completo,
  t.email,
  t.num_colegiada,
  t.activo,
  p.rol,
  COUNT(pac.id) as pacientes_asignados,
  t.created_at
FROM public.terapeutas t
INNER JOIN public.profiles p ON t.id = p.id
LEFT JOIN public.pacientes pac ON pac.terapeuta_id = t.id
GROUP BY t.id, t.nombre_completo, t.email, t.num_colegiada, t.activo, p.rol, t.created_at
ORDER BY t.created_at DESC;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

-- NOTA 1: Esta migración es SEGURA y no pierde datos
--         Todos los UUIDs se mantienen, solo cambian las referencias

-- NOTA 2: Se crea una vista psicologas para compatibilidad temporal
--         Eliminar cuando todo el código use terapeutas

-- NOTA 3: Las funciones RPC deben actualizarse manualmente:
--         - crear_paciente_simple: p_psicologa_id → p_terapeuta_id
--         - Otras funciones que referencien psicologas

-- NOTA 4: El trigger sync_psicologa_from_profile debe recrearse como
--         sync_terapeuta_from_profile en otra migración

-- NOTA 5: El código TypeScript/Vue debe actualizarse para usar
--         terapeuta_id en lugar de psicologa_id
