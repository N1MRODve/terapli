export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useSupabase()

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
