/**
 * Middleware básico de autenticación
 * Solo verifica que el usuario esté autenticado
 * La redirección basada en roles la maneja auth-role.ts
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Solo ejecutar en el cliente
  if (process.server) return

  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Verificar sesión actual
  const { data: { session } } = await supabase.auth.getSession()

  // Si no hay usuario autenticado, redirigir al login
  if (!user.value && !session) {
    return navigateTo('/login')
  }
})


