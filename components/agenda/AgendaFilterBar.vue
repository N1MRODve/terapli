<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: Barra de Filtros Elegante
 * =============================================================================
 * Barra compacta que agrupa:
 * - Buscador con icono y clear button
 * - Selector de terapeuta (solo coordinadora)
 * - Chips de estado inline con contadores
 */

import { ref, computed, watch } from 'vue'
import { MagnifyingGlassIcon, XMarkIcon, UserIcon, FunnelIcon } from '@heroicons/vue/24/outline'
import { CheckIcon } from '@heroicons/vue/24/solid'

// ============================================================================
// PROPS Y EMITS
// ============================================================================

interface Terapeuta {
  id: string
  nombre: string
}

interface Props {
  citas: any[]
  modoCoordinadora?: boolean
  terapeutas?: Terapeuta[]
  terapeutaSeleccionado?: string | null
  estadosActivos?: string[]
  busqueda?: string
}

const props = withDefaults(defineProps<Props>(), {
  modoCoordinadora: false,
  terapeutas: () => [],
  terapeutaSeleccionado: null,
  estadosActivos: () => ['pendiente', 'confirmada', 'realizada', 'cancelada'],
  busqueda: ''
})

const emit = defineEmits<{
  'update:busqueda': [valor: string]
  'update:terapeutaSeleccionado': [id: string | null]
  'update:estadosActivos': [estados: string[]]
  'filtrar-estados': [estados: string[]]
}>()

// ============================================================================
// ESTADO LOCAL
// ============================================================================

const busquedaLocal = ref(props.busqueda)
const estadosSeleccionados = ref<Set<string>>(new Set(props.estadosActivos))

// Sincronizar con props
watch(() => props.busqueda, (val) => { busquedaLocal.value = val })
watch(() => props.estadosActivos, (val) => { estadosSeleccionados.value = new Set(val) })

// Definición de estados
const estados = [
  { key: 'pendiente', label: 'Pendientes', color: '#F59E0B', bgLight: 'rgba(245, 158, 11, 0.1)' },
  { key: 'confirmada', label: 'Confirmadas', color: '#10B981', bgLight: 'rgba(16, 185, 129, 0.1)' },
  { key: 'realizada', label: 'Realizadas', color: '#6366F1', bgLight: 'rgba(99, 102, 241, 0.1)' },
  { key: 'cancelada', label: 'Canceladas', color: '#EF4444', bgLight: 'rgba(239, 68, 68, 0.1)' }
]

// ============================================================================
// COMPUTED
// ============================================================================

// Contar citas por estado
const contarPorEstado = (estado: string): number => {
  return props.citas.filter(c => c.estado === estado).length
}

// Total de citas filtradas
const totalFiltradas = computed(() => {
  if (estadosSeleccionados.value.size === 0) return 0
  return props.citas.filter(c => estadosSeleccionados.value.has(c.estado)).length
})

// Verificar si un estado está activo
const estaActivo = (estado: string): boolean => {
  return estadosSeleccionados.value.has(estado)
}

// Todos seleccionados
const todosSeleccionados = computed(() => {
  return estadosSeleccionados.value.size === estados.length
})

// ============================================================================
// MÉTODOS
// ============================================================================

// Emitir cambio de búsqueda
const onBusquedaChange = () => {
  emit('update:busqueda', busquedaLocal.value)
}

// Limpiar búsqueda
const limpiarBusqueda = () => {
  busquedaLocal.value = ''
  emit('update:busqueda', '')
}

// Toggle estado
const toggleEstado = (estado: string) => {
  if (estadosSeleccionados.value.has(estado)) {
    estadosSeleccionados.value.delete(estado)
  } else {
    estadosSeleccionados.value.add(estado)
  }
  const arr = Array.from(estadosSeleccionados.value)
  emit('update:estadosActivos', arr)
  emit('filtrar-estados', arr)
}

// Seleccionar todos
const seleccionarTodos = () => {
  estados.forEach(e => estadosSeleccionados.value.add(e.key))
  const arr = Array.from(estadosSeleccionados.value)
  emit('update:estadosActivos', arr)
  emit('filtrar-estados', arr)
}
</script>

<template>
  <div class="filter-bar">
    <!-- Fila 1: Buscador y Selector de terapeuta -->
    <div class="filter-row-main">
      <!-- Buscador -->
      <div class="search-container">
        <MagnifyingGlassIcon class="search-icon" />
        <input
          v-model="busquedaLocal"
          @input="onBusquedaChange"
          type="search"
          placeholder="Buscar por paciente, terapeuta o nota..."
          class="search-input"
          aria-label="Buscar en la agenda"
        />
        <button
          v-if="busquedaLocal"
          @click="limpiarBusqueda"
          class="search-clear"
          aria-label="Limpiar búsqueda"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Selector de terapeuta (solo coordinadora) -->
      <div v-if="modoCoordinadora && terapeutas.length > 0" class="terapeuta-selector">
        <UserIcon class="w-4 h-4 text-gray-400" />
        <select
          :value="terapeutaSeleccionado"
          @change="emit('update:terapeutaSeleccionado', ($event.target as HTMLSelectElement).value || null)"
          class="terapeuta-select"
          aria-label="Filtrar por terapeuta"
        >
          <option value="">Todos los terapeutas</option>
          <option v-for="t in terapeutas" :key="t.id" :value="t.id">
            {{ t.nombre }}
          </option>
        </select>
      </div>
    </div>

    <!-- Fila 2: Chips de estado -->
    <div class="filter-row-states">
      <div class="states-label">
        <FunnelIcon class="w-3.5 h-3.5" />
        <span>Estado</span>
      </div>

      <div class="states-chips">
        <button
          v-for="estado in estados"
          :key="estado.key"
          @click="toggleEstado(estado.key)"
          class="state-chip"
          :class="{ 'active': estaActivo(estado.key) }"
          :style="{
            '--chip-color': estado.color,
            '--chip-bg': estado.bgLight
          }"
          :aria-pressed="estaActivo(estado.key)"
        >
          <!-- Dot de color -->
          <span class="chip-dot" :style="{ backgroundColor: estado.color }"></span>

          <!-- Label -->
          <span class="chip-label">{{ estado.label }}</span>

          <!-- Contador -->
          <span class="chip-count">{{ contarPorEstado(estado.key) }}</span>

          <!-- Check si activo -->
          <CheckIcon v-if="estaActivo(estado.key)" class="chip-check" />
        </button>
      </div>

      <!-- Contador de resultados -->
      <div class="results-count">
        <span v-if="!todosSeleccionados" class="results-filtered">
          {{ totalFiltradas }} de {{ citas.length }}
        </span>
        <span v-else class="results-total">
          {{ citas.length }} citas
        </span>
        <button
          v-if="!todosSeleccionados"
          @click="seleccionarTodos"
          class="show-all-btn"
        >
          Ver todas
        </button>
      </div>
    </div>

    <!-- Indicador de búsqueda activa -->
    <div v-if="busquedaLocal" class="search-indicator">
      <span class="search-indicator-text">
        Buscando: <strong>"{{ busquedaLocal }}"</strong>
      </span>
      <button @click="limpiarBusqueda" class="search-indicator-clear">
        <XMarkIcon class="w-3.5 h-3.5" />
        Limpiar
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   BARRA DE FILTROS - DISEÑO ELEGANTE Y COMPACTO
   ============================================================================ */

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* Fila principal: Buscador + Terapeuta */
.filter-row-main {
  display: flex;
  gap: 0.75rem;
}

/* Buscador */
.search-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  width: 1rem;
  height: 1rem;
  color: #9CA3AF;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 2.5rem;
  font-size: 0.875rem;
  color: #1F2937;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 0.625rem;
  transition: all 0.15s ease;
}

.search-input::placeholder {
  color: #9CA3AF;
}

.search-input:focus {
  outline: none;
  background: white;
  border-color: #0D9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}

.search-clear {
  position: absolute;
  right: 0.625rem;
  padding: 0.25rem;
  color: #9CA3AF;
  border-radius: 0.25rem;
  transition: all 0.15s ease;
}

.search-clear:hover {
  color: #4B5563;
  background: #F3F4F6;
}

/* Selector de terapeuta */
.terapeuta-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.75rem;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 0.625rem;
  min-width: 12rem;
}

.terapeuta-select {
  flex: 1;
  padding: 0.625rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background: transparent;
  border: none;
  cursor: pointer;
  appearance: none;
}

.terapeuta-select:focus {
  outline: none;
}

/* Fila de estados */
.filter-row-states {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.states-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9CA3AF;
}

/* Chips de estado */
.states-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.state-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #4B5563;
  background: var(--chip-bg);
  border: 1px solid transparent;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.state-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.state-chip.active {
  border-color: var(--chip-color);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--chip-color) 15%, transparent);
}

.chip-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.chip-label {
  color: #374151;
}

.chip-count {
  padding: 0.0625rem 0.375rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: #6B7280;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.625rem;
}

.state-chip.active .chip-count {
  background: rgba(255, 255, 255, 0.95);
  color: #374151;
}

.chip-check {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--chip-color);
}

/* Contador de resultados */
.results-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  font-size: 0.75rem;
}

.results-filtered {
  color: #0D9488;
  font-weight: 500;
}

.results-total {
  color: #6B7280;
}

.show-all-btn {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #0D9488;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.15s ease;
}

.show-all-btn:hover {
  background: rgba(13, 148, 136, 0.1);
}

/* Indicador de búsqueda */
.search-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: #F0FDFA;
  border-radius: 0.5rem;
  border: 1px solid #99F6E4;
}

.search-indicator-text {
  font-size: 0.75rem;
  color: #0F766E;
}

.search-indicator-text strong {
  font-weight: 600;
}

.search-indicator-clear {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: #0D9488;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.15s ease;
}

.search-indicator-clear:hover {
  background: rgba(13, 148, 136, 0.15);
}

/* ============================================================================
   RESPONSIVE
   ============================================================================ */

@media (max-width: 768px) {
  .filter-row-main {
    flex-direction: column;
  }

  .terapeuta-selector {
    min-width: 100%;
  }

  .filter-row-states {
    flex-direction: column;
    align-items: flex-start;
  }

  .states-chips {
    width: 100%;
  }

  .results-count {
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .state-chip {
    padding: 0.3125rem 0.5rem;
    font-size: 0.6875rem;
  }

  .chip-label {
    display: none;
  }

  .state-chip.active .chip-label {
    display: inline;
  }
}
</style>
