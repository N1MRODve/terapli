import { ref, onMounted, onUnmounted } from 'vue'

const INACTIVITY_TIMEOUT = 3 * 60 * 1000 // 3 minutos en milisegundos

export function useInactivityDetector() {
  // Estado local por instancia del composable (evita state pollution en SSR)
  const showInactivityModal = ref(false)
  const isActive = ref(true)
  let inactivityTimer: ReturnType<typeof setTimeout> | null = null

  const resetTimer = () => {
    // Solo ejecutar en cliente
    if (!import.meta.client) return

    // Limpiar el timer anterior
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }

    // Si el modal está visible, ocultarlo porque el usuario volvió a interactuar
    if (showInactivityModal.value) {
      showInactivityModal.value = false
      isActive.value = true
    }

    // Establecer nuevo timer
    inactivityTimer = setTimeout(() => {
      showInactivityModal.value = true
      isActive.value = false
    }, INACTIVITY_TIMEOUT)
  }

  const handleUserActivity = () => {
    resetTimer()
  }

  const confirmStillHere = () => {
    showInactivityModal.value = false
    isActive.value = true
    resetTimer()
  }

  const setupListeners = () => {
    if (!import.meta.client) return

    // Eventos que indican actividad del usuario
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })

    // Iniciar el timer
    resetTimer()
  }

  const cleanupListeners = () => {
    if (!import.meta.client) return

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    events.forEach(event => {
      document.removeEventListener(event, handleUserActivity)
    })

    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
      inactivityTimer = null
    }
  }

  onMounted(() => {
    setupListeners()
  })

  onUnmounted(() => {
    cleanupListeners()
  })

  return {
    showInactivityModal,
    isActive,
    confirmStillHere,
    resetTimer
  }
}
