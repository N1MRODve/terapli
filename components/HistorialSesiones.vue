<template>
  <div class="bg-white rounded-xl shadow-sm p-6 border border-[#E2E8F0]/40">
    <h2 class="font-serif text-xl text-[#2D3748] mb-4 flex items-center gap-2">
      <span class="text-2xl">📝</span>
      Historial de Sesiones
    </h2>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#5550F2]"></div>
      <p class="mt-2 text-sm text-[#2D3748]/60">Cargando historial...</p>
    </div>

    <!-- Sesiones List -->
    <div v-else-if="sesiones.length > 0" class="space-y-3">
      <div 
        v-for="sesion in sesiones" 
        :key="sesion.id"
        class="p-4 bg-[#F2F2F2] rounded-lg hover:bg-[#E2E8F0]/20 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xl">{{ getEstadoIcon(sesion.estado) }}</span>
              <span class="font-medium text-[#2D3748]">
                {{ formatearFecha(sesion.fecha) }}
              </span>
              <span class="text-sm text-[#2D3748]/60">
                {{ formatearHora(sesion.fecha) }}
              </span>
            </div>

            <div class="flex items-center gap-4 text-sm text-[#2D3748]/70">
              <span class="flex items-center gap-1">
                {{ sesion.modalidad === 'online' ? '💻' : '🏥' }}
                {{ sesion.modalidad === 'online' ? 'Online' : 'Presencial' }}
              </span>
              <span 
                class="px-2 py-0.5 rounded-full text-xs"
                :class="getEstadoClase(sesion.estado)"
              >
                {{ getEstadoTexto(sesion.estado) }}
              </span>
            </div>

            <p v-if="sesion.notas" class="mt-2 text-sm text-[#2D3748]/60 line-clamp-2">
              {{ sesion.notas }}
            </p>
          </div>

          <NuxtLink
            :to="`/terapeuta/sesiones/${sesion.id}`"
            class="px-3 py-1.5 text-sm bg-white border border-[#E2E8F0] text-[#2D3748] hover:bg-[#5550F2] hover:text-white hover:border-[#5550F2] rounded-lg transition-colors ml-4"
          >
            Ver →
          </NuxtLink>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalSesiones > limit" class="pt-4 border-t border-[#E2E8F0]/30">
        <div class="flex items-center justify-between">
          <p class="text-sm text-[#2D3748]/60">
            Mostrando {{ sesiones.length }} de {{ totalSesiones }} sesiones
          </p>
          <button
            v-if="sesiones.length < totalSesiones"
            @click="cargarMas"
            class="px-4 py-2 bg-white border border-[#E2E8F0] text-[#2D3748] hover:bg-[#F2F2F2] rounded-lg transition-colors text-sm"
          >
            Cargar más
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-[#2D3748]/60">
      <span class="text-4xl mb-3 block">📅</span>
      <p>No hay sesiones registradas todavía</p>
      <button
        class="mt-4 px-4 py-2 bg-[#5550F2] hover:bg-[#C89B8A] text-white rounded-lg transition-colors text-sm font-medium"
      >
        + Programar Primera Sesión
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  pacienteId: string
}>()

const supabase = useSupabaseClient()
const sesiones = ref<any[]>([])
const loading = ref(true)
const limit = ref(10)
const totalSesiones = ref(0)

onMounted(async () => {
  await cargarSesiones()
})

const cargarSesiones = async () => {
  try {
    // Obtener total
    const { count } = await supabase
      .from('sesiones' as any)
      .select('*', { count: 'exact', head: true })
      .eq('paciente_id', props.pacienteId)

    totalSesiones.value = count || 0

    // Obtener sesiones
    const { data, error } = await supabase
      .from('sesiones' as any)
      .select('*')
      .eq('paciente_id', props.pacienteId)
      .order('fecha', { ascending: false })
      .limit(limit.value)

    if (error) throw error
    sesiones.value = data || []
  } catch (err) {
    console.error('Error al cargar sesiones:', err)
  } finally {
    loading.value = false
  }
}

const cargarMas = async () => {
  limit.value += 10
  await cargarSesiones()
}

// Helper functions
const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatearHora = (fecha: string) => {
  return new Date(fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getEstadoIcon = (estado: string) => {
  const icons: Record<string, string> = {
    pendiente: '🕐',
    confirmada: '✅',
    realizada: '✓',
    cancelada: '❌'
  }
  return icons[estado] || '📅'
}

const getEstadoClase = (estado: string) => {
  const clases: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    confirmada: 'bg-blue-100 text-blue-700',
    realizada: 'bg-green-100 text-green-700',
    cancelada: 'bg-red-100 text-red-700'
  }
  return clases[estado] || 'bg-gray-100 text-gray-700'
}

const getEstadoTexto = (estado: string) => {
  const textos: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    realizada: 'Realizada',
    cancelada: 'Cancelada'
  }
  return textos[estado] || estado
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
