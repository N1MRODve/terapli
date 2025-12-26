<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: MetricCard
 * =============================================================================
 * Tarjeta de métrica para el dashboard con diseño moderno y consistente.
 */

defineProps<{
  value: string | number
  label: string
  sublabel?: string
  icon: string
  variant?: 'purple' | 'green' | 'blue' | 'amber' | 'neutral'
  to?: string
}>()

const variantClasses = {
  purple: {
    bg: 'bg-gradient-to-br from-violet-50 to-purple-50',
    border: 'border-violet-200/60',
    icon: 'bg-violet-100 text-violet-600',
    value: 'text-violet-900',
    label: 'text-violet-700/80'
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    border: 'border-emerald-200/60',
    icon: 'bg-emerald-100 text-emerald-600',
    value: 'text-emerald-900',
    label: 'text-emerald-700/80'
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200/60',
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-900',
    label: 'text-blue-700/80'
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    border: 'border-amber-200/60',
    icon: 'bg-amber-100 text-amber-600',
    value: 'text-amber-900',
    label: 'text-amber-700/80'
  },
  neutral: {
    bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
    border: 'border-gray-200/60',
    icon: 'bg-gray-100 text-gray-600',
    value: 'text-gray-900',
    label: 'text-gray-700/80'
  }
}
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'div'"
    :to="to"
    class="relative p-5 rounded-2xl border transition-all duration-200"
    :class="[
      variantClasses[variant || 'purple'].bg,
      variantClasses[variant || 'purple'].border,
      to ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer group' : ''
    ]"
  >
    <!-- Icono -->
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform"
      :class="[
        variantClasses[variant || 'purple'].icon,
        to ? 'group-hover:scale-110' : ''
      ]"
    >
      <span class="text-xl">{{ icon }}</span>
    </div>

    <!-- Valor -->
    <p
      class="text-3xl font-bold tracking-tight"
      :class="variantClasses[variant || 'purple'].value"
    >
      {{ value }}
    </p>

    <!-- Label -->
    <p
      class="text-sm font-medium mt-1"
      :class="variantClasses[variant || 'purple'].label"
    >
      {{ label }}
    </p>

    <!-- Sublabel -->
    <p
      v-if="sublabel"
      class="text-xs mt-0.5 font-medium"
      :class="variantClasses[variant || 'purple'].label"
    >
      {{ sublabel }}
    </p>

    <!-- Arrow indicator for links -->
    <div
      v-if="to"
      class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <svg class="w-5 h-5" :class="variantClasses[variant || 'purple'].label" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </component>
</template>
