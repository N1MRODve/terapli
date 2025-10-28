-- ============================================================================
-- SCRIPT PARA ELIMINAR DATOS DE PRUEBA/DEMO
-- ============================================================================
-- Este script elimina todos los datos de demostración de la base de datos
-- para que puedas trabajar con datos reales
-- ============================================================================

-- IMPORTANTE: Este script eliminará TODOS los datos de prueba
-- Si tienes datos reales que quieres mantener, NO ejecutes este script

BEGIN;

-- 1. Eliminar citas de prueba (basadas en emails de test)
DELETE FROM public.citas 
WHERE paciente_id IN (
  SELECT p.id FROM public.pacientes p
  INNER JOIN profiles pr ON p.id = pr.id
  WHERE pr.email LIKE '%@test.com' OR pr.email LIKE '%demo%'
);

-- 2. Eliminar bonos de prueba
DELETE FROM public.bonos 
WHERE paciente_id IN (
  SELECT p.id FROM public.pacientes p
  INNER JOIN profiles pr ON p.id = pr.id
  WHERE pr.email LIKE '%@test.com' OR pr.email LIKE '%demo%'
);

-- 3. Eliminar registros emocionales de prueba
DELETE FROM public.registros_emocionales 
WHERE paciente_id IN (
  SELECT p.id FROM public.pacientes p
  INNER JOIN profiles pr ON p.id = pr.id
  WHERE pr.email LIKE '%@test.com' OR pr.email LIKE '%demo%'
);

-- 4. Eliminar notas terapéuticas de prueba
DELETE FROM public.notas_terapeuticas 
WHERE paciente_id IN (
  SELECT p.id FROM public.pacientes p
  INNER JOIN profiles pr ON p.id = pr.id
  WHERE pr.email LIKE '%@test.com' OR pr.email LIKE '%demo%'
);

-- 5. Eliminar sesiones de prueba (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sesiones') THEN
        DELETE FROM public.sesiones 
        WHERE paciente_id IN (
          SELECT p.id FROM public.pacientes p
          INNER JOIN profiles pr ON p.id = pr.id
          WHERE pr.email LIKE '%@test.com' OR pr.email LIKE '%demo%'
        );
    END IF;
END $$;

-- 6. Eliminar pacientes de prueba
DELETE FROM public.pacientes 
WHERE id IN (
  SELECT p.id FROM public.pacientes p
  INNER JOIN profiles pr ON p.id = pr.id
  WHERE pr.email LIKE '%@test.com' OR pr.email LIKE '%demo%'
);

-- 7. Eliminar profiles de prueba
DELETE FROM public.profiles 
WHERE email LIKE '%@test.com' OR email LIKE '%demo%';

-- 8. Eliminar usuarios de auth de prueba
DELETE FROM auth.users 
WHERE email LIKE '%@test.com' OR email LIKE '%demo%';

-- 9. Limpiar mensajes de prueba (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mensajes') THEN
        DELETE FROM public.mensajes 
        WHERE remitente_id IN (
          SELECT id FROM public.profiles 
          WHERE email LIKE '%@test.com' OR email LIKE '%demo%'
        )
        OR destinatario_id IN (
          SELECT id FROM public.profiles 
          WHERE email LIKE '%@test.com' OR email LIKE '%demo%'
        );
    END IF;
END $$;

-- Confirmar cambios
COMMIT;

-- Mostrar resumen
SELECT 
  'Datos de prueba eliminados correctamente' as mensaje,
  (SELECT COUNT(*) FROM public.pacientes) as pacientes_restantes,
  (SELECT COUNT(*) FROM public.citas) as citas_restantes,
  (SELECT COUNT(*) FROM public.bonos) as bonos_restantes;
