<template>
  <div>
    <!-- Header minimalista -->
    <header class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <!-- Título con contador del filtro activo -->
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">
            Pacientes
            <span class="text-gray-400 font-normal">({{ contadorFiltroActivo }})</span>
          </h1>
        </div>

        <!-- Botones de acción compactos -->
        <div class="flex items-center gap-2">
          <!-- Toggle Resumen/Gráficos -->
          <button
            @click="mostrarResumen = !mostrarResumen"
            class="min-h-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 border"
            :class="mostrarResumen
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'"
            title="Ver resumen y estadísticas"
          >
            <ChartBarIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Resumen</span>
          </button>

          <button
            @click="abrirModalImportar"
            class="min-h-[40px] px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
            aria-label="Importar pacientes"
          >
            <ArrowUpTrayIcon class="w-4 h-4" aria-hidden="true" />
            <span class="hidden sm:inline">Importar</span>
          </button>

          <button
            @click="abrirModalExportar"
            class="min-h-[40px] px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
            aria-label="Exportar pacientes"
          >
            <ArrowDownTrayIcon class="w-4 h-4" aria-hidden="true" />
            <span class="hidden sm:inline">Exportar</span>
          </button>

          <button
            @click="abrirModalNuevoPaciente"
            class="min-h-[40px] px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
            aria-label="Añadir nuevo paciente"
          >
            <PlusIcon class="w-4 h-4" aria-hidden="true" />
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      <!-- Panel de Resumen y Estadísticas (colapsable) -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-[800px]"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 max-h-[800px]"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="mostrarResumen" class="bg-white border border-gray-100 rounded-xl p-4 mb-4 overflow-hidden">
          <!-- Header del panel -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ChartBarIcon class="w-5 h-5 text-indigo-500" />
              Estadísticas de Pacientes
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

          <!-- Grid de métricas -->
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            <!-- Total Pacientes -->
            <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserGroupIcon class="w-4 h-4 text-purple-600" />
                </div>
                <span class="text-xs font-medium text-purple-600 uppercase">Total</span>
              </div>
              <p class="text-2xl font-bold text-purple-900">{{ metricasPacientes.total }}</p>
              <p class="text-xs text-purple-600 mt-1">{{ metricasPacientes.activos }} activos</p>
            </div>

            <!-- Nuevos este período -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <PlusIcon class="w-4 h-4 text-green-600" />
                </div>
                <span class="text-xs font-medium text-green-600 uppercase">Nuevos</span>
              </div>
              <p class="text-2xl font-bold text-green-900">{{ metricasPacientes.nuevos }}</p>
              <p class="text-xs text-green-600 mt-1">
                <span :class="metricasPacientes.tendenciaNuevos >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ metricasPacientes.tendenciaNuevos >= 0 ? '+' : '' }}{{ metricasPacientes.tendenciaNuevos }}%
                </span>
                vs período ant.
              </p>
            </div>

            <!-- Churn (bajas) -->
            <div class="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowDownTrayIcon class="w-4 h-4 text-red-600 rotate-90" />
                </div>
                <span class="text-xs font-medium text-red-600 uppercase">Churn</span>
              </div>
              <p class="text-2xl font-bold text-red-900">{{ metricasPacientes.churn }}%</p>
              <p class="text-xs text-red-600 mt-1">{{ metricasPacientes.finalizados }} finalizados</p>
            </div>

            <!-- Retención -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span class="text-xs font-medium text-blue-600 uppercase">Retención</span>
              </div>
              <p class="text-2xl font-bold text-blue-900">{{ metricasPacientes.retencion }}%</p>
              <p class="text-xs text-blue-600 mt-1">Pacientes que continúan</p>
            </div>

            <!-- Promedio Sesiones -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <ClipboardDocumentListIcon class="w-4 h-4 text-amber-600" />
                </div>
                <span class="text-xs font-medium text-amber-600 uppercase">Prom. Sesiones</span>
              </div>
              <p class="text-2xl font-bold text-amber-900">{{ metricasPacientes.promedioSesiones }}</p>
              <p class="text-xs text-amber-600 mt-1">Por paciente</p>
            </div>
          </div>

          <!-- Gráficos -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Gráfico de evolución de pacientes -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">Evolución de Pacientes</h4>
              <div class="h-48">
                <Line
                  v-if="chartDataEvolucion"
                  :data="chartDataEvolucion"
                  :options="chartOptionsEvolucion"
                />
              </div>
            </div>

            <!-- Gráfico de distribución por estado -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">Distribución por Estado</h4>
              <div class="h-48">
                <Doughnut
                  v-if="chartDataDistribucion"
                  :data="chartDataDistribucion"
                  :options="chartOptionsDistribucion"
                />
              </div>
            </div>
          </div>

          <!-- Insights de Churn -->
          <div class="mt-6 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl p-4 border border-red-100">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon class="w-5 h-5 text-red-600" />
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-semibold text-gray-800 mb-1">Análisis de Churn</h4>
                <p class="text-xs text-gray-600 mb-2">
                  {{ metricasPacientes.pacientesEnRiesgo }} pacientes no han tenido sesión en los últimos 30 días y podrían estar en riesgo de abandono.
                </p>
                <div class="flex flex-wrap gap-2">
                  <span class="px-2 py-1 bg-white rounded text-xs font-medium text-red-700">
                    {{ metricasPacientes.sinCitaProxima }} sin cita programada
                  </span>
                  <span class="px-2 py-1 bg-white rounded text-xs font-medium text-amber-700">
                    {{ metricasPacientes.bonosPorVencer }} con bono por vencer
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Buscador y filtros -->
      <div class="space-y-3 sm:space-y-4">
        <!-- Buscador -->
        <div class="relative">
          <input
            v-model="busquedaDebounced"
            @input="handleBusquedaInput"
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            class="w-full min-h-[44px] h-11 px-4 pl-10 bg-white border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm placeholder-gray-400"
            aria-label="Buscar pacientes"
          />
          <MagnifyingGlassIcon class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <button
            v-if="busqueda"
            @click="busqueda = ''; busquedaDebounced = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Limpiar búsqueda"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Tabs de estado con underline - scroll horizontal en móvil -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 border-b border-gray-100">
          <nav class="flex gap-1 -mb-px overflow-x-auto scrollbar-hide pb-px" role="tablist">
            <button
              v-for="filtro in filtrosEstadoConContadores"
              :key="filtro.valor"
              @click="estadoSeleccionado = filtro.valor"
              class="min-h-[44px] px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0"
              :class="estadoSeleccionado === filtro.valor
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-gray-700'"
              :aria-selected="estadoSeleccionado === filtro.valor"
              role="tab"
            >
              <span>{{ filtro.label }}</span>
              <span class="ml-1 sm:ml-1.5 text-xs" :class="estadoSeleccionado === filtro.valor ? 'text-purple-500' : 'text-gray-400'">
                {{ filtro.count }}
              </span>
              <!-- Underline activo -->
              <span
                v-if="estadoSeleccionado === filtro.valor"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full"
              ></span>
            </button>
          </nav>

          <!-- Botón de filtros avanzados -->
          <button
            @click="mostrarFiltrosAvanzados = !mostrarFiltrosAvanzados"
            class="flex items-center justify-center sm:justify-start gap-1.5 min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg transition-colors flex-shrink-0"
            :class="hayFiltrosActivos
              ? 'text-purple-600 bg-purple-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
          >
            <FunnelIcon class="w-4 h-4" />
            <span>Filtros</span>
            <span
              v-if="contadorFiltrosActivos > 0"
              class="w-5 h-5 flex items-center justify-center text-xs font-semibold bg-purple-600 text-white rounded-full"
            >
              {{ contadorFiltrosActivos }}
            </span>
            <ChevronDownIcon
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': mostrarFiltrosAvanzados }"
            />
          </button>
        </div>

        <!-- Panel de filtros avanzados (colapsable) -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="mostrarFiltrosAvanzados" class="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
              <!-- Filtro por área -->
              <select
                v-model="areaSeleccionada"
                class="min-h-[44px] h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 w-full sm:w-auto"
                aria-label="Filtrar por área"
              >
                <option value="">Todas las áreas</option>
                <option v-for="area in areasDisponibles" :key="area" :value="area">
                  {{ area }}
                </option>
              </select>

              <!-- Chips de filtros - scroll horizontal en móvil -->
              <div class="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible scrollbar-hide -mx-1 px-1 sm:mx-0 sm:px-0">
                <button
                  @click="toggleFiltro('sinProximaCita')"
                  class="min-h-[44px] h-9 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
                  :class="filtrosActivos.sinProximaCita
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'"
                >
                  <CalendarDaysIcon class="w-4 h-4" />
                  <span class="hidden xs:inline">Sin próxima cita</span>
                  <span class="xs:hidden">Sin cita</span>
                </button>

                <button
                  @click="toggleFiltro('sinSesionRegistrada')"
                  class="min-h-[44px] h-9 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
                  :class="filtrosActivos.sinSesionRegistrada
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'"
                >
                  <ClipboardDocumentListIcon class="w-4 h-4" />
                  Sin sesión
                </button>

                <button
                  @click="toggleFiltro('requiereAtencion')"
                  class="min-h-[44px] h-9 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
                  :class="filtrosActivos.requiereAtencion
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'"
                >
                  <ExclamationTriangleIcon class="w-4 h-4" />
                  <span class="hidden xs:inline">Requiere atención</span>
                  <span class="xs:hidden">Atención</span>
                </button>

                <!-- Nuevos filtros -->
                <button
                  @click="toggleFiltro('citasEstaSemana')"
                  class="min-h-[44px] h-9 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
                  :class="filtrosActivos.citasEstaSemana
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'"
                >
                  <CalendarDaysIcon class="w-4 h-4" />
                  <span class="hidden xs:inline">Citas esta semana</span>
                  <span class="xs:hidden">Esta semana</span>
              </button>

                <button
                  @click="toggleFiltro('bonosPorVencer')"
                  class="min-h-[44px] h-9 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
                  :class="filtrosActivos.bonosPorVencer
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'"
                >
                  <TicketIcon class="w-4 h-4" />
                  <span class="hidden xs:inline">Bonos por vencer</span>
                  <span class="xs:hidden">Bonos</span>
                </button>

                <button
                  @click="toggleFiltro('pagoPendiente')"
                  class="min-h-[44px] h-9 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
                  :class="filtrosActivos.pagoPendiente
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'"
                >
                  <CurrencyDollarIcon class="w-4 h-4" />
                  <span class="hidden xs:inline">Pago pendiente</span>
                  <span class="xs:hidden">Pago</span>
                </button>
              </div>

              <!-- Limpiar filtros -->
              <button
                v-if="hayFiltrosActivos"
                @click="limpiarFiltrosAvanzados"
                class="min-h-[44px] h-9 px-3 text-sm text-gray-500 hover:text-gray-700 transition-colors w-full sm:w-auto text-center"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </header>

    <!-- Barra de vista y resultados -->
    <div class="flex items-center justify-between mb-4 gap-2">
      <p class="text-xs sm:text-sm text-gray-500 min-w-0">
        <span v-if="totalFiltrados === totalPacientes">{{ totalPacientes }} pacientes</span>
        <span v-else>{{ totalFiltrados }} de {{ totalPacientes }}</span>
        <span v-if="totalPaginas > 1" class="ml-1 sm:ml-2 text-gray-400">
          <span class="hidden xs:inline">(página </span>{{ paginaActual }}<span class="hidden xs:inline"> de {{ totalPaginas }})</span><span class="xs:hidden">/{{ totalPaginas }}</span>
        </span>
      </p>

      <!-- Toggle vista - ocultar en móvil muy pequeño, siempre mostrar cards -->
      <div class="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          @click="vistaActual = 'cards'"
          class="min-h-[36px] min-w-[36px] p-1.5 rounded transition-colors flex items-center justify-center"
          :class="vistaActual === 'cards' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'"
          title="Vista de tarjetas"
        >
          <Squares2X2Icon class="w-4 h-4" />
        </button>
        <button
          @click="vistaActual = 'tabla'"
          class="min-h-[36px] min-w-[36px] p-1.5 rounded transition-colors flex items-center justify-center"
          :class="vistaActual === 'tabla' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'"
          title="Vista de tabla"
        >
          <TableCellsIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Lista de pacientes -->
    <section>
      <!-- Estado de carga -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-20"
        role="status"
      >
        <div class="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-sm text-gray-500">Cargando pacientes...</p>
      </div>

      <!-- Estado vacío -->
      <div
        v-else-if="pacientesFiltrados.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <UserGroupIcon class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">
          {{ tieneAlgunFiltro ? 'Sin resultados' : 'Sin pacientes' }}
        </h3>
        <p class="text-sm text-gray-500 mb-4 max-w-sm">
          {{ tieneAlgunFiltro
            ? 'Prueba ajustando los filtros de búsqueda'
            : 'Comienza añadiendo tu primer paciente' }}
        </p>
        <button
          v-if="!tieneAlgunFiltro"
          @click="abrirModalNuevoPaciente"
          class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Añadir paciente
        </button>
        <button
          v-else
          @click="limpiarTodosFiltros"
          class="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Vista de tarjetas -->
      <template v-else-if="vistaActual === 'cards'">
        <div
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
          role="list"
        >
          <div
            v-for="paciente in pacientesFiltrados"
            :key="paciente.id"
            class="relative group"
            role="listitem"
          >
            <PacienteCard
              :paciente="paciente"
              @ver-ficha="irAFichaPaciente"
              @ver-preview="abrirPreview"
              @editar="abrirModalEditar"
              @eliminar="abrirModalEliminar"
              @ver-citas="verCitasPaciente"
              @gestionar-bonos="gestionarBonosPaciente"
              @editar-cita="abrirModalEditarCita"
            />

            <!-- Botón Asignar Cita (min 44x44 para tablets) -->
            <button
              v-if="paciente.activo && !paciente.en_pausa"
              @click.stop="abrirModalAsignarCita(paciente)"
              class="absolute bottom-4 right-4 min-h-[44px] min-w-[44px] h-11 px-4 bg-purple-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-purple-700 active:bg-purple-800 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto z-10"
              :aria-label="`Asignar cita a ${paciente.nombre}`"
            >
              <CalendarDaysIcon class="w-5 h-5" />
              <span class="hidden sm:inline">Cita</span>
            </button>
          </div>
        </div>
      </template>

      <!-- Vista de tabla -->
      <template v-else-if="vistaActual === 'tabla'">
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <PacienteTabla
            :pacientes="pacientesFiltrados"
            @ver-ficha="irAFichaPaciente"
            @editar="abrirModalEditar"
            @gestionar-bonos="gestionarBonosPaciente"
            @ver-preview="abrirPreview"
          />
        </div>
      </template>

      <!-- Paginación -->
      <nav
        v-if="totalPaginas > 1"
        class="mt-6 flex items-center justify-center gap-2"
        role="navigation"
        aria-label="Paginación"
      >
        <button
          @click="irAPagina(paginaActual - 1)"
          :disabled="paginaActual === 1"
          class="min-h-[44px] min-w-[44px] p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          aria-label="Página anterior"
        >
          <ChevronLeftIcon class="w-5 h-5" />
        </button>

        <div class="flex items-center gap-1">
          <!-- Primera página -->
          <button
            v-if="paginaActual > 3"
            @click="irAPagina(1)"
            class="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            1
          </button>
          <span v-if="paginaActual > 4" class="px-2 text-gray-400">...</span>

          <!-- Páginas cercanas -->
          <button
            v-for="pagina in paginasVisibles"
            :key="pagina"
            @click="irAPagina(pagina)"
            class="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="pagina === paginaActual
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'"
          >
            {{ pagina }}
          </button>

          <!-- Última página -->
          <span v-if="paginaActual < totalPaginas - 3" class="px-2 text-gray-400">...</span>
          <button
            v-if="paginaActual < totalPaginas - 2"
            @click="irAPagina(totalPaginas)"
            class="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {{ totalPaginas }}
          </button>
        </div>

        <button
          @click="irAPagina(paginaActual + 1)"
          :disabled="paginaActual === totalPaginas"
          class="min-h-[44px] min-w-[44px] p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          aria-label="Página siguiente"
        >
          <ChevronRightIcon class="w-5 h-5" />
        </button>
      </nav>
    </section>

    <!-- Modales -->
    <ModalNuevaCita
      :mostrar="mostrarModalAsignarCita"
      :paciente-preseleccionado="pacienteSeleccionadoCita"
      @cerrar="cerrarModalAsignarCita"
      @cita-creada="manejarCitaCreada"
    />

    <ModalNuevoPaciente
      :mostrar="mostrarModalNuevo"
      @cerrar="cerrarModalNuevo"
      @paciente-creado="manejarPacienteCreado"
    />

    <ModalEditarPaciente
      :mostrar="mostrarModalEditar"
      :paciente="pacienteSeleccionado"
      @cerrar="cerrarModalEditar"
      @paciente-actualizado="manejarPacienteActualizado"
    />

    <ModalEliminarPaciente
      :mostrar="mostrarModalEliminar"
      :paciente="pacienteSeleccionado"
      @cerrar="cerrarModalEliminar"
      @paciente-eliminado="manejarPacienteEliminado"
      @paciente-desactivado="manejarPacienteDesactivado"
    />

    <ModalEditarCita
      :isOpen="mostrarModalEditarCita"
      :citaId="citaIdSeleccionada"
      @close="cerrarModalEditarCita"
      @actualizado="handleCitaActualizada"
    />

    <ToastContainer />

    <PatientsImportModal
      v-model="mostrarModalImportar"
      :existing-patients="pacientes"
      @import-complete="handleImportComplete"
    />

    <PatientsExportModal
      v-model="mostrarModalExportar"
      :total-patients="totalPacientes"
      :filtered-count="pacientesFiltrados.length"
      :has-filters="hayFiltrosActivos || estadoSeleccionado !== 'todos' || busqueda !== ''"
      :current-filters="filtrosActualesParaExport"
    />

    <!-- Modal de preview rápido -->
    <ModalPreviewPaciente
      :mostrar="mostrarPreview"
      :paciente="pacientePreview"
      @cerrar="cerrarPreview"
      @ver-ficha="(p) => { cerrarPreview(); irAFichaPaciente(p) }"
      @editar="(p) => { cerrarPreview(); abrirModalEditar(p) }"
      @gestionar-bonos="(p) => { cerrarPreview(); gestionarBonosPaciente(p) }"
      @nueva-cita="(p) => { cerrarPreview(); abrirModalAsignarCita(p) }"
    />
  </div>
</template>

<script setup>
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  TableCellsIcon,
  TicketIcon,
  CurrencyDollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

definePageMeta({
  layout: 'terapeuta'
})

const router = useRouter()
const supabase = useSupabaseClient()
const { getUserId, waitForUser } = useSupabase()
const user = useSupabaseUser()
const toast = useToast()

// Estado de modales
const mostrarModalNuevo = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalEliminar = ref(false)
const mostrarModalAsignarCita = ref(false)
const mostrarModalEditarCita = ref(false)
const mostrarModalImportar = ref(false)
const mostrarModalExportar = ref(false)
const citaIdSeleccionada = ref(null)
const pacienteSeleccionado = ref(null)
const pacienteSeleccionadoCita = ref(null)

// Estado principal
const pacientes = ref([])
const loading = ref(true)
const busqueda = ref('')
const busquedaDebounced = ref('')
const estadoSeleccionado = ref('todos')
const areaSeleccionada = ref('')
const mostrarFiltrosAvanzados = ref(false)
const filtrosActivos = ref({
  sinProximaCita: false,
  sinSesionRegistrada: false,
  requiereAtencion: false,
  citasEstaSemana: false,
  bonosPorVencer: false,
  pagoPendiente: false
})

// Vista (cards o tabla)
const vistaActual = ref('cards') // 'cards' | 'tabla'

// Panel de Resumen
const mostrarResumen = ref(false)
const periodoResumen = ref<'semana' | 'mes' | 'trimestre'>('mes')
const periodosResumen = [
  { valor: 'semana', label: 'Semana' },
  { valor: 'mes', label: 'Mes' },
  { valor: 'trimestre', label: 'Trimestre' }
]

// Paginación
const paginaActual = ref(1)
const elementosPorPagina = ref(24)

// Preview modal
const mostrarPreview = ref(false)
const pacientePreview = ref(null)

// Debounce para búsqueda
let debounceTimeout = null
const handleBusquedaInput = (event) => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    busqueda.value = event.target.value
  }, 300)
}

// Filtros de estado
const filtrosEstado = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'activo', label: 'Activos' },
  { valor: 'pausa', label: 'En pausa' },
  { valor: 'finalizado', label: 'Finalizados' }
]

// Contadores
const contadores = computed(() => ({
  activos: pacientes.value.filter(p => p.activo && !p.en_pausa).length,
  enPausa: pacientes.value.filter(p => p.activo && p.en_pausa).length,
  finalizados: pacientes.value.filter(p => !p.activo).length
}))

const filtrosEstadoConContadores = computed(() => {
  return filtrosEstado.map(filtro => {
    let count = 0
    if (filtro.valor === 'todos') count = pacientes.value.length
    else if (filtro.valor === 'activo') count = contadores.value.activos
    else if (filtro.valor === 'pausa') count = contadores.value.enPausa
    else if (filtro.valor === 'finalizado') count = contadores.value.finalizados
    return { ...filtro, count }
  })
})

// Contador del filtro activo (para el header)
const contadorFiltroActivo = computed(() => {
  const filtro = filtrosEstadoConContadores.value.find(f => f.valor === estadoSeleccionado.value)
  return filtro?.count || 0
})

// Áreas disponibles
const areasDisponibles = computed(() => {
  const areas = new Set(
    pacientes.value.map(p => p.area_de_acompanamiento).filter(Boolean)
  )
  return Array.from(areas).sort()
})

// Verificar filtros activos
const hayFiltrosActivos = computed(() => {
  return areaSeleccionada.value !== '' ||
    filtrosActivos.value.sinProximaCita ||
    filtrosActivos.value.sinSesionRegistrada ||
    filtrosActivos.value.requiereAtencion ||
    filtrosActivos.value.citasEstaSemana ||
    filtrosActivos.value.bonosPorVencer ||
    filtrosActivos.value.pagoPendiente
})

const contadorFiltrosActivos = computed(() => {
  let count = 0
  if (areaSeleccionada.value) count++
  if (filtrosActivos.value.sinProximaCita) count++
  if (filtrosActivos.value.sinSesionRegistrada) count++
  if (filtrosActivos.value.requiereAtencion) count++
  if (filtrosActivos.value.citasEstaSemana) count++
  if (filtrosActivos.value.bonosPorVencer) count++
  if (filtrosActivos.value.pagoPendiente) count++
  return count
})

const tieneAlgunFiltro = computed(() => {
  return hayFiltrosActivos.value || busqueda.value || estadoSeleccionado.value !== 'todos'
})

// Funciones de filtros
const toggleFiltro = (filtro) => {
  filtrosActivos.value[filtro] = !filtrosActivos.value[filtro]
}

const limpiarFiltrosAvanzados = () => {
  areaSeleccionada.value = ''
  filtrosActivos.value = {
    sinProximaCita: false,
    sinSesionRegistrada: false,
    requiereAtencion: false,
    citasEstaSemana: false,
    bonosPorVencer: false,
    pagoPendiente: false
  }
}

const limpiarTodosFiltros = () => {
  limpiarFiltrosAvanzados()
  estadoSeleccionado.value = 'todos'
  busqueda.value = ''
  busquedaDebounced.value = ''
}

// Cargar pacientes
const cargarPacientes = async () => {
  loading.value = true
  try {
    const userId = getUserId()
    if (!userId) {
      loading.value = false
      return
    }

    const { data: pacientesData, error: pacientesError } = await supabase
      .from('pacientes')
      .select(`
        id,
        created_at,
        activo,
        email,
        nombre_completo,
        telefono,
        area_de_acompanamiento,
        frecuencia,
        metadata
      `)
      .eq('terapeuta_id', userId)
      .order('created_at', { ascending: false })

    if (pacientesError) throw pacientesError

    const pacientesEnriquecidos = await Promise.all(
      pacientesData.map(async (paciente) => {
        const { data: ultimaCita } = await supabase
          .from('citas')
          .select('fecha_cita')
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')
          .order('fecha_cita', { ascending: false })
          .limit(1)
          .maybeSingle()

        const hoy = new Date().toISOString().split('T')[0]
        const { data: proximaCita, error: errorProxima } = await supabase
          .from('citas')
          .select('id, fecha_cita, hora_inicio, estado')
          .eq('paciente_id', paciente.id)
          .in('estado', ['pendiente', 'confirmada'])
          .gte('fecha_cita', hoy)
          .order('fecha_cita', { ascending: true })
          .order('hora_inicio', { ascending: true })
          .limit(1)
          .maybeSingle()

        // Debug: Log para ver próximas citas
        if (proximaCita) {
          console.log(`[Pacientes] ${paciente.nombre_completo}: Próxima cita ${proximaCita.fecha_cita} (${proximaCita.estado})`)
        } else if (errorProxima) {
          console.warn(`[Pacientes] Error buscando próxima cita para ${paciente.nombre_completo}:`, errorProxima)
        }

        const { count: totalSesiones } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')

        let bonoActivo = null
        try {
          const { data: bonoData } = await supabase
            .from('bonos')
            .select('id, tipo, estado, sesiones_totales, sesiones_restantes, fecha_fin, created_at')
            .eq('paciente_id', paciente.id)
            .in('estado', ['activo', 'pendiente'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          bonoActivo = bonoData
        } catch (error) {
          console.warn('[Bonos] Error:', error)
        }

        let sesionesCompletadasBono = 0
        let totalSesionesBono = 0
        if (bonoActivo) {
          totalSesionesBono = bonoActivo.sesiones_totales
          sesionesCompletadasBono = totalSesionesBono - bonoActivo.sesiones_restantes
        }

        const hace7Dias = new Date()
        hace7Dias.setDate(hace7Dias.getDate() - 7)

        // Variables de estado emocional con valores por defecto
        let estadoEmocionalPromedio = 3
        let requiereAtencion = false
        let evolucionPorcentaje = 50

        // Intentar cargar métricas de bienestar (tabla opcional, puede no existir)
        try {
          const { data: emocionesRecientes, error: metricasError } = await supabase
            .from('metricas_bienestar')
            .select('estado_animo, nivel_energia, nivel_estres')
            .eq('paciente_id', paciente.id)
            .gte('fecha', hace7Dias.toISOString())

          if (!metricasError && emocionesRecientes && emocionesRecientes.length > 0) {
            const promedioAnimo = emocionesRecientes.reduce((sum, e) => sum + e.estado_animo, 0) / emocionesRecientes.length
            estadoEmocionalPromedio = promedioAnimo
            evolucionPorcentaje = Math.round((promedioAnimo / 10) * 100)

            const ultimosTres = emocionesRecientes.slice(-3)
            if (ultimosTres.length >= 3) {
              requiereAtencion = ultimosTres.every(e => e.estado_animo <= 4)
            }
          }
        } catch (metricasErr) {
          // La tabla metricas_bienestar puede no existir o no tener datos
          // No bloquear la carga de pacientes por esto
          console.debug('[Pacientes] metricas_bienestar no disponible:', metricasErr?.message)
        }

        const nombreCompleto = paciente.nombre_completo ||
          paciente.metadata?.nombre_completo ||
          paciente.email

        return {
          id: paciente.id,
          nombre: nombreCompleto,
          email: paciente.email,
          telefono: paciente.telefono,
          activo: paciente.activo,
          en_pausa: paciente.metadata?.en_pausa || false,
          area_de_acompanamiento: paciente.area_de_acompanamiento,
          frecuencia: paciente.frecuencia,
          ultima_sesion: ultimaCita?.fecha_cita || null,
          proxima_sesion: proximaCita ? `${proximaCita.fecha_cita}T${proximaCita.hora_inicio}` : null,
          proxima_cita_id: proximaCita?.id || null,
          total_sesiones: totalSesiones || 0,
          estado_emocional_promedio: estadoEmocionalPromedio,
          evolucion_porcentaje: evolucionPorcentaje,
          requiere_atencion: requiereAtencion,
          created_at: paciente.created_at,
          bono_activo: bonoActivo ? {
            tipo: bonoActivo.tipo,
            estado: bonoActivo.estado,
            fecha_fin: bonoActivo.fecha_fin,
            sesiones_completadas: sesionesCompletadasBono,
            sesiones_totales: totalSesionesBono,
            sesiones_restantes: bonoActivo.sesiones_restantes
          } : null
        }
      })
    )

    pacientes.value = pacientesEnriquecidos
  } catch (error) {
    console.error('Error al cargar pacientes:', error)
    toast.error('Error al cargar los pacientes')
  } finally {
    loading.value = false
  }
}

// Helper: verificar si fecha está en esta semana
const estaEnEstaSemana = (fechaStr) => {
  if (!fechaStr) return false
  const fecha = new Date(fechaStr)
  const ahora = new Date()
  const inicioSemana = new Date(ahora)
  inicioSemana.setDate(ahora.getDate() - ahora.getDay())
  inicioSemana.setHours(0, 0, 0, 0)
  const finSemana = new Date(inicioSemana)
  finSemana.setDate(inicioSemana.getDate() + 7)
  return fecha >= inicioSemana && fecha < finSemana
}

// Helper: verificar si bono está por vencer (menos de 7 días o menos de 2 sesiones)
const bonoPorVencer = (paciente) => {
  if (!paciente.bono_activo) return false
  const bono = paciente.bono_activo
  // Por sesiones restantes
  if (bono.sesiones_restantes <= 2) return true
  // Por fecha de vencimiento
  if (bono.fecha_fin) {
    const fechaFin = new Date(bono.fecha_fin)
    const ahora = new Date()
    const diasRestantes = Math.floor((fechaFin - ahora) / (1000 * 60 * 60 * 24))
    if (diasRestantes <= 7) return true
  }
  return false
}

// Filtrar pacientes (sin paginación)
const pacientesFiltradosSinPaginar = computed(() => {
  let resultado = pacientes.value

  if (busqueda.value) {
    const busquedaLower = busqueda.value.toLowerCase()
    resultado = resultado.filter(p => {
      const nombre = (p.nombre || '').toLowerCase()
      const email = (p.email || '').toLowerCase()
      const telefono = (p.telefono || '').toLowerCase()
      // También buscar en estado del bono y próxima cita
      const proximaCita = (p.proxima_sesion || '').toLowerCase()
      return nombre.includes(busquedaLower) ||
        email.includes(busquedaLower) ||
        telefono.includes(busquedaLower) ||
        proximaCita.includes(busquedaLower)
    })
  }

  if (estadoSeleccionado.value !== 'todos') {
    resultado = resultado.filter(p => {
      if (estadoSeleccionado.value === 'activo') return p.activo && !p.en_pausa
      if (estadoSeleccionado.value === 'pausa') return p.activo && p.en_pausa
      if (estadoSeleccionado.value === 'finalizado') return !p.activo
      return true
    })
  }

  if (areaSeleccionada.value) {
    resultado = resultado.filter(p => p.area_de_acompanamiento === areaSeleccionada.value)
  }

  if (filtrosActivos.value.sinProximaCita) {
    resultado = resultado.filter(p => !p.proxima_sesion)
  }

  if (filtrosActivos.value.sinSesionRegistrada) {
    resultado = resultado.filter(p => !p.ultima_sesion)
  }

  if (filtrosActivos.value.requiereAtencion) {
    resultado = resultado.filter(p => p.requiere_atencion)
  }

  // Nuevos filtros
  if (filtrosActivos.value.citasEstaSemana) {
    resultado = resultado.filter(p => estaEnEstaSemana(p.proxima_sesion))
  }

  if (filtrosActivos.value.bonosPorVencer) {
    resultado = resultado.filter(p => bonoPorVencer(p))
  }

  if (filtrosActivos.value.pagoPendiente) {
    // Pacientes con bono no pagado completamente
    resultado = resultado.filter(p => {
      if (!p.bono_activo) return false
      return p.bono_activo.estado === 'pendiente'
    })
  }

  return resultado
})

// Paginación
const totalPaginas = computed(() => {
  return Math.ceil(pacientesFiltradosSinPaginar.value.length / elementosPorPagina.value)
})

const pacientesFiltrados = computed(() => {
  const inicio = (paginaActual.value - 1) * elementosPorPagina.value
  const fin = inicio + elementosPorPagina.value
  return pacientesFiltradosSinPaginar.value.slice(inicio, fin)
})

// Reset página cuando cambian filtros
watch([busqueda, estadoSeleccionado, areaSeleccionada, filtrosActivos], () => {
  paginaActual.value = 1
}, { deep: true })

const irAPagina = (pagina) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina
    // Scroll al top de la lista
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const totalPacientes = computed(() => pacientes.value.length)
const totalFiltrados = computed(() => pacientesFiltradosSinPaginar.value.length)

// Páginas visibles para paginación
const paginasVisibles = computed(() => {
  const paginas = []
  const inicio = Math.max(1, paginaActual.value - 2)
  const fin = Math.min(totalPaginas.value, paginaActual.value + 2)
  for (let i = inicio; i <= fin; i++) {
    paginas.push(i)
  }
  return paginas
})

// Navegación - con protección contra múltiples clics
let navegandoAPaciente = false

const irAFichaPaciente = (pacienteOrId) => {
  // Prevenir múltiples navegaciones simultáneas
  if (navegandoAPaciente) {
    console.debug('[Pacientes] Navegación ya en curso, ignorando clic duplicado')
    return
  }

  // Puede recibir el objeto paciente o directamente el ID
  const id = typeof pacienteOrId === 'object' ? pacienteOrId?.id : pacienteOrId
  console.log('[Pacientes] Navegando a ficha de paciente:', id)

  if (!id) {
    console.error('[Pacientes] ERROR: ID de paciente no válido:', pacienteOrId)
    return
  }

  // Marcar como navegando para evitar clics múltiples
  navegandoAPaciente = true

  // Usar navigateTo para mejor compatibilidad con Nuxt 3
  navigateTo(`/terapeuta/pacientes/${id}`).finally(() => {
    // Liberar el bloqueo después de un breve delay
    setTimeout(() => {
      navegandoAPaciente = false
    }, 500)
  })
}

// Gestión de modales
const abrirModalNuevoPaciente = () => { mostrarModalNuevo.value = true }
const cerrarModalNuevo = () => { mostrarModalNuevo.value = false }

const abrirModalEditar = (paciente) => {
  pacienteSeleccionado.value = paciente
  mostrarModalEditar.value = true
}
const cerrarModalEditar = () => {
  mostrarModalEditar.value = false
  pacienteSeleccionado.value = null
}

const abrirModalEliminar = (paciente) => {
  pacienteSeleccionado.value = paciente
  mostrarModalEliminar.value = true
}
const cerrarModalEliminar = () => {
  mostrarModalEliminar.value = false
  pacienteSeleccionado.value = null
}

const manejarPacienteCreado = async () => {
  await cargarPacientes()
  toast.success('Paciente creado')
}

const manejarPacienteActualizado = async () => {
  await cargarPacientes()
  toast.success('Paciente actualizado')
}

const manejarPacienteEliminado = async (pacienteId) => {
  pacientes.value = pacientes.value.filter(p => p.id !== pacienteId)
  toast.success('Paciente eliminado')
}

const manejarPacienteDesactivado = async () => {
  await cargarPacientes()
  toast.success('Paciente desactivado')
}

// Modal asignar cita
const abrirModalAsignarCita = (paciente) => {
  pacienteSeleccionadoCita.value = paciente
  mostrarModalAsignarCita.value = true
}
const cerrarModalAsignarCita = () => {
  mostrarModalAsignarCita.value = false
  pacienteSeleccionadoCita.value = null
}
const manejarCitaCreada = async () => {
  await cargarPacientes()
  cerrarModalAsignarCita()
  toast.success('Cita asignada')
}

// Ver citas y gestionar bonos
const verCitasPaciente = (paciente) => {
  console.log('[Pacientes] Navegando a agenda del paciente:', paciente.id)
  navigateTo(`/agenda?paciente=${paciente.id}`)
}
const gestionarBonosPaciente = (paciente) => {
  if (!paciente?.id) {
    console.error('[Pacientes] ERROR: ID de paciente no válido para gestionar bonos:', paciente)
    return
  }
  console.log('[Pacientes] Navegando a bonos del paciente:', paciente.id)
  navigateTo(`/terapeuta/pacientes/${paciente.id}/bonos`)
}

// Preview modal
const abrirPreview = (paciente) => {
  pacientePreview.value = paciente
  mostrarPreview.value = true
}
const cerrarPreview = () => {
  mostrarPreview.value = false
  pacientePreview.value = null
}

// Import/Export
const abrirModalImportar = () => { mostrarModalImportar.value = true }
const abrirModalExportar = () => { mostrarModalExportar.value = true }
const handleImportComplete = async () => {
  await cargarPacientes()
  toast.success('Importación completada')
}

const filtrosActualesParaExport = computed(() => {
  const filters = {}
  if (estadoSeleccionado.value !== 'todos') filters.estado = estadoSeleccionado.value
  if (areaSeleccionada.value) filters.area = areaSeleccionada.value
  return filters
})

// Modal editar cita
const abrirModalEditarCita = (citaId) => {
  citaIdSeleccionada.value = citaId
  mostrarModalEditarCita.value = true
}
const cerrarModalEditarCita = () => {
  mostrarModalEditarCita.value = false
  citaIdSeleccionada.value = null
}
const handleCitaActualizada = async () => {
  await cargarPacientes()
  cerrarModalEditarCita()
  toast.success('Cita actualizada')
}

// === MÉTRICAS DE PACIENTES Y CHURN ===

// Obtener fechas de inicio/fin según período
const getFechasPeriodo = (periodo) => {
  const ahora = new Date()
  const fin = new Date(ahora)
  const inicio = new Date(ahora)

  if (periodo === 'semana') {
    inicio.setDate(ahora.getDate() - 7)
  } else if (periodo === 'mes') {
    inicio.setMonth(ahora.getMonth() - 1)
  } else {
    inicio.setMonth(ahora.getMonth() - 3)
  }

  return { inicio, fin }
}

// Métricas principales de pacientes
const metricasPacientes = computed(() => {
  const { inicio, fin } = getFechasPeriodo(periodoResumen.value)
  const inicioAnterior = new Date(inicio)
  if (periodoResumen.value === 'semana') {
    inicioAnterior.setDate(inicioAnterior.getDate() - 7)
  } else if (periodoResumen.value === 'mes') {
    inicioAnterior.setMonth(inicioAnterior.getMonth() - 1)
  } else {
    inicioAnterior.setMonth(inicioAnterior.getMonth() - 3)
  }

  const todos = pacientes.value
  const total = todos.length
  const activos = todos.filter(p => p.activo && !p.en_pausa).length
  const finalizados = todos.filter(p => !p.activo).length
  const enPausa = todos.filter(p => p.activo && p.en_pausa).length

  // Nuevos en el período
  const nuevos = todos.filter(p => {
    const createdAt = new Date(p.created_at)
    return createdAt >= inicio && createdAt <= fin
  }).length

  // Nuevos en período anterior (para tendencia)
  const nuevosAnterior = todos.filter(p => {
    const createdAt = new Date(p.created_at)
    return createdAt >= inicioAnterior && createdAt < inicio
  }).length

  const tendenciaNuevos = nuevosAnterior > 0
    ? Math.round(((nuevos - nuevosAnterior) / nuevosAnterior) * 100)
    : (nuevos > 0 ? 100 : 0)

  // Churn: pacientes que pasaron a finalizado en el período
  // Como no tenemos fecha de finalización explícita, usamos una heurística:
  // Pacientes finalizados cuya última sesión fue hace más de 30 días
  const hace30Dias = new Date()
  hace30Dias.setDate(hace30Dias.getDate() - 30)

  const pacientesChurn = todos.filter(p => {
    if (p.activo) return false // Solo finalizados
    // Si tiene última sesión, verificamos que sea reciente (en el período)
    if (p.ultima_sesion) {
      const ultimaSesion = new Date(p.ultima_sesion)
      return ultimaSesion >= inicio && ultimaSesion <= fin
    }
    return false
  }).length

  // Tasa de churn = pacientes que abandonaron / total activos al inicio del período
  const activosInicioPeriodo = activos + pacientesChurn
  const churn = activosInicioPeriodo > 0
    ? Math.round((pacientesChurn / activosInicioPeriodo) * 100)
    : 0

  // Retención = 100 - churn
  const retencion = 100 - churn

  // Promedio de sesiones por paciente activo
  const sesionesTotales = todos.reduce((sum, p) => sum + (p.total_sesiones || 0), 0)
  const promedioSesiones = activos > 0 ? (sesionesTotales / activos).toFixed(1) : '0'

  // Pacientes en riesgo (sin sesión en 30 días y sin cita programada)
  const pacientesEnRiesgo = todos.filter(p => {
    if (!p.activo || p.en_pausa) return false
    const sinCitaProxima = !p.proxima_sesion
    const ultimaSesionVieja = !p.ultima_sesion || new Date(p.ultima_sesion) < hace30Dias
    return sinCitaProxima && ultimaSesionVieja
  }).length

  // Sin cita programada (activos)
  const sinCitaProxima = todos.filter(p => p.activo && !p.en_pausa && !p.proxima_sesion).length

  // Bonos por vencer
  const bonosPorVencerCount = todos.filter(p => bonoPorVencer(p)).length

  return {
    total,
    activos,
    finalizados,
    enPausa,
    nuevos,
    tendenciaNuevos,
    churn,
    retencion,
    promedioSesiones,
    pacientesEnRiesgo,
    sinCitaProxima,
    bonosPorVencer: bonosPorVencerCount
  }
})

// Datos para gráfico de evolución de pacientes
const chartDataEvolucion = computed(() => {
  const { inicio } = getFechasPeriodo(periodoResumen.value)
  const labels = []
  const dataNuevos = []
  const dataActivos = []

  const numPuntos = periodoResumen.value === 'semana' ? 7 :
                   periodoResumen.value === 'mes' ? 4 : 12

  const intervalo = periodoResumen.value === 'semana' ? 1 :
                   periodoResumen.value === 'mes' ? 7 : 7

  for (let i = 0; i < numPuntos; i++) {
    const fechaPunto = new Date(inicio)
    fechaPunto.setDate(fechaPunto.getDate() + (i * intervalo))

    if (periodoResumen.value === 'semana') {
      labels.push(fechaPunto.toLocaleDateString('es-ES', { weekday: 'short' }))
    } else {
      labels.push(fechaPunto.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }))
    }

    // Contar pacientes nuevos hasta esa fecha
    const nuevosHastaFecha = pacientes.value.filter(p => {
      const createdAt = new Date(p.created_at)
      return createdAt <= fechaPunto && createdAt >= inicio
    }).length

    // Activos acumulados
    const activosAcum = pacientes.value.filter(p => {
      const createdAt = new Date(p.created_at)
      return createdAt <= fechaPunto && p.activo
    }).length

    dataNuevos.push(nuevosHastaFecha)
    dataActivos.push(activosAcum)
  }

  return {
    labels,
    datasets: [
      {
        label: 'Nuevos',
        data: dataNuevos,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Activos',
        data: dataActivos,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }
})

const chartOptionsEvolucion = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 12, padding: 15 }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
}

// Datos para gráfico de distribución por estado
const chartDataDistribucion = computed(() => {
  const { activos, enPausa, finalizados } = metricasPacientes.value

  return {
    labels: ['Activos', 'En Pausa', 'Finalizados'],
    datasets: [{
      data: [activos, enPausa, finalizados],
      backgroundColor: [
        '#8B5CF6', // Purple para activos
        '#F59E0B', // Amber para pausa
        '#6B7280'  // Gray para finalizados
      ],
      borderWidth: 0
    }]
  }
})

const chartOptionsDistribucion = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 12, padding: 15 }
    }
  },
  cutout: '60%'
}

// Lifecycle
onMounted(async () => {
  try {
    await waitForUser()
    const userId = getUserId()
    if (userId) {
      await cargarPacientes()
    } else {
      loading.value = false
    }
  } catch (error) {
    console.error('Error en onMounted:', error)
    loading.value = false
  }
})

watch(() => getUserId(), (newUserId) => {
  if (newUserId && pacientes.value.length === 0) {
    cargarPacientes()
  }
})
</script>
