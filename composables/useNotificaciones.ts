/**
 * useNotificaciones.ts
 * Composable para gestionar notificaciones del sistema
 * Incluye notificaciones automáticas para bonos (última sesión, bono agotado)
 */

import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Notificacion {
  id: string
  usuario_id: string
  tipo: 'bono' | 'cita' | 'pago' | 'sistema' | 'alerta'
  titulo: string
  mensaje: string
  leido: boolean
  leido_at: string | null
  metadata: {
    paciente_id?: string
    bono_id?: string
    cita_id?: string
    sesiones_restantes?: number
    sesiones_totales?: number
    urgencia?: 'baja' | 'media' | 'alta'
    [key: string]: any
  }
  created_at: string
  updated_at: string
}

export const useNotificaciones = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const { getUserId } = useSupabase()

  const notificaciones = ref<Notificacion[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const canal = ref<RealtimeChannel | null>(null)
  const totalNoVistas = ref(0)

  // Computadas
  const noLeidas = computed(() => notificaciones.value.filter(n => !n.leido))
  const urgentes = computed(() => 
    noLeidas.value.filter(n => 
      n.tipo === 'bono' && 
      (n.metadata?.urgencia === 'alta' || n.metadata?.sesiones_restantes === 0)
    )
  )
  const tieneUrgentes = computed(() => urgentes.value.length > 0)

  /**
   * Listar notificaciones del usuario actual
   */
  const listar = async (limite: number = 20) => {
    // Verificar autenticación
    const userId = getUserId()
    if (!userId) {
      console.warn('Usuario no autenticado o ID no disponible')
      error.value = 'Usuario no autenticado'
      return []
    }

    loading.value = true
    error.value = null

    try {
      // @ts-ignore - La tabla notificaciones no existe aún en el schema
      const { data, error: fetchError } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false })
        .limit(limite)

      if (fetchError) {
        // Si la tabla no existe (404), retornar silenciosamente sin error
        if (fetchError.code === 'PGRST116' || fetchError.message.includes('does not exist')) {
          console.warn('⚠️ Tabla notificaciones no existe aún. Retornando vacío.')
          notificaciones.value = []
          totalNoVistas.value = 0
          return []
        }
        throw fetchError
      }

      notificaciones.value = (data || []) as Notificacion[]
      
      // Actualizar contador de no leídas (compatibilidad con ambos campos)
      totalNoVistas.value = ((data || []) as Notificacion[]).filter(n => !(n as any).visto && !n.leido).length

      return (data || []) as Notificacion[]
    } catch (e: any) {
      // Solo registrar error si no es un 404 de tabla no existente
      if (!e.message?.includes('does not exist')) {
        error.value = e.message || 'Error al cargar notificaciones'
        console.error('Error en listar notificaciones:', e)
      }
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear una notificación manualmente
   */
  const crear = async (
    usuarioId: string,
    titulo: string,
    mensaje: string,
    tipo: string = 'mensaje',
    referenciaId?: string
  ) => {
    if (!user.value) {
      error.value = 'Usuario no autenticado'
      return null
    }

    loading.value = true
    error.value = null

    try {
      // @ts-ignore - La tabla notificaciones no existe aún en el schema
      const { data, error: insertError } = await supabase
        .from('notificaciones')
        .insert({
          usuario_id: usuarioId,
          titulo,
          mensaje,
          tipo,
          referencia_id: referenciaId || null,
          visto: false
        })
        .select()
        .single()

      if (insertError) throw insertError

      return data
    } catch (e: any) {
      error.value = e.message || 'Error al crear notificación'
      console.error('Error en crear notificación:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Marcar una notificación como leída (usando RPC)
   */
  const marcarVista = async (notificacionId: string) => {
    if (!user.value) return

    try {
      const { data, error: rpcError } = await supabase.rpc('marcar_notificacion_leida', {
        p_notificacion_id: notificacionId
      })

      if (rpcError) throw rpcError

      // Actualizar localmente
      notificaciones.value = notificaciones.value.map(n =>
        n.id === notificacionId ? { ...n, leido: true, leido_at: new Date().toISOString() } : n
      )

      // Actualizar contador
      totalNoVistas.value = Math.max(0, totalNoVistas.value - 1)
    } catch (e: any) {
      console.error('Error al marcar notificación como leída:', e)
    }
  }

  /**
   * Alias para compatibilidad
   */
  const marcarComoLeida = marcarVista

  /**
   * Marcar todas las notificaciones como leídas (usando RPC)
   */
  const marcarTodasVistas = async () => {
    if (!user.value) return

    try {
      const { data, error: rpcError } = await supabase.rpc('marcar_todas_notificaciones_leidas')

      if (rpcError) throw rpcError

      // Actualizar localmente
      notificaciones.value = notificaciones.value.map(n => ({ 
        ...n, 
        leido: true, 
        leido_at: n.leido_at || new Date().toISOString() 
      }))
      totalNoVistas.value = 0

      return { success: true, marcadas: data?.marcadas || 0 }
    } catch (e: any) {
      console.error('Error al marcar todas las notificaciones como leídas:', e)
      return { success: false, error: e.message }
    }
  }

  /**
   * Alias para compatibilidad
   */
  const marcarTodasComoLeidas = marcarTodasVistas

  /**
   * Contar notificaciones no leídas (usando RPC)
   */
  const contarNoVistas = async () => {
    if (!user.value) return 0

    try {
      const { data, error: rpcError } = await supabase.rpc('contar_notificaciones_no_leidas')

      if (rpcError) throw rpcError

      totalNoVistas.value = data || 0
      return data || 0
    } catch (e: any) {
      console.error('Error al contar notificaciones no leídas:', e)
      return 0
    }
  }

  /**
   * Alias para compatibilidad
   */
  const obtenerContador = contarNoVistas

  /**
   * Eliminar una notificación
   */
  const eliminar = async (notificacionId: string) => {
    if (!user.value) return

    try {
      // @ts-ignore - La tabla notificaciones no existe aún en el schema
      const { error: deleteError } = await supabase
        .from('notificaciones')
        .delete()
        .eq('id', notificacionId)
        .eq('usuario_id', user.value.id)

      if (deleteError) throw deleteError

      // Actualizar localmente
      const notificacionEliminada = notificaciones.value.find(n => n.id === notificacionId)
      if (notificacionEliminada && !notificacionEliminada.leido && !(notificacionEliminada as any).visto) {
        totalNoVistas.value = Math.max(0, totalNoVistas.value - 1)
      }

      notificaciones.value = notificaciones.value.filter(n => n.id !== notificacionId)
    } catch (e: any) {
      console.error('Error al eliminar notificación:', e)
    }
  }

  /**
   * Eliminar todas las notificaciones vistas
   */
  const eliminarVistas = async () => {
    if (!user.value) return

    try {
      // @ts-ignore - La tabla notificaciones no existe aún en el schema
      const { error: deleteError } = await supabase
        .from('notificaciones')
        .delete()
        .eq('usuario_id', user.value.id)
        .eq('leido', true)

      if (deleteError) throw deleteError

      // Actualizar localmente
      notificaciones.value = notificaciones.value.filter(n => !n.leido)
    } catch (e: any) {
      console.error('Error al eliminar notificaciones vistas:', e)
    }
  }

  /**
   * Suscribirse a nuevas notificaciones en tiempo real
   */
  const suscribirse = () => {
    if (!user.value || canal.value) return

    canal.value = supabase
      .channel(`notificaciones:${user.value.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `usuario_id=eq.${user.value.id}`
        },
        (payload) => {
          const nuevaNotificacion = payload.new as Notificacion
          notificaciones.value.unshift(nuevaNotificacion)
          totalNoVistas.value++
          
          // Notificación del navegador si tiene permisos
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(nuevaNotificacion.titulo, { 
              body: nuevaNotificacion.mensaje,
              icon: '/icon-notification.png',
              badge: nuevaNotificacion.tipo === 'bono' && nuevaNotificacion.metadata?.urgencia === 'alta' 
                ? '🔴' : '🔔'
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notificaciones',
          filter: `usuario_id=eq.${user.value.id}`
        },
        (payload) => {
          const notificacionActualizada = payload.new as Notificacion
          const index = notificaciones.value.findIndex(n => n.id === notificacionActualizada.id)
          if (index !== -1) {
            notificaciones.value[index] = notificacionActualizada
          }
        }
      )
      .subscribe()
  }

  /**
   * Desuscribirse del canal en tiempo real
   */
  const desuscribirse = async () => {
    if (canal.value) {
      // @ts-ignore - Types incompatibility
      await supabase.removeChannel(canal.value)
      canal.value = null
    }
  }

  // Limpiar al desmontar
  onUnmounted(() => {
    desuscribirse()
  })

  /**
   * Solicitar permisos de notificaciones del navegador
   */
  const solicitarPermisosNotificaciones = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  return {
    // Estado
    notificaciones,
    totalNoVistas,
    loading,
    error,

    // Computadas
    noLeidas,
    urgentes,
    tieneUrgentes,

    // Métodos principales
    listar,
    crear,
    marcarVista,
    marcarComoLeida,  // Alias
    marcarTodasVistas,
    marcarTodasComoLeidas,  // Alias
    contarNoVistas,
    obtenerContador,  // Alias
    eliminar,
    eliminarVistas,
    suscribirse,
    desuscribirse,
    solicitarPermisosNotificaciones
  }
}
