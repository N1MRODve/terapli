<script setup lang="ts">
/**
 * ModalFichaPaciente.vue
 * Modal completo de ficha de paciente con balance financiero
 * Puede usarse desde cualquier parte de la plataforma
 */
import {
  XMarkIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'

const supabase = useSupabaseClient()

interface Props {
  isOpen: boolean
  pacienteId: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  'ver-ficha': [pacienteId: string]
  'editar': [pacienteId: string]
  'gestionar-bonos': [pacienteId: string]
  'nueva-cita': [pacienteId: string]
}>()

// Estado
const cargando = ref(true)
const paciente = ref<any>(null)
const todosLosBonos = ref<any[]>([])
const citas = ref<any[]>([])

// Cargar datos del paciente
const cargarDatos = async () => {
  if (!props.pacienteId) return

  try {
    cargando.value = true

    // Cargar paciente
    const { data: pacienteData, error: pacienteError } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', props.pacienteId)
      .single()

    if (pacienteError) throw pacienteError
    paciente.value = pacienteData

    // Cargar bonos
    const { data: bonosData } = await supabase
      .from('bonos')
      .select('*')
      .eq('paciente_id', props.pacienteId)
      .order('created_at', { ascending: false })

    todosLosBonos.value = bonosData || []

    // Cargar citas
    const { data: citasData } = await supabase
      .from('citas')
      .select('*')
      .eq('paciente_id', props.pacienteId)
      .order('fecha', { ascending: false })
      .limit(50)

    citas.value = citasData || []

  } catch (err: any) {
    console.error('[ModalFichaPaciente] Error:', err)
  } finally {
    cargando.value = false
  }
}

// Watch para cargar datos cuando se abre
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.pacienteId) {
    cargarDatos()
  }
}, { immediate: true })

// Computed: Iniciales
const iniciales = computed(() => {
  if (!paciente.value?.nombre_completo) return '??'
  const partes = paciente.value.nombre_completo.trim().split(' ')
  return `${partes[0]?.charAt(0) || '?'}${partes[1]?.charAt(0) || ''}`.toUpperCase()
})

// Computed: Color del avatar
const avatarColor = computed(() => {
  if (!paciente.value) return '#9CA3AF'
  if (!paciente.value.activo) return '#9CA3AF'
  if (paciente.value.en_pausa) return '#F59E0B'
  const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#6366F1', '#F97316']
  const index = (paciente.value.id?.charCodeAt(0) || 0) % colors.length
  return colors[index]
})

// Computed: Estado del paciente
const estadoPaciente = computed(() => {
  if (!paciente.value?.activo) return { texto: 'Finalizado', clase: 'bg-gray-100 text-gray-700' }
  if (paciente.value.en_pausa) return { texto: 'Pausa', clase: 'bg-amber-100 text-amber-700' }
  return { texto: 'Activo', clase: 'bg-green-100 text-green-700' }
})

// Computed: Balance financiero
const balanceFinanciero = computed(() => {
  // Bonos sin pagar
  const bonosSinPagar = todosLosBonos.value.filter(b => !b.pagado)
  const montoBonosPendientes = bonosSinPagar.reduce((acc, b) => acc + (b.monto_total || 0), 0)

  // Sesiones sin cobrar (realizadas pero no pagadas, sin bono)
  const sesionesSinCobrar = citas.value.filter(c =>
    c.estado === 'realizada' &&
    !c.pagado &&
    c.estado_pago !== 'bonificado' &&
    !c.bono_id
  )
  const montoSesionesPendientes = sesionesSinCobrar.reduce((acc, c) => acc + (c.precio_sesion || 0), 0)

  // Deuda historica
  const deudaHistorica = paciente.value?.metadata?.deuda_historica?.monto_total || 0

  return {
    bonosPendientes: bonosSinPagar.length,
    montoBonosPendientes,
    sesionesSinCobrar: sesionesSinCobrar.length,
    montoSesionesPendientes,
    deudaHistorica,
    totalPendiente: montoBonosPendientes + montoSesionesPendientes + deudaHistorica
  }
})

// Computed: Bono activo
const bonoActivo = computed(() => {
  return todosLosBonos.value.find(b =>
    (b.estado === 'activo' || b.estado === 'pendiente') &&
    b.sesiones_restantes > 0
  )
})

// Computed: Próxima cita
const proximaCita = computed(() => {
  const hoy = new Date().toISOString().split('T')[0]
  return citas.value.find(c =>
    c.fecha >= hoy &&
    c.estado !== 'cancelada'
  )
})

// Computed: Estadísticas
const estadisticas = computed(() => {
  const realizadas = citas.value.filter(c => c.estado === 'realizada').length
  const canceladas = citas.value.filter(c => c.estado === 'cancelada').length
  return { realizadas, canceladas, total: citas.value.length }
})

// Formatear precio
const formatearPrecio = (valor: number) => {
  return `${valor.toFixed(2)}€`
}

// Formatear fecha
const formatearFecha = (fecha: string) => {
  if (!fecha) return '-'
  try {
    const d = new Date(fecha + 'T00:00:00')
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  } catch {
    return fecha
  }
}

// Formatear fecha con hora
const formatearFechaHora = (fecha: string, hora?: string) => {
  if (!fecha) return '-'
  try {
    const d = new Date(fecha + 'T00:00:00')
    const fechaStr = d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
    if (hora) {
      return `${fechaStr} a las ${hora.substring(0, 5)}`
    }
    return fechaStr
  } catch {
    return fecha
  }
}

// Cerrar modal
const cerrar = () => {
  emit('close')
}

// Navegar a ficha completa
const irAFicha = () => {
  if (paciente.value?.id) {
    emit('ver-ficha', paciente.value.id)
    cerrar()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="cerrar"
      >
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            @click.stop
          >
            <!-- Loading -->
            <div v-if="cargando" class="flex items-center justify-center py-20">
              <div class="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>

            <template v-else-if="paciente">
              <!-- Header -->
              <div class="relative px-6 pt-6 pb-4 bg-gradient-to-br from-purple-500 to-purple-600 flex-shrink-0">
                <button
                  @click="cerrar"
                  class="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon class="w-5 h-5" />
                </button>

                <div class="flex items-center gap-4">
                  <div
                    class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ring-4 ring-white/20"
                    :style="{ backgroundColor: avatarColor }"
                  >
                    {{ iniciales }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h2 class="text-xl font-semibold text-white truncate">
                      {{ paciente.nombre_completo || 'Sin nombre' }}
                    </h2>
                    <div class="flex items-center gap-2 mt-1">
                      <span
                        class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                        :class="estadoPaciente.clase"
                      >
                        {{ estadoPaciente.texto }}
                      </span>
                      <span v-if="paciente.area_de_acompanamiento" class="text-sm text-white/70">
                        {{ paciente.area_de_acompanamiento }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contenido scrollable -->
              <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <!-- Balance Financiero -->
                <div
                  class="p-4 rounded-xl border-2"
                  :class="balanceFinanciero.totalPendiente > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">Balance Financiero</span>
                    <span
                      v-if="balanceFinanciero.totalPendiente > 0"
                      class="text-lg font-bold text-red-600"
                    >
                      {{ formatearPrecio(balanceFinanciero.totalPendiente) }}
                    </span>
                    <span v-else class="text-sm font-semibold text-green-600">Al día</span>
                  </div>

                  <div v-if="balanceFinanciero.totalPendiente > 0" class="space-y-1 text-xs">
                    <div v-if="balanceFinanciero.bonosPendientes > 0" class="flex justify-between text-amber-700">
                      <span>{{ balanceFinanciero.bonosPendientes }} bono(s) sin pagar</span>
                      <span>{{ formatearPrecio(balanceFinanciero.montoBonosPendientes) }}</span>
                    </div>
                    <div v-if="balanceFinanciero.sesionesSinCobrar > 0" class="flex justify-between text-orange-700">
                      <span>{{ balanceFinanciero.sesionesSinCobrar }} sesión(es) sin cobrar</span>
                      <span>{{ formatearPrecio(balanceFinanciero.montoSesionesPendientes) }}</span>
                    </div>
                    <div v-if="balanceFinanciero.deudaHistorica > 0" class="flex justify-between text-red-700">
                      <span>Deuda histórica</span>
                      <span>{{ formatearPrecio(balanceFinanciero.deudaHistorica) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Próxima cita -->
                <div
                  class="p-3 rounded-lg"
                  :class="proximaCita ? 'bg-purple-50' : 'bg-amber-50'"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <CalendarDaysIcon class="w-4 h-4" :class="proximaCita ? 'text-purple-500' : 'text-amber-500'" />
                    <span class="text-xs font-medium text-gray-500">Próxima cita</span>
                  </div>
                  <p v-if="proximaCita" class="text-sm font-semibold text-purple-700">
                    {{ formatearFechaHora(proximaCita.fecha, proximaCita.hora_inicio) }}
                  </p>
                  <p v-else class="text-sm font-medium text-amber-700">Sin cita programada</p>
                </div>

                <!-- Bono activo -->
                <div v-if="bonoActivo" class="p-3 rounded-lg bg-purple-50 border border-purple-100">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-purple-700">Bono activo</span>
                    <span
                      v-if="!bonoActivo.pagado"
                      class="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700"
                    >
                      Sin pagar
                    </span>
                    <span
                      v-else
                      class="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700"
                    >
                      Pagado
                    </span>
                  </div>
                  <div class="relative h-2 bg-purple-200 rounded-full overflow-hidden mb-1">
                    <div
                      class="absolute left-0 top-0 h-full bg-purple-500 rounded-full transition-all"
                      :style="{ width: `${((bonoActivo.sesiones_totales - bonoActivo.sesiones_restantes) / bonoActivo.sesiones_totales) * 100}%` }"
                    ></div>
                  </div>
                  <div class="flex justify-between text-xs text-gray-600">
                    <span>{{ bonoActivo.sesiones_totales - bonoActivo.sesiones_restantes }} usadas</span>
                    <span class="font-semibold text-purple-700">{{ bonoActivo.sesiones_restantes }} restantes</span>
                  </div>
                </div>

                <!-- Estadísticas rápidas -->
                <div class="grid grid-cols-3 gap-2">
                  <div class="p-3 bg-gray-50 rounded-lg text-center">
                    <div class="text-xl font-bold text-gray-700">{{ estadisticas.total }}</div>
                    <div class="text-xs text-gray-500">Total citas</div>
                  </div>
                  <div class="p-3 bg-green-50 rounded-lg text-center">
                    <div class="text-xl font-bold text-green-600">{{ estadisticas.realizadas }}</div>
                    <div class="text-xs text-gray-500">Realizadas</div>
                  </div>
                  <div class="p-3 bg-red-50 rounded-lg text-center">
                    <div class="text-xl font-bold text-red-600">{{ estadisticas.canceladas }}</div>
                    <div class="text-xs text-gray-500">Canceladas</div>
                  </div>
                </div>

                <!-- Contacto -->
                <div class="flex flex-col gap-2">
                  <div v-if="paciente.email" class="flex items-center gap-2 text-sm text-gray-600">
                    <EnvelopeIcon class="w-4 h-4 text-gray-400" />
                    <span class="truncate">{{ paciente.email }}</span>
                  </div>
                  <div v-if="paciente.telefono" class="flex items-center gap-2 text-sm text-gray-600">
                    <PhoneIcon class="w-4 h-4 text-gray-400" />
                    <span>{{ paciente.telefono }}</span>
                  </div>
                </div>
              </div>

              <!-- Footer con acciones -->
              <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-2 flex-shrink-0">
                <button
                  @click="irAFicha"
                  class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                  Ver ficha completa
                </button>
                <button
                  @click="emit('editar', paciente.id); cerrar()"
                  class="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  @click="emit('gestionar-bonos', paciente.id); cerrar()"
                  class="px-4 py-2 text-purple-600 text-sm font-medium hover:bg-purple-50 rounded-lg transition-colors"
                >
                  Bonos
                </button>
                <button
                  @click="emit('nueva-cita', paciente.id); cerrar()"
                  class="px-4 py-2 text-teal-600 text-sm font-medium hover:bg-teal-50 rounded-lg transition-colors"
                >
                  + Cita
                </button>
              </div>
            </template>

            <!-- Error -->
            <div v-else class="flex flex-col items-center justify-center py-20 text-gray-500">
              <span class="text-4xl mb-2">😕</span>
              <p>No se pudo cargar el paciente</p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
