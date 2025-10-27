<template>
  <div
    v-if="mostrar"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="cerrar"
  >
    <div class="bg-[#F9F7F3] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-[#F9F7F3] border-b border-[#D8AFA0]/30 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-['Lora'] text-[#5D4A44] font-semibold flex items-center gap-2">
            <span class="text-2xl">🎫</span>
            Nuevo Bono
          </h2>
          <p class="text-sm text-[#5D4A44]/60 mt-1">
            Crea un nuevo bono para {{ pacienteNombre }}
          </p>
        </div>
        <button
          @click="cerrar"
          class="text-[#5D4A44] hover:text-[#D8AFA0] transition-colors"
          aria-label="Cerrar modal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="guardarBono" class="px-6 py-6 space-y-6">
        <!-- Tipo y Frecuencia -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#5D4A44] mb-2">
              Tipo de Bono <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.tipo"
              required
              class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white"
            >
              <option value="">Seleccionar tipo</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
              <option value="semestral">Semestral</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-[#5D4A44] mb-2">
              Frecuencia Sugerida <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.frecuencia"
              required
              class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white"
            >
              <option value="">Seleccionar frecuencia</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
        </div>

        <!-- Sesiones Totales -->
        <div>
          <label class="block text-sm font-medium text-[#5D4A44] mb-2">
            Sesiones Totales <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="formData.sesiones_totales"
            type="number"
            min="1"
            max="100"
            required
            placeholder="Ej: 4, 8, 12..."
            class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]"
          />
          <p class="text-xs text-[#5D4A44]/60 mt-1">
            Número de sesiones incluidas en el bono
          </p>
        </div>

        <!-- Monto -->
        <div>
          <label class="block text-sm font-medium text-[#5D4A44] mb-2">
            Monto Total <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5D4A44]/60">€</span>
            <input
              v-model.number="formData.monto"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              class="w-full pl-8 pr-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]"
            />
          </div>
          <p class="text-xs text-[#5D4A44]/60 mt-1">
            Precio total del bono (todas las sesiones)
          </p>
        </div>

        <!-- Fechas -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#5D4A44] mb-2">
              Fecha de Inicio
            </label>
            <input
              v-model="formData.fecha_inicio"
              type="date"
              class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-[#5D4A44] mb-2">
              Fecha de Vencimiento
            </label>
            <input
              v-model="formData.fecha_fin"
              type="date"
              :min="formData.fecha_inicio"
              class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]"
            />
          </div>
        </div>

        <!-- Renovación Automática -->
        <div class="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <input
            v-model="formData.renovacion_automatica"
            type="checkbox"
            id="renovacion-auto"
            class="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label for="renovacion-auto" class="flex-1 cursor-pointer">
            <div class="text-sm font-medium text-purple-900">
              🔄 Renovación Automática
            </div>
            <div class="text-xs text-purple-700 mt-1">
              El bono se renovará automáticamente cuando se complete o venza
            </div>
          </label>
        </div>

        <!-- Estado Inicial -->
        <div>
          <label class="block text-sm font-medium text-[#5D4A44] mb-2">
            Estado Inicial
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all"
              :class="formData.estado === 'pendiente' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 hover:border-yellow-300'"
            >
              <input
                v-model="formData.estado"
                type="radio"
                value="pendiente"
                class="w-4 h-4 text-yellow-600"
              />
              <div>
                <div class="text-sm font-medium text-[#5D4A44]">⏳ Pendiente</div>
                <div class="text-xs text-[#5D4A44]/60">Requiere pago</div>
              </div>
            </label>

            <label class="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all"
              :class="formData.estado === 'activo' ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-300'"
            >
              <input
                v-model="formData.estado"
                type="radio"
                value="activo"
                class="w-4 h-4 text-green-600"
              />
              <div>
                <div class="text-sm font-medium text-[#5D4A44]">✅ Activo</div>
                <div class="text-xs text-[#5D4A44]/60">Ya pagado</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Notas -->
        <div>
          <label class="block text-sm font-medium text-[#5D4A44] mb-2">
            Notas (Opcional)
          </label>
          <textarea
            v-model="formData.notas"
            rows="3"
            placeholder="Información adicional sobre el bono..."
            class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] resize-none"
          ></textarea>
        </div>

        <!-- Resumen del bono -->
        <div v-if="resumenVisible" class="p-4 bg-gradient-to-r from-[#D8AFA0]/10 to-[#ECC8BA]/10 rounded-lg border border-[#D8AFA0]/30">
          <div class="font-medium text-[#5D4A44] mb-3 flex items-center gap-2">
            <span>📋</span>
            Resumen del Bono
          </div>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-[#5D4A44]/60">Tipo:</span>
              <span class="font-medium text-[#5D4A44] ml-1 capitalize">{{ formData.tipo || '-' }}</span>
            </div>
            <div>
              <span class="text-[#5D4A44]/60">Frecuencia:</span>
              <span class="font-medium text-[#5D4A44] ml-1 capitalize">{{ formData.frecuencia || '-' }}</span>
            </div>
            <div>
              <span class="text-[#5D4A44]/60">Sesiones:</span>
              <span class="font-medium text-[#5D4A44] ml-1">{{ formData.sesiones_totales || 0 }}</span>
            </div>
            <div>
              <span class="text-[#5D4A44]/60">Monto:</span>
              <span class="font-medium text-[#5D4A44] ml-1">€{{ formData.monto || 0 }}</span>
            </div>
            <div>
              <span class="text-[#5D4A44]/60">Precio/sesión:</span>
              <span class="font-medium text-[#5D4A44] ml-1">€{{ precioSesion }}</span>
            </div>
            <div>
              <span class="text-[#5D4A44]/60">Estado:</span>
              <span class="font-medium capitalize ml-1"
                :class="formData.estado === 'activo' ? 'text-green-600' : 'text-yellow-600'"
              >
                {{ formData.estado || '-' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Mensajes de error -->
        <div v-if="errorMensaje" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-700 flex items-center gap-2">
            <span>❌</span>
            {{ errorMensaje }}
          </p>
        </div>

        <!-- Botones de acción -->
        <div class="flex gap-3 pt-4 border-t border-[#D8AFA0]/30">
          <button
            type="button"
            @click="cerrar"
            class="flex-1 px-6 py-3 bg-white border border-[#D8AFA0]/30 text-[#5D4A44] rounded-lg hover:bg-[#D8AFA0]/10 transition-colors font-medium"
            :disabled="guardando"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="flex-1 px-6 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="guardando || !formularioValido"
          >
            {{ guardando ? 'Creando...' : 'Crear Bono' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  mostrar: boolean
  pacienteId: string
  pacienteNombre: string
  psicologaId?: string
}>()

const emit = defineEmits<{
  close: []
  created: [bono: any]
}>()

const { crearBono } = useBonos()
const { userProfile } = useSupabase()

// Estado del formulario
const formData = ref({
  tipo: 'mensual',
  frecuencia: 'semanal',
  sesiones_totales: 4,
  monto: 0,
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: '',
  estado: 'pendiente',
  renovacion_automatica: false,
  notas: ''
})

const guardando = ref(false)
const errorMensaje = ref('')

// Computed
const resumenVisible = computed(() => {
  return formData.value.tipo && formData.value.sesiones_totales && formData.value.monto
})

const precioSesion = computed(() => {
  if (!formData.value.sesiones_totales || !formData.value.monto) return '0.00'
  const precio = formData.value.monto / formData.value.sesiones_totales
  return precio.toFixed(2)
})

const formularioValido = computed(() => {
  return !!(
    formData.value.tipo &&
    formData.value.frecuencia &&
    formData.value.sesiones_totales > 0 &&
    formData.value.monto > 0 &&
    formData.value.estado
  )
})

// Métodos
const cerrar = () => {
  if (!guardando.value) {
    errorMensaje.value = ''
    emit('close')
  }
}

const guardarBono = async () => {
  if (!formularioValido.value) {
    errorMensaje.value = 'Por favor completa todos los campos requeridos'
    return
  }

  try {
    guardando.value = true
    errorMensaje.value = ''

    const bonoData = {
      paciente_id: props.pacienteId,
      terapeuta_id: props.psicologaId || userProfile.value?.id,
      tipo: formData.value.tipo,
      frecuencia: formData.value.frecuencia,
      sesiones_totales: formData.value.sesiones_totales,
      sesiones_restantes: formData.value.sesiones_totales, // Inicialmente todas disponibles
      fecha_inicio: formData.value.fecha_inicio || null,
      fecha_fin: formData.value.fecha_fin || null,
      estado: formData.value.estado,
      monto: formData.value.monto,
      pagado: formData.value.estado === 'activo', // Si es activo, ya está pagado
      renovacion_automatica: formData.value.renovacion_automatica,
      notas: formData.value.notas || null
    }

    const nuevoBono = await crearBono(bonoData)

    emit('created', nuevoBono)
    emit('close')

    // Resetear formulario
    formData.value = {
      tipo: 'mensual',
      frecuencia: 'semanal',
      sesiones_totales: 4,
      monto: 0,
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
      estado: 'pendiente',
      renovacion_automatica: false,
      notas: ''
    }
  } catch (err: any) {
    console.error('[ModalNuevoBono] Error al crear bono:', err)
    errorMensaje.value = err.message || 'Error al crear el bono. Inténtalo de nuevo.'
  } finally {
    guardando.value = false
  }
}

// Watch para calcular fecha_fin automáticamente según el tipo
watch(() => formData.value.tipo, (nuevoTipo) => {
  if (formData.value.fecha_inicio && nuevoTipo) {
    const inicio = new Date(formData.value.fecha_inicio)
    let fin = new Date(inicio)
    
    switch (nuevoTipo) {
      case 'quincenal':
        fin.setDate(fin.getDate() + 15)
        break
      case 'mensual':
        fin.setMonth(fin.getMonth() + 1)
        break
      case 'semestral':
        fin.setMonth(fin.getMonth() + 6)
        break
    }
    
    formData.value.fecha_fin = fin.toISOString().split('T')[0]
  }
})
</script>
