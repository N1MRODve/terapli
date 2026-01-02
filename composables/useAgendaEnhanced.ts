/**
 * =============================================================================
 * COMPOSABLE: useAgendaEnhanced
 * =============================================================================
 *
 * Versión mejorada de useAgenda con:
 * - Validación robusta de conflictos
 * - Logging estructurado
 * - Optimistic UI con rollback
 * - Manejo de timezone
 * - Máquina de estados estricta
 */

import { ref, computed } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { validateStateTransition, type AppointmentForValidation, formatValidationError } from '~/utils/appointment-validation'
import { agendaLogger } from '~/utils/agenda-logger'
import type { Cita } from './useAgenda'

export interface CreateAppointmentParams {
  paciente_id: string
  fecha_cita: string
  hora_inicio: string
  hora_fin: string
  modalidad?: 'presencial' | 'online' | 'telefonica'
  estado?: 'pendiente' | 'confirmada'
  ubicacion?: string
  enlace_videollamada?: string
  observaciones?: string
  bono_id?: string
  descontar_de_bono?: boolean
}

export interface UpdateAppointmentParams {
  id: string
  fecha_cita?: string
  hora_inicio?: string
  hora_fin?: string
  estado?: string
  modalidad?: string
  ubicacion?: string
  enlace_videollamada?: string
  observaciones?: string
  notas_terapeuta?: string
}

export interface ValidationError {
  valid: false
  error: string
  errorCode: string
  details?: Record<string, any>
}

export interface ValidationSuccess {
  valid: true
}

export type ValidationResult = ValidationSuccess | ValidationError

export function useAgendaEnhanced() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Estado
  const citas = ref<Cita[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdate = ref<Date | null>(null)

  // Estado optimista
  const optimisticUpdates = ref<Map<string, any>>(new Map())

  /**
   * Valida una cita contra el servidor (conflictos, reglas de negocio)
   */
  async function validateAppointment(params: CreateAppointmentParams | UpdateAppointmentParams): Promise<ValidationResult> {
    try {
      agendaLogger.debug('api_error', 'Validando cita', params)

      const response = await $fetch('/api/appointments/validate-conflict', {
        method: 'POST',
        body: params
      })

      if (response.valid) {
        agendaLogger.info('api_error', 'Validación exitosa')
        return { valid: true }
      }

      agendaLogger.warn('conflict', 'Validación fallida', response)
      return response as ValidationError

    } catch (err: any) {
      agendaLogger.error('api_error', 'Error validando cita', err)
      return {
        valid: false,
        error: err.data?.message || err.message || 'Error al validar cita',
        errorCode: 'VALIDATION_ERROR'
      }
    }
  }

  /**
   * Crea una nueva cita con validación robusta
   */
  async function createAppointment(params: CreateAppointmentParams): Promise<{ success: boolean; data?: Cita; error?: string }> {
    try {
      loading.value = true
      error.value = null

      agendaLogger.clickCreate(params.fecha_cita, params.hora_inicio)

      // 1. Validar primero
      const validation = await validateAppointment(params)
      if (!validation.valid) {
        const errorMsg = formatValidationError(validation)
        error.value = errorMsg
        return { success: false, error: errorMsg }
      }

      // 2. Crear en el servidor
      const response = await $fetch('/api/appointments/create', {
        method: 'POST',
        body: params
      })

      if (!response.success) {
        throw new Error(response.message || 'Error al crear cita')
      }

      const newCita = response.data as Cita

      // 3. Agregar a la lista local
      citas.value.push(newCita)

      agendaLogger.create(newCita.id, params.fecha_cita, params.hora_inicio)

      lastUpdate.value = new Date()

      return { success: true, data: newCita }

    } catch (err: any) {
      const errorMsg = err.data?.message || err.message || 'Error al crear la cita'
      error.value = errorMsg
      agendaLogger.error('api_error', errorMsg, err)
      return { success: false, error: errorMsg }

    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza una cita con optimistic UI y rollback
   */
  async function updateAppointment(params: UpdateAppointmentParams): Promise<{ success: boolean; data?: Cita; error?: string }> {
    try {
      loading.value = true
      error.value = null

      const citaId = params.id

      // 1. Guardar estado anterior (para rollback)
      const citaIndex = citas.value.findIndex(c => c.id === citaId)
      if (citaIndex === -1) {
        throw new Error('Cita no encontrada')
      }

      const previousState = { ...citas.value[citaIndex] }
      optimisticUpdates.value.set(citaId, previousState)

      // 2. Aplicar cambio optimista en UI
      const updatedFields: Partial<Cita> = {}
      if (params.fecha_cita) updatedFields.fecha_cita = params.fecha_cita
      if (params.hora_inicio) updatedFields.hora_inicio = params.hora_inicio
      if (params.hora_fin) updatedFields.hora_fin = params.hora_fin
      if (params.estado) updatedFields.estado = params.estado as any
      if (params.modalidad) updatedFields.modalidad = params.modalidad as any

      citas.value[citaIndex] = { ...citas.value[citaIndex], ...updatedFields }

      agendaLogger.optimisticUpdate(citaId, 'update')

      // 3. Solo validar conflictos si se cambia fecha/hora
      // Cambios de estado no requieren validación de conflictos
      const isDateTimeChange = params.fecha_cita || params.hora_inicio || params.hora_fin

      if (isDateTimeChange) {
        // Construir objeto con todos los campos requeridos para validación
        const validationParams = {
          id: citaId,
          fecha_cita: params.fecha_cita || previousState.fecha_cita,
          hora_inicio: params.hora_inicio || previousState.hora_inicio,
          hora_fin: params.hora_fin || previousState.hora_fin,
          terapeuta_id: previousState.terapeuta_id,
          estado: params.estado || previousState.estado,
          previous_estado: previousState.estado
        }

        const validation = await validateAppointment(validationParams as any)

        if (!validation.valid) {
          // Rollback
          citas.value[citaIndex] = previousState
          optimisticUpdates.value.delete(citaId)

          const errorMsg = formatValidationError(validation)
          error.value = errorMsg
          agendaLogger.rollback(citaId, errorMsg)

          return { success: false, error: errorMsg }
        }
      }

      // 4. Actualizar en servidor
      const response = await $fetch(`/api/appointments/${citaId}/update`, {
        method: 'PATCH',
        body: params
      })

      if (!response.success) {
        // Rollback
        citas.value[citaIndex] = previousState
        optimisticUpdates.value.delete(citaId)
        agendaLogger.rollback(citaId, response.message || 'Error desconocido')

        throw new Error(response.message || 'Error al actualizar cita')
      }

      const updatedCita = response.data as Cita

      // 5. Reemplazar con datos del servidor
      citas.value[citaIndex] = updatedCita
      optimisticUpdates.value.delete(citaId)

      agendaLogger.update(citaId, params)

      lastUpdate.value = new Date()

      return { success: true, data: updatedCita }

    } catch (err: any) {
      const errorMsg = err.data?.message || err.message || 'Error al actualizar la cita'
      error.value = errorMsg
      agendaLogger.error('api_error', errorMsg, err)

      // Asegurar rollback
      const citaId = params.id
      const previousState = optimisticUpdates.value.get(citaId)
      if (previousState) {
        const citaIndex = citas.value.findIndex(c => c.id === citaId)
        if (citaIndex !== -1) {
          citas.value[citaIndex] = previousState
        }
        optimisticUpdates.value.delete(citaId)
        agendaLogger.rollback(citaId, errorMsg)
      }

      return { success: false, error: errorMsg }

    } finally {
      loading.value = false
    }
  }

  /**
   * Mueve una cita a nueva fecha/hora (drag & drop)
   */
  async function moveAppointment(
    citaId: string,
    newDate: string,
    newStartTime: string,
    newEndTime?: string
  ): Promise<{ success: boolean; data?: Cita; error?: string }> {
    const cita = citas.value.find(c => c.id === citaId)
    if (!cita) {
      return { success: false, error: 'Cita no encontrada' }
    }

    // Calcular hora_fin si no se proporciona (mantener misma duración)
    let endTime = newEndTime
    if (!endTime) {
      const [startHours, startMinutes] = cita.hora_inicio.split(':').map(Number)
      const [endHours, endMinutes] = cita.hora_fin.split(':').map(Number)
      const duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes)

      const [newHours, newMinutes] = newStartTime.split(':').map(Number)
      const newEndTotalMinutes = (newHours * 60 + newMinutes) + duration
      const newEndHours = Math.floor(newEndTotalMinutes / 60)
      const newEndMinutes = newEndTotalMinutes % 60

      endTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`
    }

    agendaLogger.dragStart(citaId, {
      date: cita.fecha_cita,
      time: cita.hora_inicio
    })

    const result = await updateAppointment({
      id: citaId,
      fecha_cita: newDate,
      hora_inicio: newStartTime,
      hora_fin: endTime
    })

    agendaLogger.dragEnd(
      citaId,
      { date: newDate, time: newStartTime },
      result.success
    )

    if (result.success) {
      agendaLogger.move(
        citaId,
        { date: cita.fecha_cita, time: cita.hora_inicio },
        { date: newDate, time: newStartTime }
      )
    }

    return result
  }

  /**
   * Cambia el estado de una cita con validación de transición
   */
  async function changeAppointmentStatus(
    citaId: string,
    newStatus: string
  ): Promise<{ success: boolean; data?: Cita; error?: string }> {
    const cita = citas.value.find(c => c.id === citaId)
    if (!cita) {
      return { success: false, error: 'Cita no encontrada' }
    }

    // Validar transición de estado
    const stateValidation = validateStateTransition(cita.estado, newStatus)
    if (!stateValidation.valid) {
      const errorMsg = stateValidation.error || 'Transición de estado inválida'
      error.value = errorMsg
      return { success: false, error: errorMsg }
    }

    agendaLogger.statusChange(citaId, cita.estado, newStatus)

    return await updateAppointment({
      id: citaId,
      estado: newStatus
    })
  }

  /**
   * Mapea los datos de la vista a la interfaz Cita
   * La vista usa nombres como cita_id, paciente_id, etc.
   * Nota: Algunas vistas retornan 'id' directamente, otras 'cita_id'
   */
  function mapViewDataToCita(row: any): Cita {
    return {
      id: row.cita_id || row.id,
      fecha_cita: row.fecha_cita,
      hora_inicio: row.hora_inicio,
      hora_fin: row.hora_fin,
      duracion_minutos: row.duracion_minutos || 60, // Default 60 min
      estado: row.estado,
      modalidad: row.modalidad,
      observaciones: row.observaciones,
      notas_terapeuta: row.notas_terapeuta,
      enlace_videollamada: row.enlace_videollamada,
      paciente_id: row.paciente_id,
      terapeuta_id: row.terapeuta_id,
      bono_id: row.bono_id,
      sesion_descontada: row.sesion_descontada || false,
      consumo_registrado: row.consumo_registrado || false,
      ubicacion: row.ubicacion,
      descontar_de_bono: row.descontar_de_bono,
      paciente: {
        id: row.paciente_id,
        nombre_completo: row.paciente_nombre || 'Sin nombre',
        telefono: row.paciente_telefono,
        email: row.paciente_email
      },
      bono: row.bono_id ? {
        id: row.bono_id,
        sesiones_restantes: row.bono_sesiones_restantes || 0,
        sesiones_totales: row.bono_sesiones_totales || 0,
        estado: row.bono_estado || 'activo'
      } : undefined
    }
  }

  /**
   * Carga citas en un rango de fechas
   */
  async function loadAppointmentsInRange(from: string, to: string): Promise<void> {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('vista_agenda_terapeutas')
        .select('*')
        .gte('fecha_cita', from)
        .lte('fecha_cita', to)
        .order('fecha_cita', { ascending: true })
        .order('hora_inicio', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      // Mapear datos de la vista a la interfaz Cita
      citas.value = (data || []).map(mapViewDataToCita)

      agendaLogger.loadRange(from, to, citas.value.length)

      lastUpdate.value = new Date()

    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar citas'
      error.value = errorMsg
      agendaLogger.error('api_error', errorMsg, err)

    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina una cita permanentemente
   */
  async function deleteAppointment(citaId: string): Promise<{ success: boolean; error?: string }> {
    try {
      loading.value = true
      error.value = null

      agendaLogger.info('delete', `Eliminando cita ${citaId}`)

      // 1. Verificar que la cita existe
      const citaIndex = citas.value.findIndex(c => c.id === citaId)
      if (citaIndex === -1) {
        throw new Error('Cita no encontrada')
      }

      const cita = citas.value[citaIndex]

      // 2. Si la cita tiene bono y ya descontó sesión, reintegrar
      if (cita.bono_id && cita.sesion_descontada) {
        const { error: reintegrarError } = await supabase.rpc('reintegrar_sesion_bono', {
          p_cita_id: citaId
        })

        if (reintegrarError) {
          agendaLogger.warn('delete', `No se pudo reintegrar sesión del bono: ${reintegrarError.message}`)
          // Continuamos con la eliminación aunque falle el reintegro
        }
      }

      // 3. Eliminar la cita de la base de datos
      const { error: deleteError } = await supabase
        .from('citas')
        .delete()
        .eq('id', citaId)

      if (deleteError) {
        throw deleteError
      }

      // 4. Eliminar de la lista local
      citas.value.splice(citaIndex, 1)

      agendaLogger.info('delete', `Cita ${citaId} eliminada correctamente`)

      lastUpdate.value = new Date()

      return { success: true }

    } catch (err: any) {
      const errorMsg = err.message || 'Error al eliminar la cita'
      error.value = errorMsg
      agendaLogger.error('api_error', errorMsg, err)
      return { success: false, error: errorMsg }

    } finally {
      loading.value = false
    }
  }

  /**
   * Recarga las citas actuales
   */
  async function refreshAppointments(): Promise<void> {
    if (citas.value.length === 0) return

    const dates = citas.value.map(c => c.fecha_cita)
    const minDate = Math.min(...dates.map(d => new Date(d).getTime()))
    const maxDate = Math.max(...dates.map(d => new Date(d).getTime()))

    const from = new Date(minDate).toISOString().split('T')[0]
    const to = new Date(maxDate).toISOString().split('T')[0]

    await loadAppointmentsInRange(from, to)
  }

  /**
   * Carga citas del terapeuta autenticado
   */
  async function loadTerapeutaAppointments(): Promise<void> {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('vista_agenda_terapeutas')
        .select('*')
        .order('fecha_cita', { ascending: true })
        .order('hora_inicio', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      // Mapear datos de la vista a la interfaz Cita
      citas.value = (data || []).map(mapViewDataToCita)

      agendaLogger.info('load_range', `Citas del terapeuta cargadas: ${citas.value.length}`)

      lastUpdate.value = new Date()

    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar citas'
      error.value = errorMsg
      agendaLogger.error('api_error', errorMsg, err)

    } finally {
      loading.value = false
    }
  }

  /**
   * Carga TODAS las citas (para coordinadora)
   */
  async function loadAllAppointments(): Promise<void> {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('vista_agenda_terapeutas')
        .select('*')
        .order('fecha_cita', { ascending: true })
        .order('hora_inicio', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      // Mapear datos de la vista a la interfaz Cita
      citas.value = (data || []).map(mapViewDataToCita)

      agendaLogger.info('load_range', `Todas las citas cargadas (coordinadora): ${citas.value.length}`)

      lastUpdate.value = new Date()

    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar citas'
      error.value = errorMsg
      agendaLogger.error('api_error', errorMsg, err)

    } finally {
      loading.value = false
    }
  }

  // Computadas
  const hasError = computed(() => error.value !== null)
  const isLoading = computed(() => loading.value)
  const lastUpdateTime = computed(() => {
    if (!lastUpdate.value) return null
    const now = new Date()
    const diff = now.getTime() - lastUpdate.value.getTime()
    const seconds = Math.floor(diff / 1000)

    if (seconds < 60) return `Actualizado hace ${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `Actualizado hace ${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `Actualizado hace ${hours}h`
  })

  // Computadas de filtros (compatibilidad con useAgenda)
  const citasDelDia = computed(() => {
    const hoy = new Date().toISOString().split('T')[0]
    return citas.value.filter(c => c.fecha_cita === hoy)
  })

  const citasPendientes = computed(() => {
    return citas.value.filter(c => c.estado === 'pendiente')
  })

  const citasCompletadas = computed(() => {
    return citas.value.filter(c => c.estado === 'completada' || c.estado === 'realizada')
  })

  const citasConBonoProximoAgotar = computed(() => {
    return citas.value.filter(c => {
      if (!c.bono) return false
      const sesionesRestantes = c.bono.sesiones_restantes || 0
      return sesionesRestantes > 0 && sesionesRestantes <= 2
    })
  })

  return {
    // Estado
    citas,
    loading: isLoading,
    error: hasError,
    lastUpdateTime,

    // Computadas de filtros
    citasDelDia,
    citasPendientes,
    citasCompletadas,
    citasConBonoProximoAgotar,

    // Métodos
    validateAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    moveAppointment,
    changeAppointmentStatus,
    loadAppointmentsInRange,
    loadTerapeutaAppointments,
    loadAllAppointments,
    refreshAppointments,

    // Utilidades
    clearError: () => { error.value = null }
  }
}
