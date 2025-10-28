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
const zoomLevel = ref<'compact' | 'normal' | 'comfortable'>('normal')
const gridContainer = ref<HTMLElement | null>(null)
const lineaTiempoTop = ref<string>('0px') // Posición en píxeles
const lineaTiempoVisible = ref<boolean>(false) // Si está visible
const citasActivas = ref<Set<string>>(new Set()) // IDs de citas activas
let intervaloTiempo: NodeJS.Timeout | null = null

// Constantes
const HORAS_TRABAJO = generarBloquesHorarios('08:00', '22:30', 30) // Bloques de 30 minutos hasta las 22:30 (para incluir citas hasta 22:00)

// Altura según zoom
const alturaSlot = computed(() => {
  switch (zoomLevel.value) {
    case 'compact': return 'h-8'
    case 'normal': return 'h-10'
    case 'comfortable': return 'h-16'
    default: return 'h-10'
  }
})

// Cargar zoom desde localStorage
if (process.client) {
  const savedZoom = localStorage.getItem('agenda_zoom')
  if (savedZoom && ['compact', 'normal', 'comfortable'].includes(savedZoom)) {
    zoomLevel.value = savedZoom as any
  }
}

// Guardar zoom
const setZoom = (level: 'compact' | 'normal' | 'comfortable') => {
  zoomLevel.value = level
  if (process.client) {
    localStorage.setItem('agenda_zoom', level)
  }
}

// Computadas - Fechas según vista
const fechas = computed(() => {
  const fechaStr = props.fechaActual.toISOString().split('T')[0]!
  
  if (props.vista === 'dia') {
    return [fechaStr]
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
    
    // Altura base por CELDA (cada celda = 30 minutos en HORAS_TRABAJO)
    // Una celda de 30 min = 2.25rem en compact, 3.5rem en normal, 5rem en comfortable
    const alturaPorCelda = zoomLevel.value === 'compact' ? 2.25 : zoomLevel.value === 'normal' ? 3.5 : 5
    const alturaPor30Min = alturaPorCelda // cada celda es de 30 min
    const alturaPorMinuto = alturaPor30Min / 30 // no 60, porque las celdas son de 30 min
    
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
    
    // Altura base por celda (30 minutos)
    const alturaPorCelda = zoomLevel.value === 'compact' ? 2.25 : zoomLevel.value === 'normal' ? 3.5 : 5
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
    // Calcular posición de scroll
    const alturaPromedio = zoomLevel.value === 'compact' ? 40 : zoomLevel.value === 'normal' ? 56 : 80
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
    
    // Altura de cada celda según zoom (1 celda = 30 minutos)
    // Usamos las alturas exactas del template
    const alturaCelda = zoomLevel.value === 'compact' ? 40 : // 2.5rem
                        zoomLevel.value === 'normal' ? 56 :   // 3.5rem
                        80 // 5rem (comfortable)
    
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

watch([() => props.vista, () => props.cargando, zoomLevel], () => {
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
        <div class="w-12 h-12 border-4 border-terracota/20 border-t-terracota rounded-full animate-spin mx-auto" />
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

      <!-- Selector de Zoom -->
      <div class="zoom-toggle">
        <span class="text-xs text-cafe/60">Zoom:</span>
        <button
          @click="setZoom('compact')"
          :class="[
            'px-2 py-1 rounded-md transition-all',
            zoomLevel === 'compact' ? 'bg-terracota text-white' : 'hover:bg-terracota/10'
          ]"
        >
          Compacto
        </button>
        <button
          @click="setZoom('normal')"
          :class="[
            'px-2 py-1 rounded-md transition-all',
            zoomLevel === 'normal' ? 'bg-terracota text-white' : 'hover:bg-terracota/10'
          ]"
        >
          Normal
        </button>
        <button
          @click="setZoom('comfortable')"
          :class="[
            'px-2 py-1 rounded-md transition-all',
            zoomLevel === 'comfortable' ? 'bg-terracota text-white' : 'hover:bg-terracota/10'
          ]"
        >
          Cómodo
        </button>
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
          class="agenda-cell-dia"
          :class="idx % 2 === 0 ? 'bg-white' : 'bg-[#FFFAF7]'"
          :style="{ minHeight: zoomLevel === 'compact' ? '2.5rem' : zoomLevel === 'normal' ? '3.5rem' : '5rem' }"
          @click="handleSlotClick(fechas[0]!, hora)"
        >
          <!-- Hora -->
          <div class="hora-dia">
            {{ hora }}
          </div>

          <!-- Eventos en esta hora -->
          <div class="eventos-container">
            <div
              v-for="(evento, idx) in obtenerEventosEnSlot(fechas[0]!, hora)"
              :key="`${evento.id}-${idx}`"
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
              
              <!-- Info adicional en vista día -->
              <div v-if="zoomLevel !== 'compact'" class="info-extra">
                <span v-if="evento.modalidad" class="text-[10px]">
                  {{ evento.modalidad === 'online' ? '💻' : '🏥' }}
                </span>
                <span v-if="evento.areaTerapeutica" class="text-[10px] text-cafe/60">
                  {{ evento.areaTerapeutica }}
                </span>
              </div>

              <!-- Tooltip -->
              <div class="tooltip">
                <div class="font-semibold">{{ evento.pacienteNombre }}</div>
                <div>{{ evento.horaInicio }} - {{ evento.horaFin }}</div>
                <div v-if="evento.modalidad">{{ evento.modalidad === 'online' ? '💻 Online' : '🏥 Presencial' }}</div>
                <div v-if="evento.areaTerapeutica" class="text-[10px] opacity-80">{{ evento.areaTerapeutica }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista SEMANA -->
    <div v-if="!cargando && vista === 'semana'" class="agenda-container">
      <!-- Header: días de la semana (sticky) -->
      <div class="agenda-days">
        <div class="col-span-1"></div> <!-- Espacio para columna de horas -->
        <div
          v-for="fecha in fechas"
          :key="fecha"
          class="py-2 px-1"
          :class="esFechaHoy(fecha) ? 'bg-terracota/5 border-b-2 border-terracota' : ''"
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
      <div ref="gridContainer" class="agenda-grid">
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
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ============================================================================
   OPTIMIZACIÓN DE VISUALIZACIÓN DE AGENDA
   ============================================================================ */

/* CONTROLES SUPERIORES */
.agenda-controls {
  @apply flex justify-between items-center py-2 px-4 border-b border-cafe/10 bg-white;
}

/* LEYENDA DE ESTADOS */
.leyenda-estados {
  @apply flex items-center justify-start gap-3 text-xs text-cafe/80;
}

.leyenda-estados .estado {
  @apply flex items-center gap-2;
}

.leyenda-estados .dot {
  @apply w-3 h-3 rounded-full flex-shrink-0;
}

.dot[data-color='pendiente'] { 
  @apply bg-yellow-400; 
}
.dot[data-color='confirmada'] { 
  @apply bg-green-500; 
}
.dot[data-color='realizada'] { 
  @apply bg-blue-500; 
}
.dot[data-color='cancelada'] { 
  @apply bg-red-500; 
}

/* SELECTOR DE ZOOM */
.zoom-toggle {
  @apply flex items-center gap-2 text-xs text-cafe/70;
}

.zoom-toggle button {
  @apply px-2 py-1 text-xs transition-all;
}

/* Contenedor principal */
.agenda-container {
  @apply relative bg-white rounded-2xl shadow-sm border border-cafe/5 overflow-hidden;
}

/* CABECERA DE DÍAS */
.agenda-days {
  @apply sticky top-0 z-10 grid grid-cols-8 text-center bg-[#FFFAF7] border-b border-cafe/10;
}

/* COLUMNA DE HORAS */
.agenda-hours {
  @apply text-[11px] font-medium text-cafe/50 pr-2 py-2 border-r border-cafe/10 text-right;
  background: linear-gradient(to right, #FFFAF7 0%, white 100%);
}

/* GRID DE HORARIOS */
.agenda-grid {
  @apply grid grid-cols-8 gap-px;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: visible; /* Permitir que eventos se extiendan */
  scroll-behavior: smooth;
  background-color: #F5F5F5;
  position: relative; /* Contexto para posicionamiento */
}

/* GRID VISTA DÍA */
.agenda-grid-dia {
  @apply overflow-y-auto;
  max-height: 70vh;
  scroll-behavior: smooth;
  background-color: #F5F5F5;
}

.agenda-cell-dia {
  @apply flex items-start gap-3 px-4 py-2 border-b border-cafe/10 transition-all cursor-pointer;
}

.agenda-cell-dia:hover {
  @apply bg-[#FDF8F5];
}

.hora-dia {
  @apply text-xs font-medium text-cafe/50 w-14 flex-shrink-0 text-right pt-1;
}

.eventos-container {
  @apply flex-1 flex flex-col gap-2;
}

.agenda-event-dia {
  @apply relative flex flex-col justify-center px-3 py-2 bg-white rounded-lg shadow-sm transition-all text-xs text-cafe;
  border-left-width: 4px;
  border-left-style: solid;
  /* Altura dinámica basada en duración */
  height: var(--event-height, 3.5rem);
  min-height: 2rem;
}

.agenda-event-dia[data-estado='pendiente'] { 
  @apply border-yellow-400; 
}
.agenda-event-dia[data-estado='confirmada'] { 
  @apply border-green-500; 
}
.agenda-event-dia[data-estado='realizada'] { 
  @apply border-blue-500; 
}
.agenda-event-dia[data-estado='cancelada'] { 
  @apply border-red-500 opacity-70; 
}

.agenda-event-dia .hora {
  @apply text-[10px] font-medium text-cafe/60 mb-1 leading-none;
}

.agenda-event-dia .nombre {
  @apply text-sm font-semibold text-cafe leading-tight;
}

.agenda-event-dia .info-extra {
  @apply flex items-center gap-2 mt-1 text-cafe/60;
}

.agenda-event-dia:hover {
  @apply bg-[#FFFDFB] shadow-md scale-[1.01];
}

.agenda-event-dia .tooltip {
  @apply absolute left-full top-0 ml-2 
  bg-cafe text-white text-[11px] px-3 py-2 rounded-lg shadow-lg z-50 
  opacity-0 pointer-events-none transition-all whitespace-nowrap;
  min-width: 150px;
}

.agenda-event-dia:hover .tooltip {
  @apply opacity-100;
}

/* GRID DE HORARIOS SEMANA */
.agenda-cell {
  @apply relative border-b border-cafe/10 transition-all cursor-pointer;
  min-height: 2.25rem; /* Compacta */
  position: relative; /* Asegurar contexto de posicionamiento */
  overflow: visible; /* CLAVE: Permitir que los eventos se extiendan fuera */
}

.agenda-cell:hover {
  @apply bg-[#FDF8F5];
}

/* CITA (EVENTO) dentro de celda - OCUPA TODO EL LARGO */
.agenda-cell .agenda-event {
  @apply absolute flex flex-col justify-start px-2 py-1.5 bg-white rounded-md shadow-sm transition-all text-xs text-cafe;
  border-left-width: 4px;
  border-left-style: solid;
  left: 1px;
  right: 1px;
  /* Altura dinámica basada en duración */
  height: var(--event-height, 2.5rem) !important;
  max-height: none !important;
  overflow: visible; /* Para tooltips */
  z-index: 10; /* Para que se superponga a otras celdas */
  pointer-events: auto; /* Asegurar que siga siendo clickeable */
}

.agenda-cell .agenda-event[data-estado='pendiente'] { 
  @apply border-yellow-400; 
}
.agenda-cell .agenda-event[data-estado='confirmada'] { 
  @apply border-green-500; 
}
.agenda-cell .agenda-event[data-estado='realizada'] { 
  @apply border-blue-500; 
}
.agenda-cell .agenda-event[data-estado='cancelada'] { 
  @apply border-red-500 opacity-70; 
}

/* Jerarquía interna del evento */
.agenda-cell .agenda-event .hora {
  @apply text-[10px] font-medium text-cafe/60 mb-[2px] leading-none;
}

.agenda-cell .agenda-event .nombre {
  @apply text-xs font-semibold text-cafe truncate leading-tight;
}

.agenda-cell .agenda-event:hover {
  @apply bg-[#FFFDFB] scale-[1.02] shadow-md z-10;
}

/* TOOLTIP */
.agenda-cell .tooltip {
  @apply absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
  bg-cafe text-white text-[11px] px-3 py-2 rounded-lg shadow-lg z-50 
  opacity-0 pointer-events-none transition-all whitespace-nowrap;
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

/* Smooth animations */
* {
  transition-property: background-color, border-color, transform, opacity;
  transition-duration: 150ms;
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

/* Scroll automático suave */
.agenda-grid::-webkit-scrollbar {
  width: 8px;
}

.agenda-grid::-webkit-scrollbar-track {
  @apply bg-cafe/5 rounded-full;
}

.agenda-grid::-webkit-scrollbar-thumb {
  @apply bg-cafe/20 rounded-full hover:bg-cafe/30;
}

/* ============================================================================
   VISTA MENSUAL - DISEÑO OPTIMIZADO
   ============================================================================ */

/* Contenedor principal de vista mensual */
.agenda-mes-container {
  @apply flex flex-col overflow-hidden bg-white dark:bg-zinc-950;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  display: flex;
}

/* Grid del calendario mensual */
.agenda-mes-grid {
  @apply gap-[1px] bg-cafe/5 dark:bg-zinc-800/50;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: auto repeat(6, 1fr); /* Header + max 6 semanas */
  flex: 1 1 auto;
  overflow: hidden; /* Sin scroll */
  padding: 0.75rem;
  height: 100%;
}

/* Header: Días de la semana */
.agenda-mes-header {
  @apply sticky top-0 z-10 text-center font-semibold text-xs text-cafe/70 dark:text-zinc-400 py-3 bg-[#FFFAF7] dark:bg-zinc-900 border-b-2 border-cafe/20 dark:border-zinc-700;
}

/* Celda de día individual */
.agenda-dia-mes {
  @apply relative bg-white dark:bg-zinc-950 border border-cafe/10 dark:border-zinc-800 p-1.5 rounded-lg transition-all cursor-pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  min-height: 0;
  height: 100%;
}

.agenda-dia-mes:hover {
  @apply bg-[#FFF8F4] dark:bg-zinc-900/80 shadow-md border-terracota/30 dark:border-terracota/40;
  transform: scale(1.005);
  z-index: 5;
}

/* Día del mes actual */
.agenda-dia-mes.dia-hoy {
  @apply ring-2 ring-terracota dark:ring-terracota/80 bg-terracota/5 dark:bg-terracota/10;
  position: relative;
}

.agenda-dia-mes.dia-hoy::after {
  content: '';
  @apply absolute inset-0 pointer-events-none;
  background: linear-gradient(135deg, rgba(201, 124, 93, 0.05) 0%, transparent 100%);
  border-radius: 0.5rem;
}

/* Días de otros meses (anterior/siguiente) */
.agenda-dia-mes.dia-otro-mes {
  @apply bg-zinc-50 dark:bg-zinc-900/30 opacity-60;
}

.agenda-dia-mes.dia-otro-mes .dia-numero {
  @apply text-cafe/40 dark:text-zinc-600;
}

/* Header del día */
.agenda-dia-header {
  @apply flex justify-between items-center text-xs font-semibold mb-1;
  flex-shrink: 0;
}

.dia-numero {
  @apply text-xs font-bold text-cafe dark:text-zinc-300;
}

.contador-citas {
  @apply text-[9px] font-bold text-white dark:text-zinc-900;
  @apply bg-terracota dark:bg-terracota/90 rounded-full;
  @apply flex items-center justify-center;
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.25rem;
}

.dia-hoy-badge {
  @apply text-[9px] font-semibold text-terracota dark:text-terracota/90 bg-terracota/10 dark:bg-terracota/20 px-1.5 py-0.5 rounded-full;
}

/* Contenedor de eventos del día */
.agenda-dia-eventos {
  @apply flex flex-col gap-0.5;
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.agenda-dia-eventos::-webkit-scrollbar {
  width: 3px;
}

.agenda-dia-eventos::-webkit-scrollbar-thumb {
  @apply bg-cafe/20 dark:bg-zinc-600 rounded-full;
}

/* Contador de eventos adicionales */
.mas-eventos {
  @apply text-[9px] text-cafe/70 dark:text-zinc-400 font-semibold px-2 py-1 rounded-md;
  @apply hover:bg-cafe/10 dark:hover:bg-zinc-800 hover:text-cafe dark:hover:text-zinc-200;
  @apply transition-all cursor-pointer;
  @apply border border-transparent hover:border-cafe/20 dark:hover:border-zinc-700;
  flex-shrink: 0;
  text-align: left;
  background: transparent;
  width: 100%;
  display: block;
}

.mas-eventos:hover {
  transform: translateX(2px);
}

/* Responsivo: pantallas pequeñas */
@media (max-height: 800px) {
  .agenda-mes-grid {
    padding: 0.5rem;
  }
  .agenda-dia-mes {
    padding: 0.375rem;
  }
}

/* Responsivo: tablets */
@media (max-width: 1024px) {
  .agenda-mes-grid {
    gap: 0.5px;
    padding: 0.5rem;
  }
  .agenda-dia-mes {
    padding: 0.375rem;
  }
  .dia-numero {
    font-size: 0.7rem;
  }
}

/* Responsivo: móviles */
@media (max-width: 640px) {
  .agenda-mes-grid {
    gap: 0;
    padding: 0.25rem;
  }
  .agenda-dia-mes {
    padding: 0.25rem;
    border-radius: 0.375rem;
  }
  .dia-numero {
    font-size: 0.625rem;
  }
  .dia-hoy-badge {
    font-size: 0.5rem;
    padding: 0.125rem 0.25rem;
  }
  .agenda-mes-header {
    font-size: 0.625rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  .mas-eventos {
    font-size: 0.5rem;
    padding: 0.25rem 0.5rem;
  }
}

/* ============================================================================
   LÍNEA DE TIEMPO ACTUAL Y CITAS ACTIVAS
   ============================================================================ */

/* Línea roja de tiempo en vivo */
.linea-tiempo-actual {
  @apply absolute z-30 pointer-events-none;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #e63946 10%, #e63946 90%, transparent 100%);
  box-shadow: 0 0 8px rgba(230, 57, 70, 0.6), 0 0 16px rgba(230, 57, 70, 0.3);
  transition: top 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Círculo indicador en la línea */
.circulo-tiempo {
  @apply absolute -left-1 top-1/2 transform -translate-y-1/2;
  width: 10px;
  height: 10px;
  background: #e63946;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.2);
  animation: pulsoTiempo 2s ease-in-out infinite;
}

/* Texto de hora actual */
.texto-tiempo {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2;
  @apply bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md;
  pointer-events: auto;
}

@keyframes pulsoTiempo {
  0%, 100% {
    transform: translateY(-50%) scale(1);
    box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.2);
  }
  50% {
    transform: translateY(-50%) scale(1.2);
    box-shadow: 0 0 0 6px rgba(230, 57, 70, 0.1);
  }
}

/* Cita activa (está ocurriendo ahora) */
.cita-activa {
  @apply relative;
  border-left-color: #10b981 !important; /* Verde brillante */
  background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%) !important;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3), 0 4px 12px rgba(16, 185, 129, 0.2) !important;
  animation: pulsoActivo 2s ease-in-out infinite;
}

.cita-activa::before {
  content: '🔴';
  @apply absolute -top-1 -right-1 text-xs;
  animation: parpadeo 1.5s ease-in-out infinite;
}

@keyframes pulsoActivo {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3), 0 4px 12px rgba(16, 185, 129, 0.2);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2), 0 6px 16px rgba(16, 185, 129, 0.3);
  }
}

@keyframes parpadeo {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
