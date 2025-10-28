<script setup lang="ts">
// =============================================================================
// COMPONENTE: Header de Agenda con Navegación
// =============================================================================
// Controles superiores: navegación temporal, selector de vista, acciones

import type { VistaAgenda } from './types'
import { obtenerTituloAgenda } from './types'
import { computed } from 'vue'

// Props
const props = defineProps<{
  vista: VistaAgenda
  fechaActual: Date
  darkMode?: boolean
}>()

// Emits
const emit = defineEmits<{
  'update:vista': [vista: VistaAgenda]
  'update:fechaActual': [fecha: Date]
  'update:darkMode': [enabled: boolean]
  'nueva-cita': []
}>()

// Computadas
const titulo = computed(() => {
  return obtenerTituloAgenda(props.vista, props.fechaActual)
})

// Métodos de navegación
const irHoy = () => {
  emit('update:fechaActual', new Date())
}

const anterior = () => {
  const nuevaFecha = new Date(props.fechaActual)
  
  if (props.vista === 'dia') {
    nuevaFecha.setDate(nuevaFecha.getDate() - 1)
  } else if (props.vista === 'semana') {
    nuevaFecha.setDate(nuevaFecha.getDate() - 7)
  } else if (props.vista === 'mes') {
    nuevaFecha.setMonth(nuevaFecha.getMonth() - 1)
  }
  
  emit('update:fechaActual', nuevaFecha)
}

const siguiente = () => {
  const nuevaFecha = new Date(props.fechaActual)
  
  if (props.vista === 'dia') {
    nuevaFecha.setDate(nuevaFecha.getDate() + 1)
  } else if (props.vista === 'semana') {
    nuevaFecha.setDate(nuevaFecha.getDate() + 7)
  } else if (props.vista === 'mes') {
    nuevaFecha.setMonth(nuevaFecha.getMonth() + 1)
  }
  
  emit('update:fechaActual', nuevaFecha)
}

const cambiarVista = (vista: VistaAgenda) => {
  emit('update:vista', vista)
}

const toggleDarkMode = () => {
  emit('update:darkMode', !props.darkMode)
}

const crearNuevaCita = () => {
  emit('nueva-cita')
}
</script>

<template>
  <header class="sticky top-0 z-20 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
    <div class="px-4 py-3 sm:px-6 lg:px-8">
      
      <!-- Layout responsive -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <!-- Sección izquierda: Navegación temporal -->
        <div class="flex items-center gap-3">
          
          <!-- Botones de navegación -->
          <div class="flex items-center gap-1">
            <button 
              @click="anterior"
              class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Periodo anterior"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              @click="irHoy"
              class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Hoy
            </button>

            <button 
              @click="siguiente"
              class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Periodo siguiente"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Título del periodo -->
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ titulo }}
          </h1>
        </div>

        <!-- Sección derecha: Controles -->
        <div class="flex items-center gap-4 w-full sm:w-auto">
          
          <!-- Selector de vista -->
          <div class="flex border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              @click="cambiarVista('dia')"
              :class="[
                'px-3 py-2 text-sm transition',
                vista === 'dia'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]"
              aria-label="Vista de día"
            >
              📅 Día
            </button>
            <button
              @click="cambiarVista('semana')"
              :class="[
                'px-3 py-2 text-sm transition border-l border-gray-300 dark:border-gray-700',
                vista === 'semana'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]"
              aria-label="Vista de semana"
            >
              � Semana
            </button>
            <button
              @click="cambiarVista('mes')"
              :class="[
                'px-3 py-2 text-sm transition border-l border-gray-300 dark:border-gray-700',
                vista === 'mes'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]"
              aria-label="Vista de mes"
            >
              🗓️ Mes
            </button>
          </div>

          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            :aria-label="darkMode ? 'Desactivar modo oscuro' : 'Activar modo oscuro'"
          >
            <span v-if="darkMode" class="text-xl">🌙</span>
            <span v-else class="text-xl">☀️</span>
          </button>

          <!-- Botón Nueva Cita -->
          <button
            @click="crearNuevaCita"
            class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Cita
          </button>
        </div>

      </div>
    </div>
  </header>
</template>

<style scoped>
/* Sticky header con blur effect */
header {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Animación suave para cambios */
header * {
  transition-property: color, background-color, border-color;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Accesibilidad: Focus visible mejorado */
button:focus-visible {
  @apply outline-none ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-950;
}
</style>
