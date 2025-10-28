<script setup lang="ts">
// =============================================================================
// PÁGINA: Panel de Notificaciones de la Coordinadora
// =============================================================================

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

import { ref, computed, onMounted } from 'vue'
import { useNotificaciones } from '~/composables/useNotificaciones'

const {
  notificaciones,
  totalNoVistas,
  noLeidas,
  urgentes,
  tieneUrgentes,
  listar,
  marcarVista,
  marcarTodasVistas,
  eliminar,
  eliminarVistas,
  suscribirse
} = useNotificaciones()

// Estado local
const cargando = ref(false)
const filtroActivo = ref<'todas' | 'no-leidas' | 'urgentes'>('no-leidas')

// Computadas
const notificacionesFiltradas = computed(() => {
  if (filtroActivo.value === 'no-leidas') return noLeidas.value
  if (filtroActivo.value === 'urgentes') return urgentes.value
  return notificaciones.value
})

// Ciclo de vida
onMounted(async () => {
  cargando.value = true
  await listar(100)
  suscribirse()
  cargando.value = false
})

// Métodos
const cambiarFiltro = (filtro: typeof filtroActivo.value) => {
  filtroActivo.value = filtro
}

const formatearFechaCompleta = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getIconoTipo = (tipo: string) => {
  const iconos: Record<string, string> = {
    bono: '💳',
    cita: '📅',
    pago: '💰',
    sistema: '⚙️',
    alerta: '⚠️'
  }
  return iconos[tipo] || '🔔'
}

const getColorUrgencia = (urgencia?: string) => {
  if (urgencia === 'alta') return 'bg-red-100 border-l-red-500 text-red-900'
  if (urgencia === 'media') return 'bg-orange-100 border-l-orange-500 text-orange-900'
  return 'bg-blue-100 border-l-blue-500 text-blue-900'
}

const handleEliminarLeidas = async () => {
  if (!confirm('¿Eliminar todas las notificaciones leídas?')) return
  await eliminarVistas()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">🔔 Notificaciones</h1>
            <p class="mt-2 text-sm text-gray-600">
              Mantente al día con las alertas del sistema
            </p>
          </div>

          <!-- Acciones rápidas -->
          <div class="flex gap-2">
            <button
              v-if="totalNoVistas > 0"
              @click="marcarTodasVistas"
              class="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
              type="button"
            >
              ✓ Marcar todas como leídas
            </button>
            <button
              @click="handleEliminarLeidas"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              type="button"
            >
              🗑️ Eliminar leídas
            </button>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="mt-6 grid grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-purple-100 rounded-full">
                <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-600">Total</p>
                <p class="text-2xl font-bold text-gray-900">{{ notificaciones.length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-blue-100 rounded-full">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-600">No leídas</p>
                <p class="text-2xl font-bold text-blue-600">{{ totalNoVistas }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-red-100 rounded-full">
                <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-600">Urgentes</p>
                <p class="text-2xl font-bold text-red-600">{{ urgentes.length }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="mb-6 flex gap-2">
        <button
          @click="cambiarFiltro('no-leidas')"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="filtroActivo === 'no-leidas' 
            ? 'bg-purple-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'"
          type="button"
        >
          No leídas ({{ totalNoVistas }})
        </button>
        <button
          @click="cambiarFiltro('urgentes')"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="filtroActivo === 'urgentes' 
            ? 'bg-red-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'"
          type="button"
        >
          Urgentes ({{ urgentes.length }})
        </button>
        <button
          @click="cambiarFiltro('todas')"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="filtroActivo === 'todas' 
            ? 'bg-purple-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'"
          type="button"
        >
          Todas ({{ notificaciones.length }})
        </button>
      </div>

      <!-- Loading -->
      <div v-if="cargando" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>

      <!-- Lista de notificaciones -->
      <div v-else-if="notificacionesFiltradas.length > 0" class="space-y-3">
        <div
          v-for="notif in notificacionesFiltradas"
          :key="notif.id"
          class="bg-white rounded-lg border-l-4 shadow-sm overflow-hidden transition-all hover:shadow-md"
          :class="[
            !notif.leido ? 'border-l-purple-500 bg-purple-50/30' : 'border-l-gray-300',
            getColorUrgencia(notif.metadata?.urgencia)
          ]"
        >
          <div class="p-5">
            <div class="flex items-start gap-4">
              <!-- Icono -->
              <div class="flex-shrink-0 text-3xl mt-1">
                {{ getIconoTipo(notif.tipo) }}
              </div>

              <!-- Contenido -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">
                      {{ notif.titulo }}
                    </h3>
                    <p class="mt-2 text-sm text-gray-700 leading-relaxed">
                      {{ notif.mensaje }}
                    </p>

                    <!-- Metadata -->
                    <div class="mt-3 flex flex-wrap items-center gap-2">
                      <span class="text-xs text-gray-500">
                        {{ formatearFechaCompleta(notif.created_at) }}
                      </span>

                      <!-- Tipo -->
                      <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                        {{ notif.tipo.toUpperCase() }}
                      </span>

                      <!-- Urgencia -->
                      <span
                        v-if="notif.metadata?.urgencia"
                        class="text-xs px-2 py-1 rounded-full font-medium"
                        :class="{
                          'bg-red-100 text-red-700': notif.metadata.urgencia === 'alta',
                          'bg-orange-100 text-orange-700': notif.metadata.urgencia === 'media',
                          'bg-blue-100 text-blue-700': notif.metadata.urgencia === 'baja'
                        }"
                      >
                        {{ notif.metadata.urgencia.toUpperCase() }}
                      </span>

                      <!-- Sesiones para bonos -->
                      <span
                        v-if="notif.tipo === 'bono' && notif.metadata?.sesiones_restantes !== undefined"
                        class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium"
                      >
                        {{ notif.metadata.sesiones_restantes }}/{{ notif.metadata.sesiones_totales }} sesiones
                      </span>

                      <!-- Estado leído -->
                      <span
                        v-if="notif.leido"
                        class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium"
                      >
                        ✓ Leída
                      </span>
                    </div>
                  </div>

                  <!-- Acciones -->
                  <div class="flex-shrink-0 flex gap-2">
                    <button
                      v-if="!notif.leido"
                      @click="marcarVista(notif.id)"
                      class="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      type="button"
                      title="Marcar como leída"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <button
                      @click="eliminar(notif.id)"
                      class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      type="button"
                      title="Eliminar"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin notificaciones -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No hay notificaciones</h3>
        <p class="mt-2 text-sm text-gray-600">
          {{ filtroActivo === 'todas' ? 'No tienes ninguna notificación' : 
             filtroActivo === 'urgentes' ? 'No hay notificaciones urgentes' : 
             'Todas tus notificaciones están leídas' }}
        </p>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
