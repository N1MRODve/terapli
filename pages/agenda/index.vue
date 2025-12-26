<script setup lang="ts">
// =============================================================================
// PÁGINA: Agenda Nueva - Orquestador Principal
// =============================================================================
// Integra todos los componentes de agenda con lógica de negocio

definePageMeta({
  layout: 'terapeuta',
  middleware: 'auth'
})

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { VistaAgenda, FiltrosAgenda, AgendaEvent, TimeSlot } from '@/components/agenda/types'
import { hoy } from '@/components/agenda/types'
import { useAgenda } from '@/composables/useAgenda'
import { useCitas } from '@/composables/useCitas'
import AgendaHeader from '@/components/agenda/AgendaHeader.vue'
import AgendaFilters from '@/components/agenda/AgendaFilters.vue'
import AgendaLeyendaFiltrable from '@/components/agenda/AgendaLeyendaFiltrable.vue'
import AgendaGrid from '@/components/agenda/AgendaGrid.vue'
import AgendaTerapeuta from '@/components/AgendaTerapeuta.vue'
import ModalNuevaCita from '@/components/ModalNuevaCita.vue'
import ModalDetallesCita from '@/components/ModalDetallesCita.vue'

// =============================================================================
// Props y Setup
// =============================================================================
const props = defineProps<{
  legacyFallback?: boolean
}>()

const route = useRoute()
const router = useRouter()

// =============================================================================
// Composables
// =============================================================================
const {
  getCitasRango,
  getTerapeutaActual
} = useCitas()

const citasAgenda = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// =============================================================================
// State
// =============================================================================
const vista = ref<VistaAgenda>('semana')
const fechaActual = ref(new Date())
const darkMode = ref(false)
const filtros = ref<FiltrosAgenda>({})
const busqueda = ref('')

// Modales
const mostrarModalNueva = ref(false)
const mostrarModalDetalles = ref(false)
const citaSeleccionada = ref<string | null>(null)
const slotSeleccionado = ref<TimeSlot | null>(null)

// Menú contextual
const menuVisible = ref(false)
const menuPosicion = ref({ x: 0, y: 0 })
const eventoMenu = ref<string | null>(null)

// =============================================================================
// Computed - Eventos formateados para AgendaGrid
// =============================================================================
const eventosMapeados = computed((): AgendaEvent[] => {
  if (!citasAgenda.value?.length) return []
  
  return citasAgenda.value.map(cita => ({
    id: cita.cita_id || cita.id,
    pacienteNombre: cita.paciente_nombre || 'Sin paciente',
    pacienteId: cita.paciente_id,
    estado: cita.estado as AgendaEvent['estado'],
    fecha: cita.fecha_cita,
    horaInicio: cita.hora_inicio?.substring(0, 5) || cita.hora_inicio, // Normalizar HH:MM:SS a HH:MM
    horaFin: cita.hora_fin?.substring(0, 5) || cita.hora_fin,
    modalidad: cita.modalidad as AgendaEvent['modalidad'],
    bono: cita.bono_id ? {
      id: cita.bono_id,
      sesionesRestantes: cita.bono_sesiones_restantes,
      sesionesTotales: cita.bono_sesiones_totales
    } : null,
    terapeuta: cita.terapeuta_id ? {
      id: cita.terapeuta_id,
      nombre: cita.terapeuta_nombre
    } : undefined,
    notas: cita.observaciones || undefined,
    areaTerapeutica: cita.paciente_area || undefined,
    tipoSesion: cita.tipo_sesion as AgendaEvent['tipoSesion'] || undefined
  }))
})

// Filtrado de eventos
const eventosFiltrados = computed(() => {
  let eventos = eventosMapeados.value

  // Filtro por búsqueda
  if (busqueda.value.trim()) {
    const query = busqueda.value.toLowerCase()
    eventos = eventos.filter(e => 
      e.pacienteNombre.toLowerCase().includes(query) ||
      e.terapeuta?.nombre.toLowerCase().includes(query) ||
      e.notas?.toLowerCase().includes(query)
    )
  }

  // Filtro por estados
  if (filtros.value.estados?.length) {
    eventos = eventos.filter(e => filtros.value.estados!.includes(e.estado))
  }

  // Filtro por terapeuta
  if (filtros.value.terapeutaId) {
    eventos = eventos.filter(e => e.terapeuta?.id === filtros.value.terapeutaId)
  }

  // Filtro por paciente
  if (filtros.value.pacienteId) {
    eventos = eventos.filter(e => e.pacienteId === filtros.value.pacienteId)
  }

  // Filtro por modalidad
  if (filtros.value.modalidad) {
    eventos = eventos.filter(e => e.modalidad === filtros.value.modalidad)
  }

  // Filtro por rango de fechas
  if (filtros.value.fechaDesde) {
    eventos = eventos.filter(e => e.fecha >= filtros.value.fechaDesde!)
  }
  if (filtros.value.fechaHasta) {
    eventos = eventos.filter(e => e.fecha <= filtros.value.fechaHasta!)
  }

  return eventos
})

// Listas para filtros
// Nota: useAgenda no incluye objeto terapeuta, solo terapeuta_id
// Para mostrar terapeutas, necesitarías hacer query separado
const terapeutas = computed(() => {
  return [] // Sin join de terapeutas en useAgenda
})

const pacientes = computed(() => {
  const uniquePacientes = new Map()
  citasAgenda.value?.forEach(cita => {
    if (cita.paciente_id) {
      uniquePacientes.set(cita.paciente_id, {
        id: cita.paciente_id,
        nombre: cita.paciente_nombre || 'Sin nombre'
      })
    }
  })
  return Array.from(uniquePacientes.values())
})

// =============================================================================
// Lifecycle - Cargar datos y preferencias
// =============================================================================

// Función para cargar citas del rango visible
const cargarCitas = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Calcular rango de fechas según la vista
    const hoy = new Date()
    let fechaInicio: string
    let fechaFin: string
    
    if (vista.value === 'dia') {
      fechaInicio = fechaFin = fechaActual.value.toISOString().split('T')[0]!
    } else if (vista.value === '5dias') {
      // Vista 5 días: desde la fecha actual + 4 días
      fechaInicio = fechaActual.value.toISOString().split('T')[0]!
      const fin5Dias = new Date(fechaActual.value)
      fin5Dias.setDate(fin5Dias.getDate() + 4)
      fechaFin = fin5Dias.toISOString().split('T')[0]!
    } else if (vista.value === 'semana') {
      // Obtener inicio y fin de la semana actual
      const inicioSemana = new Date(fechaActual.value)
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
      fechaInicio = inicioSemana.toISOString().split('T')[0]!

      const finSemana = new Date(inicioSemana)
      finSemana.setDate(finSemana.getDate() + 6)
      fechaFin = finSemana.toISOString().split('T')[0]!
    } else {
      // Mes: cargar todo el mes
      const inicioMes = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth(), 1)
      const finMes = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth() + 1, 0)
      fechaInicio = inicioMes.toISOString().split('T')[0]!
      fechaFin = finMes.toISOString().split('T')[0]!
    }
    
    const citas = await getCitasRango(fechaInicio, fechaFin)
    
    // Filtrar citas canceladas y en borrador
    citasAgenda.value = citas.filter((cita: any) => 
      cita.estado !== 'cancelada' && 
      cita.estado !== 'borrador' &&
      cita.estado !== null
    )
  } catch (err: any) {
    console.error('❌ Error al cargar citas:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Cargar citas
  await cargarCitas()

  // Restaurar preferencias de localStorage
  if (process.client) {
    const savedVista = localStorage.getItem('agenda:vista')
    if (savedVista) vista.value = savedVista as VistaAgenda

    const savedDarkMode = localStorage.getItem('agenda:darkMode')
    if (savedDarkMode) darkMode.value = savedDarkMode === 'true'

    const savedFiltros = localStorage.getItem('agenda:filtros')
    if (savedFiltros) {
      try {
        filtros.value = JSON.parse(savedFiltros)
      } catch (e) {
        console.error('Error parsing saved filters', e)
      }
    }

    // Aplicar dark mode al DOM
    if (darkMode.value) {
      document.documentElement.classList.add('dark')
    }

    // 📡 ESCUCHAR EVENTOS GLOBALES DE ACTUALIZACIÓN DE CITAS
    window.addEventListener('citas:actualizadas', handleCitasActualizadas)
    console.log('✅ [Agenda] Listener de eventos globales registrado')
  }

  // Leer query params
  if (route.query.vista) {
    vista.value = route.query.vista as VistaAgenda
  }
  if (route.query.fecha) {
    fechaActual.value = new Date(route.query.fecha as string)
  }
  
  // 📌 FILTRAR POR PACIENTE SI VIENE EN QUERY PARAMS
  if (route.query.paciente) {
    filtros.value = {
      ...filtros.value,
      pacienteId: route.query.paciente as string
    }
    console.log('✅ [Agenda] Filtro de paciente aplicado:', route.query.paciente)
  }
})

// Limpiar listener al desmontar
onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('citas:actualizadas', handleCitasActualizadas)
    console.log('🧹 [Agenda] Listener de eventos globales removido')
  }
})

// Handler para actualización en tiempo real
function handleCitasActualizadas(event: Event) {
  const customEvent = event as CustomEvent
  console.log('📡 [Agenda] Evento recibido:', customEvent.detail)
  
  // Recargar citas automáticamente
  cargarCitas()
  
  // Mostrar notificación opcional
  if (customEvent.detail?.paciente_nombre) {
    console.log(`✅ Cita actualizada: ${customEvent.detail.paciente_nombre}`)
  }
}

// =============================================================================
// Watchers - Persistir preferencias y recargar datos
// =============================================================================
watch(vista, (newVista) => {
  if (process.client) {
    localStorage.setItem('agenda:vista', newVista)
    router.push({ query: { ...route.query, vista: newVista } })
  }
  // Recargar citas cuando cambia la vista
  cargarCitas()
})

watch(fechaActual, () => {
  // Recargar citas cuando cambia la fecha
  cargarCitas()
})

watch(fechaActual, (newFecha) => {
  if (process.client) {
    const fechaStr = newFecha.toISOString().split('T')[0]
    router.push({ query: { ...route.query, fecha: fechaStr } })
  }
})

watch(darkMode, (newDarkMode) => {
  if (process.client) {
    localStorage.setItem('agenda:darkMode', String(newDarkMode))
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
})

watch(filtros, (newFiltros) => {
  if (process.client) {
    localStorage.setItem('agenda:filtros', JSON.stringify(newFiltros))
  }
}, { deep: true })

// =============================================================================
// Handlers - Eventos de UI
// =============================================================================
const abrirModalNuevaCita = () => {
  slotSeleccionado.value = null
  mostrarModalNueva.value = true
}

const crearCitaEnSlot = (slot: TimeSlot) => {
  // Verificar si el slot está ocupado
  const slotOcupado = eventosFiltrados.value.some(evento => 
    evento.fecha === slot.date && 
    evento.horaInicio === slot.horaInicio
  )
  
  if (slotOcupado) {
    // Mostrar mensaje de que el horario está ocupado
    if (process.client) {
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-slide-in'
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <div class="font-semibold">Horario ocupado</div>
            <div class="text-sm opacity-90">Ya existe una cita en este horario</div>
          </div>
        </div>
      `
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.classList.add('animate-fade-out')
        setTimeout(() => toast.remove(), 300)
      }, 3000)
    }
    return
  }
  
  // Si está libre, abrir modal con slot preseleccionado
  slotSeleccionado.value = slot
  mostrarModalNueva.value = true
}

const abrirDetalles = (eventoId: string) => {
  citaSeleccionada.value = eventoId
  mostrarModalDetalles.value = true
}

const abrirMenu = (eventoId: string, event: MouseEvent) => {
  eventoMenu.value = eventoId
  menuPosicion.value = { x: event.clientX, y: event.clientY }
  menuVisible.value = true
}

const cerrarMenu = () => {
  menuVisible.value = false
  eventoMenu.value = null
}

const moverCita = async (eventoId: string, nuevoSlot: TimeSlot) => {
  try {
    // TODO: Implementar reprogramación de citas
    console.log('Reprogramar cita:', eventoId, nuevoSlot)
    await cargarCitas() // Recargar
  } catch (error) {
    console.error('Error al reprogramar cita:', error)
    alert('No se pudo reprogramar la cita. Intenta nuevamente.')
  }
}

// Cerrar menú al hacer click fuera
if (process.client) {
  document.addEventListener('click', () => {
    if (menuVisible.value) cerrarMenu()
  })
}

// =============================================================================
// Keyboard Shortcuts
// =============================================================================
// Función de navegación según vista
const navegarAnterior = () => {
  const fecha = new Date(fechaActual.value)
  switch (vista.value) {
    case 'dia':
      fecha.setDate(fecha.getDate() - 1)
      break
    case '5dias':
      fecha.setDate(fecha.getDate() - 5)
      break
    case 'semana':
      fecha.setDate(fecha.getDate() - 7)
      break
    case 'mes':
      fecha.setMonth(fecha.getMonth() - 1)
      break
  }
  fechaActual.value = fecha
}

const navegarSiguiente = () => {
  const fecha = new Date(fechaActual.value)
  switch (vista.value) {
    case 'dia':
      fecha.setDate(fecha.getDate() + 1)
      break
    case '5dias':
      fecha.setDate(fecha.getDate() + 5)
      break
    case 'semana':
      fecha.setDate(fecha.getDate() + 7)
      break
    case 'mes':
      fecha.setMonth(fecha.getMonth() + 1)
      break
  }
  fechaActual.value = fecha
}

if (process.client) {
  document.addEventListener('keydown', (e) => {
    // Ignorar si está en un input
    if ((e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA') return

    switch (e.key) {
      case 'ArrowLeft': // Navegación anterior
      case 'j':
        navegarAnterior()
        break
      case 'ArrowRight': // Navegación siguiente
      case 'k':
        navegarSiguiente()
        break
      case 't': // Hoy
        fechaActual.value = new Date()
        break
      case '1': // Vista día
        vista.value = 'dia'
        break
      case '2': // Vista semana
        vista.value = 'semana'
        break
      case '3': // Vista mes
        vista.value = 'mes'
        break
      case '4': // Vista 5 días
        vista.value = '5dias'
        break
      case 'n': // Nueva cita
        abrirModalNuevaCita()
        break
      case 'f': // Focus búsqueda
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()
        break
    }
  })
}
</script>

<template>
  <div>
    <!-- Fallback a vista legacy -->
    <AgendaTerapeuta v-if="legacyFallback" />

    <!-- Nueva vista de agenda - Diseño moderno -->
    <div v-else class="agenda-main-container" :class="{ 'dark': darkMode }">

    <!-- Header con navegación -->
    <AgendaHeader
      v-model:vista="vista"
      v-model:fechaActual="fechaActual"
      v-model:darkMode="darkMode"
      @nueva-cita="abrirModalNuevaCita"
    />

    <!-- Filtros -->
    <AgendaFilters
      v-model:filtros="filtros"
      @update:busqueda="busqueda = $event"
      :terapeutas="terapeutas"
      :pacientes="pacientes"
    />

    <!-- Leyenda Filtrable -->
    <div class="filter-section">
      <AgendaLeyendaFiltrable
        :citas="eventosMapeados"
        :filtros-activos="filtros.estados || []"
        @filtrar="(estados) => { filtros.estados = estados.length > 0 ? estados : undefined }"
      />
    </div>

    <!-- Grilla principal -->
    <AgendaGrid
      :eventos="eventosFiltrados"
      :vista="vista"
      :fechaActual="fechaActual"
      :cargando="loading"
      :draggable="true"
      @evento-click="abrirDetalles"
      @evento-menu="abrirMenu"
      @slot-click="crearCitaEnSlot"
      @evento-drop="moverCita"
    />

    <!-- Modales -->
    <ModalNuevaCita
      v-model="mostrarModalNueva"
      :fecha-preseleccionada="slotSeleccionado?.date"
      :hora-preseleccionada="slotSeleccionado?.horaInicio"
      @cita-creada="cargarCitas"
      @cerrar="mostrarModalNueva = false; slotSeleccionado = null"
    />

    <ModalDetallesCita
      :isOpen="mostrarModalDetalles"
      :citaId="citaSeleccionada"
      @close="mostrarModalDetalles = false; citaSeleccionada = null"
      @actualizado="cargarCitas"
      @eliminado="cargarCitas"
    />

    <!-- Menú contextual -->
    <Teleport to="body">
      <div
        v-if="menuVisible"
        :style="{ top: `${menuPosicion.y}px`, left: `${menuPosicion.x}px` }"
        class="fixed z-50 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px]"
        @click.stop
      >
        <button
          @click="abrirDetalles(eventoMenu!); cerrarMenu()"
          class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Ver detalles
        </button>
        <button
          @click="cerrarMenu()"
          class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Reprogramar
        </button>
        <button
          @click="cerrarMenu()"
          class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition text-red-600"
        >
          Cancelar cita
        </button>
      </div>
    </Teleport>

    <!-- Keyboard shortcuts hint (opcional) -->
    <div class="fixed bottom-4 right-4 bg-gray-900/90 dark:bg-gray-100/90 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-xs opacity-0 hover:opacity-100 transition-opacity">
      <kbd>←/→</kbd> navegar · <kbd>t</kbd> hoy · <kbd>1/2/3/4</kbd> vistas · <kbd>n</kbd> nueva · <kbd>f</kbd> buscar
    </div>

    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   MODERN MINIMALIST AGENDA CONTAINER
   ============================================================================ */

/* Contenedor principal - Diseño limpio y moderno */
.agenda-main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height en móviles */
  overflow: hidden;
  background-color: #FAFBFC;
}

.agenda-main-container.dark {
  background-color: #0F172A;
}

/* Sección de filtros - Fondo sutil con separación visual */
.filter-section {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.agenda-main-container.dark .filter-section {
  background: #1E293B;
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

/* Asegurar que el layout ocupe toda la altura */
.h-screen {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height en móviles */
}

/* Estilos para kbd */
kbd {
  @apply px-1.5 py-0.5 bg-white/20 rounded font-mono;
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animaciones para toast */
@keyframes slide-in {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fade-out {
  to {
    opacity: 0;
    transform: translateX(20px);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

.animate-fade-out {
  animation: fade-out 0.3s ease-in;
}
</style>
