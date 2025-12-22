<template>
  <div class="flex items-end gap-3 border-t border-[#E2E8F0]/30 pt-4 bg-[#F2F2F2]">
    <!-- Área de texto -->
    <div class="flex-1 relative">
      <textarea
        ref="textareaRef"
        v-model="contenido"
        :placeholder="placeholder"
        @keydown.enter.exact.prevent="enviarMensaje"
        @input="ajustarAltura"
        class="w-full border border-[#E2E8F0]/40 rounded-lg p-3 bg-white resize-none text-sm text-[#2D3748] font-sans focus:outline-none focus:ring-2 focus:ring-[#5550F2]/50 focus:border-[#5550F2] transition-all"
        :class="{ 'opacity-50 cursor-not-allowed': enviando }"
        :disabled="enviando"
        rows="1"
        style="min-height: 44px; max-height: 120px;"
      ></textarea>
      
      <!-- Contador de caracteres -->
      <div 
        v-if="contenido.length > 0" 
        class="absolute bottom-2 right-2 text-[10px] text-[#2D3748]/40 font-sans"
      >
        {{ contenido.length }}/2000
      </div>
    </div>

    <!-- Botón enviar -->
    <button
      @click="enviarMensaje"
      :disabled="!puedeEnviar || enviando"
      class="bg-[#5550F2] hover:bg-[#C89B8A] text-white px-5 py-3 rounded-lg transition-all duration-200 font-sans text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
      :class="{ 'animate-pulse': enviando }"
    >
      <svg 
        v-if="!enviando" 
        class="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>
      <span v-if="!enviando">Enviar</span>
      <span v-else>Enviando...</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Props {
  destinatarioId: string
  placeholder?: string
}

interface Emits {
  (e: 'mensajeEnviado'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Escribe tu mensaje aquí...'
})

const emit = defineEmits<Emits>()

const { enviar: enviarMensajeApi } = useMensajes()
const contenido = ref('')
const enviando = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

/**
 * Valida si se puede enviar el mensaje
 */
const puedeEnviar = computed(() => {
  const textoLimpio = contenido.value.trim()
  return textoLimpio.length > 0 && textoLimpio.length <= 2000 && !enviando.value
})

/**
 * Ajusta la altura del textarea dinámicamente
 */
const ajustarAltura = () => {
  nextTick(() => {
    if (!textareaRef.value) return
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 120)}px`
  })
}

/**
 * Envía el mensaje a Supabase
 */
const enviarMensaje = async () => {
  if (!puedeEnviar.value) return

  enviando.value = true
  const mensajeTexto = contenido.value.trim()

  try {
    const resultado = await enviarMensajeApi(props.destinatarioId, mensajeTexto)

    if (!resultado) {
      throw new Error('No se pudo enviar el mensaje')
    }

    // Limpiar y resetear
    contenido.value = ''
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }

    // Emitir evento de éxito
    emit('mensajeEnviado')
  } catch (error) {
    console.error('Error al enviar mensaje:', error)
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
/* Animación del botón al enviar */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
