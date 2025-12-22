<template>
  <div
    v-if="mostrar"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="cerrarModal"
  >
    <div class="bg-[#F2F2F2] rounded-lg shadow-xl max-w-md w-full">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-[#5550F2]/30">
        <div class="flex items-center gap-3">
          <span class="text-3xl">⚠️</span>
          <h2 class="text-2xl font-serif text-[#2D3748] font-semibold">
            Eliminar Paciente
          </h2>
        </div>
      </div>

      <!-- Contenido -->
      <div class="px-6 py-6 space-y-4">
        <p class="text-[#2D3748]">
          ¿Estás seguro de que deseas eliminar a
          <strong class="font-semibold">{{ pacienteNombre }}</strong>?
        </p>

        <div class="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <p class="text-sm text-red-800 font-medium">
            Esta acción no se puede deshacer y eliminará:
          </p>
          <ul class="text-sm text-red-700 space-y-1 ml-4 list-disc">
            <li>Todos los datos personales del paciente</li>
            <li>El historial de sesiones</li>
            <li>Las notas terapéuticas</li>
            <li>Las métricas de bienestar</li>
            <li>Los bonos asociados</li>
          </ul>
        </div>

        <!-- Opción alternativa recomendada -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-800 font-medium mb-2">
            💡 Recomendación:
          </p>
          <p class="text-sm text-blue-700 mb-3">
            En lugar de eliminar, considera <strong>desactivar</strong> al paciente. 
            Esto preservará el historial para consultas futuras.
          </p>
          <button
            type="button"
            @click="desactivarPaciente"
            :disabled="procesando"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Desactivar en lugar de eliminar
          </button>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="px-6 py-4 border-t border-[#5550F2]/30 flex justify-end gap-3">
        <button
          type="button"
          @click="cerrarModal"
          :disabled="procesando"
          class="px-6 py-2 border border-[#5550F2] text-[#2D3748] rounded-lg hover:bg-[#5550F2]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="confirmarEliminacion"
          :disabled="procesando"
          class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="procesando" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ procesando ? 'Eliminando...' : 'Eliminar Definitivamente' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

const emit = defineEmits(['cerrar', 'paciente-eliminado', 'paciente-desactivado'])

const { supabase } = useSupabase()

const procesando = ref(false)
const error = ref('')

const pacienteNombre = computed(() => {
  if (!props.paciente) return ''
  return props.paciente.nombre_completo || 
         props.paciente.nombre || 
         props.paciente.email || 
         'este paciente'
})

const cerrarModal = () => {
  if (!procesando.value) {
    error.value = ''
    emit('cerrar')
  }
}

const desactivarPaciente = async () => {
  try {
    procesando.value = true
    error.value = ''

    console.log('Desactivando paciente:', props.paciente.id)

    const { error: updateError } = await supabase
      .from('pacientes')
      .update({ 
        activo: false,
        metadata: {
          ...props.paciente.metadata,
          fecha_desactivacion: new Date().toISOString()
        }
      })
      .eq('id', props.paciente.id)

    if (updateError) throw updateError

    console.log('Paciente desactivado exitosamente')
    emit('paciente-desactivado', props.paciente.id)
    emit('cerrar')

  } catch (err) {
    console.error('Error al desactivar paciente:', err)
    error.value = err.message || 'Error al desactivar el paciente.'
  } finally {
    procesando.value = false
  }
}

const confirmarEliminacion = async () => {
  try {
    procesando.value = true
    error.value = ''

    console.log('Eliminando paciente:', props.paciente.id)

    // Eliminar en orden inverso de dependencias
    // 1. Eliminar métricas de bienestar
    await supabase
      .from('metricas_bienestar')
      .delete()
      .eq('paciente_id', props.paciente.id)

    // 2. Eliminar notas terapéuticas
    await supabase
      .from('notas_terapeuticas')
      .delete()
      .eq('paciente_id', props.paciente.id)

    // 3. Eliminar recursos compartidos
    await supabase
      .from('recursos_compartidos')
      .delete()
      .eq('paciente_id', props.paciente.id)

    // 4. Eliminar mensajes
    await supabase
      .from('mensajes')
      .delete()
      .or(`remitente_id.eq.${props.paciente.id},destinatario_id.eq.${props.paciente.id}`)

    // 5. Eliminar bonos
    await supabase
      .from('bonos')
      .delete()
      .eq('paciente_id', props.paciente.id)

    // 6. Eliminar sesiones
    await supabase
      .from('sesiones')
      .delete()
      .eq('paciente_id', props.paciente.id)

    // 7. Finalmente, eliminar el paciente
    const { error: deleteError } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', props.paciente.id)

    if (deleteError) throw deleteError

    console.log('Paciente eliminado exitosamente')
    emit('paciente-eliminado', props.paciente.id)
    emit('cerrar')

  } catch (err) {
    console.error('Error al eliminar paciente:', err)
    error.value = err.message || 'Error al eliminar el paciente. Por favor, intenta nuevamente.'
  } finally {
    procesando.value = false
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
