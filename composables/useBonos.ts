/**
 * Composable para gestión de bonos
 * Proporciona funciones para CRUD de bonos, pagos y renovaciones
 */

// Tipos para bonos
type Bono = any
type BonoInsert = any
type BonoUpdate = any
type PagoBono = any
type PagoBonoInsert = any
type RenovacionBono = any

export const useBonos = () => {
  const supabase = useSupabaseClient()
  const { userProfile } = useSupabase()
  const { isCoordinadora } = useRoles()

  /**
   * Obtiene todos los bonos de un paciente específico
   */
  const getBonosPorPaciente = async (pacienteId: string): Promise<Bono[]> => {
    try {
      const { data, error } = await supabase
        .from('bonos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('[Bonos] Error en consulta getBonosPorPaciente:', error.message)
        return []
      }

      return data || []
    } catch (err) {
      console.warn('[Bonos] Error inesperado en getBonosPorPaciente:', err)
      return []
    }
  }

  /**
   * Obtiene un bono específico por ID con información de pagos
   */
  const getBonoConPagos = async (bonoId: string) => {
    try {
      const { data: bono, error: errorBono } = await supabase
        .from('bonos')
        .select('*')
        .eq('id', bonoId)
        .single()

      if (errorBono) {
        console.warn('[Bonos] Error al obtener bono:', errorBono.message)
        return null
      }

      const { data: pagos, error: errorPagos } = await supabase
        .from('pagos_bonos')
        .select('*')
        .eq('bono_id', bonoId)
        .order('fecha_pago', { ascending: false })

      if (errorPagos) {
        console.warn('[Bonos] Error al obtener pagos:', errorPagos.message)
      }

      return {
        bono,
        pagos: pagos || []
      }
    } catch (err) {
      console.warn('[Bonos] Error inesperado en getBonoConPagos:', err)
      return null
    }
  }

  /**
   * Obtiene bonos activos de un paciente
   */
  const getBonosActivos = async (pacienteId: string): Promise<Bono[]> => {
    try {
      const { data, error } = await supabase
        .from('bonos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .eq('estado', 'activo')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('[Bonos] Error en getBonosActivos:', error.message)
        return []
      }

      return data || []
    } catch (err) {
      console.warn('[Bonos] Error inesperado en getBonosActivos:', err)
      return []
    }
  }

  /**
   * Crea un nuevo bono
   */
  const crearBono = async (bonoData: BonoInsert) => {
    try {
      const { data, error } = await supabase
        .from('bonos')
        .insert(bonoData)
        .select()
        .single()

      if (error) {
        console.error('[Bonos] Error al crear bono:', error.message)
        throw new Error(`Error al crear bono: ${error.message}`)
      }

      return data
    } catch (err: any) {
      console.error('[Bonos] Error inesperado al crear bono:', err)
      throw new Error(err.message || 'Error al crear el bono')
    }
  }

  /**
   * Actualiza un bono existente
   */
  const actualizarBono = async (bonoId: string, cambios: BonoUpdate) => {
    try {
      const { data, error } = await supabase
        .from('bonos')
        .update({
          ...cambios,
          updated_at: new Date().toISOString()
        })
        .eq('id', bonoId)
        .select()
        .single()

      if (error) {
        console.error('[Bonos] Error al actualizar bono:', error.message)
        throw new Error(`Error al actualizar bono: ${error.message}`)
      }

      return data
    } catch (err: any) {
      console.error('[Bonos] Error inesperado al actualizar bono:', err)
      throw new Error(err.message || 'Error al actualizar el bono')
    }
  }

  /**
   * Registra un pago para un bono
   */
  const registrarPago = async (
    bonoId: string,
    monto: number,
    metodo: string,
    confirmado: boolean = false
  ) => {
    try {
      const pagoData: PagoBonoInsert = {
        bono_id: bonoId,
        monto,
        metodo_pago: metodo,
        confirmado,
        fecha_pago: new Date().toISOString().split('T')[0],
        ...(confirmado && {
          confirmado_por: userProfile.value?.id,
          fecha_confirmacion: new Date().toISOString()
        })
      }

      const { data, error } = await supabase
        .from('pagos_bonos')
        .insert(pagoData)
        .select()
        .single()

      if (error) {
        console.error('[Bonos] Error al registrar pago:', error.message)
        throw new Error(`Error al registrar pago: ${error.message}`)
      }

      return data
    } catch (err: any) {
      console.error('[Bonos] Error inesperado al registrar pago:', err)
      throw new Error(err.message || 'Error al registrar el pago')
    }
  }

  /**
   * Confirma un pago usando la función RPC de Supabase
   */
  const confirmarPago = async (pagoId: string) => {
    try {
      const { data, error } = await supabase.rpc('fn_confirmar_pago_bono', {
        p_pago_id: pagoId
      })

      if (error) {
        console.error('[Bonos] Error al confirmar pago:', error.message)
        throw new Error(`Error al confirmar pago: ${error.message}`)
      }

      // La función RPC retorna un objeto JSON con success, mensaje, etc.
      const resultado = data as any

      if (!resultado.success) {
        throw new Error(resultado.mensaje || 'Error al confirmar el pago')
      }

      return resultado
    } catch (err: any) {
      console.error('[Bonos] Error inesperado al confirmar pago:', err)
      throw new Error(err.message || 'Error al confirmar el pago')
    }
  }

  /**
   * Renueva un bono manualmente usando la función RPC
   */
  const renovarBono = async (
    bonoId: string,
    motivo?: string,
    modificarSesiones?: number,
    modificarMonto?: number
  ) => {
    try {
      const userId = userProfile.value?.id

      if (!userId) {
        throw new Error('Usuario no autenticado')
      }

      const { data, error } = await supabase.rpc('fn_renovar_bono_manual', {
        p_bono_id: bonoId,
        p_usuario_id: userId,
        p_motivo: motivo || null,
        p_modificar_sesiones: modificarSesiones || null,
        p_modificar_monto: modificarMonto || null
      })

      if (error) {
        console.error('[Bonos] Error al renovar bono:', error.message)
        throw new Error(`Error al renovar bono: ${error.message}`)
      }

      const resultado = data as any

      if (!resultado.success) {
        throw new Error(resultado.mensaje || 'Error al renovar el bono')
      }

      return resultado
    } catch (err: any) {
      console.error('[Bonos] Error inesperado al renovar bono:', err)
      throw new Error(err.message || 'Error al renovar el bono')
    }
  }

  /**
   * Obtiene el historial de renovaciones de un bono
   */
  const getRenovaciones = async (bonoId: string): Promise<RenovacionBono[]> => {
    try {
      const { data, error } = await supabase
        .from('renovaciones_bonos')
        .select('*')
        .or(`bono_original_id.eq.${bonoId},nuevo_bono_id.eq.${bonoId}`)
        .order('fecha_renovacion', { ascending: false })

      if (error) {
        console.warn('[Bonos] Error al obtener renovaciones:', error.message)
        return []
      }

      return data || []
    } catch (err) {
      console.warn('[Bonos] Error inesperado al obtener renovaciones:', err)
      return []
    }
  }

  /**
   * Obtiene los pagos de un bono específico
   */
  const getPagosPorBono = async (bonoId: string): Promise<PagoBono[]> => {
    try {
      const { data, error } = await supabase
        .from('pagos_bonos')
        .select('*')
        .eq('bono_id', bonoId)
        .order('fecha_pago', { ascending: false })

      if (error) {
        console.warn('[Bonos] Error al obtener pagos:', error.message)
        return []
      }

      return data || []
    } catch (err) {
      console.warn('[Bonos] Error inesperado al obtener pagos:', err)
      return []
    }
  }

  /**
   * Calcula métricas de bonos para un paciente
   */
  const calcularMetricas = async (pacienteId: string) => {
    try {
      const bonos = await getBonosPorPaciente(pacienteId)

      const activos = bonos.filter(b => b.estado === 'activo').length
      const completados = bonos.filter(b => b.estado === 'completado').length
      const vencidos = bonos.filter(b => b.estado === 'vencido').length
      const pendientes = bonos.filter(b => b.estado === 'pendiente').length

      // Bonos próximos a vencer (dentro de 7 días)
      const hoy = new Date()
      const proximosAVencer = bonos.filter(b => {
        if (b.estado !== 'activo' || !b.fecha_fin) return false
        const fechaFin = new Date(b.fecha_fin)
        const diasRestantes = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
        return diasRestantes >= 0 && diasRestantes <= 7
      }).length

      // Bonos con pocas sesiones restantes (<= 2)
      const pocasSesiones = bonos.filter(b => 
        b.estado === 'activo' && 
        b.sesiones_restantes !== null && 
        b.sesiones_restantes <= 2
      ).length

      return {
        total: bonos.length,
        activos,
        completados,
        vencidos,
        pendientes,
        proximosAVencer,
        pocasSesiones
      }
    } catch (err) {
      console.warn('[Bonos] Error al calcular métricas:', err)
      return {
        total: 0,
        activos: 0,
        completados: 0,
        vencidos: 0,
        pendientes: 0,
        proximosAVencer: 0,
        pocasSesiones: 0
      }
    }
  }

  /**
   * Calcula el porcentaje de uso de un bono
   */
  const calcularPorcentajeUso = (bono: Bono): number => {
    if (!bono.sesiones_totales || bono.sesiones_totales === 0) return 0
    
    const sesionesUsadas = bono.sesiones_totales - (bono.sesiones_restantes || 0)
    return Math.round((sesionesUsadas / bono.sesiones_totales) * 100)
  }

  /**
   * Obtiene el color del estado del bono
   */
  const getEstadoColor = (estado: string): string => {
    const colores: Record<string, string> = {
      'pendiente': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'activo': 'bg-green-100 text-green-700 border-green-300',
      'completado': 'bg-gray-100 text-gray-600 border-gray-300',
      'vencido': 'bg-red-100 text-red-600 border-red-300',
      'cancelado': 'bg-gray-200 text-gray-500 border-gray-400 line-through'
    }
    return colores[estado] || 'bg-gray-100 text-gray-600'
  }

  /**
   * Obtiene el texto del estado del bono
   */
  const getEstadoTexto = (estado: string): string => {
    const textos: Record<string, string> = {
      'pendiente': 'Pendiente de activación',
      'activo': 'Activo',
      'completado': 'Completado',
      'vencido': 'Vencido',
      'cancelado': 'Cancelado'
    }
    return textos[estado] || estado
  }

  /**
   * Verifica si el usuario puede gestionar bonos
   */
  const puedeGestionarBonos = computed(() => {
    return isCoordinadora.value || userProfile.value?.rol === 'psicologa'
  })

  /**
   * Verifica si el usuario puede confirmar pagos
   */
  const puedeConfirmarPagos = computed(() => {
    return isCoordinadora.value
  })

  return {
    // Funciones de consulta
    getBonosPorPaciente,
    getBonoConPagos,
    getBonosActivos,
    getPagosPorBono,
    getRenovaciones,
    calcularMetricas,

    // Funciones de modificación
    crearBono,
    actualizarBono,
    registrarPago,
    confirmarPago,
    renovarBono,

    // Helpers
    calcularPorcentajeUso,
    getEstadoColor,
    getEstadoTexto,

    // Permisos
    puedeGestionarBonos,
    puedeConfirmarPagos
  }
}
