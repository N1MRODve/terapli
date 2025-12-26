/**
 * =============================================================================
 * API ENDPOINT: Crear cita con validación robusta
 * =============================================================================
 *
 * POST /api/appointments/create
 *
 * Crea una nueva cita con validación de conflictos y reglas de negocio.
 *
 * CARACTERÍSTICAS:
 * - Validación de conflictos de horario
 * - Validación de reglas de negocio
 * - Logging estructurado
 * - Respuesta con datos completos de la cita creada
 */

import { createServerClient } from '@supabase/ssr'
import { validateAppointment, formatValidationError, type AppointmentForValidation } from '~/utils/appointment-validation'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()

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

    // 2. Obtener perfil
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
        statusMessage: `El rol "${profile.rol}" no tiene permisos para crear citas. Roles permitidos: psicologa, coordinadora, admin.`
      })
    }

    // 3. Obtener datos de la request
    const body = await readBody(event)
    const {
      paciente_id,
      fecha_cita,
      hora_inicio,
      hora_fin,
      modalidad,
      estado,
      ubicacion,
      enlace_videollamada,
      observaciones,
      bono_id,
      descontar_de_bono
    } = body

    // Terapeuta ID: usar el del usuario autenticado si es terapeuta
    const terapeuta_id = isTerapeuta ? user.id : body.terapeuta_id

    if (!terapeuta_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El terapeuta_id es obligatorio'
      })
    }

    // 4. Validar campos requeridos
    if (!paciente_id || !fecha_cita || !hora_inicio || !hora_fin) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Faltan campos obligatorios: paciente_id, fecha_cita, hora_inicio, hora_fin'
      })
    }

    // 5. Obtener citas existentes para validar conflictos
    const { data: existingAppointments, error: queryError } = await supabaseClient
      .from('citas')
      .select('id, fecha_cita, hora_inicio, hora_fin, terapeuta_id, estado')
      .eq('terapeuta_id', terapeuta_id)
      .eq('fecha_cita', fecha_cita)
      .neq('estado', 'cancelada')

    if (queryError) {
      console.error('[CREATE] Error al obtener citas existentes:', queryError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al verificar conflictos'
      })
    }

    // 6. Validar la nueva cita
    const appointmentToValidate: AppointmentForValidation = {
      fecha_cita,
      hora_inicio,
      hora_fin,
      terapeuta_id,
      estado: estado || 'pendiente'
    }

    const validation = validateAppointment(
      appointmentToValidate,
      (existingAppointments || []) as AppointmentForValidation[]
    )

    if (!validation.valid) {
      console.warn('[CREATE] Validación fallida:', validation)
      throw createError({
        statusCode: 422,
        statusMessage: formatValidationError(validation),
        data: {
          errorCode: validation.errorCode,
          details: validation.details
        }
      })
    }

    // 7. Preparar datos de la cita
    const citaData: any = {
      paciente_id,
      terapeuta_id,
      fecha_cita,
      hora_inicio: hora_inicio.length === 5 ? `${hora_inicio}:00` : hora_inicio,
      hora_fin: hora_fin.length === 5 ? `${hora_fin}:00` : hora_fin,
      modalidad: modalidad || 'online',
      estado: estado || 'pendiente',
      ubicacion: ubicacion || null,
      enlace_videollamada: enlace_videollamada || null,
      observaciones: observaciones || null,
      bono_id: bono_id || null,
      descontar_de_bono: descontar_de_bono || false,
      sesion_descontada: false,
      recordatorio_enviado: false
    }

    // 8. Insertar en la base de datos
    const { data: newAppointment, error: insertError } = await supabaseClient
      .from('citas')
      .insert(citaData)
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

    if (insertError) {
      console.error('[CREATE] Error al insertar cita:', insertError)

      // Mensajes de error personalizados
      if (insertError.message.includes('disponibilidad')) {
        throw createError({
          statusCode: 422,
          statusMessage: 'El terapeuta ya tiene una cita en ese horario'
        })
      }

      if (insertError.code === '23503') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Paciente o terapeuta no encontrado'
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: insertError.message || 'Error al crear la cita'
      })
    }

    // 9. Log de éxito
    const duration = Date.now() - startTime
    console.info(`[CREATE] Cita creada exitosamente: ${newAppointment.id} (${duration}ms)`, {
      citaId: newAppointment.id,
      fecha: fecha_cita,
      hora: hora_inicio,
      terapeuta: terapeuta_id,
      duration
    })

    // 10. Retornar respuesta
    return {
      success: true,
      message: 'Cita creada exitosamente',
      data: newAppointment
    }

  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`[CREATE] Error creando cita (${duration}ms):`, error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error al crear la cita'
    })
  }
})
