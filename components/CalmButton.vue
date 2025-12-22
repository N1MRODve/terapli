<template>
  <component 
    :is="to ? 'NuxtLink' : 'button'" 
    :to="to"
    :type="!to ? 'button' : undefined"
    :class="buttonClasses"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
interface Props {
  to?: string
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-[#5550F2] hover:bg-[#C5968B] text-white focus:ring-[#5550F2]/50',
    secondary: 'border-2 border-[#5550F2] text-[#5550F2] hover:bg-[#5550F2] hover:text-white focus:ring-[#5550F2]/50',
    tertiary: 'text-[#2D3748] hover:text-[#5550F2] hover:bg-[#5550F2]/10 focus:ring-[#5550F2]/50'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return [base, variants[props.variant], sizes[props.size], disabledClasses].join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>