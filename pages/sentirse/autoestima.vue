<template>
  <div class="section-padding">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-serif mb-6">Autoestima</h1>
      <p class="text-lg text-cafe/80 mb-8 leading-relaxed">
        Si sientes que no eres suficiente, te comparas constantemente o te cuesta reconocer tu valor, trabajaremos juntos para reconstruir tu confianza.
      </p>

      <h2 class="text-2xl font-serif mb-4">En terapia trabajaremos:</h2>
      <ul class="space-y-3 mb-8 text-cafe/80">
        <li>• Identificar patrones de autocrítica y su origen</li>
        <li>• Desarrollar autocompasión y aceptación</li>
        <li>• Fortalecer tu autoimagen y confianza</li>
        <li>• Establecer límites saludables</li>
      </ul>

      <NuxtLink to="/reservar" class="inline-block bg-terracota text-white px-8 py-3 rounded-full hover:bg-cafe transition">
        Comienza tu proceso
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Autoestima - Karem Peña',
  meta: [{ name: 'description', content: 'Terapia para fortalecer la autoestima y confianza personal en Madrid Sur.' }]
})
</script>
