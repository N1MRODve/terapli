<template>
  <div
    v-if="mostrar"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="cerrarModal"
  >
    <div class="bg-[#F9F7F3] rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-[#F9F7F3] border-b border-[#D8AFA0]/30 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-['Lora'] text-[#5D4A44] font-semibold">
            {{ titulo || 'Nueva Cita' }}
          </h2>
          <p v-if="fechaPreseleccionada" class="text-sm text-[#5D4A44]/60 mt-1">
            {{ formatearFechaLegible(fechaPreseleccionada) }} a las {{ horaPreseleccionada }}
          </p>
        </div>
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

      <!-- Contenido -->
      <form @submit.prevent="guardarCita" class="px-6 py-6 space-y-6">
        <!-- Paso 1: Selección de Paciente -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-['Lora'] text-[#5D4A44] font-semibold">
              1. Seleccionar Paciente
            </h3>
            <button
              v-if="!mostrarFormularioPacienteNuevo"
              type="button"
              @click="toggleFormularioPacienteNuevo"
              class="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm flex items-center gap-1"
            >
              <span>+</span>
              <span>Nuevo Paciente</span>
            </button>
          </div>

          <!-- Selector de Paciente Existente -->
          <div v-if="!mostrarFormularioPacienteNuevo" class="space-y-3">
            <!-- Buscador de pacientes -->
            <div class="relative">
              <input
                v-model="busquedaPaciente"
                type="text"
                placeholder="Buscar paciente por nombre..."
                class="w-full px-4 py-2.5 pl-10 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
                @focus="mostrarListaPacientes = true"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5D4A44]/50">
                🔍
              </span>
            </div>

            <!-- Lista de pacientes filtrados -->
            <div
              v-if="mostrarListaPacientes && pacientesFiltrados.length > 0"
              class="border border-[#D8AFA0]/30 rounded-lg bg-white max-h-60 overflow-y-auto shadow-lg"
            >
              <button
                v-for="paciente in pacientesFiltrados"
                :key="paciente.id"
                type="button"
                @click="seleccionarPaciente(paciente)"
                class="w-full px-4 py-3 text-left hover:bg-[#F9F7F3] transition-colors border-b border-[#D8AFA0]/20 last:border-b-0"
              >
                <div class="font-medium text-[#5D4A44]">
                  {{ paciente.nombre }} {{ paciente.apellido_paterno }}
                </div>
                <div class="text-sm text-[#5D4A44]/60">
                  {{ paciente.email }}
                </div>
              </button>
            </div>

            <!-- Paciente seleccionado -->
            <div
              v-if="formulario.paciente_id && pacienteSeleccionado"
              class="p-4 bg-green-50 border-2 border-green-200 rounded-lg"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-2xl">✓</span>
                    <span class="font-semibold text-green-800">
                      {{ pacienteSeleccionado.nombre }} {{ pacienteSeleccionado.apellido_paterno }}
                    </span>
                  </div>
                  <div class="text-sm text-green-700">
                    {{ pacienteSeleccionado.email }}
                  </div>
                  
                  <!-- Información de bono si existe -->
                  <div v-if="infoBono.tiene_bono" class="mt-2 p-2 bg-white rounded border border-green-300">
                    <div class="flex items-center gap-2 text-sm">
                      <span>🎫</span>
                      <span class="font-medium">Bono activo:</span>
                      <span :class="[
                        'font-bold',
                        infoBono.sesiones_restantes <= 1 ? 'text-red-600' : 'text-green-700'
                      ]">
                        {{ infoBono.sesiones_restantes }} sesión{{ infoBono.sesiones_restantes !== 1 ? 'es' : '' }} disponible{{ infoBono.sesiones_restantes !== 1 ? 's' : '' }}
                      </span>
                    </div>
                    
                    <!-- Alerta si quedan pocas sesiones -->
                    <div v-if="infoBono.sesiones_restantes <= 2" class="mt-2 flex items-start gap-2 p-2 bg-amber-50 border border-amber-300 rounded text-xs">
                      <span>⚠️</span>
                      <span class="text-amber-800">
                        {{ infoBono.sesiones_restantes === 1 
                          ? 'Esta es la última sesión del bono. Considere informar al paciente.' 
                          : 'Quedan pocas sesiones. Considere informar al paciente para renovar.' }}
                      </span>
                    </div>
                    
                    <!-- Checkbox para descontar de bono -->
                    <div class="mt-2 flex items-center gap-2">
                      <input
                        id="descontar-bono"
                        v-model="formulario.descontar_de_bono"
                        type="checkbox"
                        class="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                      />
                      <label for="descontar-bono" class="text-sm text-green-800 font-medium">
                        Descontar sesión de este bono al completar
                      </label>
                    </div>
                  </div>
                  
                  <!-- Sin bono activo -->
                  <div v-else class="mt-2 text-xs text-green-600">
                    💳 Sin bono activo - Sesión por pago individual
                  </div>
                </div>
                <button
                  type="button"
                  @click="deseleccionarPaciente"
                  class="text-green-600 hover:text-green-800 text-sm"
                >
                  Cambiar
                </button>
              </div>
            </div>
          </div>

          <!-- Formulario de Paciente Nuevo -->
          <div v-else class="space-y-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-2xl">✨</span>
                <span class="font-semibold text-purple-900">Crear Nuevo Paciente</span>
              </div>
              <button
                type="button"
                @click="toggleFormularioPacienteNuevo"
                class="text-purple-600 hover:text-purple-800 text-sm"
              >
                Cancelar
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Nombre -->
              <div>
                <label class="block text-sm font-medium text-[#5D4A44] mb-1">
                  Nombre <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="pacienteNuevo.nombre"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
                  placeholder="Nombre"
                />
              </div>

              <!-- Apellido Paterno -->
              <div>
                <label class="block text-sm font-medium text-[#5D4A44] mb-1">
                  Apellido Paterno <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="pacienteNuevo.apellido_paterno"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
                  placeholder="Apellido paterno"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-[#5D4A44] mb-1">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="pacienteNuevo.email"
                  type="email"
                  required
                  class="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <!-- Teléfono -->
              <div>
                <label class="block text-sm font-medium text-[#5D4A44] mb-1">
                  Teléfono
                </label>
                <input
                  v-model="pacienteNuevo.telefono"
                  type="tel"
                  class="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
                  placeholder="+52 123 456 7890"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Paso 2: Detalles de la Cita -->
        <div class="space-y-4 pt-4 border-t border-[#D8AFA0]/30">
          <h3 class="text-lg font-['Lora'] text-[#5D4A44] font-semibold">
            2. Detalles de la Cita
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Fecha -->
            <div>
              <label class="block text-sm font-medium text-[#5D4A44] mb-1">
                Fecha <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formulario.fecha"
                type="date"
                required
                :min="fechaMinima"
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
              />
            </div>

            <!-- Hora de Inicio -->
            <div>
              <label class="block text-sm font-medium text-[#5D4A44] mb-1">
                Hora de Inicio <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formulario.hora_inicio"
                required
                @change="calcularHoraFin"
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
              >
                <option value="">Seleccionar hora</option>
                <option v-for="hora in horasDisponibles" :key="hora" :value="hora">
                  {{ hora }}
                </option>
              </select>
            </div>

            <!-- Duración -->
            <div>
              <label class="block text-sm font-medium text-[#5D4A44] mb-1">
                Duración <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formulario.duracion"
                required
                @change="calcularHoraFin"
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
              >
                <option value="30">30 minutos</option>
                <option value="60" selected>60 minutos (1 hora)</option>
                <option value="90">90 minutos (1.5 horas)</option>
                <option value="120">120 minutos (2 horas)</option>
              </select>
            </div>

            <!-- Hora de Fin (automática) -->
            <div>
              <label class="block text-sm font-medium text-[#5D4A44] mb-1">
                Hora de Fin
              </label>
              <input
                :value="formulario.hora_fin"
                type="text"
                readonly
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg bg-gray-100 text-[#5D4A44]/60"
                placeholder="Se calculará automáticamente"
              />
            </div>

            <!-- Tipo de Sesión -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-[#5D4A44] mb-2">
                Tipo de Sesión <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="tipo in tiposSesion"
                  :key="tipo.valor"
                  type="button"
                  @click="formulario.tipo = tipo.valor"
                  :class="[
                    'p-4 border-2 rounded-lg transition-all text-center',
                    formulario.tipo === tipo.valor
                      ? 'border-[#D8AFA0] bg-[#D8AFA0]/10'
                      : 'border-[#D8AFA0]/30 hover:border-[#D8AFA0]/50'
                  ]"
                >
                  <div class="text-3xl mb-2">{{ tipo.icono }}</div>
                  <div class="font-medium text-[#5D4A44]">{{ tipo.nombre }}</div>
                </button>
              </div>
            </div>

            <!-- Estado -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-[#5D4A44] mb-2">
                Estado <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  v-for="estado in estadosCita"
                  :key="estado.valor"
                  type="button"
                  @click="formulario.estado = estado.valor"
                  :class="[
                    'p-3 border-2 rounded-lg transition-all text-center',
                    formulario.estado === estado.valor
                      ? estado.claseActivo
                      : 'border-gray-300 hover:border-gray-400'
                  ]"
                >
                  <div class="text-2xl mb-1">{{ estado.icono }}</div>
                  <div class="font-medium text-sm text-[#5D4A44]">{{ estado.nombre }}</div>
                </button>
              </div>
            </div>

            <!-- Notas -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-[#5D4A44] mb-1">
                Notas (opcional)
              </label>
              <textarea
                v-model="formulario.notas"
                rows="3"
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white resize-none"
                placeholder="Notas sobre la cita, recordatorios, etc."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Alertas de validación -->
        <div v-if="conflictoHorario" class="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <div class="flex items-start gap-3">
            <span class="text-2xl">⚠️</span>
            <div>
              <div class="font-semibold text-yellow-800 mb-1">
                Conflicto de Horario
              </div>
              <div class="text-sm text-yellow-700">
                Ya existe una cita en este horario. Verifica la disponibilidad.
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex gap-3 pt-4 border-t border-[#D8AFA0]/30">
          <button
            type="button"
            @click="cerrarModal"
            class="flex-1 px-6 py-3 border-2 border-[#D8AFA0] text-[#5D4A44] rounded-lg hover:bg-[#D8AFA0]/10 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="!formularioValido || guardando"
            class="flex-1 px-6 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#D8AFA0]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ guardando ? 'Guardando...' : 'Guardar Cita' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  mostrar: {
    type: Boolean,
    default: false
  },
  fechaPreseleccionada: {
    type: String,
    default: ''
  },
  horaPreseleccionada: {
    type: String,
    default: ''
  },
  titulo: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['cerrar', 'citaCreada'])

// Composables
const { crearCita, getCitasPorDia, verificarBonoActivo } = useCitas()

// Estado
const busquedaPaciente = ref('')
const mostrarListaPacientes = ref(false)
const mostrarFormularioPacienteNuevo = ref(false)
const pacienteSeleccionado = ref<any>(null)
const guardando = ref(false)
const conflictoHorario = ref(false)
const infoBono = ref({
  tiene_bono: false,
  sesiones_restantes: 0,
  bono_id: undefined as string | undefined
})

const formulario = ref({
  paciente_id: '',
  paciente_nombre: '',
  fecha: props.fechaPreseleccionada || formatearFecha(new Date()),
  hora_inicio: props.horaPreseleccionada || '',
  hora_fin: '',
  duracion: '60',
  tipo: 'presencial',
  estado: 'pendiente',
  notas: '',
  descontar_de_bono: false,
  bono_id: undefined as string | undefined
})

const pacienteNuevo = ref({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  email: '',
  telefono: '',
  area_acompanamiento: 'Otro'
})

// Pacientes de prueba (modo demo)
const pacientesDemo = ref([
  { id: 'pac-1', nombre: 'María', apellido_paterno: 'González', email: 'maria@ejemplo.com' },
  { id: 'pac-2', nombre: 'Carlos', apellido_paterno: 'Ruiz', email: 'carlos@ejemplo.com' },
  { id: 'pac-3', nombre: 'Ana', apellido_paterno: 'López', email: 'ana@ejemplo.com' },
  { id: 'pac-4', nombre: 'Roberto', apellido_paterno: 'Sánchez', email: 'roberto@ejemplo.com' },
  { id: 'pac-5', nombre: 'Laura', apellido_paterno: 'Martínez', email: 'laura@ejemplo.com' },
  { id: 'pac-6', nombre: 'Pedro', apellido_paterno: 'Gómez', email: 'pedro@ejemplo.com' },
  { id: 'pac-7', nombre: 'Isabel', apellido_paterno: 'Torres', email: 'isabel@ejemplo.com' }
])

// Configuración
const horasDisponibles = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
]

const tiposSesion = [
  { valor: 'presencial', nombre: 'Presencial', icono: '🏥' },
  { valor: 'online', nombre: 'Online', icono: '💻' },
  { valor: 'telefonica', nombre: 'Telefónica', icono: '📞' }
]

const estadosCita = [
  { valor: 'confirmada', nombre: 'Confirmada', icono: '✅', claseActivo: 'border-green-500 bg-green-50' },
  { valor: 'pendiente', nombre: 'Pendiente', icono: '⏳', claseActivo: 'border-yellow-500 bg-yellow-50' },
  { valor: 'cancelada', nombre: 'Cancelada', icono: '❌', claseActivo: 'border-red-500 bg-red-50' },
  { valor: 'completada', nombre: 'Completada', icono: '✓', claseActivo: 'border-blue-500 bg-blue-50' }
]

// Computed
const fechaMinima = computed(() => {
  return formatearFecha(new Date())
})

const pacientesFiltrados = computed(() => {
  if (!busquedaPaciente.value) return pacientesDemo.value
  
  const busqueda = busquedaPaciente.value.toLowerCase()
  return pacientesDemo.value.filter(p => 
    p.nombre.toLowerCase().includes(busqueda) ||
    p.apellido_paterno.toLowerCase().includes(busqueda) ||
    p.email.toLowerCase().includes(busqueda)
  )
})

const formularioValido = computed(() => {
  const validoPaciente = mostrarFormularioPacienteNuevo.value
    ? pacienteNuevo.value.nombre && pacienteNuevo.value.apellido_paterno && pacienteNuevo.value.email
    : formulario.value.paciente_id

  return validoPaciente &&
    formulario.value.fecha &&
    formulario.value.hora_inicio &&
    formulario.value.hora_fin &&
    formulario.value.tipo &&
    formulario.value.estado
})

// Métodos
async function seleccionarPaciente(paciente: any) {
  pacienteSeleccionado.value = paciente
  formulario.value.paciente_id = paciente.id
  formulario.value.paciente_nombre = `${paciente.nombre} ${paciente.apellido_paterno}`
  busquedaPaciente.value = formulario.value.paciente_nombre
  mostrarListaPacientes.value = false
  
  // Verificar si tiene bono activo
  const resultadoBono = await verificarBonoActivo(paciente.id)
  infoBono.value = resultadoBono
  
  // Pre-seleccionar descontar de bono si tiene bono activo
  if (resultadoBono.tiene_bono && resultadoBono.sesiones_restantes > 0) {
    formulario.value.descontar_de_bono = true
    formulario.value.bono_id = resultadoBono.bono_id
  }
}

function deseleccionarPaciente() {
  pacienteSeleccionado.value = null
  formulario.value.paciente_id = ''
  formulario.value.paciente_nombre = ''
  formulario.value.descontar_de_bono = false
  formulario.value.bono_id = undefined
  busquedaPaciente.value = ''
  infoBono.value = {
    tiene_bono: false,
    sesiones_restantes: 0,
    bono_id: undefined
  }
}

function toggleFormularioPacienteNuevo() {
  mostrarFormularioPacienteNuevo.value = !mostrarFormularioPacienteNuevo.value
  if (mostrarFormularioPacienteNuevo.value) {
    deseleccionarPaciente()
  }
}

function calcularHoraFin() {
  if (!formulario.value.hora_inicio || !formulario.value.duracion) return

  const partes = formulario.value.hora_inicio.split(':').map(Number)
  const horas = partes[0] || 0
  const minutos = partes[1] || 0
  const duracionMinutos = parseInt(formulario.value.duracion)
  
  const fechaInicio = new Date()
  fechaInicio.setHours(horas, minutos, 0, 0)
  
  const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000)
  
  const horaFin = String(fechaFin.getHours()).padStart(2, '0')
  const minutosFin = String(fechaFin.getMinutes()).padStart(2, '0')
  
  formulario.value.hora_fin = `${horaFin}:${minutosFin}`
}

async function verificarConflicto() {
  const citas = await getCitasPorDia(formulario.value.fecha)
  
  conflictoHorario.value = citas.some((cita: any) => {
    if (cita.estado === 'cancelada') return false
    
    const inicioExistente = cita.hora_inicio
    const finExistente = cita.hora_fin
    const inicioNueva = formulario.value.hora_inicio
    const finNueva = formulario.value.hora_fin
    
    return (
      (inicioNueva >= inicioExistente && inicioNueva < finExistente) ||
      (finNueva > inicioExistente && finNueva <= finExistente) ||
      (inicioNueva <= inicioExistente && finNueva >= finExistente)
    )
  })
}

async function crearPacienteNuevo() {
  // TODO: Implementar creación de paciente en Supabase
  // Por ahora, crear un ID temporal para modo demo
  const nuevoId = 'pac-nuevo-' + Date.now()
  
  const paciente = {
    id: nuevoId,
    nombre: pacienteNuevo.value.nombre,
    apellido_paterno: pacienteNuevo.value.apellido_paterno,
    apellido_materno: pacienteNuevo.value.apellido_materno,
    email: pacienteNuevo.value.email,
    telefono: pacienteNuevo.value.telefono,
    area_acompanamiento: pacienteNuevo.value.area_acompanamiento
  }
  
  // Agregar a la lista demo
  pacientesDemo.value.push(paciente)
  
  return paciente
}

async function guardarCita() {
  guardando.value = true
  
  try {
    // Verificar conflictos de horario
    await verificarConflicto()
    
    if (conflictoHorario.value) {
      guardando.value = false
      return
    }
    
    // Si es paciente nuevo, crearlo primero
    if (mostrarFormularioPacienteNuevo.value) {
      const paciente = await crearPacienteNuevo()
      formulario.value.paciente_id = paciente.id
      formulario.value.paciente_nombre = `${paciente.nombre} ${paciente.apellido_paterno}`
    }
    
    // Crear la cita
    const resultado = await crearCita({
      paciente_id: formulario.value.paciente_id,
      paciente_nombre: formulario.value.paciente_nombre,
      fecha: formulario.value.fecha,
      hora_inicio: formulario.value.hora_inicio,
      hora_fin: formulario.value.hora_fin,
      tipo: formulario.value.tipo as 'presencial' | 'online' | 'telefonica',
      estado: formulario.value.estado as 'confirmada' | 'pendiente' | 'cancelada' | 'completada',
      notas: formulario.value.notas,
      descontar_de_bono: formulario.value.descontar_de_bono,
      bono_id: formulario.value.bono_id
    })
    
    if (resultado.success) {
      emit('citaCreada')
      cerrarModal()
    }
  } catch (error) {
    console.error('Error al guardar cita:', error)
  } finally {
    guardando.value = false
  }
}

function cerrarModal() {
  emit('cerrar')
  resetFormulario()
}

function resetFormulario() {
  formulario.value = {
    paciente_id: '',
    paciente_nombre: '',
    fecha: formatearFecha(new Date()),
    hora_inicio: '',
    hora_fin: '',
    duracion: '60',
    tipo: 'presencial',
    estado: 'pendiente',
    notas: '',
    descontar_de_bono: false,
    bono_id: undefined
  }
  
  pacienteNuevo.value = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    telefono: '',
    area_acompanamiento: 'Otro'
  }
  
  busquedaPaciente.value = ''
  mostrarFormularioPacienteNuevo.value = false
  pacienteSeleccionado.value = null
  conflictoHorario.value = false
  infoBono.value = {
    tiene_bono: false,
    sesiones_restantes: 0,
    bono_id: undefined
  }
}

function formatearFecha(fecha: Date): string {
  const resultado = fecha.toISOString().split('T')[0]
  return resultado || ''
}

function formatearFechaLegible(fecha: string): string {
  const date = new Date(fecha + 'T00:00:00')
  const opciones: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('es-MX', opciones)
}

// Watchers
watch([() => formulario.value.fecha, () => formulario.value.hora_inicio, () => formulario.value.hora_fin], () => {
  if (formulario.value.fecha && formulario.value.hora_inicio && formulario.value.hora_fin) {
    verificarConflicto()
  }
})

watch(() => props.fechaPreseleccionada, (nueva) => {
  if (nueva) {
    formulario.value.fecha = nueva
  }
})

watch(() => props.horaPreseleccionada, (nueva) => {
  if (nueva) {
    formulario.value.hora_inicio = nueva
    calcularHoraFin()
  }
})

// Inicializar
onMounted(() => {
  if (props.horaPreseleccionada) {
    calcularHoraFin()
  }
})
</script>

<style scoped>
/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.fixed {
  animation: fadeIn 0.2s ease-out;
}

.bg-\[\#F9F7F3\] {
  animation: slideUp 0.3s ease-out;
}
</style>
