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
                Paso {{ currentStep }} de 4
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
                v-for="step in 4"
                :key="step"
                class="flex-1 h-2 rounded-full transition-all duration-300"
                :class="step <= currentStep ? 'bg-purple-600' : 'bg-gray-200'"
              ></div>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Step 1: Download Template -->
            <div v-if="currentStep === 1" class="space-y-6">
              <div class="text-center">
                <DocumentArrowDownIcon class="w-16 h-16 mx-auto text-purple-600 mb-4" aria-hidden="true" />
                <h3 class="text-lg font-semibold text-cafe mb-2">
                  Descarga la plantilla
                </h3>
                <p class="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                  Descarga nuestra plantilla de ejemplo para ver el formato correcto de los datos
                </p>
              </div>

              <div class="flex gap-3 justify-center">
                <button
                  @click="downloadTemplate('csv')"
                  :disabled="downloadingTemplate"
                  class="min-h-[44px] px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <DocumentTextIcon class="w-5 h-5" aria-hidden="true" />
                  <span>Descargar CSV</span>
                </button>
                <button
                  @click="downloadTemplate('xlsx')"
                  :disabled="downloadingTemplate"
                  class="min-h-[44px] px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <DocumentTextIcon class="w-5 h-5" aria-hidden="true" />
                  <span>Descargar XLSX</span>
                </button>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <div class="flex gap-3">
                  <InformationCircleIcon class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div class="space-y-2">
                    <p class="font-semibold text-blue-900">Campos requeridos:</p>
                    <ul class="list-disc list-inside text-blue-800 space-y-1">
                      <li><strong>nombre_completo</strong>: Nombre completo del paciente</li>
                      <li><strong>email</strong> o <strong>telefono</strong>: Al menos uno es obligatorio</li>
                    </ul>
                    <p class="font-semibold text-blue-900 mt-3">Campos opcionales:</p>
                    <ul class="list-disc list-inside text-blue-800 space-y-1">
                      <li><strong>area_de_acompanamiento</strong></li>
                      <li><strong>frecuencia</strong></li>
                      <li><strong>activo</strong>: true/false (por defecto true)</li>
                      <li><strong>notas</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Upload File -->
            <div v-if="currentStep === 2" class="space-y-6">
              <div class="text-center mb-6">
                <ArrowUpTrayIcon class="w-16 h-16 mx-auto text-purple-600 mb-4" aria-hidden="true" />
                <h3 class="text-lg font-semibold text-cafe mb-2">
                  Sube tu archivo
                </h3>
                <p class="text-sm text-gray-600">
                  Arrastra tu archivo o haz clic para seleccionar
                </p>
              </div>

              <FileDropzone
                @file-selected="handleFileSelected"
                @file-removed="handleFileRemoved"
                @error="handleDropzoneError"
              />

              <div v-if="parsing" class="text-center py-8">
                <div class="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p class="text-gray-600">Procesando archivo...</p>
              </div>
            </div>

            <!-- Step 3: Review Data -->
            <div v-if="currentStep === 3" class="space-y-6">
              <div class="text-center mb-6">
                <ClipboardDocumentCheckIcon class="w-16 h-16 mx-auto text-purple-600 mb-4" aria-hidden="true" />
                <h3 class="text-lg font-semibold text-cafe mb-2">
                  Revisa los datos
                </h3>
                <p class="text-sm text-gray-600">
                  Verifica que los datos sean correctos antes de importar
                </p>
              </div>

              <!-- Summary -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-cafe">{{ validationResult?.summary.total || 0 }}</p>
                  <p class="text-xs text-gray-600">Total</p>
                </div>
                <div class="bg-green-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-green-700">{{ validationResult?.summary.valid || 0 }}</p>
                  <p class="text-xs text-gray-600">Válidas</p>
                </div>
                <div class="bg-red-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-red-700">{{ validationResult?.summary.invalid || 0 }}</p>
                  <p class="text-xs text-gray-600">Inválidas</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-blue-700">{{ validationResult?.summary.toUpdate || 0 }}</p>
                  <p class="text-xs text-gray-600">Actualizaciones</p>
                </div>
              </div>

              <!-- Action for duplicates -->
              <div v-if="(validationResult?.summary.toUpdate || 0) > 0" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="updateDuplicates"
                    class="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-300"
                  />
                  <div class="flex-1">
                    <p class="font-semibold text-amber-900">
                      Actualizar pacientes existentes
                    </p>
                    <p class="text-sm text-amber-700">
                      Se encontraron {{ validationResult?.summary.toUpdate }} pacientes que ya existen.
                      Marca esta casilla para actualizar sus datos.
                    </p>
                  </div>
                </label>
              </div>

              <!-- Invalid rows -->
              <div v-if="(validationResult?.summary.invalid || 0) > 0" class="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h4 class="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <ExclamationTriangleIcon class="w-5 h-5" aria-hidden="true" />
                  Errores encontrados ({{ validationResult?.summary.invalid }})
                </h4>
                <div class="space-y-2">
                  <div
                    v-for="(invalid, index) in validationResult?.invalidPatients.slice(0, 10)"
                    :key="index"
                    class="text-sm"
                  >
                    <p class="font-medium text-red-800">
                      Fila {{ index + 2 }}: {{ invalid.nombre_completo || 'Sin nombre' }}
                    </p>
                    <ul class="list-disc list-inside text-red-700 ml-4">
                      <li v-for="error in invalid.errors" :key="error.field">
                        {{ error.message }}
                      </li>
                    </ul>
                  </div>
                  <p v-if="(validationResult?.invalidPatients.length || 0) > 10" class="text-xs text-red-600 mt-2">
                    ... y {{ (validationResult?.invalidPatients.length || 0) - 10 }} errores más
                  </p>
                </div>
                <button
                  @click="downloadErrors"
                  class="min-h-[44px] mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Descargar listado de errores
                </button>
              </div>
            </div>

            <!-- Step 4: Import Result -->
            <div v-if="currentStep === 4" class="space-y-6">
              <div class="text-center mb-6">
                <CheckCircleIcon v-if="importSuccess" class="w-16 h-16 mx-auto text-green-600 mb-4" aria-hidden="true" />
                <ExclamationCircleIcon v-else class="w-16 h-16 mx-auto text-red-600 mb-4" aria-hidden="true" />
                <h3 class="text-lg font-semibold text-cafe mb-2">
                  {{ importSuccess ? 'Importación completada' : 'Importación con errores' }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ importSuccess ? 'Los pacientes se han importado correctamente' : 'Algunos pacientes no se pudieron importar' }}
                </p>
              </div>

              <!-- Result summary -->
              <div v-if="importResult" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-cafe">{{ importResult.total }}</p>
                  <p class="text-xs text-gray-600">Total</p>
                </div>
                <div class="bg-green-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-green-700">{{ importResult.created }}</p>
                  <p class="text-xs text-gray-600">Creados</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-blue-700">{{ importResult.updated }}</p>
                  <p class="text-xs text-gray-600">Actualizados</p>
                </div>
                <div class="bg-gray-100 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-gray-700">{{ importResult.skipped }}</p>
                  <p class="text-xs text-gray-600">Omitidos</p>
                </div>
              </div>

              <!-- Import errors -->
              <div v-if="importResult && importResult.errors && importResult.errors.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h4 class="font-semibold text-red-900 mb-3">
                  Errores durante la importación ({{ importResult.errors.length }})
                </h4>
                <div class="space-y-2">
                  <div
                    v-for="(error, index) in importResult.errors.slice(0, 10)"
                    :key="index"
                    class="text-sm text-red-800"
                  >
                    Fila {{ error.row }}: {{ error.error }}
                  </div>
                  <p v-if="importResult.errors.length > 10" class="text-xs text-red-600 mt-2">
                    ... y {{ importResult.errors.length - 10 }} errores más
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <button
              v-if="currentStep > 1 && currentStep < 4"
              @click="previousStep"
              :disabled="importing"
              class="min-h-[44px] px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Atrás
            </button>
            <div v-else></div>

            <div class="flex gap-3">
              <button
                v-if="currentStep < 4"
                @click="close"
                :disabled="importing"
                class="min-h-[44px] px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancelar
              </button>

              <button
                v-if="currentStep === 1"
                @click="nextStep"
                class="min-h-[44px] px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-all font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                Continuar
              </button>

              <button
                v-if="currentStep === 2"
                @click="nextStep"
                :disabled="!selectedFile || parsing"
                class="min-h-[44px] px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                Validar datos
              </button>

              <button
                v-if="currentStep === 3"
                @click="importPatients"
                :disabled="importing || (validationResult?.summary.valid || 0) === 0"
                class="min-h-[44px] px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-300 flex items-center gap-2"
              >
                <span v-if="importing">Importando...</span>
                <span v-else>Importar {{ validationResult?.summary.valid }} pacientes</span>
              </button>

              <button
                v-if="currentStep === 4"
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
  DocumentTextIcon
} from '@heroicons/vue/24/outline'

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
const { parseFile, validateRows, generateErrorsCSV, downloadFile } = usePatientsBulk()

const currentStep = ref(1)
const selectedFile = ref<File | null>(null)
const parsing = ref(false)
const downloadingTemplate = ref(false)
const validationResult = ref<any>(null)
const updateDuplicates = ref(true)
const importing = ref(false)
const importResult = ref<any>(null)
const importSuccess = ref(false)

const close = () => {
  if (!importing.value) {
    emit('update:modelValue', false)
    // Reset state after animation
    setTimeout(reset, 300)
  }
}

const reset = () => {
  currentStep.value = 1
  selectedFile.value = null
  parsing.value = false
  validationResult.value = null
  updateDuplicates.value = true
  importing.value = false
  importResult.value = null
  importSuccess.value = false
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

const handleFileSelected = async (file: File) => {
  selectedFile.value = file
  toast.info('Archivo seleccionado correctamente')
}

const handleFileRemoved = () => {
  selectedFile.value = null
  validationResult.value = null
}

const handleDropzoneError = (message: string) => {
  toast.error(message)
}

const nextStep = async () => {
  if (currentStep.value === 2 && selectedFile.value) {
    // Parse and validate file
    await parseAndValidateFile()
  }

  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const parseAndValidateFile = async () => {
  if (!selectedFile.value) return

  try {
    parsing.value = true

    // Parse file
    const parsedData = await parseFile(selectedFile.value)

    // Validate rows
    validationResult.value = validateRows(parsedData.rows, props.existingPatients)

    if (validationResult.value.summary.valid === 0) {
      toast.error('No se encontraron filas válidas para importar')
    } else {
      toast.success(`${validationResult.value.summary.valid} filas válidas encontradas`)
    }
  } catch (error: any) {
    toast.error(error.message || 'Error al procesar el archivo')
    currentStep.value = 2 // Go back to upload step
  } finally {
    parsing.value = false
  }
}

const downloadErrors = () => {
  if (!validationResult.value) return

  const errorsCSV = generateErrorsCSV(validationResult.value.invalidPatients)
  downloadFile(errorsCSV, `errores_importacion_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
  toast.info('Listado de errores descargado')
}

const importPatients = async () => {
  if (!selectedFile.value || !validationResult.value) return

  try {
    importing.value = true

    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('action', updateDuplicates.value ? 'update' : 'skip')

    const response = await fetch('/api/patients/import', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || 'Error al importar pacientes')
    }

    const result = await response.json()
    importResult.value = result.results
    importSuccess.value = result.success && (result.results.errors?.length || 0) === 0

    if (importSuccess.value) {
      toast.success(`${importResult.value.created + importResult.value.updated} pacientes importados correctamente`)
    } else {
      toast.warning('Importación completada con algunos errores')
    }

    currentStep.value = 4
  } catch (error: any) {
    toast.error(error.message || 'Error al importar pacientes')
  } finally {
    importing.value = false
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
