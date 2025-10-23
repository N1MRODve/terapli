// ~/composables/useCitas.ts

interface Cita {
  id: string
  paciente_id: string
  paciente_nombre: string
  terapeuta_id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  tipo: 'presencial' | 'online' | 'telefonica'
  estado: 'confirmada' | 'pendiente' | 'cancelada' | 'completada'
  notas?: string
  bono_id?: string  // ID del bono asociado (si usa bono)
  descontar_de_bono?: boolean  // Si debe descontar de bono al completar
  created_at: string
}

interface Bloqueo {
  id: string
  terapeuta_id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  motivo?: string
  tipo: 'personal' | 'vacaciones' | 'otro'
  created_at: string
}

interface HorarioDisponible {
  fecha: string
  hora: string
  disponible: boolean
}

interface Bono {
  id: string
  paciente_id: string
  total_sesiones: number
  sesiones_restantes: number
  precio_total: number
  estado: 'activo' | 'agotado' | 'expirado'
  created_at: string
  fecha_expiracion?: string
}

// Modo demo para desarrollo
const MODO_DEMO = true

export const useCitas = () => {
  const supabase = useSupabaseClient()

  /**
   * Obtiene todas las citas del terapeuta
   */
  const getCitas = async (terapeutaId?: string) => {
    if (MODO_DEMO) {
      return getCitasDemo()
    }

    if (!process.client) return []

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // TODO: Implementar cuando la tabla 'citas' exista en Supabase
    console.warn('La tabla citas aún no existe en Supabase. Usando datos demo.')
    return getCitasDemo()

    /* Código para cuando exista la tabla:
    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        pacientes (
          nombre,
          apellido
        )
      `)
      .eq('terapeuta_id', terapeutaId || user.id)
      .order('fecha', { ascending: true })

    if (error) {
      console.error('Error fetching citas:', error)
      return []
    }

    return data || []
    */
  }

  /**
   * Obtiene las citas de un día específico
   */
  const getCitasPorDia = async (fecha: string, terapeutaId?: string) => {
    if (MODO_DEMO) {
      const todasCitas = getCitasDemo()
      return todasCitas.filter(c => c.fecha === fecha)
    }

    if (!process.client) return []

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // TODO: Implementar cuando la tabla 'citas' exista en Supabase
    console.warn('La tabla citas aún no existe en Supabase. Usando datos demo.')
    const todasCitas = getCitasDemo()
    return todasCitas.filter(c => c.fecha === fecha)

    /* Código para cuando exista la tabla:
    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        pacientes (
          nombre,
          apellido
        )
      `)
      .eq('terapeuta_id', terapeutaId || user.id)
      .eq('fecha', fecha)
      .order('hora_inicio', { ascending: true })

    if (error) {
      console.error('Error fetching citas por día:', error)
      return []
    }

    return data || []
    */
  }

  /**
   * Obtiene las citas de un rango de fechas
   */
  const getCitasRango = async (fechaInicio: string, fechaFin: string, terapeutaId?: string) => {
    if (MODO_DEMO) {
      const todasCitas = getCitasDemo()
      return todasCitas.filter(c => c.fecha >= fechaInicio && c.fecha <= fechaFin)
    }

    if (!process.client) return []

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // TODO: Implementar cuando la tabla 'citas' exista en Supabase
    console.warn('La tabla citas aún no existe en Supabase. Usando datos demo.')
    const todasCitas = getCitasDemo()
    return todasCitas.filter(c => c.fecha >= fechaInicio && c.fecha <= fechaFin)

    /* Código para cuando exista la tabla:
    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        pacientes (
          nombre,
          apellido
        )
      `)
      .eq('terapeuta_id', terapeutaId || user.id)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true })

    if (error) {
      console.error('Error fetching citas rango:', error)
      return []
    }

    return data || []
    */
  }

  /**
   * Busca disponibilidad en los próximos N días
   */
  const buscarDisponibilidad = async (dias: number = 14, duracion: number = 60) => {
    const disponibilidades: HorarioDisponible[] = []
    const hoy = new Date()
    
    // Horarios de trabajo (9:00 - 18:00)
    const horasDisponibles = [
      '09:00', '10:00', '11:00', '12:00', 
      '14:00', '15:00', '16:00', '17:00'
    ]

    // Obtener citas existentes
    const fechaInicio = formatearFecha(hoy)
    const fechaFin = new Date(hoy)
    fechaFin.setDate(fechaFin.getDate() + dias)
    const citas = await getCitasRango(fechaInicio, formatearFecha(fechaFin))

    // Revisar cada día
    for (let i = 0; i < dias; i++) {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() + i)
      const fechaStr = formatearFecha(fecha)
      
      // Saltar fines de semana
      const diaSemana = fecha.getDay()
      if (diaSemana === 0 || diaSemana === 6) continue

      // Revisar cada hora
      for (const hora of horasDisponibles) {
        const citaExiste = (citas as any[]).some((c: any) => 
          c.fecha === fechaStr && 
          c.hora_inicio === hora &&
          c.estado !== 'cancelada'
        )

        if (!citaExiste) {
          disponibilidades.push({
            fecha: fechaStr,
            hora,
            disponible: true
          })
        }
      }
    }

    return disponibilidades.slice(0, 20) // Retornar primeras 20 disponibilidades
  }

  /**
   * Crear una nueva cita
   */
  const crearCita = async (cita: Partial<Cita>) => {
    if (MODO_DEMO) {
      console.log('Demo mode: Cita creada', cita)
      // Simular creación exitosa
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true, id: 'demo-' + Date.now() }
    }

    if (!process.client) return { success: false, error: 'Not client' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No user' }

    // TODO: Implementar cuando la tabla 'citas' exista en Supabase
    console.warn('La tabla citas aún no existe en Supabase.')
    
    // Simular éxito en modo demo hasta que exista la tabla
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true, id: 'demo-' + Date.now() }

    /* Código para cuando exista la tabla:
    const { data, error } = await supabase
      .from('citas')
      .insert({
        ...cita,
        terapeuta_id: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating cita:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
    */
  }

  /**
   * Actualizar estado de una cita
   */
  const actualizarEstadoCita = async (citaId: string, nuevoEstado: Cita['estado']) => {
    if (MODO_DEMO) {
      console.log('Demo mode: Estado actualizado', citaId, nuevoEstado)
      
      // Si se marca como completada, intentar descontar del bono
      if (nuevoEstado === 'completada') {
        const resultado = await procesarCompletacionCita(citaId)
        return resultado
      }
      
      return { success: true }
    }

    if (!process.client) return { success: false }

    // TODO: Implementar cuando la tabla 'citas' exista en Supabase
    console.warn('La tabla citas aún no existe en Supabase.')
    
    // Simular procesamiento de completación
    if (nuevoEstado === 'completada') {
      const resultado = await procesarCompletacionCita(citaId)
      return resultado
    }
    
    return { success: true }

    /* Código para cuando exista la tabla:
    const { error } = await supabase
      .from('citas')
      .update({ estado: nuevoEstado })
      .eq('id', citaId)

    if (error) {
      console.error('Error updating cita:', error)
      return { success: false, error: error.message }
    }
    
    // Procesar completación si es necesario
    if (nuevoEstado === 'completada') {
      const resultado = await procesarCompletacionCita(citaId)
      return resultado
    }

    return { success: true }
    */
  }

  /**
   * Procesa la completación de una cita (descontar de bono si corresponde)
   */
  const procesarCompletacionCita = async (citaId: string) => {
    // Buscar la cita en los datos demo
    const todasCitas = getCitasDemo()
    const cita = todasCitas.find(c => c.id === citaId)
    
    if (!cita || !cita.descontar_de_bono || !cita.paciente_id) {
      return { success: false, message: 'Cita no requiere descuento de bono' }
    }
    
    // Obtener bono activo del paciente
    const bono = await obtenerBonoActivo(cita.paciente_id)
    
    if (!bono) {
      return { success: false, message: 'Paciente sin bono activo' }
    }
    
    if (bono.sesiones_restantes <= 0) {
      return { success: false, message: 'Bono agotado' }
    }
    
    // Descontar sesión
    const resultado = await descontarSesionDeBono(bono.id)
    
    if (resultado.success) {
      // Verificar si quedan pocas sesiones para generar alerta
      if (resultado.sesiones_restantes !== undefined && resultado.sesiones_restantes <= 1) {
        return {
          success: true,
          alerta: true,
          mensaje: resultado.sesiones_restantes === 1 
            ? '⚠️ Al paciente le queda 1 sesión. Considere informarle para renovar su bono.'
            : '🎉 Última sesión del bono completada. Informar al paciente para renovar.',
          sesiones_restantes: resultado.sesiones_restantes
        }
      }
      
      return {
        success: true,
        sesiones_restantes: resultado.sesiones_restantes
      }
    }
    
    return resultado
  }

  /**
   * Obtiene el bono activo de un paciente
   */
  const obtenerBonoActivo = async (pacienteId: string) => {
    if (MODO_DEMO) {
      // Simular datos de bono
      const bonosDemo = {
        'pac-1': { id: 'bono-1', paciente_id: 'pac-1', total_sesiones: 10, sesiones_restantes: 2, precio_total: 450, estado: 'activo' as const, created_at: new Date().toISOString() },
        'pac-2': { id: 'bono-2', paciente_id: 'pac-2', total_sesiones: 8, sesiones_restantes: 1, precio_total: 360, estado: 'activo' as const, created_at: new Date().toISOString() },
        'pac-3': { id: 'bono-3', paciente_id: 'pac-3', total_sesiones: 10, sesiones_restantes: 5, precio_total: 450, estado: 'activo' as const, created_at: new Date().toISOString() },
      }
      
      return bonosDemo[pacienteId as keyof typeof bonosDemo] || null
    }
    
    // TODO: Implementar query a Supabase
    return null
  }

  /**
   * Descuenta una sesión del bono
   */
  const descontarSesionDeBono = async (bonoId: string) => {
    if (MODO_DEMO) {
      console.log('Demo: Descontando sesión del bono', bonoId)
      
      // Simular descuento (en realidad no persiste en demo)
      // Retornar sesiones restantes aleatorias para demo
      const sesionesRestantes = Math.floor(Math.random() * 3) // 0, 1 o 2 para testing
      
      return {
        success: true,
        sesiones_restantes: sesionesRestantes
      }
    }
    
    if (!process.client) return { success: false }
    
    /* TODO: Implementar cuando exista tabla bonos
    const supabase = useSupabaseClient()
    
    // Obtener bono actual
    const { data: bono, error: fetchError } = await supabase
      .from('bonos')
      .select('sesiones_restantes')
      .eq('id', bonoId)
      .single()
    
    if (fetchError || !bono) {
      return { success: false, error: 'Bono no encontrado' }
    }
    
    const nuevasSesiones = Math.max(0, bono.sesiones_restantes - 1)
    const nuevoEstado = nuevasSesiones === 0 ? 'agotado' : 'activo'
    
    // Actualizar bono
    const { error: updateError } = await supabase
      .from('bonos')
      .update({ 
        sesiones_restantes: nuevasSesiones,
        estado: nuevoEstado
      })
      .eq('id', bonoId)
    
    if (updateError) {
      return { success: false, error: updateError.message }
    }
    
    return {
      success: true,
      sesiones_restantes: nuevasSesiones
    }
    */
    
    return { success: false, error: 'Función no implementada' }
  }

  /**
   * Verifica si un paciente tiene bono activo
   */
  const verificarBonoActivo = async (pacienteId: string) => {
    const bono = await obtenerBonoActivo(pacienteId)
    
    return {
      tiene_bono: !!bono,
      sesiones_restantes: bono?.sesiones_restantes || 0,
      bono_id: bono?.id
    }
  }

  /**
   * ============================================
   * GESTIÓN DE BLOQUEOS DE AGENDA
   * ============================================
   */

  /**
   * Obtener todos los bloqueos del terapeuta
   */
  const getBloqueos = async (terapeutaId?: string) => {
    if (MODO_DEMO) {
      return getBloqueosDemo()
    }

    if (!process.client) return []

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // TODO: Implementar cuando la tabla 'bloqueos_agenda' exista en Supabase
    console.warn('La tabla bloqueos_agenda aún no existe en Supabase.')
    return []
    
    /* Código para cuando exista la tabla:
    const { data, error } = await supabase
      .from('bloqueos_agenda')
      .select('*')
      .eq('terapeuta_id', terapeutaId || user.id)
      .order('fecha', { ascending: true })

    if (error) {
      console.error('Error fetching bloqueos:', error)
      return []
    }

    return data as Bloqueo[]
    */
  }

  /**
   * Obtener bloqueos en un rango de fechas
   */
  const getBloqueosRango = async (fechaInicio: string, fechaFin: string) => {
    if (MODO_DEMO) {
      const bloqueos = getBloqueosDemo()
      return bloqueos.filter((b: Bloqueo) => b.fecha >= fechaInicio && b.fecha <= fechaFin)
    }

    if (!process.client) return []

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // TODO: Implementar cuando la tabla exista
    console.warn('La tabla bloqueos_agenda aún no existe en Supabase.')
    return []

    /* Código para cuando exista la tabla:
    const { data, error } = await supabase
      .from('bloqueos_agenda')
      .select('*')
      .eq('terapeuta_id', user.id)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)
      .order('fecha', { ascending: true })

    if (error) {
      console.error('Error fetching bloqueos:', error)
      return []
    }

    return data as Bloqueo[]
    */
  }

    /**
   * Obtener bloqueos de un día específico
   */
  const getBloqueosPorDia = async (fecha: string) => {
    if (MODO_DEMO) {
      const bloqueos = getBloqueosDemo()
      return bloqueos.filter((b: Bloqueo) => b.fecha === fecha)
    }

    if (!process.client) return []

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // TODO: Implementar cuando la tabla exista
    console.warn('La tabla bloqueos_agenda aún no existe en Supabase.')
    return []

    /* Código para cuando exista la tabla:
    const { data, error } = await supabase
      .from('bloqueos_agenda')
      .select('*')
      .eq('terapeuta_id', user.id)
      .eq('fecha', fecha)
      .order('hora_inicio', { ascending: true })

    if (error) {
      console.error('Error fetching bloqueos:', error)
      return []
    }

    return data as Bloqueo[]
    */
  }

  /**
   * Crear un nuevo bloqueo
   */
  const crearBloqueo = async (bloqueo: Partial<Bloqueo>) => {
    if (MODO_DEMO) {
      console.log('Demo mode: Bloqueo creado', bloqueo)
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true, id: 'bloqueo-demo-' + Date.now() }
    }

    if (!process.client) return { success: false, error: 'Not client' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No user' }

    // Verificar conflictos con citas existentes
    const citasDelDia = await getCitasPorDia(bloqueo.fecha!)
    const hayConflicto = citasDelDia.some(cita => {
      if (cita.estado === 'cancelada') return false
      return horariosSeSuperponen(
        cita.hora_inicio, cita.hora_fin,
        bloqueo.hora_inicio!, bloqueo.hora_fin!
      )
    })

    if (hayConflicto) {
      return { 
        success: false, 
        error: 'Ya existe una cita en ese horario. Cancélala primero para crear el bloqueo.' 
      }
    }

    // TODO: Implementar cuando la tabla exista
    console.warn('La tabla bloqueos_agenda aún no existe en Supabase.')
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true, id: 'bloqueo-demo-' + Date.now() }

    /* Código para cuando exista la tabla:
    const { data, error } = await supabase
      .from('bloqueos_agenda')
      .insert({
        ...bloqueo,
        terapeuta_id: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating bloqueo:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data.id, data }
    */
  }

  /**
   * Eliminar un bloqueo
   */
  const eliminarBloqueo = async (bloqueoId: string) => {
    if (MODO_DEMO) {
      console.log('Demo mode: Bloqueo eliminado', bloqueoId)
      await new Promise(resolve => setTimeout(resolve, 300))
      return { success: true }
    }

    if (!process.client) return { success: false }

    // TODO: Implementar cuando la tabla exista
    console.warn('La tabla bloqueos_agenda aún no existe en Supabase.')
    return { success: true }

    /* Código para cuando exista la tabla:
    const { error } = await supabase
      .from('bloqueos_agenda')
      .delete()
      .eq('id', bloqueoId)

    if (error) {
      console.error('Error deleting bloqueo:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
    */
  }

  /**
   * Verificar si un horario está bloqueado
   */
  const verificarHorarioBloqueado = async (fecha: string, horaInicio: string, horaFin: string) => {
    const bloqueos = await getBloqueosPorDia(fecha)
    
    return bloqueos.some((bloqueo: Bloqueo) => 
      horariosSeSuperponen(horaInicio, horaFin, bloqueo.hora_inicio, bloqueo.hora_fin)
    )
  }

  // Función auxiliar para verificar superposición de horarios
  function horariosSeSuperponen(inicio1: string, fin1: string, inicio2: string, fin2: string): boolean {
    return inicio1 < fin2 && inicio2 < fin1
  }

  return {
    getCitas,
    getCitasPorDia,
    getCitasRango,
    buscarDisponibilidad,
    crearCita,
    actualizarEstadoCita,
    obtenerBonoActivo,
    verificarBonoActivo,
    descontarSesionDeBono,
    // Bloqueos
    getBloqueos,
    getBloqueosRango,
    getBloqueosPorDia,
    crearBloqueo,
    eliminarBloqueo,
    verificarHorarioBloqueado
  }
}

// Utilidades
function formatearFecha(fecha: Date): string {
  const resultado = fecha.toISOString().split('T')[0]
  return resultado || ''
}

// Datos demo
function getCitasDemo(): Cita[] {
  const hoy = new Date()
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)
  const pasadoManana = new Date(hoy)
  pasadoManana.setDate(pasadoManana.getDate() + 2)

  return [
    {
      id: 'cita-1',
      paciente_id: 'pac-1',
      paciente_nombre: 'María González',
      terapeuta_id: 'terapeuta-1',
      fecha: formatearFecha(hoy),
      hora_inicio: '09:00',
      hora_fin: '10:00',
      tipo: 'presencial',
      estado: 'confirmada',
      notas: 'Primera sesión del mes',
      created_at: new Date().toISOString()
    },
    {
      id: 'cita-2',
      paciente_id: 'pac-2',
      paciente_nombre: 'Carlos Ruiz',
      terapeuta_id: 'terapeuta-1',
      fecha: formatearFecha(hoy),
      hora_inicio: '11:00',
      hora_fin: '12:00',
      tipo: 'online',
      estado: 'confirmada',
      notas: 'Sesión de seguimiento',
      created_at: new Date().toISOString()
    },
    {
      id: 'cita-3',
      paciente_id: 'pac-3',
      paciente_nombre: 'Ana López',
      terapeuta_id: 'terapeuta-1',
      fecha: formatearFecha(hoy),
      hora_inicio: '15:00',
      hora_fin: '16:00',
      tipo: 'presencial',
      estado: 'confirmada',
      created_at: new Date().toISOString()
    },
    {
      id: 'cita-4',
      paciente_id: 'pac-4',
      paciente_nombre: 'Roberto Sánchez',
      terapeuta_id: 'terapeuta-1',
      fecha: formatearFecha(hoy),
      hora_inicio: '17:00',
      hora_fin: '18:00',
      tipo: 'online',
      estado: 'confirmada',
      created_at: new Date().toISOString()
    },
    {
      id: 'cita-5',
      paciente_id: 'pac-5',
      paciente_nombre: 'Laura Martínez',
      terapeuta_id: 'terapeuta-1',
      fecha: formatearFecha(manana),
      hora_inicio: '10:00',
      hora_fin: '11:00',
      tipo: 'presencial',
      estado: 'confirmada',
      created_at: new Date().toISOString()
    },
    {
      id: 'cita-6',
      paciente_id: 'pac-6',
      paciente_nombre: 'Pedro Gómez',
      terapeuta_id: 'terapeuta-1',
      fecha: formatearFecha(manana),
      hora_inicio: '14:00',
      hora_fin: '15:00',
      tipo: 'online',
      estado: 'pendiente',
      created_at: new Date().toISOString()
    },
    {
      id: 'cita-7',
      paciente_id: 'pac-7',
      paciente_nombre: 'Isabel Torres',
      terapeuta_id: 'terapeuta-1',
      fecha: formatearFecha(pasadoManana),
      hora_inicio: '09:00',
      hora_fin: '10:00',
      tipo: 'presencial',
      estado: 'confirmada',
      created_at: new Date().toISOString()
    }
  ]
}

// Datos demo de bloqueos
function getBloqueosDemo(): Bloqueo[] {
  const hoy = new Date()
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)
  const enTresDias = new Date(hoy)
  enTresDias.setDate(enTresDias.getDate() + 3)

  return [
    {
      id: 'bloqueo-1',
      terapeuta_id: 'terapeuta-1',
      fecha: formatearFecha(hoy),
      hora_inicio: '13:00',
      hora_fin: '14:00',
      motivo: 'Almuerzo',
      tipo: 'personal',
      created_at: new Date().toISOString()
    },
    {
      id: 'bloqueo-2',
      terapeuta_id: 'terapeuta-1',
      fecha: formatearFecha(manana),
      hora_inicio: '12:00',
      hora_fin: '13:30',
      motivo: 'Reunión de equipo',
      tipo: 'otro',
      created_at: new Date().toISOString()
    },
    {
      id: 'bloqueo-3',
      terapeuta_id: 'terapeuta-1',
      fecha: formatearFecha(enTresDias),
      hora_inicio: '09:00',
      hora_fin: '18:00',
      motivo: 'Día personal',
      tipo: 'personal',
      created_at: new Date().toISOString()
    }
  ]
}
