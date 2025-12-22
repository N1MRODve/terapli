<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <!-- Icono -->
    <div class="mb-4">
      <slot name="icon">
        <svg 
          class="w-16 h-16 text-[#5550F2] opacity-50" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="1.5" 
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </slot>
    </div>

    <!-- Título -->
    <h3 class="text-lg font-medium text-[#2D3748] font-serif mb-2">
      {{ title }}
    </h3>

    <!-- Descripción -->
    <p class="text-sm text-[#2D3748] opacity-70 font-sans max-w-md mb-4">
      {{ description }}
    </p>

    <!-- Acción opcional -->
    <slot name="action"></slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'No hay datos disponibles'
  },
  description: {
    type: String,
    default: 'Parece que aún no hay información para mostrar aquí.'
  }
})
</script>
