<script setup lang="ts">
// =============================================================================
// COMPONENTE: Grilla de Agenda (Día/Semana/Mes)
// =============================================================================
// Renderiza eventos en cuadrícula temporal con drag & drop

import type { AgendaEvent, VistaAgenda, TimeSlot } from './types'
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { 
  generarBloquesHorarios, 
  agregarDias, 
  inicioSemana, 
  formatearDiaSemana 
} from './types'
import AgendaEventCard from './AgendaEventCard.vue'

// Props
const props = defineProps<{
  eventos: AgendaEvent[]
  vista: VistaAgenda
  fechaActual: Date
  cargando?: boolean
  draggable?: boolean
}>()

// Emits
const emit = defineEmits<{
  'evento-click': [id: string]
  'evento-menu': [id: string, event: MouseEvent]
  'slot-click': [slot: TimeSlot]
  'evento-drop': [eventoId: string, nuevoSlot: TimeSlot]
}>()

// State
const eventoDragId = ref<string | null>(null)
const gridContainer = ref<HTMLElement | null>(null)
const lineaTiempoTop = ref<string>('0px') // Posición en píxeles
const lineaTiempoVisible = ref<boolean>(false) // Si está visible
const citasActivas = ref<Set<string>>(new Set()) // IDs de citas activas
let intervaloTiempo: NodeJS.Timeout | null = null

// Constantes
const HORAS_TRABAJO = generarBloquesHorarios('08:00', '22:30', 30) // Bloques de 30 minutos hasta las 22:30 (para incluir citas hasta 22:00)

// Altura fija (modo compacto)
const alturaSlot = computed(() => 'h-8')

// Computadas - Fechas según vista
const fechas = computed(() => {
  const fechaStr = props.fechaActual.toISOString().split('T')[0]!

  if (props.vista === 'dia') {
    return [fechaStr]
  } else if (props.vista === '5dias') {
    // Vista 5 días: desde hoy + 4 días más
    return Array.from({ length: 5 }, (_, i) => agregarDias(fechaStr, i))
  } else if (props.vista === 'semana') {
    const inicio = inicioSemana(fechaStr)
    return Array.from({ length: 7 }, (_, i) => agregarDias(inicio, i))
  } else {
    // Vista mes: calendario completo con días del mes anterior y siguiente
    const primerDia = new Date(props.fechaActual.getFullYear(), props.fechaActual.getMonth(), 1)
    const ultimoDia = new Date(props.fechaActual.getFullYear(), props.fechaActual.getMonth() + 1, 0)

    // Día de la semana del primer día (0=domingo, 1=lunes, ...)
    // Convertimos a formato ISO (0=lunes, 6=domingo)
    let primerDiaSemana = primerDia.getDay()
    primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1

    // Día de la semana del último día
    let ultimoDiaSemana = ultimoDia.getDay()
    ultimoDiaSemana = ultimoDiaSemana === 0 ? 6 : ultimoDiaSemana - 1

    const dias: string[] = []

    // Agregar días del mes anterior para completar la primera semana
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const fecha = new Date(primerDia)
      fecha.setDate(fecha.getDate() - (i + 1))
      dias.push(fecha.toISOString().split('T')[0]!)
    }

    // Agregar todos los días del mes actual
    for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
      dias.push(d.toISOString().split('T')[0]!)
    }

    // Agregar días del mes siguiente para completar la última semana
    const diasParaCompletar = 6 - ultimoDiaSemana
    for (let i = 1; i <= diasParaCompletar; i++) {
      const fecha = new Date(ultimoDia)
      fecha.setDate(fecha.getDate() + i)
      dias.push(fecha.toISOString().split('T')[0]!)
    }

    return dias
  }
})

// Eventos agrupados por fecha
const eventosPorFecha = computed(() => {
  const mapa = new Map<string, AgendaEvent[]>()
  
  props.eventos.forEach(evento => {
    const fecha = evento.fecha
    if (!mapa.has(fecha)) {
      mapa.set(fecha, [])
    }
    mapa.get(fecha)!.push(evento)
  })
  
  // Ordenar por hora de inicio
  mapa.forEach((eventos, fecha) => {
    eventos.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  })
  
  return mapa
})

// Métodos - Drag & Drop
const handleDragStart = (eventoId: string) => {
  if (!props.draggable) return
  eventoDragId.value = eventoId
}

const handleDragOver = (e: DragEvent) => {
  if (!props.draggable || !eventoDragId.value) return
  e.preventDefault()
}

const handleDrop = (fecha: string, hora: string) => {
  if (!props.draggable || !eventoDragId.value) return
  
  emit('evento-drop', eventoDragId.value, {
    date: fecha,
    horaInicio: hora
  })
  
  eventoDragId.value = null
}

const handleDragEnd = () => {
  eventoDragId.value = null
}

// Click en slot vacío
const handleSlotClick = (fecha: string, hora: string) => {
  emit('slot-click', {
    date: fecha,
    horaInicio: hora
  })
}

// Helpers
const obtenerEventosEnSlot = (fecha: string, hora: string): AgendaEvent[] => {
  const eventos = eventosPorFecha.value.get(fecha) || []
  return eventos.filter(e => e.horaInicio === hora)
}

const esFechaHoy = (fecha: string): boolean => {
  const hoy = new Date().toISOString().split('T')[0]
  return fecha === hoy
}

// Detectar si una fecha pertenece al mes actual (para vista mensual)
const esMesActual = (fecha: string): boolean => {
  const fechaDate = new Date(fecha + 'T00:00:00')
  return fechaDate.getMonth() === props.fechaActual.getMonth() && 
         fechaDate.getFullYear() === props.fechaActual.getFullYear()
}

// Calcular altura del evento según duración
const calcularAlturaEvento = (horaInicio: string, horaFin: string): string => {
  try {
    const inicio = new Date(`1970-01-01T${horaInicio}:00`)
    const fin = new Date(`1970-01-01T${horaFin}:00`)
    const duracionMinutos = (fin.getTime() - inicio.getTime()) / 60000
    
    // Altura base por CELDA (cada celda = 30 minutos) - modo compacto
    const alturaPorCelda = 2.25 // rem
    const alturaPor30Min = alturaPorCelda
    const alturaPorMinuto = alturaPor30Min / 30
    
    // Calcular altura exacta
    const alturaCalculada = duracionMinutos * alturaPorMinuto
    
    return `${alturaCalculada}rem`
  } catch {
    return '2.5rem' // Fallback
  }
}

// Calcular posición top del evento dentro de su slot
const calcularTopEvento = (horaInicio: string, horaSlot: string): string => {
  try {
    const inicio = new Date(`1970-01-01T${horaInicio}:00`)
    const slot = new Date(`1970-01-01T${horaSlot}:00`)
    const minutosDesdeSlot = (inicio.getTime() - slot.getTime()) / 60000
    
    if (minutosDesdeSlot <= 0) return '0'
    
    // Altura base por celda (30 minutos) - modo compacto
    const alturaPorCelda = 2.25
    const alturaPorMinuto = alturaPorCelda / 30
    
    return `${minutosDesdeSlot * alturaPorMinuto}rem`
  } catch {
    return '0'
  }
}

// Scroll automático a la hora actual
const scrollToCurrentTime = async () => {
  await nextTick()
  
  if (!gridContainer.value || props.cargando) return
  
  const now = new Date()
  const horaActual = `${String(now.getHours()).padStart(2, '0')}:${String(Math.floor(now.getMinutes() / 30) * 30).padStart(2, '0')}`
  
  // Encontrar el índice de la hora más cercana
  const indiceHora = HORAS_TRABAJO.findIndex(h => h >= horaActual)
  
  if (indiceHora !== -1) {
    // Calcular posición de scroll - modo compacto
    const alturaPromedio = 40 // 2.5rem
    const scrollPosition = Math.max(0, (indiceHora - 2) * alturaPromedio) // 2 horas antes para contexto

    gridContainer.value.scrollTop = scrollPosition
  }
}

// Scroll automático al día actual (vista mensual)
const scrollToToday = async () => {
  await nextTick()
  
  if (props.vista !== 'mes') return
  
  const hoy = new Date().toISOString().split('T')[0]
  const contenedorMes = document.querySelector('.agenda-mes-grid')
  const diaActual = document.querySelector(`[data-fecha="${hoy}"]`)
  
  if (diaActual && contenedorMes) {
    diaActual.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }
}

// Actualizar línea de tiempo roja (posición en píxeles exactos)
const actualizarLineaTiempo = () => {
  const ahora = new Date()
  const horaInicio = 8 // 08:00
  const horaFin = 22.5 // 22:30
  const horaActual = ahora.getHours() + ahora.getMinutes() / 60
  
  // Solo mostrar si está dentro del horario laboral
  if (horaActual >= horaInicio && horaActual <= horaFin) {
    lineaTiempoVisible.value = true
    
    // Calcular minutos exactos desde las 08:00
    const minutosDesdeInicio = (ahora.getHours() - horaInicio) * 60 + ahora.getMinutes()
    
    // Altura de cada celda - modo compacto (1 celda = 30 minutos)
    const alturaCelda = 40 // 2.5rem en píxeles
    
    // Calcular cuántos píxeles por minuto
    const pixelesPorMinuto = alturaCelda / 30 // 30 minutos por celda
    
    // Posición exacta en píxeles desde el inicio (08:00)
    const posicionPixeles = minutosDesdeInicio * pixelesPorMinuto
    
    lineaTiempoTop.value = `${Math.round(posicionPixeles)}px`
  } else {
    lineaTiempoVisible.value = false
  }
  
  // Actualizar citas activas
  actualizarCitasActivas()
}

// Detectar y resaltar citas activas en tiempo real
const actualizarCitasActivas = () => {
  const ahora = new Date()
  const nuevasCitasActivas = new Set<string>()
  
  props.eventos.forEach(evento => {
    try {
      const fechaEvento = evento.fecha
      const [horaInicioH, horaInicioM] = evento.horaInicio.split(':').map(Number)
      const [horaFinH, horaFinM] = evento.horaFin.split(':').map(Number)
      
      const inicio = new Date(fechaEvento + 'T' + evento.horaInicio + ':00')
      const fin = new Date(fechaEvento + 'T' + evento.horaFin + ':00')
      
      if (ahora >= inicio && ahora <= fin) {
        nuevasCitasActivas.add(evento.id)
      }
    } catch (error) {
      // Ignorar errores de parsing
    }
  })
  
  citasActivas.value = nuevasCitasActivas
}

// Verificar si una cita está activa ahora
const esCitaActiva = (eventoId: string): boolean => {
  return citasActivas.value.has(eventoId)
}

// Montar y observar cambios
onMounted(() => {
  // Scroll inicial según vista
  if (props.vista === 'mes') {
    scrollToToday()
  } else {
    scrollToCurrentTime()
  }
  
  // Iniciar actualización de línea de tiempo
  actualizarLineaTiempo()
  intervaloTiempo = setInterval(actualizarLineaTiempo, 60000) // Cada minuto
})

onUnmounted(() => {
  if (intervaloTiempo) {
    clearInterval(intervaloTiempo)
    intervaloTiempo = null
  }
})

watch([() => props.vista, () => props.cargando], () => {
  if (!props.cargando) {
    setTimeout(() => {
      if (props.vista === 'mes') {
        scrollToToday()
      } else {
        scrollToCurrentTime()
      }
    }, 100)
  }
})
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-[#FFF9F6] dark:bg-gray-900">
    
    <!-- Loading state -->
    <div v-if="cargando" class="flex items-center justify-center h-full">
      <div class="text-center space-y-3">
        <div class="w-12 h-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin mx-auto" />
        <p class="text-cafe/60 dark:text-gray-400">Cargando agenda...</p>
      </div>
    </div>

    <!-- Controles de Zoom -->
    <div v-if="!cargando" class="agenda-controls">
      <!-- Leyenda de estados -->
      <div class="leyenda-estados">
        <div class="estado">
          <span class="dot" data-color="pendiente"></span>
          <span>Pendiente</span>
        </div>
        <div class="estado">
          <span class="dot" data-color="confirmada"></span>
          <span>Confirmada</span>
        </div>
        <div class="estado">
          <span class="dot" data-color="realizada"></span>
          <span>Realizada</span>
        </div>
        <div class="estado">
          <span class="dot" data-color="cancelada"></span>
          <span>Cancelada</span>
        </div>
      </div>
    </div>

    <!-- Vista DÍA -->
    <div v-if="!cargando && vista === 'dia'" class="agenda-container">
      <!-- Grid de horarios - vista día -->
      <div ref="gridContainer" class="agenda-grid-dia">
        <!-- Línea roja de tiempo actual -->
        <div 
          v-if="lineaTiempoVisible"
          class="linea-tiempo-actual"
          :style="{ top: lineaTiempoTop }"
        >
          <div class="circulo-tiempo"></div>
          <div class="texto-tiempo">{{ new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) }}</div>
        </div>

        <div
          v-for="(hora, idx) in HORAS_TRABAJO"
          :key="hora"
          class="agenda-cell-dia group"
          :class="idx % 2 === 0 ? 'bg-white' : 'bg-[#FFFAF7]'"
          :style="{ minHeight: '2.5rem' }"
          @click="handleSlotClick(fechas[0]!, hora)"
        >
          <!-- Hora -->
          <div class="hora-dia">
            {{ hora }}
          </div>

          <!-- Eventos en esta hora -->
          <div class="eventos-container">
            <div
              v-for="(evento, evIdx) in obtenerEventosEnSlot(fechas[0]!, hora)"
              :key="`${evento.id}-${evIdx}`"
              class="agenda-event-dia"
              :class="{ 'cita-activa': esCitaActiva(evento.id) }"
              :data-estado="evento.estado"
              :style="{
                '--event-height': calcularAlturaEvento(evento.horaInicio, evento.horaFin)
              }"
              @click.stop="$emit('evento-click', evento.id)"
            >
              <span class="hora">{{ evento.horaInicio }} - {{ evento.horaFin }}</span>
              <span class="nombre">{{ evento.pacienteNombre }}</span>


              <!-- Tooltip -->
              <div class="tooltip">
                <div class="font-semibold">{{ evento.pacienteNombre }}</div>
                <div>{{ evento.horaInicio }} - {{ evento.horaFin }}</div>
                <div v-if="evento.modalidad">{{ evento.modalidad === 'online' ? '💻 Online' : '🏥 Presencial' }}</div>
                <div v-if="evento.areaTerapeutica" class="text-[10px] opacity-80">{{ evento.areaTerapeutica }}</div>
              </div>
            </div>

            <!-- Botón + para agregar cita (visible solo si no hay eventos en esta hora) -->
            <div
              v-if="obtenerEventosEnSlot(fechas[0]!, hora).length === 0"
              class="add-slot-indicator"
            >
              <span class="add-icon">+</span>
              <span class="add-text">Nueva cita</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista SEMANA / 5 DÍAS -->
    <div v-if="!cargando && (vista === 'semana' || vista === '5dias')" class="agenda-container">
      <!-- Header: días (sticky) -->
      <div
        class="agenda-days"
        :style="{ gridTemplateColumns: `3rem repeat(${fechas.length}, 1fr)` }"
      >
        <div></div> <!-- Espacio para columna de horas -->
        <div
          v-for="fecha in fechas"
          :key="fecha"
          class="py-2 px-1"
          :class="esFechaHoy(fecha) ? 'bg-purple-600/5 border-b-2 border-purple-600' : ''"
        >
          <div class="text-xs font-medium text-cafe/70">
            {{ formatearDiaSemana(fecha).split(',')[0] }}
          </div>
          <div class="text-sm font-bold text-cafe">
            {{ new Date(fecha + 'T00:00:00').getDate() }}
          </div>
        </div>
      </div>

      <!-- Grid de horarios -->
      <div
        ref="gridContainer"
        class="agenda-grid"
        :style="{ gridTemplateColumns: `3rem repeat(${fechas.length}, 1fr)` }"
      >
        <!-- Línea roja de tiempo actual -->
        <div 
          v-if="lineaTiempoVisible"
          class="linea-tiempo-actual"
          :style="{ top: lineaTiempoTop, left: '0', right: '0', gridColumn: '1 / -1' }"
        >
          <div class="circulo-tiempo"></div>
          <div class="texto-tiempo">{{ new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) }}</div>
        </div>

        <template v-for="(hora, idx) in HORAS_TRABAJO" :key="hora">
          <!-- Columna de hora -->
          <div class="agenda-hours">
            {{ hora }}
          </div>
          
          <!-- Celdas de días -->
          <div
            v-for="fecha in fechas"
            :key="`${fecha}-${hora}`"
            class="agenda-cell"
            :class="idx % 2 === 0 ? 'bg-white' : 'bg-[#FFFAF7]'"
            @click="handleSlotClick(fecha, hora)"
          >
            <!-- Eventos en esta celda -->
            <div
              v-for="evento in obtenerEventosEnSlot(fecha, hora)"
              :key="evento.id"
              class="agenda-event"
              :class="{ 'cita-activa': esCitaActiva(evento.id) }"
              :data-estado="evento.estado"
              :style="{ 
                '--event-height': calcularAlturaEvento(evento.horaInicio, evento.horaFin),
                'top': calcularTopEvento(evento.horaInicio, hora)
              }"
              @click.stop="$emit('evento-click', evento.id)"
            >
              <span class="hora">{{ evento.horaInicio }} - {{ evento.horaFin }}</span>
              <span class="nombre">{{ evento.pacienteNombre }}</span>
              
              <!-- Tooltip -->
              <div class="tooltip">
                <div class="font-semibold">{{ evento.pacienteNombre }}</div>
                <div>{{ evento.horaInicio }} - {{ evento.horaFin }}</div>
                <div v-if="evento.modalidad">{{ evento.modalidad === 'online' ? '💻 Online' : '🏥 Presencial' }}</div>
                <div v-if="evento.areaTerapeutica" class="text-[10px] opacity-80">{{ evento.areaTerapeutica }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Vista MES -->
    <div v-if="!cargando && vista === 'mes'" class="agenda-mes-container">
      <div class="agenda-mes-grid">
        <!-- Header: días de semana -->
        <div 
          v-for="dia in ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']" 
          :key="dia" 
          class="agenda-mes-header"
        >
          {{ dia }}
        </div>

        <!-- Celdas del mes -->
        <div
          v-for="fecha in fechas"
          :key="fecha"
          :data-fecha="fecha"
          class="agenda-dia-mes"
          :class="[
            esFechaHoy(fecha) ? 'dia-hoy' : '',
            !esMesActual(fecha) ? 'dia-otro-mes' : ''
          ]"
          @click="handleSlotClick(fecha, '09:00')"
        >
          <div class="agenda-dia-header">
            <span class="dia-numero">{{ new Date(fecha + 'T00:00:00').getDate() }}</span>
            <div class="flex items-center gap-1">
              <span 
                v-if="(eventosPorFecha.get(fecha) || []).length > 0" 
                class="contador-citas"
                :title="`${(eventosPorFecha.get(fecha) || []).length} cita${(eventosPorFecha.get(fecha) || []).length > 1 ? 's' : ''}`"
              >
                {{ (eventosPorFecha.get(fecha) || []).length }}
              </span>
              <span v-if="esFechaHoy(fecha)" class="dia-hoy-badge">Hoy</span>
            </div>
          </div>
          <div class="agenda-dia-eventos">
            <AgendaEventCard
              v-for="evento in (eventosPorFecha.get(fecha) || []).slice(0, 2)"
              :key="evento.id"
              :event="evento"
              :compact="true"
              @open="$emit('evento-click', evento.id)"
            />
            <button
              v-if="(eventosPorFecha.get(fecha) || []).length > 2"
              class="mas-eventos"
              @click.stop="handleSlotClick(fecha, '09:00')"
              :title="`Ver todas las ${(eventosPorFecha.get(fecha) || []).length} citas de este día`"
            >
              +{{ (eventosPorFecha.get(fecha) || []).length - 2 }} más
            </button>
          </div>
          <!-- Indicador de agregar cita -->
          <span class="add-indicator">+</span>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ============================================================================
   MODERN MINIMALIST AGENDA DESIGN
   Inspired by: Linear, Notion Calendar, Cal.com, Google Calendar M3
   ============================================================================ */

/* CONTROLES SUPERIORES - Más limpios */
.agenda-controls {
  @apply flex justify-between items-center py-2.5 px-5 bg-white dark:bg-gray-950;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

/* LEYENDA DE ESTADOS - Minimalista */
.leyenda-estados {
  @apply flex items-center justify-start gap-4 text-[11px] tracking-wide text-gray-500 dark:text-gray-400;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.leyenda-estados .estado {
  @apply flex items-center gap-1.5;
}

.leyenda-estados .dot {
  @apply w-2 h-2 rounded-full flex-shrink-0;
}

/* Colores modernos con alpha suave */
.dot[data-color='pendiente'] {
  background-color: #F59E0B;
}
.dot[data-color='confirmada'] {
  background-color: #10B981;
}
.dot[data-color='realizada'] {
  background-color: #6366F1;
}
.dot[data-color='cancelada'] {
  background-color: #EF4444;
}

/* Contenedor principal - Elegante con sombra sutil */
.agenda-container {
  @apply relative bg-white dark:bg-gray-950 overflow-hidden;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

/* CABECERA DE DÍAS - Más limpia */
.agenda-days {
  @apply sticky top-0 z-10 grid text-center;
  background: linear-gradient(to bottom, #FAFAFA, #FFFFFF);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.agenda-days > div:not(:first-child) {
  @apply py-3 px-2;
}

.agenda-days .text-xs {
  @apply text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500;
  letter-spacing: 0.1em;
}

.agenda-days .text-sm {
  @apply text-base font-light text-gray-800 dark:text-gray-200;
}

/* Día actual - Indicador sutil */
.agenda-days > div.bg-purple-600\/5 {
  background: rgba(99, 102, 241, 0.04);
  border-bottom: none;
  position: relative;
}

.agenda-days > div.bg-purple-600\/5::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background: #6366F1;
  border-radius: 1px;
}

/* COLUMNA DE HORAS - Más sutil */
.agenda-hours {
  @apply text-[10px] font-normal pr-3 py-2 text-right;
  color: #9CA3AF;
  background: transparent;
  border-right: 1px solid rgba(0, 0, 0, 0.02);
}

/* GRID DE HORARIOS - Líneas casi invisibles */
.agenda-grid {
  @apply grid;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: visible;
  scroll-behavior: smooth;
  background-color: #FFFFFF;
  position: relative;
}

/* GRID VISTA DÍA */
.agenda-grid-dia {
  @apply overflow-y-auto;
  max-height: 70vh;
  scroll-behavior: smooth;
  background-color: #FFFFFF;
  position: relative;
}

.agenda-cell-dia {
  @apply flex items-start gap-4 px-5 py-2.5 transition-all cursor-pointer relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}

.agenda-cell-dia:nth-child(odd) {
  background-color: #FFFFFF;
}

.agenda-cell-dia:nth-child(even) {
  background-color: #FAFAFA;
}

.agenda-cell-dia:hover {
  background-color: rgba(99, 102, 241, 0.03);
}

.hora-dia {
  @apply text-[11px] font-normal w-12 flex-shrink-0 text-right pt-1;
  color: #9CA3AF;
}

/* Indicador de agregar cita - Más sutil */
.add-slot-indicator {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg
         text-gray-400 text-sm
         opacity-0 transition-all duration-300;
}

.agenda-cell-dia:hover .add-slot-indicator {
  @apply opacity-100;
}

.add-slot-indicator .add-icon {
  @apply w-5 h-5 rounded-full flex items-center justify-center text-sm font-normal;
  background: rgba(99, 102, 241, 0.08);
  color: #6366F1;
}

.add-slot-indicator .add-text {
  @apply text-xs font-normal;
  color: #6366F1;
}

.eventos-container {
  @apply flex-1 flex flex-col gap-2;
}

/* ============================================================================
   BLOQUES DE CITAS - Diseño moderno con colores suaves
   ============================================================================ */

.agenda-event-dia {
  @apply relative flex flex-col justify-center rounded-md transition-all;
  padding: 8px 12px;
  border-left-width: 2px;
  border-left-style: solid;
  height: var(--event-height, 3.5rem);
  min-height: 2rem;
}

/* Colores de fondo con alpha muy bajo (0.12) */
.agenda-event-dia[data-estado='pendiente'] {
  background: rgba(245, 158, 11, 0.10);
  border-left-color: #F59E0B;
}
.agenda-event-dia[data-estado='confirmada'] {
  background: rgba(16, 185, 129, 0.10);
  border-left-color: #10B981;
}
.agenda-event-dia[data-estado='realizada'] {
  background: rgba(99, 102, 241, 0.10);
  border-left-color: #6366F1;
}
.agenda-event-dia[data-estado='cancelada'] {
  background: rgba(239, 68, 68, 0.08);
  border-left-color: #EF4444;
  opacity: 0.7;
}

.agenda-event-dia .hora {
  @apply text-[11px] font-normal mb-0.5 leading-none;
  color: #9CA3AF;
}

.agenda-event-dia .nombre {
  @apply text-[13px] font-medium leading-tight;
  color: #374151;
}

/* Hover con elevación sutil */
.agenda-event-dia:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.agenda-event-dia[data-estado='pendiente']:hover {
  background: rgba(245, 158, 11, 0.16);
}
.agenda-event-dia[data-estado='confirmada']:hover {
  background: rgba(16, 185, 129, 0.16);
}
.agenda-event-dia[data-estado='realizada']:hover {
  background: rgba(99, 102, 241, 0.16);
}
.agenda-event-dia[data-estado='cancelada']:hover {
  background: rgba(239, 68, 68, 0.12);
}

/* Tooltip elegante */
.agenda-event-dia .tooltip {
  @apply absolute left-full top-0 ml-3
  text-[11px] px-3 py-2 rounded-lg shadow-xl z-50
  opacity-0 pointer-events-none transition-all whitespace-nowrap;
  background: #1F2937;
  color: white;
  min-width: 160px;
}

.agenda-event-dia:hover .tooltip {
  @apply opacity-100;
}

/* GRID DE HORARIOS SEMANA - Líneas mínimas */
.agenda-cell {
  @apply relative transition-all cursor-pointer;
  min-height: 2.25rem;
  position: relative;
  overflow: visible;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  border-right: 1px solid rgba(0, 0, 0, 0.02);
}

.agenda-cell:hover {
  background-color: rgba(99, 102, 241, 0.03);
}

/* CITA (EVENTO) dentro de celda */
.agenda-cell .agenda-event {
  @apply absolute flex flex-col justify-start rounded-md transition-all;
  padding: 6px 10px;
  border-left-width: 2px;
  border-left-style: solid;
  left: 2px;
  right: 2px;
  height: var(--event-height, 2.5rem) !important;
  max-height: none !important;
  overflow: visible;
  z-index: 10;
  pointer-events: auto;
}

/* Colores con alpha suave */
.agenda-cell .agenda-event[data-estado='pendiente'] {
  background: rgba(245, 158, 11, 0.10);
  border-left-color: #F59E0B;
}
.agenda-cell .agenda-event[data-estado='confirmada'] {
  background: rgba(16, 185, 129, 0.10);
  border-left-color: #10B981;
}
.agenda-cell .agenda-event[data-estado='realizada'] {
  background: rgba(99, 102, 241, 0.10);
  border-left-color: #6366F1;
}
.agenda-cell .agenda-event[data-estado='cancelada'] {
  background: rgba(239, 68, 68, 0.08);
  border-left-color: #EF4444;
  opacity: 0.7;
}

/* Tipografía refinada */
.agenda-cell .agenda-event .hora {
  @apply text-[10px] font-normal mb-0.5 leading-none;
  color: #9CA3AF;
}

.agenda-cell .agenda-event .nombre {
  @apply text-[12px] font-medium truncate leading-tight;
  color: #374151;
}

/* Hover con microinteracción */
.agenda-cell .agenda-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 20;
}

.agenda-cell .agenda-event[data-estado='pendiente']:hover {
  background: rgba(245, 158, 11, 0.18);
}
.agenda-cell .agenda-event[data-estado='confirmada']:hover {
  background: rgba(16, 185, 129, 0.18);
}
.agenda-cell .agenda-event[data-estado='realizada']:hover {
  background: rgba(99, 102, 241, 0.18);
}
.agenda-cell .agenda-event[data-estado='cancelada']:hover {
  background: rgba(239, 68, 68, 0.14);
}

/* TOOLTIP */
.agenda-cell .tooltip {
  @apply absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
  text-[11px] px-3 py-2 rounded-lg shadow-xl z-50
  opacity-0 pointer-events-none transition-all whitespace-nowrap;
  background: #1F2937;
  color: white;
  min-width: 150px;
}

.agenda-cell .agenda-event:hover .tooltip {
  @apply opacity-100;
}

/* Grid optimizations */
.grid {
  container-type: inline-size;
}

/* Drag feedback */
[draggable="true"] {
  cursor: move;
}

/* Transiciones suaves */
* {
  transition-property: background-color, border-color, transform, opacity, box-shadow;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Loading spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Scrollbar minimalista */
.agenda-grid::-webkit-scrollbar,
.agenda-grid-dia::-webkit-scrollbar {
  width: 6px;
}

.agenda-grid::-webkit-scrollbar-track,
.agenda-grid-dia::-webkit-scrollbar-track {
  background: transparent;
}

.agenda-grid::-webkit-scrollbar-thumb,
.agenda-grid-dia::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.agenda-grid::-webkit-scrollbar-thumb:hover,
.agenda-grid-dia::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.18);
}

/* ============================================================================
   VISTA MENSUAL - DISEÑO MODERNO
   ============================================================================ */

/* Contenedor principal de vista mensual */
.agenda-mes-container {
  @apply flex flex-col overflow-hidden;
  background: #FFFFFF;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  display: flex;
}

/* Grid del calendario mensual */
.agenda-mes-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: auto repeat(6, 1fr);
  flex: 1 1 auto;
  overflow: hidden;
  padding: 1rem;
  gap: 4px;
  height: 100%;
  background: #FAFAFA;
}

/* Header: Días de la semana */
.agenda-mes-header {
  @apply text-center py-3;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9CA3AF;
  background: transparent;
}

/* Celda de día individual */
.agenda-dia-mes {
  @apply relative p-2 transition-all cursor-pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  min-height: 0;
  height: 100%;
  background: #FFFFFF;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.agenda-dia-mes:hover {
  background: rgba(99, 102, 241, 0.03);
  border-color: rgba(99, 102, 241, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Indicador de agregar cita en vista mes */
.agenda-dia-mes .add-indicator {
  @apply absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full
         flex items-center justify-center
         text-xs font-normal opacity-0 transition-all duration-300;
  background: rgba(99, 102, 241, 0.08);
  color: #6366F1;
}

.agenda-dia-mes:hover .add-indicator {
  @apply opacity-100;
}

/* Día del mes actual - Indicador elegante */
.agenda-dia-mes.dia-hoy {
  background: rgba(99, 102, 241, 0.04);
  position: relative;
}

.agenda-dia-mes.dia-hoy::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: #6366F1;
  border-radius: 1px;
}

/* Días de otros meses (anterior/siguiente) */
.agenda-dia-mes.dia-otro-mes {
  background: #F9FAFB;
  opacity: 0.5;
}

.agenda-dia-mes.dia-otro-mes .dia-numero {
  color: #D1D5DB;
}

/* Header del día */
.agenda-dia-header {
  @apply flex justify-between items-center mb-1.5;
  flex-shrink: 0;
}

.dia-numero {
  font-size: 13px;
  font-weight: 300;
  color: #374151;
}

.agenda-dia-mes.dia-hoy .dia-numero {
  font-weight: 500;
  color: #6366F1;
}

.contador-citas {
  font-size: 9px;
  font-weight: 500;
  color: white;
  background: #6366F1;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dia-hoy-badge {
  font-size: 9px;
  font-weight: 500;
  color: #6366F1;
  background: rgba(99, 102, 241, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
}

/* Contenedor de eventos del día */
.agenda-dia-eventos {
  @apply flex flex-col gap-1;
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.agenda-dia-eventos::-webkit-scrollbar {
  width: 2px;
}

.agenda-dia-eventos::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 1px;
}

/* Contador de eventos adicionales */
.mas-eventos {
  font-size: 10px;
  font-weight: 500;
  color: #6B7280;
  padding: 4px 8px;
  border-radius: 4px;
  flex-shrink: 0;
  text-align: left;
  background: transparent;
  width: 100%;
  display: block;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mas-eventos:hover {
  background: rgba(99, 102, 241, 0.06);
  color: #6366F1;
}

/* Responsivo: pantallas pequeñas */
@media (max-height: 800px) {
  .agenda-mes-grid {
    padding: 0.5rem;
    gap: 2px;
  }
  .agenda-dia-mes {
    padding: 0.375rem;
  }
}

/* Responsivo: tablets */
@media (max-width: 1024px) {
  .agenda-mes-grid {
    gap: 2px;
    padding: 0.5rem;
  }
  .agenda-dia-mes {
    padding: 0.375rem;
    border-radius: 6px;
  }
  .dia-numero {
    font-size: 11px;
  }
}

/* Responsivo: móviles */
@media (max-width: 640px) {
  .agenda-mes-grid {
    gap: 1px;
    padding: 0.25rem;
  }
  .agenda-dia-mes {
    padding: 0.25rem;
    border-radius: 4px;
  }
  .dia-numero {
    font-size: 10px;
  }
  .dia-hoy-badge {
    font-size: 8px;
    padding: 1px 4px;
  }
  .agenda-mes-header {
    font-size: 9px;
    padding: 0.5rem 0;
  }
  .mas-eventos {
    font-size: 8px;
    padding: 2px 4px;
  }
}

/* ============================================================================
   LÍNEA DE TIEMPO ACTUAL - Diseño refinado
   ============================================================================ */

/* Línea de tiempo - Más delgada y elegante */
.linea-tiempo-actual {
  @apply absolute z-30 pointer-events-none;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #EF4444 5%, #EF4444 95%, transparent 100%);
  transition: top 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Círculo indicador - Más pequeño con borde blanco */
.circulo-tiempo {
  @apply absolute top-1/2 transform -translate-y-1/2;
  left: 2.5rem;
  width: 8px;
  height: 8px;
  background: #EF4444;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

/* Texto de hora actual - Más compacto */
.texto-tiempo {
  @apply absolute top-1/2 transform -translate-y-1/2;
  left: 3.25rem;
  background: #EF4444;
  color: white;
  font-size: 9px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  pointer-events: auto;
}

/* Cita activa - Indicador más sutil */
.cita-activa {
  @apply relative;
  border-left-color: #10B981 !important;
  background: rgba(16, 185, 129, 0.12) !important;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2) !important;
}

.cita-activa::before {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  background: #10B981;
  border-radius: 50%;
  animation: pulseDot 2s ease-in-out infinite;
}

@keyframes pulseDot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}
</style>
