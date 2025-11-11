<template>
  <div class="bg-white rounded-2xl shadow-sm border border-[#EAD5D3]/40 p-6 space-y-6">
    <!-- Header con selector de rango -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-xl font-['Lora'] text-[#5D4A44] mb-1">Evolución emocional 📈</h2>
        <p class="text-sm font-['Lato'] text-[#5D4A44]/70">
          Observa cómo ha sido tu estado emocional en los últimos días
        </p>
      </div>
      <div class="flex space-x-2">
        <button
          v-for="r in rangos"
          :key="r.valor"
          @click="cambiarRango(r.valor)"
          :class="[
            'px-4 py-2 rounded-xl text-sm font-[\'Lato\'] font-medium transition-all duration-200',
            rango === r.valor 
              ? 'bg-[#D8AFA0] text-white shadow-sm' 
              : 'bg-[#F9F7F3] text-[#5D4A44]/70 hover:bg-[#EAD5D3]/40 hover:text-[#5D4A44]'
          ]"
        >
          {{ r.texto }}
        </button>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center space-y-3">
        <svg class="animate-spin h-8 w-8 text-[#D8AFA0]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-sm font-['Lato'] text-[#5D4A44]/70">Cargando tu evolución emocional...</p>
      </div>
    </div>

    <!-- Sin datos -->
    <div v-else-if="registros.length === 0" class="py-12 text-center">
      <div class="w-16 h-16 bg-[#F9F7F3] rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-[#D8AFA0]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 class="text-lg font-['Lora'] text-[#5D4A44] mb-2">
        Aún no hay registros suficientes
      </h3>
      <p class="text-sm font-['Lato'] text-[#5D4A44]/70 max-w-md mx-auto">
        Comienza a registrar tu estado emocional diariamente para ver tu evolución aquí. 
        Cada registro te ayudará a conocerte mejor 🌿
      </p>
    </div>

    <!-- Contenido principal con datos -->
    <div v-else class="space-y-6">
      <!-- Gráfico principal -->
      <div class="w-full">
        <div class="bg-[#F9F7F3]/30 rounded-xl p-4" style="height: 280px;">
          <Line 
            :data="chartData" 
            :options="chartOptions"
            :key="chartKey"
          />
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-[#F9F7F3] rounded-xl p-4 text-center">
          <p class="text-2xl font-['Lora'] font-medium text-[#5D4A44] mb-1">
            {{ registros.length }}
          </p>
          <p class="text-xs font-['Lato'] text-[#5D4A44]/70">
            {{ registros.length === 1 ? 'registro' : 'registros' }}
          </p>
        </div>
        <div class="bg-[#F9F7F3] rounded-xl p-4 text-center">
          <p class="text-2xl mb-1">{{ promedioEmocional.emoji }}</p>
          <p class="text-xs font-['Lato'] text-[#5D4A44]/70">
            Promedio
          </p>
        </div>
        <div class="bg-[#F9F7F3] rounded-xl p-4 text-center">
          <p class="text-2xl mb-1">{{ mejorDia.emoji }}</p>
          <p class="text-xs font-['Lato'] text-[#5D4A44]/70">
            Mejor día
          </p>
        </div>
        <div class="bg-[#F9F7F3] rounded-xl p-4 text-center">
          <p class="text-2xl font-['Lora'] font-medium text-[#D8AFA0] mb-1">
            {{ racha }}
          </p>
          <p class="text-xs font-['Lato'] text-[#5D4A44]/70">
            días seguidos
          </p>
        </div>
      </div>

      <!-- Emociones más frecuentes -->
      <div v-if="emocionesFrecuentes.length > 0" class="border-t border-[#EAD5D3]/30 pt-6">
        <h3 class="text-lg font-['Lora'] text-[#5D4A44] mb-3">
          Emociones más presentes 🌈
        </h3>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(emo, i) in emocionesFrecuentes"
            :key="i"
            class="group relative px-4 py-2 rounded-full transition-all duration-200"
            :style="{ 
              backgroundColor: obtenerColorEmocion(i),
              opacity: 0.9 - (i * 0.1)
            }"
          >
            <span class="text-sm font-['Lato'] font-medium text-[#5D4A44]">
              {{ emo.emocion }}
            </span>
            <span class="ml-1.5 text-xs font-['Lato'] text-[#5D4A44]/70">
              × {{ emo.frecuencia }}
            </span>
          </div>
        </div>
      </div>

      <!-- Factores influyentes -->
      <div v-if="factoresFrecuentes.length > 0" class="border-t border-[#EAD5D3]/30 pt-6">
        <h3 class="text-lg font-['Lora'] text-[#5D4A44] mb-3">
          Factores que más influyen 💡
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div
            v-for="(factor, i) in factoresFrecuentes"
            :key="i"
            class="flex items-center space-x-2 px-3 py-2 bg-[#EAD5D3]/30 rounded-lg"
          >
            <div class="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span class="text-lg">{{ obtenerIconoFactor(factor.factor) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-['Lato'] font-medium text-[#5D4A44] truncate">
                {{ factor.factor }}
              </p>
              <p class="text-xs font-['Lato'] text-[#5D4A44]/60">
                {{ factor.frecuencia }}×
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Insight textual personalizado -->
      <div v-if="insight" class="border-t border-[#EAD5D3]/30 pt-6">
        <div class="bg-gradient-to-br from-[#F9F7F3] to-white rounded-xl p-6 border border-[#EAD5D3]/30">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0 w-10 h-10 bg-[#D8AFA0]/20 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="text-sm font-['Lato'] font-semibold text-[#D8AFA0] mb-1">
                Reflexión sobre tu evolución
              </h4>
              <p class="text-sm font-['Lato'] text-[#5D4A44]/80 leading-relaxed italic">
                "{{ insight }}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { getUserId } = useSupabase()

import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Estados reactivos
const rango = ref('7d')
const registros = ref([])
const cargando = ref(true)
const chartKey = ref(0)

const rangos = [
  { valor: '7d', texto: '7 días' },
  { valor: '30d', texto: '30 días' }
]

// Mapeo de niveles emocionales
const niveles = ['muy mal', 'mal', 'neutral', 'bien', 'muy bien']
const emojisNiveles = {
  'muy mal': '😢',
  'mal': '😔',
  'neutral': '😐',
  'bien': '🙂',
  'muy bien': '😁'
}

// Computed properties
const chartData = computed(() => {
  if (registros.value.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  return {
    labels: registros.value.map(r =>
      new Date(r.fecha).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short' 
      })
    ),
    datasets: [
      {
        label: 'Estado emocional',
        data: registros.value.map(r => niveles.indexOf(r.estado_general) + 1),
        fill: true,
        borderColor: '#D8AFA0',
        backgroundColor: 'rgba(216, 175, 160, 0.15)',
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#D8AFA0',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#C89B8A',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 0,
      max: 6,
      ticks: {
        stepSize: 1,
        callback: (value) => {
          if (value === 0 || value === 6) return ''
          return niveles[value - 1] || ''
        },
        font: {
          family: 'Lato',
          size: 11
        },
        color: '#5D4A44'
      },
      grid: {
        color: 'rgba(93, 74, 68, 0.08)',
        drawBorder: false
      },
      border: {
        display: false
      }
    },
    x: {
      ticks: {
        font: {
          family: 'Lato',
          size: 11
        },
        color: '#5D4A44'
      },
      grid: {
        display: false
      },
      border: {
        display: false
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#5D4A44',
      titleFont: {
        family: 'Lora',
        size: 13
      },
      bodyFont: {
        family: 'Lato',
        size: 12
      },
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        title: (context) => {
          const index = context[0].dataIndex
          const fecha = registros.value[index]?.fecha
          if (!fecha) return ''
          return new Date(fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })
        },
        label: (context) => {
          const nivelIndex = context.parsed.y - 1
          const nivel = niveles[nivelIndex]
          const emoji = emojisNiveles[nivel]
          return `${emoji} ${nivel.charAt(0).toUpperCase() + nivel.slice(1)}`
        }
      }
    }
  }
}))

const emocionesFrecuentes = computed(() => {
  if (registros.value.length === 0) return []
  
  const todas = registros.value.flatMap(r => r.emociones || [])
  const conteo = todas.reduce((acc, emo) => {
    acc[emo] = (acc[emo] || 0) + 1
    return acc
  }, {})
  
  return Object.entries(conteo)
    .map(([emocion, frecuencia]) => ({ emocion, frecuencia }))
    .sort((a, b) => b.frecuencia - a.frecuencia)
    .slice(0, 5)
})

const factoresFrecuentes = computed(() => {
  if (registros.value.length === 0) return []
  
  const todos = registros.value.flatMap(r => r.influencias || [])
  const conteo = todos.reduce((acc, factor) => {
    acc[factor] = (acc[factor] || 0) + 1
    return acc
  }, {})
  
  return Object.entries(conteo)
    .map(([factor, frecuencia]) => ({ factor, frecuencia }))
    .sort((a, b) => b.frecuencia - a.frecuencia)
    .slice(0, 6)
})

const promedioEmocional = computed(() => {
  if (registros.value.length === 0) return { emoji: '😐', nivel: 'neutral' }
  
  const suma = registros.value.reduce((acc, r) => {
    return acc + (niveles.indexOf(r.estado_general) + 1)
  }, 0)
  
  const promedio = Math.round(suma / registros.value.length)
  const nivelPromedio = niveles[promedio - 1] || 'neutral'
  
  return {
    emoji: emojisNiveles[nivelPromedio],
    nivel: nivelPromedio
  }
})

const mejorDia = computed(() => {
  if (registros.value.length === 0) return { emoji: '😐', fecha: null }
  
  const mejor = registros.value.reduce((mejor, actual) => {
    const nivelActual = niveles.indexOf(actual.estado_general)
    const nivelMejor = niveles.indexOf(mejor.estado_general)
    return nivelActual > nivelMejor ? actual : mejor
  }, registros.value[0])
  
  return {
    emoji: emojisNiveles[mejor.estado_general],
    fecha: mejor.fecha
  }
})

const racha = computed(() => {
  if (registros.value.length === 0) return 0
  
  // Calcular días consecutivos con registros
  const fechasOrdenadas = registros.value
    .map(r => new Date(r.fecha).toDateString())
    .reverse()
  
  let rachaActual = 1
  const hoy = new Date().toDateString()
  
  // Verificar si hay registro hoy
  if (fechasOrdenadas[0] !== hoy) return 0
  
  for (let i = 0; i < fechasOrdenadas.length - 1; i++) {
    const fechaActual = new Date(fechasOrdenadas[i])
    const fechaSiguiente = new Date(fechasOrdenadas[i + 1])
    const diferenciaDias = Math.floor((fechaActual - fechaSiguiente) / (1000 * 60 * 60 * 24))
    
    if (diferenciaDias === 1) {
      rachaActual++
    } else {
      break
    }
  }
  
  return rachaActual
})

const insight = computed(() => {
  if (registros.value.length < 3) return ''
  
  const estadosRecientes = registros.value.slice(-7)
  const promedio = estadosRecientes.reduce((acc, r) => 
    acc + (niveles.indexOf(r.estado_general) + 1), 0
  ) / estadosRecientes.length
  
  // Análisis de tendencia
  const primerosRegistros = estadosRecientes.slice(0, Math.ceil(estadosRecientes.length / 2))
  const ultimosRegistros = estadosRecientes.slice(Math.ceil(estadosRecientes.length / 2))
  
  const promedioInicio = primerosRegistros.reduce((acc, r) => 
    acc + (niveles.indexOf(r.estado_general) + 1), 0
  ) / primerosRegistros.length
  
  const promedioFinal = ultimosRegistros.reduce((acc, r) => 
    acc + (niveles.indexOf(r.estado_general) + 1), 0
  ) / ultimosRegistros.length
  
  const tendencia = promedioFinal - promedioInicio
  
  // Emociones más frecuentes
  const topEmocion = emocionesFrecuentes.value[0]?.emocion.toLowerCase() || ''
  
  // Factores más frecuentes
  const topFactor = factoresFrecuentes.value[0]?.factor.toLowerCase() || ''
  
  // Generar insight personalizado
  if (tendencia > 0.5) {
    if (topFactor) {
      return `Tu bienestar emocional ha mejorado recientemente. "${topFactor}" parece estar influyendo positivamente en tu estado de ánimo. Sigue cuidando este aspecto 💚`
    }
    return 'Tu estado emocional ha mostrado una tendencia positiva en los últimos días. Celebra este progreso y reconoce lo que te ha ayudado a sentirte mejor 🌟'
  } else if (tendencia < -0.5) {
    if (topFactor) {
      return `Has atravesado días más difíciles recientemente. "${topFactor}" parece estar afectando tu bienestar. Recuerda que está bien pedir apoyo cuando lo necesites 🌸`
    }
    return 'Tu energía emocional ha estado más baja últimamente. Sé amable contigo misma y date permiso para descansar. Los días difíciles también forman parte del proceso 💛'
  } else {
    if (topEmocion === 'tranquilo' || topEmocion === 'en paz') {
      return `Tu equilibrio emocional ha sido constante. La emoción "${topEmocion}" ha sido tu compañera frecuente. Sigue cultivando estos espacios de calma 🌿`
    } else if (topEmocion === 'ansioso' || topEmocion === 'cansado') {
      return `Has experimentado "${topEmocion}" con frecuencia. Tu cuerpo y mente te están enviando señales. Escúchalas con compasión y busca momentos de autocuidado 💙`
    } else if (topEmocion) {
      return `"${topEmocion}" ha sido tu emoción más recurrente. Reflexiona sobre qué situaciones o momentos la han estado alimentando. El autoconocimiento es el primer paso 🌻`
    }
    return 'Tu estado emocional ha sido variable, lo cual es completamente natural. Cada día trae sus propios desafíos y aprendizajes 🌈'
  }
})

// Funciones de utilidad
const obtenerColorEmocion = (indice) => {
  const colores = [
    '#D8AFA0', // Naranja claro
    '#EAD5D3', // Rosa empolvado
    '#B7C7A8', // Verde suave
    '#B4D4D3', // Azul sereno
    '#E8C4A8'  // Beige cálido
  ]
  return colores[indice % colores.length]
}

const obtenerIconoFactor = (factor) => {
  const iconos = {
    'Familia': '👨‍👩‍👧‍👦',
    'Trabajo': '💼',
    'Sueño': '😴',
    'Relaciones': '💕',
    'Salud': '🏥',
    'Ejercicio': '🏃‍♀️',
    'Tiempo libre': '🎨',
    'Alimentación': '🥗',
    'Terapia': '🌿',
    'Clima': '🌤️'
  }
  return iconos[factor] || '✨'
}

const cambiarRango = (nuevoRango) => {
  rango.value = nuevoRango
  cargarRegistros()
}

// Cargar registros desde Supabase
const cargarRegistros = async () => {
  if (!process.client) {
    cargando.value = false
    return
  }

  cargando.value = true

  try {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    const userId = getUserId()
    if (!userId) {
      cargando.value = false
      return
    }

    const dias = rango.value === '7d' ? 7 : 30
    const fechaInicio = new Date(Date.now() - dias * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('emociones_avanzadas')
      .select('*')
      .eq('paciente_id', userId)
      .gte('fecha', fechaInicio.toISOString())
      .order('fecha', { ascending: true })

    if (error) {
      console.error('Error cargando registros emocionales:', error)
      registros.value = []
    } else {
      registros.value = data || []
    }

    // Forzar actualización del gráfico
    chartKey.value++
  } catch (error) {
    console.error('Error inesperado al cargar registros:', error)
    registros.value = []
  } finally {
    cargando.value = false
  }
}

// Lifecycle
onMounted(() => {
  cargarRegistros()
})

// Watch para recargar cuando cambie el rango
watch(rango, () => {
  cargarRegistros()
})
</script>

<style scoped>
/* Asegurar que el contenedor del gráfico tenga el tamaño correcto */
canvas {
  max-height: 280px;
}
</style>
