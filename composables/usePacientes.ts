import type { Database } from '~/types/database.types'

type Paciente = Database['public']['Tables']['pacientes']['Row']
type PacienteInsert = Database['public']['Tables']['pacientes']['Insert']
type PacienteUpdate = Database['public']['Tables']['pacientes']['Update']

export const usePacientes = () => {
  const { supabase, user } = useSupabase()

  // Obtener paciente actual
  const getPaciente = async (id?: string) => {
    const pacienteId = id || user.value?.id
    if (!pacienteId) return { data: null, error: new Error('No user ID provided') }

    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', pacienteId)
      .single()

    return { data, error }
  }

  // Crear paciente
  const createPaciente = async (paciente: PacienteInsert) => {
    const { data, error } = await supabase
      .from('pacientes')
      .insert(paciente)
      .select()
      .single()

    return { data, error }
  }

  // Actualizar paciente
  const updatePaciente = async (id: string, updates: PacienteUpdate) => {
    const { data, error } = await supabase
      .from('pacientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }

  // Obtener bonos del paciente
  const getBonos = async (pacienteId?: string) => {
    const id = pacienteId || user.value?.id
    if (!id) return { data: null, error: new Error('No user ID provided') }

    const { data, error } = await supabase
      .from('bonos')
      .select('*')
      .eq('paciente_id', id)
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Obtener bonos activos
  const getBonosActivos = async (pacienteId?: string) => {
    const id = pacienteId || user.value?.id
    if (!id) return { data: null, error: new Error('No user ID provided') }

    const { data, error } = await supabase
      .from('bonos')
      .select('*')
      .eq('paciente_id', id)
      .eq('activo', true)
      .gt('sesiones_totales', supabase.raw('sesiones_usadas'))
      .order('created_at', { ascending: false })

    return { data, error }
  }

  // Obtener sesiones del paciente
  const getSesiones = async (pacienteId?: string) => {
    const id = pacienteId || user.value?.id
    if (!id) return { data: null, error: new Error('No user ID provided') }

    const { data, error } = await supabase
      .from('sesiones')
      .select(`
        *,
        bono:bonos(*)
      `)
      .eq('paciente_id', id)
      .order('fecha', { ascending: false })

    return { data, error }
  }

  // Obtener próximas sesiones
  const getProximasSesiones = async (pacienteId?: string) => {
    const id = pacienteId || user.value?.id
    if (!id) return { data: null, error: new Error('No user ID provided') }

    const { data, error } = await supabase
      .from('sesiones')
      .select(`
        *,
        bono:bonos(*)
      `)
      .eq('paciente_id', id)
      .eq('estado', 'programada')
      .gte('fecha', new Date().toISOString())
      .order('fecha', { ascending: true })

    return { data, error }
  }

  // Obtener mensajes del paciente
  const getMensajes = async (pacienteId?: string) => {
    const id = pacienteId || user.value?.id
    if (!id) return { data: null, error: new Error('No user ID provided') }

    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('paciente_id', id)
      .order('created_at', { ascending: true })

    return { data, error }
  }

  // Enviar mensaje
  const enviarMensaje = async (contenido: string, pacienteId?: string) => {
    const id = pacienteId || user.value?.id
    if (!id) return { data: null, error: new Error('No user ID provided') }

    const { data, error } = await supabase
      .from('mensajes')
      .insert({
        paciente_id: id,
        contenido,
        de_psicologa: false
      })
      .select()
      .single()

    return { data, error }
  }

  // Marcar mensaje como leído
  const marcarMensajeLeido = async (mensajeId: string) => {
    const { data, error } = await supabase
      .from('mensajes')
      .update({ leido: true })
      .eq('id', mensajeId)
      .select()
      .single()

    return { data, error }
  }

  // Obtener recursos públicos
  const getRecursosPublicos = async () => {
    const { data, error } = await supabase
      .from('recursos')
      .select('*')
      .eq('publico', true)
      .order('created_at', { ascending: false })

    return { data, error }
  }

  return {
    getPaciente,
    createPaciente,
    updatePaciente,
    getBonos,
    getBonosActivos,
    getSesiones,
    getProximasSesiones,
    getMensajes,
    enviarMensaje,
    marcarMensajeLeido,
    getRecursosPublicos
  }
}
