<template>
  <div class="bg-white rounded-xl shadow-sm p-6 border border-[#EAD5D3]/40">
    <h2 class="font-['Lora'] text-xl text-[#5D4A44] mb-4 flex items-center gap-2">
      <span class="text-2xl">🎫</span>
      Bonos Contratados
    </h2>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D8AFA0]"></div>
      <p class="mt-2 text-sm text-[#5D4A44]/60">Cargando bonos...</p>
    </div>

    <!-- Bonos List -->
    <div v-else-if="bonos.length > 0" class="space-y-4">
      <div 
        v-for="bono in bonos" 
        :key="bono.id"
        class="p-4 border rounded-lg"
        :class="bono.activo ? 'border-[#D8AFA0] bg-[#D8AFA0]/5' : 'border-gray-200 bg-gray-50'"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-medium text-[#5D4A44]">
              Bono de {{ bono.sesiones_totales }} sesiones
            </h3>
            <p class="text-sm text-[#5D4A44]/60 mt-1">
              {{ formatearPrecio(bono.precio) }} total • {{ formatearPrecio(bono.precio / bono.sesiones_totales) }} por sesión
            </p>
          </div>
          <span 
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="getEstadoBadge(bono)"
          >
            {{ getEstadoTexto(bono) }}
          </span>
        </div>

        <!-- Progreso -->
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-[#5D4A44]/70">Sesiones usadas</span>
            <span class="font-medium text-[#5D4A44]">
              {{ bono.sesiones_usadas }} / {{ bono.sesiones_totales }}
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all"
              :class="getProgressColor(bono)"
              :style="{ width: `${(bono.sesiones_usadas / bono.sesiones_totales) * 100}%` }"
            ></div>
          </div>
          <p class="text-xs text-[#5D4A44]/60">
            {{ bono.sesiones_totales - bono.sesiones_usadas }} sesiones restantes
          </p>
        </div>

        <!-- Fecha de creación -->
        <div class="mt-3 pt-3 border-t border-[#EAD5D3]/30">
          <p class="text-xs text-[#5D4A44]/50">
            Contratado el {{ formatearFecha(bono.created_at) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-[#5D4A44]/60">
      <span class="text-4xl mb-3 block">🎫</span>
      <p>No hay bonos contratados</p>
      <button
        class="mt-4 px-4 py-2 bg-[#D8AFA0] hover:bg-[#C89B8A] text-white rounded-lg transition-colors text-sm font-medium"
      >
        + Contratar Bono
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
const bonos = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('bonos' as any)
      .select('*')
      .eq('paciente_id', props.pacienteId)
      .order('created_at', { ascending: false })

    if (error) throw error
    bonos.value = data || []
  } catch (err) {
    console.error('Error al cargar bonos:', err)
  } finally {
    loading.value = false
  }
})

// Helper functions
const formatearPrecio = (precio: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(precio)
}

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getEstadoBadge = (bono: any) => {
  if (!bono.activo) return 'bg-gray-200 text-gray-700'
  if (bono.sesiones_usadas >= bono.sesiones_totales) return 'bg-red-100 text-red-700'
  return 'bg-green-100 text-green-700'
}

const getEstadoTexto = (bono: any) => {
  if (!bono.activo) return '⏸️ Pausado'
  if (bono.sesiones_usadas >= bono.sesiones_totales) return '✕ Agotado'
  return '✓ Activo'
}

const getProgressColor = (bono: any) => {
  const porcentaje = (bono.sesiones_usadas / bono.sesiones_totales) * 100
  if (porcentaje >= 80) return 'bg-red-500'
  if (porcentaje >= 50) return 'bg-yellow-500'
  return 'bg-green-500'
}
</script>
