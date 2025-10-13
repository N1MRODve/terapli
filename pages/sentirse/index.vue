<template>
  <div class="bg-[#F9F7F3] py-16 px-6 md:px-12 lg:px-20">
    <div class="max-w-7xl mx-auto">
      <!-- Page Header -->
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-serif text-[#5D4A44] mb-4">
          {{ personalized('¿Cómo te sientes últimamente?', '{name}, ¿cómo te sientes últimamente?') }}
        </h1>
        <p class="text-[#5D4A44]/80 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          {{ personalized(
            'Cada persona vive sus emociones de una forma única. Aquí encontrarás diferentes procesos que acompaño desde la psicoterapia, para que puedas reconocer lo que te pasa y dar el primer paso hacia tu bienestar.',
            'Cada persona vive sus emociones de una forma única. Aquí encontrarás diferentes procesos que acompaño desde la psicoterapia, {name}, para que puedas reconocer lo que te pasa y dar el primer paso hacia tu bienestar.'
          ) }}
        </p>
      </div>

      <!-- 🌿 Bienestar emocional -->
      <section class="mb-20">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-3">🌿 Bienestar emocional</h2>
        <p class="text-[#5D4A44]/70 text-base md:text-lg mb-8">Cuando necesitas calmar tu mente y reconectar con tu equilibrio interior.</p>
        
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Ansiedad -->
          <div class="group p-8 bg-gradient-to-br from-white to-[#F9F7F3]/30 rounded-3xl shadow-[0_4px_20px_rgba(93,74,68,0.08)] hover:shadow-[0_8px_30px_rgba(93,74,68,0.15)] hover:-translate-y-2 transition-all duration-500 border border-[#EAD5D3]/40 backdrop-blur-sm animate-fade-up opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards] relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-[#EAD5D3]/0 to-[#D8AFA0]/0 group-hover:from-[#EAD5D3]/5 group-hover:to-[#D8AFA0]/5 transition-all duration-500 rounded-3xl"></div>
            
            <div class="relative z-10">
              <h3 class="text-xl md:text-2xl font-serif text-[#5D4A44] mb-3 group-hover:text-[#D8AFA0] transition-colors duration-300">Ansiedad</h3>
              <p class="text-base italic text-[#5D4A44]/60 mb-4 leading-relaxed">Cuando la mente no para y sientes que la preocupación te domina.</p>
              <p class="text-base text-[#5D4A44]/80 mb-5 leading-relaxed">Te acompaño a comprender lo que ocurre dentro de ti, a calmar tu mente y a recuperar la serenidad poco a poco.</p>
              <NuxtLink to="/sentirse/ansiedad" class="text-[#D8AFA0] inline-flex items-center gap-1 hover:gap-2 text-base font-semibold transition-all duration-300 group-hover:text-[#5D4A44]">
                Leer más 
                <span class="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Autoestima -->
          <div class="group p-8 bg-gradient-to-br from-white to-[#F9F7F3]/30 rounded-3xl shadow-[0_4px_20px_rgba(93,74,68,0.08)] hover:shadow-[0_8px_30px_rgba(93,74,68,0.15)] hover:-translate-y-2 transition-all duration-500 border border-[#EAD5D3]/40 backdrop-blur-sm animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards] relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-[#EAD5D3]/0 to-[#D8AFA0]/0 group-hover:from-[#EAD5D3]/5 group-hover:to-[#D8AFA0]/5 transition-all duration-500 rounded-3xl"></div>
            
            <div class="relative z-10">
              <h3 class="text-xl md:text-2xl font-serif text-[#5D4A44] mb-3 group-hover:text-[#D8AFA0] transition-colors duration-300">Autoestima</h3>
              <p class="text-base italic text-[#5D4A44]/60 mb-4 leading-relaxed">Cuando dudas de tu valor o sientes que no eres suficiente.</p>
              <p class="text-base text-[#5D4A44]/80 mb-5 leading-relaxed">Trabajamos juntos para fortalecer tu autoconfianza y aprender a mirarte con más amabilidad y respeto.</p>
              <NuxtLink to="/sentirse/autoestima" class="text-[#D8AFA0] inline-flex items-center gap-1 hover:gap-2 text-base font-semibold transition-all duration-300 group-hover:text-[#5D4A44]">
                Leer más 
                <span class="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Desánimo o tristeza -->
          <div class="group p-8 bg-gradient-to-br from-white to-[#F9F7F3]/30 rounded-3xl shadow-[0_4px_20px_rgba(93,74,68,0.08)] hover:shadow-[0_8px_30px_rgba(93,74,68,0.15)] hover:-translate-y-2 transition-all duration-500 border border-[#EAD5D3]/40 backdrop-blur-sm animate-fade-up opacity-0 [animation-delay:300ms] [animation-fill-mode:forwards] relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-[#EAD5D3]/0 to-[#D8AFA0]/0 group-hover:from-[#EAD5D3]/5 group-hover:to-[#D8AFA0]/5 transition-all duration-500 rounded-3xl"></div>
            
            <div class="relative z-10">
              <h3 class="text-xl md:text-2xl font-serif text-[#5D4A44] mb-3 group-hover:text-[#D8AFA0] transition-colors duration-300">Desánimo o tristeza</h3>
              <p class="text-base italic text-[#5D4A44]/60 mb-4 leading-relaxed">Cuando el cansancio emocional pesa más de lo habitual y sientes que nada te motiva.</p>
              <p class="text-base text-[#5D4A44]/80 mb-5 leading-relaxed">Desde un acompañamiento cercano y respetuoso, te ayudo a reconectar con tu energía vital y tus emociones.</p>
              <NuxtLink to="/sentirse/desanimo" class="text-[#D8AFA0] inline-flex items-center gap-1 hover:gap-2 text-base font-semibold transition-all duration-300 group-hover:text-[#5D4A44]">
                Leer más 
                <span class="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- 💞 Relaciones y vínculos -->
      <section class="mb-20">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-3">💞 Relaciones y vínculos</h2>
        <p class="text-[#5D4A44]/70 text-base md:text-lg mb-8">Cuando tus relaciones necesitan comprensión y reconstrucción.</p>
        
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Relaciones -->
          <div class="group p-8 bg-gradient-to-br from-white to-[#F9F7F3]/30 rounded-3xl shadow-[0_4px_20px_rgba(93,74,68,0.08)] hover:shadow-[0_8px_30px_rgba(93,74,68,0.15)] hover:-translate-y-2 transition-all duration-500 border border-[#EAD5D3]/40 backdrop-blur-sm animate-fade-up opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards] relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-[#EAD5D3]/0 to-[#D8AFA0]/0 group-hover:from-[#EAD5D3]/5 group-hover:to-[#D8AFA0]/5 transition-all duration-500 rounded-3xl"></div>
            
            <div class="relative z-10">
              <h3 class="text-xl md:text-2xl font-serif text-[#5D4A44] mb-3 group-hover:text-[#D8AFA0] transition-colors duration-300">Relaciones</h3>
              <p class="text-base italic text-[#5D4A44]/60 mb-4 leading-relaxed">Cuando tus vínculos se vuelven fuente de tensión o soledad.</p>
              <p class="text-base text-[#5D4A44]/80 mb-5 leading-relaxed">Te ayudo a comprender los patrones que se repiten y a construir relaciones más sanas, equilibradas y seguras.</p>
              <NuxtLink to="/sentirse/relaciones" class="text-[#D8AFA0] inline-flex items-center gap-1 hover:gap-2 text-base font-semibold transition-all duration-300 group-hover:text-[#5D4A44]">
                Leer más 
                <span class="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Psicoterapia de pareja -->
          <div class="group p-8 bg-gradient-to-br from-white to-[#F9F7F3]/30 rounded-3xl shadow-[0_4px_20px_rgba(93,74,68,0.08)] hover:shadow-[0_8px_30px_rgba(93,74,68,0.15)] hover:-translate-y-2 transition-all duration-500 border border-[#EAD5D3]/40 backdrop-blur-sm animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards] relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-[#EAD5D3]/0 to-[#D8AFA0]/0 group-hover:from-[#EAD5D3]/5 group-hover:to-[#D8AFA0]/5 transition-all duration-500 rounded-3xl"></div>
            
            <div class="relative z-10">
              <h3 class="text-xl md:text-2xl font-serif text-[#5D4A44] mb-3 group-hover:text-[#D8AFA0] transition-colors duration-300">Psicoterapia de pareja</h3>
              <p class="text-base italic text-[#5D4A44]/60 mb-4 leading-relaxed">Cuando sienten que algo se ha perdido entre ustedes, pero aún quieren entenderse.</p>
              <p class="text-base text-[#5D4A44]/80 mb-5 leading-relaxed">Acompañamiento conjunto para reconstruir la comunicación, recuperar la conexión emocional y fortalecer el vínculo.</p>
              <NuxtLink to="/sentirse/pareja" class="text-[#D8AFA0] inline-flex items-center gap-1 hover:gap-2 text-base font-semibold transition-all duration-300 group-hover:text-[#5D4A44]">
                Leer más 
                <span class="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- 🕊️ Pérdida y transición -->
      <section class="mb-20">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-3">🕊️ Pérdida y transición</h2>
        <p class="text-[#5D4A44]/70 text-base md:text-lg mb-8">Cuando enfrentas cambios profundos y necesitas acompañamiento en el proceso.</p>
        
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Duelo -->
          <div class="group p-8 bg-gradient-to-br from-white to-[#F9F7F3]/30 rounded-3xl shadow-[0_4px_20px_rgba(93,74,68,0.08)] hover:shadow-[0_8px_30px_rgba(93,74,68,0.15)] hover:-translate-y-2 transition-all duration-500 border border-[#EAD5D3]/40 backdrop-blur-sm animate-fade-up opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards] relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-[#EAD5D3]/0 to-[#D8AFA0]/0 group-hover:from-[#EAD5D3]/5 group-hover:to-[#D8AFA0]/5 transition-all duration-500 rounded-3xl"></div>
            
            <div class="relative z-10">
              <h3 class="text-xl md:text-2xl font-serif text-[#5D4A44] mb-3 group-hover:text-[#D8AFA0] transition-colors duration-300">Duelo</h3>
              <p class="text-base italic text-[#5D4A44]/60 mb-4 leading-relaxed">Cuando has perdido a alguien o algo importante y no sabes cómo seguir adelante.</p>
              <p class="text-base text-[#5D4A44]/80 mb-5 leading-relaxed">Te ofrezco un espacio seguro y humano para expresar el dolor y encontrar sentido en el proceso de despedida.</p>
              <NuxtLink to="/sentirse/duelo" class="text-[#D8AFA0] inline-flex items-center gap-1 hover:gap-2 text-base font-semibold transition-all duration-300 group-hover:text-[#5D4A44]">
                Leer más 
                <span class="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Crisis vital -->
          <div class="group p-8 bg-gradient-to-br from-white to-[#F9F7F3]/30 rounded-3xl shadow-[0_4px_20px_rgba(93,74,68,0.08)] hover:shadow-[0_8px_30px_rgba(93,74,68,0.15)] hover:-translate-y-2 transition-all duration-500 border border-[#EAD5D3]/40 backdrop-blur-sm animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards] relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-[#EAD5D3]/0 to-[#D8AFA0]/0 group-hover:from-[#EAD5D3]/5 group-hover:to-[#D8AFA0]/5 transition-all duration-500 rounded-3xl"></div>
            
            <div class="relative z-10">
              <h3 class="text-xl md:text-2xl font-serif text-[#5D4A44] mb-3 group-hover:text-[#D8AFA0] transition-colors duration-300">Crisis vital</h3>
              <p class="text-base italic text-[#5D4A44]/60 mb-4 leading-relaxed">Cuando una etapa termina y te sientes sin dirección ni propósito.</p>
              <p class="text-base text-[#5D4A44]/80 mb-5 leading-relaxed">A través de la psicoterapia te acompaño a explorar tus emociones y a construir un nuevo equilibrio interno.</p>
              <NuxtLink to="/sentirse/crisis-vital" class="text-[#D8AFA0] inline-flex items-center gap-1 hover:gap-2 text-base font-semibold transition-all duration-300 group-hover:text-[#5D4A44]">
                Leer más 
                <span class="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- 🌍 Identidad y cambio -->
      <section class="mb-20">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-3">🌍 Identidad y cambio</h2>
        <p class="text-[#5D4A44]/70 text-base md:text-lg mb-8">Cuando buscas reconectar con quién eres o adaptarte a nuevos contextos.</p>
        
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Migración -->
          <div class="group p-8 bg-gradient-to-br from-white to-[#F9F7F3]/30 rounded-3xl shadow-[0_4px_20px_rgba(93,74,68,0.08)] hover:shadow-[0_8px_30px_rgba(93,74,68,0.15)] hover:-translate-y-2 transition-all duration-500 border border-[#EAD5D3]/40 backdrop-blur-sm animate-fade-up opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards] relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-[#EAD5D3]/0 to-[#D8AFA0]/0 group-hover:from-[#EAD5D3]/5 group-hover:to-[#D8AFA0]/5 transition-all duration-500 rounded-3xl"></div>
            
            <div class="relative z-10">
              <h3 class="text-xl md:text-2xl font-serif text-[#5D4A44] mb-3 group-hover:text-[#D8AFA0] transition-colors duration-300">Migración</h3>
              <p class="text-base italic text-[#5D4A44]/60 mb-4 leading-relaxed">Cuando estar lejos de casa también te aleja de ti mismo.</p>
              <p class="text-base text-[#5D4A44]/80 mb-5 leading-relaxed">Acompaño tu proceso de adaptación emocional, ayudándote a reconectar con tus raíces y sentirte en casa de nuevo.</p>
              <NuxtLink to="/sentirse/migracion" class="text-[#D8AFA0] inline-flex items-center gap-1 hover:gap-2 text-base font-semibold transition-all duration-300 group-hover:text-[#5D4A44]">
                Leer más 
                <span class="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Identidad y propósito -->
          <div class="group p-8 bg-gradient-to-br from-white to-[#F9F7F3]/30 rounded-3xl shadow-[0_4px_20px_rgba(93,74,68,0.08)] hover:shadow-[0_8px_30px_rgba(93,74,68,0.15)] hover:-translate-y-2 transition-all duration-500 border border-[#EAD5D3]/40 backdrop-blur-sm animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards] relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-[#EAD5D3]/0 to-[#D8AFA0]/0 group-hover:from-[#EAD5D3]/5 group-hover:to-[#D8AFA0]/5 transition-all duration-500 rounded-3xl"></div>
            
            <div class="relative z-10">
              <h3 class="text-xl md:text-2xl font-serif text-[#5D4A44] mb-3 group-hover:text-[#D8AFA0] transition-colors duration-300">Identidad y propósito</h3>
              <p class="text-base italic text-[#5D4A44]/60 mb-4 leading-relaxed">Cuando sientes que has perdido el rumbo o no sabes muy bien quién eres.</p>
              <p class="text-base text-[#5D4A44]/80 mb-5 leading-relaxed">Trabajamos en tu autoconocimiento y propósito vital para que puedas reencontrarte con tu esencia.</p>
              <NuxtLink to="/sentirse/identidad" class="text-[#D8AFA0] inline-flex items-center gap-1 hover:gap-2 text-base font-semibold transition-all duration-300 group-hover:text-[#5D4A44]">
                Leer más 
                <span class="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- ✨ Crecimiento y desarrollo -->
      <section class="mb-20">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-3">✨ Crecimiento y desarrollo</h2>
        <p class="text-[#5D4A44]/70 text-base md:text-lg mb-8">Espacios de acompañamiento para escucharte, comprenderte y cuidarte.</p>
        
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Psicoterapia individual -->
          <div class="group p-8 bg-gradient-to-br from-white to-[#F9F7F3]/30 rounded-3xl shadow-[0_4px_20px_rgba(93,74,68,0.08)] hover:shadow-[0_8px_30px_rgba(93,74,68,0.15)] hover:-translate-y-2 transition-all duration-500 border border-[#EAD5D3]/40 backdrop-blur-sm animate-fade-up opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards] relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-[#EAD5D3]/0 to-[#D8AFA0]/0 group-hover:from-[#EAD5D3]/5 group-hover:to-[#D8AFA0]/5 transition-all duration-500 rounded-3xl"></div>
            
            <div class="relative z-10">
              <h3 class="text-xl md:text-2xl font-serif text-[#5D4A44] mb-3 group-hover:text-[#D8AFA0] transition-colors duration-300">Psicoterapia individual</h3>
              <p class="text-base italic text-[#5D4A44]/60 mb-4 leading-relaxed">Un espacio para escucharte, comprenderte y cuidarte.</p>
              <p class="text-base text-[#5D4A44]/80 mb-5 leading-relaxed">Te acompaño en tu proceso de autoconocimiento y bienestar emocional, desde una escucha cálida y sin juicios.</p>
              <NuxtLink to="/sentirse/individual" class="text-[#D8AFA0] inline-flex items-center gap-1 hover:gap-2 text-base font-semibold transition-all duration-300 group-hover:text-[#5D4A44]">
                Leer más 
                <span class="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Psicoterapia para adolescentes -->
          <div class="group p-8 bg-gradient-to-br from-white to-[#F9F7F3]/30 rounded-3xl shadow-[0_4px_20px_rgba(93,74,68,0.08)] hover:shadow-[0_8px_30px_rgba(93,74,68,0.15)] hover:-translate-y-2 transition-all duration-500 border border-[#EAD5D3]/40 backdrop-blur-sm animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards] relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-[#EAD5D3]/0 to-[#D8AFA0]/0 group-hover:from-[#EAD5D3]/5 group-hover:to-[#D8AFA0]/5 transition-all duration-500 rounded-3xl"></div>
            
            <div class="relative z-10">
              <h3 class="text-xl md:text-2xl font-serif text-[#5D4A44] mb-3 group-hover:text-[#D8AFA0] transition-colors duration-300">Psicoterapia para adolescentes</h3>
              <p class="text-base italic text-[#5D4A44]/60 mb-4 leading-relaxed">Cuando las emociones, los cambios o la presión social se vuelven demasiado intensos.</p>
              <p class="text-base text-[#5D4A44]/80 mb-5 leading-relaxed">Ofrezco un espacio seguro donde puedan expresarse libremente, comprender lo que sienten y desarrollar confianza en sí mismos.</p>
              <NuxtLink to="/sentirse/adolescentes" class="text-[#D8AFA0] inline-flex items-center gap-1 hover:gap-2 text-base font-semibold transition-all duration-300 group-hover:text-[#5D4A44]">
                Leer más 
                <span class="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- Closing CTA -->
      <div class="text-center mt-20 bg-white/50 backdrop-blur-sm rounded-3xl p-10 md:p-14 border border-[#EAD5D3]/30">
        <p class="text-[#5D4A44]/80 text-lg md:text-xl mb-6 max-w-2xl mx-auto leading-relaxed">
          Si no sabes exactamente por dónde empezar, no te preocupes. Hablarlo puede ser el primer paso hacia el alivio.
        </p>
        <CalmButton 
          to="https://calendly.com/psicologakarem/sesion-de-evaluacion?month=2025-10"
          size="lg"
          aria-label="Reservar sesión de orientación gratuita"
        >
          Reserva tu sesión de orientación gratuita
        </CalmButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useVisitorContext } from '@/composables/useVisitorContext'

const { personalized } = useVisitorContext()

useHead({
  title: 'Terapia Psicológica en Ciempozuelos | Ansiedad, Autoestima y Relaciones – Karem Peña',
  meta: [
    { 
      name: 'description', 
      content: 'Psicoterapia empática para ansiedad, autoestima, pareja y duelo. Encuentra en Ciempozuelos un espacio seguro para sanar y crecer. Acompañamiento individualizado.' 
    },
    { name: 'keywords', content: 'psicóloga ansiedad Ciempozuelos, terapia de pareja, psicología autoestima, duelo, terapia migración Madrid Sur' },
    { property: 'og:title', content: 'Terapia Psicológica en Ciempozuelos | Ansiedad, Autoestima y Relaciones' },
    { property: 'og:description', content: 'Psicoterapia empática para ansiedad, autoestima, pareja y duelo. Espacio seguro en Ciempozuelos.' },
    { property: 'og:url', content: 'https://psicologakarem.com/sentirse' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: 'Terapia Psicológica en Ciempozuelos | Ansiedad, Autoestima y Relaciones' },
    { name: 'twitter:description', content: 'Psicoterapia empática para ansiedad, autoestima, pareja y duelo. Espacio seguro en Ciempozuelos.' }
  ],
  link: [
    { rel: 'canonical', href: 'https://psicologakarem.com/sentirse' }
  ]
})
</script>
