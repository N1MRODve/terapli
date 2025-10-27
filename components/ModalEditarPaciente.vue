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
          Editar Paciente
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
      <form @submit.prevent="actualizarPaciente" class="px-6 py-6 space-y-6">
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
                <option value="a_demanda">A Demanda (1 sesión)</option>
                <option value="quincenal">Quincenal (2 sesiones/mes)</option>
                <option value="semanal">Semanal (4 sesiones/mes)</option>
              </select>
            </div>

            <!-- Estado -->
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

            <!-- En Pausa -->
            <div class="md:col-span-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="formulario.en_pausa"
                  type="checkbox"
                  class="w-4 h-4 text-[#D8AFA0] border-gray-300 rounded focus:ring-[#D8AFA0]"
                />
                <span class="text-sm font-medium text-[#5D4A44]">
                  Proceso en pausa temporal
                </span>
              </label>
              <p class="text-xs text-cafe/60 mt-1 ml-6">
                ⏸️ Marca esta opción si el seguimiento está pausado temporalmente
              </p>
            </div>
          </div>
        </div>

        <!-- Gestión de Bonos -->
        <div class="space-y-4 pt-4 border-t border-[#D8AFA0]/30">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-['Lora'] text-[#5D4A44] font-semibold">
              Gestión de Bonos
            </h3>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="formulario.crear_bono"
                type="checkbox"
                class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span class="text-sm font-medium text-[#5D4A44]">
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
                <label for="bono_monto" class="block text-sm font-medium text-[#5D4A44] mb-1">
                  Monto Total <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-[#5D4A44] font-medium">€</span>
                  <input
                    id="bono_monto"
                    v-model.number="formulario.bono_monto"
                    type="number"
                    min="0"
                    step="0.01"
                    :required="formulario.crear_bono"
                    class="w-full pl-8 pr-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <!-- Precio por Sesión (calculado) -->
              <div>
                <label class="block text-sm font-medium text-[#5D4A44] mb-1">
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
                  <span class="text-sm font-medium text-[#5D4A44]">
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
              <p class="text-sm font-medium text-[#5D4A44] mb-2">📋 Resumen del Bono:</p>
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

const { supabase } = useSupabase()
const { crearBono } = useBonos()

const formulario = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  area_acompanamiento: '',
  tipo_bono: '',
  activo: true,
  en_pausa: false,
  crear_bono: false,
  bono_monto: null,
  bono_renovacion_automatica: false
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

const cargarDatosPaciente = () => {
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
    area_acompanamiento: p.area_de_acompanamiento || p.area_acompanamiento || '',
    tipo_bono: p.tipo_bono || '',
    activo: p.activo ?? true,
    en_pausa: p.en_pausa || metadata.en_pausa || false,
    crear_bono: false,
    bono_monto: null,
    bono_renovacion_automatica: false
  }
  error.value = ''
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
    
    // Actualizar registro en pacientes
    const { data: pacienteData, error: pacienteError } = await supabase
      .from('pacientes')
      .update({
        email: formulario.value.email,
        nombre_completo: nombreCompleto,
        telefono: formulario.value.telefono,
        area_de_acompanamiento: formulario.value.area_acompanamiento,
        tipo_bono: formulario.value.tipo_bono,
        activo: formulario.value.activo,
        metadata: {
          ...metadataExistente,
          nombre: formulario.value.nombre,
          apellido: formulario.value.apellido,
          fecha_nacimiento: formulario.value.fecha_nacimiento,
          en_pausa: formulario.value.en_pausa,
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

    // Si el checkbox de crear bono está marcado, crear el bono
    if (formulario.value.crear_bono && formulario.value.tipo_bono && formulario.value.bono_monto) {
      console.log('Creando bono para el paciente...')
      
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

      await crearBono({
        paciente_id: props.paciente.id,
        tipo: tipoBono,
        sesiones_totales: sesiones,
        sesiones_disponibles: sesiones,
        monto_total: formulario.value.bono_monto,
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0],
        estado: 'pendiente',
        renovacion_automatica: formulario.value.bono_renovacion_automatica
      })

      console.log('Bono creado exitosamente')
    }

    // Emitir evento de éxito
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
