<template>
  <div class="max-w-4xl mx-auto space-y-6 px-4 py-8">
    <!-- Loader -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[40vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5550F2]"></div>
      <p class="mt-4 text-[#2D3748] opacity-70 font-sans">Cargando recursos...</p>
    </div>

    <!-- Contenido -->
    <div v-else>
      <!-- Banner Modo Demo -->
      <div v-if="recursos.length > 0 && recursos[0]?.id?.startsWith('demo')" class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
        <div class="flex items-start gap-3">
          <span class="text-3xl">🎭</span>
          <div class="flex-1">
            <h3 class="font-serif text-lg font-semibold text-purple-900 mb-1">
              Vista de Demostración
            </h3>
            <p class="text-sm text-purple-700 leading-relaxed">
              Estás viendo <strong>recursos de ejemplo</strong> para probar la funcionalidad. 
              Cuando tu terapeuta comparta recursos reales contigo, aparecerán aquí con sus notas personales.
            </p>
          </div>
        </div>
      </div>

      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-serif font-medium text-[#2D3748]">
          Mis Recursos
        </h1>
        <p class="text-sm text-[#2D3748] opacity-70 font-sans mt-1">
          Material compartido por tu psicóloga para apoyar tu proceso
        </p>
      </header>

      <!-- Lista de recursos -->
      <div v-if="recursos.length > 0" class="space-y-4">
        <article 
          v-for="recurso in recursos" 
          :key="recurso.id" 
          class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]/30 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start gap-4">
            <!-- Icono del tipo de recurso -->
            <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-[#5550F2]/10 flex items-center justify-center">
              <!-- PDF -->
              <svg v-if="recurso.tipo === 'pdf'" class="w-6 h-6 text-[#5550F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <!-- Audio -->
              <svg v-else-if="recurso.tipo === 'audio'" class="w-6 h-6 text-[#5550F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <!-- Video -->
              <svg v-else-if="recurso.tipo === 'video'" class="w-6 h-6 text-[#5550F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <!-- Link -->
              <svg v-else class="w-6 h-6 text-[#5550F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>

            <!-- Contenido -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4 mb-2">
                <h3 class="text-lg font-serif font-medium text-[#2D3748]">
                  {{ recurso.titulo }}
                </h3>
                <span class="flex-shrink-0 px-2 py-1 rounded-full text-xs font-sans font-medium" :class="getTipoClass(recurso.tipo)">
                  {{ getTipoTexto(recurso.tipo) }}
                </span>
              </div>

              <p v-if="recurso.descripcion" class="text-sm text-[#2D3748] opacity-70 font-sans mb-3">
                {{ recurso.descripcion }}
              </p>

              <!-- Nota personal del terapeuta -->
              <div v-if="recurso.nota_personal" class="bg-[#5550F2]/10 border-l-4 border-[#5550F2] p-3 mb-3 rounded-r">
                <p class="text-xs font-semibold text-[#2D3748] mb-1">💬 Nota de tu terapeuta:</p>
                <p class="text-sm text-[#2D3748] italic">{{ recurso.nota_personal }}</p>
              </div>

              <!-- Categoría y tags -->
              <div v-if="recurso.categoria || recurso.tags?.length" class="mb-3 flex flex-wrap gap-2">
                <span v-if="recurso.categoria" class="px-2 py-1 bg-[#E2E8F0]/30 text-[#2D3748] rounded text-xs">
                  {{ recurso.categoria }}
                </span>
                <span 
                  v-for="tag in recurso.tags?.slice(0, 3)" 
                  :key="tag"
                  class="px-2 py-1 bg-[#F2F2F2] text-[#2D3748]/70 rounded text-xs"
                >
                  #{{ tag }}
                </span>
              </div>

              <!-- Info adicional -->
              <div class="flex items-center gap-4 text-xs text-[#2D3748] opacity-60 font-sans mb-4">
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Compartido {{ formatearFecha(recurso.compartido_at || recurso.created_at || '') }}
                </span>
                <span v-if="!recurso.visto" class="px-2 py-0.5 bg-[#5550F2] text-white rounded-full text-xs font-medium">
                  Nuevo
                </span>
              </div>

              <!-- Acciones -->
              <div class="flex gap-2">
                <!-- Botón para ver recurso (link externo) -->
                <a 
                  :href="recurso.url || recurso.storage_path" 
                  target="_blank"
                  rel="noopener noreferrer"
                  @click="marcarComoVisto(recurso.id)"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-[#5550F2] hover:bg-[#C89B8A] text-white rounded-lg text-sm font-sans font-medium transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ver recurso
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center text-center py-16">
        <div class="w-20 h-20 rounded-full bg-[#E2E8F0]/30 flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-[#5550F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-xl font-serif font-medium text-[#2D3748] mb-2">No hay recursos disponibles</h3>
        <p class="text-sm text-[#2D3748] opacity-70 font-sans max-w-md">
          Tu psicóloga compartirá material de apoyo contigo durante el proceso terapéutico.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Recurso {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: string;
  icono?: string;
  url?: string;
  storage_path?: string;
  created_at?: string;
  compartido_at?: string;
  categoria?: string;
  tags?: string[];
  nota_personal?: string;
  visto?: boolean;
  recurso_id?: string;
  psicologa?: {
    nombre_completo: string;
  };
}

definePageMeta({
  layout: 'paciente',
  middleware: 'auth'
});

const { getRecursos, marcarRecursoComoVisto } = usePacientes();

const loading = ref(true);
const recursos = ref<Recurso[]>([]);

// Recursos demo para visualización
const recursosDemoCompartidos = [
  {
    id: 'demo-compartido-1',
    titulo: 'Guía de Respiración Consciente',
    descripcion: 'Ejercicios de respiración para manejo de ansiedad y momentos de estrés',
    tipo: 'Guía',
    icono: '📋',
    url: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',
    categoria: 'Ansiedad',
    tags: ['respiración', 'ansiedad', 'mindfulness'],
    nota_personal: '¡Hola! Te comparto este recurso para que practiques cuando sientas ansiedad. Los ejercicios de respiración son muy efectivos. Prueba hacer el ejercicio 3 veces al día.',
    visto: false,
    compartido_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-compartido-2',
    titulo: 'Meditación Guiada 10min',
    descripcion: 'Audio de meditación para principiantes y práctica diaria',
    tipo: 'Audio',
    icono: '🎵',
    url: 'https://www.youtube.com/watch?v=O-6f5wQXSu8',
    categoria: 'Mindfulness',
    tags: ['meditación', 'mindfulness', 'relajación'],
    nota_personal: 'Esta meditación es perfecta para comenzar tu día con calma. Te sugiero hacerla por las mañanas.',
    visto: true,
    compartido_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
]

// Cargar recursos
const cargarRecursos = async () => {
  loading.value = true
  try {
    const data = await getRecursos();
    
    // Si hay recursos compartidos, usarlos
    if (data && data.length > 0) {
      recursos.value = (data as any) || [];
    } else {
      // Si no hay recursos, usar demo
      console.log('📚 Usando recursos de demostración para paciente')
      recursos.value = recursosDemoCompartidos
    }
  } catch (error) {
    console.error('Error al cargar recursos, usando demo:', error);
    recursos.value = recursosDemoCompartidos
  } finally {
    loading.value = false;
  }
};

// Marcar recurso como visto
const marcarComoVisto = async (recursoId: string) => {
  try {
    await marcarRecursoComoVisto(recursoId);
    // Actualizar localmente
    const recurso = recursos.value.find(r => r.id === recursoId);
    if (recurso) {
      recurso.visto = true;
    }
  } catch (error) {
    console.error('Error al marcar como visto:', error);
  }
};

// Formatear fecha
const formatearFecha = (fecha: string) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

// Obtener clase CSS según tipo
const getTipoClass = (tipo: string) => {
  const clases = {
    pdf: 'bg-red-50 text-red-700',
    audio: 'bg-purple-50 text-purple-700',
    video: 'bg-blue-50 text-blue-700',
    link: 'bg-green-50 text-green-700'
  };
  return (clases as Record<string, string>)[tipo] || 'bg-gray-50 text-gray-700';
};

// Obtener texto según tipo
const getTipoTexto = (tipo: string) => {
  const textos = {
    pdf: 'PDF',
    audio: 'Audio',
    video: 'Video',
    link: 'Enlace'
  };
  return (textos as Record<string, string>)[tipo] || tipo;
};

// Descargar recurso
const descargarRecurso = (recurso: Recurso) => {
  // TODO: Implementar descarga desde Supabase Storage
  console.log('Descargando recurso:', recurso);
  alert(`Descargando: ${recurso.titulo}\n\nEsta funcionalidad se implementará con Supabase Storage.`);
};

// Ver recurso (para PDFs)
const verRecurso = (recurso: Recurso) => {
  // TODO: Implementar visualización desde Supabase Storage
  console.log('Viendo recurso:', recurso);
  alert(`Abriendo: ${recurso.titulo}\n\nEsta funcionalidad se implementará con Supabase Storage.`);
};

onMounted(cargarRecursos);
</script>
