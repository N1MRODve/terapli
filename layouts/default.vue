<template>
  <div class="bg-[#F9F7F3] min-h-screen text-[#5D4A44]">
    <Header />
    <main>
      <slot />
    </main>
    <Footer />

    <!-- Inactivity Modal - Solo en cliente -->
    <ClientOnly>
      <InactivityModal
        :show="showInactivityModal"
        @confirm="handleConfirmStillHere"
      />
    </ClientOnly>

    <!-- Cookie Consent Banner -->
    <CookieConsent />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useInactivityDetector } from '@/composables/useInactivityDetector'

// Usar el composable - es seguro porque internamente verifica import.meta.client
const { showInactivityModal, confirmStillHere } = useInactivityDetector()

const handleConfirmStillHere = () => {
  confirmStillHere()
}
</script>
