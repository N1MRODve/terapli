<template>
  <div class="bg-[#F9F7F3] min-h-screen">
    <!-- Hero / Empathic Intro -->
    <section class="py-16 px-6 md:px-12 lg:px-20">
      <div class="max-w-3xl mx-auto text-center opacity-0 animate-fade-in-up [animation-delay:0.2s]">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-serif text-[#5D4A44] mb-6">
          A veces la mente no para y todo parece fuera de control.
        </h1>
        <p class="text-lg md:text-xl text-[#5D4A44]/80 leading-relaxed">
          La ansiedad puede sentirse como vivir en alerta constante. Tal vez cuesta dormir, aparece una presión en el pecho o los pensamientos no se detienen. 
          No estás solo ni sola. La ansiedad no es una debilidad: es una señal de que algo dentro de ti necesita ser escuchado.
        </p>
      </div>
    </section>

    <!-- Understanding Block (soft psychoeducation) -->
    <section class="py-12 px-6 md:px-12 lg:px-20 bg-white/40">
      <div class="max-w-3xl mx-auto opacity-0 animate-fade-in-up [animation-delay:0.6s]">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-6 text-center md:text-left">
          Comprender lo que sientes
        </h2>
        <p class="text-base md:text-lg text-[#5D4A44]/80 leading-relaxed text-center md:text-left">
          La ansiedad es una respuesta natural del cuerpo ante el miedo o la incertidumbre. 
          Pero cuando se mantiene activa durante mucho tiempo, puede volverse agotadora. 
          No se trata de eliminarla, sino de entender su mensaje y aprender a calmarla con herramientas adecuadas.
        </p>
      </div>
    </section>

    <!-- How I Can Accompany You -->
    <section class="py-12 px-6 md:px-12 lg:px-20">
      <div class="max-w-3xl mx-auto opacity-0 animate-fade-in-up [animation-delay:1.0s]">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-6 text-center md:text-left">
          Cómo puedo acompañarte
        </h2>
        <ul class="list-disc list-inside text-base md:text-lg text-[#5D4A44]/80 mt-4 space-y-3 leading-relaxed">
          <li>Identificar los pensamientos y situaciones que disparan tu ansiedad.</li>
          <li>Aprender técnicas de regulación emocional y respiración consciente.</li>
          <li>Desarrollar estrategias para recuperar la sensación de control.</li>
          <li>Reconectar con la calma y la seguridad que ya existen dentro de ti.</li>
        </ul>
      </div>
    </section>

    <!-- Testimonios Reales -->
    <TestimoniosSection />

    <!-- Hopeful Closure -->
    <section class="py-12 px-6 md:px-12 lg:px-20">
      <div class="max-w-3xl mx-auto text-center opacity-0 animate-fade-in-up [animation-delay:1.8s]">
        <p class="text-xl md:text-2xl text-[#5D4A44]/90 font-serif italic leading-relaxed">
          La ansiedad no define quién eres. Con tiempo, comprensión y acompañamiento psicológico, es posible volver a sentirte en calma.
        </p>
      </div>
    </section>

    <!-- CTA Emotional Block -->
    <section class="py-16 px-6 md:px-12 lg:px-20 bg-white/50">
      <div class="max-w-3xl mx-auto text-center opacity-0 animate-fade-in-up [animation-delay:2.2s]">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-4">
          Reserva tu sesión de orientación gratuita
        </h2>
        <p class="text-base md:text-lg text-[#5D4A44]/80 mb-8 leading-relaxed">
          Una primera conversación para conocernos, compartir cómo te sientes y descubrir si este acompañamiento puede ayudarte.
        </p>
        <CalmButton 
          to="https://calendly.com/psicologakarem/sesion-de-evaluacion?month=2025-10"
          size="lg"
          aria-label="Reservar sesión de orientación gratuita"
        >
          Reserva tu sesión de orientación gratuita
        </CalmButton>
      </div>
    </section>
  </div>
</template>

<script setup>
useHead({
  title: 'Psicoterapia para la Ansiedad - Karem Peña',
  meta: [
    { 
      name: 'description', 
      content: 'Acompañamiento psicológico especializado en ansiedad. Un espacio seguro para comprender lo que sientes y recuperar la calma que necesitas.' 
    }
  ]
})
</script>
