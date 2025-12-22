<template>
  <div class="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto px-4 py-8">
    <!-- Header -->
    <header class="mb-6 flex-shrink-0">
      <h1 class="text-2xl sm:text-3xl font-serif font-medium text-[#2D3748]">
        Mensajes
      </h1>
      <p class="text-sm text-[#2D3748] opacity-70 font-sans mt-1">
        Conversación con tu coordinadora
      </p>
    </header>

    <!-- Loader -->
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5550F2]"></div>
      <p class="mt-4 text-[#2D3748] opacity-70 font-sans">Cargando mensajes...</p>
    </div>

    <!-- Chat Container -->
    <div v-else class="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-[#E2E8F0]/30 overflow-hidden">
      <!-- Mensajes -->
      <div 
        ref="mensajesContainer"
        class="flex-1 overflow-y-auto p-6 space-y-4"
        @scroll="handleScroll"
      >
        <!-- Empty state -->
        <div v-if="mensajes.length === 0" class="flex flex-col items-center justify-center h-full text-center py-12">
          <div class="w-20 h-20 rounded-full bg-[#E2E8F0]/30 flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-[#5550F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 class="text-xl font-serif font-medium text-[#2D3748] mb-2">No hay mensajes</h3>
          <p class="text-sm text-[#2D3748] opacity-70 font-sans max-w-md">
            Inicia la conversación enviando un mensaje a tu coordinadora.
          </p>
        </div>

        <!-- Mensajes -->
        <div
          v-for="mensaje in mensajes"
          :key="mensaje.id"
          :class="[
            'flex',
            esMensajeMio(mensaje) ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-[70%] rounded-2xl px-4 py-3 shadow-sm',
              esMensajeMio(mensaje)
                ? 'bg-[#5550F2] text-white rounded-br-sm'
                : 'bg-[#F2F2F2] text-[#2D3748] rounded-bl-sm'
            ]"
          >
            <!-- Nombre del autor (solo para mensajes recibidos) -->
            <p 
              v-if="!esMensajeMio(mensaje)" 
              class="text-xs font-sans font-medium mb-1 opacity-70"
            >
              {{ mensaje.autor?.nombre_completo || 'Coordinadora' }}
            </p>

            <!-- Contenido -->
            <p class="text-sm font-sans whitespace-pre-wrap break-words">
              {{ mensaje.contenido }}
            </p>

            <!-- Hora y estado de lectura -->
            <div 
              :class="[
                'flex items-center gap-1 mt-1 text-xs',
                'font-[\'Lato\']',
                esMensajeMio(mensaje) ? 'text-white/70' : 'text-[#2D3748]/50'
              ]"
            >
              <span>{{ formatearHora(mensaje.created_at) }}</span>
              <span v-if="esMensajeMio(mensaje)">
                <!-- Doble check para leído -->
                <svg v-if="mensaje.leido" class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13l4 4L23 7" />
                </svg>
                <!-- Check simple para enviado -->
                <svg v-else class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <!-- Indicador de escritura (opcional) -->
        <div v-if="estaEscribiendo" class="flex justify-start">
          <div class="bg-[#F2F2F2] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-[#5550F2] rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-2 h-2 bg-[#5550F2] rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-2 h-2 bg-[#5550F2] rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input de mensaje -->
      <div class="flex-shrink-0 border-t border-[#E2E8F0]/30 p-4 bg-[#F2F2F2]/30">
        <form @submit.prevent="handleEnviarMensaje" class="flex gap-2">
          <textarea
            v-model="nuevoMensaje"
            placeholder="Escribe tu mensaje..."
            rows="1"
            class="flex-1 px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5550F2] focus:border-transparent resize-none font-sans text-[#2D3748] placeholder:text-[#2D3748]/40 bg-white"
            @keydown.enter.exact.prevent="handleEnviarMensaje"
            @input="autoResize"
            ref="textareaRef"
          ></textarea>
          <button
            type="submit"
            :disabled="!nuevoMensaje.trim() || enviando"
            class="flex-shrink-0 w-12 h-12 bg-[#5550F2] hover:bg-[#C89B8A] disabled:bg-[#E2E8F0] disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center"
          >
            <svg v-if="!enviando" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <div v-else class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Mensaje {
  id: string;
  autor_id: string;
  receptor_id: string;
  contenido: string;
  leido: boolean;
  created_at: string;
  autor?: {
    nombre_completo: string;
    rol: string;
  };
}

definePageMeta({
  layout: 'paciente',
  middleware: 'auth'
});

const { getMensajes, enviarMensaje, marcarComoLeido } = usePacientes();

const loading = ref(true);
const mensajes = ref<Mensaje[]>([]);
const nuevoMensaje = ref('');
const enviando = ref(false);
const estaEscribiendo = ref(false);
const mensajesContainer = ref<HTMLElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// ID del usuario actual
const userId = ref<string>('');

// Cargar mensajes
const cargarMensajes = async () => {
  loading.value = true;
  try {
    if (process.client) {
      const supabase = useSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId.value = user.id;
      }
    }

    const data = await getMensajes();
    mensajes.value = (data as Mensaje[]) || [];

    // Marcar como leídos los mensajes no leídos que no son míos
    const mensajesNoLeidos = mensajes.value
      .filter(m => !m.leido && m.autor_id !== userId.value)
      .map(m => m.id);

    if (mensajesNoLeidos.length > 0) {
      await marcarComoLeido(mensajesNoLeidos);
    }

    // Scroll al final después de cargar
    nextTick(() => scrollToBottom());
  } catch (error) {
    console.error('Error al cargar mensajes:', error);
  } finally {
    loading.value = false;
  }
};

// Enviar mensaje
const handleEnviarMensaje = async () => {
  if (!nuevoMensaje.value.trim() || enviando.value) return;

  const contenido = nuevoMensaje.value.trim();
  nuevoMensaje.value = '';
  enviando.value = true;

  // Reset textarea height
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
  }

  try {
    // TODO: Obtener el ID real de la coordinadora
    const coordinadoraId = 'coord-uuid-1234';

    const nuevoMensajeData = await enviarMensaje(contenido, coordinadoraId);
    
    // Agregar el mensaje a la lista
    mensajes.value.push(nuevoMensajeData as Mensaje);

    // Scroll al final
    nextTick(() => scrollToBottom());

    // Simular que la coordinadora está escribiendo (solo para demo)
    setTimeout(() => {
      estaEscribiendo.value = true;
      setTimeout(() => {
        estaEscribiendo.value = false;
      }, 2000);
    }, 1000);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    alert('No se pudo enviar el mensaje. Intenta nuevamente.');
  } finally {
    enviando.value = false;
  }
};

// Verificar si el mensaje es del usuario actual
const esMensajeMio = (mensaje: Mensaje) => {
  return mensaje.autor_id === userId.value;
};

// Formatear hora
const formatearHora = (fecha: string) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);

  // Si es hoy, mostrar solo la hora
  if (date.toDateString() === hoy.toDateString()) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  // Si es ayer
  if (date.toDateString() === ayer.toDateString()) {
    return 'Ayer ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  // Si es más antiguo, mostrar fecha y hora
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Scroll al final
const scrollToBottom = (smooth = true) => {
  if (mensajesContainer.value) {
    mensajesContainer.value.scrollTo({
      top: mensajesContainer.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }
};

// Auto-resize textarea
const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
  }
};

// Handle scroll
const handleScroll = () => {
  // Aquí podrías implementar lazy loading de mensajes antiguos
};

onMounted(() => {
  cargarMensajes();
});
</script>

<style scoped>
/* Animación personalizada para el bounce con delay */
@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
}
</style>
