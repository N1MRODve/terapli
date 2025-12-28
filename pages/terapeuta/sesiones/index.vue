<template>
  <div>
    <!-- Header minimalista -->
    <header class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-semibold text-gray-900">
          Sesiones
          <span class="text-gray-400 font-normal">({{ sesionesFiltradas.length }})</span>
        </h1>
        <button
          @click="navegarAAgenda"
          class="h-10 px-4 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <PlusIcon class="w-4 h-4" />
          Nueva Sesión
        </button>
      </div>

      <!-- KPI Bar compacta -->
      <div class="bg-white border border-gray-100 rounded-lg p-4 mb-4">
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <!-- Pendientes -->
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-gray-400"></span>
            <span class="text-gray-600">Pendientes:</span>
            <span class="font-semibold text-gray-900">{{ resumenFinanciero.pendientes }}</span>
            <span class="text-gray-400">({{ formatearPrecio(resumenFinanciero.montoPendiente) }}€)</span>
          </div>

          <span class="hidden sm:block text-gray-200">|</span>

          <!-- Confirmadas -->
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500"></span>
            <span class="text-gray-600">Confirmadas:</span>
            <span class="font-semibold text-gray-900">{{ resumenFinanciero.confirmadas }}</span>
            <span class="text-gray-400">({{ formatearPrecio(resumenFinanciero.montoConfirmado) }}€)</span>
          </div>

          <span class="hidden sm:block text-gray-200">|</span>

          <!-- Realizadas -->
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-600"></span>
            <span class="text-gray-600">Realizadas:</span>
            <span class="font-semibold text-gray-900">{{ resumenFinanciero.completadas }}</span>
            <span class="text-gray-400">({{ formatearPrecio(resumenFinanciero.montoCompletado) }}€)</span>
          </div>

          <span class="hidden sm:block text-gray-200">|</span>

          <!-- Canceladas -->
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-red-500"></span>
            <span class="text-gray-600">Canceladas:</span>
            <span class="font-semibold text-gray-900">{{ resumenFinanciero.canceladas }}</span>
          </div>

          <!-- Total por cobrar -->
          <div class="ml-auto flex items-center gap-2 pl-4 border-l border-gray-200">
            <span class="text-gray-600">Por cobrar:</span>
            <span class="font-bold text-green-600 text-base">{{ formatearPrecio(totalPorCobrar) }}€</span>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="space-y-3">
        <!-- Buscador y filtros inline -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Búsqueda -->
          <div class="relative flex-1 min-w-[200px] max-w-md">
            <input
              v-model="filtros.busqueda"
              type="text"
              placeholder="Buscar sesión..."
              class="w-full h-10 px-4 pl-9 bg-white border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <!-- Quick filters - Período -->
          <div class="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              v-for="periodo in periodos"
              :key="periodo.valor"
              @click="filtros.periodo = periodo.valor"
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
              :class="filtros.periodo === periodo.valor
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'"
            >
              {{ periodo.label }}
            </button>
          </div>

          <!-- Filtro estado -->
          <select
            v-model="filtros.estado"
            class="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="realizada">Realizadas</option>
            <option value="cancelada">Canceladas</option>
          </select>

          <!-- Limpiar filtros -->
          <button
            v-if="tieneFiltrosActivos"
            @click="limpiarFiltros"
            class="h-10 px-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="cargando" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
      <ExclamationTriangleIcon class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p class="font-medium text-red-800">Error al cargar sesiones</p>
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>
    </div>

    <!-- Contenido -->
    <div v-else>
      <!-- Empty State -->
      <div v-if="sesionesFiltradas.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <CalendarDaysIcon class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">
          {{ tieneFiltrosActivos ? 'Sin resultados' : 'Sin sesiones' }}
        </h3>
        <p class="text-sm text-gray-500 mb-4 max-w-sm">
          {{ tieneFiltrosActivos
            ? 'Prueba ajustando los filtros de búsqueda'
            : 'Programa tu primera sesión desde la agenda' }}
        </p>
        <button
          v-if="!tieneFiltrosActivos"
          @click="navegarAAgenda"
          class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Ir a la agenda
        </button>
        <button
          v-else
          @click="limpiarFiltros"
          class="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Tabla de Sesiones -->
      <div v-else class="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50/50">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bono</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th class="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="sesion in sesionesFiltradas"
                :key="sesion.id"
                class="hover:bg-gray-50/50 transition-colors cursor-pointer"
                @click="verDetalles(sesion)"
              >
                <!-- Fecha -->
                <td class="px-4 py-3">
                  <div class="text-sm font-medium text-gray-900">{{ formatearFechaCorta(sesion.fecha_cita) }}</div>
                  <div class="text-xs text-gray-500">{{ formatearHora(sesion.hora_inicio) }}</div>
                </td>

                <!-- Paciente -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    >
                      {{ obtenerIniciales(sesion.paciente?.nombre_completo || 'NN') }}
                    </div>
                    <div class="min-w-0">
                      <div class="text-sm font-medium text-gray-900 truncate">
                        {{ sesion.paciente?.nombre_completo || 'Sin nombre' }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Tipo -->
                <td class="px-4 py-3">
                  <span class="text-sm text-gray-600">
                    {{ sesion.modalidad === 'online' ? 'Online' : 'Presencial' }}
                  </span>
                </td>

                <!-- Estado -->
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center gap-1.5 text-sm"
                    :class="obtenerColorTextoEstado(sesion.estado)"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="obtenerColorPuntoEstado(sesion.estado)"></span>
                    {{ obtenerTextoEstado(sesion.estado) }}
                  </span>
                </td>

                <!-- Bono -->
                <td class="px-4 py-3">
                  <div v-if="sesion.bono" class="text-sm">
                    <span class="text-gray-700">{{ sesion.bono.sesiones_restantes }}/{{ sesion.bono.sesiones_totales }}</span>
                    <span
                      v-if="sesion.bono.pagado"
                      class="ml-1.5 text-xs text-green-600 font-medium"
                    >Pagado</span>
                    <span
                      v-else
                      class="ml-1.5 text-xs text-amber-600 font-medium"
                    >Pend.</span>
                  </div>
                  <span v-else class="text-sm text-gray-400">—</span>
                </td>

                <!-- Monto -->
                <td class="px-4 py-3 text-right">
                  <div class="text-sm font-medium text-gray-900">
                    {{ formatearPrecio(sesion.precio_estimado || PRECIO_SESION_DEFAULT) }}€
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatearPrecio((sesion.precio_estimado || PRECIO_SESION_DEFAULT) * 0.7) }}€ tu parte
                  </div>
                </td>

                <!-- Acción -->
                <td class="px-4 py-3 text-right">
                  <ChevronRightIcon class="w-4 h-4 text-gray-400" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagos confirmados (colapsado por defecto) -->
      <div v-if="bonosPagados.length > 0" class="mt-6">
        <button
          @click="mostrarPagosConfirmados = !mostrarPagosConfirmados"
          class="w-full flex items-center justify-between px-4 py-3 bg-green-50 border border-green-100 rounded-lg text-left hover:bg-green-100/50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <CheckCircleIcon class="w-4 h-4 text-white" />
            </div>
            <div>
              <span class="font-medium text-green-800">Pagos confirmados</span>
              <span class="text-sm text-green-600 ml-2">{{ bonosPagados.length }} bonos · {{ formatearPrecio(totalConfirmadoTerapeuta) }}€</span>
            </div>
          </div>
          <ChevronDownIcon
            class="w-5 h-5 text-green-600 transition-transform"
            :class="{ 'rotate-180': mostrarPagosConfirmados }"
          />
        </button>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[1000px]"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 max-h-[1000px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-show="mostrarPagosConfirmados" class="mt-2 bg-white border border-gray-100 rounded-lg overflow-hidden">
            <div class="divide-y divide-gray-50">
              <div
                v-for="pago in bonosPagados"
                :key="pago.bono_id"
                class="px-4 py-3 flex items-center gap-4 hover:bg-gray-50/50"
              >
                <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-semibold">
                  {{ obtenerIniciales(pago.paciente_nombre || 'NN') }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ pago.paciente_nombre }}</div>
                  <div class="text-xs text-gray-500">{{ pago.tipo_bono || 'Bono' }} · {{ pago.sesiones_usadas }}/{{ pago.bono_sesiones_totales }} sesiones</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold text-green-600">{{ formatearPrecio(pago.monto_total_terapeuta) }}€</div>
                  <div class="text-xs text-gray-500">{{ formatearFecha(pago.bono_fecha_pago) }}</div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
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
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import ModalDetallesCita from '~/components/ModalDetallesCita.vue'

definePageMeta({
  layout: 'terapeuta',
  middleware: 'auth'
})

const PRECIO_SESION_DEFAULT = 50

const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Estado
const cargando = ref(true)
const error = ref<string | null>(null)
const sesiones = ref<any[]>([])
const bonosPagadosDirectos = ref<any[]>([])
const mostrarPagosConfirmados = ref(false)
const mostrarModalDetalles = ref(false)
const citaSeleccionada = ref<string | null>(null)

const filtros = ref({
  busqueda: '',
  estado: '',
  periodo: 'todos'
})

const periodos = [
  { valor: 'hoy', label: 'Hoy' },
  { valor: 'semana', label: 'Semana' },
  { valor: 'mes', label: 'Mes' },
  { valor: 'todos', label: 'Todos' }
]

// Computed
const tieneFiltrosActivos = computed(() => {
  return filtros.value.busqueda !== '' ||
    filtros.value.estado !== '' ||
    filtros.value.periodo !== 'todos'
})

const sesionesFiltradas = computed(() => {
  let resultado = [...sesiones.value]

  // Búsqueda
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(s =>
      s.paciente?.nombre_completo?.toLowerCase().includes(busqueda)
    )
  }

  // Estado
  if (filtros.value.estado) {
    resultado = resultado.filter(s => s.estado === filtros.value.estado)
  }

  // Período
  const ahora = new Date()
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())

  if (filtros.value.periodo === 'hoy') {
    resultado = resultado.filter(s => {
      const fecha = new Date(s.fecha_cita)
      return fecha.toDateString() === hoy.toDateString()
    })
  } else if (filtros.value.periodo === 'semana') {
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1) // Lunes
    const finSemana = new Date(inicioSemana)
    finSemana.setDate(inicioSemana.getDate() + 6) // Domingo
    resultado = resultado.filter(s => {
      const fecha = new Date(s.fecha_cita)
      return fecha >= inicioSemana && fecha <= finSemana
    })
  } else if (filtros.value.periodo === 'mes') {
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0)
    resultado = resultado.filter(s => {
      const fecha = new Date(s.fecha_cita)
      return fecha >= inicioMes && fecha <= finMes
    })
  }

  // Ordenar por fecha
  resultado.sort((a, b) => {
    const fechaA = new Date(a.fecha_cita + 'T' + a.hora_inicio)
    const fechaB = new Date(b.fecha_cita + 'T' + b.hora_inicio)
    return fechaB.getTime() - fechaA.getTime()
  })

  return resultado
})

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
    const montoTerapeuta = sesion.monto_terapeuta || (sesion.precio_estimado || PRECIO_SESION_DEFAULT) * 0.7

    switch (sesion.estado) {
      case 'pendiente':
        resultado.pendientes++
        if (sesion.esta_pagado || sesion.bono?.pagado) {
          resultado.montoConfirmado += montoTerapeuta
        } else {
          resultado.montoPendiente += montoTerapeuta
        }
        break
      case 'confirmada':
        resultado.confirmadas++
        if (sesion.esta_pagado || sesion.bono?.pagado) {
          resultado.montoConfirmado += montoTerapeuta
        } else {
          resultado.montoPendiente += montoTerapeuta
        }
        break
      case 'realizada':
      case 'completada':
        resultado.completadas++
        if (sesion.esta_pagado || sesion.bono?.pagado) {
          resultado.montoConfirmado += montoTerapeuta
        } else {
          resultado.montoCompletado += montoTerapeuta
        }
        break
      case 'cancelada':
        resultado.canceladas++
        resultado.montoCancelado += montoTerapeuta
        break
    }
  })

  return resultado
})

const totalPorCobrar = computed(() => {
  return resumenFinanciero.value.montoCompletado + resumenFinanciero.value.montoPendiente
})

const bonosPagados = computed(() => {
  return bonosPagadosDirectos.value.map(bono => {
    const sesionesUsadas = (bono.sesiones_totales || 0) - (bono.sesiones_restantes || 0)
    const montoTerapeuta = bono.monto_total * 0.7

    return {
      bono_id: bono.id,
      paciente_nombre: bono.paciente_nombre,
      bono_sesiones_totales: bono.sesiones_totales,
      bono_monto_total: bono.monto_total,
      bono_fecha_pago: bono.fecha_pago,
      tipo_bono: bono.tipo_bono || 'Estándar',
      sesiones_usadas: sesionesUsadas,
      monto_total_terapeuta: montoTerapeuta
    }
  }).sort((a, b) => {
    const fechaA = new Date(a.bono_fecha_pago || 0)
    const fechaB = new Date(b.bono_fecha_pago || 0)
    return fechaB.getTime() - fechaA.getTime()
  })
})

const totalConfirmadoTerapeuta = computed(() => {
  return bonosPagados.value.reduce((total, bono) => total + (bono.monto_total_terapeuta || 0), 0)
})

// Métodos
const limpiarFiltros = () => {
  filtros.value = { busqueda: '', estado: '', periodo: 'todos' }
}

const navegarAAgenda = () => {
  router.push('/terapeuta/agenda')
}

const cargarSesiones = async () => {
  try {
    cargando.value = true
    error.value = null

    let intentos = 0
    while (!user.value && intentos < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      intentos++
    }

    if (!user.value) throw new Error('Usuario no autenticado')

    const { data: terapeuta, error: errorTerapeuta } = await supabase
      .from('terapeutas')
      .select('id')
      .eq('email', user.value.email)
      .single()

    if (errorTerapeuta) throw errorTerapeuta
    if (!terapeuta) throw new Error('No se encontró el terapeuta')

    // Usar vista_agenda_terapeutas que ya existe y tiene todos los datos
    const { data, error: errorSesiones } = await supabase
      .from('vista_agenda_terapeutas')
      .select('*')
      .eq('terapeuta_id', terapeuta.id)
      .order('fecha_cita', { ascending: false })

    if (errorSesiones) throw errorSesiones

    sesiones.value = (data || []).map(sesion => ({
      id: sesion.cita_id,
      fecha_cita: sesion.fecha_cita,
      hora_inicio: sesion.hora_inicio,
      hora_fin: sesion.hora_fin,
      duracion_minutos: sesion.duracion_minutos,
      modalidad: sesion.modalidad,
      estado: sesion.estado,
      observaciones: sesion.observaciones,
      notas_terapeuta: sesion.notas_terapeuta,
      precio_estimado: sesion.cita_metadata?.precio_sesion || PRECIO_SESION_DEFAULT,
      esta_pagado: sesion.cita_metadata?.metodo_pago === 'bono' || sesion.bono_estado === 'activo',
      paciente: {
        id: sesion.paciente_id,
        nombre_completo: sesion.paciente_nombre,
        email: sesion.paciente_email
      },
      bono: sesion.bono_id ? {
        id: sesion.bono_id,
        sesiones_totales: sesion.bono_sesiones_totales,
        sesiones_restantes: sesion.bono_sesiones_restantes,
        pagado: sesion.bono_estado === 'activo' || sesion.bono_estado === 'pagado'
      } : null
    }))

  } catch (err: any) {
    error.value = err.message || 'Error desconocido'
  } finally {
    cargando.value = false
  }
}

const cargarBonosPagados = async () => {
  try {
    if (!user.value) return

    const { data: terapeuta } = await supabase
      .from('terapeutas')
      .select('id')
      .eq('email', user.value.email)
      .single()

    if (!terapeuta) return

    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id')
      .eq('terapeuta_id', terapeuta.id)

    if (!pacientes || pacientes.length === 0) {
      bonosPagadosDirectos.value = []
      return
    }

    const { data: bonos } = await supabase
      .from('bonos')
      .select(`
        id,
        paciente_id,
        sesiones_totales,
        sesiones_restantes,
        monto_total,
        tipo_bono,
        fecha_pago,
        pagado,
        paciente:pacientes!bonos_paciente_id_fkey (
          nombre_completo
        )
      `)
      .eq('pagado', true)
      .in('paciente_id', pacientes.map(p => p.id))
      .order('fecha_pago', { ascending: false })

    bonosPagadosDirectos.value = (bonos || []).map(bono => ({
      ...bono,
      paciente_nombre: bono.paciente?.nombre_completo
    }))

  } catch (err) {
    console.error('Error cargando bonos:', err)
  }
}

const verDetalles = (sesion: any) => {
  citaSeleccionada.value = sesion.id
  mostrarModalDetalles.value = true
}

const cerrarModalDetalles = () => {
  mostrarModalDetalles.value = false
  citaSeleccionada.value = null
}

// Helpers
const formatearPrecio = (precio: number) => precio?.toFixed(2) || '0.00'

const formatearFecha = (fecha: string) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatearFechaCorta = (fecha: string) => {
  if (!fecha) return '-'
  const date = new Date(fecha + 'T00:00:00')
  const hoy = new Date()
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)

  if (date.toDateString() === hoy.toDateString()) return 'Hoy'
  if (date.toDateString() === ayer.toDateString()) return 'Ayer'

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const formatearHora = (hora: string) => hora?.substring(0, 5) || '-'

const obtenerIniciales = (nombre: string) => {
  return nombre?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??'
}

const obtenerTextoEstado = (estado: string) => {
  const textos: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    realizada: 'Realizada',
    completada: 'Realizada',
    cancelada: 'Cancelada'
  }
  return textos[estado] || estado
}

const obtenerColorTextoEstado = (estado: string) => {
  const colores: Record<string, string> = {
    pendiente: 'text-gray-600',
    confirmada: 'text-green-600',
    realizada: 'text-green-700',
    completada: 'text-green-700',
    cancelada: 'text-red-600'
  }
  return colores[estado] || 'text-gray-600'
}

const obtenerColorPuntoEstado = (estado: string) => {
  const colores: Record<string, string> = {
    pendiente: 'bg-gray-400',
    confirmada: 'bg-green-500',
    realizada: 'bg-green-600',
    completada: 'bg-green-600',
    cancelada: 'bg-red-500'
  }
  return colores[estado] || 'bg-gray-400'
}

// Lifecycle
onMounted(() => {
  cargarSesiones()
  cargarBonosPagados()
})
</script>
