<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: Tabla de Pacientes
 * =============================================================================
 * Tabla rediseñada con mejor legibilidad:
 * - Avatar con iniciales
 * - Información de contacto estructurada
 * - Estado de bono visual
 * - Acciones organizadas
 * - Paginación
 */

import {
  EnvelopeIcon,
  PhoneIcon,
  EyeIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'

// Props
interface Bono {
  id: string
  sesiones_totales: number
  sesiones_restantes: number
  estado: string
}

interface Paciente {
  id: string
  nombre_completo: string
  email: string
  telefono?: string
  terapeuta_nombre?: string
  terapeuta_id?: string
  area_de_acompanamiento?: string
  estado: string
  activo: boolean
  bono_activo?: Bono | null
  total_citas: number
  sesiones_completadas: number
}

interface Props {
  pacientes: Paciente[]
  cargando?: boolean
  paginaActual?: number
  porPagina?: number
}

const props = withDefaults(defineProps<Props>(), {
  cargando: false,
  paginaActual: 1,
  porPagina: 15
})

// Emits
const emit = defineEmits<{
  'ver-detalle': [paciente: Paciente]
  'editar': [paciente: Paciente]
  'eliminar': [paciente: Paciente]
  'whatsapp': [paciente: Paciente]
  'cambiar-pagina': [pagina: number]
}>()

// Estado local para menú de acciones
const menuAbierto = ref<string | null>(null)

// Computed
const totalPaginas = computed(() => {
  return Math.ceil(props.pacientes.length / props.porPagina)
})

const pacientesPaginados = computed(() => {
  const inicio = (props.paginaActual - 1) * props.porPagina
  const fin = inicio + props.porPagina
  return props.pacientes.slice(inicio, fin)
})

// Utilidades
const obtenerIniciales = (nombre: string) => {
  if (!nombre) return '??'
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const getEstadoConfig = (estado: string, activo: boolean) => {
  const esActivo = estado === 'activo' || activo
  return {
    label: esActivo ? 'Activo' : 'Inactivo',
    class: esActivo ? 'estado-activo' : 'estado-inactivo'
  }
}

const getBonoConfig = (bono: Bono | null | undefined) => {
  if (!bono) {
    return { label: 'Sin bono', class: 'bono-sin', icon: 'none' }
  }
  if (bono.sesiones_restantes === 0) {
    return { label: 'Agotado', class: 'bono-agotado', icon: 'warning' }
  }
  if (bono.sesiones_restantes === 1) {
    return { label: 'Última sesión', class: 'bono-ultimo', icon: 'warning' }
  }
  if (bono.sesiones_restantes === 2) {
    return { label: 'Por agotar', class: 'bono-bajo', icon: 'warning' }
  }
  return { label: 'Activo', class: 'bono-activo', icon: 'check' }
}

const toggleMenu = (pacienteId: string) => {
  menuAbierto.value = menuAbierto.value === pacienteId ? null : pacienteId
}

const cerrarMenu = () => {
  menuAbierto.value = null
}

// Cerrar menú al hacer clic fuera
onMounted(() => {
  document.addEventListener('click', cerrarMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', cerrarMenu)
})
</script>

<template>
  <div class="tabla-container">
    <!-- Loading -->
    <div v-if="cargando" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando pacientes...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="pacientes.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h3 class="empty-title">No se encontraron pacientes</h3>
      <p class="empty-description">Intenta con otros términos de búsqueda o ajusta los filtros</p>
    </div>

    <!-- Tabla -->
    <template v-else>
      <div class="table-wrapper">
        <table class="pacientes-table">
          <thead>
            <tr>
              <th class="th-paciente">Paciente</th>
              <th class="th-contacto">Contacto</th>
              <th class="th-terapeuta">Terapeuta</th>
              <th class="th-bono">Estado Bono</th>
              <th class="th-sesiones">Sesiones</th>
              <th class="th-estado">Estado</th>
              <th class="th-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="paciente in pacientesPaginados"
              :key="paciente.id"
              class="fila-paciente"
              @click="emit('ver-detalle', paciente)"
            >
              <!-- Paciente -->
              <td class="td-paciente">
                <div class="paciente-info">
                  <div class="avatar">
                    <span>{{ obtenerIniciales(paciente.nombre_completo) }}</span>
                  </div>
                  <div class="paciente-texto">
                    <span class="paciente-nombre">{{ paciente.nombre_completo }}</span>
                    <span class="paciente-area">{{ paciente.area_de_acompanamiento || 'Sin área asignada' }}</span>
                  </div>
                </div>
              </td>

              <!-- Contacto -->
              <td class="td-contacto">
                <div class="contacto-info">
                  <a
                    :href="`mailto:${paciente.email}`"
                    class="contacto-item"
                    @click.stop
                    :title="paciente.email"
                  >
                    <EnvelopeIcon class="w-4 h-4" />
                    <span class="contacto-texto">{{ paciente.email }}</span>
                  </a>
                  <a
                    v-if="paciente.telefono"
                    :href="`tel:${paciente.telefono}`"
                    class="contacto-item"
                    @click.stop
                  >
                    <PhoneIcon class="w-4 h-4" />
                    <span>{{ paciente.telefono }}</span>
                  </a>
                </div>
              </td>

              <!-- Terapeuta -->
              <td class="td-terapeuta">
                <span v-if="paciente.terapeuta_nombre" class="terapeuta-nombre">
                  {{ paciente.terapeuta_nombre }}
                </span>
                <span v-else class="sin-asignar">Sin asignar</span>
              </td>

              <!-- Estado Bono -->
              <td class="td-bono">
                <div class="bono-info">
                  <div
                    v-if="paciente.bono_activo"
                    class="bono-detalle"
                    :class="getBonoConfig(paciente.bono_activo).class"
                  >
                    <!-- Sesiones restantes -->
                    <div class="bono-sesiones">
                      <span class="sesiones-valor">{{ paciente.bono_activo.sesiones_restantes }}</span>
                      <span class="sesiones-total">/{{ paciente.bono_activo.sesiones_totales }}</span>
                    </div>
                    <!-- Barra de progreso -->
                    <div class="bono-progreso">
                      <div
                        class="bono-progreso-fill"
                        :style="{ width: `${(paciente.bono_activo.sesiones_restantes / paciente.bono_activo.sesiones_totales) * 100}%` }"
                      ></div>
                    </div>
                    <!-- Alerta -->
                    <div v-if="paciente.bono_activo.sesiones_restantes <= 2" class="bono-alerta">
                      <ExclamationTriangleIcon class="w-3 h-3" />
                      <span>{{ paciente.bono_activo.sesiones_restantes === 0 ? 'Agotado' : 'Renovar' }}</span>
                    </div>
                  </div>
                  <span v-else class="sin-bono">Sin bono</span>
                </div>
              </td>

              <!-- Sesiones -->
              <td class="td-sesiones">
                <div class="sesiones-info">
                  <span class="sesiones-total-num">{{ paciente.total_citas || 0 }}</span>
                  <span class="sesiones-label">{{ paciente.sesiones_completadas || 0 }} completadas</span>
                </div>
              </td>

              <!-- Estado -->
              <td class="td-estado">
                <span
                  class="estado-badge"
                  :class="getEstadoConfig(paciente.estado, paciente.activo).class"
                >
                  <span class="estado-dot"></span>
                  {{ getEstadoConfig(paciente.estado, paciente.activo).label }}
                </span>
              </td>

              <!-- Acciones -->
              <td class="td-acciones">
                <div class="acciones-group" @click.stop>
                  <!-- WhatsApp -->
                  <button
                    v-if="paciente.telefono"
                    @click="emit('whatsapp', paciente)"
                    class="btn-accion btn-whatsapp"
                    title="WhatsApp"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </button>

                  <!-- Ver detalles -->
                  <button
                    @click="emit('ver-detalle', paciente)"
                    class="btn-accion btn-ver"
                    title="Ver detalles"
                  >
                    <EyeIcon class="w-5 h-5" />
                  </button>

                  <!-- Menú de más opciones -->
                  <div class="menu-wrapper">
                    <button
                      @click.stop="toggleMenu(paciente.id)"
                      class="btn-accion btn-menu"
                      title="Más opciones"
                    >
                      <EllipsisVerticalIcon class="w-5 h-5" />
                    </button>

                    <!-- Dropdown menu -->
                    <div
                      v-if="menuAbierto === paciente.id"
                      class="menu-dropdown"
                      @click.stop
                    >
                      <button
                        @click="emit('editar', paciente); cerrarMenu()"
                        class="menu-item"
                      >
                        <PencilIcon class="w-4 h-4" />
                        Editar paciente
                      </button>
                      <button
                        @click="emit('eliminar', paciente); cerrarMenu()"
                        class="menu-item menu-item-danger"
                      >
                        <TrashIcon class="w-4 h-4" />
                        Eliminar paciente
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="totalPaginas > 1" class="paginacion">
        <div class="paginacion-info">
          Mostrando {{ ((paginaActual - 1) * porPagina) + 1 }} - {{ Math.min(paginaActual * porPagina, pacientes.length) }} de {{ pacientes.length }}
        </div>

        <div class="paginacion-controles">
          <button
            @click="emit('cambiar-pagina', paginaActual - 1)"
            :disabled="paginaActual === 1"
            class="pag-btn"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <template v-for="pagina in totalPaginas" :key="pagina">
            <button
              v-if="pagina === 1 || pagina === totalPaginas || (pagina >= paginaActual - 1 && pagina <= paginaActual + 1)"
              @click="emit('cambiar-pagina', pagina)"
              class="pag-btn pag-num"
              :class="{ active: pagina === paginaActual }"
            >
              {{ pagina }}
            </button>
            <span
              v-else-if="pagina === paginaActual - 2 || pagina === paginaActual + 2"
              class="pag-dots"
            >
              ...
            </span>
          </template>

          <button
            @click="emit('cambiar-pagina', paginaActual + 1)"
            :disabled="paginaActual === totalPaginas"
            class="pag-btn"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* =============================================================================
   CONTENEDOR PRINCIPAL
   ============================================================================= */

.tabla-container {
  background: white;
  border-radius: 0.875rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* =============================================================================
   LOADING STATE
   ============================================================================= */

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9CA3AF;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #E5E7EB;
  border-top-color: #6366F1;
  border-radius: 9999px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* =============================================================================
   EMPTY STATE
   ============================================================================= */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  color: #D1D5DB;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.875rem;
  color: #6B7280;
}

/* =============================================================================
   TABLA
   ============================================================================= */

.table-wrapper {
  overflow-x: auto;
}

.pacientes-table {
  width: 100%;
  border-collapse: collapse;
}

/* Header */
.pacientes-table thead {
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
}

.pacientes-table th {
  padding: 0.875rem 1rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
  text-align: left;
  white-space: nowrap;
}

.th-acciones {
  text-align: right;
}

/* Filas */
.fila-paciente {
  border-bottom: 1px solid #F3F4F6;
  transition: background-color 0.15s ease;
  cursor: pointer;
}

.fila-paciente:hover {
  background-color: #F9FAFB;
}

.fila-paciente:last-child {
  border-bottom: none;
}

.pacientes-table td {
  padding: 1rem;
  vertical-align: middle;
}

/* =============================================================================
   COLUMNA: PACIENTE
   ============================================================================= */

.paciente-info {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  border-radius: 0.625rem;
  flex-shrink: 0;
}

.paciente-texto {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.paciente-nombre {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.paciente-area {
  font-size: 0.75rem;
  color: #6B7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =============================================================================
   COLUMNA: CONTACTO
   ============================================================================= */

.contacto-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.contacto-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #4B5563;
  text-decoration: none;
  transition: color 0.15s ease;
}

.contacto-item:hover {
  color: #6366F1;
}

.contacto-texto {
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* =============================================================================
   COLUMNA: TERAPEUTA
   ============================================================================= */

.terapeuta-nombre {
  font-size: 0.8125rem;
  color: #374151;
}

.sin-asignar {
  font-size: 0.8125rem;
  color: #9CA3AF;
  font-style: italic;
}

/* =============================================================================
   COLUMNA: BONO
   ============================================================================= */

.bono-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.bono-detalle {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.bono-sesiones {
  display: flex;
  align-items: baseline;
  gap: 0.125rem;
}

.sesiones-valor {
  font-size: 0.9375rem;
  font-weight: 700;
}

.sesiones-total {
  font-size: 0.75rem;
  color: #9CA3AF;
}

/* Colores según estado */
.bono-activo .sesiones-valor { color: #059669; }
.bono-bajo .sesiones-valor { color: #D97706; }
.bono-ultimo .sesiones-valor { color: #EA580C; }
.bono-agotado .sesiones-valor { color: #DC2626; }

/* Barra de progreso */
.bono-progreso {
  width: 4.5rem;
  height: 0.375rem;
  background: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
}

.bono-progreso-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.bono-activo .bono-progreso-fill { background: #10B981; }
.bono-bajo .bono-progreso-fill { background: #F59E0B; }
.bono-ultimo .bono-progreso-fill { background: #F97316; }
.bono-agotado .bono-progreso-fill { background: #EF4444; }

/* Alerta */
.bono-alerta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: #EA580C;
}

.sin-bono {
  font-size: 0.8125rem;
  color: #9CA3AF;
  font-style: italic;
}

/* =============================================================================
   COLUMNA: SESIONES
   ============================================================================= */

.sesiones-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.sesiones-total-num {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1F2937;
}

.sesiones-label {
  font-size: 0.6875rem;
  color: #6B7280;
}

/* =============================================================================
   COLUMNA: ESTADO
   ============================================================================= */

.estado-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.6875rem;
  font-weight: 600;
  border-radius: 9999px;
}

.estado-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
}

.estado-activo {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.estado-activo .estado-dot {
  background: #10B981;
}

.estado-inactivo {
  background: rgba(107, 114, 128, 0.1);
  color: #4B5563;
}

.estado-inactivo .estado-dot {
  background: #9CA3AF;
}

/* =============================================================================
   COLUMNA: ACCIONES
   ============================================================================= */

.td-acciones {
  text-align: right;
}

.acciones-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}

.btn-accion {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.btn-whatsapp {
  color: #25D366;
}

.btn-whatsapp:hover {
  background: rgba(37, 211, 102, 0.1);
}

.btn-ver {
  color: #6366F1;
}

.btn-ver:hover {
  background: rgba(99, 102, 241, 0.1);
}

.btn-menu {
  color: #6B7280;
}

.btn-menu:hover {
  background: #F3F4F6;
}

/* Menú dropdown */
.menu-wrapper {
  position: relative;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 20;
  min-width: 10rem;
  padding: 0.25rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  margin-top: 0.25rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  color: #374151;
  text-align: left;
  border-radius: 0.375rem;
  transition: all 0.15s ease;
}

.menu-item:hover {
  background: #F3F4F6;
}

.menu-item-danger {
  color: #DC2626;
}

.menu-item-danger:hover {
  background: #FEF2F2;
}

/* =============================================================================
   PAGINACIÓN
   ============================================================================= */

.paginacion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-top: 1px solid #F3F4F6;
}

.paginacion-info {
  font-size: 0.8125rem;
  color: #6B7280;
}

.paginacion-controles {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pag-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6B7280;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  transition: all 0.15s ease;
}

.pag-btn:hover:not(:disabled) {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.pag-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pag-btn.active {
  color: white;
  background: #6366F1;
  border-color: #6366F1;
}

.pag-dots {
  padding: 0 0.25rem;
  color: #9CA3AF;
}

/* =============================================================================
   RESPONSIVE
   ============================================================================= */

@media (max-width: 1024px) {
  .th-sesiones,
  .td-sesiones {
    display: none;
  }
}

@media (max-width: 768px) {
  .th-terapeuta,
  .td-terapeuta,
  .th-bono,
  .td-bono {
    display: none;
  }

  .pacientes-table td {
    padding: 0.75rem;
  }

  .paginacion {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
