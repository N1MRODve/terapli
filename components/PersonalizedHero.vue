<template>
  <section class="relative grid md:grid-cols-2 items-center bg-[#F9F7F3] overflow-hidden py-12 md:py-20 px-6 md:px-12 lg:px-20">
    <!-- Left column: text content -->
    <div class="z-10 max-w-2xl mx-auto md:mx-0 animate-fade-in-up">
      <h1 class="text-3xl md:text-5xl lg:text-6xl font-serif font-semibold text-[#5D4A44] leading-tight tracking-tight">
        {{ greeting }}
      </h1>
      
      <p class="text-base md:text-lg lg:text-xl text-[#5D4A44]/70 mt-4 md:mt-6 leading-relaxed max-w-xl">
        Este espacio está pensado para acompañarte con calma, comprensión y&nbsp;cercanía.
      </p>

      <!-- Mobile optimized CTA message -->
      <p class="text-sm md:text-base text-[#5D4A44]/70 mt-4 md:mt-6 leading-relaxed animate-fade-in-up [animation-delay:0.2s]">
        {{ ctaMessage }}
      </p>

      <div class="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 animate-fade-in-up [animation-delay:0.4s]">
        <CalmButton 
          v-if="deviceType === 'mobile'" 
          to="https://wa.me/34722377290"
          variant="whatsapp"
          size="lg"
          class="text-center"
        >
          Contactar por WhatsApp
        </CalmButton>
        <CalmButton to="https://calendly.com/psicologakarem/sesion-de-evaluacion?month=2025-10" size="lg">
          Reservar sesión de orientación
        </CalmButton>
      </div>

      <div class="flex flex-wrap gap-2 md:gap-3 mt-6 animate-fade-in-up [animation-delay:0.6s]">
        <span class="text-xs border border-[#EAD5D3]/80 rounded-full px-3 py-1 text-[#5D4A44]/80">
          Psicóloga Colegiada
        </span>
        <span class="text-xs border border-[#EAD5D3]/80 rounded-full px-3 py-1 text-[#5D4A44]/80">
          100% Confidencial
        </span>
        <span class="text-xs border border-[#EAD5D3]/80 rounded-full px-3 py-1 text-[#5D4A44]/80">
          Online o Presencial
        </span>
      </div>
    </div>

    <!-- Right column: Karem's image -->
    <div class="relative w-full h-[400px] md:h-[550px] overflow-hidden mt-8 md:mt-0">
      <img
        src="/images/karem-pena.png"
        alt="Karem Peña Psicóloga"
        class="absolute inset-0 w-full h-full object-cover object-right-top animate-slow-zoom"
      />
      <!-- Gradiente suave solo en la parte inferior para fundirse con el fondo -->
      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F9F7F3] to-transparent"></div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useVisitorContext } from '@/composables/useVisitorContext'

const { greeting, deviceType, visitorName, getTimeOfDay } = useVisitorContext()

const ctaMessage = computed(() => {
  const timeOfDay = getTimeOfDay()
  const name = visitorName.value
  
  if (deviceType.value === 'mobile') {
    return '¿Quieres dar el primer paso? Escríbeme por WhatsApp y te ayudaré a encontrar el espacio que necesitas.'
  }
  
  if (timeOfDay === 'night') {
    return 'Reserva tu sesión de orientación gratuita con un solo clic. Te responderé pronto.'
  }
  
  return 'Reserva tu sesión de orientación gratuita con un solo clic.'
})
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
  opacity: 0;
}

/* Slow breathing zoom animation for the background image */
@keyframes slow-zoom {
  0% { 
    transform: scale(1); 
  }
  100% { 
    transform: scale(1.05); 
  }
}

.animate-slow-zoom {
  animation: slow-zoom 20s ease-in-out infinite alternate;
}

[animation-delay\:0\.2s] {
  animation-delay: 0.2s;
}

[animation-delay\:0\.4s] {
  animation-delay: 0.4s;
}

[animation-delay\:0\.6s] {
  animation-delay: 0.6s;
}
</style>
