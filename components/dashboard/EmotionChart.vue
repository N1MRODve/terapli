<template>
  <div class="bg-white rounded-2xl shadow-sm border border-[#E2E8F0]/30 p-6">
    <h2 class="font-serif text-2xl text-[#2D3748] mb-6">
      Tu evolución emocional
    </h2>
    
    <ClientOnly>
      <div class="h-64 sm:h-80">
        <canvas ref="chartCanvas"></canvas>
      </div>
      
      <template #fallback>
        <div class="h-64 sm:h-80 flex items-center justify-center bg-[#F2F2F2] rounded-xl">
          <p class="font-sans text-[#2D3748]/50">Cargando gráfico...</p>
        </div>
      </template>
    </ClientOnly>

    <!-- Leyenda personalizada -->
    <div class="mt-6 flex flex-wrap gap-4 justify-center">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-[#5550F2]"></div>
        <span class="font-sans text-sm text-[#2D3748]/70">Estado emocional</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-[#E2E8F0]"></div>
        <span class="font-sans text-sm text-[#2D3748]/70">Tendencia</span>
      </div>
    </div>

    <!-- Insight emocional -->
    <div v-if="emotionalInsight" class="mt-6 p-4 bg-[#F2F2F2] rounded-xl">
      <p class="font-sans text-sm text-[#2D3748]/80">
        💡 <span class="font-medium">Insight:</span> {{ emotionalInsight }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const chartCanvas = ref(null)
let chartInstance = null

// Datos de ejemplo (últimos 7 días)
const emotionData = ref([
  { date: 'Lun', value: 3 },
  { date: 'Mar', value: 4 },
  { date: 'Mié', value: 3 },
  { date: 'Jue', value: 4 },
  { date: 'Vie', value: 5 },
  { date: 'Sáb', value: 4 },
  { date: 'Hoy', value: 4 }
])

const emotionalInsight = computed(() => {
  const values = emotionData.value.map(d => d.value)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const lastThree = values.slice(-3)
  const trend = lastThree[lastThree.length - 1] - lastThree[0]

  if (avg >= 4) {
    return 'Has mantenido un estado emocional positivo esta semana. ¡Sigue así! 🌟'
  } else if (trend > 0) {
    return 'Noto una mejoría en tu estado emocional. Esto es un gran avance. 💚'
  } else if (trend < 0) {
    return 'He notado algunas fluctuaciones. Recuerda que está bien tener días difíciles. Estoy aquí para apoyarte.'
  } else {
    return 'Tu estado se ha mantenido estable. Continuemos trabajando juntas en tu bienestar.'
  }
})

onMounted(async () => {
  if (!chartCanvas.value) return

  // Importar Chart.js dinámicamente (solo en cliente)
  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)

  const ctx = chartCanvas.value.getContext('2d')
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: emotionData.value.map(d => d.date),
      datasets: [
        {
          label: 'Estado emocional',
          data: emotionData.value.map(d => d.value),
          borderColor: '#5550F2',
          backgroundColor: 'rgba(216, 175, 160, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#5550F2',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#2D3748',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: function(context) {
              const emotions = ['Muy mal', 'Triste', 'Normal', 'Bien', 'Muy bien']
              return emotions[context.parsed.y - 1] || context.parsed.y
            }
          }
        }
      },
      scales: {
        y: {
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
            color: '#2D3748',
            font: {
              family: "'Lato', sans-serif",
              size: 11
            },
            callback: function(value) {
              const emotions = ['😭', '😔', '😐', '😌', '😀']
              return emotions[value - 1] || value
            }
          },
          grid: {
            color: '#E2E8F0',
            borderDash: [5, 5]
          }
        },
        x: {
          ticks: {
            color: '#2D3748',
            font: {
              family: "'Lato', sans-serif",
              size: 11
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  })
})
</script>

<style scoped>
canvas {
  max-width: 100%;
}
</style>
