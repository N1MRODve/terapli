export const useAnalytics = () => {
  const { $gtag, $trackEvent } = useNuxtApp()

  // Función para hacer tracking de eventos personalizados
  const trackEvent = (eventName: string, eventParams?: object) => {
    if (typeof $trackEvent === 'function') {
      $trackEvent(eventName, eventParams)
    }
  }

  // Eventos específicos para el sitio de psicología
  const trackButtonClick = (buttonName: string, location?: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      page_location: location || window.location.pathname
    })
  }

  const trackFormSubmit = (formName: string) => {
    trackEvent('form_submit', {
      form_name: formName
    })
  }

  const trackPageView = (pageName: string) => {
    trackEvent('page_view', {
      page_title: pageName,
      page_path: window.location.pathname
    })
  }

  const trackWhatsAppClick = () => {
    trackEvent('contact_whatsapp', {
      contact_method: 'whatsapp'
    })
  }

  const trackBookingIntent = (service?: string) => {
    trackEvent('booking_intent', {
      service_type: service || 'general'
    })
  }

  return {
    trackEvent,
    trackButtonClick,
    trackFormSubmit,
    trackPageView,
    trackWhatsAppClick,
    trackBookingIntent
  }
}
