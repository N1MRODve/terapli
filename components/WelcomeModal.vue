<template>
  <Transition name="fade">
    <div 
      v-if="showModal" 
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div 
        class="bg-[#F9F7F3] rounded-2xl p-8 shadow-xl max-w-md w-full text-center transform transition-all duration-500"
        :class="{ 'animate-slide-up': showModal }"
        role="dialog"
        aria-labelledby="welcome-title"
        aria-modal="true"
      >
        <!-- Mensaje de bienvenida -->
        <div v-if="!nameSaved">
          <h2 
            id="welcome-title"
            class="font-lora text-2xl mb-4 text-[#5D4A44]"
          >
            👋 Hola, soy Karem
          </h2>
          <p class="font-lato text-[#5D4A44] mb-6 leading-relaxed">
            Me alegra que estés aquí.<br />
            ¿Te gustaría que te llame por tu nombre mientras exploras este espacio?
          </p>
          
          <form @submit.prevent="saveName">
            <input
              v-model="userName"
              type="text"
              placeholder="Escribe tu nombre aquí"
              class="border border-[#EAD5D3] rounded-xl px-4 py-2.5 w-full text-[#5D4A44] placeholder:text-[#5D4A44]/50 mb-4 focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]/30 focus:border-[#D8AFA0] transition-all"
              maxlength="30"
              ref="nameInputRef"
              aria-label="Tu nombre"
            />
            
            <div class="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="submit"
                :disabled="!userName.trim()"
                class="bg-[#D8AFA0] text-[#5D4A44] px-6 py-2.5 rounded-xl font-lato font-medium hover:bg-[#C89B8C] disabled:bg-[#EAD5D3] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md"
              >
                Continuar
              </button>
              <button
                type="button"
                @click="closeModal"
                class="text-sm text-[#5D4A44] underline hover:text-[#D8AFA0] transition-colors py-2"
              >
                Ahora no
              </button>
            </div>
          </form>
        </div>

        <!-- Mensaje de confirmación -->
        <div v-else class="animate-fade-in">
          <h2 class="font-lora text-2xl mb-4 text-[#5D4A44]">
            Encantada de conocerte, {{ savedUserName }} 🌿
          </h2>
          <p class="font-lato text-[#5D4A44] leading-relaxed">
            Espero que encuentres aquí justo lo que necesitas.
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useVisitorContext } from '@/composables/useVisitorContext'
import { capitalizeName } from '@/utils/formatName'

const { setName, visitorName } = useVisitorContext()

const showModal = ref(false)
const userName = ref('')
const nameSaved = ref(false)
const savedUserName = ref('')
const nameInputRef = ref(null)

let scrollListener = null
let timeoutId = null

const isMobile = () => {
  if (!process.client) return false
  return /Mobi|Android/i.test(navigator.userAgent)
}

const checkScrollTrigger = () => {
  if (showModal.value) return

  const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
  const mobile = isMobile()
  
  // En escritorio: 25% de scroll
  // En móvil: 15% de scroll
  const scrollThreshold = mobile ? 15 : 25
  
  if (scrollPercent > scrollThreshold) {
    if (timeoutId) clearTimeout(timeoutId)
    activateModal()
  }
}

const activateModal = () => {
  showModal.value = true
  
  // Enfocar el input después de que el modal se muestre
  nextTick(() => {
    if (nameInputRef.value) {
      nameInputRef.value.focus()
    }
  })
  
  // Remover listeners después de activar
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener)
    scrollListener = null
  }
}

const saveName = () => {
  if (userName.value.trim() !== '') {
    const cleanName = capitalizeName(userName.value)
    savedUserName.value = cleanName
    
    // Guardar en localStorage
    if (process.client) {
      localStorage.setItem('userName', cleanName)
    }
    
    // Actualizar el contexto del visitante
    setName(cleanName)
    
    // Mostrar mensaje de confirmación
    nameSaved.value = true
    
    // Emitir evento personalizado
    if (process.client) {
      window.dispatchEvent(new CustomEvent('name-saved', { detail: cleanName }))
    }
    
    // Cerrar modal después de 2 segundos
    setTimeout(() => {
      showModal.value = false
      nameSaved.value = false
    }, 2000)
  }
}

const closeModal = () => {
  showModal.value = false
  
  // Marcar que el usuario cerró el modal en esta sesión
  if (process.client) {
    sessionStorage.setItem('modalClosed', 'true')
  }
}

onMounted(() => {
  if (!process.client) return
  
  // No mostrar si ya tiene nombre guardado
  const hasUserName = localStorage.getItem('userName') || visitorName.value
  const sessionClosed = sessionStorage.getItem('modalClosed')
  
  if (hasUserName || sessionClosed) return
  
  const mobile = isMobile()
  
  // Timer: 5 segundos tanto en móvil como en escritorio
  timeoutId = setTimeout(() => {
    activateModal()
  }, 5000)
  
  // Listener de scroll
  scrollListener = () => checkScrollTrigger()
  window.addEventListener('scroll', scrollListener, { passive: true })
})

onBeforeUnmount(() => {
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener)
  }
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.4s ease-in;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .bg-\[#F9F7F3\] {
    margin: 1rem;
  }
}
</style>
