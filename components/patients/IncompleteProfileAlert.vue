<template>
  <div
    v-if="show"
    class="bg-amber-50 border border-amber-200 rounded-lg p-4"
  >
    <div class="flex gap-3">
      <ExclamationTriangleIcon class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div class="flex-1">
        <h4 class="font-semibold text-amber-900 mb-1">
          Perfil incompleto
        </h4>
        <p class="text-sm text-amber-800 mb-2">
          Este paciente tiene campos importantes sin completar:
        </p>
        <div class="flex flex-wrap gap-2 mb-3">
          <span
            v-for="field in missingFieldsLabels"
            :key="field"
            class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-medium"
          >
            <ExclamationCircleIcon class="w-3.5 h-3.5" />
            {{ field }}
          </span>
        </div>
        <p class="text-xs text-amber-700">
          Completa esta información para mejorar el seguimiento del paciente.
        </p>
      </div>
      <button
        v-if="dismissible"
        @click="dismiss"
        class="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded transition-colors"
        aria-label="Cerrar alerta"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import type { PacienteField } from '~/types/import-mapping.types'

interface Props {
  /** Array de campos faltantes */
  missingFields?: PacienteField[] | string[] | null

  /** Si se puede cerrar la alerta */
  dismissible?: boolean

  /** Estado de perfil completo del paciente */
  perfilCompleto?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  missingFields: null,
  dismissible: false,
  perfilCompleto: true
})

const emit = defineEmits<{
  'dismiss': []
}>()

// Labels para los campos
const fieldLabels: Record<string, string> = {
  email: 'Email',
  telefono: 'Teléfono',
  documento_identidad: 'Documento de Identidad',
  fecha_nacimiento: 'Fecha de Nacimiento',
  direccion: 'Dirección',
  contacto_emergencia: 'Contacto de Emergencia'
}

// Mostrar si no está completo el perfil
const show = computed(() => {
  return !props.perfilCompleto ||
    (props.missingFields && props.missingFields.length > 0)
})

// Labels de campos faltantes
const missingFieldsLabels = computed(() => {
  if (!props.missingFields) return []

  return props.missingFields.map(field => {
    return fieldLabels[field] || field
  })
})

const dismiss = () => {
  emit('dismiss')
}
</script>
