<script setup>
// Referencia al componente CookieConsent para abrir configuración
const openCookieSettings = () => {
  // Emitir evento para abrir el panel de configuración
  window.dispatchEvent(new CustomEvent('open-cookie-settings'))
}
</script>

<template>
  <footer class="bg-violet-700 text-white">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 class="text-xl font-bold text-white mb-4">Terapli</h3>
          <p class="text-sm leading-relaxed text-violet-200">Plataforma de gestión para terapeutas y psicólogos. Simplifica tu práctica, enfócate en tus pacientes.</p>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-4">Plataforma</h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/login" class="text-violet-200 hover:text-white transition">Acceder</NuxtLink></li>
            <li><a href="#features" class="text-violet-200 hover:text-white transition">Características</a></li>
            <li><a href="#waitlist" class="text-violet-200 hover:text-white transition">Lista de espera</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-4">Legal</h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/privacidad" class="text-violet-200 hover:text-white transition">Política de privacidad</NuxtLink></li>
            <li><NuxtLink to="/terminos" class="text-violet-200 hover:text-white transition">Términos de uso</NuxtLink></li>
            <li>
              <button @click="openCookieSettings" class="text-violet-200 hover:text-white transition text-left">
                Configurar cookies
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-violet-500/30 text-center text-sm text-violet-300">
        <p>&copy; {{ new Date().getFullYear() }} Terapli. Todos los derechos reservados.</p>
        <p class="mt-1 text-violet-400 text-xs">Versión beta - En desarrollo</p>
      </div>
    </div>
  </footer>
</template>
