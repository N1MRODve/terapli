<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: SessionCard
 * =============================================================================
 * Tarjeta de sesion/cita para el dashboard con diseno limpio y minimalista.
 * Fondo blanco, badges outline sin colores de fondo, iconos SVG.
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

// Configuracion visual por modalidad - simplificada
const modalidadConfig = {
  presencial: { label: 'Presencial', type: 'location' },
  online: { label: 'Online', type: 'video' },
  virtual: { label: 'Online', type: 'video' },
  telefonica: { label: 'Telefono', type: 'phone' }
}

const modalidad = computed(() => modalidadConfig[props.modalidad] || modalidadConfig.presencial)
</script>

<template>
  <div
    @click="emit('click', id)"
    class="relative flex items-center gap-4 p-4 bg-white rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md group"
    :class="isNext ? 'border-gray-200 shadow-sm' : 'border-gray-200'"
  >
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

      <!-- Modalidad y estado -->
      <div class="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
        <!-- Modalidad con icono SVG -->
        <span class="inline-flex items-center gap-1.5">
          <!-- Icono ubicacion (presencial) -->
          <svg v-if="modalidad.type === 'location'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <!-- Icono video (online) -->
          <svg v-else-if="modalidad.type === 'video'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <!-- Icono telefono -->
          <svg v-else-if="modalidad.type === 'phone'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {{ modalidad.label }}
        </span>

        <!-- Separador -->
        <span class="text-gray-300">|</span>

        <!-- Estado - solo texto, con color para confirmada -->
        <span :class="props.estado === 'confirmada' ? 'text-emerald-600' : 'text-gray-500'">
          <template v-if="props.estado === 'confirmada'">
            <svg class="w-4 h-4 inline mr-0.5 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </template>
          {{ props.estado === 'pendiente' ? 'Pendiente' : props.estado === 'confirmada' ? 'Confirmada' : props.estado === 'realizada' ? 'Realizada' : 'Cancelada' }}
        </span>
      </div>
    </div>

    <!-- Acciones -->
    <div class="flex items-center gap-2">
      <!-- Boton confirmar (solo pendientes) - estilo outline -->
      <button
        v-if="props.estado === 'pendiente'"
        @click.stop="emit('confirmar', id)"
        class="px-3 py-1.5 text-xs font-semibold border border-violet-600 text-violet-600 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-violet-50 transition-all"
        title="Confirmar cita"
      >
        Confirmar
      </button>

      <!-- Boton ver detalles -->
      <button
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Ver detalles"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>
