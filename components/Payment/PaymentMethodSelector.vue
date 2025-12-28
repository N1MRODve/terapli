<script setup lang="ts">
/**
 * PaymentMethodSelector.vue
 * Selector reutilizable de método de pago con 5 opciones
 * Diseño: Botones grandes con iconos, responsive (100% mobile, 50% desktop)
 */

export type PaymentMethod = 'efectivo' | 'transferencia' | 'bizum' | 'tarjeta' | 'stripe'

interface Props {
  selectedMethod?: PaymentMethod | null
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  selectedMethod: null,
  disabled: false,
  size: 'md'
})

const emit = defineEmits<{
  select: [method: PaymentMethod]
}>()

interface MethodConfig {
  id: PaymentMethod
  label: string
  icon: string
  shortLabel: string
}

const methods: MethodConfig[] = [
  { id: 'efectivo', label: 'Efectivo', icon: '💵', shortLabel: 'Efectivo' },
  { id: 'transferencia', label: 'Transferencia', icon: '🏦', shortLabel: 'Transfer.' },
  { id: 'bizum', label: 'Bizum', icon: '📱', shortLabel: 'Bizum' },
  { id: 'tarjeta', label: 'Tarjeta', icon: '💳', shortLabel: 'Tarjeta' },
  { id: 'stripe', label: 'Stripe', icon: '⚡', shortLabel: 'Stripe' }
]

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'py-2 px-3 text-sm'
    case 'lg':
      return 'py-4 px-5 text-lg'
    default:
      return 'py-3 px-4 text-base'
  }
})

const iconSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-lg'
    case 'lg':
      return 'text-3xl'
    default:
      return 'text-2xl'
  }
})

function selectMethod(method: PaymentMethod) {
  if (!props.disabled) {
    emit('select', method)
  }
}

function isSelected(method: PaymentMethod): boolean {
  return props.selectedMethod === method
}

function handleKeydown(event: KeyboardEvent, method: PaymentMethod) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    selectMethod(method)
  }
}
</script>

<template>
  <div
    class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2"
    role="radiogroup"
    aria-label="Seleccionar método de pago"
  >
    <button
      v-for="method in methods"
      :key="method.id"
      type="button"
      :disabled="disabled"
      :aria-checked="isSelected(method.id)"
      :aria-label="`Pagar con ${method.label}`"
      role="radio"
      :tabindex="isSelected(method.id) || (!selectedMethod && method.id === 'efectivo') ? 0 : -1"
      :class="[
        'flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500',
        sizeClasses,
        isSelected(method.id)
          ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
        disabled && 'opacity-50 cursor-not-allowed'
      ]"
      @click="selectMethod(method.id)"
      @keydown="handleKeydown($event, method.id)"
    >
      <span :class="['mb-1', iconSizeClasses]" aria-hidden="true">
        {{ method.icon }}
      </span>
      <span class="font-medium leading-tight text-center">
        <span class="hidden sm:inline">{{ method.label }}</span>
        <span class="sm:hidden">{{ method.shortLabel }}</span>
      </span>
    </button>
  </div>
</template>
