<template>
  <div class="group bono-card bg-white/90 backdrop-blur-md border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 relative overflow-hidden hover:bg-white/95 hover:scale-[1.02]"
    :class="[borderColor, { 'opacity-60': bono.estado === 'cancelado' }]"
  >
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#5550F2]/5 via-transparent to-[#04BF9D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div class="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#F2B33D]/10 to-[#5550F2]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-700"></div>

    <!-- Header del bono -->
    <div class="relative flex items-start justify-between mb-6">
      <div class="flex-1">
        <div class="flex items-center gap-4 mb-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5550F2] to-[#027368] shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <span class="text-xl">🎫</span>
          </div>
          <h3 class="font-['Elms_Sans'] text-xl font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent">
            Bono {{ tipoTexto }}
          </h3>
        </div>
        
        <!-- Estado del bono -->
        <div class="flex items-center gap-3 flex-wrap">
          <span 
            class="inline-flex items-center px-4 py-2 rounded-xl text-xs font-['Lato'] font-semibold border backdrop-blur-sm shadow-sm"
            :class="estadoColor"
          >
            {{ estadoIcono }} {{ estadoTexto }}
          </span>
          
          <!-- Alerta de vencimiento próximo -->
          <span 
            v-if="proximoAVencer"
            class="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-['Lato'] font-semibold bg-gradient-to-r from-[#F2B33D]/20 to-[#F2B33D]/10 text-[#F2B33D] border border-[#F2B33D]/30 backdrop-blur-sm shadow-sm"
          >
            ⚠️ Vence pronto
          </span>
          
          <!-- Alerta de pocas sesiones -->
          <span 
            v-if="pocasSesiones"
            class="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-['Lato'] font-semibold bg-gradient-to-r from-[#04BF9D]/20 to-[#027368]/10 text-[#027368] border border-[#04BF9D]/30 backdrop-blur-sm shadow-sm"
          >
            📊 Pocas sesiones
          </span>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="flex gap-3">
        <button
          v-if="puedeVerPagos"
          @click="$emit('verPagos', bono)"
          class="p-3 hover:bg-gradient-to-br from-[#5550F2]/10 to-[#027368]/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/50 hover:shadow-lg hover:scale-110 group/btn"
          title="Ver pagos"
        >
          <span class="text-lg group-hover/btn:scale-110 transition-transform duration-300">💰</span>
        </button>
        <button
          v-if="puedeRenovar"
          @click="$emit('renovar', bono)"
          class="p-3 hover:bg-gradient-to-br from-[#04BF9D]/10 to-[#F2B33D]/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/50 hover:shadow-lg hover:scale-110 group/btn"
          title="Renovar bono"
        >
          <span class="text-lg group-hover/btn:scale-110 transition-transform duration-300">🔄</span>
        </button>
      </div>
    </div>

    <!-- Progreso de sesiones -->
    <div class="relative mb-6">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-['Lato'] text-gray-600 font-medium">Sesiones</span>
        <span class="text-sm font-['Lato'] font-semibold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent">
          {{ sesionesRestantes }} / {{ bono.sesiones_totales }} disponibles
        </span>
      </div>
      
      <!-- Barra de progreso moderna -->
      <div class="relative w-full bg-gradient-to-r from-gray-100 to-gray-50 rounded-full h-4 overflow-hidden shadow-inner">
        <div 
          class="h-4 rounded-full transition-all duration-700 ease-out shadow-lg relative overflow-hidden"
          :class="barraProgresoColor"
          :style="{ width: porcentajeUsado + '%' }"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
      </div>
      
      <div class="flex justify-between mt-2 text-xs font-['Lato'] text-gray-600">
        <span>{{ sesionesUsadas }} usadas</span>
        <span class="font-semibold">{{ porcentajeUsado }}% completado</span>
      </div>
    </div>

    <!-- Información del bono -->
    <div class="relative grid grid-cols-2 gap-4 mb-6">
      <!-- Tipo y frecuencia -->
      <div class="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm group-hover:shadow-md transition-all duration-300">
        <div class="text-xs font-['Lato'] text-gray-500 uppercase tracking-wider mb-2">Tipo</div>
        <div class="text-sm font-['Lato'] font-semibold text-gray-800 capitalize">
          {{ bono.tipo || 'Estándar' }}
        </div>
      </div>
      
      <div class="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm group-hover:shadow-md transition-all duration-300">
        <div class="text-xs font-['Lato'] text-gray-500 uppercase tracking-wider mb-2">Frecuencia</div>
        <div class="text-sm font-['Lato'] font-semibold text-gray-800 capitalize">
          {{ bono.frecuencia || 'Semanal' }}
        </div>
      </div>

      <!-- Monto -->
      <div class="p-3 bg-white rounded-lg border border-[#D8AFA0]/20">
        <div class="text-xs text-[#5D4A44]/60 mb-1">Monto</div>
        <div class="text-sm font-medium text-[#5D4A44]">
          {{ formatearMonto(bono.monto) }}
        </div>
      </div>

      <!-- Estado de pago -->
      <div class="p-3 bg-white rounded-lg border border-[#D8AFA0]/20">
        <div class="text-xs text-[#5D4A44]/60 mb-1">Pago</div>
        <div class="text-sm font-medium flex items-center gap-1"
          :class="bono.pagado ? 'text-green-600' : 'text-orange-600'"
        >
          {{ bono.pagado ? '✓ Pagado' : '⏳ Pendiente' }}
        </div>
      </div>
    </div>

    <!-- Fechas -->
    <div v-if="bono.fecha_inicio || bono.fecha_fin" class="mb-4 p-3 bg-gradient-to-r from-[#D8AFA0]/10 to-[#ECC8BA]/10 rounded-lg">
      <div class="flex items-center justify-between text-sm">
        <div v-if="bono.fecha_inicio">
          <span class="text-[#5D4A44]/60">Inicio:</span>
          <span class="font-medium text-[#5D4A44] ml-1">{{ formatearFecha(bono.fecha_inicio) }}</span>
        </div>
        <div v-if="bono.fecha_fin">
          <span class="text-[#5D4A44]/60">Vence:</span>
          <span class="font-medium ml-1" :class="proximoAVencer ? 'text-orange-600' : 'text-[#5D4A44]'">
            {{ formatearFecha(bono.fecha_fin) }}
          </span>
        </div>
      </div>
      
      <!-- Días restantes -->
      <div v-if="diasRestantes !== null && bono.estado === 'activo'" class="mt-2 text-xs text-center text-[#5D4A44]/60">
        {{ diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Vencido' }}
      </div>
    </div>

    <!-- Renovación automática -->
    <div v-if="bono.renovacion_automatica" class="flex items-center gap-2 mb-4 p-2 bg-purple-50 border border-purple-200 rounded-lg">
      <span class="text-sm">🔄</span>
      <span class="text-xs text-purple-700 font-medium">Renovación automática activada</span>
    </div>

    <!-- Notas -->
    <div v-if="bono.notas" class="mb-4">
      <div class="text-xs text-[#5D4A44]/60 mb-1">Notas</div>
      <div class="text-sm text-[#5D4A44]/80 p-2 bg-white rounded-lg border border-[#D8AFA0]/20">
        {{ bono.notas }}
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="flex gap-2 pt-3 border-t border-[#D8AFA0]/20">
      <button
        v-if="puedeVerPagos"
        @click="$emit('verPagos', bono)"
        class="flex-1 px-4 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors text-sm font-medium flex items-center justify-center gap-2"
      >
        <span>💰</span>
        <span>Ver Pagos</span>
      </button>
      
      <button
        v-if="puedeRenovar && bono.estado !== 'activo'"
        @click="$emit('renovar', bono)"
        class="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
      >
        <span>🔄</span>
        <span>Renovar</span>
      </button>

      <button
        v-if="puedeEditar"
        @click="$emit('editar', bono)"
        class="px-4 py-2 bg-white border border-[#D8AFA0]/30 text-[#5D4A44] rounded-lg hover:bg-[#D8AFA0]/10 transition-colors text-sm font-medium"
      >
        ✏️
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  bono: any
}>()

defineEmits<{
  renovar: [bono: any]
  verPagos: [bono: any]
  editar: [bono: any]
}>()

const { getEstadoColor, getEstadoTexto, calcularPorcentajeUso, puedeGestionarBonos, puedeConfirmarPagos } = useBonos()
const { isCoordinadora } = useRoles()

// Computed properties
const tipoTexto = computed(() => {
  const tipos: Record<string, string> = {
    'quincenal': 'Quincenal',
    'mensual': 'Mensual',
    'semestral': 'Semestral'
  }
  return tipos[props.bono.tipo] || props.bono.tipo || 'Estándar'
})

const estadoColor = computed(() => getEstadoColor(props.bono.estado))

const estadoTexto = computed(() => getEstadoTexto(props.bono.estado))

const estadoIcono = computed(() => {
  const iconos: Record<string, string> = {
    'pendiente': '⏳',
    'activo': '✅',
    'completado': '✔️',
    'vencido': '❌',
    'cancelado': '🚫'
  }
  return iconos[props.bono.estado] || '📋'
})

const borderColor = computed(() => {
  const colores: Record<string, string> = {
    'pendiente': 'border-yellow-300',
    'activo': 'border-green-300',
    'completado': 'border-gray-300',
    'vencido': 'border-red-300',
    'cancelado': 'border-gray-400'
  }
  return colores[props.bono.estado] || 'border-gray-300'
})

const sesionesRestantes = computed(() => props.bono.sesiones_restantes ?? 0)
const sesionesUsadas = computed(() => (props.bono.sesiones_totales || 0) - sesionesRestantes.value)
const porcentajeUsado = computed(() => calcularPorcentajeUso(props.bono))

const barraProgresoColor = computed(() => {
  const porcentaje = porcentajeUsado.value
  if (porcentaje >= 90) return 'bg-red-500'
  if (porcentaje >= 70) return 'bg-orange-500'
  if (porcentaje >= 50) return 'bg-yellow-500'
  return 'bg-gradient-to-r from-[#D8AFA0] to-[#ECC8BA]'
})

const diasRestantes = computed(() => {
  if (!props.bono.fecha_fin) return null
  const hoy = new Date()
  const fechaFin = new Date(props.bono.fecha_fin)
  const diferencia = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  return diferencia
})

const proximoAVencer = computed(() => {
  if (props.bono.estado !== 'activo' || diasRestantes.value === null) return false
  return diasRestantes.value >= 0 && diasRestantes.value <= 7
})

const pocasSesiones = computed(() => {
  return props.bono.estado === 'activo' && sesionesRestantes.value > 0 && sesionesRestantes.value <= 2
})

// Permisos
const puedeVerPagos = computed(() => puedeGestionarBonos.value || puedeConfirmarPagos.value)
const puedeRenovar = computed(() => puedeGestionarBonos.value)
const puedeEditar = computed(() => isCoordinadora.value)

// Formateo
const formatearFecha = (fecha: string) => {
  if (!fecha) return ''
  try {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return fecha
  }
}

const formatearMonto = (monto: number | null) => {
  if (!monto) return '$ 0'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(monto)
}
</script>

<style scoped>
.bono-card {
  transition: all 0.3s ease;
}

.bono-card:hover {
  transform: translateY(-2px);
}
</style>
