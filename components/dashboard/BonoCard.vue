<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: BonoCard
 * =============================================================================
 * Tarjeta de bono próximo a agotarse con diseño mejorado.
 * Muestra: Paciente, tipo de bono, sesiones restantes, última sesión.
 */

const props = defineProps<{
  id: string
  pacienteId: string
  pacienteNombre: string
  tipoBono: string
  sesionesRestantes: number
  sesionesTotales: number
  ultimaSesion?: string
}>()

const emit = defineEmits<{
  (e: 'ver-bono', id: string): void
  (e: 'programar-cita', pacienteId: string): void
}>()

// Calcular tiempo desde última sesión
const tiempoUltimaSesion = computed(() => {
  if (!props.ultimaSesion) return 'Sin sesiones recientes'

  const fecha = new Date(props.ultimaSesion)
  const hoy = new Date()
  const diffMs = hoy.getTime() - fecha.getTime()
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDias === 0) return 'Última sesión: hoy'
  if (diffDias === 1) return 'Última sesión: ayer'
  if (diffDias < 7) return `Última sesión: hace ${diffDias} días`
  if (diffDias < 14) return 'Última sesión: hace 1 semana'
  if (diffDias < 30) return `Última sesión: hace ${Math.floor(diffDias / 7)} semanas`
  return `Última sesión: hace ${Math.floor(diffDias / 30)} meses`
})

// Color según urgencia (sesiones restantes)
const colorClase = computed(() => {
  if (props.sesionesRestantes <= 1) return 'border-l-red-500 bg-red-50/50'
  if (props.sesionesRestantes <= 2) return 'border-l-amber-500 bg-amber-50/50'
  return 'border-l-gray-300 bg-white'
})

// Texto de sesiones restantes
const sesionesTexto = computed(() => {
  if (props.sesionesRestantes === 1) return 'Queda 1 sesión'
  return `Quedan ${props.sesionesRestantes} sesiones`
})
</script>

<template>
  <div
    class="p-3 rounded-xl border border-gray-200 border-l-[3px] transition-all duration-200 hover:shadow-sm"
    :class="colorClase"
  >
    <!-- Fila 1: Paciente + tipo de bono -->
    <div class="flex items-center justify-between mb-1.5">
      <p class="font-semibold text-gray-900 text-sm">
        {{ pacienteNombre }}
        <span class="text-gray-400 font-normal">·</span>
        <span class="text-gray-600 font-medium">{{ tipoBono }}</span>
      </p>
    </div>

    <!-- Fila 2: Sesiones restantes + última sesión -->
    <div class="flex items-center gap-2 text-xs">
      <span
        class="font-semibold"
        :class="sesionesRestantes <= 1 ? 'text-red-600' : sesionesRestantes <= 2 ? 'text-amber-600' : 'text-gray-600'"
      >
        {{ sesionesTexto }}
      </span>
      <span class="text-gray-300">·</span>
      <span class="text-gray-500">{{ tiempoUltimaSesion }}</span>
    </div>

    <!-- Fila 3: Acciones -->
    <div class="flex items-center gap-2 mt-3">
      <button
        @click.stop="emit('ver-bono', id)"
        class="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-violet-700 hover:bg-violet-50 border border-gray-200 hover:border-violet-200 rounded-lg transition-colors"
      >
        Ver bono
      </button>
      <button
        @click.stop="emit('programar-cita', pacienteId)"
        class="px-3 py-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 border border-violet-200 hover:border-violet-300 rounded-lg transition-colors"
      >
        Programar cita
      </button>
    </div>
  </div>
</template>
