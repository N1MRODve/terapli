/**
 * Endpoint para crear terapeutas
 * Solo accesible por usuarios con rol 'admin'
 * Usa Service Role Key para operaciones administrativas
 */

import { serverSupabaseServiceRole, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  console.log('[Server] Iniciando crear-terapeuta handler')
  
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
    const { nombreCompleto, email, password, telefono } = body || {}

    // Validaciones más robustas
    if (!body || typeof body !== 'object') {
      console.error('[Server Error] Body inválido:', typeof body)
      throw createError({
        statusCode: 400,
        statusMessage: 'Request body must be a valid JSON object'
      })
    }

    if (!nombreCompleto || typeof nombreCompleto !== 'string' || nombreCompleto.trim().length < 2) {
      console.error('[Server Error] Nombre completo inválido:', nombreCompleto)
      throw createError({
        statusCode: 400,
        statusMessage: 'nombreCompleto debe ser un string válido con al menos 2 caracteres'
      })
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.error('[Server Error] Email inválido:', email)
      throw createError({
        statusCode: 400,
        statusMessage: 'email debe ser una dirección válida'
      })
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      console.error('[Server Error] Password inválido:', password ? '[HIDDEN]' : 'undefined')
      throw createError({
        statusCode: 400,
        statusMessage: 'password debe tener al menos 6 caracteres'
      })
    }

    console.log('[Server] ✅ Campos validados, creando terapeuta:', email)

    // 2. Verificar variables de entorno críticas
    console.log('[Server] Verificando variables de entorno...')
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Server Error] SUPABASE_SERVICE_ROLE_KEY no configurada')
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error: Missing service role key'
      })
    }

    if (!process.env.SUPABASE_URL) {
      console.error('[Server Error] SUPABASE_URL no configurada')
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error: Missing Supabase URL'
      })
    }

    // 3. Obtener cliente con permisos de admin (Service Role)
    console.log('[Server] Inicializando cliente Supabase admin...')
    let supabaseAdmin
    try {
      supabaseAdmin = serverSupabaseServiceRole(event)
    } catch (adminError) {
      console.error('[Server Error] Error al inicializar cliente admin:', adminError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to initialize admin client'
      })
    }

    // 4. Verificar que el usuario actual sea admin
    console.log('[Server] Obteniendo cliente de usuario autenticado...')
    let supabaseClient
    try {
      supabaseClient = await serverSupabaseClient(event)
    } catch (clientError) {
      console.error('[Server Error] Error al obtener cliente de usuario:', clientError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to initialize user client'
      })
    }

    console.log('[Server] Verificando autenticación del usuario...')
    const { data: userData, error: userError } = await supabaseClient.auth.getUser()

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

    // Verificar el rol del usuario desde profiles con manejo robusto de errores
    console.log('[Server] Verificando rol de admin para usuario:', user.id)
    const { data: profile, error: profileError } = await supabaseClient
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

    if (!profile || profile.rol !== 'admin') {
      console.error('[Server Error] Acceso denegado, rol:', profile?.rol)
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. Admin role required'
      })
    }

    console.log('[Server] ✅ Usuario admin verificado:', user.email)

    // 5. Crear usuario en Auth con rol 'psicologa' con validaciones robustas
    console.log('[Server] Creando usuario en Auth...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password.trim(),
      email_confirm: true,
      user_metadata: {
        nombre: nombreCompleto.trim(),
        telefono: telefono ? String(telefono).trim() : '',
        rol: 'psicologa'
      }
    })

    if (authError) {
      console.error('[Server Error] Error al crear usuario en Auth:', authError)
      
      // Manejar errores específicos de Supabase Auth
      if (authError.message?.includes('already registered')) {
        throw createError({
          statusCode: 409,
          statusMessage: `Email ${email} ya está registrado`
        })
      }
      
      if (authError.message?.includes('Password should be')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Password no cumple con los requisitos mínimos'
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: `Error al crear usuario: ${authError.message}`
      })
    }

    if (!authData?.user?.id) {
      console.error('[Server Error] Usuario creado pero sin datos válidos')
      throw createError({
        statusCode: 500,
        statusMessage: 'User creation failed: Invalid response data'
      })
    }

    console.log('[Server] ✅ Usuario Auth creado:', authData.user.id)

    // 6. Esperar a que los triggers creen profile y terapeuta con retry logic
    console.log('[Server] Esperando a triggers de BD...')
    let profileData
    let retryCount = 0
    const maxRetries = 5
    const retryDelay = 1000

    while (retryCount < maxRetries) {
      try {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        
        console.log(`[Server] Verificando profile (intento ${retryCount + 1}/${maxRetries})...`)
        const { data: profileResult, error: profileCheckError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (profileCheckError) {
          if (profileCheckError.code === 'PGRST116') {
            // Profile no encontrado, retry
            console.log('[Server] Profile no encontrado aún, reintentando...')
            retryCount++
            continue
          } else {
            // Error diferente, lanzar excepción
            console.error('[Server Error] Error al verificar profile:', profileCheckError)
            throw createError({
              statusCode: 500,
              statusMessage: `Profile verification failed: ${profileCheckError.message}`
            })
          }
        }

        profileData = profileResult
        break

      } catch (retryError) {
        console.error(`[Server Error] Error en intento ${retryCount + 1}:`, retryError)
        if (retryCount >= maxRetries - 1) {
          throw retryError
        }
        retryCount++
      }
    }

    if (!profileData) {
      console.error('[Server Error] Profile no se creó después de múltiples intentos')
      throw createError({
        statusCode: 500,
        statusMessage: 'Profile creation timeout: Database triggers may not be working'
      })
    }

    console.log('[Server] ✅ Profile verificado:', profileData.email)

    // 7. Verificar/crear registro en terapeutas con retry logic
    console.log('[Server] Verificando registro de terapeuta...')
    let terapeutaData
    retryCount = 0

    while (retryCount < maxRetries) {
      try {
        const { data: terapeutaExistente, error: checkError } = await supabaseAdmin
          .from('terapeutas')
          .select('*')
          .eq('email', email.trim().toLowerCase())
          .single()

        if (checkError && checkError.code === 'PGRST116') {
          // Terapeuta no encontrada, intentar crear manualmente
          console.log('[Server] Trigger no creó terapeuta, creando manualmente...')
          
          const { data: nuevaTerapeuta, error: terapeutaError } = await supabaseAdmin
            .from('terapeutas')
            .insert({
              nombre_completo: nombreCompleto.trim(),
              email: email.trim().toLowerCase(),
              telefono: telefono ? String(telefono).trim() : null,
              activo: true,
              metadata: {
                auth_user_id: authData.user.id,
                created_by_admin: true,
                created_at: new Date().toISOString()
              }
            })
            .select()
            .single()

          if (terapeutaError) {
            if (terapeutaError.code === '23505') {
              // Unique constraint violation, la terapeuta ya existe
              console.log('[Server] Terapeuta ya existe, reintentando obtención...')
              retryCount++
              continue
            }
            
            console.error('[Server Error] Error al crear terapeuta:', terapeutaError)
            throw createError({
              statusCode: 500,
              statusMessage: `Failed to create therapist record: ${terapeutaError.message}`
            })
          }

          terapeutaData = nuevaTerapeuta
          break

        } else if (checkError) {
          // Error diferente al "no encontrado"
          console.error('[Server Error] Error al verificar terapeuta:', checkError)
          throw createError({
            statusCode: 500,
            statusMessage: `Therapist verification failed: ${checkError.message}`
          })
        } else {
          // Terapeuta encontrada
          terapeutaData = terapeutaExistente
          break
        }

      } catch (retryError) {
        console.error(`[Server Error] Error en verificación de terapeuta (intento ${retryCount + 1}):`, retryError)
        if (retryCount >= maxRetries - 1) {
          throw retryError
        }
        retryCount++
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }

    if (!terapeutaData) {
      console.error('[Server Error] No se pudo crear/verificar registro de terapeuta')
      throw createError({
        statusCode: 500,
        statusMessage: 'Therapist record creation failed after multiple attempts'
      })
    }

    console.log('[Server] ✅ Terapeuta creada/verificada:', terapeutaData.email)

    // 8. Retornar éxito con datos validados
    console.log('[Server] ✅ Proceso completado exitosamente')
    
    const responseData = {
      success: true,
      message: 'Terapeuta creada exitosamente',
      data: {
        authUserId: authData.user.id,
        terapeutaId: terapeutaData.id,
        email: email.trim().toLowerCase(),
        nombreCompleto: nombreCompleto.trim(),
        telefono: telefono ? String(telefono).trim() : null
      }
    }

    console.log('[Server] Enviando respuesta exitosa')
    return responseData

  } catch (error: any) {
    console.error('[Server Error] Error en crear-terapeuta:', error)
    
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
    console.log('[Server] Finalizando handler crear-terapeuta')
  }
})
