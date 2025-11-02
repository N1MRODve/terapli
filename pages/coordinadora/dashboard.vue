<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <div class="max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          ¡Bienvenida! 👋
        </h1>
        <p class="text-sm text-gray-600">{{ fechaFormateada }}</p>
      </div>

      <!-- Loading -->
      <div v-if="cargando" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600 text-sm">Cargando información...</p>
        </div>
      </div>

      <template v-else>
        
        <!-- Accesos Rápidos - Más compactos -->
        <section aria-label="Accesos rápidos" class="mb-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <button 
              @click="navigateTo('/coordinadora/agenda')" 
              class="bg-white border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200 text-left group"
              aria-label="Ir a la agenda"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                  <CalendarDaysIcon class="w-5 h-5 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-gray-900">Agenda</h3>
                  <p class="text-xs text-gray-500">Gestionar citas</p>
                </div>
              </div>
            </button>

            <button 
              @click="navigateTo('/coordinadora/confirmaciones')" 
              class="bg-white border-2 border-emerald-200 rounded-lg p-4 hover:border-emerald-400 hover:shadow-md transition-all duration-200 text-left group"
              aria-label="Ir a confirmaciones"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <CheckCircleIcon class="w-5 h-5 text-emerald-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-gray-900">Confirmaciones</h3>
                  <p class="text-xs text-gray-500">Confirmar citas</p>
                </div>
              </div>
            </button>

            <button 
              @click="navigateTo('/coordinadora/pagos')" 
              class="bg-white border-2 border-purple-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all duration-200 text-left group"
              aria-label="Ir a pagos"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                  <CurrencyDollarIcon class="w-5 h-5 text-purple-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-gray-900">Pagos</h3>
                  <p class="text-xs text-gray-500">Gestionar pagos</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <!-- Panel de Control -->
        <section aria-label="Panel de control" class="mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-3">Panel de Control</h2>
          
          <!-- Todo al día -->
          <div v-if="!tieneAccionesUrgentes" class="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon class="w-6 h-6 text-emerald-600" />
            </div>
            <h3 class="text-base font-semibold text-gray-900 mb-1">¡Todo al día!</h3>
            <p class="text-sm text-gray-600">
              No tienes acciones urgentes pendientes.
            </p>
          </div>

          <!-- Acciones Urgentes -->
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <!-- 4 horas -->
            <div 
              v-if="citasPorConfirmar4h.length > 0"
              @click="navigateTo('/coordinadora/confirmaciones')"
              class="bg-white border-2 border-red-200 rounded-lg p-4 cursor-pointer hover:border-red-400 hover:shadow-md transition-all duration-200"
              role="button"
              aria-label="Ver citas urgentes en menos de 4 horas"
              tabindex="0"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <BellAlertIcon class="w-5 h-5 text-red-600" aria-hidden="true" />
                </div>
                <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">URGENTE</span>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ citasPorConfirmar4h.length }}</h3>
              <p class="text-sm text-gray-700 font-medium mb-2">Citas en menos de 4 horas</p>
              <div class="flex items-center gap-1 text-xs text-gray-500">
                <ClockIcon class="w-3.5 h-3.5" aria-hidden="true" />
                <span>Confirmar ahora</span>
              </div>
            </div>

            <!-- 24 horas -->
            <div 
              v-if="citasPorConfirmar24h.length > 0"
              @click="navigateTo('/coordinadora/confirmaciones')"
              class="bg-white border-2 border-orange-200 rounded-lg p-4 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all duration-200"
              role="button"
              aria-label="Ver citas en las próximas 24 horas"
              tabindex="0"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon class="w-5 h-5 text-orange-600" aria-hidden="true" />
                </div>
                <span class="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">HOY</span>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ citasPorConfirmar24h.length }}</h3>
              <p class="text-sm text-gray-700 font-medium mb-2">Citas en 24 horas</p>
              <div class="flex items-center gap-1 text-xs text-gray-500">
                <ClockIcon class="w-3.5 h-3.5" aria-hidden="true" />
                <span>Confirmar hoy</span>
              </div>
            </div>

            <!-- Pagos -->
            <div 
              v-if="pagosPendientes > 0"
              @click="navigateTo('/coordinadora/pagos')"
              class="bg-white border-2 border-purple-200 rounded-lg p-4 cursor-pointer hover:border-purple-400 hover:shadow-md transition-all duration-200"
              role="button"
              aria-label="Ver pagos pendientes de confirmación"
              tabindex="0"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon class="w-5 h-5 text-purple-600" aria-hidden="true" />
                </div>
                <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">PAGOS</span>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ pagosPendientes }}</h3>
              <p class="text-sm text-gray-700 font-medium mb-2">Pagos por confirmar</p>
              <div class="text-xs text-gray-500 font-mono">
                {{ formatNumber(totalPendiente) }}
              </div>
            </div>
          </div>
        </section>

        <!-- Vista Rápida del Día -->
        <section aria-label="Vista rápida del día">
          <h2 class="text-lg font-bold text-gray-900 mb-3">Vista Rápida del Día</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <!-- Citas Hoy -->
            <button 
              @click="navigateTo('/coordinadora/agenda')" 
              class="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
              aria-label="Ver agenda de citas de hoy"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <CalendarDaysIcon class="w-5 h-5 text-blue-600" aria-hidden="true" />
                </div>
                <ArrowRightIcon class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" aria-hidden="true" />
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ citasHoy }}</h3>
              <p class="text-sm text-gray-600 font-medium mb-2">Citas hoy</p>
              <span class="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold">
                {{ citasConfirmadas }} confirmadas
              </span>
            </button>

            <!-- Sin Confirmar -->
            <button 
              @click="navigateTo('/coordinadora/confirmaciones')" 
              class="bg-white border border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-md transition-all duration-200 text-left group"
              aria-label="Ver citas sin confirmar"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <ClockIcon class="w-5 h-5 text-amber-600" aria-hidden="true" />
                </div>
                <ArrowRightIcon class="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" aria-hidden="true" />
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ citasPendientes }}</h3>
              <p class="text-sm text-gray-600 font-medium mb-2">Sin confirmar</p>
              <span class="text-xs font-semibold" :class="citasPendientes > 0 ? 'text-amber-600' : 'text-emerald-600'">
                {{ citasPendientes > 0 ? 'Requiere seguimiento' : '✓ Todo confirmado' }}
              </span>
            </button>

            <!-- Pacientes -->
            <button 
              @click="navigateTo('/coordinadora/pacientes')" 
              class="bg-white border border-gray-200 rounded-lg p-4 hover:border-emerald-300 hover:shadow-md transition-all duration-200 text-left group"
              aria-label="Ver lista de pacientes"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <UserGroupIcon class="w-5 h-5 text-emerald-600" aria-hidden="true" />
                </div>
                <ArrowRightIcon class="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" aria-hidden="true" />
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ totalPacientes }}</h3>
              <p class="text-sm text-gray-600 font-medium mb-2">Pacientes</p>
              <span class="text-xs text-gray-500">En seguimiento</span>
            </button>

            <!-- Bonos Activos -->
            <button 
              @click="navigateTo('/coordinadora/bonos')" 
              class="bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left group"
              aria-label="Ver bonos activos"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <TicketIcon class="w-5 h-5 text-purple-600" aria-hidden="true" />
                </div>
                <ArrowRightIcon class="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" aria-hidden="true" />
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ bonosActivos }}</h3>
              <p class="text-sm text-gray-600 font-medium mb-2">Bonos activos</p>
              <span class="text-xs text-gray-500">Con sesiones</span>
            </button>
          </div>
        </section>

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  TicketIcon, 
  ArrowRightIcon, 
  BellAlertIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon 
} from '@heroicons/vue/24/outline'

definePageMeta({ 
  layout: 'coordinadora', 
  middleware: ['auth', 'role-coordinadora'] 
})

const supabase = useSupabaseClient()

const cargando = ref(true)
const citasHoy = ref(0)
const citasConfirmadas = ref(0)
const citasPendientes = ref(0)
const totalPacientes = ref(0)
const pagosPendientes = ref(0)
const totalPendiente = ref(0)
const bonosActivos = ref(0)
const citasPorConfirmar4h = ref<any[]>([])
const citasPorConfirmar24h = ref<any[]>([])

const fechaFormateada = computed(() => 
  new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
)

const formatNumber = (num: number) => {
  return num.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const tieneAccionesUrgentes = computed(() => 
  citasPorConfirmar4h.value.length > 0 || 
  citasPorConfirmar24h.value.length > 0 || 
  pagosPendientes.value > 0
)

const cargarDatos = async () => {
  try {
    cargando.value = true
    const hoy = new Date()
    const hoyStr = hoy.toISOString().split('T')[0]
    const ahora = new Date()
    const en4Horas = new Date(ahora.getTime() + 4 * 60 * 60 * 1000)
    const en24Horas = new Date(ahora.getTime() + 24 * 60 * 60 * 1000)

    const { data: citasHoyData, count: countHoy } = await supabase
      .from('citas')
      .select('*', { count: 'exact' })
      .eq('fecha_cita', hoyStr)
    
    citasHoy.value = countHoy || 0
    citasConfirmadas.value = citasHoyData?.filter(c => c.estado === 'confirmada').length || 0

    const { count: countPendientes } = await supabase
      .from('citas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente')
      .gte('fecha_cita', hoyStr)
    
    citasPendientes.value = countPendientes || 0

    const { data: citas4h } = await supabase
      .from('citas')
      .select('*')
      .eq('estado', 'pendiente')
      .gte('fecha_cita', hoyStr)
      .lte('fecha_cita', en4Horas.toISOString().split('T')[0])
    
    citasPorConfirmar4h.value = (citas4h || []).filter(cita => {
      const citaDate = new Date(`${cita.fecha_cita}T${cita.hora_inicio}`)
      return citaDate >= ahora && citaDate <= en4Horas
    })

    const { data: citas24h } = await supabase
      .from('citas')
      .select('*')
      .eq('estado', 'pendiente')
      .gte('fecha_cita', hoyStr)
      .lte('fecha_cita', en24Horas.toISOString().split('T')[0])
    
    citasPorConfirmar24h.value = (citas24h || []).filter(cita => {
      const citaDate = new Date(`${cita.fecha_cita}T${cita.hora_inicio}`)
      return citaDate >= ahora && 
             citaDate <= en24Horas && 
             !citasPorConfirmar4h.value.find(c => c.id === cita.id)
    })

    const { count: countPacientes } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true })
    
    totalPacientes.value = countPacientes || 0

    const { count: countBonos } = await supabase
      .from('bonos')
      .select('*', { count: 'exact', head: true })
      .in('estado', ['activo', 'pendiente'])
      .gt('sesiones_restantes', 0)
    
    bonosActivos.value = countBonos || 0

    try {
      const { data: pagosData } = await supabase
        .from('pagos')
        .select('monto, estado')
        .in('estado', ['pendiente', 'confirmado_paciente'])
      
      if (pagosData) {
        pagosPendientes.value = pagosData.length
        totalPendiente.value = pagosData.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0)
      }
    } catch (e) {
      console.error('Error al cargar pagos:', e)
    }

  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarDatos()
  const interval = setInterval(cargarDatos, 120000)
  onUnmounted(() => clearInterval(interval))
})
</script>
