<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: Filtros Interactivos de Estado de Agenda
 * =============================================================================
 * Chips toggleables que permiten filtrar citas por estado.
 * Reemplaza la leyenda pasiva con un sistema interactivo de filtrado.
 */

import { ref, computed, watch } from 'vue'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'

// ============================================================================
// PROPS Y EMITS
// ============================================================================

interface Props {
  citas: any[]
  estadosActivos?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  estadosActivos: () => ['pendiente', 'confirmada', 'realizada', 'cancelada']
})

const emit = defineEmits<{
  'filtrar': [estados: string[]]
  'update:estadosActivos': [estados: string[]]
}>()

// ============================================================================
// ESTADO LOCAL
// ============================================================================

// Set de estados seleccionados (activos)
const estadosSeleccionados = ref<Set<string>>(new Set(props.estadosActivos))

// Definición de estados con colores y estilos
const estadosDisponibles = [
  {
    key: 'pendiente',
    label: 'Pendientes',
    emoji: '⏳',
    // Colores inactivos (outline)
    bgInactive: 'bg-white hover:bg-yellow-50',
    textInactive: 'text-yellow-700',
    borderInactive: 'border-yellow-300',
    // Colores activos (sólidos)
    bgActive: 'bg-yellow-500',
    textActive: 'text-white',
    borderActive: 'border-yellow-600',
    ringColor: 'ring-yellow-500'
  },
  {
    key: 'confirmada',
    label: 'Confirmadas',
    emoji: '✓',
    bgInactive: 'bg-white hover:bg-emerald-50',
    textInactive: 'text-emerald-700',
    borderInactive: 'border-emerald-300',
    bgActive: 'bg-emerald-500',
    textActive: 'text-white',
    borderActive: 'border-emerald-600',
    ringColor: 'ring-emerald-500'
  },
  {
    key: 'realizada',
    label: 'Realizadas',
    emoji: '✔',
    bgInactive: 'bg-white hover:bg-blue-50',
    textInactive: 'text-blue-700',
    borderInactive: 'border-blue-300',
    bgActive: 'bg-blue-500',
    textActive: 'text-white',
    borderActive: 'border-blue-600',
    ringColor: 'ring-blue-500'
  },
  {
    key: 'cancelada',
    label: 'Canceladas',
    emoji: '✕',
    bgInactive: 'bg-white hover:bg-red-50',
    textInactive: 'text-red-700',
    borderInactive: 'border-red-300',
    bgActive: 'bg-red-500',
    textActive: 'text-white',
    borderActive: 'border-red-600',
    ringColor: 'ring-red-500'
  }
]

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

// Contar citas por estado
const contarPorEstado = (estado: string): number => {
  return props.citas.filter(c => c.estado === estado).length
}

// Total de citas
const totalCitas = computed(() => props.citas.length)

// Citas visibles según filtros activos
const citasVisibles = computed(() => {
  if (estadosSeleccionados.value.size === 0) {
    // Si no hay filtros, mostrar todo
    return props.citas.length
  }
  return props.citas.filter(c => estadosSeleccionados.value.has(c.estado)).length
})

// Verificar si hay filtros activos (algunos estados desactivados)
const hayFiltrosActivos = computed(() => {
  return estadosSeleccionados.value.size < estadosDisponibles.length && estadosSeleccionados.value.size > 0
})

// Verificar si todos los estados están seleccionados
const todosSeleccionados = computed(() => {
  return estadosSeleccionados.value.size === estadosDisponibles.length
})

// ============================================================================
// MÉTODOS
// ============================================================================

// Toggle estado individual
const toggleEstado = (estado: string) => {
  if (estadosSeleccionados.value.has(estado)) {
    estadosSeleccionados.value.delete(estado)
  } else {
    estadosSeleccionados.value.add(estado)
  }

  // Emitir cambios
  const estadosArray = Array.from(estadosSeleccionados.value)
  emit('update:estadosActivos', estadosArray)
  emit('filtrar', estadosArray)
}

// Seleccionar todos los estados
const seleccionarTodos = () => {
  estadosDisponibles.forEach(e => estadosSeleccionados.value.add(e.key))
  const estadosArray = Array.from(estadosSeleccionados.value)
  emit('update:estadosActivos', estadosArray)
  emit('filtrar', estadosArray)
}

// Limpiar todos los filtros (deseleccionar todo)
const limpiarTodos = () => {
  estadosSeleccionados.value.clear()
  emit('update:estadosActivos', [])
  emit('filtrar', [])
}

// Verificar si un estado está activo
const estaActivo = (estado: string): boolean => {
  return estadosSeleccionados.value.has(estado)
}

// Obtener clases CSS según estado activo/inactivo
const getChipClasses = (estado: any) => {
  const isActive = estaActivo(estado.key)

  return [
    'relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 cursor-pointer select-none',
    'hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    isActive ? [
      estado.bgActive,
      estado.textActive,
      estado.borderActive,
      'shadow-sm'
    ] : [
      estado.bgInactive,
      estado.textInactive,
      estado.borderInactive
    ],
    estado.ringColor
  ]
}
</script>

<template>
  <div class="space-y-3">
    <!-- Header con título y contador -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">Filtrar por Estado</h3>

        <!-- Contador de citas visibles -->
        <div
          v-if="hayFiltrosActivos"
          class="px-3 py-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-bold rounded-full shadow-sm"
        >
          {{ citasVisibles }} de {{ totalCitas }} citas
        </div>
        <div
          v-else-if="todosSeleccionados"
          class="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full"
        >
          {{ totalCitas }} citas totales
        </div>
        <div
          v-else
          class="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full animate-pulse"
        >
          Sin filtros - 0 citas visibles
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex items-center gap-2">
        <button
          v-if="!todosSeleccionados"
          @click="seleccionarTodos"
          class="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors flex items-center gap-1"
        >
          <CheckCircleIcon class="w-4 h-4" />
          Seleccionar todos
        </button>

        <button
          v-if="hayFiltrosActivos || !todosSeleccionados"
          @click="limpiarTodos"
          class="text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline transition-colors flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Chips de estado -->
    <div class="flex flex-wrap gap-3">
      <div
        v-for="estado in estadosDisponibles"
        :key="estado.key"
        @click="toggleEstado(estado.key)"
        :class="getChipClasses(estado)"
        role="button"
        :aria-pressed="estaActivo(estado.key)"
        tabindex="0"
        @keydown.enter="toggleEstado(estado.key)"
        @keydown.space.prevent="toggleEstado(estado.key)"
      >
        <!-- Indicador de check si está activo -->
        <div
          v-if="estaActivo(estado.key)"
          class="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2"
          :class="estado.borderActive"
        >
          <CheckCircleIcon class="w-5 h-5" :class="estado.textInactive" />
        </div>

        <!-- Emoji -->
        <span class="text-lg leading-none">{{ estado.emoji }}</span>

        <!-- Label -->
        <span class="font-bold">{{ estado.label }}</span>

        <!-- Contador -->
        <span
          class="ml-1 px-2 py-0.5 rounded-full text-xs font-bold"
          :class="estaActivo(estado.key) ? 'bg-white/30' : 'bg-gray-100'"
        >
          {{ contarPorEstado(estado.key) }}
        </span>
      </div>
    </div>

    <!-- Mensaje cuando todos los filtros están desactivados -->
    <div
      v-if="estadosSeleccionados.size === 0"
      class="mt-4 text-center py-8 px-4 bg-orange-50 rounded-xl border-2 border-orange-200"
    >
      <div class="text-4xl mb-2">🔍</div>
      <p class="text-sm font-semibold text-orange-800 mb-1">
        No hay filtros activos
      </p>
      <p class="text-xs text-orange-600 mb-3">
        Selecciona al menos un estado para ver las citas
      </p>
      <button
        @click="seleccionarTodos"
        class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
      >
        Mostrar todas las citas
      </button>
    </div>

    <!-- Mensaje cuando no hay citas en los estados seleccionados -->
    <div
      v-else-if="citasVisibles === 0 && estadosSeleccionados.size > 0"
      class="mt-4 text-center py-8 px-4 bg-gray-50 rounded-xl border-2 border-gray-200"
    >
      <div class="text-4xl mb-2">📭</div>
      <p class="text-sm font-semibold text-gray-700 mb-1">
        No hay citas con los estados seleccionados
      </p>
      <p class="text-xs text-gray-500 mb-3">
        Prueba seleccionando otros estados o todos
      </p>
      <button
        @click="seleccionarTodos"
        class="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline"
      >
        Ver todas las citas
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Animación de pulsación al hacer click */
@keyframes pulse-chip {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.98);
  }
}

[role="button"]:active {
  animation: pulse-chip 0.15s ease-out;
}

/* Transición suave para contadores */
span {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animación de pulso para el contador de "sin filtros" */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
