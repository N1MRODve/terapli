<template>
  <div class="min-h-screen bg-gradient-to-br from-[#F2F2F2] via-[#FAFAFA] to-[#F8F9FA]">
    <!-- Sin header ni navegación, solo el contenido -->
    <slot />
  </div>
</template>

<script setup lang="ts">
// Layout simple para páginas de carga y redirección
// No incluye header ni navegación para evitar layout flashing
</script>

<style scoped>
/* Fondo consistente con el diseño de login */
</style>