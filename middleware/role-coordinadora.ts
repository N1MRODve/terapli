/**
 * Middleware de protección para rutas de coordinadora
 * 
 * Este middleware:
 * 1. Verifica que el usuario esté autenticado
 * 2. Obtiene el rol del usuario desde la tabla profiles
 * 3. Si el rol no es 'coordinadora', redirige al dashboard correcto según su rol:
 *    - psicologa → /terapeuta/dashboard
 *    - paciente → /paciente/dashboard
 *    - coordinadora (ruta /coordinacion) → /coordinadora/dashboard
 * 4. Maneja correctamente SSR/CSR y estados de carga
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Solo ejecutar en el cliente para evitar problemas con SSR
  if (process.server) return

  const { user, getUserRole, loadUserProfile, userProfile, waitForUser } = useSupabase()

  // Si no hay usuario autenticado, dejar que el middleware auth.ts maneje la redirección
  if (!user.value) {
    console.warn('[role-coordinadora] No hay usuario autenticado, omitiendo verificación de rol')
    return
  }

  try {
    // Esperar a que el usuario y perfil estén disponibles
    console.log('[role-coordinadora] Esperando carga de usuario y perfil...')
    await waitForUser()

    // Si aún no hay perfil después de waitForUser, intentar carga manual
    if (!userProfile.value) {
      console.log('[role-coordinadora] Perfil no disponible, cargando manualmente...')
      await loadUserProfile()
    }

    // Si después de intentar cargar no hay perfil, registrar error pero no redirigir
    // (puede ser un problema temporal de red)
    if (!userProfile.value) {
      console.error('[role-coordinadora] No se pudo cargar el perfil del usuario')
      return
    }

    const userRole = userProfile.value.rol
    console.log('[role-coordinadora] Usuario con rol:', userRole, 'accediendo a:', to.path)

    // Si el usuario es coordinadora, permitir acceso
    if (userRole === 'coordinadora') {
      console.log('[role-coordinadora] Acceso permitido para coordinadora')
      return
    }

    // Si el usuario no es coordinadora, redirigir a su dashboard correspondiente
    console.log(`[role-coordinadora] Usuario con rol '${userRole}' no autorizado, redirigiendo...`)

    const roleBasePath: Record<string, string> = {
      psicologa: '/terapeuta/dashboard',
      coordinadora: '/coordinadora/dashboard',
      paciente: '/paciente/dashboard'
    }

    const redirectPath = roleBasePath[userRole] || '/login'

    // Evitar bucle de redirección - verificar que no estemos ya en la ruta de destino
    if (to.path === redirectPath) {
      console.log('[role-coordinadora] Ya en la ruta de destino, evitando bucle')
      return
    }

    console.log(`[role-coordinadora] Redirigiendo a ${redirectPath}`)
    return navigateTo(redirectPath, { replace: true })

  } catch (error) {
    console.error('[role-coordinadora] Error al verificar rol:', error)
    // En caso de error, no redirigir para evitar romper la navegación
    return
  }
})
