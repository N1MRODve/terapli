<template>
  <div class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]/40 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-serif text-lg font-semibold text-cafe flex items-center gap-2">
        <span class="text-xl">📝</span>
        Notas Clínicas Privadas
      </h3>
      <button
        v-if="!editando"
        @click="iniciarEdicion"
        class="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors"
      >
        ✏️ Editar
      </button>
    </div>

    <!-- Info de confidencialidad -->
    <div class="mb-4 p-3 bg-rosa/20 border border-rosa rounded-lg">
      <p class="text-xs text-cafe/70 flex items-start gap-2">
        <span class="text-purple-600">🔒</span>
        <span>
          Esta información es estrictamente confidencial y solo visible para ti como terapeuta.
          Cumple con los estándares de protección de datos clínicos.
        </span>
      </p>
    </div>

    <!-- Vista de lectura -->
    <div v-if="!editando" class="min-h-[200px]">
      <div v-if="contenidoLocal" class="prose prose-sm max-w-none text-cafe/80 whitespace-pre-wrap">
        {{ contenidoLocal }}
      </div>
      <div v-else class="text-center py-8">
        <span class="text-5xl mb-3 block opacity-40">📋</span>
        <p class="text-cafe/50 italic">
          Aún no hay notas registradas para este paciente
        </p>
        <button
          @click="iniciarEdicion"
          class="mt-4 px-4 py-2 text-sm bg-purple-600/10 text-purple-600 rounded-lg hover:bg-purple-600/20 transition-colors"
        >
          Añadir primera nota
        </button>
      </div>
    </div>

    <!-- Vista de edición -->
    <div v-else>
      <textarea
        ref="textareaRef"
        v-model="contenidoLocal"
        placeholder="Anota observaciones, reflexiones o aspectos a seguir trabajando...&#10;&#10;• Progreso observado en la sesión&#10;• Temas pendientes de abordar&#10;• Estrategias que funcionan&#10;• Aspectos que requieren atención"
        class="w-full min-h-[300px] px-4 py-3 bg-base-bg rounded-lg border border-purple-600/30 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300/20 transition-all text-cafe resize-y"
        @keydown.meta.enter="guardarNotas"
        @keydown.ctrl.enter="guardarNotas"
      ></textarea>

      <!-- Info de ayuda -->
      <div class="mt-2 flex items-center justify-between text-xs text-cafe/60">
        <span>
          💡 Presiona Cmd/Ctrl + Enter para guardar rápidamente
        </span>
        <span v-if="ultimaActualizacion">
          Última actualización: {{ formatearFecha(ultimaActualizacion) }}
        </span>
      </div>

      <!-- Botones de acción -->
      <div class="mt-4 flex items-center gap-3">
        <button
          @click="guardarNotas"
          :disabled="guardando"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="guardando">⏳</span>
          <span v-else>💾</span>
          <span>{{ guardando ? 'Guardando...' : 'Guardar cambios' }}</span>
        </button>
        
        <button
          @click="cancelarEdicion"
          :disabled="guardando"
          class="px-4 py-2 bg-white border border-cafe/20 text-cafe rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>

    <!-- Última modificación -->
    <div v-if="!editando && ultimaActualizacion" class="mt-4 pt-4 border-t border-gray-100">
      <p class="text-xs text-cafe/50">
        Última modificación: {{ formatearFecha(ultimaActualizacion) }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  pacienteId: {
    type: String,
    required: true
  },
  contenido: {
    type: String,
    default: ''
  },
  ultimaActualizacion: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['guardar', 'actualizar'])

const editando = ref(false)
const guardando = ref(false)
const contenidoLocal = ref(props.contenido)
const contenidoOriginal = ref(props.contenido)
const textareaRef = ref(null)

// Watch para actualizar contenido cuando cambia desde fuera
watch(() => props.contenido, (nuevoContenido) => {
  if (!editando.value) {
    contenidoLocal.value = nuevoContenido
    contenidoOriginal.value = nuevoContenido
  }
})

const iniciarEdicion = () => {
  editando.value = true
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const cancelarEdicion = () => {
  contenidoLocal.value = contenidoOriginal.value
  editando.value = false
}

const guardarNotas = async () => {
  if (guardando.value) return
  
  guardando.value = true
  
  try {
    // Emitir evento para que el padre maneje la lógica de guardado
    await emit('guardar', {
      pacienteId: props.pacienteId,
      contenido: contenidoLocal.value
    })
    
    contenidoOriginal.value = contenidoLocal.value
    editando.value = false
    
    // Feedback visual
    const button = event?.target
    if (button) {
      button.textContent = '✓ Guardado'
      setTimeout(() => {
        button.textContent = '💾 Guardar cambios'
      }, 2000)
    }
  } catch (error) {
    console.error('Error al guardar notas:', error)
    alert('Hubo un error al guardar las notas. Por favor, inténtalo de nuevo.')
  } finally {
    guardando.value = false
  }
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return ''
  const fecha = new Date(fechaStr)
  return fecha.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.prose {
  line-height: 1.7;
}
</style>
