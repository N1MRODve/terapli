<template>
  <section id="inversion" class="bg-[#F2F2F2] py-20 px-6 md:px-12 lg:px-20">
    <div class="max-w-5xl mx-auto text-center">
      
      <!-- Header -->
      <div class="mb-16 animate-fade-in-up">
        <h2 class="text-3xl md:text-4xl font-serif font-semibold text-[#2D3748] mb-6 leading-tight">
          Invertir en tu bienestar es una forma de cuidarte
        </h2>
        <p class="text-lg md:text-xl text-[#2D3748]/80 leading-relaxed max-w-3xl mx-auto" style="line-height: 1.7;">
          Iniciar un proceso terapéutico es un acto de amor propio. Cada sesión es un espacio para escucharte, 
          comprenderte y avanzar a tu ritmo. Por eso, te ofrezco distintas modalidades para que puedas cuidar de ti con libertad y sin presiones.
        </p>
      </div>

      <!-- Grid de Modalidades -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
        
        <!-- Tarjeta 1: Encuentro Puntual -->
        <div class="bg-white border-2 border-[#E2E8F0]/40 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in-up [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
          <div class="w-12 h-12 bg-[#E2E8F0]/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#5550F2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="font-serif text-2xl text-[#2D3748] mb-4 font-semibold">Encuentro Puntual</h3>
          <p class="text-[#2D3748]/80 mb-6 leading-relaxed" style="line-height: 1.7;">
            Ideal si buscas un acompañamiento flexible o necesitas un espacio de orientación en momentos específicos.
          </p>
          <div class="pt-4 border-t border-[#E2E8F0]/40">
            <p class="font-serif text-3xl text-[#2D3748] font-semibold">60 €</p>
            <p class="text-sm text-[#2D3748]/60 mt-1">por sesión</p>
          </div>
        </div>

        <!-- Tarjeta 2: Proceso Constante (Destacada) -->
        <div class="bg-gradient-to-br from-[#E2E8F0]/50 to-[#5550F2]/30 border-2 border-[#5550F2]/60 p-8 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards] relative">
          <!-- Badge "Más elegida" -->
          <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span class="bg-[#5550F2] text-white text-xs font-medium px-4 py-1 rounded-full">Más elegida</span>
          </div>
          <div class="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#2D3748]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="font-serif text-2xl text-[#2D3748] mb-4 font-semibold">Proceso Constante</h3>
          <p class="text-[#2D3748]/80 mb-6 leading-relaxed" style="line-height: 1.7;">
            Dos sesiones al mes para mantener un trabajo emocional continuado sin sobrecargarte.
          </p>
          <div class="pt-4 border-t border-[#2D3748]/20">
            <p class="font-serif text-3xl text-[#2D3748] font-semibold">100 €</p>
            <p class="text-sm text-[#2D3748]/60 mt-1">/ mes (2 sesiones de 50 € c/u)</p>
          </div>
        </div>

        <!-- Tarjeta 3: Proceso Profundo -->
        <div class="bg-white border-2 border-[#E2E8F0]/40 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in-up [animation-delay:300ms] opacity-0 [animation-fill-mode:forwards]">
          <div class="w-12 h-12 bg-[#E2E8F0]/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#5550F2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="font-serif text-2xl text-[#2D3748] mb-4 font-semibold">Proceso Profundo</h3>
          <p class="text-[#2D3748]/80 mb-6 leading-relaxed" style="line-height: 1.7;">
            Cuatro sesiones mensuales para acompañarte en un proceso de cambio sostenido y profundo.
          </p>
          <div class="pt-4 border-t border-[#E2E8F0]/40">
            <p class="font-serif text-3xl text-[#2D3748] font-semibold">160 €</p>
            <p class="text-sm text-[#2D3748]/60 mt-1">/ mes (4 sesiones de 40 € c/u)</p>
          </div>
        </div>

      </div>

      <!-- Bloque de Accesibilidad -->
      <div class="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-[#E2E8F0]/40 mb-12 animate-fade-in-up [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
        <div class="flex items-start gap-4 mb-4">
          <div class="w-10 h-10 bg-[#5550F2]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#5550F2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div class="text-left flex-1">
            <h4 class="font-serif text-xl text-[#2D3748] mb-3 font-semibold">Accesibilidad y compromiso social</h4>
            <p class="text-[#2D3748]/80 leading-relaxed mb-4" style="line-height: 1.7;">
              Entiendo que no todas las personas atraviesan el mismo momento económico. Por eso, reservo un número limitado de plazas con 
              <strong class="text-[#2D3748]">descuento de hasta el 50 %</strong> para quienes necesitan apoyo y atraviesan dificultades económicas.
            </p>
            <p class="text-[#2D3748]/80 leading-relaxed" style="line-height: 1.7;">
              Si este es tu caso, házmelo saber durante la primera orientación: encontraremos la manera de que puedas recibir la ayuda que necesitas.
            </p>
          </div>
        </div>
      </div>

      <!-- Cierre Emocional -->
      <div class="mb-12 animate-fade-in-up [animation-delay:500ms] opacity-0 [animation-fill-mode:forwards]">
        <p class="font-serif text-xl md:text-2xl text-[#2D3748]/90 italic leading-relaxed max-w-3xl mx-auto" style="line-height: 1.7;">
          La terapia no es un gasto, es una inversión en tu bienestar, en tus relaciones y en tu paz interior.
        </p>
        <p class="text-[#2D3748]/70 mt-4 leading-relaxed" style="line-height: 1.7;">
          Y el primer paso siempre es gratuito: una sesión de orientación donde podrás conocerme, resolver tus dudas y descubrir si este espacio es el adecuado para ti.
        </p>
      </div>

      <!-- CTA Final -->
      <div class="animate-fade-in-up [animation-delay:600ms] opacity-0 [animation-fill-mode:forwards]">
        <CalmButton 
          to="https://calendly.com/psicologakarem/sesion-de-evaluacion?month=2025-10"
          size="lg"
          aria-label="Reservar sesión de orientación gratuita"
        >
          Reserva tu orientación gratuita
        </CalmButton>
        <p class="text-[#2D3748]/60 text-sm mt-4 italic">
          15 minutos sin compromiso para conocernos
        </p>
      </div>

    </div>
  </section>
</template>

<script setup>
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
}

[animation-delay\:100ms] {
  animation-delay: 0.1s;
}

[animation-delay\:200ms] {
  animation-delay: 0.2s;
}

[animation-delay\:300ms] {
  animation-delay: 0.3s;
}

[animation-delay\:400ms] {
  animation-delay: 0.4s;
}

[animation-delay\:500ms] {
  animation-delay: 0.5s;
}

[animation-delay\:600ms] {
  animation-delay: 0.6s;
}
</style>
