<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCitas } from '~/composables/useCitas'

const props = defineProps<{
  isOpen: boolean
  citaId: string | null
}>()

const emit = defineEmits(['close', 'actualizado', 'eliminado'])

// Composables
const supabase = useSupabaseClient()

// Estado
const cita = ref<any>(null)
const cargando = ref(false)
const mostrarModalEdicion = ref(false)

// Cargar datos de la cita
const cargarCita = async () => {
  if (!props.citaId) return
  
  try {
    cargando.value = true
    
    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        paciente:pacientes!citas_paciente_id_fkey (
          id,
          nombre_completo,
          email,
          telefono,
          frecuencia
        ),
        bono:bonos!citas_bono_id_fkey (
          id,
          tipo,
          sesiones_totales,
          sesiones_restantes
        )
      `)
      .eq('id', props.citaId)
      .single()
    
    if (error) throw error
    cita.value = data
  } catch (error) {
    console.error('Error al cargar cita:', error)
  } finally {
    cargando.value = false
  }
}

// Watch para cargar cuando se abre el modal
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.citaId) {
    cargarCita()
  } else {
    cita.value = null
  }
})

// Formatear fecha
const fechaFormateada = computed(() => {
  if (!cita.value?.fecha_cita) return ''
  const fecha = new Date(cita.value.fecha_cita + 'T00:00:00')
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Clase CSS según estado
const claseEstado = computed(() => {
  const estado = cita.value?.estado
  const clases = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmada: 'bg-blue-100 text-blue-800 border-blue-300',
    completada: 'bg-green-100 text-green-800 border-green-300',
    realizada: 'bg-green-100 text-green-800 border-green-300',
    cancelada: 'bg-red-100 text-red-800 border-red-300'
  }
  return clases[estado as keyof typeof clases] || 'bg-gray-100 text-gray-800'
})

// Acciones
const cerrar = () => {
  emit('close')
}

const abrirEdicion = () => {
  mostrarModalEdicion.value = true
}

const handleActualizado = () => {
  emit('actualizado')
  cargarCita() // Recargar datos
  mostrarModalEdicion.value = false
}

const handleEliminado = () => {
  emit('eliminado')
  cerrar()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="cerrar"
    >
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Detalles de la Cita</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Información completa de la sesión</p>
          </div>
          <button
            @click="cerrar"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Cerrar"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="p-12 flex flex-col items-center justify-center">
          <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Cargando detalles...</p>
        </div>

        <!-- Contenido -->
        <div v-else-if="cita" class="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <!-- Paciente -->
          <div class="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Paciente
              </h3>
              <span :class="['px-3 py-1 text-xs font-medium rounded-full border', claseEstado]">
                {{ cita.estado?.toUpperCase() }}
              </span>
            </div>
            <p class="text-lg font-bold text-gray-900 dark:text-white">{{ cita.paciente?.nombre_completo || cita.paciente_nombre || 'Sin nombre' }}</p>
            <p v-if="cita.paciente?.email" class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ cita.paciente.email }}</p>
            <p v-if="cita.paciente?.telefono" class="text-sm text-gray-600 dark:text-gray-400">{{ cita.paciente.telefono }}</p>
          </div>

          <!-- Fecha y Hora -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">📅 Fecha</p>
              <p class="font-semibold text-gray-900 dark:text-white capitalize">{{ fechaFormateada }}</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">🕐 Horario</p>
              <p class="font-semibold text-gray-900 dark:text-white">{{ cita.hora_inicio?.substring(0, 5) }} - {{ cita.hora_fin?.substring(0, 5) }}</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">💻 Modalidad</p>
              <p class="font-semibold text-gray-900 dark:text-white capitalize">{{ cita.modalidad || 'No especificada' }}</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">⏱️ Duración</p>
              <p class="font-semibold text-gray-900 dark:text-white">{{ cita.duracion || 60 }} minutos</p>
            </div>
          </div>

          <!-- Bono (si existe) -->
          <div v-if="cita.bono" class="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span class="text-xl">🎫</span>
              Bono Activo
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-green-600 dark:text-green-400 mb-1">Tipo</p>
                <p class="font-semibold text-gray-900 dark:text-white capitalize">{{ cita.bono.tipo || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-xs text-green-600 dark:text-green-400 mb-1">Sesiones</p>
                <p class="font-semibold text-gray-900 dark:text-white">
                  {{ cita.bono.sesiones_restantes }} / {{ cita.bono.sesiones_totales }}
                </p>
              </div>
            </div>
          </div>

          <!-- Observaciones -->
          <div v-if="cita.observaciones" class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Observaciones
            </h3>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ cita.observaciones }}</p>
          </div>

          <!-- Metadatos -->
          <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>Creada: {{ new Date(cita.created_at).toLocaleString('es-ES') }}</p>
            <p v-if="cita.updated_at">Actualizada: {{ new Date(cita.updated_at).toLocaleString('es-ES') }}</p>
          </div>
        </div>

        <!-- Sin datos -->
        <div v-else class="p-12 text-center">
          <p class="text-gray-500 dark:text-gray-400">No se encontraron datos de la cita</p>
        </div>

        <!-- Footer con acciones -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-3 bg-gray-50 dark:bg-gray-800">
          <button
            @click="cerrar"
            class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Cerrar
          </button>
          <button
            @click="abrirEdicion"
            class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            ✏️ Editar Cita
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
    <ModalEditarCita
      :isOpen="mostrarModalEdicion"
      :citaId="citaId"
      @close="mostrarModalEdicion = false"
      @actualizado="handleActualizado"
    />
  </Teleport>
</template>

<style scoped>
/* Animación de spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
