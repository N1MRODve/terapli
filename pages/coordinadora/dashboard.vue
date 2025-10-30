<template>
  <div>
    <!-- KPIs Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Citas Hoy -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/coordinadora/agenda')">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <CalendarIcon class="w-7 h-7 text-blue-600" />
          </div>
          <span class="text-sm text-gray-500">Hoy</span>
        </div>
        <h3 class="text-3xl font-bold text-cafe mb-1">{{ citasHoy }}</h3>
        <p class="text-sm text-gray-600">Citas programadas</p>
        <div class="mt-2 text-xs text-terracota">
          {{ citasConfirmadas }} confirmadas
        </div>
      </div>

      <!-- Pacientes Activos -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/coordinadora/pacientes')">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
            <UserGroupIcon class="w-7 h-7 text-green-600" />
          </div>
          <span class="text-sm text-gray-500">Total</span>
        </div>
        <h3 class="text-3xl font-bold text-cafe mb-1">{{ totalPacientes }}</h3>
        <p class="text-sm text-gray-600">Pacientes activos</p>
        <div class="mt-2 text-xs text-gray-500">
          En seguimiento
        </div>
      </div>

      <!-- Citas Pendientes Confirmación -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/coordinadora/agenda')">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
            <ClockIcon class="w-7 h-7 text-yellow-600" />
          </div>
          <span class="text-sm text-gray-500">Por confirmar</span>
        </div>
        <h3 class="text-3xl font-bold text-cafe mb-1">{{ citasPendientes }}</h3>
        <p class="text-sm text-gray-600">Citas sin confirmar</p>
        <div class="mt-2 text-xs text-yellow-600" v-if="citasPendientes > 0">
          Requiere seguimiento
        </div>
        <div class="mt-2 text-xs text-green-600" v-else>
          Todo al día
        </div>
      </div>

      <!-- Pagos Pendientes -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/coordinadora/pagos')">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
            <CurrencyEuroIcon class="w-7 h-7 text-orange-600" />
          </div>
          <span class="text-sm text-gray-500">Pendientes</span>
        </div>
        <h3 class="text-3xl font-bold text-cafe mb-1">{{ pagosPendientes }}</h3>
        <p class="text-sm text-gray-600">Pagos por confirmar</p>
        <div class="mt-2 text-xs text-terracota" v-if="totalPendiente > 0">
          ${{ totalPendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 }) }}
        </div>
        <div class="mt-2 text-xs text-gray-500" v-else>
          Sin pendientes
        </div>
      </div>
    </div>

    <!-- Sección de Pagos Confirmados -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-serif font-bold text-cafe flex items-center gap-2">
            <span class="text-2xl">💶</span>
            Pagos Confirmados
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Bonos procesados y confirmados por coordinación
          </p>
        </div>
        <NuxtLink
          to="/coordinadora/pacientes"
          class="text-sm text-terracota hover:text-terracota/80 font-medium flex items-center gap-1"
        >
          <span>Ver todos</span>
          <span>→</span>
        </NuxtLink>
      </div>

      <!-- Resumen Financiero -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
              <CheckCircleIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-xs text-cafe/60 uppercase font-semibold tracking-wide">Bonos Confirmados</p>
              <p class="text-2xl font-bold text-cafe">{{ bonosConfirmados.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
              <BanknotesIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-xs text-cafe/60 uppercase font-semibold tracking-wide">Total Confirmado</p>
              <p class="text-2xl font-bold text-green-700">{{ formatearPrecio(totalConfirmado) }}€</p>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg p-4 border-2 border-blue-200">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <ChartBarIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-xs text-cafe/60 uppercase font-semibold tracking-wide">Promedio por Bono</p>
              <p class="text-2xl font-bold text-blue-700">{{ formatearPrecio(promedioPorBono) }}€</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Últimos Pagos -->
      <div v-if="cargando" class="text-center py-8 text-gray-400">
        <span class="text-4xl block mb-2">⏳</span>
        <p>Cargando pagos...</p>
      </div>

      <div v-else-if="bonosConfirmados.length > 0" class="space-y-3">
        <div
          v-for="bono in bonosConfirmados.slice(0, 3)"
          :key="bono.id"
          class="group relative bg-gradient-to-r from-green-50 to-transparent rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-green-100 hover:border-green-300"
          @click="abrirDetallePago(bono)"
        >
          <!-- Indicador de estado -->
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-lg"></div>

          <div class="flex items-center gap-4 ml-2">
            <!-- Avatar del paciente -->
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
              {{ obtenerIniciales(bono.paciente_nombre) }}
            </div>

            <!-- Información principal -->
            <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
              <!-- Paciente -->
              <div>
                <p class="font-semibold text-cafe">{{ bono.paciente_nombre }}</p>
                <p class="text-xs text-cafe/60">{{ bono.tipo_bono || 'Bono Estándar' }}</p>
              </div>

              <!-- Terapeuta -->
              <div>
                <p class="text-xs text-cafe/50 uppercase font-semibold mb-0.5">Terapeuta</p>
                <p class="text-sm font-medium text-cafe">{{ bono.terapeuta_nombre || 'No asignado' }}</p>
              </div>

              <!-- Monto -->
              <div>
                <p class="text-xs text-cafe/50 uppercase font-semibold mb-0.5">Monto Total</p>
                <p class="text-lg font-bold text-green-700">{{ formatearPrecio(bono.monto_total) }}€</p>
              </div>

              <!-- Fecha y método -->
              <div class="text-right">
                <p class="text-sm font-medium text-cafe flex items-center justify-end gap-1.5">
                  <span class="text-cafe/40">📅</span>
                  {{ formatearFecha(bono.fecha_pago) }}
                </p>
                <p class="text-xs text-cafe/50 capitalize mt-0.5 flex items-center justify-end gap-1.5">
                  <span>💳</span>
                  {{ bono.metodo_pago || 'No especificado' }}
                </p>
              </div>
            </div>

            <!-- Icono de acción -->
            <div class="flex-shrink-0">
              <div class="w-8 h-8 rounded-full bg-cafe/5 group-hover:bg-cafe/10 flex items-center justify-center transition-colors">
                <span class="text-cafe/40 text-sm">→</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón Ver Todos -->
        <div class="text-center pt-4" v-if="bonosConfirmados.length > 3">
          <NuxtLink
            to="/coordinadora/pacientes"
            class="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
          >
            <span>Ver todos los pagos confirmados</span>
            <span>({{ bonosConfirmados.length }})</span>
          </NuxtLink>
        </div>
      </div>

      <div v-else class="text-center py-12 text-gray-400">
        <span class="text-6xl block mb-4">📭</span>
        <h3 class="text-lg font-semibold text-cafe mb-2">
          No hay pagos confirmados aún
        </h3>
        <p class="text-gray-600 mb-4">
          Los bonos confirmados aparecerán aquí
        </p>
      </div>
    </div>

    <!-- Sección de Bonos Pendientes de Pago -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-serif font-bold text-cafe flex items-center gap-2">
            <span class="text-2xl">⏳</span>
            Bonos Pendientes de Pago
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Bonos activos sin confirmar pago
          </p>
        </div>
        <NuxtLink
          to="/coordinadora/pacientes"
          class="text-sm text-terracota hover:text-terracota/80 font-medium flex items-center gap-1"
        >
          <span>Ver todos</span>
          <span>→</span>
        </NuxtLink>
      </div>

      <!-- Resumen de Pendientes -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border-2 border-orange-200">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <ClockIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-xs text-cafe/60 uppercase font-semibold tracking-wide">Bonos Pendientes</p>
              <p class="text-2xl font-bold text-cafe">{{ bonosPendientes.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border-2 border-orange-200">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <BanknotesIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-xs text-cafe/60 uppercase font-semibold tracking-wide">Total por Confirmar</p>
              <p class="text-2xl font-bold text-orange-700">{{ formatearPrecio(totalPorConfirmar) }}€</p>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-200">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
              <BoltIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-xs text-cafe/60 uppercase font-semibold tracking-wide">Requieren Atención</p>
              <p class="text-2xl font-bold text-yellow-700">{{ bonosUrgentes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Bonos Pendientes -->
      <div v-if="cargando" class="text-center py-8 text-gray-400">
        <span class="text-4xl block mb-2">⏳</span>
        <p>Cargando bonos pendientes...</p>
      </div>

      <div v-else-if="bonosPendientes.length > 0" class="space-y-3">
        <div
          v-for="bono in bonosPendientes.slice(0, 5)"
          :key="bono.id"
          class="group relative bg-gradient-to-r from-orange-50 to-transparent rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-orange-100 hover:border-orange-300"
          @click="abrirConfirmarPago(bono)"
        >
          <!-- Indicador de estado pendiente -->
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-lg"></div>

          <div class="flex items-center gap-4 ml-2">
            <!-- Avatar del paciente -->
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
              {{ obtenerIniciales(bono.paciente_nombre) }}
            </div>

            <!-- Información principal -->
            <div class="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
              <!-- Paciente -->
              <div>
                <p class="font-semibold text-cafe">{{ bono.paciente_nombre }}</p>
                <p class="text-xs text-cafe/60">{{ bono.tipo_bono || 'Bono Estándar' }}</p>
              </div>

              <!-- Terapeuta -->
              <div>
                <p class="text-xs text-cafe/50 uppercase font-semibold mb-0.5">Terapeuta</p>
                <p class="text-sm font-medium text-cafe">{{ bono.terapeuta_nombre || 'No asignado' }}</p>
              </div>

              <!-- Estado del Bono -->
              <div>
                <p class="text-xs text-cafe/50 uppercase font-semibold mb-0.5">Estado</p>
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-700': bono.estado === 'activo',
                    'bg-yellow-100 text-yellow-700': bono.estado === 'pendiente',
                    'bg-gray-100 text-gray-700': bono.estado === 'finalizado'
                  }"
                >
                  <span v-if="bono.estado === 'activo'">●</span>
                  <span v-if="bono.estado === 'pendiente'">⏳</span>
                  <span v-if="bono.estado === 'finalizado'">✓</span>
                  <span class="capitalize">{{ bono.estado }}</span>
                </span>
              </div>

              <!-- Sesiones -->
              <div>
                <p class="text-xs text-cafe/50 uppercase font-semibold mb-0.5">Sesiones</p>
                <p class="text-sm font-medium text-cafe">{{ bono.sesiones_totales - bono.sesiones_restantes }}/{{ bono.sesiones_totales }}</p>
                <p class="text-xs text-cafe/50">{{ bono.sesiones_restantes }} restantes</p>
              </div>

              <!-- Monto -->
              <div class="text-right">
                <p class="text-xs text-cafe/50 uppercase font-semibold mb-0.5">Monto</p>
                <p class="text-lg font-bold text-orange-700">{{ formatearPrecio(bono.monto_total) }}€</p>
                <p class="text-xs text-cafe/50">Por confirmar</p>
              </div>
            </div>

            <!-- Botón de acción -->
            <div class="flex-shrink-0">
              <button
                @click.stop="confirmarPagoRapido(bono)"
                class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <span>💳</span>
                <span>Confirmar</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Botón Ver Todos -->
        <div class="text-center pt-4" v-if="bonosPendientes.length > 5">
          <NuxtLink
            to="/coordinadora/pacientes"
            class="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors font-medium text-sm"
          >
            <span>Ver todos los bonos pendientes</span>
            <span>({{ bonosPendientes.length }})</span>
          </NuxtLink>
        </div>
      </div>

      <div v-else class="text-center py-12 text-gray-400">
        <span class="text-6xl block mb-4">✅</span>
        <h3 class="text-lg font-semibold text-cafe mb-2">
          ¡Todo al día!
        </h3>
        <p class="text-gray-600 mb-4">
          No hay bonos pendientes de confirmar pago
        </p>
      </div>
    </div>

    <!-- Sección de Citas por Confirmar -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <!-- Header limpio y elegante -->
      <div class="px-8 py-6 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-arena rounded-xl flex items-center justify-center">
              <ClockIcon class="w-7 h-7 text-terracota" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-cafe">
                Citas pendientes de confirmación
              </h2>
              <p class="text-sm text-cafe/60 mt-0.5">
                Gestiona las citas que requieren confirmación con el paciente
              </p>
            </div>
          </div>
          <NuxtLink
            to="/coordinadora/agenda"
            class="text-sm text-terracota hover:text-terracota/80 font-medium transition-colors flex items-center gap-1"
          >
            <span>Ver agenda completa</span>
            <span>→</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Métricas compactas y cálidas -->
      <div class="px-8 py-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <!-- Pendientes -->
          <div class="bg-arena/30 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-terracota/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClockIcon class="w-6 h-6 text-terracota" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-2xl font-semibold text-cafe">{{ citasPorConfirmar.length }}</p>
                <p class="text-xs text-cafe/60 font-medium">Pendientes</p>
              </div>
            </div>
          </div>

          <!-- Urgentes -->
          <div class="bg-orange-50/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BoltIcon class="w-6 h-6 text-orange-600" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-2xl font-semibold text-cafe">{{ citasUrgentesCount }}</p>
                <p class="text-xs text-cafe/60 font-medium">Urgentes</p>
              </div>
            </div>
          </div>

          <!-- Próxima Cita -->
          <div class="bg-verde/10 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-verde/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CalendarIcon class="w-6 h-6 text-verde" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-lg font-semibold text-cafe truncate">{{ proximaCitaTiempo }}</p>
                <p class="text-xs text-cafe/60 font-medium">Próxima cita</p>
              </div>
            </div>
          </div>

          <!-- WhatsApp Listos -->
          <div class="bg-green-50/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ChatBubbleLeftRightIcon class="w-6 h-6 text-green-600" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-2xl font-semibold text-cafe">{{ citasConWhatsApp }}</p>
                <p class="text-xs text-cafe/60 font-medium">Listas para confirmar</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de Citas por Confirmar -->
        <div v-if="cargando" class="text-center py-12">
          <div class="inline-flex flex-col items-center gap-3">
            <div class="w-12 h-12 border-3 border-terracota/20 border-t-terracota rounded-full animate-spin"></div>
            <p class="text-cafe/60 font-medium text-sm">Cargando citas...</p>
          </div>
        </div>

        <div v-else-if="citasPorConfirmar.length > 0" class="space-y-3">
          <!-- Tarjetas de citas con diseño horizontal limpio -->
          <div
            v-for="cita in citasPorConfirmar.slice(0, 6)"
            :key="cita.id"
            class="group bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <!-- Indicador de estado lateral -->
            <div class="flex items-stretch">
              <div 
                class="w-1 flex-shrink-0"
                :class="{
                  'bg-terracota': cita.esUrgente,
                  'bg-verde': !cita.esUrgente
                }"
              ></div>

              <div class="flex-1 p-5">
                <div class="flex items-center gap-4">
                  <!-- Avatar con iniciales -->
                  <div class="flex-shrink-0">
                    <div 
                      class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-sm"
                      :class="{
                        'bg-terracota': cita.esUrgente,
                        'bg-cafe/80': !cita.esUrgente
                      }"
                    >
                      {{ obtenerIniciales(cita.paciente.nombre) }}
                    </div>
                  </div>

                  <!-- Información principal (horizontal) -->
                  <div class="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <!-- Columna 1: Paciente y Terapeuta -->
                    <div class="md:col-span-2">
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-semibold text-cafe">{{ cita.paciente.nombre }}</h4>
                        <span 
                          v-if="cita.esUrgente" 
                          class="px-2 py-0.5 bg-terracota/10 text-terracota text-xs font-medium rounded-full"
                        >
                          Urgente
                        </span>
                        <span 
                          v-if="cita.listaParaConfirmar" 
                          class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full animate-pulse"
                        >
                          <span>🔔</span>
                          <span>Lista para confirmar</span>
                        </span>
                      </div>
                      <p class="text-sm text-cafe/60">{{ cita.terapeuta.nombre }}</p>
                    </div>

                    <!-- Columna 2: Fecha y Hora -->
                    <div>
                      <p class="text-sm font-medium text-cafe mb-0.5">{{ formatearFechaCita(cita.fecha) }}</p>
                      <p class="text-sm text-cafe/60">{{ cita.hora_inicio }}</p>
                    </div>

                    <!-- Columna 3: Modalidad -->
                    <div>
                      <span 
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                        :class="{
                          'bg-purple-50 text-purple-700': cita.modalidad === 'online',
                          'bg-verde/10 text-verde': cita.modalidad === 'presencial'
                        }"
                      >
                        <span>{{ cita.modalidad === 'online' ? '💻' : '🏥' }}</span>
                        <span class="capitalize">{{ cita.modalidad }}</span>
                      </span>
                    </div>

                    <!-- Columna 4: Tiempo restante -->
                    <div class="text-right">
                      <p 
                        class="text-sm font-semibold"
                        :class="{
                          'text-terracota': cita.esUrgente,
                          'text-cafe/70': !cita.esUrgente
                        }"
                      >
                        {{ calcularTiempoRestante(cita.fecha, cita.hora_inicio) }}
                      </p>
                      <p class="text-xs text-cafe/50">restante</p>
                    </div>
                  </div>

                  <!-- Acciones compactas -->
                  <div class="flex-shrink-0 flex items-center gap-2">
                    <!-- WhatsApp con indicador de alerta -->
                    <div class="relative">
                      <button
                        v-if="cita.paciente.telefono"
                        @click="enviarWhatsApp(cita)"
                        :class="[
                          'p-2.5 rounded-lg transition-colors',
                          cita.listaParaConfirmar 
                            ? 'bg-green-500 text-white hover:bg-green-600 animate-pulse' 
                            : 'bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white'
                        ]"
                        :title="cita.listaParaConfirmar ? '¡Lista para confirmar! Enviar WhatsApp' : 'Enviar WhatsApp'"
                      >
                        <span class="text-lg">💬</span>
                      </button>
                      <!-- Badge de alerta (24h antes) -->
                      <span 
                        v-if="cita.listaParaConfirmar"
                        class="absolute -top-1 -right-1 flex h-3 w-3"
                      >
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    </div>

                    <!-- Confirmar -->
                    <button
                      @click="marcarComoConfirmada(cita)"
                      class="p-2.5 bg-verde/10 text-verde hover:bg-verde hover:text-white rounded-lg transition-colors"
                      title="Confirmar cita"
                    >
                      <span class="text-lg">✓</span>
                    </button>

                    <!-- Cancelar -->
                    <button
                      @click="abrirModalCancelar(cita)"
                      class="p-2.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                      title="Cancelar cita"
                    >
                      <span class="text-lg">✕</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón Ver Todas -->
          <div class="text-center pt-4" v-if="citasPorConfirmar.length > 6">
            <NuxtLink
              to="/coordinadora/agenda"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-terracota/10 text-terracota hover:bg-terracota hover:text-white rounded-lg transition-colors font-medium text-sm"
            >
              <span>Ver todas las citas pendientes</span>
              <span class="px-2 py-0.5 bg-white/60 rounded-full text-xs font-semibold">{{ citasPorConfirmar.length }}</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="text-center py-16">
          <div class="inline-flex flex-col items-center gap-4">
            <div class="w-20 h-20 bg-verde/10 rounded-2xl flex items-center justify-center">
              <SparklesIcon class="w-12 h-12 text-verde" />
            </div>
            <div class="space-y-1">
              <h3 class="text-lg font-semibold text-cafe">
                No hay citas pendientes por confirmar
              </h3>
              <p class="text-sm text-cafe/60 max-w-sm">
                Todo está organizado, puedes revisar la agenda completa
              </p>
            </div>
            <NuxtLink
              to="/coordinadora/agenda"
              class="mt-2 px-5 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors font-medium text-sm"
            >
              Ver agenda
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de Citas Confirmadas -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <!-- Header limpio -->
      <div class="px-8 py-6 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-verde/10 rounded-xl flex items-center justify-center">
              <CheckCircleIcon class="w-7 h-7 text-verde" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-cafe">
                Citas confirmadas
              </h2>
              <p class="text-sm text-cafe/60 mt-0.5">
                Citas ya confirmadas con los pacientes
              </p>
            </div>
          </div>
          <NuxtLink
            to="/coordinadora/agenda?estado=confirmada"
            class="text-sm text-verde hover:text-verde/80 font-medium transition-colors flex items-center gap-1"
          >
            <span>Ver todas</span>
            <span>→</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Métricas compactas -->
      <div class="px-8 py-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <!-- Total Confirmadas -->
          <div class="bg-verde/10 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-verde/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon class="w-6 h-6 text-verde" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-2xl font-semibold text-cafe">{{ citasConfirmadasDetalle.length }}</p>
                <p class="text-xs text-cafe/60 font-medium">Confirmadas</p>
              </div>
            </div>
          </div>

          <!-- Próximas 7 días -->
          <div class="bg-blue-50/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CalendarIcon class="w-6 h-6 text-blue-600" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-2xl font-semibold text-cafe">{{ citasProximos7Dias }}</p>
                <p class="text-xs text-cafe/60 font-medium">Próximos 7 días</p>
              </div>
            </div>
          </div>

          <!-- Hoy confirmadas -->
          <div class="bg-purple-50/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClockIcon class="w-6 h-6 text-purple-600" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-2xl font-semibold text-cafe">{{ citasConfirmadasHoy }}</p>
                <p class="text-xs text-cafe/60 font-medium">Hoy</p>
              </div>
            </div>
          </div>

          <!-- Recordatorios listos (dentro de 4 horas) -->
          <div class="bg-amber-50/50 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ChatBubbleLeftRightIcon class="w-6 h-6 text-amber-600" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-2xl font-semibold text-cafe">{{ citasListasParaRecordatorio }}</p>
                <p class="text-xs text-cafe/60 font-medium">Recordatorios listos</p>
              </div>
            </div>
          </div>
        </div>

      <!-- Lista de Citas Confirmadas -->
      <div v-if="citasConfirmadasDetalle.length > 0">
        <div class="space-y-3">
          <div
            v-for="cita in citasConfirmadasDetalle.slice(0, 8)"
            :key="cita.id"
            class="group bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <!-- Indicador de estado lateral -->
            <div class="flex items-stretch">
              <div class="w-1 bg-verde flex-shrink-0"></div>

              <div class="flex-1 p-5">
                <div class="flex items-center gap-4">
                  <!-- Avatar con check -->
                  <div class="flex-shrink-0 relative">
                    <div class="w-12 h-12 rounded-full bg-verde flex items-center justify-center text-white font-semibold shadow-sm">
                      {{ obtenerIniciales(cita.paciente.nombre) }}
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <span class="text-verde text-xs">✓</span>
                    </div>
                  </div>

                  <!-- Información principal (horizontal) -->
                  <div class="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <!-- Columna 1: Paciente y Terapeuta -->
                    <div class="md:col-span-2">
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-semibold text-cafe">{{ cita.paciente.nombre }}</h4>
                        <span 
                          v-if="cita.listaParaRecordatorio" 
                          class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full animate-pulse"
                        >
                          <span>⏰</span>
                          <span>Enviar recordatorio</span>
                        </span>
                      </div>
                      <p class="text-sm text-cafe/60">{{ cita.terapeuta.nombre }}</p>
                    </div>

                    <!-- Columna 2: Fecha y Hora -->
                    <div>
                      <p class="text-sm font-medium text-cafe mb-0.5">{{ formatearFechaCita(cita.fecha) }}</p>
                      <p class="text-sm text-cafe/60">{{ cita.hora_inicio }}</p>
                    </div>

                    <!-- Columna 3: Modalidad -->
                    <div>
                      <span 
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                        :class="{
                          'bg-purple-50 text-purple-700': cita.modalidad === 'online',
                          'bg-verde/10 text-verde': cita.modalidad === 'presencial'
                        }"
                      >
                        <span>{{ cita.modalidad === 'online' ? '💻' : '🏥' }}</span>
                        <span class="capitalize">{{ cita.modalidad }}</span>
                      </span>
                    </div>

                    <!-- Columna 4: Badge confirmada -->
                    <div class="text-right">
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-verde/10 text-verde rounded-full text-xs font-medium">
                        <span>✓</span>
                        <span>Confirmada</span>
                      </span>
                    </div>
                  </div>

                  <!-- Acciones: Recordatorio y Revertir -->
                  <div class="flex-shrink-0 flex items-center gap-2">
                    <!-- WhatsApp Recordatorio (solo si está dentro de 4h) -->
                    <div v-if="cita.paciente.telefono" class="relative">
                      <button
                        @click="enviarRecordatorio(cita)"
                        :class="[
                          'p-2.5 rounded-lg transition-colors',
                          cita.listaParaRecordatorio 
                            ? 'bg-blue-500 text-white hover:bg-blue-600 animate-pulse' 
                            : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white'
                        ]"
                        :title="cita.listaParaRecordatorio ? '¡Lista para recordatorio! Enviar WhatsApp' : 'Enviar recordatorio por WhatsApp'"
                      >
                        <span class="text-lg">💬</span>
                      </button>
                      <!-- Badge de alerta (4h antes) -->
                      <span 
                        v-if="cita.listaParaRecordatorio"
                        class="absolute -top-1 -right-1 flex h-3 w-3"
                      >
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </span>
                    </div>

                    <!-- Revertir -->
                    <button
                      @click="revertirConfirmacion(cita)"
                      class="p-2.5 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white rounded-lg transition-colors"
                      title="Volver a pendiente"
                    >
                      <span class="text-lg">↺</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón Ver Todas -->
        <div class="text-center pt-4" v-if="citasConfirmadasDetalle.length > 8">
          <NuxtLink
            to="/coordinadora/agenda?estado=confirmada"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-verde/10 text-verde hover:bg-verde hover:text-white rounded-lg transition-colors font-medium text-sm"
          >
            <span>Ver todas las confirmadas</span>
            <span class="px-2 py-0.5 bg-white/60 rounded-full text-xs font-semibold">{{ citasConfirmadasDetalle.length }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-16">
        <div class="inline-flex flex-col items-center gap-4">
          <div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
            <span class="text-4xl">📋</span>
          </div>
          <div class="space-y-1">
            <h3 class="text-lg font-semibold text-cafe">
              No hay citas confirmadas
            </h3>
            <p class="text-sm text-cafe/60 max-w-sm">
              Las citas confirmadas con los pacientes aparecerán aquí
            </p>
          </div>
          <NuxtLink
            to="/coordinadora/agenda"
            class="mt-2 px-5 py-2 bg-verde text-white rounded-lg hover:bg-verde/90 transition-colors font-medium text-sm"
          >
            Ver agenda completa
          </NuxtLink>
        </div>
      </div>
      </div>
    </div>

    <!-- Citas de Hoy -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-serif font-bold text-cafe">
          Citas de Hoy
        </h2>
        <NuxtLink
          to="/coordinadora/agenda"
          class="text-sm text-terracota hover:text-terracota/80 font-medium flex items-center gap-1"
        >
          <span>Ver agenda completa</span>
          <span>→</span>
        </NuxtLink>
      </div>

      <div v-if="cargando" class="text-center py-12 text-gray-400">
        <span class="text-4xl block mb-2">⏳</span>
        <p>Cargando datos...</p>
      </div>

      <div v-else-if="citasHoyDetalle.length > 0" class="space-y-3">
        <div
          v-for="cita in citasHoyDetalle"
          :key="cita.id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center gap-4 flex-1">
            <div class="text-center min-w-[70px]">
              <p class="text-sm font-bold text-cafe">{{ cita.hora_inicio }}</p>
              <p class="text-xs text-gray-500 capitalize">{{ cita.modalidad }}</p>
            </div>

            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-terracota to-cafe flex items-center justify-center flex-shrink-0">
              <span class="text-white text-sm font-semibold">
                {{ obtenerIniciales(cita.paciente_nombre) }}
              </span>
            </div>

            <div class="flex-1">
              <p class="font-medium text-cafe">{{ cita.paciente_nombre }}</p>
              <p class="text-sm text-gray-600" v-if="cita.observaciones">
                {{ cita.observaciones.substring(0, 50) }}{{ cita.observaciones.length > 50 ? '...' : '' }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="getEstadoClasses(cita.estado)"
              >
                {{ getEstadoLabel(cita.estado) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 text-gray-400">
        <span class="text-6xl block mb-4">�</span>
        <h3 class="text-lg font-semibold text-cafe mb-2">
          No hay citas programadas para hoy
        </h3>
        <p class="text-gray-600 mb-4">
          Puedes revisar la agenda completa o programar una nueva cita
        </p>
        <NuxtLink
          to="/coordinadora/agenda"
          class="inline-flex items-center px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors"
        >
          <span class="mr-2">+</span>
          Ver Agenda
        </NuxtLink>
      </div>
    </div>

    <!-- Resumen de Actividad -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Próximas Citas (7 días) -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-serif font-bold text-cafe mb-4">
          Próximos 7 días
        </h2>
        <div v-if="proximasCitas.length > 0" class="space-y-3">
          <div
            v-for="cita in proximasCitas.slice(0, 5)"
            :key="cita.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-1">
              <p class="font-medium text-cafe text-sm">{{ cita.paciente_nombre }}</p>
              <p class="text-xs text-gray-500">
                {{ formatearFecha(cita.fecha_cita) }} · {{ cita.hora_inicio }}
              </p>
            </div>
            <span
              class="px-2 py-1 rounded-full text-xs font-medium"
              :class="getEstadoClasses(cita.estado)"
            >
              {{ getEstadoLabel(cita.estado) }}
            </span>
          </div>
          <div v-if="proximasCitas.length > 5" class="text-center pt-2">
            <NuxtLink
              to="/coordinadora/agenda"
              class="text-sm text-terracota hover:text-terracota/80 font-medium"
            >
              Ver todas ({{ proximasCitas.length }})
            </NuxtLink>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-400">
          <p class="text-sm">No hay citas próximas</p>
        </div>
      </div>

      <!-- Estadísticas Rápidas -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-serif font-bold text-cafe mb-4">
          Estadísticas del Mes
        </h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📊</span>
              <span class="text-sm font-medium text-cafe">Total de citas</span>
            </div>
            <span class="text-lg font-bold text-cafe">{{ citasMes }}</span>
          </div>

          <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div class="flex items-center gap-3">
              <span class="text-2xl">✅</span>
              <span class="text-sm font-medium text-cafe">Completadas</span>
            </div>
            <span class="text-lg font-bold text-green-600">{{ citasCompletadas }}</span>
          </div>

          <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div class="flex items-center gap-3">
              <span class="text-2xl">❌</span>
              <span class="text-sm font-medium text-cafe">Canceladas</span>
            </div>
            <span class="text-lg font-bold text-red-600">{{ citasCanceladas }}</span>
          </div>

          <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div class="flex items-center gap-3">
              <span class="text-2xl">💰</span>
              <span class="text-sm font-medium text-cafe">Ingresos mes</span>
            </div>
            <span class="text-lg font-bold text-cafe">${{ ingresosMes.toLocaleString('es-MX') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalle de Pago -->
    <Teleport to="body">
      <div
        v-if="modalDetalleAbierto"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="cerrarDetallePago"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Header del Modal -->
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-6 py-5 sticky top-0 z-10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
                  <span class="text-2xl">💶</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-cafe">Detalle de Pago Confirmado</h3>
                  <p class="text-sm text-cafe/60">Información completa del bono</p>
                </div>
              </div>
              <button
                @click="cerrarDetallePago"
                class="w-10 h-10 rounded-lg bg-white/80 hover:bg-white border border-green-200 flex items-center justify-center text-cafe hover:text-cafe/80 transition-all"
              >
                <span class="text-xl">×</span>
              </button>
            </div>
          </div>

          <!-- Contenido del Modal -->
          <div class="p-6 space-y-6" v-if="bonoSeleccionado">
            <!-- Estado Visual -->
            <div class="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <span class="text-3xl">✓</span>
              <div>
                <p class="font-bold text-green-700 text-lg">Pago Confirmado</p>
                <p class="text-sm text-cafe/60">Este bono ha sido procesado y confirmado</p>
              </div>
            </div>

            <!-- Información en 2 Columnas -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Columna Izquierda: Información del Paciente y Terapeuta -->
              <div class="space-y-4">
                <!-- Paciente -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-xs text-cafe/40 uppercase font-bold tracking-wider mb-3">👤 Paciente</p>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-sm text-cafe/60">Nombre:</span>
                      <span class="font-semibold text-cafe">{{ bonoSeleccionado.paciente_nombre }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-cafe/60">Email:</span>
                      <span class="text-sm text-cafe truncate max-w-[180px]" :title="bonoSeleccionado.paciente_email">
                        {{ bonoSeleccionado.paciente_email || 'No disponible' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Terapeuta -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-xs text-cafe/40 uppercase font-bold tracking-wider mb-3">👩‍⚕️ Terapeuta</p>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-sm text-cafe/60">Nombre:</span>
                      <span class="font-semibold text-cafe">{{ bonoSeleccionado.terapeuta_nombre || 'No asignado' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-cafe/60">Porcentaje:</span>
                      <span class="font-semibold text-green-700">70%</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-cafe/60">Su parte:</span>
                      <span class="font-bold text-green-700">{{ formatearPrecio(bonoSeleccionado.monto_total * 0.7) }}€</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Columna Derecha: Detalles del Bono y Pago -->
              <div class="space-y-4">
                <!-- Detalles del Bono -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-xs text-cafe/40 uppercase font-bold tracking-wider mb-3">🧾 Detalles del Bono</p>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-sm text-cafe/60">Tipo:</span>
                      <span class="font-semibold text-cafe">{{ bonoSeleccionado.tipo_bono || 'Estándar' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-cafe/60">Sesiones totales:</span>
                      <span class="font-semibold text-cafe">{{ bonoSeleccionado.sesiones_totales }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-cafe/60">Sesiones restantes:</span>
                      <span class="font-semibold text-cafe">{{ bonoSeleccionado.sesiones_restantes }}</span>
                    </div>
                    <div class="flex justify-between pt-2 border-t border-gray-200">
                      <span class="text-sm text-cafe/60">Monto total:</span>
                      <span class="font-bold text-cafe text-lg">{{ formatearPrecio(bonoSeleccionado.monto_total) }}€</span>
                    </div>
                  </div>
                </div>

                <!-- Información de Pago -->
                <div class="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <p class="text-xs text-cafe/40 uppercase font-bold tracking-wider mb-3">💳 Información de Pago</p>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-sm text-cafe/60">Método:</span>
                      <span class="font-semibold text-cafe capitalize">{{ bonoSeleccionado.metodo_pago || 'No especificado' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-cafe/60">Fecha confirmación:</span>
                      <span class="font-semibold text-cafe">{{ formatearFechaCompleta(bonoSeleccionado.fecha_pago) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-cafe/60">Estado:</span>
                      <span class="inline-flex items-center gap-1.5 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                        <span>✓</span>
                        <span>Confirmado</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                @click="cerrarDetallePago"
                class="px-6 py-2.5 bg-gray-100 text-cafe rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cerrar
              </button>
              <button
                @click="confirmarRevertirPago"
                class="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <span>⚠️</span>
                <span>Desmarcar Pago</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de Confirmación para Revertir Pago -->
    <Teleport to="body">
      <div
        v-if="modalConfirmacionRevertir"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
        @click.self="cancelarRevertirPago"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full"
          @click.stop
        >
          <!-- Header de Advertencia -->
          <div class="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 px-6 py-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                <span class="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-cafe">¿Revertir Pago Confirmado?</h3>
                <p class="text-sm text-cafe/60">Esta acción se puede deshacer</p>
              </div>
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-6">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p class="text-sm text-cafe mb-2">
                Estás a punto de <strong>desmarcar como pagado</strong> el bono de:
              </p>
              <p class="font-bold text-cafe text-lg">{{ bonoSeleccionado?.paciente_nombre }}</p>
              <p class="text-sm text-cafe/60 mt-1">
                Monto: <span class="font-bold text-red-700">{{ formatearPrecio(bonoSeleccionado?.monto_total || 0) }}€</span>
              </p>
            </div>

            <p class="text-sm text-gray-600 mb-4">
              El estado del bono volverá a <strong>"Sin Pagar"</strong> y se eliminará:
            </p>
            <ul class="text-sm text-gray-600 space-y-2 mb-6">
              <li class="flex items-start gap-2">
                <span class="text-red-500 flex-shrink-0 mt-0.5">•</span>
                <span>La fecha de confirmación de pago</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-red-500 flex-shrink-0 mt-0.5">•</span>
                <span>El método de pago registrado</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-red-500 flex-shrink-0 mt-0.5">•</span>
                <span>La información del usuario que confirmó</span>
              </li>
            </ul>

            <!-- Acciones -->
            <div class="flex items-center gap-3">
              <button
                @click="cancelarRevertirPago"
                class="flex-1 px-4 py-2.5 bg-gray-100 text-cafe rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                @click="ejecutarRevertirPago"
                :disabled="procesandoReversion"
                class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span v-if="procesandoReversion" class="animate-spin">⏳</span>
                <span v-else>✓</span>
                <span>{{ procesandoReversion ? 'Procesando...' : 'Sí, Revertir' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de Cancelación de Cita -->
    <Teleport to="body">
      <div
        v-if="modalCancelarCita"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
        @click.self="cerrarModalCancelar"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full"
          @click.stop
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 px-6 py-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                <span class="text-2xl">🗓️</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-cafe">Cancelar Cita</h3>
                <p class="text-sm text-cafe/60">Esta acción cambiará el estado de la cita</p>
              </div>
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-6">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p class="text-sm text-cafe mb-2">
                <strong>Paciente:</strong> {{ citaSeleccionada?.paciente?.nombre }}
              </p>
              <p class="text-sm text-cafe mb-2">
                <strong>Terapeuta:</strong> {{ citaSeleccionada?.terapeuta?.nombre }}
              </p>
              <p class="text-sm text-cafe mb-2">
                <strong>Fecha:</strong> {{ formatearFechaCita(citaSeleccionada?.fecha) }}
              </p>
              <p class="text-sm text-cafe">
                <strong>Hora:</strong> {{ citaSeleccionada?.hora_inicio }}
              </p>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-cafe mb-2">
                Motivo de cancelación (opcional)
              </label>
              <textarea
                v-model="motivoCancelacion"
                rows="3"
                placeholder="Describe el motivo de la cancelación..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            <p class="text-sm text-gray-600 mb-6">
              La cita será marcada como <strong class="text-red-600">"cancelada"</strong> y ya no aparecerá en la lista de citas pendientes.
            </p>

            <!-- Acciones -->
            <div class="flex items-center gap-3">
              <button
                @click="cerrarModalCancelar"
                class="flex-1 px-4 py-2.5 bg-gray-100 text-cafe rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Volver
              </button>
              <button
                @click="confirmarCancelarCita"
                :disabled="procesandoCancelacion"
                class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span v-if="procesandoCancelacion" class="animate-spin">⏳</span>
                <span v-else>✕</span>
                <span>{{ procesandoCancelacion ? 'Cancelando...' : 'Cancelar Cita' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Notificación Toast -->
    <Teleport to="body">
      <div
        v-if="notificacion.visible"
        class="fixed top-4 right-4 z-[70] animate-[slideIn_0.3s_ease-out]"
      >
        <div
          class="bg-white rounded-lg shadow-2xl border-l-4 p-4 min-w-[320px] max-w-md"
          :class="{
            'border-green-500': notificacion.tipo === 'success',
            'border-red-500': notificacion.tipo === 'error'
          }"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="{
                'bg-green-100': notificacion.tipo === 'success',
                'bg-red-100': notificacion.tipo === 'error'
              }"
            >
              <span class="text-2xl">
                {{ notificacion.tipo === 'success' ? '✓' : '✗' }}
              </span>
            </div>
            <div class="flex-1">
              <p
                class="font-bold mb-1"
                :class="{
                  'text-green-700': notificacion.tipo === 'success',
                  'text-red-700': notificacion.tipo === 'error'
                }"
              >
                {{ notificacion.titulo }}
              </p>
              <p class="text-sm text-cafe/70">{{ notificacion.mensaje }}</p>
            </div>
            <button
              @click="notificacion.visible = false"
              class="text-cafe/40 hover:text-cafe/60 transition-colors"
            >
              <span class="text-xl">×</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import {
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  BanknotesIcon,
  ChartBarIcon,
  BoltIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

definePageMeta({
  layout: 'coordinadora',
  middleware: ['auth', 'role-coordinadora']
})

// Estado
const cargando = ref(true)
const citasHoy = ref(0)
const citasConfirmadas = ref(0)
const citasPendientes = ref(0)
const totalPacientes = ref(0)
const pagosPendientes = ref(0)
const totalPendiente = ref(0)
const citasHoyDetalle = ref([])
const proximasCitas = ref([])
const citasMes = ref(0)
const citasCompletadas = ref(0)
const citasCanceladas = ref(0)
const ingresosMes = ref(0)

// Estado para Pagos Confirmados
const bonosConfirmados = ref([])
const totalConfirmado = ref(0)
const promedioPorBono = ref(0)
const modalDetalleAbierto = ref(false)
const bonoSeleccionado = ref(null)
const modalConfirmacionRevertir = ref(false)
const procesandoReversion = ref(false)
const notificacion = ref({
  visible: false,
  tipo: 'success', // 'success' | 'error'
  titulo: '',
  mensaje: ''
})

// Estado para Bonos Pendientes
const bonosPendientes = ref([])
const totalPorConfirmar = ref(0)
const bonosUrgentes = ref(0)
const modalConfirmarPago = ref(false)
const metodoPagoSeleccionado = ref('')

// Estado para Citas por Confirmar
const citasPorConfirmar = ref([])
const citasUrgentesCount = ref(0)
const proximaCitaTiempo = ref('--')
const citasConWhatsApp = ref(0)

// Estado para modal de cancelación
const modalCancelarCita = ref(false)
const citaSeleccionada = ref(null)
const motivoCancelacion = ref('')
const procesandoCancelacion = ref(false)

// Estado para Citas Confirmadas (detalle)
const citasConfirmadasDetalle = ref([])
const citasProximos7Dias = ref(0)
const citasConfirmadasHoy = ref(0)
const citasOnlineConfirmadas = ref(0)
const citasPresencialConfirmadas = ref(0)
const citasListasParaRecordatorio = ref(0)

// Función helper para mostrar notificaciones
const mostrarNotificacion = (titulo, mensaje, tipo = 'success') => {
  notificacion.value = {
    visible: true,
    tipo: tipo,
    titulo: titulo,
    mensaje: mensaje
  }
  
  // Ocultar después de 5 segundos
  setTimeout(() => {
    notificacion.value.visible = false
  }, 5000)
}

// Funciones auxiliares
const obtenerIniciales = (nombre) => {
  if (!nombre) return 'PA'
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  })
}

const formatearFechaCompleta = (fecha) => {
  if (!fecha) return 'No disponible'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatearPrecio = (precio) => {
  if (!precio) return '0.00'
  return Number(precio).toFixed(2)
}

const formatearFechaCita = (fecha) => {
  if (!fecha) return 'Sin fecha'
  const date = new Date(fecha)
  const hoy = new Date()
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)
  
  // Resetear horas para comparación
  hoy.setHours(0, 0, 0, 0)
  manana.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  
  if (date.getTime() === hoy.getTime()) {
    return 'Hoy'
  } else if (date.getTime() === manana.getTime()) {
    return 'Mañana'
  } else {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    })
  }
}

const calcularTiempoRestante = (fecha, hora) => {
  if (!fecha || !hora) return '--'
  
  const ahora = new Date()
  const fechaCita = new Date(`${fecha}T${hora}`)
  const diff = fechaCita - ahora
  
  if (diff < 0) return 'Pasada'
  
  const horas = Math.floor(diff / (1000 * 60 * 60))
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (horas < 1) {
    return `${minutos}min`
  } else if (horas < 24) {
    return `${horas}h ${minutos}min`
  } else {
    const dias = Math.floor(horas / 24)
    return `${dias} día${dias > 1 ? 's' : ''}`
  }
}

// Verificar si la cita está dentro de las próximas 24 horas (lista para confirmar)
const estaListaParaConfirmar = (fecha, hora) => {
  if (!fecha || !hora) return false
  
  const ahora = new Date()
  const fechaCita = new Date(`${fecha}T${hora}`)
  const diff = fechaCita - ahora
  
  // Está dentro de las próximas 24 horas (86400000 ms = 24 horas)
  const dentroD24Horas = diff > 0 && diff <= 86400000
  
  return dentroD24Horas
}

// Verificar si la cita confirmada está dentro de las próximas 4 horas (lista para recordatorio)
const estaListaParaRecordatorio = (fecha, hora) => {
  if (!fecha || !hora) return false
  
  const ahora = new Date()
  const fechaCita = new Date(`${fecha}T${hora}`)
  const diff = fechaCita - ahora
  
  // Está dentro de las próximas 4 horas (14400000 ms = 4 horas)
  const dentro4Horas = diff > 0 && diff <= 14400000
  
  return dentro4Horas
}

const getEstadoLabel = (estado) => {
  const labels = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    cancelada: 'Cancelada',
    completada: 'Completada',
    en_progreso: 'En Progreso'
  }
  return labels[estado] || estado
}

const getEstadoClasses = (estado) => {
  const classes = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    confirmada: 'bg-green-100 text-green-700',
    cancelada: 'bg-red-100 text-red-700',
    completada: 'bg-blue-100 text-blue-700',
    en_progreso: 'bg-purple-100 text-purple-700'
  }
  return classes[estado] || 'bg-gray-100 text-gray-700'
}

// Funciones para gestión de pagos confirmados
const abrirDetallePago = (bono) => {
  bonoSeleccionado.value = bono
  modalDetalleAbierto.value = true
}

const cerrarDetallePago = () => {
  modalDetalleAbierto.value = false
  setTimeout(() => {
    bonoSeleccionado.value = null
  }, 300)
}

const confirmarRevertirPago = () => {
  modalConfirmacionRevertir.value = true
}

const cancelarRevertirPago = () => {
  modalConfirmacionRevertir.value = false
}

const ejecutarRevertirPago = async () => {
  if (!bonoSeleccionado.value) return
  
  procesandoReversion.value = true
  
  try {
    // Llamar a la función RPC para revertir el pago
    const { error } = await supabase.rpc('revertir_pago_bono', {
      p_bono_id: bonoSeleccionado.value.id
    })

    if (error) {
      throw error
    }

    // Mostrar notificación de éxito
    notificacion.value = {
      visible: true,
      tipo: 'success',
      titulo: '✓ Pago Revertido',
      mensaje: `El pago del bono de ${bonoSeleccionado.value.paciente_nombre} ha sido desmarcado correctamente.`
    }

    // Ocultar notificación después de 5 segundos
    setTimeout(() => {
      notificacion.value.visible = false
    }, 5000)

    // Cerrar modales
    modalConfirmacionRevertir.value = false
    modalDetalleAbierto.value = false
    
    // Recargar datos
    await cargarBonosConfirmados()

  } catch (error) {
    console.error('Error al revertir pago:', error)
    
    // Mostrar notificación de error
    notificacion.value = {
      visible: true,
      tipo: 'error',
      titulo: '✗ Error al Revertir',
      mensaje: error.message || 'No se pudo revertir el pago. Inténtalo de nuevo.'
    }

    // Ocultar notificación después de 5 segundos
    setTimeout(() => {
      notificacion.value.visible = false
    }, 5000)
  } finally {
    procesandoReversion.value = false
  }
}

// Cargar bonos pendientes de pago
const cargarBonosPendientes = async () => {
  try {
    // Primero cargar bonos sin pagar (pagado = false) que estén activos o pendientes
    const { data: bonos, error: bonosError } = await supabase
      .from('bonos')
      .select(`
        id,
        paciente_id,
        sesiones_totales,
        sesiones_restantes,
        monto_total,
        tipo_bono,
        estado,
        pagado
      `)
      .eq('pagado', false)
      .in('estado', ['activo', 'pendiente'])
      .order('created_at', { ascending: false })
      .limit(20)

    if (bonosError) {
      console.error('Error al cargar bonos pendientes:', bonosError)
      return
    }

    // Si no hay bonos, no hacer más consultas
    if (!bonos || bonos.length === 0) {
      bonosPendientes.value = []
      totalPorConfirmar.value = 0
      bonosUrgentes.value = 0
      return
    }

    // Obtener los IDs de pacientes únicos
    const pacienteIds = [...new Set(bonos.map(b => b.paciente_id))]
    
    // Cargar información de pacientes y terapeutas
    const { data: pacientes, error: pacientesError } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, email, terapeuta_id')
      .in('id', pacienteIds)

    if (pacientesError) {
      console.error('Error al cargar pacientes:', pacientesError)
    }

    // Obtener IDs de terapeutas únicos
    const terapeutaIds = pacientes 
      ? [...new Set(pacientes.map(p => p.terapeuta_id).filter(Boolean))]
      : []
    
    // Cargar información de terapeutas si hay
    let terapeutas = []
    if (terapeutaIds.length > 0) {
      const { data: terapeutasData, error: terapeutasError } = await supabase
        .from('terapeutas')
        .select('id, nombre_completo')
        .in('id', terapeutaIds)
      
      if (!terapeutasError) {
        terapeutas = terapeutasData || []
      }
    }

    // Crear mapas para búsqueda rápida
    const pacientesMap = new Map(pacientes?.map(p => [p.id, p]) || [])
    const terapeutasMap = new Map(terapeutas.map(t => [t.id, t]))

    // Transformar los datos
    bonosPendientes.value = bonos.map(bono => {
      const paciente = pacientesMap.get(bono.paciente_id)
      const terapeuta = paciente?.terapeuta_id ? terapeutasMap.get(paciente.terapeuta_id) : null
      
      return {
        id: bono.id,
        paciente_id: bono.paciente_id,
        paciente_nombre: paciente?.nombre_completo || 'Sin nombre',
        paciente_email: paciente?.email,
        terapeuta_nombre: terapeuta?.nombre_completo,
        sesiones_totales: bono.sesiones_totales,
        sesiones_restantes: bono.sesiones_restantes,
        monto_total: bono.monto_total,
        tipo_bono: bono.tipo_bono,
        estado: bono.estado
      }
    })

    // Calcular totales
    totalPorConfirmar.value = bonosPendientes.value.reduce((sum, bono) => {
      return sum + (Number(bono.monto_total) || 0)
    }, 0)

    // Calcular bonos urgentes (activos con pocas sesiones restantes)
    bonosUrgentes.value = bonosPendientes.value.filter(bono => 
      bono.estado === 'activo' && bono.sesiones_restantes <= 2
    ).length

  } catch (error) {
    console.error('Error al cargar bonos pendientes:', error)
  }
}

// Abrir modal para confirmar pago
const abrirConfirmarPago = (bono) => {
  bonoSeleccionado.value = bono
  modalConfirmarPago.value = true
}

// Confirmar pago rápido (sin abrir modal)
const confirmarPagoRapido = async (bono) => {
  // Mostrar opciones de método de pago
  const metodos = {
    '1': 'efectivo',
    '2': 'tarjeta',
    '3': 'transferencia',
    '4': 'bizum',
    '5': 'paypal',
    '6': 'otro'
  }

  const opcion = prompt(
    `Confirmar pago de ${bono.paciente_nombre} (${formatearPrecio(bono.monto_total)}€)\n\n` +
    'Selecciona el método de pago:\n' +
    '1. Efectivo\n' +
    '2. Tarjeta\n' +
    '3. Transferencia\n' +
    '4. Bizum\n' +
    '5. PayPal\n' +
    '6. Otro\n\n' +
    'Escribe el número (1-6):'
  )

  if (!opcion || !metodos[opcion]) {
    return
  }

  try {
    // Llamar a la función RPC para confirmar el pago
    const { error } = await supabase.rpc('confirmar_pago_bono', {
      p_bono_id: bono.id,
      p_metodo_pago: metodos[opcion],
      p_confirmado_por: user.value.id
    })

    if (error) {
      throw error
    }

    // Mostrar notificación de éxito
    notificacion.value = {
      visible: true,
      tipo: 'success',
      titulo: '✓ Pago Confirmado',
      mensaje: `El pago del bono de ${bono.paciente_nombre} ha sido confirmado correctamente.`
    }

    // Ocultar notificación después de 5 segundos
    setTimeout(() => {
      notificacion.value.visible = false
    }, 5000)

    // Recargar datos
    await cargarBonosPendientes()
    await cargarBonosConfirmados()

  } catch (error) {
    console.error('Error al confirmar pago:', error)
    
    // Mostrar notificación de error
    notificacion.value = {
      visible: true,
      tipo: 'error',
      titulo: '✗ Error al Confirmar',
      mensaje: error.message || 'No se pudo confirmar el pago. Inténtalo de nuevo.'
    }

    // Ocultar notificación después de 5 segundos
    setTimeout(() => {
      notificacion.value.visible = false
    }, 5000)
  }
}

// ================== FUNCIONES DE CITAS ==================

// Cargar citas pendientes de confirmación
const cargarCitasPorConfirmar = async () => {
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaHoy = hoy.toISOString().split('T')[0]
    
    console.log('🔄 Cargando citas pendientes desde:', fechaHoy)
    
    // Primero cargar las citas
    const { data: citas, error: citasError } = await supabase
      .from('citas')
      .select(`
        id,
        fecha_cita,
        hora_inicio,
        modalidad,
        estado,
        paciente_id,
        terapeuta_id
      `)
      .eq('estado', 'pendiente')
      .gte('fecha_cita', fechaHoy)
      .order('fecha_cita', { ascending: true })
      .order('hora_inicio', { ascending: true })
      .limit(20)
    
    if (citasError) {
      console.error('❌ Error al cargar citas pendientes:', citasError)
      throw citasError
    }
    
    console.log('✅ Citas pendientes cargadas:', citas?.length || 0)
    
    // Si no hay citas, no hacer más consultas
    if (!citas || citas.length === 0) {
      citasPorConfirmar.value = []
      citasUrgentesCount.value = 0
      proximaCitaTiempo.value = '--'
      citasConWhatsApp.value = 0
      return
    }
    
    // Obtener IDs únicos de pacientes y terapeutas
    const pacienteIds = [...new Set(citas.map(c => c.paciente_id))]
    const terapeutaIds = [...new Set(citas.map(c => c.terapeuta_id).filter(Boolean))]
    
    // Cargar pacientes
    const { data: pacientes, error: pacientesError } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, telefono, email')
      .in('id', pacienteIds)
    
    if (pacientesError) {
      console.error('Error al cargar pacientes:', pacientesError)
    }
    
    // Cargar terapeutas si hay
    let terapeutas = []
    if (terapeutaIds.length > 0) {
      const { data: terapeutasData, error: terapeutasError } = await supabase
        .from('terapeutas')
        .select('id, nombre_completo')
        .in('id', terapeutaIds)
      
      if (!terapeutasError) {
        terapeutas = terapeutasData || []
      }
    }
    
    // Crear mapas para búsqueda rápida
    const pacientesMap = new Map(pacientes?.map(p => [p.id, p]) || [])
    const terapeutasMap = new Map(terapeutas.map(t => [t.id, t]))
    
    // Transformar datos
    citasPorConfirmar.value = citas.map(cita => {
      const paciente = pacientesMap.get(cita.paciente_id)
      const terapeuta = cita.terapeuta_id ? terapeutasMap.get(cita.terapeuta_id) : null
      
      return {
        id: cita.id,
        fecha: cita.fecha_cita,
        hora_inicio: cita.hora_inicio,
        modalidad: cita.modalidad,
        estado: cita.estado,
        listaParaConfirmar: estaListaParaConfirmar(cita.fecha_cita, cita.hora_inicio),
        paciente: {
          nombre: paciente?.nombre_completo || 'Sin nombre',
          telefono: paciente?.telefono,
          email: paciente?.email
        },
        terapeuta: {
          nombre: terapeuta?.nombre_completo || 'Sin terapeuta'
        }
      }
    })
    
    // Calcular métricas
    const manana = new Date(hoy)
    manana.setDate(manana.getDate() + 2) // Hoy + mañana = 2 días
    const fechaManana = manana.toISOString().split('T')[0]
    
    citasUrgentesCount.value = citasPorConfirmar.value.filter(cita => 
      cita.fecha < fechaManana
    ).length
    
    // Próxima cita
    if (citasPorConfirmar.value.length > 0) {
      const proxima = citasPorConfirmar.value[0]
      proximaCitaTiempo.value = calcularTiempoRestante(proxima.fecha, proxima.hora_inicio)
    } else {
      proximaCitaTiempo.value = '--'
    }
    
    // Contar citas listas para confirmar (dentro de 24h)
    const citasListasParaConfirmar = citasPorConfirmar.value.filter(cita => 
      cita.listaParaConfirmar && cita.paciente?.telefono
    ).length
    
    // Contar citas con WhatsApp disponible (actualizado para mostrar las listas)
    citasConWhatsApp.value = citasListasParaConfirmar
  } catch (error) {
    console.error('Error al cargar citas por confirmar:', error)
  }
}

// Enviar mensaje de confirmación por WhatsApp
const enviarWhatsApp = (cita) => {
  const telefono = cita.paciente?.telefono
  if (!telefono) {
    mostrarNotificacion('Sin Teléfono', 'Este paciente no tiene teléfono registrado', 'error')
    return
  }
  
  // Limpiar el número de teléfono (solo dígitos)
  const numeroLimpio = telefono.replace(/\D/g, '')
  
  // Obtener el primer nombre del paciente
  const nombrePaciente = cita.paciente.nombre.split(' ')[0]
  const nombreTerapeuta = cita.terapeuta.nombre
  
  // Formatear fecha y hora
  const fechaFormateada = formatearFechaCita(cita.fecha)
  const hora = cita.hora_inicio
  
  // Mensaje preelaborado profesional
  const mensaje = `Hola ${nombrePaciente}, te escribo desde el equipo de Psicóloga Karem Peña.
Solo quería confirmar tu sesión programada para ${fechaFormateada} a las ${hora} con ${nombreTerapeuta}.
¿Podrías confirmarme si podrás asistir?`
  
  // Construir URL de WhatsApp
  const mensajeCodificado = encodeURIComponent(mensaje)
  const urlWhatsApp = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`
  
  // Abrir WhatsApp en nueva ventana
  window.open(urlWhatsApp, '_blank')
}

// Enviar recordatorio por WhatsApp (para citas confirmadas dentro de 4 horas)
const enviarRecordatorio = (cita) => {
  const telefono = cita.paciente?.telefono
  if (!telefono) {
    mostrarNotificacion('Sin Teléfono', 'Este paciente no tiene teléfono registrado', 'error')
    return
  }
  
  // Limpiar el número de teléfono (solo dígitos)
  const numeroLimpio = telefono.replace(/\D/g, '')
  
  // Obtener el primer nombre del paciente
  const nombrePaciente = cita.paciente.nombre.split(' ')[0]
  const nombreTerapeuta = cita.terapeuta.nombre
  const hora = cita.hora_inicio
  
  // Mensaje de recordatorio
  const mensaje = `Hola ${nombrePaciente}, te escribo desde el equipo de Psicóloga Karem Peña.
Solo quería recordarte que tienes tu sesión hoy a las ${hora} con ${nombreTerapeuta}.
¡Te esperamos!`
  
  // Construir URL de WhatsApp
  const mensajeCodificado = encodeURIComponent(mensaje)
  const urlWhatsApp = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`
  
  // Abrir WhatsApp en nueva ventana
  window.open(urlWhatsApp, '_blank')
}

// Marcar cita como confirmada
const marcarComoConfirmada = async (cita) => {
  try {
    console.log('📝 Confirmando cita:', cita.id, 'de', cita.paciente.nombre)
    console.log('📊 Estado ANTES - Pendientes:', citasPorConfirmar.value.length, 'Confirmadas:', citasConfirmadasDetalle.value.length)
    
    // Actualizar el estado en la base de datos
    const { error } = await supabase
      .from('citas')
      .update({ estado: 'confirmada' })
      .eq('id', cita.id)
    
    if (error) {
      console.error('❌ Error al actualizar cita:', error)
      throw error
    }
    
    console.log('✅ Cita actualizada a confirmada en DB')
    
    // Mostrar notificación
    mostrarNotificacion(
      '✓ Cita Confirmada',
      `Cita con ${cita.paciente.nombre} confirmada. Ahora aparece en "Citas Confirmadas"`,
      'success'
    )
    
    // Recargar ambas listas en paralelo
    console.log('🔄 Recargando listas de citas...')
    await Promise.all([
      cargarCitasPorConfirmar(),
      cargarCitasConfirmadas()
    ])
    console.log('✅ Listas actualizadas')
    console.log('📊 Estado DESPUÉS - Pendientes:', citasPorConfirmar.value.length, 'Confirmadas:', citasConfirmadasDetalle.value.length)
    
  } catch (error) {
    console.error('❌ Error al marcar cita como confirmada:', error)
    mostrarNotificacion(
      '✗ Error',
      'Error al confirmar la cita: ' + (error.message || 'Error desconocido'),
      'error'
    )
  }
}

// Abrir modal de cancelación
const abrirModalCancelar = (cita) => {
  citaSeleccionada.value = cita
  motivoCancelacion.value = ''
  modalCancelarCita.value = true
}

// Cerrar modal de cancelación
const cerrarModalCancelar = () => {
  modalCancelarCita.value = false
  citaSeleccionada.value = null
  motivoCancelacion.value = ''
}

// Confirmar cancelación de cita
const confirmarCancelarCita = async () => {
  if (!citaSeleccionada.value) return
  
  procesandoCancelacion.value = true
  
  try {
    // Actualizar estado de la cita
    const updateData = {
      estado: 'cancelada'
    }
    
    // Si hay motivo, agregarlo a observaciones
    if (motivoCancelacion.value.trim()) {
      updateData.observaciones = motivoCancelacion.value.trim()
    }
    
    const { error } = await supabase
      .from('citas')
      .update(updateData)
      .eq('id', citaSeleccionada.value.id)
    
    if (error) throw error
    
    // Cerrar modal
    cerrarModalCancelar()
    
    // Mostrar notificación
    mostrarNotificacion(
      '✓ Cita Cancelada',
      `Cita con ${citaSeleccionada.value.paciente.nombre} cancelada correctamente`,
      'success'
    )
    
    // Recargar lista de citas
    await cargarCitasPorConfirmar()
    await cargarCitasConfirmadas()
    
  } catch (error) {
    console.error('Error al cancelar cita:', error)
    mostrarNotificacion('✗ Error', 'Error al cancelar la cita', 'error')
  } finally {
    procesandoCancelacion.value = false
  }
}

// ================== FUNCIONES DE CITAS CONFIRMADAS ==================

// Cargar citas confirmadas
const cargarCitasConfirmadas = async () => {
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaHoy = hoy.toISOString().split('T')[0]
    
    console.log('🔄 Cargando citas confirmadas desde:', fechaHoy)
    
    // Primero cargar las citas
    const { data: citas, error: citasError } = await supabase
      .from('citas')
      .select(`
        id,
        fecha_cita,
        hora_inicio,
        modalidad,
        estado,
        paciente_id,
        terapeuta_id
      `)
      .eq('estado', 'confirmada')
      .gte('fecha_cita', fechaHoy)
      .order('fecha_cita', { ascending: true })
      .order('hora_inicio', { ascending: true })
      .limit(50)
    
    if (citasError) {
      console.error('❌ Error al cargar citas confirmadas:', citasError)
      throw citasError
    }
    
    console.log('✅ Citas confirmadas cargadas:', citas?.length || 0)
    
    // Si no hay citas, no hacer más consultas
    if (!citas || citas.length === 0) {
      citasConfirmadasDetalle.value = []
      citasConfirmadasHoy.value = 0
      citasProximos7Dias.value = 0
      citasOnlineConfirmadas.value = 0
      citasPresencialConfirmadas.value = 0
      return
    }
    
    // Obtener IDs únicos de pacientes y terapeutas
    const pacienteIds = [...new Set(citas.map(c => c.paciente_id))]
    const terapeutaIds = [...new Set(citas.map(c => c.terapeuta_id).filter(Boolean))]
    
    // Cargar pacientes
    const { data: pacientes, error: pacientesError } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, telefono, email')
      .in('id', pacienteIds)
    
    if (pacientesError) {
      console.error('Error al cargar pacientes:', pacientesError)
    }
    
    // Cargar terapeutas si hay
    let terapeutas = []
    if (terapeutaIds.length > 0) {
      const { data: terapeutasData, error: terapeutasError } = await supabase
        .from('terapeutas')
        .select('id, nombre_completo')
        .in('id', terapeutaIds)
      
      if (!terapeutasError) {
        terapeutas = terapeutasData || []
      }
    }
    
    // Crear mapas para búsqueda rápida
    const pacientesMap = new Map(pacientes?.map(p => [p.id, p]) || [])
    const terapeutasMap = new Map(terapeutas.map(t => [t.id, t]))
    
    // Transformar datos
    citasConfirmadasDetalle.value = citas.map(cita => {
      const paciente = pacientesMap.get(cita.paciente_id)
      const terapeuta = cita.terapeuta_id ? terapeutasMap.get(cita.terapeuta_id) : null
      
      return {
        id: cita.id,
        fecha: cita.fecha_cita,
        hora_inicio: cita.hora_inicio,
        modalidad: cita.modalidad,
        estado: cita.estado,
        listaParaRecordatorio: estaListaParaRecordatorio(cita.fecha_cita, cita.hora_inicio),
        paciente: {
          nombre: paciente?.nombre_completo || 'Sin nombre',
          telefono: paciente?.telefono,
          email: paciente?.email
        },
        terapeuta: {
          nombre: terapeuta?.nombre_completo || 'Sin terapeuta'
        }
      }
    })
    
    // Calcular métricas
    const hoyFin = new Date(hoy)
    hoyFin.setHours(23, 59, 59, 999)
    const fechaHoyFin = hoyFin.toISOString().split('T')[0]
    
    // Citas confirmadas para hoy
    citasConfirmadasHoy.value = citasConfirmadasDetalle.value.filter(cita => 
      cita.fecha === fechaHoy
    ).length
    
    // Próximos 7 días
    const fecha7Dias = new Date(hoy)
    fecha7Dias.setDate(fecha7Dias.getDate() + 7)
    const fecha7DiasStr = fecha7Dias.toISOString().split('T')[0]
    
    citasProximos7Dias.value = citasConfirmadasDetalle.value.filter(cita => 
      cita.fecha <= fecha7DiasStr
    ).length
    
    // Online vs Presencial
    citasOnlineConfirmadas.value = citasConfirmadasDetalle.value.filter(cita => 
      cita.modalidad === 'online'
    ).length
    
    citasPresencialConfirmadas.value = citasConfirmadasDetalle.value.filter(cita => 
      cita.modalidad === 'presencial'
    ).length
    
    // Citas listas para enviar recordatorio (dentro de 4 horas)
    citasListasParaRecordatorio.value = citasConfirmadasDetalle.value.filter(cita =>
      cita.listaParaRecordatorio && cita.paciente?.telefono
    ).length
    
  } catch (error) {
    console.error('Error al cargar citas confirmadas:', error)
  }
}

// Revertir confirmación de cita (volver a pendiente)
const revertirConfirmacion = async (cita) => {
  const confirmacion = confirm(
    `¿Volver la cita de ${cita.paciente.nombre} a estado PENDIENTE?\n\n` +
    `La cita volverá a aparecer en "Citas por Confirmar" y desaparecerá de "Citas Confirmadas".`
  )
  
  if (!confirmacion) {
    return
  }
  
  try {
    console.log('↩️ Revirtiendo cita:', cita.id, 'de', cita.paciente.nombre)
    
    // Actualizar el estado en la base de datos
    const { error } = await supabase
      .from('citas')
      .update({ estado: 'pendiente' })
      .eq('id', cita.id)
    
    if (error) {
      console.error('❌ Error al actualizar cita:', error)
      throw error
    }
    
    console.log('✅ Cita revertida a pendiente en DB')
    
    // Mostrar notificación de éxito
    mostrarNotificacion(
      '↩ Cita Revertida',
      `Cita de ${cita.paciente.nombre} marcada como PENDIENTE. Ahora aparece en "Citas por Confirmar"`,
      'success'
    )
    
    // Recargar ambas listas en paralelo para reflejar el cambio
    console.log('🔄 Recargando listas de citas...')
    await Promise.all([
      cargarCitasPorConfirmar(),
      cargarCitasConfirmadas()
    ])
    console.log('✅ Listas actualizadas')
    
  } catch (error) {
    console.error('❌ Error al revertir confirmación:', error)
    mostrarNotificacion(
      '✗ Error',
      'Error al revertir la confirmación: ' + (error.message || 'Error desconocido'),
      'error'
    )
  }
}

// Cargar bonos confirmados
const cargarBonosConfirmados = async () => {
  try {
    // Primero cargar bonos pagados
    const { data: bonos, error: bonosError } = await supabase
      .from('bonos')
      .select(`
        id,
        paciente_id,
        sesiones_totales,
        sesiones_restantes,
        monto_total,
        tipo_bono,
        fecha_pago,
        metodo_pago,
        pagado
      `)
      .eq('pagado', true)
      .order('fecha_pago', { ascending: false })
      .limit(10)

    if (bonosError) {
      console.error('Error al cargar bonos confirmados:', bonosError)
      return
    }

    // Si no hay bonos, no hacer más consultas
    if (!bonos || bonos.length === 0) {
      bonosConfirmados.value = []
      totalConfirmado.value = 0
      promedioPorBono.value = 0
      return
    }

    // Obtener los IDs de pacientes únicos
    const pacienteIds = [...new Set(bonos.map(b => b.paciente_id))]
    
    // Cargar información de pacientes
    const { data: pacientes, error: pacientesError } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, email, terapeuta_id')
      .in('id', pacienteIds)

    if (pacientesError) {
      console.error('Error al cargar pacientes:', pacientesError)
    }

    // Obtener IDs de terapeutas únicos
    const terapeutaIds = pacientes 
      ? [...new Set(pacientes.map(p => p.terapeuta_id).filter(Boolean))]
      : []
    
    // Cargar información de terapeutas si hay
    let terapeutas = []
    if (terapeutaIds.length > 0) {
      const { data: terapeutasData, error: terapeutasError } = await supabase
        .from('terapeutas')
        .select('id, nombre_completo')
        .in('id', terapeutaIds)
      
      if (!terapeutasError) {
        terapeutas = terapeutasData || []
      }
    }

    // Crear mapas para búsqueda rápida
    const pacientesMap = new Map(pacientes?.map(p => [p.id, p]) || [])
    const terapeutasMap = new Map(terapeutas.map(t => [t.id, t]))

    // Transformar los datos
    bonosConfirmados.value = bonos.map(bono => {
      const paciente = pacientesMap.get(bono.paciente_id)
      const terapeuta = paciente?.terapeuta_id ? terapeutasMap.get(paciente.terapeuta_id) : null
      
      return {
        id: bono.id,
        paciente_id: bono.paciente_id,
        paciente_nombre: paciente?.nombre_completo || 'Sin nombre',
        paciente_email: paciente?.email,
        terapeuta_nombre: terapeuta?.nombre_completo,
        sesiones_totales: bono.sesiones_totales,
        sesiones_restantes: bono.sesiones_restantes,
        monto_total: bono.monto_total,
        tipo_bono: bono.tipo_bono,
        fecha_pago: bono.fecha_pago,
        metodo_pago: bono.metodo_pago
      }
    })

    // Calcular totales
    totalConfirmado.value = bonosConfirmados.value.reduce((sum, bono) => {
      return sum + (Number(bono.monto_total) || 0)
    }, 0)

    promedioPorBono.value = bonosConfirmados.value.length > 0 
      ? totalConfirmado.value / bonosConfirmados.value.length 
      : 0

  } catch (error) {
    console.error('Error al cargar bonos confirmados:', error)
  }
}

// Cargar datos
const cargarDatos = async () => {
  cargando.value = true
  
  try {
    // Obtener fecha de hoy
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const manana = new Date(hoy)
    manana.setDate(manana.getDate() + 1)
    
    // Citas de hoy con detalles
    const { data: citasHoyData, error: errorCitasHoy } = await supabase
      .from('citas')
      .select(`
        id,
        fecha_cita,
        hora_inicio,
        modalidad,
        estado,
        observaciones,
        paciente_id,
        pacientes (
          nombre_completo,
          email
        )
      `)
      .eq('fecha_cita', hoy.toISOString().split('T')[0])
      .order('hora_inicio', { ascending: true })
    
    if (!errorCitasHoy && citasHoyData) {
      citasHoyDetalle.value = citasHoyData.map(c => ({
        id: c.id,
        hora_inicio: c.hora_inicio?.substring(0, 5) || '--:--',
        paciente_nombre: c.pacientes?.nombre_completo || c.pacientes?.email || 'Sin nombre',
        modalidad: c.modalidad || 'presencial',
        estado: c.estado,
        observaciones: c.observaciones
      }))
      
      citasHoy.value = citasHoyData.length
      citasConfirmadas.value = citasHoyData.filter(c => c.estado === 'confirmada').length
    }

    // Citas pendientes de confirmación
    const { count: countPendientes } = await supabase
      .from('citas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente')
      .gte('fecha_cita', hoy.toISOString().split('T')[0])
    
    citasPendientes.value = countPendientes || 0

    // Total pacientes activos
    const { count: countPacientes } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)
    
    totalPacientes.value = countPacientes || 0

    // Próximas citas (7 días)
    const en7Dias = new Date(hoy)
    en7Dias.setDate(en7Dias.getDate() + 7)
    
    const { data: proximasData } = await supabase
      .from('citas')
      .select(`
        id,
        fecha_cita,
        hora_inicio,
        estado,
        pacientes (
          nombre_completo,
          email
        )
      `)
      .gte('fecha_cita', manana.toISOString().split('T')[0])
      .lte('fecha_cita', en7Dias.toISOString().split('T')[0])
      .in('estado', ['pendiente', 'confirmada'])
      .order('fecha_cita', { ascending: true })
      .order('hora_inicio', { ascending: true })
      .limit(10)
    
    if (proximasData) {
      proximasCitas.value = proximasData.map(c => ({
        id: c.id,
        fecha_cita: c.fecha_cita,
        hora_inicio: c.hora_inicio?.substring(0, 5) || '--:--',
        paciente_nombre: c.pacientes?.nombre_completo || c.pacientes?.email || 'Sin nombre',
        estado: c.estado
      }))
    }

    // Estadísticas del mes
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    
    const { count: countCitasMes } = await supabase
      .from('citas')
      .select('*', { count: 'exact', head: true })
      .gte('fecha_cita', primerDiaMes.toISOString().split('T')[0])
    
    citasMes.value = countCitasMes || 0

    const { count: countCompletadas } = await supabase
      .from('citas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'realizada')
      .gte('fecha_cita', primerDiaMes.toISOString().split('T')[0])
    
    citasCompletadas.value = countCompletadas || 0

    const { count: countCanceladas } = await supabase
      .from('citas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'cancelada')
      .gte('fecha_cita', primerDiaMes.toISOString().split('T')[0])
    
    citasCanceladas.value = countCanceladas || 0

    // Pagos pendientes (si existe la tabla)
    try {
      const { data: pagosData } = await supabase
        .from('pagos')
        .select('monto, estado')
        .in('estado', ['pendiente', 'confirmado_paciente'])
      
      if (pagosData) {
        pagosPendientes.value = pagosData.length
        totalPendiente.value = pagosData.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0)
      }
    } catch (e) {
      console.log('Tabla pagos no disponible:', e)
    }

    // Calcular ingresos del mes (citas completadas x precio promedio)
    // Por ahora simulado - integrar con tabla de pagos confirmados
    ingresosMes.value = citasCompletadas.value * 800 // Precio promedio por sesión

    // Cargar bonos confirmados
    await cargarBonosConfirmados()

    // Cargar bonos pendientes
    await cargarBonosPendientes()

    // Cargar citas por confirmar
    await cargarCitasPorConfirmar()

    // Cargar citas confirmadas
    await cargarCitasConfirmadas()

  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error)
  } finally {
    cargando.value = false
  }
}

// Cargar datos al montar
onMounted(() => {
  cargarDatos()
  
  // Recargar cada 2 minutos
  const interval = setInterval(cargarDatos, 120000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
