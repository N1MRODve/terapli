// =============================================================================
// COMPOSABLE: useAgenda - Sistema de Gestión de Citas y Bonos
// =============================================================================
// Objetivo: Conectar la agenda del terapeuta con Supabase RPC y Realtime
// 
// Características:
// ✅ Mostrar citas del terapeuta autenticado
// ✅ Marcar citas como completadas (con descuento automático de bono)
// ✅ Actualización en tiempo real (Supabase Realtime)
// ✅ Manejo robusto de errores
// ✅ Notificaciones y alertas visuales
// ✅ Compatible con Composition API y Nuxt 3
// =============================================================================

import { ref, computed, onUnmounted, watchEffect } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'

export interface Cita {
  id: string
  fecha_cita: string
  hora_inicio: string
  hora_fin: string
  duracion_minutos?: number
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'realizada'
  modalidad: string
  observaciones?: string
  notas_rapidas?: string
  enlace_videollamada?: string
  area_terapeutica?: string
  tipo_sesion?: 'individual' | 'pareja' | 'familia' | 'grupal'
  recordatorio_24h_enviado?: boolean
  recordatorio_4h_enviado?: boolean
  paciente_id: string
  terapeuta_id: string
  bono_id?: string
  sesion_descontada: boolean
  consumo_registrado: boolean
  paciente?: {
    id: string
    nombre_completo: string
    telefono?: string
    email?: string
  }
  bono?: {
    id: string
    sesiones_restantes: number
    sesiones_totales: number
    estado: string
  }
}

export interface FiltrosAgenda {
  paciente?: string
  terapeuta?: string
  area_terapeutica?: string
  estado?: string[]
  tipo_sesion?: string[]
  busqueda?: string
  fecha_desde?: string
  fecha_hasta?: string
}

export interface DisponibilidadTerapeuta {
  dia_semana: number // 0=Domingo, 6=Sábado
  hora_inicio: string
  hora_fin: string
  disponible: boolean
}

export const COLORES_ESTADO = {
  pendiente: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100',
    hover: 'hover:bg-yellow-100'
  },
  confirmada: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-800',
    badge: 'bg-blue-100',
    hover: 'hover:bg-blue-100'
  },
  completada: {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    text: 'text-gray-700',
    badge: 'bg-gray-100',
    hover: 'hover:bg-gray-100'
  },
  realizada: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-800',
    badge: 'bg-green-100',
    hover: 'hover:bg-green-100'
  },
  cancelada: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-800',
    badge: 'bg-red-100',
    hover: 'hover:bg-red-100'
  }
} as const

export interface ResultadoCompletar {
  success: boolean
  message: string
  cita_id?: string
  bono_id?: string
  sesiones_antes?: number
  sesiones_despues?: number
  sesiones_totales?: number
  bono_completado?: boolean
  alerta?: boolean
  tipo_alerta?: 'pocas_sesiones' | 'ultima_sesion' | 'bono_agotado'
  mensaje_alerta?: string
  error?: string
  warning?: string
}

export function useAgenda() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Estado reactivo
  const citas = ref<Cita[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const realtimeChannel = ref<any>(null)
  const filtros = ref<FiltrosAgenda>({})
  const citasDraggeables = ref<Map<string, Cita>>(new Map())

  // =============================================================================
  // Computadas útiles
  // =============================================================================

  const citasDelDia = computed(() => {
    const hoy = new Date().toISOString().split('T')[0]
    return citas.value.filter(c => c.fecha_cita === hoy)
  })

  const citasPendientes = computed(() => {
    return citas.value.filter(c => 
      c.estado === 'pendiente' || c.estado === 'confirmada'
    )
  })

  const citasCompletadas = computed(() => {
    return citas.value.filter(c => 
      c.estado === 'completada' || c.estado === 'realizada'
    )
  })

  const citasConBonoProximoAgotar = computed(() => {
    return citas.value.filter(c => 
      c.bono && 
      c.bono.sesiones_restantes <= 2 && 
      c.bono.sesiones_restantes > 0 &&
      (c.estado === 'pendiente' || c.estado === 'confirmada')
    )
  })

  // =============================================================================
  // Función: Obtener citas del terapeuta
  // =============================================================================

  const getCitasDelTerapeuta = async (opciones?: {
    fechaInicio?: string
    fechaFin?: string
    incluirCompletadas?: boolean
  }) => {
    try {
      loading.value = true
      error.value = null

      // Validar que el usuario esté autenticado
      if (!user.value?.id) {
        throw new Error('Usuario no autenticado')
      }

      // Construir query
      let query = supabase
        .from('citas')
        .select(`
          id,
          fecha_cita,
          hora_inicio,
          hora_fin,
          estado,
          modalidad,
          observaciones,
          paciente_id,
          terapeuta_id,
          bono_id,
          sesion_descontada,
          consumo_registrado,
          paciente:pacientes (
            id,
            nombre_completo,
            telefono,
            email
          ),
          bono:bonos (
            id,
            sesiones_restantes,
            sesiones_totales,
            estado
          )
        `)
        .eq('terapeuta_id', user.value.id)

      // Filtros opcionales
      if (opciones?.fechaInicio) {
        query = query.gte('fecha_cita', opciones.fechaInicio)
      }

      if (opciones?.fechaFin) {
        query = query.lte('fecha_cita', opciones.fechaFin)
      }

      if (!opciones?.incluirCompletadas) {
        query = query.in('estado', ['pendiente', 'confirmada'])
      }

      // Ordenar por fecha y hora
      query = query
        .order('fecha_cita', { ascending: true })
        .order('hora_inicio', { ascending: true })

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      citas.value = data || []

      console.log(`✅ [Agenda] Cargadas ${citas.value.length} citas`)

      return citas.value
    } catch (err: any) {
      console.error('❌ [Agenda] Error al cargar citas:', err)
      error.value = err.message || 'Error al cargar citas'
      throw err
    } finally {
      loading.value = false
    }
  }

  // =============================================================================
  // Función: Completar cita (con descuento automático de bono)
  // =============================================================================

  const completarCita = async (citaId: string): Promise<ResultadoCompletar> => {
    try {
      console.log(`🔄 [Agenda] Completando cita: ${citaId}`)

      // Ejecutar RPC en Supabase
      const { data, error: rpcError } = await supabase.rpc('completar_cita', {
        p_cita_id: citaId
      })

      if (rpcError) {
        console.error('❌ [Agenda] Error en RPC:', rpcError)
        throw rpcError
      }

      const resultado = data as ResultadoCompletar

      if (resultado.success) {
        console.log('✅ [Agenda] Cita completada exitosamente')

        // Actualizar estado local
        const index = citas.value.findIndex(c => c.id === citaId)
        if (index !== -1) {
          const cita = citas.value[index]
          if (cita) {
            cita.estado = 'completada'
            cita.sesion_descontada = true
            cita.consumo_registrado = true

            // Actualizar sesiones del bono si existe
            if (cita.bono && resultado.sesiones_despues !== undefined) {
              cita.bono.sesiones_restantes = resultado.sesiones_despues
              
              if (resultado.bono_completado) {
                cita.bono.estado = 'completado'
              }
            }
          }
        }

        // Mostrar notificación según el tipo de alerta
        if (resultado.alerta) {
          mostrarAlerta(resultado)
        } else {
          mostrarNotificacion('success', resultado.message)
        }

        // Recargar citas para asegurar sincronización
        await getCitasDelTerapeuta()

        return resultado
      } else {
        // Manejar caso de advertencia (ej: ya descontada)
        if (resultado.warning) {
          console.warn('⚠️ [Agenda] Advertencia:', resultado.message)
          mostrarNotificacion('warning', resultado.message)
        } else {
          console.error('❌ [Agenda] Error:', resultado.message)
          mostrarNotificacion('error', resultado.message || 'No se pudo completar la cita')
        }

        return resultado
      }
    } catch (err: any) {
      console.error('❌ [Agenda] Error al completar cita:', err)
      const errorMsg = err.message || 'Error desconocido al completar cita'
      mostrarNotificacion('error', errorMsg)
      
      return {
        success: false,
        message: errorMsg,
        error: err.code || 'unknown_error'
      }
    }
  }

  // =============================================================================
  // Función: Obtener historial de un bono
  // =============================================================================

  const obtenerHistorialBono = async (bonoId: string) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('obtener_historial_bono', {
        p_bono_id: bonoId
      })

      if (rpcError) throw rpcError

      console.log(`✅ [Agenda] Historial de bono obtenido: ${data?.length || 0} movimientos`)

      return data || []
    } catch (err: any) {
      console.error('❌ [Agenda] Error al obtener historial:', err)
      throw err
    }
  }

  // =============================================================================
  // Función: Verificar estado de un bono
  // =============================================================================

  const verificarBonoCitas = async (bonoId: string) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('verificar_bono_citas', {
        p_bono_id: bonoId
      })

      if (rpcError) throw rpcError

      console.log('✅ [Agenda] Verificación de bono:', data)

      if (data?.alerta) {
        console.warn('⚠️ [Agenda] Alerta en bono:', data.mensaje_alerta)
      }

      return data
    } catch (err: any) {
      console.error('❌ [Agenda] Error al verificar bono:', err)
      throw err
    }
  }

  // =============================================================================
  // Función: Detectar citas con inconsistencias (completadas sin descuento)
  // =============================================================================

  const citasPendientesSync = ref<Cita[]>([])

  const detectarInconsistencias = async () => {
    try {
      console.log('🔍 [Agenda] Detectando inconsistencias...')

      // Buscar citas completadas sin descuento aplicado
      const { data, error } = await supabase
        .from('citas')
        .select(`
          id,
          fecha_cita,
          hora_inicio,
          hora_fin,
          estado,
          modalidad,
          observaciones,
          paciente_id,
          terapeuta_id,
          bono_id,
          sesion_descontada,
          consumo_registrado,
          paciente:pacientes (
            id,
            nombre_completo,
            telefono,
            email
          ),
          bono:bonos (
            id,
            sesiones_restantes,
            sesiones_totales,
            estado
          )
        `)
        .in('estado', ['completada', 'realizada'])
        .not('bono_id', 'is', null)
        .or('sesion_descontada.eq.false,consumo_registrado.eq.false')
        .eq('terapeuta_id', user.value?.id || '')

      if (error) throw error

      citasPendientesSync.value = data || []

      if (citasPendientesSync.value.length > 0) {
        console.warn(
          `⚠️ [Agenda] ${citasPendientesSync.value.length} cita(s) con inconsistencias detectadas`
        )
      } else {
        console.log('✅ [Agenda] No se detectaron inconsistencias')
      }

      return citasPendientesSync.value
    } catch (err: any) {
      console.error('❌ [Agenda] Error al detectar inconsistencias:', err)
      citasPendientesSync.value = []
      return []
    }
  }

  // =============================================================================
  // Función: Re-sincronizar bono de una cita específica
  // =============================================================================

  const resincronizarBono = async (citaId: string) => {
    try {
      console.log(`🔄 [Agenda] Re-sincronizando bono para cita: ${citaId}`)

      // Llamar directamente a la función RPC
      const { data, error } = await supabase.rpc('actualizar_bono_por_cita', {
        p_cita_id: citaId
      })

      if (error) throw error

      const resultado = data as ResultadoCompletar

      if (resultado.success) {
        console.log('✅ [Agenda] Bono re-sincronizado exitosamente')

        // Si ya estaba descontada, informar
        if (resultado.warning === 'ya_descontada') {
          mostrarNotificacion('info', 'Esta sesión ya estaba descontada')
        } else {
          mostrarNotificacion('success', 'Bono re-sincronizado correctamente')
          
          // Mostrar alerta si corresponde
          if (resultado.alerta && resultado.mensaje_alerta) {
            setTimeout(() => {
              mostrarNotificacion('warning', resultado.mensaje_alerta!)
            }, 500)
          }
        }

        // Actualizar listas
        await Promise.all([
          getCitasDelTerapeuta(),
          detectarInconsistencias()
        ])

        return resultado
      } else {
        console.warn('⚠️ [Agenda] No se pudo re-sincronizar:', resultado.message)
        mostrarNotificacion('warning', resultado.message || 'No se pudo re-sincronizar')
        return resultado
      }
    } catch (err: any) {
      console.error('❌ [Agenda] Error al re-sincronizar bono:', err)
      mostrarNotificacion('error', 'Error al re-sincronizar el bono')
      throw err
    }
  }

  // =============================================================================
  // Función: Re-sincronizar todos los bonos con inconsistencias
  // =============================================================================

  const resincronizarTodos = async () => {
    if (citasPendientesSync.value.length === 0) {
      mostrarNotificacion('info', 'No hay citas pendientes de sincronización')
      return
    }

    try {
      console.log(`🔄 [Agenda] Re-sincronizando ${citasPendientesSync.value.length} citas...`)

      let exitosos = 0
      let fallidos = 0
      let yaDescontados = 0

      // Procesar todas las citas
      for (const cita of citasPendientesSync.value) {
        try {
          const resultado = await resincronizarBono(cita.id)
          
          if (resultado.success) {
            if (resultado.warning === 'ya_descontada') {
              yaDescontados++
            } else {
              exitosos++
            }
          } else {
            fallidos++
          }

          // Pequeña pausa entre cada llamada para no sobrecargar
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch {
          fallidos++
        }
      }

      // Mostrar resumen
      const mensajes = []
      if (exitosos > 0) mensajes.push(`${exitosos} sincronizada(s)`)
      if (yaDescontados > 0) mensajes.push(`${yaDescontados} ya estaba(n) descontada(s)`)
      if (fallidos > 0) mensajes.push(`${fallidos} fallida(s)`)

      const mensaje = `✅ Re-sincronización completa: ${mensajes.join(', ')}`
      
      if (fallidos === 0) {
        mostrarNotificacion('success', mensaje)
      } else {
        mostrarNotificacion('warning', mensaje)
      }

      console.log('✅ [Agenda] Re-sincronización masiva completada:', {
        exitosos,
        yaDescontados,
        fallidos
      })
    } catch (err: any) {
      console.error('❌ [Agenda] Error en re-sincronización masiva:', err)
      mostrarNotificacion('error', 'Error al re-sincronizar todas las citas')
    }
  }

  // =============================================================================
  // Función: Suscripción a cambios en tiempo real
  // =============================================================================

  const suscribirCitasRealtime = () => {
    if (!user.value?.id) {
      console.warn('⚠️ [Agenda] No se puede suscribir sin usuario autenticado')
      return
    }

    // Cerrar canal anterior si existe
    if (realtimeChannel.value) {
      supabase.removeChannel(realtimeChannel.value)
    }

    console.log('📡 [Agenda] Iniciando suscripción Realtime...')

    realtimeChannel.value = supabase
      .channel(`citas_terapeuta_${user.value.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'citas',
          filter: `terapeuta_id=eq.${user.value.id}`
        },
        async (payload) => {
          console.log('📡 [Realtime] Cambio detectado en citas:', payload.eventType)
          
          // Recargar citas cuando hay cambios
          await getCitasDelTerapeuta()

          // Notificar según el tipo de evento
          if (payload.eventType === 'INSERT') {
            mostrarNotificacion('info', 'Nueva cita agregada a tu agenda')
          } else if (payload.eventType === 'UPDATE') {
            mostrarNotificacion('info', 'Una cita ha sido actualizada')
          } else if (payload.eventType === 'DELETE') {
            mostrarNotificacion('warning', 'Una cita ha sido eliminada')
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ [Realtime] Suscripción activa')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [Realtime] Error en suscripción')
        } else if (status === 'TIMED_OUT') {
          console.warn('⚠️ [Realtime] Tiempo de espera agotado')
        }
      })
  }

  // =============================================================================
  // Función: Cancelar suscripción Realtime
  // =============================================================================

  const desuscribirCitasRealtime = () => {
    if (realtimeChannel.value) {
      console.log('📡 [Realtime] Cerrando suscripción...')
      supabase.removeChannel(realtimeChannel.value)
      realtimeChannel.value = null
    }
  }

  // =============================================================================
  // Funciones auxiliares: Notificaciones
  // =============================================================================

  const mostrarNotificacion = (tipo: 'success' | 'error' | 'warning' | 'info', mensaje: string) => {
    // Intenta usar el toast global si existe
    if (typeof window !== 'undefined' && (window as any).$toast) {
      (window as any).$toast[tipo](mensaje)
    } else {
      // Fallback a consola
      const emoji = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }
      console.log(`${emoji[tipo]} [Agenda] ${mensaje}`)
    }
  }

  const mostrarAlerta = (resultado: ResultadoCompletar) => {
    if (!resultado.alerta || !resultado.mensaje_alerta) return

    const tipoNotificacion = 
      resultado.tipo_alerta === 'bono_agotado' ? 'success' :
      resultado.tipo_alerta === 'ultima_sesion' ? 'warning' :
      'warning'

    mostrarNotificacion(tipoNotificacion, resultado.mensaje_alerta)
  }

  // =============================================================================
  // Lifecycle: Auto-cargar y suscribir cuando hay usuario
  // =============================================================================

  watchEffect(() => {
    if (user.value?.id) {
      getCitasDelTerapeuta()
      suscribirCitasRealtime()
    }
  })

  // Limpiar suscripción al desmontar
  onUnmounted(() => {
    desuscribirCitasRealtime()
  })

  // =============================================================================
  // NUEVAS FUNCIONALIDADES AGENDA MEJORADA
  // =============================================================================

  /**
   * Filtrar citas con búsqueda avanzada
   */
  const citasFiltradas = computed(() => {
    let resultado = citas.value

    if (filtros.value.paciente) {
      resultado = resultado.filter(c => 
        c.paciente?.nombre_completo.toLowerCase().includes(filtros.value.paciente!.toLowerCase())
      )
    }

    if (filtros.value.busqueda) {
      const busq = filtros.value.busqueda.toLowerCase()
      resultado = resultado.filter(c => 
        c.paciente?.nombre_completo.toLowerCase().includes(busq) ||
        c.observaciones?.toLowerCase().includes(busq) ||
        c.fecha_cita.includes(busq)
      )
    }

    if (filtros.value.estado && filtros.value.estado.length > 0) {
      resultado = resultado.filter(c => filtros.value.estado!.includes(c.estado))
    }

    if (filtros.value.area_terapeutica) {
      resultado = resultado.filter(c => c.area_terapeutica === filtros.value.area_terapeutica)
    }

    if (filtros.value.tipo_sesion && filtros.value.tipo_sesion.length > 0) {
      resultado = resultado.filter(c => 
        c.tipo_sesion && filtros.value.tipo_sesion!.includes(c.tipo_sesion)
      )
    }

    if (filtros.value.fecha_desde) {
      resultado = resultado.filter(c => c.fecha_cita >= filtros.value.fecha_desde!)
    }

    if (filtros.value.fecha_hasta) {
      resultado = resultado.filter(c => c.fecha_cita <= filtros.value.fecha_hasta!)
    }

    return resultado
  })

  /**
   * Aplicar filtros
   */
  const aplicarFiltros = (nuevosFiltros: FiltrosAgenda) => {
    filtros.value = { ...nuevosFiltros }
  }

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = () => {
    filtros.value = {}
  }

  /**
   * Reprogramar cita (drag & drop)
   */
  const reprogramarCita = async (
    citaId: string, 
    nuevaFecha: string, 
    nuevaHoraInicio: string,
    nuevaHoraFin?: string
  ) => {
    try {
      loading.value = true

      const { data, error: err } = await supabase
        .from('citas')
        .update({
          fecha_cita: nuevaFecha,
          hora_inicio: nuevaHoraInicio,
          hora_fin: nuevaHoraFin || nuevaHoraInicio,
          updated_at: new Date().toISOString()
        })
        .eq('id', citaId)
        .select()
        .single()

      if (err) throw err

      // Actualizar localmente
      const index = citas.value.findIndex(c => c.id === citaId)
      if (index !== -1 && data) {
        citas.value[index] = { ...citas.value[index], ...data }
      }

      return { success: true, cita: data }
    } catch (e: any) {
      console.error('Error al reprogramar cita:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar notas rápidas de una cita
   */
  const actualizarNotasRapidas = async (citaId: string, notas: string, enlace?: string) => {
    try {
      const { data, error: err } = await supabase
        .from('citas')
        .update({
          notas_rapidas: notas,
          enlace_videollamada: enlace,
          updated_at: new Date().toISOString()
        })
        .eq('id', citaId)
        .select()
        .single()

      if (err) throw err

      // Actualizar localmente
      const index = citas.value.findIndex(c => c.id === citaId)
      if (index !== -1 && data) {
        citas.value[index] = { ...citas.value[index], ...data }
      }

      return { success: true }
    } catch (e: any) {
      console.error('Error al actualizar notas:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * Obtener disponibilidad del terapeuta
   */
  const obtenerDisponibilidad = async (terapeutaId?: string) => {
    try {
      const id = terapeutaId || user.value?.id
      if (!id) throw new Error('ID de terapeuta requerido')

      const { data, error: err } = await supabase
        .from('terapeutas')
        .select('disponibilidad')
        .eq('id', id)
        .single()

      if (err) throw err

      return data?.disponibilidad as DisponibilidadTerapeuta[] || []
    } catch (e: any) {
      console.error('Error al obtener disponibilidad:', e)
      return []
    }
  }

  /**
   * Calcular huecos libres en un rango de fechas
   */
  const calcularHuecosLibres = (
    fecha: string,
    disponibilidad: DisponibilidadTerapeuta[]
  ) => {
    const diaSemana = new Date(fecha + 'T00:00:00').getDay()
    const citasDelDia = citas.value.filter(c => c.fecha_cita === fecha)
    
    const disponibleDia = disponibilidad.filter(d => d.dia_semana === diaSemana && d.disponible)
    if (disponibleDia.length === 0) return []

    const huecos: Array<{ hora_inicio: string; hora_fin: string }> = []

    disponibleDia.forEach(slot => {
      const inicio = slot.hora_inicio
      const fin = slot.hora_fin

      // Verificar si hay citas en este slot
      const ocupado = citasDelDia.some(c => {
        return (c.hora_inicio >= inicio && c.hora_inicio < fin) ||
               (c.hora_fin > inicio && c.hora_fin <= fin) ||
               (c.hora_inicio <= inicio && c.hora_fin >= fin)
      })

      if (!ocupado) {
        huecos.push({ hora_inicio: inicio, hora_fin: fin })
      }
    })

    return huecos
  }

  /**
   * Crear recordatorios automáticos
   */
  const programarRecordatorios = async (citaId: string) => {
    try {
      const cita = citas.value.find(c => c.id === citaId)
      if (!cita || !cita.paciente) return { success: false, error: 'Cita no encontrada' }

      const fechaCita = new Date(cita.fecha_cita + 'T' + cita.hora_inicio)
      const ahora = new Date()

      // Recordatorio 24h antes
      const recordatorio24h = new Date(fechaCita.getTime() - 24 * 60 * 60 * 1000)
      if (recordatorio24h > ahora && !cita.recordatorio_24h_enviado) {
        await supabase.from('notificaciones').insert({
          usuario_id: cita.paciente_id,
          tipo: 'cita',
          titulo: '📅 Recordatorio: Cita mañana',
          mensaje: `Tu cita está programada para mañana ${cita.fecha_cita} a las ${cita.hora_inicio}`,
          metadata: {
            cita_id: citaId,
            tipo_recordatorio: '24h',
            fecha_cita: cita.fecha_cita,
            hora: cita.hora_inicio
          }
        })

        // Marcar como enviado
        await supabase
          .from('citas')
          .update({ recordatorio_24h_enviado: true })
          .eq('id', citaId)
      }

      // Recordatorio 4h antes
      const recordatorio4h = new Date(fechaCita.getTime() - 4 * 60 * 60 * 1000)
      if (recordatorio4h > ahora && !cita.recordatorio_4h_enviado) {
        await supabase.from('notificaciones').insert({
          usuario_id: cita.paciente_id,
          tipo: 'cita',
          titulo: '⏰ Recordatorio: Cita en 4 horas',
          mensaje: `Tu cita está programada para hoy ${cita.fecha_cita} a las ${cita.hora_inicio}`,
          metadata: {
            cita_id: citaId,
            tipo_recordatorio: '4h',
            fecha_cita: cita.fecha_cita,
            hora: cita.hora_inicio,
            enlace_videollamada: cita.enlace_videollamada
          }
        })

        // Marcar como enviado
        await supabase
          .from('citas')
          .update({ recordatorio_4h_enviado: true })
          .eq('id', citaId)
      }

      return { success: true }
    } catch (e: any) {
      console.error('Error al programar recordatorios:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * Calcular carga diaria (sesiones confirmadas/pendientes)
   */
  const calcularCargaDiaria = (fecha: string, terapeutaId?: string) => {
    const citasDelDia = citas.value.filter(c => {
      const coincideFecha = c.fecha_cita === fecha
      const coincideTerapeuta = terapeutaId ? c.terapeuta_id === terapeutaId : true
      const esActiva = ['pendiente', 'confirmada'].includes(c.estado)
      return coincideFecha && coincideTerapeuta && esActiva
    })

    return {
      total: citasDelDia.length,
      confirmadas: citasDelDia.filter(c => c.estado === 'confirmada').length,
      pendientes: citasDelDia.filter(c => c.estado === 'pendiente').length
    }
  }

  /**
   * Obtener resumen semanal
   */
  const obtenerResumenSemanal = (fechaInicio: string) => {
    const inicio = new Date(fechaInicio + 'T00:00:00')
    const resumen: Array<{
      fecha: string
      dia: string
      citas: number
      confirmadas: number
      pendientes: number
    }> = []

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(inicio)
      fecha.setDate(inicio.getDate() + i)
      const fechaStr = fecha.toISOString().split('T')[0] || ''
      if (!fechaStr) continue
      
      const carga = calcularCargaDiaria(fechaStr)

      resumen.push({
        fecha: fechaStr,
        dia: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
        citas: carga.total,
        confirmadas: carga.confirmadas,
        pendientes: carga.pendientes
      })
    }

    return resumen
  }

  /**
   * Obtener resumen mensual
   */
  const obtenerResumenMensual = (year: number, month: number) => {
    const primerDia = new Date(year, month, 1)
    const ultimoDia = new Date(year, month + 1, 0)
    const resumen: Map<string, any> = new Map()

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(year, month, dia)
      const fechaStr = fecha.toISOString().split('T')[0] || ''
      if (!fechaStr) continue
      
      const carga = calcularCargaDiaria(fechaStr)

      resumen.set(fechaStr, {
        dia,
        citas: carga.total,
        confirmadas: carga.confirmadas,
        pendientes: carga.pendientes
      })
    }

    return resumen
  }

  // =============================================================================
  // Return: API pública del composable
  // =============================================================================

  return {
    // Estado
    citas,
    loading,
    error,
    filtros,

    // Computadas
    citasDelDia,
    citasPendientes,
    citasCompletadas,
    citasConBonoProximoAgotar,
    citasFiltradas,

    // Métodos principales
    getCitasDelTerapeuta,
    completarCita,
    obtenerHistorialBono,
    verificarBonoCitas,

    // Detección y reparación de inconsistencias
    citasPendientesSync,
    detectarInconsistencias,
    resincronizarBono,
    resincronizarTodos,

    // Nuevas funcionalidades
    aplicarFiltros,
    limpiarFiltros,
    reprogramarCita,
    actualizarNotasRapidas,
    obtenerDisponibilidad,
    calcularHuecosLibres,
    programarRecordatorios,
    calcularCargaDiaria,
    obtenerResumenSemanal,
    obtenerResumenMensual,

    // Realtime
    suscribirCitasRealtime,
    desuscribirCitasRealtime
  }
}
