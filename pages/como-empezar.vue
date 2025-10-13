<template>
  <div class="min-h-screen bg-[#F9F7F3]">
    <!-- Hero Section - Personalized Greeting -->
    <section class="text-center py-16 md:py-20 px-6">
      <h1 class="text-4xl md:text-5xl font-serif text-[#5D4A44] animate-fade-in-up max-w-4xl mx-auto leading-tight">
        {{ visitorName 
          ? `${visitorName}, este puede ser el comienzo de tu proceso.` 
          : 'Este puede ser el comienzo de tu proceso.' }}
      </h1>
      <p class="text-lg md:text-xl text-[#5D4A44]/80 mt-6 max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:0.3s]">
        Dar el primer paso puede generar dudas, y eso es completamente normal.  
        Aquí encontrarás una explicación clara y cercana de cómo funciona el acompañamiento, para que puedas sentirte tranquilo/a antes de empezar.
      </p>
    </section>

    <!-- Step Section - How Your Process Begins -->
    <section class="mt-8 md:mt-16 max-w-6xl mx-auto px-6 md:px-12 pb-16">
      <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] text-center mb-12 animate-fade-in-up">
        Cómo empieza tu proceso
      </h2>
      
      <div class="grid md:grid-cols-3 gap-8 text-center">
        <!-- Step 1 -->
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-[#EAD5D3]/30 hover:shadow-md transition-all duration-500 animate-fade-in-up">
          <span class="text-4xl font-serif text-[#D8AFA0] mb-4 block">1</span>
          <h3 class="text-xl font-serif text-[#5D4A44] mb-4">Sesión de orientación gratuita</h3>
          <p class="text-base text-[#5D4A44]/80 leading-relaxed">
            {{ visitorName 
              ? `${visitorName}, esta primera conversación es para escucharte y resolver tus dudas.` 
              : 'Una primera conversación para escucharte y resolver tus dudas.' }}
            No hay compromiso: es un espacio para conocernos y orientarte sobre el proceso más adecuado para ti.
          </p>
        </div>

        <!-- Step 2 -->
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-[#EAD5D3]/30 hover:shadow-md transition-all duration-500 animate-fade-in-up [animation-delay:0.2s]">
          <span class="text-4xl font-serif text-[#D8AFA0] mb-4 block">2</span>
          <h3 class="text-xl font-serif text-[#5D4A44] mb-4">Inicio del acompañamiento</h3>
          <p class="text-base text-[#5D4A44]/80 leading-relaxed">
            Si decides continuar, fijaremos un día y hora para comenzar tus sesiones.  
            Cada encuentro tiene una duración aproximada de 50 minutos y se adapta a tu ritmo y necesidades.
          </p>
        </div>

        <!-- Step 3 -->
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-[#EAD5D3]/30 hover:shadow-md transition-all duration-500 animate-fade-in-up [animation-delay:0.4s]">
          <span class="text-4xl font-serif text-[#D8AFA0] mb-4 block">3</span>
          <h3 class="text-xl font-serif text-[#5D4A44] mb-4">Proceso terapéutico</h3>
          <p class="text-base text-[#5D4A44]/80 leading-relaxed">
            A lo largo del acompañamiento, trabajaremos juntos para comprender lo que sientes, identificar tus recursos y avanzar hacia tu bienestar emocional.
          </p>
        </div>
      </div>
    </section>

    <!-- Emotional Section - What to Expect -->
    <section class="mt-12 md:mt-20 bg-white/50 py-16 md:py-20 px-6 rounded-none md:rounded-3xl animate-fade-in-up">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-8">
          {{ visitorName 
            ? `${visitorName}, esto es lo que puedes esperar durante tu proceso terapéutico:` 
            : 'Esto es lo que puedes esperar durante tu proceso terapéutico:' }}
        </h2>
        <ul class="text-[#5D4A44]/80 text-base md:text-lg space-y-4 text-left max-w-2xl mx-auto">
          <li class="flex items-start gap-4">
            <span class="text-2xl flex-shrink-0">🪶</span>
            <span class="leading-relaxed">Un espacio seguro, confidencial y sin juicios.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="text-2xl flex-shrink-0">🌿</span>
            <span class="leading-relaxed">Un ritmo adaptado a tus necesidades y tu historia.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="text-2xl flex-shrink-0">💬</span>
            <span class="leading-relaxed">Una escucha activa y empática en cada sesión.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="text-2xl flex-shrink-0">💡</span>
            <span class="leading-relaxed">Herramientas para comprender y gestionar tus emociones.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="text-2xl flex-shrink-0">🤍</span>
            <span class="leading-relaxed">Un acompañamiento humano, con base científica y ética profesional.</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- Inversión en tu bienestar -->
    <InversionSection />

    <!-- FAQ Section -->
    <section class="mt-16 md:mt-20 max-w-4xl mx-auto px-6 md:px-12 pb-16">
      <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] text-center mb-12">Preguntas frecuentes</h2>
      
      <div class="space-y-6">
        <details class="bg-white rounded-3xl shadow-sm border border-[#EAD5D3]/30 p-6 md:p-8 group hover:shadow-md transition-shadow duration-300">
          <summary class="font-medium text-lg text-[#5D4A44] cursor-pointer list-none flex items-center justify-between">
            <span>¿Cuánto dura el proceso terapéutico?</span>
            <span class="text-[#D8AFA0] text-2xl group-open:rotate-45 transition-transform duration-300">+</span>
          </summary>
          <p class="text-base text-[#5D4A44]/80 mt-4 leading-relaxed">
            Cada proceso es único. Algunas personas acuden unas semanas, otras varios meses. Lo importante es avanzar a tu ritmo y en función de tus objetivos.
          </p>
        </details>

        <details class="bg-white rounded-3xl shadow-sm border border-[#EAD5D3]/30 p-6 md:p-8 group hover:shadow-md transition-shadow duration-300">
          <summary class="font-medium text-lg text-[#5D4A44] cursor-pointer list-none flex items-center justify-between">
            <span>¿Las sesiones son online o presenciales?</span>
            <span class="text-[#D8AFA0] text-2xl group-open:rotate-45 transition-transform duration-300">+</span>
          </summary>
          <p class="text-base text-[#5D4A44]/80 mt-4 leading-relaxed">
            Puedes elegir entre sesiones presenciales en Ciempozuelos o sesiones online.  
            Ambos formatos mantienen la misma cercanía y confidencialidad.
          </p>
        </details>

        <details class="bg-white rounded-3xl shadow-sm border border-[#EAD5D3]/30 p-6 md:p-8 group hover:shadow-md transition-shadow duration-300">
          <summary class="font-medium text-lg text-[#5D4A44] cursor-pointer list-none flex items-center justify-between">
            <span>¿Qué pasa si tengo dudas o necesito pausar el proceso?</span>
            <span class="text-[#D8AFA0] text-2xl group-open:rotate-45 transition-transform duration-300">+</span>
          </summary>
          <p class="text-base text-[#5D4A44]/80 mt-4 leading-relaxed">
            Es completamente válido. El proceso terapéutico se adapta a ti, y puedes pausar o ajustar las sesiones cuando lo necesites.
          </p>
        </details>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="text-center mt-16 md:mt-20 pb-20 px-6">
      <p class="text-lg md:text-xl text-[#5D4A44]/80 mb-8 animate-fade-in-up max-w-2xl mx-auto leading-relaxed">
        {{ visitorName 
          ? `${visitorName}, si sientes que ha llegado el momento, este puede ser tu primer paso.` 
          : 'Si sientes que ha llegado el momento, este puede ser tu primer paso.' }}
      </p>
      <CalmButton 
        to="/reservar?from=como-empezar" 
        variant="primary" 
        size="lg"
        aria-label="Reserva tu sesión de orientación gratuita"
      >
        Reserva tu sesión de orientación gratuita
      </CalmButton>
      
      <p class="text-sm text-[#5D4A44]/60 mt-6">
        Sin compromiso · 15-20 minutos · Totalmente confidencial
      </p>
    </section>
  </div>
</template>

<script setup>
import { useVisitorContext } from '@/composables/useVisitorContext'

const { visitorName } = useVisitorContext()

useHead({
  title: 'Empezar Terapia en Ciempozuelos | Primera Orientación Gratuita – Karem Peña',
  meta: [
    { 
      name: 'description', 
      content: 'Descubre cómo iniciar tu proceso terapéutico con Karem Peña en Ciempozuelos. Llamada gratuita, opciones online y presencial, precios claros y flexibles.' 
    },
    { name: 'keywords', content: 'primera sesión psicóloga Ciempozuelos, terapia online Madrid Sur, orientación gratuita, empezar terapia' },
    { property: 'og:title', content: 'Empezar Terapia en Ciempozuelos | Primera Orientación Gratuita' },
    { property: 'og:description', content: 'Descubre cómo iniciar tu proceso terapéutico. Llamada gratuita, opciones online y presencial en Ciempozuelos.' },
    { property: 'og:url', content: 'https://psicologakarem.com/como-empezar' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: 'Empezar Terapia en Ciempozuelos | Primera Orientación Gratuita' },
    { name: 'twitter:description', content: 'Descubre cómo iniciar tu proceso terapéutico. Llamada gratuita, opciones online y presencial en Ciempozuelos.' }
  ],
  link: [
    { rel: 'canonical', href: 'https://psicologakarem.com/como-empezar' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '¿Cuánto dura el proceso terapéutico?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Cada proceso es único. Algunas personas acuden unas semanas, otras varios meses. Lo importante es avanzar a tu ritmo y en función de tus objetivos.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Las sesiones son online o presenciales?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Puedes elegir entre sesiones presenciales en Ciempozuelos o sesiones online. Ambos formatos mantienen la misma cercanía y confidencialidad.'
            }
          },
          {
            '@type': 'Question',
            name: '¿Qué pasa si tengo dudas o necesito pausar el proceso?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Es completamente válido. El proceso terapéutico se adapta a ti, y puedes pausar o ajustar las sesiones cuando lo necesites.'
            }
          }
        ]
      })
    }
  ]
})
</script>

<style scoped>
/* Ensure smooth details/summary transitions */
details summary::-webkit-details-marker {
  display: none;
}
</style>
