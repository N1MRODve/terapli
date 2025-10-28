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

            <!-- Apellido -->
            <div>
              <label for="apellido" class="block text-sm font-medium text-[#5D4A44] mb-1">
                Apellido <span class="text-red-500">*</span>
              </label>
              <input
                id="apellido"
                v-model="formulario.apellido"
                type="text"
                required
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
                placeholder="Apellido(s) del paciente"
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
              <div class="relative">
                <input
                  id="fecha_nacimiento"
                  v-model="formulario.fecha_nacimiento"
                  type="date"
                  class="w-full px-4 py-2 pr-12 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white cursor-pointer"
                  @focus="abrirSelectorFecha($event)"
                />
                <button
                  type="button"
                  @click="abrirSelectorFecha($event, 'fecha_nacimiento')"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#D8AFA0] hover:text-[#5D4A44] transition-colors"
                  title="Abrir calendario"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <p class="text-xs text-cafe/60 mt-1">
                💡 Puedes escribir la fecha o usar el calendario
              </p>
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

            <!-- Tipo de Bono -->
            <div>
              <label for="tipo_bono" class="block text-sm font-medium text-[#5D4A44] mb-1">
                Tipo de Bono <span class="text-red-500">*</span>
              </label>
              <select
                id="tipo_bono"
                v-model="formulario.tipo_bono"
                required
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
              >
                <option value="">Selecciona tipo de bono</option>
                <option value="otro">A Demanda (1 sesión)</option>
                <option value="quincenal">Quincenal (2 sesiones/mes)</option>
                <option value="semanal">Semanal (4 sesiones/mes)</option>
                <option value="mensual">Mensual</option>
              </select>
              <p class="text-xs text-cafe/60 mt-1">
                🎫 Define el tipo de bono del paciente
              </p>
            </div>

            <!-- Primera Sesión -->
            <div>
              <label for="primera_sesion" class="block text-sm font-medium text-[#5D4A44] mb-1">
                Primera Sesión <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="primera_sesion"
                  v-model="formulario.primera_sesion"
                  type="datetime-local"
                  required
                  class="w-full px-4 py-2 pr-12 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white cursor-pointer"
                  @focus="abrirSelectorFecha($event)"
                />
                <button
                  type="button"
                  @click="abrirSelectorFecha($event, 'primera_sesion')"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#D8AFA0] hover:text-[#5D4A44] transition-colors"
                  title="Abrir selector de fecha y hora"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <p class="text-xs text-cafe/60 mt-1">
                � Puedes escribir la fecha/hora o usar el selector
              </p>
            </div>
          </div>
        </div>

        <!-- Creación de Bono Inicial (Opcional) -->
        <div class="space-y-4 pt-4 border-t border-[#D8AFA0]/30">
          <div>
            <h3 class="text-lg font-['Lora'] text-[#5D4A44] font-semibold mb-2">
              💳 Bono Inicial (Opcional)
            </h3>
            <p class="text-sm text-cafe/70 mb-3">
              Crea un bono prepagado para que el paciente empiece su tratamiento. Podrás confirmar el pago después.
            </p>
            <label class="flex items-center gap-3 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
              <input
                v-model="formulario.crear_bono"
                type="checkbox"
                class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span class="text-sm font-semibold text-purple-700">
                ✅ Sí, crear bono prepagado para este paciente
              </span>
            </label>
          </div>

          <!-- Formulario de Bono (solo si checkbox está marcado) -->
          <div v-if="formulario.crear_bono" class="border-2 border-purple-400/40 rounded-lg p-5 space-y-4 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <!-- Resumen del tipo de bono seleccionado -->
            <div class="bg-white border-2 border-purple-300 rounded-lg p-4 shadow-sm">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-white text-xl">🎟️</span>
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-purple-900 mb-1">
                    Tipo de Bono: {{ nombreTipoBono || 'Selecciona un tipo arriba' }}
                  </h4>
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="flex items-center gap-2">
                      <span class="text-purple-600">📊</span>
                      <span class="text-purple-800">
                        <strong>{{ sesionesSegunTipo }}</strong> {{ sesionesSegunTipo === 1 ? 'sesión' : 'sesiones' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2" v-if="precioSugeridoBono > 0">
                      <span class="text-purple-600">💰</span>
                      <span class="text-purple-800">
                        Precio sugerido: <strong>€{{ precioSugeridoBono }}</strong>
                      </span>
                    </div>
                  </div>
                  <p class="text-xs text-purple-600 mt-2 bg-purple-50 p-2 rounded">
                    💡 <strong>Tip:</strong> Los precios se calcularán automáticamente según el tipo de bono
                  </p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Monto del Bono -->
              <div>
                <label for="bono_monto" class="block text-sm font-medium text-[#5D4A44] mb-1">
                  Monto Total <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5D4A44]/60">€</span>
                  <input
                    id="bono_monto"
                    v-model.number="formulario.bono_monto"
                    type="number"
                    min="0"
                    step="0.01"
                    :required="formulario.crear_bono"
                    placeholder="0.00"
                    class="w-full pl-8 pr-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>

              <!-- Precio por sesión (calculado) -->
              <div>
                <label class="block text-sm font-medium text-[#5D4A44] mb-1">
                  Precio por Sesión
                </label>
                <div class="px-4 py-2 bg-purple-100 rounded-lg border border-purple-300">
                  <span class="text-lg font-bold text-purple-700">€{{ precioPorSesionBono }}</span>
                </div>
              </div>

              <!-- Renovación Automática -->
              <div class="md:col-span-2">
                <label class="flex items-start gap-3 p-4 bg-white border-2 border-purple-200 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all">
                  <input
                    v-model="formulario.bono_renovacion_automatica"
                    type="checkbox"
                    class="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-lg">🔄</span>
                      <span class="text-sm font-semibold text-purple-900">
                        Renovación Automática
                      </span>
                      <span class="ml-auto px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        Recomendado
                      </span>
                    </div>
                    <div class="text-xs text-[#5D4A44]/70 space-y-1">
                      <p>✓ El bono se renovará automáticamente cuando se agoten las sesiones o expire</p>
                      <p>✓ Mantiene la continuidad del tratamiento sin interrupciones</p>
                      <p>✓ Puedes desactivar la renovación en cualquier momento</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Resumen del bono -->
            <div v-if="sesionesSegunTipo > 0 && formulario.bono_monto > 0" class="p-3 bg-white rounded-lg border border-purple-300">
              <div class="text-xs font-medium text-purple-800 mb-2">📋 Resumen del Bono</div>
              <div class="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span class="text-[#5D4A44]/60">Tipo:</span>
                  <span class="font-medium text-[#5D4A44] ml-1">{{ nombreTipoBono }}</span>
                </div>
                <div>
                  <span class="text-[#5D4A44]/60">Sesiones:</span>
                  <span class="font-medium text-[#5D4A44] ml-1">{{ sesionesSegunTipo }}</span>
                </div>
                <div>
                  <span class="text-[#5D4A44]/60">Total:</span>
                  <span class="font-medium text-[#5D4A44] ml-1">€{{ formulario.bono_monto }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notas Iniciales -->
        <div class="space-y-4 pt-4 border-t border-[#D8AFA0]/30">
          <h3 class="text-lg font-['Lora'] text-[#5D4A44] font-semibold">
            Notas Iniciales
          </h3>
          <div>
            <label for="notas_iniciales" class="block text-sm font-medium text-[#5D4A44] mb-1">
              Observaciones (Opcional)
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

        <!-- Botones de Acción - Fijos al fondo -->
        <div class="sticky bottom-0 bg-[#F9F7F3] pt-4 pb-2 border-t-2 border-[#D8AFA0]/30 -mx-6 px-6 mt-6">
          <div class="flex justify-between items-center gap-3">
            <div class="text-xs text-cafe/60">
              <span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
              Los campos con * son obligatorios
            </div>
            <div class="flex gap-3">
              <button
                type="button"
                @click="cerrarModal"
                :disabled="guardando"
                class="px-6 py-2.5 border-2 border-[#D8AFA0] text-[#5D4A44] font-medium rounded-lg hover:bg-[#D8AFA0]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="guardando || !formularioValido"
                class="px-8 py-2.5 bg-[#D8AFA0] text-white font-semibold rounded-lg hover:bg-[#C69F91] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <span v-if="guardando" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span v-else>✓</span>
                {{ guardando ? 'Creando paciente...' : 'Crear Paciente' }}
              </button>
            </div>
          </div>
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
const { crearBono } = useBonos()
const user = useSupabaseUser()

const formulario = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  area_acompanamiento: '',
  tipo_bono: '',
  primera_sesion: '',
  activo: true,
  notas_iniciales: '',
  crear_bono: false,
  bono_monto: 0,
  bono_renovacion_automatica: false
})

const guardando = ref(false)
const error = ref('')

// ============================================================================
// PRECIOS BASE POR TIPO DE BONO
// ============================================================================
const PRECIOS_BASE = {
  otro: 60,         // €60 por 1 sesión (A Demanda)
  quincenal: 110,   // €110 por 2 sesiones (€55/sesión)
  semanal: 200,     // €200 por 4 sesiones (€50/sesión)
  mensual: 180      // €180 por 4 sesiones mensuales
}

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

// Computed: Sesiones según tipo de bono seleccionado
const sesionesSegunTipo = computed(() => {
  const tipo = formulario.value.tipo_bono
  if (!tipo) return 0
  
  const mapeo = {
    otro: 1,        // A Demanda
    quincenal: 2,
    semanal: 4,
    mensual: 4
  }
  
  return mapeo[tipo] || 0
})

// Computed: Nombre del tipo de bono
const nombreTipoBono = computed(() => {
  const tipo = formulario.value.tipo_bono
  const nombres = {
    otro: 'A Demanda',
    quincenal: 'Quincenal',
    semanal: 'Semanal',
    mensual: 'Mensual'
  }
  return nombres[tipo] || 'No seleccionado'
})

// Computed: Precio por sesión del bono
const precioPorSesionBono = computed(() => {
  const sesiones = sesionesSegunTipo.value
  const monto = formulario.value.bono_monto
  if (!sesiones || !monto || sesiones <= 0) return '0.00'
  return (monto / sesiones).toFixed(2)
})

// Computed: Precio sugerido según tipo de bono
const precioSugeridoBono = computed(() => {
  const tipo = formulario.value.tipo_bono
  if (!tipo) return 0
  return PRECIOS_BASE[tipo] || 0
})

// Computed: Validación del formulario
const formularioValido = computed(() => {
  const base = formulario.value.nombre && 
               formulario.value.apellido && 
               formulario.value.email && 
               formulario.value.area_acompanamiento && 
               formulario.value.tipo_bono && 
               formulario.value.primera_sesion
  
  // Si está creando bono, validar que tenga monto
  if (formulario.value.crear_bono) {
    return base && formulario.value.bono_monto > 0
  }
  
  return base
})

// ============================================================================
// WATCHERS
// ============================================================================

// Auto-rellenar monto del bono cuando se selecciona el tipo
watch(() => formulario.value.tipo_bono, (nuevoTipo) => {
  if (nuevoTipo && formulario.value.crear_bono && formulario.value.bono_monto === 0) {
    formulario.value.bono_monto = PRECIOS_BASE[nuevoTipo] || 0
  }
})

// Auto-rellenar monto cuando se activa "crear bono"
watch(() => formulario.value.crear_bono, (crear) => {
  if (crear && formulario.value.tipo_bono && formulario.value.bono_monto === 0) {
    formulario.value.bono_monto = PRECIOS_BASE[formulario.value.tipo_bono] || 0
  }
})

// Resetear formulario cuando se abre el modal
watch(() => props.mostrar, (nuevo) => {
  if (nuevo) {
    resetearFormulario()
  }
})

// ============================================================================
// MÉTODOS
// ============================================================================

// Método para abrir selector de fecha/hora
const abrirSelectorFecha = (event, fieldId) => {
  if (event.target && event.target.showPicker) {
    try {
      event.target.showPicker()
    } catch (error) {
      // showPicker no disponible en algunos navegadores
      console.log('showPicker no disponible')
    }
  } else if (fieldId) {
    // Fallback: enfocar el input
    const input = document.getElementById(fieldId)
    if (input) {
      input.focus()
      input.click()
    }
  }
}

const resetearFormulario = () => {
  formulario.value = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    area_acompanamiento: '',
    tipo_bono: '',
    primera_sesion: '',
    activo: true,
    notas_iniciales: '',
    crear_bono: false,
    bono_monto: 0,
    bono_renovacion_automatica: false
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

    console.log('🆕 Creando nuevo paciente...')
    const nombreCompleto = `${formulario.value.nombre.trim()} ${formulario.value.apellido.trim()}`

    // 1. Crear paciente usando RPC function para sincronizar con profiles
    console.log('📝 Llamando a crear_paciente_simple...')
    const { data: rpcResult, error: rpcError } = await supabase.rpc('crear_paciente_simple', {
      p_email: formulario.value.email,
      p_nombre_completo: nombreCompleto,
      p_telefono: formulario.value.telefono || null,
      p_area_acompanamiento: formulario.value.area_acompanamiento || null,
      p_tipo_bono: formulario.value.tipo_bono || null,
      p_terapeuta_id: userId,
      p_metadata: {
        nombre: formulario.value.nombre,
        apellido: formulario.value.apellido,
        fecha_nacimiento: formulario.value.fecha_nacimiento,
        notas_iniciales: formulario.value.notas_iniciales,
        fecha_registro: new Date().toISOString(),
        primera_sesion: formulario.value.primera_sesion,
        estado_registro: 'activo'
      }
    })

    if (rpcError) {
      console.error('❌ Error en RPC crear_paciente_simple:', rpcError)
      throw new Error(`Error al crear paciente: ${rpcError.message}`)
    }

    if (!rpcResult || !rpcResult.id) {
      const errorMsg = 'Error desconocido al crear paciente'
      console.error('❌ RPC devolvió resultado inválido:', rpcResult)
      throw new Error(errorMsg)
    }

    console.log('✅ Paciente creado exitosamente:', rpcResult)
    const pacienteId = rpcResult.id
    const profileId = null // La RPC ya no crea profiles

    // 2. Crear registro de primera sesión programada si existe
    if (formulario.value.primera_sesion) {
      await supabase
        .from('sesiones')
        .insert({
          paciente_id: pacienteId,
          terapeuta_id: user.value.id,
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
          terapeuta_id: user.value.id,
          contenido: formulario.value.notas_iniciales,
          tipo: 'evaluacion_inicial'
        })
    }

    // 4. Crear bono si está marcado
    if (formulario.value.crear_bono && formulario.value.tipo_bono && formulario.value.bono_monto) {
      try {
        console.log('💳 Creando bono inicial...')
        
        const fechaInicio = new Date().toISOString().split('T')[0]
        let fechaFin = null
        
        // Calcular fecha de fin según el tipo de bono
        const tipoBono = formulario.value.tipo_bono
        if (tipoBono === 'otro') {
          // A demanda: 1 mes de validez
          const fecha = new Date()
          fecha.setMonth(fecha.getMonth() + 1)
          fechaFin = fecha.toISOString().split('T')[0]
        } else if (tipoBono === 'quincenal') {
          const fecha = new Date()
          fecha.setDate(fecha.getDate() + 15)
          fechaFin = fecha.toISOString().split('T')[0]
        } else if (tipoBono === 'semanal') {
          const fecha = new Date()
          fecha.setMonth(fecha.getMonth() + 1)
          fechaFin = fecha.toISOString().split('T')[0]
        } else if (tipoBono === 'mensual') {
          const fecha = new Date()
          fecha.setMonth(fecha.getMonth() + 1)
          fechaFin = fecha.toISOString().split('T')[0]
        }

        const sesiones = sesionesSegunTipo.value

        const bonoData = {
          paciente_id: pacienteId,
          terapeuta_id: userId,
          tipo: tipoBono,
          sesiones_totales: sesiones,
          sesiones_restantes: sesiones,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          estado: 'pendiente', // Pendiente hasta que se confirme el pago
          monto_total: formulario.value.bono_monto,
          precio_por_sesion: (formulario.value.bono_monto / sesiones),
          pagado: false,
          renovacion_automatica: formulario.value.bono_renovacion_automatica,
          notas: `Bono creado al registrar paciente. ${nombreCompleto}`,
          metadata: {
            creado_con_paciente: true,
            fecha_creacion: new Date().toISOString()
          }
        }

        console.log('📦 Datos del bono a crear:', bonoData)

        const bonoCreado = await crearBono(bonoData)
        
        if (bonoCreado) {
          console.log('✅ Bono creado exitosamente:', bonoCreado)
        }

      } catch (bonoError) {
        console.error('⚠️ Error al crear bono:', bonoError)
        // Mostrar el error al usuario pero no fallar la creación del paciente
        error.value = `Paciente creado, pero hubo un error al crear el bono: ${bonoError.message}`
      }
    }

    // 5. TODO: Enviar email de invitación al paciente para que cree su cuenta
    // Esto se implementará más adelante con una función edge

    // Emitir evento de éxito con los datos del paciente
    emit('paciente-creado', rpcResult)
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
