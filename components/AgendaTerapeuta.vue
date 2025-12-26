<script setup lang="ts">
// =============================================================================
// COMPONENTE: Agenda del Terapeuta
// =============================================================================
// Vista principal para que el terapeuta gestione sus citas y bonos
// Soporta modo coordinadora para ver citas de todos los terapeutas

import { useAgenda } from '~/composables/useAgenda'
import { useAgendaEnhanced } from '~/composables/useAgendaEnhanced'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { ArrowsPointingOutIcon } from '@heroicons/vue/24/outline'
import { agendaLogger } from '~/utils/agenda-logger'
import AgendaStatusFilters from '~/components/agenda/AgendaStatusFilters.vue'
import AgendaHeader from '~/components/agenda/AgendaHeader.vue'
import AgendaViewControls from '~/components/agenda/AgendaViewControls.vue'
import AgendaUnifiedHeader from '~/components/agenda/AgendaUnifiedHeader.vue'
import AgendaFilterBar from '~/components/agenda/AgendaFilterBar.vue'

// ============================================================================
// PROPS
// ============================================================================

interface Props {
  modoCoordinadora?: boolean
  mostrarFiltroTerapeuta?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modoCoordinadora: false,
  mostrarFiltroTerapeuta: false
})

// ============================================================================
// COMPOSABLES
// ============================================================================

// Enhanced composable principal (con optimistic UI y validación)
const {
  citas,
  loading,
  error,
  citasDelDia,
  citasPendientes,
  citasCompletadas,
  citasConBonoProximoAgotar,
  lastUpdateTime,
  validateAppointment,
  createAppointment,
  updateAppointment,
  moveAppointment,
  changeAppointmentStatus,
  loadTerapeutaAppointments,
  loadAllAppointments,
  refreshAppointments,
  clearError
} = useAgendaEnhanced()

// Composable legacy solo para funciones de bonos (temporal)
const {
  completarCita,
  obtenerHistorialBono,
  verificarBonoCitas
} = useAgenda()

const supabase = useSupabaseClient()

// Toast notifications (simple implementation)
const toast = {
  success: (message: string) => {
    console.info('[SUCCESS]', message)
    // TODO: Replace with actual toast library (e.g., vue-toastification)
  },
  error: (message: string) => {
    console.error('[ERROR]', message)
    alert(message) // Temporary fallback
  },
  info: (message: string) => {
    console.info('[INFO]', message)
  }
}

// Estado local
const filtroActivo = ref<'hoy' | 'pendientes' | 'todas' | 'completadas'>('hoy')
const vista = ref<'dia' | 'lista' | 'calendario'>('calendario')
const fechaSeleccionada = ref(new Date())
const mostrarModalHistorial = ref(false)
const bonoSeleccionado = ref<string | null>(null)
const historialBono = ref<any[]>([])
const verificacionBono = ref<any>(null)
const cargandoModal = ref(false)

// Estado para filtro de terapeuta (solo en modo coordinadora)
const terapeutaSeleccionado = ref<string | null>(null)
const terapeutasDisponibles = ref<Array<{ id: string; nombre: string }>>([])

// Estado para filtros de estado (pendiente, confirmada, realizada, cancelada)
const estadosFiltro = ref<string[]>(['pendiente', 'confirmada', 'realizada', 'cancelada'])

// Estado para búsqueda
const busqueda = ref('')

// Citas filtradas por terapeuta (si hay filtro activo)
const citasFiltradasPorTerapeuta = computed(() => {
  if (!props.modoCoordinadora || !terapeutaSeleccionado.value) {
    return citas.value
  }
  return citas.value.filter(c => c.terapeuta?.id === terapeutaSeleccionado.value)
})

// Citas filtradas por estado
const citasFiltradasPorEstado = computed(() => {
  if (estadosFiltro.value.length === 0) {
    // Si no hay estados seleccionados, no mostrar nada
    return []
  }
  return citasFiltradasPorTerapeuta.value.filter(c => estadosFiltro.value.includes(c.estado))
})

// Citas filtradas por búsqueda
const citasFiltradasPorBusqueda = computed(() => {
  if (!busqueda.value.trim()) {
    return citasFiltradasPorEstado.value
  }
  const termino = busqueda.value.toLowerCase().trim()
  return citasFiltradasPorEstado.value.filter(c => {
    const nombrePaciente = (c.paciente_nombre || c.paciente?.nombre_completo || '').toLowerCase()
    const nombreTerapeuta = (c.terapeuta_nombre || c.terapeuta?.nombre_completo || '').toLowerCase()
    const observaciones = (c.observaciones || '').toLowerCase()
    const modalidad = (c.modalidad || '').toLowerCase()

    return nombrePaciente.includes(termino) ||
           nombreTerapeuta.includes(termino) ||
           observaciones.includes(termino) ||
           modalidad.includes(termino)
  })
})

// Usar citas filtradas por terapeuta, estado Y búsqueda
const citasBase = computed(() => citasFiltradasPorBusqueda.value)

// Estado para drag & drop
const citaArrastrada = ref<any>(null)
const celdaObjetivo = ref<{ fecha: string; hora: string } | null>(null)

// Estado para modal de nueva cita
const mostrarModalNuevaCita = ref(false)
const fechaPreseleccionada = ref<string | null>(null)
const horaPreseleccionada = ref<string | null>(null)
const horaFinPreseleccionada = ref<string | null>(null)

// Estado para modal de detalles de cita
const mostrarModalDetalles = ref(false)
const citaIdSeleccionada = ref<string | null>(null)
const citaConfirmandoId = ref<string | null>(null) // ID de cita siendo confirmada

// Estado de operaciones en progreso (para feedback visual)
const operacionEnProgreso = ref<string | null>(null) // 'moving', 'creating', 'updating'
const citaEnOperacion = ref<string | null>(null) // ID de la cita siendo modificada

// Estado para selección de rango (click-drag para crear cita)
const seleccionando = ref(false)
const rangoSeleccion = ref<{
  fechaInicio: string
  horaInicio: string
  fechaFin: string
  horaFin: string
} | null>(null)

// Horario laboral: 11:00 - 22:00 con descanso de 14:00 - 17:00
// Horas disponibles en la agenda
const horasDelDia: string[] = [
  // Mañana: 11:00 - 13:00 (antes del descanso)
  '11:00', '12:00', '13:00',
  // Descanso: 14:00 - 16:00 (no mostrar)
  // Tarde/Noche: 17:00 - 22:00 (después del descanso)
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
]

// Días de la semana para vista calendario
const diasSemana = computed(() => {
  const inicio = new Date(fechaSeleccionada.value)
  const diaSemana = inicio.getDay()
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana
  inicio.setDate(inicio.getDate() + diff)
  
  const dias = []
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(inicio)
    fecha.setDate(inicio.getDate() + i)
    dias.push({
      fecha: fecha.toISOString().split('T')[0] as string,
      nombreDia: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
      numeroDia: fecha.getDate(),
      mes: fecha.toLocaleDateString('es-ES', { month: 'short' })
    })
  }
  return dias
})

// Citas filtradas según la vista activa (respetando filtro de terapeuta)
const citasFiltradas = computed(() => {
  const base = citasBase.value
  const hoy = new Date().toISOString().split('T')[0]

  switch (filtroActivo.value) {
    case 'hoy':
      return base.filter(c => c.fecha_cita === hoy)
    case 'pendientes':
      return base.filter(c => c.estado === 'pendiente')
    case 'completadas':
      return base.filter(c => c.estado === 'completada' || c.estado === 'realizada')
    default:
      return base
  }
})

// Formatear hora para mostrar
const formatearHora = (hora: string) => {
  return hora.substring(0, 5) // HH:MM
}

// Formatear fecha
const formatearFecha = (fecha: string) => {
  const date = new Date(fecha + 'T00:00:00')
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatearFechaLarga = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatearFechaCompleta = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Función para obtener clases de badge según estado
const getBadgeEstado = (estado: string) => {
  const clases = {
    pendiente: 'bg-amber-100 text-amber-700 border border-amber-200',
    confirmada: 'bg-green-100 text-green-700 border border-green-200',
    completada: 'bg-blue-100 text-blue-700 border border-blue-200',
    realizada: 'bg-blue-100 text-blue-700 border border-blue-200',
    cancelada: 'bg-red-100 text-red-700 border border-red-200'
  }
  return clases[estado as keyof typeof clases] || 'bg-gray-100 text-gray-700 border border-gray-200'
}

const esHoy = (fecha: string) => {
  const hoy = new Date().toISOString().split('T')[0]
  return fecha === hoy
}

const cambiarSemana = (direccion: number) => {
  const nueva = new Date(fechaSeleccionada.value)
  nueva.setDate(nueva.getDate() + (direccion * 7))
  fechaSeleccionada.value = nueva
}

// Nueva función para cambiar fecha según vista
const cambiarFecha = (direccion: number) => {
  const nueva = new Date(fechaSeleccionada.value)
  if (vista.value === 'dia') {
    nueva.setDate(nueva.getDate() + direccion)
  } else {
    nueva.setDate(nueva.getDate() + (direccion * 7))
  }
  fechaSeleccionada.value = nueva
}

const irHoy = () => {
  fechaSeleccionada.value = new Date()
}

// Función para obtener citas por hora (vista día)
const citasPorHora = (hora: string) => {
  const fechaStr = fechaSeleccionada.value.toISOString().split('T')[0]
  return citasBase.value.filter(c =>
    c.fecha_cita === fechaStr &&
    c.hora_inicio?.startsWith(hora)
  )
}

// Clase CSS según estado
const claseEstado = (estado: string) => {
  const clases = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmada: 'bg-blue-100 text-blue-800 border-blue-300',
    completada: 'bg-green-100 text-green-800 border-green-300',
    realizada: 'bg-green-100 text-green-800 border-green-300',
    cancelada: 'bg-red-100 text-red-800 border-red-300'
  }
  return clases[estado as keyof typeof clases] || 'bg-gray-100 text-gray-800'
}

const getClasesCita = (estado: string) => {
  const clases = {
    pendiente: 'bg-yellow-100 border-l-4 border-yellow-500',
    confirmada: 'bg-green-100 border-l-4 border-green-500',
    completada: 'bg-blue-100 border-l-4 border-blue-500',
    realizada: 'bg-blue-100 border-l-4 border-blue-500',
    cancelada: 'bg-red-100 border-l-4 border-red-500'
  }
  return clases[estado as keyof typeof clases] || 'bg-gray-100 border-l-4 border-gray-500'
}

const getEstadoLabel = (estado: string) => {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    completada: 'Completada',
    realizada: 'Realizada',
    cancelada: 'Cancelada'
  }
  return labels[estado] || estado
}

// Clase CSS según sesiones restantes
const claseSesionesRestantes = (sesiones: number) => {
  if (sesiones === 0) return 'text-red-600 font-bold'
  if (sesiones === 1) return 'text-orange-600 font-semibold'
  if (sesiones <= 2) return 'text-yellow-600 font-medium'
  return 'text-green-600'
}

// Obtener citas por día y hora
const citasPorDiaHora = (fecha: string, hora: string) => {
  return citasBase.value.filter(c =>
    c.fecha_cita === fecha &&
    c.hora_inicio?.startsWith(hora)
  )
}

// ============================================================================
// FUNCIONES DE CLICK-TO-CREATE
// ============================================================================

const handleSlotClick = (payload: { date: string; horaInicio: string }) => {
  // Log click event
  agendaLogger.clickCreate(payload.date, payload.horaInicio)

  // Pre-rellenar modal con fecha y hora seleccionada
  fechaPreseleccionada.value = payload.date
  horaPreseleccionada.value = payload.horaInicio

  // Abrir modal
  mostrarModalNuevaCita.value = true

  toast.info(`Click en ${payload.date} a las ${payload.horaInicio}`)
}

const handleCitaCreated = async () => {
  // Cerrar modal
  mostrarModalNuevaCita.value = false
  fechaPreseleccionada.value = null
  horaPreseleccionada.value = null

  // Recargar citas (usando enhanced composable)
  await refreshAppointments()

  toast.success('Cita creada exitosamente')
}

const handleModalCerrar = () => {
  mostrarModalNuevaCita.value = false
  fechaPreseleccionada.value = null
  horaPreseleccionada.value = null
  horaFinPreseleccionada.value = null
  rangoSeleccion.value = null
}

// ============================================================================
// FUNCIONES PARA MODAL DE DETALLES Y CONFIRMACIÓN RÁPIDA
// ============================================================================

/**
 * Abre el modal de detalles para una cita específica
 */
const handleAbrirDetallesCita = (citaId: string) => {
  citaIdSeleccionada.value = citaId
  mostrarModalDetalles.value = true
}

/**
 * Cierra el modal de detalles
 */
const handleCerrarDetallesCita = () => {
  mostrarModalDetalles.value = false
  setTimeout(() => {
    citaIdSeleccionada.value = null
  }, 300) // Delay para permitir animación de cierre
}

/**
 * Callback cuando se actualiza una cita desde el modal
 */
const handleCitaActualizada = async () => {
  await refreshAppointments()
  toast.success('Cita actualizada correctamente')
}

/**
 * Confirmación rápida de cita (desde el botón en la tarjeta)
 */
const handleConfirmarCitaRapido = async (citaId: string) => {
  if (citaConfirmandoId.value) return // Ya hay una confirmación en progreso

  citaConfirmandoId.value = citaId

  try {
    const result = await changeAppointmentStatus(citaId, 'confirmada')

    if (result.success) {
      toast.success('✓ Cita confirmada')
    } else {
      toast.error(result.error || 'Error al confirmar la cita')
    }
  } catch (error: any) {
    console.error('Error al confirmar cita:', error)
    toast.error('Error al confirmar la cita')
  } finally {
    citaConfirmandoId.value = null
  }
}

// Estado para operaciones de cancelar/reprogramar
const citaCancelandoId = ref<string | null>(null)
const citaReprogramandoId = ref<string | null>(null)
const mostrarModalReprogramar = ref(false)
const citaParaReprogramar = ref<any>(null)

// Estado del formulario de reprogramación
const reprogramarNuevaFecha = ref<string>('')
const reprogramarNuevaHoraInicio = ref<string>('')
const reprogramarNuevaHoraFin = ref<string>('')

// Horas fin disponibles (basado en hora inicio seleccionada)
const horasFinDisponibles = computed(() => {
  if (!reprogramarNuevaHoraInicio.value) return horasDelDia
  const indexInicio = horasDelDia.indexOf(reprogramarNuevaHoraInicio.value)
  if (indexInicio === -1) return horasDelDia
  // Retornar horas después de la hora de inicio + la siguiente hora (para sesiones de 1h mínimo)
  return [...horasDelDia.slice(indexInicio + 1), '23:00']
})

/**
 * Cancelar cita rápidamente
 */
const handleCancelarCita = async (citaId: string) => {
  if (citaCancelandoId.value) return

  // Confirmar antes de cancelar
  const confirmar = confirm('¿Estás seguro de que deseas cancelar esta cita?')
  if (!confirmar) return

  citaCancelandoId.value = citaId

  try {
    const result = await changeAppointmentStatus(citaId, 'cancelada')

    if (result.success) {
      toast.success('✓ Cita cancelada')
    } else {
      toast.error(result.error || 'Error al cancelar la cita')
    }
  } catch (error: any) {
    console.error('Error al cancelar cita:', error)
    toast.error('Error al cancelar la cita')
  } finally {
    citaCancelandoId.value = null
  }
}

/**
 * Abrir modal para reprogramar cita
 */
const handleReprogramarCita = (citaId: string) => {
  const cita = citas.value.find(c => c.id === citaId)
  if (!cita) {
    toast.error('Cita no encontrada')
    return
  }

  citaParaReprogramar.value = cita
  // Inicializar formulario con valores actuales
  reprogramarNuevaFecha.value = cita.fecha_cita
  reprogramarNuevaHoraInicio.value = formatearHora(cita.hora_inicio)
  reprogramarNuevaHoraFin.value = formatearHora(cita.hora_fin)
  mostrarModalReprogramar.value = true
}

/**
 * Confirmar reprogramación de cita
 */
const confirmarReprogramacion = async (nuevaFecha: string, nuevaHoraInicio: string, nuevaHoraFin: string) => {
  if (!citaParaReprogramar.value) return

  citaReprogramandoId.value = citaParaReprogramar.value.id

  try {
    const result = await moveAppointment(
      citaParaReprogramar.value.id,
      nuevaFecha,
      nuevaHoraInicio,
      nuevaHoraFin
    )

    if (result.success) {
      toast.success('✓ Cita reprogramada')
      mostrarModalReprogramar.value = false
      citaParaReprogramar.value = null
    } else {
      toast.error(result.error || 'Error al reprogramar la cita')
    }
  } catch (error: any) {
    console.error('Error al reprogramar cita:', error)
    toast.error('Error al reprogramar la cita')
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
  // Limpiar formulario
  reprogramarNuevaFecha.value = ''
  reprogramarNuevaHoraInicio.value = ''
  reprogramarNuevaHoraFin.value = ''
}

/**
 * Ejecutar la reprogramación desde el modal
 */
const ejecutarReprogramacion = async () => {
  if (!citaParaReprogramar.value) return
  if (!reprogramarNuevaFecha.value || !reprogramarNuevaHoraInicio.value || !reprogramarNuevaHoraFin.value) {
    toast.error('Por favor completa todos los campos')
    return
  }

  await confirmarReprogramacion(
    reprogramarNuevaFecha.value,
    reprogramarNuevaHoraInicio.value,
    reprogramarNuevaHoraFin.value
  )
}

// ============================================================================
// FUNCIONES DE SELECCIÓN DE RANGO (CLICK-DRAG)
// ============================================================================

const onCeldaMouseDown = (fecha: string, hora: string, event: MouseEvent) => {
  // Solo iniciar selección si la celda está vacía y no hay citas arrastradas
  if (citaArrastrada.value || citasPorDiaHora(fecha, hora).length > 0) {
    return
  }

  event.preventDefault()
  seleccionando.value = true

  // Iniciar rango de selección
  rangoSeleccion.value = {
    fechaInicio: fecha,
    horaInicio: hora,
    fechaFin: fecha,
    horaFin: hora
  }

  agendaLogger.debug('range_select', 'Iniciando selección de rango', { fecha, hora })
}

const onCeldaMouseEnter = (fecha: string, hora: string) => {
  if (!seleccionando.value || !rangoSeleccion.value) return

  // Actualizar fin del rango
  rangoSeleccion.value.fechaFin = fecha
  rangoSeleccion.value.horaFin = hora
}

const onCeldaMouseUp = (event: MouseEvent) => {
  if (!seleccionando.value || !rangoSeleccion.value) return

  event.preventDefault()
  seleccionando.value = false

  const { fechaInicio, horaInicio, fechaFin, horaFin } = rangoSeleccion.value

  // Calcular hora final correcta (hora fin + 1 hora por defecto)
  const horaFinCalculada = calcularHoraFin(horaFin, 60) // 60 minutos por defecto

  agendaLogger.debug('range_select', 'Rango seleccionado', {
    fechaInicio,
    horaInicio,
    fechaFin,
    horaFin: horaFinCalculada
  })

  // Abrir modal con rango pre-seleccionado
  fechaPreseleccionada.value = fechaInicio
  horaPreseleccionada.value = horaInicio
  horaFinPreseleccionada.value = horaFinCalculada

  mostrarModalNuevaCita.value = true

  toast.info(`Rango seleccionado: ${horaInicio} - ${horaFinCalculada}`)

  // Limpiar selección después de un breve delay para que se vea el resaltado
  setTimeout(() => {
    rangoSeleccion.value = null
  }, 100)
}

// Calcular hora fin sumando minutos
const calcularHoraFin = (horaInicio: string, minutos: number): string => {
  const [hours, mins] = horaInicio.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutos
  const newHours = Math.floor(totalMinutes / 60)
  const newMins = totalMinutes % 60
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`
}

// Verificar si una celda está en el rango de selección
const esCeldaEnRango = (fecha: string, hora: string): boolean => {
  if (!rangoSeleccion.value) return false

  const { fechaInicio, horaInicio, fechaFin, horaFin } = rangoSeleccion.value

  // Si es la misma fecha, verificar que la hora esté en el rango
  if (fecha === fechaInicio && fecha === fechaFin) {
    const indexHoraActual = horasDelDia.indexOf(hora)
    const indexHoraInicio = horasDelDia.indexOf(horaInicio)
    const indexHoraFin = horasDelDia.indexOf(horaFin)

    if (indexHoraActual === -1 || indexHoraInicio === -1 || indexHoraFin === -1) {
      return false
    }

    const min = Math.min(indexHoraInicio, indexHoraFin)
    const max = Math.max(indexHoraInicio, indexHoraFin)

    return indexHoraActual >= min && indexHoraActual <= max
  }

  // TODO: Implementar selección multi-día si es necesario
  return false
}

// ============================================================================
// FUNCIONES DE DRAG & DROP
// ============================================================================

const onDragStart = (event: DragEvent, cita: any) => {
  citaArrastrada.value = cita
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', (event.target as HTMLElement).innerHTML)
  }
  ;(event.target as HTMLElement).style.opacity = '0.5'
}

const onDragEnd = (event: DragEvent) => {
  ;(event.target as HTMLElement).style.opacity = '1'
  citaArrastrada.value = null
  celdaObjetivo.value = null
}

const onDragOver = (event: DragEvent, fecha: string, hora: string) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  celdaObjetivo.value = { fecha, hora }
}

const onDragLeave = (event: DragEvent) => {
  celdaObjetivo.value = null
}

const esCeldaObjetivo = (fecha: string, hora: string) => {
  return celdaObjetivo.value?.fecha === fecha && celdaObjetivo.value?.hora === hora
}

const onDrop = async (event: DragEvent, fecha: string, hora: string) => {
  event.preventDefault()

  if (!citaArrastrada.value) {
    agendaLogger.warn('drag_end', 'No hay cita arrastrada', { fecha, hora })
    return
  }

  const cita = citaArrastrada.value
  const citaId = cita.id
  const nuevaFecha = fecha
  const nuevaHora = hora

  // Indicar que hay una operación en progreso
  operacionEnProgreso.value = 'moving'
  citaEnOperacion.value = citaId

  // Log drag operation
  agendaLogger.dragStart(citaId, {
    date: cita.fecha_cita,
    time: cita.hora_inicio
  })

  try {
    // Usar moveAppointment del composable enhanced (incluye validación server-side)
    const result = await moveAppointment(
      citaId,
      nuevaFecha,
      nuevaHora
      // hora_fin se calcula automáticamente manteniendo la duración
    )

    if (!result.success) {
      // Mostrar error user-friendly
      toast.error(result.error || 'No se pudo mover la cita')

      agendaLogger.dragEnd(
        citaId,
        { date: nuevaFecha, time: nuevaHora },
        false
      )
    } else {
      // Éxito
      toast.success('Cita movida exitosamente')

      agendaLogger.dragEnd(
        citaId,
        { date: nuevaFecha, time: nuevaHora },
        true
      )

      // NO es necesario recargar: el composable enhanced ya actualizó citas.value
      // La UI ya refleja el cambio gracias a optimistic update
    }

  } catch (err: any) {
    console.error('[DROP] Error inesperado:', err)
    toast.error('Error inesperado al mover la cita')

    agendaLogger.apiError('onDrop', err)
  } finally {
    // Limpiar estado de drag y operación
    citaArrastrada.value = null
    celdaObjetivo.value = null
    operacionEnProgreso.value = null
    citaEnOperacion.value = null
  }
}

// Manejar completar cita
const handleCompletarCita = async (citaId: string) => {
  if (!confirm('¿Estás seguro de marcar esta cita como completada?')) return

  try {
    const resultado = await completarCita(citaId)
    
    if (resultado.success) {
      console.log('Cita completada')
    }
  } catch (error) {
    console.error('Error al completar cita:', error)
  }
}

// Abrir modal de historial
const abrirHistorial = async (bonoId: string) => {
  try {
    cargandoModal.value = true
    bonoSeleccionado.value = bonoId
    mostrarModalHistorial.value = true

    const [historial, verificacion] = await Promise.all([
      obtenerHistorialBono(bonoId),
      verificarBonoCitas(bonoId)
    ])

    historialBono.value = historial
    verificacionBono.value = verificacion
  } catch (error) {
    console.error('Error al cargar historial:', error)
  } finally {
    cargandoModal.value = false
  }
}

// Cerrar modal
const cerrarModal = () => {
  mostrarModalHistorial.value = false
  bonoSeleccionado.value = null
  historialBono.value = []
  verificacionBono.value = null
}

// Recargar citas manualmente
const recargarCitas = async () => {
  try {
    await refreshAppointments()
    toast.success('Agenda actualizada')
  } catch (error) {
    console.error('Error al recargar citas:', error)
    toast.error('Error al actualizar la agenda')
  }
}

// Cargar lista de terapeutas disponibles (solo para coordinadora)
const cargarTerapeutas = async () => {
  if (!props.modoCoordinadora) return

  try {
    const { data, error: fetchError } = await supabase
      .from('terapeutas')
      .select('id, nombre_completo')
      .eq('activo', true)
      .order('nombre_completo', { ascending: true })

    if (fetchError) {
      console.error('Error al cargar terapeutas:', fetchError)
      return
    }

    terapeutasDisponibles.value = (data || []).map(t => ({
      id: t.id,
      nombre: t.nombre_completo
    }))

  } catch (err) {
    console.error('Error al cargar terapeutas:', err)
  }
}

// Handler para cambios en filtros de estado
const handleFiltrarPorEstado = (estados: string[]) => {
  estadosFiltro.value = estados
  agendaLogger.debug('filter_change', 'Filtros de estado actualizados', { estados })
}

// Cargar citas al montar el componente
onMounted(async () => {
  // Cargar citas según el modo
  if (props.modoCoordinadora) {
    await loadAllAppointments()
    // Cargar lista de terapeutas para el filtro
    await cargarTerapeutas()
  } else {
    await loadTerapeutaAppointments()
  }

  // Listener global para mouseup (para selección de rango)
  document.addEventListener('mouseup', onCeldaMouseUp)
})

// Limpiar listener al desmontar
onUnmounted(() => {
  document.removeEventListener('mouseup', onCeldaMouseUp)
})
</script>

<template>
  <div class="agenda-layout" :class="{ 'modo-coordinadora': modoCoordinadora }">
    <!-- =================================================================== -->
    <!-- MODO COORDINADORA: Header Unificado -->
    <!-- =================================================================== -->
    <template v-if="modoCoordinadora">
      <!-- Header unificado con navegación, vistas y acciones -->
      <AgendaUnifiedHeader
        :vista="vista"
        :fecha-actual="fechaSeleccionada"
        :loading="loading"
        :modo-coordinadora="true"
        @cambiar-vista="(v) => vista = v"
        @navegar-fecha="cambiarFecha"
        @ir-hoy="irHoy"
        @actualizar="recargarCitas"
        @nueva-cita="mostrarModalNuevaCita = true"
        @nueva-tarea="() => {}"
      />

      <!-- Barra de filtros elegante -->
      <AgendaFilterBar
        :citas="citas"
        :modo-coordinadora="true"
        :terapeutas="terapeutasDisponibles"
        :terapeuta-seleccionado="terapeutaSeleccionado"
        :estados-activos="estadosFiltro"
        :busqueda="busqueda"
        @update:busqueda="(v) => busqueda = v"
        @update:terapeuta-seleccionado="(v) => terapeutaSeleccionado = v"
        @update:estados-activos="handleFiltrarPorEstado"
        @filtrar-estados="handleFiltrarPorEstado"
      />
    </template>

    <!-- =================================================================== -->
    <!-- MODO TERAPEUTA: Layout Original -->
    <!-- =================================================================== -->
    <template v-else>
      <!-- ZONA 1: Título y Contexto -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/30 p-4">
        <AgendaHeader
          titulo="Mi Agenda"
          subtitulo="Tus citas programadas"
          rol-activo="terapeuta"
          :mostrar-rol="false"
        />
      </div>

      <!-- ZONA 2: Controles Temporales (Navegación y Vista) -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/30 p-4">
        <AgendaViewControls
          :vista="vista"
          :fecha-actual="fechaSeleccionada"
          :loading="loading"
          :last-update-time="lastUpdateTime"
          @cambiar-vista="(v) => vista = v"
          @navegar-fecha="cambiarFecha"
          @ir-hoy="irHoy"
          @actualizar="recargarCitas"
        />
      </div>

      <!-- ZONA 3: Filtros de Contenido (Buscador + Estado) -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/30 p-4 space-y-4">
        <!-- Buscador -->
        <div class="flex-1 relative">
          <label for="buscar-citas" class="sr-only">Buscar paciente o cita</label>
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="buscar-citas"
            v-model="busqueda"
            type="search"
            placeholder="Buscar por paciente o nota..."
            class="block w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            aria-label="Buscar paciente o cita"
          />
          <button
            v-if="busqueda"
            @click="busqueda = ''"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
            aria-label="Limpiar búsqueda"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Indicador de resultados de búsqueda -->
        <div v-if="busqueda" class="flex items-center gap-2 text-sm">
          <span class="text-neutral-500">
            {{ citasBase.length }} resultado{{ citasBase.length !== 1 ? 's' : '' }} para
          </span>
          <span class="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md font-medium">
            "{{ busqueda }}"
          </span>
        </div>

        <!-- Filtros de estado interactivos -->
        <AgendaStatusFilters
          :citas="citas"
          :estados-activos="estadosFiltro"
          @filtrar="handleFiltrarPorEstado"
        />
      </div>
    </template>

    <!-- Alertas de bonos próximos a agotarse -->
    <div
      v-if="citasConBonoProximoAgotar.length > 0"
      class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-4 shadow-sm"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F2B33D] to-[#F2B33D]/70 flex items-center justify-center flex-shrink-0">
          <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-amber-900">
            Atención: {{ citasConBonoProximoAgotar.length }} paciente(s) con pocas sesiones restantes
          </p>
          <p class="text-xs text-amber-700 mt-1">
            Considera informar a estos pacientes para renovar sus bonos
          </p>
        </div>
      </div>
    </div>

    <!-- Vista Día -->
    <div v-if="vista === 'dia'" class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/30 overflow-hidden flex flex-col" style="height: calc(100vh - 200px);">
      <!-- Header del día (STICKY) -->
      <div class="sticky top-0 z-10 bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-['Elms_Sans'] font-semibold text-lg text-neutral-800">
              {{ formatearFechaCompleta(fechaSeleccionada) }}
            </h3>
            <p class="text-sm text-neutral-600 mt-1">
              {{ citasPorHora ? Object.values(horasDelDia).reduce((total, hora) => total + citasPorHora(hora).length, 0) : 0 }} citas programadas
            </p>
          </div>
        </div>
      </div>

      <!-- Contenido con scroll -->
      <div class="flex-1 overflow-y-auto">
        <!-- Estado vacío cuando no hay citas -->
        <div 
          v-if="citasFiltradas.length === 0" 
          class="flex items-center justify-center py-16"
        >
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#027368]/10 to-[#04BF9D]/10 flex items-center justify-center">
              <svg class="w-8 h-8 text-[#027368]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="font-['Elms_Sans'] font-medium text-neutral-800 mb-2">No hay citas programadas</h3>
            <p class="text-neutral-600 text-sm">{{ formatearFechaCompleta(fechaSeleccionada) }} está libre</p>
          </div>
        </div>

        <!-- Horarios del día -->
        <div v-else class="divide-y divide-neutral-100">
          <div
            v-for="(hora, index) in horasDelDia"
            :key="hora"
            :data-hora="hora"
            class="flex hover:bg-neutral-50/50 transition-colors"
          >
            <div class="w-20 p-3 text-sm font-medium text-neutral-600 border-r border-neutral-200 bg-neutral-50/50 flex-shrink-0">
              {{ hora }}
            </div>
            <div
              class="flex-1 p-3 cursor-pointer hover:bg-[#027368]/5 transition-colors relative group/cell"
              @click="citasPorHora(hora).length === 0 ? handleSlotClick({ date: fechaSeleccionada.toISOString().split('T')[0], horaInicio: hora }) : null"
            >
              <!-- Indicador de celda vacía (discreto, solo en hover) -->
              <button
                v-if="citasPorHora(hora).length === 0"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#027368] text-white flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all hover:bg-[#025a52] hover:scale-110 shadow-sm"
                @click.stop="handleSlotClick({ date: fechaSeleccionada.toISOString().split('T')[0], horaInicio: hora })"
                title="Crear nueva cita"
                aria-label="Crear nueva cita a las {{ hora }}"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              
              <!-- Tarjeta de cita interactiva (Vista Día) -->
              <div
                v-for="cita in citasPorHora(hora)"
                :key="cita.id"
                draggable="true"
                @dragstart="onDragStart($event, cita)"
                @dragend="onDragEnd($event)"
                class="mb-2 p-3 rounded-xl transition-all hover:shadow-md hover:ring-2 hover:ring-[#027368]/30 group relative backdrop-blur-sm"
                :class="[getClasesCita(cita.estado), citaConfirmandoId === cita.id ? 'opacity-60 pointer-events-none' : 'cursor-pointer']"
                role="button"
                tabindex="0"
                :aria-label="`Cita ${cita.estado} de ${cita.paciente_nombre || 'paciente'}, ${formatearHora(cita.hora_inicio)} a ${formatearHora(cita.hora_fin)}, ${cita.modalidad}${cita.estado === 'pendiente' ? '. Pulsa para ver detalles o confirmar.' : '. Pulsa para ver detalles.'}`"
                :title="`${cita.paciente_nombre || 'Sin paciente'} - ${formatearHora(cita.hora_inicio)} a ${formatearHora(cita.hora_fin)}. Click para ver detalles.`"
                @click.stop="handleAbrirDetallesCita(cita.id)"
                @keydown.enter.stop="handleAbrirDetallesCita(cita.id)"
                @keydown.space.prevent.stop="handleAbrirDetallesCita(cita.id)"
              >
                <!-- Barra de acciones rápidas (aparece en hover) -->
                <div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all z-10">
                  <!-- Botón de confirmación rápida (solo pendientes) -->
                  <button
                    v-if="cita.estado === 'pendiente'"
                    @click.stop="handleConfirmarCitaRapido(cita.id)"
                    class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 hover:scale-110 shadow-sm transition-all"
                    :class="{ 'animate-pulse': citaConfirmandoId === cita.id }"
                    :disabled="citaConfirmandoId === cita.id"
                    :title="citaConfirmandoId === cita.id ? 'Confirmando...' : 'Confirmar cita'"
                    :aria-label="`Confirmar cita de ${cita.paciente_nombre || 'paciente'}`"
                    type="button"
                  >
                    <svg v-if="citaConfirmandoId === cita.id" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <svg v-else class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>

                  <!-- Botón de reprogramar (no canceladas) -->
                  <button
                    v-if="cita.estado !== 'cancelada'"
                    @click.stop="handleReprogramarCita(cita.id)"
                    class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-sm transition-all"
                    :disabled="citaReprogramandoId === cita.id"
                    title="Reprogramar cita"
                    :aria-label="`Reprogramar cita de ${cita.paciente_nombre || 'paciente'}`"
                    type="button"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <!-- Botón de cancelar (no canceladas ni completadas) -->
                  <button
                    v-if="cita.estado !== 'cancelada' && cita.estado !== 'completada' && cita.estado !== 'realizada'"
                    @click.stop="handleCancelarCita(cita.id)"
                    class="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 hover:scale-110 shadow-sm transition-all"
                    :class="{ 'animate-pulse': citaCancelandoId === cita.id }"
                    :disabled="citaCancelandoId === cita.id"
                    :title="citaCancelandoId === cita.id ? 'Cancelando...' : 'Cancelar cita'"
                    :aria-label="`Cancelar cita de ${cita.paciente_nombre || 'paciente'}`"
                    type="button"
                  >
                    <svg v-if="citaCancelandoId === cita.id" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <svg v-else class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div class="flex items-start justify-between gap-3">
                  <!-- Indicador de arrastre -->
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <ArrowsPointingOutIcon class="w-4 h-4 text-neutral-500" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm text-neutral-800 truncate">{{ cita.paciente_nombre || cita.paciente?.nombre_completo || 'Sin paciente' }}</p>
                    <div class="flex items-center flex-wrap gap-2 mt-1">
                      <span class="text-xs text-neutral-600 font-medium">
                        {{ formatearHora(cita.hora_inicio) }} - {{ formatearHora(cita.hora_fin) }}
                      </span>
                      <!-- Modalidad con icono -->
                      <span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-white/60 text-neutral-700">
                        <span v-if="cita.modalidad === 'online'" title="Online">💻</span>
                        <span v-else title="Presencial">🏥</span>
                        {{ cita.modalidad === 'online' ? 'Online' : 'Presencial' }}
                      </span>
                      <!-- Indicador de bono -->
                      <span
                        v-if="cita.bono_sesiones_restantes !== undefined && cita.bono_sesiones_restantes !== null"
                        class="text-xs px-2 py-0.5 rounded-lg font-medium"
                        :class="{
                          'bg-red-100 text-red-700': cita.bono_sesiones_restantes === 0,
                          'bg-orange-100 text-orange-700': cita.bono_sesiones_restantes === 1,
                          'bg-yellow-100 text-yellow-700': cita.bono_sesiones_restantes === 2,
                          'bg-green-100 text-green-700': cita.bono_sesiones_restantes > 2
                        }"
                      >
                        {{ cita.bono_sesiones_restantes }}/{{ cita.bono_sesiones_totales || '?' }} sesiones
                      </span>
                    </div>
                    <!-- Terapeuta (solo en modo coordinadora) -->
                    <p
                      v-if="modoCoordinadora && (cita.terapeuta_nombre || cita.terapeuta?.nombre_completo)"
                      class="text-xs text-neutral-500 mt-1 flex items-center gap-1"
                    >
                      <span>👤</span>
                      {{ cita.terapeuta_nombre || cita.terapeuta?.nombre_completo }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span
                      class="text-xs px-2 py-1 rounded-lg font-medium whitespace-nowrap"
                      :class="getBadgeEstado(cita.estado)"
                    >
                      {{ getEstadoLabel(cita.estado) }}
                    </span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Calendario Semanal -->
    <div v-else-if="vista === 'calendario'" class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/30 overflow-hidden flex flex-col" style="height: calc(100vh - 200px);">
      <div class="min-w-[800px] overflow-x-auto flex-1 flex flex-col">
        <!-- Encabezados de días (STICKY) -->
        <div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div class="grid grid-cols-8">
            <div class="p-2 border-r border-gray-200 bg-gray-50"></div>
            <div
              v-for="dia in diasSemana"
              :key="dia.fecha"
              class="p-2 text-center border-r border-gray-200 last:border-r-0"
              :class="esHoy(dia.fecha) ? 'bg-blue-50' : 'bg-white'"
            >
              <div class="flex items-center justify-center gap-1">
                <span class="text-xs font-medium text-gray-600 uppercase">{{ dia.nombreDia }}</span>
                <span class="text-lg font-bold text-gray-900" :class="esHoy(dia.fecha) ? 'text-blue-600' : ''">{{ dia.numeroDia }}</span>
              </div>
              <div class="text-xs text-gray-500">{{ dia.mes }}</div>
            </div>
          </div>
        </div>

        <!-- Grid de horas y citas (SCROLLABLE) -->
        <div class="flex-1 overflow-y-auto">
          <div class="divide-y divide-gray-100">
            <div
              v-for="hora in horasDelDia"
              :key="hora"
              :data-hora="hora"
              class="grid grid-cols-8"
            >
              <div class="p-3 text-sm font-medium text-gray-600 border-r border-gray-100 bg-gray-50 sticky left-0">
                {{ hora }}
              </div>
              <div
                v-for="dia in diasSemana"
                :key="`${dia.fecha}-${hora}`"
                class="p-2 border-r border-gray-100 last:border-r-0 hover:bg-blue-50/30 transition-colors min-h-[70px] cursor-pointer relative group/cell"
                :class="[
                  esHoy(dia.fecha) ? 'bg-blue-50/20' : '',
                  esCeldaObjetivo(dia.fecha, hora) ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : '',
                  esCeldaEnRango(dia.fecha, hora) ? 'bg-[#027368]/20 ring-2 ring-[#027368] ring-inset' : ''
                ]"
                @dragover="onDragOver($event, dia.fecha, hora)"
                @dragleave="onDragLeave($event)"
                @drop="onDrop($event, dia.fecha, hora)"
                @mousedown="citasPorDiaHora(dia.fecha, hora).length === 0 ? onCeldaMouseDown(dia.fecha, hora, $event) : null"
                @mouseenter="onCeldaMouseEnter(dia.fecha, hora)"
                @click="citasPorDiaHora(dia.fecha, hora).length === 0 && !seleccionando ? handleSlotClick({ date: dia.fecha, horaInicio: hora }) : null"
              >
                <!-- Indicador de celda vacía: solo botón + discreto en hover -->
                <div
                  v-if="citasPorDiaHora(dia.fecha, hora).length === 0"
                  class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all duration-200 pointer-events-none"
                >
                  <div
                    class="w-6 h-6 rounded-full bg-teal-500/90 text-white flex items-center justify-center shadow-md transform scale-90 group-hover/cell:scale-100 transition-transform"
                    :title="`Crear cita el ${dia.nombreDia} ${dia.numeroDia} a las ${hora}`"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <!-- Tarjeta de cita mejorada e interactiva -->
                <div
                  v-for="cita in citasPorDiaHora(dia.fecha, hora)"
                  :key="cita.id"
                  draggable="true"
                  @dragstart="onDragStart($event, cita)"
                  @dragend="onDragEnd($event)"
                  class="text-xs p-2 rounded-lg mb-1.5 hover:shadow-lg hover:ring-2 hover:ring-teal-400 transition-all group relative border-l-3"
                  :class="[getClasesCita(cita.estado), citaConfirmandoId === cita.id ? 'opacity-60 pointer-events-none' : 'cursor-pointer']"
                  role="button"
                  tabindex="0"
                  :aria-label="`Cita ${cita.estado} de ${cita.paciente_nombre || 'paciente'}, ${formatearHora(cita.hora_inicio)} a ${formatearHora(cita.hora_fin)}, ${cita.modalidad}${cita.estado === 'pendiente' ? '. Pulsa para ver detalles o confirmar.' : '. Pulsa para ver detalles.'}`"
                  :title="`${cita.paciente_nombre || 'Sin paciente'} - ${formatearHora(cita.hora_inicio)} a ${formatearHora(cita.hora_fin)}. Click para ver detalles.`"
                  @click.stop="handleAbrirDetallesCita(cita.id)"
                  @keydown.enter.stop="handleAbrirDetallesCita(cita.id)"
                  @keydown.space.prevent.stop="handleAbrirDetallesCita(cita.id)"
                >
                  <!-- Barra de acciones rápidas (aparece en hover) -->
                  <div class="absolute top-0.5 right-0.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all z-10">
                    <!-- Botón de confirmación rápida (solo pendientes) -->
                    <button
                      v-if="cita.estado === 'pendiente'"
                      @click.stop="handleConfirmarCitaRapido(cita.id)"
                      class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 hover:scale-110 shadow-sm transition-all"
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

                    <!-- Botón de reprogramar (no canceladas) -->
                    <button
                      v-if="cita.estado !== 'cancelada'"
                      @click.stop="handleReprogramarCita(cita.id)"
                      class="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-sm transition-all"
                      :disabled="citaReprogramandoId === cita.id"
                      title="Reprogramar cita"
                      :aria-label="`Reprogramar cita de ${cita.paciente_nombre || 'paciente'}`"
                      type="button"
                    >
                      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>

                    <!-- Botón de cancelar (no canceladas ni completadas) -->
                    <button
                      v-if="cita.estado !== 'cancelada' && cita.estado !== 'completada' && cita.estado !== 'realizada'"
                      @click.stop="handleCancelarCita(cita.id)"
                      class="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 hover:scale-110 shadow-sm transition-all"
                      :class="{ 'animate-pulse': citaCancelandoId === cita.id }"
                      :disabled="citaCancelandoId === cita.id"
                      :title="citaCancelandoId === cita.id ? 'Cancelando...' : 'Cancelar cita'"
                      :aria-label="`Cancelar cita de ${cita.paciente_nombre || 'paciente'}`"
                      type="button"
                    >
                      <svg v-if="citaCancelandoId === cita.id" class="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <svg v-else class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>

                    <!-- Indicador de arrastre -->
                    <div class="w-5 h-5 flex items-center justify-center">
                      <ArrowsPointingOutIcon class="w-3 h-3 text-gray-500" />
                    </div>
                  </div>

                  <!-- Contenido de la tarjeta -->
                  <div class="pr-8">
                    <!-- Nombre del paciente -->
                    <p class="font-semibold truncate text-sm text-gray-800">
                      {{ cita.paciente_nombre || cita.paciente?.nombre_completo || 'Sin paciente' }}
                    </p>

                    <!-- Hora -->
                    <p class="text-xs text-gray-500 mt-0.5 font-medium">
                      {{ formatearHora(cita.hora_inicio) }} – {{ formatearHora(cita.hora_fin) }}
                    </p>

                    <!-- Fila de info adicional: Modalidad + Estado -->
                    <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <!-- Modalidad con icono -->
                      <span class="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-white/70 text-gray-600">
                        <span v-if="cita.modalidad === 'online'" title="Online">💻</span>
                        <span v-else-if="cita.modalidad === 'presencial'" title="Presencial">🏥</span>
                        <span v-else title="Telefónica">📞</span>
                        <span class="hidden sm:inline">{{ cita.modalidad }}</span>
                      </span>

                      <!-- Badge de estado -->
                      <span
                        class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                        :class="getBadgeEstado(cita.estado)"
                      >
                        {{ getEstadoLabel(cita.estado) }}
                      </span>

                      <!-- Indicador de bono -->
                      <span
                        v-if="cita.bono_id"
                        class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium"
                        :title="`Bono: ${cita.bono_sesiones_restantes || 0}/${cita.bono_sesiones_totales || 0} sesiones`"
                      >
                        🎫 {{ cita.bono_sesiones_restantes || 0 }}
                      </span>
                    </div>

                    <!-- Nombre del terapeuta (solo en modo coordinadora) -->
                    <p
                      v-if="modoCoordinadora && (cita.terapeuta_nombre || cita.terapeuta?.nombre_completo)"
                      class="text-[10px] text-gray-400 mt-1 truncate"
                    >
                      👤 {{ cita.terapeuta_nombre || cita.terapeuta?.nombre_completo }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Lista (original) -->
    <div v-else>
      <!-- Filtros -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="filtro in [
            { key: 'hoy', label: 'Hoy', count: citasBase.filter(c => c.fecha_cita === new Date().toISOString().split('T')[0]).length },
            { key: 'pendientes', label: 'Pendientes', count: citasBase.filter(c => c.estado === 'pendiente').length },
            { key: 'completadas', label: 'Completadas', count: citasBase.filter(c => c.estado === 'completada' || c.estado === 'realizada').length },
            { key: 'todas', label: 'Todas', count: citasBase.length }
          ]"
          :key="filtro.key"
          @click="filtroActivo = filtro.key as any"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            filtroActivo === filtro.key
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          ]"
        >
          {{ filtro.label }} ({{ filtro.count }})
        </button>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- Loading -->
      <div v-if="loading && citas.length === 0" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Cargando citas...</p>
      </div>

      <!-- Sin citas -->
      <div v-else-if="citasFiltradas.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ filtroActivo === 'hoy' ? 'No tienes citas programadas para hoy.' : 'No hay citas en esta categoría.' }}
        </p>
      </div>

      <!-- Lista de citas -->
      <div v-else class="space-y-4">
        <TarjetaCita
          v-for="cita in citasFiltradas"
          :key="cita.id"
          :cita="cita"
          @completar="handleCompletarCita"
          @ver-historial="abrirHistorial"
        />
      </div>
    </div>

    <!-- Modal de Historial de Bono -->
    <Teleport to="body">
      <div
        v-if="mostrarModalHistorial"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="cerrarModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          <!-- Header del modal -->
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">Historial del Bono</h2>
            <button
              @click="cerrarModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Contenido del modal -->
          <div class="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div v-if="cargandoModal" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>

            <div v-else>
              <!-- Resumen del bono -->
              <div v-if="verificacionBono" class="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-3">Resumen</h3>
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p class="text-2xl font-bold text-blue-600">{{ verificacionBono.bono.sesiones_totales }}</p>
                    <p class="text-xs text-gray-600">Sesiones Totales</p>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-green-600">{{ verificacionBono.bono.sesiones_usadas }}</p>
                    <p class="text-xs text-gray-600">Sesiones Usadas</p>
                  </div>
                  <div>
                    <p :class="['text-2xl font-bold', claseSesionesRestantes(verificacionBono.bono.sesiones_restantes)]">
                      {{ verificacionBono.bono.sesiones_restantes }}
                    </p>
                    <p class="text-xs text-gray-600">Sesiones Restantes</p>
                  </div>
                </div>

                <div v-if="verificacionBono.alerta" class="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                  {{ verificacionBono.mensaje_alerta }}
                </div>
              </div>

              <!-- Movimientos -->
              <div>
                <h3 class="font-semibold text-gray-900 mb-3">Movimientos</h3>
                <div v-if="historialBono.length === 0" class="text-center py-8 text-gray-500">
                  No hay movimientos registrados
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="mov in historialBono"
                    :key="mov.id"
                    class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <span
                            :class="[
                              'px-2 py-1 text-xs font-medium rounded',
                              mov.tipo_movimiento === 'descuento' ? 'bg-red-100 text-red-700' :
                              mov.tipo_movimiento === 'reembolso' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            ]"
                          >
                            {{ mov.tipo_movimiento }}
                          </span>
                          <span class="text-xs text-gray-500">
                            {{ new Date(mov.fecha).toLocaleString('es-ES') }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-700">{{ mov.motivo }}</p>
                      </div>
                      <div class="text-right ml-4">
                        <p class="text-sm font-semibold text-gray-900">
                          {{ mov.sesiones_antes }} → {{ mov.sesiones_despues }}
                        </p>
                        <p :class="[
                          'text-xs font-medium',
                          mov.sesiones_modificadas > 0 ? 'text-red-600' : 'text-green-600'
                        ]">
                          {{ mov.sesiones_modificadas > 0 ? '-' : '+' }}{{ Math.abs(mov.sesiones_modificadas) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer del modal -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              @click="cerrarModal"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de Nueva Cita Enhanced (click-to-create con autocompletar y validación) -->
    <ModalNuevaCitaEnhanced
      :is-open="mostrarModalNuevaCita"
      :fecha-inicial="fechaPreseleccionada || undefined"
      :hora-inicial="horaPreseleccionada || undefined"
      :hora-final="horaFinPreseleccionada || undefined"
      @created="handleCitaCreated"
      @close="handleModalCerrar"
    />

    <!-- Modal de Detalles de Cita (click en tarjeta) -->
    <ModalDetallesCita
      :cita-id="citaIdSeleccionada"
      @close="handleCerrarDetallesCita"
      @cita-actualizada="handleCitaActualizada"
      @actualizado="handleCitaActualizada"
    />

    <!-- Modal de Reprogramar Cita -->
    <Teleport to="body">
      <div
        v-if="mostrarModalReprogramar && citaParaReprogramar"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="cerrarModalReprogramar"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Reprogramar Cita</h2>
                <p class="text-sm text-gray-500 mt-0.5">
                  {{ citaParaReprogramar.paciente_nombre || citaParaReprogramar.paciente?.nombre_completo || 'Paciente' }}
                </p>
              </div>
              <button
                @click="cerrarModalReprogramar"
                class="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-all"
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
                <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ formatearFecha(citaParaReprogramar.fecha_cita) }}</p>
                  <p class="text-sm text-gray-500">{{ formatearHora(citaParaReprogramar.hora_inicio) }} - {{ formatearHora(citaParaReprogramar.hora_fin) }}</p>
                </div>
              </div>
            </div>

            <!-- Nueva fecha -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nueva fecha</label>
              <input
                type="date"
                v-model="reprogramarNuevaFecha"
                :min="new Date().toISOString().split('T')[0]"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>

            <!-- Nueva hora inicio -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Hora inicio</label>
                <select
                  v-model="reprogramarNuevaHoraInicio"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                >
                  <option v-for="hora in horasDelDia" :key="hora" :value="hora">{{ hora }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Hora fin</label>
                <select
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
              class="px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="ejecutarReprogramacion"
              :disabled="!reprogramarNuevaFecha || !reprogramarNuevaHoraInicio || !reprogramarNuevaHoraFin || citaReprogramandoId"
              class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
  </div>
</template>

<style scoped>
.agenda-terapeuta {
  min-height: 100vh;
}

/* ============================================================================
   LAYOUT UNIFICADO PARA AGENDA
   ============================================================================ */

.agenda-layout {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  min-height: 100vh;
  background: #FAFBFC;
}

/* Modo coordinadora - Background ligeramente diferente */
.agenda-layout.modo-coordinadora {
  background: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%);
  gap: 0.625rem;
}

/* Contenedores de tarjetas de cita en grid semanal */
.agenda-layout.modo-coordinadora :deep(.agenda-event),
.agenda-layout.modo-coordinadora :deep(.cita-card) {
  /* Tarjetas más compactas y refinadas */
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.agenda-layout.modo-coordinadora :deep(.agenda-event:hover),
.agenda-layout.modo-coordinadora :deep(.cita-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Animación de entrada para componentes */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.agenda-layout > * {
  animation: fadeSlideIn 0.2s ease-out;
}

.agenda-layout > *:nth-child(2) {
  animation-delay: 0.05s;
}

.agenda-layout > *:nth-child(3) {
  animation-delay: 0.1s;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
