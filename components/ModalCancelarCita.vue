<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCitas } from '~/composables/useCitas'

// Props
const props = defineProps<{
  cita: {
    id: string
    fecha_cita: string
    hora_inicio: string
    hora_fin: string
    bono_id?: string | null
    paciente_nombre?: string
    terapeuta_nombre?: string
    modalidad?: string
    estado?: string
  } | null
  isOpen: boolean
}>()

// Emits
const emit = defineEmits(['close', 'cancelada'])

// Composables
const { cancelarCitaConReintegro, cancelarCita } = useCitas()

// Estado
const motivoCancelacion = ref('')
const reintegrarBono = ref(true)
const procesando = ref(false)

// Calcular horas de anticipación
const horasAnticipacion = computed(() => {
  if (!props.cita) return 0
  
  const fechaCita = new Date(`${props.cita.fecha_cita}T${props.cita.hora_inicio}`)
  const ahora = new Date()
  const diferenciaMilisegundos = fechaCita.getTime() - ahora.getTime()
  
  return Math.floor(diferenciaMilisegundos / (1000 * 60 * 60))
})

// Determinar si se puede reintegrar
const puedeReintegrar = computed(() => {
  return horasAnticipacion.value >= 24
})

// Mensaje de advertencia
const mensajeAdvertencia = computed(() => {
  if (!props.cita?.bono_id) {
    return 'Esta cita no tiene bono asociado. Se cancelará sin afectar ningún bono.'
  }
  
  if (horasAnticipacion.value < 24) {
    return `La cita está a menos de 24 horas (${horasAnticipacion.value}h). No se puede reintegrar la sesión al bono según la política de cancelación.`
  }
  
  if (horasAnticipacion.value < 0) {
    return 'Esta cita ya ha pasado. La sesión no se puede reintegrar.'
  }
  
  return `La cita está a ${horasAnticipacion.value} horas. Puedes elegir si devolver la sesión al bono del paciente.`
})

// Función para cerrar modal
const cerrar = () => {
  motivoCancelacion.value = ''
  reintegrarBono.value = true
  emit('close')
}

// Función para cancelar cita
const confirmarCancelacion = async () => {
  if (!props.cita) return
  
  procesando.value = true
  
  try {
    let resultado
    
    // Si hay bono asociado, usar la función con reintegro
    if (props.cita.bono_id) {
      // Solo reintegrar si es posible (más de 24 horas) y el usuario lo eligió
      const debeReintegrar = puedeReintegrar.value && reintegrarBono.value
      
      resultado = await cancelarCitaConReintegro(
        props.cita.id,
        props.cita.bono_id,
        debeReintegrar
      )
    } else {
      // Sin bono, usar cancelación simple
      resultado = await cancelarCita(props.cita.id, motivoCancelacion.value)
    }
    
    if (resultado.success) {
      emit('cancelada', resultado.data)
      cerrar()
    } else {
      alert(`Error al cancelar cita: ${resultado.error}`)
    }
  } catch (error: any) {
    console.error('Error al cancelar cita:', error)
    alert(`Error: ${error.message}`)
  } finally {
    procesando.value = false
  }
}

// Formato de fecha legible
const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && cita"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
      @click.self="cerrar"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 px-6 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-cafe">Cancelar Cita</h3>
                <p class="text-sm text-cafe/60">Gestión de sesión del bono</p>
              </div>
            </div>
            
            <button
              @click="cerrar"
              class="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Cerrar"
            >
              <svg class="w-5 h-5 text-cafe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6 space-y-5">
          <!-- Información de la cita -->
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
            <div class="flex items-start gap-2">
              <svg class="w-5 h-5 text-cafe/60 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div class="flex-1">
                <p class="text-xs text-cafe/60 font-medium">Paciente</p>
                <p class="text-sm font-semibold text-cafe">{{ cita.paciente_nombre || 'Sin nombre' }}</p>
              </div>
            </div>
            
            <div class="flex items-start gap-2">
              <svg class="w-5 h-5 text-cafe/60 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div class="flex-1">
                <p class="text-xs text-cafe/60 font-medium">Fecha y Hora</p>
                <p class="text-sm font-semibold text-cafe capitalize">{{ formatearFecha(cita.fecha_cita) }}</p>
                <p class="text-xs text-cafe/70">{{ cita.hora_inicio }} - {{ cita.hora_fin }}</p>
              </div>
            </div>

            <div v-if="cita.terapeuta_nombre" class="flex items-start gap-2">
              <svg class="w-5 h-5 text-cafe/60 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div class="flex-1">
                <p class="text-xs text-cafe/60 font-medium">Terapeuta</p>
                <p class="text-sm font-semibold text-cafe">{{ cita.terapeuta_nombre }}</p>
              </div>
            </div>
          </div>

          <!-- Alerta de tiempo -->
          <div 
            :class="[
              'flex items-start gap-3 p-4 rounded-xl border-l-4',
              puedeReintegrar 
                ? 'bg-blue-50 border-blue-500' 
                : 'bg-orange-50 border-orange-500'
            ]"
          >
            <svg 
              :class="[
                'w-5 h-5 flex-shrink-0 mt-0.5',
                puedeReintegrar ? 'text-blue-600' : 'text-orange-600'
              ]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <p 
                :class="[
                  'text-sm font-semibold mb-1',
                  puedeReintegrar ? 'text-blue-800' : 'text-orange-800'
                ]"
              >
                {{ puedeReintegrar ? '✓ Cancelación con anticipación' : '⚠️ Cancelación sin anticipación suficiente' }}
              </p>
              <p 
                :class="[
                  'text-xs',
                  puedeReintegrar ? 'text-blue-700' : 'text-orange-700'
                ]"
              >
                {{ mensajeAdvertencia }}
              </p>
            </div>
          </div>

          <!-- Opciones de reintegro (solo si hay bono y puede reintegrar) -->
          <div v-if="cita.bono_id && puedeReintegrar" class="space-y-3">
            <label class="block text-sm font-semibold text-cafe mb-2">
              ¿Devolver sesión al bono?
            </label>
            
            <div class="space-y-2">
              <!-- Opción: Reintegrar -->
              <label
                :class="[
                  'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  reintegrarBono 
                    ? 'border-verde bg-verde/5' 
                    : 'border-gray-200 hover:border-verde/50'
                ]"
              >
                <input
                  type="radio"
                  :value="true"
                  v-model="reintegrarBono"
                  class="mt-1 text-verde focus:ring-verde"
                />
                <div class="flex-1">
                  <p class="font-semibold text-cafe text-sm">Sí, devolver sesión</p>
                  <p class="text-xs text-cafe/70 mt-1">
                    La sesión se reintegrará al bono del paciente. Podrá usarla en otra ocasión.
                  </p>
                </div>
              </label>

              <!-- Opción: No reintegrar -->
              <label
                :class="[
                  'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  !reintegrarBono 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:border-red-300'
                ]"
              >
                <input
                  type="radio"
                  :value="false"
                  v-model="reintegrarBono"
                  class="mt-1 text-red-500 focus:ring-red-500"
                />
                <div class="flex-1">
                  <p class="font-semibold text-cafe text-sm">No, descontar sesión</p>
                  <p class="text-xs text-cafe/70 mt-1">
                    La sesión se descontará del bono como si se hubiera realizado.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <!-- Motivo de cancelación -->
          <div>
            <label class="block text-sm font-semibold text-cafe mb-2">
              Motivo de cancelación (opcional)
            </label>
            <textarea
              v-model="motivoCancelacion"
              rows="3"
              placeholder="Describe el motivo de la cancelación..."
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cafe/20 focus:border-cafe transition-colors resize-none text-sm"
            ></textarea>
          </div>

          <!-- Advertencia final -->
          <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div class="flex-1">
              <p class="text-sm font-semibold text-red-800 mb-1">
                Esta acción no se puede deshacer
              </p>
              <p class="text-xs text-red-700">
                La cita será marcada como cancelada y ya no aparecerá en la agenda activa.
              </p>
            </div>
          </div>
        </div>

        <!-- Footer con acciones -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            @click="cerrar"
            :disabled="procesando"
            class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-cafe rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Volver
          </button>
          <button
            @click="confirmarCancelacion"
            :disabled="procesando"
            class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="procesando" class="inline-block animate-spin">⏳</span>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>{{ procesando ? 'Cancelando...' : 'Cancelar Cita' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
