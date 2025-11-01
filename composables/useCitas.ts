// ~/composables/useCitas.ts
// Sistema completo de gestión de citas y bonos
// Fecha: 26 de octubre de 2025

interface Cita {
  id?: string
  paciente_id: string
  terapeuta_id: string
  bono_id?: string
  fecha_cita: string | Date
  hora_inicio: string
  hora_fin: string
  duracion_minutos?: number
  modalidad: 'presencial' | 'online' | 'telefonica'
  estado: 'pendiente' | 'confirmada' | 'realizada' | 'cancelada'
  ubicacion?: string
  enlace_videollamada?: string
  observaciones?: string
  notas_terapeuta?: string
  descontar_de_bono?: boolean
  sesion_descontada?: boolean
  recordatorio_enviado?: boolean
  metadata?: any
  created_at?: string
  updated_at?: string
}

interface CrearCitaParams {
  paciente_id: string
  paciente_nombre?: string
  terapeuta_id?: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  modalidad: 'presencial' | 'online' | 'telefonica'
  estado: 'confirmada' | 'pendiente' | 'cancelada' | 'realizada'
  notas?: string
  descontar_de_bono?: boolean
  bono_id?: string
  ubicacion?: string
  enlace_videollamada?: string
}

interface Terapeuta {
  id: string
  nombre_completo: string
  email: string
  telefono?: string
  especialidad?: string
  num_colegiada?: string
  disponibilidad?: any
  activo: boolean
  metadata?: any
  created_at?: string
}

interface HorarioDisponible {
  fecha: string
  hora: string
  disponible: boolean
  terapeuta_id?: string
}

interface EstadisticasBono {
  bono_id: string
  paciente_id: string
  sesiones_totales: number
  sesiones_restantes: number
  sesiones_usadas: number
  porcentaje_usado: number
  citas_realizadas: number
  citas_pendientes: number
  estado: string
}

interface InfoBono {
  tiene_bono: boolean
  sesiones_restantes: number
  sesiones_totales: number
  tipo_bono: string
  bono_id?: string
}

interface ResultadoOperacion {
  success: boolean
  error?: string
  message?: string
  data?: any
}

export const useCitas = () => {
  const supabase = useSupabaseClient<any>() // Usar tipo dinámico para evitar errores de tipos

  // ============================================================================
  // GESTIÓN DE TERAPEUTAS
  // ============================================================================

  /**
   * Obtiene todos los terapeutas activos
   */
  const getTerapeutas = async () => {
    if (!process.client) return []

    try {
      const { data, error } = await supabase
        .from('terapeutas')
        .select('*')
        .eq('activo', true)
        .order('nombre_completo', { ascending: true })

      if (error) {
        console.error('❌ Error al obtener terapeutas:', error)
        return []
      }

      return (data as any[]) || []
    } catch (error) {
      console.error('❌ Error al obtener terapeutas:', error)
      return []
    }
  }

  /**
   * Obtiene un terapeuta por ID
   */
  const getTerapeuta = async (terapeutaId: string) => {
    if (!process.client) return null

    try {
      const { data, error } = await supabase
        .from('terapeutas')
        .select('*')
        .eq('id', terapeutaId)
        .single()

      if (error) {
        console.error('❌ Error al obtener terapeuta:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Error al obtener terapeuta:', error)
      return null
    }
  }

  /**
   * Obtiene el terapeuta actual (basado en email del usuario)
   */
  const getTerapeutaActual = async () => {
    if (!process.client) return null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('terapeutas')
        .select('*')
        .eq('email', user.email)
        .eq('activo', true)
        .single()

      if (error) {
        console.log('ℹ️ Usuario no es terapeuta o no encontrado')
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Error al obtener terapeuta actual:', error)
      return null
    }
  }

  // ============================================================================
  // GESTIÓN DE CITAS - LECTURA
  // ============================================================================

  /**
   * Obtiene todas las citas del terapeuta usando la vista consolidada
   */
  const getCitas = async (terapeutaId?: string) => {
    if (!process.client) return []

    try {
      let idTerapeuta = terapeutaId
      
      // Si no se proporciona ID, intentar obtenerlo del usuario actual
      if (!idTerapeuta) {
        const terapeuta = await getTerapeutaActual()
        if (!terapeuta) {
          console.warn('⚠️ No se pudo identificar el terapeuta actual')
          return []
        }
        idTerapeuta = terapeuta.id
      }

      // Usar la vista consolidada para mejor performance
      const { data, error } = await supabase
        .from('vista_agenda_terapeutas')
        .select('*')
        .eq('terapeuta_id', idTerapeuta)
        .order('fecha_cita', { ascending: true })
        .order('hora_inicio', { ascending: true })

      if (error) {
        console.error('❌ Error al obtener citas desde vista:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Error al obtener citas:', error)
      return []
    }
  }

  /**
   * Obtiene las citas de un día específico usando la vista consolidada
   */
  const getCitasPorDia = async (fecha: string, terapeutaId?: string) => {
    if (!process.client) return []

    try {
      let idTerapeuta = terapeutaId
      
      if (!idTerapeuta) {
        const terapeuta = await getTerapeutaActual()
        if (!terapeuta) return []
        idTerapeuta = terapeuta.id
      }

      // Usar la vista consolidada
      const { data, error } = await supabase
        .from('vista_agenda_terapeutas')
        .select('*')
        .eq('terapeuta_id', idTerapeuta)
        .eq('fecha_cita', fecha)
        .order('hora_inicio', { ascending: true })

      if (error) {
        console.error('❌ Error al obtener citas por día:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Error al obtener citas por día:', error)
      return []
    }
  }

  /**
   * Obtiene las citas de un rango de fechas usando la vista consolidada
   */
  const getCitasRango = async (fechaInicio: string, fechaFin: string, terapeutaId?: string) => {
    if (!process.client) return []

    try {
      let idTerapeuta = terapeutaId
      
      if (!idTerapeuta) {
        const terapeuta = await getTerapeutaActual()
        if (!terapeuta) return []
        idTerapeuta = terapeuta.id
      }

      // Usar la vista consolidada
      const { data, error } = await supabase
        .from('vista_agenda_terapeutas')
        .select('*')
        .eq('terapeuta_id', idTerapeuta)
        .gte('fecha_cita', fechaInicio)
        .lte('fecha_cita', fechaFin)
        .order('fecha_cita', { ascending: true })
        .order('hora_inicio', { ascending: true })

      if (error) {
        console.error('❌ Error al obtener citas por rango:', error)
        return []
      }

      // Mapear datos para compatibilidad con código existente
      const citasMapeadas = (data || []).map((cita: any) => ({
        ...cita,
        fecha: cita.fecha_cita // Alias para compatibilidad
      }))

      return citasMapeadas
    } catch (error) {
      console.error('❌ Error al obtener citas por rango:', error)
      return []
    }
  }

  /**
   * Obtiene las citas de un paciente específico
   */
  const getCitasPaciente = async (pacienteId: string) => {
    if (!process.client) return []

    try {
      const { data, error } = await supabase
        .from('citas')
        .select(`
          *,
          terapeutas!inner (
            id,
            nombre_completo
          ),
          bonos (
            id,
            sesiones_restantes
          )
        `)
        .eq('paciente_id', pacienteId)
        .order('fecha_cita', { ascending: false })

      if (error) {
        console.error('❌ Error al obtener citas del paciente:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Error al obtener citas del paciente:', error)
      return []
    }
  }

  // ============================================================================
  // GESTIÓN DE CITAS - CREACIÓN Y ACTUALIZACIÓN
  // ============================================================================

  /**
   * 🎯 FUNCIÓN PRINCIPAL: Crear una nueva cita con sincronización completa
   * 
   * Esta función:
   * 1. Busca automáticamente un bono activo del paciente
   * 2. Vincula el bono si existe y tiene sesiones disponibles
   * 3. Crea la cita con valores por defecto seguros
   * 4. Emite evento global para actualización en tiempo real
   * 5. Retorna resultado estructurado con éxito/error
   */
  const crearCita = async (params: CrearCitaParams): Promise<ResultadoOperacion> => {
    if (!process.client) return { success: false, error: 'Not client' }

    try {
      // 1️⃣ Obtener terapeuta si no se proporciona
      let terapeutaId = params.terapeuta_id
      if (!terapeutaId) {
        const terapeuta = await getTerapeutaActual()
        if (!terapeuta) {
          return { 
            success: false, 
            error: 'No se pudo identificar el terapeuta. Por favor, vuelve a iniciar sesión.' 
          }
        }
        terapeutaId = terapeuta.id
      }

      // 2️⃣ Buscar bono activo automáticamente (LÓGICA MEJORADA)
      let bonoId = params.bono_id
      let descontarDeBono = params.descontar_de_bono || false

      // Si no se especificó bono pero sí se quiere descontar, buscar automáticamente
      if (!bonoId && descontarDeBono) {
        const bonoActivoId = await obtenerBonoActivoId(params.paciente_id)
        if (bonoActivoId) {
          bonoId = bonoActivoId
          console.log('✅ Bono activo encontrado automáticamente:', bonoActivoId)
        } else {
          console.log('⚠️ No se encontró bono activo, creando cita sin bono')
          descontarDeBono = false
        }
      }

      // Si se proporcionó un bono_id explícito, usarlo
      if (params.bono_id) {
        bonoId = params.bono_id
        descontarDeBono = true
      }

      console.log('📋 [Crear Cita] Parámetros:', {
        paciente_id: params.paciente_id,
        paciente_nombre: params.paciente_nombre,
        terapeuta_id: terapeutaId,
        fecha_cita: params.fecha,
        modalidad: params.modalidad,
        estado: params.estado,
        bono_id: bonoId,
        descontar_de_bono: descontarDeBono
      })

      // 3️⃣ Preparar datos de la cita con valores por defecto seguros
      const citaData: any = {
        paciente_id: params.paciente_id,
        terapeuta_id: terapeutaId,
        fecha_cita: params.fecha,
        hora_inicio: params.hora_inicio,
        hora_fin: params.hora_fin,
        modalidad: params.modalidad || 'online',
        estado: params.estado || 'pendiente',
        observaciones: params.notas || null,
        descontar_de_bono: descontarDeBono,
        bono_id: bonoId || null,
        sesion_descontada: false,
        recordatorio_enviado: false,
        ubicacion: params.ubicacion || null,
        enlace_videollamada: params.enlace_videollamada || null
      }

      // 4️⃣ Insertar en la base de datos
      const { data, error } = await supabase
        .from('citas')
        .insert(citaData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error al crear cita:', error)
        console.error('❌ Error code:', error.code)
        console.error('❌ Error details:', error.details)
        console.error('❌ Error hint:', error.hint)
        
        // 5️⃣ Mensajes de error personalizados y útiles
        if (error.message.includes('disponibilidad')) {
          return { 
            success: false, 
            error: 'El terapeuta ya tiene una cita en ese horario. Por favor, selecciona otro.'
          }
        }
        if (error.message.includes('bono')) {
          return { 
            success: false, 
            error: 'El bono no tiene sesiones disponibles o no está activo.'
          }
        }
        if (error.message.includes('users') || error.code === '42501') {
          return { 
            success: false, 
            error: 'Error de permisos. Por favor, contacta al administrador.'
          }
        }
        if (error.code === '23503') {
          return { 
            success: false, 
            error: 'Paciente o terapeuta no encontrado. Verifica los datos.'
          }
        }
        
        return { 
          success: false, 
          error: error.message || 'Error al crear la cita' 
        }
      }

      console.log('✅ Cita creada exitosamente:', data.id)
      
      // 6️⃣ Emitir evento global para sincronización en tiempo real
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('citas:actualizadas', { 
          detail: { 
            tipo: 'INSERT', 
            cita: data,
            paciente_nombre: params.paciente_nombre 
          } 
        })
        window.dispatchEvent(event)
        console.log('📡 Evento "citas:actualizadas" emitido')
      }
      
      return { 
        success: true, 
        data,
        message: bonoId 
          ? `Cita creada exitosamente y vinculada al bono activo` 
          : 'Cita creada exitosamente'
      }
    } catch (error: any) {
      console.error('❌ Error al crear cita:', error)
      return { 
        success: false, 
        error: error.message || 'Error desconocido al crear la cita' 
      }
    }
  }

  /**
   * Actualizar el estado de una cita
   */
  const actualizarEstadoCita = async (
    citaId: string, 
    nuevoEstado: 'pendiente' | 'confirmada' | 'realizada' | 'cancelada'
  ): Promise<ResultadoOperacion> => {
    if (!process.client) return { success: false }

    try {
      const { data, error } = await supabase
        .from('citas')
        .update({ estado: nuevoEstado })
        .eq('id', citaId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error al actualizar estado de cita:', error)
        return { success: false, error: error.message }
      }

      console.log(`✅ Estado de cita actualizado a: ${nuevoEstado}`)

      // Si se marca como realizada, el trigger automáticamente descontará del bono
      if (nuevoEstado === 'realizada') {
        return { 
          success: true, 
          data,
          message: 'Cita completada. Sesión descontada del bono automáticamente (si aplicaba).'
        }
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('❌ Error al actualizar estado:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Actualizar datos de una cita
   */
  const actualizarCita = async (citaId: string, updates: Partial<Cita>): Promise<ResultadoOperacion> => {
    if (!process.client) return { success: false }

    try {
      const { data, error } = await supabase
        .from('citas')
        .update(updates)
        .eq('id', citaId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error al actualizar cita:', error)
        
        if (error.message.includes('disponibilidad')) {
          return { 
            success: false, 
            error: 'Conflicto de horario con otra cita'
          }
        }
        
        return { success: false, error: error.message }
      }

      console.log('✅ Cita actualizada exitosamente')
      return { success: true, data }
    } catch (error: any) {
      console.error('❌ Error al actualizar cita:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Cancelar una cita
   */
  const cancelarCita = async (citaId: string, motivo?: string): Promise<ResultadoOperacion> => {
    if (!process.client) return { success: false }

    try {
      const updates: any = {
        estado: 'cancelada'
      }

      if (motivo) {
        updates.observaciones = motivo
      }

      const { data, error } = await supabase
        .from('citas')
        .update(updates)
        .eq('id', citaId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error al cancelar cita:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Cita cancelada exitosamente')
      return { success: true, data, message: 'Cita cancelada' }
    } catch (error: any) {
      console.error('❌ Error al cancelar cita:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Cancelar cita con opción de reintegrar sesión al bono
   */
  const cancelarCitaConReintegro = async (
    citaId: string, 
    bonoId: string | null, 
    reintegrar: boolean = false
  ): Promise<ResultadoOperacion> => {
    if (!process.client) return { success: false }

    try {
      // Si no hay bono, usar el método de cancelación simple
      if (!bonoId) {
        return await cancelarCita(citaId)
      }

      // Llamar a la función RPC para cancelar con opción de reintegro
      const { data, error } = await supabase.rpc('fn_reintegrar_sesion_bono', {
        p_cita_id: citaId,
        p_bono_id: bonoId,
        p_reintegrar: reintegrar
      })

      if (error) {
        console.error('❌ Error al cancelar cita con reintegro:', error)
        return { success: false, error: error.message }
      }

      if (!data || !data.success) {
        return { 
          success: false, 
          error: data?.error || 'Error al cancelar cita' 
        }
      }

      console.log('✅ Cita cancelada:', data)
      return { 
        success: true, 
        data: data,
        message: data.message
      }
    } catch (error: any) {
      console.error('❌ Error al cancelar cita con reintegro:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Eliminar una cita permanentemente (solo staff)
   */
  const eliminarCita = async (citaId: string): Promise<ResultadoOperacion> => {
    if (!process.client) return { success: false }

    try {
      const { error } = await supabase
        .from('citas')
        .delete()
        .eq('id', citaId)

      if (error) {
        console.error('❌ Error al eliminar cita:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Cita eliminada exitosamente')
      return { success: true, message: 'Cita eliminada permanentemente' }
    } catch (error: any) {
      console.error('❌ Error al eliminar cita:', error)
      return { success: false, error: error.message }
    }
  }

  // ============================================================================
  // GESTIÓN DE BONOS
  // ============================================================================

  /**
   * Obtiene el bono activo de un paciente (solo ID optimizado)
   */
  const obtenerBonoActivoId = async (pacienteId: string): Promise<string | null> => {
    if (!process.client) return null

    try {
      const { data, error } = await supabase
        .from('bonos')
        .select('id')
        .eq('paciente_id', pacienteId)
        .eq('estado', 'activo')
        .gt('sesiones_restantes', 0)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.log('ℹ️ No hay bono activo para el paciente')
        return null
      }

      return data?.id || null
    } catch (error) {
      console.error('❌ Error al obtener bono activo:', error)
      return null
    }
  }

  /**
   * Obtiene el bono activo de un paciente (completo)
   */
  const obtenerBonoActivo = async (pacienteId: string) => {
    if (!process.client) return null

    try {
      const { data, error } = await supabase
        .from('bonos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .eq('estado', 'activo')
        .gt('sesiones_restantes', 0)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.log('ℹ️ No hay bono activo para el paciente')
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Error al obtener bono activo:', error)
      return null
    }
  }

  /**
   * Verifica si un paciente tiene bono activo con sesiones disponibles
   */
  const verificarBonoActivo = async (pacienteId: string): Promise<InfoBono> => {
    const bono = await obtenerBonoActivo(pacienteId)
    
    if (!bono) {
      return {
        tiene_bono: false,
        sesiones_restantes: 0,
        sesiones_totales: 0,
        tipo_bono: '',
        bono_id: undefined
      }
    }
    
    try {
      // Obtener información del paciente para el tipo de bono
      const { data: paciente } = await supabase
        .from('pacientes')
        .select('metadata, area_de_acompanamiento, frecuencia')
        .eq('id', pacienteId)
        .single()
      
      const tipoBono = (bono as any).tipo_bono || 
                      (paciente as any)?.frecuencia || 
                      (paciente as any)?.metadata?.frecuencia || 
                      'mensual'
      
      return {
        tiene_bono: true,
        sesiones_restantes: (bono as any).sesiones_restantes || 0,
        sesiones_totales: (bono as any).sesiones_totales || 0,
        tipo_bono: tipoBono,
        bono_id: (bono as any).id
      }
    } catch (error) {
      console.error('❌ Error al verificar bono:', error)
      return {
        tiene_bono: false,
        sesiones_restantes: 0,
        sesiones_totales: 0,
        tipo_bono: '',
        bono_id: undefined
      }
    }
  }

  /**
   * Obtener estadísticas detalladas de un bono
   */
  const obtenerEstadisticasBono = async (bonoId: string): Promise<EstadisticasBono | null> => {
    if (!process.client) return null

    try {
      const { data, error } = await supabase
        .rpc('obtener_estadisticas_bono', { p_bono_id: bonoId })
        .single()

      if (error) {
        console.error('❌ Error al obtener estadísticas del bono:', error)
        return null
      }

      return data as EstadisticasBono
    } catch (error) {
      console.error('❌ Error al obtener estadísticas del bono:', error)
      return null
    }
  }

  /**
   * Obtener todos los bonos de un paciente (activos e históricos)
   */
  const getBonosPaciente = async (pacienteId: string) => {
    if (!process.client) return []

    try {
      const { data, error } = await supabase
        .from('bonos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error al obtener bonos del paciente:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Error al obtener bonos:', error)
      return []
    }
  }

  // ============================================================================
  // DISPONIBILIDAD Y VALIDACIONES
  // ============================================================================

  /**
   * Verificar disponibilidad de terapeuta en un horario
   */
  const verificarDisponibilidadTerapeuta = async (
    terapeutaId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string
  ): Promise<boolean> => {
    if (!process.client) return false

    try {
      const { data, error } = await supabase
        .rpc('verificar_disponibilidad_terapeuta', {
          p_terapeuta_id: terapeutaId,
          p_fecha: fecha,
          p_hora_inicio: horaInicio,
          p_hora_fin: horaFin
        })

      if (error) {
        console.error('❌ Error al verificar disponibilidad:', error)
        return false
      }

      return data === true
    } catch (error) {
      console.error('❌ Error al verificar disponibilidad:', error)
      return false
    }
  }

  /**
   * Buscar horarios disponibles en los próximos N días
   */
  const buscarDisponibilidad = async (
    terapeutaId: string,
    dias: number = 14,
    duracion: number = 60
  ): Promise<HorarioDisponible[]> => {
    if (!process.client) return []

    try {
      const disponibilidades: HorarioDisponible[] = []
      const hoy = new Date()
      
      // Horarios de trabajo típicos
      const horasDisponibles = [
        '09:00', '10:00', '11:00', '12:00', 
        '14:00', '15:00', '16:00', '17:00', '18:00'
      ]

      // Obtener citas existentes en el rango
      const fechaInicio = formatearFecha(hoy)
      const fechaFin = new Date(hoy)
      fechaFin.setDate(fechaFin.getDate() + dias)
      
      const citas = await getCitasRango(fechaInicio, formatearFecha(fechaFin), terapeutaId)

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
          const horaFin = calcularHoraFin(hora, duracion)
          
          const citaExiste = (citas as any[]).some((c: any) => 
            c.fecha_cita === fechaStr && 
            horariosSeSuperponen(hora, horaFin, c.hora_inicio, c.hora_fin) &&
            c.estado !== 'cancelada'
          )

          if (!citaExiste) {
            disponibilidades.push({
              fecha: fechaStr,
              hora,
              disponible: true,
              terapeuta_id: terapeutaId
            })
          }
        }
      }

      return disponibilidades.slice(0, 30) // Primeras 30 disponibilidades
    } catch (error) {
      console.error('❌ Error al buscar disponibilidad:', error)
      return []
    }
  }

  /**
   * Sugerir próximo horario disponible basado en última cita y frecuencia
   */
  const sugerirProximoHorario = async (
    pacienteId: string,
    frecuencia: string,
    terapeutaId?: string
  ): Promise<{ fecha: string; hora: string } | null> => {
    if (!process.client) return null

    try {
      // Obtener terapeuta
      let idTerapeuta = terapeutaId
      if (!idTerapeuta) {
        const terapeuta = await getTerapeutaActual()
        if (!terapeuta) return null
        idTerapeuta = terapeuta.id
      }

      // Calcular fecha sugerida
      const fechaSugerida = await calcularProximaFechaSugerida(pacienteId, frecuencia)
      if (!fechaSugerida) return null

      // Obtener última cita del paciente para sugerir la misma hora
      const ultimaCita = await getUltimaCitaPaciente(pacienteId)
      let horaSugerida = ultimaCita?.hora_inicio || '10:00'

      // Verificar si el horario está disponible
      if (!idTerapeuta) return null
      const disponibilidades = await buscarDisponibilidad(idTerapeuta, 30, 60)
      
      // Buscar disponibilidad en la fecha sugerida con la hora preferida
      const disponibleEnHoraPreferida = disponibilidades.find(
        d => d.fecha === fechaSugerida && d.hora === horaSugerida
      )

      if (disponibleEnHoraPreferida) {
        return { fecha: fechaSugerida, hora: horaSugerida }
      }

      // Si no está disponible, buscar el primer horario disponible ese día
      const disponibleEseDia = disponibilidades.find(d => d.fecha === fechaSugerida)
      if (disponibleEseDia) {
        return { fecha: fechaSugerida, hora: disponibleEseDia.hora }
      }

      // Si no hay disponibilidad ese día, buscar el próximo disponible
      const proximoDisponible = disponibilidades[0]
      if (proximoDisponible) {
        return { fecha: proximoDisponible.fecha, hora: proximoDisponible.hora }
      }

      return null
    } catch (error) {
      console.error('❌ Error al sugerir próximo horario:', error)
      return null
    }
  }

  /**
   * Obtener próximas citas de un paciente
   */
  const getProximasCitasPaciente = async (pacienteId: string, limite: number = 10) => {
    if (!process.client) return []

    try {
      const { data, error } = await supabase
        .rpc('obtener_proximas_citas_paciente', {
          p_paciente_id: pacienteId,
          p_limite: limite
        })

      if (error) {
        console.error('❌ Error al obtener próximas citas:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Error al obtener próximas citas:', error)
      return []
    }
  }

  /**
   * Obtener la última cita realizada de un paciente
   */
  const getUltimaCitaPaciente = async (pacienteId: string) => {
    if (!process.client) return null

    try {
      const { data, error } = await supabase
        .from('citas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .in('estado', ['realizada', 'confirmada'])
        .order('fecha_cita', { ascending: false })
        .order('hora_inicio', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('❌ Error al obtener última cita:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Error al obtener última cita:', error)
      return null
    }
  }

  /**
   * Calcular la próxima fecha sugerida basándose en la frecuencia y última cita
   */
  const calcularProximaFechaSugerida = async (
    pacienteId: string, 
    frecuencia: string
  ): Promise<string | null> => {
    if (!process.client) return null

    try {
      const ultimaCita = await getUltimaCitaPaciente(pacienteId)
      
      let diasASumar = 7 // Default: semanal
      
      // Determinar días según frecuencia
      switch (frecuencia?.toLowerCase()) {
        case 'semanal':
          diasASumar = 7
          break
        case 'quincenal':
          diasASumar = 14
          break
        case 'mensual':
          diasASumar = 30
          break
        default:
          diasASumar = 7
      }

      // Si hay una última cita, sumar desde esa fecha
      let fechaBase: Date
      if (ultimaCita && ultimaCita.fecha_cita) {
        fechaBase = new Date(ultimaCita.fecha_cita + 'T00:00:00')
        fechaBase.setDate(fechaBase.getDate() + diasASumar)
      } else {
        // Si no hay cita previa, sugerir desde mañana
        fechaBase = new Date()
        fechaBase.setDate(fechaBase.getDate() + 1)
      }

      // Evitar fines de semana
      while (fechaBase.getDay() === 0 || fechaBase.getDay() === 6) {
        fechaBase.setDate(fechaBase.getDate() + 1)
      }

      return formatearFecha(fechaBase)
    } catch (error) {
      console.error('❌ Error al calcular próxima fecha:', error)
      return null
    }
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  /**
   * Formatea una fecha a string YYYY-MM-DD
   */
  function formatearFecha(fecha: Date): string {
    const resultado = fecha.toISOString().split('T')[0]
    return resultado || ''
  }

  /**
   * Calcula la hora de fin basada en la hora de inicio y duración
   */
  function calcularHoraFin(horaInicio: string, duracionMinutos: number): string {
    const [horas = 0, minutos = 0] = horaInicio.split(':').map(Number)
    const fecha = new Date()
    fecha.setHours(horas, minutos, 0, 0)
    fecha.setMinutes(fecha.getMinutes() + duracionMinutos)
    
    const horaFin = String(fecha.getHours()).padStart(2, '0')
    const minutosFin = String(fecha.getMinutes()).padStart(2, '0')
    
    return `${horaFin}:${minutosFin}`
  }

  /**
   * Verifica si dos horarios se superponen
   */
  function horariosSeSuperponen(
    inicio1: string, 
    fin1: string, 
    inicio2: string, 
    fin2: string
  ): boolean {
    return inicio1 < fin2 && inicio2 < fin1
  }

  /**
   * Obtener el nombre del día de la semana
   */
  function obtenerNombreDia(fecha: string): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const date = new Date(fecha + 'T00:00:00')
    return dias[date.getDay()] || 'Desconocido'
  }

  // ============================================================================
  // REALTIME - SUSCRIPCIONES
  // ============================================================================

  /**
   * Suscribirse a cambios en tiempo real de citas
   */
  const listenRealtimeCitas = (
    terapeutaId: string,
    callback: (evento: 'INSERT' | 'UPDATE' | 'DELETE', cita: any) => void
  ) => {
    if (!process.client) return null

    const channel = supabase
      .channel(`citas:terapeuta:${terapeutaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'citas',
          filter: `terapeuta_id=eq.${terapeutaId}`
        },
        (payload: any) => {
          console.log('📡 Cambio en citas detectado:', payload.eventType, payload.new || payload.old)
          
          if (payload.eventType === 'INSERT') {
            callback('INSERT', payload.new)
          } else if (payload.eventType === 'UPDATE') {
            callback('UPDATE', payload.new)
          } else if (payload.eventType === 'DELETE') {
            callback('DELETE', payload.old)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Suscrito a cambios de citas en tiempo real')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error al suscribirse a cambios de citas')
        }
      })

    return channel
  }

  /**
   * Suscribirse a cambios en tiempo real de todas las citas (para coordinación)
   */
  const listenRealtimeCitasGlobal = (
    callback: (evento: 'INSERT' | 'UPDATE' | 'DELETE', cita: any) => void
  ) => {
    if (!process.client) return null

    const channel = supabase
      .channel('citas:global')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'citas'
        },
        (payload: any) => {
          console.log('📡 Cambio global en citas detectado:', payload.eventType)
          
          if (payload.eventType === 'INSERT') {
            callback('INSERT', payload.new)
          } else if (payload.eventType === 'UPDATE') {
            callback('UPDATE', payload.new)
          } else if (payload.eventType === 'DELETE') {
            callback('DELETE', payload.old)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Suscrito a cambios globales de citas en tiempo real')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error al suscribirse a cambios globales de citas')
        }
      })

    return channel
  }

  // ============================================================================
  // RETORNO DEL COMPOSABLE
  // ============================================================================

  return {
    // Terapeutas
    getTerapeutas,
    getTerapeuta,
    getTerapeutaActual,
    
    // Citas - Lectura
    getCitas,
    getCitasPorDia,
    getCitasRango,
    getCitasPaciente,
    getProximasCitasPaciente,
    getUltimaCitaPaciente,
    
    // Citas - Escritura
    crearCita,
    actualizarEstadoCita,
    actualizarCita,
    cancelarCita,
    cancelarCitaConReintegro,
    eliminarCita,
    
    // Bonos
    obtenerBonoActivoId,
    obtenerBonoActivo,
    verificarBonoActivo,
    obtenerEstadisticasBono,
    getBonosPaciente,
    
    // Disponibilidad
    verificarDisponibilidadTerapeuta,
    buscarDisponibilidad,
    calcularProximaFechaSugerida,
    sugerirProximoHorario,
    
    // Realtime
    listenRealtimeCitas,
    listenRealtimeCitasGlobal,
    
    // Utilidades
    formatearFecha,
    calcularHoraFin,
    obtenerNombreDia
  }
}
