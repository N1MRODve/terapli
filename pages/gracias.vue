<template>
  <div class="fixed inset-0 flex flex-col items-center justify-center bg-[#F9F7F3] text-center px-6">
    <!-- Main Thank You Message -->
    <div class="animate-fade-in-up">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-serif text-[#5D4A44] mb-6">
        {{ visitorName ? `Gracias, ${visitorName}.` : 'Gracias.' }}
      </h1>
      <p class="text-lg md:text-xl text-[#5D4A44]/80 max-w-2xl mx-auto leading-relaxed">
        Te acompañaré en este proceso con calma y presencia.
      </p>
      <p class="text-base md:text-lg text-[#5D4A44]/70 mt-4 max-w-xl mx-auto leading-relaxed">
        Pronto recibirás los detalles de tu sesión.
      </p>
    </div>

    <!-- Gentle Breathing Circle Animation -->
    <div class="mt-12 md:mt-16 animate-pulse-slow">
      <div class="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-[#D8AFA0] to-[#EFA08B] opacity-40"></div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-12 md:mt-16 flex flex-col md:flex-row gap-4 animate-fade-in-up [animation-delay:0.8s]">
      <CalmButton 
        to="/" 
        variant="primary" 
        size="md"
        aria-label="Volver al inicio"
      >
        Volver al inicio
      </CalmButton>

      <CalmButton 
        to="/sentirse" 
        variant="secondary" 
        size="md"
        aria-label="Explorar recursos emocionales"
      >
        Explorar recursos emocionales
      </CalmButton>
    </div>

    <!-- Auto-redirect countdown indicator (subtle) -->
    <p class="mt-8 text-sm text-[#5D4A44]/40 animate-fade-in-up [animation-delay:1.2s]">
      Redirigiendo automáticamente en {{ countdown }}s...
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVisitorContext } from '@/composables/useVisitorContext'

const router = useRouter()
const { visitorName } = useVisitorContext()

const countdown = ref(6)
let redirectTimer = null
let countdownInterval = null

onMounted(() => {
  // Optional: Play soft breathing sound (muted by default for accessibility)
  // Uncomment if you add an audio file to /public/assets/sounds/
  /*
  try {
    const audio = new Audio('/assets/sounds/soft-breath.mp3')
    audio.volume = 0.15
    audio.play().catch(() => {
      // Silent fail if autoplay is blocked
    })
  } catch (e) {
    // Audio not available
  }
  */

  // Start countdown
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
    }
  }, 1000)

  // Auto redirect after 6 seconds
  redirectTimer = setTimeout(() => {
    router.push('/')
  }, 6000)
})

onUnmounted(() => {
  // Clean up timers
  if (redirectTimer) clearTimeout(redirectTimer)
  if (countdownInterval) clearInterval(countdownInterval)
})

useHead({
  title: 'Gracias - Karem Peña, Psicóloga',
  meta: [
    { name: 'robots', content: 'noindex' }, // Don't index thank you page
    { 
      name: 'description', 
      content: 'Gracias por dar el primer paso hacia tu bienestar emocional. Te acompañaré en este proceso con calma y presencia.' 
    }
  ]
})
</script>

<style scoped>
/* Slow breathing pulse animation - mimics calm breathing (4s inhale + 4s exhale) */
@keyframes pulse-slow {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.4; 
  }
  50% { 
    transform: scale(1.3); 
    opacity: 0.7; 
  }
}

.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}

/* Fade transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
