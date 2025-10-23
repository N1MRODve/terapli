<template>
  <PWAInstallWrapper>
    <div class="min-h-screen bg-fondo">
      <!-- Tu contenido normal aquí -->
      <div class="max-w-6xl mx-auto px-4 py-8">
        <h1 class="text-4xl font-serif text-texto mb-6">
          Dashboard del Paciente
        </h1>
        
        <p class="text-texto/70 mb-8">
          Bienvenida a tu espacio terapéutico. Esta página ahora puede instalarse como una app.
        </p>

        <!-- Ejemplo: Información sobre PWA para el usuario -->
        <div 
          v-if="!isInstalled && getPlatformInfo().canPrompt"
          class="bg-terracota/10 border-2 border-terracota/30 rounded-2xl p-6 mb-8"
        >
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 bg-terracota rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-texto mb-2">
                💡 ¿Sabías que puedes instalar esta app?
              </h3>
              <p class="text-sm text-texto/70 mb-3">
                Accede más rápido a tu espacio terapéutico instalando la app en tu dispositivo.
              </p>
              <button
                @click="showInstallPrompt()"
                class="px-4 py-2 bg-terracota text-white rounded-lg font-medium hover:bg-terracota/90 transition-colors"
              >
                Instalar ahora
              </button>
            </div>
          </div>
        </div>

        <!-- Indicador de app instalada -->
        <div 
          v-if="isInstalled"
          class="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8"
        >
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-green-800 font-medium">
              ✨ App instalada correctamente. ¡Disfruta de una experiencia más fluida!
            </p>
          </div>
        </div>

        <!-- Resto de tu contenido -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h2 class="font-serif text-xl text-texto mb-3">Próxima sesión</h2>
            <p class="text-texto/70">Contenido de ejemplo...</p>
          </div>
          
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h2 class="font-serif text-xl text-texto mb-3">Tu progreso</h2>
            <p class="text-texto/70">Contenido de ejemplo...</p>
          </div>
        </div>
      </div>

      <!-- Botón flotante de instalación (opcional) -->
      <ClientOnly>
        <InstallPWAButton 
          :auto-show="true" 
          :show-badge="true"
          @click="handleFabClick"
        />
      </ClientOnly>
    </div>
  </PWAInstallWrapper>
</template>

<script setup lang="ts">
/**
 * EJEMPLO DE INTEGRACIÓN PWA
 * 
 * Este archivo muestra cómo integrar la funcionalidad PWA
 * en cualquier página de tu aplicación.
 * 
 * Características demostradas:
 * 1. PWAInstallWrapper - Modal automático
 * 2. Composable usePWAInstallPrompt - Control manual
 * 3. InstallPWAButton - Botón flotante
 * 4. Detección de estado de instalación
 * 5. Banner informativo condicional
 */

const { 
  isInstalled, 
  canInstall,
  showInstallPrompt,
  getPlatformInfo
} = usePWAInstallPrompt()

const handleFabClick = () => {
  console.log('Usuario hizo clic en el botón flotante')
}

// Detectar cuando la app se instala
onMounted(() => {
  window.addEventListener('appinstalled', () => {
    console.log('🎉 ¡App instalada con éxito!')
    
    // Opcional: Enviar evento a analytics
    // useAnalytics().trackEvent({
    //   category: 'PWA',
    //   action: 'installed',
    //   label: 'Dashboard'
    // })
  })
})
</script>

<style scoped>
/* Tus estilos personalizados aquí */
</style>
