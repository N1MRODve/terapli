<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: AgendaCalendario
 * =============================================================================
 * Nueva vista de agenda basada en el diseño de referencia.
 * Soporta vistas: Día, 5 Días, Semana, Mes
 * Incluye: navegación, búsqueda, filtros de estado, grid horario
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAgendaEnhanced } from '~/composables/useAgendaEnhanced'

// Props
interface Props {
  modoCoordinadora?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modoCoordinadora: false
})

// Emits
const emit = defineEmits<{
  (e: 'nueva-cita', payload: { fecha: string; hora: string }): void
  (e: 'ver-cita', citaId: string): void
}>()

// Composable
const {
  citas,
  loading,
  loadAllAppointments,
  loadTerapeutaAppointments,
  changeAppointmentStatus,
  moveAppointment,
  refreshAppointments
} = useAgendaEnhanced()

const supabase = useSupabaseClient()

// Estado local
const vistaActiva = ref<'dia' | '5dias' | 'semana' | 'mes'>('semana')
const fechaSeleccionada = ref(new Date())
const busqueda = ref('')
const mostrarFiltros = ref(false)
const estadosFiltro = ref<string[]>(['pendiente', 'confirmada', 'realizada', 'cancelada'])

// Terapeutas (solo coordinadora)
const terapeutas = ref<Array<{ id: string; nombre: string }>>([])
const terapeutaSeleccionado = ref<string | null>(null)

// Modal nueva cita
const mostrarModalNuevaCita = ref(false)
const fechaPreseleccionada = ref<string | null>(null)
const horaPreseleccionada = ref<string | null>(null)

// Modal detalles
const mostrarModalDetalles = ref(false)
const citaIdSeleccionada = ref<string | null>(null)

// Estado para acciones de citas
const citaConfirmandoId = ref<string | null>(null)
const citaCancelandoId = ref<string | null>(null)
const citaReprogramandoId = ref<string | null>(null)

// Modal cancelar
const mostrarModalCancelar = ref(false)
const citaParaCancelar = ref<any>(null)
const motivoCancelacion = ref('')

// Modal reprogramar
const mostrarModalReprogramar = ref(false)
const citaParaReprogramar = ref<any>(null)
const reprogramarNuevaFecha = ref('')
const reprogramarNuevaHoraInicio = ref('')
const reprogramarNuevaHoraFin = ref('')

// Toast notifications
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('info')
const mostrarToast = ref(false)

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  mostrarToast.value = true
  setTimeout(() => {
    mostrarToast.value = false
  }, 4000)
}

// Horas del día (cada 30 min desde 09:00 hasta 21:00)
const horasDelDia = computed(() => {
  const horas: string[] = []
  for (let h = 9; h <= 21; h++) {
    horas.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 21) {
      horas.push(`${String(h).padStart(2, '0')}:30`)
    }
  }
  return horas
})

// Días según vista activa
const diasVisibles = computed(() => {
  const inicio = new Date(fechaSeleccionada.value)
  const dias: Array<{ fecha: string; diaSemana: string; numeroDia: number; mes: string; esHoy: boolean }> = []
  const hoy = new Date().toISOString().split('T')[0]

  if (vistaActiva.value === 'dia') {
    const fecha = inicio.toISOString().split('T')[0]
    dias.push({
      fecha,
      diaSemana: inicio.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase(),
      numeroDia: inicio.getDate(),
      mes: inicio.toLocaleDateString('es-ES', { month: 'short' }),
      esHoy: fecha === hoy
    })
  } else if (vistaActiva.value === '5dias') {
    // Empezar desde el día actual
    for (let i = 0; i < 5; i++) {
      const fecha = new Date(inicio)
      fecha.setDate(inicio.getDate() + i)
      const fechaStr = fecha.toISOString().split('T')[0]
      dias.push({
        fecha: fechaStr,
        diaSemana: fecha.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase(),
        numeroDia: fecha.getDate(),
        mes: fecha.toLocaleDateString('es-ES', { month: 'short' }),
        esHoy: fechaStr === hoy
      })
    }
  } else if (vistaActiva.value === 'semana') {
    // Empezar desde el sábado de la semana
    const diaSemana = inicio.getDay()
    const diff = diaSemana === 0 ? -1 : 6 - diaSemana // Sábado como inicio
    const sabado = new Date(inicio)
    sabado.setDate(inicio.getDate() - (diaSemana === 6 ? 0 : diaSemana + 1))

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(sabado)
      fecha.setDate(sabado.getDate() + i)
      const fechaStr = fecha.toISOString().split('T')[0]
      dias.push({
        fecha: fechaStr,
        diaSemana: fecha.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase(),
        numeroDia: fecha.getDate(),
        mes: fecha.toLocaleDateString('es-ES', { month: 'short' }),
        esHoy: fechaStr === hoy
      })
    }
  }

  return dias
})

// Título del periodo
const tituloPeriodo = computed(() => {
  const fecha = fechaSeleccionada.value
  const mes = fecha.toLocaleDateString('es-ES', { month: 'long' })
  const año = fecha.getFullYear()

  // Calcular número de semana
  const inicioAño = new Date(fecha.getFullYear(), 0, 1)
  const dias = Math.floor((fecha.getTime() - inicioAño.getTime()) / (24 * 60 * 60 * 1000))
  const semana = Math.ceil((dias + inicioAño.getDay() + 1) / 7)

  return `${mes.charAt(0).toUpperCase() + mes.slice(1)} De ${año} — Semana ${semana}`
})

// Filtrar citas
const citasFiltradas = computed(() => {
  let resultado = citas.value

  // Filtrar por terapeuta (solo coordinadora)
  if (props.modoCoordinadora && terapeutaSeleccionado.value) {
    resultado = resultado.filter(c => c.terapeuta_id === terapeutaSeleccionado.value)
  }

  // Filtrar por estado
  if (estadosFiltro.value.length > 0 && estadosFiltro.value.length < 4) {
    resultado = resultado.filter(c => estadosFiltro.value.includes(c.estado))
  }

  // Filtrar por búsqueda
  if (busqueda.value.trim()) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(c => {
      const nombre = (c.paciente_nombre || c.paciente?.nombre_completo || '').toLowerCase()
      const terapeuta = (c.terapeuta_nombre || c.terapeuta?.nombre_completo || '').toLowerCase()
      const notas = (c.observaciones || '').toLowerCase()
      return nombre.includes(termino) || terapeuta.includes(termino) || notas.includes(termino)
    })
  }

  return resultado
})

// Contadores por estado
const contadores = computed(() => ({
  pendiente: citas.value.filter(c => c.estado === 'pendiente').length,
  confirmada: citas.value.filter(c => c.estado === 'confirmada').length,
  realizada: citas.value.filter(c => c.estado === 'realizada' || c.estado === 'completada').length,
  cancelada: citas.value.filter(c => c.estado === 'cancelada').length
}))

// Obtener citas por día y hora
const citasPorDiaHora = (fecha: string, hora: string) => {
  return citasFiltradas.value.filter(c => {
    if (c.fecha_cita !== fecha) return false
    const horaInicio = c.hora_inicio?.substring(0, 5)
    return horaInicio === hora
  })
}

// Calcular posición de la hora actual
const horaActual = ref(new Date())
const posicionHoraActual = computed(() => {
  const ahora = horaActual.value
  const horas = ahora.getHours()
  const minutos = ahora.getMinutes()

  // Solo mostrar si está dentro del rango visible (9:00 - 21:00)
  if (horas < 9 || horas >= 21) return null

  // Calcular posición relativa (cada fila de 30min = 44px aprox)
  const minutosDesde9 = (horas - 9) * 60 + minutos
  const posicion = (minutosDesde9 / 30) * 44 // 44px por slot de 30min

  return posicion
})

// Actualizar hora actual cada minuto
let intervaloHora: ReturnType<typeof setInterval> | null = null

// Navegación
const navegarFecha = (direccion: number) => {
  const nueva = new Date(fechaSeleccionada.value)
  if (vistaActiva.value === 'dia') {
    nueva.setDate(nueva.getDate() + direccion)
  } else if (vistaActiva.value === '5dias') {
    nueva.setDate(nueva.getDate() + (direccion * 5))
  } else {
    nueva.setDate(nueva.getDate() + (direccion * 7))
  }
  fechaSeleccionada.value = nueva
}

const irHoy = () => {
  fechaSeleccionada.value = new Date()
}

// Toggle filtro de estado
const toggleEstado = (estado: string) => {
  const index = estadosFiltro.value.indexOf(estado)
  if (index > -1) {
    estadosFiltro.value.splice(index, 1)
  } else {
    estadosFiltro.value.push(estado)
  }
}

// Obtener color según estado
const getColorEstado = (estado: string) => {
  const colores: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    pendiente: { bg: 'bg-amber-50', border: 'border-l-amber-400', text: 'text-amber-700', dot: 'bg-amber-400' },
    confirmada: { bg: 'bg-emerald-50', border: 'border-l-emerald-400', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    realizada: { bg: 'bg-blue-50', border: 'border-l-blue-400', text: 'text-blue-700', dot: 'bg-blue-400' },
    completada: { bg: 'bg-blue-50', border: 'border-l-blue-400', text: 'text-blue-700', dot: 'bg-blue-400' },
    cancelada: { bg: 'bg-red-50', border: 'border-l-red-400', text: 'text-red-700', dot: 'bg-red-400' }
  }
  return colores[estado] || colores.pendiente
}

// Click en slot vacío
const handleSlotClick = (fecha: string, hora: string) => {
  fechaPreseleccionada.value = fecha
  horaPreseleccionada.value = hora
  mostrarModalNuevaCita.value = true
}

// Click en cita
const handleCitaClick = (citaId: string) => {
  citaIdSeleccionada.value = citaId
  mostrarModalDetalles.value = true
}

// Cargar terapeutas (coordinadora)
const cargarTerapeutas = async () => {
  if (!props.modoCoordinadora) return

  const { data } = await supabase
    .from('terapeutas')
    .select('id, nombre_completo')
    .eq('activo', true)
    .order('nombre_completo')

  terapeutas.value = (data || []).map(t => ({ id: t.id, nombre: t.nombre_completo }))
}

// Formatear hora
const formatearHora = (hora: string) => hora?.substring(0, 5) || ''

// Formatear fecha legible
const formatearFecha = (fecha: string) => {
  if (!fecha) return ''
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// Horas disponibles para reprogramar
const horasDisponibles = computed(() => {
  const horas: string[] = []
  for (let h = 9; h <= 21; h++) {
    horas.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 21) {
      horas.push(`${String(h).padStart(2, '0')}:30`)
    }
  }
  return horas
})

// Horas fin disponibles (después de hora inicio)
const horasFinDisponibles = computed(() => {
  if (!reprogramarNuevaHoraInicio.value) return horasDisponibles.value
  const indexInicio = horasDisponibles.value.indexOf(reprogramarNuevaHoraInicio.value)
  if (indexInicio === -1) return horasDisponibles.value
  return [...horasDisponibles.value.slice(indexInicio + 1), '22:00']
})

// ============================================================================
// ACCIONES DE CITAS
// ============================================================================

/**
 * Confirmar cita rápidamente
 */
const handleConfirmarCita = async (citaId: string, event: Event) => {
  event.stopPropagation()
  if (citaConfirmandoId.value) return

  citaConfirmandoId.value = citaId

  try {
    const result = await changeAppointmentStatus(citaId, 'confirmada')
    if (result.success) {
      showToast('Cita confirmada correctamente', 'success')
    } else {
      showToast(result.error || 'Error al confirmar la cita', 'error')
    }
  } catch (err: any) {
    showToast(err.message || 'Error al confirmar la cita', 'error')
  } finally {
    citaConfirmandoId.value = null
  }
}

/**
 * Abrir modal de cancelación
 */
const handleAbrirModalCancelar = (citaId: string, event: Event) => {
  event.stopPropagation()
  const cita = citas.value.find(c => c.id === citaId)
  if (!cita) {
    showToast('Cita no encontrada', 'error')
    return
  }

  citaParaCancelar.value = cita
  motivoCancelacion.value = ''
  mostrarModalCancelar.value = true
}

/**
 * Ejecutar cancelación de cita
 */
const ejecutarCancelacion = async () => {
  if (!citaParaCancelar.value || citaCancelandoId.value) return

  citaCancelandoId.value = citaParaCancelar.value.id

  try {
    const result = await changeAppointmentStatus(citaParaCancelar.value.id, 'cancelada')
    if (result.success) {
      showToast('Cita cancelada correctamente', 'success')
      cerrarModalCancelar()
    } else {
      showToast(result.error || 'Error al cancelar la cita', 'error')
    }
  } catch (err: any) {
    showToast(err.message || 'Error al cancelar la cita', 'error')
  } finally {
    citaCancelandoId.value = null
  }
}

/**
 * Cerrar modal de cancelar
 */
const cerrarModalCancelar = () => {
  mostrarModalCancelar.value = false
  citaParaCancelar.value = null
  motivoCancelacion.value = ''
}

/**
 * Abrir modal de reprogramación
 */
const handleAbrirModalReprogramar = (citaId: string, event: Event) => {
  event.stopPropagation()
  const cita = citas.value.find(c => c.id === citaId)
  if (!cita) {
    showToast('Cita no encontrada', 'error')
    return
  }

  citaParaReprogramar.value = cita
  reprogramarNuevaFecha.value = cita.fecha_cita
  reprogramarNuevaHoraInicio.value = formatearHora(cita.hora_inicio)
  reprogramarNuevaHoraFin.value = formatearHora(cita.hora_fin)
  mostrarModalReprogramar.value = true
}

/**
 * Ejecutar reprogramación de cita
 */
const ejecutarReprogramacion = async () => {
  if (!citaParaReprogramar.value || citaReprogramandoId.value) return

  if (!reprogramarNuevaFecha.value || !reprogramarNuevaHoraInicio.value || !reprogramarNuevaHoraFin.value) {
    showToast('Por favor completa todos los campos', 'error')
    return
  }

  citaReprogramandoId.value = citaParaReprogramar.value.id

  try {
    const result = await moveAppointment(
      citaParaReprogramar.value.id,
      reprogramarNuevaFecha.value,
      reprogramarNuevaHoraInicio.value,
      reprogramarNuevaHoraFin.value
    )

    if (result.success) {
      const fechaFormateada = new Date(reprogramarNuevaFecha.value + 'T00:00:00').toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      })
      showToast(`Cita reprogramada a ${fechaFormateada} ${reprogramarNuevaHoraInicio.value}`, 'success')
      cerrarModalReprogramar()
    } else {
      showToast(result.error || 'Error al reprogramar la cita', 'error')
    }
  } catch (err: any) {
    showToast(err.message || 'Error al reprogramar la cita', 'error')
  } finally {
    citaReprogramandoId.value = null
  }
}

/**
 * Cerrar modal de reprogramar
 */
const cerrarModalReprogramar = () => {
  mostrarModalReprogramar.value = false
  citaParaReprogramar.value = null
  reprogramarNuevaFecha.value = ''
  reprogramarNuevaHoraInicio.value = ''
  reprogramarNuevaHoraFin.value = ''
}

// Lifecycle
onMounted(async () => {
  if (props.modoCoordinadora) {
    await loadAllAppointments()
    await cargarTerapeutas()
  } else {
    await loadTerapeutaAppointments()
  }

  // Actualizar hora cada minuto
  intervaloHora = setInterval(() => {
    horaActual.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (intervaloHora) clearInterval(intervaloHora)
})
</script>

<template>
  <div class="agenda-calendario min-h-screen bg-gray-50/50">
    <!-- ================================================================= -->
    <!-- HEADER: Navegación + Título + Selector Vista + Nueva Cita -->
    <!-- ================================================================= -->
    <div class="bg-white border-b border-gray-100 px-6 py-4">
      <div class="flex items-center justify-between gap-4">
        <!-- Navegación izquierda -->
        <div class="flex items-center gap-3">
          <button
            @click="navegarFecha(-1)"
            class="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            @click="irHoy"
            class="px-4 py-2 rounded-full border-2 border-violet-500 text-violet-600 font-semibold text-sm hover:bg-violet-50 transition-all"
          >
            Hoy
          </button>

          <button
            @click="navegarFecha(1)"
            class="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Título del periodo -->
        <h1 class="text-xl font-bold text-gray-800 tracking-tight">
          {{ tituloPeriodo }}
        </h1>

        <!-- Selector de vista + Acciones -->
        <div class="flex items-center gap-4">
          <!-- Selector de vista -->
          <div class="flex items-center bg-gray-100 rounded-full p-1">
            <button
              v-for="vista in [
                { key: 'dia', label: 'Día' },
                { key: '5dias', label: '5 Días' },
                { key: 'semana', label: 'Semana' },
                { key: 'mes', label: 'Mes' }
              ]"
              :key="vista.key"
              @click="vistaActiva = vista.key as any"
              class="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              :class="vistaActiva === vista.key
                ? 'bg-violet-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'"
            >
              {{ vista.label }}
            </button>
          </div>

          <!-- Botón modo oscuro (placeholder) -->
          <button class="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Botón Nueva Cita -->
          <button
            @click="mostrarModalNuevaCita = true"
            class="flex items-center gap-2 px-5 py-2.5 bg-violet-500 text-white font-semibold rounded-full hover:bg-violet-600 shadow-sm hover:shadow transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Cita
          </button>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- BARRA DE BÚSQUEDA + FILTROS -->
    <!-- ================================================================= -->
    <div class="bg-white border-b border-gray-100 px-6 py-3">
      <div class="flex items-center gap-4">
        <!-- Buscador -->
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por paciente, terapeuta, notas..."
            class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
          />
        </div>

        <!-- Botón Filtros -->
        <button
          @click="mostrarFiltros = !mostrarFiltros"
          class="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
          :class="{ 'bg-violet-50 border-violet-300 text-violet-600': mostrarFiltros }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
        </button>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- CHIPS DE ESTADO + LEYENDA -->
    <!-- ================================================================= -->
    <div class="bg-white border-b border-gray-100 px-6 py-4">
      <!-- Label ESTADO -->
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Estado</p>

      <!-- Chips -->
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <button
          @click="toggleEstado('pendiente')"
          class="flex items-center gap-2 px-4 py-2 rounded-full border transition-all"
          :class="estadosFiltro.includes('pendiente')
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-gray-50 border-gray-200 text-gray-400'"
        >
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span class="font-medium">Pendientes</span>
          <span class="text-sm">{{ contadores.pendiente }}</span>
        </button>

        <button
          @click="toggleEstado('confirmada')"
          class="flex items-center gap-2 px-4 py-2 rounded-full border transition-all"
          :class="estadosFiltro.includes('confirmada')
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-gray-50 border-gray-200 text-gray-400'"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span class="font-medium">Confirmadas</span>
          <span class="text-sm">{{ contadores.confirmada }}</span>
        </button>

        <button
          @click="toggleEstado('realizada')"
          class="flex items-center gap-2 px-4 py-2 rounded-full border transition-all"
          :class="estadosFiltro.includes('realizada')
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-gray-50 border-gray-200 text-gray-400'"
        >
          <span class="w-2 h-2 rounded-full bg-blue-400"></span>
          <span class="font-medium">Realizadas</span>
          <span class="text-sm">{{ contadores.realizada }}</span>
        </button>

        <button
          @click="toggleEstado('cancelada')"
          class="flex items-center gap-2 px-4 py-2 rounded-full border transition-all"
          :class="estadosFiltro.includes('cancelada')
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-gray-50 border-gray-200 text-gray-400'"
        >
          <span class="w-2 h-2 rounded-full bg-red-400"></span>
          <span class="font-medium">Canceladas</span>
          <span class="text-sm">{{ contadores.cancelada }}</span>
        </button>
      </div>

      <!-- Leyenda de colores -->
      <div class="flex items-center gap-6 text-xs font-medium text-gray-500">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          PENDIENTE
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          CONFIRMADA
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-blue-400"></span>
          REALIZADA
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-red-400"></span>
          CANCELADA
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- GRID CALENDARIO -->
    <!-- ================================================================= -->
    <div class="flex-1 overflow-auto" style="height: calc(100vh - 320px);">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="flex items-center gap-3 text-gray-500">
          <svg class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Cargando agenda...
        </div>
      </div>

      <!-- Grid -->
      <div v-else class="min-w-max">
        <!-- Cabecera de días -->
        <div class="sticky top-0 z-20 bg-white border-b border-gray-200 grid" :style="{ gridTemplateColumns: `70px repeat(${diasVisibles.length}, 1fr)` }">
          <!-- Esquina vacía -->
          <div class="border-r border-gray-100"></div>

          <!-- Columnas de días -->
          <div
            v-for="dia in diasVisibles"
            :key="dia.fecha"
            class="px-4 py-3 text-center border-r border-gray-100 last:border-r-0"
            :class="{ 'bg-violet-50/50': dia.esHoy }"
          >
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">{{ dia.diaSemana }}</p>
            <p
              class="text-2xl font-bold mt-1"
              :class="dia.esHoy ? 'text-violet-600' : 'text-gray-800'"
            >
              {{ dia.numeroDia }}
            </p>
            <!-- Indicador día actual -->
            <div v-if="dia.esHoy" class="w-6 h-0.5 bg-violet-500 mx-auto mt-1 rounded-full"></div>
          </div>
        </div>

        <!-- Grid de horas -->
        <div class="relative">
          <!-- Línea de hora actual -->
          <div
            v-if="posicionHoraActual !== null"
            class="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
            :style="{ top: `${posicionHoraActual}px` }"
          >
            <div class="flex items-center">
              <span class="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                {{ horaActual.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) }}
              </span>
            </div>
            <div class="flex-1 h-0.5 bg-red-500"></div>
          </div>

          <!-- Filas de horas -->
          <div
            v-for="hora in horasDelDia"
            :key="hora"
            class="grid border-b border-gray-100"
            :style="{ gridTemplateColumns: `70px repeat(${diasVisibles.length}, 1fr)` }"
          >
            <!-- Columna hora -->
            <div class="px-3 py-2 text-xs font-medium text-gray-400 text-right border-r border-gray-100 h-11">
              {{ hora }}
            </div>

            <!-- Celdas por día -->
            <div
              v-for="dia in diasVisibles"
              :key="`${dia.fecha}-${hora}`"
              class="relative border-r border-gray-100 last:border-r-0 h-11 hover:bg-violet-50/30 transition-colors cursor-pointer group"
              :class="{ 'bg-violet-50/20': dia.esHoy }"
              @click="citasPorDiaHora(dia.fecha, hora).length === 0 ? handleSlotClick(dia.fecha, hora) : null"
            >
              <!-- Indicador para crear cita (hover) -->
              <div
                v-if="citasPorDiaHora(dia.fecha, hora).length === 0"
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div class="w-6 h-6 rounded-full bg-violet-500/80 text-white flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>

              <!-- Tarjetas de citas -->
              <div
                v-for="cita in citasPorDiaHora(dia.fecha, hora)"
                :key="cita.id"
                @click.stop="handleCitaClick(cita.id)"
                @keydown.enter.stop="handleCitaClick(cita.id)"
                @keydown.space.prevent.stop="handleCitaClick(cita.id)"
                role="button"
                tabindex="0"
                :aria-label="`Cita ${cita.estado} de ${cita.paciente_nombre || cita.paciente?.nombre_completo || 'paciente'}, ${formatearHora(cita.hora_inicio)} a ${formatearHora(cita.hora_fin)}`"
                class="absolute inset-x-1 top-0.5 p-2 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all z-10 group/card"
                :class="[getColorEstado(cita.estado).bg, getColorEstado(cita.estado).border]"
                :style="{ minHeight: '40px' }"
              >
                <!-- Barra de acciones (aparece en hover) -->
                <div class="absolute top-0.5 right-0.5 flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 focus-within:opacity-100 transition-opacity z-20">
                  <!-- Botón confirmar (solo pendientes) -->
                  <button
                    v-if="cita.estado === 'pendiente'"
                    @click="handleConfirmarCita(cita.id, $event)"
                    @keydown.enter.stop="handleConfirmarCita(cita.id, $event)"
                    class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 hover:scale-110 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
                    :class="{ 'animate-pulse': citaConfirmandoId === cita.id }"
                    :disabled="citaConfirmandoId === cita.id"
                    :title="citaConfirmandoId === cita.id ? 'Confirmando...' : 'Confirmar cita'"
                    :aria-label="`Confirmar cita de ${cita.paciente_nombre || 'paciente'}`"
                    type="button"
                  >
                    <svg v-if="citaConfirmandoId === cita.id" class="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <svg v-else class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>

                  <!-- Botón reprogramar (no canceladas ni completadas) -->
                  <button
                    v-if="cita.estado !== 'cancelada' && cita.estado !== 'realizada' && cita.estado !== 'completada'"
                    @click="handleAbrirModalReprogramar(cita.id, $event)"
                    @keydown.enter.stop="handleAbrirModalReprogramar(cita.id, $event)"
                    class="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                    title="Reprogramar cita"
                    :aria-label="`Reprogramar cita de ${cita.paciente_nombre || 'paciente'}`"
                    type="button"
                  >
                    <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <!-- Botón cancelar (no canceladas ni completadas) -->
                  <button
                    v-if="cita.estado !== 'cancelada' && cita.estado !== 'realizada' && cita.estado !== 'completada'"
                    @click="handleAbrirModalCancelar(cita.id, $event)"
                    @keydown.enter.stop="handleAbrirModalCancelar(cita.id, $event)"
                    class="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 hover:scale-110 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
                    title="Cancelar cita"
                    :aria-label="`Cancelar cita de ${cita.paciente_nombre || 'paciente'}`"
                    type="button"
                  >
                    <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>

                <!-- Contenido de la tarjeta -->
                <div class="pr-16">
                  <p class="text-xs text-gray-500 font-medium">
                    {{ formatearHora(cita.hora_inicio) }} - {{ formatearHora(cita.hora_fin) }}
                  </p>
                  <p class="text-sm font-semibold text-gray-800 truncate mt-0.5">
                    {{ cita.paciente_nombre || cita.paciente?.nombre_completo || 'Sin paciente' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- MODALES -->
    <!-- ================================================================= -->

    <!-- Modal Nueva Cita -->
    <ModalNuevaCitaEnhanced
      :is-open="mostrarModalNuevaCita"
      :fecha-inicial="fechaPreseleccionada || undefined"
      :hora-inicial="horaPreseleccionada || undefined"
      @created="mostrarModalNuevaCita = false; refreshAppointments()"
      @close="mostrarModalNuevaCita = false; fechaPreseleccionada = null; horaPreseleccionada = null"
    />

    <!-- Modal Detalles -->
    <Teleport to="body">
      <ModalDetallesCita
        v-if="mostrarModalDetalles && citaIdSeleccionada"
        :cita-id="citaIdSeleccionada"
        @close="mostrarModalDetalles = false; citaIdSeleccionada = null"
        @cita-actualizada="refreshAppointments()"
        @actualizado="refreshAppointments()"
      />
    </Teleport>

    <!-- ================================================================= -->
    <!-- MODAL CANCELAR CITA -->
    <!-- ================================================================= -->
    <Teleport to="body">
      <div
        v-if="mostrarModalCancelar && citaParaCancelar"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="cerrarModalCancelar"
        @keydown.escape="cerrarModalCancelar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-cancelar-titulo"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-modal-enter">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-rose-50">
            <div class="flex items-center justify-between">
              <div>
                <h2 id="modal-cancelar-titulo" class="text-lg font-semibold text-gray-900">Cancelar Cita</h2>
                <p class="text-sm text-gray-500 mt-0.5">Esta acción no se puede deshacer</p>
              </div>
              <button
                @click="cerrarModalCancelar"
                class="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Cerrar modal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-6 space-y-5">
            <!-- Resumen de la cita -->
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Resumen de la cita</p>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ citaParaCancelar.paciente_nombre || citaParaCancelar.paciente?.nombre_completo || 'Paciente' }}</p>
                    <p class="text-sm text-gray-500">Paciente</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ formatearFecha(citaParaCancelar.fecha_cita) }}</p>
                    <p class="text-sm text-gray-500">{{ formatearHora(citaParaCancelar.hora_inicio) }} - {{ formatearHora(citaParaCancelar.hora_fin) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Motivo de cancelación (opcional) -->
            <div>
              <label for="motivo-cancelacion" class="block text-sm font-medium text-gray-700 mb-2">
                Motivo de cancelación <span class="text-gray-400">(opcional)</span>
              </label>
              <textarea
                id="motivo-cancelacion"
                v-model="motivoCancelacion"
                rows="3"
                placeholder="Ej: Solicitud del paciente, reagendamiento..."
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all resize-none"
              ></textarea>
            </div>

            <!-- Advertencia -->
            <div class="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-amber-800">
                Al cancelar esta cita, el paciente podría recibir una notificación y se actualizará el estado en el sistema.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
            <button
              @click="cerrarModalCancelar"
              class="px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Volver
            </button>
            <button
              @click="ejecutarCancelacion"
              :disabled="citaCancelandoId !== null"
              class="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <svg v-if="citaCancelandoId" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ citaCancelandoId ? 'Cancelando...' : 'Cancelar cita' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ================================================================= -->
    <!-- MODAL REPROGRAMAR CITA -->
    <!-- ================================================================= -->
    <Teleport to="body">
      <div
        v-if="mostrarModalReprogramar && citaParaReprogramar"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="cerrarModalReprogramar"
        @keydown.escape="cerrarModalReprogramar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-reprogramar-titulo"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-modal-enter">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center justify-between">
              <div>
                <h2 id="modal-reprogramar-titulo" class="text-lg font-semibold text-gray-900">Reprogramar Cita</h2>
                <p class="text-sm text-gray-500 mt-0.5">
                  {{ citaParaReprogramar.paciente_nombre || citaParaReprogramar.paciente?.nombre_completo || 'Paciente' }}
                </p>
              </div>
              <button
                @click="cerrarModalReprogramar"
                class="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Cerrar modal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-6 space-y-5">
            <!-- Info de cita actual -->
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Cita actual</p>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ formatearFecha(citaParaReprogramar.fecha_cita) }}</p>
                  <p class="text-sm text-gray-500">{{ formatearHora(citaParaReprogramar.hora_inicio) }} - {{ formatearHora(citaParaReprogramar.hora_fin) }}</p>
                </div>
              </div>
            </div>

            <!-- Flecha indicadora -->
            <div class="flex justify-center">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            <!-- Nueva fecha -->
            <div>
              <label for="nueva-fecha" class="block text-sm font-medium text-gray-700 mb-2">Nueva fecha</label>
              <input
                id="nueva-fecha"
                type="date"
                v-model="reprogramarNuevaFecha"
                :min="new Date().toISOString().split('T')[0]"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>

            <!-- Nueva hora inicio y fin -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="nueva-hora-inicio" class="block text-sm font-medium text-gray-700 mb-2">Hora inicio</label>
                <select
                  id="nueva-hora-inicio"
                  v-model="reprogramarNuevaHoraInicio"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                >
                  <option v-for="hora in horasDisponibles" :key="hora" :value="hora">{{ hora }}</option>
                </select>
              </div>
              <div>
                <label for="nueva-hora-fin" class="block text-sm font-medium text-gray-700 mb-2">Hora fin</label>
                <select
                  id="nueva-hora-fin"
                  v-model="reprogramarNuevaHoraFin"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                >
                  <option v-for="hora in horasFinDisponibles" :key="hora" :value="hora">{{ hora }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
            <button
              @click="cerrarModalReprogramar"
              class="px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancelar
            </button>
            <button
              @click="ejecutarReprogramacion"
              :disabled="!reprogramarNuevaFecha || !reprogramarNuevaHoraInicio || !reprogramarNuevaHoraFin || citaReprogramandoId !== null"
              class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <svg v-if="citaReprogramandoId" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ citaReprogramandoId ? 'Reprogramando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ================================================================= -->
    <!-- TOAST NOTIFICATIONS -->
    <!-- ================================================================= -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform translate-y-4 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-4 opacity-0"
      >
        <div
          v-if="mostrarToast"
          class="fixed bottom-6 right-6 z-[100] max-w-sm"
          role="alert"
          aria-live="polite"
        >
          <div
            class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border"
            :class="{
              'bg-emerald-50 border-emerald-200 text-emerald-800': toastType === 'success',
              'bg-red-50 border-red-200 text-red-800': toastType === 'error',
              'bg-blue-50 border-blue-200 text-blue-800': toastType === 'info'
            }"
          >
            <!-- Icono -->
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              :class="{
                'bg-emerald-100': toastType === 'success',
                'bg-red-100': toastType === 'error',
                'bg-blue-100': toastType === 'info'
              }"
            >
              <svg v-if="toastType === 'success'" class="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <svg v-else-if="toastType === 'error'" class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>

            <!-- Mensaje -->
            <p class="text-sm font-medium flex-1">{{ toastMessage }}</p>

            <!-- Botón cerrar -->
            <button
              @click="mostrarToast = false"
              class="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
              aria-label="Cerrar notificación"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.agenda-calendario {
  font-family: system-ui, -apple-system, sans-serif;
}

/* Animación de entrada del modal */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-enter {
  animation: modal-enter 0.2s ease-out;
}

/* Animación de spin */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Animación de pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
