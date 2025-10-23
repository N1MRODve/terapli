<template>
  <div class="bg-white rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.05)] border border-[#EAD5D3]/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-['Lora'] text-xl text-[#5D4A44]">
        Recursos para ti
      </h2>
      <button
        @click="$router.push('/paciente/recursos')"
        class="font-['Lato'] text-sm text-[#D8AFA0] hover:text-[#C99F90] transition-colors flex items-center gap-1"
      >
        Ver todos
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <div v-if="resources.length > 0" class="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-1 px-1 scrollbar-hide">
      <div
        v-for="resource in resources"
        :key="resource.id"
        class="flex-shrink-0 snap-start w-64 group p-4 bg-[#F9F7F3] rounded-2xl border border-transparent
               hover:border-[#D8AFA0]/30 hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer"
        @click="openResource(resource)"
      >
        <!-- Icono -->
        <div class="mb-3 w-12 h-12 rounded-full bg-white flex items-center justify-center
                    text-2xl group-hover:scale-110 transition-transform duration-300 ease-in-out">
          {{ resource.icon }}
        </div>

        <!-- Categoría -->
        <span class="inline-block px-2.5 py-1 mb-2 text-xs font-['Lato'] rounded-full
                     bg-[#D8AFA0]/20 text-[#D8AFA0]">
          {{ resource.category }}
        </span>

        <!-- Título -->
        <h3 class="font-['Lora'] text-base text-[#5D4A44] mb-2 group-hover:text-[#D8AFA0] transition-colors line-clamp-2">
          {{ resource.title }}
        </h3>

        <!-- Descripción -->
        <p class="font-['Lato'] text-sm text-[#5D4A44]/70 mb-3 line-clamp-2">
          {{ resource.description }}
        </p>

        <!-- Metadata -->
        <div class="flex items-center gap-3 text-xs font-['Lato'] text-[#5D4A44]/50">
          <span v-if="resource.duration" class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ resource.duration }}
          </span>
          <span v-if="resource.isNew" class="px-2 py-0.5 bg-[#D8AFA0] text-white rounded-full">
            Nuevo
          </span>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-6">
      <div class="inline-block mb-3 text-4xl opacity-30">📚</div>
      <p class="font-['Lato'] text-sm text-[#5D4A44]/60">
        No hay recursos disponibles en este momento
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Datos de ejemplo (esto vendría de Supabase)
const resources = ref([
  {
    id: 1,
    icon: '🧘‍♀️',
    category: 'Meditación',
    title: 'Respiración consciente',
    description: 'Ejercicio guiado para calmar la ansiedad y centrarte en el presente.',
    duration: '5 min',
    isNew: true,
    link: '/recursos/respiracion-consciente'
  },
  {
    id: 2,
    icon: '📖',
    category: 'Lectura',
    title: 'Gestión de emociones',
    description: 'Artículo sobre cómo identificar y validar tus emociones sin juzgarlas.',
    duration: '8 min',
    isNew: false,
    link: '/recursos/gestion-emociones'
  },
  {
    id: 3,
    icon: '🎧',
    category: 'Audio',
    title: 'Meditación para dormir',
    description: 'Audio relajante que te ayudará a desconectar y descansar profundamente.',
    duration: '15 min',
    isNew: true,
    link: '/recursos/meditacion-dormir'
  }
])

const openResource = (resource) => {
  // Navegar al recurso o abrirlo en modal
  if (resource.link) {
    navigateTo(resource.link)
  }
}
</script>

<style scoped>
/* Ocultar scrollbar pero mantener funcionalidad */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Line clamp para texto */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
