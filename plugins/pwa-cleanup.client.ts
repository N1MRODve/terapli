/**
 * Plugin para limpiar Service Workers y caches en desarrollo
 *
 * Este plugin se ejecuta SOLO en desarrollo y asegura que:
 * 1. No haya Service Workers registrados
 * 2. Todas las caches estén limpias
 * 3. No interfiera Workbox con el desarrollo
 *
 * En producción, este plugin no hace nada.
 */

export default defineNuxtPlugin(() => {
  // Solo ejecutar en desarrollo Y en el cliente
  if (process.env.NODE_ENV !== 'development' || !process.client) {
    return
  }

  console.log('🧹 [PWA Cleanup] Limpiando Service Workers en desarrollo...')

  // 1. Desregistrar todos los Service Workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) {
        console.log('✅ [PWA Cleanup] No hay Service Workers registrados')
        return
      }

      console.warn(`⚠️ [PWA Cleanup] Encontrados ${registrations.length} Service Workers, desregistrando...`)

      registrations.forEach((registration) => {
        registration.unregister().then((success) => {
          if (success) {
            console.log('✅ [PWA Cleanup] Service Worker desregistrado:', registration.scope)
          } else {
            console.error('❌ [PWA Cleanup] Error al desregistrar SW:', registration.scope)
          }
        })
      })
    }).catch((error) => {
      console.error('❌ [PWA Cleanup] Error al obtener registros de SW:', error)
    })
  }

  // 2. Limpiar todas las caches
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      if (cacheNames.length === 0) {
        console.log('✅ [PWA Cleanup] No hay caches para limpiar')
        return
      }

      console.warn(`⚠️ [PWA Cleanup] Encontradas ${cacheNames.length} caches, limpiando...`)

      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName).then((success) => {
            if (success) {
              console.log('✅ [PWA Cleanup] Cache eliminada:', cacheName)
            } else {
              console.error('❌ [PWA Cleanup] Error al eliminar cache:', cacheName)
            }
          })
        })
      )
    }).catch((error) => {
      console.error('❌ [PWA Cleanup] Error al limpiar caches:', error)
    })
  }

  // 3. Limpiar localStorage relacionado con PWA (opcional)
  try {
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('workbox-') || key.startsWith('pwa-'))) {
        keysToRemove.push(key)
      }
    }

    if (keysToRemove.length > 0) {
      console.warn(`⚠️ [PWA Cleanup] Limpiando ${keysToRemove.length} entradas de localStorage relacionadas con PWA`)
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        console.log('✅ [PWA Cleanup] Eliminada entrada de localStorage:', key)
      })
    }
  } catch (error) {
    console.error('❌ [PWA Cleanup] Error al limpiar localStorage:', error)
  }

  // 4. Advertencia si detectamos que Workbox está activo
  const checkWorkbox = () => {
    if (window.workbox || (window as any).__WB_MANIFEST) {
      console.error('❌ [PWA Cleanup] ADVERTENCIA: Workbox está activo en desarrollo!')
      console.error('   Esto NO debería pasar. Verifica nuxt.config.ts:')
      console.error('   - pwa.disable debe ser true en desarrollo')
      console.error('   - pwa.devOptions.enabled debe ser false')
    }
  }

  // Verificar inmediatamente y después de 1 segundo (por si carga tarde)
  checkWorkbox()
  setTimeout(checkWorkbox, 1000)

  console.log('✅ [PWA Cleanup] Limpieza completada')
})

// Declaración de tipos para TypeScript
declare global {
  interface Window {
    workbox?: any
  }
}
