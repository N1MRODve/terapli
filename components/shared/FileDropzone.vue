<template>
  <div
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
    class="relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center"
    :class="[
      isDragging ? 'border-purple-600 bg-purple-50' : 'border-gray-300 bg-gray-50',
      hasError ? 'border-red-400 bg-red-50' : '',
      file ? 'border-green-400 bg-green-50' : ''
    ]"
  >
    <!-- Icon -->
    <div class="mb-4">
      <ArrowUpTrayIcon
        v-if="!file"
        class="w-12 h-12 mx-auto"
        :class="isDragging ? 'text-purple-600' : 'text-gray-400'"
        aria-hidden="true"
      />
      <DocumentTextIcon
        v-else
        class="w-12 h-12 mx-auto text-green-600"
        aria-hidden="true"
      />
    </div>

    <!-- Content -->
    <div v-if="!file">
      <p class="text-lg font-medium text-cafe mb-2">
        Arrastra tu archivo aquí
      </p>
      <p class="text-sm text-gray-500 mb-4">
        o haz clic para seleccionar
      </p>
      <label class="inline-block">
        <span
          class="min-h-[44px] px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-all font-medium shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-2"
        >
          <FolderOpenIcon class="w-5 h-5" aria-hidden="true" />
          <span>Seleccionar archivo</span>
        </span>
        <input
          type="file"
          :accept="accept"
          @change="handleFileSelect"
          class="hidden"
          :aria-label="ariaLabel"
        />
      </label>
      <p class="text-xs text-gray-400 mt-4">
        {{ supportedFormats }}
      </p>
      <p class="text-xs text-gray-400">
        Tamaño máximo: {{ maxSizeMB }}MB
      </p>
    </div>

    <!-- File selected -->
    <div v-else class="flex items-center justify-center gap-4">
      <div class="text-left flex-1">
        <p class="text-sm font-semibold text-cafe">
          {{ file.name }}
        </p>
        <p class="text-xs text-gray-500">
          {{ formatFileSize(file.size) }}
        </p>
      </div>
      <button
        @click="removeFile"
        class="min-h-[44px] min-w-[44px] p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
        aria-label="Eliminar archivo"
      >
        <XMarkIcon class="w-6 h-6" aria-hidden="true" />
      </button>
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" class="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
      <p class="text-sm text-red-800 font-medium">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowUpTrayIcon, DocumentTextIcon, FolderOpenIcon, XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  accept?: string
  maxSize?: number // in bytes
  supportedFormats?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: '.csv,.xlsx,.xls',
  maxSize: 10 * 1024 * 1024, // 10MB default
  supportedFormats: 'CSV, XLSX',
  ariaLabel: 'Seleccionar archivo para subir'
})

const emit = defineEmits<{
  'file-selected': [file: File]
  'file-removed': []
  'error': [message: string]
}>()

const file = ref<File | null>(null)
const isDragging = ref(false)
const errorMessage = ref<string>('')
const hasError = computed(() => !!errorMessage.value)
const maxSizeMB = computed(() => Math.round(props.maxSize / (1024 * 1024)))

const validateFile = (selectedFile: File): boolean => {
  errorMessage.value = ''

  // Check file size
  if (selectedFile.size > props.maxSize) {
    errorMessage.value = `El archivo es demasiado grande. Máximo permitido: ${maxSizeMB.value}MB`
    emit('error', errorMessage.value)
    return false
  }

  // Check file extension
  const extension = selectedFile.name.split('.').pop()?.toLowerCase()
  const acceptedExtensions = props.accept.split(',').map(ext => ext.trim().replace('.', ''))

  if (!extension || !acceptedExtensions.includes(extension)) {
    errorMessage.value = `Formato de archivo no válido. Solo se permiten: ${props.supportedFormats}`
    emit('error', errorMessage.value)
    return false
  }

  return true
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const selectedFile = target.files?.[0]

  if (selectedFile && validateFile(selectedFile)) {
    file.value = selectedFile
    emit('file-selected', selectedFile)
  }

  // Reset input
  target.value = ''
}

const handleDragOver = (event: DragEvent) => {
  isDragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const droppedFile = event.dataTransfer?.files[0]

  if (droppedFile && validateFile(droppedFile)) {
    file.value = droppedFile
    emit('file-selected', droppedFile)
  }
}

const removeFile = () => {
  file.value = null
  errorMessage.value = ''
  emit('file-removed')
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Expose methods for parent component
defineExpose({
  removeFile
})
</script>
