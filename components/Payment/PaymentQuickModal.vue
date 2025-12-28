<script setup lang="ts">
/**
 * PaymentQuickModal.vue
 * Micro-modal para registro rápido de pago (2 clics)
 * Diseño: Resumen de cita + selector de método + confirmación
 */

import type { PaymentMethod } from '~/components/Payment/PaymentMethodSelector.vue'

interface BonoInfo {
  id: string
  nombre: string
  sesionesRestantes: number
  sesionesTotales: number
  numeroSesion?: number
}

interface Props {
  citaId: string
  pacienteNombre: string
  cantidad: number
  tipoTransaccion?: 'sesion_bono' | 'bono_nuevo' | 'sesion_unica'
  bonoInfo?: BonoInfo | null
  horaInicio?: string
  metodoPagoActual?: PaymentMethod | null
  modoEdicion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tipoTransaccion: 'sesion_unica',
  bonoInfo: null,
  horaInicio: '',
  metodoPagoActual: null,
  modoEdicion: false
})

const emit = defineEmits<{
  confirm: [metodo: PaymentMethod]
  cancel: []
}>()

const { createPayment, updatePaymentMethod, loading } = usePayments()
const { success: toastSuccess, error: toastError } = useToast()

const selectedMethod = ref<PaymentMethod | null>(props.metodoPagoActual)
const procesando = ref(false)

// Descripción de la transacción
const descripcionTransaccion = computed(() => {
  if (props.bonoInfo) {
    const sesionNum = props.bonoInfo.numeroSesion ||
      (props.bonoInfo.sesionesTotales - props.bonoInfo.sesionesRestantes + 1)
    return `Sesión ${sesionNum}/${props.bonoInfo.sesionesTotales} "${props.bonoInfo.nombre}"`
  }
  return 'Sesión individual'
})

// Título del modal según modo
const tituloModal = computed(() => {
  return props.modoEdicion ? 'Cambiar método de pago' : 'Registrar pago'
})

// Cantidad formateada
const cantidadFormateada = computed(() => {
  return `${props.cantidad.toFixed(2)}€`
})

function handleSelectMethod(method: PaymentMethod) {
  selectedMethod.value = method
}

async function handleConfirm() {
  if (!selectedMethod.value) {
    toastError('Selecciona un método de pago')
    return
  }

  procesando.value = true

  try {
    let result

    if (props.modoEdicion) {
      // Modo edición: solo cambiar método
      result = await updatePaymentMethod(props.citaId, selectedMethod.value)
    } else {
      // Modo nuevo: registrar pago completo
      result = await createPayment(props.citaId, selectedMethod.value, props.cantidad)
    }

    if (result.success) {
      toastSuccess(props.modoEdicion ? 'Método actualizado' : 'Pago registrado')
      emit('confirm', selectedMethod.value)
    } else {
      toastError(result.error || 'Error al procesar el pago')
    }
  } catch (err: any) {
    console.error('[PaymentQuickModal] Error:', err)
    toastError('Error inesperado')
  } finally {
    procesando.value = false
  }
}

function handleCancel() {
  emit('cancel')
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleCancel()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleCancel()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'payment-modal-title'"
      @click="handleBackdropClick"
    >
      <div
        class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        @click.stop
      >
        <!-- Header -->
        <div class="px-5 py-4 bg-gray-50 border-b border-gray-200">
          <h2 id="payment-modal-title" class="text-lg font-semibold text-gray-900">
            {{ tituloModal }}
          </h2>
        </div>

        <!-- Content -->
        <div class="p-5 space-y-5">
          <!-- Resumen de la transacción -->
          <div class="text-center pb-4 border-b border-gray-100">
            <p class="text-3xl font-bold text-gray-900">
              {{ cantidadFormateada }}
            </p>
            <p class="mt-1 text-base text-gray-700">
              {{ pacienteNombre }}
            </p>
            <p class="text-sm text-gray-500">
              {{ descripcionTransaccion }}
              <span v-if="horaInicio" class="ml-1">· {{ horaInicio }}</span>
            </p>
          </div>

          <!-- Selector de método -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Método de pago
            </label>
            <PaymentMethodSelector
              :selected-method="selectedMethod"
              :disabled="procesando"
              size="md"
              @select="handleSelectMethod"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            :disabled="procesando"
            @click="handleCancel"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!selectedMethod || procesando"
            @click="handleConfirm"
          >
            <span v-if="procesando" class="inline-flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Procesando...
            </span>
            <span v-else>
              {{ modoEdicion ? 'Actualizar' : 'Confirmar pago' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
