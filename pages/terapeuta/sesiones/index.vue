<template>
  <div class="min-h-screen bg-base-bg">
    <!-- Encabezado -->
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-cafe mb-2">
        Gestión de Sesiones
      </h1>
      <p class="text-terracota">
        Visualiza y gestiona todas tus sesiones con información financiera
      </p>
    </div>

    <!-- Cards de Resumen Financiero -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Sesiones Pendientes -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">⏳</span>
          </div>
          <span class="text-sm font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
            Pendientes
          </span>
        </div>
        <p class="text-sm text-cafe/60 mb-1">Sesiones pendientes</p>
        <p class="text-3xl font-bold text-cafe mb-2">{{ resumenFinanciero.pendientes }}</p>
        <div class="pt-3 border-t border-gray-100">
          <p class="text-xs text-cafe/50 mb-1">Monto estimado</p>
          <p class="text-xl font-semibold text-yellow-600">
            {{ formatearPrecio(resumenFinanciero.montoPendiente) }}€
          </p>
        </div>
      </div>

      <!-- Sesiones Confirmadas -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">✓</span>
          </div>
          <span class="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
            Confirmadas
          </span>
        </div>
        <p class="text-sm text-cafe/60 mb-1">Sesiones confirmadas</p>
        <p class="text-3xl font-bold text-cafe mb-2">{{ resumenFinanciero.confirmadas }}</p>
        <div class="pt-3 border-t border-gray-100">
          <p class="text-xs text-cafe/50 mb-1">Monto asegurado</p>
          <p class="text-xl font-semibold text-green-600">
            {{ formatearPrecio(resumenFinanciero.montoConfirmado) }}€
          </p>
        </div>
      </div>

      <!-- Sesiones Completadas -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">✔️</span>
          </div>
          <span class="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Completadas
          </span>
        </div>
        <p class="text-sm text-cafe/60 mb-1">Sesiones realizadas</p>
        <p class="text-3xl font-bold text-cafe mb-2">{{ resumenFinanciero.completadas }}</p>
        <div class="pt-3 border-t border-gray-100">
          <p class="text-xs text-cafe/50 mb-1">Monto por cobrar</p>
          <p class="text-xl font-semibold text-blue-600">
            {{ formatearPrecio(resumenFinanciero.montoCompletado) }}€
          </p>
        </div>
      </div>

      <!-- Sesiones Canceladas -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">✕</span>
          </div>
          <span class="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
            Canceladas
          </span>
        </div>
        <p class="text-sm text-cafe/60 mb-1">Sesiones canceladas</p>
        <p class="text-3xl font-bold text-cafe mb-2">{{ resumenFinanciero.canceladas }}</p>
        <div class="pt-3 border-t border-gray-100">
          <p class="text-xs text-cafe/50 mb-1">Monto perdido</p>
          <p class="text-xl font-semibold text-red-600">
            {{ formatearPrecio(resumenFinanciero.montoCancelado) }}€
          </p>
        </div>
      </div>
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Búsqueda -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-cafe mb-2">
            Buscar paciente
          </label>
          <div class="relative">
            <input
              v-model="filtros.busqueda"
              type="text"
              placeholder="Nombre del paciente..."
              class="w-full px-4 py-2 pl-10 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20"
            />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-cafe/50">
              🔍
            </span>
          </div>
        </div>

        <!-- Filtro por Estado -->
        <div>
          <label class="block text-sm font-medium text-cafe mb-2">
            Estado
          </label>
          <select
            v-model="filtros.estado"
            class="w-full px-4 py-2 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20 text-cafe"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="realizada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        <!-- Filtro por Mes -->
        <div>
          <label class="block text-sm font-medium text-cafe mb-2">
            Período
          </label>
          <select
            v-model="filtros.periodo"
            class="w-full px-4 py-2 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20 text-cafe"
          >
            <option value="mes-actual">Mes actual</option>
            <option value="mes-anterior">Mes anterior</option>
            <option value="trimestre">Último trimestre</option>
            <option value="todos">Todos</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="cargando" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-terracota mb-4"></div>
        <p class="text-cafe/60">Cargando sesiones...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
      <div class="flex items-start gap-3">
        <span class="text-2xl">⚠️</span>
        <div>
          <h3 class="font-semibold text-red-800 mb-1">Error al cargar sesiones</h3>
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Lista de Sesiones -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Header de la tabla -->
      <div class="bg-gray-50 border-b border-gray-100 px-6 py-4">
        <h3 class="font-semibold text-cafe">
          Listado de Sesiones
          <span class="text-sm font-normal text-cafe/60 ml-2">
            ({{ sesionesFiltradas.length }} sesiones)
          </span>
        </h3>
      </div>

      <!-- Empty State -->
      <div v-if="sesionesFiltradas.length === 0" class="p-12 text-center">
        <span class="text-6xl mb-4 block">📅</span>
        <h3 class="text-lg font-semibold text-cafe mb-2">
          No hay sesiones para mostrar
        </h3>
        <p class="text-cafe/60 mb-6">
          {{ filtros.busqueda || filtros.estado 
            ? 'Intenta ajustar los filtros de búsqueda' 
            : 'No tienes sesiones programadas aún' }}
        </p>
      </div>

      <!-- Tabla de Sesiones -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Hora
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Paciente
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Modalidad
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Bono
              </th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Monto
              </th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr
              v-for="sesion in sesionesFiltradas"
              :key="sesion.id"
              class="hover:bg-gray-50 transition-colors duration-150"
            >
              <!-- Fecha -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-cafe">
                  {{ formatearFecha(sesion.fecha_cita) }}
                </div>
                <div class="text-xs text-cafe/50">
                  {{ formatearDiaSemana(sesion.fecha_cita) }}
                </div>
              </td>

              <!-- Hora -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-cafe">
                  {{ formatearHora(sesion.hora_inicio) }}
                </div>
                <div class="text-xs text-cafe/50">
                  {{ sesion.duracion_minutos || 50 }} min
                </div>
              </td>

              <!-- Paciente -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-terracota/20 text-terracota flex items-center justify-center font-semibold text-sm flex-shrink-0"
                  >
                    {{ obtenerIniciales(sesion.paciente?.nombre_completo || 'NN') }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-cafe">
                      {{ sesion.paciente?.nombre_completo || 'Sin nombre' }}
                    </div>
                    <div v-if="sesion.paciente?.email" class="text-xs text-cafe/50">
                      {{ sesion.paciente.email }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Modalidad -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                    sesion.modalidad === 'online' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-purple-50 text-purple-700'
                  ]"
                >
                  <span>{{ sesion.modalidad === 'online' ? '💻' : '🏢' }}</span>
                  {{ sesion.modalidad === 'online' ? 'Online' : 'Presencial' }}
                </span>
              </td>

              <!-- Estado -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
                    obtenerClaseEstado(sesion.estado)
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="obtenerColorPuntoEstado(sesion.estado)"></span>
                  {{ obtenerTextoEstado(sesion.estado) }}
                </span>
              </td>

              <!-- Bono -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="sesion.bono" class="text-xs">
                  <div class="flex items-center gap-1 text-green-600">
                    <span>✓</span>
                    <span>Con bono</span>
                  </div>
                  <div class="text-cafe/50 mt-0.5">
                    {{ sesion.bono.sesiones_restantes || 0 }}/{{ sesion.bono.sesiones_totales || 0 }} restantes
                  </div>
                </div>
                <div v-else class="text-xs text-cafe/50">
                  Sin bono
                </div>
              </td>

              <!-- Monto -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-sm font-semibold text-cafe">
                  {{ formatearPrecio(sesion.precio_estimado || PRECIO_SESION_DEFAULT) }}€
                </div>
                <div class="text-xs text-cafe/50">
                  Tu parte: {{ formatearPrecio((sesion.precio_estimado || PRECIO_SESION_DEFAULT) * 0.7) }}€
                </div>
              </td>

              <!-- Acciones -->
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <button
                  @click="verDetalles(sesion)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-terracota hover:bg-terracota/10 rounded-lg transition-colors duration-200"
                >
                  <span>👁️</span>
                  Ver detalles
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Detalles -->
    <ModalDetallesCita
      :is-open="mostrarModalDetalles"
      :cita-id="citaSeleccionada"
      @close="cerrarModalDetalles"
      @actualizado="cargarSesiones"
      @eliminado="cargarSesiones"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ModalDetallesCita from '~/components/ModalDetallesCita.vue'

definePageMeta({
  layout: 'terapeuta',
  middleware: 'auth'
})

// Constantes
const PRECIO_SESION_DEFAULT = 50

// Composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Estado
const cargando = ref(true)
const error = ref<string | null>(null)
const sesiones = ref<any[]>([])
const filtros = ref({
  busqueda: '',
  estado: '',
  periodo: 'todos'
})
const mostrarModalDetalles = ref(false)
const citaSeleccionada = ref<string | null>(null)

// Computed - Filtrar sesiones
const sesionesFiltradas = computed(() => {
  let resultado = [...sesiones.value]

  // Filtrar por búsqueda
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(s => 
      s.paciente?.nombre_completo?.toLowerCase().includes(busqueda)
    )
  }

  // Filtrar por estado
  if (filtros.value.estado) {
    resultado = resultado.filter(s => s.estado === filtros.value.estado)
  }

  // Filtrar por período
  const ahora = new Date()
  if (filtros.value.periodo === 'mes-actual') {
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0)
    resultado = resultado.filter(s => {
      const fecha = new Date(s.fecha_cita)
      return fecha >= inicioMes && fecha <= finMes
    })
  } else if (filtros.value.periodo === 'mes-anterior') {
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth(), 0)
    resultado = resultado.filter(s => {
      const fecha = new Date(s.fecha_cita)
      return fecha >= inicioMes && fecha <= finMes
    })
  } else if (filtros.value.periodo === 'trimestre') {
    const hace3Meses = new Date(ahora)
    hace3Meses.setMonth(ahora.getMonth() - 3)
    resultado = resultado.filter(s => {
      const fecha = new Date(s.fecha_cita)
      return fecha >= hace3Meses
    })
  }

  // Ordenar por fecha (más recientes primero)
  resultado.sort((a, b) => {
    const fechaA = new Date(a.fecha_cita + 'T' + a.hora_inicio)
    const fechaB = new Date(b.fecha_cita + 'T' + b.hora_inicio)
    return fechaB.getTime() - fechaA.getTime()
  })

  return resultado
})

// Computed - Resumen financiero
const resumenFinanciero = computed(() => {
  const resultado = {
    pendientes: 0,
    confirmadas: 0,
    completadas: 0,
    canceladas: 0,
    montoPendiente: 0,
    montoConfirmado: 0,
    montoCompletado: 0,
    montoCancelado: 0
  }

  sesionesFiltradas.value.forEach(sesion => {
    const monto = sesion.precio_estimado || PRECIO_SESION_DEFAULT
    const monteTerapeuta = monto * 0.7

    switch (sesion.estado) {
      case 'pendiente':
        resultado.pendientes++
        resultado.montoPendiente += monteTerapeuta
        break
      case 'confirmada':
        resultado.confirmadas++
        resultado.montoConfirmado += monteTerapeuta
        break
      case 'realizada':
      case 'completada':
        resultado.completadas++
        resultado.montoCompletado += monteTerapeuta
        break
      case 'cancelada':
        resultado.canceladas++
        resultado.montoCancelado += monteTerapeuta
        break
    }
  })

  return resultado
})

// Cargar sesiones
const cargarSesiones = async () => {
  try {
    cargando.value = true
    error.value = null

    // Esperar a que el usuario esté disponible
    let intentos = 0
    while (!user.value && intentos < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      intentos++
    }

    if (!user.value) {
      throw new Error('Usuario no autenticado')
    }

    console.log('👤 Usuario verificado:', user.value.id)

    // Obtener el terapeuta usando el email del usuario
    const { data: terapeuta, error: errorTerapeuta } = await supabase
      .from('terapeutas')
      .select('id')
      .eq('email', user.value.email)
      .single()

    if (errorTerapeuta) {
      console.error('❌ Error al buscar terapeuta:', errorTerapeuta)
      throw errorTerapeuta
    }
    
    if (!terapeuta) {
      throw new Error('No se encontró el terapeuta asociado a este usuario')
    }
    
    console.log('🔍 Terapeuta encontrado:', terapeuta)

    // Cargar todas las citas del terapeuta con información del paciente y bono
    const { data, error: errorCitas } = await supabase
      .from('citas')
      .select(`
        *,
        paciente:pacientes!citas_paciente_id_fkey (
          id,
          nombre_completo,
          email,
          telefono
        ),
        bono:bonos!citas_bono_id_fkey (
          id,
          sesiones_totales,
          sesiones_restantes
        )
      `)
      .eq('terapeuta_id', terapeuta.id)
      .order('fecha_cita', { ascending: false })

    if (errorCitas) {
      console.error('❌ Error al cargar citas:', errorCitas)
      throw errorCitas
    }
    
    console.log('📅 Citas cargadas:', data?.length || 0, data)

    // Asignar precio estimado (50€ por defecto o calcular según tipo)
    sesiones.value = (data || []).map(sesion => {
      console.log('🔍 Sesión individual:', {
        id: sesion.id,
        bono_id: sesion.bono_id,
        bono: sesion.bono,
        paciente: sesion.paciente?.nombre_completo
      })
      return {
        ...sesion,
        precio_estimado: PRECIO_SESION_DEFAULT
      }
    })
    
    console.log('✅ Sesiones procesadas:', sesiones.value.length)

  } catch (err: any) {
    console.error('Error al cargar sesiones:', err)
    error.value = err.message || 'Error desconocido al cargar las sesiones'
  } finally {
    cargando.value = false
  }
}

// Ver detalles de sesión
const verDetalles = (sesion: any) => {
  citaSeleccionada.value = sesion.id
  mostrarModalDetalles.value = true
}

// Cerrar modal de detalles
const cerrarModalDetalles = () => {
  mostrarModalDetalles.value = false
  citaSeleccionada.value = null
}

// Formatear precio
const formatearPrecio = (precio: number) => {
  return precio.toFixed(2)
}

// Formatear fecha
const formatearFecha = (fecha: string) => {
  const date = new Date(fecha + 'T00:00:00')
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Formatear día de la semana
const formatearDiaSemana = (fecha: string) => {
  const date = new Date(fecha + 'T00:00:00')
  return date.toLocaleDateString('es-ES', {
    weekday: 'long'
  })
}

// Formatear hora
const formatearHora = (hora: string) => {
  if (!hora) return '-'
  return hora.substring(0, 5) // HH:MM
}

// Obtener iniciales
const obtenerIniciales = (nombre: string) => {
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Obtener clase CSS del estado
const obtenerClaseEstado = (estado: string) => {
  const clases = {
    pendiente: 'bg-yellow-50 text-yellow-700',
    confirmada: 'bg-green-50 text-green-700',
    realizada: 'bg-blue-50 text-blue-700',
    completada: 'bg-blue-50 text-blue-700',
    cancelada: 'bg-red-50 text-red-700'
  }
  return clases[estado as keyof typeof clases] || 'bg-gray-50 text-gray-700'
}

// Obtener color del punto de estado
const obtenerColorPuntoEstado = (estado: string) => {
  const colores = {
    pendiente: 'bg-yellow-500',
    confirmada: 'bg-green-500',
    realizada: 'bg-blue-500',
    completada: 'bg-blue-500',
    cancelada: 'bg-red-500'
  }
  return colores[estado as keyof typeof colores] || 'bg-gray-500'
}

// Obtener texto del estado
const obtenerTextoEstado = (estado: string) => {
  const textos = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    realizada: 'Completada',
    completada: 'Completada',
    cancelada: 'Cancelada'
  }
  return textos[estado as keyof typeof textos] || estado
}

// Lifecycle
onMounted(() => {
  cargarSesiones()
})
</script>
