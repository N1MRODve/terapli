<template>
  <div class="section-padding">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-serif mb-6">Cómo empezar</h1>
      <p class="text-lg text-cafe/80 mb-12 leading-relaxed">
        Dar el primer paso es lo más difícil. Aquí te explico cómo funciona el proceso para que te sientas seguro desde el inicio.
      </p>

      <div class="space-y-8">
        <div class="flex gap-6">
          <div class="flex-shrink-0 w-12 h-12 bg-terracota text-white rounded-full flex items-center justify-center text-xl font-serif">1</div>
          <div>
            <h2 class="text-2xl font-serif mb-2">Orientación gratuita</h2>
            <p class="text-cafe/80">Agenda una videollamada de 20 minutos sin costo donde conversaremos sobre tu situación y cómo puedo ayudarte.</p>
          </div>
        </div>

        <div class="flex gap-6">
          <div class="flex-shrink-0 w-12 h-12 bg-terracota text-white rounded-full flex items-center justify-center text-xl font-serif">2</div>
          <div>
            <h2 class="text-2xl font-serif mb-2">Primera sesión</h2>
            <p class="text-cafe/80">Si decidimos trabajar juntas, agendaremos la primera sesión donde exploraremos más a fondo tu situación y objetivos.</p>
          </div>
        </div>

        <div class="flex gap-6">
          <div class="flex-shrink-0 w-12 h-12 bg-terracota text-white rounded-full flex items-center justify-center text-xl font-serif">3</div>
          <div>
            <h2 class="text-2xl font-serif mb-2">Proceso terapéutico</h2>
            <p class="text-cafe/80">Trabajaremos juntas con sesiones regulares, adaptando el ritmo y las herramientas a tus necesidades específicas.</p>
          </div>
        </div>
      </div>

      <div class="mt-12 p-8 bg-fondo rounded-lg border border-rosa">
        <h3 class="text-xl font-serif mb-4">Información práctica</h3>
        <ul class="space-y-2 text-cafe/80">
          <li>• Sesiones de 50 minutos</li>
          <li>• Formato online o presencial (Madrid Sur)</li>
          <li>• Bonos de sesiones disponibles con descuento</li>
          <li>• Cancelación gratuita con 24h de antelación</li>
        </ul>
      </div>

      <div class="mt-8">
        <NuxtLink to="/reservar" class="inline-block bg-terracota text-white px-8 py-3 rounded-full hover:bg-cafe transition">
          Reserva tu orientación gratuita
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Cómo empezar - Karem Peña',
  meta: [{ name: 'description', content: 'Descubre cómo funciona el proceso terapéutico y dar el primer paso hacia tu bienestar.' }]
})
</script>
