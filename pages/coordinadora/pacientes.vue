<template>
  <div class="pacientes-page">
    <!-- Header -->
    <PacientesHeader
      v-model:busqueda="busqueda"
      :total-pacientes="totalPacientes"
      :pacientes-activos="pacientesActivos"
      @nuevo-paciente="mostrarModalNuevoPaciente = true"
      @importar="handleImportar"
      @exportar="handleExportar"
    />

    <!-- Métricas -->
    <PacientesMetricas
      :total-pacientes="totalPacientes"
      :pacientes-activos="pacientesActivos"
      :bonos-activos="bonosActivos"
      :bonos-por-agotar="bonosPorAgotar"
    />

    <!-- Filtros -->
    <PacientesFiltros
      v-model:filtro-estado="filtroEstado"
      v-model:filtro-terapeuta="filtroTerapeuta"
      v-model:filtro-bono="filtroBono"
      :terapeutas="terapeutas"
      :total-resultados="pacientesFiltrados.length"
      :total-pacientes="totalPacientes"
      @limpiar-filtros="limpiarFiltros"
    />

    <!-- Tabla de Pacientes -->
    <PacientesTabla
      :pacientes="pacientesFiltrados"
      :cargando="cargando"
      :pagina-actual="paginaActual"
      :por-pagina="porPagina"
      @ver-detalle="verDetallePaciente"
      @editar="verDetallePaciente($event); activarEdicion()"
      @eliminar="confirmarEliminarPaciente"
      @whatsapp="enviarWhatsApp"
      @cambiar-pagina="paginaActual = $event"
    />

    <!-- Modal Detalle del Paciente -->
    <Teleport to="body">
      <div
        v-if="mostrarModalDetalle && pacienteSeleccionado"
        class="modal-overlay"
        @click.self="cerrarModalDetalle"
      >
        <div class="modal-container">
          <!-- Header del Modal -->
          <div class="modal-header">
            <div class="modal-header-left">
              <div class="modal-avatar">
                {{ obtenerIniciales(pacienteSeleccionado.nombre_completo) }}
              </div>
              <div class="modal-title-group">
                <h2 class="modal-title">{{ pacienteSeleccionado.nombre_completo }}</h2>
                <p class="modal-subtitle">{{ modoEdicion ? 'Editando información del paciente' : 'Información del paciente' }}</p>
              </div>
            </div>
            <div class="modal-header-actions">
              <button
                v-if="!modoEdicion"
                @click="activarEdicion"
                class="modal-btn-icon"
                title="Editar paciente"
              >
                <PencilIcon class="w-5 h-5" />
              </button>
              <button
                @click="cerrarModalDetalle"
                class="modal-btn-icon"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- Contenido del Modal -->
          <div class="modal-body">
            <!-- Formulario de Edición -->
            <div v-if="modoEdicion" class="edit-form">
              <!-- Alerta de modo edición -->
              <div class="edit-alert">
                <InformationCircleIcon class="w-5 h-5" />
                <div>
                  <p class="edit-alert-title">Modo de edición activado</p>
                  <p class="edit-alert-text">Modifica los campos necesarios y guarda los cambios</p>
                </div>
              </div>

              <!-- Campos de edición -->
              <div class="form-section">
                <h3 class="form-section-title">
                  <UserIcon class="w-5 h-5" />
                  Información Personal
                </h3>
                <div class="form-grid">
                  <div class="form-field">
                    <label class="form-label">Nombre Completo <span class="required">*</span></label>
                    <input v-model="datosEdicion.nombre_completo" type="text" class="form-input" placeholder="Nombre completo" />
                  </div>
                  <div class="form-field">
                    <label class="form-label">Email <span class="required">*</span></label>
                    <input v-model="datosEdicion.email" type="email" class="form-input" placeholder="correo@ejemplo.com" />
                  </div>
                  <div class="form-field">
                    <label class="form-label">Teléfono</label>
                    <input v-model="datosEdicion.telefono" type="tel" class="form-input" placeholder="+34 600 000 000" />
                  </div>
                  <div class="form-field">
                    <label class="form-label">Terapeuta Asignado</label>
                    <select v-model="datosEdicion.terapeuta_id" class="form-select">
                      <option :value="null">Sin asignar</option>
                      <option v-for="terapeuta in terapeutas" :key="terapeuta.id" :value="terapeuta.id">
                        {{ terapeuta.nombre }}
                      </option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Área de Acompañamiento</label>
                    <input v-model="datosEdicion.area_de_acompanamiento" type="text" class="form-input" placeholder="Ej: Ansiedad, Depresión" />
                  </div>
                  <div class="form-field">
                    <label class="form-label">Frecuencia</label>
                    <select v-model="datosEdicion.frecuencia" class="form-select">
                      <option value="">Seleccionar...</option>
                      <option value="semanal">Semanal</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="mensual">Mensual</option>
                      <option value="ocasional">Ocasional</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Estado -->
              <div class="form-section">
                <h3 class="form-section-title">
                  <CheckCircleIcon class="w-5 h-5" />
                  Estado del Paciente
                </h3>
                <div class="toggle-field">
                  <input v-model="datosEdicion.activo" type="checkbox" id="activo-edicion" class="toggle-input" />
                  <label for="activo-edicion" class="toggle-label">
                    Paciente activo
                  </label>
                  <span class="toggle-status">{{ datosEdicion.activo ? 'Activo' : 'Inactivo' }}</span>
                </div>
              </div>

              <!-- Acciones del formulario -->
              <div class="form-actions">
                <button @click="cancelarEdicion" :disabled="guardandoEdicion" class="btn btn-secondary">
                  Cancelar
                </button>
                <button @click="guardarEdicion" :disabled="guardandoEdicion" class="btn btn-primary">
                  <ArrowPathIcon v-if="guardandoEdicion" class="w-4 h-4 animate-spin" />
                  <CheckIcon v-else class="w-4 h-4" />
                  {{ guardandoEdicion ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </div>

            <!-- Vista Normal (Solo lectura) -->
            <div v-else class="detail-view">
              <!-- Estado y Acciones Rápidas -->
              <div class="detail-header">
                <div class="detail-badges">
                  <span class="badge" :class="pacienteSeleccionado.activo ? 'badge-success' : 'badge-gray'">
                    <span class="badge-dot"></span>
                    {{ pacienteSeleccionado.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                  <span v-if="pacienteSeleccionado.bono_activo" class="badge badge-purple">
                    <TicketIcon class="w-4 h-4" />
                    Bono: {{ pacienteSeleccionado.bono_activo.sesiones_restantes }}/{{ pacienteSeleccionado.bono_activo.sesiones_totales }}
                  </span>
                </div>
                <div class="detail-actions">
                  <button v-if="pacienteSeleccionado.telefono" @click="enviarWhatsApp(pacienteSeleccionado)" class="btn btn-whatsapp">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp
                  </button>
                  <button @click="() => { cerrarModalDetalle(); router.push(`/coordinadora/pacientes/${pacienteSeleccionado.id}`); }" class="btn btn-primary">
                    <DocumentTextIcon class="w-4 h-4" />
                    Historial Completo
                  </button>
                </div>
              </div>

              <!-- Información Personal -->
              <div class="detail-section">
                <h3 class="detail-section-title">
                  <UserIcon class="w-5 h-5" />
                  Información Personal
                </h3>
                <div class="info-grid">
                  <div class="info-card">
                    <span class="info-label">Nombre Completo</span>
                    <span class="info-value">{{ pacienteSeleccionado.nombre_completo || 'No especificado' }}</span>
                  </div>
                  <div class="info-card">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ pacienteSeleccionado.email || 'No especificado' }}</span>
                  </div>
                  <div class="info-card">
                    <span class="info-label">Teléfono</span>
                    <span class="info-value">{{ pacienteSeleccionado.telefono || 'No especificado' }}</span>
                  </div>
                  <div class="info-card">
                    <span class="info-label">Terapeuta Asignado</span>
                    <span class="info-value">{{ pacienteSeleccionado.terapeuta_nombre || 'Sin asignar' }}</span>
                  </div>
                  <div class="info-card">
                    <span class="info-label">Área de Acompañamiento</span>
                    <span class="info-value">{{ pacienteSeleccionado.area_de_acompanamiento || 'No especificado' }}</span>
                  </div>
                  <div class="info-card">
                    <span class="info-label">Frecuencia</span>
                    <span class="info-value capitalize">{{ pacienteSeleccionado.frecuencia || 'No especificada' }}</span>
                  </div>
                </div>
              </div>

              <!-- Estadísticas de Sesiones -->
              <div class="detail-section">
                <h3 class="detail-section-title">
                  <ChartBarIcon class="w-5 h-5" />
                  Estadísticas de Sesiones
                </h3>
                <div class="stats-grid">
                  <div class="stat-card stat-blue">
                    <span class="stat-value">{{ pacienteSeleccionado.total_citas || 0 }}</span>
                    <span class="stat-label">Total Citas</span>
                  </div>
                  <div class="stat-card stat-green">
                    <span class="stat-value">{{ pacienteSeleccionado.sesiones_completadas || 0 }}</span>
                    <span class="stat-label">Completadas</span>
                  </div>
                  <div class="stat-card stat-purple">
                    <span class="stat-value">{{ pacienteSeleccionado.bono_activo?.sesiones_restantes || 0 }}</span>
                    <span class="stat-label">Restantes</span>
                  </div>
                  <div class="stat-card stat-orange">
                    <span class="stat-value">{{ pacienteSeleccionado.bono_activo?.sesiones_totales || 0 }}</span>
                    <span class="stat-label">Total Bono</span>
                  </div>
                </div>
              </div>

              <!-- Estado del Bono -->
              <div v-if="pacienteSeleccionado.bono_activo" class="detail-section">
                <h3 class="detail-section-title">
                  <TicketIcon class="w-5 h-5" />
                  Bono Activo
                </h3>
                <div class="bono-card">
                  <div class="bono-header">
                    <div>
                      <p class="bono-label">Progreso del Bono</p>
                      <p class="bono-value">{{ pacienteSeleccionado.bono_activo.sesiones_restantes }} / {{ pacienteSeleccionado.bono_activo.sesiones_totales }}</p>
                      <p class="bono-subtext">sesiones disponibles</p>
                    </div>
                    <div class="bono-percent">
                      <span class="percent-value">{{ Math.round(((pacienteSeleccionado.bono_activo.sesiones_totales - pacienteSeleccionado.bono_activo.sesiones_restantes) / pacienteSeleccionado.bono_activo.sesiones_totales) * 100) }}%</span>
                      <span class="percent-label">consumido</span>
                    </div>
                  </div>
                  <div class="bono-progress">
                    <div class="bono-progress-bar" :style="{ width: `${((pacienteSeleccionado.bono_activo.sesiones_totales - pacienteSeleccionado.bono_activo.sesiones_restantes) / pacienteSeleccionado.bono_activo.sesiones_totales) * 100}%` }" :class="getBonoProgressClass(pacienteSeleccionado.bono_activo.sesiones_restantes)"></div>
                  </div>
                  <div v-if="pacienteSeleccionado.bono_activo.sesiones_restantes <= 1" class="bono-alert">
                    <ExclamationTriangleIcon class="w-5 h-5" />
                    <div>
                      <p class="bono-alert-title">{{ pacienteSeleccionado.bono_activo.sesiones_restantes === 0 ? 'Bono agotado' : 'Solo queda 1 sesión' }}</p>
                      <p class="bono-alert-text">Se recomienda renovar el bono para continuar las sesiones</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fechas del Sistema -->
              <div class="detail-section">
                <h3 class="detail-section-title">
                  <CalendarIcon class="w-5 h-5" />
                  Fechas del Sistema
                </h3>
                <div class="info-grid cols-2">
                  <div class="info-card">
                    <span class="info-label">Fecha de Registro</span>
                    <span class="info-value">{{ formatearFechaCorta(pacienteSeleccionado.created_at) }}</span>
                  </div>
                  <div v-if="pacienteSeleccionado.updated_at" class="info-card">
                    <span class="info-label">Última Actualización</span>
                    <span class="info-value">{{ formatearFechaCorta(pacienteSeleccionado.updated_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer del Modal -->
          <div class="modal-footer">
            <button @click="cerrarModalDetalle" class="btn btn-secondary">
              Cerrar
            </button>
            <button v-if="!modoEdicion" @click="() => { cerrarModalDetalle(); router.push(`/coordinadora/pacientes/${pacienteSeleccionado.id}`); }" class="btn btn-primary">
              Ver Historial Completo
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Nuevo Paciente -->
    <Teleport to="body">
      <div
        v-if="mostrarModalNuevoPaciente"
        class="modal-overlay"
        @click.self="cerrarModal"
      >
        <div class="modal-container modal-lg">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">Crear Nuevo Paciente</h2>
            <button @click="cerrarModal" class="modal-btn-icon">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Formulario -->
          <form @submit.prevent="crearPaciente" class="modal-body">
            <!-- Información Personal -->
            <div class="form-section">
              <h3 class="form-section-title">Información Personal</h3>
              <div class="form-grid">
                <div class="form-field">
                  <label class="form-label">Nombre Completo <span class="required">*</span></label>
                  <input v-model="nuevoPaciente.nombre_completo" type="text" required class="form-input" placeholder="Ej: Juan Pérez García" />
                </div>
                <div class="form-field">
                  <label class="form-label">Email <span class="required">*</span></label>
                  <input v-model="nuevoPaciente.email" type="email" required class="form-input" placeholder="correo@ejemplo.com" />
                </div>
                <div class="form-field">
                  <label class="form-label">Teléfono <span class="required">*</span></label>
                  <input v-model="nuevoPaciente.telefono" type="tel" required class="form-input" placeholder="+34 612 345 678" />
                </div>
              </div>
            </div>

            <!-- Asignación -->
            <div class="form-section">
              <h3 class="form-section-title">Asignación</h3>
              <div class="form-field">
                <label class="form-label">Terapeuta Asignado</label>
                <select v-model="nuevoPaciente.terapeuta_id" class="form-select">
                  <option :value="null">Sin asignar</option>
                  <option v-for="terapeuta in terapeutas" :key="terapeuta.id" :value="terapeuta.id">
                    {{ terapeuta.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Migración de Bono -->
            <div class="form-section bono-migration">
              <div class="bono-migration-header">
                <InformationCircleIcon class="w-5 h-5" />
                <div>
                  <h3 class="form-section-title mb-0">Migración de Datos (Opcional)</h3>
                  <p class="form-section-hint">Si el paciente viene con un bono existente, completa esta información</p>
                </div>
                <input v-model="nuevoPaciente.tiene_bono_existente" type="checkbox" class="toggle-checkbox" />
              </div>

              <div v-if="nuevoPaciente.tiene_bono_existente" class="bono-migration-form">
                <div class="form-grid">
                  <div class="form-field">
                    <label class="form-label">Tipo de Bono <span class="required">*</span></label>
                    <select v-model="nuevoPaciente.bono.tipo" @change="actualizarSesionesTotales" required class="form-select">
                      <option value="">Seleccionar...</option>
                      <option value="semanal">Semanal (4 sesiones/mes)</option>
                      <option value="quincenal">Quincenal (2 sesiones/mes)</option>
                      <option value="mensual">Mensual (1 sesión/mes)</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Sesiones Totales</label>
                    <input :value="nuevoPaciente.bono.sesiones_totales" type="number" disabled class="form-input disabled" />
                  </div>
                  <div class="form-field">
                    <label class="form-label">Sesiones Consumidas <span class="required">*</span></label>
                    <input v-model.number="nuevoPaciente.bono.sesiones_consumidas" type="number" min="0" :max="nuevoPaciente.bono.sesiones_totales || 0" required :disabled="!nuevoPaciente.bono.tipo" class="form-input" />
                  </div>
                  <div class="form-field">
                    <label class="form-label">Fecha del Último Pago</label>
                    <input v-model="nuevoPaciente.bono.fecha_compra" type="date" class="form-input" />
                  </div>
                  <div class="form-field">
                    <label class="form-label">Monto Pagado (€)</label>
                    <input v-model.number="nuevoPaciente.bono.monto_total" type="number" min="0" step="0.01" class="form-input" placeholder="0.00" />
                  </div>
                  <div class="form-field">
                    <label class="form-label">Estado del Pago</label>
                    <select v-model="nuevoPaciente.bono.estado_pago" class="form-select">
                      <option value="pagado">Pagado</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="parcial">Pago Parcial</option>
                    </select>
                  </div>
                </div>

                <!-- Resumen visual -->
                <div class="bono-summary">
                  <p class="bono-summary-title">Resumen del Bono:</p>
                  <div class="bono-summary-content">
                    <div class="bono-summary-progress">
                      <div class="bono-summary-labels">
                        <span>{{ nuevoPaciente.bono.sesiones_consumidas || 0 }} consumidas</span>
                        <span>{{ (nuevoPaciente.bono.sesiones_totales || 0) - (nuevoPaciente.bono.sesiones_consumidas || 0) }} restantes</span>
                      </div>
                      <div class="bono-summary-bar">
                        <div class="bono-summary-fill" :style="{ width: `${nuevoPaciente.bono.sesiones_totales > 0 ? (nuevoPaciente.bono.sesiones_consumidas / nuevoPaciente.bono.sesiones_totales) * 100 : 0}%` }"></div>
                      </div>
                    </div>
                    <div class="bono-summary-count">
                      <span class="count-value">{{ (nuevoPaciente.bono.sesiones_totales || 0) - (nuevoPaciente.bono.sesiones_consumidas || 0) }}</span>
                      <span class="count-total">de {{ nuevoPaciente.bono.sesiones_totales || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información Adicional -->
            <div class="form-section">
              <h3 class="form-section-title">Información Adicional</h3>
              <div class="form-field">
                <label class="form-label">Notas</label>
                <textarea v-model="nuevoPaciente.notas" rows="3" class="form-textarea" placeholder="Notas adicionales sobre el paciente..."></textarea>
              </div>
              <div class="toggle-field">
                <input v-model="nuevoPaciente.activo" type="checkbox" id="activo-nuevo" class="toggle-input" />
                <label for="activo-nuevo" class="toggle-label">Paciente Activo</label>
              </div>
            </div>

            <!-- Acciones -->
            <div class="form-actions">
              <button type="button" @click="cerrarModal" class="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" :disabled="guardando" class="btn btn-primary">
                <ArrowPathIcon v-if="guardando" class="w-4 h-4 animate-spin" />
                {{ guardando ? 'Creando...' : 'Crear Paciente' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  XMarkIcon,
  PencilIcon,
  UserIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  TicketIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

const supabase = useSupabaseClient()
const router = useRouter()

definePageMeta({
  layout: 'coordinadora',
  middleware: ['auth', 'role-coordinadora']
})

// =============================================================================
// ESTADO
// =============================================================================

const cargando = ref(true)
const pacientes = ref<any[]>([])
const terapeutas = ref<{ id: string; nombre: string }[]>([])
const busqueda = ref('')
const filtroEstado = ref('')
const filtroTerapeuta = ref('')
const filtroBono = ref('')
const paginaActual = ref(1)
const porPagina = ref(15)

// Modal nuevo paciente
const mostrarModalNuevoPaciente = ref(false)
const guardando = ref(false)
const nuevoPaciente = ref({
  nombre_completo: '',
  email: '',
  telefono: '+34 ',
  terapeuta_id: null as string | null,
  notas: '',
  activo: true,
  tiene_bono_existente: false,
  bono: {
    tipo: '',
    sesiones_totales: 0,
    sesiones_consumidas: 0,
    fecha_compra: null as string | null,
    monto_total: 0,
    estado_pago: 'pagado'
  }
})

// Modal detalle
const pacienteSeleccionado = ref<any>(null)
const mostrarModalDetalle = ref(false)
const modoEdicion = ref(false)
const datosEdicion = ref<any>({})
const guardandoEdicion = ref(false)

// =============================================================================
// COMPUTED
// =============================================================================

const totalPacientes = computed(() => pacientes.value.length)

const pacientesActivos = computed(() =>
  pacientes.value.filter(p => p.estado === 'activo' || p.activo).length
)

const bonosActivos = computed(() =>
  pacientes.value.filter(p => p.bono_activo && p.bono_activo.sesiones_restantes > 0).length
)

const bonosPorAgotar = computed(() =>
  pacientes.value.filter(p => p.bono_activo && p.bono_activo.sesiones_restantes <= 1).length
)

const pacientesFiltrados = computed(() => {
  let resultado = [...pacientes.value]

  // Búsqueda
  if (busqueda.value.trim()) {
    const query = busqueda.value.toLowerCase()
    resultado = resultado.filter(p =>
      p.nombre_completo?.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query) ||
      p.telefono?.includes(query)
    )
  }

  // Filtro estado
  if (filtroEstado.value === 'activo') {
    resultado = resultado.filter(p => p.estado === 'activo' || p.activo)
  } else if (filtroEstado.value === 'inactivo') {
    resultado = resultado.filter(p => p.estado === 'inactivo' || !p.activo)
  }

  // Filtro terapeuta
  if (filtroTerapeuta.value) {
    resultado = resultado.filter(p => p.terapeuta_id === filtroTerapeuta.value)
  }

  // Filtro bono
  if (filtroBono.value === 'con-bono') {
    resultado = resultado.filter(p => p.bono_activo && p.bono_activo.sesiones_restantes > 0)
  } else if (filtroBono.value === 'sin-bono') {
    resultado = resultado.filter(p => !p.bono_activo)
  } else if (filtroBono.value === 'por-agotar') {
    resultado = resultado.filter(p => p.bono_activo && p.bono_activo.sesiones_restantes <= 2)
  }

  return resultado
})

// =============================================================================
// UTILIDADES
// =============================================================================

const obtenerIniciales = (nombre: string) => {
  if (!nombre) return 'PA'
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatearFechaCorta = (fecha: string) => {
  if (!fecha) return 'No especificada'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getBonoProgressClass = (sesionesRestantes: number) => {
  if (sesionesRestantes === 0) return 'bg-red'
  if (sesionesRestantes === 1) return 'bg-orange'
  if (sesionesRestantes === 2) return 'bg-amber'
  return 'bg-green'
}

const limpiarFiltros = () => {
  busqueda.value = ''
  filtroEstado.value = ''
  filtroTerapeuta.value = ''
  filtroBono.value = ''
  paginaActual.value = 1
}

// =============================================================================
// HANDLERS
// =============================================================================

const handleImportar = () => {
  // TODO: Implementar importación
  alert('Funcionalidad de importación próximamente')
}

const handleExportar = () => {
  // TODO: Implementar exportación
  alert('Funcionalidad de exportación próximamente')
}

const verDetallePaciente = (paciente: any) => {
  pacienteSeleccionado.value = paciente
  mostrarModalDetalle.value = true
  modoEdicion.value = false
}

const cerrarModalDetalle = () => {
  mostrarModalDetalle.value = false
  modoEdicion.value = false
  setTimeout(() => {
    pacienteSeleccionado.value = null
  }, 300)
}

const activarEdicion = () => {
  datosEdicion.value = {
    nombre_completo: pacienteSeleccionado.value.nombre_completo || '',
    email: pacienteSeleccionado.value.email || '',
    telefono: pacienteSeleccionado.value.telefono || '',
    terapeuta_id: pacienteSeleccionado.value.terapeuta_id || null,
    area_de_acompanamiento: pacienteSeleccionado.value.area_de_acompanamiento || '',
    frecuencia: pacienteSeleccionado.value.frecuencia || '',
    activo: pacienteSeleccionado.value.activo ?? true
  }
  modoEdicion.value = true
}

const cancelarEdicion = () => {
  modoEdicion.value = false
  datosEdicion.value = {}
}

const guardarEdicion = async () => {
  if (!datosEdicion.value.nombre_completo || !datosEdicion.value.email) {
    alert('El nombre y el email son obligatorios')
    return
  }

  guardandoEdicion.value = true

  try {
    const { error } = await supabase
      .from('pacientes')
      .update({
        nombre_completo: datosEdicion.value.nombre_completo.trim(),
        email: datosEdicion.value.email.trim().toLowerCase(),
        telefono: datosEdicion.value.telefono?.trim() || null,
        terapeuta_id: datosEdicion.value.terapeuta_id || null,
        area_de_acompanamiento: datosEdicion.value.area_de_acompanamiento || null,
        frecuencia: datosEdicion.value.frecuencia || null,
        activo: datosEdicion.value.activo,
        updated_at: new Date().toISOString()
      })
      .eq('id', pacienteSeleccionado.value.id)

    if (error) throw error

    alert('✅ Paciente actualizado correctamente')
    Object.assign(pacienteSeleccionado.value, datosEdicion.value)
    await cargarPacientes()
    modoEdicion.value = false
  } catch (error: any) {
    console.error('Error al actualizar paciente:', error)
    alert(`❌ Error al actualizar: ${error.message}`)
  } finally {
    guardandoEdicion.value = false
  }
}

const cerrarModal = () => {
  mostrarModalNuevoPaciente.value = false
  nuevoPaciente.value = {
    nombre_completo: '',
    email: '',
    telefono: '+34 ',
    terapeuta_id: null,
    notas: '',
    activo: true,
    tiene_bono_existente: false,
    bono: {
      tipo: '',
      sesiones_totales: 0,
      sesiones_consumidas: 0,
      fecha_compra: null,
      monto_total: 0,
      estado_pago: 'pagado'
    }
  }
}

const actualizarSesionesTotales = () => {
  const tipo = nuevoPaciente.value.bono.tipo
  switch (tipo) {
    case 'semanal': nuevoPaciente.value.bono.sesiones_totales = 4; break
    case 'quincenal': nuevoPaciente.value.bono.sesiones_totales = 2; break
    case 'mensual': nuevoPaciente.value.bono.sesiones_totales = 1; break
    default: nuevoPaciente.value.bono.sesiones_totales = 0
  }
  if (nuevoPaciente.value.bono.sesiones_consumidas > nuevoPaciente.value.bono.sesiones_totales) {
    nuevoPaciente.value.bono.sesiones_consumidas = 0
  }
}

const crearPaciente = async () => {
  guardando.value = true

  try {
    if (nuevoPaciente.value.tiene_bono_existente) {
      if (nuevoPaciente.value.bono.sesiones_consumidas > nuevoPaciente.value.bono.sesiones_totales) {
        alert('❌ Las sesiones consumidas no pueden ser mayores a las sesiones totales')
        guardando.value = false
        return
      }
      if (!nuevoPaciente.value.bono.tipo) {
        alert('❌ Debe seleccionar el tipo de bono')
        guardando.value = false
        return
      }
    }

    const pacienteData = {
      nombre_completo: nuevoPaciente.value.nombre_completo.trim(),
      email: nuevoPaciente.value.email.trim().toLowerCase(),
      telefono: nuevoPaciente.value.telefono.trim(),
      terapeuta_id: nuevoPaciente.value.terapeuta_id || null,
      notas: nuevoPaciente.value.notas.trim() || null,
      activo: nuevoPaciente.value.activo,
      created_at: new Date().toISOString()
    }

    const { data: pacienteCreado, error: errorPaciente } = await supabase
      .from('pacientes')
      .insert([pacienteData])
      .select()
      .single()

    if (errorPaciente) throw errorPaciente

    if (nuevoPaciente.value.tiene_bono_existente) {
      const sesionesRestantes = nuevoPaciente.value.bono.sesiones_totales - nuevoPaciente.value.bono.sesiones_consumidas

      const bonoData = {
        paciente_id: pacienteCreado.id,
        tipo_bono: nuevoPaciente.value.bono.tipo,
        sesiones_totales: nuevoPaciente.value.bono.sesiones_totales,
        sesiones_restantes: sesionesRestantes,
        estado: sesionesRestantes > 0 ? 'activo' : 'agotado',
        monto_total: nuevoPaciente.value.bono.monto_total || 0,
        estado_pago: nuevoPaciente.value.bono.estado_pago,
        fecha_pago: nuevoPaciente.value.bono.fecha_compra || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: errorBono } = await supabase
        .from('bonos')
        .insert([bonoData])

      if (errorBono) {
        console.error('Error al crear bono:', errorBono)
        alert(`⚠️ Paciente creado, pero hubo un error al crear el bono: ${errorBono.message}`)
      }
    }

    const mensaje = nuevoPaciente.value.tiene_bono_existente
      ? `✅ Paciente y bono creados exitosamente: ${pacienteCreado.nombre_completo}\n🎫 Bono: ${nuevoPaciente.value.bono.sesiones_totales - nuevoPaciente.value.bono.sesiones_consumidas} sesiones restantes`
      : `✅ Paciente creado exitosamente: ${pacienteCreado.nombre_completo}`

    alert(mensaje)
    cerrarModal()
    await cargarPacientes()
  } catch (error: any) {
    console.error('Error al crear paciente:', error)
    alert(`❌ Error al crear el paciente: ${error.message}`)
  } finally {
    guardando.value = false
  }
}

const enviarWhatsApp = (paciente: any) => {
  if (!paciente.telefono) {
    alert('Este paciente no tiene teléfono registrado')
    return
  }
  const numero = paciente.telefono.replace(/\D/g, '')
  const mensaje = encodeURIComponent(`Hola ${paciente.nombre_completo}, te escribo desde el consultorio de Psicóloga Karem.`)
  window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank')
}

const confirmarEliminarPaciente = (paciente: any) => {
  const confirmacion = confirm(
    `⚠️ ¿Estás seguro de que deseas eliminar a ${paciente.nombre_completo}?\n\n` +
    `Esta acción eliminará:\n` +
    `• El paciente\n` +
    `• Todos sus bonos\n` +
    `• Todas sus citas\n` +
    `• Todo su historial\n\n` +
    `Esta acción NO se puede deshacer.`
  )

  if (confirmacion) {
    eliminarPaciente(paciente)
  }
}

const eliminarPaciente = async (paciente: any) => {
  try {
    await supabase.from('bonos').delete().eq('paciente_id', paciente.id)
    await supabase.from('citas').delete().eq('paciente_id', paciente.id)

    const { error: errorPaciente } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', paciente.id)

    if (errorPaciente) throw errorPaciente

    alert(`✅ Paciente ${paciente.nombre_completo} eliminado exitosamente`)
    await cargarPacientes()
  } catch (error: any) {
    console.error('Error al eliminar paciente:', error)
    alert(`❌ Error al eliminar el paciente: ${error.message}`)
  }
}

// =============================================================================
// CARGA DE DATOS
// =============================================================================

const cargarTerapeutas = async () => {
  try {
    const { data, error } = await supabase
      .from('terapeutas')
      .select('id, nombre_completo')
      .order('nombre_completo', { ascending: true })

    if (error) throw error
    terapeutas.value = data?.map(t => ({ id: t.id, nombre: t.nombre_completo })) || []
  } catch (error) {
    console.error('Error al cargar terapeutas:', error)
    terapeutas.value = []
  }
}

const cargarPacientes = async () => {
  cargando.value = true

  try {
    const { data: pacientesData, error } = await supabase
      .from('pacientes')
      .select('*')
      .order('nombre_completo', { ascending: true })

    if (error) throw error

    if (!pacientesData) {
      pacientes.value = []
      return
    }

    const terapeutaIds = [...new Set(pacientesData.map(p => p.terapeuta_id).filter(Boolean))]
    const terapeutasMap = new Map()

    if (terapeutaIds.length > 0) {
      const { data: terapeutasData } = await supabase
        .from('terapeutas')
        .select('id, nombre_completo')
        .in('id', terapeutaIds)

      terapeutasData?.forEach(t => terapeutasMap.set(t.id, t.nombre_completo))
    }

    const pacientesConDatos = await Promise.all(
      pacientesData.map(async (paciente) => {
        const { data: bonoData } = await supabase
          .from('bonos')
          .select('id, sesiones_totales, sesiones_restantes, created_at, estado')
          .eq('paciente_id', paciente.id)
          .in('estado', ['activo', 'pendiente'])
          .gt('sesiones_restantes', 0)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const { count: totalCitas } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .eq('paciente_id', paciente.id)

        const { count: completadas } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')

        return {
          ...paciente,
          terapeuta_nombre: terapeutasMap.get(paciente.terapeuta_id) || null,
          estado: paciente.activo ? 'activo' : 'inactivo',
          total_citas: totalCitas || 0,
          sesiones_completadas: completadas || 0,
          bono_activo: bonoData ? {
            ...bonoData,
            fecha_compra: bonoData.created_at
          } : null
        }
      })
    )

    pacientes.value = pacientesConDatos
  } catch (error) {
    console.error('Error al cargar pacientes:', error)
    pacientes.value = []
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarTerapeutas()
  cargarPacientes()
})
</script>

<style scoped>
/* =============================================================================
   LAYOUT PRINCIPAL
   ============================================================================= */

.pacientes-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  min-height: 100vh;
  background: #F9FAFB;
}

/* =============================================================================
   MODAL OVERLAY
   ============================================================================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 56rem;
  max-height: 90vh;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-lg {
  max-width: 42rem;
}

/* =============================================================================
   MODAL HEADER
   ============================================================================= */

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #E5E7EB;
  background: white;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  border-radius: 0.875rem;
}

.modal-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  color: #6B7280;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.modal-btn-icon:hover {
  color: #374151;
  background: #F3F4F6;
}

/* =============================================================================
   MODAL BODY
   ============================================================================= */

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* =============================================================================
   MODAL FOOTER
   ============================================================================= */

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #E5E7EB;
  background: white;
}

/* =============================================================================
   BOTONES
   ============================================================================= */

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  color: white;
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
  transform: translateY(-1px);
}

.btn-secondary {
  color: #374151;
  background: white;
  border: 1px solid #E5E7EB;
}

.btn-secondary:hover:not(:disabled) {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.btn-whatsapp {
  color: white;
  background: #25D366;
}

.btn-whatsapp:hover {
  background: #20BD5A;
}

/* =============================================================================
   FORMULARIOS
   ============================================================================= */

.form-section {
  margin-bottom: 1.5rem;
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.form-section-title svg {
  color: #6366F1;
}

.form-section-hint {
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.required {
  color: #EF4444;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: #1F2937;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input.disabled {
  background: #F3F4F6;
  color: #6B7280;
  cursor: not-allowed;
}

.form-textarea {
  resize: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
  margin-top: 1.5rem;
}

/* Toggle field */
.toggle-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #F9FAFB;
  border-radius: 0.5rem;
  border: 1px solid #E5E7EB;
}

.toggle-input {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #6366F1;
}

.toggle-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

.toggle-status {
  margin-left: auto;
  font-size: 0.75rem;
  color: #6B7280;
}

/* =============================================================================
   EDIT FORM
   ============================================================================= */

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.edit-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 0.5rem;
}

.edit-alert svg {
  color: #3B82F6;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.edit-alert-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1E40AF;
}

.edit-alert-text {
  font-size: 0.75rem;
  color: #1D4ED8;
  margin-top: 0.125rem;
}

/* =============================================================================
   DETAIL VIEW
   ============================================================================= */

.detail-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 9999px;
}

.badge-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
}

.badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.badge-success .badge-dot {
  background: #10B981;
}

.badge-gray {
  background: rgba(107, 114, 128, 0.1);
  color: #4B5563;
}

.badge-gray .badge-dot {
  background: #9CA3AF;
}

.badge-purple {
  background: rgba(139, 92, 246, 0.1);
  color: #7C3AED;
}

.detail-actions {
  display: flex;
  gap: 0.5rem;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #374151;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.detail-section-title svg {
  color: #6366F1;
}

/* Info grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.info-grid.cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.875rem 1rem;
  background: #F9FAFB;
  border-radius: 0.5rem;
  border: 1px solid #F3F4F6;
}

.info-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1F2937;
}

.info-value.capitalize {
  text-transform: capitalize;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid;
  text-align: center;
}

.stat-blue {
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border-color: #BFDBFE;
}

.stat-blue .stat-value { color: #1D4ED8; }
.stat-blue .stat-label { color: #3B82F6; }

.stat-green {
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
  border-color: #A7F3D0;
}

.stat-green .stat-value { color: #059669; }
.stat-green .stat-label { color: #10B981; }

.stat-purple {
  background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);
  border-color: #DDD6FE;
}

.stat-purple .stat-value { color: #7C3AED; }
.stat-purple .stat-label { color: #8B5CF6; }

.stat-orange {
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
  border-color: #FED7AA;
}

.stat-orange .stat-value { color: #C2410C; }
.stat-orange .stat-label { color: #F97316; }

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* Bono card */
.bono-card {
  padding: 1.5rem;
  background: linear-gradient(135deg, #F9FAFB 0%, white 100%);
  border-radius: 0.75rem;
  border: 1px solid #E5E7EB;
}

.bono-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.bono-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.25rem;
}

.bono-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
}

.bono-subtext {
  font-size: 0.8125rem;
  color: #6B7280;
  margin-top: 0.125rem;
}

.bono-percent {
  text-align: right;
}

.percent-value {
  font-size: 2rem;
  font-weight: 700;
  color: #6366F1;
}

.percent-label {
  display: block;
  font-size: 0.6875rem;
  color: #6B7280;
  text-transform: uppercase;
}

.bono-progress {
  height: 0.75rem;
  background: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.bono-progress-bar {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.5s ease;
}

.bg-green { background: #10B981; }
.bg-amber { background: #F59E0B; }
.bg-orange { background: #F97316; }
.bg-red { background: #EF4444; }

.bono-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #FFF7ED;
  border: 1px solid #FFEDD5;
  border-radius: 0.5rem;
}

.bono-alert svg {
  color: #EA580C;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.bono-alert-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9A3412;
}

.bono-alert-text {
  font-size: 0.75rem;
  color: #C2410C;
  margin-top: 0.125rem;
}

/* =============================================================================
   BONO MIGRATION (NEW PATIENT MODAL)
   ============================================================================= */

.bono-migration {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 0.75rem;
  padding: 1rem;
}

.bono-migration-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.bono-migration-header svg {
  color: #D97706;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.bono-migration-header .toggle-checkbox {
  margin-left: auto;
  width: 1.125rem;
  height: 1.125rem;
  accent-color: #6366F1;
}

.bono-migration .form-section-title {
  border: none;
  padding: 0;
  margin: 0;
}

.bono-migration-form {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #FDE68A;
}

.bono-summary {
  margin-top: 1rem;
  padding: 0.875rem;
  background: white;
  border: 1px solid #FDE68A;
  border-radius: 0.5rem;
}

.bono-summary-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 0.625rem;
}

.bono-summary-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bono-summary-progress {
  flex: 1;
}

.bono-summary-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.6875rem;
  color: #6B7280;
  margin-bottom: 0.375rem;
}

.bono-summary-bar {
  height: 0.5rem;
  background: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
}

.bono-summary-fill {
  height: 100%;
  background: #6366F1;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.bono-summary-count {
  text-align: right;
}

.count-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #6366F1;
}

.count-total {
  display: block;
  font-size: 0.6875rem;
  color: #6B7280;
}

/* =============================================================================
   ANIMACIONES
   ============================================================================= */

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* =============================================================================
   RESPONSIVE
   ============================================================================= */

@media (max-width: 768px) {
  .pacientes-page {
    padding: 1rem;
  }

  .modal-container {
    max-height: 100vh;
    border-radius: 0;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
