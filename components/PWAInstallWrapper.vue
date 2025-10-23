<template>
  <div>
    <!-- El contenido de tu página aquí -->
    <slot />
    
    <!-- Modal de instalación PWA -->
    <ClientOnly>
      <InstallPWAModal
        :show="showModal"
        @install="handleInstall"
        @dismiss="handleDismiss"
        @neverShow="handleNeverShow"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
/**
 * Wrapper component que automáticamente muestra el modal PWA
 * cuando es apropiado.
 * 
 * Uso:
 * <PWAInstallWrapper>
 *   <tu-contenido />
 * </PWAInstallWrapper>
 */

const {
  showInstallModal,
  shouldShowAutoPrompt,
  promptInstall,
  dismissInstallPrompt
} = usePWAInstallPrompt()

const showModal = ref(false)

// Verificar si mostrar el modal automáticamente después de un delay
onMounted(() => {
  // Verificar si el usuario no ha pedido nunca más ver el modal
  if (process.client) {
    const neverShow = localStorage.getItem('pwa-install-never-show')
    if (neverShow === 'true') return
  }

  // Esperar 3 segundos antes de verificar si mostrar el modal
  setTimeout(() => {
    if (shouldShowAutoPrompt()) {
      showModal.value = true
    }
  }, 3000)
})

// También escuchar cambios del composable
watch(showInstallModal, (value) => {
  showModal.value = value
})

const handleInstall = async () => {
  const installed = await promptInstall()
  if (installed) {
    showModal.value = false
  }
}

const handleDismiss = () => {
  showModal.value = false
  dismissInstallPrompt()
}

const handleNeverShow = () => {
  showModal.value = false
  if (process.client) {
    localStorage.setItem('pwa-install-never-show', 'true')
  }
}
</script>
