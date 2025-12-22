<template>
  <div class="w-full">
    <!-- Etiqueta opcional -->
    <div v-if="label" class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-[#2D3748] font-sans">
        {{ label }}
      </span>
      <span class="text-sm text-[#2D3748] font-sans">
        {{ current }} / {{ total }}
      </span>
    </div>

    <!-- Barra de progreso -->
    <div class="relative w-full bg-[#F2F2F2] rounded-full h-3 overflow-hidden border border-[#E2E8F0]">
      <div 
        class="h-full transition-all duration-500 ease-out rounded-full"
        :class="[
          progressColorClass,
          { 'animate-pulse': animated }
        ]"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>

    <!-- Texto inferior opcional -->
    <p v-if="showPercentage" class="text-xs text-[#2D3748] opacity-70 mt-1 font-sans">
      {{ percentage }}% completado
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  current: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  showPercentage: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'primary', // 'primary', 'rosa', 'success', 'warning'
    validator: (value) => ['primary', 'rosa', 'success', 'warning'].includes(value)
  }
})

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.current / props.total) * 100)
})

const progressColorClass = computed(() => {
  switch (props.color) {
    case 'rosa':
      return 'bg-[#E2E8F0]'
    case 'success':
      return 'bg-green-400'
    case 'warning':
      return 'bg-yellow-400'
    default:
      return 'bg-purple-600'
  }
})
</script>
