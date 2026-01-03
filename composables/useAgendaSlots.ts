/**
 * =============================================================================
 * COMPOSABLE: useAgendaSlots
 * =============================================================================
 *
 * Sistema de generación de slots y cálculo de ocupación de agenda.
 *
 * PRIORIDAD DE REGLAS (documentada en código):
 * 1. Bloqueo/Vacaciones (exceptions) → Si hay bloqueo, no hay slots
 * 2. Override diario (dailyOverrides) → Sustituye al horario base
 * 3. Horario base semanal (workingHours) → Configuración por defecto
 *
 * Este modelo es la "fuente de verdad" para la métrica de ocupación.
 * Se usa como base en: Dashboard, Informes, Vista de Agenda, Ficha de Paciente.
 */

import type {
  WorkingHoursBase,
  AgendaException,
  DailyOverride,
  AgendaSlot,
  SlotStatus,
  SlotOrigin,
  TherapistAgendaSettings,
  ExistingAppointment,
  OccupancyResult,
  DailyOccupancy,
  ExtendedOccupancyResult,
  GenerateSlotsForDayParams,
  GenerateSlotsForRangeParams,
  CalculateOccupancyParams,
  SlotAvailabilityCheck,
  DayAvailabilitySummary,
  TimeRange
} from '~/types/agenda-slots.types'

// =============================================================================
// FUNCIONES PURAS - Utilidades de Tiempo
// =============================================================================

/**
 * Convierte hora 'HH:mm' a minutos desde medianoche
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours! * 60 + (minutes || 0)
}

/**
 * Convierte minutos desde medianoche a 'HH:mm'
 */
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Verifica si una hora está dentro de un rango
 */
function isTimeInRange(time: string, start: string, end: string): boolean {
  const t = timeToMinutes(time)
  const s = timeToMinutes(start)
  const e = timeToMinutes(end)
  return t >= s && t < e
}

/**
 * Formatea fecha a 'YYYY-MM-DD'
 */
function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Parsea fecha 'YYYY-MM-DD' a Date (sin timezone issues)
 */
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

/**
 * Obtiene el día de la semana de una fecha (0=domingo, 6=sábado)
 */
function getDayOfWeek(dateStr: string): number {
  return parseDate(dateStr).getDay()
}

/**
 * Genera array de fechas entre dos fechas (inclusive)
 */
function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = parseDate(startDate)
  const end = parseDate(endDate)

  while (current <= end) {
    dates.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

// =============================================================================
// FUNCIONES PURAS - Verificación de Reglas
// =============================================================================

/**
 * Verifica si una fecha está bloqueada por una excepción
 * PRIORIDAD 1: Los bloqueos tienen máxima prioridad
 */
function findBlockingException(
  date: string,
  exceptions: AgendaException[]
): AgendaException | null {
  return exceptions.find(ex =>
    date >= ex.startDate && date <= ex.endDate
  ) || null
}

/**
 * Verifica si hay un override para una fecha específica
 * PRIORIDAD 2: Overrides sustituyen al horario base
 */
function findDailyOverride(
  date: string,
  overrides: DailyOverride[]
): DailyOverride | null {
  return overrides.find(ov => ov.date === date) || null
}

/**
 * Verifica si una fecha es día laborable según el horario base
 * PRIORIDAD 3: Horario base es el fallback
 */
function isWorkingDay(date: string, workingDays: number[]): boolean {
  const dayOfWeek = getDayOfWeek(date)
  return workingDays.includes(dayOfWeek)
}

/**
 * Obtiene las franjas horarias efectivas para un día
 * Aplica la prioridad: bloqueo > override > base
 */
function getEffectiveTimeRanges(
  date: string,
  settings: TherapistAgendaSettings
): TimeRange[] {
  const { workingHours, exceptions, dailyOverrides } = settings

  // PRIORIDAD 1: Verificar bloqueos
  const blockingException = findBlockingException(date, exceptions)
  if (blockingException) {
    // Si es bloqueo parcial, excluir solo esas horas (no implementado aún)
    // Por ahora, cualquier bloqueo = día cerrado
    return []
  }

  // PRIORIDAD 2: Verificar overrides
  const override = findDailyOverride(date, dailyOverrides)
  if (override) {
    if (override.closed) {
      return []
    }
    // Usar horario del override, con fallback al base
    const ranges: TimeRange[] = []

    const morningStart = override.morningStart || workingHours.morningStart
    const morningEnd = override.morningEnd || workingHours.morningEnd
    if (morningStart && morningEnd && timeToMinutes(morningEnd) > timeToMinutes(morningStart)) {
      ranges.push({ start: morningStart, end: morningEnd })
    }

    const afternoonStart = override.afternoonStart || workingHours.afternoonStart
    const afternoonEnd = override.afternoonEnd || workingHours.afternoonEnd
    if (afternoonStart && afternoonEnd && timeToMinutes(afternoonEnd) > timeToMinutes(afternoonStart)) {
      ranges.push({ start: afternoonStart, end: afternoonEnd })
    }

    return ranges
  }

  // PRIORIDAD 3: Horario base
  if (!isWorkingDay(date, workingHours.workingDays)) {
    return []
  }

  const ranges: TimeRange[] = []

  if (workingHours.morningStart && workingHours.morningEnd) {
    ranges.push({
      start: workingHours.morningStart,
      end: workingHours.morningEnd
    })
  }

  if (workingHours.afternoonStart && workingHours.afternoonEnd) {
    ranges.push({
      start: workingHours.afternoonStart,
      end: workingHours.afternoonEnd
    })
  }

  return ranges
}

// =============================================================================
// FUNCIONES PURAS - Generación de Slots
// =============================================================================

/**
 * Genera los slots para un día específico
 *
 * Esta función aplica las reglas de prioridad:
 * 1. Si hay bloqueo → no genera slots
 * 2. Si hay override → usa ese horario
 * 3. Si no → usa horario base
 *
 * Divide las franjas activas en slots usando duración de sesión + pausa.
 */
export function generateSlotsForDay(params: GenerateSlotsForDayParams): AgendaSlot[] {
  const { therapistId, date, settings, existingAppointments = [] } = params
  const slots: AgendaSlot[] = []

  // Obtener franjas horarias efectivas para este día
  const timeRanges = getEffectiveTimeRanges(date, settings)

  // Si no hay franjas, el día está cerrado/bloqueado
  if (timeRanges.length === 0) {
    return slots
  }

  // Determinar el origen del slot
  const blockingException = findBlockingException(date, settings.exceptions)
  const override = findDailyOverride(date, settings.dailyOverrides)
  const origin: SlotOrigin = blockingException ? 'blocked' : override ? 'override' : 'base'

  // Calcular duración total del slot (sesión + buffer)
  const slotDuration = settings.sessionDurationMinutes + settings.bufferMinutes

  // Generar slots para cada franja horaria
  for (const range of timeRanges) {
    let currentMinutes = timeToMinutes(range.start)
    const endMinutes = timeToMinutes(range.end)

    while (currentMinutes + settings.sessionDurationMinutes <= endMinutes) {
      const startTime = minutesToTime(currentMinutes)
      const endTime = minutesToTime(currentMinutes + settings.sessionDurationMinutes)

      // Crear timestamps completos
      const startDateTime = new Date(`${date}T${startTime}:00`)
      const endDateTime = new Date(`${date}T${endTime}:00`)

      // Verificar si este slot está reservado por una cita existente
      const matchingAppointment = existingAppointments.find(apt =>
        apt.fecha === date &&
        apt.horaInicio === startTime &&
        apt.estado !== 'cancelada' // Las canceladas no bloquean
      )

      // Determinar estado del slot
      let status: SlotStatus = 'available'
      if (startDateTime < new Date()) {
        status = 'past'
      } else if (matchingAppointment) {
        status = 'booked'
      }

      // Crear el slot
      const slot: AgendaSlot = {
        id: `${date}_${startTime}`,
        startDateTime,
        endDateTime,
        date,
        startTime,
        endTime,
        status,
        origin,
        ...(matchingAppointment && {
          appointmentId: matchingAppointment.id,
          appointmentDetails: {
            pacienteNombre: matchingAppointment.pacienteNombre,
            pacienteId: matchingAppointment.pacienteId,
            modalidad: matchingAppointment.modalidad,
            estado: matchingAppointment.estado
          }
        })
      }

      slots.push(slot)

      // Avanzar al siguiente slot (duración + buffer)
      currentMinutes += slotDuration
    }
  }

  return slots
}

/**
 * Genera slots para un rango de fechas
 */
export function generateSlotsForRange(params: GenerateSlotsForRangeParams): AgendaSlot[] {
  const { therapistId, startDate, endDate, settings, existingAppointments = [] } = params
  const allSlots: AgendaSlot[] = []

  const dates = getDateRange(startDate, endDate)

  for (const date of dates) {
    // Filtrar citas del día
    const dayAppointments = existingAppointments.filter(apt => apt.fecha === date)

    const daySlots = generateSlotsForDay({
      therapistId,
      date,
      settings,
      existingAppointments: dayAppointments
    })

    allSlots.push(...daySlots)
  }

  return allSlots
}

// =============================================================================
// FUNCIONES PURAS - Cálculo de Ocupación
// =============================================================================

/**
 * Calcula la ocupación de agenda para un rango de fechas
 *
 * Fórmula: ocupación = slots_reservados / slots_disponibles
 *
 * Slots disponibles = todos los generados (excluyendo bloqueos)
 * Slots reservados = slots con cita asignada (no cancelada)
 */
export function calculateOccupancyForRange(params: CalculateOccupancyParams): OccupancyResult {
  const {
    therapistId,
    startDate,
    endDate,
    settings,
    appointments,
    excludeCancelled = true
  } = params

  const dates = getDateRange(startDate, endDate)
  const dailyBreakdown: DailyOccupancy[] = []

  let totalAvailableSlots = 0
  let totalBookedSlots = 0
  let totalBlockedSlots = 0

  for (const date of dates) {
    // Filtrar citas del día
    let dayAppointments = appointments.filter(apt => apt.fecha === date)
    if (excludeCancelled) {
      dayAppointments = dayAppointments.filter(apt => apt.estado !== 'cancelada')
    }

    // Verificar estado del día
    const blockingException = findBlockingException(date, settings.exceptions)
    const override = findDailyOverride(date, settings.dailyOverrides)
    const isWorking = isWorkingDay(date, settings.workingHours.workingDays)
    const isBlocked = !!blockingException || (override?.closed ?? false)
    const hasOverride = !!override && !override.closed

    // Generar slots del día
    const daySlots = generateSlotsForDay({
      therapistId,
      date,
      settings,
      existingAppointments: dayAppointments
    })

    // Contar slots
    const availableSlots = daySlots.filter(s => s.status === 'available' || s.status === 'booked').length
    const bookedSlots = daySlots.filter(s => s.status === 'booked').length
    const blockedSlots = isBlocked ? 0 : 0 // Los días bloqueados no generan slots

    // Calcular ocupación del día
    const dayOccupancy = availableSlots > 0
      ? Math.round((bookedSlots / availableSlots) * 100)
      : 0

    dailyBreakdown.push({
      date,
      availableSlots,
      bookedSlots,
      blockedSlots,
      occupancyPercentage: dayOccupancy,
      isWorkingDay: isWorking,
      isBlocked,
      hasOverride
    })

    // Acumular totales
    totalAvailableSlots += availableSlots
    totalBookedSlots += bookedSlots
    if (isBlocked) totalBlockedSlots++
  }

  // Calcular ocupación total
  const occupancyPercentage = totalAvailableSlots > 0
    ? Math.round((totalBookedSlots / totalAvailableSlots) * 100)
    : 0

  return {
    startDate,
    endDate,
    totalAvailableSlots,
    totalBookedSlots,
    totalBlockedSlots,
    occupancyPercentage,
    dailyBreakdown
  }
}

/**
 * Calcula ocupación extendida con desgloses adicionales
 * Útil para informes y análisis avanzados
 */
export function calculateExtendedOccupancy(params: CalculateOccupancyParams): ExtendedOccupancyResult {
  const baseResult = calculateOccupancyForRange(params)
  const { appointments, excludeCancelled = true } = params

  // Filtrar citas del rango
  let rangeAppointments = appointments.filter(apt =>
    apt.fecha >= params.startDate && apt.fecha <= params.endDate
  )
  if (excludeCancelled) {
    rangeAppointments = rangeAppointments.filter(apt => apt.estado !== 'cancelada')
  }

  // Desglose por modalidad
  const presencialCount = rangeAppointments.filter(a => a.modalidad === 'presencial').length
  const onlineCount = rangeAppointments.filter(a => a.modalidad === 'online').length
  const telefonicaCount = rangeAppointments.filter(a => a.modalidad === 'telefonica').length
  const totalBooked = baseResult.totalBookedSlots || 1 // Evitar división por 0

  const byModality = {
    presencial: {
      booked: presencialCount,
      percentage: Math.round((presencialCount / totalBooked) * 100)
    },
    online: {
      booked: onlineCount,
      percentage: Math.round((onlineCount / totalBooked) * 100)
    },
    telefonica: {
      booked: telefonicaCount,
      percentage: Math.round((telefonicaCount / totalBooked) * 100)
    }
  }

  // Desglose por estado (incluir todas las citas, no solo las no-canceladas)
  const allRangeAppointments = appointments.filter(apt =>
    apt.fecha >= params.startDate && apt.fecha <= params.endDate
  )
  const byStatus = {
    pendiente: allRangeAppointments.filter(a => a.estado === 'pendiente').length,
    confirmada: allRangeAppointments.filter(a => a.estado === 'confirmada').length,
    realizada: allRangeAppointments.filter(a => a.estado === 'realizada').length,
    cancelada: allRangeAppointments.filter(a => a.estado === 'cancelada').length
  }

  // Top pacientes
  const patientCounts = new Map<string, { nombre: string; count: number }>()
  for (const apt of rangeAppointments) {
    const existing = patientCounts.get(apt.pacienteId)
    if (existing) {
      existing.count++
    } else {
      patientCounts.set(apt.pacienteId, {
        nombre: apt.pacienteNombre,
        count: 1
      })
    }
  }

  const topPatients = Array.from(patientCounts.entries())
    .map(([id, data]) => ({
      pacienteId: id,
      pacienteNombre: data.nombre,
      sessionsCount: data.count,
      percentageOfTotal: Math.round((data.count / totalBooked) * 100)
    }))
    .sort((a, b) => b.sessionsCount - a.sessionsCount)
    .slice(0, 5)

  return {
    ...baseResult,
    byModality,
    byStatus,
    topPatients
  }
}

// =============================================================================
// FUNCIONES PURAS - Helpers de Disponibilidad
// =============================================================================

/**
 * Verifica la disponibilidad de un slot específico
 */
export function checkSlotAvailability(
  date: string,
  startTime: string,
  settings: TherapistAgendaSettings,
  existingAppointments: ExistingAppointment[]
): SlotAvailabilityCheck {
  // Verificar si es día laborable
  const isWorking = isWorkingDay(date, settings.workingHours.workingDays)
  const override = findDailyOverride(date, settings.dailyOverrides)
  const blockingException = findBlockingException(date, settings.exceptions)

  // PRIORIDAD 1: Bloqueos
  if (blockingException) {
    return {
      isAvailable: false,
      reason: 'blocked',
      blockingException
    }
  }

  // PRIORIDAD 2: Override cerrado
  if (override?.closed) {
    return {
      isAvailable: false,
      reason: 'blocked'
    }
  }

  // PRIORIDAD 3: No es día laborable y no hay override
  if (!isWorking && !override) {
    return {
      isAvailable: false,
      reason: 'non_working_day'
    }
  }

  // Verificar si está dentro del horario
  const timeRanges = getEffectiveTimeRanges(date, settings)
  const isInHours = timeRanges.some(range =>
    isTimeInRange(startTime, range.start, range.end)
  )

  if (!isInHours) {
    return {
      isAvailable: false,
      reason: 'outside_hours'
    }
  }

  // Verificar si ya pasó
  const slotDateTime = new Date(`${date}T${startTime}:00`)
  if (slotDateTime < new Date()) {
    return {
      isAvailable: false,
      reason: 'past'
    }
  }

  // Verificar si hay cita existente
  const conflicting = existingAppointments.find(apt =>
    apt.fecha === date &&
    apt.horaInicio === startTime &&
    apt.estado !== 'cancelada'
  )

  if (conflicting) {
    return {
      isAvailable: false,
      reason: 'already_booked',
      conflictingAppointment: conflicting
    }
  }

  return { isAvailable: true }
}

/**
 * Obtiene resumen de disponibilidad para un día
 */
export function getDayAvailabilitySummary(
  date: string,
  settings: TherapistAgendaSettings,
  existingAppointments: ExistingAppointment[]
): DayAvailabilitySummary {
  const daySlots = generateSlotsForDay({
    therapistId: settings.therapistId,
    date,
    settings,
    existingAppointments: existingAppointments.filter(a => a.fecha === date)
  })

  const availableSlots = daySlots.filter(s => s.status === 'available')

  return {
    date,
    isAvailable: availableSlots.length > 0,
    totalSlots: daySlots.length,
    availableSlots: availableSlots.length,
    firstAvailableSlot: availableSlots[0]?.startTime,
    lastAvailableSlot: availableSlots[availableSlots.length - 1]?.startTime
  }
}

// =============================================================================
// COMPOSABLE - Hook de Vue
// =============================================================================

/**
 * Composable para usar el sistema de slots en componentes Vue
 */
export function useAgendaSlots() {
  const supabase = useSupabaseClient()
  const { userProfile } = useSupabase()
  const { configuracion, cargarConfiguracion } = useConfiguracionAgenda()

  /**
   * Convierte la configuración actual a TherapistAgendaSettings
   */
  function getTherapistSettings(): TherapistAgendaSettings | null {
    const terapeutaId = userProfile.value?.id
    if (!terapeutaId || !configuracion.value) return null

    const config = configuracion.value

    return {
      therapistId: terapeutaId,
      sessionDurationMinutes: 60, // TODO: obtener de configuración
      bufferMinutes: config.buffer_minutos,
      workingHours: {
        morningStart: config.horario.inicio_manana,
        morningEnd: config.horario.fin_manana,
        afternoonStart: config.horario.inicio_tarde,
        afternoonEnd: config.horario.fin_tarde,
        workingDays: config.dias_laborables
      },
      exceptions: config.bloqueos.map(b => ({
        id: b.id,
        startDate: b.fecha_inicio,
        endDate: b.fecha_fin,
        type: b.tipo,
        description: b.descripcion
      })),
      dailyOverrides: config.horarios_personalizados.map(h => ({
        date: h.fecha,
        closed: h.cerrado || false,
        morningStart: h.inicio_manana,
        morningEnd: h.fin_manana,
        afternoonStart: h.inicio_tarde,
        afternoonEnd: h.fin_tarde,
        notes: h.notas
      }))
    }
  }

  /**
   * Carga citas existentes de un rango de fechas
   */
  async function loadAppointments(
    startDate: string,
    endDate: string
  ): Promise<ExistingAppointment[]> {
    const terapeutaId = userProfile.value?.id
    if (!terapeutaId) return []

    const { data, error } = await supabase
      .from('citas')
      .select(`
        id,
        fecha_cita,
        hora_inicio,
        hora_fin,
        paciente_id,
        modalidad,
        estado,
        pacientes!inner(nombre_completo)
      `)
      .eq('terapeuta_id', terapeutaId)
      .gte('fecha_cita', startDate)
      .lte('fecha_cita', endDate)

    if (error) {
      console.error('[useAgendaSlots] Error cargando citas:', error)
      return []
    }

    return (data || []).map((cita: any) => ({
      id: cita.id,
      fecha: cita.fecha_cita,
      horaInicio: cita.hora_inicio,
      horaFin: cita.hora_fin,
      pacienteId: cita.paciente_id,
      pacienteNombre: cita.pacientes?.nombre_completo || 'Paciente',
      modalidad: cita.modalidad,
      estado: cita.estado
    }))
  }

  /**
   * Genera slots para un día (wrapper con carga de datos)
   */
  async function getSlotsForDay(date: string): Promise<AgendaSlot[]> {
    await cargarConfiguracion()
    const settings = getTherapistSettings()
    if (!settings) return []

    const appointments = await loadAppointments(date, date)

    return generateSlotsForDay({
      therapistId: settings.therapistId,
      date,
      settings,
      existingAppointments: appointments
    })
  }

  /**
   * Genera slots para un rango (wrapper con carga de datos)
   */
  async function getSlotsForRange(
    startDate: string,
    endDate: string
  ): Promise<AgendaSlot[]> {
    await cargarConfiguracion()
    const settings = getTherapistSettings()
    if (!settings) return []

    const appointments = await loadAppointments(startDate, endDate)

    return generateSlotsForRange({
      therapistId: settings.therapistId,
      startDate,
      endDate,
      settings,
      existingAppointments: appointments
    })
  }

  /**
   * Calcula ocupación para un rango (wrapper con carga de datos)
   */
  async function getOccupancyForRange(
    startDate: string,
    endDate: string,
    extended: boolean = false
  ): Promise<OccupancyResult | ExtendedOccupancyResult> {
    await cargarConfiguracion()
    const settings = getTherapistSettings()
    if (!settings) {
      // Retornar resultado vacío
      return {
        startDate,
        endDate,
        totalAvailableSlots: 0,
        totalBookedSlots: 0,
        totalBlockedSlots: 0,
        occupancyPercentage: 0,
        dailyBreakdown: []
      }
    }

    const appointments = await loadAppointments(startDate, endDate)

    const params: CalculateOccupancyParams = {
      therapistId: settings.therapistId,
      startDate,
      endDate,
      settings,
      appointments,
      excludeCancelled: true
    }

    return extended
      ? calculateExtendedOccupancy(params)
      : calculateOccupancyForRange(params)
  }

  /**
   * Verifica disponibilidad de un slot específico
   */
  async function checkAvailability(
    date: string,
    startTime: string
  ): Promise<SlotAvailabilityCheck> {
    await cargarConfiguracion()
    const settings = getTherapistSettings()
    if (!settings) {
      return { isAvailable: false, reason: 'blocked' }
    }

    const appointments = await loadAppointments(date, date)

    return checkSlotAvailability(date, startTime, settings, appointments)
  }

  return {
    // Funciones puras (exportadas para uso directo)
    generateSlotsForDay,
    generateSlotsForRange,
    calculateOccupancyForRange,
    calculateExtendedOccupancy,
    checkSlotAvailability,
    getDayAvailabilitySummary,

    // Wrappers con carga de datos
    getSlotsForDay,
    getSlotsForRange,
    getOccupancyForRange,
    checkAvailability,

    // Utilidades
    getTherapistSettings
  }
}
