<template>
  <header 
    class="fixed top-0 left-0 right-0 z-50 bg-[#F2F2F2] shadow-sm transition-all duration-300"
  >
    <nav class="flex items-center justify-between w-full h-20 px-6 md:px-10 max-w-[1600px] mx-auto">
      <!-- Logo -->
      <NuxtLink 
        to="/" 
        class="flex items-center h-full hover:opacity-80 transition-opacity duration-300"
      >
        <span class="text-2xl md:text-3xl font-['Elms_Sans'] font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent">
          Teraplí
        </span>
      </NuxtLink>

      <!-- Desktop Navigation Links -->
      <div class="hidden md:flex items-center justify-center gap-6 lg:gap-8 font-sans text-base text-[#2D3748]">
        <NuxtLink to="/" class="nav-link">
          Inicio
        </NuxtLink>
        <NuxtLink to="/sentirse" class="nav-link">
          Cómo te sientes
        </NuxtLink>
        <NuxtLink to="/conoceme" class="nav-link">
          Conóceme
        </NuxtLink>
        <NuxtLink to="/como-empezar" class="nav-link">
          Cómo empezar
        </NuxtLink>
        <NuxtLink to="/contacto" class="nav-link">
          Contacto
        </NuxtLink>
      </div>

      <!-- Desktop Actions -->
      <div class="hidden md:flex items-center gap-4">
        <NuxtLink 
          to="/login" 
          class="flex items-center gap-1.5 text-[#2D3748] hover:text-[#5550F2] transition-colors duration-300 font-sans text-sm lg:text-base"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Tu espacio</span>
        </NuxtLink>

        <NuxtLink
          to="/reservar"
          class="px-6 py-2.5 bg-[#5550F2] hover:bg-[#C89B8A] text-white rounded-full font-sans font-medium transition-all duration-300 text-sm lg:text-base whitespace-nowrap"
        >
          Reservar cita
        </NuxtLink>
      </div>

      <!-- Mobile Menu Button -->
      <button 
        @click="menuOpen = !menuOpen" 
        class="md:hidden text-[#2D3748] hover:text-[#5550F2] transition-colors p-2"
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
    </nav>

    <!-- Mobile Full-Screen Menu Overlay -->
    <Transition name="fade-slide">
      <div
        v-if="menuOpen"
        class="fixed inset-0 top-20 z-40 bg-[#2D3748]/10 backdrop-blur-sm md:hidden"
        @click="menuOpen = false"
      >
        <div
          class="bg-[#F2F2F2] shadow-lg mx-4 mt-4 rounded-2xl p-6"
          @click.stop
        >
          <!-- Navigation links -->
          <nav class="flex flex-col gap-3 w-full">
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
              to="/contacto" 
              class="mobile-nav-link"
              @click="menuOpen = false"
            >
              Contacto
            </NuxtLink>
            
            <!-- Divider -->
            <div class="h-px bg-[#5550F2]/20 my-2"></div>
            
            <NuxtLink 
              to="/login" 
              class="mobile-nav-link-therapeutic"
              @click="menuOpen = false"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Tu espacio terapéutico</span>
            </NuxtLink>
          </nav>

          <!-- CTA Button -->
          <div class="mt-6">
            <NuxtLink 
              to="/reservar" 
              class="block w-full px-6 py-3.5 bg-[#5550F2] hover:bg-[#C89B8A] text-white rounded-full font-sans font-semibold text-center transition-all duration-300 shadow-md"
              @click="menuOpen = false"
            >
              Reservar cita
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)
</script>

<style scoped>
.nav-link {
  @apply relative py-2 text-[#2D3748] hover:text-[#5550F2] transition-colors duration-300;
  @apply font-medium whitespace-nowrap;
}

.nav-link::after {
  content: '';
  @apply absolute bottom-0 left-0 w-0 h-0.5 bg-[#5550F2];
  @apply transition-all duration-300 ease-out;
}

.nav-link:hover::after {
  @apply w-full;
}

.router-link-active.nav-link {
  @apply text-[#5550F2];
}

.router-link-active.nav-link::after {
  @apply w-full;
}

.mobile-nav-link {
  @apply py-3 px-4 text-[#2D3748] hover:text-[#5550F2] hover:bg-[#F2F2F2]/50;
  @apply transition-all duration-300 rounded-xl font-sans font-medium;
}

.router-link-active.mobile-nav-link {
  @apply text-[#5550F2] bg-[#F2F2F2]/50;
}

.mobile-nav-link-therapeutic {
  @apply flex items-center gap-2 py-3 px-4 text-[#2D3748] hover:text-[#5550F2];
  @apply border-2 border-[#5550F2]/30 hover:border-[#5550F2];
  @apply transition-all duration-300 rounded-xl font-sans font-medium;
  @apply hover:bg-[#F2F2F2]/50;
}

.router-link-active.mobile-nav-link-therapeutic {
  @apply text-[#5550F2] border-[#5550F2] bg-[#F2F2F2]/50;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
}
</style>
