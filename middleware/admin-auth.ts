/**
 * Middleware de autenticación para administradores
 * 
 * Este middleware verifica que:
 * 1. El usuario esté autenticado
 * 2. El usuario tenga rol de 'admin' o 'coordinadora' (como staff)
 * 3. Redirige a login si no está autenticado
 * 4. Redirige al dashboard correspondiente si no tiene permisos
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Solo ejecutar en el cliente
  if (process.server) return

  const supabase = useSupabaseClient()
  const router = useRouter()

  try {
    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.warn('[admin-auth] Usuario no autenticado, redirigiendo a login')
      return navigateTo('/login')
    }

    // Obtener rol del usuario
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[admin-auth] Error al obtener perfil:', error)
      return navigateTo('/login')
    }

    if (!profile) {
      console.error('[admin-auth] No se encontró perfil para el usuario')
      return navigateTo('/login')
    }

    // Verificar que tenga rol de admin o coordinadora (staff con permisos)
    const rolesPermitidos = ['admin', 'coordinadora']
    
    if (!rolesPermitidos.includes(profile.rol)) {
      console.warn(`[admin-auth] Acceso denegado. Rol del usuario: ${profile.rol}`)
      
      // Redirigir al dashboard correspondiente según su rol
      const roleRedirects: Record<string, string> = {
        psicologa: '/terapeuta/dashboard',
        terapeuta: '/terapeuta/dashboard',
        paciente: '/paciente/dashboard'
      }

      const redirectPath = roleRedirects[profile.rol] || '/login'
      return navigateTo(redirectPath)
    }

    console.log(`[admin-auth] Acceso permitido para usuario con rol: ${profile.rol}`)

  } catch (err) {
    console.error('[admin-auth] Error en middleware:', err)
    return navigateTo('/login')
  }
})
