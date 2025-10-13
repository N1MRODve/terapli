<template>
  <div class="bg-[#F9F7F3] min-h-screen">
    <!-- Hero Section – Empathic introduction -->
    <section class="relative flex flex-col items-center justify-center text-center py-20 px-6 md:px-12 lg:px-20 overflow-hidden">
      <!-- Background: soft gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-[#F9F7F3] via-[#EAD5D3]/30 to-[#F9F7F3]"></div>

      <div class="relative z-10 max-w-3xl mx-auto opacity-0 animate-fade-in-up">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-serif text-[#5D4A44] mb-6 leading-snug">
          {{ visitorName 
            ? `${visitorName}, cuando las relaciones se sienten más difíciles de lo que esperabas.` 
            : 'Cuando las relaciones se sienten más difíciles de lo que esperabas.' }}
        </h1>
        <p class="text-lg md:text-xl text-[#5D4A44]/80 leading-relaxed">
          A veces el amor no desaparece, pero se cubre de silencios, reproches o&nbsp;distancia.<br class="hidden md:block">
          Puede que te sientas confundido/a, frustrado/a o con la sensación de no saber cómo&nbsp;reconectar.
        </p>
      </div>
    </section>

    <!-- Understanding Section – "Comprender lo que sientes" -->
    <section class="py-12 px-6 md:px-12 lg:px-20 bg-white/40">
      <div class="max-w-3xl mx-auto opacity-0 animate-fade-in-up [animation-delay:0.6s]">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-6 text-center md:text-left">
          Comprender lo que sientes
        </h2>
        <p class="text-base md:text-lg text-[#5D4A44]/80 leading-relaxed text-center md:text-left">
          Las dificultades en pareja no siempre significan el&nbsp;final.<br class="hidden md:block">
          A menudo reflejan necesidades no expresadas, heridas previas o formas distintas de&nbsp;vincularse.<br class="hidden md:block">
          Reconocer lo que está ocurriendo es el primer paso para construir un vínculo más&nbsp;consciente.
        </p>
      </div>
    </section>

    <!-- Accompaniment Section – "Cómo puedo acompañarte" -->
    <section class="py-12 px-6 md:px-12 lg:px-20">
      <div class="max-w-3xl mx-auto opacity-0 animate-fade-in-up [animation-delay:1.0s]">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-6 text-center md:text-left">
          Cómo puedo acompañarte
        </h2>
        
        <div class="grid md:grid-cols-2 gap-6 mt-8">
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-[#EAD5D3]/30 hover:shadow-md transition-all duration-300">
            <h3 class="text-xl font-serif text-[#5D4A44] mb-3">Explorando la relación</h3>
            <p class="text-[#5D4A44]/80 leading-relaxed">
              Juntos podemos observar cómo se comunican, cómo gestionan las diferencias y qué patrones se&nbsp;repiten.<br>
              No se trata de buscar culpables, sino de entender lo que duele y lo que aún puede&nbsp;sanar.
            </p>
          </div>

          <div class="bg-white p-8 rounded-3xl shadow-sm border border-[#EAD5D3]/30 hover:shadow-md transition-all duration-300 animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
            <h3 class="text-xl font-serif text-[#5D4A44] mb-3">Recuperando el vínculo</h3>
            <p class="text-[#5D4A44]/80 leading-relaxed">
              Trabajaremos en fortalecer la empatía, la comunicación emocional y el respeto&nbsp;mutuo,<br>
              para que puedan reencontrarse desde la calma y la&nbsp;comprensión.
            </p>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6 mt-6">
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-[#EAD5D3]/30 hover:shadow-md transition-all duration-300 animate-fade-up opacity-0 [animation-delay:300ms] [animation-fill-mode:forwards]">
            <h3 class="text-xl font-serif text-[#5D4A44] mb-3">Reconstruyendo la confianza</h3>
            <p class="text-[#5D4A44]/80 leading-relaxed">
              Si ha habido rupturas de confianza, podemos trabajar en cómo sanar esas heridas y construir nuevas bases más&nbsp;sólidas.
            </p>
          </div>

          <div class="bg-white p-8 rounded-3xl shadow-sm border border-[#EAD5D3]/30 hover:shadow-md transition-all duration-300 animate-fade-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
            <h3 class="text-xl font-serif text-[#5D4A44] mb-3">Encontrando claridad</h3>
            <p class="text-[#5D4A44]/80 leading-relaxed">
              A veces necesitas espacio individual para entender qué sientes y qué necesitas de la&nbsp;relación.<br>
              Puedo acompañarte en ese proceso de&nbsp;autoconocimiento.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Emotional Reassurance Section – "El espacio terapéutico" -->
    <section class="py-16 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white/50 to-[#F9F7F3]">
      <div class="max-w-4xl mx-auto text-center opacity-0 animate-fade-in-up [animation-delay:1.4s]">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-6">
          Un espacio para ambos, o para&nbsp;ti
        </h2>
        <p class="text-base md:text-lg text-[#5D4A44]/80 max-w-3xl mx-auto leading-relaxed">
          A veces la pareja necesita un espacio&nbsp;conjunto.<br class="hidden md:block">
          Otras, uno de los dos busca orientación individual para entender qué hacer con lo que&nbsp;siente.<br class="hidden md:block">
          En ambos casos, la psicoterapia puede ayudarte a reconectar contigo y con la relación desde un lugar más&nbsp;sano.
        </p>

        <div class="mt-10 bg-white/70 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto border border-[#EAD5D3]/30">
          <p class="text-[#5D4A44]/90 italic font-serif text-lg leading-relaxed">
            "No se trata de obligar a que funcione, sino de comprender qué necesita para poder&nbsp;florecer."
          </p>
        </div>
      </div>
    </section>

    <!-- Google Reviews Block -->
    <section class="py-12 px-6 md:px-12 lg:px-20 bg-white/40">
      <div class="max-w-6xl mx-auto opacity-0 animate-fade-in-up [animation-delay:1.8s]">
        <h2 class="text-2xl md:text-3xl font-serif text-[#5D4A44] text-center mb-8">
          Experiencias de quienes ya comenzaron su&nbsp;proceso
        </h2>
        
        <div class="grid md:grid-cols-3 gap-6">
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-[#EAD5D3]/40 hover:shadow-md transition-all duration-300">
            <div class="text-[#D8AFA0] mb-3 text-lg">★★★★★</div>
            <p class="text-base text-[#5D4A44]/80 italic leading-relaxed mb-4">
              "Aprendimos a comunicarnos sin miedo ni culpa. Hoy nos sentimos más tranquilos y&nbsp;conectados."
            </p>
            <p class="text-sm text-[#5D4A44]/60">— Valoración en Google</p>
          </div>

          <div class="bg-white rounded-3xl p-6 shadow-sm border border-[#EAD5D3]/40 hover:shadow-md transition-all duration-300">
            <div class="text-[#D8AFA0] mb-3 text-lg">★★★★★</div>
            <p class="text-base text-[#5D4A44]/80 italic leading-relaxed mb-4">
              "Fue un espacio para entendernos y sanar heridas que creíamos&nbsp;irreparables."
            </p>
            <p class="text-sm text-[#5D4A44]/60">— Valoración en Google</p>
          </div>

          <div class="bg-white rounded-3xl p-6 shadow-sm border border-[#EAD5D3]/40 hover:shadow-md transition-all duration-300">
            <div class="text-[#D8AFA0] mb-3 text-lg">★★★★★</div>
            <p class="text-base text-[#5D4A44]/80 italic leading-relaxed mb-4">
              "Gracias a este acompañamiento, volvimos a escucharnos desde la&nbsp;calma."
            </p>
            <p class="text-sm text-[#5D4A44]/60">— Valoración en Google</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Hopeful Closure -->
    <section class="py-12 px-6 md:px-12 lg:px-20">
      <div class="max-w-3xl mx-auto text-center opacity-0 animate-fade-in-up [animation-delay:2.2s]">
        <p class="text-xl md:text-2xl text-[#5D4A44]/90 font-serif italic leading-relaxed">
          Las relaciones pueden transformarse cuando encuentran un espacio donde ser vistas con respeto y sin&nbsp;juicio.
        </p>
      </div>
    </section>

    <!-- CTA Emotional Block -->
    <section class="py-16 px-6 md:px-12 lg:px-20 bg-white/50">
      <div class="max-w-3xl mx-auto text-center opacity-0 animate-fade-in-up [animation-delay:2.6s]">
        <h2 class="text-3xl md:text-4xl font-serif text-[#5D4A44] mb-4">
          Reserva tu sesión de orientación&nbsp;gratuita
        </h2>
        <p class="text-base md:text-lg text-[#5D4A44]/80 mb-8 leading-relaxed">
          {{ visitorName 
            ? `${visitorName}, si sientes que la relación merece una nueva oportunidad, podemos explorar juntos cómo reencontrarse desde la calma.` 
            : 'Si sientes que la relación merece una nueva oportunidad, podemos explorar juntos cómo reencontrarse desde la calma.' }}
        </p>
        <CalmButton 
          to="https://calendly.com/psicologakarem/sesion-de-evaluacion?month=2025-10"
          size="lg"
          aria-label="Reservar sesión de orientación gratuita"
        >
          Reserva tu sesión de orientación&nbsp;gratuita
        </CalmButton>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useVisitorContext } from '@/composables/useVisitorContext'

const { visitorName } = useVisitorContext()

useHead({
  title: 'Psicoterapia de Pareja - Karem Peña',
  meta: [
    { 
      name: 'description', 
      content: 'Acompañamiento psicológico para parejas. Un espacio seguro para reconectar, sanar heridas y reconstruir el vínculo desde la calma y el respeto mutuo.' 
    }
  ]
})
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
  opacity: 0;
}

@keyframes fade-up {
  0% { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.animate-fade-up {
  animation: fade-up 0.8s ease-out;
}

[animation-delay\:0\.6s] {
  animation-delay: 0.6s;
}

[animation-delay\:1\.0s] {
  animation-delay: 1.0s;
}

[animation-delay\:1\.4s] {
  animation-delay: 1.4s;
}

[animation-delay\:1\.8s] {
  animation-delay: 1.8s;
}

[animation-delay\:2\.2s] {
  animation-delay: 2.2s;
}

[animation-delay\:2\.6s] {
  animation-delay: 2.6s;
}

[animation-delay\:200ms] {
  animation-delay: 200ms;
}

[animation-delay\:300ms] {
  animation-delay: 300ms;
}

[animation-delay\:400ms] {
  animation-delay: 400ms;
}

[animation-fill-mode\:forwards] {
  animation-fill-mode: forwards;
}
</style>