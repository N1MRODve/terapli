<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: ReminderCard
 * =============================================================================
 * Tarjeta de recordatorio con tipos diferenciados, indicador de urgencia
 * y acciones rápidas.
 */

const props = defineProps<{
  id?: string
  tipo: 'confirmacion' | 'pago' | 'clinico' | 'bono' | 'general'
  mensaje: string
  paciente?: string
  fecha?: string
  hora?: string
  urgente?: boolean
  accion?: 'confirmar' | 'ver' | 'pagar'
}>()

const emit = defineEmits<{
  (e: 'accion', payload: { id?: string; tipo: string; accion?: string }): void
}>()

// Configuración por tipo de recordatorio
const tipoConfig = {
  confirmacion: {
    icon: '📅',
    bgClass: 'bg-amber-50 border-amber-200',
    bgClassUrgent: 'bg-red-50 border-red-300 ring-2 ring-red-200',
    iconBg: 'bg-amber-100',
    iconBgUrgent: 'bg-red-100',
    textClass: 'text-amber-900',
    textClassUrgent: 'text-red-900',
    accionLabel: 'Confirmar',
    accionClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    accionClassUrgent: 'bg-red-500 hover:bg-red-600 text-white'
  },
  pago: {
    icon: '💳',
    bgClass: 'bg-emerald-50 border-emerald-200',
    bgClassUrgent: 'bg-emerald-50 border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconBgUrgent: 'bg-emerald-100',
    textClass: 'text-emerald-900',
    textClassUrgent: 'text-emerald-900',
    accionLabel: 'Ver pago',
    accionClass: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    accionClassUrgent: 'bg-emerald-500 hover:bg-emerald-600 text-white'
  },
  clinico: {
    icon: '📝',
    bgClass: 'bg-blue-50 border-blue-200',
    bgClassUrgent: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100',
    iconBgUrgent: 'bg-blue-100',
    textClass: 'text-blue-900',
    textClassUrgent: 'text-blue-900',
    accionLabel: 'Ver',
    accionClass: 'bg-blue-500 hover:bg-blue-600 text-white',
    accionClassUrgent: 'bg-blue-500 hover:bg-blue-600 text-white'
  },
  bono: {
    icon: '🎟️',
    bgClass: 'bg-violet-50 border-violet-200',
    bgClassUrgent: 'bg-violet-50 border-violet-200',
    iconBg: 'bg-violet-100',
    iconBgUrgent: 'bg-violet-100',
    textClass: 'text-violet-900',
    textClassUrgent: 'text-violet-900',
    accionLabel: 'Ver bono',
    accionClass: 'bg-violet-500 hover:bg-violet-600 text-white',
    accionClassUrgent: 'bg-violet-500 hover:bg-violet-600 text-white'
  },
  general: {
    icon: '🔔',
    bgClass: 'bg-gray-50 border-gray-200',
    bgClassUrgent: 'bg-gray-50 border-gray-200',
    iconBg: 'bg-gray-100',
    iconBgUrgent: 'bg-gray-100',
    textClass: 'text-gray-900',
    textClassUrgent: 'text-gray-900',
    accionLabel: 'Ver',
    accionClass: 'bg-gray-500 hover:bg-gray-600 text-white',
    accionClassUrgent: 'bg-gray-500 hover:bg-gray-600 text-white'
  }
}

const config = computed(() => tipoConfig[props.tipo] || tipoConfig.general)

// Clases dinámicas según urgencia
const bgClass = computed(() => props.urgente ? config.value.bgClassUrgent : config.value.bgClass)
const iconBgClass = computed(() => props.urgente ? config.value.iconBgUrgent : config.value.iconBg)
const textClass = computed(() => props.urgente ? config.value.textClassUrgent : config.value.textClass)
const accionClass = computed(() => props.urgente ? config.value.accionClassUrgent : config.value.accionClass)

// Formatear mensaje para hacerlo más compacto
const mensajeFormateado = computed(() => {
  // Si hay paciente y fecha/hora, crear formato estructurado
  if (props.paciente && (props.fecha || props.hora)) {
    return null // Usamos estructura visual en lugar de texto
  }
  // Si no, usar el mensaje original
  return props.mensaje
})
</script>

<template>
  <div
    class="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:shadow-sm cursor-pointer group"
    :class="bgClass"
    @click="emit('accion', { id, tipo, accion })"
  >
    <!-- Icono -->
    <div
      class="relative flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg"
      :class="iconBgClass"
    >
      <span v-if="urgente" class="text-base">⚠️</span>
      <span v-else>{{ config.icon }}</span>
    </div>

    <!-- Contenido -->
    <div class="flex-1 min-w-0">
      <!-- Formato estructurado -->
      <template v-if="paciente && (fecha || hora)">
        <div class="flex items-center gap-2">
          <p class="font-medium truncate" :class="textClass">
            {{ paciente }}
          </p>
          <!-- Badge de urgencia -->
          <span
            v-if="urgente"
            class="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white rounded-full animate-pulse"
          >
            Urgente
          </span>
        </div>
        <p class="text-sm flex items-center gap-2 mt-0.5" :class="urgente ? 'text-red-700' : 'text-gray-600'">
          <span v-if="tipo === 'confirmacion'">Confirmar cita</span>
          <span v-else-if="tipo === 'pago'">Pago pendiente</span>
          <span v-else-if="tipo === 'bono'">Bono por agotar</span>
          <span v-else>{{ mensaje }}</span>
          <span v-if="fecha || hora" :class="urgente ? 'text-red-400' : 'text-gray-400'">•</span>
          <span v-if="fecha || hora" class="font-semibold">
            {{ fecha }} {{ hora }}
          </span>
        </p>
      </template>

      <!-- Formato de texto simple -->
      <template v-else>
        <p class="text-sm leading-relaxed" :class="textClass">
          {{ mensajeFormateado || mensaje }}
        </p>
      </template>
    </div>

    <!-- Botón de acción (siempre visible si es urgente) -->
    <button
      v-if="accion"
      @click.stop="emit('accion', { id, tipo, accion })"
      class="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all shadow-sm"
      :class="[
        accionClass,
        urgente ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      ]"
    >
      {{ config.accionLabel }}
    </button>

    <!-- Chevron -->
    <svg
      class="w-4 h-4 flex-shrink-0 transition-opacity"
      :class="urgente ? 'text-red-400 opacity-100' : 'text-gray-400 opacity-50 group-hover:opacity-100'"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
