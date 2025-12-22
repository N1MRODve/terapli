<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="close"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 id="export-modal-title" class="text-2xl font-serif font-bold text-cafe">
                Exportar Pacientes
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                Selecciona las opciones de exportación
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

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Format selection -->
            <div>
              <label class="block text-sm font-semibold text-cafe mb-3">
                Formato de archivo
              </label>
              <div class="flex gap-3">
                <button
                  @click="format = 'csv'"
                  class="min-h-[44px] flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium flex items-center justify-center gap-2"
                  :class="format === 'csv'
                    ? 'border-purple-600 bg-purple-50 text-purple-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'"
                >
                  <DocumentTextIcon class="w-5 h-5" aria-hidden="true" />
                  <span>CSV</span>
                </button>
                <button
                  @click="format = 'xlsx'"
                  class="min-h-[44px] flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium flex items-center justify-center gap-2"
                  :class="format === 'xlsx'
                    ? 'border-purple-600 bg-purple-50 text-purple-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'"
                >
                  <DocumentTextIcon class="w-5 h-5" aria-hidden="true" />
                  <span>XLSX</span>
                </button>
              </div>
            </div>

            <!-- Scope selection -->
            <div>
              <label class="block text-sm font-semibold text-cafe mb-3">
                ¿Qué pacientes exportar?
              </label>
              <div class="space-y-2">
                <label
                  class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                  :class="scope === 'all'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'"
                >
                  <input
                    type="radio"
                    v-model="scope"
                    value="all"
                    class="w-4 h-4 text-purple-600 border-gray-300 focus:ring-2 focus:ring-purple-300"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-cafe">Todos los pacientes</p>
                    <p class="text-xs text-gray-600">Exportar todos los pacientes ({{ totalPatients }})</p>
                  </div>
                </label>

                <label
                  v-if="hasFilters"
                  class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                  :class="scope === 'filtered'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'"
                >
                  <input
                    type="radio"
                    v-model="scope"
                    value="filtered"
                    class="w-4 h-4 text-purple-600 border-gray-300 focus:ring-2 focus:ring-purple-300"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-cafe">Pacientes filtrados</p>
                    <p class="text-xs text-gray-600">Exportar solo los pacientes que cumplen los filtros actuales ({{ filteredCount }})</p>
                  </div>
                </label>

                <label
                  v-if="selectedCount > 0"
                  class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                  :class="scope === 'selected'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'"
                >
                  <input
                    type="radio"
                    v-model="scope"
                    value="selected"
                    class="w-4 h-4 text-purple-600 border-gray-300 focus:ring-2 focus:ring-purple-300"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-cafe">Pacientes seleccionados</p>
                    <p class="text-xs text-gray-600">Exportar solo los pacientes seleccionados ({{ selectedCount }})</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Fields selection -->
            <div>
              <label class="block text-sm font-semibold text-cafe mb-3">
                Campos a exportar
              </label>
              <div class="grid grid-cols-2 gap-2">
                <label
                  v-for="field in availableFields"
                  :key="field.value"
                  class="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    v-model="selectedFields"
                    :value="field.value"
                    class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-300"
                  />
                  <span class="text-sm text-cafe">{{ field.label }}</span>
                </label>
              </div>
              <button
                @click="toggleAllFields"
                class="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                {{ selectedFields.length === availableFields.length ? 'Deseleccionar todos' : 'Seleccionar todos' }}
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <button
              @click="close"
              :disabled="exporting"
              class="min-h-[44px] px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancelar
            </button>

            <button
              @click="exportPatients"
              :disabled="exporting || selectedFields.length === 0"
              class="min-h-[44px] px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-300 flex items-center gap-2"
            >
              <ArrowDownTrayIcon v-if="!exporting" class="w-5 h-5" aria-hidden="true" />
              <span v-if="exporting">Exportando...</span>
              <span v-else>Exportar</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon, DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

interface Props {
  modelValue: boolean
  totalPatients: number
  filteredCount: number
  selectedCount?: number
  hasFilters?: boolean
  currentFilters?: any
  selectedIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedCount: 0,
  hasFilters: false,
  currentFilters: () => ({}),
  selectedIds: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const toast = useToast()

const format = ref<'csv' | 'xlsx'>('csv')
const scope = ref<'all' | 'filtered' | 'selected'>('all')
const selectedFields = ref<string[]>([
  'nombre_completo',
  'email',
  'telefono',
  'area_de_acompanamiento',
  'frecuencia',
  'activo'
])
const exporting = ref(false)

const availableFields = [
  { value: 'nombre_completo', label: 'Nombre Completo' },
  { value: 'email', label: 'Email' },
  { value: 'telefono', label: 'Teléfono' },
  { value: 'area_de_acompanamiento', label: 'Área' },
  { value: 'frecuencia', label: 'Frecuencia' },
  { value: 'activo', label: 'Estado' },
  { value: 'ultima_sesion', label: 'Última Sesión' },
  { value: 'proxima_sesion', label: 'Próxima Sesión' },
  { value: 'total_sesiones', label: 'Total Sesiones' },
  { value: 'created_at', label: 'Fecha de Registro' }
]

const close = () => {
  if (!exporting.value) {
    emit('update:modelValue', false)
  }
}

const toggleAllFields = () => {
  if (selectedFields.value.length === availableFields.length) {
    selectedFields.value = []
  } else {
    selectedFields.value = availableFields.map(f => f.value)
  }
}

const exportPatients = async () => {
  if (selectedFields.value.length === 0) {
    toast.warning('Selecciona al menos un campo para exportar')
    return
  }

  try {
    exporting.value = true

    // Build query params
    const params = new URLSearchParams({
      format: format.value,
      scope: scope.value,
      fields: selectedFields.value.join(',')
    })

    if (scope.value === 'filtered' && props.currentFilters) {
      params.append('filters', JSON.stringify(props.currentFilters))
    }

    if (scope.value === 'selected' && props.selectedIds.length > 0) {
      params.append('selectedIds', props.selectedIds.join(','))
    }

    const response = await fetch(`/api/patients/export?${params.toString()}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || 'Error al exportar pacientes')
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pacientes_${new Date().toISOString().split('T')[0]}.${format.value}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Pacientes exportados correctamente')
    close()
  } catch (error: any) {
    toast.error(error.message || 'Error al exportar pacientes')
  } finally {
    exporting.value = false
  }
}

// Set initial scope based on available options
watchEffect(() => {
  if (props.selectedCount > 0) {
    scope.value = 'selected'
  } else if (props.hasFilters) {
    scope.value = 'filtered'
  } else {
    scope.value = 'all'
  }
})
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
</style>
