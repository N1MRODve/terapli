/**
 * Endpoint para confirmar pagos de bonos
 * Solo accesible por coordinadoras
 * Maneja la confirmación de pagos de manera segura con logs y validaciones
 */

import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  console.log('[Server] Iniciando confirmar-pago handler')
  
  // Validar método HTTP
  if (getMethod(event) !== 'POST') {
    console.error('[Server Error] Método no permitido:', getMethod(event))
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    // 1. Obtener datos del cuerpo de la petición con validación segura
    console.log('[Server] Leyendo body de la petición...')
    let body: any
    
    try {
      body = await readBody(event)
    } catch (bodyError) {
      console.error('[Server Error] Error al leer body:', bodyError)
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body'
      })
    }

    console.log('[Server] Body recibido, validando campos...')
    const { bonoId, metodoPago } = body || {}

    // Validaciones robustas
    if (!body || typeof body !== 'object') {
      console.error('[Server Error] Body inválido:', typeof body)
      throw createError({
        statusCode: 400,
        statusMessage: 'Request body must be a valid JSON object'
      })
    }

    if (!bonoId || (typeof bonoId !== 'string' && typeof bonoId !== 'number')) {
      console.error('[Server Error] bonoId inválido:', bonoId)
      throw createError({
        statusCode: 400,
        statusMessage: 'bonoId es requerido y debe ser válido'
      })
    }

    // metodoPago es opcional, si no se proporciona se usa 'no_especificado'
    const metodoFinal = metodoPago && typeof metodoPago === 'string' 
      ? metodoPago.trim() 
      : 'no_especificado'

    console.log('[Server] ✅ Campos validados, confirmando pago para bono:', bonoId)

    // 2. Verificar variables de entorno críticas
    console.log('[Server] Verificando variables de entorno...')
    if (!process.env.SUPABASE_URL) {
      console.error('[Server Error] SUPABASE_URL no configurada')
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error: Missing Supabase URL'
      })
    }

    // 3. Obtener cliente de Supabase autenticado
    console.log('[Server] Inicializando cliente Supabase...')
    let supabase
    try {
      supabase = await serverSupabaseClient(event)
    } catch (clientError) {
      console.error('[Server Error] Error al inicializar cliente:', clientError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to initialize Supabase client'
      })
    }

    // 4. Verificar autenticación del usuario
    console.log('[Server] Verificando autenticación del usuario...')
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('[Server Error] Error al obtener usuario:', userError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication failed'
      })
    }

    const user = userData?.user
    if (!user || !user.id) {
      console.error('[Server Error] Usuario no encontrado o sin ID')
      throw createError({
        statusCode: 401,
        statusMessage: 'User not authenticated'
      })
    }

    // 5. Verificar permisos (coordinadora)
    console.log('[Server] Verificando rol de coordinadora para usuario:', user.id)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[Server Error] Error al obtener perfil:', profileError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to verify user permissions'
      })
    }

    if (!profile || profile.rol !== 'coordinadora') {
      console.error('[Server Error] Acceso denegado, rol:', profile?.rol)
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. Coordinadora role required'
      })
    }

    console.log('[Server] ✅ Usuario coordinadora verificado:', user.email)

    // 6. Verificar que el bono existe y está en estado pendiente
    console.log('[Server] Verificando estado del bono...')
    const { data: bonoActual, error: bonoError } = await supabase
      .from('bonos')
      .select('id, paciente_id, estado_pago, monto_total, estado')
      .eq('id', bonoId)
      .single()

    if (bonoError) {
      if (bonoError.code === 'PGRST116') {
        console.error('[Server Error] Bono no encontrado:', bonoId)
        throw createError({
          statusCode: 404,
          statusMessage: 'Bono no encontrado'
        })
      }
      console.error('[Server Error] Error al obtener bono:', bonoError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch bono data'
      })
    }

    if (!bonoActual || bonoActual.estado_pago !== 'pendiente') {
      console.error('[Server Error] Bono no válido para confirmación:', {
        existe: !!bonoActual,
        estado_pago: bonoActual?.estado_pago
      })
      throw createError({
        statusCode: 400,
        statusMessage: 'Bono no está en estado pendiente de pago'
      })
    }

    console.log('[Server] ✅ Bono válido para confirmación')

    // 7. Actualizar el estado del pago
    console.log('[Server] Actualizando estado del pago...')
    const fechaPago = new Date().toISOString()
    
    const { data: bonoActualizado, error: updateError } = await supabase
      .from('bonos')
      .update({
        estado_pago: 'pagado',
        fecha_pago: fechaPago,
        metodo_pago: metodoFinal,
        confirmado_por: user.id,
        updated_at: fechaPago
      })
      .eq('id', bonoId)
      .eq('estado_pago', 'pendiente') // Condición adicional para evitar race conditions
      .select()
      .single()

    if (updateError) {
      console.error('[Server Error] Error al actualizar bono:', updateError)
      
      if (updateError.code === 'PGRST116') {
        throw createError({
          statusCode: 409,
          statusMessage: 'El bono ya fue confirmado por otro usuario'
        })
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update bono: ${updateError.message}`
      })
    }

    if (!bonoActualizado) {
      console.error('[Server Error] Bono no actualizado - posible race condition')
      throw createError({
        statusCode: 409,
        statusMessage: 'El bono ya fue confirmado por otro usuario'
      })
    }

    console.log('[Server] ✅ Pago confirmado exitosamente')

    // 8. Retornar respuesta exitosa
    const responseData = {
      success: true,
      message: 'Pago confirmado exitosamente',
      data: {
        bonoId: bonoActualizado.id,
        fechaPago,
        metodoPago: metodoFinal,
        montoTotal: bonoActualizado.monto_total,
        confirmadoPor: user.id
      }
    }

    console.log('[Server] Enviando respuesta exitosa')
    return responseData

  } catch (error: any) {
    console.error('[Server Error] Error en confirmar-pago:', error)
    
    // Si es un error ya formateado con createError, lanzarlo tal cual
    if (error.statusCode && error.statusMessage) {
      throw error
    }

    // Si es un error de Supabase sin formatear
    if (error.code || error.message) {
      console.error('[Server Error] Error de Supabase:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${error.message || 'Unknown error'}`
      })
    }

    // Error genérico no manejado
    console.error('[Server Error] Error no identificado:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error occurred'
    })
  } finally {
    console.log('[Server] Finalizando handler confirmar-pago')
  }
})