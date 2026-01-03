<template>
  <div class="pb-20">
    <!-- Breadcrumb de navegación -->
    <nav class="mb-6" aria-label="Breadcrumb">
      <ol class="flex items-center gap-2 text-sm">
        <li>
          <NuxtLink
            to="/terapeuta/pacientes"
            class="text-gray-500 hover:text-purple-600 transition-colors flex items-center gap-1"
          >
            <UserGroupIcon class="w-4 h-4" />
            Pacientes
          </NuxtLink>
        </li>
        <li class="text-gray-400">
          <ChevronRightIcon class="w-4 h-4" />
        </li>
        <li class="font-medium text-gray-900" aria-current="page">
          {{ nombreCompleto || 'Cargando...' }}
        </li>
      </ol>
    </nav>

    <!-- Estado de carga -->
    <div v-if="cargando" class="flex flex-col items-center justify-center py-20">
      <div class="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-sm text-gray-500">Cargando información del paciente...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16">
      <div class="bg-white rounded-xl p-8 shadow-sm max-w-md mx-auto">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExclamationTriangleIcon class="w-8 h-8 text-red-600" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No se pudo cargar la información</h3>
        <p class="text-sm text-gray-500 mb-6">{{ error }}</p>
        <button
          @click="navigateTo('/terapeuta/pacientes')"
          class="px-6 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Volver a la lista
        </button>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-else-if="pacienteData">
      <!-- ============================================ -->
      <!-- CABECERA DEL PACIENTE -->
      <!-- ============================================ -->
      <header class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <!-- Info principal -->
          <div class="flex items-start gap-4">
            <!-- Avatar -->
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 ring-4 ring-white shadow-md"
              :style="{ backgroundColor: avatarColor }"
            >
              {{ iniciales }}
            </div>

            <!-- Datos -->
            <div class="min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <h1 class="text-2xl font-semibold text-gray-900 truncate">
                  {{ nombreCompleto }}
                </h1>
                <span
                  class="px-2.5 py-1 text-xs font-semibold rounded-full flex-shrink-0"
                  :class="estadoClasses"
                >
                  {{ estadoTexto }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span v-if="pacienteData.email" class="flex items-center gap-1.5">
                  <EnvelopeIcon class="w-4 h-4" />
                  {{ pacienteData.email }}
                </span>
                <span v-if="pacienteData.telefono" class="flex items-center gap-1.5">
                  <PhoneIcon class="w-4 h-4" />
                  {{ pacienteData.telefono }}
                </span>
              </div>

              <!-- Tiempo en proceso -->
              <div class="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span class="flex items-center gap-1">
                  <CalendarIcon class="w-3.5 h-3.5" />
                  Inicio: {{ formatearFecha(pacienteData.created_at?.split('T')[0]) }}
                </span>
                <span class="flex items-center gap-1">
                  <ClockIcon class="w-3.5 h-3.5" />
                  {{ calcularTiempoProceso(pacienteData.created_at) }} en proceso
                </span>
              </div>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-if="pacienteData.telefono"
              @click="abrirWhatsApp"
              class="p-2.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Enviar WhatsApp"
            >
              <ChatBubbleLeftIcon class="w-5 h-5" />
            </button>
            <button
              v-if="pacienteData.email"
              @click="enviarEmail"
              class="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Enviar Email"
            >
              <EnvelopeIcon class="w-5 h-5" />
            </button>
            <button
              @click="editarPaciente"
              class="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5"
            >
              <PencilIcon class="w-4 h-4" />
              <span>Editar</span>
            </button>
            <button
              @click="agendarSesion"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-1.5 shadow-sm"
            >
              <PlusIcon class="w-4 h-4" />
              <span>Nueva Cita</span>
            </button>
          </div>
        </div>
      </header>

      <!-- ============================================ -->
      <!-- LAYOUT DE 2 COLUMNAS -->
      <!-- ============================================ -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- ============================================ -->
        <!-- COLUMNA IZQUIERDA (2/3) -->
        <!-- ============================================ -->
        <div class="lg:col-span-2 space-y-6">
          <!-- RESUMEN DEL CASO -->
          <section class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardDocumentListIcon class="w-5 h-5 text-purple-600" />
                Resumen del Caso
              </h2>
              <button
                @click="mostrarModalEditarCaso = true"
                class="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Editar
              </button>
            </div>

            <div class="space-y-4">
              <!-- Motivo de consulta -->
              <div>
                <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Motivo de consulta</label>
                <p class="mt-1 text-sm text-gray-700">
                  {{ pacienteData.metadata?.motivo_consulta || 'No especificado' }}
                </p>
              </div>

              <!-- Objetivo principal -->
              <div>
                <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Objetivo principal</label>
                <p class="mt-1 text-sm text-gray-700">
                  {{ pacienteData.metadata?.objetivo_principal || 'No especificado' }}
                </p>
              </div>

              <!-- Etiquetas rápidas -->
              <div class="flex flex-wrap gap-2 pt-2">
                <span
                  v-if="pacienteData.area_de_acompanamiento"
                  class="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full"
                >
                  {{ pacienteData.area_de_acompanamiento }}
                </span>
                <span
                  v-if="pacienteData.frecuencia"
                  class="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                >
                  {{ formatearFrecuencia(pacienteData.frecuencia) }}
                </span>
                <span
                  v-if="pacienteData.metadata?.modalidad_preferida"
                  class="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1"
                >
                  {{ obtenerIconoModalidad(pacienteData.metadata?.modalidad_preferida) }}
                  {{ pacienteData.metadata?.modalidad_preferida }}
                </span>
              </div>
            </div>
          </section>

          <!-- AGENDA: PRÓXIMA SESIÓN + HISTORIAL -->
          <section class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CalendarDaysIcon class="w-5 h-5 text-purple-600" />
                Agenda
              </h2>
            </div>

            <!-- Próxima sesión -->
            <div class="p-6 border-b border-gray-100">
              <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Próxima sesión</h3>

              <div v-if="proximaSesion" class="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-lg font-semibold text-gray-900">
                        {{ formatearFechaCompleta(proximaSesion.fecha_cita, proximaSesion.hora_inicio) }}
                      </span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        class="px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1"
                        :class="obtenerEstiloModalidad(proximaSesion.modalidad)"
                      >
                        {{ obtenerIconoModalidad(proximaSesion.modalidad) }}
                        {{ proximaSesion.modalidad }}
                      </span>
                      <span
                        class="px-2 py-1 text-xs font-medium rounded-full capitalize"
                        :class="obtenerEstiloEstado(proximaSesion.estado)"
                      >
                        {{ proximaSesion.estado }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click="verDetallesCita(proximaSesion.id)"
                      class="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      Ver
                    </button>
                    <button
                      @click="reprogramarCita(proximaSesion.id)"
                      class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Reprogramar
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center">
                <CalendarIcon class="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p class="text-sm font-medium text-amber-800 mb-2">No hay próxima sesión agendada</p>
                <button
                  @click="agendarSesion"
                  class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Agendar próxima sesión
                </button>
              </div>
            </div>

            <!-- Historial de sesiones -->
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Historial de sesiones</h3>
                <!-- Filtro de fechas -->
                <div class="flex items-center gap-2">
                  <input
                    v-model="filtroFechaInicio"
                    type="date"
                    class="px-2 py-1 text-xs border border-gray-200 rounded-lg"
                  />
                  <span class="text-gray-400">-</span>
                  <input
                    v-model="filtroFechaFin"
                    type="date"
                    class="px-2 py-1 text-xs border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <div v-if="historialSesionesFiltrado.length > 0" class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b">
                      <th class="pb-3 pr-4">Fecha</th>
                      <th class="pb-3 pr-4">Estado</th>
                      <th class="pb-3 pr-4">Tipo</th>
                      <th class="pb-3 pr-4">Pago</th>
                      <th class="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="sesion in historialSesionesFiltrado.slice(0, 10)"
                      :key="sesion.id"
                      class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td class="py-3 pr-4">
                        <div class="font-medium text-gray-900">{{ formatearFecha(sesion.fecha_cita) }}</div>
                        <div class="text-xs text-gray-500">{{ sesion.hora_inicio }} - {{ sesion.hora_fin }}</div>
                      </td>
                      <td class="py-3 pr-4">
                        <span
                          class="px-2 py-0.5 text-xs font-medium rounded-full capitalize"
                          :class="obtenerEstiloEstado(sesion.estado)"
                        >
                          {{ sesion.estado }}
                        </span>
                      </td>
                      <td class="py-3 pr-4">
                        <span class="text-xs text-gray-600">
                          {{ obtenerIconoModalidad(sesion.modalidad) }} {{ sesion.modalidad }}
                        </span>
                      </td>
                      <td class="py-3 pr-4">
                        <span
                          v-if="sesion.pagado || sesion.bono_id"
                          class="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700"
                        >
                          {{ sesion.bono_id ? 'Bono' : 'Pagado' }}
                        </span>
                        <span
                          v-else-if="sesion.estado === 'realizada'"
                          class="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700"
                        >
                          Pendiente
                        </span>
                        <span v-else class="text-xs text-gray-400">-</span>
                      </td>
                      <td class="py-3">
                        <button
                          @click="verDetallesCita(sesion.id)"
                          class="text-purple-600 hover:text-purple-700 text-xs font-medium"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <button
                  v-if="historialSesionesFiltrado.length > 10"
                  @click="verHistorialCompleto"
                  class="mt-4 w-full py-2 text-sm text-purple-600 hover:text-purple-700 font-medium text-center"
                >
                  Ver historial completo ({{ historialSesionesFiltrado.length }} sesiones)
                </button>
              </div>

              <div v-else class="text-center py-8">
                <CalendarIcon class="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p class="text-sm text-gray-500">No hay sesiones registradas</p>
              </div>
            </div>
          </section>
        </div>

        <!-- ============================================ -->
        <!-- COLUMNA DERECHA (1/3) -->
        <!-- ============================================ -->
        <div class="space-y-6">
          <!-- ESTADO ECONÓMICO -->
          <section class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <BanknotesIcon class="w-5 h-5 text-purple-600" />
              Estado Económico
            </h2>

            <!-- Indicador principal -->
            <div
              class="p-4 rounded-xl text-center mb-4"
              :class="balanceFinanciero.totalPendiente > 0
                ? 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-200'
                : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'"
            >
              <div v-if="balanceFinanciero.totalPendiente > 0">
                <p class="text-2xl font-bold text-red-600 mb-1">{{ formatearPrecio(balanceFinanciero.totalPendiente) }}</p>
                <p class="text-xs text-red-700">Pendiente de cobro</p>
              </div>
              <div v-else>
                <CheckCircleIcon class="w-8 h-8 text-green-500 mx-auto mb-1" />
                <p class="text-sm font-semibold text-green-700">Al día</p>
              </div>
            </div>

            <!-- Métricas -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="p-3 bg-gray-50 rounded-lg text-center">
                <p class="text-xl font-bold text-gray-900">{{ estadisticas.completadas }}</p>
                <p class="text-xs text-gray-500">Realizadas</p>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg text-center">
                <p class="text-xl font-bold text-gray-900">{{ estadisticas.pendientes }}</p>
                <p class="text-xs text-gray-500">Pendientes</p>
              </div>
            </div>

            <!-- Desglose deuda -->
            <div v-if="balanceFinanciero.totalPendiente > 0" class="space-y-2 text-sm">
              <div v-if="balanceFinanciero.bonosPendientes > 0" class="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                <span class="text-amber-800">Bonos sin pagar</span>
                <span class="font-semibold text-amber-700">{{ formatearPrecio(balanceFinanciero.montoBonosPendientes) }}</span>
              </div>
              <div v-if="balanceFinanciero.sesionesSinCobrar > 0" class="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                <span class="text-orange-800">{{ balanceFinanciero.sesionesSinCobrar }} sesiones sin cobrar</span>
                <span class="font-semibold text-orange-700">{{ formatearPrecio(balanceFinanciero.montoSesionesPendientes) }}</span>
              </div>
            </div>
          </section>

          <!-- BONO ACTIVO -->
          <section class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TicketIcon class="w-5 h-5 text-purple-600" />
                Bono Activo
              </h2>
              <button
                @click="irABonos"
                class="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Gestionar
              </button>
            </div>

            <div v-if="bonoActivo" class="space-y-4">
              <!-- Tipo de bono -->
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ formatearTipoBono(bonoActivo.tipo) }}</span>
                <span
                  class="px-2 py-0.5 text-xs font-medium rounded-full capitalize"
                  :class="{
                    'bg-green-100 text-green-700': bonoActivo.estado === 'activo',
                    'bg-amber-100 text-amber-700': bonoActivo.estado === 'pendiente'
                  }"
                >
                  {{ bonoActivo.estado }}
                </span>
              </div>

              <!-- Sesiones -->
              <div class="text-center py-4">
                <p class="text-4xl font-bold text-purple-600 mb-1">{{ bonoActivo.sesiones_disponibles }}</p>
                <p class="text-sm text-gray-500">de {{ bonoActivo.sesiones_totales }} sesiones restantes</p>
              </div>

              <!-- Barra de progreso -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs text-gray-500">
                  <span>Progreso</span>
                  <span>{{ bonoActivo.porcentaje_uso }}%</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all"
                    :class="{
                      'bg-red-500': bonoActivo.sesiones_disponibles <= 1,
                      'bg-amber-500': bonoActivo.sesiones_disponibles === 2,
                      'bg-purple-500': bonoActivo.sesiones_disponibles > 2
                    }"
                    :style="{ width: `${bonoActivo.porcentaje_uso}%` }"
                  ></div>
                </div>
              </div>

              <!-- Pago -->
              <div class="pt-3 border-t border-gray-100">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Monto total</span>
                  <span class="font-medium">{{ formatearPrecio(bonoActivo.monto_total) }}</span>
                </div>
                <div class="flex items-center justify-between text-sm mt-1">
                  <span class="text-gray-600">Estado pago</span>
                  <span
                    class="font-medium"
                    :class="bonoActivo.pagado ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ bonoActivo.pagado ? 'Pagado' : 'Pendiente' }}
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-6">
              <TicketIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-500 mb-3">No hay bono activo</p>
              <button
                @click="irABonos"
                class="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 font-medium rounded-lg transition-colors"
              >
                Crear nuevo bono
              </button>
            </div>
          </section>

          <!-- HISTORIAL DE BONOS (resumido) -->
          <section v-if="todosLosBonos.length > 1" class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-gray-900">Historial de Bonos</h3>
              <button
                @click="irABonos"
                class="text-xs text-purple-600 hover:text-purple-700"
              >
                Ver todo
              </button>
            </div>

            <div class="space-y-2">
              <div
                v-for="bono in todosLosBonos.slice(1, 4)"
                :key="bono.id"
                class="p-2 bg-gray-50 rounded-lg flex items-center justify-between text-sm"
              >
                <div>
                  <span class="font-medium text-gray-700">{{ formatearTipoBono(bono.tipo) }}</span>
                  <span class="text-xs text-gray-500 ml-2">{{ bono.sesiones_usadas || (bono.sesiones_totales - bono.sesiones_restantes) }}/{{ bono.sesiones_totales }}</span>
                </div>
                <span
                  class="px-2 py-0.5 text-xs rounded-full capitalize"
                  :class="{
                    'bg-gray-100 text-gray-600': bono.estado === 'agotado' || bono.estado === 'completado',
                    'bg-red-100 text-red-600': bono.estado === 'cancelado'
                  }"
                >
                  {{ bono.estado }}
                </span>
              </div>
            </div>
          </section>

          <!-- NOTAS CLÍNICAS -->
          <section class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DocumentTextIcon class="w-5 h-5 text-purple-600" />
                Notas Clínicas
              </h2>
              <button
                @click="abrirModalNuevaNota"
                class="px-3 py-1.5 text-sm bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
              >
                <PlusIcon class="w-4 h-4" />
                Añadir
              </button>
            </div>

            <!-- Lista de notas recientes -->
            <div v-if="notasRecientes.length > 0" class="space-y-3">
              <div
                v-for="nota in notasRecientes.slice(0, 3)"
                :key="nota.id"
                class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                @click="verNota(nota.id)"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-500">{{ formatearFecha(nota.fecha || nota.created_at?.split('T')[0]) }}</span>
                  <span v-if="nota.sesion_id" class="text-xs text-purple-600">Sesión vinculada</span>
                </div>
                <p class="text-sm text-gray-700 line-clamp-2">{{ nota.contenido || nota.resumen }}</p>
              </div>

              <button
                v-if="notasRecientes.length > 3"
                @click="verTodasLasNotas"
                class="w-full py-2 text-sm text-purple-600 hover:text-purple-700 font-medium text-center"
              >
                Ver todas las notas
              </button>
            </div>

            <div v-else class="text-center py-6">
              <DocumentTextIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p class="text-sm text-gray-500">Sin notas clínicas</p>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- MODALES -->
    <ModalNuevaCita
      :mostrar="modalCitaAbierto"
      :paciente-preseleccionado="pacienteParaCita"
      @cerrar="cerrarModalCita"
      @cita-creada="onCitaCreada"
    />

    <ModalDetallesCita
      :is-open="modalDetallesAbierto"
      :cita-id="citaSeleccionada"
      @close="cerrarModalDetalles"
    />

    <ModalEditarPaciente
      v-if="mostrarModalEditar"
      :mostrar="mostrarModalEditar"
      :paciente="pacienteData"
      @cerrar="mostrarModalEditar = false"
      @paciente-actualizado="onPacienteActualizado"
    />
  </div>
</template>

<script setup lang="ts">
import {
  UserGroupIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  TicketIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import { useCitas } from '~/composables/useCitas'

definePageMeta({
  layout: 'terapeuta'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { getCitas } = useCitas()

// Variables de navegación
const route = useRoute()

// ID del paciente desde la ruta
const pacienteId = computed(() => route.params.id as string || '')

// Estado principal
const cargando = ref(true)
const error = ref<string | null>(null)
const pacienteData = ref<any>(null)
const bonoActivo = ref<any>(null)
const todasLasCitas = ref<any[]>([])
const todosLosBonos = ref<any[]>([])
const notasRecientes = ref<any[]>([])

// Filtros
const filtroFechaInicio = ref('')
const filtroFechaFin = ref('')

// Modales
const modalCitaAbierto = ref(false)
const pacienteParaCita = ref<any>(null)
const modalDetallesAbierto = ref(false)
const citaSeleccionada = ref<string | null>(null)
const mostrarModalEditar = ref(false)
const mostrarModalEditarCaso = ref(false)

// ============================================
// CARGAR DATOS
// ============================================

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

    pacienteData.value = {
      ...paciente,
      nombre_completo: (paciente as any).nombre_completo || (paciente as any).email || 'Sin nombre'
    }

    // Cargar citas
    const citas = await getCitas()
    todasLasCitas.value = citas.filter((c: any) => c.paciente_id === pacienteId.value)

    // Cargar bono activo
    await cargarBonoActivo()

    // Cargar todos los bonos
    await cargarTodosLosBonos()

    // Cargar notas
    await cargarNotas()

  } catch (err: any) {
    console.error('Error al cargar paciente:', err)
    error.value = err.message || 'Error desconocido'
  } finally {
    cargando.value = false
  }
}

const cargarBonoActivo = async () => {
  try {
    // Cargar bono activo
    const { data: bono } = await supabase
      .from('bonos')
      .select('*')
      .eq('paciente_id', pacienteId.value)
      .in('estado', ['activo', 'pendiente'])
      .gt('sesiones_restantes', 0)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (bono) {
      // Contar sesiones utilizadas del bono (citas asociadas con estado realizada o confirmada)
      const { count: sesionesUsadasCount } = await supabase
        .from('citas')
        .select('*', { count: 'exact', head: true })
        .eq('bono_id', bono.id)
        .in('estado', ['realizada', 'confirmada', 'pendiente'])

      const sesionesTotales = bono.sesiones_totales || 0
      const sesionesRestantes = bono.sesiones_restantes || 0
      // Usar el conteo real de citas o calcular desde sesiones_restantes
      const sesionesUsadas = sesionesUsadasCount ?? (sesionesTotales - sesionesRestantes)

      bonoActivo.value = {
        ...bono,
        sesiones_usadas: sesionesUsadas,
        sesiones_disponibles: sesionesRestantes,
        porcentaje_uso: sesionesTotales > 0 ? Math.round((sesionesUsadas / sesionesTotales) * 100) : 0
      }
    } else {
      bonoActivo.value = null
    }
  } catch (err) {
    console.warn('[Bonos] Error:', err)
  }
}

const cargarTodosLosBonos = async () => {
  try {
    const { data } = await supabase
      .from('bonos')
      .select('*')
      .eq('paciente_id', pacienteId.value)
      .order('created_at', { ascending: false })

    if (!data) {
      todosLosBonos.value = []
      return
    }

    // Para cada bono, calcular las sesiones usadas reales desde las citas
    const bonosConSesiones = await Promise.all(
      data.map(async (bono) => {
        const { count } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .eq('bono_id', bono.id)
          .in('estado', ['realizada', 'confirmada', 'pendiente'])

        const sesionesUsadas = count ?? (bono.sesiones_totales - bono.sesiones_restantes)

        return {
          ...bono,
          sesiones_usadas: sesionesUsadas
        }
      })
    )

    todosLosBonos.value = bonosConSesiones
  } catch (err) {
    console.warn('[Bonos] Error:', err)
  }
}

const cargarNotas = async () => {
  try {
    // Solo cargar notas si el usuario está autenticado
    if (!user.value?.id) {
      console.warn('[Notas] Usuario no autenticado, omitiendo carga de notas')
      notasRecientes.value = []
      return
    }

    const { data, error: notasError } = await (supabase as any)
      .from('notas_terapeuticas')
      .select('*')
      .eq('paciente_id', pacienteId.value)
      .eq('terapeuta_id', user.value.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (notasError) {
      console.warn('[Notas] Error:', notasError)
      notasRecientes.value = []
      return
    }

    notasRecientes.value = data || []
  } catch (err) {
    console.warn('[Notas] Error:', err)
    notasRecientes.value = []
  }
}

// ============================================
// COMPUTED
// ============================================

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
  const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#6366F1', '#F97316']
  const index = pacienteId.value.charCodeAt(0) % colors.length
  return colors[index]
})

const estadoTexto = computed(() => {
  if (!pacienteData.value) return ''
  if (!pacienteData.value.activo) return 'Alta'
  if (pacienteData.value.metadata?.en_pausa) return 'En pausa'
  if (pacienteData.value.metadata?.en_evaluacion) return 'En evaluación'
  return 'Activo'
})

const estadoClasses = computed(() => {
  if (!pacienteData.value) return ''
  if (!pacienteData.value.activo) return 'bg-gray-100 text-gray-600'
  if (pacienteData.value.metadata?.en_pausa) return 'bg-amber-100 text-amber-700'
  if (pacienteData.value.metadata?.en_evaluacion) return 'bg-blue-100 text-blue-700'
  return 'bg-green-100 text-green-700'
})

const sesionesCompletadas = computed(() => {
  return todasLasCitas.value.filter((c: any) => c.estado === 'realizada')
})

const sesionesPendientes = computed(() => {
  return todasLasCitas.value.filter((c: any) => c.estado === 'pendiente')
})

const estadisticas = computed(() => ({
  total: todasLasCitas.value.length,
  completadas: sesionesCompletadas.value.length,
  pendientes: sesionesPendientes.value.length
}))

const proximaSesion = computed(() => {
  const hoy = new Date()
  const proximas = todasLasCitas.value
    .filter((c: any) =>
      ['pendiente', 'confirmada'].includes(c.estado) &&
      new Date(c.fecha_cita) >= hoy
    )
    .sort((a: any, b: any) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime())

  return proximas.length > 0 ? proximas[0] : null
})

const historialSesionesFiltrado = computed(() => {
  let sesiones = [...todasLasCitas.value]

  if (filtroFechaInicio.value) {
    const fechaInicio = new Date(filtroFechaInicio.value)
    sesiones = sesiones.filter((s: any) => new Date(s.fecha_cita) >= fechaInicio)
  }

  if (filtroFechaFin.value) {
    const fechaFin = new Date(filtroFechaFin.value)
    sesiones = sesiones.filter((s: any) => new Date(s.fecha_cita) <= fechaFin)
  }

  return sesiones.sort((a: any, b: any) =>
    new Date(b.fecha_cita).getTime() - new Date(a.fecha_cita).getTime()
  )
})

const balanceFinanciero = computed(() => {
  const bonosSinPagar = todosLosBonos.value.filter(b => !b.pagado)
  const montoBonosPendientes = bonosSinPagar.reduce((acc, b) => acc + (b.monto_total || 0), 0)

  const sesionesSinCobrar = todasLasCitas.value.filter(c =>
    c.estado === 'realizada' &&
    !c.pagado &&
    c.estado_pago !== 'bonificado' &&
    !c.bono_id
  )
  const montoSesionesPendientes = sesionesSinCobrar.reduce((acc, c) => acc + (c.precio_sesion || 0), 0)

  return {
    bonosPendientes: bonosSinPagar.length,
    montoBonosPendientes,
    sesionesSinCobrar: sesionesSinCobrar.length,
    montoSesionesPendientes,
    totalPendiente: montoBonosPendientes + montoSesionesPendientes
  }
})

// ============================================
// HELPERS
// ============================================

const formatearFecha = (fecha: string) => {
  if (!fecha) return ''
  try {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-ES', {
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

const formatearFrecuencia = (frecuencia: string) => {
  const map: Record<string, string> = {
    'semanal': 'Semanal',
    'quincenal': 'Quincenal',
    'mensual': 'Mensual',
    'a_demanda': 'A demanda'
  }
  return map[frecuencia] || frecuencia
}

const formatearTipoBono = (tipo: string) => {
  const tipos: Record<string, string> = {
    'a_demanda': 'A Demanda',
    'quincenal': 'Quincenal',
    'semanal': 'Semanal',
    'mensual': 'Mensual'
  }
  return tipos[tipo] || tipo || 'Bono'
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
    'online': 'bg-purple-100 text-purple-700',
    'telefonica': 'bg-blue-100 text-blue-700'
  }
  return estilos[modalidad] || 'bg-gray-100 text-gray-700'
}

const obtenerEstiloEstado = (estado: string) => {
  const estilos: Record<string, string> = {
    'pendiente': 'bg-amber-100 text-amber-700',
    'confirmada': 'bg-green-100 text-green-700',
    'realizada': 'bg-blue-100 text-blue-700',
    'cancelada': 'bg-red-100 text-red-700'
  }
  return estilos[estado] || 'bg-gray-100 text-gray-700'
}

// ============================================
// ACCIONES
// ============================================

const irABonos = () => {
  if (pacienteId.value) {
    navigateTo(`/terapeuta/pacientes/${pacienteId.value}/bonos`)
  }
}

const abrirWhatsApp = () => {
  const telefono = pacienteData.value?.telefono
  if (!telefono) return

  const numeroLimpio = telefono.replace(/\D/g, '')
  const mensaje = encodeURIComponent(`Hola ${nombreCompleto.value}, ¿cómo estás?`)
  window.open(`https://wa.me/${numeroLimpio}?text=${mensaje}`, '_blank')
}

const enviarEmail = () => {
  const email = pacienteData.value?.email
  if (!email) return

  window.open(`mailto:${email}`, '_blank')
}

const agendarSesion = () => {
  if (!pacienteData.value) return

  pacienteParaCita.value = {
    id: pacienteData.value.id,
    nombre: nombreCompleto.value,
    email: pacienteData.value.email,
    telefono: pacienteData.value.telefono,
    frecuencia: pacienteData.value.frecuencia || 'semanal',
    area_acompanamiento: pacienteData.value.area_de_acompanamiento,
    precio_sesion: pacienteData.value.precio_sesion || null
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

const reprogramarCita = (citaId: string) => {
  // TODO: Implementar reprogramación
  console.log('Reprogramar cita:', citaId)
}

const editarPaciente = () => {
  mostrarModalEditar.value = true
}

const onPacienteActualizado = () => {
  cargarDatosPaciente()
}

const verHistorialCompleto = () => {
  // TODO: Abrir modal o navegar a historial completo
  console.log('Ver historial completo')
}

const abrirModalNuevaNota = () => {
  // TODO: Implementar modal de nueva nota
  console.log('Nueva nota')
}

const verNota = (notaId: string) => {
  // TODO: Implementar ver nota
  console.log('Ver nota:', notaId)
}

const verTodasLasNotas = () => {
  // TODO: Implementar ver todas las notas
  console.log('Ver todas las notas')
}

// ============================================
// LIFECYCLE
// ============================================

onMounted(() => {
  cargarDatosPaciente()
})

watch(() => route.params.id, () => {
  if (route.params.id) {
    cargarDatosPaciente()
  }
})
</script>
