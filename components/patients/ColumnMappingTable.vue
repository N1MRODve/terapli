<template>
  <div class="space-y-6">
    <!-- Información -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex gap-3">
        <InformationCircleIcon class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p class="font-semibold text-blue-900 mb-1">
            Relaciona las columnas de tu archivo con los campos de Teraplí
          </p>
          <p class="text-sm text-blue-800">
            Hemos detectado automáticamente algunos campos. Revisa y ajusta según necesites.
          </p>
        </div>
      </div>
    </div>

    <!-- Tabla de mapeo -->
    <div class="overflow-x-auto border border-gray-200 rounded-lg">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-gray-700">
              Columna en tu archivo
            </th>
            <th class="px-4 py-3 text-left font-semibold text-gray-700">
              Valores de ejemplo
            </th>
            <th class="px-4 py-3 text-left font-semibold text-gray-700">
              Campo Teraplí
            </th>
            <th class="px-4 py-3 text-center font-semibold text-gray-700 w-24">
              Estado
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="column in detectedColumns"
            :key="column.name"
            class="hover:bg-gray-50"
          >
            <!-- Columna original -->
            <td class="px-4 py-3">
              <span class="font-medium text-gray-900">{{ column.name }}</span>
            </td>

            <!-- Valores de ejemplo -->
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1 max-w-xs">
                <span
                  v-for="(value, idx) in column.sampleValues.slice(0, 3)"
                  :key="idx"
                  class="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs truncate max-w-[120px]"
                  :title="value"
                >
                  {{ value || '(vacío)' }}
                </span>
              </div>
            </td>

            <!-- Select para mapear -->
            <td class="px-4 py-3">
              <select
                :value="getMappedField(column.name)"
                @change="handleMappingChange(column.name, ($event.target as HTMLSelectElement).value)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                :class="{
                  'border-green-400 bg-green-50': getMappedField(column.name) && isRequiredField(getMappedField(column.name)),
                  'border-blue-300 bg-blue-50': getMappedField(column.name) && !isRequiredField(getMappedField(column.name))
                }"
              >
                <option value="">-- No importar --</option>
                <optgroup label="Campos obligatorios">
                  <option
                    v-for="field in requiredFields"
                    :key="field.field"
                    :value="field.field"
                    :disabled="isFieldUsed(field.field, column.name)"
                  >
                    {{ field.label }} {{ isFieldUsed(field.field, column.name) ? '(ya usado)' : '*' }}
                  </option>
                </optgroup>
                <optgroup label="Contacto">
                  <option
                    v-for="field in contactFields"
                    :key="field.field"
                    :value="field.field"
                    :disabled="isFieldUsed(field.field, column.name)"
                  >
                    {{ field.label }} {{ isFieldUsed(field.field, column.name) ? '(ya usado)' : '' }}
                  </option>
                </optgroup>
                <optgroup label="Tratamiento">
                  <option
                    v-for="field in treatmentFields"
                    :key="field.field"
                    :value="field.field"
                    :disabled="isFieldUsed(field.field, column.name)"
                  >
                    {{ field.label }} {{ isFieldUsed(field.field, column.name) ? '(ya usado)' : '' }}
                  </option>
                </optgroup>
                <optgroup label="Otros campos">
                  <option
                    v-for="field in otherFields"
                    :key="field.field"
                    :value="field.field"
                    :disabled="isFieldUsed(field.field, column.name)"
                  >
                    {{ field.label }} {{ isFieldUsed(field.field, column.name) ? '(ya usado)' : '' }}
                  </option>
                </optgroup>
              </select>
            </td>

            <!-- Indicador de estado -->
            <td class="px-4 py-3 text-center">
              <span
                v-if="getMappedField(column.name) && isRequiredField(getMappedField(column.name))"
                class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
              >
                <CheckCircleIcon class="w-3.5 h-3.5" />
                Obligatorio
              </span>
              <span
                v-else-if="getMappedField(column.name)"
                class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
              >
                <CheckCircleIcon class="w-3.5 h-3.5" />
                Opcional
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs"
              >
                No importar
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mensajes de validación -->
    <div v-if="validation?.errors?.length" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex gap-3">
        <ExclamationTriangleIcon class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p class="font-semibold text-red-900 mb-2">
            Errores que impiden la importación:
          </p>
          <ul class="list-disc list-inside text-red-800 space-y-1 text-sm">
            <li v-for="(error, idx) in validation.errors" :key="idx">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="validation?.warnings?.length && !validation?.errors?.length" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div class="flex gap-3">
        <ExclamationCircleIcon class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p class="font-semibold text-amber-900 mb-2">
            Advertencias (puedes continuar):
          </p>
          <ul class="list-disc list-inside text-amber-800 space-y-1 text-sm">
            <li v-for="(warning, idx) in validation.warnings" :key="idx">
              {{ warning }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Vista previa -->
    <div v-if="previewData.length > 0" class="space-y-3">
      <h4 class="font-semibold text-gray-900 flex items-center gap-2">
        <EyeIcon class="w-5 h-5 text-purple-600" />
        Vista previa con el mapeo aplicado
      </h4>
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="w-full text-sm">
          <thead class="bg-purple-50">
            <tr>
              <th
                v-for="field in mappedFields"
                :key="field"
                class="px-3 py-2 text-left font-medium text-purple-800 whitespace-nowrap"
              >
                {{ getFieldLabel(field) }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(row, idx) in previewData" :key="idx" class="hover:bg-gray-50">
              <td
                v-for="field in mappedFields"
                :key="field"
                class="px-3 py-2 text-gray-700 whitespace-nowrap"
              >
                {{ row[field] || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-xs text-gray-500">
        Mostrando las primeras {{ previewData.length }} fila{{ previewData.length !== 1 ? 's' : '' }} de tu archivo
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'
import type { DetectedColumn, ColumnMapping, MappingValidation, PacienteField } from '~/types/import-mapping.types'

interface FieldOption {
  field: PacienteField
  label: string
}

interface Props {
  detectedColumns: DetectedColumn[]
  mappings: ColumnMapping[]
  validation: MappingValidation | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:mapping': [sourceColumn: string, targetField: PacienteField | '']
}>()

// Catálogo de campos organizados por grupo
const requiredFields: FieldOption[] = [
  { field: 'nombre_completo', label: 'Nombre Completo' },
  { field: 'email', label: 'Email' },
  { field: 'telefono', label: 'Teléfono' }
]

const contactFields: FieldOption[] = [
  { field: 'documento_identidad', label: 'Documento de Identidad' },
  { field: 'fecha_nacimiento', label: 'Fecha de Nacimiento' },
  { field: 'direccion', label: 'Dirección' },
  { field: 'contacto_emergencia', label: 'Contacto de Emergencia' }
]

const treatmentFields: FieldOption[] = [
  { field: 'area_de_acompanamiento', label: 'Área de Acompañamiento' },
  { field: 'frecuencia', label: 'Frecuencia de Sesiones' },
  { field: 'activo', label: 'Estado (Activo/Inactivo)' },
  { field: 'derivacion', label: 'Derivación' },
  { field: 'medicacion', label: 'Medicación' },
  { field: 'orientacion_diagnostica', label: 'Orientación Diagnóstica' },
  { field: 'inicio_tratamiento', label: 'Inicio del Tratamiento' }
]

const otherFields: FieldOption[] = [
  { field: 'precio_sesion', label: 'Precio por Sesión' },
  { field: 'comision', label: 'Comisión' },
  { field: 'notas', label: 'Notas / Observaciones' }
]

const allFields = [...requiredFields, ...contactFields, ...treatmentFields, ...otherFields]

// Obtener campo mapeado para una columna
const getMappedField = (sourceColumn: string): PacienteField | '' => {
  const mapping = props.mappings.find(m => m.sourceColumn === sourceColumn)
  return (mapping?.targetField as PacienteField) || ''
}

// Verificar si un campo ya está siendo usado por otra columna
const isFieldUsed = (field: PacienteField, currentColumn: string): boolean => {
  return props.mappings.some(
    m => m.targetField === field && m.sourceColumn !== currentColumn
  )
}

// Verificar si es campo obligatorio
const isRequiredField = (field: PacienteField | ''): boolean => {
  return requiredFields.some(f => f.field === field)
}

// Obtener label de un campo
const getFieldLabel = (field: PacienteField): string => {
  return allFields.find(f => f.field === field)?.label || field
}

// Handler para cambio de mapeo
const handleMappingChange = (sourceColumn: string, targetField: string) => {
  emit('update:mapping', sourceColumn, targetField as PacienteField | '')
}

// Campos actualmente mapeados
const mappedFields = computed(() => {
  return props.mappings
    .filter(m => m.targetField)
    .map(m => m.targetField as PacienteField)
})

// Datos de vista previa
const previewData = computed(() => {
  if (!props.detectedColumns.length || !mappedFields.value.length) return []

  const sampleCount = Math.min(
    props.detectedColumns[0]?.sampleValues?.length || 0,
    3
  )

  const preview: Record<string, any>[] = []

  for (let i = 0; i < sampleCount; i++) {
    const row: Record<string, any> = {}

    for (const mapping of props.mappings) {
      if (mapping.targetField) {
        const column = props.detectedColumns.find(
          c => c.name === mapping.sourceColumn
        )
        row[mapping.targetField] = column?.sampleValues?.[i] || ''
      }
    }

    if (Object.keys(row).length > 0) {
      preview.push(row)
    }
  }

  return preview
})
</script>
