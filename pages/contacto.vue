<template>
  <div class="min-h-screen bg-fondo">
    <!-- Hero Section -->
    <section class="pt-24 pb-16 px-4">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h1 class="font-serif text-4xl md:text-5xl font-bold text-cafe mb-4">
            Contacto
          </h1>
          <p class="text-lg text-cafe/70 max-w-2xl mx-auto">
            ¿Tienes preguntas? Estoy aquí para acompañarte en tu proceso. Contáctame y juntos encontraremos el mejor camino.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <!-- Información de Contacto -->
          <div class="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 class="font-serif text-2xl font-semibold text-cafe mb-6">
              Información de Contacto
            </h2>

            <!-- Email -->
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-purple-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-cafe mb-1">Email</h3>
                <a href="mailto:karemeyde@gmail.com" class="text-purple-600 hover:text-purple-600/80 transition-colors">
                  karemeyde@gmail.com
                </a>
              </div>
            </div>

            <!-- WhatsApp -->
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-purple-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-cafe mb-1">WhatsApp</h3>
                <p class="text-cafe/70">
                  Escríbeme para agendar tu cita o resolver dudas
                </p>
              </div>
            </div>

            <!-- Horario de Atención -->
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-purple-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-cafe mb-1">Horario de Atención</h3>
                <p class="text-cafe/70">
                  Lunes a Viernes: 9:00 AM - 7:00 PM<br>
                  Sábados: 10:00 AM - 2:00 PM
                </p>
              </div>
            </div>

            <!-- Ubicación -->
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-purple-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-cafe mb-1">Sesiones</h3>
                <p class="text-cafe/70">
                  Sesiones presenciales y online<br>
                  <span class="text-sm">Adaptadas a tus necesidades</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Formulario de Contacto -->
          <div class="bg-white rounded-2xl shadow-lg p-8">
            <h2 class="font-serif text-2xl font-semibold text-cafe mb-6">
              Envíame un Mensaje
            </h2>

            <form @submit.prevent="enviarMensaje" class="space-y-4">
              <div>
                <label for="nombre" class="block text-sm font-medium text-cafe mb-2">
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  v-model="form.nombre"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
                  placeholder="Tu nombre"
                >
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-cafe mb-2">
                  Email
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                >
              </div>

              <div>
                <label for="telefono" class="block text-sm font-medium text-cafe mb-2">
                  Teléfono (opcional)
                </label>
                <input
                  id="telefono"
                  v-model="form.telefono"
                  type="tel"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
                  placeholder="+34 600 000 000"
                >
              </div>

              <div>
                <label for="mensaje" class="block text-sm font-medium text-cafe mb-2">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  v-model="form.mensaje"
                  required
                  rows="5"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all resize-none"
                  placeholder="Cuéntame en qué puedo ayudarte..."
                ></textarea>
              </div>

              <button
                type="submit"
                :disabled="enviando"
                class="w-full py-3 bg-purple-600 hover:bg-purple-600/90 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ enviando ? 'Enviando...' : 'Enviar Mensaje' }}
              </button>

              <p v-if="mensajeEnviado" class="text-sm text-green-600 text-center">
                ✅ Mensaje enviado correctamente. Te responderé pronto.
              </p>

              <p v-if="error" class="text-sm text-red-600 text-center">
                ❌ {{ error }}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 px-4 bg-white">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="font-serif text-3xl font-semibold text-cafe mb-4">
          ¿Lista para comenzar tu proceso?
        </h2>
        <p class="text-cafe/70 mb-8 max-w-2xl mx-auto">
          El primer paso siempre es el más importante. Agenda tu primera sesión y comencemos juntas este camino de autoconocimiento y crecimiento.
        </p>
        <NuxtLink
          to="/login"
          class="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-600/90 text-white rounded-lg font-semibold transition-all"
        >
          Acceder al Portal
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Contacto - Psicóloga Karem',
  description: 'Ponte en contacto conmigo para agendar tu primera sesión o resolver cualquier duda sobre terapia psicológica.',
  ogTitle: 'Contacto - Psicóloga Karem',
  ogDescription: 'Ponte en contacto conmigo para agendar tu primera sesión o resolver cualquier duda sobre terapia psicológica.',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image'
})

const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  mensaje: ''
})

const enviando = ref(false)
const mensajeEnviado = ref(false)
const error = ref('')

const enviarMensaje = async () => {
  enviando.value = true
  error.value = ''
  mensajeEnviado.value = false

  try {
    // Aquí puedes integrar con un servicio de email como Resend, SendGrid, etc.
    // Por ahora, simulamos el envío
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Construir mailto como fallback
    const subject = encodeURIComponent(`Contacto de ${form.value.nombre}`)
    const body = encodeURIComponent(
      `Nombre: ${form.value.nombre}\n` +
      `Email: ${form.value.email}\n` +
      `Teléfono: ${form.value.telefono || 'No proporcionado'}\n\n` +
      `Mensaje:\n${form.value.mensaje}`
    )
    
    window.location.href = `mailto:karemeyde@gmail.com?subject=${subject}&body=${body}`
    
    mensajeEnviado.value = true
    
    // Limpiar formulario
    form.value = {
      nombre: '',
      email: '',
      telefono: '',
      mensaje: ''
    }
  } catch (err) {
    console.error('Error al enviar mensaje:', err)
    error.value = 'Hubo un error al enviar el mensaje. Por favor, intenta de nuevo o escríbeme directamente a karemeyde@gmail.com'
  } finally {
    enviando.value = false
  }
}
</script>
