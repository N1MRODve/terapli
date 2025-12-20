<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F2F2F2] via-[#FAFAFA] to-[#F8F9FA] relative overflow-hidden">
    <!-- Elementos decorativos de fondo -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-red-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-md w-full mx-4 relative z-10">
      <!-- Tarjeta principal -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
        <!-- Icono de advertencia -->
        <div class="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>

        <!-- Título -->
        <h1 class="text-3xl font-serif font-bold text-[#2D3748] mb-3">
          Acceso Denegado
        </h1>

        <!-- Mensaje -->
        <p class="text-[#718096] mb-2">
          No tienes permisos para acceder a esta área del sistema.
        </p>

        <p v-if="userRole" class="text-sm text-[#A0AEC0] mb-8">
          Tu rol actual es: <span class="font-semibold text-[#5550F2]">{{ getRoleName(userRole) }}</span>
        </p>

        <p v-else class="text-sm text-[#A0AEC0] mb-8">
          No se pudo determinar tu rol de usuario.
        </p>

        <!-- Acciones -->
        <div class="space-y-3">
          <button
            v-if="userDashboard"
            @click="goToMyDashboard"
            class="w-full px-6 py-3 bg-gradient-to-r from-[#5550F2] to-[#04BF9D] hover:from-[#4338CA] hover:to-[#027368] text-white rounded-xl transition-all duration-300 font-sans font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            Ir a mi Panel
          </button>

          <button
            @click="goToLogin"
            class="w-full px-6 py-3 border-2 border-[#E2E8F0] text-[#4A5568] rounded-xl hover:bg-[#F7FAFC] hover:border-[#CBD5E0] transition-all duration-200 font-sans font-medium"
          >
            Volver al Login
          </button>
        </div>

        <!-- Información adicional -->
        <div class="mt-8 pt-6 border-t border-[#E2E8F0]">
          <p class="text-xs text-[#A0AEC0]">
            Si crees que esto es un error, contacta con el administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/types/database.types'

definePageMeta({
  layout: false,
  middleware: [] // Sin middleware, página accesible por todos
})

const { getUserRole, userProfile } = useSupabase()
const userRole = ref<UserRole | null>(null)
const userDashboard = ref<string | null>(null)

// Mapeo de roles a nombres en español
const getRoleName = (role: UserRole): string => {
  const nombres: Record<UserRole, string> = {
    admin: 'Administrador',
    psicologa: 'Psicóloga',
    paciente: 'Paciente',
    coordinadora: 'Coordinadora'
  }
  return nombres[role] || 'Desconocido'
}

// Obtener el rol del usuario al montar
onMounted(async () => {
  const role = await getUserRole()
  userRole.value = role

  if (role) {
    const dashboardMap: Record<UserRole, string> = {
      psicologa: '/terapeuta/dashboard',
      coordinadora: '/coordinadora/dashboard',
      admin: '/admin',
      paciente: '/paciente/dashboard'
    }
    userDashboard.value = dashboardMap[role] || null
  }
})

const goToMyDashboard = () => {
  if (userDashboard.value) {
    navigateTo(userDashboard.value, { replace: true })
  }
}

const goToLogin = () => {
  navigateTo('/login', { replace: true })
}
</script>

<style scoped>
/* Animaciones modernas */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

/* Glassmorphism effect enhancement */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
}

/* Smooth focus transitions */
button:focus {
  outline: none;
  ring: 4px;
  ring-color: rgba(85, 80, 242, 0.2);
}
</style>
