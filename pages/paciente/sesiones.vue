<template>
  <div>
    <LoadingSpinner v-if="loading" text="Cargando tus sesiones..." full-height />

    <div v-else class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-['Lora'] font-medium text-[#5D4A44]">
            Mis Sesiones
          </h1>
          <p class="text-sm text-[#5D4A44] opacity-70 font-['Lato'] mt-1">
            Gestiona y revisa tus sesiones terapéuticas
          </p>
        </div>

        <!-- Filtros -->
        <div class="flex items-center space-x-2">
          <button
            v-for="filtro in filtros"
            :key="filtro.value"
            @click="filtroActivo = filtro.value"
            class="px-4 py-2 rounded-lg text-sm font-['Lato'] transition-all duration-200"
            :class="filtroActivo === filtro.value
              ? 'bg-[#D8AFA0] text-white'
              : 'bg-white text-[#5D4A44] border border-[#EAD5D3] hover:bg-[#F9F7F3]'"
          >
            {{ filtro.label }}
          </button>
        </div>
      </div>

      <!-- Lista de sesiones -->
      <div v-if="sesionesFiltradas.length > 0" class="space-y-4">
        <Card
          v-for="sesion in sesionesFiltradas"
          :key="sesion.id"
          padding="compact"
        >
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <!-- Información de la sesión -->
            <div class="flex-1 space-y-3">
              <!-- Fecha y hora -->
              <div>
                <h3 class="text-lg font-['Lora'] font-medium text-[#5D4A44] mb-1">
                  {{ formatearFechaCompleta(sesion.fecha) }}
                </h3>
                <div class="flex items-center space-x-4 text-sm text-[#5D4A44] opacity-70 font-['Lato']">
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ formatearHora(sesion.fecha) }}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ sesion.duracion_min }} min</span>
                  </div>
                </div>
              </div>

              <!-- Modalidad -->
              <div class="flex items-center space-x-2">
                <span class="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-['Lato'] font-medium bg-[#F9F7F3] text-[#5D4A44]">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="sesion.modalidad === 'online'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span class="capitalize">{{ sesion.modalidad }}</span>
                </span>

                <!-- Estado -->
                <span
                  class="inline-block px-3 py-1 rounded-full text-xs font-['Lato'] font-medium"
                  :class="estadoClass(sesion.estado)"
                >
                  {{ estadoTexto(sesion.estado) }}
                </span>
              </div>

              <!-- Nota del terapeuta (si existe y está realizada) -->
              <div v-if="sesion.nota_terapeuta && sesion.estado === 'realizada'" class="mt-3 p-3 bg-[#F9F7F3] rounded-lg">
                <p class="text-xs font-['Lato'] font-medium text-[#5D4A44] mb-1">
                  Nota de la sesión:
                </p>
                <p class="text-sm font-['Lato'] text-[#5D4A44] opacity-80">
                  {{ sesion.nota_terapeuta }}
                </p>
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex flex-col gap-2 sm:ml-4">
              <!-- Botón unirse (solo para sesiones online pendientes o confirmadas) -->
              <button
                v-if="sesion.ubicacion && sesion.modalidad === 'online' && ['pendiente', 'confirmada'].includes(sesion.estado)"
                @click="abrirSesion(sesion.ubicacion)"
                class="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#c99d8d] transition-colors font-['Lato'] text-sm whitespace-nowrap"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Unirme</span>
              </button>

              <!-- Mostrar ubicación para presencial -->
              <div v-if="sesion.ubicacion && sesion.modalidad === 'presencial'" class="text-xs font-['Lato'] text-[#5D4A44] opacity-70">
                📍 {{ sesion.ubicacion }}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Estado vacío -->
      <EmptyState
        v-else
        :title="tituloVacio"
        :description="descripcionVacio"
      >
        <template #icon>
          <svg class="w-16 h-16 text-[#D8AFA0] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </template>
      </EmptyState>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'paciente',
  middleware: 'auth'
})

const { getSesiones, getProximasSesiones } = usePacientes()

// Estados
const loading = ref(true)
const todasLasSesiones = ref([])
const filtroActivo = ref('todas')

const filtros = [
  { value: 'todas', label: 'Todas' },
  { value: 'proximas', label: 'Próximas' },
  { value: 'pasadas', label: 'Pasadas' }
]

// Sesiones filtradas
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
      return 'No tienes sesiones próximas'
    case 'pasadas':
      return 'No hay sesiones pasadas'
    default:
      return 'No tienes sesiones registradas'
  }
})

const descripcionVacio = computed(() => {
  switch (filtroActivo.value) {
    case 'proximas':
      return 'Aún no tienes sesiones programadas. Contacta con tu psicóloga para agendar una.'
    case 'pasadas':
      return 'Todavía no has completado ninguna sesión.'
    default:
      return 'Cuando tengas sesiones programadas, aparecerán aquí.'
  }
})

// Funciones de formato
const formatearFechaCompleta = (fecha) => {
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

const estadoClass = (estado) => {
  const classes = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-blue-100 text-blue-800',
    realizada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800'
  }
  return classes[estado] || classes.pendiente
}

const estadoTexto = (estado) => {
  const textos = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    realizada: 'Realizada',
    cancelada: 'Cancelada'
  }
  return textos[estado] || 'Pendiente'
}

// Abrir sesión online
const abrirSesion = (url) => {
  window.open(url, '_blank')
}

// Cargar sesiones
const cargarSesiones = async () => {
  loading.value = true

  try {
    const { data, error } = await getSesiones()
    
    if (!error && data) {
      // Ordenar por fecha (más recientes primero)
      todasLasSesiones.value = data.sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      )
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
