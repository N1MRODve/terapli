<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: AgendaCalendario
 * =============================================================================
 * Nueva vista de agenda basada en el diseño de referencia.
 * Soporta vistas: Día, 5 Días, Semana, Mes
 * Incluye: navegación, búsqueda, filtros de estado, grid horario
 *
 * MEJORAS DE VISUALIZACIÓN TEMPORAL:
 * - Línea de tiempo actual con chip de hora
 * - Sombreado de horas pasadas
 * - Botón "Ahora" con scroll suave
 * - Barra de progreso del día laboral
 */

import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAgendaEnhanced } from '~/composables/useAgendaEnhanced'
import { useConfiguracionAgenda } from '~/composables/useConfiguracionAgenda'

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
  deleteAppointment,
  refreshAppointments
} = useAgendaEnhanced()

const supabase = useSupabaseClient()

// Configuración de agenda del terapeuta
const {
  configuracion: configAgenda,
  cargarConfiguracion,
  horaInicioLaboral,
  horaFinLaboral,
  esDiaLaborable,
  estaBloqueda,
  obtenerHorarioEfectivo,
  estaEnHorarioLaboral,
  calcularOcupacionDia
} = useConfiguracionAgenda()

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

// Modal eliminar
const mostrarModalEliminar = ref(false)
const citaParaEliminar = ref<any>(null)
const citaEliminandoId = ref<string | null>(null)

// Modal notas última sesión
const mostrarModalNotas = ref(false)
const notasUltimaSesion = ref<any>(null)
const cargandoNotas = ref(false)

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

// ============================================================================
// CONFIGURACIÓN DE TIEMPO Y AGENDA
// ============================================================================

// Altura de cada slot de 1 hora (88px = 2 slots de 44px)
const SLOT_HEIGHT_PX = 88
// Minutos por slot visual (1 hora)
const MINUTOS_POR_SLOT = 60

// Hora de inicio/fin de la agenda (dinámicos desde configuración)
const HORA_INICIO_COMPLETO = computed(() => horaInicioLaboral.value || 9)
const HORA_FIN_COMPLETO = computed(() => horaFinLaboral.value || 21)

// ============================================================================
// ZOOM INTELIGENTE - Ajusta vista a horas con actividad
// ============================================================================

// Preferencia de usuario: 'auto' (inteligente), 'activo' (solo horas con citas), 'completo' (9-21)
const modoHorario = ref<'auto' | 'activo' | 'completo'>('auto')

// Cargar preferencia del localStorage y configuración de agenda
onMounted(async () => {
  const savedModo = localStorage.getItem('agenda-modo-horario')
  if (savedModo && ['auto', 'activo', 'completo'].includes(savedModo)) {
    modoHorario.value = savedModo as 'auto' | 'activo' | 'completo'
  }
  // Cargar configuración de agenda del terapeuta (forzar recarga para obtener datos actualizados)
  await cargarConfiguracion(true)
})

// Guardar preferencia cuando cambia
watch(modoHorario, (val) => {
  localStorage.setItem('agenda-modo-horario', val)
})

// Calcular rango de horas con actividad (para las fechas visibles)
const rangoHorasConActividad = computed(() => {
  const fechasVisibles = diasVisibles.value.map(d => d.fecha)
  const citasEnVista = citas.value.filter(c => fechasVisibles.includes(c.fecha_cita))

  if (citasEnVista.length === 0) {
    // Sin citas, usar horario configurado
    return { inicio: HORA_INICIO_COMPLETO.value, fin: HORA_FIN_COMPLETO.value }
  }

  let horaMin = 23
  let horaMax = 0

  citasEnVista.forEach(c => {
    if (c.hora_inicio) {
      const hora = parseInt(c.hora_inicio.substring(0, 2))
      horaMin = Math.min(horaMin, hora)
      horaMax = Math.max(horaMax, hora)
    }
    if (c.hora_fin) {
      const horaFin = parseInt(c.hora_fin.substring(0, 2))
      horaMax = Math.max(horaMax, horaFin)
    }
  })

  // Añadir margen de 1 hora antes y después
  return {
    inicio: Math.max(HORA_INICIO_COMPLETO.value, horaMin - 1),
    fin: Math.min(HORA_FIN_COMPLETO.value, horaMax + 1)
  }
})

// Determinar horas a mostrar según el modo
const horaInicioActual = computed(() => {
  if (modoHorario.value === 'completo') return HORA_INICIO_COMPLETO.value
  if (modoHorario.value === 'activo') return rangoHorasConActividad.value.inicio
  // Modo auto: usar rango activo si hay pocas horas, sino completo
  const rango = rangoHorasConActividad.value
  const horasActivas = rango.fin - rango.inicio
  return horasActivas <= 8 ? rango.inicio : HORA_INICIO_COMPLETO.value
})

const horaFinActual = computed(() => {
  if (modoHorario.value === 'completo') return HORA_FIN_COMPLETO.value
  if (modoHorario.value === 'activo') return rangoHorasConActividad.value.fin
  // Modo auto
  const rango = rangoHorasConActividad.value
  const horasActivas = rango.fin - rango.inicio
  return horasActivas <= 8 ? rango.fin : HORA_FIN_COMPLETO.value
})

// Horas del día (dinámicas según zoom)
const horasDelDia = computed(() => {
  const horas: string[] = []
  for (let h = horaInicioActual.value; h <= horaFinActual.value; h++) {
    horas.push(`${String(h).padStart(2, '0')}:00`)
  }
  return horas
})

// Texto descriptivo del modo actual
const textoModoHorario = computed(() => {
  switch (modoHorario.value) {
    case 'activo':
      return `${horaInicioActual.value}:00 - ${horaFinActual.value}:00`
    case 'completo':
      return `${HORA_INICIO_COMPLETO.value}:00 - ${HORA_FIN_COMPLETO.value}:00`
    default:
      return 'Auto'
  }
})

// Ciclar entre modos
const ciclarModoHorario = () => {
  const modos: Array<'auto' | 'activo' | 'completo'> = ['auto', 'activo', 'completo']
  const index = modos.indexOf(modoHorario.value)
  modoHorario.value = modos[(index + 1) % modos.length]
}

// Días según vista activa
const diasVisibles = computed(() => {
  const inicio = new Date(fechaSeleccionada.value)
  const dias: Array<{ fecha: string; diaSemana: string; numeroDia: number; mes: string; esHoy: boolean }> = []
  const hoy = new Date()
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

  if (vistaActiva.value === 'dia') {
    const fechaStr = `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}-${String(inicio.getDate()).padStart(2, '0')}`
    dias.push({
      fecha: fechaStr,
      diaSemana: inicio.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase(),
      numeroDia: inicio.getDate(),
      mes: inicio.toLocaleDateString('es-ES', { month: 'short' }),
      esHoy: fechaStr === hoyStr
    })
  } else if (vistaActiva.value === '5dias') {
    for (let i = 0; i < 5; i++) {
      const fecha = new Date(inicio)
      fecha.setDate(inicio.getDate() + i)
      const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
      dias.push({
        fecha: fechaStr,
        diaSemana: fecha.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase(),
        numeroDia: fecha.getDate(),
        mes: fecha.toLocaleDateString('es-ES', { month: 'short' }),
        esHoy: fechaStr === hoyStr
      })
    }
  } else if (vistaActiva.value === 'semana') {
    const diaSemana = inicio.getDay()
    const sabado = new Date(inicio)
    sabado.setDate(inicio.getDate() - (diaSemana === 6 ? 0 : diaSemana + 1))

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(sabado)
      fecha.setDate(sabado.getDate() + i)
      const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
      dias.push({
        fecha: fechaStr,
        diaSemana: fecha.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase(),
        numeroDia: fecha.getDate(),
        mes: fecha.toLocaleDateString('es-ES', { month: 'short' }),
        esHoy: fechaStr === hoyStr
      })
    }
  } else if (vistaActiva.value === 'mes') {
    // Vista mensual: todos los días del mes actual
    const primerDiaMes = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
    const ultimoDiaMes = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0)
    const diasEnMes = ultimoDiaMes.getDate()

    for (let i = 1; i <= diasEnMes; i++) {
      const fecha = new Date(inicio.getFullYear(), inicio.getMonth(), i)
      const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
      dias.push({
        fecha: fechaStr,
        diaSemana: fecha.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase(),
        numeroDia: fecha.getDate(),
        mes: fecha.toLocaleDateString('es-ES', { month: 'short' }),
        esHoy: fechaStr === hoyStr
      })
    }
  }

  return dias
})

// Verificar si el día actual está visible en la vista
const diaActualVisible = computed(() => {
  return diasVisibles.value.some(d => d.esHoy)
})

// Obtener el índice de la columna del día actual (para posicionar la línea)
const indiceDiaActual = computed(() => {
  return diasVisibles.value.findIndex(d => d.esHoy)
})

// Título del periodo - más descriptivo con rango de fechas
const tituloPeriodo = computed(() => {
  if (vistaActiva.value === 'dia') {
    const fecha = fechaSeleccionada.value
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).replace(/^\w/, c => c.toUpperCase())
  }

  if (vistaActiva.value === 'mes') {
    const fecha = fechaSeleccionada.value
    const mesNombre = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    return mesNombre.replace(/^\w/, c => c.toUpperCase())
  }

  // Para vistas de semana/5días, mostrar rango
  const diasArr = diasVisibles.value
  if (diasArr.length === 0) return ''

  const primerDia = diasArr[0]
  const ultimoDia = diasArr[diasArr.length - 1]

  const fechaInicio = new Date(primerDia.fecha)
  const fechaFin = new Date(ultimoDia.fecha)

  const formatoInicio = fechaInicio.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  const formatoFin = fechaFin.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

  if (vistaActiva.value === '5dias') {
    return `${formatoInicio} — ${formatoFin}`
  }

  return `Semana del ${formatoInicio} — ${formatoFin}`
})

// Indicador de "Hoy" para el header
const textoHoy = computed(() => {
  const hoy = new Date()
  return hoy.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).replace(/^\w/, c => c.toUpperCase())
})

// Texto dinámico para métricas según la vista activa
const textoPeriodoMetricas = computed(() => {
  switch (vistaActiva.value) {
    case 'dia':
      return 'hoy'
    case '5dias':
      return 'estos 5 días'
    case 'mes':
      return 'este mes'
    case 'semana':
    default:
      return 'esta semana'
  }
})

// Filtrar citas
const citasFiltradas = computed(() => {
  let resultado = citas.value

  if (props.modoCoordinadora && terapeutaSeleccionado.value) {
    resultado = resultado.filter(c => c.terapeuta_id === terapeutaSeleccionado.value)
  }

  if (estadosFiltro.value.length > 0 && estadosFiltro.value.length < 4) {
    resultado = resultado.filter(c => estadosFiltro.value.includes(c.estado))
  }

  if (busqueda.value.trim()) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(c => {
      const nombre = (c.paciente?.nombre_completo || '').toLowerCase()
      const notas = (c.observaciones || '').toLowerCase()
      return nombre.includes(termino) || notas.includes(termino)
    })
  }

  return resultado
})

// Contadores por estado - DINÁMICOS según la vista activa
const contadores = computed(() => {
  // Obtener fechas de la vista actual
  const fechasVisibles = diasVisibles.value.map(d => d.fecha)

  // Filtrar citas solo de las fechas visibles
  const citasEnVista = citas.value.filter(c => fechasVisibles.includes(c.fecha_cita))

  return {
    pendiente: citasEnVista.filter(c => c.estado === 'pendiente').length,
    confirmada: citasEnVista.filter(c => c.estado === 'confirmada').length,
    realizada: citasEnVista.filter(c => c.estado === 'realizada' || c.estado === 'completada').length,
    cancelada: citasEnVista.filter(c => c.estado === 'cancelada').length
  }
})

// ============================================================================
// MÉTRICAS FINANCIERAS
// ============================================================================

/**
 * Precio por sesión por defecto (si no está definido en la cita)
 */
const PRECIO_SESION_DEFAULT = 70

/**
 * Calcula las métricas financieras de la vista actual (día, 5 días, semana)
 * Se actualiza dinámicamente al cambiar la vista o navegar
 */
const metricasFinancieras = computed(() => {
  // Obtener fechas de la vista actual
  const fechasVisibles = diasVisibles.value.map(d => d.fecha)

  // Filtrar citas solo de las fechas visibles
  const citasEnVista = citas.value.filter(c => fechasVisibles.includes(c.fecha_cita))

  // Citas realizadas - Por cobrar (realizadas pero no pagadas)
  const citasRealizadas = citasEnVista.filter(c => c.estado === 'realizada' || c.estado === 'completada')
  const citasPorCobrar = citasRealizadas.filter(c => c.estado_pago !== 'pagado')
  const montoPorCobrar = citasPorCobrar.reduce((acc, c) => {
    const precio = c.precio_sesion || c.precio || PRECIO_SESION_DEFAULT
    return acc + precio
  }, 0)

  // Citas pendientes + confirmadas (ingresos previstos)
  const citasProgramadas = citasEnVista.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada')
  const montoPrevistos = citasProgramadas.reduce((acc, c) => {
    const precio = c.precio_sesion || c.precio || PRECIO_SESION_DEFAULT
    return acc + precio
  }, 0)

  // Citas canceladas (ingresos perdidos)
  const citasCanceladas = citasEnVista.filter(c => c.estado === 'cancelada')
  const montoPerdido = citasCanceladas.reduce((acc, c) => {
    const precio = c.precio_sesion || c.precio || PRECIO_SESION_DEFAULT
    return acc + precio
  }, 0)

  // Total potencial (si no hubiera cancelaciones)
  const totalPotencial = montoPorCobrar + montoPrevistos + montoPerdido

  // Tasa de cancelación
  const totalCitas = citasEnVista.length
  const tasaCancelacion = totalCitas > 0 ? Math.round((citasCanceladas.length / totalCitas) * 100) : 0

  return {
    porCobrar: montoPorCobrar,
    previstos: montoPrevistos,
    perdido: montoPerdido,
    totalPotencial,
    tasaCancelacion,
    sesionesRealizadas: citasRealizadas.length,
    sesionesProgramadas: citasProgramadas.length,
    sesionesCanceladas: citasCanceladas.length
  }
})

/**
 * Formatea un número como moneda (EUR)
 */
const formatearMoneda = (cantidad: number): string => {
  return cantidad.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + '€'
}

// ============================================================================
// MÉTRICAS CONTEXTUALES (Ocupación, Confirmación, Tendencias)
// ============================================================================

/**
 * Calcula métricas contextuales accionables:
 * - Ocupación semanal con contexto ("puedes agendar X más")
 * - Tasa de confirmación con seguimiento
 * - Comparativa vs semana anterior
 */
const metricasContextuales = computed(() => {
  const fechasVisibles = diasVisibles.value.map(d => d.fecha)
  const citasEnVista = citas.value.filter(c => fechasVisibles.includes(c.fecha_cita))

  // Horas disponibles basadas en la configuración del terapeuta
  let horasDisponibles = 0
  diasVisibles.value.forEach(dia => {
    const horario = obtenerHorarioEfectivo(dia.fecha)
    if (horario) {
      // Calcular horas de mañana
      const [hInicioM, mInicioM] = horario.inicio_manana.split(':').map(Number)
      const [hFinM, mFinM] = horario.fin_manana.split(':').map(Number)
      const minutosManana = (hFinM * 60 + mFinM) - (hInicioM * 60 + mInicioM)

      // Calcular horas de tarde
      const [hInicioT, mInicioT] = horario.inicio_tarde.split(':').map(Number)
      const [hFinT, mFinT] = horario.fin_tarde.split(':').map(Number)
      const minutosTarde = (hFinT * 60 + mFinT) - (hInicioT * 60 + mInicioT)

      horasDisponibles += (minutosManana + minutosTarde) / 60
    }
  })

  // Horas ocupadas (suma de duración de citas no canceladas)
  const minutosOcupados = citasEnVista
    .filter(c => c.estado !== 'cancelada')
    .reduce((acc, c) => {
      // Calcular duración desde hora_inicio y hora_fin
      if (c.hora_inicio && c.hora_fin) {
        const [hI, mI] = c.hora_inicio.split(':').map(Number)
        const [hF, mF] = c.hora_fin.split(':').map(Number)
        return acc + ((hF * 60 + mF) - (hI * 60 + mI))
      }
      return acc + 60 // Default 1 hora
    }, 0)
  const horasOcupadas = minutosOcupados / 60

  // Ocupación
  const ocupacion = horasDisponibles > 0
    ? Math.round((horasOcupadas / horasDisponibles) * 100)
    : 0
  const horasLibres = Math.max(0, horasDisponibles - horasOcupadas)
  const citasAdicionales = Math.floor(horasLibres) // 1h por cita aprox

  // Tasa de confirmación
  const pendientes = contadores.value.pendiente
  const confirmadas = contadores.value.confirmada
  const totalProgramadas = pendientes + confirmadas
  const tasaConfirmacion = totalProgramadas > 0
    ? Math.round((confirmadas / totalProgramadas) * 100)
    : 100

  // Comparativa semana anterior (solo en vista semana)
  let diferenciaSemanaAnterior = 0
  let tendencia: 'up' | 'down' | 'neutral' = 'neutral'

  if (vistaActiva.value === 'semana') {
    // Calcular fechas de semana pasada
    const primerDiaVista = diasVisibles.value[0]?.fecha
    if (primerDiaVista) {
      const fechaInicio = new Date(primerDiaVista + 'T00:00:00')
      const fechaInicioAnterior = new Date(fechaInicio)
      fechaInicioAnterior.setDate(fechaInicioAnterior.getDate() - 7)
      const fechaFinAnterior = new Date(fechaInicio)
      fechaFinAnterior.setDate(fechaFinAnterior.getDate() - 1)

      const citasSemanaAnterior = citas.value.filter(c => {
        const fechaCita = new Date(c.fecha_cita + 'T00:00:00')
        return fechaCita >= fechaInicioAnterior &&
               fechaCita <= fechaFinAnterior &&
               c.estado !== 'cancelada'
      })

      const minutosAnterior = citasSemanaAnterior.reduce((acc, c) => {
        if (c.hora_inicio && c.hora_fin) {
          const [hI, mI] = c.hora_inicio.split(':').map(Number)
          const [hF, mF] = c.hora_fin.split(':').map(Number)
          return acc + ((hF * 60 + mF) - (hI * 60 + mI))
        }
        return acc + 60
      }, 0)

      const ocupacionAnterior = horasDisponibles > 0
        ? Math.round((minutosAnterior / 60 / horasDisponibles) * 100)
        : 0

      diferenciaSemanaAnterior = ocupacion - ocupacionAnterior
      tendencia = diferenciaSemanaAnterior > 0 ? 'up' : diferenciaSemanaAnterior < 0 ? 'down' : 'neutral'
    }
  }

  return {
    ocupacion,
    horasLibres: Math.round(horasLibres * 10) / 10,
    citasAdicionales,
    tasaConfirmacion,
    pendientesRequierenSeguimiento: pendientes,
    diferenciaSemanaAnterior,
    tendencia
  }
})

// ============================================================================
// REVISAR NOTAS ÚLTIMA SESIÓN
// ============================================================================

/**
 * Abre el modal con las notas de la última sesión completada del paciente.
 * Útil para preparar la próxima cita revisando contexto anterior.
 */
const abrirNotasUltimaSesion = async (pacienteId: string) => {
  if (!pacienteId) return

  cargandoNotas.value = true
  mostrarModalNotas.value = true
  notasUltimaSesion.value = null

  try {
    // Buscar última cita realizada/completada del paciente
    const { data, error } = await supabase
      .from('citas')
      .select(`
        id,
        fecha_cita,
        hora_inicio,
        hora_fin,
        notas_terapeuta,
        observaciones,
        estado,
        paciente:pacientes(id, nombre_completo)
      `)
      .eq('paciente_id', pacienteId)
      .in('estado', ['realizada', 'completada'])
      .order('fecha_cita', { ascending: false })
      .order('hora_inicio', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    notasUltimaSesion.value = data
  } catch (err) {
    console.error('Error cargando notas última sesión:', err)
    showToast('Error al cargar las notas', 'error')
  } finally {
    cargandoNotas.value = false
  }
}

const cerrarModalNotas = () => {
  mostrarModalNotas.value = false
  notasUltimaSesion.value = null
}

// ============================================================================
// SUGERENCIAS INTELIGENTES
// ============================================================================

interface Sugerencia {
  id: string
  tipo: 'hueco_disponible' | 'dia_libre' | 'alta_ocupacion'
  mensaje: string
  accion?: string
  prioridad: 'alta' | 'media' | 'baja'
  fecha?: string
}

/**
 * Detecta huecos y genera sugerencias accionables.
 * - Días con pocos pacientes (oportunidad de agendar)
 * - Días muy ocupados (posible sobrecarga)
 */
const sugerenciasInteligentes = computed((): Sugerencia[] => {
  const sugerencias: Sugerencia[] = []
  const fechasVisibles = diasVisibles.value.map(d => d.fecha)

  // Solo generar sugerencias para fechas futuras o de hoy
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const hoyStr = hoy.toISOString().split('T')[0]

  fechasVisibles.forEach(fecha => {
    // Solo fechas futuras o hoy
    if (fecha < hoyStr) return

    // Excluir fines de semana
    const fechaObj = new Date(fecha + 'T00:00:00')
    const diaSemana = fechaObj.getDay()
    if (diaSemana === 0 || diaSemana === 6) return

    const citasDelDia = citas.value
      .filter(c => c.fecha_cita === fecha && c.estado !== 'cancelada')
      .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))

    const nombreDia = fechaObj.toLocaleDateString('es-ES', { weekday: 'long' })
    const diaFormateado = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

    // Día con pocas citas (menos de 3) = oportunidad
    if (citasDelDia.length < 3 && citasDelDia.length > 0) {
      sugerencias.push({
        id: `hueco-${fecha}`,
        tipo: 'hueco_disponible',
        mensaje: `${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} ${diaFormateado}: ${8 - citasDelDia.length}h disponibles`,
        accion: 'Agendar cita',
        prioridad: 'media',
        fecha
      })
    }

    // Día completamente libre
    if (citasDelDia.length === 0) {
      sugerencias.push({
        id: `libre-${fecha}`,
        tipo: 'dia_libre',
        mensaje: `${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} ${diaFormateado}: día sin citas`,
        accion: 'Agendar cita',
        prioridad: 'baja',
        fecha
      })
    }

    // Día muy ocupado (7+ citas)
    if (citasDelDia.length >= 7) {
      sugerencias.push({
        id: `ocupado-${fecha}`,
        tipo: 'alta_ocupacion',
        mensaje: `${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} ${diaFormateado}: ${citasDelDia.length} citas programadas`,
        prioridad: 'alta',
        fecha
      })
    }
  })

  // Ordenar por prioridad y limitar a 3
  const prioridadOrden = { alta: 0, media: 1, baja: 2 }
  return sugerencias
    .sort((a, b) => prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad])
    .slice(0, 3)
})

// Estado para mostrar/ocultar panel de sugerencias
const mostrarSugerencias = ref(true)

// Función para navegar a fecha desde sugerencia
const navegarASugerencia = (sugerencia: Sugerencia) => {
  if (sugerencia.fecha) {
    const [year, month, day] = sugerencia.fecha.split('-').map(Number)
    fechaSeleccionada.value = new Date(year, month - 1, day)
    if (sugerencia.accion === 'Agendar cita') {
      vistaActiva.value = 'dia'
    }
  }
}

// ============================================================================
// BLOQUES "NO DISPONIBLE" (localStorage)
// ============================================================================

interface BloqueNoDisponible {
  fecha: string
  hora_inicio: string
  hora_fin: string
  nota?: string
}

// Estado de bloques no disponibles
const bloquesNoDisponible = ref<BloqueNoDisponible[]>([])

// Cargar bloques desde localStorage al montar
onMounted(() => {
  const savedBloques = localStorage.getItem('agenda-bloques-no-disponible')
  if (savedBloques) {
    try {
      bloquesNoDisponible.value = JSON.parse(savedBloques)
    } catch (e) {
      console.error('Error parsing bloques:', e)
    }
  }
})

// Guardar bloques cuando cambian
watch(bloquesNoDisponible, (val) => {
  localStorage.setItem('agenda-bloques-no-disponible', JSON.stringify(val))
}, { deep: true })

/**
 * Verifica si un slot está bloqueado como "No disponible"
 * Incluye: bloques manuales (localStorage) + vacaciones/bloqueos de configuración
 */
const getBloqueEnSlot = (fecha: string, hora: string): BloqueNoDisponible | undefined => {
  // 1. Verificar bloqueos de vacaciones/festivos desde la configuración
  const bloqueoVacaciones = estaBloqueda(fecha)
  if (bloqueoVacaciones) {
    return {
      fecha,
      hora_inicio: '00:00',
      hora_fin: '23:59',
      nota: bloqueoVacaciones.descripcion || (bloqueoVacaciones.tipo === 'vacaciones' ? 'Vacaciones' : bloqueoVacaciones.tipo)
    }
  }

  // 2. Verificar si es un día cerrado por horario personalizado
  const horarioEfectivo = obtenerHorarioEfectivo(fecha)
  if (horarioEfectivo === null) {
    // Día completamente cerrado (no laborable o marcado como cerrado)
    return {
      fecha,
      hora_inicio: '00:00',
      hora_fin: '23:59',
      nota: 'Día no laborable'
    }
  }

  // 3. Verificar bloques manuales (localStorage)
  const horaNum = parseInt(hora.substring(0, 2))
  return bloquesNoDisponible.value.find(b => {
    if (b.fecha !== fecha) return false
    const inicioNum = parseInt(b.hora_inicio.substring(0, 2))
    const finNum = parseInt(b.hora_fin.substring(0, 2))
    return horaNum >= inicioNum && horaNum < finNum
  })
}

/**
 * Toggle para marcar/desmarcar un slot como "No disponible"
 * Solo se activa con Ctrl+Clic o doble clic derecho
 */
const toggleBloqueSlot = (fecha: string, hora: string, event?: MouseEvent) => {
  // Solo con Ctrl+Click
  if (event && !event.ctrlKey && !event.metaKey) return

  const horaFormateada = hora.length === 4 ? `0${hora}` : hora
  const horaFinNum = parseInt(horaFormateada.substring(0, 2)) + 1
  const horaFin = `${horaFinNum.toString().padStart(2, '0')}:00`

  const existe = bloquesNoDisponible.value.find(
    b => b.fecha === fecha && b.hora_inicio === horaFormateada
  )

  if (existe) {
    // Eliminar bloque
    bloquesNoDisponible.value = bloquesNoDisponible.value.filter(
      b => !(b.fecha === fecha && b.hora_inicio === horaFormateada)
    )
    showToast('Bloque eliminado', 'info')
  } else {
    // Crear bloque
    bloquesNoDisponible.value.push({
      fecha,
      hora_inicio: horaFormateada,
      hora_fin: horaFin
    })
    showToast('Hora marcada como no disponible', 'info')
  }
}

// Modo edición de bloques (para facilitar el marcado)
const modoEditarBloques = ref(false)

// ============================================================================
// FUNCIONES PARA VISTA MENSUAL
// ============================================================================

/**
 * Calcula el día de la semana del primer día del mes (0=Domingo, 1=Lunes, etc.)
 * Ajustado para que Lunes sea 0
 */
const primerDiaSemanaDelMes = computed(() => {
  const fecha = fechaSeleccionada.value
  const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
  const diaSemana = primerDia.getDay()
  // Convertir de Domingo=0 a Lunes=0
  return diaSemana === 0 ? 6 : diaSemana - 1
})

/**
 * Obtiene las citas de un día específico
 */
const getCitasDelDia = (fecha: string) => {
  return citasFiltradas.value.filter(c => c.fecha_cita === fecha)
}

/**
 * Colores para estados de citas en vista mensual
 */
const getColorEstadoCitaMes = (estado: string): string => {
  switch (estado) {
    case 'pendiente':
      return 'bg-amber-100 text-amber-700'
    case 'confirmada':
      return 'bg-emerald-100 text-emerald-700'
    case 'realizada':
    case 'completada':
      return 'bg-blue-100 text-blue-700'
    case 'cancelada':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

/**
 * Colores para dots de citas en vista mensual móvil
 */
const getColorEstadoCitaMesDot = (estado: string): string => {
  switch (estado) {
    case 'pendiente':
      return 'bg-amber-500'
    case 'confirmada':
      return 'bg-emerald-500'
    case 'realizada':
    case 'completada':
      return 'bg-blue-500'
    case 'cancelada':
      return 'bg-red-400'
    default:
      return 'bg-gray-400'
  }
}

/**
 * Seleccionar un día en la vista mensual - cambia a vista de día
 */
const seleccionarDiaMes = (fechaStr: string) => {
  const [year, month, day] = fechaStr.split('-').map(Number)
  fechaSeleccionada.value = new Date(year, month - 1, day)
  vistaActiva.value = 'dia'
}

// Obtener citas por día y hora (slot de 1 hora incluye :00 y :30)
const citasPorDiaHora = (fecha: string, hora: string) => {
  const horaSlot = parseInt(hora.substring(0, 2))
  return citasFiltradas.value.filter(c => {
    if (c.fecha_cita !== fecha) return false
    const horaInicio = c.hora_inicio?.substring(0, 5)
    if (!horaInicio) return false
    const horaCita = parseInt(horaInicio.substring(0, 2))
    // La cita pertenece a este slot si su hora coincide (incluye :00 y :30)
    return horaCita === horaSlot
  })
}

/**
 * Calcula el offset vertical de una cita dentro del slot de 1 hora
 * Si la cita empieza a :30, aparece a mitad del slot
 */
const calcularOffsetCita = (cita: any): number => {
  const horaInicio = cita.hora_inicio?.substring(0, 5)
  if (!horaInicio) return 0
  const minutos = parseInt(horaInicio.substring(3, 5))
  // Si empieza a :30, el offset es mitad del slot (44px)
  return (minutos / 60) * SLOT_HEIGHT_PX
}

/**
 * Calcula la altura visual de una cita basada en su duración
 * @param cita - La cita con duracion_minutos
 * @returns altura en píxeles
 */
const calcularAlturaCita = (cita: any): number => {
  // Por defecto, usar duración de 60 minutos si no está definida
  const duracion = cita.duracion_minutos || 60
  // Cada 60 minutos = SLOT_HEIGHT_PX (88px)
  // Entonces 60 min = 88px, 90 min = 132px, etc.
  const altura = (duracion / MINUTOS_POR_SLOT) * SLOT_HEIGHT_PX
  // Mínimo 40px para que se vea contenido
  return Math.max(altura - 4, 40) // -4px para margin/padding
}

/**
 * Calcula cuántos slots ocupa una cita (para z-index y overflow)
 */
const slotsOcupados = (cita: any): number => {
  const duracion = cita.duracion_minutos || 60
  return Math.ceil(duracion / MINUTOS_POR_SLOT)
}

// ============================================================================
// INDICADOR DE HORA ACTUAL
// ============================================================================

const horaActual = ref(new Date())

// Referencia al contenedor del grid de horas
const gridHorasRef = ref<HTMLElement | null>(null)
const scrollContainerRef = ref<HTMLElement | null>(null)

// Referencia al indicador de hora actual para scroll
const nowIndicatorRef = ref<HTMLElement | null>(null)

/**
 * Calcula la posición vertical (en píxeles) del indicador de hora actual
 * basándose en la hora actual y la configuración del grid.
 *
 * Fórmula: posición = (minutosDesdeInicio / minutosTotal) * alturaTotal
 * donde minutosDesdeInicio = (hora - horaInicio) * 60 + minutos
 */
const posicionHoraActual = computed(() => {
  const ahora = horaActual.value
  const horas = ahora.getHours()
  const minutos = ahora.getMinutes()

  // Solo mostrar si está dentro del rango visible (dinámico según zoom)
  if (horas < horaInicioActual.value || horas >= horaFinActual.value) return null

  // Calcular el tiempo total en minutos desde el inicio de la agenda
  const minutosDesdeInicio = (horas - horaInicioActual.value) * 60 + minutos

  // Calcular la posición proporcional
  // Cada slot de 30 minutos tiene SLOT_HEIGHT_PX de altura
  const posicion = (minutosDesdeInicio / MINUTOS_POR_SLOT) * SLOT_HEIGHT_PX

  return posicion
})

/**
 * Formatea la hora actual para mostrar en el chip
 */
const horaActualFormateada = computed(() => {
  return horaActual.value.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
})

/**
 * Determina si un slot de hora ya ha pasado (para sombreado)
 */
const esHoraPasada = (hora: string, fecha: string): boolean => {
  const hoy = new Date()
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

  // Si no es hoy, no aplicar sombreado
  if (fecha !== hoyStr) return false

  // Parsear la hora del slot
  const [horaSlot, minutosSlot] = hora.split(':').map(Number)
  const ahora = horaActual.value

  // Comparar: el slot ha pasado si su hora de FIN (slot + 30min) es menor o igual a la hora actual
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes()
  const minutosSlotFin = horaSlot * 60 + minutosSlot + MINUTOS_POR_SLOT

  return minutosSlotFin <= minutosActuales
}

/**
 * Determina si un slot es el slot actual (para destacarlo)
 */
const esSlotActual = (hora: string, fecha: string): boolean => {
  const hoy = new Date()
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

  if (fecha !== hoyStr) return false

  const [horaSlot, minutosSlot] = hora.split(':').map(Number)
  const ahora = horaActual.value
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes()
  const minutosSlotInicio = horaSlot * 60 + minutosSlot
  const minutosSlotFin = minutosSlotInicio + MINUTOS_POR_SLOT

  return minutosActuales >= minutosSlotInicio && minutosActuales < minutosSlotFin
}

// ============================================================================
// BARRA DE PROGRESO DEL DÍA LABORAL
// ============================================================================

/**
 * Calcula el porcentaje del día laboral transcurrido
 * Rango dinámico según el modo de zoom activo
 */
const progresoDiaLaboral = computed(() => {
  const ahora = horaActual.value
  const horas = ahora.getHours()
  const minutos = ahora.getMinutes()

  // Si es antes del inicio, 0%
  if (horas < horaInicioActual.value) return 0

  // Si es después del fin, 100%
  if (horas >= horaFinActual.value) return 100

  // Calcular progreso
  const minutosDesdeInicio = (horas - horaInicioActual.value) * 60 + minutos
  const minutosTotales = (horaFinActual.value - horaInicioActual.value) * 60

  return Math.round((minutosDesdeInicio / minutosTotales) * 100)
})

// ============================================================================
// SCROLL Y NAVEGACIÓN
// ============================================================================

/**
 * Navega al día actual y hace scroll suave hacia la hora actual
 */
const irAhora = async () => {
  // Primero, asegurarse de que estamos en el día actual
  fechaSeleccionada.value = new Date()

  // Esperar a que el DOM se actualice
  await nextTick()

  // Hacer scroll hacia el indicador de hora actual
  scrollHaciaHoraActual()
}

/**
 * Hace scroll suave hacia el indicador de hora actual
 */
const scrollHaciaHoraActual = () => {
  if (!scrollContainerRef.value || posicionHoraActual.value === null) return

  const container = scrollContainerRef.value
  const containerHeight = container.clientHeight

  // Calcular la posición de scroll para centrar el indicador
  const scrollTarget = posicionHoraActual.value - (containerHeight / 2) + SLOT_HEIGHT_PX

  container.scrollTo({
    top: Math.max(0, scrollTarget),
    behavior: 'smooth'
  })
}

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

// ============================================================================
// ESTADOS DE CITAS CON DIFERENCIACIÓN VISUAL
// ============================================================================

interface EstadoVisual {
  bg: string
  border: string
  text: string
  dot: string
  icon: string // Nombre del icono SVG
  label: string
  badge: string // Clases para badge
}

/**
 * Determina el estado visual de una cita considerando:
 * - Estado base (pendiente, confirmada, realizada, cancelada)
 * - Estados intermedios (próxima, requiere_confirmacion)
 */
const getEstadoVisualCita = (cita: any): { estado: string; esUrgente: boolean; esInminente: boolean } => {
  const ahora = new Date()
  const fechaCita = new Date(`${cita.fecha_cita}T${cita.hora_inicio || '00:00'}`)
  const diffHoras = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60)

  // Estado base
  let estado = cita.estado || 'pendiente'
  let esUrgente = false
  let esInminente = false

  // Si está pendiente y es dentro de 48 horas -> Requiere confirmación
  if (estado === 'pendiente' && diffHoras > 0 && diffHoras <= 48) {
    estado = 'requiere_confirmacion'
    esUrgente = true
  }

  // Si está confirmada y es dentro de 24 horas -> Próxima
  if (estado === 'confirmada' && diffHoras > 0 && diffHoras <= 24) {
    estado = 'proxima'
    esInminente = true
  }

  // Si está confirmada y es dentro de 2 horas -> Inminente
  if (estado === 'confirmada' && diffHoras > 0 && diffHoras <= 2) {
    estado = 'inminente'
    esInminente = true
  }

  return { estado, esUrgente, esInminente }
}

/**
 * Obtener estilos visuales según estado (incluyendo estados intermedios)
 */
const getColorEstado = (estado: string): EstadoVisual => {
  const estilos: Record<string, EstadoVisual> = {
    // Estado: Pendiente (amarillo/naranja)
    pendiente: {
      bg: 'bg-amber-50',
      border: 'border-l-amber-400',
      text: 'text-amber-700',
      dot: 'bg-amber-400',
      icon: 'clock',
      label: 'Pendiente',
      badge: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    // Estado intermedio: Requiere confirmación (naranja intenso)
    requiere_confirmacion: {
      bg: 'bg-orange-50',
      border: 'border-l-orange-500',
      text: 'text-orange-700',
      dot: 'bg-orange-500',
      icon: 'exclamation',
      label: 'Confirmar',
      badge: 'bg-orange-100 text-orange-700 border-orange-300 animate-pulse'
    },
    // Estado: Confirmada (verde)
    confirmada: {
      bg: 'bg-emerald-50',
      border: 'border-l-emerald-400',
      text: 'text-emerald-700',
      dot: 'bg-emerald-400',
      icon: 'check',
      label: 'Confirmada',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    },
    // Estado intermedio: Próxima (verde intenso)
    proxima: {
      bg: 'bg-green-50',
      border: 'border-l-green-500',
      text: 'text-green-700',
      dot: 'bg-green-500',
      icon: 'arrow-right',
      label: 'Próxima',
      badge: 'bg-green-100 text-green-700 border-green-300'
    },
    // Estado intermedio: Inminente (verde con pulso)
    inminente: {
      bg: 'bg-teal-50',
      border: 'border-l-teal-500',
      text: 'text-teal-700',
      dot: 'bg-teal-500',
      icon: 'bolt',
      label: 'Ahora',
      badge: 'bg-teal-100 text-teal-700 border-teal-300 ring-2 ring-teal-300 ring-opacity-50'
    },
    // Estado: Realizada (azul)
    realizada: {
      bg: 'bg-blue-50',
      border: 'border-l-blue-400',
      text: 'text-blue-700',
      dot: 'bg-blue-400',
      icon: 'check-circle',
      label: 'Realizada',
      badge: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    completada: {
      bg: 'bg-blue-50',
      border: 'border-l-blue-400',
      text: 'text-blue-700',
      dot: 'bg-blue-400',
      icon: 'check-circle',
      label: 'Completada',
      badge: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    // Estado: Cancelada (gris/rojo suave)
    cancelada: {
      bg: 'bg-gray-50',
      border: 'border-l-gray-400',
      text: 'text-gray-500',
      dot: 'bg-gray-400',
      icon: 'x-circle',
      label: 'Cancelada',
      badge: 'bg-gray-100 text-gray-500 border-gray-200'
    }
  }
  return estilos[estado] || estilos.pendiente
}

/**
 * Obtener estado visual completo de una cita (estado + estilos)
 */
const getEstiloCompletoCita = (cita: any) => {
  const { estado, esUrgente, esInminente } = getEstadoVisualCita(cita)
  const estilos = getColorEstado(estado)
  return { ...estilos, estadoReal: estado, esUrgente, esInminente }
}

// Click en slot vacío
const handleSlotClick = async (fecha: string, hora: string) => {
  console.log('[AgendaCalendario] Click en slot:', { fecha, hora })
  fechaPreseleccionada.value = fecha
  horaPreseleccionada.value = hora
  console.log('[AgendaCalendario] Valores establecidos:', {
    fechaPreseleccionada: fechaPreseleccionada.value,
    horaPreseleccionada: horaPreseleccionada.value
  })
  // Esperar a que Vue procese los cambios de props antes de abrir el modal
  await nextTick()
  mostrarModalNuevaCita.value = true
}

// Click en slot con soporte para bloques (Ctrl+Click para toggle bloque)
const handleSlotClickConBloques = async (fecha: string, hora: string, event: MouseEvent) => {
  // Si es Ctrl+Click o Cmd+Click, toggle bloque
  if (event.ctrlKey || event.metaKey) {
    toggleBloqueSlot(fecha, hora)
    return
  }

  // Si el slot está bloqueado, no hacer nada
  if (getBloqueEnSlot(fecha, hora)) {
    return
  }

  // Si no hay citas, abrir modal para crear
  if (citasPorDiaHora(fecha, hora).length === 0) {
    await handleSlotClick(fecha, hora)
  }
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

const cerrarModalCancelar = () => {
  mostrarModalCancelar.value = false
  citaParaCancelar.value = null
  motivoCancelacion.value = ''
}

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

const cerrarModalReprogramar = () => {
  mostrarModalReprogramar.value = false
  citaParaReprogramar.value = null
  reprogramarNuevaFecha.value = ''
  reprogramarNuevaHoraInicio.value = ''
  reprogramarNuevaHoraFin.value = ''
}

// ============================================================================
// ELIMINAR CITA
// ============================================================================

const handleAbrirModalEliminar = (citaId: string, event: Event) => {
  event.stopPropagation()
  const cita = citas.value.find(c => c.id === citaId)
  if (!cita) {
    showToast('Cita no encontrada', 'error')
    return
  }

  citaParaEliminar.value = cita
  mostrarModalEliminar.value = true
}

const ejecutarEliminacion = async () => {
  if (!citaParaEliminar.value || citaEliminandoId.value) return

  citaEliminandoId.value = citaParaEliminar.value.id

  try {
    const result = await deleteAppointment(citaParaEliminar.value.id)
    if (result.success) {
      showToast('Cita eliminada correctamente', 'success')
      cerrarModalEliminar()
    } else {
      showToast(result.error || 'Error al eliminar la cita', 'error')
    }
  } catch (err: any) {
    showToast(err.message || 'Error al eliminar la cita', 'error')
  } finally {
    citaEliminandoId.value = null
  }
}

const cerrarModalEliminar = () => {
  mostrarModalEliminar.value = false
  citaParaEliminar.value = null
}

// ============================================================================
// LIFECYCLE Y TIMERS
// ============================================================================

let intervaloHora: ReturnType<typeof setInterval> | null = null

// Manejar visibilidad de la pestaña para evitar que el indicador se desactualice
const handleVisibilityChange = () => {
  if (!document.hidden) {
    // La pestaña volvió a estar activa, actualizar la hora
    horaActual.value = new Date()
  }
}

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

  // Escuchar cambios de visibilidad de la pestaña
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Scroll inicial hacia la hora actual si es hoy
  await nextTick()
  if (diaActualVisible.value && posicionHoraActual.value !== null) {
    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      scrollHaciaHoraActual()
    }, 300)
  }
})

onUnmounted(() => {
  if (intervaloHora) clearInterval(intervaloHora)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// Watch para scroll automático cuando se cambia a una vista que incluye el día actual
watch([vistaActiva, fechaSeleccionada], async () => {
  await nextTick()
  if (diaActualVisible.value && posicionHoraActual.value !== null) {
    setTimeout(() => {
      scrollHaciaHoraActual()
    }, 100)
  }
})
</script>

<template>
  <div class="agenda-calendario min-h-screen bg-gray-50/50">
    <!-- ================================================================= -->
    <!-- HEADER COMPACTO: Todo en una sola barra -->
    <!-- ================================================================= -->
    <div class="bg-white border-b border-gray-100 px-2 sm:px-4 py-2">
      <div class="flex items-center justify-between gap-2 sm:gap-3">
        <!-- Navegación izquierda -->
        <div class="flex items-center gap-1 sm:gap-2">
          <button
            @click="navegarFecha(-1)"
            class="w-8 h-8 sm:w-8 sm:h-8 min-h-[36px] min-w-[36px] rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
            aria-label="Semana anterior"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            @click="irHoy"
            class="px-2 sm:px-3 py-1 min-h-[36px] rounded-full border border-violet-500 text-violet-600 font-medium text-xs sm:text-sm hover:bg-violet-50 transition-all"
          >
            Hoy
          </button>

          <button
            v-if="diaActualVisible && posicionHoraActual !== null"
            @click="irAhora"
            class="px-2 py-1 rounded-full bg-red-500 text-white font-medium text-xs hover:bg-red-600 transition-all flex items-center gap-1"
            title="Ir a la hora actual"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ahora
          </button>

          <button
            @click="navegarFecha(1)"
            class="w-8 h-8 min-h-[36px] min-w-[36px] rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
            aria-label="Semana siguiente"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Título del periodo + Indicador de Hoy -->
          <div class="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-2">
            <h1 class="text-sm sm:text-base font-semibold text-gray-800 truncate max-w-[100px] sm:max-w-none">
              {{ tituloPeriodo }}
            </h1>
            <!-- Badge "Hoy" cuando el día actual está visible - oculto en móvil pequeño -->
            <div v-if="diaActualVisible" class="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-violet-50 border border-violet-200 rounded-full">
              <div class="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
              <span class="text-xs font-medium text-violet-700">Hoy, {{ textoHoy }}</span>
            </div>
          </div>

          <!-- Barra de progreso del día (solo si es hoy) - oculta en móvil -->
          <div v-if="diaActualVisible" class="hidden md:flex items-center gap-1.5 ml-2">
            <div class="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-1000"
                :style="{ width: `${progresoDiaLaboral}%` }"
              ></div>
            </div>
            <span class="text-xs text-gray-400">{{ progresoDiaLaboral }}%</span>
          </div>
        </div>

        <!-- Centro: Buscador compacto - oculto en móvil muy pequeño -->
        <div class="hidden sm:flex flex-1 max-w-xs md:max-w-md mx-2 md:mx-4">
          <div class="relative w-full">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar paciente..."
              class="w-full min-h-[40px] pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
            />
          </div>
        </div>

        <!-- Derecha: Vista + Filtros + Nueva Cita -->
        <div class="flex items-center gap-1 sm:gap-2">
          <!-- Selector de vista compacto -->
          <div class="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              v-for="vista in [
                { key: 'dia', label: 'D' },
                { key: '5dias', label: '5D' },
                { key: 'semana', label: 'S' },
                { key: 'mes', label: 'M' }
              ]"
              :key="vista.key"
              @click="vistaActiva = vista.key as any"
              class="px-2 sm:px-2.5 py-1 min-h-[32px] rounded-md text-xs font-medium transition-all"
              :class="vistaActiva === vista.key
                ? 'bg-violet-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'"
              :title="vista.key === 'dia' ? 'Día' : vista.key === '5dias' ? '5 Días' : vista.key === 'semana' ? 'Semana' : 'Mes'"
            >
              {{ vista.label }}
            </button>
          </div>

          <!-- Toggle Zoom Horario (solo visible en vistas no mensuales) - oculto en móvil pequeño -->
          <button
            v-if="vistaActiva !== 'mes'"
            @click="ciclarModoHorario"
            class="hidden xs:flex items-center gap-1.5 px-2 py-1.5 min-h-[36px] rounded-lg border text-xs font-medium transition-all"
            :class="{
              'bg-violet-50 border-violet-300 text-violet-700': modoHorario === 'activo',
              'bg-amber-50 border-amber-300 text-amber-700': modoHorario === 'auto',
              'bg-gray-100 border-gray-200 text-gray-600': modoHorario === 'completo'
            }"
            :title="`Modo horario: ${modoHorario === 'auto' ? 'Automático' : modoHorario === 'activo' ? 'Solo horas activas' : 'Día completo'}`"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            <span class="hidden sm:inline">{{ textoModoHorario }}</span>
          </button>

          <!-- Filtros toggle -->
          <button
            @click="mostrarFiltros = !mostrarFiltros"
            class="p-1.5 min-h-[36px] min-w-[36px] rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center"
            :class="{ 'bg-violet-50 border-violet-300 text-violet-600': mostrarFiltros }"
            title="Filtros"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>

          <!-- Botón Nueva Cita - Más descriptivo -->
          <button
            @click="mostrarModalNuevaCita = true"
            class="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 min-h-[36px] bg-violet-500 text-white font-medium text-sm rounded-lg hover:bg-violet-600 shadow-sm transition-all"
            title="Agendar nueva cita (doble clic en hora vacía para crear rápido)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="hidden sm:inline">+ Cita</span>
            <span class="sm:hidden">+</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- PANEL DE MÉTRICAS: Simplificado - Solo lo accionable -->
    <!-- ================================================================= -->
    <div class="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-3 sm:px-4 py-2 sm:py-2.5">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">

        <!-- ============ MÉTRICAS PRINCIPALES (Izquierda) ============ -->
        <div class="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 sm:mx-0 sm:px-0 pb-1 sm:pb-0">
          <!-- Pendientes - Accionable -->
          <button
            @click="toggleEstado('pendiente')"
            class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg border transition-all min-h-[40px] flex-shrink-0"
            :class="estadosFiltro.includes('pendiente')
              ? 'bg-amber-50 border-amber-200'
              : 'bg-white border-gray-200 opacity-60 hover:opacity-100'"
          >
            <div class="w-5 sm:w-6 h-5 sm:h-6 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-left">
              <p class="text-sm sm:text-base font-bold text-amber-700 leading-none">{{ contadores.pendiente }}</p>
              <p class="text-[8px] sm:text-[9px] text-amber-600/70 font-medium hidden xs:block">Pendientes</p>
            </div>
          </button>

          <!-- Confirmadas - Accionable -->
          <button
            @click="toggleEstado('confirmada')"
            class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg border transition-all min-h-[40px] flex-shrink-0"
            :class="estadosFiltro.includes('confirmada')
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-white border-gray-200 opacity-60 hover:opacity-100'"
          >
            <div class="w-5 sm:w-6 h-5 sm:h-6 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="text-left">
              <p class="text-sm sm:text-base font-bold text-emerald-700 leading-none">{{ contadores.confirmada }}</p>
              <p class="text-[8px] sm:text-[9px] text-emerald-600/70 font-medium hidden xs:block">Confirmadas</p>
            </div>
          </button>

          <!-- Separador sutil - ocultar en móvil -->
          <div class="w-px h-8 bg-gray-200 hidden sm:block"></div>

          <!-- Ocupación con contexto - simplificado en móvil -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 flex-shrink-0">
            <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span class="text-xs font-bold text-purple-700">{{ metricasContextuales.ocupacion }}%</span>
            </div>
            <div class="text-left">
              <p class="text-xs font-medium text-purple-700">Ocupación</p>
              <p class="text-[10px] text-purple-500">
                {{ metricasContextuales.citasAdicionales > 0
                  ? `Puedes agendar ${metricasContextuales.citasAdicionales} más`
                  : 'Agenda completa' }}
              </p>
            </div>
            <!-- Tendencia vs semana anterior -->
            <div
              v-if="vistaActiva === 'semana' && metricasContextuales.diferenciaSemanaAnterior !== 0"
              class="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
              :class="metricasContextuales.tendencia === 'up'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'"
            >
              <span>{{ metricasContextuales.tendencia === 'up' ? '↑' : '↓' }}</span>
              <span>{{ Math.abs(metricasContextuales.diferenciaSemanaAnterior) }}%</span>
            </div>
          </div>

          <!-- Ocupación compacta para móvil -->
          <div class="flex sm:hidden items-center gap-1.5 px-2 py-1.5 rounded-lg bg-purple-50 border border-purple-200 flex-shrink-0 min-h-[40px]">
            <span class="text-xs font-bold text-purple-700">{{ metricasContextuales.ocupacion }}%</span>
          </div>

          <!-- Tasa de confirmación - ocultar en móvil -->
          <div
            class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border flex-shrink-0"
            :class="metricasContextuales.tasaConfirmacion >= 80
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-amber-50 border-amber-200'"
          >
            <span
              class="text-sm font-bold"
              :class="metricasContextuales.tasaConfirmacion >= 80 ? 'text-emerald-700' : 'text-amber-700'"
            >
              {{ metricasContextuales.tasaConfirmacion }}%
            </span>
            <div class="text-left">
              <p
                class="text-xs font-medium"
                :class="metricasContextuales.tasaConfirmacion >= 80 ? 'text-emerald-700' : 'text-amber-700'"
              >
                Confirmación
              </p>
              <p
                v-if="metricasContextuales.pendientesRequierenSeguimiento > 0"
                class="text-[10px] text-amber-600"
              >
                {{ metricasContextuales.pendientesRequierenSeguimiento }} requieren seguimiento
              </p>
            </div>
          </div>

          <!-- Separador -->
          <div class="w-px h-8 bg-gray-200 hidden lg:block"></div>

          <!-- Previstos - Ingresos esperados -->
          <div class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
            <div class="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-left">
              <p class="text-base font-bold text-gray-700 leading-none">{{ formatearMoneda(metricasFinancieras.previstos) }}</p>
              <p class="text-[9px] text-gray-500 font-medium">Previstos</p>
            </div>
          </div>

          <!-- Por Cobrar - Solo si > 0 -->
          <div
            v-if="metricasFinancieras.porCobrar > 0"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
          >
            <div class="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-left">
              <p class="text-base font-bold leading-none">{{ formatearMoneda(metricasFinancieras.porCobrar) }}</p>
              <p class="text-[9px] text-white/80 font-medium">Por cobrar</p>
            </div>
          </div>
        </div>

        <!-- ============ FILTROS ADICIONALES (Derecha - Colapsados) ============ -->
        <div class="flex items-center gap-2">
          <!-- Botón para marcar bloques no disponibles -->
          <div class="relative group/bloques">
            <button
              @click="modoEditarBloques = !modoEditarBloques"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              :class="modoEditarBloques
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-150'"
              title="Ctrl+Clic en un slot para marcar/desmarcar como no disponible"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span class="hidden sm:inline">{{ modoEditarBloques ? 'Editando bloques' : 'Bloquear' }}</span>
            </button>
            <!-- Tooltip -->
            <div class="absolute right-0 top-full mt-1 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-lg opacity-0 group-hover/bloques:opacity-100 pointer-events-none transition-opacity z-50">
              <p class="font-medium mb-1">Marcar horas no disponibles</p>
              <p class="text-gray-300">Usa <kbd class="px-1 py-0.5 bg-gray-700 rounded">Ctrl</kbd>+Clic en cualquier slot para bloquear/desbloquear.</p>
            </div>
          </div>

          <!-- Toggle para ver más estados -->
          <button
            @click="mostrarFiltros = !mostrarFiltros"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="mostrarFiltros
              ? 'bg-gray-200 text-gray-700'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-150'"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Más filtros
            <svg
              class="w-3 h-3 transition-transform"
              :class="{ 'rotate-180': mostrarFiltros }"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Panel expandible con filtros adicionales -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-20"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 max-h-20"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="mostrarFiltros" class="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-gray-100 overflow-hidden">
          <span class="text-[10px] text-gray-400 uppercase tracking-wider">Histórico:</span>

          <!-- Realizadas -->
          <button
            @click="toggleEstado('realizada')"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-all"
            :class="estadosFiltro.includes('realizada')
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-white border-gray-200 text-gray-500 opacity-60 hover:opacity-100'"
          >
            <div class="w-4 h-4 rounded bg-blue-100 flex items-center justify-center">
              <svg class="w-2.5 h-2.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {{ contadores.realizada }} Realizadas
          </button>

          <!-- Canceladas -->
          <button
            @click="toggleEstado('cancelada')"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-all"
            :class="estadosFiltro.includes('cancelada')
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-white border-gray-200 text-gray-500 opacity-60 hover:opacity-100'"
          >
            <div class="w-4 h-4 rounded bg-red-100 flex items-center justify-center">
              <svg class="w-2.5 h-2.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
            {{ contadores.cancelada }} Canceladas
          </button>

          <!-- Perdido (solo si hay) -->
          <div
            v-if="metricasFinancieras.sesionesCanceladas > 0"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-100 text-xs text-red-600"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            -{{ formatearMoneda(metricasFinancieras.perdido) }} perdido
          </div>
        </div>
      </Transition>
    </div>

    <!-- ================================================================= -->
    <!-- PANEL DE SUGERENCIAS INTELIGENTES -->
    <!-- ================================================================= -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mostrarSugerencias && sugerenciasInteligentes.length > 0"
        class="mx-4 mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-4 py-3"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span class="text-xs font-semibold text-blue-700">Sugerencias para tu agenda</span>
          </div>
          <button
            @click="mostrarSugerencias = false"
            class="w-6 h-6 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors"
          >
            <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex flex-wrap gap-2">
          <div
            v-for="sugerencia in sugerenciasInteligentes"
            :key="sugerencia.id"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
            :class="{
              'bg-white/80 border border-amber-200 text-amber-700 hover:bg-amber-50': sugerencia.tipo === 'hueco_disponible',
              'bg-white/80 border border-gray-200 text-gray-600 hover:bg-gray-50': sugerencia.tipo === 'dia_libre',
              'bg-white/80 border border-red-200 text-red-700 hover:bg-red-50': sugerencia.tipo === 'alta_ocupacion'
            }"
            @click="navegarASugerencia(sugerencia)"
          >
            <!-- Icono según tipo -->
            <svg v-if="sugerencia.tipo === 'hueco_disponible'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else-if="sugerencia.tipo === 'dia_libre'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>

            <span class="font-medium">{{ sugerencia.mensaje }}</span>

            <button
              v-if="sugerencia.accion"
              class="ml-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-current/10 hover:bg-current/20 transition-colors"
              @click.stop="navegarASugerencia(sugerencia)"
            >
              {{ sugerencia.accion }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ================================================================= -->
    <!-- GRID CALENDARIO -->
    <!-- ================================================================= -->
    <div
      ref="scrollContainerRef"
      class="flex-1 overflow-auto scroll-smooth"
      style="height: calc(100vh - 100px);"
    >
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

      <!-- Vista Mensual - Grid de calendario -->
      <div v-else-if="vistaActiva === 'mes'" class="p-2 sm:p-4">
        <!-- Cabecera días de la semana -->
        <div class="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
          <div
            v-for="(diaSemana, idx) in ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']"
            :key="diaSemana"
            class="text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase py-1 sm:py-2"
          >
            <!-- Versión corta en móvil -->
            <span class="sm:hidden">{{ ['L', 'M', 'X', 'J', 'V', 'S', 'D'][idx] }}</span>
            <span class="hidden sm:inline">{{ diaSemana }}</span>
          </div>
        </div>

        <!-- Grid de días del mes -->
        <div class="grid grid-cols-7 gap-0.5 sm:gap-1">
          <!-- Espacios vacíos para alinear el primer día -->
          <div
            v-for="n in primerDiaSemanaDelMes"
            :key="'empty-' + n"
            class="aspect-square"
          ></div>

          <!-- Días del mes -->
          <div
            v-for="dia in diasVisibles"
            :key="dia.fecha"
            class="min-h-[50px] sm:min-h-[80px] border rounded sm:rounded-lg p-1 sm:p-1.5 cursor-pointer transition-all hover:border-violet-300 hover:shadow-sm relative"
            :class="{
              'bg-violet-50 border-violet-300': dia.esHoy && !estaBloqueda(dia.fecha),
              'bg-amber-50 border-amber-300': estaBloqueda(dia.fecha),
              'border-gray-200': !dia.esHoy && !estaBloqueda(dia.fecha)
            }"
            @click="seleccionarDiaMes(dia.fecha)"
          >
            <!-- Número del día -->
            <div class="flex items-center justify-between mb-0.5 sm:mb-1">
              <span
                class="text-xs sm:text-sm font-medium"
                :class="[
                  dia.esHoy && !estaBloqueda(dia.fecha) ? 'text-violet-600' : '',
                  estaBloqueda(dia.fecha) ? 'text-amber-600' : '',
                  !dia.esHoy && !estaBloqueda(dia.fecha) ? 'text-gray-700' : ''
                ]"
              >
                {{ dia.numeroDia }}
              </span>
              <span
                v-if="getCitasDelDia(dia.fecha).length > 0 && !estaBloqueda(dia.fecha)"
                class="text-[8px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0.5 rounded-full"
                :class="dia.esHoy ? 'bg-violet-200 text-violet-700' : 'bg-gray-100 text-gray-600'"
              >
                {{ getCitasDelDia(dia.fecha).length }}
              </span>
              <!-- Badge de vacaciones en vista mes -->
              <span
                v-if="estaBloqueda(dia.fecha)"
                class="text-[8px] sm:text-[10px]"
                :title="estaBloqueda(dia.fecha)?.descripcion || estaBloqueda(dia.fecha)?.tipo"
              >
                🏖️
              </span>
            </div>

            <!-- Indicador de bloqueo para vista mensual -->
            <div v-if="estaBloqueda(dia.fecha)" class="text-center py-1 sm:py-2">
              <span class="text-[8px] sm:text-[10px] text-amber-600 font-medium hidden sm:block">
                {{ estaBloqueda(dia.fecha)?.tipo === 'vacaciones' ? 'Vacaciones' : estaBloqueda(dia.fecha)?.tipo }}
              </span>
            </div>

            <!-- Mini lista de citas (máximo 3 en desktop, 2 en móvil) - solo si no está bloqueado -->
            <div v-else class="space-y-0.5 overflow-hidden">
              <!-- En móvil solo mostramos dots, en desktop la info completa -->
              <div class="sm:hidden flex flex-wrap gap-0.5">
                <div
                  v-for="cita in getCitasDelDia(dia.fecha).slice(0, 4)"
                  :key="cita.id"
                  class="w-1.5 h-1.5 rounded-full"
                  :class="getColorEstadoCitaMesDot(cita.estado)"
                ></div>
                <span v-if="getCitasDelDia(dia.fecha).length > 4" class="text-[8px] text-gray-400">+</span>
              </div>
              <!-- Desktop: lista de citas -->
              <div class="hidden sm:block space-y-0.5">
                <div
                  v-for="cita in getCitasDelDia(dia.fecha).slice(0, 3)"
                  :key="cita.id"
                  class="text-[9px] px-1 py-0.5 rounded truncate"
                  :class="getColorEstadoCitaMes(cita.estado)"
                  :title="cita.paciente?.nombre_completo || 'Paciente'"
                >
                  {{ cita.hora_inicio?.substring(0, 5) }} {{ cita.paciente?.nombre_completo?.split(' ')[0] || '' }}
                </div>
                <div
                  v-if="getCitasDelDia(dia.fecha).length > 3"
                  class="text-[9px] text-gray-400 text-center"
                >
                  +{{ getCitasDelDia(dia.fecha).length - 3 }} más
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid horario (día, 5 días, semana) -->
      <div v-else class="min-w-max">
        <!-- Cabecera de días -->
        <div class="sticky top-0 z-20 bg-white border-b border-gray-200 grid" :style="{ gridTemplateColumns: `50px repeat(${diasVisibles.length}, minmax(80px, 1fr))` }">
          <!-- Esquina vacía -->
          <div class="border-r border-gray-100"></div>

          <!-- Columnas de días -->
          <div
            v-for="dia in diasVisibles"
            :key="dia.fecha"
            class="px-1 sm:px-4 py-2 sm:py-3 text-center border-r border-gray-100 last:border-r-0 relative min-w-[80px]"
            :class="[
              dia.esHoy ? 'bg-violet-50/50' : '',
              estaBloqueda(dia.fecha) ? 'bg-amber-50/70' : ''
            ]"
          >
            <!-- Día de la semana - versión corta en móvil -->
            <p class="text-[10px] sm:text-xs font-medium uppercase tracking-wider" :class="estaBloqueda(dia.fecha) ? 'text-amber-600' : 'text-gray-400'">
              <span class="sm:hidden">{{ dia.diaSemana.substring(0, 3) }}</span>
              <span class="hidden sm:inline">{{ dia.diaSemana }}</span>
            </p>
            <p
              class="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1"
              :class="[
                dia.esHoy ? 'text-violet-600' : '',
                estaBloqueda(dia.fecha) ? 'text-amber-600' : '',
                !dia.esHoy && !estaBloqueda(dia.fecha) ? 'text-gray-800' : ''
              ]"
            >
              {{ dia.numeroDia }}
            </p>
            <div v-if="dia.esHoy && !estaBloqueda(dia.fecha)" class="w-4 sm:w-6 h-0.5 bg-violet-500 mx-auto mt-0.5 sm:mt-1 rounded-full"></div>
            <!-- Badge de vacaciones/bloqueo - oculto en móvil muy pequeño -->
            <div v-if="estaBloqueda(dia.fecha)" class="mt-0.5 sm:mt-1 hidden xs:block">
              <span class="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] sm:text-[10px] font-medium rounded-full">
                <span>🏖️</span>
                <span class="truncate max-w-[40px] sm:max-w-[60px] hidden sm:inline">{{ estaBloqueda(dia.fecha)?.tipo === 'vacaciones' ? 'Vacaciones' : estaBloqueda(dia.fecha)?.tipo }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Grid de horas -->
        <div ref="gridHorasRef" class="relative">
          <!-- ========================================================= -->
          <!-- LÍNEA DE HORA ACTUAL (Now Indicator) -->
          <!-- ========================================================= -->
          <div
            v-if="posicionHoraActual !== null && diaActualVisible"
            ref="nowIndicatorRef"
            class="absolute z-30 flex items-center pointer-events-none"
            :style="{
              top: `${posicionHoraActual}px`,
              left: '50px',
              right: '0'
            }"
          >
            <!-- Círculo indicador al inicio -->
            <div class="absolute -left-1.5 w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full shadow-sm ring-1 sm:ring-2 ring-red-200"></div>

            <!-- Chip con hora actual - oculto en móvil muy pequeño -->
            <div class="absolute -left-12 sm:-left-14 -top-2 sm:-top-2.5 flex items-center">
              <span class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-md shadow-sm whitespace-nowrap">
                {{ horaActualFormateada }}
              </span>
            </div>

            <!-- Línea horizontal -->
            <div class="flex-1 h-0.5 bg-red-500 shadow-sm"></div>
          </div>

          <!-- Filas de horas -->
          <div
            v-for="(hora, horaIndex) in horasDelDia"
            :key="hora"
            class="grid border-b border-gray-100"
            :style="{ gridTemplateColumns: `50px repeat(${diasVisibles.length}, minmax(80px, 1fr))` }"
          >
            <!-- Columna hora -->
            <div
              class="px-1 sm:px-3 py-2 text-[10px] sm:text-xs font-medium text-right border-r border-gray-100 flex items-start justify-end"
              :class="[
                esSlotActual(hora, diasVisibles.find(d => d.esHoy)?.fecha || '')
                  ? 'text-red-500 font-semibold'
                  : 'text-gray-400'
              ]"
              style="height: 88px;"
            >
              {{ hora }}
            </div>

            <!-- Celdas por día (1 hora = 88px de altura) -->
            <div
              v-for="dia in diasVisibles"
              :key="`${dia.fecha}-${hora}`"
              class="relative border-r border-gray-100 last:border-r-0 transition-colors cursor-pointer group"
              :class="[
                dia.esHoy ? 'bg-violet-50/20' : '',
                esHoraPasada(hora, dia.fecha) ? 'bg-gray-100/60' : '',
                esSlotActual(hora, dia.fecha) ? 'bg-red-50/30 ring-1 ring-inset ring-red-100' : '',
                !esHoraPasada(hora, dia.fecha) && !esSlotActual(hora, dia.fecha) && !getBloqueEnSlot(dia.fecha, hora) ? 'hover:bg-violet-50/30' : '',
                !esHoraPasada(hora, dia.fecha) && !esSlotActual(hora, dia.fecha) && getBloqueEnSlot(dia.fecha, hora) ? 'hover:bg-gray-200/40' : '',
                modoEditarBloques ? 'cursor-crosshair' : ''
              ]"
              style="height: 88px;"
              @click="handleSlotClickConBloques(dia.fecha, hora, $event)"
            >
              <!-- BLOQUE NO DISPONIBLE -->
              <div
                v-if="getBloqueEnSlot(dia.fecha, hora)"
                class="absolute inset-0 flex items-center justify-center z-20"
                style="background: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(156, 163, 175, 0.15) 4px, rgba(156, 163, 175, 0.15) 8px)"
                @click.stop="toggleBloqueSlot(dia.fecha, hora, $event)"
              >
                <div class="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 bg-gray-200/90 rounded-lg border border-gray-300/50">
                  <svg class="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span class="text-[10px] sm:text-xs font-medium text-gray-500 hidden sm:inline">No disponible</span>
                </div>
              </div>

              <!-- Indicador para crear cita (hover) - solo si no hay bloque -->
              <div
                v-if="citasPorDiaHora(dia.fecha, hora).length === 0 && !esHoraPasada(hora, dia.fecha) && !getBloqueEnSlot(dia.fecha, hora)"
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div class="w-6 h-6 rounded-full bg-violet-500/80 text-white flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>

              <!-- Tarjetas de citas - ALTURA DINÁMICA según duración + offset para :30 -->
              <div
                v-for="cita in citasPorDiaHora(dia.fecha, hora)"
                :key="cita.id"
                @click.stop="handleCitaClick(cita.id)"
                @keydown.enter.stop="handleCitaClick(cita.id)"
                @keydown.space.prevent.stop="handleCitaClick(cita.id)"
                role="button"
                tabindex="0"
                :aria-label="`Cita ${getEstiloCompletoCita(cita).label} de ${cita.paciente?.nombre_completo || 'paciente'}, ${formatearHora(cita.hora_inicio)} a ${formatearHora(cita.hora_fin)}`"
                class="absolute inset-x-0.5 p-1 sm:p-2 rounded sm:rounded-lg border-l-2 sm:border-l-4 cursor-pointer hover:shadow-lg hover:z-30 transition-all z-10 group/card overflow-hidden"
                :class="[
                  getEstiloCompletoCita(cita).bg,
                  getEstiloCompletoCita(cita).border,
                  { 'ring-2 ring-orange-300 ring-opacity-60': getEstiloCompletoCita(cita).esUrgente },
                  { 'ring-2 ring-teal-300 ring-opacity-60': getEstiloCompletoCita(cita).esInminente },
                  { 'ring-2 ring-orange-400 ring-offset-1': cita.bono_id && cita.bono && !cita.bono.pagado }
                ]"
                :style="{
                  height: `${calcularAlturaCita(cita)}px`,
                  top: `${calcularOffsetCita(cita) + 2}px`
                }"
              >
                <!-- Badge de estado con acción rápida (esquina superior derecha) -->
                <!-- Para estado PENDIENTE: clickeable para confirmar directamente -->
                <button
                  v-if="cita.estado === 'pendiente'"
                  @click.stop="handleConfirmarCita(cita.id, $event)"
                  class="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold border transition-all cursor-pointer hover:bg-emerald-100 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 group/badge"
                  :class="[
                    citaConfirmandoId === cita.id
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700 animate-pulse'
                      : getEstiloCompletoCita(cita).badge
                  ]"
                  :disabled="citaConfirmandoId === cita.id"
                  :title="citaConfirmandoId === cita.id ? 'Confirmando...' : 'Clic para confirmar'"
                  type="button"
                >
                  <!-- Spinner cuando está confirmando -->
                  <svg v-if="citaConfirmandoId === cita.id" class="w-2 sm:w-2.5 h-2 sm:h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <!-- Icono normal o check en hover -->
                  <template v-else>
                    <svg class="w-2 sm:w-2.5 h-2 sm:h-2.5 group-hover/badge:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg class="w-2 sm:w-2.5 h-2 sm:h-2.5 hidden group-hover/badge:block" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </template>
                  <span class="hidden sm:inline">{{ citaConfirmandoId === cita.id ? '...' : 'Pendiente' }}</span>
                  <span class="hidden sm:group-hover/badge:inline group-hover/badge:text-emerald-600" v-if="citaConfirmandoId !== cita.id">Confirmar</span>
                </button>
                <!-- Para otros estados: badge no clickeable -->
                <div
                  v-else
                  class="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold border transition-all"
                  :class="getEstiloCompletoCita(cita).badge"
                >
                  <!-- Check: Confirmada -->
                  <svg v-if="getEstiloCompletoCita(cita).icon === 'check'" class="w-2 sm:w-2.5 h-2 sm:h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <!-- Flecha: Próxima -->
                  <svg v-else-if="getEstiloCompletoCita(cita).icon === 'arrow-right'" class="w-2 sm:w-2.5 h-2 sm:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <!-- Rayo: Inminente -->
                  <svg v-else-if="getEstiloCompletoCita(cita).icon === 'bolt'" class="w-2 sm:w-2.5 h-2 sm:h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                  </svg>
                  <!-- Check-circle: Realizada -->
                  <svg v-else-if="getEstiloCompletoCita(cita).icon === 'check-circle'" class="w-2 sm:w-2.5 h-2 sm:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <!-- X-circle: Cancelada -->
                  <svg v-else-if="getEstiloCompletoCita(cita).icon === 'x-circle'" class="w-2 sm:w-2.5 h-2 sm:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <!-- Exclamación: Requiere confirmación (urgente pero no pendiente) -->
                  <svg v-else-if="getEstiloCompletoCita(cita).icon === 'exclamation'" class="w-2 sm:w-2.5 h-2 sm:h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span class="hidden sm:inline">{{ getEstiloCompletoCita(cita).label }}</span>
                </div>

                <!-- Barra de acciones rápidas (aparece en hover) - oculta en móvil -->
                <div class="absolute -bottom-1 right-0 hidden sm:flex items-center gap-1 opacity-0 group-hover/card:opacity-100 focus-within:opacity-100 transition-opacity z-40">
                  <!-- Grupo acciones comunes (fondo blanco) -->
                  <div class="flex items-center gap-0.5 bg-white/95 backdrop-blur-sm rounded-full px-1 py-0.5 shadow-lg border border-gray-200">
                    <!-- Botón reprogramar -->
                    <button
                      v-if="cita.estado !== 'cancelada' && cita.estado !== 'realizada' && cita.estado !== 'completada'"
                      @click="handleAbrirModalReprogramar(cita.id, $event)"
                      @keydown.enter.stop="handleAbrirModalReprogramar(cita.id, $event)"
                      class="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-500 hover:text-white hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                      title="Reprogramar cita"
                      :aria-label="`Reprogramar cita de ${cita.paciente?.nombre_completo || 'paciente'}`"
                      type="button"
                    >
                      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>

                    <!-- Ver detalles -->
                    <button
                      @click.stop="handleCitaClick(cita.id)"
                      class="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center hover:bg-violet-500 hover:text-white hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-violet-400"
                      title="Ver detalles"
                      :aria-label="`Ver detalles de cita de ${cita.paciente?.nombre_completo || 'paciente'}`"
                      type="button"
                    >
                      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>

                  <!-- Grupo acciones destructivas (separadas visualmente) -->
                  <div
                    v-if="cita.estado !== 'cancelada' && cita.estado !== 'realizada' && cita.estado !== 'completada'"
                    class="flex items-center gap-0.5 bg-red-50/95 backdrop-blur-sm rounded-full px-1 py-0.5 shadow-lg border border-red-200"
                  >
                    <!-- Botón cancelar -->
                    <button
                      @click="handleAbrirModalCancelar(cita.id, $event)"
                      @keydown.enter.stop="handleAbrirModalCancelar(cita.id, $event)"
                      class="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                      title="Cancelar cita"
                      :aria-label="`Cancelar cita de ${cita.paciente?.nombre_completo || 'paciente'}`"
                      type="button"
                    >
                      <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>

                    <!-- Botón eliminar (icono papelera) -->
                    <button
                      @click="handleAbrirModalEliminar(cita.id, $event)"
                      @keydown.enter.stop="handleAbrirModalEliminar(cita.id, $event)"
                      class="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                      title="Eliminar cita"
                      :aria-label="`Eliminar cita de ${cita.paciente?.nombre_completo || 'paciente'}`"
                      type="button"
                    >
                      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Contenido de la tarjeta - NOMBRE PROMINENTE -->
                <div class="flex flex-col h-full min-h-[28px] sm:min-h-[34px] pr-8 sm:pr-14">
                  <!-- Fila superior: Nombre + Indicador modalidad -->
                  <div class="flex items-start gap-0.5 sm:gap-1">
                    <!-- Indicador modalidad (esquina izquierda) - oculto en móvil muy pequeño -->
                    <span
                      v-if="cita.modalidad"
                      class="hidden sm:flex flex-shrink-0 w-4 h-4 rounded items-center justify-center"
                      :class="cita.modalidad === 'online' ? 'bg-teal-100 text-teal-600' : 'bg-blue-100 text-blue-600'"
                      :title="cita.modalidad === 'online' ? 'Sesión Online' : 'Sesión Presencial'"
                    >
                      <!-- Icono video para online -->
                      <svg v-if="cita.modalidad === 'online'" class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <!-- Icono edificio para presencial -->
                      <svg v-else class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </span>
                    <!-- Nombre del paciente - GRANDE Y VISIBLE -->
                    <p
                      class="text-[10px] sm:text-sm font-bold leading-tight flex-1"
                      :class="[
                        getEstiloCompletoCita(cita).text,
                        { 'line-clamp-2': vistaActiva === 'semana', 'line-clamp-1': vistaActiva === '5dias' || vistaActiva === 'dia' }
                      ]"
                      :title="cita.paciente?.nombre_completo || 'Sin paciente'"
                    >
                      {{ cita.paciente?.nombre_completo || 'Sin paciente' }}
                    </p>
                  </div>
                  <!-- Hora en formato compacto + indicadores adicionales -->
                  <p class="text-[8px] sm:text-[10px] text-gray-500 font-medium mt-auto flex items-center gap-0.5 sm:gap-1">
                    <span>{{ formatearHora(cita.hora_inicio) }}–{{ formatearHora(cita.hora_fin) }}</span>
                    <!-- Indicador de pago pendiente en bono (si aplica) -->
                    <span
                      v-if="cita.bono_id && cita.bono && !cita.bono.pagado"
                      class="text-orange-500"
                      title="Bono pendiente de pago"
                    >
                      <svg class="w-2.5 sm:w-3 h-2.5 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </p>
                </div>

                <!-- Tooltip expandido con información completa - oculto en móvil/tablet -->
                <div class="absolute left-full ml-2 top-0 hidden md:group-hover/card:block z-50 pointer-events-none">
                  <div class="bg-gray-900 text-white text-xs rounded-lg py-3 px-4 shadow-xl max-w-sm min-w-[220px]">
                    <!-- Cabecera: Nombre + Estado -->
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <p class="font-bold text-sm leading-tight">{{ cita.paciente?.nombre_completo || 'Sin paciente' }}</p>
                      <span
                        class="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                        :class="getEstiloCompletoCita(cita).badge"
                      >
                        {{ getEstiloCompletoCita(cita).label }}
                      </span>
                    </div>

                    <!-- Hora y Modalidad -->
                    <div class="flex items-center gap-2 text-gray-300 mb-2">
                      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ formatearHora(cita.hora_inicio) }} - {{ formatearHora(cita.hora_fin) }}</span>
                      <span class="text-gray-500">|</span>
                      <span :class="cita.modalidad === 'online' ? 'text-teal-400' : 'text-blue-400'">
                        {{ cita.modalidad === 'online' ? 'Online' : 'Presencial' }}
                      </span>
                    </div>

                    <!-- Teléfono de contacto rápido -->
                    <div v-if="cita.paciente?.telefono" class="flex items-center gap-2 text-gray-300 mb-2">
                      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span class="font-mono">{{ cita.paciente.telefono }}</span>
                    </div>

                    <!-- Separador -->
                    <div class="border-t border-gray-700 my-2"></div>

                    <!-- Información del Bono -->
                    <div v-if="cita.bono_id && cita.bono" class="mb-2">
                      <div class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <span class="text-violet-300 font-medium">Bono {{ cita.bono.tipo || 'activo' }}</span>
                      </div>
                      <div class="ml-5 mt-1 flex items-center gap-3">
                        <span class="text-gray-400">
                          Sesiones:
                          <span class="text-white font-medium">{{ cita.bono.sesiones_restantes || 0 }}/{{ cita.bono.sesiones_totales || 0 }}</span>
                        </span>
                        <span
                          v-if="!cita.bono.pagado"
                          class="text-orange-400 text-[10px] font-medium px-1.5 py-0.5 bg-orange-900/50 rounded"
                        >
                          Pendiente pago
                        </span>
                        <span
                          v-else
                          class="text-emerald-400 text-[10px] font-medium"
                        >
                          Pagado
                        </span>
                      </div>
                    </div>
                    <div v-else class="text-gray-500 text-[11px] mb-2">
                      Sin bono asociado
                    </div>

                    <!-- Precio de la sesión -->
                    <div v-if="cita.precio_sesion" class="flex items-center gap-2 text-gray-300 mb-2">
                      <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ formatearMoneda(cita.precio_sesion) }} / sesión</span>
                    </div>

                    <!-- Observaciones / Notas -->
                    <div v-if="cita.observaciones" class="mt-2 pt-2 border-t border-gray-700">
                      <p class="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Notas</p>
                      <p class="text-gray-200 text-[11px] leading-relaxed line-clamp-3">{{ cita.observaciones }}</p>
                    </div>

                    <!-- Botón Revisar Notas Última Sesión -->
                    <button
                      v-if="cita.paciente_id"
                      @click.stop="abrirNotasUltimaSesion(cita.paciente_id)"
                      class="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors pointer-events-auto"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Revisar notas última sesión
                    </button>

                    <!-- Tip de interacción -->
                    <div class="mt-3 pt-2 border-t border-gray-700 flex items-center gap-1 text-gray-500 text-[10px]">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Clic para ver detalles completos</span>
                    </div>
                  </div>
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

          <div class="p-6 space-y-5">
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
                    <p class="font-medium text-gray-900">{{ citaParaCancelar.paciente?.nombre_completo || 'Paciente' }}</p>
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

            <div class="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-amber-800">
                Al cancelar esta cita, el paciente podría recibir una notificación.
              </p>
            </div>
          </div>

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
          <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center justify-between">
              <div>
                <h2 id="modal-reprogramar-titulo" class="text-lg font-semibold text-gray-900">Reprogramar Cita</h2>
                <p class="text-sm text-gray-500 mt-0.5">
                  {{ citaParaReprogramar.paciente?.nombre_completo || 'Paciente' }}
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

          <div class="p-6 space-y-5">
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

            <div class="flex justify-center">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

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
    <!-- MODAL ELIMINAR CITA -->
    <!-- ================================================================= -->
    <Teleport to="body">
      <div
        v-if="mostrarModalEliminar && citaParaEliminar"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="cerrarModalEliminar"
        @keydown.escape="cerrarModalEliminar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-eliminar-titulo"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-modal-enter">
          <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
            <div class="flex items-center justify-between">
              <div>
                <h2 id="modal-eliminar-titulo" class="text-lg font-semibold text-gray-900">Eliminar Cita</h2>
                <p class="text-sm text-gray-500 mt-0.5">Esta acción eliminará la cita permanentemente</p>
              </div>
              <button
                @click="cerrarModalEliminar"
                class="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label="Cerrar modal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div class="p-6 space-y-5">
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Cita a eliminar</p>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ citaParaEliminar.paciente?.nombre_completo || 'Paciente' }}</p>
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
                    <p class="font-medium text-gray-900">{{ formatearFecha(citaParaEliminar.fecha_cita) }}</p>
                    <p class="text-sm text-gray-500">{{ formatearHora(citaParaEliminar.hora_inicio) }} - {{ formatearHora(citaParaEliminar.hora_fin) }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 capitalize">{{ citaParaEliminar.estado }}</p>
                    <p class="text-sm text-gray-500">Estado actual</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
              <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div class="text-sm text-red-800">
                <p class="font-semibold">Esta acción no se puede deshacer</p>
                <p class="mt-1">La cita se eliminará permanentemente del sistema. Si la cita tiene un bono asociado, la sesión se reintegrará automáticamente.</p>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
            <button
              @click="cerrarModalEliminar"
              class="px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancelar
            </button>
            <button
              @click="ejecutarEliminacion"
              :disabled="citaEliminandoId !== null"
              class="px-5 py-2.5 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <svg v-if="citaEliminandoId" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {{ citaEliminandoId ? 'Eliminando...' : 'Eliminar cita' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ================================================================= -->
    <!-- MODAL NOTAS ÚLTIMA SESIÓN -->
    <!-- ================================================================= -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="mostrarModalNotas"
          class="fixed inset-0 z-[60] flex items-center justify-center p-4"
          @click.self="cerrarModalNotas"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/50"></div>

          <!-- Modal -->
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-violet-50 to-white">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Notas última sesión</h3>
                  <p v-if="notasUltimaSesion?.paciente?.nombre_completo" class="text-sm text-gray-500">
                    {{ notasUltimaSesion.paciente.nombre_completo }}
                  </p>
                </div>
              </div>
              <button
                @click="cerrarModalNotas"
                class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto max-h-[60vh]">
              <!-- Loading -->
              <div v-if="cargandoNotas" class="flex items-center justify-center py-8">
                <svg class="w-8 h-8 text-violet-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </div>

              <!-- No hay notas -->
              <div v-else-if="!notasUltimaSesion" class="text-center py-8">
                <div class="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p class="text-gray-500 font-medium">Sin sesiones previas</p>
                <p class="text-gray-400 text-sm mt-1">Este paciente no tiene sesiones completadas registradas.</p>
              </div>

              <!-- Contenido de las notas -->
              <div v-else class="space-y-4">
                <!-- Fecha de la sesión -->
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div class="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ new Date(notasUltimaSesion.fecha_cita + 'T00:00:00').toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ notasUltimaSesion.hora_inicio?.substring(0, 5) }} - {{ notasUltimaSesion.hora_fin?.substring(0, 5) }}
                    </p>
                  </div>
                </div>

                <!-- Notas del terapeuta -->
                <div v-if="notasUltimaSesion.notas_terapeuta" class="space-y-2">
                  <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Notas del terapeuta
                  </h4>
                  <div class="bg-violet-50 border border-violet-100 rounded-xl p-4">
                    <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ notasUltimaSesion.notas_terapeuta }}</p>
                  </div>
                </div>

                <!-- Observaciones -->
                <div v-if="notasUltimaSesion.observaciones" class="space-y-2">
                  <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Observaciones
                  </h4>
                  <div class="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ notasUltimaSesion.observaciones }}</p>
                  </div>
                </div>

                <!-- Sin notas ni observaciones -->
                <div v-if="!notasUltimaSesion.notas_terapeuta && !notasUltimaSesion.observaciones" class="text-center py-4">
                  <p class="text-gray-400 italic">Esta sesión no tiene notas registradas.</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                @click="cerrarModalNotas"
                class="px-4 py-2 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Transition>
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

            <p class="text-sm font-medium flex-1">{{ toastMessage }}</p>

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

/* Scroll suave nativo */
.scroll-smooth {
  scroll-behavior: smooth;
}
</style>
