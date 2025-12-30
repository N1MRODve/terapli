<template>
  <div>
    <!-- Header minimalista con tabs integrados -->
    <header class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-6">
          <h1 class="text-2xl font-semibold text-gray-900">Bonos</h1>

          <!-- Tabs integrados -->
          <nav class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              @click="activeTab = 'pacientes'"
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
              :class="activeTab === 'pacientes'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'"
            >
              Por Paciente
              <span class="ml-1 text-xs" :class="activeTab === 'pacientes' ? 'text-gray-500' : 'text-gray-400'">
                {{ pacientesConBonos.length }}
              </span>
            </button>
            <button
              @click="activeTab = 'resumen'"
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
              :class="activeTab === 'resumen'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'"
            >
              Por Tipo
              <span class="ml-1 text-xs" :class="activeTab === 'resumen' ? 'text-gray-500' : 'text-gray-400'">
                {{ tiposBonos.length }}
              </span>
            </button>
            <button
              @click="activeTab = 'bonos'"
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
              :class="activeTab === 'bonos'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'"
            >
              Todos
              <span class="ml-1 text-xs" :class="activeTab === 'bonos' ? 'text-gray-500' : 'text-gray-400'">
                {{ todosBonos.length }}
              </span>
            </button>
            <button
              @click="activeTab = 'plantillas'"
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
              :class="activeTab === 'plantillas'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'"
            >
              Plantillas
              <span class="ml-1 text-xs" :class="activeTab === 'plantillas' ? 'text-gray-500' : 'text-gray-400'">
                {{ plantillas.length }}
              </span>
            </button>
          </nav>
        </div>

        <button
          v-if="activeTab === 'plantillas'"
          @click="abrirModalNuevaPlantilla"
          class="h-10 px-4 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <PlusIcon class="w-4 h-4" />
          Nueva Plantilla
        </button>
      </div>

      <!-- Quick stats mejoradas con cards -->
      <div v-if="activeTab === 'bonos' || activeTab === 'resumen' || activeTab === 'pacientes'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
        <!-- Por Cobrar (destacado) -->
        <div
          @click="filtrarPendientesCobro"
          class="col-span-2 md:col-span-1 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group"
        >
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <CurrencyEuroIcon class="w-4 h-4 text-amber-600" />
            </div>
            <span class="text-xs font-medium text-amber-600 uppercase">Por Cobrar</span>
          </div>
          <p class="text-2xl font-bold text-amber-900">{{ formatearPrecio(estadisticasBonos.montoPendiente) }}€</p>
          <div class="flex items-center justify-between mt-1">
            <p class="text-xs text-amber-600">{{ estadisticasBonos.bonosSinPagar }} bonos</p>
            <span class="text-xs text-amber-500 group-hover:text-amber-700 flex items-center gap-1">
              Ver <ChevronRightIcon class="w-3 h-3" />
            </span>
          </div>
        </div>

        <!-- Activos -->
        <div class="bg-white border border-gray-100 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon class="w-4 h-4 text-green-600" />
            </div>
            <span class="text-xs font-medium text-green-600 uppercase">Activos</span>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ estadisticasBonos.activos }}</p>
          <p class="text-xs text-gray-500 mt-1">En uso actualmente</p>
        </div>

        <!-- Por Agotar (próximos a terminarse) -->
        <div
          v-if="estadisticasBonos.proximosAgotar > 0"
          @click="filtrarProximosAgotar"
          class="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group"
        >
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon class="w-4 h-4 text-red-600" />
            </div>
            <span class="text-xs font-medium text-red-600 uppercase">Por Agotar</span>
          </div>
          <p class="text-2xl font-bold text-red-900">{{ estadisticasBonos.proximosAgotar }}</p>
          <div class="flex items-center justify-between mt-1">
            <p class="text-xs text-red-600">≤2 sesiones</p>
            <span class="text-xs text-red-500 group-hover:text-red-700 flex items-center gap-1">
              Ver <ChevronRightIcon class="w-3 h-3" />
            </span>
          </div>
        </div>

        <!-- Completados (si no hay por agotar) -->
        <div v-else class="bg-white border border-gray-100 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <CheckIcon class="w-4 h-4 text-gray-600" />
            </div>
            <span class="text-xs font-medium text-gray-600 uppercase">Finalizados</span>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ estadisticasBonos.completados }}</p>
          <p class="text-xs text-gray-500 mt-1">Este mes</p>
        </div>

        <!-- Urgentes (agotados sin pagar) -->
        <div
          v-if="estadisticasBonos.urgentes > 0"
          @click="filtrarUrgentes"
          class="bg-gradient-to-br from-red-100 to-rose-100 border-2 border-red-300 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group animate-pulse-subtle"
        >
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center">
              <ExclamationCircleIcon class="w-4 h-4 text-red-700" />
            </div>
            <span class="text-xs font-medium text-red-700 uppercase">Urgente</span>
          </div>
          <p class="text-2xl font-bold text-red-900">{{ estadisticasBonos.urgentes }}</p>
          <div class="flex items-center justify-between mt-1">
            <p class="text-xs text-red-700">Agotados sin pagar</p>
            <span class="text-xs text-red-600 group-hover:text-red-800 flex items-center gap-1">
              Ver <ChevronRightIcon class="w-3 h-3" />
            </span>
          </div>
        </div>

        <!-- Finalizados (si hay urgentes, movemos completados aquí) -->
        <div v-if="estadisticasBonos.proximosAgotar > 0" class="bg-white border border-gray-100 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <ArchiveBoxIcon class="w-4 h-4 text-gray-600" />
            </div>
            <span class="text-xs font-medium text-gray-600 uppercase">Finalizados</span>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ estadisticasBonos.completados }}</p>
          <p class="text-xs text-gray-500 mt-1">Sesiones agotadas</p>
        </div>
      </div>
    </header>

    <!-- Tab: Por Paciente (NUEVO) -->
    <div v-if="activeTab === 'pacientes'" class="space-y-4">
      <!-- Loading -->
      <div v-if="cargandoBonos" class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="pacientesConBonos.length === 0" class="bg-white border border-gray-100 rounded-lg py-12 text-center">
        <UserGroupIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-600 font-medium mb-1">Sin bonos asignados</p>
        <p class="text-sm text-gray-400">Los bonos de tus pacientes aparecerán aquí</p>
      </div>

      <!-- Lista de pacientes con bonos colapsables -->
      <div v-else class="space-y-3">
        <div
          v-for="paciente in pacientesConBonos"
          :key="paciente.id"
          class="bg-white border border-gray-100 rounded-lg overflow-hidden"
        >
          <!-- Header del paciente (clickeable) -->
          <div
            @click="togglePacienteExpandido(paciente.id)"
            class="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-semibold">
                {{ getIniciales(paciente.nombre) }}
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ paciente.nombre }}</p>
                <div class="flex items-center gap-2 text-xs text-gray-500">
                  <span>{{ paciente.bonos.length }} {{ paciente.bonos.length === 1 ? 'bono' : 'bonos' }}</span>
                  <span class="text-gray-300">|</span>
                  <span>{{ paciente.sesionesUsadas }}/{{ paciente.sesionesTotales }} sesiones</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <!-- Badge prioridad (basado en pago y sesiones) -->
              <span
                v-if="paciente.requiereAccion"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                :class="getPrioridadPacienteClase(paciente)"
              >
                <ExclamationCircleIcon v-if="paciente.prioridad === 'urgente'" class="w-3.5 h-3.5" />
                <ClockIcon v-else-if="paciente.prioridad === 'atencion'" class="w-3.5 h-3.5" />
                {{ getPrioridadPacienteTexto(paciente) }}
              </span>

              <!-- Total pendiente -->
              <div class="text-right min-w-[80px]">
                <p class="text-sm font-semibold text-gray-900">{{ formatearPrecio(paciente.montoTotal) }}€</p>
                <p class="text-xs" :class="paciente.montoPendiente > 0 ? 'text-amber-600' : 'text-green-600'">
                  {{ paciente.montoPendiente > 0 ? `${formatearPrecio(paciente.montoPendiente)}€ pend.` : 'Todo pagado' }}
                </p>
              </div>

              <!-- Chevron -->
              <ChevronDownIcon
                class="w-5 h-5 text-gray-400 transition-transform"
                :class="{ 'rotate-180': pacientesExpandidos.includes(paciente.id) }"
              />
            </div>
          </div>

          <!-- Lista de bonos del paciente (colapsable) -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[500px]"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 max-h-[500px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-if="pacientesExpandidos.includes(paciente.id)" class="border-t border-gray-100 overflow-hidden">
              <div class="divide-y divide-gray-50">
                <div
                  v-for="bono in paciente.bonos"
                  :key="bono.id"
                  class="px-4 py-3 pl-16 hover:bg-gray-50/50 transition-colors group"
                >
                  <div class="flex items-center justify-between">
                    <!-- Info del bono (clickeable para ir a detalle) -->
                    <div
                      @click.stop="irABonoPaciente(bono)"
                      class="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="getTipoBonoColor(bono.tipo)">
                        <TicketIcon class="w-4 h-4" />
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-medium text-gray-900">{{ frecuenciaLabel(bono.tipo) }}</span>
                          <!-- Badge estado unificado con prioridad visual -->
                          <span
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                            :class="getEstadoUnificadoClase(bono)"
                          >
                            <component :is="getEstadoUnificadoIcono(bono)" class="w-3 h-3" />
                            {{ getEstadoUnificadoTexto(bono) }}
                          </span>
                        </div>
                        <p class="text-xs text-gray-500">
                          {{ bono.sesiones_totales - bono.sesiones_restantes }}/{{ bono.sesiones_totales }} sesiones
                          <span v-if="bono.fecha_fin" class="ml-2">• Vence {{ formatearFechaCorta(bono.fecha_fin) }}</span>
                        </p>
                      </div>
                    </div>

                    <!-- Acciones y monto -->
                    <div class="flex items-center gap-3">
                      <!-- Acción rápida según estado -->
                      <button
                        v-if="!bono.pagado"
                        @click.stop="registrarPago(bono)"
                        class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                        :class="bono.sesiones_restantes === 0
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'"
                      >
                        <CurrencyEuroIcon class="w-3.5 h-3.5" />
                        {{ bono.sesiones_restantes === 0 ? 'Cobrar ahora' : 'Registrar pago' }}
                      </button>

                      <button
                        v-else-if="bono.sesiones_restantes === 0"
                        @click.stop="crearNuevoBono(bono)"
                        class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-all"
                      >
                        <PlusIcon class="w-3.5 h-3.5" />
                        Nuevo bono
                      </button>

                      <!-- Barra de progreso -->
                      <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden hidden md:block">
                        <div
                          class="h-full rounded-full transition-all"
                          :class="getProgresoColorUnificado(bono)"
                          :style="{ width: `${calcularPorcentajeUso(bono)}%` }"
                        ></div>
                      </div>

                      <!-- Monto -->
                      <div class="text-right min-w-[60px]">
                        <p class="text-sm font-medium text-gray-900">{{ bono.monto_total }}€</p>
                        <p class="text-xs" :class="bono.pagado ? 'text-green-600' : 'text-amber-600'">
                          {{ bono.pagado ? 'Pagado' : 'Pendiente' }}
                        </p>
                      </div>

                      <!-- Menú contextual -->
                      <div class="relative">
                        <button
                          @click.stop="toggleMenuBono(bono.id)"
                          class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <EllipsisVerticalIcon class="w-5 h-5" />
                        </button>

                        <!-- Dropdown menu -->
                        <Transition
                          enter-active-class="transition-all duration-150 ease-out"
                          enter-from-class="opacity-0 scale-95"
                          enter-to-class="opacity-100 scale-100"
                          leave-active-class="transition-all duration-100 ease-in"
                          leave-from-class="opacity-100 scale-100"
                          leave-to-class="opacity-0 scale-95"
                        >
                          <div
                            v-if="menuBonoAbierto === bono.id"
                            class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
                          >
                            <!-- Ver historial -->
                            <button
                              @click.stop="verHistorialBono(bono)"
                              class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <ClipboardDocumentListIcon class="w-4 h-4 text-gray-400" />
                              Ver historial
                            </button>

                            <!-- Registrar pago -->
                            <button
                              v-if="!bono.pagado"
                              @click.stop="registrarPago(bono)"
                              class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <CurrencyEuroIcon class="w-4 h-4 text-gray-400" />
                              Registrar pago
                            </button>

                            <!-- Añadir sesión (solo si activo) -->
                            <button
                              v-if="bono.estado === 'activo' && bono.sesiones_restantes > 0"
                              @click.stop="anadirSesion(bono)"
                              class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <CalendarIcon class="w-4 h-4 text-gray-400" />
                              Añadir sesión
                            </button>

                            <!-- Editar bono -->
                            <button
                              @click.stop="editarBono(bono)"
                              class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <PencilIcon class="w-4 h-4 text-gray-400" />
                              Editar bono
                            </button>

                            <!-- Separador -->
                            <div class="border-t border-gray-100 my-1"></div>

                            <!-- Pausar/Reactivar -->
                            <button
                              v-if="bono.estado === 'activo'"
                              @click.stop="pausarBono(bono)"
                              class="w-full px-3 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                            >
                              <PauseIcon class="w-4 h-4" />
                              Pausar bono
                            </button>
                            <button
                              v-else-if="bono.estado === 'pausado'"
                              @click.stop="reactivarBono(bono)"
                              class="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                            >
                              <PlayIcon class="w-4 h-4" />
                              Reactivar bono
                            </button>

                            <!-- Crear nuevo bono (si agotado) -->
                            <button
                              v-if="bono.sesiones_restantes === 0"
                              @click.stop="crearNuevoBono(bono)"
                              class="w-full px-3 py-2 text-left text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2"
                            >
                              <PlusCircleIcon class="w-4 h-4" />
                              Crear nuevo bono
                            </button>

                            <!-- Eliminar -->
                            <button
                              @click.stop="confirmarEliminarBono(bono)"
                              class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <TrashIcon class="w-4 h-4" />
                              Eliminar bono
                            </button>
                          </div>
                        </Transition>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Tab: Por Tipo (Resumen) -->
    <div v-if="activeTab === 'resumen'" class="space-y-6">
      <!-- Loading -->
      <div v-if="cargandoBonos" class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="tiposBonos.length === 0" class="bg-white border border-gray-100 rounded-lg py-12 text-center">
        <TicketIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-600 font-medium mb-1">Sin bonos asignados</p>
        <p class="text-sm text-gray-400">Los bonos de tus pacientes apareceran aqui agrupados por tipo</p>
      </div>

      <!-- Cards por tipo de bono -->
      <div v-else class="grid gap-4">
        <div
          v-for="tipoBono in tiposBonos"
          :key="tipoBono.tipo"
          class="bg-white border border-gray-100 rounded-lg overflow-hidden"
        >
          <!-- Header del tipo -->
          <div class="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="getTipoBonoColor(tipoBono.tipo)">
                  <TicketIcon class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ getTipoBonoNombre(tipoBono.tipo) }}</h3>
                  <p class="text-sm text-gray-500">
                    {{ tipoBono.pacientes.length }} {{ tipoBono.pacientes.length === 1 ? 'paciente' : 'pacientes' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-4 text-sm">
                <div class="text-right">
                  <p class="text-gray-500">Activos</p>
                  <p class="font-semibold text-green-600">{{ tipoBono.activos }}</p>
                </div>
                <div class="text-right">
                  <p class="text-gray-500">Completados</p>
                  <p class="font-semibold text-gray-600">{{ tipoBono.completados }}</p>
                </div>
                <div class="text-right">
                  <p class="text-gray-500">Total facturado</p>
                  <p class="font-semibold text-gray-900">{{ formatearPrecio(tipoBono.montoTotal) }}€</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista de pacientes agrupados -->
          <div class="divide-y divide-gray-50">
            <div
              v-for="paciente in tipoBono.pacientes"
              :key="paciente.paciente_id"
              class="overflow-hidden"
            >
              <!-- Bono activo del paciente (siempre visible) -->
              <div
                v-if="paciente.bonoActivo"
                class="px-5 py-3 hover:bg-gray-50/50 transition-colors flex items-center justify-between"
              >
                <div
                  class="flex items-center gap-3 cursor-pointer flex-1"
                  @click="irABonoPaciente({ paciente_id: paciente.paciente_id })"
                >
                  <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-semibold">
                    {{ getIniciales(paciente.nombre) }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-medium text-gray-900">{{ paciente.nombre }}</p>
                      <!-- Badge de bono activo -->
                      <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircleIcon class="w-3 h-3" />
                        Activo
                      </span>
                      <!-- Indicador de urgencia -->
                      <span
                        v-if="getUrgenciaPacienteTipo(paciente.bonoActivo)"
                        class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
                        :class="getUrgenciaPacienteTipo(paciente.bonoActivo).clase"
                      >
                        <component :is="getUrgenciaPacienteTipo(paciente.bonoActivo).icono" class="w-3 h-3" />
                        {{ getUrgenciaPacienteTipo(paciente.bonoActivo).texto }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500">
                      Creado: {{ formatearFechaCorta(paciente.bonoActivo.created_at) }}
                      <span v-if="paciente.totalBonos > 1" class="text-gray-400 ml-1">
                        • {{ paciente.totalBonos }} bonos en total
                      </span>
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <!-- Barra de progreso semántica -->
                  <div class="flex items-center gap-2">
                    <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="getProgresoColorSemantico(paciente.bonoActivo)"
                        :style="{ width: `${(paciente.bonoActivo.sesiones_usadas / paciente.bonoActivo.sesiones_totales) * 100}%` }"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-500 min-w-[40px]">
                      {{ paciente.bonoActivo.sesiones_totales - paciente.bonoActivo.sesiones_usadas }}/{{ paciente.bonoActivo.sesiones_totales }}
                    </span>
                  </div>
                  <!-- Monto y pago -->
                  <div class="text-right min-w-[70px]">
                    <p class="text-sm font-medium text-gray-900">{{ paciente.bonoActivo.monto }}€</p>
                    <p class="text-xs" :class="paciente.bonoActivo.pagado ? 'text-green-600' : 'text-amber-600'">
                      {{ paciente.bonoActivo.pagado ? 'Pagado' : 'Pendiente' }}
                    </p>
                  </div>
                  <!-- Botón para ver historial si hay más bonos -->
                  <button
                    v-if="paciente.bonosHistoricos.length > 0"
                    @click.stop="toggleHistorial(paciente.paciente_id, tipoBono.tipo)"
                    class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    :title="`Ver ${paciente.bonosHistoricos.length} bono(s) anterior(es)`"
                  >
                    <ChevronDownIcon
                      class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-180': historialesExpandidos.includes(`${tipoBono.tipo}-${paciente.paciente_id}`) }"
                    />
                  </button>
                  <ChevronRightIcon v-else class="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <!-- Paciente sin bono activo (solo históricos) -->
              <div
                v-else-if="paciente.bonosHistoricos.length > 0"
                class="px-5 py-3 hover:bg-gray-50/50 transition-colors flex items-center justify-between"
              >
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-semibold">
                    {{ getIniciales(paciente.nombre) }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-medium text-gray-600">{{ paciente.nombre }}</p>
                      <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        <ArchiveBoxIcon class="w-3 h-3" />
                        Solo histórico
                      </span>
                    </div>
                    <p class="text-xs text-gray-400">
                      {{ paciente.bonosHistoricos.length }} bono(s) completado(s)
                    </p>
                  </div>
                </div>
                <button
                  @click.stop="toggleHistorial(paciente.paciente_id, tipoBono.tipo)"
                  class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1"
                >
                  <span class="text-xs">Ver historial</span>
                  <ChevronDownIcon
                    class="w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': historialesExpandidos.includes(`${tipoBono.tipo}-${paciente.paciente_id}`) }"
                  />
                </button>
              </div>

              <!-- Historial de bonos (acordeón expandible) -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[400px]"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 max-h-[400px]"
                leave-to-class="opacity-0 max-h-0"
              >
                <div
                  v-if="historialesExpandidos.includes(`${tipoBono.tipo}-${paciente.paciente_id}`) && paciente.bonosHistoricos.length > 0"
                  class="bg-gray-50/50 border-t border-gray-100 overflow-hidden"
                >
                  <div class="px-5 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Historial de bonos
                  </div>
                  <div class="divide-y divide-gray-100">
                    <div
                      v-for="bono in paciente.bonosHistoricos"
                      :key="bono.bono_id"
                      class="px-5 py-2 pl-16 flex items-center justify-between text-sm hover:bg-gray-100/50 cursor-pointer"
                      @click="irABonoPaciente({ paciente_id: bono.paciente_id })"
                    >
                      <div class="flex items-center gap-3">
                        <div class="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">
                          <ArchiveBoxIcon class="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <div>
                          <div class="flex items-center gap-2">
                            <span class="text-gray-600">{{ bono.sesiones_usadas }}/{{ bono.sesiones_totales }} sesiones</span>
                            <span
                              class="inline-flex items-center px-1.5 py-0.5 rounded text-xs"
                              :class="bono.pagado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                            >
                              {{ bono.pagado ? 'Pagado' : 'Pendiente' }}
                            </span>
                          </div>
                          <p class="text-xs text-gray-400">
                            Creado: {{ formatearFechaCorta(bono.created_at) }}
                          </p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-gray-600">{{ bono.monto }}€</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Resumen del tipo -->
          <div
            v-if="tipoBono.montoPendiente > 0"
            class="px-5 py-2 bg-amber-50/50 border-t border-amber-100 flex items-center justify-between text-sm"
          >
            <span class="text-amber-700 font-medium">Por cobrar en este tipo:</span>
            <span class="font-semibold text-amber-700">{{ formatearPrecio(tipoBono.montoPendiente) }}€</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Plantillas -->
    <div v-if="activeTab === 'plantillas'" class="space-y-4">
      <!-- Precios base (compacto) -->
      <div class="bg-white border border-gray-100 rounded-lg p-4">
        <div class="flex flex-wrap items-center gap-4">
          <span class="text-sm font-medium text-gray-700">Precios base:</span>

          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-500">Semanal</label>
            <div class="relative">
              <input
                v-model.number="preciosFrecuencia.semanal"
                type="number"
                step="0.01"
                min="0"
                class="w-20 h-9 px-2 pr-6 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              />
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
            </div>
          </div>

          <span class="text-gray-300">|</span>

          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-500">Quincenal</label>
            <div class="relative">
              <input
                v-model.number="preciosFrecuencia.quincenal"
                type="number"
                step="0.01"
                min="0"
                class="w-20 h-9 px-2 pr-6 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              />
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
            </div>
          </div>

          <span class="text-gray-300">|</span>

          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-500">Única</label>
            <div class="relative">
              <input
                v-model.number="preciosFrecuencia.unica"
                type="number"
                step="0.01"
                min="0"
                class="w-20 h-9 px-2 pr-6 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              />
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
            </div>
          </div>

          <button
            @click="guardarPrecios"
            :disabled="guardandoPrecios"
            class="ml-auto h-9 px-4 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            :class="preciosCambiados
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-100 text-gray-500'"
          >
            <CheckIcon v-if="!guardandoPrecios && !preciosGuardados" class="w-4 h-4" />
            <span v-if="guardandoPrecios" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <CheckCircleIcon v-if="preciosGuardados" class="w-4 h-4 text-green-500" />
            {{ preciosGuardados ? 'Guardado' : (guardandoPrecios ? 'Guardando...' : 'Guardar') }}
          </button>
        </div>
      </div>

      <!-- Tabla de Plantillas -->
      <div class="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <!-- Empty State -->
        <div v-if="plantillas.length === 0" class="py-12 text-center">
          <TicketIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-600 font-medium mb-1">Sin plantillas</p>
          <p class="text-sm text-gray-400 mb-4">Crea plantillas para asignar bonos rápidamente</p>
          <button
            @click="abrirModalNuevaPlantilla"
            class="text-sm text-purple-600 font-medium hover:text-purple-700"
          >
            + Crear primera plantilla
          </button>
        </div>

        <!-- Tabla -->
        <table v-else class="w-full">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50/50">
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frecuencia</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sesiones</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th class="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="(plantilla, index) in plantillas"
              :key="index"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">{{ plantilla.nombre }}</div>
                <div v-if="plantilla.descripcion" class="text-xs text-gray-500">{{ plantilla.descripcion }}</div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  :class="frecuenciaColor(plantilla.frecuencia)"
                >
                  {{ frecuenciaLabel(plantilla.frecuencia) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center text-sm text-gray-600">{{ plantilla.sesiones }}</td>
              <td class="px-4 py-3 text-right text-sm font-medium text-gray-900">{{ plantilla.precio }}€</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="editarPlantilla(index)"
                    class="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="eliminarPlantilla(index)"
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab: Bonos Activos -->
    <div v-if="activeTab === 'bonos'" class="space-y-4">
      <!-- Filtros -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[200px] max-w-md">
          <input
            v-model="busquedaBono"
            type="text"
            placeholder="Buscar por paciente..."
            class="w-full h-10 px-4 pl-9 bg-white border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
          <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <select
          v-model="filtroEstado"
          class="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
        >
          <option value="">Estado: Todos</option>
          <option value="activo">Activos</option>
          <option value="pendiente">Pendientes</option>
          <option value="completado">Completados</option>
          <option value="vencido">Vencidos</option>
        </select>

        <select
          v-model="filtroPago"
          class="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
        >
          <option value="">Pago: Todos</option>
          <option value="pagado">Pagados</option>
          <option value="pendiente">Pendientes cobro</option>
        </select>

        <select
          v-model="ordenBonos"
          class="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
        >
          <option value="reciente">Más recientes</option>
          <option value="antiguo">Más antiguos</option>
          <option value="nombre">Nombre A-Z</option>
          <option value="monto_desc">Mayor monto</option>
          <option value="monto_asc">Menor monto</option>
          <option value="progreso">Por progreso</option>
        </select>

        <!-- Indicador de filtro especial activo -->
        <div
          v-if="filtroEspecial"
          class="flex items-center gap-2 h-10 px-3 rounded-lg text-sm font-medium"
          :class="{
            'bg-amber-100 text-amber-700': filtroEspecial === 'pendientes_cobro',
            'bg-orange-100 text-orange-700': filtroEspecial === 'proximos_agotar',
            'bg-red-100 text-red-700': filtroEspecial === 'urgentes'
          }"
        >
          <span>
            {{ filtroEspecial === 'pendientes_cobro' ? 'Pendientes de cobro' :
               filtroEspecial === 'proximos_agotar' ? 'Por agotar (≤2 sesiones)' :
               'Urgentes (agotados sin pagar)' }}
          </span>
          <span class="text-xs opacity-75">({{ bonosFiltrados.length }})</span>
        </div>

        <button
          v-if="busquedaBono || filtroEstado || filtroEspecial || filtroPago || ordenBonos !== 'reciente'"
          @click="limpiarFiltros"
          class="h-10 px-3 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <XMarkIcon class="w-4 h-4" />
          Limpiar
        </button>
      </div>

      <!-- Loading -->
      <div v-if="cargandoBonos" class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Tabla de Bonos -->
      <div v-else class="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <!-- Empty State -->
        <div v-if="bonosFiltrados.length === 0" class="py-12 text-center">
          <TicketIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-600 font-medium mb-1">
            {{ busquedaBono || filtroEstado ? 'Sin resultados' : 'Sin bonos' }}
          </p>
          <p class="text-sm text-gray-400">
            {{ busquedaBono || filtroEstado ? 'Prueba ajustando los filtros' : 'Los bonos de tus pacientes aparecerán aquí' }}
          </p>
        </div>

        <!-- Tabla -->
        <table v-else class="w-full">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50/50">
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Progreso</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th class="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="bono in bonosFiltrados"
              :key="bono.id"
              class="hover:bg-gray-50/50 transition-colors cursor-pointer"
              @click="irABonoPaciente(bono)"
            >
              <!-- Paciente -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {{ getIniciales(bono.paciente_nombre) }}
                  </div>
                  <span class="text-sm font-medium text-gray-900 truncate">{{ bono.paciente_nombre }}</span>
                </div>
              </td>

              <!-- Tipo -->
              <td class="px-4 py-3">
                <span class="text-sm text-gray-600">{{ frecuenciaLabel(bono.tipo) }}</span>
              </td>

              <!-- Progreso -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2 justify-center">
                  <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="getProgresoColor(bono)"
                      :style="{ width: `${calcularPorcentajeUso(bono)}%` }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ bono.sesiones_totales - bono.sesiones_restantes }}/{{ bono.sesiones_totales }}</span>
                </div>
              </td>

              <!-- Estado -->
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1.5 text-sm"
                  :class="getEstadoColorTexto(bono.estado)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getEstadoColorPunto(bono.estado)"></span>
                  {{ getEstadoTexto(bono.estado) }}
                </span>
              </td>

              <!-- Monto -->
              <td class="px-4 py-3 text-right">
                <div class="text-sm font-medium text-gray-900">{{ bono.monto_total }}€</div>
                <div class="text-xs" :class="bono.pagado ? 'text-green-600' : 'text-amber-600'">
                  {{ bono.pagado ? 'Pagado' : 'Pendiente' }}
                </div>
              </td>

              <!-- Acción -->
              <td class="px-4 py-3 text-right">
                <ChevronRightIcon class="w-4 h-4 text-gray-400" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nueva/Editar Plantilla -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="mostrarModalPlantilla"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          @click.self="cerrarModalPlantilla"
        >
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="font-semibold text-gray-900">
                {{ editandoPlantillaIndex !== null ? 'Editar Plantilla' : 'Nueva Plantilla' }}
              </h3>
              <button
                @click="cerrarModalPlantilla"
                class="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <div class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  v-model="plantillaForm.nombre"
                  type="text"
                  placeholder="Ej: Bono Mensual"
                  class="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <input
                  v-model="plantillaForm.descripcion"
                  type="text"
                  placeholder="Descripción breve..."
                  class="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Sesiones</label>
                  <input
                    v-model.number="plantillaForm.sesiones"
                    type="number"
                    min="1"
                    class="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Precio (€)</label>
                  <input
                    v-model.number="plantillaForm.precio"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                <select
                  v-model="plantillaForm.frecuencia"
                  class="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                  <option value="cualquiera">Cualquiera</option>
                </select>
              </div>
            </div>

            <div class="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                @click="cerrarModalPlantilla"
                class="h-10 px-4 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="guardarPlantilla"
                :disabled="!plantillaForm.nombre || !plantillaForm.sesiones || !plantillaForm.precio"
                class="h-10 px-4 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {{ editandoPlantillaIndex !== null ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  TicketIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyEuroIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  EllipsisVerticalIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  PauseIcon,
  PlayIcon,
  PlusCircleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'terapeuta',
  middleware: ['auth-terapeuta']
})

const router = useRouter()
const supabase = useSupabaseClient()
const { user } = useSupabase()
const { calcularPorcentajeUso } = useBonos()

// Estado de tabs
const activeTab = ref<'pacientes' | 'resumen' | 'plantillas' | 'bonos'>('pacientes')

// Estado para vista por paciente
const pacientesExpandidos = ref<string[]>([])

// Estado para menú contextual de bonos
const menuBonoAbierto = ref<string | null>(null)

// Estado para modales de acciones
const mostrarModalPago = ref(false)
const mostrarModalNuevoBono = ref(false)
const bonoSeleccionado = ref<any>(null)

// Estado para plantillas
const plantillas = ref<any[]>([])
const mostrarModalPlantilla = ref(false)
const editandoPlantillaIndex = ref<number | null>(null)
const plantillaForm = ref({
  nombre: '',
  descripcion: '',
  sesiones: 4,
  precio: 160,
  frecuencia: 'mensual'
})

// Estado para precios
const preciosFrecuencia = ref({
  semanal: 40,
  quincenal: 50,
  unica: 60
})
const preciosOriginales = ref({ semanal: 40, quincenal: 50, unica: 60 })
const guardandoPrecios = ref(false)
const preciosGuardados = ref(false)

const preciosCambiados = computed(() => {
  return JSON.stringify(preciosFrecuencia.value) !== JSON.stringify(preciosOriginales.value)
})

// Estado para bonos
const todosBonos = ref<any[]>([])
const cargandoBonos = ref(false)
const busquedaBono = ref('')
const filtroEstado = ref('')
const filtroPago = ref('')
const ordenBonos = ref('reciente')
const filtroEspecial = ref<'pendientes_cobro' | 'proximos_agotar' | 'urgentes' | null>(null)

// Computed - Agrupacion por tipo de bono
interface BonoEnTipo {
  bono_id: string
  paciente_id: string
  nombre: string
  sesiones_usadas: number
  sesiones_totales: number
  estado: string
  monto: number
  pagado: boolean
  created_at: string
}

interface PacienteEnTipo {
  paciente_id: string
  nombre: string
  bonoActivo: BonoEnTipo | null
  bonosHistoricos: BonoEnTipo[]
  totalBonos: number
  montoTotal: number
  montoPendiente: number
}

interface TipoBono {
  tipo: string
  pacientes: PacienteEnTipo[]
  activos: number
  completados: number
  montoTotal: number
  montoPendiente: number
  precioPromedio: number
  sesionesPromedio: number
}

// Estado para expandir historiales en vista Por Tipo
const historialesExpandidos = ref<string[]>([])

const toggleHistorial = (pacienteId: string, tipo: string) => {
  const key = `${tipo}-${pacienteId}`
  const index = historialesExpandidos.value.indexOf(key)
  if (index >= 0) {
    historialesExpandidos.value.splice(index, 1)
  } else {
    historialesExpandidos.value.push(key)
  }
}

const tiposBonos = computed<TipoBono[]>(() => {
  const agrupados = new Map<string, TipoBono>()

  for (const bono of todosBonos.value) {
    const tipo = bono.tipo || 'otro'

    if (!agrupados.has(tipo)) {
      agrupados.set(tipo, {
        tipo,
        pacientes: [],
        activos: 0,
        completados: 0,
        montoTotal: 0,
        montoPendiente: 0,
        precioPromedio: 0,
        sesionesPromedio: 0
      })
    }

    const grupo = agrupados.get(tipo)!

    // Buscar si ya existe este paciente en el grupo
    let pacienteEnGrupo = grupo.pacientes.find(p => p.paciente_id === bono.paciente_id)

    if (!pacienteEnGrupo) {
      pacienteEnGrupo = {
        paciente_id: bono.paciente_id,
        nombre: bono.paciente_nombre || 'Desconocido',
        bonoActivo: null,
        bonosHistoricos: [],
        totalBonos: 0,
        montoTotal: 0,
        montoPendiente: 0
      }
      grupo.pacientes.push(pacienteEnGrupo)
    }

    const bonoData: BonoEnTipo = {
      bono_id: bono.id,
      paciente_id: bono.paciente_id,
      nombre: bono.paciente_nombre || 'Desconocido',
      sesiones_usadas: bono.sesiones_totales - bono.sesiones_restantes,
      sesiones_totales: bono.sesiones_totales,
      estado: bono.estado,
      monto: bono.monto_total || 0,
      pagado: bono.pagado,
      created_at: bono.created_at
    }

    // Determinar si es activo o histórico
    const esActivo = bono.estado === 'activo' || (bono.estado === 'pendiente' && bono.sesiones_restantes > 0)
    const esHistorico = bono.estado === 'completado' || bono.estado === 'agotado' || bono.sesiones_restantes === 0

    if (esActivo && !pacienteEnGrupo.bonoActivo) {
      pacienteEnGrupo.bonoActivo = bonoData
    } else if (esActivo && pacienteEnGrupo.bonoActivo) {
      // Si ya hay un bono activo, el más reciente es el activo
      if (new Date(bono.created_at) > new Date(pacienteEnGrupo.bonoActivo.created_at)) {
        pacienteEnGrupo.bonosHistoricos.push(pacienteEnGrupo.bonoActivo)
        pacienteEnGrupo.bonoActivo = bonoData
      } else {
        pacienteEnGrupo.bonosHistoricos.push(bonoData)
      }
    } else {
      pacienteEnGrupo.bonosHistoricos.push(bonoData)
    }

    pacienteEnGrupo.totalBonos++
    pacienteEnGrupo.montoTotal += bono.monto_total || 0
    if (!bono.pagado) {
      pacienteEnGrupo.montoPendiente += bono.monto_total || 0
    }

    grupo.montoTotal += bono.monto_total || 0
    if (!bono.pagado) {
      grupo.montoPendiente += bono.monto_total || 0
    }
    if (bono.estado === 'activo') grupo.activos++
    if (bono.estado === 'completado' || bono.sesiones_restantes === 0) grupo.completados++
  }

  // Ordenar históricos por fecha (más recientes primero)
  for (const grupo of agrupados.values()) {
    for (const paciente of grupo.pacientes) {
      paciente.bonosHistoricos.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }
    // Calcular promedios
    if (grupo.pacientes.length > 0) {
      const totalBonos = grupo.pacientes.reduce((sum, p) => sum + p.totalBonos, 0)
      grupo.precioPromedio = grupo.montoTotal / totalBonos
      const totalSesiones = grupo.pacientes.reduce((sum, p) => {
        const sesActivo = p.bonoActivo?.sesiones_totales || 0
        const sesHistoricos = p.bonosHistoricos.reduce((s, b) => s + b.sesiones_totales, 0)
        return sum + sesActivo + sesHistoricos
      }, 0)
      grupo.sesionesPromedio = Math.round(totalSesiones / totalBonos)
    }
  }

  // Ordenar por cantidad de pacientes únicos (descendente)
  return Array.from(agrupados.values()).sort((a, b) => b.pacientes.length - a.pacientes.length)
})

// Computed - Agrupación por paciente (NUEVO)
interface PacienteConBonos {
  id: string
  nombre: string
  bonos: any[]
  sesionesUsadas: number
  sesionesTotales: number
  montoTotal: number
  montoPendiente: number
  requiereAccion: boolean
  prioridad: 'urgente' | 'atencion' | 'normal'
}

const pacientesConBonos = computed<PacienteConBonos[]>(() => {
  const agrupados = new Map<string, PacienteConBonos>()

  for (const bono of todosBonos.value) {
    const pacienteId = bono.paciente_id
    if (!pacienteId) continue

    if (!agrupados.has(pacienteId)) {
      agrupados.set(pacienteId, {
        id: pacienteId,
        nombre: bono.paciente_nombre || 'Desconocido',
        bonos: [],
        sesionesUsadas: 0,
        sesionesTotales: 0,
        montoTotal: 0,
        montoPendiente: 0,
        requiereAccion: false,
        prioridad: 'normal'
      })
    }

    const paciente = agrupados.get(pacienteId)!
    paciente.bonos.push(bono)
    paciente.sesionesUsadas += bono.sesiones_totales - bono.sesiones_restantes
    paciente.sesionesTotales += bono.sesiones_totales
    paciente.montoTotal += bono.monto_total || 0
    if (!bono.pagado) {
      paciente.montoPendiente += bono.monto_total || 0
    }

    // Determinar prioridad
    const sesionesAgotadas = bono.sesiones_restantes === 0
    const noPagado = !bono.pagado

    if (sesionesAgotadas && noPagado) {
      paciente.requiereAccion = true
      paciente.prioridad = 'urgente'
    } else if ((bono.sesiones_restantes <= 2 && bono.estado === 'activo') || noPagado) {
      paciente.requiereAccion = true
      if (paciente.prioridad !== 'urgente') {
        paciente.prioridad = 'atencion'
      }
    }
  }

  // Ordenar: urgentes primero, luego por monto pendiente
  return Array.from(agrupados.values()).sort((a, b) => {
    const prioridadOrden = { urgente: 0, atencion: 1, normal: 2 }
    const ordenA = prioridadOrden[a.prioridad]
    const ordenB = prioridadOrden[b.prioridad]
    if (ordenA !== ordenB) return ordenA - ordenB
    return b.montoPendiente - a.montoPendiente
  })
})

// Computed - Estadísticas mejoradas
const bonosActivos = computed(() => todosBonos.value.filter(b => b.estado === 'activo').length)

const estadisticasBonos = computed(() => {
  const activos = todosBonos.value.filter(b => b.estado === 'activo').length
  const pendientes = todosBonos.value.filter(b => b.estado === 'pendiente').length
  const completados = todosBonos.value.filter(b =>
    b.estado === 'completado' || b.estado === 'agotado' || b.sesiones_restantes === 0
  ).length

  const bonosSinPagar = todosBonos.value.filter(b => !b.pagado)
  const montoPendiente = bonosSinPagar.reduce((sum, b) => sum + (b.monto_total || 0), 0)

  // Próximos a agotar: activos con ≤2 sesiones restantes
  const proximosAgotar = todosBonos.value.filter(b =>
    b.estado === 'activo' && b.sesiones_restantes <= 2 && b.sesiones_restantes > 0
  ).length

  // Urgentes: sesiones agotadas pero no pagados
  const urgentes = todosBonos.value.filter(b =>
    b.sesiones_restantes === 0 && !b.pagado
  ).length

  return {
    activos,
    pendientes,
    completados,
    montoPendiente,
    bonosSinPagar: bonosSinPagar.length,
    proximosAgotar,
    urgentes
  }
})

const bonosFiltrados = computed(() => {
  let resultado = [...todosBonos.value]

  // Filtro especial desde tarjetas de estadísticas
  if (filtroEspecial.value) {
    if (filtroEspecial.value === 'pendientes_cobro') {
      resultado = resultado.filter(b => !b.pagado)
    } else if (filtroEspecial.value === 'proximos_agotar') {
      resultado = resultado.filter(b =>
        b.estado === 'activo' && b.sesiones_restantes <= 2 && b.sesiones_restantes > 0
      )
    } else if (filtroEspecial.value === 'urgentes') {
      resultado = resultado.filter(b =>
        b.sesiones_restantes === 0 && !b.pagado
      )
    }
  }

  if (busquedaBono.value) {
    const busqueda = busquedaBono.value.toLowerCase()
    resultado = resultado.filter(b =>
      b.paciente_nombre?.toLowerCase().includes(busqueda)
    )
  }

  if (filtroEstado.value) {
    resultado = resultado.filter(b => b.estado === filtroEstado.value)
  }

  // Filtro por pago
  if (filtroPago.value) {
    if (filtroPago.value === 'pagado') {
      resultado = resultado.filter(b => b.pagado)
    } else if (filtroPago.value === 'pendiente') {
      resultado = resultado.filter(b => !b.pagado)
    }
  }

  // Ordenamiento
  if (ordenBonos.value === 'reciente') {
    resultado.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (ordenBonos.value === 'antiguo') {
    resultado.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  } else if (ordenBonos.value === 'nombre') {
    resultado.sort((a, b) => (a.paciente_nombre || '').localeCompare(b.paciente_nombre || ''))
  } else if (ordenBonos.value === 'monto_desc') {
    resultado.sort((a, b) => (b.monto_total || 0) - (a.monto_total || 0))
  } else if (ordenBonos.value === 'monto_asc') {
    resultado.sort((a, b) => (a.monto_total || 0) - (b.monto_total || 0))
  } else if (ordenBonos.value === 'progreso') {
    // Ordenar por % de sesiones usadas (más usados primero)
    resultado.sort((a, b) => {
      const progresoA = a.sesiones_totales > 0 ? (a.sesiones_totales - a.sesiones_restantes) / a.sesiones_totales : 0
      const progresoB = b.sesiones_totales > 0 ? (b.sesiones_totales - b.sesiones_restantes) / b.sesiones_totales : 0
      return progresoB - progresoA
    })
  }

  return resultado
})

// Funciones de plantillas
const abrirModalNuevaPlantilla = () => {
  plantillaForm.value = {
    nombre: '',
    descripcion: '',
    sesiones: 4,
    precio: 160,
    frecuencia: 'mensual'
  }
  editandoPlantillaIndex.value = null
  mostrarModalPlantilla.value = true
}

const editarPlantilla = (index: number) => {
  const plantilla = plantillas.value[index]
  plantillaForm.value = { ...plantilla }
  editandoPlantillaIndex.value = index
  mostrarModalPlantilla.value = true
}

const eliminarPlantilla = (index: number) => {
  if (confirm('¿Eliminar esta plantilla?')) {
    plantillas.value.splice(index, 1)
    guardarPlantillasEnBD()
  }
}

const cerrarModalPlantilla = () => {
  mostrarModalPlantilla.value = false
  editandoPlantillaIndex.value = null
}

const guardarPlantilla = async () => {
  if (editandoPlantillaIndex.value !== null) {
    plantillas.value[editandoPlantillaIndex.value] = { ...plantillaForm.value }
  } else {
    plantillas.value.push({ ...plantillaForm.value })
  }

  await guardarPlantillasEnBD()
  cerrarModalPlantilla()
}

const guardarPlantillasEnBD = async () => {
  try {
    const { error } = await supabase
      .from('terapeutas')
      .update({ plantillas_bonos: plantillas.value })
      .eq('email', user.value?.email)

    if (error) throw error
  } catch (error) {
    console.error('Error al guardar plantillas:', error)
  }
}

const guardarPrecios = async () => {
  guardandoPrecios.value = true
  preciosGuardados.value = false

  try {
    const { error } = await supabase
      .from('terapeutas')
      .update({ precios_frecuencia: preciosFrecuencia.value })
      .eq('email', user.value?.email)

    if (error) throw error

    preciosOriginales.value = { ...preciosFrecuencia.value }
    preciosGuardados.value = true
    setTimeout(() => { preciosGuardados.value = false }, 2000)
  } catch (error) {
    console.error('Error al guardar precios:', error)
  } finally {
    guardandoPrecios.value = false
  }
}

// Navegación
const irABonoPaciente = (bono: any) => {
  if (!bono?.paciente_id) {
    console.error('[Bonos] ERROR: ID de paciente no válido en bono:', bono)
    return
  }
  console.log('[Bonos] Navegando a bonos del paciente:', bono.paciente_id)
  navigateTo(`/terapeuta/pacientes/${bono.paciente_id}/bonos`)
}

// Helpers
const formatearPrecio = (precio: number) => precio?.toFixed(2) || '0.00'

const frecuenciaLabel = (freq: string) => {
  const labels: Record<string, string> = {
    semanal: 'Semanal',
    quincenal: 'Quincenal',
    mensual: 'Mensual',
    cualquiera: 'Cualquiera',
    otro: 'Otro'
  }
  return labels[freq] || freq || 'Otro'
}

const frecuenciaColor = (freq: string) => {
  const colors: Record<string, string> = {
    semanal: 'bg-blue-100 text-blue-700',
    quincenal: 'bg-purple-100 text-purple-700',
    mensual: 'bg-amber-100 text-amber-700',
    cualquiera: 'bg-gray-100 text-gray-700'
  }
  return colors[freq] || 'bg-gray-100 text-gray-700'
}

const getIniciales = (nombre: string) => {
  if (!nombre) return '?'
  return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

const getEstadoTexto = (estado: string) => {
  const textos: Record<string, string> = {
    activo: 'Activo',
    pendiente: 'Pendiente',
    completado: 'Completado',
    vencido: 'Vencido',
    agotado: 'Agotado'
  }
  return textos[estado] || estado
}

const getEstadoColorTexto = (estado: string) => {
  const colores: Record<string, string> = {
    activo: 'text-green-600',
    pendiente: 'text-amber-600',
    completado: 'text-gray-600',
    vencido: 'text-red-600',
    agotado: 'text-gray-500'
  }
  return colores[estado] || 'text-gray-600'
}

const getEstadoColorPunto = (estado: string) => {
  const colores: Record<string, string> = {
    activo: 'bg-green-500',
    pendiente: 'bg-amber-500',
    completado: 'bg-gray-400',
    vencido: 'bg-red-500',
    agotado: 'bg-gray-400'
  }
  return colores[estado] || 'bg-gray-400'
}

const getProgresoColor = (bono: any) => {
  if (bono.estado === 'activo') return 'bg-purple-500'
  if (bono.estado === 'completado' || bono.estado === 'agotado') return 'bg-green-500'
  return 'bg-gray-400'
}

// Color semántico para barra de progreso basado en sesiones restantes
const getProgresoColorSemantico = (paciente: any) => {
  const restantes = paciente.sesiones_totales - paciente.sesiones_usadas
  const porcentajeRestante = (restantes / paciente.sesiones_totales) * 100

  // Rojo: agotado o menos del 25%
  if (restantes === 0 || porcentajeRestante < 25) return 'bg-red-500'
  // Amarillo: entre 25% y 50%
  if (porcentajeRestante <= 50) return 'bg-amber-500'
  // Verde: más del 50%
  return 'bg-green-500'
}

// Indicador de urgencia para vista Por Tipo
const getUrgenciaPacienteTipo = (paciente: any) => {
  const restantes = paciente.sesiones_totales - paciente.sesiones_usadas

  // Urgente: agotado y no pagado
  if (restantes === 0 && !paciente.pagado) {
    return {
      texto: 'Cobrar',
      clase: 'bg-red-100 text-red-700',
      icono: ExclamationCircleIcon
    }
  }

  // Por agotar: pagado pero pocas sesiones
  if (restantes <= 2 && restantes > 0 && paciente.pagado) {
    return {
      texto: 'Casi agotado',
      clase: 'bg-orange-100 text-orange-700',
      icono: ExclamationTriangleIcon
    }
  }

  // Atención: no pagado con sesiones activas
  if (!paciente.pagado && restantes > 0) {
    return {
      texto: 'Sin pagar',
      clase: 'bg-amber-100 text-amber-700',
      icono: ClockIcon
    }
  }

  return null
}

const getTipoBonoNombre = (tipo: string) => {
  const nombres: Record<string, string> = {
    semanal: 'Bono Semanal',
    quincenal: 'Bono Quincenal',
    mensual: 'Bono Mensual',
    '5_sesiones': 'Bono 5 Sesiones',
    '10_sesiones': 'Bono 10 Sesiones',
    personalizado: 'Bono Personalizado',
    otro: 'Otros Bonos'
  }
  return nombres[tipo] || `Bono ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`
}

const getTipoBonoColor = (tipo: string) => {
  const colores: Record<string, string> = {
    semanal: 'bg-blue-100 text-blue-600',
    quincenal: 'bg-purple-100 text-purple-600',
    mensual: 'bg-amber-100 text-amber-600',
    '5_sesiones': 'bg-emerald-100 text-emerald-600',
    '10_sesiones': 'bg-teal-100 text-teal-600',
    personalizado: 'bg-pink-100 text-pink-600',
    otro: 'bg-gray-100 text-gray-600'
  }
  return colores[tipo] || 'bg-gray-100 text-gray-600'
}

// === FUNCIONES NUEVAS PARA VISTA POR PACIENTE ===

// Toggle paciente expandido
const togglePacienteExpandido = (pacienteId: string) => {
  const index = pacientesExpandidos.value.indexOf(pacienteId)
  if (index >= 0) {
    pacientesExpandidos.value.splice(index, 1)
  } else {
    pacientesExpandidos.value.push(pacienteId)
  }
}

// Prioridad de paciente
const getPrioridadPacienteClase = (paciente: any) => {
  if (paciente.prioridad === 'urgente') return 'bg-red-100 text-red-700 border border-red-200'
  if (paciente.prioridad === 'atencion') return 'bg-amber-100 text-amber-700 border border-amber-200'
  return 'bg-gray-100 text-gray-600'
}

const getPrioridadPacienteTexto = (paciente: any) => {
  if (paciente.prioridad === 'urgente') return 'Cobro urgente'
  if (paciente.prioridad === 'atencion') return 'Requiere atención'
  return ''
}

// Estado unificado de bonos (simplifica agotado/completado)
const getEstadoUnificadoTexto = (bono: any) => {
  // Priorizar estado de pago para urgencia
  if (bono.sesiones_restantes === 0 && !bono.pagado) return 'Cobrar'
  if (bono.sesiones_restantes === 0) return 'Finalizado'
  if (bono.sesiones_restantes <= 2 && bono.estado === 'activo') return 'Por agotar'
  if (bono.estado === 'activo') return 'Activo'
  if (bono.estado === 'pendiente') return 'Sin iniciar'
  return 'Finalizado'
}

const getEstadoUnificadoClase = (bono: any) => {
  // Rojo: urgente (agotado + no pagado)
  if (bono.sesiones_restantes === 0 && !bono.pagado) return 'bg-red-100 text-red-700'
  // Verde: finalizado y pagado
  if (bono.sesiones_restantes === 0 && bono.pagado) return 'bg-green-100 text-green-700'
  // Naranja: por agotar
  if (bono.sesiones_restantes <= 2 && bono.estado === 'activo') return 'bg-orange-100 text-orange-700'
  // Azul: activo normal
  if (bono.estado === 'activo') return 'bg-blue-100 text-blue-700'
  // Amarillo: pendiente de inicio
  if (bono.estado === 'pendiente') return 'bg-amber-100 text-amber-700'
  // Gris: otros
  return 'bg-gray-100 text-gray-600'
}

const getEstadoUnificadoIcono = (bono: any) => {
  if (bono.sesiones_restantes === 0 && !bono.pagado) return ExclamationCircleIcon
  if (bono.sesiones_restantes === 0) return CheckCircleIcon
  if (bono.sesiones_restantes <= 2 && bono.estado === 'activo') return ExclamationTriangleIcon
  if (bono.estado === 'activo') return CheckCircleIcon
  if (bono.estado === 'pendiente') return ClockIcon
  return CheckIcon
}

const getProgresoColorUnificado = (bono: any) => {
  if (bono.sesiones_restantes === 0 && !bono.pagado) return 'bg-red-500'
  if (bono.sesiones_restantes === 0) return 'bg-green-500'
  if (bono.sesiones_restantes <= 2) return 'bg-orange-500'
  return 'bg-purple-500'
}

// Formatear fecha corta
const formatearFechaCorta = (fecha: string) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

// Filtros desde cards de estadísticas
const filtrarPendientesCobro = () => {
  activeTab.value = 'bonos'
  filtroEstado.value = ''
  busquedaBono.value = ''
  filtroEspecial.value = 'pendientes_cobro'
}

const filtrarProximosAgotar = () => {
  activeTab.value = 'bonos'
  filtroEstado.value = ''
  busquedaBono.value = ''
  filtroEspecial.value = 'proximos_agotar'
}

const filtrarUrgentes = () => {
  activeTab.value = 'bonos'
  filtroEstado.value = ''
  busquedaBono.value = ''
  filtroEspecial.value = 'urgentes'
}

// Limpiar filtro especial cuando se cambia de tab o se limpian filtros
const limpiarFiltros = () => {
  busquedaBono.value = ''
  filtroEstado.value = ''
  filtroPago.value = ''
  ordenBonos.value = 'reciente'
  filtroEspecial.value = null
}

// === FUNCIONES DEL MENÚ CONTEXTUAL DE BONOS ===

// Toggle menú contextual
const toggleMenuBono = (bonoId: string) => {
  if (menuBonoAbierto.value === bonoId) {
    menuBonoAbierto.value = null
  } else {
    menuBonoAbierto.value = bonoId
  }
}

// Cerrar menú al hacer clic fuera
const cerrarMenu = () => {
  menuBonoAbierto.value = null
}

// Registrar pago
const registrarPago = async (bono: any) => {
  menuBonoAbierto.value = null

  if (confirm(`¿Registrar el pago de ${bono.monto_total}€ para este bono?`)) {
    try {
      const { error } = await supabase
        .from('bonos')
        .update({ pagado: true })
        .eq('id', bono.id)

      if (error) throw error

      // Actualizar localmente
      const index = todosBonos.value.findIndex(b => b.id === bono.id)
      if (index >= 0) {
        todosBonos.value[index].pagado = true
      }
    } catch (error) {
      console.error('Error al registrar pago:', error)
      alert('Error al registrar el pago')
    }
  }
}

// Ver historial del bono
const verHistorialBono = (bono: any) => {
  menuBonoAbierto.value = null
  if (!bono?.paciente_id) {
    console.error('[Bonos] ERROR: ID de paciente no válido para historial:', bono)
    return
  }
  console.log('[Bonos] Navegando a historial del bono:', bono.id)
  navigateTo(`/terapeuta/pacientes/${bono.paciente_id}/bonos?bono=${bono.id}`)
}

// Añadir sesión al bono
const anadirSesion = (bono: any) => {
  menuBonoAbierto.value = null
  // Navegar a la agenda con el paciente preseleccionado
  console.log('[Bonos] Navegando a agenda para añadir sesión:', bono.id)
  navigateTo(`/terapeuta/agenda?paciente=${bono.paciente_id}&bono=${bono.id}`)
}

// Editar bono
const editarBono = (bono: any) => {
  menuBonoAbierto.value = null
  if (!bono?.paciente_id) {
    console.error('[Bonos] ERROR: ID de paciente no válido para editar bono:', bono)
    return
  }
  console.log('[Bonos] Navegando a editar bono:', bono.id)
  navigateTo(`/terapeuta/pacientes/${bono.paciente_id}/bonos?editar=${bono.id}`)
}

// Pausar bono
const pausarBono = async (bono: any) => {
  menuBonoAbierto.value = null

  if (confirm('¿Pausar este bono? El paciente no podrá usar las sesiones restantes mientras esté pausado.')) {
    try {
      const { error } = await supabase
        .from('bonos')
        .update({ estado: 'pausado' })
        .eq('id', bono.id)

      if (error) throw error

      // Actualizar localmente
      const index = todosBonos.value.findIndex(b => b.id === bono.id)
      if (index >= 0) {
        todosBonos.value[index].estado = 'pausado'
      }
    } catch (error) {
      console.error('Error al pausar bono:', error)
      alert('Error al pausar el bono')
    }
  }
}

// Reactivar bono
const reactivarBono = async (bono: any) => {
  menuBonoAbierto.value = null

  try {
    const { error } = await supabase
      .from('bonos')
      .update({ estado: 'activo' })
      .eq('id', bono.id)

    if (error) throw error

    // Actualizar localmente
    const index = todosBonos.value.findIndex(b => b.id === bono.id)
    if (index >= 0) {
      todosBonos.value[index].estado = 'activo'
    }
  } catch (error) {
    console.error('Error al reactivar bono:', error)
    alert('Error al reactivar el bono')
  }
}

// Crear nuevo bono (para el mismo paciente)
const crearNuevoBono = (bono: any) => {
  menuBonoAbierto.value = null
  if (!bono?.paciente_id) {
    console.error('[Bonos] ERROR: ID de paciente no válido para crear nuevo bono:', bono)
    return
  }
  console.log('[Bonos] Navegando a crear nuevo bono para paciente:', bono.paciente_id)
  navigateTo(`/terapeuta/pacientes/${bono.paciente_id}/bonos?nuevo=1&tipo=${bono.tipo}`)
}

// Confirmar eliminación de bono
const confirmarEliminarBono = async (bono: any) => {
  menuBonoAbierto.value = null

  const sesionesUsadas = bono.sesiones_totales - bono.sesiones_restantes
  if (sesionesUsadas > 0) {
    if (!confirm(`Este bono tiene ${sesionesUsadas} sesiones utilizadas. ¿Estás seguro de eliminarlo? Esta acción no se puede deshacer.`)) {
      return
    }
  } else if (!confirm('¿Eliminar este bono? Esta acción no se puede deshacer.')) {
    return
  }

  try {
    const { error } = await supabase
      .from('bonos')
      .delete()
      .eq('id', bono.id)

    if (error) throw error

    // Eliminar localmente
    todosBonos.value = todosBonos.value.filter(b => b.id !== bono.id)
  } catch (error) {
    console.error('Error al eliminar bono:', error)
    alert('Error al eliminar el bono')
  }
}

// Cargar datos
const cargarDatos = async () => {
  try {
    const { data: terapeuta } = await supabase
      .from('terapeutas')
      .select('id, plantillas_bonos, precios_frecuencia')
      .eq('email', user.value?.email)
      .single()

    if (terapeuta) {
      plantillas.value = terapeuta.plantillas_bonos || []
      if (terapeuta.precios_frecuencia) {
        preciosFrecuencia.value = terapeuta.precios_frecuencia
        preciosOriginales.value = { ...terapeuta.precios_frecuencia }
      }

      cargandoBonos.value = true

      const { data: pacientes } = await supabase
        .from('pacientes')
        .select('id, nombre_completo')
        .eq('terapeuta_id', terapeuta.id)

      if (pacientes && pacientes.length > 0) {
        const pacienteIds = pacientes.map(p => p.id)
        const pacientesMap = new Map(pacientes.map(p => [p.id, p.nombre_completo]))

        const { data: bonos } = await supabase
          .from('bonos')
          .select('*')
          .in('paciente_id', pacienteIds)
          .order('created_at', { ascending: false })

        if (bonos) {
          todosBonos.value = bonos.map(b => ({
            ...b,
            paciente_nombre: pacientesMap.get(b.paciente_id) || 'Desconocido'
          }))
        }
      }
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    cargandoBonos.value = false
  }
}

onMounted(() => {
  cargarDatos()
})
</script>
