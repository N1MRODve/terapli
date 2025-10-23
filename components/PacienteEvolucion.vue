<template>
  <div class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-6">
    <h3 class="font-serif text-lg font-semibold text-cafe flex items-center gap-2 mb-4">
      <span class="text-xl">📊</span>
      Evolución Emocional
    </h3>

    <div v-if="!loading && registros.length > 0">
      <!-- Gráfico de tendencia -->
      <div class="mb-6">
        <canvas ref="chartCanvas" class="w-full" style="max-height: 250px;"></canvas>
      </div>

      <!-- Texto descriptivo neutral -->
      <div class="p-4 bg-base-bg rounded-lg">
        <p class="text-sm text-cafe/70 leading-relaxed">
          {{ descripcionTendencia }}
        </p>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="grid grid-cols-3 gap-4 mt-4">
        <div class="text-center p-3 bg-gradient-to-br from-terracota/10 to-rosa/20 rounded-lg">
          <div class="text-2xl font-bold text-cafe">{{ promedioGeneral }}</div>
          <div class="text-xs text-cafe/60 mt-1">Promedio</div>
        </div>
        <div class="text-center p-3 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg">
          <div class="text-2xl font-bold text-cafe">{{ mejorValor }}</div>
          <div class="text-xs text-cafe/60 mt-1">Mejor día</div>
        </div>
        <div class="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg">
          <div class="text-2xl font-bold text-cafe">{{ totalRegistros }}</div>
          <div class="text-xs text-cafe/60 mt-1">Registros</div>
        </div>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-else-if="loading" class="text-center py-8">
      <div class="animate-spin w-8 h-8 border-4 border-terracota border-t-transparent rounded-full mx-auto mb-3"></div>
      <p class="text-sm text-cafe/60">Cargando evolución emocional...</p>
    </div>

    <!-- Sin datos -->
    <div v-else class="text-center py-8">
      <span class="text-5xl mb-3 block opacity-40">📈</span>
      <p class="text-cafe/50 italic">
        Aún no hay registros emocionales para este paciente
      </p>
    </div>
  </div>
</template>

<script setup>
import { Chart, registerables } from 'chart.js'

// Registrar componentes de Chart.js
Chart.register(...registerables)

const props = defineProps({
  pacienteId: {
    type: String,
    required: true
  }
})

// ============================================================================
// 🎭 MODO DEMO - Cambiar a false para usar datos reales de Supabase
// ============================================================================
const MODO_DEMO = ref(true) // ← Cambiar a false cuando tengas datos reales

const registros = ref([])
const loading = ref(true)
const chartCanvas = ref(null)
let chartInstance = null

// Cargar datos de evolución
const cargarEvolucion = async () => {
  loading.value = true
  try {
    // ========================================================================
    // 🎭 MODO DEMO: Datos mock para demostración
    // ========================================================================
    if (MODO_DEMO.value) {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Generar datos de últimos 30 días con tendencias diferentes según paciente
      const diasAtras = 30
      const datos = []
      
      for (let i = diasAtras; i >= 0; i--) {
        const fecha = new Date()
        fecha.setDate(fecha.getDate() - i)
        
        let nivelAnimo, nivelEnergia, nivelEstres
        
        // Diferentes patrones según el paciente
        if (props.pacienteId === 'demo-1') {
          // María: Tendencia positiva gradual
          nivelAnimo = 3 + Math.random() * 2 + (diasAtras - i) * 0.02
          nivelEnergia = 3 + Math.random() * 1.5 + (diasAtras - i) * 0.015
          nivelEstres = 3 - (diasAtras - i) * 0.015 + Math.random() * 0.5
        } else if (props.pacienteId === 'demo-2') {
          // Carlos: Últimos días bajos (requiere atención)
          if (i <= 3) {
            nivelAnimo = 1 + Math.random() * 1
            nivelEnergia = 1.5 + Math.random() * 1
            nivelEstres = 4 + Math.random() * 1
          } else {
            nivelAnimo = 2 + Math.random() * 2
            nivelEnergia = 2.5 + Math.random() * 1.5
            nivelEstres = 3 + Math.random() * 1.5
          }
        } else if (props.pacienteId === 'demo-3') {
          // Ana: Muy estable y positiva
          nivelAnimo = 4 + Math.random() * 1
          nivelEnergia = 4 + Math.random() * 1
          nivelEstres = 1 + Math.random() * 1
        } else {
          // Otros: Neutral estable
          nivelAnimo = 3 + Math.random() * 1.5
          nivelEnergia = 3 + Math.random() * 1.5
          nivelEstres = 2 + Math.random() * 1.5
        }
        
        datos.push({
          fecha: fecha.toISOString().split('T')[0],
          nivel_animo: Math.max(1, Math.min(5, nivelAnimo)),
          nivel_energia: Math.max(1, Math.min(5, nivelEnergia)),
          nivel_estres: Math.max(1, Math.min(5, nivelEstres))
        })
      }
      
      registros.value = datos
      
      if (datos.length > 0) {
        nextTick(() => {
          crearGrafico()
        })
      }
      
      loading.value = false
      return
    }
    
    // ========================================================================
    // 📊 MODO PRODUCCIÓN: Datos reales de Supabase
    // ========================================================================
    
    const supabase = useSupabaseClient()
    
    // Obtener registros emocionales de los últimos 30 días
    const fechaInicio = new Date()
    fechaInicio.setDate(fechaInicio.getDate() - 30)
    
    const { data, error } = await supabase
      .from('emociones_avanzadas')
      .select('fecha, nivel_animo, nivel_energia, nivel_estres')
      .eq('paciente_id', props.pacienteId)
      .gte('fecha', fechaInicio.toISOString())
      .order('fecha', { ascending: true })
    
    if (error) throw error
    
    registros.value = data || []
    
    if (data && data.length > 0) {
      nextTick(() => {
        crearGrafico()
      })
    }
  } catch (error) {
    console.error('Error al cargar evolución:', error)
  } finally {
    loading.value = false
  }
}

// Crear gráfico
const crearGrafico = () => {
  if (!chartCanvas.value) return
  
  // Destruir gráfico anterior si existe
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  const ctx = chartCanvas.value.getContext('2d')
  
  const labels = registros.value.map(r => {
    const fecha = new Date(r.fecha)
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  })
  
  const dataAnimo = registros.value.map(r => r.nivel_animo)
  const dataEnergia = registros.value.map(r => r.nivel_energia)
  const dataEstres = registros.value.map(r => 5 - r.nivel_estres) // Invertir para que más alto = mejor
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Ánimo',
          data: dataAnimo,
          borderColor: '#D8AFA0',
          backgroundColor: 'rgba(216, 175, 160, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Energía',
          data: dataEnergia,
          borderColor: '#B7C6B0',
          backgroundColor: 'rgba(183, 198, 176, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Calma',
          data: dataEstres,
          borderColor: '#C89B8A',
          backgroundColor: 'rgba(200, 155, 138, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            font: {
              family: 'Lato',
              size: 11
            },
            color: '#5D4A44',
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(93, 74, 68, 0.9)',
          titleFont: {
            family: 'Lora',
            size: 13
          },
          bodyFont: {
            family: 'Lato',
            size: 12
          },
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            font: {
              family: 'Lato',
              size: 11
            },
            color: '#5D4A44'
          },
          grid: {
            color: 'rgba(234, 213, 211, 0.3)'
          }
        },
        x: {
          ticks: {
            font: {
              family: 'Lato',
              size: 11
            },
            color: '#5D4A44',
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

// Computados para estadísticas
const promedioGeneral = computed(() => {
  if (registros.value.length === 0) return '—'
  const suma = registros.value.reduce((acc, r) => acc + r.nivel_animo, 0)
  return (suma / registros.value.length).toFixed(1)
})

const mejorValor = computed(() => {
  if (registros.value.length === 0) return '—'
  return Math.max(...registros.value.map(r => r.nivel_animo))
})

const totalRegistros = computed(() => {
  return registros.value.length
})

const descripcionTendencia = computed(() => {
  if (registros.value.length === 0) return ''
  
  const ultimos7 = registros.value.slice(-7)
  const promedio7 = ultimos7.reduce((acc, r) => acc + r.nivel_animo, 0) / ultimos7.length
  
  const primeros7 = registros.value.slice(0, Math.min(7, registros.value.length))
  const promedioPrimeros = primeros7.reduce((acc, r) => acc + r.nivel_animo, 0) / primeros7.length
  
  const diferencia = promedio7 - promedioPrimeros
  
  if (diferencia > 0.5) {
    return '📈 Los últimos registros emocionales muestran una tendencia positiva. El paciente ha reportado mejoras consistentes en su estado de ánimo y bienestar general.'
  } else if (diferencia < -0.5) {
    return '📉 Los registros recientes sugieren un descenso en el bienestar emocional. Considera explorar posibles factores estresantes o cambios en el proceso terapéutico.'
  } else {
    return '➡️ El estado emocional se mantiene relativamente estable. El paciente continúa registrando sus emociones de manera consistente.'
  }
})

// Lifecycle
onMounted(() => {
  cargarEvolucion()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})

// Exponer método para recargar
defineExpose({
  recargar: cargarEvolucion
})
</script>
