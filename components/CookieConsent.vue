<template>
  <!-- Cookie Consent Banner -->
  <Transition name="slide-up">
    <div v-if="showBanner" 
         class="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 bg-[#F2F2F2] text-[#2D3748] border border-[#E2E8F0] rounded-2xl shadow-2xl p-6 z-50 max-w-3xl mx-auto backdrop-blur-sm">
      
      <!-- Icono de Cookie -->
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 w-12 h-12 bg-[#5550F2]/20 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-[#5550F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div class="flex-1">
          <h3 class="font-serif text-lg font-semibold mb-2 text-[#2D3748]">
            🍪 Uso de cookies
          </h3>
          <p class="font-sans text-sm leading-relaxed mb-4">
            Utilizamos cookies propias y de terceros para mejorar tu experiencia y analizar el uso del sitio. 
            Puedes aceptar todas las cookies o configurarlas según tus preferencias.
          </p>

          <!-- Botones de acción -->
          <div class="flex flex-wrap gap-3 items-center">
            <button 
              @click="acceptAll"
              class="bg-[#5550F2] text-white px-5 py-2.5 rounded-xl font-sans font-medium hover:bg-[#7B72F7] transition-all shadow-md hover:shadow-lg">
              Aceptar todas
            </button>
            
            <button 
              @click="showSettings = true"
              class="bg-transparent border border-[#5550F2] text-[#2D3748] px-5 py-2.5 rounded-xl font-sans hover:bg-[#E2E8F0] transition-all">
              Configurar
            </button>
            
            <button 
              @click="rejectNonEssential"
              class="text-sm text-[#2D3748]/70 hover:text-[#2D3748] underline font-sans">
              Rechazar no esenciales
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Panel de Configuración de Cookies -->
  <Transition name="fade">
    <div v-if="showSettings" 
         class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
         @click.self="showSettings = false">
      
      <div class="bg-[#F2F2F2] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-[#F2F2F2] border-b border-[#E2E8F0] p-6">
          <div class="flex items-center justify-between">
            <h2 class="font-serif text-2xl font-semibold text-[#2D3748]">
              Configuración de Cookies
            </h2>
            <button 
              @click="showSettings = false"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E2E8F0] transition-colors">
              <svg class="w-5 h-5 text-[#2D3748]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6 space-y-6">
          <p class="font-sans text-sm text-[#2D3748]/80 leading-relaxed">
            Aquí puedes gestionar tus preferencias de cookies. Las cookies técnicas son necesarias para el funcionamiento del sitio y no pueden desactivarse.
          </p>

          <!-- Cookies Necesarias -->
          <div class="bg-white/40 p-5 rounded-2xl border border-[#E2E8F0]">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="font-serif text-lg font-semibold text-[#2D3748]">
                  Cookies necesarias
                </h3>
                <p class="font-sans text-sm text-[#2D3748]/70 mt-1">
                  Esenciales para el funcionamiento del sitio
                </p>
              </div>
              <div class="bg-[#5550F2]/20 px-4 py-1.5 rounded-full">
                <span class="font-sans text-sm font-medium text-[#2D3748]">Siempre activas</span>
              </div>
            </div>
            <p class="font-sans text-sm text-[#2D3748]/70 leading-relaxed">
              Permiten la navegación básica y el acceso a áreas seguras. Sin estas cookies, el sitio no puede funcionar correctamente.
            </p>
          </div>

          <!-- Cookies de Análisis -->
          <div class="bg-white/40 p-5 rounded-2xl border border-[#E2E8F0]">
            <div class="flex items-center justify-between mb-3">
              <div class="flex-1">
                <h3 class="font-serif text-lg font-semibold text-[#2D3748]">
                  Cookies de análisis
                </h3>
                <p class="font-sans text-sm text-[#2D3748]/70 mt-1">
                  Nos ayudan a mejorar el rendimiento del sitio
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="preferences.analytics" 
                  class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5550F2]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5550F2]"></div>
              </label>
            </div>
            <p class="font-sans text-sm text-[#2D3748]/70 leading-relaxed">
              Recopilan información anónima sobre cómo utilizas el sitio para ayudarnos a mejorarlo (ej. Google Analytics).
            </p>
          </div>

          <!-- Cookies de Personalización -->
          <div class="bg-white/40 p-5 rounded-2xl border border-[#E2E8F0]">
            <div class="flex items-center justify-between mb-3">
              <div class="flex-1">
                <h3 class="font-serif text-lg font-semibold text-[#2D3748]">
                  Cookies de personalización
                </h3>
                <p class="font-sans text-sm text-[#2D3748]/70 mt-1">
                  Adaptan la experiencia a tus preferencias
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="preferences.personalization" 
                  class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5550F2]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5550F2]"></div>
              </label>
            </div>
            <p class="font-sans text-sm text-[#2D3748]/70 leading-relaxed">
              Recuerdan tus elecciones y preferencias para ofrecerte una experiencia más personalizada.
            </p>
          </div>

          <!-- Info adicional -->
          <div class="bg-[#E2E8F0]/20 border-l-4 border-[#5550F2] p-4 rounded-r-xl">
            <p class="font-sans text-sm text-[#2D3748]/80">
              Puedes cambiar estas preferencias en cualquier momento desde el pie de página del sitio. 
              <NuxtLink to="/legal/cookies" class="text-[#5550F2] hover:text-[#7B72F7] underline font-semibold">
                Ver política completa →
              </NuxtLink>
            </p>
          </div>
        </div>

        <!-- Footer con botones -->
        <div class="sticky bottom-0 bg-[#F2F2F2] border-t border-[#E2E8F0] p-6 flex gap-3 justify-end">
          <button 
            @click="savePreferences"
            class="bg-[#5550F2] text-white px-6 py-2.5 rounded-xl font-sans font-medium hover:bg-[#7B72F7] transition-all shadow-md hover:shadow-lg">
            Guardar preferencias
          </button>
          <button 
            @click="showSettings = false"
            class="bg-transparent border border-[#5550F2] text-[#2D3748] px-6 py-2.5 rounded-xl font-sans hover:bg-[#E2E8F0] transition-all">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showBanner = ref(false)
const showSettings = ref(false)
const preferences = ref({
  necessary: true, // Siempre activadas
  analytics: false,
  personalization: false
})

// Nombre de la cookie de consentimiento
const CONSENT_COOKIE = 'cookie_consent'
const CONSENT_EXPIRY_MONTHS = 12

// Verificar consentimiento existente
onMounted(() => {
  const consent = localStorage.getItem(CONSENT_COOKIE)
  
  if (consent) {
    const { timestamp, preferences: savedPrefs } = JSON.parse(consent)
    const expiryDate = new Date(timestamp)
    expiryDate.setMonth(expiryDate.getMonth() + CONSENT_EXPIRY_MONTHS)
    
    // Si el consentimiento ha expirado, mostrar banner nuevamente
    if (new Date() > expiryDate) {
      showBanner.value = true
    } else {
      // Aplicar preferencias guardadas
      preferences.value = savedPrefs
      applyPreferences()
    }
  } else {
    // No hay consentimiento, mostrar banner
    showBanner.value = true
  }

  // Escuchar evento para abrir configuración desde el footer
  window.addEventListener('open-cookie-settings', () => {
    showSettings.value = true
  })
})

// Aceptar todas las cookies
const acceptAll = () => {
  preferences.value = {
    necessary: true,
    analytics: true,
    personalization: true
  }
  saveConsent()
}

// Rechazar cookies no esenciales
const rejectNonEssential = () => {
  preferences.value = {
    necessary: true,
    analytics: false,
    personalization: false
  }
  saveConsent()
}

// Guardar preferencias personalizadas
const savePreferences = () => {
  saveConsent()
  showSettings.value = false
}

// Guardar consentimiento en localStorage
const saveConsent = () => {
  const consent = {
    timestamp: new Date().toISOString(),
    preferences: preferences.value
  }
  
  localStorage.setItem(CONSENT_COOKIE, JSON.stringify(consent))
  applyPreferences()
  showBanner.value = false
}

// Aplicar preferencias (activar/desactivar servicios)
const applyPreferences = () => {
  // Emitir evento personalizado para que GA4 lo escuche
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('cookie-consent-updated', {
      detail: preferences.value
    })
    window.dispatchEvent(event)
  }
  
  // Log para debugging
  if (preferences.value.analytics) {
    console.log('✅ Google Analytics activado por el usuario')
  } else {
    console.log('❌ Google Analytics desactivado por el usuario')
  }
  
  if (preferences.value.personalization) {
    console.log('✅ Cookies de personalización activadas')
  } else {
    console.log('❌ Cookies de personalización desactivadas')
  }
}

// Exponer función para abrir configuración desde footer
defineExpose({
  openSettings: () => {
    showSettings.value = true
  }
})
</script>

<style scoped>
/* Animación slide-up para el banner */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Animación fade para el modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scroll suave en el panel */
.overflow-y-auto {
  scroll-behavior: smooth;
}

/* Toggle switch personalizado */
input[type="checkbox"]:checked ~ div {
  background-color: #5550F2;
}
</style>
