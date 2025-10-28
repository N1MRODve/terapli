<script setup lang="ts">
// =============================================================================
// COMPONENTE: Filtros Avanzados de Agenda
// =============================================================================
// Búsqueda, chips de estado, filtros de terapeuta, paciente, modalidad

import type { FiltrosAgenda, EstadoCita, Modalidad } from './types'
import { ref, computed } from 'vue'

// Props
const props = defineProps<{
  filtros: FiltrosAgenda
  terapeutas?: Array<{ id: string; nombre: string }>
  pacientes?: Array<{ id: string; nombre: string }>
}>()

// Emits
const emit = defineEmits<{
  'update:filtros': [filtros: FiltrosAgenda]
  'update:busqueda': [query: string]
}>()

// State
const busqueda = ref('')
const mostrarFiltrosAvanzados = ref(false)

// Estados disponibles
const estadosDisponibles: { value: EstadoCita; label: string; emoji: string }[] = [
  { value: 'pendiente', label: 'Pendiente', emoji: '⏳' },
  { value: 'confirmada', label: 'Confirmada', emoji: '✅' },
  { value: 'cancelada', label: 'Cancelada', emoji: '❌' },
  { value: 'completada', label: 'Completada', emoji: '✔️' }
]

// Modalidades disponibles
const modalidadesDisponibles: { value: Modalidad; label: string; emoji: string }[] = [
  { value: 'online', label: 'Online', emoji: '💻' },
  { value: 'presencial', label: 'Presencial', emoji: '🏢' }
]

// Computadas
const estadosSeleccionados = computed({
  get: () => props.filtros.estados || [],
  set: (value) => actualizarFiltro('estados', value)
})

const terapeutaSeleccionado = computed({
  get: () => props.filtros.terapeutaId || '',
  set: (value) => actualizarFiltro('terapeutaId', value || undefined)
})

const pacienteSeleccionado = computed({
  get: () => props.filtros.pacienteId || '',
  set: (value) => actualizarFiltro('pacienteId', value || undefined)
})

const modalidadSeleccionada = computed({
  get: () => props.filtros.modalidad || '',
  set: (value) => actualizarFiltro('modalidad', value as Modalidad || undefined)
})

const fechaDesde = computed({
  get: () => props.filtros.fechaDesde || '',
  set: (value) => actualizarFiltro('fechaDesde', value || undefined)
})

const fechaHasta = computed({
  get: () => props.filtros.fechaHasta || '',
  set: (value) => actualizarFiltro('fechaHasta', value || undefined)
})

const contadorFiltrosActivos = computed(() => {
  let count = 0
  if (estadosSeleccionados.value.length > 0) count++
  if (terapeutaSeleccionado.value) count++
  if (pacienteSeleccionado.value) count++
  if (modalidadSeleccionada.value) count++
  if (fechaDesde.value || fechaHasta.value) count++
  return count
})

// Métodos
const actualizarFiltro = (key: keyof FiltrosAgenda, value: any) => {
  emit('update:filtros', {
    ...props.filtros,
    [key]: value
  })
}

const toggleEstado = (estado: EstadoCita) => {
  const estados = [...estadosSeleccionados.value]
  const index = estados.indexOf(estado)
  
  if (index > -1) {
    estados.splice(index, 1)
  } else {
    estados.push(estado)
  }
  
  estadosSeleccionados.value = estados
}

const limpiarFiltros = () => {
  busqueda.value = ''
  emit('update:busqueda', '')
  emit('update:filtros', {})
}

const onBusquedaInput = () => {
  emit('update:busqueda', busqueda.value)
}
</script>

<template>
  <div class="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
    <div class="px-4 py-3 sm:px-6 lg:px-8 space-y-3">
      
      <!-- Fila 1: Búsqueda y toggle avanzado -->
      <div class="flex items-center gap-3">
        
        <!-- Input de búsqueda -->
        <div class="flex-1 relative">
          <input
            v-model="busqueda"
            @input="onBusquedaInput"
            type="text"
            placeholder="Buscar por paciente, terapeuta, notas..."
            class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <svg 
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Botón filtros avanzados -->
        <button
          @click="mostrarFiltrosAvanzados = !mostrarFiltrosAvanzados"
          class="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          :class="{ 'bg-purple-50 dark:bg-purple-950/30 border-purple-500': contadorFiltrosActivos > 0 }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filtros</span>
          <span v-if="contadorFiltrosActivos > 0" class="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
            {{ contadorFiltrosActivos }}
          </span>
        </button>

        <!-- Botón limpiar -->
        <button
          v-if="contadorFiltrosActivos > 0 || busqueda"
          @click="limpiarFiltros"
          class="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
        >
          Limpiar
        </button>
      </div>

      <!-- Fila 2: Chips de estado (siempre visible) -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">Estados:</span>
        <button
          v-for="estado in estadosDisponibles"
          :key="estado.value"
          @click="toggleEstado(estado.value)"
          :class="[
            'px-3 py-1.5 text-sm rounded-full border-2 transition',
            estadosSeleccionados.includes(estado.value)
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-purple-500'
          ]"
        >
          <span class="mr-1">{{ estado.emoji }}</span>
          {{ estado.label }}
        </button>
      </div>

      <!-- Fila 3: Filtros avanzados (expandible) -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mostrarFiltrosAvanzados" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          
          <!-- Terapeuta -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Terapeuta
            </label>
            <select
              v-model="terapeutaSeleccionado"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos</option>
              <option v-for="t in terapeutas" :key="t.id" :value="t.id">
                {{ t.nombre }}
              </option>
            </select>
          </div>

          <!-- Paciente -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Paciente
            </label>
            <select
              v-model="pacienteSeleccionado"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos</option>
              <option v-for="p in pacientes" :key="p.id" :value="p.id">
                {{ p.nombre }}
              </option>
            </select>
          </div>

          <!-- Modalidad -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Modalidad
            </label>
            <select
              v-model="modalidadSeleccionada"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todas</option>
              <option v-for="m in modalidadesDisponibles" :key="m.value" :value="m.value">
                {{ m.emoji }} {{ m.label }}
              </option>
            </select>
          </div>

          <!-- Rango de fechas -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rango de fechas
            </label>
            <div class="flex gap-2">
              <input
                v-model="fechaDesde"
                type="date"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              <input
                v-model="fechaHasta"
                type="date"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

        </div>
      </transition>

    </div>
  </div>
</template>

<style scoped>
/* Transiciones suaves */
input:focus,
select:focus {
  outline: none;
}

/* Animación de chips */
button {
  will-change: transform, background-color;
}

button:active {
  transform: scale(0.95);
}
</style>
