<template>
  <transition name="fade" mode="out-in" appear>
    <div 
      v-if="show" 
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F9F7F3] text-center px-6"
      role="status"
      aria-live="polite"
    >
      <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] animate-fade-in-up max-w-3xl">
        {{ visitorName 
          ? `${visitorName}, me alegra que hayas llegado hasta aquí.` 
          : 'Me alegra que hayas llegado hasta aquí.' }}
      </h2>
      <p class="text-lg md:text-xl text-[#5D4A44]/80 mt-6 animate-fade-in-up [animation-delay:0.4s] max-w-2xl leading-relaxed">
        Ahora te explico cómo puedes comenzar tu proceso.
      </p>
      
      <!-- Subtle breathing indicator -->
      <div class="mt-12 w-3 h-3 bg-[#D8AFA0] rounded-full animate-pulse opacity-40"></div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVisitorContext } from '@/composables/useVisitorContext'

const router = useRouter()
const { visitorName } = useVisitorContext()
const show = ref(true)

onMounted(() => {
  // Smooth transition after 2.5 seconds
  setTimeout(() => {
    show.value = false
    // Wait for fade-out animation to complete before navigating
    setTimeout(() => {
      router.push('/como-empezar')
    }, 800)
  }, 2500)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
