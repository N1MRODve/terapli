<script setup lang="ts">
/**
 * FacturaForm.vue
 * Formulario para datos fiscales del cliente en una factura.
 * Incluye cálculo automático de impuestos en tiempo real.
 */

import { ref, computed, watch } from 'vue'
import type { TipoCliente, RegimenIVA, CalculoImpuestos } from '~/composables/useFacturas'

interface Props {
  baseImponible: number
  regimenIVA?: RegimenIVA
  initialTipoCliente?: TipoCliente
  initialDatosEmpresa?: {
    nombre: string
    nif: string
    direccion: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  regimenIVA: 'exento',
  initialTipoCliente: 'particular',
  initialDatosEmpresa: () => ({ nombre: '', nif: '', direccion: '' })
})

const emit = defineEmits<{
  update: [data: {
    tipoCliente: TipoCliente
    datosEmpresa: { nombre: string; nif: string; direccion: string } | null
    calculo: CalculoImpuestos
  }]
}>()

// Estado local
const tipoCliente = ref<TipoCliente>(props.initialTipoCliente)
const datosEmpresa = ref({
  nombre: props.initialDatosEmpresa.nombre,
  nif: props.initialDatosEmpresa.nif,
  direccion: props.initialDatosEmpresa.direccion
})
const nifError = ref<string | null>(null)

// Importar funciones del composable
const { calcularImpuestos, validarNIF, formatearImporte } = useFacturas()

// Cálculo de impuestos reactivo
const calculo = computed<CalculoImpuestos>(() => {
  return calcularImpuestos(
    props.baseImponible,
    tipoCliente.value,
    props.regimenIVA
  )
})

// Validar NIF cuando cambia
function handleNifBlur() {
  if (tipoCliente.value === 'empresa' && datosEmpresa.value.nif) {
    if (!validarNIF(datosEmpresa.value.nif)) {
      nifError.value = 'NIF/CIF no válido'
    } else {
      nifError.value = null
    }
  } else {
    nifError.value = null
  }
}

// Emitir cambios
function emitUpdate() {
  emit('update', {
    tipoCliente: tipoCliente.value,
    datosEmpresa: tipoCliente.value === 'empresa' ? datosEmpresa.value : null,
    calculo: calculo.value
  })
}

// Watch para emitir cambios
watch([tipoCliente, datosEmpresa, () => props.baseImponible], () => {
  emitUpdate()
}, { deep: true, immediate: true })

// Descripción del régimen IVA
const descripcionIVA = computed(() => {
  if (tipoCliente.value === 'empresa') {
    return 'IVA 21% + Retención IRPF 15%'
  }
  if (props.regimenIVA === 'exento') {
    return 'Exento de IVA (Art. 20.1.3º LIVA - Servicios sanitarios)'
  }
  return 'IVA 21%'
})
</script>

<template>
  <div class="space-y-5">
    <!-- Tipo de cliente -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-3">
        Tipo de cliente
      </label>
      <div class="grid grid-cols-2 gap-3">
        <label
          class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all"
          :class="tipoCliente === 'particular'
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-200 hover:border-gray-300'"
        >
          <input
            type="radio"
            v-model="tipoCliente"
            value="particular"
            class="w-4 h-4 text-purple-600 focus:ring-purple-500"
          />
          <div>
            <span class="text-sm font-medium text-gray-900">Particular</span>
            <p class="text-xs text-gray-500">Persona física</p>
          </div>
        </label>
        <label
          class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all"
          :class="tipoCliente === 'empresa'
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-200 hover:border-gray-300'"
        >
          <input
            type="radio"
            v-model="tipoCliente"
            value="empresa"
            class="w-4 h-4 text-purple-600 focus:ring-purple-500"
          />
          <div>
            <span class="text-sm font-medium text-gray-900">Empresa</span>
            <p class="text-xs text-gray-500">Persona jurídica</p>
          </div>
        </label>
      </div>
    </div>

    <!-- Datos de empresa (solo si tipo = empresa) -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="tipoCliente === 'empresa'" class="space-y-4 overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Razón social -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Razón social <span class="text-red-500">*</span>
            </label>
            <input
              v-model="datosEmpresa.nombre"
              type="text"
              placeholder="Nombre de la empresa"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <!-- CIF -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              CIF <span class="text-red-500">*</span>
            </label>
            <input
              v-model="datosEmpresa.nif"
              type="text"
              placeholder="B12345678"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 uppercase"
              :class="nifError ? 'border-red-300 bg-red-50' : 'border-gray-300'"
              @blur="handleNifBlur"
              required
            />
            <p v-if="nifError" class="mt-1 text-xs text-red-600">{{ nifError }}</p>
          </div>
        </div>

        <!-- Dirección fiscal -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Dirección fiscal <span class="text-red-500">*</span>
          </label>
          <input
            v-model="datosEmpresa.direccion"
            type="text"
            placeholder="Calle, número, CP, Ciudad"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>
      </div>
    </Transition>

    <!-- Desglose de impuestos -->
    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Desglose de factura</h4>

      <div class="space-y-2 text-sm">
        <!-- Base imponible -->
        <div class="flex justify-between">
          <span class="text-gray-600">Base imponible:</span>
          <span class="font-medium text-gray-900">{{ formatearImporte(calculo.baseImponible) }}</span>
        </div>

        <!-- IVA -->
        <div class="flex justify-between">
          <span class="text-gray-600">
            IVA ({{ calculo.porcentajeIVA }}%):
          </span>
          <span class="font-medium" :class="calculo.importeIVA > 0 ? 'text-gray-900' : 'text-gray-400'">
            {{ calculo.importeIVA > 0 ? '+' : '' }}{{ formatearImporte(calculo.importeIVA) }}
          </span>
        </div>

        <!-- IRPF (solo empresas) -->
        <div v-if="tipoCliente === 'empresa'" class="flex justify-between">
          <span class="text-gray-600">
            Retención IRPF ({{ calculo.porcentajeIRPF }}%):
          </span>
          <span class="font-medium text-red-600">
            -{{ formatearImporte(calculo.importeIRPF) }}
          </span>
        </div>

        <!-- Separador -->
        <div class="border-t border-gray-300 my-2"></div>

        <!-- Total -->
        <div class="flex justify-between text-base">
          <span class="font-semibold text-gray-900">TOTAL:</span>
          <span class="font-bold text-purple-600">{{ formatearImporte(calculo.total) }}</span>
        </div>
      </div>

      <!-- Nota sobre el régimen -->
      <p class="mt-3 text-xs text-gray-500 flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ descripcionIVA }}
      </p>
    </div>
  </div>
</template>
