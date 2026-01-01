<script setup lang="ts">
/**
 * Landing Page - Terapli SaaS
 * Página principal para comercialización de la plataforma
 */

// SEO Meta
useSeoMeta({
  title: 'Terapli - Gestión Inteligente para Terapeutas',
  description: 'La plataforma todo-en-uno para psicólogos y terapeutas. Gestiona pacientes, agenda, bonos y pagos desde un solo lugar. Simplifica tu práctica, enfócate en lo que importa.',
  ogTitle: 'Terapli - Gestión Inteligente para Terapeutas',
  ogDescription: 'La plataforma todo-en-uno para psicólogos y terapeutas. Gestiona pacientes, agenda, bonos y pagos desde un solo lugar.',
  ogImage: '/images/og-terapli.png',
  twitterCard: 'summary_large_image',
})

definePageMeta({
  layout: 'default',
  ssr: true // Permitir SSR pero manejar cliente correctamente
})

// Estado del formulario waitlist
const email = ref('')
const enviando = ref(false)
const enviado = ref(false)
const error = ref('')

// Solo inicializar supabase en el cliente
const supabase = import.meta.client ? useSupabaseClient() : null

const unirseWaitlist = async () => {
  if (!email.value || !email.value.includes('@')) {
    error.value = 'Por favor, introduce un email válido'
    return
  }

  // Verificar que estamos en cliente y supabase está disponible
  if (!import.meta.client || !supabase) {
    error.value = 'Error de conexión. Recarga la página.'
    return
  }

  enviando.value = true
  error.value = ''

  try {
    const { error: dbError } = await supabase
      .from('waitlist')
      .insert({
        email: email.value.toLowerCase().trim(),
        source: 'landing_page'
      })

    if (dbError) {
      if (dbError.code === '23505') {
        error.value = 'Este email ya está en la lista de espera'
      } else {
        throw dbError
      }
    } else {
      enviado.value = true
      email.value = ''
    }
  } catch (err) {
    console.error('Error:', err)
    error.value = 'Hubo un error. Inténtalo de nuevo.'
  } finally {
    enviando.value = false
  }
}

// Features de la plataforma
const features = [
  {
    icon: 'calendar',
    title: 'Agenda Inteligente',
    description: 'Vista semanal, diaria o mensual con drag & drop. Detecta huecos y sugiere horarios óptimos automáticamente.',
    color: 'violet'
  },
  {
    icon: 'users',
    title: 'Gestión de Pacientes',
    description: 'Historial completo, notas de sesión, evolución emocional y seguimiento personalizado de cada paciente.',
    color: 'emerald'
  },
  {
    icon: 'ticket',
    title: 'Sistema de Bonos',
    description: 'Crea bonos de sesiones, rastrea uso automático y recibe alertas cuando están por agotarse.',
    color: 'amber'
  },
  {
    icon: 'chart',
    title: 'Métricas en Tiempo Real',
    description: 'Ocupación, ingresos, tasa de confirmación y tendencias. Todo visible en tu dashboard personalizado.',
    color: 'blue'
  },
  {
    icon: 'shield',
    title: 'Seguridad Multi-tenant',
    description: 'Cada terapeuta tiene su espacio aislado. Tus datos y los de tus pacientes, 100% protegidos.',
    color: 'rose'
  },
  {
    icon: 'mobile',
    title: 'PWA Instalable',
    description: 'Instálala en tu móvil o tablet como una app nativa. Funciona sin conexión para consultar datos.',
    color: 'cyan'
  }
]

// Stats
const stats = [
  { value: '500+', label: 'Citas gestionadas' },
  { value: '98%', label: 'Tasa de confirmación' },
  { value: '3h', label: 'Ahorro semanal' },
  { value: '100%', label: 'Datos protegidos' }
]
</script>

<template>
  <div class="min-h-screen bg-[#FAFAFA]">
    <!-- ============================================================ -->
    <!-- HERO SECTION -->
    <!-- ============================================================ -->
    <section class="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <!-- Background gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-emerald-50/30"></div>

      <!-- Decorative elements -->
      <div class="absolute top-20 left-10 w-72 h-72 bg-violet-200/30 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <!-- Left: Copy -->
          <div class="text-center lg:text-left">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full text-violet-700 text-sm font-medium mb-6">
              <span class="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
              Próximamente disponible
            </div>

            <!-- Headline -->
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Tu consulta,
              <span class="bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent">
                simplificada
              </span>
            </h1>

            <!-- Subheadline -->
            <p class="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              La plataforma todo-en-uno para terapeutas. Gestiona pacientes, agenda, bonos y pagos
              desde un solo lugar. <strong class="text-gray-800">Enfócate en lo que importa: tus pacientes.</strong>
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <NuxtLink
                to="/login"
                class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/25 hover:shadow-xl hover:shadow-violet-600/30 hover:-translate-y-0.5"
              >
                <span>Acceder a la plataforma</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </NuxtLink>

              <a
                href="#waitlist"
                class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-violet-300 transition-all duration-300"
              >
                <span>Unirse a la lista de espera</span>
              </a>
            </div>

            <!-- Social proof mini -->
            <div class="flex items-center gap-4 justify-center lg:justify-start text-sm text-gray-500">
              <div class="flex -space-x-2">
                <div class="w-8 h-8 rounded-full bg-violet-200 border-2 border-white flex items-center justify-center text-xs font-bold text-violet-700">K</div>
                <div class="w-8 h-8 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-xs font-bold text-emerald-700">M</div>
                <div class="w-8 h-8 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-xs font-bold text-amber-700">+</div>
              </div>
              <span>Únete a terapeutas que ya simplifican su práctica</span>
            </div>
          </div>

          <!-- Right: App Preview -->
          <div class="relative">
            <!-- Main screenshot mockup -->
            <div class="relative bg-white rounded-2xl shadow-2xl shadow-gray-900/10 overflow-hidden border border-gray-200">
              <!-- Browser bar -->
              <div class="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
                <div class="flex gap-1.5">
                  <div class="w-3 h-3 rounded-full bg-red-400"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div class="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div class="flex-1 mx-4">
                  <div class="bg-white rounded-md px-3 py-1.5 text-xs text-gray-400 text-center">
                    app.terapli.com/terapeuta/dashboard
                  </div>
                </div>
              </div>

              <!-- Dashboard preview -->
              <div class="p-4 bg-gray-50">
                <!-- Mini dashboard mockup -->
                <div class="space-y-3">
                  <!-- Header -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-gray-900">Dashboard</p>
                        <p class="text-xs text-gray-500">Hoy, 30 de diciembre</p>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <div class="w-8 h-8 rounded-lg bg-gray-100"></div>
                      <div class="w-8 h-8 rounded-lg bg-violet-600"></div>
                    </div>
                  </div>

                  <!-- Stats cards -->
                  <div class="grid grid-cols-3 gap-2">
                    <div class="bg-white rounded-xl p-3 border border-gray-100">
                      <p class="text-xs text-gray-500">Hoy</p>
                      <p class="text-lg font-bold text-gray-900">6</p>
                      <p class="text-[10px] text-emerald-600">citas</p>
                    </div>
                    <div class="bg-white rounded-xl p-3 border border-gray-100">
                      <p class="text-xs text-gray-500">Ocupación</p>
                      <p class="text-lg font-bold text-violet-600">78%</p>
                      <p class="text-[10px] text-emerald-600">+12%</p>
                    </div>
                    <div class="bg-white rounded-xl p-3 border border-gray-100">
                      <p class="text-xs text-gray-500">Ingresos</p>
                      <p class="text-lg font-bold text-emerald-600">€420</p>
                      <p class="text-[10px] text-gray-500">semana</p>
                    </div>
                  </div>

                  <!-- Mini calendar preview -->
                  <div class="bg-white rounded-xl p-3 border border-gray-100">
                    <div class="flex items-center justify-between mb-2">
                      <p class="text-xs font-medium text-gray-700">Próximas citas</p>
                      <span class="text-[10px] text-violet-600">Ver todas</span>
                    </div>
                    <div class="space-y-2">
                      <div class="flex items-center gap-2 p-2 bg-violet-50 rounded-lg">
                        <div class="w-1 h-8 bg-violet-500 rounded-full"></div>
                        <div class="flex-1">
                          <p class="text-xs font-medium text-gray-900">María López</p>
                          <p class="text-[10px] text-gray-500">10:00 - 11:00</p>
                        </div>
                        <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full">Confirmada</span>
                      </div>
                      <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div class="w-1 h-8 bg-amber-500 rounded-full"></div>
                        <div class="flex-1">
                          <p class="text-xs font-medium text-gray-900">Carlos Ruiz</p>
                          <p class="text-[10px] text-gray-500">11:30 - 12:30</p>
                        </div>
                        <span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full">Pendiente</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Floating elements -->
            <div class="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-gray-100 animate-bounce-subtle">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-900">Cita confirmada</p>
                  <p class="text-[10px] text-gray-500">Hace 2 min</p>
                </div>
              </div>
            </div>

            <div class="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-gray-100">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-900">Bono activado</p>
                  <p class="text-[10px] text-gray-500">5 sesiones restantes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- STATS SECTION -->
    <!-- ============================================================ -->
    <section class="py-12 bg-white border-y border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <p class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent">
              {{ stat.value }}
            </p>
            <p class="text-sm text-gray-500 mt-1">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- FEATURES SECTION -->
    <!-- ============================================================ -->
    <section id="features" class="py-20 md:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section header -->
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="text-violet-600 font-semibold text-sm uppercase tracking-wider">Características</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Todo lo que necesitas para gestionar tu práctica
          </h2>
          <p class="text-lg text-gray-600">
            Herramientas diseñadas específicamente para terapeutas y psicólogos. Sin complicaciones, sin curva de aprendizaje.
          </p>
        </div>

        <!-- Features grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300"
          >
            <!-- Icon -->
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
              :class="{
                'bg-violet-100 text-violet-600': feature.color === 'violet',
                'bg-emerald-100 text-emerald-600': feature.color === 'emerald',
                'bg-amber-100 text-amber-600': feature.color === 'amber',
                'bg-blue-100 text-blue-600': feature.color === 'blue',
                'bg-rose-100 text-rose-600': feature.color === 'rose',
                'bg-cyan-100 text-cyan-600': feature.color === 'cyan'
              }"
            >
              <!-- Calendar icon -->
              <svg v-if="feature.icon === 'calendar'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <!-- Users icon -->
              <svg v-else-if="feature.icon === 'users'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <!-- Ticket icon -->
              <svg v-else-if="feature.icon === 'ticket'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <!-- Chart icon -->
              <svg v-else-if="feature.icon === 'chart'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <!-- Shield icon -->
              <svg v-else-if="feature.icon === 'shield'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <!-- Mobile icon -->
              <svg v-else-if="feature.icon === 'mobile'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>

            <!-- Content -->
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ feature.title }}</h3>
            <p class="text-gray-600 text-sm leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- APP SHOWCASE SECTION -->
    <!-- ============================================================ -->
    <section class="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Left: Content -->
          <div>
            <span class="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Diseñado para ti</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-6">
              Una agenda que entiende tu forma de trabajar
            </h2>
            <p class="text-lg text-gray-600 mb-8">
              Vista semanal, diaria o mensual. Arrastra y suelta para reprogramar.
              Métricas en tiempo real para saber cómo va tu práctica.
            </p>

            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Detección inteligente de huecos</p>
                  <p class="text-sm text-gray-500">Te sugiere cuándo puedes agendar más citas</p>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Bloqueo de horarios</p>
                  <p class="text-sm text-gray-500">Marca horas como no disponible con un clic</p>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Notas de última sesión</p>
                  <p class="text-sm text-gray-500">Revisa el contexto antes de cada cita</p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Right: Screenshot -->
          <div class="relative">
            <div class="bg-white rounded-2xl shadow-2xl shadow-gray-900/10 overflow-hidden border border-gray-200 p-2">
              <!-- Agenda mockup -->
              <div class="bg-gray-50 rounded-xl p-4">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <button class="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span class="text-sm font-semibold text-gray-900">Diciembre 2025</span>
                    <button class="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div class="flex gap-1">
                    <span class="px-3 py-1 bg-violet-600 text-white text-xs rounded-lg">Semana</span>
                    <span class="px-3 py-1 bg-white text-gray-500 text-xs rounded-lg border border-gray-200">Mes</span>
                  </div>
                </div>

                <!-- Calendar grid -->
                <div class="grid grid-cols-5 gap-1 text-center mb-2">
                  <span class="text-[10px] text-gray-400 py-1">LUN</span>
                  <span class="text-[10px] text-gray-400 py-1">MAR</span>
                  <span class="text-[10px] text-gray-400 py-1">MIÉ</span>
                  <span class="text-[10px] text-gray-400 py-1">JUE</span>
                  <span class="text-[10px] text-gray-400 py-1">VIE</span>
                </div>

                <!-- Time slots -->
                <div class="space-y-1">
                  <div class="grid grid-cols-5 gap-1">
                    <div class="bg-violet-100 rounded-lg p-2 text-[10px]">
                      <p class="font-medium text-violet-700">10:00</p>
                      <p class="text-violet-600 truncate">María L.</p>
                    </div>
                    <div class="bg-emerald-100 rounded-lg p-2 text-[10px]">
                      <p class="font-medium text-emerald-700">10:00</p>
                      <p class="text-emerald-600 truncate">Carlos R.</p>
                    </div>
                    <div class="bg-gray-100 rounded-lg p-2 text-[10px] border border-dashed border-gray-300">
                      <p class="font-medium text-gray-400">10:00</p>
                      <p class="text-gray-400">Disponible</p>
                    </div>
                    <div class="bg-violet-100 rounded-lg p-2 text-[10px]">
                      <p class="font-medium text-violet-700">10:00</p>
                      <p class="text-violet-600 truncate">Ana G.</p>
                    </div>
                    <div class="bg-amber-100 rounded-lg p-2 text-[10px]">
                      <p class="font-medium text-amber-700">10:00</p>
                      <p class="text-amber-600 truncate">Pedro M.</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-5 gap-1">
                    <div class="bg-emerald-100 rounded-lg p-2 text-[10px]">
                      <p class="font-medium text-emerald-700">11:30</p>
                      <p class="text-emerald-600 truncate">Luis S.</p>
                    </div>
                    <div class="bg-gray-200 rounded-lg p-2 text-[10px]" style="background: repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 4px, #f3f4f6 4px, #f3f4f6 8px)">
                      <p class="font-medium text-gray-500">11:30</p>
                      <p class="text-gray-500">Bloqueado</p>
                    </div>
                    <div class="bg-violet-100 rounded-lg p-2 text-[10px]">
                      <p class="font-medium text-violet-700">11:30</p>
                      <p class="text-violet-600 truncate">Sara P.</p>
                    </div>
                    <div class="bg-emerald-100 rounded-lg p-2 text-[10px]">
                      <p class="font-medium text-emerald-700">11:30</p>
                      <p class="text-emerald-600 truncate">Juan C.</p>
                    </div>
                    <div class="bg-violet-100 rounded-lg p-2 text-[10px]">
                      <p class="font-medium text-violet-700">11:30</p>
                      <p class="text-violet-600 truncate">Elena R.</p>
                    </div>
                  </div>
                </div>

                <!-- Metrics bar -->
                <div class="mt-4 flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-1.5">
                      <div class="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                        <span class="text-[10px] font-bold text-violet-700">78%</span>
                      </div>
                      <span class="text-[10px] text-gray-500">Ocupación</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span class="text-[10px] font-bold text-emerald-700">92%</span>
                      </div>
                      <span class="text-[10px] text-gray-500">Confirmación</span>
                    </div>
                  </div>
                  <span class="text-[10px] font-medium text-violet-600">€1,250 previstos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- WAITLIST SECTION -->
    <!-- ============================================================ -->
    <section id="waitlist" class="py-20 md:py-32 bg-gradient-to-br from-violet-600 to-violet-800 relative overflow-hidden">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>

      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
          Sé de los primeros en probarlo
        </h2>
        <p class="text-lg text-violet-200 mb-8 max-w-2xl mx-auto">
          Únete a la lista de espera y te avisaremos cuando Terapli esté listo.
          Los primeros usuarios tendrán acceso exclusivo y precios especiales de lanzamiento.
        </p>

        <!-- Form -->
        <div v-if="!enviado" class="max-w-md mx-auto">
          <form @submit.prevent="unirseWaitlist" class="flex flex-col sm:flex-row gap-3">
            <input
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              class="flex-1 px-5 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-violet-300 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              :disabled="enviando"
            />
            <button
              type="submit"
              :disabled="enviando"
              class="px-8 py-4 bg-white hover:bg-gray-100 text-violet-700 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span v-if="!enviando">Unirme</span>
              <span v-else class="flex items-center gap-2">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            </button>
          </form>
          <p v-if="error" class="mt-3 text-red-300 text-sm">{{ error }}</p>
          <p class="mt-4 text-violet-300 text-sm">
            Sin spam. Solo te avisaremos cuando estemos listos.
          </p>
        </div>

        <!-- Success message -->
        <div v-else class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
          <div class="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">¡Estás en la lista!</h3>
          <p class="text-violet-200">
            Te avisaremos en cuanto Terapli esté listo. Mientras tanto, puedes
            <NuxtLink to="/login" class="text-white underline hover:no-underline">explorar la plataforma</NuxtLink>
            si ya tienes acceso.
          </p>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- FINAL CTA SECTION -->
    <!-- ============================================================ -->
    <section class="py-20 md:py-32">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          ¿Listo para simplificar tu práctica?
        </h2>
        <p class="text-lg text-gray-600 mb-8">
          Accede ahora si ya tienes cuenta, o únete a la lista de espera para el lanzamiento oficial.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/login"
            class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/25"
          >
            Acceder a Terapli
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NuxtLink>
          <a
            href="#waitlist"
            class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 transition-all duration-300"
          >
            Unirse a la lista de espera
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 3s ease-in-out infinite;
}
</style>
