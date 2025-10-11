<template>
  <div class="section-padding">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-serif mb-6">Blog</h1>
      <p class="text-lg text-cafe/80 mb-12 leading-relaxed">
        Reflexiones, herramientas y recursos para tu bienestar emocional.
      </p>

      <div class="grid md:grid-cols-2 gap-8">
        <NuxtLink v-for="article in articles" :key="article._path" :to="article._path"
          class="block bg-white p-6 rounded-lg border border-rosa hover:border-terracota transition hover:shadow-lg">
          <h2 class="text-2xl font-serif mb-3">{{ article.title }}</h2>
          <p class="text-cafe/70 mb-4">{{ article.description }}</p>
          <span class="text-sm text-terracota">Leer más →</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data: articles } = await useAsyncData('articles', () =>
  queryContent('/blog').sort({ date: -1 }).find()
)

useHead({
  title: 'Blog - Karem Peña',
  meta: [{ name: 'description', content: 'Artículos sobre psicología, bienestar emocional y autocuidado.' }]
})
</script>
