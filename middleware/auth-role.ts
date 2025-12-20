/**
 * Middleware de autenticación con redirección basada en roles
 *
 * Este middleware:
 * 1. Verifica que el usuario esté autenticado
 * 2. Obtiene el rol del usuario desde la tabla profiles
 * 3. Redirige al dashboard correspondiente según el rol:
 *    - admin → /admin
 *    - psicologa/terapeuta → /terapeuta/dashboard
 *    - coordinadora → /coordinadora/dashboard
 *    - paciente → /paciente/dashboard
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Solo ejecutar en el cliente
  if (process.server) return

  const { user, getUserRole, loadUserProfile, userProfile } = useSupabase()

  // Si no hay usuario autenticado, dejar que el middleware auth.ts maneje la redirección
  if (!user.value) {
    console.warn('[ROLE-REDIRECT] [auth-role] No hay usuario autenticado, omitiendo verificación de rol')
    return
  }

  console.log('[ROLE-REDIRECT] [auth-role] Verificando acceso a:', to.path, 'desde:', from.path)

  // Cargar el perfil del usuario para obtener su rol
  await loadUserProfile()

  // Reintentar si el perfil no se cargó
  let attempts = 0
  while (!userProfile.value && attempts < 3) {
    console.log(`[ROLE-REDIRECT] [auth-role] Reintento ${attempts + 1} de carga de perfil...`)
    await new Promise(resolve => setTimeout(resolve, 200))
    await loadUserProfile()
    attempts++
  }

  const userRole = await getUserRole()

  if (!userRole) {
    console.error('[ROLE-REDIRECT] [auth-role] No se pudo determinar el rol del usuario después de reintentos')
    return navigateTo('/acceso-denegado', { replace: true })
  }

  console.log('[ROLE-REDIRECT] [auth-role] Usuario con rol:', userRole, 'accediendo a:', to.path)

  // Determinar la ruta base según el rol
  const roleBasePath: Record<string, string> = {
    psicologa: '/terapeuta',
    terapeuta: '/terapeuta',
    coordinadora: '/coordinadora',
    admin: '/admin',
    paciente: '/paciente'
  }

  const basePath = roleBasePath[userRole]

  if (!basePath) {
    console.error(`[ROLE-REDIRECT] [auth-role] Rol desconocido: ${userRole}`)
    return navigateTo('/acceso-denegado', { replace: true })
  }

  // Si el usuario está intentando acceder a una ruta que no corresponde a su rol
  const currentPath = to.path

  // Evitar bucle de redirección si ya está en su ruta correcta
  if (currentPath.startsWith(basePath)) {
    console.log(`[ROLE-REDIRECT] [auth-role] Acceso permitido a ${currentPath} para rol '${userRole}'`)
    return
  }

  // Evitar redirigir rutas públicas como /login, /contacto, etc.
  const publicRoutes = ['/login', '/contacto', '/legal', '/', '/acceso-denegado']
  if (publicRoutes.some(route => currentPath === route || currentPath.startsWith(route))) {
    return
  }

  // Si está intentando acceder a un área de otro rol, redirigir a su dashboard
  const otherRolePaths = Object.values(roleBasePath).filter(p => p !== basePath)
  if (otherRolePaths.some(path => currentPath.startsWith(path))) {
    console.warn(`[ROLE-REDIRECT] [auth-role] ACCESO BLOQUEADO: Usuario con rol '${userRole}' intentó acceder a ${currentPath}`)
    console.log(`[ROLE-REDIRECT] [auth-role] Redirigiendo a ${basePath}/dashboard`)
    return navigateTo(`${basePath}/dashboard`, { replace: true })
  }

  // Si es /dashboard (genérico), redirigir al dashboard específico del rol
  if (currentPath === '/dashboard') {
    console.log(`[ROLE-REDIRECT] [auth-role] Redirigiendo desde /dashboard genérico a ${basePath}/dashboard para rol '${userRole}'`)
    return navigateTo(`${basePath}/dashboard`, { replace: true })
  }
})
