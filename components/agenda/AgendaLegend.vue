<script setup lang="ts">
// =============================================================================
// COMPONENTE: Leyenda de Estados de Agenda
// =============================================================================
// Muestra los estados de citas con su código de colores

import { COLORES_ESTADO } from './types'

const leyenda = [
  { key: 'pendiente', label: 'Pendiente', dotClass: COLORES_ESTADO.pendiente.dot },
  { key: 'confirmada', label: 'Confirmada', dotClass: COLORES_ESTADO.confirmada.dot },
  { key: 'realizada', label: 'Realizada', dotClass: COLORES_ESTADO.realizada.dot },
  { key: 'cancelada', label: 'Cancelada', dotClass: COLORES_ESTADO.cancelada.dot }
]
</script>

<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
    <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
      Leyenda de Estados
    </h3>
    <ul class="flex flex-wrap items-center gap-4 text-sm">
      <li 
        v-for="item in leyenda" 
        :key="item.key" 
        class="flex items-center gap-2"
      >
        <span 
          :class="['inline-block h-3 w-3 rounded-full border', item.dotClass]" 
          :aria-label="`Estado: ${item.label}`"
        />
        <span class="text-gray-700 dark:text-gray-300">
          {{ item.label }}
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Animación suave para transiciones dark mode */
li {
  transition: opacity 0.2s ease-in-out;
}

li:hover {
  opacity: 0.8;
}
</style>
