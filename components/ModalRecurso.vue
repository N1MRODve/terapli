<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="cerrar"
      >
        <div class="bg-[#F9F7F3] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-[#D8AFA0] to-[#EAD5D3] px-6 py-5">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-['Lora'] text-white">
                  {{ esEdicion ? '✏️ Editar Recurso' : '➕ Nuevo Recurso' }}
                </h2>
                <p class="text-sm text-white/90 mt-1">
                  {{ esEdicion ? 'Modifica la información del recurso' : 'Añade un nuevo recurso al repositorio' }}
                </p>
              </div>
              <button 
                @click="cerrar"
                class="text-white hover:bg-white/20 rounded-lg p-2 transition"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <form @submit.prevent="guardar" class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div class="space-y-5">
              <!-- Título -->
              <div>
                <label class="block text-sm font-['Lato'] font-semibold text-[#5D4A44] mb-2">
                  Título del recurso *
                </label>
                <input
                  v-model="form.titulo"
                  type="text"
                  required
                  placeholder="Ej: Guía de respiración consciente"
                  class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]"
                />
              </div>

              <!-- Descripción -->
              <div>
                <label class="block text-sm font-['Lato'] font-semibold text-[#5D4A44] mb-2">
                  Descripción *
                </label>
                <textarea
                  v-model="form.descripcion"
                  rows="3"
                  required
                  placeholder="Describe brevemente el contenido del recurso..."
                  class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44] resize-none"
                ></textarea>
              </div>

              <!-- Tipo y Categoría en grid -->
              <div class="grid grid-cols-2 gap-4">
                <!-- Tipo -->
                <div>
                  <label class="block text-sm font-['Lato'] font-semibold text-[#5D4A44] mb-2">
                    Tipo *
                  </label>
                  <select
                    v-model="form.tipo"
                    required
                    class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Guía">📋 Guía</option>
                    <option value="Audio">🎵 Audio</option>
                    <option value="Video">🎥 Video</option>
                    <option value="Ejercicio">🧘 Ejercicio</option>
                    <option value="Lectura">📖 Lectura</option>
                    <option value="PDF">📄 PDF</option>
                  </select>
                </div>

                <!-- Categoría -->
                <div>
                  <label class="block text-sm font-['Lato'] font-semibold text-[#5D4A44] mb-2">
                    Categoría
                  </label>
                  <select
                    v-model="form.categoria"
                    class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]"
                  >
                    <option value="">Sin categoría</option>
                    <option value="Ansiedad">Ansiedad</option>
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Relajación">Relajación</option>
                    <option value="Autoestima">Autoestima</option>
                    <option value="TCC">TCC</option>
                    <option value="Estrés">Estrés</option>
                    <option value="Depresión">Depresión</option>
                    <option value="Relaciones">Relaciones</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <!-- URL -->
              <div>
                <label class="block text-sm font-['Lato'] font-semibold text-[#5D4A44] mb-2">
                  URL del recurso *
                </label>
                <input
                  v-model="form.url"
                  type="url"
                  required
                  placeholder="https://..."
                  class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]"
                />
                <p class="text-xs text-[#5D4A44]/60 mt-1">
                  Enlace directo al recurso (YouTube, PDF, artículo web, etc.)
                </p>
              </div>

              <!-- Icono -->
              <div>
                <label class="block text-sm font-['Lato'] font-semibold text-[#5D4A44] mb-2">
                  Icono (emoji)
                </label>
                <div class="flex gap-2">
                  <input
                    v-model="form.icono"
                    type="text"
                    maxlength="2"
                    placeholder="📚"
                    class="w-20 px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-center text-2xl"
                  />
                  <div class="flex flex-wrap gap-2 flex-1">
                    <button
                      v-for="emoji in iconosSugeridos"
                      :key="emoji"
                      type="button"
                      @click="form.icono = emoji"
                      class="px-3 py-2 text-2xl hover:bg-[#EAD5D3]/30 rounded-lg transition"
                    >
                      {{ emoji }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Tags -->
              <div>
                <label class="block text-sm font-['Lato'] font-semibold text-[#5D4A44] mb-2">
                  Etiquetas
                </label>
                <input
                  v-model="tagsInput"
                  type="text"
                  placeholder="respiración, mindfulness, ansiedad (separadas por comas)"
                  class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]"
                />
                <p class="text-xs text-[#5D4A44]/60 mt-1">
                  Separa las etiquetas con comas
                </p>
                <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
                  <span
                    v-for="(tag, index) in form.tags"
                    :key="index"
                    class="px-3 py-1 bg-[#D8AFA0]/20 text-[#5D4A44] rounded-full text-sm flex items-center gap-2"
                  >
                    #{{ tag }}
                    <button
                      type="button"
                      @click="eliminarTag(index)"
                      class="text-[#5D4A44]/50 hover:text-[#5D4A44]"
                    >
                      ×
                    </button>
                  </span>
                </div>
              </div>

              <!-- Error -->
              <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <p class="text-sm text-red-800">{{ error }}</p>
                </div>
              </div>
            </div>
          </form>

          <!-- Footer -->
          <div class="bg-white border-t border-[#EAD5D3]/30 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              @click="cerrar"
              :disabled="guardando"
              class="px-6 py-2.5 text-[#5D4A44] font-['Lato'] rounded-xl hover:bg-[#F9F7F3] transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              @click="guardar"
              :disabled="guardando || !formularioValido"
              class="px-6 py-2.5 bg-[#D8AFA0] text-white font-['Lato'] font-semibold rounded-xl hover:bg-[#D8AFA0]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span v-if="guardando" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ guardando ? 'Guardando...' : (esEdicion ? 'Guardar Cambios' : 'Crear Recurso') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  recurso: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'guardado'])

const { crearRecurso, actualizarRecurso } = useTerapeuta()

// Estado
const form = ref({
  titulo: '',
  descripcion: '',
  tipo: '',
  categoria: '',
  url: '',
  icono: '📄',
  tags: []
})

const tagsInput = ref('')
const guardando = ref(false)
const error = ref('')

// Iconos sugeridos
const iconosSugeridos = ['📋', '🎵', '🎥', '🧘', '📖', '📄', '🌟', '💡', '🎯', '✨']

// Computed
const esEdicion = computed(() => !!props.recurso)

const formularioValido = computed(() => {
  return form.value.titulo.trim() !== '' &&
         form.value.descripcion.trim() !== '' &&
         form.value.tipo !== '' &&
         form.value.url.trim() !== ''
})

// Watch para actualizar tags
watch(tagsInput, (nuevoValor) => {
  if (nuevoValor.includes(',')) {
    const tags = nuevoValor
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '' && !form.value.tags.includes(t))
    
    form.value.tags.push(...tags)
    tagsInput.value = ''
  }
})

// Watch para cargar datos al editar
watch(() => props.modelValue, (mostrar) => {
  if (mostrar) {
    if (props.recurso) {
      // Modo edición - cargar datos del recurso
      form.value = {
        titulo: props.recurso.titulo || '',
        descripcion: props.recurso.descripcion || '',
        tipo: props.recurso.tipo || '',
        categoria: props.recurso.categoria || '',
        url: props.recurso.url || '',
        icono: props.recurso.icono || '📄',
        tags: props.recurso.tags ? [...props.recurso.tags] : []
      }
    } else {
      // Modo creación - resetear formulario
      resetear()
    }
  }
})

// Métodos
const eliminarTag = (index) => {
  form.value.tags.splice(index, 1)
}

const guardar = async () => {
  if (!formularioValido.value) return

  guardando.value = true
  error.value = ''

  try {
    if (esEdicion.value) {
      // Actualizar recurso existente
      const resultado = await actualizarRecurso(props.recurso.id, {
        titulo: form.value.titulo,
        descripcion: form.value.descripcion,
        tipo: form.value.tipo,
        categoria: form.value.categoria || null,
        url: form.value.url,
        icono: form.value.icono,
        tags: form.value.tags.length > 0 ? form.value.tags : null
      })

      if (!resultado.success) {
        throw new Error(resultado.error || 'Error al actualizar el recurso')
      }

      emit('guardado', resultado.data)
      emit('update:modelValue', false)
    } else {
      // Crear nuevo recurso
      const resultado = await crearRecurso({
        titulo: form.value.titulo,
        descripcion: form.value.descripcion,
        tipo: form.value.tipo,
        categoria: form.value.categoria || null,
        url: form.value.url,
        icono: form.value.icono,
        tags: form.value.tags.length > 0 ? form.value.tags : null
      })

      if (!resultado.success) {
        throw new Error(resultado.error || 'Error al crear el recurso')
      }

      emit('guardado', resultado.data)
      emit('update:modelValue', false)
    }
  } catch (err) {
    console.error('Error al guardar recurso:', err)
    error.value = err.message || 'Error al guardar el recurso. Intenta de nuevo.'
  } finally {
    guardando.value = false
  }
}

const cerrar = () => {
  if (!guardando.value) {
    emit('update:modelValue', false)
  }
}

const resetear = () => {
  form.value = {
    titulo: '',
    descripcion: '',
    tipo: '',
    categoria: '',
    url: '',
    icono: '📄',
    tags: []
  }
  tagsInput.value = ''
  error.value = ''
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
