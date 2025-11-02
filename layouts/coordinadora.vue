<template>
  <div class="min-h-screen bg-base-bg flex overflow-hidden">
    <!-- Sidebar Desktop -->
    <aside 
      class="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white shadow-lg flex-col z-30"
    >
      <!-- Logo / Brand -->
      <div class="p-6 border-b border-gray-100">
        <h1 class="text-xl font-serif font-bold text-cafe">
          Psicóloga Karem
        </h1>
        <p class="text-sm text-terracota mt-1">
          Panel de Coordinación
        </p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 overflow-y-auto">
        <ul class="space-y-2">
          <li>
            <NuxtLink
              to="/coordinadora/dashboard"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
            >
              <HomeIcon class="w-5 h-5" />
              <span class="font-medium">Dashboard</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/coordinadora/agenda"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
            >
              <CalendarIcon class="w-5 h-5" />
              <span class="font-medium">Agenda</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/coordinadora/confirmaciones"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
              </svg>
              <span class="font-medium">Confirmaciones</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/coordinadora/pacientes"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
            >
              <UserGroupIcon class="w-5 h-5" />
              <span class="font-medium">Pacientes</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/coordinadora/recordatorios"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
            >
              <BellIcon class="w-5 h-5" />
              <span class="font-medium">Recordatorios</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/coordinadora/mensajes"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
            >
              <ChatBubbleLeftRightIcon class="w-5 h-5" />
              <span class="font-medium">Mensajes</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/coordinadora/pagos"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
            >
              <CreditCardIcon class="w-5 h-5" />
              <span class="font-medium">Pagos</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Settings at bottom -->
      <div class="p-4 border-t border-gray-100">
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
      class="lg:hidden fixed left-0 top-0 h-screen w-64 bg-white shadow-2xl flex-col z-50 transform transition-transform duration-300"
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo / Brand -->
      <div class="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-serif font-bold text-cafe">
            Psicóloga Karem
          </h1>
          <p class="text-sm text-terracota mt-1">
            Panel de Coordinación
          </p>
        </div>
        <button
          @click="mobileMenuOpen = false"
          class="text-cafe hover:text-terracota transition-colors"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 overflow-y-auto">
        <ul class="space-y-2">
          <li>
            <NuxtLink
              to="/coordinadora/dashboard"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
              @click="mobileMenuOpen = false"
            >
              <HomeIcon class="w-5 h-5" />
              <span class="font-medium">Dashboard</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/coordinadora/agenda"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
              @click="mobileMenuOpen = false"
            >
              <CalendarIcon class="w-5 h-5" />
              <span class="font-medium">Agenda</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/coordinadora/confirmaciones"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
              @click="mobileMenuOpen = false"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
              </svg>
              <span class="font-medium">Confirmaciones</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/coordinadora/pacientes"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
              @click="mobileMenuOpen = false"
            >
              <UserGroupIcon class="w-5 h-5" />
              <span class="font-medium">Pacientes</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/coordinadora/recordatorios"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
              @click="mobileMenuOpen = false"
            >
              <BellIcon class="w-5 h-5" />
              <span class="font-medium">Recordatorios</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/coordinadora/mensajes"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
              @click="mobileMenuOpen = false"
            >
              <ChatBubbleLeftRightIcon class="w-5 h-5" />
              <span class="font-medium">Mensajes</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/coordinadora/pagos"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200"
              active-class="bg-cafe/10 text-cafe font-semibold"
              @click="mobileMenuOpen = false"
            >
              <CreditCardIcon class="w-5 h-5" />
              <span class="font-medium">Pagos</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Settings at bottom -->
      <div class="p-4 border-t border-gray-100">
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
    <div class="flex-1 lg:ml-64 flex flex-col h-screen">
      <!-- Header -->
      <header class="sticky top-0 bg-white shadow-sm z-20 flex-shrink-0">
        <div class="px-4 lg:px-8 py-4">
          <div class="flex items-center justify-between gap-4">
            <!-- Mobile Menu Button -->
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="lg:hidden text-cafe hover:text-terracota transition-colors"
            >
              <Bars3Icon class="w-6 h-6" />
            </button>

            <!-- Page Title -->
            <div class="flex-1">
              <h2 class="text-lg lg:text-xl font-serif font-semibold text-cafe">
                {{ pageTitle }}
              </h2>
            </div>

            <!-- Search Bar -->
            <div class="hidden md:block flex-1 max-w-md">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Buscar paciente, cita…"
                  class="w-full px-4 py-2 pl-10 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all text-sm text-cafe placeholder-cafe/50"
                />
                <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cafe/50" />
              </div>
            </div>

            <!-- Nueva Tarea Button -->
            <button
              class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors duration-200 text-sm font-medium whitespace-nowrap"
            >
              + Nueva tarea
            </button>

            <!-- User Avatar -->
            <div
              class="w-10 h-10 rounded-full bg-terracota text-white flex items-center justify-center font-semibold text-sm flex-shrink-0"
            >
              {{ userInitials }}
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content - Scrollable -->
      <main class="flex-1 overflow-auto px-4 lg:px-8 py-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Bars3Icon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'

const mobileMenuOpen = ref(false)
const router = useRouter()
const route = useRoute()
const user = useSupabaseUser()
const { signOut } = useSupabase()

// Close mobile menu on route change
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

// Computed page title based on route
const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('/dashboard')) return 'Dashboard'
  if (path.includes('/agenda')) return 'Agenda'
  if (path.includes('/confirmaciones')) return 'Confirmaciones'
  if (path.includes('/pacientes')) return 'Pacientes'
  if (path.includes('/recordatorios')) return 'Recordatorios'
  if (path.includes('/mensajes')) return 'Mensajes'
  if (path.includes('/pagos')) return 'Pagos'
  return 'Coordinación'
})

// User initials
const userInitials = computed(() => {
  if (!user.value?.email) return 'CO'
  return user.value.email.substring(0, 2).toUpperCase()
})

/**
 * Maneja el cierre de sesión
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
/* Smooth transitions */
* {
  -webkit-tap-highlight-color: transparent;
}
</style>
