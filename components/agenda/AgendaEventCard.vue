<script setup lang="ts">
// =============================================================================
// COMPONENTE: Tarjeta de Evento/Cita en Agenda
// =============================================================================
// Tarjeta visual para mostrar información compacta de una cita

import type { AgendaEvent } from './types'
import { COLORES_ESTADO } from './types'
import { computed } from 'vue'

// Props
const props = defineProps<{
  event: AgendaEvent
  compact?: boolean
  draggable?: boolean
}>()

// Emits
const emit = defineEmits<{
  open: [id: string]
  menu: [id: string, event: MouseEvent]
}>()

// Computadas
const colores = computed(() => {
  // Fallback seguro: usar estado 'cancelada' como default si no existe
  return COLORES_ESTADO[props.event.estado] || COLORES_ESTADO.cancelada
})

const horaFormateada = computed(() => {
  return `${props.event.horaInicio} – ${props.event.horaFin}`
})

const horaInicio = computed(() => {
  return props.event.horaInicio
})

const nombrePaciente = computed(() => {
  return props.event.pacienteNombre || 'Paciente sin nombre'
})

const iconoEstado = computed(() => {
  const iconos = {
    pendiente: '🟡',
    confirmada: '🟢',
    cancelada: '🔴',
    completada: '⚪',
    realizada: '🔵'
  }
  return iconos[props.event.estado] || '⚪'
})

const tieneBono = computed(() => {
  return props.event.bono && props.event.bono.sesionesRestantes !== undefined
})

const colorSesiones = computed(() => {
  if (!props.event.bono) return 'green'
  const restantes = props.event.bono.sesionesRestantes || 0
  if (restantes === 0) return 'red'
  if (restantes === 1) return 'orange'
  if (restantes <= 2) return 'yellow'
  return 'green'
})

const handleClick = () => {
  emit('open', props.event.id)
}

const handleMenu = (e: MouseEvent) => {
  e.stopPropagation()
  emit('menu', props.event.id, e)
}
</script>

<template>
  <div
    class="agenda-event group"
    :data-estado="event.estado"
    :data-compact="compact"
    :draggable="draggable"
    role="button"
    tabindex="0"
    :title="`${nombrePaciente} - ${horaFormateada}`"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Contenido principal -->
    <div :class="['flex flex-col justify-center', compact ? 'gap-0.5' : 'gap-1']">
      
      <!-- Hora -->
      <span class="hora">
        {{ compact ? horaInicio : horaFormateada }}
      </span>
      
      <!-- Nombre del paciente con punto de estado -->
      <span class="nombre">
        <span class="estado-dot"></span>
        {{ nombrePaciente }}
      </span>

      <!-- Información adicional (solo modo normal) -->
      <div v-if="!compact" class="info-adicional">
        <!-- Modalidad -->
        <span v-if="event.modalidad" class="modalidad">
          <span v-if="event.modalidad === 'online'">💻</span>
          <span v-else>🏥</span>
          {{ event.modalidad === 'online' ? 'Online' : 'Presencial' }}
        </span>

        <!-- Área terapéutica -->
        <span v-if="event.areaTerapeutica" class="area">
          {{ event.areaTerapeutica }}
        </span>

        <!-- Info de bono -->
        <span v-if="tieneBono" class="bono-info" :data-color="colorSesiones">
          {{ event.bono!.sesionesRestantes }}/{{ event.bono!.sesionesTotales }} sesiones
        </span>

        <!-- Indicadores -->
        <div v-if="event.notas || event.terapeuta" class="indicadores">
          <span v-if="event.notas" title="Tiene notas">📝</span>
          <span v-if="event.terapeuta" :title="`Terapeuta: ${event.terapeuta.nombre}`">👤</span>
        </div>
      </div>
    </div>

    <!-- Menú de acciones (solo hover) -->
    <button
      v-if="!compact"
      @click.stop="handleMenu"
      class="menu-btn"
      aria-label="Abrir menú de acciones"
      type="button"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* ============================================================================
   DISEÑO MINIMALISTA PARA TARJETAS DE CITA
   ============================================================================ */

/* Contenedor principal - Fondo neutro con franja lateral */
.agenda-event {
  @apply relative flex flex-col justify-center rounded-lg shadow-sm border border-cafe/10 bg-white dark:bg-zinc-900;
  @apply cursor-pointer transition-all duration-200 ease-out;
  padding: 0.5rem 0.625rem 0.5rem 0.875rem; /* py-2 px-2.5 pl-3.5 */
  min-height: 3.5rem; /* 56px */
}

/* Modo compacto para vista mensual */
.agenda-event[data-compact="true"] {
  padding: 0.25rem 0.375rem 0.25rem 0.5rem; /* Más compacto */
  min-height: 1.75rem; /* 28px - Mucho más pequeño */
}

.agenda-event[data-compact="true"] .hora {
  @apply text-[9px]; /* Texto más pequeño */
}

.agenda-event[data-compact="true"] .nombre {
  @apply text-[10px]; /* Texto más pequeño */
}

.agenda-event[data-compact="true"] .estado-dot {
  width: 0.375rem; /* 6px - Dot más pequeño */
  height: 0.375rem;
}

/* Franja lateral según estado - 4px de ancho */
.agenda-event::before {
  content: '';
  @apply absolute left-0 top-0 h-full rounded-l-lg;
  width: 4px;
}

.agenda-event[data-estado='pendiente']::before { 
  @apply bg-yellow-400;
}
.agenda-event[data-estado='confirmada']::before { 
  @apply bg-green-500;
}
.agenda-event[data-estado='realizada']::before { 
  @apply bg-blue-500;
}
.agenda-event[data-estado='cancelada']::before { 
  @apply bg-red-500;
}

/* Hover - Elevación y escala sutil */
.agenda-event:hover {
  @apply shadow-md bg-white dark:bg-zinc-800;
  transform: scale(1.02) translateY(-1px);
}

/* Focus visible para accesibilidad */
.agenda-event:focus-visible {
  @apply outline-none ring-2 ring-purple-300 ring-offset-2 dark:ring-offset-gray-950;
}

/* ============================================================================
   TIPOGRAFÍA - Jerarquía clara
   ============================================================================ */

/* Hora - Texto pequeño, color suave */
.agenda-event .hora {
  @apply text-[11px] font-medium text-cafe/60 dark:text-zinc-400;
  line-height: 1.2;
}

/* Nombre del paciente - Principal, destacado */
.agenda-event .nombre {
  @apply text-sm font-semibold text-cafe dark:text-zinc-100;
  @apply truncate leading-snug;
  display: flex;
  align-items: center;
  gap: 0.375rem; /* 6px */
}

/* Punto de estado junto al nombre */
.agenda-event .estado-dot {
  @apply inline-block rounded-full flex-shrink-0;
  width: 0.5rem; /* 8px */
  height: 0.5rem; /* 8px */
}

.agenda-event[data-estado='pendiente'] .estado-dot { 
  @apply bg-yellow-400;
}
.agenda-event[data-estado='confirmada'] .estado-dot { 
  @apply bg-green-500;
}
.agenda-event[data-estado='realizada'] .estado-dot { 
  @apply bg-blue-500;
}
.agenda-event[data-estado='cancelada'] .estado-dot { 
  @apply bg-red-500;
}

/* ============================================================================
   INFORMACIÓN ADICIONAL (modo no compacto)
   ============================================================================ */

.info-adicional {
  @apply flex flex-col gap-1 text-[11px] text-cafe/70 dark:text-zinc-400;
}

.modalidad, .area {
  @apply flex items-center gap-1;
}

.bono-info {
  @apply font-semibold text-[10px];
}

/* Colores de bono según sesiones restantes */
.bono-info[data-color="red"] { 
  color: #dc2626; /* red-600 */
}
.bono-info[data-color="red"]:is(.dark *) { 
  color: #f87171; /* red-400 */
}

.bono-info[data-color="orange"] { 
  color: #ea580c; /* orange-600 */
}
.bono-info[data-color="orange"]:is(.dark *) { 
  color: #fb923c; /* orange-400 */
}

.bono-info[data-color="yellow"] { 
  color: #ca8a04; /* yellow-600 */
}
.bono-info[data-color="yellow"]:is(.dark *) { 
  color: #facc15; /* yellow-400 */
}

.bono-info[data-color="green"] { 
  color: #16a34a; /* green-600 */
}
.bono-info[data-color="green"]:is(.dark *) { 
  color: #4ade80; /* green-400 */
}

.indicadores {
  @apply flex items-center gap-1.5 mt-0.5;
}

/* ============================================================================
   BOTÓN DE MENÚ
   ============================================================================ */

.menu-btn {
  @apply absolute top-1.5 right-1.5;
  @apply p-1 rounded-md opacity-0 transition-opacity;
  @apply hover:bg-cafe/10 dark:hover:bg-zinc-700;
  @apply text-cafe/60 dark:text-zinc-400;
}

.agenda-event:hover .menu-btn {
  @apply opacity-100;
}

/* ============================================================================
   DRAG & DROP
   ============================================================================ */

.agenda-event[draggable="true"] {
  @apply cursor-move;
}

.agenda-event[draggable="true"]:active {
  @apply opacity-60 cursor-grabbing;
  transform: scale(0.98);
}

/* ============================================================================
   ANIMACIÓN DE APARICIÓN (opcional)
   ============================================================================ */

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.agenda-event {
  animation: fadeInScale 0.2s ease-out;
}

/* ============================================================================
   OPTIMIZACIONES DE RENDIMIENTO
   ============================================================================ */

.agenda-event:hover {
  will-change: transform, box-shadow;
}

.menu-btn {
  will-change: opacity;
}
</style>
