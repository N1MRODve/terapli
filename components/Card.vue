<template>
  <div 
    class="bg-white rounded-lg shadow-sm border border-rose-100 p-6 transition-all duration-200 hover:shadow-md"
    :class="[
      paddingClass,
      { 'cursor-pointer': clickable }
    ]"
    @click="handleClick"
  >
    <!-- Header opcional -->
    <div v-if="title || $slots.header" class="mb-4">
      <slot name="header">
        <h3 class="text-lg font-medium text-[#5D4A44] font-['Lora']">
          {{ title }}
        </h3>
      </slot>
    </div>

    <!-- Contenido principal -->
    <div>
      <slot></slot>
    </div>

    <!-- Footer opcional -->
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-rose-100">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  padding: {
    type: String,
    default: 'normal', // 'normal', 'compact', 'none'
    validator: (value) => ['normal', 'compact', 'none'].includes(value)
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const paddingClass = computed(() => {
  switch (props.padding) {
    case 'compact':
      return 'p-4'
    case 'none':
      return 'p-0'
    default:
      return 'p-6'
  }
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>
