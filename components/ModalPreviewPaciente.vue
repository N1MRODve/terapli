<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mostrar && paciente"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="$emit('cerrar')"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" @click="$emit('cerrar')"></div>

        <!-- Panel -->
        <div class="relative min-h-screen flex items-center justify-center p-4">
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div
              v-if="mostrar"
              class="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              @click.stop
            >
              <!-- Header con avatar -->
              <div class="relative px-6 pt-6 pb-4 bg-gradient-to-br from-purple-500 to-purple-600">
                <button
                  @click="$emit('cerrar')"
                  class="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon class="w-5 h-5" />
                </button>

                <div class="flex items-center gap-4">
                  <div
                    class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ring-4 ring-white/20"
                    :style="{ backgroundColor: avatarColor }"
                  >
                    {{ iniciales }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h2 class="text-xl font-semibold text-white truncate">
                      {{ paciente.nombre || 'Sin nombre' }}
                    </h2>
                    <div class="flex items-center gap-2 mt-1">
                      <span
                        class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                        :class="estadoBadgeClasses"
                      >
                        {{ estadoTexto }}
                      </span>
                      <span v-if="paciente.area_de_acompanamiento" class="text-sm text-white/70">
                        {{ paciente.area_de_acompanamiento }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contenido -->
              <div class="px-6 py-4 space-y-4">
                <!-- Próxima cita -->
                <div
                  class="p-3 rounded-lg"
                  :class="paciente.proxima_sesion ? 'bg-purple-50' : 'bg-amber-50'"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <CalendarDaysIcon class="w-4 h-4" :class="paciente.proxima_sesion ? 'text-purple-500' : 'text-amber-500'" />
                    <span class="text-xs font-medium text-gray-500">Próxima cita</span>
                  </div>
                  <p v-if="paciente.proxima_sesion" class="text-sm font-semibold text-purple-700">
                    {{ formatFechaCompleta(paciente.proxima_sesion) }}
                  </p>
                  <p v-else class="text-sm font-medium text-amber-700">Sin cita programada</p>
                </div>

                <!-- Grid de info -->
                <div class="grid grid-cols-2 gap-3">
                  <!-- Última sesión -->
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-xs text-gray-500 mb-0.5">Última sesión</p>
                    <div class="flex items-center gap-1.5">
                      <div class="w-2 h-2 rounded-full" :class="ultimaSesionIndicador"></div>
                      <span class="text-sm font-medium text-gray-900">{{ ultimaSesionTexto }}</span>
                    </div>
                  </div>

                  <!-- Total sesiones -->
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-xs text-gray-500 mb-0.5">Total sesiones</p>
                    <p class="text-sm font-medium text-gray-900">{{ paciente.total_sesiones || 0 }}</p>
                  </div>
                </div>

                <!-- Bono (si existe) -->
                <div v-if="paciente.bono_activo" class="p-3 rounded-lg" :class="bonoBackgroundClass">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-1.5">
                      <TicketIcon class="w-4 h-4" :class="bonoIconColor" />
                      <span class="text-sm font-medium" :class="bonoTextColor">{{ tipoBonoTexto }}</span>
                    </div>
                    <span class="text-xs" :class="fechaFinClasses">{{ fechaFinTexto }}</span>
                  </div>
                  <!-- Barra de progreso -->
                  <div class="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                    <div
                      class="absolute left-0 top-0 h-full rounded-full transition-all"
                      :class="bonoProgressBarClass"
                      :style="{ width: bonoProgressPercent + '%' }"
                    ></div>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-xs text-gray-500">{{ sesionesUsadas }} usadas</span>
                    <span class="text-xs font-semibold" :class="bonoTextColor">
                      {{ paciente.bono_activo.sesiones_restantes }} restantes
                    </span>
                  </div>
                </div>

                <!-- Contacto -->
                <div class="flex flex-col gap-2">
                  <div v-if="paciente.email" class="flex items-center gap-2 text-sm text-gray-600">
                    <EnvelopeIcon class="w-4 h-4 text-gray-400" />
                    <span class="truncate">{{ paciente.email }}</span>
                  </div>
                  <div v-if="paciente.telefono" class="flex items-center gap-2 text-sm text-gray-600">
                    <PhoneIcon class="w-4 h-4 text-gray-400" />
                    <span>{{ paciente.telefono }}</span>
                  </div>
                </div>
              </div>

              <!-- Footer con acciones -->
              <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                <button
                  @click="$emit('ver-ficha', paciente)"
                  class="flex-1 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Ver ficha completa
                </button>
                <button
                  @click="$emit('editar', paciente)"
                  class="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Editar
                </button>
                <button
                  @click="$emit('gestionar-bonos', paciente)"
                  class="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Bonos
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import {
  XMarkIcon,
  CalendarDaysIcon,
  TicketIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  mostrar: {
    type: Boolean,
    default: false
  },
  paciente: {
    type: Object,
    default: null
  }
})

defineEmits(['cerrar', 'ver-ficha', 'editar', 'gestionar-bonos'])

// Computed properties
const iniciales = computed(() => {
  if (!props.paciente?.nombre) return '??'
  const partes = props.paciente.nombre.trim().split(' ')
  return `${partes[0]?.charAt(0) || '?'}${partes[1]?.charAt(0) || ''}`.toUpperCase()
})

const avatarColor = computed(() => {
  if (!props.paciente) return '#9CA3AF'
  if (!props.paciente.activo) return '#9CA3AF'
  if (props.paciente.en_pausa) return '#F59E0B'
  const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#6366F1', '#F97316']
  const index = props.paciente.id.charCodeAt(0) % colors.length
  return colors[index]
})

const estadoTexto = computed(() => {
  if (!props.paciente?.activo) return 'Finalizado'
  if (props.paciente.en_pausa) return 'Pausa'
  return 'Activo'
})

const estadoBadgeClasses = computed(() => {
  if (!props.paciente?.activo) return 'bg-white/20 text-white'
  if (props.paciente.en_pausa) return 'bg-amber-400/20 text-amber-100'
  return 'bg-green-400/20 text-green-100'
})

const formatFechaCompleta = (fecha) => {
  if (!fecha) return null
  try {
    let fechaStr = fecha
    if (!fechaStr.includes('T')) fechaStr += 'T00:00:00'
    const d = new Date(fechaStr)
    if (isNaN(d.getTime())) return null
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return null
  }
}

const diasInactividad = computed(() => {
  if (!props.paciente?.ultima_sesion) return 999
  const fecha = new Date(props.paciente.ultima_sesion)
  const ahora = new Date()
  return Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24))
})

const ultimaSesionTexto = computed(() => {
  if (!props.paciente?.ultima_sesion) return 'Sin registro'
  const fecha = new Date(props.paciente.ultima_sesion)
  const diffDias = diasInactividad.value

  if (diffDias === 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`
  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
})

const ultimaSesionIndicador = computed(() => {
  if (!props.paciente?.ultima_sesion) return 'bg-gray-300'
  if (diasInactividad.value <= 7) return 'bg-green-500'
  if (diasInactividad.value <= 14) return 'bg-blue-500'
  if (diasInactividad.value <= 30) return 'bg-amber-500'
  return 'bg-red-500'
})

// Bono computed properties
const bono = computed(() => props.paciente?.bono_activo)

const tipoBonoTexto = computed(() => {
  if (!bono.value?.tipo) return ''
  const tipoMap = {
    'otro': 'A demanda',
    'quincenal': 'Quincenal',
    'semanal': 'Semanal',
    'mensual': 'Mensual'
  }
  return tipoMap[bono.value.tipo] || bono.value.tipo
})

const sesionesUsadas = computed(() => {
  if (!bono.value) return 0
  return bono.value.sesiones_totales - bono.value.sesiones_restantes
})

const bonoProgressPercent = computed(() => {
  if (!bono.value || bono.value.sesiones_totales === 0) return 0
  return Math.round((sesionesUsadas.value / bono.value.sesiones_totales) * 100)
})

const bonoProgressBarClass = computed(() => {
  if (!bono.value) return 'bg-gray-400'
  if (bono.value.sesiones_restantes <= 1) return 'bg-red-500'
  if (bono.value.sesiones_restantes === 2) return 'bg-amber-500'
  return 'bg-purple-500'
})

const bonoBackgroundClass = computed(() => {
  if (!bono.value) return 'bg-gray-50'
  if (bono.value.sesiones_restantes <= 1) return 'bg-red-50 border border-red-100'
  if (bono.value.sesiones_restantes === 2) return 'bg-amber-50 border border-amber-100'
  return 'bg-purple-50 border border-purple-100'
})

const bonoIconColor = computed(() => {
  if (!bono.value) return 'text-gray-400'
  if (bono.value.sesiones_restantes <= 1) return 'text-red-500'
  if (bono.value.sesiones_restantes === 2) return 'text-amber-500'
  return 'text-purple-500'
})

const bonoTextColor = computed(() => {
  if (!bono.value) return 'text-gray-600'
  if (bono.value.sesiones_restantes <= 1) return 'text-red-700'
  if (bono.value.sesiones_restantes === 2) return 'text-amber-700'
  return 'text-purple-700'
})

const fechaFinTexto = computed(() => {
  if (!bono.value?.fecha_fin) return '—'
  try {
    const fecha = new Date(bono.value.fecha_fin)
    const ahora = new Date()
    const diasRestantes = Math.floor((fecha - ahora) / (1000 * 60 * 60 * 24))

    if (diasRestantes < 0) return 'Vencido'
    if (diasRestantes === 0) return 'Vence hoy'
    if (diasRestantes === 1) return 'Vence mañana'
    if (diasRestantes <= 7) return `Vence en ${diasRestantes}d`
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  } catch {
    return '—'
  }
})

const fechaFinClasses = computed(() => {
  if (!bono.value?.fecha_fin) return 'text-gray-400'
  const fecha = new Date(bono.value.fecha_fin)
  const ahora = new Date()
  const diasRestantes = Math.floor((fecha - ahora) / (1000 * 60 * 60 * 24))
  if (diasRestantes < 0) return 'text-red-600 font-medium'
  if (diasRestantes <= 7) return 'text-amber-600 font-medium'
  return 'text-gray-500'
})
</script>
