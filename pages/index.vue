<template>
  <div>
    <section class="section-padding bg-gradient-to-br from-fondo via-rosa/20 to-fondo">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-serif mb-6 leading-tight">
          ¿Sientes que la preocupación se ha apoderado de tu día a día?
        </h1>
        <p class="text-xl text-cafe/80 mb-8 leading-relaxed">
          No estás solo. Estoy aquí para acompañarte en este proceso con calidez, respeto y profesionalidad.
        </p>
        <NuxtLink to="/reservar" class="inline-block bg-terracota text-white px-8 py-4 rounded-full text-lg hover:bg-cafe transition shadow-lg">
          Agenda tu orientación gratuita
        </NuxtLink>
      </div>
    </section>

    <section class="section-padding bg-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-serif text-center mb-12">¿Cómo puedo ayudarte?</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <NuxtLink to="/sentirse/ansiedad" class="block p-6 bg-fondo rounded-lg hover:shadow-lg transition">
            <h3 class="text-xl font-serif mb-3">Ansiedad</h3>
            <p class="text-cafe/70">Recupera la calma y aprende a gestionar la preocupación constante.</p>
          </NuxtLink>
          <NuxtLink to="/sentirse/autoestima" class="block p-6 bg-fondo rounded-lg hover:shadow-lg transition">
            <h3 class="text-xl font-serif mb-3">Autoestima</h3>
            <p class="text-cafe/70">Reconéctate con tu valor y fortalece tu confianza personal.</p>
          </NuxtLink>
          <NuxtLink to="/sentirse/relaciones" class="block p-6 bg-fondo rounded-lg hover:shadow-lg transition">
            <h3 class="text-xl font-serif mb-3">Relaciones</h3>
            <p class="text-cafe/70">Mejora tus vínculos y construye relaciones más saludables.</p>
          </NuxtLink>
          <NuxtLink to="/sentirse/duelo" class="block p-6 bg-fondo rounded-lg hover:shadow-lg transition">
            <h3 class="text-xl font-serif mb-3">Duelo</h3>
            <p class="text-cafe/70">Acompañamiento en procesos de pérdida con respeto y comprensión.</p>
          </NuxtLink>
          <NuxtLink to="/sentirse/migracion" class="block p-6 bg-fondo rounded-lg hover:shadow-lg transition">
            <h3 class="text-xl font-serif mb-3">Migración</h3>
            <p class="text-cafe/70">Apoyo en la adaptación a un nuevo país y cultura.</p>
          </NuxtLink>
          <NuxtLink to="/sentirse" class="block p-6 bg-terracota/10 rounded-lg hover:shadow-lg transition border-2 border-terracota">
            <h3 class="text-xl font-serif mb-3">Ver más</h3>
            <p class="text-cafe/70">Explora todas las áreas en las que puedo acompañarte.</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="section-padding bg-fondo">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-serif mb-6">Un espacio seguro para ti</h2>
        <p class="text-lg text-cafe/80 leading-relaxed mb-8">
          En mis sesiones encontrarás un ambiente cálido, confidencial y sin juicios. Trabajo desde un enfoque humanista e integrador, adaptando cada proceso a tus necesidades únicas.
        </p>
        <NuxtLink to="/conoceme" class="text-terracota hover:text-cafe transition font-semibold">
          Descubre más sobre mi forma de trabajar →
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
useHead({
  title: 'Inicio - Karem Peña Psicóloga en Madrid Sur',
  meta: [
    { name: 'description', content: 'Terapia psicológica con calidez y profesionalidad. Especializada en ansiedad, autoestima, relaciones y procesos migratorios en Madrid Sur.' }
  ]
})
</script>
