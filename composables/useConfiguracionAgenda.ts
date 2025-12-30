/**
 * =============================================================================
 * COMPOSABLE: useConfiguracionAgenda
 * =============================================================================
 *
 * Gestiona la configuración de agenda del terapeuta:
 * - Horarios de trabajo (mañana/tarde)
 * - Días laborables
 * - Vacaciones y bloqueos de horario
 * - Horarios personalizados por día
 * - Buffer entre citas
 */

import { ref, computed, readonly } from 'vue'

// =====================================================
// TIPOS
// =====================================================

export interface HorarioTrabajo {
  inicio_manana: string
  fin_manana: string
  inicio_tarde: string
  fin_tarde: string
}

export interface HorarioPersonalizado {
  fecha: string
  inicio_manana?: string
  fin_manana?: string
  inicio_tarde?: string
  fin_tarde?: string
  notas?: string
  cerrado?: boolean
}

export interface Bloqueo {
  id: string
  fecha_inicio: string
  fecha_fin: string
  tipo: 'vacaciones' | 'festivo' | 'personal' | 'otro'
  descripcion?: string
}

export interface ConfiguracionAgenda {
  buffer_minutos: number
  horario: HorarioTrabajo
  dias_laborables: number[] // 0=domingo, 1=lunes, etc.
  limite_cancelacion_horas: number
  penalizacion_cancelacion: 'ninguna' | 'parcial' | 'completa'
  bloqueos: Bloqueo[]
  horarios_personalizados: HorarioPersonalizado[]
}

// =====================================================
// ESTADO GLOBAL (singleton)
// =====================================================

const configuracion = ref<ConfiguracionAgenda>({
  buffer_minutos: 10,
  horario: {
    inicio_manana: '09:00',
    fin_manana: '14:00',
    inicio_tarde: '16:00',
    fin_tarde: '20:00'
  },
  dias_laborables: [1, 2, 3, 4, 5], // Lunes a viernes
  limite_cancelacion_horas: 24,
  penalizacion_cancelacion: 'ninguna',
  bloqueos: [],
  horarios_personalizados: []
})

const loading = ref(false)
const loaded = ref(false)
const error = ref<string | null>(null)

// =====================================================
// COMPOSABLE
// =====================================================

export function useConfiguracionAgenda() {
  const supabase = useSupabaseClient()
  const { userProfile } = useSupabase()

  /**
   * Carga la configuración de agenda del terapeuta actual
   * @param forzar - Si es true, recarga aunque ya esté cargada
   */
  async function cargarConfiguracion(forzar: boolean = false): Promise<boolean> {
    const terapeutaId = userProfile.value?.id

    if (!terapeutaId) {
      console.warn('[useConfiguracionAgenda] No hay terapeuta autenticado')
      return false
    }

    // Si ya está cargada y no se fuerza, no recargar
    if (loaded.value && !forzar) {
      console.log('[useConfiguracionAgenda] Configuración ya cargada, use forzar=true para recargar')
      return true
    }

    loading.value = true
    error.value = null

    try {
      console.log('[useConfiguracionAgenda] Cargando configuración para:', terapeutaId)

      const { data, error: fetchError } = await supabase
        .from('terapeutas')
        .select('configuracion_agenda')
        .eq('id', terapeutaId)
        .single()

      if (fetchError) {
        console.error('[useConfiguracionAgenda] Error:', fetchError)
        error.value = fetchError.message
        return false
      }

      if (data?.configuracion_agenda) {
        // Merge con valores por defecto para asegurar que todas las propiedades existen
        configuracion.value = {
          ...configuracion.value,
          ...data.configuracion_agenda,
          // Asegurar que arrays existen
          bloqueos: data.configuracion_agenda.bloqueos || [],
          horarios_personalizados: data.configuracion_agenda.horarios_personalizados || [],
          dias_laborables: data.configuracion_agenda.dias_laborables || [1, 2, 3, 4, 5],
          // Asegurar que horario existe
          horario: {
            ...configuracion.value.horario,
            ...(data.configuracion_agenda.horario || {})
          }
        }
        console.log('[useConfiguracionAgenda] Configuración cargada:', configuracion.value)
      }

      loaded.value = true
      return true
    } catch (err: any) {
      console.error('[useConfiguracionAgenda] Error:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Fuerza recarga de la configuración
   */
  async function recargarConfiguracion(): Promise<boolean> {
    loaded.value = false
    return cargarConfiguracion()
  }

  /**
   * Guarda la configuración de agenda
   */
  async function guardarConfiguracion(nuevaConfig: Partial<ConfiguracionAgenda>): Promise<boolean> {
    const terapeutaId = userProfile.value?.id

    if (!terapeutaId) {
      error.value = 'No hay terapeuta autenticado'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const configActualizada = {
        ...configuracion.value,
        ...nuevaConfig
      }

      const { error: updateError } = await supabase
        .from('terapeutas')
        .update({
          configuracion_agenda: configActualizada,
          updated_at: new Date().toISOString()
        })
        .eq('id', terapeutaId)

      if (updateError) {
        console.error('[useConfiguracionAgenda] Error guardando:', updateError)
        error.value = updateError.message
        return false
      }

      configuracion.value = configActualizada
      console.log('[useConfiguracionAgenda] Configuración guardada')
      return true
    } catch (err: any) {
      console.error('[useConfiguracionAgenda] Error:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // =====================================================
  // COMPUTED HELPERS
  // =====================================================

  /**
   * Hora de inicio del día laboral (primera hora de mañana)
   */
  const horaInicioLaboral = computed(() => {
    const hora = configuracion.value.horario.inicio_manana
    return parseInt(hora.split(':')[0])
  })

  /**
   * Hora de fin del día laboral (última hora de tarde)
   */
  const horaFinLaboral = computed(() => {
    const hora = configuracion.value.horario.fin_tarde
    return parseInt(hora.split(':')[0])
  })

  /**
   * Array de horas laborables del día
   */
  const horasLaborables = computed(() => {
    const horas: string[] = []
    const config = configuracion.value.horario

    // Horas de mañana
    const inicioM = parseInt(config.inicio_manana.split(':')[0])
    const finM = parseInt(config.fin_manana.split(':')[0])
    for (let h = inicioM; h < finM; h++) {
      horas.push(`${String(h).padStart(2, '0')}:00`)
    }

    // Horas de tarde
    const inicioT = parseInt(config.inicio_tarde.split(':')[0])
    const finT = parseInt(config.fin_tarde.split(':')[0])
    for (let h = inicioT; h < finT; h++) {
      horas.push(`${String(h).padStart(2, '0')}:00`)
    }

    return horas
  })

  /**
   * Verifica si un día específico es laborable
   */
  function esDiaLaborable(fecha: Date | string): boolean {
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha
    const diaSemana = d.getDay()
    return configuracion.value.dias_laborables.includes(diaSemana)
  }

  /**
   * Verifica si una fecha está bloqueada (vacaciones, etc.)
   */
  function estaBloqueda(fecha: Date | string): Bloqueo | null {
    const fechaStr = typeof fecha === 'string'
      ? fecha
      : `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`

    return configuracion.value.bloqueos.find(b =>
      fechaStr >= b.fecha_inicio && fechaStr <= b.fecha_fin
    ) || null
  }

  /**
   * Obtiene el horario personalizado para una fecha específica (si existe)
   */
  function obtenerHorarioPersonalizado(fecha: string): HorarioPersonalizado | null {
    return configuracion.value.horarios_personalizados.find(h => h.fecha === fecha) || null
  }

  /**
   * Obtiene el horario efectivo para una fecha (personalizado o estándar)
   */
  function obtenerHorarioEfectivo(fecha: string): HorarioTrabajo | null {
    // Si está bloqueado, no hay horario
    if (estaBloqueda(fecha)) {
      return null
    }

    // Verificar si hay horario personalizado
    const personalizado = obtenerHorarioPersonalizado(fecha)
    if (personalizado) {
      if (personalizado.cerrado) {
        return null
      }
      return {
        inicio_manana: personalizado.inicio_manana || configuracion.value.horario.inicio_manana,
        fin_manana: personalizado.fin_manana || configuracion.value.horario.fin_manana,
        inicio_tarde: personalizado.inicio_tarde || configuracion.value.horario.inicio_tarde,
        fin_tarde: personalizado.fin_tarde || configuracion.value.horario.fin_tarde
      }
    }

    // Verificar si es día laborable
    if (!esDiaLaborable(fecha)) {
      return null
    }

    // Retornar horario estándar
    return configuracion.value.horario
  }

  /**
   * Verifica si una hora específica está dentro del horario laboral
   */
  function estaEnHorarioLaboral(fecha: string, hora: string): boolean {
    const horario = obtenerHorarioEfectivo(fecha)
    if (!horario) return false

    // Verificar si está en mañana o tarde
    const enManana = hora >= horario.inicio_manana && hora < horario.fin_manana
    const enTarde = hora >= horario.inicio_tarde && hora < horario.fin_tarde

    return enManana || enTarde
  }

  /**
   * Calcula la ocupación del día (slots ocupados vs disponibles)
   */
  function calcularOcupacionDia(fecha: string, citasDelDia: number, duracionCitaMinutos: number = 60): {
    ocupados: number
    disponibles: number
    porcentaje: number
  } {
    const horario = obtenerHorarioEfectivo(fecha)
    if (!horario) {
      return { ocupados: 0, disponibles: 0, porcentaje: 0 }
    }

    // Calcular slots disponibles
    const buffer = configuracion.value.buffer_minutos
    const slotTotalMinutos = duracionCitaMinutos + buffer

    // Slots en mañana
    const inicioM = parseInt(horario.inicio_manana.split(':')[0]) * 60 + parseInt(horario.inicio_manana.split(':')[1] || '0')
    const finM = parseInt(horario.fin_manana.split(':')[0]) * 60 + parseInt(horario.fin_manana.split(':')[1] || '0')
    const slotsManana = Math.floor((finM - inicioM) / slotTotalMinutos)

    // Slots en tarde
    const inicioT = parseInt(horario.inicio_tarde.split(':')[0]) * 60 + parseInt(horario.inicio_tarde.split(':')[1] || '0')
    const finT = parseInt(horario.fin_tarde.split(':')[0]) * 60 + parseInt(horario.fin_tarde.split(':')[1] || '0')
    const slotsTarde = Math.floor((finT - inicioT) / slotTotalMinutos)

    const totalSlots = slotsManana + slotsTarde
    const porcentaje = totalSlots > 0 ? Math.round((citasDelDia / totalSlots) * 100) : 0

    return {
      ocupados: citasDelDia,
      disponibles: totalSlots,
      porcentaje: Math.min(100, porcentaje)
    }
  }

  // =====================================================
  // GESTIÓN DE BLOQUEOS
  // =====================================================

  /**
   * Añade un nuevo bloqueo (vacaciones, etc.)
   */
  async function agregarBloqueo(bloqueo: Omit<Bloqueo, 'id'>): Promise<boolean> {
    const nuevoBloqueo: Bloqueo = {
      ...bloqueo,
      id: crypto.randomUUID()
    }

    const nuevosBloqueos = [...configuracion.value.bloqueos, nuevoBloqueo]
    return guardarConfiguracion({ bloqueos: nuevosBloqueos })
  }

  /**
   * Elimina un bloqueo
   */
  async function eliminarBloqueo(bloqueoId: string): Promise<boolean> {
    const nuevosBloqueos = configuracion.value.bloqueos.filter(b => b.id !== bloqueoId)
    return guardarConfiguracion({ bloqueos: nuevosBloqueos })
  }

  // =====================================================
  // GESTIÓN DE HORARIOS PERSONALIZADOS
  // =====================================================

  /**
   * Añade o actualiza un horario personalizado para una fecha
   */
  async function establecerHorarioPersonalizado(horario: HorarioPersonalizado): Promise<boolean> {
    const existente = configuracion.value.horarios_personalizados.findIndex(h => h.fecha === horario.fecha)

    let nuevosHorarios: HorarioPersonalizado[]
    if (existente >= 0) {
      nuevosHorarios = [...configuracion.value.horarios_personalizados]
      nuevosHorarios[existente] = horario
    } else {
      nuevosHorarios = [...configuracion.value.horarios_personalizados, horario]
    }

    return guardarConfiguracion({ horarios_personalizados: nuevosHorarios })
  }

  /**
   * Elimina un horario personalizado
   */
  async function eliminarHorarioPersonalizado(fecha: string): Promise<boolean> {
    const nuevosHorarios = configuracion.value.horarios_personalizados.filter(h => h.fecha !== fecha)
    return guardarConfiguracion({ horarios_personalizados: nuevosHorarios })
  }

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Estado
    configuracion: readonly(configuracion),
    loading: readonly(loading),
    loaded: readonly(loaded),
    error: readonly(error),

    // Carga
    cargarConfiguracion,
    recargarConfiguracion,
    guardarConfiguracion,

    // Computed
    horaInicioLaboral,
    horaFinLaboral,
    horasLaborables,

    // Helpers
    esDiaLaborable,
    estaBloqueda,
    obtenerHorarioPersonalizado,
    obtenerHorarioEfectivo,
    estaEnHorarioLaboral,
    calcularOcupacionDia,

    // Bloqueos
    agregarBloqueo,
    eliminarBloqueo,

    // Horarios personalizados
    establecerHorarioPersonalizado,
    eliminarHorarioPersonalizado
  }
}
