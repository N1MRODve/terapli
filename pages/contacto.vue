<template>
  <div class="bg-[#F9F7F3] min-h-screen">
    <!-- Hero / Encabezado emocional -->
    <section class="py-20 px-6">
      <div class="max-w-5xl mx-auto text-center">
        <h1 class="font-lora text-4xl md:text-5xl text-[#5D4A44] font-semibold mb-6">
          Tu primer paso hacia el bienestar
        </h1>
        <p class="font-lato text-lg md:text-xl text-[#5D4A44] leading-relaxed mb-10 max-w-3xl mx-auto">
          Si estás aquí, es porque ya has hecho lo más importante: reconocer que necesitas un espacio para ti.
          Estoy aquí para acompañarte. Puedes escribirme por WhatsApp o dejarme un mensaje y te responderé lo antes posible.
        </p>

        <!-- Botón WhatsApp principal -->
        <a 
          href="https://wa.me/34722377290" 
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 bg-[#D8AFA0] text-[#5D4A44] px-8 py-4 rounded-2xl font-lato font-medium hover:bg-[#EAD5D3] transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Contactar por WhatsApp
        </a>
      </div>
    </section>

    <!-- Datos de contacto -->
    <section class="py-12 px-6">
      <div class="max-w-5xl mx-auto">
        <div class="bg-white p-8 md:p-12 rounded-2xl shadow-md border border-[#EAD5D3]">
          <h2 class="font-lora text-3xl text-[#5D4A44] mb-6">Datos de contacto</h2>
          
          <div class="grid md:grid-cols-2 gap-8 mb-8">
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <svg class="w-6 h-6 text-[#D8AFA0] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <div>
                  <p class="font-lato font-semibold text-[#5D4A44]">Teléfono y WhatsApp</p>
                  <a href="tel:+34722377290" class="font-lato text-lg text-[#5D4A44] hover:text-[#D8AFA0] transition">722 377 290</a>
                  <br>
                  <a 
                    href="https://wa.me/34722377290" 
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-block mt-2 text-sm bg-[#D8AFA0] text-[#5D4A44] px-4 py-2 rounded-xl hover:bg-[#EAD5D3] transition"
                  >
                    Enviar mensaje por WhatsApp
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <svg class="w-6 h-6 text-[#D8AFA0] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <p class="font-lato font-semibold text-[#5D4A44]">Horario de atención</p>
                  <p class="font-lato text-[#5D4A44]">Lunes a viernes: 11:00–14:00, 18:00–22:00</p>
                  <p class="font-lato text-[#5D4A44]">Sábado y domingo: cerrado</p>
                </div>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-[#D8AFA0] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <div>
                <p class="font-lato font-semibold text-[#5D4A44]">Dirección</p>
                <p class="font-lato text-[#5D4A44]">Calle del Dr. Rivas, 2, Número 8</p>
                <p class="font-lato text-[#5D4A44]">28350 Ciempozuelos, Madrid</p>
              </div>
            </div>
          </div>

          <div class="bg-[#F9F7F3] p-6 rounded-xl border-l-4 border-[#D8AFA0]">
            <p class="font-lato text-[#5D4A44] italic leading-relaxed">
              Si no puedo responderte de inmediato, te devolveré la llamada o mensaje en cuanto sea posible. Tu bienestar es importante para mí.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mapa -->
    <section class="py-12 px-6">
      <div class="max-w-5xl mx-auto">
        <div class="rounded-2xl overflow-hidden shadow-md border border-[#EAD5D3]">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3051.8275447891873!2d-3.6171837!3d40.1524167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd4227b1f4c4c4c5%3A0x1234567890abcdef!2sCalle%20del%20Dr.%20Rivas%2C%202%2C%2028350%20Ciempozuelos%2C%20Madrid!5e0!3m2!1ses!2ses!4v1234567890123!5m2!1ses!2ses"
            width="100%" 
            height="400" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
            class="w-full"
          ></iframe>
        </div>
      </div>
    </section>

    <!-- Formulario de contacto empático -->
    <section class="py-12 px-6">
      <div class="max-w-3xl mx-auto">
        <div class="bg-white p-8 md:p-12 rounded-2xl shadow-md border border-[#EAD5D3]">
          <h2 class="font-lora text-3xl text-[#5D4A44] mb-6 text-center">Envíame un mensaje</h2>
          
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label class="block font-lora text-[#5D4A44] mb-2">Nombre</label>
              <input 
                v-model="form.nombre" 
                type="text" 
                required
                placeholder="Tu nombre completo"
                class="w-full p-4 rounded-xl border border-[#EAD5D3] focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent transition font-lato"
              >
            </div>

            <div>
              <label class="block font-lora text-[#5D4A44] mb-2">Email</label>
              <input 
                v-model="form.email" 
                type="email" 
                required
                placeholder="tu@correo.com"
                class="w-full p-4 rounded-xl border border-[#EAD5D3] focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent transition font-lato"
              >
            </div>

            <div>
              <label class="block font-lora text-[#5D4A44] mb-2">Teléfono (opcional)</label>
              <input 
                v-model="form.telefono" 
                type="tel"
                placeholder="Tu número de teléfono"
                class="w-full p-4 rounded-xl border border-[#EAD5D3] focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent transition font-lato"
              >
            </div>

            <div>
              <label class="block font-lora text-[#5D4A44] mb-2">¿Qué te gustaría compartir o preguntar?</label>
              <textarea 
                v-model="form.mensaje" 
                rows="5" 
                required
                placeholder="Cuéntame qué te trae por aquí..."
                class="w-full p-4 rounded-xl border border-[#EAD5D3] focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent transition font-lato resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              :disabled="loading"
              class="w-full bg-[#D8AFA0] text-[#5D4A44] px-6 py-4 rounded-2xl font-lato font-medium hover:bg-[#EAD5D3] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Enviando...' : 'Enviar mensaje con calma' }}
            </button>

            <p class="text-sm text-[#5D4A44] text-center font-lato leading-relaxed">
              Tus datos serán tratados con total confidencialidad. Este es un espacio seguro.
            </p>

            <p v-if="mensaje" :class="error ? 'text-red-600' : 'text-green-600'" class="text-center font-lato font-medium">
              {{ mensaje }}
            </p>
          </form>
        </div>
      </div>
    </section>

    <!-- Bloque tranquilizador final -->
    <section class="py-20 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <p class="font-lora text-2xl md:text-3xl text-[#5D4A44] italic mb-8 leading-relaxed">
          No hace falta tenerlo todo claro para empezar.<br>
          A veces, el primer paso es simplemente hablar con alguien que te escuche.<br>
          Estoy aquí para acompañarte en ese camino.
        </p>

        <NuxtLink 
          to="/reservar"
          class="inline-block bg-[#D8AFA0] text-[#5D4A44] px-8 py-4 rounded-2xl font-lato font-medium hover:bg-[#EAD5D3] transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Reserva tu orientación gratuita
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { capitalizeName } from '@/utils/formatName'

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
    // Normalizar el nombre
    form.value.nombre = capitalizeName(form.value.nombre)
    
    // Aquí se puede integrar con backend/Supabase/email service
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    mensaje.value = 'Mensaje enviado correctamente. Te responderé pronto. Gracias por confiar en mí.'
    form.value = { nombre: '', email: '', telefono: '', mensaje: '' }
  } catch (e) {
    error.value = true
    mensaje.value = 'Hubo un problema al enviar el mensaje. Por favor, intenta contactarme por WhatsApp.'
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Contacto Psicóloga en Ciempozuelos | Reserva tu Sesión – Karem Peña',
  meta: [
    { 
      name: 'description', 
      content: 'Habla con Karem Peña, psicóloga en Ciempozuelos. Primera orientación gratuita por WhatsApp o llamada. Espacio seguro y confidencial en el centro de Ciempozuelos.' 
    },
    { name: 'keywords', content: 'contactar psicóloga Ciempozuelos, cita psicóloga Madrid Sur, terapia WhatsApp, psicóloga presencial Ciempozuelos' },
    { property: 'og:title', content: 'Contacto Psicóloga en Ciempozuelos | Reserva tu Sesión' },
    { property: 'og:description', content: 'Primera orientación gratuita. Psicóloga en Ciempozuelos, Madrid Sur. Contacto por WhatsApp, teléfono o email.' },
    { property: 'og:url', content: 'https://psicologakarem.com/contacto' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: 'Contacto Psicóloga en Ciempozuelos | Reserva tu Sesión' },
    { name: 'twitter:description', content: 'Primera orientación gratuita. Psicóloga en Ciempozuelos, Madrid Sur. Contacto por WhatsApp, teléfono o email.' }
  ],
  link: [
    { rel: 'canonical', href: 'https://psicologakarem.com/contacto' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contacto - Psicóloga Karem Peña',
        description: 'Contacta con Karem Peña para una sesión de orientación gratuita',
        url: 'https://psicologakarem.com/contacto',
        mainEntity: {
          '@type': 'Psychologist',
          name: 'Psicóloga Karem Peña',
          telephone: '+34722377290',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Calle del Dr. Rivas, 2, Número 8',
            addressLocality: 'Ciempozuelos',
            postalCode: '28350',
            addressRegion: 'Madrid',
            addressCountry: 'ES'
          }
        }
      })
    }
  ]
})
</script>
