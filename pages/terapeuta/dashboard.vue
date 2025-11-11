<template>
  <div class="p-6 space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-serif font-bold text-cafe">Dashboard</h1>
        <p class="text-cafe/70 mt-1">Bienvenida de nuevo, {{ terapeuta?.nombre || 'Karem' }} 👋</p>
      </div>
      <div class="flex gap-2">
        <button @click="navegarANuevaCita" class="btn-primary">+ Nueva Cita</button>
        <button @click="navegarANuevoPaciente" class="btn-outline">+ Nuevo Paciente</button>
      </div>
    </div>

    <!-- Grid Principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Columna 1: Próximas Sesiones -->
      <section class="card lg:col-span-2">
        <header class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-cafe">�️ Próximas Sesiones</h2>
          <NuxtLink to="/agenda" class="text-purple-600 text-sm hover:underline">
            Ver agenda →
          </NuxtLink>
        </header>
        <div v-if="cargandoSesiones" class="text-cafe/60 text-sm py-8 text-center">Cargando sesiones...</div>
        <div v-else-if="proximasSesiones.length === 0" class="text-cafe/50 text-center py-10">No hay sesiones próximas.</div>
        <div v-else class="space-y-4">
          <div
            v-for="cita in proximasSesiones"
            :key="cita.id"
            class="flex items-center justify-between bg-purple-600/5 rounded-xl p-4 hover:bg-purple-600/10 transition"
          >
            <div>
              <p class="text-lg font-semibold text-cafe">{{ cita.hora_inicio }} — {{ cita.paciente_nombre }}</p>
              <p class="text-sm text-cafe/70">{{ cita.modalidad === 'online' ? 'Online 💻' : 'Presencial 🏥' }}</p>
            </div>
            <button
              @click="abrirDetalles(cita.id)"
              class="px-3 py-1 text-sm border border-purple-600/30 rounded-lg text-purple-600 hover:bg-purple-600 hover:text-white transition"
            >
              Ver detalles
            </button>
          </div>
        </div>
      </section>

      <!-- Columna 2: Pacientes Activos -->
      <section class="card">
        <header class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-cafe">🧍 Pacientes Activos</h2>
          <NuxtLink to="/terapeuta/pacientes" class="text-purple-600 text-sm hover:underline">
            Ver todos →
          </NuxtLink>
        </header>
        <div v-if="cargandoPacientes" class="text-cafe/60 text-sm py-8 text-center">Cargando pacientes...</div>
        <div v-else-if="pacientesActivos.length === 0" class="text-cafe/50 text-center py-10">No hay pacientes activos.</div>
        <div v-else class="space-y-3">
          <div
            v-for="paciente in pacientesActivos"
            :key="paciente.id"
            class="flex items-center justify-between bg-white border border-cafe/5 rounded-xl p-4 hover:shadow-sm transition"
          >
            <div class="flex-1">
              <p class="font-semibold text-cafe">{{ paciente.nombre_completo }}</p>
              <p class="text-sm text-cafe/60">Última sesión: {{ paciente.ultima_sesion || 'Sin registro' }}</p>
              <div class="w-full bg-base-bg h-1 mt-2 rounded-full">
                <div
                  class="h-1 rounded-full bg-green-500 transition-all"
                  :style="{ width: `${paciente.progreso_bono || 0}%` }"
                ></div>
              </div>
            </div>
            <NuxtLink
              :to="`/terapeuta/pacientes/${paciente.id}`"
              class="px-3 py-1 text-sm border border-cafe/10 text-cafe rounded-lg hover:bg-cafe/5 ml-3"
            >
              Ver perfil
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>

    <!-- Fila inferior: Métricas + Mensajes -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Analítica del Profesional -->
      <section class="card lg:col-span-2">
        <header class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-cafe">📊 Analítica del Profesional</h2>
        </header>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div class="p-4 bg-purple-600/5 rounded-xl">
            <p class="text-2xl font-bold text-cafe">{{ totalPacientes }}</p>
            <p class="text-sm text-cafe/60">Pacientes activos</p>
          </div>
          <div class="p-4 bg-purple-600/5 rounded-xl">
            <p class="text-2xl font-bold text-cafe">{{ totalSesionesMes }}</p>
            <p class="text-sm text-cafe/60">Sesiones este mes</p>
          </div>
          <div class="p-4 bg-purple-600/5 rounded-xl">
            <p class="text-2xl font-bold text-cafe">{{ porcentajeAsistencia }}%</p>
            <p class="text-sm text-cafe/60">Asistencia promedio</p>
          </div>
          <!-- Nueva tarjeta de Pagos Confirmados -->
          <NuxtLink
            to="/terapeuta/sesiones"
            class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all hover:shadow-md group"
          >
            <div class="flex items-center justify-center gap-2 mb-1">
              <span class="text-2xl group-hover:scale-110 transition-transform">💶</span>
              <p class="text-2xl font-bold text-green-700">{{ formatearPrecio(totalConfirmado) }}€</p>
            </div>
            <p class="text-sm text-cafe/60">Pagos confirmados</p>
            <p class="text-xs text-green-700 font-medium mt-1">{{ totalBonosPagados }} {{ totalBonosPagados === 1 ? 'bono' : 'bonos' }}</p>
          </NuxtLink>
        </div>
      </section>

      <!-- Mensajes / Recordatorios -->
      <section class="card">
        <header class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-cafe">💬 Recordatorios</h2>
          <button
            v-if="!cargandoRecordatorios"
            @click="generarRecordatorios"
            class="text-xs text-purple-600 hover:text-cafe transition"
            title="Actualizar recordatorios"
          >
            🔄
          </button>
        </header>

        <div v-if="cargandoRecordatorios" class="text-cafe/60 text-sm py-8 text-center">
          Cargando recordatorios...
        </div>

        <ul v-else-if="recordatorios.length" class="space-y-3 text-sm text-cafe/80">
          <li
            v-for="(msg, i) in recordatorios"
            :key="i"
            class="flex items-start gap-2 bg-purple-600/5 rounded-lg px-3 py-2 hover:bg-purple-600/10 transition"
          >
            <span class="flex-shrink-0 mt-0.5">🔔</span>
            <span class="flex-1">{{ msg }}</span>
          </li>
        </ul>

        <div v-else class="text-cafe/60 text-sm py-8 text-center">
          No hay recordatorios pendientes 🎉
        </div>
      </section>
    </div>

    <!-- Modal de Detalles de Cita -->
    <ModalDetallesCita
      :is-open="modalDetallesAbierto"
      :cita-id="citaSeleccionada"
      @close="cerrarModalDetalles"
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

// Estado principal
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

// Estado de pagos confirmados
const totalConfirmado = ref(0)
const totalBonosPagados = ref(0)

// Recordatorios dinámicos basados en datos reales
const recordatorios = ref<string[]>([])
const cargandoRecordatorios = ref(true)

// ============================================================================
// FUNCIONES DE NAVEGACIÓN
// ============================================================================

const navegarANuevaCita = () => {
  router.push('/agenda')
}

const navegarANuevoPaciente = () => {
  router.push('/terapeuta/pacientes')
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
}

// ============================================================================
// CARGAR DATOS DESDE SUPABASE
// ============================================================================

async function cargarPerfilTerapeuta() {
  try {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      // Intentar obtener metadata del perfil
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
      .limit(5)
    
    if (error) throw error
    
    proximasSesiones.value = (data || []).map((c: any) => ({
      id: c.id,
      hora_inicio: c.hora_inicio ? c.hora_inicio.substring(0, 5) : '--:--',
      paciente_nombre: c.pacientes?.nombre_completo || c.pacientes?.email || 'Paciente',
      modalidad: c.modalidad || 'presencial',
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
    const { data, error } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, area_de_acompanamiento, updated_at, metadata')
      .eq('activo', true)
      .order('updated_at', { ascending: false })
      .limit(5)
    
    if (error) throw error
    
    pacientesActivos.value = (data || []).map((p: any) => ({
      id: p.id,
      nombre_completo: p.nombre_completo || 'Sin nombre',
      ultima_sesion: p.updated_at 
        ? new Date(p.updated_at).toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short' 
          })
        : 'Sin registro',
      progreso_bono: Math.floor(Math.random() * 100) // Simulado - integrar con tabla bonos
    }))
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
    
    // Porcentaje de asistencia (simulado por ahora)
    porcentajeAsistencia.value = Math.floor(Math.random() * 20) + 80
  } catch (error) {
    console.error('Error al cargar métricas:', error)
  }
}

async function generarRecordatorios() {
  cargandoRecordatorios.value = true
  const nuevos: string[] = []

  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    // 📅 1️⃣ Citas pendientes de confirmación (mañana)
    const manana = new Date(hoy)
    manana.setDate(hoy.getDate() + 1)
    const fechaManana = manana.toISOString().split('T')[0]

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
      .eq('fecha_cita', fechaManana)

    citasPendientes?.forEach((cita: any) => {
      nuevos.push(`Confirma la cita de ${cita.pacientes?.nombre_completo || 'paciente'} para mañana a las ${cita.hora_inicio || '--:--'}`)
    })

    // 🕓 2️⃣ Citas pasadas no completadas
    const { data: citasAtrasadas } = await supabase
      .from('citas')
      .select(`
        id,
        fecha_cita,
        pacientes (
          nombre_completo
        )
      `)
      .lt('fecha_cita', hoy.toISOString().split('T')[0])
      .neq('estado', 'completada')
      .neq('estado', 'cancelada')
      .limit(3)

    citasAtrasadas?.forEach((cita: any) => {
      const fecha = new Date(cita.fecha_cita).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      })
      nuevos.push(`Revisa la sesión pendiente de ${cita.pacientes?.nombre_completo || 'paciente'} del ${fecha}`)
    })

    // 🎫 3️⃣ Bonos próximos a agotarse
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
      .limit(3)

    bonos?.forEach((bono: any) => {
      nuevos.push(`El bono de ${bono.pacientes?.nombre_completo || 'paciente'} está por agotarse (quedan ${bono.sesiones_restantes} sesiones)`)
    })

    // 💰 4️⃣ Pagos pendientes (si existe la tabla)
    try {
      const { data: pagos } = await supabase
        .from('pagos')
        .select(`
          paciente_id,
          monto,
          estado_pago,
          pacientes (
            nombre_completo
          )
        `)
        .eq('estado_pago', 'pendiente')
        .limit(3)

      pagos?.forEach((pago: any) => {
        nuevos.push(`Pago pendiente de ${pago.pacientes?.nombre_completo || 'paciente'} por ${pago.monto} €`)
      })
    } catch (error) {
      // Tabla pagos no existe o no tiene acceso
      console.log('Tabla pagos no disponible')
    }

    // 🧍‍♀️ 5️⃣ Pacientes inactivos (>14 días sin sesión)
    const fechaLimite = new Date()
    fechaLimite.setDate(hoy.getDate() - 14)

    const { data: pacientesInactivos } = await supabase
      .from('pacientes')
      .select('nombre_completo, updated_at')
      .eq('activo', true)

    pacientesInactivos?.forEach((paciente: any) => {
      const ultima = new Date(paciente.updated_at)
      if (ultima < fechaLimite) {
        const diasInactivo = Math.floor((hoy.getTime() - ultima.getTime()) / (1000 * 60 * 60 * 24))
        nuevos.push(`${paciente.nombre_completo} no ha tenido sesión en ${diasInactivo} días`)
      }
    })

    // Limitar a máximo 5 recordatorios
    recordatorios.value = nuevos.slice(0, 5)
  } catch (error) {
    console.error('Error al generar recordatorios:', error)
    recordatorios.value = []
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

    // Obtener el terapeuta
    const { data: terapeutaData } = await supabase
      .from('terapeutas')
      .select('id')
      .eq('email', user.value.email)
      .single()

    if (!terapeutaData) return

    // Obtener pacientes del terapeuta
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

    // Cargar bonos pagados
    const { data: bonos } = await supabase
      .from('bonos')
      .select('id, monto_total')
      .eq('pagado', true)
      .in('paciente_id', pacienteIds)

    if (bonos && bonos.length > 0) {
      totalBonosPagados.value = bonos.length
      // Calcular el 70% del total (parte del terapeuta)
      const montoTotal = bonos.reduce((sum: number, bono: any) => sum + (bono.monto_total || 0), 0)
      totalConfirmado.value = montoTotal * 0.7
    } else {
      totalConfirmado.value = 0
      totalBonosPagados.value = 0
    }
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
.card {
  @apply bg-white rounded-2xl border border-cafe/5 shadow-sm p-6 transition-all;
}

.btn-primary {
  @apply bg-purple-600 text-white rounded-xl px-4 py-2 font-medium hover:bg-purple-600/90 transition;
}

.btn-outline {
  @apply border border-cafe/20 text-cafe rounded-xl px-4 py-2 hover:bg-cafe/5 transition;
}
</style>
