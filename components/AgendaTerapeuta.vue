<script setup lang="ts">
// =============================================================================
// COMPONENTE: Agenda del Terapeuta
// =============================================================================
// Vista principal para que el terapeuta gestione sus citas y bonos

import { useAgenda } from '~/composables/useAgenda'
import { computed, ref, onMounted, watch } from 'vue'
import { ArrowsPointingOutIcon } from '@heroicons/vue/24/outline'

// Composables
const {
  citas,
  loading,
  error,
  citasDelDia,
  citasPendientes,
  citasCompletadas,
  citasConBonoProximoAgotar,
  completarCita,
  getCitasDelTerapeuta,
  obtenerHistorialBono,
  verificarBonoCitas
} = useAgenda()

const supabase = useSupabaseClient()

// Estado local
const filtroActivo = ref<'hoy' | 'pendientes' | 'todas' | 'completadas'>('hoy')
const vista = ref<'dia' | 'lista' | 'calendario'>('calendario')
const fechaSeleccionada = ref(new Date())
const mostrarModalHistorial = ref(false)
const bonoSeleccionado = ref<string | null>(null)
const historialBono = ref<any[]>([])
const verificacionBono = ref<any>(null)
const cargandoModal = ref(false)

// Estado para drag & drop
const citaArrastrada = ref<any>(null)
const celdaObjetivo = ref<{ fecha: string; hora: string } | null>(null)

// Horario laboral: 11:00 - 22:00 con descanso de 14:00 - 17:00
// Horas disponibles en la agenda
const horasDelDia: string[] = [
  // Mañana: 11:00 - 13:00 (antes del descanso)
  '11:00', '12:00', '13:00',
  // Descanso: 14:00 - 16:00 (no mostrar)
  // Tarde/Noche: 17:00 - 22:00 (después del descanso)
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
]

// Días de la semana para vista calendario
const diasSemana = computed(() => {
  const inicio = new Date(fechaSeleccionada.value)
  const diaSemana = inicio.getDay()
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana
  inicio.setDate(inicio.getDate() + diff)
  
  const dias = []
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(inicio)
    fecha.setDate(inicio.getDate() + i)
    dias.push({
      fecha: fecha.toISOString().split('T')[0] as string,
      nombreDia: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
      numeroDia: fecha.getDate(),
      mes: fecha.toLocaleDateString('es-ES', { month: 'short' })
    })
  }
  return dias
})

// Citas filtradas según la vista activa
const citasFiltradas = computed(() => {
  switch (filtroActivo.value) {
    case 'hoy':
      return citasDelDia.value
    case 'pendientes':
      return citasPendientes.value
    case 'completadas':
      return citasCompletadas.value
    default:
      return citas.value
  }
})

// Formatear hora para mostrar
const formatearHora = (hora: string) => {
  return hora.substring(0, 5) // HH:MM
}

// Formatear fecha
const formatearFecha = (fecha: string) => {
  const date = new Date(fecha + 'T00:00:00')
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatearFechaLarga = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatearFechaCompleta = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Función para obtener clases de badge según estado
const getBadgeEstado = (estado: string) => {
  const clases = {
    pendiente: 'bg-amber-100 text-amber-700 border border-amber-200',
    confirmada: 'bg-green-100 text-green-700 border border-green-200',
    completada: 'bg-blue-100 text-blue-700 border border-blue-200',
    realizada: 'bg-blue-100 text-blue-700 border border-blue-200',
    cancelada: 'bg-red-100 text-red-700 border border-red-200'
  }
  return clases[estado as keyof typeof clases] || 'bg-gray-100 text-gray-700 border border-gray-200'
}

const esHoy = (fecha: string) => {
  const hoy = new Date().toISOString().split('T')[0]
  return fecha === hoy
}

const cambiarSemana = (direccion: number) => {
  const nueva = new Date(fechaSeleccionada.value)
  nueva.setDate(nueva.getDate() + (direccion * 7))
  fechaSeleccionada.value = nueva
}

// Nueva función para cambiar fecha según vista
const cambiarFecha = (direccion: number) => {
  const nueva = new Date(fechaSeleccionada.value)
  if (vista.value === 'dia') {
    nueva.setDate(nueva.getDate() + direccion)
  } else {
    nueva.setDate(nueva.getDate() + (direccion * 7))
  }
  fechaSeleccionada.value = nueva
}

const irHoy = () => {
  fechaSeleccionada.value = new Date()
}

// Función para obtener citas por hora (vista día)
const citasPorHora = (hora: string) => {
  const fechaStr = fechaSeleccionada.value.toISOString().split('T')[0]
  return citas.value.filter(c => 
    c.fecha_cita === fechaStr && 
    c.hora_inicio?.startsWith(hora)
  )
}

// Clase CSS según estado
const claseEstado = (estado: string) => {
  const clases = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmada: 'bg-blue-100 text-blue-800 border-blue-300',
    completada: 'bg-green-100 text-green-800 border-green-300',
    realizada: 'bg-green-100 text-green-800 border-green-300',
    cancelada: 'bg-red-100 text-red-800 border-red-300'
  }
  return clases[estado as keyof typeof clases] || 'bg-gray-100 text-gray-800'
}

const getClasesCita = (estado: string) => {
  const clases = {
    pendiente: 'bg-yellow-100 border-l-4 border-yellow-500',
    confirmada: 'bg-green-100 border-l-4 border-green-500',
    completada: 'bg-blue-100 border-l-4 border-blue-500',
    realizada: 'bg-blue-100 border-l-4 border-blue-500',
    cancelada: 'bg-red-100 border-l-4 border-red-500'
  }
  return clases[estado as keyof typeof clases] || 'bg-gray-100 border-l-4 border-gray-500'
}

const getEstadoLabel = (estado: string) => {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    completada: 'Completada',
    realizada: 'Realizada',
    cancelada: 'Cancelada'
  }
  return labels[estado] || estado
}

// Clase CSS según sesiones restantes
const claseSesionesRestantes = (sesiones: number) => {
  if (sesiones === 0) return 'text-red-600 font-bold'
  if (sesiones === 1) return 'text-orange-600 font-semibold'
  if (sesiones <= 2) return 'text-yellow-600 font-medium'
  return 'text-green-600'
}

// Obtener citas por día y hora
const citasPorDiaHora = (fecha: string, hora: string) => {
  return citas.value.filter(c =>
    c.fecha_cita === fecha &&
    c.hora_inicio?.startsWith(hora)
  )
}

// ============================================================================
// FUNCIONES DE DRAG & DROP
// ============================================================================

const onDragStart = (event: DragEvent, cita: any) => {
  citaArrastrada.value = cita
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', (event.target as HTMLElement).innerHTML)
  }
  ;(event.target as HTMLElement).style.opacity = '0.5'
}

const onDragEnd = (event: DragEvent) => {
  ;(event.target as HTMLElement).style.opacity = '1'
  citaArrastrada.value = null
  celdaObjetivo.value = null
}

const onDragOver = (event: DragEvent, fecha: string, hora: string) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  celdaObjetivo.value = { fecha, hora }
}

const onDragLeave = (event: DragEvent) => {
  celdaObjetivo.value = null
}

const esCeldaObjetivo = (fecha: string, hora: string) => {
  return celdaObjetivo.value?.fecha === fecha && celdaObjetivo.value?.hora === hora
}

const onDrop = async (event: DragEvent, fecha: string, hora: string) => {
  event.preventDefault()
  
  if (!citaArrastrada.value) return
  
  const cita = citaArrastrada.value
  const nuevaFecha = fecha
  const nuevaHora = hora
  
  // Verificar si la celda de destino está ocupada
  const citaEnDestino = citas.value.find(c => 
    c.fecha_cita === nuevaFecha && 
    c.hora_inicio?.startsWith(nuevaHora) &&
    c.id !== cita.id
  )
  
  if (citaEnDestino) {
    alert('Ya existe una cita en ese horario')
    citaArrastrada.value = null
    celdaObjetivo.value = null
    return
  }
  
  // Calcular hora_fin manteniendo la misma duración
  const calcularHoraFin = (horaInicio: string, horaFinOriginal: string) => {
    const [hInicio, mInicio] = horaInicio.split(':').map(Number)
    const [hFinOrig, mFinOrig] = horaFinOriginal.split(':').map(Number)
    const [hInicioOrig, mInicioOrig] = cita.hora_inicio.split(':').map(Number)
    
    const duracionMinutos = ((hFinOrig || 0) * 60 + (mFinOrig || 0)) - ((hInicioOrig || 0) * 60 + (mInicioOrig || 0))
    
    const totalMinutos = (hInicio || 0) * 60 + (mInicio || 0) + duracionMinutos
    const hFin = Math.floor(totalMinutos / 60)
    const mFin = totalMinutos % 60
    
    return `${String(hFin).padStart(2, '0')}:${String(mFin).padStart(2, '0')}:00`
  }
  
  const nuevaHoraFin = calcularHoraFin(nuevaHora, cita.hora_fin)
  
  try {
    // Actualizar la cita en Supabase
    const { error: errorUpdate } = await supabase
      .from('citas')
      .update({
        fecha_cita: nuevaFecha,
        hora_inicio: nuevaHora + ':00',
        hora_fin: nuevaHoraFin,
        updated_at: new Date().toISOString()
      })
      .eq('id', cita.id)
    
    if (errorUpdate) {
      console.error('Error al mover cita:', errorUpdate)
      alert('Error al mover la cita')
      return
    }
    
    // Recargar las citas
    await getCitasDelTerapeuta()
    
  } catch (err) {
    console.error('Error al mover cita:', err)
    alert('Error al mover la cita')
  } finally {
    citaArrastrada.value = null
    celdaObjetivo.value = null
  }
}

// Manejar completar cita
const handleCompletarCita = async (citaId: string) => {
  if (!confirm('¿Estás seguro de marcar esta cita como completada?')) return

  try {
    const resultado = await completarCita(citaId)
    
    if (resultado.success) {
      console.log('Cita completada')
    }
  } catch (error) {
    console.error('Error al completar cita:', error)
  }
}

// Abrir modal de historial
const abrirHistorial = async (bonoId: string) => {
  try {
    cargandoModal.value = true
    bonoSeleccionado.value = bonoId
    mostrarModalHistorial.value = true

    const [historial, verificacion] = await Promise.all([
      obtenerHistorialBono(bonoId),
      verificarBonoCitas(bonoId)
    ])

    historialBono.value = historial
    verificacionBono.value = verificacion
  } catch (error) {
    console.error('Error al cargar historial:', error)
  } finally {
    cargandoModal.value = false
  }
}

// Cerrar modal
const cerrarModal = () => {
  mostrarModalHistorial.value = false
  bonoSeleccionado.value = null
  historialBono.value = []
  verificacionBono.value = null
}

// Recargar citas manualmente
const recargarCitas = async () => {
  try {
    await getCitasDelTerapeuta()
  } catch (error) {
    console.error('Error al recargar citas:', error)
  }
}
</script>

<template>
  <div class="space-y-3">
    <!-- Header con filtros -->
    <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/30 p-4">
      <!-- Primera línea: Título + Controles principales -->
      <div class="flex items-center justify-between gap-3 mb-3">
        <div class="flex items-center gap-3">
          <h1 class="text-xl font-['Elms_Sans'] font-bold text-neutral-800">Mi Agenda</h1>
          <span class="text-sm text-neutral-600">{{ formatearFechaLarga(fechaSeleccionada) }}</span>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Selector de vista -->
          <div class="flex bg-neutral-100 rounded-xl p-1">
            <button
              @click="vista = 'dia'"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              :class="vista === 'dia' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-600 hover:text-neutral-800'"
            >
              Día
            </button>
            <button
              @click="vista = 'calendario'"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              :class="vista === 'calendario' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-600 hover:text-neutral-800'"
            >
              Semana
            </button>
            <button
              @click="vista = 'lista'"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              :class="vista === 'lista' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-600 hover:text-neutral-800'"
            >
              Lista
            </button>
          </div>

          <!-- Navegación de fecha -->
          <div class="flex items-center gap-1">
            <button
              @click="cambiarFecha(-1)"
              class="p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-all"
              title="Anterior"
            >
              ←
            </button>
            <button
              @click="irHoy"
              class="px-3 py-1.5 bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white hover:from-[#027368] hover:to-[#04BF9D] rounded-lg text-sm font-medium transition-all"
            >
              Hoy
            </button>
            <button
              @click="cambiarFecha(1)"
              class="p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-all"
              title="Siguiente"
            >
              →
            </button>
          </div>

          <!-- Botón actualizar -->
          <button
            @click="recargarCitas"
            class="px-4 py-2 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all text-sm font-medium shadow-sm"
            :disabled="loading"
          >
            <span v-if="loading">Actualizando...</span>
            <span v-else>↻ Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Segunda línea: Filtros (solo para vista lista) -->
      <div v-if="vista === 'lista'" class="flex flex-wrap gap-2">
        <button
          v-for="filtro in [
            { key: 'hoy', label: 'Hoy', count: citasDelDia.length },
            { key: 'pendientes', label: 'Pendientes', count: citasPendientes.length },
            { key: 'completadas', label: 'Completadas', count: citasCompletadas.length },
            { key: 'todas', label: 'Todas', count: citas.length }
          ]"
          :key="filtro.key"
          @click="filtroActivo = filtro.key as any"
          :class="[
            'px-3 py-1.5 rounded-xl text-sm font-medium transition-all shadow-sm',
            filtroActivo === filtro.key
              ? 'bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
          ]"
        >
          {{ filtro.label }} ({{ filtro.count }})
        </button>
      </div>
    </div>

    <!-- Alertas de bonos próximos a agotarse -->
    <div
      v-if="citasConBonoProximoAgotar.length > 0"
      class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-4 shadow-sm"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F2B33D] to-[#F2B33D]/70 flex items-center justify-center flex-shrink-0">
          <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-amber-900">
            Atención: {{ citasConBonoProximoAgotar.length }} paciente(s) con pocas sesiones restantes
          </p>
          <p class="text-xs text-amber-700 mt-1">
            Considera informar a estos pacientes para renovar sus bonos
          </p>
        </div>
      </div>
    </div>

    <!-- Vista Día -->
    <div v-if="vista === 'dia'" class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/30 overflow-hidden flex flex-col" style="height: calc(100vh - 200px);">
      <!-- Header del día (STICKY) -->
      <div class="sticky top-0 z-10 bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-['Elms_Sans'] font-semibold text-lg text-neutral-800">
              {{ formatearFechaCompleta(fechaSeleccionada) }}
            </h3>
            <p class="text-sm text-neutral-600 mt-1">
              {{ citasPorHora ? Object.values(horasDelDia).reduce((total, hora) => total + citasPorHora(hora).length, 0) : 0 }} citas programadas
            </p>
          </div>
        </div>
      </div>

      <!-- Contenido con scroll -->
      <div class="flex-1 overflow-y-auto">
        <!-- Estado vacío cuando no hay citas -->
        <div 
          v-if="citasFiltradas.length === 0" 
          class="flex items-center justify-center py-16"
        >
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#027368]/10 to-[#04BF9D]/10 flex items-center justify-center">
              <svg class="w-8 h-8 text-[#027368]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="font-['Elms_Sans'] font-medium text-neutral-800 mb-2">No hay citas programadas</h3>
            <p class="text-neutral-600 text-sm">{{ formatearFechaCompleta(fechaSeleccionada) }} está libre</p>
          </div>
        </div>

        <!-- Horarios del día -->
        <div v-else class="divide-y divide-neutral-100">
          <div
            v-for="(hora, index) in horasDelDia"
            :key="hora"
            :data-hora="hora"
            class="flex hover:bg-neutral-50/50 transition-colors"
          >
            <div class="w-20 p-3 text-sm font-medium text-neutral-600 border-r border-neutral-200 bg-neutral-50/50 flex-shrink-0">
              {{ hora }}
            </div>
            <div 
              class="flex-1 p-3 cursor-pointer hover:bg-[#027368]/5 transition-colors relative group/cell"
            >
              <!-- Indicador de celda vacía -->
              <div 
                v-if="citasPorHora(hora).length === 0" 
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none"
              >
                <span class="text-xs text-[#027368] font-medium bg-white px-3 py-1.5 rounded-full shadow-sm border border-white/50">
                  Horario libre
                </span>
              </div>
              
              <div
                v-for="cita in citasPorHora(hora)"
                :key="cita.id"
                draggable="true"
                @dragstart="onDragStart($event, cita)"
                @dragend="onDragEnd($event)"
                class="mb-2 p-3 rounded-xl transition-all hover:shadow-md hover:ring-2 hover:ring-[#027368]/30 group relative cursor-move backdrop-blur-sm"
                :class="getClasesCita(cita.estado)"
                @click.stop
                title="Arrastra para mover a otra hora"
              >
                <div class="flex items-start justify-between gap-3">
                  <!-- Indicador de arrastre -->
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <ArrowsPointingOutIcon class="w-4 h-4 text-neutral-500" />
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-sm text-neutral-800">{{ cita.paciente?.nombre_completo || 'Sin nombre' }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs text-neutral-600 font-medium">
                        {{ formatearHora(cita.hora_inicio) }} - {{ formatearHora(cita.hora_fin) }}
                      </span>
                      <span class="text-xs px-2 py-1 rounded-lg bg-white/60 text-neutral-700">
                        {{ cita.modalidad }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-xs px-2 py-1 rounded-lg font-medium whitespace-nowrap"
                      :class="getBadgeEstado(cita.estado)"
                    >
                      {{ getEstadoLabel(cita.estado) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div
                v-if="citasPorHora(hora).length === 0"
                class="text-xs text-neutral-400 italic"
              >
                Sin citas programadas
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Calendario Semanal -->
    <div v-else-if="vista === 'calendario'" class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/30 overflow-hidden flex flex-col" style="height: calc(100vh - 200px);">
      <div class="min-w-[800px] overflow-x-auto flex-1 flex flex-col">
        <!-- Encabezados de días (STICKY) -->
        <div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div class="grid grid-cols-8">
            <div class="p-2 border-r border-gray-200 bg-gray-50"></div>
            <div
              v-for="dia in diasSemana"
              :key="dia.fecha"
              class="p-2 text-center border-r border-gray-200 last:border-r-0"
              :class="esHoy(dia.fecha) ? 'bg-blue-50' : 'bg-white'"
            >
              <div class="flex items-center justify-center gap-1">
                <span class="text-xs font-medium text-gray-600 uppercase">{{ dia.nombreDia }}</span>
                <span class="text-lg font-bold text-gray-900" :class="esHoy(dia.fecha) ? 'text-blue-600' : ''">{{ dia.numeroDia }}</span>
              </div>
              <div class="text-xs text-gray-500">{{ dia.mes }}</div>
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
                class="p-2 border-r border-gray-100 last:border-r-0 hover:bg-blue-50/30 transition-colors min-h-[70px] cursor-pointer relative group/cell"
                :class="[
                  esHoy(dia.fecha) ? 'bg-blue-50/20' : '',
                  esCeldaObjetivo(dia.fecha, hora) ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : ''
                ]"
                @dragover="onDragOver($event, dia.fecha, hora)"
                @dragleave="onDragLeave($event)"
                @drop="onDrop($event, dia.fecha, hora)"
              >
                <!-- Indicador de celda vacía clicable -->
                <div 
                  v-if="citasPorDiaHora(dia.fecha, hora).length === 0" 
                  class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none"
                >
                  <span class="text-xs text-blue-600 font-medium bg-white px-2 py-1 rounded-full shadow-sm">
                    Libre
                  </span>
                </div>
                <div
                  v-for="cita in citasPorDiaHora(dia.fecha, hora)"
                  :key="cita.id"
                  draggable="true"
                  @dragstart="onDragStart($event, cita)"
                  @dragend="onDragEnd($event)"
                  class="text-xs p-2 rounded-lg mb-1.5 hover:shadow-lg hover:ring-2 hover:ring-blue-400 transition-all group relative cursor-move"
                  :class="getClasesCita(cita.estado)"
                  @click.stop
                  title="Arrastra para mover"
                >
                  <!-- Indicador de arrastre -->
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 left-1">
                    <ArrowsPointingOutIcon class="w-3 h-3 text-gray-500" />
                  </div>
                  
                  <div class="pl-5">
                    <p class="font-semibold truncate text-sm">{{ cita.paciente?.nombre_completo || 'Sin nombre' }}</p>
                    <p class="text-xs text-gray-600 mt-0.5">
                      {{ formatearHora(cita.hora_inicio) }} - {{ formatearHora(cita.hora_fin) }}
                    </p>
                    <div class="flex items-center gap-1 mt-1">
                      <span class="text-xs px-1.5 py-0.5 rounded-full bg-white/60">
                        {{ cita.modalidad }}
                      </span>
                      <span v-if="cita.bono" class="text-xs text-green-700">
                        Bono
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Lista (original) -->
    <div v-else>
      <!-- Filtros -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="filtro in [
            { key: 'hoy', label: 'Hoy', count: citasDelDia.length },
            { key: 'pendientes', label: 'Pendientes', count: citasPendientes.length },
            { key: 'completadas', label: 'Completadas', count: citasCompletadas.length },
            { key: 'todas', label: 'Todas', count: citas.length }
          ]"
          :key="filtro.key"
          @click="filtroActivo = filtro.key as any"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            filtroActivo === filtro.key
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          ]"
        >
          {{ filtro.label }} ({{ filtro.count }})
        </button>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- Loading -->
      <div v-if="loading && citas.length === 0" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Cargando citas...</p>
      </div>

      <!-- Sin citas -->
      <div v-else-if="citasFiltradas.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ filtroActivo === 'hoy' ? 'No tienes citas programadas para hoy.' : 'No hay citas en esta categoría.' }}
        </p>
      </div>

      <!-- Lista de citas -->
      <div v-else class="space-y-4">
        <TarjetaCita
          v-for="cita in citasFiltradas"
          :key="cita.id"
          :cita="cita"
          @completar="handleCompletarCita"
          @ver-historial="abrirHistorial"
        />
      </div>
    </div>

    <!-- Modal de Historial de Bono -->
    <Teleport to="body">
      <div
        v-if="mostrarModalHistorial"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="cerrarModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          <!-- Header del modal -->
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">Historial del Bono</h2>
            <button
              @click="cerrarModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Contenido del modal -->
          <div class="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div v-if="cargandoModal" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>

            <div v-else>
              <!-- Resumen del bono -->
              <div v-if="verificacionBono" class="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-3">Resumen</h3>
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p class="text-2xl font-bold text-blue-600">{{ verificacionBono.bono.sesiones_totales }}</p>
                    <p class="text-xs text-gray-600">Sesiones Totales</p>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-green-600">{{ verificacionBono.bono.sesiones_usadas }}</p>
                    <p class="text-xs text-gray-600">Sesiones Usadas</p>
                  </div>
                  <div>
                    <p :class="['text-2xl font-bold', claseSesionesRestantes(verificacionBono.bono.sesiones_restantes)]">
                      {{ verificacionBono.bono.sesiones_restantes }}
                    </p>
                    <p class="text-xs text-gray-600">Sesiones Restantes</p>
                  </div>
                </div>

                <div v-if="verificacionBono.alerta" class="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                  {{ verificacionBono.mensaje_alerta }}
                </div>
              </div>

              <!-- Movimientos -->
              <div>
                <h3 class="font-semibold text-gray-900 mb-3">Movimientos</h3>
                <div v-if="historialBono.length === 0" class="text-center py-8 text-gray-500">
                  No hay movimientos registrados
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="mov in historialBono"
                    :key="mov.id"
                    class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <span
                            :class="[
                              'px-2 py-1 text-xs font-medium rounded',
                              mov.tipo_movimiento === 'descuento' ? 'bg-red-100 text-red-700' :
                              mov.tipo_movimiento === 'reembolso' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            ]"
                          >
                            {{ mov.tipo_movimiento }}
                          </span>
                          <span class="text-xs text-gray-500">
                            {{ new Date(mov.fecha).toLocaleString('es-ES') }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-700">{{ mov.motivo }}</p>
                      </div>
                      <div class="text-right ml-4">
                        <p class="text-sm font-semibold text-gray-900">
                          {{ mov.sesiones_antes }} → {{ mov.sesiones_despues }}
                        </p>
                        <p :class="[
                          'text-xs font-medium',
                          mov.sesiones_modificadas > 0 ? 'text-red-600' : 'text-green-600'
                        ]">
                          {{ mov.sesiones_modificadas > 0 ? '-' : '+' }}{{ Math.abs(mov.sesiones_modificadas) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer del modal -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              @click="cerrarModal"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.agenda-terapeuta {
  min-height: 100vh;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
