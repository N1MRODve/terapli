<template>
  <div class="bonos-container pb-20">
    <!-- Navegación de regreso -->
    <button
      @click="volverAFicha"
      class="mb-6 flex items-center gap-2 text-[#5D4A44] hover:text-[#D8AFA0] transition-colors"
    >
      <span>←</span>
      <span>Volver a ficha del paciente</span>
    </button>

    <!-- Header -->
    <header class="mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-['Lora'] font-bold text-[#5D4A44] mb-2 flex items-center gap-3">
            <span class="text-4xl">🎫</span>
            Bonos de {{ pacienteNombre }}
          </h1>
          <p class="text-[#5D4A44]/60">
            Gestiona los bonos, pagos y renovaciones del paciente
          </p>
        </div>

        <button
          v-if="puedeGestionarBonos"
          @click="abrirModalNuevoBono"
          class="px-6 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors font-medium flex items-center gap-2 shadow-lg"
        >
          <span class="text-xl">+</span>
          <span>Nuevo Bono</span>
        </button>
      </div>
    </header>

    <!-- Estado de carga -->
    <div v-if="cargando" class="text-center py-16">
      <div class="animate-spin w-16 h-16 border-4 border-[#D8AFA0] border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-[#5D4A44]/60">Cargando bonos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16">
      <DashboardCard>
        <span class="text-7xl mb-4 block">❌</span>
        <h3 class="text-xl font-['Lora'] font-semibold text-[#5D4A44] mb-2">
          Error al cargar bonos
        </h3>
        <p class="text-[#5D4A44]/60 mb-4">{{ error }}</p>
        <button
          @click="cargarBonos"
          class="px-6 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors"
        >
          Intentar de nuevo
        </button>
      </DashboardCard>
    </div>

    <!-- Contenido principal -->
    <div v-else>
      <!-- Métricas principales -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Total de bonos -->
        <DashboardCard class="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-purple-600 font-medium mb-1">Total Bonos</p>
              <p class="text-3xl font-bold text-purple-700">{{ metricas.total }}</p>
            </div>
            <span class="text-4xl">🎫</span>
          </div>
        </DashboardCard>

        <!-- Bonos activos -->
        <DashboardCard class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-green-600 font-medium mb-1">Activos</p>
              <p class="text-3xl font-bold text-green-700">{{ metricas.activos }}</p>
            </div>
            <span class="text-4xl">✅</span>
          </div>
        </DashboardCard>

        <!-- Próximos a vencer -->
        <DashboardCard class="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-orange-600 font-medium mb-1">Por Vencer</p>
              <p class="text-3xl font-bold text-orange-700">{{ metricas.proximosAVencer }}</p>
            </div>
            <span class="text-4xl">⚠️</span>
          </div>
        </DashboardCard>

        <!-- Pendientes de pago -->
        <DashboardCard class="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-yellow-600 font-medium mb-1">Pendientes</p>
              <p class="text-3xl font-bold text-yellow-700">{{ metricas.pendientes }}</p>
            </div>
            <span class="text-4xl">⏳</span>
          </div>
        </DashboardCard>
      </section>

      <!-- Filtros y búsqueda -->
      <section class="mb-6">
        <DashboardCard>
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Filtro por estado -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-[#5D4A44] mb-2">
                Filtrar por Estado
              </label>
              <select
                v-model="filtroEstado"
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">✅ Activos</option>
                <option value="pendiente">⏳ Pendientes</option>
                <option value="completado">✔️ Completados</option>
                <option value="vencido">❌ Vencidos</option>
                <option value="cancelado">🚫 Cancelados</option>
              </select>
            </div>

            <!-- Filtro por tipo -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-[#5D4A44] mb-2">
                Filtrar por Tipo
              </label>
              <select
                v-model="filtroTipo"
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white"
              >
                <option value="todos">Todos los tipos</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
                <option value="semestral">Semestral</option>
              </select>
            </div>

            <!-- Ordenar -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-[#5D4A44] mb-2">
                Ordenar por
              </label>
              <select
                v-model="ordenamiento"
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white"
              >
                <option value="reciente">Más recientes</option>
                <option value="antiguo">Más antiguos</option>
                <option value="vencimiento">Por vencimiento</option>
              </select>
            </div>
          </div>
        </DashboardCard>
      </section>

      <!-- Lista de bonos -->
      <section v-if="bonosFiltrados.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BonoCard
          v-for="bono in bonosFiltrados"
          :key="bono.id"
          :bono="bono"
          @renovar="abrirModalRenovacion"
          @ver-pagos="abrirModalPagos"
          @editar="editarBono"
        />
      </section>

      <!-- Estado vacío -->
      <section v-else class="text-center py-16">
        <DashboardCard>
          <span class="text-7xl mb-4 block opacity-40">🎫</span>
          <h3 class="text-xl font-['Lora'] font-semibold text-[#5D4A44] mb-2">
            {{ bonos.length === 0 ? 'No hay bonos registrados' : 'No hay bonos con estos filtros' }}
          </h3>
          <p class="text-[#5D4A44]/60 mb-6">
            {{ bonos.length === 0 
              ? 'Crea el primer bono para este paciente' 
              : 'Intenta cambiar los filtros para ver más bonos' 
            }}
          </p>
          <button
            v-if="bonos.length === 0 && puedeGestionarBonos"
            @click="abrirModalNuevoBono"
            class="px-8 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors font-medium"
          >
            + Crear Primer Bono
          </button>
          <button
            v-else
            @click="limpiarFiltros"
            class="px-8 py-3 bg-[#5D4A44] text-white rounded-lg hover:bg-[#4A3A34] transition-colors font-medium"
          >
            Limpiar Filtros
          </button>
        </DashboardCard>
      </section>

      <!-- Alertas importantes -->
      <section v-if="alertasVisibles" class="mt-8 space-y-3">
        <!-- Bonos próximos a vencer -->
        <div v-if="metricas.proximosAVencer > 0" class="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
          <div class="flex items-start gap-3">
            <span class="text-2xl">⚠️</span>
            <div class="flex-1">
              <h4 class="font-medium text-orange-900 mb-1">
                {{ metricas.proximosAVencer }} bono(s) próximo(s) a vencer
              </h4>
              <p class="text-sm text-orange-700">
                Hay bonos que vencerán en los próximos 7 días. Considera renovarlos.
              </p>
            </div>
            <button
              @click="filtroEstado = 'activo'"
              class="text-sm text-orange-700 hover:text-orange-900 underline"
            >
              Ver bonos activos
            </button>
          </div>
        </div>

        <!-- Bonos con pocas sesiones -->
        <div v-if="metricas.pocasSesiones > 0" class="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <div class="flex items-start gap-3">
            <span class="text-2xl">📊</span>
            <div class="flex-1">
              <h4 class="font-medium text-blue-900 mb-1">
                {{ metricas.pocasSesiones }} bono(s) con pocas sesiones
              </h4>
              <p class="text-sm text-blue-700">
                Algunos bonos tienen 2 o menos sesiones restantes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modales -->
    <ModalNuevoBono
      :mostrar="modalNuevoBonoAbierto"
      :paciente-id="pacienteId"
      :paciente-nombre="pacienteNombre"
      :psicologa-id="psicologaId"
      @close="cerrarModalNuevoBono"
      @created="onBonoCreado"
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'terapeuta'
})

const supabase = useSupabaseClient()
const { userProfile } = useSupabase()

// Variables de navegación - protegidas para SSR
const route = computed(() => process.client ? useRoute() : null)
const router = computed(() => process.client ? useRouter() : null)

const { 
  getBonosPorPaciente, 
  calcularMetricas, 
  puedeGestionarBonos 
} = useBonos()

// IDs - protegidos para SSR
const pacienteId = computed(() => {
  if (process.client && route.value) {
    return route.value.params.id as string
  }
  return ''
})
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

// Métodos
const cargarBonos = async () => {
  try {
    cargando.value = true
    error.value = null

    // Cargar información del paciente
    const { data: paciente, error: errorPaciente } = await supabase
      .from('pacientes')
      .select('nombre, email')
      .eq('id', pacienteId.value)
      .single()

    if (errorPaciente) throw errorPaciente

    pacienteNombre.value = (paciente as any)?.nombre || (paciente as any)?.email || 'Paciente'

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
    console.log('[Bonos/[id]] Navegando a ficha del paciente:', pacienteId.value)
    navigateTo(`/terapeuta/pacientes/${pacienteId.value}`)
  } else {
    console.error('[Bonos/[id]] ERROR: No se encontró ID del paciente')
  }
}

// Modales
const abrirModalNuevoBono = () => {
  modalNuevoBonoAbierto.value = true
}

const cerrarModalNuevoBono = () => {
  modalNuevoBonoAbierto.value = false
}

const onBonoCreado = async () => {
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
  // TODO: Implementar edición de bono
  console.log('Editar bono:', bono)
  alert('Función de edición en desarrollo')
}

// Lifecycle
onMounted(() => {
  cargarBonos()
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
