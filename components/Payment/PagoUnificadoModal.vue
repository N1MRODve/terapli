<script setup lang="ts">
/**
 * PagoUnificadoModal.vue
 * Modal completo para registrar pagos con opción de generar factura.
 * Integra: selector de paciente, monto, método, bono, y facturación.
 */

import { ref, computed, watch } from 'vue'
import { XMarkIcon, UserIcon, CurrencyEuroIcon, DocumentTextIcon, TicketIcon } from '@heroicons/vue/24/outline'
import type { PaymentMethod } from '~/components/Payment/PaymentMethodSelector.vue'
import type { TipoCliente, CalculoImpuestos } from '~/composables/useFacturas'

interface Props {
  visible: boolean
  pacienteIdPreseleccionado?: string
  bonoIdPreseleccionado?: string
  montoInicial?: number
}

const props = withDefaults(defineProps<Props>(), {
  pacienteIdPreseleccionado: undefined,
  bonoIdPreseleccionado: undefined,
  montoInicial: undefined
})

const emit = defineEmits<{
  close: []
  saved: [data: { pagoId: string; facturaId?: string }]
}>()

// Composables
const { searchPacientes, pacientes, loading: loadingPacientes } = usePacientes()
const { crearPago, getBonosPendientesPago } = usePagosRegistros()
const { crearFactura, obtenerRegimenIVA, getProximoNumero } = useFacturas()
const { success: toastSuccess, error: toastError } = useToast()
const { userProfile, waitForUser } = useSupabase()

// Estado del formulario
const paso = ref<'datos' | 'factura' | 'confirmacion'>('datos')
const guardando = ref(false)
const usuarioListo = ref(false)

// Datos del pago
const pacienteId = ref<string | null>(props.pacienteIdPreseleccionado || null)
const pacienteNombre = ref('')
const busquedaPaciente = ref('')
const mostrarListaPacientes = ref(false)
const fechaPago = ref(new Date().toISOString().split('T')[0])
const monto = ref<number>(props.montoInicial || 0)
const metodoPago = ref<PaymentMethod | null>(null)
const concepto = ref('')
const bonoId = ref<string | null>(props.bonoIdPreseleccionado || null)
const bonosPaciente = ref<any[]>([])

// Datos de facturación
const generarFactura = ref(false)
const tipoCliente = ref<TipoCliente>('particular')
const datosEmpresa = ref({ nombre: '', nif: '', direccion: '' })
const calculoImpuestos = ref<CalculoImpuestos | null>(null)
const regimenIVA = ref<'exento' | 'general'>('exento')
const proximoNumeroFactura = ref<string | null>(null)

// Cargar régimen IVA al montar y esperar usuario
onMounted(async () => {
  // Esperar a que el usuario esté autenticado
  await waitForUser()
  usuarioListo.value = true

  regimenIVA.value = await obtenerRegimenIVA()
  proximoNumeroFactura.value = await getProximoNumero()

  // Si hay paciente preseleccionado, cargarlo
  if (props.pacienteIdPreseleccionado) {
    await cargarBonosPaciente(props.pacienteIdPreseleccionado)
  }
})

// Buscar pacientes cuando cambia el texto (solo si el usuario está listo)
watch(busquedaPaciente, async (query) => {
  // Esperar a que el usuario esté listo si aún no lo está
  if (!usuarioListo.value) {
    await waitForUser()
    usuarioListo.value = true
  }

  if (query.length >= 2) {
    searchPacientes(query)
    mostrarListaPacientes.value = true
  } else if (query.length === 0 && !pacienteId.value) {
    searchPacientes('')
    mostrarListaPacientes.value = true
  }
})

// Cargar bonos cuando se selecciona paciente
async function cargarBonosPaciente(id: string) {
  bonosPaciente.value = await getBonosPendientesPago(id)

  // Si hay bono preseleccionado, pre-llenar monto
  if (props.bonoIdPreseleccionado) {
    const bono = bonosPaciente.value.find(b => b.id === props.bonoIdPreseleccionado)
    if (bono) {
      bonoId.value = bono.id
      monto.value = bono.monto_total
      concepto.value = `Pago de bono ${bono.tipo} (${bono.sesiones_totales} sesiones)`
    }
  }
}

// Seleccionar paciente
function seleccionarPaciente(paciente: any) {
  pacienteId.value = paciente.id
  pacienteNombre.value = paciente.nombre_completo
  busquedaPaciente.value = paciente.nombre_completo
  mostrarListaPacientes.value = false
  cargarBonosPaciente(paciente.id)
}

// Limpiar paciente
function limpiarPaciente() {
  pacienteId.value = null
  pacienteNombre.value = ''
  busquedaPaciente.value = ''
  bonosPaciente.value = []
  bonoId.value = null
}

// Seleccionar bono
function seleccionarBono(bono: any) {
  if (bonoId.value === bono.id) {
    // Deseleccionar
    bonoId.value = null
  } else {
    bonoId.value = bono.id
    monto.value = bono.monto_total
    concepto.value = `Pago de bono ${bono.tipo} (${bono.sesiones_totales} sesiones)`
  }
}

// Actualizar cálculos de factura
function handleFacturaUpdate(data: { tipoCliente: TipoCliente; datosEmpresa: any; calculo: CalculoImpuestos }) {
  tipoCliente.value = data.tipoCliente
  datosEmpresa.value = data.datosEmpresa || { nombre: '', nif: '', direccion: '' }
  calculoImpuestos.value = data.calculo
}

// Validar paso actual
const puedeAvanzar = computed(() => {
  if (paso.value === 'datos') {
    return pacienteId.value && monto.value > 0 && metodoPago.value
  }
  if (paso.value === 'factura') {
    if (!generarFactura.value) return true
    if (tipoCliente.value === 'empresa') {
      return datosEmpresa.value.nombre && datosEmpresa.value.nif && datosEmpresa.value.direccion
    }
    return true
  }
  return true
})

// Avanzar al siguiente paso
function siguientePaso() {
  if (paso.value === 'datos') {
    paso.value = 'factura'
  } else if (paso.value === 'factura') {
    paso.value = 'confirmacion'
  }
}

// Volver al paso anterior
function pasoAnterior() {
  if (paso.value === 'confirmacion') {
    paso.value = 'factura'
  } else if (paso.value === 'factura') {
    paso.value = 'datos'
  }
}

// Guardar pago
async function guardarPago() {
  if (!pacienteId.value || !metodoPago.value) return

  guardando.value = true

  try {
    // 1. Crear el registro de pago
    const resultPago = await crearPago({
      pacienteId: pacienteId.value,
      fechaPago: fechaPago.value,
      monto: monto.value,
      metodoPago: metodoPago.value,
      concepto: concepto.value || undefined,
      bonoId: bonoId.value || undefined
    })

    if (!resultPago.success) {
      throw new Error(resultPago.error || 'Error al crear el pago')
    }

    let facturaId: string | undefined

    // 2. Crear factura si está activado
    if (generarFactura.value && resultPago.data) {
      const resultFactura = await crearFactura({
        pacienteId: pacienteId.value,
        tipoCliente: tipoCliente.value,
        receptorNombre: tipoCliente.value === 'empresa' ? datosEmpresa.value.nombre : pacienteNombre.value,
        receptorNif: tipoCliente.value === 'empresa' ? datosEmpresa.value.nif : undefined,
        receptorDireccion: tipoCliente.value === 'empresa' ? datosEmpresa.value.direccion : undefined,
        concepto: concepto.value || `Sesión de psicoterapia`,
        baseImponible: monto.value,
        bonoId: bonoId.value || undefined,
        pagoId: resultPago.data.id
      })

      if (resultFactura.success && resultFactura.data) {
        facturaId = resultFactura.data.id
      }
    }

    toastSuccess(generarFactura.value ? 'Pago y factura registrados' : 'Pago registrado')
    emit('saved', { pagoId: resultPago.data!.id, facturaId })
    cerrar()
  } catch (err: any) {
    console.error('[PagoUnificadoModal] Error:', err)
    toastError(err.message || 'Error al guardar el pago')
  } finally {
    guardando.value = false
  }
}

// Cerrar modal
function cerrar() {
  paso.value = 'datos'
  pacienteId.value = null
  pacienteNombre.value = ''
  busquedaPaciente.value = ''
  bonosPaciente.value = []
  bonoId.value = null
  monto.value = 0
  metodoPago.value = null
  concepto.value = ''
  generarFactura.value = false
  emit('close')
}

// Formatear importe
function formatearImporte(valor: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(valor)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="cerrar"
      >
        <div
          class="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          @click.stop
        >
          <!-- Header -->
          <div class="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                {{ paso === 'datos' ? 'Nuevo Pago' : paso === 'factura' ? 'Facturación' : 'Confirmar' }}
              </h2>
              <p class="text-sm text-gray-500">
                Paso {{ paso === 'datos' ? '1' : paso === 'factura' ? '2' : '3' }} de 3
              </p>
            </div>
            <button
              @click="cerrar"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Contenido -->
          <div class="flex-1 overflow-y-auto p-5">
            <!-- PASO 1: Datos del pago -->
            <div v-if="paso === 'datos'" class="space-y-5">
              <!-- Selector de paciente -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon class="w-4 h-4 inline mr-1" />
                  Paciente <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="busquedaPaciente"
                    type="text"
                    placeholder="Buscar paciente..."
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    @focus="mostrarListaPacientes = true"
                  />
                  <button
                    v-if="pacienteId"
                    @click="limpiarPaciente"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon class="w-4 h-4" />
                  </button>

                  <!-- Lista de pacientes -->
                  <div
                    v-if="mostrarListaPacientes && !pacienteId"
                    class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    <div v-if="loadingPacientes" class="p-3 text-center text-gray-500 text-sm">
                      Buscando...
                    </div>
                    <div v-else-if="pacientes.length === 0" class="p-3 text-center text-gray-500 text-sm">
                      No se encontraron pacientes
                    </div>
                    <button
                      v-for="p in pacientes"
                      :key="p.id"
                      class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                      @click="seleccionarPaciente(p)"
                    >
                      <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-medium">
                        {{ p.nombre_completo.charAt(0) }}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ p.nombre_completo }}</p>
                        <p class="text-xs text-gray-500">{{ p.email }}</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Bonos pendientes del paciente -->
              <div v-if="bonosPaciente.length > 0">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <TicketIcon class="w-4 h-4 inline mr-1" />
                  Bonos pendientes de pago
                </label>
                <div class="grid gap-2">
                  <button
                    v-for="bono in bonosPaciente"
                    :key="bono.id"
                    class="w-full p-3 border rounded-lg text-left transition-all"
                    :class="bonoId === bono.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'"
                    @click="seleccionarBono(bono)"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-gray-900">{{ bono.tipo }}</span>
                      <span class="text-purple-600 font-semibold">{{ formatearImporte(bono.monto_total) }}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ bono.sesiones_totales }} sesiones
                    </p>
                  </button>
                </div>
              </div>

              <!-- Fecha y monto -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Fecha
                  </label>
                  <input
                    v-model="fechaPago"
                    type="date"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <CurrencyEuroIcon class="w-4 h-4 inline mr-1" />
                    Monto <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model.number="monto"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      class="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">EUR</span>
                  </div>
                </div>
              </div>

              <!-- Método de pago -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Método de pago <span class="text-red-500">*</span>
                </label>
                <PaymentMethodSelector
                  :selected-method="metodoPago"
                  size="sm"
                  @select="metodoPago = $event"
                />
              </div>

              <!-- Concepto -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Concepto
                </label>
                <textarea
                  v-model="concepto"
                  rows="2"
                  placeholder="Describe el pago (opcional)..."
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                ></textarea>
              </div>
            </div>

            <!-- PASO 2: Facturación -->
            <div v-else-if="paso === 'factura'" class="space-y-5">
              <!-- Toggle generar factura -->
              <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div class="flex items-center gap-3">
                  <DocumentTextIcon class="w-5 h-5 text-gray-500" />
                  <div>
                    <span class="font-medium text-gray-900">Generar factura</span>
                    <p class="text-xs text-gray-500">Se creará una factura asociada a este pago</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  v-model="generarFactura"
                  class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>

              <!-- Próximo número de factura -->
              <div v-if="generarFactura && proximoNumeroFactura" class="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                Próxima factura: <strong class="text-purple-700">{{ proximoNumeroFactura }}</strong>
              </div>

              <!-- Formulario de factura -->
              <FacturaForm
                v-if="generarFactura"
                :base-imponible="monto"
                :regimen-i-v-a="regimenIVA"
                @update="handleFacturaUpdate"
              />

              <!-- Sin factura -->
              <div v-if="!generarFactura" class="text-center py-8 text-gray-500">
                <DocumentTextIcon class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No se generará factura para este pago</p>
                <p class="text-sm">Puedes generar una factura más tarde desde el historial</p>
              </div>
            </div>

            <!-- PASO 3: Confirmación -->
            <div v-else-if="paso === 'confirmacion'" class="space-y-4">
              <div class="text-center pb-4 border-b border-gray-100">
                <p class="text-3xl font-bold text-gray-900">{{ formatearImporte(monto) }}</p>
                <p class="text-gray-600 mt-1">{{ pacienteNombre }}</p>
              </div>

              <!-- Resumen -->
              <div class="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Fecha:</span>
                  <span class="font-medium">{{ new Date(fechaPago).toLocaleDateString('es-ES') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Método:</span>
                  <span class="font-medium capitalize">{{ metodoPago }}</span>
                </div>
                <div v-if="concepto" class="flex justify-between">
                  <span class="text-gray-600">Concepto:</span>
                  <span class="font-medium truncate ml-4">{{ concepto }}</span>
                </div>
                <div v-if="bonoId" class="flex justify-between">
                  <span class="text-gray-600">Bono:</span>
                  <span class="text-purple-600 font-medium">Asociado</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-gray-200">
                  <span class="text-gray-600">Factura:</span>
                  <span class="font-medium" :class="generarFactura ? 'text-green-600' : 'text-gray-400'">
                    {{ generarFactura ? 'Sí' : 'No' }}
                  </span>
                </div>
                <div v-if="generarFactura && calculoImpuestos" class="pt-2 border-t border-gray-200">
                  <div class="flex justify-between text-gray-600">
                    <span>Total factura:</span>
                    <span class="font-bold text-purple-600">{{ formatearImporte(calculoImpuestos.total) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-5 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button
              v-if="paso !== 'datos'"
              @click="pasoAnterior"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              :disabled="guardando"
            >
              Anterior
            </button>
            <button
              v-if="paso === 'datos'"
              @click="cerrar"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              v-if="paso !== 'confirmacion'"
              @click="siguientePaso"
              :disabled="!puedeAvanzar"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
            <button
              v-else
              @click="guardarPago"
              :disabled="guardando"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg v-if="guardando" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ guardando ? 'Guardando...' : 'Confirmar pago' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
