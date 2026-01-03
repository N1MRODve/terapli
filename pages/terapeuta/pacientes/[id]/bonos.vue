<template>
  <div class="pb-20">
    <!-- Breadcrumb de navegación -->
    <nav class="mb-6" aria-label="Breadcrumb">
      <ol class="flex items-center gap-2 text-sm">
        <li>
          <NuxtLink
            to="/terapeuta/pacientes"
            class="text-gray-500 hover:text-purple-600 transition-colors flex items-center gap-1"
          >
            <UserGroupIcon class="w-4 h-4" />
            Pacientes
          </NuxtLink>
        </li>
        <li class="text-gray-400">
          <ChevronRightIcon class="w-4 h-4" />
        </li>
        <li>
          <button
            @click="volverAFicha"
            class="text-gray-500 hover:text-purple-600 transition-colors"
          >
            {{ pacienteNombre || 'Cargando...' }}
          </button>
        </li>
        <li class="text-gray-400">
          <ChevronRightIcon class="w-4 h-4" />
        </li>
        <li class="font-medium text-gray-900" aria-current="page">
          Bonos
        </li>
      </ol>
    </nav>

    <!-- Estado de carga -->
    <div v-if="cargando" class="flex flex-col items-center justify-center py-20">
      <div class="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-sm text-gray-500">Cargando bonos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16">
      <div class="bg-white rounded-xl p-8 shadow-sm max-w-md mx-auto">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExclamationTriangleIcon class="w-8 h-8 text-red-600" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Error al cargar bonos
        </h3>
        <p class="text-sm text-gray-500 mb-6">{{ error }}</p>
        <button
          @click="cargarBonos"
          class="px-6 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-else>
      <!-- Header -->
      <header class="mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <TicketIcon class="w-7 h-7 text-purple-600" />
              Bonos de {{ pacienteNombre }}
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Gestiona los bonos, pagos y renovaciones del paciente
            </p>
          </div>

          <button
            v-if="puedeGestionarBonos"
            @click="abrirModalNuevoBono"
            class="px-4 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <PlusIcon class="w-4 h-4" />
            <span>Nuevo Bono</span>
          </button>
        </div>
      </header>

      <!-- Métricas principales -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <!-- Total de bonos -->
        <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TicketIcon class="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase">Total</p>
              <p class="text-2xl font-bold text-gray-900">{{ metricas.total }}</p>
            </div>
          </div>
        </div>

        <!-- Bonos activos -->
        <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase">Activos</p>
              <p class="text-2xl font-bold text-gray-900">{{ metricas.activos }}</p>
            </div>
          </div>
        </div>

        <!-- Próximos a vencer -->
        <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <ClockIcon class="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase">Por Vencer</p>
              <p class="text-2xl font-bold text-gray-900">{{ metricas.proximosAVencer }}</p>
            </div>
          </div>
        </div>

        <!-- Pendientes de pago -->
        <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BanknotesIcon class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase">Pendientes</p>
              <p class="text-2xl font-bold text-gray-900">{{ metricas.pendientes }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Filtros -->
      <section class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Filtro por estado -->
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Estado</label>
            <select
              v-model="filtroEstado"
              class="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="pendiente">Pendientes</option>
              <option value="completado">Completados</option>
              <option value="agotado">Agotados</option>
              <option value="vencido">Vencidos</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>

          <!-- Filtro por tipo -->
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Tipo</label>
            <select
              v-model="filtroTipo"
              class="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white"
            >
              <option value="todos">Todos los tipos</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
              <option value="otro">A demanda</option>
            </select>
          </div>

          <!-- Ordenar -->
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Ordenar por</label>
            <select
              v-model="ordenamiento"
              class="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white"
            >
              <option value="reciente">Más recientes</option>
              <option value="antiguo">Más antiguos</option>
              <option value="vencimiento">Por vencimiento</option>
            </select>
          </div>

          <!-- Limpiar filtros -->
          <div class="flex items-end">
            <button
              v-if="filtroEstado !== 'todos' || filtroTipo !== 'todos'"
              @click="limpiarFiltros"
              class="h-10 px-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </section>

      <!-- Alertas importantes -->
      <section v-if="alertasVisibles" class="space-y-3 mb-6">
        <!-- Bonos próximos a vencer -->
        <div v-if="metricas.proximosAVencer > 0" class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ExclamationTriangleIcon class="w-4 h-4 text-amber-600" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-amber-900">
                {{ metricas.proximosAVencer }} bono(s) próximo(s) a vencer
              </h4>
              <p class="text-xs text-amber-700 mt-0.5">
                Hay bonos que vencerán en los próximos 7 días. Considera renovarlos.
              </p>
            </div>
            <button
              @click="filtroEstado = 'activo'"
              class="text-xs text-amber-700 hover:text-amber-900 font-medium whitespace-nowrap"
            >
              Ver activos
            </button>
          </div>
        </div>

        <!-- Bonos con pocas sesiones -->
        <div v-if="metricas.pocasSesiones > 0" class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <InformationCircleIcon class="w-4 h-4 text-blue-600" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-blue-900">
                {{ metricas.pocasSesiones }} bono(s) con pocas sesiones
              </h4>
              <p class="text-xs text-blue-700 mt-0.5">
                Algunos bonos tienen 2 o menos sesiones restantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Lista de bonos -->
      <section v-if="bonosFiltrados.length > 0" class="space-y-4">
        <div
          v-for="bono in bonosFiltrados"
          :key="bono.id"
          class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <!-- Header del bono -->
          <div class="p-4 border-b border-gray-100">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :class="getBonoIconBg(bono.estado)"
                >
                  <TicketIcon class="w-5 h-5" :class="getBonoIconColor(bono.estado)" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-gray-900">{{ getTipoTexto(bono.tipo) }}</h3>
                    <span
                      v-if="(bono.numero_renovacion || 1) > 1"
                      class="px-2 py-0.5 text-xs font-medium rounded-full bg-violet-100 text-violet-700 border border-violet-200"
                    >
                      {{ bono.numero_renovacion }}ª renovación
                    </span>
                    <span
                      class="px-2 py-0.5 text-xs font-medium rounded-full"
                      :class="getEstadoClasses(bono.estado)"
                    >
                      {{ getEstadoTexto(bono.estado) }}
                    </span>
                    <span
                      v-if="bono.es_historico"
                      class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
                    >
                      Histórico
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 mt-0.5">
                    Creado el {{ formatFecha(bono.created_at) }}
                  </p>
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex items-center gap-2">
                <button
                  v-if="bono.estado === 'activo' || bono.estado === 'pendiente'"
                  @click="abrirModalPagos(bono)"
                  class="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Ver pagos"
                >
                  <BanknotesIcon class="w-5 h-5" />
                </button>
                <button
                  v-if="bono.estado === 'activo' && bono.sesiones_restantes <= 2"
                  @click="abrirModalRenovacion(bono)"
                  class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Renovar bono"
                >
                  <ArrowPathIcon class="w-5 h-5" />
                </button>
                <button
                  @click="editarBono(bono)"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Editar bono"
                >
                  <PencilIcon class="w-5 h-5" />
                </button>
                <button
                  @click="confirmarEliminarBono(bono)"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar bono"
                >
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Contenido del bono -->
          <div class="p-4">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <!-- Sesiones -->
              <div>
                <p class="text-xs text-gray-500 mb-1">Sesiones</p>
                <div class="flex items-baseline gap-1">
                  <span class="text-lg font-bold text-gray-900">{{ bono.sesiones_restantes }}</span>
                  <span class="text-sm text-gray-400">/ {{ bono.sesiones_totales }}</span>
                </div>
                <!-- Barra de progreso -->
                <div class="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getProgressBarColor(bono)"
                    :style="{ width: getProgressPercent(bono) + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Monto -->
              <div>
                <p class="text-xs text-gray-500 mb-1">Monto</p>
                <p class="text-lg font-bold text-gray-900">{{ bono.monto_total || 0 }}</p>
              </div>

              <!-- Estado de pago -->
              <div>
                <p class="text-xs text-gray-500 mb-1">Pago</p>
                <span
                  class="inline-flex items-center gap-1 text-sm font-medium"
                  :class="bono.pagado ? 'text-green-600' : 'text-amber-600'"
                >
                  <CheckCircleIcon v-if="bono.pagado" class="w-4 h-4" />
                  <ClockIcon v-else class="w-4 h-4" />
                  {{ bono.pagado ? 'Pagado' : 'Pendiente' }}
                </span>
              </div>

              <!-- Fecha fin -->
              <div>
                <p class="text-xs text-gray-500 mb-1">Vence</p>
                <p class="text-sm font-medium" :class="getFechaFinClasses(bono.fecha_fin)">
                  {{ bono.fecha_fin ? formatFecha(bono.fecha_fin) : 'Sin fecha' }}
                </p>
              </div>
            </div>

            <!-- Notas -->
            <div v-if="bono.notas" class="mt-4 pt-4 border-t border-gray-100">
              <p class="text-xs text-gray-500 mb-1">Notas</p>
              <p class="text-sm text-gray-700">{{ bono.notas }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Estado vacío -->
      <section v-else class="text-center py-16">
        <div class="bg-white rounded-xl p-8 shadow-sm max-w-md mx-auto">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TicketIcon class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ bonos.length === 0 ? 'No hay bonos registrados' : 'No hay bonos con estos filtros' }}
          </h3>
          <p class="text-sm text-gray-500 mb-6">
            {{ bonos.length === 0
              ? 'Crea el primer bono para este paciente'
              : 'Intenta cambiar los filtros para ver más bonos'
            }}
          </p>
          <button
            v-if="bonos.length === 0 && puedeGestionarBonos"
            @click="abrirModalNuevoBono"
            class="px-6 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Crear Primer Bono
          </button>
          <button
            v-else-if="bonos.length > 0"
            @click="limpiarFiltros"
            class="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </section>
    </div>

    <!-- Modales -->
    <ModalNuevoBono
      :mostrar="modalNuevoBonoAbierto"
      :paciente-id="pacienteId"
      :paciente-nombre="pacienteNombre"
      :psicologa-id="psicologaId"
      :bono-existente="bonoParaEditar"
      @close="cerrarModalNuevoBono"
      @created="onBonoCreado"
      @updated="onBonoActualizado"
    />

    <ModalPagosBono
      :mostrar="modalPagosAbierto"
      :bono="bonoSeleccionado"
      @close="cerrarModalPagos"
      @updated="onPagosActualizados"
    />

    <ModalRenovacionBono
      :mostrar="modalRenovacionAbierto"
      :bono="bonoSeleccionado"
      @close="cerrarModalRenovacion"
      @renovated="onBonoRenovado"
    />

    <!-- Modal de confirmación para eliminar bono -->
    <Teleport to="body">
      <div
        v-if="modalConfirmarEliminar"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="cancelarEliminar"
        ></div>

        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
          <div class="text-center">
            <!-- Icono de advertencia -->
            <div class="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <TrashIcon class="w-7 h-7 text-red-600" />
            </div>

            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Eliminar bono
            </h3>

            <p class="text-sm text-gray-500 mb-2">
              Estas a punto de eliminar el bono <strong>{{ getTipoTexto(bonoAEliminar?.tipo) }}</strong>.
            </p>

            <div v-if="bonoAEliminar" class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-left">
              <p class="text-sm text-amber-800">
                <strong>Atencion:</strong> Las citas asociadas a este bono seran desvinculadas
                y quedaran con estado de pago "pendiente". Esta accion no se puede deshacer.
              </p>
            </div>

            <!-- Info del bono -->
            <div v-if="bonoAEliminar" class="bg-gray-50 rounded-lg p-3 mb-6 text-left">
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-gray-500">Sesiones:</span>
                  <span class="font-medium ml-1">{{ bonoAEliminar.sesiones_restantes }}/{{ bonoAEliminar.sesiones_totales }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Estado:</span>
                  <span class="font-medium ml-1">{{ getEstadoTexto(bonoAEliminar.estado) }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Monto:</span>
                  <span class="font-medium ml-1">{{ bonoAEliminar.monto_total || 0 }} EUR</span>
                </div>
                <div>
                  <span class="text-gray-500">Pago:</span>
                  <span class="font-medium ml-1" :class="bonoAEliminar.pagado ? 'text-green-600' : 'text-amber-600'">
                    {{ bonoAEliminar.pagado ? 'Pagado' : 'Pendiente' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Botones -->
            <div class="flex gap-3">
              <button
                @click="cancelarEliminar"
                :disabled="eliminandoBono"
                class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                @click="eliminarBono"
                :disabled="eliminandoBono"
                class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ArrowPathIcon v-if="eliminandoBono" class="w-4 h-4 animate-spin" />
                {{ eliminandoBono ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  TicketIcon,
  PlusIcon,
  ChevronRightIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'terapeuta'
})

const supabase = useSupabaseClient()
const { userProfile } = useSupabase()
const route = useRoute()

const {
  getBonosPorPaciente,
  calcularMetricas,
  puedeGestionarBonos
} = useBonos()

// IDs
const pacienteId = computed(() => route.params.id as string || '')
const psicologaId = computed(() => userProfile.value?.id || '')

// Estado
const cargando = ref(true)
const error = ref<string | null>(null)
const bonos = ref<any[]>([])
const pacienteNombre = ref('')
const metricas = ref({
  total: 0,
  activos: 0,
  completados: 0,
  vencidos: 0,
  pendientes: 0,
  proximosAVencer: 0,
  pocasSesiones: 0
})

// Filtros
const filtroEstado = ref('todos')
const filtroTipo = ref('todos')
const ordenamiento = ref('reciente')

// Modales
const modalNuevoBonoAbierto = ref(false)
const modalPagosAbierto = ref(false)
const modalRenovacionAbierto = ref(false)
const bonoSeleccionado = ref<any>(null)
const bonoParaEditar = ref<any>(null)

// Modal de confirmación para eliminar
const modalConfirmarEliminar = ref(false)
const bonoAEliminar = ref<any>(null)
const eliminandoBono = ref(false)
const toast = useToast()

// Computed
const bonosFiltrados = computed(() => {
  let resultado = [...bonos.value]

  // Filtro por estado
  if (filtroEstado.value !== 'todos') {
    resultado = resultado.filter(b => b.estado === filtroEstado.value)
  }

  // Filtro por tipo
  if (filtroTipo.value !== 'todos') {
    resultado = resultado.filter(b => b.tipo === filtroTipo.value)
  }

  // Ordenamiento
  if (ordenamiento.value === 'reciente') {
    resultado.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (ordenamiento.value === 'antiguo') {
    resultado.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  } else if (ordenamiento.value === 'vencimiento') {
    resultado.sort((a, b) => {
      if (!a.fecha_fin) return 1
      if (!b.fecha_fin) return -1
      return new Date(a.fecha_fin).getTime() - new Date(b.fecha_fin).getTime()
    })
  }

  return resultado
})

const alertasVisibles = computed(() => {
  return metricas.value.proximosAVencer > 0 || metricas.value.pocasSesiones > 0
})

// Helpers de formato
const formatFecha = (fecha: string) => {
  if (!fecha) return ''
  try {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return fecha
  }
}

const getTipoTexto = (tipo: string) => {
  const tipos: Record<string, string> = {
    'semanal': 'Bono Semanal',
    'quincenal': 'Bono Quincenal',
    'mensual': 'Bono Mensual',
    'otro': 'Bono A Demanda'
  }
  return tipos[tipo] || tipo
}

const getEstadoTexto = (estado: string) => {
  const estados: Record<string, string> = {
    'activo': 'Activo',
    'pendiente': 'Pendiente',
    'completado': 'Completado',
    'agotado': 'Agotado',
    'vencido': 'Vencido',
    'cancelado': 'Cancelado'
  }
  return estados[estado] || estado
}

const getEstadoClasses = (estado: string) => {
  const clases: Record<string, string> = {
    'activo': 'bg-green-100 text-green-700',
    'pendiente': 'bg-amber-100 text-amber-700',
    'completado': 'bg-blue-100 text-blue-700',
    'agotado': 'bg-purple-100 text-purple-700',
    'vencido': 'bg-red-100 text-red-700',
    'cancelado': 'bg-gray-100 text-gray-600'
  }
  return clases[estado] || 'bg-gray-100 text-gray-600'
}

const getBonoIconBg = (estado: string) => {
  const clases: Record<string, string> = {
    'activo': 'bg-green-100',
    'pendiente': 'bg-amber-100',
    'completado': 'bg-blue-100',
    'agotado': 'bg-purple-100',
    'vencido': 'bg-red-100',
    'cancelado': 'bg-gray-100'
  }
  return clases[estado] || 'bg-gray-100'
}

const getBonoIconColor = (estado: string) => {
  const clases: Record<string, string> = {
    'activo': 'text-green-600',
    'pendiente': 'text-amber-600',
    'completado': 'text-blue-600',
    'agotado': 'text-purple-600',
    'vencido': 'text-red-600',
    'cancelado': 'text-gray-500'
  }
  return clases[estado] || 'text-gray-500'
}

const getProgressPercent = (bono: any) => {
  if (!bono.sesiones_totales) return 0
  const usadas = bono.sesiones_totales - bono.sesiones_restantes
  return Math.round((usadas / bono.sesiones_totales) * 100)
}

const getProgressBarColor = (bono: any) => {
  if (bono.sesiones_restantes <= 1) return 'bg-red-500'
  if (bono.sesiones_restantes <= 2) return 'bg-amber-500'
  return 'bg-purple-500'
}

const getFechaFinClasses = (fechaFin: string | null) => {
  if (!fechaFin) return 'text-gray-500'
  const fecha = new Date(fechaFin)
  const ahora = new Date()
  const diasRestantes = Math.floor((fecha.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))

  if (diasRestantes < 0) return 'text-red-600'
  if (diasRestantes <= 7) return 'text-amber-600'
  return 'text-gray-700'
}

// Métodos
const cargarBonos = async () => {
  try {
    cargando.value = true
    error.value = null

    // Cargar información del paciente
    const { data: paciente, error: errorPaciente } = await supabase
      .from('pacientes')
      .select('nombre_completo, email')
      .eq('id', pacienteId.value)
      .single()

    if (errorPaciente) throw errorPaciente

    pacienteNombre.value = (paciente as any)?.nombre_completo || (paciente as any)?.email || 'Paciente'

    // Cargar bonos
    bonos.value = await getBonosPorPaciente(pacienteId.value)

    // Calcular métricas
    metricas.value = await calcularMetricas(pacienteId.value)

  } catch (err: any) {
    console.error('[BonosPage] Error al cargar bonos:', err)
    error.value = err.message || 'Error al cargar los bonos'
  } finally {
    cargando.value = false
  }
}

const limpiarFiltros = () => {
  filtroEstado.value = 'todos'
  filtroTipo.value = 'todos'
  ordenamiento.value = 'reciente'
}

const volverAFicha = () => {
  if (pacienteId.value) {
    navigateTo(`/terapeuta/pacientes/${pacienteId.value}`)
  }
}

// Modales
const abrirModalNuevoBono = () => {
  bonoParaEditar.value = null
  modalNuevoBonoAbierto.value = true
}

const cerrarModalNuevoBono = () => {
  modalNuevoBonoAbierto.value = false
  bonoParaEditar.value = null
}

const onBonoCreado = async () => {
  await cargarBonos()
}

const onBonoActualizado = async () => {
  await cargarBonos()
}

const abrirModalPagos = (bono: any) => {
  bonoSeleccionado.value = bono
  modalPagosAbierto.value = true
}

const cerrarModalPagos = () => {
  modalPagosAbierto.value = false
  bonoSeleccionado.value = null
}

const onPagosActualizados = async () => {
  await cargarBonos()
}

const abrirModalRenovacion = (bono: any) => {
  bonoSeleccionado.value = bono
  modalRenovacionAbierto.value = true
}

const cerrarModalRenovacion = () => {
  modalRenovacionAbierto.value = false
  bonoSeleccionado.value = null
}

const onBonoRenovado = async () => {
  await cargarBonos()
}

const editarBono = (bono: any) => {
  bonoParaEditar.value = bono
  modalNuevoBonoAbierto.value = true
}

// ============================================
// ELIMINAR BONO
// ============================================

const confirmarEliminarBono = (bono: any) => {
  bonoAEliminar.value = bono
  modalConfirmarEliminar.value = true
}

const cancelarEliminar = () => {
  modalConfirmarEliminar.value = false
  bonoAEliminar.value = null
}

const eliminarBono = async () => {
  if (!bonoAEliminar.value) return

  try {
    eliminandoBono.value = true
    const bonoId = bonoAEliminar.value.id

    // Paso 1: Desvincular citas que usan este bono (no las elimina, solo quita la referencia)
    const { error: errorCitas } = await supabase
      .from('citas')
      .update({
        bono_id: null,
        sesion_descontada: false,
        descontar_de_bono: false,
        estado_pago: 'pendiente',
        metodo_pago: null
      })
      .eq('bono_id', bonoId)

    if (errorCitas) {
      console.error('Error al desvincular citas:', errorCitas)
      // Continuar con la eliminación aunque falle esto
    }

    // Paso 2: Eliminar el bono
    const { error: errorBono } = await supabase
      .from('bonos')
      .delete()
      .eq('id', bonoId)

    if (errorBono) {
      throw errorBono
    }

    // Paso 3: Recargar bonos
    await cargarBonos()

    toast.success('Bono eliminado correctamente')
    modalConfirmarEliminar.value = false
    bonoAEliminar.value = null
  } catch (error: any) {
    console.error('Error al eliminar bono:', error)
    toast.error(`Error al eliminar: ${error.message}`)
  } finally {
    eliminandoBono.value = false
  }
}

// Lifecycle
onMounted(() => {
  cargarBonos()
})
</script>
