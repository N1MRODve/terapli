<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Gestión de Terapeutas</h2>
        <p class="text-gray-600">Administrar terapeutas y crear nuevos usuarios</p>
      </div>
      <button
        @click="mostrarModalCrear = true"
        class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors"
      >
        <PlusIcon class="w-5 h-5" />
        <span>Nueva Terapeuta</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="cargando" class="flex items-center justify-center py-24">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 font-medium">Cargando terapeutas...</p>
      </div>
    </div>

    <!-- Lista de Terapeutas -->
    <div v-else class="space-y-6">
      <div
        v-for="terapeuta in terapeutas"
        :key="terapeuta.id"
        class="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between">
          <!-- Info terapeuta -->
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {{ terapeuta.iniciales }}
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ terapeuta.nombre }}</h3>
              <p class="text-gray-600">{{ terapeuta.email }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full"
                >
                  <CheckCircleIcon class="w-3 h-3" />
                  Activa
                </span>
              </div>
            </div>
          </div>

          <!-- Métricas -->
          <div class="grid grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ terapeuta.totalPacientes }}</div>
              <div class="text-sm text-gray-600">Pacientes</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-emerald-600">{{ terapeuta.citasRealizadas }}</div>
              <div class="text-sm text-gray-600">Citas realizadas</div>
            </div>
            <div class="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div class="text-lg font-bold text-blue-900">{{ formatNumber(terapeuta.revenueTerapeuta) }}</div>
              <div class="text-xs text-blue-700 font-medium">Terapeuta (70%)</div>
            </div>
            <div class="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div class="text-lg font-bold text-purple-900">{{ formatNumber(terapeuta.revenueAdmin) }}</div>
              <div class="text-xs text-purple-700 font-medium">Comisión (30%)</div>
            </div>
          </div>
        </div>

        <!-- Detalles adicionales -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-5 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Revenue total:</span>
              <span class="ml-2 font-semibold text-indigo-600">{{ formatNumber(terapeuta.revenue) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Pacientes activos:</span>
              <span class="ml-2 font-semibold text-gray-900">{{ terapeuta.pacientesActivos }}</span>
            </div>
            <div>
              <span class="text-gray-600">Ocupación:</span>
              <span class="ml-2 font-semibold text-gray-900">{{ terapeuta.ocupacion }}%</span>
            </div>
            <div>
              <span class="text-gray-600">CLTV promedio:</span>
              <span class="ml-2 font-semibold text-indigo-600">{{ formatNumber(terapeuta.cltvPromedio) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Miembro desde:</span>
              <span class="ml-2 font-semibold text-gray-900">{{ formatDate(terapeuta.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="terapeutas.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UsersIcon class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-600 mb-4">No hay terapeutas registradas</p>
        <button
          @click="mostrarModalCrear = true"
          class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
        >
          <PlusIcon class="w-5 h-5" />
          <span>Crear primera terapeuta</span>
        </button>
      </div>
    </div>

    <!-- Modal Crear Terapeuta -->
    <Teleport to="body">
      <div
        v-if="mostrarModalCrear"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="cerrarModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">Nueva Terapeuta</h3>
            <button
              @click="cerrarModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="crearTerapeuta" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                v-model="formData.nombreCompleto"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: María García López"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                v-model="formData.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="maria@example.com"
              />
            </div>

            <!-- Contraseña temporal -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña temporal
              </label>
              <input
                v-model="formData.password"
                type="password"
                required
                minlength="8"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Mínimo 8 caracteres"
              />
              <p class="text-xs text-gray-500 mt-1">
                La terapeuta deberá cambiar esta contraseña en su primer acceso
              </p>
            </div>

            <!-- Teléfono -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                v-model="formData.telefono"
                type="tel"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="+52 123 456 7890"
              />
            </div>

            <!-- Error message -->
            <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>

            <!-- Success message -->
            <div v-if="success" class="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p class="text-sm text-emerald-700">{{ success }}</p>
            </div>

            <!-- Botones -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="cerrarModal"
                class="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                :disabled="creando"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="creando"
              >
                <span v-if="!creando">Crear Terapeuta</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creando...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  UsersIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const supabase = useSupabaseClient()
const cargando = ref(true)
const mostrarModalCrear = ref(false)
const creando = ref(false)
const error = ref('')
const success = ref('')

interface TerapeutaMetricas {
  id: string
  nombre: string
  email: string
  telefono: string
  iniciales: string
  totalPacientes: number
  pacientesActivos: number
  citasRealizadas: number
  citasTotales: number
  ocupacion: number
  revenue: number
  revenueTerapeuta: number
  revenueAdmin: number
  cltvPromedio: number
  createdAt: string
}

const terapeutas = ref<TerapeutaMetricas[]>([])

const formData = ref({
  nombreCompleto: '',
  email: '',
  password: '',
  telefono: ''
})

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const cargarTerapeutas = async () => {
  try {
    cargando.value = true

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

    console.log('Datos cargados:', {
      terapeutas: terapeutasData?.length || 0,
      pacientes: pacientes?.length || 0,
      citas: citas?.length || 0,
      bonos: bonos?.length || 0,
      bonosPagados: bonos?.filter(b => b.pagado)?.length || 0
    })

    // Calcular métricas por terapeuta
    terapeutas.value = (terapeutasData || []).map(t => {
      const pacientesTerapeuta = pacientes?.filter(p => p.terapeuta_id === t.id) || []
      const citasTerapeuta = citas?.filter(c =>
        pacientesTerapeuta.some(p => p.id === c.paciente_id)
      ) || []
      const citasRealizadasTerapeuta = citasTerapeuta.filter(c => c.estado === 'realizada')
      
      // Calcular revenue desde bonos pagados
      const bonosPagadosTerapeuta = bonos?.filter(b =>
        b.pagado === true && pacientesTerapeuta.some(pac => pac.id === b.paciente_id)
      ) || []

      const revenueTerapeuta = bonosPagadosTerapeuta.reduce((sum, b) => {
        const monto = parseFloat(b.monto_total || '0')
        return sum + (isNaN(monto) ? 0 : monto)
      }, 0)

      // Contar bonos activos de este terapeuta
      const bonosActivosTerapeuta = bonos?.filter(b =>
        b.estado === 'activo' && pacientesTerapeuta.some(p => p.id === b.paciente_id)
      ) || []

      console.log(`Terapeuta ${t.nombre_completo}:`, {
        pacientes: pacientesTerapeuta.length,
        bonosPagados: bonosPagadosTerapeuta.length,
        revenue: revenueTerapeuta
      })

      return {
        id: t.id,
        nombre: t.nombre_completo || 'Sin nombre',
        email: t.email || '',
        telefono: t.telefono || '',
        iniciales: (t.nombre_completo || 'XX')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        totalPacientes: pacientesTerapeuta.length,
        pacientesActivos: bonosActivosTerapeuta.length,
        citasRealizadas: citasRealizadasTerapeuta.length,
        citasTotales: citasTerapeuta.length,
        ocupacion: citasTerapeuta.length > 0
          ? Math.round((citasRealizadasTerapeuta.length / citasTerapeuta.length) * 100)
          : 0,
        revenue: revenueTerapeuta || 0,
        revenueTerapeuta: (revenueTerapeuta || 0) * 0.70, // 70% para la terapeuta
        revenueAdmin: (revenueTerapeuta || 0) * 0.30, // 30% comisión administrativa
        cltvPromedio: pacientesTerapeuta.length > 0
          ? (revenueTerapeuta || 0) / pacientesTerapeuta.length
          : 0,
        createdAt: t.created_at
      }
    })

  } catch (error) {
    console.error('Error al cargar terapeutas:', error)
  } finally {
    cargando.value = false
  }
}

const crearTerapeuta = async () => {
  try {
    creando.value = true
    error.value = ''
    success.value = ''

    console.log('Iniciando creación de terapeuta:', formData.value.email)

    // Llamar al endpoint del servidor que tiene permisos de admin
    const response = await $fetch('/api/admin/crear-terapeuta', {
      method: 'POST',
      body: {
        nombreCompleto: formData.value.nombreCompleto,
        email: formData.value.email,
        password: formData.value.password,
        telefono: formData.value.telefono
      }
    })

    console.log('✅ Respuesta del servidor:', response)

    success.value = '¡Terapeuta creada exitosamente! Ya puede iniciar sesión en /terapeuta/login'
    
    // Limpiar formulario y recargar lista después de 2 segundos
    setTimeout(() => {
      cerrarModal()
      cargarTerapeutas()
    }, 2000)

  } catch (err: any) {
    console.error('❌ Error al crear terapeuta:', err)
    error.value = err.data?.message || err.message || 'Error al crear la terapeuta. Por favor verifica los datos.'
  } finally {
    creando.value = false
  }
}

const cerrarModal = () => {
  if (!creando.value) {
    mostrarModalCrear.value = false
    error.value = ''
    success.value = ''
    formData.value = {
      nombreCompleto: '',
      email: '',
      password: '',
      telefono: ''
    }
  }
}

onMounted(() => {
  cargarTerapeutas()
})
</script>
