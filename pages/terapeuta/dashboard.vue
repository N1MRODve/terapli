<template>
  <div class="dashboard-terapeuta min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- ================================================================= -->
      <!-- HEADER - Resumen accionable del día -->
      <!-- ================================================================= -->
      <header class="mb-8">
        <!-- Fila superior: Título + Botones -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {{ resumenDiaTexto }}
            </h1>
            <p class="text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
              <span v-if="sesionesHoy > 0" class="inline-flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-violet-500"></span>
                <span class="font-medium text-gray-700">{{ sesionesHoy }} {{ sesionesHoy === 1 ? 'sesión' : 'sesiones' }}</span>
              </span>
              <span v-if="sesionesHoy > 0 && cobrosPendientesHoy > 0" class="text-gray-300">•</span>
              <span v-if="cobrosPendientesHoy > 0" class="inline-flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span class="font-medium text-amber-600">{{ cobrosPendientesHoy }} {{ cobrosPendientesHoy === 1 ? 'cobro pendiente' : 'cobros pendientes' }}</span>
              </span>
              <span v-if="sesionesHoy === 0 && cobrosPendientesHoy === 0" class="text-gray-500">
                Sin tareas pendientes para hoy
              </span>
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="navegarANuevaCita"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 shadow-sm hover:shadow transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nueva cita
            </button>
            <button
              @click="navegarANuevoPaciente"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Nuevo paciente
            </button>
          </div>
        </div>

        <!-- Barra de búsqueda central -->
        <DashboardSearchBar @abrir-cita="abrirDetalles" />
      </header>

      <!-- ================================================================= -->
      <!-- SECCIÓN 1: ¿QUÉ TENGO QUE HACER HOY? -->
      <!-- Próximas sesiones + Pendientes de cobro -->
      <!-- ================================================================= -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        <!-- =============================================================== -->
        <!-- PRÓXIMAS SESIONES DE HOY (2/3 del ancho) -->
        <!-- =============================================================== -->
        <section class="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <!-- Header de seccion -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Sesiones de hoy</h2>
                <p class="text-sm text-gray-500">
                  {{ fechaHoyCompleta }} ·
                  <span :class="sesionesHoy > 0 ? 'text-violet-600 font-medium' : 'text-gray-400'">
                    {{ sesionesHoy }} {{ sesionesHoy === 1 ? 'sesión programada' : 'sesiones programadas' }}
                  </span>
                </p>
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
              <div class="w-8 h-8 border-2 border-gray-200 border-t-violet-600 rounded-full animate-spin mb-3"></div>
              <p class="text-sm text-gray-500">Cargando sesiones...</p>
            </div>

            <!-- Empty state mejorado -->
            <div v-else-if="sesionesHoy === 0" class="flex flex-col items-center justify-center py-10 text-center">
              <div class="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="text-gray-700 font-medium mb-1">{{ esDiaLibre ? 'Día libre' : 'Hoy no tienes sesiones programadas' }}</p>
              <p class="text-sm text-gray-400 mb-4">{{ esDiaLibre ? 'Disfruta de tu descanso' : 'Aprovecha para organizar tu agenda o añadir nuevas citas' }}</p>
              <NuxtLink
                v-if="!esDiaLibre"
                to="/terapeuta/agenda"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Programar cita
              </NuxtLink>

              <!-- Mostrar próximas sesiones si hay -->
              <div v-if="proximasSesiones.length > 0" class="mt-6 pt-6 border-t border-gray-100 w-full">
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Próximas sesiones</p>
                <div class="space-y-2">
                  <DashboardSessionCard
                    v-for="(cita, index) in proximasSesiones.slice(0, 3)"
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
                    @registrar-pago="abrirDetalles"
                  />
                </div>
              </div>
            </div>

            <!-- Lista de citas de hoy -->
            <div v-else class="space-y-3">
              <DashboardSessionCard
                v-for="(cita, index) in sesionesDeHoyVisibles"
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
                @registrar-pago="abrirDetalles"
              />

              <!-- Próximas sesiones (otros días) -->
              <div v-if="sesionesFuturas.length > 0" class="mt-4 pt-4 border-t border-gray-100">
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Próximos días</p>
                <div class="space-y-2">
                  <DashboardSessionCard
                    v-for="(cita, index) in sesionesFuturasVisibles"
                    :key="cita.id"
                    :id="cita.id"
                    :fecha="cita.fecha_cita"
                    :hora="cita.hora_inicio"
                    :paciente-nombre="cita.paciente_nombre"
                    :modalidad="cita.modalidad"
                    :estado="cita.estado"
                    :is-next="false"
                    @click="abrirDetalles"
                    @confirmar="confirmarCitaRapido"
                    @registrar-pago="abrirDetalles"
                  />
                </div>
              </div>

              <!-- Botón ver más sesiones futuras -->
              <button
                v-if="sesionesFuturas.length > 3 && !mostrarTodasSesiones"
                @click="mostrarTodasSesiones = true"
                class="w-full py-3 text-sm font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>Ver {{ sesionesFuturas.length - 3 }} sesiones más</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Botón mostrar menos -->
              <button
                v-if="mostrarTodasSesiones && sesionesFuturas.length > 3"
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
        <!-- PENDIENTES DE COBRO (1/3 del ancho) -->
        <!-- =============================================================== -->
        <DashboardPaymentsTodayCard
          ref="paymentsTodayCardRef"
          @abrir-cita="abrirDetalles"
          @cobrar="abrirDetalles"
        />
      </div>

      <!-- ================================================================= -->
      <!-- SECCIÓN 2: SEGUIMIENTO DE PACIENTES -->
      <!-- Últimos pacientes + Recordatorios de bonos -->
      <!-- ================================================================= -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-8">

        <!-- =============================================================== -->
        <!-- ACTIVIDAD RECIENTE DE PACIENTES -->
        <!-- =============================================================== -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <!-- Header de sección -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Actividad reciente de pacientes</h2>
                <p class="text-xs text-gray-500">Últimos {{ filtroDiasPacientes }} días</p>
              </div>
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

          <!-- Filtro por días -->
          <div class="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-gray-500 mr-1">Ver últimos:</span>
              <button
                v-for="dias in [5, 10, 30]"
                :key="dias"
                @click="cambiarFiltroPacientes(dias)"
                :class="[
                  'px-2.5 py-1 text-xs font-medium rounded-full transition-colors',
                  filtroDiasPacientes === dias
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                ]"
              >
                {{ dias }} días
              </button>
            </div>
          </div>

          <!-- Lista de pacientes -->
          <div class="p-4">
            <!-- Loading -->
            <div v-if="cargandoPacientes" class="flex flex-col items-center justify-center py-8">
              <div class="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mb-2"></div>
              <p class="text-sm text-gray-500">Cargando...</p>
            </div>

            <!-- Empty state -->
            <div v-else-if="pacientesActivos.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
              <div class="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p class="text-gray-700 font-medium mb-1">Sin sesiones en este período</p>
              <p class="text-sm text-gray-400 mb-3 max-w-[220px]">No hay pacientes con citas en los últimos {{ filtroDiasPacientes }} días. Prueba ampliando el filtro.</p>
              <button
                v-if="filtroDiasPacientes < 30"
                @click="cambiarFiltroPacientes(30)"
                class="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
              >
                Ver últimos 30 días
              </button>
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

        <!-- =============================================================== -->
        <!-- BONOS PRÓXIMOS A AGOTARSE -->
        <!-- =============================================================== -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">
                  Bonos por agotarse
                  <span v-if="bonosPorAgotar.length > 0" class="text-amber-600">({{ bonosPorAgotar.length }})</span>
                </h2>
                <p class="text-xs text-gray-500">Bonos con 2 sesiones o menos</p>
              </div>
            </div>
            <button
              v-if="!cargandoBonos"
              @click="cargarBonosPorAgotar"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Actualizar bonos"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <!-- Lista de bonos -->
          <div class="p-4">
            <!-- Loading -->
            <div v-if="cargandoBonos" class="flex flex-col items-center justify-center py-8">
              <div class="w-8 h-8 border-2 border-gray-200 border-t-amber-600 rounded-full animate-spin mb-2"></div>
              <p class="text-sm text-gray-500">Cargando bonos...</p>
            </div>

            <!-- Empty state -->
            <div v-else-if="bonosPorAgotar.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
              <div class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="text-gray-700 font-medium">Todos los bonos bajo control</p>
              <p class="text-sm text-gray-400 mt-1 max-w-[200px]">Ningún paciente necesita renovar su bono próximamente</p>
            </div>

            <!-- Lista de bonos -->
            <div v-else class="space-y-2">
              <DashboardBonoCard
                v-for="bono in bonosVisibles"
                :key="bono.id"
                :id="bono.id"
                :paciente-id="bono.paciente_id"
                :paciente-nombre="bono.paciente_nombre"
                :tipo-bono="bono.tipo_bono"
                :sesiones-restantes="bono.sesiones_restantes"
                :sesiones-totales="bono.sesiones_totales"
                :ultima-sesion="bono.ultima_sesion"
                @ver-bono="navegarABono"
                @programar-cita="programarCitaPaciente"
              />

              <!-- Ver más bonos -->
              <button
                v-if="bonosPorAgotar.length > 4 && !mostrarTodosBonos"
                @click="mostrarTodosBonos = true"
                class="w-full py-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
              >
                Ver {{ bonosPorAgotar.length - 4 }} más
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
          <!-- Header con selector de período -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Analítica del Profesional</h2>
                <p class="text-xs text-gray-500">{{ periodoTexto }}</p>
              </div>
            </div>

            <!-- Selector de período -->
            <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                v-for="periodo in periodos"
                :key="periodo.valor"
                @click="cambiarPeriodoAnalitica(periodo.valor)"
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  periodoAnalitica === periodo.valor
                    ? 'bg-white text-violet-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                ]"
              >
                {{ periodo.etiqueta }}
              </button>
            </div>
          </div>

          <!-- Grid de métricas mejorado -->
          <div class="p-6">
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <!-- Pacientes activos -->
              <NuxtLink
                to="/terapeuta/pacientes"
                class="group p-4 bg-gray-50 hover:bg-violet-50 rounded-xl border border-gray-100 hover:border-violet-200 transition-all cursor-pointer"
              >
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-gray-400 group-hover:text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="text-xs font-medium text-gray-500 group-hover:text-violet-600">Pacientes activos</span>
                </div>
                <p class="text-3xl font-bold text-gray-900 group-hover:text-violet-700">{{ totalPacientes }}</p>
                <p class="text-xs text-gray-400 mt-1 group-hover:text-violet-500">Ver todos →</p>
              </NuxtLink>

              <!-- Sesiones del período -->
              <NuxtLink
                to="/terapeuta/sesiones"
                class="group p-4 bg-gray-50 hover:bg-violet-50 rounded-xl border border-gray-100 hover:border-violet-200 transition-all cursor-pointer"
              >
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-gray-400 group-hover:text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-xs font-medium text-gray-500 group-hover:text-violet-600">Sesiones</span>
                </div>
                <p class="text-3xl font-bold text-gray-900 group-hover:text-violet-700">{{ totalSesionesMes }}</p>
                <p class="text-xs text-gray-400 mt-1 group-hover:text-violet-500">Ver sesiones →</p>
              </NuxtLink>

              <!-- Ocupación de agenda -->
              <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span class="text-xs font-medium text-gray-500">Ocupación</span>
                  </div>
                  <!-- Badge comparativa vs período anterior -->
                  <span
                    v-if="variacionOcupacion !== 0"
                    :class="[
                      'px-1.5 py-0.5 text-[10px] font-semibold rounded',
                      variacionOcupacion > 0 ? 'bg-emerald-200 text-emerald-700' : 'bg-red-100 text-red-600'
                    ]"
                  >
                    {{ variacionOcupacion > 0 ? '↑' : '↓' }} {{ Math.abs(variacionOcupacion) }}%
                  </span>
                </div>
                <p class="text-3xl font-bold" :class="porcentajeOcupacion >= 70 ? 'text-emerald-600' : porcentajeOcupacion >= 40 ? 'text-amber-600' : 'text-gray-900'">
                  {{ porcentajeOcupacion }}%
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ detalleAgenda.horasOcupadas }}h de {{ detalleAgenda.horasDisponibles }}h disponibles
                </p>
              </div>

              <!-- Tasa de cancelación -->
              <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span class="text-xs font-medium text-gray-500">Cancelaciones</span>
                </div>
                <p class="text-3xl font-bold" :class="tasaCancelacion <= 10 ? 'text-emerald-600' : tasaCancelacion <= 20 ? 'text-amber-600' : 'text-red-600'">
                  {{ tasaCancelacion }}%
                </p>
                <p v-if="detalleAgenda.cancelaciones > 0" class="text-xs text-gray-500 mt-1">
                  {{ detalleAgenda.cancelaciones }} de {{ detalleAgenda.totalCitas }} citas
                </p>
                <p v-else class="text-xs text-gray-400 mt-1">Sin cancelaciones</p>
              </div>

              <!-- Ingresos con comparativa -->
              <NuxtLink
                to="/terapeuta/pagos"
                class="group p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-xs font-medium text-emerald-600">Ingresos</span>
                  </div>
                  <!-- Badge comparativa -->
                  <span
                    v-if="comparativaMesAnterior !== 0"
                    :class="[
                      'px-1.5 py-0.5 text-[10px] font-semibold rounded',
                      comparativaMesAnterior > 0 ? 'bg-emerald-200 text-emerald-700' : 'bg-red-100 text-red-600'
                    ]"
                  >
                    {{ comparativaMesAnterior > 0 ? '↑' : '↓' }} {{ Math.abs(comparativaMesAnterior) }}%
                  </span>
                </div>
                <p class="text-3xl font-bold text-emerald-700">{{ formatearPrecio(totalConfirmado) }}€</p>
                <p class="text-xs text-emerald-500 mt-1">
                  {{ totalBonosPagados }} {{ totalBonosPagados === 1 ? 'pago' : 'pagos' }} · Ver pagos →
                </p>
              </NuxtLink>
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

    <!-- ================================================================= -->
    <!-- MODAL DE NUEVA CITA -->
    <!-- ================================================================= -->
    <ModalNuevaCita
      v-model="modalNuevaCitaAbierto"
      @close="modalNuevaCitaAbierto = false"
      @cita-creada="handleCitaCreada"
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
const porcentajeOcupacion = ref(0)
const tasaCancelacion = ref(0)
const modalDetallesAbierto = ref(false)
const modalNuevaCitaAbierto = ref(false)
const citaSeleccionada = ref<string | null>(null)
const mostrarTodasSesiones = ref(false)
const mostrarTodosRecordatorios = ref(false)
const mostrarTodosBonos = ref(false)
const filtroDiasPacientes = ref(5) // Días para filtrar actividad de pacientes

// Estado de bonos por agotar
const bonosPorAgotar = ref<any[]>([])
const cargandoBonos = ref(true)

// Estado de analítica
const periodoAnalitica = ref<'mes' | '3meses' | 'anio'>('mes')
const periodos = [
  { valor: 'mes', etiqueta: 'Mes' },
  { valor: '3meses', etiqueta: '3 meses' },
  { valor: 'anio', etiqueta: 'Año' }
] as const

// Detalle de métricas de agenda
const detalleAgenda = ref({
  horasDisponibles: 0,
  horasOcupadas: 0,
  cancelaciones: 0,
  totalCitas: 0
})

// Comparativa período anterior
const comparativaMesAnterior = ref(0)
const ingresosMesAnterior = ref(0)
const ocupacionPeriodoAnterior = ref(0)
const variacionOcupacion = ref(0) // Porcentaje de cambio vs período anterior

// Configuración de agenda del terapeuta
const configuracionAgenda = ref<{
  horario: { inicio_manana: string; fin_manana: string; inicio_tarde: string; fin_tarde: string }
  dias_laborables: number[]
  buffer_minutos: number
} | null>(null)

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

// Resumen del día para el header
const resumenDiaTexto = computed(() => {
  const hoy = new Date()
  const diaSemana = hoy.toLocaleDateString('es-ES', { weekday: 'long' })
  const dia = hoy.getDate()
  const mes = hoy.toLocaleDateString('es-ES', { month: 'long' })
  // Capitalizar primera letra
  const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)
  return `Hoy, ${diaCapitalizado.toLowerCase()} ${dia} de ${mes}`
})

// Sesiones de hoy
const sesionesHoy = computed(() => {
  const hoy = new Date().toISOString().split('T')[0]
  return proximasSesiones.value.filter(s => s.fecha_cita === hoy).length
})

// Fecha de hoy completa para subtítulo
const fechaHoyCompleta = computed(() => {
  const hoy = new Date()
  const diaSemana = hoy.toLocaleDateString('es-ES', { weekday: 'long' })
  const dia = hoy.getDate()
  const mes = hoy.toLocaleDateString('es-ES', { month: 'long' })
  // Capitalizar primera letra del día
  return `${diaSemana.charAt(0).toUpperCase()}${diaSemana.slice(1)}, ${dia} de ${mes}`
})

// Detectar si es fin de semana (día libre típico)
const esDiaLibre = computed(() => {
  const hoy = new Date()
  const diaSemana = hoy.getDay()
  // 0 = domingo, 6 = sábado
  return diaSemana === 0 || diaSemana === 6
})

// Sesiones de hoy para mostrar
const sesionesDeHoy = computed(() => {
  const hoy = new Date().toISOString().split('T')[0]
  return proximasSesiones.value.filter(s => s.fecha_cita === hoy)
})

// Sesiones de hoy visibles (con límite)
const sesionesDeHoyVisibles = computed(() => {
  return sesionesDeHoy.value
})

// Sesiones de días futuros
const sesionesFuturas = computed(() => {
  const hoy = new Date().toISOString().split('T')[0]
  return proximasSesiones.value.filter(s => s.fecha_cita > hoy)
})

// Sesiones futuras visibles (limitadas a 3)
const sesionesFuturasVisibles = computed(() => {
  if (mostrarTodasSesiones.value) {
    return sesionesFuturas.value
  }
  return sesionesFuturas.value.slice(0, 3)
})

// Cobros pendientes de hoy (estado pendiente_pago en citas de hoy)
const cobrosPendientesHoy = ref(0)

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

// Bonos visibles (con límite)
const bonosVisibles = computed(() => {
  if (mostrarTodosBonos.value) {
    return bonosPorAgotar.value
  }
  return bonosPorAgotar.value.slice(0, 4)
})

// Texto descriptivo del período seleccionado
const periodoTexto = computed(() => {
  const ahora = new Date()
  const mesActual = ahora.toLocaleDateString('es-ES', { month: 'long' })
  const anioActual = ahora.getFullYear()

  if (periodoAnalitica.value === 'mes') {
    return `Datos de ${mesActual} ${anioActual}`
  }
  if (periodoAnalitica.value === '3meses') {
    const mesInicio = new Date(ahora)
    mesInicio.setMonth(mesInicio.getMonth() - 2)
    const mesInicioNombre = mesInicio.toLocaleDateString('es-ES', { month: 'short' })
    const mesFinNombre = ahora.toLocaleDateString('es-ES', { month: 'short' })
    return `Últimos 3 meses (${mesInicioNombre} - ${mesFinNombre} ${anioActual})`
  }
  return `Año ${anioActual}`
})

// ============================================================================
// FUNCIONES DE NAVEGACIÓN
// ============================================================================

const navegarANuevaCita = () => {
  modalNuevaCitaAbierto.value = true
}

const handleCitaCreada = () => {
  modalNuevaCitaAbierto.value = false
  cargarSesiones()
}

const navegarANuevoPaciente = () => {
  navigateTo('/terapeuta/pacientes')
}

const navegarAPaciente = (id: string) => {
  if (!id) {
    console.error('[Dashboard] ERROR: ID de paciente no válido')
    return
  }
  console.log('[Dashboard] Navegando a ficha de paciente:', id)
  navigateTo(`/terapeuta/pacientes/${id}`)
}

// Cambiar filtro de días de pacientes y recargar
const cambiarFiltroPacientes = async (dias: number) => {
  filtroDiasPacientes.value = dias
  await cargarPacientes()
}

// Navegación a bono
const navegarABono = (bonoId: string) => {
  // Por ahora navegar al paciente del bono
  const bono = bonosPorAgotar.value.find(b => b.id === bonoId)
  if (bono && bono.paciente_id) {
    console.log('[Dashboard] Navegando a ficha desde bono:', bono.paciente_id)
    navigateTo(`/terapeuta/pacientes/${bono.paciente_id}`)
  }
}

// Programar cita para un paciente
const programarCitaPaciente = (pacienteId: string) => {
  router.push(`/terapeuta/agenda?paciente=${pacienteId}`)
}

// Cambiar período de analítica y recargar métricas
const cambiarPeriodoAnalitica = async (periodo: 'mes' | '3meses' | 'anio') => {
  periodoAnalitica.value = periodo
  await cargarMetricas()
  await cargarPagosConfirmados()
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

      // Cargar configuración de agenda del terapeuta
      const { data: terapeutaData } = await supabase
        .from('terapeutas')
        .select('id, configuracion_agenda, duracion_sesion_minutos')
        .eq('email', data.user.email)
        .single()

      if (terapeutaData?.configuracion_agenda) {
        configuracionAgenda.value = terapeutaData.configuracion_agenda
        terapeuta.value.id = terapeutaData.id
        terapeuta.value.duracion_sesion_minutos = terapeutaData.duracion_sesion_minutos || 60
      } else {
        // Valores por defecto si no hay configuración
        configuracionAgenda.value = {
          horario: { inicio_manana: '09:00', fin_manana: '14:00', inicio_tarde: '16:00', fin_tarde: '20:00' },
          dias_laborables: [1, 2, 3, 4, 5],
          buffer_minutos: 10
        }
      }
    }
  } catch (error) {
    console.error('Error al cargar perfil:', error)
    terapeuta.value = { nombre: 'Karem' }
    // Valores por defecto
    configuracionAgenda.value = {
      horario: { inicio_manana: '09:00', fin_manana: '14:00', inicio_tarde: '16:00', fin_tarde: '20:00' },
      dias_laborables: [1, 2, 3, 4, 5],
      buffer_minutos: 10
    }
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
    // Primero obtener el ID del terapeuta actual
    if (!user.value?.email) {
      pacientesActivos.value = []
      cargandoPacientes.value = false
      return
    }

    const { data: terapeutaData } = await supabase
      .from('terapeutas')
      .select('id')
      .eq('email', user.value.email)
      .single()

    if (!terapeutaData) {
      pacientesActivos.value = []
      cargandoPacientes.value = false
      return
    }

    // Obtener los pacientes del terapeuta
    const { data: pacientesDelTerapeuta } = await supabase
      .from('pacientes')
      .select('id')
      .eq('terapeuta_id', terapeutaData.id)
      .eq('activo', true)

    if (!pacientesDelTerapeuta || pacientesDelTerapeuta.length === 0) {
      pacientesActivos.value = []
      cargandoPacientes.value = false
      return
    }

    const pacienteIds = pacientesDelTerapeuta.map((p: any) => p.id)

    // Calcular fecha límite según el filtro
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - filtroDiasPacientes.value)
    const fechaLimiteStr = fechaLimite.toISOString().split('T')[0]
    const hoyStr = new Date().toISOString().split('T')[0]

    // Obtener citas del período para identificar pacientes con actividad reciente
    // Buscar tanto citas pasadas (realizadas) como próximas (confirmadas/pendientes)
    const { data: citasRecientes, error: citasError } = await supabase
      .from('citas')
      .select('paciente_id, fecha_cita, estado, pacientes(id, nombre_completo)')
      .in('paciente_id', pacienteIds)
      .in('estado', ['realizada', 'confirmada', 'pendiente'])
      .gte('fecha_cita', fechaLimiteStr)
      .lte('fecha_cita', hoyStr)
      .order('fecha_cita', { ascending: false })

    if (citasError) throw citasError

    // Crear mapa de pacientes únicos con su última sesión
    const pacientesMap = new Map<string, { id: string; nombre: string; ultimaSesion: string }>()
    citasRecientes?.forEach((cita: any) => {
      if (cita.paciente_id && cita.pacientes && !pacientesMap.has(cita.paciente_id)) {
        pacientesMap.set(cita.paciente_id, {
          id: cita.paciente_id,
          nombre: cita.pacientes.nombre_completo || 'Sin nombre',
          ultimaSesion: cita.fecha_cita
        })
      }
    })

    // Convertir a array y limitar
    const pacientesUnicos = Array.from(pacientesMap.values()).slice(0, 5)

    // Para cada paciente, obtener información de su bono activo
    const pacientesConBonos = await Promise.all(
      pacientesUnicos.map(async (p) => {
        let sesionesUsadas = 0
        let sesionesTotales = 0
        let estadoBono: 'activo' | 'por_agotar' | 'sin_bono' | 'agotado' = 'sin_bono'

        try {
          const { data: bonoData } = await supabase
            .from('bonos')
            .select('sesiones_totales, sesiones_restantes, estado')
            .eq('paciente_id', p.id)
            .in('estado', ['activo', 'pendiente'])
            .gt('sesiones_restantes', 0)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

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
          nombre_completo: p.nombre,
          ultima_sesion: p.ultimaSesion,
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

async function cargarBonosPorAgotar() {
  cargandoBonos.value = true
  try {
    // Obtener bonos activos con 2 sesiones o menos restantes
    const { data: bonos, error } = await supabase
      .from('bonos')
      .select(`
        id,
        paciente_id,
        tipo,
        sesiones_totales,
        sesiones_restantes,
        estado,
        pacientes (
          id,
          nombre_completo
        )
      `)
      .eq('estado', 'activo')
      .lte('sesiones_restantes', 2)
      .gt('sesiones_restantes', 0)
      .order('sesiones_restantes', { ascending: true })
      .limit(10)

    if (error) throw error

    // Para cada bono, obtener la última sesión del paciente
    const bonosConUltimaSesion = await Promise.all(
      (bonos || []).map(async (bono: any) => {
        let ultimaSesion = null

        try {
          const { data: ultimaCita } = await supabase
            .from('citas')
            .select('fecha_cita')
            .eq('paciente_id', bono.paciente_id)
            .eq('estado', 'realizada')
            .order('fecha_cita', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (ultimaCita) {
            ultimaSesion = ultimaCita.fecha_cita
          }
        } catch (err) {
          // Si no hay cita, mantener null
        }

        // Formatear tipo de bono
        let tipoBono = bono.tipo || 'Bono'
        if (tipoBono.toLowerCase().includes('semanal')) {
          tipoBono = `Bono Semanal ${bono.sesiones_totales} sesiones`
        } else if (tipoBono.toLowerCase().includes('mensual')) {
          tipoBono = `Bono Mensual ${bono.sesiones_totales} sesiones`
        } else {
          tipoBono = `Bono ${bono.sesiones_totales} sesiones`
        }

        return {
          id: bono.id,
          paciente_id: bono.paciente_id,
          paciente_nombre: bono.pacientes?.nombre_completo || 'Paciente',
          tipo_bono: tipoBono,
          sesiones_totales: bono.sesiones_totales || 0,
          sesiones_restantes: bono.sesiones_restantes || 0,
          ultima_sesion: ultimaSesion
        }
      })
    )

    bonosPorAgotar.value = bonosConUltimaSesion
  } catch (error) {
    console.error('Error al cargar bonos por agotar:', error)
    bonosPorAgotar.value = []
  } finally {
    cargandoBonos.value = false
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

    // Calcular fecha de inicio según período
    const fechaInicio = new Date()
    fechaInicio.setHours(0, 0, 0, 0)

    // Calcular duración del período para la comparativa
    let diasPeriodo = 0
    if (periodoAnalitica.value === 'mes') {
      fechaInicio.setDate(1)
      diasPeriodo = 30
    } else if (periodoAnalitica.value === '3meses') {
      fechaInicio.setMonth(fechaInicio.getMonth() - 2)
      fechaInicio.setDate(1)
      diasPeriodo = 90
    } else {
      // Año
      fechaInicio.setMonth(0)
      fechaInicio.setDate(1)
      diasPeriodo = 365
    }

    const fechaInicioStr = fechaInicio.toISOString().split('T')[0]
    const fechaFinStr = new Date().toISOString().split('T')[0]

    // Calcular fechas del período anterior para comparativa
    const fechaInicioPeriodoAnterior = new Date(fechaInicio)
    fechaInicioPeriodoAnterior.setDate(fechaInicioPeriodoAnterior.getDate() - diasPeriodo)
    const fechaFinPeriodoAnterior = new Date(fechaInicio)
    fechaFinPeriodoAnterior.setDate(fechaFinPeriodoAnterior.getDate() - 1)
    const fechaInicioPeriodoAnteriorStr = fechaInicioPeriodoAnterior.toISOString().split('T')[0]
    const fechaFinPeriodoAnteriorStr = fechaFinPeriodoAnterior.toISOString().split('T')[0]

    // Sesiones del período
    const { count: countSesiones } = await supabase
      .from('citas')
      .select('*', { count: 'exact', head: true })
      .gte('fecha_cita', fechaInicioStr)
      .lte('fecha_cita', fechaFinStr)

    totalSesionesMes.value = countSesiones || 0

    // Función auxiliar: calcular horas diarias según configuración del terapeuta
    const calcularHorasDiarias = (): number => {
      if (!configuracionAgenda.value?.horario) return 8 // Default 8 horas

      const { inicio_manana, fin_manana, inicio_tarde, fin_tarde } = configuracionAgenda.value.horario

      const parseHora = (hora: string): number => {
        const partes = hora.split(':').map(Number)
        const h = partes[0] || 0
        const m = partes[1] || 0
        return h + m / 60
      }

      const horasManana = parseHora(fin_manana) - parseHora(inicio_manana)
      const horasTarde = parseHora(fin_tarde) - parseHora(inicio_tarde)

      return Math.max(0, horasManana) + Math.max(0, horasTarde)
    }

    // Función auxiliar: calcular días laborables usando configuración del terapeuta
    const calcularDiasLaborables = (inicio: Date, fin: Date): number => {
      const diasConfig = configuracionAgenda.value?.dias_laborables || [1, 2, 3, 4, 5]
      let dias = 0
      const temp = new Date(inicio)
      while (temp <= fin) {
        if (diasConfig.includes(temp.getDay())) {
          dias++
        }
        temp.setDate(temp.getDate() + 1)
      }
      return dias
    }

    // Calcular días laborables en el período actual
    const fechaFin = new Date()
    const diasLaborables = calcularDiasLaborables(fechaInicio, fechaFin)

    // Calcular horas disponibles según horario real del terapeuta
    const horasPorDia = calcularHorasDiarias()
    const horasDisponibles = diasLaborables * horasPorDia

    // Obtener todas las citas del período actual
    const { data: citasPeriodo } = await supabase
      .from('citas')
      .select('estado, duracion_minutos')
      .gte('fecha_cita', fechaInicioStr)
      .lte('fecha_cita', fechaFinStr)

    // Función auxiliar: calcular ocupación de un conjunto de citas
    const calcularOcupacion = (citas: any[], horasDisp: number): { ocupacion: number; horasOcupadas: number; canceladas: number } => {
      if (!citas || citas.length === 0 || horasDisp <= 0) {
        return { ocupacion: 0, horasOcupadas: 0, canceladas: 0 }
      }

      const citasActivas = citas.filter(c =>
        c.estado !== 'cancelada' && c.estado !== 'no_show' && c.estado !== 'ausente'
      )
      const duracionDefault = terapeuta.value?.duracion_sesion_minutos || 60
      const minutosOcupados = citasActivas.reduce((acc, c) => acc + (c.duracion_minutos || duracionDefault), 0)
      const horasOcupadas = minutosOcupados / 60
      const canceladas = citas.filter(c => c.estado === 'cancelada').length

      return {
        ocupacion: Math.min(100, Math.round((horasOcupadas / horasDisp) * 100)),
        horasOcupadas: Math.round(horasOcupadas * 10) / 10,
        canceladas
      }
    }

    if (citasPeriodo && citasPeriodo.length > 0) {
      const resultado = calcularOcupacion(citasPeriodo, horasDisponibles)

      detalleAgenda.value = {
        horasDisponibles: Math.round(horasDisponibles * 10) / 10,
        horasOcupadas: resultado.horasOcupadas,
        cancelaciones: resultado.canceladas,
        totalCitas: citasPeriodo.length
      }

      porcentajeOcupacion.value = resultado.ocupacion

      // Calcular tasa de cancelación
      tasaCancelacion.value = Math.round((resultado.canceladas / citasPeriodo.length) * 100)
    } else {
      detalleAgenda.value = {
        horasDisponibles: Math.round(horasDisponibles * 10) / 10,
        horasOcupadas: 0,
        cancelaciones: 0,
        totalCitas: 0
      }
      porcentajeOcupacion.value = 0
      tasaCancelacion.value = 0
    }

    // Calcular ocupación del período anterior para comparativa
    const diasLaborablesAnterior = calcularDiasLaborables(fechaInicioPeriodoAnterior, fechaFinPeriodoAnterior)
    const horasDisponiblesAnterior = diasLaborablesAnterior * horasPorDia

    const { data: citasPeriodoAnterior } = await supabase
      .from('citas')
      .select('estado, duracion_minutos')
      .gte('fecha_cita', fechaInicioPeriodoAnteriorStr)
      .lte('fecha_cita', fechaFinPeriodoAnteriorStr)

    if (citasPeriodoAnterior && horasDisponiblesAnterior > 0) {
      const resultadoAnterior = calcularOcupacion(citasPeriodoAnterior, horasDisponiblesAnterior)
      ocupacionPeriodoAnterior.value = resultadoAnterior.ocupacion

      // Calcular variación porcentual
      if (resultadoAnterior.ocupacion > 0) {
        variacionOcupacion.value = porcentajeOcupacion.value - resultadoAnterior.ocupacion
      } else {
        variacionOcupacion.value = porcentajeOcupacion.value > 0 ? 100 : 0
      }
    } else {
      ocupacionPeriodoAnterior.value = 0
      variacionOcupacion.value = porcentajeOcupacion.value > 0 ? 100 : 0
    }
  } catch (error) {
    console.error('Error al cargar métricas:', error)
  }
}

async function cargarCobrosPendientesHoy() {
  try {
    const hoy = new Date().toISOString().split('T')[0]

    // Buscar citas de hoy realizadas o confirmadas (potencialmente por cobrar)
    const { count } = await supabase
      .from('citas')
      .select('*', { count: 'exact', head: true })
      .eq('fecha_cita', hoy)
      .in('estado', ['realizada', 'confirmada'])

    cobrosPendientesHoy.value = count || 0
  } catch (error) {
    console.error('Error al cargar cobros pendientes:', error)
    cobrosPendientesHoy.value = 0
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

    // 2. Citas pasadas no completadas (pendientes o confirmadas que ya pasaron)
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
      .in('estado', ['pendiente', 'confirmada'])
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
      .select('id')
      .eq('email', user.value.email)
      .single()

    if (!terapeutaData) return

    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id')
      .eq('terapeuta_id', terapeutaData.id)

    if (!pacientes || pacientes.length === 0) {
      totalConfirmado.value = 0
      totalBonosPagados.value = 0
      comparativaMesAnterior.value = 0
      return
    }

    const pacienteIds = pacientes.map((p: any) => p.id)

    // Calcular fecha de inicio según período
    const fechaInicio = new Date()
    fechaInicio.setHours(0, 0, 0, 0)

    if (periodoAnalitica.value === 'mes') {
      fechaInicio.setDate(1)
    } else if (periodoAnalitica.value === '3meses') {
      fechaInicio.setMonth(fechaInicio.getMonth() - 2)
      fechaInicio.setDate(1)
    } else {
      // Año
      fechaInicio.setMonth(0)
      fechaInicio.setDate(1)
    }

    const fechaInicioStr = fechaInicio.toISOString().split('T')[0]
    const fechaHoyStr = new Date().toISOString().split('T')[0]

    // 1. Obtener pagos de bonos del período
    const { data: bonos } = await supabase
      .from('bonos')
      .select('id, monto_total, created_at')
      .eq('pagado', true)
      .in('paciente_id', pacienteIds)
      .gte('created_at', fechaInicioStr)
      .lte('created_at', fechaHoyStr)

    let montoBonos = 0
    let cantidadBonos = 0
    if (bonos && bonos.length > 0) {
      cantidadBonos = bonos.length
      montoBonos = bonos.reduce((sum: number, bono: any) => sum + (bono.monto_total || 0), 0)
    }

    // 2. Obtener pagos de sesiones individuales del período
    const { data: sesionesPagadas } = await supabase
      .from('citas')
      .select('id, precio_sesion, fecha_pago')
      .eq('estado_pago', 'pagado')
      .in('paciente_id', pacienteIds)
      .gte('fecha_pago', fechaInicioStr)
      .lte('fecha_pago', fechaHoyStr)

    let montoSesiones = 0
    let cantidadSesiones = 0
    if (sesionesPagadas && sesionesPagadas.length > 0) {
      cantidadSesiones = sesionesPagadas.length
      montoSesiones = sesionesPagadas.reduce((sum: number, cita: any) => sum + (cita.precio_sesion || 0), 0)
    }

    // Calcular total (100% para el terapeuta, sin comisiones)
    const montoTotalBruto = montoBonos + montoSesiones
    totalConfirmado.value = montoTotalBruto
    totalBonosPagados.value = cantidadBonos + cantidadSesiones

    // 3. Calcular comparativa con período anterior (solo para mes)
    if (periodoAnalitica.value === 'mes') {
      const fechaInicioAnterior = new Date(fechaInicio)
      fechaInicioAnterior.setMonth(fechaInicioAnterior.getMonth() - 1)
      const fechaFinAnterior = new Date(fechaInicio)
      fechaFinAnterior.setDate(fechaFinAnterior.getDate() - 1)

      const fechaInicioAnteriorStr = fechaInicioAnterior.toISOString().split('T')[0]
      const fechaFinAnteriorStr = fechaFinAnterior.toISOString().split('T')[0]

      // Bonos mes anterior
      const { data: bonosAnterior } = await supabase
        .from('bonos')
        .select('monto_total')
        .eq('pagado', true)
        .in('paciente_id', pacienteIds)
        .gte('created_at', fechaInicioAnteriorStr)
        .lte('created_at', fechaFinAnteriorStr)

      let montoBonosAnterior = 0
      if (bonosAnterior && bonosAnterior.length > 0) {
        montoBonosAnterior = bonosAnterior.reduce((sum: number, bono: any) => sum + (bono.monto_total || 0), 0)
      }

      // Sesiones mes anterior
      const { data: sesionesAnterior } = await supabase
        .from('citas')
        .select('precio_sesion')
        .eq('estado_pago', 'pagado')
        .in('paciente_id', pacienteIds)
        .gte('fecha_pago', fechaInicioAnteriorStr)
        .lte('fecha_pago', fechaFinAnteriorStr)

      let montoSesionesAnterior = 0
      if (sesionesAnterior && sesionesAnterior.length > 0) {
        montoSesionesAnterior = sesionesAnterior.reduce((sum: number, cita: any) => sum + (cita.precio_sesion || 0), 0)
      }

      const totalAnterior = montoBonosAnterior + montoSesionesAnterior
      ingresosMesAnterior.value = totalAnterior

      // Calcular porcentaje de cambio
      if (totalAnterior > 0) {
        comparativaMesAnterior.value = Math.round(((totalConfirmado.value - totalAnterior) / totalAnterior) * 100)
      } else if (totalConfirmado.value > 0) {
        comparativaMesAnterior.value = 100 // Si antes era 0 y ahora hay algo, es +100%
      } else {
        comparativaMesAnterior.value = 0
      }
    } else {
      comparativaMesAnterior.value = 0
    }

  } catch (error) {
    console.error('Error al cargar pagos confirmados:', error)
    totalConfirmado.value = 0
    totalBonosPagados.value = 0
    comparativaMesAnterior.value = 0
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
  await cargarCobrosPendientesHoy()
  await cargarPacientes()
  await cargarMetricas()
  await cargarPagosConfirmados()
  await cargarBonosPorAgotar()
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
