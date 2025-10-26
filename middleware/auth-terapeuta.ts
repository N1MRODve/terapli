/**
 * Middleware de autenticación para terapeutas
 * 
 * Protege las rutas del área de terapeutas verificando:
 * 1. Que el usuario esté autenticado
 * 2. Que el usuario tenga rol de 'terapeuta' en la tabla profiles
 * 
 * Si no cumple las condiciones, redirige según el caso:
 * - Sin autenticación -> /terapeuta/login
 * - Sin rol de terapeuta -> /
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Solo aplicar a rutas de terapeuta (excepto login)
  if (!to.path.startsWith('/terapeuta') || to.path === '/terapeuta/login') {
    return
  }

  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // 1. Verificar si el usuario está autenticado
  if (!user.value) {
    console.log('[Middleware] Usuario no autenticado, redirigiendo a login')
    return navigateTo('/terapeuta/login', { replace: true })
  }

  try {
    // 2. Obtener el perfil del usuario desde Supabase (consulta sin tipado estricto)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles' as any)
      .select('rol, nombre')
      .eq('id', user.value.id)
      .single()

    if (profileError) {
      console.error('[Middleware] Error al obtener perfil:', profileError)
      // Si hay error al obtener el perfil, redirigir a login
      return navigateTo('/terapeuta/login', { replace: true })
    }

    // 3. Verificar que el usuario tenga rol de terapeuta, psicóloga, admin o coordinadora
    const userRole = (profileData as any)?.rol
    const rolesPermitidos = ['psicologa', 'admin', 'coordinadora']
    
    if (!userRole || !rolesPermitidos.includes(userRole)) {
      console.log(`[Middleware] Usuario con rol '${userRole}' sin acceso, redirigiendo a home`)
      // Redirigir si no tiene rol permitido (sin cerrar sesión, puede tener acceso a otra área)
      return navigateTo('/', { replace: true })
    }

    // Usuario autenticado y con rol correcto, permitir acceso
    console.log(`[Middleware] Acceso autorizado para: ${(profileData as any)?.nombre || 'profesional'} (${userRole})`)
    
  } catch (err) {
    console.error('[Middleware] Error inesperado:', err)
    // En caso de error, redirigir a login por seguridad
    return navigateTo('/terapeuta/login', { replace: true })
  }
})
