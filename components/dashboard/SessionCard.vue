<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: SessionCard
 * =============================================================================
 * Tarjeta de sesión/cita para el dashboard con diseño moderno.
 * Muestra hora, paciente, modalidad y estado con jerarquía visual clara.
 */

const props = defineProps<{
  id: string
  hora: string
  pacienteNombre: string
  modalidad: 'presencial' | 'online' | 'virtual' | 'telefonica'
  estado: 'pendiente' | 'confirmada' | 'realizada' | 'cancelada'
  isNext?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', id: string): void
  (e: 'confirmar', id: string): void
}>()

// Configuración visual por modalidad
const modalidadConfig = {
  presencial: { label: 'Presencial', icon: '🏥', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  online: { label: 'Online', icon: '💻', class: 'bg-purple-100 text-purple-700 border-purple-200' },
  virtual: { label: 'Online', icon: '💻', class: 'bg-purple-100 text-purple-700 border-purple-200' },
  telefonica: { label: 'Teléfono', icon: '📞', class: 'bg-amber-100 text-amber-700 border-amber-200' }
}

// Configuración visual por estado
const estadoConfig = {
  pendiente: { label: 'Pendiente', class: 'bg-amber-100 text-amber-800 border-amber-300' },
  confirmada: { label: 'Confirmada', class: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  realizada: { label: 'Realizada', class: 'bg-blue-100 text-blue-800 border-blue-300' },
  cancelada: { label: 'Cancelada', class: 'bg-red-100 text-red-800 border-red-300' }
}

const modalidad = computed(() => modalidadConfig[props.modalidad] || modalidadConfig.presencial)
const estado = computed(() => estadoConfig[props.estado] || estadoConfig.pendiente)
</script>

<template>
  <div
    @click="emit('click', id)"
    class="relative flex items-center gap-4 p-4 rounded-xl border bg-white cursor-pointer transition-all duration-200 hover:shadow-md hover:border-violet-200 group"
    :class="{
      'ring-2 ring-violet-400 ring-offset-2 shadow-lg border-violet-300': isNext,
      'border-gray-100': !isNext
    }"
  >
    <!-- Badge "Próxima" -->
    <div
      v-if="isNext"
      class="absolute -top-2 left-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-violet-600 text-white rounded-full shadow-sm"
    >
      Próxima
    </div>

    <!-- Hora -->
    <div class="flex-shrink-0 w-16 text-center">
      <p class="text-2xl font-bold text-gray-900">{{ hora }}</p>
    </div>

    <!-- Separador vertical -->
    <div class="w-px h-12 bg-gray-200"></div>

    <!-- Info principal -->
    <div class="flex-1 min-w-0">
      <!-- Nombre paciente -->
      <p class="text-base font-semibold text-gray-900 truncate">
        {{ pacienteNombre }}
      </p>

      <!-- Chips de modalidad y estado -->
      <div class="flex items-center gap-2 mt-1.5">
        <!-- Modalidad -->
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border"
          :class="modalidad.class"
        >
          <span class="text-[10px]">{{ modalidad.icon }}</span>
          {{ modalidad.label }}
        </span>

        <!-- Estado -->
        <span
          class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border"
          :class="estado.class"
        >
          {{ estado.label }}
        </span>
      </div>
    </div>

    <!-- Acciones -->
    <div class="flex items-center gap-2">
      <!-- Botón confirmar (solo pendientes) -->
      <button
        v-if="props.estado === 'pendiente'"
        @click.stop="emit('confirmar', id)"
        class="px-3 py-1.5 text-xs font-medium bg-emerald-500 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-emerald-600 transition-all shadow-sm"
        title="Confirmar cita"
      >
        Confirmar
      </button>

      <!-- Botón ver detalles -->
      <button
        class="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
        title="Ver detalles"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>
