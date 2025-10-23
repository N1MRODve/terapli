# 📋 Sistema de Gestión de Agenda - Actualizaciones

## 🎯 Cambios Implementados

### 1. **Estado por Defecto: "Pendiente"**

#### ✅ Implementado en:
- `components/ModalNuevaCita.vue`

#### Cambio realizado:
```typescript
// Antes:
estado: 'confirmada'

// Ahora:
estado: 'pendiente'
```

#### Razón del cambio:
Las nuevas citas ahora se crean con estado **"pendiente"** por defecto. Esto permite que la persona encargada pueda:
- Revisar las citas antes de confirmarlas
- Verificar disponibilidad real
- Contactar al paciente para confirmación
- Mejor control del flujo de citas

#### Workflow actualizado:
```
Nueva cita creada → Estado: "Pendiente" 🟡
    ↓
Encargada revisa
    ↓
Contacta paciente
    ↓
Confirma disponibilidad
    ↓
Cambia estado a "Confirmada" ✅
```

---

### 2. **Sistema de Bloqueos de Agenda** 🔒

#### ✅ Componentes creados:
1. **`composables/useCitas.ts`** - Funciones de gestión de bloqueos
2. **`components/ModalNuevoBloqueo.vue`** - Modal para crear bloqueos
3. **`pages/terapeuta/agenda.vue`** - Integración en agenda

#### Funcionalidades:

##### A. Crear Bloqueos
Los terapeutas pueden reservar espacios en su agenda para:
- 👤 **Personal**: Almuerzos, descansos, asuntos personales
- 🏖️ **Vacaciones**: Días libres, viajes
- 📌 **Otro**: Reuniones, capacitaciones, eventos

##### B. Datos del Bloqueo:
```typescript
interface Bloqueo {
  id: string
  terapeuta_id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  motivo?: string          // Descripción opcional
  tipo: 'personal' | 'vacaciones' | 'otro'
  created_at: string
}
```

##### C. Validaciones automáticas:
- ✅ No permite crear bloqueos en horarios con citas existentes
- ✅ Verifica que hora_inicio < hora_fin
- ✅ Fecha mínima es hoy (no permite fechas pasadas)
- ✅ Muestra alerta si hay conflicto con cita existente

##### D. Integración con búsqueda de disponibilidad:
- Los espacios bloqueados NO aparecen en búsqueda rápida
- Solo se muestran horarios verdaderamente disponibles
- Previene dobles reservas

---

## 🎨 Interfaz de Usuario

### Modal de Nuevo Bloqueo

```
┌────────────────────────────────────────────┐
│ 🔒 Nuevo Bloqueo                           │
│    Reserva tiempo en tu agenda             │
├────────────────────────────────────────────┤
│                                            │
│ Fecha:          [20/01/2025]              │
│                                            │
│ Hora Inicio:    [13:00]                   │
│ Hora Fin:       [14:00]                   │
│                                            │
│ Tipo de bloqueo:                          │
│ ┌──────┐  ┌──────────┐  ┌──────┐        │
│ │ 👤   │  │  🏖️     │  │ 📌   │        │
│ │Person│  │Vacaciones│  │ Otro │        │
│ └──────┘  └──────────┘  └──────┘        │
│                                            │
│ Motivo:                                    │
│ [Almuerzo                              ]  │
│                                            │
│        [Cancelar]  [Crear Bloqueo]        │
└────────────────────────────────────────────┘
```

### Botón en Agenda

Ubicación: Barra superior, junto a "Buscar Disponibilidad"

```
[📅 Día] [📆 Semana] [🗓️ Mes]  [⚡ Buscar Disponibilidad] [🔒 Bloquear Horario]
```

---

## 🔧 Funciones API

### Funciones agregadas a `useCitas()`:

#### 1. `getBloqueos(terapeutaId?): Promise<Bloqueo[]>`
Obtiene todos los bloqueos del terapeuta.

#### 2. `getBloqueosRango(fechaInicio, fechaFin): Promise<Bloqueo[]>`
Obtiene bloqueos en un rango de fechas.

#### 3. `getBloqueosPorDia(fecha): Promise<Bloqueo[]>`
Obtiene bloqueos de un día específico.

#### 4. `crearBloqueo(bloqueo): Promise<Result>`
Crea un nuevo bloqueo.
- Valida que no haya conflictos con citas
- Retorna error si existe una cita en ese horario

#### 5. `eliminarBloqueo(bloqueoId): Promise<Result>`
Elimina un bloqueo existente.

#### 6. `verificarHorarioBloqueado(fecha, horaInicio, horaFin): Promise<boolean>`
Verifica si un horario específico está bloqueado.

---

## 📊 Datos Demo

### Bloqueos de ejemplo:
```typescript
[
  {
    id: 'bloqueo-1',
    fecha: 'HOY',
    hora_inicio: '13:00',
    hora_fin: '14:00',
    motivo: 'Almuerzo',
    tipo: 'personal'
  },
  {
    id: 'bloqueo-2',
    fecha: 'MAÑANA',
    hora_inicio: '12:00',
    hora_fin: '13:30',
    motivo: 'Reunión de equipo',
    tipo: 'otro'
  },
  {
    id: 'bloqueo-3',
    fecha: 'EN 3 DÍAS',
    hora_inicio: '09:00',
    hora_fin: '18:00',
    motivo: 'Día personal',
    tipo: 'personal'
  }
]
```

---

## 🚀 Casos de Uso

### Caso 1: Almuerzo diario
```
Terapeuta:
1. Click en "🔒 Bloquear Horario"
2. Selecciona fecha de hoy
3. Hora: 13:00 - 14:00
4. Tipo: Personal
5. Motivo: "Almuerzo"
6. Guardar

Resultado:
- No se pueden agendar citas de 13:00-14:00
- Búsqueda rápida omite ese horario
- Visible en vista de agenda (con color diferente)
```

### Caso 2: Vacaciones
```
Terapeuta quiere bloquear una semana:
1. Crear bloqueo día por día
2. Fecha: cada día de la semana
3. Hora: 09:00 - 18:00 (día completo)
4. Tipo: Vacaciones
5. Motivo: "Vacaciones de verano"

Resultado:
- Toda la semana queda bloqueada
- Pacientes no pueden agendar en esos días
- Visible en vista mensual
```

### Caso 3: Conflicto detectado
```
Escenario:
- Existe cita: Lunes 10:00-11:00 con María
- Terapeuta intenta: Bloquear Lunes 09:30-11:30

Sistema:
- ⚠️ Detecta conflicto
- Muestra: "Ya existe una cita en ese horario"
- No permite crear el bloqueo
- Sugiere: Cancelar la cita primero
```

---

## 💻 Implementación Técnica

### Base de Datos (Supabase - Pendiente)

```sql
CREATE TABLE bloqueos_agenda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  terapeuta_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  motivo TEXT,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('personal', 'vacaciones', 'otro')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_bloqueos_terapeuta ON bloqueos_agenda(terapeuta_id);
CREATE INDEX idx_bloqueos_fecha ON bloqueos_agenda(fecha);
CREATE INDEX idx_bloqueos_terapeuta_fecha ON bloqueos_agenda(terapeuta_id, fecha);

-- Constraint para evitar horas inválidas
ALTER TABLE bloqueos_agenda 
  ADD CONSTRAINT check_horas 
  CHECK (hora_inicio < hora_fin);
```

### Modo Demo vs Producción

#### Modo Demo (actual):
```typescript
MODO_DEMO = true

// Datos simulados
getBloqueosDemo() → Array de 3 bloqueos de prueba
crearBloqueo() → console.log + timeout
eliminarBloqueo() → console.log + timeout
```

#### Modo Producción (futuro):
```typescript
MODO_DEMO = false

// Queries reales a Supabase
getBloqueos() → SELECT * FROM bloqueos_agenda
crearBloqueo() → INSERT INTO bloqueos_agenda
eliminarBloqueo() → DELETE FROM bloqueos_agenda
```

---

## 🎯 Beneficios

### Para el Terapeuta:
- ✅ Control total sobre su agenda
- ✅ Protege tiempo personal automáticamente
- ✅ Evita interrupciones no deseadas
- ✅ Planifica vacaciones con anticipación
- ✅ Separa vida profesional y personal

### Para la Encargada:
- ✅ Sabe cuándo NO agendar citas
- ✅ Respeta tiempo bloqueado del terapeuta
- ✅ Reduce cancelaciones de último minuto
- ✅ Mejor organización general

### Para el Paciente:
- ✅ Solo ve horarios verdaderamente disponibles
- ✅ Menos reprogramaciones
- ✅ Mayor certeza de confirmación
- ✅ Mejor experiencia de agendamiento

---

## 📝 Próximos Pasos

### Corto Plazo:
1. ✅ Testing en modo demo
2. ✅ Recolectar feedback de usuarios
3. ⏳ Crear tabla `bloqueos_agenda` en Supabase
4. ⏳ Migrar a modo producción

### Mediano Plazo:
1. 🔄 Mostrar bloqueos visualmente en calendario
2. 🔄 Diferentes colores por tipo de bloqueo
3. 🔄 Editar bloqueos existentes
4. 🔄 Bloqueos recurrentes (ej: almuerzo diario automático)

### Largo Plazo:
1. 📅 Plantillas de bloqueos (horarios típicos)
2. 🔁 Sincronización con calendario externo (Google Calendar)
3. 📊 Reportes de tiempo bloqueado vs tiempo con citas
4. 👥 Compartir disponibilidad con otros terapeutas

---

## 🐛 Validaciones y Prevenciones

### Validaciones en Modal:
- ✅ Fecha no puede ser en el pasado
- ✅ Hora fin debe ser mayor que hora inicio
- ✅ Todos los campos requeridos deben estar completos
- ✅ Botón "Crear" deshabilitado si hay errores

### Validaciones en Backend:
- ✅ Verifica autenticación del terapeuta
- ✅ Comprueba conflictos con citas existentes
- ✅ No permite superposición de bloqueos
- ✅ Valida formato de fechas y horas

### Mensajes de Error:
```typescript
// Conflicto con cita
"Ya existe una cita en ese horario. Cancélala primero para crear el bloqueo."

// Horarios inválidos
"La hora de fin debe ser posterior a la hora de inicio."

// Fecha inválida
"No puedes crear bloqueos en fechas pasadas."
```

---

## 📖 Guía Rápida de Uso

### Para crear un bloqueo:
1. Ve a la página de Agenda
2. Click en "🔒 Bloquear Horario" (esquina superior derecha)
3. Selecciona fecha y horario
4. Elige tipo de bloqueo (Personal, Vacaciones, Otro)
5. Opcional: Agrega motivo
6. Click en "Crear Bloqueo"

### Para verificar bloqueos:
- Vista de día: Aparecerán como bloques especiales (próximamente)
- Búsqueda rápida: Los horarios bloqueados no aparecerán
- Vista mensual: Días completamente bloqueados se verán diferentes

### Para eliminar un bloqueo:
- (Función próximamente disponible en UI)
- Por ahora disponible vía composable: `eliminarBloqueo(id)`

---

## 🎓 Notas Técnicas

### Estado por Defecto Modificado:
**Archivos afectados:**
- `components/ModalNuevaCita.vue` línea 447
- `components/ModalNuevaCita.vue` línea 679 (resetFormulario)

**Impacto:**
- Todas las citas nuevas tendrán estado "pendiente"
- Las citas existentes mantienen su estado actual
- Visualización: Citas pendientes aparecen con color amarillo 🟡

### Sistema de Bloqueos:
**Arquitectura:**
```
ModalNuevoBloqueo.vue
    ↓
useCitas.ts → crearBloqueo()
    ↓
Validación: verificar conflictos
    ↓
MODO_DEMO ? simulación : Supabase INSERT
    ↓
Evento 'bloqueoCreado'
    ↓
Recarga vista de agenda
```

**Integración futura con visualización:**
```typescript
// En vista de día, mostrar bloqueos entre citas:
<div v-for="bloqueo in bloqueosDelDia" class="bloqueo-card">
  <span>🔒</span>
  <span>{{ bloqueo.motivo }}</span>
  <span>{{ bloqueo.hora_inicio }} - {{ bloqueo.hora_fin }}</span>
</div>
```

---

**Documentación actualizada:** ${new Date().toLocaleDateString('es-ES')}  
**Versión:** 2.0  
**Estado:** ✅ Estado Pendiente + 🔒 Sistema Bloqueos Implementados (Modo Demo)
