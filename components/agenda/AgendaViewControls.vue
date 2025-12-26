<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: Controles de Vista y Navegación Temporal
 * =============================================================================
 * Navegación de fechas, selector de vista y actualización.
 */

import { computed } from 'vue'

interface Props {
  vista: 'dia' | 'lista' | 'calendario'
  fechaActual: Date
  loading?: boolean
  lastUpdateTime?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  lastUpdateTime: null
})

const emit = defineEmits<{
  'cambiar-vista': [vista: 'dia' | 'lista' | 'calendario']
  'navegar-fecha': [direccion: number]
  'ir-hoy': []
  'actualizar': []
}>()

// Formatear fecha legible
const fechaFormateada = computed(() => {
  return props.fechaActual.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Capitalizar primera letra
const fechaCapitalizada = computed(() => {
  return fechaFormateada.value.charAt(0).toUpperCase() + fechaFormateada.value.slice(1)
})
</script>

<template>
  <div class="flex items-center justify-between gap-4 flex-wrap">
    <!-- Fecha actual -->
    <div class="flex items-center gap-3">
      <div class="text-sm">
        <span class="font-medium text-neutral-800">{{ fechaCapitalizada }}</span>
      </div>

      <!-- Navegación de fechas -->
      <div class="flex items-center gap-1 border border-neutral-200 rounded-lg p-1 bg-white">
        <button
          @click="emit('navegar-fecha', -1)"
          class="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800 transition-colors"
          :aria-label="vista === 'dia' ? 'Día anterior' : 'Semana anterior'"
          title="Anterior"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          @click="emit('ir-hoy')"
          class="px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded transition-colors"
        >
          Hoy
        </button>

        <button
          @click="emit('navegar-fecha', 1)"
          class="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800 transition-colors"
          :aria-label="vista === 'dia' ? 'Día siguiente' : 'Semana siguiente'"
          title="Siguiente"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Selector de vista y actualización -->
    <div class="flex items-center gap-3">
      <!-- Selector de vista -->
      <div class="flex bg-neutral-100 rounded-lg p-1" role="tablist">
        <button
          @click="emit('cambiar-vista', 'dia')"
          role="tab"
          :aria-selected="vista === 'dia'"
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
          :class="vista === 'dia'
            ? 'bg-white text-neutral-800 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-800'"
        >
          Día
        </button>
        <button
          @click="emit('cambiar-vista', 'calendario')"
          role="tab"
          :aria-selected="vista === 'calendario'"
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
          :class="vista === 'calendario'
            ? 'bg-white text-neutral-800 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-800'"
        >
          Semana
        </button>
        <button
          @click="emit('cambiar-vista', 'lista')"
          role="tab"
          :aria-selected="vista === 'lista'"
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
          :class="vista === 'lista'
            ? 'bg-white text-neutral-800 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-800'"
        >
          Lista
        </button>
      </div>

      <!-- Botón actualizar -->
      <button
        @click="emit('actualizar')"
        :disabled="loading"
        class="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Actualizar agenda"
      >
        <svg
          :class="['w-4 h-4 text-teal-600', loading ? 'animate-spin' : '']"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span v-if="!loading" class="text-sm font-medium text-neutral-700">Actualizar</span>
        <span v-else class="text-sm font-medium text-neutral-500">Actualizando...</span>
      </button>
    </div>
  </div>

  <!-- Última actualización (línea sutil inferior) -->
  <div v-if="lastUpdateTime && !loading" class="mt-2 text-right">
    <span class="text-xs text-neutral-400">{{ lastUpdateTime }}</span>
  </div>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
