<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCitas } from '~/composables/useCitas'

const props = defineProps<{
  isOpen: boolean
  citaId: string | null
}>()

const emit = defineEmits(['close', 'actualizado'])

// Composables
const supabase = useSupabaseClient()
const { actualizarCita, getCitasPorDia } = useCitas()

// Estado
const cita = ref<any>(null)
const cargando = ref(false)
const guardando = ref(false)
const conflictoHorario = ref(false)

// Formulario
const formulario = ref({
  fecha_cita: '',
  hora_inicio: '',
  hora_fin: '',
  duracion: 60,
  modalidad: 'presencial' as 'presencial' | 'online' | 'telefonica',
  estado: 'pendiente' as 'pendiente' | 'confirmada' | 'cancelada' | 'realizada',
  observaciones: ''
})

// Computadas
const fechaFormateada = computed(() => {
  if (!formulario.value.fecha_cita) return ''
  const fecha = new Date(formulario.value.fecha_cita + 'T00:00:00')
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Opciones de fecha rápida
const opcionesFechaRapida = computed(() => {
  const hoy = new Date()
  const opciones = []
  
  const formatearFecha = (fecha: Date) => {
    return fecha.toISOString().split('T')[0]
  }
  
  // Hoy
  opciones.push({
    label: 'Hoy',
    fecha: formatearFecha(hoy)
  })
  
  // Mañana
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)
  opciones.push({
    label: 'Mañana',
    fecha: formatearFecha(manana)
  })
  
  // Próximos 5 días laborables
  const diasLaborables = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
  let fecha = new Date(hoy)
  let contadorDias = 0
  
  while (contadorDias < 5) {
    fecha.setDate(fecha.getDate() + 1)
    const diaSemana = fecha.getDay()
    
    if (diaSemana >= 1 && diaSemana <= 5) {
      opciones.push({
        label: `${diasLaborables[diaSemana - 1]} ${fecha.getDate()}`,
        fecha: formatearFecha(fecha)
      })
      contadorDias++
    }
  }
  
  return opciones
})

// Horas disponibles (intervalos de 30 min)
const horasDisponibles = [
  '08:00', '08:30', 
  '09:00', '09:30', 
  '10:00', '10:30',
  '11:00', '11:30', 
  '12:00', '12:30', 
  '13:00', '13:30',
  '14:00', '14:30', 
  '15:00', '15:30', 
  '16:00', '16:30',
  '17:00', '17:30', 
  '18:00', '18:30', 
  '19:00', '19:30',
  '20:00', '20:30',
  '21:00', '21:30',
  '22:00'
]

// Cargar cita
const cargarCita = async () => {
  console.log('🔍 [ModalEditarCita] Cargando cita con ID:', props.citaId)
  
  if (!props.citaId) {
    console.warn('⚠️ [ModalEditarCita] No hay citaId proporcionado')
    return
  }
  
  try {
    cargando.value = true
    
    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        paciente:pacientes!citas_paciente_id_fkey (
          id,
          nombre_completo,
          email,
          telefono
        )
      `)
      .eq('id', props.citaId)
      .single()
    
    if (error) {
      console.error('❌ [ModalEditarCita] Error en query:', error)
      throw error
    }
    
    console.log('✅ [ModalEditarCita] Cita cargada:', data)
    
    if (data) {
      cita.value = data
      
      // Llenar formulario
      formulario.value = {
        fecha_cita: data.fecha_cita,
        hora_inicio: data.hora_inicio?.substring(0, 5) || '',
        hora_fin: data.hora_fin?.substring(0, 5) || '',
        duracion: data.duracion || 60,
        modalidad: data.modalidad || 'presencial',
        estado: data.estado || 'pendiente',
        observaciones: data.observaciones || ''
      }
      
      console.log('📝 [ModalEditarCita] Formulario llenado:', formulario.value)
    }
  } catch (error) {
    console.error('💥 [ModalEditarCita] Error al cargar cita:', error)
  } finally {
    cargando.value = false
  }
}

// Verificar conflictos de horario
const verificarConflicto = async () => {
  if (!formulario.value.fecha_cita || !formulario.value.hora_inicio || !formulario.value.hora_fin) {
    conflictoHorario.value = false
    return
  }

  try {
    const citas = await getCitasPorDia(formulario.value.fecha_cita)
    
    // Filtrar citas activas excluyendo la cita actual
    const citasActivas = citas.filter((c: any) => 
      c.estado !== 'cancelada' && 
      c.id !== props.citaId // Excluir la cita que estamos editando
    )
    
    const inicioNueva = formulario.value.hora_inicio
    const finNueva = formulario.value.hora_fin
    
    // Verificar solapamiento
    conflictoHorario.value = citasActivas.some((c: any) => {
      const inicioExistente = c.hora_inicio?.substring(0, 5)
      const finExistente = c.hora_fin?.substring(0, 5)
      
      // Convertir a minutos
      const minNuevaInicio = horaAMinutos(inicioNueva)
      const minNuevaFin = horaAMinutos(finNueva)
      const minExistenteInicio = horaAMinutos(inicioExistente)
      const minExistenteFin = horaAMinutos(finExistente)
      
      return (
        (minNuevaInicio >= minExistenteInicio && minNuevaInicio < minExistenteFin) ||
        (minNuevaFin > minExistenteInicio && minNuevaFin <= minExistenteFin) ||
        (minNuevaInicio <= minExistenteInicio && minNuevaFin >= minExistenteFin)
      )
    })
  } catch (error) {
    console.error('Error al verificar conflicto:', error)
    conflictoHorario.value = false
  }
}

// Convertir hora a minutos
const horaAMinutos = (hora: string): number => {
  if (!hora || !hora.includes(':')) return 0
  const [horas, minutos] = hora.split(':').map(Number)
  return (horas || 0) * 60 + (minutos || 0)
}

// Calcular hora fin automáticamente
watch(() => formulario.value.hora_inicio, (nuevaHora) => {
  if (nuevaHora && formulario.value.duracion) {
    const [horas, minutos] = nuevaHora.split(':').map(Number)
    const totalMinutos = (horas || 0) * 60 + (minutos || 0) + formulario.value.duracion
    const horaFin = Math.floor(totalMinutos / 60)
    const minutosFin = totalMinutos % 60
    formulario.value.hora_fin = `${String(horaFin).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}`
  }
})

watch(() => formulario.value.duracion, (nuevaDuracion) => {
  if (formulario.value.hora_inicio && nuevaDuracion) {
    const [horas, minutos] = formulario.value.hora_inicio.split(':').map(Number)
    const totalMinutos = (horas || 0) * 60 + (minutos || 0) + nuevaDuracion
    const horaFin = Math.floor(totalMinutos / 60)
    const minutosFin = totalMinutos % 60
    formulario.value.hora_fin = `${String(horaFin).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}`
  }
})

// Verificar conflictos al cambiar fecha/hora
watch([() => formulario.value.fecha_cita, () => formulario.value.hora_inicio, () => formulario.value.hora_fin], () => {
  verificarConflicto()
})

// Guardar cambios
const guardar = async () => {
  if (!props.citaId) return
  
  // Verificar conflictos antes de guardar
  await verificarConflicto()
  
  if (conflictoHorario.value) {
    return
  }
  
  try {
    guardando.value = true
    
    const resultado = await actualizarCita(props.citaId, {
      fecha_cita: formulario.value.fecha_cita,
      hora_inicio: formulario.value.hora_inicio,
      hora_fin: formulario.value.hora_fin,
      modalidad: formulario.value.modalidad,
      estado: formulario.value.estado,
      observaciones: formulario.value.observaciones
    })
    
    if (resultado.success) {
      emit('actualizado')
      emit('close')
    }
  } catch (error) {
    console.error('Error al actualizar cita:', error)
  } finally {
    guardando.value = false
  }
}

const cerrar = () => {
  emit('close')
}

// Watch para cargar cuando se abre
watch(() => props.isOpen, (isOpen) => {
  console.log('👁️ [ModalEditarCita] Modal abierto:', isOpen, 'citaId:', props.citaId)
  if (isOpen && props.citaId) {
    cargarCita()
  }
})

// Watch adicional para cambios en citaId
watch(() => props.citaId, (nuevoCitaId) => {
  console.log('🔄 [ModalEditarCita] citaId cambió a:', nuevoCitaId)
  if (props.isOpen && nuevoCitaId) {
    cargarCita()
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="cerrar"
    >
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">✏️ Editar Cita</h2>
            <p v-if="cita" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ cita.paciente?.nombre_completo || cita.paciente_nombre }}
            </p>
          </div>
          <button
            @click="cerrar"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Cerrar"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="p-12 flex flex-col items-center justify-center">
          <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>

        <!-- Formulario -->
        <form v-else-if="cita" @submit.prevent="guardar" class="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div class="space-y-6">
            
            <!-- Fecha -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📅 Fecha
              </label>
              <div class="space-y-2">
                <input
                  v-model="formulario.fecha_cita"
                  type="date"
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white cursor-pointer"
                />
                
                <!-- Accesos rápidos de fecha -->
                <div class="flex gap-2 flex-wrap">
                  <button
                    v-for="(opcion, index) in opcionesFechaRapida"
                    :key="index"
                    type="button"
                    @click="formulario.fecha_cita = opcion.fecha"
                    :class="[
                      'text-xs px-3 py-1.5 rounded-lg border transition-all',
                      formulario.fecha_cita === opcion.fecha
                        ? 'bg-purple-600 text-white border-purple-600 font-semibold'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    ]"
                  >
                    {{ opcion.label }}
                  </button>
                </div>
                
                <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {{ fechaFormateada }}
                </p>
              </div>
            </div>

            <!-- Hora y Duración -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🕐 Hora Inicio
                </label>
                <div class="space-y-3">
                  <!-- Grid de horas -->
                  <div class="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button
                      v-for="hora in horasDisponibles"
                      :key="hora"
                      type="button"
                      @click="formulario.hora_inicio = hora"
                      :class="[
                        'px-3 py-2 text-sm font-medium rounded-lg transition-all border-2',
                        formulario.hora_inicio === hora
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md transform scale-105'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow'
                      ]"
                    >
                      {{ hora }}
                    </button>
                  </div>
                  
                  <!-- Input manual alternativo -->
                  <details class="text-xs">
                    <summary class="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 select-none flex items-center gap-1">
                      <span>⌨️</span>
                      <span>Ingresar hora manualmente</span>
                    </summary>
                    <div class="mt-2">
                      <input
                        v-model="formulario.hora_inicio"
                        type="time"
                        required
                        step="1800"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </details>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ⏱️ Duración (min)
                </label>
                <select
                  v-model="formulario.duracion"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                >
                  <option :value="30">30 min</option>
                  <option :value="45">45 min</option>
                  <option :value="60">60 min</option>
                  <option :value="90">90 min</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🕑 Hora Fin
                </label>
                <input
                  v-model="formulario.hora_fin"
                  type="time"
                  required
                  readonly
                  step="1800"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <!-- Alerta de conflicto -->
            <div v-if="conflictoHorario" class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg">
              <div class="flex items-start gap-3">
                <span class="text-2xl">⚠️</span>
                <div>
                  <div class="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    Conflicto de Horario
                  </div>
                  <div class="text-sm text-yellow-700 dark:text-yellow-400">
                    Ya existe otra cita en este horario. Por favor, selecciona otro horario.
                  </div>
                </div>
              </div>
            </div>

            <!-- Modalidad -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                💻 Modalidad
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="tipo in [
                    { valor: 'presencial', icono: '🏥', nombre: 'Presencial' },
                    { valor: 'online', icono: '💻', nombre: 'Online' },
                    { valor: 'telefonica', icono: '📞', nombre: 'Teléfono' }
                  ]"
                  :key="tipo.valor"
                  type="button"
                  @click="formulario.modalidad = tipo.valor as any"
                  :class="[
                    'p-3 border-2 rounded-lg transition-all',
                    formulario.modalidad === tipo.valor
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-purple-400'
                  ]"
                >
                  <div class="text-2xl mb-1">{{ tipo.icono }}</div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ tipo.nombre }}</div>
                </button>
              </div>
            </div>

            <!-- Estado -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📊 Estado
              </label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  v-for="estado in [
                    { valor: 'pendiente', icono: '⏳', nombre: 'Pendiente' },
                    { valor: 'confirmada', icono: '✅', nombre: 'Confirmada' },
                    { valor: 'realizada', icono: '✓', nombre: 'Realizada' },
                    { valor: 'cancelada', icono: '❌', nombre: 'Cancelada' }
                  ]"
                  :key="estado.valor"
                  type="button"
                  @click="formulario.estado = estado.valor as any"
                  :class="[
                    'p-2 border-2 rounded-lg transition-all',
                    formulario.estado === estado.valor
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-purple-400'
                  ]"
                >
                  <div class="text-xl mb-1">{{ estado.icono }}</div>
                  <div class="text-xs font-medium text-gray-900 dark:text-white">{{ estado.nombre }}</div>
                </button>
              </div>
            </div>

            <!-- Observaciones -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📝 Observaciones
              </label>
              <textarea
                v-model="formulario.observaciones"
                rows="3"
                placeholder="Notas adicionales sobre la cita..."
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
              ></textarea>
            </div>

          </div>
        </form>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-3 bg-gray-50 dark:bg-gray-800">
          <button
            @click="cerrar"
            type="button"
            class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            @click="guardar"
            :disabled="guardando || conflictoHorario"
            :class="[
              'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
              guardando || conflictoHorario
                ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            ]"
          >
            <span v-if="guardando">Guardando...</span>
            <span v-else>💾 Guardar Cambios</span>
          </button>
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
