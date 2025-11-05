<template>
  <div
    v-if="mostrar"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="cerrar"
  >
    <div class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
      <!-- Efectos decorativos -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#5550F2]/5 via-transparent to-[#04BF9D]/5 pointer-events-none"></div>
      <div class="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#F2B33D]/20 to-[#5550F2]/20 rounded-full blur-2xl"></div>
      
      <!-- Contenido con scroll -->
      <div class="relative max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-8 py-6 z-10">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-4 mb-3">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5550F2] to-[#027368] shadow-lg flex items-center justify-center">
                  <span class="text-2xl">💰</span>
                </div>
                <h2 class="text-3xl font-['Elms_Sans'] font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent">
                  Pagos del Bono
                </h2>
              </div>
              <p class="text-sm font-['Lato'] text-gray-600 ml-18">
                Gestiona los pagos y confirma transacciones de forma segura
              </p>
            </div>
            <button
              @click="cerrar"
              class="p-3 text-gray-500 hover:text-[#5550F2] hover:bg-gradient-to-br from-[#5550F2]/10 to-[#027368]/10 rounded-2xl transition-all duration-300 backdrop-blur-sm border border-white/50 hover:shadow-lg"
              aria-label="Cerrar modal"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Resumen del bono -->
          <div v-if="bono" class="mt-6 p-6 bg-gradient-to-r from-[#5550F2]/5 via-[#027368]/5 to-[#04BF9D]/5 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
            <div class="grid grid-cols-3 gap-6 text-sm">
              <div class="text-center">
                <div class="text-xs font-['Lato'] text-gray-500 uppercase tracking-wider mb-2">Tipo</div>
                <div class="font-['Lato'] font-semibold text-gray-800 capitalize text-lg">{{ bono.tipo }}</div>
              </div>
              <div class="text-center">
                <div class="text-xs font-['Lato'] text-gray-500 uppercase tracking-wider mb-2">Monto Total</div>
                <div class="font-['Elms_Sans'] font-bold bg-gradient-to-r from-[#F2B33D] to-[#5550F2] bg-clip-text text-transparent text-2xl">{{ formatearMonto(bono.monto) }}</div>
              </div>
              <div class="text-center">
                <div class="text-xs font-['Lato'] text-gray-500 uppercase tracking-wider mb-2">Estado</div>
                <div class="font-['Lato'] font-semibold text-lg capitalize"
                  :class="bono.pagado ? 'text-[#04BF9D]' : 'text-[#F2B33D]'"
                >
                  {{ bono.pagado ? '✓ Pagado' : '⏳ Pendiente' }}
                </div>
              </div>
            </div>
          </div>
      </div>

      <!-- Contenido -->
      <div class="px-6 py-6 space-y-6">
        <!-- Resumen de Pagos -->
        <div class="p-4 bg-white border-2 border-[#D8AFA0]/30 rounded-xl">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-green-600">{{ formatearMonto(totalPagado) }}</div>
              <div class="text-xs text-[#5D4A44]/60 mt-1">Total Pagado</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-orange-600">{{ formatearMonto(montoPendiente) }}</div>
              <div class="text-xs text-[#5D4A44]/60 mt-1">Pendiente</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-[#5D4A44]">{{ pagos.length }}</div>
              <div class="text-xs text-[#5D4A44]/60 mt-1">Transacciones</div>
            </div>
          </div>

          <!-- Barra de progreso de pago -->
          <div class="mt-4">
            <div class="flex justify-between text-xs text-[#5D4A44]/60 mb-1">
              <span>Progreso de pago</span>
              <span>{{ porcentajePagado }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="h-2 rounded-full transition-all duration-500"
                :class="porcentajePagado >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-[#D8AFA0] to-[#ECC8BA]'"
                :style="{ width: Math.min(porcentajePagado, 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Botón Nuevo Pago (solo staff) -->
        <div v-if="puedeGestionarBonos" class="flex justify-end">
          <button
            @click="mostrarFormularioPago = !mostrarFormularioPago"
            class="px-4 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors font-medium flex items-center gap-2"
          >
            <span>{{ mostrarFormularioPago ? '✕' : '+' }}</span>
            <span>{{ mostrarFormularioPago ? 'Cancelar' : 'Registrar Pago' }}</span>
          </button>
        </div>

        <!-- Formulario de Nuevo Pago -->
        <div v-if="mostrarFormularioPago" class="p-5 bg-green-50 border-2 border-green-300 rounded-xl">
          <h3 class="font-['Lora'] text-lg font-semibold text-[#5D4A44] mb-4 flex items-center gap-2">
            <span>💳</span>
            Registrar Nuevo Pago
          </h3>

          <form @submit.prevent="registrarNuevoPago" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[#5D4A44] mb-2">
                  Monto <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5D4A44]/60">€</span>
                  <input
                    v-model.number="nuevoPago.monto"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    class="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-[#5D4A44] mb-2">
                  Método de Pago <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="nuevoPago.metodo"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white"
                >
                  <option value="">Seleccionar método</option>
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="transferencia">🏦 Transferencia</option>
                  <option value="tarjeta">💳 Tarjeta</option>
                  <option value="bizum">📱 Bizum</option>
                  <option value="paypal">🅿️ PayPal</option>
                </select>
              </div>
            </div>

            <!-- Confirmar pago inmediatamente (solo coordinadora) -->
            <div v-if="puedeConfirmarPagos" class="flex items-center gap-2 p-3 bg-white border border-green-300 rounded-lg">
              <input
                v-model="nuevoPago.confirmado"
                type="checkbox"
                id="confirmar-pago"
                class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label for="confirmar-pago" class="text-sm text-[#5D4A44] cursor-pointer">
                ✓ Confirmar pago inmediatamente (ya verificado)
              </label>
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                @click="mostrarFormularioPago = false"
                class="flex-1 px-4 py-2 bg-white border border-gray-300 text-[#5D4A44] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                :disabled="guardandoPago"
              >
                {{ guardandoPago ? 'Registrando...' : 'Guardar Pago' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Lista de Pagos -->
        <div>
          <h3 class="font-['Lora'] text-lg font-semibold text-[#5D4A44] mb-4 flex items-center gap-2">
            <span>📜</span>
            Historial de Pagos ({{ pagos.length }})
          </h3>

          <div v-if="cargando" class="text-center py-8">
            <div class="animate-spin w-10 h-10 border-4 border-[#D8AFA0] border-t-transparent rounded-full mx-auto mb-3"></div>
            <p class="text-[#5D4A44]/60">Cargando pagos...</p>
          </div>

          <div v-else-if="pagos.length === 0" class="text-center py-12">
            <span class="text-6xl mb-3 block opacity-40">💸</span>
            <p class="text-[#5D4A44]/60">No hay pagos registrados aún</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="pago in pagosOrdenados"
              :key="pago.id"
              class="p-4 border-2 rounded-lg transition-all"
              :class="pago.confirmado 
                ? 'bg-green-50 border-green-300' 
                : 'bg-yellow-50 border-yellow-300'"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-2xl font-bold" :class="pago.confirmado ? 'text-green-600' : 'text-yellow-600'">
                      {{ formatearMonto(pago.monto) }}
                    </span>
                    <span class="px-2 py-1 rounded-full text-xs font-medium capitalize"
                      :class="pago.confirmado 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-yellow-200 text-yellow-800'"
                    >
                      {{ pago.confirmado ? '✓ Confirmado' : '⏳ Pendiente' }}
                    </span>
                  </div>

                  <div class="space-y-1 text-sm text-[#5D4A44]/70">
                    <div class="flex items-center gap-2">
                      <span>💳</span>
                      <span class="capitalize">{{ obtenerMetodoPagoTexto(pago.metodo_pago) }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span>📅</span>
                      <span>{{ formatearFecha(pago.fecha_pago) }}</span>
                    </div>
                    <div v-if="pago.confirmado && pago.fecha_confirmacion" class="flex items-center gap-2">
                      <span>✅</span>
                      <span>Confirmado el {{ formatearFecha(pago.fecha_confirmacion) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Botón confirmar (solo coordinadora y si no está confirmado) -->
                <div v-if="puedeConfirmarPagos && !pago.confirmado">
                  <button
                    @click="confirmarPagoExistente(pago.id)"
                    class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    :disabled="confirmandoPago === pago.id"
                  >
                    {{ confirmandoPago === pago.id ? 'Confirmando...' : '✓ Confirmar' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="errorMensaje" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-700 flex items-center gap-2">
            <span>❌</span>
            {{ errorMensaje }}
          </p>
        </div>

        <!-- Mensaje de éxito -->
        <div v-if="exitoMensaje" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-700 flex items-center gap-2">
            <span>✅</span>
            {{ exitoMensaje }}
          </p>
        </div>
      </div>

      <!-- Footer con botón cerrar -->
      <div class="sticky bottom-0 bg-[#F9F7F3] border-t border-[#D8AFA0]/30 px-6 py-4">
        <button
          @click="cerrar"
          class="w-full px-6 py-3 bg-[#5D4A44] text-white rounded-lg hover:bg-[#4A3A34] transition-colors font-medium"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  mostrar: boolean
  bono: any
}>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const { getPagosPorBono, registrarPago, confirmarPago, puedeGestionarBonos, puedeConfirmarPagos } = useBonos()

// Estado
const pagos = ref<any[]>([])
const cargando = ref(false)
const mostrarFormularioPago = ref(false)
const guardandoPago = ref(false)
const confirmandoPago = ref<string | null>(null)
const errorMensaje = ref('')
const exitoMensaje = ref('')

const nuevoPago = ref({
  monto: 0,
  metodo: '',
  confirmado: false
})

// Computed
const pagosOrdenados = computed(() => {
  return [...pagos.value].sort((a, b) => {
    return new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime()
  })
})

const totalPagado = computed(() => {
  return pagos.value
    .filter(p => p.confirmado)
    .reduce((sum, p) => sum + (p.monto || 0), 0)
})

const montoPendiente = computed(() => {
  const total = props.bono?.monto || 0
  return Math.max(0, total - totalPagado.value)
})

const porcentajePagado = computed(() => {
  const total = props.bono?.monto || 0
  if (total === 0) return 0
  return Math.round((totalPagado.value / total) * 100)
})

// Métodos
const cargarPagos = async () => {
  if (!props.bono?.id) return

  try {
    cargando.value = true
    errorMensaje.value = ''
    pagos.value = await getPagosPorBono(props.bono.id)
  } catch (err: any) {
    console.error('[ModalPagosBono] Error al cargar pagos:', err)
    errorMensaje.value = 'Error al cargar los pagos'
  } finally {
    cargando.value = false
  }
}

const registrarNuevoPago = async () => {
  if (!props.bono?.id || !nuevoPago.value.monto || !nuevoPago.value.metodo) {
    errorMensaje.value = 'Por favor completa todos los campos'
    return
  }

  try {
    guardandoPago.value = true
    errorMensaje.value = ''
    exitoMensaje.value = ''

    await registrarPago(
      props.bono.id,
      nuevoPago.value.monto,
      nuevoPago.value.metodo,
      nuevoPago.value.confirmado
    )

    exitoMensaje.value = 'Pago registrado correctamente'
    mostrarFormularioPago.value = false
    
    // Resetear formulario
    nuevoPago.value = {
      monto: 0,
      metodo: '',
      confirmado: false
    }

    // Recargar pagos
    await cargarPagos()
    emit('updated')

    // Limpiar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      exitoMensaje.value = ''
    }, 3000)
  } catch (err: any) {
    console.error('[ModalPagosBono] Error al registrar pago:', err)
    errorMensaje.value = err.message || 'Error al registrar el pago'
  } finally {
    guardandoPago.value = false
  }
}

const confirmarPagoExistente = async (pagoId: string) => {
  try {
    confirmandoPago.value = pagoId
    errorMensaje.value = ''
    exitoMensaje.value = ''

    const resultado = await confirmarPago(pagoId)

    exitoMensaje.value = resultado.mensaje || 'Pago confirmado correctamente'

    // Recargar pagos
    await cargarPagos()
    emit('updated')

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      exitoMensaje.value = ''
    }, 3000)
  } catch (err: any) {
    console.error('[ModalPagosBono] Error al confirmar pago:', err)
    errorMensaje.value = err.message || 'Error al confirmar el pago'
  } finally {
    confirmandoPago.value = null
  }
}

const cerrar = () => {
  errorMensaje.value = ''
  exitoMensaje.value = ''
  mostrarFormularioPago.value = false
  emit('close')
}

const formatearFecha = (fecha: string) => {
  if (!fecha) return ''
  try {
    const date = new Date(fecha)
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
  if (!monto) return '€ 0.00'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(monto)
}

const obtenerMetodoPagoTexto = (metodo: string) => {
  const textos: Record<string, string> = {
    'efectivo': 'Efectivo',
    'transferencia': 'Transferencia Bancaria',
    'tarjeta': 'Tarjeta de Crédito/Débito',
    'bizum': 'Bizum',
    'paypal': 'PayPal'
  }
  return textos[metodo] || metodo
}

// Watch
watch(() => props.mostrar, (nuevoValor) => {
  if (nuevoValor) {
    cargarPagos()
  }
}, { immediate: true })
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
