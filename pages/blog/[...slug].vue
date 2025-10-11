<template>
  <div class="section-padding">
    <article class="max-w-3xl mx-auto">
      <header class="mb-8">
        <h1 class="text-4xl md:text-5xl font-serif mb-4">{{ article.title }}</h1>
        <p class="text-lg text-cafe/70">{{ article.description }}</p>
        <time class="text-sm text-cafe/50 mt-2 block">{{ formatDate(article.date) }}</time>
      </header>

      <div class="prose prose-lg max-w-none">
        <ContentRenderer :value="article" />
      </div>

      <div class="mt-12 pt-8 border-t border-rosa">
        <NuxtLink to="/blog" class="text-terracota hover:text-cafe transition">
          ← Volver al blog
        </NuxtLink>
      </div>
    </article>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: article } = await useAsyncData(`article-${route.path}`, () =>
  queryContent(route.path).findOne()
)

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

useHead({
  title: `${article.value.title} - Karem Peña`,
  meta: [
    { name: 'description', content: article.value.description }
  ]
})
</script>

<style>
.prose h2 {
  @apply text-2xl font-serif mt-8 mb-4;
}

.prose p {
  @apply text-cafe/80 leading-relaxed mb-4;
}

.prose ul {
  @apply list-disc pl-6 space-y-2 text-cafe/80;
}
</style>
