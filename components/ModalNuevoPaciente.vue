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
          Nuevo Paciente
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
      <form @submit.prevent="guardarPaciente" class="px-6 py-6 space-y-6">
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

            <!-- Primera Sesión -->
            <div>
              <label for="primera_sesion" class="block text-sm font-medium text-[#5D4A44] mb-1">
                Primera Sesión <span class="text-red-500">*</span>
              </label>
              <input
                id="primera_sesion"
                v-model="formulario.primera_sesion"
                type="datetime-local"
                required
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
              />
              <p class="text-xs text-cafe/60 mt-1">
                📅 Fecha de inicio de seguimiento
              </p>
            </div>

            <!-- Estado Activo -->
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
          </div>

          <!-- Notas Iniciales -->
          <div>
            <label for="notas_iniciales" class="block text-sm font-medium text-[#5D4A44] mb-1">
              Notas Iniciales (Opcional)
            </label>
            <textarea
              id="notas_iniciales"
              v-model="formulario.notas_iniciales"
              rows="3"
              class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white resize-none"
              placeholder="Observaciones iniciales, motivo de consulta, etc."
            ></textarea>
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
            {{ guardando ? 'Guardando...' : 'Crear Paciente' }}
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
  }
})

const emit = defineEmits(['cerrar', 'paciente-creado'])

const { supabase, waitForUser, getUserId } = useSupabase()
const user = useSupabaseUser()

const formulario = ref({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  area_acompanamiento: '',
  frecuencia: '',
  primera_sesion: '',
  activo: true,
  notas_iniciales: ''
})

const guardando = ref(false)
const error = ref('')

// Resetear formulario cuando se abre el modal
watch(() => props.mostrar, (nuevo) => {
  if (nuevo) {
    resetearFormulario()
  }
})

const resetearFormulario = () => {
  formulario.value = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    area_acompanamiento: '',
    frecuencia: '',
    primera_sesion: '',
    activo: true,
    notas_iniciales: ''
  }
  error.value = ''
}

const cerrarModal = () => {
  if (!guardando.value) {
    emit('cerrar')
  }
}

const guardarPaciente = async () => {
  try {
    guardando.value = true
    error.value = ''

    // Esperar a que el usuario esté disponible (fix para race condition)
    await waitForUser()

    // Verificar que el usuario esté autenticado
    const userId = getUserId()
    if (!userId) {
      throw new Error('Usuario no autenticado. Por favor, vuelve a iniciar sesión.')
    }

    console.log('Creando nuevo paciente...')

    // 1. Crear registro en pacientes directamente (sin crear usuario auth primero)
    // El ID se generará automáticamente con gen_random_uuid()
    const nombreCompleto = `${formulario.value.nombre} ${formulario.value.apellido_paterno} ${formulario.value.apellido_materno || ''}`.trim()
    
    const { data: pacienteData, error: pacienteError } = await supabase
      .from('pacientes')
      .insert({
        psicologa_id: userId,
        email: formulario.value.email, // Guardamos el email para futuro registro
        nombre_completo: nombreCompleto, // Guardamos el nombre temporalmente
        telefono: formulario.value.telefono,
        area_de_acompanamiento: formulario.value.area_acompanamiento,
        frecuencia: formulario.value.frecuencia,
        activo: formulario.value.activo,
        metadata: {
          nombre: formulario.value.nombre,
          apellido_paterno: formulario.value.apellido_paterno,
          apellido_materno: formulario.value.apellido_materno,
          fecha_nacimiento: formulario.value.fecha_nacimiento,
          notas_iniciales: formulario.value.notas_iniciales,
          fecha_registro: new Date().toISOString(),
          primera_sesion: formulario.value.primera_sesion,
          estado_registro: 'pendiente' // Indica que el paciente aún no ha creado su cuenta
        }
      })
      .select()
      .single()

    if (pacienteError) {
      console.error('Error al crear paciente:', pacienteError)
      throw pacienteError
    }

    console.log('Nuevo paciente creado:', pacienteData)
    const pacienteId = pacienteData.id

    // 2. Crear registro de primera sesión programada si existe
    if (formulario.value.primera_sesion) {
      await supabase
        .from('sesiones')
        .insert({
          paciente_id: pacienteId,
          psicologa_id: user.value.id,
          fecha: formulario.value.primera_sesion,
          estado: 'pendiente',
          notas: 'Primera sesión programada'
        })
    }

    // 3. Si hay notas iniciales, crear registro en notas_terapeuticas
    if (formulario.value.notas_iniciales) {
      await supabase
        .from('notas_terapeuticas')
        .insert({
          paciente_id: pacienteId,
          psicologa_id: user.value.id,
          contenido: formulario.value.notas_iniciales,
          tipo: 'evaluacion_inicial'
        })
    }

    // 4. TODO: Enviar email de invitación al paciente para que cree su cuenta
    // Esto se implementará más adelante con una función edge

    // Emitir evento de éxito
    emit('paciente-creado', pacienteData)
    emit('cerrar')
    
    // Resetear formulario
    resetearFormulario()

  } catch (err) {
    console.error('Error al crear paciente:', err)
    error.value = err.message || 'Error al crear el paciente. Por favor, intenta nuevamente.'
  } finally {
    guardando.value = false
  }
}

const generateTemporaryPassword = () => {
  // Ya no se usa, pero lo dejamos por si acaso
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
</script>
