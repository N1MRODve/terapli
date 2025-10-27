<template>
  <div class="bg-white rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.05)] border border-[#EAD5D3]/30 p-5">
    <div class="flex items-start justify-between mb-4">
      <h2 class="font-['Lora'] text-xl text-[#5D4A44]">
        Próxima sesión
      </h2>
      <div class="flex items-center gap-1 text-[#D8AFA0]">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>

    <div v-if="nextSession">
      <!-- Fecha y hora compacta -->
      <div class="mb-4">
        <p class="font-['Lora'] text-lg font-medium text-[#5D4A44] mb-1">
          {{ formatDate(nextSession.date) }}
        </p>
        <div class="flex items-center gap-4 text-sm font-['Lato'] text-[#5D4A44]/70">
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ nextSession.time }}</span>
          </div>
          <span class="text-[#5D4A44]/30">•</span>
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span class="capitalize">{{ nextSession.modality }}</span>
          </div>
          <span class="text-[#5D4A44]/30">•</span>
          <span>{{ nextSession.duration }} min</span>
        </div>
      </div>

      <!-- Nota empática -->
      <div v-if="nextSession.note" class="mb-4 p-3 bg-[#F9F7F3] rounded-xl border-l-4 border-[#D8AFA0]">
        <p class="font-['Lato'] text-sm text-[#5D4A44]/80">
          {{ nextSession.note }}
        </p>
      </div>

      <!-- Botón de acción -->
      <div class="flex items-center gap-3">
        <button
          @click="handleAction"
          :disabled="!canJoin"
          :class="[
            'flex-1 py-2.5 rounded-xl font-medium text-white transition-all duration-300 ease-in-out',
            canJoin
              ? 'bg-[#D8AFA0] hover:bg-[#C99F90] hover:shadow-md hover:scale-[1.02]'
              : 'bg-[#D8AFA0]/50 cursor-not-allowed'
          ]"
          style="font-family: 'Lato', sans-serif"
        >
          {{ actionButtonText }}
        </button>
        
        <!-- Contador regresivo compacto -->
        <div v-if="timeUntilSession" class="text-right">
          <p class="font-['Lato'] text-xs text-[#5D4A44]/60 whitespace-nowrap">
            {{ timeUntilSession }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-6">
      <div class="inline-block mb-3 text-4xl opacity-30">📅</div>
      <p class="font-['Lato'] text-sm text-[#5D4A44]/60 mb-3">
        No tienes sesiones programadas próximamente
      </p>
      <button
        @click="$router.push('/reservar')"
        class="px-5 py-2 rounded-full bg-[#D8AFA0] text-white font-medium text-sm
               hover:bg-[#C99F90] transition-all duration-300 ease-in-out hover:scale-105"
        style="font-family: 'Lato', sans-serif"
      >
        Agendar sesión
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Datos de ejemplo (esto vendría de Supabase)
const nextSession = ref({
  date: new Date(2025, 9, 22, 16, 0), // 22 de octubre, 16:00
  time: '16:00 - 17:00',
  modality: 'Videollamada',
  duration: 60,
  note: 'Recuerda tener tu diario emocional a mano para revisar juntas.',
  meetingLink: 'https://meet.google.com/example'
})

const currentTime = ref(new Date())
let intervalId = null

onMounted(() => {
  // Actualizar el tiempo cada minuto
  intervalId = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

const formatDate = (date) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString('es-ES', options)
}

const canJoin = computed(() => {
  if (!nextSession.value) return false
  const sessionDate = new Date(nextSession.value.date)
  const now = currentTime.value
  const diffMinutes = (sessionDate - now) / (1000 * 60)
  // Permitir unirse 15 minutos antes
  return diffMinutes <= 15 && diffMinutes > -60
})

const actionButtonText = computed(() => {
  if (!nextSession.value) return 'Agendar sesión'
  if (canJoin.value) return 'Unirme a la sesión'
  return 'Ver detalles'
})

const timeUntilSession = computed(() => {
  if (!nextSession.value) return null
  const sessionDate = new Date(nextSession.value.date)
  const now = currentTime.value
  const diff = sessionDate - now
  
  if (diff < 0) return 'Sesión en curso o pasada'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `Faltan ${days} día${days > 1 ? 's' : ''} y ${hours} hora${hours !== 1 ? 's' : ''}`
  if (hours > 0) return `Faltan ${hours} hora${hours !== 1 ? 's' : ''} y ${minutes} minuto${minutes !== 1 ? 's' : ''}`
  return `Faltan ${minutes} minuto${minutes !== 1 ? 's' : ''}`
})

const handleAction = () => {
  if (!nextSession.value) {
    // Si no hay sesión y estamos en contexto de terapeuta, ir a agenda
    const router = useRouter()
    router.push('/terapeuta/agenda')
    return
  }
  
  if (canJoin.value) {
    // Abrir el link de la videollamada
    if (nextSession.value.meetingLink) {
      window.open(nextSession.value.meetingLink, '_blank')
    }
  } else {
    // Navegar a agenda de terapeuta en lugar de sesiones de paciente
    const router = useRouter()
    router.push('/terapeuta/agenda')
  }
}
</script>
