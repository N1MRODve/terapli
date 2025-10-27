<template>
  <div class="bono-card bg-[#F9F7F3] border-2 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
    :class="[borderColor, { 'opacity-60': bono.estado === 'cancelado' }]"
  >
    <!-- Header del bono -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-2xl">🎫</span>
          <h3 class="font-['Lora'] text-xl font-semibold text-[#5D4A44]">
            Bono {{ tipoTexto }}
          </h3>
        </div>
        
        <!-- Estado del bono -->
        <div class="flex items-center gap-2">
          <span 
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
            :class="estadoColor"
          >
            {{ estadoIcono }} {{ estadoTexto }}
          </span>
          
          <!-- Alerta de vencimiento próximo -->
          <span 
            v-if="proximoAVencer"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300"
          >
            ⚠️ Vence pronto
          </span>
          
          <!-- Alerta de pocas sesiones -->
          <span 
            v-if="pocasSesiones"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300"
          >
            📊 Pocas sesiones
          </span>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="flex gap-2">
        <button
          v-if="puedeVerPagos"
          @click="$emit('verPagos', bono)"
          class="p-2 hover:bg-[#D8AFA0]/20 rounded-lg transition-colors"
          title="Ver pagos"
        >
          <span class="text-lg">💰</span>
        </button>
        <button
          v-if="puedeRenovar"
          @click="$emit('renovar', bono)"
          class="p-2 hover:bg-[#D8AFA0]/20 rounded-lg transition-colors"
          title="Renovar bono"
        >
          <span class="text-lg">🔄</span>
        </button>
      </div>
    </div>

    <!-- Progreso de sesiones -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-[#5D4A44]/70">Sesiones</span>
        <span class="text-sm font-semibold text-[#5D4A44]">
          {{ sesionesRestantes }} / {{ bono.sesiones_totales }} disponibles
        </span>
      </div>
      
      <!-- Barra de progreso -->
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div 
          class="h-3 rounded-full transition-all duration-500"
          :class="barraProgresoColor"
          :style="{ width: porcentajeUsado + '%' }"
        ></div>
      </div>
      
      <div class="flex justify-between mt-1 text-xs text-[#5D4A44]/60">
        <span>{{ sesionesUsadas }} usadas</span>
        <span>{{ porcentajeUsado }}% completado</span>
      </div>
    </div>

    <!-- Información del bono -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <!-- Tipo y frecuencia -->
      <div class="p-3 bg-white rounded-lg border border-[#D8AFA0]/20">
        <div class="text-xs text-[#5D4A44]/60 mb-1">Tipo</div>
        <div class="text-sm font-medium text-[#5D4A44] capitalize">
          {{ bono.tipo || 'Estándar' }}
        </div>
      </div>
      
      <div class="p-3 bg-white rounded-lg border border-[#D8AFA0]/20">
        <div class="text-xs text-[#5D4A44]/60 mb-1">Frecuencia</div>
        <div class="text-sm font-medium text-[#5D4A44] capitalize">
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
