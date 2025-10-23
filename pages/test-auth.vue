<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold mb-4">Test de Autenticación</h1>
      
      <div class="space-y-4">
        <div>
          <h2 class="font-semibold text-lg">Estado del Usuario:</h2>
          <pre class="bg-gray-50 p-4 rounded mt-2 overflow-auto">{{ userInfo }}</pre>
        </div>

        <div>
          <h2 class="font-semibold text-lg">Estado de la Sesión:</h2>
          <pre class="bg-gray-50 p-4 rounded mt-2 overflow-auto">{{ sessionInfo }}</pre>
        </div>

        <div>
          <h2 class="font-semibold text-lg">¿Está autenticado?</h2>
          <p class="text-xl mt-2">{{ isAuth ? '✅ Sí' : '❌ No' }}</p>
        </div>

        <div class="flex gap-4 mt-6">
          <button
            @click="checkAuth"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Verificar Autenticación
          </button>
          
          <button
            @click="goToDashboard"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Ir al Dashboard
          </button>

          <button
            @click="goToLogin"
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Ir a Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { session, isAuthenticated } = useSupabase()

const userInfo = ref<any>(null)
const sessionInfo = ref<any>(null)
const isAuth = ref(false)

const checkAuth = async () => {
  userInfo.value = user.value
  sessionInfo.value = session.value
  isAuth.value = isAuthenticated.value

  const { data } = await supabase.auth.getSession()
  console.log('Sesión actual desde Supabase:', data.session)
  console.log('Usuario desde useSupabaseUser:', user.value)
  console.log('isAuthenticated:', isAuthenticated.value)
}

const goToDashboard = () => {
  navigateTo('/paciente/dashboard')
}

const goToLogin = () => {
  navigateTo('/login')
}

onMounted(() => {
  checkAuth()
})
</script>
