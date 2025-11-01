# ⚡ Guía Rápida: Activar Sistema de Cancelación con Reintegro

## 🎯 Objetivo
Activar la funcionalidad de cancelación de citas con opción de devolver sesiones al bono del paciente.

---

## 📋 Paso a Paso (5 minutos)

### 1️⃣ Ejecutar Migración SQL en Supabase

1. Ir a [Supabase Dashboard](https://app.supabase.com)
2. Seleccionar proyecto: **psicokarem**
3. Menú lateral → **SQL Editor**
4. Click en **New query**
5. Copiar y pegar el contenido de:
   ```
   /supabase/migrations/20251101_reintegrar_sesion_bono.sql
   ```
6. Click en **Run** o presionar `Ctrl+Enter` / `Cmd+Enter`

**✅ Resultado esperado:**
```
✅ ========================================================================
   FUNCIÓN fn_reintegrar_sesion_bono CREADA EXITOSAMENTE
   ========================================================================
```

---

### 2️⃣ Verificar la Función RPC

Ejecutar en SQL Editor:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'fn_reintegrar_sesion_bono';
```

**✅ Debe retornar:** 1 fila con `fn_reintegrar_sesion_bono`

---

### 3️⃣ Probar la Función (Opcional)

Crear una cita de prueba y ejecutar:
```sql
SELECT fn_reintegrar_sesion_bono(
  '<cita_id>'::uuid,
  '<bono_id>'::uuid,
  true  -- reintegrar = true
);
```

**✅ Debe retornar JSON:**
```json
{
  "success": true,
  "message": "Cita cancelada y sesión reintegrada al bono",
  "sesiones_restantes": 7,
  "sesiones_totales": 8,
  "horas_anticipacion": 72,
  "reintegrada": true
}
```

---

### 4️⃣ Verificar Frontend

1. Reiniciar servidor de desarrollo (si está corriendo):
   ```bash
   # Detener con Ctrl+C
   npm run dev
   ```

2. Ir a: `http://localhost:3000/coordinadora/agenda`

3. **Buscar citas** en cualquier vista (día/semana/mes)

4. **Hacer hover** sobre una tarjeta de cita → Debe aparecer botón ✕ rojo

5. **Click en ✕** → Debe abrirse modal de cancelación

---

## 🧪 Prueba Completa

### Escenario 1: Cancelación con reintegro ✅

1. **Crear cita** para mañana o pasado
2. **Verificar bono** del paciente (sesiones actuales)
3. **Click en ✕** en la tarjeta de cita
4. **Verificar modal muestra:**
   - ✓ "Cancelación con anticipación"
   - Opciones: "Devolver sesión" y "Descontar sesión"
   - Horas de anticipación > 24
5. **Elegir:** "Sí, devolver sesión"
6. **Click:** "Cancelar Cita"
7. **✅ Verificar:**
   - Notificación: "Cita cancelada y sesión reintegrada al bono"
   - Cita desaparece de activas
   - Bono tiene +1 sesión

### Escenario 2: Cancelación sin reintegro (política) ⚠️

1. **Crear cita** para hoy en 6 horas
2. **Click en ✕** en la tarjeta
3. **Verificar modal muestra:**
   - ⚠️ "Cancelación sin anticipación suficiente"
   - Mensaje: "menos de 24 horas (6h)"
   - Solo opción: "No, descontar sesión"
4. **Click:** "Cancelar Cita"
5. **✅ Verificar:**
   - Notificación: "Cita cancelada exitosamente"
   - Sesiones del bono sin cambios

---

## 🔧 Troubleshooting

### Problema: Botón ✕ no aparece
**Solución:** Hacer hover sobre la tarjeta de cita (efecto `group-hover`)

### Problema: Modal no se abre
**Solución:** Verificar consola del navegador (F12) para errores

### Problema: Error "fn_reintegrar_sesion_bono does not exist"
**Solución:** Ejecutar migración SQL en paso 1️⃣

### Problema: Horas de anticipación negativas
**Solución:** La cita ya pasó. El sistema permite cancelar pero NO reintegra

---

## 📊 Verificar en Base de Datos

### Ver últimas cancelaciones:
```sql
SELECT 
  c.id,
  c.fecha_cita,
  c.hora_inicio,
  c.estado,
  c.observaciones,
  c.updated_at
FROM citas c
WHERE c.estado = 'cancelada'
ORDER BY c.updated_at DESC
LIMIT 10;
```

### Ver bonos con cambios recientes:
```sql
SELECT 
  b.id,
  b.sesiones_restantes,
  b.estado,
  b.updated_at,
  p.nombre as paciente
FROM bonos b
JOIN pacientes pac ON b.paciente_id = pac.id
JOIN profiles p ON pac.id = p.id
WHERE b.updated_at > NOW() - INTERVAL '1 hour'
ORDER BY b.updated_at DESC;
```

---

## ✅ Checklist Final

Antes de marcar como completo:

- [ ] Migración SQL ejecutada sin errores
- [ ] Función RPC existe en Supabase
- [ ] Botones ✕ visibles en hover en agenda
- [ ] Modal se abre correctamente
- [ ] Cálculo de horas funciona
- [ ] Política de 24 horas se respeta
- [ ] Opciones de radio funcionan
- [ ] Cancelación con reintegro funciona (+1 sesión)
- [ ] Cancelación sin reintegro funciona (sesiones sin cambio)
- [ ] Notificaciones aparecen correctamente
- [ ] Lista de citas se actualiza después de cancelar

---

## 📞 Contacto

Si encuentras problemas:
1. Revisar consola del navegador (F12)
2. Revisar logs de Supabase
3. Verificar que migración se ejecutó correctamente
4. Consultar documentación completa: `CANCELACION_CITAS_REINTEGRO_BONO.md`

---

**Última actualización:** 1 de noviembre de 2025  
**Tiempo estimado de setup:** 5 minutos  
**Dificultad:** ⭐⭐☆☆☆ (Fácil)
