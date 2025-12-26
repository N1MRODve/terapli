<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: Header Unificado de Agenda (Coordinadora)
 * =============================================================================
 * Barra superior unificada que combina:
 * - Rango de fechas actual
 * - Navegación temporal (anterior/hoy/siguiente)
 * - Selector de vista compacto
 * - Botones de acción principales
 */

import { computed } from 'vue'
import { PlusIcon, ClipboardDocumentListIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

// ============================================================================
// PROPS Y EMITS
// ============================================================================

interface Props {
  vista: 'dia' | 'lista' | 'calendario'
  fechaActual: Date
  loading?: boolean
  modoCoordinadora?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  modoCoordinadora: false
})

const emit = defineEmits<{
  'cambiar-vista': [vista: 'dia' | 'lista' | 'calendario']
  'navegar-fecha': [direccion: number]
  'ir-hoy': []
  'actualizar': []
  'nueva-cita': []
  'nueva-tarea': []
}>()

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

// Calcular número de semana
const numeroSemana = computed(() => {
  const fecha = new Date(props.fechaActual)
  const primerDiaAño = new Date(fecha.getFullYear(), 0, 1)
  const diasTranscurridos = Math.floor((fecha.getTime() - primerDiaAño.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((diasTranscurridos + primerDiaAño.getDay() + 1) / 7)
})

// Calcular rango de fechas de la semana actual
const rangoSemana = computed(() => {
  const fecha = new Date(props.fechaActual)
  const diaSemana = fecha.getDay()
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana

  const inicio = new Date(fecha)
  inicio.setDate(fecha.getDate() + diff)

  const fin = new Date(inicio)
  fin.setDate(inicio.getDate() + 6)

  const formatoCorto = (d: Date) => d.getDate()
  const mes = (d: Date) => d.toLocaleDateString('es-ES', { month: 'short' })
  const año = (d: Date) => d.getFullYear()

  // Si mismo mes: "22–28 dic 2025"
  // Si diferente mes: "28 dic – 3 ene 2025"
  if (inicio.getMonth() === fin.getMonth()) {
    return `${formatoCorto(inicio)}–${formatoCorto(fin)} ${mes(fin)} ${año(fin)}`
  } else {
    return `${formatoCorto(inicio)} ${mes(inicio)} – ${formatoCorto(fin)} ${mes(fin)} ${año(fin)}`
  }
})

// Formatear fecha para vista día
const fechaDia = computed(() => {
  return props.fechaActual.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Título según vista
const tituloTemporal = computed(() => {
  if (props.vista === 'dia') {
    const f = fechaDia.value
    return f.charAt(0).toUpperCase() + f.slice(1)
  }
  return `Semana ${numeroSemana.value} · ${rangoSemana.value}`
})

// Vistas disponibles
const vistas = [
  { value: 'dia' as const, label: 'Día' },
  { value: 'calendario' as const, label: 'Semana' },
  { value: 'lista' as const, label: 'Lista' }
]

// Texto de navegación según vista
const textoNavegacion = computed(() => {
  return props.vista === 'dia'
    ? { anterior: 'Día anterior', siguiente: 'Día siguiente' }
    : { anterior: 'Semana anterior', siguiente: 'Semana siguiente' }
})
</script>

<template>
  <header class="agenda-unified-header">
    <!-- Lado izquierdo: Título temporal y navegación -->
    <div class="header-left">
      <!-- Título con rango de fechas -->
      <h1 class="header-title">{{ tituloTemporal }}</h1>

      <!-- Controles de navegación -->
      <nav class="nav-controls" aria-label="Navegación temporal">
        <button
          @click="emit('navegar-fecha', -1)"
          class="nav-btn"
          :aria-label="textoNavegacion.anterior"
          :title="textoNavegacion.anterior"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          @click="emit('ir-hoy')"
          class="nav-today"
        >
          Hoy
        </button>

        <button
          @click="emit('navegar-fecha', 1)"
          class="nav-btn"
          :aria-label="textoNavegacion.siguiente"
          :title="textoNavegacion.siguiente"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>

    <!-- Centro: Selector de vista -->
    <div class="header-center">
      <div class="view-selector" role="tablist">
        <button
          v-for="v in vistas"
          :key="v.value"
          @click="emit('cambiar-vista', v.value)"
          role="tab"
          :aria-selected="vista === v.value"
          class="view-btn"
          :class="{ 'active': vista === v.value }"
        >
          {{ v.label }}
        </button>
      </div>
    </div>

    <!-- Lado derecho: Acciones principales -->
    <div class="header-right">
      <!-- Botón actualizar -->
      <button
        @click="emit('actualizar')"
        :disabled="loading"
        class="action-btn action-btn-secondary"
        aria-label="Actualizar agenda"
        title="Actualizar"
      >
        <ArrowPathIcon :class="['w-4 h-4', loading ? 'animate-spin' : '']" />
      </button>

      <!-- Botón nueva tarea (secundario) -->
      <button
        v-if="modoCoordinadora"
        @click="emit('nueva-tarea')"
        class="action-btn action-btn-secondary"
        aria-label="Crear nueva tarea"
      >
        <ClipboardDocumentListIcon class="w-4 h-4" />
        <span class="hidden sm:inline">Nueva tarea</span>
      </button>

      <!-- Botón nueva cita (primario) -->
      <button
        @click="emit('nueva-cita')"
        class="action-btn action-btn-primary"
        aria-label="Crear nueva cita"
      >
        <PlusIcon class="w-4 h-4" />
        <span>Nueva cita</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
/* ============================================================================
   HEADER UNIFICADO - DISEÑO ELEGANTE Y MODERNO
   ============================================================================ */

.agenda-unified-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(255,255,255,0.95));
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* LADO IZQUIERDO */
.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.header-title {
  font-family: 'Elms Sans', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

/* Navegación temporal */
.nav-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #F3F4F6;
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.375rem;
  color: #6B7280;
  transition: all 0.15s ease;
}

.nav-btn:hover {
  background: white;
  color: #1F2937;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.nav-today {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0D9488;
  border-radius: 0.375rem;
  transition: all 0.15s ease;
}

.nav-today:hover {
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* CENTRO - Selector de vista */
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.view-selector {
  display: flex;
  background: #F3F4F6;
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.view-btn {
  padding: 0.375rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6B7280;
  border-radius: 0.375rem;
  transition: all 0.15s ease;
}

.view-btn:hover:not(.active) {
  color: #374151;
}

.view-btn.active {
  background: white;
  color: #1F2937;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* LADO DERECHO - Acciones */
.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.action-btn-secondary {
  color: #374151;
  background: white;
  border: 1px solid #E5E7EB;
}

.action-btn-secondary:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.action-btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn-primary {
  color: white;
  background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
  border: none;
  box-shadow: 0 1px 3px rgba(13, 148, 136, 0.3);
}

.action-btn-primary:hover {
  background: linear-gradient(135deg, #0F766E 0%, #115E59 100%);
  box-shadow: 0 2px 4px rgba(13, 148, 136, 0.4);
  transform: translateY(-1px);
}

/* Animación de spin */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* ============================================================================
   RESPONSIVE
   ============================================================================ */

@media (max-width: 768px) {
  .agenda-unified-header {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .header-left {
    order: 1;
    flex: 1 1 100%;
    justify-content: space-between;
  }

  .header-center {
    order: 3;
    flex: 1 1 auto;
    justify-content: flex-start;
  }

  .header-right {
    order: 2;
    flex: 0 0 auto;
  }

  .header-title {
    font-size: 0.9375rem;
  }

  .action-btn span {
    display: none;
  }

  .action-btn-primary span {
    display: inline;
  }
}

@media (max-width: 480px) {
  .view-btn {
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
  }

  .action-btn-primary {
    padding: 0.5rem 0.75rem;
  }
}
</style>
