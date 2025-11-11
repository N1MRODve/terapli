<template>
  <Transition name="modal-fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      @click.self="handleDismiss"
    >
      <!-- Modal Card -->
      <div
        class="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300"
        :class="show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'"
      >
        <!-- Header con ícono -->
        <div class="text-center pt-8 pb-6 px-6">
          <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-600/10 flex items-center justify-center">
            <!-- Ícono de corazón/hoja -->
            <svg class="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          
          <h3 class="text-2xl font-serif font-semibold text-texto mb-2">
            💛 Tu espacio terapéutico siempre contigo
          </h3>
          
          <p class="text-texto/70 leading-relaxed">
            Agrega <span class="font-semibold text-purple-600">Psicóloga Karem</span> 
            a tu pantalla de inicio y accede a tu bienestar emocional con un toque.
          </p>
        </div>

        <!-- Beneficios -->
        <div class="px-6 pb-6 space-y-3">
          <div class="flex items-start gap-3 text-sm text-texto/80">
            <span class="text-purple-600 text-lg">✨</span>
            <p>Acceso rápido sin buscar en el navegador</p>
          </div>
          
          <div class="flex items-start gap-3 text-sm text-texto/80">
            <span class="text-purple-600 text-lg">🔒</span>
            <p>Modo privado y discreto, sin distracciones</p>
          </div>
          
          <div class="flex items-start gap-3 text-sm text-texto/80">
            <span class="text-purple-600 text-lg">💾</span>
            <p>Funciona incluso con conexión limitada</p>
          </div>
        </div>

        <!-- Instrucciones específicas por plataforma -->
        <div 
          v-if="platformInfo.isIOS && !platformInfo.isStandalone" 
          class="mx-6 mb-6 p-4 bg-purple-600/10 rounded-2xl border border-purple-600/20"
        >
          <p class="text-sm text-texto/90 mb-2 font-medium">
            📱 En Safari:
          </p>
          <ol class="text-xs text-texto/70 space-y-1 pl-4 list-decimal">
            <li>Toca el botón de <strong>Compartir</strong> (abajo en el centro)</li>
            <li>Selecciona <strong>"Agregar a pantalla de inicio"</strong></li>
            <li>Confirma tocando <strong>"Agregar"</strong></li>
          </ol>
        </div>

        <!-- Botones de acción -->
        <div class="px-6 pb-6 flex gap-3">
          <!-- Botón secundario: Ahora no -->
          <button
            @click="handleDismiss"
            class="flex-1 px-4 py-3 rounded-xl border-2 border-purple-600/30 text-texto/70 font-medium hover:bg-purple-600/5 transition-colors"
          >
            Ahora no
          </button>
          
          <!-- Botón principal: Instalar -->
          <button
            v-if="canInstallDirectly"
            @click="handleInstall"
            class="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-600/90 transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-500/30"
          >
            Instalar App
          </button>
          
          <!-- Botón alternativo para iOS -->
          <button
            v-else
            @click="handleDismiss"
            class="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-600/90 transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-500/30"
          >
            Entendido
          </button>
        </div>

        <!-- Link pequeño: No volver a mostrar -->
        <div class="text-center pb-4">
          <button
            @click="handleNeverShow"
            class="text-xs text-texto/40 hover:text-texto/60 transition-colors underline"
          >
            No volver a mostrar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  install: []
  dismiss: []
  neverShow: []
}>()

const { getPlatformInfo, canInstall } = usePWAInstallPrompt()

const platformInfo = computed(() => getPlatformInfo())
const canInstallDirectly = computed(() => canInstall.value && !platformInfo.value.isIOS)

const handleInstall = () => {
  emit('install')
}

const handleDismiss = () => {
  emit('dismiss')
}

const handleNeverShow = () => {
  emit('neverShow')
  
  // Guardar preferencia para no mostrar más
  if (process.client) {
    localStorage.setItem('pwa-install-never-show', 'true')
  }
}

// Cerrar con tecla ESC
onMounted(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.show) {
      handleDismiss()
    }
  }
  
  window.addEventListener('keydown', handleEsc)
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEsc)
  })
})
</script>

<style scoped>
/* Animaciones del modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active > div,
.modal-fade-leave-active > div {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}

.modal-fade-enter-from > div,
.modal-fade-leave-to > div {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}
</style>
