<script setup lang="ts">
// =============================================================================
// COMPONENTE: Tarjeta de Evento/Cita en Agenda
// =============================================================================
// Tarjeta visual para mostrar información compacta de una cita

import type { AgendaEvent } from './types'
import { COLORES_ESTADO } from './types'
import { computed } from 'vue'

// Props
const props = defineProps<{
  event: AgendaEvent
  compact?: boolean
  draggable?: boolean
}>()

// Emits
const emit = defineEmits<{
  open: [id: string]
  menu: [id: string, event: MouseEvent]
}>()

// Computadas
const colores = computed(() => {
  // Fallback seguro: usar estado 'cancelada' como default si no existe
  return COLORES_ESTADO[props.event.estado] || COLORES_ESTADO.cancelada
})

const horaFormateada = computed(() => {
  return `${props.event.horaInicio} – ${props.event.horaFin}`
})

const horaInicio = computed(() => {
  return props.event.horaInicio
})

const nombrePaciente = computed(() => {
  return props.event.pacienteNombre || 'Paciente sin nombre'
})

const iconoEstado = computed(() => {
  const iconos = {
    pendiente: '🟡',
    confirmada: '🟢',
    cancelada: '🔴',
    completada: '⚪',
    realizada: '🔵'
  }
  return iconos[props.event.estado] || '⚪'
})

const tieneBono = computed(() => {
  return props.event.bono && props.event.bono.sesionesRestantes !== undefined
})

const colorSesiones = computed(() => {
  if (!props.event.bono) return ''
  const restantes = props.event.bono.sesionesRestantes || 0
  if (restantes === 0) return 'text-red-600 dark:text-red-400'
  if (restantes === 1) return 'text-orange-600 dark:text-orange-400'
  if (restantes <= 2) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400'
})

const handleClick = () => {
  emit('open', props.event.id)
}

const handleMenu = (e: MouseEvent) => {
  e.stopPropagation()
  emit('menu', props.event.id, e)
}
</script>

<template>
  <div
    :class="[
      'group relative rounded-lg border shadow-sm transition-all duration-200',
      'hover:shadow-md cursor-pointer',
      colores.border,
      'bg-white dark:bg-zinc-800',
      draggable ? 'cursor-move' : '',
      compact ? 'min-h-[56px]' : 'min-h-[88px]'
    ]"
    :draggable="draggable"
    role="button"
    tabindex="0"
    :title="nombrePaciente"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Barra indicadora lateral más ancha -->
    <div 
      :class="['absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg', colores.badge]"
      aria-hidden="true"
    />

    <!-- Contenido principal con mejor padding -->
    <div :class="['px-3 py-2.5 pl-4', compact ? 'space-y-1' : 'space-y-2.5']">
      
      <!-- Header: Hora, indicador y paciente -->
      <div class="flex items-start gap-2.5">
        <div class="flex-1 min-w-0 flex flex-col gap-1">
          <!-- Hora e indicador de estado -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex-shrink-0">
              {{ horaInicio }}
            </span>
            <span 
              :class="['w-2 h-2 rounded-full flex-shrink-0', colores.badge]"
              :title="event.estado"
              aria-hidden="true"
            />
            <span v-if="!compact" class="text-xs text-zinc-500 dark:text-zinc-400">
              – {{ event.horaFin }}
            </span>
          </div>
          
          <!-- Nombre del paciente - sin truncar, con wrap -->
          <p 
            :class="[
              'font-medium text-zinc-800 dark:text-zinc-100 leading-snug',
              compact ? 'text-[13px]' : 'text-[15px]'
            ]"
            :title="nombrePaciente"
          >
            {{ nombrePaciente }}
          </p>

          <!-- Área terapéutica y modalidad en una línea -->
          <div v-if="!compact && (event.areaTerapeutica || event.modalidad)" class="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span v-if="event.areaTerapeutica" class="truncate">
              {{ event.areaTerapeutica }}
            </span>
            <span 
              v-if="event.modalidad === 'online'" 
              class="flex items-center gap-1 flex-shrink-0"
              title="Sesión online"
            >
              💻 Online
            </span>
            <span 
              v-if="event.modalidad === 'presencial'" 
              class="flex items-center gap-1 flex-shrink-0"
              title="Sesión presencial"
            >
              🏥 Presencial
            </span>
          </div>
        </div>

        <!-- Menú de acciones -->
        <div class="flex items-start flex-shrink-0">
          <button
            v-if="!compact"
            @click.stop="handleMenu"
            class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-opacity"
            aria-label="Abrir menú de acciones"
            type="button"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Info adicional (solo vista no compacta) -->
      <div v-if="!compact" class="flex items-center gap-2 flex-wrap text-xs">
        <!-- Badge de estado -->
        <span 
          :class="['px-2 py-1 rounded-full font-medium text-white', colores.badge]"
        >
          {{ event.estado }}
        </span>

        <!-- Terapeuta (si aplica) -->
        <span v-if="event.terapeuta" class="text-zinc-600 dark:text-zinc-400 truncate flex items-center gap-1">
          👤 {{ event.terapeuta.nombre }}
        </span>

        <!-- Notas -->
        <span 
          v-if="event.notas" 
          class="text-zinc-600 dark:text-zinc-400"
          title="Tiene notas"
        >
          📝
        </span>
      </div>

      <!-- Info de bono -->
      <div v-if="tieneBono && !compact" class="flex items-center gap-2 text-xs">
        <span class="text-zinc-600 dark:text-zinc-400">Bono:</span>
        <span :class="['font-semibold', colorSesiones]">
          {{ event.bono!.sesionesRestantes }}/{{ event.bono!.sesionesTotales }} sesiones
        </span>
      </div>

    </div>

    <!-- Overlay para drag & drop feedback -->
    <div 
      v-if="draggable"
      class="absolute inset-0 rounded-lg bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
/* Transición suave en hover */
.group:hover {
  transform: translateY(-1px);
}

/* Animaciones y transiciones */
@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Feedback visual para drag */
[draggable="true"]:active {
  opacity: 0.6;
  cursor: grabbing !important;
}

/* Accesibilidad: Focus visible */
div[role="button"]:focus-visible {
  @apply outline-none ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-950;
}

/* Optimización de rendimiento */
.group:hover .opacity-0 {
  will-change: opacity;
}
</style>
