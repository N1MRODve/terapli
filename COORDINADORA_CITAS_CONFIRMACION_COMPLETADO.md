# ✅ Sistema de Confirmación de Citas - Coordinadora

## 📋 Resumen Ejecutivo

Se ha implementado exitosamente la sección **"Citas por Confirmar"** en el dashboard de la coordinadora, permitiendo visualizar y gestionar las citas pendientes de confirmación con integración directa de WhatsApp.

---

## 🎯 Funcionalidades Implementadas

### 1. **Visualización de Citas Pendientes**
- **Lista priorizada**: Muestra hasta 6 citas ordenadas por fecha/hora
- **Filtrado automático**: Solo citas con estado 'pendiente' y fecha >= hoy
- **Información completa**: Paciente, terapeuta, fecha, hora, modalidad, contacto

### 2. **Indicadores Visuales**
- 🔴 **Barra roja**: Citas urgentes (hoy o mañana)
- 🔵 **Barra azul**: Citas próximas (no urgentes)
- **Avatar con iniciales**: Identificación rápida del paciente
- **Iconos de modalidad**: 🖥️ Online / 🏢 Presencial

### 3. **KPIs en Tiempo Real**
```
┌─────────────────────────────────────────────────────────────┐
│  📋 Por Confirmar  │  ⚡ Urgentes  │  ⏱️ Próxima  │  💬 WhatsApp  │
│       15          │      3       │  En 2h 30m  │      12      │
└─────────────────────────────────────────────────────────────┘
```

- **Por Confirmar**: Total de citas pendientes
- **Urgentes**: Citas hoy + mañana
- **Próxima Cita**: Tiempo restante hasta la próxima
- **WhatsApp Listos**: Pacientes con teléfono registrado

### 4. **Acciones Disponibles**

#### 💬 Enviar WhatsApp
- **Botón verde**: Disponible solo si el paciente tiene teléfono
- **Mensaje pre-formateado**:
  ```
  Hola [Nombre], te confirmamos tu cita de terapia con [Terapeuta] 
  el [Fecha] a las [Hora]. [Modalidad]. ¿Confirmas tu asistencia?
  ```
- **Deep-linking**: Abre WhatsApp Web/App automáticamente
- **Número limpio**: Elimina caracteres especiales del teléfono

#### ✓ Marcar como Confirmada
- **Botón azul**: Actualiza el estado de la cita a 'confirmada'
- **Actualización instantánea**: Refresca la lista automáticamente
- **Notificación**: Toast de confirmación exitosa

---

## 🔧 Implementación Técnica

### Variables de Estado
```javascript
const citasPorConfirmar = ref([])        // Array de citas pendientes
const citasUrgentesCount = ref(0)        // Contador de urgentes
const proximaCitaTiempo = ref('--')      // Tiempo hasta próxima cita
const citasConWhatsApp = ref(0)          // Citas con teléfono válido
```

### Funciones Principales

#### 1. `cargarCitasPorConfirmar()`
**Query optimizada**:
```sql
SELECT sesiones.*, pacientes.nombre_completo, pacientes.telefono, 
       pacientes.email, terapeutas.nombre_completo
FROM sesiones
JOIN pacientes ON sesiones.paciente_id = pacientes.id
JOIN terapeutas ON sesiones.terapeuta_id = terapeutas.id
WHERE sesiones.estado = 'pendiente'
  AND sesiones.fecha >= CURRENT_DATE
ORDER BY sesiones.fecha ASC, sesiones.hora_inicio ASC
LIMIT 20
```

**Cálculos de métricas**:
- Filtra citas urgentes (fecha < hoy + 2 días)
- Calcula tiempo restante con `calcularTiempoRestante()`
- Cuenta citas con teléfono válido

#### 2. `enviarWhatsApp(cita)`
**Proceso**:
1. Valida existencia de teléfono
2. Limpia el número (solo dígitos)
3. Formatea mensaje personalizado
4. Codifica URL: `https://wa.me/{numero}?text={mensaje}`
5. Abre en nueva ventana

**Ejemplo de URL generada**:
```
https://wa.me/34612345678?text=Hola%20María%2C%20te%20confirmamos...
```

#### 3. `marcarComoConfirmada(cita)`
**Actualización de estado**:
```javascript
await supabase
  .from('sesiones')
  .update({ estado: 'confirmada' })
  .eq('id', cita.id)
```

**Post-acción**:
- Muestra notificación de éxito
- Recarga lista de citas pendientes
- Actualiza KPIs automáticamente

### Funciones Helper

#### `formatearFechaCita(fecha)`
**Formatos dinámicos**:
- `"Hoy"` - Si la fecha es hoy
- `"Mañana"` - Si la fecha es mañana
- `"Lun 30 Oct"` - Para otras fechas

#### `calcularTiempoRestante(fecha, hora)`
**Cálculo preciso**:
- `"15min"` - Menos de 1 hora
- `"2h 30min"` - Entre 1-24 horas
- `"3 días"` - Más de 24 horas
- `"Pasada"` - Si ya pasó la cita

---

## 🎨 Diseño UI/UX

### Esquema de Colores
```css
/* Tema principal: Azul/Púrpura */
Gradiente título: from-blue-400 to-purple-500
Borde superior: border-t-4 border-purple-400

/* Indicadores de urgencia */
Urgente: bg-red-500 h-full w-1.5 (barra lateral)
Normal: bg-blue-500 h-full w-1.5

/* Botones de acción */
WhatsApp: bg-green-600 hover:bg-green-700
Confirmar: bg-blue-600 hover:bg-blue-700
```

### Layout Responsivo
```html
<!-- Desktop: Grid de 6 columnas -->
<div class="md:grid-cols-6 gap-4">
  <div>Paciente/Terapeuta</div>
  <div>Fecha/Hora</div>
  <div>Modalidad</div>
  <div>Contacto</div>
  <div>Tiempo</div>
  <div>Acciones</div>
</div>

<!-- Mobile: Stack vertical automático -->
```

### Animaciones
- **Hover en tarjetas**: Sombra y elevación
- **Hover en botones**: Cambio de color suave
- **Transiciones**: `transition-all duration-200`
- **Loading states**: Pulsación en botones de acción

---

## 📊 Integración con Dashboard

### Ubicación en la Interfaz
```
Dashboard Coordinadora
├── 📊 KPIs Generales
├── 💰 Pagos Confirmados (Verde)
├── 🟠 Bonos Pendientes (Naranja)
├── 📋 Citas por Confirmar (Azul) ← NUEVA SECCIÓN
└── 📅 Citas de Hoy
```

### Flujo de Datos
```
onMounted() → cargarDatos()
                  ├── cargarBonosConfirmados()
                  ├── cargarBonosPendientes()
                  └── cargarCitasPorConfirmar() ← NUEVA LLAMADA

Auto-refresh: Cada 2 minutos
Manual refresh: Al confirmar cita o enviar WhatsApp
```

---

## 🔄 Flujo de Trabajo Completo

### Workflow de la Coordinadora

1. **📋 Ver Citas Pendientes**
   - Dashboard carga automáticamente
   - Visualiza lista priorizada por urgencia
   - Identifica citas sin confirmación

2. **💬 Enviar Confirmación por WhatsApp**
   - Click en "💬 WhatsApp"
   - Mensaje pre-formateado se abre en WhatsApp
   - Coordinadora envía y espera respuesta del paciente

3. **✓ Marcar como Confirmada**
   - Tras recibir confirmación del paciente
   - Click en "✓ Confirmar"
   - Sistema actualiza estado a 'confirmada'
   - Cita desaparece de la lista "Por Confirmar"

4. **📊 Monitoreo Continuo**
   - KPIs se actualizan en tiempo real
   - Alertas visuales para citas urgentes
   - Refresco automático cada 2 minutos

---

## 🎯 Casos de Uso

### Caso 1: Cita Urgente (Hoy)
```
⚡ [Barra roja] María González
   📅 Hoy - 15:30 | 🖥️ Online
   📞 612 345 678 | ⏱️ En 2h 30min
   [💬 WhatsApp] [✓ Confirmar]
```
**Acción**: Enviar WhatsApp inmediatamente

### Caso 2: Paciente sin Teléfono
```
📋 [Barra azul] Juan Pérez
   📅 Mañana - 10:00 | 🏢 Presencial
   ✉️ juan@email.com | ⏱️ 18h 45min
   [✓ Confirmar]
```
**Acción**: Contacto por email (botón WhatsApp oculto)

### Caso 3: Confirmación Masiva
```
Dashboard muestra:
📋 Por Confirmar: 15 citas
⚡ Urgentes: 3 citas

Proceso:
1. Ordenar por urgencia (rojas primero)
2. Enviar WhatsApp a cada una
3. Marcar confirmadas según respuestas
4. KPIs se actualizan automáticamente
```

---

## ✅ Checklist de Validación

### Funcionalidad ✓
- [x] Carga de citas pendientes desde DB
- [x] Filtrado por estado 'pendiente' y fecha >= hoy
- [x] Ordenamiento por fecha/hora ascendente
- [x] Cálculo de KPIs (total, urgentes, próxima, whatsapp)
- [x] Formateo de fechas relativas (Hoy/Mañana/Fecha)
- [x] Cálculo de tiempo restante
- [x] Integración WhatsApp con deep-linking
- [x] Actualización de estado a 'confirmada'
- [x] Notificaciones toast
- [x] Refresco automático de lista

### UI/UX ✓
- [x] Diseño consistente con otras secciones
- [x] Indicadores de urgencia visuales
- [x] Avatares con iniciales
- [x] Botones de acción condicionales
- [x] Responsive design (mobile/desktop)
- [x] Estados vacíos ("Todas confirmadas")
- [x] Hover effects y transiciones
- [x] Iconos descriptivos

### Rendimiento ✓
- [x] Query optimizado con JOIN
- [x] LIMIT 20 para evitar sobrecarga
- [x] Cálculos en frontend (no DB)
- [x] Auto-refresh cada 2 min (no sobrecarga)
- [x] Actualización selectiva (solo lista afectada)

### Errores ✓
- [x] 0 errores de compilación
- [x] Manejo de teléfono faltante
- [x] Manejo de errores de DB
- [x] Validación de datos antes de mostrar
- [x] Fallbacks para datos vacíos

---

## 🚀 Próximas Mejoras Sugeridas

### Corto Plazo
1. **Plantillas de mensajes**: Múltiples opciones de mensaje WhatsApp
2. **Recordatorios automáticos**: Cron job para enviar recordatorios 24h antes
3. **Historial de confirmaciones**: Log de cuándo y cómo se confirmó cada cita

### Mediano Plazo
4. **Confirmación por email**: Botón adicional para pacientes sin teléfono
5. **Integración con calendario**: Sincronizar con Google Calendar
6. **Estadísticas de confirmación**: Tasa de respuesta, tiempo promedio

### Largo Plazo
7. **Chatbot de WhatsApp**: Respuestas automáticas a confirmaciones
8. **Sistema de notificaciones push**: Alertas en tiempo real
9. **IA para predicción**: Pacientes con alta probabilidad de no confirmar

---

## 📝 Notas Técnicas

### Dependencias
- **Supabase**: Base de datos y autenticación
- **Tailwind CSS**: Estilos y responsive design
- **Nuxt 3**: Framework principal (Composition API)

### Tablas Utilizadas
```sql
sesiones (
  id, fecha, hora_inicio, modalidad, estado,
  paciente_id, terapeuta_id
)

pacientes (
  id, nombre_completo, telefono, email
)

terapeutas (
  id, nombre_completo
)
```

### Estados de Citas
- `pendiente` → Recién creada, sin confirmar
- `confirmada` → Coordinadora confirmó con paciente
- `completada` → Sesión realizada
- `cancelada` → Paciente canceló
- `no_asistio` → Paciente no se presentó

---

## 🎉 Resultado Final

La coordinadora ahora tiene un **centro de control completo** para gestionar el ciclo de vida de las citas:

```
┌────────────────────────────────────────────────────────────┐
│                 DASHBOARD COORDINADORA                     │
├────────────────────────────────────────────────────────────┤
│ 💰 Pagos Confirmados   → Ver ingresos recibidos          │
│ 🟠 Bonos Pendientes    → Confirmar pagos pendientes       │
│ 📋 Citas por Confirmar → Confirmar asistencia (WhatsApp)  │
│ 📅 Citas de Hoy        → Gestionar sesiones del día       │
└────────────────────────────────────────────────────────────┘
```

**Impacto**:
- ✅ Reducción de no-shows mediante confirmación proactiva
- ✅ Comunicación eficiente con WhatsApp
- ✅ Visibilidad completa del pipeline de citas
- ✅ Automatización de tareas repetitivas
- ✅ Mejor organización del trabajo diario

---

**Estado**: ✅ **COMPLETADO** - Listo para producción
**Fecha**: 2024
**Archivo**: `/pages/coordinadora/dashboard.vue`
**Líneas añadidas**: ~350 (template + script + funciones)
