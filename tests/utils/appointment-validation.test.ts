/**
 * =============================================================================
 * TESTS: Appointment validation
 * =============================================================================
 *
 * Tests para validaciones de citas, conflictos, y máquina de estados.
 */

import { describe, it, expect } from 'vitest'
import {
  validateStateTransition,
  hasTimeConflict,
  validateAppointmentConflicts,
  validateAppointmentRules,
  validateAppointment,
  formatValidationError,
  STATE_TRANSITIONS,
  STATUS_MAP,
  type AppointmentForValidation
} from '../../utils/appointment-validation'

describe('Appointment Validation', () => {
  describe('State Transitions', () => {
    it('should allow valid transitions', () => {
      expect(validateStateTransition('pendiente', 'confirmada').valid).toBe(true)
      expect(validateStateTransition('confirmada', 'realizada').valid).toBe(true)
      expect(validateStateTransition('pendiente', 'cancelada').valid).toBe(true)
      expect(validateStateTransition('confirmada', 'cancelada').valid).toBe(true)
    })

    it('should block invalid transitions', () => {
      const result1 = validateStateTransition('realizada', 'pendiente')
      expect(result1.valid).toBe(false)
      expect(result1.errorCode).toBe('INVALID_STATE_TRANSITION')

      const result2 = validateStateTransition('cancelada', 'confirmada')
      expect(result2.valid).toBe(false)

      const result3 = validateStateTransition('realizada', 'confirmada')
      expect(result3.valid).toBe(false)
    })

    it('should handle normalized states', () => {
      // Probar con nombres normalizados (pending, confirmed, etc.)
      expect(validateStateTransition('pending', 'confirmed').valid).toBe(true)
      expect(validateStateTransition('confirmed', 'completed').valid).toBe(true)
      expect(validateStateTransition('completed', 'confirmed').valid).toBe(false)
    })

    it('should provide meaningful error messages', () => {
      const result = validateStateTransition('realizada', 'pendiente')
      expect(result.error).toBeDefined()
      expect(result.error).toContain('No se puede cambiar')
    })
  })

  describe('Time Conflicts', () => {
    const baseAppointment: AppointmentForValidation = {
      id: '1',
      fecha_cita: '2025-01-15',
      hora_inicio: '10:00',
      hora_fin: '11:00',
      terapeuta_id: 'terapeuta-1',
      estado: 'confirmada'
    }

    it('should detect overlapping appointments', () => {
      const overlapping: AppointmentForValidation = {
        id: '2',
        fecha_cita: '2025-01-15',
        hora_inicio: '10:30',
        hora_fin: '11:30',
        terapeuta_id: 'terapeuta-1',
        estado: 'confirmada'
      }

      expect(hasTimeConflict(baseAppointment, overlapping)).toBe(true)
    })

    it('should not detect conflict for different days', () => {
      const differentDay: AppointmentForValidation = {
        ...baseAppointment,
        id: '2',
        fecha_cita: '2025-01-16'
      }

      expect(hasTimeConflict(baseAppointment, differentDay)).toBe(false)
    })

    it('should not detect conflict for different therapists', () => {
      const differentTherapist: AppointmentForValidation = {
        ...baseAppointment,
        id: '2',
        terapeuta_id: 'terapeuta-2'
      }

      expect(hasTimeConflict(baseAppointment, differentTherapist)).toBe(false)
    })

    it('should not detect conflict for consecutive appointments', () => {
      const consecutive: AppointmentForValidation = {
        id: '2',
        fecha_cita: '2025-01-15',
        hora_inicio: '11:00',
        hora_fin: '12:00',
        terapeuta_id: 'terapeuta-1',
        estado: 'confirmada'
      }

      expect(hasTimeConflict(baseAppointment, consecutive)).toBe(false)
    })

    it('should ignore canceled appointments', () => {
      const canceled: AppointmentForValidation = {
        ...baseAppointment,
        id: '2',
        hora_inicio: '10:30',
        estado: 'cancelada'
      }

      expect(hasTimeConflict(baseAppointment, canceled)).toBe(false)
    })

    it('should not conflict with itself (same ID)', () => {
      const sameAppointment: AppointmentForValidation = {
        ...baseAppointment
      }

      expect(hasTimeConflict(baseAppointment, sameAppointment)).toBe(false)
    })

    it('should detect appointment contained within another', () => {
      const contained: AppointmentForValidation = {
        id: '2',
        fecha_cita: '2025-01-15',
        hora_inicio: '10:15',
        hora_fin: '10:45',
        terapeuta_id: 'terapeuta-1',
        estado: 'confirmada'
      }

      expect(hasTimeConflict(baseAppointment, contained)).toBe(true)
    })
  })

  describe('Appointment Conflicts Validation', () => {
    const newAppointment: AppointmentForValidation = {
      fecha_cita: '2025-01-15',
      hora_inicio: '10:00',
      hora_fin: '11:00',
      terapeuta_id: 'terapeuta-1',
      estado: 'pendiente'
    }

    const existingAppointments: AppointmentForValidation[] = [
      {
        id: '1',
        fecha_cita: '2025-01-15',
        hora_inicio: '09:00',
        hora_fin: '10:00',
        terapeuta_id: 'terapeuta-1',
        estado: 'confirmada'
      },
      {
        id: '2',
        fecha_cita: '2025-01-15',
        hora_inicio: '11:00',
        hora_fin: '12:00',
        terapeuta_id: 'terapeuta-1',
        estado: 'confirmada'
      }
    ]

    it('should pass when no conflicts', () => {
      const result = validateAppointmentConflicts(newAppointment, existingAppointments)
      expect(result.valid).toBe(true)
    })

    it('should fail when there is a conflict', () => {
      const conflictingAppointments: AppointmentForValidation[] = [
        {
          id: '1',
          fecha_cita: '2025-01-15',
          hora_inicio: '10:30',
          hora_fin: '11:30',
          terapeuta_id: 'terapeuta-1',
          estado: 'confirmada'
        }
      ]

      const result = validateAppointmentConflicts(newAppointment, conflictingAppointments)
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('TIME_CONFLICT')
      expect(result.error).toContain('Conflicto de horario')
    })
  })

  describe('Appointment Rules Validation', () => {
    it('should validate required fields', () => {
      const missingDate = {
        hora_inicio: '10:00',
        hora_fin: '11:00',
        terapeuta_id: 'terapeuta-1'
      }
      expect(validateAppointmentRules(missingDate).valid).toBe(false)
      expect(validateAppointmentRules(missingDate).errorCode).toBe('MISSING_DATE')

      const missingStartTime = {
        fecha_cita: '2025-01-15',
        hora_fin: '11:00',
        terapeuta_id: 'terapeuta-1'
      }
      expect(validateAppointmentRules(missingStartTime).valid).toBe(false)
      expect(validateAppointmentRules(missingStartTime).errorCode).toBe('MISSING_START_TIME')

      const missingEndTime = {
        fecha_cita: '2025-01-15',
        hora_inicio: '10:00',
        terapeuta_id: 'terapeuta-1'
      }
      expect(validateAppointmentRules(missingEndTime).valid).toBe(false)
      expect(validateAppointmentRules(missingEndTime).errorCode).toBe('MISSING_END_TIME')

      const missingTherapist = {
        fecha_cita: '2025-01-15',
        hora_inicio: '10:00',
        hora_fin: '11:00'
      }
      expect(validateAppointmentRules(missingTherapist).valid).toBe(false)
      expect(validateAppointmentRules(missingTherapist).errorCode).toBe('MISSING_THERAPIST')
    })

    it('should validate time range', () => {
      const invalidRange = {
        fecha_cita: '2025-01-15',
        hora_inicio: '11:00',
        hora_fin: '10:00',
        terapeuta_id: 'terapeuta-1'
      }

      const result = validateAppointmentRules(invalidRange)
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('INVALID_TIME_RANGE')
    })

    it('should validate minimum duration (15 minutes)', () => {
      const tooShort = {
        fecha_cita: '2025-01-15',
        hora_inicio: '10:00',
        hora_fin: '10:10',
        terapeuta_id: 'terapeuta-1'
      }

      const result = validateAppointmentRules(tooShort)
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('DURATION_TOO_SHORT')
    })

    it('should validate maximum duration (4 hours)', () => {
      const tooLong = {
        fecha_cita: '2025-01-15',
        hora_inicio: '10:00',
        hora_fin: '15:00', // 5 horas
        terapeuta_id: 'terapeuta-1'
      }

      const result = validateAppointmentRules(tooLong)
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('DURATION_TOO_LONG')
    })

    it('should validate date format', () => {
      const invalidDate = {
        fecha_cita: '15/01/2025', // formato incorrecto
        hora_inicio: '10:00',
        hora_fin: '11:00',
        terapeuta_id: 'terapeuta-1'
      }

      const result = validateAppointmentRules(invalidDate)
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('INVALID_DATE_FORMAT')
    })

    it('should validate time format', () => {
      const invalidTime = {
        fecha_cita: '2025-01-15',
        hora_inicio: '10h00', // formato incorrecto
        hora_fin: '11:00',
        terapeuta_id: 'terapeuta-1'
      }

      const result = validateAppointmentRules(invalidTime)
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('INVALID_TIME_FORMAT')
    })

    it('should accept valid appointment', () => {
      const valid = {
        fecha_cita: '2025-01-15',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        terapeuta_id: 'terapeuta-1'
      }

      const result = validateAppointmentRules(valid)
      expect(result.valid).toBe(true)
    })

    it('should accept time with seconds', () => {
      const validWithSeconds = {
        fecha_cita: '2025-01-15',
        hora_inicio: '10:00:00',
        hora_fin: '11:00:00',
        terapeuta_id: 'terapeuta-1'
      }

      const result = validateAppointmentRules(validWithSeconds)
      expect(result.valid).toBe(true)
    })
  })

  describe('Complete Appointment Validation', () => {
    const existingAppointments: AppointmentForValidation[] = [
      {
        id: '1',
        fecha_cita: '2025-01-15',
        hora_inicio: '09:00',
        hora_fin: '10:00',
        terapeuta_id: 'terapeuta-1',
        estado: 'confirmada'
      }
    ]

    it('should validate a correct appointment', () => {
      const valid: Partial<AppointmentForValidation> = {
        fecha_cita: '2025-01-15',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        terapeuta_id: 'terapeuta-1'
      }

      const result = validateAppointment(valid, existingAppointments)
      expect(result.valid).toBe(true)
    })

    it('should fail validation on rules error', () => {
      const invalidDuration: Partial<AppointmentForValidation> = {
        fecha_cita: '2025-01-15',
        hora_inicio: '10:00',
        hora_fin: '10:05', // too short
        terapeuta_id: 'terapeuta-1'
      }

      const result = validateAppointment(invalidDuration, existingAppointments)
      expect(result.valid).toBe(false)
    })

    it('should fail validation on conflict', () => {
      const conflicting: Partial<AppointmentForValidation> = {
        fecha_cita: '2025-01-15',
        hora_inicio: '09:30', // overlaps with existing
        hora_fin: '10:30',
        terapeuta_id: 'terapeuta-1'
      }

      const result = validateAppointment(conflicting, existingAppointments)
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('TIME_CONFLICT')
    })
  })

  describe('Error Formatting', () => {
    it('should format basic error', () => {
      const error = {
        valid: false,
        error: 'Test error message',
        errorCode: 'TEST_ERROR'
      }

      const formatted = formatValidationError(error)
      expect(formatted).toContain('Test error message')
    })

    it('should format error with conflict details', () => {
      const error = {
        valid: false,
        error: 'Conflicto detectado',
        errorCode: 'TIME_CONFLICT',
        details: {
          conflictingAppointment: {
            hora_inicio: '10:00',
            hora_fin: '11:00'
          }
        }
      }

      const formatted = formatValidationError(error)
      expect(formatted).toContain('Conflicto detectado')
      expect(formatted).toContain('10:00')
      expect(formatted).toContain('11:00')
    })

    it('should handle valid result', () => {
      const valid = {
        valid: true
      }

      const formatted = formatValidationError(valid)
      expect(formatted).toBe('')
    })
  })
})
