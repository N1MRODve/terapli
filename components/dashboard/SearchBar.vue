<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: SearchBar
 * =============================================================================
 * Barra de búsqueda central del dashboard con autocompletado y resultados
 * segmentados: Pacientes, Sesiones próximas, Sesiones pasadas, Bonos, Pagos.
 */

const supabase = useSupabaseClient()
const router = useRouter()

// Estado del buscador
const query = ref('')
const isOpen = ref(false)
const isLoading = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

// Resultados segmentados
interface SearchResults {
  pacientes: Array<{ id: string; nombre: string; email?: string }>
  sesionesProximas: Array<{ id: string; paciente: string; fecha: string; hora: string }>
  sesionesPasadas: Array<{ id: string; paciente: string; fecha: string; hora: string }>
  bonos: Array<{ id: string; paciente: string; tipo: string; sesionesRestantes: number }>
  pagos: Array<{ id: string; paciente: string; monto: number; fecha: string }>
}

const results = ref<SearchResults>({
  pacientes: [],
  sesionesProximas: [],
  sesionesPasadas: [],
  bonos: [],
  pagos: []
})

// Debounce para búsqueda
let searchTimeout: NodeJS.Timeout | null = null

const handleInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (query.value.length < 2) {
    results.value = { pacientes: [], sesionesProximas: [], sesionesPasadas: [], bonos: [], pagos: [] }
    isOpen.value = false
    return
  }

  isLoading.value = true
  searchTimeout = setTimeout(async () => {
    await buscar()
  }, 300)
}

const buscar = async () => {
  if (query.value.length < 2) return

  try {
    const searchTerm = `%${query.value}%`
    const hoy = new Date().toISOString().split('T')[0]

    // Búsqueda paralela en todas las tablas
    const [pacientesRes, citasRes, bonosRes] = await Promise.all([
      // Pacientes
      supabase
        .from('pacientes')
        .select('id, nombre_completo, email')
        .or(`nombre_completo.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .eq('activo', true)
        .limit(5),

      // Citas (próximas y pasadas)
      supabase
        .from('citas')
        .select(`
          id,
          fecha_cita,
          hora_inicio,
          estado,
          pacientes (nombre_completo)
        `)
        .or(`estado.neq.cancelada`)
        .limit(10),

      // Bonos
      supabase
        .from('bonos')
        .select(`
          id,
          tipo,
          sesiones_restantes,
          pacientes (nombre_completo)
        `)
        .eq('estado', 'activo')
        .limit(5)
    ])

    // Procesar pacientes
    results.value.pacientes = (pacientesRes.data || []).map((p: any) => ({
      id: p.id,
      nombre: p.nombre_completo || 'Sin nombre',
      email: p.email
    }))

    // Filtrar citas por nombre de paciente si hay query
    const citasFiltradas = (citasRes.data || []).filter((c: any) =>
      c.pacientes?.nombre_completo?.toLowerCase().includes(query.value.toLowerCase())
    )

    // Separar próximas y pasadas
    results.value.sesionesProximas = citasFiltradas
      .filter((c: any) => c.fecha_cita >= hoy)
      .slice(0, 3)
      .map((c: any) => ({
        id: c.id,
        paciente: c.pacientes?.nombre_completo || 'Paciente',
        fecha: c.fecha_cita,
        hora: c.hora_inicio?.substring(0, 5) || '--:--'
      }))

    results.value.sesionesPasadas = citasFiltradas
      .filter((c: any) => c.fecha_cita < hoy)
      .slice(0, 3)
      .map((c: any) => ({
        id: c.id,
        paciente: c.pacientes?.nombre_completo || 'Paciente',
        fecha: c.fecha_cita,
        hora: c.hora_inicio?.substring(0, 5) || '--:--'
      }))

    // Filtrar bonos por nombre de paciente
    results.value.bonos = (bonosRes.data || [])
      .filter((b: any) =>
        b.pacientes?.nombre_completo?.toLowerCase().includes(query.value.toLowerCase())
      )
      .slice(0, 3)
      .map((b: any) => ({
        id: b.id,
        paciente: b.pacientes?.nombre_completo || 'Paciente',
        tipo: b.tipo || 'Bono',
        sesionesRestantes: b.sesiones_restantes || 0
      }))

    // Pagos: buscar en citas pagadas
    results.value.pagos = []

    isOpen.value = true
  } catch (error) {
    console.error('Error en búsqueda:', error)
  } finally {
    isLoading.value = false
  }
}

// Navegación
const navegarAPaciente = (id: string) => {
  if (!id) {
    console.error('[SearchBar] ERROR: ID de paciente no válido')
    return
  }
  cerrar()
  console.log('[SearchBar] Navegando a ficha de paciente:', id)
  navigateTo(`/terapeuta/pacientes/${id}`)
}

const navegarACita = (id: string) => {
  // Emitir evento para abrir modal de cita
  emit('abrir-cita', id)
  cerrar()
}

const navegarABono = (id: string) => {
  // Por ahora cerrar - se puede expandir
  cerrar()
}

const cerrar = () => {
  isOpen.value = false
  query.value = ''
}

// Contar resultados totales
const totalResultados = computed(() => {
  return results.value.pacientes.length +
    results.value.sesionesProximas.length +
    results.value.sesionesPasadas.length +
    results.value.bonos.length +
    results.value.pagos.length
})

const hayResultados = computed(() => totalResultados.value > 0)

// Formatear fecha
const formatearFecha = (fecha: string) => {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

// Emit para abrir cita
const emit = defineEmits<{
  (e: 'abrir-cita', id: string): void
}>()

// Cerrar al hacer clic fuera
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.search-container')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Atajos de teclado
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    cerrar()
  }
}
</script>

<template>
  <div class="search-container relative w-full max-w-xl">
    <!-- Input de búsqueda -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          :class="['w-5 h-5 transition-colors', isLoading ? 'text-violet-500 animate-pulse' : 'text-gray-400']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        ref="inputRef"
        v-model="query"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="query.length >= 2 && (isOpen = true)"
        type="text"
        placeholder="Buscar paciente, sesión o bono..."
        class="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder-gray-400 transition-all"
      />
      <!-- Indicador de carga -->
      <div v-if="isLoading" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <div class="w-4 h-4 border-2 border-gray-200 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    </div>

    <!-- Dropdown de resultados -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen && query.length >= 2"
        class="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-[70vh] overflow-y-auto"
      >
        <!-- Sin resultados -->
        <div v-if="!isLoading && !hayResultados" class="p-4 text-center text-gray-500">
          <svg class="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm">No se encontraron resultados para "{{ query }}"</p>
        </div>

        <!-- Resultados -->
        <div v-else>
          <!-- Pacientes -->
          <div v-if="results.pacientes.length > 0" class="border-b border-gray-100">
            <div class="px-4 py-2 bg-gray-50">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pacientes</span>
            </div>
            <button
              v-for="paciente in results.pacientes"
              :key="paciente.id"
              @click="navegarAPaciente(paciente.id)"
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50 transition-colors text-left"
            >
              <div class="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ paciente.nombre }}</p>
                <p v-if="paciente.email" class="text-xs text-gray-500 truncate">{{ paciente.email }}</p>
              </div>
              <span class="text-xs text-violet-600 font-medium">Ver ficha</span>
            </button>
          </div>

          <!-- Sesiones próximas -->
          <div v-if="results.sesionesProximas.length > 0" class="border-b border-gray-100">
            <div class="px-4 py-2 bg-gray-50">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sesiones próximas</span>
            </div>
            <button
              v-for="sesion in results.sesionesProximas"
              :key="sesion.id"
              @click="navegarACita(sesion.id)"
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50 transition-colors text-left"
            >
              <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ sesion.paciente }}</p>
                <p class="text-xs text-gray-500">{{ formatearFecha(sesion.fecha) }} · {{ sesion.hora }}</p>
              </div>
              <span class="text-xs text-emerald-600 font-medium">Ver cita</span>
            </button>
          </div>

          <!-- Sesiones pasadas -->
          <div v-if="results.sesionesPasadas.length > 0" class="border-b border-gray-100">
            <div class="px-4 py-2 bg-gray-50">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sesiones pasadas</span>
            </div>
            <button
              v-for="sesion in results.sesionesPasadas"
              :key="sesion.id"
              @click="navegarACita(sesion.id)"
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ sesion.paciente }}</p>
                <p class="text-xs text-gray-500">{{ formatearFecha(sesion.fecha) }} · {{ sesion.hora }}</p>
              </div>
              <span class="text-xs text-gray-500 font-medium">Ver historial</span>
            </button>
          </div>

          <!-- Bonos -->
          <div v-if="results.bonos.length > 0">
            <div class="px-4 py-2 bg-gray-50">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bonos</span>
            </div>
            <button
              v-for="bono in results.bonos"
              :key="bono.id"
              @click="navegarABono(bono.id)"
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-left"
            >
              <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ bono.paciente }}</p>
                <p class="text-xs text-gray-500">{{ bono.tipo }} · {{ bono.sesionesRestantes }} sesiones restantes</p>
              </div>
              <span class="text-xs text-amber-600 font-medium">Ver bono</span>
            </button>
          </div>
        </div>

        <!-- Footer con atajo -->
        <div class="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span class="text-xs text-gray-400">{{ totalResultados }} resultado{{ totalResultados !== 1 ? 's' : '' }}</span>
          <span class="text-xs text-gray-400">ESC para cerrar</span>
        </div>
      </div>
    </Transition>
  </div>
</template>
