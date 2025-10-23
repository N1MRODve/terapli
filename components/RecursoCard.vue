<template>
  <div class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/30 p-6 hover:shadow-md transition-all duration-300 group">
    <!-- Header con título y tipo -->
    <div class="flex items-start justify-between gap-4 mb-4">
      <div class="flex-1 min-w-0">
        <h3 class="font-['Lora'] text-lg text-[#5D4A44] mb-1 truncate group-hover:text-[#D8AFA0] transition-colors">
          {{ recurso.titulo }}
        </h3>
        <p class="text-sm text-[#5D4A44]/70 line-clamp-2">
          {{ recurso.descripcion || 'Sin descripción' }}
        </p>
      </div>
      <span 
        class="text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0"
        :class="obtenerEstiloTipo(recurso.tipo)"
      >
        {{ recurso.tipo }}
      </span>
    </div>

    <!-- Información adicional -->
    <div v-if="mostrarInfo && recurso.creado_por_info" class="flex items-center gap-2 mb-4 text-xs text-[#5D4A44]/60">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span>
        {{ recurso.creado_por_info.nombre }} {{ recurso.creado_por_info.apellido }}
      </span>
      <span class="mx-1">•</span>
      <span>{{ formatearFecha(recurso.created_at) }}</span>
    </div>

    <!-- Mensaje del terapeuta (si existe) -->
    <div v-if="mensaje" class="mb-4 p-3 bg-[#F9F7F3] rounded-lg border border-[#EAD5D3]/30">
      <p class="text-sm text-[#5D4A44]/80 italic">
        "{{ mensaje }}"
      </p>
    </div>

    <!-- Badge de no visto (para pacientes) -->
    <div v-if="mostrarBadgeNoVisto && !visto" class="mb-4">
      <span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#D8AFA0]/20 text-[#D8AFA0] border border-[#D8AFA0]/30">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        Nuevo
      </span>
    </div>

    <!-- Acciones -->
    <div class="flex items-center justify-between gap-3 pt-4 border-t border-[#EAD5D3]/20">
      <!-- Ver recurso -->
      <a 
        :href="recurso.url" 
        target="_blank" 
        rel="noopener noreferrer"
        class="flex items-center gap-2 text-[#D8AFA0] font-['Lato'] text-sm hover:text-[#5D4A44] transition-colors"
        @click="handleVerRecurso"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>{{ obtenerTextoBotonVer(recurso.tipo) }}</span>
      </a>

      <!-- Botones de acción según rol -->
      <div class="flex items-center gap-2">
        <!-- Botón compartir (terapeuta) -->
        <button 
          v-if="mostrarBotonCompartir"
          @click="$emit('compartir', recurso)"
          class="flex items-center gap-1.5 text-sm text-[#5D4A44] bg-[#F9F7F3] border border-[#EAD5D3]/50 px-3 py-1.5 rounded-lg hover:bg-[#EAD5D3]/20 hover:border-[#EAD5D3] transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Compartir</span>
        </button>

        <!-- Botón editar (solo creador) -->
        <button 
          v-if="mostrarBotonEditar"
          @click="$emit('editar', recurso)"
          class="flex items-center gap-1.5 text-sm text-[#5D4A44] bg-[#F9F7F3] border border-[#EAD5D3]/50 px-3 py-1.5 rounded-lg hover:bg-[#EAD5D3]/20 hover:border-[#EAD5D3] transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Editar</span>
        </button>

        <!-- Botón eliminar (solo creador) -->
        <button 
          v-if="mostrarBotonEliminar"
          @click="$emit('eliminar', recurso)"
          class="flex items-center gap-1.5 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  recurso: {
    type: Object,
    required: true
  },
  mostrarBotonCompartir: {
    type: Boolean,
    default: true
  },
  mostrarBotonEditar: {
    type: Boolean,
    default: false
  },
  mostrarBotonEliminar: {
    type: Boolean,
    default: false
  },
  mostrarInfo: {
    type: Boolean,
    default: true
  },
  mostrarBadgeNoVisto: {
    type: Boolean,
    default: false
  },
  visto: {
    type: Boolean,
    default: true
  },
  mensaje: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['compartir', 'editar', 'eliminar', 'ver'])

const obtenerEstiloTipo = (tipo) => {
  const estilos = {
    'PDF': 'bg-red-50 text-red-600 border border-red-200',
    'Audio': 'bg-purple-50 text-purple-600 border border-purple-200',
    'Video': 'bg-blue-50 text-blue-600 border border-blue-200',
    'Ejercicio': 'bg-green-50 text-green-600 border border-green-200',
    'Lectura': 'bg-amber-50 text-amber-600 border border-amber-200',
    'Guía': 'bg-[#EAD5D3]/50 text-[#5D4A44] border border-[#EAD5D3]',
    'Enlace': 'bg-cyan-50 text-cyan-600 border border-cyan-200',
    'Otro': 'bg-gray-50 text-gray-600 border border-gray-200'
  }
  return estilos[tipo] || estilos['Otro']
}

const obtenerTextoBotonVer = (tipo) => {
  const textos = {
    'PDF': 'Ver PDF',
    'Audio': 'Escuchar',
    'Video': 'Ver video',
    'Ejercicio': 'Ver ejercicio',
    'Lectura': 'Leer',
    'Guía': 'Ver guía',
    'Enlace': 'Abrir enlace',
    'Otro': 'Ver recurso'
  }
  return textos[tipo] || 'Ver recurso'
}

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  const date = new Date(fecha)
  const opciones = { year: 'numeric', month: 'short', day: 'numeric' }
  return date.toLocaleDateString('es-ES', opciones)
}

const handleVerRecurso = () => {
  emit('ver', recurso)
}
</script>
