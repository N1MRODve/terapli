<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F9F7F3]">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <!-- Logo o Título -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-['Lora'] font-medium text-[#5D4A44]">Bienvenida</h1>
        <p class="font-['Lato'] text-[#5D4A44] opacity-70 mt-2">
          Inicia sesión para acceder a tu espacio
        </p>
        <p class="font-['Lato'] text-sm text-[#D8AFA0] mt-3">
          Sistema de gestión para psicólogas y espacio de bienestar para pacientes
        </p>
      </div>

      <!-- Formulario de Login -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- Email -->
        <div>
          <label for="email" class="block font-['Lato'] text-sm font-medium text-[#5D4A44] mb-2">
            Correo electrónico
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-[#EAD5D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] transition-all font-['Lato']"
            placeholder="tu@email.com"
          />
        </div>

        <!-- Contraseña -->
        <div>
          <label for="password" class="block font-['Lato'] text-sm font-medium text-[#5D4A44] mb-2">
            Contraseña
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 border border-[#EAD5D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] transition-all font-['Lato']"
            placeholder="••••••••"
          />
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-['Lato']"
        >
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-['Lato']"
        >
          {{ successMessage }}
        </div>

        <!-- Botón de Login -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-[#D8AFA0] hover:bg-[#c99d8d] text-white py-3 rounded-lg transition-all duration-300 font-['Lato'] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <!-- Enlaces adicionales -->
      <div class="mt-6 text-center space-y-2">
        <button
          @click="showResetPassword = true"
          class="text-sm font-['Lato'] text-[#5D4A44] hover:text-[#D8AFA0] underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
        <p class="text-sm font-['Lato'] text-[#5D4A44] opacity-70">
          ¿Necesitas acceso?
          <NuxtLink to="/contacto" class="text-[#D8AFA0] hover:text-[#c99d8d] font-medium">
            Contáctame
          </NuxtLink>
        </p>
      </div>

      <!-- Modal de Recuperar Contraseña -->
      <div
        v-if="showResetPassword"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showResetPassword = false"
      >
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 class="text-xl font-['Lora'] font-medium text-[#5D4A44] mb-4">Recuperar Contraseña</h3>
          <p class="font-['Lato'] text-[#5D4A44] opacity-70 mb-4">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
          <form @submit.prevent="handleResetPassword" class="space-y-4">
            <input
              v-model="resetEmail"
              type="email"
              required
              class="w-full px-4 py-3 border border-[#EAD5D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] font-['Lato']"
              placeholder="tu@email.com"
            />
            <div class="flex gap-3">
              <button
                type="button"
                @click="showResetPassword = false"
                class="flex-1 px-4 py-2 border border-[#EAD5D3] text-[#5D4A44] rounded-lg hover:bg-[#F9F7F3] transition-colors font-['Lato']"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isResetting"
                class="flex-1 px-4 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#c99d8d] transition-colors disabled:opacity-50 font-['Lato']"
              >
                {{ isResetting ? 'Enviando...' : 'Enviar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { signInWithEmail, resetPassword, isAuthenticated, getUserRole, loadUserProfile } = useSupabase()

// Estado reactivo
const email = ref('')
const password = ref('')
const resetEmail = ref('')
const isLoading = ref(false)
const isResetting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showResetPassword = ref(false)

// Función para redirigir según el rol del usuario
const redirectBasedOnRole = async (userId?: string) => {
  try {
    // Esperar a que el usuario y perfil estén completamente cargados
    console.log('[Login] Esperando a que el usuario y perfil estén disponibles...')
    const { waitForUser, userProfile, loadUserProfile, getUserId } = useSupabase()
    
    console.log('[Login] Estado ANTES de waitForUser:', {
      userProfileExists: !!userProfile.value,
      userId: getUserId()
    })
    
    await waitForUser()
    
    console.log('[Login] Estado DESPUÉS de waitForUser:', {
      userProfileExists: !!userProfile.value,
      userId: getUserId(),
      profile: userProfile.value
    })
    
    // Si después de waitForUser aún no hay perfil, intentar cargarlo manualmente con reintentos
    if (!userProfile.value) {
      console.log('[Login] Perfil no cargado después de waitForUser, intentando carga manual...')
      
      // Reintentar hasta 3 veces con delay
      for (let attempt = 1; attempt <= 3; attempt++) {
        await loadUserProfile()
        console.log(`[Login] Intento ${attempt} de loadUserProfile:`, {
          userProfileExists: !!userProfile.value,
          profile: userProfile.value
        })
        
        if (userProfile.value) break
        
        // Esperar 500ms antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    if (!userProfile.value) {
      console.error('[Login] No se pudo cargar el perfil después de todos los intentos')
      errorMessage.value = 'Error al cargar tu perfil. Por favor, intenta de nuevo.'
      return
    }

    const userRole = userProfile.value.rol
    console.log('[Login] Perfil obtenido:', userProfile.value.email, 'Rol:', userRole)

    // Mapeo de roles a rutas - ACTUALIZADO para evitar cache
    const roleRoutes: Record<string, string> = {
      psicologa: '/terapeuta/dashboard',
      terapeuta: '/terapeuta/dashboard',
      coordinadora: '/coordinadora/dashboard',
      admin: '/admin'
    }

    const redirectTo = roleRoutes[userRole]
    
    if (!redirectTo) {
      console.error(`[Login] Rol no reconocido: '${userRole}'`)
      errorMessage.value = `Acceso no autorizado. Tu rol '${userRole}' no tiene permisos para acceder al sistema.`
      // Cerrar sesión si el rol no es válido
      const supabase = useSupabaseClient()
      await supabase.auth.signOut()
      return
    }
    
    console.log(`[Login] Redirigiendo usuario con rol '${userRole}' a ${redirectTo}`)
    await navigateTo(redirectTo, { replace: true })
  } catch (error) {
    console.error('[Login] Error al redirigir:', error)
    errorMessage.value = 'Error al iniciar sesión. Por favor, intenta de nuevo.'
  }
}

// Si ya está autenticado al montar, redirigir
onMounted(async () => {
  if (isAuthenticated.value) {
    // Sin userId, la función lo obtendrá de la sesión
    await redirectBasedOnRole()
  }
})

const handleLogin = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    // Limpiar completamente la caché antes del login
    if (process.client) {
      // Limpiar localStorage y sessionStorage
      localStorage.clear()
      sessionStorage.clear()
      
      // Limpiar cookies de Supabase si existen
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }

    const { data, error } = await signInWithEmail(email.value, password.value)

    if (error) {
      console.error('[Login] Error de autenticación:', error)
      errorMessage.value = 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.'
      isLoading.value = false
      return
    }

    if (!data?.user) {
      errorMessage.value = 'Error al iniciar sesión. Por favor, intenta de nuevo.'
      isLoading.value = false
      return
    }

    console.log('[Login] Usuario autenticado:', data.user.email, 'ID:', data.user.id)
    successMessage.value = 'Inicio de sesión exitoso. Redirigiendo...'
    
    // Estrategia simplificada: redirigir a una página temporal y dejar que el middleware maneje la lógica
    await navigateTo('/dashboard', { replace: true })
  } catch (err) {
    console.error('[Login] Error en handleLogin:', err)
    errorMessage.value = 'Ocurrió un error. Por favor, intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}

const handleResetPassword = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isResetting.value = true

  try {
    const { error } = await resetPassword(resetEmail.value)

    if (error) {
      errorMessage.value = 'No se pudo enviar el correo de recuperación.'
    } else {
      successMessage.value = 'Correo de recuperación enviado. Revisa tu bandeja de entrada.'
      showResetPassword.value = false
      resetEmail.value = ''
    }
  } catch (err) {
    errorMessage.value = 'Ocurrió un error. Por favor, intenta de nuevo.'
  } finally {
    isResetting.value = false
  }
}
</script>
