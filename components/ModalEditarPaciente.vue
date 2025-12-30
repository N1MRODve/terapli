<template>
  <div
    v-if="mostrar"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="cerrarModal"
  >
    <div class="bg-[#F2F2F2] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-[#F2F2F2] border-b border-[#5550F2]/30 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <h2 class="text-xl sm:text-2xl font-serif text-[#2D3748] font-semibold">
          Editar Paciente
        </h2>
        <button
          @click="cerrarModal"
          class="text-[#2D3748] hover:text-[#5550F2] transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Cerrar modal"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="actualizarPaciente" class="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <!-- Información Personal -->
        <div class="space-y-4">
          <h3 class="text-lg font-serif text-[#2D3748] font-semibold">
            Información Personal
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Nombre -->
            <div>
              <label for="nombre" class="block text-sm font-medium text-[#2D3748] mb-1">
                Nombre <span class="text-red-500">*</span>
              </label>
              <input
                id="nombre"
                v-model="formulario.nombre"
                type="text"
                required
                class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:ring-2 focus:ring-[#5550F2] focus:border-transparent bg-white"
                placeholder="Nombre del paciente"
              />
            </div>

            <!-- Apellido -->
            <div>
              <label for="apellido" class="block text-sm font-medium text-[#2D3748] mb-1">
                Apellido <span class="text-red-500">*</span>
              </label>
              <input
                id="apellido"
                v-model="formulario.apellido"
                type="text"
                required
                class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:ring-2 focus:ring-[#5550F2] focus:border-transparent bg-white"
                placeholder="Apellido(s) del paciente"
              />
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-[#2D3748] mb-1">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                v-model="formulario.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:ring-2 focus:ring-[#5550F2] focus:border-transparent bg-white"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <!-- Teléfono -->
            <div>
              <label for="telefono" class="block text-sm font-medium text-[#2D3748] mb-1">
                Teléfono
              </label>
              <input
                id="telefono"
                v-model="formulario.telefono"
                type="tel"
                class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:ring-2 focus:ring-[#5550F2] focus:border-transparent bg-white"
                placeholder="+52 123 456 7890"
              />
            </div>

            <!-- Fecha de Nacimiento -->
            <div>
              <label for="fecha_nacimiento" class="block text-sm font-medium text-[#2D3748] mb-1">
                Fecha de Nacimiento
              </label>
              <input
                id="fecha_nacimiento"
                v-model="formulario.fecha_nacimiento"
                type="date"
                class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:ring-2 focus:ring-[#5550F2] focus:border-transparent bg-white"
              />
            </div>
          </div>
        </div>

        <!-- Información Terapéutica -->
        <div class="space-y-4 pt-4 border-t border-[#5550F2]/30">
          <h3 class="text-lg font-serif text-[#2D3748] font-semibold">
            Información Terapéutica
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Tipo de Bono -->
            <div>
              <label for="tipo_bono" class="block text-sm font-medium text-[#2D3748] mb-1">
                Tipo de Bono <span class="text-red-500">*</span>
              </label>
              <select
                id="tipo_bono"
                v-model="formulario.tipo_bono"
                required
                class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:ring-2 focus:ring-[#5550F2] focus:border-transparent bg-white"
              >
                <option value="">Selecciona tipo de bono</option>
                <option value="a_demanda">A Demanda (1 sesión)</option>
                <option value="quincenal">Quincenal (2 sesiones/mes)</option>
                <option value="semanal">Semanal (4 sesiones/mes)</option>
              </select>
            </div>

            <!-- Precio por Sesión Personalizado -->
            <div>
              <label for="precio_sesion" class="block text-sm font-medium text-[#2D3748] mb-1">
                Precio por Sesión (€)
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/60">€</span>
                <input
                  id="precio_sesion"
                  v-model.number="formulario.precio_sesion"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Usar precio del terapeuta"
                  class="w-full pl-8 pr-4 py-2 border border-[#5550F2]/30 rounded-lg focus:ring-2 focus:ring-[#5550F2] focus:border-transparent bg-white"
                />
              </div>
              <p class="text-xs text-[#2D3748]/60 mt-1">
                💡 Precio personalizado para este paciente. Si está vacío, se usa el precio según frecuencia del terapeuta.
              </p>
            </div>

            <!-- Estado -->
            <div>
              <label for="activo" class="block text-sm font-medium text-[#2D3748] mb-1">
                Estado
              </label>
              <select
                id="activo"
                v-model="formulario.activo"
                class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:ring-2 focus:ring-[#5550F2] focus:border-transparent bg-white"
              >
                <option :value="true">Activo</option>
                <option :value="false">Inactivo</option>
              </select>
            </div>

            <!-- En Pausa -->
            <div class="md:col-span-2 space-y-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="formulario.en_pausa"
                  type="checkbox"
                  class="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                />
                <span class="text-sm font-medium text-[#2D3748]">
                  Proceso en pausa temporal
                </span>
              </label>

              <!-- Aviso de pausa con mensaje de escasez -->
              <div v-if="formulario.en_pausa" class="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <div class="flex items-start gap-3">
                  <span class="text-2xl">⏸️</span>
                  <div>
                    <p class="font-medium text-amber-800">Cuenta en pausa temporal</p>
                    <p class="text-sm text-amber-700 mt-1">
                      El proceso terapeutico esta pausado. El paciente mantendra su espacio reservado durante <strong>45 dias</strong>.
                    </p>
                  </div>
                </div>

                <!-- Countdown y mensaje de escasez -->
                <div class="bg-white/80 rounded-lg p-3 border border-amber-100">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">Dias restantes:</span>
                    <span class="text-lg font-bold" :class="diasRestantesPausa <= 7 ? 'text-red-600' : 'text-amber-600'">
                      {{ diasRestantesPausa }} dias
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full transition-all"
                      :class="diasRestantesPausa <= 7 ? 'bg-red-500' : 'bg-amber-500'"
                      :style="{ width: `${Math.max(0, (diasRestantesPausa / 45) * 100)}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Mensaje de advertencia -->
                <div class="text-xs text-amber-800 space-y-2 bg-amber-100/50 rounded p-3">
                  <p class="font-medium flex items-center gap-1">
                    <span>⚠️</span> Importante:
                  </p>
                  <ul class="list-disc list-inside space-y-1 text-amber-700">
                    <li>Pasados los 45 dias, el perfil se <strong>desactivara automaticamente</strong></li>
                    <li>Se liberara su espacio en la agenda de Psicologa Karem</li>
                    <li>Los datos se eliminaran conforme al <strong>reglamento de proteccion de datos</strong> para garantizar su privacidad</li>
                    <li>Al reactivar, los precios de las sesiones podrian haberse modificado</li>
                  </ul>
                </div>

                <!-- Boton para notificar al paciente -->
                <button
                  type="button"
                  @click="enviarRecordatorioPausa"
                  :disabled="enviandoRecordatorio"
                  class="w-full py-2 px-4 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <template v-if="enviandoRecordatorio">
                    <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Enviando...
                  </template>
                  <template v-else>
                    <span>📧</span>
                    Enviar recordatorio al paciente
                  </template>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestión de Bonos -->
        <div class="space-y-4 pt-4 border-t border-[#5550F2]/30">
          <h3 class="text-lg font-serif text-[#2D3748] font-semibold">
            Gestión de Bonos
          </h3>

          <!-- Bono Activo Existente -->
          <div v-if="bonoActivo" class="border-2 border-blue-400/40 rounded-lg p-4 space-y-4 bg-blue-50/30">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xl">🎫</span>
                <div>
                  <p class="font-medium text-[#2D3748]">Bono {{ bonoActivo.tipo || 'Activo' }}</p>
                  <p class="text-xs text-[#2D3748]/60">
                    Estado: <span :class="bonoActivo.estado === 'activo' ? 'text-green-600' : 'text-amber-600'" class="font-medium capitalize">{{ bonoActivo.estado }}</span>
                  </p>
                </div>
              </div>
              <span class="px-2 py-1 text-xs font-medium rounded-full" :class="bonoActivo.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
                {{ bonoActivo.sesiones_restantes }}/{{ bonoActivo.sesiones_totales }} restantes
              </span>
            </div>

            <!-- Editar Sesiones Consumidas -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[#2D3748] mb-1">
                  Sesiones Totales
                </label>
                <div class="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-[#2D3748] font-medium">
                  {{ bonoActivo.sesiones_totales }}
                </div>
              </div>
              <div>
                <label for="sesiones_usadas_bono" class="block text-sm font-medium text-[#2D3748] mb-1">
                  Sesiones Consumidas
                </label>
                <input
                  id="sesiones_usadas_bono"
                  v-model.number="formulario.bono_sesiones_usadas"
                  type="number"
                  min="0"
                  :max="bonoActivo.sesiones_totales"
                  class="w-full px-4 py-2 border border-blue-400/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
            </div>

            <!-- Indicador de sesiones restantes calculadas -->
            <div class="flex items-center gap-2 p-3 rounded-lg" :class="sesionesRestantesBono <= 0 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'">
              <span :class="sesionesRestantesBono <= 0 ? 'text-red-600' : 'text-blue-600'">
                {{ sesionesRestantesBono <= 0 ? '⚠️' : 'ℹ️' }}
              </span>
              <p class="text-sm" :class="sesionesRestantesBono <= 0 ? 'text-red-800' : 'text-blue-800'">
                <strong>{{ sesionesRestantesBono }}</strong> de {{ bonoActivo.sesiones_totales }} sesiones disponibles
                <span v-if="formulario.bono_sesiones_usadas !== bonoActivo.sesiones_usadas" class="text-amber-600 ml-1">
                  (modificado)
                </span>
              </p>
            </div>

            <p class="text-xs text-[#2D3748]/60">
              💡 Ajusta las sesiones consumidas para sincronizar con datos de otra plataforma o corregir errores.
            </p>
          </div>

          <!-- Sin bono activo -->
          <div v-else-if="!cargandoBono" class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p class="text-sm text-[#2D3748]/70">
              Este paciente no tiene un bono activo.
            </p>
          </div>

          <!-- Cargando bono -->
          <div v-if="cargandoBono" class="flex items-center justify-center py-4">
            <div class="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-2"></div>
            <span class="text-sm text-[#2D3748]/60">Cargando bono...</span>
          </div>

          <!-- Crear nuevo bono -->
          <div class="flex items-center justify-between pt-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="formulario.crear_bono"
                type="checkbox"
                class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span class="text-sm font-medium text-[#2D3748]">
                🎫 Crear nuevo bono para este paciente
              </span>
            </label>
          </div>

          <!-- Formulario de Bono (solo si checkbox está marcado) -->
          <div v-if="formulario.crear_bono" class="border-2 border-purple-400/40 rounded-lg p-4 space-y-4 bg-purple-50/30">
            <!-- Alerta informativa -->
            <div class="bg-purple-100 border border-purple-300 rounded-lg p-3 flex items-start gap-2">
              <svg class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div class="text-sm text-purple-800">
                <p class="font-medium">El bono usará el tipo seleccionado arriba: <strong>{{ nombreTipoBono || 'Selecciona un tipo primero' }}</strong></p>
                <p class="text-xs text-purple-700 mt-1">
                  Sesiones incluidas: {{ sesionesAutomaticas === 'Selecciona tipo' ? 'N/A' : sesionesAutomaticas }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Monto Total -->
              <div>
                <label for="bono_monto" class="block text-sm font-medium text-[#2D3748] mb-1">
                  Monto Total <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-[#2D3748] font-medium">€</span>
                  <input
                    id="bono_monto"
                    v-model.number="formulario.bono_monto"
                    type="number"
                    min="0"
                    step="0.01"
                    :required="formulario.crear_bono"
                    class="w-full pl-8 pr-4 py-2 border border-[#5550F2]/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <!-- Precio por Sesión (calculado) -->
              <div>
                <label class="block text-sm font-medium text-[#2D3748] mb-1">
                  Precio por Sesión
                </label>
                <div class="px-4 py-2 bg-purple-100 border-2 border-purple-300 rounded-lg text-purple-900 font-bold">
                  €{{ precioPorSesion }}
                </div>
              </div>

              <!-- Renovación Automática -->
              <div class="md:col-span-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="formulario.bono_renovacion_automatica"
                    type="checkbox"
                    class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span class="text-sm font-medium text-[#2D3748]">
                    🔄 Renovación automática al vencer
                  </span>
                </label>
                <p class="text-xs text-cafe/60 mt-1 ml-6">
                  El sistema creará un nuevo bono idéntico cuando este expire
                </p>
              </div>
            </div>

            <!-- Resumen del Bono -->
            <div v-if="sesionesAutomaticas && formulario.bono_monto" class="bg-white border border-purple-300 rounded-lg p-4">
              <p class="text-sm font-medium text-[#2D3748] mb-2">📋 Resumen del Bono:</p>
              <div class="text-sm text-cafe/80 space-y-1">
                <p>• <strong>Tipo:</strong> {{ nombreTipoBono }}</p>
                <p>• <strong>Sesiones:</strong> {{ sesionesAutomaticas }}</p>
                <p>• <strong>Total:</strong> €{{ formulario.bono_monto.toFixed(2) }}</p>
                <p>• <strong>Por sesión:</strong> €{{ precioPorSesion }}</p>
                <p v-if="formulario.bono_renovacion_automatica" class="text-purple-700">• ✅ Con renovación automática</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje de Error -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4 border-t border-[#5550F2]/30">
          <button
            type="button"
            @click="cerrarModal"
            :disabled="guardando"
            class="px-6 py-2 border border-[#5550F2] text-[#2D3748] rounded-lg hover:bg-[#5550F2]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="guardando"
            class="px-6 py-2 bg-[#5550F2] text-white rounded-lg hover:bg-[#C69F91] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
import { ref, watch, computed } from 'vue'

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

const { supabase, userProfile } = useSupabase()
const { crearBono } = useBonos()
const { success: toastSuccess, error: toastError } = useToast()

const formulario = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  tipo_bono: '',
  precio_sesion: null,
  activo: true,
  en_pausa: false,
  crear_bono: false,
  bono_monto: null,
  bono_renovacion_automatica: false,
  bono_sesiones_usadas: 0
})

// Estado del bono activo
const bonoActivo = ref(null)
const cargandoBono = ref(false)

// Estado para enviar recordatorio de pausa
const enviandoRecordatorio = ref(false)

// Computed: Dias restantes de pausa (45 dias desde que se puso en pausa)
const diasRestantesPausa = computed(() => {
  if (!formulario.value.en_pausa) return 45

  // Buscar fecha de inicio de pausa en metadata
  const metadata = props.paciente?.metadata || {}
  const fechaPausa = metadata.fecha_pausa

  if (!fechaPausa) return 45 // Si no hay fecha, mostrar 45 dias

  const inicioPausa = new Date(fechaPausa)
  const ahora = new Date()
  const diasPasados = Math.floor((ahora.getTime() - inicioPausa.getTime()) / (1000 * 60 * 60 * 24))

  return Math.max(0, 45 - diasPasados)
})

// Funcion para enviar recordatorio de pausa al paciente
const enviarRecordatorioPausa = async () => {
  if (!props.paciente?.email) {
    toastError('El paciente no tiene email registrado')
    return
  }

  enviandoRecordatorio.value = true

  try {
    // TODO: Implementar envio real de email
    // Por ahora simular envio
    await new Promise(resolve => setTimeout(resolve, 1500))

    toastSuccess(`Recordatorio enviado a ${props.paciente.email}`)
  } catch (err) {
    console.error('Error al enviar recordatorio:', err)
    toastError('No se pudo enviar el recordatorio')
  } finally {
    enviandoRecordatorio.value = false
  }
}

// Computed: Sesiones restantes del bono calculadas
const sesionesRestantesBono = computed(() => {
  if (!bonoActivo.value) return 0
  return Math.max(0, bonoActivo.value.sesiones_totales - (formulario.value.bono_sesiones_usadas || 0))
})

// Computed: Calcular sesiones según tipo de bono del paciente
const sesionesAutomaticas = computed(() => {
  const tipo = formulario.value.tipo_bono
  if (!tipo) return 'Selecciona tipo'
  
  const mapeo = {
    a_demanda: 1,
    quincenal: 2,
    semanal: 4
  }
  
  return mapeo[tipo] || 0
})

// Computed: Nombre del tipo de bono para mostrar
const nombreTipoBono = computed(() => {
  const tipo = formulario.value.tipo_bono
  const nombres = {
    a_demanda: 'A Demanda',
    quincenal: 'Quincenal',
    semanal: 'Semanal'
  }
  return nombres[tipo] || ''
})

// Computed: Calcular precio por sesión
const precioPorSesion = computed(() => {
  const sesiones = sesionesAutomaticas.value
  const monto = formulario.value.bono_monto
  if (sesiones === 'Selecciona tipo' || !monto || sesiones <= 0) return '0.00'
  return (monto / sesiones).toFixed(2)
})

const guardando = ref(false)
const error = ref('')

// Cargar datos del paciente cuando se abre el modal
watch(() => props.mostrar, (nuevo) => {
  if (nuevo && props.paciente) {
    cargarDatosPaciente()
  }
})

const cargarDatosPaciente = async () => {
  const p = props.paciente
  const metadata = p.metadata || {}

  // Descomponer nombre_completo en nombre y apellido
  const nombreCompleto = p.nombre_completo || p.nombre || ''
  const partes = nombreCompleto.split(' ')
  const nombre = partes[0] || metadata.nombre || ''
  // Retrocompatibilidad: buscar en metadata.apellido o apellido_paterno (datos antiguos)
  const apellido = partes.slice(1).join(' ') || metadata.apellido || metadata.apellido_paterno || ''

  formulario.value = {
    nombre: nombre,
    apellido: apellido,
    email: p.email || '',
    telefono: p.telefono || '',
    fecha_nacimiento: metadata.fecha_nacimiento || '',
    tipo_bono: p.tipo_bono || '',
    precio_sesion: p.precio_sesion || null,
    activo: p.activo ?? true,
    en_pausa: p.en_pausa || metadata.en_pausa || false,
    crear_bono: false,
    bono_monto: null,
    bono_renovacion_automatica: false,
    bono_sesiones_usadas: 0
  }
  error.value = ''

  // Cargar bono activo del paciente
  await cargarBonoActivo()
}

const cargarBonoActivo = async () => {
  if (!props.paciente?.id) return

  cargandoBono.value = true
  bonoActivo.value = null

  try {
    const { data, error: bonoError } = await supabase
      .from('bonos')
      .select('*')
      .eq('paciente_id', props.paciente.id)
      .in('estado', ['activo', 'pendiente'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data && !bonoError) {
      bonoActivo.value = data
      formulario.value.bono_sesiones_usadas = data.sesiones_usadas || 0
    }
  } catch (err) {
    // No hay bono activo, es normal
    console.log('No se encontró bono activo para el paciente')
  } finally {
    cargandoBono.value = false
  }
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
    const nombreCompleto = `${formulario.value.nombre.trim()} ${formulario.value.apellido.trim()}`
    
    // Obtener metadata existente para no sobreescribirla completamente
    const metadataExistente = props.paciente.metadata || {}

    // Determinar fecha de pausa
    // Si se esta activando la pausa por primera vez, guardar fecha actual
    // Si ya estaba en pausa, mantener la fecha original
    const enPausaAnterior = metadataExistente.en_pausa || false
    let fechaPausa = metadataExistente.fecha_pausa || null

    if (formulario.value.en_pausa && !enPausaAnterior) {
      // Se esta activando la pausa ahora
      fechaPausa = new Date().toISOString()
    } else if (!formulario.value.en_pausa) {
      // Se esta desactivando la pausa
      fechaPausa = null
    }

    // Actualizar registro en pacientes
    const { data: pacienteData, error: pacienteError } = await supabase
      .from('pacientes')
      .update({
        email: formulario.value.email,
        nombre_completo: nombreCompleto,
        telefono: formulario.value.telefono,
        tipo_bono: formulario.value.tipo_bono,
        precio_sesion: formulario.value.precio_sesion,
        activo: formulario.value.activo,
        en_pausa: formulario.value.en_pausa,
        metadata: {
          ...metadataExistente,
          nombre: formulario.value.nombre,
          apellido: formulario.value.apellido,
          fecha_nacimiento: formulario.value.fecha_nacimiento,
          en_pausa: formulario.value.en_pausa,
          fecha_pausa: fechaPausa,
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

    // Si hay bono activo y se modificaron las sesiones consumidas, actualizarlo
    if (bonoActivo.value && formulario.value.bono_sesiones_usadas !== bonoActivo.value.sesiones_usadas) {
      console.log('Actualizando sesiones del bono...')

      const nuevasSesionesUsadas = formulario.value.bono_sesiones_usadas || 0
      const nuevasSesionesRestantes = bonoActivo.value.sesiones_totales - nuevasSesionesUsadas
      const nuevoEstado = nuevasSesionesRestantes <= 0 ? 'agotado' : bonoActivo.value.estado

      const { error: bonoError } = await supabase
        .from('bonos')
        .update({
          sesiones_usadas: nuevasSesionesUsadas,
          sesiones_restantes: nuevasSesionesRestantes,
          estado: nuevoEstado
        })
        .eq('id', bonoActivo.value.id)

      if (bonoError) {
        console.error('Error al actualizar bono:', bonoError)
        toastError('Error al actualizar las sesiones del bono')
        throw new Error('Error al actualizar las sesiones del bono')
      }

      console.log('Bono actualizado:', { sesiones_usadas: nuevasSesionesUsadas, sesiones_restantes: nuevasSesionesRestantes })
      toastSuccess('Sesiones del bono actualizadas')
    }

    // Si el checkbox de crear bono está marcado, crear el bono
    if (formulario.value.crear_bono && formulario.value.tipo_bono && formulario.value.bono_monto) {
      console.log('[BONO] Iniciando creación de bono para paciente:', props.paciente.id)

      // Validar que tenemos el ID del terapeuta
      const terapeutaId = userProfile.value?.id || props.paciente?.psicologa_id
      if (!terapeutaId) {
        console.error('[BONO] ERROR: No se pudo obtener el ID del terapeuta')
        throw new Error('No se pudo identificar al terapeuta para crear el bono')
      }

      console.log('[BONO] Terapeuta ID:', terapeutaId)

      const fechaInicio = new Date()
      const fechaFin = new Date()

      // Calcular fecha_fin según tipo de bono
      const tipoBono = formulario.value.tipo_bono
      if (tipoBono === 'a_demanda') {
        fechaFin.setMonth(fechaFin.getMonth() + 1)
      } else if (tipoBono === 'quincenal') {
        fechaFin.setDate(fechaFin.getDate() + 15)
      } else if (tipoBono === 'semanal') {
        fechaFin.setMonth(fechaFin.getMonth() + 1)
      }

      const sesiones = sesionesAutomaticas.value

      const bonoData = {
        paciente_id: props.paciente.id,
        terapeuta_id: terapeutaId,  // Columna correcta (no psicologa_id)
        tipo: tipoBono,
        frecuencia: tipoBono,
        sesiones_totales: sesiones,
        sesiones_restantes: sesiones,
        sesiones_usadas: 0,
        monto_total: formulario.value.bono_monto,
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0],
        estado: 'activo',
        pagado: false,
        renovacion_automatica: formulario.value.bono_renovacion_automatica
      }

      console.log('[BONO] Datos del bono a crear:', bonoData)

      try {
        const nuevoBono = await crearBono(bonoData)
        console.log('[BONO] Bono creado exitosamente:', nuevoBono)
        toastSuccess('Bono creado correctamente')
      } catch (bonoErr) {
        console.error('[BONO] Error al crear bono:', bonoErr)
        // No lanzar el error para no interrumpir el guardado del paciente
        toastError('Error al crear el bono: ' + (bonoErr.message || 'Error desconocido'))
      }
    }

    // Emitir evento de éxito
    toastSuccess('Paciente actualizado correctamente')
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
