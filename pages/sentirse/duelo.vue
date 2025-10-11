<template>
  <div class="section-padding">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-serif mb-6">Duelo</h1>
      <p class="text-lg text-cafe/80 mb-8 leading-relaxed">
        El duelo no solo es la pérdida de un ser querido, también puede ser una ruptura, un cambio vital o el cierre de una etapa. Te acompaño con respeto y comprensión.
      </p>

      <h2 class="text-2xl font-serif mb-4">Te ayudaré a:</h2>
      <ul class="space-y-3 mb-8 text-cafe/80">
        <li>• Transitar el dolor con compasión</li>
        <li>• Validar y expresar tus emociones</li>
        <li>• Encontrar formas saludables de recordar</li>
        <li>• Reconstruir tu vida con sentido</li>
      </ul>

      <NuxtLink to="/reservar" class="inline-block bg-terracota text-white px-8 py-3 rounded-full hover:bg-cafe transition">
        Agenda tu cita
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Duelo - Karem Peña',
  meta: [{ name: 'description', content: 'Acompañamiento en procesos de duelo y pérdida en Madrid Sur.' }]
})
</script>
