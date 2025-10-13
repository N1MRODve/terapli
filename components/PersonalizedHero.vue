<template>
  <section class="relative grid md:grid-cols-2 items-center bg-[#F9F7F3] overflow-hidden py-20 px-6 md:px-12 lg:px-20">
    <!-- Left column: text content -->
    <div class="z-10 max-w-2xl mx-auto md:mx-0 animate-fade-in-up">
      <h1 class="text-5xl md:text-6xl font-serif font-semibold text-[#5D4A44] leading-tight tracking-tight">
        {{ greeting }}
      </h1>
      
      <p class="text-lg md:text-xl text-[#5D4A44]/70 mt-6 leading-relaxed max-w-xl">
        Este espacio está pensado para acompañarte con calma, comprensión y&nbsp;cercanía.
      </p>

      <p class="text-sm text-[#5D4A44]/60 mt-6 animate-fade-in-up [animation-delay:0.2s]">
        {{ ctaMessage }}
      </p>

      <div class="mt-4 flex flex-col sm:flex-row gap-4 animate-fade-in-up [animation-delay:0.4s]">
        <CalmButton 
          v-if="deviceType === 'mobile'" 
          to="https://wa.me/34123456789"
          size="lg"
        >
          Escríbeme por WhatsApp 📱
        </CalmButton>
        <CalmButton to="https://calendly.com/psicologakarem/sesion-de-evaluacion?month=2025-10" size="lg">
          Reservar sesión de orientación
        </CalmButton>
      </div>

      <div class="flex flex-wrap gap-3 mt-6 animate-fade-in-up [animation-delay:0.6s]">
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
    <div class="relative w-full h-[550px] overflow-hidden">
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
    return name 
      ? `${name}, puedes reservar tu sesión directamente por WhatsApp o desde el formulario.`
      : 'Puedes reservar tu sesión directamente por WhatsApp o desde el formulario.'
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
