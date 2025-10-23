<template>
  <div class="mb-6">
    <h1 class="font-['Lato'] text-2xl sm:text-3xl text-[#5D4A44] mb-1 flex items-center gap-2">
      {{ greeting }} <span class="text-3xl">{{ greetingIcon }}</span>
    </h1>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  userName: {
    type: String,
    default: ''
  }
})

// Determinar saludo e icono según hora del día
const hour = new Date().getHours()

const greeting = computed(() => {
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

const greetingIcon = computed(() => {
  if (hour < 12) return '🌿'
  if (hour < 19) return '☀️'
  return '🌙'
})
</script>

<style scoped>
/* Animación suave al cargar */
div {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
