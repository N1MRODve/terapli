<script setup lang="ts">
// =============================================================================
// COMPONENTE: Estadísticas de Bonos - Panel de Métricas
// =============================================================================
// Muestra métricas importantes sobre los bonos de los pacientes

import { computed } from 'vue'

interface Cita {
  bono?: {
    id: string
    sesiones_restantes: number
    sesiones_totales: number
    estado: string
  }
}

const props = defineProps<{
  citas: Cita[]
}>()

// Calcular estadísticas de bonos
const estadisticas = computed(() => {
  const citasConBono = props.citas.filter(c => c.bono)
  
  // Contar bonos únicos por ID
  const bonosUnicos = new Map()
  citasConBono.forEach(c => {
    if (c.bono) {
      bonosUnicos.set(c.bono.id, c.bono)
    }
  })

  const bonos = Array.from(bonosUnicos.values())

  const totalBonos = bonos.length
  const bonosActivos = bonos.filter(b => b.estado === 'activo').length
  const bonosConPocasSesiones = bonos.filter(
    b => b.sesiones_restantes <= 2 && b.sesiones_restantes > 0
  ).length
  const bonosAgotados = bonos.filter(
    b => b.sesiones_restantes === 0 || b.estado === 'completado'
  ).length

  // Calcular sesiones totales y restantes
  const totalSesionesDisponibles = bonos.reduce((sum, b) => sum + b.sesiones_restantes, 0)
  const totalSesionesProgramadas = bonos.reduce((sum, b) => sum + b.sesiones_totales, 0)
  const porcentajeUsado = totalSesionesProgramadas > 0 
    ? Math.round(((totalSesionesProgramadas - totalSesionesDisponibles) / totalSesionesProgramadas) * 100)
    : 0

  return {
    totalBonos,
    bonosActivos,
    bonosConPocasSesiones,
    bonosAgotados,
    totalSesionesDisponibles,
    totalSesionesProgramadas,
    porcentajeUsado
  }
})

const hayAlertas = computed(() => {
  return estadisticas.value.bonosConPocasSesiones > 0 || estadisticas.value.bonosAgotados > 0
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Total de Bonos Activos -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Bonos Activos</p>
          <p class="text-3xl font-bold text-blue-600 mt-1">
            {{ estadisticas.bonosActivos }}
          </p>
          <p class="text-xs text-gray-500 mt-1">de {{ estadisticas.totalBonos }} totales</p>
        </div>
        <div class="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
          <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Sesiones Disponibles -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Sesiones Disponibles</p>
          <p class="text-3xl font-bold text-green-600 mt-1">
            {{ estadisticas.totalSesionesDisponibles }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            de {{ estadisticas.totalSesionesProgramadas }} programadas
          </p>
        </div>
        <div class="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Bonos con Pocas Sesiones (Alerta) -->
    <div 
      :class="[
        'rounded-lg shadow-sm border p-5',
        estadisticas.bonosConPocasSesiones > 0 
          ? 'bg-yellow-50 border-yellow-300' 
          : 'bg-white border-gray-200'
      ]"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Bonos por Renovar</p>
          <p 
            :class="[
              'text-3xl font-bold mt-1',
              estadisticas.bonosConPocasSesiones > 0 ? 'text-yellow-600' : 'text-gray-400'
            ]"
          >
            {{ estadisticas.bonosConPocasSesiones }}
          </p>
          <p class="text-xs text-gray-500 mt-1">≤2 sesiones restantes</p>
        </div>
        <div 
          :class="[
            'h-12 w-12 rounded-full flex items-center justify-center',
            estadisticas.bonosConPocasSesiones > 0 ? 'bg-yellow-200' : 'bg-gray-100'
          ]"
        >
          <svg 
            :class="[
              'h-6 w-6',
              estadisticas.bonosConPocasSesiones > 0 ? 'text-yellow-600' : 'text-gray-400'
            ]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Bonos Completados -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Bonos Completados</p>
          <p class="text-3xl font-bold text-gray-600 mt-1">
            {{ estadisticas.bonosAgotados }}
          </p>
          <p class="text-xs text-gray-500 mt-1">0 sesiones restantes</p>
        </div>
        <div class="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Barra de progreso general -->
    <div v-if="estadisticas.totalSesionesProgramadas > 0" class="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm font-medium text-gray-700">Uso General de Bonos</p>
        <p class="text-sm font-bold text-gray-900">{{ estadisticas.porcentajeUsado }}% usado</p>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          :class="[
            'h-full rounded-full transition-all duration-500',
            estadisticas.porcentajeUsado >= 80 ? 'bg-red-500' :
            estadisticas.porcentajeUsado >= 60 ? 'bg-yellow-500' :
            'bg-green-500'
          ]"
          :style="{ width: `${estadisticas.porcentajeUsado}%` }"
        ></div>
      </div>
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>{{ estadisticas.totalSesionesProgramadas - estadisticas.totalSesionesDisponibles }} usadas</span>
        <span>{{ estadisticas.totalSesionesDisponibles }} disponibles</span>
      </div>
    </div>
  </div>

  <!-- Mensaje de alerta si hay bonos por renovar -->
  <div 
    v-if="hayAlertas" 
    class="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-r-lg"
  >
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-sm font-medium text-yellow-800">
          Acción Requerida
        </h3>
        <div class="mt-2 text-sm text-yellow-700">
          <p>
            <strong v-if="estadisticas.bonosConPocasSesiones > 0">
              {{ estadisticas.bonosConPocasSesiones }} bono{{ estadisticas.bonosConPocasSesiones > 1 ? 's' : '' }}
            </strong>
            <span v-if="estadisticas.bonosConPocasSesiones > 0">
              {{ estadisticas.bonosConPocasSesiones > 1 ? ' necesitan' : ' necesita' }} renovación pronto.
            </span>
            <strong v-if="estadisticas.bonosAgotados > 0" class="ml-2">
              {{ estadisticas.bonosAgotados }} bono{{ estadisticas.bonosAgotados > 1 ? 's' : '' }} completado{{ estadisticas.bonosAgotados > 1 ? 's' : '' }}.
            </strong>
          </p>
          <p class="mt-1 text-xs">
            💡 Contacta a los pacientes para ofrecer renovación de bonos
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animación suave para las barras de progreso */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 500ms;
}
</style>
