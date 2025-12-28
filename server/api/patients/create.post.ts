/**
 * =============================================================================
 * API ENDPOINT: Crear paciente rápido
 * =============================================================================
 *
 * POST /api/patients/create
 *
 * Crea un nuevo paciente para el terapeuta autenticado.
 */

import { createServerClient } from '@supabase/ssr'

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

    // Determinar terapeuta_id basado en el rol
    let terapeutaId: string | null = null

    if (profile.rol === 'psicologa') {
      // El terapeuta usa su propio ID
      terapeutaId = user.id
    } else if (profile.rol === 'admin' || profile.rol === 'coordinadora') {
      // Admin/coordinadora debe especificar el terapeuta_id
      const body = await readBody(event)
      terapeutaId = body.terapeuta_id || null

      if (!terapeutaId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Se requiere terapeuta_id para admin/coordinadora'
        })
      }
    } else {
      throw createError({
        statusCode: 403,
        statusMessage: 'No tienes permisos para crear pacientes'
      })
    }

    // 4. Obtener datos del body
    const body = await readBody(event)
    const { nombre_completo, email, telefono, fecha_nacimiento, observaciones } = body

    // 5. Validaciones
    if (!nombre_completo || nombre_completo.trim().length < 2) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El nombre debe tener al menos 2 caracteres'
      })
    }

    if (!email || !email.includes('@')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email inválido'
      })
    }

    // 6. Verificar si el email ya existe para este terapeuta
    const { data: existente, error: checkError } = await supabaseClient
      .from('pacientes')
      .select('id, nombre_completo')
      .eq('terapeuta_id', terapeutaId)
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[PATIENTS/CREATE] Error verificando email:', checkError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al verificar email'
      })
    }

    if (existente) {
      throw createError({
        statusCode: 409,
        statusMessage: `Ya existe un paciente con el email ${email}: ${existente.nombre_completo}`
      })
    }

    // 7. Crear paciente
    const { data: nuevoPaciente, error: insertError } = await supabaseClient
      .from('pacientes')
      .insert({
        terapeuta_id: terapeutaId,
        nombre_completo: nombre_completo.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono?.trim() || null,
        fecha_nacimiento: fecha_nacimiento || null,
        observaciones: observaciones?.trim() || null
      })
      .select()
      .single()

    if (insertError) {
      console.error('[PATIENTS/CREATE] Error al insertar paciente:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: insertError.message || 'Error al crear paciente'
      })
    }

    console.info(`[PATIENTS/CREATE] Paciente creado: ${nuevoPaciente.id}`)

    return {
      success: true,
      message: 'Paciente creado exitosamente',
      data: nuevoPaciente
    }

  } catch (error: any) {
    console.error('[PATIENTS/CREATE] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error al crear paciente'
    })
  }
})
