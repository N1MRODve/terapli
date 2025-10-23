-- ============================================================================
-- SCRIPT DE DATOS DE PRUEBA - MÓDULO DE PACIENTES
-- ============================================================================
-- Este script crea datos de prueba para el módulo de gestión de pacientes
-- Incluye: pacientes, sesiones, emociones, bonos y notas terapéuticas
-- ============================================================================

-- NOTA IMPORTANTE:
-- Debes reemplazar 'UUID_DE_LA_PSICOLOGA' con el UUID real de tu terapeuta
-- Lo puedes obtener desde: SELECT id FROM profiles WHERE rol = 'psicologa';

-- ============================================================================
-- 1. CREAR PERFILES DE PACIENTES DE PRUEBA
-- ============================================================================

-- Paciente 1: María González Pérez
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'maria.gonzalez@test.com',
  crypt('test123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, nombre_completo, email, rol, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'María González Pérez',
  'maria.gonzalez@test.com',
  'paciente',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO pacientes (id, psicologa_id, area_de_acompanamiento, frecuencia, activo, metadata, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'UUID_DE_LA_PSICOLOGA', -- REEMPLAZAR AQUÍ
  'Ansiedad y autoestima',
  'semanal',
  true,
  '{"edad": 32, "en_pausa": false}'::jsonb,
  NOW() - INTERVAL '3 months',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Paciente 2: Carlos Mendoza Silva
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e',
  'carlos.mendoza@test.com',
  crypt('test123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, nombre_completo, email, rol, created_at, updated_at)
VALUES (
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e',
  'Carlos Mendoza Silva',
  'carlos.mendoza@test.com',
  'paciente',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO pacientes (id, psicologa_id, area_de_acompanamiento, frecuencia, activo, metadata, created_at, updated_at)
VALUES (
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e',
  'UUID_DE_LA_PSICOLOGA', -- REEMPLAZAR AQUÍ
  'Gestión emocional',
  'quincenal',
  true,
  '{"edad": 28, "en_pausa": false}'::jsonb,
  NOW() - INTERVAL '2 months',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Paciente 3: Ana Rodríguez López
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'c3d4e5f6-a7b8-4c5d-8e9f-0a1b2c3d4e5f',
  'ana.rodriguez@test.com',
  crypt('test123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, nombre_completo, email, rol, created_at, updated_at)
VALUES (
  'c3d4e5f6-a7b8-4c5d-8e9f-0a1b2c3d4e5f',
  'Ana Rodríguez López',
  'ana.rodriguez@test.com',
  'paciente',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO pacientes (id, psicologa_id, area_de_acompanamiento, frecuencia, activo, metadata, created_at, updated_at)
VALUES (
  'c3d4e5f6-a7b8-4c5d-8e9f-0a1b2c3d4e5f',
  'UUID_DE_LA_PSICOLOGA', -- REEMPLAZAR AQUÍ
  'Desarrollo personal',
  'semanal',
  true,
  '{"edad": 35, "en_pausa": false}'::jsonb,
  NOW() - INTERVAL '1 month',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Paciente 4: Laura Martínez (en pausa)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'd4e5f6a7-b8c9-4d5e-8f9a-0b1c2d3e4f5a',
  'laura.martinez@test.com',
  crypt('test123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, nombre_completo, email, rol, created_at, updated_at)
VALUES (
  'd4e5f6a7-b8c9-4d5e-8f9a-0b1c2d3e4f5a',
  'Laura Martínez García',
  'laura.martinez@test.com',
  'paciente',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO pacientes (id, psicologa_id, area_de_acompanamiento, frecuencia, activo, metadata, created_at, updated_at)
VALUES (
  'd4e5f6a7-b8c9-4d5e-8f9a-0b1c2d3e4f5a',
  'UUID_DE_LA_PSICOLOGA', -- REEMPLAZAR AQUÍ
  'Estrés laboral',
  'mensual',
  true,
  '{"edad": 40, "en_pausa": true}'::jsonb,
  NOW() - INTERVAL '6 months',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. CREAR BONOS DE SESIONES
-- ============================================================================

-- Bono para María (activo, 8 sesiones restantes)
INSERT INTO bonos (id, paciente_id, total_sesiones, sesiones_restantes, precio_total, estado, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  10,
  8,
  500.00,
  'activo',
  NOW() - INTERVAL '3 months',
  NOW()
);

-- Bono para Carlos (activo, 3 sesiones restantes)
INSERT INTO bonos (id, paciente_id, total_sesiones, sesiones_restantes, precio_total, estado, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e',
  5,
  3,
  250.00,
  'activo',
  NOW() - INTERVAL '2 months',
  NOW()
);

-- Bono para Ana (activo, 7 sesiones restantes)
INSERT INTO bonos (id, paciente_id, total_sesiones, sesiones_restantes, precio_total, estado, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'c3d4e5f6-a7b8-4c5d-8e9f-0a1b2c3d4e5f',
  10,
  7,
  500.00,
  'activo',
  NOW() - INTERVAL '1 month',
  NOW()
);

-- ============================================================================
-- 3. CREAR SESIONES PASADAS Y FUTURAS
-- ============================================================================

-- Sesiones para María (12 sesiones realizadas)
INSERT INTO sesiones (id, paciente_id, psicologa_id, fecha, duracion_min, modalidad, estado, nota_terapeuta, created_at)
SELECT 
  gen_random_uuid(),
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'UUID_DE_LA_PSICOLOGA', -- REEMPLAZAR AQUÍ
  NOW() - (interval '1 week' * serie),
  50,
  CASE WHEN random() > 0.5 THEN 'online' ELSE 'presencial' END,
  'realizada',
  'Sesión ' || serie || '. Progreso continuo.',
  NOW() - (interval '1 week' * serie)
FROM generate_series(1, 12) AS serie;

-- Próxima sesión para María
INSERT INTO sesiones (id, paciente_id, psicologa_id, fecha, duracion_min, modalidad, estado, created_at)
VALUES (
  gen_random_uuid(),
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'UUID_DE_LA_PSICOLOGA', -- REEMPLAZAR AQUÍ
  NOW() + INTERVAL '3 days' + INTERVAL '14 hours',
  50,
  'online',
  'confirmada',
  NOW()
);

-- Sesiones para Carlos (8 sesiones realizadas)
INSERT INTO sesiones (id, paciente_id, psicologa_id, fecha, duracion_min, modalidad, estado, nota_terapeuta, created_at)
SELECT 
  gen_random_uuid(),
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e',
  'UUID_DE_LA_PSICOLOGA', -- REEMPLAZAR AQUÍ
  NOW() - (interval '2 weeks' * serie),
  50,
  'presencial',
  'realizada',
  'Sesión quincenal ' || serie || '.',
  NOW() - (interval '2 weeks' * serie)
FROM generate_series(1, 8) AS serie;

-- Sesiones para Ana (4 sesiones realizadas)
INSERT INTO sesiones (id, paciente_id, psicologa_id, fecha, duracion_min, modalidad, estado, nota_terapeuta, created_at)
SELECT 
  gen_random_uuid(),
  'c3d4e5f6-a7b8-4c5d-8e9f-0a1b2c3d4e5f',
  'UUID_DE_LA_PSICOLOGA', -- REEMPLAZAR AQUÍ
  NOW() - (interval '1 week' * serie),
  50,
  'online',
  'realizada',
  'Sesión ' || serie || '. Buena evolución.',
  NOW() - (interval '1 week' * serie)
FROM generate_series(1, 4) AS serie;

-- Próxima sesión para Ana
INSERT INTO sesiones (id, paciente_id, psicologa_id, fecha, duracion_min, modalidad, estado, created_at)
VALUES (
  gen_random_uuid(),
  'c3d4e5f6-a7b8-4c5d-8e9f-0a1b2c3d4e5f',
  'UUID_DE_LA_PSICOLOGA', -- REEMPLAZAR AQUÍ
  NOW() + INTERVAL '2 days' + INTERVAL '16 hours',
  50,
  'online',
  'confirmada',
  NOW()
);

-- ============================================================================
-- 4. CREAR REGISTROS EMOCIONALES (últimos 30 días)
-- ============================================================================

-- Emociones para María (tendencia positiva)
INSERT INTO emociones_avanzadas (id, paciente_id, fecha, nivel_animo, nivel_energia, nivel_estres, created_at)
SELECT 
  gen_random_uuid(),
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  (NOW() - (interval '1 day' * serie))::date,
  3 + (random() * 2)::int, -- Entre 3 y 5
  3 + (random() * 2)::int,
  1 + (random() * 2)::int, -- Estrés bajo
  NOW() - (interval '1 day' * serie)
FROM generate_series(0, 29) AS serie;

-- Emociones para Carlos (tendencia baja - requiere atención)
INSERT INTO emociones_avanzadas (id, paciente_id, fecha, nivel_animo, nivel_energia, nivel_estres, created_at)
SELECT 
  gen_random_uuid(),
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e',
  (NOW() - (interval '1 day' * serie))::date,
  CASE 
    WHEN serie <= 3 THEN 1 + (random())::int -- Últimos 3 días bajos
    ELSE 2 + (random() * 2)::int
  END,
  2 + (random() * 2)::int,
  3 + (random() * 2)::int, -- Estrés alto
  NOW() - (interval '1 day' * serie)
FROM generate_series(0, 29) AS serie;

-- Emociones para Ana (tendencia estable y positiva)
INSERT INTO emociones_avanzadas (id, paciente_id, fecha, nivel_animo, nivel_energia, nivel_estres, created_at)
SELECT 
  gen_random_uuid(),
  'c3d4e5f6-a7b8-4c5d-8e9f-0a1b2c3d4e5f',
  (NOW() - (interval '1 day' * serie))::date,
  4 + (random())::int, -- Entre 4 y 5 (muy bien)
  4 + (random())::int,
  1 + (random())::int, -- Estrés muy bajo
  NOW() - (interval '1 day' * serie)
FROM generate_series(0, 29) AS serie;

-- ============================================================================
-- 5. CREAR NOTAS TERAPÉUTICAS
-- ============================================================================

-- Nota para María
INSERT INTO notas_terapeuticas (id, paciente_id, psicologa_id, contenido, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'UUID_DE_LA_PSICOLOGA', -- REEMPLAZAR AQUÍ
  'Progreso continuo en el manejo de la ansiedad.

• Ha logrado identificar sus disparadores emocionales
• Practica técnicas de respiración regularmente
• Mejora notable en autoestima
• Continuar trabajando en asertividad

Próximos objetivos:
- Enfrentar situaciones sociales con mayor confianza
- Reducir autocrítica
- Fortalecer red de apoyo',
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '1 week'
);

-- Nota para Carlos
INSERT INTO notas_terapeuticas (id, paciente_id, psicologa_id, contenido, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e',
  'UUID_DE_LA_PSICOLOGA', -- REEMPLAZAR AQUÍ
  'Últimas sesiones muestran incremento en estrés laboral.

Observaciones:
• Dificultad para establecer límites en el trabajo
• Patrones de pensamiento rumiativos
• Alteraciones en el sueño
• Requiere seguimiento cercano

Estrategias aplicadas:
- Técnicas de mindfulness
- Reestructuración cognitiva
- Plan de autocuidado

IMPORTANTE: Considerar evaluar necesidad de apoyo farmacológico si no hay mejora en 2 semanas.',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- Nota para Ana
INSERT INTO notas_terapeuticas (id, paciente_id, psicologa_id, contenido, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'c3d4e5f6-a7b8-4c5d-8e9f-0a1b2c3d4e5f',
  'UUID_DE_LA_PSICOLOGA', -- REEMPLAZAR AQUÍ
  'Excelente evolución en proceso de desarrollo personal.

Logros alcanzados:
✓ Mayor claridad en objetivos vitales
✓ Mejora en comunicación asertiva
✓ Establecimiento de rutinas saludables
✓ Conexión emocional más profunda

Se muestra motivada y comprometida con el proceso.
Considera comenzar fase de cierre gradual en próximos 2-3 meses.',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- Para verificar los datos creados:
-- SELECT COUNT(*) FROM pacientes WHERE psicologa_id = 'UUID_DE_LA_PSICOLOGA';
-- SELECT COUNT(*) FROM sesiones WHERE psicologa_id = 'UUID_DE_LA_PSICOLOGA';
-- SELECT COUNT(*) FROM emociones_avanzadas WHERE paciente_id IN (SELECT id FROM pacientes WHERE psicologa_id = 'UUID_DE_LA_PSICOLOGA');
