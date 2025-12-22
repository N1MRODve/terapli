<template>
  <div
    class="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
    role="region"
    aria-live="polite"
    aria-label="Notificaciones"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto bg-white rounded-lg shadow-lg border p-4 flex items-start gap-3 transition-all duration-300"
        :class="toastClasses(toast.type)"
        role="alert"
      >
        <!-- Icon -->
        <div class="flex-shrink-0">
          <CheckCircleIcon v-if="toast.type === 'success'" class="w-5 h-5" aria-hidden="true" />
          <ExclamationCircleIcon v-else-if="toast.type === 'error'" class="w-5 h-5" aria-hidden="true" />
          <ExclamationTriangleIcon v-else-if="toast.type === 'warning'" class="w-5 h-5" aria-hidden="true" />
          <InformationCircleIcon v-else class="w-5 h-5" aria-hidden="true" />
        </div>

        <!-- Message -->
        <p class="text-sm font-medium flex-1">
          {{ toast.message }}
        </p>

        <!-- Close button -->
        <button
          @click="removeToast(toast.id)"
          class="min-h-[44px] min-w-[44px] p-2 -mr-2 -mt-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          :aria-label="`Cerrar notificación: ${toast.message}`"
        >
          <XMarkIcon class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const { toasts, removeToast } = useToast()

const toastClasses = (type) => {
  const classes = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800'
  }
  return classes[type] || classes.info
}
</script>

<style scoped>
/* Toast transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
