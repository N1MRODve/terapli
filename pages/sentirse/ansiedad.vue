<template>
  <div class="section-padding">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-serif mb-6">Ansiedad</h1>
      <p class="text-lg text-cafe/80 mb-8 leading-relaxed">
        La ansiedad puede manifestarse como preocupación constante, sensación de peligro inminente, inquietud física o ataques de pánico. No tienes que vivir así.
      </p>

      <h2 class="text-2xl font-serif mb-4">¿Cómo te puedo ayudar?</h2>
      <ul class="space-y-3 mb-8 text-cafe/80">
        <li>• Identificar los desencadenantes de tu ansiedad</li>
        <li>• Aprender técnicas de regulación emocional</li>
        <li>• Desarrollar estrategias para gestionar el estrés</li>
        <li>• Recuperar la sensación de control y calma</li>
      </ul>

      <NuxtLink to="/reservar" class="inline-block bg-terracota text-white px-8 py-3 rounded-full hover:bg-cafe transition">
        Agenda tu primera sesión
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Ansiedad - Karem Peña',
  meta: [{ name: 'description', content: 'Terapia para ansiedad, ataques de pánico y preocupación constante en Madrid Sur.' }]
})
</script>
