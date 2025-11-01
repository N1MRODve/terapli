<template>
  <div class="space-y-6">
    <!-- Header con acciones -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-serif font-bold text-cafe">Gestión de Pacientes</h1>
          <p class="text-sm text-gray-600 mt-1">
            {{ totalPacientes }} pacientes registrados — {{ pacientesActivos }} activos
          </p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <!-- Buscador -->
          <div class="relative flex-1 min-w-[250px]">
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar por nombre, email, terapeuta o teléfono..."
              class="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all duration-200"
            />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          <!-- Botón nuevo paciente -->
          <button
            @click="irANuevoPaciente"
            class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-all duration-200 text-sm font-medium whitespace-nowrap flex items-center gap-2"
          >
            <span>➕</span>
            <span>Nuevo Paciente</span>
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
        <select
          v-model="filtroEstado"
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all duration-200"
        >
          <option value="">Todos los estados</option>
          <option value="activo">✅ Activos</option>
          <option value="inactivo">⏸️ Inactivos</option>
          <option value="pausa">⏸️ En pausa</option>
        </select>

        <select
          v-model="filtroTerapeuta"
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all duration-200"
        >
          <option value="">Todos los terapeutas</option>
          <option v-for="terapeuta in terapeutas" :key="terapeuta.id" :value="terapeuta.id">
            {{ terapeuta.nombre }}
          </option>
        </select>

        <select
          v-model="ordenarPor"
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all duration-200"
        >
          <option value="nombre">Ordenar por nombre</option>
          <option value="fecha">Fecha última sesión</option>
          <option value="citas">Más citas</option>
        </select>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Total Pacientes -->
      <div class="bg-terracota/5 rounded-xl p-4 border border-terracota/10 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center gap-3">
          <div class="text-3xl">👥</div>
          <div class="flex-1">
            <div class="text-2xl font-bold text-cafe">{{ totalPacientes }}</div>
            <div class="text-sm text-cafe/60">Total pacientes</div>
          </div>
        </div>
      </div>

      <!-- Activos -->
      <div class="bg-green-50 rounded-xl p-4 border border-green-100 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center gap-3">
          <div class="text-3xl">🟢</div>
          <div class="flex-1">
            <div class="text-2xl font-bold text-green-700">{{ pacientesActivos }}</div>
            <div class="text-sm text-green-600/80">Activos</div>
          </div>
        </div>
      </div>

      <!-- Promedio por terapeuta -->
      <div class="bg-blue-50 rounded-xl p-4 border border-blue-100 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center gap-3">
          <div class="text-3xl">🧑‍⚕️</div>
          <div class="flex-1">
            <div class="text-2xl font-bold text-blue-700">{{ promedioPorTerapeuta }}</div>
            <div class="text-sm text-blue-600/80">Prom. por terapeuta</div>
          </div>
        </div>
      </div>

      <!-- Bonos activos -->
      <div class="bg-purple-50 rounded-xl p-4 border border-purple-100 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center gap-3">
          <div class="text-3xl">💳</div>
          <div class="flex-1">
            <div class="text-2xl font-bold text-purple-700">{{ bonosActivos }}</div>
            <div class="text-sm text-purple-600/80">Bonos activos</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de pacientes -->
    <div v-if="cargando" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
      <div class="text-center text-gray-400 animate-pulse">
        <span class="text-4xl block mb-2">⏳</span>
        <p>Cargando pacientes...</p>
      </div>
    </div>

    <div v-else-if="pacientesFiltrados.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
      <div class="text-center text-gray-400">
        <span class="text-6xl block mb-4">👥</span>
        <h3 class="text-xl font-semibold text-cafe mb-2">
          No se encontraron pacientes
        </h3>
        <p class="text-gray-600 mb-4">
          {{ busqueda ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer paciente' }}
        </p>
        <button
          v-if="!busqueda"
          @click="irANuevoPaciente"
          class="inline-flex items-center px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-all duration-200"
        >
          + Crear Primer Paciente
        </button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="paciente in pacientesFiltrados"
        :key="paciente.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        @click="verDetallePaciente(paciente)"
      >
        <!-- Avatar e información principal -->
        <div class="flex items-start gap-4 mb-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-terracota to-cafe flex items-center justify-center flex-shrink-0 shadow-md">
            <span class="text-white text-xl font-semibold">
              {{ obtenerIniciales(paciente.nombre_completo) }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-cafe text-lg truncate">
              {{ paciente.nombre_completo }}
            </h3>
            <p class="text-sm text-gray-600 truncate">{{ paciente.email }}</p>
            <p v-if="paciente.telefono" class="text-sm text-gray-500 mt-1">
              📱 {{ paciente.telefono }}
            </p>
          </div>
        </div>

        <!-- Terapeuta asignado -->
        <div v-if="paciente.terapeuta_nombre" class="mb-3 flex items-center gap-2 text-sm bg-cafe/5 px-3 py-2 rounded-lg">
          <span class="text-cafe/60">🧑‍⚕️</span>
          <span class="text-cafe font-medium">{{ paciente.terapeuta_nombre }}</span>
        </div>

        <!-- Información adicional -->
        <div class="space-y-2 mb-4">
          <div v-if="paciente.area_de_acompanamiento" class="flex items-center gap-2 text-sm">
            <span class="text-gray-400">🎯</span>
            <span class="text-gray-700 truncate">{{ paciente.area_de_acompanamiento }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span class="text-gray-400">📅</span>
            <span class="text-gray-700">{{ paciente.total_citas || 0 }} sesiones</span>
          </div>
          <div v-if="paciente.ultima_cita" class="flex items-center gap-2 text-sm">
            <span class="text-gray-400">🕐</span>
            <span class="text-gray-700">Última: {{ formatearFecha(paciente.ultima_cita) }}</span>
          </div>
          <div v-if="paciente.proxima_cita" class="flex items-center gap-2 text-sm">
            <span class="text-gray-400">📆</span>
            <span class="text-gray-700">Próxima: {{ formatearFecha(paciente.proxima_cita) }}</span>
          </div>
        </div>

        <!-- Estado y acciones -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <span
            class="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
            :class="getEstadoClasses(paciente.estado)"
          >
            {{ getEstadoLabel(paciente.estado) }}
          </span>
          <div class="flex gap-2">
            <button
              @click.stop="agendarCita(paciente)"
              class="p-2 text-terracota hover:bg-terracota/10 rounded-lg transition-all duration-200"
              title="Ver agenda"
            >
              �
            </button>
            <button
              @click.stop="enviarWhatsApp(paciente)"
              class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Abrir WhatsApp"
            >
              💬
            </button>
            <button
              @click.stop="abrirDetalles(paciente)"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Ver detalles"
            >
              👁️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación (si es necesaria) -->
    <div v-if="pacientesFiltrados.length > 0 && totalPaginas > 1" class="flex justify-center gap-2">
      <button
        v-for="pagina in totalPaginas"
        :key="pagina"
        @click="paginaActual = pagina"
        class="px-4 py-2 rounded-lg transition-all duration-200"
        :class="paginaActual === pagina 
          ? 'bg-terracota text-white shadow-md' 
          : 'bg-white border border-gray-200 text-cafe hover:bg-gray-50'"
      >
        {{ pagina }}
      </button>
    </div>

    <!-- Panel lateral de detalles - Diseño rediseñado -->
    <transition
      enter-active-class="transition-all duration-500 ease-out"
      leave-active-class="transition-all duration-500 ease-in"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0"
    >
      <div
        v-if="panelAbierto && pacienteSeleccionado"
        class="fixed right-0 top-0 h-screen w-full md:w-2/3 lg:w-1/2 bg-white rounded-l-3xl shadow-2xl shadow-black/5 z-50 overflow-y-auto scroll-smooth"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        tabindex="0"
        @keydown.esc="cerrarPanel"
      >
        <!-- Header del panel - Fijo con backdrop blur -->
        <div class="sticky top-0 bg-white/80 backdrop-blur-md pb-6 pt-8 px-8 md:px-10 border-b border-cafe/10 z-10">
          <div class="flex items-start justify-between gap-6">
            <div class="flex items-center gap-5 flex-1">
              <!-- Avatar -->
              <div class="w-16 h-16 rounded-full bg-cafe text-white flex items-center justify-center text-xl font-bold shadow-sm flex-shrink-0">
                {{ obtenerIniciales(pacienteSeleccionado.nombre_completo) }}
              </div>
              
              <!-- Nombre y estado -->
              <div class="flex-1 min-w-0">
                <h2 id="panel-title" class="font-serif text-2xl font-bold text-cafe mb-2 truncate">
                  {{ pacienteSeleccionado.nombre_completo }}
                </h2>
                <div class="flex items-center gap-3 flex-wrap">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                    :class="getEstadoClasses(pacienteSeleccionado.estado)"
                  >
                    {{ getEstadoLabel(pacienteSeleccionado.estado) }}
                  </span>
                  <span v-if="pacienteSeleccionado.terapeuta_nombre" class="text-sm text-cafe/70">
                    🧑‍⚕️ {{ pacienteSeleccionado.terapeuta_nombre }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Botón cerrar con rotación en hover -->
            <button
              @click="cerrarPanel"
              class="text-cafe/40 hover:text-cafe transition-all duration-200 text-2xl leading-none w-10 h-10 rounded-full flex items-center justify-center hover:bg-cafe/5 hover:rotate-90"
              aria-label="Cerrar panel"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Contenido del panel con animación en cascada -->
        <div class="p-8 md:p-10 space-y-8">
          <!-- Información de contacto -->
          <section 
            class="bg-white border border-cafe/10 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <h3 class="font-serif font-semibold text-cafe text-lg mb-4 flex items-center gap-2">
              <span class="text-xl">📞</span>
              <span>Información de Contacto</span>
            </h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3 text-cafe/80">
                <span class="w-6 text-lg">✉️</span>
                <span class="text-sm">{{ pacienteSeleccionado.email }}</span>
              </div>
              <div v-if="pacienteSeleccionado.telefono" class="flex items-center gap-3 text-cafe/80">
                <span class="w-6 text-lg">📱</span>
                <span class="text-sm">{{ pacienteSeleccionado.telefono }}</span>
              </div>
            </div>
          </section>

          <!-- Área de acompañamiento -->
          <section 
            v-if="pacienteSeleccionado.area_de_acompanamiento" 
            class="bg-blue-50/50 rounded-xl p-4 border border-blue-100 transition-all duration-300 hover:shadow-md"
          >
            <h3 class="font-serif font-semibold text-cafe text-lg mb-3 flex items-center gap-2">
              <span class="text-xl">🎯</span>
              <span>Área de Acompañamiento</span>
            </h3>
            <p class="text-cafe text-sm leading-relaxed">{{ pacienteSeleccionado.area_de_acompanamiento }}</p>
          </section>

          <!-- Estadísticas -->
          <section 
            class="bg-green-50/50 rounded-xl p-5 border border-green-100 transition-all duration-300 hover:shadow-md"
          >
            <h3 class="font-serif font-semibold text-cafe text-lg mb-4 flex items-center gap-2">
              <span class="text-xl">�</span>
              <span>Estadísticas</span>
            </h3>
            <div class="space-y-4">
              <!-- Total sesiones -->
              <div class="flex items-center justify-between">
                <span class="text-sm text-cafe/70">Total de sesiones</span>
                <span class="text-3xl font-bold text-cafe">{{ pacienteSeleccionado.total_citas || 0 }}</span>
              </div>
              
              <!-- Completadas -->
              <div class="flex items-center justify-between">
                <span class="text-sm text-cafe/70">Completadas</span>
                <span class="text-lg font-semibold text-green-700">{{ pacienteSeleccionado.sesiones_completadas || 0 }}</span>
              </div>
              
              <!-- Próxima sesión -->
              <div v-if="pacienteSeleccionado.proxima_cita" class="flex items-center gap-2 pt-2 border-t border-green-200">
                <span class="text-lg">📅</span>
                <div>
                  <p class="text-xs text-cafe/60 uppercase tracking-wide">Próxima sesión</p>
                  <p class="text-sm font-medium text-cafe">{{ formatearFecha(pacienteSeleccionado.proxima_cita) }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Bono activo -->
          <section 
            v-if="pacienteSeleccionado.bono_activo" 
            class="bg-white border border-cafe/10 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <h3 class="font-serif font-semibold text-cafe text-lg mb-4 flex items-center gap-2">
              <span class="text-xl">�</span>
              <span>Bono Activo</span>
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span class="text-sm text-cafe/70">Sesiones disponibles</span>
                <span class="text-2xl font-bold text-purple-700">{{ pacienteSeleccionado.bono_activo.sesiones_restantes }}</span>
              </div>
              <div class="flex justify-between items-center text-sm text-cafe/70">
                <span>Fecha de compra</span>
                <span class="font-medium">{{ formatearFecha(pacienteSeleccionado.bono_activo.fecha_compra) }}</span>
              </div>
            </div>
          </section>

          <!-- Timeline de historial de sesiones -->
          <section 
            class="bg-white border border-cafe/10 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <h3 class="font-serif font-semibold text-cafe text-lg mb-5 flex items-center gap-2">
              <span class="text-xl">🕓</span>
              <span>Historial de Sesiones</span>
            </h3>
            
            <!-- Timeline -->
            <div v-if="pacienteSeleccionado.ultimas_sesiones?.length" class="space-y-4">
              <div
                v-for="(sesion, index) in pacienteSeleccionado.ultimas_sesiones"
                :key="sesion.id"
                class="flex gap-4 group"
              >
                <!-- Timeline dot y línea -->
                <div class="flex flex-col items-center">
                  <div 
                    class="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                    :class="{
                      'bg-green-500': sesion.estado === 'completada',
                      'bg-red-500': sesion.estado === 'cancelada',
                      'bg-yellow-500': sesion.estado === 'pendiente',
                      'bg-blue-500': sesion.estado === 'confirmada'
                    }"
                  />
                  <div 
                    v-if="index < pacienteSeleccionado.ultimas_sesiones.length - 1"
                    class="w-px h-full bg-cafe/10 mt-1"
                  />
                </div>
                
                <!-- Contenido de la sesión -->
                <div class="flex-1 pb-6">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-cafe">{{ formatearFecha(sesion.fecha_cita) }}</p>
                      <p class="text-xs text-cafe/60 mt-0.5">{{ sesion.hora_inicio }} - {{ sesion.hora_fin }}</p>
                    </div>
                    <span
                      class="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap"
                      :class="{
                        'text-green-700 bg-green-100': sesion.estado === 'completada',
                        'text-red-700 bg-red-100': sesion.estado === 'cancelada',
                        'text-yellow-700 bg-yellow-100': sesion.estado === 'pendiente',
                        'text-blue-700 bg-blue-100': sesion.estado === 'confirmada'
                      }"
                    >
                      {{ sesion.estado }}
                    </span>
                  </div>
                  <p v-if="sesion.notas" class="text-xs text-cafe/70 mt-2 leading-relaxed">
                    {{ sesion.notas }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Empty state -->
            <div v-else class="text-center py-8">
              <span class="text-4xl block mb-3 opacity-50">📅</span>
              <p class="text-sm text-cafe/60">No hay sesiones registradas aún</p>
            </div>
          </section>

          <!-- Bonos del Paciente -->
          <BonosPaciente 
            v-if="pacienteSeleccionado.id"
            :key="`bonos-${pacienteSeleccionado.id}-${bonosKey}`"
            :paciente-id="pacienteSeleccionado.id"
            @renovar-bono="handleRenovarBono"
            @ver-detalles="handleVerDetallesBono"
            @crear-bono="handleCrearBono"
            @confirmar-pago="handleConfirmarPago"
            @revertir-pago="handleRevertirPago"
          />

          <!-- Botones de acción -->
          <section class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
            <button
              @click="enviarRecordatorio(pacienteSeleccionado)"
              class="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <span class="text-lg">🔔</span>
              <span class="text-sm">Recordatorio</span>
            </button>
            <button
              @click="verAgendaPaciente(pacienteSeleccionado)"
              class="px-4 py-3 bg-terracota hover:bg-terracota/90 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <span class="text-lg">📅</span>
              <span class="text-sm">Ver Agenda</span>
            </button>
            <button
              @click="enviarWhatsApp(pacienteSeleccionado)"
              class="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <span class="text-lg">💬</span>
              <span class="text-sm">WhatsApp</span>
            </button>
          </section>
        </div>
      </div>
    </transition>

    <!-- Overlay translúcido -->
    <transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="panelAbierto"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        @click="cerrarPanel"
      />
    </transition>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const router = useRouter()

definePageMeta({
  layout: 'coordinadora',
  middleware: ['auth', 'role-coordinadora']
})

// Estado
const cargando = ref(true)
const pacientes = ref([])
const terapeutas = ref([])
const busqueda = ref('')
const filtroEstado = ref('')
const filtroTerapeuta = ref('')
const ordenarPor = ref('nombre')
const paginaActual = ref(1)
const itemsPorPagina = 12

// Panel lateral
const panelAbierto = ref(false)
const pacienteSeleccionado = ref(null)
const panelRef = ref(null)
const bonosKey = ref(0) // Key para forzar re-renderizado del componente bonos

// Computed
const totalPacientes = computed(() => pacientes.value.length)
const pacientesActivos = computed(() => 
  pacientes.value.filter(p => p.estado === 'activo' || p.activo).length
)

const promedioPorTerapeuta = computed(() => {
  if (terapeutas.value.length === 0) return 0
  return Math.round(totalPacientes.value / terapeutas.value.length)
})

const bonosActivos = computed(() => 
  pacientes.value.filter(p => p.bono_activo && p.bono_activo.sesiones_restantes > 0).length
)

const pacientesFiltrados = computed(() => {
  let resultado = [...pacientes.value]

  // Filtro por búsqueda
  if (busqueda.value.trim()) {
    const query = busqueda.value.toLowerCase()
    resultado = resultado.filter(p =>
      p.nombre_completo?.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query) ||
      p.telefono?.includes(query) ||
      p.terapeuta_nombre?.toLowerCase().includes(query)
    )
  }

  // Filtro por estado
  if (filtroEstado.value === 'activo') {
    resultado = resultado.filter(p => p.estado === 'activo' || p.activo)
  } else if (filtroEstado.value === 'inactivo') {
    resultado = resultado.filter(p => p.estado === 'inactivo' || !p.activo)
  } else if (filtroEstado.value === 'pausa') {
    resultado = resultado.filter(p => p.estado === 'pausa')
  }

  // Filtro por terapeuta
  if (filtroTerapeuta.value) {
    resultado = resultado.filter(p => p.terapeuta_id === filtroTerapeuta.value)
  }

  // Ordenar
  if (ordenarPor.value === 'nombre') {
    resultado.sort((a, b) => 
      (a.nombre_completo || '').localeCompare(b.nombre_completo || '')
    )
  } else if (ordenarPor.value === 'fecha') {
    resultado.sort((a, b) => {
      const fechaA = a.ultima_cita ? new Date(a.ultima_cita) : new Date(0)
      const fechaB = b.ultima_cita ? new Date(b.ultima_cita) : new Date(0)
      return fechaB - fechaA
    })
  } else if (ordenarPor.value === 'citas') {
    resultado.sort((a, b) => (b.total_citas || 0) - (a.total_citas || 0))
  }

  // Paginación
  const inicio = (paginaActual.value - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  return resultado.slice(inicio, fin)
})

const totalPaginas = computed(() => {
  const total = pacientes.value.length
  return Math.ceil(total / itemsPorPagina)
})

// Funciones de utilidad
const obtenerIniciales = (nombre) => {
  if (!nombre) return 'PA'
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin registro'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getEstadoClasses = (estado) => {
  const estadoNormalizado = estado?.toLowerCase() || 'inactivo'
  
  if (estadoNormalizado === 'activo') {
    return 'bg-green-100 text-green-700'
  } else if (estadoNormalizado === 'pausa' || estadoNormalizado === 'en pausa') {
    return 'bg-yellow-100 text-yellow-700'
  } else {
    return 'bg-gray-100 text-gray-700'
  }
}

const getEstadoLabel = (estado) => {
  const estadoNormalizado = estado?.toLowerCase() || 'inactivo'
  
  if (estadoNormalizado === 'activo') return 'Activo'
  if (estadoNormalizado === 'pausa' || estadoNormalizado === 'en pausa') return 'En pausa'
  return 'Inactivo'
}

// Funciones de navegación
const verDetallePaciente = (paciente) => {
  // Redirigir a la página de detalle del paciente
  router.push(`/coordinadora/pacientes/${paciente.id}`)
}

const irANuevoPaciente = () => {
  router.push('/coordinadora/pacientes/nuevo')
}

const agendarCita = (paciente) => {
  router.push(`/coordinadora/agenda?paciente=${paciente.id}`)
}

const enviarWhatsApp = (paciente) => {
  if (!paciente.telefono) {
    alert('Este paciente no tiene teléfono registrado')
    return
  }
  const numero = paciente.telefono.replace(/\D/g, '')
  const mensaje = encodeURIComponent(`Hola ${paciente.nombre_completo}, te escribo desde el consultorio de Psicóloga Karem.`)
  window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank')
}

// Funciones del panel lateral
const abrirDetalles = async (paciente) => {
  pacienteSeleccionado.value = { ...paciente }
  panelAbierto.value = true
  
  // Cargar detalles adicionales
  await cargarDetallesPaciente(paciente.id)
  
  // Focus en el primer elemento interactivo después de un tick
  await nextTick()
  const firstFocusable = document.querySelector('[role="dialog"] button')
  if (firstFocusable) {
    firstFocusable.focus()
  }
}

const cerrarPanel = () => {
  panelAbierto.value = false
  setTimeout(() => {
    pacienteSeleccionado.value = null
  }, 300)
}

const enviarRecordatorio = (paciente) => {
  // Placeholder - implementar lógica de recordatorios
  console.log('Enviar recordatorio a:', paciente.nombre_completo)
  alert(`Funcionalidad de recordatorios próximamente disponible para ${paciente.nombre_completo}`)
}

const verAgendaPaciente = (paciente) => {
  cerrarPanel()
  router.push(`/coordinadora/agenda?paciente=${paciente.id}`)
}

// Handlers para bonos
const handleRenovarBono = (bono) => {
  console.log('Renovar bono:', bono)
  // TODO: Implementar lógica de renovación de bono
  alert(`Funcionalidad de renovación de bono próximamente disponible`)
}

const handleVerDetallesBono = (bono) => {
  console.log('Ver detalles de bono:', bono)
  // TODO: Abrir modal o panel con detalles completos del bono
  alert(`Detalles del bono: ${bono.sesiones_totales} sesiones - ${bono.sesiones_usadas} usadas`)
}

const handleCrearBono = () => {
  console.log('Crear nuevo bono para:', pacienteSeleccionado.value)
  // TODO: Abrir modal de creación de bono
  alert(`Funcionalidad de creación de bono próximamente disponible`)
}

const handleConfirmarPago = async (bono) => {
  console.log('Confirmar pago de bono:', bono)
  
  // Confirmar con el usuario
  const metodoPago = prompt(
    'Método de pago:\n1. Transferencia\n2. Tarjeta\n3. Efectivo\n4. Bizum\n5. PayPal\n6. Otro\n\nIngrese el número del método:',
    '1'
  )
  
  if (!metodoPago) return
  
  const metodos = {
    '1': 'transferencia',
    '2': 'tarjeta',
    '3': 'efectivo',
    '4': 'bizum',
    '5': 'paypal',
    '6': 'otro'
  }
  
  const metodoSeleccionado = metodos[metodoPago] || 'transferencia'
  
  try {
    // Llamar a la función RPC de Supabase para confirmar el pago
    const { data, error } = await supabase.rpc('confirmar_pago_bono', {
      p_bono_id: bono.id,
      p_metodo_pago: metodoSeleccionado
    })
    
    if (error) throw error
    
    if (data && data.success) {
      alert(`✅ Pago confirmado correctamente\n\nMétodo: ${metodoSeleccionado}\nFecha: ${new Date().toLocaleDateString('es-ES')}`)
      
      // Incrementar key para forzar recarga del componente bonos
      bonosKey.value++
      
      // Recargar los detalles del paciente para actualizar la vista
      if (pacienteSeleccionado.value?.id) {
        await cargarDetallesPaciente(pacienteSeleccionado.value)
      }
    } else {
      alert(`❌ Error: ${data?.error || 'No se pudo confirmar el pago'}`)
    }
  } catch (err) {
    console.error('Error al confirmar pago:', err)
    alert(`❌ Error al confirmar el pago: ${err.message}`)
  }
}

const handleRevertirPago = async (bono) => {
  console.log('Revertir pago de bono:', bono)
  
  // Confirmar con el usuario que quiere revertir el pago
  const confirmacion = confirm(
    `⚠️ ¿Estás seguro de que quieres revertir el pago de este bono?\n\n` +
    `Esta acción marcará el bono como "NO PAGADO" y eliminará:\n` +
    `- Fecha de pago\n` +
    `- Método de pago\n` +
    `- Registro de quién confirmó el pago\n\n` +
    `Esta acción es útil si marcaste el pago por error.`
  )
  
  if (!confirmacion) return
  
  try {
    // Llamar a la función RPC de Supabase para revertir el pago
    const { data, error } = await supabase.rpc('revertir_pago_bono', {
      p_bono_id: bono.id
    })
    
    if (error) throw error
    
    if (data && data.success) {
      alert(`✅ Pago revertido correctamente\n\nEl bono ahora está marcado como "NO PAGADO"`)
      
      // Incrementar key para forzar recarga del componente bonos
      bonosKey.value++
      
      // Recargar los detalles del paciente para actualizar la vista
      if (pacienteSeleccionado.value?.id) {
        await cargarDetallesPaciente(pacienteSeleccionado.value)
      }
    } else {
      alert(`❌ Error: ${data?.error || 'No se pudo revertir el pago'}`)
    }
  } catch (err) {
    console.error('Error al revertir pago:', err)
    alert(`❌ Error al revertir el pago: ${err.message}`)
  }
}


// Cargar datos
const cargarTerapeutas = async () => {
  try {
    console.log('[Pacientes] Cargando lista de terapeutas...')
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre')
      .in('rol', ['psicologa', 'admin', 'coordinadora'])
      .order('nombre', { ascending: true })
    
    if (error) {
      console.error('[Pacientes] Error al cargar terapeutas:', error)
      throw error
    }
    
    console.log('[Pacientes] Terapeutas cargados:', data?.length || 0)
    terapeutas.value = data || []
    
  } catch (error) {
    console.error('[Pacientes] Error fatal al cargar terapeutas:', error)
    terapeutas.value = []
  }
}

const cargarPacientes = async () => {
  cargando.value = true
  
  try {
    console.log('[Pacientes] Iniciando carga de pacientes...')
    
    // Primero intentar cargar pacientes básicos
    const { data: pacientesData, error: errorPacientes } = await supabase
      .from('pacientes')
      .select('*')
      .order('nombre_completo', { ascending: true })
    
    if (errorPacientes) {
      console.error('[Pacientes] Error al cargar pacientes:', errorPacientes)
      throw errorPacientes
    }
    
    console.log('[Pacientes] Pacientes cargados:', pacientesData?.length || 0)
    
    if (!pacientesData || pacientesData.length === 0) {
      console.warn('[Pacientes] No hay pacientes en la base de datos')
      pacientes.value = []
      return
    }
    
    // Cargar nombres de terapeutas si hay terapeuta_id
    const terapeutaIds = [...new Set(pacientesData.map(p => p.terapeuta_id).filter(Boolean))]
    const terapeutasMap = new Map()
    
    if (terapeutaIds.length > 0) {
      const { data: terapeutasData } = await supabase
        .from('profiles')
        .select('id, nombre')
        .in('id', terapeutaIds)
      
      terapeutasData?.forEach(t => {
        terapeutasMap.set(t.id, t.nombre)
      })
    }
    
    // Procesar datos de pacientes
    const pacientesConDatos = await Promise.all(
      pacientesData.map(async (paciente) => {
        try {
          // Contar citas totales y obtener fechas
          const { count, data: citas } = await supabase
            .from('sesiones')
            .select('fecha, estado', { count: 'exact' })
            .eq('paciente_id', paciente.id)
            .order('fecha', { ascending: false })
            .limit(10)
          
          const ahora = new Date()
          const citasPasadas = citas?.filter(c => new Date(c.fecha) <= ahora) || []
          const citasFuturas = citas?.filter(c => new Date(c.fecha) > ahora) || []
          
          const ultimaCita = citasPasadas[0]
          const proximaCita = citasFuturas[citasFuturas.length - 1]
          
          // Contar sesiones completadas
          const { count: completadas } = await supabase
            .from('sesiones')
            .select('*', { count: 'exact', head: true })
            .eq('paciente_id', paciente.id)
            .eq('estado', 'realizada')
          
          // Verificar si tiene bono activo
          const { data: bonoData, error: bonoError } = await supabase
            .from('bonos')
            .select('id, sesiones_restantes, created_at as fecha_compra')
            .eq('paciente_id', paciente.id)
            .eq('activo', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          
          return {
            ...paciente,
            terapeuta_nombre: terapeutasMap.get(paciente.terapeuta_id) || null,
            estado: paciente.activo ? 'activo' : 'inactivo',
            total_citas: count || 0,
            sesiones_completadas: completadas || 0,
            ultima_cita: ultimaCita?.fecha || null,
            proxima_cita: proximaCita?.fecha || null,
            bono_activo: bonoError ? null : bonoData
          }
        } catch (err) {
          console.error(`[Pacientes] Error procesando paciente ${paciente.id}:`, err)
          return {
            ...paciente,
            terapeuta_nombre: terapeutasMap.get(paciente.terapeuta_id) || null,
            estado: paciente.activo ? 'activo' : 'inactivo',
            total_citas: 0,
            sesiones_completadas: 0,
            ultima_cita: null,
            proxima_cita: null,
            bono_activo: null
          }
        }
      })
    )
    
    console.log('[Pacientes] Datos procesados:', pacientesConDatos.length)
    pacientes.value = pacientesConDatos
    
  } catch (error) {
    console.error('[Pacientes] Error fatal al cargar pacientes:', error)
    pacientes.value = []
  } finally {
    cargando.value = false
  }
}

const cargarDetallesPaciente = async (pacienteId) => {
  try {
    // Cargar últimas 5 sesiones
    const { data: sesiones, error } = await supabase
      .from('sesiones')
      .select('id, fecha, hora_inicio, hora_fin, estado, notas_terapeuta')
      .eq('paciente_id', pacienteId)
      .order('fecha', { ascending: false })
      .limit(5)
    
    if (error) throw error
    
    if (pacienteSeleccionado.value) {
      pacienteSeleccionado.value.ultimas_sesiones = sesiones?.map(s => ({
        id: s.id,
        fecha_cita: s.fecha,
        hora_inicio: s.hora_inicio,
        hora_fin: s.hora_fin,
        estado: s.estado,
        notas: s.notas_terapeuta
      })) || []
    }
  } catch (error) {
    console.error('Error al cargar detalles del paciente:', error)
  }
}

// Event listeners
onMounted(() => {
  cargarTerapeutas()
  cargarPacientes()
  
  // Listener para cerrar panel con ESC
  window.addEventListener('keydown', handleEscKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscKey)
})

const handleEscKey = (event) => {
  if (event.key === 'Escape' && panelAbierto.value) {
    cerrarPanel()
  }
}
</script>

<style scoped>
/* Smooth scroll en el panel */
[role="dialog"] {
  scroll-behavior: smooth;
}

/* Scrollbar personalizado */
[role="dialog"]::-webkit-scrollbar {
  width: 6px;
}

[role="dialog"]::-webkit-scrollbar-track {
  background: transparent;
}

[role="dialog"]::-webkit-scrollbar-thumb {
  background: rgba(139, 116, 112, 0.15);
  border-radius: 3px;
}

[role="dialog"]::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 116, 112, 0.25);
}

/* Transiciones suaves */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Timeline line height animation */
.group:hover .timeline-line {
  background-color: rgba(139, 116, 112, 0.2);
}
</style>
