<script setup lang="ts">
// =============================================================================
// COMPONENTE: Agenda del Terapeuta
// =============================================================================
// Vista principal para que el terapeuta gestione sus citas y bonos

import { useAgenda } from '~/composables/useAgenda'
import { computed, ref } from 'vue'

// Composables
const {
  citas,
  loading,
  error,
  citasDelDia,
  citasPendientes,
  citasCompletadas,
  citasConBonoProximoAgotar,
  completarCita,
  getCitasDelTerapeuta,
  obtenerHistorialBono,
  verificarBonoCitas
} = useAgenda()

// Estado local
const filtroActivo = ref<'hoy' | 'pendientes' | 'todas' | 'completadas'>('hoy')
const mostrarModalHistorial = ref(false)
const bonoSeleccionado = ref<string | null>(null)
const historialBono = ref<any[]>([])
const verificacionBono = ref<any>(null)
const cargandoModal = ref(false)

// Citas filtradas según la vista activa
const citasFiltradas = computed(() => {
  switch (filtroActivo.value) {
    case 'hoy':
      return citasDelDia.value
    case 'pendientes':
      return citasPendientes.value
    case 'completadas':
      return citasCompletadas.value
    default:
      return citas.value
  }
})

// Formatear hora para mostrar
const formatearHora = (hora: string) => {
  return hora.substring(0, 5) // HH:MM
}

// Formatear fecha
const formatearFecha = (fecha: string) => {
  const date = new Date(fecha + 'T00:00:00')
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Clase CSS según estado
const claseEstado = (estado: string) => {
  const clases = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmada: 'bg-blue-100 text-blue-800 border-blue-300',
    completada: 'bg-green-100 text-green-800 border-green-300',
    realizada: 'bg-green-100 text-green-800 border-green-300',
    cancelada: 'bg-red-100 text-red-800 border-red-300'
  }
  return clases[estado as keyof typeof clases] || 'bg-gray-100 text-gray-800'
}

// Clase CSS según sesiones restantes
const claseSesionesRestantes = (sesiones: number) => {
  if (sesiones === 0) return 'text-red-600 font-bold'
  if (sesiones === 1) return 'text-orange-600 font-semibold'
  if (sesiones <= 2) return 'text-yellow-600 font-medium'
  return 'text-green-600'
}

// Manejar completar cita
const handleCompletarCita = async (citaId: string) => {
  if (!confirm('¿Estás seguro de marcar esta cita como completada?')) return

  try {
    const resultado = await completarCita(citaId)
    
    if (resultado.success) {
      console.log('✅ Cita completada')
    }
  } catch (error) {
    console.error('Error al completar cita:', error)
  }
}

// Abrir modal de historial
const abrirHistorial = async (bonoId: string) => {
  try {
    cargandoModal.value = true
    bonoSeleccionado.value = bonoId
    mostrarModalHistorial.value = true

    const [historial, verificacion] = await Promise.all([
      obtenerHistorialBono(bonoId),
      verificarBonoCitas(bonoId)
    ])

    historialBono.value = historial
    verificacionBono.value = verificacion
  } catch (error) {
    console.error('Error al cargar historial:', error)
  } finally {
    cargandoModal.value = false
  }
}

// Cerrar modal
const cerrarModal = () => {
  mostrarModalHistorial.value = false
  bonoSeleccionado.value = null
  historialBono.value = []
  verificacionBono.value = null
}

// Recargar citas manualmente
const recargarCitas = async () => {
  try {
    await getCitasDelTerapeuta()
  } catch (error) {
    console.error('Error al recargar citas:', error)
  }
}
</script>

<template>
  <div class="agenda-terapeuta p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Mi Agenda</h1>
      <p class="text-gray-600">Gestiona tus citas y sesiones</p>
    </div>

    <!-- Alertas de bonos próximos a agotarse -->
    <div
      v-if="citasConBonoProximoAgotar.length > 0"
      class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            <strong>⚠️ Atención:</strong> {{ citasConBonoProximoAgotar.length }} paciente(s) con pocas sesiones restantes
          </p>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="filtro in [
          { key: 'hoy', label: 'Hoy', count: citasDelDia.length },
          { key: 'pendientes', label: 'Pendientes', count: citasPendientes.length },
          { key: 'completadas', label: 'Completadas', count: citasCompletadas.length },
          { key: 'todas', label: 'Todas', count: citas.length }
        ]"
        :key="filtro.key"
        @click="filtroActivo = filtro.key as any"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-colors',
          filtroActivo === filtro.key
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        ]"
      >
        {{ filtro.label }} ({{ filtro.count }})
      </button>

      <button
        @click="recargarCitas"
        class="ml-auto px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        :disabled="loading"
      >
        <span v-if="loading">🔄 Cargando...</span>
        <span v-else>🔄 Actualizar</span>
      </button>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <p class="text-red-700">❌ {{ error }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading && citas.length === 0" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Cargando citas...</p>
    </div>

    <!-- Sin citas -->
    <div v-else-if="citasFiltradas.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ filtroActivo === 'hoy' ? 'No tienes citas programadas para hoy.' : 'No hay citas en esta categoría.' }}
      </p>
    </div>

    <!-- Lista de citas -->
    <div v-else class="space-y-4">
      <TarjetaCita
        v-for="cita in citasFiltradas"
        :key="cita.id"
        :cita="cita"
        @completar="handleCompletarCita"
        @ver-historial="abrirHistorial"
      />
    </div>

    <!-- Modal de Historial de Bono -->
    <Teleport to="body">
      <div
        v-if="mostrarModalHistorial"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="cerrarModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          <!-- Header del modal -->
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">Historial del Bono</h2>
            <button
              @click="cerrarModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Contenido del modal -->
          <div class="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div v-if="cargandoModal" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>

            <div v-else>
              <!-- Resumen del bono -->
              <div v-if="verificacionBono" class="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-3">Resumen</h3>
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p class="text-2xl font-bold text-blue-600">{{ verificacionBono.bono.sesiones_totales }}</p>
                    <p class="text-xs text-gray-600">Sesiones Totales</p>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-green-600">{{ verificacionBono.bono.sesiones_usadas }}</p>
                    <p class="text-xs text-gray-600">Sesiones Usadas</p>
                  </div>
                  <div>
                    <p :class="['text-2xl font-bold', claseSesionesRestantes(verificacionBono.bono.sesiones_restantes)]">
                      {{ verificacionBono.bono.sesiones_restantes }}
                    </p>
                    <p class="text-xs text-gray-600">Sesiones Restantes</p>
                  </div>
                </div>

                <div v-if="verificacionBono.alerta" class="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                  ⚠️ {{ verificacionBono.mensaje_alerta }}
                </div>
              </div>

              <!-- Movimientos -->
              <div>
                <h3 class="font-semibold text-gray-900 mb-3">Movimientos</h3>
                <div v-if="historialBono.length === 0" class="text-center py-8 text-gray-500">
                  No hay movimientos registrados
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="mov in historialBono"
                    :key="mov.id"
                    class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <span
                            :class="[
                              'px-2 py-1 text-xs font-medium rounded',
                              mov.tipo_movimiento === 'descuento' ? 'bg-red-100 text-red-700' :
                              mov.tipo_movimiento === 'reembolso' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            ]"
                          >
                            {{ mov.tipo_movimiento }}
                          </span>
                          <span class="text-xs text-gray-500">
                            {{ new Date(mov.fecha).toLocaleString('es-ES') }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-700">{{ mov.motivo }}</p>
                      </div>
                      <div class="text-right ml-4">
                        <p class="text-sm font-semibold text-gray-900">
                          {{ mov.sesiones_antes }} → {{ mov.sesiones_despues }}
                        </p>
                        <p :class="[
                          'text-xs font-medium',
                          mov.sesiones_modificadas > 0 ? 'text-red-600' : 'text-green-600'
                        ]">
                          {{ mov.sesiones_modificadas > 0 ? '-' : '+' }}{{ Math.abs(mov.sesiones_modificadas) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer del modal -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              @click="cerrarModal"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.agenda-terapeuta {
  min-height: 100vh;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
