<template>
  <div class="min-h-screen bg-gradient-to-br from-[#F9F7F3] to-[#E8DFD8] flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Logo y título -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] mb-4 shadow-lg">
          <Icon name="heroicons:calendar-days" class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-3xl font-lora font-bold text-[#5D4A44] mb-2">
          Panel de Coordinación
        </h1>
        <p class="text-[#8B7470]">
          Gestión de citas y comunicación con pacientes
        </p>
      </div>

      <!-- Formulario de login -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-[#E8DFD8]">
        <form @submit.prevent="iniciarSesion" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-[#5D4A44] mb-2">
              Correo electrónico
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="heroicons:envelope" class="w-5 h-5 text-[#8B7470]" />
              </div>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="tu-email@ejemplo.com"
                class="w-full pl-10 pr-4 py-3 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent transition-all"
                :disabled="cargando"
              />
            </div>
          </div>

          <!-- Contraseña -->
          <div>
            <label for="password" class="block text-sm font-medium text-[#5D4A44] mb-2">
              Contraseña
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="heroicons:lock-closed" class="w-5 h-5 text-[#8B7470]" />
              </div>
              <input
                id="password"
                v-model="password"
                :type="mostrarPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full pl-10 pr-12 py-3 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent transition-all"
                :disabled="cargando"
              />
              <button
                type="button"
                @click="mostrarPassword = !mostrarPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                :disabled="cargando"
              >
                <Icon 
                  :name="mostrarPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" 
                  class="w-5 h-5 text-[#8B7470] hover:text-[#5D4A44] transition-colors"
                />
              </button>
            </div>
          </div>

          <!-- Mensaje de error -->
          <div 
            v-if="error"
            class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
          >
            <Icon name="heroicons:exclamation-circle" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>

          <!-- Botón de login -->
          <button
            type="submit"
            :disabled="cargando || !email || !password"
            class="w-full py-3 px-4 bg-gradient-to-r from-[#D8AFA0] to-[#C49484] text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            <Icon 
              v-if="cargando" 
              name="heroicons:arrow-path" 
              class="w-5 h-5 animate-spin" 
            />
            <Icon 
              v-else 
              name="heroicons:arrow-right-on-rectangle" 
              class="w-5 h-5" 
            />
            <span>{{ cargando ? 'Verificando...' : 'Iniciar sesión' }}</span>
          </button>
        </form>

        <!-- Información adicional -->
        <div class="mt-6 pt-6 border-t border-[#E8DFD8]">
          <p class="text-xs text-center text-[#8B7470]">
            Este panel es exclusivo para personal de coordinación.
          </p>
          <p class="text-xs text-center text-[#8B7470] mt-2">
            Si necesitas ayuda, contacta a tu administrador.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-sm text-[#8B7470]">
        <p>Psicóloga Karem · Sistema de gestión clínica</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()
const router = useRouter()
const { signOut } = useSupabase()

// Estado
const email = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const cargando = ref(false)
const error = ref('')

// Función de login
const iniciarSesion = async () => {
  if (!email.value || !password.value) {
    error.value = 'Por favor completa todos los campos'
    return
  }

  cargando.value = true
  error.value = ''

  try {
    // Intentar iniciar sesión
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (authError) {
      console.error('Error de autenticación:', authError)
      
      if (authError.message.includes('Invalid login credentials')) {
        error.value = 'Credenciales incorrectas. Verifica tu email y contraseña.'
      } else if (authError.message.includes('Email not confirmed')) {
        error.value = 'Tu email aún no ha sido confirmado. Revisa tu correo.'
      } else {
        error.value = 'Error al iniciar sesión. Intenta nuevamente.'
      }
      
      cargando.value = false
      return
    }

    if (!data.user) {
      error.value = 'No se pudo autenticar el usuario'
      cargando.value = false
      return
    }

    // Verificar rol del usuario
    const userMetadata = data.user.user_metadata || {}
    const appMetadata = (data.user as any).app_metadata || {}
    const rol = userMetadata.rol || appMetadata.rol

    if (rol !== 'coordinacion') {
      error.value = 'No tienes permisos de coordinación. Este panel es exclusivo para personal autorizado.'
      
      // Cerrar sesión inmediatamente
      await signOut()
      cargando.value = false
      return
    }

    // Login exitoso, redirigir al dashboard
    await router.push('/coordinacion/dashboard')
  } catch (err) {
    console.error('Error inesperado:', err)
    error.value = 'Ocurrió un error inesperado. Por favor intenta nuevamente.'
    cargando.value = false
  }
}

// Verificar si ya está autenticado
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const userMetadata = user.user_metadata || {}
    const appMetadata = (user as any).app_metadata || {}
    const rol = userMetadata.rol || appMetadata.rol

    if (rol === 'coordinacion') {
      router.push('/coordinacion/dashboard')
    }
  }
})
</script>

<style scoped>
/* Animación suave para inputs */
input:focus {
  transform: translateY(-1px);
}

/* Animación para el botón */
button[type="submit"]:not(:disabled):active {
  transform: translateY(0) !important;
}
</style>
