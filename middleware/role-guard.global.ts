/**
 * Middleware global de protección de rutas por rol
 *
 * Asegura que cada usuario solo pueda acceder a las rutas correspondientes a su rol.
 * Este middleware se ejecuta en TODAS las rutas y verifica el acceso basado en el rol.
 *
 * Protecciones:
 * - /paciente/* → Solo rol 'paciente'
 * - /terapeuta/* → Solo rol 'psicologa' o 'terapeuta'
 * - /coordinadora/* → Solo rol 'coordinadora'
 * - /admin/* → Solo rol 'admin'
 *
 * Si un usuario intenta acceder a un área no autorizada, es redirigido a su dashboard.
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Solo ejecutar en el cliente
  if (process.server) return

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/login',
    '/contacto',
    '/legal',
    '/',
    '/acceso-denegado',
    '/reset-password'
  ]

  // Si es una ruta pública, permitir acceso
  if (publicRoutes.some(route => to.path === route || to.path.startsWith(route))) {
    return
  }

  const { user, getUserRole, userProfile } = useSupabase()

  // Si no hay usuario autenticado, redirigir a login
  if (!user.value) {
    console.warn('[ROLE-REDIRECT] [role-guard] Usuario no autenticado intentando acceder a:', to.path)
    return navigateTo('/login', { replace: true })
  }

  // Obtener el rol del usuario
  const userRole = await getUserRole()

  if (!userRole) {
    console.error('[ROLE-REDIRECT] [role-guard] No se pudo obtener el rol del usuario')
    return navigateTo('/login', { replace: true })
  }

  // Mapeo de áreas protegidas y roles permitidos
  const protectedAreas: Record<string, string[]> = {
    '/paciente': ['paciente'],
    '/terapeuta': ['psicologa', 'terapeuta'],
    '/coordinadora': ['coordinadora'],
    '/admin': ['admin']
  }

  // Verificar si el usuario está intentando acceder a un área protegida
  for (const [area, allowedRoles] of Object.entries(protectedAreas)) {
    if (to.path.startsWith(area)) {
      if (!allowedRoles.includes(userRole)) {
        console.warn(`[ROLE-REDIRECT] [role-guard] ACCESO BLOQUEADO: Rol '${userRole}' intentó acceder a ${to.path}`)

        // Determinar el dashboard correcto para este usuario
        const dashboardMap: Record<string, string> = {
          psicologa: '/terapeuta/dashboard',
          terapeuta: '/terapeuta/dashboard',
          coordinadora: '/coordinadora/dashboard',
          admin: '/admin',
          paciente: '/paciente/dashboard'
        }

        const userDashboard = dashboardMap[userRole]

        if (userDashboard) {
          console.log(`[ROLE-REDIRECT] [role-guard] Redirigiendo a dashboard correcto: ${userDashboard}`)
          return navigateTo(userDashboard, { replace: true })
        } else {
          return navigateTo('/acceso-denegado', { replace: true })
        }
      }

      console.log(`[ROLE-REDIRECT] [role-guard] Acceso permitido: Rol '${userRole}' puede acceder a ${to.path}`)
      return
    }
  }
})
