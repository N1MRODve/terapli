/**
 * =============================================================================
 * APPOINTMENT VALIDATION UTILITIES
 * =============================================================================
 *
 * Validaciones de negocio para citas:
 * - Conflictos de horario
 * - Máquina de estados
 * - Reglas de negocio
 */

import { timeRangesOverlap, getDurationMinutes } from './timezone'

/**
 * Estados permitidos para una cita
 */
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'canceled'

/**
 * Máquina de estados: transiciones permitidas
 */
export const STATE_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ['confirmed', 'canceled'],
  confirmed: ['completed', 'canceled'],
  completed: [], // Estado final, no se puede cambiar
  canceled: [] // Estado final, no se puede cambiar
}

/**
 * Mapeo de estados DB → UI (para compatibilidad con sistema actual)
 */
export const STATUS_MAP: Record<string, AppointmentStatus> = {
  pendiente: 'pending',
  confirmada: 'confirmed',
  realizada: 'completed',
  completada: 'completed',
  cancelada: 'canceled'
}

/**
 * Mapeo inverso UI → DB
 */
export const STATUS_MAP_REVERSE: Record<AppointmentStatus, string> = {
  pending: 'pendiente',
  confirmed: 'confirmada',
  completed: 'realizada',
  canceled: 'cancelada'
}

/**
 * Interfaz de cita para validaciones
 */
export interface AppointmentForValidation {
  id?: string
  fecha_cita: string
  hora_inicio: string
  hora_fin: string
  terapeuta_id: string
  estado: string
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
  valid: boolean
  error?: string
  errorCode?: string
  details?: Record<string, any>
}

/**
 * Verifica si una transición de estado es válida
 *
 * @param from - Estado actual
 * @param to - Estado objetivo
 * @returns Resultado de validación
 *
 * @example
 * validateStateTransition('pending', 'confirmed') // { valid: true }
 * validateStateTransition('completed', 'confirmed') // { valid: false, error: '...' }
 */
export function validateStateTransition(
  from: string,
  to: string
): ValidationResult {
  // Normalizar estados
  const fromNormalized = STATUS_MAP[from] || from as AppointmentStatus
  const toNormalized = STATUS_MAP[to] || to as AppointmentStatus

  // Verificar si la transición es permitida
  const allowedTransitions = STATE_TRANSITIONS[fromNormalized]

  if (!allowedTransitions) {
    return {
      valid: false,
      error: `Estado inicial inválido: ${from}`,
      errorCode: 'INVALID_INITIAL_STATE'
    }
  }

  if (!allowedTransitions.includes(toNormalized)) {
    const allowedList = allowedTransitions
      .map(s => STATUS_MAP_REVERSE[s])
      .join(', ')

    return {
      valid: false,
      error: `No se puede cambiar de "${from}" a "${to}". Transiciones permitidas: ${allowedList}`,
      errorCode: 'INVALID_STATE_TRANSITION',
      details: {
        from,
        to,
        allowedTransitions: allowedTransitions
      }
    }
  }

  return { valid: true }
}

/**
 * Verifica si dos citas tienen conflicto de horario
 *
 * @param appointment1 - Primera cita
 * @param appointment2 - Segunda cita
 * @returns true si hay conflicto
 *
 * @example
 * hasTimeConflict(
 *   { fecha_cita: '2025-01-15', hora_inicio: '10:00', hora_fin: '11:00', ... },
 *   { fecha_cita: '2025-01-15', hora_inicio: '10:30', hora_fin: '11:30', ... }
 * ) // true
 */
export function hasTimeConflict(
  appointment1: AppointmentForValidation,
  appointment2: AppointmentForValidation
): boolean {
  // Deben ser el mismo día
  if (appointment1.fecha_cita !== appointment2.fecha_cita) {
    return false
  }

  // Deben ser del mismo terapeuta
  if (appointment1.terapeuta_id !== appointment2.terapeuta_id) {
    return false
  }

  // Ignorar citas canceladas
  if (appointment1.estado === 'cancelada' || appointment2.estado === 'cancelada') {
    return false
  }

  // Si es la misma cita (editando), no hay conflicto
  if (appointment1.id && appointment2.id && appointment1.id === appointment2.id) {
    return false
  }

  // Verificar superposición de horarios
  return timeRangesOverlap(
    appointment1.hora_inicio.substring(0, 5),
    appointment1.hora_fin.substring(0, 5),
    appointment2.hora_inicio.substring(0, 5),
    appointment2.hora_fin.substring(0, 5)
  )
}

/**
 * Busca conflictos de una cita con una lista de citas existentes
 *
 * @param newAppointment - Cita nueva o editada
 * @param existingAppointments - Lista de citas existentes
 * @returns Resultado de validación con detalles de conflicto
 */
export function validateAppointmentConflicts(
  newAppointment: AppointmentForValidation,
  existingAppointments: AppointmentForValidation[]
): ValidationResult {
  const conflicts = existingAppointments.filter(existing =>
    hasTimeConflict(newAppointment, existing)
  )

  if (conflicts.length > 0) {
    const conflictDetails = conflicts[0]
    return {
      valid: false,
      error: `Conflicto de horario detectado. Ya existe una cita a las ${conflictDetails.hora_inicio.substring(0, 5)}`,
      errorCode: 'TIME_CONFLICT',
      details: {
        conflictingAppointment: conflictDetails,
        date: newAppointment.fecha_cita,
        time: newAppointment.hora_inicio
      }
    }
  }

  return { valid: true }
}

/**
 * Valida que la cita cumpla con reglas de negocio básicas
 *
 * @param appointment - Cita a validar
 * @returns Resultado de validación
 */
export function validateAppointmentRules(
  appointment: Partial<AppointmentForValidation>
): ValidationResult {
  // Validar campos obligatorios
  if (!appointment.fecha_cita) {
    return {
      valid: false,
      error: 'La fecha de la cita es obligatoria',
      errorCode: 'MISSING_DATE'
    }
  }

  if (!appointment.hora_inicio) {
    return {
      valid: false,
      error: 'La hora de inicio es obligatoria',
      errorCode: 'MISSING_START_TIME'
    }
  }

  if (!appointment.hora_fin) {
    return {
      valid: false,
      error: 'La hora de fin es obligatoria',
      errorCode: 'MISSING_END_TIME'
    }
  }

  if (!appointment.terapeuta_id) {
    return {
      valid: false,
      error: 'El terapeuta es obligatorio',
      errorCode: 'MISSING_THERAPIST'
    }
  }

  // Validar que hora_fin sea posterior a hora_inicio
  const duration = getDurationMinutes(
    appointment.hora_inicio.substring(0, 5),
    appointment.hora_fin.substring(0, 5)
  )

  if (duration <= 0) {
    return {
      valid: false,
      error: 'La hora de fin debe ser posterior a la hora de inicio',
      errorCode: 'INVALID_TIME_RANGE'
    }
  }

  // Validar duración mínima (15 minutos)
  if (duration < 15) {
    return {
      valid: false,
      error: 'La duración mínima de una cita es 15 minutos',
      errorCode: 'DURATION_TOO_SHORT',
      details: { duration }
    }
  }

  // Validar duración máxima (4 horas)
  if (duration > 240) {
    return {
      valid: false,
      error: 'La duración máxima de una cita es 4 horas',
      errorCode: 'DURATION_TOO_LONG',
      details: { duration }
    }
  }

  // Validar formato de fecha (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(appointment.fecha_cita)) {
    return {
      valid: false,
      error: 'Formato de fecha inválido. Use YYYY-MM-DD',
      errorCode: 'INVALID_DATE_FORMAT'
    }
  }

  // Validar formato de hora (HH:MM o HH:MM:SS)
  const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/
  if (!timeRegex.test(appointment.hora_inicio) || !timeRegex.test(appointment.hora_fin)) {
    return {
      valid: false,
      error: 'Formato de hora inválido. Use HH:MM',
      errorCode: 'INVALID_TIME_FORMAT'
    }
  }

  return { valid: true }
}

/**
 * Validación completa de una cita
 *
 * @param appointment - Cita a validar
 * @param existingAppointments - Citas existentes (para verificar conflictos)
 * @returns Resultado de validación
 */
export function validateAppointment(
  appointment: Partial<AppointmentForValidation>,
  existingAppointments: AppointmentForValidation[] = []
): ValidationResult {
  // 1. Validar reglas de negocio
  const rulesValidation = validateAppointmentRules(appointment)
  if (!rulesValidation.valid) {
    return rulesValidation
  }

  // 2. Validar conflictos de horario
  const conflictValidation = validateAppointmentConflicts(
    appointment as AppointmentForValidation,
    existingAppointments
  )
  if (!conflictValidation.valid) {
    return conflictValidation
  }

  return { valid: true }
}

/**
 * Formatea el mensaje de error para mostrar al usuario
 *
 * @param validationResult - Resultado de validación
 * @returns Mensaje formateado
 */
export function formatValidationError(validationResult: ValidationResult): string {
  if (validationResult.valid) {
    return ''
  }

  let message = validationResult.error || 'Error de validación desconocido'

  // Agregar detalles adicionales si existen
  if (validationResult.details) {
    const details = validationResult.details

    if (details.conflictingAppointment) {
      const conflict = details.conflictingAppointment
      message += `\n\nCita existente:\n- Hora: ${conflict.hora_inicio} - ${conflict.hora_fin}`
    }

    if (details.duration) {
      message += `\n\nDuración: ${details.duration} minutos`
    }
  }

  return message
}

/**
 * Códigos de error de validación
 */
export const VALIDATION_ERROR_CODES = {
  MISSING_DATE: 'MISSING_DATE',
  MISSING_START_TIME: 'MISSING_START_TIME',
  MISSING_END_TIME: 'MISSING_END_TIME',
  MISSING_THERAPIST: 'MISSING_THERAPIST',
  MISSING_PATIENT: 'MISSING_PATIENT',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  INVALID_TIME_FORMAT: 'INVALID_TIME_FORMAT',
  INVALID_TIME_RANGE: 'INVALID_TIME_RANGE',
  DURATION_TOO_SHORT: 'DURATION_TOO_SHORT',
  DURATION_TOO_LONG: 'DURATION_TOO_LONG',
  TIME_CONFLICT: 'TIME_CONFLICT',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  INVALID_INITIAL_STATE: 'INVALID_INITIAL_STATE',
  APPOINTMENT_IN_PAST: 'APPOINTMENT_IN_PAST',
  OUTSIDE_BUSINESS_HOURS: 'OUTSIDE_BUSINESS_HOURS'
} as const

export type ValidationErrorCode = keyof typeof VALIDATION_ERROR_CODES
