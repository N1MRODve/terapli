<template>
  <div class="bg-[#F9F7F3] min-h-screen text-[#5D4A44]">
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
    
    <!-- Inactivity Modal -->
    <InactivityModal 
      :show="showInactivityModal" 
      @confirm="confirmStillHere"
    />

    <!-- Cookie Consent Banner -->
    <CookieConsent />
  </div>
</template>

<script setup>
import { useInactivityDetector } from '@/composables/useInactivityDetector'

const { showInactivityModal, confirmStillHere } = useInactivityDetector()
</script>
