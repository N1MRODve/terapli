<template>
  <Transition name="modal-fade">
    <div 
      v-if="show" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      @click.self="handleConfirm"
    >
      <div 
        class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10 animate-fade-in-up border border-[#EAD5D3]/30"
        role="dialog"
        aria-labelledby="inactivity-title"
        aria-modal="true"
      >
        <div class="text-center">
          <!-- Icon -->
          <div class="text-6xl mb-4 animate-pulse-slow">💭</div>
          
          <!-- Title -->
          <h2 
            id="inactivity-title" 
            class="text-2xl md:text-3xl font-serif text-[#5D4A44] mb-4"
          >
            {{ title }}
          </h2>
          
          <!-- Message -->
          <p class="text-[#5D4A44]/80 leading-relaxed mb-6">
            {{ message }}
          </p>

          <!-- Action Button -->
          <CalmButton 
            @click="handleConfirm"
            size="lg"
            class="w-full"
          >
            {{ buttonText }}
          </CalmButton>

          <!-- Optional secondary text -->
          <p class="text-xs text-[#5D4A44]/50 mt-4 leading-relaxed">
            Tómate el tiempo que necesites. Este espacio estará aquí cuando lo necesites.
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useVisitorContext } from '@/composables/useVisitorContext'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm'])

const { visitorName, personalized } = useVisitorContext()

const title = computed(() => {
  return personalized(
    '¿Sigues ahí?',
    '¿Sigues ahí, {name}?'
  )
})

const message = computed(() => {
  return personalized(
    'He notado que llevas un momento sin moverte. ¿Todo está bien? Si necesitas un descanso, está bien. Aquí estaré cuando estés listo/a.',
    '{name}, he notado que llevas un momento sin moverte. ¿Todo está bien? Si necesitas un descanso, está bien. Aquí estaré cuando estés listo/a.'
  )
})

const buttonText = computed(() => {
  return personalized(
    'Sí, sigo aquí',
    'Sí, aquí estoy'
  )
})

const handleConfirm = () => {
  emit('confirm')
}
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
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
</style>
