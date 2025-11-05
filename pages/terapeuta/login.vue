<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F2F2F2] via-[#FAFAFA] to-[#F8F9FA] px-6 relative overflow-hidden">
    <!-- Elementos decorativos especializados para terapeutas -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-[#027368]/15 to-[#04BF9D]/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-[#5550F2]/15 to-[#F2B33D]/10 rounded-full blur-3xl"></div>
      <div class="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-[#04BF9D]/8 to-[#027368]/8 rounded-full blur-2xl"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <!-- Tarjeta principal con diseño profesional -->
      <div class="bg-white/85 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/30 transform hover:scale-[1.01] transition-all duration-500">
        <!-- Encabezado profesional -->
        <div class="text-center mb-10">
          <div class="mb-6 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#027368] via-[#04BF9D] to-[#5550F2] rounded-3xl shadow-xl transform hover:rotate-12 transition-transform duration-500">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <h1 class="text-4xl font-serif font-bold bg-gradient-to-r from-[#027368] to-[#5550F2] bg-clip-text text-transparent mb-3">
            Área Profesional
          </h1>
          <p class="text-lg font-sans text-[#2D3748] mb-2">Teraplí</p>
          <p class="text-sm font-sans text-[#718096] max-w-xs mx-auto leading-relaxed">
            Acceso exclusivo para terapeutas certificados y profesionales de la salud mental
          </p>
        </div>

        <!-- Formulario profesional -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email con icono profesional -->
          <div class="group">
            <label for="email" class="block text-sm font-semibold text-[#2D3748] font-sans mb-3 transition-colors group-focus-within:text-[#027368]">
              Correo electrónico profesional
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-6 h-6 text-[#A0AEC0] group-focus-within:text-[#027368] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <input 
                id="email"
                v-model="email" 
                type="email" 
                placeholder="nombre@clinica.com"
                class="w-full pl-14 pr-4 py-4 border-2 border-[#E2E8F0] rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:border-[#027368] focus:ring-4 focus:ring-[#027368]/20 transition-all duration-300 font-sans placeholder-[#A0AEC0] text-[#2D3748] hover:border-[#CBD5E0] shadow-sm" 
                required
                :disabled="loading"
              />
            </div>
          </div>

          <!-- Contraseña con indicador de seguridad -->
          <div class="group">
            <label for="password" class="block text-sm font-semibold text-[#2D3748] font-sans mb-3 transition-colors group-focus-within:text-[#027368]">
              Contraseña segura
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-6 h-6 text-[#A0AEC0] group-focus-within:text-[#027368] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input 
                id="password"
                v-model="password" 
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••••••"
                class="w-full pl-14 pr-14 py-4 border-2 border-[#E2E8F0] rounded-xl bg-white/60 backdrop-blur-sm focus:outline-none focus:border-[#027368] focus:ring-4 focus:ring-[#027368]/20 transition-all duration-300 font-sans placeholder-[#A0AEC0] text-[#2D3748] hover:border-[#CBD5E0] shadow-sm" 
                required
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-[#A0AEC0] hover:text-[#027368] transition-colors focus:outline-none"
                :disabled="loading"
              >
                <svg v-if="!showPassword" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Mensaje de error profesional -->
          <div v-if="error" class="animate-fade-in-up">
            <div class="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm font-sans flex items-start gap-4 shadow-sm">
              <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="font-semibold mb-1">Acceso denegado</p>
                <p class="text-xs opacity-90">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Botón de acceso profesional -->
          <button 
            type="submit" 
            class="group w-full relative overflow-hidden bg-gradient-to-r from-[#027368] to-[#5550F2] hover:from-[#025951] hover:to-[#4338CA] text-white py-5 rounded-xl transition-all duration-300 font-sans font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            :disabled="loading"
          >
            <!-- Efecto de brillo profesional -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div class="relative flex items-center justify-center gap-3">
              <svg v-if="loading" class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span>{{ loading ? 'Verificando credenciales...' : 'Acceder al Sistema' }}</span>
            </div>
          </button>
        </form>

        <!-- Enlaces de soporte profesional -->
        <div class="mt-8 text-center space-y-4">
          <div class="flex items-center justify-center space-x-2 text-sm">
            <div class="h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent flex-1"></div>
            <span class="text-[#718096] px-3 font-medium">Soporte</span>
            <div class="h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent flex-1"></div>
          </div>
          
          <p class="text-sm font-sans text-[#718096] flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            ¿Problemas de acceso? Contacta a soporte técnico
          </p>
          
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F2B33D]/10 to-[#5550F2]/10 rounded-full border border-[#F2B33D]/20 text-xs font-medium text-[#2D3748]">
            <div class="w-2 h-2 bg-gradient-to-r from-[#04BF9D] to-[#027368] rounded-full animate-pulse"></div>
            Sistema seguro certificado
          </div>
        </div>
      </div>
    </div>

    <!-- Footer profesional -->
    <div class="mt-8 text-center relative z-10">
      <p class="text-sm font-sans text-[#718096]/80 mb-2">
        © {{ new Date().getFullYear() }} <span class="font-semibold bg-gradient-to-r from-[#027368] to-[#5550F2] bg-clip-text text-transparent">Teraplí</span> | Plataforma Profesional de Gestión Clínica
      </p>
      <p class="text-xs font-sans text-[#A0AEC0]">
        Cumplimiento HIPAA • Datos encriptados • Acceso seguro
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Definir metadata de la página (no requiere autenticación)
definePageMeta({
  layout: false, // Sin layout para página de login
  middleware: [] // Sin middleware para permitir acceso
})

// SEO
useHead({
  title: 'Login Terapeutas | Karem Peña',
  meta: [
    { name: 'description', content: 'Acceso exclusivo para terapeutas de la plataforma de gestión clínica' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { signOut } = useSupabase()

// Estado del formulario
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const showPassword = ref(false)

// Al montar el componente, verificar si hay sesión activa
onMounted(async () => {
  // Si hay un usuario autenticado, verificar su rol
  if (user.value) {
    try {
      const { data: perfil } = await supabase
        .from('profiles' as any)
        .select('rol')
        .eq('id', user.value.id)
        .single()

      const userRole = (perfil as any)?.rol
      const rolesPermitidos = ['psicologa', 'admin', 'coordinadora']
      
      // Si tiene rol permitido, redirigir al dashboard
      if (userRole && rolesPermitidos.includes(userRole)) {
        await router.push('/terapeuta/dashboard')
      } else {
        // Si no tiene rol permitido, cerrar sesión
        await signOut()
      }
    } catch (err) {
      console.error('Error al verificar sesión:', err)
      // En caso de error, cerrar sesión por seguridad
      await signOut()
    }
  }
})

/**
 * Maneja el proceso de autenticación
 */
const handleLogin = async () => {
  error.value = null
  loading.value = true

  try {
    // 1. Intentar iniciar sesión con Supabase
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    })

    if (signInError) {
      console.error('Error de autenticación:', signInError)
      error.value = 'Correo o contraseña incorrectos. Por favor, verifica tus credenciales.'
      loading.value = false
      return
    }

    if (!data.user) {
      error.value = 'No se pudo iniciar sesión. Intenta nuevamente.'
      loading.value = false
      return
    }

    // 2. Verificar el rol del usuario en la tabla profiles (consulta sin tipado estricto)
    const { data: perfil, error: perfilError } = await supabase
      .from('profiles' as any)
      .select('rol, nombre')
      .eq('id', data.user.id)
      .single()

    if (perfilError) {
      console.error('Error al verificar perfil:', perfilError)
      error.value = 'Error al validar tu perfil. Contacta a soporte.'
      await signOut()
      loading.value = false
      return
    }

    // 3. Validar que el usuario tenga rol de terapeuta, psicóloga, admin o coordinadora
    const userRole = (perfil as any)?.rol
    const rolesPermitidos = ['psicologa', 'admin', 'coordinadora']
    
    if (!userRole || !rolesPermitidos.includes(userRole)) {
      error.value = 'Acceso no autorizado. Esta área es exclusiva para terapeutas.'
      await signOut()
      loading.value = false
      return
    }

    // 4. Redirigir al dashboard de terapeuta
    await router.push('/terapeuta/dashboard')
    
  } catch (err) {
    console.error('Error inesperado durante el login:', err)
    error.value = 'Ocurrió un error inesperado. Por favor, intenta nuevamente.'
    loading.value = false
  }
}
</script>

<style scoped>
/* Animaciones profesionales */
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

@keyframes professional-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(2, 115, 104, 0.1);
  }
  50% {
    box-shadow: 0 0 30px rgba(2, 115, 104, 0.2), 0 0 40px rgba(4, 191, 157, 0.1);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out;
}

/* Animación suave para el formulario */
form {
  animation: fade-in-up 0.5s ease-out 0.1s both;
}

/* Efectos avanzados para inputs */
input:focus {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(2, 115, 104, 0.15);
}

input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Glassmorphism mejorado */
.backdrop-blur-2xl {
  backdrop-filter: blur(40px);
}

/* Hover effects profesionales */
button:not(:disabled):hover {
  transform: translateY(-2px);
}

button:not(:disabled):active {
  transform: translateY(0);
}

/* Animación del indicador de sistema seguro */
@keyframes pulse-secure {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.animate-pulse {
  animation: pulse-secure 2s ease-in-out infinite;
}

/* Gradiente de texto para webkit */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* Sombras profesionales */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.12), 
              0 0 0 1px rgba(255, 255, 255, 0.5);
}

/* Efecto hover especial para la tarjeta principal */
.bg-white\/85:hover {
  background-color: rgba(255, 255, 255, 0.9);
  animation: professional-glow 3s ease-in-out infinite;
}
</style>
