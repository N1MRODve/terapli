<template>
  <div class="bg-[#F2F2F2] rounded-2xl border-l-4 border-[#5550F2] p-4 shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0 w-10 h-10 bg-[#5550F2]/20 rounded-full flex items-center justify-center">
        <span class="text-xl">{{ insightIcon }}</span>
      </div>
      <div class="flex-1">
        <p class="font-sans text-sm text-[#2D3748]/90 leading-relaxed">
          {{ insightMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  emotionTrend: {
    type: String,
    default: 'stable' // 'improving', 'declining', 'stable', 'fluctuating'
  },
  averageScore: {
    type: Number,
    default: 3
  }
})

const insightIcon = computed(() => {
  switch (props.emotionTrend) {
    case 'improving':
      return '🌱'
    case 'declining':
      return '🤍'
    case 'fluctuating':
      return '🌊'
    default:
      return '💫'
  }
})

const insightMessage = computed(() => {
  const messages = {
    improving: [
      'He notado una mejoría en tu estado emocional esta semana. Esto es un gran avance. Sigue confiando en el proceso.',
      'Veo que has tenido días más positivos últimamente. Es maravilloso ver tu progreso.',
      'Tu bienestar está mejorando. Recuerda que cada pequeño paso cuenta.'
    ],
    declining: [
      'He notado algunas fluctuaciones esta semana. Está bien tener días difíciles. Estoy aquí para apoyarte.',
      'Noto que has tenido momentos complicados. Recuerda que es completamente normal y válido sentirse así.',
      'Los días difíciles son parte del proceso. No estás sola en esto.'
    ],
    fluctuating: [
      'Tus emociones han fluctuado esta semana. Es normal experimentar altibajos. Lo importante es que estás siendo consciente de ellos.',
      'He notado variabilidad en tu estado emocional. Esto muestra que estás conectando con tus sentimientos.',
      'Los cambios emocionales son naturales. El hecho de que los estés registrando es valioso.'
    ],
    stable: [
      'Tu estado emocional se ha mantenido estable. Esto refleja un buen equilibrio interno.',
      'Mantienes una constancia emocional positiva. Sigue cuidando de ti misma.',
      'Noto estabilidad en tu bienestar. Continuemos fortaleciendo esto juntas.'
    ]
  }

  const trendMessages = messages[props.emotionTrend] || messages.stable
  const randomIndex = Math.floor(Math.random() * trendMessages.length)
  return trendMessages[randomIndex]
})
</script>

<style scoped>
div {
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
