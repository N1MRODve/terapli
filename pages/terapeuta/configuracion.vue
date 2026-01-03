<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Configuracion de Agenda</h1>
        <p class="text-gray-500 text-sm mt-1">
          Define como funciona tu disponibilidad y las reglas de tu agenda
        </p>
      </header>

      <!-- Loading -->
      <div v-if="cargando" class="flex flex-col items-center justify-center py-16">
        <div class="w-10 h-10 border-3 border-gray-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
        <p class="text-gray-500">Cargando configuracion...</p>
      </div>

      <!-- Contenido principal -->
      <div v-else class="space-y-8">
        <!-- ============================================ -->
        <!-- SECCION 1: PREFERENCIAS DE SESION -->
        <!-- ============================================ -->
        <section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <ClockIcon class="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 class="font-semibold text-gray-900">Preferencias de sesion</h2>
                <p class="text-sm text-gray-500">Define la duracion base de tus sesiones y los tiempos de descanso</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Duracion de sesion -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Duracion estandar de sesion
                </label>
                <select
                  v-model.number="config.duracion_sesion_minutos"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
                >
                  <option :value="30">30 minutos</option>
                  <option :value="45">45 minutos</option>
                  <option :value="60">60 minutos</option>
                  <option :value="90">90 minutos</option>
                  <option :value="120">120 minutos</option>
                </select>
              </div>

              <!-- Pausa entre sesiones -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Pausa entre sesiones
                </label>
                <select
                  v-model.number="agenda.buffer_minutos"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
                >
                  <option :value="0">Sin pausa</option>
                  <option :value="5">5 minutos</option>
                  <option :value="10">10 minutos</option>
                  <option :value="15">15 minutos</option>
                  <option :value="30">30 minutos</option>
                </select>
              </div>
            </div>

            <p class="mt-4 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <InformationCircleIcon class="w-4 h-4 inline mr-1 text-gray-400" />
              Estas opciones se usaran para calcular los huecos disponibles en tu agenda.
            </p>

            <div class="flex justify-end pt-4 mt-4 border-t border-gray-100">
              <button
                @click="guardarSeccion('preferencias')"
                :disabled="guardandoSeccion === 'preferencias'"
                class="px-5 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowPathIcon v-if="guardandoSeccion === 'preferencias'" class="w-4 h-4 animate-spin" />
                {{ guardandoSeccion === 'preferencias' ? 'Guardando...' : 'Guardar preferencias' }}
              </button>
            </div>
          </div>
        </section>

        <!-- ============================================ -->
        <!-- SECCION 2: HORARIO HABITUAL -->
        <!-- ============================================ -->
        <section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CalendarDaysIcon class="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 class="font-semibold text-gray-900">Horario habitual</h2>
                <p class="text-sm text-gray-500">Tu disponibilidad semanal base. Las vacaciones y horarios especiales pueden modificarlo.</p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <!-- Franjas horarias -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-4">Franjas horarias</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Franja manana -->
                <div class="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div class="flex items-center gap-2 mb-3">
                    <SunIcon class="w-5 h-5 text-amber-500" />
                    <span class="font-medium text-amber-900">Manana</span>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">Inicio</label>
                      <select
                        v-model="agenda.horario.inicio_manana"
                        class="w-full px-3 py-2.5 border border-amber-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">Fin</label>
                      <select
                        v-model="agenda.horario.fin_manana"
                        class="w-full px-3 py-2.5 border border-amber-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>
                  </div>
                  <!-- Validacion horario manana -->
                  <p v-if="errorHorarioManana" class="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <ExclamationTriangleIcon class="w-3.5 h-3.5" />
                    {{ errorHorarioManana }}
                  </p>
                </div>

                <!-- Franja tarde -->
                <div class="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div class="flex items-center gap-2 mb-3">
                    <MoonIcon class="w-5 h-5 text-indigo-500" />
                    <span class="font-medium text-indigo-900">Tarde</span>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">Inicio</label>
                      <select
                        v-model="agenda.horario.inicio_tarde"
                        class="w-full px-3 py-2.5 border border-indigo-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">Fin</label>
                      <select
                        v-model="agenda.horario.fin_tarde"
                        class="w-full px-3 py-2.5 border border-indigo-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>
                  </div>
                  <!-- Validacion horario tarde -->
                  <p v-if="errorHorarioTarde" class="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <ExclamationTriangleIcon class="w-3.5 h-3.5" />
                    {{ errorHorarioTarde }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Dias laborables -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-4">Dias laborables</h3>
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="dia in diasSemana"
                  :key="dia.value"
                  class="relative flex items-center justify-center w-14 h-14 border-2 rounded-xl cursor-pointer transition-all"
                  :class="agenda.dias_laborables.includes(dia.value)
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-500'"
                >
                  <input
                    type="checkbox"
                    :value="dia.value"
                    v-model="agenda.dias_laborables"
                    class="sr-only"
                  />
                  <div class="text-center">
                    <span class="text-sm font-semibold">{{ dia.label }}</span>
                  </div>
                  <CheckCircleIcon
                    v-if="agenda.dias_laborables.includes(dia.value)"
                    class="absolute -top-1 -right-1 w-5 h-5 text-violet-600 bg-white rounded-full"
                  />
                </label>
              </div>
            </div>

            <!-- Horarios diferentes por día -->
            <div v-if="tieneHorariosDiferentes || mostrarConfigHorariosPorDia" class="mt-6 pt-6 border-t border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium text-gray-700">Horarios especificos por dia</h3>
                <button
                  v-if="!mostrarConfigHorariosPorDia"
                  @click="mostrarConfigHorariosPorDia = true"
                  class="text-xs text-violet-600 hover:text-violet-700 font-medium"
                >
                  + Editar horarios por dia
                </button>
              </div>

              <p class="text-xs text-gray-500 mb-4">
                Define horarios diferentes para dias especificos (ej: sabados solo por la manana)
              </p>

              <div class="space-y-3">
                <div
                  v-for="dia in diasSemana.filter(d => agenda.dias_laborables.includes(d.value))"
                  :key="dia.value"
                  class="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div class="flex items-center justify-between mb-3">
                    <span class="font-medium text-gray-900">{{ dia.labelLargo }}</span>
                    <label class="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        :checked="tieneHorarioEspecifico(dia.value)"
                        @change="toggleHorarioDia(dia.value)"
                        class="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span class="text-gray-600">Horario diferente</span>
                    </label>
                  </div>

                  <!-- Horario especifico del dia -->
                  <div v-if="tieneHorarioEspecifico(dia.value)" class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">Inicio manana</label>
                      <select
                        :value="getHorarioDia(dia.value, 'inicio_manana')"
                        @change="setHorarioDia(dia.value, 'inicio_manana', ($event.target as HTMLSelectElement).value)"
                        class="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="">Cerrado</option>
                        <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">Fin manana</label>
                      <select
                        :value="getHorarioDia(dia.value, 'fin_manana')"
                        @change="setHorarioDia(dia.value, 'fin_manana', ($event.target as HTMLSelectElement).value)"
                        class="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="">Cerrado</option>
                        <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">Inicio tarde</label>
                      <select
                        :value="getHorarioDia(dia.value, 'inicio_tarde')"
                        @change="setHorarioDia(dia.value, 'inicio_tarde', ($event.target as HTMLSelectElement).value)"
                        class="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="">Cerrado</option>
                        <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-gray-600 mb-1 block">Fin tarde</label>
                      <select
                        :value="getHorarioDia(dia.value, 'fin_tarde')"
                        @change="setHorarioDia(dia.value, 'fin_tarde', ($event.target as HTMLSelectElement).value)"
                        class="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="">Cerrado</option>
                        <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>
                  </div>
                  <p v-else class="text-xs text-gray-400 italic">Usa el horario base</p>
                </div>
              </div>
            </div>

            <!-- Boton para mostrar config de horarios por dia -->
            <div v-if="!tieneHorariosDiferentes && !mostrarConfigHorariosPorDia" class="mt-4 p-3 bg-violet-50 rounded-lg border border-violet-100">
              <button
                @click="mostrarConfigHorariosPorDia = true"
                class="w-full text-sm text-violet-700 hover:text-violet-900 font-medium flex items-center justify-center gap-2"
              >
                <AdjustmentsHorizontalIcon class="w-4 h-4" />
                Configurar horarios diferentes por dia de la semana
              </button>
            </div>

            <div class="flex justify-end pt-4 border-t border-gray-100 mt-6">
              <button
                @click="guardarSeccion('horario')"
                :disabled="guardandoSeccion === 'horario' || hayErroresHorario"
                class="px-5 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowPathIcon v-if="guardandoSeccion === 'horario'" class="w-4 h-4 animate-spin" />
                {{ guardandoSeccion === 'horario' ? 'Guardando...' : 'Guardar horario' }}
              </button>
            </div>
          </div>
        </section>

        <!-- ============================================ -->
        <!-- SECCION 3: POLITICA DE CANCELACION -->
        <!-- ============================================ -->
        <section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <ExclamationTriangleIcon class="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 class="font-semibold text-gray-900">Politica de cancelacion</h2>
                <p class="text-sm text-gray-500">Reglas claras para cuando un paciente cancela su cita</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Limite cancelacion -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Limite de cancelacion gratuita
                </label>
                <select
                  v-model.number="agenda.limite_cancelacion_horas"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
                >
                  <option :value="12">12 horas antes</option>
                  <option :value="24">24 horas antes</option>
                  <option :value="48">48 horas antes</option>
                  <option :value="72">72 horas antes</option>
                </select>
                <p class="mt-1.5 text-xs text-gray-500">Tiempo minimo de antelacion para cancelar sin coste</p>
              </div>

              <!-- Penalizacion -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Penalizacion por cancelacion tardia
                </label>
                <select
                  v-model="agenda.penalizacion_cancelacion"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
                >
                  <option value="ninguna">Sin penalizacion</option>
                  <option value="50%">50% del valor de la sesion</option>
                  <option value="100%">100% del valor de la sesion</option>
                </select>
                <p class="mt-1.5 text-xs text-gray-500">Importe a cobrar si cancela fuera de plazo</p>
              </div>
            </div>

            <p class="mt-4 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <InformationCircleIcon class="w-4 h-4 inline mr-1 text-gray-400" />
              Estas reglas se aplicaran cuando un paciente cancele tarde. Se utilizaran tambien en los textos de recordatorios y comunicaciones.
            </p>

            <div class="flex justify-end pt-4 mt-4 border-t border-gray-100">
              <button
                @click="guardarSeccion('cancelacion')"
                :disabled="guardandoSeccion === 'cancelacion'"
                class="px-5 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowPathIcon v-if="guardandoSeccion === 'cancelacion'" class="w-4 h-4 animate-spin" />
                {{ guardandoSeccion === 'cancelacion' ? 'Guardando...' : 'Guardar politica' }}
              </button>
            </div>
          </div>
        </section>

        <!-- ============================================ -->
        <!-- SECCION 4: VACACIONES Y BLOQUEOS -->
        <!-- ============================================ -->
        <section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CalendarIcon class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 class="font-semibold text-gray-900">Vacaciones y bloqueos</h2>
                <p class="text-sm text-gray-500">Periodos donde no estaras disponible para nuevas citas</p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <!-- Lista de bloqueos existentes -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">Bloqueos configurados</h3>

              <div v-if="agenda.bloqueos && agenda.bloqueos.length > 0" class="space-y-2">
                <div
                  v-for="bloqueo in agenda.bloqueos"
                  :key="bloqueo.id"
                  class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 group hover:border-gray-200 transition-colors"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="tipoBloqueoStyle(bloqueo.tipo).bg">
                      <span class="text-lg">{{ tipoBloqueoStyle(bloqueo.tipo).icon }}</span>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <p class="font-medium text-gray-900">
                          {{ formatearFechaBloqueo(bloqueo.fecha_inicio) }}
                          <span class="text-gray-400 mx-1">→</span>
                          {{ formatearFechaBloqueo(bloqueo.fecha_fin) }}
                        </p>
                        <span class="px-2 py-0.5 text-xs font-medium rounded-full" :class="tipoBloqueoStyle(bloqueo.tipo).badge">
                          {{ tipoBloqueoLabel(bloqueo.tipo) }}
                        </span>
                      </div>
                      <p v-if="bloqueo.descripcion" class="text-sm text-gray-500 mt-0.5">{{ bloqueo.descripcion }}</p>
                    </div>
                  </div>
                  <button
                    @click="eliminarBloqueo(bloqueo.id)"
                    class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar bloqueo"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div v-else class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <CalendarIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p class="text-sm text-gray-500">No tienes bloqueos configurados</p>
                <p class="text-xs text-gray-400 mt-1">Anade vacaciones o dias libres aqui</p>
              </div>
            </div>

            <!-- Formulario nuevo bloqueo -->
            <div class="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 class="font-medium text-blue-900 mb-4 flex items-center gap-2">
                <PlusCircleIcon class="w-5 h-5" />
                Anadir nuevo bloqueo
              </h4>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Fecha inicio -->
                <div>
                  <label class="text-xs font-medium text-blue-700 mb-1.5 block">Fecha inicio</label>
                  <input
                    v-model="nuevoBloqueo.fecha_inicio"
                    type="date"
                    :min="hoy"
                    class="w-full px-3 py-2.5 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <!-- Fecha fin -->
                <div>
                  <label class="text-xs font-medium text-blue-700 mb-1.5 block">Fecha fin</label>
                  <input
                    v-model="nuevoBloqueo.fecha_fin"
                    type="date"
                    :min="nuevoBloqueo.fecha_inicio || hoy"
                    class="w-full px-3 py-2.5 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <!-- Tipo -->
                <div>
                  <label class="text-xs font-medium text-blue-700 mb-1.5 block">Tipo</label>
                  <select
                    v-model="nuevoBloqueo.tipo"
                    class="w-full px-3 py-2.5 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="vacaciones">Vacaciones</option>
                    <option value="festivo">Festivo</option>
                    <option value="personal">Personal</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <!-- Boton anadir -->
                <div class="flex items-end">
                  <button
                    @click="agregarBloqueo"
                    :disabled="!nuevoBloqueo.fecha_inicio || !nuevoBloqueo.fecha_fin"
                    class="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <PlusIcon class="w-4 h-4" />
                    Anadir
                  </button>
                </div>
              </div>

              <!-- Descripcion -->
              <div class="mt-3">
                <input
                  v-model="nuevoBloqueo.descripcion"
                  type="text"
                  placeholder="Descripcion opcional (ej: Vacaciones de Navidad)"
                  class="w-full px-3 py-2.5 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Error de solapamiento -->
              <p v-if="errorBloqueoSolapado" class="mt-3 text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon class="w-4 h-4" />
                {{ errorBloqueoSolapado }}
              </p>
            </div>

            <p class="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <InformationCircleIcon class="w-4 h-4 inline mr-1 text-gray-400" />
              Los dias bloqueados no estaran disponibles para nuevas sesiones. Revisa las sesiones ya agendadas en esos dias para reprogramarlas si es necesario.
            </p>

            <div class="flex justify-end pt-4 border-t border-gray-100">
              <button
                @click="guardarSeccion('bloqueos')"
                :disabled="guardandoSeccion === 'bloqueos'"
                class="px-5 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowPathIcon v-if="guardandoSeccion === 'bloqueos'" class="w-4 h-4 animate-spin" />
                {{ guardandoSeccion === 'bloqueos' ? 'Guardando...' : 'Guardar bloqueos' }}
              </button>
            </div>
          </div>
        </section>

        <!-- ============================================ -->
        <!-- SECCION 5: HORARIOS PERSONALIZADOS POR DIA -->
        <!-- ============================================ -->
        <section class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <AdjustmentsHorizontalIcon class="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 class="font-semibold text-gray-900">Horarios personalizados por dia</h2>
                <p class="text-sm text-gray-500">Excepciones al horario habitual para dias concretos (ej: solo manana un viernes)</p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <!-- Lista de horarios personalizados -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">Horarios especiales configurados</h3>

              <div v-if="agenda.horarios_personalizados && agenda.horarios_personalizados.length > 0" class="space-y-2">
                <div
                  v-for="hp in horariosPersonalizadosOrdenados"
                  :key="hp.fecha"
                  class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 group hover:border-gray-200 transition-colors"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="hp.cerrado ? 'bg-red-100' : 'bg-purple-100'">
                      <XMarkIcon v-if="hp.cerrado" class="w-5 h-5 text-red-600" />
                      <ClockIcon v-else class="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <p class="font-medium text-gray-900">{{ formatearFechaBloqueo(hp.fecha) }}</p>
                        <span
                          class="px-2 py-0.5 text-xs font-medium rounded-full"
                          :class="hp.cerrado ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'"
                        >
                          {{ hp.cerrado ? 'Cerrado' : 'Horario especial' }}
                        </span>
                      </div>
                      <p v-if="!hp.cerrado" class="text-sm text-gray-500 mt-0.5">
                        {{ hp.inicio_manana || agenda.horario.inicio_manana }} - {{ hp.fin_manana || agenda.horario.fin_manana }}
                        <span class="mx-1 text-gray-300">|</span>
                        {{ hp.inicio_tarde || agenda.horario.inicio_tarde }} - {{ hp.fin_tarde || agenda.horario.fin_tarde }}
                      </p>
                      <p v-if="hp.notas" class="text-xs text-purple-600 mt-0.5">{{ hp.notas }}</p>
                    </div>
                  </div>
                  <button
                    @click="eliminarHorarioPersonalizado(hp.fecha)"
                    class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar horario personalizado"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div v-else class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <AdjustmentsHorizontalIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p class="text-sm text-gray-500">No tienes horarios especiales configurados</p>
                <p class="text-xs text-gray-400 mt-1">Usa esto para dias con horario diferente al habitual</p>
              </div>
            </div>

            <!-- Formulario nuevo horario personalizado -->
            <div class="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <h4 class="font-medium text-purple-900 mb-4 flex items-center gap-2">
                <PlusCircleIcon class="w-5 h-5" />
                Anadir horario especial
              </h4>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <!-- Fecha -->
                <div>
                  <label class="text-xs font-medium text-purple-700 mb-1.5 block">Fecha</label>
                  <input
                    v-model="nuevoHorarioPersonalizado.fecha"
                    type="date"
                    :min="hoy"
                    class="w-full px-3 py-2.5 border border-purple-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <!-- Dia cerrado -->
                <div class="flex items-end pb-1">
                  <label class="flex items-center gap-3 cursor-pointer p-2.5 bg-white rounded-lg border border-purple-200 w-full">
                    <input
                      v-model="nuevoHorarioPersonalizado.cerrado"
                      type="checkbox"
                      class="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <span class="text-sm font-medium text-purple-700">Dia cerrado</span>
                  </label>
                </div>
              </div>

              <!-- Horarios si no esta cerrado -->
              <div v-if="!nuevoHorarioPersonalizado.cerrado" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label class="text-xs font-medium text-purple-700 mb-1.5 block">
                    Inicio manana
                    <span class="text-purple-400 font-normal">(opcional)</span>
                  </label>
                  <select
                    v-model="nuevoHorarioPersonalizado.inicio_manana"
                    class="w-full px-3 py-2.5 border border-purple-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Por defecto</option>
                    <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium text-purple-700 mb-1.5 block">
                    Fin manana
                    <span class="text-purple-400 font-normal">(opcional)</span>
                  </label>
                  <select
                    v-model="nuevoHorarioPersonalizado.fin_manana"
                    class="w-full px-3 py-2.5 border border-purple-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Por defecto</option>
                    <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium text-purple-700 mb-1.5 block">
                    Inicio tarde
                    <span class="text-purple-400 font-normal">(opcional)</span>
                  </label>
                  <select
                    v-model="nuevoHorarioPersonalizado.inicio_tarde"
                    class="w-full px-3 py-2.5 border border-purple-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Por defecto</option>
                    <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-medium text-purple-700 mb-1.5 block">
                    Fin tarde
                    <span class="text-purple-400 font-normal">(opcional)</span>
                  </label>
                  <select
                    v-model="nuevoHorarioPersonalizado.fin_tarde"
                    class="w-full px-3 py-2.5 border border-purple-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Por defecto</option>
                    <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                  </select>
                </div>
              </div>

              <!-- Notas y boton -->
              <div class="flex gap-3">
                <input
                  v-model="nuevoHorarioPersonalizado.notas"
                  type="text"
                  placeholder="Notas opcionales (ej: Reunion profesional)"
                  class="flex-1 px-3 py-2.5 border border-purple-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500"
                />
                <button
                  @click="agregarHorarioPersonalizado"
                  :disabled="!nuevoHorarioPersonalizado.fecha"
                  class="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <PlusIcon class="w-4 h-4" />
                  Anadir
                </button>
              </div>
            </div>

            <div class="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p class="text-sm text-amber-800">
                <strong>Prioridad de reglas:</strong> Los bloqueos (vacaciones) tienen prioridad sobre los horarios personalizados.
                Los horarios personalizados sobrescriben el horario habitual para ese dia concreto.
              </p>
            </div>

            <div class="flex justify-end pt-4 border-t border-gray-100">
              <button
                @click="guardarSeccion('horarios_personalizados')"
                :disabled="guardandoSeccion === 'horarios_personalizados'"
                class="px-5 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowPathIcon v-if="guardandoSeccion === 'horarios_personalizados'" class="w-4 h-4 animate-spin" />
                {{ guardandoSeccion === 'horarios_personalizados' ? 'Guardando...' : 'Guardar horarios' }}
              </button>
            </div>
          </div>
        </section>

        <!-- Ultima actualizacion -->
        <div v-if="ultimaActualizacion" class="text-center py-4">
          <p class="text-xs text-gray-400">
            Ultima actualizacion: {{ ultimaActualizacion }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ClockIcon,
  CalendarDaysIcon,
  CalendarIcon,
  SunIcon,
  MoonIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  TrashIcon,
  PlusCircleIcon,
  PlusIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'terapeuta',
  middleware: ['auth-terapeuta']
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

// Estado general
const cargando = ref(true)
const guardandoSeccion = ref<string | null>(null)
const ultimaActualizacion = ref<string | null>(null)
const terapeutaId = ref<string | null>(null)

// Fecha de hoy para validaciones
const hoy = computed(() => new Date().toISOString().split('T')[0])

// Tipos
interface Bloqueo {
  id: string
  fecha_inicio: string
  fecha_fin: string
  tipo: 'vacaciones' | 'festivo' | 'personal' | 'otro'
  descripcion?: string
}

interface HorarioPersonalizado {
  fecha: string
  cerrado: boolean
  inicio_manana?: string
  fin_manana?: string
  inicio_tarde?: string
  fin_tarde?: string
  notas?: string
}

// Configuracion principal
const config = ref({
  duracion_sesion_minutos: 60
})

// Tipo para horario por día de la semana
interface HorarioDia {
  inicio_manana: string
  fin_manana: string
  inicio_tarde: string
  fin_tarde: string
}

// Datos de agenda
const agenda = ref({
  buffer_minutos: 10,
  horario: {
    inicio_manana: '09:00',
    fin_manana: '14:00',
    inicio_tarde: '16:00',
    fin_tarde: '20:00'
  },
  // Horarios específicos por día de la semana (ej: sábados solo mañana)
  // Las claves son el número del día (0=dom, 1=lun, ..., 6=sab)
  horarios_por_dia: {} as Record<number, HorarioDia>,
  dias_laborables: [1, 2, 3, 4, 5],
  limite_cancelacion_horas: 24,
  penalizacion_cancelacion: 'ninguna',
  bloqueos: [] as Bloqueo[],
  horarios_personalizados: [] as HorarioPersonalizado[]
})

// Estado para nuevo bloqueo
const nuevoBloqueo = ref({
  fecha_inicio: '',
  fecha_fin: '',
  tipo: 'vacaciones' as 'vacaciones' | 'festivo' | 'personal' | 'otro',
  descripcion: ''
})

// Estado para nuevo horario personalizado
const nuevoHorarioPersonalizado = ref({
  fecha: '',
  cerrado: false,
  inicio_manana: '',
  fin_manana: '',
  inicio_tarde: '',
  fin_tarde: '',
  notas: ''
})

// Error de solapamiento de bloqueos
const errorBloqueoSolapado = ref<string | null>(null)

// Mostrar config de horarios por día
const mostrarConfigHorariosPorDia = ref(false)

// Constantes
const diasSemana = [
  { value: 1, label: 'Lun', labelLargo: 'Lunes' },
  { value: 2, label: 'Mar', labelLargo: 'Martes' },
  { value: 3, label: 'Mie', labelLargo: 'Miercoles' },
  { value: 4, label: 'Jue', labelLargo: 'Jueves' },
  { value: 5, label: 'Vie', labelLargo: 'Viernes' },
  { value: 6, label: 'Sab', labelLargo: 'Sabado' },
  { value: 0, label: 'Dom', labelLargo: 'Domingo' }
]

const horasDisponibles = computed(() => {
  const horas = []
  for (let h = 7; h <= 22; h++) {
    horas.push(`${String(h).padStart(2, '0')}:00`)
    horas.push(`${String(h).padStart(2, '0')}:15`)
    horas.push(`${String(h).padStart(2, '0')}:30`)
    horas.push(`${String(h).padStart(2, '0')}:45`)
  }
  return horas
})

// ============================================
// VALIDACIONES DE HORARIOS
// ============================================

const errorHorarioManana = computed(() => {
  if (!agenda.value.horario.inicio_manana || !agenda.value.horario.fin_manana) return null
  if (agenda.value.horario.fin_manana <= agenda.value.horario.inicio_manana) {
    return 'La hora de fin debe ser posterior a la de inicio'
  }
  return null
})

const errorHorarioTarde = computed(() => {
  if (!agenda.value.horario.inicio_tarde || !agenda.value.horario.fin_tarde) return null
  if (agenda.value.horario.fin_tarde <= agenda.value.horario.inicio_tarde) {
    return 'La hora de fin debe ser posterior a la de inicio'
  }
  return null
})

const hayErroresHorario = computed(() => {
  return !!errorHorarioManana.value || !!errorHorarioTarde.value
})

// ============================================
// HORARIOS POR DIA DE LA SEMANA
// ============================================

// Verifica si hay algún día con horario diferente al base
const tieneHorariosDiferentes = computed(() => {
  return Object.keys(agenda.value.horarios_por_dia).length > 0
})

// Verifica si un día tiene horario específico
const tieneHorarioEspecifico = (diaSemana: number): boolean => {
  return diaSemana in agenda.value.horarios_por_dia
}

// Obtiene el valor de un campo de horario para un día
const getHorarioDia = (diaSemana: number, campo: keyof HorarioDia): string => {
  if (agenda.value.horarios_por_dia[diaSemana]) {
    return agenda.value.horarios_por_dia[diaSemana][campo] || ''
  }
  return agenda.value.horario[campo]
}

// Establece el valor de un campo de horario para un día
const setHorarioDia = (diaSemana: number, campo: keyof HorarioDia, valor: string) => {
  if (!agenda.value.horarios_por_dia[diaSemana]) {
    // Inicializar con valores del horario base
    agenda.value.horarios_por_dia[diaSemana] = {
      inicio_manana: agenda.value.horario.inicio_manana,
      fin_manana: agenda.value.horario.fin_manana,
      inicio_tarde: agenda.value.horario.inicio_tarde,
      fin_tarde: agenda.value.horario.fin_tarde
    }
  }
  agenda.value.horarios_por_dia[diaSemana][campo] = valor
}

// Activa/desactiva horario específico para un día
const toggleHorarioDia = (diaSemana: number) => {
  if (tieneHorarioEspecifico(diaSemana)) {
    // Eliminar horario específico
    delete agenda.value.horarios_por_dia[diaSemana]
  } else {
    // Crear horario específico con valores del horario base
    agenda.value.horarios_por_dia[diaSemana] = {
      inicio_manana: agenda.value.horario.inicio_manana,
      fin_manana: agenda.value.horario.fin_manana,
      inicio_tarde: agenda.value.horario.inicio_tarde,
      fin_tarde: agenda.value.horario.fin_tarde
    }
  }
}

// ============================================
// HORARIOS PERSONALIZADOS ORDENADOS
// ============================================

const horariosPersonalizadosOrdenados = computed(() => {
  return [...agenda.value.horarios_personalizados].sort((a, b) =>
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  )
})

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

const formatearFechaBloqueo = (fecha: string) => {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const tipoBloqueoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    vacaciones: 'Vacaciones',
    festivo: 'Festivo',
    personal: 'Personal',
    otro: 'Otro'
  }
  return labels[tipo] || tipo
}

const tipoBloqueoStyle = (tipo: string) => {
  const styles: Record<string, { bg: string; badge: string; icon: string }> = {
    vacaciones: { bg: 'bg-emerald-100', badge: 'bg-emerald-100 text-emerald-700', icon: '🏖️' },
    festivo: { bg: 'bg-amber-100', badge: 'bg-amber-100 text-amber-700', icon: '🎉' },
    personal: { bg: 'bg-blue-100', badge: 'bg-blue-100 text-blue-700', icon: '👤' },
    otro: { bg: 'bg-gray-100', badge: 'bg-gray-100 text-gray-700', icon: '🚫' }
  }
  return styles[tipo] || styles.otro
}

// ============================================
// FUNCIONES PARA BLOQUEOS
// ============================================

const verificarSolapamientoBloqueo = (inicio: string, fin: string): boolean => {
  for (const bloqueo of agenda.value.bloqueos) {
    // Comprobar si hay solapamiento
    const existeInicio = new Date(bloqueo.fecha_inicio)
    const existeFin = new Date(bloqueo.fecha_fin)
    const nuevoInicio = new Date(inicio)
    const nuevoFin = new Date(fin)

    if (
      (nuevoInicio >= existeInicio && nuevoInicio <= existeFin) ||
      (nuevoFin >= existeInicio && nuevoFin <= existeFin) ||
      (nuevoInicio <= existeInicio && nuevoFin >= existeFin)
    ) {
      return true
    }
  }
  return false
}

const agregarBloqueo = () => {
  errorBloqueoSolapado.value = null

  if (!nuevoBloqueo.value.fecha_inicio || !nuevoBloqueo.value.fecha_fin) {
    toast.error('Debes seleccionar fecha de inicio y fin')
    return
  }

  if (nuevoBloqueo.value.fecha_fin < nuevoBloqueo.value.fecha_inicio) {
    toast.error('La fecha de fin debe ser igual o posterior a la de inicio')
    return
  }

  // Verificar solapamiento
  if (verificarSolapamientoBloqueo(nuevoBloqueo.value.fecha_inicio, nuevoBloqueo.value.fecha_fin)) {
    errorBloqueoSolapado.value = 'Este periodo se solapa con un bloqueo existente. Modifica las fechas o elimina el bloqueo anterior.'
    return
  }

  const bloqueo: Bloqueo = {
    id: crypto.randomUUID(),
    fecha_inicio: nuevoBloqueo.value.fecha_inicio,
    fecha_fin: nuevoBloqueo.value.fecha_fin,
    tipo: nuevoBloqueo.value.tipo,
    descripcion: nuevoBloqueo.value.descripcion || undefined
  }

  agenda.value.bloqueos.push(bloqueo)

  // Limpiar formulario
  nuevoBloqueo.value = {
    fecha_inicio: '',
    fecha_fin: '',
    tipo: 'vacaciones',
    descripcion: ''
  }

  toast.success('Bloqueo anadido. Recuerda guardar los cambios.')
}

const eliminarBloqueo = (bloqueoId: string) => {
  agenda.value.bloqueos = agenda.value.bloqueos.filter(b => b.id !== bloqueoId)
  toast.success('Bloqueo eliminado. Recuerda guardar los cambios.')
}

// ============================================
// FUNCIONES PARA HORARIOS PERSONALIZADOS
// ============================================

const agregarHorarioPersonalizado = () => {
  if (!nuevoHorarioPersonalizado.value.fecha) {
    toast.error('Debes seleccionar una fecha')
    return
  }

  // Verificar si ya existe para esa fecha
  const existeIdx = agenda.value.horarios_personalizados.findIndex(
    hp => hp.fecha === nuevoHorarioPersonalizado.value.fecha
  )

  const horario: HorarioPersonalizado = {
    fecha: nuevoHorarioPersonalizado.value.fecha,
    cerrado: nuevoHorarioPersonalizado.value.cerrado,
    inicio_manana: nuevoHorarioPersonalizado.value.inicio_manana || undefined,
    fin_manana: nuevoHorarioPersonalizado.value.fin_manana || undefined,
    inicio_tarde: nuevoHorarioPersonalizado.value.inicio_tarde || undefined,
    fin_tarde: nuevoHorarioPersonalizado.value.fin_tarde || undefined,
    notas: nuevoHorarioPersonalizado.value.notas || undefined
  }

  if (existeIdx >= 0) {
    agenda.value.horarios_personalizados[existeIdx] = horario
    toast.success('Horario actualizado. Recuerda guardar los cambios.')
  } else {
    agenda.value.horarios_personalizados.push(horario)
    toast.success('Horario personalizado anadido. Recuerda guardar los cambios.')
  }

  // Limpiar formulario
  nuevoHorarioPersonalizado.value = {
    fecha: '',
    cerrado: false,
    inicio_manana: '',
    fin_manana: '',
    inicio_tarde: '',
    fin_tarde: '',
    notas: ''
  }
}

const eliminarHorarioPersonalizado = (fecha: string) => {
  agenda.value.horarios_personalizados = agenda.value.horarios_personalizados.filter(
    hp => hp.fecha !== fecha
  )
  toast.success('Horario personalizado eliminado. Recuerda guardar los cambios.')
}

// ============================================
// GUARDAR SECCIONES
// ============================================

async function guardarSeccion(seccion: string) {
  if (!terapeutaId.value) return

  try {
    guardandoSeccion.value = seccion

    let updateData: any = { updated_at: new Date().toISOString() }

    switch (seccion) {
      case 'preferencias':
        updateData.duracion_sesion_minutos = config.value.duracion_sesion_minutos
        updateData.configuracion_agenda = {
          ...agenda.value,
          buffer_minutos: agenda.value.buffer_minutos
        }
        break
      case 'horario':
        updateData.configuracion_agenda = agenda.value
        break
      case 'cancelacion':
        updateData.configuracion_agenda = agenda.value
        break
      case 'bloqueos':
        updateData.configuracion_agenda = agenda.value
        break
      case 'horarios_personalizados':
        updateData.configuracion_agenda = agenda.value
        break
    }

    const { error } = await supabase
      .from('terapeutas')
      .update(updateData)
      .eq('id', terapeutaId.value)

    if (error) throw error

    ultimaActualizacion.value = new Date().toLocaleString('es-ES', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })

    const mensajes: Record<string, string> = {
      preferencias: 'Preferencias de sesion guardadas',
      horario: 'Horario habitual guardado',
      cancelacion: 'Politica de cancelacion guardada',
      bloqueos: 'Bloqueos guardados correctamente',
      horarios_personalizados: 'Horarios personalizados guardados'
    }
    toast.success(mensajes[seccion] || 'Configuracion guardada')
  } catch (error: any) {
    console.error('Error al guardar:', error)
    toast.error(`Error al guardar: ${error.message}`)
  } finally {
    guardandoSeccion.value = null
  }
}

// ============================================
// CARGAR CONFIGURACION
// ============================================

async function cargarConfiguracion() {
  try {
    cargando.value = true

    if (!user.value?.email) return

    const { data: terapeutaData, error: terapeutaError } = await supabase
      .from('terapeutas')
      .select('*')
      .eq('email', user.value.email)
      .single()

    if (terapeutaError) {
      console.error('Error al cargar terapeuta:', terapeutaError)
      return
    }

    if (terapeutaData) {
      terapeutaId.value = terapeutaData.id

      // Cargar duracion de sesion
      if (terapeutaData.duracion_sesion_minutos !== null) {
        config.value.duracion_sesion_minutos = terapeutaData.duracion_sesion_minutos
      }

      // Cargar agenda
      if (terapeutaData.configuracion_agenda) {
        const agendaData = terapeutaData.configuracion_agenda as any
        agenda.value = {
          ...agenda.value,
          ...agendaData,
          bloqueos: agendaData.bloqueos || [],
          horarios_personalizados: agendaData.horarios_personalizados || [],
          horarios_por_dia: agendaData.horarios_por_dia || {}
        }
        // Mostrar config si ya hay horarios por día configurados
        if (Object.keys(agenda.value.horarios_por_dia).length > 0) {
          mostrarConfigHorariosPorDia.value = true
        }
      }

      if (terapeutaData.updated_at) {
        ultimaActualizacion.value = new Date(terapeutaData.updated_at).toLocaleString('es-ES', {
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        })
      }
    }
  } catch (error) {
    console.error('Error al cargar configuracion:', error)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarConfiguracion()
})
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
