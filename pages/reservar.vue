<template>
  <div class="section-padding">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-4xl font-serif mb-6">Reserva tu orientación gratuita</h1>
      <p class="text-lg text-cafe/80 mb-8 leading-relaxed">
        Completa el formulario y agenda tu videollamada de 20 minutos sin compromiso.
      </p>

      <form @submit.prevent="handleReserva" class="space-y-6">
        <div>
          <label class="block text-cafe font-semibold mb-2">Nombre completo</label>
          <input v-model="form.nombre" type="text" required
            class="w-full px-4 py-3 border border-rosa rounded-lg focus:outline-none focus:border-terracota">
        </div>

        <div>
          <label class="block text-cafe font-semibold mb-2">Email</label>
          <input v-model="form.email" type="email" required
            class="w-full px-4 py-3 border border-rosa rounded-lg focus:outline-none focus:border-terracota">
        </div>

        <div>
          <label class="block text-cafe font-semibold mb-2">Teléfono</label>
          <input v-model="form.telefono" type="tel" required
            class="w-full px-4 py-3 border border-rosa rounded-lg focus:outline-none focus:border-terracota">
        </div>

        <div>
          <label class="block text-cafe font-semibold mb-2">¿Qué te gustaría trabajar?</label>
          <textarea v-model="form.notas" rows="4" required
            class="w-full px-4 py-3 border border-rosa rounded-lg focus:outline-none focus:border-terracota"
            placeholder="Cuéntame brevemente qué te trae a terapia..."></textarea>
        </div>

        <button type="submit" :disabled="loading"
          class="w-full bg-terracota text-white py-3 rounded-full hover:bg-cafe transition disabled:opacity-50">
          {{ loading ? 'Enviando...' : 'Solicitar orientación gratuita' }}
        </button>

        <p v-if="mensaje" :class="error ? 'text-red-600' : 'text-green-600'" class="text-center">{{ mensaje }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const supabase = useSupabaseClient()

const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  notas: ''
})

const loading = ref(false)
const mensaje = ref('')
const error = ref(false)

const handleReserva = async () => {
  loading.value = true
  mensaje.value = ''
  error.value = false

  try {
    const { data, error: dbError } = await supabase
      .from('pacientes')
      .insert([{
        nombre: form.value.nombre,
        email: form.value.email,
        telefono: form.value.telefono,
        notas_iniciales: form.value.notas
      }])

    if (dbError) throw dbError

    mensaje.value = '¡Solicitud recibida! Te contactaré pronto para coordinar la orientación.'
    form.value = { nombre: '', email: '', telefono: '', notas: '' }
  } catch (e) {
    error.value = true
    mensaje.value = 'Error al enviar la solicitud. Inténtalo de nuevo o escríbeme directamente.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Reservar - Karem Peña',
  meta: [{ name: 'description', content: 'Agenda tu orientación gratuita de 20 minutos sin compromiso.' }]
})
</script>
