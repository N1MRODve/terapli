/**
 * =============================================================================
 * API ENDPOINT: Validar conflictos de citas
 * =============================================================================
 *
 * POST /api/appointments/validate-conflict
 *
 * Valida si una cita nueva o editada tiene conflictos de horario
 * con citas existentes del mismo terapeuta.
 *
 * VALIDACIONES:
 * 1. Conflicto de horario (mismo terapeuta, mismo día, horarios superpuestos)
 * 2. Reglas de negocio (duración mínima/máxima, formato de hora, etc.)
 * 3. Transiciones de estado válidas
 *
 * SEGURIDAD:
 * - Requiere autenticación
 * - RLS: Terapeuta solo puede validar sus propias citas
 */

import { createServerClient } from '@supabase/ssr'
import { validateAppointment, validateStateTransition, formatValidationError, type AppointmentForValidation } from '~/utils/appointment-validation'

export default defineEventHandler(async (event) => {
  try {
    // 1. Obtener configuración de runtime (credenciales Supabase)
    const config = useRuntimeConfig()
    const supabaseUrl = config.supabaseUrl || config.public.supabaseUrl
    const supabaseKey = config.supabaseKey || config.public.supabaseKey

    if (!supabaseUrl || !supabaseKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Configuración de Supabase no disponible'
      })
    }

    // 2. Autenticación
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

    // 3. Obtener perfil para verificar rol
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
        statusMessage: `El rol "${profile.rol}" no tiene permisos para validar citas. Roles permitidos: psicologa, coordinadora, admin.`
      })
    }

    // 4. Obtener datos de la request
    const body = await readBody(event)
    const {
      id,
      fecha_cita,
      hora_inicio,
      hora_fin,
      estado,
      previous_estado
    } = body

    // Determinar terapeuta_id: usar el del body, o inferir del usuario autenticado si es terapeuta
    let terapeuta_id = body.terapeuta_id
    if (!terapeuta_id && isTerapeuta) {
      // Si el usuario es terapeuta y no envió terapeuta_id, usar su propio ID
      terapeuta_id = user.id
    }

    // 4. Validar campos requeridos
    if (!fecha_cita || !hora_inicio || !hora_fin) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Faltan campos obligatorios: fecha_cita, hora_inicio, hora_fin'
      })
    }

    if (!terapeuta_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Se requiere terapeuta_id para admin/coordinadora'
      })
    }

    // 5. Verificar permisos: terapeuta solo puede validar sus propias citas
    // Coordinadoras y admins pueden validar citas de cualquier terapeuta
    if (isTerapeuta && terapeuta_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Como terapeuta, solo puedes validar tus propias citas'
      })
    }

    // 6. Si hay cambio de estado, validar la transición
    if (estado && previous_estado) {
      const stateValidation = validateStateTransition(previous_estado, estado)
      if (!stateValidation.valid) {
        return {
          valid: false,
          error: stateValidation.error,
          errorCode: stateValidation.errorCode,
          details: stateValidation.details
        }
      }
    }

    // 7. Obtener citas existentes del terapeuta en ese día
    let query = supabaseClient
      .from('citas')
      .select('id, fecha_cita, hora_inicio, hora_fin, terapeuta_id, estado')
      .eq('terapeuta_id', terapeuta_id)
      .eq('fecha_cita', fecha_cita)
      .neq('estado', 'cancelada')

    // Si es edición, excluir la cita actual
    if (id) {
      query = query.neq('id', id)
    }

    const { data: existingAppointments, error: queryError } = await query

    if (queryError) {
      console.error('Error al obtener citas existentes:', queryError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al verificar conflictos'
      })
    }

    // 8. Construir objeto de cita para validación
    const appointmentToValidate: AppointmentForValidation = {
      id,
      fecha_cita,
      hora_inicio,
      hora_fin,
      terapeuta_id,
      estado: estado || 'pendiente'
    }

    // 9. Ejecutar validaciones
    const validation = validateAppointment(
      appointmentToValidate,
      (existingAppointments || []) as AppointmentForValidation[]
    )

    // 10. Retornar resultado
    if (!validation.valid) {
      return {
        valid: false,
        error: formatValidationError(validation),
        errorCode: validation.errorCode,
        details: validation.details
      }
    }

    return {
      valid: true,
      message: 'Validación exitosa. No hay conflictos de horario.'
    }

  } catch (error: any) {
    console.error('Error in validate-conflict:', error)

    // Si ya es un error de createError, re-lanzarlo
    if (error.statusCode) {
      throw error
    }

    // Error genérico
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error al validar conflictos de citas'
    })
  }
})
