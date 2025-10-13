<template>
  <div>
    <!-- Greeting Modal for First-Time Visitors -->
    <GreetingModal />

    <!-- Personalized Hero Section -->
    <PersonalizedHero />

    <!-- Emotionally Empathetic "How I Can Help" Section -->
    <section class="bg-[#F9F7F3] py-16 px-6 md:px-12 lg:px-20 text-center">
      <div class="max-w-7xl mx-auto">
        <!-- Section Title -->
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44]">
          {{ personalized(
            'Acompaño diferentes procesos emocionales, quizás te reconozcas en alguno de ellos.',
            '{name}, acompaño diferentes procesos emocionales. Quizás te reconozcas en alguno de ellos.'
          ) }}
        </h2>
        
        <!-- Intro Paragraph -->
        <p class="text-[#5D4A44]/80 max-w-2xl mx-auto mt-3 text-base md:text-lg">
          No importa en qué punto te encuentres, este espacio está pensado para ayudarte a entender lo que sientes y dar el primer paso hacia tu bienestar.
        </p>

        <!-- Cards Grid -->
        <div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          <!-- Ansiedad Card -->
          <NuxtLink 
            to="/sentirse/ansiedad" 
            class="block p-6 bg-white rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#EAD5D3]/30 animate-fade-up opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards]"
            aria-label="Información sobre acompañamiento en ansiedad"
          >
            <h3 class="text-lg font-serif text-[#5D4A44] leading-tight">
              Cuando la mente no para y la preocupación te acompaña a todas partes.
            </h3>
            <p class="text-sm text-[#5D4A44]/80 mt-3">
              Te ayudo a comprender tu ansiedad y a recuperar la calma que tu cuerpo y tu mente necesitan.
            </p>
          </NuxtLink>

          <!-- Autoestima Card -->
          <NuxtLink 
            to="/sentirse/autoestima" 
            class="block p-6 bg-white rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#EAD5D3]/30 animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]"
            aria-label="Información sobre acompañamiento en autoestima"
          >
            <h3 class="text-lg font-serif text-[#5D4A44] leading-tight">
              Cuando dudas de tu valor o sientes que no eres suficiente.
            </h3>
            <p class="text-sm text-[#5D4A44]/80 mt-3">
              Te acompaño a reconectar con tu confianza y tu valor personal, aprendiendo a tratarte con más compasión.
            </p>
          </NuxtLink>

          <!-- Relaciones Card -->
          <NuxtLink 
            to="/sentirse/relaciones" 
            class="block p-6 bg-white rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#EAD5D3]/30 animate-fade-up opacity-0 [animation-delay:300ms] [animation-fill-mode:forwards]"
            aria-label="Información sobre acompañamiento en relaciones"
          >
            <h3 class="text-lg font-serif text-[#5D4A44] leading-tight">
              Cuando tus vínculos se vuelven una fuente de estrés en lugar de apoyo.
            </h3>
            <p class="text-sm text-[#5D4A44]/80 mt-3">
              Juntos exploramos cómo construir relaciones más sanas, desde el respeto y la comunicación.
            </p>
          </NuxtLink>

          <!-- Duelo Card -->
          <NuxtLink 
            to="/sentirse/duelo" 
            class="block p-6 bg-white rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#EAD5D3]/30 animate-fade-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]"
            aria-label="Información sobre acompañamiento en duelo"
          >
            <h3 class="text-lg font-serif text-[#5D4A44] leading-tight">
              Cuando una pérdida deja un vacío que cuesta comprender.
            </h3>
            <p class="text-sm text-[#5D4A44]/80 mt-3">
              Te ofrezco un espacio seguro para procesar el dolor y transformar la ausencia en significado.
            </p>
          </NuxtLink>

          <!-- Migración Card -->
          <NuxtLink 
            to="/sentirse/migracion" 
            class="block p-6 bg-white rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#EAD5D3]/30 animate-fade-up opacity-0 [animation-delay:500ms] [animation-fill-mode:forwards]"
            aria-label="Información sobre acompañamiento en procesos migratorios"
          >
            <h3 class="text-lg font-serif text-[#5D4A44] leading-tight">
              Cuando estás lejos de casa y sientes que una parte de ti también se quedó allí.
            </h3>
            <p class="text-sm text-[#5D4A44]/80 mt-3">
              Te acompaño a adaptarte a tu nueva etapa, reconectando con tus raíces y tu identidad.
            </p>
          </NuxtLink>

          <!-- Explora más Card -->
          <NuxtLink 
            to="/sentirse" 
            class="block p-6 bg-gradient-to-br from-[#EAD5D3]/20 to-[#D8AFA0]/10 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-2 border-[#D8AFA0]/40 animate-fade-up opacity-0 [animation-delay:600ms] [animation-fill-mode:forwards]"
            aria-label="Explorar más áreas de acompañamiento"
          >
            <h3 class="text-lg font-serif text-[#5D4A44] leading-tight">
              Explora otras formas en las que puedo acompañarte.
            </h3>
            <p class="text-sm text-[#5D4A44]/80 mt-3">
              Descubre más sobre los procesos que trabajamos juntos y cómo empezar tu acompañamiento.
            </p>
          </NuxtLink>
        </div>

        <!-- Optional CTA Below Grid -->
        <div class="mt-12 animate-fade-up opacity-0 [animation-delay:700ms] [animation-fill-mode:forwards]">
          <p class="text-[#5D4A44]/70 text-sm mb-4">
            {{ personalized(
              'No siempre es fácil dar el primer paso, pero hablarlo puede ser el comienzo del alivio.',
              '{name}, no siempre es fácil dar el primer paso, pero hablarlo puede ser el comienzo del alivio.'
            ) }}
          </p>
          <CalmButton 
            to="https://calendly.com/psicologakarem/sesion-de-evaluacion?month=2025-10"
            variant="primary"
            size="lg"
            aria-label="Reservar sesión de orientación gratuita"
            @click="handleReservarClick"
          >
            {{ personalized('Reserva tu sesión de orientación gratuita', 'Reserva tu sesión de orientación, {name}') }}
          </CalmButton>
        </div>
      </div>
    </section>

    <!-- 3.0 – Conóceme (Mi Compromiso Contigo) -->
    <ConocemeSection />

    <!-- Testimonios (Prueba Social Cálida) -->
    <TestimoniosSection />

    <section class="section-padding bg-fondo">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-serif mb-6">Un espacio seguro para ti</h2>
        <p class="text-lg text-cafe/80 leading-relaxed mb-8">
          En mis sesiones encontrarás un ambiente cálido, confidencial y sin juicios. Trabajo desde un enfoque humanista e integrador, adaptando cada proceso a tus necesidades únicas.
        </p>
        <NuxtLink to="/conoceme" class="text-terracota hover:text-cafe transition font-semibold">
          Descubre más sobre mi forma de trabajar →
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useVisitorContext } from '@/composables/useVisitorContext'
import ConocemeSection from '@/components/ConocemeSection.vue'

const { personalized } = useVisitorContext()
const { trackBookingIntent } = useAnalytics()

// Función para trackear clic en reservar
const handleReservarClick = () => {
  trackBookingIntent('orientacion_gratuita_home')
}

useHead({
  title: 'Psicóloga en Ciempozuelos | Terapia para Ansiedad y Bienestar Emocional',
  meta: [
    { 
      name: 'description', 
      content: 'Recupera tu calma con un acompañamiento cálido y profesional. Terapia individual, de pareja y para autoestima en Ciempozuelos. Primera orientación gratuita.' 
    },
    { name: 'keywords', content: 'psicóloga Ciempozuelos, terapia ansiedad Madrid Sur, psicología emocional, terapia individual Ciempozuelos' },
    { property: 'og:title', content: 'Psicóloga en Ciempozuelos | Terapia para Ansiedad y Bienestar Emocional' },
    { property: 'og:description', content: 'Recupera tu calma con un acompañamiento cálido y profesional. Terapia individual, de pareja y para autoestima en Ciempozuelos.' },
    { property: 'og:url', content: 'https://psicologakarem.com' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: 'Psicóloga en Ciempozuelos | Terapia para Ansiedad y Bienestar Emocional' },
    { name: 'twitter:description', content: 'Recupera tu calma con un acompañamiento cálido y profesional. Terapia individual, de pareja y para autoestima en Ciempozuelos.' }
  ],
  link: [
    { rel: 'canonical', href: 'https://psicologakarem.com' }
  ]
})
</script>
