<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: SessionCard
 * =============================================================================
 * Tarjeta de sesion/cita para el dashboard con jerarquía visual clara:
 * - Hora grande y destacada
 * - Nombre paciente prominente
 * - Modalidad + estado como info secundaria
 * - Botones de acción claros
 */

const props = defineProps<{
  id: string
  fecha: string
  hora: string
  pacienteNombre: string
  modalidad: 'presencial' | 'online' | 'virtual' | 'telefonica'
  estado: 'pendiente' | 'confirmada' | 'realizada' | 'cancelada' | 'completada'
  isNext?: boolean
}>()

/**
 * Determina si la cita es de hoy
 */
const esHoy = computed(() => {
  if (!props.fecha) return false
  const hoy = new Date().toISOString().split('T')[0]
  return props.fecha === hoy
})

/**
 * Determina si la cita ya pasó (para mostrar botón de registrar pago)
 */
const citaPasada = computed(() => {
  if (!props.fecha || !props.hora) return false
  const ahora = new Date()
  const fechaHoraCita = new Date(`${props.fecha}T${props.hora}:00`)
  return fechaHoraCita < ahora
})

/**
 * Determina si se puede registrar pago (cita realizada/completada o ya pasó)
 */
const puedeRegistrarPago = computed(() => {
  return citaPasada.value || props.estado === 'realizada' || props.estado === 'completada'
})

const emit = defineEmits<{
  (e: 'click', id: string): void
  (e: 'confirmar', id: string): void
  (e: 'registrar-pago', id: string): void
}>()

// Configuracion visual por modalidad
const modalidadConfig = {
  presencial: { label: 'Presencial', icon: 'location' },
  online: { label: 'Online', icon: 'video' },
  virtual: { label: 'Online', icon: 'video' },
  telefonica: { label: 'Teléfono', icon: 'phone' }
}

const modalidadInfo = computed(() => modalidadConfig[props.modalidad] || modalidadConfig.presencial)

// Estado con colores
const estadoConfig = computed(() => {
  switch (props.estado) {
    case 'confirmada':
      return { label: 'Confirmada', color: 'text-emerald-600', bg: 'bg-emerald-50' }
    case 'pendiente':
      return { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-50' }
    case 'realizada':
    case 'completada':
      return { label: 'Realizada', color: 'text-blue-600', bg: 'bg-blue-50' }
    case 'cancelada':
      return { label: 'Cancelada', color: 'text-gray-400', bg: 'bg-gray-50' }
    default:
      return { label: props.estado, color: 'text-gray-500', bg: 'bg-gray-50' }
  }
})
</script>

<template>
  <div
    @click="emit('click', id)"
    class="relative flex items-stretch gap-0 bg-white rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md group overflow-hidden"
    :class="[
      isNext ? 'border-violet-200 ring-1 ring-violet-100' : 'border-gray-200',
      estado === 'cancelada' ? 'opacity-60' : ''
    ]"
  >
    <!-- Bloque de hora (destacado) -->
    <div
      class="flex-shrink-0 w-24 flex flex-col items-center justify-center py-4 px-3"
      :class="esHoy ? 'bg-violet-50' : 'bg-gray-50'"
    >
      <span
        class="text-2xl font-bold tracking-tight"
        :class="esHoy ? 'text-violet-700' : 'text-gray-800'"
      >
        {{ hora }}
      </span>
      <span
        v-if="esHoy"
        class="text-[10px] font-semibold uppercase tracking-wider text-violet-500 mt-0.5"
      >
        Hoy
      </span>
    </div>

    <!-- Contenido principal -->
    <div class="flex-1 flex items-center justify-between py-3 px-4 min-w-0">
      <div class="min-w-0">
        <!-- Nombre paciente (prominente) -->
        <p class="text-base font-semibold text-gray-900 truncate mb-1">
          {{ pacienteNombre }}
        </p>

        <!-- Modalidad + Estado -->
        <div class="flex items-center gap-2 text-sm">
          <!-- Modalidad con icono -->
          <span class="inline-flex items-center gap-1 text-gray-500">
            <!-- Icono ubicacion (presencial) -->
            <svg v-if="modalidadInfo.icon === 'location'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <!-- Icono video (online) -->
            <svg v-else-if="modalidadInfo.icon === 'video'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <!-- Icono telefono -->
            <svg v-else-if="modalidadInfo.icon === 'phone'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{{ modalidadInfo.label }}</span>
          </span>

          <span class="text-gray-300">·</span>

          <!-- Estado con badge sutil -->
          <span
            class="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded"
            :class="[estadoConfig.color, estadoConfig.bg]"
          >
            <svg v-if="estado === 'confirmada'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            {{ estadoConfig.label }}
          </span>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex items-center gap-2 ml-3">
        <!-- Botón confirmar (solo pendientes) -->
        <button
          v-if="estado === 'pendiente'"
          @click.stop="emit('confirmar', id)"
          class="px-3 py-1.5 text-xs font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          title="Confirmar cita"
        >
          Confirmar
        </button>

        <!-- Botón registrar pago (citas pasadas/realizadas) -->
        <button
          v-if="puedeRegistrarPago && estado !== 'cancelada'"
          @click.stop="emit('registrar-pago', id)"
          class="px-3 py-1.5 text-xs font-semibold border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
          title="Registrar pago"
        >
          Registrar pago
        </button>

        <!-- Botón ver detalles -->
        <button
          @click.stop="emit('click', id)"
          class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Ver detalles"
        >
          Ver detalles
        </button>
      </div>
    </div>

    <!-- Indicador de próxima sesión -->
    <div
      v-if="isNext"
      class="absolute top-0 left-0 w-1 h-full bg-violet-500"
    ></div>
  </div>
</template>
