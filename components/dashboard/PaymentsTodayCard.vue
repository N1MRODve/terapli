<script setup lang="ts">
/**
 * PaymentsTodayCard.vue
 * Tarjeta de resumen de pagos del día para el Dashboard
 * Muestra: Total cobrado, desglose por método, lista de pagos
 */

import type { PagoCita, ResumenPagosDia } from '~/composables/usePayments'

const { getPaymentsOfDay, pagosDia, loading, resumenDia, formatPaymentMethod } = usePayments()

// Estado local
const mostrarTodos = ref(false)

// Cargar pagos al montar
onMounted(async () => {
  await getPaymentsOfDay()
})

// Computed: pagos visibles (limitados a 3 por defecto)
const pagosVisibles = computed(() => {
  const pagados = resumenDia.value.pagos
  if (mostrarTodos.value) return pagados
  return pagados.slice(0, 3)
})

// Computed: pendientes visibles
const pendientesVisibles = computed(() => {
  return resumenDia.value.pendientes.slice(0, 2)
})

// Computed: Fecha formateada
const fechaFormateada = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Computed: Métodos con pagos (solo los que tienen)
const metodosConPagos = computed(() => {
  const metodos = resumenDia.value.porMetodo
  return Object.entries(metodos)
    .filter(([_, data]) => data.cantidad > 0)
    .map(([metodo, data]) => ({
      metodo: metodo as string,
      ...data
    }))
})

// Emitir evento cuando se quiere abrir detalles de una cita
const emit = defineEmits<{
  abrirCita: [citaId: string]
}>()

function abrirDetallesCita(citaId: string) {
  emit('abrirCita', citaId)
}

// Refrescar datos
async function refrescar() {
  await getPaymentsOfDay()
}

// Exponer método de refresco
defineExpose({ refrescar })
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Pagos Hoy</h2>
          <p class="text-xs text-gray-500 capitalize">{{ fechaFormateada }}</p>
        </div>
      </div>
      <button
        @click="refrescar"
        :disabled="loading"
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
        title="Actualizar"
      >
        <svg :class="['w-5 h-5', loading && 'animate-spin']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Contenido -->
    <div class="p-4 sm:p-6">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-8">
        <div class="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mb-2"></div>
        <p class="text-sm text-gray-500">Cargando pagos...</p>
      </div>

      <template v-else>
        <!-- Total Grande -->
        <div class="text-center mb-6">
          <p class="text-4xl font-bold text-emerald-600">
            {{ resumenDia.total.toFixed(2) }}€
          </p>
          <p class="text-sm text-gray-500 mt-1">
            {{ resumenDia.cantidadPagos }} {{ resumenDia.cantidadPagos === 1 ? 'pago' : 'pagos' }} registrados hoy
          </p>
        </div>

        <!-- Desglose por método (solo si hay pagos) -->
        <div v-if="metodosConPagos.length > 0" class="mb-6">
          <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Desglose por método
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div
              v-for="metodo in metodosConPagos"
              :key="metodo.metodo"
              class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
            >
              <span class="text-lg">
                {{ metodo.metodo === 'efectivo' ? '💵' :
                   metodo.metodo === 'transferencia' ? '🏦' :
                   metodo.metodo === 'bizum' ? '📱' :
                   metodo.metodo === 'tarjeta' ? '💳' : '⚡' }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate capitalize">
                  {{ metodo.metodo }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ metodo.total.toFixed(2) }}€ · {{ metodo.cantidad }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de pagos del día -->
        <div v-if="resumenDia.pagos.length > 0" class="mb-4">
          <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Pagos registrados
          </h3>
          <div class="space-y-2">
            <button
              v-for="pago in pagosVisibles"
              :key="pago.id"
              @click="abrirDetallesCita(pago.id)"
              class="w-full flex items-center justify-between px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-left"
            >
              <div class="flex items-center gap-3">
                <span class="text-emerald-600">✓</span>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ pago.paciente_nombre }}</p>
                  <p class="text-xs text-gray-500">{{ pago.hora_inicio }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-emerald-700">{{ (pago.precio_sesion || 0).toFixed(2) }}€</p>
                <p class="text-xs text-gray-500 capitalize">{{ pago.metodo_pago }}</p>
              </div>
            </button>

            <!-- Ver más -->
            <button
              v-if="resumenDia.pagos.length > 3 && !mostrarTodos"
              @click="mostrarTodos = true"
              class="w-full py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              Ver {{ resumenDia.pagos.length - 3 }} más
            </button>
          </div>
        </div>

        <!-- Pendientes de cobro -->
        <div v-if="resumenDia.pendientes.length > 0">
          <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Pendientes de cobro
          </h3>
          <div class="space-y-2">
            <button
              v-for="pago in pendientesVisibles"
              :key="pago.id"
              @click="abrirDetallesCita(pago.id)"
              class="w-full flex items-center justify-between px-3 py-2.5 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors text-left"
            >
              <div class="flex items-center gap-3">
                <span class="text-amber-600">⏳</span>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ pago.paciente_nombre }}</p>
                  <p class="text-xs text-gray-500">{{ pago.hora_inicio }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-amber-700">{{ (pago.precio_sesion || 50).toFixed(2) }}€</p>
                <p class="text-xs text-amber-600">Cobrar</p>
              </div>
            </button>

            <p v-if="resumenDia.pendientes.length > 2" class="text-xs text-gray-500 text-center">
              +{{ resumenDia.pendientes.length - 2 }} pendientes más
            </p>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="resumenDia.pagos.length === 0 && resumenDia.pendientes.length === 0" class="text-center py-6">
          <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-gray-600 font-medium">Sin pagos hoy</p>
          <p class="text-sm text-gray-400 mt-1">Los cobros aparecerán aquí</p>
        </div>
      </template>
    </div>
  </div>
</template>
