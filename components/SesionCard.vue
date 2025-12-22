<template>
  <div 
    :class="[
      'bg-white rounded-xl p-5 border transition-all duration-200',
      pasada ? 'border-[#E2E8F0]/50 opacity-90' : 'border-[#E2E8F0] hover:border-[#5550F2]/50 hover:shadow-md'
    ]"
  >
    <div class="space-y-4">
      <!-- Fecha y estado -->
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <h4 class="text-base font-serif font-medium text-[#2D3748] mb-1">
            {{ formatearFechaLarga(sesion.fecha) }}
          </h4>
          <div class="flex items-center space-x-3 text-sm text-[#2D3748]/70 font-sans">
            <div class="flex items-center space-x-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ formatearHora(sesion.fecha) }}</span>
            </div>
            <span class="text-[#2D3748]/30">•</span>
            <span>{{ sesion.duracion_min }} min</span>
          </div>
        </div>

        <span
          :class="[
            'inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap',
            'font-[\'Lato\']',
            estadoClassExtendido(sesion.estado)
          ]"
        >
          {{ estadoTextoExtendido(sesion.estado) }}
        </span>
      </div>

      <!-- Modalidad -->
      <div class="flex items-center space-x-2">
        <span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-sans bg-[#F2F2F2] text-[#2D3748]">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="sesion.modalidad === 'online'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span class="capitalize">{{ sesion.modalidad }}</span>
        </span>
      </div>

      <!-- Nota del terapeuta -->
      <div v-if="sesion.nota_terapeuta && sesion.estado === 'realizada'" class="bg-[#F2F2F2] rounded-lg p-4 space-y-2 border border-[#E2E8F0]/50">
        <p class="text-xs font-sans font-semibold text-[#5550F2] flex items-center space-x-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Notas de la sesión</span>
        </p>
        <p 
          :class="[
            'text-sm font-[\'Lato\'] text-[#2D3748]/80 leading-relaxed',
            !notaExpandida && 'line-clamp-2'
          ]"
        >
          {{ sesion.nota_terapeuta }}
        </p>
        <button
          v-if="sesion.nota_terapeuta.length > 120"
          @click="notaExpandida = !notaExpandida"
          class="text-xs font-sans font-medium text-[#5550F2] hover:text-[#c99d8d] transition-colors"
        >
          {{ notaExpandida ? 'Ver menos' : 'Ver más' }}
        </button>
      </div>

      <!-- Acciones -->
      <div>
        <button
          v-if="sesion.ubicacion && sesion.modalidad === 'online' && ['pendiente', 'confirmada'].includes(sesion.estado)"
          @click="$emit('abrir', sesion.ubicacion)"
          class="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#5550F2] text-white rounded-lg hover:bg-[#c99d8d] transition-all duration-200 font-sans font-medium text-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Unirme</span>
        </button>

        <div v-else-if="sesion.ubicacion && sesion.modalidad === 'presencial'" class="flex items-start space-x-2 text-xs font-sans text-[#2D3748]/60 bg-[#F2F2F2] px-3 py-2 rounded-lg">
          <svg class="w-4 h-4 text-[#5550F2] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{{ sesion.ubicacion }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  sesion: any
  pasada?: boolean
}>()

defineEmits<{
  abrir: [url: string]
}>()

const notaExpandida = ref(false)

const formatearFechaLarga = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

const formatearHora = (fecha: string) => {
  return new Date(fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const estadoClassExtendido = (estado: string) => {
  const classes: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-blue-100 text-blue-800',
    realizada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800'
  }
  return classes[estado] || classes.pendiente
}

const estadoTextoExtendido = (estado: string) => {
  const textos: Record<string, string> = {
    pendiente: 'Programada',
    confirmada: 'Lista para ti ✨',
    realizada: 'Completada 💪',
    cancelada: 'No se realizó'
  }
  return textos[estado] || 'Programada'
}
</script>
