<template>
  <div class="bg-white rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.05)] border border-[#EAD5D3]/30 p-6">
    <h2 class="font-['Lora'] text-2xl text-[#5D4A44] mb-6">
      ¿Cómo te sientes hoy?
    </h2>
    
    <div v-if="!submitted">
      <!-- Selector de emociones principal con emojis grandes -->
      <div class="mb-6">
        <div class="flex justify-around gap-3">
          <button
            v-for="emotion in mainEmotions"
            :key="emotion.value"
            @click="selectedEmotion = emotion.value"
            :class="[
              'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 ease-in-out',
              selectedEmotion === emotion.value
                ? 'bg-[#D8AFA0]/20 ring-2 ring-[#D8AFA0] scale-110'
                : 'bg-[#F9F7F3] hover:bg-[#EAD5D3]/30 hover:scale-105'
            ]"
          >
            <span class="text-6xl transition-transform duration-300 ease-in-out hover:scale-110">
              {{ emotion.emoji }}
            </span>
            <span class="font-['Lato'] text-xs text-[#5D4A44]/70">
              {{ emotion.label }}
            </span>
          </button>
        </div>
      </div>

      <!-- Etiquetas de emociones específicas con scroll horizontal -->
      <div class="mb-6">
        <p class="font-['Lato'] text-sm text-[#5D4A44]/70 mb-3">
          Emociones específicas (opcional)
        </p>
        <div class="flex overflow-x-auto snap-x snap-mandatory gap-2 pb-2 -mx-1 px-1 scrollbar-hide">
          <button
            v-for="tag in emotionTags"
            :key="tag"
            @click="toggleTag(tag)"
            :class="[
              'flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm transition-all duration-300 ease-in-out',
              selectedTags.includes(tag)
                ? 'bg-[#D8AFA0] text-white scale-105'
                : 'bg-[#F9F7F3] text-[#5D4A44]/70 hover:bg-[#EAD5D3]/50'
            ]"
            style="font-family: 'Lato', sans-serif"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- Campo de reflexión con placeholder empático -->
      <div class="mb-6">
        <textarea
          v-model="reflection"
          rows="3"
          placeholder="Escribe lo que sientes, sin juicios…"
          class="w-full px-4 py-3 rounded-xl border border-[#EAD5D3]/50 bg-[#F9F7F3]/50 
                 font-['Lato'] text-[#5D4A44] placeholder:text-[#5D4A44]/40
                 focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent
                 transition-all duration-300 ease-in-out"
        ></textarea>
      </div>

      <!-- Botón de registro -->
      <button
        @click="submitEmotion"
        :disabled="!selectedEmotion || isSubmitting"
        :class="[
          'w-full py-3 rounded-xl font-medium text-white transition-all duration-300 ease-in-out',
          selectedEmotion && !isSubmitting
            ? 'bg-[#D8AFA0] hover:bg-[#C99F90] hover:shadow-md hover:scale-[1.02]'
            : 'bg-[#D8AFA0]/50 cursor-not-allowed'
        ]"
        style="font-family: 'Lato', sans-serif"
      >
        {{ isSubmitting ? 'Registrando...' : 'Registrar' }}
      </button>
    </div>

    <!-- Mensaje de confirmación con animación -->
    <div v-else class="text-center py-8 animate-fadeIn">
      <div class="inline-block mb-4 text-6xl animate-float">🌿</div>
      <p class="font-['Lato'] text-base text-[#5D4A44] mb-2">
        Gracias por compartir cómo te sientes hoy.
      </p>
      <button
        @click="resetForm"
        class="mt-4 px-6 py-2 rounded-full bg-[#D8AFA0]/20 text-[#D8AFA0] font-['Lato'] text-sm
               hover:bg-[#D8AFA0]/30 transition-all duration-300 ease-in-out"
      >
        Registrar otro momento
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedEmotion = ref(null)
const selectedTags = ref([])
const reflection = ref('')
const submitted = ref(false)
const isSubmitting = ref(false)

const mainEmotions = [
  { value: 5, emoji: '😀', label: 'Muy bien' },
  { value: 4, emoji: '😌', label: 'Bien' },
  { value: 3, emoji: '😐', label: 'Normal' },
  { value: 2, emoji: '😔', label: 'Triste' },
  { value: 1, emoji: '😭', label: 'Muy mal' }
]

const emotionTags = [
  'Tranquilo/a',
  'Ansioso/a',
  'Esperanzado/a',
  'Cansado/a',
  'Motivado/a',
  'Abrumado/a',
  'Agradecido/a',
  'Confundido/a'
]

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const submitEmotion = async () => {
  if (!selectedEmotion.value) return
  
  isSubmitting.value = true
  
  // Aquí se integraría con Supabase
  const emotionData = {
    emotion_level: selectedEmotion.value,
    tags: selectedTags.value,
    reflection: reflection.value,
    created_at: new Date().toISOString()
  }
  
  // Simulación de guardado (reemplazar con llamada a Supabase)
  await new Promise(resolve => setTimeout(resolve, 800))
  
  console.log('Guardando emoción:', emotionData)
  
  isSubmitting.value = false
  submitted.value = true
}

const resetForm = () => {
  selectedEmotion.value = null
  selectedTags.value = []
  reflection.value = ''
  submitted.value = false
}
</script>

<style scoped>
/* Ocultar scrollbar pero mantener funcionalidad */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Animación de entrada */
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Animación flotante para el emoji */
.animate-float {
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
