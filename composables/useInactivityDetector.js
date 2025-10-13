import { ref, onMounted, onUnmounted } from 'vue'

const INACTIVITY_TIMEOUT = 3 * 60 * 1000 // 3 minutos en milisegundos
let inactivityTimer = null
const showInactivityModal = ref(false)
const isActive = ref(true)

export function useInactivityDetector() {
  const resetTimer = () => {
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
      if (process.client) {
        showInactivityModal.value = true
        isActive.value = false
      }
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
    if (process.client) {
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
  }

  const cleanupListeners = () => {
    if (process.client) {
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
      }
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
