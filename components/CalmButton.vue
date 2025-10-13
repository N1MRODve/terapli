<template>
  <component
    :is="componentType"
    :to="isInternalLink ? to : undefined"
    :href="isExternalLink ? to : undefined"
    :target="isExternalLink ? '_blank' : undefined"
    :rel="isExternalLink ? 'noopener noreferrer' : undefined"
    :type="!to ? type : undefined"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :class="buttonClasses"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'tertiary', 'whatsapp'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  to: {
    type: String,
    default: null
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  ariaLabel: {
    type: String,
    default: null
  },
  breathing: {
    type: Boolean,
    default: null // Si es null, será true automáticamente para variant="primary"
  }
})

// Detectar si es un enlace externo
const isExternalLink = computed(() => {
  if (!props.to) return false
  return props.to.startsWith('http://') || props.to.startsWith('https://') || props.to.startsWith('tel:') || props.to.startsWith('mailto:')
})

const isInternalLink = computed(() => {
  return props.to && !isExternalLink.value
})

const componentType = computed(() => {
  if (!props.to) return 'button'
  return isExternalLink.value ? 'a' : 'NuxtLink'
})

const buttonClasses = computed(() => {
  const classes = []

  // Base classes - transiciones suaves y accesibilidad
  classes.push(
    'relative',
    'overflow-hidden',
    'rounded-full',
    'font-medium',
    'transition-all',
    'duration-700',
    'ease-in-out',
    'focus:outline-none',
    'transform',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:transform-none',
    'inline-block',
    'text-center'
  )

  // Variantes de estilo
  switch (props.variant) {
    case 'primary':
      classes.push(
        'bg-gradient-to-r',
        'from-terracota',
        'to-[#EFA08B]',
        'text-white',
        'shadow-md',
        'hover:shadow-lg',
        'hover:scale-[1.03]',
        'active:scale-[0.98]',
        'focus:ring-2',
        'focus:ring-terracota/40',
        'focus:ring-offset-2'
      )
      break
    
    case 'secondary':
      classes.push(
        'text-cafe',
        'border',
        'border-rosa-empolvado',
        'hover:bg-rosa-empolvado/20',
        'hover:scale-[1.02]',
        'active:scale-[0.98]',
        'focus:ring-2',
        'focus:ring-rosa-empolvado/30',
        'focus:ring-offset-2'
      )
      break
    
    case 'whatsapp':
      classes.push(
        'bg-[#D8AFA0]',
        'text-[#5D4A44]',
        'rounded-2xl',
        'shadow-md',
        'hover:bg-[#EAD5D3]',
        'hover:shadow-lg',
        'hover:scale-[1.03]',
        'active:scale-[0.98]',
        'focus:ring-2',
        'focus:ring-[#D8AFA0]/40',
        'focus:ring-offset-2',
        'font-lato'
      )
      break
    
    case 'tertiary':
      classes.push(
        'text-terracota',
        'hover:text-cafe',
        'underline',
        'decoration-terracota/30',
        'hover:decoration-cafe/50',
        'underline-offset-4',
        'hover:underline-offset-8',
        'active:scale-[0.98]',
        'focus:ring-2',
        'focus:ring-terracota/20',
        'focus:ring-offset-2',
        'rounded-md'
      )
      break
  }

  // Tamaños con mejor espaciado (más "respiración")
  switch (props.size) {
    case 'sm':
      classes.push('px-6', 'py-2.5', 'text-sm')
      break
    case 'md':
      classes.push('px-8', 'py-3.5', 'text-base')
      break
    case 'lg':
      classes.push('px-10', 'py-4', 'md:px-12', 'md:py-5', 'text-base', 'md:text-lg')
      break
  }

  // Efecto de respiración calmada
  // Por defecto, solo los botones primarios "respiran" (a menos que se especifique lo contrario)
  const shouldBreathe = props.breathing !== null 
    ? props.breathing 
    : props.variant === 'primary'

  if (shouldBreathe && !props.disabled) {
    classes.push('calm-button')
  }

  return classes.join(' ')
})
</script>

<style scoped>
/* Los estilos de animación están en assets/css/main.css */
</style>
