<template>
  <div>
    <!-- Banner de Modo Demo -->
    <div v-if="MODO_DEMO" class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
      <div class="flex items-start gap-3">
        <span class="text-3xl">🎭</span>
        <div class="flex-1">
          <h3 class="font-serif text-lg font-semibold text-purple-900 mb-1">
            Modo Demostración Activo
          </h3>
          <p class="text-sm text-purple-700 leading-relaxed">
            Estás viendo <strong>7 pacientes de prueba</strong> con datos simulados. 
            Para usar datos reales de Supabase, cambia <code class="px-2 py-0.5 bg-purple-100 rounded">MODO_DEMO = false</code> 
            en el código de esta página.
          </p>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-serif font-bold text-cafe mb-2">
        Pacientes
      </h1>
      <p class="text-lg text-cafe/70">
        Gestión de pacientes activos
      </p>
    </div>

    <!-- Buscador y filtros -->
    <div class="mb-6 bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-4">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Buscador -->
        <div class="flex-1">
          <div class="relative">
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar paciente por nombre..."
              class="w-full px-4 py-2.5 pl-10 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all text-cafe placeholder-cafe/50"
            />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-cafe/50">
              🔍
            </span>
          </div>
        </div>

        <!-- Filtros de estado -->
        <div class="flex gap-2">
          <button
            v-for="filtro in filtrosEstado"
            :key="filtro.valor"
            @click="estadoSeleccionado = filtro.valor"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            :class="estadoSeleccionado === filtro.valor 
              ? 'bg-terracota text-white' 
              : 'bg-base-bg text-cafe hover:bg-rosa/30'"
          >
            {{ filtro.emoji }} {{ filtro.label }}
          </button>
        </div>

        <!-- Botón añadir paciente -->
        <button
          @click="abrirModalNuevoPaciente"
          class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <span>+</span>
          <span>Nuevo Paciente</span>
        </button>
      </div>
    </div>

    <!-- Lista de pacientes -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-12 h-12 border-4 border-terracota border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-cafe/60">Cargando pacientes...</p>
    </div>

    <div v-else-if="pacientesFiltrados.length === 0" class="text-center py-12">
      <DashboardCard>
        <span class="text-6xl mb-4 block opacity-40">👥</span>
        <h3 class="text-xl font-serif font-semibold text-cafe mb-2">
          {{ busqueda || estadoSeleccionado !== 'todos' 
            ? 'No se encontraron pacientes' 
            : 'Aún no tienes pacientes registrados' }}
        </h3>
        <p class="text-cafe/60 mb-4">
          {{ busqueda || estadoSeleccionado !== 'todos'
            ? 'Intenta ajustar los filtros de búsqueda'
            : 'Comienza añadiendo tu primer paciente' }}
        </p>
        <button
          v-if="!busqueda && estadoSeleccionado === 'todos'"
          @click="abrirModalNuevoPaciente"
          class="px-6 py-3 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors"
        >
          + Añadir Primer Paciente
        </button>
      </DashboardCard>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <PacienteCard
        v-for="paciente in pacientesFiltrados"
        :key="paciente.id"
        :paciente="paciente"
        @click="irAFichaPaciente(paciente.id)"
      />
    </div>

    <!-- Paginación (si es necesaria) -->
    <div v-if="pacientesFiltrados.length > 0" class="mt-8 flex items-center justify-between">
      <p class="text-sm text-cafe/60">
        Mostrando {{ pacientesFiltrados.length }} de {{ totalPacientes }} pacientes
      </p>
      <div v-if="totalPacientes > pacientesFiltrados.length" class="flex gap-2">
        <button
          class="px-4 py-2 bg-white border border-cafe/20 text-cafe rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Ver más
        </button>
      </div>
    </div>

    <!-- Modal Nuevo Paciente -->
    <ModalNuevoPaciente
      :mostrar="mostrarModalNuevo"
      @cerrar="cerrarModalNuevo"
      @paciente-creado="manejarPacienteCreado"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'terapeuta'
})

const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Estado del modal
const mostrarModalNuevo = ref(false)

// ============================================================================
// 🎭 MODO DEMO - Cambiar a false para usar datos reales de Supabase
// ============================================================================
const MODO_DEMO = ref(true) // ← Cambiar a false cuando tengas datos reales

// Estado
const pacientes = ref([])
const loading = ref(true)
const busqueda = ref('')
const estadoSeleccionado = ref('todos')

// Filtros disponibles
const filtrosEstado = [
  { valor: 'todos', label: 'Todos', emoji: '📋' },
  { valor: 'activo', label: 'Activos', emoji: '✅' },
  { valor: 'pausa', label: 'En pausa', emoji: '⏸️' },
  { valor: 'finalizado', label: 'Finalizados', emoji: '🏁' }
]

// Cargar pacientes
const cargarPacientes = async () => {
  loading.value = true
  try {
    // ========================================================================
    // 🎭 MODO DEMO: Datos mock para demostración
    // ========================================================================
    if (MODO_DEMO.value) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800))
      
      pacientes.value = [
        {
          id: 'demo-1',
          nombre: 'María',
          apellidos: 'González Pérez',
          email: 'maria.gonzalez@demo.com',
          activo: true,
          en_pausa: false,
          area_de_acompanamiento: 'Ansiedad y autoestima',
          frecuencia: 'semanal',
          ultima_sesion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          proxima_sesion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          total_sesiones: 12,
          estado_emocional_promedio: 4.2,
          evolucion_porcentaje: 78,
          requiere_atencion: false,
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'demo-2',
          nombre: 'Carlos',
          apellidos: 'Mendoza Silva',
          email: 'carlos.mendoza@demo.com',
          activo: true,
          en_pausa: false,
          area_de_acompanamiento: 'Gestión emocional',
          frecuencia: 'quincenal',
          ultima_sesion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          proxima_sesion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          total_sesiones: 8,
          estado_emocional_promedio: 2.3,
          evolucion_porcentaje: 45,
          requiere_atencion: true,
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'demo-3',
          nombre: 'Ana',
          apellidos: 'Rodríguez López',
          email: 'ana.rodriguez@demo.com',
          activo: true,
          en_pausa: false,
          area_de_acompanamiento: 'Desarrollo personal',
          frecuencia: 'semanal',
          ultima_sesion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          proxima_sesion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          total_sesiones: 4,
          estado_emocional_promedio: 4.8,
          evolucion_porcentaje: 82,
          requiere_atencion: false,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'demo-4',
          nombre: 'Laura',
          apellidos: 'Martínez García',
          email: 'laura.martinez@demo.com',
          activo: true,
          en_pausa: false, // Cambiado a false para que muestre alerta de inactividad
          area_de_acompanamiento: 'Estrés laboral',
          frecuencia: 'mensual',
          ultima_sesion: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          proxima_sesion: null,
          total_sesiones: 15,
          estado_emocional_promedio: 3.5,
          evolucion_porcentaje: 65,
          requiere_atencion: false,
          created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'demo-5',
          nombre: 'Pedro',
          apellidos: 'Sánchez Ruiz',
          email: 'pedro.sanchez@demo.com',
          activo: false,
          en_pausa: false,
          area_de_acompanamiento: 'Duelo',
          frecuencia: 'semanal',
          ultima_sesion: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          proxima_sesion: null,
          total_sesiones: 20,
          estado_emocional_promedio: 4.0,
          evolucion_porcentaje: 85,
          requiere_atencion: false,
          created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'demo-6',
          nombre: 'Sofía',
          apellidos: 'Torres Moreno',
          email: 'sofia.torres@demo.com',
          activo: true,
          en_pausa: false,
          area_de_acompanamiento: 'Relaciones interpersonales',
          frecuencia: 'semanal',
          ultima_sesion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          proxima_sesion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          total_sesiones: 6,
          estado_emocional_promedio: 3.8,
          evolucion_porcentaje: 70,
          requiere_atencion: false,
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'demo-7',
          nombre: 'Roberto',
          apellidos: 'Flores Vega',
          email: 'roberto.flores@demo.com',
          activo: true,
          en_pausa: false,
          area_de_acompanamiento: 'Ansiedad',
          frecuencia: 'quincenal',
          ultima_sesion: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 días sin sesión
          proxima_sesion: null,
          total_sesiones: 10,
          estado_emocional_promedio: 3.2,
          evolucion_porcentaje: 55,
          requiere_atencion: false,
          created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      loading.value = false
      return
    }
    
    // ========================================================================
    // 📊 MODO PRODUCCIÓN: Datos reales de Supabase
    // ========================================================================
    
    // Obtener pacientes del terapeuta autenticado
    const { data: pacientesData, error: pacientesError } = await supabase
      .from('pacientes')
      .select(`
        id,
        created_at,
        activo,
        area_de_acompanamiento,
        frecuencia,
        metadata,
        profiles!inner(
          nombre_completo,
          email
        )
      `)
      .eq('psicologa_id', user.value?.id)
      .order('created_at', { ascending: false })
    
    if (pacientesError) throw pacientesError

    // Enriquecer datos con información de sesiones y emociones
    const pacientesEnriquecidos = await Promise.all(
      pacientesData.map(async (paciente) => {
        // Obtener última sesión
        const { data: ultimaSesion } = await supabase
          .from('sesiones')
          .select('fecha')
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')
          .order('fecha', { ascending: false })
          .limit(1)
          .single()

        // Obtener próxima sesión
        const { data: proximaSesion } = await supabase
          .from('sesiones')
          .select('fecha')
          .eq('paciente_id', paciente.id)
          .in('estado', ['pendiente', 'confirmada'])
          .gte('fecha', new Date().toISOString())
          .order('fecha', { ascending: true })
          .limit(1)
          .single()

        // Contar total de sesiones
        const { count: totalSesiones } = await supabase
          .from('sesiones')
          .select('*', { count: 'exact', head: true })
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')

        // Obtener promedio emocional de últimos 7 días
        const hace7Dias = new Date()
        hace7Dias.setDate(hace7Dias.getDate() - 7)
        
        const { data: emocionesRecientes } = await supabase
          .from('emociones_avanzadas')
          .select('nivel_animo, nivel_energia, nivel_estres')
          .eq('paciente_id', paciente.id)
          .gte('fecha', hace7Dias.toISOString())

        let estadoEmocionalPromedio = 3
        let requiereAtencion = false
        let evolucionPorcentaje = 50

        if (emocionesRecientes && emocionesRecientes.length > 0) {
          const promedioAnimo = emocionesRecientes.reduce((sum, e) => sum + e.nivel_animo, 0) / emocionesRecientes.length
          estadoEmocionalPromedio = promedioAnimo
          evolucionPorcentaje = Math.round((promedioAnimo / 5) * 100)
          
          // Detectar si requiere atención (3 o más registros bajos consecutivos)
          const ultimosTres = emocionesRecientes.slice(-3)
          if (ultimosTres.length >= 3) {
            requiereAtencion = ultimosTres.every(e => e.nivel_animo <= 2)
          }
        }

        // Parsear nombre completo
        const nombreCompleto = paciente.profiles.nombre_completo || ''
        const partesNombre = nombreCompleto.split(' ')
        const nombre = partesNombre[0] || ''
        const apellidos = partesNombre.slice(1).join(' ') || ''

        return {
          id: paciente.id,
          nombre: nombre,
          apellidos: apellidos,
          email: paciente.profiles.email,
          activo: paciente.activo,
          en_pausa: paciente.metadata?.en_pausa || false,
          area_de_acompanamiento: paciente.area_de_acompanamiento,
          frecuencia: paciente.frecuencia,
          ultima_sesion: ultimaSesion?.fecha || null,
          proxima_sesion: proximaSesion?.fecha || null,
          total_sesiones: totalSesiones || 0,
          estado_emocional_promedio: estadoEmocionalPromedio,
          evolucion_porcentaje: evolucionPorcentaje,
          requiere_atencion: requiereAtencion,
          created_at: paciente.created_at
        }
      })
    )

    pacientes.value = pacientesEnriquecidos
  } catch (error) {
    console.error('Error al cargar pacientes:', error)
    alert('Hubo un error al cargar los pacientes. Por favor, recarga la página.')
  } finally {
    loading.value = false
  }
}

// Filtrar pacientes
const pacientesFiltrados = computed(() => {
  let resultado = pacientes.value

  // Filtrar por búsqueda
  if (busqueda.value) {
    const busquedaLower = busqueda.value.toLowerCase()
    resultado = resultado.filter(p => {
      const nombreCompleto = `${p.nombre} ${p.apellidos}`.toLowerCase()
      return nombreCompleto.includes(busquedaLower)
    })
  }

  // Filtrar por estado
  if (estadoSeleccionado.value !== 'todos') {
    resultado = resultado.filter(p => {
      if (estadoSeleccionado.value === 'activo') {
        return p.activo && !p.en_pausa
      } else if (estadoSeleccionado.value === 'pausa') {
        return p.activo && p.en_pausa
      } else if (estadoSeleccionado.value === 'finalizado') {
        return !p.activo
      }
      return true
    })
  }

  return resultado
})

const totalPacientes = computed(() => pacientes.value.length)

// Navegación
const irAFichaPaciente = (id) => {
  router.push(`/terapeuta/pacientes/${id}`)
}

// Gestión del modal
const abrirModalNuevoPaciente = () => {
  mostrarModalNuevo.value = true
}

const cerrarModalNuevo = () => {
  mostrarModalNuevo.value = false
}

const manejarPacienteCreado = async (nuevoPaciente) => {
  console.log('Nuevo paciente creado:', nuevoPaciente)
  
  // Recargar la lista de pacientes
  await cargarPacientes()
  
  // Opcional: Mostrar notificación de éxito
  // toast.success('Paciente creado exitosamente')
}

// Lifecycle
onMounted(() => {
  cargarPacientes()
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
