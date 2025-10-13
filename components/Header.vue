<template>
  <header 
    :class="[
      'fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out',
      scrolled ? 'w-[95%] max-w-5xl' : 'w-[95%] max-w-6xl'
    ]"
  >
    <!-- Glassmorphic Pill Container with Gradient Background -->
    <nav 
      :class="[
        'backdrop-blur-xl border border-white/40 shadow-lg transition-all duration-500 ease-in-out',
        'rounded-full px-5',
        scrolled ? 'py-2' : 'py-3'
      ]"
      style="background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(249,247,243,0.5) 100%);"
    >
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink 
          to="/" 
          class="flex items-center hover:opacity-80 transition-all duration-300 flex-shrink-0"
        >
          <img 
            src="/images/Karem-Logo-purpu.png" 
            alt="Karem Peña"
            :class="[
              'transition-all duration-500',
              scrolled ? 'h-6' : 'h-8'
            ]"
          />
        </NuxtLink>

        <!-- Mobile Menu Button -->
        <button 
          @click="menuOpen = !menuOpen" 
          class="md:hidden text-cafe hover:text-terracota transition-colors p-2 rounded-full hover:bg-white/50"
          aria-label="Toggle menu"
        >
          <svg 
            class="w-6 h-6 transition-transform duration-300" 
            :class="{ 'rotate-90': menuOpen }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              v-if="!menuOpen"
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M4 6h16M4 12h16M4 18h16" 
            />
            <path 
              v-else
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>

        <!-- Desktop Navigation -->
        <ul class="hidden md:flex items-center space-x-1 lg:space-x-2">
          <li>
            <NuxtLink to="/" class="nav-link">
              Inicio
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/sentirse" class="nav-link">
              Cómo te sientes
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/conoceme" class="nav-link">
              Conóceme
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/como-empezar" class="nav-link">
              Cómo empezar
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/blog" class="nav-link">
              Blog
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/contacto" class="nav-link">
              Contacto
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/reservar" class="btn-cta">
              Reservar cita
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Mobile Full-Screen Menu Overlay -->
    <Transition name="fade-slide">
      <div
        v-if="menuOpen"
        class="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-md md:hidden"
      >
        <!-- Glassmorphic Menu Panel -->
        <div
          class="relative bg-[#F9F7F3]/50 backdrop-blur-xl border border-white/30 shadow-[0_8px_60px_rgba(93,74,68,0.08)] rounded-3xl p-8 flex flex-col items-center"
          @click.stop
        >
          <!-- Navigation links -->
          <nav class="flex flex-col gap-5 text-center w-full">
            <NuxtLink 
              to="/" 
              class="mobile-nav-link"
              @click="menuOpen = false"
            >
              Inicio
            </NuxtLink>
            <NuxtLink 
              to="/sentirse" 
              class="mobile-nav-link"
              @click="menuOpen = false"
            >
              Cómo te sientes
            </NuxtLink>
            <NuxtLink 
              to="/conoceme" 
              class="mobile-nav-link"
              @click="menuOpen = false"
            >
              Conóceme
            </NuxtLink>
            <NuxtLink 
              to="/como-empezar" 
              class="mobile-nav-link"
              @click="menuOpen = false"
            >
              Cómo empezar
            </NuxtLink>
            <NuxtLink 
              to="/blog" 
              class="mobile-nav-link"
              @click="menuOpen = false"
            >
              Blog
            </NuxtLink>
            <NuxtLink 
              to="/contacto" 
              class="mobile-nav-link"
              @click="menuOpen = false"
            >
              Contacto
            </NuxtLink>
          </nav>

          <!-- CTA -->
          <div class="mt-8 w-full flex justify-center">
            <NuxtLink 
              to="/reservar" 
              class="inline-block px-10 py-3.5 rounded-full font-semibold text-white text-base bg-gradient-to-r from-[#EFA08B] to-[#D8AFA0] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
              @click="menuOpen = false"
            >
              Reservar cita
            </NuxtLink>
          </div>
        </div>

        <!-- Dark backdrop overlay -->
        <div 
          class="fixed inset-0 bg-[#5D4A44]/10 backdrop-blur-sm -z-10"
          @click="menuOpen = false"
        ></div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const menuOpen = ref(false)
const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.nav-link {
  @apply relative px-3 py-2 text-cafe font-medium text-sm lg:text-base;
  @apply transition-all duration-300 ease-in-out;
  @apply hover:text-terracota rounded-full hover:bg-white/50;
}

.nav-link::after {
  content: '';
  @apply absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-terracota;
  @apply transition-all duration-300 ease-out;
}

.nav-link:hover::after {
  @apply w-3/4;
}

.router-link-active.nav-link {
  @apply text-terracota;
}

.router-link-active.nav-link::after {
  @apply w-3/4;
}

.nav-link-mobile {
  @apply px-4 py-3 text-cafe font-medium;
  @apply transition-all duration-300 ease-in-out;
  @apply hover:text-terracota hover:bg-white/50 rounded-2xl;
  @apply border-l-4 border-transparent hover:border-terracota;
}

.router-link-active.nav-link-mobile {
  @apply text-terracota bg-white/50 border-terracota;
}

.btn-cta {
  @apply px-6 py-2.5 rounded-full font-semibold text-white text-sm lg:text-base;
  @apply bg-gradient-to-r from-terracota to-[#EFA08B];
  @apply shadow-md hover:shadow-lg;
  @apply transition-all duration-300 ease-in-out;
  @apply hover:scale-105 active:scale-95;
  @apply ml-2;
}

.btn-cta:hover {
  background: linear-gradient(135deg, #EFA08B 0%, #D8AFA0 100%);
}

.mobile-nav-link {
  @apply text-lg font-light text-[#5D4A44] transition-all duration-300 tracking-wide;
  @apply hover:text-terracota hover:scale-105;
  @apply py-1;
}

.router-link-active.mobile-nav-link {
  @apply text-terracota font-medium;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, -10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
