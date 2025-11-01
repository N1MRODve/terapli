/**
 * Endpoint para crear terapeutas
 * Solo accesible por usuarios con rol 'admin'
 * Usa Service Role Key para operaciones administrativas
 */

import { serverSupabaseServiceRole, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // 1. Obtener datos del cuerpo de la petición
    const body = await readBody(event)
    const { nombreCompleto, email, password, telefono } = body

    if (!nombreCompleto || !email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Faltan campos requeridos: nombreCompleto, email, password'
      })
    }

    console.log('📝 Creando terapeuta:', email)

    // 2. Obtener cliente con permisos de admin (Service Role)
    const supabaseAdmin = serverSupabaseServiceRole(event)

    // 3. Verificar que el usuario actual sea admin
    const supabaseClient = await serverSupabaseClient(event)
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw createError({
        statusCode: 401,
        message: 'No autenticado'
      })
    }

    // Verificar el rol del usuario desde profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.rol !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Acceso denegado. Solo administradores pueden crear terapeutas.'
      })
    }

    console.log('✅ Usuario admin verificado:', user.email)

    // 4. Crear usuario en Auth con rol 'psicologa'
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre: nombreCompleto,
        telefono: telefono || '',
        rol: 'psicologa'
      }
    })

    if (authError) {
      console.error('❌ Error al crear usuario en Auth:', authError)
      throw createError({
        statusCode: 500,
        message: `Error al crear usuario: ${authError.message}`
      })
    }

    console.log('✅ Usuario Auth creado:', authData.user.id)

    // 5. Esperar a que los triggers creen profile y terapeuta
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 6. Verificar que se creó el profile
    const { data: profileData, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileCheckError) {
      console.error('❌ Error al verificar profile:', profileCheckError)
      throw createError({
        statusCode: 500,
        message: 'El perfil no se creó correctamente'
      })
    }

    console.log('✅ Profile verificado:', profileData.email)

    // 7. Verificar/crear registro en terapeutas
    const { data: terapeutaExistente, error: checkError } = await supabaseAdmin
      .from('terapeutas')
      .select('*')
      .eq('email', email)
      .single()

    let terapeutaData = terapeutaExistente

    // Si el trigger no creó la terapeuta, crearla manualmente
    if (checkError && checkError.code === 'PGRST116') {
      console.log('⚠️ Trigger no creó terapeuta, creando manualmente...')
      const { data: nuevaTerapeuta, error: terapeutaError } = await supabaseAdmin
        .from('terapeutas')
        .insert({
          nombre_completo: nombreCompleto,
          email,
          telefono: telefono || null,
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
        console.error('❌ Error al crear terapeuta:', terapeutaError)
        throw createError({
          statusCode: 500,
          message: `Error al crear registro de terapeuta: ${terapeutaError.message}`
        })
      }

      terapeutaData = nuevaTerapeuta
    }

    console.log('✅ Terapeuta creada/verificada:', terapeutaData.email)

    // 8. Retornar éxito
    return {
      success: true,
      message: 'Terapeuta creada exitosamente',
      data: {
        authUserId: authData.user.id,
        terapeutaId: terapeutaData.id,
        email,
        nombreCompleto
      }
    }

  } catch (error: any) {
    console.error('❌ Error en crear-terapeuta:', error)
    
    // Si es un error ya formateado, lanzarlo tal cual
    if (error.statusCode) {
      throw error
    }

    // Si no, crear un error genérico
    throw createError({
      statusCode: 500,
      message: error.message || 'Error al crear terapeuta'
    })
  }
})
