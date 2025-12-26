/**
 * =============================================================================
 * TESTS: Timezone utilities
 * =============================================================================
 *
 * Tests para conversión de timezones, manejo de DST, y formateo de fechas.
 */

import { describe, it, expect } from 'vitest'
import {
  toUTC,
  fromUTC,
  formatDate,
  formatTime,
  addMinutes,
  timeRangesOverlap,
  getDurationMinutes,
  isWeekend,
  getWeekStart,
  getWeekEnd,
  getDayName,
  isSameDay,
  isToday,
  isFuture,
  isPast
} from '../../utils/timezone'

describe('Timezone Utilities', () => {
  describe('toUTC', () => {
    it('should convert local time to UTC', () => {
      const result = toUTC('2025-01-15', '10:00')
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should handle midnight correctly', () => {
      const result = toUTC('2025-01-15', '00:00')
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should handle end of day correctly', () => {
      const result = toUTC('2025-01-15', '23:59')
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })

  describe('fromUTC', () => {
    it('should convert UTC to local time', () => {
      const utc = '2025-01-15T09:00:00.000Z'
      const result = fromUTC(utc)

      expect(result).toHaveProperty('date')
      expect(result).toHaveProperty('time')
      expect(result).toHaveProperty('dateTime')
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(result.time).toMatch(/^\d{2}:\d{2}$/)
    })
  })

  describe('formatDate', () => {
    it('should format date in short format', () => {
      const result = formatDate('2025-01-15', 'short')
      expect(result).toContain('15')
      expect(result).toContain('01')
      expect(result).toContain('2025')
    })

    it('should format date in medium format', () => {
      const result = formatDate('2025-01-15', 'medium')
      expect(result).toContain('15')
      expect(result).toContain('ene')
      expect(result).toContain('2025')
    })

    it('should format date in long format', () => {
      const result = formatDate('2025-01-15', 'long')
      expect(result).toContain('15')
      expect(result).toContain('enero')
      expect(result).toContain('2025')
    })
  })

  describe('formatTime', () => {
    it('should format time without seconds', () => {
      expect(formatTime('14:30:00')).toBe('14:30')
      expect(formatTime('09:05:45')).toBe('09:05')
    })

    it('should format time with seconds when requested', () => {
      expect(formatTime('14:30:45', true)).toBe('14:30:45')
    })

    it('should handle time without seconds', () => {
      expect(formatTime('14:30')).toBe('14:30')
    })
  })

  describe('addMinutes', () => {
    it('should add minutes correctly', () => {
      expect(addMinutes('10:00', 30)).toBe('10:30')
      expect(addMinutes('10:00', 60)).toBe('11:00')
      expect(addMinutes('10:00', 90)).toBe('11:30')
    })

    it('should handle hour overflow', () => {
      expect(addMinutes('23:30', 45)).toBe('00:15')
      expect(addMinutes('23:00', 120)).toBe('01:00')
    })

    it('should handle adding zero minutes', () => {
      expect(addMinutes('10:00', 0)).toBe('10:00')
    })
  })

  describe('timeRangesOverlap', () => {
    it('should detect overlap', () => {
      expect(timeRangesOverlap('10:00', '11:00', '10:30', '11:30')).toBe(true)
      expect(timeRangesOverlap('10:00', '11:00', '10:00', '11:00')).toBe(true)
      expect(timeRangesOverlap('09:00', '12:00', '10:00', '11:00')).toBe(true)
    })

    it('should detect no overlap', () => {
      expect(timeRangesOverlap('10:00', '11:00', '11:00', '12:00')).toBe(false)
      expect(timeRangesOverlap('10:00', '11:00', '12:00', '13:00')).toBe(false)
      expect(timeRangesOverlap('14:00', '15:00', '10:00', '11:00')).toBe(false)
    })

    it('should handle edge cases', () => {
      // Citas consecutivas (sin overlap)
      expect(timeRangesOverlap('10:00', '11:00', '11:00', '12:00')).toBe(false)

      // Cita dentro de otra
      expect(timeRangesOverlap('10:00', '13:00', '11:00', '12:00')).toBe(true)
    })
  })

  describe('getDurationMinutes', () => {
    it('should calculate duration correctly', () => {
      expect(getDurationMinutes('10:00', '11:00')).toBe(60)
      expect(getDurationMinutes('10:00', '10:30')).toBe(30)
      expect(getDurationMinutes('10:00', '12:00')).toBe(120)
    })

    it('should handle zero duration', () => {
      expect(getDurationMinutes('10:00', '10:00')).toBe(0)
    })

    it('should handle minutes', () => {
      expect(getDurationMinutes('10:15', '10:45')).toBe(30)
      expect(getDurationMinutes('09:30', '10:15')).toBe(45)
    })
  })

  describe('isWeekend', () => {
    it('should detect weekends', () => {
      // Sábado
      expect(isWeekend('2025-01-18')).toBe(true)
      // Domingo
      expect(isWeekend('2025-01-19')).toBe(true)
    })

    it('should detect weekdays', () => {
      // Lunes
      expect(isWeekend('2025-01-20')).toBe(false)
      // Viernes
      expect(isWeekend('2025-01-17')).toBe(false)
    })
  })

  describe('getWeekStart', () => {
    it('should return Monday of the week', () => {
      const wednesday = new Date('2025-01-15') // Miércoles
      const monday = getWeekStart(wednesday)

      expect(monday.getDay()).toBe(1) // 1 = Monday
      expect(monday.getDate()).toBe(13) // 13 de enero es lunes
    })

    it('should handle Monday correctly', () => {
      const monday = new Date('2025-01-13')
      const result = getWeekStart(monday)

      expect(result.getDay()).toBe(1)
      expect(result.getDate()).toBe(13)
    })

    it('should handle Sunday correctly', () => {
      const sunday = new Date('2025-01-19')
      const result = getWeekStart(sunday)

      expect(result.getDay()).toBe(1) // Lunes de esa semana
      expect(result.getDate()).toBe(13)
    })
  })

  describe('getWeekEnd', () => {
    it('should return Sunday of the week', () => {
      const wednesday = new Date('2025-01-15')
      const sunday = getWeekEnd(wednesday)

      expect(sunday.getDay()).toBe(0) // 0 = Sunday
      expect(sunday.getDate()).toBe(19)
    })
  })

  describe('getDayName', () => {
    it('should return day name in long format', () => {
      const result = getDayName('2025-01-15') // Miércoles
      expect(result.toLowerCase()).toContain('miércoles')
    })

    it('should return day name in short format', () => {
      const result = getDayName('2025-01-15', true)
      expect(result.toLowerCase()).toContain('mié')
    })
  })

  describe('isSameDay', () => {
    it('should detect same day', () => {
      expect(isSameDay('2025-01-15', '2025-01-15')).toBe(true)

      const date1 = new Date('2025-01-15T10:00:00Z')
      const date2 = new Date('2025-01-15T20:00:00Z')
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('should detect different days', () => {
      expect(isSameDay('2025-01-15', '2025-01-16')).toBe(false)

      const date1 = new Date('2025-01-15')
      const date2 = new Date('2025-01-16')
      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('isToday', () => {
    it('should detect today', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(isToday(today)).toBe(true)
    })

    it('should detect not today', () => {
      expect(isToday('2020-01-01')).toBe(false)
      expect(isToday('2030-12-31')).toBe(false)
    })
  })

  describe('isFuture', () => {
    it('should detect future dates', () => {
      expect(isFuture('2030-12-31')).toBe(true)
    })

    it('should detect past dates', () => {
      expect(isFuture('2020-01-01')).toBe(false)
    })

    it('should handle today', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(isFuture(today)).toBe(false)
    })
  })

  describe('isPast', () => {
    it('should detect past datetime', () => {
      expect(isPast('2020-01-01', '10:00')).toBe(true)
    })

    it('should detect future datetime', () => {
      expect(isPast('2030-12-31', '23:59')).toBe(false)
    })

    it('should handle current date/time edge cases', () => {
      const now = new Date()
      const futureTime = new Date(now.getTime() + 60000) // +1 minuto
      const futureTimeStr = futureTime.toISOString().substring(11, 16)
      const futureDate = futureTime.toISOString().split('T')[0]

      expect(isPast(futureDate, futureTimeStr)).toBe(false)
    })
  })
})
