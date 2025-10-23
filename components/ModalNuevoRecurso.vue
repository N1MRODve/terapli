<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="bg-[#F9F7F3] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-[#D8AFA0] to-[#EAD5D3] px-6 py-5">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-['Lora'] text-white">
                {{ recursoEditar ? 'Editar Recurso' : 'Nuevo Recurso Terapéutico' }}
              </h2>
              <button 
                @click="$emit('update:modelValue', false)"
                class="text-white hover:bg-white/20 rounded-lg p-2 transition"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
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
                  placeholder="Ej: Guía de Respiración Consciente"
                  class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]"
                />
              </div>

              <!-- Descripción -->
              <div>
                <label class="block text-sm font-['Lato'] font-semibold text-[#5D4A44] mb-2">
                  Descripción
                </label>
                <textarea
                  v-model="form.descripcion"
                  rows="3"
                  placeholder="Describe brevemente el contenido..."
                  class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44] resize-none"
                ></textarea>
              </div>

              <!-- Tipo de recurso -->
              <div>
                <label class="block text-sm font-['Lato'] font-semibold text-[#5D4A44] mb-2">
                  Tipo de recurso *
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    v-for="tipo in tiposRecurso"
                    :key="tipo.valor"
                    type="button"
                    @click="form.tipo = tipo.valor"
                    class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all"
                    :class="form.tipo === tipo.valor 
                      ? 'border-[#D8AFA0] bg-[#D8AFA0]/10' 
                      : 'border-[#EAD5D3]/50 bg-white hover:border-[#D8AFA0]/50'"
                  >
                    <span class="text-2xl mb-1">{{ tipo.icono }}</span>
                    <span class="text-xs font-medium text-[#5D4A44]">{{ tipo.valor }}</span>
                  </button>
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
                  placeholder="https://ejemplo.com/recurso"
                  class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]"
                />
                <p class="mt-2 text-xs text-[#5D4A44]/60">
                  Puedes agregar enlaces de YouTube, Google Drive, Dropbox, etc.
                </p>
              </div>

              <!-- Error -->
              <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
                <p class="text-sm text-red-800">{{ error }}</p>
              </div>

              <!-- Cargando -->
              <div v-if="cargando" class="bg-[#D8AFA0]/10 border border-[#D8AFA0]/30 rounded-xl p-4">
                <div class="flex items-center gap-3">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#D8AFA0]"></div>
                  <span class="text-sm text-[#5D4A44]">{{ mensajeCarga }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-white border-t border-[#EAD5D3]/30 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              @click="$emit('update:modelValue', false)"
              :disabled="cargando"
              class="px-6 py-2.5 text-[#5D4A44] font-['Lato'] rounded-xl hover:bg-[#F9F7F3] transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              @click="guardar"
              :disabled="cargando || !formularioValido"
              class="px-6 py-2.5 bg-[#D8AFA0] text-white font-['Lato'] font-semibold rounded-xl hover:bg-[#D8AFA0]/90 transition disabled:opacity-50"
            >
              {{ cargando ? 'Guardando...' : (recursoEditar ? 'Actualizar' : 'Guardar') }}
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
  modelValue: Boolean,
  recursoEditar: Object
})

const emit = defineEmits(['update:modelValue', 'guardado'])

const { crearRecurso, actualizarRecurso } = useRecursos()

const tiposRecurso = [
  { valor: 'PDF', icono: '📄' },
  { valor: 'Audio', icono: '🎵' },
  { valor: 'Video', icono: '🎥' },
  { valor: 'Ejercicio', icono: '🧘' },
  { valor: 'Lectura', icono: '📖' },
  { valor: 'Guía', icono: '📋' },
  { valor: 'Enlace', icono: '🔗' },
  { valor: 'Otro', icono: '📎' }
]

const form = ref({
  titulo: '',
  descripcion: '',
  tipo: 'Guía',
  url: ''
})

const cargando = ref(false)
const mensajeCarga = ref('')
const error = ref('')

const formularioValido = computed(() => {
  return form.value.titulo && form.value.tipo && form.value.url
})

watch(() => props.recursoEditar, (recurso) => {
  if (recurso) {
    form.value = {
      titulo: recurso.titulo,
      descripcion: recurso.descripcion,
      tipo: recurso.tipo,
      url: recurso.url
    }
  }
}, { immediate: true })

const guardar = async () => {
  if (!formularioValido.value) return

  cargando.value = true
  error.value = ''
  mensajeCarga.value = props.recursoEditar ? 'Actualizando...' : 'Guardando...'

  try {
    if (props.recursoEditar) {
      await actualizarRecurso(props.recursoEditar.id, form.value)
    } else {
      await crearRecurso(form.value)
    }

    emit('guardado')
    emit('update:modelValue', false)
    resetForm()
  } catch (err) {
    error.value = err.message || 'Error al guardar el recurso'
  } finally {
    cargando.value = false
  }
}

const resetForm = () => {
  form.value = {
    titulo: '',
    descripcion: '',
    tipo: 'Guía',
    url: ''
  }
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
