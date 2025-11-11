<template>
  <div class="space-y-3">
    <!-- Header con filtros -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-2.5">
      <!-- Primera línea: Título + Controles principales -->
      <div class="flex items-center justify-between gap-3 mb-2">
        <div class="flex items-center gap-3">
          <h1 class="text-lg font-serif font-bold text-cafe">Agenda General</h1>
          <span class="text-xs text-gray-500">{{ formatearFechaLarga(fechaSeleccionada) }}</span>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Selector de vista -->
          <div class="flex bg-gray-100 rounded-lg p-0.5">
            <button
              @click="vista = 'dia'"
              class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
              :class="vista === 'dia' ? 'bg-white text-cafe shadow-sm' : 'text-gray-600 hover:text-cafe'"
            >
              Día
            </button>
            <button
              @click="vista = 'semana'"
              class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
              :class="vista === 'semana' ? 'bg-white text-cafe shadow-sm' : 'text-gray-600 hover:text-cafe'"
            >
              Semana
            </button>
            <button
              @click="vista = 'mes'"
              class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
              :class="vista === 'mes' ? 'bg-white text-cafe shadow-sm' : 'text-gray-600 hover:text-cafe'"
            >
              Mes
            </button>
          </div>

          <!-- Navegación de fecha -->
          <div class="flex items-center gap-1">
            <button
              @click="cambiarFecha(-1)"
              class="p-1 rounded hover:bg-gray-100 text-cafe text-sm"
              title="Anterior"
            >
              ←
            </button>
            <button
              @click="irHoy"
              class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-cafe transition-colors"
            >
              Hoy
            </button>
            <button
              @click="cambiarFecha(1)"
              class="p-1 rounded hover:bg-gray-100 text-cafe text-sm"
              title="Siguiente"
            >
              →
            </button>
          </div>

          <!-- Botón nueva cita -->
          <button
            @click="abrirModalNuevaCita"
            class="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors text-xs font-medium whitespace-nowrap"
          >
            + Nueva
          </button>
        </div>
      </div>

      <!-- Segunda línea: Filtros -->
      <div class="flex flex-wrap gap-2">
        <select
          v-model="filtroEstado"
          class="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-300/20"
        >
          <option value="">Todos estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="confirmada">Confirmadas</option>
          <option value="realizada">Realizadas</option>
          <option value="cancelada">Canceladas</option>
        </select>

        <select
          v-model="filtroModalidad"
          class="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-300/20"
        >
          <option value="">Modalidades</option>
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
        </select>

        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar paciente..."
          class="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-300/20 flex-1 min-w-[150px]"
        />
      </div>
    </div>

    <!-- Vista según selección -->
    <div v-if="cargando" class="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
      <div class="text-center text-gray-400">
        <span class="text-3xl block mb-2">⏳</span>
        <p class="text-sm">Cargando agenda...</p>
      </div>
    </div>

    <!-- Vista Día -->
    <div v-else-if="vista === 'dia'" class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col" style="height: calc(100vh - 180px);">
      <!-- Header del día (STICKY) -->
      <div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm p-2.5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-base text-cafe">
              {{ formatearFechaCompleta(fechaSeleccionada) }}
            </h3>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ citasFiltradas.length }} citas programadas
            </p>
          </div>
          <div class="text-xs text-gray-600">
            <span class="font-medium">{{ filtrosActivos() }}</span>
          </div>
        </div>
      </div>

      <!-- Contenido con scroll -->
      <div class="flex-1 overflow-y-auto">
        <div class="divide-y divide-gray-100">
          <div
            v-for="hora in horasDelDia"
            :key="hora"
            :data-hora="hora"
            class="flex hover:bg-gray-50 transition-colors"
          >
            <div class="w-16 p-2 text-xs font-medium text-gray-600 border-r border-gray-100 bg-gray-50 flex-shrink-0">
              {{ hora }}
            </div>
            <div 
              class="flex-1 p-2 cursor-pointer hover:bg-purple-600/5 transition-colors relative group/cell" 
              @click="citasPorHora(hora).length === 0 && abrirModalNuevaCita(fechaSeleccionada.toISOString().split('T')[0], hora)"
              @dragover="onDragOver($event, fechaSeleccionada.toISOString().split('T')[0], hora)"
              @dragleave="onDragLeave($event)"
              @drop="onDrop($event, fechaSeleccionada.toISOString().split('T')[0], hora)"
              :class="{ 'bg-purple-600/20 ring-2 ring-purple-300': esCeldaObjetivo(fechaSeleccionada.toISOString().split('T')[0], hora) }"
            >
              <!-- Indicador de celda vacía clicable -->
              <div 
                v-if="citasPorHora(hora).length === 0" 
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none"
              >
                <span class="text-[10px] text-purple-600 font-medium bg-white px-2 py-1 rounded-full shadow-sm">
                  + Agregar cita
                </span>
              </div>
              <div
                v-for="cita in citasPorHora(hora)"
                :key="cita.id"
                draggable="true"
                @dragstart="onDragStart($event, cita)"
                @dragend="onDragEnd($event)"
                class="mb-1.5 p-2 rounded-lg transition-all hover:shadow-md hover:ring-2 hover:ring-purple-300/30 group relative cursor-move"
                :class="getClasesCita(cita.estado)"
                @click.stop
                title="Arrastra para mover a otra hora/día"
              >
                <div class="flex items-start justify-between gap-2">
                  <!-- Indicador de arrastre -->
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <ArrowsPointingOutIcon class="w-3 h-3 text-gray-400" />
                  </div>
                  <div class="flex-1 cursor-pointer" @click="verDetallesCita(cita)">
                    <p class="font-medium text-xs">{{ cita.paciente_nombre }}</p>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="text-[10px] text-gray-600">
                        {{ cita.hora_inicio }} - {{ cita.hora_fin }}
                      </span>
                      <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-white/50">
                        {{ cita.modalidad }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span
                      class="text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
                      :class="getBadgeEstado(cita.estado)"
                    >
                      {{ getEstadoLabel(cita.estado) }}
                    </span>
                    <!-- Botón cancelar (solo si no está cancelada) -->
                    <button
                      v-if="cita.estado !== 'cancelada'"
                      @click.stop="abrirModalCancelar(cita)"
                      class="p-1 rounded hover:bg-red-100 text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Cancelar cita"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div
                v-if="citasPorHora(hora).length === 0"
                class="text-[10px] text-gray-400 italic"
              >
                Sin citas
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Semana -->
    <div v-else-if="vista === 'semana'" class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col" style="height: calc(100vh - 180px);">
      <div class="min-w-[800px] overflow-x-auto flex-1 flex flex-col">
        <!-- Encabezados de días (STICKY) -->
        <div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div class="grid grid-cols-8">
            <div class="p-1.5 border-r border-gray-200 bg-gray-50"></div>
            <div
              v-for="dia in diasSemana"
              :key="dia.fecha"
              class="p-1.5 text-center border-r border-gray-200 last:border-r-0"
              :class="esHoy(dia.fecha) ? 'bg-purple-600/10' : 'bg-white'"
            >
              <div class="flex items-center justify-center gap-1">
                <span class="text-[10px] font-medium text-gray-600 uppercase">{{ dia.nombreDia }}</span>
                <span class="text-base font-bold text-cafe" :class="esHoy(dia.fecha) ? 'text-purple-600' : ''">{{ dia.numeroDia }}</span>
              </div>
              <div class="text-[10px] text-gray-500">{{ dia.mes }}</div>
            </div>
          </div>
        </div>

        <!-- Grid de horas y citas (SCROLLABLE) -->
        <div class="flex-1 overflow-y-auto">
          <div class="divide-y divide-gray-100">
            <div
              v-for="hora in horasDelDia"
              :key="hora"
              :data-hora="hora"
              class="grid grid-cols-8"
            >
              <div class="p-2 text-xs font-medium text-gray-600 border-r border-gray-100 bg-gray-50 sticky left-0">
                {{ hora }}
              </div>
              <div
                v-for="dia in diasSemana"
                :key="`${dia.fecha}-${hora}`"
                class="p-1.5 border-r border-gray-100 last:border-r-0 hover:bg-purple-600/5 transition-colors min-h-[60px] cursor-pointer relative group/cell"
                :class="[
                  esHoy(dia.fecha) ? 'bg-purple-600/5' : '',
                  esCeldaObjetivo(dia.fecha, hora) ? 'bg-purple-600/20 ring-2 ring-purple-300 ring-inset' : ''
                ]"
                @click="citasPorDiaHora(dia.fecha, hora).length === 0 && abrirModalNuevaCita(dia.fecha, hora)"
                @dragover="onDragOver($event, dia.fecha, hora)"
                @dragleave="onDragLeave($event)"
                @drop="onDrop($event, dia.fecha, hora)"
              >
                <!-- Indicador de celda vacía clicable -->
                <div 
                  v-if="citasPorDiaHora(dia.fecha, hora).length === 0" 
                  class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none"
                >
                  <span class="text-[9px] text-purple-600 font-medium bg-white px-1.5 py-0.5 rounded-full shadow-sm">
                    +
                  </span>
                </div>
                <div
                  v-for="cita in citasPorDiaHora(dia.fecha, hora)"
                  :key="cita.id"
                  draggable="true"
                  @dragstart="onDragStart($event, cita)"
                  @dragend="onDragEnd($event)"
                  class="text-[10px] p-1.5 rounded mb-1 hover:shadow-md hover:ring-2 hover:ring-purple-300/30 transition-all group relative cursor-move"
                  :class="getClasesCita(cita.estado)"
                  @click.stop
                  title="Arrastra para mover"
                >
                  <div @click="verDetallesCita(cita)" class="cursor-pointer">
                    <p class="font-semibold truncate text-[11px]">{{ cita.paciente_nombre }}</p>
                    <p class="text-[9px] text-gray-600 mt-0.5">
                      {{ cita.hora_inicio.slice(0, 5) }}
                    </p>
                  </div>
                  <!-- Botón cancelar mini -->
                  <button
                    v-if="cita.estado !== 'cancelada'"
                    @click.stop="abrirModalCancelar(cita)"
                    class="absolute top-0.5 right-0.5 p-0.5 rounded hover:bg-red-100 text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Cancelar"
                  >
                    <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Mes (simplificada - lista por día) -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div
        v-for="dia in diasDelMes"
        :key="dia.fecha"
        v-show="citasPorDia(dia.fecha).length > 0"
        class="bg-white rounded-lg shadow-sm border border-gray-100 p-3"
      >
        <h3 class="font-semibold text-sm text-cafe mb-2 flex items-center justify-between">
          <span>{{ dia.nombreCompleto }}</span>
          <span class="text-xs text-gray-500">{{ citasPorDia(dia.fecha).length }} citas</span>
        </h3>
        <div class="space-y-1.5">
          <div
            v-for="cita in citasPorDia(dia.fecha)"
            :key="cita.id"
            class="p-2 rounded-lg transition-all hover:shadow-md group relative"
            :class="getClasesCita(cita.estado)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 cursor-pointer" @click="verDetallesCita(cita)">
                <p class="font-medium text-xs">{{ cita.paciente_nombre }}</p>
                <p class="text-[10px] text-gray-600 mt-0.5">
                  {{ cita.hora_inicio }} - {{ cita.hora_fin }} · {{ cita.modalidad }}
                </p>
              </div>
              <div class="flex items-center gap-1.5">
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  :class="getBadgeEstado(cita.estado)"
                >
                  {{ getEstadoLabel(cita.estado) }}
                </span>
                <!-- Botón cancelar -->
                <button
                  v-if="cita.estado !== 'cancelada'"
                  @click.stop="abrirModalCancelar(cita)"
                  class="p-1 rounded hover:bg-red-100 text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Cancelar cita"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="citasFiltradas.length === 0" class="col-span-full text-center py-8 text-gray-400">
        <span class="text-4xl block mb-3">📅</span>
        <p class="text-sm">No hay citas en este mes</p>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <h2 class="text-base font-serif font-bold text-cafe mb-3">
        Resumen de Citas
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="text-center p-3 bg-yellow-50 rounded-lg">
          <p class="text-xl font-bold text-yellow-700">{{ citasPorEstado.pendiente }}</p>
          <p class="text-[10px] text-yellow-600 mt-1">Pendientes</p>
        </div>
        <div class="text-center p-3 bg-green-50 rounded-lg">
          <p class="text-xl font-bold text-green-700">{{ citasPorEstado.confirmada }}</p>
          <p class="text-[10px] text-green-600 mt-1">Confirmadas</p>
        </div>
        <div class="text-center p-3 bg-blue-50 rounded-lg">
          <p class="text-xl font-bold text-blue-700">{{ citasPorEstado.realizada }}</p>
          <p class="text-[10px] text-blue-600 mt-1">Realizadas</p>
        </div>
        <div class="text-center p-3 bg-red-50 rounded-lg">
          <p class="text-xl font-bold text-red-700">{{ citasPorEstado.cancelada }}</p>
          <p class="text-[10px] text-red-600 mt-1">Canceladas</p>
        </div>
      </div>
    </div>

    <!-- Modal Nueva Cita -->
    <ModalNuevaCita
      v-if="mostrarModalNueva"
      :mostrar="mostrarModalNueva"
      :fecha-preseleccionada="fechaPreseleccionada"
      :hora-preseleccionada="horaPreseleccionada"
      @cerrar="mostrarModalNueva = false"
      @cita-creada="handleCitaCreada"
    />

    <!-- Modal Detalles Cita -->
    <ModalDetallesCita
      v-if="mostrarModalDetalles && citaSeleccionada"
      :cita-id="citaSeleccionada"
      @close="cerrarModalDetalles"
      @cita-actualizada="handleCitaActualizada"
      @cita-eliminada="handleCitaEliminada"
    />

    <!-- Modal Editar Cita -->
    <ModalEditarCita
      v-if="mostrarModalEditar && citaSeleccionada"
      :cita-id="citaSeleccionada"
      @close="cerrarModalEditar"
      @cita-actualizada="handleCitaActualizada"
    />

    <!-- Modal Cancelar Cita -->
    <ModalCancelarCita
      v-if="mostrarModalCancelar && citaParaCancelar"
      :cita="citaParaCancelar"
      :is-open="mostrarModalCancelar"
      @close="cerrarModalCancelar"
      @cancelada="handleCitaCancelada"
    />

    <!-- Confirmación de envío de recordatorios -->
    <div
      v-if="mostrarConfirmacionRecordatorios"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="mostrarConfirmacionRecordatorios = false"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div class="text-center mb-6">
          <span class="text-6xl block mb-4">💬</span>
          <h3 class="text-xl font-bold text-cafe mb-2">
            ¿Enviar Recordatorios?
          </h3>
          <p class="text-gray-600">
            Se enviará un mensaje de WhatsApp a los pacientes con citas programadas para hoy.
          </p>
          <p class="text-sm text-purple-600 mt-2">
            {{ citasHoyParaRecordatorio.length }} citas pendientes de recordatorio
          </p>
        </div>

        <div class="space-y-2 mb-6 max-h-48 overflow-y-auto">
          <div
            v-for="cita in citasHoyParaRecordatorio"
            :key="cita.id"
            class="flex items-center gap-2 p-2 bg-gray-50 rounded"
          >
            <span class="text-sm">✓</span>
            <span class="text-sm text-gray-700">{{ cita.paciente_nombre }}</span>
            <span class="text-xs text-gray-500 ml-auto">{{ cita.hora_inicio }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="mostrarConfirmacionRecordatorios = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmarEnvioRecordatorios"
            class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            :disabled="enviandoRecordatorios"
          >
            {{ enviandoRecordatorios ? 'Enviando...' : 'Enviar Ahora' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Botón flotante para ir a hora actual (solo en vista día y semana) -->
    <button
      v-if="vista !== 'mes'"
      @click="scrollToCurrentTime"
      class="fixed bottom-8 right-8 w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-600/90 transition-all hover:scale-110 flex items-center justify-center z-20 group"
      title="Ir a hora actual"
    >
      <ClockIcon class="w-6 h-6" />
      <span class="absolute -top-10 right-0 bg-cafe text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Hora actual
      </span>
    </button>
  </div>
</template>

<script setup>
import { ClockIcon, ArrowsPointingOutIcon } from '@heroicons/vue/24/outline'
import ModalNuevaCita from '@/components/ModalNuevaCita.vue'
import ModalDetallesCita from '@/components/ModalDetallesCita.vue'
import ModalEditarCita from '@/components/ModalEditarCita.vue'
import ModalCancelarCita from '@/components/ModalCancelarCita.vue'

const supabase = useSupabaseClient()
const router = useRouter()

definePageMeta({
  layout: 'coordinadora',
  middleware: ['auth', 'role-coordinadora']
})

// Estado
const vista = ref('semana')
const fechaSeleccionada = ref(new Date())
const cargando = ref(true)
const citas = ref([])
const filtroEstado = ref('')
const filtroModalidad = ref('')
const busqueda = ref('')
const mostrarModalNueva = ref(false)
const mostrarModalDetalles = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalCancelar = ref(false)
const citaSeleccionada = ref(null)
const citaParaCancelar = ref(null)
const mostrarConfirmacionRecordatorios = ref(false)
const enviandoRecordatorios = ref(false)
const fechaPreseleccionada = ref(null)
const horaPreseleccionada = ref(null)

// Estados para drag & drop
const citaArrastrada = ref(null)
const celdaObjetivo = ref(null)

// Composable de citas
const { actualizarCita } = useCitas()

// Horario laboral: 11:00 - 22:00 con descanso de 14:00 - 17:00
// Horas disponibles en la agenda
const horasDelDia = [
  // Mañana: 11:00 - 13:00 (antes del descanso)
  '11:00', '12:00', '13:00',
  // Descanso: 14:00 - 16:00 (no mostrar)
  // Tarde/Noche: 17:00 - 22:00 (después del descanso)
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
]

// Computed - Citas filtradas
const citasFiltradas = computed(() => {
  let resultado = citas.value

  // Filtro por estado
  if (filtroEstado.value) {
    resultado = resultado.filter(c => c.estado === filtroEstado.value)
  }

  // Filtro por modalidad
  if (filtroModalidad.value) {
    resultado = resultado.filter(c => c.modalidad === filtroModalidad.value)
  }

  // Filtro por búsqueda
  if (busqueda.value.trim()) {
    const query = busqueda.value.toLowerCase()
    resultado = resultado.filter(c =>
      c.paciente_nombre?.toLowerCase().includes(query)
    )
  }

  return resultado
})

// Computed - Citas por estado
const citasPorEstado = computed(() => {
  return {
    pendiente: citasFiltradas.value.filter(c => c.estado === 'pendiente').length,
    confirmada: citasFiltradas.value.filter(c => c.estado === 'confirmada').length,
    realizada: citasFiltradas.value.filter(c => c.estado === 'realizada').length,
    cancelada: citasFiltradas.value.filter(c => c.estado === 'cancelada').length
  }
})

// Computed - Citas de hoy para recordatorio
const citasHoyParaRecordatorio = computed(() => {
  const hoy = new Date().toISOString().split('T')[0]
  return citasFiltradas.value.filter(c =>
    c.fecha_cita === hoy &&
    (c.estado === 'pendiente' || c.estado === 'confirmada')
  )
})

// Computed - Días de la semana
const diasSemana = computed(() => {
  const inicio = new Date(fechaSeleccionada.value)
  inicio.setDate(inicio.getDate() - inicio.getDay()) // Domingo
  
  return Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(inicio)
    fecha.setDate(inicio.getDate() + i)
    return {
      fecha: fecha.toISOString().split('T')[0],
      nombreDia: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
      numeroDia: fecha.getDate(),
      mes: fecha.toLocaleDateString('es-ES', { month: 'short' })
    }
  })
})

// Computed - Días del mes
const diasDelMes = computed(() => {
  const año = fechaSeleccionada.value.getFullYear()
  const mes = fechaSeleccionada.value.getMonth()
  const primerDia = new Date(año, mes, 1)
  const ultimoDia = new Date(año, mes + 1, 0)
  
  const dias = []
  for (let dia = primerDia; dia <= ultimoDia; dia.setDate(dia.getDate() + 1)) {
    dias.push({
      fecha: new Date(dia).toISOString().split('T')[0],
      nombreCompleto: new Date(dia).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    })
  }
  return dias
})

// Funciones auxiliares
const formatearFechaLarga = (fecha) => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatearFechaCompleta = (fecha) => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const filtrosActivos = () => {
  const filtros = []
  if (filtroEstado.value) filtros.push(getEstadoLabel(filtroEstado.value))
  if (filtroModalidad.value) filtros.push(filtroModalidad.value)
  if (busqueda.value) filtros.push(`"${busqueda.value}"`)
  return filtros.length > 0 ? filtros.join(' · ') : 'Sin filtros'
}

const esHoy = (fecha) => {
  const hoy = new Date().toISOString().split('T')[0]
  return fecha === hoy
}

const cambiarFecha = (direccion) => {
  const nueva = new Date(fechaSeleccionada.value)
  if (vista.value === 'dia') {
    nueva.setDate(nueva.getDate() + direccion)
  } else if (vista.value === 'semana') {
    nueva.setDate(nueva.getDate() + (direccion * 7))
  } else {
    nueva.setMonth(nueva.getMonth() + direccion)
  }
  fechaSeleccionada.value = nueva
}

const irHoy = () => {
  fechaSeleccionada.value = new Date()
}

const scrollToCurrentTime = () => {
  const ahora = new Date()
  const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:00`
  
  // Buscar el elemento con la hora actual
  const elementoHora = document.querySelector(`[data-hora="${horaActual}"]`)
  if (elementoHora) {
    elementoHora.scrollIntoView({ behavior: 'smooth', block: 'center' })
  } else {
    // Si no existe, hacer scroll al centro aproximado (hora 12:00)
    const elementoCentro = document.querySelector('[data-hora="12:00"]')
    if (elementoCentro) {
      elementoCentro.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}

const citasPorHora = (hora) => {
  const fechaBuscar = fechaSeleccionada.value.toISOString().split('T')[0]
  return citasFiltradas.value.filter(c =>
    c.fecha_cita === fechaBuscar &&
    c.hora_inicio?.startsWith(hora)
  )
}

const citasPorDiaHora = (fecha, hora) => {
  return citasFiltradas.value.filter(c =>
    c.fecha_cita === fecha &&
    c.hora_inicio?.startsWith(hora)
  )
}

const citasPorDia = (fecha) => {
  return citasFiltradas.value.filter(c => c.fecha_cita === fecha)
}

const getClasesCita = (estado) => {
  const clases = {
    pendiente: 'bg-yellow-100 border-l-4 border-yellow-500',
    confirmada: 'bg-green-100 border-l-4 border-green-500',
    realizada: 'bg-blue-100 border-l-4 border-blue-500',
    cancelada: 'bg-red-100 border-l-4 border-red-500'
  }
  return clases[estado] || 'bg-gray-100 border-l-4 border-gray-500'
}

const getBadgeEstado = (estado) => {
  const badges = {
    pendiente: 'bg-yellow-200 text-yellow-800',
    confirmada: 'bg-green-200 text-green-800',
    realizada: 'bg-blue-200 text-blue-800',
    cancelada: 'bg-red-200 text-red-800'
  }
  return badges[estado] || 'bg-gray-200 text-gray-800'
}

const getEstadoLabel = (estado) => {
  const labels = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    realizada: 'Realizada',
    cancelada: 'Cancelada'
  }
  return labels[estado] || estado
}

// ============================================================================
// FUNCIONES DE DRAG & DROP
// ============================================================================

const onDragStart = (event, cita) => {
  citaArrastrada.value = cita
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/html', event.target.innerHTML)
  event.target.style.opacity = '0.5'
}

const onDragEnd = (event) => {
  event.target.style.opacity = '1'
  citaArrastrada.value = null
  celdaObjetivo.value = null
}

const onDragOver = (event, fecha, hora) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  celdaObjetivo.value = { fecha, hora }
}

const onDragLeave = (event) => {
  celdaObjetivo.value = null
}

const onDrop = async (event, fecha, hora) => {
  event.preventDefault()
  
  if (!citaArrastrada.value) return
  
  const cita = citaArrastrada.value
  const nuevaFecha = fecha
  const nuevaHora = hora
  
  // Verificar si la celda de destino está ocupada
  const citaEnDestino = citasFiltradas.value.find(c => 
    c.fecha_cita === nuevaFecha && 
    c.hora_inicio?.startsWith(nuevaHora) &&
    c.id !== cita.id
  )
  
  if (citaEnDestino) {
    mostrarNotificacion('Ya existe una cita en ese horario', 'error')
    citaArrastrada.value = null
    celdaObjetivo.value = null
    return
  }
  
  // Calcular hora_fin manteniendo la misma duración
  const calcularHoraFin = (horaInicio, horaFinOriginal) => {
    const [hInicio, mInicio] = horaInicio.split(':').map(Number)
    const [hFinOrig, mFinOrig] = horaFinOriginal.split(':').map(Number)
    
    const duracionMinutos = (hFinOrig * 60 + mFinOrig) - (parseInt(cita.hora_inicio.split(':')[0]) * 60 + parseInt(cita.hora_inicio.split(':')[1]))
    
    const totalMinutos = hInicio * 60 + mInicio + duracionMinutos
    const hFin = Math.floor(totalMinutos / 60)
    const mFin = totalMinutos % 60
    
    return `${String(hFin).padStart(2, '0')}:${String(mFin).padStart(2, '0')}:00`
  }
  
  const nuevaHoraFin = calcularHoraFin(nuevaHora, cita.hora_fin)
  
  // Actualizar la cita
  const resultado = await actualizarCita(cita.id, {
    fecha_cita: nuevaFecha,
    hora_inicio: `${nuevaHora}:00`,
    hora_fin: nuevaHoraFin
  })
  
  if (resultado.success) {
    await cargarCitas()
    mostrarNotificacion('Cita movida exitosamente', 'success')
  } else {
    mostrarNotificacion(resultado.error || 'Error al mover la cita', 'error')
  }
  
  citaArrastrada.value = null
  celdaObjetivo.value = null
}

const esCeldaObjetivo = (fecha, hora) => {
  return celdaObjetivo.value?.fecha === fecha && celdaObjetivo.value?.hora === hora
}

// ============================================================================
// ACCIONES DE MODALES
// ============================================================================

// Acciones de modales
const abrirModalNuevaCita = (fecha = null, hora = null) => {
  console.log('🎯 Abriendo modal nueva cita', { fecha, hora })
  
  // Si hay fecha y hora, pre-seleccionarlas
  if (fecha && hora) {
    fechaPreseleccionada.value = fecha
    horaPreseleccionada.value = hora
  } else {
    // Limpiar si no hay preselección
    fechaPreseleccionada.value = null
    horaPreseleccionada.value = null
  }
  
  mostrarModalNueva.value = true
  console.log('📋 mostrarModalNueva:', mostrarModalNueva.value)
}

const verDetallesCita = (cita) => {
  citaSeleccionada.value = cita.id
  mostrarModalDetalles.value = true
}

const cerrarModalDetalles = () => {
  mostrarModalDetalles.value = false
  citaSeleccionada.value = null
}

const cerrarModalEditar = () => {
  mostrarModalEditar.value = false
  citaSeleccionada.value = null
}

const abrirModalCancelar = (cita) => {
  citaParaCancelar.value = {
    id: cita.id,
    fecha_cita: cita.fecha_cita,
    hora_inicio: cita.hora_inicio,
    hora_fin: cita.hora_fin,
    bono_id: cita.bono_id,
    paciente_nombre: cita.paciente_nombre || 'Paciente',
    terapeuta_nombre: cita.terapeuta_nombre || 'Sin asignar',
    modalidad: cita.modalidad,
    estado: cita.estado
  }
  mostrarModalCancelar.value = true
}

const cerrarModalCancelar = () => {
  mostrarModalCancelar.value = false
  citaParaCancelar.value = null
}

const handleCitaCancelada = (resultado) => {
  cerrarModalCancelar()
  cargarCitas()
  
  const mensaje = resultado?.reintegrada 
    ? 'Cita cancelada y sesión reintegrada al bono' 
    : 'Cita cancelada exitosamente'
  
  mostrarNotificacion(mensaje, 'success')
}

const handleCitaCreada = () => {
  mostrarModalNueva.value = false
  cargarCitas()
  // Mostrar notificación de éxito
  mostrarNotificacion('Cita creada exitosamente', 'success')
}

const handleCitaActualizada = () => {
  cargarCitas()
  mostrarNotificacion('Cita actualizada exitosamente', 'success')
}

const handleCitaEliminada = () => {
  cerrarModalDetalles()
  cargarCitas()
  mostrarNotificacion('Cita eliminada exitosamente', 'success')
}

// Navegación a pacientes
const irAPacientes = () => {
  router.push('/coordinadora/pacientes')
}

// Sistema de recordatorios
const enviarRecordatorios = () => {
  if (citasHoyParaRecordatorio.value.length === 0) {
    mostrarNotificacion('No hay citas pendientes de recordatorio para hoy', 'info')
    return
  }
  mostrarConfirmacionRecordatorios.value = true
}

const confirmarEnvioRecordatorios = async () => {
  enviandoRecordatorios.value = true
  
  try {
    // Aquí iría la lógica para enviar recordatorios por WhatsApp
    // Por ahora simulamos el envío
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Actualizar estado de las citas a "confirmada" o marcar como recordatorio enviado
    for (const cita of citasHoyParaRecordatorio.value) {
      await supabase
        .from('citas')
        .update({ 
          recordatorio_enviado: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', cita.id)
    }
    
    mostrarConfirmacionRecordatorios.value = false
    mostrarNotificacion(
      `Recordatorios enviados a ${citasHoyParaRecordatorio.value.length} pacientes`,
      'success'
    )
    cargarCitas()
  } catch (error) {
    console.error('Error al enviar recordatorios:', error)
    mostrarNotificacion('Error al enviar recordatorios', 'error')
  } finally {
    enviandoRecordatorios.value = false
  }
}

// Sistema de notificaciones (simple)
const mostrarNotificacion = (mensaje, tipo = 'info') => {
  // Implementación simple usando alert por ahora
  // Puedes reemplazar esto con un componente toast más sofisticado
  const iconos = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  }
  
  console.log(`${iconos[tipo]} ${mensaje}`)
  
  // Podrías agregar aquí un sistema de toast/notificaciones
  if (tipo === 'success') {
    // Toast de éxito
  }
}

// Cargar citas
const cargarCitas = async () => {
  cargando.value = true
  
  try {
    let fechaInicio, fechaFin
    
    if (vista.value === 'dia') {
      fechaInicio = fechaSeleccionada.value.toISOString().split('T')[0]
      fechaFin = fechaInicio
    } else if (vista.value === 'semana') {
      const inicio = new Date(fechaSeleccionada.value)
      inicio.setDate(inicio.getDate() - inicio.getDay())
      const fin = new Date(inicio)
      fin.setDate(inicio.getDate() + 6)
      fechaInicio = inicio.toISOString().split('T')[0]
      fechaFin = fin.toISOString().split('T')[0]
    } else {
      const año = fechaSeleccionada.value.getFullYear()
      const mes = fechaSeleccionada.value.getMonth()
      fechaInicio = new Date(año, mes, 1).toISOString().split('T')[0]
      fechaFin = new Date(año, mes + 1, 0).toISOString().split('T')[0]
    }
    
    const { data, error } = await supabase
      .from('citas')
      .select(`
        id,
        fecha_cita,
        hora_inicio,
        hora_fin,
        modalidad,
        estado,
        observaciones,
        recordatorio_enviado,
        pacientes (
          nombre_completo,
          email,
          telefono
        )
      `)
      .gte('fecha_cita', fechaInicio)
      .lte('fecha_cita', fechaFin)
      .order('fecha_cita', { ascending: true })
      .order('hora_inicio', { ascending: true })
    
    if (error) throw error
    
    citas.value = (data || []).map(c => ({
      id: c.id,
      fecha_cita: c.fecha_cita,
      hora_inicio: c.hora_inicio?.substring(0, 5),
      hora_fin: c.hora_fin?.substring(0, 5),
      modalidad: c.modalidad || 'presencial',
      estado: c.estado,
      observaciones: c.observaciones,
      recordatorio_enviado: c.recordatorio_enviado,
      paciente_nombre: c.pacientes?.nombre_completo || c.pacientes?.email || 'Sin nombre',
      paciente_telefono: c.pacientes?.telefono
    }))
  } catch (error) {
    console.error('Error al cargar citas:', error)
    mostrarNotificacion('Error al cargar citas', 'error')
  } finally {
    cargando.value = false
  }
}

// Recargar al cambiar vista o fecha
watch([vista, fechaSeleccionada], () => {
  cargarCitas()
})

// Cargar datos al montar
onMounted(() => {
  cargarCitas()
})
</script>
