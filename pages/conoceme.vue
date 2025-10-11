<template>
  <div class="section-padding">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-serif mb-6">Conóceme</h1>

      <div class="prose prose-lg max-w-none">
        <p class="text-lg text-cafe/80 leading-relaxed mb-6">
          Soy Karem Peña, psicóloga colegiada con enfoque humanista e integrador. Mi objetivo es crear un espacio seguro donde puedas ser tú mismo sin juicios.
        </p>

        <h2 class="text-2xl font-serif mb-4 mt-8">Mi forma de trabajar</h2>
        <p class="text-cafe/80 leading-relaxed mb-6">
          Creo en la terapia como un proceso colaborativo. No tengo fórmulas mágicas, pero sí herramientas probadas y, sobre todo, una escucha atenta y comprometida. Adapto cada proceso a tus necesidades, ritmo y objetivos personales.
        </p>

        <h2 class="text-2xl font-serif mb-4 mt-8">Formación y enfoque</h2>
        <p class="text-cafe/80 leading-relaxed mb-6">
          Mi trabajo integra diferentes corrientes terapéuticas según lo que cada persona necesite: terapia cognitivo-conductual, humanista, y técnicas de regulación emocional. Me especializo en ansiedad, autoestima, relaciones y procesos migratorios.
        </p>

        <div class="mt-12 p-8 bg-rosa/30 rounded-lg">
          <p class="text-cafe/80 italic">
            "Cada persona tiene su propio tiempo y su propia historia. Mi rol es acompañarte en tu proceso con calidez, respeto y profesionalidad."
          </p>
        </div>

        <div class="mt-8">
          <NuxtLink to="/reservar" class="inline-block bg-terracota text-white px-8 py-3 rounded-full hover:bg-cafe transition">
            Agenda tu orientación gratuita
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Conóceme - Karem Peña',
  meta: [{ name: 'description', content: 'Conoce a Karem Peña, psicóloga colegiada en Madrid Sur con enfoque humanista e integrador.' }]
})
</script>
