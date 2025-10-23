/**
 * Middleware de autenticación para el panel de coordinación
 * Protege rutas /coordinacion/* y verifica rol
 */

export default defineNuxtRouteMiddleware(async (to) => {
  // Solo aplicar a rutas de coordinación
  if (!to.path.startsWith('/coordinacion')) {
    return
  }

  // Permitir acceso a la página de login sin autenticación
  if (to.path === '/coordinacion/login') {
    return
  }

  const user = useSupabaseUser()

  // Verificar si hay usuario autenticado
  if (!user.value) {
    return navigateTo('/coordinacion/login')
  }

  try {
    // Verificar que el usuario tiene rol de coordinación en metadata
    const userMetadata = user.value.user_metadata || {}
    const appMetadata = (user.value as any).app_metadata || {}
    
    const rol = userMetadata.rol || appMetadata.rol

    if (rol !== 'coordinacion') {
      console.warn('Usuario intentó acceder a coordinación sin permisos')
      return navigateTo('/')
    }

    // Usuario autenticado y con rol correcto
    return
  } catch (error) {
    console.error('Error en middleware de coordinación:', error)
    return navigateTo('/coordinacion/login')
  }
})

