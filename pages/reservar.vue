<template>
  <div class="min-h-screen bg-[#F9F7F3]">
    <!-- Hero Principal -->
    <section class="text-center py-16 md:py-20 px-6 relative">
      <div class="content-width">
        <h1 class="hero-title mb-6 animate-fade-in-up">
          Reserva tu sesión de orientación gratuita
        </h1>
        <p class="lead-text mb-10 prose-optimal animate-fade-in-up [animation-delay:0.2s]">
          La primera sesión es una conversación de orientación de 15–20 minutos donde podrás contarme tu situación y conocer cómo trabajamos. Es gratuita y sin compromiso.
        </p>
        
        <!-- CTA doble -->
        <div class="flex flex-col md:flex-row gap-4 justify-center items-center animate-fade-in-up [animation-delay:0.4s]">
          <CalmButton 
            variant="primary" 
            size="lg"
            aria-label="Reservar sesión de orientación en Calendly"
            @click="handleCalendlyClick"
          >
            <a 
              href="https://calendly.com/psicologakarem/sesion-de-evaluacion"
              target="_blank"
              rel="noopener noreferrer"
              class="block w-full h-full"
            >
              🗓️ Reservar sesión de orientación
            </a>
          </CalmButton>
          <CalmButton 
            variant="whatsapp" 
            size="lg"
            aria-label="Contactar por WhatsApp para resolver dudas"
            @click="handleWhatsAppClick"
          >
            <a 
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="block w-full h-full"
            >
              💬 ¿Tienes dudas? Escríbeme
            </a>
          </CalmButton>
        </div>
      </div>
    </section>

    <!-- Bloque 1: ¿Qué es la sesión de orientación? -->
    <section class="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <div class="bg-[#EAD5D3] rounded-2xl shadow-md p-8 md:p-12 animate-fade-in-up">
        <h2 class="section-title mb-6 text-center">
          ¿Qué es la sesión de orientación?
        </h2>
        <div class="content-width space-y-6">
          <p class="body-text text-center">
            Es una <strong>conversación breve de 15–20 minutos</strong> donde podrás:
          </p>
          
          <div class="grid md:grid-cols-2 gap-4 md:gap-6 mt-8">
            <div class="bg-white/50 rounded-xl p-5 md:p-6 backdrop-blur-sm">
              <div class="text-2xl md:text-3xl mb-2 md:mb-3">🗣️</div>
              <h3 class="font-serif text-lg md:text-xl font-medium text-[#5D4A44] mb-2">Contarme tu situación</h3>
              <p class="microcopy">
                Un espacio seguro para compartir lo que te está pasando, sin prisas ni juicios.
              </p>
            </div>

            <div class="bg-white/50 rounded-xl p-5 md:p-6 backdrop-blur-sm">
              <div class="text-2xl md:text-3xl mb-2 md:mb-3">🤝</div>
              <h3 class="font-serif text-lg md:text-xl font-medium text-[#5D4A44] mb-2">Conocer cómo trabajo</h3>
              <p class="microcopy">
                Te explico mi forma de acompañar y resuelvo todas tus dudas sobre el proceso.
              </p>
            </div>

            <div class="bg-white/50 rounded-xl p-5 md:p-6 backdrop-blur-sm">
              <div class="text-2xl md:text-3xl mb-2 md:mb-3">🎯</div>
              <h3 class="font-serif text-lg md:text-xl font-medium text-[#5D4A44] mb-2">Evaluar si encajamos</h3>
              <p class="microcopy">
                Es importante que te sientas cómodo/a. Esta sesión nos ayuda a ambos a saberlo.
              </p>
            </div>

            <div class="bg-white/50 rounded-xl p-5 md:p-6 backdrop-blur-sm">
              <div class="text-2xl md:text-3xl mb-2 md:mb-3">✨</div>
              <h3 class="font-serif text-lg md:text-xl font-medium text-[#5D4A44] mb-2">Sin compromiso</h3>
              <p class="microcopy">
                Es gratuita y no implica ningún compromiso de continuar. Tú decides.
              </p>
            </div>
          </div>

          <div class="text-center mt-10">
            <CalmButton 
              variant="primary" 
              size="lg"
              aria-label="Reservar ahora en Calendly"
              @click="handleCalendlyClick"
            >
              <a 
                href="https://calendly.com/psicologakarem/sesion-de-evaluacion"
                target="_blank"
                rel="noopener noreferrer"
                class="block w-full h-full"
              >
                📅 Reservar ahora
              </a>
            </CalmButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Bloque 2: Horarios y modalidad -->
    <section class="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <div class="text-center mb-10">
        <h2 class="section-title mb-4">
          Horarios y modalidad
        </h2>
        <p class="body-text content-width">
          Estoy disponible de <strong>lunes a viernes, entre 11:00–14:00 y 18:00–22:00</strong>.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div class="bg-white rounded-2xl shadow-md p-8 text-center">
          <div class="text-4xl mb-4">💻</div>
          <h3 class="card-title mb-3">Sesión Online</h3>
          <p class="body-text">
            Por videollamada, desde la comodidad de tu espacio. Flexible y accesible desde cualquier lugar.
          </p>
        </div>

        <div class="bg-white rounded-2xl shadow-md p-8 text-center">
          <div class="text-4xl mb-4">🏢</div>
          <h3 class="card-title mb-3">Sesión Presencial</h3>
          <p class="body-text">
            En consulta ubicada en Ciempozuelos, Madrid Sur. Un espacio tranquilo y acogedor.
          </p>
        </div>
      </div>

      <div class="text-center mt-10">
        <p class="body-text mb-4">¿No estás seguro/a de cuál elegir?</p>
        <CalmButton 
          variant="whatsapp" 
          size="md"
          aria-label="Consultar por WhatsApp"
          @click="handleWhatsAppConsulta"
        >
          <a 
            :href="whatsappConsultaLink"
            target="_blank"
            rel="noopener noreferrer"
            class="block w-full h-full"
          >
            💬 Pregúntame por WhatsApp
          </a>
        </CalmButton>
      </div>
    </section>

    <!-- Bloque 3: Beneficios del acompañamiento -->
    <section class="max-w-5xl mx-auto px-6 py-12 md:py-20">
      <h2 class="section-title mb-12 text-center">
        Dar el paso te acerca a tu bienestar
      </h2>

      <div class="grid md:grid-cols-2 gap-8 mb-12">
        <div class="flex items-start space-x-4 animate-fade-in-up">
          <div class="text-3xl flex-shrink-0">🌿</div>
          <div>
            <h3 class="font-serif text-xl md:text-2xl font-medium text-[#5D4A44] mb-2">
              Espacio seguro y sin juicios
            </h3>
            <p class="body-text">
              Un lugar donde puedes ser tú mismo/a, sin máscaras ni expectativas.
            </p>
          </div>
        </div>

        <div class="flex items-start space-x-4 animate-fade-in-up [animation-delay:0.1s]">
          <div class="text-3xl flex-shrink-0">🤝</div>
          <div>
            <h3 class="font-serif text-xl md:text-2xl font-medium text-[#5D4A44] mb-2">
              Acompañamiento humano y profesional
            </h3>
            <p class="body-text">
              Combino la calidez humana con el rigor profesional de la psicología.
            </p>
          </div>
        </div>

        <div class="flex items-start space-x-4 animate-fade-in-up [animation-delay:0.2s]">
          <div class="text-3xl flex-shrink-0">🕊️</div>
          <div>
            <h3 class="font-serif text-xl md:text-2xl font-medium text-[#5D4A44] mb-2">
              Ritmo adaptado a ti
            </h3>
            <p class="body-text">
              Cada proceso es único. Avanzamos a tu ritmo, respetando tus tiempos.
            </p>
          </div>
        </div>

        <div class="flex items-start space-x-4 animate-fade-in-up [animation-delay:0.3s]">
          <div class="text-3xl flex-shrink-0">💬</div>
          <div>
            <h3 class="font-serif text-xl md:text-2xl font-medium text-[#5D4A44] mb-2">
              Comunicación directa y cercana
            </h3>
            <p class="body-text">
              Siempre disponible para acompañarte con cercanía y profesionalidad.
            </p>
          </div>
        </div>
      </div>

      <p class="quote-text text-center prose-optimal">
        "Tu bienestar comienza con un solo paso. Estoy aquí para acompañarte a darlo."
      </p>
    </section>

    <!-- Sección final de confianza -->
    <section class="bg-white/60 py-16 md:py-20 px-6">
      <div class="content-width text-center">
        <div class="text-5xl mb-6">🤍</div>
        <h2 class="section-title mb-6">
          Tu confianza es lo más importante
        </h2>
        <p class="body-text mb-6">
          Todas las sesiones se realizan bajo el marco de la <strong>confidencialidad profesional</strong>, 
          cumpliendo con el código deontológico del Col·legi Oficial de Psicologia de Catalunya (COPC).
        </p>
        <p class="body-text mb-10">
          Tu información y tu proceso estarán siempre protegidos.
        </p>

        <CalmButton 
          variant="primary" 
          size="lg"
          aria-label="Reservar sesión de orientación"
          @click="handleCalendlyClick"
        >
          <a 
            href="https://calendly.com/psicologakarem/sesion-de-evaluacion"
            target="_blank"
            rel="noopener noreferrer"
            class="block w-full h-full"
          >
            🗓️ Reservar mi sesión de orientación
          </a>
        </CalmButton>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'

const { trackBookingIntent, trackWhatsAppClick } = useAnalytics()

// Enlaces de WhatsApp
const whatsappLink = computed(() => {
  const baseUrl = 'https://wa.me/34722377290'
  const message = 'Hola Karem, tengo algunas dudas antes de reservar mi sesión de orientación.'
  return `${baseUrl}?text=${encodeURIComponent(message)}`
})

const whatsappConsultaLink = computed(() => {
  const baseUrl = 'https://wa.me/34722377290'
  const message = 'Hola Karem, quisiera consultarte sobre la modalidad de las sesiones.'
  return `${baseUrl}?text=${encodeURIComponent(message)}`
})

// Funciones de tracking
const handleCalendlyClick = () => {
  trackBookingIntent('calendly_sesion_orientacion')
}

const handleWhatsAppClick = () => {
  trackWhatsAppClick()
  trackBookingIntent('whatsapp_dudas_hero')
}

const handleWhatsAppConsulta = () => {
  trackWhatsAppClick()
  trackBookingIntent('whatsapp_consulta_modalidad')
}

// SEO y metadatos
useHead({
  title: 'Reservar sesión de orientación gratuita | Psicóloga Karem Peña en Ciempozuelos',
  meta: [
    { 
      name: 'description', 
      content: 'Reserva tu sesión de orientación gratuita de 15-20 minutos con Karem Peña, psicóloga en Ciempozuelos. Sin compromiso, online o presencial. Primer paso hacia tu bienestar.' 
    },
    {
      name: 'keywords',
      content: 'reservar sesión orientación psicóloga Ciempozuelos, primera sesión gratuita psicóloga, psicóloga online Madrid Sur, terapia Ciempozuelos'
    },
    // Open Graph
    { property: 'og:title', content: 'Reservar sesión de orientación gratuita - Psicóloga Karem Peña' },
    { property: 'og:description', content: 'Sesión de orientación gratuita de 15-20 minutos. Sin compromiso. Online o presencial en Ciempozuelos.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://psicologakarem.com/reservar' },
    // Twitter
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Reservar sesión de orientación gratuita' },
    { name: 'twitter:description', content: 'Primera sesión gratuita con Karem Peña, psicóloga en Ciempozuelos.' }
  ],
  link: [
    { rel: 'canonical', href: 'https://psicologakarem.com/reservar' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        name: 'Psicóloga Karem Peña',
        description: 'Sesión de orientación psicológica gratuita en Ciempozuelos',
        areaServed: 'Ciempozuelos, Madrid Sur',
        telephone: '+34 722 377 290',
        url: 'https://psicologakarem.com/reservar',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Ciempozuelos',
          addressRegion: 'Madrid',
          addressCountry: 'ES'
        },
        priceRange: 'Sesión de orientación gratuita',
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '11:00',
            closes: '14:00'
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '18:00',
            closes: '22:00'
          }
        ]
      })
    }
  ]
})
</script>

<style scoped>
/* Animaciones ya definidas en main.css */
</style>
