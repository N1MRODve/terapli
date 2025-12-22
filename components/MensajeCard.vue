<template>
  <div 
    :class="[
      'p-4 rounded-lg max-w-[80%] transition-all duration-200',
      remitente 
        ? 'bg-[#E2E8F0]/50 self-end text-right ml-auto' 
        : 'bg-white border border-[#E2E8F0]/40 self-start shadow-sm'
    ]"
  >
    <!-- Contenido del mensaje -->
    <p class="text-[#2D3748] font-sans text-sm leading-relaxed whitespace-pre-wrap break-words">
      {{ texto }}
    </p>
    
    <!-- Metainformación -->
    <div class="flex items-center gap-2 mt-2" :class="remitente ? 'justify-end' : 'justify-start'">
      <p class="text-[10px] text-[#2D3748]/50 font-sans">
        {{ formatearFecha(fecha) }}
      </p>
      
      <!-- Indicador de no visto (solo para remitente) -->
      <span 
        v-if="remitente && !visto" 
        class="inline-block w-2 h-2 bg-[#5550F2] rounded-full"
        title="Enviado"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  texto: string
  fecha: string | Date
  remitente: boolean
  visto?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visto: false
})

/**
 * Formatea la fecha de manera amigable
 */
const formatearFecha = (fecha: string | Date): string => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  const ahora = new Date()
  const diferencia = ahora.getTime() - date.getTime()
  const minutos = Math.floor(diferencia / 60000)
  const horas = Math.floor(diferencia / 3600000)
  const dias = Math.floor(diferencia / 86400000)

  // Hace menos de 1 minuto
  if (minutos < 1) return 'Ahora'
  
  // Hace menos de 1 hora
  if (minutos < 60) return `Hace ${minutos}m`
  
  // Hace menos de 24 horas
  if (horas < 24) return `Hace ${horas}h`
  
  // Hace menos de 7 días
  if (dias < 7) return `Hace ${dias}d`
  
  // Más de 7 días: mostrar fecha completa
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: date.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined
  })
}
</script>

<style scoped>
/* Animación de entrada suave */
@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

div {
  animation: fadeInSlide 0.3s ease-out;
}
</style>
