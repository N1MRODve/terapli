<script setup>
import { useVisitorContext } from '~/composables/useVisitorContext'

const { personalized } = useVisitorContext()

// Referencia al componente CookieConsent para abrir configuración
const openCookieSettings = () => {
  // Emitir evento para abrir el panel de configuración
  window.dispatchEvent(new CustomEvent('open-cookie-settings'))
}
</script>

<template>
  <footer class="bg-terracota text-fondo">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 class="text-xl font-serif text-white mb-4">Karem Peña</h3>
          <p class="text-sm leading-relaxed text-fondo/90">Psicóloga colegiada especializada en terapia individual con enfoque humanista e integrador.</p>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-4">Enlaces</h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/conoceme" class="text-fondo/90 hover:text-white transition">Conóceme</NuxtLink></li>
            <li><NuxtLink to="/como-empezar" class="text-fondo/90 hover:text-white transition">Cómo empezar</NuxtLink></li>
            <li><NuxtLink to="/blog" class="text-fondo/90 hover:text-white transition">Blog</NuxtLink></li>
            <li><NuxtLink to="/contacto" class="text-fondo/90 hover:text-white transition">Contacto</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-4">Legal</h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/legal/aviso-legal" class="text-fondo/90 hover:text-white transition">Aviso legal</NuxtLink></li>
            <li><NuxtLink to="/legal/privacidad" class="text-fondo/90 hover:text-white transition">Política de privacidad</NuxtLink></li>
            <li><NuxtLink to="/legal/cookies" class="text-fondo/90 hover:text-white transition">Cookies</NuxtLink></li>
            <li><NuxtLink to="/politica-de-cancelacion" class="text-fondo/90 hover:text-white transition">Política de cancelación</NuxtLink></li>
            <li>
              <button @click="openCookieSettings" class="text-fondo/90 hover:text-white transition text-left">
                ⚙️ Configurar cookies
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-fondo/20 text-center text-sm text-fondo/80">
        <p class="mb-2">
          {{ personalized(
            'Gracias por visitar este espacio. Espero que te acompañe en tu camino.',
            'Gracias por visitar este espacio, {name}. Espero que te acompañe en tu camino.'
          ) }}
        </p>
        <p>&copy; {{ new Date().getFullYear() }} Karem Peña - Psicóloga. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>
