<template>
  <div class="min-h-screen bg-[#F9F7F3]">
    <!-- Header -->
    <header class="bg-white border-b border-[#EAD5D3] sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo / Título -->
          <div class="flex items-center">
            <button
              @click="sidebarOpen = !sidebarOpen"
              class="mr-4 lg:hidden text-[#5D4A44] hover:text-[#D8AFA0] transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 class="text-xl font-['Lora'] font-medium text-[#5D4A44]">
              Mi Espacio Terapéutico
            </h1>
          </div>

          <!-- Usuario y acciones -->
          <div class="flex items-center space-x-3">
            <!-- Notificaciones -->
            <NotificacionesBell />

            <!-- Nombre del usuario -->
            <div class="hidden sm:block text-right">
              <p class="text-sm font-medium text-[#5D4A44] font-['Lato']">
                {{ nombrePaciente }}
              </p>
              <p class="text-xs text-[#5D4A44] opacity-60">
                Paciente
              </p>
            </div>

            <!-- Botón cerrar sesión -->
            <button
              @click="handleLogout"
              class="flex items-center space-x-2 px-4 py-2 text-sm font-['Lato'] text-[#5D4A44] hover:text-[#D8AFA0] transition-colors"
              title="Cerrar sesión"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar Desktop -->
      <aside class="hidden lg:flex lg:flex-shrink-0">
        <div class="flex flex-col w-64 border-r border-[#EAD5D3] bg-white min-h-[calc(100vh-4rem)]">
          <nav class="flex-1 px-4 py-6 space-y-2">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center space-x-3 px-4 py-3 rounded-lg font-['Lato'] text-sm transition-all duration-200"
              :class="isActive(item.path) 
                ? 'bg-[#EAD5D3] text-[#5D4A44] font-medium' 
                : 'text-[#5D4A44] hover:bg-[#F9F7F3]'"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </div>
      </aside>

      <!-- Sidebar Mobile -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-50 lg:hidden"
        @click="sidebarOpen = false"
      >
        <div class="fixed inset-0 bg-black/50" @click="sidebarOpen = false"></div>
        <div
          class="fixed inset-y-0 left-0 w-64 bg-white border-r border-[#EAD5D3]"
          @click.stop
        >
          <div class="flex items-center justify-between p-4 border-b border-[#EAD5D3]">
            <h2 class="text-lg font-['Lora'] font-medium text-[#5D4A44]">
              Menú
            </h2>
            <button
              @click="sidebarOpen = false"
              class="text-[#5D4A44] hover:text-[#D8AFA0]"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav class="flex-1 px-4 py-6 space-y-2">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center space-x-3 px-4 py-3 rounded-lg font-['Lato'] text-sm transition-all duration-200"
              :class="isActive(item.path) 
                ? 'bg-[#EAD5D3] text-[#5D4A44] font-medium' 
                : 'text-[#5D4A44] hover:bg-[#F9F7F3]'"
              @click="sidebarOpen = false"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </div>
      </div>

      <!-- Contenido principal -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const route = useRoute()
const { signOut, user } = useSupabase()
const supabase = useSupabaseClient()

// Estado
const sidebarOpen = ref(false)
const nombrePaciente = ref('Cargando...')

// Agregar clase al body para quitar padding-top
onMounted(() => {
  document.body.classList.add('layout-paciente')
})

onUnmounted(() => {
  document.body.classList.remove('layout-paciente')
})

// Menú de navegación
const menuItems = [
  {
    path: '/paciente/dashboard',
    label: 'Inicio',
    icon: 'IconHome'
  },
  {
    path: '/paciente/sesiones',
    label: 'Mis Sesiones',
    icon: 'IconCalendar'
  },
  {
    path: '/paciente/bono',
    label: 'Mi Bono',
    icon: 'IconTicket'
  },
  {
    path: '/paciente/recursos',
    label: 'Mis Recursos',
    icon: 'IconBook'
  },
  {
    path: '/paciente/mensajes',
    label: 'Mensajes',
    icon: 'IconMessage'
  }
]

// Verificar si la ruta está activa
const isActive = (path) => {
  return route.path === path
}

// Cargar datos del paciente
const loadPacienteData = async () => {
  if (!user.value) return
  
  try {
    // Intentar obtener el perfil del paciente desde la tabla pacientes
    const { data, error } = await supabase
      .from('pacientes')
      .select('nombre_completo')
      .eq('id', user.value.id)
      .single()

    if (!error && data?.nombre_completo) {
      nombrePaciente.value = data.nombre_completo
    } else {
      // Si no hay nombre en la base de datos, usar el email o metadata
      nombrePaciente.value = user.value.user_metadata?.nombre || 
                            user.value.user_metadata?.name || 
                            user.value.email?.split('@')[0] || 
                            'Paciente'
    }
  } catch (err) {
    console.error('Error cargando datos del paciente:', err)
    nombrePaciente.value = user.value.email?.split('@')[0] || 'Paciente'
  }
}

// Cerrar sesión
const handleLogout = async () => {
  const { error } = await signOut()
  if (!error) {
    navigateTo('/login')
  }
}

// Cargar datos al montar
onMounted(() => {
  loadPacienteData()
})

// Componentes de iconos inline (SVG)
const IconHome = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  `
}

const IconCalendar = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  `
}

const IconTicket = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  `
}

const IconBook = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  `
}

const IconMessage = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  `
}
</script>
