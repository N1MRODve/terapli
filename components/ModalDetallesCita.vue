<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCitas } from '~/composables/useCitas'
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  MapPinIcon,
  TicketIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  citaId: string | null
}>()

const emit = defineEmits(['close', 'cita-actualizada', 'cita-eliminada', 'actualizado', 'eliminado'])

// Estado para confirmación rápida
const confirmando = ref(false)

// Composables
const supabase = useSupabaseClient()

// Estado
const cita = ref<any>(null)
const paciente = ref<any>(null)
const bono = ref<any>(null)
const cargando = ref(false)
const modoEdicion = ref(false)

// Datos de edición
const formEdicion = ref({
  fecha_cita: '',
  hora_inicio: '',
  hora_fin: '',
  modalidad: '',
  observaciones: '',
  estado: ''
})

// Cargar datos completos de la cita
const cargarCita = async () => {
  console.log('🔍 cargarCita - citaId:', props.citaId)
  if (!props.citaId) {
    console.log('⚠️ No hay citaId, cancelando carga')
    return
  }
  
  try {
    cargando.value = true
    console.log('⏳ Cargando cita...')
    
    // Cargar cita con relaciones
    const { data: citaData, error: citaError } = await supabase
      .from('citas')
      .select(`
        *,
        paciente:pacientes(
          id,
          nombre_completo,
          email,
          telefono,
          frecuencia
        )
      `)
      .eq('id', props.citaId)
      .single()
    
    console.log('📊 Resultado query cita:', { citaData, citaError })
    
    if (citaError) {
      console.error('❌ Error detallado:', JSON.stringify(citaError, null, 2))
      throw citaError
    }
    cita.value = citaData
    paciente.value = citaData.paciente
    console.log('✅ Cita cargada:', cita.value)
    console.log('👤 Paciente:', paciente.value)
    
    // Si tiene bono, cargar información del bono y calcular número de sesión
    if (citaData.bono_id) {
      console.log('🎟️ Cargando bono:', citaData.bono_id)
      const { data: bonoData, error: bonoError } = await supabase
        .from('bonos')
        .select('*')
        .eq('id', citaData.bono_id)
        .single()
      
      console.log('📊 Resultado query bono:', { bonoData, bonoError })
      
      if (!bonoError) {
        bono.value = bonoData
        console.log('✅ Bono cargado:', bono.value)
        
        // Calcular qué número de sesión es esta cita
        const { data: citasAnteriores, error: citasError } = await supabase
          .from('citas')
          .select('id, fecha_cita, hora_inicio')
          .eq('bono_id', citaData.bono_id)
          .eq('sesion_descontada', true)
          .order('fecha_cita', { ascending: true })
          .order('hora_inicio', { ascending: true })
        
        if (!citasError && citasAnteriores) {
          const indice = citasAnteriores.findIndex(c => c.id === props.citaId)
          if (indice !== -1) {
            bono.value.numero_sesion = indice + 1
            console.log('📍 Número de sesión:', bono.value.numero_sesion)
          }
        }
      }
    }
    
    // Inicializar formulario de edición
    formEdicion.value = {
      fecha_cita: citaData.fecha_cita,
      hora_inicio: citaData.hora_inicio?.substring(0, 5) || '',
      hora_fin: citaData.hora_fin?.substring(0, 5) || '',
      modalidad: citaData.modalidad,
      observaciones: citaData.observaciones || '',
      estado: citaData.estado
    }
    
  } catch (error) {
    console.error('❌ Error al cargar cita:', error)
  } finally {
    cargando.value = false
    console.log('🏁 Carga finalizada. Estado:', { cita: cita.value, paciente: paciente.value, bono: bono.value })
  }
}

// Watch para cargar cuando cambia el ID
watch(() => props.citaId, (newId, oldId) => {
  console.log('👀 Watch citaId cambió:', { oldId, newId })
  if (newId) {
    cargarCita()
  } else {
    console.log('🧹 Limpiando estado del modal')
    cita.value = null
    paciente.value = null
    bono.value = null
  }
}, { immediate: true })

// Formatear fecha
const fechaFormateada = computed(() => {
  if (!cita.value?.fecha_cita) return ''
  const fecha = new Date(cita.value.fecha_cita + 'T00:00:00')
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Clase CSS según estado
const claseEstado = computed(() => {
  const estado = cita.value?.estado
  const clases = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmada: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    realizada: 'bg-blue-100 text-blue-800 border-blue-300',
    cancelada: 'bg-red-100 text-red-800 border-red-300'
  }
  return clases[estado as keyof typeof clases] || 'bg-gray-100 text-gray-800'
})

// Color del header según estado
const colorHeader = computed(() => {
  const estado = cita.value?.estado
  const colores = {
    pendiente: 'from-yellow-500 to-amber-600',
    confirmada: 'from-emerald-500 to-teal-600',
    realizada: 'from-blue-500 to-indigo-600',
    cancelada: 'from-red-500 to-rose-600'
  }
  return colores[estado as keyof typeof colores] || 'from-indigo-500 to-purple-600'
})

// Icono según estado
const iconoEstado = computed(() => {
  const estado = cita.value?.estado
  const iconos = {
    pendiente: ExclamationCircleIcon,
    confirmada: CheckCircleIcon,
    realizada: CheckCircleIcon,
    cancelada: XCircleIcon
  }
  return iconos[estado as keyof typeof iconos] || CalendarIcon
})

const estadoLabel = computed(() => {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    realizada: 'Realizada',
    cancelada: 'Cancelada'
  }
  return labels[cita.value?.estado] || cita.value?.estado || ''
})

// Computed: si la cita puede ser confirmada
const puedeConfirmar = computed(() => cita.value?.estado === 'pendiente')

// Acciones
const cerrar = () => {
  modoEdicion.value = false
  emit('close')
}

const activarModoEdicion = () => {
  modoEdicion.value = true
}

/**
 * Confirmación rápida desde el modal
 */
const confirmarCitaRapido = async () => {
  if (!props.citaId || confirmando.value || !puedeConfirmar.value) return

  confirmando.value = true

  try {
    const { error } = await supabase
      .from('citas')
      .update({
        estado: 'confirmada',
        updated_at: new Date().toISOString()
      })
      .eq('id', props.citaId)

    if (error) throw error

    // Actualizar el estado local
    if (cita.value) {
      cita.value.estado = 'confirmada'
    }

    // Emitir evento de actualización
    emit('cita-actualizada')
    emit('actualizado')

    // Mostrar feedback
    alert('✅ Cita confirmada correctamente')
  } catch (error: any) {
    console.error('Error al confirmar cita:', error)
    alert(`❌ Error al confirmar: ${error.message}`)
  } finally {
    confirmando.value = false
  }
}

const cancelarEdicion = () => {
  modoEdicion.value = false
  // Restaurar valores originales
  if (cita.value) {
    formEdicion.value = {
      fecha_cita: cita.value.fecha_cita,
      hora_inicio: cita.value.hora_inicio?.substring(0, 5) || '',
      hora_fin: cita.value.hora_fin?.substring(0, 5) || '',
      modalidad: cita.value.modalidad,
      observaciones: cita.value.observaciones || '',
      estado: cita.value.estado
    }
  }
}

const guardarCambios = async () => {
  if (!props.citaId) return

  try {
    cargando.value = true

    // Validar que hora_fin sea mayor que hora_inicio
    const horaInicioMinutes = parseInt(formEdicion.value.hora_inicio.split(':')[0]) * 60 + parseInt(formEdicion.value.hora_inicio.split(':')[1])
    const horaFinMinutes = parseInt(formEdicion.value.hora_fin.split(':')[0]) * 60 + parseInt(formEdicion.value.hora_fin.split(':')[1])

    if (horaFinMinutes <= horaInicioMinutes) {
      alert('❌ Error: La hora de fin debe ser posterior a la hora de inicio')
      cargando.value = false
      return
    }

    const duracionMinutos = horaFinMinutes - horaInicioMinutes
    if (duracionMinutos < 15) {
      alert('❌ Error: La duración mínima de una cita es de 15 minutos')
      cargando.value = false
      return
    }

    console.log('💾 Guardando cambios de cita:', {
      id: props.citaId,
      fecha_cita: formEdicion.value.fecha_cita,
      hora_inicio: formEdicion.value.hora_inicio,
      hora_fin: formEdicion.value.hora_fin,
      modalidad: formEdicion.value.modalidad,
      estado: formEdicion.value.estado,
      duracion: `${duracionMinutos} minutos`
    })

    const { data, error } = await supabase
      .from('citas')
      .update({
        fecha_cita: formEdicion.value.fecha_cita,
        hora_inicio: formEdicion.value.hora_inicio + ':00',
        hora_fin: formEdicion.value.hora_fin + ':00',
        modalidad: formEdicion.value.modalidad,
        observaciones: formEdicion.value.observaciones,
        estado: formEdicion.value.estado,
        updated_at: new Date().toISOString()
      })
      .eq('id', props.citaId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error de Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw error
    }

    console.log('✅ Cita actualizada exitosamente:', data)

    modoEdicion.value = false
    await cargarCita()

    // Emitir ambos eventos para compatibilidad con diferentes páginas
    emit('cita-actualizada')
    emit('actualizado')
  } catch (error: any) {
    console.error('❌ Error al actualizar cita:', error)
    const errorMsg = error?.message || 'Error desconocido al actualizar la cita'
    alert(`Error al actualizar la cita:\n${errorMsg}`)
  } finally {
    cargando.value = false
  }
}

// Auto-calcular hora_fin cuando cambia hora_inicio en modo edición
// Solo se activa si estamos en modo edición
watch(() => formEdicion.value.hora_inicio, (newHora) => {
  if (modoEdicion.value && newHora) {
    const [hours, minutes] = newHora.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + 60  // +60 minutos (1 hora)
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    formEdicion.value.hora_fin = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }
})

</script>

<template>
  <Teleport to="body">
    <div
      v-if="citaId"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="cerrar"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header con color dinámico según estado -->
        <div 
          :class="[
            'sticky top-0 bg-gradient-to-r px-6 py-4 flex items-center justify-between transition-all duration-300',
            cita ? colorHeader : 'from-indigo-500 to-purple-600'
          ]"
        >
          <div class="flex items-center gap-3">
            <component :is="cita ? iconoEstado : CalendarIcon" class="w-7 h-7 text-white" />
            <div>
              <h2 class="text-xl font-bold text-white">
                {{ modoEdicion ? 'Editar Cita' : 'Detalles de la Cita' }}
              </h2>
              <p class="text-xs text-white/80 mt-0.5">
                {{ modoEdicion ? 'Modifica los datos de la sesión' : 'Información completa de la sesión' }}
              </p>
            </div>
          </div>
          <button
            @click="cerrar"
            class="text-white/90 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="p-12 flex flex-col items-center justify-center bg-gray-50">
          <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p class="text-gray-600">Cargando detalles...</p>
        </div>

        <!-- Contenido -->
        <div v-else-if="cita" class="px-6 py-5 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4 bg-gray-50">
          
          <!-- MODO VISTA -->
          <template v-if="!modoEdicion">
            <!-- Estado y Paciente -->
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <UserIcon class="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1">Paciente</h3>
                    <p class="text-xl font-bold text-gray-900">{{ paciente?.nombre_completo || 'Sin nombre' }}</p>
                  </div>
                </div>
                <span :class="['px-4 py-2 text-sm font-bold rounded-full shadow-md border-2', claseEstado]">
                  {{ estadoLabel.toUpperCase() }}
                </span>
              </div>
              <div class="flex flex-wrap gap-3 text-sm text-gray-600">
                <div v-if="paciente?.email" class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{{ paciente.email }}</span>
                </div>
                <div v-if="paciente?.telefono" class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{{ paciente.telefono }}</span>
                </div>
                <div v-if="paciente?.frecuencia" class="flex items-center gap-2 capitalize">
                  <ClockIcon class="w-4 h-4 text-gray-400" />
                  <span>{{ paciente.frecuencia }}</span>
                </div>
              </div>
            </div>

            <!-- Información de la Cita -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Fecha -->
              <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div class="flex items-center gap-2 mb-2">
                  <CalendarIcon class="w-5 h-5 text-blue-500" />
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</p>
                </div>
                <p class="font-bold text-gray-900 capitalize">{{ fechaFormateada }}</p>
              </div>

              <!-- Horario -->
              <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div class="flex items-center gap-2 mb-2">
                  <ClockIcon class="w-5 h-5 text-green-500" />
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Horario</p>
                </div>
                <p class="font-bold text-gray-900">
                  {{ cita.hora_inicio?.substring(0, 5) }} - {{ cita.hora_fin?.substring(0, 5) }}
                </p>
              </div>

              <!-- Modalidad -->
              <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div class="flex items-center gap-2 mb-2">
                  <component 
                    :is="cita.modalidad === 'virtual' ? VideoCameraIcon : MapPinIcon" 
                    class="w-5 h-5 text-purple-500" 
                  />
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Modalidad</p>
                </div>
                <p class="font-bold text-gray-900 capitalize">{{ cita.modalidad || 'No especificada' }}</p>
              </div>

              <!-- Duración -->
              <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div class="flex items-center gap-2 mb-2">
                  <ClockIcon class="w-5 h-5 text-orange-500" />
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duración</p>
                </div>
                <p class="font-bold text-gray-900">{{ cita.duracion_minutos || 60 }} minutos</p>
              </div>
            </div>

            <!-- Información del Bono -->
            <div v-if="bono" class="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl p-5 shadow-sm border border-emerald-200">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <TicketIcon class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 class="font-bold text-emerald-900 text-lg">Bono Activo</h3>
                    <p class="text-xs text-emerald-700">Información del paquete de sesiones</p>
                  </div>
                </div>
                <div v-if="bono.numero_sesion" class="bg-white px-4 py-2 rounded-full border-2 border-emerald-400 shadow-sm">
                  <span class="text-sm font-black text-emerald-700">Sesión #{{ bono.numero_sesion }}</span>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-4 mb-4">
                <div class="bg-white rounded-lg p-3 text-center">
                  <p class="text-xs text-emerald-600 mb-1 font-medium">Tipo</p>
                  <p class="font-bold text-emerald-900 capitalize text-lg">{{ bono.tipo || 'Individual' }}</p>
                </div>
                <div class="bg-white rounded-lg p-3 text-center">
                  <p class="text-xs text-emerald-600 mb-1 font-medium">Disponibles</p>
                  <p class="font-bold text-emerald-900 text-lg">{{ bono.sesiones_restantes }}</p>
                </div>
                <div class="bg-white rounded-lg p-3 text-center">
                  <p class="text-xs text-emerald-600 mb-1 font-medium">Total</p>
                  <p class="font-bold text-emerald-900 text-lg">{{ bono.sesiones_totales }}</p>
                </div>
              </div>
              <div class="bg-white/70 backdrop-blur rounded-lg p-3">
                <div class="flex items-center justify-between text-xs text-emerald-700 mb-2">
                  <span class="font-semibold">Progreso del bono</span>
                  <span class="font-bold text-sm">
                    {{ Math.round(((bono.sesiones_totales - bono.sesiones_restantes) / bono.sesiones_totales) * 100) }}%
                  </span>
                </div>
                <div class="h-3 bg-emerald-100 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                    :style="{ width: `${((bono.sesiones_totales - bono.sesiones_restantes) / bono.sesiones_totales) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Observaciones -->
            <div v-if="cita.observaciones" class="bg-amber-50 rounded-xl p-5 shadow-sm border border-amber-200">
              <div class="flex items-center gap-2 mb-3">
                <DocumentTextIcon class="w-5 h-5 text-amber-600" />
                <h3 class="font-bold text-amber-900">Observaciones</h3>
              </div>
              <p class="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">{{ cita.observaciones }}</p>
            </div>

            <!-- Metadatos -->
            <div class="text-xs text-gray-400 space-y-1 pt-3 border-t border-gray-200">
              <p class="font-mono">ID: {{ cita.id }}</p>
              <p>Creada: {{ new Date(cita.created_at).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' }) }}</p>
              <p v-if="cita.updated_at">Última modificación: {{ new Date(cita.updated_at).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' }) }}</p>
            </div>
          </template>

          <!-- MODO EDICIÓN -->
          <template v-else>
            <form @submit.prevent="guardarCambios" class="space-y-4">
              <!-- Fecha -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha de la cita</label>
                <input
                  v-model="formEdicion.fecha_cita"
                  type="date"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                />
              </div>

              <!-- Horarios -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Hora de inicio</label>
                  <input
                    v-model="formEdicion.hora_inicio"
                    type="time"
                    required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Hora de fin</label>
                  <input
                    v-model="formEdicion.hora_fin"
                    type="time"
                    required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                  />
                </div>
              </div>

              <!-- Modalidad y Estado -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Modalidad</label>
                  <select
                    v-model="formEdicion.modalidad"
                    required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="telefonica">Telefónica</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                  <select
                    v-model="formEdicion.estado"
                    required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <!-- Observaciones -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
                <textarea
                  v-model="formEdicion.observaciones"
                  rows="4"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white resize-none transition-all"
                  placeholder="Notas adicionales sobre la cita..."
                ></textarea>
              </div>
            </form>
          </template>
        </div>

        <!-- Sin datos -->
        <div v-else class="p-12 text-center bg-gray-50">
          <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-gray-600 font-medium">No se encontraron datos de la cita</p>
          <p class="text-gray-400 text-sm mt-1">ID: {{ citaId }}</p>
          <div class="mt-4 text-xs text-left bg-white p-4 rounded border border-gray-200">
            <p class="font-mono">DEBUG:</p>
            <p class="font-mono">cargando: {{ cargando }}</p>
            <p class="font-mono">cita: {{ cita ? 'existe' : 'null' }}</p>
            <p class="font-mono">citaId prop: {{ citaId }}</p>
          </div>
        </div>

        <!-- Footer con acciones -->
        <div class="px-6 py-4 border-t border-gray-200 flex gap-3 bg-white">
          <template v-if="!modoEdicion">
            <button
              @click="cerrar"
              class="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm"
            >
              Cerrar
            </button>
            <!-- Botón de Confirmación Rápida (solo para citas pendientes) -->
            <button
              v-if="puedeConfirmar"
              @click="confirmarCitaRapido"
              :disabled="confirmando"
              class="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="confirmando" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <CheckCircleIcon v-else class="w-5 h-5" />
              {{ confirmando ? 'Confirmando...' : 'Confirmar Cita' }}
            </button>
            <button
              @click="activarModoEdicion"
              class="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              <PencilSquareIcon class="w-5 h-5" />
              Editar Cita
            </button>
          </template>
          <template v-else>
            <button
              @click="cancelarEdicion"
              type="button"
              class="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm"
            >
              Cancelar
            </button>
            <button
              @click="guardarCambios"
              type="button"
              :disabled="cargando"
              class="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
            >
              {{ cargando ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
