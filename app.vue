<template>
  <div class="bg-fondo min-h-screen">
    <NuxtLayout>
      <NuxtPage :transition="{
        name: 'fade-route',
        mode: 'out-in'
      }" />
    </NuxtLayout>
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
