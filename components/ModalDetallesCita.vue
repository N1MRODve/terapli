<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="cerrarModal"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm"></div>

        <!-- Modal Container -->
        <div class="flex min-h-full items-center justify-center p-4">
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="isOpen"
              class="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all"
              @click.stop
            >
              <!-- Header -->
              <div class="flex items-start justify-between mb-6">
                <div>
                  <h3 class="text-2xl font-serif font-bold text-cafe mb-1">
                    Detalles de la Sesión
                  </h3>
                  <p class="text-sm text-cafe/60">
                    Información completa de la cita
                  </p>
                </div>
                <button
                  @click="cerrarModal"
                  class="text-cafe/50 hover:text-cafe transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Contenido -->
              <div v-if="cargando" class="py-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-terracota border-t-transparent"></div>
                <p class="mt-4 text-cafe/60">Cargando detalles...</p>
              </div>

              <div v-else-if="citaDetalle" class="space-y-6">
                <!-- Información Principal -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Fecha y Hora -->
                  <div class="p-4 bg-terracota/5 rounded-xl">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xl">📅</span>
                      <span class="text-sm font-medium text-cafe/70">Fecha y Hora</span>
                    </div>
                    <p class="text-lg font-semibold text-cafe">
                      {{ formatearFecha(citaDetalle.fecha_cita) }}
                    </p>
                    <p class="text-2xl font-bold text-terracota mt-1">
                      {{ citaDetalle.hora_inicio }} - {{ citaDetalle.hora_fin }}
                    </p>
                  </div>

                  <!-- Estado -->
                  <div class="p-4 bg-terracota/5 rounded-xl">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xl">{{ obtenerIconoEstado(citaDetalle.estado) }}</span>
                      <span class="text-sm font-medium text-cafe/70">Estado</span>
                    </div>
                    <span
                      class="inline-block px-4 py-2 rounded-full text-sm font-semibold mt-2"
                      :class="obtenerEstiloEstado(citaDetalle.estado)"
                    >
                      {{ citaDetalle.estado?.toUpperCase() || 'PENDIENTE' }}
                    </span>
                    <p class="text-sm text-cafe/60 mt-2">
                      {{ obtenerDescripcionEstado(citaDetalle.estado) }}
                    </p>
                  </div>
                </div>

                <!-- Información del Paciente -->
                <div class="p-5 bg-gradient-to-br from-rosa/20 to-rosa/10 rounded-xl">
                  <div class="flex items-start justify-between flex-wrap gap-4">
                    <div class="flex items-center gap-4">
                      <div
                        class="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        :style="{ backgroundColor: '#D8AFA0' }"
                      >
                        {{ obtenerIniciales(citaDetalle.paciente_nombre) }}
                      </div>
                      <div>
                        <p class="text-xs text-cafe/60 mb-1">Paciente</p>
                        <p class="text-xl font-bold text-cafe">
                          {{ citaDetalle.paciente_nombre || 'Sin nombre' }}
                        </p>
                        <p v-if="citaDetalle.paciente_email" class="text-sm text-cafe/60 mt-1">
                          {{ citaDetalle.paciente_email }}
                        </p>
                      </div>
                    </div>
                    <NuxtLink
                      v-if="citaDetalle.paciente_id"
                      :to="`/terapeuta/pacientes/${citaDetalle.paciente_id}`"
                      class="px-3 py-1.5 text-sm bg-white border border-terracota/30 text-terracota hover:bg-terracota hover:text-white rounded-lg transition-colors"
                    >
                      Ver perfil
                    </NuxtLink>
                  </div>
                </div>

                <!-- Modalidad y Tipo -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="p-4 bg-base-bg rounded-xl">
                    <p class="text-sm text-cafe/60 mb-2">Modalidad</p>
                    <div class="flex items-center gap-2">
                      <span class="text-2xl">{{ obtenerIconoModalidad(citaDetalle.modalidad) }}</span>
                      <span class="text-lg font-semibold text-cafe capitalize">
                        {{ citaDetalle.modalidad || 'No especificada' }}
                      </span>
                    </div>
                  </div>

                  <div class="p-4 bg-base-bg rounded-xl">
                    <p class="text-sm text-cafe/60 mb-2">Tipo de Sesión</p>
                    <div class="flex items-center gap-2">
                      <span class="text-2xl">{{ obtenerIconoTipo(citaDetalle.tipo) }}</span>
                      <span class="text-lg font-semibold text-cafe capitalize">
                        {{ citaDetalle.tipo || 'Primera sesión' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Información del Bono -->
                <div v-if="infoBono" class="p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl">
                  <div class="flex items-center gap-2 mb-4">
                    <span class="text-2xl">🎫</span>
                    <h4 class="font-semibold text-cafe">Información del Bono</h4>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p class="text-sm text-cafe/60 mb-1">Tipo de Bono</p>
                      <p class="text-lg font-semibold text-cafe">
                        {{ infoBono.tipo }}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-cafe/60 mb-1">Sesiones Disponibles</p>
                      <p class="text-lg font-semibold text-green-600">
                        {{ infoBono.sesiones_disponibles }} de {{ infoBono.sesiones_totales }}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-cafe/60 mb-1">Frecuencia</p>
                      <p class="text-lg font-semibold text-cafe">
                        {{ infoBono.frecuencia || 'Semanal' }}
                      </p>
                    </div>
                  </div>

                  <!-- Barra de progreso -->
                  <div class="mt-4">
                    <div class="flex justify-between text-xs text-cafe/60 mb-2">
                      <span>Progreso del bono</span>
                      <span>{{ Math.round((infoBono.sesiones_usadas / infoBono.sesiones_totales) * 100) }}%</span>
                    </div>
                    <div class="w-full bg-white rounded-full h-2.5">
                      <div
                        class="h-2.5 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                        :style="{ width: `${(infoBono.sesiones_usadas / infoBono.sesiones_totales) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- Próximas Sesiones del Paciente -->
                <div v-if="proximasSesiones.length > 0" class="p-5 bg-terracota/5 rounded-xl">
                  <div class="flex items-center gap-2 mb-4">
                    <span class="text-2xl">📋</span>
                    <h4 class="font-semibold text-cafe">Próximas Sesiones Agendadas</h4>
                  </div>
                  
                  <div class="space-y-3">
                    <div
                      v-for="sesion in proximasSesiones"
                      :key="sesion.id"
                      class="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <div class="flex items-center gap-3">
                        <span class="text-lg">📅</span>
                        <div>
                          <p class="font-medium text-cafe">
                            {{ formatearFecha(sesion.fecha_cita) }}
                          </p>
                          <p class="text-sm text-cafe/60">
                            {{ sesion.hora_inicio }} - {{ sesion.hora_fin }}
                          </p>
                        </div>
                      </div>
                      <span
                        class="px-3 py-1 rounded-full text-xs font-medium"
                        :class="obtenerEstiloEstadoMini(sesion.estado)"
                      >
                        {{ sesion.estado }}
                      </span>
                    </div>
                  </div>
                </div>

                <div v-else class="p-5 bg-terracota/5 rounded-xl">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">📋</span>
                    <h4 class="font-semibold text-cafe">Próximas Sesiones Agendadas</h4>
                  </div>
                  <p class="text-sm text-cafe/60 text-center py-4">
                    No hay próximas sesiones agendadas
                  </p>
                </div>

                <!-- Observaciones -->
                <div v-if="citaDetalle.observaciones" class="p-4 bg-base-bg rounded-xl">
                  <p class="text-sm text-cafe/60 mb-2">Observaciones</p>
                  <p class="text-cafe">{{ citaDetalle.observaciones }}</p>
                </div>
              </div>

              <!-- Footer Actions -->
              <div class="mt-6 pt-6 border-t flex justify-end gap-3">
                <button
                  @click="cerrarModal"
                  class="px-4 py-2 border border-cafe/20 text-cafe rounded-lg hover:bg-cafe/5 transition-colors"
                >
                  Cerrar
                </button>
                <NuxtLink
                  v-if="citaDetalle"
                  :to="`/terapeuta/agenda?fecha=${citaDetalle.fecha_cita}`"
                  class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors"
                  @click="cerrarModal"
                >
                  Ver en Agenda
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useCitas } from '~/composables/useCitas'

interface Props {
  isOpen: boolean
  citaId: string | number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

// Composables
const { getCitas } = useCitas()
const supabase = useSupabaseClient()

// Estado
const cargando = ref(false)
const citaDetalle = ref<any>(null)
const infoBono = ref<any>(null)
const proximasSesiones = ref<any[]>([])

// Funciones
const cerrarModal = () => {
  emit('close')
}

const cargarDetalles = async () => {
  if (!props.citaId) return

  cargando.value = true
  try {
    // Obtener todas las citas y encontrar la específica
    const todasLasCitas = await getCitas()
    const cita = todasLasCitas.find((c: any) => c.id === props.citaId)
    
    if (!cita) {
      console.error('Cita no encontrada')
      return
    }

    citaDetalle.value = {
      ...cita,
      paciente_nombre: cita.paciente_nombre || cita.pacientes?.metadata?.nombre_completo || 'Sin nombre',
      paciente_email: cita.pacientes?.email || ''
    }

    // Cargar información del bono y próximas sesiones
    if (cita.paciente_id) {
      await cargarInfoBono(cita.paciente_id)
      await cargarProximasSesiones(cita.paciente_id, cita.id)
    }
  } catch (error) {
    console.error('Error al cargar detalles de la cita:', error)
  } finally {
    cargando.value = false
  }
}

const cargarInfoBono = async (pacienteId: string) => {
  try {
    const { data: bonos, error } = await supabase
      .from('bonos')
      .select('*')
      .eq('paciente_id', pacienteId)
      .eq('estado', 'activo')
      .maybeSingle()

    if (error) {
      console.warn('[Bonos] Error en consulta:', error.message)
      infoBono.value = null
      return
    }

    if (!bonos) {
      infoBono.value = null
      return
    }

    // Calcular sesiones disponibles
    const { data: sesionesRealizadas } = await supabase
      .from('sesiones')
      .select('id')
      .eq('paciente_id', pacienteId)
      .eq('estado', 'completada')

    const sesionesUsadas = sesionesRealizadas?.length || bonos.sesiones_usadas || 0
    const sesionesDisponibles = bonos.sesiones_totales - sesionesUsadas

    infoBono.value = {
      tipo: `${bonos.sesiones_totales} sesiones`,
      sesiones_totales: bonos.sesiones_totales,
      sesiones_usadas: sesionesUsadas,
      sesiones_disponibles: sesionesDisponibles,
      frecuencia: 'Semanal'
    }
  } catch (error) {
    console.error('Error al cargar información del bono:', error)
    infoBono.value = null
  }
}

const cargarProximasSesiones = async (pacienteId: string, citaActualId: string) => {
  try {
    const todasLasCitas = await getCitas()
    
    const hoy = new Date()
    proximasSesiones.value = todasLasCitas
      .filter((c: any) => 
        c.paciente_id === pacienteId &&
        c.id !== citaActualId &&
        ['pendiente', 'confirmada'].includes(c.estado) &&
        new Date(c.fecha_cita) >= hoy
      )
      .sort((a: any, b: any) => {
        const fechaA = new Date(`${a.fecha_cita}T${a.hora_inicio}`)
        const fechaB = new Date(`${b.fecha_cita}T${b.hora_inicio}`)
        return fechaA.getTime() - fechaB.getTime()
      })
      .slice(0, 5)
  } catch (error) {
    console.error('Error al cargar próximas sesiones:', error)
    proximasSesiones.value = []
  }
}

// Helpers
const formatearFecha = (fecha: string) => {
  try {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return fecha
  }
}

const obtenerIniciales = (nombre: string) => {
  if (!nombre) return '?'
  const partes = nombre.split(' ')
  if (partes.length >= 2 && partes[0] && partes[1]) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
}

const obtenerIconoEstado = (estado: string) => {
  const iconos: Record<string, string> = {
    'pendiente': '⏳',
    'confirmada': '✅',
    'realizada': '✔️',
    'cancelada': '❌'
  }
  return iconos[estado] || '📌'
}

const obtenerEstiloEstado = (estado: string) => {
  const estilos: Record<string, string> = {
    'pendiente': 'bg-yellow-100 text-yellow-700',
    'confirmada': 'bg-green-100 text-green-700',
    'realizada': 'bg-blue-100 text-blue-700',
    'cancelada': 'bg-red-100 text-red-700'
  }
  return estilos[estado] || 'bg-gray-100 text-gray-700'
}

const obtenerEstiloEstadoMini = (estado: string) => {
  const estilos: Record<string, string> = {
    'pendiente': 'bg-yellow-50 text-yellow-700',
    'confirmada': 'bg-green-50 text-green-700',
    'realizada': 'bg-blue-50 text-blue-700',
    'cancelada': 'bg-red-50 text-red-700'
  }
  return estilos[estado] || 'bg-gray-50 text-gray-700'
}

const obtenerDescripcionEstado = (estado: string) => {
  const descripciones: Record<string, string> = {
    'pendiente': 'Esta sesión está pendiente de confirmación',
    'confirmada': 'El paciente ha confirmado asistencia',
    'realizada': 'La sesión ya fue completada',
    'cancelada': 'Esta sesión fue cancelada'
  }
  return descripciones[estado] || 'Sin descripción'
}

const obtenerIconoModalidad = (modalidad: string) => {
  const iconos: Record<string, string> = {
    'presencial': '🏥',
    'online': '💻',
    'telefonica': '📞'
  }
  return iconos[modalidad] || '📋'
}

const obtenerIconoTipo = (tipo: string) => {
  const iconos: Record<string, string> = {
    'primera-sesion': '🌟',
    'seguimiento': '🔄',
    'evaluacion': '📊'
  }
  return iconos[tipo] || '💬'
}

// Watchers
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.citaId) {
    cargarDetalles()
  }
})
</script>
