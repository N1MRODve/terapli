<template>
  <div class="section-padding">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-4xl font-serif mb-6">Contacto</h1>
      <p class="text-lg text-cafe/80 mb-8 leading-relaxed">
        ¿Tienes alguna pregunta? Escríbeme y te responderé lo antes posible.
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-cafe font-semibold mb-2">Nombre</label>
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
          <input v-model="form.telefono" type="tel"
            class="w-full px-4 py-3 border border-rosa rounded-lg focus:outline-none focus:border-terracota">
        </div>

        <div>
          <label class="block text-cafe font-semibold mb-2">Mensaje</label>
          <textarea v-model="form.mensaje" rows="5" required
            class="w-full px-4 py-3 border border-rosa rounded-lg focus:outline-none focus:border-terracota"></textarea>
        </div>

        <button type="submit" :disabled="loading"
          class="w-full bg-terracota text-white py-3 rounded-full hover:bg-cafe transition disabled:opacity-50">
          {{ loading ? 'Enviando...' : 'Enviar mensaje' }}
        </button>

        <p v-if="mensaje" :class="error ? 'text-red-600' : 'text-green-600'" class="text-center">{{ mensaje }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  mensaje: ''
})

const loading = ref(false)
const mensaje = ref('')
const error = ref(false)

const handleSubmit = async () => {
  loading.value = true
  mensaje.value = ''
  error.value = false

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    mensaje.value = 'Mensaje enviado correctamente. Te responderé pronto.'
    form.value = { nombre: '', email: '', telefono: '', mensaje: '' }
  } catch (e) {
    error.value = true
    mensaje.value = 'Error al enviar el mensaje. Inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Contacto - Karem Peña',
  meta: [{ name: 'description', content: 'Contacta conmigo para resolver tus dudas o agendar una sesión.' }]
})
</script>
