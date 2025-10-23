<template>
  <div>
    <NuxtLayout name="coordinacion">
      <!-- Encabezado -->
      <div class="mb-8">
        <h1 class="text-3xl font-lora font-bold text-[#5D4A44] mb-2">
          Dashboard de Coordinación
        </h1>
        <p class="text-[#8B7470]">
          {{ fechaActual }} · Resumen general del día
        </p>
      </div>

      <!-- Tarjetas de resumen -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Sesiones de hoy"
          :count="sesionesHoy.length"
          icon="heroicons:calendar"
          to="/coordinacion/agenda"
          :subtitle="`${sesionesConfirmadas} confirmadas`"
          :badge="sesionesHoy.length > 0 ? `Próxima: ${proximaSesion}` : 'Sin sesiones'"
          :variant="sesionesHoy.length > 0 ? 'success' : 'default'"
        />

        <DashboardCard
          title="Pagos pendientes"
          :count="pagosPendientes.length"
          icon="heroicons:credit-card"
          to="/coordinacion/pagos"
          :subtitle="`$${totalPendiente.toFixed(2)} en total`"
          :badge="pagosPendientes.length > 0 ? 'Requiere atención' : 'Todo al día'"
          :variant="pagosPendientes.length > 0 ? 'warning' : 'success'"
        />

        <DashboardCard
          title="Mensajes nuevos"
          :count="mensajesNoVistos"
          icon="heroicons:chat-bubble-left-right"
          to="/coordinacion/mensajes"
          subtitle="De pacientes"
          :badge="mensajesNoVistos > 0 ? 'Responder pronto' : 'Sin pendientes'"
          :variant="mensajesNoVistos > 5 ? 'danger' : 'default'"
        />

        <DashboardCard
          title="Recordatorios"
          :count="recordatoriosPendientes"
          icon="heroicons:bell-alert"
          to="/coordinacion/agenda"
          subtitle="Programados para hoy"
          badge="Automáticos"
          variant="default"
        />
      </div>

      <!-- Sesiones de hoy -->
      <div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-lora font-semibold text-[#5D4A44]">
            Sesiones de hoy
          </h2>
          <NuxtLink
            to="/coordinacion/agenda"
            class="text-sm text-[#D8AFA0] hover:text-[#C49484] font-medium flex items-center space-x-1"
          >
            <span>Ver calendario completo</span>
            <Icon name="heroicons:arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <!-- Lista de sesiones -->
        <div v-if="sesionesHoy.length > 0" class="space-y-3">
          <div
            v-for="sesion in sesionesHoy.slice(0, 5)"
            :key="sesion.id"
            class="flex items-center justify-between p-4 bg-[#F9F7F3] rounded-lg hover:bg-[#E8DFD8] transition-colors"
          >
            <div class="flex items-center space-x-4 flex-1">
              <div class="text-center min-w-[60px]">
                <p class="text-sm font-medium text-[#5D4A44]">
                  {{ formatearHora(sesion.fecha) }}
                </p>
                <p class="text-xs text-[#8B7470]">
                  {{ sesion.modalidad }}
                </p>
              </div>

              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] flex items-center justify-center flex-shrink-0">
                <span class="text-white text-sm font-semibold">
                  {{ obtenerIniciales(sesion.paciente_nombre) }}
                </span>
              </div>

              <div class="flex-1">
                <p class="font-medium text-[#5D4A44]">{{ sesion.paciente_nombre }}</p>
                <p class="text-sm text-[#8B7470]">Con {{ sesion.terapeuta_nombre }}</p>
              </div>

              <div class="flex items-center space-x-2">
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getEstadoClass(sesion.estado)"
                >
                  {{ sesion.estado }}
                </span>

                <button
                  v-if="sesion.paciente_telefono"
                  @click="abrirWhatsApp(sesion.paciente_telefono)"
                  class="p-2 rounded-lg hover:bg-green-50 transition-colors group"
                  title="Enviar WhatsApp"
                >
                  <Icon 
                    name="heroicons:chat-bubble-oval-left-ellipsis" 
                    class="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" 
                  />
                </button>
              </div>
            </div>
          </div>

          <div v-if="sesionesHoy.length > 5" class="text-center pt-3">
            <NuxtLink
              to="/coordinacion/agenda"
              class="text-sm text-[#D8AFA0] hover:text-[#C49484] font-medium"
            >
              Ver todas las {{ sesionesHoy.length }} sesiones →
            </NuxtLink>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <Icon name="heroicons:calendar-days" class="w-16 h-16 text-[#D8AFA0] mx-auto mb-4 opacity-30" />
          <p class="text-[#8B7470] mb-4">No hay sesiones programadas para hoy</p>
          <NuxtLink
            to="/coordinacion/agenda"
            class="inline-flex items-center px-4 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C49484] transition-colors"
          >
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            Programar sesión
          </NuxtLink>
        </div>
      </div>

      <!-- Pagos recientes y actividad -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Pagos recientes -->
        <div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-lora font-semibold text-[#5D4A44]">
              Pagos recientes
            </h2>
            <NuxtLink
              to="/coordinacion/pagos"
              class="text-sm text-[#D8AFA0] hover:text-[#C49484] font-medium flex items-center space-x-1"
            >
              <span>Ver todos</span>
              <Icon name="heroicons:arrow-right" class="w-4 h-4" />
            </NuxtLink>
          </div>

          <div v-if="pagosRecientes.length > 0" class="space-y-3">
            <div
              v-for="pago in pagosRecientes.slice(0, 4)"
              :key="pago.id"
              class="flex items-center justify-between p-3 bg-[#F9F7F3] rounded-lg"
            >
              <div class="flex-1">
                <p class="font-medium text-[#5D4A44] text-sm">{{ pago.paciente_nombre }}</p>
                <p class="text-xs text-[#8B7470]">{{ formatearFechaCorta(pago.created_at) }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-[#5D4A44]">${{ pago.monto }}</p>
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  :class="getPagoEstadoClass(pago.estado)"
                >
                  {{ pago.estado }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-[#8B7470]">
            <Icon name="heroicons:credit-card" class="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p class="text-sm">No hay pagos recientes</p>
          </div>
        </div>

        <!-- Acciones rápidas -->
        <div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6">
          <h2 class="text-xl font-lora font-semibold text-[#5D4A44] mb-6">
            Acciones rápidas
          </h2>

          <div class="space-y-3">
            <button
              @click="$router.push('/coordinacion/agenda?action=nueva-sesion')"
              class="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-[#D8AFA0] to-[#C49484] text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Icon name="heroicons:plus-circle" class="w-6 h-6" />
              <span class="font-medium">Programar nueva sesión</span>
            </button>

            <button
              @click="$router.push('/coordinacion/mensajes?action=nuevo-mensaje')"
              class="w-full flex items-center space-x-3 p-4 bg-white border-2 border-[#D8AFA0] text-[#5D4A44] rounded-lg hover:bg-[#F9F7F3] transition-all"
            >
              <Icon name="heroicons:chat-bubble-left" class="w-6 h-6 text-[#D8AFA0]" />
              <span class="font-medium">Enviar mensaje</span>
            </button>

            <button
              @click="$router.push('/coordinacion/pagos?action=registrar-pago')"
              class="w-full flex items-center space-x-3 p-4 bg-white border-2 border-[#D8AFA0] text-[#5D4A44] rounded-lg hover:bg-[#F9F7F3] transition-all"
            >
              <Icon name="heroicons:banknotes" class="w-6 h-6 text-[#D8AFA0]" />
              <span class="font-medium">Registrar pago</span>
            </button>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import DashboardCard from '~/components/coordinacion/DashboardCard.vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Estado
const sesionesHoy = ref<any[]>([])
const pagosPendientes = ref<any[]>([])
const pagosRecientes = ref<any[]>([])
const mensajesNoVistos = ref(0)
const recordatoriosPendientes = ref(0)
const cargando = ref(true)

// Computed
const fechaActual = computed(() => {
  const hoy = new Date()
  return hoy.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

const sesionesConfirmadas = computed(() => {
  return sesionesHoy.value.filter(s => s.estado === 'confirmada').length
})

const proximaSesion = computed(() => {
  if (sesionesHoy.value.length === 0) return '---'
  const proxima = sesionesHoy.value[0]
  return formatearHora(proxima.fecha)
})

const totalPendiente = computed(() => {
  return pagosPendientes.value.reduce((sum, p) => sum + parseFloat(p.monto), 0)
})

// Funciones
const formatearHora = (fecha: string) => {
  return new Date(fecha).toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatearFechaCorta = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  })
}

const obtenerIniciales = (nombre: string) => {
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const getEstadoClass = (estado: string) => {
  const classes: Record<string, string> = {
    'confirmada': 'bg-green-100 text-green-700',
    'pendiente': 'bg-yellow-100 text-yellow-700',
    'cancelada': 'bg-red-100 text-red-700',
    'completada': 'bg-blue-100 text-blue-700'
  }
  return classes[estado] || 'bg-gray-100 text-gray-700'
}

const getPagoEstadoClass = (estado: string) => {
  const classes: Record<string, string> = {
    'pendiente': 'bg-yellow-100 text-yellow-700',
    'confirmado_paciente': 'bg-blue-100 text-blue-700',
    'confirmado_admin': 'bg-green-100 text-green-700',
    'rechazado': 'bg-red-100 text-red-700'
  }
  return classes[estado] || 'bg-gray-100 text-gray-700'
}

const abrirWhatsApp = (telefono: string) => {
  const numero = telefono.replace(/\D/g, '')
  window.open(`https://wa.me/${numero}`, '_blank')
}

const cargarDatos = async () => {
  if (!user.value) return

  cargando.value = true

  try {
    // Cargar sesiones de hoy
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const manana = new Date(hoy)
    manana.setDate(manana.getDate() + 1)

    const { data: sesiones } = await supabase
      .from('sesiones' as any)
      .select(`
        *,
        terapeuta:terapeuta_id(nombre),
        paciente:paciente_id(nombre, telefono)
      `)
      .gte('fecha', hoy.toISOString())
      .lt('fecha', manana.toISOString())
      .neq('estado', 'cancelada')
      .order('fecha', { ascending: true })

    if (sesiones) {
      sesionesHoy.value = sesiones.map((s: any) => ({
        ...s,
        terapeuta_nombre: s.terapeuta?.nombre || 'Sin terapeuta',
        paciente_nombre: s.paciente?.nombre || 'Sin paciente',
        paciente_telefono: s.paciente?.telefono
      }))
    }

    // Cargar pagos pendientes
    const { data: pagos } = await supabase
      .from('pagos' as any)
      .select(`
        *,
        paciente:paciente_id(nombre),
        terapeuta:terapeuta_id(nombre)
      `)
      .in('estado', ['pendiente', 'confirmado_paciente'])
      .order('created_at', { ascending: false })

    if (pagos) {
      pagosPendientes.value = pagos.map((p: any) => ({
        ...p,
        paciente_nombre: p.paciente?.nombre || 'Sin paciente',
        terapeuta_nombre: p.terapeuta?.nombre || 'Sin terapeuta'
      }))

      pagosRecientes.value = pagosPendientes.value.slice(0, 4)
    }

    // Cargar mensajes no vistos (simulado)
    mensajesNoVistos.value = Math.floor(Math.random() * 10)

    // Cargar recordatorios pendientes (simulado)
    recordatoriosPendientes.value = sesionesConfirmadas.value * 2 // 24h y 4h

  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    cargando.value = false
  }
}

// Cargar datos al montar
onMounted(() => {
  cargarDatos()

  // Recargar cada 2 minutos
  const interval = setInterval(cargarDatos, 120000)

  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
