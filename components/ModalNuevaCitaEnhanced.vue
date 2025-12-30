<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="handleClose">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left align-middle shadow-2xl transition-all max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
              <!-- Header -->
              <DialogTitle as="h3" id="modal-title" class="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6 flex items-center gap-3">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white flex-shrink-0">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Nueva Cita
              </DialogTitle>

              <!-- Form con secciones -->
              <form @submit.prevent="handleSubmit" class="space-y-6">

                <!-- ═══════════════════════════════════════════════════════════════ -->
                <!-- SECCIÓN 1: PACIENTE -->
                <!-- ═══════════════════════════════════════════════════════════════ -->
                <section class="space-y-3">
                  <div class="flex items-center gap-2 pb-2 border-b border-neutral-100">
                    <div class="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                      <svg class="w-3.5 h-3.5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 class="text-sm font-semibold text-neutral-700">Paciente</h4>
                    <span class="text-xs text-red-500">*</span>
                  </div>

                  <div class="relative">

                  <!-- Modo: Seleccionar paciente existente -->
                  <div v-if="!modoCrearPaciente" class="space-y-2">
                    <!-- Input de búsqueda -->
                    <div class="relative">
                      <label for="patient-search" class="sr-only">Buscar paciente</label>
                      <input
                        id="patient-search"
                        v-model="searchQuery"
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        autocomplete="off"
                        aria-describedby="patient-search-hint"
                        aria-expanded="showDropdown"
                        aria-haspopup="listbox"
                        class="w-full px-4 py-3 pr-10 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                        @focus="showDropdown = true"
                        @blur="handleBlur"
                      />
                      <span id="patient-search-hint" class="sr-only">Escribe para buscar pacientes existentes o crear uno nuevo</span>
                      <div class="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg v-if="loadingPacientes" class="animate-spin h-5 w-5 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    <!-- Dropdown de resultados - Diseño compacto y priorizado -->
                    <div
                      v-if="showDropdown && (hasPacientes || searchQuery.trim().length > 0)"
                      class="absolute z-10 w-full mt-1 bg-white border-2 border-neutral-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
                      role="listbox"
                      aria-label="Resultados de búsqueda de pacientes"
                    >
                      <!-- Encabezado sutil -->
                      <div v-if="hasPacientes" class="px-3 py-1.5 bg-neutral-50 border-b border-neutral-100">
                        <span class="text-[10px] text-neutral-400 uppercase tracking-wider">Pacientes frecuentes</span>
                      </div>

                      <!-- Pacientes encontrados - UI simplificada -->
                      <button
                        v-for="paciente in pacientes"
                        :key="paciente.id"
                        type="button"
                        class="w-full px-3 py-2.5 text-left hover:bg-violet-600/5 transition-colors border-b border-neutral-100 last:border-0 group"
                        @click="selectPaciente(paciente)"
                      >
                        <div class="flex items-center gap-3">
                          <!-- Avatar con inicial -->
                          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-[violet-700] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {{ paciente.nombre_completo.charAt(0).toUpperCase() }}
                          </div>

                          <!-- Info principal -->
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                              <p class="font-semibold text-neutral-900 truncate">{{ paciente.nombre_completo }}</p>
                              <!-- Indicador de cita reciente -->
                              <span
                                v-if="paciente.prioridad_score >= 100"
                                class="flex-shrink-0 w-2 h-2 rounded-full bg-violet-500"
                                title="Cita reciente"
                              ></span>
                            </div>
                            <!-- Info secundaria compacta -->
                            <div class="flex items-center gap-2 text-xs text-neutral-500">
                              <span v-if="paciente.total_citas > 0">{{ paciente.total_citas }} citas</span>
                              <span v-if="paciente.ultima_cita" class="text-neutral-400">·</span>
                              <span v-if="paciente.ultima_cita" class="text-neutral-400">
                                Última: {{ formatRelativeDate(paciente.ultima_cita) }}
                              </span>
                            </div>
                          </div>

                          <!-- Badge de sesiones - más prominente -->
                          <div
                            v-if="paciente.sesiones_restantes_total > 0"
                            class="flex-shrink-0 px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold"
                          >
                            {{ paciente.sesiones_restantes_total }}
                            <span class="font-medium">ses.</span>
                          </div>
                          <div
                            v-else
                            class="flex-shrink-0 px-2 py-1 bg-neutral-100 text-neutral-500 rounded-full text-xs"
                          >
                            Sin bono
                          </div>
                        </div>
                      </button>

                      <!-- Opción de crear nuevo paciente - más destacada -->
                      <button
                        type="button"
                        class="w-full px-3 py-3 text-left bg-gradient-to-r from-violet-600/5 to-transparent hover:from-violet-600/10 transition-colors border-t-2 border-violet-600/20 font-medium text-violet-600 flex items-center gap-2"
                        @click="activarModoCrearPaciente"
                      >
                        <div class="w-9 h-9 rounded-full bg-violet-600/10 flex items-center justify-center">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div>
                          <p class="font-semibold">Crear nuevo paciente</p>
                          <p v-if="searchQuery.trim().length > 0" class="text-xs text-neutral-500">
                            "{{ searchQuery.trim() }}"
                          </p>
                        </div>
                      </button>

                      <!-- Sin resultados -->
                      <div v-if="!hasPacientes && !loadingPacientes && searchQuery.trim().length > 0" class="px-4 py-6 text-center text-neutral-500">
                        <svg class="w-10 h-10 mx-auto mb-2 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p class="font-medium text-sm">No se encontró "{{ searchQuery }}"</p>
                        <p class="text-xs mt-1">Prueba con otro nombre o crea un nuevo paciente</p>
                      </div>
                    </div>

                    <!-- Paciente seleccionado - Card de resumen contextual -->
                    <div
                      v-if="formData.paciente_id && pacienteSeleccionado"
                      class="space-y-3"
                    >
                      <!-- Header del paciente con alertas -->
                      <div class="bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl overflow-hidden">
                        <!-- Barra de alertas solo para paciente nuevo (sin bono se muestra abajo más detallado) -->
                        <div
                          v-if="pacienteSeleccionado.total_citas === 0"
                          class="px-3 py-1.5 text-xs font-medium flex items-center gap-2 bg-blue-100 text-blue-700"
                        >
                          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                          </svg>
                          Paciente nuevo - Primera cita
                        </div>

                        <!-- Info principal del paciente -->
                        <div class="px-4 py-3">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                              <div class="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                {{ pacienteSeleccionado.nombre_completo.charAt(0).toUpperCase() }}
                              </div>
                              <div>
                                <p class="font-semibold text-neutral-900">{{ pacienteSeleccionado.nombre_completo }}</p>
                                <p class="text-xs text-neutral-500">{{ pacienteSeleccionado.email }}</p>
                              </div>
                            </div>
                            <div class="flex items-center gap-2">
                              <!-- Botón ver perfil -->
                              <a
                                :href="`/terapeuta/pacientes/${pacienteSeleccionado.id}`"
                                target="_blank"
                                class="p-2 text-neutral-400 hover:text-violet-600 hover:bg-white rounded-lg transition-colors"
                                title="Ver perfil completo"
                              >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                              <button
                                type="button"
                                @click="limpiarSeleccion"
                                class="p-2 hover:bg-white rounded-lg transition-colors text-neutral-400 hover:text-red-500"
                                title="Cambiar paciente"
                              >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <!-- Métricas rápidas del paciente -->
                          <div class="mt-3 grid grid-cols-3 gap-2 text-center">
                            <div class="bg-white/60 rounded-lg px-2 py-1.5">
                              <p class="text-xs text-neutral-500">Última cita</p>
                              <p class="text-sm font-semibold text-neutral-700">
                                {{ pacienteSeleccionado.ultima_cita ? formatRelativeDate(pacienteSeleccionado.ultima_cita) : 'Nunca' }}
                              </p>
                            </div>
                            <div class="bg-white/60 rounded-lg px-2 py-1.5">
                              <p class="text-xs text-neutral-500">Total citas</p>
                              <p class="text-sm font-semibold text-neutral-700">{{ pacienteSeleccionado.total_citas || 0 }}</p>
                            </div>
                            <div class="bg-white/60 rounded-lg px-2 py-1.5">
                              <p class="text-xs text-neutral-500">Sesiones</p>
                              <p class="text-sm font-semibold" :class="pacienteSeleccionado.sesiones_restantes_total > 0 ? 'text-violet-600' : 'text-neutral-400'">
                                {{ pacienteSeleccionado.sesiones_restantes_total || 0 }} disp.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Información del Bono -->
                      <div v-if="pacienteSeleccionado.bono_activo" class="px-4 py-3 bg-violet-50 border-2 border-violet-200 rounded-xl">
                        <div class="flex items-start justify-between">
                          <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                            </div>
                            <div>
                              <p class="font-semibold text-violet-900">{{ pacienteSeleccionado.bono_activo.tipo }}</p>
                              <p class="text-sm text-violet-700">
                                {{ pacienteSeleccionado.bono_activo.sesiones_restantes }} de {{ pacienteSeleccionado.bono_activo.sesiones_totales }} sesiones disponibles
                              </p>
                            </div>
                          </div>
                          <!-- Indicador visual de sesiones -->
                          <div class="flex items-center gap-1">
                            <template v-for="i in Math.min(pacienteSeleccionado.bono_activo.sesiones_totales, 10)" :key="i">
                              <div
                                class="w-3 h-3 rounded-full"
                                :class="i <= pacienteSeleccionado.bono_activo.sesiones_usadas ? 'bg-violet-600' : 'bg-violet-200'"
                                :title="i <= pacienteSeleccionado.bono_activo.sesiones_usadas ? 'Sesión usada' : 'Sesión disponible'"
                              ></div>
                            </template>
                            <span v-if="pacienteSeleccionado.bono_activo.sesiones_totales > 10" class="text-xs text-violet-500 ml-1">
                              +{{ pacienteSeleccionado.bono_activo.sesiones_totales - 10 }}
                            </span>
                          </div>
                        </div>

                        <!-- Mensaje informativo sobre descuento -->
                        <div class="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                          <p class="text-xs text-amber-800 flex items-start gap-2">
                            <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                            <span>
                              Esta será la sesión <strong>{{ pacienteSeleccionado.bono_activo.sesiones_usadas + 1 }}/{{ pacienteSeleccionado.bono_activo.sesiones_totales }}</strong> del bono.
                              Se descontará automáticamente cuando la cita sea <strong>confirmada</strong>.
                            </span>
                          </p>
                        </div>

                        <!-- Vencimiento si existe -->
                        <p v-if="pacienteSeleccionado.bono_activo.fecha_fin" class="mt-2 text-xs text-violet-600">
                          Vence: {{ formatDate(pacienteSeleccionado.bono_activo.fecha_fin) }}
                        </p>
                      </div>

                      <!-- Sin bono activo - más visual -->
                      <div v-else class="px-4 py-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
                        <div class="flex items-start gap-3">
                          <div class="w-8 h-8 rounded-lg bg-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p class="font-medium text-amber-800 text-sm">Sin bono activo</p>
                            <p class="text-xs text-amber-600 mt-0.5">Esta sesión se facturará de forma individual.</p>
                          </div>
                        </div>
                      </div>

                      <!-- Selector de bono si tiene múltiples -->
                      <div v-if="pacienteSeleccionado.bonos && pacienteSeleccionado.bonos.length > 1" class="mt-2">
                        <label class="block text-sm font-medium text-neutral-700 mb-1">
                          Seleccionar bono a usar
                        </label>
                        <select
                          v-model="formData.bono_id"
                          class="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                        >
                          <option v-for="bono in pacienteSeleccionado.bonos" :key="bono.id" :value="bono.id">
                            {{ bono.tipo }} - {{ bono.sesiones_restantes }}/{{ bono.sesiones_totales }} sesiones
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Modo: Crear nuevo paciente -->
                  <div v-else class="space-y-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="font-semibold text-neutral-900 flex items-center gap-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Crear Nuevo Paciente
                      </h4>
                      <button
                        type="button"
                        @click="cancelarCrearPaciente"
                        class="text-sm text-neutral-600 hover:text-neutral-900"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div class="col-span-2">
                        <input
                          v-model="nuevoPaciente.nombre_completo"
                          type="text"
                          placeholder="Nombre completo *"
                          class="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div class="col-span-2">
                        <input
                          v-model="nuevoPaciente.email"
                          type="email"
                          placeholder="Email *"
                          class="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          v-model="nuevoPaciente.telefono"
                          type="tel"
                          placeholder="Teléfono"
                          class="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          v-model="nuevoPaciente.fecha_nacimiento"
                          type="date"
                          placeholder="Fecha de nacimiento"
                          class="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="crearPacienteYSeleccionar"
                      :disabled="!nuevoPaciente.nombre_completo || !nuevoPaciente.email || creandoPaciente"
                      class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                    >
                      <svg v-if="creandoPaciente" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ creandoPaciente ? 'Creando...' : 'Crear Paciente' }}
                    </button>
                  </div>
                  </div>
                </section>

                <!-- ═══════════════════════════════════════════════════════════════ -->
                <!-- SECCIÓN 2: FECHA Y HORA -->
                <!-- ═══════════════════════════════════════════════════════════════ -->
                <section class="space-y-4 pt-2">
                  <div class="flex items-center gap-2 pb-2 border-b border-neutral-100">
                    <div class="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 class="text-sm font-semibold text-neutral-700">Fecha y Hora</h4>
                    <span class="text-xs text-red-500">*</span>
                  </div>

                  <!-- Shortcuts de fecha rápidos -->
                  <div>
                    <label for="fecha-cita" class="sr-only">Fecha de la cita</label>
                    <div class="flex flex-wrap gap-2 mb-2" role="group" aria-label="Fechas rápidas">
                      <button
                        v-for="shortcut in fechaShortcuts"
                        :key="shortcut.label"
                        type="button"
                        @click="aplicarShortcutFecha(shortcut)"
                        class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-1"
                        :class="formData.fecha_cita === shortcut.fecha
                          ? 'bg-violet-600 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'"
                        :aria-pressed="formData.fecha_cita === shortcut.fecha"
                      >
                        {{ shortcut.label }}
                      </button>
                    </div>
                    <input
                      id="fecha-cita"
                      v-model="formData.fecha_cita"
                      type="date"
                      required
                      :min="hoyISO"
                      aria-required="true"
                      class="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                      @change="validateInRealTime"
                    />
                    <!-- Mostrar fecha formateada -->
                    <p v-if="formData.fecha_cita" class="mt-1 text-xs text-neutral-500">
                      {{ formatearFechaCompleta(formData.fecha_cita) }}
                    </p>
                  </div>

                  <!-- Sugerencia inteligente de horario -->
                  <div
                    v-if="sugerenciaHorario && !formData.hora_inicio"
                    class="px-3 py-2 bg-violet-50 border border-violet-200 rounded-lg flex items-center justify-between"
                  >
                    <div class="flex items-center gap-2 text-violet-700 text-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>{{ sugerenciaHorario.razon }}</span>
                    </div>
                    <button
                      type="button"
                      @click="formData.hora_inicio = sugerenciaHorario.hora"
                      class="px-2 py-1 bg-violet-600 text-white text-xs font-medium rounded hover:bg-violet-700 transition-colors"
                    >
                      Usar {{ sugerenciaHorario.hora }}
                    </button>
                  </div>

                  <!-- Hora con selectores de intervalo -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-neutral-700 mb-2">
                        Hora inicio *
                      </label>
                      <select
                        v-model="formData.hora_inicio"
                        required
                        class="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
                        @change="onHoraInicioChange"
                      >
                        <option value="" disabled>Seleccionar hora</option>
                        <option v-for="hora in horasDisponibles" :key="hora.value" :value="hora.value">
                          {{ hora.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-neutral-700 mb-2">
                        Hora fin *
                        <span class="font-normal text-neutral-400">({{ duracionCita }})</span>
                      </label>
                      <select
                        v-model="formData.hora_fin"
                        required
                        class="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
                        @change="validateInRealTime"
                      >
                        <option value="" disabled>Seleccionar hora</option>
                        <option v-for="hora in horasFinDisponibles" :key="hora.value" :value="hora.value">
                          {{ hora.label }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Duración rápida -->
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-neutral-500">Duración rápida:</span>
                    <button
                      v-for="dur in duracionesRapidas"
                      :key="dur.minutos"
                      type="button"
                      @click="aplicarDuracion(dur.minutos)"
                      class="px-2 py-1 text-xs rounded-md transition-all"
                      :class="calcularDuracionMinutos() === dur.minutos
                        ? 'bg-violet-600/10 text-violet-600 font-medium'
                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'"
                    >
                      {{ dur.label }}
                    </button>
                  </div>

                  <!-- Validación en tiempo real -->
                  <div
                    v-if="validationMessage"
                    class="px-4 py-3 rounded-xl flex items-start gap-3"
                  :class="{
                    'bg-red-50 border-2 border-red-200': validationMessage.type === 'error',
                    'bg-yellow-50 border-2 border-yellow-200': validationMessage.type === 'warning',
                    'bg-violet-50 border-2 border-violet-200': validationMessage.type === 'success'
                  }"
                >
                  <svg
                    class="w-5 h-5 mt-0.5 flex-shrink-0"
                    :class="{
                      'text-red-600': validationMessage.type === 'error',
                      'text-yellow-600': validationMessage.type === 'warning',
                      'text-violet-600': validationMessage.type === 'success'
                    }"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path v-if="validationMessage.type === 'error'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    <path v-else-if="validationMessage.type === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    <path v-else fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <p class="text-sm font-medium flex-1" :class="{
                    'text-red-800': validationMessage.type === 'error',
                    'text-yellow-800': validationMessage.type === 'warning',
                    'text-violet-800': validationMessage.type === 'success'
                  }">
                    {{ validationMessage.text }}
                  </p>
                  </div>
                </section>

                <!-- ═══════════════════════════════════════════════════════════════ -->
                <!-- SECCIÓN 3: MODALIDAD Y ACCESO -->
                <!-- ═══════════════════════════════════════════════════════════════ -->
                <section class="space-y-4 pt-2">
                  <div class="flex items-center gap-2 pb-2 border-b border-neutral-100">
                    <div class="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                      <svg class="w-3.5 h-3.5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 class="text-sm font-semibold text-neutral-700">Modalidad</h4>
                    <span class="text-xs text-red-500">*</span>
                    <!-- Chip de sugerencia de modalidad por día -->
                    <span
                      v-if="sugerenciaModalidad && formData.modalidad !== sugerenciaModalidad"
                      class="ml-auto text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1 cursor-pointer hover:bg-amber-200 transition-colors"
                      @click="seleccionarModalidad(sugerenciaModalidad)"
                      :title="`Normalmente usas ${sugerenciaModalidad} los ${nombreDiaSeleccionado}`"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      {{ modalidades.find(m => m.value === sugerenciaModalidad)?.label }} los {{ nombreDiaSeleccionado }}
                    </span>
                  </div>
                  <div class="grid grid-cols-3 gap-3">
                    <button
                      v-for="modalidad in modalidades"
                      :key="modalidad.value"
                      type="button"
                      @click="seleccionarModalidad(modalidad.value)"
                      class="relative px-4 py-4 rounded-xl border-2 transition-all font-medium flex flex-col items-center gap-2 group"
                      :class="formData.modalidad === modalidad.value
                        ? 'border-violet-600 bg-gradient-to-br from-violet-600/10 to-violet-600/5 text-violet-600 shadow-md'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'"
                    >
                      <!-- Indicador de selección -->
                      <div
                        v-if="formData.modalidad === modalidad.value"
                        class="absolute top-2 right-2 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center"
                      >
                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <span class="text-2xl">{{ modalidad.icon }}</span>
                      <span class="text-sm font-semibold">{{ modalidad.label }}</span>
                      <span class="text-[10px] text-neutral-400 group-hover:text-neutral-500">{{ modalidad.descripcion }}</span>
                    </button>
                  </div>

                  <!-- Campo condicional: Sala/Consultorio (Presencial) -->
                  <div v-if="formData.modalidad === 'presencial'" class="space-y-2">
                    <label id="ubicacion-label" class="block text-sm font-semibold text-neutral-700">
                      Sala / Consultorio
                      <span class="font-normal text-neutral-400">(opcional)</span>
                    </label>
                    <div class="relative">
                      <div class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <input
                        v-model="formData.ubicacion"
                        type="text"
                        aria-labelledby="ubicacion-label"
                        placeholder="Ej: Consultorio 3, Sala de terapia..."
                        class="w-full pl-10 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <!-- Campo condicional: Enlace videollamada (Online) -->
                  <div v-if="formData.modalidad === 'online'" class="space-y-2">
                    <label id="enlace-label" class="block text-sm font-semibold text-neutral-700">
                      Enlace de videollamada
                      <span class="font-normal text-neutral-400">(opcional)</span>
                    </label>
                    <div class="relative">
                      <!-- Icono dinámico según plataforma detectada -->
                      <div class="absolute left-3 top-1/2 -translate-y-1/2">
                        <img
                          v-if="plataformaDetectada === 'meet'"
                          src="https://www.gstatic.com/meet/google_meet_horizontal_wordmark_2020q4_1x_icon_124_40_2373e79660dabbf194273d27aa7ee1f5.png"
                          alt="Google Meet"
                          class="w-5 h-5 object-contain"
                        />
                        <img
                          v-else-if="plataformaDetectada === 'zoom'"
                          src="https://st1.zoom.us/zoom.ico"
                          alt="Zoom"
                          class="w-5 h-5 object-contain"
                        />
                        <img
                          v-else-if="plataformaDetectada === 'teams'"
                          src="https://cdn-icons-png.flaticon.com/512/906/906349.png"
                          alt="Teams"
                          class="w-5 h-5 object-contain"
                        />
                        <svg v-else class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        v-model="formData.enlace_videollamada"
                        type="url"
                        aria-labelledby="enlace-label"
                        :aria-invalid="enlaceValido === false"
                        placeholder="Pega el enlace de Meet, Zoom o Teams..."
                        class="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                        :class="enlaceValido === false
                          ? 'border-red-300 bg-red-50'
                          : enlaceValido === true
                            ? 'border-violet-300 bg-violet-50'
                            : 'border-neutral-200'"
                      />
                      <!-- Badge de plataforma detectada -->
                      <div
                        v-if="plataformaDetectada && enlaceValido"
                        class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs font-medium"
                      >
                        {{ plataformaNombre }}
                      </div>
                    </div>
                    <!-- Mensaje de validación -->
                    <p v-if="formData.enlace_videollamada && enlaceValido === false" class="text-xs text-red-600" role="alert">
                      Enlace no reconocido. Usa Google Meet, Zoom o Microsoft Teams.
                    </p>
                    <p v-else-if="!formData.enlace_videollamada" class="text-xs text-neutral-400">
                      Compatible con Google Meet, Zoom y Microsoft Teams
                    </p>
                  </div>

                  <!-- Info para modalidad Teléfono -->
                  <div v-if="formData.modalidad === 'telefonica'" class="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl" role="note">
                    <div class="flex items-start gap-2 text-blue-700">
                      <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div class="text-sm">
                        <p class="font-medium">Sesión por teléfono</p>
                        <p class="text-blue-600 text-xs mt-0.5">Se utilizará el número de contacto del paciente para la llamada.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- ═══════════════════════════════════════════════════════════════ -->
                <!-- SECCIÓN 4: OBSERVACIONES (OPCIONAL) -->
                <!-- ═══════════════════════════════════════════════════════════════ -->
                <section class="space-y-3 pt-2">
                  <div class="flex items-center gap-2 pb-2 border-b border-neutral-100">
                    <div class="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                      <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h4 class="text-sm font-semibold text-neutral-700">Observaciones</h4>
                    <span class="text-xs text-neutral-400">(opcional)</span>
                    <!-- Contador de caracteres -->
                    <span
                      v-if="formData.observaciones"
                      class="ml-auto text-xs"
                      :class="(formData.observaciones?.length || 0) > 450 ? 'text-amber-600' : 'text-neutral-400'"
                    >
                      {{ formData.observaciones?.length || 0 }}/500
                    </span>
                  </div>

                  <!-- Templates rápidos -->
                  <div class="flex flex-wrap gap-1.5" role="group" aria-label="Plantillas rápidas de observación">
                    <button
                      v-for="template in templatesObservaciones"
                      :key="template.texto"
                      type="button"
                      @click="aplicarTemplateObservacion(template.texto)"
                      class="px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-1"
                      :class="formData.observaciones?.includes(template.texto)
                        ? 'bg-violet-600/10 text-violet-600 font-medium'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'"
                      :aria-pressed="formData.observaciones?.includes(template.texto)"
                    >
                      <span aria-hidden="true">{{ template.emoji }}</span>
                      <span>{{ template.label }}</span>
                    </button>
                  </div>

                  <!-- Textarea expandible -->
                  <div class="relative">
                    <textarea
                      id="observaciones-textarea"
                      v-model="formData.observaciones"
                      :rows="observacionesExpandido ? 5 : 2"
                      maxlength="500"
                      aria-label="Observaciones"
                      aria-describedby="observaciones-hint"
                      placeholder="Ej: Primera sesión de evaluación, seguimiento ansiedad, revisión de objetivos terapéuticos..."
                      class="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all resize-none"
                      @focus="observacionesExpandido = true"
                      @blur="observacionesExpandido = formData.observaciones?.length > 0"
                    ></textarea>
                    <span id="observaciones-hint" class="sr-only">Máximo 500 caracteres. Usa las plantillas rápidas para añadir texto predefinido.</span>
                    <!-- Botón expandir/contraer -->
                    <button
                      v-if="!observacionesExpandido && !formData.observaciones"
                      type="button"
                      @click="observacionesExpandido = true"
                      class="absolute bottom-2 right-2 text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1 focus:outline-none focus:text-violet-600"
                      aria-label="Expandir campo de observaciones"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                      Expandir
                    </button>
                  </div>
                </section>

                <!-- ═══════════════════════════════════════════════════════════════ -->
                <!-- SECCIÓN 5: ACCIONES -->
                <!-- ═══════════════════════════════════════════════════════════════ -->
                <div class="space-y-3 pt-6 border-t border-neutral-100">
                  <!-- Fila principal de botones -->
                  <div class="flex flex-col sm:flex-row gap-3">
                    <!-- Botón Cancelar -->
                    <button
                      type="button"
                      @click="handleClose"
                      class="order-3 sm:order-1 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
                    >
                      Cancelar
                    </button>

                    <!-- Botón Crear y Agendar Otra (secundario) -->
                    <button
                      type="button"
                      @click="handleSubmitAndNew"
                      :disabled="isSubmitting || !canSubmit"
                      class="order-2 flex-1 px-4 py-3 border-2 border-violet-600 text-violet-600 rounded-xl hover:bg-violet-600/5 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span class="hidden sm:inline">Crear y agendar otra</span>
                      <span class="sm:hidden">+ Otra</span>
                    </button>

                    <!-- Botón Crear Cita (principal) -->
                    <button
                      type="submit"
                      :disabled="isSubmitting || !canSubmit"
                      class="order-1 sm:order-3 flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-[violet-700] text-white rounded-xl hover:shadow-lg hover:shadow-violet-600/25 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2"
                    >
                      <svg v-if="isSubmitting" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {{ isSubmitting ? 'Creando...' : 'Crear Cita' }}
                    </button>
                  </div>

                  <!-- Atajos de teclado (solo desktop) -->
                  <div class="hidden md:flex items-center justify-end gap-4 text-xs text-neutral-400">
                    <span class="flex items-center gap-1">
                      <kbd class="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-500 font-mono">Esc</kbd>
                      <span>Cancelar</span>
                    </span>
                    <span class="flex items-center gap-1">
                      <kbd class="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-500 font-mono">Ctrl</kbd>
                      <span>+</span>
                      <kbd class="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-500 font-mono">Enter</kbd>
                      <span>Crear</span>
                    </span>
                  </div>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { usePacientes, type PacienteBusqueda, type CreatePacienteParams } from '~/composables/usePacientes'
import { useAgendaEnhanced, type CreateAppointmentParams } from '~/composables/useAgendaEnhanced'
import { useConfiguracionAgenda } from '~/composables/useConfiguracionAgenda'
import { agendaLogger } from '~/utils/agenda-logger'

// Props
const props = defineProps<{
  isOpen: boolean
  fechaInicial?: string
  horaInicial?: string
  horaFinal?: string
}>()

// Emits
const emit = defineEmits<{
  close: []
  created: [cita: any]
}>()

// Composables
const {
  pacientes,
  loading: loadingPacientes,
  hasPacientes,
  searchQuery,
  createPaciente,
  loadAllPacientes,
  clearSearch
} = usePacientes()

const {
  createAppointment,
  validateAppointment
} = useAgendaEnhanced()

// Configuración de agenda del terapeuta (horarios)
const {
  configuracion: configAgenda,
  cargarConfiguracion,
  obtenerHorarioEfectivo
} = useConfiguracionAgenda()

// Estado
const showDropdown = ref(false)
const modoCrearPaciente = ref(false)
const creandoPaciente = ref(false)
const isSubmitting = ref(false)
const pacienteSeleccionado = ref<PacienteBusqueda | null>(null)
const validationMessage = ref<{ type: 'error' | 'warning' | 'success', text: string } | null>(null)
const validationTimeout = ref<NodeJS.Timeout | null>(null)

// Form data - modalidad se inicializa en onMounted con cargarUltimaModalidad()
const formData = ref<CreateAppointmentParams>({
  paciente_id: '',
  fecha_cita: props.fechaInicial || '',
  hora_inicio: props.horaInicial || '',
  hora_fin: '',
  modalidad: 'online', // Se sobrescribe con la última usada
  estado: 'pendiente'
})

const nuevoPaciente = ref<CreatePacienteParams>({
  nombre_completo: '',
  email: '',
  telefono: '',
  fecha_nacimiento: ''
})

// Modalidades con descripciones
const modalidades = [
  { value: 'presencial', label: 'Presencial', icon: '🏢', descripcion: 'En consultorio' },
  { value: 'online', label: 'Online', icon: '💻', descripcion: 'Videollamada' },
  { value: 'telefonica', label: 'Teléfono', icon: '📞', descripcion: 'Llamada de voz' }
]

// Claves localStorage
const MODALIDAD_STORAGE_KEY = 'terapli-ultima-modalidad'
const MODALIDAD_POR_DIA_KEY = 'terapli-modalidad-por-dia'
const BORRADOR_CITA_KEY = 'terapli-borrador-cita'
const PATRONES_PACIENTE_KEY = 'terapli-patrones-paciente'

// Estado para borrador y sugerencias
const borradorRestaurado = ref(false)
const sugerenciaHorario = ref<{ hora: string; razon: string } | null>(null)

// ═══════════════════════════════════════════════════════════════
// SISTEMA DE BORRADOR LOCAL (auto-guardado)
// ═══════════════════════════════════════════════════════════════

interface BorradorCita {
  paciente_id: string
  paciente_nombre?: string
  fecha_cita: string
  hora_inicio: string
  hora_fin: string
  modalidad: string
  observaciones?: string
  timestamp: number
}

function guardarBorrador() {
  if (!import.meta.client) return

  // Solo guardar si hay datos significativos
  if (!formData.value.paciente_id && !formData.value.fecha_cita) return

  const borrador: BorradorCita = {
    paciente_id: formData.value.paciente_id,
    paciente_nombre: pacienteSeleccionado.value?.nombre_completo,
    fecha_cita: formData.value.fecha_cita,
    hora_inicio: formData.value.hora_inicio,
    hora_fin: formData.value.hora_fin,
    modalidad: formData.value.modalidad,
    observaciones: formData.value.observaciones,
    timestamp: Date.now()
  }

  localStorage.setItem(BORRADOR_CITA_KEY, JSON.stringify(borrador))
}

function cargarBorrador(): BorradorCita | null {
  if (!import.meta.client) return null

  const guardado = localStorage.getItem(BORRADOR_CITA_KEY)
  if (!guardado) return null

  try {
    const borrador = JSON.parse(guardado) as BorradorCita
    // Borrador válido si tiene menos de 1 hora
    const unaHora = 60 * 60 * 1000
    if (Date.now() - borrador.timestamp > unaHora) {
      limpiarBorrador()
      return null
    }
    return borrador
  } catch {
    return null
  }
}

function limpiarBorrador() {
  if (import.meta.client) {
    localStorage.removeItem(BORRADOR_CITA_KEY)
  }
  borradorRestaurado.value = false
}

function restaurarBorrador(borrador: BorradorCita) {
  formData.value.paciente_id = borrador.paciente_id
  formData.value.fecha_cita = borrador.fecha_cita
  formData.value.hora_inicio = borrador.hora_inicio
  formData.value.hora_fin = borrador.hora_fin
  formData.value.modalidad = borrador.modalidad
  formData.value.observaciones = borrador.observaciones || ''

  borradorRestaurado.value = true

  validationMessage.value = {
    type: 'success',
    text: 'Borrador restaurado. Puedes continuar donde lo dejaste.'
  }

  setTimeout(() => {
    if (validationMessage.value?.type === 'success') {
      validationMessage.value = null
    }
  }, 4000)
}

// ═══════════════════════════════════════════════════════════════
// APRENDIZAJE DE PATRONES (modalidad por día de la semana)
// ═══════════════════════════════════════════════════════════════

interface ModalidadPorDia {
  [dia: number]: { [modalidad: string]: number } // día 0-6, conteo por modalidad
}

function registrarPatronModalidad(fecha: string, modalidad: string) {
  if (!import.meta.client) return

  const dia = new Date(fecha).getDay()
  const patrones = cargarPatronesModalidad()

  if (!patrones[dia]) {
    patrones[dia] = {}
  }

  patrones[dia][modalidad] = (patrones[dia][modalidad] || 0) + 1

  localStorage.setItem(MODALIDAD_POR_DIA_KEY, JSON.stringify(patrones))
}

function cargarPatronesModalidad(): ModalidadPorDia {
  if (!import.meta.client) return {}

  try {
    const guardado = localStorage.getItem(MODALIDAD_POR_DIA_KEY)
    return guardado ? JSON.parse(guardado) : {}
  } catch {
    return {}
  }
}

function obtenerModalidadSugeridaPorDia(fecha: string): string | null {
  if (!import.meta.client || !fecha) return null

  const dia = new Date(fecha).getDay()
  const patrones = cargarPatronesModalidad()

  if (!patrones[dia]) return null

  // Encontrar la modalidad más frecuente para este día
  let maxConteo = 0
  let modalidadFrecuente: string | null = null

  for (const [modalidad, conteo] of Object.entries(patrones[dia])) {
    if (conteo > maxConteo) {
      maxConteo = conteo
      modalidadFrecuente = modalidad
    }
  }

  // Solo sugerir si hay al menos 3 ocurrencias
  return maxConteo >= 3 ? modalidadFrecuente : null
}

// ═══════════════════════════════════════════════════════════════
// SUGERENCIAS DE HORARIO BASADAS EN HISTORIAL DEL PACIENTE
// ═══════════════════════════════════════════════════════════════

interface PatronesPaciente {
  [pacienteId: string]: {
    horasFrecuentes: { [hora: string]: number }
    preferenciaTurno: 'mañana' | 'tarde' | null
  }
}

function registrarPatronPaciente(pacienteId: string, horaInicio: string) {
  if (!import.meta.client || !pacienteId || !horaInicio) return

  const patrones = cargarPatronesPaciente()

  if (!patrones[pacienteId]) {
    patrones[pacienteId] = { horasFrecuentes: {}, preferenciaTurno: null }
  }

  // Registrar hora
  patrones[pacienteId].horasFrecuentes[horaInicio] =
    (patrones[pacienteId].horasFrecuentes[horaInicio] || 0) + 1

  // Calcular preferencia de turno
  const hora = parseInt(horaInicio.split(':')[0])
  let mañanas = 0
  let tardes = 0

  for (const [h, conteo] of Object.entries(patrones[pacienteId].horasFrecuentes)) {
    const horaNum = parseInt(h.split(':')[0])
    if (horaNum < 14) mañanas += conteo
    else tardes += conteo
  }

  patrones[pacienteId].preferenciaTurno =
    mañanas > tardes ? 'mañana' : tardes > mañanas ? 'tarde' : null

  localStorage.setItem(PATRONES_PACIENTE_KEY, JSON.stringify(patrones))
}

function cargarPatronesPaciente(): PatronesPaciente {
  if (!import.meta.client) return {}

  try {
    const guardado = localStorage.getItem(PATRONES_PACIENTE_KEY)
    return guardado ? JSON.parse(guardado) : {}
  } catch {
    return {}
  }
}

function obtenerSugerenciaHorario(pacienteId: string): { hora: string; razon: string } | null {
  if (!import.meta.client || !pacienteId) return null

  const patrones = cargarPatronesPaciente()
  const paciente = patrones[pacienteId]

  if (!paciente) return null

  // Encontrar la hora más frecuente
  let maxConteo = 0
  let horaFrecuente: string | null = null

  for (const [hora, conteo] of Object.entries(paciente.horasFrecuentes)) {
    if (conteo > maxConteo) {
      maxConteo = conteo
      horaFrecuente = hora
    }
  }

  // Solo sugerir si hay al menos 2 ocurrencias
  if (maxConteo >= 2 && horaFrecuente) {
    const turno = paciente.preferenciaTurno
    const razon = turno
      ? `Horario habitual (prefiere ${turno === 'mañana' ? 'mañanas' : 'tardes'})`
      : `Horario habitual del paciente`
    return { hora: horaFrecuente, razon }
  }

  return null
}

// Computed para mostrar sugerencia de modalidad por día
const sugerenciaModalidad = computed(() => {
  if (!formData.value.fecha_cita) return null
  return obtenerModalidadSugeridaPorDia(formData.value.fecha_cita)
})

// Computed para nombre del día
const nombreDiaSeleccionado = computed(() => {
  if (!formData.value.fecha_cita) return ''
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const dia = new Date(formData.value.fecha_cita).getDay()
  return dias[dia]
})

// Templates rápidos para observaciones
const templatesObservaciones = [
  { emoji: '🆕', label: 'Primera sesión', texto: 'Primera sesión de evaluación' },
  { emoji: '📋', label: 'Seguimiento', texto: 'Sesión de seguimiento' },
  { emoji: '🎯', label: 'Objetivos', texto: 'Revisión de objetivos terapéuticos' },
  { emoji: '⚠️', label: 'Urgente', texto: 'Sesión de urgencia/crisis' },
  { emoji: '👨‍👩‍👧', label: 'Familiar', texto: 'Sesión familiar' },
  { emoji: '📝', label: 'Evaluación', texto: 'Aplicación de pruebas/evaluación' }
]

// Estado para expandir observaciones
const observacionesExpandido = ref(false)

// Duraciones rápidas
const duracionesRapidas = [
  { minutos: 30, label: '30 min' },
  { minutos: 45, label: '45 min' },
  { minutos: 60, label: '1 hora' },
  { minutos: 90, label: '1:30 h' }
]

// Fecha de hoy en formato ISO
const hoyISO = computed(() => {
  const hoy = new Date()
  return hoy.toISOString().split('T')[0]
})

// Shortcuts de fecha
const fechaShortcuts = computed(() => {
  const hoy = new Date()
  const manana = new Date(hoy)
  manana.setDate(hoy.getDate() + 1)

  // Calcular próximo lunes
  const proxLunes = new Date(hoy)
  const diasHastaLunes = (8 - hoy.getDay()) % 7 || 7
  proxLunes.setDate(hoy.getDate() + diasHastaLunes)

  // Próximo miércoles
  const proxMiercoles = new Date(hoy)
  const diasHastaMiercoles = (10 - hoy.getDay()) % 7 || 7
  proxMiercoles.setDate(hoy.getDate() + diasHastaMiercoles)

  return [
    { label: 'Hoy', fecha: hoy.toISOString().split('T')[0] },
    { label: 'Mañana', fecha: manana.toISOString().split('T')[0] },
    { label: 'Próx. lunes', fecha: proxLunes.toISOString().split('T')[0] },
    { label: 'Próx. miércoles', fecha: proxMiercoles.toISOString().split('T')[0] }
  ]
})

// Generar horas disponibles basadas en la configuración del terapeuta
const horasDisponibles = computed(() => {
  const horas: { value: string; label: string }[] = []
  const horario = configAgenda.value?.horario

  // Valores por defecto si no hay configuración
  const inicioManana = horario?.inicio_manana || '09:00'
  const finManana = horario?.fin_manana || '14:00'
  const inicioTarde = horario?.inicio_tarde || '16:00'
  const finTarde = horario?.fin_tarde || '21:00'

  // Parsear horas
  const [hInicioM] = inicioManana.split(':').map(Number)
  const [hFinM] = finManana.split(':').map(Number)
  const [hInicioT] = inicioTarde.split(':').map(Number)
  const [hFinT] = finTarde.split(':').map(Number)

  // Generar slots de mañana (hasta 30 min antes del fin para permitir citas de 1h)
  for (let h = hInicioM; h < hFinM; h++) {
    for (let m = 0; m < 60; m += 30) {
      const horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      const label = `${h}:${m.toString().padStart(2, '0')}`
      horas.push({ value: horaStr, label })
    }
  }

  // Generar slots de tarde
  for (let h = hInicioT; h < hFinT; h++) {
    for (let m = 0; m < 60; m += 30) {
      const horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      const label = `${h}:${m.toString().padStart(2, '0')}`
      horas.push({ value: horaStr, label })
    }
  }

  return horas
})

// Horas fin disponibles (después de hora inicio)
const horasFinDisponibles = computed(() => {
  if (!formData.value.hora_inicio) return horasDisponibles.value

  const [hInicio, mInicio] = formData.value.hora_inicio.split(':').map(Number)
  const minutosInicio = hInicio * 60 + mInicio

  return horasDisponibles.value.filter(h => {
    const [hFin, mFin] = h.value.split(':').map(Number)
    return hFin * 60 + mFin > minutosInicio
  })
})

// Calcular duración de la cita
const duracionCita = computed(() => {
  if (!formData.value.hora_inicio || !formData.value.hora_fin) return ''
  const minutos = calcularDuracionMinutos()
  if (minutos <= 0) return ''
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`
})

// Calcular duración en minutos
function calcularDuracionMinutos(): number {
  if (!formData.value.hora_inicio || !formData.value.hora_fin) return 0
  const [hI, mI] = formData.value.hora_inicio.split(':').map(Number)
  const [hF, mF] = formData.value.hora_fin.split(':').map(Number)
  return (hF * 60 + mF) - (hI * 60 + mI)
}

// Detectar plataforma de videollamada
const plataformaDetectada = computed(() => {
  const enlace = formData.value.enlace_videollamada?.toLowerCase() || ''
  if (!enlace) return null
  if (enlace.includes('meet.google.com') || enlace.includes('meet.google')) return 'meet'
  if (enlace.includes('zoom.us') || enlace.includes('zoom.com')) return 'zoom'
  if (enlace.includes('teams.microsoft.com') || enlace.includes('teams.live.com')) return 'teams'
  return null
})

// Nombre legible de la plataforma
const plataformaNombre = computed(() => {
  const plataformas: Record<string, string> = {
    meet: 'Google Meet',
    zoom: 'Zoom',
    teams: 'Microsoft Teams'
  }
  return plataformaDetectada.value ? plataformas[plataformaDetectada.value] : ''
})

// Validar enlace de videollamada
const enlaceValido = computed(() => {
  const enlace = formData.value.enlace_videollamada?.trim() || ''
  if (!enlace) return null // null = vacío, no mostrar estado

  // Validar que sea URL válida
  try {
    new URL(enlace)
  } catch {
    return false
  }

  // Verificar que sea de una plataforma reconocida
  return plataformaDetectada.value !== null
})

// Seleccionar modalidad y guardar en localStorage
function seleccionarModalidad(valor: string) {
  formData.value.modalidad = valor

  // Guardar preferencia
  if (import.meta.client) {
    localStorage.setItem(MODALIDAD_STORAGE_KEY, valor)
  }

  // Limpiar campos condicionales al cambiar
  if (valor !== 'online') {
    formData.value.enlace_videollamada = ''
  }
  if (valor !== 'presencial') {
    formData.value.ubicacion = ''
  }
}

// Cargar última modalidad usada
function cargarUltimaModalidad(): string {
  if (import.meta.client) {
    const guardada = localStorage.getItem(MODALIDAD_STORAGE_KEY)
    if (guardada && ['presencial', 'online', 'telefonica'].includes(guardada)) {
      return guardada
    }
  }
  return 'online' // Default
}

// Aplicar template de observación (toggle)
function aplicarTemplateObservacion(texto: string) {
  const actual = formData.value.observaciones || ''

  // Si ya incluye el texto, lo quitamos
  if (actual.includes(texto)) {
    formData.value.observaciones = actual
      .replace(texto, '')
      .replace(/\s*[,.]\s*[,.]/g, ',')  // Limpiar dobles comas
      .replace(/^[,.\s]+|[,.\s]+$/g, '') // Limpiar inicio/fin
      .trim()
  } else {
    // Si no está, lo añadimos
    if (actual.trim().length > 0) {
      // Añadir con separador
      formData.value.observaciones = `${actual.trim()}. ${texto}`
    } else {
      formData.value.observaciones = texto
    }
  }

  // Expandir el textarea al añadir contenido
  if (formData.value.observaciones && formData.value.observaciones.length > 0) {
    observacionesExpandido.value = true
  }
}

// Aplicar shortcut de fecha
function aplicarShortcutFecha(shortcut: { label: string; fecha: string }) {
  formData.value.fecha_cita = shortcut.fecha
  validateInRealTime()
}

// Al cambiar hora inicio, auto-calcular hora fin (+1h por defecto)
function onHoraInicioChange() {
  if (formData.value.hora_inicio) {
    const [h, m] = formData.value.hora_inicio.split(':').map(Number)
    const finH = h + 1
    if (finH <= 21) {
      formData.value.hora_fin = `${finH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }
  }
  validateInRealTime()
}

// Aplicar duración rápida
function aplicarDuracion(minutos: number) {
  if (!formData.value.hora_inicio) return
  const [h, m] = formData.value.hora_inicio.split(':').map(Number)
  const totalMinutos = h * 60 + m + minutos
  const finH = Math.floor(totalMinutos / 60)
  const finM = totalMinutos % 60
  if (finH <= 21) {
    formData.value.hora_fin = `${finH.toString().padStart(2, '0')}:${finM.toString().padStart(2, '0')}`
    validateInRealTime()
  }
}

// Formatear fecha completa legible
function formatearFechaCompleta(fechaStr: string): string {
  if (!fechaStr) return ''
  const fecha = new Date(fechaStr + 'T00:00:00')
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Computadas
const canSubmit = computed(() => {
  return formData.value.paciente_id &&
    formData.value.fecha_cita &&
    formData.value.hora_inicio &&
    formData.value.hora_fin &&
    formData.value.modalidad &&
    !isSubmitting.value
})

// Métodos
function handleClose() {
  resetForm()
  emit('close')
}

function resetForm() {
  formData.value = {
    paciente_id: '',
    fecha_cita: props.fechaInicial || '',
    hora_inicio: props.horaInicial || '',
    hora_fin: '',
    modalidad: cargarUltimaModalidad(),
    estado: 'pendiente'
  }
  pacienteSeleccionado.value = null
  clearSearch()
  showDropdown.value = false
  modoCrearPaciente.value = false
  validationMessage.value = null
  observacionesExpandido.value = false
}

function selectPaciente(paciente: PacienteBusqueda) {
  pacienteSeleccionado.value = paciente
  formData.value.paciente_id = paciente.id
  searchQuery.value = paciente.nombre_completo
  showDropdown.value = false

  // Asignar automáticamente el bono activo principal
  if (paciente.bono_activo) {
    formData.value.bono_id = paciente.bono_activo.id
    formData.value.descontar_de_bono = true
  } else {
    formData.value.bono_id = undefined
    formData.value.descontar_de_bono = false
  }

  agendaLogger.debug('patient_select', `Paciente seleccionado: ${paciente.nombre_completo}`, {
    tiene_bono: !!paciente.bono_activo,
    bono_id: paciente.bono_activo?.id
  })
}

/**
 * Formatea una fecha ISO a formato legible
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Formatea fecha relativa (hace X días/semanas)
 */
function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const ahora = new Date()
  const diffMs = ahora.getTime() - date.getTime()
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDias === 0) return 'hoy'
  if (diffDias === 1) return 'ayer'
  if (diffDias < 7) return `hace ${diffDias} días`
  if (diffDias < 14) return 'hace 1 sem.'
  if (diffDias < 30) return `hace ${Math.floor(diffDias / 7)} sem.`
  if (diffDias < 60) return 'hace 1 mes'
  return `hace ${Math.floor(diffDias / 30)} meses`
}

function limpiarSeleccion() {
  pacienteSeleccionado.value = null
  formData.value.paciente_id = ''
  formData.value.bono_id = undefined
  formData.value.descontar_de_bono = false
  searchQuery.value = ''
}

function handleBlur() {
  // Delay para permitir click en dropdown
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

function activarModoCrearPaciente() {
  modoCrearPaciente.value = true
  showDropdown.value = false

  // Pre-llenar con el texto de búsqueda si parece un nombre
  if (searchQuery.value.trim().length > 0 && !searchQuery.value.includes('@')) {
    nuevoPaciente.value.nombre_completo = searchQuery.value.trim()
  }
}

function cancelarCrearPaciente() {
  modoCrearPaciente.value = false
  nuevoPaciente.value = {
    nombre_completo: '',
    email: '',
    telefono: '',
    fecha_nacimiento: ''
  }
}

async function crearPacienteYSeleccionar() {
  creandoPaciente.value = true

  try {
    const result = await createPaciente(nuevoPaciente.value)

    if (result.success && result.data) {
      // Seleccionar el paciente recién creado
      selectPaciente(result.data)

      // Resetear modo creación
      modoCrearPaciente.value = false
      nuevoPaciente.value = {
        nombre_completo: '',
        email: '',
        telefono: '',
        fecha_nacimiento: ''
      }

      validationMessage.value = {
        type: 'success',
        text: `Paciente "${result.data.nombre_completo}" creado exitosamente`
      }

      setTimeout(() => {
        validationMessage.value = null
      }, 3000)

    } else {
      validationMessage.value = {
        type: 'error',
        text: result.error || 'Error al crear paciente'
      }
    }

  } catch (err: any) {
    validationMessage.value = {
      type: 'error',
      text: err.message || 'Error inesperado al crear paciente'
    }
  } finally {
    creandoPaciente.value = false
  }
}

async function validateInRealTime() {
  // Cancelar validación anterior
  if (validationTimeout.value) {
    clearTimeout(validationTimeout.value)
  }

  // Validar solo si hay fecha, hora inicio y hora fin
  if (!formData.value.fecha_cita || !formData.value.hora_inicio || !formData.value.hora_fin) {
    validationMessage.value = null
    return
  }

  // Esperar 500ms después del último cambio
  validationTimeout.value = setTimeout(async () => {
    try {
      const result = await validateAppointment({
        paciente_id: formData.value.paciente_id || 'temp',
        fecha_cita: formData.value.fecha_cita,
        hora_inicio: formData.value.hora_inicio,
        hora_fin: formData.value.hora_fin
      })

      if (result.valid) {
        validationMessage.value = {
          type: 'success',
          text: 'Horario disponible ✓'
        }
      } else {
        validationMessage.value = {
          type: 'error',
          text: result.error || 'Conflicto detectado'
        }
      }

    } catch (err: any) {
      agendaLogger.error('validation', 'Error en validación en tiempo real', err)
    }
  }, 500)
}

async function handleSubmit(keepOpen = false) {
  if (!canSubmit.value) return

  isSubmitting.value = true
  validationMessage.value = null

  try {
    agendaLogger.clickCreate(formData.value.fecha_cita, formData.value.hora_inicio)

    const result = await createAppointment(formData.value)

    if (result.success && result.data) {
      agendaLogger.create(result.data.id, formData.value.fecha_cita, formData.value.hora_inicio)

      // Registrar patrones para aprendizaje inteligente
      registrarPatronModalidad(formData.value.fecha_cita, formData.value.modalidad)
      if (formData.value.paciente_id && formData.value.hora_inicio) {
        registrarPatronPaciente(formData.value.paciente_id, formData.value.hora_inicio)
      }

      // Limpiar borrador al crear exitosamente
      limpiarBorrador()

      emit('created', result.data)

      if (keepOpen) {
        // Mantener el modal abierto y limpiar solo los datos de la cita
        resetFormForNewAppointment()
        validationMessage.value = {
          type: 'success',
          text: `Cita creada para ${pacienteSeleccionado.value?.nombre_completo || 'paciente'}. Puedes crear otra.`
        }
        setTimeout(() => {
          validationMessage.value = null
        }, 4000)
      } else {
        handleClose()
      }

    } else {
      validationMessage.value = {
        type: 'error',
        text: result.error || 'Error al crear la cita'
      }
    }

  } catch (err: any) {
    validationMessage.value = {
      type: 'error',
      text: err.message || 'Error inesperado'
    }
    agendaLogger.error('api_error', 'Error en handleSubmit', err)

  } finally {
    isSubmitting.value = false
  }
}

// Crear cita y mantener modal abierto para otra
async function handleSubmitAndNew() {
  await handleSubmit(true)
}

// Resetear formulario manteniendo paciente seleccionado
function resetFormForNewAppointment() {
  const pacienteActual = pacienteSeleccionado.value
  const bonoIdActual = formData.value.bono_id

  formData.value = {
    paciente_id: pacienteActual?.id || '',
    fecha_cita: '',
    hora_inicio: '',
    hora_fin: '',
    modalidad: cargarUltimaModalidad(),
    estado: 'pendiente',
    bono_id: bonoIdActual,
    descontar_de_bono: !!bonoIdActual
  }
  observacionesExpandido.value = false
}

// Manejar atajos de teclado
function handleKeydown(event: KeyboardEvent) {
  // Ctrl/Cmd + Enter para crear cita
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    if (canSubmit.value && !isSubmitting.value) {
      handleSubmit()
    }
  }
}

// Auto-calcular hora_fin cuando cambia hora_inicio
// Calcula 1 hora después (60 minutos) por defecto
// El usuario puede editar manualmente hora_fin después
watch(() => formData.value.hora_inicio, (newHora) => {
  if (newHora) {
    const [hours, minutes] = newHora.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + 60  // +60 minutos (1 hora)
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    formData.value.hora_fin = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }
})

// Watch isOpen para cargar pacientes y pre-llenar formulario
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadAllPacientes()

    // Pre-llenar fecha y hora si se proporcionan (tienen prioridad sobre borrador)
    const tienePropsIniciales = props.fechaInicial || props.horaInicial
    console.log('[ModalNuevaCita] Abriendo modal con props:', {
      fechaInicial: props.fechaInicial,
      horaInicial: props.horaInicial,
      horaFinal: props.horaFinal
    })

    if (props.fechaInicial) {
      formData.value.fecha_cita = props.fechaInicial
      console.log('[ModalNuevaCita] Fecha establecida:', props.fechaInicial)
    }
    if (props.horaInicial) {
      formData.value.hora_inicio = props.horaInicial
      console.log('[ModalNuevaCita] Hora inicio establecida:', props.horaInicial)

      // Calcular hora_fin automáticamente (+1 hora por defecto)
      if (!props.horaFinal) {
        const [h, m] = props.horaInicial.split(':').map(Number)
        const totalMinutes = h * 60 + m + 60 // +60 min por defecto
        const endHours = Math.floor(totalMinutes / 60)
        const endMinutes = totalMinutes % 60
        formData.value.hora_fin = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
        console.log('[ModalNuevaCita] Hora fin calculada:', formData.value.hora_fin)
      }
    }
    if (props.horaFinal) {
      formData.value.hora_fin = props.horaFinal
    }

    // Si no hay props iniciales, intentar restaurar borrador
    if (!tienePropsIniciales) {
      const borrador = cargarBorrador()
      if (borrador) {
        restaurarBorrador(borrador)
      }
    }
  } else {
    // Limpiar al cerrar el modal
    validationMessage.value = null
  }
}, { immediate: true })

// Watch para auto-guardar borrador en cada cambio
watch(
  () => [
    formData.value.paciente_id,
    formData.value.fecha_cita,
    formData.value.hora_inicio,
    formData.value.modalidad,
    formData.value.observaciones
  ],
  () => {
    // Guardar borrador con debounce
    guardarBorrador()
  },
  { deep: true }
)

// Watch para actualizar sugerencia de horario cuando cambia el paciente
watch(
  () => formData.value.paciente_id,
  (newPacienteId) => {
    if (newPacienteId) {
      sugerenciaHorario.value = obtenerSugerenciaHorario(newPacienteId)
    } else {
      sugerenciaHorario.value = null
    }
  }
)

// Watch para sugerir modalidad basada en día de la semana
watch(
  () => formData.value.fecha_cita,
  (nuevaFecha) => {
    if (nuevaFecha && !borradorRestaurado.value) {
      const modalidadSugerida = obtenerModalidadSugeridaPorDia(nuevaFecha)
      // Solo auto-aplicar si no ha sido modificada manualmente
      if (modalidadSugerida && formData.value.modalidad === cargarUltimaModalidad()) {
        // Mostramos sugerencia pero no auto-aplicamos para no ser intrusivos
        // El usuario puede verla en el chip de sugerencia
      }
    }
  }
)

// Lifecycle
onMounted(async () => {
  // Cargar configuración de agenda (horarios del terapeuta)
  await cargarConfiguracion()

  // Cargar última modalidad usada
  formData.value.modalidad = cargarUltimaModalidad()

  // Cargar pacientes al abrir modal
  if (props.isOpen) {
    loadAllPacientes()

    // Intentar restaurar borrador si no hay props iniciales
    if (!props.fechaInicial && !props.horaInicial) {
      const borrador = cargarBorrador()
      if (borrador) {
        restaurarBorrador(borrador)
      }
    }
  }

  // Registrar listener de teclado
  if (import.meta.client) {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  // Limpiar listener de teclado
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeydown)
  }

  // Limpiar timeout de validación
  if (validationTimeout.value) {
    clearTimeout(validationTimeout.value)
  }
})
</script>

<style scoped>
/* Animaciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Scrollbar personalizado para dropdown */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: violet-600;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: violet-700;
}

/* Accesibilidad - Focus visible mejorado */
:focus-visible {
  outline: 2px solid violet-600;
  outline-offset: 2px;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Alto contraste para estados de error */
@media (prefers-contrast: high) {
  .border-red-300 {
    border-color: #dc2626 !important;
  }
  .bg-red-50 {
    background-color: #fef2f2 !important;
  }
  .text-red-600, .text-red-800 {
    color: #b91c1c !important;
  }
  .border-violet-300 {
    border-color: #059669 !important;
  }
  .bg-violet-50 {
    background-color: #ecfdf5 !important;
  }
  .text-violet-600, .text-violet-800 {
    color: #047857 !important;
  }
}

/* Reducir movimiento para accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .animate-spin {
    transition: none !important;
    animation: none !important;
  }
}

/* Responsive - Tablet */
@media (max-width: 768px) {
  /* Modal ocupa más espacio en tablet */
  :deep(.max-w-2xl) {
    max-width: 95vw;
  }

  /* Padding reducido en mobile */
  :deep(.p-8) {
    padding: 1.25rem;
  }

  /* Grid de 2 columnas pasa a 1 en tablet pequeño */
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }

  /* Modalidades en 1 columna en mobile */
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
}

/* Responsive - Mobile */
@media (max-width: 480px) {
  /* Título más pequeño */
  :deep(.text-2xl) {
    font-size: 1.25rem;
  }

  /* Botones de fecha shortcut más compactos */
  .flex-wrap.gap-2 button {
    padding: 0.375rem 0.625rem;
    font-size: 0.7rem;
  }

  /* Inputs más compactos en mobile */
  input, select, textarea {
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
  }
}
</style>
