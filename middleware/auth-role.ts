/**
 * Middleware de autenticación con redirección basada en roles
 * 
 * Este middleware:
 * 1. Verifica que el usuario esté autenticado
 * 2. Obtiene el rol del usuario desde la tabla profiles
 * 3. Redirige al dashboard correspondiente según el rol:
 *    - psicologa → /terapeuta/dashboard
 *    - coordinadora → /coordinacion/dashboard
 *    - paciente → /paciente/dashboard
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Solo ejecutar en el cliente
  if (process.server) return

  const { user, getUserRole, loadUserProfile } = useSupabase()

  // Si no hay usuario autenticado, dejar que el middleware auth.ts maneje la redirección
  if (!user.value) {
    console.warn('[auth-role] No hay usuario autenticado, omitiendo verificación de rol')
    return
  }

  // Cargar el perfil del usuario para obtener su rol
  await loadUserProfile()
  const userRole = await getUserRole()

  if (!userRole) {
    console.error('[auth-role] No se pudo determinar el rol del usuario')
    // No redirigir, simplemente registrar el error
    return
  }

  console.log('[auth-role] Usuario con rol:', userRole, 'accediendo a:', to.path)

  // Determinar la ruta base según el rol
  const roleBasePath: Record<string, string> = {
    psicologa: '/terapeuta',
    coordinadora: '/coordinadora',
    paciente: '/paciente'
  }

  const basePath = roleBasePath[userRole]

  if (!basePath) {
    console.error(`[auth-role] Rol desconocido: ${userRole}`)
    return
  }

  // Si el usuario está intentando acceder a una ruta que no corresponde a su rol
  const currentPath = to.path

  // Evitar bucle de redirección si ya está en su ruta correcta
  if (currentPath.startsWith(basePath)) {
    return
  }

  // Evitar redirigir rutas públicas como /login, /contacto, etc.
  const publicRoutes = ['/login', '/contacto', '/legal', '/']
  if (publicRoutes.some(route => currentPath === route || currentPath.startsWith(route))) {
    return
  }

  // Si está intentando acceder a un área de otro rol, redirigir a su dashboard
  const otherRolePaths = Object.values(roleBasePath).filter(p => p !== basePath)
  if (otherRolePaths.some(path => currentPath.startsWith(path))) {
    console.log(`[auth-role] Usuario con rol '${userRole}' redirigido de ${currentPath} a ${basePath}/dashboard`)
    return navigateTo(`${basePath}/dashboard`)
  }
})
