<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F2F2F2] via-[#FAFAFA] to-[#F8F9FA] relative overflow-hidden">
    <!-- Elementos decorativos de fondo -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#5550F2]/10 to-[#04BF9D]/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#F2B33D]/10 to-[#5550F2]/10 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#04BF9D]/5 to-[#5550F2]/5 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-md w-full mx-4 relative z-10">
      <!-- Tarjeta principal con glassmorphism -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
        <!-- Logo y título -->
        <div class="text-center mb-10">
          <div class="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#5550F2] to-[#04BF9D] rounded-2xl shadow-lg transform hover:rotate-6 transition-transform duration-300">
            <span class="text-2xl font-bold text-white">T</span>
          </div>
          <h1 class="text-4xl font-serif font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent mb-3">
            Teraplí
          </h1>
          <p class="font-sans text-[#4A5568] text-lg mb-2">
            Bienvenido de vuelta
          </p>
          <p class="font-sans text-sm text-[#718096] max-w-xs mx-auto">
            Sistema de gestión clínica moderna para terapeutas y bienestar para pacientes
          </p>
        </div>

        <!-- Formulario de Login -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email -->
          <div class="group">
            <label for="email" class="block font-sans text-sm font-medium text-[#2D3748] mb-2 transition-colors group-focus-within:text-[#5550F2]">
              Correo electrónico
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-[#A0AEC0] group-focus-within:text-[#5550F2] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                </svg>
              </div>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="w-full pl-12 pr-4 py-4 border-2 border-[#E2E8F0] rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:border-[#5550F2] focus:ring-4 focus:ring-[#5550F2]/20 transition-all duration-300 font-sans placeholder-[#A0AEC0] hover:border-[#CBD5E0]"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <!-- Contraseña -->
          <div class="group">
            <label for="password" class="block font-sans text-sm font-medium text-[#2D3748] mb-2 transition-colors group-focus-within:text-[#5550F2]">
              Contraseña
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-[#A0AEC0] group-focus-within:text-[#5550F2] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full pl-12 pr-12 py-4 border-2 border-[#E2E8F0] rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:border-[#5550F2] focus:ring-4 focus:ring-[#5550F2]/20 transition-all duration-300 font-sans placeholder-[#A0AEC0] hover:border-[#CBD5E0]"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-[#A0AEC0] hover:text-[#5550F2] transition-colors"
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
          </div>

          <!-- Mensajes de estado -->
          <div v-if="errorMessage" class="animate-fade-in-up">
            <div class="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm font-sans flex items-start gap-3 shadow-sm">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          </div>

          <div v-if="successMessage" class="animate-fade-in-up">
            <div class="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 text-green-700 px-4 py-4 rounded-xl text-sm font-sans flex items-start gap-3 shadow-sm">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>{{ successMessage }}</span>
            </div>
          </div>

          <!-- Botón de Login -->
          <button
            type="submit"
            :disabled="isLoading"
            class="group w-full relative overflow-hidden bg-gradient-to-r from-[#5550F2] to-[#04BF9D] hover:from-[#4338CA] hover:to-[#027368] text-white py-4 rounded-xl transition-all duration-300 font-sans font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <!-- Efecto de brillo -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div class="relative flex items-center justify-center gap-3">
              <svg v-if="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
            </div>
          </button>
        </form>

        <!-- Enlaces adicionales -->
        <div class="mt-8 text-center space-y-4">
          <button
            @click="showResetPassword = true"
            class="text-sm font-sans text-[#5550F2] hover:text-[#4338CA] transition-colors duration-200 hover:underline flex items-center justify-center gap-2 mx-auto"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
            </svg>
            ¿Olvidaste tu contraseña?
          </button>
          
          <div class="flex items-center justify-center space-x-2 text-sm">
            <div class="h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent flex-1"></div>
            <span class="text-[#718096] px-2">o</span>
            <div class="h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent flex-1"></div>
          </div>
          
          <p class="text-sm font-sans text-[#718096]">
            ¿Necesitas acceso?
            <NuxtLink to="/contacto" class="text-[#5550F2] hover:text-[#4338CA] font-medium transition-colors duration-200 ml-1">
              Contáctanos
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>

    <!-- Modal de Recuperar Contraseña -->
    <div
      v-if="showResetPassword"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="showResetPassword = false"
    >
      <div class="bg-white/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20 animate-scale-in">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#F2B33D] to-[#5550F2] rounded-2xl mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-serif font-semibold text-[#2D3748] mb-2">Recuperar Contraseña</h3>
          <p class="font-sans text-[#718096] text-sm">
            Te enviaremos un enlace seguro para restablecer tu contraseña
          </p>
        </div>
        
        <form @submit.prevent="handleResetPassword" class="space-y-6">
          <div class="group">
            <label class="block font-sans text-sm font-medium text-[#2D3748] mb-2">
              Correo electrónico
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-[#A0AEC0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                </svg>
              </div>
              <input
                v-model="resetEmail"
                type="email"
                required
                class="w-full pl-12 pr-4 py-4 border-2 border-[#E2E8F0] rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:border-[#5550F2] focus:ring-4 focus:ring-[#5550F2]/20 transition-all duration-300 font-sans placeholder-[#A0AEC0]"
                placeholder="tu@email.com"
              />
            </div>
          </div>
          
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="showResetPassword = false"
              class="flex-1 px-6 py-3 border-2 border-[#E2E8F0] text-[#4A5568] rounded-xl hover:bg-[#F7FAFC] hover:border-[#CBD5E0] transition-all duration-200 font-sans font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isResetting"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-[#F2B33D] to-[#5550F2] text-white rounded-xl hover:from-[#E6A532] hover:to-[#4338CA] transition-all duration-200 font-sans font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
            >
              {{ isResetting ? 'Enviando...' : 'Enviar Enlace' }}
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

<style scoped>
/* Animaciones modernas */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}

/* Glassmorphism effect enhancement */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
}

/* Smooth focus transitions */
input:focus {
  transform: translateY(-1px);
}

/* Hover effects for better UX */
button:not(:disabled):hover {
  transform: translateY(-1px);
}

button:not(:disabled):active {
  transform: translateY(0);
}

/* Enhanced shadow effects */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

/* Gradient text effect for webkit browsers */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}
</style>
