<template>
  <div class="min-h-screen flex items-center justify-center bg-sage-50">
    <div class="max-w-md w-full bg-white rounded-lg shadow-gentle p-8">
      <!-- Logo o Título -->
      <div class="text-center mb-8">
        <h1 class="section-title text-sage-800">Área de Pacientes</h1>
        <p class="body-text text-sage-600 mt-2">
          Inicia sesión para acceder a tu espacio personal
        </p>
      </div>

      <!-- Formulario de Login -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- Email -->
        <div>
          <label for="email" class="label-text text-sage-700 mb-2">
            Correo electrónico
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all"
            placeholder="tu@email.com"
          />
        </div>

        <!-- Contraseña -->
        <div>
          <label for="password" class="label-text text-sage-700 mb-2">
            Contraseña
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all"
            placeholder="••••••••"
          />
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg microcopy"
        >
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg microcopy"
        >
          {{ successMessage }}
        </div>

        <!-- Botón de Login -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-sage-600 hover:bg-sage-700 text-white py-3 rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <!-- Enlaces adicionales -->
      <div class="mt-6 text-center space-y-2">
        <button
          @click="showResetPassword = true"
          class="microcopy text-sage-600 hover:text-sage-800 underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
        <p class="microcopy text-sage-600">
          ¿Necesitas acceso?
          <NuxtLink to="/contacto" class="text-sage-700 hover:text-sage-900 font-medium">
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
          <h3 class="card-title text-sage-800 mb-4">Recuperar Contraseña</h3>
          <p class="body-text text-sage-600 mb-4">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
          <form @submit.prevent="handleResetPassword" class="space-y-4">
            <input
              v-model="resetEmail"
              type="email"
              required
              class="w-full px-4 py-3 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
              placeholder="tu@email.com"
            />
            <div class="flex gap-3">
              <button
                type="button"
                @click="showResetPassword = false"
                class="flex-1 px-4 py-2 border border-sage-300 text-sage-700 rounded-lg hover:bg-sage-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isResetting"
                class="flex-1 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50"
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

const { signInWithEmail, resetPassword, isAuthenticated } = useSupabase()

// Si ya está autenticado, redirigir
if (isAuthenticated.value) {
  navigateTo('/paciente')
}

const email = ref('')
const password = ref('')
const resetEmail = ref('')
const isLoading = ref(false)
const isResetting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showResetPassword = ref(false)

const handleLogin = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    const { error } = await signInWithEmail(email.value, password.value)

    if (error) {
      errorMessage.value = 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.'
    } else {
      successMessage.value = 'Inicio de sesión exitoso. Redirigiendo...'
      setTimeout(() => {
        navigateTo('/paciente')
      }, 1000)
    }
  } catch (err) {
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
