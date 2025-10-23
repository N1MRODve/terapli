<template>
  <div 
    class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-6 hover:shadow-md transition-all duration-300 cursor-pointer group"
    @click="$emit('click')"
  >
    <!-- Header con avatar y estado -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div 
          class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
          :style="{ backgroundColor: avatarColor }"
        >
          {{ iniciales }}
        </div>
        
        <!-- Nombre y estado emocional -->
        <div>
          <h3 class="font-serif text-lg font-semibold text-cafe group-hover:text-terracota transition-colors">
            {{ nombreMostrar }}
          </h3>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xl" :title="estadoEmocionalTexto">
              {{ estadoEmocional }}
            </span>
            <span class="text-xs text-cafe/60">
              {{ estadoEmocionalTexto }}
            </span>
          </div>
        </div>
      </div>

      <!-- Badge de estado del vínculo -->
      <span 
        class="px-3 py-1 text-xs font-medium rounded-full"
        :class="estadoVinculoClasses"
      >
        {{ estadoVinculoTexto }}
      </span>
    </div>

    <!-- Área de acompañamiento -->
    <div v-if="areaAcompanamiento" class="mb-3 flex items-center gap-2">
      <span class="text-xs text-cafe/50">Área:</span>
      <span class="text-sm text-cafe font-medium">
        {{ areaAcompanamiento }}
      </span>
    </div>

    <!-- Información de sesiones -->
    <div class="space-y-2 mb-4">
      <!-- Frecuencia de sesiones -->
      <div class="flex items-center gap-2 text-sm">
        <span class="text-terracota">🔄</span>
        <span class="font-medium text-cafe">
          Frecuencia: <span class="text-terracota">{{ frecuenciaTexto }}</span>
        </span>
      </div>

      <div class="flex items-center gap-2 text-sm text-cafe/70">
        <span class="text-terracota">📅</span>
        <span>Última sesión: {{ ultimaSesion }}</span>
      </div>
      
      <div v-if="proximaSesion" class="flex items-center gap-2 text-sm text-cafe/70">
        <span class="text-terracota">🔔</span>
        <span>Próxima: {{ proximaSesion }}</span>
      </div>

      <div class="flex items-center gap-2 text-sm text-cafe/70">
        <span class="text-terracota">💬</span>
        <span>{{ totalSesiones }} sesiones completadas</span>
      </div>

      <!-- Información del bono activo -->
      <div v-if="bonoActivo" class="flex items-center gap-2 text-sm">
        <span class="text-terracota">🎫</span>
        <span class="font-medium text-cafe">
          Bono: <span :class="bonoColorClass">{{ bonoActivo.sesiones_completadas }}/{{ bonoActivo.total_sesiones }}</span>
          <span class="text-xs text-cafe/60 ml-1">({{ bonoActivo.sesiones_restantes }} pendientes)</span>
        </span>
      </div>
    </div>

    <!-- Indicador de evolución -->
    <div class="pt-4 border-t border-gray-100">
      <div class="flex items-center justify-between text-xs text-cafe/60 mb-2">
        <span>Evolución general</span>
        <span class="font-medium">{{ evolucionPorcentaje }}%</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all duration-500"
          :class="evolucionColor"
          :style="{ width: `${evolucionPorcentaje}%` }"
        ></div>
      </div>
    </div>

    <!-- Alertas -->
    <div class="mt-4 space-y-2">
      <!-- Alerta de bono por agotarse (1 sesión restante) -->
      <div 
        v-if="tieneAlertaBonoCritica"
        class="flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg animate-pulse-subtle"
      >
        <span class="text-red-600 text-sm">🎫</span>
        <div class="flex-1">
          <p class="text-xs font-semibold text-red-800 mb-0.5">
            Bono casi agotado
          </p>
          <p class="text-xs text-red-700">
            Solo queda {{ bonoActivo.sesiones_restantes }} sesión. Informar para renovación.
          </p>
        </div>
      </div>

      <!-- Alerta de bono con pocas sesiones (2 sesiones restantes) -->
      <div 
        v-else-if="tieneAlertaBonoAdvertencia"
        class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-300 rounded-lg"
      >
        <span class="text-amber-600 text-sm">🎫</span>
        <div class="flex-1">
          <p class="text-xs font-semibold text-amber-800 mb-0.5">
            Bono próximo a agotar
          </p>
          <p class="text-xs text-amber-700">
            Quedan {{ bonoActivo.sesiones_restantes }} sesiones. Considerar renovación.
          </p>
        </div>
      </div>

      <!-- Alerta de inactividad (más de 45 días sin sesión) -->
      <div 
        v-if="tieneAlertaInactividad"
        class="flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg animate-pulse-subtle"
      >
        <span class="text-red-600 text-sm">🚨</span>
        <div class="flex-1">
          <p class="text-xs font-semibold text-red-800 mb-0.5">
            Riesgo de abandono
          </p>
          <p class="text-xs text-red-700">
            {{ diasInactividad }} días sin sesión. Considera contactar pronto.
          </p>
        </div>
      </div>

      <!-- Alerta de seguimiento especial (requiere atención por estado emocional) -->
      <div 
        v-if="tieneAlertaEmocional"
        class="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg"
      >
        <span class="text-orange-500 text-sm">⚠️</span>
        <p class="text-xs text-orange-800">
          Requiere seguimiento especial por estado emocional
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  paciente: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

// Computar nombre con inicial del segundo apellido
const nombreMostrar = computed(() => {
  const { nombre, apellidos } = props.paciente
  if (!apellidos) return nombre
  
  const apellidosArray = apellidos.split(' ')
  if (apellidosArray.length > 1) {
    return `${nombre} ${apellidosArray[0]} ${apellidosArray[1].charAt(0)}.`
  }
  return `${nombre} ${apellidos}`
})

// Computar iniciales para avatar
const iniciales = computed(() => {
  const { nombre, apellidos } = props.paciente
  const nombreInicial = nombre.charAt(0).toUpperCase()
  const apellidoInicial = apellidos ? apellidos.charAt(0).toUpperCase() : ''
  return `${nombreInicial}${apellidoInicial}`
})

// Color de avatar basado en el ID (consistente)
const avatarColor = computed(() => {
  const colors = ['#D8AFA0', '#C89B8A', '#B7C6B0', '#A8C5B5', '#D4A5A5', '#C4B5A0']
  const index = props.paciente.id.charCodeAt(0) % colors.length
  return colors[index]
})

// Estado emocional (basado en últimos registros)
const estadoEmocional = computed(() => {
  const promedio = props.paciente.estado_emocional_promedio || 3
  if (promedio >= 4) return '😊'
  if (promedio >= 3) return '😐'
  return '😔'
})

const estadoEmocionalTexto = computed(() => {
  const promedio = props.paciente.estado_emocional_promedio || 3
  if (promedio >= 4) return 'Estado positivo'
  if (promedio >= 3) return 'Estado neutro'
  return 'Requiere atención'
})

// Estado del vínculo terapéutico
const estadoVinculoTexto = computed(() => {
  if (!props.paciente.activo) return 'Finalizado'
  if (props.paciente.en_pausa) return 'En pausa'
  return 'Activo'
})

const estadoVinculoClasses = computed(() => {
  if (!props.paciente.activo) {
    return 'bg-gray-100 text-gray-600'
  }
  if (props.paciente.en_pausa) {
    return 'bg-yellow-100 text-yellow-700'
  }
  return 'bg-green-100 text-green-700'
})

// Frecuencia de sesiones
const frecuenciaTexto = computed(() => {
  const frecuencia = props.paciente.frecuencia || ''
  if (!frecuencia) return 'No definida'
  
  // Capitalizar primera letra y formatear
  const frecuenciaMap = {
    'semanal': 'Semanal',
    'quincenal': 'Quincenal',
    'mensual': 'Mensual'
  }
  
  return frecuenciaMap[frecuencia.toLowerCase()] || frecuencia
})

// Área de acompañamiento
const areaAcompanamiento = computed(() => {
  return props.paciente.area_de_acompanamiento || null
})

// Última sesión
const ultimaSesion = computed(() => {
  if (!props.paciente.ultima_sesion) return 'Sin registro'
  const fecha = new Date(props.paciente.ultima_sesion)
  const ahora = new Date()
  const diffDias = Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24))
  
  if (diffDias === 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`
  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
})

// Próxima sesión (si existe)
const proximaSesion = computed(() => {
  if (!props.paciente.proxima_sesion) return null
  const fecha = new Date(props.paciente.proxima_sesion)
  return fecha.toLocaleDateString('es-ES', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Total de sesiones
const totalSesiones = computed(() => {
  return props.paciente.total_sesiones || 0
})

// Evolución (porcentaje calculado)
const evolucionPorcentaje = computed(() => {
  return props.paciente.evolucion_porcentaje || 50
})

const evolucionColor = computed(() => {
  const valor = evolucionPorcentaje.value
  if (valor >= 70) return 'bg-green-500'
  if (valor >= 50) return 'bg-yellow-500'
  return 'bg-orange-500'
})

// ============================================================================
// SISTEMA DE ALERTAS
// ============================================================================

// Calcular días desde última sesión
const diasInactividad = computed(() => {
  if (!props.paciente.ultima_sesion) return 0
  const fecha = new Date(props.paciente.ultima_sesion)
  const ahora = new Date()
  return Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24))
})

// Alerta de inactividad (>30 días sin sesión)
const tieneAlertaInactividad = computed(() => {
  // Solo mostrar alerta para pacientes activos
  if (!props.paciente.activo || props.paciente.en_pausa) return false
  
  // Mostrar alerta si han pasado más de 30 días sin sesión
  return diasInactividad.value > 30
})

// Alerta emocional (tendencia negativa)
const tieneAlertaEmocional = computed(() => {
  return props.paciente.requiere_atencion || false
})

// ============================================================================
// INFORMACIÓN DE BONO
// ============================================================================

// Bono activo (si existe)
const bonoActivo = computed(() => {
  return props.paciente.bono_activo || null
})

// Color del texto del bono según sesiones restantes
const bonoColorClass = computed(() => {
  if (!bonoActivo.value) return 'text-terracota'
  
  const restantes = bonoActivo.value.sesiones_restantes
  if (restantes <= 1) return 'text-red-600 font-semibold'
  if (restantes <= 2) return 'text-orange-600 font-semibold'
  return 'text-terracota font-semibold'
})

// Alerta crítica de bono (1 sesión restante)
const tieneAlertaBonoCritica = computed(() => {
  if (!bonoActivo.value) return false
  return bonoActivo.value.sesiones_restantes === 1
})

// Alerta de advertencia de bono (2 sesiones restantes)
const tieneAlertaBonoAdvertencia = computed(() => {
  if (!bonoActivo.value) return false
  return bonoActivo.value.sesiones_restantes === 2
})
</script>

<style scoped>
@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}
</style>
