<template>
  <Transition name="modal-fade">
    <div 
      v-if="showModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      @click.self="handleSkip"
    >
      <div 
        class="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 animate-fade-in-up border border-[#E2E8F0]/30"
        role="dialog"
        aria-labelledby="greeting-title"
        aria-modal="true"
      >
        <div class="text-center">
          <!-- Simplified Title -->
          <h2 
            id="greeting-title" 
            class="text-2xl font-serif text-[#2D3748] mb-6"
          >
            Bienvenido/a
          </h2>
          
          <!-- Simple question -->
          <p class="text-[#2D3748]/80 leading-relaxed mb-6">
            ¿Cuál es tu nombre?
          </p>

          <!-- Input -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <input
                v-model="nameInput"
                type="text"
                placeholder="Tu nombre"
                class="w-full px-4 py-3 rounded-2xl border border-[#E2E8F0]/50 focus:border-[#5550F2] focus:outline-none focus:ring-2 focus:ring-[#5550F2]/20 transition-all text-[#2D3748] placeholder:text-[#2D3748]/40"
                maxlength="30"
                aria-label="Tu nombre"
                ref="nameInputRef"
                autofocus
              />
            </div>

            <!-- Single button -->
            <button
              type="submit"
              :disabled="!nameInput.trim()"
              class="w-full bg-[#5550F2] hover:bg-[#C89B8C] disabled:bg-[#E2E8F0] disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-2xl transition-all duration-300 hover:shadow-md disabled:opacity-50"
            >
              Continuar
            </button>
          </form>

          <!-- Privacy note -->
          <p class="text-xs text-[#2D3748]/50 text-center mt-6 leading-relaxed">
            Solo usamos tu nombre para personalizar tu experiencia en esta web.<br/>
            No lo guardamos ni compartimos con nadie.
          </p>

          <!-- Subtle skip option -->
          <button
            type="button"
            @click="handleSkip"
            class="text-xs text-[#2D3748]/40 hover:text-[#2D3748]/60 mt-3 transition-colors underline"
          >
            Prefiero continuar sin nombre
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useVisitorContext } from '@/composables/useVisitorContext'
import { capitalizeName } from '@/utils/formatName'

const { setName, isFirstVisit } = useVisitorContext()

const showModal = ref(false)
const nameInput = ref('')
const nameInputRef = ref(null)

const handleSubmit = () => {
  if (nameInput.value.trim()) {
    setName(capitalizeName(nameInput.value))
    closeModal()
  }
}

const handleSkip = () => {
  if (process.client) {
    localStorage.setItem('hasVisited', 'true')
  }
  closeModal()
}

const closeModal = () => {
  showModal.value = false
}

onMounted(() => {
  // Show modal only on first visit and after a short delay for better UX
  if (isFirstVisit.value) {
    setTimeout(() => {
      showModal.value = true
      nextTick(() => {
        if (nameInputRef.value) {
          nameInputRef.value.focus()
        }
      })
    }, 2000) // Aumentado a 2 segundos para dar tiempo a que el usuario vea la página primero
  }
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out;
}
</style>
