<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="handleClose">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all">
              <!-- Header -->
              <DialogTitle as="h3" class="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#027368] to-[#025951] flex items-center justify-center text-white">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Nueva Cita
              </DialogTitle>

              <!-- Form -->
              <form @submit.prevent="handleSubmit" class="space-y-5">

                <!-- Paciente con Autocompletar -->
                <div class="relative">
                  <label class="block text-sm font-semibold text-neutral-700 mb-2">
                    Paciente *
                  </label>

                  <!-- Modo: Seleccionar paciente existente -->
                  <div v-if="!modoCrearPaciente" class="space-y-2">
                    <!-- Input de búsqueda -->
                    <div class="relative">
                      <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        class="w-full px-4 py-3 pr-10 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#027368] focus:border-transparent transition-all"
                        @focus="showDropdown = true"
                        @blur="handleBlur"
                      />
                      <div class="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg v-if="loadingPacientes" class="animate-spin h-5 w-5 text-[#027368]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    <!-- Dropdown de resultados -->
                    <div
                      v-if="showDropdown && (hasPacientes || searchQuery.trim().length > 0)"
                      class="absolute z-10 w-full mt-1 bg-white border-2 border-neutral-200 rounded-xl shadow-xl max-h-64 overflow-y-auto"
                    >
                      <!-- Pacientes encontrados -->
                      <button
                        v-for="paciente in pacientes"
                        :key="paciente.id"
                        type="button"
                        class="w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0"
                        @click="selectPaciente(paciente)"
                      >
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <p class="font-semibold text-neutral-900">{{ paciente.nombre_completo }}</p>
                            <p class="text-sm text-neutral-600">{{ paciente.email }}</p>
                            <p v-if="paciente.telefono" class="text-xs text-neutral-500">{{ paciente.telefono }}</p>
                          </div>
                          <!-- Badge de bonos -->
                          <div v-if="paciente.sesiones_restantes_total > 0" class="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                            </svg>
                            {{ paciente.sesiones_restantes_total }} sesiones
                          </div>
                        </div>
                      </button>

                      <!-- Opción de crear nuevo paciente -->
                      <button
                        v-if="searchQuery.trim().length > 0"
                        type="button"
                        class="w-full px-4 py-3 text-left bg-neutral-50 hover:bg-neutral-100 transition-colors border-t-2 border-neutral-200 font-medium text-[#027368] flex items-center gap-2"
                        @click="activarModoCrearPaciente"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Crear nuevo paciente
                      </button>

                      <!-- Sin resultados -->
                      <div v-if="!hasPacientes && !loadingPacientes" class="px-4 py-8 text-center text-neutral-500">
                        <svg class="w-12 h-12 mx-auto mb-2 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p class="font-medium">No se encontraron pacientes</p>
                        <p class="text-sm">Intenta con otro criterio de búsqueda</p>
                      </div>
                    </div>

                    <!-- Paciente seleccionado -->
                    <div
                      v-if="formData.paciente_id && pacienteSeleccionado"
                      class="flex items-center justify-between px-4 py-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl"
                    >
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                          {{ pacienteSeleccionado.nombre_completo.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="font-semibold text-neutral-900">{{ pacienteSeleccionado.nombre_completo }}</p>
                          <p class="text-sm text-neutral-600">{{ pacienteSeleccionado.email }}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        @click="limpiarSeleccion"
                        class="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        <svg class="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Modo: Crear nuevo paciente -->
                  <div v-else class="space-y-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="font-semibold text-neutral-900 flex items-center gap-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Crear Nuevo Paciente
                      </h4>
                      <button
                        type="button"
                        @click="cancelarCrearPaciente"
                        class="text-sm text-neutral-600 hover:text-neutral-900"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div class="col-span-2">
                        <input
                          v-model="nuevoPaciente.nombre_completo"
                          type="text"
                          placeholder="Nombre completo *"
                          class="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div class="col-span-2">
                        <input
                          v-model="nuevoPaciente.email"
                          type="email"
                          placeholder="Email *"
                          class="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          v-model="nuevoPaciente.telefono"
                          type="tel"
                          placeholder="Teléfono"
                          class="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          v-model="nuevoPaciente.fecha_nacimiento"
                          type="date"
                          placeholder="Fecha de nacimiento"
                          class="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="crearPacienteYSeleccionar"
                      :disabled="!nuevoPaciente.nombre_completo || !nuevoPaciente.email || creandoPaciente"
                      class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                    >
                      <svg v-if="creandoPaciente" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ creandoPaciente ? 'Creando...' : 'Crear Paciente' }}
                    </button>
                  </div>
                </div>

                <!-- Fecha y Hora -->
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-neutral-700 mb-2">
                      Fecha *
                    </label>
                    <input
                      v-model="formData.fecha_cita"
                      type="date"
                      required
                      class="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#027368] focus:border-transparent transition-all"
                      @change="validateInRealTime"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-neutral-700 mb-2">
                      Hora inicio *
                    </label>
                    <input
                      v-model="formData.hora_inicio"
                      type="time"
                      required
                      class="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#027368] focus:border-transparent transition-all"
                      @change="validateInRealTime"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-neutral-700 mb-2">
                      Hora fin *
                    </label>
                    <input
                      v-model="formData.hora_fin"
                      type="time"
                      required
                      class="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#027368] focus:border-transparent transition-all"
                      @change="validateInRealTime"
                    />
                  </div>
                </div>

                <!-- Validación en tiempo real -->
                <div
                  v-if="validationMessage"
                  class="px-4 py-3 rounded-xl flex items-start gap-3"
                  :class="{
                    'bg-red-50 border-2 border-red-200': validationMessage.type === 'error',
                    'bg-yellow-50 border-2 border-yellow-200': validationMessage.type === 'warning',
                    'bg-emerald-50 border-2 border-emerald-200': validationMessage.type === 'success'
                  }"
                >
                  <svg
                    class="w-5 h-5 mt-0.5 flex-shrink-0"
                    :class="{
                      'text-red-600': validationMessage.type === 'error',
                      'text-yellow-600': validationMessage.type === 'warning',
                      'text-emerald-600': validationMessage.type === 'success'
                    }"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path v-if="validationMessage.type === 'error'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    <path v-else-if="validationMessage.type === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    <path v-else fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <p class="text-sm font-medium flex-1" :class="{
                    'text-red-800': validationMessage.type === 'error',
                    'text-yellow-800': validationMessage.type === 'warning',
                    'text-emerald-800': validationMessage.type === 'success'
                  }">
                    {{ validationMessage.text }}
                  </p>
                </div>

                <!-- Modalidad -->
                <div>
                  <label class="block text-sm font-semibold text-neutral-700 mb-2">
                    Modalidad *
                  </label>
                  <div class="grid grid-cols-3 gap-3">
                    <button
                      v-for="modalidad in modalidades"
                      :key="modalidad.value"
                      type="button"
                      @click="formData.modalidad = modalidad.value"
                      class="px-4 py-3 rounded-xl border-2 transition-all font-medium flex flex-col items-center gap-2"
                      :class="formData.modalidad === modalidad.value
                        ? 'border-[#027368] bg-[#027368]/5 text-[#027368]'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'"
                    >
                      <span class="text-2xl">{{ modalidad.icon }}</span>
                      <span class="text-sm">{{ modalidad.label }}</span>
                    </button>
                  </div>
                </div>

                <!-- Ubicación / Enlace -->
                <div v-if="formData.modalidad === 'presencial'">
                  <label class="block text-sm font-semibold text-neutral-700 mb-2">
                    Ubicación
                  </label>
                  <input
                    v-model="formData.ubicacion"
                    type="text"
                    placeholder="Dirección del consultorio"
                    class="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#027368] focus:border-transparent transition-all"
                  />
                </div>

                <div v-if="formData.modalidad === 'online'">
                  <label class="block text-sm font-semibold text-neutral-700 mb-2">
                    Enlace de videollamada
                  </label>
                  <input
                    v-model="formData.enlace_videollamada"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    class="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#027368] focus:border-transparent transition-all"
                  />
                </div>

                <!-- Observaciones -->
                <div>
                  <label class="block text-sm font-semibold text-neutral-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    v-model="formData.observaciones"
                    rows="3"
                    placeholder="Notas adicionales sobre esta cita..."
                    class="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#027368] focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>

                <!-- Botones de acción -->
                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    @click="handleClose"
                    class="flex-1 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-all font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="isSubmitting || !canSubmit"
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-[#027368] to-[#025951] text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg v-if="isSubmitting" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isSubmitting ? 'Creando...' : 'Crear Cita' }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { usePacientes, type PacienteBusqueda, type CreatePacienteParams } from '~/composables/usePacientes'
import { useAgendaEnhanced, type CreateAppointmentParams } from '~/composables/useAgendaEnhanced'
import { agendaLogger } from '~/utils/agenda-logger'

// Props
const props = defineProps<{
  isOpen: boolean
  fechaInicial?: string
  horaInicial?: string
  horaFinal?: string
}>()

// Emits
const emit = defineEmits<{
  close: []
  created: [cita: any]
}>()

// Composables
const {
  pacientes,
  loading: loadingPacientes,
  hasPacientes,
  searchQuery,
  createPaciente,
  loadAllPacientes,
  clearSearch
} = usePacientes()

const {
  createAppointment,
  validateAppointment
} = useAgendaEnhanced()

// Estado
const showDropdown = ref(false)
const modoCrearPaciente = ref(false)
const creandoPaciente = ref(false)
const isSubmitting = ref(false)
const pacienteSeleccionado = ref<PacienteBusqueda | null>(null)
const validationMessage = ref<{ type: 'error' | 'warning' | 'success', text: string } | null>(null)
const validationTimeout = ref<NodeJS.Timeout | null>(null)

// Form data
const formData = ref<CreateAppointmentParams>({
  paciente_id: '',
  fecha_cita: props.fechaInicial || '',
  hora_inicio: props.horaInicial || '',
  hora_fin: '',
  modalidad: 'online',
  estado: 'pending'
})

const nuevoPaciente = ref<CreatePacienteParams>({
  nombre_completo: '',
  email: '',
  telefono: '',
  fecha_nacimiento: ''
})

// Modalidades
const modalidades = [
  { value: 'presencial', label: 'Presencial', icon: '🏢' },
  { value: 'online', label: 'Online', icon: '💻' },
  { value: 'telefonica', label: 'Teléfono', icon: '📞' }
]

// Computadas
const canSubmit = computed(() => {
  return formData.value.paciente_id &&
    formData.value.fecha_cita &&
    formData.value.hora_inicio &&
    formData.value.hora_fin &&
    formData.value.modalidad &&
    !isSubmitting.value
})

// Métodos
function handleClose() {
  resetForm()
  emit('close')
}

function resetForm() {
  formData.value = {
    paciente_id: '',
    fecha_cita: props.fechaInicial || '',
    hora_inicio: props.horaInicial || '',
    hora_fin: '',
    modalidad: 'online',
    estado: 'pending'
  }
  pacienteSeleccionado.value = null
  clearSearch()
  showDropdown.value = false
  modoCrearPaciente.value = false
  validationMessage.value = null
}

function selectPaciente(paciente: PacienteBusqueda) {
  pacienteSeleccionado.value = paciente
  formData.value.paciente_id = paciente.id
  searchQuery.value = paciente.nombre_completo
  showDropdown.value = false

  agendaLogger.debug('patient_select', `Paciente seleccionado: ${paciente.nombre_completo}`)
}

function limpiarSeleccion() {
  pacienteSeleccionado.value = null
  formData.value.paciente_id = ''
  searchQuery.value = ''
}

function handleBlur() {
  // Delay para permitir click en dropdown
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

function activarModoCrearPaciente() {
  modoCrearPaciente.value = true
  showDropdown.value = false

  // Pre-llenar con el texto de búsqueda si parece un nombre
  if (searchQuery.value.trim().length > 0 && !searchQuery.value.includes('@')) {
    nuevoPaciente.value.nombre_completo = searchQuery.value.trim()
  }
}

function cancelarCrearPaciente() {
  modoCrearPaciente.value = false
  nuevoPaciente.value = {
    nombre_completo: '',
    email: '',
    telefono: '',
    fecha_nacimiento: ''
  }
}

async function crearPacienteYSeleccionar() {
  creandoPaciente.value = true

  try {
    const result = await createPaciente(nuevoPaciente.value)

    if (result.success && result.data) {
      // Seleccionar el paciente recién creado
      selectPaciente(result.data)

      // Resetear modo creación
      modoCrearPaciente.value = false
      nuevoPaciente.value = {
        nombre_completo: '',
        email: '',
        telefono: '',
        fecha_nacimiento: ''
      }

      validationMessage.value = {
        type: 'success',
        text: `Paciente "${result.data.nombre_completo}" creado exitosamente`
      }

      setTimeout(() => {
        validationMessage.value = null
      }, 3000)

    } else {
      validationMessage.value = {
        type: 'error',
        text: result.error || 'Error al crear paciente'
      }
    }

  } catch (err: any) {
    validationMessage.value = {
      type: 'error',
      text: err.message || 'Error inesperado al crear paciente'
    }
  } finally {
    creandoPaciente.value = false
  }
}

async function validateInRealTime() {
  // Cancelar validación anterior
  if (validationTimeout.value) {
    clearTimeout(validationTimeout.value)
  }

  // Validar solo si hay fecha, hora inicio y hora fin
  if (!formData.value.fecha_cita || !formData.value.hora_inicio || !formData.value.hora_fin) {
    validationMessage.value = null
    return
  }

  // Esperar 500ms después del último cambio
  validationTimeout.value = setTimeout(async () => {
    try {
      const result = await validateAppointment({
        paciente_id: formData.value.paciente_id || 'temp',
        fecha_cita: formData.value.fecha_cita,
        hora_inicio: formData.value.hora_inicio,
        hora_fin: formData.value.hora_fin
      })

      if (result.valid) {
        validationMessage.value = {
          type: 'success',
          text: 'Horario disponible ✓'
        }
      } else {
        validationMessage.value = {
          type: 'error',
          text: result.error || 'Conflicto detectado'
        }
      }

    } catch (err: any) {
      agendaLogger.error('validation', 'Error en validación en tiempo real', err)
    }
  }, 500)
}

async function handleSubmit() {
  if (!canSubmit.value) return

  isSubmitting.value = true
  validationMessage.value = null

  try {
    agendaLogger.clickCreate(formData.value.fecha_cita, formData.value.hora_inicio)

    const result = await createAppointment(formData.value)

    if (result.success && result.data) {
      agendaLogger.create(result.data.id, formData.value.fecha_cita, formData.value.hora_inicio)

      emit('created', result.data)
      handleClose()

    } else {
      validationMessage.value = {
        type: 'error',
        text: result.error || 'Error al crear la cita'
      }
    }

  } catch (err: any) {
    validationMessage.value = {
      type: 'error',
      text: err.message || 'Error inesperado'
    }
    agendaLogger.error('api_error', 'Error en handleSubmit', err)

  } finally {
    isSubmitting.value = false
  }
}

// Auto-calcular hora_fin cuando cambia hora_inicio
// Calcula 1 hora después (60 minutos) por defecto
// El usuario puede editar manualmente hora_fin después
watch(() => formData.value.hora_inicio, (newHora) => {
  if (newHora) {
    const [hours, minutes] = newHora.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + 60  // +60 minutos (1 hora)
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    formData.value.hora_fin = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }
})

// Watch isOpen para cargar pacientes y pre-llenar formulario
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadAllPacientes()

    // Pre-llenar fecha y hora si se proporcionan
    if (props.fechaInicial) {
      formData.value.fecha_cita = props.fechaInicial
    }
    if (props.horaInicial) {
      formData.value.hora_inicio = props.horaInicial
    }
    // Si viene horaFinal de click-drag, usarla en vez del auto-cálculo
    if (props.horaFinal) {
      formData.value.hora_fin = props.horaFinal
    }
  }
})

// Lifecycle
onMounted(() => {
  // Cargar pacientes al abrir modal
  if (props.isOpen) {
    loadAllPacientes()
  }
})
</script>

<style scoped>
/* Animaciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Scrollbar personalizado para dropdown */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #027368;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #025951;
}
</style>
