# 📝 Sistema de Creación de Citas - Documentación Completa

## Descripción General

El sistema de creación de citas permite al terapeuta programar nuevas sesiones con pacientes existentes o crear pacientes nuevos al mismo tiempo. El flujo está optimizado para rapidez y eficiencia.

---

## 🎯 Funcionalidades Principales

### 1. **Modal de Nueva Cita** (ModalNuevaCita.vue)

Componente completo con dos pasos:

#### **Paso 1: Selección de Paciente**

**Opción A: Paciente Existente**
- ✅ Buscador inteligente (nombre, apellido, email)
- ✅ Lista filtrada en tiempo real
- ✅ Selección con un clic
- ✅ Confirmación visual del paciente seleccionado
- ✅ Opción de cambiar selección

**Opción B: Paciente Nuevo** ✨
- ✅ Botón "+ Nuevo Paciente" siempre visible
- ✅ Formulario inline dentro del modal
- ✅ Campos mínimos requeridos:
  - Nombre (obligatorio)
  - Apellido Paterno (obligatorio)
  - Email (obligatorio)
  - Teléfono (opcional)
- ✅ Estilo visual distintivo (fondo morado)
- ✅ Creación automática del paciente al guardar la cita

#### **Paso 2: Detalles de la Cita**

**Fecha y Hora:**
- ✅ Selector de fecha (fecha mínima: hoy)
- ✅ Selector de hora de inicio (intervalos de 30 min, 8:00-19:30)
- ✅ Selector de duración (30, 60, 90, 120 minutos)
- ✅ **Cálculo automático de hora de fin**

**Tipo de Sesión:**
- 🏥 Presencial
- 💻 Online
- 📞 Telefónica
- Selección visual con botones grandes e iconos

**Estado de la Cita:**
- ✅ Confirmada (verde)
- ⏳ Pendiente (amarillo)
- ❌ Cancelada (rojo)
- ✓ Completada (azul)
- Selección visual con colores distintivos

**Notas Opcionales:**
- Campo de texto libre
- Útil para recordatorios o contexto

---

## 🚀 Puntos de Acceso

### 1. **Botón Flotante** (+)
- Ubicación: Esquina inferior derecha
- Siempre visible en todas las vistas
- Gradiente terracota-rosa
- Efecto hover: escala 110%
- Abre modal sin preselección

### 2. **Desde Búsqueda de Disponibilidad** ⚡
- Clic en un espacio disponible
- **Preselecciona**: fecha y hora automáticamente
- Título especial: "Nueva Cita - Espacio Disponible"
- Navegación automática a vista diaria

### 3. **Desde Vista Diaria**
- Botón "+ Agregar cita este día" al final de la lista
- Preselecciona la fecha del día visualizado
- Estilo: borde discontinuo, hover suave

### 4. **Desde Calendario** (futuro)
- Clic en espacio vacío de calendario
- Preselección automática de fecha

---

## 🛡️ Validaciones y Seguridad

### **Validación de Formulario**

```typescript
formularioValido = 
  (paciente_existente_seleccionado || datos_paciente_nuevo_completos) &&
  fecha_seleccionada &&
  hora_inicio_seleccionada &&
  hora_fin_calculada &&
  tipo_sesion_seleccionado &&
  estado_seleccionado
```

### **Detección de Conflictos de Horario** ⚠️

El sistema **automáticamente verifica** conflictos:

- ✅ Compara con citas existentes del mismo día
- ✅ Detecta solapamientos de horarios
- ✅ Excluye citas canceladas de la validación
- ✅ Muestra alerta visual en caso de conflicto
- ⚠️ Permite guardar pero advierte al usuario

**Tipos de conflicto detectados:**
- Inicio de nueva cita dentro de cita existente
- Fin de nueva cita dentro de cita existente
- Nueva cita engloba completamente otra cita

### **Fecha Mínima**

- No permite agendar citas en fechas pasadas
- Fecha mínima = hoy
- Implementado a nivel HTML con atributo `min`

---

## 📊 Flujo de Creación

### Escenario 1: Cita con Paciente Existente

```
1. Usuario abre modal (botón flotante / búsqueda / etc.)
2. Busca paciente por nombre
3. Selecciona de la lista
4. Paciente confirmado con ✅ verde
5. Selecciona fecha y hora
6. Hora fin se calcula automáticamente
7. Selecciona tipo de sesión
8. Selecciona estado
9. Agrega notas (opcional)
10. Sistema valida conflictos
11. Clic en "Guardar Cita"
12. Modal se cierra
13. Vista se actualiza automáticamente
```

### Escenario 2: Cita con Paciente Nuevo

```
1. Usuario abre modal
2. Clic en "+ Nuevo Paciente"
3. Formulario inline aparece (fondo morado ✨)
4. Completa datos del paciente
5. Selecciona fecha y hora
6. Hora fin se calcula automáticamente
7. Selecciona tipo de sesión
8. Selecciona estado
9. Agrega notas (opcional)
10. Sistema valida conflictos
11. Clic en "Guardar Cita"
12. Sistema crea paciente
13. Sistema crea cita vinculada
14. Modal se cierra
15. Vista se actualiza con nueva cita
```

### Escenario 3: Desde Búsqueda Rápida

```
1. Usuario busca disponibilidad ⚡
2. Sistema muestra 20 espacios
3. Usuario selecciona uno
4. Modal se abre con fecha y hora preseleccionadas
5. Usuario solo necesita:
   - Seleccionar paciente
   - Confirmar tipo y estado
6. Clic en "Guardar Cita"
7. Cita creada en segundos
```

---

## 🎨 Diseño Visual

### **Estructura del Modal**

```
┌─────────────────────────────────────┐
│ [Título]                    [X]     │  ← Header sticky
├─────────────────────────────────────┤
│                                     │
│ 1. SELECCIONAR PACIENTE             │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Buscar paciente...           │ │
│ │ [Lista de pacientes]            │ │
│ │                                 │ │
│ │ O                               │ │
│ │                                 │ │
│ │ ✨ [+ Nuevo Paciente]           │ │
│ │ [Formulario inline morado]      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 2. DETALLES DE LA CITA              │
│ ┌─────────────────────────────────┐ │
│ │ Fecha:     [________]           │ │
│ │ Hora:      [________]           │ │
│ │ Duración:  [________]           │ │
│ │ Hora Fin:  [calculada]          │ │
│ │                                 │ │
│ │ Tipo:  [🏥][💻][📞]           │ │
│ │ Estado: [✅][⏳][❌][✓]       │ │
│ │                                 │ │
│ │ Notas: [_______________]        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⚠️ [Alerta de conflicto] (si hay)  │
│                                     │
│ [Cancelar]    [Guardar Cita]       │  ← Botones de acción
└─────────────────────────────────────┘
```

### **Colores y Estados**

```css
/* Paciente Existente */
Buscador:        Border #D8AFA0
Seleccionado:    Fondo verde #dcfce7
                 Border verde #16a34a

/* Paciente Nuevo */
Contenedor:      Fondo morado #f3e8ff
                 Border morado #c084fc
Inputs:          Border morado #c084fc

/* Tipos de Sesión */
Presencial:      Border #D8AFA0 (seleccionado)
Online:          Border #D8AFA0 (seleccionado)
Telefónica:      Border #D8AFA0 (seleccionado)

/* Estados */
Confirmada:      Verde #dcfce7
Pendiente:       Amarillo #fef9c3
Cancelada:       Rojo #fee2e2
Completada:      Azul #dbeafe

/* Botones */
Cancelar:        Border #D8AFA0, texto #5D4A44
Guardar:         Fondo #D8AFA0, texto blanco
Deshabilitado:   Opacidad 50%
```

---

## 🔧 Configuración

### **Horarios Disponibles**

En `ModalNuevaCita.vue`, línea ~431:

```typescript
const horasDisponibles = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
]
```

Modificar según horario del consultorio.

### **Duraciones de Sesión**

Opciones predefinidas:
- 30 minutos
- 60 minutos (por defecto)
- 90 minutos
- 120 minutos

### **Tipos de Sesión**

```typescript
const tiposSesion = [
  { valor: 'presencial', nombre: 'Presencial', icono: '🏥' },
  { valor: 'online', nombre: 'Online', icono: '💻' },
  { valor: 'telefonica', nombre: 'Telefónica', icono: '📞' }
]
```

### **Estados Iniciales**

```typescript
const estadosCita = [
  { valor: 'confirmada', nombre: 'Confirmada', icono: '✅' },
  { valor: 'pendiente', nombre: 'Pendiente', icono: '⏳' },
  { valor: 'cancelada', nombre: 'Cancelada', icono: '❌' },
  { valor: 'completada', nombre: 'Completada', icono: '✓' }
]
```

---

## 📡 Integración con Backend

### **Modo Demo (Actual)**

```typescript
MODO_DEMO = true

// Pacientes de prueba cargados
// Citas se simulan con delay de 500ms
// IDs generados: 'demo-' + timestamp
```

### **Modo Producción (Futuro)**

Cuando esté lista la integración con Supabase:

1. **Crear Paciente Nuevo:**
```typescript
const { data, error } = await supabase
  .from('pacientes')
  .insert({
    nombre: pacienteNuevo.nombre,
    apellido_paterno: pacienteNuevo.apellido_paterno,
    email: pacienteNuevo.email,
    telefono: pacienteNuevo.telefono
  })
  .select()
  .single()
```

2. **Crear Cita:**
```typescript
const { data, error } = await supabase
  .from('citas')
  .insert({
    paciente_id: formulario.paciente_id,
    terapeuta_id: user.id,
    fecha: formulario.fecha,
    hora_inicio: formulario.hora_inicio,
    hora_fin: formulario.hora_fin,
    tipo: formulario.tipo,
    estado: formulario.estado,
    notas: formulario.notas
  })
  .select()
  .single()
```

---

## 🎓 Eventos y Comunicación

### **Props del Componente**

```typescript
props: {
  mostrar: Boolean,           // Controla visibilidad del modal
  fechaPreseleccionada: String,  // Fecha inicial (opcional)
  horaPreseleccionada: String,   // Hora inicial (opcional)
  titulo: String              // Título personalizado (opcional)
}
```

### **Eventos Emitidos**

```typescript
emit('cerrar')              // Cuando se cierra el modal
emit('citaCreada')         // Cuando se crea exitosamente la cita
```

### **Integración en Página**

```vue
<ModalNuevaCita
  :mostrar="modalNuevaCitaAbierto"
  :fecha-preseleccionada="fechaModalCita"
  :hora-preseleccionada="horaModalCita"
  :titulo="tituloModalCita"
  @cerrar="cerrarModalNuevaCita"
  @cita-creada="onCitaCreada"
/>
```

---

## 💡 Mejores Prácticas

### **Para el Terapeuta**

1. **Usa la búsqueda rápida** para encontrar pacientes
2. **Verifica el estado** antes de guardar
3. **Agrega notas** para contexto de la sesión
4. **Revisa alertas de conflicto** antes de confirmar
5. **Aprovecha la preselección** desde búsqueda de disponibilidad

### **Para el Desarrollo**

1. **Validación exhaustiva**: Siempre validar datos antes de enviar
2. **Feedback visual**: Usuario debe saber qué está pasando
3. **Manejo de errores**: Try-catch en todas las operaciones async
4. **Optimización**: Lazy loading de pacientes si la lista es muy grande
5. **Accesibilidad**: Labels, ARIA attributes, keyboard navigation

---

## 🐛 Troubleshooting

### Problema: Modal no se abre

**Causas posibles:**
- Variable `modalNuevaCitaAbierto` no cambia a `true`
- Z-index del modal muy bajo
- Evento `@click` no está conectado

**Solución:**
```vue
Verificar: modalNuevaCitaAbierto.value = true
Z-index en modal: z-50 (ya implementado)
Botón: @click="abrirModalNuevaCita()"
```

### Problema: No se preselecciona fecha/hora

**Causa:** Props no se pasan correctamente

**Solución:**
```vue
:fecha-preseleccionada="fechaModalCita"
:hora-preseleccionada="horaModalCita"
```

Verificar que las variables tienen valores.

### Problema: Hora fin no se calcula

**Causa:** Falta seleccionar hora de inicio o duración

**Solución:** 
El cálculo es automático con `@change="calcularHoraFin"`.
Verificar que ambos campos tengan valor.

### Problema: Conflicto no se detecta

**Causa:** Función `verificarConflicto` no se ejecuta

**Solución:**
Está en `watch` de fecha/hora. Verificar que los campos cambien.

### Problema: Paciente nuevo no se crea

**Modo Demo:** Se agrega a array temporal
**Modo Producción:** Verificar query a Supabase y permisos RLS

---

## 📈 Métricas de Éxito

- ⏱️ **Tiempo de creación**: < 30 segundos
- 🎯 **Clics necesarios**: 5-7 clics promedio
- ✅ **Tasa de éxito**: 100% en modo demo
- 🚫 **Conflictos evitados**: Detección automática
- 👥 **Pacientes nuevos**: Creación inline sin salir del flujo

---

## 🔮 Próximas Mejoras

1. **Citas Recurrentes**
   - Programar serie de sesiones
   - Cada X días/semanas
   - Hasta fecha específica

2. **Plantillas de Cita**
   - Guardar configuraciones frecuentes
   - Un clic para aplicar

3. **Recordatorios Automáticos**
   - Email/SMS X horas antes
   - Confirmación de asistencia

4. **Integración con Google Calendar**
   - Sincronización bidireccional
   - Actualización en tiempo real

5. **Sala de Espera Virtual**
   - Para sesiones online
   - Link de videollamada automático

6. **Notas Rápidas con IA**
   - Sugerencias basadas en historial
   - Plantillas inteligentes

7. **Drag & Drop en Calendario**
   - Arrastrar para crear cita
   - Cambiar horario arrastrando

---

## 📁 Archivos Relacionados

```
📁 components/
  └── ModalNuevaCita.vue        ← Componente principal

📁 composables/
  └── useCitas.ts               ← Lógica de negocio

📁 pages/terapeuta/
  └── agenda.vue                ← Integración del modal

📁 Documentation/
  ├── AGENDA_DOCUMENTACION.md   ← Docs de agenda
  └── CITAS_CREACION_DOCS.md   ← Este archivo
```

---

## 🎯 Checklist de Implementación

- [x] Modal de nueva cita creado
- [x] Selección de paciente existente
- [x] Formulario de paciente nuevo inline
- [x] Selector de fecha y hora
- [x] Cálculo automático de hora fin
- [x] Selector visual de tipo de sesión
- [x] Selector visual de estado
- [x] Detección de conflictos de horario
- [x] Validación de formulario
- [x] Botón flotante siempre visible
- [x] Integración con búsqueda rápida
- [x] Preselección de fecha/hora
- [x] Botón en vista diaria
- [x] Actualización automática post-creación
- [x] Animaciones y transiciones
- [x] Responsive design
- [ ] Tabla citas en Supabase
- [ ] Integración producción con BD
- [ ] Tests unitarios
- [ ] Tests E2E

---

**Fecha**: Octubre 2025  
**Versión**: 1.0  
**Estado**: Funcional en Modo Demo  
**Próximo**: Integración con Supabase
