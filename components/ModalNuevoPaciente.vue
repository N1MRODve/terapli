<template>
  <div
    v-if="mostrar"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="intentarCerrar"
    @keydown.esc="intentarCerrar"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">
            {{ paso === 1 ? 'Nuevo Paciente' : 'Configurar Tratamiento' }}
          </h2>
          <p v-if="paso === 1" class="text-sm text-gray-500 mt-0.5">
            Datos básicos del paciente
          </p>
          <p v-else class="text-sm text-gray-500 mt-0.5">
            {{ formulario.nombre }} {{ formulario.apellido }}
          </p>
        </div>
        <button
          @click="intentarCerrar"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Cerrar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Indicador de pasos -->
      <div class="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <div
            class="flex items-center gap-1.5"
            :class="paso === 1 ? 'text-violet-600' : 'text-gray-400'"
          >
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
              :class="paso === 1 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'"
            >
              {{ paso > 1 ? '✓' : '1' }}
            </div>
            <span class="text-sm font-medium">Datos</span>
          </div>
          <div class="flex-1 h-0.5 bg-gray-200 mx-2">
            <div
              class="h-full bg-violet-600 transition-all duration-300"
              :style="{ width: paso > 1 ? '100%' : '0%' }"
            ></div>
          </div>
          <div
            class="flex items-center gap-1.5"
            :class="paso === 2 ? 'text-violet-600' : 'text-gray-400'"
          >
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
              :class="paso === 2 ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'"
            >
              2
            </div>
            <span class="text-sm font-medium">Tratamiento</span>
          </div>
        </div>
      </div>

      <!-- PASO 1: Datos Básicos -->
      <form v-if="paso === 1" @submit.prevent="siguientePaso" class="p-6 space-y-4">
        <!-- Nombre -->
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span class="text-red-500">*</span>
          </label>
          <input
            id="nombre"
            v-model="formulario.nombre"
            type="text"
            required
            autofocus
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
            placeholder="Nombre del paciente"
            :class="{ 'border-red-300 bg-red-50': erroresCampo.nombre }"
          />
          <p v-if="erroresCampo.nombre" class="text-xs text-red-500 mt-1">{{ erroresCampo.nombre }}</p>
        </div>

        <!-- Apellido -->
        <div>
          <label for="apellido" class="block text-sm font-medium text-gray-700 mb-1">
            Apellido <span class="text-red-500">*</span>
          </label>
          <input
            id="apellido"
            v-model="formulario.apellido"
            type="text"
            required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
            placeholder="Apellido(s) del paciente"
            :class="{ 'border-red-300 bg-red-50': erroresCampo.apellido }"
          />
          <p v-if="erroresCampo.apellido" class="text-xs text-red-500 mt-1">{{ erroresCampo.apellido }}</p>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email <span class="text-red-500">*</span>
          </label>
          <input
            id="email"
            v-model="formulario.email"
            type="email"
            required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
            placeholder="correo@ejemplo.com"
            :class="{ 'border-red-300 bg-red-50': erroresCampo.email }"
          />
          <p v-if="erroresCampo.email" class="text-xs text-red-500 mt-1">{{ erroresCampo.email }}</p>
        </div>

        <!-- Teléfono -->
        <div>
          <label for="telefono" class="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            id="telefono"
            v-model="formulario.telefono"
            type="tel"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
            placeholder="+34 600 000 000"
          />
        </div>

        <!-- Mensaje de Error -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Botones Paso 1 -->
        <div class="flex flex-col gap-2 pt-4 border-t border-gray-100">
          <button
            type="submit"
            :disabled="!formularioPaso1Valido"
            class="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Crear y configurar tratamiento
          </button>
          <button
            type="button"
            @click="crearSoloBasico"
            :disabled="!formularioPaso1Valido || guardando"
            class="w-full px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="guardando" class="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
            {{ guardando ? 'Creando...' : 'Crear paciente sin configurar' }}
          </button>
          <button
            type="button"
            @click="intentarCerrar"
            class="w-full px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>

      <!-- PASO 2: Configurar Tratamiento -->
      <form v-else @submit.prevent="guardarPaciente" class="p-6 space-y-5">

        <!-- Primera Sesión -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-700">Primera Sesión</h3>
            <label class="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
              <input
                v-model="sinPrimeraSesion"
                type="checkbox"
                class="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
              />
              No agendar ahora
            </label>
          </div>

          <div v-if="!sinPrimeraSesion" class="grid grid-cols-2 gap-3">
            <div>
              <label for="fecha_sesion" class="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
              <input
                id="fecha_sesion"
                v-model="formulario.fecha_primera_sesion"
                type="date"
                :min="fechaMinima"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label for="hora_sesion" class="block text-xs font-medium text-gray-600 mb-1">Hora</label>
              <select
                id="hora_sesion"
                v-model="formulario.hora_primera_sesion"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              >
                <option value="">Seleccionar</option>
                <option v-for="hora in horasDisponibles" :key="hora" :value="hora">{{ hora }}</option>
              </select>
            </div>
          </div>

          <!-- Atajos rápidos -->
          <div v-if="!sinPrimeraSesion" class="flex gap-2 flex-wrap">
            <button
              v-for="atajo in atajosHorario"
              :key="atajo.label"
              type="button"
              @click="aplicarAtajo(atajo)"
              class="text-xs px-3 py-1.5 rounded-lg border transition-all"
              :class="atajoSeleccionado === atajo.label
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'"
            >
              {{ atajo.label }}
            </button>
          </div>
        </div>

        <!-- Tipo de Bono -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-700">Tipo de Bono</h3>
            <span class="text-xs text-gray-400">Opcional</span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="tipo in tiposBono"
              :key="tipo.value"
              type="button"
              @click="formulario.tipo_bono = formulario.tipo_bono === tipo.value ? '' : tipo.value"
              class="p-3 rounded-lg border text-left transition-all"
              :class="formulario.tipo_bono === tipo.value
                ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-500/20'
                : 'border-gray-200 hover:border-gray-300'"
            >
              <span class="text-sm font-medium" :class="formulario.tipo_bono === tipo.value ? 'text-violet-700' : 'text-gray-700'">
                {{ tipo.label }}
              </span>
              <p class="text-xs mt-0.5" :class="formulario.tipo_bono === tipo.value ? 'text-violet-600' : 'text-gray-500'">
                {{ tipo.desc }}
              </p>
            </button>
          </div>
        </div>

        <!-- Crear Bono Prepagado -->
        <div v-if="formulario.tipo_bono && formulario.tipo_bono !== 'otro'" class="space-y-3">
          <label class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              v-model="formulario.crear_bono"
              type="checkbox"
              class="mt-0.5 w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
            />
            <div>
              <span class="text-sm font-medium text-gray-700">Crear bono prepagado</span>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ sesionesSegunTipo }} sesiones por {{ precioSugeridoBono }}
              </p>
            </div>
          </label>

          <!-- Detalles del bono si está activado -->
          <div v-if="formulario.crear_bono" class="bg-violet-50 rounded-lg p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-violet-700">Monto total</span>
              <div class="flex items-center gap-1">
                <span class="text-violet-400">€</span>
                <input
                  v-model.number="formulario.bono_monto"
                  type="number"
                  min="0"
                  step="5"
                  class="w-20 px-2 py-1 border border-violet-200 rounded text-right text-sm font-medium text-violet-700 focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <label class="flex items-center gap-2 text-sm text-violet-600 cursor-pointer">
              <input
                v-model="formulario.bono_renovacion_automatica"
                type="checkbox"
                class="w-4 h-4 text-violet-600 border-violet-300 rounded focus:ring-violet-500"
              />
              Renovación automática
            </label>
          </div>
        </div>

        <!-- Notas -->
        <div class="space-y-2">
          <label for="notas" class="block text-sm font-medium text-gray-700">
            Observaciones <span class="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            id="notas"
            v-model="formulario.notas_iniciales"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm resize-none"
            placeholder="Motivo de consulta, derivación, contexto inicial..."
          ></textarea>
          <p class="text-xs text-gray-400">Solo visible para ti, no se envía al paciente.</p>
        </div>

        <!-- Mensaje de Error -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Botones Paso 2 -->
        <div class="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            @click="paso = 1"
            class="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Atrás
          </button>
          <button
            type="submit"
            :disabled="guardando"
            class="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="guardando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ guardando ? 'Creando...' : 'Crear Paciente' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal de confirmación de cierre -->
    <div
      v-if="mostrarConfirmacionCierre"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-60"
      @click.self="mostrarConfirmacionCierre = false"
    >
      <div class="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Tienes cambios sin guardar</h3>
        <p class="text-sm text-gray-600 mb-4">Si cierras ahora, perderás los datos ingresados.</p>
        <div class="flex gap-3">
          <button
            @click="mostrarConfirmacionCierre = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continuar editando
          </button>
          <button
            @click="cerrarDefinitivo"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  mostrar: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cerrar', 'paciente-creado'])

const { supabase, waitForUser, getUserId } = useSupabase()
const { crearBono } = useBonos()
const { crearCita } = useCitas()
const user = useSupabaseUser()

// Estado del modal
const paso = ref(1)
const guardando = ref(false)
const error = ref('')
const erroresCampo = ref({})
const mostrarConfirmacionCierre = ref(false)
const sinPrimeraSesion = ref(false)
const atajoSeleccionado = ref('')

// Formulario simplificado
const formulario = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  fecha_primera_sesion: '',
  hora_primera_sesion: '',
  tipo_bono: '',
  crear_bono: false,
  bono_monto: 0,
  bono_renovacion_automatica: false,
  notas_iniciales: ''
})

// Precios base
const PRECIOS_BASE = {
  otro: 60,
  quincenal: 100,
  semanal: 160,
  mensual: 180
}

// Tipos de bono disponibles
const tiposBono = [
  { value: 'otro', label: 'A Demanda', desc: '1 sesión - 60€' },
  { value: 'quincenal', label: 'Quincenal', desc: '2 sesiones - 100€' },
  { value: 'semanal', label: 'Semanal', desc: '4 sesiones - 160€' },
  { value: 'mensual', label: 'Mensual', desc: '4 sesiones - 180€' }
]

// Computed
const formularioPaso1Valido = computed(() => {
  return formulario.value.nombre.trim() &&
         formulario.value.apellido.trim() &&
         formulario.value.email.trim() &&
         validarEmail(formulario.value.email)
})

const hayCambios = computed(() => {
  return formulario.value.nombre ||
         formulario.value.apellido ||
         formulario.value.email ||
         formulario.value.telefono
})

const sesionesSegunTipo = computed(() => {
  const mapeo = { otro: 1, quincenal: 2, semanal: 4, mensual: 4 }
  return mapeo[formulario.value.tipo_bono] || 0
})

const precioSugeridoBono = computed(() => {
  const precio = PRECIOS_BASE[formulario.value.tipo_bono] || 0
  return `€${precio}`
})

const fechaMinima = computed(() => {
  const hoy = new Date()
  return hoy.toISOString().split('T')[0]
})

const horasDisponibles = computed(() => {
  const horas = []
  for (let h = 8; h <= 20; h++) {
    horas.push(`${String(h).padStart(2, '0')}:00`)
    horas.push(`${String(h).padStart(2, '0')}:30`)
  }
  return horas
})

const atajosHorario = computed(() => {
  const hoy = new Date()

  // Mañana
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)

  // Próximo lunes
  const proximoLunes = new Date(hoy)
  const diasHastaLunes = (8 - proximoLunes.getDay()) % 7 || 7
  proximoLunes.setDate(proximoLunes.getDate() + diasHastaLunes)

  return [
    {
      label: 'Mañana 10:00',
      fecha: manana.toISOString().split('T')[0],
      hora: '10:00'
    },
    {
      label: 'Próx. Lunes 09:00',
      fecha: proximoLunes.toISOString().split('T')[0],
      hora: '09:00'
    }
  ]
})

// Watchers
watch(() => formulario.value.tipo_bono, (nuevoTipo) => {
  if (nuevoTipo === 'otro') {
    formulario.value.crear_bono = false
    formulario.value.bono_monto = 0
  } else if (formulario.value.crear_bono) {
    formulario.value.bono_monto = PRECIOS_BASE[nuevoTipo] || 0
  }
})

watch(() => formulario.value.crear_bono, (crear) => {
  if (crear && formulario.value.tipo_bono) {
    formulario.value.bono_monto = PRECIOS_BASE[formulario.value.tipo_bono] || 0
  }
})

watch(() => props.mostrar, (nuevo) => {
  if (nuevo) {
    resetearFormulario()
  }
})

// Métodos
const validarEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validarPaso1 = () => {
  erroresCampo.value = {}

  if (!formulario.value.nombre.trim()) {
    erroresCampo.value.nombre = 'El nombre es obligatorio'
  }
  if (!formulario.value.apellido.trim()) {
    erroresCampo.value.apellido = 'El apellido es obligatorio'
  }
  if (!formulario.value.email.trim()) {
    erroresCampo.value.email = 'El email es obligatorio'
  } else if (!validarEmail(formulario.value.email)) {
    erroresCampo.value.email = 'Introduce un email válido'
  }

  return Object.keys(erroresCampo.value).length === 0
}

const siguientePaso = () => {
  if (validarPaso1()) {
    paso.value = 2
    error.value = ''
  }
}

const aplicarAtajo = (atajo) => {
  formulario.value.fecha_primera_sesion = atajo.fecha
  formulario.value.hora_primera_sesion = atajo.hora
  atajoSeleccionado.value = atajo.label
}

const intentarCerrar = () => {
  if (hayCambios.value && !guardando.value) {
    mostrarConfirmacionCierre.value = true
  } else {
    cerrarDefinitivo()
  }
}

const cerrarDefinitivo = () => {
  mostrarConfirmacionCierre.value = false
  emit('cerrar')
}

const resetearFormulario = () => {
  paso.value = 1
  formulario.value = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_primera_sesion: '',
    hora_primera_sesion: '',
    tipo_bono: '',
    crear_bono: false,
    bono_monto: 0,
    bono_renovacion_automatica: false,
    notas_iniciales: ''
  }
  error.value = ''
  erroresCampo.value = {}
  sinPrimeraSesion.value = false
  atajoSeleccionado.value = ''
}

// Crear solo con datos básicos (sin paso 2)
const crearSoloBasico = async () => {
  if (!validarPaso1()) return

  // Crear paciente sin tratamiento configurado
  await crearPacienteEnBD(false)
}

// Crear paciente completo (con tratamiento)
const guardarPaciente = async () => {
  await crearPacienteEnBD(true)
}

// Función principal de creación
const crearPacienteEnBD = async (conTratamiento) => {
  try {
    guardando.value = true
    error.value = ''

    await waitForUser()
    const userId = getUserId()

    if (!userId) {
      throw new Error('Usuario no autenticado. Por favor, vuelve a iniciar sesión.')
    }

    const nombreCompleto = `${formulario.value.nombre.trim()} ${formulario.value.apellido.trim()}`

    // 1. Crear paciente
    const { data: rpcResult, error: rpcError } = await supabase.rpc('crear_paciente_simple', {
      p_email: formulario.value.email.trim().toLowerCase(),
      p_nombre_completo: nombreCompleto,
      p_telefono: formulario.value.telefono || null,
      p_area_acompanamiento: null,
      p_tipo_bono: conTratamiento ? (formulario.value.tipo_bono || null) : null,
      p_terapeuta_id: userId,
      p_metadata: {
        nombre: formulario.value.nombre.trim(),
        apellido: formulario.value.apellido.trim(),
        notas_iniciales: conTratamiento ? formulario.value.notas_iniciales : null,
        fecha_registro: new Date().toISOString(),
        estado_registro: 'activo'
      }
    })

    if (rpcError) {
      throw new Error(`Error al crear paciente: ${rpcError.message}`)
    }

    if (!rpcResult || !rpcResult.id) {
      throw new Error('Error desconocido al crear paciente')
    }

    const pacienteId = rpcResult.id

    // Si es creación básica, terminamos aquí
    if (!conTratamiento) {
      emit('paciente-creado', rpcResult)
      emit('cerrar')
      resetearFormulario()
      return
    }

    // 2. Crear bono si está seleccionado
    if (formulario.value.crear_bono && formulario.value.tipo_bono && formulario.value.tipo_bono !== 'otro') {
      try {
        const fechaInicio = new Date().toISOString().split('T')[0]
        const fechaFin = calcularFechaFin(formulario.value.tipo_bono)
        const sesiones = sesionesSegunTipo.value

        await crearBono({
          paciente_id: pacienteId,
          terapeuta_id: userId,
          tipo: formulario.value.tipo_bono,
          sesiones_totales: sesiones,
          sesiones_restantes: sesiones,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          estado: 'pendiente',
          monto_total: formulario.value.bono_monto,
          precio_por_sesion: formulario.value.bono_monto / sesiones,
          pagado: false,
          renovacion_automatica: formulario.value.bono_renovacion_automatica,
          notas: `Bono creado al registrar paciente: ${nombreCompleto}`
        })
      } catch (bonoError) {
        console.error('Error al crear bono:', bonoError)
      }
    }

    // 3. Crear cita si hay primera sesión
    if (!sinPrimeraSesion.value && formulario.value.fecha_primera_sesion && formulario.value.hora_primera_sesion) {
      try {
        const [horas, minutos] = formulario.value.hora_primera_sesion.split(':').map(Number)
        const horaFin = `${String(horas + 1).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`

        await crearCita({
          paciente_id: pacienteId,
          paciente_nombre: nombreCompleto,
          terapeuta_id: userId,
          fecha: formulario.value.fecha_primera_sesion,
          hora_inicio: formulario.value.hora_primera_sesion,
          hora_fin: horaFin,
          modalidad: 'online',
          estado: 'pendiente',
          notas: `Primera sesión: ${nombreCompleto}`,
          descontar_de_bono: false
        })
      } catch (citaError) {
        console.error('Error al crear cita:', citaError)
      }
    }

    // 4. Guardar notas si existen
    if (formulario.value.notas_iniciales) {
      await supabase
        .from('notas_terapeuticas')
        .insert({
          paciente_id: pacienteId,
          terapeuta_id: userId,
          contenido: formulario.value.notas_iniciales,
          tipo: 'evaluacion_inicial'
        })
    }

    emit('paciente-creado', rpcResult)
    emit('cerrar')
    resetearFormulario()

  } catch (err) {
    console.error('Error al crear paciente:', err)
    error.value = err.message || 'Error al crear el paciente. Por favor, intenta nuevamente.'
  } finally {
    guardando.value = false
  }
}

const calcularFechaFin = (tipo) => {
  const fecha = new Date()
  switch (tipo) {
    case 'quincenal':
      fecha.setDate(fecha.getDate() + 15)
      break
    case 'semanal':
    case 'mensual':
    default:
      fecha.setMonth(fecha.getMonth() + 1)
  }
  return fecha.toISOString().split('T')[0]
}
</script>
