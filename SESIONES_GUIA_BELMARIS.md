# 👩‍💼 Guía para Administración (Belmaris) - Módulo de Sesiones

## 🎯 Tu Rol en el Sistema

Como **administradora**, tu función es **confirmar los pagos** de las sesiones para que los terapeutas vean sus ingresos actualizados.

---

## 📋 Tarea Principal: Confirmar Pagos

### Cuándo confirmar un pago
✅ El paciente ha realizado el pago (Bizum, transferencia, tarjeta)  
✅ Has verificado que el pago se recibió correctamente  
✅ El monto coincide con el precio de la sesión  

### Cómo confirmar un pago

#### Opción 1: Desde Supabase Dashboard (Recomendado)

1. **Acceder a Supabase**
   - Ir a: https://supabase.com
   - Iniciar sesión con credenciales de admin

2. **Abrir SQL Editor**
   - En el menú lateral: `SQL Editor`
   - Click en `New Query`

3. **Buscar la sesión**
   ```sql
   -- Ver sesiones pendientes de confirmar
   SELECT 
     s.id,
     s.fecha::date as fecha,
     p.nombre || ' ' || p.apellido as paciente,
     ps.nombre || ' ' || ps.apellido as terapeuta,
     s.precio_total,
     s.estado
   FROM sesiones s
   JOIN pacientes p ON s.paciente_id = p.id
   JOIN profiles ps ON s.terapeuta_id = ps.id
   WHERE s.pago_confirmado = false
   AND s.estado = 'pendiente'
   ORDER BY s.fecha DESC;
   ```

4. **Copiar el ID de la sesión** que quieres confirmar

5. **Confirmar el pago**
   ```sql
   -- Reemplazar 'ID-DE-LA-SESION' con el ID copiado
   UPDATE sesiones 
   SET 
     pago_confirmado = true,
     estado = 'confirmada'
   WHERE id = 'ID-DE-LA-SESION';
   ```

6. **Ejecutar la query** (botón `Run` o `Ctrl+Enter`)

7. **Verificar que funcionó**
   ```sql
   -- Ver el registro de pago creado automáticamente
   SELECT * FROM pagos_terapeutas 
   WHERE sesion_id = 'ID-DE-LA-SESION';
   ```

#### Opción 2: Confirmar múltiples pagos a la vez

```sql
-- Ver todas las sesiones pendientes de un día específico
SELECT 
  s.id,
  p.nombre || ' ' || LEFT(p.apellido, 1) || '.' as paciente,
  s.precio_total,
  s.fecha::date
FROM sesiones s
JOIN pacientes p ON s.paciente_id = p.id
WHERE s.fecha::date = '2025-10-19'  -- Cambiar fecha
AND s.pago_confirmado = false;

-- Confirmar todas las sesiones de un día
UPDATE sesiones 
SET 
  pago_confirmado = true,
  estado = 'confirmada'
WHERE fecha::date = '2025-10-19'  -- Cambiar fecha
AND pago_confirmado = false;
```

---

## 💰 Entender la Distribución de Pagos

### Ejemplo con sesión de 50€

```
Precio de la sesión: 50€

Cuando confirmas el pago:
├─ 35€ (70%) → Va para el terapeuta
└─ 15€ (30%) → Queda para la consulta

El sistema calcula esto AUTOMÁTICAMENTE
```

### Qué pasa cuando confirmas un pago

1. **Actualizas** `pago_confirmado = true`
2. **El sistema automáticamente**:
   - Calcula 70% para terapeuta
   - Calcula 30% para consulta
   - Crea un registro en `pagos_terapeutas`
   - Actualiza el saldo visible del terapeuta

3. **El terapeuta ve**:
   - Su sesión en "Confirmadas"
   - El monto de 35€ en su saldo
   - El total acumulado actualizado

---

## 📊 Reportes Útiles

### Ver resumen de pagos pendientes

```sql
-- Total pendiente por confirmar
SELECT 
  COUNT(*) as sesiones_pendientes,
  SUM(precio_total) as total_pendiente,
  SUM(precio_total * 0.70) as total_terapeutas,
  SUM(precio_total * 0.30) as total_consulta
FROM sesiones
WHERE pago_confirmado = false
AND estado = 'pendiente';
```

### Ver sesiones confirmadas del mes

```sql
-- Sesiones confirmadas en octubre 2025
SELECT 
  ps.nombre || ' ' || ps.apellido as terapeuta,
  COUNT(*) as sesiones,
  SUM(s.precio_total) as total,
  SUM(s.precio_total * 0.70) as para_terapeuta
FROM sesiones s
JOIN profiles ps ON s.terapeuta_id = ps.id
WHERE s.pago_confirmado = true
AND EXTRACT(MONTH FROM s.fecha) = 10
AND EXTRACT(YEAR FROM s.fecha) = 2025
GROUP BY ps.nombre, ps.apellido
ORDER BY sesiones DESC;
```

### Ver pagos a procesar (para hacer transferencias)

```sql
-- Pagos confirmados pero aún no pagados
SELECT 
  ps.nombre || ' ' || ps.apellido as terapeuta,
  ps.email,
  COUNT(*) as sesiones,
  SUM(pt.monto_terapeuta) as total_a_pagar
FROM pagos_terapeutas pt
JOIN profiles ps ON pt.terapeuta_id = ps.id
WHERE pt.estado_pago = 'confirmado'
AND pt.fecha_pago IS NULL
GROUP BY ps.id, ps.nombre, ps.apellido, ps.email
ORDER BY total_a_pagar DESC;
```

---

## 💸 Proceso de Pago Mensual (1-5 de cada mes)

### Paso 1: Ver total a pagar por terapeuta

```sql
SELECT 
  ps.nombre || ' ' || ps.apellido as terapeuta,
  COUNT(*) as num_sesiones,
  SUM(pt.monto_terapeuta) as total_a_pagar,
  STRING_AGG(s.fecha::date::text, ', ') as fechas_sesiones
FROM pagos_terapeutas pt
JOIN profiles ps ON pt.terapeuta_id = ps.id
JOIN sesiones s ON pt.sesion_id = s.id
WHERE pt.estado_pago = 'confirmado'
AND pt.fecha_pago IS NULL
GROUP BY ps.id, ps.nombre, ps.apellido
ORDER BY ps.apellido;
```

### Paso 2: Hacer las transferencias bancarias
- Usar los datos del query anterior
- Hacer transferencia a cada terapeuta
- Anotar referencia de la transferencia

### Paso 3: Marcar como pagado

```sql
-- Marcar pagos de un terapeuta como pagados
-- Reemplazar 'UUID-DEL-TERAPEUTA'
UPDATE pagos_terapeutas
SET 
  estado_pago = 'pagado',
  fecha_pago = now(),
  notas = 'Transferencia octubre 2025 - Ref: TRF123456'
WHERE terapeuta_id = 'UUID-DEL-TERAPEUTA'
AND estado_pago = 'confirmado'
AND fecha_pago IS NULL;
```

---

## 🚨 Casos Especiales

### Anular una sesión (paciente canceló)

```sql
-- Cambiar estado a anulada
UPDATE sesiones 
SET estado = 'anulada'
WHERE id = 'ID-DE-LA-SESION';

-- Si ya estaba confirmada, también borrar el pago
DELETE FROM pagos_terapeutas
WHERE sesion_id = 'ID-DE-LA-SESION';
```

### Corregir un monto (se cobró precio diferente)

```sql
-- Actualizar precio de la sesión
UPDATE sesiones 
SET precio_total = 60.00  -- Nuevo precio
WHERE id = 'ID-DE-LA-SESION';

-- El sistema recalculará automáticamente 70/30
-- si vuelves a marcar como confirmada
```

### Revertir una confirmación (error)

```sql
-- Deshacer confirmación
UPDATE sesiones 
SET 
  pago_confirmado = false,
  estado = 'pendiente'
WHERE id = 'ID-DE-LA-SESION';

-- Borrar el registro de pago
DELETE FROM pagos_terapeutas
WHERE sesion_id = 'ID-DE-LA-SESION';
```

---

## 📱 Accesos Rápidos

### Dashboard de Supabase
🔗 https://supabase.com/dashboard

### Queries que debes guardar

1. **Ver pendientes**: Ver sesiones sin confirmar
2. **Confirmar pago**: Marcar sesión como pagada
3. **Resumen mensual**: Ver total por terapeuta
4. **Marcar como pagado**: Después de transferencia

---

## ✅ Checklist Diario

### Cada día que hay sesiones:

- [ ] Revisar notificaciones de pagos recibidos
- [ ] Abrir Supabase Dashboard
- [ ] Ejecutar query de "sesiones pendientes"
- [ ] Para cada pago verificado:
  - [ ] Copiar ID de la sesión
  - [ ] Ejecutar query de confirmación
  - [ ] Verificar que se creó el registro en pagos_terapeutas
- [ ] Comunicar al terapeuta (opcional)

---

## 📅 Checklist Mensual (1-5 de cada mes)

### Procesar pagos del mes anterior:

- [ ] Ejecutar query de "pagos a procesar"
- [ ] Revisar montos totales por terapeuta
- [ ] Hacer transferencias bancarias
- [ ] Anotar referencias de transferencia
- [ ] Marcar pagos como "pagado" en el sistema
- [ ] Notificar a terapeutas
- [ ] Archivar comprobantes

---

## 🆘 Solución de Problemas

### "No aparece el registro en pagos_terapeutas"

**Posibles causas**:
- El trigger no está activo
- El precio_total es 0 o NULL
- La sesión ya estaba confirmada

**Solución**:
```sql
-- Verificar que el trigger existe
SELECT * FROM pg_trigger 
WHERE tgname = 'trigger_registrar_pago_terapeuta';

-- Si no existe, reaplicar la migración SQL
```

### "El monto calculado es incorrecto"

**Verificar**:
```sql
-- Ver el cálculo
SELECT 
  precio_total,
  precio_total * 0.70 as debe_ser_terapeuta,
  precio_total * 0.30 as debe_ser_consulta
FROM sesiones 
WHERE id = 'ID-DE-LA-SESION';
```

### "No puedo confirmar pagos"

**Verificar permisos**:
```sql
-- Tu usuario debe tener rol de admin o coordinadora
SELECT rol FROM profiles WHERE id = auth.uid();
```

---

## 💬 Comunicación con Terapeutas

### Cuando confirmas un pago:

**Mensaje opcional** (por WhatsApp/Email):
```
✅ Hola [Nombre]!

He confirmado el pago de tu sesión con [Paciente] del [Fecha].

Tu parte (70%): 35€
Ya está visible en tu panel 💰

¡Gracias por tu trabajo!
```

### Cuando procesas pagos mensuales:

```
💸 Pago Mensual - [Mes Año]

Hola [Nombre]!

Ya procesé tu pago mensual:
• Sesiones: X
• Total: XXX€
• Ref: TRFXXXXXX

Debería llegarte en 1-2 días hábiles.

Cualquier duda, me avisas 😊
```

---

## 📞 Contacto y Ayuda

**Problemas técnicos**  
👨‍💻 Equipo de desarrollo

**Dudas sobre procedimientos**  
💼 Karem (coordinación general)

**Errores en pagos**  
🔧 Revisar con el equipo técnico

---

## 📚 Recursos Adicionales

- **Documentación completa**: `SESIONES_MODULO_DOCUMENTACION.md`
- **Guía técnica**: `SESIONES_GUIA_RAPIDA.md`
- **Datos de prueba**: `SESIONES_DATOS_PRUEBA.md`

---

<div align="center">

## 🤝 Tu rol es fundamental

**Gracias por mantener la transparencia y confianza del sistema**

*Cualquier duda, consulta con el equipo técnico*

</div>
