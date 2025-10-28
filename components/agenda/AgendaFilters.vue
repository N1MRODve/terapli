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

// Modalidades disponibles
const modalidadesDisponibles: { value: Modalidad; label: string; emoji: string }[] = [
  { value: 'online', label: 'Online', emoji: '💻' },
  { value: 'presencial', label: 'Presencial', emoji: '🏢' }
]

// Computadas
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
  <div class="bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm border-b border-cafe/5 dark:border-gray-800 shadow-sm">
    <div class="px-4 py-2 sm:px-6 lg:px-6 space-y-2">
      
      <!-- Fila 1: Búsqueda y toggle avanzado -->
      <div class="flex items-center gap-3">
        
        <!-- Input de búsqueda -->
        <div class="flex-1 relative">
          <input
            v-model="busqueda"
            @input="onBusquedaInput"
            type="text"
            placeholder="Buscar por paciente, terapeuta, notas..."
            class="w-full px-3 py-1.5 pl-9 text-sm border border-cafe/20 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-terracota focus:border-terracota bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all"
          />
          <svg 
            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cafe/50 dark:text-gray-400"
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
          class="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-cafe/20 dark:border-gray-700 rounded-lg hover:bg-terracota/10 dark:hover:bg-gray-800 hover:border-terracota transition-all duration-200"
          :class="{ 'bg-terracota/10 border-terracota text-terracota': contadorFiltrosActivos > 0 }"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filtros</span>
          <span v-if="contadorFiltrosActivos > 0" class="px-1.5 py-0.5 bg-terracota text-white text-xs rounded-full">
            {{ contadorFiltrosActivos }}
          </span>
        </button>

        <!-- Botón limpiar -->
        <button
          v-if="contadorFiltrosActivos > 0 || busqueda"
          @click="limpiarFiltros"
          class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-200"
        >
          Limpiar
        </button>
      </div>

      <!-- Fila 2: Filtros avanzados (expandible) -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mostrarFiltrosAvanzados" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          
          <!-- Paciente -->
          <div>
            <label class="block text-xs font-medium text-cafe/70 dark:text-gray-300 mb-1">
              Paciente
            </label>
            <select
              v-model="pacienteSeleccionado"
              class="w-full px-3 py-1.5 text-sm border border-cafe/20 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-terracota focus:border-terracota bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todos los pacientes</option>
              <option v-for="p in pacientes" :key="p.id" :value="p.id">
                {{ p.nombre }}
              </option>
            </select>
          </div>

          <!-- Modalidad -->
          <div>
            <label class="block text-xs font-medium text-cafe/70 dark:text-gray-300 mb-1">
              Modalidad
            </label>
            <select
              v-model="modalidadSeleccionada"
              class="w-full px-3 py-1.5 text-sm border border-cafe/20 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-terracota focus:border-terracota bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todas las modalidades</option>
              <option v-for="m in modalidadesDisponibles" :key="m.value" :value="m.value">
                {{ m.emoji }} {{ m.label }}
              </option>
            </select>
          </div>

          <!-- Rango de fechas -->
          <div>
            <label class="block text-xs font-medium text-cafe/70 dark:text-gray-300 mb-1">
              Rango de fechas
            </label>
            <div class="flex gap-2">
              <input
                v-model="fechaDesde"
                type="date"
                class="flex-1 px-3 py-1.5 text-sm border border-cafe/20 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-terracota focus:border-terracota bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              <input
                v-model="fechaHasta"
                type="date"
                class="flex-1 px-3 py-1.5 text-sm border border-cafe/20 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-terracota focus:border-terracota bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
