<template>
  <div>
    <!-- Encabezado -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Gestión de Pacientes</h2>
      <p class="text-gray-600">Vista completa de todos los pacientes del sistema</p>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 text-sm">Cargando pacientes...</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <template v-else>
      <!-- Estadísticas rápidas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-blue-700">Total Pacientes</span>
            <UserGroupIcon class="w-5 h-5 text-blue-600" />
          </div>
          <p class="text-3xl font-bold text-blue-900">{{ pacientes.length }}</p>
        </div>

        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-green-700">Con Bono Activo</span>
            <TicketIcon class="w-5 h-5 text-green-600" />
          </div>
          <p class="text-3xl font-bold text-green-900">{{ pacientesConBonoActivo }}</p>
        </div>

        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-purple-700">CLTV Total</span>
            <CurrencyEuroIcon class="w-5 h-5 text-purple-600" />
          </div>
          <p class="text-3xl font-bold text-purple-900">{{ formatNumber(cltvTotal) }}</p>
        </div>

        <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-orange-700">CLTV Promedio</span>
            <ChartBarIcon class="w-5 h-5 text-orange-600" />
          </div>
          <p class="text-3xl font-bold text-orange-900">{{ formatNumber(cltvPromedio) }}</p>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Buscar paciente</label>
            <input
              v-model="busqueda"
              type="text"
              placeholder="Nombre o email..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por terapeuta</label>
            <select
              v-model="filtroTerapeuta"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Todos los terapeutas</option>
              <option v-for="terapeuta in terapeutasUnicos" :key="terapeuta.id" :value="terapeuta.id">
                {{ terapeuta.nombre }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Estado del bono</label>
            <select
              v-model="filtroBono"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="activo">Con bono activo</option>
              <option value="sin_bono">Sin bono activo</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabla de pacientes -->
      <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terapeuta
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bono Activo
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sesiones
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CLTV
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="paciente in pacientesFiltrados" :key="paciente.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <span class="text-white font-semibold text-sm">{{ obtenerIniciales(paciente.nombre_completo) }}</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ paciente.nombre_completo }}</div>
                      <div class="text-sm text-gray-500">{{ paciente.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ paciente.terapeuta_nombre || 'Sin asignar' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="paciente.bono_activo">
                    <div class="flex items-center">
                      <TicketIcon class="w-4 h-4 text-green-600 mr-2" />
                      <span class="text-sm font-medium text-gray-900">{{ formatTipoBono(paciente.bono_tipo) }}</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ paciente.bono_estado }}
                    </div>
                  </div>
                  <div v-else class="text-sm text-gray-400 italic">Sin bono activo</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="paciente.bono_activo" class="text-sm">
                    <span class="font-semibold text-gray-900">{{ paciente.sesiones_restantes }}</span>
                    <span class="text-gray-500"> / {{ paciente.total_sesiones }}</span>
                  </div>
                  <div v-else class="text-sm text-gray-400">-</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-indigo-600">{{ formatNumber(paciente.cltv || 0) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="paciente.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ paciente.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sin resultados -->
        <div v-if="pacientesFiltrados.length === 0" class="text-center py-12">
          <UserGroupIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500 text-sm">No se encontraron pacientes</p>
        </div>
      </div>

      <!-- Información adicional -->
      <div class="mt-6 text-sm text-gray-500 text-right">
        Mostrando {{ pacientesFiltrados.length }} de {{ pacientes.length }} pacientes
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  UserGroupIcon, 
  TicketIcon, 
  CurrencyEuroIcon, 
  ChartBarIcon 
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const supabase = useSupabaseClient()

// Estado
const cargando = ref(true)
const pacientes = ref<any[]>([])
const busqueda = ref('')
const filtroTerapeuta = ref('')
const filtroBono = ref('')

// Cargar datos
const cargarPacientes = async () => {
  try {
    cargando.value = true

    // Consulta principal para obtener pacientes con sus relaciones
    const { data: pacientesData, error: pacientesError } = await supabase
      .from('pacientes')
      .select(`
        id,
        nombre_completo,
        email,
        telefono,
        activo,
        created_at,
        terapeuta:terapeuta_id (
          id,
          nombre_completo
        )
      `)
      .order('created_at', { ascending: false })

    if (pacientesError) throw pacientesError

    // Para cada paciente, obtener su bono activo y calcular CLTV
    const pacientesConDatos = await Promise.all(
      (pacientesData || []).map(async (paciente) => {
        // Obtener bono activo
        const { data: bonoActivo, error: bonoError } = await supabase
          .from('bonos')
          .select('id, tipo_bono, estado, sesiones_totales, sesiones_restantes, monto_total')
          .eq('paciente_id', paciente.id)
          .in('estado', ['activo', 'pendiente'])
          .gt('sesiones_restantes', 0)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (bonoError && bonoError.code !== 'PGRST116') {
          console.error('Error al cargar bono para paciente', paciente.nombre_completo, ':', bonoError)
        }

        // Calcular CLTV (suma de todos los bonos pagados)
        const { data: bonosHistorico } = await supabase
          .from('bonos')
          .select('monto_total')
          .eq('paciente_id', paciente.id)
          .eq('pagado', true)

        const cltv = bonosHistorico?.reduce((sum, bono) => sum + (parseFloat(bono.monto_total) || 0), 0) || 0

        return {
          ...paciente,
          terapeuta_nombre: paciente.terapeuta?.nombre_completo || null,
          terapeuta_id: paciente.terapeuta?.id || null,
          bono_activo: !!bonoActivo,
          bono_tipo: bonoActivo?.tipo_bono || null,
          bono_estado: bonoActivo?.estado || null,
          total_sesiones: bonoActivo?.sesiones_totales || 0,
          sesiones_restantes: bonoActivo?.sesiones_restantes || 0,
          cltv
        }
      })
    )

    pacientes.value = pacientesConDatos
  } catch (error) {
    console.error('Error al cargar pacientes:', error)
  } finally {
    cargando.value = false
  }
}

// Computeds
const terapeutasUnicos = computed(() => {
  const terapeutas = new Map()
  pacientes.value.forEach(p => {
    if (p.terapeuta_id && p.terapeuta_nombre) {
      terapeutas.set(p.terapeuta_id, { id: p.terapeuta_id, nombre: p.terapeuta_nombre })
    }
  })
  return Array.from(terapeutas.values())
})

const pacientesFiltrados = computed(() => {
  let resultado = [...pacientes.value]

  // Filtro de búsqueda
  if (busqueda.value) {
    const busq = busqueda.value.toLowerCase()
    resultado = resultado.filter(p => 
      p.nombre_completo?.toLowerCase().includes(busq) ||
      p.email?.toLowerCase().includes(busq)
    )
  }

  // Filtro por terapeuta
  if (filtroTerapeuta.value) {
    resultado = resultado.filter(p => p.terapeuta_id === filtroTerapeuta.value)
  }

  // Filtro por bono
  if (filtroBono.value === 'activo') {
    resultado = resultado.filter(p => p.bono_activo)
  } else if (filtroBono.value === 'sin_bono') {
    resultado = resultado.filter(p => !p.bono_activo)
  }

  return resultado
})

const pacientesConBonoActivo = computed(() => {
  return pacientes.value.filter(p => p.bono_activo).length
})

const cltvTotal = computed(() => {
  return pacientes.value.reduce((sum, p) => sum + (p.cltv || 0), 0)
})

const cltvPromedio = computed(() => {
  if (pacientes.value.length === 0) return 0
  return cltvTotal.value / pacientes.value.length
})

// Funciones auxiliares
const formatNumber = (num: number) => {
  return num.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const obtenerIniciales = (nombre: string) => {
  if (!nombre) return '??'
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatTipoBono = (tipo: string) => {
  const tipos: Record<string, string> = {
    'semanal': 'Semanal',
    'quincenal': 'Quincenal',
    'mensual': 'Mensual',
    'otro': 'Otro'
  }
  return tipos[tipo] || tipo
}

onMounted(() => {
  cargarPacientes()
})
</script>
