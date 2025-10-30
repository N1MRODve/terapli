<template>
  <div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div class="text-center text-gray-400">
        <span class="text-6xl mb-4 block">💬</span>
        <h3 class="text-xl font-semibold text-cafe mb-2">
          Mensajería con Pacientes
        </h3>
        <p class="text-gray-600">
          Aquí se mostrará el sistema de mensajes con pacientes
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'coordinadora',
  middleware: ['auth', 'role-coordinadora']
})
</script>
