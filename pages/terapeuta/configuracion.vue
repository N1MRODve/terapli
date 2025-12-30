<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <header class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Configuracion</h1>
        <p class="text-gray-500 text-sm mt-1">
          Personaliza Terapli segun tu forma de trabajar
        </p>
      </header>

      <!-- Loading -->
      <div v-if="cargando" class="flex flex-col items-center justify-center py-16">
        <div class="w-10 h-10 border-3 border-gray-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
        <p class="text-gray-500">Cargando configuracion...</p>
      </div>

      <!-- Contenido con navegacion lateral -->
      <div v-else class="flex gap-6">
        <!-- Navegacion lateral -->
        <nav class="hidden lg:block w-56 flex-shrink-0">
          <div class="sticky top-24 space-y-1">
            <button
              v-for="seccion in secciones"
              :key="seccion.id"
              @click="seccionActiva = seccion.id"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
              :class="seccionActiva === seccion.id
                ? 'bg-violet-100 text-violet-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'"
            >
              <span class="text-lg">{{ seccion.icon }}</span>
              <span class="text-sm">{{ seccion.label }}</span>
            </button>

            <!-- Ultima actualizacion -->
            <div v-if="ultimaActualizacion" class="pt-4 mt-4 border-t border-gray-200">
              <p class="text-xs text-gray-400 px-3">
                Actualizado: {{ ultimaActualizacion }}
              </p>
            </div>
          </div>
        </nav>

        <!-- Selector movil -->
        <div class="lg:hidden mb-4 w-full">
          <select
            v-model="seccionActiva"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
          >
            <option v-for="seccion in secciones" :key="seccion.id" :value="seccion.id">
              {{ seccion.icon }} {{ seccion.label }}
            </option>
          </select>
        </div>

        <!-- Contenido principal -->
        <main class="flex-1 min-w-0">
          <!-- SECCION: Perfil y Marca -->
          <section v-show="seccionActiva === 'perfil'" class="space-y-6">
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 class="font-semibold text-gray-900">Perfil y Marca</h2>
                <p class="text-sm text-gray-500">Como te identificas en la plataforma</p>
              </div>

              <div class="p-6 space-y-6">
                <!-- Nombre para mostrar -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre para mostrar
                  </label>
                  <input
                    v-model="perfil.nombre_mostrar"
                    type="text"
                    placeholder="Ej: Dra. Maria, Karem, Dr. Lopez..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <p class="mt-1.5 text-xs text-gray-500">Aparecera en facturas, emails y recordatorios</p>
                </div>

                <!-- Especialidad -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Especialidad
                  </label>
                  <input
                    v-model="perfil.especialidad"
                    type="text"
                    placeholder="Ej: Psicologia Clinica, Terapia de Pareja..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <!-- Mensaje de bienvenida -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje de bienvenida
                    <span class="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    v-model="perfil.mensaje_bienvenida"
                    rows="3"
                    placeholder="Mensaje que recibiran los nuevos pacientes en su primer email..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                  ></textarea>
                </div>

                <!-- Preferencias de formato -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                    <select
                      v-model="perfil.idioma"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="es">Espanol</option>
                      <option value="ca">Catalan</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Formato de fecha</label>
                    <select
                      v-model="perfil.formato_fecha"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div class="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    @click="guardarSeccion('perfil')"
                    :disabled="guardandoSeccion === 'perfil'"
                    class="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg v-if="guardandoSeccion === 'perfil'" class="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    {{ guardandoSeccion === 'perfil' ? 'Guardando...' : 'Guardar perfil' }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- SECCION: Agenda y Sesiones -->
          <section v-show="seccionActiva === 'agenda'" class="space-y-6">
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 class="font-semibold text-gray-900">Agenda y Sesiones</h2>
                <p class="text-sm text-gray-500">Configura como funcionan tus sesiones</p>
              </div>

              <div class="p-6 space-y-6">
                <!-- Duracion y buffer -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Duracion estandar de sesion
                    </label>
                    <select
                      v-model.number="config.duracion_sesion_minutos"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                    >
                      <option :value="30">30 minutos</option>
                      <option :value="45">45 minutos</option>
                      <option :value="60">60 minutos (recomendado)</option>
                      <option :value="90">90 minutos</option>
                      <option :value="120">2 horas</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tiempo entre sesiones
                    </label>
                    <select
                      v-model.number="agenda.buffer_minutos"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                    >
                      <option :value="0">Sin pausa</option>
                      <option :value="5">5 minutos</option>
                      <option :value="10">10 minutos</option>
                      <option :value="15">15 minutos</option>
                      <option :value="30">30 minutos</option>
                    </select>
                    <p class="mt-1 text-xs text-gray-500">Tiempo de descanso entre citas</p>
                  </div>
                </div>

                <!-- Horario de trabajo -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    Horario de trabajo habitual
                  </label>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label class="text-xs text-gray-500 mb-1 block">Inicio manana</label>
                      <select v-model="agenda.horario.inicio_manana" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-gray-500 mb-1 block">Fin manana</label>
                      <select v-model="agenda.horario.fin_manana" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-gray-500 mb-1 block">Inicio tarde</label>
                      <select v-model="agenda.horario.inicio_tarde" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-gray-500 mb-1 block">Fin tarde</label>
                      <select v-model="agenda.horario.fin_tarde" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Dias laborables -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    Dias laborables
                  </label>
                  <div class="flex flex-wrap gap-2">
                    <label
                      v-for="dia in diasSemana"
                      :key="dia.value"
                      class="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-all"
                      :class="agenda.dias_laborables.includes(dia.value)
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 hover:border-gray-300'"
                    >
                      <input
                        type="checkbox"
                        :value="dia.value"
                        v-model="agenda.dias_laborables"
                        class="sr-only"
                      />
                      <span class="text-sm font-medium">{{ dia.label }}</span>
                    </label>
                  </div>
                </div>

                <!-- Politica de cancelacion -->
                <div class="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 class="font-medium text-amber-900 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Politica de cancelacion
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs text-amber-700 mb-1 block">Limite de cancelacion gratuita</label>
                      <select
                        v-model.number="agenda.limite_cancelacion_horas"
                        class="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white"
                      >
                        <option :value="12">12 horas antes</option>
                        <option :value="24">24 horas antes</option>
                        <option :value="48">48 horas antes</option>
                        <option :value="72">72 horas antes</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-xs text-amber-700 mb-1 block">Penalizacion por cancelacion tardia</label>
                      <select
                        v-model="agenda.penalizacion_cancelacion"
                        class="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white"
                      >
                        <option value="ninguna">Sin penalizacion</option>
                        <option value="50%">50% del valor de la sesion</option>
                        <option value="100%">100% del valor de la sesion</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    @click="guardarSeccion('agenda')"
                    :disabled="guardandoSeccion === 'agenda'"
                    class="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg v-if="guardandoSeccion === 'agenda'" class="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    {{ guardandoSeccion === 'agenda' ? 'Guardando...' : 'Guardar agenda' }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- SECCION: Tarifas y Bonos -->
          <section v-show="seccionActiva === 'tarifas'" class="space-y-6">
            <!-- Modelo de tarifas -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 class="font-semibold text-gray-900">Modelo de Tarifas</h2>
                <p class="text-sm text-gray-500">Define el precio por sesion segun la frecuencia</p>
              </div>

              <div class="p-6">
                <!-- Tabla de tarifas -->
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="text-left text-xs text-gray-500 uppercase tracking-wider">
                        <th class="pb-3">Tipo</th>
                        <th class="pb-3 text-center">Precio/Sesion</th>
                        <th class="pb-3 text-center">Ingreso mensual estimado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr>
                        <td class="py-3">
                          <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span class="font-medium text-gray-900">Semanal</span>
                          </div>
                          <p class="text-xs text-gray-500 mt-0.5">4 sesiones/mes</p>
                        </td>
                        <td class="py-3 text-center">
                          <div class="inline-flex items-center">
                            <input
                              v-model.number="config.precios_frecuencia.semanal"
                              type="number"
                              min="0"
                              step="1"
                              class="w-20 px-2 py-1.5 border border-gray-300 rounded text-center text-sm font-bold focus:ring-2 focus:ring-violet-500"
                            />
                            <span class="ml-1 text-gray-500 text-sm">EUR</span>
                          </div>
                        </td>
                        <td class="py-3 text-center">
                          <span class="font-bold text-emerald-600">{{ formatearPrecio(config.precios_frecuencia.semanal * 4) }} EUR</span>
                        </td>
                      </tr>
                      <tr>
                        <td class="py-3">
                          <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-green-500"></span>
                            <span class="font-medium text-gray-900">Quincenal</span>
                          </div>
                          <p class="text-xs text-gray-500 mt-0.5">2 sesiones/mes</p>
                        </td>
                        <td class="py-3 text-center">
                          <div class="inline-flex items-center">
                            <input
                              v-model.number="config.precios_frecuencia.quincenal"
                              type="number"
                              min="0"
                              step="1"
                              class="w-20 px-2 py-1.5 border border-gray-300 rounded text-center text-sm font-bold focus:ring-2 focus:ring-violet-500"
                            />
                            <span class="ml-1 text-gray-500 text-sm">EUR</span>
                          </div>
                        </td>
                        <td class="py-3 text-center">
                          <span class="font-bold text-emerald-600">{{ formatearPrecio(config.precios_frecuencia.quincenal * 2) }} EUR</span>
                        </td>
                      </tr>
                      <tr>
                        <td class="py-3">
                          <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-purple-500"></span>
                            <span class="font-medium text-gray-900">Sesion unica</span>
                          </div>
                          <p class="text-xs text-gray-500 mt-0.5">Sin compromiso</p>
                        </td>
                        <td class="py-3 text-center">
                          <div class="inline-flex items-center">
                            <input
                              v-model.number="config.precios_frecuencia.unica"
                              type="number"
                              min="0"
                              step="1"
                              class="w-20 px-2 py-1.5 border border-gray-300 rounded text-center text-sm font-bold focus:ring-2 focus:ring-violet-500"
                            />
                            <span class="ml-1 text-gray-500 text-sm">EUR</span>
                          </div>
                        </td>
                        <td class="py-3 text-center">
                          <span class="font-bold text-emerald-600">{{ formatearPrecio(config.precios_frecuencia.unica) }} EUR</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Info sin comision -->
                <div class="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-600 text-lg">&#10003;</span>
                    <p class="text-sm text-emerald-700 font-medium">Sin comisiones - Recibes el 100% de tus sesiones</p>
                  </div>
                </div>

                <div class="flex justify-end pt-4 border-t border-gray-100 mt-6">
                  <button
                    @click="guardarSeccion('tarifas')"
                    :disabled="guardandoSeccion === 'tarifas'"
                    class="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {{ guardandoSeccion === 'tarifas' ? 'Guardando...' : 'Guardar tarifas' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Plantillas de Bonos -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div>
                  <h2 class="font-semibold text-gray-900">Plantillas de Bonos</h2>
                  <p class="text-sm text-gray-500">Bonos prepagados que puedes ofrecer</p>
                </div>
                <button
                  @click="agregarPlantillaBono"
                  class="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors flex items-center gap-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva
                </button>
              </div>

              <div class="p-6 space-y-4">
                <!-- Lista de plantillas -->
                <div
                  v-for="(plantilla, index) in config.plantillas_bonos"
                  :key="index"
                  class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label class="text-xs text-gray-500 mb-1 block">Nombre</label>
                        <input
                          v-model="plantilla.nombre"
                          type="text"
                          placeholder="Ej: Bono 4 sesiones"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label class="text-xs text-gray-500 mb-1 block">Sesiones</label>
                        <input
                          v-model.number="plantilla.sesiones"
                          type="number"
                          min="1"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label class="text-xs text-gray-500 mb-1 block">Precio total</label>
                        <input
                          v-model.number="plantilla.precio"
                          type="number"
                          min="0"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label class="text-xs text-gray-500 mb-1 block">Frecuencia</label>
                        <select
                          v-model="plantilla.frecuencia"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="semanal">Semanal</option>
                          <option value="quincenal">Quincenal</option>
                          <option value="mensual">Mensual</option>
                          <option value="cualquiera">Flexible</option>
                        </select>
                      </div>
                    </div>
                    <button
                      @click="eliminarPlantillaBono(index)"
                      class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span class="text-gray-500">
                      Precio por sesion: <strong class="text-gray-700">{{ formatearPrecio(plantilla.precio / plantilla.sesiones) }} EUR</strong>
                    </span>
                    <span class="text-emerald-600">
                      Tu ingreso: <strong>{{ formatearPrecio(calcularIngresoNeto(plantilla.precio)) }} EUR</strong>
                    </span>
                  </div>
                </div>

                <!-- Sin plantillas -->
                <div v-if="config.plantillas_bonos.length === 0" class="text-center py-8 text-gray-500">
                  <p>No tienes plantillas de bonos</p>
                  <p class="text-sm">Crea una para ofrecer paquetes a tus pacientes</p>
                </div>

                <!-- Sugerencias rapidas -->
                <div class="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p class="text-sm font-medium text-amber-800 mb-2">Plantillas sugeridas:</p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      @click="agregarPlantillaPredefinida('4 sesiones semanales', 4, 160, 'semanal')"
                      class="px-3 py-1.5 bg-white border border-amber-300 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100"
                    >
                      + 4 sesiones (160 EUR)
                    </button>
                    <button
                      @click="agregarPlantillaPredefinida('8 sesiones flex', 8, 380, 'cualquiera')"
                      class="px-3 py-1.5 bg-white border border-amber-300 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100"
                    >
                      + 8 sesiones (380 EUR)
                    </button>
                    <button
                      @click="agregarPlantillaPredefinida('10 sesiones', 10, 500, 'cualquiera')"
                      class="px-3 py-1.5 bg-white border border-amber-300 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100"
                    >
                      + 10 sesiones (500 EUR)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- SECCION: Pagos y Facturacion -->
          <section v-show="seccionActiva === 'pagos'" class="space-y-6">
            <!-- Metodos de pago -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 class="font-semibold text-gray-900">Metodos de Pago</h2>
                <p class="text-sm text-gray-500">Metodos que aceptas de tus pacientes</p>
              </div>

              <div class="p-6">
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <label
                    v-for="metodo in metodosDisponibles"
                    :key="metodo.value"
                    class="relative flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all"
                    :class="config.metodos_pago_aceptados.includes(metodo.value)
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'"
                  >
                    <input
                      type="checkbox"
                      :value="metodo.value"
                      v-model="config.metodos_pago_aceptados"
                      class="sr-only"
                    />
                    <span class="text-2xl">{{ metodo.icon }}</span>
                    <span class="text-sm font-medium" :class="config.metodos_pago_aceptados.includes(metodo.value) ? 'text-violet-900' : 'text-gray-700'">
                      {{ metodo.label }}
                    </span>
                    <svg
                      v-if="config.metodos_pago_aceptados.includes(metodo.value)"
                      class="w-5 h-5 text-violet-600 absolute top-2 right-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </label>
                </div>

                <p class="mt-4 text-xs text-gray-500">
                  Estos metodos apareceran en recordatorios de pago y facturas.
                </p>

                <div class="flex justify-end pt-4 border-t border-gray-100 mt-6">
                  <button
                    @click="guardarSeccion('metodos_pago')"
                    :disabled="guardandoSeccion === 'metodos_pago'"
                    class="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                  >
                    {{ guardandoSeccion === 'metodos_pago' ? 'Guardando...' : 'Guardar metodos' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Datos Fiscales -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 class="font-semibold text-gray-900">Datos Fiscales</h2>
                <p class="text-sm text-gray-500">Informacion para emitir facturas</p>
              </div>

              <div class="p-6 space-y-6">
                <!-- NIF y Razon Social -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      NIF / DNI <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="datosFiscales.nif"
                      type="text"
                      placeholder="12345678A"
                      class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 uppercase"
                      :class="nifError ? 'border-red-300 bg-red-50' : 'border-gray-300'"
                      @blur="validarNIF"
                    />
                    <p v-if="nifError" class="mt-1 text-xs text-red-600">{{ nifError }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nombre o Razon Social <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="datosFiscales.razon_social"
                      type="text"
                      placeholder="Tu nombre completo"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <!-- Direccion -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Direccion fiscal</label>
                  <input
                    v-model="datosFiscales.direccion"
                    type="text"
                    placeholder="Calle, numero, piso..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <!-- CP, Ciudad, Provincia -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Codigo Postal</label>
                    <input
                      v-model="datosFiscales.codigo_postal"
                      type="text"
                      placeholder="28001"
                      maxlength="5"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                    <input
                      v-model="datosFiscales.ciudad"
                      type="text"
                      placeholder="Madrid"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
                    <input
                      v-model="datosFiscales.provincia"
                      type="text"
                      placeholder="Madrid"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <!-- Numero colegiado y Regimen IVA -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Numero de Colegiado <span class="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      v-model="datosFiscales.numero_colegiado"
                      type="text"
                      placeholder="Ej: M-12345"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Regimen de IVA</label>
                    <div class="space-y-2">
                      <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all"
                        :class="datosFiscales.regimen_iva === 'exento' ? 'border-violet-500 bg-violet-50' : 'border-gray-200'">
                        <input type="radio" v-model="datosFiscales.regimen_iva" value="exento" class="w-4 h-4 text-violet-600" />
                        <div>
                          <span class="text-sm font-medium">Exento de IVA</span>
                          <p class="text-xs text-gray-500">Servicios sanitarios</p>
                        </div>
                      </label>
                      <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all"
                        :class="datosFiscales.regimen_iva === 'general' ? 'border-violet-500 bg-violet-50' : 'border-gray-200'">
                        <input type="radio" v-model="datosFiscales.regimen_iva" value="general" class="w-4 h-4 text-violet-600" />
                        <div>
                          <span class="text-sm font-medium">Regimen General (21%)</span>
                          <p class="text-xs text-gray-500">Otros servicios</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Info facturacion -->
                <div class="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p class="text-sm text-indigo-800">
                    <strong>Sobre facturacion:</strong> Particulares: {{ datosFiscales.regimen_iva === 'exento' ? 'IVA exento' : 'IVA 21%' }} |
                    Empresas: IVA 21% + Retencion 15%
                  </p>
                </div>

                <div class="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    @click="guardarDatosFiscales"
                    :disabled="guardandoFiscales"
                    class="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg v-if="guardandoFiscales" class="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    {{ guardandoFiscales ? 'Guardando...' : 'Guardar datos fiscales' }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- SECCION: Comunicacion -->
          <section v-show="seccionActiva === 'comunicacion'" class="space-y-6">
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 class="font-semibold text-gray-900">Comunicacion con Pacientes</h2>
                <p class="text-sm text-gray-500">Configura recordatorios y notificaciones</p>
              </div>

              <div class="p-6 space-y-6">
                <!-- Recordatorios -->
                <div>
                  <h4 class="font-medium text-gray-700 mb-3">Recordatorios de cita</h4>
                  <div class="space-y-3">
                    <label class="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <span class="font-medium text-gray-900">24 horas antes</span>
                        <p class="text-xs text-gray-500">Enviar recordatorio un dia antes</p>
                      </div>
                      <input
                        v-model="comunicacion.recordatorio_24h"
                        type="checkbox"
                        class="w-5 h-5 text-violet-600 rounded"
                      />
                    </label>
                    <label class="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <span class="font-medium text-gray-900">1 hora antes</span>
                        <p class="text-xs text-gray-500">Recordatorio de ultima hora</p>
                      </div>
                      <input
                        v-model="comunicacion.recordatorio_1h"
                        type="checkbox"
                        class="w-5 h-5 text-violet-600 rounded"
                      />
                    </label>
                  </div>
                </div>

                <!-- Canal preferido -->
                <div>
                  <h4 class="font-medium text-gray-700 mb-3">Canal preferido</h4>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer"
                      :class="comunicacion.canal_preferido === 'email' ? 'border-violet-500 bg-violet-50' : 'border-gray-200'">
                      <input type="radio" v-model="comunicacion.canal_preferido" value="email" class="w-4 h-4 text-violet-600" />
                      <span>Email</span>
                    </label>
                    <label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer"
                      :class="comunicacion.canal_preferido === 'whatsapp' ? 'border-violet-500 bg-violet-50' : 'border-gray-200'">
                      <input type="radio" v-model="comunicacion.canal_preferido" value="whatsapp" class="w-4 h-4 text-violet-600" />
                      <span>WhatsApp</span>
                    </label>
                  </div>
                </div>

                <div class="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    @click="guardarSeccion('comunicacion')"
                    :disabled="guardandoSeccion === 'comunicacion'"
                    class="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                  >
                    {{ guardandoSeccion === 'comunicacion' ? 'Guardando...' : 'Guardar preferencias' }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- SECCION: Privacidad -->
          <section v-show="seccionActiva === 'privacidad'" class="space-y-6">
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 class="font-semibold text-gray-900">Privacidad y Datos</h2>
                <p class="text-sm text-gray-500">Control sobre tus datos y privacidad</p>
              </div>

              <div class="p-6 space-y-6">
                <div class="p-4 bg-gray-50 rounded-lg">
                  <h4 class="font-medium text-gray-700 mb-2">Exportar configuracion</h4>
                  <p class="text-sm text-gray-500 mb-3">Descarga una copia de tu configuracion en formato JSON.</p>
                  <button
                    @click="exportarConfiguracion"
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Exportar configuracion
                  </button>
                </div>

                <div class="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 class="font-medium text-red-700 mb-2">Zona de peligro</h4>
                  <p class="text-sm text-red-600 mb-3">Estas acciones son irreversibles.</p>
                  <button
                    class="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    disabled
                  >
                    Eliminar cuenta (contactar soporte)
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'terapeuta',
  middleware: ['auth-terapeuta']
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

// Tipos
interface PlantillaBono {
  nombre: string
  sesiones: number
  precio: number
  frecuencia: 'semanal' | 'quincenal' | 'mensual' | 'cualquiera'
}

// Secciones de navegacion
const secciones = [
  { id: 'perfil', label: 'Perfil y Marca', icon: '👤' },
  { id: 'agenda', label: 'Agenda y Sesiones', icon: '📅' },
  { id: 'tarifas', label: 'Tarifas y Bonos', icon: '💰' },
  { id: 'pagos', label: 'Pagos y Facturacion', icon: '💳' },
  { id: 'comunicacion', label: 'Comunicacion', icon: '💬' },
  { id: 'privacidad', label: 'Privacidad', icon: '🔒' }
]

const seccionActiva = ref('perfil')

// Estado general
const cargando = ref(true)
const guardandoSeccion = ref<string | null>(null)
const ultimaActualizacion = ref<string | null>(null)
const terapeutaId = ref<string | null>(null)

// Estado datos fiscales
const guardandoFiscales = ref(false)
const nifError = ref<string | null>(null)

// Datos de perfil
const perfil = ref({
  nombre_mostrar: '',
  especialidad: '',
  mensaje_bienvenida: '',
  idioma: 'es',
  formato_fecha: 'DD/MM/YYYY'
})

// Datos de agenda
const agenda = ref({
  buffer_minutos: 10,
  horario: {
    inicio_manana: '09:00',
    fin_manana: '14:00',
    inicio_tarde: '16:00',
    fin_tarde: '20:00'
  },
  dias_laborables: [1, 2, 3, 4, 5],
  limite_cancelacion_horas: 24,
  penalizacion_cancelacion: 'ninguna'
})

// Datos de comunicacion
const comunicacion = ref({
  recordatorio_24h: true,
  recordatorio_1h: false,
  canal_preferido: 'email'
})

// Configuracion principal
const config = ref({
  precio_sesion_base: 50.00,
  duracion_sesion_minutos: 60,
  metodos_pago_aceptados: ['efectivo', 'transferencia', 'bizum'] as string[],
  precios_frecuencia: {
    semanal: 40.00,
    quincenal: 50.00,
    unica: 60.00
  },
  plantillas_bonos: [] as PlantillaBono[],
  configuracion_bonos: {
    semanal: { sesiones: 4, precio: 160, descuento_porcentaje: 0 },
    quincenal: { sesiones: 4, precio: 200, descuento_porcentaje: 0 },
    mensual: { sesiones: 4, precio: 240, descuento_porcentaje: 0 }
  }
})

// Datos fiscales
const datosFiscales = ref({
  nif: '',
  razon_social: '',
  direccion: '',
  codigo_postal: '',
  ciudad: '',
  provincia: '',
  regimen_iva: 'exento' as 'exento' | 'general',
  numero_colegiado: ''
})


// Constantes
const metodosDisponibles = [
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { value: 'bizum', label: 'Bizum', icon: '📱' },
  { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
  { value: 'paypal', label: 'PayPal', icon: '🅿️' },
  { value: 'otro', label: 'Otro', icon: '📋' }
]

const diasSemana = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mie' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sab' },
  { value: 0, label: 'Dom' }
]

const horasDisponibles = computed(() => {
  const horas = []
  for (let h = 7; h <= 22; h++) {
    horas.push(`${String(h).padStart(2, '0')}:00`)
    horas.push(`${String(h).padStart(2, '0')}:30`)
  }
  return horas
})

// Funciones de utilidad
const formatearPrecio = (precio: number) => {
  if (!precio || isNaN(precio)) return '0.00'
  return precio.toFixed(2)
}


// Plantillas de bonos
const agregarPlantillaBono = () => {
  config.value.plantillas_bonos.push({
    nombre: '',
    sesiones: 4,
    precio: 160,
    frecuencia: 'semanal'
  })
}

const eliminarPlantillaBono = (index: number) => {
  config.value.plantillas_bonos.splice(index, 1)
}

const agregarPlantillaPredefinida = (nombre: string, sesiones: number, precio: number, frecuencia: 'semanal' | 'quincenal' | 'mensual' | 'cualquiera') => {
  const existe = config.value.plantillas_bonos.some(p => p.nombre === nombre)
  if (!existe) {
    config.value.plantillas_bonos.push({ nombre, sesiones, precio, frecuencia })
  }
}

// Validar NIF
const validarNIF = () => {
  const nif = datosFiscales.value.nif.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!nif) {
    nifError.value = null
    return true
  }
  if (nif.length !== 9) {
    nifError.value = 'El NIF debe tener 9 caracteres'
    return false
  }
  const dniRegex = /^[0-9]{8}[A-Z]$/
  if (dniRegex.test(nif)) {
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE'
    const numero = parseInt(nif.substring(0, 8))
    const letraCalculada = letras[numero % 23]
    if (nif[8] !== letraCalculada) {
      nifError.value = 'La letra del DNI no es correcta'
      return false
    }
    nifError.value = null
    return true
  }
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  if (nieRegex.test(nif)) {
    nifError.value = null
    return true
  }
  const cifRegex = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[A-J0-9]$/
  if (cifRegex.test(nif)) {
    nifError.value = null
    return true
  }
  nifError.value = 'Formato de NIF/DNI/NIE no valido'
  return false
}

// Guardar seccion
async function guardarSeccion(seccion: string) {
  if (!terapeutaId.value) return

  try {
    guardandoSeccion.value = seccion

    let updateData: any = { updated_at: new Date().toISOString() }

    switch (seccion) {
      case 'perfil':
        updateData.perfil = perfil.value
        break
      case 'agenda':
        updateData.configuracion_agenda = agenda.value
        updateData.duracion_sesion_minutos = config.value.duracion_sesion_minutos
        break
      case 'tarifas':
        updateData.precios_frecuencia = config.value.precios_frecuencia
        updateData.plantillas_bonos = config.value.plantillas_bonos
        break
      case 'metodos_pago':
        updateData.metodos_pago_aceptados = config.value.metodos_pago_aceptados
        break
      case 'comunicacion':
        updateData.configuracion_comunicacion = comunicacion.value
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

    // Mostrar mensaje de confirmación según la sección
    const mensajes: Record<string, string> = {
      perfil: 'Perfil actualizado correctamente',
      agenda: 'Configuración de agenda guardada',
      tarifas: 'Tarifas y bonos actualizados',
      metodos_pago: 'Métodos de pago guardados',
      comunicacion: 'Preferencias de comunicación guardadas'
    }
    toast.success(mensajes[seccion] || 'Configuración guardada')
  } catch (error: any) {
    console.error('Error al guardar:', error)
    toast.error(`Error al guardar: ${error.message}`)
  } finally {
    guardandoSeccion.value = null
  }
}

// Guardar datos fiscales
async function guardarDatosFiscales() {
  if (!terapeutaId.value) return
  if (datosFiscales.value.nif && !validarNIF()) return

  try {
    guardandoFiscales.value = true

    const { error } = await supabase
      .from('terapeutas')
      .update({
        datos_fiscales: {
          ...datosFiscales.value,
          nif: datosFiscales.value.nif.toUpperCase().replace(/[^A-Z0-9]/g, '')
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', terapeutaId.value)

    if (error) throw error

    ultimaActualizacion.value = new Date().toLocaleString('es-ES', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })
    toast.success('Datos fiscales guardados correctamente')
  } catch (error: any) {
    console.error('Error al guardar datos fiscales:', error)
    toast.error(`Error al guardar: ${error.message}`)
  } finally {
    guardandoFiscales.value = false
  }
}

// Exportar configuracion
const exportarConfiguracion = () => {
  const exportData = {
    perfil: perfil.value,
    agenda: agenda.value,
    tarifas: config.value.precios_frecuencia,
    plantillas_bonos: config.value.plantillas_bonos,
    metodos_pago: config.value.metodos_pago_aceptados,
    comunicacion: comunicacion.value,
    datos_fiscales: datosFiscales.value,
    exportado_en: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `terapli-config-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Cargar configuracion
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

      // Cargar configuracion principal
      if (terapeutaData.precio_sesion_base !== null) config.value.precio_sesion_base = terapeutaData.precio_sesion_base
      if (terapeutaData.duracion_sesion_minutos !== null) config.value.duracion_sesion_minutos = terapeutaData.duracion_sesion_minutos
      if (terapeutaData.metodos_pago_aceptados) config.value.metodos_pago_aceptados = terapeutaData.metodos_pago_aceptados
      if (terapeutaData.precios_frecuencia) config.value.precios_frecuencia = { ...config.value.precios_frecuencia, ...terapeutaData.precios_frecuencia }
      if (terapeutaData.plantillas_bonos) config.value.plantillas_bonos = terapeutaData.plantillas_bonos
      if (terapeutaData.configuracion_bonos) config.value.configuracion_bonos = { ...config.value.configuracion_bonos, ...terapeutaData.configuracion_bonos }

      // Cargar perfil
      if (terapeutaData.perfil) {
        perfil.value = { ...perfil.value, ...terapeutaData.perfil }
      }
      if (terapeutaData.nombre) perfil.value.nombre_mostrar = terapeutaData.nombre

      // Cargar agenda
      if (terapeutaData.configuracion_agenda) {
        agenda.value = { ...agenda.value, ...terapeutaData.configuracion_agenda }
      }

      // Cargar comunicacion
      if (terapeutaData.configuracion_comunicacion) {
        comunicacion.value = { ...comunicacion.value, ...terapeutaData.configuracion_comunicacion }
      }

      // Cargar datos fiscales
      if (terapeutaData.datos_fiscales) {
        const df = terapeutaData.datos_fiscales as any
        datosFiscales.value = {
          nif: df.nif || '',
          razon_social: df.razon_social || '',
          direccion: df.direccion || '',
          codigo_postal: df.codigo_postal || '',
          ciudad: df.ciudad || '',
          provincia: df.provincia || '',
          regimen_iva: df.regimen_iva || 'exento',
          numero_colegiado: df.numero_colegiado || ''
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
