<template>
  <div class="agenda-page">
    <AgendaCalendario />
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// PÁGINA: /terapeuta/agenda
// =============================================================================
// Página principal de la agenda del terapeuta
// Usa el nuevo componente AgendaCalendario con diseño mejorado

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
