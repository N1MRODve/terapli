/**
 * =============================================================================
 * TIPOS: Sistema de Slots y Ocupación de Agenda
 * =============================================================================
 *
 * Modelo de dominio para la generación de slots disponibles y cálculo de
 * métricas de ocupación.
 *
 * PRIORIDAD DE REGLAS (para generación de slots):
 * 1. Bloqueo/Vacaciones (exceptions) - Si hay bloqueo, no hay slots
 * 2. Override diario (daily_overrides) - Sustituye al horario base
 * 3. Horario base semanal (working_hours_base) - Configuración por defecto
 *
 * Este modelo es la "fuente de verdad" para la métrica de ocupación:
 * ocupación = slots_reservados / slots_disponibles
 */

// =============================================================================
// TIPOS BASE - Configuración de Horario
// =============================================================================

/**
 * Franja horaria con inicio y fin
 */
export interface TimeRange {
  start: string  // Formato 'HH:mm'
  end: string    // Formato 'HH:mm'
}

/**
 * Horario base semanal del terapeuta
 * Representa las franjas habituales de trabajo (mañana y tarde)
 */
export interface WorkingHoursBase {
  // Franja de mañana
  morningStart: string  // ej: '09:00'
  morningEnd: string    // ej: '14:00'
  // Franja de tarde
  afternoonStart: string // ej: '16:00'
  afternoonEnd: string   // ej: '20:00'
  // Días de la semana (0=domingo, 1=lunes, ..., 6=sábado)
  workingDays: number[]
}

/**
 * Tipo de excepción/bloqueo
 */
export type ExceptionType = 'vacaciones' | 'festivo' | 'personal' | 'otro'

/**
 * Excepción en la agenda (vacaciones, bloqueos, festivos)
 * Cuando una fecha está en una excepción, su capacidad = 0
 */
export interface AgendaException {
  id: string
  startDate: string     // Formato 'YYYY-MM-DD'
  endDate: string       // Formato 'YYYY-MM-DD'
  type: ExceptionType
  description?: string
  // Opcionalmente, bloqueo de horas específicas (no todo el día)
  partialBlock?: {
    start: string       // 'HH:mm'
    end: string         // 'HH:mm'
  }
}

/**
 * Override de horario para un día específico
 * Permite ajustar el horario de un día sin afectar el resto de la semana
 */
export interface DailyOverride {
  date: string          // Formato 'YYYY-MM-DD'
  // Si closed=true, el día está cerrado completamente
  closed: boolean
  // Horarios personalizados (si no está cerrado)
  morningStart?: string
  morningEnd?: string
  afternoonStart?: string
  afternoonEnd?: string
  notes?: string
}

// =============================================================================
// TIPOS DE SLOT
// =============================================================================

/**
 * Origen del slot (para debugging y trazabilidad)
 */
export type SlotOrigin = 'base' | 'override' | 'blocked'

/**
 * Estado del slot
 */
export type SlotStatus =
  | 'available'   // Libre para reservar
  | 'booked'      // Reservado con cita
  | 'blocked'     // Bloqueado (vacaciones, etc.)
  | 'past'        // Ya pasó (no reservable)

/**
 * Slot individual de la agenda
 * Representa un hueco potencial para una cita
 */
export interface AgendaSlot {
  // Identificador único (fecha + hora inicio)
  id: string
  // Timestamp exacto del slot
  startDateTime: Date
  endDateTime: Date
  // Formato string para comparaciones
  date: string         // 'YYYY-MM-DD'
  startTime: string    // 'HH:mm'
  endTime: string      // 'HH:mm'
  // Estado y origen
  status: SlotStatus
  origin: SlotOrigin
  // Si está reservado, referencia a la cita
  appointmentId?: string
  appointmentDetails?: {
    pacienteNombre: string
    pacienteId: string
    modalidad: 'presencial' | 'online' | 'telefonica'
    estado: 'pendiente' | 'confirmada' | 'realizada' | 'cancelada'
  }
  // Si está bloqueado, razón
  blockReason?: string
}

// =============================================================================
// CONFIGURACIÓN PARA GENERACIÓN
// =============================================================================

/**
 * Configuración completa de la agenda del terapeuta
 * Necesaria para generar slots
 */
export interface TherapistAgendaSettings {
  therapistId: string
  // Duración estándar de sesión en minutos
  sessionDurationMinutes: number
  // Pausa/buffer entre sesiones en minutos
  bufferMinutes: number
  // Horario base semanal
  workingHours: WorkingHoursBase
  // Excepciones (vacaciones, bloqueos)
  exceptions: AgendaException[]
  // Overrides diarios
  dailyOverrides: DailyOverride[]
}

// =============================================================================
// TIPOS PARA MÉTRICA DE OCUPACIÓN
// =============================================================================

/**
 * Resultado del cálculo de ocupación para un rango de fechas
 */
export interface OccupancyResult {
  // Rango analizado
  startDate: string
  endDate: string
  // Contadores principales
  totalAvailableSlots: number    // Slots disponibles (excluyendo bloqueos)
  totalBookedSlots: number       // Slots con cita asignada
  totalBlockedSlots: number      // Slots en días bloqueados
  // Métrica de ocupación
  occupancyPercentage: number    // (booked / available) * 100
  // Desglose por día
  dailyBreakdown: DailyOccupancy[]
}

/**
 * Ocupación de un día específico
 */
export interface DailyOccupancy {
  date: string
  availableSlots: number
  bookedSlots: number
  blockedSlots: number
  occupancyPercentage: number
  // Estado del día
  isWorkingDay: boolean
  isBlocked: boolean
  hasOverride: boolean
}

/**
 * Ocupación extendida con desglose por categorías
 * Para informes avanzados
 */
export interface ExtendedOccupancyResult extends OccupancyResult {
  // Por modalidad
  byModality?: {
    presencial: { booked: number; percentage: number }
    online: { booked: number; percentage: number }
    telefonica: { booked: number; percentage: number }
  }
  // Por estado de cita
  byStatus?: {
    pendiente: number
    confirmada: number
    realizada: number
    cancelada: number
  }
  // Por paciente (top N)
  topPatients?: Array<{
    pacienteId: string
    pacienteNombre: string
    sessionsCount: number
    percentageOfTotal: number
  }>
}

// =============================================================================
// PARÁMETROS DE FUNCIONES
// =============================================================================

/**
 * Parámetros para generar slots de un día
 */
export interface GenerateSlotsForDayParams {
  therapistId: string
  date: string            // 'YYYY-MM-DD'
  settings: TherapistAgendaSettings
  // Opcional: citas existentes para marcar slots como reservados
  existingAppointments?: ExistingAppointment[]
}

/**
 * Parámetros para generar slots de un rango
 */
export interface GenerateSlotsForRangeParams {
  therapistId: string
  startDate: string       // 'YYYY-MM-DD'
  endDate: string         // 'YYYY-MM-DD'
  settings: TherapistAgendaSettings
  existingAppointments?: ExistingAppointment[]
}

/**
 * Cita existente (para cruzar con slots)
 */
export interface ExistingAppointment {
  id: string
  fecha: string           // 'YYYY-MM-DD'
  horaInicio: string      // 'HH:mm'
  horaFin: string         // 'HH:mm'
  pacienteId: string
  pacienteNombre: string
  modalidad: 'presencial' | 'online' | 'telefonica'
  estado: 'pendiente' | 'confirmada' | 'realizada' | 'cancelada'
  esHorarioExcepcional?: boolean  // No cuenta para ocupación si es true
}

/**
 * Parámetros para calcular ocupación
 */
export interface CalculateOccupancyParams {
  therapistId: string
  startDate: string
  endDate: string
  settings: TherapistAgendaSettings
  appointments: ExistingAppointment[]
  // Opciones avanzadas
  includeExtended?: boolean        // Incluir desglose por modalidad/estado
  excludeCancelled?: boolean       // No contar citas canceladas como "booked"
  excludeExceptional?: boolean     // No contar citas en horario excepcional (default: true)
}

// =============================================================================
// HELPERS TYPES
// =============================================================================

/**
 * Resultado de verificar disponibilidad de un slot
 */
export interface SlotAvailabilityCheck {
  isAvailable: boolean
  reason?: 'blocked' | 'outside_hours' | 'already_booked' | 'past' | 'non_working_day'
  conflictingAppointment?: ExistingAppointment
  blockingException?: AgendaException
}

/**
 * Resumen rápido de disponibilidad para un día
 */
export interface DayAvailabilitySummary {
  date: string
  isAvailable: boolean        // ¿Tiene al menos un slot libre?
  totalSlots: number
  availableSlots: number
  firstAvailableSlot?: string // 'HH:mm' del primer slot libre
  lastAvailableSlot?: string  // 'HH:mm' del último slot libre
}
