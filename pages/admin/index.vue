<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Métricas del Negocio</h2>
      <p class="text-gray-600">Vista general del rendimiento y estado del sistema</p>
    </div>

    <!-- Loading State -->
    <div v-if="cargando" class="flex items-center justify-center py-24">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 font-medium">Cargando métricas...</p>
      </div>
    </div>

    <template v-else>
      <!-- KPIs Principales -->
      <section class="mb-8">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Indicadores Clave</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Revenue Total -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon class="w-7 h-7 text-emerald-600" />
              </div>
            </div>
            <h4 class="text-sm font-semibold text-gray-600 mb-1">Ingresos Totales</h4>
            <p class="text-3xl font-bold text-gray-900">{{ formatNumber(metricas.ingresoTotal) }}</p>
            <p class="text-xs text-gray-500 mt-2">Confirmados</p>
          </div>

          <!-- CLTV Promedio -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserIcon class="w-7 h-7 text-blue-600" />
              </div>
            </div>
            <h4 class="text-sm font-semibold text-gray-600 mb-1">CLTV Promedio</h4>
            <p class="text-3xl font-bold text-gray-900">{{ formatNumber(metricas.cltvPromedio) }}</p>
            <p class="text-xs text-gray-500 mt-2">Por paciente</p>
          </div>

          <!-- Ocupación Real -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CalendarDaysIcon class="w-7 h-7 text-purple-600" />
              </div>
            </div>
            <h4 class="text-sm font-semibold text-gray-600 mb-1">Ocupación Real</h4>
            <p class="text-3xl font-bold text-gray-900">{{ metricas.tasaOcupacionReal }}%</p>
            <p class="text-xs text-gray-500 mt-2">Confirmadas + Realizadas</p>
          </div>

          <!-- Ocupación Proyectada -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarIcon class="w-7 h-7 text-blue-600" />
              </div>
            </div>
            <h4 class="text-sm font-semibold text-gray-600 mb-1">Ocupación Proyectada</h4>
            <p class="text-3xl font-bold text-gray-900">{{ metricas.tasaOcupacionProyectada }}%</p>
            <p class="text-xs text-gray-500 mt-2">Últimos 30 días</p>
          </div>

          <!-- Ocupación Próxima Semana -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <CalendarIcon class="w-7 h-7 text-teal-600" />
              </div>
            </div>
            <h4 class="text-sm font-semibold text-gray-600 mb-1">Previsión Próxima Semana</h4>
            <p class="text-3xl font-bold text-gray-900">{{ metricas.ocupacionProximaSemana }}%</p>
            <p class="text-xs text-gray-500 mt-2">Citas programadas</p>
          </div>

          <!-- Churn Rate -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <ArrowTrendingDownIcon class="w-7 h-7 text-amber-600" />
              </div>
            </div>
            <h4 class="text-sm font-semibold text-gray-600 mb-1">Tasa de Abandono</h4>
            <p class="text-3xl font-bold text-gray-900">{{ metricas.churnRate }}%</p>
            <p class="text-xs text-gray-500 mt-2">Últimos 3 meses</p>
          </div>
        </div>
      </section>

      <!-- Resumen General -->
      <section class="mb-8">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Resumen General</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Pacientes -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon class="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h4 class="text-sm font-semibold text-gray-600">Pacientes</h4>
                <p class="text-2xl font-bold text-gray-900">{{ metricas.totalPacientes }}</p>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Activos con bono:</span>
                <span class="font-semibold text-gray-900">{{ metricas.pacientesConBono }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Nuevos (mes):</span>
                <span class="font-semibold text-gray-900">{{ metricas.pacientesNuevos }}</span>
              </div>
            </div>
          </div>

          <!-- Bonos -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TicketIcon class="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h4 class="text-sm font-semibold text-gray-600">Bonos</h4>
                <p class="text-2xl font-bold text-gray-900">{{ metricas.totalBonos }}</p>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Activos:</span>
                <span class="font-semibold text-emerald-600">{{ metricas.bonosActivos }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Agotados:</span>
                <span class="font-semibold text-gray-600">{{ metricas.bonosAgotados }}</span>
              </div>
            </div>
          </div>

          <!-- Citas -->
          <div class="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CalendarIcon class="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h4 class="text-sm font-semibold text-gray-600">Citas</h4>
                <p class="text-2xl font-bold text-gray-900">{{ metricas.totalCitas }}</p>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Realizadas:</span>
                <span class="font-semibold text-emerald-600">{{ metricas.citasRealizadas }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Canceladas:</span>
                <span class="font-semibold text-red-600">{{ metricas.citasCanceladas }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Rendimiento por Terapeuta -->
      <section class="mb-8">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Rendimiento por Terapeuta</h3>
        <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Terapeuta
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Pacientes
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Citas Realizadas
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ocupación
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    CLTV Promedio
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="terapeuta in terapeutas" :key="terapeuta.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {{ terapeuta.iniciales }}
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-semibold text-gray-900">{{ terapeuta.nombre }}</div>
                        <div class="text-sm text-gray-500">{{ terapeuta.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-gray-900">{{ terapeuta.totalPacientes }}</div>
                    <div class="text-xs text-gray-500">{{ terapeuta.pacientesActivos }} activos</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-gray-900">{{ terapeuta.citasRealizadas }}</div>
                    <div class="text-xs text-gray-500">{{ terapeuta.citasTotales }} totales</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div class="text-sm font-semibold text-gray-900">{{ terapeuta.ocupacion }}%</div>
                      <div class="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          class="h-2 rounded-full transition-all"
                          :class="terapeuta.ocupacion >= 80 ? 'bg-emerald-500' : terapeuta.ocupacion >= 50 ? 'bg-amber-500' : 'bg-red-500'"
                          :style="{ width: `${terapeuta.ocupacion}%` }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-emerald-600">
                      {{ formatNumber(terapeuta.revenue) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-indigo-600">
                      {{ formatNumber(terapeuta.cltvPromedio) }}
                    </div>
                  </td>
                </tr>
                <tr v-if="terapeutas.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    No hay terapeutas registradas
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Última actualización -->
      <div class="text-center text-sm text-gray-500">
        Última actualización: {{ fechaActualizacion }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  CurrencyDollarIcon,
  UserIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CalendarIcon,
  TicketIcon,
  ArrowTrendingDownIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const supabase = useSupabaseClient()
const cargando = ref(true)

interface Metricas {
  ingresoTotal: number
  cltvPromedio: number
  tasaOcupacionReal: number
  tasaOcupacionProyectada: number
  ocupacionProximaSemana: number
  churnRate: number
  totalPacientes: number
  pacientesConBono: number
  pacientesNuevos: number
  totalBonos: number
  bonosActivos: number
  bonosAgotados: number
  totalCitas: number
  citasRealizadas: number
  citasCanceladas: number
}

interface TerapeutaMetricas {
  id: string
  nombre: string
  email: string
  iniciales: string
  totalPacientes: number
  pacientesActivos: number
  citasRealizadas: number
  citasTotales: number
  ocupacion: number
  revenue: number
  cltvPromedio: number
}

const metricas = ref<Metricas>({
  ingresoTotal: 0,
  cltvPromedio: 0,
  tasaOcupacionReal: 0,
  tasaOcupacionProyectada: 0,
  ocupacionProximaSemana: 0,
  churnRate: 0,
  totalPacientes: 0,
  pacientesConBono: 0,
  pacientesNuevos: 0,
  totalBonos: 0,
  bonosActivos: 0,
  bonosAgotados: 0,
  totalCitas: 0,
  citasRealizadas: 0,
  citasCanceladas: 0
})

const terapeutas = ref<TerapeutaMetricas[]>([])

const fechaActualizacion = computed(() => 
  new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
)

const formatNumber = (num: number) => {
  if (num === undefined || num === null || isNaN(num)) {
    return '€0,00'
  }
  return num.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const cargarMetricas = async () => {
  try {
    cargando.value = true

    console.log('🔄 Cargando métricas del dashboard...')

    // Llamar a la función SQL que calcula todas las métricas
    const { data: metricasData, error: metricasError } = await supabase
      .rpc('fn_admin_metricas_generales')

    if (metricasError) {
      console.error('Error al cargar métricas:', metricasError)
      throw metricasError
    }

    console.log('📊 Métricas desde SQL:', metricasData)

    // Asignar métricas desde la función SQL
    metricas.value = {
      ingresoTotal: metricasData.ingresoTotal || 0,
      cltvPromedio: metricasData.cltvPromedio || 0,
      tasaOcupacionReal: metricasData.tasaOcupacionReal || 0,
      tasaOcupacionProyectada: metricasData.tasaOcupacionProyectada || 0,
      ocupacionProximaSemana: metricasData.ocupacionProximaSemana || 0,
      churnRate: metricasData.churnRate || 0,
      totalPacientes: metricasData.totalPacientes || 0,
      pacientesConBono: metricasData.pacientesConBono || 0,
      pacientesNuevos: metricasData.pacientesNuevos || 0,
      totalBonos: metricasData.totalBonos || 0,
      bonosActivos: metricasData.bonosActivos || 0,
      bonosAgotados: metricasData.bonosAgotados || 0,
      totalCitas: metricasData.totalCitas || 0,
      citasRealizadas: metricasData.citasRealizadas || 0,
      citasCanceladas: metricasData.citasCanceladas || 0
    }

    console.log('✅ Métricas cargadas:', metricas.value)

    // === CARGAR MÉTRICAS POR TERAPEUTA ===
    // Esto aún se calcula en el frontend porque es más dinámico
    const [
      { data: terapeutasData },
      { data: pacientes },
      { data: citas },
      { data: bonos }
    ] = await Promise.all([
      supabase.from('terapeutas').select('*'),
      supabase.from('pacientes').select('*'),
      supabase.from('citas').select('*'),
      supabase.from('bonos').select('*')
    ])

    const bonosPagados = bonos?.filter(b => b.pagado === true) || []

    // Calcular ocupación real: últimos 30 días con citas confirmadas + realizadas
    const fechaMesAtras = new Date()
    fechaMesAtras.setDate(fechaMesAtras.getDate() - 30)
    const horasDisponiblesPorTerapeutaMes = 30 * 9 // 30 días * 9 horas/día

    terapeutas.value = (terapeutasData || []).map(t => {
      const pacientesTerapeuta = pacientes?.filter(p => p.terapeuta_id === t.id) || []
      const citasTerapeuta = citas?.filter(c => 
        pacientesTerapeuta.some(p => p.id === c.paciente_id)
      ) || []
      
      // Citas realizadas y confirmadas en los últimos 30 días
      const citasRealizadasTerapeuta = citasTerapeuta.filter(c => 
        c.estado === 'realizada' || c.estado === 'confirmada'
      )
      
      const citasOcupadasUltimoMes = citasTerapeuta.filter(c => {
        const fechaCita = new Date(c.fecha_cita)
        return fechaCita >= fechaMesAtras && 
               (c.estado === 'realizada' || c.estado === 'confirmada')
      }).length
      
      // Revenue desde bonos pagados
      const bonosPagadosTerapeuta = bonosPagados.filter(b =>
        pacientesTerapeuta.some(pac => pac.id === b.paciente_id)
      )

      const revenueTerapeuta = bonosPagadosTerapeuta.reduce((sum, b) => {
        const monto = parseFloat(b.monto_total || '0')
        return sum + (isNaN(monto) ? 0 : monto)
      }, 0)

      // Pacientes activos (con bonos activos)
      const pacientesActivos = pacientesTerapeuta.filter(p =>
        bonos?.some(b => b.paciente_id === p.id && b.estado === 'activo')
      ).length

      // Ocupación = horas ocupadas / horas disponibles en el mes
      const tasaOcupacion = horasDisponiblesPorTerapeutaMes > 0
        ? Math.round((citasOcupadasUltimoMes / horasDisponiblesPorTerapeutaMes) * 100)
        : 0

      return {
        id: t.id,
        nombre: t.nombre_completo || 'Sin nombre',
        email: t.email || '',
        iniciales: (t.nombre_completo || 'XX')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        totalPacientes: pacientesTerapeuta.length,
        pacientesActivos,
        citasRealizadas: citasRealizadasTerapeuta.length,
        citasTotales: citasTerapeuta.length,
        ocupacion: tasaOcupacion,
        revenue: revenueTerapeuta,
        cltvPromedio: pacientesTerapeuta.length > 0
          ? revenueTerapeuta / pacientesTerapeuta.length
          : 0
      }
    })

    console.log('👥 Terapeutas cargadas:', terapeutas.value)

  } catch (error) {
    console.error('❌ Error al cargar métricas:', error)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarMetricas()
})
</script>
