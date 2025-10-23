/**
 * Composable: useNotificaciones
 * Sistema de notificaciones para pacientes
 * Psicóloga Karem Peña - Sistema Clínico
 */

export const useNotificaciones = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  /**
   * Obtener todas las notificaciones del paciente actual
   * @param {boolean} soloNoVistas - Filtrar solo no vistas
   * @returns {Promise<Array>} Lista de notificaciones
   */
  const obtenerNotificaciones = async (soloNoVistas = false) => {
    try {
      // Obtener el ID del paciente actual
      const { data: paciente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user.value.id)
        .single()

      if (!paciente) throw new Error('Paciente no encontrado')

      let query = supabase
        .from('notificaciones')
        .select(`
          *,
          recurso:recursos(
            id,
            titulo,
            tipo,
            url
          )
        `)
        .eq('paciente_id', paciente.id)
        .order('created_at', { ascending: false })

      if (soloNoVistas) {
        query = query.eq('visto', false)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error al obtener notificaciones:', error)
      throw error
    }
  }

  /**
   * Obtener notificaciones para un paciente específico (vista terapeuta)
   * @param {string} pacienteId - ID del paciente
   * @param {boolean} soloNoVistas - Filtrar solo no vistas
   * @returns {Promise<Array>} Lista de notificaciones
   */
  const obtenerNotificacionesPaciente = async (pacienteId, soloNoVistas = false) => {
    try {
      let query = supabase
        .from('notificaciones')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false })

      if (soloNoVistas) {
        query = query.eq('visto', false)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error al obtener notificaciones del paciente:', error)
      throw error
    }
  }

  /**
   * Contar notificaciones no vistas
   * @returns {Promise<number>} Cantidad de notificaciones no vistas
   */
  const contarNoVistas = async () => {
    try {
      // Obtener el ID del paciente actual
      const { data: paciente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user.value.id)
        .single()

      if (!paciente) return 0

      const { count, error } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('paciente_id', paciente.id)
        .eq('visto', false)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error al contar notificaciones no vistas:', error)
      return 0
    }
  }

  /**
   * Marcar una notificación como vista
   * @param {string} notificacionId - ID de la notificación
   * @returns {Promise<Object>}
   */
  const marcarComoVista = async (notificacionId) => {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .update({
          visto: true,
          leido_at: new Date().toISOString()
        })
        .eq('id', notificacionId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al marcar notificación como vista:', error)
      throw error
    }
  }

  /**
   * Marcar todas las notificaciones como vistas
   * @returns {Promise<Array>}
   */
  const marcarTodasComoVistas = async () => {
    try {
      // Obtener el ID del paciente actual
      const { data: paciente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user.value.id)
        .single()

      if (!paciente) throw new Error('Paciente no encontrado')

      const { data, error } = await supabase
        .from('notificaciones')
        .update({
          visto: true,
          leido_at: new Date().toISOString()
        })
        .eq('paciente_id', paciente.id)
        .eq('visto', false)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error al marcar todas como vistas:', error)
      throw error
    }
  }

  /**
   * Crear una notificación manual
   * @param {string} pacienteId - ID del paciente
   * @param {Object} notificacion - Datos de la notificación
   * @returns {Promise<Object>}
   */
  const crearNotificacion = async (pacienteId, notificacion) => {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .insert({
          paciente_id: pacienteId,
          ...notificacion
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al crear notificación:', error)
      throw error
    }
  }

  /**
   * Eliminar una notificación
   * @param {string} notificacionId - ID de la notificación
   * @returns {Promise<boolean>}
   */
  const eliminarNotificacion = async (notificacionId) => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .delete()
        .eq('id', notificacionId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error al eliminar notificación:', error)
      throw error
    }
  }

  /**
   * Suscribirse a nuevas notificaciones en tiempo real
   * @param {Function} callback - Función a ejecutar cuando llegue una notificación
   * @returns {Object} Suscripción
   */
  const suscribirseANotificaciones = (callback) => {
    try {
      const subscription = supabase
        .channel('notificaciones')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notificaciones'
          },
          (payload) => {
            callback(payload.new)
          }
        )
        .subscribe()

      return subscription
    } catch (error) {
      console.error('Error al suscribirse a notificaciones:', error)
      return null
    }
  }

  /**
   * Obtener notificaciones por tipo
   * @param {string} tipo - Tipo de notificación
   * @returns {Promise<Array>}
   */
  const obtenerPorTipo = async (tipo) => {
    try {
      // Obtener el ID del paciente actual
      const { data: paciente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user.value.id)
        .single()

      if (!paciente) throw new Error('Paciente no encontrado')

      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('paciente_id', paciente.id)
        .eq('tipo', tipo)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error al obtener notificaciones por tipo:', error)
      throw error
    }
  }

  /**
   * Obtener estadísticas de notificaciones
   * @returns {Promise<Object>}
   */
  const obtenerEstadisticas = async () => {
    try {
      // Obtener el ID del paciente actual
      const { data: paciente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user.value.id)
        .single()

      if (!paciente) {
        return {
          total: 0,
          noVistas: 0,
          vistas: 0,
          porTipo: {}
        }
      }

      // Total de notificaciones
      const { data: todas } = await supabase
        .from('notificaciones')
        .select('visto, tipo')
        .eq('paciente_id', paciente.id)

      const total = todas?.length || 0
      const noVistas = todas?.filter(n => !n.visto).length || 0
      const vistas = todas?.filter(n => n.visto).length || 0

      // Notificaciones por tipo
      const porTipo = todas?.reduce((acc, curr) => {
        acc[curr.tipo] = (acc[curr.tipo] || 0) + 1
        return acc
      }, {})

      return {
        total,
        noVistas,
        vistas,
        porTipo: porTipo || {}
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      return {
        total: 0,
        noVistas: 0,
        vistas: 0,
        porTipo: {}
      }
    }
  }

  /**
   * Limpiar notificaciones antiguas (más de 30 días)
   * @returns {Promise<number>} Cantidad de notificaciones eliminadas
   */
  const limpiarAntiguas = async () => {
    try {
      const fecha30DiasAtras = new Date()
      fecha30DiasAtras.setDate(fecha30DiasAtras.getDate() - 30)

      // Obtener el ID del paciente actual
      const { data: paciente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user.value.id)
        .single()

      if (!paciente) return 0

      const { data, error } = await supabase
        .from('notificaciones')
        .delete()
        .eq('paciente_id', paciente.id)
        .eq('visto', true)
        .lt('created_at', fecha30DiasAtras.toISOString())
        .select()

      if (error) throw error
      return data?.length || 0
    } catch (error) {
      console.error('Error al limpiar notificaciones antiguas:', error)
      return 0
    }
  }

  return {
    obtenerNotificaciones,
    obtenerNotificacionesPaciente,
    contarNoVistas,
    marcarComoVista,
    marcarTodasComoVistas,
    crearNotificacion,
    eliminarNotificacion,
    suscribirseANotificaciones,
    obtenerPorTipo,
    obtenerEstadisticas,
    limpiarAntiguas
  }
}
