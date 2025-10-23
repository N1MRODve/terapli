<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
    <!-- Header con tipo y acciones -->
    <div class="p-4 flex items-start justify-between gap-3">
      <div class="flex items-start gap-3 flex-1 min-w-0">
        <!-- Icono del tipo -->
        <div 
          class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          :class="obtenerColorTipo(recurso.tipo)"
        >
          {{ obtenerIconoTipo(recurso.tipo) }}
        </div>

        <!-- Título y descripción -->
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 text-lg leading-tight mb-1 line-clamp-2">
            {{ recurso.titulo }}
          </h3>
          
          <p v-if="recurso.descripcion" class="text-sm text-gray-600 line-clamp-2 mb-2">
            {{ recurso.descripcion }}
          </p>

          <!-- Metadatos -->
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <!-- Tipo -->
            <span class="inline-flex items-center gap-1 font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              {{ formatearTipo(recurso.tipo) }}
            </span>

            <!-- Duración (si aplica) -->
            <span v-if="recurso.duracion_minutos" class="inline-flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              {{ formatearDuracion(recurso.duracion_minutos) }}
            </span>

            <!-- Tamaño (si es archivo) -->
            <span v-if="recurso.archivo_tamano" class="inline-flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              {{ formatearTamano(recurso.archivo_tamano) }}
            </span>

            <!-- Estadísticas -->
            <span v-if="mostrarEstadisticas" class="inline-flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              📤 {{ recurso.veces_enviado }} | 👁️ {{ recurso.veces_visto }}
            </span>
          </div>
        </div>
      </div>

      <!-- Menú de acciones (solo si es del terapeuta actual) -->
      <div v-if="esDelTerapeutaActual" class="flex-shrink-0">
        <button
          @click="toggleMenu"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Más opciones"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        <!-- Dropdown menú -->
        <div v-if="menuAbierto" class="absolute right-4 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
          <button
            @click="$emit('editar', recurso)"
            class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <span>✏️</span>
            <span>Editar</span>
          </button>
          <button
            @click="confirmarEliminar"
            class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <span>🗑️</span>
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Etiquetas -->
    <div v-if="recurso.etiquetas && recurso.etiquetas.length > 0" class="px-4 pb-3">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="etiqueta in recurso.etiquetas.slice(0, 5)"
          :key="etiqueta"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-terracota/10 text-terracota"
        >
          #{{ etiqueta }}
        </span>
        <span
          v-if="recurso.etiquetas.length > 5"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
        >
          +{{ recurso.etiquetas.length - 5 }}
        </span>
      </div>
    </div>

    <!-- Footer con autor y acciones -->
    <div class="px-4 py-3 bg-fondo border-t border-gray-100 flex items-center justify-between gap-3">
      <!-- Autor y fecha -->
      <div class="text-xs text-gray-500">
        <p v-if="recurso.creador_nombre" class="font-medium text-gray-700">
          {{ recurso.creador_nombre }}
        </p>
        <p>{{ formatearFecha(recurso.creado_en) }}</p>
      </div>

      <!-- Botones de acción -->
      <div class="flex items-center gap-2">
        <!-- Botón Enviar (para terapeutas) -->
        <button
          v-if="mostrarBotonEnviar"
          @click="$emit('enviar', recurso)"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-terracota text-white text-sm font-medium rounded-lg hover:bg-terracota/90 transition-colors"
        >
          <span>📤</span>
          <span>Enviar</span>
        </button>

        <!-- Botón Ver/Abrir -->
        <button
          @click="abrirRecurso"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span>👁️</span>
          <span>Ver</span>
        </button>
      </div>
    </div>

    <!-- Badge "Privado" si aplica -->
    <div v-if="!recurso.es_publico" class="absolute top-4 right-4">
      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <span>🔒</span>
        <span>Privado</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recurso } from '~/composables/useRecursos'

// ============================================
// PROPS & EMITS
// ============================================

const props = defineProps<{
  recurso: Recurso
  mostrarBotonEnviar?: boolean
  mostrarEstadisticas?: boolean
  terapeutaId?: string | null
}>()

const emit = defineEmits<{
  enviar: [recurso: Recurso]
  editar: [recurso: Recurso]
  eliminar: [recurso: Recurso]
}>()

// ============================================
// COMPOSABLES
// ============================================

const { obtenerIconoTipo, obtenerColorTipo, formatearTamano, formatearDuracion } = useRecursos()
const user = useSupabaseUser()

// ============================================
// ESTADO
// ============================================

const menuAbierto = ref(false)

// ============================================
// COMPUTED
// ============================================

const esDelTerapeutaActual = computed(() => {
  if (!user.value) return false
  return props.recurso.creado_por_terapeuta_id === user.value.id
})

// ============================================
// MÉTODOS
// ============================================

const toggleMenu = () => {
  menuAbierto.value = !menuAbierto.value
}

const confirmarEliminar = () => {
  if (confirm(`¿Estás seguro/a de que deseas eliminar "${props.recurso.titulo}"?\n\nEsta acción no se puede deshacer.`)) {
    emit('eliminar', props.recurso)
  }
  menuAbierto.value = false
}

const abrirRecurso = () => {
  const url = props.recurso.archivo_url || props.recurso.url
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

const formatearTipo = (tipo: string): string => {
  const tipos: Record<string, string> = {
    pdf: 'PDF',
    video: 'Video',
    articulo: 'Artículo',
    audio: 'Audio',
    ejercicio: 'Ejercicio',
    imagen: 'Imagen',
    otro: 'Otro'
  }
  return tipos[tipo] || tipo
}

const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha)
  const ahora = new Date()
  const diferencia = ahora.getTime() - date.getTime()
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `Hace ${dias} días`
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`
  if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`
  
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// ============================================
// LIFECYCLE
// ============================================

onMounted(() => {
  // Cerrar menú al hacer click fuera
  document.addEventListener('click', (e) => {
    if (menuAbierto.value) {
      const target = e.target as HTMLElement
      if (!target.closest('.relative')) {
        menuAbierto.value = false
      }
    }
  })
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
