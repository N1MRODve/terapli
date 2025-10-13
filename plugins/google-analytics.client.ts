export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const GA_ID = 'G-423R3JT85S'

  // Inicializar dataLayer
  window.dataLayer = window.dataLayer || []
  
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments)
  }

  // Configurar consentimiento por defecto (denegado hasta que el usuario acepte)
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'wait_for_update': 500
  })

  // Cargar script de Google Analytics de forma asíncrona
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  // Inicializar GA4
  gtag('js', new Date())
  gtag('config', GA_ID, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
    send_page_view: true
  })

  // Verificar si ya existe consentimiento guardado
  const checkStoredConsent = () => {
    try {
      const consent = localStorage.getItem('cookie_consent')
      if (consent) {
        const { preferences } = JSON.parse(consent)
        if (preferences?.analytics) {
          updateGAConsent(true)
        }
      }
    } catch (error) {
      console.error('Error al verificar consentimiento:', error)
    }
  }

  // Función para actualizar el consentimiento de GA
  const updateGAConsent = (granted: boolean) => {
    gtag('consent', 'update', {
      'analytics_storage': granted ? 'granted' : 'denied'
    })
    
    if (granted) {
      console.log('✅ Google Analytics activado')
    } else {
      console.log('❌ Google Analytics desactivado')
    }
  }

  // Verificar consentimiento al cargar
  checkStoredConsent()

  // Escuchar cambios en el consentimiento
  window.addEventListener('cookie-consent-updated', ((event: CustomEvent) => {
    const { analytics } = event.detail
    updateGAConsent(analytics)
  }) as EventListener)

  // Exponer gtag globalmente
  window.gtag = gtag

  // Proporcionar helper para tracking de eventos
  return {
    provide: {
      gtag,
      trackEvent: (eventName: string, eventParams?: object) => {
        gtag('event', eventName, eventParams)
      }
    }
  }
})

// Declaración de tipos para TypeScript
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
