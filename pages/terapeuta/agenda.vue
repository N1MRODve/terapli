<template>
  <div>
    <!-- Alerta de Bono -->
    <AlertaBono
      :mostrar="alertaBono.visible"
      :sesiones-restantes="alertaBono.sesionesRestantes"
      :paciente-nombre="alertaBono.pacienteNombre"
      :paciente-id="alertaBono.pacienteId"
      @cerrar="alertaBono.visible = false"
      @notificar="notificarPaciente"
    />
    
    <!-- Banner de Modo Demo -->
    <div class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
      <div class="flex items-start gap-3">
        <span class="text-3xl">🎭</span>
        <div class="flex-1">
          <h3 class="font-serif text-lg font-semibold text-purple-900 mb-1">
            Modo Demostración Activo
          </h3>
          <p class="text-sm text-purple-700 leading-relaxed">
            Estás viendo <strong>citas de prueba</strong> con datos simulados. 
            La tabla de citas se agregará a Supabase próximamente.
          </p>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-serif font-bold text-cafe mb-2">
        Agenda
      </h1>
      <p class="text-lg text-cafe/70">
        Gestión de citas y disponibilidad
      </p>
    </div>

    <!-- Selector de Vista -->
    <div class="mb-6 flex flex-wrap gap-3">
      <button
        v-for="vista in vistas"
        :key="vista.id"
        @click="vistaActual = vista.id"
        :class="[
          'px-5 py-2.5 rounded-lg font-medium transition-all',
          vistaActual === vista.id
            ? 'bg-terracota text-white shadow-md'
            : 'bg-white text-cafe hover:bg-terracota/10 border border-[#EAD5D3]/40'
        ]"
      >
        <span class="mr-2">{{ vista.icono }}</span>
        {{ vista.nombre }}
      </button>

      <!-- Botón de búsqueda rápida -->
      <button
        @click="mostrarBusquedaRapida = !mostrarBusquedaRapida"
        class="ml-auto px-5 py-2.5 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md transition-all"
      >
        <span class="mr-2">⚡</span>
        Buscar Disponibilidad
      </button>

      <!-- Botón de bloqueos -->
      <button
        @click="abrirModalBloqueo()"
        class="px-5 py-2.5 rounded-lg font-medium bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 shadow-md transition-all"
      >
        <span class="mr-2">🔒</span>
        Bloquear Horario
      </button>
    </div>

    <!-- Panel de Búsqueda Rápida -->
    <Transition name="slide-down">
      <div v-if="mostrarBusquedaRapida" class="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6 shadow-lg">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-serif font-semibold text-purple-900 mb-1">
              <span class="mr-2">⚡</span>
              Búsqueda Rápida de Disponibilidad
            </h3>
            <p class="text-sm text-purple-700">
              Encuentra espacios disponibles en los próximos 14 días
            </p>
          </div>
          <button
            @click="mostrarBusquedaRapida = false"
            class="text-purple-400 hover:text-purple-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div class="flex gap-3 mb-4">
          <button
            @click="buscarDisponibilidadRapida"
            :disabled="cargandoDisponibilidad"
            class="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-all font-medium"
          >
            {{ cargandoDisponibilidad ? 'Buscando...' : '🔍 Buscar Espacios' }}
          </button>
          
          <div class="text-sm text-purple-600 flex items-center">
            <span class="mr-2">📅</span>
            Próximos 14 días hábiles
          </div>
        </div>

        <!-- Resultados de disponibilidad -->
        <div v-if="disponibilidades.length > 0" class="space-y-3">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-purple-900">
              ✅ {{ disponibilidades.length }} espacios disponibles encontrados
            </p>
            <button
              @click="disponibilidades = []"
              class="text-xs text-purple-600 hover:text-purple-800"
            >
              Limpiar resultados
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            <div
              v-for="(disp, index) in disponibilidades"
              :key="index"
              class="bg-white rounded-lg p-4 border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer"
              @click="seleccionarDisponibilidad(disp)"
            >
              <div class="flex items-start justify-between">
                <div>
                  <div class="font-medium text-cafe mb-1">
                    {{ formatearFechaLegible(disp.fecha) }}
                  </div>
                  <div class="text-2xl font-bold text-purple-600">
                    {{ disp.hora }}
                  </div>
                  <div class="text-xs text-cafe/60 mt-1">
                    {{ obtenerDiaSemana(disp.fecha) }}
                  </div>
                </div>
                <span class="text-2xl">📅</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!cargandoDisponibilidad && busquedaRealizada" class="text-center py-8">
          <span class="text-4xl mb-2 block">📭</span>
          <p class="text-purple-700">
            No se encontraron espacios disponibles
          </p>
        </div>
      </div>
    </Transition>

    <!-- Vista Diaria -->
    <div v-if="vistaActual === 'dia'">
      <div class="mb-6 flex items-center gap-4 bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-4">
        <button
          @click="cambiarDia(-1)"
          class="p-2 hover:bg-terracota/10 rounded-lg transition-colors"
        >
          ← Anterior
        </button>
        
        <input
          v-model="fechaSeleccionada"
          type="date"
          class="flex-1 px-4 py-2 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20"
        />
        
        <button
          @click="irHoy"
          class="px-4 py-2 bg-terracota/10 text-terracota rounded-lg hover:bg-terracota/20 transition-colors font-medium"
        >
          Hoy
        </button>
        
        <button
          @click="cambiarDia(1)"
          class="p-2 hover:bg-terracota/10 rounded-lg transition-colors"
        >
          Siguiente →
        </button>
      </div>

      <!-- Citas del día -->
      <div class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-6">
        <div class="mb-6">
          <h2 class="text-2xl font-serif font-semibold text-cafe mb-1">
            {{ formatearFechaLegible(fechaSeleccionada) }}
          </h2>
          <p class="text-cafe/60">
            {{ citasDelDia.length }} cita{{ citasDelDia.length !== 1 ? 's' : '' }} programada{{ citasDelDia.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <div v-if="cargando" class="text-center py-12">
          <LoadingSpinner />
        </div>

        <div v-else-if="citasDelDia.length === 0" class="text-center py-12">
          <EmptyState
            icono="📅"
            titulo="Sin citas programadas"
            :descripcion="`No tienes citas para ${formatearFechaLegible(fechaSeleccionada)}`"
          />
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="cita in citasDelDia"
            :key="cita.id"
            class="bg-gradient-to-r from-base-bg to-white rounded-lg p-5 border-l-4 hover:shadow-md transition-all"
            :class="obtenerColorEstado(cita.estado)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-3xl">{{ obtenerIconoTipo(cita.tipo) }}</span>
                  <div>
                    <h3 class="text-lg font-semibold text-cafe">
                      {{ cita.paciente_nombre }}
                    </h3>
                    <p class="text-sm text-cafe/60">
                      {{ cita.hora_inicio }} - {{ cita.hora_fin }} · {{ cita.tipo }}
                    </p>
                  </div>
                </div>

                <div v-if="cita.notas" class="mt-3 p-3 bg-white/50 rounded-lg">
                  <p class="text-sm text-cafe/70">
                    <span class="font-medium">Notas:</span> {{ cita.notas }}
                  </p>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    obtenerEstiloEstado(cita.estado)
                  ]"
                >
                  {{ cita.estado }}
                </span>

                <button
                  v-if="cita.estado === 'confirmada'"
                  @click="marcarComoCompletada(cita.id)"
                  class="px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium"
                >
                  ✓ Completar
                </button>
              </div>
            </div>
          </div>

          <!-- Botón para agregar nueva cita este día -->
          <button
            @click="abrirModalNuevaCita(fechaSeleccionada)"
            class="w-full p-4 border-2 border-dashed border-[#D8AFA0]/50 rounded-lg hover:border-[#D8AFA0] hover:bg-[#D8AFA0]/5 transition-all text-[#5D4A44]/60 hover:text-[#D8AFA0] font-medium flex items-center justify-center gap-2"
          >
            <span class="text-2xl">+</span>
            <span>Agregar cita este día</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Vista Semanal -->
    <div v-if="vistaActual === 'semana'" class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-6">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-serif font-semibold text-cafe mb-1">
            Semana del {{ primerDiaSemana }}
          </h2>
          <p class="text-cafe/60">
            {{ citasSemana.length }} cita{{ citasSemana.length !== 1 ? 's' : '' }} esta semana
          </p>
        </div>

        <div class="flex gap-2">
          <button
            @click="cambiarSemana(-1)"
            class="p-2 hover:bg-terracota/10 rounded-lg transition-colors"
          >
            ← Anterior
          </button>
          <button
            @click="irSemanaActual"
            class="px-4 py-2 bg-terracota/10 text-terracota rounded-lg hover:bg-terracota/20 transition-colors font-medium"
          >
            Esta semana
          </button>
          <button
            @click="cambiarSemana(1)"
            class="p-2 hover:bg-terracota/10 rounded-lg transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2 mb-4">
        <div
          v-for="dia in diasSemana"
          :key="dia"
          class="text-center text-sm font-medium text-cafe/70 py-2"
        >
          {{ dia }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2">
        <div
          v-for="(fecha, index) in fechasSemana"
          :key="index"
          class="min-h-32 border border-[#EAD5D3]/40 rounded-lg p-2 hover:border-terracota/40 transition-all cursor-pointer"
          :class="esFechaHoy(fecha) ? 'bg-terracota/5 border-terracota' : 'bg-white'"
          @click="verDia(fecha)"
        >
          <div class="text-center mb-2">
            <div
              class="text-lg font-semibold"
              :class="esFechaHoy(fecha) ? 'text-terracota' : 'text-cafe'"
            >
              {{ obtenerDia(fecha) }}
            </div>
          </div>

          <div class="space-y-1">
            <div
              v-for="cita in obtenerCitasPorFecha(fecha)"
              :key="cita.id"
              class="text-xs bg-terracota/10 rounded p-1 truncate"
            >
              <div class="font-medium text-cafe">{{ cita.hora_inicio }}</div>
              <div class="text-cafe/60 truncate">{{ cita.paciente_nombre }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Mensual -->
    <div v-if="vistaActual === 'mes'" class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-6">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-serif font-semibold text-cafe mb-1">
            {{ nombreMes }} {{ anioActual }}
          </h2>
          <p class="text-cafe/60">
            {{ citasMes.length }} cita{{ citasMes.length !== 1 ? 's' : '' }} este mes
          </p>
        </div>

        <div class="flex gap-2">
          <button
            @click="cambiarMes(-1)"
            class="p-2 hover:bg-terracota/10 rounded-lg transition-colors"
          >
            ← Anterior
          </button>
          <button
            @click="irMesActual"
            class="px-4 py-2 bg-terracota/10 text-terracota rounded-lg hover:bg-terracota/20 transition-colors font-medium"
          >
            Este mes
          </button>
          <button
            @click="cambiarMes(1)"
            class="p-2 hover:bg-terracota/10 rounded-lg transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2 mb-4">
        <div
          v-for="dia in diasSemana"
          :key="dia"
          class="text-center text-sm font-medium text-cafe/70 py-2"
        >
          {{ dia }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2">
        <div
          v-for="(fecha, index) in fechasMes"
          :key="index"
          class="min-h-24 border rounded-lg p-2 transition-all cursor-pointer"
          :class="[
            fecha ? 'border-[#EAD5D3]/40 hover:border-terracota/40' : 'border-transparent bg-gray-50',
            fecha && esFechaHoy(fecha) ? 'bg-terracota/5 border-terracota' : 'bg-white'
          ]"
          @click="fecha && verDia(fecha)"
        >
          <div v-if="fecha" class="text-center mb-1">
            <div
              class="text-sm font-semibold"
              :class="esFechaHoy(fecha) ? 'text-terracota' : 'text-cafe'"
            >
              {{ obtenerDia(fecha) }}
            </div>
          </div>

          <div v-if="fecha" class="flex flex-col items-center gap-0.5">
            <div
              v-for="cita in obtenerCitasPorFecha(fecha).slice(0, 2)"
              :key="cita.id"
              class="w-full text-xs bg-terracota/20 rounded px-1 py-0.5 text-center"
            >
              {{ cita.hora_inicio }}
            </div>
            <div
              v-if="obtenerCitasPorFecha(fecha).length > 2"
              class="text-xs text-cafe/60 font-medium"
            >
              +{{ obtenerCitasPorFecha(fecha).length - 2 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón flotante para crear cita rápida -->
    <button
      @click="abrirModalNuevaCita()"
      class="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-terracota to-rosa text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all flex items-center justify-center text-3xl z-40"
      title="Nueva Cita"
    >
      +
    </button>

    <!-- Modal de Nueva Cita -->
    <ModalNuevaCita
      :mostrar="modalNuevaCitaAbierto"
      :fecha-preseleccionada="fechaModalCita"
      :hora-preseleccionada="horaModalCita"
      :titulo="tituloModalCita"
      @cerrar="cerrarModalNuevaCita"
      @cita-creada="onCitaCreada"
    />

    <!-- Modal de Nuevo Bloqueo -->
    <ModalNuevoBloqueo
      :mostrar="modalBloqueoAbierto"
      :fecha-preseleccionada="fechaModalBloqueo"
      :hora-preseleccionada="horaModalBloqueo"
      @cerrar="cerrarModalBloqueo"
      @bloqueo-creado="onBloqueoCreado"
    />
  </div>
</template>

<script setup lang="ts">
import ModalNuevoBloqueo from '~/components/ModalNuevoBloqueo.vue'

definePageMeta({
  layout: 'terapeuta'
})

const { getCitasPorDia, getCitasRango, buscarDisponibilidad, actualizarEstadoCita } = useCitas()

// Estado
const vistaActual = ref('dia')
const fechaSeleccionada = ref(formatearFecha(new Date()))
const mesActual = ref(new Date().getMonth())
const anioActual = ref(new Date().getFullYear())
const semanaActual = ref(0)

const cargando = ref(false)
const citasDelDia = ref<any[]>([])
const citasSemana = ref<any[]>([])
const citasMes = ref<any[]>([])

const mostrarBusquedaRapida = ref(false)
const cargandoDisponibilidad = ref(false)
const disponibilidades = ref<any[]>([])
const busquedaRealizada = ref(false)

// Modal de nueva cita
const modalNuevaCitaAbierto = ref(false)
const fechaModalCita = ref('')
const horaModalCita = ref('')
const tituloModalCita = ref('')

// Modal de nuevo bloqueo
const modalBloqueoAbierto = ref(false)
const fechaModalBloqueo = ref('')
const horaModalBloqueo = ref('')

// Estado de alerta de bono
const alertaBono = ref({
  visible: false,
  sesionesRestantes: 0,
  pacienteNombre: '',
  pacienteId: ''
})

const vistas = [
  { id: 'dia', nombre: 'Día', icono: '📅' },
  { id: 'semana', nombre: 'Semana', icono: '📆' },
  { id: 'mes', nombre: 'Mes', icono: '🗓️' }
]

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Computed
const nombreMes = computed(() => meses[mesActual.value])

const primerDiaSemana = computed(() => {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - fecha.getDay() + semanaActual.value * 7)
  return formatearFechaLegible(formatearFecha(fecha))
})

const fechasSemana = computed(() => {
  const fechas = []
  const hoy = new Date()
  const primerDia = new Date(hoy)
  primerDia.setDate(primerDia.getDate() - primerDia.getDay() + semanaActual.value * 7)
  
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(primerDia)
    fecha.setDate(fecha.getDate() + i)
    fechas.push(formatearFecha(fecha))
  }
  
  return fechas
})

const fechasMes = computed(() => {
  const fechas: (string | null)[] = []
  const primerDia = new Date(anioActual.value, mesActual.value, 1)
  const ultimoDia = new Date(anioActual.value, mesActual.value + 1, 0)
  
  // Días vacíos al inicio
  const diaSemanaInicio = primerDia.getDay()
  for (let i = 0; i < diaSemanaInicio; i++) {
    fechas.push(null)
  }
  
  // Días del mes
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const fecha = new Date(anioActual.value, mesActual.value, dia)
    fechas.push(formatearFecha(fecha))
  }
  
  return fechas
})

// Métodos
async function cargarCitasDelDia() {
  cargando.value = true
  try {
    citasDelDia.value = await getCitasPorDia(fechaSeleccionada.value)
  } finally {
    cargando.value = false
  }
}

async function cargarCitasSemana() {
  cargando.value = true
  try {
    const inicio = fechasSemana.value[0] || ''
    const fin = fechasSemana.value[6] || ''
    if (inicio && fin) {
      citasSemana.value = await getCitasRango(inicio, fin)
    }
  } finally {
    cargando.value = false
  }
}

async function cargarCitasMes() {
  cargando.value = true
  try {
    const primerDia = new Date(anioActual.value, mesActual.value, 1)
    const ultimoDia = new Date(anioActual.value, mesActual.value + 1, 0)
    
    citasMes.value = await getCitasRango(
      formatearFecha(primerDia),
      formatearFecha(ultimoDia)
    )
  } finally {
    cargando.value = false
  }
}

async function buscarDisponibilidadRapida() {
  cargandoDisponibilidad.value = true
  busquedaRealizada.value = false
  
  try {
    disponibilidades.value = await buscarDisponibilidad(14)
    busquedaRealizada.value = true
  } finally {
    cargandoDisponibilidad.value = false
  }
}

function seleccionarDisponibilidad(disp: any) {
  fechaSeleccionada.value = disp.fecha
  vistaActual.value = 'dia'
  mostrarBusquedaRapida.value = false
  cargarCitasDelDia()
  
  // Abrir modal de nueva cita con los datos preseleccionados
  abrirModalNuevaCita(disp.fecha, disp.hora)
}

function abrirModalNuevaCita(fecha?: string, hora?: string) {
  fechaModalCita.value = fecha || fechaSeleccionada.value
  horaModalCita.value = hora || ''
  tituloModalCita.value = fecha && hora ? 'Nueva Cita - Espacio Disponible' : 'Nueva Cita'
  modalNuevaCitaAbierto.value = true
}

function cerrarModalNuevaCita() {
  modalNuevaCitaAbierto.value = false
  fechaModalCita.value = ''
  horaModalCita.value = ''
  tituloModalCita.value = ''
}

function abrirModalBloqueo(fecha?: string, hora?: string) {
  fechaModalBloqueo.value = fecha || fechaSeleccionada.value
  horaModalBloqueo.value = hora || ''
  modalBloqueoAbierto.value = true
}

function cerrarModalBloqueo() {
  modalBloqueoAbierto.value = false
  fechaModalBloqueo.value = ''
  horaModalBloqueo.value = ''
}

function onBloqueoCreado() {
  // Recargar según la vista actual
  if (vistaActual.value === 'dia') {
    cargarCitasDelDia()
  } else if (vistaActual.value === 'semana') {
    cargarCitasSemana()
  } else if (vistaActual.value === 'mes') {
    cargarCitasMes()
  }
}

function onCitaCreada() {
  // Recargar las citas según la vista actual
  if (vistaActual.value === 'dia') {
    cargarCitasDelDia()
  } else if (vistaActual.value === 'semana') {
    cargarCitasSemana()
  } else if (vistaActual.value === 'mes') {
    cargarCitasMes()
  }
}

async function marcarComoCompletada(citaId: string) {
  const resultado = await actualizarEstadoCita(citaId, 'completada')
  
  // Si hay una alerta de bono, mostrarla
  if (resultado && 'alerta' in resultado && resultado.alerta) {
    const cita = citasDelDia.value.find(c => c.id === citaId)
    if (cita) {
      alertaBono.value = {
        visible: true,
        sesionesRestantes: resultado.sesiones_restantes || 0,
        pacienteNombre: cita.paciente_nombre,
        pacienteId: cita.paciente_id
      }
    }
  }
  
  // Recargar citas
  if (vistaActual.value === 'dia') {
    cargarCitasDelDia()
  } else if (vistaActual.value === 'semana') {
    cargarCitasSemana()
  } else if (vistaActual.value === 'mes') {
    cargarCitasMes()
  }
}

function notificarPaciente(pacienteId: string) {
  console.log('Notificar a paciente:', pacienteId)
  // TODO: Implementar sistema de notificaciones
  alert('Sistema de notificaciones en desarrollo. Se notificará al paciente sobre la renovación de su bono.')
}

function cambiarDia(direccion: number) {
  const fecha = new Date(fechaSeleccionada.value)
  fecha.setDate(fecha.getDate() + direccion)
  fechaSeleccionada.value = formatearFecha(fecha)
  cargarCitasDelDia()
}

function irHoy() {
  fechaSeleccionada.value = formatearFecha(new Date())
  cargarCitasDelDia()
}

function cambiarSemana(direccion: number) {
  semanaActual.value += direccion
  cargarCitasSemana()
}

function irSemanaActual() {
  semanaActual.value = 0
  cargarCitasSemana()
}

function cambiarMes(direccion: number) {
  mesActual.value += direccion
  if (mesActual.value > 11) {
    mesActual.value = 0
    anioActual.value++
  } else if (mesActual.value < 0) {
    mesActual.value = 11
    anioActual.value--
  }
  cargarCitasMes()
}

function irMesActual() {
  mesActual.value = new Date().getMonth()
  anioActual.value = new Date().getFullYear()
  cargarCitasMes()
}

function verDia(fecha: string) {
  fechaSeleccionada.value = fecha
  vistaActual.value = 'dia'
  cargarCitasDelDia()
}

function obtenerCitasPorFecha(fecha: string) {
  if (vistaActual.value === 'semana') {
    return citasSemana.value.filter(c => c.fecha === fecha)
  } else {
    return citasMes.value.filter(c => c.fecha === fecha)
  }
}

function esFechaHoy(fecha: string): boolean {
  return fecha === formatearFecha(new Date())
}

function obtenerDia(fecha: string): string {
  return new Date(fecha + 'T00:00:00').getDate().toString()
}

function formatearFecha(fecha: Date): string {
  const resultado = fecha.toISOString().split('T')[0]
  return resultado || ''
}

function formatearFechaLegible(fecha: string): string {
  const date = new Date(fecha + 'T00:00:00')
  const dia = date.getDate()
  const mes = meses[date.getMonth()]
  const anio = date.getFullYear()
  
  return `${dia} de ${mes} de ${anio}`
}

function obtenerDiaSemana(fecha: string): string {
  const date = new Date(fecha + 'T00:00:00')
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const dia = dias[date.getDay()]
  return dia || 'Día'
}

function obtenerIconoTipo(tipo: string): string {
  const iconos: Record<string, string> = {
    presencial: '🏥',
    online: '💻',
    telefonica: '📞'
  }
  return iconos[tipo] || '📅'
}

function obtenerColorEstado(estado: string): string {
  const colores: Record<string, string> = {
    confirmada: 'border-green-400',
    pendiente: 'border-yellow-400',
    cancelada: 'border-red-400',
    completada: 'border-blue-400'
  }
  return colores[estado] || 'border-gray-400'
}

function obtenerEstiloEstado(estado: string): string {
  const estilos: Record<string, string> = {
    confirmada: 'bg-green-100 text-green-700',
    pendiente: 'bg-yellow-100 text-yellow-700',
    cancelada: 'bg-red-100 text-red-700',
    completada: 'bg-blue-100 text-blue-700'
  }
  return estilos[estado] || 'bg-gray-100 text-gray-700'
}

// Watchers
watch(vistaActual, (nueva) => {
  if (nueva === 'dia') {
    cargarCitasDelDia()
  } else if (nueva === 'semana') {
    cargarCitasSemana()
  } else if (nueva === 'mes') {
    cargarCitasMes()
  }
})

// Inicializar
onMounted(() => {
  cargarCitasDelDia()
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
