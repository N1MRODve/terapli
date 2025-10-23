<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#F9F7F3] px-6">
    <div class="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-[#EAD5D3]/40">
      <!-- Encabezado -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-['Lora'] text-[#5D4A44] mb-2">Área de Terapeutas</h1>
        <p class="text-sm text-[#5D4A44]/70 font-['Lato']">Acceso exclusivo para profesionales</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-[#5D4A44] font-['Lato'] mb-1">
            Correo electrónico
          </label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="tu@email.com"
            class="w-full px-4 py-3 border border-[#EAD5D3] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent transition-all outline-none font-['Lato']" 
            required
            :disabled="loading"
          />
        </div>

        <!-- Contraseña -->
        <div>
          <label for="password" class="block text-sm font-medium text-[#5D4A44] font-['Lato'] mb-1">
            Contraseña
          </label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            placeholder="••••••••"
            class="w-full px-4 py-3 border border-[#EAD5D3] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent transition-all outline-none font-['Lato']" 
            required
            :disabled="loading"
          />
        </div>

        <!-- Mensaje de error -->
        <div 
          v-if="error" 
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-['Lato'] flex items-start gap-2"
        >
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span>{{ error }}</span>
        </div>

        <!-- Botón de login -->
        <button 
          type="submit" 
          class="w-full py-3 bg-[#D8AFA0] hover:bg-[#C89B8A] text-white font-['Lato'] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          :disabled="loading"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}</span>
        </button>
      </form>

      <!-- Pie de página opcional -->
      <div class="mt-6 text-center">
        <p class="text-xs text-[#5D4A44]/60 font-['Lato']">
          ¿Problemas para acceder? Contacta a soporte
        </p>
      </div>
    </div>

    <!-- Marca de agua -->
    <div class="mt-8 text-center">
      <p class="text-sm text-[#5D4A44]/50 font-['Lato']">
        © {{ new Date().getFullYear() }} Karem Peña | Gestión Clínica
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

// Estado del formulario
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

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
      await supabase.auth.signOut()
      loading.value = false
      return
    }

    // 3. Validar que el usuario tenga rol de terapeuta, psicóloga, admin o coordinadora
    const userRole = (perfil as any)?.rol
    const rolesPermitidos = ['psicologa', 'admin', 'coordinadora']
    
    if (!userRole || !rolesPermitidos.includes(userRole)) {
      error.value = 'Acceso no autorizado. Esta área es exclusiva para terapeutas.'
      await supabase.auth.signOut()
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
/* Animación suave para el formulario */
form {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Estilos para inputs con mejor feedback visual */
input:focus {
  box-shadow: 0 0 0 3px rgba(216, 175, 160, 0.1);
}

input:disabled {
  background-color: #f9f9f9;
  cursor: not-allowed;
}
</style>
