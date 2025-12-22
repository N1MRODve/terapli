<template>
  <NuxtLink
    :to="to"
    class="group block bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    :class="colorClass"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center space-x-3 mb-3">
          <div 
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="iconBgClass"
          >
            <Icon :name="icon" class="w-6 h-6" :class="iconColorClass" />
          </div>
          <div>
            <h3 class="text-sm font-medium text-[#8B7470]">{{ title }}</h3>
            <p class="text-3xl font-bold font-lora text-[#2D3748] mt-1">
              {{ count }}
            </p>
          </div>
        </div>
        
        <p v-if="subtitle" class="text-sm text-[#8B7470] mt-2">
          {{ subtitle }}
        </p>
      </div>

      <Icon 
        name="heroicons:arrow-right" 
        class="w-5 h-5 text-[#A89B97] opacity-0 group-hover:opacity-100 transition-opacity" 
      />
    </div>

    <!-- Badge opcional -->
    <div v-if="badge" class="mt-4 pt-4 border-t border-[#E8DFD8]">
      <span 
        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
        :class="badgeClass"
      >
        <span class="w-2 h-2 rounded-full mr-2" :class="badgeDotClass"></span>
        {{ badge }}
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  title: string
  count: number | string
  icon: string
  to: string
  subtitle?: string
  badge?: string
  variant?: 'default' | 'warning' | 'success' | 'danger'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

// Clases dinámicas según variante
const colorClass = computed(() => {
  const classes = {
    default: 'border-[#E8DFD8]',
    warning: 'border-yellow-200',
    success: 'border-green-200',
    danger: 'border-red-200'
  }
  return classes[props.variant]
})

const iconBgClass = computed(() => {
  const classes = {
    default: 'bg-gradient-to-br from-[#5550F2] to-[#C49484]',
    warning: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
    success: 'bg-gradient-to-br from-green-400 to-green-500',
    danger: 'bg-gradient-to-br from-red-400 to-red-500'
  }
  return classes[props.variant]
})

const iconColorClass = computed(() => {
  return 'text-white'
})

const badgeClass = computed(() => {
  const classes = {
    default: 'bg-blue-50 text-blue-700',
    warning: 'bg-yellow-50 text-yellow-700',
    success: 'bg-green-50 text-green-700',
    danger: 'bg-red-50 text-red-700'
  }
  return classes[props.variant]
})

const badgeDotClass = computed(() => {
  const classes = {
    default: 'bg-blue-500',
    warning: 'bg-yellow-500',
    success: 'bg-green-500',
    danger: 'bg-red-500'
  }
  return classes[props.variant]
})
</script>
