/**
 * useMensajes.ts
 * Composable para gestionar mensajes privados entre paciente y terapeuta
 * Sistema de mensajería asíncrona con notificaciones
 */

import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Mensaje {
  id: string
  remitente_id: string
  destinatario_id: string
  sesion_id?: string
  mensaje: string
  visto: boolean
  created_at: string
  remitente?: {
    id: string
    nombre: string
    avatar_url?: string
    rol?: string
  }
  destinatario?: {
    id: string
    nombre: string
    avatar_url?: string
    rol?: string
  }
}

export interface Conversacion {
  otro_usuario_id: string
  otro_usuario_nombre: string
  otro_usuario_avatar?: string
  ultimo_mensaje: string
  ultimo_mensaje_fecha: string
  mensajes_no_vistos: number
}

export const useMensajes = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const mensajes = ref<Mensaje[]>([])
  const conversaciones = ref<Conversacion[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const canal = ref<RealtimeChannel | null>(null)

  /**
   * Listar conversación entre el usuario actual y otro participante
   */
  const listarConversacion = async (participanteId: string) => {
    if (!user.value) {
      error.value = 'Usuario no autenticado'
      return []
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('mensajes')
        .select(`
          *,
          remitente:profiles!mensajes_remitente_id_fkey(id, nombre, avatar_url, rol),
          destinatario:profiles!mensajes_destinatario_id_fkey(id, nombre, avatar_url, rol)
        `)
        .or(`and(remitente_id.eq.${user.value.id},destinatario_id.eq.${participanteId}),and(remitente_id.eq.${participanteId},destinatario_id.eq.${user.value.id})`)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      mensajes.value = data || []
      return data || []
    } catch (e: any) {
      error.value = e.message || 'Error al cargar conversación'
      console.error('Error en listarConversacion:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Enviar un nuevo mensaje
   */
  const enviar = async (
    destinatarioId: string,
    contenido: string,
    sesionId?: string
  ) => {
    if (!user.value) {
      error.value = 'Usuario no autenticado'
      return null
    }

    if (!contenido.trim()) {
      error.value = 'El mensaje no puede estar vacío'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('mensajes')
        .insert({
          remitente_id: user.value.id,
          destinatario_id: destinatarioId,
          mensaje: contenido.trim(),
          sesion_id: sesionId || null,
          visto: false
        })
        .select(`
          *,
          remitente:profiles!mensajes_remitente_id_fkey(id, nombre, avatar_url, rol),
          destinatario:profiles!mensajes_destinatario_id_fkey(id, nombre, avatar_url, rol)
        `)
        .single()

      if (insertError) throw insertError

      // Agregar a la lista local
      if (data) {
        mensajes.value.push(data)
      }

      return data
    } catch (e: any) {
      error.value = e.message || 'Error al enviar mensaje'
      console.error('Error en enviar:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Marcar mensajes como vistos
   * Marca todos los mensajes recibidos de un participante específico
   */
  const marcarVistos = async (participanteId: string) => {
    if (!user.value) return

    try {
      const { error: updateError } = await supabase
        .from('mensajes')
        .update({ visto: true })
        .eq('destinatario_id', user.value.id)
        .eq('remitente_id', participanteId)
        .eq('visto', false)

      if (updateError) throw updateError

      // Actualizar localmente
      mensajes.value = mensajes.value.map(m => {
        if (m.remitente_id === participanteId && m.destinatario_id === user.value!.id) {
          return { ...m, visto: true }
        }
        return m
      })
    } catch (e: any) {
      console.error('Error al marcar mensajes como vistos:', e)
    }
  }

  /**
   * Obtener lista de conversaciones (para terapeuta principalmente)
   */
  const listarConversaciones = async () => {
    if (!user.value) {
      error.value = 'Usuario no autenticado'
      return []
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('obtener_ultimas_conversaciones', {
          usuario_id: user.value.id
        })

      if (fetchError) throw fetchError

      conversaciones.value = data || []
      return data || []
    } catch (e: any) {
      // Si la función RPC no existe, usar método alternativo
      console.warn('Usando método alternativo para conversaciones:', e)
      return await listarConversacionesAlternativo()
    } finally {
      loading.value = false
    }
  }

  /**
   * Método alternativo si la función RPC no está disponible
   */
  const listarConversacionesAlternativo = async () => {
    if (!user.value) return []

    try {
      const { data, error: fetchError } = await supabase
        .from('mensajes')
        .select(`
          *,
          remitente:profiles!mensajes_remitente_id_fkey(id, nombre, avatar_url),
          destinatario:profiles!mensajes_destinatario_id_fkey(id, nombre, avatar_url)
        `)
        .or(`remitente_id.eq.${user.value.id},destinatario_id.eq.${user.value.id}`)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Agrupar por conversaciones
      const conversacionesMap = new Map<string, Conversacion>()

      data?.forEach((m: any) => {
        const esRemitente = m.remitente_id === user.value!.id
        const otroUsuarioId = esRemitente ? m.destinatario_id : m.remitente_id
        const otroUsuario = esRemitente ? m.destinatario : m.remitente

        if (!conversacionesMap.has(otroUsuarioId)) {
          conversacionesMap.set(otroUsuarioId, {
            otro_usuario_id: otroUsuarioId,
            otro_usuario_nombre: otroUsuario?.nombre || 'Usuario',
            otro_usuario_avatar: otroUsuario?.avatar_url,
            ultimo_mensaje: m.mensaje,
            ultimo_mensaje_fecha: m.created_at,
            mensajes_no_vistos: 0
          })
        }

        // Contar no vistos
        if (!esRemitente && !m.visto) {
          const conv = conversacionesMap.get(otroUsuarioId)!
          conv.mensajes_no_vistos++
        }
      })

      conversaciones.value = Array.from(conversacionesMap.values())
      return conversaciones.value
    } catch (e: any) {
      error.value = e.message || 'Error al cargar conversaciones'
      console.error('Error en listarConversacionesAlternativo:', e)
      return []
    }
  }

  /**
   * Contar mensajes no vistos totales
   */
  const contarNoVistos = async () => {
    if (!user.value) return 0

    try {
      const { count, error: countError } = await supabase
        .from('mensajes')
        .select('*', { count: 'exact', head: true })
        .eq('destinatario_id', user.value.id)
        .eq('visto', false)

      if (countError) throw countError

      return count || 0
    } catch (e: any) {
      console.error('Error al contar mensajes no vistos:', e)
      return 0
    }
  }

  /**
   * Suscribirse a nuevos mensajes en tiempo real (opcional)
   */
  const suscribirseAConversacion = (participanteId: string) => {
    if (!user.value || canal.value) return

    canal.value = supabase
      .channel(`mensajes:${user.value.id}:${participanteId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `destinatario_id=eq.${user.value.id}`
        },
        async (payload) => {
          // Cargar el mensaje completo con perfiles
          const { data } = await supabase
            .from('mensajes')
            .select(`
              *,
              remitente:profiles!mensajes_remitente_id_fkey(id, nombre, avatar_url, rol),
              destinatario:profiles!mensajes_destinatario_id_fkey(id, nombre, avatar_url, rol)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            mensajes.value.push(data)
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
      await supabase.removeChannel(canal.value)
      canal.value = null
    }
  }

  // Limpiar al desmontar
  onUnmounted(() => {
    desuscribirse()
  })

  return {
    mensajes,
    conversaciones,
    loading,
    error,
    listarConversacion,
    enviar,
    marcarVistos,
    listarConversaciones,
    contarNoVistos,
    suscribirseAConversacion,
    desuscribirse
  }
}
