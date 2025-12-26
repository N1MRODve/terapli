<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="close"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
      >
        <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 id="import-modal-title" class="text-2xl font-serif font-bold text-cafe">
                Importar Pacientes
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                Paso {{ currentStep }} de 5
              </p>
            </div>
            <button
              @click="close"
              class="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Cerrar modal"
            >
              <XMarkIcon class="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          <!-- Progress bar -->
          <div class="px-6 py-3 bg-gray-50">
            <div class="flex items-center gap-2">
              <div
                v-for="step in 5"
                :key="step"
                class="flex-1 h-2 rounded-full transition-all duration-300"
                :class="step <= currentStep ? 'bg-purple-600' : 'bg-gray-200'"
              ></div>
            </div>
            <div class="flex justify-between mt-2 text-xs text-gray-500">
              <span :class="{ 'text-purple-600 font-medium': currentStep === 1 }">Info</span>
              <span :class="{ 'text-purple-600 font-medium': currentStep === 2 }">Subir</span>
              <span :class="{ 'text-purple-600 font-medium': currentStep === 3 }">Mapear</span>
              <span :class="{ 'text-purple-600 font-medium': currentStep === 4 }">Revisar</span>
              <span :class="{ 'text-purple-600 font-medium': currentStep === 5 }">Resultado</span>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Step 1: Information (Optional - can use any Excel) -->
            <div v-if="currentStep === 1" class="space-y-6">
              <div class="text-center">
                <DocumentArrowDownIcon class="w-16 h-16 mx-auto text-purple-600 mb-4" aria-hidden="true" />
                <h3 class="text-lg font-semibold text-cafe mb-2">
                  Paso 1: Prepara tu archivo
                </h3>
                <p class="text-sm text-gray-600 mb-2 max-w-md mx-auto">
                  Puedes usar <strong>cualquier Excel o CSV</strong> con tus pacientes.
                  El sistema detectará las columnas automáticamente.
                </p>
              </div>

              <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                <div class="flex gap-3">
                  <CheckCircleIcon class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p class="font-semibold text-green-900 mb-2">¿Ya tienes un Excel con pacientes?</p>
                    <p class="text-green-800">
                      ¡Perfecto! Puedes subirlo directamente. En el siguiente paso podrás relacionar
                      las columnas de tu archivo con los campos de Teraplí.
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <div class="flex gap-3">
                  <InformationCircleIcon class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div class="space-y-3">
                    <div>
                      <p class="font-semibold text-blue-900 mb-1">Formatos aceptados:</p>
                      <p class="text-blue-800">CSV (.csv) y Excel (.xlsx, .xls)</p>
                      <p class="text-xs text-blue-700 mt-1">Tamaño máximo: 10MB | Máximo 5,000 filas</p>
                    </div>

                    <div>
                      <p class="font-semibold text-blue-900 mb-1">Campos mínimos necesarios:</p>
                      <ul class="list-disc list-inside text-blue-800 space-y-1">
                        <li><strong>Nombre</strong> del paciente (obligatorio)</li>
                        <li><strong>Email</strong> o <strong>Teléfono</strong> (al menos uno)</li>
                      </ul>
                    </div>

                    <div>
                      <p class="font-semibold text-blue-900 mb-1">Campos adicionales soportados:</p>
                      <p class="text-blue-800 text-xs">
                        Documento de identidad, Dirección, Fecha de nacimiento, Área de tratamiento,
                        Frecuencia, Derivación, Medicación, Diagnóstico, Notas, Precio, y más...
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex gap-3 justify-center pt-2">
                <button
                  @click="downloadTemplate('csv')"
                  :disabled="downloadingTemplate"
                  class="min-h-[44px] px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <DocumentTextIcon class="w-4 h-4" aria-hidden="true" />
                  <span>Descargar plantilla CSV</span>
                </button>
                <button
                  @click="downloadTemplate('xlsx')"
                  :disabled="downloadingTemplate"
                  class="min-h-[44px] px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <DocumentTextIcon class="w-4 h-4" aria-hidden="true" />
                  <span>Descargar plantilla Excel</span>
                </button>
              </div>
            </div>

            <!-- Step 2: Upload File -->
            <div v-if="currentStep === 2" class="space-y-6">
              <div class="text-center mb-6">
                <ArrowUpTrayIcon class="w-16 h-16 mx-auto text-purple-600 mb-4" aria-hidden="true" />
                <h3 class="text-lg font-semibold text-cafe mb-2">
                  Paso 2: Sube tu archivo
                </h3>
                <p class="text-sm text-gray-600 mb-1">
                  Arrastra tu archivo o haz clic para seleccionarlo
                </p>
                <p class="text-xs text-gray-500">
                  Detectaremos las columnas automáticamente
                </p>
              </div>

              <SharedFileDropzone
                @file-selected="handleFileSelected"
                @file-removed="handleFileRemoved"
                @error="handleDropzoneError"
              />

              <div v-if="selectedFile && !importMapping.detecting.value" class="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                <div class="flex gap-3">
                  <CheckCircleIcon class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div class="flex-1">
                    <p class="font-semibold text-green-900 mb-1">Archivo seleccionado correctamente</p>
                    <p class="text-green-800">{{ selectedFile.name }}</p>
                    <p class="text-xs text-green-700 mt-1">
                      Haz clic en "Detectar columnas" para continuar
                    </p>
                  </div>
                </div>
              </div>

              <div v-if="importMapping.detecting.value" class="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div class="flex flex-col items-center justify-center gap-4">
                  <div class="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                  <div class="text-center">
                    <p class="text-purple-900 font-medium mb-1">Analizando archivo...</p>
                    <p class="text-sm text-purple-700">Detectando columnas y sugiriendo mapeo</p>
                  </div>
                </div>
              </div>

              <div v-if="importMapping.error.value" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                <div class="flex gap-3">
                  <ExclamationTriangleIcon class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p class="font-semibold text-red-900 mb-1">Error al procesar archivo</p>
                    <p class="text-red-800">{{ importMapping.error.value }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Column Mapping -->
            <div v-if="currentStep === 3" class="space-y-6">
              <div class="text-center mb-6">
                <AdjustmentsHorizontalIcon class="w-16 h-16 mx-auto text-purple-600 mb-4" aria-hidden="true" />
                <h3 class="text-lg font-semibold text-cafe mb-2">
                  Paso 3: Mapea las columnas
                </h3>
                <p class="text-sm text-gray-600">
                  Relaciona las columnas de tu archivo con los campos de Teraplí
                </p>
              </div>

              <PatientsColumnMappingTable
                :detected-columns="importMapping.config.value?.detectedColumns || []"
                :mappings="importMapping.mappings.value"
                :validation="importMapping.validation.value"
                @update:mapping="handleMappingUpdate"
              />
            </div>

            <!-- Step 4: Review Data -->
            <div v-if="currentStep === 4" class="space-y-6">
              <div class="text-center mb-6">
                <ClipboardDocumentCheckIcon class="w-16 h-16 mx-auto text-purple-600 mb-4" aria-hidden="true" />
                <h3 class="text-lg font-semibold text-cafe mb-2">
                  Paso 4: Confirma la importación
                </h3>
                <p class="text-sm text-gray-600">
                  Revisa el resumen antes de importar
                </p>
              </div>

              <!-- Mapped fields summary -->
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 class="font-semibold text-gray-900 mb-3">Campos que se importarán:</h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="mapping in importMapping.mappings.value.filter(m => m.targetField)"
                    :key="mapping.sourceColumn"
                    class="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    <CheckCircleIcon class="w-4 h-4" />
                    {{ getFieldLabel(mapping.targetField) }}
                  </span>
                </div>
              </div>

              <!-- Warnings -->
              <div v-if="importMapping.validation.value?.warnings?.length" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div class="flex gap-3">
                  <ExclamationCircleIcon class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p class="font-semibold text-amber-900 mb-2">Advertencias:</p>
                    <ul class="text-sm text-amber-800 space-y-1">
                      <li v-for="(warning, idx) in importMapping.validation.value.warnings" :key="idx">
                        • {{ warning }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Action for duplicates -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="updateDuplicates"
                    class="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-300 cursor-pointer"
                  />
                  <div class="flex-1">
                    <p class="font-semibold text-blue-900 mb-1">
                      Actualizar pacientes existentes
                    </p>
                    <p class="text-sm text-blue-800">
                      Si un paciente ya existe (mismo email o teléfono), actualizar sus datos con la información del archivo.
                    </p>
                    <p class="text-xs text-blue-700 mt-1">
                      Si no marcas esta opción, los pacientes duplicados se omitirán.
                    </p>
                  </div>
                </label>
              </div>

              <!-- Preview data -->
              <div v-if="importMapping.getPreviewData().length > 0" class="space-y-3">
                <h4 class="font-semibold text-gray-900">Vista previa de datos:</h4>
                <div class="overflow-x-auto border border-gray-200 rounded-lg">
                  <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                      <tr>
                        <th
                          v-for="mapping in importMapping.mappings.value.filter(m => m.targetField)"
                          :key="mapping.targetField"
                          class="px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap"
                        >
                          {{ getFieldLabel(mapping.targetField) }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="(row, idx) in importMapping.getPreviewData()" :key="idx">
                        <td
                          v-for="mapping in importMapping.mappings.value.filter(m => m.targetField)"
                          :key="mapping.targetField"
                          class="px-3 py-2 text-gray-600 whitespace-nowrap"
                        >
                          {{ row[mapping.targetField] || '—' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p class="text-xs text-gray-500">Vista previa de las primeras filas</p>
              </div>
            </div>

            <!-- Step 5: Import Result -->
            <div v-if="currentStep === 5" class="space-y-6">
              <div class="text-center mb-6">
                <CheckCircleIcon v-if="importSuccess" class="w-16 h-16 mx-auto text-green-600 mb-4" aria-hidden="true" />
                <ExclamationCircleIcon v-else class="w-16 h-16 mx-auto text-amber-600 mb-4" aria-hidden="true" />
                <h3 class="text-lg font-semibold text-cafe mb-2">
                  {{ importSuccess ? 'Importación completada con éxito' : 'Importación completada con advertencias' }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ importSuccess
                    ? 'Los pacientes se han importado correctamente'
                    : 'La importación se completó pero algunos pacientes tienen perfil incompleto'
                  }}
                </p>
              </div>

              <!-- Result summary -->
              <div v-if="importMapping.importResult.value" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-cafe">{{ importMapping.importResult.value.total }}</p>
                  <p class="text-xs text-gray-600">Total</p>
                </div>
                <div class="bg-green-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-green-700">{{ importMapping.importResult.value.created }}</p>
                  <p class="text-xs text-gray-600">Creados</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-blue-700">{{ importMapping.importResult.value.updated }}</p>
                  <p class="text-xs text-gray-600">Actualizados</p>
                </div>
                <div class="bg-gray-100 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-gray-700">{{ importMapping.importResult.value.skipped }}</p>
                  <p class="text-xs text-gray-600">Omitidos</p>
                </div>
              </div>

              <!-- Success message -->
              <div v-if="importSuccess" class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex gap-3">
                  <CheckCircleIcon class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div class="flex-1">
                    <p class="font-semibold text-green-900 mb-2">¡Importación exitosa!</p>
                    <p class="text-sm text-green-800">
                      Los pacientes se han añadido a tu lista y ya puedes gestionar sus citas y tratamientos.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Incomplete profiles warning -->
              <div
                v-if="importMapping.importResult.value?.incompleteProfiles?.length"
                class="bg-amber-50 border border-amber-200 rounded-lg p-4"
              >
                <div class="flex gap-3">
                  <ExclamationCircleIcon class="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div class="flex-1">
                    <p class="font-semibold text-amber-900 mb-2">
                      {{ importMapping.importResult.value.incompleteProfiles.length }} paciente{{ importMapping.importResult.value.incompleteProfiles.length !== 1 ? 's' : '' }} con perfil incompleto
                    </p>
                    <p class="text-sm text-amber-800 mb-3">
                      Los siguientes pacientes fueron importados pero les faltan datos importantes:
                    </p>
                    <div class="max-h-40 overflow-y-auto space-y-2">
                      <div
                        v-for="profile in importMapping.importResult.value.incompleteProfiles.slice(0, 5)"
                        :key="profile.rowNumber"
                        class="bg-white border border-amber-200 rounded p-2 text-sm"
                      >
                        <span class="font-medium text-amber-900">{{ profile.nombre_completo }}</span>
                        <span class="text-amber-700"> — Faltan: {{ profile.missingFields.join(', ') }}</span>
                      </div>
                      <p v-if="importMapping.importResult.value.incompleteProfiles.length > 5" class="text-xs text-amber-700 italic">
                        ... y {{ importMapping.importResult.value.incompleteProfiles.length - 5 }} más
                      </p>
                    </div>
                    <p class="text-xs text-amber-700 mt-3">
                      💡 Puedes completar esta información editando cada paciente desde la lista.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Import errors -->
              <div
                v-if="importMapping.importResult.value?.errors?.length"
                class="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <h4 class="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <ExclamationTriangleIcon class="w-5 h-5" aria-hidden="true" />
                  Errores durante la importación ({{ importMapping.importResult.value.errors.length }})
                </h4>
                <div class="max-h-40 overflow-y-auto space-y-2">
                  <div
                    v-for="(error, index) in importMapping.importResult.value.errors.slice(0, 10)"
                    :key="index"
                    class="bg-white border border-red-200 rounded p-2 text-sm text-red-800"
                  >
                    <span class="font-semibold">Fila {{ error.row }}:</span> {{ error.error }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <button
              v-if="currentStep > 1 && currentStep < 5"
              @click="previousStep"
              :disabled="importMapping.importing.value || importMapping.detecting.value"
              class="min-h-[44px] px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Atrás
            </button>
            <div v-else></div>

            <div class="flex gap-3">
              <button
                v-if="currentStep < 5"
                @click="close"
                :disabled="importMapping.importing.value"
                class="min-h-[44px] px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancelar
              </button>

              <!-- Step 1: Continue -->
              <button
                v-if="currentStep === 1"
                @click="nextStep"
                class="min-h-[44px] px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-all font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                Continuar
              </button>

              <!-- Step 2: Detect columns -->
              <button
                v-if="currentStep === 2"
                @click="detectAndContinue"
                :disabled="!selectedFile || importMapping.detecting.value"
                class="min-h-[44px] px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-300 flex items-center gap-2"
              >
                <div v-if="importMapping.detecting.value" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>{{ importMapping.detecting.value ? 'Analizando...' : 'Detectar columnas' }}</span>
              </button>

              <!-- Step 3: Continue to review -->
              <button
                v-if="currentStep === 3"
                @click="nextStep"
                :disabled="!importMapping.validation.value?.isValid"
                class="min-h-[44px] px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                Continuar
              </button>

              <!-- Step 4: Import -->
              <button
                v-if="currentStep === 4"
                @click="executeImport"
                :disabled="importMapping.importing.value"
                class="min-h-[44px] px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-300 flex items-center gap-2"
              >
                <div v-if="importMapping.importing.value" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>{{ importMapping.importing.value ? 'Importando...' : 'Importar pacientes' }}</span>
              </button>

              <!-- Step 5: Finish -->
              <button
                v-if="currentStep === 5"
                @click="finish"
                class="min-h-[44px] px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-all font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  XMarkIcon,
  DocumentArrowDownIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/vue/24/outline'
import type { PacienteField } from '~/types/import-mapping.types'

interface Props {
  modelValue: boolean
  existingPatients?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  existingPatients: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'import-complete': []
}>()

const toast = useToast()
const importMapping = useImportMapping()

// Estado local
const currentStep = ref(1)
const selectedFile = ref<File | null>(null)
const downloadingTemplate = ref(false)
const updateDuplicates = ref(true)
const importSuccess = ref(false)

// Catálogo de labels para campos
const fieldLabels: Record<string, string> = {
  nombre_completo: 'Nombre Completo',
  email: 'Email',
  telefono: 'Teléfono',
  documento_identidad: 'Documento',
  fecha_nacimiento: 'Fecha Nac.',
  direccion: 'Dirección',
  contacto_emergencia: 'Contacto Emergencia',
  area_de_acompanamiento: 'Área',
  frecuencia: 'Frecuencia',
  activo: 'Estado',
  derivacion: 'Derivación',
  medicacion: 'Medicación',
  orientacion_diagnostica: 'Diagnóstico',
  inicio_tratamiento: 'Inicio Trat.',
  precio_sesion: 'Precio',
  comision: 'Comisión',
  notas: 'Notas'
}

const getFieldLabel = (field: string | PacienteField | undefined): string => {
  if (!field) return ''
  return fieldLabels[field] || field
}

const hasProgress = computed(() => {
  return selectedFile.value !== null ||
    importMapping.config.value !== null ||
    currentStep.value > 1
})

const close = () => {
  if (importMapping.importing.value) {
    toast.warning('No se puede cerrar mientras se está importando')
    return
  }

  if (hasProgress.value && currentStep.value < 5) {
    const confirmed = confirm(
      '¿Estás seguro de que deseas cancelar?\n\n' +
      'Se perderá todo el progreso de la importación.\n' +
      'Tendrás que empezar de nuevo si cierras ahora.'
    )
    if (!confirmed) {
      return
    }
  }

  emit('update:modelValue', false)
  setTimeout(reset, 300)
}

const reset = () => {
  currentStep.value = 1
  selectedFile.value = null
  downloadingTemplate.value = false
  updateDuplicates.value = true
  importSuccess.value = false
  importMapping.reset()
}

const downloadTemplate = async (format: 'csv' | 'xlsx') => {
  try {
    downloadingTemplate.value = true

    const response = await fetch(`/api/patients/template?format=${format}`)

    if (!response.ok) {
      throw new Error('Error al descargar la plantilla')
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `plantilla_pacientes.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Plantilla ${format.toUpperCase()} descargada`)
  } catch (error: any) {
    toast.error(error.message || 'Error al descargar la plantilla')
  } finally {
    downloadingTemplate.value = false
  }
}

const handleFileSelected = (file: File) => {
  selectedFile.value = file
  importMapping.error.value = null
  toast.info('Archivo seleccionado correctamente')
}

const handleFileRemoved = () => {
  selectedFile.value = null
  importMapping.reset()
}

const handleDropzoneError = (message: string) => {
  toast.error(message)
}

const handleMappingUpdate = (sourceColumn: string, targetField: PacienteField | '') => {
  importMapping.updateMapping(sourceColumn, targetField)
}

const nextStep = () => {
  if (currentStep.value < 5) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const detectAndContinue = async () => {
  if (!selectedFile.value) return

  const success = await importMapping.detectColumns(selectedFile.value)

  if (success) {
    toast.success('Columnas detectadas correctamente')
    currentStep.value = 3
  } else {
    toast.error(importMapping.error.value || 'Error al detectar columnas')
  }
}

const executeImport = async () => {
  if (!selectedFile.value) return

  const action = updateDuplicates.value ? 'update' : 'skip'
  const success = await importMapping.executeImport(selectedFile.value, action)

  if (success) {
    importSuccess.value = (importMapping.importResult.value?.errors?.length || 0) === 0
    const totalImported = (importMapping.importResult.value?.created || 0) +
      (importMapping.importResult.value?.updated || 0)
    toast.success(`${totalImported} paciente${totalImported !== 1 ? 's' : ''} importado${totalImported !== 1 ? 's' : ''} correctamente`)
    currentStep.value = 5
  } else {
    toast.error(importMapping.error.value || 'Error al importar pacientes')
  }
}

const finish = () => {
  emit('import-complete')
  close()
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
