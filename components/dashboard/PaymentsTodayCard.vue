<script setup lang="ts">
/**
 * PaymentsTodayCard.vue
 * Tarjeta de resumen de pagos del día para el Dashboard
 * Muestra: Total cobrado, desglose por método, lista de pagos
 *
 * ACTUALIZADO: Pendientes de cobro como sub-bloque destacado
 */

import type { PagoCita, ResumenPagosDia } from '~/composables/usePayments'

const { getPaymentsOfDay, pagosDia, loading, resumenDia, formatPaymentMethod } = usePayments()

// Estado local
const mostrarTodos = ref(false)
const mostrarTodosPendientes = ref(false)

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

// Computed: pendientes visibles (limitados a 4 por defecto)
const pendientesVisibles = computed(() => {
  if (mostrarTodosPendientes.value) return resumenDia.value.pendientes
  return resumenDia.value.pendientes.slice(0, 4)
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
  cobrar: [citaId: string]
}>()

function abrirDetallesCita(citaId: string) {
  emit('abrirCita', citaId)
}

function cobrarCita(citaId: string) {
  // Abre el modal de detalles para cobrar
  emit('cobrar', citaId)
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
          <h2 class="text-lg font-semibold text-gray-900">Pagos de hoy</h2>
          <p class="text-sm text-gray-500">
            {{ resumenDia.cantidadPagos }} {{ resumenDia.cantidadPagos === 1 ? 'pago registrado' : 'pagos registrados' }} hoy
          </p>
        </div>
      </div>
      <button
        @click="refrescar"
        :disabled="loading"
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
        title="Actualizar"
      >
        <svg :class="['w-4 h-4', loading && 'animate-spin']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Contenido -->
    <div class="p-4">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-8">
        <div class="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mb-2"></div>
        <p class="text-sm text-gray-500">Cargando pagos...</p>
      </div>

      <template v-else>
        <!-- ============================================================ -->
        <!-- BLOQUE DESTACADO: PENDIENTES DE COBRO -->
        <!-- ============================================================ -->
        <div v-if="resumenDia.pendientes.length > 0" class="mb-5">
          <!-- Header del bloque pendientes -->
          <div class="flex items-center gap-2 mb-3">
            <div class="w-2 h-2 rounded-full bg-amber-500"></div>
            <h3 class="text-base font-semibold text-gray-900">
              Pendientes de cobro ({{ resumenDia.pendientes.length }})
            </h3>
          </div>

          <!-- Lista de pendientes -->
          <div class="space-y-2">
            <div
              v-for="pago in pendientesVisibles"
              :key="pago.id"
              class="bg-amber-50 border border-amber-200 rounded-xl p-3"
            >
              <!-- Fila: Nombre + hora -->
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium text-gray-900">
                  {{ pago.paciente_nombre }} <span class="text-gray-400 font-normal">·</span> {{ pago.hora_inicio?.substring(0, 5) || '--:--' }}
                </p>
              </div>

              <!-- Fila: Importe grande + botones -->
              <div class="flex items-center justify-between">
                <!-- Importe destacado -->
                <p class="text-2xl font-bold text-amber-700">
                  {{ (pago.precio_sesion || 50).toFixed(2).replace('.', ',') }}€
                </p>

                <!-- Botones de acción -->
                <div class="flex items-center gap-2">
                  <button
                    @click.stop="abrirDetallesCita(pago.id)"
                    class="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
                  >
                    Ver sesión
                  </button>
                  <button
                    @click.stop="cobrarCita(pago.id)"
                    class="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Cobrar
                  </button>
                </div>
              </div>
            </div>

            <!-- Ver más pendientes -->
            <button
              v-if="resumenDia.pendientes.length > 4 && !mostrarTodosPendientes"
              @click="mostrarTodosPendientes = true"
              class="w-full py-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
            >
              Ver {{ resumenDia.pendientes.length - 4 }} más
            </button>
          </div>
        </div>

        <!-- Estado: Sin pendientes (al día) -->
        <div v-else class="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <div class="flex items-center justify-center gap-2 text-emerald-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <p class="font-semibold">Al día</p>
          </div>
          <p class="text-sm text-emerald-600 mt-1">No tienes cobros pendientes hoy</p>
        </div>

        <!-- ============================================================ -->
        <!-- SECCIÓN: Pagos registrados hoy -->
        <!-- ============================================================ -->
        <div v-if="resumenDia.pagos.length > 0">
          <!-- Header de pagos registrados -->
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-500">Pagos registrados</h3>
            <span class="text-sm font-semibold text-emerald-600">{{ resumenDia.total.toFixed(2).replace('.', ',') }}€</span>
          </div>

          <!-- Lista compacta de pagos -->
          <div class="space-y-1.5">
            <button
              v-for="pago in pagosVisibles"
              :key="pago.id"
              @click="abrirDetallesCita(pago.id)"
              class="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm text-gray-700">{{ pago.paciente_nombre }}</span>
                <span class="text-xs text-gray-400">{{ pago.hora_inicio?.substring(0, 5) || '' }}</span>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ (pago.precio_sesion || 0).toFixed(2).replace('.', ',') }}€</span>
            </button>

            <!-- Ver más pagos -->
            <button
              v-if="resumenDia.pagos.length > 3 && !mostrarTodos"
              @click="mostrarTodos = true"
              class="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Ver {{ resumenDia.pagos.length - 3 }} más
            </button>
          </div>
        </div>

        <!-- Empty state completo: ni pagos ni pendientes -->
        <div v-if="resumenDia.pagos.length === 0 && resumenDia.pendientes.length === 0" class="text-center py-6">
          <div class="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <svg class="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-gray-700 font-medium mb-1">Sin movimientos hoy</p>
          <p class="text-sm text-gray-400 max-w-[220px] mx-auto">Los cobros aparecerán aquí automáticamente cuando registres pagos en tus sesiones</p>
        </div>
      </template>
    </div>
  </div>
</template>
