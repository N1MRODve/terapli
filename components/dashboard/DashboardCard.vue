<template>
  <div 
    class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
    :class="customClass"
  >
    <slot />
  </div>
</template>

<script setup>
defineProps({
  customClass: {
    type: String,
    default: ''
  }
})
</script>
