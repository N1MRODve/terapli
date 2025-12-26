/**
 * =============================================================================
 * TIMEZONE UTILITIES
 * =============================================================================
 *
 * Gestión robusta de zonas horarias para la agenda.
 *
 * REGLAS:
 * 1. Todos los timestamps se guardan en UTC en la base de datos
 * 2. Se convierten a timezone local (Europe/Madrid) en la UI
 * 3. Se manejan correctamente los cambios DST (horario de verano)
 *
 * FORMATO DB:
 * - start_at: timestamptz (UTC)
 * - end_at: timestamptz (UTC)
 *
 * FORMATO UI:
 * - fecha: string "YYYY-MM-DD" (fecha local)
 * - hora: string "HH:MM" (hora local)
 */

export const DEFAULT_TIMEZONE = 'Europe/Madrid'

/**
 * Convierte fecha y hora local a timestamp UTC
 *
 * @param dateStr - Fecha en formato "YYYY-MM-DD"
 * @param timeStr - Hora en formato "HH:MM"
 * @param timezone - Timezone (default: Europe/Madrid)
 * @returns ISO string en UTC
 *
 * @example
 * toUTC('2025-03-30', '10:00') // '2025-03-30T09:00:00.000Z' (antes DST)
 * toUTC('2025-03-31', '10:00') // '2025-03-30T08:00:00.000Z' (después DST)
 */
export function toUTC(
  dateStr: string,
  timeStr: string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  // Crear fecha en timezone local
  const [hours, minutes] = timeStr.split(':').map(Number)
  const dateTime = new Date(`${dateStr}T${timeStr}:00`)

  // Obtener offset del timezone en minutos
  const offset = getTimezoneOffset(dateTime, timezone)

  // Ajustar a UTC
  const utcDate = new Date(dateTime.getTime() - offset * 60000)

  return utcDate.toISOString()
}

/**
 * Convierte timestamp UTC a fecha y hora local
 *
 * @param utcTimestamp - ISO string en UTC
 * @param timezone - Timezone (default: Europe/Madrid)
 * @returns { date, time } en formato local
 *
 * @example
 * fromUTC('2025-03-30T09:00:00.000Z') // { date: '2025-03-30', time: '10:00' }
 */
export function fromUTC(
  utcTimestamp: string,
  timezone: string = DEFAULT_TIMEZONE
): { date: string; time: string; dateTime: Date } {
  const utcDate = new Date(utcTimestamp)

  // Obtener offset del timezone en minutos
  const offset = getTimezoneOffset(utcDate, timezone)

  // Ajustar a timezone local
  const localDate = new Date(utcDate.getTime() + offset * 60000)

  const date = localDate.toISOString().split('T')[0]
  const time = localDate.toISOString().split('T')[1].substring(0, 5)

  return { date, time, dateTime: localDate }
}

/**
 * Obtiene el offset de un timezone en minutos para una fecha específica
 * Maneja correctamente DST (Daylight Saving Time)
 *
 * @param date - Fecha para calcular offset
 * @param timezone - Timezone IANA (ej: 'Europe/Madrid')
 * @returns Offset en minutos
 */
export function getTimezoneOffset(date: Date, timezone: string): number {
  // Usar Intl.DateTimeFormat para obtener el offset correcto
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  const parts = formatter.formatToParts(date)
  const localDateStr = parts.reduce((acc, part) => {
    if (part.type === 'year') return acc + part.value + '-'
    if (part.type === 'month') return acc + part.value + '-'
    if (part.type === 'day') return acc + part.value + 'T'
    if (part.type === 'hour') return acc + part.value + ':'
    if (part.type === 'minute') return acc + part.value + ':'
    if (part.type === 'second') return acc + part.value
    return acc
  }, '')

  const localDate = new Date(localDateStr)
  const utcDate = new Date(date.toISOString())

  // Offset en minutos (positivo para timezones al este de UTC)
  const offsetMs = localDate.getTime() - utcDate.getTime()
  return Math.round(offsetMs / 60000)
}

/**
 * Formatea una fecha a formato legible
 *
 * @param date - Fecha a formatear
 * @param format - 'short' | 'medium' | 'long' | 'full'
 * @returns String formateado
 *
 * @example
 * formatDate('2025-03-30', 'long') // 'domingo, 30 de marzo de 2025'
 */
export function formatDate(
  dateStr: string,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  const date = new Date(dateStr + 'T00:00:00')

  const options: Intl.DateTimeFormatOptions = {
    timeZone: DEFAULT_TIMEZONE
  }

  switch (format) {
    case 'short':
      options.day = '2-digit'
      options.month = '2-digit'
      options.year = 'numeric'
      break
    case 'medium':
      options.day = 'numeric'
      options.month = 'short'
      options.year = 'numeric'
      break
    case 'long':
      options.weekday = 'long'
      options.day = 'numeric'
      options.month = 'long'
      options.year = 'numeric'
      break
    case 'full':
      options.weekday = 'long'
      options.day = 'numeric'
      options.month = 'long'
      options.year = 'numeric'
      options.hour = '2-digit'
      options.minute = '2-digit'
      break
  }

  return date.toLocaleDateString('es-ES', options)
}

/**
 * Formatea una hora a formato legible
 *
 * @param timeStr - Hora en formato "HH:MM" o "HH:MM:SS"
 * @param includeSeconds - Incluir segundos
 * @returns String formateado
 *
 * @example
 * formatTime('14:30') // '14:30'
 * formatTime('14:30:45', true) // '14:30:45'
 */
export function formatTime(timeStr: string, includeSeconds: boolean = false): string {
  const parts = timeStr.split(':')
  if (includeSeconds && parts.length >= 3) {
    return `${parts[0]}:${parts[1]}:${parts[2]}`
  }
  return `${parts[0]}:${parts[1]}`
}

/**
 * Calcula la hora de fin sumando duración en minutos
 *
 * @param startTime - Hora de inicio "HH:MM"
 * @param durationMinutes - Duración en minutos
 * @returns Hora de fin "HH:MM"
 *
 * @example
 * addMinutes('10:00', 60) // '11:00'
 * addMinutes('23:30', 45) // '00:15'
 */
export function addMinutes(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  date.setMinutes(date.getMinutes() + durationMinutes)

  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')

  return `${h}:${m}`
}

/**
 * Verifica si dos rangos de tiempo se superponen
 *
 * @param start1 - Inicio del primer rango
 * @param end1 - Fin del primer rango
 * @param start2 - Inicio del segundo rango
 * @param end2 - Fin del segundo rango
 * @returns true si se superponen
 *
 * @example
 * timeRangesOverlap('10:00', '11:00', '10:30', '11:30') // true
 * timeRangesOverlap('10:00', '11:00', '11:00', '12:00') // false
 */
export function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && start2 < end1
}

/**
 * Calcula la duración en minutos entre dos horas
 *
 * @param startTime - Hora de inicio "HH:MM"
 * @param endTime - Hora de fin "HH:MM"
 * @returns Duración en minutos
 *
 * @example
 * getDurationMinutes('10:00', '11:30') // 90
 */
export function getDurationMinutes(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)

  const startTotalMinutes = startHours * 60 + startMinutes
  const endTotalMinutes = endHours * 60 + endMinutes

  return endTotalMinutes - startTotalMinutes
}

/**
 * Verifica si una fecha es fin de semana
 *
 * @param dateStr - Fecha en formato "YYYY-MM-DD"
 * @returns true si es sábado o domingo
 */
export function isWeekend(dateStr: string): boolean {
  const date = new Date(dateStr + 'T00:00:00')
  const day = date.getDay()
  return day === 0 || day === 6
}

/**
 * Obtiene el primer día de la semana (lunes) para una fecha dada
 *
 * @param date - Fecha de referencia
 * @returns Fecha del lunes de esa semana
 */
export function getWeekStart(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Obtiene el último día de la semana (domingo) para una fecha dada
 *
 * @param date - Fecha de referencia
 * @returns Fecha del domingo de esa semana
 */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date)
  const result = new Date(start)
  result.setDate(start.getDate() + 6)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Genera un array de fechas para una semana
 *
 * @param startDate - Fecha de inicio (lunes)
 * @returns Array de 7 fechas (lunes a domingo)
 */
export function getWeekDates(startDate: Date): string[] {
  const dates: string[] = []
  const current = new Date(startDate)

  for (let i = 0; i < 7; i++) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * Obtiene el nombre del día de la semana
 *
 * @param dateStr - Fecha en formato "YYYY-MM-DD"
 * @param short - Si es true, retorna versión corta (Lun, Mar, etc.)
 * @returns Nombre del día
 */
export function getDayName(dateStr: string, short: boolean = false): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-ES', {
    weekday: short ? 'short' : 'long',
    timeZone: DEFAULT_TIMEZONE
  })
}

/**
 * Compara si dos fechas son el mismo día
 *
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns true si son el mismo día
 */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? date1.split('T')[0] : date1.toISOString().split('T')[0]
  const d2 = typeof date2 === 'string' ? date2.split('T')[0] : date2.toISOString().split('T')[0]
  return d1 === d2
}

/**
 * Verifica si una fecha es hoy
 *
 * @param dateStr - Fecha en formato "YYYY-MM-DD"
 * @returns true si es hoy
 */
export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

/**
 * Verifica si una fecha es futura
 *
 * @param dateStr - Fecha en formato "YYYY-MM-DD"
 * @returns true si es futura
 */
export function isFuture(dateStr: string): boolean {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date > today
}

/**
 * Verifica si una fecha/hora ya pasó
 *
 * @param dateStr - Fecha en formato "YYYY-MM-DD"
 * @param timeStr - Hora en formato "HH:MM"
 * @returns true si ya pasó
 */
export function isPast(dateStr: string, timeStr: string): boolean {
  const dateTime = new Date(`${dateStr}T${timeStr}:00`)
  return dateTime < new Date()
}
