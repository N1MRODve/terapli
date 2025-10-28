<script setup lang="ts">
// =============================================================================
// COMPONENTE: Grilla de Agenda (Día/Semana/Mes)
// =============================================================================
// Renderiza eventos en cuadrícula temporal con drag & drop

import type { AgendaEvent, VistaAgenda, TimeSlot } from './types'
import { computed, ref } from 'vue'
import { 
  generarBloquesHorarios, 
  agregarDias, 
  inicioSemana, 
  formatearDiaSemana 
} from './types'
import AgendaEventCard from './AgendaEventCard.vue'

// Props
const props = defineProps<{
  eventos: AgendaEvent[]
  vista: VistaAgenda
  fechaActual: Date
  cargando?: boolean
  draggable?: boolean
}>()

// Emits
const emit = defineEmits<{
  'evento-click': [id: string]
  'evento-menu': [id: string, event: MouseEvent]
  'slot-click': [slot: TimeSlot]
  'evento-drop': [eventoId: string, nuevoSlot: TimeSlot]
}>()

// State
const eventoDragId = ref<string | null>(null)

// Constantes
const HORAS_TRABAJO = generarBloquesHorarios('08:00', '22:00', 60) // Bloques de 1 hora hasta las 22:00

// Computadas - Fechas según vista
const fechas = computed(() => {
  const fechaStr = props.fechaActual.toISOString().split('T')[0]!
  
  if (props.vista === 'dia') {
    return [fechaStr]
  } else if (props.vista === 'semana') {
    const inicio = inicioSemana(fechaStr)
    return Array.from({ length: 7 }, (_, i) => agregarDias(inicio, i))
  } else {
    // Vista mes: grid simplificado
    const primerDia = new Date(props.fechaActual.getFullYear(), props.fechaActual.getMonth(), 1)
    const ultimoDia = new Date(props.fechaActual.getFullYear(), props.fechaActual.getMonth() + 1, 0)
    const dias: string[] = []
    
    for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
      dias.push(d.toISOString().split('T')[0]!)
    }
    
    return dias
  }
})

// Eventos agrupados por fecha
const eventosPorFecha = computed(() => {
  const mapa = new Map<string, AgendaEvent[]>()
  
  props.eventos.forEach(evento => {
    const fecha = evento.fecha
    if (!mapa.has(fecha)) {
      mapa.set(fecha, [])
    }
    mapa.get(fecha)!.push(evento)
  })
  
  // Ordenar por hora de inicio
  mapa.forEach((eventos, fecha) => {
    eventos.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  })
  
  return mapa
})

// Métodos - Drag & Drop
const handleDragStart = (eventoId: string) => {
  if (!props.draggable) return
  eventoDragId.value = eventoId
}

const handleDragOver = (e: DragEvent) => {
  if (!props.draggable || !eventoDragId.value) return
  e.preventDefault()
}

const handleDrop = (fecha: string, hora: string) => {
  if (!props.draggable || !eventoDragId.value) return
  
  emit('evento-drop', eventoDragId.value, {
    date: fecha,
    horaInicio: hora
  })
  
  eventoDragId.value = null
}

const handleDragEnd = () => {
  eventoDragId.value = null
}

// Click en slot vacío
const handleSlotClick = (fecha: string, hora: string) => {
  emit('slot-click', {
    date: fecha,
    horaInicio: hora
  })
}

// Helpers
const obtenerEventosEnSlot = (fecha: string, hora: string): AgendaEvent[] => {
  const eventos = eventosPorFecha.value.get(fecha) || []
  return eventos.filter(e => e.horaInicio === hora)
}

const esFechaHoy = (fecha: string): boolean => {
  const hoy = new Date().toISOString().split('T')[0]
  return fecha === hoy
}
</script>

<template>
  <div class="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
    
    <!-- Loading state -->
    <div v-if="cargando" class="flex items-center justify-center h-full">
      <div class="text-center space-y-3">
        <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
        <p class="text-gray-600 dark:text-gray-400">Cargando agenda...</p>
      </div>
    </div>

    <!-- Vista DÍA -->
    <div v-else-if="vista === 'dia'" class="p-4 max-w-4xl mx-auto">
      <div class="space-y-3">
        <div
          v-for="hora in HORAS_TRABAJO"
          :key="hora"
          class="min-h-[100px] border border-zinc-200 dark:border-zinc-800 rounded-lg p-3.5 bg-white dark:bg-zinc-950"
          :class="{ 'ring-2 ring-purple-400': eventoDragId }"
          @dragover="handleDragOver"
          @drop="handleDrop(fechas[0]!, hora)"
          @click="handleSlotClick(fechas[0]!, hora)"
        >
          <div class="flex items-start gap-3.5">
            <span class="text-sm font-semibold text-zinc-500 dark:text-zinc-400 w-16 flex-shrink-0">
              {{ hora }}
            </span>
            <div class="flex-1 flex flex-col gap-2.5 min-w-0">
              <AgendaEventCard
                v-for="evento in obtenerEventosEnSlot(fechas[0]!, hora)"
                :key="evento.id"
                :event="evento"
                :draggable="draggable"
                @open="emit('evento-click', $event)"
                @menu="(id, e) => emit('evento-menu', id, e)"
                @dragstart="handleDragStart(evento.id)"
                @dragend="handleDragEnd"
              />
              <button
                v-if="obtenerEventosEnSlot(fechas[0]!, hora).length === 0"
                class="text-sm text-zinc-400 dark:text-zinc-600 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 py-2 rounded-lg transition-colors text-left px-2"
              >
                + Agregar cita
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista SEMANA -->
    <div v-else-if="vista === 'semana'" class="p-4">
      <div class="grid grid-cols-8 gap-2">
        <!-- Header: días de la semana -->
        <div class="col-span-1" /> <!-- Espacio para columna de horas -->
        <div
          v-for="fecha in fechas"
          :key="fecha"
          class="text-center p-2 border-b-2 border-zinc-300 dark:border-zinc-700 font-semibold"
          :class="{ 'bg-purple-100 dark:bg-purple-950/30 border-purple-600': esFechaHoy(fecha) }"
        >
          <div class="text-sm text-zinc-600 dark:text-zinc-400">
            {{ formatearDiaSemana(fecha).split(',')[0] }}
          </div>
          <div class="text-lg">
            {{ new Date(fecha + 'T00:00:00').getDate() }}
          </div>
        </div>

        <!-- Filas: horas y slots -->
        <template v-for="hora in HORAS_TRABAJO" :key="hora">
          <!-- Columna de hora -->
          <div class="text-sm font-semibold text-zinc-500 dark:text-zinc-400 text-right pr-2 py-2">
            {{ hora }}
          </div>
          
          <!-- Columnas de días -->
          <div
            v-for="fecha in fechas"
            :key="`${fecha}-${hora}`"
            class="min-h-[70px] border border-zinc-200 dark:border-zinc-800 rounded p-2 bg-white dark:bg-zinc-950 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/20 transition"
            :class="{ 'ring-2 ring-purple-400': eventoDragId }"
            @dragover="handleDragOver"
            @drop="handleDrop(fecha, hora)"
            @click="handleSlotClick(fecha, hora)"
          >
            <div class="flex flex-col gap-1.5">
              <AgendaEventCard
                v-for="evento in obtenerEventosEnSlot(fecha, hora)"
                :key="evento.id"
                :event="evento"
                :compact="true"
                :draggable="draggable"
                @open="emit('evento-click', $event)"
                @menu="(id, e) => emit('evento-menu', id, e)"
                @dragstart="handleDragStart(evento.id)"
                @dragend="handleDragEnd"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Vista MES -->
    <div v-else-if="vista === 'mes'" class="p-4">
      <div class="grid grid-cols-7 gap-2">
        <!-- Header: días de semana -->
        <div v-for="dia in ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']" :key="dia" class="text-center font-semibold text-sm text-zinc-600 dark:text-zinc-400 p-2">
          {{ dia }}
        </div>

        <!-- Celdas del mes -->
        <div
          v-for="fecha in fechas"
          :key="fecha"
          class="min-h-[120px] border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-white dark:bg-zinc-950 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/20 transition"
          :class="{ 'ring-2 ring-purple-500': esFechaHoy(fecha) }"
          @click="handleSlotClick(fecha, '09:00')"
        >
          <div class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            {{ new Date(fecha + 'T00:00:00').getDate() }}
          </div>
          <div class="flex flex-col gap-1.5">
            <AgendaEventCard
              v-for="evento in (eventosPorFecha.get(fecha) || []).slice(0, 3)"
              :key="evento.id"
              :event="evento"
              :compact="true"
              @open="emit('evento-click', $event)"
              @menu="(id, e) => emit('evento-menu', id, e)"
            />
            <div
              v-if="(eventosPorFecha.get(fecha) || []).length > 3"
              class="text-xs text-purple-600 dark:text-purple-400 font-medium px-2 py-0.5"
            >
              +{{ (eventosPorFecha.get(fecha) || []).length - 3 }} más
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Grid optimizations */
.grid {
  container-type: inline-size;
}

/* Drag feedback */
[draggable="true"] {
  cursor: move;
}

/* Smooth animations */
* {
  transition-property: background-color, border-color, transform;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Loading spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
