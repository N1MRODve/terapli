<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: Módulo de Historial de Pagos Confirmados
 * =============================================================================
 * Historial de bonos pagados con filtros por mes y búsqueda.
 * Diseño coherente con el panel de coordinadora.
 */

import {
  ChartBarIcon,
  CurrencyEuroIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarIcon,
  ChevronRightIcon
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
  fecha_pago?: string
  metodo_pago?: string
}

interface MesOption {
  valor: string
  nombre: string
}

interface Props {
  bonos: Bono[]
  cargando?: boolean
  mesesDisponibles?: MesOption[]
  mesSeleccionado?: string
}

const props = withDefaults(defineProps<Props>(), {
  cargando: false,
  mesesDisponibles: () => [],
  mesSeleccionado: ''
})

// Emits
const emit = defineEmits<{
  'ver-detalle': [bono: Bono]
  'cambiar-mes': [mes: string]
}>()

// Estado local
const busqueda = ref('')
const mesLocal = ref(props.mesSeleccionado)

// Sincronizar mes con props
watch(() => props.mesSeleccionado, (val) => {
  mesLocal.value = val
})

// Computed: Filtrar bonos
const bonosFiltrados = computed(() => {
  if (!busqueda.value.trim()) {
    return props.bonos
  }

  const termino = busqueda.value.toLowerCase().trim()
  return props.bonos.filter(bono => {
    const nombrePaciente = (bono.paciente_nombre || '').toLowerCase()
    const nombreTerapeuta = (bono.terapeuta_nombre || '').toLowerCase()
    const tipoBono = (bono.tipo_bono || '').toLowerCase()

    return nombrePaciente.includes(termino) ||
           nombreTerapeuta.includes(termino) ||
           tipoBono.includes(termino)
  })
})

// Métricas
const totalConfirmados = computed(() => props.bonos.length)
const totalMonto = computed(() => {
  return props.bonos.reduce((sum, bono) => sum + (Number(bono.monto_total) || 0), 0)
})
const totalMontoFiltrado = computed(() => {
  return bonosFiltrados.value.reduce((sum, bono) => sum + (Number(bono.monto_total) || 0), 0)
})
const promedioPorBono = computed(() => {
  if (props.bonos.length === 0) return 0
  return totalMonto.value / props.bonos.length
})
const promedioPorBonoFiltrado = computed(() => {
  if (bonosFiltrados.value.length === 0) return 0
  return totalMontoFiltrado.value / bonosFiltrados.value.length
})

// Utilidades
const formatearPrecio = (valor: number) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor || 0)
}

const formatearFecha = (fecha: string | undefined) => {
  if (!fecha) return 'No especificada'
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
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

const onMesChange = () => {
  emit('cambiar-mes', mesLocal.value)
}
</script>

<template>
  <section class="historial-module">
    <!-- Header del módulo -->
    <header class="module-header">
      <div class="header-info">
        <div class="header-icon">
          <ChartBarIcon class="w-6 h-6 text-white" />
        </div>
        <div class="header-text">
          <h2 class="header-title">Historial de Pagos Confirmados</h2>
          <p class="header-subtitle">Bonos ya registrados y confirmados por coordinación</p>
        </div>
      </div>

      <!-- Selector de mes -->
      <div class="mes-selector">
        <CalendarIcon class="selector-icon" />
        <select
          v-model="mesLocal"
          @change="onMesChange"
          class="mes-select"
          aria-label="Filtrar por mes"
        >
          <option value="">Todos los meses</option>
          <option v-for="mes in mesesDisponibles" :key="mes.valor" :value="mes.valor">
            {{ mes.nombre }}
          </option>
        </select>
      </div>
    </header>

    <!-- Tarjetas de métricas -->
    <div class="metrics-grid">
      <!-- Bonos confirmados -->
      <div class="metric-card metric-confirmados">
        <div class="metric-icon">
          <CheckBadgeIcon class="w-6 h-6" />
        </div>
        <div class="metric-content">
          <span class="metric-label">Bonos Confirmados</span>
          <span class="metric-value">{{ bonosFiltrados.length }}</span>
          <span v-if="busqueda" class="metric-detail">de {{ totalConfirmados }} total</span>
        </div>
      </div>

      <!-- Total confirmado -->
      <div class="metric-card metric-total">
        <div class="metric-icon">
          <CurrencyEuroIcon class="w-6 h-6" />
        </div>
        <div class="metric-content">
          <span class="metric-label">Total Confirmado</span>
          <span class="metric-value">{{ formatearPrecio(busqueda ? totalMontoFiltrado : totalMonto) }}€</span>
          <span v-if="busqueda" class="metric-detail">de {{ formatearPrecio(totalMonto) }}€</span>
        </div>
      </div>

      <!-- Promedio por bono -->
      <div class="metric-card metric-promedio">
        <div class="metric-icon">
          <ChartBarIcon class="w-6 h-6" />
        </div>
        <div class="metric-content">
          <span class="metric-label">Promedio por Bono</span>
          <span class="metric-value">{{ formatearPrecio(busqueda ? promedioPorBonoFiltrado : promedioPorBono) }}€</span>
          <span v-if="busqueda" class="metric-detail">de {{ formatearPrecio(promedioPorBono) }}€</span>
        </div>
      </div>
    </div>

    <!-- Barra de búsqueda -->
    <div class="search-bar">
      <div class="search-container">
        <MagnifyingGlassIcon class="search-icon" />
        <input
          v-model="busqueda"
          type="search"
          placeholder="Buscar paciente, terapeuta o tipo de bono..."
          class="search-input"
          aria-label="Buscar en historial"
        />
        <div v-if="busqueda" class="search-actions">
          <span class="search-count">{{ bonosFiltrados.length }} resultado{{ bonosFiltrados.length !== 1 ? 's' : '' }}</span>
          <button
            @click="limpiarBusqueda"
            class="search-clear"
            aria-label="Limpiar búsqueda"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de bonos -->
    <div class="bonos-list">
      <!-- Loading -->
      <div v-if="cargando" class="loading-container">
        <div v-for="i in 4" :key="i" class="loading-skeleton"></div>
      </div>

      <!-- Lista con datos -->
      <template v-else-if="bonosFiltrados.length > 0">
        <div
          v-for="bono in bonosFiltrados"
          :key="bono.id"
          class="bono-card"
          @click="emit('ver-detalle', bono)"
        >
          <!-- Indicador lateral -->
          <div class="confirmado-indicator"></div>

          <!-- Avatar -->
          <div class="bono-avatar">
            <span class="avatar-initials">{{ obtenerIniciales(bono.paciente_nombre) }}</span>
            <!-- Badge de confirmado -->
            <div class="confirmado-badge">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
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

              <!-- Fecha de pago -->
              <div class="info-item">
                <span class="info-label">Fecha Pago</span>
                <span class="info-value">{{ formatearFecha(bono.fecha_pago) }}</span>
              </div>

              <!-- Sesiones -->
              <div class="info-item">
                <span class="info-label">Sesiones</span>
                <div class="sesiones-display">
                  <span class="sesiones-value">{{ bono.sesiones_restantes }}</span>
                  <span class="sesiones-total">/ {{ bono.sesiones_totales }}</span>
                </div>
              </div>

              <!-- Monto -->
              <div class="info-item info-monto">
                <span class="info-label">Monto</span>
                <span class="monto-value">{{ formatearPrecio(bono.monto_total) }}€</span>
                <span class="estado-confirmado">
                  <CheckCircleSolidIcon class="w-3 h-3" />
                  Confirmado
                </span>
              </div>
            </div>
          </div>

          <!-- Indicador de detalle -->
          <div class="bono-arrow">
            <ChevronRightIcon class="w-5 h-5" />
          </div>
        </div>
      </template>

      <!-- Estado vacío: sin resultados de búsqueda -->
      <div v-else-if="busqueda" class="empty-state empty-search">
        <div class="empty-icon">
          <MagnifyingGlassIcon class="w-12 h-12" />
        </div>
        <h3 class="empty-title">No se encontraron resultados</h3>
        <p class="empty-description">
          No hay pagos confirmados que coincidan con "{{ busqueda }}"
        </p>
        <button @click="limpiarBusqueda" class="btn-limpiar">
          <XMarkIcon class="w-4 h-4" />
          Limpiar búsqueda
        </button>
      </div>

      <!-- Estado vacío: sin historial -->
      <div v-else class="empty-state empty-no-data">
        <div class="empty-icon">
          <ChartBarIcon class="w-12 h-12" />
        </div>
        <h3 class="empty-title">Sin historial de pagos</h3>
        <p class="empty-description">
          {{ mesLocal ? 'No hay pagos confirmados en este período' : 'Aún no se han confirmado pagos' }}
        </p>
        <button v-if="mesLocal" @click="mesLocal = ''; onMesChange()" class="btn-limpiar">
          <CalendarIcon class="w-4 h-4" />
          Ver todos los meses
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* =============================================================================
   MÓDULO DE HISTORIAL DE PAGOS
   ============================================================================= */

.historial-module {
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
  background: linear-gradient(to right, rgba(16, 185, 129, 0.05), rgba(13, 148, 136, 0.05));
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
  background: linear-gradient(135deg, #10B981 0%, #0D9488 100%);
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
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

/* Selector de mes */
.mes-selector {
  position: relative;
  display: flex;
  align-items: center;
}

.selector-icon {
  position: absolute;
  left: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: #6B7280;
  pointer-events: none;
}

.mes-select {
  padding: 0.5rem 2rem 0.5rem 2.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.25rem;
  min-width: 12rem;
}

.mes-select:hover {
  border-color: #10B981;
}

.mes-select:focus {
  outline: none;
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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

.metric-confirmados .metric-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.metric-total .metric-icon {
  background: rgba(13, 148, 136, 0.1);
  color: #0D9488;
}

.metric-promedio .metric-icon {
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
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

.metric-confirmados .metric-value {
  color: #059669;
}

.metric-total .metric-value {
  color: #0D9488;
}

.metric-promedio .metric-value {
  color: #6366F1;
}

.metric-detail {
  font-size: 0.6875rem;
  color: #9CA3AF;
}

/* Barra de búsqueda */
.search-bar {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: #9CA3AF;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 8rem 0.5rem 2.25rem;
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
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-actions {
  position: absolute;
  right: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-count {
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: white;
  background: #10B981;
  border-radius: 9999px;
}

.search-clear {
  padding: 0.25rem;
  color: #9CA3AF;
  border-radius: 0.25rem;
  transition: all 0.15s ease;
}

.search-clear:hover {
  color: #4B5563;
  background: #F3F4F6;
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
  height: 5rem;
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
  border-color: #10B981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
}

/* Indicador lateral */
.confirmado-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #10B981, #0D9488);
  border-radius: 0.75rem 0 0 0.75rem;
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
  background: linear-gradient(135deg, #10B981 0%, #0D9488 100%);
  border-radius: 0.625rem;
}

.confirmado-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #10B981;
  border-radius: 9999px;
  border: 2px solid white;
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

/* Sesiones */
.sesiones-display {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.sesiones-value {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #0D9488;
}

.sesiones-total {
  font-size: 0.75rem;
  color: #9CA3AF;
}

/* Monto */
.info-monto {
  text-align: right;
}

.monto-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #059669;
}

.estado-confirmado {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: #10B981;
}

/* Arrow */
.bono-arrow {
  flex-shrink: 0;
  color: #D1D5DB;
  transition: all 0.15s ease;
}

.bono-card:hover .bono-arrow {
  color: #10B981;
  transform: translateX(2px);
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
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.empty-no-data .empty-icon {
  background: rgba(107, 114, 128, 0.1);
  color: #6B7280;
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

  .mes-selector {
    width: 100%;
  }

  .mes-select {
    width: 100%;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .search-bar {
    padding: 0.75rem 1rem;
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

  .bono-arrow {
    display: none;
  }
}
</style>
