-- ============================================
-- VERIFICACIÓN Y TESTING DEL SISTEMA DE COORDINACIÓN
-- Psicóloga Karem - Panel de Belmaris
-- ============================================

-- ============================================
-- 1. VERIFICAR INSTALACIÓN CORRECTA
-- ============================================

-- Verificar que el rol de coordinación existe en profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'rol';

-- Verificar constraint de rol
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%rol%';

-- Verificar que tabla recordatorios existe
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_name = 'recordatorios'
) as tabla_recordatorios_existe;

-- Verificar funciones creadas
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'obtener_sesiones_hoy_coordinacion',
    'obtener_pagos_pendientes_coordinacion',
    'programar_recordatorios_sesion',
    'confirmar_pago_coordinacion'
  );

-- ============================================
-- 2. VERIFICAR USUARIO DE COORDINACIÓN
-- ============================================

-- Ver usuarios con rol de coordinación
SELECT 
  id,
  email,
  nombre,
  rol,
  created_at
FROM profiles
WHERE rol = 'coordinacion';

-- Si no existe, crearlo (después de crear en Supabase Auth)
-- UPDATE profiles SET rol = 'coordinacion', nombre = 'Belmaris' 
-- WHERE email = 'belmaris@psicologakarem.com';

-- ============================================
-- 3. VERIFICAR POLÍTICAS RLS
-- ============================================

-- Ver todas las políticas para coordinación
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE policyname LIKE '%coordinacion%'
ORDER BY tablename, policyname;

-- Verificar RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('sesiones', 'pagos', 'mensajes', 'notificaciones', 'recordatorios')
  AND schemaname = 'public';

-- ============================================
-- 4. CREAR DATOS DE PRUEBA
-- ============================================

-- Insertar sesión de prueba (ajustar IDs según tu base de datos)
DO $$
DECLARE
  test_terapeuta_id uuid;
  test_paciente_id uuid;
  test_sesion_id uuid;
BEGIN
  -- Obtener IDs de prueba
  SELECT id INTO test_terapeuta_id FROM profiles WHERE rol = 'terapeuta' LIMIT 1;
  SELECT id INTO test_paciente_id FROM profiles WHERE rol = 'paciente' LIMIT 1;
  
  IF test_terapeuta_id IS NOT NULL AND test_paciente_id IS NOT NULL THEN
    -- Crear sesión de prueba para hoy + 25 horas (para probar recordatorio 24h)
    INSERT INTO sesiones (
      terapeuta_id,
      paciente_id,
      fecha,
      modalidad,
      estado,
      notas
    ) VALUES (
      test_terapeuta_id,
      test_paciente_id,
      now() + interval '25 hours',
      'presencial',
      'confirmada',
      'Sesión de prueba para sistema de coordinación'
    )
    RETURNING id INTO test_sesion_id;
    
    RAISE NOTICE 'Sesión de prueba creada: %', test_sesion_id;
    
    -- Crear pago de prueba
    INSERT INTO pagos (
      sesion_id,
      paciente_id,
      terapeuta_id,
      monto,
      estado,
      metodo_pago,
      notas
    ) VALUES (
      test_sesion_id,
      test_paciente_id,
      test_terapeuta_id,
      50.00,
      'pendiente',
      'transferencia',
      'Pago de prueba para sistema de coordinación'
    );
    
    RAISE NOTICE 'Pago de prueba creado para sesión %', test_sesion_id;
  ELSE
    RAISE NOTICE 'No se encontraron terapeuta o paciente para crear datos de prueba';
  END IF;
END $$;

-- ============================================
-- 5. PROBAR FUNCIONES
-- ============================================

-- Probar función de sesiones de hoy
SELECT * FROM obtener_sesiones_hoy_coordinacion();

-- Probar función de pagos pendientes
SELECT * FROM obtener_pagos_pendientes_coordinacion();

-- Ver recordatorios programados
SELECT 
  r.id,
  r.tipo,
  r.fecha_envio,
  r.enviado,
  s.fecha as sesion_fecha,
  p.nombre as paciente_nombre
FROM recordatorios r
JOIN sesiones s ON s.id = r.sesion_id
JOIN profiles p ON p.id = r.paciente_id
ORDER BY r.fecha_envio DESC
LIMIT 10;

-- ============================================
-- 6. VERIFICAR TRIGGERS
-- ============================================

-- Ver triggers activos
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trg_programar_recordatorios';

-- ============================================
-- 7. TESTING DE PERMISOS
-- ============================================

-- Simular query como usuario de coordinación
-- (ejecutar desde la app después del login)
/*
const { data, error } = await supabase
  .from('sesiones')
  .select('*')
  .limit(5)

console.log('Sesiones visibles:', data?.length)
*/

-- ============================================
-- 8. MÉTRICAS Y ESTADÍSTICAS
-- ============================================

-- Dashboard: Sesiones de hoy
SELECT 
  COUNT(*) as total_sesiones_hoy,
  COUNT(*) FILTER (WHERE estado = 'confirmada') as confirmadas,
  COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes
FROM sesiones
WHERE DATE(fecha) = CURRENT_DATE;

-- Dashboard: Pagos pendientes
SELECT 
  COUNT(*) as total_pagos_pendientes,
  SUM(monto) as monto_total_pendiente
FROM pagos
WHERE estado IN ('pendiente', 'confirmado_paciente');

-- Dashboard: Recordatorios programados hoy
SELECT 
  COUNT(*) as recordatorios_hoy,
  COUNT(*) FILTER (WHERE enviado = true) as enviados,
  COUNT(*) FILTER (WHERE enviado = false) as pendientes
FROM recordatorios
WHERE DATE(fecha_envio) = CURRENT_DATE;

-- ============================================
-- 9. LIMPIEZA DE DATOS DE PRUEBA
-- ============================================

-- CUIDADO: Solo ejecutar si quieres eliminar datos de prueba
/*
DELETE FROM recordatorios WHERE sesion_id IN (
  SELECT id FROM sesiones WHERE notas LIKE '%prueba para sistema de coordinación%'
);

DELETE FROM pagos WHERE sesion_id IN (
  SELECT id FROM sesiones WHERE notas LIKE '%prueba para sistema de coordinación%'
);

DELETE FROM sesiones WHERE notas LIKE '%prueba para sistema de coordinación%';
*/

-- ============================================
-- 10. MONITOREO Y LOGS
-- ============================================

-- Ver últimas notificaciones creadas
SELECT 
  n.titulo,
  n.mensaje,
  n.tipo,
  n.visto,
  p.nombre as usuario_nombre,
  n.created_at
FROM notificaciones n
JOIN profiles p ON p.id = n.usuario_id
ORDER BY n.created_at DESC
LIMIT 10;

-- Ver actividad de pagos reciente
SELECT 
  pg.estado,
  pg.monto,
  pg.updated_at,
  p_paciente.nombre as paciente_nombre,
  p_confirmado.nombre as confirmado_por_nombre
FROM pagos pg
LEFT JOIN profiles p_paciente ON p_paciente.id = pg.paciente_id
LEFT JOIN profiles p_confirmado ON p_confirmado.id = pg.confirmado_por
WHERE pg.updated_at > now() - interval '24 hours'
ORDER BY pg.updated_at DESC;

-- Ver sesiones creadas o modificadas recientemente
SELECT 
  s.fecha,
  s.estado,
  s.modalidad,
  p_terapeuta.nombre as terapeuta_nombre,
  p_paciente.nombre as paciente_nombre,
  s.created_at,
  s.updated_at
FROM sesiones s
JOIN profiles p_terapeuta ON p_terapeuta.id = s.terapeuta_id
JOIN profiles p_paciente ON p_paciente.id = s.paciente_id
WHERE s.updated_at > now() - interval '24 hours'
ORDER BY s.updated_at DESC;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================

SELECT 
  '✅ Verificación completada' as status,
  (SELECT COUNT(*) FROM profiles WHERE rol = 'coordinacion') as usuarios_coordinacion,
  (SELECT COUNT(*) FROM recordatorios) as recordatorios_totales,
  (SELECT COUNT(*) FROM recordatorios WHERE enviado = false) as recordatorios_pendientes,
  (SELECT COUNT(*) FROM sesiones WHERE DATE(fecha) = CURRENT_DATE) as sesiones_hoy,
  (SELECT COUNT(*) FROM pagos WHERE estado = 'pendiente') as pagos_pendientes;

-- ============================================
-- NOTAS FINALES
-- ============================================

-- Para verificar que todo funciona:
-- 1. Ejecutar todos los queries de verificación (secciones 1-3)
-- 2. Crear datos de prueba (sección 4)
-- 3. Probar funciones (sección 5)
-- 4. Hacer login en /coordinacion/login
-- 5. Verificar que el dashboard muestra datos correctos
-- 6. Probar confirmación de un pago
-- 7. Enviar un mensaje de prueba
-- 8. Verificar que los recordatorios se programan automáticamente

-- Si todo funciona correctamente, verás:
-- ✅ Usuario de coordinación existe
-- ✅ Políticas RLS activas
-- ✅ Funciones y triggers funcionando
-- ✅ Dashboard con datos en tiempo real
-- ✅ Recordatorios programándose automáticamente
