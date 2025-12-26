/**
 * =============================================================================
 * AGENDA LOGGER
 * =============================================================================
 *
 * Sistema de logging estructurado para eventos de agenda.
 * Permite debuggear y monitorear la actividad de citas.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type AgendaEventType =
  | 'load_range'
  | 'create'
  | 'update'
  | 'move'
  | 'status_change'
  | 'delete'
  | 'conflict'
  | 'api_error'
  | 'realtime_event'
  | 'optimistic_update'
  | 'rollback'
  | 'drag_start'
  | 'drag_end'
  | 'click_create'
  | 'filter_change'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  event: AgendaEventType
  message: string
  data?: Record<string, any>
  userId?: string
  sessionId?: string
  stack?: string
}

class AgendaLogger {
  private enabled: boolean = true
  private minLevel: LogLevel = 'debug'
  private sessionId: string
  private buffer: LogEntry[] = []
  private maxBufferSize: number = 100

  constructor() {
    this.sessionId = this.generateSessionId()

    // En producción, solo log de warn y error
    if (process.env.NODE_ENV === 'production') {
      this.minLevel = 'warn'
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.minLevel)
    const messageLevelIndex = levels.indexOf(level)

    return messageLevelIndex >= currentLevelIndex
  }

  private formatMessage(entry: LogEntry): string {
    const time = new Date(entry.timestamp).toLocaleTimeString('es-ES')
    const prefix = `[AGENDA ${entry.event.toUpperCase()}]`
    return `${time} ${prefix} ${entry.message}`
  }

  private log(level: LogLevel, event: AgendaEventType, message: string, data?: Record<string, any>) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      message,
      data,
      sessionId: this.sessionId
    }

    // Agregar al buffer
    this.buffer.push(entry)
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift() // Remover el más antiguo
    }

    // Loggear en consola con formato adecuado
    const formattedMessage = this.formatMessage(entry)

    switch (level) {
      case 'debug':
        console.log(`🔍 ${formattedMessage}`, data || '')
        break
      case 'info':
        console.info(`ℹ️ ${formattedMessage}`, data || '')
        break
      case 'warn':
        console.warn(`⚠️ ${formattedMessage}`, data || '')
        break
      case 'error':
        console.error(`❌ ${formattedMessage}`, data || '')
        if (entry.stack) {
          console.error('Stack trace:', entry.stack)
        }
        break
    }
  }

  // Métodos públicos

  debug(event: AgendaEventType, message: string, data?: Record<string, any>) {
    this.log('debug', event, message, data)
  }

  info(event: AgendaEventType, message: string, data?: Record<string, any>) {
    this.log('info', event, message, data)
  }

  warn(event: AgendaEventType, message: string, data?: Record<string, any>) {
    this.log('warn', event, message, data)
  }

  error(event: AgendaEventType, message: string, error?: Error | Record<string, any>) {
    const data = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      : error

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      event,
      message,
      data,
      sessionId: this.sessionId,
      stack: error instanceof Error ? error.stack : undefined
    }

    this.buffer.push(entry)
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift()
    }

    console.error(`❌ ${this.formatMessage(entry)}`, data || '')
    if (entry.stack) {
      console.error('Stack trace:', entry.stack)
    }
  }

  // Métodos específicos de eventos de agenda

  loadRange(from: string, to: string, count: number) {
    this.info('load_range', `Cargadas ${count} citas`, { from, to, count })
  }

  create(appointmentId: string, date: string, time: string) {
    this.info('create', `Cita creada: ${appointmentId}`, { appointmentId, date, time })
  }

  update(appointmentId: string, changes: Record<string, any>) {
    this.info('update', `Cita actualizada: ${appointmentId}`, { appointmentId, changes })
  }

  move(appointmentId: string, from: { date: string; time: string }, to: { date: string; time: string }) {
    this.info('move', `Cita movida: ${appointmentId}`, { appointmentId, from, to })
  }

  statusChange(appointmentId: string, from: string, to: string) {
    this.info('status_change', `Estado cambiado: ${from} → ${to}`, { appointmentId, from, to })
  }

  conflict(appointmentId: string, conflictWith: string, date: string, time: string) {
    this.warn('conflict', `Conflicto de horario detectado`, {
      appointmentId,
      conflictWith,
      date,
      time
    })
  }

  apiError(endpoint: string, error: Error | string) {
    this.error('api_error', `Error en API: ${endpoint}`, error instanceof Error ? error : { message: error })
  }

  realtimeEvent(eventType: string, payload: Record<string, any>) {
    this.debug('realtime_event', `Evento en tiempo real: ${eventType}`, payload)
  }

  optimisticUpdate(appointmentId: string, action: string) {
    this.debug('optimistic_update', `Actualización optimista: ${action}`, { appointmentId, action })
  }

  rollback(appointmentId: string, reason: string) {
    this.warn('rollback', `Rollback de cambio: ${reason}`, { appointmentId, reason })
  }

  dragStart(appointmentId: string, from: { date: string; time: string }) {
    this.debug('drag_start', `Inicio de drag: ${appointmentId}`, { appointmentId, from })
  }

  dragEnd(appointmentId: string, to: { date: string; time: string }, success: boolean) {
    if (success) {
      this.debug('drag_end', `Drag completado exitosamente`, { appointmentId, to })
    } else {
      this.warn('drag_end', `Drag cancelado o fallido`, { appointmentId, to })
    }
  }

  clickCreate(date: string, time: string) {
    this.debug('click_create', `Click para crear cita`, { date, time })
  }

  filterChange(filters: Record<string, any>) {
    this.debug('filter_change', `Filtros actualizados`, { filters })
  }

  // Utilidades

  getBuffer(): LogEntry[] {
    return [...this.buffer]
  }

  clearBuffer() {
    this.buffer = []
  }

  downloadLogs() {
    const logs = this.buffer.map(entry => JSON.stringify(entry)).join('\n')
    const blob = new Blob([logs], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `agenda-logs-${this.sessionId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  setMinLevel(level: LogLevel) {
    this.minLevel = level
  }

  getSessionId(): string {
    return this.sessionId
  }
}

// Singleton global
export const agendaLogger = new AgendaLogger()

// Export default para facilitar importación
export default agendaLogger
