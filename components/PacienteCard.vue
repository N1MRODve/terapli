<template>
  <article
    class="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 group relative cursor-pointer focus-within:ring-2 focus-within:ring-purple-600 focus-within:ring-offset-2"
    role="article"
    :aria-label="`Ficha de ${nombreMostrar}`"
    tabindex="0"
  >
    <!-- Botones de acción (aparecen al hover) -->
    <div
      class="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 z-10"
      role="toolbar"
      aria-label="Acciones del paciente"
    >
      <button
        @click.stop="$emit('gestionar-bonos', paciente)"
        class="min-h-[36px] min-w-[36px] p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-300 focus:outline-none"
        :aria-label="`Gestionar bonos de ${nombreMostrar}`"
      >
        <TicketIcon class="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        @click.stop="$emit('editar', paciente)"
        class="min-h-[36px] min-w-[36px] p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-300 focus:outline-none"
        :aria-label="`Editar información de ${nombreMostrar}`"
      >
        <PencilIcon class="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        @click.stop="$emit('eliminar', paciente)"
        class="min-h-[36px] min-w-[36px] p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-300 focus:outline-none"
        :aria-label="`Eliminar a ${nombreMostrar}`"
      >
        <TrashIcon class="w-4 h-4" aria-hidden="true" />
      </button>
    </div>

    <!-- Header: Avatar + Nombre + Estado -->
    <div class="flex items-center gap-3 mb-4">
      <!-- Avatar compacto -->
      <div
        class="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0"
        :style="{ backgroundColor: avatarColor }"
        :aria-label="`Avatar de ${nombreMostrar}`"
      >
        {{ iniciales }}
      </div>

      <!-- Nombre y badge de estado -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="font-medium text-base text-gray-900 truncate">
            {{ nombreMostrar }}
          </h3>
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0"
            :class="estadoVinculoClasses"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="estadoVinculoPuntoClass"></span>
            {{ estadoVinculoTexto }}
          </span>
        </div>
      </div>
    </div>

    <!-- Info compacta con iconos -->
    <div class="space-y-2 text-sm text-gray-600">
      <!-- Última sesión -->
      <div class="flex items-center gap-2">
        <CalendarIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span :class="{ 'text-gray-400': !paciente.ultima_sesion }">
          {{ ultimaSesionTexto }}
        </span>
      </div>

      <!-- Próxima cita -->
      <div class="flex items-center gap-2">
        <ClockIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
        <template v-if="proximaSesion">
          <button
            @click.stop="$emit('editar-cita', paciente.proxima_cita_id)"
            class="text-purple-600 hover:text-purple-700 hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-purple-300 rounded px-1 -mx-1"
            :aria-label="`Editar cita: ${proximaSesion}`"
          >
            {{ proximaSesion }}
          </button>
        </template>
        <span v-else class="text-gray-400">Sin cita programada</span>
      </div>

      <!-- Bono compacto (1 línea) -->
      <div v-if="bonoActivo" class="flex items-center gap-2">
        <TicketIcon class="w-4 h-4 flex-shrink-0" :class="bonoIconColor" />
        <span class="flex items-center gap-1.5 flex-wrap">
          <span class="font-medium" :class="sesionesColorClass">
            {{ tipoBonoTexto }} {{ sesionesUsadas }}/{{ sesionesTotales }}
          </span>
          <span class="text-gray-400">·</span>
          <span :class="fechaFinClases" class="text-xs">
            Vence {{ fechaFinCorta }}
          </span>
          <span
            v-if="bonoActivo.estado !== 'activo'"
            class="px-1.5 py-0.5 text-xs font-medium rounded"
            :class="estadoBonoClasses"
          >
            {{ estadoBonoTexto }}
          </span>
        </span>
      </div>
    </div>

    <!-- Alertas compactas (solo las críticas) -->
    <div v-if="tieneAlertaCritica" class="mt-3">
      <!-- Alerta de bono crítica (1 sesión) -->
      <div
        v-if="tieneAlertaBonoCritica"
        class="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs"
      >
        <ExclamationTriangleIcon class="w-4 h-4 text-red-500 flex-shrink-0" />
        <span class="text-red-700 font-medium">
          Última sesión del bono
        </span>
      </div>

      <!-- Alerta de bono advertencia (2 sesiones) -->
      <div
        v-else-if="tieneAlertaBonoAdvertencia"
        class="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-xs"
      >
        <ExclamationCircleIcon class="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span class="text-amber-700 font-medium">
          Quedan {{ bonoActivo.sesiones_restantes }} sesiones
        </span>
      </div>

      <!-- Alerta de inactividad -->
      <div
        v-else-if="tieneAlertaInactividad"
        class="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs"
      >
        <BellAlertIcon class="w-4 h-4 text-red-500 flex-shrink-0" />
        <span class="text-red-700 font-medium">
          {{ diasInactividad }} días sin sesión
        </span>
      </div>
    </div>

    <!-- Sesiones completadas (indicador sutil) -->
    <div class="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
      <span>{{ totalSesiones }} sesiones completadas</span>
      <span v-if="evolucionPorcentaje > 0" class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full" :class="evolucionDotColor"></span>
        {{ evolucionPorcentaje }}%
      </span>
    </div>
  </article>
</template>

<script setup>
import {
  CalendarIcon,
  ClockIcon,
  TicketIcon,
  MapPinIcon,
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

defineEmits(['editar', 'eliminar', 'ver-citas', 'gestionar-bonos', 'editar-cita'])

// Computar nombre para mostrar
const nombreMostrar = computed(() => {
  const nombreCompleto = props.paciente.nombre || 'Sin nombre'
  if (!nombreCompleto || nombreCompleto === 'Sin nombre') return 'Sin nombre'

  const partes = nombreCompleto.trim().split(' ')
  if (partes.length > 2) {
    const nombre = partes[0]
    const apellido1 = partes[1]
    const apellido2Inicial = partes[partes.length - 1].charAt(0)
    return `${nombre} ${apellido1} ${apellido2Inicial}.`
  }

  return nombreCompleto
})

// Computar iniciales para avatar
const iniciales = computed(() => {
  const nombreCompleto = props.paciente.nombre || ''
  if (!nombreCompleto) return '??'

  const partes = nombreCompleto.trim().split(' ')
  const nombreInicial = partes[0]?.charAt(0).toUpperCase() || '?'
  const apellidoInicial = partes[1]?.charAt(0).toUpperCase() || ''
  return `${nombreInicial}${apellidoInicial}`
})

// Color de avatar basado en el ID
const avatarColor = computed(() => {
  const colors = ['#5550F2', '#C89B8A', '#B7C6B0', '#A8C5B5', '#D4A5A5', '#C4B5A0']
  const index = props.paciente.id.charCodeAt(0) % colors.length
  return colors[index]
})

// Estado del vínculo terapéutico
const estadoVinculoTexto = computed(() => {
  if (!props.paciente.activo) return 'Finalizado'
  if (props.paciente.en_pausa) return 'Pausa'
  return 'Activo'
})

const estadoVinculoClasses = computed(() => {
  if (!props.paciente.activo) return 'bg-gray-100 text-gray-600'
  if (props.paciente.en_pausa) return 'bg-yellow-50 text-yellow-700'
  return 'bg-green-50 text-green-700'
})

const estadoVinculoPuntoClass = computed(() => {
  if (!props.paciente.activo) return 'bg-gray-400'
  if (props.paciente.en_pausa) return 'bg-yellow-500'
  return 'bg-green-500'
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

// Evolución
const evolucionPorcentaje = computed(() => props.paciente.evolucion_porcentaje || 0)

const evolucionDotColor = computed(() => {
  const valor = evolucionPorcentaje.value
  if (valor >= 70) return 'bg-green-500'
  if (valor >= 50) return 'bg-yellow-500'
  return 'bg-orange-500'
})

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
    'mensual': 'Mensual',
    'personalizado': 'Pers.'
  }
  return tipoMap[bonoActivo.value.tipo] || bonoActivo.value.tipo
})

// Estado del bono
const estadoBonoTexto = computed(() => {
  if (!bonoActivo.value?.estado) return ''
  const estadoMap = {
    'activo': 'Activo',
    'pendiente': 'Pend.',
    'vencido': 'Vencido',
    'completado': 'Complet.'
  }
  return estadoMap[bonoActivo.value.estado] || bonoActivo.value.estado
})

const estadoBonoClasses = computed(() => {
  if (!bonoActivo.value?.estado) return 'bg-gray-100 text-gray-600'
  const classMap = {
    'activo': 'bg-green-100 text-green-700',
    'pendiente': 'bg-yellow-100 text-yellow-700',
    'vencido': 'bg-red-100 text-red-700',
    'completado': 'bg-gray-100 text-gray-600'
  }
  return classMap[bonoActivo.value.estado] || 'bg-gray-100 text-gray-600'
})

// Fecha fin compacta
const fechaFinCorta = computed(() => {
  if (!bonoActivo.value?.fecha_fin) return '—'
  try {
    const fecha = new Date(bonoActivo.value.fecha_fin)
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
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
  if (diasRestantes <= 7) return 'text-orange-600'
  return 'text-gray-500'
})

// Sesiones
const sesionesUsadas = computed(() => {
  if (!bonoActivo.value) return 0
  return bonoActivo.value.sesiones_totales - bonoActivo.value.sesiones_restantes
})

const sesionesTotales = computed(() => bonoActivo.value?.sesiones_totales || 0)

const sesionesColorClass = computed(() => {
  if (!bonoActivo.value) return 'text-gray-600'
  const restantes = bonoActivo.value.sesiones_restantes
  if (restantes === 0) return 'text-red-600'
  if (restantes <= 2) return 'text-orange-600'
  return 'text-gray-700'
})

const bonoIconColor = computed(() => {
  if (!bonoActivo.value) return 'text-gray-400'
  const restantes = bonoActivo.value.sesiones_restantes
  if (restantes <= 1) return 'text-red-500'
  if (restantes === 2) return 'text-amber-500'
  return 'text-purple-500'
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

// Tiene alguna alerta crítica
const tieneAlertaCritica = computed(() => {
  return tieneAlertaBonoCritica.value ||
         tieneAlertaBonoAdvertencia.value ||
         tieneAlertaInactividad.value
})
</script>

<style scoped>
/* Estilos para PacienteCard */
</style>
