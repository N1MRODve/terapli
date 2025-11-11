<template>
  <div class="pb-20">
    <!-- Navegación de regreso -->
    <button
      @click="$router.push('/coordinadora/pacientes')"
      class="mb-6 flex items-center gap-2 text-cafe hover:text-purple-600 transition-colors"
    >
      <span>←</span>
      <span>Volver a lista de pacientes</span>
    </button>

    <!-- Estado de carga -->
    <div v-if="cargando" class="text-center py-12">
      <div class="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-cafe/60">Cargando información del paciente...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <span class="text-6xl mb-4 block">❌</span>
        <h3 class="text-xl font-serif font-semibold text-cafe mb-2">No se pudo cargar la información</h3>
        <p class="text-cafe/60 mb-4">{{ error }}</p>
        <button @click="$router.push('/coordinadora/pacientes')" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors">
          Volver a la lista
        </button>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-else-if="pacienteData" class="space-y-6">
      <!-- Encabezado del paciente -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div class="flex items-start gap-4 flex-1">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-cafe flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {{ iniciales }}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h1 class="text-3xl font-serif font-bold text-cafe">{{ nombreCompleto }}</h1>
                <button @click="abrirModalEdicion" class="text-gray-400 hover:text-purple-600 transition-colors" title="Editar información">
                  <span class="text-xl">✏️</span>
                </button>
              </div>
              <div class="flex flex-wrap items-center gap-3 mb-3">
                <span class="px-3 py-1 text-sm font-medium rounded-full" :class="pacienteData.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'">
                  {{ pacienteData.activo ? 'Activo' : 'Inactivo' }}
                </span>
                <span class="text-cafe/60 text-sm flex items-center gap-1">
                  <span>📧</span>
                  <span>{{ pacienteData.email }}</span>
                </span>
              </div>
              <div class="space-y-1 text-sm">
                <div v-if="pacienteData.telefono" class="text-cafe/70 flex items-center gap-2">
                  <span>📱</span>
                  <span>{{ pacienteData.telefono }}</span>
                </div>
                <div v-if="pacienteData.area_de_acompanamiento" class="text-cafe/70 flex items-center gap-2">
                  <span>🎯</span>
                  <span><strong>Área:</strong> {{ pacienteData.area_de_acompanamiento }}</span>
                </div>
                <div v-if="pacienteData.frecuencia" class="text-cafe/70 flex items-center gap-2">
                  <span>📆</span>
                  <span><strong>Frecuencia:</strong> {{ pacienteData.frecuencia }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <button v-if="pacienteData.telefono" @click="abrirWhatsApp" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2 justify-center">
              <span>💬</span>
              <span>WhatsApp</span>
            </button>
            <button @click="agendarCita" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors text-sm flex items-center gap-2 justify-center">
              <span>📅</span>
              <span>Agendar Cita</span>
            </button>
          </div>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3">
            <span class="text-3xl">📊</span>
            <div>
              <p class="text-sm text-gray-600">Total Citas</p>
              <p class="text-2xl font-bold text-cafe">{{ totalCitas }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3">
            <span class="text-3xl">✅</span>
            <div>
              <p class="text-sm text-gray-600">Completadas</p>
              <p class="text-2xl font-bold text-green-600">{{ citasCompletadas }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3">
            <span class="text-3xl">📅</span>
            <div>
              <p class="text-sm text-gray-600">Próxima Cita</p>
              <p class="text-sm font-semibold text-cafe">{{ proximaCitaTexto }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🎟️</span>
            <div>
              <p class="text-sm text-gray-600">Bonos Activos</p>
              <p class="text-2xl font-bold text-purple-600">{{ bonosActivos.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sistema de Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="flex border-b border-gray-200 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="tabActual = tab.id"
            class="px-6 py-4 font-medium transition-colors whitespace-nowrap flex items-center gap-2"
            :class="tabActual === tab.id ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600 hover:text-cafe'"
          >
            <span>{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <div class="p-6">
          <!-- Tab: Información General -->
          <div v-if="tabActual === 'info'">
            <h3 class="text-lg font-semibold text-cafe mb-4">Información Personal</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Nombre Completo</p>
                <p class="font-medium text-cafe">{{ pacienteData.nombre_completo || 'No especificado' }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Email</p>
                <p class="font-medium text-cafe">{{ pacienteData.email || 'No especificado' }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Teléfono</p>
                <p class="font-medium text-cafe">{{ pacienteData.telefono || 'No especificado' }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Área de Acompañamiento</p>
                <p class="font-medium text-cafe">{{ pacienteData.area_de_acompanamiento || 'No especificado' }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Frecuencia de Sesiones</p>
                <p class="font-medium text-cafe">{{ pacienteData.frecuencia || 'No especificado' }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-1">Estado</p>
                <p class="font-medium" :class="pacienteData.activo ? 'text-green-600' : 'text-gray-600'">
                  {{ pacienteData.activo ? 'Activo' : 'Inactivo' }}
                </p>
              </div>
              <div v-if="pacienteData.created_at" class="p-4 bg-gray-50 rounded-lg col-span-full">
                <p class="text-sm text-gray-600 mb-1">Fecha de Registro</p>
                <p class="font-medium text-cafe">{{ formatearFecha(pacienteData.created_at) }}</p>
              </div>
            </div>
          </div>

          <!-- Tab: Historial de Citas -->
          <div v-if="tabActual === 'citas'">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-cafe">Historial de Citas ({{ totalCitas }})</h3>
              <button @click="agendarCita" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors text-sm">
                + Nueva Cita
              </button>
            </div>
            
            <div v-if="cargandoCitas" class="text-center py-8 text-gray-400">
              <p>Cargando historial...</p>
            </div>

            <div v-else-if="citas.length === 0" class="text-center py-12 text-gray-400">
              <span class="text-6xl block mb-4">📅</span>
              <p class="mb-4">No hay citas registradas</p>
              <button @click="agendarCita" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors">
                Agendar Primera Cita
              </button>
            </div>

            <div v-else class="space-y-3">
              <div v-for="cita in citas" :key="cita.id" class="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-lg">📅</span>
                      <div>
                        <p class="font-semibold text-cafe">{{ formatearFecha(cita.fecha_cita) }}</p>
                        <p class="text-sm text-gray-600">{{ cita.hora_inicio }} - {{ cita.hora_fin }}</p>
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-2">
                      <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {{ cita.modalidad || 'presencial' }}
                      </span>
                      <span class="px-2 py-1 text-xs rounded-full" :class="getEstadoClasses(cita.estado)">
                        {{ getEstadoLabel(cita.estado) }}
                      </span>
                    </div>
                    <p v-if="cita.observaciones" class="text-sm text-gray-600 mt-2">{{ cita.observaciones }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Bonos -->
          <div v-if="tabActual === 'bonos'">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-cafe">Bonos Contratados</h3>
            </div>

            <div v-if="cargandoBonos" class="text-center py-8 text-gray-400">
              <p>Cargando bonos...</p>
            </div>

            <div v-else-if="bonos.length === 0" class="text-center py-12 text-gray-400">
              <span class="text-6xl block mb-4">🎟️</span>
              <p class="mb-4">No hay bonos registrados</p>
            </div>

            <div v-else class="space-y-4">
              <div v-for="bono in bonos" :key="bono.id" class="p-6 border border-gray-200 rounded-lg">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h4 class="font-semibold text-cafe text-lg mb-1">Bono de {{ bono.sesiones_totales }} Sesiones</h4>
                    <span class="px-3 py-1 text-sm rounded-full" :class="getBonoEstadoClasses(bono.estado)">
                      {{ getBonoEstadoLabel(bono.estado) }}
                    </span>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-purple-600">{{ bono.sesiones_restantes }}</p>
                    <p class="text-sm text-gray-600">sesiones restantes</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p class="text-xs text-gray-600">Total Sesiones</p>
                    <p class="font-semibold text-cafe">{{ bono.sesiones_totales }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600">Sesiones Usadas</p>
                    <p class="font-semibold text-cafe">{{ bono.sesiones_totales - bono.sesiones_restantes }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600">Precio</p>
                    <p class="font-semibold text-cafe">{{ bono.precio_total ? `${bono.precio_total}€` : 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600">Fecha Compra</p>
                    <p class="font-semibold text-cafe text-sm">{{ formatearFechaCorta(bono.fecha_compra) }}</p>
                  </div>
                </div>

                <div v-if="bono.fecha_expiracion" class="mt-3 text-sm text-gray-600">
                  <span>📅 Expira: {{ formatearFechaCorta(bono.fecha_expiracion) }}</span>
                </div>

                <!-- Barra de progreso -->
                <div class="mt-4">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-purple-600 h-2 rounded-full" :style="{ width: `${((bono.sesiones_totales - bono.sesiones_restantes) / bono.sesiones_totales) * 100}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Pagos -->
          <div v-if="tabActual === 'pagos'">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-cafe">Historial de Pagos</h3>
            </div>

            <div v-if="cargandoPagos" class="text-center py-8 text-gray-400">
              <p>Cargando pagos...</p>
            </div>

            <div v-else-if="pagos.length === 0" class="text-center py-12 text-gray-400">
              <span class="text-6xl block mb-4">💳</span>
              <p class="mb-4">No hay pagos registrados</p>
            </div>

            <div v-else class="space-y-3">
              <div v-for="pago in pagos" :key="pago.id" class="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-lg">💳</span>
                      <div>
                        <p class="font-semibold text-cafe">{{ pago.concepto || 'Pago de sesión' }}</p>
                        <p class="text-sm text-gray-600">{{ formatearFecha(pago.fecha) }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 mt-2">
                      <span class="px-2 py-1 text-xs rounded-full" :class="getPagoEstadoClasses(pago.estado)">
                        {{ getPagoEstadoLabel(pago.estado) }}
                      </span>
                      <span v-if="pago.metodo_pago" class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {{ pago.metodo_pago }}
                      </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-xl font-bold text-cafe">{{ pago.monto }}€</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Sesiones/Notas -->
          <div v-if="tabActual === 'sesiones'">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-cafe">Sesiones y Notas</h3>
            </div>

            <div v-if="cargandoSesiones" class="text-center py-8 text-gray-400">
              <p>Cargando sesiones...</p>
            </div>

            <div v-else-if="sesiones.length === 0" class="text-center py-12 text-gray-400">
              <span class="text-6xl block mb-4">📝</span>
              <p class="mb-4">No hay sesiones registradas</p>
            </div>

            <div v-else class="space-y-4">
              <div v-for="sesion in sesiones" :key="sesion.id" class="p-4 border border-gray-100 rounded-lg">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <p class="font-semibold text-cafe">{{ formatearFecha(sesion.fecha) }}</p>
                    <p v-if="sesion.tipo" class="text-sm text-gray-600">{{ sesion.tipo }}</p>
                  </div>
                </div>
                <div v-if="sesion.notas" class="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {{ sesion.notas }}
                </div>
                <div v-else class="text-sm text-gray-400 italic">Sin notas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Edición -->
    <div v-if="modalEdicion" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="cerrarModalEdicion">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 class="text-2xl font-serif font-bold text-cafe">Editar Paciente</h2>
          <button @click="cerrarModalEdicion" class="text-gray-400 hover:text-cafe transition-colors">
            <span class="text-2xl">×</span>
          </button>
        </div>

        <form @submit.prevent="guardarCambios" class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-cafe mb-2">Nombre Completo *</label>
            <input v-model="formEdicion.nombre_completo" type="text" required class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>

          <div>
            <label class="block text-sm font-medium text-cafe mb-2">Email *</label>
            <input v-model="formEdicion.email" type="email" required class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>

          <div>
            <label class="block text-sm font-medium text-cafe mb-2">Teléfono</label>
            <input v-model="formEdicion.telefono" type="tel" class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>

          <div>
            <label class="block text-sm font-medium text-cafe mb-2">Área de Acompañamiento</label>
            <select v-model="formEdicion.area_de_acompanamiento" class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300">
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

          <div>
            <label class="block text-sm font-medium text-cafe mb-2">Frecuencia de Sesiones</label>
            <select v-model="formEdicion.frecuencia" class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300">
              <option value="">Selecciona una frecuencia</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
              <option value="ocasional">Ocasional</option>
            </select>
          </div>

          <div class="flex items-center gap-3">
            <input v-model="formEdicion.activo" type="checkbox" id="activo-edit" class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-300" />
            <label for="activo-edit" class="text-sm font-medium text-cafe cursor-pointer">Paciente activo</label>
          </div>

          <div v-if="errorEdicion" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ errorEdicion }}</p>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="cerrarModalEdicion" :disabled="guardandoCambios" class="flex-1 px-6 py-3 border border-gray-300 text-cafe rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" :disabled="guardandoCambios" class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <span v-if="guardandoCambios" class="animate-spin">⏳</span>
              <span>{{ guardandoCambios ? 'Guardando...' : 'Guardar Cambios' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const route = useRoute()
const router = useRouter()

definePageMeta({
  layout: 'coordinadora',
  middleware: ['auth', 'role-coordinadora']
})

// Estado
const cargando = ref(true)
const cargandoCitas = ref(true)
const cargandoBonos = ref(true)
const cargandoPagos = ref(true)
const cargandoSesiones = ref(true)
const error = ref(null)
const pacienteData = ref(null)
const citas = ref([])
const bonos = ref([])
const pagos = ref([])
const sesiones = ref([])
const tabActual = ref('info')
const modalEdicion = ref(false)
const guardandoCambios = ref(false)
const errorEdicion = ref('')
const formEdicion = ref({
  nombre_completo: '',
  email: '',
  telefono: '',
  area_de_acompanamiento: '',
  frecuencia: '',
  activo: true
})

const tabs = [
  { id: 'info', label: 'Información', icon: '👤' },
  { id: 'citas', label: 'Citas', icon: '📅' },
  { id: 'bonos', label: 'Bonos', icon: '🎟️' },
  { id: 'pagos', label: 'Pagos', icon: '💳' },
  { id: 'sesiones', label: 'Sesiones', icon: '📝' }
]

// Computed
const pacienteId = computed(() => route.params.id)

const nombreCompleto = computed(() => pacienteData.value?.nombre_completo || 'Sin nombre')

const iniciales = computed(() => {
  const nombre = nombreCompleto.value
  return nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
})

const totalCitas = computed(() => citas.value.length)

const citasCompletadas = computed(() => citas.value.filter(c => c.estado === 'completada').length)

const proximaCitaTexto = computed(() => {
  const futuras = citas.value.filter(c => new Date(c.fecha_cita) > new Date() && c.estado !== 'cancelada')
  if (futuras.length === 0) return 'Sin citas programadas'
  return formatearFechaCorta(futuras[0].fecha_cita)
})

const bonosActivos = computed(() => bonos.value.filter(b => b.estado === 'activo' && b.sesiones_restantes > 0))

// Funciones de formato
const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatearFechaCorta = (fecha) => {
  if (!fecha) return 'N/A'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getEstadoLabel = (estado) => {
  const labels = { pendiente: 'Pendiente', confirmada: 'Confirmada', completada: 'Completada', cancelada: 'Cancelada' }
  return labels[estado] || estado
}

const getEstadoClasses = (estado) => {
  const classes = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    confirmada: 'bg-green-100 text-green-700',
    completada: 'bg-blue-100 text-blue-700',
    cancelada: 'bg-red-100 text-red-700'
  }
  return classes[estado] || 'bg-gray-100 text-gray-700'
}

const getBonoEstadoLabel = (estado) => {
  const labels = { activo: 'Activo', agotado: 'Agotado', expirado: 'Expirado', cancelado: 'Cancelado' }
  return labels[estado] || estado
}

const getBonoEstadoClasses = (estado) => {
  const classes = {
    activo: 'bg-green-100 text-green-700',
    agotado: 'bg-orange-100 text-orange-700',
    expirado: 'bg-red-100 text-red-700',
    cancelado: 'bg-gray-100 text-gray-700'
  }
  return classes[estado] || 'bg-gray-100 text-gray-700'
}

const getPagoEstadoLabel = (estado) => {
  const labels = { pendiente: 'Pendiente', completado: 'Completado', cancelado: 'Cancelado' }
  return labels[estado] || estado
}

const getPagoEstadoClasses = (estado) => {
  const classes = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    completado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700'
  }
  return classes[estado] || 'bg-gray-100 text-gray-700'
}

// Acciones
const abrirWhatsApp = () => {
  if (!pacienteData.value?.telefono) {
    alert('Este paciente no tiene teléfono registrado')
    return
  }
  const numero = pacienteData.value.telefono.replace(/\D/g, '')
  const mensaje = encodeURIComponent(`Hola ${nombreCompleto.value}, te escribo desde el consultorio de Psicóloga Karem.`)
  window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank')
}

const agendarCita = () => {
  router.push(`/coordinadora/agenda?paciente=${pacienteId.value}`)
}

const abrirModalEdicion = () => {
  formEdicion.value = {
    nombre_completo: pacienteData.value.nombre_completo || '',
    email: pacienteData.value.email || '',
    telefono: pacienteData.value.telefono || '',
    area_de_acompanamiento: pacienteData.value.area_de_acompanamiento || '',
    frecuencia: pacienteData.value.frecuencia || '',
    activo: pacienteData.value.activo ?? true
  }
  modalEdicion.value = true
  errorEdicion.value = ''
}

const cerrarModalEdicion = () => {
  if (guardandoCambios.value) return
  modalEdicion.value = false
  errorEdicion.value = ''
}

const guardarCambios = async () => {
  guardandoCambios.value = true
  errorEdicion.value = ''

  try {
    const { error: updateError } = await supabase
      .from('pacientes')
      .update({
        nombre_completo: formEdicion.value.nombre_completo.trim(),
        email: formEdicion.value.email.trim().toLowerCase(),
        telefono: formEdicion.value.telefono.trim() || null,
        area_de_acompanamiento: formEdicion.value.area_de_acompanamiento || null,
        frecuencia: formEdicion.value.frecuencia || null,
        activo: formEdicion.value.activo
      })
      .eq('id', pacienteId.value)

    if (updateError) throw updateError

    await cargarPaciente()
    cerrarModalEdicion()
  } catch (err) {
    console.error('Error al guardar cambios:', err)
    errorEdicion.value = err.message || 'Error al guardar los cambios'
  } finally {
    guardandoCambios.value = false
  }
}

// Cargar datos
const cargarPaciente = async () => {
  cargando.value = true
  error.value = null

  try {
    const { data, error: errorPaciente } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', pacienteId.value)
      .single()

    if (errorPaciente) throw errorPaciente
    if (!data) throw new Error('Paciente no encontrado')

    pacienteData.value = data
  } catch (err) {
    console.error('Error al cargar paciente:', err)
    error.value = err.message || 'Error al cargar la información del paciente'
  } finally {
    cargando.value = false
  }
}

const cargarCitas = async () => {
  cargandoCitas.value = true

  try {
    const { data, error: errorCitas } = await supabase
      .from('citas')
      .select('*')
      .eq('paciente_id', pacienteId.value)
      .order('fecha_cita', { ascending: false })

    if (errorCitas) throw errorCitas
    citas.value = data || []
  } catch (err) {
    console.error('Error al cargar citas:', err)
  } finally {
    cargandoCitas.value = false
  }
}

const cargarBonos = async () => {
  cargandoBonos.value = true

  try {
    const { data, error: errorBonos } = await supabase
      .from('bonos')
      .select('*')
      .eq('paciente_id', pacienteId.value)
      .order('fecha_compra', { ascending: false })

    if (errorBonos) throw errorBonos
    bonos.value = data || []
  } catch (err) {
    console.error('Error al cargar bonos:', err)
  } finally {
    cargandoBonos.value = false
  }
}

const cargarPagos = async () => {
  cargandoPagos.value = true

  try {
    const { data, error: errorPagos } = await supabase
      .from('pagos')
      .select('*')
      .eq('paciente_id', pacienteId.value)
      .order('fecha', { ascending: false })

    if (errorPagos) throw errorPagos
    pagos.value = data || []
  } catch (err) {
    console.error('Error al cargar pagos:', err)
  } finally {
    cargandoPagos.value = false
  }
}

const cargarSesiones = async () => {
  cargandoSesiones.value = true

  try {
    const { data, error: errorSesiones } = await supabase
      .from('sesiones')
      .select('*')
      .eq('paciente_id', pacienteId.value)
      .order('fecha', { ascending: false })

    if (errorSesiones) throw errorSesiones
    sesiones.value = data || []
  } catch (err) {
    console.error('Error al cargar sesiones:', err)
  } finally {
    cargandoSesiones.value = false
  }
}

// Cargar datos al montar
onMounted(async () => {
  await cargarPaciente()
  await Promise.all([
    cargarCitas(),
    cargarBonos(),
    cargarPagos(),
    cargarSesiones()
  ])
})
</script>
