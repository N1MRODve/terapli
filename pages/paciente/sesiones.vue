<template>
  <div>
    <LoadingSpinner v-if="loading" text="Cargando tus sesiones..." full-height />

    <div v-else class="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <!-- Header con filtros -->
      <div class="space-y-4">
        <div>
          <h1 class="text-3xl font-['Lora'] font-medium text-[#5D4A44]">
            Mis Sesiones
          </h1>
          <p class="text-sm text-[#5D4A44]/70 font-['Lato'] mt-2">
            Tu espacio de acompañamiento terapéutico
          </p>
        </div>

        <!-- Filtros tipo pestañas -->
        <div class="flex items-center space-x-1 bg-[#F9F7F3] p-1 rounded-xl w-fit">
          <button
            v-for="filtro in filtros"
            :key="filtro.value"
            @click="filtroActivo = filtro.value"
            class="px-5 py-2.5 rounded-lg text-sm font-['Lato'] font-medium transition-all duration-200"
            :class="filtroActivo === filtro.value
              ? 'bg-white text-[#5D4A44] shadow-sm'
              : 'text-[#5D4A44]/60 hover:text-[#5D4A44]'"
          >
            {{ filtro.label }}
          </button>
        </div>
      </div>

      <!-- Próxima sesión destacada -->
      <div v-if="proximaSesion && (filtroActivo === 'todas' || filtroActivo === 'proximas')" 
           class="relative bg-gradient-to-br from-[#F9F7F3] to-white rounded-2xl p-6 border-l-4"
           :class="estaProxima(proximaSesion.fecha) ? 'border-[#D8AFA0]' : 'border-[#EAD5D3]'">
        <div class="absolute top-4 right-4">
          <span class="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#D8AFA0]/10 text-[#D8AFA0] rounded-full text-xs font-['Lato'] font-semibold">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Próxima sesión</span>
          </span>
        </div>

        <div class="space-y-4">
          <!-- Fecha grande -->
          <div>
            <h2 class="text-2xl font-['Lora'] font-medium text-[#5D4A44] mb-1">
              {{ formatearFechaLarga(proximaSesion.fecha) }}
            </h2>
            <div class="flex items-center space-x-4 text-[#5D4A44]/70 font-['Lato']">
              <div class="flex items-center space-x-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium">{{ formatearHora(proximaSesion.fecha) }}</span>
              </div>
              <span class="text-[#5D4A44]/40">•</span>
              <span>{{ proximaSesion.duracion_min }} minutos</span>
            </div>
          </div>

          <!-- Modalidad y Estado -->
          <div class="flex items-center flex-wrap gap-2">
            <span class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-['Lato'] font-medium bg-white border border-[#EAD5D3] text-[#5D4A44]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="proximaSesion.modalidad === 'online'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span class="capitalize">{{ proximaSesion.modalidad }}</span>
            </span>

            <span
              class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-['Lato'] font-medium"
              :class="estadoClassExtendido(proximaSesion.estado)"
            >
              <span>{{ estadoTextoExtendido(proximaSesion.estado) }}</span>
            </span>
          </div>

          <!-- Botón de acción -->
          <div v-if="proximaSesion.ubicacion && proximaSesion.modalidad === 'online' && ['pendiente', 'confirmada'].includes(proximaSesion.estado)">
            <button
              @click="abrirSesion(proximaSesion.ubicacion)"
              class="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[#D8AFA0] text-white rounded-xl hover:bg-[#c99d8d] transition-all duration-200 font-['Lato'] font-medium shadow-sm hover:shadow-md"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Unirme a la sesión</span>
            </button>
          </div>

          <div v-else-if="proximaSesion.ubicacion && proximaSesion.modalidad === 'presencial'" class="flex items-start space-x-2 text-sm font-['Lato'] text-[#5D4A44]/70 bg-white px-4 py-3 rounded-lg border border-[#EAD5D3]">
            <svg class="w-5 h-5 text-[#D8AFA0] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ proximaSesion.ubicacion }}</span>
          </div>
        </div>
      </div>

      <!-- Lista de sesiones próximas -->
      <div v-if="sesionesProximasRestantes.length > 0 && (filtroActivo === 'todas' || filtroActivo === 'proximas')" class="space-y-3">
        <h3 class="text-lg font-['Lora'] font-medium text-[#5D4A44] flex items-center space-x-2">
          <svg class="w-5 h-5 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Próximas sesiones</span>
        </h3>

        <div class="space-y-3">
          <SesionCard
            v-for="sesion in sesionesProximasRestantes"
            :key="sesion.id"
            :sesion="sesion"
            @abrir="abrirSesion"
          />
        </div>
      </div>

      <!-- Lista de sesiones pasadas -->
      <div v-if="sesionesPasadas.length > 0 && (filtroActivo === 'todas' || filtroActivo === 'pasadas')" class="space-y-3">
        <h3 class="text-lg font-['Lora'] font-medium text-[#5D4A44] flex items-center space-x-2">
          <svg class="w-5 h-5 text-[#5D4A44]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Sesiones pasadas</span>
        </h3>

        <div class="space-y-3">
          <SesionCard
            v-for="sesion in sesionesPasadas"
            :key="sesion.id"
            :sesion="sesion"
            :pasada="true"
            @abrir="abrirSesion"
          />
        </div>
      </div>

      <!-- Estado vacío -->
      <EmptyState
        v-if="sesionesFiltradas.length === 0"
        :title="tituloVacio"
        :description="descripcionVacio"
      >
        <template #icon>
          <svg class="w-16 h-16 text-[#D8AFA0] opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </template>
      </EmptyState>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'paciente',
  middleware: 'auth'
})

const { getSesiones } = usePacientes()

// Estados
const loading = ref(true)
const todasLasSesiones = ref<any[]>([])
const filtroActivo = ref('todas')

const filtros = [
  { value: 'todas', label: 'Todas' },
  { value: 'proximas', label: 'Próximas' },
  { value: 'pasadas', label: 'Pasadas' }
]

// Próxima sesión (la más cercana en el futuro)
const proximaSesion = computed(() => {
  const ahora = new Date()
  const proximas = todasLasSesiones.value
    .filter(s => new Date(s.fecha) >= ahora)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
  return proximas[0] || null
})

// Sesiones próximas sin la primera
const sesionesProximasRestantes = computed(() => {
  const ahora = new Date()
  const proximas = todasLasSesiones.value
    .filter(s => new Date(s.fecha) >= ahora)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
  return proximas.slice(1) // Excluye la primera (proximaSesion)
})

// Sesiones pasadas
const sesionesPasadas = computed(() => {
  const ahora = new Date()
  return todasLasSesiones.value
    .filter(s => new Date(s.fecha) < ahora)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
})

// Sesiones filtradas (para estado vacío)
const sesionesFiltradas = computed(() => {
  const ahora = new Date()
  
  switch (filtroActivo.value) {
    case 'proximas':
      return todasLasSesiones.value.filter(s => new Date(s.fecha) >= ahora)
    case 'pasadas':
      return todasLasSesiones.value.filter(s => new Date(s.fecha) < ahora)
    default:
      return todasLasSesiones.value
  }
})

// Textos para estado vacío
const tituloVacio = computed(() => {
  switch (filtroActivo.value) {
    case 'proximas':
      return 'No tienes sesiones programadas todavía 💬'
    case 'pasadas':
      return 'Aún no has completado ninguna sesión'
    default:
      return 'No tienes sesiones registradas'
  }
})

const descripcionVacio = computed(() => {
  switch (filtroActivo.value) {
    case 'proximas':
      return 'Contacta con tu psicóloga para agendar tu primera sesión. Estamos aquí para acompañarte.'
    case 'pasadas':
      return 'Una vez que completes tus sesiones, podrás revisar las notas y el progreso aquí.'
    default:
      return 'Cuando tengas sesiones programadas, aparecerán en este espacio.'
  }
})

// Funciones de formato
const formatearFechaLarga = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

const formatearHora = (fecha: string) => {
  return new Date(fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const estaProxima = (fecha: string) => {
  const ahora = new Date()
  const fechaSesion = new Date(fecha)
  const diffHoras = (fechaSesion.getTime() - ahora.getTime()) / (1000 * 60 * 60)
  return diffHoras > 0 && diffHoras < 24
}

const estadoClassExtendido = (estado: string) => {
  const classes: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-blue-100 text-blue-800',
    realizada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800'
  }
  return classes[estado] || classes.pendiente
}

const estadoTextoExtendido = (estado: string) => {
  const textos: Record<string, string> = {
    pendiente: 'Programada',
    confirmada: 'Lista para ti ✨',
    realizada: 'Completada 💪',
    cancelada: 'No se realizó'
  }
  return textos[estado] || 'Programada'
}

// Abrir sesión online
const abrirSesion = (url: string) => {
  window.open(url, '_blank')
}

// Cargar sesiones
const cargarSesiones = async () => {
  loading.value = true

  try {
    const { data, error } = await getSesiones()
    
    if (!error && data) {
      todasLasSesiones.value = data
    }
  } catch (error) {
    console.error('Error cargando sesiones:', error)
  } finally {
    loading.value = false
  }
}

// Cargar al montar
onMounted(() => {
  cargarSesiones()
})
</script>
