<template>
  <div class="bg-[#F9F7F3] min-h-screen py-16 px-6 md:px-12 lg:px-20">
    <div class="max-w-6xl mx-auto">
      
      <!-- 1️⃣ Header Section -->
      <div class="mb-8">
        <h1 class="text-4xl md:text-5xl font-serif mb-3 text-[#5D4A44]">Conóceme</h1>
        <p class="text-xl text-[#5D4A44]/70 italic">Mi compromiso contigo</p>
      </div>

      <!-- Two-column intro with image -->
      <div class="grid md:grid-cols-2 items-center gap-12 mt-12">
        <div class="animate-fade-in-up">
          <p class="text-lg text-[#5D4A44]/80 leading-relaxed mb-6">
            {{ personalized('Hola, me alegra que estés aquí.', 'Hola {name}, me alegra que estés aquí.') }}
          </p>
          <p class="text-lg text-[#5D4A44]/80 leading-relaxed mb-6">
            Sé que llegar a esta página no es un paso fácil. Requiere valentía buscar un espacio para entender lo que sientes, 
            y quiero que sepas que tu búsqueda es válida y muy importante.
          </p>
          <p class="text-lg text-[#5D4A44]/80 leading-relaxed">
            {{ personalized(
              'Mi nombre es Karem Peña, y mi propósito es ofrecerte un lugar seguro, un refugio donde puedas ser tú, sin juicios ni máscaras, para que juntos podamos ponerle palabras a tu malestar y encontrar el camino de vuelta a tu calma.',
              '{name}, mi propósito es ofrecerte un lugar seguro, un refugio donde puedas ser tú, sin juicios ni máscaras, para que juntos podamos ponerle palabras a tu malestar y encontrar el camino de vuelta a tu calma.'
            ) }}
          </p>
        </div>

        <div class="animate-fade-in-up [animation-delay:0.3s]">
          <img 
            src="/images/karem sentada.jpeg" 
            alt="Karem Peña Psicóloga" 
            class="rounded-3xl shadow-md w-full object-cover max-h-[480px]" 
          />
        </div>
      </div>

      <!-- 2️⃣ Story Section - Timeline -->
      <section class="mt-20 space-y-6">
        <h2 class="text-2xl md:text-3xl font-serif text-[#5D4A44] mb-8 text-center">
          {{ personalized('Mi Historia: El viaje que me trajo hasta ti', 'Mi Historia: El viaje que me trajo hasta ti, {name}') }}
        </h2>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-[#EAD5D3]/30 animate-fade-in-up [animation-delay:0.5s]">
          <h3 class="font-serif text-lg md:text-xl text-[#5D4A44] mb-2">2007 – Enfermería</h3>
          <p class="text-[#5D4A44]/80 text-sm md:text-base leading-relaxed">
            Ahí comprendí que el cuerpo sana, pero el alma también necesita cuidado. 
            Día tras día, cuidaba de las heridas físicas de mis pacientes, pero no podía dejar de ver otra clase de sufrimiento, 
            uno más silencioso: el dolor emocional que acompañaba a sus enfermedades.
          </p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-[#EAD5D3]/30 animate-fade-in-up [animation-delay:0.7s]">
          <h3 class="font-serif text-lg md:text-xl text-[#5D4A44] mb-2">2013 – Licenciatura en Psicología</h3>
          <p class="text-[#5D4A44]/80 text-sm md:text-base leading-relaxed">
            Decidí dedicarme a entender el sufrimiento emocional que acompaña tantas historias humanas. 
            Esa inquietud se convirtió en mi vocación, me llevó a dejar mi país, Venezuela, 
            y a sumergirme por completo en el estudio de la mente y las emociones.
          </p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-[#EAD5D3]/30 animate-fade-in-up [animation-delay:0.9s]">
          <h3 class="font-serif text-lg md:text-xl text-[#5D4A44] mb-2">2015 – Llegada a España</h3>
          <p class="text-[#5D4A44]/80 text-sm md:text-base leading-relaxed">
            Comenzó mi propio proceso migratorio, lleno de adaptación, empatía y aprendizaje emocional. 
            Entendí de primera mano los desafíos de reinventarse en un país nuevo, 
            y eso me permitió conectar más profundamente con las personas que atraviesan procesos similares.
          </p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-[#EAD5D3]/30 animate-fade-in-up [animation-delay:1.1s]">
          <h3 class="font-serif text-lg md:text-xl text-[#5D4A44] mb-2">Hoy – Psicóloga en Ciempozuelos y Online</h3>
          <p class="text-[#5D4A44]/80 text-sm md:text-base leading-relaxed">
            Acompaño a personas que, como tú, buscan comprenderse mejor y reencontrarse con la calma interior. 
            Mi formación incluye un Máster en Investigación por la UAM y especialización en Harvard, 
            pero lo que más me define es mi compromiso con cada historia que escucho.
          </p>
        </div>
      </section>

      <!-- 3️⃣ Commitment Section -->
      <section class="bg-white py-12 px-8 rounded-3xl mt-16 text-center shadow-sm border border-[#EAD5D3]/20">
        <blockquote class="text-xl md:text-2xl font-serif italic text-[#5D4A44]/90 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
          "Mi compromiso es ofrecerte un acompañamiento cálido, humano y sin juicios.  
          Un espacio donde puedas ser tú, con tus emociones y tu historia."
        </blockquote>
        <p class="text-sm text-[#5D4A44]/60 mt-4">— Karem Peña</p>
      </section>

      <!-- 4️⃣ NEW - Professional Commitment Section -->
      <section class="mt-20 bg-gradient-to-br from-white to-[#F9F7F3]/30 rounded-3xl shadow-lg border border-[#EAD5D3]/40 overflow-hidden animate-fade-in-up [animation-delay:0.3s]">
        
        <!-- Header with Badge -->
        <div class="bg-gradient-to-r from-[#5D4A44] to-[#6B5650] text-white text-center py-8 px-8 md:px-12">
          <h2 class="text-3xl md:text-4xl font-serif mb-3">
            Compromiso con la Psicología Profesional
          </h2>
          <div class="flex items-center justify-center gap-2 text-white/90">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p class="text-sm md:text-base font-medium tracking-wide">
              Psicóloga Colegiada COPC Nº 32005
            </p>
          </div>
        </div>

        <!-- Content -->
        <div class="p-8 md:p-12">
          <p class="text-[#5D4A44]/80 text-center mb-12 max-w-3xl mx-auto leading-relaxed text-base md:text-lg">
            Como psicóloga titulada y colegiada, mi práctica profesional está regulada por el 
            <strong class="text-[#5D4A44]">Col·legi Oficial de Psicologia de Catalunya</strong>, 
            garantizando tu seguridad y bienestar en cada sesión.
          </p>

          <!-- Three Column Layout -->
          <div class="grid md:grid-cols-3 gap-8 mb-10">

            <!-- Column 1: Credenciales -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#EAD5D3]/30 hover:shadow-md transition-shadow">
              <div class="w-12 h-12 bg-[#EAD5D3]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#5D4A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="font-serif text-xl text-[#5D4A44] mb-4 text-center">
                Credenciales Oficiales
              </h3>
              <ul class="space-y-3 text-[#5D4A44]/80 text-sm">
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Titulación universitaria en Psicología</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Colegiación activa en el COPC</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Máster en Investigación (UAM)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Especialización Harvard</span>
                </li>
              </ul>
            </div>

            <!-- Column 2: Garantías -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#EAD5D3]/30 hover:shadow-md transition-shadow">
              <div class="w-12 h-12 bg-[#EAD5D3]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#5D4A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 class="font-serif text-xl text-[#5D4A44] mb-4 text-center">
                Garantías Profesionales
              </h3>
              <ul class="space-y-3 text-[#5D4A44]/80 text-sm">
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Evidencia científica</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Seguro responsabilidad civil</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Protección de datos RGPD</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Supervisión deontológica</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Formación continua</span>
                </li>
              </ul>
            </div>

            <!-- Column 3: Ética -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#EAD5D3]/30 hover:shadow-md transition-shadow">
              <div class="w-12 h-12 bg-[#EAD5D3]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#5D4A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 class="font-serif text-xl text-[#5D4A44] mb-4 text-center">
                Compromiso Ético
              </h3>
              <ul class="space-y-3 text-[#5D4A44]/80 text-sm">
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Confidencialidad absoluta</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Información transparente</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Consentimiento informado</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Historia clínica protegida</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-[#D8AFA0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Derivación responsable</span>
                </li>
              </ul>
            </div>

          </div>

          <!-- Verification CTA -->
          <div class="bg-[#F9F7F3] rounded-2xl p-8 text-center border-2 border-[#D8AFA0]/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-[#D8AFA0] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h4 class="font-serif text-xl text-[#5D4A44] mb-3">
              Verifica mi Colegiación Oficial
            </h4>
            <p class="text-[#5D4A44]/70 text-sm mb-6 max-w-2xl mx-auto">
              Toda la información de mi registro profesional está disponible públicamente en el 
              Col·legi Oficial de Psicologia de Catalunya para tu tranquilidad.
            </p>
            <a 
              href="https://www.copc.cat/es/contacte/karem-eydelys-pena-de-rodriguez-138759" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-block"
            >
              <CalmButton size="md">
                Verificar Credenciales en COPC →
              </CalmButton>
            </a>
          </div>

        </div>
      </section>

      <!-- 5️⃣ Social Section -->
      <section class="mt-20 text-center">
        <h2 class="text-2xl md:text-3xl font-serif text-[#5D4A44] mb-4">
          Conectemos más allá de la consulta
        </h2>
        <p class="text-[#5D4A44]/80 mb-8 max-w-xl mx-auto leading-relaxed">
          {{ personalized(
            'En mis redes comparto reflexiones, recursos emocionales y recordatorios de calma para tu día a día.',
            '{name}, en mis redes comparto reflexiones, recursos emocionales y recordatorios de calma para tu día a día.'
          ) }}
        </p>

        <div class="flex flex-col md:flex-row justify-center items-stretch gap-6 max-w-3xl mx-auto">
          <!-- Instagram -->
          <a 
            href="https://www.instagram.com/psicokarem" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Sígueme en Instagram"
            class="bg-white rounded-3xl shadow-sm hover:shadow-md border border-[#EAD5D3]/30 w-full md:w-1/2 p-8 transition-all duration-500 hover:scale-[1.02] group"
          >
            <div class="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" style="fill: #E1306C;"/>
              </svg>
            </div>
            <h3 class="text-lg font-serif text-[#5D4A44]">@psicokarem</h3>
            <p class="text-sm text-[#5D4A44]/70 mt-2">Sígueme en Instagram</p>
          </a>

          <!-- TikTok -->
          <a 
            href="https://www.tiktok.com/@psicokarem" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Encuéntrame en TikTok"
            class="bg-white rounded-3xl shadow-sm hover:shadow-md border border-[#EAD5D3]/30 w-full md:w-1/2 p-8 transition-all duration-500 hover:scale-[1.02] group"
          >
            <div class="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" style="fill: #000000;"/>
              </svg>
            </div>
            <h3 class="text-lg font-serif text-[#5D4A44]">@psicokarem</h3>
            <p class="text-sm text-[#5D4A44]/70 mt-2">Encuéntrame en TikTok</p>
          </a>
        </div>
      </section>

      <!-- Inversión en tu bienestar -->
      <InversionSection />

      <!-- 6️⃣ Testimonios Reales -->
      <TestimoniosSection />

    </div>
  </div>
</template>

<script setup>
import { useVisitorContext } from '@/composables/useVisitorContext'

const { personalized } = useVisitorContext()

useHead({
  title: 'Psicóloga en Ciempozuelos – Conóceme | Karem Peña',
  meta: [
    { 
      name: 'description', 
      content: 'Soy Karem Peña, psicóloga integradora en Ciempozuelos. Creo un espacio seguro, humano y sin juicios para acompañarte hacia el bienestar. Colegiada COPC 32005.' 
    },
    { name: 'keywords', content: 'psicóloga Ciempozuelos, psicóloga integradora, terapia humanista Madrid Sur, Karem Peña psicóloga' },
    { property: 'og:title', content: 'Psicóloga en Ciempozuelos – Conóceme | Karem Peña' },
    { property: 'og:description', content: 'Psicóloga integradora en Ciempozuelos. Espacio seguro, humano y sin juicios para tu bienestar emocional.' },
    { property: 'og:url', content: 'https://psicologakarem.com/conoceme' },
    { property: 'og:type', content: 'profile' },
    { name: 'twitter:title', content: 'Psicóloga en Ciempozuelos – Conóceme | Karem Peña' },
    { name: 'twitter:description', content: 'Psicóloga integradora en Ciempozuelos. Espacio seguro, humano y sin juicios para tu bienestar emocional.' }
  ],
  link: [
    { rel: 'canonical', href: 'https://psicologakarem.com/conoceme' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Karem Peña',
        jobTitle: 'Psicóloga',
        description: 'Psicóloga colegiada especializada en terapia humanista e integradora',
        url: 'https://psicologakarem.com/conoceme',
        image: 'https://psicologakarem.com/images/karem sentada.jpeg',
        sameAs: [
          'https://www.instagram.com/psicokarem',
          'https://www.tiktok.com/@psicokarem',
          'https://www.copc.cat/es/contacte/karem-eydelys-pena-de-rodriguez-138759'
        ],
        alumniOf: {
          '@type': 'EducationalOrganization',
          name: 'Universidad Autónoma de Madrid'
        },
        memberOf: {
          '@type': 'Organization',
          name: 'Col·legi Oficial de Psicologia de Catalunya',
          url: 'https://www.copc.cat'
        }
      })
    }
  ]
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

[animation-delay\:0\.3s] {
  animation-delay: 0.3s;
}

[animation-delay\:0\.5s] {
  animation-delay: 0.5s;
}

[animation-delay\:0\.7s] {
  animation-delay: 0.7s;
}

[animation-delay\:0\.9s] {
  animation-delay: 0.9s;
}

[animation-delay\:1\.1s] {
  animation-delay: 1.1s;
}
</style>
