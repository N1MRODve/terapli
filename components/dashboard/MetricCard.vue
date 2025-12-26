<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: MetricCard
 * =============================================================================
 * Tarjeta de métrica para el dashboard con diseño limpio y minimalista.
 * Fondo blanco uniforme, iconos SVG monocromáticos, sin colores de fondo.
 */

defineProps<{
  value: string | number
  label: string
  sublabel?: string
  iconType: 'users' | 'calendar' | 'check' | 'euro'
  highlight?: boolean // Para destacar el valor con color primario
  to?: string
}>()
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'div'"
    :to="to"
    class="relative p-6 bg-white rounded-lg border border-gray-200 transition-all duration-200"
    :class="to ? 'hover:shadow-md hover:border-gray-300 cursor-pointer group' : ''"
  >
    <!-- Icono SVG monocromático -->
    <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-4 transition-transform"
         :class="to ? 'group-hover:scale-105' : ''">
      <!-- Icono Users/Grupo -->
      <svg v-if="iconType === 'users'" class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>

      <!-- Icono Calendario -->
      <svg v-else-if="iconType === 'calendar'" class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>

      <!-- Icono Check/Asistencia -->
      <svg v-else-if="iconType === 'check'" class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

      <!-- Icono Euro/Dinero -->
      <svg v-else-if="iconType === 'euro'" class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>

    <!-- Valor -->
    <p class="text-3xl font-bold tracking-tight"
       :class="highlight ? 'text-violet-600' : 'text-gray-900'">
      {{ value }}
    </p>

    <!-- Label -->
    <p class="text-sm font-medium mt-1 text-gray-500">
      {{ label }}
    </p>

    <!-- Sublabel -->
    <p v-if="sublabel" class="text-xs mt-0.5 text-gray-400">
      {{ sublabel }}
    </p>

    <!-- Arrow indicator for links -->
    <div v-if="to" class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </component>
</template>
