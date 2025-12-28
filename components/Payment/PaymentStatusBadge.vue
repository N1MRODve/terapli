<script setup lang="ts">
/**
 * PaymentStatusBadge.vue
 * Badge de estado del pago con acciones contextuales
 * Estados: pendiente (amarillo), pagado (verde), bonificado (azul)
 */

import type { PaymentMethod } from '~/components/Payment/PaymentMethodSelector.vue'

type EstadoPago = 'pendiente' | 'pagado' | 'bonificado' | 'cancelado' | null

interface Props {
  estadoPago: EstadoPago
  metodoPago?: PaymentMethod | null
  fechaPago?: string | null
  cantidad?: number | null
  showActions?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  metodoPago: null,
  fechaPago: null,
  cantidad: null,
  showActions: true,
  compact: false
})

const emit = defineEmits<{
  registrar: []
  cambiar: []
  deshacer: []
}>()

const { formatPaymentMethod, formatPaymentDate } = usePayments()

// Estado visual según estado de pago
const estadoConfig = computed(() => {
  switch (props.estadoPago) {
    case 'pagado':
      return {
        label: 'Pagado',
        icon: '✓',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        iconBg: 'bg-green-500'
      }
    case 'bonificado':
      return {
        label: 'Bonificado',
        icon: '🎁',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        iconBg: 'bg-blue-500'
      }
    case 'cancelado':
      return {
        label: 'Cancelado',
        icon: '✕',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-500',
        borderColor: 'border-gray-200',
        iconBg: 'bg-gray-400'
      }
    default:
      return {
        label: 'Pendiente',
        icon: '⏳',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        iconBg: 'bg-amber-500'
      }
  }
})

const isPagado = computed(() => props.estadoPago === 'pagado')
const isPendiente = computed(() => !props.estadoPago || props.estadoPago === 'pendiente')
const isBonificado = computed(() => props.estadoPago === 'bonificado')

const metodoPagoFormateado = computed(() => {
  if (!props.metodoPago) return null
  return formatPaymentMethod(props.metodoPago)
})

const fechaPagoFormateada = computed(() => {
  if (!props.fechaPago) return null
  return formatPaymentDate(props.fechaPago)
})

const cantidadFormateada = computed(() => {
  if (props.cantidad === null || props.cantidad === undefined) return null
  return `${props.cantidad.toFixed(2)}€`
})
</script>

<template>
  <div
    :class="[
      'rounded-lg border transition-colors',
      estadoConfig.bgColor,
      estadoConfig.borderColor,
      compact ? 'p-2' : 'p-3'
    ]"
  >
    <!-- Estado + Info -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-2">
        <!-- Icono de estado -->
        <span
          :class="[
            'flex items-center justify-center rounded-full text-white',
            estadoConfig.iconBg,
            compact ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-sm'
          ]"
          aria-hidden="true"
        >
          {{ estadoConfig.icon }}
        </span>

        <div>
          <!-- Label de estado -->
          <span :class="['font-medium', estadoConfig.textColor, compact ? 'text-sm' : 'text-base']">
            {{ estadoConfig.label }}
          </span>

          <!-- Info adicional para pagado -->
          <template v-if="isPagado && !compact">
            <p class="text-xs text-gray-500 mt-0.5">
              <span v-if="metodoPagoFormateado">{{ metodoPagoFormateado }}</span>
              <span v-if="fechaPagoFormateada" class="ml-1">· {{ fechaPagoFormateada }}</span>
            </p>
          </template>

          <!-- Info para bonificado -->
          <template v-if="isBonificado && !compact">
            <p class="text-xs text-blue-600 mt-0.5">
              Sesión cubierta por bono
            </p>
          </template>
        </div>
      </div>

      <!-- Cantidad (si está disponible) -->
      <div v-if="cantidadFormateada && !compact" class="text-right">
        <span :class="['font-semibold', estadoConfig.textColor]">
          {{ cantidadFormateada }}
        </span>
      </div>
    </div>

    <!-- Acciones -->
    <div
      v-if="showActions && !compact"
      class="mt-3 pt-3 border-t flex flex-wrap gap-2"
      :class="estadoConfig.borderColor"
    >
      <!-- Pendiente: Botón registrar -->
      <template v-if="isPendiente">
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          @click="emit('registrar')"
        >
          <span aria-hidden="true">💳</span>
          Registrar pago
        </button>
      </template>

      <!-- Pagado: Botones cambiar y deshacer -->
      <template v-if="isPagado">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          @click="emit('cambiar')"
        >
          <span aria-hidden="true">🔄</span>
          Cambiar método
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          @click="emit('deshacer')"
        >
          <span aria-hidden="true">↩️</span>
          Deshacer
        </button>
      </template>

      <!-- Bonificado: Sin acciones editables -->
      <template v-if="isBonificado">
        <p class="text-xs text-blue-600 italic">
          Esta sesión está vinculada a un bono activo
        </p>
      </template>
    </div>
  </div>
</template>
