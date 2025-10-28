<template>
  <div class="agenda-page">
    <AgendaTerapeuta />
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// PÁGINA: /terapeuta/agenda
// =============================================================================
// Página principal de la agenda del terapeuta
// Muestra todas las citas con filtros por estado (hoy, pendientes, completadas, todas)

definePageMeta({
  middleware: 'auth',
  layout: 'terapeuta'
})
</script>

<style scoped>
.agenda-page {
  width: 100%;
  height: 100%;
}
</style>
