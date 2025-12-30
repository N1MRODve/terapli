<template>
  <article
    class="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg hover:border-purple-200 transition-all duration-200 group relative cursor-pointer focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2"
    role="article"
    :aria-label="`Ficha de ${nombreMostrar}`"
    tabindex="0"
    @click="$emit('ver-ficha', paciente)"
    @keydown.enter="$emit('ver-ficha', paciente)"
  >
    <!-- Botones de acción flotantes (hover) -->
    <div
      class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 z-10"
      role="toolbar"
    >
      <!-- Acciones principales: siempre visibles en hover -->
      <button
        @click.stop="$emit('editar', paciente)"
        class="w-8 h-8 p-1.5 bg-white text-gray-600 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors shadow-sm border border-gray-200"
        title="Editar paciente"
      >
        <PencilIcon class="w-full h-full" />
      </button>
      <button
        @click.stop="$emit('gestionar-bonos', paciente)"
        class="w-8 h-8 p-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-sm"
        title="Gestionar bonos"
      >
        <TicketIcon class="w-full h-full" />
      </button>
      <!-- Eliminar: más pequeño, requiere confirmación en el componente padre -->
      <button
        @click.stop="mostrarConfirmarEliminar = true"
        class="w-6 h-6 p-1 bg-gray-50 text-gray-400 rounded hover:bg-red-50 hover:text-red-500 transition-colors ml-1"
        title="Eliminar"
      >
        <TrashIcon class="w-full h-full" />
      </button>
    </div>

    <!-- Mini confirmación de eliminación -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="mostrarConfirmarEliminar"
        class="absolute top-0 left-0 right-0 bottom-0 bg-white/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-20 p-4"
        @click.stop
      >
        <ExclamationTriangleIcon class="w-8 h-8 text-red-500 mb-2" />
        <p class="text-sm text-gray-700 text-center mb-3">¿Eliminar a {{ nombreMostrar }}?</p>
        <div class="flex gap-2">
          <button
            @click.stop="mostrarConfirmarEliminar = false"
            class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click.stop="confirmarEliminar"
            class="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </Transition>

    <!-- SECCIÓN PRINCIPAL: Avatar + Nombre + Estado -->
    <div class="flex items-start gap-3 mb-3">
      <!-- Avatar con borde de estado -->
      <div class="relative flex-shrink-0">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-offset-1"
          :class="avatarRingClass"
          :style="{ backgroundColor: avatarColor }"
        >
          {{ iniciales }}
        </div>
        <!-- Indicador de estado pequeño -->
        <span
          class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
          :class="estadoIndicadorClass"
        ></span>
      </div>

      <!-- Nombre y badge de estado -->
      <div class="flex-1 min-w-0 pt-0.5">
        <h3 class="font-semibold text-gray-900 text-base leading-tight truncate pr-16">
          {{ nombreMostrar }}
        </h3>
        <div class="flex items-center gap-2 mt-1">
          <span
            class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
            :class="estadoVinculoClasses"
          >
            {{ estadoVinculoTexto }}
          </span>
          <span v-if="paciente.area_de_acompanamiento" class="text-xs text-gray-400 truncate">
            {{ paciente.area_de_acompanamiento }}
          </span>
        </div>
      </div>
    </div>

    <!-- SECCIÓN CRÍTICA: Próxima cita (destacada) -->
    <div
      class="mb-3 p-2.5 rounded-lg"
      :class="proximaSesion ? 'bg-purple-50 border border-purple-100' : 'bg-amber-50 border border-amber-100'"
    >
      <div class="flex items-center gap-2">
        <ClockIcon class="w-4 h-4 flex-shrink-0" :class="proximaSesion ? 'text-purple-500' : 'text-amber-500'" />
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 mb-0.5">Próxima cita</p>
          <template v-if="proximaSesion">
            <button
              @click.stop="$emit('editar-cita', paciente.proxima_cita_id)"
              class="text-sm font-semibold text-purple-700 hover:text-purple-800 transition-colors truncate block w-full text-left"
            >
              {{ proximaSesion }}
            </button>
          </template>
          <p v-else class="text-sm font-medium text-amber-700">Sin cita programada</p>
        </div>
      </div>
    </div>

    <!-- SECCIÓN SECUNDARIA: Info compacta en grid -->
    <div class="grid grid-cols-2 gap-2 text-xs">
      <!-- Última sesión con indicador visual -->
      <div class="flex items-center gap-1.5">
        <div
          class="w-2 h-2 rounded-full flex-shrink-0"
          :class="ultimaSesionIndicadorClass"
        ></div>
        <CalendarIcon class="w-3.5 h-3.5 text-gray-400" />
        <span :class="ultimaSesionTextClass">
          {{ ultimaSesionTexto }}
        </span>
      </div>

      <!-- Total sesiones -->
      <div class="flex items-center gap-1.5 text-gray-500 justify-end">
        <span>{{ totalSesiones }} sesiones</span>
      </div>

      <!-- Bono con barra de progreso visual -->
      <div v-if="bonoActivo" class="col-span-2 mt-2 p-2 rounded-lg" :class="bonoBackgroundClass">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-1.5">
            <TicketIcon class="w-3.5 h-3.5 flex-shrink-0" :class="bonoIconColor" />
            <span class="font-medium text-xs" :class="sesionesColorClass">{{ tipoBonoTexto }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-xs" :class="fechaFinClases">
              {{ fechaFinTextoMejorado }}
            </span>
          </div>
        </div>
        <!-- Barra de progreso -->
        <div class="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
            :class="bonoProgressBarClass"
            :style="{ width: bonoProgressPercent + '%' }"
          ></div>
        </div>
        <div class="flex justify-between mt-1">
          <span class="text-[10px]" :class="sesionesColorClass">
            {{ sesionesUsadas }} usadas
          </span>
          <span class="text-[10px] font-semibold" :class="sesionesColorClass">
            {{ bonoActivo.sesiones_restantes }} restantes
          </span>
        </div>
      </div>
    </div>

    <!-- ALERTAS (solo si hay) -->
    <div v-if="tieneAlertaCritica" class="mt-2.5 pt-2.5 border-t border-gray-100">
      <div
        v-if="tieneAlertaBonoCritica"
        class="flex items-center gap-1.5 px-2 py-1.5 bg-red-50 rounded-md text-xs"
      >
        <ExclamationTriangleIcon class="w-3.5 h-3.5 text-red-500" />
        <span class="text-red-700 font-medium">Última sesión del bono</span>
      </div>

      <div
        v-else-if="tieneAlertaBonoAdvertencia"
        class="flex items-center gap-1.5 px-2 py-1.5 bg-amber-50 rounded-md text-xs"
      >
        <ExclamationCircleIcon class="w-3.5 h-3.5 text-amber-500" />
        <span class="text-amber-700 font-medium">{{ bonoActivo.sesiones_restantes }} sesiones restantes</span>
      </div>

      <div
        v-else-if="tieneAlertaInactividad"
        class="flex items-center gap-1.5 px-2 py-1.5 bg-red-50 rounded-md text-xs"
      >
        <BellAlertIcon class="w-3.5 h-3.5 text-red-500" />
        <span class="text-red-700 font-medium">{{ diasInactividad }} días sin sesión</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import {
  CalendarIcon,
  ClockIcon,
  TicketIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  BellAlertIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  paciente: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['editar', 'eliminar', 'ver-citas', 'gestionar-bonos', 'editar-cita', 'ver-ficha'])

// Estado para confirmación de eliminación
const mostrarConfirmarEliminar = ref(false)

const confirmarEliminar = () => {
  mostrarConfirmarEliminar.value = false
  emit('eliminar', props.paciente)
}

// Nombre para mostrar
const nombreMostrar = computed(() => {
  const nombreCompleto = props.paciente.nombre || 'Sin nombre'
  if (!nombreCompleto || nombreCompleto === 'Sin nombre') return 'Sin nombre'
  const partes = nombreCompleto.trim().split(' ')
  if (partes.length > 2) {
    return `${partes[0]} ${partes[1]} ${partes[partes.length - 1].charAt(0)}.`
  }
  return nombreCompleto
})

// Iniciales
const iniciales = computed(() => {
  const nombreCompleto = props.paciente.nombre || ''
  if (!nombreCompleto) return '??'
  const partes = nombreCompleto.trim().split(' ')
  return `${partes[0]?.charAt(0) || '?'}${partes[1]?.charAt(0) || ''}`.toUpperCase()
})

// Color de avatar basado en el estado del paciente
const avatarColor = computed(() => {
  // Colores según estado para identificación rápida
  if (!props.paciente.activo) return '#9CA3AF' // Gris - Finalizado
  if (props.paciente.en_pausa) return '#F59E0B' // Amber - Pausa

  // Para pacientes activos, variar por ID para diferenciación
  const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#6366F1', '#F97316']
  const index = props.paciente.id.charCodeAt(0) % colors.length
  return colors[index]
})

// Clase del anillo del avatar según estado
const avatarRingClass = computed(() => {
  if (!props.paciente.activo) return 'ring-gray-300'
  if (props.paciente.en_pausa) return 'ring-amber-300'
  return 'ring-purple-200'
})

// Indicador de estado (punto en avatar)
const estadoIndicadorClass = computed(() => {
  if (!props.paciente.activo) return 'bg-gray-400'
  if (props.paciente.en_pausa) return 'bg-amber-500'
  return 'bg-green-500'
})

// Texto y clases del estado
const estadoVinculoTexto = computed(() => {
  if (!props.paciente.activo) return 'Finalizado'
  if (props.paciente.en_pausa) return 'Pausa'
  return 'Activo'
})

const estadoVinculoClasses = computed(() => {
  if (!props.paciente.activo) return 'bg-gray-100 text-gray-600'
  if (props.paciente.en_pausa) return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
})

// Última sesión
const ultimaSesionTexto = computed(() => {
  if (!props.paciente.ultima_sesion) return 'Sin registro'
  const fecha = new Date(props.paciente.ultima_sesion)
  const ahora = new Date()
  const diffDias = Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24))

  if (diffDias === 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} sem`
  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
})

// Indicador visual de última sesión (punto de color)
const ultimaSesionIndicadorClass = computed(() => {
  if (!props.paciente.ultima_sesion) return 'bg-gray-300'
  const diffDias = diasInactividad.value
  if (diffDias <= 7) return 'bg-green-500' // Reciente
  if (diffDias <= 14) return 'bg-blue-500' // Normal
  if (diffDias <= 30) return 'bg-amber-500' // Atención
  return 'bg-red-500' // Crítico
})

const ultimaSesionTextClass = computed(() => {
  if (!props.paciente.ultima_sesion) return 'text-gray-400'
  const diffDias = diasInactividad.value
  if (diffDias <= 14) return 'text-gray-600'
  if (diffDias <= 30) return 'text-amber-600'
  return 'text-red-600 font-medium'
})

// Próxima sesión
const proximaSesion = computed(() => {
  if (!props.paciente.proxima_sesion) return null
  try {
    let fechaStr = props.paciente.proxima_sesion
    if (!fechaStr.includes('T')) fechaStr += 'T00:00:00'
    const fecha = new Date(fechaStr)
    if (isNaN(fecha.getTime())) return null
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return null
  }
})

// Total de sesiones
const totalSesiones = computed(() => props.paciente.total_sesiones || 0)

// Días de inactividad
const diasInactividad = computed(() => {
  if (!props.paciente.ultima_sesion) return 0
  const fecha = new Date(props.paciente.ultima_sesion)
  const ahora = new Date()
  return Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24))
})

// Alerta de inactividad
const tieneAlertaInactividad = computed(() => {
  if (!props.paciente.activo || props.paciente.en_pausa) return false
  return diasInactividad.value > 30
})

// Bono activo
const bonoActivo = computed(() => props.paciente.bono_activo || null)

// Tipo de bono
const tipoBonoTexto = computed(() => {
  if (!bonoActivo.value?.tipo) return ''
  const tipoMap = {
    'otro': 'Demanda',
    'quincenal': 'Quinc.',
    'semanal': 'Semanal',
    'mensual': 'Mensual'
  }
  return tipoMap[bonoActivo.value.tipo] || bonoActivo.value.tipo
})

const sesionesTotales = computed(() => bonoActivo.value?.sesiones_totales || 0)

const sesionesUsadas = computed(() => {
  if (!bonoActivo.value) return 0
  return sesionesTotales.value - bonoActivo.value.sesiones_restantes
})

const bonoProgressPercent = computed(() => {
  if (!bonoActivo.value || sesionesTotales.value === 0) return 0
  return Math.round((sesionesUsadas.value / sesionesTotales.value) * 100)
})

const bonoProgressBarClass = computed(() => {
  if (!bonoActivo.value) return 'bg-gray-400'
  const restantes = bonoActivo.value.sesiones_restantes
  if (restantes === 0) return 'bg-red-500'
  if (restantes === 1) return 'bg-red-500'
  if (restantes === 2) return 'bg-amber-500'
  return 'bg-purple-500'
})

const bonoBackgroundClass = computed(() => {
  if (!bonoActivo.value) return 'bg-gray-50'
  const restantes = bonoActivo.value.sesiones_restantes
  if (restantes === 0) return 'bg-red-50 border border-red-100'
  if (restantes === 1) return 'bg-red-50 border border-red-100'
  if (restantes === 2) return 'bg-amber-50 border border-amber-100'
  return 'bg-purple-50 border border-purple-100'
})

const sesionesColorClass = computed(() => {
  if (!bonoActivo.value) return 'text-gray-600'
  const restantes = bonoActivo.value.sesiones_restantes
  if (restantes === 0) return 'text-red-600'
  if (restantes <= 2) return 'text-amber-600'
  return 'text-gray-700'
})

const bonoIconColor = computed(() => {
  if (!bonoActivo.value) return 'text-gray-400'
  const restantes = bonoActivo.value.sesiones_restantes
  if (restantes <= 1) return 'text-red-500'
  if (restantes === 2) return 'text-amber-500'
  return 'text-purple-500'
})

// Fecha fin
const fechaFinCorta = computed(() => {
  if (!bonoActivo.value?.fecha_fin) return '—'
  try {
    const fecha = new Date(bonoActivo.value.fecha_fin)
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  } catch {
    return '—'
  }
})

// Texto mejorado de fecha fin con indicador de urgencia
const fechaFinTextoMejorado = computed(() => {
  if (!bonoActivo.value?.fecha_fin) return '—'
  try {
    const fecha = new Date(bonoActivo.value.fecha_fin)
    const ahora = new Date()
    const diasRestantes = Math.floor((fecha - ahora) / (1000 * 60 * 60 * 24))

    if (diasRestantes < 0) return 'Vencido'
    if (diasRestantes === 0) return 'Vence hoy'
    if (diasRestantes === 1) return 'Vence mañana'
    if (diasRestantes <= 7) return `Vence en ${diasRestantes}d`
    return `Hasta ${fechaFinCorta.value}`
  } catch {
    return '—'
  }
})

const fechaFinClases = computed(() => {
  if (!bonoActivo.value?.fecha_fin) return 'text-gray-400'
  const fecha = new Date(bonoActivo.value.fecha_fin)
  const ahora = new Date()
  const diasRestantes = Math.floor((fecha - ahora) / (1000 * 60 * 60 * 24))
  if (diasRestantes < 0) return 'text-red-600 font-medium'
  if (diasRestantes <= 7) return 'text-amber-600 font-medium'
  return 'text-gray-500'
})

// Alertas de bono
const tieneAlertaBonoCritica = computed(() => {
  if (!bonoActivo.value) return false
  return bonoActivo.value.sesiones_restantes === 1
})

const tieneAlertaBonoAdvertencia = computed(() => {
  if (!bonoActivo.value) return false
  return bonoActivo.value.sesiones_restantes === 2
})

const tieneAlertaCritica = computed(() => {
  return tieneAlertaBonoCritica.value ||
         tieneAlertaBonoAdvertencia.value ||
         tieneAlertaInactividad.value
})
</script>
