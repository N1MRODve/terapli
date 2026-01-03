<template>
  <div class="min-h-screen bg-gradient-to-br from-[#F2F2F2] via-[#FAFAFA] to-[#F8F9FA]">
    <LoadingSpinner v-if="loading" text="Cargando tu espacio personal..." full-height />

    <div v-else class="max-w-5xl mx-auto px-4 py-6 sm:px-8 space-y-6">
      <!-- 1. Frase del día - Hero Emocional (primera posición) -->
      <DailyQuote />

      <!-- 2. Próxima sesión (segunda posición, ancho completo) -->
      <NextSessionCard />

      <!-- 3. Saludo simple con icono -->
      <HeaderGreeting :user-name="nombrePaciente" />

      <!-- 4. Registro emocional del día -->
      <EmotionTracker />

      <!-- 5. Insight terapéutico / Evolución emocional -->
      <ClientOnly>
        <EmotionalInsight 
          :emotion-trend="emotionTrend" 
          :average-score="averageScore" 
        />
      </ClientOnly>

      <!-- 6. Gráfico de evolución (opcional, colapsable) -->
      <ClientOnly>
        <EmotionChart />
      </ClientOnly>

      <!-- 7. Recursos en carrusel horizontal -->
      <ResourceGrid />

      <!-- 8. Pie emocional (opcional, solo si hay espacio) -->
      <div class="text-center py-4">
        <p class="font-sans text-sm text-[#718096]">
          Tu bienestar es un camino, no una meta. 🌿
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DailyQuote from '~/components/dashboard/DailyQuote.vue'
import NextSessionCard from '~/components/dashboard/NextSessionCard.vue'
import HeaderGreeting from '~/components/dashboard/HeaderGreeting.vue'
import EmotionTracker from '~/components/dashboard/EmotionTracker.vue'
import EmotionalInsight from '~/components/dashboard/EmotionalInsight.vue'
import EmotionChart from '~/components/dashboard/EmotionChart.vue'
import ResourceGrid from '~/components/dashboard/ResourceGrid.vue'

definePageMeta({
  layout: 'paciente',
  middleware: 'auth'
})

const loading = ref(true)
const nombrePaciente = ref('')
const emotionTrend = ref('stable')
const averageScore = ref(3)

onMounted(async () => {
  await fetchPatientData()
  loading.value = false
})

const fetchPatientData = async () => {
  try {
    const supabase = useSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('pacientes')
        .select('nombre_completo')
        .eq('user_id', user.id)
        .single()

      if (profile?.nombre_completo) {
        nombrePaciente.value = profile.nombre_completo.split(' ')[0]
      }
      
      emotionTrend.value = 'stable'
      averageScore.value = 3
    }
  } catch (error) {
    console.error('Error al cargar datos del paciente:', error)
  }
}
</script>

<style scoped>
.space-y-6 > * {
  animation: fadeInUp 0.5s ease-out backwards;
}

.space-y-6 > *:nth-child(1) { animation-delay: 0.05s; }
.space-y-6 > *:nth-child(2) { animation-delay: 0.1s; }
.space-y-6 > *:nth-child(3) { animation-delay: 0.15s; }
.space-y-6 > *:nth-child(4) { animation-delay: 0.2s; }
.space-y-6 > *:nth-child(5) { animation-delay: 0.25s; }
.space-y-6 > *:nth-child(6) { animation-delay: 0.3s; }
.space-y-6 > *:nth-child(7) { animation-delay: 0.35s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
