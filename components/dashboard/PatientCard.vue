<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: PatientCard
 * =============================================================================
 * Tarjeta de paciente para el dashboard "Actividad reciente de pacientes".
 * Muestra: nombre, último contacto (relativo), estado de bono con mini barra.
 */

const props = defineProps<{
  id: string
  nombre: string
  ultimaSesion?: string
  proximaCita?: string
  sesionesUsadas?: number
  sesionesTotales?: number
  estadoBono?: 'activo' | 'por_agotar' | 'sin_bono' | 'agotado'
}>()

const emit = defineEmits<{
  (e: 'click', id: string): void
}>()

// Generar iniciales del nombre
const iniciales = computed(() => {
  if (!props.nombre) return '?'
  const palabras = props.nombre.split(' ').filter(Boolean)
  if (palabras.length >= 2) {
    return (palabras[0][0] + palabras[1][0]).toUpperCase()
  }
  return palabras[0]?.substring(0, 2).toUpperCase() || '?'
})

// Progreso del bono (sesiones restantes)
const sesionesRestantes = computed(() => {
  if (!props.sesionesTotales) return 0
  return props.sesionesTotales - (props.sesionesUsadas || 0)
})

const progresoBono = computed(() => {
  if (!props.sesionesTotales || props.sesionesTotales === 0) return 0
  return Math.round(((props.sesionesUsadas || 0) / props.sesionesTotales) * 100)
})

// Formatear última sesión de forma relativa
const ultimaSesionRelativa = computed(() => {
  if (!props.ultimaSesion) return 'Sin actividad'

  const fecha = new Date(props.ultimaSesion)
  const hoy = new Date()
  const diffMs = hoy.getTime() - fecha.getTime()
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDias === 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`
  if (diffDias < 14) return 'Hace 1 semana'
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`
  if (diffDias < 60) return 'Hace 1 mes'
  return `Hace ${Math.floor(diffDias / 30)} meses`
})

// Fecha real formateada para tooltip
const ultimaSesionFechaReal = computed(() => {
  if (!props.ultimaSesion) return ''
  const fecha = new Date(props.ultimaSesion)
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Estado del bono con texto descriptivo
const estadoBonoTexto = computed(() => {
  if (!props.estadoBono || props.estadoBono === 'sin_bono') {
    return { texto: 'Sin bono', color: 'text-gray-400' }
  }
  if (props.estadoBono === 'agotado') {
    return { texto: 'Bono agotado', color: 'text-red-500' }
  }
  if (props.estadoBono === 'por_agotar') {
    return {
      texto: `Bono activo · ${sesionesRestantes.value}/${props.sesionesTotales}`,
      color: 'text-amber-600'
    }
  }
  // activo
  return {
    texto: `Bono activo · ${sesionesRestantes.value}/${props.sesionesTotales}`,
    color: 'text-emerald-600'
  }
})

// Color de la barra de progreso
const barraColor = computed(() => {
  if (props.estadoBono === 'por_agotar') return 'bg-amber-500'
  if (props.estadoBono === 'agotado') return 'bg-red-400'
  if (props.estadoBono === 'activo') return 'bg-emerald-500'
  return 'bg-gray-300'
})
</script>

<template>
  <div
    @click="emit('click', id)"
    class="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-200 group"
  >
    <!-- Avatar -->
    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm">
      {{ iniciales }}
    </div>

    <!-- Info principal -->
    <div class="flex-1 min-w-0">
      <!-- Nombre -->
      <p class="font-semibold text-gray-900 truncate text-sm">{{ nombre }}</p>

      <!-- Último contacto con tooltip -->
      <div class="flex items-center gap-2 mt-0.5">
        <span
          class="text-xs text-gray-500 flex items-center gap-1"
          :title="ultimaSesionFechaReal"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ ultimaSesionRelativa }}
        </span>
      </div>

      <!-- Estado de bono con mini barra -->
      <div class="flex items-center gap-2 mt-1.5">
        <span class="text-xs font-medium" :class="estadoBonoTexto.color">
          {{ estadoBonoTexto.texto }}
        </span>

        <!-- Mini barra de progreso (solo si hay bono) -->
        <div
          v-if="sesionesTotales && sesionesTotales > 0 && estadoBono !== 'sin_bono'"
          class="flex-1 max-w-16 h-1 bg-gray-100 rounded-full overflow-hidden"
        >
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="barraColor"
            :style="{ width: `${Math.min(progresoBono, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Botón ver ficha -->
    <button
      @click.stop="emit('click', id)"
      class="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
    >
      Ver ficha
    </button>

    <!-- Chevron siempre visible en móvil -->
    <svg class="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </div>
</template>
