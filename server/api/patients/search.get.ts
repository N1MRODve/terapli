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

    // 5. Construir consulta - incluir última cita para priorización
    let queryBuilder = supabaseClient
      .from('pacientes')
      .select(`
        id,
        nombre_completo,
        email,
        telefono,
        fecha_nacimiento,
        activo,
        bonos(
          id,
          tipo,
          sesiones_totales,
          sesiones_restantes,
          fecha_inicio,
          fecha_fin,
          estado
        ),
        citas(
          fecha_cita,
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

    // Límite inicial más bajo para rendimiento
    const { data: pacientes, error: fetchError } = await queryBuilder
      .eq('activo', true) // Solo pacientes activos
      .order('nombre_completo', { ascending: true })
      .limit(30)

    if (fetchError) {
      console.error('[PATIENTS/SEARCH] Error al buscar pacientes:', fetchError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al buscar pacientes'
      })
    }

    // 6. Transformar datos con información de bonos y recencia
    const ahora = new Date()
    const pacientesConBonos = (pacientes || []).map((p: any) => {
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

      // Calcular última cita y próxima cita para priorización
      const citas = p.citas || []
      const citasPasadas = citas
        .filter((c: any) => new Date(c.fecha_cita) <= ahora && c.estado !== 'cancelada')
        .sort((a: any, b: any) => new Date(b.fecha_cita).getTime() - new Date(a.fecha_cita).getTime())
      const citasFuturas = citas
        .filter((c: any) => new Date(c.fecha_cita) > ahora && c.estado !== 'cancelada')
        .sort((a: any, b: any) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime())

      const ultimaCita = citasPasadas[0]?.fecha_cita || null
      const proximaCita = citasFuturas[0]?.fecha_cita || null
      const totalCitas = citas.filter((c: any) => c.estado !== 'cancelada').length

      // Calcular score de priorización:
      // - Más puntos si tiene cita reciente (últimos 30 días)
      // - Más puntos si tiene sesiones restantes
      // - Más puntos si tiene muchas citas históricas
      let prioridadScore = 0
      if (ultimaCita) {
        const diasDesdeUltima = Math.floor((ahora.getTime() - new Date(ultimaCita).getTime()) / (1000 * 60 * 60 * 24))
        if (diasDesdeUltima <= 7) prioridadScore += 100
        else if (diasDesdeUltima <= 30) prioridadScore += 50
        else if (diasDesdeUltima <= 90) prioridadScore += 20
      }
      if (sesionesRestantesTotal > 0) prioridadScore += 80
      if (totalCitas >= 10) prioridadScore += 30
      else if (totalCitas >= 5) prioridadScore += 15

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
        // Nueva info de recencia
        ultima_cita: ultimaCita,
        proxima_cita: proximaCita,
        total_citas: totalCitas,
        prioridad_score: prioridadScore,
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

    // 7. Ordenar por prioridad y limitar a 10 resultados
    const pacientesOrdenados = pacientesConBonos
      .sort((a, b) => b.prioridad_score - a.prioridad_score)
      .slice(0, 10)

    return {
      success: true,
      data: pacientesOrdenados,
      count: pacientesOrdenados.length,
      total: pacientesConBonos.length
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
