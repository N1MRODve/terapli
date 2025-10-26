<template>
  <div
    v-if="mostrar"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="cerrarModal"
  >
    <div class="bg-[#F9F7F3] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-[#F9F7F3] border-b border-[#D8AFA0]/30 px-6 py-4 flex justify-between items-center">
        <h2 class="text-2xl font-['Lora'] text-[#5D4A44] font-semibold">
          Editar Paciente
        </h2>
        <button
          @click="cerrarModal"
          class="text-[#5D4A44] hover:text-[#D8AFA0] transition-colors"
          aria-label="Cerrar modal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="actualizarPaciente" class="px-6 py-6 space-y-6">
        <!-- Información Personal -->
        <div class="space-y-4">
          <h3 class="text-lg font-['Lora'] text-[#5D4A44] font-semibold">
            Información Personal
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Nombre -->
            <div>
              <label for="nombre" class="block text-sm font-medium text-[#5D4A44] mb-1">
                Nombre <span class="text-red-500">*</span>
              </label>
              <input
                id="nombre"
                v-model="formulario.nombre"
                type="text"
                required
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
                placeholder="Nombre del paciente"
              />
            </div>

            <!-- Apellido Paterno -->
            <div>
              <label for="apellido_paterno" class="block text-sm font-medium text-[#5D4A44] mb-1">
                Apellido Paterno <span class="text-red-500">*</span>
              </label>
              <input
                id="apellido_paterno"
                v-model="formulario.apellido_paterno"
                type="text"
                required
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
                placeholder="Apellido paterno"
              />
            </div>

            <!-- Apellido Materno -->
            <div>
              <label for="apellido_materno" class="block text-sm font-medium text-[#5D4A44] mb-1">
                Apellido Materno
              </label>
              <input
                id="apellido_materno"
                v-model="formulario.apellido_materno"
                type="text"
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
                placeholder="Apellido materno (opcional)"
              />
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-[#5D4A44] mb-1">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                v-model="formulario.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <!-- Teléfono -->
            <div>
              <label for="telefono" class="block text-sm font-medium text-[#5D4A44] mb-1">
                Teléfono
              </label>
              <input
                id="telefono"
                v-model="formulario.telefono"
                type="tel"
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
                placeholder="+52 123 456 7890"
              />
            </div>

            <!-- Fecha de Nacimiento -->
            <div>
              <label for="fecha_nacimiento" class="block text-sm font-medium text-[#5D4A44] mb-1">
                Fecha de Nacimiento
              </label>
              <input
                id="fecha_nacimiento"
                v-model="formulario.fecha_nacimiento"
                type="date"
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
              />
            </div>
          </div>
        </div>

        <!-- Información Terapéutica -->
        <div class="space-y-4 pt-4 border-t border-[#D8AFA0]/30">
          <h3 class="text-lg font-['Lora'] text-[#5D4A44] font-semibold">
            Información Terapéutica
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Área de Acompañamiento -->
            <div class="md:col-span-2">
              <label for="area_acompanamiento" class="block text-sm font-medium text-[#5D4A44] mb-1">
                Área de Acompañamiento <span class="text-red-500">*</span>
              </label>
              <select
                id="area_acompanamiento"
                v-model="formulario.area_acompanamiento"
                required
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
              >
                <option value="">Selecciona un área</option>
                <option value="Ansiedad">Ansiedad</option>
                <option value="Depresión">Depresión</option>
                <option value="Autoestima">Autoestima</option>
                <option value="Relaciones">Relaciones</option>
                <option value="Duelo">Duelo</option>
                <option value="Estrés Laboral">Estrés Laboral</option>
                <option value="Crecimiento Personal">Crecimiento Personal</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <!-- Frecuencia -->
            <div>
              <label for="frecuencia" class="block text-sm font-medium text-[#5D4A44] mb-1">
                Frecuencia de Sesiones <span class="text-red-500">*</span>
              </label>
              <select
                id="frecuencia"
                v-model="formulario.frecuencia"
                required
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
              >
                <option value="">Selecciona frecuencia</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>

            <!-- Estado -->
            <div>
              <label for="activo" class="block text-sm font-medium text-[#5D4A44] mb-1">
                Estado
              </label>
              <select
                id="activo"
                v-model="formulario.activo"
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
              >
                <option :value="true">Activo</option>
                <option :value="false">Inactivo</option>
              </select>
            </div>

            <!-- En Pausa -->
            <div class="md:col-span-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="formulario.en_pausa"
                  type="checkbox"
                  class="w-4 h-4 text-[#D8AFA0] border-gray-300 rounded focus:ring-[#D8AFA0]"
                />
                <span class="text-sm font-medium text-[#5D4A44]">
                  Proceso en pausa temporal
                </span>
              </label>
              <p class="text-xs text-cafe/60 mt-1 ml-6">
                ⏸️ Marca esta opción si el seguimiento está pausado temporalmente
              </p>
            </div>
          </div>
        </div>

        <!-- Mensaje de Error -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4 border-t border-[#D8AFA0]/30">
          <button
            type="button"
            @click="cerrarModal"
            :disabled="guardando"
            class="px-6 py-2 border border-[#D8AFA0] text-[#5D4A44] rounded-lg hover:bg-[#D8AFA0]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="guardando"
            class="px-6 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C69F91] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="guardando" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ guardando ? 'Actualizando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  mostrar: {
    type: Boolean,
    default: false
  },
  paciente: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['cerrar', 'paciente-actualizado'])

const { supabase } = useSupabase()

const formulario = ref({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  area_acompanamiento: '',
  frecuencia: '',
  activo: true,
  en_pausa: false
})

const guardando = ref(false)
const error = ref('')

// Cargar datos del paciente cuando se abre el modal
watch(() => props.mostrar, (nuevo) => {
  if (nuevo && props.paciente) {
    cargarDatosPaciente()
  }
})

const cargarDatosPaciente = () => {
  const p = props.paciente
  const metadata = p.metadata || {}
  
  formulario.value = {
    nombre: metadata.nombre || p.nombre?.split(' ')[0] || '',
    apellido_paterno: metadata.apellido_paterno || '',
    apellido_materno: metadata.apellido_materno || '',
    email: p.email || '',
    telefono: p.telefono || '',
    fecha_nacimiento: metadata.fecha_nacimiento || '',
    area_acompanamiento: p.area_de_acompanamiento || p.area_acompanamiento || '',
    frecuencia: p.frecuencia || '',
    activo: p.activo ?? true,
    en_pausa: p.en_pausa || metadata.en_pausa || false
  }
  error.value = ''
}

const cerrarModal = () => {
  if (!guardando.value) {
    emit('cerrar')
  }
}

const actualizarPaciente = async () => {
  try {
    guardando.value = true
    error.value = ''

    console.log('Actualizando paciente:', props.paciente.id)

    // Construir el nombre completo
    const nombreCompleto = `${formulario.value.nombre} ${formulario.value.apellido_paterno} ${formulario.value.apellido_materno || ''}`.trim()
    
    // Obtener metadata existente para no sobreescribirla completamente
    const metadataExistente = props.paciente.metadata || {}
    
    // Actualizar registro en pacientes
    const { data: pacienteData, error: pacienteError } = await supabase
      .from('pacientes')
      .update({
        email: formulario.value.email,
        nombre_completo: nombreCompleto,
        telefono: formulario.value.telefono,
        area_de_acompanamiento: formulario.value.area_acompanamiento,
        frecuencia: formulario.value.frecuencia,
        activo: formulario.value.activo,
        metadata: {
          ...metadataExistente,
          nombre: formulario.value.nombre,
          apellido_paterno: formulario.value.apellido_paterno,
          apellido_materno: formulario.value.apellido_materno,
          fecha_nacimiento: formulario.value.fecha_nacimiento,
          en_pausa: formulario.value.en_pausa,
          fecha_actualizacion: new Date().toISOString()
        }
      })
      .eq('id', props.paciente.id)
      .select()
      .single()

    if (pacienteError) {
      console.error('Error al actualizar paciente:', pacienteError)
      throw pacienteError
    }

    console.log('Paciente actualizado:', pacienteData)

    // Emitir evento de éxito
    emit('paciente-actualizado', pacienteData)
    emit('cerrar')

  } catch (err) {
    console.error('Error al actualizar paciente:', err)
    error.value = err.message || 'Error al actualizar el paciente. Por favor, intenta nuevamente.'
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
