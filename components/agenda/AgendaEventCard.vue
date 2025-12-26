<script setup lang="ts">
// =============================================================================
// COMPONENTE: Tarjeta de Evento/Cita en Agenda
// =============================================================================
// Tarjeta visual interactiva para mostrar información compacta de una cita
// Soporta click para ver detalles, confirmación rápida y accesibilidad completa

import type { AgendaEvent } from './types'
import { COLORES_ESTADO } from './types'
import { computed } from 'vue'
import { CheckIcon } from '@heroicons/vue/24/solid'

// Props
const props = defineProps<{
  event: AgendaEvent
  compact?: boolean
  draggable?: boolean
  confirmando?: boolean // Indica si está en proceso de confirmación
}>()

// Emits
const emit = defineEmits<{
  open: [id: string]
  menu: [id: string, event: MouseEvent]
  confirmar: [id: string] // Nuevo: confirmación rápida
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

// Aria-label descriptivo para accesibilidad
const ariaLabel = computed(() => {
  const estado = props.event.estado === 'pendiente' ? 'pendiente' :
                 props.event.estado === 'confirmada' ? 'confirmada' :
                 props.event.estado === 'realizada' ? 'realizada' : 'cancelada'
  const modalidad = props.event.modalidad === 'online' ? 'online' : 'presencial'
  const terapeuta = props.event.terapeuta?.nombre ? `, con ${props.event.terapeuta.nombre}` : ''

  return `Cita ${estado} de ${nombrePaciente.value}, ${horaFormateada.value}, ${modalidad}${terapeuta}. Pulsa para ver detalles${props.event.estado === 'pendiente' ? ' o confirmar' : ''}.`
})

// Verificar si se puede confirmar
const puedeConfirmar = computed(() => props.event.estado === 'pendiente')

const handleClick = () => {
  emit('open', props.event.id)
}

const handleMenu = (e: MouseEvent) => {
  e.stopPropagation()
  emit('menu', props.event.id, e)
}

// Confirmación rápida
const handleConfirmarRapido = (e: MouseEvent) => {
  e.stopPropagation()
  if (puedeConfirmar.value && !props.confirmando) {
    emit('confirmar', props.event.id)
  }
}
</script>

<template>
  <div
    class="agenda-event group"
    :class="{ 'confirmando': confirmando }"
    :data-estado="event.estado"
    :data-compact="compact"
    :draggable="draggable"
    role="button"
    tabindex="0"
    :aria-label="ariaLabel"
    :title="`${nombrePaciente} - ${horaFormateada}. Click para ver detalles.`"
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

    <!-- Botón de confirmación rápida (solo para citas pendientes) -->
    <button
      v-if="!compact && puedeConfirmar"
      @click="handleConfirmarRapido"
      class="confirm-btn"
      :class="{ 'confirming': confirmando }"
      :disabled="confirmando"
      :aria-label="`Confirmar cita de ${nombrePaciente}`"
      :title="confirmando ? 'Confirmando...' : 'Confirmar cita rápidamente'"
      type="button"
    >
      <svg v-if="confirmando" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <CheckIcon v-else class="w-3.5 h-3.5" />
    </button>

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
   MODERN MINIMALIST EVENT CARD DESIGN
   ============================================================================ */

/* Contenedor principal - Diseño limpio con colores suaves */
.agenda-event {
  @apply relative flex flex-col justify-center cursor-pointer;
  padding: 6px 10px 6px 12px;
  min-height: 2.5rem;
  border-radius: 6px;
  border-left-width: 2px;
  border-left-style: solid;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Colores de fondo con alpha muy bajo */
.agenda-event[data-estado='pendiente'] {
  background: rgba(245, 158, 11, 0.10);
  border-left-color: #F59E0B;
}
.agenda-event[data-estado='confirmada'] {
  background: rgba(16, 185, 129, 0.10);
  border-left-color: #10B981;
}
.agenda-event[data-estado='realizada'] {
  background: rgba(99, 102, 241, 0.10);
  border-left-color: #6366F1;
}
.agenda-event[data-estado='cancelada'] {
  background: rgba(239, 68, 68, 0.08);
  border-left-color: #EF4444;
  opacity: 0.7;
}

/* Modo compacto para vista mensual */
.agenda-event[data-compact="true"] {
  padding: 3px 6px 3px 8px;
  min-height: 1.5rem;
  border-radius: 4px;
}

.agenda-event[data-compact="true"] .hora {
  font-size: 9px;
}

.agenda-event[data-compact="true"] .nombre {
  font-size: 10px;
}

.agenda-event[data-compact="true"] .estado-dot {
  width: 4px;
  height: 4px;
}

/* Hover - Elevación sutil */
.agenda-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.agenda-event[data-estado='pendiente']:hover {
  background: rgba(245, 158, 11, 0.16);
}
.agenda-event[data-estado='confirmada']:hover {
  background: rgba(16, 185, 129, 0.16);
}
.agenda-event[data-estado='realizada']:hover {
  background: rgba(99, 102, 241, 0.16);
}
.agenda-event[data-estado='cancelada']:hover {
  background: rgba(239, 68, 68, 0.12);
}

/* Focus visible para accesibilidad */
.agenda-event:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4);
}

/* ============================================================================
   TIPOGRAFÍA - Refinada
   ============================================================================ */

/* Hora - Texto pequeño, color gris suave */
.agenda-event .hora {
  font-size: 10px;
  font-weight: 400;
  color: #9CA3AF;
  line-height: 1.2;
}

/* Nombre del paciente - Principal */
.agenda-event .nombre {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 5px;
  line-height: 1.3;
}

.agenda-event .nombre span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Punto de estado junto al nombre */
.agenda-event .estado-dot {
  display: inline-block;
  border-radius: 50%;
  flex-shrink: 0;
  width: 6px;
  height: 6px;
}

.agenda-event[data-estado='pendiente'] .estado-dot {
  background-color: #F59E0B;
}
.agenda-event[data-estado='confirmada'] .estado-dot {
  background-color: #10B981;
}
.agenda-event[data-estado='realizada'] .estado-dot {
  background-color: #6366F1;
}
.agenda-event[data-estado='cancelada'] .estado-dot {
  background-color: #EF4444;
}

/* ============================================================================
   INFORMACIÓN ADICIONAL (modo no compacto)
   ============================================================================ */

.info-adicional {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 4px;
  font-size: 10px;
  color: #6B7280;
}

.modalidad, .area {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bono-info {
  font-size: 9px;
  font-weight: 500;
}

/* Colores de bono según sesiones restantes */
.bono-info[data-color="red"] {
  color: #EF4444;
}
.bono-info[data-color="orange"] {
  color: #F97316;
}
.bono-info[data-color="yellow"] {
  color: #EAB308;
}
.bono-info[data-color="green"] {
  color: #10B981;
}

.indicadores {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

/* ============================================================================
   BOTÓN DE CONFIRMACIÓN RÁPIDA
   ============================================================================ */

.confirm-btn {
  position: absolute;
  top: 4px;
  right: 28px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.2s ease;
  color: white;
  background: #10B981;
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.4);
}

.confirm-btn:hover {
  background: #059669;
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.5);
}

.confirm-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #10B981;
}

.confirm-btn.confirming {
  background: #059669;
  cursor: wait;
}

.agenda-event:hover .confirm-btn,
.agenda-event:focus-within .confirm-btn {
  opacity: 1;
}

/* Solo mostrar en citas pendientes */
.agenda-event[data-estado='confirmada'] .confirm-btn,
.agenda-event[data-estado='realizada'] .confirm-btn,
.agenda-event[data-estado='cancelada'] .confirm-btn {
  display: none;
}

/* Estado de confirmando en la tarjeta */
.agenda-event.confirmando {
  opacity: 0.7;
  pointer-events: none;
}

/* ============================================================================
   BOTÓN DE MENÚ
   ============================================================================ */

.menu-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 4px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #9CA3AF;
}

.menu-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #6B7280;
}

.agenda-event:hover .menu-btn,
.agenda-event:focus-within .menu-btn {
  opacity: 1;
}

/* ============================================================================
   DRAG & DROP
   ============================================================================ */

.agenda-event[draggable="true"] {
  cursor: move;
}

.agenda-event[draggable="true"]:active {
  opacity: 0.6;
  cursor: grabbing;
  transform: scale(0.98);
}

/* ============================================================================
   ANIMACIÓN DE APARICIÓN
   ============================================================================ */

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.agenda-event {
  animation: fadeIn 0.15s ease-out;
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
