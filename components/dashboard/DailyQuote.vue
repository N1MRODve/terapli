<template>
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#D8AFA0] via-[#F9F7F3] to-[#F9F7F3] p-8 sm:p-10 shadow-[0_2px_6px_rgba(0,0,0,0.05)] border border-[#EAD5D3]/30">
    <!-- Icono decorativo -->
    <div class="absolute top-6 right-6 text-5xl opacity-15">✨</div>
    
    <div class="relative z-10 text-center max-w-3xl mx-auto">
      <p class="font-['Lora'] text-2xl sm:text-3xl text-[#5D4A44] italic mb-3 leading-relaxed">
        "{{ quote.text }}"
      </p>
      <p class="font-['Lato'] text-sm sm:text-base text-[#5D4A44]/60">
        {{ quote.author }}
      </p>
    </div>

    <!-- Elementos decorativos -->
    <div class="absolute -left-8 -bottom-8 w-32 h-32 bg-white/30 rounded-full blur-2xl"></div>
    <div class="absolute -right-4 top-1/2 w-20 h-20 bg-[#D8AFA0]/20 rounded-full blur-xl"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const quotes = [
  {
    text: 'Mereces paz, amor y comprensión. Empieza por dártela a ti misma.',
    author: '— Recordatorio de bienestar'
  },
  {
    text: 'Eres más fuerte de lo que crees. Confía en tu proceso.',
    author: '— Afirmación del día'
  },
  {
    text: 'Está bien no estar bien. Lo importante es permitirte sentir.',
    author: '— Recordatorio de autocuidado'
  },
  {
    text: 'Cada paso que das hacia tu bienestar es un acto de amor propio.',
    author: '— Reflexión diaria'
  },
  {
    text: 'Tus emociones son mensajeras, no enemigas. Escúchalas con compasión.',
    author: '— Sabiduría emocional'
  },
  {
    text: 'El autocuidado no es egoísmo, es responsabilidad hacia ti misma.',
    author: '— Recordatorio de bienestar'
  },
  {
    text: 'No tienes que ser perfecta para ser valiosa.',
    author: '— Afirmación del día'
  }
]

const quote = computed(() => {
  // Rotar la frase según el día del año
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return quotes[dayOfYear % quotes.length]
})
</script>

<style scoped>
/* Animación suave al cargar */
.relative {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
