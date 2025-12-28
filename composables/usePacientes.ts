/**
 * =============================================================================
 * COMPOSABLE: usePacientes
 * =============================================================================
 *
 * Proporciona búsqueda inteligente de pacientes y creación rápida inline
 * para el modal de nueva cita.
 *
 * Características:
 * - Búsqueda por nombre, email, teléfono via API
 * - Debouncing automático
 * - Estado de bonos integrado
 * - Creación rápida de paciente
 * - Cache de resultados
 */

import { ref, computed, watch } from 'vue'
import { agendaLogger } from '~/utils/agenda-logger'

export interface BonoActivo {
  id: string
  tipo: string
  sesiones_totales: number
  sesiones_restantes: number
  sesiones_usadas: number
  fecha_inicio?: string
  fecha_fin?: string
}

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
  // Información detallada del bono activo principal
  bono_activo: BonoActivo | null
  // Lista de todos los bonos activos
  bonos: BonoActivo[]
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
   * Busca pacientes del terapeuta actual con filtros via API
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
        loading.value = false
        return
      }

      agendaLogger.debug('search', `Buscando pacientes via API: "${normalizedQuery}"`)

      // Llamar a la API del servidor
      const response = await $fetch('/api/patients/search', {
        method: 'GET',
        query: { q: normalizedQuery }
      })

      if (!response.success) {
        throw new Error('Error al buscar pacientes')
      }

      const pacientesEncontrados = response.data as PacienteBusqueda[]

      pacientes.value = pacientesEncontrados

      // Guardar en cache
      cache.value.set(normalizedQuery, pacientesEncontrados)

      // Limpiar cache después de expiry time
      setTimeout(() => {
        cache.value.delete(normalizedQuery)
      }, cacheExpiry)

      agendaLogger.info('search', `Pacientes encontrados: ${pacientesEncontrados.length}`)

    } catch (err: any) {
      const errorMsg = err.data?.message || err.message || 'Error al buscar pacientes'
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

      agendaLogger.debug('create', 'Creando paciente rápido via API', params)

      // Validaciones básicas del cliente
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

      // Llamar a la API del servidor para crear paciente
      const response = await $fetch('/api/patients/create', {
        method: 'POST',
        body: {
          nombre_completo: params.nombre_completo.trim(),
          email: params.email.trim().toLowerCase(),
          telefono: params.telefono?.trim() || null,
          fecha_nacimiento: params.fecha_nacimiento || null,
          observaciones: params.observaciones?.trim() || null
        }
      })

      if (!response.success) {
        throw new Error(response.message || 'Error al crear paciente')
      }

      // Transformar a PacienteBusqueda
      const pacienteBusqueda: PacienteBusqueda = {
        id: response.data.id,
        nombre_completo: response.data.nombre_completo,
        email: response.data.email,
        telefono: response.data.telefono,
        fecha_nacimiento: response.data.fecha_nacimiento,
        bonos_activos: 0,
        sesiones_restantes_total: 0,
        proximo_vencimiento: null,
        bono_activo: null,
        bonos: []
      }

      // Agregar a la lista local
      pacientes.value.unshift(pacienteBusqueda)

      // Invalidar cache
      cache.value.clear()

      agendaLogger.info('create', `Paciente creado: ${pacienteBusqueda.id}`)

      return {
        success: true,
        data: pacienteBusqueda
      }

    } catch (err: any) {
      const errorMsg = err.data?.message || err.message || 'Error al crear paciente'
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
