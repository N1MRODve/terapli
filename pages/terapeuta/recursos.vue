<template>
  <div class="min-h-screen bg-[#F9F7F3] py-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Banner Modo Demo -->
      <div v-if="modoDemo" class="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
        <div class="flex items-start gap-3">
          <span class="text-3xl">🎭</span>
          <div class="flex-1">
            <h3 class="font-['Lora'] text-lg font-semibold text-blue-900 mb-1">
              Modo Demostración - Recursos Precargados
            </h3>
            <p class="text-sm text-blue-700 leading-relaxed">
              Estás viendo <strong>6 recursos de ejemplo</strong> listos para compartir con tus pacientes. 
              Para usar el repositorio real, ejecuta la migración SQL en Supabase: 
              <code class="px-2 py-0.5 bg-blue-100 rounded">supabase/migrations/20251019_recursos_compartidos.sql</code>
            </p>
          </div>
        </div>
      </div>

      <div class="mb-8 flex items-start justify-between">
        <div>
          <h1 class="text-4xl font-['Lora'] text-[#5D4A44] mb-2">📚 Recursos Terapéuticos</h1>
          <p class="text-[#5D4A44]/70">Biblioteca de materiales para compartir con tus pacientes</p>
        </div>
        <button
          @click="abrirModalNuevoRecurso"
          class="px-6 py-3 bg-[#D8AFA0] text-white rounded-xl hover:bg-[#D8AFA0]/90 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <span class="text-xl">➕</span>
          <span class="font-['Lato'] font-semibold">Nuevo Recurso</span>
        </button>
      </div>

      <!-- Estadísticas -->
      <div v-if="estadisticas" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 border border-[#EAD5D3]/30">
          <div class="flex items-center gap-3">
            <span class="text-3xl">📤</span>
            <div>
              <p class="text-2xl font-['Lora'] font-bold text-[#5D4A44]">{{ estadisticas.total }}</p>
              <p class="text-sm text-[#5D4A44]/70">Recursos compartidos</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-[#EAD5D3]/30">
          <div class="flex items-center gap-3">
            <span class="text-3xl">👁️</span>
            <div>
              <p class="text-2xl font-['Lora'] font-bold text-[#5D4A44]">{{ estadisticas.vistos }}</p>
              <p class="text-sm text-[#5D4A44]/70">Vistos por pacientes</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-[#EAD5D3]/30">
          <div class="flex items-center gap-3">
            <span class="text-3xl">⏳</span>
            <div>
              <p class="text-2xl font-['Lora'] font-bold text-[#5D4A44]">{{ estadisticas.pendientes }}</p>
              <p class="text-sm text-[#5D4A44]/70">Pendientes de ver</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Buscador -->
      <div class="bg-white rounded-xl p-6 mb-6 border border-[#EAD5D3]/30">
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar recursos por título, descripción o categoría..."
          class="w-full px-4 py-3 bg-[#F9F7F3] border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]"
        />
      </div>

      <!-- Loading -->
      <div v-if="cargando" class="text-center py-12">
        <div class="animate-spin w-12 h-12 border-4 border-[#D8AFA0] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-[#5D4A44]/60">Cargando recursos...</p>
      </div>

      <!-- Lista de recursos -->
      <div v-else-if="recursosFiltrados.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="recurso in recursosFiltrados" 
          :key="recurso.id" 
          class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/30 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between mb-3">
            <span class="text-2xl">{{ recurso.icono }}</span>
            <span class="text-xs px-3 py-1 rounded-full bg-[#EAD5D3]/50">{{ recurso.tipo }}</span>
          </div>
          <h3 class="font-['Lora'] text-lg text-[#5D4A44] mb-2">{{ recurso.titulo }}</h3>
          <p class="text-sm text-[#5D4A44]/70 mb-4 line-clamp-2">{{ recurso.descripcion }}</p>
          
          <div v-if="recurso.categoria" class="mb-4">
            <span class="text-xs px-2 py-1 bg-[#D8AFA0]/20 text-[#5D4A44] rounded">
              {{ recurso.categoria }}
            </span>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex gap-2">
              <a 
                :href="recurso.url" 
                target="_blank" 
                class="flex-1 text-center px-3 py-2 text-sm bg-[#F9F7F3] text-[#5D4A44] rounded-lg hover:bg-[#EAD5D3]/30 transition-colors"
              >
                👁️ Ver
              </a>
              <button
                @click="abrirModalCompartir(recurso)"
                class="flex-1 px-3 py-2 text-sm bg-[#D8AFA0] text-white rounded-lg hover:bg-[#D8AFA0]/90 transition-colors"
              >
                📤 Compartir
              </button>
            </div>
            <div class="flex gap-2">
              <button
                @click="abrirModalEditarRecurso(recurso)"
                class="flex-1 px-3 py-2 text-sm bg-white border border-[#EAD5D3] text-[#5D4A44] rounded-lg hover:bg-[#F9F7F3] transition-colors"
              >
                ✏️ Editar
              </button>
              <button
                v-if="!recurso.id?.startsWith('demo')"
                @click="confirmarEliminar(recurso)"
                class="flex-1 px-3 py-2 text-sm bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <span class="text-6xl block mb-4 opacity-40">📚</span>
        <h3 class="text-xl font-['Lora'] font-semibold text-[#5D4A44] mb-2">
          {{ busqueda ? 'No se encontraron recursos' : 'No hay recursos disponibles' }}
        </h3>
        <p class="text-[#5D4A44]/60">
          {{ busqueda ? 'Intenta con otros términos de búsqueda' : 'Los recursos se cargarán automáticamente' }}
        </p>
      </div>
    </div>

    <!-- Modal Compartir Recurso -->
    <ModalCompartirRecurso
      v-model="mostrarModalCompartir"
      :recurso="recursoSeleccionado"
      @compartido="handleCompartido"
    />

    <!-- Modal Crear/Editar Recurso -->
    <ModalRecurso
      v-model="mostrarModalRecurso"
      :recurso="recursoAEditar"
      @guardado="handleRecursoGuardado"
    />

    <!-- Toast de éxito -->
    <transition name="slide-up">
      <div 
        v-if="mostrarToast"
        class="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50"
      >
        <span class="text-2xl">✅</span>
        <div>
          <p class="font-semibold">{{ toastTitulo }}</p>
          <p class="text-sm opacity-90">{{ toastMensaje }}</p>
        </div>
      </div>
    </transition>

    <!-- Modal de confirmación eliminar -->
    <transition name="modal">
      <div 
        v-if="mostrarConfirmacionEliminar"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="mostrarConfirmacionEliminar = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div class="text-center mb-6">
            <span class="text-6xl block mb-4">⚠️</span>
            <h3 class="text-xl font-['Lora'] font-semibold text-[#5D4A44] mb-2">
              ¿Eliminar recurso?
            </h3>
            <p class="text-sm text-[#5D4A44]/70">
              Esta acción no se puede deshacer. El recurso se ocultará del repositorio.
            </p>
          </div>
          <div class="flex gap-3">
            <button
              @click="mostrarConfirmacionEliminar = false"
              class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-['Lato'] font-medium"
            >
              Cancelar
            </button>
            <button
              @click="eliminarRecurso"
              class="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-['Lato'] font-semibold"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
  layout: 'terapeuta'
})

const { getRecursosRepositorio, getEstadisticasRecursos, actualizarRecurso, eliminarRecurso: eliminarRecursoApi } = useTerapeuta()

const busqueda = ref('')
const recursos = ref([])
const cargando = ref(true)
const estadisticas = ref(null)
const modoDemo = ref(false)

// Modal compartir
const mostrarModalCompartir = ref(false)
const recursoSeleccionado = ref(null)

// Modal recurso (crear/editar)
const mostrarModalRecurso = ref(false)
const recursoAEditar = ref(null)

// Confirmación eliminar
const mostrarConfirmacionEliminar = ref(false)
const recursoAEliminar = ref(null)

// Toast
const mostrarToast = ref(false)
const toastTitulo = ref('')
const toastMensaje = ref('')

// Recursos filtrados
const recursosFiltrados = computed(() => {
  if (!busqueda.value) return recursos.value
  const termino = busqueda.value.toLowerCase()
  return recursos.value.filter(r => 
    r.titulo?.toLowerCase().includes(termino) ||
    r.descripcion?.toLowerCase().includes(termino) ||
    r.categoria?.toLowerCase().includes(termino) ||
    r.tipo?.toLowerCase().includes(termino)
  )
})

// Datos demo
const recursosDemoDisponibles = [
  {
    id: 'demo-1',
    titulo: 'Guía de Respiración Consciente',
    descripcion: 'Ejercicios de respiración para manejo de ansiedad y momentos de estrés',
    tipo: 'Guía',
    icono: '📋',
    url: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',
    categoria: 'Ansiedad',
    tags: ['respiración', 'ansiedad', 'mindfulness']
  },
  {
    id: 'demo-2',
    titulo: 'Meditación Guiada 10min',
    descripcion: 'Audio de meditación para principiantes y práctica diaria',
    tipo: 'Audio',
    icono: '🎵',
    url: 'https://www.youtube.com/watch?v=O-6f5wQXSu8',
    categoria: 'Mindfulness',
    tags: ['meditación', 'mindfulness', 'relajación']
  },
  {
    id: 'demo-3',
    titulo: 'Relajación Muscular Progresiva',
    descripcion: 'Video tutorial de técnicas de relajación paso a paso',
    tipo: 'Video',
    icono: '🎥',
    url: 'https://www.youtube.com/watch?v=ihO02wUzgkc',
    categoria: 'Relajación',
    tags: ['relajación', 'técnicas', 'estrés']
  },
  {
    id: 'demo-4',
    titulo: 'Diario de Gratitud',
    descripcion: 'Plantilla y guía para llevar un diario de gratitud efectivo',
    tipo: 'Ejercicio',
    icono: '🧘',
    url: 'https://positivepsychology.com/gratitude-journal/',
    categoria: 'Autoestima',
    tags: ['gratitud', 'autoestima', 'bienestar']
  },
  {
    id: 'demo-5',
    titulo: 'Mindfulness y Autocuidado',
    descripcion: 'Artículo completo sobre mindfulness en la vida diaria',
    tipo: 'Lectura',
    icono: '📖',
    url: 'https://www.mindful.org/meditation/mindfulness-getting-started/',
    categoria: 'Mindfulness',
    tags: ['mindfulness', 'autocuidado', 'vida diaria']
  },
  {
    id: 'demo-6',
    titulo: 'Registro de Pensamientos TCC',
    descripcion: 'Formato para registro de pensamientos automáticos según TCC',
    tipo: 'PDF',
    icono: '📄',
    url: 'https://beckinstitute.org/cognitive-model/',
    categoria: 'TCC',
    tags: ['tcc', 'pensamientos', 'terapia cognitiva']
  }
]

// Cargar recursos
const cargarRecursos = async () => {
  cargando.value = true
  try {
    const recursosSupabase = await getRecursosRepositorio()
    
    // Si hay recursos en Supabase, usarlos
    if (recursosSupabase && recursosSupabase.length > 0) {
      recursos.value = recursosSupabase
      modoDemo.value = false
    } else {
      // Si no hay recursos, usar demo
      console.log('📚 Usando recursos de demostración')
      recursos.value = recursosDemoDisponibles
      modoDemo.value = true
    }
  } catch (error) {
    console.error('Error cargando recursos, usando demo:', error)
    recursos.value = recursosDemoDisponibles
    modoDemo.value = true
  } finally {
    cargando.value = false
  }
}

// Cargar estadísticas
const cargarEstadisticas = async () => {
  try {
    const stats = await getEstadisticasRecursos()
    
    // Si hay estadísticas, usarlas
    if (stats) {
      estadisticas.value = stats
    } else {
      // Estadísticas demo
      estadisticas.value = {
        total: 2,
        vistos: 1,
        pendientes: 1,
        porcentajeVisto: 50
      }
    }
  } catch (error) {
    console.error('Error cargando estadísticas:', error)
    // Estadísticas demo por defecto
    estadisticas.value = {
      total: 0,
      vistos: 0,
      pendientes: 0,
      porcentajeVisto: 0
    }
  }
}

// Abrir modal para compartir
const abrirModalCompartir = (recurso) => {
  recursoSeleccionado.value = recurso
  mostrarModalCompartir.value = true
}

// Abrir modal para crear nuevo recurso
const abrirModalNuevoRecurso = () => {
  recursoAEditar.value = null
  mostrarModalRecurso.value = true
}

// Abrir modal para editar recurso
const abrirModalEditarRecurso = (recurso) => {
  if (recurso.id?.startsWith('demo')) {
    mostrarToastInfo('Recursos de demostración', 'Los recursos demo no se pueden editar. Crea uno nuevo o ejecuta la migración SQL.')
    return
  }
  recursoAEditar.value = recurso
  mostrarModalRecurso.value = true
}

// Confirmar eliminación
const confirmarEliminar = (recurso) => {
  if (recurso.id?.startsWith('demo')) {
    mostrarToastInfo('Recursos de demostración', 'Los recursos demo no se pueden eliminar.')
    return
  }
  recursoAEliminar.value = recurso
  mostrarConfirmacionEliminar.value = true
}

// Eliminar recurso
const eliminarRecurso = async () => {
  if (!recursoAEliminar.value) return
  
  try {
    const resultado = await eliminarRecursoApi(recursoAEliminar.value.id)
    
    if (resultado.success) {
      // Remover del array local
      recursos.value = recursos.value.filter(r => r.id !== recursoAEliminar.value.id)
      
      mostrarToastExito('¡Recurso eliminado!', 'El recurso ha sido eliminado del repositorio')
      cargarEstadisticas()
    } else {
      mostrarToastError('Error', resultado.error || 'No se pudo eliminar el recurso')
    }
  } catch (error) {
    console.error('Error eliminando recurso:', error)
    mostrarToastError('Error', 'Ocurrió un error al eliminar el recurso')
  } finally {
    mostrarConfirmacionEliminar.value = false
    recursoAEliminar.value = null
  }
}

// Handle compartido exitoso
const handleCompartido = (data) => {
  mostrarToastExito('¡Recurso compartido!', `Compartido con ${data.cantidad} paciente${data.cantidad > 1 ? 's' : ''}`)
  cargarEstadisticas()
}

// Handle recurso guardado (creado o editado)
const handleRecursoGuardado = (recurso) => {
  if (recursoAEditar.value) {
    // Actualizar recurso existente en el array
    const index = recursos.value.findIndex(r => r.id === recurso.id)
    if (index !== -1) {
      recursos.value[index] = recurso
    }
    mostrarToastExito('¡Recurso actualizado!', 'Los cambios se han guardado correctamente')
  } else {
    // Añadir nuevo recurso al principio
    recursos.value.unshift(recurso)
    mostrarToastExito('¡Recurso creado!', 'El nuevo recurso está listo para compartir')
  }
  
  cargarEstadisticas()
}

// Helpers para toast
const mostrarToastExito = (titulo, mensaje) => {
  toastTitulo.value = titulo
  toastMensaje.value = mensaje
  mostrarToast.value = true
  setTimeout(() => { mostrarToast.value = false }, 3000)
}

const mostrarToastError = (titulo, mensaje) => {
  toastTitulo.value = titulo
  toastMensaje.value = mensaje
  mostrarToast.value = true
  setTimeout(() => { mostrarToast.value = false }, 3000)
}

const mostrarToastInfo = (titulo, mensaje) => {
  toastTitulo.value = titulo
  toastMensaje.value = mensaje
  mostrarToast.value = true
  setTimeout(() => { mostrarToast.value = false }, 3000)
}

// Cargar al montar
onMounted(() => {
  cargarRecursos()
  cargarEstadisticas()
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100px);
  opacity: 0;
}
</style>
