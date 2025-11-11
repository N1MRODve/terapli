<template>
  <Transition name="fab-slide">
    <button
      v-if="showButton"
      @click="handleClick"
      class="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-600/80 text-white shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      aria-label="Instalar aplicación"
    >
      <!-- Ícono de descarga/instalación -->
      <svg 
        class="w-6 h-6 transform group-hover:scale-110 transition-transform" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2.5" 
          d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
        />
      </svg>
      
      <!-- Pulso animado -->
      <span class="absolute inset-0 rounded-full bg-purple-600 animate-ping opacity-20"></span>
      
      <!-- Badge de notificación (opcional) -->
      <span 
        v-if="showBadge"
        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
      >
        !
      </span>
    </button>
  </Transition>
</template>

<script setup lang="ts">
/**
 * Botón flotante (FAB) para promover la instalación de la PWA
 * 
 * Props:
 * - autoShow: Mostrar automáticamente después de scroll
 * - showBadge: Mostrar badge de notificación
 * - scrollThreshold: Píxeles de scroll antes de mostrar
 */

const props = withDefaults(defineProps<{
  autoShow?: boolean
  showBadge?: boolean
  scrollThreshold?: number
}>(), {
  autoShow: true,
  showBadge: false,
  scrollThreshold: 300
})

const emit = defineEmits<{
  click: []
}>()

const { canInstall, isInstalled, showInstallPrompt } = usePWAInstallPrompt()

const showButton = ref(false)
const hasScrolled = ref(false)

// Mostrar solo si puede instalarse y no está instalada
const shouldDisplay = computed(() => {
  if (isInstalled.value) return false
  if (!canInstall.value) return false
  if (process.client) {
    const neverShow = localStorage.getItem('pwa-install-never-show')
    if (neverShow === 'true') return false
  }
  return true
})

// Detectar scroll si autoShow está activado
const handleScroll = () => {
  if (!props.autoShow) return
  hasScrolled.value = window.scrollY > props.scrollThreshold
}

onMounted(() => {
  if (props.autoShow) {
    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check inicial
  } else {
    // Si no es auto, mostrar inmediatamente
    hasScrolled.value = true
  }

  // Pequeño delay para animación
  setTimeout(() => {
    showButton.value = shouldDisplay.value && hasScrolled.value
  }, 500)
})

onUnmounted(() => {
  if (props.autoShow) {
    window.removeEventListener('scroll', handleScroll)
  }
})

// Actualizar visibilidad cuando cambian las condiciones
watch([shouldDisplay, hasScrolled], ([display, scrolled]) => {
  showButton.value = display && scrolled
})

const handleClick = () => {
  emit('click')
  showInstallPrompt()
}
</script>

<style scoped>
/* Animación de entrada/salida */
.fab-slide-enter-active,
.fab-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.fab-slide-enter-from {
  transform: translateY(100px) scale(0);
  opacity: 0;
}

.fab-slide-leave-to {
  transform: translateY(100px) scale(0);
  opacity: 0;
}

/* Animación de pulso */
@keyframes ping {
  0% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Hover suave en móvil */
@media (hover: none) {
  button:active {
    transform: scale(0.95);
  }
}
</style>
