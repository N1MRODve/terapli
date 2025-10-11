<template>
  <footer class="bg-cafe text-rosa border-t border-terracota">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-xl font-serif text-white mb-4">Karem Peña</h3>
          <p class="text-sm leading-relaxed">Psicóloga colegiada especializada en terapia individual con enfoque humanista e integrador.</p>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-4">Enlaces</h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/conoceme" class="hover:text-white transition">Conóceme</NuxtLink></li>
            <li><NuxtLink to="/como-empezar" class="hover:text-white transition">Cómo empezar</NuxtLink></li>
            <li><NuxtLink to="/blog" class="hover:text-white transition">Blog</NuxtLink></li>
            <li><NuxtLink to="/contacto" class="hover:text-white transition">Contacto</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-4">Legal</h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/legal/aviso-legal" class="hover:text-white transition">Aviso legal</NuxtLink></li>
            <li><NuxtLink to="/legal/privacidad" class="hover:text-white transition">Política de privacidad</NuxtLink></li>
            <li><NuxtLink to="/legal/cookies" class="hover:text-white transition">Cookies</NuxtLink></li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-terracota text-center text-sm">
        <p>&copy; {{ new Date().getFullYear() }} Karem Peña - Psicóloga. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>
