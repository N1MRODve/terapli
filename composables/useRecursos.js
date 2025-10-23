/**
 * Composable: useRecursos
 * Gestión de recursos terapéuticos compartidos
 * Psicóloga Karem Peña - Sistema Clínico
 */

export const useRecursos = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  /**
   * Obtener todos los recursos disponibles
   * @param {Object} filtros - Filtros opcionales (tipo, búsqueda)
   * @returns {Promise<Array>} Lista de recursos
   */
  const obtenerRecursos = async (filtros = {}) => {
    try {
      let query = supabase
        .from('recursos')
        .select(`
          *,
          creado_por_info:terapeutas!recursos_creado_por_fkey(
            id,
            nombre,
            apellido,
            especialidad
          )
        `)
        .order('created_at', { ascending: false })

      // Aplicar filtro por tipo
      if (filtros.tipo && filtros.tipo !== 'todos') {
        query = query.eq('tipo', filtros.tipo)
      }

      // Aplicar búsqueda por texto
      if (filtros.busqueda) {
        query = query.or(`titulo.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error al obtener recursos:', error)
      throw error
    }
  }

  /**
   * Obtener un recurso por ID
   * @param {string} id - ID del recurso
   * @returns {Promise<Object>} Recurso
   */
  const obtenerRecursoPorId = async (id) => {
    try {
      const { data, error } = await supabase
        .from('recursos')
        .select(`
          *,
          creado_por_info:terapeutas!recursos_creado_por_fkey(
            id,
            nombre,
            apellido,
            especialidad
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al obtener recurso:', error)
      throw error
    }
  }

  /**
   * Crear un nuevo recurso
   * @param {Object} recurso - Datos del recurso
   * @returns {Promise<Object>} Recurso creado
   */
  const crearRecurso = async (recurso) => {
    try {
      // Obtener el ID del terapeuta actual
      const { data: terapeuta } = await supabase
        .from('terapeutas')
        .select('id')
        .eq('user_id', user.value.id)
        .single()

      if (!terapeuta) throw new Error('Terapeuta no encontrado')

      const { data, error } = await supabase
        .from('recursos')
        .insert({
          ...recurso,
          creado_por: terapeuta.id
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al crear recurso:', error)
      throw error
    }
  }

  /**
   * Actualizar un recurso existente
   * @param {string} id - ID del recurso
   * @param {Object} cambios - Campos a actualizar
   * @returns {Promise<Object>} Recurso actualizado
   */
  const actualizarRecurso = async (id, cambios) => {
    try {
      const { data, error } = await supabase
        .from('recursos')
        .update(cambios)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al actualizar recurso:', error)
      throw error
    }
  }

  /**
   * Eliminar un recurso
   * @param {string} id - ID del recurso
   * @returns {Promise<boolean>}
   */
  const eliminarRecurso = async (id) => {
    try {
      const { error } = await supabase
        .from('recursos')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error al eliminar recurso:', error)
      throw error
    }
  }

  /**
   * Compartir recurso con paciente(s)
   * @param {string} recursoId - ID del recurso
   * @param {Array} pacienteIds - Array de IDs de pacientes
   * @param {string} mensaje - Mensaje opcional
   * @returns {Promise<Array>} Asignaciones creadas
   */
  const compartirRecurso = async (recursoId, pacienteIds, mensaje = '') => {
    try {
      // Obtener el ID del terapeuta actual
      const { data: terapeuta } = await supabase
        .from('terapeutas')
        .select('id')
        .eq('user_id', user.value.id)
        .single()

      if (!terapeuta) throw new Error('Terapeuta no encontrado')

      // Crear asignaciones para cada paciente
      const asignaciones = pacienteIds.map(pacienteId => ({
        recurso_id: recursoId,
        paciente_id: pacienteId,
        terapeuta_id: terapeuta.id,
        mensaje: mensaje || null
      }))

      const { data, error } = await supabase
        .from('recursos_pacientes')
        .upsert(asignaciones, {
          onConflict: 'recurso_id,paciente_id',
          ignoreDuplicates: false
        })
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al compartir recurso:', error)
      throw error
    }
  }

  /**
   * Obtener recursos asignados a un paciente específico
   * @param {string} pacienteId - ID del paciente
   * @returns {Promise<Array>} Recursos asignados
   */
  const obtenerRecursosPaciente = async (pacienteId) => {
    try {
      const { data, error } = await supabase
        .from('recursos_pacientes')
        .select(`
          *,
          recurso:recursos(*),
          terapeuta:terapeutas(nombre, apellido, especialidad)
        `)
        .eq('paciente_id', pacienteId)
        .order('fecha_asignacion', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error al obtener recursos del paciente:', error)
      throw error
    }
  }

  /**
   * Obtener recursos asignados del paciente actual (vista paciente)
   * @returns {Promise<Array>} Recursos asignados
   */
  const obtenerMisRecursos = async () => {
    try {
      // Obtener el ID del paciente actual
      const { data: paciente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user.value.id)
        .single()

      if (!paciente) throw new Error('Paciente no encontrado')

      const { data, error } = await supabase
        .from('recursos_pacientes')
        .select(`
          *,
          recurso:recursos(*),
          terapeuta:terapeutas(nombre, apellido, especialidad)
        `)
        .eq('paciente_id', paciente.id)
        .order('fecha_asignacion', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error al obtener mis recursos:', error)
      throw error
    }
  }

  /**
   * Marcar recurso como visto por el paciente
   * @param {string} asignacionId - ID de la asignación
   * @returns {Promise<Object>}
   */
  const marcarRecursoVisto = async (asignacionId) => {
    try {
      const { data, error } = await supabase
        .from('recursos_pacientes')
        .update({
          visto: true,
          fecha_visto: new Date().toISOString()
        })
        .eq('id', asignacionId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al marcar recurso como visto:', error)
      throw error
    }
  }

  /**
   * Subir archivo a Supabase Storage
   * @param {File} file - Archivo a subir
   * @param {string} carpeta - Carpeta de destino
   * @returns {Promise<string>} URL pública del archivo
   */
  const subirArchivo = async (file, carpeta = 'recursos') => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${carpeta}/${fileName}`

      const { data, error } = await supabase.storage
        .from('recursos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('recursos')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error al subir archivo:', error)
      throw error
    }
  }

  /**
   * Obtener estadísticas de recursos
   * @returns {Promise<Object>} Estadísticas
   */
  const obtenerEstadisticas = async () => {
    try {
      // Total de recursos
      const { count: totalRecursos } = await supabase
        .from('recursos')
        .select('*', { count: 'exact', head: true })

      // Recursos por tipo
      const { data: porTipo } = await supabase
        .from('recursos')
        .select('tipo')

      const tiposCount = porTipo?.reduce((acc, curr) => {
        acc[curr.tipo] = (acc[curr.tipo] || 0) + 1
        return acc
      }, {})

      // Total de asignaciones
      const { count: totalAsignaciones } = await supabase
        .from('recursos_pacientes')
        .select('*', { count: 'exact', head: true })

      // Recursos más compartidos
      const { data: masCompartidos } = await supabase
        .from('recursos_pacientes')
        .select('recurso_id, recursos(titulo)')
        .limit(5)

      return {
        totalRecursos,
        tiposCount,
        totalAsignaciones,
        masCompartidos
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      return {
        totalRecursos: 0,
        tiposCount: {},
        totalAsignaciones: 0,
        masCompartidos: []
      }
    }
  }

  return {
    obtenerRecursos,
    obtenerRecursoPorId,
    crearRecurso,
    actualizarRecurso,
    eliminarRecurso,
    compartirRecurso,
    obtenerRecursosPaciente,
    obtenerMisRecursos,
    marcarRecursoVisto,
    subirArchivo,
    obtenerEstadisticas
  }
}
