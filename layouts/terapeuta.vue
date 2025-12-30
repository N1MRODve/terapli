<template>
  <div class="min-h-screen bg-base-bg flex">
    <!-- Sidebar Desktop -->
    <aside 
      class="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-white shadow-lg flex-col z-30"
    >
      <!-- Logo / Brand -->
      <div class="p-6 border-b border-gray-100">
        <h1 class="text-2xl font-serif font-bold text-cafe">
          {{ nombreTerapeuta }}
        </h1>
        <p class="text-sm text-purple-600 mt-1">
          Panel de gestión
        </p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 overflow-y-auto">
        <ul class="space-y-2">
          <li>
            <NuxtLink
              to="/terapeuta/dashboard"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-purple-600 text-white hover:bg-purple-600"
            >
              <HomeIcon class="w-5 h-5" />
              <span class="font-medium">Inicio</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/pacientes"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-purple-600 text-white hover:bg-purple-600"
            >
              <UserGroupIcon class="w-5 h-5" />
              <span class="font-medium">Pacientes</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/agenda"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-purple-600 text-white hover:bg-purple-600"
            >
              <CalendarIcon class="w-5 h-5" />
              <span class="font-medium">Agenda</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/sesiones"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-purple-600 text-white hover:bg-purple-600"
            >
              <ChatBubbleLeftRightIcon class="w-5 h-5" />
              <span class="font-medium">Sesiones</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/bonos"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-purple-600 text-white hover:bg-purple-600"
            >
              <TicketIcon class="w-5 h-5" />
              <span class="font-medium">Bonos</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/pagos"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-purple-600 text-white hover:bg-purple-600"
            >
              <BanknotesIcon class="w-5 h-5" />
              <span class="font-medium">Pagos</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Settings at bottom -->
      <div class="p-4 border-t border-gray-100 space-y-2">
        <NuxtLink
          to="/terapeuta/configuracion"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
          active-class="bg-purple-600 text-white hover:bg-purple-600"
        >
          <Cog6ToothIcon class="w-5 h-5" />
          <span class="font-medium">Configuración</span>
        </NuxtLink>
        
        <!-- Botón de Cerrar Sesión -->
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
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
            {{ nombreTerapeuta }}
          </h1>
          <p class="text-sm text-purple-600 mt-1">
            Panel de gestión
          </p>
        </div>
        <button
          @click="mobileMenuOpen = false"
          class="text-cafe hover:text-purple-600 transition-colors"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 overflow-y-auto">
        <ul class="space-y-2">
          <li>
            <NuxtLink
              to="/terapeuta/dashboard"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-purple-600 text-white hover:bg-purple-600"
              @click="mobileMenuOpen = false"
            >
              <HomeIcon class="w-5 h-5" />
              <span class="font-medium">Inicio</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/pacientes"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-purple-600 text-white hover:bg-purple-600"
              @click="mobileMenuOpen = false"
            >
              <UserGroupIcon class="w-5 h-5" />
              <span class="font-medium">Pacientes</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/agenda"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-purple-600 text-white hover:bg-purple-600"
              @click="mobileMenuOpen = false"
            >
              <CalendarIcon class="w-5 h-5" />
              <span class="font-medium">Agenda</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/sesiones"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-purple-600 text-white hover:bg-purple-600"
              @click="mobileMenuOpen = false"
            >
              <ChatBubbleLeftRightIcon class="w-5 h-5" />
              <span class="font-medium">Sesiones</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/bonos"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-purple-600 text-white hover:bg-purple-600"
              @click="mobileMenuOpen = false"
            >
              <TicketIcon class="w-5 h-5" />
              <span class="font-medium">Bonos</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/terapeuta/pagos"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
              active-class="bg-purple-600 text-white hover:bg-purple-600"
              @click="mobileMenuOpen = false"
            >
              <BanknotesIcon class="w-5 h-5" />
              <span class="font-medium">Pagos</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Settings at bottom -->
      <div class="p-4 border-t border-gray-100 space-y-2">
        <NuxtLink
          to="/terapeuta/configuracion"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200"
          active-class="bg-purple-600 text-white hover:bg-purple-600"
          @click="mobileMenuOpen = false"
        >
          <Cog6ToothIcon class="w-5 h-5" />
          <span class="font-medium">Configuración</span>
        </NuxtLink>

        <!-- Botón de Cerrar Sesión -->
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
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
              class="lg:hidden text-cafe hover:text-purple-600 transition-colors"
            >
              <Bars3Icon class="w-6 h-6" />
            </button>

            <!-- Therapist Info -->
            <div class="hidden lg:flex items-center gap-3">
              <div class="text-right">
                <h2 class="font-serif font-semibold text-cafe">
                  {{ nombreTerapeuta }}
                </h2>
                <p class="text-sm text-purple-600 flex items-center gap-1.5">
                  <span class="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  Online
                </p>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="flex-1 max-w-md">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Buscar paciente o sesión…"
                  class="w-full px-4 py-2.5 pl-10 bg-base-bg rounded-lg border border-transparent focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300/20 transition-all text-cafe placeholder-cafe/50"
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
                class="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-sm"
              >
                {{ inicialesTerapeuta }}
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

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup>
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  TicketIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/vue/24/outline'

const mobileMenuOpen = ref(false)
const { signOut, userProfile } = useSupabase()

// Nombre del terapeuta (dinámico según usuario logueado)
const nombreTerapeuta = computed(() => {
  return userProfile.value?.nombre || 'Terapeuta'
})

// Iniciales para el avatar
const inicialesTerapeuta = computed(() => {
  const nombre = nombreTerapeuta.value
  if (!nombre || nombre === 'Terapeuta') return 'T'

  const palabras = nombre.split(' ').filter(p => p.length > 0)
  if (palabras.length >= 2) {
    return (palabras[0][0] + palabras[1][0]).toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
})

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

    // Usar nuestro composable mejorado para cerrar sesión con limpieza completa
    await signOut()
    
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
