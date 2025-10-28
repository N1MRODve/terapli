# 📅 SISTEMA DE AGENDA MEJORADA - GUÍA DE IMPLEMENTACIÓN

## ✅ COMPLETADO

### 1. **Composable useAgenda.ts** - Extendido ✨
📁 `/composables/useAgenda.ts`

**Nuevas funcionalidades agregadas:**

```typescript
// ✅ Interfaces y Tipos
- Cita (extendida con: notas_rapidas, enlace_videollamada, area_terapeutica, tipo_sesion, recordatorios)
- FiltrosAgenda (búsqueda multi-criterio)
- DisponibilidadTerapeuta (JSONB de horarios)
- COLORES_ESTADO (constante para color coding consistente)

// ✅ Nuevas funciones
- citasFiltradas: computed → Filtra por todos los criterios
- aplicarFiltros() → Aplica filtros reactivamente
- limpiarFiltros() → Resetea todos los filtros
- reprogramarCita() → Drag & drop (UPDATE fecha/hora en Supabase)
- actualizarNotasRapidas() → Notas y enlaces de videollamada
- obtenerDisponibilidad() → Lee JSONB de terapeutas.disponibilidad
- calcularHuecosLibres() → Detecta slots sin citas
- programarRecordatorios() → Crea notificaciones 24h y 4h antes
- calcularCargaDiaria() → Cuenta citas confirmadas/pendientes por día
- obtenerResumenSemanal() → Array con carga de 7 días
- obtenerResumenMensual() → Map con carga de todo el mes
```

**Uso:**
```vue
<script setup>
const {
  citasFiltradas,
  aplicarFiltros,
  reprogramarCita,
  calcularCargaDiaria,
  obtenerResumenSemanal
} = useAgenda()

// Aplicar filtros
aplicarFiltros({
  busqueda: 'María',
  estado: ['pendiente', 'confirmada'],
  fecha_desde: '2025-10-28'
})

// Drag & drop
await reprogramarCita(citaId, '2025-10-30', '10:00')

// Carga diaria
const carga = calcularCargaDiaria('2025-10-28')
// { total: 5, confirmadas: 3, pendientes: 2 }
</script>
```

---

### 2. **Componente AgendaFiltros.vue** - Creado ✨
📁 `/components/AgendaFiltros.vue`

**Características:**
- ✅ Búsqueda rápida (paciente, fecha, observaciones)
- ✅ Filtros rápidos por estado (chips con colores)
- ✅ Filtros avanzados expandibles:
  - Selector de paciente
  - Selector de terapeuta (si hay múltiples)
  - Área terapéutica (dropdown)
  - Tipo de sesión (chips multi-select)
  - Rango de fechas (desde/hasta)
- ✅ Badge con contador de filtros activos
- ✅ Botón "Limpiar" para resetear
- ✅ v-model bidireccional
- ✅ Animaciones suaves (expand/collapse)

**Uso:**
```vue
<template>
  <AgendaFiltros
    v-model="filtrosActivos"
    :pacientes="listaPacientes"
    :terapeutas="listaTerapeutas"
    @aplicar="handleAplicarFiltros"
    @limpiar="handleLimpiarFiltros"
  />
</template>
```

---

## 🚧 PENDIENTE DE IMPLEMENTAR

### 3. **AgendaSemanaCompacta.vue** - Vista Semanal
📁 `/components/AgendaSemanaCompacta.vue`

**Requisitos:**
```vue
<template>
  <div class="grid grid-cols-7 gap-2">
    <!-- Cada día de la semana -->
    <div v-for="dia in resumenSemanal" :key="dia.fecha">
      <!-- Header: Día y fecha -->
      <div class="text-center mb-2">
        <span class="text-xs font-semibold">{{ dia.dia }}</span>
        <span class="text-sm">{{ formatearDia(dia.fecha) }}</span>
      </div>

      <!-- Badge de carga: "5/8 sesiones" -->
      <div class="mb-2 text-center">
        <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
          {{ dia.confirmadas }}/{{ dia.citas }} sesiones
        </span>
      </div>

      <!-- Citas del día (compacto) -->
      <div class="space-y-1">
        <div
          v-for="cita in citasDelDia(dia.fecha)"
          :key="cita.id"
          class="p-2 rounded text-xs cursor-pointer hover:shadow-md transition"
          :class="getColorEstado(cita.estado).bg"
          @mouseover="mostrarTooltip(cita)"
        >
          <span>{{ cita.hora_inicio }}</span>
          <span class="font-medium">{{ cita.paciente.nombre_completo }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Tooltip con detalles al hover -->
  <Teleport to="body">
    <div v-if="citaHover" class="tooltip">
      <!-- Detalles completos de la cita -->
    </div>
  </Teleport>
</template>

<script setup>
const { obtenerResumenSemanal, citas } = useAgenda()
const resumenSemanal = computed(() => obtenerResumenSemanal(fechaInicio.value))

const citasDelDia = (fecha) => {
  return citas.value.filter(c => c.fecha_cita === fecha)
}
</script>
```

---

### 4. **AgendaMensualCompacta.vue** - Vista Mensual (Calendario)
📁 `/components/AgendaMensualCompacta.vue`

**Requisitos:**
```vue
<template>
  <div class="calendar-grid">
    <!-- Headers de días de la semana -->
    <div v-for="dia in ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']">
      {{ dia }}
    </div>

    <!-- Grid de días del mes -->
    <div
      v-for="dia in diasDelMes"
      :key="dia.fecha"
      class="calendar-day"
      :class="{ 'text-gray-400': !dia.esDelMes }"
    >
      <span class="day-number">{{ dia.numero }}</span>
      
      <!-- Badge de carga: "5 citas" -->
      <div v-if="dia.carga.total > 0" class="badge-carga">
        {{ dia.carga.total }}
      </div>

      <!-- Código de colores por estado (dots) -->
      <div class="flex gap-0.5 mt-1">
        <div
          v-if="dia.carga.confirmadas > 0"
          class="w-2 h-2 rounded-full bg-blue-500"
          :title="`${dia.carga.confirmadas} confirmadas`"
        />
        <div
          v-if="dia.carga.pendientes > 0"
          class="w-2 h-2 rounded-full bg-yellow-500"
          :title="`${dia.carga.pendientes} pendientes`"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const { obtenerResumenMensual } = useAgenda()
const resumenMensual = computed(() => obtenerResumenMensual(year.value, month.value))
</script>
```

---

### 5. **AgendaCitaDraggable.vue** - Cita con Drag & Drop
📁 `/components/AgendaCitaDraggable.vue`

**Requisitos:**
```vue
<template>
  <div
    :draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    class="cita-card"
    :class="getColorEstado(cita.estado)"
  >
    <!-- Info de la cita -->
    <div class="flex items-center justify-between">
      <div>
        <!-- Hora -->
        <span class="text-sm font-bold">{{ cita.hora_inicio }}</span>
        
        <!-- Paciente (clickable para abrir ficha) -->
        <button
          @click.stop="abrirFichaPaciente(cita.paciente_id)"
          class="font-medium hover:underline"
        >
          {{ cita.paciente.nombre_completo }}
        </button>
      </div>

      <!-- Iconos de estado -->
      <div class="flex items-center gap-1">
        <!-- Enlace de videollamada -->
        <a
          v-if="cita.enlace_videollamada"
          :href="cita.enlace_videollamada"
          target="_blank"
          class="text-blue-600 hover:text-blue-800"
          title="Unirse a videollamada"
        >
          📹
        </a>

        <!-- Recordatorio enviado -->
        <span
          v-if="cita.recordatorio_24h_enviado"
          class="text-green-600"
          title="Recordatorio enviado"
        >
          ✅
        </span>
      </div>
    </div>

    <!-- Bono info -->
    <div v-if="cita.bono" class="text-xs mt-1">
      <span :class="getColorSesiones(cita.bono.sesiones_restantes)">
        {{ cita.bono.sesiones_restantes }}/{{ cita.bono.sesiones_totales }} sesiones
      </span>
    </div>

    <!-- Notas rápidas (editable inline) -->
    <input
      v-if="editandoNotas"
      v-model="notasTemp"
      @blur="guardarNotas"
      @keyup.enter="guardarNotas"
      class="text-xs w-full mt-2 p-1 border rounded"
      placeholder="Agregar notas rápidas..."
    />
    <p v-else-if="cita.notas_rapidas" class="text-xs text-gray-600 mt-2">
      {{ cita.notas_rapidas }}
    </p>
  </div>
</template>

<script setup>
const { reprogramarCita, actualizarNotasRapidas } = useAgenda()

const handleDragStart = (e) => {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('citaId', cita.value.id)
  e.dataTransfer.setData('fecha', cita.value.fecha_cita)
  e.dataTransfer.setData('hora', cita.value.hora_inicio)
}

// Drop zone debe capturar estos eventos
</script>
```

---

### 6. **AgendaDisponibilidad.vue** - Huecos Libres
📁 `/components/AgendaDisponibilidad.vue`

**Requisitos:**
```vue
<template>
  <div class="disponibilidad-grid">
    <h3>Horarios Disponibles</h3>
    
    <div v-for="hueco in huecosLibres" :key="hueco.hora_inicio">
      <div class="hueco-libre">
        <span>{{ hueco.hora_inicio }} - {{ hueco.hora_fin }}</span>
        <button @click="crearCitaEnHueco(hueco)">
          + Agendar
        </button>
      </div>
    </div>

    <!-- Botón para publicar en portal del paciente -->
    <button @click="publicarDisponibilidad">
      🌐 Publicar en portal de pacientes
    </button>
  </div>
</template>

<script setup>
const { obtenerDisponibilidad, calcularHuecosLibres } = useAgenda()

const disponibilidad = ref([])
const huecosLibres = computed(() => 
  calcularHuecosLibres(fechaSeleccionada.value, disponibilidad.value)
)

onMounted(async () => {
  disponibilidad.value = await obtenerDisponibilidad()
})
</script>
```

---

### 7. **Sistema de Recordatorios Automáticos** - Cron Job

**Opción 1: Supabase Edge Function (Recomendado)**
```typescript
// supabase/functions/enviar-recordatorios/index.ts

import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supabase = createClient(...)

  // Obtener citas de mañana (24h)
  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const fechaManana = manana.toISOString().split('T')[0]

  const { data: citasManana } = await supabase
    .from('citas')
    .select('*, paciente:pacientes(*)')
    .eq('fecha_cita', fechaManana)
    .eq('recordatorio_24h_enviado', false)
    .in('estado', ['pendiente', 'confirmada'])

  // Crear notificaciones
  for (const cita of citasManana || []) {
    await supabase.from('notificaciones').insert({
      usuario_id: cita.paciente_id,
      tipo: 'cita',
      titulo: '📅 Recordatorio: Cita mañana',
      mensaje: `Tu cita es mañana ${cita.fecha_cita} a las ${cita.hora_inicio}`,
      metadata: { cita_id: cita.id }
    })

    await supabase
      .from('citas')
      .update({ recordatorio_24h_enviado: true })
      .eq('id', cita.id)
  }

  // Repetir para 4h antes...

  return new Response('OK')
})
```

**Configurar en Supabase Dashboard:**
```bash
supabase functions deploy enviar-recordatorios
# Configurar cron: 0 8,14 * * * (8am y 2pm diario)
```

---

**Opción 2: Composable en Frontend (polling)**
```typescript
// composables/useRecordatorios.ts

export const useRecordatorios = () => {
  const { citas } = useAgenda()

  const verificarRecordatorios = async () => {
    const ahora = new Date()

    for (const cita of citas.value) {
      const fechaCita = new Date(cita.fecha_cita + 'T' + cita.hora_inicio)
      
      // 24h antes
      const diff24h = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60)
      if (diff24h <= 24 && diff24h >= 23.5 && !cita.recordatorio_24h_enviado) {
        await programarRecordatorios(cita.id)
      }

      // 4h antes
      const diff4h = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60)
      if (diff4h <= 4 && diff4h >= 3.5 && !cita.recordatorio_4h_enviado) {
        await programarRecordatorios(cita.id)
      }
    }
  }

  // Ejecutar cada 30 minutos
  setInterval(verificarRecordatorios, 30 * 60 * 1000)

  return { verificarRecordatorios }
}
```

---

### 8. **Modo Oscuro y Accesibilidad** - Composable
📁 `/composables/useTema.ts`

```typescript
export const useTema = () => {
  const modoOscuro = ref(false)
  const tamanoFuente = ref<'small' | 'medium' | 'large'>('medium')

  // Cargar desde localStorage
  onMounted(() => {
    const guardado = localStorage.getItem('tema')
    if (guardado) {
      const tema = JSON.parse(guardado)
      modoOscuro.value = tema.modoOscuro || false
      tamanoFuente.value = tema.tamanoFuente || 'medium'
    }
    aplicarTema()
  })

  // Aplicar tema al DOM
  const aplicarTema = () => {
    if (modoOscuro.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    document.documentElement.setAttribute('data-font-size', tamanoFuente.value)
  }

  // Toggle dark mode
  const toggleModoOscuro = () => {
    modoOscuro.value = !modoOscuro.value
    guardarTema()
    aplicarTema()
  }

  // Cambiar tamaño de fuente
  const cambiarTamanoFuente = (tamano: typeof tamanoFuente.value) => {
    tamanoFuente.value = tamano
    guardarTema()
    aplicarTema()
  }

  // Guardar en localStorage
  const guardarTema = () => {
    localStorage.setItem('tema', JSON.stringify({
      modoOscuro: modoOscuro.value,
      tamanoFuente: tamanoFuente.value
    }))
  }

  return {
    modoOscuro,
    tamanoFuente,
    toggleModoOscuro,
    cambiarTamanoFuente
  }
}
```

**CSS Global (`assets/css/tema.css`):**
```css
/* Modo oscuro */
.dark {
  --color-bg: #1a202c;
  --color-text: #f7fafc;
  --color-border: #4a5568;
}

/* Tamaños de fuente */
[data-font-size="small"] {
  font-size: 14px;
}

[data-font-size="medium"] {
  font-size: 16px;
}

[data-font-size="large"] {
  font-size: 18px;
}

/* Accesibilidad */
.dark .bg-white {
  @apply bg-gray-800 text-gray-100;
}

.dark .border-gray-200 {
  @apply border-gray-700;
}

/* etc... */
```

---

### 9. **Actualizar AgendaTerapeuta.vue** - Integración

```vue
<template>
  <div class="agenda-container">
    
    <!-- Filtros -->
    <AgendaFiltros
      v-model="filtros"
      :pacientes="listaPacientes"
      @aplicar="aplicarFiltros"
    />

    <!-- Selector de vista -->
    <div class="tabs">
      <button @click="vista = 'dia'">Vista Diaria</button>
      <button @click="vista = 'semana'">Vista Semanal</button>
      <button @click="vista = 'mes'">Vista Mensual</button>
      <button @click="vista = 'disponibilidad'">Disponibilidad</button>
    </div>

    <!-- Vistas -->
    <component :is="componenteVista" />

  </div>
</template>

<script setup>
const vista = ref('semana')
const componenteVista = computed(() => {
  switch (vista.value) {
    case 'semana': return AgendaSemanaCompacta
    case 'mes': return AgendaMensualCompacta
    case 'disponibilidad': return AgendaDisponibilidad
    default: return AgendaDiaria
  }
})
</script>
```

---

## 📊 ARQUITECTURA FINAL

```
pages/
└── agenda.vue (página principal)

components/
├── AgendaFiltros.vue ✅ CREADO
├── AgendaSemanaCompacta.vue 🚧 PENDIENTE
├── AgendaMensualCompacta.vue 🚧 PENDIENTE
├── AgendaCitaDraggable.vue 🚧 PENDIENTE
├── AgendaDisponibilidad.vue 🚧 PENDIENTE
└── AgendaTerapeuta.vue (actualizar)

composables/
├── useAgenda.ts ✅ EXTENDIDO
├── useTema.ts 🚧 PENDIENTE
└── useRecordatorios.ts 🚧 PENDIENTE

supabase/functions/
└── enviar-recordatorios/ 🚧 PENDIENTE
```

---

## 🎯 PRÓXIMOS PASOS

1. ✅ **Ejecutar migración de notificaciones** (ya creada)
2. ⏳ **Crear componentes de vista** (semana, mes, draggable)
3. ⏳ **Implementar drag & drop** con HTML5 Drag API
4. ⏳ **Configurar recordatorios** (Edge Function o polling)
5. ⏳ **Agregar modo oscuro** con composable useTema
6. ⏳ **Testear flujo completo** con datos reales

---

## 💡 USO RÁPIDO

```vue
<!-- En cualquier página -->
<script setup>
import { useAgenda, COLORES_ESTADO } from '~/composables/useAgenda'

const {
  citasFiltradas,
  aplicarFiltros,
  reprogramarCita,
  calcularCargaDiaria,
  obtenerResumenSemanal
} = useAgenda()

// Filtrar
aplicarFiltros({ estado: ['pendiente', 'confirmada'] })

// Drag & drop
const onDrop = async (citaId, nuevaFecha, nuevaHora) => {
  const resultado = await reprogramarCita(citaId, nuevaFecha, nuevaHora)
  if (resultado.success) {
    // Toast de confirmación
  }
}

// Colores consistentes
const color = COLORES_ESTADO[cita.estado]
// { bg: 'bg-yellow-50', border: 'border-yellow-300', ... }
</script>
```

---

**¿Quieres que continúe con algún componente específico?** 🚀
