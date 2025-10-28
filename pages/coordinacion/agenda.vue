<template>
  <div>
    <NuxtLayout name="coordinacion">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-serif font-bold text-cafe mb-2">
          Agenda Global
        </h1>
        <p class="text-lg text-cafe/70">
          Gestión y coordinación de todas las sesiones de terapeutas
        </p>
      </div>

      <!-- Filtros y Selector de Vista -->
      <div class="mb-6 flex flex-wrap gap-3">
        <!-- Selector de terapeuta -->
        <select
          v-model="terapeutaFiltro"
          class="px-4 py-2 rounded-lg border border-[#EAD5D3]/40 bg-white text-cafe focus:ring-2 focus:ring-terracota focus:border-transparent"
          @change="cargarCitasSegunVista"
        >
          <option value="">Todos los terapeutas</option>
          <option
            v-for="terapeuta in terapeutas"
            :key="terapeuta.id"
            :value="terapeuta.id"
          >
            {{ terapeuta.nombre_completo }}
          </option>
        </select>

        <!-- Selector de Vista -->
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

        <!-- Botón Nueva Cita -->
        <button
          @click="abrirModalNuevaCita()"
          class="ml-auto px-5 py-2.5 rounded-lg font-medium bg-gradient-to-r from-terracota to-rosa text-white hover:from-terracota/90 hover:to-rosa/90 shadow-md transition-all"
        >
          <span class="mr-2">+</span>
          Nueva Cita
        </button>
      </div>

      <!-- Vista Diaria -->
      <div v-if="vistaActual === 'dia'" class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-6">
        <div class="mb-6 flex items-center gap-4">
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

        <div class="mb-6">
          <h2 class="text-2xl font-serif font-semibold text-cafe mb-1">
            {{ formatearFechaLegible(fechaSeleccionada) }}
          </h2>
          <p class="text-cafe/60">
            {{ citasDelDia.length }} cita{{ citasDelDia.length !== 1 ? 's' : '' }} programada{{ citasDelDia.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <div v-if="cargando" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-terracota"></div>
        </div>

        <div v-else-if="citasDelDia.length === 0" class="text-center py-12">
          <span class="text-6xl mb-4 block">📅</span>
          <p class="text-lg text-cafe font-medium mb-2">Sin citas programadas</p>
          <p class="text-cafe/60">No hay citas para {{ formatearFechaLegible(fechaSeleccionada) }}</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="cita in citasDelDia"
            :key="cita.cita_id"
            class="bg-gradient-to-r from-base-bg to-white rounded-lg p-5 border-l-4 hover:shadow-md transition-all"
            :class="obtenerColorEstado(cita.estado)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-3xl">{{ obtenerIconoTipo(cita.modalidad) }}</span>
                  <div>
                    <h3 class="text-lg font-semibold text-cafe">
                      {{ cita.paciente_nombre }}
                    </h3>
                    <p class="text-sm text-cafe/60">
                      {{ cita.hora_inicio }} - {{ cita.hora_fin }} · {{ cita.terapeuta_nombre }}
                    </p>
                  </div>
                </div>

                <div v-if="cita.observaciones" class="mt-3 p-3 bg-white/50 rounded-lg">
                  <p class="text-sm text-cafe/70">
                    <span class="font-medium">Notas:</span> {{ cita.observaciones }}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista Semanal/Mensual similar a terapeuta -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-6">
        <div class="text-center py-12">
          <span class="text-6xl mb-4 block">🗓️</span>
          <p class="text-lg text-cafe font-medium mb-2">Vista en desarrollo</p>
          <p class="text-cafe/60">La vista {{ vistaActual }} estará disponible pronto</p>
        </div>
      </div>

      <!-- Modal de Nueva Cita -->
      <ModalNuevaCita
        :mostrar="modalNuevaCitaAbierto"
        :fecha-preseleccionada="fechaModalCita"
        :hora-preseleccionada="horaModalCita"
        @cerrar="cerrarModalNuevaCita"
        @cita-creada="onCitaCreada"
      />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'coordinacion'
})

const { getCitasPorDia, getTerapeutas, listenRealtimeCitasGlobal } = useCitas()
const supabase = useSupabaseClient()

// Estado
const vistaActual = ref('dia')
const fechaSeleccionada = ref(formatearFecha(new Date()))
const terapeutaFiltro = ref('')
const cargando = ref(false)
const citasDelDia = ref<any[]>([])
const terapeutas = ref<any[]>([])

// Realtime
const realtimeChannel = ref<any>(null)

// Modal
const modalNuevaCitaAbierto = ref(false)
const fechaModalCita = ref('')
const horaModalCita = ref('')

const vistas = [
  { id: 'dia', nombre: 'Día', icono: '📅' },
  { id: 'semana', nombre: 'Semana', icono: '📆' },
  { id: 'mes', nombre: 'Mes', icono: '🗓️' }
]

// Métodos
async function cargarTerapeutas() {
  const lista = await getTerapeutas()
  terapeutas.value = lista
}

async function cargarCitasDelDia() {
  cargando.value = true
  try {
    if (terapeutaFiltro.value) {
      // Cargar citas del terapeuta específico
      citasDelDia.value = await getCitasPorDia(fechaSeleccionada.value, terapeutaFiltro.value)
    } else {
      // Cargar todas las citas del día (sin filtro de terapeuta)
      const { data, error } = await supabase
        .from('vista_agenda_terapeutas')
        .select('*')
        .eq('fecha_cita', fechaSeleccionada.value)
        .neq('estado', 'cancelada')
        .order('hora_inicio', { ascending: true })
      
      if (error) {
        console.error('Error al cargar citas:', error)
        citasDelDia.value = []
      } else {
        citasDelDia.value = data || []
      }
    }
  } finally {
    cargando.value = false
  }
}

function cargarCitasSegunVista() {
  if (vistaActual.value === 'dia') {
    cargarCitasDelDia()
  }
  // Agregar más vistas según sea necesario
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

function abrirModalNuevaCita(fecha?: string) {
  fechaModalCita.value = fecha || fechaSeleccionada.value
  modalNuevaCitaAbierto.value = true
}

function cerrarModalNuevaCita() {
  modalNuevaCitaAbierto.value = false
  fechaModalCita.value = ''
}

function onCitaCreada() {
  cargarCitasDelDia()
}

function formatearFecha(fecha: Date): string {
  return fecha.toISOString().split('T')[0] || ''
}

function formatearFechaLegible(fecha: string): string {
  const date = new Date(fecha + 'T00:00:00')
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`
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
    realizada: 'border-blue-400'
  }
  return colores[estado] || 'border-gray-400'
}

function obtenerEstiloEstado(estado: string): string {
  const estilos: Record<string, string> = {
    confirmada: 'bg-green-100 text-green-700',
    pendiente: 'bg-yellow-100 text-yellow-700',
    cancelada: 'bg-red-100 text-red-700',
    realizada: 'bg-blue-100 text-blue-700'
  }
  return estilos[estado] || 'bg-gray-100 text-gray-700'
}

// Realtime
function inicializarRealtime() {
  realtimeChannel.value = listenRealtimeCitasGlobal(manejarCambioRealtime)
}

function manejarCambioRealtime(evento: 'INSERT' | 'UPDATE' | 'DELETE', cita: any) {
  console.log('📡 Evento Realtime global recibido:', evento, cita)
  cargarCitasDelDia()
}

function desuscribirseRealtime() {
  if (realtimeChannel.value) {
    realtimeChannel.value.unsubscribe()
    realtimeChannel.value = null
  }
}

// Watchers
watch([vistaActual, fechaSeleccionada, terapeutaFiltro], () => {
  cargarCitasSegunVista()
})

// Lifecycle
onMounted(async () => {
  await cargarTerapeutas()
  await cargarCitasDelDia()
  inicializarRealtime()
})

onUnmounted(() => {
  desuscribirseRealtime()
})
</script>
