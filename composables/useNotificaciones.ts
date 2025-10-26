/**
 * useNotificaciones.ts
 * Composable para gestionar notificaciones internas del sistema
 * NOTA: La tabla 'notificaciones' aún no existe en la base de datos.
 * Este composable maneja los errores 404 gracefully.
 */

import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Notificacion {
  id: string
  usuario_id: string
  titulo: string
  mensaje: string | null
  tipo: string
  visto: boolean
  referencia_id?: string
  created_at: string
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
      
      // Actualizar contador de no vistas
      totalNoVistas.value = ((data || []) as Notificacion[]).filter(n => !n.visto).length

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
   * Marcar una notificación como vista
   */
  const marcarVista = async (notificacionId: string) => {
    if (!user.value) return

    try {
      // @ts-ignore - La tabla notificaciones no existe aún en el schema
      const { error: updateError } = await supabase
        .from('notificaciones')
        .update({ visto: true })
        .eq('id', notificacionId)
        .eq('usuario_id', user.value.id)

      if (updateError) throw updateError

      // Actualizar localmente
      notificaciones.value = notificaciones.value.map(n =>
        n.id === notificacionId ? { ...n, visto: true } : n
      )

      // Actualizar contador
      totalNoVistas.value = Math.max(0, totalNoVistas.value - 1)
    } catch (e: any) {
      console.error('Error al marcar notificación como vista:', e)
    }
  }

  /**
   * Marcar todas las notificaciones como vistas
   */
  const marcarTodasVistas = async () => {
    if (!user.value) return

    try {
      // @ts-ignore - La tabla notificaciones no existe aún en el schema
      const { error: updateError } = await supabase
        .from('notificaciones')
        .update({ visto: true })
        .eq('usuario_id', user.value.id)
        .eq('visto', false)

      if (updateError) throw updateError

      // Actualizar localmente
      notificaciones.value = notificaciones.value.map(n => ({ ...n, visto: true }))
      totalNoVistas.value = 0
    } catch (e: any) {
      console.error('Error al marcar todas las notificaciones como vistas:', e)
    }
  }

  /**
   * Contar notificaciones no vistas
   */
  const contarNoVistas = async () => {
    if (!user.value) return 0

    try {
      // @ts-ignore - La tabla notificaciones no existe aún en el schema
      const { count, error: countError } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.value.id)
        .eq('visto', false)

      if (countError) throw countError

      totalNoVistas.value = count || 0
      return count || 0
    } catch (e: any) {
      console.error('Error al contar notificaciones no vistas:', e)
      return 0
    }
  }

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
      if (notificacionEliminada && !notificacionEliminada.visto) {
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
        .eq('visto', true)

      if (deleteError) throw deleteError

      // Actualizar localmente
      notificaciones.value = notificaciones.value.filter(n => !n.visto)
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

  return {
    notificaciones,
    totalNoVistas,
    loading,
    error,
    listar,
    crear,
    marcarVista,
    marcarTodasVistas,
    contarNoVistas,
    eliminar,
    eliminarVistas,
    suscribirse,
    desuscribirse
  }
}
