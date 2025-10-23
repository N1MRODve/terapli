/**
 * Composable para gestionar la mensajería interna
 * Sistema de comunicación segura terapeuta-paciente
 */

import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Mensaje {
  id: string
  autor_id: string
  receptor_id: string
  contenido: string
  leido: boolean
  archivado: boolean
  created_at: string
}

export interface Conversacion {
  interlocutor_id: string
  interlocutor_nombre: string
  interlocutor_rol: string
  ultimo_mensaje: string
  ultima_fecha: string
  mensajes_no_leidos: number
  ultimo_es_mio: boolean
}

export interface Notificacion {
  id: string
  usuario_id: string
  titulo: string
  mensaje: string
  tipo: string
  visto: boolean
  relacionado_id: string | null
  created_at: string
}

export const useMensajeria = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const mensajes = ref<Mensaje[]>([])
  const conversaciones = ref<Conversacion[]>([])
  const mensajesNoLeidos = ref<number>(0)
  const cargando = ref(false)
  const error = ref<string | null>(null)
  
  let realtimeChannel: RealtimeChannel | null = null

  /**
   * Obtiene los mensajes de una conversación específica
   */
  const obtenerMensajes = async (interlocutorId: string) => {
    if (!user.value) return []
    
    cargando.value = true
    error.value = null
    
    try {
      const { data, error: err } = await (supabase as any)
        .from('mensajes')
        .select('*')
        .or(`and(autor_id.eq.${user.value.id},receptor_id.eq.${interlocutorId}),and(autor_id.eq.${interlocutorId},receptor_id.eq.${user.value.id})`)
        .order('created_at', { ascending: true })
      
      if (err) throw err
      
      mensajes.value = data as unknown as Mensaje[]
      return data as unknown as Mensaje[]
    } catch (e: any) {
      error.value = e.message
      console.error('Error al obtener mensajes:', e)
      return []
    } finally {
      cargando.value = false
    }
  }

  /**
   * Envía un nuevo mensaje
   */
  const enviarMensaje = async (
    receptorId: string, 
    contenido: string
  ): Promise<Mensaje | null> => {
    if (!user.value) {
      error.value = 'Usuario no autenticado'
      return null
    }

    if (!contenido.trim()) {
      error.value = 'El mensaje no puede estar vacío'
      return null
    }

    try {
      // Usar any para evitar problemas con tipos desactualizados
      const { data, error: err } = await (supabase as any)
        .from('mensajes')
        .insert({
          autor_id: user.value.id,
          receptor_id: receptorId,
          contenido: contenido.trim()
        })
        .select()
        .single()
      
      if (err) throw err
      
      return data as unknown as Mensaje
    } catch (e: any) {
      error.value = e.message
      console.error('Error al enviar mensaje:', e)
      return null
    }
  }

  /**
   * Obtiene todas las conversaciones del usuario actual
   */
  const obtenerConversaciones = async (): Promise<Conversacion[]> => {
    if (!user.value) return []
    
    cargando.value = true
    error.value = null
    
    try {
      const { data, error: err } = await (supabase as any)
        .rpc('obtener_conversaciones', { 
          p_usuario_id: user.value.id 
        })
      
      if (err) throw err
      
      conversaciones.value = data as unknown as Conversacion[]
      return data as unknown as Conversacion[]
    } catch (e: any) {
      error.value = e.message
      console.error('Error al obtener conversaciones:', e)
      return []
    } finally {
      cargando.value = false
    }
  }

  /**
   * Marca mensajes como leídos
   */
  const marcarComoLeido = async (autorId: string) => {
    if (!user.value) return
    
    try {
      const { error: err } = await (supabase as any)
        .rpc('marcar_mensajes_leidos', {
          p_autor_id: autorId,
          p_receptor_id: user.value.id
        })
      
      if (err) throw err
      
      // Actualizar contador de no leídos
      await contarMensajesNoLeidos()
    } catch (e: any) {
      console.error('Error al marcar mensajes como leídos:', e)
    }
  }

  /**
   * Cuenta los mensajes no leídos del usuario actual
   */
  const contarMensajesNoLeidos = async (): Promise<number> => {
    if (!user.value) return 0
    
    try {
      const { count, error: err } = await (supabase as any)
        .from('mensajes')
        .select('*', { count: 'exact', head: true })
        .eq('receptor_id', user.value.id)
        .eq('leido', false)
      
      if (err) throw err
      
      mensajesNoLeidos.value = count || 0
      return count || 0
    } catch (e: any) {
      console.error('Error al contar mensajes no leídos:', e)
      return 0
    }
  }

  /**
   * Suscribe a actualizaciones en tiempo real
   */
  const suscribirActualizaciones = (interlocutorId?: string) => {
    if (!user.value) return

    // Cancelar suscripción anterior si existe
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
    }

    realtimeChannel = supabase
      .channel('mensajes-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: interlocutorId 
            ? `receptor_id=eq.${user.value.id},autor_id=eq.${interlocutorId}`
            : `receptor_id=eq.${user.value.id}`
        },
        (payload) => {
          const nuevoMensaje = payload.new as Mensaje
          
          // Si estamos en una conversación específica, agregar el mensaje
          if (interlocutorId && nuevoMensaje.autor_id === interlocutorId) {
            mensajes.value.push(nuevoMensaje)
          }
          
          // Actualizar contador
          contarMensajesNoLeidos()
        }
      )
      .subscribe()
  }

  /**
   * Cancela la suscripción a actualizaciones
   */
  const cancelarSuscripcion = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  /**
   * Obtener el ID del terapeuta asignado al paciente actual
   */
  const obtenerTerapeutaAsignado = async (): Promise<string | null> => {
    if (!user.value) return null
    
    try {
      const { data, error: err } = await (supabase as any)
        .from('pacientes')
        .select('terapeuta_id')
        .eq('id', user.value.id)
        .single()
      
      if (err) throw err
      
      return data?.terapeuta_id || null
    } catch (e: any) {
      console.error('Error al obtener terapeuta asignado:', e)
      return null
    }
  }

  /**
   * Buscar usuario por ID (para obtener información)
   */
  const obtenerInfoUsuario = async (usuarioId: string) => {
    try {
      const { data, error: err } = await (supabase as any)
        .from('profiles')
        .select('id, nombre_completo, rol, avatar_url')
        .eq('id', usuarioId)
        .single()
      
      if (err) throw err
      
      return data
    } catch (e: any) {
      console.error('Error al obtener información del usuario:', e)
      return null
    }
  }

  // Limpiar al desmontar
  onUnmounted(() => {
    cancelarSuscripcion()
  })

  return {
    // Estado
    mensajes,
    conversaciones,
    mensajesNoLeidos,
    cargando,
    error,
    
    // Métodos
    obtenerMensajes,
    enviarMensaje,
    obtenerConversaciones,
    marcarComoLeido,
    contarMensajesNoLeidos,
    suscribirActualizaciones,
    cancelarSuscripcion,
    obtenerTerapeutaAsignado,
    obtenerInfoUsuario
  }
}
