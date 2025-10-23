# 🧪 Datos de Prueba - Módulo de Sesiones

Este archivo contiene datos de ejemplo para probar el módulo de sesiones.

## 📋 Script SQL de Datos de Prueba

```sql
-- #############################################################################
-- # DATOS DE PRUEBA PARA MÓDULO DE SESIONES
-- #############################################################################
-- IMPORTANTE: Ajustar los UUIDs según tu base de datos

-- Variables (reemplazar con valores reales)
DO $$
DECLARE
  v_terapeuta_id uuid := 'REEMPLAZAR-CON-UUID-TERAPEUTA';
  v_paciente1_id uuid := 'REEMPLAZAR-CON-UUID-PACIENTE-1';
  v_paciente2_id uuid := 'REEMPLAZAR-CON-UUID-PACIENTE-2';
  v_paciente3_id uuid := 'REEMPLAZAR-CON-UUID-PACIENTE-3';
BEGIN

  -- Sesión 1: Pendiente (futuro)
  INSERT INTO public.sesiones (
    paciente_id,
    terapeuta_id,
    fecha,
    modalidad,
    estado,
    precio_total,
    pago_confirmado,
    observaciones
  ) VALUES (
    v_paciente1_id,
    v_terapeuta_id,
    now() + interval '2 days',
    'online',
    'pendiente',
    50.00,
    false,
    'Primera sesión de evaluación'
  );

  -- Sesión 2: Confirmada (ayer)
  INSERT INTO public.sesiones (
    paciente_id,
    terapeuta_id,
    fecha,
    modalidad,
    estado,
    precio_total,
    pago_confirmado,
    observaciones
  ) VALUES (
    v_paciente1_id,
    v_terapeuta_id,
    now() - interval '1 day',
    'online',
    'confirmada',
    50.00,
    true,
    'Sesión de seguimiento'
  );

  -- Sesión 3: Confirmada (hace una semana)
  INSERT INTO public.sesiones (
    paciente_id,
    terapeuta_id,
    fecha,
    modalidad,
    estado,
    precio_total,
    pago_confirmado,
    observaciones
  ) VALUES (
    v_paciente2_id,
    v_terapeuta_id,
    now() - interval '7 days',
    'presencial',
    'confirmada',
    60.00,
    true,
    'Sesión presencial en consulta'
  );

  -- Sesión 4: Anulada
  INSERT INTO public.sesiones (
    paciente_id,
    terapeuta_id,
    fecha,
    modalidad,
    estado,
    precio_total,
    pago_confirmado,
    observaciones
  ) VALUES (
    v_paciente3_id,
    v_terapeuta_id,
    now() - interval '3 days',
    'online',
    'anulada',
    50.00,
    false,
    'Paciente canceló con antelación'
  );

  -- Sesión 5: Pendiente (próxima semana)
  INSERT INTO public.sesiones (
    paciente_id,
    terapeuta_id,
    fecha,
    modalidad,
    estado,
    precio_total,
    pago_confirmado,
    observaciones
  ) VALUES (
    v_paciente2_id,
    v_terapeuta_id,
    now() + interval '7 days',
    'online',
    'pendiente',
    50.00,
    false,
    'Sesión de seguimiento programada'
  );

  -- Sesión 6: Completada (hace 2 semanas)
  INSERT INTO public.sesiones (
    paciente_id,
    terapeuta_id,
    fecha,
    modalidad,
    estado,
    precio_total,
    pago_confirmado,
    observaciones
  ) VALUES (
    v_paciente1_id,
    v_terapeuta_id,
    now() - interval '14 days',
    'online',
    'completada',
    50.00,
    true,
    'Sesión completada exitosamente'
  );

END $$;
```

## 📊 Resultado Esperado

Con estos datos de prueba, deberías ver en el panel:

### Resumen Financiero
```
🕓 Pendientes: 2 sesiones → 70,00 €
💚 Confirmadas: 2 sesiones → 77,00 €
❌ Anuladas: 1 sesión → 0,00 €
💎 Saldo Total: 77,00 € (70% de ingresos confirmados)
```

### Cálculo Detallado
```
Sesión 1 (Pendiente):   50€ × 0.70 = 35,00€
Sesión 2 (Confirmada):  50€ × 0.70 = 35,00€
Sesión 3 (Confirmada):  60€ × 0.70 = 42,00€
Sesión 4 (Anulada):     No suma
Sesión 5 (Pendiente):   50€ × 0.70 = 35,00€
Sesión 6 (Completada):  50€ × 0.70 = 35,00€

Pendientes:   35 + 35 = 70,00€
Confirmadas:  35 + 42 = 77,00€
Total:        77,00€
```

## 🔍 Queries de Verificación

### Ver todas las sesiones insertadas
```sql
SELECT 
  s.fecha::date,
  p.nombre || ' ' || LEFT(p.apellido, 1) || '.' as paciente,
  s.estado,
  s.modalidad,
  s.precio_total,
  s.pago_confirmado,
  s.precio_total * 0.70 as monto_terapeuta
FROM sesiones s
JOIN pacientes p ON s.paciente_id = p.id
WHERE s.terapeuta_id = 'TU-UUID-AQUI'
ORDER BY s.fecha DESC;
```

### Verificar pagos generados automáticamente
```sql
SELECT 
  pt.id,
  s.fecha::date,
  pt.monto_terapeuta,
  pt.monto_consulta,
  pt.estado_pago
FROM pagos_terapeutas pt
JOIN sesiones s ON pt.sesion_id = s.id
WHERE pt.terapeuta_id = 'TU-UUID-AQUI'
ORDER BY s.fecha DESC;
```

### Resumen financiero
```sql
SELECT * FROM obtener_resumen_financiero_terapeuta('TU-UUID-AQUI');
```

## 🎯 Casos de Prueba

### Caso 1: Confirmar una sesión pendiente
```sql
-- Buscar una sesión pendiente
SELECT id, precio_total FROM sesiones 
WHERE estado = 'pendiente' 
LIMIT 1;

-- Marcar como confirmada
UPDATE sesiones 
SET pago_confirmado = true, estado = 'confirmada'
WHERE id = 'UUID-DE-LA-SESION';

-- Verificar que se creó el registro en pagos_terapeutas
SELECT * FROM pagos_terapeutas WHERE sesion_id = 'UUID-DE-LA-SESION';
```

**Resultado esperado:**
- Saldo total aumenta
- Aparece en card "Confirmadas"
- Se crea automáticamente registro en `pagos_terapeutas`

### Caso 2: Anular una sesión
```sql
UPDATE sesiones 
SET estado = 'anulada'
WHERE id = 'UUID-DE-LA-SESION';
```

**Resultado esperado:**
- Aparece en card "Anuladas"
- No suma al saldo
- Monto mostrado es 0€

### Caso 3: Filtrar por mes
En la interfaz:
1. Seleccionar mes actual en el filtro
2. Solo aparecen sesiones de este mes

### Caso 4: Filtrar por estado
En la interfaz:
1. Seleccionar "Confirmadas"
2. Solo aparecen sesiones confirmadas/completadas

## 📱 Testing en la Interfaz

### Desktop (> 768px)
- [ ] Cards se muestran en fila (4 columnas)
- [ ] Tabla se ve completa con todas las columnas
- [ ] Filtros funcionan correctamente
- [ ] Emojis se muestran correctamente
- [ ] Montos formateados con símbolo €
- [ ] Animaciones suaves al cargar

### Mobile (< 768px)
- [ ] Cards se apilan verticalmente
- [ ] Tabla se convierte en lista de cards
- [ ] Filtros son accesibles
- [ ] Scroll vertical funciona bien
- [ ] Textos legibles sin zoom

### Funcionalidades
- [ ] Loading spinner aparece mientras carga
- [ ] Error handling si falla la carga
- [ ] Botón "Reintentar" funciona
- [ ] Empty state si no hay sesiones
- [ ] Link a dashboard funciona
- [ ] Breadcrumb navegable

## 🐛 Debugging

### Si no aparecen sesiones:

1. **Verificar autenticación**
```sql
SELECT auth.uid(); -- Debe retornar tu UUID
```

2. **Verificar que existen sesiones**
```sql
SELECT COUNT(*) FROM sesiones WHERE terapeuta_id = auth.uid();
```

3. **Verificar políticas RLS**
```sql
SELECT * FROM pg_policies WHERE tablename = 'sesiones';
```

4. **Ver errores en consola del navegador**
- Abrir DevTools (F12)
- Ir a Console
- Buscar errores en rojo

### Si los cálculos son incorrectos:

1. **Verificar tipo de datos**
```sql
SELECT 
  precio_total, 
  pg_typeof(precio_total),
  precio_total * 0.70 as calculo
FROM sesiones LIMIT 1;
```

2. **Verificar trigger**
```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'trigger_registrar_pago_terapeuta';
```

### Si los filtros no funcionan:

1. **Verificar ref() en componente**
2. **Verificar computed() para sesiones filtradas**
3. **Revisar consola por errores de TypeScript**

## 🔄 Limpiar Datos de Prueba

```sql
-- CUIDADO: Esto borra TODAS las sesiones del terapeuta
DELETE FROM sesiones WHERE terapeuta_id = 'TU-UUID-AQUI';

-- Los registros en pagos_terapeutas se borran automáticamente
-- gracias a ON DELETE CASCADE
```

## 📈 Datos Adicionales para Testing Avanzado

### Generar 50 sesiones aleatorias
```sql
DO $$
DECLARE
  v_terapeuta_id uuid := 'TU-UUID-AQUI';
  v_paciente_id uuid := 'UUID-PACIENTE';
  i integer;
BEGIN
  FOR i IN 1..50 LOOP
    INSERT INTO sesiones (
      paciente_id,
      terapeuta_id,
      fecha,
      modalidad,
      estado,
      precio_total,
      pago_confirmado
    ) VALUES (
      v_paciente_id,
      v_terapeuta_id,
      now() + (random() * 60 - 30) * interval '1 day',
      CASE WHEN random() > 0.5 THEN 'online' ELSE 'presencial' END,
      CASE 
        WHEN random() < 0.4 THEN 'pendiente'
        WHEN random() < 0.8 THEN 'confirmada'
        ELSE 'anulada'
      END,
      (45 + random() * 20)::numeric(10,2),
      random() > 0.3
    );
  END LOOP;
END $$;
```

---

**¡Listo para testing completo! 🎉**
