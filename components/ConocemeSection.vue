<template>
  <section id="conoceme" class="bg-white py-20 px-6 md:px-12 lg:px-20">
    <div class="hero-width">
      
      <!-- 3.1 Mi Historia y Mi Porqué (Storytelling) -->
      <div class="grid md:grid-cols-2 gap-12 items-center mb-20">
        
        <!-- Imagen de Karem -->
        <div class="order-2 md:order-1 animate-fade-in-up">
          <div class="relative rounded-3xl overflow-hidden shadow-lg">
            <img 
              src="/images/karem sentada.jpeg" 
              alt="Karem Peña - Psicóloga Colegiada"
              class="w-full h-auto object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#5D4A44]/10 to-transparent"></div>
          </div>
        </div>

        <!-- Contenido de texto -->
        <div class="order-1 md:order-2 animate-fade-in-up [animation-delay:0.2s]">
          <h2 class="section-title mb-6">
            <span :class="{ 'transition-opacity duration-300 ease-in': userName }">
              {{ userName ? `${userName}, un espacio seguro para ti` : 'Un espacio seguro para ti' }}
            </span>
          </h2>
          
          <p class="body-text mb-6">
            Soy Karem Peña, y mi propósito es crear un refugio donde puedas ser quien eres, sin juicios ni máscaras.
          </p>

          <p class="body-text mb-6">
            Entiendo que buscar ayuda no es fácil. Requiere valentía mirar hacia dentro y decir 
            <em class="text-[#D8AFA0] font-medium">"necesito acompañamiento"</em>. 
            Por eso, cada sesión está diseñada para que te sientas escuchado, comprendido y respetado.
          </p>

          <p class="body-text mb-8">
            Mi camino comenzó en enfermería, donde aprendí a cuidar del cuerpo. Pero pronto descubrí que 
            <strong class="text-[#5D4A44]">el alma también necesita sanación</strong>. 
            Esa inquietud me llevó a dedicarme por completo a la psicología, y hoy acompaño a personas como tú 
            en su viaje hacia el bienestar emocional.
          </p>

          <NuxtLink 
            to="/conoceme"
            class="inline-flex items-center gap-2 text-[#D8AFA0] hover:text-[#5D4A44] transition-colors font-medium text-base md:text-lg group"
            aria-label="Conoce más sobre Karem Peña"
          >
            <span>Descubre mi historia completa</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>

      </div>

      <!-- 3.2 Mi Enfoque: Un Espacio Seguro para Ti -->
      <div class="bg-gradient-to-br from-[#F9F7F3] to-[#EAD5D3]/20 rounded-3xl p-8 md:p-12 mb-20 animate-fade-in-up [animation-delay:0.4s]">
        <div class="content-width">
          
          <h3 class="section-title text-center mb-8">
            Mi Enfoque: Una Caja de Herramientas para Ti
          </h3>

          <div class="bg-white/70 rounded-2xl p-8 mb-8 border-2 border-[#D8AFA0]/30">
            <p class="quote-text text-center mb-4">
              "No creo en un método único para todos. Mi trabajo es como tener una caja de herramientas completa; 
              juntos elegiremos las que mejor se adapten a ti."
            </p>
            <p class="microcopy text-center">— Mi filosofía terapéutica</p>
          </div>

          <!-- Valores en grid -->
          <div class="grid sm:grid-cols-2 gap-6 mb-8">
            
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#EAD5D3]/40">
              <div class="w-12 h-12 bg-[#EAD5D3]/40 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#5D4A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 class="font-serif text-xl md:text-2xl text-[#5D4A44] font-medium mb-3">Escucha Activa</h4>
              <p class="body-text">
                Te escucho de verdad, sin interrumpir, sin juzgar. Tu voz y tu historia son lo más importante.
              </p>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#EAD5D3]/40">
              <div class="w-12 h-12 bg-[#EAD5D3]/40 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#5D4A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 class="font-serif text-xl md:text-2xl text-[#5D4A44] font-medium mb-3">Sin Juicios</h4>
              <p class="body-text">
                Este es un espacio libre de críticas. Aquí puedes mostrarte tal como eres, con tus luces y tus sombras.
              </p>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#EAD5D3]/40">
              <div class="w-12 h-12 bg-[#EAD5D3]/40 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#5D4A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 class="font-serif text-xl md:text-2xl text-[#5D4A44] font-medium mb-3">A Tu Ritmo</h4>
              <p class="body-text">
                No hay prisa. Cada proceso tiene su tiempo, y yo respeto el tuyo. Avanzamos cuando estés preparado.
              </p>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#EAD5D3]/40">
              <div class="w-12 h-12 bg-[#EAD5D3]/40 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#5D4A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 class="font-serif text-xl md:text-2xl text-[#5D4A44] font-medium mb-3">Herramientas Prácticas</h4>
              <p class="body-text">
                Te ofrezco técnicas concretas para gestionar tus emociones en el día a día, no solo en consulta.
              </p>
            </div>

          </div>

          <!-- CTA suave -->
          <div class="text-center">
            <p class="body-text mb-6">
              <span :class="{ 'transition-opacity duration-300 ease-in': userName }">
                {{ userName 
                  ? `${userName}, ¿te gustaría saber cómo puedo acompañarte en tu proceso?`
                  : '¿Te gustaría saber cómo puedo acompañarte en tu proceso?'
                }}
              </span>
            </p>
            <NuxtLink 
              to="/como-empezar"
              class="inline-flex items-center gap-2 text-[#D8AFA0] hover:text-[#5D4A44] transition-colors font-medium text-base md:text-lg group"
              aria-label="Descubre cómo empezar tu proceso terapéutico"
            >
              <span>Descubre cómo empezar</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>

        </div>
      </div>

      <!-- 3.3 Formación y Acreditaciones -->
      <div class="max-w-5xl mx-auto animate-fade-in-up [animation-delay:0.6s]">
        
        <div class="bg-gradient-to-br from-[#5D4A44] to-[#6B5650] rounded-3xl overflow-hidden shadow-xl">
          
          <!-- Header -->
          <div class="text-white text-center py-8 px-6">
            <div class="flex items-center justify-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 class="font-serif text-2xl md:text-3xl font-semibold">Sello de Garantía Profesional</h3>
            </div>
            <p class="font-sans text-white/90 text-sm md:text-base">
              Psicóloga Colegiada COPC Nº 32005
            </p>
          </div>

          <!-- Content -->
          <div class="bg-white p-8 md:p-12">
            
            <p class="body-text text-center mb-10 content-width">
              Mi formación y colegiación garantizan que tu proceso terapéutico está respaldado por 
              la ética profesional, la confidencialidad absoluta y la evidencia científica.
            </p>

            <!-- Grid de credenciales -->
            <div class="grid md:grid-cols-3 gap-6 mb-8">
              
              <div class="text-center p-6 bg-[#F9F7F3] rounded-2xl">
                <div class="w-14 h-14 bg-[#D8AFA0]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-[#5D4A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 class="font-serif text-lg text-[#5D4A44] font-medium mb-2">Licenciatura en Psicología</h4>
                <p class="microcopy">Titulación universitaria oficial</p>
              </div>

              <div class="text-center p-6 bg-[#F9F7F3] rounded-2xl">
                <div class="w-14 h-14 bg-[#D8AFA0]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-[#5D4A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h4 class="font-serif text-lg text-[#5D4A44] font-medium mb-2">Máster en Investigación</h4>
                <p class="microcopy">Universidad Autónoma de Madrid</p>
              </div>

              <div class="text-center p-6 bg-[#F9F7F3] rounded-2xl">
                <div class="w-14 h-14 bg-[#D8AFA0]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-[#5D4A44]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h4 class="font-serif text-lg text-[#5D4A44] font-medium mb-2">Especialización Harvard</h4>
                <p class="microcopy">Formación avanzada internacional</p>
              </div>

            </div>

            <!-- Verificación -->
            <div class="bg-[#F9F7F3] rounded-2xl p-6 text-center border-2 border-[#D8AFA0]/20">
              <p class="microcopy mb-4">
                Toda mi información profesional está verificada y disponible públicamente en el Col·legi Oficial de Psicologia de Catalunya
              </p>
              <a 
                href="https://www.copc.cat/es/contacte/karem-eydelys-pena-de-rodriguez-138759" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-[#D8AFA0] hover:text-[#5D4A44] font-medium text-sm underline underline-offset-4 transition-colors"
              >
                Verificar credenciales en COPC →
              </a>
            </div>

          </div>

        </div>

      </div>

    </div>
  </section>
</template>

<script setup>
import { useUserName } from '@/composables/useUserName'

const { userName } = useUserName()
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
