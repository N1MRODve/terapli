<template>
  <div
    v-if="mostrar"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="cerrar"
  >
    <div class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 max-w-3xl w-full max-h-[90vh] overflow-hidden relative">
      <!-- Efectos decorativos -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#5550F2]/5 via-transparent to-[#04BF9D]/5 pointer-events-none"></div>
      <div class="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#F2B33D]/20 to-[#5550F2]/20 rounded-full blur-2xl"></div>
      
      <!-- Contenido con scroll -->
      <div class="relative max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-start sm:items-center z-10">
          <div class="flex items-center gap-3 sm:gap-4 min-w-0">
            <div class="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#5550F2] to-[#027368] shadow-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h2 class="text-xl sm:text-3xl font-['Elms_Sans'] font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent truncate">
                {{ modoEdicion ? 'Editar Bono' : 'Nuevo Bono' }}
              </h2>
              <p class="text-xs sm:text-sm font-sans text-gray-600 mt-0.5 sm:mt-1 truncate">
                {{ modoEdicion ? 'Modifica los datos del bono de' : 'Crea un nuevo bono para' }} {{ pacienteNombre }}
              </p>
            </div>
          </div>
          <button
            @click="cerrar"
            class="p-2 sm:p-3 text-gray-500 hover:text-[#5550F2] hover:bg-gradient-to-br from-[#5550F2]/10 to-[#027368]/10 rounded-xl sm:rounded-2xl transition-all duration-300 backdrop-blur-sm border border-white/50 hover:shadow-lg flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Cerrar modal"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
      </div>

        <!-- Formulario -->
        <form @submit.prevent="guardarBono" class="px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          <!-- Tipo y Frecuencia -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-sans font-semibold text-gray-700 mb-3">
                Tipo de Bono <span class="text-[#F2B33D]">*</span>
              </label>
              <select
                v-model="formData.tipo"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5550F2]/20 focus:border-[#5550F2] bg-white/80 backdrop-blur-sm transition-all duration-300 font-sans hover:bg-white shadow-sm hover:shadow-md"
              >
                <option value="">Seleccionar tipo</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
                <option value="semestral">Semestral</option>
              </select>
            </div>

          <div>
            <label class="block text-sm font-medium text-[#2D3748] mb-2">
              Frecuencia Sugerida <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.frecuencia"
              required
              class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5550F2] bg-white"
            >
              <option value="">Seleccionar frecuencia</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
        </div>

        <!-- Sesiones: Totales y Ya Usadas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#2D3748] mb-2">
              Sesiones Totales <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="formData.sesiones_totales"
              type="number"
              min="1"
              max="100"
              required
              placeholder="Ej: 4, 8, 12..."
              class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5550F2]"
            />
            <p class="text-xs text-[#2D3748]/60 mt-1">
              Sesiones incluidas en el bono
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-[#2D3748] mb-2">
              Sesiones Ya Usadas
            </label>
            <input
              v-model.number="formData.sesiones_usadas"
              type="number"
              min="0"
              :max="formData.sesiones_totales - 1"
              placeholder="0"
              class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5550F2]"
            />
            <p class="text-xs text-[#2D3748]/60 mt-1">
              Para migración desde otra plataforma
            </p>
          </div>
        </div>

        <!-- Indicador de sesiones restantes -->
        <div v-if="formData.sesiones_usadas > 0" class="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span class="text-blue-600">ℹ️</span>
          <p class="text-sm text-blue-800">
            <strong>{{ sesionesRestantesCalculadas }}</strong> de {{ formData.sesiones_totales }} sesiones disponibles
            ({{ formData.sesiones_usadas }} ya consumidas)
          </p>
        </div>

        <!-- Monto -->
        <div>
          <label class="block text-sm font-medium text-[#2D3748] mb-2">
            Monto Total <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/60">€</span>
            <input
              v-model.number="formData.monto"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              class="w-full pl-8 pr-4 py-2 border border-[#5550F2]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5550F2]"
            />
          </div>
          <p class="text-xs text-[#2D3748]/60 mt-1">
            Precio total del bono (todas las sesiones)
          </p>
        </div>

        <!-- Fechas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#2D3748] mb-2">
              Fecha de Inicio
            </label>
            <input
              v-model="formData.fecha_inicio"
              type="date"
              class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5550F2] min-h-[44px]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-[#2D3748] mb-2">
              Fecha de Vencimiento
            </label>
            <input
              v-model="formData.fecha_fin"
              type="date"
              :min="formData.fecha_inicio"
              class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5550F2] min-h-[44px]"
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
            <div class="text-sm font-medium text-purple-900 flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Renovación Automática
            </div>
            <div class="text-xs text-purple-700 mt-1">
              El bono se renovará automáticamente cuando se complete o venza
            </div>
          </label>
        </div>

        <!-- Tipo de registro: Nuevo o Histórico -->
        <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div class="flex items-start gap-3">
            <input
              v-model="formData.es_historico"
              type="checkbox"
              id="es-historico"
              class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="es-historico" class="flex-1 cursor-pointer">
              <div class="text-sm font-medium text-blue-900 flex items-center gap-1.5">
                <span>📜</span>
                Registrar como Bono Histórico
              </div>
              <div class="text-xs text-blue-700 mt-1">
                Marca esta opción para registrar bonos de meses anteriores que no están en el sistema
              </div>
            </label>
          </div>
        </div>

        <!-- Estado y Pago -->
        <div class="space-y-4">
          <label class="block text-sm font-medium text-[#2D3748]">
            Estado del Bono
          </label>

          <!-- Opciones de estado -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <label class="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all"
              :class="formData.estado === 'pendiente' && !formData.pagado ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'"
            >
              <input
                v-model="formData.estado"
                type="radio"
                value="pendiente"
                @change="formData.pagado = false"
                class="w-4 h-4 text-yellow-600"
              />
              <div>
                <div class="text-sm font-medium text-[#2D3748]">⏳ Pendiente</div>
                <div class="text-xs text-[#2D3748]/60">Sin pagar</div>
              </div>
            </label>

            <label class="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all"
              :class="formData.estado === 'activo' ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-300'"
            >
              <input
                v-model="formData.estado"
                type="radio"
                value="activo"
                @change="formData.pagado = true"
                class="w-4 h-4 text-green-600"
              />
              <div>
                <div class="text-sm font-medium text-[#2D3748]">✅ Activo</div>
                <div class="text-xs text-[#2D3748]/60">Pagado y en uso</div>
              </div>
            </label>

            <label v-if="formData.es_historico || formData.sesiones_usadas >= formData.sesiones_totales"
              class="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all"
              :class="formData.estado === 'completado' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'"
            >
              <input
                v-model="formData.estado"
                type="radio"
                value="completado"
                class="w-4 h-4 text-blue-600"
              />
              <div>
                <div class="text-sm font-medium text-[#2D3748]">🏁 Completado</div>
                <div class="text-xs text-[#2D3748]/60">Pagado y usado</div>
              </div>
            </label>

            <label v-if="formData.es_historico"
              class="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all"
              :class="formData.estado === 'agotado' ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-red-300'"
            >
              <input
                v-model="formData.estado"
                type="radio"
                value="agotado"
                class="w-4 h-4 text-red-600"
              />
              <div>
                <div class="text-sm font-medium text-[#2D3748]">❌ Agotado</div>
                <div class="text-xs text-[#2D3748]/60">Sin pagar</div>
              </div>
            </label>
          </div>

          <!-- Checkbox de pagado (visible si es histórico o si estado es completado/agotado) -->
          <div v-if="formData.es_historico || ['completado', 'agotado'].includes(formData.estado)"
            class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input
              v-model="formData.pagado"
              type="checkbox"
              id="bono-pagado"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label for="bono-pagado" class="flex-1 cursor-pointer">
              <div class="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <span>💰</span>
                Este bono ya fue pagado
              </div>
              <div v-if="!formData.pagado" class="text-xs text-red-600 mt-0.5">
                Se registrará como deuda del paciente (€{{ formData.monto || 0 }})
              </div>
            </label>
          </div>
        </div>

        <!-- Notas -->
        <div>
          <label class="block text-sm font-medium text-[#2D3748] mb-2">
            Notas (Opcional)
          </label>
          <textarea
            v-model="formData.notas"
            rows="3"
            placeholder="Información adicional sobre el bono..."
            class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5550F2] resize-none"
          ></textarea>
        </div>

        <!-- Resumen del bono -->
        <div v-if="resumenVisible" class="p-4 bg-gradient-to-r from-[#5550F2]/10 to-[#ECC8BA]/10 rounded-lg border border-[#5550F2]/30">
          <div class="font-medium text-[#2D3748] mb-3 flex items-center gap-2">
            <span>📋</span>
            Resumen del Bono
          </div>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-[#2D3748]/60">Tipo:</span>
              <span class="font-medium text-[#2D3748] ml-1 capitalize">{{ formData.tipo || '-' }}</span>
            </div>
            <div>
              <span class="text-[#2D3748]/60">Frecuencia:</span>
              <span class="font-medium text-[#2D3748] ml-1 capitalize">{{ formData.frecuencia || '-' }}</span>
            </div>
            <div>
              <span class="text-[#2D3748]/60">Sesiones:</span>
              <span class="font-medium text-[#2D3748] ml-1">
                {{ sesionesRestantesCalculadas }}/{{ formData.sesiones_totales || 0 }}
              </span>
            </div>
            <div>
              <span class="text-[#2D3748]/60">Monto:</span>
              <span class="font-medium text-[#2D3748] ml-1">€{{ formData.monto || 0 }}</span>
            </div>
            <div>
              <span class="text-[#2D3748]/60">Precio/sesión:</span>
              <span class="font-medium text-[#2D3748] ml-1">€{{ precioSesion }}</span>
            </div>
            <div>
              <span class="text-[#2D3748]/60">Estado:</span>
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
        <div class="flex gap-3 pt-4 border-t border-[#5550F2]/30">
          <button
            type="button"
            @click="cerrar"
            class="flex-1 px-6 py-3 bg-white border border-[#5550F2]/30 text-[#2D3748] rounded-lg hover:bg-[#5550F2]/10 transition-colors font-medium"
            :disabled="guardando"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="flex-1 px-6 py-3 bg-[#5550F2] text-white rounded-lg hover:bg-[#C89B8A] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="guardando || !formularioValido"
          >
            {{ guardando ? (modoEdicion ? 'Guardando...' : 'Creando...') : (modoEdicion ? 'Guardar Cambios' : 'Crear Bono') }}
          </button>
        </div>
      </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  mostrar: boolean
  pacienteId: string
  pacienteNombre: string
  psicologaId?: string
  bonoExistente?: any // Para modo edición
}>()

const emit = defineEmits<{
  close: []
  created: [bono: any]
  updated: [bono: any]
}>()

const { crearBono, actualizarBono } = useBonos()
const { userProfile } = useSupabase()

// Determinar si es modo edición
const modoEdicion = computed(() => !!props.bonoExistente)

// Estado del formulario
const formData = ref({
  tipo: 'mensual',
  frecuencia: 'semanal',
  sesiones_totales: 4,
  sesiones_usadas: 0,
  monto: 0,
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: '',
  estado: 'pendiente',
  renovacion_automatica: false,
  notas: '',
  es_historico: false,
  pagado: false
})

// Cargar datos del bono existente cuando cambia
watch(() => props.bonoExistente, (bono) => {
  if (bono) {
    formData.value = {
      tipo: bono.tipo || 'mensual',
      frecuencia: bono.frecuencia || 'semanal',
      sesiones_totales: bono.sesiones_totales || 4,
      sesiones_usadas: bono.sesiones_usadas || 0,
      monto: bono.monto_total || 0,
      fecha_inicio: bono.fecha_inicio || new Date().toISOString().split('T')[0],
      fecha_fin: bono.fecha_fin || '',
      estado: bono.estado || 'pendiente',
      renovacion_automatica: bono.renovacion_automatica || false,
      notas: bono.notas || '',
      es_historico: false,
      pagado: bono.pagado || false
    }
  }
}, { immediate: true })

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

const sesionesRestantesCalculadas = computed(() => {
  return Math.max(0, formData.value.sesiones_totales - (formData.value.sesiones_usadas || 0))
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

    const sesionesUsadas = formData.value.sesiones_usadas || 0
    const sesionesRestantes = formData.value.sesiones_totales - sesionesUsadas

    // Determinar estado final
    let estadoFinal = formData.value.estado
    if (sesionesRestantes <= 0 && !['completado', 'agotado'].includes(formData.value.estado)) {
      // Si no quedan sesiones y no es un estado final, marcar como agotado o completado
      estadoFinal = formData.value.pagado ? 'completado' : 'agotado'
    }

    // Determinar si está pagado
    const estaPagado = formData.value.pagado || formData.value.estado === 'activo' || formData.value.estado === 'completado'

    const bonoData = {
      tipo: formData.value.tipo,
      frecuencia: formData.value.frecuencia,
      sesiones_totales: formData.value.sesiones_totales,
      sesiones_usadas: sesionesUsadas,
      sesiones_restantes: sesionesRestantes,
      fecha_inicio: formData.value.fecha_inicio || null,
      fecha_fin: formData.value.fecha_fin || null,
      estado: estadoFinal,
      monto_total: formData.value.monto,
      pagado: estaPagado,
      estado_pago: estaPagado ? 'pagado' : 'pendiente',
      renovacion_automatica: formData.value.renovacion_automatica,
      notas: formData.value.notas || null,
      metadata: formData.value.es_historico ? { es_historico: true, registrado_manualmente: true } : null
    }

    if (modoEdicion.value && props.bonoExistente?.id) {
      // Modo edición: actualizar bono existente
      const bonoActualizado = await actualizarBono(props.bonoExistente.id, bonoData)
      emit('updated', bonoActualizado)
    } else {
      // Modo creación: crear nuevo bono
      const bonoDataCompleto = {
        ...bonoData,
        paciente_id: props.pacienteId,
        terapeuta_id: props.psicologaId || userProfile.value?.id
      }
      const nuevoBono = await crearBono(bonoDataCompleto)
      emit('created', nuevoBono)
    }

    emit('close')

    // Resetear formulario solo si no es edición
    if (!modoEdicion.value) {
      formData.value = {
        tipo: 'mensual',
        frecuencia: 'semanal',
        sesiones_totales: 4,
        sesiones_usadas: 0,
        monto: 0,
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        estado: 'pendiente',
        renovacion_automatica: false,
        notas: '',
        es_historico: false,
        pagado: false
      }
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
    
    formData.value.fecha_fin = fin?.toISOString().split('T')[0] || ''
  }
})
</script>
