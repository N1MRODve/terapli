<template>
  <div class="section-padding">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl md:text-5xl font-serif mb-6">¿Cómo te sientes?</h1>
      <p class="text-lg text-cafe/80 mb-12 leading-relaxed">
        Cada persona vive experiencias únicas. Selecciona lo que más resuena contigo para saber cómo puedo acompañarte.
      </p>

      <div class="grid md:grid-cols-2 gap-6">
        <NuxtLink v-for="area in areas" :key="area.slug" :to="`/sentirse/${area.slug}`"
          class="p-8 bg-white rounded-lg border-2 border-rosa hover:border-terracota transition shadow-sm hover:shadow-md">
          <h2 class="text-2xl font-serif mb-3">{{ area.titulo }}</h2>
          <p class="text-cafe/70">{{ area.descripcion }}</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const areas = [
  { slug: 'ansiedad', titulo: 'Ansiedad', descripcion: 'Preocupación constante, inquietud, sensación de peligro o pánico.' },
  { slug: 'autoestima', titulo: 'Autoestima', descripcion: 'Inseguridad, autocrítica excesiva, dificultad para valorarte.' },
  { slug: 'relaciones', titulo: 'Relaciones', descripcion: 'Conflictos interpersonales, dependencia emocional, límites.' },
  { slug: 'duelo', titulo: 'Duelo', descripcion: 'Pérdida de un ser querido, cambios vitales, procesos de cierre.' },
  { slug: 'migracion', titulo: 'Migración', descripcion: 'Adaptación cultural, nostalgia, identidad en un nuevo país.' }
]

useHead({
  title: 'Cómo te sientes - Karem Peña',
  meta: [{ name: 'description', content: 'Identifica lo que estás viviendo y descubre cómo puedo acompañarte.' }]
})
</script>
