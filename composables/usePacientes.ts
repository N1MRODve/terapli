/**
 * =============================================================================
 * COMPOSABLE: usePacientes
 * =============================================================================
 *
 * Proporciona búsqueda inteligente de pacientes y creación rápida inline
 * para el modal de nueva cita.
 *
 * Características:
 * - Búsqueda por nombre, email, teléfono
 * - Debouncing automático
 * - Estado de bonos integrado
 * - Creación rápida de paciente
 * - Cache de resultados
 */

import { ref, computed, watch } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { agendaLogger } from '~/utils/agenda-logger'

export interface PacienteBusqueda {
  id: string
  nombre_completo: string
  email: string
  telefono: string | null
  fecha_nacimiento: string | null
  // Estado de bonos
  bonos_activos: number
  sesiones_restantes_total: number
  proximo_vencimiento: string | null
}

export interface CreatePacienteParams {
  nombre_completo: string
  email: string
  telefono?: string
  fecha_nacimiento?: string
  observaciones?: string
}

export interface CreatePacienteResult {
  success: boolean
  data?: PacienteBusqueda
  error?: string
}

export function usePacientes() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Estado
  const pacientes = ref<PacienteBusqueda[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const debounceTimeout = ref<NodeJS.Timeout | null>(null)

  // Cache
  const cache = ref<Map<string, PacienteBusqueda[]>>(new Map())
  const cacheExpiry = 5 * 60 * 1000 // 5 minutos

  /**
   * Busca pacientes del terapeuta actual con filtros
   */
  async function searchPacientes(query: string): Promise<void> {
    try {
      loading.value = true
      error.value = null

      // Normalizar query
      const normalizedQuery = query.trim().toLowerCase()

      // Verificar cache
      const cachedResult = cache.value.get(normalizedQuery)
      if (cachedResult) {
        pacientes.value = cachedResult
        agendaLogger.debug('search', `Resultados desde cache: ${cachedResult.length}`)
        return
      }

      agendaLogger.debug('search', `Buscando pacientes: "${normalizedQuery}"`)

      if (!user.value?.id) {
        throw new Error('Usuario no autenticado')
      }

      // Obtener terapeuta_id
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('terapeuta_id')
        .eq('id', user.value.id)
        .single()

      if (perfilError || !perfil?.terapeuta_id) {
        throw new Error('No se pudo obtener el perfil del terapeuta')
      }

      const terapeutaId = perfil.terapeuta_id

      // Buscar pacientes con información de bonos
      let queryBuilder = supabase
        .from('pacientes')
        .select(`
          id,
          nombre_completo,
          email,
          telefono,
          fecha_nacimiento,
          bonos:bonos_sesiones(
            id,
            sesiones_restantes,
            fecha_vencimiento,
            estado
          )
        `)
        .eq('terapeuta_id', terapeutaId)

      // Aplicar filtros de búsqueda si hay query
      if (normalizedQuery.length > 0) {
        queryBuilder = queryBuilder.or(
          `nombre_completo.ilike.%${normalizedQuery}%,email.ilike.%${normalizedQuery}%,telefono.ilike.%${normalizedQuery}%`
        )
      }

      const { data, error: fetchError } = await queryBuilder
        .order('nombre_completo', { ascending: true })
        .limit(50)

      if (fetchError) {
        throw fetchError
      }

      // Transformar datos con información de bonos
      const pacientesConBonos: PacienteBusqueda[] = (data || []).map((p: any) => {
        const bonosActivos = (p.bonos || []).filter((b: any) =>
          b.estado === 'activo' && b.sesiones_restantes > 0
        )

        const sesionesRestantesTotal = bonosActivos.reduce(
          (sum: number, b: any) => sum + (b.sesiones_restantes || 0),
          0
        )

        // Encontrar próximo vencimiento
        const proximoVencimiento = bonosActivos
          .filter((b: any) => b.fecha_vencimiento)
          .map((b: any) => new Date(b.fecha_vencimiento).getTime())
          .sort()
          [0] || null

        return {
          id: p.id,
          nombre_completo: p.nombre_completo,
          email: p.email,
          telefono: p.telefono,
          fecha_nacimiento: p.fecha_nacimiento,
          bonos_activos: bonosActivos.length,
          sesiones_restantes_total: sesionesRestantesTotal,
          proximo_vencimiento: proximoVencimiento
            ? new Date(proximoVencimiento).toISOString()
            : null
        }
      })

      pacientes.value = pacientesConBonos

      // Guardar en cache
      cache.value.set(normalizedQuery, pacientesConBonos)

      // Limpiar cache después de expiry time
      setTimeout(() => {
        cache.value.delete(normalizedQuery)
      }, cacheExpiry)

      agendaLogger.info('search', `Pacientes encontrados: ${pacientesConBonos.length}`)

    } catch (err: any) {
      const errorMsg = err.message || 'Error al buscar pacientes'
      error.value = errorMsg
      agendaLogger.error('api_error', errorMsg, err)
      pacientes.value = []

    } finally {
      loading.value = false
    }
  }

  /**
   * Búsqueda con debouncing automático
   */
  function debouncedSearch(query: string, delay: number = 300): void {
    // Cancelar timeout anterior
    if (debounceTimeout.value) {
      clearTimeout(debounceTimeout.value)
    }

    // Si query está vacío, buscar todos los pacientes inmediatamente
    if (query.trim().length === 0) {
      searchPacientes(query)
      return
    }

    // Crear nuevo timeout
    debounceTimeout.value = setTimeout(() => {
      searchPacientes(query)
    }, delay)
  }

  /**
   * Crea un nuevo paciente rápidamente (para inline creation)
   */
  async function createPaciente(params: CreatePacienteParams): Promise<CreatePacienteResult> {
    try {
      loading.value = true
      error.value = null

      agendaLogger.debug('create', 'Creando paciente rápido', params)

      if (!user.value?.id) {
        throw new Error('Usuario no autenticado')
      }

      // Validaciones básicas
      if (!params.nombre_completo || params.nombre_completo.trim().length < 2) {
        return {
          success: false,
          error: 'El nombre debe tener al menos 2 caracteres'
        }
      }

      if (!params.email || !params.email.includes('@')) {
        return {
          success: false,
          error: 'Email inválido'
        }
      }

      // Obtener terapeuta_id
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('terapeuta_id')
        .eq('id', user.value.id)
        .single()

      if (perfilError || !perfil?.terapeuta_id) {
        throw new Error('No se pudo obtener el perfil del terapeuta')
      }

      const terapeutaId = perfil.terapeuta_id

      // Verificar si el email ya existe para este terapeuta
      const { data: existente, error: checkError } = await supabase
        .from('pacientes')
        .select('id, nombre_completo')
        .eq('terapeuta_id', terapeutaId)
        .eq('email', params.email.trim().toLowerCase())
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existente) {
        return {
          success: false,
          error: `Ya existe un paciente con el email ${params.email}: ${existente.nombre_completo}`
        }
      }

      // Crear paciente
      const { data: nuevoPaciente, error: insertError } = await supabase
        .from('pacientes')
        .insert({
          terapeuta_id: terapeutaId,
          nombre_completo: params.nombre_completo.trim(),
          email: params.email.trim().toLowerCase(),
          telefono: params.telefono?.trim() || null,
          fecha_nacimiento: params.fecha_nacimiento || null,
          observaciones: params.observaciones?.trim() || null
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Transformar a PacienteBusqueda
      const pacienteBusqueda: PacienteBusqueda = {
        id: nuevoPaciente.id,
        nombre_completo: nuevoPaciente.nombre_completo,
        email: nuevoPaciente.email,
        telefono: nuevoPaciente.telefono,
        fecha_nacimiento: nuevoPaciente.fecha_nacimiento,
        bonos_activos: 0,
        sesiones_restantes_total: 0,
        proximo_vencimiento: null
      }

      // Agregar a la lista local
      pacientes.value.unshift(pacienteBusqueda)

      // Invalidar cache
      cache.value.clear()

      agendaLogger.info('create', `Paciente creado: ${nuevoPaciente.id}`)

      return {
        success: true,
        data: pacienteBusqueda
      }

    } catch (err: any) {
      const errorMsg = err.message || 'Error al crear paciente'
      error.value = errorMsg
      agendaLogger.error('api_error', errorMsg, err)

      return {
        success: false,
        error: errorMsg
      }

    } finally {
      loading.value = false
    }
  }

  /**
   * Carga todos los pacientes del terapeuta
   */
  async function loadAllPacientes(): Promise<void> {
    await searchPacientes('')
  }

  /**
   * Limpia los resultados de búsqueda
   */
  function clearSearch(): void {
    searchQuery.value = ''
    pacientes.value = []
    error.value = null
  }

  /**
   * Invalida el cache
   */
  function invalidateCache(): void {
    cache.value.clear()
    agendaLogger.debug('cache', 'Cache invalidado')
  }

  // Watch searchQuery para auto-búsqueda
  watch(searchQuery, (newQuery) => {
    debouncedSearch(newQuery)
  })

  // Computadas
  const hasPacientes = computed(() => pacientes.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  return {
    // Estado
    pacientes,
    loading: isLoading,
    error: hasError,
    searchQuery,

    // Computadas
    hasPacientes,

    // Métodos
    searchPacientes,
    debouncedSearch,
    createPaciente,
    loadAllPacientes,
    clearSearch,
    invalidateCache,

    // Utilidades
    clearError: () => { error.value = null }
  }
}
