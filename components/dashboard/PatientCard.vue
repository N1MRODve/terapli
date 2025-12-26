<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: PatientCard
 * =============================================================================
 * Tarjeta de paciente para el dashboard con información clara de bono y sesiones.
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

// Color del avatar basado en las iniciales
const avatarColor = computed(() => {
  const colors = [
    'bg-violet-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500'
  ]
  const hash = props.nombre?.charCodeAt(0) || 0
  return colors[hash % colors.length]
})

// Progreso del bono
const progresoBono = computed(() => {
  if (!props.sesionesTotales || props.sesionesTotales === 0) return 0
  return Math.round(((props.sesionesUsadas || 0) / props.sesionesTotales) * 100)
})

// Estado del bono con configuración visual
const estadoBonoConfig = {
  activo: { label: 'Bono activo', class: 'text-emerald-600 bg-emerald-50', icon: '✓' },
  por_agotar: { label: 'Por agotar', class: 'text-amber-600 bg-amber-50', icon: '!' },
  sin_bono: { label: 'Sin bono', class: 'text-gray-500 bg-gray-50', icon: '–' },
  agotado: { label: 'Bono agotado', class: 'text-red-600 bg-red-50', icon: '✗' }
}

const estadoBono = computed(() => {
  return estadoBonoConfig[props.estadoBono || 'sin_bono']
})

// Formatear última sesión
const ultimaSesionFormateada = computed(() => {
  if (!props.ultimaSesion) return 'Sin sesiones'

  const fecha = new Date(props.ultimaSesion)
  const hoy = new Date()
  const diffDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDias === 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`

  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
})
</script>

<template>
  <div
    @click="emit('click', id)"
    class="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-violet-200 group"
  >
    <!-- Avatar -->
    <div
      class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
      :class="avatarColor"
    >
      {{ iniciales }}
    </div>

    <!-- Info principal -->
    <div class="flex-1 min-w-0">
      <!-- Nombre -->
      <p class="font-semibold text-gray-900 truncate">{{ nombre }}</p>

      <!-- Info secundaria -->
      <div class="flex items-center gap-3 mt-1 text-sm">
        <!-- Última sesión -->
        <span class="text-gray-500 flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ ultimaSesionFormateada }}
        </span>

        <!-- Estado bono -->
        <span
          v-if="estadoBono"
          class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full"
          :class="estadoBono.class"
        >
          {{ estadoBono.label }}
        </span>
      </div>

      <!-- Barra de progreso del bono -->
      <div v-if="sesionesTotales && sesionesTotales > 0" class="mt-2">
        <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Sesiones del bono</span>
          <span class="font-medium">{{ sesionesUsadas || 0 }}/{{ sesionesTotales }}</span>
        </div>
        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="{
              'bg-emerald-500': progresoBono < 75,
              'bg-amber-500': progresoBono >= 75 && progresoBono < 100,
              'bg-red-500': progresoBono >= 100
            }"
            :style="{ width: `${Math.min(progresoBono, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Botón ver perfil -->
    <button
      class="flex-shrink-0 p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
      title="Ver perfil"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>
