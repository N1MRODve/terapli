<template>
  <div class="relative">
    <!-- Botón de notificaciones -->
    <button
      @click="toggleDropdown"
      class="relative p-2 rounded-full hover:bg-[#EAD5D3]/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]/50"
      :class="{ 'bg-[#EAD5D3]/20': mostrarDropdown }"
      aria-label="Notificaciones"
    >
      <!-- Icono de campana -->
      <svg
        class="w-6 h-6 text-[#5D4A44]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <!-- Badge contador -->
      <span
        v-if="totalNoVistas > 0"
        class="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#D8AFA0] rounded-full border-2 border-[#F9F7F3]"
      >
        {{ totalNoVistas > 9 ? '9+' : totalNoVistas }}
      </span>
    </button>

    <!-- Dropdown de notificaciones -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="mostrarDropdown"
        class="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-lg shadow-xl border border-[#EAD5D3]/40 z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-[#EAD5D3]/30 flex items-center justify-between bg-[#F9F7F3]">
          <h3 class="text-sm font-semibold text-[#5D4A44] font-lora">
            Notificaciones
          </h3>
          <button
            v-if="notificaciones.length > 0"
            @click="marcarTodasComoVistas"
            class="text-xs text-[#D8AFA0] hover:text-[#C89B8A] font-lato transition-colors"
          >
            Marcar todas como leídas
          </button>
        </div>

        <!-- Lista de notificaciones -->
        <div class="max-h-[400px] overflow-y-auto">
          <!-- Loading -->
          <div v-if="loading" class="p-8 text-center">
            <div class="inline-block w-8 h-8 border-4 border-[#EAD5D3] border-t-[#D8AFA0] rounded-full animate-spin"></div>
          </div>

          <!-- Sin notificaciones -->
          <div
            v-else-if="notificaciones.length === 0"
            class="p-8 text-center text-[#5D4A44]/60 font-lato text-sm"
          >
            <svg
              class="w-12 h-12 mx-auto mb-3 text-[#EAD5D3]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p>No tienes notificaciones</p>
          </div>

          <!-- Notificaciones -->
          <div v-else>
            <button
              v-for="notif in notificaciones"
              :key="notif.id"
              @click="handleClickNotificacion(notif)"
              class="w-full px-4 py-3 hover:bg-[#F9F7F3] transition-colors border-b border-[#EAD5D3]/20 text-left group"
              :class="{ 'bg-[#EAD5D3]/10': !notif.visto }"
            >
              <div class="flex items-start gap-3">
                <!-- Icono según tipo -->
                <div
                  class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  :class="
                    notif.tipo === 'mensaje'
                      ? 'bg-[#D8AFA0]/20 text-[#D8AFA0]'
                      : 'bg-[#8A9A5B]/20 text-[#8A9A5B]'
                  "
                >
                  <svg
                    v-if="notif.tipo === 'mensaje'"
                    class="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>

                <!-- Contenido -->
                <div class="flex-1 min-w-0">
                  <p
                    class="text-sm font-medium text-[#5D4A44] font-lato"
                    :class="{ 'font-semibold': !notif.visto }"
                  >
                    {{ notif.titulo }}
                  </p>
                  <p
                    v-if="notif.mensaje"
                    class="text-xs text-[#5D4A44]/70 font-lato mt-1 line-clamp-2"
                  >
                    {{ notif.mensaje }}
                  </p>
                  <p class="text-xs text-[#5D4A44]/50 font-lato mt-1">
                    {{ formatearFecha(notif.created_at) }}
                  </p>
                </div>

                <!-- Indicador no visto -->
                <div
                  v-if="!notif.visto"
                  class="flex-shrink-0 w-2 h-2 bg-[#D8AFA0] rounded-full mt-2"
                ></div>
              </div>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div
          v-if="notificaciones.length > 0"
          class="px-4 py-2 border-t border-[#EAD5D3]/30 bg-[#F9F7F3] text-center"
        >
          <button
            @click="verTodasLasNotificaciones"
            class="text-xs text-[#D8AFA0] hover:text-[#C89B8A] font-lato font-medium transition-colors"
          >
            Ver todas las notificaciones
          </button>
        </div>
      </div>
    </Transition>

    <!-- Overlay para cerrar -->
    <div
      v-if="mostrarDropdown"
      @click="mostrarDropdown = false"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
const { notificaciones, totalNoVistas, loading, listar, marcarVista, marcarTodasVistas, suscribirse, desuscribirse } = useNotificaciones()
const router = useRouter()

const mostrarDropdown = ref(false)

// Cargar notificaciones al montar
onMounted(async () => {
  await listar(10)
  suscribirse()
})

onUnmounted(() => {
  desuscribirse()
})

// Toggle dropdown
const toggleDropdown = async () => {
  mostrarDropdown.value = !mostrarDropdown.value

  if (mostrarDropdown.value) {
    await listar(10)
  }
}

// Marcar todas como vistas
const marcarTodasComoVistas = async () => {
  await marcarTodasVistas()
}

// Click en notificación
const handleClickNotificacion = async (notif: any) => {
  // Marcar como vista
  await marcarVista(notif.id)

  // Cerrar dropdown
  mostrarDropdown.value = false

  // Navegar según el tipo
  if (notif.tipo === 'mensaje') {
    // Intentar navegar según la ruta actual
    const route = useRoute()
    if (route.path.includes('/paciente')) {
      router.push('/paciente/mensajes')
    } else if (route.path.includes('/terapeuta')) {
      router.push('/terapeuta/mensajes')
    }
  }
}

// Ver todas las notificaciones (navegar a página dedicada)
const verTodasLasNotificaciones = () => {
  mostrarDropdown.value = false
  // TODO: Implementar página de notificaciones si es necesario
  // router.push('/notificaciones')
}

// Formatear fecha
const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha)
  const ahora = new Date()
  const diferencia = ahora.getTime() - date.getTime()
  const minutos = Math.floor(diferencia / 60000)
  const horas = Math.floor(diferencia / 3600000)
  const dias = Math.floor(diferencia / 86400000)

  if (minutos < 1) return 'Ahora'
  if (minutos < 60) return `Hace ${minutos}m`
  if (horas < 24) return `Hace ${horas}h`
  if (dias < 7) return `Hace ${dias}d`

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short'
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
