<template>
  <div
    v-if="mostrar"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="cerrar"
  >
    <div class="bg-[#F2F2F2] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-[#F2F2F2] border-b border-[#5550F2]/30 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-serif text-[#2D3748] font-semibold flex items-center gap-2">
            <span class="text-2xl">🔄</span>
            Renovar Bono
          </h2>
          <p class="text-sm text-[#2D3748]/60 mt-1">
            Crea una nueva renovación basada en el bono actual
          </p>
        </div>
        <button
          @click="cerrar"
          class="text-[#2D3748] hover:text-[#5550F2] transition-colors"
          aria-label="Cerrar modal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Contenido -->
      <div class="px-6 py-6 space-y-6">
        <!-- Resumen del Bono Actual -->
        <div class="p-5 bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-300 rounded-xl">
          <h3 class="font-serif text-lg font-semibold text-[#2D3748] mb-4 flex items-center gap-2">
            <span>📋</span>
            Bono Actual
          </h3>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="p-3 bg-white rounded-lg">
              <div class="text-[#2D3748]/60 mb-1">Tipo</div>
              <div class="font-medium text-[#2D3748] capitalize">{{ bono.tipo }}</div>
            </div>
            <div class="p-3 bg-white rounded-lg">
              <div class="text-[#2D3748]/60 mb-1">Frecuencia</div>
              <div class="font-medium text-[#2D3748] capitalize">{{ bono.frecuencia }}</div>
            </div>
            <div class="p-3 bg-white rounded-lg">
              <div class="text-[#2D3748]/60 mb-1">Sesiones Totales</div>
              <div class="font-medium text-[#2D3748]">{{ bono.sesiones_totales }}</div>
            </div>
            <div class="p-3 bg-white rounded-lg">
              <div class="text-[#2D3748]/60 mb-1">Sesiones Restantes</div>
              <div class="font-medium text-[#2D3748]">{{ bono.sesiones_restantes || 0 }}</div>
            </div>
            <div class="p-3 bg-white rounded-lg">
              <div class="text-[#2D3748]/60 mb-1">Monto</div>
              <div class="font-bold text-[#5550F2] text-lg">{{ formatearMonto(bono.monto) }}</div>
            </div>
            <div class="p-3 bg-white rounded-lg">
              <div class="text-[#2D3748]/60 mb-1">Estado</div>
              <div class="font-medium capitalize"
                :class="estadoColor"
              >
                {{ bono.estado }}
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario de Renovación -->
        <form @submit.prevent="renovar" class="space-y-5">
          <div class="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl">
            <h3 class="font-serif text-lg font-semibold text-[#2D3748] mb-4 flex items-center gap-2">
              <span>✨</span>
              Datos del Nuevo Bono
            </h3>

            <!-- Opción: Mantener valores -->
            <div class="mb-5 p-3 bg-white border border-purple-200 rounded-lg">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="mantenerValoresOriginales"
                  type="checkbox"
                  class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div>
                  <div class="text-sm font-medium text-[#2D3748]">
                    Mantener los mismos valores del bono original
                  </div>
                  <div class="text-xs text-[#2D3748]/60 mt-1">
                    Si lo desmarcas, podrás personalizar las sesiones y el monto
                  </div>
                </div>
              </label>
            </div>

            <!-- Campos personalizables -->
            <div v-if="!mantenerValoresOriginales" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[#2D3748] mb-2">
                    Sesiones Totales
                  </label>
                  <input
                    v-model.number="formData.sesiones_nuevas"
                    type="number"
                    min="1"
                    max="100"
                    required
                    class="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#2D3748] mb-2">
                    Monto Total
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/60">€</span>
                    <input
                      v-model.number="formData.monto_nuevo"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                      class="w-full pl-8 pr-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div class="p-3 bg-purple-100 rounded-lg text-sm">
                <div class="flex justify-between mb-1">
                  <span class="text-[#2D3748]/70">Precio por sesión (nuevo):</span>
                  <span class="font-bold text-purple-700">€{{ precioSesionNuevo }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#2D3748]/70">Precio por sesión (original):</span>
                  <span class="font-medium text-[#2D3748]/60">€{{ precioSesionOriginal }}</span>
                </div>
              </div>
            </div>

            <div v-else class="p-4 bg-green-50 border border-green-300 rounded-lg">
              <p class="text-sm text-green-700 flex items-center gap-2">
                <span>✓</span>
                Se duplicarán los valores originales: <strong>{{ bono.sesiones_totales }} sesiones</strong> por <strong>{{ formatearMonto(bono.monto) }}</strong>
              </p>
            </div>
          </div>

          <!-- Motivo de la renovación -->
          <div>
            <label class="block text-sm font-medium text-[#2D3748] mb-2">
              Motivo de la Renovación (Opcional)
            </label>
            <textarea
              v-model="formData.motivo"
              rows="3"
              placeholder="Explica por qué se renueva este bono..."
              class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5550F2] resize-none"
            ></textarea>
          </div>

          <!-- Información importante -->
          <div class="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <h4 class="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <span>ℹ️</span>
              Información Importante
            </h4>
            <ul class="text-sm text-blue-800 space-y-1.5">
              <li class="flex items-start gap-2">
                <span class="mt-0.5">•</span>
                <span>El bono actual se marcará como <strong>completado</strong></span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-0.5">•</span>
                <span>Se creará un <strong>nuevo bono</strong> con estado <strong>pendiente</strong> hasta que se confirme el pago</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-0.5">•</span>
                <span>La fecha de inicio será <strong>hoy</strong> y la de vencimiento se calculará automáticamente</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-0.5">•</span>
                <span>Se guardará un registro en el historial de renovaciones</span>
              </li>
            </ul>
          </div>

          <!-- Mensajes de error -->
          <div v-if="errorMensaje" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700 flex items-center gap-2">
              <span>❌</span>
              {{ errorMensaje }}
            </p>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-3 pt-4 border-t border-[#5550F2]/30">
            <button
              type="button"
              @click="cerrar"
              class="flex-1 px-6 py-3 bg-white border border-[#5550F2]/30 text-[#2D3748] rounded-lg hover:bg-[#5550F2]/10 transition-colors font-medium"
              :disabled="renovando"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="renovando"
            >
              <span v-if="renovando">⏳</span>
              <span v-else>🔄</span>
              <span>{{ renovando ? 'Renovando...' : 'Confirmar Renovación' }}</span>
            </button>
          </div>
        </form>
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
  renovated: [nuevoBono: any]
}>()

const { renovarBono } = useBonos()

// Estado
const mantenerValoresOriginales = ref(true)
const renovando = ref(false)
const errorMensaje = ref('')

const formData = ref({
  sesiones_nuevas: props.bono?.sesiones_totales || 0,
  monto_nuevo: props.bono?.monto || 0,
  motivo: ''
})

// Computed
const estadoColor = computed(() => {
  const colores: Record<string, string> = {
    'pendiente': 'text-yellow-600',
    'activo': 'text-green-600',
    'completado': 'text-gray-600',
    'vencido': 'text-red-600',
    'cancelado': 'text-gray-500'
  }
  return colores[props.bono?.estado] || 'text-gray-600'
})

const precioSesionOriginal = computed(() => {
  if (!props.bono?.sesiones_totales || !props.bono?.monto) return '0.00'
  const precio = props.bono.monto / props.bono.sesiones_totales
  return precio.toFixed(2)
})

const precioSesionNuevo = computed(() => {
  if (!formData.value.sesiones_nuevas || !formData.value.monto_nuevo) return '0.00'
  const precio = formData.value.monto_nuevo / formData.value.sesiones_nuevas
  return precio.toFixed(2)
})

// Métodos
const cerrar = () => {
  if (!renovando.value) {
    errorMensaje.value = ''
    emit('close')
  }
}

const renovar = async () => {
  if (!props.bono?.id) {
    errorMensaje.value = 'Bono no válido'
    return
  }

  try {
    renovando.value = true
    errorMensaje.value = ''

    const sesionesNuevas = mantenerValoresOriginales.value 
      ? null 
      : formData.value.sesiones_nuevas

    const montoNuevo = mantenerValoresOriginales.value 
      ? null 
      : formData.value.monto_nuevo

    const resultado = await renovarBono(
      props.bono.id,
      formData.value.motivo || 'Renovación manual solicitada',
      sesionesNuevas,
      montoNuevo
    )

    emit('renovated', resultado)
    emit('close')

    // Resetear formulario
    formData.value = {
      sesiones_nuevas: props.bono?.sesiones_totales || 0,
      monto_nuevo: props.bono?.monto || 0,
      motivo: ''
    }
    mantenerValoresOriginales.value = true
  } catch (err: any) {
    console.error('[ModalRenovacionBono] Error al renovar:', err)
    errorMensaje.value = err.message || 'Error al renovar el bono. Inténtalo de nuevo.'
  } finally {
    renovando.value = false
  }
}

const formatearMonto = (monto: number | null) => {
  if (!monto) return '€ 0.00'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(monto)
}

// Watch: Actualizar valores del formulario cuando cambia el bono
watch(() => props.bono, (nuevoBono) => {
  if (nuevoBono) {
    formData.value.sesiones_nuevas = nuevoBono.sesiones_totales || 0
    formData.value.monto_nuevo = nuevoBono.monto || 0
  }
}, { immediate: true })
</script>
