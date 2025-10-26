<template>
  <div>
    <NuxtLayout name="coordinacion">
      <!-- Encabezado -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-lora font-bold text-[#5D4A44] mb-2">
            Gestión de Pagos
          </h1>
          <p class="text-[#8B7470]">
            Registro y confirmación de pagos de sesiones
          </p>
        </div>

        <button
          @click="mostrarModalNuevoPago = true"
          class="px-6 py-3 bg-gradient-to-r from-[#D8AFA0] to-[#C49484] text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Icon name="heroicons:plus" class="w-5 h-5" />
          <span>Registrar pago</span>
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#5D4A44] mb-2">Estado</label>
            <select
              v-model="filtroEstado"
              class="w-full px-4 py-2 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmado_paciente">Confirmado por paciente</option>
              <option value="confirmado_admin">Confirmado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-[#5D4A44] mb-2">Búsqueda</label>
            <input
              v-model="busqueda"
              type="text"
              placeholder="Nombre del paciente..."
              class="w-full px-4 py-2 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-[#5D4A44] mb-2">Fecha desde</label>
            <input
              v-model="fechaDesde"
              type="date"
              class="w-full px-4 py-2 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-[#5D4A44] mb-2">Fecha hasta</label>
            <input
              v-model="fechaHasta"
              type="date"
              class="w-full px-4 py-2 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Tabla de pagos -->
      <div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[#F9F7F3] border-b border-[#E8DFD8]">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider">
                  Fecha
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider">
                  Paciente
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider">
                  Terapeuta
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider">
                  Monto
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider">
                  Método
                </th>
                <th class="px-6 py-4 text-right text-xs font-medium text-[#5D4A44] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E8DFD8]">
              <tr
                v-for="pago in pagosFiltrados"
                :key="pago.id"
                class="hover:bg-[#F9F7F3] transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[#5D4A44]">
                  {{ formatearFecha(pago.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] flex items-center justify-center flex-shrink-0">
                      <span class="text-white text-xs font-semibold">
                        {{ obtenerIniciales(pago.paciente_nombre) }}
                      </span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-[#5D4A44]">{{ pago.paciente_nombre }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[#8B7470]">
                  {{ pago.terapeuta_nombre }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#5D4A44]">
                  ${{ parseFloat(pago.monto).toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getEstadoClass(pago.estado)"
                  >
                    {{ getEstadoTexto(pago.estado) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[#8B7470]">
                  {{ pago.metodo_pago || 'No especificado' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    v-if="pago.estado === 'pendiente'"
                    @click="confirmarPagoPaciente(pago)"
                    class="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Confirmar pago de paciente"
                  >
                    <Icon name="heroicons:check-circle" class="w-4 h-4 inline" />
                  </button>

                  <button
                    v-if="pago.estado === 'confirmado_paciente'"
                    @click="enviarAAdministracion(pago)"
                    class="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    title="Enviar a administración"
                  >
                    <Icon name="heroicons:arrow-right-circle" class="w-4 h-4 inline" />
                  </button>

                  <button
                    @click="verDetalles(pago)"
                    class="px-3 py-1 bg-[#F9F7F3] text-[#5D4A44] rounded-lg hover:bg-[#E8DFD8] transition-colors"
                    title="Ver detalles"
                  >
                    <Icon name="heroicons:eye" class="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sin resultados -->
        <div v-if="pagosFiltrados.length === 0" class="text-center py-12">
          <Icon name="heroicons:credit-card" class="w-16 h-16 text-[#D8AFA0] mx-auto mb-4 opacity-30" />
          <p class="text-[#8B7470] mb-4">No se encontraron pagos</p>
        </div>
      </div>

      <!-- Resumen -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <p class="text-sm text-blue-700 mb-1">Total pendiente</p>
          <p class="text-3xl font-bold font-lora text-blue-900">
            ${{ totalPorEstado('pendiente').toFixed(2) }}
          </p>
        </div>

        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <p class="text-sm text-green-700 mb-1">Confirmados hoy</p>
          <p class="text-3xl font-bold font-lora text-green-900">
            ${{ totalConfirmadosHoy.toFixed(2) }}
          </p>
        </div>

        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <p class="text-sm text-purple-700 mb-1">Total del mes</p>
          <p class="text-3xl font-bold font-lora text-purple-900">
            ${{ totalDelMes.toFixed(2) }}
          </p>
        </div>
      </div>
    </NuxtLayout>

    <!-- Modal: Nuevo pago (placeholder) -->
    <teleport to="body">
      <div
        v-if="mostrarModalNuevoPago"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click="mostrarModalNuevoPago = false"
      >
        <div
          class="bg-white rounded-xl max-w-md w-full p-6"
          @click.stop
        >
          <h3 class="text-xl font-lora font-semibold text-[#5D4A44] mb-4">
            Registrar nuevo pago
          </h3>
          <p class="text-sm text-[#8B7470]">Funcionalidad en desarrollo...</p>
          <button
            @click="mostrarModalNuevoPago = false"
            class="mt-4 w-full px-4 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C49484] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { getUserId } = useSupabase()

// Estado
const pagos = ref<any[]>([])
const filtroEstado = ref('')
const busqueda = ref('')
const fechaDesde = ref('')
const fechaHasta = ref('')
const mostrarModalNuevoPago = ref(false)
const cargando = ref(true)

// Computed
const pagosFiltrados = computed(() => {
  let resultado = [...pagos.value]

  if (filtroEstado.value) {
    resultado = resultado.filter(p => p.estado === filtroEstado.value)
  }

  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(p =>
      p.paciente_nombre.toLowerCase().includes(termino)
    )
  }

  if (fechaDesde.value) {
    resultado = resultado.filter(p =>
      new Date(p.created_at) >= new Date(fechaDesde.value)
    )
  }

  if (fechaHasta.value) {
    resultado = resultado.filter(p =>
      new Date(p.created_at) <= new Date(fechaHasta.value)
    )
  }

  return resultado
})

const totalConfirmadosHoy = computed(() => {
  const hoy = new Date().toDateString()
  return pagos.value
    .filter(p => new Date(p.created_at).toDateString() === hoy && p.estado === 'confirmado_admin')
    .reduce((sum, p) => sum + parseFloat(p.monto), 0)
})

const totalDelMes = computed(() => {
  const hoy = new Date()
  const mesActual = hoy.getMonth()
  const añoActual = hoy.getFullYear()

  return pagos.value
    .filter(p => {
      const fecha = new Date(p.created_at)
      return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual
    })
    .reduce((sum, p) => sum + parseFloat(p.monto), 0)
})

// Funciones
const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
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
    'pendiente': 'bg-yellow-100 text-yellow-700',
    'confirmado_paciente': 'bg-blue-100 text-blue-700',
    'confirmado_admin': 'bg-green-100 text-green-700',
    'rechazado': 'bg-red-100 text-red-700'
  }
  return classes[estado] || 'bg-gray-100 text-gray-700'
}

const getEstadoTexto = (estado: string) => {
  const textos: Record<string, string> = {
    'pendiente': 'Pendiente',
    'confirmado_paciente': 'Confirmado',
    'confirmado_admin': 'Verificado',
    'rechazado': 'Rechazado'
  }
  return textos[estado] || estado
}

const totalPorEstado = (estado: string) => {
  return pagos.value
    .filter(p => p.estado === estado)
    .reduce((sum, p) => sum + parseFloat(p.monto), 0)
}

const confirmarPago = async (pago: any) => {
  try {
    const userId = getUserId()
    if (!userId) {
      alert('❌ No estás autenticado')
      return
    }
    
    const { error } = await supabase
      .from('pagos' as any)
      .update({
        estado: 'confirmado_paciente',
        confirmado_por: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', pago.id)

    if (error) throw error

    alert('✅ Pago confirmado exitosamente')
    cargarPagos()
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error al confirmar pago')
  }
}

const enviarAAdministracion = async (pago: any) => {
  alert('Esta funcionalidad requiere configurar notificaciones a administración')
}

const verDetalles = (pago: any) => {
  alert(`Detalles del pago:\n\nPaciente: ${pago.paciente_nombre}\nMonto: $${pago.monto}\nEstado: ${pago.estado}\n\n(Modal de detalles en desarrollo)`)
}

const cargarPagos = async () => {
  if (!user.value) return

  cargando.value = true

  try {
    const { data, error } = await supabase
      .from('pagos' as any)
      .select(`
        *,
        paciente:paciente_id(nombre),
        terapeuta:terapeuta_id(nombre)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (data) {
      pagos.value = data.map((p: any) => ({
        ...p,
        paciente_nombre: p.paciente?.nombre || 'Sin paciente',
        terapeuta_nombre: p.terapeuta?.nombre || 'Sin terapeuta'
      }))
    }
  } catch (error) {
    console.error('Error al cargar pagos:', error)
  } finally {
    cargando.value = false
  }
}

// Cargar datos al montar
onMounted(() => {
  cargarPagos()
})
</script>
