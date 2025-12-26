<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: Módulo de Bonos Pendientes de Confirmar
 * =============================================================================
 * Tarjeta/resumen con métricas, filtros y lista de bonos pendientes.
 * Diseño coherente con el panel de coordinadora.
 */

import {
  ClockIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  FunnelIcon
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/vue/24/solid'

// Props
interface Bono {
  id: string
  paciente_id: string
  paciente_nombre: string
  paciente_email?: string
  terapeuta_nombre?: string
  sesiones_totales: number
  sesiones_restantes: number
  monto_total: number
  tipo_bono: string
  estado: string
  created_at?: string
}

interface Props {
  bonos: Bono[]
  cargando?: boolean
  procesandoConfirmacion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cargando: false,
  procesandoConfirmacion: false
})

// Emits
const emit = defineEmits<{
  'confirmar-pago': [bono: Bono]
  'ver-detalle': [bono: Bono]
}>()

// Estado local
const busqueda = ref('')
const filtroUrgencia = ref<'todos' | 'urgentes' | 'normales'>('todos')

// Computed: Filtrar bonos
const bonosFiltrados = computed(() => {
  let resultado = [...props.bonos]

  // Filtrar por búsqueda
  if (busqueda.value.trim()) {
    const termino = busqueda.value.toLowerCase().trim()
    resultado = resultado.filter(bono => {
      const nombrePaciente = (bono.paciente_nombre || '').toLowerCase()
      const nombreTerapeuta = (bono.terapeuta_nombre || '').toLowerCase()
      const tipoBono = (bono.tipo_bono || '').toLowerCase()

      return nombrePaciente.includes(termino) ||
             nombreTerapeuta.includes(termino) ||
             tipoBono.includes(termino)
    })
  }

  // Filtrar por urgencia
  if (filtroUrgencia.value === 'urgentes') {
    resultado = resultado.filter(bono => bono.sesiones_restantes <= 1)
  } else if (filtroUrgencia.value === 'normales') {
    resultado = resultado.filter(bono => bono.sesiones_restantes > 1)
  }

  return resultado
})

// Métricas
const totalPendientes = computed(() => props.bonos.length)
const totalMonto = computed(() => {
  return props.bonos.reduce((sum, bono) => sum + (Number(bono.monto_total) || 0), 0)
})
const totalMontoFiltrado = computed(() => {
  return bonosFiltrados.value.reduce((sum, bono) => sum + (Number(bono.monto_total) || 0), 0)
})
const bonosUrgentes = computed(() => {
  return props.bonos.filter(bono => bono.sesiones_restantes <= 1).length
})

// Utilidades
const formatearPrecio = (valor: number) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor || 0)
}

const obtenerIniciales = (nombre: string) => {
  if (!nombre) return '?'
  const partes = nombre.split(' ')
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
}

const limpiarBusqueda = () => {
  busqueda.value = ''
}

const getUrgenciaClass = (sesiones: number) => {
  if (sesiones === 0) return 'urgencia-critica'
  if (sesiones === 1) return 'urgencia-alta'
  if (sesiones === 2) return 'urgencia-media'
  return 'urgencia-normal'
}

const getEstadoBadgeClass = (estado: string) => {
  switch (estado) {
    case 'activo': return 'badge-activo'
    case 'pendiente': return 'badge-pendiente'
    case 'agotado': return 'badge-agotado'
    default: return 'badge-default'
  }
}
</script>

<template>
  <section class="pendientes-module">
    <!-- Header del módulo -->
    <header class="module-header">
      <div class="header-info">
        <div class="header-icon">
          <ClockIcon class="w-6 h-6 text-white" />
        </div>
        <div class="header-text">
          <h2 class="header-title">Bonos Pendientes de Confirmar</h2>
          <p class="header-subtitle">Pagos reportados por terapeutas que requieren confirmación</p>
        </div>
      </div>

      <!-- Contador principal -->
      <div class="header-counter" :class="{ 'has-pending': totalPendientes > 0 }">
        <span class="counter-value">{{ totalPendientes }}</span>
        <span class="counter-label">Pendientes</span>
      </div>
    </header>

    <!-- Tarjetas de métricas -->
    <div class="metrics-grid">
      <!-- Total por confirmar -->
      <div class="metric-card metric-monto">
        <div class="metric-icon">
          <CurrencyEuroIcon class="w-6 h-6" />
        </div>
        <div class="metric-content">
          <span class="metric-label">Total por Confirmar</span>
          <span class="metric-value">{{ formatearPrecio(busqueda ? totalMontoFiltrado : totalMonto) }}€</span>
          <span v-if="busqueda" class="metric-detail">de {{ formatearPrecio(totalMonto) }}€</span>
        </div>
      </div>

      <!-- Requieren atención -->
      <div class="metric-card metric-urgentes" :class="{ 'has-urgent': bonosUrgentes > 0 }">
        <div class="metric-icon">
          <ExclamationTriangleIcon class="w-6 h-6" />
        </div>
        <div class="metric-content">
          <span class="metric-label">Requieren Atención</span>
          <span class="metric-value">{{ bonosUrgentes }}</span>
          <span class="metric-detail">Pocas sesiones restantes</span>
        </div>
      </div>

      <!-- Confirmados hoy (placeholder) -->
      <div class="metric-card metric-confirmados">
        <div class="metric-icon">
          <CheckCircleSolidIcon class="w-6 h-6" />
        </div>
        <div class="metric-content">
          <span class="metric-label">Resultados</span>
          <span class="metric-value">{{ bonosFiltrados.length }}</span>
          <span v-if="busqueda || filtroUrgencia !== 'todos'" class="metric-detail">
            de {{ totalPendientes }} totales
          </span>
          <span v-else class="metric-detail">Bonos pendientes</span>
        </div>
      </div>
    </div>

    <!-- Barra de filtros -->
    <div class="filter-bar">
      <!-- Búsqueda -->
      <div class="search-container">
        <MagnifyingGlassIcon class="search-icon" />
        <input
          v-model="busqueda"
          type="search"
          placeholder="Buscar paciente, terapeuta o tipo de bono..."
          class="search-input"
          aria-label="Buscar en bonos pendientes"
        />
        <button
          v-if="busqueda"
          @click="limpiarBusqueda"
          class="search-clear"
          aria-label="Limpiar búsqueda"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Filtros de urgencia -->
      <div class="urgency-filters">
        <button
          @click="filtroUrgencia = 'todos'"
          class="filter-chip"
          :class="{ active: filtroUrgencia === 'todos' }"
        >
          Todos
        </button>
        <button
          @click="filtroUrgencia = 'urgentes'"
          class="filter-chip filter-urgente"
          :class="{ active: filtroUrgencia === 'urgentes' }"
        >
          <ExclamationTriangleIcon class="w-3.5 h-3.5" />
          Urgentes
          <span v-if="bonosUrgentes > 0" class="chip-count">{{ bonosUrgentes }}</span>
        </button>
        <button
          @click="filtroUrgencia = 'normales'"
          class="filter-chip"
          :class="{ active: filtroUrgencia === 'normales' }"
        >
          Normales
        </button>
      </div>
    </div>

    <!-- Lista de bonos -->
    <div class="bonos-list">
      <!-- Loading -->
      <div v-if="cargando" class="loading-container">
        <div v-for="i in 3" :key="i" class="loading-skeleton"></div>
      </div>

      <!-- Lista con datos -->
      <template v-else-if="bonosFiltrados.length > 0">
        <div
          v-for="bono in bonosFiltrados"
          :key="bono.id"
          class="bono-card"
          :class="getUrgenciaClass(bono.sesiones_restantes)"
          @click="emit('ver-detalle', bono)"
        >
          <!-- Indicador lateral de urgencia -->
          <div class="urgencia-indicator"></div>

          <!-- Avatar -->
          <div class="bono-avatar">
            <span class="avatar-initials">{{ obtenerIniciales(bono.paciente_nombre) }}</span>
            <!-- Badge de urgencia -->
            <div
              v-if="bono.sesiones_restantes <= 1"
              class="urgencia-badge"
              :class="{ critico: bono.sesiones_restantes === 0 }"
            >
              !
            </div>
          </div>

          <!-- Contenido principal -->
          <div class="bono-content">
            <div class="bono-main">
              <h4 class="paciente-nombre">{{ bono.paciente_nombre }}</h4>
              <div class="bono-tipo">
                <span class="tipo-dot"></span>
                {{ bono.tipo_bono || 'Bono Estándar' }}
              </div>
            </div>

            <div class="bono-info-grid">
              <!-- Terapeuta -->
              <div class="info-item">
                <span class="info-label">Terapeuta</span>
                <span class="info-value">{{ bono.terapeuta_nombre || 'No asignado' }}</span>
              </div>

              <!-- Estado -->
              <div class="info-item">
                <span class="info-label">Estado</span>
                <span class="estado-badge" :class="getEstadoBadgeClass(bono.estado)">
                  <span class="estado-dot"></span>
                  {{ bono.estado }}
                </span>
              </div>

              <!-- Sesiones -->
              <div class="info-item">
                <span class="info-label">Sesiones</span>
                <div class="sesiones-display">
                  <span class="sesiones-value" :class="getUrgenciaClass(bono.sesiones_restantes)">
                    {{ bono.sesiones_restantes }}
                  </span>
                  <span class="sesiones-total">/ {{ bono.sesiones_totales }}</span>
                </div>
                <div
                  v-if="bono.sesiones_restantes <= 1"
                  class="sesiones-warning"
                  :class="getUrgenciaClass(bono.sesiones_restantes)"
                >
                  <ExclamationTriangleIcon class="w-3 h-3" />
                  {{ bono.sesiones_restantes === 0 ? '¡AGOTADO!' : '¡ÚLTIMA!' }}
                </div>
              </div>

              <!-- Monto -->
              <div class="info-item info-monto">
                <span class="info-label">Monto</span>
                <span class="monto-value">{{ formatearPrecio(bono.monto_total) }}€</span>
                <span class="monto-estado">Por confirmar</span>
              </div>
            </div>
          </div>

          <!-- Acción -->
          <div class="bono-action">
            <button
              @click.stop="emit('confirmar-pago', bono)"
              :disabled="procesandoConfirmacion"
              class="btn-confirmar"
              aria-label="Confirmar pago"
            >
              <CheckCircleIcon class="w-5 h-5" />
              <span>Confirmar</span>
            </button>
          </div>
        </div>
      </template>

      <!-- Estado vacío: sin resultados de búsqueda -->
      <div v-else-if="busqueda || filtroUrgencia !== 'todos'" class="empty-state empty-search">
        <div class="empty-icon">
          <MagnifyingGlassIcon class="w-12 h-12" />
        </div>
        <h3 class="empty-title">No se encontraron resultados</h3>
        <p class="empty-description">
          No hay bonos pendientes que coincidan con tu búsqueda
        </p>
        <button @click="busqueda = ''; filtroUrgencia = 'todos'" class="btn-limpiar">
          <XMarkIcon class="w-4 h-4" />
          Limpiar filtros
        </button>
      </div>

      <!-- Estado vacío: todo al día -->
      <div v-else class="empty-state empty-success">
        <div class="empty-icon success">
          <CheckCircleSolidIcon class="w-12 h-12" />
        </div>
        <h3 class="empty-title">¡Todo al día!</h3>
        <p class="empty-description">
          No hay bonos pendientes de confirmar pago
        </p>
        <NuxtLink to="/coordinadora/pacientes" class="btn-navegar">
          Gestionar Pacientes
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* =============================================================================
   MÓDULO DE BONOS PENDIENTES
   ============================================================================= */

.pendientes-module {
  background: white;
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Header del módulo */
.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(to right, rgba(245, 158, 11, 0.05), rgba(13, 148, 136, 0.05));
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
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
}

.header-subtitle {
  font-size: 0.75rem;
  color: #6B7280;
}

.header-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #F3F4F6;
  border-radius: 0.75rem;
}

.header-counter.has-pending {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
}

.counter-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #374151;
  line-height: 1;
}

.header-counter.has-pending .counter-value {
  color: #B45309;
}

.counter-label {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
}

/* Tarjetas de métricas */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: #F9FAFB;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #E5E7EB;
  transition: all 0.15s ease;
}

.metric-card:hover {
  border-color: #D1D5DB;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  flex-shrink: 0;
}

.metric-monto .metric-icon {
  background: rgba(13, 148, 136, 0.1);
  color: #0D9488;
}

.metric-urgentes .metric-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.metric-urgentes.has-urgent .metric-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.metric-confirmados .metric-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.metric-label {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  line-height: 1.2;
}

.metric-monto .metric-value {
  color: #0D9488;
}

.metric-urgentes.has-urgent .metric-value {
  color: #EF4444;
}

.metric-detail {
  font-size: 0.6875rem;
  color: #9CA3AF;
}

/* Barra de filtros */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 24rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #9CA3AF;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2.25rem;
  font-size: 0.875rem;
  color: #1F2937;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.search-input::placeholder {
  color: #9CA3AF;
}

.search-input:focus {
  outline: none;
  background: white;
  border-color: #F59E0B;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.search-clear {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem;
  color: #9CA3AF;
  border-radius: 0.25rem;
  transition: all 0.15s ease;
}

.search-clear:hover {
  color: #4B5563;
  background: #F3F4F6;
}

.urgency-filters {
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
}

.filter-chip:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.filter-chip.active {
  color: white;
  background: #0D9488;
  border-color: #0D9488;
}

.filter-chip.filter-urgente.active {
  background: #EF4444;
  border-color: #EF4444;
}

.chip-count {
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
}

/* Lista de bonos */
.bonos-list {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Loading skeleton */
.loading-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading-skeleton {
  height: 6rem;
  background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
  background-size: 200% 100%;
  border-radius: 0.75rem;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Tarjeta de bono */
.bono-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.bono-card:hover {
  border-color: #D1D5DB;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Indicador de urgencia lateral */
.urgencia-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0.75rem 0 0 0.75rem;
}

.urgencia-normal .urgencia-indicator {
  background: linear-gradient(to bottom, #10B981, #0D9488);
}

.urgencia-media .urgencia-indicator {
  background: #F59E0B;
}

.urgencia-alta .urgencia-indicator {
  background: #F97316;
}

.urgencia-critica .urgencia-indicator {
  background: #EF4444;
}

/* Avatar */
.bono-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
  border-radius: 0.625rem;
}

.urgencia-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
  color: white;
  background: #F97316;
  border-radius: 9999px;
  border: 2px solid white;
}

.urgencia-badge.critico {
  background: #EF4444;
}

/* Contenido del bono */
.bono-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bono-main {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.paciente-nombre {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1F2937;
}

.bono-tipo {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #6B7280;
}

.tipo-dot {
  width: 0.375rem;
  height: 0.375rem;
  background: #10B981;
  border-radius: 9999px;
}

/* Grid de información */
.bono-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9CA3AF;
}

.info-value {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
}

/* Estado badge */
.estado-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.6875rem;
  font-weight: 500;
  border-radius: 9999px;
  text-transform: capitalize;
}

.estado-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
}

.badge-activo {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.badge-activo .estado-dot {
  background: #10B981;
}

.badge-pendiente {
  background: rgba(245, 158, 11, 0.1);
  color: #B45309;
}

.badge-pendiente .estado-dot {
  background: #F59E0B;
}

.badge-agotado {
  background: rgba(107, 114, 128, 0.1);
  color: #4B5563;
}

.badge-agotado .estado-dot {
  background: #6B7280;
}

/* Sesiones */
.sesiones-display {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.sesiones-value {
  font-size: 0.9375rem;
  font-weight: 700;
}

.urgencia-normal .sesiones-value {
  color: #0D9488;
}

.urgencia-media .sesiones-value {
  color: #F59E0B;
}

.urgencia-alta .sesiones-value {
  color: #F97316;
}

.urgencia-critica .sesiones-value {
  color: #EF4444;
}

.sesiones-total {
  font-size: 0.75rem;
  color: #9CA3AF;
}

.sesiones-warning {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  margin-top: 0.125rem;
}

.sesiones-warning.urgencia-alta {
  color: #F97316;
}

.sesiones-warning.urgencia-critica {
  color: #EF4444;
}

/* Monto */
.info-monto {
  text-align: right;
}

.monto-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #B45309;
}

.monto-estado {
  font-size: 0.625rem;
  color: #D97706;
}

/* Acción */
.bono-action {
  flex-shrink: 0;
}

.btn-confirmar {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #10B981 0%, #0D9488 100%);
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.btn-confirmar:hover:not(:disabled) {
  background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
}

.btn-confirmar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Estados vacíos */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  border-radius: 9999px;
}

.empty-search .empty-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.empty-success .empty-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 1.25rem;
}

.btn-limpiar {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4B5563;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.btn-limpiar:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.btn-navegar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.btn-navegar:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
}

/* =============================================================================
   RESPONSIVE
   ============================================================================= */

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .bono-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-monto {
    text-align: left;
    grid-column: span 2;
    padding-top: 0.5rem;
    border-top: 1px solid #F3F4F6;
  }
}

@media (max-width: 768px) {
  .module-header {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 1rem;
  }

  .header-subtitle {
    display: none;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }

  .search-container {
    max-width: 100%;
  }

  .urgency-filters {
    overflow-x: auto;
    padding-bottom: 0.25rem;
  }

  .bonos-list {
    padding: 0.75rem 1rem;
  }

  .bono-card {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }

  .bono-avatar {
    position: absolute;
    top: 1rem;
    left: 1rem;
  }

  .bono-content {
    padding-left: 4rem;
  }

  .bono-action {
    margin-top: 0.75rem;
    padding-left: 4rem;
  }

  .btn-confirmar {
    width: 100%;
    justify-content: center;
  }
}
</style>
