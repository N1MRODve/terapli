<template>
  <div class="section-padding">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-serif mb-6">Relaciones</h1>
      <p class="text-lg text-cafe/80 mb-8 leading-relaxed">
        Las dificultades en nuestras relaciones afectan profundamente nuestro bienestar. Trabajaremos en construir vínculos más sanos y auténticos.
      </p>

      <h2 class="text-2xl font-serif mb-4">Áreas de trabajo:</h2>
      <ul class="space-y-3 mb-8 text-cafe/80">
        <li>• Comunicación asertiva y resolución de conflictos</li>
        <li>• Dependencia emocional y apego</li>
        <li>• Establecimiento de límites saludables</li>
        <li>• Patrones relacionales y autoconocimiento</li>
      </ul>

      <NuxtLink to="/reservar" class="inline-block bg-terracota text-white px-8 py-3 rounded-full hover:bg-cafe transition">
        Reserva tu sesión
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Relaciones - Karem Peña',
  meta: [{ name: 'description', content: 'Terapia para mejorar relaciones interpersonales y vínculos afectivos en Madrid Sur.' }]
})
</script>
