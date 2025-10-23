<template>
  <div class="min-h-screen bg-base-bg">
    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Header Simple con Botón Demo -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-serif font-bold text-cafe mb-2">
            Sesiones
          </h1>
          <p class="text-cafe/70 font-sans">
            Gestión financiera transparente
          </p>
        </div>

        <!-- Botón Modo Demo -->
        <button
          @click="alternarModoDemo"
          class="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl text-cafe font-sans text-sm transition-all duration-300 border border-gray-200 shadow-sm"
          :class="{ 'ring-2 ring-purple-500 bg-purple-50': modoDemo }"
        >
          <span class="text-xl">{{ modoDemo ? '🎭' : '👁️' }}</span>
          <span class="hidden sm:inline">{{ modoDemo ? 'Modo Demo' : 'Ver Demo' }}</span>
        </button>
      </div>
      <!-- Banner Modo Demo -->
      <div 
        v-if="modoDemo && !cargando" 
        class="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-6 mb-8 shadow-lg animate-pulse"
      >
        <div class="flex items-center gap-4">
          <div class="text-5xl">🎭</div>
          <div class="flex-1">
            <h3 class="font-serif font-bold text-purple-900 text-xl mb-2">
              Modo Demo Activo
            </h3>
            <p class="font-sans text-purple-800 leading-relaxed mb-3">
              Estás viendo <strong>datos de ejemplo</strong> para explorar el panel sin datos reales. 
              Los montos y sesiones mostrados son ficticios.
            </p>
            <button
              @click="alternarModoDemo"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-sans text-sm transition-colors"
            >
              Volver a Datos Reales
            </button>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="cargando" class="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>

      <!-- Error state -->
      <div v-else-if="error && !modoDemo" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p class="text-red-600 font-sans text-lg mb-2">⚠️ Error al cargar las sesiones</p>
        <p class="text-red-500 font-sans text-sm mb-4">{{ error }}</p>
        <div class="flex items-center justify-center gap-3">
          <button
            @click="cargarDatos"
            class="px-6 py-2 bg-red-600 text-white rounded-lg font-sans hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
          <button
            @click="alternarModoDemo"
            class="px-6 py-2 bg-purple-600 text-white rounded-lg font-sans hover:bg-purple-700 transition-colors"
          >
            Ver Demo
          </button>
        </div>
      </div>

      <!-- Contenido principal -->
      <template v-else>
        <!-- Resumen financiero -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ResumenCard
            title="Pendientes"
            :count="resumen.pendientes"
            :amount="resumen.montoPendiente"
            color="amber"
            emoji="🕓"
            subtitle="Por confirmar"
            :badge="resumen.pendientes > 0 ? `${resumen.pendientes} sesión(es) pendiente(s)` : ''"
          />
          
          <ResumenCard
            title="Confirmadas"
            :count="resumen.confirmadas"
            :amount="resumen.montoConfirmado"
            color="green"
            emoji="💚"
            subtitle="Confirmadas"
            :badge="resumen.confirmadas > 0 ? 'Ingresos asegurados' : ''"
          />
          
          <ResumenCard
            title="Anuladas"
            :count="resumen.anuladas"
            :amount="0"
            color="red"
            emoji="❌"
            subtitle="Sin ingreso"
          />
          
          <ResumenCard
            title="Tu Saldo Total"
            :count="resumen.confirmadas"
            :amount="resumen.montoTerapeuta"
            color="terracota"
            emoji="💎"
            subtitle="Tu parte (70%)"
            badge="Ingresos confirmados"
          />
        </div>

        <!-- Información adicional -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 mb-8 border border-blue-200">
          <div class="flex items-start gap-4">
            <div class="text-4xl">ℹ️</div>
            <div class="flex-1">
              <h3 class="font-serif font-bold text-blue-900 text-xl mb-2">
                Sobre tu compensación
              </h3>
              <div class="space-y-2 font-sans text-blue-800">
                <p class="leading-relaxed">
                  • Recibes el <strong>70% del precio total</strong> de cada sesión confirmada
                </p>
                <p class="leading-relaxed">
                  • El 30% restante cubre gastos operativos, plataforma y administración
                </p>
                <p class="leading-relaxed">
                  • Las sesiones pendientes se confirman una vez que el paciente complete el pago
                </p>
                <p class="leading-relaxed">
                  • Los pagos se procesan mensualmente los primeros 5 días del mes
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl p-6 shadow-md border-l-4 border-terracota">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-3xl">�</span>
              <h4 class="font-serif font-bold text-gray-900">Promedio por sesión</h4>
            </div>
            <p class="text-2xl font-serif font-bold text-terracota">
              {{ formatearMonto(calcularPromedioPorSesion()) }}
            </p>
            <p class="text-sm text-gray-600 font-sans mt-2">
              Basado en sesiones confirmadas
            </p>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-3xl">📈</span>
              <h4 class="font-serif font-bold text-gray-900">Tasa de confirmación</h4>
            </div>
            <p class="text-2xl font-serif font-bold text-green-600">
              {{ calcularTasaConfirmacion() }}%
            </p>
            <p class="text-sm text-gray-600 font-sans mt-2">
              De tus sesiones totales
            </p>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-md border-l-4 border-amber-500">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-3xl">⏳</span>
              <h4 class="font-serif font-bold text-gray-900">Ingresos potenciales</h4>
            </div>
            <p class="text-2xl font-serif font-bold text-amber-600">
              {{ formatearMonto(resumen.montoPendiente) }}
            </p>
            <p class="text-sm text-gray-600 font-sans mt-2">
              Sesiones por confirmar
            </p>
          </div>
        </div>

        <!-- Tabla de sesiones -->
        <TablaSesiones :sesiones="sesiones" />

        <!-- Mensaje si no hay sesiones -->
        <div v-if="sesiones.length === 0" class="bg-white rounded-2xl p-12 text-center shadow-lg mt-8">
          <div class="text-6xl mb-4">📅</div>
          <h3 class="text-2xl font-serif font-bold text-gray-900 mb-2">
            Aún no tienes sesiones registradas
          </h3>
          <p class="text-gray-600 font-sans mb-6">
            Cuando se agenden sesiones contigo, aparecerán aquí con toda la información financiera
          </p>
          <div class="flex items-center justify-center gap-3">
            <NuxtLink
              to="/terapeuta/dashboard"
              class="inline-flex items-center gap-2 px-6 py-3 bg-terracota text-white rounded-lg font-sans font-medium hover:bg-terracota/90 transition-colors"
            >
              Volver al Dashboard
            </NuxtLink>
            <button
              @click="alternarModoDemo"
              class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-sans font-medium hover:bg-purple-700 transition-colors"
            >
              🎭 Ver Demo
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Footer informativo -->
    <div class="max-w-7xl mx-auto px-6 py-8 mt-12">
      <div class="bg-gradient-to-r from-rosa to-white rounded-2xl p-8 border border-terracota/20">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div class="text-5xl">🤝</div>
          <div class="flex-1">
            <h3 class="font-serif font-bold text-cafe text-2xl mb-3">
              Transparencia y Confianza
            </h3>
            <p class="font-sans text-cafe/80 leading-relaxed mb-4">
              En nuestra consulta valoramos la claridad y el respeto en todas las relaciones profesionales. 
              Este panel te permite tener total visibilidad de tus ingresos y el estado de cada sesión.
            </p>
            <p class="font-sans text-cafe/80 leading-relaxed">
              Si tienes dudas sobre algún pago o sesión, contacta con administración: 
              <a href="mailto:admin@psicologakarem.com" class="text-terracota font-medium hover:underline">
                admin@psicologakarem.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SesionDetallada, ResumenFinanciero } from '~/composables/useSesiones'
import { useSesiones } from '~/composables/useSesiones'
import { useSesionesDemo } from '~/composables/useSesionesDemo'

// Meta tags para SEO
definePageMeta({
  layout: 'terapeuta',
  middleware: 'auth'
})

// Composables
const { 
  obtenerSesiones, 
  calcularResumenFinanciero,
  formatearMonto
} = useSesiones()

const {
  generarSesionesDemo,
  esModoDemo,
  toggleModoDemo
} = useSesionesDemo()

// Estado
const cargando = ref(true)
const error = ref<string | null>(null)
const sesiones = ref<SesionDetallada[]>([])
const modoDemo = ref(false)
const resumen = ref<ResumenFinanciero>({
  pendientes: 0,
  confirmadas: 0,
  anuladas: 0,
  completadas: 0,
  montoPendiente: 0,
  montoConfirmado: 0,
  montoAnulado: 0,
  montoTerapeuta: 0,
  montoTotal: 0
})

// Cargar datos
const cargarDatos = async () => {
  try {
    cargando.value = true
    error.value = null
    
    // Verificar si el modo demo está activo
    if (modoDemo.value) {
      // Generar datos de demo
      sesiones.value = generarSesionesDemo()
    } else {
      // Obtener sesiones reales del terapeuta
      sesiones.value = await obtenerSesiones()
    }
    
    // Calcular resumen financiero
    resumen.value = calcularResumenFinanciero(sesiones.value)
  } catch (e: any) {
    console.error('Error al cargar sesiones:', e)
    error.value = e.message || 'Error desconocido al cargar las sesiones'
    
    // Si hay error, activar modo demo automáticamente
    if (!modoDemo.value) {
      console.log('⚠️ Error al cargar datos reales, activando modo demo')
      modoDemo.value = true
      await cargarDatos()
    }
  } finally {
    cargando.value = false
  }
}

// Alternar modo demo
const alternarModoDemo = () => {
  toggleModoDemo()
  modoDemo.value = esModoDemo()
  cargarDatos()
}

// Calcular promedio por sesión
const calcularPromedioPorSesion = (): number => {
  if (resumen.value.confirmadas === 0) return 0
  return resumen.value.montoTerapeuta / resumen.value.confirmadas
}

// Calcular tasa de confirmación
const calcularTasaConfirmacion = (): number => {
  const total = resumen.value.pendientes + resumen.value.confirmadas + resumen.value.anuladas
  if (total === 0) return 0
  return Math.round((resumen.value.confirmadas / total) * 100)
}

// Cargar datos al montar el componente
onMounted(() => {
  // Verificar si el modo demo está activo
  modoDemo.value = esModoDemo()
  cargarDatos()
})

// SEO
useHead({
  title: 'Tus Sesiones - Panel Terapeuta | Psicóloga Karem',
  meta: [
    {
      name: 'description',
      content: 'Panel de gestión financiera de sesiones terapéuticas con transparencia total'
    }
  ]
})
</script>

<style scoped>
/* Animaciones suaves para las cards */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid > * {
  animation: slideInUp 0.6s ease-out backwards;
}

.grid > *:nth-child(1) { animation-delay: 0.1s; }
.grid > *:nth-child(2) { animation-delay: 0.2s; }
.grid > *:nth-child(3) { animation-delay: 0.3s; }
.grid > *:nth-child(4) { animation-delay: 0.4s; }
</style>
