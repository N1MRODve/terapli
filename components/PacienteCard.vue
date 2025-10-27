<template>
  <div 
    class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-6 hover:shadow-md transition-all duration-300 group relative cursor-pointer"
  >
    <!-- Botones de acción (aparecen al hover) -->
    <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <button
        @click.stop="$emit('gestionar-bonos', paciente)"
        class="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-md"
        title="Gestionar bonos"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      </button>
      <button
        @click.stop="$emit('editar', paciente)"
        class="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
        title="Editar paciente"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        @click.stop="$emit('eliminar', paciente)"
        class="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
        title="Eliminar paciente"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

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
      <div class="flex items-center gap-2 text-sm text-cafe/70">
        <span class="text-terracota">📅</span>
        <span>Última sesión: {{ ultimaSesion }}</span>
      </div>
      
      <div class="flex items-center gap-2 text-sm text-cafe/70">
        <span class="text-terracota">�</span>
        <span>Próxima: {{ proximaSesion }}</span>
        <button
          @click.stop="$emit('ver-citas', paciente)"
          class="ml-auto text-xs text-terracota hover:text-cafe hover:underline"
          title="Ver todas las citas"
        >
          Ver citas →
        </button>
      </div>

      <div class="flex items-center gap-2 text-sm text-cafe/70">
        <span class="text-terracota">�</span>
        <span>{{ totalSesiones }} sesiones completadas</span>
      </div>
    </div>

    <!-- Sección de BONO ACTIVO (destacada) -->
    <div v-if="bonoActivo" class="mb-4 p-4 bg-gradient-to-br from-terracota/5 to-rosa/10 rounded-lg border border-terracota/20">
      <div class="space-y-3">
        <!-- Tipo de Bono -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-terracota">🎟️</span>
            <span class="font-medium text-cafe">Bono:</span>
            <span 
              class="px-2 py-0.5 rounded-md text-xs font-semibold"
              :class="tipoBonoClasses"
            >
              {{ tipoBonoTexto }}
            </span>
          </div>
          
          <!-- Estado -->
          <span 
            class="px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
            :class="estadoBonoClasses"
          >
            <span>💰</span>
            <span>{{ estadoBonoTexto }}</span>
          </span>
        </div>

        <!-- Fecha fin -->
        <div class="flex items-center gap-2 text-sm text-cafe/80">
          <span class="text-terracota">�</span>
          <span class="font-medium">Fin:</span>
          <span :class="fechaFinClasses">{{ fechaFinTexto }}</span>
        </div>

        <!-- Sesiones X/Y -->
        <div class="flex items-center gap-2 text-sm">
          <span class="text-terracota">🧭</span>
          <span class="font-medium text-cafe">
            Sesiones: 
            <span :class="sesionesColorClass">
              {{ sesionesUsadas }}/{{ sesionesTotales }}
            </span>
          </span>
        </div>

        <!-- Barra de progreso -->
        <div class="pt-2">
          <div class="flex items-center justify-between text-xs text-cafe/60 mb-1.5">
            <span>Progreso del bono</span>
            <span class="font-semibold">{{ progresoBonoTexto }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              class="h-2.5 rounded-full transition-all duration-500"
              :class="progresoBonoColorClass"
              :style="{ width: `${progresoBono}%` }"
            ></div>
          </div>
        </div>
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

defineEmits(['editar', 'eliminar', 'ver-citas', 'gestionar-bonos'])

// Computar nombre para mostrar
const nombreMostrar = computed(() => {
  const nombreCompleto = props.paciente.nombre || 'Sin nombre'
  if (!nombreCompleto || nombreCompleto === 'Sin nombre') return 'Sin nombre'
  
  // Si el nombre tiene múltiples palabras, formatear con inicial del último apellido
  const partes = nombreCompleto.trim().split(' ')
  if (partes.length > 2) {
    // Formato: "Nombre Apellido1 A."
    const nombre = partes[0]
    const apellido1 = partes[1]
    const apellido2Inicial = partes[partes.length - 1].charAt(0)
    return `${nombre} ${apellido1} ${apellido2Inicial}.`
  }
  
  return nombreCompleto
})

// Computar iniciales para avatar
const iniciales = computed(() => {
  const nombreCompleto = props.paciente.nombre || ''
  if (!nombreCompleto) return '??'
  
  const partes = nombreCompleto.trim().split(' ')
  const nombreInicial = partes[0]?.charAt(0).toUpperCase() || '?'
  const apellidoInicial = partes[1]?.charAt(0).toUpperCase() || ''
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
  
  try {
    // Asegurar que el formato de fecha es correcto
    let fechaStr = props.paciente.proxima_sesion
    
    // Si la fecha no incluye T, añadirla para parsing correcto
    if (!fechaStr.includes('T')) {
      fechaStr += 'T00:00:00'
    }
    
    const fecha = new Date(fechaStr)
    
    // Verificar que la fecha es válida
    if (isNaN(fecha.getTime())) {
      console.warn('Fecha inválida en próxima sesión:', props.paciente.proxima_sesion)
      return null
    }
    
    return fecha.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error al formatear próxima sesión:', error, props.paciente.proxima_sesion)
    return null
  }
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

// Tipo de bono - texto y estilos
const tipoBonoTexto = computed(() => {
  if (!bonoActivo.value?.tipo) return 'Sin tipo'
  
  const tipoMap = {
    'a_demanda': 'A demanda',
    'quincenal': 'Quincenal',
    'semanal': 'Semanal'
  }
  
  return tipoMap[bonoActivo.value.tipo] || bonoActivo.value.tipo
})

const tipoBonoClasses = computed(() => {
  if (!bonoActivo.value?.tipo) return 'bg-gray-100 text-gray-600'
  
  const classMap = {
    'a_demanda': 'bg-blue-100 text-blue-700',
    'quincenal': 'bg-purple-100 text-purple-700',
    'semanal': 'bg-indigo-100 text-indigo-700'
  }
  
  return classMap[bonoActivo.value.tipo] || 'bg-gray-100 text-gray-600'
})

// Estado del bono - texto y estilos
const estadoBonoTexto = computed(() => {
  if (!bonoActivo.value?.estado) return 'Sin estado'
  
  const estadoMap = {
    'activo': 'Activo',
    'pendiente': 'Pendiente',
    'vencido': 'Vencido',
    'completado': 'Completado'
  }
  
  return estadoMap[bonoActivo.value.estado] || bonoActivo.value.estado
})

const estadoBonoClasses = computed(() => {
  if (!bonoActivo.value?.estado) return 'bg-gray-100 text-gray-600'
  
  const classMap = {
    'activo': 'bg-green-100 text-green-700',
    'pendiente': 'bg-yellow-100 text-yellow-700',
    'vencido': 'bg-red-100 text-red-700',
    'completado': 'bg-gray-100 text-gray-600'
  }
  
  return classMap[bonoActivo.value.estado] || 'bg-gray-100 text-gray-600'
})

// Fecha fin - texto y estilos
const fechaFinTexto = computed(() => {
  if (!bonoActivo.value?.fecha_fin) return 'Sin fecha'
  
  try {
    const fecha = new Date(bonoActivo.value.fecha_fin)
    return fecha.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  } catch (error) {
    return 'Fecha inválida'
  }
})

const fechaFinClasses = computed(() => {
  if (!bonoActivo.value?.fecha_fin) return 'text-cafe/60'
  
  const fecha = new Date(bonoActivo.value.fecha_fin)
  const ahora = new Date()
  const diasRestantes = Math.floor((fecha - ahora) / (1000 * 60 * 60 * 24))
  
  if (diasRestantes < 0) return 'text-red-600 font-semibold'
  if (diasRestantes <= 7) return 'text-orange-600 font-semibold'
  if (diasRestantes <= 14) return 'text-amber-600'
  return 'text-cafe/80'
})

// Sesiones - contadores y estilos
const sesionesUsadas = computed(() => {
  if (!bonoActivo.value) return 0
  return bonoActivo.value.total_sesiones - bonoActivo.value.sesiones_restantes
})

const sesionesTotales = computed(() => {
  return bonoActivo.value?.total_sesiones || 0
})

const sesionesColorClass = computed(() => {
  if (!bonoActivo.value) return 'text-terracota'
  
  const restantes = bonoActivo.value.sesiones_restantes
  if (restantes === 0) return 'text-red-600 font-bold'
  if (restantes === 1) return 'text-red-600 font-semibold'
  if (restantes === 2) return 'text-orange-600 font-semibold'
  return 'text-terracota font-semibold'
})

// Progreso del bono - cálculo y estilos
const progresoBono = computed(() => {
  if (!bonoActivo.value) return 0
  
  const total = bonoActivo.value.total_sesiones
  const restantes = bonoActivo.value.sesiones_restantes
  
  if (total === 0) return 0
  
  const usadas = total - restantes
  return Math.round((usadas / total) * 100)
})

const progresoBonoTexto = computed(() => {
  return progresoBono.value.toString()
})

const progresoBonoColorClass = computed(() => {
  if (!bonoActivo.value) return 'bg-gray-400'
  
  const estado = bonoActivo.value.estado
  
  // Color según estado
  const colorMap = {
    'activo': 'bg-green-500',
    'pendiente': 'bg-yellow-500',
    'vencido': 'bg-red-500',
    'completado': 'bg-gray-400'
  }
  
  return colorMap[estado] || 'bg-gray-400'
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
