/**
 * =============================================================================
 * API ENDPOINT: Buscar pacientes del terapeuta
 * =============================================================================
 *
 * GET /api/patients/search?q=query
 *
 * Busca pacientes del terapeuta autenticado con información de bonos.
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

    // 3. Obtener perfil y terapeuta_id
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
      // Admin/coordinadora puede ver todos los pacientes o usar query param
      const query = getQuery(event)
      terapeutaId = (query.terapeuta_id as string) || null
    } else {
      throw createError({
        statusCode: 403,
        statusMessage: 'No tienes permisos para buscar pacientes'
      })
    }

    // 4. Obtener query de búsqueda
    const query = getQuery(event)
    const searchTerm = ((query.q as string) || '').trim().toLowerCase()

    // 5. Construir consulta
    let queryBuilder = supabaseClient
      .from('pacientes')
      .select(`
        id,
        nombre_completo,
        email,
        telefono,
        fecha_nacimiento,
        bonos(
          id,
          tipo,
          sesiones_totales,
          sesiones_restantes,
          fecha_inicio,
          fecha_fin,
          estado
        )
      `)

    // Si hay terapeuta_id, filtrar por él
    if (terapeutaId) {
      queryBuilder = queryBuilder.eq('terapeuta_id', terapeutaId)
    }

    // Aplicar búsqueda si hay término
    if (searchTerm.length > 0) {
      queryBuilder = queryBuilder.or(
        `nombre_completo.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,telefono.ilike.%${searchTerm}%`
      )
    }

    const { data: pacientes, error: fetchError } = await queryBuilder
      .order('nombre_completo', { ascending: true })
      .limit(50)

    if (fetchError) {
      console.error('[PATIENTS/SEARCH] Error al buscar pacientes:', fetchError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al buscar pacientes'
      })
    }

    // 6. Transformar datos con información de bonos
    const pacientesConBonos = (pacientes || []).map((p: any) => {
      // Log para debug: ver todos los bonos del paciente
      if (p.bonos && p.bonos.length > 0) {
        console.log(`[PATIENTS/SEARCH] Paciente ${p.nombre_completo} tiene ${p.bonos.length} bonos:`,
          p.bonos.map((b: any) => ({ id: b.id, tipo: b.tipo, estado: b.estado, sesiones_restantes: b.sesiones_restantes }))
        )
      }

      // Incluir bonos activos y pendientes (pendiente = pagado pero no iniciado)
      const bonosActivos = (p.bonos || []).filter((b: any) => {
        const estadoValido = b.estado === 'activo' || b.estado === 'pendiente'
        const tieneSesiones = b.sesiones_restantes > 0
        return estadoValido && tieneSesiones
      })

      const sesionesRestantesTotal = bonosActivos.reduce(
        (sum: number, b: any) => sum + (b.sesiones_restantes || 0),
        0
      )

      // Encontrar próximo vencimiento
      const proximoVencimiento = bonosActivos
        .filter((b: any) => b.fecha_fin)
        .map((b: any) => new Date(b.fecha_fin).getTime())
        .sort()
        [0] || null

      // Obtener el bono activo principal (el que vence primero o el único)
      const bonoActivo = bonosActivos.length > 0
        ? bonosActivos.sort((a: any, b: any) => {
            if (!a.fecha_fin) return 1
            if (!b.fecha_fin) return -1
            return new Date(a.fecha_fin).getTime() - new Date(b.fecha_fin).getTime()
          })[0]
        : null

      return {
        id: p.id,
        nombre_completo: p.nombre_completo,
        email: p.email,
        telefono: p.telefono,
        fecha_nacimiento: p.fecha_nacimiento,
        bonos_activos: bonosActivos.length,
        sesiones_restantes_total: sesionesRestantesTotal,
        proximo_vencimiento: proximoVencimiento
          ? new Date(proximoVencimiento).toISOString()
          : null,
        // Información detallada del bono activo principal
        bono_activo: bonoActivo ? {
          id: bonoActivo.id,
          tipo: bonoActivo.tipo,
          sesiones_totales: bonoActivo.sesiones_totales,
          sesiones_restantes: bonoActivo.sesiones_restantes,
          sesiones_usadas: bonoActivo.sesiones_totales - bonoActivo.sesiones_restantes,
          fecha_inicio: bonoActivo.fecha_inicio,
          fecha_fin: bonoActivo.fecha_fin
        } : null,
        // Lista de todos los bonos activos (por si tiene más de uno)
        bonos: bonosActivos.map((b: any) => ({
          id: b.id,
          tipo: b.tipo,
          sesiones_totales: b.sesiones_totales,
          sesiones_restantes: b.sesiones_restantes,
          sesiones_usadas: b.sesiones_totales - b.sesiones_restantes,
          fecha_fin: b.fecha_fin
        }))
      }
    })

    return {
      success: true,
      data: pacientesConBonos,
      count: pacientesConBonos.length
    }

  } catch (error: any) {
    console.error('[PATIENTS/SEARCH] Error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error al buscar pacientes'
    })
  }
})
