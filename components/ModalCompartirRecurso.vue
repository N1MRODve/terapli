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
              <div>
                <h2 class="text-2xl font-['Lora'] text-white">Compartir Recurso</h2>
                <p class="text-sm text-white/90 mt-1">{{ recurso?.titulo }}</p>
              </div>
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
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div class="space-y-5">
              <!-- Buscar pacientes -->
              <div>
                <label class="block text-sm font-['Lato'] font-semibold text-[#5D4A44] mb-2">
                  Buscar paciente
                </label>
                <div class="relative">
                  <input
                    v-model="busqueda"
                    type="text"
                    placeholder="Buscar por nombre..."
                    class="w-full px-4 py-3 pl-10 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]"
                  />
                  <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5D4A44]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <!-- Seleccionar pacientes -->
              <div>
                <label class="block text-sm font-['Lato'] font-semibold text-[#5D4A44] mb-2">
                  Seleccionar pacientes *
                </label>
                
                <div v-if="cargandoPacientes" class="text-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D8AFA0] mx-auto"></div>
                  <p class="text-sm text-[#5D4A44]/60 mt-2">Cargando pacientes...</p>
                </div>

                <div v-else-if="pacientesFiltrados.length === 0" class="text-center py-8">
                  <p class="text-sm text-[#5D4A44]/60">No se encontraron pacientes</p>
                </div>

                <div v-else class="bg-white border border-[#EAD5D3]/50 rounded-xl max-h-60 overflow-y-auto">
                  <label
                    v-for="paciente in pacientesFiltrados"
                    :key="paciente.id"
                    class="flex items-center gap-3 p-4 hover:bg-[#F9F7F3] cursor-pointer border-b border-[#EAD5D3]/30 last:border-0 transition"
                  >
                    <input
                      type="checkbox"
                      :value="paciente.id"
                      v-model="pacientesSeleccionados"
                      class="w-5 h-5 text-[#D8AFA0] rounded focus:ring-2 focus:ring-[#D8AFA0]"
                    />
                    <div class="flex-1">
                      <p class="font-medium text-[#5D4A44]">
                        {{ paciente.nombre }}
                      </p>
                      <p v-if="paciente.email" class="text-sm text-[#5D4A44]/60">
                        {{ paciente.email }}
                      </p>
                    </div>
                  </label>
                </div>

                <p v-if="pacientesSeleccionados.length > 0" class="text-sm text-[#5D4A44]/70 mt-2">
                  {{ pacientesSeleccionados.length }} paciente(s) seleccionado(s)
                </p>
              </div>

              <!-- Mensaje opcional -->
              <div>
                <label class="block text-sm font-['Lato'] font-semibold text-[#5D4A44] mb-2">
                  Mensaje opcional
                </label>
                <textarea
                  v-model="mensaje"
                  rows="3"
                  placeholder="Añade un mensaje personalizado para el paciente..."
                  class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44] resize-none"
                ></textarea>
                <p class="text-xs text-[#5D4A44]/60 mt-1">
                  Este mensaje se incluirá en la notificación que recibirá el paciente
                </p>
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

              <!-- Mensaje de carga -->
              <div v-if="compartiendo" class="bg-[#D8AFA0]/10 border border-[#D8AFA0]/30 rounded-xl p-4">
                <div class="flex items-center gap-3">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#D8AFA0]"></div>
                  <span class="text-sm text-[#5D4A44]">Compartiendo recurso...</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-white border-t border-[#EAD5D3]/30 px-6 py-4 flex items-center justify-between">
            <p class="text-sm text-[#5D4A44]/70">
              Los pacientes recibirán una notificación automática
            </p>
            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="$emit('update:modelValue', false)"
                :disabled="compartiendo"
                class="px-6 py-2.5 text-[#5D4A44] font-['Lato'] rounded-xl hover:bg-[#F9F7F3] transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                @click="compartir"
                :disabled="compartiendo || pacientesSeleccionados.length === 0"
                class="px-6 py-2.5 bg-[#D8AFA0] text-white font-['Lato'] font-semibold rounded-xl hover:bg-[#D8AFA0]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ compartiendo ? 'Compartiendo...' : 'Enviar Recurso' }}
              </button>
            </div>
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

const emit = defineEmits(['update:modelValue', 'compartido'])

const { getPacientes, compartirRecurso } = useTerapeuta()

const pacientes = ref([])
const busqueda = ref('')
const pacientesSeleccionados = ref([])
const mensaje = ref('')
const cargandoPacientes = ref(false)
const compartiendo = ref(false)
const error = ref('')

// Filtrar pacientes por búsqueda
const pacientesFiltrados = computed(() => {
  if (!busqueda.value) return pacientes.value
  
  const termino = busqueda.value.toLowerCase()
  return pacientes.value.filter(p => 
    (p.nombre || '').toLowerCase().includes(termino) ||
    (p.email || '').toLowerCase().includes(termino) ||
    (p.area_de_acompanamiento || '').toLowerCase().includes(termino)
  )
})

// Cargar pacientes cuando se abre el modal
watch(() => props.modelValue, async (nuevoValor) => {
  if (nuevoValor) {
    await cargarPacientes()
  } else {
    resetear()
  }
})

const cargarPacientes = async () => {
  cargandoPacientes.value = true
  error.value = ''
  
  try {
    const data = await getPacientes()
    pacientes.value = data || []
  } catch (err) {
    console.error('Error al cargar pacientes:', err)
    error.value = 'Error al cargar la lista de pacientes'
  } finally {
    cargandoPacientes.value = false
  }
}

const compartir = async () => {
  if (pacientesSeleccionados.value.length === 0 || !props.recurso) return
  
  compartiendo.value = true
  error.value = ''
  
  try {
    const resultado = await compartirRecurso(
      props.recurso.id,
      pacientesSeleccionados.value,
      mensaje.value || undefined
    )
    
    if (!resultado.success) {
      throw new Error(resultado.error || 'Error al compartir el recurso')
    }
    
    emit('compartido', {
      recursoId: props.recurso.id,
      pacientes: pacientesSeleccionados.value,
      cantidad: pacientesSeleccionados.value.length
    })
    
    emit('update:modelValue', false)
  } catch (err) {
    console.error('Error al compartir recurso:', err)
    error.value = err.message || 'Error al compartir el recurso. Intenta de nuevo.'
  } finally {
    compartiendo.value = false
  }
}

const resetear = () => {
  pacientesSeleccionados.value = []
  mensaje.value = ''
  busqueda.value = ''
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
