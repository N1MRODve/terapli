<template>
  <div>
    <!-- Página protegida por autenticación -->
    <LoadingSpinner v-if="loading" text="Cargando tu información..." full-height />

    <div v-else class="max-w-6xl mx-auto space-y-6">
      <!-- Saludo personalizado -->
      <div class="bg-gradient-to-r from-[#D8AFA0] to-[#EAD5D3] rounded-lg p-6 sm:p-8 text-white shadow-md">
        <h1 class="text-2xl sm:text-3xl font-['Lora'] font-medium mb-2">
          {{ saludo }}, {{ nombrePaciente }} 👋
        </h1>
        <p class="text-sm sm:text-base opacity-90 font-['Lato']">
          {{ mensajeBienvenida }}
        </p>
      </div>

      <!-- Grid de cards principales -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Próxima sesión -->
        <Card title="📅 Próxima Sesión">
          <div v-if="proximaSesion">
            <div class="space-y-3">
              <div>
                <p class="text-2xl font-['Lora'] font-medium text-[#5D4A44] mb-1">
                  {{ formatearFecha(proximaSesion.fecha) }}
                </p>
                <p class="text-sm text-[#5D4A44] opacity-70 font-['Lato']">
                  {{ formatearHora(proximaSesion.fecha) }}
                </p>
              </div>

              <div class="flex items-center space-x-2 text-sm text-[#5D4A44] font-['Lato']">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="proximaSesion.modalidad === 'online'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span class="capitalize">{{ proximaSesion.modalidad }}</span>
              </div>

              <div v-if="proximaSesion.ubicacion && proximaSesion.modalidad === 'online'" class="mt-4">
                <a
                  :href="proximaSesion.ubicacion"
                  target="_blank"
                  class="inline-flex items-center space-x-2 px-4 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#c99d8d] transition-colors font-['Lato'] text-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Unirme a la sesión</span>
                </a>
              </div>
            </div>
          </div>

          <EmptyState
            v-else
            title="Sin sesiones programadas"
            description="Aún no tienes ninguna sesión agendada. Contacta con tu psicóloga para programar una."
          >
            <template #icon>
              <svg class="w-16 h-16 text-[#D8AFA0] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </template>
          </EmptyState>

          <template #footer>
            <NuxtLink
              to="/paciente/sesiones"
              class="text-sm text-[#D8AFA0] hover:text-[#c99d8d] font-['Lato'] font-medium"
            >
              Ver todas las sesiones →
            </NuxtLink>
          </template>
        </Card>

        <!-- Bono activo -->
        <Card title="🎫 Mi Bono Actual">
          <div v-if="bonoActivo">
            <div class="space-y-4">
              <div>
                <p class="text-3xl font-['Lora'] font-medium text-[#5D4A44]">
                  {{ bonoActivo.sesiones_restantes }} <span class="text-lg opacity-70">/ {{ bonoActivo.total_sesiones }}</span>
                </p>
                <p class="text-sm text-[#5D4A44] opacity-70 font-['Lato'] mt-1">
                  sesiones disponibles
                </p>
              </div>

              <ProgressBar
                :current="bonoActivo.total_sesiones - bonoActivo.sesiones_restantes"
                :total="bonoActivo.total_sesiones"
                color="terracota"
              />

              <div class="flex items-center space-x-2">
                <span
                  class="inline-block px-3 py-1 rounded-full text-xs font-['Lato'] font-medium"
                  :class="estadoBonoClass(bonoActivo.estado)"
                >
                  {{ estadoBonoTexto(bonoActivo.estado) }}
                </span>
              </div>
            </div>
          </div>

          <EmptyState
            v-else
            title="Sin bono activo"
            description="Actualmente no tienes un bono de sesiones activo. Contacta para adquirir uno."
          >
            <template #icon>
              <svg class="w-16 h-16 text-[#D8AFA0] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </template>
          </EmptyState>

          <template #footer>
            <NuxtLink
              to="/paciente/bono"
              class="text-sm text-[#D8AFA0] hover:text-[#c99d8d] font-['Lato'] font-medium"
            >
              Ver detalles del bono →
            </NuxtLink>
          </template>
        </Card>
      </div>

      <!-- Último recurso y mensaje motivacional -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Último recurso -->
        <Card title="📚 Último Recurso Compartido">
          <div v-if="ultimoRecurso">
            <div class="space-y-3">
              <h4 class="font-['Lora'] font-medium text-[#5D4A44]">
                {{ ultimoRecurso.titulo }}
              </h4>
              <p class="text-sm text-[#5D4A44] opacity-70 font-['Lato']">
                {{ ultimoRecurso.descripcion || 'Sin descripción' }}
              </p>
              <div class="flex items-center space-x-2 text-xs text-[#5D4A44] opacity-60 font-['Lato']">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ formatearFechaRelativa(ultimoRecurso.created_at) }}</span>
              </div>
            </div>
          </div>

          <EmptyState
            v-else
            title="Sin recursos compartidos"
            description="Aún no hay recursos disponibles para ti."
          >
            <template #icon>
              <svg class="w-16 h-16 text-[#D8AFA0] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </template>
          </EmptyState>

          <template #footer>
            <NuxtLink
              to="/paciente/recursos"
              class="text-sm text-[#D8AFA0] hover:text-[#c99d8d] font-['Lato'] font-medium"
            >
              Ver todos los recursos →
            </NuxtLink>
          </template>
        </Card>

        <!-- Mensaje motivacional -->
        <Card>
          <div class="space-y-4">
            <div class="w-12 h-12 bg-[#EAD5D3] rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-[#5D4A44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p class="text-lg font-['Lora'] text-[#5D4A44] italic">
              "{{ mensajeMotivacional }}"
            </p>
            <p class="text-sm text-[#5D4A44] opacity-60 font-['Lato']">
              Recuerda que cada paso cuenta en tu proceso de crecimiento personal.
            </p>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'paciente',
  middleware: 'auth'
})

const { user } = useSupabase()
const { getPaciente, getProximasSesiones, getBonosActivos, getRecursosPublicos } = usePacientes()

// Estados
const loading = ref(true)
const nombrePaciente = ref('')
const proximaSesion = ref(null)
const bonoActivo = ref(null)
const ultimoRecurso = ref(null)

// Mensajes dinámicos
const saludo = computed(() => {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 20) return 'Buenas tardes'
  return 'Buenas noches'
})

const mensajeBienvenida = computed(() => {
  const mensajes = [
    'Bienvenida a tu espacio personal de bienestar.',
    'Aquí encontrarás toda la información sobre tus sesiones y recursos.',
    'Me alegra verte por aquí. Espero que estés teniendo un buen día.',
    'Este es tu espacio seguro para el crecimiento personal.'
  ]
  return mensajes[Math.floor(Math.random() * mensajes.length)]
})

const mensajeMotivacional = computed(() => {
  const mensajes = [
    'El progreso, no la perfección, es el objetivo.',
    'Cada pequeño paso cuenta en tu camino hacia el bienestar.',
    'Eres más fuerte de lo que crees.',
    'Tu bienestar emocional es una prioridad.',
    'Está bien no estar bien todo el tiempo.',
    'El autocuidado no es egoísmo, es necesario.'
  ]
  return mensajes[Math.floor(Math.random() * mensajes.length)]
})

// Funciones de formato
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatearHora = (fecha) => {
  return new Date(fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatearFechaRelativa = (fecha) => {
  const ahora = new Date()
  const fechaRecurso = new Date(fecha)
  const diffDias = Math.floor((ahora - fechaRecurso) / (1000 * 60 * 60 * 24))
  
  if (diffDias === 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`
  return fechaRecurso.toLocaleDateString('es-ES')
}

const estadoBonoClass = (estado) => {
  const classes = {
    activo: 'bg-green-100 text-green-800',
    pausado: 'bg-yellow-100 text-yellow-800',
    agotado: 'bg-red-100 text-red-800',
    cerrado: 'bg-gray-100 text-gray-800'
  }
  return classes[estado] || classes.activo
}

const estadoBonoTexto = (estado) => {
  const textos = {
    activo: 'Activo',
    pausado: 'Pausado',
    agotado: 'Agotado',
    cerrado: 'Cerrado'
  }
  return textos[estado] || 'Activo'
}

// Cargar datos
const cargarDatos = async () => {
  loading.value = true

  try {
    // Obtener datos del paciente
    const { data: paciente } = await getPaciente()
    if (paciente) {
      nombrePaciente.value = paciente.nombre || user.value?.email || 'Paciente'
    }

    // Obtener próxima sesión
    const { data: sesiones } = await getProximasSesiones()
    if (sesiones && sesiones.length > 0) {
      proximaSesion.value = sesiones[0]
    }

    // Obtener bono activo
    const { data: bonos } = await getBonosActivos()
    if (bonos && bonos.length > 0) {
      bonoActivo.value = bonos[0]
    }

    // Obtener último recurso
    const { data: recursos } = await getRecursosPublicos()
    if (recursos && recursos.length > 0) {
      ultimoRecurso.value = recursos[0]
    }
  } catch (error) {
    console.error('Error cargando datos del dashboard:', error)
  } finally {
    loading.value = false
  }
}

// Cargar al montar
onMounted(() => {
  cargarDatos()
})
</script>
