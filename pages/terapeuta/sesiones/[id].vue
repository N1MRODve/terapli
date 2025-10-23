<template>
  <div>
    <!-- Breadcrumb -->
    <nav class="mb-6 flex items-center gap-2 text-sm text-[#5D4A44]/60">
      <NuxtLink to="/terapeuta/dashboard" class="hover:text-[#D8AFA0] transition-colors">
        Dashboard
      </NuxtLink>
      <span>/</span>
      <NuxtLink to="/terapeuta/sesiones" class="hover:text-[#D8AFA0] transition-colors">
        Sesiones
      </NuxtLink>
      <span>/</span>
      <span class="text-[#5D4A44]">Detalle</span>
    </nav>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#D8AFA0]"></div>
        <p class="mt-4 text-[#5D4A44]/60">Cargando sesión...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
      <h3 class="text-red-800 font-['Lora'] text-lg mb-2">Error al cargar la sesión</h3>
      <p class="text-red-600 text-sm">{{ error }}</p>
      <NuxtLink to="/terapeuta/sesiones" class="mt-4 inline-block text-red-700 hover:text-red-900 text-sm font-medium">
        ← Volver a sesiones
      </NuxtLink>
    </div>

    <!-- Sesión Content -->
    <div v-else-if="sesion" class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-[#EAD5D3]/40">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h1 class="text-3xl font-['Lora'] text-[#5D4A44] mb-2">
              Sesión #{{ sesion.id.slice(0, 8) }}
            </h1>
            <p class="text-[#5D4A44]/70">
              {{ formatearFecha(sesion.fecha) }} a las {{ formatearHora(sesion.fecha) }}
            </p>
          </div>
          <span 
            class="px-4 py-2 rounded-full text-sm font-medium"
            :class="getEstadoClase(sesion.estado)"
          >
            {{ getEstadoTexto(sesion.estado) }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Columna Principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Información de la Sesión -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-[#EAD5D3]/40">
            <h2 class="font-['Lora'] text-xl text-[#5D4A44] mb-4 flex items-center gap-2">
              <span class="text-2xl">📋</span>
              Detalles de la Sesión
            </h2>
            
            <div class="grid grid-cols-2 gap-4 text-[#5D4A44]">
              <div>
                <p class="text-sm text-[#5D4A44]/60 mb-1">Paciente</p>
                <NuxtLink 
                  :to="`/terapeuta/pacientes/${sesion.paciente_id}`"
                  class="font-medium hover:text-[#D8AFA0] transition-colors flex items-center gap-1"
                >
                  {{ sesion.pacientes?.nombre || 'Sin nombre' }}
                  <span class="text-xs">→</span>
                </NuxtLink>
              </div>
              
              <div>
                <p class="text-sm text-[#5D4A44]/60 mb-1">Fecha</p>
                <p class="font-medium">{{ formatearFecha(sesion.fecha) }}</p>
              </div>
              
              <div>
                <p class="text-sm text-[#5D4A44]/60 mb-1">Hora</p>
                <p class="font-medium">{{ formatearHora(sesion.fecha) }}</p>
              </div>
              
              <div>
                <p class="text-sm text-[#5D4A44]/60 mb-1">Modalidad</p>
                <span class="inline-flex items-center gap-1 px-3 py-1 bg-[#F9F7F3] rounded-full text-sm">
                  <span>{{ sesion.modalidad === 'online' ? '💻' : '🏥' }}</span>
                  <span>{{ sesion.modalidad === 'online' ? 'Online' : 'Presencial' }}</span>
                </span>
              </div>
              
              <div>
                <p class="text-sm text-[#5D4A44]/60 mb-1">Duración</p>
                <p class="font-medium">{{ sesion.duracion || 50 }} minutos</p>
              </div>
              
              <div>
                <p class="text-sm text-[#5D4A44]/60 mb-1">Bono vinculado</p>
                <p class="font-medium">{{ sesion.bono_id ? 'Sí' : 'Sesión individual' }}</p>
              </div>
            </div>
          </div>

          <!-- Resumen Financiero -->
          <div class="bg-gradient-to-br from-[#D8AFA0]/10 to-[#EAD5D3]/20 rounded-xl shadow-sm p-6 border border-[#EAD5D3]/40">
            <h3 class="text-lg font-['Lora'] text-[#5D4A44] mb-4 flex items-center gap-2">
              <span class="text-2xl">💰</span>
              Resumen Financiero
            </h3>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-[#5D4A44]/70">Precio total de la sesión</span>
                <span class="text-xl font-bold text-[#5D4A44]">
                  {{ formatearPrecio(sesion.precio_total || 50) }}
                </span>
              </div>
              
              <div class="border-t border-[#EAD5D3]/40 pt-3 space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-[#5D4A44]/70">Terapeuta (70%)</span>
                  <span class="text-lg font-semibold text-green-700">
                    {{ formatearPrecio((sesion.precio_total || 50) * 0.7) }}
                  </span>
                </div>
                
                <div class="flex justify-between items-center">
                  <span class="text-[#5D4A44]/70">Consulta (30%)</span>
                  <span class="text-lg font-medium text-[#5D4A44]/80">
                    {{ formatearPrecio((sesion.precio_total || 50) * 0.3) }}
                  </span>
                </div>
              </div>
              
              <div class="border-t border-[#EAD5D3]/40 pt-3">
                <div class="flex justify-between items-center">
                  <span class="text-[#5D4A44]/70">Estado del pago</span>
                  <span 
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    :class="sesion.pagado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
                  >
                    {{ sesion.pagado ? '✓ Pagado' : '⏳ Pendiente' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Notas Privadas -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-[#EAD5D3]/40">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-['Lora'] text-[#5D4A44] flex items-center gap-2">
                <span class="text-2xl">📝</span>
                Notas Privadas del Terapeuta
              </h3>
              <span 
                v-if="guardandoNotas"
                class="text-sm text-green-600 flex items-center gap-1"
              >
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            </div>
            
            <textarea 
              v-model="notas" 
              @input="debouncedGuardarNotas"
              class="w-full h-48 border border-[#EAD5D3] rounded-lg p-4 bg-[#F9F7F3] font-['Lato'] text-[#5D4A44] focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent outline-none resize-none"
              placeholder="Anota observaciones, temas tratados, tareas asignadas, aspectos a trabajar en próximas sesiones..."
            ></textarea>
            
            <div class="mt-3 flex items-center justify-between">
              <p class="text-xs text-[#5D4A44]/50">
                Las notas se guardan automáticamente. Solo tú puedes verlas.
              </p>
              <button
                @click="guardarNotas"
                class="px-4 py-2 bg-[#D8AFA0] hover:bg-[#C89B8A] text-white rounded-lg transition-colors text-sm font-medium"
              >
                Guardar ahora
              </button>
            </div>
          </div>
        </div>

        <!-- Columna Lateral -->
        <div class="space-y-6">
          <!-- Acciones Rápidas -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-[#EAD5D3]/40">
            <h3 class="font-['Lora'] text-lg text-[#5D4A44] mb-4">Acciones</h3>
            
            <div class="space-y-3">
              <button
                v-if="sesion.estado === 'pendiente'"
                @click="cambiarEstado('confirmada')"
                class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                ✓ Confirmar Sesión
              </button>
              
              <button
                v-if="sesion.estado === 'confirmada'"
                @click="cambiarEstado('realizada')"
                class="w-full px-4 py-2 bg-[#D8AFA0] hover:bg-[#C89B8A] text-white rounded-lg transition-colors text-sm font-medium"
              >
                ✓ Marcar como Realizada
              </button>
              
              <button
                v-if="['pendiente', 'confirmada'].includes(sesion.estado)"
                @click="cambiarEstado('cancelada')"
                class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                ✕ Cancelar Sesión
              </button>
              
              <NuxtLink
                :to="`/terapeuta/pacientes/${sesion.paciente_id}`"
                class="w-full block px-4 py-2 bg-white border border-[#EAD5D3] text-[#5D4A44] hover:bg-[#F9F7F3] rounded-lg transition-colors text-sm font-medium text-center"
              >
                Ver Perfil del Paciente
              </NuxtLink>
              
              <button
                class="w-full px-4 py-2 bg-white border border-[#EAD5D3] text-[#5D4A44] hover:bg-[#F9F7F3] rounded-lg transition-colors text-sm font-medium"
              >
                📄 Generar Recibo
              </button>
            </div>
          </div>

          <!-- Info Adicional -->
          <div class="bg-[#F9F7F3] rounded-xl p-6 border border-[#EAD5D3]/40">
            <h4 class="font-['Lora'] text-sm text-[#5D4A44] mb-3">Información</h4>
            <div class="space-y-2 text-xs text-[#5D4A44]/70">
              <p>• Creada: {{ formatearFecha(sesion.created_at) }}</p>
              <p>• ID: {{ sesion.id }}</p>
              <p v-if="sesion.bono_id">• Bono: {{ sesion.bono_id.slice(0, 8) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

definePageMeta({
  layout: 'terapeuta',
  middleware: ['auth-terapeuta']
})

const route = useRoute()
const supabase = useSupabaseClient()

// Estado
const sesion = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const notas = ref('')
const guardandoNotas = ref(false)

// Cargar sesión
onMounted(async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('sesiones' as any)
      .select(`
        *,
        pacientes (
          id,
          nombre,
          email
        )
      `)
      .eq('id', route.params.id)
      .single()

    if (fetchError) throw fetchError

    sesion.value = data
    notas.value = data?.notas || ''
    
  } catch (err: any) {
    console.error('Error al cargar sesión:', err)
    error.value = err.message || 'No se pudo cargar la sesión'
  } finally {
    loading.value = false
  }
})

// Funciones de formato
const formatearFecha = (fecha: string) => {
  if (!fecha) return 'Fecha no disponible'
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatearHora = (fecha: string) => {
  if (!fecha) return '--:--'
  return new Date(fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatearPrecio = (precio: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(precio)
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
    pendiente: '⏳ Pendiente',
    confirmada: '✓ Confirmada',
    realizada: '✓ Realizada',
    cancelada: '✕ Cancelada'
  }
  return textos[estado] || estado
}

// Guardar notas
let timeoutId: NodeJS.Timeout

const debouncedGuardarNotas = () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    guardarNotas()
  }, 2000) // Esperar 2 segundos después de dejar de escribir
}

const guardarNotas = async () => {
  if (!sesion.value) return
  
  guardandoNotas.value = true
  
  try {
    const { error: updateError } = await supabase
      .from('sesiones' as any)
      .update({ notas: notas.value })
      .eq('id', route.params.id)

    if (updateError) throw updateError
    
    // Feedback visual
    setTimeout(() => {
      guardandoNotas.value = false
    }, 500)
    
  } catch (err: any) {
    console.error('Error al guardar notas:', err)
    alert('No se pudieron guardar las notas. Intenta nuevamente.')
    guardandoNotas.value = false
  }
}

// Cambiar estado de sesión
const cambiarEstado = async (nuevoEstado: string) => {
  if (!confirm(`¿Confirmas cambiar el estado a "${nuevoEstado}"?`)) return
  
  try {
    const { error: updateError } = await supabase
      .from('sesiones' as any)
      .update({ estado: nuevoEstado })
      .eq('id', route.params.id)

    if (updateError) throw updateError
    
    sesion.value.estado = nuevoEstado
    
  } catch (err: any) {
    console.error('Error al cambiar estado:', err)
    alert('No se pudo cambiar el estado. Intenta nuevamente.')
  }
}
</script>

<style scoped>
textarea {
  font-family: 'Lato', sans-serif;
}

textarea:focus {
  box-shadow: 0 0 0 3px rgba(216, 175, 160, 0.1);
}
</style>
