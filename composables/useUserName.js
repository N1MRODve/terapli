import { ref, onMounted, onBeforeUnmount } from 'vue'

const userName = ref(null)
let eventListener = null

export function useUserName() {
  onMounted(() => {
    if (!process.client) return
    
    // Leer nombre guardado en localStorage
    const stored = localStorage.getItem('userName')
    if (stored) {
      userName.value = stored
    }
    
    // Escuchar evento cuando se guarda un nuevo nombre
    eventListener = (e) => {
      userName.value = e.detail
    }
    window.addEventListener('name-saved', eventListener)
  })
  
  onBeforeUnmount(() => {
    if (eventListener) {
      window.removeEventListener('name-saved', eventListener)
    }
  })
  
  return { 
    userName 
  }
}
