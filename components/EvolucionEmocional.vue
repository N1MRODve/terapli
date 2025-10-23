<template>
  <div class="bg-white rounded-xl shadow-sm p-6 border border-[#EAD5D3]/40">
    <h2 class="font-['Lora'] text-xl text-[#5D4A44] mb-4 flex items-center gap-2">
      <span class="text-2xl">📊</span>
      Evolución Emocional
    </h2>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D8AFA0]"></div>
      <p class="mt-2 text-sm text-[#5D4A44]/60">Cargando datos...</p>
    </div>

    <!-- Chart -->
    <div v-else-if="registros.length > 0">
      <!-- Canvas para Chart.js -->
      <div class="mb-6">
        <canvas ref="chartCanvas" class="w-full" style="max-height: 300px;"></canvas>
      </div>

      <!-- Estadísticas Resumidas -->
      <div class="grid grid-cols-3 gap-4 pt-4 border-t border-[#EAD5D3]/30">
        <div class="text-center">
          <p class="text-2xl font-bold" :class="getColorClase(promedio)">
            {{ promedio }}%
          </p>
          <p class="text-xs text-[#5D4A44]/60 mt-1">Promedio</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600">
            {{ maximo }}%
          </p>
          <p class="text-xs text-[#5D4A44]/60 mt-1">Máximo</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-[#D8AFA0]">
            {{ registros.length }}
          </p>
          <p class="text-xs text-[#5D4A44]/60 mt-1">Registros</p>
        </div>
      </div>

      <!-- Tendencia -->
      <div class="mt-4 p-3 bg-[#F9F7F3] rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm text-[#5D4A44]/70">Tendencia últimos 30 días</span>
          <span 
            class="flex items-center gap-1 text-sm font-medium"
            :class="tendencia > 0 ? 'text-green-600' : tendencia < 0 ? 'text-red-600' : 'text-gray-600'"
          >
            <span>{{ tendencia > 0 ? '↑' : tendencia < 0 ? '↓' : '→' }}</span>
            <span>{{ Math.abs(tendencia) }}%</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-[#5D4A44]/60">
      <span class="text-4xl mb-3 block">📈</span>
      <p>No hay registros emocionales todavía</p>
      <p class="text-xs mt-2">Los registros aparecerán cuando el paciente complete su seguimiento</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

// Registrar componentes de Chart.js
Chart.register(...registerables)

const props = defineProps<{
  pacienteId: string
}>()

const supabase = useSupabaseClient()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const registros = ref<any[]>([])
const loading = ref(true)
let chartInstance: Chart | null = null

onMounted(async () => {
  await cargarRegistros()
  await nextTick()
  if (registros.value.length > 0) {
    crearGrafica()
  }
})

const cargarRegistros = async () => {
  try {
    // Simulación de datos (reemplazar con consulta real)
    // En producción, esto vendría de una tabla 'registros_emocionales'
    registros.value = generarDatosDemo()
    
    /* Consulta real:
    const { data, error } = await supabase
      .from('registros_emocionales')
      .select('bienestar, fecha')
      .eq('paciente_id', props.pacienteId)
      .order('fecha', { ascending: true })
      .limit(30)

    if (error) throw error
    registros.value = data || []
    */
  } catch (err) {
    console.error('Error al cargar registros:', err)
  } finally {
    loading.value = false
  }
}

// Datos demo para visualización
const generarDatosDemo = () => {
  const hoy = new Date()
  const datos = []
  
  for (let i = 29; i >= 0; i--) {
    const fecha = new Date(hoy)
    fecha.setDate(fecha.getDate() - i)
    
    // Generar valor con tendencia al alza
    const base = 50 + (30 - i) // Tendencia positiva
    const variacion = Math.random() * 20 - 10
    const bienestar = Math.max(20, Math.min(100, base + variacion))
    
    datos.push({
      fecha: fecha.toISOString(),
      bienestar: Math.round(bienestar)
    })
  }
  
  return datos
}

// Estadísticas computadas
const promedio = computed(() => {
  if (registros.value.length === 0) return 0
  const suma = registros.value.reduce((acc, r) => acc + r.bienestar, 0)
  return Math.round(suma / registros.value.length)
})

const maximo = computed(() => {
  if (registros.value.length === 0) return 0
  return Math.max(...registros.value.map(r => r.bienestar))
})

const tendencia = computed(() => {
  if (registros.value.length < 2) return 0
  const primeraMitad = registros.value.slice(0, Math.floor(registros.value.length / 2))
  const segundaMitad = registros.value.slice(Math.floor(registros.value.length / 2))
  
  const promedio1 = primeraMitad.reduce((acc, r) => acc + r.bienestar, 0) / primeraMitad.length
  const promedio2 = segundaMitad.reduce((acc, r) => acc + r.bienestar, 0) / segundaMitad.length
  
  return Math.round(promedio2 - promedio1)
})

// Crear gráfica
const crearGrafica = () => {
  if (!chartCanvas.value || registros.value.length === 0) return
  
  // Destruir gráfica anterior si existe
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const labels = registros.value.map(r => 
    new Date(r.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  )
  const datos = registros.value.map(r => r.bienestar)

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Nivel de Bienestar',
        data: datos,
        borderColor: '#D8AFA0',
        backgroundColor: 'rgba(216, 175, 160, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#D8AFA0',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#5D4A44',
          padding: 12,
          titleFont: {
            family: "'Lora', serif",
            size: 14
          },
          bodyFont: {
            family: "'Lato', sans-serif",
            size: 13
          },
          callbacks: {
            label: (context) => {
              return `Bienestar: ${context.parsed.y}%`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 0,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`,
            font: {
              family: "'Lato', sans-serif"
            }
          },
          grid: {
            color: 'rgba(93, 74, 68, 0.1)'
          }
        },
        x: {
          ticks: {
            font: {
              family: "'Lato', sans-serif"
            },
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            display: false
          }
        }
      }
    }
  })
}

const getColorClase = (valor: number) => {
  if (valor >= 70) return 'text-green-600'
  if (valor >= 50) return 'text-yellow-600'
  return 'text-orange-600'
}
</script>
