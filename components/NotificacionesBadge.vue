<script setup lang="ts">
// =============================================================================
// COMPONENTE: Badge de Notificaciones
// =============================================================================
// Muestra el contador de notificaciones no leídas con dropdown

import { ref, onMounted, computed } from 'vue'
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
  suscribirse,
  solicitarPermisosNotificaciones
} = useNotificaciones()

// Estado local
const mostrarDropdown = ref(false)
const cargando = ref(false)

// Computadas
const tieneNotificaciones = computed(() => totalNoVistas.value > 0)
const contadorDisplay = computed(() => {
  if (totalNoVistas.value > 99) return '99+'
  return totalNoVistas.value
})

// Ciclo de vida
onMounted(async () => {
  cargando.value = true
  await listar()
  suscribirse()
  cargando.value = false
  
  // Solicitar permisos de notificaciones del navegador
  await solicitarPermisosNotificaciones()
})

// Métodos
const toggleDropdown = () => {
  mostrarDropdown.value = !mostrarDropdown.value
}

const cerrarDropdown = () => {
  mostrarDropdown.value = false
}

const handleMarcarLeida = async (notifId: string) => {
  await marcarVista(notifId)
}

const handleMarcarTodas = async () => {
  await marcarTodasVistas()
}

const formatearFecha = (fecha: string) => {
  const date = new Date(fecha)
  const ahora = new Date()
  const diffMs = ahora.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  
  const diffHoras = Math.floor(diffMins / 60)
  if (diffHoras < 24) return `Hace ${diffHoras}h`
  
  const diffDias = Math.floor(diffHoras / 24)
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`
  
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
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
  if (urgencia === 'alta') return 'bg-red-100 border-red-300 text-red-900'
  if (urgencia === 'media') return 'bg-orange-100 border-orange-300 text-orange-900'
  return 'bg-blue-100 border-blue-300 text-blue-900'
}
</script>

<template>
  <div class="relative" v-click-away="cerrarDropdown">
    <!-- Botón del Badge -->
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
      :class="{ 'animate-pulse': tieneUrgentes }"
      type="button"
      aria-label="Notificaciones"
    >
      <!-- Icono de campana -->
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <!-- Badge contador -->
      <span
        v-if="tieneNotificaciones"
        class="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white rounded-full"
        :class="tieneUrgentes ? 'bg-red-500 animate-bounce' : 'bg-purple-600'"
      >
        {{ contadorDisplay }}
      </span>
    </button>

    <!-- Dropdown de Notificaciones -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-show="mostrarDropdown"
        class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 class="text-sm font-semibold text-gray-900">
            Notificaciones
            <span v-if="tieneNotificaciones" class="ml-2 text-xs text-purple-600">
              ({{ totalNoVistas }})
            </span>
          </h3>
          <button
            v-if="tieneNotificaciones"
            @click="handleMarcarTodas"
            class="text-xs text-purple-600 hover:text-purple-800 font-medium"
            type="button"
          >
            Marcar todas como leídas
          </button>
        </div>

        <!-- Lista de notificaciones -->
        <div class="max-h-[500px] overflow-y-auto">
          <!-- Loading -->
          <div v-if="cargando" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>

          <!-- Sin notificaciones -->
          <div v-else-if="!tieneNotificaciones" class="px-4 py-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="mt-2 text-sm text-gray-600">No tienes notificaciones</p>
          </div>

          <!-- Notificaciones no leídas -->
          <div v-else>
            <div
              v-for="notif in noLeidas.slice(0, 10)"
              :key="notif.id"
              class="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors cursor-pointer group"
              @click="handleMarcarLeida(notif.id)"
            >
              <div class="flex items-start gap-3">
                <!-- Icono -->
                <div class="flex-shrink-0 text-2xl mt-0.5">
                  {{ getIconoTipo(notif.tipo) }}
                </div>

                <!-- Contenido -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="text-sm font-semibold text-gray-900 line-clamp-1">
                      {{ notif.titulo }}
                    </h4>
                    <button
                      @click.stop="eliminar(notif.id)"
                      class="flex-shrink-0 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <p class="text-xs text-gray-600 mt-1 line-clamp-2">
                    {{ notif.mensaje }}
                  </p>

                  <div class="flex items-center gap-2 mt-2">
                    <span class="text-xs text-gray-500">
                      {{ formatearFecha(notif.created_at) }}
                    </span>
                    
                    <!-- Badge de urgencia -->
                    <span
                      v-if="notif.metadata?.urgencia"
                      class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      :class="getColorUrgencia(notif.metadata.urgencia)"
                    >
                      {{ notif.metadata.urgencia.toUpperCase() }}
                    </span>

                    <!-- Sesiones restantes para bonos -->
                    <span
                      v-if="notif.tipo === 'bono' && notif.metadata?.sesiones_restantes !== undefined"
                      class="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700"
                    >
                      {{ notif.metadata.sesiones_restantes }}/{{ notif.metadata.sesiones_totales }} sesiones
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ver todas -->
            <div v-if="noLeidas.length > 10" class="px-4 py-3 text-center bg-gray-50">
              <NuxtLink
                to="/coordinadora/notificaciones"
                class="text-sm text-purple-600 hover:text-purple-800 font-medium"
                @click="cerrarDropdown"
              >
                Ver todas las notificaciones ({{ totalNoVistas }})
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Animaciones */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* Scrollbar personalizado */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #9333ea;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #7e22ce;
}

/* Line clamp */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
