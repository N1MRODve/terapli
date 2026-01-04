<script setup lang="ts">
// =============================================================================
// COMPONENTE: Tarjeta de Cita Individual
// =============================================================================
// Muestra una cita con toda su información: paciente, horario, estado y bono

interface Cita {
  id: string
  fecha_cita: string
  hora_inicio: string
  hora_fin: string
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'realizada'
  modalidad: string
  observaciones?: string
  es_horario_excepcional?: boolean
  motivo_excepcional?: string
  paciente?: {
    nombre_completo: string
    telefono?: string
    email?: string
  }
  bono?: {
    id: string
    sesiones_restantes: number
    sesiones_totales: number
    estado: string
  }
}

const props = defineProps<{
  cita: Cita
  compact?: boolean
}>()

const emit = defineEmits<{
  completar: [citaId: string]
  verHistorial: [bonoId: string]
}>()

// Formatear hora
const formatearHora = (hora: string) => {
  return hora.substring(0, 5) // HH:MM
}

// Clase CSS según estado de la cita
const claseEstadoCita = computed(() => {
  const estado = props.cita.estado
  const clases = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmada: 'bg-blue-100 text-blue-800 border-blue-300',
    completada: 'bg-green-100 text-green-800 border-green-300',
    realizada: 'bg-green-100 text-green-800 border-green-300',
    cancelada: 'bg-red-100 text-red-800 border-red-300'
  }
  return clases[estado] || 'bg-gray-100 text-gray-800 border-gray-300'
})

// Información del bono (color y alerta)
const estadoBono = computed(() => {
  if (!props.cita.bono) return null

  const sesiones = props.cita.bono.sesiones_restantes
  const estado = props.cita.bono.estado

  if (estado === 'completado' || sesiones === 0) {
    return {
      color: 'text-red-600',
      icono: '🚫',
      alerta: true,
      mensajeAlerta: 'Bono agotado',
      clase: 'bg-red-50 border-red-200'
    }
  } else if (sesiones === 1) {
    return {
      color: 'text-orange-600',
      icono: '⚠️',
      alerta: true,
      mensajeAlerta: 'Última sesión del bono',
      clase: 'bg-orange-50 border-orange-200'
    }
  } else if (sesiones <= 2) {
    return {
      color: 'text-yellow-600',
      icono: '⚠️',
      alerta: true,
      mensajeAlerta: 'Pocas sesiones restantes',
      clase: 'bg-yellow-50 border-yellow-200'
    }
  } else if (estado === 'activo') {
    return {
      color: 'text-green-600',
      icono: '✓',
      alerta: false,
      mensajeAlerta: null,
      clase: 'bg-green-50 border-green-200'
    }
  }

  return {
    color: 'text-gray-600',
    icono: 'ℹ️',
    alerta: false,
    mensajeAlerta: null,
    clase: 'bg-gray-50 border-gray-200'
  }
})

// Permitir completar
const puedeCompletar = computed(() => {
  return props.cita.estado === 'pendiente' || props.cita.estado === 'confirmada'
})
</script>

<template>
  <div
    :class="[
      'border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-white overflow-hidden',
      compact ? 'p-3' : 'p-5'
    ]"
  >
    <div class="flex items-start justify-between gap-4">
      <!-- Información principal -->
      <div class="flex-1 min-w-0">
        <!-- Header: Paciente y estado -->
        <div class="flex items-center gap-3 mb-2 flex-wrap">
          <h3 :class="[compact ? 'text-base' : 'text-lg', 'font-semibold text-gray-900 truncate']">
            {{ cita.paciente?.nombre_completo || 'Paciente' }}
          </h3>
          <span
            :class="[
              'px-3 py-1 text-xs font-medium rounded-full border',
              claseEstadoCita
            ]"
          >
            {{ cita.estado.toUpperCase() }}
          </span>
          <!-- Badge de horario excepcional -->
          <span
            v-if="cita.es_horario_excepcional"
            class="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 border border-purple-300"
            :title="cita.motivo_excepcional || 'Cita fuera del horario habitual'"
          >
            Horario excepcional
          </span>
        </div>

        <!-- Detalles de la cita -->
        <div :class="['space-y-1', compact ? 'text-xs' : 'text-sm', 'text-gray-600']">
          <div class="flex items-center gap-2">
            <svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="truncate">
              {{ formatearHora(cita.hora_inicio) }} - {{ formatearHora(cita.hora_fin) }}
            </span>
            <span v-if="cita.modalidad" class="text-gray-400">•</span>
            <span v-if="cita.modalidad" class="capitalize truncate">{{ cita.modalidad }}</span>
          </div>

          <div v-if="cita.paciente?.telefono && !compact" class="flex items-center gap-2">
            <svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span class="truncate">{{ cita.paciente.telefono }}</span>
          </div>
        </div>

        <!-- Información del bono -->
        <div v-if="cita.bono" :class="['mt-3 p-3 rounded-lg border', estadoBono?.clase || 'bg-gray-50 border-gray-200']">
          <div class="flex items-center justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-700 mb-1">
                {{ estadoBono?.icono }} Bono de Sesiones
              </p>
              <div class="flex items-center gap-2 flex-wrap">
                <p :class="['text-sm font-semibold', estadoBono?.color || 'text-gray-900']">
                  {{ cita.bono.sesiones_restantes }} / {{ cita.bono.sesiones_totales }} sesiones
                </p>
                <span class="text-xs text-gray-500 capitalize">
                  ({{ cita.bono.estado }})
                </span>
              </div>

              <!-- Alerta de sesiones -->
              <p v-if="estadoBono?.alerta" :class="['mt-2 text-xs font-medium', estadoBono.color]">
                {{ estadoBono.mensajeAlerta }}
              </p>
            </div>

            <!-- Botón ver historial -->
            <button
              v-if="!compact"
              @click="emit('verHistorial', cita.bono.id)"
              class="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap px-2 py-1 hover:bg-blue-50 rounded transition-colors"
              type="button"
            >
              📊 Historial
            </button>
          </div>
        </div>

        <!-- Sin bono activo -->
        <div v-else class="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p class="text-xs text-gray-500 italic flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sin bono activo - Consulta individual
          </p>
        </div>

        <!-- Observaciones -->
        <div v-if="cita.observaciones && !compact" class="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
          <p class="font-medium text-gray-500 mb-1">Observaciones:</p>
          {{ cita.observaciones }}
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex flex-col gap-2">
        <button
          v-if="puedeCompletar"
          @click="emit('completar', cita.id)"
          :class="[
            'px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors',
            compact ? 'text-xs' : 'text-sm'
          ]"
          type="button"
        >
          ✅ Completar
        </button>

        <span
          v-else-if="cita.estado === 'completada' || cita.estado === 'realizada'"
          :class="[
            'px-4 py-2 bg-green-100 text-green-800 font-medium rounded-lg text-center',
            compact ? 'text-xs' : 'text-sm'
          ]"
        >
          ✓ Completada
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animación suave para hover */
.hover\:shadow-md {
  transition: box-shadow 0.2s ease-in-out;
}
</style>
