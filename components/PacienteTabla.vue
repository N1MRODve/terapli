<template>
  <div>
    <!-- Vista de tabla para desktop -->
    <div class="hidden md:block overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paciente
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              Próxima cita
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              Última sesión
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bono
            </th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr
            v-for="paciente in pacientes"
            :key="paciente.id"
            class="hover:bg-gray-50 cursor-pointer transition-colors"
            @click="$emit('ver-ficha', paciente)"
          >
            <!-- Paciente -->
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  :style="{ backgroundColor: getAvatarColor(paciente) }"
                >
                  {{ getIniciales(paciente.nombre) }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                    {{ paciente.nombre || 'Sin nombre' }}
                  </p>
                  <p v-if="paciente.area_de_acompanamiento" class="text-xs text-gray-500 truncate max-w-[200px]">
                    {{ paciente.area_de_acompanamiento }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Estado -->
            <td class="px-4 py-3 whitespace-nowrap">
              <span
                class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                :class="getEstadoClasses(paciente)"
              >
                {{ getEstadoTexto(paciente) }}
              </span>
            </td>

            <!-- Próxima cita -->
            <td class="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
              <div v-if="paciente.proxima_sesion" class="flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                <span class="text-sm text-gray-900">{{ formatProximaCita(paciente.proxima_sesion) }}</span>
              </div>
              <span v-else class="text-sm text-amber-600 font-medium">Sin cita</span>
            </td>

            <!-- Última sesión -->
            <td class="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
              <div class="flex items-center gap-1.5">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="getUltimaSesionIndicador(paciente)"
                ></div>
                <span class="text-sm" :class="getUltimaSesionTextClass(paciente)">
                  {{ formatUltimaSesion(paciente.ultima_sesion) }}
                </span>
              </div>
            </td>

            <!-- Bono -->
            <td class="px-4 py-3 whitespace-nowrap">
              <template v-if="paciente.bono_activo">
                <div class="flex items-center gap-2">
                  <!-- Mini barra de progreso -->
                  <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full"
                      :class="getBonoBarClass(paciente.bono_activo)"
                      :style="{ width: getBonoPercent(paciente.bono_activo) + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs font-medium" :class="getBonoTextClass(paciente.bono_activo)">
                    {{ paciente.bono_activo.sesiones_restantes }}/{{ paciente.bono_activo.sesiones_totales }}
                  </span>
                </div>
              </template>
              <span v-else class="text-xs text-gray-400">—</span>
            </td>

            <!-- Acciones -->
            <td class="px-4 py-3 whitespace-nowrap text-right">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click.stop="$emit('editar', paciente)"
                  class="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                  title="Editar"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  @click.stop="$emit('gestionar-bonos', paciente)"
                  class="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                  title="Bonos"
                >
                  <TicketIcon class="w-4 h-4" />
                </button>
                <button
                  @click.stop="$emit('ver-preview', paciente)"
                  class="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                  title="Vista rápida"
                >
                  <EyeIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vista de cards para móvil y tablet -->
    <div class="md:hidden divide-y divide-gray-100">
      <div
        v-for="paciente in pacientes"
        :key="paciente.id"
        class="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
        @click="$emit('ver-ficha', paciente)"
      >
        <!-- Header del card -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              :style="{ backgroundColor: getAvatarColor(paciente) }"
            >
              {{ getIniciales(paciente.nombre) }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ paciente.nombre || 'Sin nombre' }}
              </p>
              <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                <span
                  class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="getEstadoClasses(paciente)"
                >
                  {{ getEstadoTexto(paciente) }}
                </span>
                <span v-if="paciente.area_de_acompanamiento" class="text-xs text-gray-500 truncate max-w-[120px]">
                  {{ paciente.area_de_acompanamiento }}
                </span>
              </div>
            </div>
          </div>

          <!-- Acciones móvil -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              @click.stop="$emit('editar', paciente)"
              class="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Editar"
            >
              <PencilIcon class="w-5 h-5" />
            </button>
            <button
              @click.stop="$emit('gestionar-bonos', paciente)"
              class="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Bonos"
            >
              <TicketIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Info secundaria en móvil -->
        <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
          <!-- Próxima cita -->
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Próxima cita</p>
            <div v-if="paciente.proxima_sesion" class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full bg-purple-500"></div>
              <span class="text-gray-900 text-xs">{{ formatProximaCita(paciente.proxima_sesion) }}</span>
            </div>
            <span v-else class="text-xs text-amber-600 font-medium">Sin cita</span>
          </div>

          <!-- Última sesión -->
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Última sesión</p>
            <div class="flex items-center gap-1.5">
              <div
                class="w-2 h-2 rounded-full"
                :class="getUltimaSesionIndicador(paciente)"
              ></div>
              <span class="text-xs" :class="getUltimaSesionTextClass(paciente)">
                {{ formatUltimaSesion(paciente.ultima_sesion) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Bono -->
        <div v-if="paciente.bono_activo" class="mt-3">
          <p class="text-xs text-gray-500 mb-1">Bono activo</p>
          <div class="flex items-center gap-2">
            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="getBonoBarClass(paciente.bono_activo)"
                :style="{ width: getBonoPercent(paciente.bono_activo) + '%' }"
              ></div>
            </div>
            <span class="text-xs font-medium flex-shrink-0" :class="getBonoTextClass(paciente.bono_activo)">
              {{ paciente.bono_activo.sesiones_restantes }}/{{ paciente.bono_activo.sesiones_totales }} sesiones
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="pacientes.length === 0" class="py-12 text-center">
      <p class="text-sm text-gray-500">No hay pacientes que mostrar</p>
    </div>
  </div>
</template>

<script setup>
import { PencilIcon, TicketIcon, EyeIcon } from '@heroicons/vue/24/outline'

defineProps({
  pacientes: {
    type: Array,
    required: true
  }
})

defineEmits(['ver-ficha', 'editar', 'gestionar-bonos', 'ver-preview'])

// Helpers
const getIniciales = (nombre) => {
  if (!nombre) return '??'
  const partes = nombre.trim().split(' ')
  return `${partes[0]?.charAt(0) || '?'}${partes[1]?.charAt(0) || ''}`.toUpperCase()
}

const getAvatarColor = (paciente) => {
  if (!paciente.activo) return '#9CA3AF'
  if (paciente.en_pausa) return '#F59E0B'
  const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#6366F1', '#F97316']
  const index = paciente.id.charCodeAt(0) % colors.length
  return colors[index]
}

const getEstadoTexto = (paciente) => {
  if (!paciente.activo) return 'Finalizado'
  if (paciente.en_pausa) return 'Pausa'
  return 'Activo'
}

const getEstadoClasses = (paciente) => {
  if (!paciente.activo) return 'bg-gray-100 text-gray-600'
  if (paciente.en_pausa) return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
}

const formatProximaCita = (fecha) => {
  if (!fecha) return null
  try {
    let fechaStr = fecha
    if (!fechaStr.includes('T')) fechaStr += 'T00:00:00'
    const d = new Date(fechaStr)
    if (isNaN(d.getTime())) return null
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return null
  }
}

const formatUltimaSesion = (fecha) => {
  if (!fecha) return 'Sin registro'
  const d = new Date(fecha)
  const ahora = new Date()
  const diffDias = Math.floor((ahora - d) / (1000 * 60 * 60 * 24))

  if (diffDias === 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias}d`
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)}sem`
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const getDiasInactividad = (paciente) => {
  if (!paciente.ultima_sesion) return 999
  const fecha = new Date(paciente.ultima_sesion)
  const ahora = new Date()
  return Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24))
}

const getUltimaSesionIndicador = (paciente) => {
  if (!paciente.ultima_sesion) return 'bg-gray-300'
  const diffDias = getDiasInactividad(paciente)
  if (diffDias <= 7) return 'bg-green-500'
  if (diffDias <= 14) return 'bg-blue-500'
  if (diffDias <= 30) return 'bg-amber-500'
  return 'bg-red-500'
}

const getUltimaSesionTextClass = (paciente) => {
  if (!paciente.ultima_sesion) return 'text-gray-400'
  const diffDias = getDiasInactividad(paciente)
  if (diffDias <= 14) return 'text-gray-600'
  if (diffDias <= 30) return 'text-amber-600'
  return 'text-red-600 font-medium'
}

const getBonoPercent = (bono) => {
  if (!bono || bono.sesiones_totales === 0) return 0
  const usadas = bono.sesiones_totales - bono.sesiones_restantes
  return Math.round((usadas / bono.sesiones_totales) * 100)
}

const getBonoBarClass = (bono) => {
  if (!bono) return 'bg-gray-400'
  if (bono.sesiones_restantes <= 1) return 'bg-red-500'
  if (bono.sesiones_restantes === 2) return 'bg-amber-500'
  return 'bg-purple-500'
}

const getBonoTextClass = (bono) => {
  if (!bono) return 'text-gray-600'
  if (bono.sesiones_restantes <= 1) return 'text-red-600'
  if (bono.sesiones_restantes === 2) return 'text-amber-600'
  return 'text-gray-700'
}
</script>
