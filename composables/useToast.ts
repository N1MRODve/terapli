import { ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

export const useToast = () => {
  const addToast = (type: Toast['type'], message: string, duration = 5000) => {
    const id = ++toastIdCounter
    const toast: Toast = { id, type, message, duration }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => {
    return addToast('success', message, duration)
  }

  const error = (message: string, duration?: number) => {
    return addToast('error', message, duration)
  }

  const warning = (message: string, duration?: number) => {
    return addToast('warning', message, duration)
  }

  const info = (message: string, duration?: number) => {
    return addToast('info', message, duration)
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
