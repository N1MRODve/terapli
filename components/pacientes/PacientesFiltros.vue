<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: Filtros de Pacientes
 * =============================================================================
 * Barra de filtros con:
 * - Selector de estado (Todos/Activos/Inactivos)
 * - Selector de terapeuta
 * - Chips rápidos (Con bono, Sin bono, Bonos por agotar)
 * - Contador de resultados
 */

import {
  FunnelIcon,
  XMarkIcon,
  TicketIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'

// Props
interface Terapeuta {
  id: string
  nombre: string
}

interface Props {
  filtroEstado: string
  filtroTerapeuta: string
  filtroBono: string
  terapeutas: Terapeuta[]
  totalResultados: number
  totalPacientes: number
}

const props = withDefaults(defineProps<Props>(), {
  filtroEstado: '',
  filtroTerapeuta: '',
  filtroBono: '',
  terapeutas: () => [],
  totalResultados: 0,
  totalPacientes: 0
})

// Emits
const emit = defineEmits<{
  'update:filtroEstado': [valor: string]
  'update:filtroTerapeuta': [valor: string]
  'update:filtroBono': [valor: string]
  'limpiar-filtros': []
}>()

// Computed
const hayFiltrosActivos = computed(() => {
  return props.filtroEstado || props.filtroTerapeuta || props.filtroBono
})

const mostrarResultados = computed(() => {
  return hayFiltrosActivos.value && props.totalResultados !== props.totalPacientes
})
</script>

<template>
  <div class="filtros-bar">
    <!-- Fila principal de filtros -->
    <div class="filtros-row">
      <!-- Icono de filtros -->
      <div class="filtros-icon">
        <FunnelIcon class="w-4 h-4" />
      </div>

      <!-- Select Estado -->
      <div class="filtro-select-wrapper">
        <select
          :value="filtroEstado"
          @change="emit('update:filtroEstado', ($event.target as HTMLSelectElement).value)"
          class="filtro-select"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <!-- Select Terapeuta -->
      <div class="filtro-select-wrapper">
        <select
          :value="filtroTerapeuta"
          @change="emit('update:filtroTerapeuta', ($event.target as HTMLSelectElement).value)"
          class="filtro-select"
          aria-label="Filtrar por terapeuta"
        >
          <option value="">Todos los terapeutas</option>
          <option v-for="terapeuta in terapeutas" :key="terapeuta.id" :value="terapeuta.id">
            {{ terapeuta.nombre }}
          </option>
        </select>
      </div>

      <!-- Separador -->
      <div class="filtros-divider"></div>

      <!-- Chips rápidos de bono -->
      <div class="chips-container">
        <button
          @click="emit('update:filtroBono', filtroBono === 'con-bono' ? '' : 'con-bono')"
          class="filter-chip"
          :class="{ active: filtroBono === 'con-bono' }"
        >
          <TicketIcon class="w-3.5 h-3.5" />
          Con bono
        </button>

        <button
          @click="emit('update:filtroBono', filtroBono === 'sin-bono' ? '' : 'sin-bono')"
          class="filter-chip"
          :class="{ active: filtroBono === 'sin-bono' }"
        >
          <XCircleIcon class="w-3.5 h-3.5" />
          Sin bono
        </button>

        <button
          @click="emit('update:filtroBono', filtroBono === 'por-agotar' ? '' : 'por-agotar')"
          class="filter-chip chip-alerta"
          :class="{ active: filtroBono === 'por-agotar' }"
        >
          <ExclamationTriangleIcon class="w-3.5 h-3.5" />
          Por agotar
        </button>
      </div>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Contador de resultados -->
      <div v-if="mostrarResultados" class="resultados-badge">
        {{ totalResultados }} de {{ totalPacientes }}
      </div>

      <!-- Limpiar filtros -->
      <button
        v-if="hayFiltrosActivos"
        @click="emit('limpiar-filtros')"
        class="limpiar-btn"
      >
        <XMarkIcon class="w-4 h-4" />
        Limpiar
      </button>
    </div>
  </div>
</template>

<style scoped>
.filtros-bar {
  padding: 0.875rem 1.25rem;
  background: white;
  border-radius: 0.875rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.filtros-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filtros-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: #9CA3AF;
  background: #F3F4F6;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

/* Select wrappers */
.filtro-select-wrapper {
  position: relative;
}

.filtro-select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
  min-width: 10rem;
}

.filtro-select:hover {
  border-color: #D1D5DB;
  background-color: white;
}

.filtro-select:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background-color: white;
}

/* Divider */
.filtros-divider {
  width: 1px;
  height: 1.5rem;
  background: #E5E7EB;
}

/* Chips container */
.chips-container {
  display: flex;
  gap: 0.5rem;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6B7280;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 9999px;
  transition: all 0.15s ease;
  cursor: pointer;
  white-space: nowrap;
}

.filter-chip:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.filter-chip.active {
  color: white;
  background: #6366F1;
  border-color: #6366F1;
}

.filter-chip.chip-alerta:hover {
  border-color: #F59E0B;
  color: #B45309;
}

.filter-chip.chip-alerta.active {
  background: #F59E0B;
  border-color: #F59E0B;
  color: white;
}

/* Resultados badge */
.resultados-badge {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6366F1;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 9999px;
}

/* Limpiar button */
.limpiar-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6B7280;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
  cursor: pointer;
}

.limpiar-btn:hover {
  color: #EF4444;
  border-color: #FECACA;
  background: #FEF2F2;
}

/* Responsive */
@media (max-width: 1024px) {
  .filtros-divider {
    display: none;
  }

  .chips-container {
    order: 10;
    width: 100%;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid #F3F4F6;
  }
}

@media (max-width: 640px) {
  .filtros-bar {
    padding: 0.75rem 1rem;
  }

  .filtros-row {
    gap: 0.5rem;
  }

  .filtros-icon {
    display: none;
  }

  .filtro-select {
    min-width: 0;
    flex: 1;
  }

  .chips-container {
    overflow-x: auto;
    padding-bottom: 0.25rem;
  }
}
</style>
