<template>
  <div class="min-h-screen bg-base-bg flex">
    <!-- Sidebar Desktop -->
    <aside 
      class="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-white shadow-lg flex-col z-30"
    >
      <!-- Logo / Brand -->
      <div class="p-6 border-b border-gray-100">
        <h1 class="text-2xl font-serif font-bold text-cafe">
          Psicóloga Karem
        </h1>
        <p class="text-sm text-terracota mt-1">
          Espacio de gestión
        </p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 overflow-y-auto">
        <ul class="space-y-2">
          <li>
            <NuxtLink
              to="/terapeuta/dashboard"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-terracota text-white hover:bg-terracota"
            >
              <span class="text-xl">🏠</span>
              <span class="font-medium">Inicio</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/pacientes"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-terracota text-white hover:bg-terracota"
            >
              <span class="text-xl">👥</span>
              <span class="font-medium">Pacientes</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/agenda"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-terracota text-white hover:bg-terracota"
            >
              <span class="text-xl">📅</span>
              <span class="font-medium">Agenda</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/sesiones"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-terracota text-white hover:bg-terracota"
            >
              <span class="text-xl">💬</span>
              <span class="font-medium">Sesiones</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/mensajes"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-terracota text-white hover:bg-terracota"
            >
              <span class="text-xl">💌</span>
              <span class="font-medium">Mensajería</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/recursos"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-terracota text-white hover:bg-terracota"
            >
              <span class="text-xl">📚</span>
              <span class="font-medium">Recursos</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Settings at bottom -->
      <div class="p-4 border-t border-gray-100 space-y-2">
        <NuxtLink
          to="/terapeuta/configuracion"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
          active-class="bg-terracota text-white hover:bg-terracota"
        >
          <span class="text-xl">⚙️</span>
          <span class="font-medium">Configuración</span>
        </NuxtLink>
        
        <!-- Botón de Cerrar Sesión -->
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          <span class="text-xl">🚪</span>
          <span class="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Menu Overlay -->
    <div
      v-if="mobileMenuOpen"
      class="lg:hidden fixed inset-0 bg-cafe/50 backdrop-blur-sm z-40"
      @click="mobileMenuOpen = false"
    />

    <!-- Mobile Sidebar -->
    <aside
      class="lg:hidden fixed left-0 top-0 h-screen w-72 bg-white shadow-2xl flex-col z-50 transform transition-transform duration-300"
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo / Brand -->
      <div class="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-serif font-bold text-cafe">
            Karem Peña
          </h1>
          <p class="text-sm text-terracota mt-1">
            Espacio Clínico
          </p>
        </div>
        <button
          @click="mobileMenuOpen = false"
          class="text-cafe hover:text-terracota transition-colors"
        >
          <span class="text-2xl">✕</span>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 overflow-y-auto">
        <ul class="space-y-2">
          <li>
            <NuxtLink
              to="/terapeuta/dashboard"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-terracota text-white hover:bg-terracota"
              @click="mobileMenuOpen = false"
            >
              <span class="text-xl">🏠</span>
              <span class="font-medium">Inicio</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/pacientes"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-terracota text-white hover:bg-terracota"
              @click="mobileMenuOpen = false"
            >
              <span class="text-xl">👥</span>
              <span class="font-medium">Pacientes</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/agenda"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-terracota text-white hover:bg-terracota"
              @click="mobileMenuOpen = false"
            >
              <span class="text-xl">📅</span>
              <span class="font-medium">Agenda</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/sesiones"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-terracota text-white hover:bg-terracota"
              @click="mobileMenuOpen = false"
            >
              <span class="text-xl">💬</span>
              <span class="font-medium">Sesiones</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/mensajes"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-terracota text-white hover:bg-terracota"
              @click="mobileMenuOpen = false"
            >
              <span class="text-xl">💌</span>
              <span class="font-medium">Mensajería</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/recursos"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-terracota text-white hover:bg-terracota"
              @click="mobileMenuOpen = false"
            >
              <span class="text-xl">📚</span>
              <span class="font-medium">Recursos</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Settings at bottom -->
      <div class="p-4 border-t border-gray-100 space-y-2">
        <NuxtLink
          to="/terapeuta/configuracion"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
          active-class="bg-terracota text-white hover:bg-terracota"
          @click="mobileMenuOpen = false"
        >
          <span class="text-xl">⚙️</span>
          <span class="font-medium">Configuración</span>
        </NuxtLink>
        
        <!-- Botón de Cerrar Sesión -->
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          <span class="text-xl">🚪</span>
          <span class="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 lg:ml-72">
      <!-- Header -->
      <header class="sticky top-0 bg-white shadow-sm z-20">
        <div class="px-4 lg:px-8 py-4">
          <div class="flex items-center justify-between gap-4">
            <!-- Mobile Menu Button -->
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="lg:hidden text-cafe hover:text-terracota transition-colors"
            >
              <span class="text-2xl">☰</span>
            </button>

            <!-- Therapist Info -->
            <div class="hidden lg:flex items-center gap-3">
              <div class="text-right">
                <h2 class="font-serif font-semibold text-cafe">
                  Karem Peña
                </h2>
                <p class="text-sm text-terracota flex items-center gap-1.5">
                  <span class="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  Online hoy
                </p>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="flex-1 max-w-md">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Buscar paciente o sesión…"
                  class="w-full px-4 py-2.5 pl-10 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all text-cafe placeholder-cafe/50"
                />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-cafe/50">
                  🔍
                </span>
              </div>
            </div>

            <!-- Right Actions -->
            <div class="flex items-center gap-4">
              <!-- Notificaciones -->
              <NotificacionesBell />

              <!-- Avatar -->
              <div
                class="w-10 h-10 rounded-full bg-terracota text-white flex items-center justify-center font-semibold text-sm"
              >
                KP
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="px-4 lg:px-8 py-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const mobileMenuOpen = ref(false)
const supabase = useSupabaseClient()
const router = useRouter()

// Close mobile menu on route change
const route = useRoute()
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

/**
 * Maneja el cierre de sesión del terapeuta
 */
const handleLogout = async () => {
  try {
    // Confirmar antes de cerrar sesión
    if (!confirm('¿Estás segura de que deseas cerrar sesión?')) {
      return
    }

    // Cerrar el menú móvil si está abierto
    mobileMenuOpen.value = false

    // Cerrar sesión en Supabase con scope 'local' para asegurar cierre completo
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    
    if (error) {
      console.error('Error al cerrar sesión:', error)
      alert('Ocurrió un error al cerrar sesión. Intenta nuevamente.')
      return
    }

    // Forzar recarga completa de la página para limpiar todo el estado
    window.location.href = '/terapeuta/login'
    
  } catch (err) {
    console.error('Error inesperado al cerrar sesión:', err)
    alert('Ocurrió un error inesperado.')
  }
}
</script>

<style scoped>
/* Ensure smooth transitions */
* {
  -webkit-tap-highlight-color: transparent;
}
</style>
