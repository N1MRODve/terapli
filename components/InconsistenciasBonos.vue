<script setup lang="ts">
// =============================================================================
// COMPONENTE: Detector de Inconsistencias en Bonos
// =============================================================================
// Detecta citas completadas sin descuento aplicado y permite re-sincronizarlas

import { onMounted, ref, computed } from 'vue'
import { useAgenda } from '~/composables/useAgenda'

const {
  citasPendientesSync,
  detectarInconsistencias,
  resincronizarBono,
  resincronizarTodos
} = useAgenda()

// Estado local
const cargando = ref(false)
const mostrarDetalles = ref(false)
const procesando = ref(false)

// Detectar al montar
onMounted(async () => {
  cargando.value = true
  await detectarInconsistencias()
  cargando.value = false
})

// Computadas
const hayCitasPendientes = computed(() => citasPendientesSync.value.length > 0)
const totalPendientes = computed(() => citasPendientesSync.value.length)

// Manejar re-sincronización individual
const handleResincronizar = async (citaId: string) => {
  procesando.value = true
  try {
    await resincronizarBono(citaId)
  } finally {
    procesando.value = false
  }
}

// Manejar re-sincronización masiva
const handleResincronizarTodos = async () => {
  if (!confirm(`¿Re-sincronizar ${totalPendientes.value} cita(s)?`)) return
  
  procesando.value = true
  try {
    await resincronizarTodos()
  } finally {
    procesando.value = false
  }
}

// Formatear fecha
const formatearFecha = (fecha: string) => {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="cargando" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
    <div class="flex items-center gap-2 text-gray-600">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
      <span class="text-sm">Verificando inconsistencias...</span>
    </div>
  </div>

  <!-- Inconsistencias Detectadas -->
  <div
    v-else-if="hayCitasPendientes"
    class="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-lg shadow-sm overflow-hidden"
  >
    <div class="p-4">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 mb-3">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 mt-0.5">
            <svg class="h-6 w-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-amber-900 text-base">
              Inconsistencias Detectadas
            </h3>
            <p class="text-sm text-amber-800 mt-1">
              Hay <strong>{{ totalPendientes }}</strong> 
              cita{{ totalPendientes > 1 ? 's completadas' : ' completada' }} 
              sin descuento de bono aplicado
            </p>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="flex gap-2 flex-shrink-0">
          <button
            @click="mostrarDetalles = !mostrarDetalles"
            class="px-3 py-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
            type="button"
          >
            {{ mostrarDetalles ? 'Ocultar' : 'Ver detalles' }}
          </button>
          <button
            @click="handleResincronizarTodos"
            :disabled="procesando"
            class="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {{ procesando ? 'Procesando...' : 'Re-sincronizar todas' }}
          </button>
        </div>
      </div>

      <!-- Detalles Expandibles -->
      <transition name="slide">
        <div v-if="mostrarDetalles" class="mt-4 pt-4 border-t border-amber-200">
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="cita in citasPendientesSync"
              :key="cita.id"
              class="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-300 transition-colors"
            >
              <!-- Info de la cita -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ cita.paciente?.nombre_completo || 'Paciente' }}
                </p>
                <div class="flex items-center gap-2 text-xs text-gray-600 mt-1">
                  <span>{{ formatearFecha(cita.fecha_cita) }}</span>
                  <span class="text-gray-400">•</span>
                  <span class="capitalize">{{ cita.estado }}</span>
                  <span v-if="cita.bono" class="text-gray-400">•</span>
                  <span v-if="cita.bono" class="text-amber-700 font-medium">
                    Bono: {{ cita.bono.sesiones_restantes }}/{{ cita.bono.sesiones_totales }}
                  </span>
                </div>
              </div>

              <!-- Acción individual -->
              <button
                @click="handleResincronizar(cita.id)"
                :disabled="procesando"
                class="px-3 py-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-colors disabled:opacity-50"
                type="button"
              >
                🔄 Re-sincronizar
              </button>
            </div>
          </div>

          <!-- Info adicional -->
          <div class="mt-3 p-3 bg-amber-100 rounded-lg">
            <p class="text-xs text-amber-800">
              <strong>💡 Nota:</strong> La re-sincronización ejecutará la función 
              <code class="px-1 py-0.5 bg-amber-200 rounded text-amber-900">actualizar_bono_por_cita()</code> 
              para descontar las sesiones pendientes. El sistema previene descuentos duplicados automáticamente.
            </p>
          </div>
        </div>
      </transition>
    </div>
  </div>

  <!-- Sin inconsistencias (opcional - mostrar solo si se llamó detectar) -->
  <div
    v-else-if="!cargando && citasPendientesSync.length === 0"
    class="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4"
  >
    <div class="flex items-center gap-3">
      <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <div>
        <p class="text-sm font-medium text-green-800">
          Todo sincronizado correctamente
        </p>
        <p class="text-xs text-green-700 mt-0.5">
          No se detectaron inconsistencias en las citas completadas
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animación para mostrar/ocultar detalles */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Scrollbar personalizado */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #fef3c7;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #f59e0b;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #d97706;
}

/* Animación de spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
