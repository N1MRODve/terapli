<template>
  <div class="min-h-screen bg-[#F9F7F3]">
    <!-- Optional Emotional Transition Overlay -->
    <transition name="fade" mode="out-in">
      <div 
        v-if="showTransition" 
        class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F9F7F3] text-center px-6"
        role="status"
        aria-live="polite"
      >
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] animate-fade-in-up max-w-3xl">
          {{ visitorName 
            ? `${visitorName}, qué alegría acompañarte en este paso final.` 
            : 'Qué alegría acompañarte en este paso final.' }}
        </h2>
        <p class="text-lg md:text-xl text-[#5D4A44]/80 mt-6 animate-fade-in-up [animation-delay:0.4s] max-w-2xl leading-relaxed">
          Te explico cómo reservar tu primera sesión.
        </p>
        <div class="mt-12 w-3 h-3 bg-[#D8AFA0] rounded-full animate-pulse opacity-40"></div>
      </div>
    </transition>

    <!-- Main Content -->
    <div v-show="!showTransition">
      <!-- Hero Section - Personalized Greeting -->
      <section class="text-center py-16 md:py-20 px-6 md:px-12 lg:px-20">
        <h1 class="text-4xl md:text-5xl font-serif text-[#5D4A44] animate-fade-in-up max-w-4xl mx-auto leading-tight">
          {{ visitorName 
            ? `${visitorName}, me alegra acompañarte en este primer paso.` 
            : 'Me alegra acompañarte en este primer paso.' }}
        </h1>
        <p class="text-lg md:text-xl text-[#5D4A44]/80 mt-6 max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:0.3s]">
          Este espacio está pensado para que puedas reservar tu primera sesión de orientación o contactar directamente conmigo si lo prefieres.
        </p>
      </section>

      <!-- Booking Options Section -->
      <section class="mt-8 md:mt-12 max-w-5xl mx-auto grid md:grid-cols-2 gap-8 px-6 md:px-12 lg:px-20 pb-16">
        
        <!-- Option 1: Online Booking -->
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-[#EAD5D3]/30 hover:shadow-md transition-all duration-700 animate-fade-in-up">
          <div class="text-4xl mb-4 text-center">📅</div>
          <h3 class="text-2xl font-serif text-[#5D4A44] mb-4 text-center">Reserva tu sesión de orientación gratuita</h3>
          <p class="text-[#5D4A44]/80 text-base mb-6 leading-relaxed text-center">
            {{ visitorName 
              ? `${visitorName}, puedes agendar el momento que mejor se adapte a ti. Recibirás un recordatorio antes de tu cita.` 
              : 'Puedes agendar el momento que mejor se adapte a ti. Recibirás un recordatorio antes de tu cita.' }}
          </p>

          <div class="text-center">
            <CalmButton 
              variant="primary" 
              size="lg"
              aria-label="Reservar sesión de orientación"
            >
              <a 
                href="https://calendly.com/psicologakarem/sesion-de-evaluacion" 
                target="_blank" 
                rel="noopener noreferrer"
                class="block w-full h-full"
              >
                Reservar sesión
              </a>
            </CalmButton>
          </div>

          <p class="text-xs text-[#5D4A44]/60 mt-4 text-center">
            Sin compromiso · 15-20 minutos · Online o presencial
          </p>
        </div>

        <!-- Option 2: WhatsApp Contact (Conditional on Mobile) -->
        <div 
          v-if="deviceType === 'mobile'" 
          class="bg-gradient-to-br from-[#F9F7F3] to-white p-8 rounded-3xl shadow-sm border border-[#EAD5D3]/30 hover:shadow-md transition-all duration-700 animate-fade-in-up [animation-delay:0.2s]"
        >
          <div class="text-4xl mb-4 text-center">💬</div>
          <h3 class="text-2xl font-serif text-[#5D4A44] mb-4 text-center">Contacto directo por WhatsApp</h3>
          <p class="text-[#5D4A44]/80 text-base mb-6 leading-relaxed text-center">
            {{ visitorName 
              ? `${visitorName}, si lo prefieres, puedes escribirme directamente por WhatsApp.` 
              : 'Si lo prefieres, puedes escribirme directamente por WhatsApp.' }}
          </p>

          <div class="text-center">
            <CalmButton 
              variant="primary" 
              size="lg"
              aria-label="Contactar por WhatsApp"
            >
              <a 
                :href="whatsappLink"
                target="_blank"
                rel="noopener noreferrer"
                class="block w-full h-full"
              >
                Escribir por WhatsApp 💬
              </a>
            </CalmButton>
          </div>

          <p class="text-xs text-[#5D4A44]/60 mt-4 text-center">
            Respuesta en menos de 24 horas
          </p>
        </div>

        <!-- Option 2 Alternative: Email Contact (Desktop) -->
        <div 
          v-else
          class="bg-gradient-to-br from-[#F9F7F3] to-white p-8 rounded-3xl shadow-sm border border-[#EAD5D3]/30 hover:shadow-md transition-all duration-700 animate-fade-in-up [animation-delay:0.2s]"
        >
          <div class="text-4xl mb-4 text-center">✉️</div>
          <h3 class="text-2xl font-serif text-[#5D4A44] mb-4 text-center">Contacto directo</h3>
          <p class="text-[#5D4A44]/80 text-base mb-6 leading-relaxed text-center">
            {{ visitorName 
              ? `${visitorName}, también puedes contactarme directamente por email o WhatsApp si lo prefieres.` 
              : 'También puedes contactarme directamente por email o WhatsApp si lo prefieres.' }}
          </p>

          <div class="space-y-3">
            <a 
              :href="`mailto:contacto@psicologakarem.com?subject=Consulta%20de%20${visitorName || 'un%20visitante'}&body=Hola%20Karem%2C%0A%0AMe%20gustaría%20agendar%20una%20sesión%20de%20orientación.%0A%0A`"
              class="block w-full text-center px-6 py-3 bg-white border-2 border-[#D8AFA0] text-[#5D4A44] rounded-full hover:bg-[#D8AFA0]/10 transition-all duration-300"
            >
              Enviar email
            </a>
            <a 
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="block w-full text-center px-6 py-3 bg-white border-2 border-[#D8AFA0] text-[#5D4A44] rounded-full hover:bg-[#D8AFA0]/10 transition-all duration-300"
            >
              WhatsApp: +34 640 533 697
            </a>
          </div>

          <p class="text-xs text-[#5D4A4]/60 mt-4 text-center">
            Respuesta en menos de 24 horas
          </p>
        </div>
      </section>

      <!-- Trust Section - Reassurance -->
      <section class="mt-12 md:mt-20 bg-white/50 py-16 md:py-20 px-6 rounded-none md:rounded-3xl animate-fade-in-up">
        <div class="max-w-3xl mx-auto text-center">
          <div class="text-5xl mb-6">🤍</div>
          <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-6">Tu confianza es lo más importante</h2>
          <p class="text-[#5D4A44]/80 text-base md:text-lg leading-relaxed">
            Todas las sesiones se realizan bajo el marco de la confidencialidad profesional, cumpliendo con el código deontológico del 
            <strong>Col·legi Oficial de Psicologia de Catalunya (COPC)</strong>.
          </p>
          <p class="text-[#5D4A44]/80 text-base md:text-lg leading-relaxed mt-4">
            {{ visitorName 
              ? `${visitorName}, tu información y tu proceso estarán siempre protegidos.` 
              : 'Tu información y tu proceso estarán siempre protegidos.' }}
          </p>
        </div>
      </section>

      <!-- What Happens Next Section -->
      <section class="mt-16 md:mt-20 max-w-4xl mx-auto px-6 md:px-12 lg:px-20 pb-16">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] text-center mb-12 animate-fade-in-up">
          ¿Qué sucede después de reservar?
        </h2>
        
        <div class="grid md:grid-cols-3 gap-8 text-center">
          <div class="animate-fade-in-up">
            <div class="text-4xl mb-3">1️⃣</div>
            <h3 class="text-lg font-serif text-[#5D4A44] mb-2">Confirmación inmediata</h3>
            <p class="text-sm text-[#5D4A44]/80 leading-relaxed">
              Recibirás un email de confirmación con todos los detalles de tu sesión.
            </p>
          </div>

          <div class="animate-fade-in-up [animation-delay:0.2s]">
            <div class="text-4xl mb-3">2️⃣</div>
            <h3 class="text-lg font-serif text-[#5D4A44] mb-2">Recordatorio amable</h3>
            <p class="text-sm text-[#5D4A44]/80 leading-relaxed">
              Te enviaré un recordatorio 24 horas antes de nuestra primera conversación.
            </p>
          </div>

          <div class="animate-fade-in-up [animation-delay:0.4s]">
            <div class="text-4xl mb-3">3️⃣</div>
            <h3 class="text-lg font-serif text-[#5D4A44] mb-2">Conversación tranquila</h3>
            <p class="text-sm text-[#5D4A44]/80 leading-relaxed">
              Nos tomamos el tiempo necesario para conocernos y resolver todas tus dudas.
            </p>
          </div>
        </div>
      </section>

      <!-- Final CTA Section -->
      <section class="text-center mt-16 md:mt-20 pb-20 px-6 md:px-12 lg:px-20">
        <p class="text-lg md:text-xl text-[#5D4A44]/80 mb-8 animate-fade-in-up max-w-2xl mx-auto leading-relaxed">
          {{ visitorName 
            ? `${visitorName}, dar este paso es una forma de cuidarte. Estoy aquí para acompañarte en ese proceso.` 
            : 'Dar este paso es una forma de cuidarte. Estoy aquí para acompañarte en ese proceso.' }}
        </p>
        <CalmButton 
          variant="primary" 
          size="lg"
          aria-label="Reservar sesión de orientación gratuita"
        >
          <a 
            href="https://calendly.com/psicologakarem/sesion-de-evaluacion" 
            target="_blank" 
            rel="noopener noreferrer"
            class="block w-full h-full"
          >
            Reservar sesión de orientación gratuita
          </a>
        </CalmButton>
        
        <p class="text-sm text-[#5D4A44]/60 mt-6">
          Sin compromiso · Completamente confidencial · Primer paso hacia tu bienestar
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVisitorContext } from '@/composables/useVisitorContext'
import { useRoute } from 'vue-router'

const route = useRoute()
const { visitorName, deviceType } = useVisitorContext()

// Show transition overlay if coming from "como-empezar" page
const showTransition = ref(false)

onMounted(() => {
  // Check if visitor came from the "como-empezar" page via referrer or query param
  if (route.query.from === 'como-empezar') {
    showTransition.value = true
    setTimeout(() => {
      showTransition.value = false
    }, 2000)
  }
})

// Construct personalized WhatsApp link
const whatsappLink = computed(() => {
  const baseUrl = 'https://wa.me/34640533697'
  const message = visitorName.value
    ? `Hola, soy ${visitorName.value} y me gustaría agendar una sesión de orientación.`
    : 'Hola, me gustaría agendar una sesión de orientación.'
  
  return `${baseUrl}?text=${encodeURIComponent(message)}`
})

useHead({
  title: 'Reserva tu Sesión de Orientación - Karem Peña, Psicóloga',
  meta: [
    { 
      name: 'description', 
      content: 'Reserva tu primera sesión de orientación gratuita. Un espacio confidencial para conocernos y comenzar tu proceso terapéutico con calma y confianza.' 
    }
  ]
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ensure links inside buttons fill the space properly */
a {
  text-decoration: none;
  color: inherit;
}
</style>
