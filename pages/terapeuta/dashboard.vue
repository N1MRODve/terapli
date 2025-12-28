<template>
  <div class="dashboard-terapeuta min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- ================================================================= -->
      <!-- HEADER -->
      <!-- ================================================================= -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p class="text-gray-500 mt-1">
            Bienvenida de nuevo, <span class="font-medium text-gray-700">{{ terapeuta?.nombre || 'Karem' }}</span>
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="navegarANuevaCita"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Cita
          </button>
          <button
            @click="navegarANuevoPaciente"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-600 rounded-lg font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Nuevo Paciente
          </button>
        </div>
      </header>

      <!-- ================================================================= -->
      <!-- GRID PRINCIPAL -->
      <!-- ================================================================= -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        <!-- =============================================================== -->
        <!-- COLUMNA IZQUIERDA: Proximas Sesiones (2/3 del ancho) -->
        <!-- =============================================================== -->
        <section class="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <!-- Header de seccion -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Proximas Sesiones</h2>
                <p class="text-sm text-gray-500">{{ fechaHoy }}</p>
              </div>
            </div>
            <NuxtLink
              to="/terapeuta/agenda"
              class="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              Ver agenda
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>

          <!-- Lista de sesiones -->
          <div class="p-4">
            <!-- Loading -->
            <div v-if="cargandoSesiones" class="flex flex-col items-center justify-center py-12">
              <div class="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-3"></div>
              <p class="text-sm text-gray-500">Cargando sesiones...</p>
            </div>

            <!-- Empty state -->
            <div v-else-if="proximasSesiones.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
              <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="text-gray-600 font-medium">No hay sesiones programadas</p>
              <p class="text-sm text-gray-400 mt-1">Las próximas citas aparecerán aquí</p>
              <button
                @click="navegarANuevaCita"
                class="mt-4 px-4 py-2 text-sm font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
              >
                + Agendar una cita
              </button>
            </div>

            <!-- Lista de citas -->
            <div v-else class="space-y-3">
              <DashboardSessionCard
                v-for="(cita, index) in sesionesVisibles"
                :key="cita.id"
                :id="cita.id"
                :fecha="cita.fecha_cita"
                :hora="cita.hora_inicio"
                :paciente-nombre="cita.paciente_nombre"
                :modalidad="cita.modalidad"
                :estado="cita.estado"
                :is-next="index === 0"
                @click="abrirDetalles"
                @confirmar="confirmarCitaRapido"
              />

              <!-- Botón ver más -->
              <button
                v-if="proximasSesiones.length > 5 && !mostrarTodasSesiones"
                @click="mostrarTodasSesiones = true"
                class="w-full py-3 text-sm font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>Ver {{ proximasSesiones.length - 5 }} sesiones más</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Botón mostrar menos -->
              <button
                v-if="mostrarTodasSesiones && proximasSesiones.length > 5"
                @click="mostrarTodasSesiones = false"
                class="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>Mostrar menos</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <!-- =============================================================== -->
        <!-- COLUMNA DERECHA: Pacientes Activos (1/3 del ancho) -->
        <!-- =============================================================== -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <!-- Header de sección -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">Pacientes</h2>
            </div>
            <NuxtLink
              to="/terapeuta/pacientes"
              class="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              Ver todos
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>

          <!-- Lista de pacientes -->
          <div class="p-4">
            <!-- Loading -->
            <div v-if="cargandoPacientes" class="flex flex-col items-center justify-center py-8">
              <div class="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-2"></div>
              <p class="text-sm text-gray-500">Cargando...</p>
            </div>

            <!-- Empty state -->
            <div v-else-if="pacientesActivos.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
              <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p class="text-gray-500 text-sm">Sin pacientes activos</p>
            </div>

            <!-- Lista -->
            <div v-else class="space-y-3">
              <DashboardPatientCard
                v-for="paciente in pacientesActivos"
                :key="paciente.id"
                :id="paciente.id"
                :nombre="paciente.nombre_completo"
                :ultima-sesion="paciente.ultima_sesion"
                :sesiones-usadas="paciente.sesiones_usadas"
                :sesiones-totales="paciente.sesiones_totales"
                :estado-bono="paciente.estado_bono"
                @click="navegarAPaciente"
              />
            </div>
          </div>
        </section>
      </div>

      <!-- ================================================================= -->
      <!-- FILA INTERMEDIA: Pagos Hoy + Recordatorios -->
      <!-- ================================================================= -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-8">

        <!-- =============================================================== -->
        <!-- PAGOS HOY (1/2 del ancho) -->
        <!-- =============================================================== -->
        <DashboardPaymentsTodayCard
          ref="paymentsTodayCardRef"
          @abrir-cita="abrirDetalles"
        />

        <!-- =============================================================== -->
        <!-- RECORDATORIOS (1/2 del ancho) -->
        <!-- =============================================================== -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">Recordatorios</h2>
            </div>
            <button
              v-if="!cargandoRecordatorios"
              @click="generarRecordatorios"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Actualizar recordatorios"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <!-- Lista de recordatorios -->
          <div class="p-4">
            <!-- Loading -->
            <div v-if="cargandoRecordatorios" class="flex flex-col items-center justify-center py-8">
              <div class="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-2"></div>
              <p class="text-sm text-gray-500">Cargando...</p>
            </div>

            <!-- Empty state -->
            <div v-else-if="recordatoriosOrdenados.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
              <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="text-gray-600 font-medium">Todo al día</p>
              <p class="text-sm text-gray-400 mt-1">No hay recordatorios pendientes</p>
            </div>

            <!-- Lista -->
            <div v-else class="space-y-2">
              <DashboardReminderCard
                v-for="(recordatorio, index) in recordatoriosVisibles"
                :key="recordatorio.id || index"
                :id="recordatorio.id"
                :tipo="recordatorio.tipo"
                :mensaje="recordatorio.mensaje"
                :paciente="recordatorio.paciente"
                :fecha="recordatorio.fecha"
                :hora="recordatorio.hora"
                :urgente="recordatorio.urgente"
                :accion="recordatorio.accion"
                @accion="handleRecordatorioAccion"
              />

              <!-- Ver más recordatorios -->
              <button
                v-if="recordatoriosOrdenados.length > 4"
                @click="mostrarTodosRecordatorios = !mostrarTodosRecordatorios"
                class="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {{ mostrarTodosRecordatorios ? 'Mostrar menos' : `Ver ${recordatoriosOrdenados.length - 4} más` }}
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- ================================================================= -->
      <!-- FILA INFERIOR: Analítica del Profesional -->
      <!-- ================================================================= -->
      <div class="mt-8">
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <!-- Header -->
          <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900">Analítica del Profesional</h2>
          </div>

          <!-- Grid de métricas -->
          <div class="p-6">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardMetricCard
                :value="totalPacientes"
                label="Pacientes activos"
                icon-type="users"
              />
              <DashboardMetricCard
                :value="totalSesionesMes"
                label="Sesiones este mes"
                icon-type="calendar"
              />
              <DashboardMetricCard
                :value="`${porcentajeAsistencia}%`"
                label="Asistencia promedio"
                icon-type="check"
              />
              <DashboardMetricCard
                :value="`${formatearPrecio(totalConfirmado)}€`"
                label="Ingresos este mes"
                :sublabel="`${totalBonosPagados} ${totalBonosPagados === 1 ? 'pago' : 'pagos'}`"
                icon-type="euro"
                :highlight="true"
                to="/terapeuta/sesiones"
              />
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- MODAL DE DETALLES DE CITA -->
    <!-- ================================================================= -->
    <ModalDetallesCita
      :is-open="modalDetallesAbierto"
      :cita-id="citaSeleccionada"
      @close="cerrarModalDetalles"
      @cita-actualizada="cargarSesiones"
      @actualizado="cargarSesiones"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'terapeuta',
  middleware: ['auth-terapeuta']
})

// Composables y utilidades
const supabase = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()

// ============================================================================
// ESTADO PRINCIPAL
// ============================================================================

const terapeuta = ref<any>(null)
const cargandoSesiones = ref(true)
const cargandoPacientes = ref(true)
const proximasSesiones = ref<any[]>([])
const pacientesActivos = ref<any[]>([])
const totalPacientes = ref(0)
const totalSesionesMes = ref(0)
const porcentajeAsistencia = ref(0)
const modalDetallesAbierto = ref(false)
const citaSeleccionada = ref<string | null>(null)
const mostrarTodasSesiones = ref(false)
const mostrarTodosRecordatorios = ref(false)

// Referencia al componente de pagos del día
const paymentsTodayCardRef = ref<{ refrescar: () => Promise<void> } | null>(null)

// Estado de pagos confirmados
const totalConfirmado = ref(0)
const totalBonosPagados = ref(0)

// Recordatorios - ahora usamos objetos estructurados con fechas reales
interface Recordatorio {
  id: string
  tipo: 'confirmacion' | 'pago' | 'clinico' | 'bono' | 'general'
  mensaje: string
  paciente?: string
  fechaCita?: string  // YYYY-MM-DD
  horaCita?: string   // HH:MM
  accion?: 'confirmar' | 'ver' | 'pagar'
}
const recordatoriosRaw = ref<Recordatorio[]>([])
const cargandoRecordatorios = ref(true)

// ============================================================================
// COMPUTED
// ============================================================================

// Fecha de hoy formateada
const fechaHoy = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
})

// Sesiones visibles (con límite o todas)
const sesionesVisibles = computed(() => {
  if (mostrarTodasSesiones.value) {
    return proximasSesiones.value
  }
  return proximasSesiones.value.slice(0, 5)
})

// ============================================================================
// FUNCIONES HELPER PARA FECHAS RELATIVAS Y URGENCIA
// ============================================================================

/**
 * Calcula si dos fechas son el mismo día
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

/**
 * Calcula si una fecha es mañana respecto a otra
 */
function isTomorrow(targetDate: Date, referenceDate: Date): boolean {
  const tomorrow = new Date(referenceDate)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return isSameDay(targetDate, tomorrow)
}

/**
 * Obtiene el nombre del día de la semana en español
 */
function getDayName(date: Date): string {
  return date.toLocaleDateString('es-ES', { weekday: 'long' })
}

/**
 * Formatea una fecha como "27 dic"
 */
function formatShortDate(date: Date): string {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

/**
 * Calcula la fecha/hora relativa para mostrar en la UI
 * @param fechaCita - Fecha en formato YYYY-MM-DD
 * @param horaCita - Hora en formato HH:MM
 * @returns String con formato relativo: "Hoy 13:00", "Mañana 10:00", "Lunes 15:00", "27 dic 09:00"
 */
function getRelativeDateTime(fechaCita: string, horaCita: string): string {
  const now = new Date()
  const appointmentDate = new Date(`${fechaCita}T${horaCita}:00`)

  const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  // Mismo día (hoy)
  if (isSameDay(appointmentDate, now)) {
    return `Hoy ${horaCita}`
  }

  // Mañana
  if (isTomorrow(appointmentDate, now)) {
    return `Mañana ${horaCita}`
  }

  // Próximos 6 días (mostrar nombre del día)
  if (hoursDiff > 0 && hoursDiff < 7 * 24) {
    const dayName = getDayName(appointmentDate)
    // Capitalizar primera letra
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${horaCita}`
  }

  // Más de 7 días
  return `${formatShortDate(appointmentDate)} ${horaCita}`
}

/**
 * Detecta si un recordatorio de cita pendiente es urgente (<24h para la cita)
 * @param fechaCita - Fecha en formato YYYY-MM-DD
 * @param horaCita - Hora en formato HH:MM
 * @returns true si faltan menos de 24 horas para la cita
 */
function isUrgent(fechaCita?: string, horaCita?: string): boolean {
  if (!fechaCita || !horaCita) return false

  const now = new Date()
  const appointmentDate = new Date(`${fechaCita}T${horaCita}:00`)
  const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  // Urgente si es en el futuro y faltan menos de 24 horas
  return hoursDiff > 0 && hoursDiff < 24
}

// Recordatorios formateados con fechas relativas y urgencia
const recordatoriosFormateados = computed(() => {
  return recordatoriosRaw.value.map(rec => {
    // Calcular fecha relativa y urgencia para citas pendientes
    let fechaRelativa = rec.fechaCita && rec.horaCita
      ? getRelativeDateTime(rec.fechaCita, rec.horaCita)
      : undefined

    let urgente = rec.tipo === 'confirmacion' && isUrgent(rec.fechaCita, rec.horaCita)

    // Separar fecha y hora del string relativo para el componente
    let fecha = ''
    let hora = ''
    if (fechaRelativa) {
      const parts = fechaRelativa.split(' ')
      hora = parts.pop() || ''
      fecha = parts.join(' ')
    }

    return {
      id: rec.id,
      tipo: rec.tipo,
      mensaje: rec.mensaje,
      paciente: rec.paciente,
      fecha,
      hora,
      urgente,
      accion: rec.accion
    }
  })
})

// Recordatorios ordenados por urgencia y cercanía temporal
const recordatoriosOrdenados = computed(() => {
  return [...recordatoriosFormateados.value].sort((a, b) => {
    // Urgentes primero
    if (a.urgente && !b.urgente) return -1
    if (!a.urgente && b.urgente) return 1

    // Luego los que tienen fecha/hora (citas) van antes que los que no
    const aHasDate = a.fecha || a.hora
    const bHasDate = b.fecha || b.hora
    if (aHasDate && !bHasDate) return -1
    if (!aHasDate && bHasDate) return 1

    return 0
  })
})

// Recordatorios visibles (con límite)
const recordatoriosVisibles = computed(() => {
  if (mostrarTodosRecordatorios.value) {
    return recordatoriosOrdenados.value
  }
  return recordatoriosOrdenados.value.slice(0, 4)
})

// ============================================================================
// FUNCIONES DE NAVEGACIÓN
// ============================================================================

const navegarANuevaCita = () => {
  router.push('/terapeuta/agenda')
}

const navegarANuevoPaciente = () => {
  router.push('/terapeuta/pacientes')
}

const navegarAPaciente = (id: string) => {
  router.push(`/terapeuta/pacientes/${id}`)
}

// ============================================================================
// FUNCIONES DE MODAL
// ============================================================================

const abrirDetalles = (citaId: string) => {
  citaSeleccionada.value = citaId
  modalDetallesAbierto.value = true
}

const cerrarModalDetalles = () => {
  modalDetallesAbierto.value = false
  citaSeleccionada.value = null
  // Refrescar sesiones al cerrar el modal por si hubo cambios
  cargarSesiones()
}

// ============================================================================
// CONFIRMACIÓN RÁPIDA DE CITA
// ============================================================================

const confirmarCitaRapido = async (citaId: string) => {
  try {
    const { error } = await supabase
      .from('citas')
      .update({
        estado: 'confirmada',
        updated_at: new Date().toISOString()
      })
      .eq('id', citaId)

    if (error) throw error

    // Actualizar estado local
    const index = proximasSesiones.value.findIndex(c => c.id === citaId)
    if (index !== -1) {
      proximasSesiones.value[index].estado = 'confirmada'
    }

    // Recargar recordatorios
    await generarRecordatorios()
  } catch (error) {
    console.error('Error al confirmar cita:', error)
    alert('Error al confirmar la cita')
  }
}

// ============================================================================
// CARGAR DATOS DESDE SUPABASE
// ============================================================================

async function cargarPerfilTerapeuta() {
  try {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      terapeuta.value = {
        nombre: profile?.metadata?.nombre || 'Karem',
        email: data.user.email
      }
    }
  } catch (error) {
    console.error('Error al cargar perfil:', error)
    terapeuta.value = { nombre: 'Karem' }
  }
}

async function cargarSesiones() {
  cargandoSesiones.value = true
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const en7Dias = new Date(hoy)
    en7Dias.setDate(en7Dias.getDate() + 7)

    const { data, error } = await supabase
      .from('citas')
      .select(`
        id,
        paciente_id,
        fecha_cita,
        hora_inicio,
        modalidad,
        estado,
        observaciones,
        pacientes (
          id,
          nombre_completo,
          email
        )
      `)
      .in('estado', ['pendiente', 'confirmada'])
      .gte('fecha_cita', hoy.toISOString().split('T')[0])
      .lte('fecha_cita', en7Dias.toISOString().split('T')[0])
      .order('fecha_cita', { ascending: true })
      .order('hora_inicio', { ascending: true })

    if (error) throw error

    proximasSesiones.value = (data || []).map((c: any) => ({
      id: c.id,
      fecha_cita: c.fecha_cita,
      hora_inicio: c.hora_inicio ? c.hora_inicio.substring(0, 5) : '--:--',
      paciente_nombre: c.pacientes?.nombre_completo || c.pacientes?.email || 'Paciente',
      modalidad: c.modalidad || 'presencial',
      estado: c.estado || 'pendiente',
      observaciones: c.observaciones
    }))
  } catch (error) {
    console.error('Error al cargar sesiones:', error)
    proximasSesiones.value = []
  } finally {
    cargandoSesiones.value = false
  }
}

async function cargarPacientes() {
  cargandoPacientes.value = true
  try {
    // Primero obtener pacientes
    const { data: pacientesData, error } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, area_de_acompanamiento, updated_at, metadata')
      .eq('activo', true)
      .order('updated_at', { ascending: false })
      .limit(5)

    if (error) throw error

    // Para cada paciente, intentar obtener información de su bono activo
    const pacientesConBonos = await Promise.all(
      (pacientesData || []).map(async (p: any) => {
        let sesionesUsadas = 0
        let sesionesTotales = 0
        let estadoBono: 'activo' | 'por_agotar' | 'sin_bono' | 'agotado' = 'sin_bono'

        try {
          const { data: bonoData } = await supabase
            .from('bonos')
            .select('sesiones_totales, sesiones_restantes, estado')
            .eq('paciente_id', p.id)
            .eq('estado', 'activo')
            .single()

          if (bonoData) {
            sesionesTotales = bonoData.sesiones_totales || 0
            sesionesUsadas = sesionesTotales - (bonoData.sesiones_restantes || 0)

            if (bonoData.sesiones_restantes <= 0) {
              estadoBono = 'agotado'
            } else if (bonoData.sesiones_restantes <= 2) {
              estadoBono = 'por_agotar'
            } else {
              estadoBono = 'activo'
            }
          }
        } catch (err) {
          // Si no hay bono, mantener valores por defecto
        }

        return {
          id: p.id,
          nombre_completo: p.nombre_completo || 'Sin nombre',
          ultima_sesion: p.updated_at,
          sesiones_usadas: sesionesUsadas,
          sesiones_totales: sesionesTotales,
          estado_bono: estadoBono
        }
      })
    )

    pacientesActivos.value = pacientesConBonos
  } catch (error) {
    console.error('Error al cargar pacientes:', error)
    pacientesActivos.value = []
  } finally {
    cargandoPacientes.value = false
  }
}

async function cargarMetricas() {
  try {
    // Total pacientes activos
    const { count: countPacientes } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)

    totalPacientes.value = countPacientes || 0

    // Sesiones del mes actual
    const primerDiaMes = new Date()
    primerDiaMes.setDate(1)
    primerDiaMes.setHours(0, 0, 0, 0)

    const { count: countSesiones } = await supabase
      .from('citas')
      .select('*', { count: 'exact', head: true })
      .gte('fecha_cita', primerDiaMes.toISOString().split('T')[0])

    totalSesionesMes.value = countSesiones || 0

    // Porcentaje de asistencia (calculado real)
    const { data: citasRealizadas } = await supabase
      .from('citas')
      .select('estado')
      .gte('fecha_cita', primerDiaMes.toISOString().split('T')[0])
      .in('estado', ['realizada', 'completada', 'cancelada'])

    if (citasRealizadas && citasRealizadas.length > 0) {
      const realizadas = citasRealizadas.filter(c => c.estado === 'realizada' || c.estado === 'completada').length
      porcentajeAsistencia.value = Math.round((realizadas / citasRealizadas.length) * 100)
    } else {
      porcentajeAsistencia.value = 0
    }
  } catch (error) {
    console.error('Error al cargar métricas:', error)
  }
}

async function generarRecordatorios() {
  cargandoRecordatorios.value = true
  const nuevos: Recordatorio[] = []

  try {
    const ahora = new Date()
    const hoy = new Date(ahora)
    hoy.setHours(0, 0, 0, 0)
    const fechaHoyStr = hoy.toISOString().split('T')[0]

    // Fecha límite: próximos 3 días para buscar citas pendientes
    const en3Dias = new Date(hoy)
    en3Dias.setDate(hoy.getDate() + 3)
    const fechaEn3DiasStr = en3Dias.toISOString().split('T')[0]

    // 1. Citas pendientes de confirmación (HOY y próximos días)
    // IMPORTANTE: Incluimos citas de HOY, no solo de mañana
    const { data: citasPendientes } = await supabase
      .from('citas')
      .select(`
        id,
        fecha_cita,
        hora_inicio,
        pacientes (
          nombre_completo
        )
      `)
      .eq('estado', 'pendiente')
      .gte('fecha_cita', fechaHoyStr)
      .lte('fecha_cita', fechaEn3DiasStr)
      .order('fecha_cita', { ascending: true })
      .order('hora_inicio', { ascending: true })

    citasPendientes?.forEach((cita: any) => {
      const horaCita = cita.hora_inicio?.substring(0, 5) || '00:00'
      const fechaCita = cita.fecha_cita

      // Filtrar citas que ya pasaron hoy
      if (fechaCita === fechaHoyStr) {
        const [hours, minutes] = horaCita.split(':').map(Number)
        const citaDateTime = new Date(ahora)
        citaDateTime.setHours(hours, minutes, 0, 0)
        if (citaDateTime < ahora) {
          return // Cita ya pasó, no mostrar
        }
      }

      nuevos.push({
        id: cita.id,
        tipo: 'confirmacion',
        mensaje: `Confirmar cita de ${cita.pacientes?.nombre_completo || 'paciente'}`,
        paciente: cita.pacientes?.nombre_completo || 'Paciente',
        fechaCita: fechaCita,
        horaCita: horaCita,
        accion: 'confirmar'
      })
    })

    // 2. Citas pasadas no completadas
    const { data: citasAtrasadas } = await supabase
      .from('citas')
      .select(`
        id,
        fecha_cita,
        hora_inicio,
        pacientes (
          nombre_completo
        )
      `)
      .lt('fecha_cita', fechaHoyStr)
      .neq('estado', 'completada')
      .neq('estado', 'cancelada')
      .neq('estado', 'realizada')
      .order('fecha_cita', { ascending: false })
      .limit(3)

    citasAtrasadas?.forEach((cita: any) => {
      const fecha = new Date(cita.fecha_cita).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      })
      nuevos.push({
        id: cita.id,
        tipo: 'clinico',
        mensaje: `Revisa la sesión pendiente de ${cita.pacientes?.nombre_completo || 'paciente'} del ${fecha}`,
        paciente: cita.pacientes?.nombre_completo || 'Paciente',
        accion: 'ver'
      })
    })

    // 3. Bonos próximos a agotarse
    const { data: bonos } = await supabase
      .from('bonos')
      .select(`
        id,
        sesiones_restantes,
        pacientes (
          nombre_completo
        )
      `)
      .eq('estado', 'activo')
      .lte('sesiones_restantes', 2)
      .gt('sesiones_restantes', 0)
      .limit(3)

    bonos?.forEach((bono: any) => {
      nuevos.push({
        id: bono.id,
        tipo: 'bono',
        mensaje: `El bono está por agotarse (quedan ${bono.sesiones_restantes} sesiones)`,
        paciente: bono.pacientes?.nombre_completo || 'Paciente',
        accion: 'ver'
      })
    })

    // Limitar a máximo 8 recordatorios (más espacio para citas urgentes)
    recordatoriosRaw.value = nuevos.slice(0, 8)
  } catch (error) {
    console.error('Error al generar recordatorios:', error)
    recordatoriosRaw.value = []
  } finally {
    cargandoRecordatorios.value = false
  }
}

// ============================================================================
// CARGAR PAGOS CONFIRMADOS
// ============================================================================

async function cargarPagosConfirmados() {
  try {
    if (!user.value?.email) return

    const { data: terapeutaData } = await supabase
      .from('terapeutas')
      .select('id, porcentaje_comision')
      .eq('email', user.value.email)
      .single()

    if (!terapeutaData) return

    // Porcentaje que recibe el terapeuta (default 70% si comision es 30%)
    const porcentajeComision = terapeutaData.porcentaje_comision || 30
    const porcentajeTerapeuta = (100 - porcentajeComision) / 100

    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id')
      .eq('terapeuta_id', terapeutaData.id)

    if (!pacientes || pacientes.length === 0) {
      totalConfirmado.value = 0
      totalBonosPagados.value = 0
      return
    }

    const pacienteIds = pacientes.map((p: any) => p.id)

    // 1. Obtener pagos de bonos
    const { data: bonos } = await supabase
      .from('bonos')
      .select('id, monto_total')
      .eq('pagado', true)
      .in('paciente_id', pacienteIds)

    let montoBonos = 0
    let cantidadBonos = 0
    if (bonos && bonos.length > 0) {
      cantidadBonos = bonos.length
      montoBonos = bonos.reduce((sum: number, bono: any) => sum + (bono.monto_total || 0), 0)
    }

    // 2. Obtener pagos de sesiones individuales (nuevo sistema)
    const primerDiaMes = new Date()
    primerDiaMes.setDate(1)
    primerDiaMes.setHours(0, 0, 0, 0)

    const { data: sesionesPagadas } = await supabase
      .from('citas')
      .select('id, precio_sesion')
      .eq('estado_pago', 'pagado')
      .in('paciente_id', pacienteIds)
      .gte('fecha_pago', primerDiaMes.toISOString())

    let montoSesiones = 0
    let cantidadSesiones = 0
    if (sesionesPagadas && sesionesPagadas.length > 0) {
      cantidadSesiones = sesionesPagadas.length
      montoSesiones = sesionesPagadas.reduce((sum: number, cita: any) => sum + (cita.precio_sesion || 0), 0)
    }

    // Calcular total (aplicando porcentaje del terapeuta)
    const montoTotalBruto = montoBonos + montoSesiones
    totalConfirmado.value = montoTotalBruto * porcentajeTerapeuta
    totalBonosPagados.value = cantidadBonos + cantidadSesiones // Mostrar total de pagos

  } catch (error) {
    console.error('Error al cargar pagos confirmados:', error)
    totalConfirmado.value = 0
    totalBonosPagados.value = 0
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

const formatearPrecio = (precio: number) => {
  return precio.toFixed(2)
}

// Handler para acciones de recordatorios
const handleRecordatorioAccion = async (payload: { id?: string; tipo: string; accion?: string }) => {
  if (payload.tipo === 'confirmacion' && payload.accion === 'confirmar' && payload.id) {
    // Confirmar la cita directamente usando su ID
    await confirmarCitaRapido(payload.id)
    // Recargar recordatorios para actualizar la lista
    await generarRecordatorios()
  } else if (payload.tipo === 'clinico' && payload.id) {
    // Abrir modal de detalles de la cita
    abrirDetalles(payload.id)
  }
  // Otros tipos de acciones pueden ser manejados aquí
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

onMounted(async () => {
  await cargarPerfilTerapeuta()
  await cargarSesiones()
  await cargarPacientes()
  await cargarMetricas()
  await cargarPagosConfirmados()
  await generarRecordatorios()

  // Escuchar eventos de actualización de citas
  if (process.client) {
    window.addEventListener('citas:actualizadas', handleCitasActualizadas)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('citas:actualizadas', handleCitasActualizadas)
  }
})

// Handler para actualización en tiempo real
function handleCitasActualizadas(event: Event) {
  const customEvent = event as CustomEvent
  console.log('📡 [Dashboard] Evento recibido:', customEvent.detail)
  cargarSesiones()
}
</script>

<style scoped>
.dashboard-terapeuta {
  font-family: system-ui, -apple-system, sans-serif;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
