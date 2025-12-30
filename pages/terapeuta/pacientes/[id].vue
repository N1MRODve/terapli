<template>
  <div class="pb-20">
    <!-- Navegación de regreso -->
    <button
      @click="navigateTo('/terapeuta/pacientes')"
      class="mb-6 flex items-center gap-2 text-cafe hover:text-purple-600 transition-colors"
    >
      <span>←</span>
      <span>Volver a lista de pacientes</span>
    </button>

    <!-- Estado de carga -->
    <div v-if="cargando" class="text-center py-12">
      <div class="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-cafe/60">Cargando información del paciente...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <span class="text-6xl mb-4 block">❌</span>
        <h3 class="text-xl font-serif font-semibold text-cafe mb-2">
          No se pudo cargar la información
        </h3>
        <p class="text-cafe/60 mb-4">{{ error }}</p>
        <button
          @click="navigateTo('/terapeuta/pacientes')"
          class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors"
        >
          Volver a la lista
        </button>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-else-if="pacienteData">
      <!-- Encabezado del paciente -->
      <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 mb-6">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <!-- Info principal -->
          <div class="flex items-start gap-4">
            <!-- Avatar -->
            <div 
              class="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
              :style="{ backgroundColor: avatarColor }"
            >
              {{ iniciales }}
            </div>

            <!-- Datos -->
            <div>
              <h1 class="text-3xl font-serif font-bold text-cafe mb-2">
                {{ nombreCompleto }}
              </h1>
              <div class="flex flex-wrap items-center gap-3 mb-3">
                <span 
                  class="px-3 py-1 text-sm font-medium rounded-full"
                  :class="estadoClasses"
                >
                  {{ estadoTexto }}
                </span>
                <span class="text-cafe/60 text-sm flex items-center gap-1">
                  <span>📧</span>
                  <span>{{ pacienteData.email }}</span>
                </span>
              </div>
              <div class="space-y-1 text-sm">
                <div v-if="pacienteData.telefono" class="text-cafe/70 flex items-center gap-2">
                  <span>📱</span>
                  <span>{{ pacienteData.telefono }}</span>
                </div>
                <div v-if="pacienteData.area_de_acompanamiento" class="text-cafe/70 flex items-center gap-2">
                  <span>🎯</span>
                  <span><strong>Área:</strong> {{ pacienteData.area_de_acompanamiento }}</span>
                </div>
                <div v-if="pacienteData.tipo_bono" class="text-cafe/70 flex items-center gap-2">
                  <span>🎫</span>
                  <span><strong>Tipo de Bono:</strong> {{ tipoBono }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="flex flex-wrap gap-2">
            <button
              @click="irABonos"
              class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm flex items-center gap-2"
            >
              <span>🎫</span>
              <span>Gestionar Bonos</span>
            </button>
            <button
              @click="abrirWhatsApp"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </button>
            <button
              @click="agendarSesion"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors text-sm flex items-center gap-2"
            >
              <span>📅</span>
              <span>Agendar sesión</span>
            </button>
            <button
              @click="editarPaciente"
              class="px-4 py-2 bg-white border border-purple-600/30 text-purple-600 rounded-lg hover:bg-purple-600/5 transition-colors text-sm flex items-center gap-2"
            >
              <span>✏️</span>
              <span>Editar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Grid principal de información -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Resumen rápido -->
        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h2 class="font-serif text-xl font-semibold text-cafe flex items-center gap-2 mb-4">
            <span class="text-2xl">📊</span>
            Resumen
          </h2>

          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-base-bg rounded-lg">
              <span class="text-sm text-cafe/70">Total sesiones</span>
              <span class="font-bold text-cafe text-lg">{{ estadisticas.total }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span class="text-sm text-cafe/70">Completadas</span>
              <span class="font-bold text-green-600 text-lg">{{ estadisticas.completadas }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span class="text-sm text-cafe/70">Pendientes</span>
              <span class="font-bold text-yellow-600 text-lg">{{ estadisticas.pendientes }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span class="text-sm text-cafe/70">Próximas</span>
              <span class="font-bold text-blue-600 text-lg">{{ estadisticas.proximas }}</span>
            </div>
          </div>
        </div>

        <!-- Bono activo -->
        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h2 class="font-serif text-xl font-semibold text-cafe flex items-center gap-2 mb-4">
            <span class="text-2xl">🎫</span>
            Bono Contratado
          </h2>

          <div v-if="bonoActivo" class="space-y-4">
            <!-- Tipo de Bono -->
            <div class="p-3 bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-lg">
              <div class="text-xs text-purple-700 font-medium mb-1">Tipo de Bono</div>
              <div class="text-sm font-bold text-purple-900">
                {{ tipoBono }}
              </div>
            </div>

            <!-- Sesiones disponibles -->
            <div class="text-center p-4 bg-gradient-to-br from-purple-600/10 to-rosa/20 rounded-xl">
              <div class="text-4xl font-bold text-purple-600 mb-1">
                {{ bonoActivo.sesiones_disponibles }}
              </div>
              <div class="text-sm text-cafe/70">
                de {{ bonoActivo.sesiones_totales }} sesiones disponibles
              </div>
            </div>

            <!-- Progreso -->
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-cafe/70">Progreso</span>
                <span class="font-medium text-cafe">{{ bonoActivo.porcentaje_uso }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="h-2.5 rounded-full bg-gradient-to-r from-purple-600 to-rosa transition-all"
                  :style="{ width: `${bonoActivo.porcentaje_uso}%` }"
                ></div>
              </div>
            </div>

            <!-- Detalles del bono -->
            <div class="pt-3 border-t space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-cafe/70">Sesiones usadas:</span>
                <span class="font-medium text-cafe">{{ bonoActivo.sesiones_usadas }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-cafe/70">Monto total:</span>
                <span class="font-medium text-cafe">{{ formatearPrecio(bonoActivo.monto_total || bonoActivo.precio) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-cafe/70">Precio por sesión:</span>
                <span class="font-medium text-cafe">{{ formatearPrecio(bonoActivo.precio_por_sesion || (bonoActivo.monto_total || bonoActivo.precio) / bonoActivo.sesiones_totales) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-cafe/70">Estado:</span>
                <span class="font-medium capitalize" :class="{
                  'text-green-600': bonoActivo.estado === 'activo',
                  'text-yellow-600': bonoActivo.estado === 'pendiente',
                  'text-gray-600': bonoActivo.estado === 'vencido'
                }">
                  {{ bonoActivo.estado }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <span class="text-5xl mb-3 block opacity-40">🎫</span>
            <p class="text-sm text-cafe/50 mb-2">No hay bono activo</p>
            <p class="text-xs text-cafe/40 mb-4">
              Tipo de bono del paciente: <strong>{{ tipoBono || 'No definido' }}</strong>
            </p>
            <button 
              @click="irABonos"
              class="mt-2 text-sm text-purple-600 hover:text-cafe transition-colors font-medium"
            >
              Gestionar bonos →
            </button>
          </div>
        </div>

        <!-- Información del acompañamiento -->
        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h2 class="font-serif text-xl font-semibold text-cafe flex items-center gap-2 mb-4">
            <span class="text-2xl">📋</span>
            Datos del Proceso
          </h2>

          <div class="space-y-3">
            <div class="p-3 bg-base-bg rounded-lg">
              <div class="text-xs text-cafe/60 mb-1">Primera sesión</div>
              <div class="text-sm font-medium text-cafe">
                {{ formatearFecha(primeraSesion) || 'Sin registro' }}
              </div>
            </div>

            <div class="p-3 bg-base-bg rounded-lg">
              <div class="text-xs text-cafe/60 mb-1">Última sesión</div>
              <div class="text-sm font-medium text-cafe">
                {{ formatearFecha(ultimaSesion) || 'Sin registro' }}
              </div>
            </div>

            <div v-if="proximaSesion" class="p-4 bg-gradient-to-br from-purple-600/20 to-rosa/20 border-2 border-purple-600/40 rounded-lg">
              <div class="text-xs font-medium text-purple-600 mb-2 flex items-center gap-1">
                <span>📅</span>
                <span>Próxima sesión agendada</span>
              </div>
              <div class="text-base font-bold text-cafe mb-3">
                {{ formatearFechaCompleta(proximaSesion.fecha_cita, proximaSesion.hora_inicio) }}
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs px-3 py-1.5 bg-white border border-purple-600/30 rounded-full font-medium flex items-center gap-1">
                  {{ obtenerIconoModalidad(proximaSesion.modalidad) }}
                  {{ proximaSesion.modalidad }}
                </span>
                <span class="text-xs px-3 py-1.5 bg-white border border-purple-600/30 rounded-full capitalize font-medium" :class="{
                  'text-green-600 border-green-300': proximaSesion.estado === 'confirmada',
                  'text-yellow-600 border-yellow-300': proximaSesion.estado === 'pendiente',
                  'text-blue-600 border-blue-300': proximaSesion.estado === 'programada'
                }">
                  {{ proximaSesion.estado }}
                </span>
              </div>
              <div v-if="proximaSesion.notas" class="mt-3 pt-3 border-t border-purple-600/20">
                <div class="text-xs text-cafe/70 mb-1">Notas:</div>
                <div class="text-xs text-cafe">{{ proximaSesion.notas }}</div>
              </div>
            </div>

            <div v-else class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="text-center">
                <span class="text-3xl mb-2 block">⏰</span>
                <div class="text-sm font-medium text-yellow-800 mb-1">No hay sesión agendada</div>
                <div class="text-xs text-yellow-700">Recuerda agendar la próxima sesión</div>
                <button
                  @click="agendarSesion"
                  class="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors text-xs font-medium"
                >
                  Agendar ahora
                </button>
              </div>
            </div>

            <div class="p-3 bg-base-bg rounded-lg">
              <div class="text-xs text-cafe/60 mb-1">En proceso desde</div>
              <div class="text-sm font-medium text-cafe">
                {{ calcularTiempoProceso(pacienteData.created_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas y Deuda - Sección compacta -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Sesiones del año -->
        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-serif text-xl font-semibold text-cafe flex items-center gap-2">
              <span class="text-2xl">📊</span>
              Sesiones
            </h2>
            <select
              v-model="anioSeleccionadoSesiones"
              class="px-3 py-1.5 text-sm border border-purple-200 rounded-lg bg-white text-cafe focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">
                {{ anio }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-gradient-to-br from-purple-50 to-rosa/20 rounded-lg text-center">
              <div class="text-3xl font-bold text-purple-600">{{ estadisticasPorAnio.total }}</div>
              <div class="text-xs text-cafe/70">Total</div>
            </div>
            <div class="p-3 bg-red-50 rounded-lg text-center">
              <div class="text-3xl font-bold text-red-500">{{ estadisticasPorAnio.canceladas }}</div>
              <div class="text-xs text-cafe/70">Cancelaciones</div>
            </div>
            <div class="p-3 bg-yellow-50 rounded-lg text-center">
              <div class="text-2xl font-bold text-yellow-600">{{ estadisticasPorAnio.programadas }}</div>
              <div class="text-xs text-cafe/70">Programadas</div>
            </div>
            <div class="p-3 bg-green-50 rounded-lg text-center">
              <div class="text-2xl font-bold text-green-600">{{ estadisticasPorAnio.realizadas }}</div>
              <div class="text-xs text-cafe/70">Realizadas</div>
            </div>
          </div>
        </div>

        <!-- Deuda -->
        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-serif text-xl font-semibold text-cafe flex items-center gap-2">
              <span class="text-2xl">💳</span>
              Deuda
            </h2>
            <select
              v-model="anioSeleccionadoDeuda"
              class="px-3 py-1.5 text-sm border border-purple-200 rounded-lg bg-white text-cafe focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">
                {{ anio }}
              </option>
            </select>
          </div>

          <div class="p-6 rounded-xl text-center" :class="deudaPorAnio.haDeuda ? 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'">
            <div v-if="deudaPorAnio.haDeuda">
              <div class="text-4xl font-bold text-red-600 mb-2">{{ formatearPrecio(deudaPorAnio.totalPendiente) }}</div>
              <div class="text-sm text-red-700">Pendiente de cobro</div>
              <div class="text-xs text-red-500 mt-1">{{ deudaPorAnio.cantidadPendientes }} sesión(es) sin cobrar</div>
            </div>
            <div v-else>
              <div class="text-4xl mb-2">✅</div>
              <div class="text-lg font-semibold text-green-700">Sin deuda</div>
              <div class="text-sm text-green-600">Todos los pagos al día</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial de sesiones con tabla -->
      <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <h2 class="font-serif text-xl font-semibold text-cafe flex items-center gap-2">
            <span class="text-2xl">📋</span>
            Historial de Sesiones
          </h2>

          <!-- Filtros de fecha -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-2">
              <label class="text-sm text-cafe/70">Desde:</label>
              <input
                v-model="filtroFechaInicio"
                type="date"
                class="px-3 py-1.5 text-sm border border-purple-200 rounded-lg bg-white text-cafe focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div class="flex items-center gap-2">
              <label class="text-sm text-cafe/70">Hasta:</label>
              <input
                v-model="filtroFechaFin"
                type="date"
                class="px-3 py-1.5 text-sm border border-purple-200 rounded-lg bg-white text-cafe focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              v-if="filtroFechaInicio || filtroFechaFin"
              @click="filtroFechaInicio = ''; filtroFechaFin = ''"
              class="px-3 py-1.5 text-sm text-purple-600 hover:text-purple-800 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div v-if="historialSesionesFiltrado.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gradient-to-r from-purple-50 to-rosa/20 text-cafe">
                <th class="px-4 py-3 text-left font-semibold rounded-tl-lg">#</th>
                <th class="px-4 py-3 text-left font-semibold">Fecha</th>
                <th class="px-4 py-3 text-left font-semibold">Modalidad</th>
                <th class="px-4 py-3 text-left font-semibold">Estado</th>
                <th class="px-4 py-3 text-right font-semibold">Precio</th>
                <th class="px-4 py-3 text-left font-semibold rounded-tr-lg">Pago</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(sesion, index) in historialSesionesFiltrado"
                :key="sesion.id"
                class="border-b border-gray-100 hover:bg-rosa/10 transition-colors"
              >
                <td class="px-4 py-3 text-cafe/60">{{ historialSesionesFiltrado.length - index }}</td>
                <td class="px-4 py-3">
                  <div class="font-medium text-cafe">{{ formatearFecha(sesion.fecha_cita) }}</div>
                  <div class="text-xs text-cafe/60">{{ sesion.hora_inicio }} - {{ sesion.hora_fin }}</div>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full"
                    :class="obtenerEstiloModalidad(sesion.modalidad)"
                  >
                    {{ obtenerIconoModalidad(sesion.modalidad) }}
                    {{ sesion.modalidad }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="px-2 py-1 text-xs rounded-full capitalize"
                    :class="obtenerEstiloEstado(sesion.estado)"
                  >
                    {{ sesion.estado }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right font-medium text-cafe">
                  {{ formatearPrecio(sesion.precio_sesion || 0) }}
                </td>
                <td class="px-4 py-3">
                  <span
                    v-if="sesion.pagado"
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700"
                  >
                    ✓ Pagado
                  </span>
                  <span
                    v-else-if="sesion.estado === 'realizada'"
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700"
                  >
                    ⏳ Pendiente
                  </span>
                  <span
                    v-else
                    class="text-xs text-cafe/50"
                  >
                    -
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-12">
          <span class="text-5xl mb-3 block opacity-40">📋</span>
          <p class="text-cafe/60">No hay sesiones en el período seleccionado</p>
        </div>
      </div>

      <!-- Tabs de navegación -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 overflow-x-auto">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="tabActiva = tab.id"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              :class="tabActiva === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-cafe/60 hover:text-cafe hover:border-gray-300'"
            >
              <span class="mr-2">{{ tab.icono }}</span>
              <span>{{ tab.nombre }}</span>
              <span v-if="tab.badge" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-600 text-white">
                {{ tab.badge }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Contenido de tabs -->
      <div class="space-y-6">
        <!-- Tab: Próximas Sesiones -->
        <div v-if="tabActiva === 'proximas'">
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-serif font-semibold text-cafe">Próximas Sesiones Agendadas</h3>
              <button
                @click="agendarSesion"
                class="text-sm text-purple-600 hover:text-cafe transition-colors"
              >
                + Nueva sesión
              </button>
            </div>

            <div v-if="sesionesProximas.length > 0" class="space-y-3">
              <div
                v-for="sesion in sesionesProximas"
                :key="sesion.id"
                class="p-4 bg-base-bg rounded-lg hover:bg-rosa/20 transition-colors"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-lg font-semibold text-cafe">
                        {{ formatearFecha(sesion.fecha_cita) }}
                      </span>
                      <span class="text-base font-medium text-purple-600">
                        {{ sesion.hora_inicio }} - {{ sesion.hora_fin }}
                      </span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        class="px-2 py-0.5 text-xs rounded-full"
                        :class="obtenerEstiloModalidad(sesion.modalidad)"
                      >
                        {{ obtenerIconoModalidad(sesion.modalidad) }} {{ sesion.modalidad }}
                      </span>
                      <span
                        class="px-2 py-0.5 text-xs rounded-full capitalize"
                        :class="obtenerEstiloEstado(sesion.estado)"
                      >
                        {{ sesion.estado }}
                      </span>
                    </div>
                    <p v-if="sesion.observaciones" class="text-sm text-cafe/60 mt-2">
                      {{ sesion.observaciones }}
                    </p>
                  </div>
                  <button
                    @click="verDetallesCita(sesion.id)"
                    class="px-3 py-1.5 text-sm bg-white border border-purple-600/30 text-purple-600 hover:bg-purple-600 hover:text-white rounded-lg transition-colors"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <span class="text-6xl mb-3 block opacity-40">📅</span>
              <p class="text-cafe/60 mb-4">No hay sesiones próximas agendadas</p>
              <button
                @click="agendarSesion"
                class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors"
              >
                Agendar primera sesión
              </button>
            </div>
          </div>
        </div>

        <!-- Tab: Sesiones Completadas -->
        <div v-if="tabActiva === 'completadas'">
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 class="text-lg font-serif font-semibold text-cafe mb-4">Historial de Sesiones Completadas</h3>

            <div v-if="sesionesCompletadas.length > 0" class="space-y-3">
              <div
                v-for="sesion in sesionesCompletadas"
                :key="sesion.id"
                class="p-4 bg-base-bg rounded-lg hover:bg-rosa/20 transition-colors"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-base font-semibold text-cafe">
                        {{ formatearFecha(sesion.fecha_cita) }}
                      </span>
                      <span class="text-sm text-cafe/60">
                        {{ sesion.hora_inicio }} - {{ sesion.hora_fin }}
                      </span>
                      <span
                        class="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700"
                      >
                        ✓ Realizada
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mb-2">
                      <span
                        class="px-2 py-0.5 text-xs rounded-full"
                        :class="obtenerEstiloModalidad(sesion.modalidad)"
                      >
                        {{ obtenerIconoModalidad(sesion.modalidad) }} {{ sesion.modalidad }}
                      </span>
                    </div>
                    <p v-if="sesion.notas_terapeuta" class="text-sm text-cafe/70 mt-2 bg-white p-3 rounded-lg border border-gray-100">
                      <strong class="text-cafe">Notas:</strong> {{ sesion.notas_terapeuta }}
                    </p>
                    <p v-else-if="sesion.observaciones" class="text-sm text-cafe/60 mt-2">
                      {{ sesion.observaciones }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <span class="text-6xl mb-3 block opacity-40">📝</span>
              <p class="text-cafe/60">Aún no hay sesiones completadas</p>
            </div>
          </div>
        </div>

        <!-- Tab: Pendientes de Confirmar -->
        <div v-if="tabActiva === 'pendientes'">
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 class="text-lg font-serif font-semibold text-cafe mb-4">Sesiones Pendientes de Confirmación</h3>

            <div v-if="sesionesPendientes.length > 0" class="space-y-3">
              <div
                v-for="sesion in sesionesPendientes"
                :key="sesion.id"
                class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-lg">⏳</span>
                      <span class="text-base font-semibold text-cafe">
                        {{ formatearFecha(sesion.fecha_cita) }}
                      </span>
                      <span class="text-base font-medium text-purple-600">
                        {{ sesion.hora_inicio }} - {{ sesion.hora_fin }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mb-2">
                      <span
                        class="px-2 py-0.5 text-xs rounded-full"
                        :class="obtenerEstiloModalidad(sesion.modalidad)"
                      >
                        {{ obtenerIconoModalidad(sesion.modalidad) }} {{ sesion.modalidad }}
                      </span>
                      <span class="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
                        Pendiente de confirmar
                      </span>
                    </div>
                    <p v-if="sesion.observaciones" class="text-sm text-cafe/60 mt-2">
                      {{ sesion.observaciones }}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="confirmarCita(sesion.id)"
                      class="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      ✓ Confirmar
                    </button>
                    <button
                      @click="verDetallesCita(sesion.id)"
                      class="px-3 py-1.5 text-sm bg-white border border-purple-600/30 text-purple-600 hover:bg-purple-600 hover:text-white rounded-lg transition-colors"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <span class="text-6xl mb-3 block opacity-40">✅</span>
              <p class="text-cafe/60">No hay sesiones pendientes de confirmación</p>
            </div>
          </div>
        </div>

        <!-- Tab: Sesiones Anteriores -->
        <div v-if="tabActiva === 'anteriores'">
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 class="text-lg font-serif font-semibold text-cafe mb-4">
              Historial Completo de Sesiones
            </h3>

            <div v-if="todasLasSesiones.length > 0" class="space-y-3">
              <div
                v-for="sesion in todasLasSesiones"
                :key="sesion.id"
                class="p-4 bg-base-bg rounded-lg hover:bg-rosa/20 transition-colors"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-base font-semibold text-cafe">
                        {{ formatearFecha(sesion.fecha_cita) }}
                      </span>
                      <span class="text-sm text-cafe/60">
                        {{ sesion.hora_inicio }} - {{ sesion.hora_fin }}
                      </span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        class="px-2 py-0.5 text-xs rounded-full"
                        :class="obtenerEstiloModalidad(sesion.modalidad)"
                      >
                        {{ obtenerIconoModalidad(sesion.modalidad) }} {{ sesion.modalidad }}
                      </span>
                      <span
                        class="px-2 py-0.5 text-xs rounded-full capitalize"
                        :class="obtenerEstiloEstado(sesion.estado)"
                      >
                        {{ sesion.estado }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <span class="text-6xl mb-3 block opacity-40">📚</span>
              <p class="text-cafe/60">No hay sesiones registradas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Notas del terapeuta -->
      <div class="mt-6">
        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h2 class="font-serif text-xl font-semibold text-cafe flex items-center gap-2 mb-4">
            <span class="text-2xl">📝</span>
            Notas Clínicas Privadas
          </h2>
          
          <NotasPrivadas
            :paciente-id="pacienteId"
            :contenido="notasClinicas"
            :ultima-actualizacion="notasActualizacion || undefined"
            @guardar="guardarNotas"
          />
        </div>
      </div>
    </div>

    <!-- Modal de Nueva Cita -->
    <ModalNuevaCita
      :mostrar="modalCitaAbierto"
      :paciente-preseleccionado="pacienteParaCita"
      @cerrar="cerrarModalCita"
      @cita-creada="onCitaCreada"
    />

    <!-- Modal de Detalles de Cita -->
    <ModalDetallesCita
      :is-open="modalDetallesAbierto"
      :cita-id="citaSeleccionada"
      @close="cerrarModalDetalles"
    />
  </div>
</template>

<script setup lang="ts">
import { useCitas } from '~/composables/useCitas'

definePageMeta({
  layout: 'terapeuta'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Composables
const { getCitas } = useCitas()

// Variables de navegación
const route = useRoute()
const router = useRouter()

// ID del paciente desde la ruta
const pacienteId = computed(() => {
  return route.params.id as string || ''
})

// Estado
const cargando = ref(true)
const error = ref<string | null>(null)
const pacienteData = ref<any>(null)
const bonoActivo = ref<any>(null)
const todasLasCitas = ref<any[]>([])
const notasClinicas = ref('')
const notasActualizacion = ref<string | null>(null)
const pagos = ref<any[]>([])

// Filtros de año para estadísticas y deuda
const anioActual = new Date().getFullYear()
const anioSeleccionadoSesiones = ref(anioActual)
const anioSeleccionadoDeuda = ref(anioActual)

// Filtros de fecha para historial
const filtroFechaInicio = ref('')
const filtroFechaFin = ref('')

// Lista de años disponibles (últimos 5 años)
const aniosDisponibles = computed(() => {
  const anios = []
  for (let i = anioActual; i >= anioActual - 4; i--) {
    anios.push(i)
  }
  return anios
})

// Tab activa
const tabActiva = ref('proximas')

// Modals
const modalCitaAbierto = ref(false)
const pacienteParaCita = ref<any>(null)
const modalDetallesAbierto = ref(false)
const citaSeleccionada = ref<string | null>(null)

// Tabs
const tabs = computed(() => [
  { 
    id: 'proximas', 
    nombre: 'Próximas Sesiones', 
    icono: '📅',
    badge: estadisticas.value.proximas || null
  },
  { 
    id: 'completadas', 
    nombre: 'Completadas', 
    icono: '✅',
    badge: estadisticas.value.completadas || null
  },
  { 
    id: 'pendientes', 
    nombre: 'Pendientes', 
    icono: '⏳',
    badge: estadisticas.value.pendientes || null
  },
  { 
    id: 'anteriores', 
    nombre: 'Historial', 
    icono: '📚',
    badge: null
  }
])

// Cargar datos del paciente
const cargarDatosPaciente = async () => {
  cargando.value = true
  error.value = null

  try {
    if (!user.value) {
      error.value = 'Usuario no autenticado'
      return
    }

    // Obtener datos del paciente
    const { data: paciente, error: errorPaciente } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', pacienteId.value)
      .single()

    if (errorPaciente) throw errorPaciente

    // Mapear datos - el campo es nombre_completo en la BD
    const nombreCompleto = (paciente as any).nombre_completo || (paciente as any).email || 'Sin nombre'
    pacienteData.value = {
      ...paciente,
      nombre_completo: nombreCompleto,
      email: (paciente as any).email || '',
      telefono: (paciente as any).telefono || ''
    }

    // Cargar citas
    const citas = await getCitas()
    todasLasCitas.value = citas.filter((c: any) => c.paciente_id === pacienteId.value)

    // Cargar bono activo
    await cargarBonoActivo()

    // Cargar pagos
    await cargarPagos()

    // Cargar notas
    await cargarNotas()

  } catch (err: any) {
    console.error('Error al cargar paciente:', err)
    error.value = err.message || 'Error desconocido'
  } finally {
    cargando.value = false
  }
}

// Cargar bono activo
const cargarBonoActivo = async () => {
  try {
    // Buscar bono activo o pendiente con sesiones disponibles
    const { data: bono, error: bonoError } = await supabase
      .from('bonos')
      .select('*')
      .eq('paciente_id', pacienteId.value)
      .in('estado', ['activo', 'pendiente'])
      .gt('sesiones_restantes', 0)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (bonoError) {
      console.warn('[Bonos] Error en consulta:', bonoError.message)
      return
    }

    if (bono) {
      // Usar sesiones_restantes de la BD (no sesiones_usadas)
      const sesionesTotales = bono.sesiones_totales || 0
      const sesionesRestantes = bono.sesiones_restantes || 0
      const sesionesUsadas = sesionesTotales - sesionesRestantes

      bonoActivo.value = {
        ...bono,
        sesiones_usadas: sesionesUsadas,
        sesiones_disponibles: sesionesRestantes,
        porcentaje_uso: sesionesTotales > 0 ? Math.round((sesionesUsadas / sesionesTotales) * 100) : 0
      }

      console.info(`[Bonos] Bono activo cargado para paciente: ${bono.tipo} (${sesionesRestantes}/${sesionesTotales} disponibles)`)
    } else {
      bonoActivo.value = null
      console.info('[Bonos] No se encontró bono activo para este paciente')
    }
  } catch (err) {
    console.warn('[Bonos] Error inesperado:', err)
  }
}

// Cargar pagos del paciente
const cargarPagos = async () => {
  try {
    const { data, error: pagoError } = await supabase
      .from('pagos')
      .select('*')
      .eq('paciente_id', pacienteId.value)
      .order('created_at', { ascending: false })

    if (pagoError) {
      console.warn('[Pagos] Error al cargar:', pagoError.message)
      return
    }

    pagos.value = data || []
    console.info(`[Pagos] Cargados ${pagos.value.length} pagos para el paciente`)
  } catch (err) {
    console.warn('[Pagos] Error inesperado:', err)
  }
}

// Cargar notas
const cargarNotas = async () => {
  try {
    const { data } = await (supabase as any)
      .from('notas_terapeuticas')
      .select('contenido, updated_at')
      .eq('paciente_id', pacienteId.value)
      .eq('terapeuta_id', user.value?.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      notasClinicas.value = data.contenido || ''
      notasActualizacion.value = data.updated_at
    }
  } catch (err) {
    console.error('Error al cargar notas:', err)
  }
}

// Guardar notas
const guardarNotas = async ({ pacienteId, contenido }: { pacienteId: string, contenido: string }) => {
  try {
    const { data: existing } = await (supabase as any)
      .from('notas_terapeuticas')
      .select('id')
      .eq('paciente_id', pacienteId)
      .eq('terapeuta_id', user.value?.id)
      .maybeSingle()

    if (existing) {
      await (supabase as any)
        .from('notas_terapeuticas')
        .update({ contenido, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      await (supabase as any)
        .from('notas_terapeuticas')
        .insert({
          paciente_id: pacienteId,
          terapeuta_id: user.value?.id,
          contenido
        })
    }

    notasClinicas.value = contenido
    notasActualizacion.value = new Date().toISOString()
  } catch (err) {
    console.error('Error al guardar notas:', err)
    throw err
  }
}

// Computed: Sesiones filtradas
const sesionesProximas = computed(() => {
  const hoy = new Date()
  return todasLasCitas.value
    .filter((c: any) => 
      ['pendiente', 'confirmada'].includes(c.estado) &&
      new Date(c.fecha_cita) >= hoy
    )
    .sort((a: any, b: any) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime())
})

const sesionesCompletadas = computed(() => {
  return todasLasCitas.value
    .filter((c: any) => c.estado === 'realizada')
    .sort((a: any, b: any) => new Date(b.fecha_cita).getTime() - new Date(a.fecha_cita).getTime())
})

const sesionesPendientes = computed(() => {
  return todasLasCitas.value
    .filter((c: any) => c.estado === 'pendiente')
    .sort((a: any, b: any) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime())
})

const todasLasSesiones = computed(() => {
  return todasLasCitas.value
    .sort((a: any, b: any) => new Date(b.fecha_cita).getTime() - new Date(a.fecha_cita).getTime())
})

const estadisticas = computed(() => ({
  total: todasLasCitas.value.length,
  completadas: sesionesCompletadas.value.length,
  pendientes: sesionesPendientes.value.length,
  proximas: sesionesProximas.value.length
}))

// Estadísticas filtradas por año seleccionado
const estadisticasPorAnio = computed(() => {
  const anio = anioSeleccionadoSesiones.value
  const citasAnio = todasLasCitas.value.filter((c: any) => {
    const fechaCita = new Date(c.fecha_cita)
    return fechaCita.getFullYear() === anio
  })

  const total = citasAnio.length
  const realizadas = citasAnio.filter((c: any) => c.estado === 'realizada').length
  const canceladas = citasAnio.filter((c: any) => c.estado === 'cancelada').length
  const programadas = citasAnio.filter((c: any) => ['pendiente', 'confirmada'].includes(c.estado)).length

  return {
    total,
    realizadas,
    canceladas,
    programadas
  }
})

// Deuda pendiente filtrada por año
const deudaPorAnio = computed(() => {
  const anio = anioSeleccionadoDeuda.value

  // Filtrar pagos del año seleccionado
  const pagosPendientes = pagos.value.filter((p: any) => {
    const fechaPago = new Date(p.created_at || p.fecha)
    return fechaPago.getFullYear() === anio && p.estado === 'pendiente'
  })

  // También considerar citas realizadas sin pago registrado
  const citasSinPago = todasLasCitas.value.filter((c: any) => {
    const fechaCita = new Date(c.fecha_cita)
    return fechaCita.getFullYear() === anio &&
           c.estado === 'realizada' &&
           !c.pagado
  })

  const montoPendientePagos = pagosPendientes.reduce((acc: number, p: any) => acc + (p.monto || 0), 0)
  const montoCitasSinPago = citasSinPago.reduce((acc: number, c: any) => acc + (c.precio_sesion || 0), 0)

  return {
    totalPendiente: montoPendientePagos + montoCitasSinPago,
    cantidadPendientes: pagosPendientes.length + citasSinPago.length,
    haDeuda: (montoPendientePagos + montoCitasSinPago) > 0
  }
})

// Historial de sesiones filtrado
const historialSesionesFiltrado = computed(() => {
  let sesiones = [...todasLasCitas.value]

  // Aplicar filtro de fecha inicio
  if (filtroFechaInicio.value) {
    const fechaInicio = new Date(filtroFechaInicio.value)
    sesiones = sesiones.filter((s: any) => new Date(s.fecha_cita) >= fechaInicio)
  }

  // Aplicar filtro de fecha fin
  if (filtroFechaFin.value) {
    const fechaFin = new Date(filtroFechaFin.value)
    sesiones = sesiones.filter((s: any) => new Date(s.fecha_cita) <= fechaFin)
  }

  // Ordenar por fecha descendente
  return sesiones.sort((a: any, b: any) =>
    new Date(b.fecha_cita).getTime() - new Date(a.fecha_cita).getTime()
  )
})

const primeraSesion = computed(() => {
  const completadas = sesionesCompletadas.value
  return completadas.length > 0 ? completadas[completadas.length - 1].fecha_cita : null
})

const ultimaSesion = computed(() => {
  const completadas = sesionesCompletadas.value
  return completadas.length > 0 ? completadas[0].fecha_cita : null
})

const proximaSesion = computed(() => {
  return sesionesProximas.value.length > 0 ? sesionesProximas.value[0] : null
})

// Computed: Información visual
const nombreCompleto = computed(() => pacienteData.value?.nombre_completo || 'Sin nombre')

const iniciales = computed(() => {
  if (!nombreCompleto.value) return '?'
  const partes = nombreCompleto.value.split(' ')
  if (partes.length >= 2 && partes[0] && partes[1]) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
  }
  return nombreCompleto.value.substring(0, 2).toUpperCase()
})

const avatarColor = computed(() => {
  const colors = ['#D8AFA0', '#C89B8A', '#B7C6B0', '#A8C5B5', '#D4A5A5', '#C4B5A0']
  const index = pacienteId.value.charCodeAt(0) % colors.length
  return colors[index]
})

const estadoTexto = computed(() => {
  if (!pacienteData.value) return ''
  if (!pacienteData.value.activo) return 'Finalizado'
  if (pacienteData.value.metadata?.en_pausa) return 'En pausa'
  return 'En proceso'
})

const estadoClasses = computed(() => {
  if (!pacienteData.value) return ''
  if (!pacienteData.value.activo) return 'bg-gray-100 text-gray-600'
  if (pacienteData.value.metadata?.en_pausa) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
})

const tipoBono = computed(() => {
  if (!pacienteData.value?.tipo_bono) return ''
  
  const nombres: Record<string, string> = {
    'a_demanda': 'A Demanda (1 sesión)',
    'quincenal': 'Quincenal (2 sesiones/mes)',
    'semanal': 'Semanal (4 sesiones/mes)'
  }
  
  return nombres[pacienteData.value.tipo_bono] || pacienteData.value.tipo_bono
})

// Funciones de formato
const formatearFecha = (fecha: string) => {
  if (!fecha) return ''
  try {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short',
      year: 'numeric' 
    })
  } catch {
    return fecha
  }
}

const formatearFechaCompleta = (fecha: string, hora?: string) => {
  if (!fecha) return ''
  try {
    const date = new Date(fecha + 'T' + (hora || '00:00:00'))
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return fecha
  }
}

const formatearPrecio = (precio: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(precio || 0)
}

const calcularTiempoProceso = (fechaInicio: string) => {
  if (!fechaInicio) return ''
  const inicio = new Date(fechaInicio)
  const ahora = new Date()
  const dias = Math.floor((ahora.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  
  if (dias < 30) return `${dias} días`
  if (dias < 365) return `${Math.floor(dias / 30)} meses`
  return `${Math.floor(dias / 365)} años`
}

const obtenerIconoModalidad = (modalidad: string) => {
  const iconos: Record<string, string> = {
    'presencial': '🏥',
    'online': '💻',
    'telefonica': '📞'
  }
  return iconos[modalidad] || '📋'
}

const obtenerEstiloModalidad = (modalidad: string) => {
  const estilos: Record<string, string> = {
    'presencial': 'bg-green-100 text-green-700',
    'online': 'bg-purple-600/20 text-purple-600',
    'telefonica': 'bg-blue-100 text-blue-700'
  }
  return estilos[modalidad] || 'bg-gray-100 text-gray-700'
}

const obtenerEstiloEstado = (estado: string) => {
  const estilos: Record<string, string> = {
    'pendiente': 'bg-yellow-100 text-yellow-700',
    'confirmada': 'bg-green-100 text-green-700',
    'realizada': 'bg-blue-100 text-blue-700',
    'cancelada': 'bg-red-100 text-red-700'
  }
  return estilos[estado] || 'bg-gray-100 text-gray-700'
}

// Acciones
const irABonos = () => {
  if (!pacienteId.value) {
    console.error('[Paciente/[id]] ERROR: ID de paciente no válido')
    return
  }
  console.log('[Paciente/[id]] Navegando a bonos del paciente:', pacienteId.value)
  navigateTo(`/terapeuta/pacientes/${pacienteId.value}/bonos`)
}

const abrirWhatsApp = () => {
  const telefono = pacienteData.value?.telefono
  if (!telefono) {
    alert('Este paciente no tiene teléfono registrado')
    return
  }

  // Limpiar el número (quitar espacios, guiones, etc)
  const numeroLimpio = telefono.replace(/\D/g, '')
  
  // Mensaje predeterminado
  const mensaje = encodeURIComponent(`Hola ${nombreCompleto.value}, ¿cómo estás?`)
  
  // Abrir WhatsApp (funciona en móvil y desktop)
  const url = `https://wa.me/${numeroLimpio}?text=${mensaje}`
  window.open(url, '_blank')
}

const agendarSesion = () => {
  if (!pacienteData.value) return
  
  pacienteParaCita.value = {
    id: pacienteData.value.id,
    nombre: nombreCompleto.value,
    email: pacienteData.value.email,
    telefono: pacienteData.value.telefono,
    frecuencia: pacienteData.value.frecuencia || 'semanal',
    area_acompanamiento: pacienteData.value.area_de_acompanamiento
  }
  
  modalCitaAbierto.value = true
}

const cerrarModalCita = () => {
  modalCitaAbierto.value = false
  pacienteParaCita.value = null
}

const onCitaCreada = () => {
  cargarDatosPaciente()
}

const verDetallesCita = (citaId: string) => {
  citaSeleccionada.value = citaId
  modalDetallesAbierto.value = true
}

const cerrarModalDetalles = () => {
  modalDetallesAbierto.value = false
  citaSeleccionada.value = null
}

const confirmarCita = async (citaId: string) => {
  try {
    // Llamar a la función RPC que confirma la cita y descuenta del bono
    const { data, error } = await (supabase as any)
      .rpc('confirmar_cita_y_descontar_bono', {
        p_cita_id: citaId
      })

    if (error) throw error

    // Verificar el resultado
    if (!data.success) {
      console.error('Error en la confirmación:', data.error)
      alert(data.error || 'Error al confirmar la cita')
      return
    }

    // Mostrar mensaje informativo
    let mensaje = `Cita confirmada con ${data.paciente_nombre || 'paciente'}`
    
    if (data.bono_id) {
      mensaje += `\nSesiones restantes en bono: ${data.sesiones_restantes}`
      
      if (data.bono_agotado) {
        mensaje += '\n⚠️ BONO AGOTADO'
      } else if (data.sesiones_restantes <= 2) {
        mensaje += '\n⚠️ Pocas sesiones restantes'
      }
    }
    
    alert(mensaje)

    // Recargar datos
    await cargarDatosPaciente()
  } catch (err) {
    console.error('Error al confirmar cita:', err)
    alert('Error al confirmar la cita: ' + (err as Error).message)
  }
}

const editarPaciente = () => {
  // TODO: Implementar
  alert('Función de editar en desarrollo')
}

// Lifecycle
onMounted(() => {
  cargarDatosPaciente()
})

watch(() => route.params.id, () => {
  if (route.params.id) {
    cargarDatosPaciente()
  }
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
