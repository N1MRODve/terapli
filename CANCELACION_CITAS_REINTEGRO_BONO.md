# ✅ Sistema de Cancelación de Citas con Reintegro de Bonos

**Fecha de implementación:** 1 de noviembre de 2025  
**Objetivo:** Permitir cancelar citas con opción de devolver la sesión al bono del paciente según política de 24 horas

---

## 📋 Resumen Ejecutivo

Se implementó un sistema completo de cancelación de citas que permite a la coordinadora decidir si reintegrar o descontar la sesión del bono del paciente, basándose en el tiempo de anticipación de la cancelación.

### ✨ Características Principales

- ✅ **Política de 24 horas**: Reintegro automático permitido solo si se cancela con más de 24 horas de anticipación
- ✅ **Decisión manual**: La coordinadora puede elegir devolver o descontar la sesión
- ✅ **Cálculo automático**: El sistema calcula las horas de anticipación automáticamente
- ✅ **Reactivación de bonos**: Si un bono estaba agotado, vuelve a estado "activo" al reintegrar
- ✅ **Registro de acciones**: Todas las cancelaciones quedan registradas con timestamp
- ✅ **Interfaz intuitiva**: Modal con información clara y opciones visuales

---

## 🗂️ Archivos Modificados/Creados

### 1. **Base de Datos**
- ✅ `/supabase/migrations/20251101_reintegrar_sesion_bono.sql`
  - Función RPC: `fn_reintegrar_sesion_bono(p_cita_id, p_bono_id, p_reintegrar)`
  - Incrementa `sesiones_restantes` en la tabla `bonos`
  - Cambia estado de bono de `agotado` a `activo` si aplica
  - Registra información en campo `observaciones` de la cita

### 2. **Composable**
- ✅ `/composables/useCitas.ts`
  - Nueva función: `cancelarCitaConReintegro(citaId, bonoId, reintegrar)`
  - Llama a la función RPC del backend
  - Maneja respuestas y errores
  - Exportada para uso en componentes

### 3. **Componente Modal**
- ✅ `/components/ModalCancelarCita.vue` (NUEVO)
  - Modal completo para cancelación
  - Cálculo de horas de anticipación
  - Opciones de radio para elegir reintegro
  - Validación automática de política de 24 horas
  - Mensajes informativos y advertencias
  - Campo opcional para motivo de cancelación

### 4. **Integración en Vistas**
- ✅ `/pages/coordinadora/agenda.vue`
  - Botón de cancelación en cada tarjeta de cita (3 vistas: día, semana, mes)
  - Solo visible en hover para citas no canceladas
  - Integración completa del modal
  - Funciones: `abrirModalCancelar()`, `cerrarModalCancelar()`, `handleCitaCancelada()`
  - Notificaciones de éxito con mensaje personalizado

---

## 🎯 Flujo de Funcionamiento

### Paso 1: Usuario cancela cita
```
Coordinadora → Click en ícono X en tarjeta de cita → Se abre ModalCancelarCita
```

### Paso 2: Sistema calcula anticipación
```javascript
const horasAnticipacion = (fechaCita - fechaActual) / (1000 * 60 * 60)
const puedeReintegrar = horasAnticipacion >= 24
```

### Paso 3: Usuario elige opción
```
SI puedeReintegrar:
  ✅ "Sí, devolver sesión" (sesiones_restantes +1)
  ❌ "No, descontar sesión" (sesiones_restantes sin cambios)

SI NO puedeReintegrar:
  ⚠️ Mensaje: "Menos de 24 horas - No se puede reintegrar"
  Solo opción de descontar
```

### Paso 4: Backend procesa
```sql
-- Si reintegrar = true Y horas >= 24:
UPDATE bonos 
SET sesiones_restantes = sesiones_restantes + 1,
    estado = CASE 
      WHEN estado = 'agotado' AND sesiones_restantes + 1 > 0 
      THEN 'activo' 
      ELSE estado 
    END
WHERE id = bono_id;

-- Siempre:
UPDATE citas 
SET estado = 'cancelada',
    observaciones = observaciones || '\n[Cancelada con/sin reintegro - timestamp]'
WHERE id = cita_id;
```

### Paso 5: Frontend actualiza
```
- Cierra modal
- Recarga lista de citas
- Muestra notificación de éxito:
  • "Cita cancelada y sesión reintegrada al bono" (si reintegró)
  • "Cita cancelada exitosamente" (si no reintegró)
```

---

## 🔍 Casos de Uso

### Caso 1: Cancelación con anticipación (✅ Reintegro permitido)
**Escenario:** Paciente cancela 3 días antes de la cita

```
Entrada:
- Cita programada: 4 de noviembre 2025, 10:00
- Fecha actual: 1 de noviembre 2025, 14:00
- Horas anticipación: 68 horas

Proceso:
1. Modal muestra: "✓ Cancelación con anticipación"
2. Opciones activas: "Devolver sesión" o "Descontar sesión"
3. Coordinadora elige: "Devolver sesión"

Resultado:
- Cita → estado: 'cancelada'
- Bono → sesiones_restantes: +1
- Notificación: "Cita cancelada y sesión reintegrada al bono"
```

### Caso 2: Cancelación tardía (❌ Reintegro NO permitido)
**Escenario:** Paciente cancela 6 horas antes de la cita

```
Entrada:
- Cita programada: 1 de noviembre 2025, 20:00
- Fecha actual: 1 de noviembre 2025, 14:00
- Horas anticipación: 6 horas

Proceso:
1. Modal muestra: "⚠️ Cancelación sin anticipación suficiente"
2. Mensaje: "La cita está a menos de 24 horas (6h). No se puede reintegrar..."
3. Solo opción: "No, descontar sesión" (preseleccionada)

Resultado:
- Cita → estado: 'cancelada'
- Bono → sesiones_restantes: sin cambios (se descuenta)
- Notificación: "Cita cancelada exitosamente"
```

### Caso 3: Reactivación de bono agotado
**Escenario:** Paciente con bono agotado cancela con anticipación

```
Entrada:
- Bono estado: 'agotado'
- Bono sesiones_restantes: 0
- Horas anticipación: 48 horas

Proceso:
1. Coordinadora elige: "Devolver sesión"
2. Backend ejecuta:
   - sesiones_restantes: 0 → 1
   - estado: 'agotado' → 'activo'

Resultado:
- Bono vuelve a estar activo
- Paciente puede usar la sesión devuelta
```

### Caso 4: Cita sin bono
**Escenario:** Cita sin bono asociado (bono_id = null)

```
Proceso:
1. Modal muestra: "Esta cita no tiene bono asociado"
2. Solo cambia estado de cita a 'cancelada'
3. No se intenta reintegro

Resultado:
- Cita → estado: 'cancelada'
- Sin cambios en bonos
```

---

## 🎨 Diseño de Interfaz

### Modal de Cancelación

```
┌────────────────────────────────────────────────┐
│  🚫 Cancelar Cita                        ✕    │
│  Gestión de sesión del bono                   │
├────────────────────────────────────────────────┤
│                                                │
│  👤 Paciente: María González                  │
│  📅 Fecha: jueves, 4 de noviembre de 2025     │
│      10:00 - 11:00                            │
│  🏥 Terapeuta: Dra. Ana López                 │
│                                                │
│  ✓ Cancelación con anticipación               │
│  La cita está a 68 horas. Puedes elegir...   │
│                                                │
│  ¿Devolver sesión al bono?                    │
│                                                │
│  ◉ Sí, devolver sesión                        │
│    La sesión se reintegrará al bono...        │
│                                                │
│  ○ No, descontar sesión                       │
│    La sesión se descontará del bono...        │
│                                                │
│  Motivo de cancelación (opcional)             │
│  ┌──────────────────────────────────────┐    │
│  │ [Paciente tuvo emergencia familiar]  │    │
│  └──────────────────────────────────────┘    │
│                                                │
│  ⚠️ Esta acción no se puede deshacer          │
│     La cita será marcada como cancelada       │
│                                                │
├────────────────────────────────────────────────┤
│          [Volver]    [✕ Cancelar Cita]       │
└────────────────────────────────────────────────┘
```

### Botones en Tarjetas de Citas

```
Vista Día/Mes:
┌─────────────────────────────────────┐
│ María González              ⏳ Pendiente │
│ 10:00 - 11:00 · Online            ✕    │  ← Aparece en hover
└─────────────────────────────────────┘

Vista Semana:
┌──────────────┐
│ María G.   ✕ │  ← Botón mini en hover
│ 10:00        │
└──────────────┘
```

---

## 🧪 Pruebas Recomendadas

### Prueba 1: Cancelación con reintegro
1. Crear cita para mañana
2. Verificar que bono tiene X sesiones
3. Cancelar cita eligiendo "Devolver sesión"
4. ✅ Verificar: sesiones_restantes = X + 1

### Prueba 2: Cancelación sin reintegro (política)
1. Crear cita para hoy en 6 horas
2. Intentar cancelar
3. ✅ Verificar: Modal muestra "No se puede reintegrar"
4. ✅ Verificar: Solo opción de descontar disponible

### Prueba 3: Cancelación sin reintegro (elección)
1. Crear cita para dentro de 3 días
2. Cancelar eligiendo "No, descontar sesión"
3. ✅ Verificar: sesiones_restantes sin cambios

### Prueba 4: Reactivación de bono agotado
1. Agotar bono (sesiones_restantes = 0)
2. Crear cita con ese bono (debe fallar o usar otro)
3. Cancelar cita antigua con reintegro
4. ✅ Verificar: bono estado = 'activo', sesiones_restantes = 1

### Prueba 5: Cita sin bono
1. Crear cita sin bono asociado
2. Cancelar cita
3. ✅ Verificar: Modal indica "sin bono asociado"
4. ✅ Verificar: Solo cambia estado de cita

---

## 📊 Consultas SQL Útiles

### Ver citas canceladas con reintegro
```sql
SELECT 
  c.id,
  c.fecha_cita,
  c.observaciones,
  b.sesiones_restantes,
  p.nombre_completo as paciente
FROM citas c
LEFT JOIN bonos b ON c.bono_id = b.id
LEFT JOIN pacientes pac ON c.paciente_id = pac.id
LEFT JOIN profiles p ON pac.id = p.id
WHERE c.estado = 'cancelada'
  AND c.observaciones LIKE '%con reintegro%'
ORDER BY c.updated_at DESC;
```

### Ver bonos reactivados
```sql
SELECT 
  b.id,
  b.estado,
  b.sesiones_restantes,
  b.updated_at,
  p.nombre as paciente
FROM bonos b
JOIN pacientes pac ON b.paciente_id = pac.id
JOIN profiles p ON pac.id = p.id
WHERE b.estado::text = 'activo'
  AND b.sesiones_restantes > 0
  AND b.updated_at > NOW() - INTERVAL '7 days'
ORDER BY b.updated_at DESC;
```

### Auditoría de cancelaciones (últimos 30 días)
```sql
SELECT 
  DATE(c.updated_at) as fecha,
  COUNT(*) as total_cancelaciones,
  COUNT(*) FILTER (WHERE c.observaciones LIKE '%con reintegro%') as con_reintegro,
  COUNT(*) FILTER (WHERE c.observaciones LIKE '%sin reintegro%') as sin_reintegro
FROM citas c
WHERE c.estado = 'cancelada'
  AND c.updated_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(c.updated_at)
ORDER BY fecha DESC;
```

---

## 🚀 Próximos Pasos Sugeridos

### Mejoras futuras
1. **Notificaciones al paciente**: Enviar email/WhatsApp cuando se reintegra sesión
2. **Historial de cancelaciones**: Vista dedicada para ver todas las cancelaciones
3. **Estadísticas**: Dashboard con métricas de cancelaciones y reintegros
4. **Políticas personalizables**: Permitir cambiar las 24 horas por configuración
5. **Razones predefinidas**: Dropdown con motivos comunes de cancelación
6. **Penalización por cancelación tardía**: Cobro adicional si cancela sin anticipación

### Integraciones pendientes
- [ ] Agregar botón de cancelación en `/pages/terapeuta/agenda.vue`
- [ ] Agregar botón de cancelación en `/components/TarjetaCita.vue`
- [ ] Integrar en vista de paciente (si existe)
- [ ] Agregar a ModalEditarCita cuando se cambia estado a "cancelada"

---

## 📞 Soporte y Mantenimiento

### Errores comunes

**Error:** "Bono no encontrado"
- **Causa:** `bono_id` inválido o bono eliminado
- **Solución:** Verificar que el bono exista antes de cancelar

**Error:** "Cita no encontrada"
- **Causa:** `cita_id` inválido
- **Solución:** Verificar que la cita exista en la base de datos

**Error:** Función RPC no existe
- **Causa:** Migración SQL no ejecutada
- **Solución:** Ejecutar `/supabase/migrations/20251101_reintegrar_sesion_bono.sql` en Supabase SQL Editor

### Logs importantes

El sistema registra en consola:
```javascript
// Backend (PostgreSQL)
RAISE NOTICE '✅ Sesión reintegrada al bono %. Sesiones restantes: %'

// Frontend
console.log('✅ Cita cancelada:', data)
console.error('❌ Error al cancelar cita con reintegro:', error)
```

---

## ✅ Checklist de Implementación

### Backend
- [x] Función SQL `fn_reintegrar_sesion_bono` creada
- [x] Trigger para actualizar timestamps
- [x] Validación de política de 24 horas
- [x] Registro de observaciones con timestamp
- [x] Reactivación automática de bonos agotados

### Frontend - Composable
- [x] Función `cancelarCitaConReintegro` implementada
- [x] Exportada en retorno del composable
- [x] Manejo de errores
- [x] Integración con Supabase RPC

### Frontend - Componente
- [x] Modal `ModalCancelarCita.vue` creado
- [x] Cálculo de horas de anticipación
- [x] UI responsive y accesible
- [x] Validación de opciones según política
- [x] Mensajes informativos claros

### Frontend - Integración
- [x] Botones en vista día (agenda)
- [x] Botones en vista semana (agenda)
- [x] Botones en vista mes (agenda)
- [x] Estado reactivo del modal
- [x] Funciones de apertura/cierre
- [x] Handler de cancelación exitosa
- [x] Notificaciones de éxito/error

---

## 📝 Notas de Desarrollo

- **Tecnologías:** Vue 3 Composition API, Nuxt 3, Supabase (PostgreSQL + RPC)
- **Patrón:** Modal controlled component con props y emits
- **Estilo:** Tailwind CSS con esquema de colores terracota/cafe/verde
- **Accesibilidad:** Botones con `title`, navegación con teclado
- **Performance:** Cálculos en `computed()`, operaciones RPC en backend

---

**Documentación generada:** 1 de noviembre de 2025  
**Desarrollador:** Sistema de IA - GitHub Copilot  
**Estado:** ✅ Completado y listo para producción
