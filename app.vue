<script setup>
import { ref } from 'vue'
import { Analytics } from '@vercel/analytics/nuxt'

// Mostrar panel de debug (solo en desarrollo)
const mostrarDebug = ref(process.env.NODE_ENV === 'development')

// Metadatos PWA para iOS
useHead({
  meta: [
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'Psicóloga Karem' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'theme-color', content: '#D8AFA0' }
  ],
  link: [
    { rel: 'apple-touch-icon', href: '/icons/icon-512x512.png' },
    { rel: 'apple-touch-icon', sizes: '192x192', href: '/icons/icon-192x192.png' },
    { rel: 'apple-touch-icon', sizes: '512x512', href: '/icons/icon-512x512.png' }
  ]
})

// Atajos de teclado para activar/desactivar debug
onMounted(() => {
  if (process.client) {
    window.addEventListener('keydown', (e) => {
      // Ctrl+Shift+D o Cmd+Shift+D para toggle debug
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        mostrarDebug.value = !mostrarDebug.value
        console.log('🔍 Debug panel:', mostrarDebug.value ? 'Activado' : 'Desactivado')
      }
    })
  }
})
</script>

<template>
  <div class="bg-fondo min-h-screen">
    <NuxtLayout>
      <NuxtPage :transition="{
        name: 'fade-route',
        mode: 'out-in'
      }" />
    </NuxtLayout>
    
    <!-- Panel de debug de autenticación -->
    <AuthDebugPanel 
      v-if="mostrarDebug" 
      :mostrar="mostrarDebug"
      @cerrar="mostrarDebug = false" 
    />
    
    <!-- Analytics de Vercel -->
    <Analytics />
  </div>
</template>

<style>
/* Smooth fade transitions for page navigation */
.fade-route-enter-active,
.fade-route-leave-active {
  transition: opacity 700ms ease-out;
}

.fade-route-enter-from,
.fade-route-leave-to {
  opacity: 0;
}

/* Page enter animation */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
}
</style>
