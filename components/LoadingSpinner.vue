<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div class="relative">
      <!-- Spinner circular -->
      <div 
        class="w-12 h-12 border-4 border-[#E2E8F0] border-t-[#5550F2] rounded-full animate-spin"
        :class="sizeClass"
      ></div>
      
      <!-- Texto opcional -->
      <p v-if="text" class="mt-4 text-sm text-[#2D3748] font-sans text-center">
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  text: {
    type: String,
    default: ''
  },
  fullHeight: {
    type: Boolean,
    default: false
  }
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-8 h-8 border-2'
    case 'large':
      return 'w-16 h-16 border-4'
    default:
      return 'w-12 h-12 border-4'
  }
})

const containerClass = computed(() => {
  return props.fullHeight ? 'min-h-[400px]' : 'py-8'
})
</script>
