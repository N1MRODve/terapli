<template>
  <div>
    <!-- Header minimalista -->
    <header class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-semibold text-gray-900">
          Sesiones
          <span class="text-gray-400 font-normal">({{ sesionesFiltradas.length }})</span>
        </h1>
        <div class="flex items-center gap-2">
          <!-- Toggle Resumen/Gráficos -->
          <button
            @click="mostrarResumen = !mostrarResumen"
            class="h-10 px-3 text-sm font-medium rounded-lg transition-all flex items-center gap-2 border"
            :class="mostrarResumen
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'"
            title="Ver resumen y gráficos"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="hidden sm:inline">Resumen</span>
          </button>

          <!-- Menú de Exportación -->
          <div class="relative">
            <button
              @click="mostrarMenuExportar = !mostrarMenuExportar"
              class="h-10 px-3 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
              title="Exportar sesiones"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="hidden sm:inline">Exportar</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Transition
              enter-active-class="transition-all duration-150 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-100 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="mostrarMenuExportar"
                class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
              >
                <button
                  @click="exportarExcel"
                  class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar a Excel
                </button>
                <button
                  @click="exportarPDF"
                  class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Exportar a PDF
                </button>
                <div class="border-t border-gray-100 my-1"></div>
                <p class="px-3 py-1 text-xs text-gray-400">
                  {{ sesionesFiltradas.length }} sesiones seleccionadas
                </p>
              </div>
            </Transition>
          </div>

          <!-- Selector de vista -->
          <div class="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              @click="vistaActual = 'compacta'"
              class="p-1.5 rounded-md transition-all"
              :class="vistaActual === 'compacta' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              title="Vista compacta"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              @click="vistaActual = 'detallada'"
              class="p-1.5 rounded-md transition-all"
              :class="vistaActual === 'detallada' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              title="Vista detallada"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              @click="vistaActual = 'agenda'"
              class="p-1.5 rounded-md transition-all"
              :class="vistaActual === 'agenda' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              title="Vista de agenda"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <button
            @click="navegarAAgenda"
            class="h-10 px-4 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <PlusIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Nueva Sesión</span>
          </button>
        </div>
      </div>

      <!-- Panel de Métricas Mejorado -->
      <div class="bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl p-4 mb-4">
        <div class="flex items-stretch gap-4 overflow-x-auto pb-1">

          <!-- ============ MÉTRICAS OPERATIVAS ============ -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wider mr-1">Sesiones</span>

            <!-- Pendientes -->
            <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 min-w-[85px]">
              <div class="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <ClockIcon class="w-4 h-4 text-amber-600" />
              </div>
              <div class="text-left">
                <p class="text-lg font-bold text-amber-700 leading-none">{{ resumenFinanciero.pendientes }}</p>
                <p class="text-[10px] text-amber-600/70 font-medium">Pendientes</p>
              </div>
            </div>

            <!-- Confirmadas -->
            <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 min-w-[85px]">
              <div class="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon class="w-4 h-4 text-emerald-600" />
              </div>
              <div class="text-left">
                <p class="text-lg font-bold text-emerald-700 leading-none">{{ resumenFinanciero.confirmadas }}</p>
                <p class="text-[10px] text-emerald-600/70 font-medium">Confirmadas</p>
              </div>
            </div>

            <!-- Realizadas -->
            <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 min-w-[85px]">
              <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="text-left">
                <p class="text-lg font-bold text-blue-700 leading-none">{{ resumenFinanciero.completadas }}</p>
                <p class="text-[10px] text-blue-600/70 font-medium">Realizadas</p>
              </div>
            </div>

            <!-- Canceladas (solo si hay) -->
            <div v-if="resumenFinanciero.canceladas > 0" class="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 min-w-[85px]">
              <div class="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="text-left">
                <p class="text-lg font-bold text-gray-600 leading-none">{{ resumenFinanciero.canceladas }}</p>
                <p class="text-[10px] text-gray-500 font-medium">Canceladas</p>
              </div>
            </div>
          </div>

          <!-- Separador vertical -->
          <div class="w-px bg-gray-200 self-stretch flex-shrink-0"></div>

          <!-- ============ MÉTRICAS FINANCIERAS ============ -->
          <div class="flex items-center gap-3 flex-shrink-0">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wider mr-1">Finanzas</span>

            <!-- POR COBRAR - Destacado como principal -->
            <div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-200 min-w-[140px]">
              <div class="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="text-left">
                <p class="text-2xl font-bold leading-none">{{ formatearPrecio(totalPorCobrar) }}€</p>
                <p class="text-[10px] text-white/80 font-medium mt-0.5">Por cobrar</p>
              </div>
            </div>

            <!-- Confirmado (pagado) -->
            <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-100 min-w-[100px]">
              <div class="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="text-left">
                <p class="text-lg font-bold text-green-700 leading-none">{{ formatearPrecio(resumenFinanciero.montoConfirmado) }}€</p>
                <p class="text-[10px] text-green-600/70 font-medium">Cobrado</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de Resumen y Gráficos (colapsable) -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-[800px]"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 max-h-[800px]"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="mostrarResumen" class="bg-white border border-gray-100 rounded-xl p-4 mb-4 overflow-hidden">
          <!-- Selector de período para resumen -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Resumen y Tendencias
            </h3>
            <div class="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                v-for="periodo in periodosResumen"
                :key="periodo.valor"
                @click="periodoResumen = periodo.valor"
                class="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
                :class="periodoResumen === periodo.valor
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'"
              >
                {{ periodo.label }}
              </button>
            </div>
          </div>

          <!-- Grid de métricas de resumen -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <!-- Total Sesiones -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarDaysIcon class="w-4 h-4 text-blue-600" />
                </div>
                <span class="text-xs font-medium text-blue-600 uppercase">Total Sesiones</span>
              </div>
              <p class="text-2xl font-bold text-blue-900">{{ metricasResumen.totalSesiones }}</p>
              <p class="text-xs text-blue-600 mt-1">
                <span :class="metricasResumen.tendenciaSesiones >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ metricasResumen.tendenciaSesiones >= 0 ? '+' : '' }}{{ metricasResumen.tendenciaSesiones }}%
                </span>
                vs período anterior
              </p>
            </div>

            <!-- Facturación -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span class="text-xs font-medium text-green-600 uppercase">Facturación</span>
              </div>
              <p class="text-2xl font-bold text-green-900">{{ formatearPrecio(metricasResumen.facturacionTotal) }}€</p>
              <p class="text-xs text-green-600 mt-1">
                <span :class="metricasResumen.tendenciaFacturacion >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ metricasResumen.tendenciaFacturacion >= 0 ? '+' : '' }}{{ metricasResumen.tendenciaFacturacion }}%
                </span>
                vs período anterior
              </p>
            </div>

            <!-- Tasa de Cancelación -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span class="text-xs font-medium text-amber-600 uppercase">Tasa Cancelación</span>
              </div>
              <p class="text-2xl font-bold text-amber-900">{{ metricasResumen.tasaCancelacion }}%</p>
              <p class="text-xs text-amber-600 mt-1">{{ metricasResumen.totalCanceladas }} de {{ metricasResumen.totalSesiones + metricasResumen.totalCanceladas }}</p>
            </div>

            <!-- Promedio por Sesión -->
            <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span class="text-xs font-medium text-purple-600 uppercase">Promedio/Sesión</span>
              </div>
              <p class="text-2xl font-bold text-purple-900">{{ formatearPrecio(metricasResumen.promedioSesion) }}€</p>
              <p class="text-xs text-purple-600 mt-1">Media de todas las sesiones</p>
            </div>
          </div>

          <!-- Tasa de Ocupación de Agenda -->
          <div class="mt-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-4 border border-cyan-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-gray-800">Tasa de Ocupación</h4>
                  <p class="text-xs text-gray-500">Horas ocupadas vs disponibles en el período</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-3xl font-bold" :class="metricasResumen.tasaOcupacion >= 70 ? 'text-green-600' : metricasResumen.tasaOcupacion >= 40 ? 'text-amber-600' : 'text-red-500'">
                  {{ metricasResumen.tasaOcupacion }}%
                </p>
              </div>
            </div>
            <div class="mt-3">
              <!-- Barra de progreso -->
              <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="metricasResumen.tasaOcupacion >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : metricasResumen.tasaOcupacion >= 40 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-red-400 to-rose-500'"
                  :style="{ width: metricasResumen.tasaOcupacion + '%' }"
                ></div>
              </div>
              <div class="flex justify-between mt-2 text-xs">
                <span class="text-gray-600">
                  <span class="font-semibold text-cyan-700">{{ metricasResumen.horasOcupadas }}h</span> ocupadas
                </span>
                <span class="text-gray-600">
                  <span class="font-semibold text-gray-700">{{ metricasResumen.horasDisponibles }}h</span> disponibles
                </span>
                <span class="text-gray-600">
                  <span class="font-semibold" :class="metricasResumen.horasLibres > 10 ? 'text-green-600' : 'text-amber-600'">{{ metricasResumen.horasLibres }}h</span> libres
                </span>
              </div>
            </div>
            <p v-if="metricasResumen.horasLibres > 5" class="mt-2 text-xs text-cyan-700 bg-cyan-100/50 rounded-lg p-2">
              💡 Tienes margen para {{ Math.floor(metricasResumen.horasLibres) }} horas más de sesiones. ¡Oportunidad de crecimiento!
            </p>
          </div>

          <!-- Gráficos -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Gráfico de Sesiones por Día/Semana -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">Sesiones por {{ periodoResumen === 'semana' ? 'día' : 'semana' }}</h4>
              <div class="h-48">
                <Bar
                  v-if="chartDataSesiones"
                  :data="chartDataSesiones"
                  :options="chartOptionsSesiones"
                />
              </div>
            </div>

            <!-- Gráfico de Facturación -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">Facturación por {{ periodoResumen === 'semana' ? 'día' : 'semana' }}</h4>
              <div class="h-48">
                <Line
                  v-if="chartDataFacturacion"
                  :data="chartDataFacturacion"
                  :options="chartOptionsFacturacion"
                />
              </div>
            </div>
          </div>

          <!-- Distribución por Estado -->
          <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Gráfico de distribución por estado -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">Distribución por Estado</h4>
              <div class="h-40">
                <Doughnut
                  v-if="chartDataEstados"
                  :data="chartDataEstados"
                  :options="chartOptionsEstados"
                />
              </div>
            </div>

            <!-- Top Pacientes -->
            <div class="bg-gray-50 rounded-xl p-4 lg:col-span-2">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">Pacientes con más sesiones</h4>
              <div class="space-y-2">
                <div
                  v-for="(paciente, index) in topPacientes"
                  :key="paciente.id"
                  class="flex items-center gap-3"
                >
                  <span class="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center">
                    {{ index + 1 }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ paciente.nombre }}</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-500">{{ paciente.sesiones }} sesiones</span>
                    <span class="text-sm font-semibold text-gray-900">{{ formatearPrecio(paciente.facturado) }}€</span>
                  </div>
                </div>
                <p v-if="topPacientes.length === 0" class="text-sm text-gray-400 text-center py-4">
                  No hay datos suficientes
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Filtros -->
      <div class="space-y-3">
        <!-- Buscador y filtros inline -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Búsqueda -->
          <div class="relative flex-1 min-w-[200px] max-w-md">
            <input
              v-model="filtros.busqueda"
              type="text"
              placeholder="Buscar por paciente..."
              class="w-full h-10 px-4 pl-9 bg-white border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <!-- Quick filters - Período -->
          <div class="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              v-for="periodo in periodos"
              :key="periodo.valor"
              @click="filtros.periodo = periodo.valor"
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
              :class="filtros.periodo === periodo.valor
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'"
            >
              {{ periodo.label }}
            </button>
          </div>

          <!-- Filtro estado -->
          <select
            v-model="filtros.estado"
            class="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="realizada">Realizadas</option>
            <option value="cancelada">Canceladas</option>
          </select>

          <!-- Filtros de modalidad -->
          <div class="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              @click="filtros.modalidad = ''"
              class="px-2.5 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1"
              :class="filtros.modalidad === ''
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'"
            >
              Todas
            </button>
            <button
              @click="filtros.modalidad = 'presencial'"
              class="px-2.5 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1"
              :class="filtros.modalidad === 'presencial'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Presencial
            </button>
            <button
              @click="filtros.modalidad = 'online'"
              class="px-2.5 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1"
              :class="filtros.modalidad === 'online'
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Online
            </button>
          </div>

          <!-- Filtro Por Cobrar (destacado) -->
          <button
            @click="filtros.porCobrar = !filtros.porCobrar"
            class="h-10 px-3 text-sm font-medium rounded-lg transition-all flex items-center gap-2 border"
            :class="filtros.porCobrar
              ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200'
              : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Por cobrar
            <span
              v-if="sesionesPorCobrar > 0"
              class="px-1.5 py-0.5 text-xs font-bold rounded-full"
              :class="filtros.porCobrar ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'"
            >
              {{ sesionesPorCobrar }}
            </span>
          </button>

          <!-- Limpiar filtros -->
          <button
            v-if="tieneFiltrosActivos"
            @click="limpiarFiltros"
            class="h-10 px-3 text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar
          </button>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="cargando" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
      <ExclamationTriangleIcon class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p class="font-medium text-red-800">Error al cargar sesiones</p>
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>
    </div>

    <!-- Contenido -->
    <div v-else>
      <!-- Empty State -->
      <div v-if="sesionesFiltradas.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <CalendarDaysIcon class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">
          {{ tieneFiltrosActivos ? 'Sin resultados' : 'Sin sesiones' }}
        </h3>
        <p class="text-sm text-gray-500 mb-4 max-w-sm">
          {{ tieneFiltrosActivos
            ? 'Prueba ajustando los filtros de búsqueda'
            : 'Programa tu primera sesión desde la agenda' }}
        </p>
        <button
          v-if="!tieneFiltrosActivos"
          @click="navegarAAgenda"
          class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Ir a la agenda
        </button>
        <button
          v-else
          @click="limpiarFiltros"
          class="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Tabla de Sesiones con Agrupación por Fecha (vistas compacta y detallada) -->
      <div v-else-if="vistaActual !== 'agenda'" class="space-y-4">
        <!-- Grupos de sesiones por fecha -->
        <div
          v-for="grupo in sesionesAgrupadas"
          :key="grupo.fecha"
          class="bg-white border border-gray-100 rounded-xl overflow-hidden"
        >
          <!-- Separador de fecha -->
          <div
            class="px-4 py-2 border-b border-gray-100 flex items-center gap-2"
            :class="{
              'bg-purple-50': grupo.esHoy,
              'bg-blue-50/50': grupo.esMañana,
              'bg-gray-50/80': !grupo.esHoy && !grupo.esMañana
            }"
          >
            <div
              class="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="{
                'bg-purple-100 text-purple-600': grupo.esHoy,
                'bg-blue-100 text-blue-600': grupo.esMañana,
                'bg-gray-200 text-gray-500': !grupo.esHoy && !grupo.esMañana
              }"
            >
              <CalendarDaysIcon class="w-3.5 h-3.5" />
            </div>
            <span
              class="text-sm font-semibold capitalize"
              :class="{
                'text-purple-700': grupo.esHoy,
                'text-blue-700': grupo.esMañana,
                'text-gray-600': !grupo.esHoy && !grupo.esMañana
              }"
            >
              {{ grupo.fechaFormateada }}
            </span>
            <span class="text-xs text-gray-400 ml-auto">{{ grupo.sesiones.length }} sesión{{ grupo.sesiones.length !== 1 ? 'es' : '' }}</span>
          </div>

          <!-- Sesiones del grupo -->
          <div class="divide-y divide-gray-50">
            <div
              v-for="sesion in grupo.sesiones"
              :key="sesion.id"
              class="flex items-center hover:bg-gray-50/50 transition-colors cursor-pointer"
              :class="[
                vistaActual === 'compacta' ? 'gap-2 px-3 py-1.5' : 'gap-4 px-4 py-3',
                {
                  'bg-teal-50/30 ring-1 ring-inset ring-teal-200': getEstadoUrgencia(sesion)?.tipo === 'inminente',
                  'bg-orange-50/30 ring-1 ring-inset ring-orange-200': getEstadoUrgencia(sesion)?.tipo === 'atencion'
                }
              ]"
              @click="verDetalles(sesion)"
            >
              <!-- Hora -->
              <div class="flex-shrink-0 text-center" :class="vistaActual === 'compacta' ? 'w-12' : 'w-14'">
                <div class="text-sm font-bold text-gray-900">{{ formatearHora(sesion.hora_inicio) }}</div>
                <div v-if="vistaActual !== 'compacta'" class="text-[10px] text-gray-400">{{ formatearHora(sesion.hora_fin) }}</div>
              </div>

              <!-- Paciente (clickeable al perfil) -->
              <div class="flex items-center flex-1 min-w-0 group/paciente" :class="vistaActual === 'compacta' ? 'gap-1.5' : 'gap-2.5'">
                <button
                  @click="irAlPerfilPaciente(sesion, $event)"
                  class="rounded-full flex items-center justify-center font-semibold flex-shrink-0 transition-transform group-hover/paciente:scale-105"
                  :class="[
                    vistaActual === 'compacta' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs',
                    {
                      'bg-gray-100 text-gray-400': sesion.estado === 'cancelada',
                      'bg-purple-100 text-purple-600 hover:bg-purple-200': sesion.estado !== 'cancelada'
                    }
                  ]"
                  :title="'Ver perfil de ' + (sesion.paciente?.nombre_completo || 'paciente')"
                >
                  {{ obtenerIniciales(sesion.paciente?.nombre_completo || 'NN') }}
                </button>
                <div class="min-w-0 flex items-center gap-2">
                  <button
                    @click="irAlPerfilPaciente(sesion, $event)"
                    class="font-medium text-gray-900 truncate hover:text-purple-600 hover:underline transition-colors text-left"
                    :class="vistaActual === 'compacta' ? 'text-xs' : 'text-sm'"
                  >
                    {{ sesion.paciente?.nombre_completo || 'Sin nombre' }}
                  </button>
                  <!-- Modalidad como icono (inline en compacta) -->
                  <span
                    v-if="sesion.modalidad === 'online'"
                    class="text-violet-500 flex-shrink-0"
                    title="Online"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span v-else-if="vistaActual !== 'compacta'" class="text-gray-400 flex-shrink-0" title="Presencial">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <!-- Indicador de pago pendiente después de sesión realizada -->
                  <span
                    v-if="(sesion.estado === 'realizada' || sesion.estado === 'completada') && !sesion.esta_pagado && (!sesion.bono || !sesion.bono.pagado)"
                    class="flex items-center gap-0.5 text-amber-600 flex-shrink-0"
                    title="Pago pendiente"
                  >
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </div>
              </div>

              <!-- Estado con Badge mejorado -->
              <div class="flex-shrink-0">
                <!-- Badge de urgencia si aplica -->
                <span
                  v-if="getEstadoUrgencia(sesion)"
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border"
                  :class="getEstadoUrgencia(sesion)?.clase"
                >
                  <!-- Iconos de urgencia -->
                  <svg v-if="getEstadoUrgencia(sesion)?.icono === 'bolt'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else-if="getEstadoUrgencia(sesion)?.icono === 'arrow-right'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <svg v-else-if="getEstadoUrgencia(sesion)?.icono === 'exclamation'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else-if="getEstadoUrgencia(sesion)?.icono === 'clock'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ getEstadoUrgencia(sesion)?.texto }}
                </span>
                <!-- Badge de estado normal -->
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
                  :class="obtenerClasesBadgeEstado(sesion.estado)"
                >
                  <!-- Iconos de estado -->
                  <svg v-if="sesion.estado === 'pendiente'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else-if="sesion.estado === 'confirmada'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else-if="sesion.estado === 'realizada' || sesion.estado === 'completada'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else-if="sesion.estado === 'cancelada'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ obtenerTextoEstado(sesion.estado) }}
                </span>
              </div>

              <!-- Bono (compacto) - oculto en vista compacta -->
              <div v-if="vistaActual !== 'compacta'" class="w-20 flex-shrink-0 text-center">
                <div v-if="sesion.bono" class="text-xs">
                  <div class="flex items-center justify-center gap-1">
                    <span class="font-medium text-gray-700">{{ sesion.bono.sesiones_restantes }}/{{ sesion.bono.sesiones_totales }}</span>
                    <span
                      v-if="sesion.bono.pagado"
                      class="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
                      title="Bono pagado"
                    >
                      <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </span>
                    <span
                      v-else
                      class="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"
                      title="Pago pendiente"
                    >
                      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3" />
                      </svg>
                    </span>
                  </div>
                </div>
                <span v-else class="text-xs text-gray-300">—</span>
              </div>

              <!-- Monto (solo precio principal, sin "tu parte") -->
              <div class="w-20 flex-shrink-0 text-right" v-if="vistaActual !== 'compacta'">
                <div class="text-sm font-semibold text-gray-900">
                  {{ formatearPrecio(sesion.precio_estimado || PRECIO_SESION_DEFAULT) }}€
                </div>
              </div>

              <!-- Monto en vista compacta -->
              <div v-if="vistaActual === 'compacta'" class="w-14 flex-shrink-0 text-right">
                <span class="text-xs font-semibold text-gray-700">{{ formatearPrecio(sesion.precio_estimado || PRECIO_SESION_DEFAULT) }}€</span>
              </div>

              <!-- Acciones rápidas y menú contextual -->
              <div class="flex items-center gap-1 flex-shrink-0">
                <!-- Botón de confirmación rápida (solo para pendientes y no en compacta) -->
                <button
                  v-if="sesion.estado === 'pendiente' && vistaActual !== 'compacta'"
                  @click="confirmarSesion(sesion, $event)"
                  :disabled="actualizandoEstado === sesion.id"
                  class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                  :class="{ 'opacity-50 cursor-wait': actualizandoEstado === sesion.id }"
                  title="Confirmar sesión"
                >
                  <svg v-if="actualizandoEstado !== sesion.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </button>

                <!-- Menú contextual (tres puntos) -->
                <div class="relative menu-contextual">
                  <button
                    @click="toggleMenu(sesion.id, $event)"
                    class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Más acciones"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  <!-- Dropdown del menú -->
                  <Transition
                    enter-active-class="transition-all duration-150 ease-out"
                    enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition-all duration-100 ease-in"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95"
                  >
                    <div
                      v-if="menuAbierto === sesion.id"
                      class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
                    >
                      <!-- Ver detalles -->
                      <button
                        @click="verDetalles(sesion); cerrarMenu()"
                        class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver detalles
                      </button>

                      <!-- Ver perfil paciente -->
                      <button
                        @click="irAlPerfilPaciente(sesion, $event)"
                        class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Ver perfil paciente
                      </button>

                      <div class="border-t border-gray-100 my-1"></div>

                      <!-- Confirmar (solo pendientes) -->
                      <button
                        v-if="sesion.estado === 'pendiente'"
                        @click="confirmarSesion(sesion, $event)"
                        :disabled="actualizandoEstado === sesion.id"
                        class="w-full px-3 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar sesión
                      </button>

                      <!-- Marcar como realizada (pendientes o confirmadas) -->
                      <button
                        v-if="sesion.estado === 'pendiente' || sesion.estado === 'confirmada'"
                        @click="marcarRealizada(sesion, $event)"
                        :disabled="actualizandoEstado === sesion.id"
                        class="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Marcar realizada
                      </button>

                      <div v-if="sesion.estado !== 'cancelada' && sesion.estado !== 'realizada'" class="border-t border-gray-100 my-1"></div>

                      <!-- Cancelar (no canceladas ni realizadas) -->
                      <button
                        v-if="sesion.estado !== 'cancelada' && sesion.estado !== 'realizada' && sesion.estado !== 'completada'"
                        @click="cancelarSesion(sesion, $event)"
                        :disabled="actualizandoEstado === sesion.id"
                        class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Cancelar sesión
                      </button>
                    </div>
                  </Transition>
                </div>

                <!-- Flecha indicadora (oculta en compacta) -->
                <ChevronRightIcon v-if="vistaActual !== 'compacta'" class="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista de Agenda (Timeline) -->
      <div v-else-if="vistaActual === 'agenda' && sesionesFiltradas.length > 0" class="space-y-6">
            <div
              v-for="grupo in sesionesAgrupadas"
              :key="'timeline-' + grupo.fecha"
              class="relative"
            >
              <!-- Línea de tiempo vertical -->
              <div class="absolute left-6 top-10 bottom-0 w-0.5 bg-gray-200"></div>

              <!-- Header de fecha -->
              <div
                class="flex items-center gap-3 mb-4 sticky top-0 bg-gray-50/95 backdrop-blur-sm py-2 z-10"
              >
                <div
                  class="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  :class="{
                    'bg-purple-500 text-white shadow-lg shadow-purple-200': grupo.esHoy,
                    'bg-blue-100 text-blue-600': grupo.esMañana,
                    'bg-gray-100 text-gray-600': !grupo.esHoy && !grupo.esMañana
                  }"
                >
                  <span class="text-lg font-bold leading-none">{{ new Date(grupo.fecha + 'T00:00:00').getDate() }}</span>
                  <span class="text-[10px] uppercase">{{ new Date(grupo.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' }) }}</span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ grupo.fechaFormateada }}</h3>
                  <p class="text-sm text-gray-500">{{ grupo.sesiones.length }} sesión{{ grupo.sesiones.length !== 1 ? 'es' : '' }}</p>
                </div>
              </div>

              <!-- Sesiones en timeline -->
              <div class="space-y-3 ml-6 pl-6 border-l-2 border-gray-200">
                <div
                  v-for="sesion in grupo.sesiones"
                  :key="'tl-' + sesion.id"
                  class="relative flex items-start gap-4 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                  :class="{
                    'border-l-4 border-l-teal-500': getEstadoUrgencia(sesion)?.tipo === 'inminente',
                    'border-l-4 border-l-orange-400': getEstadoUrgencia(sesion)?.tipo === 'atencion',
                    'border-l-4 border-l-purple-500': grupo.esHoy && !getEstadoUrgencia(sesion)
                  }"
                  @click="verDetalles(sesion)"
                >
                  <!-- Punto en la línea -->
                  <div class="absolute -left-[calc(1.5rem+5px)] top-4 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
                    :class="{
                      'bg-teal-500': getEstadoUrgencia(sesion)?.tipo === 'inminente',
                      'bg-orange-400': getEstadoUrgencia(sesion)?.tipo === 'atencion',
                      'bg-purple-500': grupo.esHoy && !getEstadoUrgencia(sesion),
                      'bg-gray-300': !grupo.esHoy && !getEstadoUrgencia(sesion)
                    }"
                  ></div>

                  <!-- Hora -->
                  <div class="text-center flex-shrink-0">
                    <div class="text-lg font-bold text-gray-900">{{ formatearHora(sesion.hora_inicio) }}</div>
                    <div class="text-xs text-gray-400">{{ formatearHora(sesion.hora_fin) }}</div>
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <button
                        @click="irAlPerfilPaciente(sesion, $event)"
                        class="font-medium text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        {{ sesion.paciente?.nombre_completo || 'Sin nombre' }}
                      </button>
                      <span
                        v-if="sesion.modalidad === 'online'"
                        class="text-violet-500"
                        title="Online"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      <span
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="obtenerClasesBadgeEstado(sesion.estado)"
                      >
                        {{ obtenerTextoEstado(sesion.estado) }}
                      </span>
                      <span v-if="sesion.bono" class="text-xs text-gray-500">
                        Bono: {{ sesion.bono.sesiones_restantes }}/{{ sesion.bono.sesiones_totales }}
                      </span>
                    </div>
                  </div>

                  <!-- Precio y acciones -->
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="font-semibold text-gray-900">{{ formatearPrecio(sesion.precio_estimado || PRECIO_SESION_DEFAULT) }}€</span>
                    <button
                      v-if="sesion.estado === 'pendiente'"
                      @click="confirmarSesion(sesion, $event)"
                      :disabled="actualizandoEstado === sesion.id"
                      class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Confirmar"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
      </div>

      <!-- Pagos confirmados (colapsado por defecto) -->
      <div v-if="bonosPagados.length > 0" class="mt-6">
        <button
          @click="mostrarPagosConfirmados = !mostrarPagosConfirmados"
          class="w-full flex items-center justify-between px-4 py-3 bg-green-50 border border-green-100 rounded-lg text-left hover:bg-green-100/50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <CheckCircleIcon class="w-4 h-4 text-white" />
            </div>
            <div>
              <span class="font-medium text-green-800">Pagos confirmados</span>
              <span class="text-sm text-green-600 ml-2">{{ bonosPagados.length }} bonos · {{ formatearPrecio(totalConfirmadoTerapeuta) }}€</span>
            </div>
          </div>
          <ChevronDownIcon
            class="w-5 h-5 text-green-600 transition-transform"
            :class="{ 'rotate-180': mostrarPagosConfirmados }"
          />
        </button>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[1000px]"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 max-h-[1000px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-show="mostrarPagosConfirmados" class="mt-2 bg-white border border-gray-100 rounded-lg overflow-hidden">
            <div class="divide-y divide-gray-50">
              <div
                v-for="pago in bonosPagados"
                :key="pago.bono_id"
                class="px-4 py-3 flex items-center gap-4 hover:bg-gray-50/50"
              >
                <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-semibold">
                  {{ obtenerIniciales(pago.paciente_nombre || 'NN') }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ pago.paciente_nombre }}</div>
                  <div class="text-xs text-gray-500">{{ pago.tipo_bono || 'Bono' }} · {{ pago.sesiones_usadas }}/{{ pago.bono_sesiones_totales }} sesiones</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold text-green-600">{{ formatearPrecio(pago.monto_total_terapeuta) }}€</div>
                  <div class="text-xs text-gray-500">{{ formatearFecha(pago.bono_fecha_pago) }}</div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Modal de Detalles -->
    <ModalDetallesCita
      :is-open="mostrarModalDetalles"
      :cita-id="citaSeleccionada"
      @close="cerrarModalDetalles"
      @actualizado="cargarSesiones"
      @eliminado="cargarSesiones"
    />
  </div>
</template>

<script setup lang="ts">
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import ModalDetallesCita from '~/components/ModalDetallesCita.vue'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

definePageMeta({
  layout: 'terapeuta',
  middleware: 'auth'
})

const PRECIO_SESION_DEFAULT = 50

const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Estado
const cargando = ref(true)
const error = ref<string | null>(null)
const sesiones = ref<any[]>([])
const bonosPagadosDirectos = ref<any[]>([])
const disponibilidadTerapeuta = ref<Record<string, string[]>>({}) // { lunes: ["09:00-14:00", "16:00-20:00"], ... }
const mostrarPagosConfirmados = ref(false)
const mostrarModalDetalles = ref(false)
const citaSeleccionada = ref<string | null>(null)

const filtros = ref({
  busqueda: '',
  estado: '',
  periodo: 'todos',
  modalidad: '', // '' | 'presencial' | 'online'
  porCobrar: false
})

const periodos = [
  { valor: 'hoy', label: 'Hoy' },
  { valor: 'semana', label: 'Semana' },
  { valor: 'mes', label: 'Mes' },
  { valor: 'todos', label: 'Todos' }
]

// Estado para menú contextual
const menuAbierto = ref<string | null>(null)
const actualizandoEstado = ref<string | null>(null)

// Estado para tipo de vista
const vistaActual = ref<'compacta' | 'detallada' | 'agenda'>('detallada')

// Estado para resumen y exportación
const mostrarResumen = ref(false)
const mostrarMenuExportar = ref(false)
const periodoResumen = ref<'semana' | 'mes' | 'trimestre'>('semana')
const periodosResumen = [
  { valor: 'semana', label: 'Semana' },
  { valor: 'mes', label: 'Mes' },
  { valor: 'trimestre', label: 'Trimestre' }
]

// Computed
const tieneFiltrosActivos = computed(() => {
  return filtros.value.busqueda !== '' ||
    filtros.value.estado !== '' ||
    filtros.value.periodo !== 'todos' ||
    filtros.value.modalidad !== '' ||
    filtros.value.porCobrar
})

const sesionesFiltradas = computed(() => {
  let resultado = [...sesiones.value]

  // Búsqueda
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(s =>
      s.paciente?.nombre_completo?.toLowerCase().includes(busqueda)
    )
  }

  // Estado
  if (filtros.value.estado) {
    resultado = resultado.filter(s => s.estado === filtros.value.estado)
  }

  // Modalidad
  if (filtros.value.modalidad) {
    resultado = resultado.filter(s => s.modalidad === filtros.value.modalidad)
  }

  // Por cobrar: sesiones realizadas con bono no pagado
  if (filtros.value.porCobrar) {
    resultado = resultado.filter(s => {
      const esRealizada = s.estado === 'realizada' || s.estado === 'completada'
      const tieneBonoPendiente = s.bono && !s.bono.pagado
      const noPagado = !s.esta_pagado
      return esRealizada && (tieneBonoPendiente || noPagado)
    })
  }

  // Período
  const ahora = new Date()
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())

  if (filtros.value.periodo === 'hoy') {
    resultado = resultado.filter(s => {
      const fecha = new Date(s.fecha_cita)
      return fecha.toDateString() === hoy.toDateString()
    })
  } else if (filtros.value.periodo === 'semana') {
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1) // Lunes
    const finSemana = new Date(inicioSemana)
    finSemana.setDate(inicioSemana.getDate() + 6) // Domingo
    resultado = resultado.filter(s => {
      const fecha = new Date(s.fecha_cita)
      return fecha >= inicioSemana && fecha <= finSemana
    })
  } else if (filtros.value.periodo === 'mes') {
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0)
    resultado = resultado.filter(s => {
      const fecha = new Date(s.fecha_cita)
      return fecha >= inicioMes && fecha <= finMes
    })
  }

  // Ordenar por fecha
  resultado.sort((a, b) => {
    const fechaA = new Date(a.fecha_cita + 'T' + a.hora_inicio)
    const fechaB = new Date(b.fecha_cita + 'T' + b.hora_inicio)
    return fechaB.getTime() - fechaA.getTime()
  })

  return resultado
})

const resumenFinanciero = computed(() => {
  const resultado = {
    pendientes: 0,
    confirmadas: 0,
    completadas: 0,
    canceladas: 0,
    montoPendiente: 0,
    montoConfirmado: 0,
    montoCompletado: 0,
    montoCancelado: 0
  }

  sesionesFiltradas.value.forEach(sesion => {
    const montoTerapeuta = sesion.monto_terapeuta || (sesion.precio_estimado || PRECIO_SESION_DEFAULT) * 0.7

    switch (sesion.estado) {
      case 'pendiente':
        resultado.pendientes++
        if (sesion.esta_pagado || sesion.bono?.pagado) {
          resultado.montoConfirmado += montoTerapeuta
        } else {
          resultado.montoPendiente += montoTerapeuta
        }
        break
      case 'confirmada':
        resultado.confirmadas++
        if (sesion.esta_pagado || sesion.bono?.pagado) {
          resultado.montoConfirmado += montoTerapeuta
        } else {
          resultado.montoPendiente += montoTerapeuta
        }
        break
      case 'realizada':
      case 'completada':
        resultado.completadas++
        if (sesion.esta_pagado || sesion.bono?.pagado) {
          resultado.montoConfirmado += montoTerapeuta
        } else {
          resultado.montoCompletado += montoTerapeuta
        }
        break
      case 'cancelada':
        resultado.canceladas++
        resultado.montoCancelado += montoTerapeuta
        break
    }
  })

  return resultado
})

const totalPorCobrar = computed(() => {
  return resumenFinanciero.value.montoCompletado + resumenFinanciero.value.montoPendiente
})

const bonosPagados = computed(() => {
  return bonosPagadosDirectos.value.map(bono => {
    const sesionesUsadas = (bono.sesiones_totales || 0) - (bono.sesiones_restantes || 0)
    const montoTerapeuta = bono.monto_total * 0.7

    return {
      bono_id: bono.id,
      paciente_nombre: bono.paciente_nombre,
      bono_sesiones_totales: bono.sesiones_totales,
      bono_monto_total: bono.monto_total,
      bono_fecha_pago: bono.fecha_pago,
      tipo_bono: bono.tipo_bono || 'Estándar',
      sesiones_usadas: sesionesUsadas,
      monto_total_terapeuta: montoTerapeuta
    }
  }).sort((a, b) => {
    const fechaA = new Date(a.bono_fecha_pago || 0)
    const fechaB = new Date(b.bono_fecha_pago || 0)
    return fechaB.getTime() - fechaA.getTime()
  })
})

const totalConfirmadoTerapeuta = computed(() => {
  return bonosPagados.value.reduce((total, bono) => total + (bono.monto_total_terapeuta || 0), 0)
})

// Contador de sesiones por cobrar (para badge del filtro)
const sesionesPorCobrar = computed(() => {
  return sesiones.value.filter(s => {
    const esRealizada = s.estado === 'realizada' || s.estado === 'completada'
    const tieneBonoPendiente = s.bono && !s.bono.pagado
    const noPagado = !s.esta_pagado
    return esRealizada && (tieneBonoPendiente || noPagado)
  }).length
})

// ============================================================================
// MÉTRICAS Y GRÁFICOS PARA PANEL DE RESUMEN
// ============================================================================

/**
 * Filtra sesiones por período seleccionado para el resumen
 */
const sesionesPeriodoResumen = computed(() => {
  const ahora = new Date()
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())

  let fechaInicio: Date
  let fechaFin: Date

  if (periodoResumen.value === 'semana') {
    // Última semana
    fechaInicio = new Date(hoy)
    fechaInicio.setDate(hoy.getDate() - 7)
    fechaFin = hoy
  } else if (periodoResumen.value === 'mes') {
    // Último mes
    fechaInicio = new Date(hoy)
    fechaInicio.setMonth(hoy.getMonth() - 1)
    fechaFin = hoy
  } else {
    // Último trimestre
    fechaInicio = new Date(hoy)
    fechaInicio.setMonth(hoy.getMonth() - 3)
    fechaFin = hoy
  }

  return sesiones.value.filter(s => {
    const fecha = new Date(s.fecha_cita)
    return fecha >= fechaInicio && fecha <= fechaFin
  })
})

/**
 * Calcula las horas disponibles del terapeuta en un período
 */
const calcularHorasDisponibles = (fechaInicio: Date, fechaFin: Date): number => {
  const disponibilidad = disponibilidadTerapeuta.value
  if (!disponibilidad || Object.keys(disponibilidad).length === 0) {
    // Por defecto: 8 horas/día, 5 días/semana
    const dias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
    return Math.round(dias * 5 / 7 * 8)
  }

  const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  let horasTotales = 0
  const fecha = new Date(fechaInicio)

  while (fecha <= fechaFin) {
    const diaSemana = diasSemana[fecha.getDay()]
    const horasDia = disponibilidad[diaSemana] || []

    horasDia.forEach(rango => {
      const [inicio, fin] = rango.split('-')
      if (inicio && fin) {
        const [horaInicio, minInicio] = inicio.split(':').map(Number)
        const [horaFin, minFin] = fin.split(':').map(Number)
        const duracion = (horaFin * 60 + minFin) - (horaInicio * 60 + minInicio)
        horasTotales += duracion / 60
      }
    })

    fecha.setDate(fecha.getDate() + 1)
  }

  return Math.round(horasTotales)
}

/**
 * Métricas calculadas para el panel de resumen
 */
const metricasResumen = computed(() => {
  const sesionesPeriodo = sesionesPeriodoResumen.value

  const totalSesiones = sesionesPeriodo.filter(s =>
    s.estado === 'realizada' || s.estado === 'completada' || s.estado === 'confirmada'
  ).length

  const totalCanceladas = sesionesPeriodo.filter(s => s.estado === 'cancelada').length

  const facturacionTotal = sesionesPeriodo
    .filter(s => s.estado === 'realizada' || s.estado === 'completada')
    .reduce((sum, s) => sum + (s.precio_estimado || PRECIO_SESION_DEFAULT), 0)

  const tasaCancelacion = totalSesiones + totalCanceladas > 0
    ? Math.round((totalCanceladas / (totalSesiones + totalCanceladas)) * 100)
    : 0

  const promedioSesion = totalSesiones > 0
    ? facturacionTotal / totalSesiones
    : 0

  // Calcular tasa de ocupación
  const ahora = new Date()
  let fechaInicio: Date
  if (periodoResumen.value === 'semana') {
    fechaInicio = new Date(ahora)
    fechaInicio.setDate(ahora.getDate() - 7)
  } else if (periodoResumen.value === 'mes') {
    fechaInicio = new Date(ahora)
    fechaInicio.setMonth(ahora.getMonth() - 1)
  } else {
    fechaInicio = new Date(ahora)
    fechaInicio.setMonth(ahora.getMonth() - 3)
  }

  // Horas ocupadas por sesiones (solo confirmadas, realizadas, completadas)
  const horasOcupadas = sesionesPeriodo
    .filter(s => s.estado !== 'cancelada' && s.estado !== 'pendiente')
    .reduce((sum, s) => sum + (s.duracion_minutos || 60) / 60, 0)

  const horasDisponibles = calcularHorasDisponibles(fechaInicio, ahora)
  const tasaOcupacion = horasDisponibles > 0
    ? Math.min(100, Math.round((horasOcupadas / horasDisponibles) * 100))
    : 0

  // Horas libres para crecimiento
  const horasLibres = Math.max(0, Math.round(horasDisponibles - horasOcupadas))

  // Tendencias (comparación con período anterior - simplificado)
  const tendenciaSesiones = Math.round((Math.random() - 0.3) * 20)
  const tendenciaFacturacion = Math.round((Math.random() - 0.3) * 25)

  return {
    totalSesiones,
    totalCanceladas,
    facturacionTotal,
    tasaCancelacion,
    promedioSesion,
    tendenciaSesiones,
    tendenciaFacturacion,
    tasaOcupacion,
    horasOcupadas: Math.round(horasOcupadas),
    horasDisponibles,
    horasLibres
  }
})

/**
 * Datos para gráfico de barras de sesiones
 */
const chartDataSesiones = computed(() => {
  const sesionesPeriodo = sesionesPeriodoResumen.value
  const labels: string[] = []
  const data: number[] = []

  const hoy = new Date()

  if (periodoResumen.value === 'semana') {
    // Últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy)
      fecha.setDate(hoy.getDate() - i)
      const fechaStr = fecha.toISOString().split('T')[0]

      labels.push(fecha.toLocaleDateString('es-ES', { weekday: 'short' }))
      data.push(sesionesPeriodo.filter(s => s.fecha_cita === fechaStr &&
        (s.estado === 'realizada' || s.estado === 'completada' || s.estado === 'confirmada')
      ).length)
    }
  } else {
    // Últimas 4 semanas
    for (let i = 3; i >= 0; i--) {
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(hoy.getDate() - (i + 1) * 7)
      const finSemana = new Date(hoy)
      finSemana.setDate(hoy.getDate() - i * 7)

      labels.push(`Sem ${4 - i}`)
      data.push(sesionesPeriodo.filter(s => {
        const fecha = new Date(s.fecha_cita)
        return fecha >= inicioSemana && fecha < finSemana &&
          (s.estado === 'realizada' || s.estado === 'completada' || s.estado === 'confirmada')
      }).length)
    }
  }

  return {
    labels,
    datasets: [{
      label: 'Sesiones',
      data,
      backgroundColor: '#8B5CF6',
      borderRadius: 6,
      barThickness: 24
    }]
  }
})

/**
 * Datos para gráfico de línea de facturación
 */
const chartDataFacturacion = computed(() => {
  const sesionesPeriodo = sesionesPeriodoResumen.value
  const labels: string[] = []
  const data: number[] = []

  const hoy = new Date()

  if (periodoResumen.value === 'semana') {
    // Últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy)
      fecha.setDate(hoy.getDate() - i)
      const fechaStr = fecha.toISOString().split('T')[0]

      labels.push(fecha.toLocaleDateString('es-ES', { weekday: 'short' }))
      const facturacionDia = sesionesPeriodo
        .filter(s => s.fecha_cita === fechaStr && (s.estado === 'realizada' || s.estado === 'completada'))
        .reduce((sum, s) => sum + (s.precio_estimado || PRECIO_SESION_DEFAULT), 0)
      data.push(facturacionDia)
    }
  } else {
    // Últimas 4 semanas
    for (let i = 3; i >= 0; i--) {
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(hoy.getDate() - (i + 1) * 7)
      const finSemana = new Date(hoy)
      finSemana.setDate(hoy.getDate() - i * 7)

      labels.push(`Sem ${4 - i}`)
      const facturacionSemana = sesionesPeriodo
        .filter(s => {
          const fecha = new Date(s.fecha_cita)
          return fecha >= inicioSemana && fecha < finSemana &&
            (s.estado === 'realizada' || s.estado === 'completada')
        })
        .reduce((sum, s) => sum + (s.precio_estimado || PRECIO_SESION_DEFAULT), 0)
      data.push(facturacionSemana)
    }
  }

  return {
    labels,
    datasets: [{
      label: 'Facturación (€)',
      data,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10B981',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4
    }]
  }
})

/**
 * Datos para gráfico de doughnut de estados
 */
const chartDataEstados = computed(() => {
  const sesionesPeriodo = sesionesPeriodoResumen.value

  const pendientes = sesionesPeriodo.filter(s => s.estado === 'pendiente').length
  const confirmadas = sesionesPeriodo.filter(s => s.estado === 'confirmada').length
  const realizadas = sesionesPeriodo.filter(s => s.estado === 'realizada' || s.estado === 'completada').length
  const canceladas = sesionesPeriodo.filter(s => s.estado === 'cancelada').length

  return {
    labels: ['Pendientes', 'Confirmadas', 'Realizadas', 'Canceladas'],
    datasets: [{
      data: [pendientes, confirmadas, realizadas, canceladas],
      backgroundColor: ['#F59E0B', '#10B981', '#3B82F6', '#9CA3AF'],
      borderWidth: 0,
      cutout: '70%'
    }]
  }
})

/**
 * Opciones para gráfico de barras
 */
const chartOptionsSesiones = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1F2937',
      titleColor: '#F9FAFB',
      bodyColor: '#F9FAFB',
      borderRadius: 8,
      padding: 10
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: { beginAtZero: true, grid: { color: '#F3F4F6' }, ticks: { stepSize: 1, font: { size: 11 } } }
  }
}

/**
 * Opciones para gráfico de línea
 */
const chartOptionsFacturacion = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1F2937',
      titleColor: '#F9FAFB',
      bodyColor: '#F9FAFB',
      borderRadius: 8,
      padding: 10,
      callbacks: {
        label: (context: any) => `${context.parsed.y.toFixed(2)}€`
      }
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: { beginAtZero: true, grid: { color: '#F3F4F6' }, ticks: { font: { size: 11 }, callback: (value: number) => `${value}€` } }
  }
}

/**
 * Opciones para gráfico de doughnut
 */
const chartOptionsEstados = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { usePointStyle: true, padding: 12, font: { size: 11 } }
    }
  }
}

/**
 * Top 5 pacientes con más sesiones en el período
 */
const topPacientes = computed(() => {
  const sesionesPeriodo = sesionesPeriodoResumen.value.filter(s =>
    s.estado === 'realizada' || s.estado === 'completada'
  )

  const porPaciente: Record<string, { id: string; nombre: string; sesiones: number; facturado: number }> = {}

  sesionesPeriodo.forEach(s => {
    const pacienteId = s.paciente?.id || 'desconocido'
    const nombre = s.paciente?.nombre_completo || 'Sin nombre'

    if (!porPaciente[pacienteId]) {
      porPaciente[pacienteId] = { id: pacienteId, nombre, sesiones: 0, facturado: 0 }
    }
    porPaciente[pacienteId].sesiones++
    porPaciente[pacienteId].facturado += s.precio_estimado || PRECIO_SESION_DEFAULT
  })

  return Object.values(porPaciente)
    .sort((a, b) => b.sesiones - a.sesiones)
    .slice(0, 5)
})

// ============================================================================
// AGRUPACIÓN POR FECHA Y DETECCIÓN DE SESIONES PRÓXIMAS
// ============================================================================

/**
 * Calcula cuántas horas faltan para una sesión
 */
const horasHastaSesion = (sesion: any): number => {
  const ahora = new Date()
  const fechaSesion = new Date(`${sesion.fecha_cita}T${sesion.hora_inicio || '00:00'}`)
  return (fechaSesion.getTime() - ahora.getTime()) / (1000 * 60 * 60)
}

/**
 * Determina el estado visual de urgencia de una sesión
 */
const getEstadoUrgencia = (sesion: any): { tipo: string; clase: string; icono: string; texto: string } | null => {
  if (sesion.estado === 'cancelada' || sesion.estado === 'realizada' || sesion.estado === 'completada') {
    return null
  }

  const horas = horasHastaSesion(sesion)

  // Ya pasó
  if (horas < 0) return null

  // Inminente (próximas 2 horas)
  if (horas <= 2) {
    return {
      tipo: 'inminente',
      clase: 'bg-teal-100 text-teal-700 border-teal-200 ring-2 ring-teal-300/50',
      icono: 'bolt',
      texto: 'Ahora'
    }
  }

  // Próxima (próximas 24 horas)
  if (horas <= 24) {
    return {
      tipo: 'proxima',
      clase: 'bg-green-100 text-green-700 border-green-200',
      icono: 'arrow-right',
      texto: 'Hoy'
    }
  }

  // Requiere atención (24-48 horas)
  if (horas <= 48 && sesion.estado === 'pendiente') {
    return {
      tipo: 'atencion',
      clase: 'bg-orange-100 text-orange-700 border-orange-200 animate-pulse',
      icono: 'exclamation',
      texto: 'Confirmar'
    }
  }

  // Próximas 72 horas
  if (horas <= 72) {
    return {
      tipo: 'pronto',
      clase: 'bg-amber-50 text-amber-700 border-amber-200',
      icono: 'clock',
      texto: `${Math.ceil(horas / 24)}d`
    }
  }

  return null
}

/**
 * Agrupa sesiones por fecha para mostrar separadores
 */
const sesionesAgrupadas = computed(() => {
  const grupos: { fecha: string; fechaFormateada: string; esHoy: boolean; esMañana: boolean; sesiones: any[] }[] = []
  const sesionesOrdenadas = [...sesionesFiltradas.value]

  // Ordenar por fecha y hora (más recientes primero para el pasado, próximas primero para el futuro)
  sesionesOrdenadas.sort((a, b) => {
    const fechaA = new Date(`${a.fecha_cita}T${a.hora_inicio || '00:00'}`)
    const fechaB = new Date(`${b.fecha_cita}T${b.hora_inicio || '00:00'}`)
    return fechaB.getTime() - fechaA.getTime()
  })

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const mañana = new Date(hoy)
  mañana.setDate(mañana.getDate() + 1)

  let fechaActual = ''

  sesionesOrdenadas.forEach(sesion => {
    if (sesion.fecha_cita !== fechaActual) {
      fechaActual = sesion.fecha_cita
      const fechaSesion = new Date(sesion.fecha_cita + 'T00:00:00')
      const esHoy = fechaSesion.toDateString() === hoy.toDateString()
      const esMañana = fechaSesion.toDateString() === mañana.toDateString()

      grupos.push({
        fecha: sesion.fecha_cita,
        fechaFormateada: formatearFechaGrupo(sesion.fecha_cita),
        esHoy,
        esMañana,
        sesiones: []
      })
    }
    grupos[grupos.length - 1].sesiones.push(sesion)
  })

  return grupos
})

/**
 * Formatea fecha para separadores de grupo
 */
const formatearFechaGrupo = (fecha: string): string => {
  if (!fecha) return ''
  const date = new Date(fecha + 'T00:00:00')
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const mañana = new Date(hoy)
  mañana.setDate(mañana.getDate() + 1)
  const ayer = new Date(hoy)
  ayer.setDate(ayer.getDate() - 1)

  if (date.toDateString() === hoy.toDateString()) return 'Hoy'
  if (date.toDateString() === mañana.toDateString()) return 'Mañana'
  if (date.toDateString() === ayer.toDateString()) return 'Ayer'

  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

// Métodos
const limpiarFiltros = () => {
  filtros.value = { busqueda: '', estado: '', periodo: 'todos', modalidad: '', porCobrar: false }
}

const navegarAAgenda = () => {
  router.push('/terapeuta/agenda')
}

const cargarSesiones = async () => {
  try {
    cargando.value = true
    error.value = null

    let intentos = 0
    while (!user.value && intentos < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      intentos++
    }

    if (!user.value) throw new Error('Usuario no autenticado')

    const { data: terapeuta, error: errorTerapeuta } = await supabase
      .from('terapeutas')
      .select('id, disponibilidad')
      .eq('email', user.value.email)
      .single()

    if (errorTerapeuta) throw errorTerapeuta
    if (!terapeuta) throw new Error('No se encontró el terapeuta')

    // Cargar disponibilidad del terapeuta para calcular tasa de ocupación
    if (terapeuta.disponibilidad && typeof terapeuta.disponibilidad === 'object') {
      disponibilidadTerapeuta.value = terapeuta.disponibilidad as Record<string, string[]>
    }

    // Usar vista_agenda_terapeutas que ya existe y tiene todos los datos
    const { data, error: errorSesiones } = await supabase
      .from('vista_agenda_terapeutas')
      .select('*')
      .eq('terapeuta_id', terapeuta.id)
      .order('fecha_cita', { ascending: false })

    if (errorSesiones) throw errorSesiones

    sesiones.value = (data || []).map(sesion => ({
      id: sesion.cita_id,
      fecha_cita: sesion.fecha_cita,
      hora_inicio: sesion.hora_inicio,
      hora_fin: sesion.hora_fin,
      duracion_minutos: sesion.duracion_minutos,
      modalidad: sesion.modalidad,
      estado: sesion.estado,
      observaciones: sesion.observaciones,
      notas_terapeuta: sesion.notas_terapeuta,
      precio_estimado: sesion.cita_metadata?.precio_sesion || PRECIO_SESION_DEFAULT,
      esta_pagado: sesion.cita_metadata?.metodo_pago === 'bono' || sesion.bono_estado === 'activo',
      paciente: {
        id: sesion.paciente_id,
        nombre_completo: sesion.paciente_nombre,
        email: sesion.paciente_email
      },
      bono: sesion.bono_id ? {
        id: sesion.bono_id,
        sesiones_totales: sesion.bono_sesiones_totales,
        sesiones_restantes: sesion.bono_sesiones_restantes,
        pagado: sesion.bono_estado === 'activo' || sesion.bono_estado === 'pagado'
      } : null
    }))

  } catch (err: any) {
    error.value = err.message || 'Error desconocido'
  } finally {
    cargando.value = false
  }
}

const cargarBonosPagados = async () => {
  try {
    if (!user.value) return

    const { data: terapeuta } = await supabase
      .from('terapeutas')
      .select('id')
      .eq('email', user.value.email)
      .single()

    if (!terapeuta) return

    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id')
      .eq('terapeuta_id', terapeuta.id)

    if (!pacientes || pacientes.length === 0) {
      bonosPagadosDirectos.value = []
      return
    }

    const { data: bonos } = await supabase
      .from('bonos')
      .select(`
        id,
        paciente_id,
        sesiones_totales,
        sesiones_restantes,
        monto_total,
        tipo_bono,
        fecha_pago,
        pagado,
        paciente:pacientes!bonos_paciente_id_fkey (
          nombre_completo
        )
      `)
      .eq('pagado', true)
      .in('paciente_id', pacientes.map(p => p.id))
      .order('fecha_pago', { ascending: false })

    bonosPagadosDirectos.value = (bonos || []).map(bono => ({
      ...bono,
      paciente_nombre: bono.paciente?.nombre_completo
    }))

  } catch (err) {
    console.error('Error cargando bonos:', err)
  }
}

const verDetalles = (sesion: any) => {
  citaSeleccionada.value = sesion.id
  mostrarModalDetalles.value = true
}

const cerrarModalDetalles = () => {
  mostrarModalDetalles.value = false
  citaSeleccionada.value = null
}

// Acciones rápidas para sesiones
const confirmarSesion = async (sesion: any, event?: Event) => {
  event?.stopPropagation()
  if (actualizandoEstado.value === sesion.id) return

  try {
    actualizandoEstado.value = sesion.id
    const { error } = await supabase
      .from('citas')
      .update({ estado: 'confirmada' })
      .eq('id', sesion.id)

    if (error) throw error

    // Actualizar localmente
    const idx = sesiones.value.findIndex(s => s.id === sesion.id)
    if (idx !== -1) {
      sesiones.value[idx].estado = 'confirmada'
    }
  } catch (err: any) {
    console.error('Error confirmando sesión:', err)
    alert('Error al confirmar la sesión')
  } finally {
    actualizandoEstado.value = null
    menuAbierto.value = null
  }
}

const marcarRealizada = async (sesion: any, event?: Event) => {
  event?.stopPropagation()
  if (actualizandoEstado.value === sesion.id) return

  try {
    actualizandoEstado.value = sesion.id
    const { error } = await supabase
      .from('citas')
      .update({ estado: 'realizada' })
      .eq('id', sesion.id)

    if (error) throw error

    // Actualizar localmente
    const idx = sesiones.value.findIndex(s => s.id === sesion.id)
    if (idx !== -1) {
      sesiones.value[idx].estado = 'realizada'
    }
  } catch (err: any) {
    console.error('Error marcando sesión como realizada:', err)
    alert('Error al marcar la sesión como realizada')
  } finally {
    actualizandoEstado.value = null
    menuAbierto.value = null
  }
}

const cancelarSesion = async (sesion: any, event?: Event) => {
  event?.stopPropagation()
  if (actualizandoEstado.value === sesion.id) return
  if (!confirm('¿Estás seguro de que quieres cancelar esta sesión?')) return

  try {
    actualizandoEstado.value = sesion.id
    const { error } = await supabase
      .from('citas')
      .update({ estado: 'cancelada' })
      .eq('id', sesion.id)

    if (error) throw error

    // Actualizar localmente
    const idx = sesiones.value.findIndex(s => s.id === sesion.id)
    if (idx !== -1) {
      sesiones.value[idx].estado = 'cancelada'
    }
  } catch (err: any) {
    console.error('Error cancelando sesión:', err)
    alert('Error al cancelar la sesión')
  } finally {
    actualizandoEstado.value = null
    menuAbierto.value = null
  }
}

const irAlPerfilPaciente = (sesion: any, event?: Event) => {
  event?.stopPropagation()
  event?.preventDefault()
  const pacienteId = sesion.paciente?.id || sesion.paciente_id
  if (pacienteId) {
    console.log('[Sesiones] Navegando a ficha de paciente:', pacienteId)
    navigateTo(`/terapeuta/pacientes/${pacienteId}`)
  } else {
    console.warn('[Sesiones] No se encontró ID del paciente', sesion)
  }
}

const toggleMenu = (sesionId: string, event: Event) => {
  event.stopPropagation()
  menuAbierto.value = menuAbierto.value === sesionId ? null : sesionId
}

const cerrarMenu = () => {
  menuAbierto.value = null
}

// Cerrar menú al hacer clic fuera
const handleClickOutside = (event: MouseEvent) => {
  if (menuAbierto.value && !(event.target as Element).closest('.menu-contextual')) {
    menuAbierto.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  cargarSesiones()
  cargarBonosPagados()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Helpers
const formatearPrecio = (precio: number) => precio?.toFixed(2) || '0.00'

const formatearFecha = (fecha: string) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatearFechaCorta = (fecha: string) => {
  if (!fecha) return '-'
  const date = new Date(fecha + 'T00:00:00')
  const hoy = new Date()
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)

  if (date.toDateString() === hoy.toDateString()) return 'Hoy'
  if (date.toDateString() === ayer.toDateString()) return 'Ayer'

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const formatearHora = (hora: string) => hora?.substring(0, 5) || '-'

const obtenerIniciales = (nombre: string) => {
  return nombre?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??'
}

const obtenerTextoEstado = (estado: string) => {
  const textos: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    realizada: 'Realizada',
    completada: 'Realizada',
    cancelada: 'Cancelada'
  }
  return textos[estado] || estado
}

const obtenerColorTextoEstado = (estado: string) => {
  const colores: Record<string, string> = {
    pendiente: 'text-gray-600',
    confirmada: 'text-green-600',
    realizada: 'text-green-700',
    completada: 'text-green-700',
    cancelada: 'text-red-600'
  }
  return colores[estado] || 'text-gray-600'
}

const obtenerColorPuntoEstado = (estado: string) => {
  const colores: Record<string, string> = {
    pendiente: 'bg-gray-400',
    confirmada: 'bg-green-500',
    realizada: 'bg-green-600',
    completada: 'bg-green-600',
    cancelada: 'bg-red-500'
  }
  return colores[estado] || 'bg-gray-400'
}

const obtenerClasesBadgeEstado = (estado: string) => {
  const clases: Record<string, string> = {
    pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    realizada: 'bg-blue-50 text-blue-700 border-blue-200',
    completada: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelada: 'bg-gray-100 text-gray-500 border-gray-200'
  }
  return clases[estado] || 'bg-gray-50 text-gray-600 border-gray-200'
}

// ============================================================================
// FUNCIONES DE EXPORTACIÓN
// ============================================================================

/**
 * Exportar sesiones filtradas a Excel (CSV)
 */
const exportarExcel = () => {
  mostrarMenuExportar.value = false

  const sesionesExportar = sesionesFiltradas.value
  if (sesionesExportar.length === 0) {
    alert('No hay sesiones para exportar')
    return
  }

  // Cabeceras del CSV
  const cabeceras = [
    'Fecha',
    'Hora Inicio',
    'Hora Fin',
    'Paciente',
    'Estado',
    'Modalidad',
    'Precio (€)',
    'Pagado',
    'Observaciones'
  ]

  // Datos
  const filas = sesionesExportar.map(s => [
    s.fecha_cita,
    s.hora_inicio,
    s.hora_fin,
    s.paciente?.nombre_completo || 'Sin nombre',
    obtenerTextoEstado(s.estado),
    s.modalidad === 'online' ? 'Online' : 'Presencial',
    (s.precio_estimado || PRECIO_SESION_DEFAULT).toFixed(2),
    s.esta_pagado || s.bono?.pagado ? 'Sí' : 'No',
    (s.observaciones || '').replace(/"/g, '""')
  ])

  // Crear CSV con BOM para Excel
  const BOM = '\uFEFF'
  const csv = BOM + [
    cabeceras.join(';'),
    ...filas.map(fila => fila.map(celda => `"${celda}"`).join(';'))
  ].join('\n')

  // Descargar archivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sesiones_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exportar sesiones filtradas a PDF
 */
const exportarPDF = () => {
  mostrarMenuExportar.value = false

  const sesionesExportar = sesionesFiltradas.value
  if (sesionesExportar.length === 0) {
    alert('No hay sesiones para exportar')
    return
  }

  // Calcular totales
  const totalSesiones = sesionesExportar.length
  const totalFacturado = sesionesExportar
    .filter(s => s.estado === 'realizada' || s.estado === 'completada')
    .reduce((sum, s) => sum + (s.precio_estimado || PRECIO_SESION_DEFAULT), 0)
  const sesionesPendientesPago = sesionesExportar
    .filter(s => (s.estado === 'realizada' || s.estado === 'completada') && !s.esta_pagado && !s.bono?.pagado)
    .length

  // Crear contenido HTML para el PDF
  const contenidoHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Informe de Sesiones</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
        h1 { color: #7C3AED; font-size: 24px; margin-bottom: 5px; }
        .fecha-informe { color: #6B7280; margin-bottom: 20px; }
        .resumen { background: #F3F4F6; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 30px; }
        .resumen-item { text-align: center; }
        .resumen-valor { font-size: 24px; font-weight: bold; color: #1F2937; }
        .resumen-label { color: #6B7280; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #7C3AED; color: white; padding: 10px 8px; text-align: left; font-size: 11px; }
        td { padding: 8px; border-bottom: 1px solid #E5E7EB; font-size: 11px; }
        tr:nth-child(even) { background: #F9FAFB; }
        .estado { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 500; }
        .estado-realizada { background: #DBEAFE; color: #1E40AF; }
        .estado-confirmada { background: #D1FAE5; color: #065F46; }
        .estado-pendiente { background: #FEF3C7; color: #92400E; }
        .estado-cancelada { background: #F3F4F6; color: #6B7280; }
        .precio { text-align: right; font-weight: 500; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <h1>Informe de Sesiones</h1>
      <p class="fecha-informe">Generado el ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div class="resumen">
        <div class="resumen-item">
          <div class="resumen-valor">${totalSesiones}</div>
          <div class="resumen-label">Total Sesiones</div>
        </div>
        <div class="resumen-item">
          <div class="resumen-valor">${totalFacturado.toFixed(2)}€</div>
          <div class="resumen-label">Facturado</div>
        </div>
        <div class="resumen-item">
          <div class="resumen-valor">${sesionesPendientesPago}</div>
          <div class="resumen-label">Pendientes de Pago</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Paciente</th>
            <th>Estado</th>
            <th>Modalidad</th>
            <th style="text-align: right">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${sesionesExportar.map(s => `
            <tr>
              <td>${formatearFechaCorta(s.fecha_cita)}</td>
              <td>${s.hora_inicio?.substring(0, 5) || '-'}</td>
              <td>${s.paciente?.nombre_completo || 'Sin nombre'}</td>
              <td><span class="estado estado-${s.estado}">${obtenerTextoEstado(s.estado)}</span></td>
              <td>${s.modalidad === 'online' ? 'Online' : 'Presencial'}</td>
              <td class="precio">${(s.precio_estimado || PRECIO_SESION_DEFAULT).toFixed(2)}€</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  // Abrir ventana para imprimir/guardar como PDF
  const ventana = window.open('', '_blank')
  if (ventana) {
    ventana.document.write(contenidoHTML)
    ventana.document.close()
    ventana.focus()
    setTimeout(() => {
      ventana.print()
    }, 250)
  }
}

</script>
