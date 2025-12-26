<script setup lang="ts">
/**
 * =============================================================================
 * PÁGINA: Gestión de Pagos y Bonos - Coordinadora
 * =============================================================================
 * Vista unificada para gestión de pagos con:
 * - Header con título, búsqueda global y acciones
 * - Módulo de bonos pendientes de confirmar
 * - Historial de pagos confirmados
 *
 * Diseño coherente con el panel de coordinadora.
 */

definePageMeta({
  layout: 'coordinadora',
  middleware: ['auth', 'role-coordinadora']
})

import PagosHeader from '@/components/pagos/PagosHeader.vue'
import PagosPendientesModule from '@/components/pagos/PagosPendientesModule.vue'
import PagosHistorialModule from '@/components/pagos/PagosHistorialModule.vue'

// Supabase client
const supabase = useSupabaseClient()

// =============================================================================
// ESTADO
// =============================================================================

// Búsqueda global desde el header
const busquedaGlobal = ref('')

// Bonos pendientes
const cargandoPendientes = ref(true)
const bonosPendientes = ref<any[]>([])
const procesandoConfirmacion = ref(false)

// Bonos confirmados
const cargando = ref(true)
const bonosConfirmados = ref<any[]>([])
const totalConfirmado = ref(0)
const promedioPorBono = ref(0)
const mesSeleccionado = ref('')
const mesesDisponibles = ref<{ valor: string; nombre: string }[]>([])

// Modal de detalle
const modalDetalleAbierto = ref(false)
const bonoSeleccionado = ref<any>(null)

// =============================================================================
// COMPUTED
// =============================================================================

// Métricas para el header
const totalPendientes = computed(() => bonosPendientes.value.length)
const totalConfirmados = computed(() => bonosConfirmados.value.length)

// =============================================================================
// FUNCIONES DE UTILIDAD
// =============================================================================

const obtenerIniciales = (nombre: string) => {
  if (!nombre) return '?'
  const partes = nombre.split(' ')
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
}

const formatearPrecio = (valor: number) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor || 0)
}

const formatearFecha = (fecha: string) => {
  if (!fecha) return 'No especificada'
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// =============================================================================
// CARGA DE DATOS
// =============================================================================

// Cargar bonos pendientes
const cargarBonosPendientes = async () => {
  console.log('[Pagos] Cargando bonos pendientes...')

  try {
    cargandoPendientes.value = true

    if (!supabase) {
      console.error('[Pagos] Cliente Supabase no disponible')
      mostrarToast('Error: Cliente de base de datos no disponible', 'error')
      return
    }

    const { data: bonos, error: bonosError } = await supabase
      .from('bonos')
      .select('*')
      .eq('estado_pago', 'pendiente')
      .in('estado', ['activo', 'pendiente'])
      .order('created_at', { ascending: false })

    if (bonosError) {
      console.error('[Pagos] Error al cargar bonos pendientes:', bonosError)
      mostrarToast(`Error al cargar bonos pendientes: ${bonosError.message}`, 'error')
      return
    }

    if (!bonos || bonos.length === 0) {
      console.log('[Pagos] No hay bonos pendientes')
      bonosPendientes.value = []
      return
    }

    // Obtener datos de pacientes y terapeutas
    const pacienteIds = [...new Set(bonos.map(b => b.paciente_id).filter(Boolean))]

    let pacientesMap = new Map()
    let terapeutasMap = new Map()

    if (pacienteIds.length > 0) {
      const { data: pacientes } = await supabase
        .from('pacientes')
        .select('id, nombre_completo, email, terapeuta_id')
        .in('id', pacienteIds)

      if (pacientes) {
        pacientes.forEach(p => pacientesMap.set(p.id, p))

        const terapeutaIds = [...new Set(pacientes.map(p => p.terapeuta_id).filter(Boolean))]
        if (terapeutaIds.length > 0) {
          const { data: terapeutas } = await supabase
            .from('terapeutas')
            .select('id, nombre_completo')
            .in('id', terapeutaIds)

          if (terapeutas) {
            terapeutas.forEach(t => terapeutasMap.set(t.id, t))
          }
        }
      }
    }

    // Transformar datos
    bonosPendientes.value = bonos.map(bono => {
      const paciente = bono.paciente_id ? pacientesMap.get(bono.paciente_id) : null
      const terapeuta = paciente?.terapeuta_id ? terapeutasMap.get(paciente.terapeuta_id) : null

      return {
        id: bono.id,
        paciente_id: bono.paciente_id,
        paciente_nombre: paciente?.nombre_completo || 'Sin nombre',
        paciente_email: paciente?.email || null,
        terapeuta_nombre: terapeuta?.nombre_completo || null,
        sesiones_totales: Number(bono.sesiones_totales) || 0,
        sesiones_restantes: Number(bono.sesiones_restantes) || 0,
        monto_total: Number(bono.monto_total) || 0,
        tipo_bono: bono.tipo_bono || 'Bono Estándar',
        estado: bono.estado || 'pendiente',
        created_at: bono.created_at
      }
    })

    console.log(`[Pagos] ${bonosPendientes.value.length} bonos pendientes cargados`)

  } catch (error: any) {
    console.error('[Pagos] Error general:', error)
    mostrarToast(`Error al cargar bonos: ${error.message}`, 'error')
    bonosPendientes.value = []
  } finally {
    cargandoPendientes.value = false
  }
}

// Cargar bonos confirmados
const cargarBonosConfirmados = async () => {
  console.log('[Pagos] Cargando bonos confirmados...')

  try {
    cargando.value = true

    if (!supabase) {
      console.error('[Pagos] Cliente Supabase no disponible')
      return
    }

    let query = supabase
      .from('bonos')
      .select('*')
      .eq('estado_pago', 'pagado')
      .order('fecha_pago', { ascending: false })

    // Filtrar por mes si está seleccionado
    if (mesSeleccionado.value) {
      const [year, month] = mesSeleccionado.value.split('-')
      const yearNum = parseInt(year)
      const monthNum = parseInt(month)

      if (!isNaN(yearNum) && !isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        const fechaInicio = new Date(yearNum, monthNum - 1, 1)
        const fechaFin = new Date(yearNum, monthNum, 0, 23, 59, 59)

        query = query
          .gte('fecha_pago', fechaInicio.toISOString())
          .lte('fecha_pago', fechaFin.toISOString())
      }
    }

    const { data: bonos, error: bonosError } = await query

    if (bonosError) {
      console.error('[Pagos] Error al cargar bonos confirmados:', bonosError)
      mostrarToast(`Error al cargar historial: ${bonosError.message}`, 'error')
      return
    }

    if (!bonos || bonos.length === 0) {
      console.log('[Pagos] No hay bonos confirmados')
      bonosConfirmados.value = []
      totalConfirmado.value = 0
      promedioPorBono.value = 0
      return
    }

    // Obtener datos de pacientes y terapeutas
    const pacienteIds = [...new Set(bonos.map(b => b.paciente_id).filter(Boolean))]

    let pacientesMap = new Map()
    let terapeutasMap = new Map()

    if (pacienteIds.length > 0) {
      const { data: pacientes } = await supabase
        .from('pacientes')
        .select('id, nombre_completo, email, terapeuta_id')
        .in('id', pacienteIds)

      if (pacientes) {
        pacientes.forEach(p => pacientesMap.set(p.id, p))

        const terapeutaIds = [...new Set(pacientes.map(p => p.terapeuta_id).filter(Boolean))]
        if (terapeutaIds.length > 0) {
          const { data: terapeutas } = await supabase
            .from('terapeutas')
            .select('id, nombre_completo')
            .in('id', terapeutaIds)

          if (terapeutas) {
            terapeutas.forEach(t => terapeutasMap.set(t.id, t))
          }
        }
      }
    }

    // Transformar datos
    bonosConfirmados.value = bonos.map(bono => {
      const paciente = bono.paciente_id ? pacientesMap.get(bono.paciente_id) : null
      const terapeuta = paciente?.terapeuta_id ? terapeutasMap.get(paciente.terapeuta_id) : null

      return {
        id: bono.id,
        paciente_id: bono.paciente_id,
        paciente_nombre: paciente?.nombre_completo || 'Sin nombre',
        paciente_email: paciente?.email || null,
        terapeuta_nombre: terapeuta?.nombre_completo || null,
        sesiones_totales: Number(bono.sesiones_totales) || 0,
        sesiones_restantes: Number(bono.sesiones_restantes) || 0,
        monto_total: Number(bono.monto_total) || 0,
        tipo_bono: bono.tipo_bono || 'Bono Estándar',
        fecha_pago: bono.fecha_pago,
        metodo_pago: bono.metodo_pago || 'No especificado'
      }
    })

    // Calcular totales
    totalConfirmado.value = bonosConfirmados.value.reduce((sum, bono) => sum + bono.monto_total, 0)
    promedioPorBono.value = bonosConfirmados.value.length > 0
      ? totalConfirmado.value / bonosConfirmados.value.length
      : 0

    console.log(`[Pagos] ${bonosConfirmados.value.length} bonos confirmados cargados`)

  } catch (error: any) {
    console.error('[Pagos] Error general:', error)
    mostrarToast(`Error al cargar historial: ${error.message}`, 'error')
    bonosConfirmados.value = []
  } finally {
    cargando.value = false
  }
}

// Cargar meses disponibles
const cargarMesesDisponibles = async () => {
  console.log('[Pagos] Cargando meses disponibles...')

  try {
    if (!supabase) return

    const { data, error } = await supabase
      .from('bonos')
      .select('fecha_pago')
      .eq('estado_pago', 'pagado')
      .not('fecha_pago', 'is', null)
      .order('fecha_pago', { ascending: false })

    if (error || !data || data.length === 0) {
      mesesDisponibles.value = []
      return
    }

    // Extraer meses únicos
    const mesesSet = new Set<string>()
    data.forEach(bono => {
      if (bono.fecha_pago) {
        const fecha = new Date(bono.fecha_pago)
        if (!isNaN(fecha.getTime())) {
          const mesValor = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
          mesesSet.add(mesValor)
        }
      }
    })

    // Convertir a array formateado
    mesesDisponibles.value = Array.from(mesesSet)
      .sort()
      .reverse()
      .map(mesValor => {
        const [year, month] = mesValor.split('-')
        const fecha = new Date(parseInt(year), parseInt(month) - 1)
        const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        return {
          valor: mesValor,
          nombre: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)
        }
      })

    console.log(`[Pagos] ${mesesDisponibles.value.length} meses disponibles`)

  } catch (error) {
    console.error('[Pagos] Error al cargar meses:', error)
    mesesDisponibles.value = []
  }
}

// =============================================================================
// ACCIONES
// =============================================================================

// Confirmar pago
const confirmarPago = async (bono: any) => {
  if (!bono || !bono.id) {
    mostrarToast('Datos del bono inválidos', 'error')
    return
  }

  console.log('[Pagos] Confirmando pago para bono:', bono.id)

  try {
    procesandoConfirmacion.value = true

    const response = await $fetch('/api/pagos/confirmar', {
      method: 'POST',
      body: {
        bonoId: bono.id,
        metodoPago: 'coordinacion'
      }
    })

    if (!response || !response.success) {
      throw new Error('Respuesta inválida del servidor')
    }

    console.log('[Pagos] Pago confirmado exitosamente')

    // Recargar datos
    await Promise.all([
      cargarBonosPendientes(),
      cargarBonosConfirmados()
    ])

    mostrarToast('Pago confirmado exitosamente', 'success')

  } catch (error: any) {
    console.error('[Pagos] Error al confirmar pago:', error)

    let mensaje = 'Error al confirmar pago'
    if (error.status === 401) mensaje = 'No tienes permisos para confirmar pagos'
    else if (error.status === 403) mensaje = 'Acceso denegado'
    else if (error.status === 404) mensaje = 'El bono no existe o ya fue confirmado'
    else if (error.status === 409) mensaje = 'El bono ya fue confirmado'
    else if (error.message) mensaje = error.message

    mostrarToast(mensaje, 'error')
  } finally {
    procesandoConfirmacion.value = false
  }
}

// Ver detalle de bono
const verDetalleBono = (bono: any) => {
  bonoSeleccionado.value = bono
  modalDetalleAbierto.value = true
}

// Cerrar modal
const cerrarModal = () => {
  modalDetalleAbierto.value = false
  bonoSeleccionado.value = null
}

// Cambiar mes del historial
const cambiarMes = (mes: string) => {
  mesSeleccionado.value = mes
  cargarBonosConfirmados()
}

// Handlers del header
const onRegistrarPago = () => {
  // TODO: Abrir modal de registro de pago
  console.log('[Pagos] Registrar pago')
}

const onNuevaTarea = () => {
  // TODO: Abrir modal de nueva tarea
  console.log('[Pagos] Nueva tarea')
}

// =============================================================================
// TOAST NOTIFICATIONS
// =============================================================================

const mostrarToast = (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  try {
    const toast = document.createElement('div')

    const estilos = {
      success: 'bg-emerald-600 text-white border-emerald-500',
      error: 'bg-red-500 text-white border-red-400',
      warning: 'bg-amber-500 text-white border-amber-400',
      info: 'bg-neutral-800 text-white border-neutral-600'
    }

    const iconos = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    }

    toast.className = `fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 transform translate-x-full transition-transform duration-300 border ${estilos[tipo]} max-w-sm`
    toast.innerHTML = `
      <span class="text-lg flex-shrink-0">${iconos[tipo]}</span>
      <span class="font-medium text-sm">${mensaje}</span>
    `

    document.body.appendChild(toast)

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)'
    })

    const duracion = tipo === 'error' ? 5000 : tipo === 'warning' ? 4000 : 3000

    setTimeout(() => {
      toast.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast)
        }
      }, 300)
    }, duracion)

    toast.addEventListener('click', () => {
      toast.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast)
        }
      }, 300)
    })
    toast.style.cursor = 'pointer'

  } catch (error) {
    console.error('[Pagos] Error al mostrar toast:', error)
  }
}

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(() => {
  cargarMesesDisponibles()
  cargarBonosConfirmados()
  cargarBonosPendientes()
})
</script>

<template>
  <div class="pagos-page">
    <!-- Header unificado -->
    <PagosHeader
      :busqueda="busquedaGlobal"
      :total-pendientes="totalPendientes"
      :total-confirmados="totalConfirmados"
      @update:busqueda="busquedaGlobal = $event"
      @registrar-pago="onRegistrarPago"
      @nueva-tarea="onNuevaTarea"
    />

    <!-- Contenido principal -->
    <div class="pagos-content">
      <!-- Módulo de Bonos Pendientes -->
      <PagosPendientesModule
        :bonos="bonosPendientes"
        :cargando="cargandoPendientes"
        :procesando-confirmacion="procesandoConfirmacion"
        @confirmar-pago="confirmarPago"
        @ver-detalle="verDetalleBono"
      />

      <!-- Módulo de Historial -->
      <PagosHistorialModule
        :bonos="bonosConfirmados"
        :cargando="cargando"
        :meses-disponibles="mesesDisponibles"
        :mes-seleccionado="mesSeleccionado"
        @ver-detalle="verDetalleBono"
        @cambiar-mes="cambiarMes"
      />
    </div>

    <!-- Modal de Detalle -->
    <Teleport to="body">
      <div
        v-if="modalDetalleAbierto && bonoSeleccionado"
        class="modal-overlay"
        @click.self="cerrarModal"
      >
        <div class="modal-container">
          <!-- Header del modal -->
          <div class="modal-header">
            <div class="modal-avatar">
              <span>{{ obtenerIniciales(bonoSeleccionado.paciente_nombre) }}</span>
            </div>
            <div class="modal-title-group">
              <h3 class="modal-title">{{ bonoSeleccionado.paciente_nombre }}</h3>
              <p class="modal-subtitle">{{ bonoSeleccionado.tipo_bono || 'Bono Estándar' }}</p>
            </div>
            <button @click="cerrarModal" class="modal-close">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Contenido del modal -->
          <div class="modal-body">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Terapeuta</span>
                <span class="detail-value">{{ bonoSeleccionado.terapeuta_nombre || 'No asignado' }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Sesiones</span>
                <span class="detail-value">
                  {{ bonoSeleccionado.sesiones_restantes }} / {{ bonoSeleccionado.sesiones_totales }}
                </span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Monto Total</span>
                <span class="detail-value monto">{{ formatearPrecio(bonoSeleccionado.monto_total) }}€</span>
              </div>

              <div v-if="bonoSeleccionado.fecha_pago" class="detail-item">
                <span class="detail-label">Fecha de Pago</span>
                <span class="detail-value">{{ formatearFecha(bonoSeleccionado.fecha_pago) }}</span>
              </div>

              <div v-if="bonoSeleccionado.metodo_pago" class="detail-item">
                <span class="detail-label">Método de Pago</span>
                <span class="detail-value capitalize">{{ bonoSeleccionado.metodo_pago }}</span>
              </div>

              <div v-if="bonoSeleccionado.estado" class="detail-item">
                <span class="detail-label">Estado</span>
                <span class="detail-value capitalize">{{ bonoSeleccionado.estado }}</span>
              </div>
            </div>
          </div>

          <!-- Footer del modal -->
          <div class="modal-footer">
            <button @click="cerrarModal" class="btn-secondary">
              Cerrar
            </button>
            <NuxtLink
              v-if="bonoSeleccionado.paciente_id"
              :to="`/coordinadora/pacientes/${bonoSeleccionado.paciente_id}`"
              class="btn-primary"
            >
              Ver Paciente
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* =============================================================================
   PÁGINA DE PAGOS
   ============================================================================= */

.pagos-page {
  min-height: 100vh;
  padding: 1.5rem;
  background: linear-gradient(to bottom right, #F8FAFC, #F1F5F9, #F8FAFC);
}

.pagos-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

/* =============================================================================
   MODAL DE DETALLE
   ============================================================================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-container {
  width: 100%;
  max-width: 28rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(to right, rgba(13, 148, 136, 0.05), rgba(16, 185, 129, 0.05));
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.modal-title-group {
  flex: 1;
  min-width: 0;
}

.modal-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: #1F2937;
  line-height: 1.3;
}

.modal-subtitle {
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.125rem;
}

.modal-close {
  padding: 0.5rem;
  color: #9CA3AF;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.modal-close:hover {
  color: #4B5563;
  background: #F3F4F6;
}

.modal-body {
  padding: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9CA3AF;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.detail-value.monto {
  font-size: 1.125rem;
  font-weight: 700;
  color: #059669;
}

.detail-value.capitalize {
  text-transform: capitalize;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #F9FAFB;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.btn-secondary {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
}

/* =============================================================================
   RESPONSIVE
   ============================================================================= */

@media (max-width: 768px) {
  .pagos-page {
    padding: 1rem;
  }

  .pagos-content {
    gap: 1rem;
    margin-top: 1rem;
  }

  .modal-container {
    max-width: 100%;
    margin: 1rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
