<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: ReminderCard
 * =============================================================================
 * Tarjeta de recordatorio con diseno limpio y minimalista.
 * Fondo blanco con borde izquierdo de color para urgencia, iconos SVG.
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

// Labels por tipo de accion
const accionLabels = {
  confirmacion: 'Confirmar',
  pago: 'Ver pago',
  clinico: 'Ver',
  bono: 'Ver bono',
  general: 'Ver'
}
</script>

<template>
  <div
    class="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-sm cursor-pointer group"
    :class="urgente ? 'border-l-[3px] border-l-red-500' : ''"
    @click="emit('accion', { id, tipo, accion })"
  >
    <!-- Icono SVG -->
    <div class="relative flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
         :class="urgente ? 'bg-red-50' : 'bg-gray-100'">
      <!-- Icono de alerta/urgente -->
      <svg v-if="urgente" class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <!-- Icono calendario (confirmacion) -->
      <svg v-else-if="tipo === 'confirmacion'" class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <!-- Icono pago -->
      <svg v-else-if="tipo === 'pago'" class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <!-- Icono clinico -->
      <svg v-else-if="tipo === 'clinico'" class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <!-- Icono bono -->
      <svg v-else-if="tipo === 'bono'" class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
      <!-- Icono general (campana) -->
      <svg v-else class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>

    <!-- Contenido -->
    <div class="flex-1 min-w-0">
      <!-- Formato estructurado con paciente -->
      <template v-if="paciente && (fecha || hora)">
        <div class="flex items-center gap-2">
          <p class="font-medium text-gray-900 truncate">
            {{ paciente }}
          </p>
          <!-- Badge de urgencia - texto outline -->
          <span
            v-if="urgente"
            class="flex-shrink-0 text-[11px] font-semibold uppercase tracking-wider text-red-500"
          >
            URGENTE
          </span>
        </div>
        <p class="text-sm flex items-center gap-2 mt-0.5 text-gray-500">
          <span v-if="tipo === 'confirmacion'">Confirmar cita</span>
          <span v-else-if="tipo === 'pago'">Pago pendiente</span>
          <span v-else-if="tipo === 'bono'">Bono por agotar</span>
          <span v-else>{{ mensaje }}</span>
          <span v-if="fecha || hora" class="text-gray-300">|</span>
          <span v-if="fecha || hora" class="font-medium text-gray-700">
            {{ fecha }} {{ hora }}
          </span>
        </p>
      </template>

      <!-- Formato de texto simple -->
      <template v-else>
        <p class="text-sm leading-relaxed text-gray-700">
          {{ mensaje }}
        </p>
      </template>
    </div>

    <!-- Boton de accion - estilo outline para urgente -->
    <button
      v-if="accion"
      @click.stop="emit('accion', { id, tipo, accion })"
      class="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
      :class="urgente
        ? 'border border-red-500 text-red-500 hover:bg-red-50 opacity-100'
        : 'border border-gray-300 text-gray-600 hover:bg-gray-50 opacity-0 group-hover:opacity-100'"
    >
      {{ accionLabels[tipo] || 'Ver' }}
    </button>

    <!-- Chevron -->
    <svg
      class="w-4 h-4 flex-shrink-0 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </div>
</template>

<style scoped>
/* Estilos del componente ReminderCard */
</style>
