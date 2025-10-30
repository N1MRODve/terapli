<template>
  <div class="space-y-6">
    <!-- Header con filtros -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-serif font-bold text-cafe">Agenda General</h1>
          <p class="text-sm text-gray-600 mt-1">
            {{ formatearFechaLarga(fechaSeleccionada) }}
          </p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <!-- Selector de vista -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="vista = 'dia'"
              class="px-4 py-2 rounded text-sm font-medium transition-colors"
              :class="vista === 'dia' ? 'bg-white text-cafe shadow-sm' : 'text-gray-600 hover:text-cafe'"
            >
              Día
            </button>
            <button
              @click="vista = 'semana'"
              class="px-4 py-2 rounded text-sm font-medium transition-colors"
              :class="vista === 'semana' ? 'bg-white text-cafe shadow-sm' : 'text-gray-600 hover:text-cafe'"
            >
              Semana
            </button>
            <button
              @click="vista = 'mes'"
              class="px-4 py-2 rounded text-sm font-medium transition-colors"
              :class="vista === 'mes' ? 'bg-white text-cafe shadow-sm' : 'text-gray-600 hover:text-cafe'"
            >
              Mes
            </button>
          </div>

          <!-- Navegación de fecha -->
          <div class="flex items-center gap-2">
            <button
              @click="cambiarFecha(-1)"
              class="p-2 rounded-lg hover:bg-gray-100 text-cafe"
              title="Anterior"
            >
              ←
            </button>
            <button
              @click="irHoy"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-cafe transition-colors"
            >
              Hoy
            </button>
            <button
              @click="cambiarFecha(1)"
              class="p-2 rounded-lg hover:bg-gray-100 text-cafe"
              title="Siguiente"
            >
              →
            </button>
          </div>

          <!-- Botón nueva cita -->
          <button
            @click="abrirModalNuevaCita"
            class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors text-sm font-medium whitespace-nowrap"
          >
            + Nueva Cita
          </button>
        </div>
      </div>

      <!-- Filtros adicionales -->
      <div class="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
        <select
          v-model="filtroEstado"
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracota/20"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="confirmada">Confirmadas</option>
          <option value="completada">Completadas</option>
          <option value="cancelada">Canceladas</option>
        </select>

        <select
          v-model="filtroModalidad"
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracota/20"
        >
          <option value="">Todas las modalidades</option>
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
        </select>

        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar paciente..."
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracota/20 flex-1 min-w-[200px]"
        />
      </div>
    </div>

    <!-- Vista según selección -->
    <div v-if="cargando" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
      <div class="text-center text-gray-400">
        <span class="text-4xl block mb-2">⏳</span>
        <p>Cargando agenda...</p>
      </div>
    </div>

    <!-- Vista Día -->
    <div v-else-if="vista === 'dia'" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style="height: calc(100vh - 280px);">
      <!-- Header del día (STICKY) -->
      <div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-lg text-cafe">
              {{ formatearFechaCompleta(fechaSeleccionada) }}
            </h3>
            <p class="text-sm text-gray-500 mt-0.5">
              {{ citasFiltradas.length }} citas programadas
            </p>
          </div>
          <div class="text-sm text-gray-600">
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
            <div class="w-20 p-3 text-sm font-medium text-gray-600 border-r border-gray-100 bg-gray-50 flex-shrink-0">
              {{ hora }}
            </div>
            <div class="flex-1 p-3">
              <div
                v-for="cita in citasPorHora(hora)"
                :key="cita.id"
                @click="verDetallesCita(cita)"
                class="mb-2 p-3 rounded-lg cursor-pointer transition-all hover:shadow-md"
                :class="getClasesCita(cita.estado)"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <p class="font-medium text-sm">{{ cita.paciente_nombre }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs text-gray-600">
                        {{ cita.hora_inicio }} - {{ cita.hora_fin }}
                      </span>
                      <span class="text-xs px-2 py-0.5 rounded-full bg-white/50">
                        {{ cita.modalidad }}
                      </span>
                    </div>
                  </div>
                  <span
                    class="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap"
                    :class="getBadgeEstado(cita.estado)"
                  >
                    {{ getEstadoLabel(cita.estado) }}
                  </span>
                </div>
              </div>
              <div
                v-if="citasPorHora(hora).length === 0"
                class="text-xs text-gray-400 italic"
              >
                Sin citas
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Semana -->
    <div v-else-if="vista === 'semana'" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style="height: calc(100vh - 280px);">
      <div class="min-w-[800px] overflow-x-auto flex-1 flex flex-col">
        <!-- Encabezados de días (STICKY) -->
        <div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div class="grid grid-cols-8">
            <div class="p-3 border-r border-gray-200 bg-gray-50"></div>
            <div
              v-for="dia in diasSemana"
              :key="dia.fecha"
              class="p-3 text-center border-r border-gray-200 last:border-r-0"
              :class="esHoy(dia.fecha) ? 'bg-terracota/10' : 'bg-white'"
            >
              <div class="text-xs font-medium text-gray-600 uppercase">{{ dia.nombreDia }}</div>
              <div class="text-lg font-bold text-cafe mt-1" :class="esHoy(dia.fecha) ? 'text-terracota' : ''">
                {{ dia.numeroDia }}
              </div>
              <div class="text-xs text-gray-500 mt-0.5">{{ dia.mes }}</div>
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
              <div class="p-3 text-sm font-medium text-gray-600 border-r border-gray-100 bg-gray-50 sticky left-0">
                {{ hora }}
              </div>
              <div
                v-for="dia in diasSemana"
                :key="`${dia.fecha}-${hora}`"
                class="p-2 border-r border-gray-100 last:border-r-0 hover:bg-gray-50 transition-colors min-h-[70px]"
                :class="esHoy(dia.fecha) ? 'bg-terracota/5' : ''"
              >
                <div
                  v-for="cita in citasPorDiaHora(dia.fecha, hora)"
                  :key="cita.id"
                  @click="verDetallesCita(cita)"
                  class="text-xs p-2 rounded cursor-pointer mb-1 hover:shadow-md transition-all"
                  :class="getClasesCita(cita.estado)"
                >
                  <p class="font-medium truncate">{{ cita.paciente_nombre }}</p>
                  <p class="text-xs opacity-75">{{ cita.hora_inicio }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Mes (simplificada - lista por día) -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="dia in diasDelMes"
        :key="dia.fecha"
        v-show="citasPorDia(dia.fecha).length > 0"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
      >
        <h3 class="font-semibold text-cafe mb-3 flex items-center justify-between">
          <span>{{ dia.nombreCompleto }}</span>
          <span class="text-sm text-gray-500">{{ citasPorDia(dia.fecha).length }} citas</span>
        </h3>
        <div class="space-y-2">
          <div
            v-for="cita in citasPorDia(dia.fecha)"
            :key="cita.id"
            @click="verDetallesCita(cita)"
            class="p-3 rounded-lg cursor-pointer hover:shadow-md transition-all"
            :class="getClasesCita(cita.estado)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="font-medium text-sm">{{ cita.paciente_nombre }}</p>
                <p class="text-xs text-gray-600 mt-1">
                  {{ cita.hora_inicio }} - {{ cita.hora_fin }} · {{ cita.modalidad }}
                </p>
              </div>
              <span
                class="text-xs px-2 py-1 rounded-full font-medium"
                :class="getBadgeEstado(cita.estado)"
              >
                {{ getEstadoLabel(cita.estado) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="citasFiltradas.length === 0" class="col-span-full text-center py-12 text-gray-400">
        <span class="text-6xl block mb-4">📅</span>
        <p>No hay citas en este mes</p>
      </div>
    </div>

    <!-- Resumen de acciones rápidas -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-serif font-bold text-cafe mb-4">
        Acciones Rápidas
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          @click="abrirModalNuevaCita"
          class="flex items-center gap-3 p-4 bg-gradient-to-r from-terracota to-cafe text-white rounded-lg hover:shadow-lg transition-all"
        >
          <span class="text-2xl">➕</span>
          <div class="text-left">
            <p class="font-semibold">Nueva Cita</p>
            <p class="text-xs opacity-90">Programar sesión</p>
          </div>
        </button>

        <button
          @click="irAPacientes"
          class="flex items-center gap-3 p-4 bg-white border-2 border-terracota text-cafe rounded-lg hover:bg-terracota/5 transition-all"
        >
          <span class="text-2xl">👤</span>
          <div class="text-left">
            <p class="font-semibold">Gestionar Pacientes</p>
            <p class="text-xs opacity-75">Ver/editar pacientes</p>
          </div>
        </button>

        <button
          @click="enviarRecordatorios"
          class="flex items-center gap-3 p-4 bg-white border-2 border-green-500 text-green-700 rounded-lg hover:bg-green-50 transition-all"
        >
          <span class="text-2xl">💬</span>
          <div class="text-left">
            <p class="font-semibold">Enviar Recordatorios</p>
            <p class="text-xs opacity-75">WhatsApp citas de hoy</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 class="text-lg font-serif font-bold text-cafe mb-4">
        Resumen de Citas
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-yellow-50 rounded-lg">
          <p class="text-2xl font-bold text-yellow-700">{{ citasPorEstado.pendiente }}</p>
          <p class="text-xs text-yellow-600 mt-1">Pendientes</p>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <p class="text-2xl font-bold text-green-700">{{ citasPorEstado.confirmada }}</p>
          <p class="text-xs text-green-600 mt-1">Confirmadas</p>
        </div>
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <p class="text-2xl font-bold text-blue-700">{{ citasPorEstado.completada }}</p>
          <p class="text-xs text-blue-600 mt-1">Completadas</p>
        </div>
        <div class="text-center p-4 bg-red-50 rounded-lg">
          <p class="text-2xl font-bold text-red-700">{{ citasPorEstado.cancelada }}</p>
          <p class="text-xs text-red-600 mt-1">Canceladas</p>
        </div>
      </div>
    </div>

    <!-- Modal Nueva Cita -->
    <ModalNuevaCita
      v-if="mostrarModalNueva"
      @close="mostrarModalNueva = false"
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
          <p class="text-sm text-terracota mt-2">
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
      class="fixed bottom-8 right-8 w-12 h-12 bg-terracota text-white rounded-full shadow-lg hover:bg-terracota/90 transition-all hover:scale-110 flex items-center justify-center z-20 group"
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
import { ClockIcon } from '@heroicons/vue/24/outline'

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
const citaSeleccionada = ref(null)
const mostrarConfirmacionRecordatorios = ref(false)
const enviandoRecordatorios = ref(false)

// Horas del día (8 AM - 8 PM)
const horasDelDia = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
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
    completada: citasFiltradas.value.filter(c => c.estado === 'completada').length,
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
    completada: 'bg-blue-100 border-l-4 border-blue-500',
    cancelada: 'bg-red-100 border-l-4 border-red-500'
  }
  return clases[estado] || 'bg-gray-100 border-l-4 border-gray-500'
}

const getBadgeEstado = (estado) => {
  const badges = {
    pendiente: 'bg-yellow-200 text-yellow-800',
    confirmada: 'bg-green-200 text-green-800',
    completada: 'bg-blue-200 text-blue-800',
    cancelada: 'bg-red-200 text-red-800'
  }
  return badges[estado] || 'bg-gray-200 text-gray-800'
}

const getEstadoLabel = (estado) => {
  const labels = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    completada: 'Completada',
    cancelada: 'Cancelada'
  }
  return labels[estado] || estado
}

// Acciones de modales
const abrirModalNuevaCita = () => {
  mostrarModalNueva.value = true
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
