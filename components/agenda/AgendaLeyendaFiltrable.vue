<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: Leyenda de Estados con Filtrado Interactivo
 * =============================================================================
 * Muestra estados de citas con funcionalidad de filtrado por click.
 * Permite selección múltiple y muestra contadores en tiempo real.
 */

import { ref, computed } from 'vue'

// Props
interface Props {
  citas: any[]
  filtrosActivos?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  filtrosActivos: () => []
})

// Emits
const emit = defineEmits<{
  'update:filtros': [filtros: string[]]
  'filtrar': [estados: string[]]
}>()

// Estado local de filtros
const filtrosSeleccionados = ref<Set<string>>(new Set(props.filtrosActivos))

// Definición de estados con colores modernos
const estadosDisponibles = [
  {
    key: 'pendiente',
    label: 'Pendientes',
    color: '#F59E0B', // Amber
    bgColor: 'rgba(245, 158, 11, 0.08)',
    bgColorActive: 'rgba(245, 158, 11, 0.15)',
    borderColorActive: '#F59E0B'
  },
  {
    key: 'confirmada',
    label: 'Confirmadas',
    color: '#10B981', // Emerald
    bgColor: 'rgba(16, 185, 129, 0.08)',
    bgColorActive: 'rgba(16, 185, 129, 0.15)',
    borderColorActive: '#10B981'
  },
  {
    key: 'realizada',
    label: 'Realizadas',
    color: '#6366F1', // Indigo
    bgColor: 'rgba(99, 102, 241, 0.08)',
    bgColorActive: 'rgba(99, 102, 241, 0.15)',
    borderColorActive: '#6366F1'
  },
  {
    key: 'cancelada',
    label: 'Canceladas',
    color: '#EF4444', // Red
    bgColor: 'rgba(239, 68, 68, 0.08)',
    bgColorActive: 'rgba(239, 68, 68, 0.15)',
    borderColorActive: '#EF4444'
  }
]

// Contar citas por estado
const contarPorEstado = (estado: string): number => {
  return props.citas.filter(c => c.estado === estado).length
}

// Total de citas
const totalCitas = computed(() => props.citas.length)

// Citas filtradas
const citasFiltradas = computed(() => {
  if (filtrosSeleccionados.value.size === 0) {
    return props.citas.length
  }
  return props.citas.filter(c => filtrosSeleccionados.value.has(c.estado)).length
})

// Toggle filtro
const toggleFiltro = (estado: string) => {
  if (filtrosSeleccionados.value.has(estado)) {
    filtrosSeleccionados.value.delete(estado)
  } else {
    filtrosSeleccionados.value.add(estado)
  }

  const filtrosArray = Array.from(filtrosSeleccionados.value)
  emit('update:filtros', filtrosArray)
  emit('filtrar', filtrosArray)
}

// Limpiar todos los filtros
const limpiarFiltros = () => {
  filtrosSeleccionados.value.clear()
  emit('update:filtros', [])
  emit('filtrar', [])
}

// Verificar si un estado está activo
const estaActivo = (estado: string): boolean => {
  return filtrosSeleccionados.value.has(estado)
}

// Verificar si hay filtros activos
const hayFiltrosActivos = computed(() => filtrosSeleccionados.value.size > 0)
</script>

<template>
  <div class="filter-container">
    <!-- Header minimalista -->
    <div class="filter-header">
      <span class="filter-label">Estado</span>
      <div v-if="hayFiltrosActivos" class="filter-count">
        {{ citasFiltradas }}/{{ totalCitas }}
      </div>
      <button
        v-if="hayFiltrosActivos"
        @click="limpiarFiltros"
        class="filter-clear"
      >
        Limpiar
      </button>
    </div>

    <!-- Pills de estados -->
    <div class="filter-pills">
      <button
        v-for="estado in estadosDisponibles"
        :key="estado.key"
        @click="toggleFiltro(estado.key)"
        class="filter-pill"
        :class="{ 'active': estaActivo(estado.key) }"
        :style="{
          '--pill-color': estado.color,
          '--pill-bg': estaActivo(estado.key) ? estado.bgColorActive : estado.bgColor,
          '--pill-border': estaActivo(estado.key) ? estado.borderColorActive : 'transparent'
        }"
      >
        <!-- Dot de color -->
        <span class="pill-dot" :style="{ backgroundColor: estado.color }"></span>

        <!-- Label -->
        <span class="pill-label">{{ estado.label }}</span>

        <!-- Contador -->
        <span class="pill-count">{{ contarPorEstado(estado.key) }}</span>
      </button>
    </div>

    <!-- Mensaje cuando no hay citas filtradas -->
    <div v-if="hayFiltrosActivos && citasFiltradas === 0" class="filter-empty">
      <p>No hay citas con los estados seleccionados</p>
      <button @click="limpiarFiltros">Ver todas</button>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   MODERN MINIMALIST FILTER PILLS
   ============================================================================ */

.filter-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Header */
.filter-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9CA3AF;
}

.filter-count {
  font-size: 11px;
  font-weight: 500;
  color: #6366F1;
  background: rgba(99, 102, 241, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.filter-clear {
  font-size: 11px;
  font-weight: 500;
  color: #6B7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin-left: auto;
}

.filter-clear:hover {
  color: #374151;
  background: rgba(0, 0, 0, 0.04);
}

/* Pills container */
.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Individual pill - Modern pill design */
.filter-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  background: var(--pill-bg);
  border-color: var(--pill-border);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-pill.active {
  border-color: var(--pill-border);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.filter-pill:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
}

/* Pill dot */
.pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Pill label */
.pill-label {
  color: #374151;
}

/* Pill count */
.pill-count {
  font-size: 10px;
  font-weight: 600;
  color: #6B7280;
  background: rgba(255, 255, 255, 0.7);
  padding: 1px 6px;
  border-radius: 8px;
  min-width: 18px;
  text-align: center;
}

.filter-pill.active .pill-count {
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
}

/* Empty state */
.filter-empty {
  text-align: center;
  padding: 24px 16px;
  background: #F9FAFB;
  border-radius: 8px;
}

.filter-empty p {
  font-size: 13px;
  color: #6B7280;
  margin: 0 0 8px 0;
}

.filter-empty button {
  font-size: 12px;
  font-weight: 500;
  color: #6366F1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.filter-empty button:hover {
  background: rgba(99, 102, 241, 0.1);
}

/* Animation */
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

.filter-pill {
  animation: fadeIn 0.15s ease-out;
}
</style>
