export type EstadoSesion = 'pendiente' | 'confirmada' | 'anulada' | 'completada'
export type ModalidadSesion = 'online' | 'presencial'

export interface Sesion {
  id: string
  paciente_id: string
  terapeuta_id: string
  fecha: string
  estado: EstadoSesion
  modalidad: ModalidadSesion
  precio_total: number
  observaciones?: string | null
  pago_confirmado: boolean
  created_at?: string
}

export interface SesionDetallada extends Sesion {
  paciente_nombre?: string
  paciente_apellido?: string
}

export interface ResumenFinanciero {
  pendientes: number
  confirmadas: number
  anuladas: number
  completadas: number
  montoPendiente: number
  montoConfirmado: number
  montoAnulado: number
  montoTerapeuta: number
  montoTotal: number
}

export const useSesiones = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const PORCENTAJE_TERAPEUTA = 0.7
  const PORCENTAJE_CONSULTA = 0.3

  /**
   * Obtiene todas las sesiones del terapeuta autenticado
   */
  const obtenerSesiones = async (filtros?: {
    estado?: EstadoSesion
    mes?: number
    anio?: number
    pacienteId?: string
  }) => {
    if (!user.value) {
      throw new Error('Usuario no autenticado')
    }

    let query = supabase
      .from('sesiones')
      .select(`
        *,
        pacientes!inner(
          id,
          nombre,
          apellido
        )
      `)
      .eq('terapeuta_id', user.value.id)
      .order('fecha', { ascending: false })

    // Aplicar filtros opcionales
    if (filtros?.estado) {
      query = query.eq('estado', filtros.estado)
    }

    if (filtros?.pacienteId) {
      query = query.eq('paciente_id', filtros.pacienteId)
    }

    if (filtros?.mes && filtros?.anio) {
      const fechaInicio = new Date(filtros.anio, filtros.mes - 1, 1)
      const fechaFin = new Date(filtros.anio, filtros.mes, 0)
      query = query
        .gte('fecha', fechaInicio.toISOString())
        .lte('fecha', fechaFin.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener sesiones:', error)
      throw error
    }

    // Mapear datos con información del paciente
    const sesionesDetalladas: SesionDetallada[] = (data || []).map((sesion: any) => ({
      ...sesion,
      paciente_nombre: sesion.pacientes?.nombre || 'Paciente',
      paciente_apellido: sesion.pacientes?.apellido || '',
    }))

    return sesionesDetalladas
  }

  /**
   * Calcula el resumen financiero de las sesiones
   */
  const calcularResumenFinanciero = (sesiones: SesionDetallada[]): ResumenFinanciero => {
    const sesionesPendientes = sesiones.filter(s => s.estado === 'pendiente')
    const sesionesConfirmadas = sesiones.filter(s => s.estado === 'confirmada')
    const sesionesAnuladas = sesiones.filter(s => s.estado === 'anulada')
    const sesionesCompletadas = sesiones.filter(s => s.estado === 'completada')

    const calcularMonto = (lista: SesionDetallada[], aplicarPorcentaje = true) => {
      return lista.reduce((sum, s) => {
        const precio = Number(s.precio_total) || 0
        return sum + (aplicarPorcentaje ? precio * PORCENTAJE_TERAPEUTA : precio)
      }, 0)
    }

    const montoPendiente = calcularMonto(sesionesPendientes)
    const montoConfirmado = calcularMonto(sesionesConfirmadas)
    const montoAnulado = 0 // Las anuladas no generan ingreso
    const montoTerapeuta = montoConfirmado // Solo las confirmadas cuentan
    const montoTotal = calcularMonto([...sesionesPendientes, ...sesionesConfirmadas], false)

    return {
      pendientes: sesionesPendientes.length,
      confirmadas: sesionesConfirmadas.length,
      anuladas: sesionesAnuladas.length,
      completadas: sesionesCompletadas.length,
      montoPendiente,
      montoConfirmado,
      montoAnulado,
      montoTerapeuta,
      montoTotal
    }
  }

  /**
   * Obtiene el nombre formateado del paciente (solo nombre + inicial)
   */
  const formatearNombrePaciente = (nombre: string, apellido: string): string => {
    const inicial = apellido ? apellido.charAt(0).toUpperCase() + '.' : ''
    return `${nombre} ${inicial}`.trim()
  }

  /**
   * Formatea el monto a euros
   */
  const formatearMonto = (monto: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(monto)
  }

  /**
   * Formatea la fecha
   */
  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  /**
   * Obtiene el color según el estado
   */
  const obtenerColorEstado = (estado: EstadoSesion): string => {
    const colores = {
      pendiente: 'amber',
      confirmada: 'green',
      anulada: 'red',
      completada: 'blue'
    }
    return colores[estado] || 'gray'
  }

  /**
   * Obtiene el emoji según el estado
   */
  const obtenerEmojiEstado = (estado: EstadoSesion): string => {
    const emojis = {
      pendiente: '🕓',
      confirmada: '💚',
      anulada: '❌',
      completada: '✅'
    }
    return emojis[estado] || '📋'
  }

  /**
   * Crea una nueva sesión
   */
  const crearSesion = async (sesion: {
    paciente_id: string
    fecha: string
    estado: EstadoSesion
    modalidad: ModalidadSesion
    precio_total: number
    observaciones?: string
  }) => {
    if (!user.value) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('sesiones')
      .insert({
        ...sesion,
        terapeuta_id: user.value.id,
        pago_confirmado: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error al crear sesión:', error)
      throw error
    }

    return data
  }

  /**
   * Actualiza una sesión existente
   */
  const actualizarSesion = async (id: string, actualizaciones: Partial<Sesion>) => {
    const { data, error } = await supabase
      .from('sesiones')
      .update(actualizaciones)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar sesión:', error)
      throw error
    }

    return data
  }

  return {
    // Constantes
    PORCENTAJE_TERAPEUTA,
    PORCENTAJE_CONSULTA,
    
    // Métodos de consulta
    obtenerSesiones,
    calcularResumenFinanciero,
    
    // Métodos de formato
    formatearNombrePaciente,
    formatearMonto,
    formatearFecha,
    obtenerColorEstado,
    obtenerEmojiEstado,
    
    // Métodos de escritura
    crearSesion,
    actualizarSesion
  }
}
