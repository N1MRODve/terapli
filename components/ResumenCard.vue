<template>
  <div 
    class="bg-white rounded-2xl shadow-lg p-6 border-l-4 transition-all duration-300 hover:shadow-xl"
    :class="borderColorClass"
  >
    <!-- Header con título e icono -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div 
          class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          :class="bgColorClass"
        >
          {{ emoji }}
        </div>
        <div>
          <p class="text-sm font-sans text-gray-500 uppercase tracking-wide">{{ title }}</p>
          <p class="text-3xl font-serif font-bold" :class="textColorClass">{{ count }}</p>
        </div>
      </div>
    </div>

    <!-- Monto -->
    <div class="mt-4 pt-4 border-t border-gray-100">
      <p class="text-sm font-sans text-gray-600 mb-1">{{ subtitle }}</p>
      <p class="text-2xl font-serif font-bold" :class="textColorClass">
        {{ formatAmount(amount) }}
      </p>
    </div>

    <!-- Badge opcional con info adicional -->
    <div v-if="badge" class="mt-3">
      <span 
        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-sans font-medium"
        :class="badgeColorClass"
      >
        {{ badge }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  count: number
  amount: number
  color: 'amber' | 'green' | 'red' | 'primary' | 'blue'
  emoji?: string
  subtitle?: string
  badge?: string
}

const props = withDefaults(defineProps<Props>(), {
  emoji: '📊',
  subtitle: 'Monto total',
  badge: ''
})

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount)
}

const colorClasses = {
  amber: {
    border: 'border-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700'
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-50',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700'
  },
  red: {
    border: 'border-red-400',
    bg: 'bg-red-50',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700'
  },
  primary: {
    border: 'border-purple-600',
    bg: 'bg-rosa',
    text: 'text-purple-600',
    badge: 'bg-rosa text-purple-600'
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700'
  }
}

const borderColorClass = computed(() => colorClasses[props.color].border)
const bgColorClass = computed(() => colorClasses[props.color].bg)
const textColorClass = computed(() => colorClasses[props.color].text)
const badgeColorClass = computed(() => colorClasses[props.color].badge)
</script>

<style scoped>
/* Animación suave al cargar */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

div {
  animation: fadeInUp 0.4s ease-out;
}
</style>
