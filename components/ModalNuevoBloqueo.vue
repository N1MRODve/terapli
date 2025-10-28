<template>
  <Transition name="modal">
    <div
      v-if="mostrar"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="cerrar"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-gradient-to-r from-[#D8AFA0] to-[#E8BFA0] text-white p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-serif font-bold">
                {{ titulo }}
              </h2>
              <p class="text-sm opacity-90 mt-1">
                Reserva tiempo en tu agenda
              </p>
            </div>
            <button
              @click="cerrar"
              class="text-white/80 hover:text-white transition-colors p-2"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6">
          <!-- Fecha -->
          <div>
            <label class="block text-sm font-medium text-[#5D4A44] mb-2">
              Fecha <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formulario.fecha"
              type="date"
              required
              :min="fechaMinima"
              class="w-full px-4 py-3 border-2 border-[#EAD5D3] rounded-lg focus:border-[#D8AFA0] focus:ring-2 focus:ring-[#D8AFA0]/20 outline-none transition-all"
            />
          </div>

          <!-- Horarios -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[#5D4A44] mb-2">
                Hora Inicio <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formulario.hora_inicio"
                type="time"
                required
                step="1800"
                class="w-full px-4 py-3 border-2 border-[#EAD5D3] rounded-lg focus:border-[#D8AFA0] focus:ring-2 focus:ring-[#D8AFA0]/20 outline-none transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-[#5D4A44] mb-2">
                Hora Fin <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formulario.hora_fin"
                type="time"
                required
                step="1800"
                class="w-full px-4 py-3 border-2 border-[#EAD5D3] rounded-lg focus:border-[#D8AFA0] focus:ring-2 focus:ring-[#D8AFA0]/20 outline-none transition-all"
              />
            </div>
          </div>

          <!-- Tipo de bloqueo -->
          <div>
            <label class="block text-sm font-medium text-[#5D4A44] mb-3">
              Tipo de bloqueo <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="tipo in tiposBloqueo"
                :key="tipo.valor"
                type="button"
                @click="formulario.tipo = tipo.valor"
                :class="[
                  'p-4 rounded-lg border-2 transition-all text-center',
                  formulario.tipo === tipo.valor
                    ? 'border-[#D8AFA0] bg-[#D8AFA0]/10 text-[#5D4A44] font-semibold'
                    : 'border-[#EAD5D3] hover:border-[#D8AFA0]/50'
                ]"
              >
                <div class="text-3xl mb-2">{{ tipo.icono }}</div>
                <div class="text-sm">{{ tipo.nombre }}</div>
              </button>
            </div>
          </div>

          <!-- Motivo -->
          <div>
            <label class="block text-sm font-medium text-[#5D4A44] mb-2">
              Motivo (opcional)
            </label>
            <textarea
              v-model="formulario.motivo"
              rows="3"
              placeholder="Ej: Almuerzo, Reunión, Día personal..."
              class="w-full px-4 py-3 border-2 border-[#EAD5D3] rounded-lg focus:border-[#D8AFA0] focus:ring-2 focus:ring-[#D8AFA0]/20 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <!-- Advertencia de conflictos -->
          <div
            v-if="conflictoDetectado"
            class="p-4 bg-red-50 border-2 border-red-200 rounded-lg"
          >
            <div class="flex items-start gap-3">
              <span class="text-2xl">⚠️</span>
              <div class="flex-1">
                <p class="font-semibold text-red-800 mb-1">
                  Conflicto de horario detectado
                </p>
                <p class="text-sm text-red-700">
                  Ya existe una cita en este horario. Debes cancelarla primero para crear este bloqueo.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            type="button"
            @click="cerrar"
            class="flex-1 px-6 py-3 border-2 border-[#EAD5D3] text-[#5D4A44] rounded-lg hover:bg-white transition-all font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="guardar"
            :disabled="!formularioValido || guardando"
            :class="[
              'flex-1 px-6 py-3 rounded-lg font-medium transition-all',
              formularioValido && !guardando
                ? 'bg-[#D8AFA0] text-white hover:bg-[#C89F90] shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            <span v-if="guardando">Guardando...</span>
            <span v-else>Crear Bloqueo</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCitas } from '~/composables/useCitas'

interface Props {
  mostrar: boolean
  fechaPreseleccionada?: string
  horaPreseleccionada?: string
  titulo?: string
}

const props = withDefaults(defineProps<Props>(), {
  fechaPreseleccionada: '',
  horaPreseleccionada: '',
  titulo: 'Nuevo Bloqueo'
})

const emit = defineEmits(['cerrar', 'bloqueoCreado'])

// Composables
const { crearBloqueo, getCitasPorDia } = useCitas()

// Estado
const guardando = ref(false)
const conflictoDetectado = ref(false)

const formulario = ref({
  fecha: props.fechaPreseleccionada || formatearFecha(new Date()),
  hora_inicio: props.horaPreseleccionada || '',
  hora_fin: '',
  tipo: 'personal' as 'personal' | 'vacaciones' | 'otro',
  motivo: ''
})

const tiposBloqueo = [
  { valor: 'personal' as const, nombre: 'Personal', icono: '👤' },
  { valor: 'vacaciones' as const, nombre: 'Vacaciones', icono: '🏖️' },
  { valor: 'otro' as const, nombre: 'Otro', icono: '📌' }
]

// Computed
const fechaMinima = computed(() => {
  return formatearFecha(new Date())
})

const formularioValido = computed(() => {
  return (
    formulario.value.fecha &&
    formulario.value.hora_inicio &&
    formulario.value.hora_fin &&
    formulario.value.hora_inicio < formulario.value.hora_fin &&
    formulario.value.tipo
  )
})

// Watchers
watch(() => [formulario.value.fecha, formulario.value.hora_inicio, formulario.value.hora_fin], async () => {
  if (formularioValido.value) {
    await verificarConflictos()
  }
}, { deep: true })

watch(() => props.mostrar, (nuevo) => {
  if (nuevo) {
    resetFormulario()
  }
})

// Métodos
async function verificarConflictos() {
  if (!formulario.value.fecha || !formulario.value.hora_inicio || !formulario.value.hora_fin) {
    conflictoDetectado.value = false
    return
  }

  const citas = await getCitasPorDia(formulario.value.fecha)
  
  const hayConflicto = citas.some(cita => {
    if (cita.estado === 'cancelada') return false
    return horariosSeSuperponen(
      cita.hora_inicio,
      cita.hora_fin,
      formulario.value.hora_inicio,
      formulario.value.hora_fin
    )
  })

  conflictoDetectado.value = hayConflicto
}

function horariosSeSuperponen(inicio1: string, fin1: string, inicio2: string, fin2: string): boolean {
  return inicio1 < fin2 && inicio2 < fin1
}

async function guardar() {
  if (!formularioValido.value || conflictoDetectado.value) return

  guardando.value = true

  try {
    const resultado = await crearBloqueo({
      fecha: formulario.value.fecha,
      hora_inicio: formulario.value.hora_inicio,
      hora_fin: formulario.value.hora_fin,
      tipo: formulario.value.tipo,
      motivo: formulario.value.motivo || undefined
    })

    if (resultado.success) {
      emit('bloqueoCreado')
      cerrar()
    } else if (resultado.error) {
      alert(resultado.error)
    }
  } catch (error) {
    console.error('Error al crear bloqueo:', error)
    alert('Error al crear el bloqueo')
  } finally {
    guardando.value = false
  }
}

function cerrar() {
  if (!guardando.value) {
    emit('cerrar')
  }
}

function resetFormulario() {
  formulario.value = {
    fecha: props.fechaPreseleccionada || formatearFecha(new Date()),
    hora_inicio: props.horaPreseleccionada || '',
    hora_fin: '',
    tipo: 'personal',
    motivo: ''
  }
  conflictoDetectado.value = false
}

function formatearFecha(fecha: Date): string {
  const resultado = fecha.toISOString().split('T')[0]
  return resultado || ''
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
