<template>
  <div>
    <!-- Header with counters -->
    <header class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 class="text-3xl font-serif font-bold text-cafe mb-1">
            Pacientes
          </h1>
          <div class="flex flex-wrap items-center gap-2 text-sm text-cafe/60">
            <span>Activos: <strong class="text-cafe font-semibold">{{ contadores.activos }}</strong></span>
            <span class="text-gray-300">·</span>
            <span>En pausa: <strong class="text-cafe font-semibold">{{ contadores.enPausa }}</strong></span>
            <span class="text-gray-300">·</span>
            <span>Finalizados: <strong class="text-cafe font-semibold">{{ contadores.finalizados }}</strong></span>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex flex-wrap gap-2">
          <button
            @click="abrirModalImportar"
            class="min-h-[44px] px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 whitespace-nowrap font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Importar pacientes"
          >
            <ArrowUpTrayIcon class="w-5 h-5" aria-hidden="true" />
            <span>Importar</span>
          </button>

          <button
            @click="abrirModalExportar"
            class="min-h-[44px] px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 whitespace-nowrap font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Exportar pacientes"
          >
            <ArrowDownTrayIcon class="w-5 h-5" aria-hidden="true" />
            <span>Exportar</span>
          </button>

          <button
            @click="abrirModalNuevoPaciente"
            class="min-h-[44px] px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-all flex items-center gap-2 whitespace-nowrap font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Añadir nuevo paciente"
          >
            <span class="text-lg leading-none">+</span>
            <span>Nuevo Paciente</span>
          </button>
        </div>
      </div>

      <!-- Buscador y filtros unificados -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <!-- Buscador principal -->
        <div class="mb-4">
          <div class="relative">
            <input
              v-model="busquedaDebounced"
              @input="handleBusquedaInput"
              type="text"
              placeholder="Buscar paciente por nombre o email..."
              class="min-h-[44px] w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-600 focus:ring-2 focus:ring-purple-300/20 focus:bg-white transition-all text-cafe placeholder-gray-400"
              aria-label="Buscar pacientes"
            />
            <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></MagnifyingGlassIcon>
          </div>
        </div>

        <!-- Filtros de estado como chips interactivos -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wide">
            <span>Estado</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="filtro in filtrosEstadoConContadores"
              :key="filtro.valor"
              @click="estadoSeleccionado = filtro.valor"
              class="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              :class="estadoSeleccionado === filtro.valor
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'"
              :aria-pressed="estadoSeleccionado === filtro.valor"
              :aria-label="`Filtrar por ${filtro.label.toLowerCase()}: ${filtro.count} pacientes`"
            >
              <span>{{ filtro.label }}</span>
              <span
                class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="estadoSeleccionado === filtro.valor
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-600'"
              >
                {{ filtro.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Filtros avanzados -->
        <div class="mt-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">
            <span>Filtros Avanzados</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <!-- Filtro por área -->
            <select
              v-model="areaSeleccionada"
              class="min-h-[44px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-cafe focus:border-purple-600 focus:ring-2 focus:ring-purple-300/20 transition-all"
              aria-label="Filtrar por área de acompañamiento"
            >
              <option value="">Todas las áreas</option>
              <option v-for="area in areasDisponibles" :key="area" :value="area">
                {{ area }}
              </option>
            </select>

            <!-- Sin próxima cita -->
            <button
              @click="toggleFiltro('sinProximaCita')"
              class="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              :class="filtrosActivos.sinProximaCita
                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'"
              :aria-pressed="filtrosActivos.sinProximaCita"
              aria-label="Filtrar pacientes sin próxima cita programada"
            >
              <CalendarDaysIcon class="w-4 h-4" aria-hidden="true"></CalendarDaysIcon>
              <span>Sin próxima cita</span>
            </button>

            <!-- Sin sesión registrada -->
            <button
              @click="toggleFiltro('sinSesionRegistrada')"
              class="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              :class="filtrosActivos.sinSesionRegistrada
                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'"
              :aria-pressed="filtrosActivos.sinSesionRegistrada"
              aria-label="Filtrar pacientes sin sesión registrada"
            >
              <ClipboardDocumentListIcon class="w-4 h-4" aria-hidden="true"></ClipboardDocumentListIcon>
              <span>Sin sesión registrada</span>
            </button>

            <!-- Requiere atención -->
            <button
              @click="toggleFiltro('requiereAtencion')"
              class="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              :class="filtrosActivos.requiereAtencion
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'"
              :aria-pressed="filtrosActivos.requiereAtencion"
              aria-label="Filtrar pacientes que requieren atención"
            >
              <ExclamationTriangleIcon class="w-4 h-4" aria-hidden="true"></ExclamationTriangleIcon>
              <span>Requiere atención</span>
            </button>

            <!-- Limpiar filtros -->
            <button
              v-if="hayFiltrosActivos"
              @click="limpiarFiltros"
              class="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-all text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Limpiar todos los filtros"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Lista de pacientes -->
    <section>
      <!-- Estado de carga -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-16"
        role="status"
        aria-live="polite"
      >
        <div
          class="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mb-6"
          aria-hidden="true"
        ></div>
        <p class="text-gray-500 font-medium">Cargando pacientes...</p>
      </div>

      <!-- Estado vacío -->
      <div
        v-else-if="pacientesFiltrados.length === 0"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <UserGroupIcon class="w-20 h-20 mx-auto mb-6 text-gray-300" aria-hidden="true"></UserGroupIcon>
        <h3 class="text-xl font-serif font-semibold text-cafe mb-3">
          {{ hayFiltrosActivos || busqueda || estadoSeleccionado !== 'todos'
            ? 'No se encontraron pacientes'
            : 'Aún no tienes pacientes registrados' }}
        </h3>
        <p class="text-gray-500 mb-6 max-w-md mx-auto">
          {{ hayFiltrosActivos || busqueda || estadoSeleccionado !== 'todos'
            ? 'Intenta ajustar los filtros de búsqueda para encontrar lo que buscas'
            : 'Comienza añadiendo tu primer paciente para gestionar su proceso terapéutico' }}
        </p>
        <button
          v-if="!hayFiltrosActivos && !busqueda && estadoSeleccionado === 'todos'"
          @click="abrirModalNuevoPaciente"
          class="min-h-[44px] px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-all font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          aria-label="Añadir tu primer paciente"
        >
          + Añadir Primer Paciente
        </button>
        <button
          v-else
          @click="limpiarFiltros"
          class="min-h-[44px] px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Limpiar todos los filtros de búsqueda"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Grid de pacientes -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        role="list"
        aria-label="Lista de pacientes"
      >
        <div
          v-for="paciente in pacientesFiltrados"
          :key="paciente.id"
          class="relative group cursor-pointer"
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
          ></PacienteCard>

          <!-- Botón flotante "Asignar Cita" - Visible al hover en desktop -->
          <button
            v-if="paciente.activo && !paciente.en_pausa"
            @click.stop="abrirModalAsignarCita(paciente)"
            class="hidden md:flex absolute bottom-4 right-4 min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-purple-600 to-rosa text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 items-center gap-2 z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto focus:outline-none focus:ring-2 focus:ring-purple-300"
            :aria-label="`Asignar nueva cita a ${paciente.nombre}`"
          >
            <CalendarDaysIcon class="w-4 h-4" aria-hidden="true"></CalendarDaysIcon>
            <span>Asignar Cita</span>
          </button>

          <!-- Versión visible siempre en móvil -->
          <button
            v-if="paciente.activo && !paciente.en_pausa"
            @click.stop="abrirModalAsignarCita(paciente)"
            class="md:hidden absolute bottom-4 right-4 min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-purple-600 to-rosa text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 z-10 focus:outline-none focus:ring-2 focus:ring-purple-300"
            :aria-label="`Asignar nueva cita a ${paciente.nombre}`"
          >
            <CalendarDaysIcon class="w-4 h-4" aria-hidden="true"></CalendarDaysIcon>
            <span>Asignar Cita</span>
          </button>
        </div>
      </div>

      <!-- Paginación (si es necesaria) -->
      <footer
        v-if="pacientesFiltrados.length > 0"
        class="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4"
        role="contentinfo"
      >
        <p class="text-sm text-gray-500" aria-live="polite">
          Mostrando {{ pacientesFiltrados.length }} de {{ totalPacientes }} pacientes
        </p>
        <div v-if="totalPacientes > pacientesFiltrados.length" class="flex gap-2">
          <button
            class="min-h-[44px] px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Ver más pacientes"
          >
            Ver más
          </button>
        </div>
      </footer>
    </section>

    <!-- Modal Asignar Cita -->
    <ModalNuevaCita
      :mostrar="mostrarModalAsignarCita"
      :paciente-preseleccionado="pacienteSeleccionadoCita"
      @cerrar="cerrarModalAsignarCita"
      @cita-creada="manejarCitaCreada"
    ></ModalNuevaCita>

    <!-- Modal Nuevo Paciente -->
    <ModalNuevoPaciente
      :mostrar="mostrarModalNuevo"
      @cerrar="cerrarModalNuevo"
      @paciente-creado="manejarPacienteCreado"
    ></ModalNuevoPaciente>

    <!-- Modal Editar Paciente -->
    <ModalEditarPaciente
      :mostrar="mostrarModalEditar"
      :paciente="pacienteSeleccionado"
      @cerrar="cerrarModalEditar"
      @paciente-actualizado="manejarPacienteActualizado"
    ></ModalEditarPaciente>

    <!-- Modal Eliminar Paciente -->
    <ModalEliminarPaciente
      :mostrar="mostrarModalEliminar"
      :paciente="pacienteSeleccionado"
      @cerrar="cerrarModalEliminar"
      @paciente-eliminado="manejarPacienteEliminado"
      @paciente-desactivado="manejarPacienteDesactivado"
    ></ModalEliminarPaciente>

    <!-- Modal Editar Cita -->
    <ModalEditarCita
      :isOpen="mostrarModalEditarCita"
      :citaId="citaIdSeleccionada"
      @close="cerrarModalEditarCita"
      @actualizado="handleCitaActualizada"
    ></ModalEditarCita>

    <!-- Toast notifications -->
    <ToastContainer />

    <!-- Modal Importar Pacientes -->
    <PatientsImportModal
      v-model="mostrarModalImportar"
      :existing-patients="pacientes"
      @import-complete="handleImportComplete"
    />

    <!-- Modal Exportar Pacientes -->
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
import { MagnifyingGlassIcon, UserGroupIcon, CalendarDaysIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon, ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'terapeuta'
})

const router = useRouter()
const supabase = useSupabaseClient()
const { getUserId, waitForUser } = useSupabase()
const user = useSupabaseUser()
const toast = useToast()

// Log inicial del estado del usuario
console.log('[Pacientes] Estado inicial del usuario:', {
  existe: !!user.value,
  id: getUserId(),
  email: user.value?.email
})

// Watch para detectar cambios en el usuario
watch(user, (newUser, oldUser) => {
  console.log('[Pacientes] Usuario cambió:', {
    antes: oldUser?.email || 'null',
    ahora: newUser?.email || 'null',
    id: getUserId()
  })
})

// Estado del modal
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

// Estado
const pacientes = ref([])
const loading = ref(true)
const busqueda = ref('')
const busquedaDebounced = ref('')
const estadoSeleccionado = ref('todos')
const areaSeleccionada = ref('')
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

// Filtros disponibles
const filtrosEstado = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'activo', label: 'Activos' },
  { valor: 'pausa', label: 'En pausa' },
  { valor: 'finalizado', label: 'Finalizados' }
]

// Contadores dinámicos
const contadores = computed(() => {
  return {
    activos: pacientes.value.filter(p => p.activo && !p.en_pausa).length,
    enPausa: pacientes.value.filter(p => p.activo && p.en_pausa).length,
    finalizados: pacientes.value.filter(p => !p.activo).length
  }
})

// Filtros de estado con contadores
const filtrosEstadoConContadores = computed(() => {
  return filtrosEstado.map(filtro => {
    let count = 0
    if (filtro.valor === 'todos') {
      count = pacientes.value.length
    } else if (filtro.valor === 'activo') {
      count = contadores.value.activos
    } else if (filtro.valor === 'pausa') {
      count = contadores.value.enPausa
    } else if (filtro.valor === 'finalizado') {
      count = contadores.value.finalizados
    }
    return { ...filtro, count }
  })
})

// Áreas disponibles (dinámicamente extraídas de los pacientes)
const areasDisponibles = computed(() => {
  const areas = new Set(
    pacientes.value
      .map(p => p.area_de_acompanamiento)
      .filter(Boolean)
  )
  return Array.from(areas).sort()
})

// Verificar si hay filtros activos
const hayFiltrosActivos = computed(() => {
  return areaSeleccionada.value !== '' ||
    filtrosActivos.value.sinProximaCita ||
    filtrosActivos.value.sinSesionRegistrada ||
    filtrosActivos.value.requiereAtencion
})

// Toggle filtros avanzados
const toggleFiltro = (filtro) => {
  filtrosActivos.value[filtro] = !filtrosActivos.value[filtro]
}

// Limpiar todos los filtros
const limpiarFiltros = () => {
  areaSeleccionada.value = ''
  filtrosActivos.value = {
    sinProximaCita: false,
    sinSesionRegistrada: false,
    requiereAtencion: false
  }
  estadoSeleccionado.value = 'todos'
  busqueda.value = ''
  busquedaDebounced.value = ''
}

// Cargar pacientes desde Supabase
const cargarPacientes = async () => {
  loading.value = true
  try {
    const userId = getUserId()
    console.log('[Pacientes] Iniciando carga de pacientes...')
    console.log('[Pacientes] Usuario actual:', {
      existe: !!user.value,
      id: userId,
      email: user.value?.email
    })
    
    // Verificar que el usuario esté autenticado
    if (!userId) {
      console.error('[Pacientes] Usuario no autenticado')
      loading.value = false
      return
    }

    console.log('✅ [Pacientes] Usuario verificado, consultando database...')
    
    // Obtener pacientes del terapeuta autenticado
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

    // Enriquecer datos con información de citas y emociones
    const pacientesEnriquecidos = await Promise.all(
      pacientesData.map(async (paciente) => {
        // Obtener última sesión (de tabla 'citas')
        const { data: ultimaCita } = await supabase
          .from('citas')
          .select('fecha_cita')
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')
          .order('fecha_cita', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Obtener próxima sesión (de tabla 'citas')
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

        // Contar total de sesiones (de tabla 'citas')
        const { count: totalSesiones } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')

        // Obtener bono activo o pendiente (con manejo seguro de errores)
        let bonoActivo = null
        try {
          // Primero buscar todos los bonos del paciente para debug
          const { data: todosLosBonos } = await supabase
            .from('bonos')
            .select('id, tipo, estado, sesiones_totales, sesiones_restantes, fecha_fin, created_at')
            .eq('paciente_id', paciente.id)
            .order('created_at', { ascending: false })

          console.log(`[Bonos] Paciente ${paciente.nombre_completo}:`, todosLosBonos)

          const { data: bonoData, error: bonoError } = await supabase
            .from('bonos')
            .select('id, tipo, estado, sesiones_totales, sesiones_restantes, fecha_fin, created_at')
            .eq('paciente_id', paciente.id)
            .in('estado', ['activo', 'pendiente'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (bonoError) {
            console.warn('[Bonos] Error en consulta:', bonoError.message)
          } else {
            bonoActivo = bonoData
            console.log(`✅ [Bonos] Bono activo encontrado:`, bonoActivo)
          }
        } catch (error) {
          console.warn('[Bonos] Error inesperado:', error)
        }

        // Contar sesiones completadas desde la última renovación de bono
        let sesionesCompletadasBono = 0
        let totalSesionesBono = 0
        if (bonoActivo) {
          totalSesionesBono = bonoActivo.sesiones_totales
          sesionesCompletadasBono = totalSesionesBono - bonoActivo.sesiones_restantes
        }

        // Obtener promedio emocional de últimos 7 días
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
          evolucionPorcentaje = Math.round((promedioAnimo / 10) * 100) // Estado de ánimo es 1-10
          
          // Detectar si requiere atención (3 o más registros bajos consecutivos)
          const ultimosTres = emocionesRecientes.slice(-3)
          if (ultimosTres.length >= 3) {
            requiereAtencion = ultimosTres.every(e => e.estado_animo <= 4) // Bajo es 4 o menos en escala 1-10
          }
        }

        // Obtener el nombre completo del paciente
        const nombreCompleto = paciente.nombre_completo || 
                              paciente.metadata?.nombre_completo ||
                              paciente.email

        return {
          id: paciente.id,
          nombre: nombreCompleto,
          apellidos: '', // Deprecado - ya no se usa
          email: paciente.email,
          telefono: paciente.telefono,
          activo: paciente.activo,
          en_pausa: paciente.metadata?.en_pausa || false,
          area_de_acompanamiento: paciente.area_de_acompanamiento,
          frecuencia: paciente.frecuencia,
          ultima_sesion: ultimaCita?.fecha_cita || null,
          proxima_sesion: proximaCita ? `${proximaCita.fecha_cita}T${proximaCita.hora_inicio}` : null,
          proxima_cita_id: proximaCita?.id || null, // ID de la próxima cita para edición
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
    toast.error('Error al cargar los pacientes. Por favor, recarga la página.')
  } finally {
    loading.value = false
  }
}

// Filtrar pacientes
const pacientesFiltrados = computed(() => {
  let resultado = pacientes.value

  // Filtrar por búsqueda
  if (busqueda.value) {
    const busquedaLower = busqueda.value.toLowerCase()
    resultado = resultado.filter(p => {
      // Buscar en el nombre completo del paciente
      const nombreCompleto = (p.nombre || '').toLowerCase()
      return nombreCompleto.includes(busquedaLower) ||
             (p.email || '').toLowerCase().includes(busquedaLower)
    })
  }

  // Filtrar por estado
  if (estadoSeleccionado.value !== 'todos') {
    resultado = resultado.filter(p => {
      if (estadoSeleccionado.value === 'activo') {
        return p.activo && !p.en_pausa
      } else if (estadoSeleccionado.value === 'pausa') {
        return p.activo && p.en_pausa
      } else if (estadoSeleccionado.value === 'finalizado') {
        return !p.activo
      }
      return true
    })
  }

  // Filtrar por área
  if (areaSeleccionada.value) {
    resultado = resultado.filter(p => p.area_de_acompanamiento === areaSeleccionada.value)
  }

  // Filtros avanzados
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

// Gestión del modal
const abrirModalNuevoPaciente = () => {
  mostrarModalNuevo.value = true
}

const cerrarModalNuevo = () => {
  mostrarModalNuevo.value = false
}

const abrirModalEditar = (paciente) => {
  console.log('Abriendo modal de edición para:', paciente)
  pacienteSeleccionado.value = paciente
  mostrarModalEditar.value = true
}

const cerrarModalEditar = () => {
  mostrarModalEditar.value = false
  pacienteSeleccionado.value = null
}

const abrirModalEliminar = (paciente) => {
  console.log('Abriendo modal de eliminación para:', paciente)
  pacienteSeleccionado.value = paciente
  mostrarModalEliminar.value = true
}

const cerrarModalEliminar = () => {
  mostrarModalEliminar.value = false
  pacienteSeleccionado.value = null
}

const manejarPacienteCreado = async (nuevoPaciente) => {
  console.log('Nuevo paciente creado:', nuevoPaciente)

  // Recargar la lista de pacientes
  await cargarPacientes()

  // Mostrar notificación de éxito
  toast.success('Paciente creado exitosamente')
}

const manejarPacienteActualizado = async (pacienteActualizado) => {
  console.log('Paciente actualizado:', pacienteActualizado)

  // Recargar la lista de pacientes
  await cargarPacientes()

  // Mostrar notificación de éxito
  toast.success('Información del paciente actualizada correctamente')
}

const manejarPacienteEliminado = async (pacienteId) => {
  console.log('Paciente eliminado:', pacienteId)

  // Eliminar de la lista local
  pacientes.value = pacientes.value.filter(p => p.id !== pacienteId)

  // Mostrar notificación de éxito
  toast.success('Paciente eliminado exitosamente')
}

const manejarPacienteDesactivado = async (pacienteId) => {
  console.log('Paciente desactivado:', pacienteId)

  // Recargar la lista de pacientes
  await cargarPacientes()

  // Mostrar notificación de éxito
  toast.success('Paciente desactivado correctamente')
}

// Gestión del modal de asignar cita
const abrirModalAsignarCita = (paciente) => {
  console.log('Abriendo modal de asignación de cita para:', paciente)
  pacienteSeleccionadoCita.value = paciente
  mostrarModalAsignarCita.value = true
}

const cerrarModalAsignarCita = () => {
  mostrarModalAsignarCita.value = false
  pacienteSeleccionadoCita.value = null
}

const manejarCitaCreada = async (nuevaCita) => {
  console.log('Nueva cita creada:', nuevaCita)

  // Recargar la lista de pacientes para actualizar próxima sesión y bonos
  await cargarPacientes()

  // Cerrar el modal
  cerrarModalAsignarCita()

  // Mostrar notificación de éxito
  toast.success('Cita asignada exitosamente')
}

// Función para ver las citas de un paciente
const verCitasPaciente = (paciente) => {
  // Redirigir a la nueva agenda con filtro de paciente
  router.push(`/agenda?paciente=${paciente.id}`)
}

// Función para gestionar bonos de un paciente
const gestionarBonosPaciente = (paciente) => {
  router.push(`/terapeuta/pacientes/${paciente.id}/bonos`)
}

// Gestión de modales de import/export
const abrirModalImportar = () => {
  mostrarModalImportar.value = true
}

const abrirModalExportar = () => {
  mostrarModalExportar.value = true
}

const handleImportComplete = async () => {
  // Reload patients after import
  await cargarPacientes()
  toast.success('Importación completada. Lista de pacientes actualizada.')
}

// Computed property for current filters in export format
const filtrosActualesParaExport = computed(() => {
  const filters = {}

  if (estadoSeleccionado.value !== 'todos') {
    filters.estado = estadoSeleccionado.value
  }

  if (areaSeleccionada.value) {
    filters.area = areaSeleccionada.value
  }

  return filters
})

// Gestión del modal de editar cita
const abrirModalEditarCita = (citaId) => {
  console.log('Abriendo modal de edición de cita:', citaId)
  citaIdSeleccionada.value = citaId
  mostrarModalEditarCita.value = true
}

const cerrarModalEditarCita = () => {
  mostrarModalEditarCita.value = false
  citaIdSeleccionada.value = null
}

const handleCitaActualizada = async () => {
  console.log('Cita actualizada, recargando pacientes...')

  // Recargar la lista de pacientes para actualizar próxima sesión
  await cargarPacientes()

  // Cerrar el modal
  cerrarModalEditarCita()

  // Mostrar notificación de éxito
  toast.success('Cita actualizada correctamente')
}

// Lifecycle
onMounted(async () => {
  console.log('[Pacientes] Componente montado')
  
  try {
    // Esperar a que el usuario y el perfil estén completamente cargados
    console.log('[Pacientes] Esperando a que el usuario esté disponible...')
    await waitForUser()
    
    const userId = getUserId()
    console.log('[Pacientes] Usuario después de waitForUser:', {
      existe: !!user.value,
      id: userId,
      email: user.value?.email
    })
    
    if (userId) {
      console.log('✅ [Pacientes] Usuario disponible, cargando pacientes...')
      await cargarPacientes()
    } else {
      console.error('❌ [Pacientes] No se pudo obtener el usuario autenticado')
      loading.value = false
    }
  } catch (error) {
    console.error('❌ [Pacientes] Error en onMounted:', error)
    loading.value = false
  }
})

// Watch para recargar si el usuario cambia
watch(() => getUserId(), (newUserId, oldUserId) => {
  console.log('[Pacientes] ID de usuario cambió:', {
    antes: oldUserId,
    ahora: newUserId
  })
  if (newUserId && pacientes.value.length === 0) {
    console.log('[Pacientes] Recargando pacientes por cambio de usuario...')
    cargarPacientes()
  }
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
