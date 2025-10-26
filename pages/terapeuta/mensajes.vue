<template>
  <div class="flex h-[calc(100vh-8rem)] max-w-7xl mx-auto px-4 py-8 gap-6">
    <!-- Sidebar: Lista de pacientes -->
    <aside
      class="w-80 bg-white rounded-xl shadow-sm border border-[#EAD5D3]/30 overflow-hidden flex-shrink-0"
      :class="{ 'hidden lg:block': pacienteSeleccionado }"
    >
      <!-- Header Sidebar -->
      <div class="px-4 py-5 border-b border-[#EAD5D3]/30 bg-[#F9F7F3]">
        <h2 class="text-lg font-lora font-semibold text-[#5D4A44]">
          Conversaciones
        </h2>
        <p class="text-xs text-[#5D4A44]/60 font-lato mt-1">
          {{ conversaciones.length }} pacientes
        </p>
      </div>

      <!-- Lista de conversaciones -->
      <div class="overflow-y-auto h-[calc(100%-5rem)]">
        <!-- Loading -->
        <div v-if="loadingConversaciones" class="p-8 text-center">
          <div class="inline-block w-8 h-8 border-4 border-[#EAD5D3] border-t-[#D8AFA0] rounded-full animate-spin"></div>
        </div>

        <!-- Sin conversaciones -->
        <div
          v-else-if="conversaciones.length === 0"
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
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
          <p>No tienes conversaciones activas</p>
        </div>

        <!-- Conversaciones -->
        <button
          v-for="conv in conversaciones"
          :key="conv.otro_usuario_id"
          @click="seleccionarPaciente(conv)"
          class="w-full px-4 py-4 hover:bg-[#F9F7F3] transition-colors border-b border-[#EAD5D3]/20 text-left group"
          :class="{
            'bg-[#EAD5D3]/20 hover:bg-[#EAD5D3]/30': pacienteSeleccionado?.otro_usuario_id === conv.otro_usuario_id
          }"
        >
          <div class="flex items-start gap-3">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div
                v-if="conv.otro_usuario_avatar"
                class="w-12 h-12 rounded-full overflow-hidden"
              >
                <img
                  :src="conv.otro_usuario_avatar"
                  :alt="conv.otro_usuario_nombre"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="w-12 h-12 rounded-full bg-[#D8AFA0]/30 flex items-center justify-center"
              >
                <span class="text-[#5D4A44] font-lora text-lg font-medium">
                  {{ obtenerIniciales(conv.otro_usuario_nombre) }}
                </span>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <h3
                  class="text-sm font-medium text-[#5D4A44] font-lato truncate"
                  :class="{ 'font-semibold': conv.mensajes_no_vistos > 0 }"
                >
                  {{ conv.otro_usuario_nombre }}
                </h3>
                <span class="text-xs text-[#5D4A44]/50 font-lato flex-shrink-0">
                  {{ formatearFecha(conv.ultimo_mensaje_fecha) }}
                </span>
              </div>

              <p
                class="text-xs text-[#5D4A44]/70 font-lato mt-1 truncate"
                :class="{ 'font-medium': conv.mensajes_no_vistos > 0 }"
              >
                {{ conv.ultimo_mensaje }}
              </p>

              <!-- Badge no vistos -->
              <div
                v-if="conv.mensajes_no_vistos > 0"
                class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#D8AFA0] rounded-full mt-2"
              >
                {{ conv.mensajes_no_vistos }}
              </div>
            </div>
          </div>
        </button>
      </div>
    </aside>

    <!-- Main: Conversación activa -->
    <main class="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-[#EAD5D3]/30 overflow-hidden">
      <!-- Sin selección -->
      <div
        v-if="!pacienteSeleccionado"
        class="flex-1 flex flex-col items-center justify-center p-8 text-center"
      >
        <div class="w-24 h-24 rounded-full bg-[#EAD5D3]/30 flex items-center justify-center mb-6">
          <svg
            class="w-12 h-12 text-[#D8AFA0]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-lora font-medium text-[#5D4A44] mb-2">
          Selecciona una conversación
        </h3>
        <p class="text-sm text-[#5D4A44]/60 font-lato max-w-md">
          Elige un paciente de la lista para ver su conversación y responder sus mensajes.
        </p>
      </div>

      <!-- Conversación activa -->
      <div v-else class="flex-1 flex flex-col">
        <!-- Header conversación -->
        <header class="px-6 py-4 border-b border-[#EAD5D3]/30 bg-[#F9F7F3] flex items-center gap-4">
          <!-- Botón volver (móvil) -->
          <button
            @click="pacienteSeleccionado = null"
            class="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <svg
              class="w-5 h-5 text-[#5D4A44]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <!-- Info paciente -->
          <div class="flex items-center gap-3 flex-1">
            <div
              v-if="pacienteSeleccionado.otro_usuario_avatar"
              class="w-10 h-10 rounded-full overflow-hidden"
            >
              <img
                :src="pacienteSeleccionado.otro_usuario_avatar"
                :alt="pacienteSeleccionado.otro_usuario_nombre"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              v-else
              class="w-10 h-10 rounded-full bg-[#D8AFA0]/30 flex items-center justify-center"
            >
              <span class="text-[#5D4A44] font-lora text-sm font-medium">
                {{ obtenerIniciales(pacienteSeleccionado.otro_usuario_nombre) }}
              </span>
            </div>

            <div>
              <h2 class="text-base font-lato font-semibold text-[#5D4A44]">
                {{ pacienteSeleccionado.otro_usuario_nombre }}
              </h2>
              <p class="text-xs text-[#5D4A44]/60 font-lato">
                Paciente
              </p>
            </div>
          </div>
        </header>

        <!-- Mensajes -->
        <div
          ref="mensajesContainer"
          class="flex-1 overflow-y-auto p-6 space-y-3 bg-[#F9F7F3]/30"
        >
          <!-- Loading mensajes -->
          <div v-if="loadingMensajes" class="flex items-center justify-center h-full">
            <div class="inline-block w-8 h-8 border-4 border-[#EAD5D3] border-t-[#D8AFA0] rounded-full animate-spin"></div>
          </div>

          <!-- Mensajes -->
          <template v-else>
            <MensajeCard
              v-for="mensaje in mensajes"
              :key="mensaje.id"
              :texto="mensaje.mensaje"
              :fecha="mensaje.created_at"
              :remitente="esMensajeMio(mensaje)"
              :visto="mensaje.visto"
            />
          </template>
        </div>

        <!-- Input mensaje -->
        <div class="px-6 py-4 border-t border-[#EAD5D3]/30 bg-white">
          <MensajeInput
            v-if="pacienteSeleccionado"
            :destinatario-id="pacienteSeleccionado.otro_usuario_id"
            placeholder="Escribe tu respuesta con calma..."
            @mensaje-enviado="handleMensajeEnviado"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'terapeuta',
  middleware: 'auth'
})

const { conversaciones, mensajes, loadingConversaciones, loadingMensajes, listarConversaciones, listarConversacion, marcarVistos, suscribirseAConversacion, desuscribirse } = useMensajes()
const user = useSupabaseUser()
const { getUserId } = useSupabase()

const pacienteSeleccionado = ref<any>(null)
const mensajesContainer = ref<HTMLDivElement | null>(null)

// Cargar conversaciones al montar
onMounted(async () => {
  await listarConversaciones()
})

onUnmounted(() => {
  desuscribirse()
})

// Seleccionar paciente y cargar conversación
const seleccionarPaciente = async (conv: any) => {
  pacienteSeleccionado.value = conv
  
  // Cargar mensajes
  await listarConversacion(conv.otro_usuario_id)
  
  // Marcar como vistos
  await marcarVistos(conv.otro_usuario_id)
  
  // Suscribirse a nuevos mensajes
  desuscribirse()
  suscribirseAConversacion(conv.otro_usuario_id)
  
  // Scroll al final
  nextTick(() => {
    scrollToBottom()
  })
}

// Verificar si el mensaje es mío
const esMensajeMio = (mensaje: any) => {
  return mensaje.remitente_id === getUserId()
}

// Scroll al final del chat
const scrollToBottom = () => {
  if (mensajesContainer.value) {
    mensajesContainer.value.scrollTop = mensajesContainer.value.scrollHeight
  }
}

// Handle mensaje enviado
const handleMensajeEnviado = () => {
  nextTick(() => {
    scrollToBottom()
  })
}

// Obtener iniciales del nombre
const obtenerIniciales = (nombre: string): string => {
  return nombre
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
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
  if (minutos < 60) return `${minutos}m`
  if (horas < 24) return `${horas}h`
  if (dias < 7) return `${dias}d`

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short'
  })
}

// Watch para refrescar conversaciones cuando hay cambios
watch(mensajes, () => {
  if (mensajes.value.length > 0) {
    listarConversaciones()
  }
}, { deep: true })
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #F9F7F3;
}

::-webkit-scrollbar-thumb {
  background: #EAD5D3;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #D8AFA0;
}
</style>
