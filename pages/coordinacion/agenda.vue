<template>
  <div>
    <NuxtLayout name="coordinacion">
      <div class="mb-8">
        <h1 class="text-3xl font-lora font-bold text-[#5D4A44] mb-2">
          Agenda de Sesiones
        </h1>
        <p class="text-[#8B7470]">
          Gestión y coordinación de todas las sesiones
        </p>
      </div>

      <!-- Vista de calendario simplificada -->
      <div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6">
        <div class="text-center py-12">
          <Icon name="heroicons:calendar-days" class="w-20 h-20 mx-auto text-[#D8AFA0] mb-4" />
          <p class="text-lg text-[#5D4A44] font-medium mb-2">Calendario en desarrollo</p>
          <p class="text-sm text-[#8B7470] mb-6">Integración con vue-cal o FullCalendar próximamente</p>
          
          <NuxtLink
            to="/coordinacion/dashboard"
            class="inline-flex items-center px-6 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C49484] transition-colors"
          >
            <Icon name="heroicons:arrow-left" class="w-5 h-5 mr-2" />
            Volver al Dashboard
          </NuxtLink>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Agenda completa requiere integración con librería de calendario
// Por ahora es un placeholder
</script>
