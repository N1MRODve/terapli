<template>
  <div>
    <!-- Header minimalista -->
    <header class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <!-- Título con contador del filtro activo -->
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">
            Pacientes
            <span class="text-gray-400 font-normal">({{ contadorFiltroActivo }})</span>
          </h1>
        </div>

        <!-- Botones de acción compactos -->
        <div class="flex items-center gap-2">
          <button
            @click="abrirModalImportar"
            class="min-h-[40px] px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
            aria-label="Importar pacientes"
          >
            <ArrowUpTrayIcon class="w-4 h-4" aria-hidden="true" />
            <span class="hidden sm:inline">Importar</span>
          </button>

          <button
            @click="abrirModalExportar"
            class="min-h-[40px] px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
            aria-label="Exportar pacientes"
          >
            <ArrowDownTrayIcon class="w-4 h-4" aria-hidden="true" />
            <span class="hidden sm:inline">Exportar</span>
          </button>

          <button
            @click="abrirModalNuevoPaciente"
            class="min-h-[40px] px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
            aria-label="Añadir nuevo paciente"
          >
            <PlusIcon class="w-4 h-4" aria-hidden="true" />
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      <!-- Buscador y filtros -->
      <div class="space-y-4">
        <!-- Buscador -->
        <div class="relative">
          <input
            v-model="busquedaDebounced"
            @input="handleBusquedaInput"
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            class="w-full h-11 px-4 pl-10 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm placeholder-gray-400"
            aria-label="Buscar pacientes"
          />
          <MagnifyingGlassIcon class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <button
            v-if="busqueda"
            @click="busqueda = ''; busquedaDebounced = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
            aria-label="Limpiar búsqueda"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Tabs de estado con underline -->
        <div class="flex items-center justify-between border-b border-gray-100">
          <nav class="flex gap-1 -mb-px" role="tablist">
            <button
              v-for="filtro in filtrosEstadoConContadores"
              :key="filtro.valor"
              @click="estadoSeleccionado = filtro.valor"
              class="px-4 py-2.5 text-sm font-medium transition-colors relative"
              :class="estadoSeleccionado === filtro.valor
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-gray-700'"
              :aria-selected="estadoSeleccionado === filtro.valor"
              role="tab"
            >
              <span>{{ filtro.label }}</span>
              <span class="ml-1.5 text-xs" :class="estadoSeleccionado === filtro.valor ? 'text-purple-500' : 'text-gray-400'">
                {{ filtro.count }}
              </span>
              <!-- Underline activo -->
              <span
                v-if="estadoSeleccionado === filtro.valor"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full"
              ></span>
            </button>
          </nav>

          <!-- Botón de filtros avanzados -->
          <button
            @click="mostrarFiltrosAvanzados = !mostrarFiltrosAvanzados"
            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="hayFiltrosActivos
              ? 'text-purple-600 bg-purple-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
          >
            <FunnelIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Filtros</span>
            <span
              v-if="contadorFiltrosActivos > 0"
              class="w-5 h-5 flex items-center justify-center text-xs font-semibold bg-purple-600 text-white rounded-full"
            >
              {{ contadorFiltrosActivos }}
            </span>
            <ChevronDownIcon
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': mostrarFiltrosAvanzados }"
            />
          </button>
        </div>

        <!-- Panel de filtros avanzados (colapsable) -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="mostrarFiltrosAvanzados" class="bg-gray-50 rounded-lg p-4">
            <div class="flex flex-wrap items-center gap-3">
              <!-- Filtro por área -->
              <select
                v-model="areaSeleccionada"
                class="h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
                aria-label="Filtrar por área"
              >
                <option value="">Todas las áreas</option>
                <option v-for="area in areasDisponibles" :key="area" :value="area">
                  {{ area }}
                </option>
              </select>

              <!-- Chips de filtros -->
              <button
                @click="toggleFiltro('sinProximaCita')"
                class="h-9 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
                :class="filtrosActivos.sinProximaCita
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'"
              >
                <CalendarDaysIcon class="w-4 h-4" />
                Sin próxima cita
              </button>

              <button
                @click="toggleFiltro('sinSesionRegistrada')"
                class="h-9 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
                :class="filtrosActivos.sinSesionRegistrada
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'"
              >
                <ClipboardDocumentListIcon class="w-4 h-4" />
                Sin sesión
              </button>

              <button
                @click="toggleFiltro('requiereAtencion')"
                class="h-9 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
                :class="filtrosActivos.requiereAtencion
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'"
              >
                <ExclamationTriangleIcon class="w-4 h-4" />
                Requiere atención
              </button>

              <!-- Limpiar filtros -->
              <button
                v-if="hayFiltrosActivos"
                @click="limpiarFiltrosAvanzados"
                class="h-9 px-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </header>

    <!-- Lista de pacientes -->
    <section>
      <!-- Estado de carga -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-20"
        role="status"
      >
        <div class="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-sm text-gray-500">Cargando pacientes...</p>
      </div>

      <!-- Estado vacío -->
      <div
        v-else-if="pacientesFiltrados.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <UserGroupIcon class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">
          {{ tieneAlgunFiltro ? 'Sin resultados' : 'Sin pacientes' }}
        </h3>
        <p class="text-sm text-gray-500 mb-4 max-w-sm">
          {{ tieneAlgunFiltro
            ? 'Prueba ajustando los filtros de búsqueda'
            : 'Comienza añadiendo tu primer paciente' }}
        </p>
        <button
          v-if="!tieneAlgunFiltro"
          @click="abrirModalNuevoPaciente"
          class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Añadir paciente
        </button>
        <button
          v-else
          @click="limpiarTodosFiltros"
          class="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Grid de pacientes -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
        role="list"
      >
        <div
          v-for="paciente in pacientesFiltrados"
          :key="paciente.id"
          class="relative group"
          @click="irAFichaPaciente(paciente.id)"
          @keydown.enter="irAFichaPaciente(paciente.id)"
          role="listitem"
        >
          <PacienteCard
            :paciente="paciente"
            @editar="abrirModalEditar"
            @eliminar="abrirModalEliminar"
            @ver-citas="verCitasPaciente"
            @gestionar-bonos="gestionarBonosPaciente"
            @editar-cita="abrirModalEditarCita"
          />

          <!-- Botón Asignar Cita -->
          <button
            v-if="paciente.activo && !paciente.en_pausa"
            @click.stop="abrirModalAsignarCita(paciente)"
            class="absolute bottom-4 right-4 h-9 px-3 bg-purple-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-purple-700 transition-all flex items-center gap-1.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto z-10"
            :aria-label="`Asignar cita a ${paciente.nombre}`"
          >
            <CalendarDaysIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Cita</span>
          </button>
        </div>
      </div>

      <!-- Footer con contador -->
      <footer
        v-if="pacientesFiltrados.length > 0"
        class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500"
      >
        <span>
          {{ pacientesFiltrados.length === totalPacientes
            ? `${totalPacientes} pacientes`
            : `${pacientesFiltrados.length} de ${totalPacientes} pacientes` }}
        </span>
      </footer>
    </section>

    <!-- Modales -->
    <ModalNuevaCita
      :mostrar="mostrarModalAsignarCita"
      :paciente-preseleccionado="pacienteSeleccionadoCita"
      @cerrar="cerrarModalAsignarCita"
      @cita-creada="manejarCitaCreada"
    />

    <ModalNuevoPaciente
      :mostrar="mostrarModalNuevo"
      @cerrar="cerrarModalNuevo"
      @paciente-creado="manejarPacienteCreado"
    />

    <ModalEditarPaciente
      :mostrar="mostrarModalEditar"
      :paciente="pacienteSeleccionado"
      @cerrar="cerrarModalEditar"
      @paciente-actualizado="manejarPacienteActualizado"
    />

    <ModalEliminarPaciente
      :mostrar="mostrarModalEliminar"
      :paciente="pacienteSeleccionado"
      @cerrar="cerrarModalEliminar"
      @paciente-eliminado="manejarPacienteEliminado"
      @paciente-desactivado="manejarPacienteDesactivado"
    />

    <ModalEditarCita
      :isOpen="mostrarModalEditarCita"
      :citaId="citaIdSeleccionada"
      @close="cerrarModalEditarCita"
      @actualizado="handleCitaActualizada"
    />

    <ToastContainer />

    <PatientsImportModal
      v-model="mostrarModalImportar"
      :existing-patients="pacientes"
      @import-complete="handleImportComplete"
    />

    <PatientsExportModal
      v-model="mostrarModalExportar"
      :total-patients="totalPacientes"
      :filtered-count="pacientesFiltrados.length"
      :has-filters="hayFiltrosActivos || estadoSeleccionado !== 'todos' || busqueda !== ''"
      :current-filters="filtrosActualesParaExport"
    />
  </div>
</template>

<script setup>
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'terapeuta'
})

const router = useRouter()
const supabase = useSupabaseClient()
const { getUserId, waitForUser } = useSupabase()
const user = useSupabaseUser()
const toast = useToast()

// Estado de modales
const mostrarModalNuevo = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalEliminar = ref(false)
const mostrarModalAsignarCita = ref(false)
const mostrarModalEditarCita = ref(false)
const mostrarModalImportar = ref(false)
const mostrarModalExportar = ref(false)
const citaIdSeleccionada = ref(null)
const pacienteSeleccionado = ref(null)
const pacienteSeleccionadoCita = ref(null)

// Estado principal
const pacientes = ref([])
const loading = ref(true)
const busqueda = ref('')
const busquedaDebounced = ref('')
const estadoSeleccionado = ref('todos')
const areaSeleccionada = ref('')
const mostrarFiltrosAvanzados = ref(false)
const filtrosActivos = ref({
  sinProximaCita: false,
  sinSesionRegistrada: false,
  requiereAtencion: false
})

// Debounce para búsqueda
let debounceTimeout = null
const handleBusquedaInput = (event) => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    busqueda.value = event.target.value
  }, 300)
}

// Filtros de estado
const filtrosEstado = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'activo', label: 'Activos' },
  { valor: 'pausa', label: 'En pausa' },
  { valor: 'finalizado', label: 'Finalizados' }
]

// Contadores
const contadores = computed(() => ({
  activos: pacientes.value.filter(p => p.activo && !p.en_pausa).length,
  enPausa: pacientes.value.filter(p => p.activo && p.en_pausa).length,
  finalizados: pacientes.value.filter(p => !p.activo).length
}))

const filtrosEstadoConContadores = computed(() => {
  return filtrosEstado.map(filtro => {
    let count = 0
    if (filtro.valor === 'todos') count = pacientes.value.length
    else if (filtro.valor === 'activo') count = contadores.value.activos
    else if (filtro.valor === 'pausa') count = contadores.value.enPausa
    else if (filtro.valor === 'finalizado') count = contadores.value.finalizados
    return { ...filtro, count }
  })
})

// Contador del filtro activo (para el header)
const contadorFiltroActivo = computed(() => {
  const filtro = filtrosEstadoConContadores.value.find(f => f.valor === estadoSeleccionado.value)
  return filtro?.count || 0
})

// Áreas disponibles
const areasDisponibles = computed(() => {
  const areas = new Set(
    pacientes.value.map(p => p.area_de_acompanamiento).filter(Boolean)
  )
  return Array.from(areas).sort()
})

// Verificar filtros activos
const hayFiltrosActivos = computed(() => {
  return areaSeleccionada.value !== '' ||
    filtrosActivos.value.sinProximaCita ||
    filtrosActivos.value.sinSesionRegistrada ||
    filtrosActivos.value.requiereAtencion
})

const contadorFiltrosActivos = computed(() => {
  let count = 0
  if (areaSeleccionada.value) count++
  if (filtrosActivos.value.sinProximaCita) count++
  if (filtrosActivos.value.sinSesionRegistrada) count++
  if (filtrosActivos.value.requiereAtencion) count++
  return count
})

const tieneAlgunFiltro = computed(() => {
  return hayFiltrosActivos.value || busqueda.value || estadoSeleccionado.value !== 'todos'
})

// Funciones de filtros
const toggleFiltro = (filtro) => {
  filtrosActivos.value[filtro] = !filtrosActivos.value[filtro]
}

const limpiarFiltrosAvanzados = () => {
  areaSeleccionada.value = ''
  filtrosActivos.value = {
    sinProximaCita: false,
    sinSesionRegistrada: false,
    requiereAtencion: false
  }
}

const limpiarTodosFiltros = () => {
  limpiarFiltrosAvanzados()
  estadoSeleccionado.value = 'todos'
  busqueda.value = ''
  busquedaDebounced.value = ''
}

// Cargar pacientes
const cargarPacientes = async () => {
  loading.value = true
  try {
    const userId = getUserId()
    if (!userId) {
      loading.value = false
      return
    }

    const { data: pacientesData, error: pacientesError } = await supabase
      .from('pacientes')
      .select(`
        id,
        created_at,
        activo,
        email,
        nombre_completo,
        telefono,
        area_de_acompanamiento,
        frecuencia,
        metadata
      `)
      .eq('terapeuta_id', userId)
      .order('created_at', { ascending: false })

    if (pacientesError) throw pacientesError

    const pacientesEnriquecidos = await Promise.all(
      pacientesData.map(async (paciente) => {
        const { data: ultimaCita } = await supabase
          .from('citas')
          .select('fecha_cita')
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')
          .order('fecha_cita', { ascending: false })
          .limit(1)
          .maybeSingle()

        const { data: proximaCita } = await supabase
          .from('citas')
          .select('id, fecha_cita, hora_inicio')
          .eq('paciente_id', paciente.id)
          .in('estado', ['pendiente', 'confirmada'])
          .gte('fecha_cita', new Date().toISOString().split('T')[0])
          .order('fecha_cita', { ascending: true })
          .order('hora_inicio', { ascending: true })
          .limit(1)
          .maybeSingle()

        const { count: totalSesiones } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')

        let bonoActivo = null
        try {
          const { data: bonoData } = await supabase
            .from('bonos')
            .select('id, tipo, estado, sesiones_totales, sesiones_restantes, fecha_fin, created_at')
            .eq('paciente_id', paciente.id)
            .in('estado', ['activo', 'pendiente'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          bonoActivo = bonoData
        } catch (error) {
          console.warn('[Bonos] Error:', error)
        }

        let sesionesCompletadasBono = 0
        let totalSesionesBono = 0
        if (bonoActivo) {
          totalSesionesBono = bonoActivo.sesiones_totales
          sesionesCompletadasBono = totalSesionesBono - bonoActivo.sesiones_restantes
        }

        const hace7Dias = new Date()
        hace7Dias.setDate(hace7Dias.getDate() - 7)

        const { data: emocionesRecientes } = await supabase
          .from('metricas_bienestar')
          .select('estado_animo, nivel_energia, nivel_estres')
          .eq('paciente_id', paciente.id)
          .gte('fecha', hace7Dias.toISOString())

        let estadoEmocionalPromedio = 3
        let requiereAtencion = false
        let evolucionPorcentaje = 50

        if (emocionesRecientes && emocionesRecientes.length > 0) {
          const promedioAnimo = emocionesRecientes.reduce((sum, e) => sum + e.estado_animo, 0) / emocionesRecientes.length
          estadoEmocionalPromedio = promedioAnimo
          evolucionPorcentaje = Math.round((promedioAnimo / 10) * 100)

          const ultimosTres = emocionesRecientes.slice(-3)
          if (ultimosTres.length >= 3) {
            requiereAtencion = ultimosTres.every(e => e.estado_animo <= 4)
          }
        }

        const nombreCompleto = paciente.nombre_completo ||
          paciente.metadata?.nombre_completo ||
          paciente.email

        return {
          id: paciente.id,
          nombre: nombreCompleto,
          email: paciente.email,
          telefono: paciente.telefono,
          activo: paciente.activo,
          en_pausa: paciente.metadata?.en_pausa || false,
          area_de_acompanamiento: paciente.area_de_acompanamiento,
          frecuencia: paciente.frecuencia,
          ultima_sesion: ultimaCita?.fecha_cita || null,
          proxima_sesion: proximaCita ? `${proximaCita.fecha_cita}T${proximaCita.hora_inicio}` : null,
          proxima_cita_id: proximaCita?.id || null,
          total_sesiones: totalSesiones || 0,
          estado_emocional_promedio: estadoEmocionalPromedio,
          evolucion_porcentaje: evolucionPorcentaje,
          requiere_atencion: requiereAtencion,
          created_at: paciente.created_at,
          bono_activo: bonoActivo ? {
            tipo: bonoActivo.tipo,
            estado: bonoActivo.estado,
            fecha_fin: bonoActivo.fecha_fin,
            sesiones_completadas: sesionesCompletadasBono,
            sesiones_totales: totalSesionesBono,
            sesiones_restantes: bonoActivo.sesiones_restantes
          } : null
        }
      })
    )

    pacientes.value = pacientesEnriquecidos
  } catch (error) {
    console.error('Error al cargar pacientes:', error)
    toast.error('Error al cargar los pacientes')
  } finally {
    loading.value = false
  }
}

// Filtrar pacientes
const pacientesFiltrados = computed(() => {
  let resultado = pacientes.value

  if (busqueda.value) {
    const busquedaLower = busqueda.value.toLowerCase()
    resultado = resultado.filter(p => {
      const nombre = (p.nombre || '').toLowerCase()
      const email = (p.email || '').toLowerCase()
      const telefono = (p.telefono || '').toLowerCase()
      return nombre.includes(busquedaLower) ||
        email.includes(busquedaLower) ||
        telefono.includes(busquedaLower)
    })
  }

  if (estadoSeleccionado.value !== 'todos') {
    resultado = resultado.filter(p => {
      if (estadoSeleccionado.value === 'activo') return p.activo && !p.en_pausa
      if (estadoSeleccionado.value === 'pausa') return p.activo && p.en_pausa
      if (estadoSeleccionado.value === 'finalizado') return !p.activo
      return true
    })
  }

  if (areaSeleccionada.value) {
    resultado = resultado.filter(p => p.area_de_acompanamiento === areaSeleccionada.value)
  }

  if (filtrosActivos.value.sinProximaCita) {
    resultado = resultado.filter(p => !p.proxima_sesion)
  }

  if (filtrosActivos.value.sinSesionRegistrada) {
    resultado = resultado.filter(p => !p.ultima_sesion)
  }

  if (filtrosActivos.value.requiereAtencion) {
    resultado = resultado.filter(p => p.requiere_atencion)
  }

  return resultado
})

const totalPacientes = computed(() => pacientes.value.length)

// Navegación
const irAFichaPaciente = (id) => {
  router.push(`/terapeuta/pacientes/${id}`)
}

// Gestión de modales
const abrirModalNuevoPaciente = () => { mostrarModalNuevo.value = true }
const cerrarModalNuevo = () => { mostrarModalNuevo.value = false }

const abrirModalEditar = (paciente) => {
  pacienteSeleccionado.value = paciente
  mostrarModalEditar.value = true
}
const cerrarModalEditar = () => {
  mostrarModalEditar.value = false
  pacienteSeleccionado.value = null
}

const abrirModalEliminar = (paciente) => {
  pacienteSeleccionado.value = paciente
  mostrarModalEliminar.value = true
}
const cerrarModalEliminar = () => {
  mostrarModalEliminar.value = false
  pacienteSeleccionado.value = null
}

const manejarPacienteCreado = async () => {
  await cargarPacientes()
  toast.success('Paciente creado')
}

const manejarPacienteActualizado = async () => {
  await cargarPacientes()
  toast.success('Paciente actualizado')
}

const manejarPacienteEliminado = async (pacienteId) => {
  pacientes.value = pacientes.value.filter(p => p.id !== pacienteId)
  toast.success('Paciente eliminado')
}

const manejarPacienteDesactivado = async () => {
  await cargarPacientes()
  toast.success('Paciente desactivado')
}

// Modal asignar cita
const abrirModalAsignarCita = (paciente) => {
  pacienteSeleccionadoCita.value = paciente
  mostrarModalAsignarCita.value = true
}
const cerrarModalAsignarCita = () => {
  mostrarModalAsignarCita.value = false
  pacienteSeleccionadoCita.value = null
}
const manejarCitaCreada = async () => {
  await cargarPacientes()
  cerrarModalAsignarCita()
  toast.success('Cita asignada')
}

// Ver citas y gestionar bonos
const verCitasPaciente = (paciente) => {
  router.push(`/agenda?paciente=${paciente.id}`)
}
const gestionarBonosPaciente = (paciente) => {
  router.push(`/terapeuta/pacientes/${paciente.id}/bonos`)
}

// Import/Export
const abrirModalImportar = () => { mostrarModalImportar.value = true }
const abrirModalExportar = () => { mostrarModalExportar.value = true }
const handleImportComplete = async () => {
  await cargarPacientes()
  toast.success('Importación completada')
}

const filtrosActualesParaExport = computed(() => {
  const filters = {}
  if (estadoSeleccionado.value !== 'todos') filters.estado = estadoSeleccionado.value
  if (areaSeleccionada.value) filters.area = areaSeleccionada.value
  return filters
})

// Modal editar cita
const abrirModalEditarCita = (citaId) => {
  citaIdSeleccionada.value = citaId
  mostrarModalEditarCita.value = true
}
const cerrarModalEditarCita = () => {
  mostrarModalEditarCita.value = false
  citaIdSeleccionada.value = null
}
const handleCitaActualizada = async () => {
  await cargarPacientes()
  cerrarModalEditarCita()
  toast.success('Cita actualizada')
}

// Lifecycle
onMounted(async () => {
  try {
    await waitForUser()
    const userId = getUserId()
    if (userId) {
      await cargarPacientes()
    } else {
      loading.value = false
    }
  } catch (error) {
    console.error('Error en onMounted:', error)
    loading.value = false
  }
})

watch(() => getUserId(), (newUserId) => {
  if (newUserId && pacientes.value.length === 0) {
    cargarPacientes()
  }
})
</script>
