<script setup>
definePageMeta({
  middleware: 'auth'
})

// Redirigir al dashboard
onMounted(async () => {
  await navigateTo('/paciente/dashboard', { replace: true })
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <LoadingSpinner text="Redirigiendo a tu dashboard..." />
  </div>
</template>
