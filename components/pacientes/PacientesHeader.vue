<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: Header de Pacientes
 * =============================================================================
 * Cabecera unificada para la sección de pacientes con:
 * - Título y subtítulo
 * - Buscador global
 * - Botones de acción (Nuevo paciente, Importar, Exportar)
 */

import {
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'
import { UserGroupIcon as UserGroupSolidIcon } from '@heroicons/vue/24/solid'

// Props
interface Props {
  busqueda?: string
  totalPacientes?: number
  pacientesActivos?: number
}

const props = withDefaults(defineProps<Props>(), {
  busqueda: '',
  totalPacientes: 0,
  pacientesActivos: 0
})

// Emits
const emit = defineEmits<{
  'update:busqueda': [valor: string]
  'nuevo-paciente': []
  'importar': []
  'exportar': []
}>()

// Estado local
const busquedaLocal = ref(props.busqueda)

// Sincronizar con props
watch(() => props.busqueda, (val) => { busquedaLocal.value = val })

// Handlers
const onBusquedaChange = () => {
  emit('update:busqueda', busquedaLocal.value)
}

const limpiarBusqueda = () => {
  busquedaLocal.value = ''
  emit('update:busqueda', '')
}
</script>

<template>
  <header class="pacientes-header">
    <!-- Lado izquierdo: Título e info -->
    <div class="header-left">
      <div class="header-icon">
        <UserGroupSolidIcon class="w-6 h-6 text-white" />
      </div>
      <div class="header-text">
        <h1 class="header-title">Pacientes</h1>
        <p class="header-subtitle">Gestión y seguimiento de todos los pacientes de la clínica</p>
      </div>
    </div>

    <!-- Centro: Buscador global -->
    <div class="header-center">
      <div class="search-container">
        <MagnifyingGlassIcon class="search-icon" />
        <input
          v-model="busquedaLocal"
          @input="onBusquedaChange"
          type="search"
          placeholder="Buscar por nombre, email o teléfono..."
          class="search-input"
          aria-label="Buscar pacientes"
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
    </div>

    <!-- Lado derecho: Acciones -->
    <div class="header-right">
      <!-- Resumen rápido -->
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-value">{{ totalPacientes }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item activos">
          <span class="stat-value">{{ pacientesActivos }}</span>
          <span class="stat-label">Activos</span>
        </div>
      </div>

      <!-- Botón importar (secundario) -->
      <button
        @click="emit('importar')"
        class="action-btn action-btn-tertiary"
        aria-label="Importar pacientes"
        title="Importar"
      >
        <ArrowUpTrayIcon class="w-4 h-4" />
      </button>

      <!-- Botón exportar (secundario) -->
      <button
        @click="emit('exportar')"
        class="action-btn action-btn-tertiary"
        aria-label="Exportar pacientes"
        title="Exportar"
      >
        <ArrowDownTrayIcon class="w-4 h-4" />
      </button>

      <!-- Botón nuevo paciente (primario) -->
      <button
        @click="emit('nuevo-paciente')"
        class="action-btn action-btn-primary"
        aria-label="Crear nuevo paciente"
      >
        <PlusIcon class="w-4 h-4" />
        <span>Nuevo Paciente</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
/* ============================================================================
   HEADER DE PACIENTES - DISEÑO ELEGANTE Y MODERNO
   ============================================================================ */

.pacientes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem 1.25rem;
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
  gap: 0.875rem;
  flex-shrink: 0;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.header-title {
  font-family: 'Elms Sans', system-ui, sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1F2937;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 0.75rem;
  color: #6B7280;
  line-height: 1.3;
}

/* CENTRO - Buscador */
.header-center {
  flex: 1;
  max-width: 28rem;
}

.search-container {
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
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

/* LADO DERECHO - Stats y acciones */
.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Stats rápidos */
.header-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: #F3F4F6;
  border-radius: 0.5rem;
  margin-right: 0.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  line-height: 1;
}

.stat-item.activos .stat-value {
  color: #10B981;
}

.stat-label {
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #9CA3AF;
}

.stat-divider {
  width: 1px;
  height: 1.5rem;
  background: #D1D5DB;
}

/* Botones de acción */
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

.action-btn-tertiary {
  padding: 0.5rem;
  color: #6B7280;
  background: white;
  border: 1px solid #E5E7EB;
}

.action-btn-tertiary:hover {
  color: #4B5563;
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.action-btn-primary {
  color: white;
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  border: none;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.3);
}

.action-btn-primary:hover {
  background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

/* ============================================================================
   RESPONSIVE
   ============================================================================ */

@media (max-width: 1024px) {
  .header-stats {
    display: none;
  }
}

@media (max-width: 768px) {
  .pacientes-header {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.875rem;
  }

  .header-left {
    order: 1;
    flex: 1 1 100%;
  }

  .header-center {
    order: 3;
    flex: 1 1 100%;
    max-width: 100%;
  }

  .header-right {
    order: 2;
    flex: 0 0 auto;
    margin-left: auto;
  }

  .header-subtitle {
    display: none;
  }

  .action-btn span {
    display: none;
  }

  .action-btn-primary span {
    display: inline;
  }
}
</style>
