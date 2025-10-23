<template>
  <div class="min-h-screen bg-[#F9F7F3]">
    <!-- Header / Navbar -->
    <header class="bg-white shadow-sm border-b border-[#E8DFD8]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo y título -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] flex items-center justify-center">
              <span class="text-white font-semibold text-lg">B</span>
            </div>
            <div>
              <h1 class="text-xl font-lora font-semibold text-[#5D4A44]">Panel de Coordinación</h1>
              <p class="text-xs text-[#8B7470]">Hola, {{ nombreUsuario }} 🌸</p>
            </div>
          </div>

          <!-- Navegación -->
          <nav class="hidden md:flex items-center space-x-1">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="isActive(item.path) 
                ? 'bg-[#D8AFA0] text-white' 
                : 'text-[#5D4A44] hover:bg-[#E8DFD8]'
              "
            >
              <Icon :name="item.icon" class="w-4 h-4 inline-block mr-2" />
              {{ item.label }}
            </NuxtLink>
          </nav>

          <!-- Notificaciones y perfil -->
          <div class="flex items-center space-x-3">
            <!-- Notificaciones -->
            <button 
              @click="toggleNotificaciones"
              class="relative p-2 rounded-lg hover:bg-[#E8DFD8] transition-colors"
            >
              <Icon name="heroicons:bell" class="w-5 h-5 text-[#5D4A44]" />
              <span 
                v-if="notificacionesNoLeidas > 0"
                class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
              >
                {{ notificacionesNoLeidas }}
              </span>
            </button>

            <!-- Menú usuario -->
            <button 
              @click="toggleMenuUsuario"
              class="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#E8DFD8] transition-colors"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] flex items-center justify-center">
                <span class="text-white text-sm font-semibold">{{ iniciales }}</span>
              </div>
              <Icon name="heroicons:chevron-down" class="w-4 h-4 text-[#5D4A44]" />
            </button>
          </div>
        </div>
      </div>

      <!-- Navegación móvil -->
      <nav class="md:hidden border-t border-[#E8DFD8] bg-white px-4 py-3">
        <div class="flex overflow-x-auto space-x-2 pb-2">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
            :class="isActive(item.path) 
              ? 'bg-[#D8AFA0] text-white' 
              : 'text-[#5D4A44] hover:bg-[#E8DFD8]'
            "
          >
            <Icon :name="item.icon" class="w-4 h-4 mr-2" />
            {{ item.label }}
          </NuxtLink>
        </div>
      </nav>
    </header>

    <!-- Panel de notificaciones (dropdown) -->
    <transition name="fade">
      <div 
        v-if="mostrarNotificaciones"
        class="fixed inset-0 z-40"
        @click="mostrarNotificaciones = false"
      >
        <div 
          class="absolute top-20 right-4 w-80 bg-white rounded-xl shadow-2xl border border-[#E8DFD8] overflow-hidden"
          @click.stop
        >
          <div class="p-4 bg-gradient-to-r from-[#D8AFA0] to-[#C49484]">
            <h3 class="text-white font-semibold">Notificaciones</h3>
          </div>
          <div class="max-h-96 overflow-y-auto">
            <div 
              v-for="notif in notificaciones"
              :key="notif.id"
              class="p-4 border-b border-[#E8DFD8] hover:bg-[#F9F7F3] transition-colors cursor-pointer"
              :class="{ 'bg-blue-50': !notif.visto }"
            >
              <p class="text-sm font-medium text-[#5D4A44]">{{ notif.titulo }}</p>
              <p class="text-xs text-[#8B7470] mt-1">{{ notif.mensaje }}</p>
              <p class="text-xs text-[#A89B97] mt-2">{{ formatearFecha(notif.created_at) }}</p>
            </div>
            <div v-if="notificaciones.length === 0" class="p-8 text-center text-[#8B7470]">
              <Icon name="heroicons:bell-slash" class="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p class="text-sm">No tienes notificaciones</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Menú usuario (dropdown) -->
    <transition name="fade">
      <div 
        v-if="mostrarMenuUsuario"
        class="fixed inset-0 z-40"
        @click="mostrarMenuUsuario = false"
      >
        <div 
          class="absolute top-20 right-4 w-64 bg-white rounded-xl shadow-2xl border border-[#E8DFD8] overflow-hidden"
          @click.stop
        >
          <div class="p-4 border-b border-[#E8DFD8]">
            <p class="font-semibold text-[#5D4A44]">{{ nombreUsuario }}</p>
            <p class="text-sm text-[#8B7470]">{{ emailUsuario }}</p>
            <span class="inline-block mt-2 px-3 py-1 bg-[#D8AFA0] text-white text-xs rounded-full">
              Coordinación
            </span>
          </div>
          <div class="p-2">
            <button
              @click="cerrarSesion"
              class="w-full text-left px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
            >
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4 mr-2" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Contenido principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="mt-12 py-6 border-t border-[#E8DFD8] text-center text-sm text-[#8B7470]">
      <p>Panel de Coordinación Clínica · Psicóloga Karem</p>
      <p class="mt-1">Gestión de citas, pagos y comunicación con pacientes</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()

// Estado
const mostrarNotificaciones = ref(false)
const mostrarMenuUsuario = ref(false)
const notificaciones = ref<any[]>([])
const notificacionesNoLeidas = ref(0)

// Datos del usuario
const nombreUsuario = computed(() => {
  return user.value?.user_metadata?.nombre || 'Coordinación'
})

const emailUsuario = computed(() => {
  return user.value?.email || ''
})

const iniciales = computed(() => {
  const nombre = nombreUsuario.value
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

// Menú de navegación
const menuItems = [
  { path: '/coordinacion/dashboard', label: 'Dashboard', icon: 'heroicons:home' },
  { path: '/coordinacion/agenda', label: 'Agenda', icon: 'heroicons:calendar' },
  { path: '/coordinacion/pagos', label: 'Pagos', icon: 'heroicons:credit-card' },
  { path: '/coordinacion/mensajes', label: 'Mensajes', icon: 'heroicons:chat-bubble-left-right' }
]

// Funciones
const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const toggleNotificaciones = () => {
  mostrarNotificaciones.value = !mostrarNotificaciones.value
  mostrarMenuUsuario.value = false
}

const toggleMenuUsuario = () => {
  mostrarMenuUsuario.value = !mostrarMenuUsuario.value
  mostrarNotificaciones.value = false
}

const formatearFecha = (fecha: string) => {
  const date = new Date(fecha)
  const ahora = new Date()
  const diff = ahora.getTime() - date.getTime()
  const minutos = Math.floor(diff / 60000)
  const horas = Math.floor(diff / 3600000)
  const dias = Math.floor(diff / 86400000)

  if (minutos < 1) return 'Ahora'
  if (minutos < 60) return `Hace ${minutos} min`
  if (horas < 24) return `Hace ${horas} h`
  if (dias < 7) return `Hace ${dias} d`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const cerrarSesion = async () => {
  try {
    await supabase.auth.signOut()
    router.push('/coordinacion/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

const cargarNotificaciones = async () => {
  if (!user.value) return

  try {
    const { data, error } = await supabase
      .from('notificaciones' as any)
      .select('*')
      .eq('usuario_id', user.value.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && data) {
      notificaciones.value = data
      notificacionesNoLeidas.value = data.filter((n: any) => !n.visto).length
    }
  } catch (error) {
    console.error('Error al cargar notificaciones:', error)
  }
}

// Cargar notificaciones al montar
onMounted(() => {
  cargarNotificaciones()
  
  // Actualizar notificaciones cada 30 segundos
  const interval = setInterval(cargarNotificaciones, 30000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #F9F7F3;
}

::-webkit-scrollbar-thumb {
  background: #D8AFA0;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #C49484;
}
</style>
