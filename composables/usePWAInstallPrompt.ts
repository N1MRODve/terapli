/**
 * Composable para detectar y promover la instalación de la PWA
 * 
 * Detecta el evento beforeinstallprompt y permite mostrar
 * un prompt personalizado para instalar la app
 */

export const usePWAInstallPrompt = () => {
  const deferredPrompt = ref<any>(null)
  const canInstall = ref(false)
  const isInstalled = ref(false)
  const showInstallModal = ref(false)

  // Detectar si ya está instalada
  const checkIfInstalled = () => {
    // PWA instalada si se está ejecutando en modo standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled.value = true
      return true
    }
    
    // Safari iOS
    if ((window.navigator as any).standalone === true) {
      isInstalled.value = true
      return true
    }
    
    return false
  }

  const setupPrompt = () => {
    if (process.client) {
      // Verificar si ya está instalada
      checkIfInstalled()

      // Escuchar el evento de instalación
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevenir que Chrome muestre su propio prompt automáticamente
        e.preventDefault()
        
        // Guardar el evento para usarlo después
        deferredPrompt.value = e
        canInstall.value = true
        
        console.log('✨ PWA puede instalarse')
      })

      // Detectar cuando se instala
      window.addEventListener('appinstalled', () => {
        console.log('🎉 PWA instalada exitosamente')
        isInstalled.value = true
        canInstall.value = false
        deferredPrompt.value = null
        showInstallModal.value = false
      })
    }
  }

  // Mostrar el prompt de instalación
  const promptInstall = async () => {
    if (!deferredPrompt.value) {
      console.log('No hay prompt disponible')
      return false
    }

    // Mostrar el prompt nativo
    deferredPrompt.value.prompt()

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.value.userChoice
    
    console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} instalar la PWA`)

    // Ya no podemos usar este prompt de nuevo
    deferredPrompt.value = null
    canInstall.value = false

    return outcome === 'accepted'
  }

  // Mostrar modal personalizado
  const showInstallPrompt = () => {
    // Solo mostrar si puede instalarse y no está instalada
    if (canInstall.value && !isInstalled.value) {
      showInstallModal.value = true
    }
  }

  // Cerrar modal sin instalar
  const dismissInstallPrompt = () => {
    showInstallModal.value = false
    
    // Guardar que el usuario rechazó (opcional: no volver a mostrar en X días)
    if (process.client) {
      localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
    }
  }

  // Verificar si debemos mostrar el prompt automáticamente
  const shouldShowAutoPrompt = () => {
    if (!process.client) return false
    if (isInstalled.value) return false
    if (!canInstall.value) return false

    // Verificar si el usuario ya rechazó recientemente
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      
      // No mostrar si rechazó hace menos de 7 días
      if (daysSinceDismissed < 7) {
        return false
      }
    }

    // Verificar si es una visita recurrente (opcional)
    const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0')
    localStorage.setItem('pwa-visit-count', (visitCount + 1).toString())

    // Mostrar después de 2 visitas
    return visitCount >= 2
  }

  // Información sobre la plataforma
  const getPlatformInfo = () => {
    if (!process.client) return { isIOS: false, isAndroid: false, canPrompt: false }

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)
    const canPrompt = canInstall.value || (isIOS && !(window.navigator as any).standalone)

    return {
      isIOS,
      isAndroid,
      canPrompt,
      isStandalone: isInstalled.value
    }
  }

  // Inicializar al montar
  onMounted(() => {
    setupPrompt()
  })

  return {
    canInstall,
    isInstalled,
    showInstallModal,
    promptInstall,
    showInstallPrompt,
    dismissInstallPrompt,
    shouldShowAutoPrompt,
    getPlatformInfo
  }
}
