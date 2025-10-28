<script setup lang="ts">
// =============================================================================
// PÁGINA: Ejemplo de Integración del Sistema de Citas y Bonos
// =============================================================================

definePageMeta({
  middleware: 'auth'
})

import { useAgenda } from '~/composables/useAgenda'

const {
  citas,
  loading,
  citasDelDia,
  citasConBonoProximoAgotar
} = useAgenda()
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Dashboard - Ejemplo</h1>

    <!-- Estadísticas de Bonos -->
    <EstadisticasBonos :citas="citas" class="mb-8" />

    <!-- Citas del Día -->
    <section class="mb-8">
      <h2 class="text-xl font-bold mb-4">Citas de Hoy ({{ citasDelDia.length }})</h2>
      <div class="space-y-4">
        <TarjetaCita
          v-for="cita in citasDelDia"
          :key="cita.id"
          :cita="cita"
          @completar="(id) => console.log('Completar:', id)"
          @ver-historial="(id) => console.log('Historial:', id)"
        />
      </div>
    </section>

    <!-- Agenda Completa -->
    <AgendaTerapeuta />
  </div>
</template>
