<template>
  <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
    <!-- Header de la tabla con filtros -->
    <div class="bg-gradient-to-r from-purple-600 to-purple-600-light p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 class="text-2xl font-serif font-bold text-white">
          📋 Historial de Sesiones
        </h3>
        
        <!-- Filtros -->
        <div class="flex flex-wrap gap-3">
          <select
            v-model="filtroEstado"
            class="px-4 py-2 rounded-lg border border-white/30 bg-white/90 text-cafe font-sans text-sm focus:outline-none focus:ring-2 focus:ring-white"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="anulada">Anuladas</option>
            <option value="completada">Completadas</option>
          </select>

          <select
            v-model="filtroMes"
            class="px-4 py-2 rounded-lg border border-white/30 bg-white/90 text-cafe font-sans text-sm focus:outline-none focus:ring-2 focus:ring-white"
          >
            <option value="">Todos los meses</option>
            <option v-for="mes in meses" :key="mes.value" :value="mes.value">
              {{ mes.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla desktop -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-sans font-semibold text-gray-600 uppercase tracking-wider">
              Fecha
            </th>
            <th class="px-6 py-4 text-left text-xs font-sans font-semibold text-gray-600 uppercase tracking-wider">
              Paciente
            </th>
            <th class="px-6 py-4 text-left text-xs font-sans font-semibold text-gray-600 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-4 text-left text-xs font-sans font-semibold text-gray-600 uppercase tracking-wider">
              Modalidad
            </th>
            <th class="px-6 py-4 text-right text-xs font-sans font-semibold text-gray-600 uppercase tracking-wider">
              Precio Total
            </th>
            <th class="px-6 py-4 text-right text-xs font-sans font-semibold text-gray-600 uppercase tracking-wider">
              Tu parte (70%)
            </th>
            <th class="px-6 py-4 text-center text-xs font-sans font-semibold text-gray-600 uppercase tracking-wider">
              Estado
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="sesion in sesionesFiltradas"
            :key="sesion.id"
            class="hover:bg-gray-50 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm font-sans text-gray-900">
                {{ formatearFecha(sesion.fecha) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="text-sm font-sans font-medium text-gray-900">
                {{ formatearNombrePaciente(sesion.paciente_nombre || '', sesion.paciente_apellido || '') }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-sans font-medium"
                :class="obtenerClaseEstado(sesion.estado)"
              >
                {{ sesion.estado }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="text-sm font-sans text-gray-700 capitalize">
                {{ sesion.modalidad }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <span class="text-sm font-sans font-medium text-gray-900">
                {{ formatearMonto(sesion.precio_total) }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <span 
                class="text-sm font-sans font-bold"
                :class="sesion.estado === 'confirmada' ? 'text-green-600' : 'text-gray-400'"
              >
                {{ formatearMonto(calcularMontoTerapeuta(sesion)) }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="text-xl">
                {{ obtenerEmojiEstado(sesion.estado) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty state -->
      <div v-if="sesionesFiltradas.length === 0" class="text-center py-12">
        <p class="text-gray-500 font-sans text-lg">
          No se encontraron sesiones con los filtros aplicados
        </p>
      </div>
    </div>

    <!-- Lista mobile -->
    <div class="md:hidden divide-y divide-gray-100">
      <div
        v-for="sesion in sesionesFiltradas"
        :key="sesion.id"
        class="p-4 hover:bg-gray-50 transition-colors duration-150"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <p class="font-sans font-medium text-gray-900 mb-1">
              {{ formatearNombrePaciente(sesion.paciente_nombre || '', sesion.paciente_apellido || '') }}
            </p>
            <p class="text-sm text-gray-600 font-sans">
              {{ formatearFecha(sesion.fecha) }} · {{ sesion.modalidad }}
            </p>
          </div>
          <span class="text-2xl">
            {{ obtenerEmojiEstado(sesion.estado) }}
          </span>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p class="text-xs text-gray-500 font-sans uppercase tracking-wide mb-1">
              Tu parte (70%)
            </p>
            <p 
              class="text-lg font-serif font-bold"
              :class="sesion.estado === 'confirmada' ? 'text-green-600' : 'text-gray-400'"
            >
              {{ formatearMonto(calcularMontoTerapeuta(sesion)) }}
            </p>
          </div>
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-sans font-medium"
            :class="obtenerClaseEstado(sesion.estado)"
          >
            {{ sesion.estado }}
          </span>
        </div>
      </div>

      <!-- Empty state mobile -->
      <div v-if="sesionesFiltradas.length === 0" class="text-center py-12 px-4">
        <p class="text-gray-500 font-sans">
          No se encontraron sesiones
        </p>
      </div>
    </div>

    <!-- Totales -->
    <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p class="text-sm font-sans text-gray-600">
          Mostrando {{ sesionesFiltradas.length }} sesión(es)
        </p>
        <div class="flex items-center gap-6">
          <div class="text-right">
            <p class="text-xs text-gray-500 font-sans uppercase tracking-wide mb-1">
              Total visible
            </p>
            <p class="text-lg font-serif font-bold text-gray-900">
              {{ formatearMonto(calcularTotalVisible()) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-500 font-sans uppercase tracking-wide mb-1">
              Tu parte (70%)
            </p>
            <p class="text-lg font-serif font-bold text-purple-600">
              {{ formatearMonto(calcularTotalTerapeutaVisible()) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SesionDetallada, EstadoSesion } from '~/composables/useSesiones'
import { useSesiones } from '~/composables/useSesiones'

interface Props {
  sesiones: SesionDetallada[]
}

const props = defineProps<Props>()

const { 
  formatearMonto, 
  formatearFecha, 
  formatearNombrePaciente,
  obtenerEmojiEstado,
  PORCENTAJE_TERAPEUTA 
} = useSesiones()

// Estado de filtros
const filtroEstado = ref<string>('')
const filtroMes = ref<string>('')

// Meses para el selector
const meses = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
]

// Sesiones filtradas
const sesionesFiltradas = computed(() => {
  let resultado = [...props.sesiones]

  // Filtrar por estado
  if (filtroEstado.value) {
    resultado = resultado.filter(s => s.estado === filtroEstado.value)
  }

  // Filtrar por mes
  if (filtroMes.value) {
    const mesSeleccionado = parseInt(filtroMes.value)
    resultado = resultado.filter(s => {
      const fecha = new Date(s.fecha)
      return fecha.getMonth() + 1 === mesSeleccionado
    })
  }

  return resultado
})

// Calcula el monto del terapeuta para una sesión
const calcularMontoTerapeuta = (sesion: SesionDetallada): number => {
  if (sesion.estado === 'anulada') return 0
  return sesion.precio_total * PORCENTAJE_TERAPEUTA
}

// Calcula el total visible en la tabla
const calcularTotalVisible = (): number => {
  return sesionesFiltradas.value.reduce((sum, s) => {
    if (s.estado === 'anulada') return sum
    return sum + s.precio_total
  }, 0)
}

// Calcula el total del terapeuta visible
const calcularTotalTerapeutaVisible = (): number => {
  return sesionesFiltradas.value.reduce((sum, s) => {
    return sum + calcularMontoTerapeuta(s)
  }, 0)
}

// Obtiene las clases CSS según el estado
const obtenerClaseEstado = (estado: EstadoSesion): string => {
  const clases = {
    pendiente: 'bg-amber-100 text-amber-700',
    confirmada: 'bg-green-100 text-green-700',
    anulada: 'bg-red-100 text-red-700',
    completada: 'bg-blue-100 text-blue-700'
  }
  return clases[estado] || 'bg-gray-100 text-gray-700'
}
</script>
