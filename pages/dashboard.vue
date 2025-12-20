<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Redirigiendo a tu dashboard...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Esta página temporal se usa para redirigir automáticamente según el rol
// El middleware auth-role se encarga de la lógica de redirección

definePageMeta({
  middleware: ['auth', 'auth-role'],
  layout: false
})

// Si llegamos aquí es porque hay un problema con la redirección
// Mostrar por unos segundos y luego intentar una redirección manual
const { getUserRole } = useSupabase()

onMounted(async () => {
  setTimeout(async () => {
    try {
      const role = await getUserRole()
      console.log('[ROLE-REDIRECT] [Dashboard Fallback] Rol detectado:', role)

      if (!role) {
        console.error('[ROLE-REDIRECT] [Dashboard Fallback] No se pudo obtener el rol del usuario')
        await navigateTo('/login', { replace: true })
        return
      }

      const roleRoutes: Record<string, string> = {
        psicologa: '/terapeuta/dashboard',
        terapeuta: '/terapeuta/dashboard',
        coordinadora: '/coordinadora/dashboard',
        paciente: '/paciente/dashboard',
        admin: '/admin'
      }

      const redirectTo = roleRoutes[role]

      if (!redirectTo) {
        console.error(`[ROLE-REDIRECT] [Dashboard Fallback] Rol desconocido: '${role}'`)
        await navigateTo('/acceso-denegado', { replace: true })
        return
      }

      console.log(`[ROLE-REDIRECT] [Dashboard Fallback] Redirigiendo rol '${role}' a:`, redirectTo)
      await navigateTo(redirectTo, { replace: true })
    } catch (error) {
      console.error('[ROLE-REDIRECT] [Dashboard Fallback] Error:', error)
      await navigateTo('/login', { replace: true })
    }
  }, 1000) // Reducido a 1 segundo
})
</script>