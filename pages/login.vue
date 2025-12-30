<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FAFAFA] relative">
    <!-- Fondo sutil -->
    <div class="absolute inset-0 bg-gradient-to-b from-violet-50/50 to-white"></div>

    <div class="max-w-md w-full mx-4 relative z-10 py-12">
      <!-- Tarjeta principal -->
      <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-10">
        <!-- Logo y título -->
        <div class="text-center mb-10">
          <div class="mb-6 inline-flex items-center justify-center w-14 h-14 bg-violet-600 rounded-xl">
            <span class="text-xl font-bold text-white">T</span>
          </div>
          <h1 class="text-2xl font-semibold text-gray-900 mb-2">
            Accede a tu panel de gestión
          </h1>
          <p class="text-gray-500 text-sm">
            Plataforma de gestión clínica para profesionales
          </p>
        </div>

        <!-- Formulario de Login -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              :class="[
                'w-full px-4 py-3 border rounded-lg bg-white transition-all duration-200 text-gray-900 placeholder-gray-400',
                emailError
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
              ]"
              placeholder="nombre@clinica.com"
              @input="emailError = ''"
            />
            <p v-if="emailError" class="mt-1.5 text-sm text-red-600">{{ emailError }}</p>
          </div>

          <!-- Contraseña -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                :class="[
                  'w-full px-4 py-3 pr-12 border rounded-lg bg-white transition-all duration-200 text-gray-900 placeholder-gray-400',
                  passwordError
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                ]"
                placeholder="Introduce tu contraseña"
                @input="passwordError = ''"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
              </button>
            </div>
            <p v-if="passwordError" class="mt-1.5 text-sm text-red-600">{{ passwordError }}</p>
          </div>

          <!-- Mensaje de error general -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Mensaje de éxito -->
          <div v-if="successMessage" class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>{{ successMessage }}</span>
          </div>

          <!-- Botón de Login -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? 'Iniciando sesión...' : 'Iniciar sesión' }}</span>
          </button>
        </form>

        <!-- Enlaces secundarios -->
        <div class="mt-6 text-center space-y-3">
          <button
            @click="showResetPassword = true"
            class="text-sm text-gray-500 hover:text-violet-600 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>

          <p class="text-sm text-gray-400">
            ¿Necesitas una cuenta?
            <NuxtLink to="/#waitlist" class="text-violet-600 hover:text-violet-700 font-medium">
              Solicitar acceso
            </NuxtLink>
          </p>
        </div>

        <!-- Badge de seguridad -->
        <div class="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <span>Acceso seguro para profesionales sanitarios</span>
        </div>
      </div>

      <!-- Link externo -->
      <p class="text-center mt-6 text-sm text-gray-400">
        <NuxtLink to="/" class="hover:text-violet-600 transition-colors">
          Volver a Terapli.com
        </NuxtLink>
      </p>
    </div>

    <!-- Modal de Recuperar Contraseña -->
    <div
      v-if="showResetPassword"
      class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      @click.self="showResetPassword = false"
    >
      <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-violet-100 rounded-xl mb-4">
            <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-1">Recuperar contraseña</h3>
          <p class="text-gray-500 text-sm">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <form @submit.prevent="handleResetPassword" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              v-model="resetEmail"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-gray-900 placeholder-gray-400"
              placeholder="nombre@clinica.com"
            />
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="showResetPassword = false"
              class="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isResetting"
              class="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isResetting ? 'Enviando...' : 'Enviar enlace' }}
            </button>
          </div>
        </form>
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
const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')

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
  emailError.value = ''
  passwordError.value = ''
  isLoading.value = true

  try {
    // Limpiar completamente la caché antes del login
    if (process.client) {
      localStorage.clear()
      sessionStorage.clear()

      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }

    console.log('[ROLE-REDIRECT] Iniciando login para:', email.value)
    const { data, error } = await signInWithEmail(email.value, password.value)

    if (error) {
      console.error('[ROLE-REDIRECT] Error de autenticación:', error)
      // Mostrar errores específicos según el tipo
      if (error.message?.includes('Invalid login credentials')) {
        emailError.value = 'Revisa tu correo electrónico'
        passwordError.value = 'O verifica tu contraseña'
      } else if (error.message?.includes('Email not confirmed')) {
        emailError.value = 'Este correo no ha sido verificado'
      } else {
        errorMessage.value = 'Credenciales incorrectas. Verifica tu correo y contraseña.'
      }
      isLoading.value = false
      return
    }

    if (!data?.user) {
      errorMessage.value = 'Error al iniciar sesión. Por favor, intenta de nuevo.'
      isLoading.value = false
      return
    }

    console.log('[ROLE-REDIRECT] Usuario autenticado:', data.user.email, 'ID:', data.user.id)

    // CRÍTICO: Esperar a que el perfil se cargue ANTES de redirigir
    const { loadUserProfile, userProfile } = useSupabase()

    console.log('[ROLE-REDIRECT] Esperando carga de perfil...')
    await loadUserProfile()

    // Reintentar hasta 5 veces si el perfil no se carga
    let attempts = 0
    while (!userProfile.value && attempts < 5) {
      console.log(`[ROLE-REDIRECT] Reintento ${attempts + 1} de carga de perfil...`)
      await new Promise(resolve => setTimeout(resolve, 300))
      await loadUserProfile()
      attempts++
    }

    if (!userProfile.value) {
      console.error('[ROLE-REDIRECT] No se pudo cargar el perfil después de todos los intentos')
      errorMessage.value = 'Error al cargar tu perfil. Por favor, intenta de nuevo.'
      isLoading.value = false
      return
    }

    const userRole = userProfile.value.rol
    console.log('[ROLE-REDIRECT] Perfil cargado correctamente. Email:', userProfile.value.email, 'Rol:', userRole)

    // Mapeo de roles a rutas
    const roleRoutes: Record<string, string> = {
      psicologa: '/terapeuta/dashboard',
      terapeuta: '/terapeuta/dashboard',
      coordinadora: '/coordinadora/dashboard',
      admin: '/admin',
      paciente: '/paciente/dashboard'
    }

    const redirectTo = roleRoutes[userRole]

    if (!redirectTo) {
      console.error(`[ROLE-REDIRECT] Rol no reconocido: '${userRole}'`)
      errorMessage.value = `Acceso no autorizado. Tu rol '${userRole}' no tiene permisos para acceder al sistema.`
      const supabase = useSupabaseClient()
      await supabase.auth.signOut()
      isLoading.value = false
      return
    }

    successMessage.value = 'Inicio de sesión exitoso. Redirigiendo...'
    console.log(`[ROLE-REDIRECT] Redirigiendo usuario con rol '${userRole}' a ${redirectTo}`)

    // Pequeño delay para que el usuario vea el mensaje de éxito
    await new Promise(resolve => setTimeout(resolve, 500))
    await navigateTo(redirectTo, { replace: true })
  } catch (err) {
    console.error('[ROLE-REDIRECT] Error en handleLogin:', err)
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

<style scoped>
/* Focus outline removal for clean look */
input:focus {
  outline: none;
}
</style>
