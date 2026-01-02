<script setup lang="ts">
import {
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TicketIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  citaId: string | null
}>()

const emit = defineEmits(['close'])

// Estados
const cargando = ref(false)
const cita = ref<any>(null)
const terapeuta = ref<any>(null)
const bono = ref<any>(null)

// Composables
const supabase = useSupabaseClient()

// Cargar datos de la cita
const cargarCita = async () => {
  if (!props.citaId) return

  try {
    cargando.value = true

    const { data: citaData, error: citaError } = await supabase
      .from('citas')
      .select(`
        *,
        terapeuta:terapeutas(
          id,
          nombre_completo,
          email,
          telefono
        )
      `)
      .eq('id', props.citaId)
      .single()

    if (citaError) throw citaError
    cita.value = citaData
    terapeuta.value = citaData.terapeuta

    // Si tiene bono asignado, cargar información básica
    if (citaData.bono_id) {
      const { data: bonoData, error: bonoError } = await supabase
        .from('bonos')
        .select(`
          id,
          tipo,
          sesiones_totales,
          sesiones_restantes,
          estado
        `)
        .eq('id', citaData.bono_id)
        .single()

      if (!bonoError) {
        bono.value = bonoData
      }
    }
  } catch (error) {
    console.error('Error cargando cita:', error)
  } finally {
    cargando.value = false
  }
}

// Watch para cargar cuando cambia el citaId
watch(() => props.citaId, (newId) => {
  if (newId) {
    cargarCita()
  } else {
    cita.value = null
    terapeuta.value = null
    bono.value = null
  }
}, { immediate: true })

// Formatear fecha
const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Formatear hora
const formatearHora = (hora: string) => {
  if (!hora) return ''
  return hora.substring(0, 5)
}

// Estado de la cita
const estadoConfig = computed(() => {
  const estados: Record<string, { label: string; class: string; icon: any }> = {
    pendiente: {
      label: 'Pendiente de confirmar',
      class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: ExclamationCircleIcon
    },
    confirmada: {
      label: 'Confirmada',
      class: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: CheckCircleIcon
    },
    realizada: {
      label: 'Realizada',
      class: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircleIcon
    },
    cancelada: {
      label: 'Cancelada',
      class: 'bg-red-100 text-red-800 border-red-200',
      icon: XMarkIcon
    }
  }
  return estados[cita.value?.estado] || estados.pendiente
})

// Tipo de bono legible
const tipoBonoLabel = computed(() => {
  if (!bono.value) return ''
  const tipos: Record<string, string> = {
    'bono_4': 'Bono 4 sesiones',
    'bono_8': 'Bono 8 sesiones',
    'sesion_suelta': 'Sesion individual'
  }
  return tipos[bono.value.tipo] || bono.value.tipo
})

// Abrir sesión online
const abrirSesionOnline = () => {
  if (cita.value?.ubicacion && cita.value?.modalidad === 'online') {
    window.open(cita.value.ubicacion, '_blank')
  }
}

// Cerrar modal con Escape
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="citaId"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="emit('close')"
        />

        <!-- Modal -->
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="citaId"
            class="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#5550F2]/5 to-transparent">
              <h2 class="text-lg font-serif font-medium text-[#2D3748]">
                Detalles de la sesion
              </h2>
              <button
                @click="emit('close')"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6">
              <!-- Loading -->
              <div v-if="cargando" class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5550F2]"></div>
              </div>

              <template v-else-if="cita">
                <!-- Estado -->
                <div class="flex justify-center">
                  <span
                    :class="[
                      'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border',
                      estadoConfig.class
                    ]"
                  >
                    <component :is="estadoConfig.icon" class="w-4 h-4" />
                    {{ estadoConfig.label }}
                  </span>
                </div>

                <!-- Fecha y hora -->
                <div class="bg-[#F2F2F2] rounded-xl p-4 space-y-3">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-white rounded-lg">
                      <CalendarDaysIcon class="w-5 h-5 text-[#5550F2]" />
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 font-sans">Fecha</p>
                      <p class="text-sm font-medium text-[#2D3748] capitalize">
                        {{ formatearFecha(cita.fecha_cita) }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-white rounded-lg">
                      <ClockIcon class="w-5 h-5 text-[#5550F2]" />
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 font-sans">Horario</p>
                      <p class="text-sm font-medium text-[#2D3748]">
                        {{ formatearHora(cita.hora_inicio) }} - {{ formatearHora(cita.hora_fin) }}
                        <span class="text-gray-400 text-xs ml-1">({{ cita.duracion_min }} min)</span>
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-white rounded-lg">
                      <component
                        :is="cita.modalidad === 'online' ? VideoCameraIcon : MapPinIcon"
                        class="w-5 h-5 text-[#5550F2]"
                      />
                    </div>
                    <div class="flex-1">
                      <p class="text-xs text-gray-500 font-sans">Modalidad</p>
                      <p class="text-sm font-medium text-[#2D3748] capitalize">
                        {{ cita.modalidad }}
                      </p>
                      <p v-if="cita.ubicacion && cita.modalidad === 'presencial'" class="text-xs text-gray-500 mt-0.5">
                        {{ cita.ubicacion }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Terapeuta -->
                <div v-if="terapeuta" class="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl">
                  <div class="w-10 h-10 rounded-full bg-[#5550F2]/10 flex items-center justify-center">
                    <span class="text-[#5550F2] font-semibold text-sm">
                      {{ terapeuta.nombre_completo?.charAt(0) || 'T' }}
                    </span>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 font-sans">Tu terapeuta</p>
                    <p class="text-sm font-medium text-[#2D3748]">
                      {{ terapeuta.nombre_completo }}
                    </p>
                  </div>
                </div>

                <!-- Bono (si aplica) -->
                <div v-if="bono" class="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <div class="p-2 bg-white rounded-lg">
                    <TicketIcon class="w-5 h-5 text-amber-600" />
                  </div>
                  <div class="flex-1">
                    <p class="text-xs text-amber-600 font-sans">{{ tipoBonoLabel }}</p>
                    <p class="text-sm font-medium text-amber-800">
                      {{ bono.sesiones_restantes }} de {{ bono.sesiones_totales }} sesiones restantes
                    </p>
                  </div>
                </div>

                <!-- Observaciones (solo si hay) -->
                <div v-if="cita.observaciones" class="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <p class="text-xs text-gray-500 font-sans mb-1">Notas</p>
                  <p class="text-sm text-[#2D3748]">{{ cita.observaciones }}</p>
                </div>

                <!-- Boton para unirse (si es online y esta pendiente/confirmada) -->
                <button
                  v-if="cita.ubicacion && cita.modalidad === 'online' && ['pendiente', 'confirmada'].includes(cita.estado)"
                  @click="abrirSesionOnline"
                  class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#5550F2] text-white rounded-xl hover:bg-[#4440D0] transition-colors font-medium"
                >
                  <VideoCameraIcon class="w-5 h-5" />
                  Unirme a la sesion
                </button>
              </template>

              <!-- Error state -->
              <div v-else class="text-center py-8">
                <p class="text-gray-500">No se pudo cargar la informacion de la cita</p>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
