<template>
  <div class="bg-[#F9F7F3] min-h-screen">
    <!-- Hero / Empathic Intro -->
    <section class="py-16 px-6 md:px-12 lg:px-20">
      <div class="max-w-3xl mx-auto text-center opacity-0 animate-fade-in-up [animation-delay:0.2s]">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-serif text-[#5D4A44] mb-6">
          Cuando las relaciones se vuelven fuente de estrés en lugar de apoyo.
        </h1>
        <p class="text-lg md:text-xl text-[#5D4A44]/80 leading-relaxed">
          Los vínculos pueden ser una de nuestras mayores fuentes de bienestar, pero también de dolor. 
          A veces cuesta comunicarse, poner límites o sentirse comprendido. 
          Reconocer lo que duele en una relación no significa rendirse: es el primer paso para transformarla.
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
          Los conflictos relacionales suelen aparecer cuando dejamos de sentirnos vistos o escuchados. 
          Comprender lo que ocurre en tus vínculos te permitirá comunicarte con más claridad, fortalecer la empatía y recuperar la conexión con los demás y contigo mismo/a.
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
          <li>Identificar patrones repetitivos en tus relaciones.</li>
          <li>Explorar tus necesidades emocionales y tus límites personales.</li>
          <li>Aprender nuevas formas de comunicación y manejo de conflictos.</li>
          <li>Reconstruir vínculos más sanos, desde el respeto mutuo.</li>
        </ul>
      </div>
    </section>

    <!-- Testimonios Reales -->
    <TestimoniosSection />

    <!-- Hopeful Closure -->
    <section class="py-12 px-6 md:px-12 lg:px-20">
      <div class="max-w-3xl mx-auto text-center opacity-0 animate-fade-in-up [animation-delay:1.8s]">
        <p class="text-xl md:text-2xl text-[#5D4A44]/90 font-serif italic leading-relaxed">
          Las relaciones pueden doler, pero también sanar. El cambio comienza cuando aprendes a relacionarte desde la calma y la autenticidad.
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
  title: 'Terapia de Relaciones - Karem Peña Psicóloga',
  meta: [
    { 
      name: 'description', 
      content: 'Acompañamiento psicológico en relaciones interpersonales. Un espacio para construir vínculos más sanos desde el respeto y la comunicación.' 
    }
  ]
})
</script>
