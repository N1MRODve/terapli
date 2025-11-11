<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="cerrar"
      >
        <div 
          class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600/10 to-rosa/20">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">
                📤 Enviar Recurso
              </h2>
              <p class="text-sm text-gray-600 mt-1">
                {{ recurso?.titulo }}
              </p>
            </div>
            <button
              @click="cerrar"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cerrar"
            >
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Contenido (scrolleable) -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Loading state -->
            <div v-if="cargandoPacientes" class="flex items-center justify-center py-12">
              <LoadingSpinner class="w-8 h-8 text-purple-600" />
            </div>

            <!-- Sin pacientes -->
            <div v-else-if="!pacientes || pacientes.length === 0" class="text-center py-12">
              <div class="text-6xl mb-4">👥</div>
              <p class="text-gray-600 mb-2">No tienes pacientes registrados</p>
              <p class="text-sm text-gray-500">Añade pacientes primero para poder enviarles recursos</p>
            </div>

            <!-- Con pacientes -->
            <div v-else class="space-y-4">
              <!-- Buscador -->
              <div class="relative">
                <input
                  v-model="busqueda"
                  type="text"
                  placeholder="Buscar paciente por nombre..."
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
                />
                <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <!-- Botones seleccionar todos/ninguno -->
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-600">
                  {{ pacientesSeleccionados.length }} de {{ pacientesFiltrados.length }} seleccionados
                </div>
                <div class="flex gap-2">
                  <button
                    @click="seleccionarTodos"
                    class="text-sm text-purple-600 hover:text-purple-600/80 font-medium"
                  >
                    Seleccionar todos
                  </button>
                  <span class="text-gray-300">|</span>
                  <button
                    @click="deseleccionarTodos"
                    class="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Ninguno
                  </button>
                </div>
              </div>

              <!-- Lista de pacientes -->
              <div class="space-y-2 max-h-80 overflow-y-auto">
                <label
                  v-for="paciente in pacientesFiltrados"
                  :key="paciente.id"
                  class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-600 hover:bg-purple-600/5 transition-all cursor-pointer"
                  :class="{ 'border-purple-600 bg-purple-600/10': pacientesSeleccionados.includes(paciente.id) }"
                >
                  <input
                    type="checkbox"
                    :value="paciente.id"
                    v-model="pacientesSeleccionados"
                    class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-300"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-900">
                      {{ paciente.nombre }}
                    </div>
                    <div v-if="paciente.email" class="text-sm text-gray-500">
                      {{ paciente.email }}
                    </div>
                  </div>
                  <!-- Indicador si ya recibió este recurso -->
                  <div v-if="yaRecibioRecurso(paciente.id)" class="flex-shrink-0">
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <span>✓</span>
                      <span>Enviado</span>
                    </span>
                  </div>
                </label>

                <!-- Sin resultados de búsqueda -->
                <div v-if="pacientesFiltrados.length === 0" class="text-center py-8 text-gray-500">
                  No se encontraron pacientes con ese nombre
                </div>
              </div>

              <!-- Mensaje personalizado -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Mensaje personalizado (opcional)
                </label>
                <textarea
                  v-model="mensaje"
                  rows="3"
                  placeholder="Escribe un mensaje para acompañar este recurso..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all resize-none"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Este mensaje aparecerá junto al recurso en el espacio del paciente
                </p>
              </div>
            </div>
          </div>

          <!-- Footer con botones -->
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
            <button
              type="button"
              @click="cerrar"
              class="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="enviar"
              :disabled="pacientesSeleccionados.length === 0 || enviando"
              class="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-600/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <LoadingSpinner v-if="enviando" class="w-4 h-4" />
              <span>Enviar a {{ pacientesSeleccionados.length }} paciente{{ pacientesSeleccionados.length !== 1 ? 's' : '' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Recurso } from '~/composables/useRecursos'

// ============================================
// PROPS & EMITS
// ============================================

const props = defineProps<{
  modelValue: boolean
  recurso?: Recurso | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'enviado': []
}>()

// ============================================
// COMPOSABLES
// ============================================

const { enviarRecursoAPacientes } = useRecursos()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// ============================================
// ESTADO
// ============================================

const pacientes = ref<any[]>([])
const pacientesSeleccionados = ref<string[]>([])
const mensaje = ref('')
const busqueda = ref('')
const enviando = ref(false)
const cargandoPacientes = ref(false)

// ============================================
// COMPUTED
// ============================================

const pacientesFiltrados = computed(() => {
  if (!busqueda.value) return pacientes.value
  
  const termino = busqueda.value.toLowerCase()
  return pacientes.value.filter((p: any) => 
    p.nombre?.toLowerCase().includes(termino) ||
    p.email?.toLowerCase().includes(termino)
  )
})

// ============================================
// MÉTODOS
// ============================================

const seleccionarTodos = () => {
  pacientesSeleccionados.value = pacientesFiltrados.value.map((p: any) => p.id)
}

const deseleccionarTodos = () => {
  pacientesSeleccionados.value = []
}

const yaRecibioRecurso = (pacienteId: string): boolean => {
  // TODO: Implementar check de si el paciente ya recibió este recurso
  // Por ahora retornamos false
  return false
}

const enviar = async () => {
  if (pacientesSeleccionados.value.length === 0 || !props.recurso) return

  try {
    enviando.value = true

    const resultado = await enviarRecursoAPacientes({
      recurso_id: props.recurso.id,
      paciente_ids: pacientesSeleccionados.value,
      mensaje_terapeuta: mensaje.value.trim() || undefined,
    })

    if (resultado) {
      emit('enviado')
      cerrar()
      
      // Mostrar mensaje de éxito
      const cantidad = pacientesSeleccionados.value.length
      alert(`✅ Recurso enviado exitosamente a ${cantidad} paciente${cantidad !== 1 ? 's' : ''}`)
    } else {
      alert('Hubo un error al enviar el recurso. Por favor, intenta de nuevo.')
    }

  } catch (error) {
    console.error('Error al enviar recurso:', error)
    alert('Hubo un error al enviar el recurso. Por favor, intenta de nuevo.')
  } finally {
    enviando.value = false
  }
}

const cerrar = () => {
  emit('update:modelValue', false)
  // Resetear estado
  setTimeout(() => {
    pacientesSeleccionados.value = []
    mensaje.value = ''
    busqueda.value = ''
  }, 300)
}

const cargarPacientes = async () => {
  if (!user.value) return

  try {
    cargandoPacientes.value = true
    
    const { data, error } = await supabase
      .from('pacientes')
      .select('id, nombre, email')
      .eq('terapeuta_id', user.value.id)
      .order('nombre', { ascending: true })

    if (error) throw error

    pacientes.value = data || []
  } catch (error) {
    console.error('Error al cargar pacientes:', error)
  } finally {
    cargandoPacientes.value = false
  }
}

// ============================================
// LIFECYCLE
// ============================================

onMounted(async () => {
  // Cargar pacientes al montar
  await cargarPacientes()
})

watch(() => props.modelValue, async (abierto) => {
  if (abierto) {
    // Recargar pacientes al abrir
    await cargarPacientes()
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
