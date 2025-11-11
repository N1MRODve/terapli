<template>
  <div class="max-w-3xl mx-auto pb-20">
    <!-- Navegación de regreso -->
    <button
      @click="$router.push('/coordinadora/pacientes')"
      class="mb-6 flex items-center gap-2 text-cafe hover:text-purple-600 transition-colors"
    >
      <span>←</span>
      <span>Volver a lista de pacientes</span>
    </button>

    <!-- Encabezado -->
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-cafe mb-2">
        Nuevo Paciente
      </h1>
      <p class="text-cafe/60">
        Completa la información del nuevo paciente
      </p>
    </div>

    <!-- Formulario -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <form @submit.prevent="guardarPaciente" class="space-y-6">
        <!-- Nombre completo -->
        <div>
          <label class="block text-sm font-medium text-cafe mb-2">
            Nombre Completo <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nombre_completo"
            type="text"
            required
            placeholder="Ej: María García López"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-cafe mb-2">
            Email <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="ejemplo@correo.com"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
          />
        </div>

        <!-- Teléfono -->
        <div>
          <label class="block text-sm font-medium text-cafe mb-2">
            Teléfono
          </label>
          <input
            v-model="form.telefono"
            type="tel"
            placeholder="+34 600 000 000"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
          />
          <p class="text-xs text-gray-500 mt-1">
            Incluye el código de país para WhatsApp
          </p>
        </div>

        <!-- Área de acompañamiento -->
        <div>
          <label class="block text-sm font-medium text-cafe mb-2">
            Área de Acompañamiento
          </label>
          <select
            v-model="form.area_de_acompanamiento"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
          >
            <option value="">Selecciona un área</option>
            <option value="Ansiedad">Ansiedad</option>
            <option value="Depresión">Depresión</option>
            <option value="Duelo">Duelo</option>
            <option value="Autoestima">Autoestima</option>
            <option value="Relaciones">Relaciones</option>
            <option value="Familia">Familia</option>
            <option value="Trauma">Trauma</option>
            <option value="Estrés">Estrés</option>
            <option value="Desarrollo Personal">Desarrollo Personal</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <!-- Frecuencia -->
        <div>
          <label class="block text-sm font-medium text-cafe mb-2">
            Frecuencia de Sesiones
          </label>
          <select
            v-model="form.frecuencia"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
          >
            <option value="">Selecciona una frecuencia</option>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
            <option value="mensual">Mensual</option>
            <option value="ocasional">Ocasional</option>
          </select>
        </div>

        <!-- Notas iniciales -->
        <div>
          <label class="block text-sm font-medium text-cafe mb-2">
            Notas Iniciales
          </label>
          <textarea
            v-model="form.notas_iniciales"
            rows="4"
            placeholder="Información relevante sobre el paciente..."
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <!-- Estado activo -->
        <div class="flex items-center gap-3">
          <input
            v-model="form.activo"
            type="checkbox"
            id="activo"
            class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-300"
          />
          <label for="activo" class="text-sm font-medium text-cafe cursor-pointer">
            Paciente activo
          </label>
        </div>

        <!-- Mensaje de error -->
        <div
          v-if="errorMensaje"
          class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
        >
          <span class="text-red-500 text-lg">⚠️</span>
          <div class="flex-1">
            <p class="text-sm font-medium text-red-800">Error al guardar</p>
            <p class="text-sm text-red-600 mt-1">{{ errorMensaje }}</p>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="cancelar"
            :disabled="guardando"
            class="flex-1 px-6 py-3 border border-gray-300 text-cafe rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="guardando || !formularioValido"
            class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="guardando" class="animate-spin">⏳</span>
            <span>{{ guardando ? 'Guardando...' : 'Guardar Paciente' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const router = useRouter()

definePageMeta({
  layout: 'coordinadora',
  middleware: ['auth', 'role-coordinadora']
})

// Estado del formulario
const form = ref({
  nombre_completo: '',
  email: '',
  telefono: '',
  area_de_acompanamiento: '',
  frecuencia: '',
  notas_iniciales: '',
  activo: true
})

const guardando = ref(false)
const errorMensaje = ref('')

// Validación
const formularioValido = computed(() => {
  return form.value.nombre_completo.trim() !== '' && 
         form.value.email.trim() !== '' &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)
})

// Funciones
const guardarPaciente = async () => {
  if (!formularioValido.value) {
    errorMensaje.value = 'Por favor completa todos los campos obligatorios'
    return
  }

  guardando.value = true
  errorMensaje.value = ''

  try {
    // Preparar datos
    const pacienteData = {
      nombre_completo: form.value.nombre_completo.trim(),
      email: form.value.email.trim().toLowerCase(),
      telefono: form.value.telefono.trim() || null,
      area_de_acompanamiento: form.value.area_de_acompanamiento || null,
      frecuencia: form.value.frecuencia || null,
      activo: form.value.activo,
      created_at: new Date().toISOString()
    }

    // Verificar si el email ya existe
    const { data: existente } = await supabase
      .from('pacientes')
      .select('id')
      .eq('email', pacienteData.email)
      .single()

    if (existente) {
      errorMensaje.value = 'Ya existe un paciente con este email'
      return
    }

    // Insertar paciente
    const { data, error } = await supabase
      .from('pacientes')
      .insert([pacienteData])
      .select()
      .single()

    if (error) throw error

    // Si hay notas iniciales, crear una sesión inicial
    if (form.value.notas_iniciales.trim() && data) {
      await supabase
        .from('sesiones')
        .insert([{
          paciente_id: data.id,
          fecha: new Date().toISOString().split('T')[0],
          notas: form.value.notas_iniciales.trim(),
          tipo: 'evaluacion_inicial'
        }])
    }

    // Redirigir al detalle del paciente creado
    router.push(`/coordinadora/pacientes/${data.id}`)
  } catch (err) {
    console.error('Error al guardar paciente:', err)
    errorMensaje.value = err.message || 'Error al guardar el paciente. Por favor intenta de nuevo.'
  } finally {
    guardando.value = false
  }
}

const cancelar = () => {
  if (guardando.value) return
  
  if (form.value.nombre_completo || form.value.email) {
    if (confirm('¿Estás seguro de cancelar? Los datos no guardados se perderán.')) {
      router.push('/coordinadora/pacientes')
    }
  } else {
    router.push('/coordinadora/pacientes')
  }
}
</script>
