<script setup lang="ts">
// =============================================================================
// COMPONENTE: Filtros Avanzados de Agenda
// =============================================================================
// Búsqueda y filtros multi-criterio para la agenda

import { ref, computed, watch } from 'vue'
import type { FiltrosAgenda } from '~/composables/useAgenda'

// Props
interface Props {
  modelValue: FiltrosAgenda
  pacientes?: Array<{ id: string; nombre_completo: string }>
  terapeutas?: Array<{ id: string; nombre_completo: string }>
}

const props = withDefaults(defineProps<Props>(), {
  pacientes: () => [],
  terapeutas: () => []
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: FiltrosAgenda]
  'aplicar': [filtros: FiltrosAgenda]
  'limpiar': []
}>()

// Estado local
const filtrosLocales = ref<FiltrosAgenda>({ ...props.modelValue })
const mostrarFiltrosAvanzados = ref(false)

// Opciones
const opcionesEstado = [
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'confirmada', label: 'Confirmada', color: 'blue' },
  { value: 'completada', label: 'Completada', color: 'gray' },
  { value: 'realizada', label: 'Realizada', color: 'green' },
  { value: 'cancelada', label: 'Cancelada', color: 'red' }
]

const opcionesTipoSesion = [
  { value: 'individual', label: 'Individual' },
  { value: 'pareja', label: 'Pareja' },
  { value: 'familia', label: 'Familia' },
  { value: 'grupal', label: 'Grupal' }
]

const opcionesAreaTerapeutica = [
  { value: 'ansiedad', label: 'Ansiedad' },
  { value: 'depresion', label: 'Depresión' },
  { value: 'pareja', label: 'Terapia de Pareja' },
  { value: 'familia', label: 'Terapia Familiar' },
  { value: 'adolescentes', label: 'Adolescentes' },
  { value: 'duelo', label: 'Duelo y Pérdida' },
  { value: 'trauma', label: 'Trauma' },
  { value: 'adicciones', label: 'Adicciones' },
  { value: 'otro', label: 'Otro' }
]

// Computadas
const filtrosActivos = computed(() => {
  let count = 0
  if (filtrosLocales.value.busqueda) count++
  if (filtrosLocales.value.paciente) count++
  if (filtrosLocales.value.terapeuta) count++
  if (filtrosLocales.value.estado && filtrosLocales.value.estado.length > 0) count++
  if (filtrosLocales.value.tipo_sesion && filtrosLocales.value.tipo_sesion.length > 0) count++
  if (filtrosLocales.value.area_terapeutica) count++
  if (filtrosLocales.value.fecha_desde || filtrosLocales.value.fecha_hasta) count++
  return count
})

const tieneFiltros = computed(() => filtrosActivos.value > 0)

// Watch para sincronizar con v-model
watch(() => props.modelValue, (newVal) => {
  filtrosLocales.value = { ...newVal }
}, { deep: true })

// Métodos
const aplicarFiltros = () => {
  emit('update:modelValue', filtrosLocales.value)
  emit('aplicar', filtrosLocales.value)
}

const limpiarFiltros = () => {
  filtrosLocales.value = {}
  emit('update:modelValue', {})
  emit('limpiar')
}

const toggleEstado = (estado: string) => {
  if (!filtrosLocales.value.estado) {
    filtrosLocales.value.estado = []
  }
  const index = filtrosLocales.value.estado.indexOf(estado)
  if (index > -1) {
    filtrosLocales.value.estado.splice(index, 1)
  } else {
    filtrosLocales.value.estado.push(estado)
  }
  aplicarFiltros()
}

const toggleTipoSesion = (tipo: string) => {
  if (!filtrosLocales.value.tipo_sesion) {
    filtrosLocales.value.tipo_sesion = []
  }
  const index = filtrosLocales.value.tipo_sesion.indexOf(tipo)
  if (index > -1) {
    filtrosLocales.value.tipo_sesion.splice(index, 1)
  } else {
    filtrosLocales.value.tipo_sesion.push(tipo)
  }
  aplicarFiltros()
}

const getColorEstado = (color: string) => {
  const colores: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    green: 'bg-green-100 text-green-800 hover:bg-green-200',
    red: 'bg-red-100 text-red-800 hover:bg-red-200'
  }
  return colores[color] || colores.gray
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
    
    <!-- Búsqueda rápida -->
    <div class="flex items-center gap-3">
      <div class="flex-1 relative">
        <svg 
          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="filtrosLocales.busqueda"
          @input="aplicarFiltros"
          type="text"
          placeholder="Buscar por paciente, fecha u observaciones..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>

      <button
        @click="mostrarFiltrosAvanzados = !mostrarFiltrosAvanzados"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        type="button"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Filtros avanzados
        <span v-if="filtrosActivos > 0" class="px-2 py-0.5 text-xs font-bold text-white bg-purple-600 rounded-full">
          {{ filtrosActivos }}
        </span>
      </button>

      <button
        v-if="tieneFiltros"
        @click="limpiarFiltros"
        class="px-4 py-2.5 text-sm font-medium text-red-700 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
        type="button"
      >
        Limpiar
      </button>
    </div>

    <!-- Filtros por estado (chips rápidos) -->
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-sm font-medium text-gray-700">Estado:</span>
      <button
        v-for="opcion in opcionesEstado"
        :key="opcion.value"
        @click="toggleEstado(opcion.value)"
        class="px-3 py-1.5 text-xs font-medium rounded-full transition-all"
        :class="[
          filtrosLocales.estado?.includes(opcion.value)
            ? getColorEstado(opcion.color) + ' ring-2 ring-offset-1 ring-purple-500'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
        type="button"
      >
        {{ opcion.label }}
      </button>
    </div>

    <!-- Filtros avanzados expandibles -->
    <transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="mostrarFiltrosAvanzados" class="space-y-4 pt-4 border-t border-gray-200 overflow-hidden">
        
        <!-- Fila 1: Paciente y Terapeuta -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Paciente
            </label>
            <select
              v-model="filtrosLocales.paciente"
              @change="aplicarFiltros"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los pacientes</option>
              <option v-for="p in pacientes" :key="p.id" :value="p.id">
                {{ p.nombre_completo }}
              </option>
            </select>
          </div>

          <div v-if="terapeutas.length > 1">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Terapeuta
            </label>
            <select
              v-model="filtrosLocales.terapeuta"
              @change="aplicarFiltros"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los terapeutas</option>
              <option v-for="t in terapeutas" :key="t.id" :value="t.id">
                {{ t.nombre_completo }}
              </option>
            </select>
          </div>
        </div>

        <!-- Fila 2: Área y Tipo de Sesión -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Área Terapéutica
            </label>
            <select
              v-model="filtrosLocales.area_terapeutica"
              @change="aplicarFiltros"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas las áreas</option>
              <option v-for="area in opcionesAreaTerapeutica" :key="area.value" :value="area.value">
                {{ area.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Sesión
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tipo in opcionesTipoSesion"
                :key="tipo.value"
                @click="toggleTipoSesion(tipo.value)"
                class="px-3 py-1.5 text-sm font-medium rounded-lg transition-all"
                :class="[
                  filtrosLocales.tipo_sesion?.includes(tipo.value)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
                type="button"
              >
                {{ tipo.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Fila 3: Rango de fechas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fecha desde
            </label>
            <input
              v-model="filtrosLocales.fecha_desde"
              @change="aplicarFiltros"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fecha hasta
            </label>
            <input
              v-model="filtrosLocales.fecha_hasta"
              @change="aplicarFiltros"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

      </div>
    </transition>

    <!-- Resumen de filtros activos -->
    <div v-if="tieneFiltros" class="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-100">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <span>{{ filtrosActivos }} filtro{{ filtrosActivos > 1 ? 's' : '' }} activo{{ filtrosActivos > 1 ? 's' : '' }}</span>
    </div>

  </div>
</template>

<style scoped>
/* Animaciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
