<template>
  <div>
    <NuxtLayout name="coordinacion">
      <div class="mb-8">
        <h1 class="text-3xl font-lora font-bold text-[#5D4A44] mb-2">
          Mensajería
        </h1>
        <p class="text-[#8B7470]">
          Comunicación con pacientes y terapeutas
        </p>
      </div>

      <!-- Selector de paciente -->
      <div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6 mb-6">
        <label class="block text-sm font-medium text-[#5D4A44] mb-3">
          Seleccionar paciente
        </label>
        <select
          v-model="pacienteSeleccionado"
          class="w-full px-4 py-3 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent"
        >
          <option value="">-- Selecciona un paciente --</option>
          <option v-for="paciente in pacientes" :key="paciente.id" :value="paciente">
            {{ paciente.nombre_completo }}
          </option>
        </select>
      </div>

      <!-- Área de mensaje -->
      <div v-if="pacienteSeleccionado" class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6">
        <div class="mb-4 flex items-center space-x-3">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] flex items-center justify-center">
            <span class="text-white font-semibold">
              {{ obtenerIniciales(pacienteSeleccionado.nombre_completo) }}
            </span>
          </div>
          <div>
            <p class="font-semibold text-[#5D4A44]">{{ pacienteSeleccionado.nombre_completo }}</p>
            <p class="text-sm text-[#8B7470]">{{ pacienteSeleccionado.telefono }}</p>
          </div>
        </div>

        <textarea
          v-model="mensaje"
          placeholder="Escribe tu mensaje aquí..."
          rows="5"
          class="w-full px-4 py-3 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent resize-none mb-4"
        ></textarea>

        <div class="flex space-x-3">
          <button
            @click="enviarMensajeInterno"
            :disabled="!mensaje.trim()"
            class="flex-1 px-6 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C49484] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Icon name="heroicons:paper-airplane" class="w-5 h-5" />
            <span>Enviar mensaje interno</span>
          </button>

          <button
            @click="abrirWhatsApp"
            :disabled="!mensaje.trim()"
            class="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Icon name="heroicons:chat-bubble-oval-left-ellipsis" class="w-5 h-5" />
            <span>Abrir WhatsApp</span>
          </button>
        </div>
      </div>

      <!-- Sin paciente seleccionado -->
      <div v-else class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-12 text-center">
        <Icon name="heroicons:chat-bubble-left-right" class="w-20 h-20 mx-auto text-[#D8AFA0] opacity-30 mb-4" />
        <p class="text-[#8B7470]">Selecciona un paciente para comenzar</p>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { getUserId } = useSupabase()

const pacientes = ref<any[]>([])
const pacienteSeleccionado = ref<any>(null)
const mensaje = ref('')

const obtenerIniciales = (nombre: string) => {
  return nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

const enviarMensajeInterno = async () => {
  if (!mensaje.value.trim() || !pacienteSeleccionado.value) return

  try {
    const userId = getUserId()
    if (!userId) {
      alert('❌ No estás autenticado')
      return
    }
    
    const { error } = await supabase
      .from('mensajes' as any)
      .insert({
        remitente_id: userId,
        destinatario_id: pacienteSeleccionado.value.id,
        mensaje: mensaje.value,
        visto: false
      })

    if (error) throw error

    alert('✅ Mensaje enviado exitosamente')
    mensaje.value = ''
  } catch (error) {
    console.error('Error:', error)
    alert('❌ Error al enviar mensaje')
  }
}

const abrirWhatsApp = () => {
  if (!mensaje.value.trim() || !pacienteSeleccionado.value.telefono) return
  
  const numero = pacienteSeleccionado.value.telefono.replace(/\D/g, '')
  const texto = encodeURIComponent(mensaje.value)
  window.open(`https://wa.me/${numero}?text=${texto}`, '_blank')
}

const cargarPacientes = async () => {
  try {
    const { data, error } = await supabase
      .from('pacientes' as any)
      .select('id, nombre_completo, telefono, email')
      .order('nombre_completo')

    if (error) throw error
    if (data) pacientes.value = data
  } catch (error) {
    console.error('Error al cargar pacientes:', error)
  }
}

onMounted(() => {
  cargarPacientes()
})
</script>
