/**
 * =============================================================================
 * API ENDPOINT: Actualizar cita (mover, editar, cambiar estado)
 * =============================================================================
 *
 * PATCH /api/appointments/:id/update
 *
 * Actualiza una cita existente con validación robusta.
 *
 * CASOS DE USO:
 * - Mover cita (drag & drop): cambiar fecha/hora
 * - Editar detalles: modalidad, ubicación, notas
 * - Cambiar estado: pending → confirmed → completed
 *
 * VALIDACIONES:
 * - Conflictos de horario (si se mueve)
 * - Transiciones de estado válidas
 * - Permisos (solo terapeuta asignado o admin)
 */

import { createServerClient } from '@supabase/ssr'
import { validateAppointment, validateStateTransition, formatValidationError, type AppointmentForValidation } from '~/utils/appointment-validation'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()

  try {
    // 1. Obtener ID de la cita desde la ruta
    const citaId = getRouterParam(event, 'id')

    if (!citaId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de cita no proporcionado'
      })
    }

    // 2. Obtener configuración de runtime (credenciales Supabase)
    const config = useRuntimeConfig()
    const supabaseUrl = config.supabaseUrl || config.public.supabaseUrl
    const supabaseKey = config.supabaseKey || config.public.supabaseKey

    if (!supabaseUrl || !supabaseKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Configuración de Supabase no disponible'
      })
    }

    // 3. Autenticación
    const supabaseClient = await createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get: (name) => getCookie(event, name),
          set: (name, value, options) => setCookie(event, name, value, options),
          remove: (name, options) => deleteCookie(event, name, options)
        }
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No autenticado'
      })
    }

    // 3. Obtener perfil
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No se pudo obtener el perfil del usuario'
      })
    }

    const isTerapeuta = profile.rol === 'psicologa'
    const isAdmin = profile.rol === 'admin'
    const isCoordinadora = profile.rol === 'coordinadora'

    // Roles autorizados: terapeuta, admin y coordinadora
    if (!isTerapeuta && !isAdmin && !isCoordinadora) {
      throw createError({
        statusCode: 403,
        statusMessage: `El rol "${profile.rol}" no tiene permisos para actualizar citas. Roles permitidos: psicologa, coordinadora, admin.`
      })
    }

    // 4. Obtener la cita existente
    const { data: existingCita, error: fetchError } = await supabaseClient
      .from('citas')
      .select('*')
      .eq('id', citaId)
      .single()

    if (fetchError || !existingCita) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Cita no encontrada'
      })
    }

    // 5. Verificar permisos: terapeuta solo puede actualizar sus propias citas
    // Coordinadoras y admins pueden actualizar citas de cualquier terapeuta
    if (isTerapeuta && existingCita.terapeuta_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Como terapeuta, solo puedes actualizar tus propias citas'
      })
    }

    // 6. Obtener datos de actualización
    const body = await readBody(event)
    const {
      fecha_cita,
      hora_inicio,
      hora_fin,
      estado,
      modalidad,
      ubicacion,
      enlace_videollamada,
      observaciones,
      notas_terapeuta
    } = body

    // 7. Si se cambia el estado, validar la transición
    if (estado && estado !== existingCita.estado) {
      const stateValidation = validateStateTransition(existingCita.estado, estado)
      if (!stateValidation.valid) {
        throw createError({
          statusCode: 422,
          statusMessage: stateValidation.error,
          data: {
            errorCode: stateValidation.errorCode,
            details: stateValidation.details
          }
        })
      }
    }

    // 8. Si se cambia fecha/hora, validar conflictos
    const isMoving = fecha_cita || hora_inicio || hora_fin
    if (isMoving) {
      const newFecha = fecha_cita || existingCita.fecha_cita
      const newHoraInicio = hora_inicio || existingCita.hora_inicio
      const newHoraFin = hora_fin || existingCita.hora_fin

      // Obtener otras citas del terapeuta ese día (excluyendo esta)
      const { data: otherAppointments, error: queryError } = await supabaseClient
        .from('citas')
        .select('id, fecha_cita, hora_inicio, hora_fin, terapeuta_id, estado')
        .eq('terapeuta_id', existingCita.terapeuta_id)
        .eq('fecha_cita', newFecha)
        .neq('id', citaId)
        .neq('estado', 'cancelada')

      if (queryError) {
        console.error('[UPDATE] Error al obtener citas existentes:', queryError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Error al verificar conflictos'
        })
      }

      // Validar
      const appointmentToValidate: AppointmentForValidation = {
        id: citaId,
        fecha_cita: newFecha,
        hora_inicio: newHoraInicio,
        hora_fin: newHoraFin,
        terapeuta_id: existingCita.terapeuta_id,
        estado: estado || existingCita.estado
      }

      const validation = validateAppointment(
        appointmentToValidate,
        (otherAppointments || []) as AppointmentForValidation[]
      )

      if (!validation.valid) {
        console.warn('[UPDATE] Validación fallida:', validation)
        throw createError({
          statusCode: 422,
          statusMessage: formatValidationError(validation),
          data: {
            errorCode: validation.errorCode,
            details: validation.details
          }
        })
      }
    }

    // 9. Preparar datos de actualización
    const updates: any = {
      updated_at: new Date().toISOString()
    }

    if (fecha_cita) updates.fecha_cita = fecha_cita
    if (hora_inicio) updates.hora_inicio = hora_inicio.length === 5 ? `${hora_inicio}:00` : hora_inicio
    if (hora_fin) updates.hora_fin = hora_fin.length === 5 ? `${hora_fin}:00` : hora_fin
    if (estado) updates.estado = estado
    if (modalidad) updates.modalidad = modalidad
    if (ubicacion !== undefined) updates.ubicacion = ubicacion
    if (enlace_videollamada !== undefined) updates.enlace_videollamada = enlace_videollamada
    if (observaciones !== undefined) updates.observaciones = observaciones
    if (notas_terapeuta !== undefined) updates.notas_terapeuta = notas_terapeuta

    // 10. Actualizar en la base de datos
    const { data: updatedCita, error: updateError } = await supabaseClient
      .from('citas')
      .update(updates)
      .eq('id', citaId)
      .select(`
        *,
        pacientes!inner (
          id,
          nombre_completo,
          email,
          telefono
        ),
        terapeutas!inner (
          id,
          nombre_completo
        ),
        bonos (
          id,
          sesiones_restantes,
          sesiones_totales,
          estado
        )
      `)
      .single()

    if (updateError) {
      console.error('[UPDATE] Error al actualizar cita:', updateError)

      if (updateError.message.includes('disponibilidad')) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Conflicto de horario con otra cita'
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: updateError.message || 'Error al actualizar la cita'
      })
    }

    // 11. Log de éxito
    const duration = Date.now() - startTime
    const changes = Object.keys(updates).filter(k => k !== 'updated_at')
    console.info(`[UPDATE] Cita actualizada: ${citaId} (${duration}ms)`, {
      citaId,
      changes,
      duration
    })

    // 12. Retornar respuesta
    return {
      success: true,
      message: 'Cita actualizada exitosamente',
      data: updatedCita
    }

  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`[UPDATE] Error actualizando cita (${duration}ms):`, error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error al actualizar la cita'
    })
  }
})
