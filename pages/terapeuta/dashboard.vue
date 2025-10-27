<template>
  <main class="dashboard-container">
    <!-- Page Title -->
    <div class="mb-8">
      <h1 class="text-4xl font-serif font-bold text-cafe mb-2">
        Dashboard
      </h1>
      <p class="text-lg text-cafe/70">
        Bienvenida de vuelta, Karem 👋
      </p>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Próximas Sesiones -->
      <DashboardCard>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-serif font-semibold text-cafe flex items-center gap-2">
            <span class="text-2xl">📅</span>
            Próximas Sesiones
          </h2>
          <NuxtLink
            to="/terapeuta/agenda"
            class="text-sm text-terracota hover:text-cafe transition-colors"
          >
            Ver todas →
          </NuxtLink>
        </div>

        <div class="space-y-4">
          <div
            v-for="sesion in proximasSesiones"
            :key="sesion.id"
            class="p-4 bg-base-bg rounded-lg hover:bg-rosa/20 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-lg font-semibold text-cafe">
                    {{ sesion.hora }}
                  </span>
                  <span
                    class="px-2 py-0.5 text-xs rounded-full"
                    :class="sesion.tipo === 'Online' 
                      ? 'bg-terracota/20 text-terracota' 
                      : 'bg-green-100 text-green-700'"
                  >
                    {{ sesion.tipo }}
                  </span>
                </div>
                <p class="text-cafe font-medium">
                  {{ sesion.paciente }}
                </p>
                <p class="text-sm text-cafe/60 mt-1">
                  {{ sesion.modalidad }}
                </p>
              </div>
              <button
                @click="abrirDetalles(sesion.id)"
                class="px-3 py-1.5 text-sm bg-white border border-terracota/30 text-terracota hover:bg-terracota hover:text-white rounded-lg transition-colors"
              >
                Ver detalles
              </button>
            </div>
          </div>
        </div>
      </DashboardCard>

      <!-- Pacientes Activos -->
      <DashboardCard>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-serif font-semibold text-cafe flex items-center gap-2">
            <span class="text-2xl">👥</span>
            Pacientes Activos
          </h2>
          <NuxtLink
            to="/terapeuta/pacientes"
            class="text-sm text-terracota hover:text-cafe transition-colors"
          >
            Ver todos →
          </NuxtLink>
        </div>

        <div class="space-y-4">
          <div
            v-for="paciente in pacientesActivos"
            :key="paciente.id"
            class="p-4 bg-base-bg rounded-lg hover:bg-rosa/20 transition-colors"
          >
            <div class="flex items-start gap-4">
              <!-- Avatar -->
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                :style="{ backgroundColor: paciente.avatarColor }"
              >
                {{ paciente.iniciales }}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-semibold text-cafe">
                    {{ paciente.nombre }}
                  </p>
                  <span class="text-xl">
                    {{ paciente.estadoEmocional }}
                  </span>
                </div>
                <p class="text-sm text-cafe/60">
                  Última sesión: {{ paciente.ultimaSesion }}
                </p>
                <div class="mt-2 flex items-center gap-2">
                  <div class="flex-1 bg-white rounded-full h-2">
                    <div
                      class="h-2 rounded-full transition-all"
                      :class="getBienestarColor(paciente.bienestar)"
                      :style="{ width: `${paciente.bienestar}%` }"
                    ></div>
                  </div>
                  <span class="text-xs text-cafe/60 w-12 text-right">
                    {{ paciente.bienestar }}%
                  </span>
                </div>
              </div>

              <!-- Action -->
              <NuxtLink
                :to="`/terapeuta/pacientes/${paciente.id}`"
                class="px-3 py-1.5 text-sm bg-white border border-terracota/30 text-terracota hover:bg-terracota hover:text-white rounded-lg transition-colors flex-shrink-0"
              >
                Ver perfil
              </NuxtLink>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>

    <!-- Resumen General -->
    <DashboardCard>
      <h2 class="text-xl font-serif font-semibold text-cafe flex items-center gap-2 mb-6">
        <span class="text-2xl">📈</span>
        Resumen General
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Promedio de Bienestar -->
        <div class="p-5 bg-gradient-to-br from-terracota/10 to-rosa/20 rounded-xl">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-cafe/70">
              Bienestar Promedio
            </span>
            <span class="text-2xl">😊</span>
          </div>
          <div class="flex items-end gap-2">
            <span class="text-3xl font-bold text-cafe">
              {{ resumen.bienestarPromedio }}%
            </span>
            <span class="text-sm text-green-600 mb-1 flex items-center">
              ↑ +3%
            </span>
          </div>
          <div class="mt-3 w-full bg-white rounded-full h-2.5">
            <div
              class="h-2.5 rounded-full bg-gradient-to-r from-terracota to-green-500"
              :style="{ width: `${resumen.bienestarPromedio}%` }"
            ></div>
          </div>
          <p class="text-xs text-cafe/60 mt-2">
            Basado en {{ resumen.totalPacientes }} pacientes activos
          </p>
        </div>

        <!-- Tasa de Asistencia -->
        <div class="p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-cafe/70">
              Tasa de Asistencia
            </span>
            <span class="text-2xl">✅</span>
          </div>
          <div class="flex items-end gap-2">
            <span class="text-3xl font-bold text-cafe">
              {{ resumen.tasaAsistencia }}%
            </span>
            <span class="text-sm text-green-600 mb-1 flex items-center">
              ↑ +5%
            </span>
          </div>
          <div class="mt-3 w-full bg-white rounded-full h-2.5">
            <div
              class="h-2.5 rounded-full bg-green-500"
              :style="{ width: `${resumen.tasaAsistencia}%` }"
            ></div>
          </div>
          <p class="text-xs text-cafe/60 mt-2">
            {{ resumen.sesionesCompletadas }} de {{ resumen.sesionesTotales }} sesiones este mes
          </p>
        </div>

        <!-- Alertas Recientes -->
        <div class="p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-cafe/70">
              Alertas Recientes
            </span>
            <span class="text-2xl">⚠️</span>
          </div>
          <div class="flex items-end gap-2">
            <span class="text-3xl font-bold text-cafe">
              {{ resumen.alertas }}
            </span>
            <span class="text-sm text-cafe/60 mb-1">
              alertas
            </span>
          </div>
          <div class="mt-3 space-y-2">
            <div
              v-for="(alerta, index) in resumen.detallesAlertas"
              :key="index"
              class="text-xs text-cafe/70 flex items-start gap-2"
            >
              <span class="text-orange-500 mt-0.5">•</span>
              <span>{{ alerta }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-6 pt-6 border-t border-gray-100">
        <h3 class="text-sm font-semibold text-cafe/70 mb-4">
          Acciones Rápidas
        </h3>
        <div class="flex flex-wrap gap-3">
          <button
            class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors text-sm font-medium"
          >
            + Nueva Sesión
          </button>
          <button
            class="px-4 py-2 bg-white border border-terracota/30 text-terracota rounded-lg hover:bg-terracota/5 transition-colors text-sm font-medium"
          >
            + Añadir Paciente
          </button>
          <button
            class="px-4 py-2 bg-white border border-terracota/30 text-terracota rounded-lg hover:bg-terracota/5 transition-colors text-sm font-medium"
          >
            📊 Ver Reportes
          </button>
          <button
            class="px-4 py-2 bg-white border border-terracota/30 text-terracota rounded-lg hover:bg-terracota/5 transition-colors text-sm font-medium"
          >
            📝 Notas Clínicas
          </button>
        </div>
      </div>
    </DashboardCard>

    <!-- Modal de Detalles de Cita -->
    <ModalDetallesCita
      :is-open="modalDetallesAbierto"
      :cita-id="citaSeleccionada"
      @close="cerrarModalDetalles"
    />
  </main>
</template>

<script setup lang="ts">
import { useCitas } from '~/composables/useCitas'

definePageMeta({
  layout: 'terapeuta'
})

// Composables
const { getCitas } = useCitas()
const user = useSupabaseUser()

// Estado
const cargandoCitas = ref(true)
const proximasSesiones = ref<any[]>([])
const modalDetallesAbierto = ref(false)
const citaSeleccionada = ref<string | null>(null)

// Funciones para el modal
const abrirDetalles = (citaId: string) => {
  citaSeleccionada.value = citaId
  modalDetallesAbierto.value = true
}

const cerrarModalDetalles = () => {
  modalDetallesAbierto.value = false
  citaSeleccionada.value = null
}

// Cargar próximas citas (hoy y próximos 7 días)
async function cargarProximasCitas() {
  cargandoCitas.value = true
  try {
    const citas = await getCitas()
    
    const hoy = new Date()
    const en7Dias = new Date(hoy)
    en7Dias.setDate(en7Dias.getDate() + 7)
    
    // Filtrar solo próximas citas (pendiente/confirmada) de hoy y próximos 7 días
    const citasProximas = citas
      .filter((c: any) => {
        const fechaCita = new Date(c.fecha_cita)
        const estadoValido = ['pendiente', 'confirmada'].includes(c.estado)
        const esProxima = fechaCita >= hoy && fechaCita <= en7Dias
        return estadoValido && esProxima
      })
      .sort((a: any, b: any) => {
        const fechaA = new Date(`${a.fecha_cita}T${a.hora_inicio}`)
        const fechaB = new Date(`${b.fecha_cita}T${b.hora_inicio}`)
        return fechaA.getTime() - fechaB.getTime()
      })
      .slice(0, 3) // Solo las 3 próximas
    
    proximasSesiones.value = citasProximas.map((c: any) => ({
      id: c.id,
      hora: c.hora_inicio.substring(0, 5), // HH:MM
      paciente: c.pacientes?.metadata?.nombre_completo || c.pacientes?.email || 'Paciente',
      tipo: c.modalidad === 'presencial' ? 'Presencial' : c.modalidad === 'online' ? 'Online' : 'Telefónica',
      modalidad: c.observaciones || 'Sesión terapéutica',
      fecha: c.fecha_cita
    }))
  } catch (error) {
    console.error('Error al cargar próximas citas:', error)
    // Si hay error, mostrar array vacío en lugar de datos simulados
    proximasSesiones.value = []
  } finally {
    cargandoCitas.value = false
  }
}

// Lifecycle
onMounted(async () => {
  if (user.value) {
    await cargarProximasCitas()
  }
})

// Datos simulados - Pacientes Activos
const pacientesActivos = ref([
  {
    id: 1,
    nombre: 'María González',
    iniciales: 'MG',
    avatarColor: '#D8AFA0',
    estadoEmocional: '😊',
    ultimaSesion: 'Hace 3 días',
    bienestar: 78
  },
  {
    id: 2,
    nombre: 'Carlos Mendoza',
    iniciales: 'CM',
    avatarColor: '#B7C6B0',
    estadoEmocional: '😔',
    ultimaSesion: 'Hace 1 semana',
    bienestar: 45
  },
  {
    id: 3,
    nombre: 'Ana Rodríguez',
    iniciales: 'AR',
    avatarColor: '#C89B8A',
    estadoEmocional: '😊',
    ultimaSesion: 'Ayer',
    bienestar: 82
  }
])

// Datos simulados - Resumen General
const resumen = ref({
  bienestarPromedio: 68,
  totalPacientes: 12,
  tasaAsistencia: 92,
  sesionesCompletadas: 23,
  sesionesTotales: 25,
  alertas: 2,
  detallesAlertas: [
    '2 pacientes con tendencia emocional baja',
    '1 sesión pendiente de confirmar'
  ]
})

// Helper function para el color de bienestar
const getBienestarColor = (valor: number) => {
  if (valor >= 70) return 'bg-green-500'
  if (valor >= 50) return 'bg-yellow-500'
  return 'bg-orange-500'
}
</script>

<style scoped>
/* Animaciones suaves */
.hover\:bg-rosa\/20:hover {
  transition: background-color 0.2s ease;
}
</style>
