/**
 * Composable: useRecursos
 * 
 * Gestión completa del repositorio de recursos compartidos
 * - CRUD de recursos
 * - Envío a pacientes
 * - Seguimiento de visualización
 * - Estadísticas
 */

// ============================================
// TIPOS
// ============================================

export type TipoRecurso = 'pdf' | 'video' | 'articulo' | 'audio' | 'ejercicio' | 'imagen' | 'otro'

export interface Recurso {
  id: string
  titulo: string
  descripcion: string | null
  tipo: TipoRecurso
  url: string | null
  archivo_url: string | null
  archivo_nombre: string | null
  archivo_tamano: number | null
  etiquetas: string[] | null
  duracion_minutos: number | null
  creado_por_terapeuta_id: string | null
  es_publico: boolean
  veces_enviado: number
  veces_visto: number
  creado_en: string
  actualizado_en: string
  // Datos del creador (de la vista)
  creador_nombre?: string
  creador_email?: string
}

export interface RecursoPaciente {
  id: string
  recurso_id: string
  paciente_id: string
  terapeuta_id: string
  enviado_en: string
  visto_en: string | null
  visto: boolean
  mensaje_terapeuta: string | null
  calificacion: number | null
  comentario_paciente: string | null
  creado_en: string
  actualizado_en: string
  // Datos del recurso (join)
  recurso?: Recurso
}

export interface CrearRecursoInput {
  titulo: string
  descripcion?: string
  tipo: TipoRecurso
  url?: string
  archivo?: File
  etiquetas?: string[]
  duracion_minutos?: number
  es_publico?: boolean
}

export interface EditarRecursoInput extends Partial<CrearRecursoInput> {
  id: string
}

export interface EnviarRecursoInput {
  recurso_id: string
  paciente_ids: string[]
  mensaje_terapeuta?: string
}

export interface FiltrosRecursos {
  tipo?: TipoRecurso
  busqueda?: string
  etiqueta?: string
  solo_mis_recursos?: boolean
  solo_publicos?: boolean
}

export interface EstadisticasRecursos {
  recursos_creados: number
  recursos_enviados: number
  recursos_vistos: number
  recurso_mas_enviado: {
    titulo: string
    veces: number
  } | null
}

// ============================================
// COMPOSABLE
// ============================================

export const useRecursos = () => {
  const supabase = useSupabaseClient() as any
  const user = useSupabaseUser()

  // Estado reactivo
  const recursos = ref<Recurso[]>([])
  const recursosPaciente = ref<RecursoPaciente[]>([])
  const recursosNoVistos = ref(0)
  const cargando = ref(false)
  const error = ref<string | null>(null)

  // ============================================
  // OBTENER RECURSOS (para terapeutas)
  // ============================================

  const obtenerRecursos = async (filtros?: FiltrosRecursos) => {
    try {
      cargando.value = true
      error.value = null

      let query = supabase
        .from('vista_recursos_completa')
        .select('*')
        .order('creado_en', { ascending: false })

      // Aplicar filtros
      if (filtros?.tipo) {
        query = query.eq('tipo', filtros.tipo)
      }

      if (filtros?.solo_mis_recursos && user.value) {
        query = query.eq('creado_por_terapeuta_id', user.value.id)
      }

      if (filtros?.solo_publicos) {
        query = query.eq('es_publico', true)
      }

      if (filtros?.busqueda) {
        query = query.or(`titulo.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`)
      }

      if (filtros?.etiqueta) {
        query = query.contains('etiquetas', [filtros.etiqueta])
      }

      const { data, error: err } = await query

      if (err) throw err

      recursos.value = data as Recurso[] || []
      return recursos.value

    } catch (err: any) {
      error.value = err.message
      console.error('Error al obtener recursos:', err)
      return []
    } finally {
      cargando.value = false
    }
  }

  // ============================================
  // OBTENER UN RECURSO POR ID
  // ============================================

  const obtenerRecursoPorId = async (id: string) => {
    try {
      const { data, error: err } = await supabase
        .from('vista_recursos_completa')
        .select('*')
        .eq('id', id)
        .single()

      if (err) throw err

      return data as Recurso
    } catch (err: any) {
      error.value = err.message
      console.error('Error al obtener recurso:', err)
      return null
    }
  }

  // ============================================
  // CREAR RECURSO
  // ============================================

  const crearRecurso = async (input: CrearRecursoInput) => {
    try {
      cargando.value = true
      error.value = null

      if (!user.value) {
        throw new Error('Usuario no autenticado')
      }

      let archivo_url = null
      let archivo_nombre = null
      let archivo_tamano = null

      // Si hay archivo, subirlo a Supabase Storage
      if (input.archivo) {
        const resultado = await subirArchivo(input.archivo)
        if (resultado) {
          archivo_url = resultado.url
          archivo_nombre = resultado.nombre
          archivo_tamano = resultado.tamano
        }
      }

      const nuevoRecurso = {
        titulo: input.titulo,
        descripcion: input.descripcion || null,
        tipo: input.tipo,
        url: input.url || null,
        archivo_url,
        archivo_nombre,
        archivo_tamano,
        etiquetas: input.etiquetas || null,
        duracion_minutos: input.duracion_minutos || null,
        creado_por_terapeuta_id: user.value.id,
        es_publico: input.es_publico ?? true,
      }

      const { data, error: err } = await supabase
        .from('recursos')
        .insert(nuevoRecurso)
        .select()
        .single()

      if (err) throw err

      // Actualizar lista local
      await obtenerRecursos()

      return data as Recurso

    } catch (err: any) {
      error.value = err.message
      console.error('Error al crear recurso:', err)
      return null
    } finally {
      cargando.value = false
    }
  }

  // ============================================
  // EDITAR RECURSO
  // ============================================

  const editarRecurso = async (input: EditarRecursoInput) => {
    try {
      cargando.value = true
      error.value = null

      const { id, archivo, ...updates } = input

      const updatesData: any = { ...updates }

      // Si hay nuevo archivo, subirlo
      if (archivo) {
        const resultado = await subirArchivo(archivo)
        if (resultado) {
          updatesData.archivo_url = resultado.url
          updatesData.archivo_nombre = resultado.nombre
          updatesData.archivo_tamano = resultado.tamano
        }
      }

      const { data, error: err } = await supabase
        .from('recursos')
        .update(updatesData)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      // Actualizar lista local
      await obtenerRecursos()

      return data as any

    } catch (err: any) {
      error.value = err.message
      console.error('Error al editar recurso:', err)
      return null
    } finally {
      cargando.value = false
    }
  }

  // ============================================
  // ELIMINAR RECURSO
  // ============================================

  const eliminarRecurso = async (id: string) => {
    try {
      cargando.value = true
      error.value = null

      // Primero obtener el recurso para eliminar archivo si existe
      const recurso = await obtenerRecursoPorId(id)
      
      if (recurso?.archivo_url) {
        await eliminarArchivo(recurso.archivo_url)
      }

      const { error: err } = await supabase
        .from('recursos')
        .delete()
        .eq('id', id)

      if (err) throw err

      // Actualizar lista local
      recursos.value = recursos.value.filter(r => r.id !== id)

      return true

    } catch (err: any) {
      error.value = err.message
      console.error('Error al eliminar recurso:', err)
      return false
    } finally {
      cargando.value = false
    }
  }

  // ============================================
  // ENVIAR RECURSO A PACIENTE(S)
  // ============================================

  const enviarRecursoAPacientes = async (input: EnviarRecursoInput) => {
    try {
      cargando.value = true
      error.value = null

      if (!user.value) {
        throw new Error('Usuario no autenticado')
      }

      // Crear registros para cada paciente
      const envios = input.paciente_ids.map(paciente_id => ({
        recurso_id: input.recurso_id,
        paciente_id,
        terapeuta_id: user.value!.id,
        mensaje_terapeuta: input.mensaje_terapeuta || null,
      }))

      const { data, error: err } = await supabase
        .from('recursos_pacientes')
        .insert(envios)
        .select()

      if (err) throw err

      return data as RecursoPaciente[]

    } catch (err: any) {
      error.value = err.message
      console.error('Error al enviar recurso:', err)
      return null
    } finally {
      cargando.value = false
    }
  }

  // ============================================
  // OBTENER RECURSOS DE UN PACIENTE
  // ============================================

  const obtenerRecursosPaciente = async (paciente_id?: string) => {
    try {
      cargando.value = true
      error.value = null

      // Si no se proporciona paciente_id, obtener del usuario actual
      let targetPacienteId = paciente_id

      if (!targetPacienteId && user.value) {
        // Obtener ID del paciente desde la tabla pacientes
        const { data: pacienteData } = await supabase
          .from('pacientes')
          .select('id')
          .eq('user_id', user.value.id)
          .single()

        if (pacienteData) {
          targetPacienteId = pacienteData.id
        }
      }

      if (!targetPacienteId) {
        throw new Error('No se pudo identificar al paciente')
      }

      const { data, error: err } = await supabase
        .from('recursos_pacientes')
        .select(`
          *,
          recurso:recursos(*)
        `)
        .eq('paciente_id', targetPacienteId)
        .order('enviado_en', { ascending: false })

      if (err) throw err

      recursosPaciente.value = data as RecursoPaciente[] || []
      
      // Contar no vistos
      recursosNoVistos.value = recursosPaciente.value.filter(r => !r.visto).length

      return recursosPaciente.value

    } catch (err: any) {
      error.value = err.message
      console.error('Error al obtener recursos del paciente:', err)
      return []
    } finally {
      cargando.value = false
    }
  }

  // ============================================
  // MARCAR RECURSO COMO VISTO
  // ============================================

  const marcarRecursoVisto = async (recursos_pacientes_id: string) => {
    try {
      const { data, error: err } = await supabase
        .from('recursos_pacientes')
        .update({
          visto: true,
          visto_en: new Date().toISOString()
        })
        .eq('id', recursos_pacientes_id)
        .select()
        .single()

      if (err) throw err

      // Actualizar lista local
      const index = recursosPaciente.value.findIndex(r => r.id === recursos_pacientes_id)
      if (index !== -1) {
        recursosPaciente.value[index] = data as RecursoPaciente
        recursosNoVistos.value = Math.max(0, recursosNoVistos.value - 1)
      }

      return data as RecursoPaciente

    } catch (err: any) {
      error.value = err.message
      console.error('Error al marcar recurso como visto:', err)
      return null
    }
  }

  // ============================================
  // CALIFICAR RECURSO (paciente)
  // ============================================

  const calificarRecurso = async (
    recursos_pacientes_id: string,
    calificacion: number,
    comentario?: string
  ) => {
    try {
      const { data, error: err } = await supabase
        .from('recursos_pacientes')
        .update({
          calificacion,
          comentario_paciente: comentario || null
        })
        .eq('id', recursos_pacientes_id)
        .select()
        .single()

      if (err) throw err

      return data as RecursoPaciente

    } catch (err: any) {
      error.value = err.message
      console.error('Error al calificar recurso:', err)
      return null
    }
  }

  // ============================================
  // OBTENER ESTADÍSTICAS (terapeuta)
  // ============================================

  const obtenerEstadisticas = async () => {
    try {
      if (!user.value) return null

      const { data, error: err } = await supabase
        .rpc('obtener_estadisticas_recursos_terapeuta', {
          terapeuta_uuid: user.value.id
        })

      if (err) throw err

      return data as EstadisticasRecursos

    } catch (err: any) {
      error.value = err.message
      console.error('Error al obtener estadísticas:', err)
      return null
    }
  }

  // ============================================
  // OBTENER RECURSOS POPULARES
  // ============================================

  const obtenerRecursosPopulares = async (limite: number = 10) => {
    try {
      const { data, error: err } = await supabase
        .rpc('obtener_recursos_populares', { limite })

      if (err) throw err

      return data as Recurso[]

    } catch (err: any) {
      error.value = err.message
      console.error('Error al obtener recursos populares:', err)
      return []
    }
  }

  // ============================================
  // HELPERS: Gestión de archivos en Storage
  // ============================================

  const subirArchivo = async (archivo: File) => {
    try {
      if (!user.value) throw new Error('Usuario no autenticado')

      // Generar nombre único
      const extension = archivo.name.split('.').pop()
      const nombreUnico = `${user.value.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`

      // Subir a Supabase Storage
      const { data, error: err } = await supabase.storage
        .from('recursos')
        .upload(nombreUnico, archivo, {
          cacheControl: '3600',
          upsert: false
        })

      if (err) throw err

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('recursos')
        .getPublicUrl(data.path)

      return {
        url: urlData.publicUrl,
        nombre: archivo.name,
        tamano: archivo.size
      }

    } catch (err: any) {
      console.error('Error al subir archivo:', err)
      return null
    }
  }

  const eliminarArchivo = async (url: string) => {
    try {
      // Extraer path del URL
      const path = url.split('/recursos/')[1]
      if (!path) return

      const { error: err } = await supabase.storage
        .from('recursos')
        .remove([path])

      if (err) throw err

    } catch (err: any) {
      console.error('Error al eliminar archivo:', err)
    }
  }

  // ============================================
  // HELPERS: Formateo
  // ============================================

  const obtenerIconoTipo = (tipo: TipoRecurso): string => {
    const iconos: Record<TipoRecurso, string> = {
      pdf: '📄',
      video: '🎥',
      articulo: '📰',
      audio: '🎧',
      ejercicio: '🧘',
      imagen: '🖼️',
      otro: '📎'
    }
    return iconos[tipo] || '📎'
  }

  const obtenerColorTipo = (tipo: TipoRecurso): string => {
    const colores: Record<TipoRecurso, string> = {
      pdf: 'bg-red-100 text-red-700',
      video: 'bg-purple-100 text-purple-700',
      articulo: 'bg-blue-100 text-blue-700',
      audio: 'bg-green-100 text-green-700',
      ejercicio: 'bg-yellow-100 text-yellow-700',
      imagen: 'bg-pink-100 text-pink-700',
      otro: 'bg-gray-100 text-gray-700'
    }
    return colores[tipo] || 'bg-gray-100 text-gray-700'
  }

  const formatearTamano = (bytes: number | null): string => {
    if (!bytes) return '-'
    const mb = bytes / (1024 * 1024)
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${mb.toFixed(1)} MB`
  }

  const formatearDuracion = (minutos: number | null): string => {
    if (!minutos) return '-'
    if (minutos < 60) {
      return `${minutos} min`
    }
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return `${horas}h ${mins}m`
  }

  // ============================================
  // RETURN
  // ============================================

  return {
    // Estado
    recursos,
    recursosPaciente,
    recursosNoVistos,
    cargando,
    error,

    // Métodos CRUD
    obtenerRecursos,
    obtenerRecursoPorId,
    crearRecurso,
    editarRecurso,
    eliminarRecurso,

    // Envío a pacientes
    enviarRecursoAPacientes,
    obtenerRecursosPaciente,
    marcarRecursoVisto,
    calificarRecurso,

    // Estadísticas
    obtenerEstadisticas,
    obtenerRecursosPopulares,

    // Helpers
    obtenerIconoTipo,
    obtenerColorTipo,
    formatearTamano,
    formatearDuracion,
  }
}
