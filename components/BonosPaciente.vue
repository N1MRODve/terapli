<template>
  <div class="bg-gradient-to-br from-white to-cafe/5 rounded-2xl p-6 md:p-8 shadow-lg border border-cafe/10 space-y-6 transition-all duration-300">
    <!-- Encabezado mejorado con icono -->
    <div class="border-b border-cafe/10 pb-5">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-600/10 flex items-center justify-center">
          <span class="text-xl">🎫</span>
        </div>
        <h3 class="font-serif text-2xl font-bold text-cafe">Bonos del Paciente</h3>
      </div>
      <p class="text-sm text-cafe/60 ml-13">Gestión y seguimiento de sesiones contratadas</p>
    </div>

    <!-- Loading con animación mejorada -->
    <div v-if="loading" class="text-center py-16">
      <div class="relative inline-block">        <div class="w-12 h-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
        <div class="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-cafe/20 rounded-full animate-spin" style="animation-duration: 1.5s; animation-direction: reverse;"></div>
      </div>
      <p class="mt-4 text-sm text-cafe/60 font-medium">Cargando información de bonos...</p>
    </div>

    <!-- Grid de bonos activos - Diseño mejorado -->
    <div v-else-if="bonosActivos.length > 0" class="space-y-4">
      <!-- Título de sección -->
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-cafe/70 uppercase tracking-wider">Bonos Activos</h4>
        <span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
          {{ bonosActivos.length }} {{ bonosActivos.length === 1 ? 'bono' : 'bonos' }}
        </span>
      </div>
      
      <div class="grid grid-cols-1 gap-4">
        <div
          v-for="bono in bonosActivos"
          :key="bono.id"
          class="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-cafe/10 overflow-hidden"
        >
          <!-- Header card con gradiente sutil -->
          <div class="bg-gradient-to-r from-purple-600/5 via-white to-purple-600/5 px-6 py-4 border-b border-cafe/5">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-600/80 flex items-center justify-center shadow-sm">
                    <span class="text-white text-lg">🎟️</span>
                  </div>
                  <div>
                    <h5 class="text-base font-bold text-cafe">
                      {{ getBonoCantidadSesiones(bono) }}
                    </h5>
                    <p class="text-xs text-cafe/60 flex items-center gap-1.5">
                      <span>📅</span>
                      <span>Creado {{ formatearFecha(bono.created_at) }}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Badges de estado -->
              <div class="flex flex-col items-end gap-2">
                <span 
                  class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm backdrop-blur-sm transition-all duration-200"
                  :class="getEstadoBadgeClasses(bono)"
                >
                  {{ getEstadoLabel(bono) }}
                </span>
                
                <!-- Badge de pago mejorado -->
                <span 
                  v-if="!bono.pagado"
                  class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border border-orange-200 animate-pulse"
                  title="Pendiente de confirmación de pago"
                >
                  💳 Sin pagar
                </span>
                <span 
                  v-else
                  class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                  :title="`Pagado el ${formatearFecha(bono.fecha_pago)}`"
                >
                  ✓ Pagado
                </span>
              </div>
            </div>
          </div>

          <!-- Body card - Detalles de sesiones con diseño moderno -->
          <div class="px-6 py-5 space-y-5">
            <!-- Detalle de Sesiones con iconos -->
            <div class="bg-gradient-to-br from-cafe/5 to-transparent rounded-xl p-4 space-y-3 border border-cafe/5">
              <div class="flex justify-between items-center">
                <span class="text-sm text-cafe/70 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-cafe/10 flex items-center justify-center text-xs">📊</span>
                  Total de sesiones
                </span>
                <span class="font-bold text-cafe text-lg">{{ bono.sesiones_totales || 0 }}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-cafe/70 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-purple-600/10 flex items-center justify-center text-xs">✓</span>
                  Sesiones usadas
                </span>
                <span class="font-bold text-purple-600 text-lg">{{ (bono.sesiones_totales || 0) - (bono.sesiones_restantes || 0) }}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-cafe/70 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center text-xs">⏳</span>
                  Sesiones restantes
                </span>
                <span class="font-bold text-green-700 text-lg">{{ bono.sesiones_restantes || 0 }}</span>
              </div>
              
              <div class="pt-3 border-t border-cafe/10">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-cafe/70 flex items-center gap-2">
                    <span class="w-6 h-6 rounded-lg bg-cafe/10 flex items-center justify-center text-xs">💰</span>
                    Precio total
                  </span>
                  <span class="font-bold text-cafe text-lg">{{ formatearPrecio(bono.monto_total) }}</span>
                </div>
                <div class="flex justify-between items-center mt-2">
                  <span class="text-xs text-cafe/60 pl-8">Precio por sesión</span>
                  <span class="text-sm text-cafe/80 font-medium">{{ formatearPrecio((bono.monto_total || 0) / (bono.sesiones_totales || 1)) }}</span>
                </div>
              </div>
            </div>

            <!-- Barra de progreso mejorada con etiquetas -->
            <div class="space-y-2">
              <div class="flex justify-between items-center text-xs">
                <span class="text-cafe/70 font-medium">Progreso de sesiones</span>
                <span class="text-cafe font-bold">{{ calcularPorcentajeProgreso(bono) }}%</span>
              </div>
              <div class="relative h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div
                  class="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out shadow-sm"
                  :class="getProgressColorClass(bono)"
                  :style="{ width: `${calcularPorcentajeProgreso(bono)}%` }"
                >
                  <!-- Efecto de brillo -->
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
              </div>
            </div>

            <!-- Alertas modernas -->
            <div class="space-y-3">
              <!-- Alerta de bono próximo a agotarse -->
              <div
                v-if="estaProximoAgotar(bono)"
                class="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-r-xl p-4 flex items-start gap-3 shadow-sm"
              >
                <div class="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span class="text-white text-lg">⚠️</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-bold text-yellow-900 mb-1">Bono próximo a agotar</p>
                  <p class="text-xs text-yellow-800">
                    Quedan <span class="font-bold">{{ calcularSesionesRestantes(bono) }}</span> sesiones disponibles
                  </p>
                </div>
              </div>

              <!-- Alerta de pago pendiente -->
              <div
                v-if="!bono.pagado && (bono.estado === 'activo' || bono.estado === 'pendiente')"
                class="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-r-xl p-4 flex items-start gap-3 shadow-sm"
              >
                <div class="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span class="text-white text-lg">💳</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-bold text-orange-900 mb-1">Pendiente de pago</p>
                  <p class="text-xs text-orange-800">
                    Este bono aún no ha sido pagado. El paciente puede usar las sesiones y pagar al final, o confirma el pago ahora.
                  </p>
                </div>
              </div>
            </div>

            <!-- Botones de acción modernos -->
            <div class="space-y-3 pt-2">
              <!-- Fila de botones de pago -->
              <div v-if="!bono.pagado" class="grid grid-cols-2 gap-3">
                <!-- Botón de confirmar pago -->
                <button
                  @click="$emit('confirmar-pago', bono)"
                  class="group bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 col-span-2"
                >
                  <span class="text-base group-hover:scale-110 transition-transform duration-300">💳</span>
                  <span>Confirmar pago</span>
                </button>
              </div>
              
              <!-- Fila de botones cuando está pagado -->
              <div v-else class="grid grid-cols-2 gap-3">
                <!-- Botón renovar -->
                <button
                  @click="$emit('renovar-bono', bono)"
                  class="group bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:from-purple-600/90 hover:to-orange-600 rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span class="text-base group-hover:rotate-180 transition-transform duration-500">🔄</span>
                  <span>Renovar</span>
                </button>
                
                <!-- Botón revertir pago -->
                <button
                  @click="$emit('revertir-pago', bono)"
                  class="group bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  title="Desmarcar como pagado (en caso de error)"
                >
                  <span class="text-base group-hover:scale-110 transition-transform duration-300">↩️</span>
                  <span>Revertir pago</span>
                </button>
              </div>
              
              <!-- Botón ver detalles (siempre visible) -->
              <div class="grid grid-cols-1">
                <button
                  @click="$emit('ver-detalles', bono)"
                  class="group bg-cafe/10 text-cafe hover:bg-cafe/20 rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-300 border border-cafe/20 hover:border-cafe/40 flex items-center justify-center gap-2"
                >
                  <span class="text-base group-hover:scale-110 transition-transform duration-300">👁️</span>
                  <span>Ver detalles</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío mejorado -->
    <div v-else class="text-center bg-gradient-to-br from-white to-gray-50 rounded-2xl py-16 px-6 border-2 border-dashed border-cafe/20">
      <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600/10 to-purple-600/5 flex items-center justify-center">
        <span class="text-5xl">🎫</span>
      </div>
      <h4 class="text-xl font-bold text-cafe mb-3">No hay bonos activos</h4>
      <p class="text-sm text-cafe/60 mb-6 max-w-sm mx-auto">
        Este paciente no tiene bonos registrados en este momento. Puedes crear uno nuevo para comenzar.
      </p>
      <button
        @click="$emit('crear-bono')"
        class="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-xl hover:from-purple-600/90 hover:to-orange-600 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-1"
      >
        <span class="group-hover:rotate-90 transition-transform duration-300">➕</span>
        <span>Crear Nuevo Bono</span>
      </button>
    </div>

    <!-- Historial de bonos finalizados - Diseño mejorado -->
    <div v-if="!loading && bonosFinalizados.length > 0" class="pt-8 border-t border-cafe/10">
      <button
        @click="mostrarHistorial = !mostrarHistorial"
        class="group flex items-center justify-between w-full text-left bg-gradient-to-r from-cafe/5 to-transparent hover:from-cafe/10 rounded-xl px-5 py-4 transition-all duration-300"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-cafe/10 flex items-center justify-center">
            <span class="text-sm">📦</span>
          </div>
          <div>
            <span class="font-bold text-cafe text-sm">Historial de bonos finalizados</span>
            <span class="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
              {{ bonosFinalizados.length }}
            </span>
          </div>
        </div>
        <span class="text-lg transition-transform duration-300 text-cafe/60 group-hover:text-cafe" :class="{ 'rotate-180': mostrarHistorial }">
          ▼
        </span>
      </button>
      
      <div v-show="mostrarHistorial" class="mt-4 space-y-3 animate-fadeIn">
        <div
          v-for="bono in bonosFinalizados"
          :key="bono.id"
          class="group bg-white border border-gray-200 hover:border-cafe/30 rounded-xl p-5 transition-all duration-300 hover:shadow-md"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span class="text-sm">🏁</span>
                </div>
                <p class="text-sm font-bold text-cafe">{{ getBonoCantidadSesiones(bono) }}</p>
              </div>
              <p class="text-xs text-cafe/60 mb-1 flex items-center gap-1.5">
                <span>📅</span>
                <span>Finalizado el {{ formatearFecha(bono.updated_at) }}</span>
              </p>
              <div class="flex items-center gap-4 mt-3">
                <div class="flex items-center gap-1.5 text-xs">
                  <span class="text-cafe/60">Sesiones:</span>
                  <span class="font-bold text-cafe">{{ (bono.sesiones_totales || 0) - (bono.sesiones_restantes || 0) }} / {{ bono.sesiones_totales || 0 }}</span>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <span class="text-cafe/60">Monto:</span>
                  <span class="font-bold text-cafe">{{ formatearPrecio(bono.monto_total) }}</span>
                </div>
              </div>
            </div>
            <span class="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wide">
              Finalizado
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

const props = defineProps<{
  pacienteId: string
}>()

defineEmits(['renovar-bono', 'ver-detalles', 'crear-bono', 'confirmar-pago', 'revertir-pago'])

const supabase = useSupabaseClient()
const bonos = ref<any[]>([])
const loading = ref(true)
const mostrarHistorial = ref(false)

// Computed properties
const bonosActivos = computed(() => {
  return bonos.value.filter(bono => 
    (bono.estado === 'activo' || bono.estado === 'pendiente') && 
    (bono.sesiones_restantes > 0)
  )
})

const bonosFinalizados = computed(() => {
  return bonos.value.filter(bono => 
    bono.estado === 'finalizado' || 
    bono.estado === 'cancelado' ||
    bono.sesiones_restantes === 0
  )
})

// Función para cargar bonos
const cargarBonos = async () => {
  loading.value = true
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
}

// Cargar bonos al montar el componente
onMounted(() => {
  cargarBonos()
})

// Recargar bonos cuando cambie el pacienteId
watch(() => props.pacienteId, () => {
  if (props.pacienteId) {
    cargarBonos()
  }
}, { immediate: false })

// Funciones de utilidad
const getBonoCantidadSesiones = (bono: any) => {
  const cantidad = bono.sesiones_totales || 0
  if (cantidad === 1) return 'Bono de 1 sesión'
  if (cantidad <= 4) return `Bono de ${cantidad} sesiones`
  if (cantidad <= 8) return `Bono Semanal (${cantidad} sesiones)`
  return `Bono Quincenal (${cantidad} sesiones)`
}

const calcularSesionesRestantes = (bono: any) => {
  return bono.sesiones_restantes || 0
}

const calcularPorcentajeProgreso = (bono: any) => {
  const total = bono.sesiones_totales || 0
  const restantes = bono.sesiones_restantes || 0
  const usadas = total - restantes
  if (total === 0) return 0
  return Math.round((usadas / total) * 100)
}

const estaProximoAgotar = (bono: any) => {
  const restantes = bono.sesiones_restantes || 0
  const activo = bono.estado === 'activo' || bono.estado === 'pendiente'
  return activo && restantes > 0 && restantes <= 2
}

const getEstadoLabel = (bono: any) => {
  if (bono.estado === 'finalizado' || bono.estado === 'cancelado') return 'Finalizado'
  if (bono.sesiones_restantes === 0) return 'Agotado'
  if (estaProximoAgotar(bono)) return 'Por agotar'
  if (bono.estado === 'pendiente') return 'Pendiente'
  return 'Activo'
}

const getEstadoBadgeClasses = (bono: any) => {
  const estado = getEstadoLabel(bono)
  
  if (estado === 'Activo') {
    return 'bg-green-100 text-green-700'
  } else if (estado === 'Por agotar') {
    return 'bg-yellow-100 text-yellow-700'
  } else if (estado === 'Pendiente') {
    return 'bg-blue-100 text-blue-700'
  } else if (estado === 'Agotado' || estado === 'Finalizado') {
    return 'bg-gray-100 text-gray-600'
  }
  return 'bg-blue-100 text-blue-700'
}

const getProgressColorClass = (bono: any) => {
  const porcentaje = calcularPorcentajeProgreso(bono)
  if (porcentaje >= 80) return 'bg-gradient-to-r from-red-400 to-red-600'
  if (porcentaje >= 50) return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
  return 'bg-gradient-to-r from-green-400 to-green-600'
}

const formatearPrecio = (precio: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(precio || 0)
}

const formatearFecha = (fecha: string) => {
  if (!fecha) return 'Sin fecha'
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
