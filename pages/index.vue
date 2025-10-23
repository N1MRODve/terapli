<script setup>
// Redirigir automáticamente a la página de login
definePageMeta({
  middleware: async () => {
    return navigateTo('/login')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F7F3] to-[#EAD5D3]/30">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#D8AFA0]"></div>
      <p class="mt-4 text-[#5D4A44] font-medium">Redirigiendo...</p>
    </div>
  </div>
</template>
