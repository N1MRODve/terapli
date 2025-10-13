<template>
  <div class="bg-[#F9F7F3] min-h-screen">
    <!-- Hero / Empathic Intro -->
    <section class="py-16 px-6 md:px-12 lg:px-20">
      <div class="max-w-3xl mx-auto text-center opacity-0 animate-fade-in-up [animation-delay:0.2s]">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-serif text-[#5D4A44] mb-6">
          Cuando estás lejos de casa y sientes que una parte de ti también se quedó allí.
        </h1>
        <p class="text-lg md:text-xl text-[#5D4A44]/80 leading-relaxed">
          Migrar no solo implica cambiar de lugar, sino reconstruir la identidad, los lazos y la sensación de pertenencia. 
          A veces aparece la nostalgia, el desarraigo o la culpa por lo que se deja atrás. 
          Todo eso forma parte de un proceso emocional que también merece cuidado.
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
          El duelo migratorio es un proceso natural ante la pérdida de costumbres, idioma, vínculos o rutinas. 
          No se trata solo de adaptarse, sino de integrar tu historia para poder sentirte en casa, donde sea que estés.
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
          <li>Acompañarte a elaborar el duelo migratorio y sus emociones.</li>
          <li>Trabajar la nostalgia y la sensación de no pertenecer.</li>
          <li>Reconectar con tus raíces y tu identidad en el nuevo entorno.</li>
          <li>Construir un sentido de hogar interno, más allá del lugar físico.</li>
        </ul>
      </div>
    </section>

    <!-- Testimonios Reales -->
    <TestimoniosSection />

    <!-- Hopeful Closure -->
    <section class="py-12 px-6 md:px-12 lg:px-20">
      <div class="max-w-3xl mx-auto text-center opacity-0 animate-fade-in-up [animation-delay:1.8s]">
        <p class="text-xl md:text-2xl text-[#5D4A44]/90 font-serif italic leading-relaxed">
          Estar lejos no significa estar solo/a. Es posible reconstruir tu lugar en el mundo y volver a sentirte en casa.
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
  title: 'Acompañamiento en Procesos Migratorios - Karem Peña',
  meta: [
    { 
      name: 'description', 
      content: 'Psicoterapia para procesos migratorios. Un espacio para entender las emociones del desarraigo y construir una nueva identidad con tus raíces.' 
    }
  ]
})
</script>
