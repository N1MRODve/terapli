export default defineNuxtPlugin(() => {
  // Solo ejecutar en el cliente
  if (process.client) {
    // Suprimir warnings específicos de Vue durante el desarrollo
    const originalWarn = console.warn
    const originalError = console.error
    
    console.warn = (...args: any[]) => {
      const message = args.join(' ')
      
      // Filtrar warnings específicos que queremos suprimir
      const warningsToSuppress = [
        'injection "Symbol(route location)" not found',
        '<Suspense> is an experimental feature',
        '[Nuxt Content : Hot Content Reload]',
        'WebSocket connection to \'ws://localhost:4000/ws\' failed',
        'WS Error:',
        'WS reconnecting',
        'WS connect to',
        'WS connected',
        'Invalid frame header',
        'Extraneous non-props attributes',
        'were passed to component but could not be automatically inherited',
        '[Vue warn]: injection "Symbol(route location)" not found'
      ]
      
      // Solo mostrar el warning si no está en la lista de supresión
      if (!warningsToSuppress.some(suppressedWarning => message.includes(suppressedWarning))) {
        originalWarn.apply(console, args)
      }
    }
    
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      
      // Filtrar errores específicos que queremos suprimir en desarrollo
      const errorsToSuppress = [
        'WebSocket connection to \'ws://localhost:4000/ws\' failed',
        '[Nuxt Content : Hot Content Reload]',
        'injection "Symbol(route location)" not found'
      ]
      
      // Solo mostrar el error si no está en la lista de supresión
      if (!errorsToSuppress.some(suppressedError => message.includes(suppressedError))) {
        originalError.apply(console, args)
      }
    }
    
    // Interceptar errores de WebSocket específicamente
    const originalWebSocket = window.WebSocket
    window.WebSocket = class extends originalWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols)
        
        // Si es el WebSocket de Content, suprimir errores
        if (url.toString().includes('localhost:4000/ws')) {
          this.addEventListener('error', (event) => {
            // Suprimir error de WebSocket de Content
            event.stopPropagation()
            return false
          })
        }
      }
    }
    
    // Suprimir warnings globales de Vue en desarrollo
    if (process.env.NODE_ENV === 'development') {
      const app = useNuxtApp()
      
      // Configurar handler global de errores
      app.vueApp.config.errorHandler = (err: any, vm: any, info: any) => {
        // Suprimir warnings específicos
        if (err && err.message) {
          const suppressedErrors = [
            'injection "Symbol(route location)" not found',
            'Extraneous non-props attributes'
          ]
          
          if (suppressedErrors.some((suppressed: string) => err.message.includes(suppressed))) {
            return
          }
        }
        
        // Para otros errores, usar el handler por defecto
        console.error('Vue Error:', err, info)
      }
      
      // Suprimir warnings específicos de Vue
      app.vueApp.config.warnHandler = (msg: string, vm: any, trace: any) => {
        // Suprimir warnings específicos
        const warningsToSuppress = [
          'injection "Symbol(route location)" not found',
          'Suspense is an experimental feature',
          'Extraneous non-props attributes',
          'were passed to component but could not be automatically inherited'
        ]
        
        if (!warningsToSuppress.some((warning: string) => msg.includes(warning))) {
          originalWarn('Vue Warning:', msg, trace)
        }
      }
    }
  }
})