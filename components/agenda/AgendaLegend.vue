<script setup lang="ts">
// =============================================================================
// COMPONENTE: Leyenda de Estados de Agenda
// =============================================================================
// Muestra los estados de citas con su código de colores

import { COLORES_ESTADO } from './types'

const leyenda = [
  { key: 'pendiente', label: 'Pendiente', emoji: '🟡', bgClass: 'bg-yellow-100', textClass: 'text-yellow-800' },
  { key: 'confirmada', label: 'Confirmada', emoji: '🟢', bgClass: 'bg-green-100', textClass: 'text-green-700' },
  { key: 'realizada', label: 'Realizada', emoji: '🔵', bgClass: 'bg-blue-100', textClass: 'text-blue-700' },
  { key: 'cancelada', label: 'Cancelada', emoji: '🔴', bgClass: 'bg-red-100', textClass: 'text-red-700' }
]
</script>

<template>
  <div class="flex flex-wrap gap-2 items-center py-1.5">
    <div 
      v-for="item in leyenda" 
      :key="item.key" 
      :class="['flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105', item.bgClass, item.textClass]"
    >
      <span class="text-base">{{ item.emoji }}</span>
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Animación suave para hover */
div:hover {
  transform: scale(1.05);
}
</style>
