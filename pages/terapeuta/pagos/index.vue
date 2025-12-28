<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { usePagosRegistros, type PagoRegistro } from '~/composables/usePagosRegistros'
import { useFacturas, type Factura } from '~/composables/useFacturas'
import { usePacientes } from '~/composables/usePacientes'

definePageMeta({
  layout: 'terapeuta',
  middleware: ['auth']
})

// Composables
const { getPagos, loading: loadingPagos, formatearMetodoPago } = usePagosRegistros()
const { getFacturas, loading: loadingFacturas, formatearImporte, formatearFecha, getEstadoColor, anularFactura } = useFacturas()
const { pacientes, loadAllPacientes } = usePacientes()
const { waitForUser, userProfile } = useSupabase()

// Estado
const activeTab = ref<'pagos' | 'facturas'>('pagos')
const pagos = ref<PagoRegistro[]>([])
const facturas = ref<Factura[]>([])
const showPagoModal = ref(false)

// Filtros
const filtros = ref({
  fechaDesde: '',
  fechaHasta: '',
  pacienteId: '',
  estado: ''
})

// Paginación
const paginaPagos = ref(1)
const paginaFacturas = ref(1)
const itemsPorPagina = 20
const totalPagos = ref(0)
const totalFacturas = ref(0)

// Computed
const totalPaginasPagos = computed(() => Math.ceil(totalPagos.value / itemsPorPagina))
const totalPaginasFacturas = computed(() => Math.ceil(totalFacturas.value / itemsPorPagina))

const loading = computed(() => loadingPagos.value || loadingFacturas.value)

// Métodos
async function cargarPagos() {
  const result = await getPagos({
    fechaDesde: filtros.value.fechaDesde || undefined,
    fechaHasta: filtros.value.fechaHasta || undefined,
    pacienteId: filtros.value.pacienteId || undefined
  })
  if (result.success && result.data) {
    pagos.value = result.data
    totalPagos.value = result.total || result.data.length
  } else {
    pagos.value = []
    totalPagos.value = 0
  }
}

async function cargarFacturas() {
  const result = await getFacturas({
    fechaDesde: filtros.value.fechaDesde || undefined,
    fechaHasta: filtros.value.fechaHasta || undefined,
    pacienteId: filtros.value.pacienteId || undefined,
    estado: (filtros.value.estado as 'borrador' | 'emitida' | 'anulada') || undefined
  })
  if (result.success && result.data) {
    facturas.value = result.data
    totalFacturas.value = result.total || result.data.length
  } else {
    facturas.value = []
    totalFacturas.value = 0
  }
}

function aplicarFiltros() {
  paginaPagos.value = 1
  paginaFacturas.value = 1
  if (activeTab.value === 'pagos') {
    cargarPagos()
  } else {
    cargarFacturas()
  }
}

function limpiarFiltros() {
  filtros.value = {
    fechaDesde: '',
    fechaHasta: '',
    pacienteId: '',
    estado: ''
  }
  aplicarFiltros()
}

async function handleAnularFactura(factura: Factura) {
  if (!confirm(`¿Estás seguro de anular la factura ${factura.numero_factura}?`)) return

  const motivo = prompt('Motivo de anulación:')
  if (!motivo) return

  const success = await anularFactura(factura.id, motivo)
  if (success) {
    cargarFacturas()
  }
}

function descargarPDF(factura: Factura) {
  // Por ahora mostrar mensaje, se implementará con pdfmake
  alert(`Generando PDF para factura ${factura.numero_factura}...`)
}

function getNombrePaciente(pacienteId: string | null): string {
  if (!pacienteId) return 'Sin paciente'
  const paciente = pacientes.value.find(p => p.id === pacienteId)
  return paciente ? paciente.nombre : 'Paciente no encontrado'
}

function handlePagoCreado() {
  showPagoModal.value = false
  cargarPagos()
  cargarFacturas()
}

// Watchers
watch(activeTab, (tab) => {
  if (tab === 'pagos') {
    cargarPagos()
  } else {
    cargarFacturas()
  }
})

watch(paginaPagos, cargarPagos)
watch(paginaFacturas, cargarFacturas)

// Lifecycle
onMounted(async () => {
  // Esperar a que el usuario esté autenticado antes de cargar datos
  await waitForUser()
  await loadAllPacientes()
  cargarPagos()
})
</script>

<template>
  <div class="pagos-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <h1>Pagos y Facturación</h1>
        <button class="btn-primary" @click="showPagoModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Pago
        </button>
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'pagos' }]"
        @click="activeTab = 'pagos'"
      >
        Registros de Pago
      </button>
      <button
        :class="['tab', { active: activeTab === 'facturas' }]"
        @click="activeTab = 'facturas'"
      >
        Facturas
      </button>
    </div>

    <!-- Filtros -->
    <div class="filtros">
      <div class="filtro-grupo">
        <label>Desde</label>
        <input
          type="date"
          v-model="filtros.fechaDesde"
          class="input-date"
        />
      </div>
      <div class="filtro-grupo">
        <label>Hasta</label>
        <input
          type="date"
          v-model="filtros.fechaHasta"
          class="input-date"
        />
      </div>
      <div class="filtro-grupo">
        <label>Paciente</label>
        <select v-model="filtros.pacienteId" class="input-select">
          <option value="">Todos</option>
          <option v-for="p in pacientes" :key="p.id" :value="p.id">
            {{ p.nombre }}
          </option>
        </select>
      </div>
      <div v-if="activeTab === 'facturas'" class="filtro-grupo">
        <label>Estado</label>
        <select v-model="filtros.estado" class="input-select">
          <option value="">Todos</option>
          <option value="emitida">Emitida</option>
          <option value="borrador">Borrador</option>
          <option value="anulada">Anulada</option>
        </select>
      </div>
      <div class="filtro-acciones">
        <button class="btn-secondary" @click="aplicarFiltros">Filtrar</button>
        <button class="btn-text" @click="limpiarFiltros">Limpiar</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando...</p>
    </div>

    <!-- Tabla de Pagos -->
    <div v-else-if="activeTab === 'pagos'" class="table-container">
      <table v-if="pagos.length > 0" class="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Concepto</th>
            <th>Método</th>
            <th class="text-right">Monto</th>
            <th>Bono</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pago in pagos" :key="pago.id">
            <td class="fecha">{{ formatearFecha(pago.fecha_pago) }}</td>
            <td>{{ getNombrePaciente(pago.paciente_id) }}</td>
            <td class="concepto">{{ pago.concepto || '-' }}</td>
            <td>
              <span class="metodo-badge">{{ formatearMetodoPago(pago.metodo_pago) }}</span>
            </td>
            <td class="text-right monto">{{ formatearImporte(pago.monto) }}</td>
            <td>
              <span v-if="pago.bono_id" class="bono-badge">Bono</span>
              <span v-else class="text-muted">-</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
        <p>No hay pagos registrados</p>
        <button class="btn-primary" @click="showPagoModal = true">Registrar primer pago</button>
      </div>

      <!-- Paginación -->
      <div v-if="pagos.length > 0" class="paginacion">
        <button
          :disabled="paginaPagos === 1"
          @click="paginaPagos--"
          class="btn-pag"
        >
          Anterior
        </button>
        <span class="pag-info">Página {{ paginaPagos }}</span>
        <button
          :disabled="pagos.length < itemsPorPagina"
          @click="paginaPagos++"
          class="btn-pag"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Tabla de Facturas -->
    <div v-else class="table-container">
      <table v-if="facturas.length > 0" class="data-table">
        <thead>
          <tr>
            <th>Nº Factura</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Concepto</th>
            <th class="text-right">Base</th>
            <th class="text-right">Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="factura in facturas" :key="factura.id">
            <td class="numero-factura">{{ factura.numero_factura }}</td>
            <td class="fecha">{{ formatearFecha(factura.fecha_emision) }}</td>
            <td>
              <div class="cliente-info">
                <span class="cliente-nombre">{{ factura.receptor_nombre }}</span>
                <span v-if="factura.receptor_nif" class="cliente-nif">{{ factura.receptor_nif }}</span>
              </div>
            </td>
            <td class="concepto">{{ factura.concepto }}</td>
            <td class="text-right">{{ formatearImporte(factura.base_imponible) }}</td>
            <td class="text-right monto">{{ formatearImporte(factura.total) }}</td>
            <td>
              <span :class="['estado-badge', getEstadoColor(factura.estado)]">
                {{ factura.estado }}
              </span>
            </td>
            <td class="acciones">
              <button
                class="btn-icon"
                title="Descargar PDF"
                @click="descargarPDF(factura)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
              <button
                v-if="factura.estado === 'emitida'"
                class="btn-icon btn-danger"
                title="Anular factura"
                @click="handleAnularFactura(factura)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p>No hay facturas emitidas</p>
        <p class="text-muted">Las facturas se generan al registrar pagos</p>
      </div>

      <!-- Paginación -->
      <div v-if="facturas.length > 0" class="paginacion">
        <button
          :disabled="paginaFacturas === 1"
          @click="paginaFacturas--"
          class="btn-pag"
        >
          Anterior
        </button>
        <span class="pag-info">Página {{ paginaFacturas }}</span>
        <button
          :disabled="facturas.length < itemsPorPagina"
          @click="paginaFacturas++"
          class="btn-pag"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Modal de Pago -->
    <PaymentPagoUnificadoModal
      :visible="showPagoModal"
      @close="showPagoModal = false"
      @saved="handlePagoCreado"
    />
  </div>
</template>

<style scoped>
.pagos-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-primary .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.tab:hover {
  color: #374151;
}

.tab.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
}

/* Filtros */
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.filtro-grupo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filtro-grupo label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
}

.input-date,
.input-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  min-width: 150px;
}

.input-date:focus,
.input-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.filtro-acciones {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-text {
  padding: 0.5rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.btn-text:hover {
  color: #374151;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Tabla */
.table-container {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover {
  background: #f9fafb;
}

.text-right {
  text-align: right;
}

.fecha {
  color: #6b7280;
  white-space: nowrap;
}

.concepto {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.monto {
  font-weight: 600;
  color: #059669;
}

.numero-factura {
  font-family: monospace;
  font-weight: 500;
}

/* Badges */
.metodo-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
}

.bono-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #dbeafe;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #1d4ed8;
}

.estado-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.estado-badge.success {
  background: #d1fae5;
  color: #065f46;
}

.estado-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.estado-badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.cliente-info {
  display: flex;
  flex-direction: column;
}

.cliente-nombre {
  font-weight: 500;
}

.cliente-nif {
  font-size: 0.75rem;
  color: #6b7280;
}

.text-muted {
  color: #9ca3af;
}

/* Acciones */
.acciones {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-icon:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

.btn-icon svg {
  width: 1rem;
  height: 1rem;
}

.btn-icon.btn-danger:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-state p {
  margin: 0 0 0.5rem;
}

.empty-state .btn-primary {
  margin-top: 1rem;
}

/* Paginación */
.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-pag {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-pag:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-pag:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pag-info {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .pagos-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filtros {
    flex-direction: column;
  }

  .filtro-grupo {
    width: 100%;
  }

  .input-date,
  .input-select {
    width: 100%;
  }

  .data-table {
    font-size: 0.8125rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.5rem;
  }

  .concepto {
    max-width: 120px;
  }
}
</style>
