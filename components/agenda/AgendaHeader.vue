<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: Header Principal de Agenda
 * =============================================================================
 * Título, navegación de fechas, selector de vistas y controles.
 */

import type { VistaAgenda } from './types'
import { obtenerTituloAgenda } from './types'

interface Props {
  rolActivo?: 'coordinadora' | 'terapeuta'
  mostrarRol?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rolActivo: 'terapeuta',
  mostrarRol: false
})

// v-model bindings
const vista = defineModel<VistaAgenda>('vista', { default: 'semana' })
const fechaActual = defineModel<Date>('fechaActual', { default: () => new Date() })
const darkMode = defineModel<boolean>('darkMode', { default: false })

// Emits
const emit = defineEmits<{
  'nueva-cita': []
}>()

// Vistas disponibles
const vistas: { value: VistaAgenda; label: string; shortcut: string }[] = [
  { value: 'dia', label: 'Día', shortcut: '1' },
  { value: '5dias', label: '5 Días', shortcut: '4' },
  { value: 'semana', label: 'Semana', shortcut: '2' },
  { value: 'mes', label: 'Mes', shortcut: '3' }
]

// Título calculado
const titulo = computed(() => obtenerTituloAgenda(vista.value, fechaActual.value))

// Navegación
const irHoy = () => {
  fechaActual.value = new Date()
}

const navegarAnterior = () => {
  const fecha = new Date(fechaActual.value)

  switch (vista.value) {
    case 'dia':
      fecha.setDate(fecha.getDate() - 1)
      break
    case '5dias':
      fecha.setDate(fecha.getDate() - 5)
      break
    case 'semana':
      fecha.setDate(fecha.getDate() - 7)
      break
    case 'mes':
      fecha.setMonth(fecha.getMonth() - 1)
      break
  }

  fechaActual.value = fecha
}

const navegarSiguiente = () => {
  const fecha = new Date(fechaActual.value)

  switch (vista.value) {
    case 'dia':
      fecha.setDate(fecha.getDate() + 1)
      break
    case '5dias':
      fecha.setDate(fecha.getDate() + 5)
      break
    case 'semana':
      fecha.setDate(fecha.getDate() + 7)
      break
    case 'mes':
      fecha.setMonth(fecha.getMonth() + 1)
      break
  }

  fechaActual.value = fecha
}
</script>

<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-cafe/10 dark:border-gray-800">

    <!-- Lado izquierdo: Navegación y título -->
    <div class="flex items-center gap-3">
      <!-- Botones de navegación -->
      <div class="flex items-center gap-1">
        <button
          @click="navegarAnterior"
          class="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 text-cafe/70 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          title="Anterior"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          @click="irHoy"
          class="px-3 py-1.5 text-sm font-medium rounded-lg border border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
        >
          Hoy
        </button>

        <button
          @click="navegarSiguiente"
          class="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 text-cafe/70 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          title="Siguiente"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Título dinámico -->
      <h1 class="text-lg sm:text-xl font-['Elms_Sans'] font-bold text-neutral-800 dark:text-gray-100 capitalize">
        {{ titulo }}
      </h1>
    </div>

    <!-- Lado derecho: Selector de vistas y controles -->
    <div class="flex items-center gap-3">

      <!-- Selector de vistas -->
      <div class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          v-for="v in vistas"
          :key="v.value"
          @click="vista = v.value"
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
          :class="vista === v.value
            ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
            : 'text-cafe/70 dark:text-gray-400 hover:text-cafe dark:hover:text-gray-200'"
          :title="`Vista ${v.label} (${v.shortcut})`"
        >
          {{ v.label }}
        </button>
      </div>

      <!-- Toggle Dark Mode -->
      <button
        @click="darkMode = !darkMode"
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-cafe/70 dark:text-gray-400 transition-colors"
        :title="darkMode ? 'Modo claro' : 'Modo oscuro'"
      >
        <svg v-if="!darkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>

      <!-- Botón Nueva Cita -->
      <button
        @click="emit('nueva-cita')"
        class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="hidden sm:inline">Nueva Cita</span>
      </button>

      <!-- Indicador de rol/vista (si aplica) -->
      <div v-if="mostrarRol" class="hidden lg:flex items-center gap-2">
        <div class="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg">
          <span class="text-sm font-semibold text-purple-700 dark:text-purple-400">
            {{ rolActivo === 'coordinadora' ? 'Coordinadora' : 'Terapeuta' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

