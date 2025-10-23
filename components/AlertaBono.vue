<template>
  <Transition name="alerta">
    <div
      v-if="visible"
      class="fixed top-20 right-6 z-50 max-w-md"
      role="alert"
    >
      <div
        :class="[
          'p-4 rounded-lg shadow-lg border-2',
          sesionesRestantes === 0 
            ? 'bg-green-50 border-green-400' 
            : 'bg-amber-50 border-amber-400'
        ]"
      >
        <div class="flex items-start gap-3">
          <!-- Icono -->
          <div class="flex-shrink-0 text-2xl">
            {{ sesionesRestantes === 0 ? '🎉' : '⚠️' }}
          </div>
          
          <!-- Contenido -->
          <div class="flex-1">
            <h3 
              :class="[
                'font-bold mb-1',
                sesionesRestantes === 0 ? 'text-green-800' : 'text-amber-800'
              ]"
            >
              {{ titulo }}
            </h3>
            <p 
              :class="[
                'text-sm mb-3',
                sesionesRestantes === 0 ? 'text-green-700' : 'text-amber-700'
              ]"
            >
              {{ mensaje }}
            </p>
            
            <!-- Información del paciente -->
            <div 
              :class="[
                'text-sm p-2 rounded mb-3',
                sesionesRestantes === 0 ? 'bg-green-100' : 'bg-amber-100'
              ]"
            >
              <div class="font-medium mb-1">{{ pacienteNombre }}</div>
              <div 
                :class="[
                  'text-xs',
                  sesionesRestantes === 0 ? 'text-green-600' : 'text-amber-600'
                ]"
              >
                Sesiones restantes: 
                <span class="font-bold">{{ sesionesRestantes }}</span>
              </div>
            </div>
            
            <!-- Acciones -->
            <div class="flex gap-2">
              <button
                v-if="sesionesRestantes === 1"
                @click="notificarPaciente"
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                  'bg-amber-600 text-white hover:bg-amber-700'
                ]"
              >
                📱 Notificar al paciente
              </button>
              <button
                @click="cerrar"
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                  sesionesRestantes === 0 
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                ]"
              >
                Entendido
              </button>
            </div>
          </div>
          
          <!-- Botón cerrar -->
          <button
            @click="cerrar"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  mostrar: boolean
  sesionesRestantes: number
  pacienteNombre: string
  pacienteId: string
}

const props = defineProps<Props>()
const emit = defineEmits(['cerrar', 'notificar'])

const visible = ref(false)

// Computados
const titulo = computed(() => {
  if (props.sesionesRestantes === 0) {
    return '¡Última sesión completada!'
  }
  return props.sesionesRestantes === 1 
    ? '⚠️ Última sesión disponible' 
    : 'Pocas sesiones restantes'
})

const mensaje = computed(() => {
  if (props.sesionesRestantes === 0) {
    return 'El bono se ha completado exitosamente. El paciente necesitará adquirir un nuevo bono para continuar.'
  }
  return props.sesionesRestantes === 1
    ? 'Al paciente le queda 1 sesión en su bono. Considere informarle para que pueda renovar su bono antes de la siguiente cita.'
    : `Al paciente le quedan ${props.sesionesRestantes} sesiones. Es un buen momento para recordarle renovar su bono.`
})

// Watch para mostrar/ocultar con transición
watch(() => props.mostrar, (nuevoValor) => {
  if (nuevoValor) {
    visible.value = true
    // Auto-cerrar después de 10 segundos
    setTimeout(() => {
      if (visible.value) {
        cerrar()
      }
    }, 10000)
  } else {
    visible.value = false
  }
}, { immediate: true })

// Métodos
function cerrar() {
  visible.value = false
  setTimeout(() => {
    emit('cerrar')
  }, 300) // Esperar a que termine la transición
}

function notificarPaciente() {
  emit('notificar', props.pacienteId)
  cerrar()
}
</script>

<style scoped>
.alerta-enter-active,
.alerta-leave-active {
  transition: all 0.3s ease;
}

.alerta-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.alerta-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
