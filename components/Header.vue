<template>
  <header class="bg-fondo border-b border-rosa sticky top-0 z-50">
    <nav class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <NuxtLink to="/" class="text-2xl font-serif text-cafe hover:text-terracota transition">
          Karem Peña
        </NuxtLink>

        <button @click="menuOpen = !menuOpen" class="md:hidden text-cafe">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <ul class="hidden md:flex items-center space-x-8">
          <li><NuxtLink to="/sentirse" class="nav-link">Cómo te sientes</NuxtLink></li>
          <li><NuxtLink to="/conoceme" class="nav-link">Conóceme</NuxtLink></li>
          <li><NuxtLink to="/como-empezar" class="nav-link">Cómo empezar</NuxtLink></li>
          <li><NuxtLink to="/blog" class="nav-link">Blog</NuxtLink></li>
          <li><NuxtLink to="/contacto" class="nav-link">Contacto</NuxtLink></li>
          <li><NuxtLink to="/reservar" class="btn-primary">Reservar cita</NuxtLink></li>
        </ul>
      </div>

      <div v-if="menuOpen" class="md:hidden mt-4 pb-4 space-y-3">
        <NuxtLink to="/sentirse" class="block nav-link">Cómo te sientes</NuxtLink>
        <NuxtLink to="/conoceme" class="block nav-link">Conóceme</NuxtLink>
        <NuxtLink to="/como-empezar" class="block nav-link">Cómo empezar</NuxtLink>
        <NuxtLink to="/blog" class="block nav-link">Blog</NuxtLink>
        <NuxtLink to="/contacto" class="block nav-link">Contacto</NuxtLink>
        <NuxtLink to="/reservar" class="btn-primary inline-block mt-2">Reservar cita</NuxtLink>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)
</script>

<style scoped>
.nav-link {
  @apply text-cafe hover:text-terracota transition font-body;
}

.btn-primary {
  @apply bg-terracota text-white px-6 py-2 rounded-full hover:bg-cafe transition;
}
</style>
