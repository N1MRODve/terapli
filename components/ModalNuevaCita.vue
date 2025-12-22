<template>
  <div
    v-if="modelValue || mostrar"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="cerrarModal"
  >
    <div class="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/30">
      <!-- Header -->
      <div class="sticky top-0 bg-gradient-to-r from-[#5550F2]/5 via-[#027368]/5 to-[#04BF9D]/5 backdrop-blur-md border-b border-neutral-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h2 class="text-2xl font-['Elms_Sans'] text-neutral-800 font-semibold">
            {{ titulo || 'Nueva Cita' }}
          </h2>
          <p v-if="fechaPreseleccionada" class="text-sm text-neutral-600 mt-1">
            {{ formatearFechaLegible(fechaPreseleccionada) }} a las {{ horaPreseleccionada }}
          </p>
        </div>
        <button
          @click="cerrarModal"
          class="text-neutral-600 hover:text-[#027368] transition-colors p-2 hover:bg-white/50 rounded-lg"
          aria-label="Cerrar modal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Contenido -->
      <form @submit.prevent="guardarCita" class="px-6 py-6 space-y-6 bg-gradient-to-b from-white/50 to-transparent">
        <!-- Indicador de Paciente Preseleccionado (desde ficha) -->
        <div v-if="props.pacientePreseleccionado && pacienteSeleccionado" class="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon class="w-7 h-7 text-white" />
              </div>
              <div>
                <div class="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Paciente Seleccionado</div>
                <div class="font-bold text-emerald-900 text-lg">{{ pacienteSeleccionado.nombre }}</div>
                <div class="text-sm text-emerald-700 flex items-center gap-1 mt-0.5">
                  <span>{{ pacienteSeleccionado.email }}</span>
                </div>
                <div v-if="pacienteSeleccionado.frecuencia" class="mt-2 flex items-center gap-2 text-xs">
                  <CalendarIcon class="w-4 h-4 text-emerald-600" />
                  <span class="text-emerald-700">Frecuencia: <strong class="capitalize">{{ pacienteSeleccionado.frecuencia }}</strong></span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div v-if="infoBono.tiene_bono" class="flex items-center gap-1 text-xs text-emerald-700 font-semibold mb-1">
                <TicketIcon class="w-4 h-4" />
                <span>BONO ACTIVO</span>
              </div>
              <div v-if="infoBono.tiene_bono" class="text-2xl font-bold text-emerald-900">
                {{ infoBono.sesiones_restantes }}/{{ infoBono.sesiones_totales }}
              </div>
              <div v-if="infoBono.tiene_bono" class="text-xs text-emerald-600">sesiones</div>
            </div>
          </div>
        </div>

        <!-- Paso 1: Selección de Paciente (SOLO SI NO HAY PRESELECCIONADO) -->
        <div v-if="!props.pacientePreseleccionado" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-['Elms_Sans'] text-neutral-800 font-semibold flex items-center gap-2">
              <span v-if="!pacienteSeleccionado" class="w-7 h-7 rounded-full bg-gradient-to-r from-[#5550F2] to-[#027368] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                1
              </span>
              <span v-else class="w-7 h-7 rounded-full bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white flex items-center justify-center shadow-sm">
                <CheckCircleIcon class="w-5 h-5" />
              </span>
              Seleccionar Paciente
            </h3>
          </div>

          <!-- Info -->
          <div v-if="!pacienteSeleccionado" class="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
            <p class="flex items-center gap-2 text-sm text-blue-800">
              <MagnifyingGlassIcon class="w-5 h-5 flex-shrink-0" />
              <span>Busca y selecciona un paciente ya registrado en el sistema</span>
            </p>
            <p class="text-xs text-blue-700 mt-1.5 ml-7">
              Para crear un paciente nuevo, ve a la sección <strong>Pacientes</strong> en el menú principal
            </p>
          </div>

          <!-- Selector de Paciente Existente -->
          <div v-if="!pacienteSeleccionado" class="space-y-3">
            <!-- Buscador de pacientes -->
            <div class="relative" @click.stop>
              <input
                v-model="busquedaPaciente"
                type="text"
                placeholder="Buscar paciente por nombre o email..."
                class="w-full px-4 py-2.5 pl-10 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#027368]/20 focus:border-[#027368] bg-white/90 backdrop-blur-sm transition-all shadow-sm"
                @focus="mostrarListaPacientes = true"
                @input="onBusquedaInput"
                autocomplete="off"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2">
                <MagnifyingGlassIcon class="w-5 h-5 text-neutral-400" />
              </span>
              
              <!-- Indicador de carga -->
              <span v-if="cargandoPacientes" class="absolute right-3 top-1/2 -translate-y-1/2">
                <svg class="animate-spin h-5 w-5 text-[#027368]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              
              <!-- Tooltip de ayuda -->
              <div v-if="!busquedaPaciente && !cargandoPacientes" class="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                <InformationCircleIcon class="w-4 h-4 flex-shrink-0" />
                <span>Escribe al menos 2 caracteres para buscar</span>
              </div>
            </div>

            <!-- Lista de pacientes filtrados -->
            <div
              v-if="mostrarListaPacientes && busquedaPaciente && pacientesFiltrados.length > 0"
              class="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <button
                v-for="paciente in pacientesFiltrados"
                :key="paciente.id"
                type="button"
                @click="seleccionarPaciente(paciente)"
                class="p-4 text-left hover:bg-[#027368]/5 transition-all border-2 border-neutral-200 hover:border-[#027368] rounded-xl cursor-pointer group bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md"
              >
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#027368]/20 to-[#04BF9D]/20 group-hover:from-[#027368] group-hover:to-[#04BF9D] flex items-center justify-center transition-all">
                    <UserIcon class="w-6 h-6 text-[#027368] group-hover:text-white transition-colors" />
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-neutral-800 group-hover:text-[#027368] transition-colors">
                      {{ paciente.nombre }}
                    </div>
                    <div class="text-sm text-neutral-600">
                      {{ paciente.email }}
                    </div>
                    <div v-if="paciente.frecuencia" class="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                      <CalendarIcon class="w-3 h-3" />
                      <span class="font-medium capitalize">{{ paciente.frecuencia }}</span>
                    </div>
                  </div>
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg class="w-5 h-5 text-[#027368]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
            
            <!-- Mensaje cuando no hay resultados -->
            <div
              v-if="mostrarListaPacientes && busquedaPaciente && pacientesFiltrados.length === 0 && !cargandoPacientes"
              class="border border-neutral-200 rounded-xl bg-white/90 backdrop-blur-sm p-6 text-center text-sm text-neutral-600 shadow-sm"
            >
              <MagnifyingGlassIcon class="w-12 h-12 mx-auto mb-2 text-neutral-400" />
              <p>No se encontraron pacientes con "<strong>{{ busquedaPaciente }}</strong>"</p>
            </div>
          </div>

          <!-- Paciente seleccionado (desde búsqueda) -->
          <div
            v-if="formulario.paciente_id && pacienteSeleccionado && !props.pacientePreseleccionado"
            class="space-y-3"
          >
              <!-- Card principal del paciente -->
              <div class="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3 flex-1">
                    <div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon class="w-7 h-7 text-white" />
                    </div>
                    <div class="flex-1">
                      <div class="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Paciente Seleccionado</div>
                      <div class="font-bold text-emerald-900 text-lg">
                        {{ pacienteSeleccionado.nombre }}
                      </div>
                      <div class="text-sm text-emerald-700 flex items-center gap-1 mt-0.5">
                        <span>{{ pacienteSeleccionado.email }}</span>
                      </div>
                    
                      <!-- Frecuencia del paciente -->
                      <div v-if="pacienteSeleccionado.frecuencia" class="mt-2 flex items-center gap-2 text-sm">
                        <CalendarIcon class="w-4 h-4 text-emerald-600" />
                        <span class="font-medium text-emerald-800">Frecuencia:</span>
                        <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg font-medium capitalize">
                          {{ pacienteSeleccionado.frecuencia }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="deseleccionarPaciente"
                    class="px-4 py-2 bg-white border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm hover:shadow flex-shrink-0"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Cambiar</span>
                  </button>
                </div>
              </div>

              <!-- Información del Bono - DESTACADO -->
              <div v-if="infoBono.tiene_bono" class="p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-xl shadow-md">
                <!-- Header del bono -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <TicketIcon class="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div class="text-sm font-bold text-blue-900 uppercase tracking-wide">Bono Activo</div>
                      <div class="text-xs text-blue-600">El paciente tiene sesiones disponibles</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-xs text-blue-600 mb-1">Sesiones Disponibles</div>
                    <div :class="[
                      'text-3xl font-bold',
                      infoBono.sesiones_restantes <= 1 ? 'text-red-600' : 
                      infoBono.sesiones_restantes <= 2 ? 'text-amber-600' : 'text-blue-700'
                    ]">
                      {{ infoBono.sesiones_restantes }}
                    </div>
                  </div>
                </div>
                
                <!-- Detalles del bono -->
                <div class="grid grid-cols-3 gap-3 mb-4">
                  <div class="bg-white p-3 rounded-lg border border-blue-200">
                    <div class="text-xs text-blue-600 mb-1 font-medium">Tipo de Bono</div>
                    <div class="font-bold text-blue-900 capitalize text-sm">
                      {{ infoBono.tipo_bono || 'N/A' }}
                    </div>
                  </div>
                  <div class="bg-white p-3 rounded-lg border border-blue-200">
                    <div class="text-xs text-blue-600 mb-1 font-medium">Total Sesiones</div>
                    <div class="font-bold text-blue-900 text-sm">
                      {{ infoBono.sesiones_totales || '?' }}
                    </div>
                  </div>
                  <div class="bg-white p-3 rounded-lg border border-blue-200">
                    <div class="text-xs text-blue-600 mb-1 font-medium">Utilizadas</div>
                    <div class="font-bold text-blue-900 text-sm">
                      {{ (infoBono.sesiones_totales || 0) - (infoBono.sesiones_restantes || 0) }}
                    </div>
                  </div>
                </div>

                <!-- Barra de progreso -->
                <div class="mb-4">
                  <div class="flex justify-between text-xs text-blue-700 mb-1">
                    <span>Progreso del bono</span>
                    <span class="font-semibold">{{ Math.round(((infoBono.sesiones_totales - infoBono.sesiones_restantes) / infoBono.sesiones_totales) * 100) }}%</span>
                  </div>
                  <div class="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all duration-500"
                      :class="[
                        infoBono.sesiones_restantes <= 1 ? 'bg-red-500' : 
                        infoBono.sesiones_restantes <= 2 ? 'bg-amber-500' : 'bg-blue-500'
                      ]"
                      :style="{ width: `${((infoBono.sesiones_totales - infoBono.sesiones_restantes) / infoBono.sesiones_totales) * 100}%` }"
                    ></div>
                  </div>
                </div>
                
                <!-- Alerta si quedan pocas sesiones -->
                <div v-if="infoBono.sesiones_restantes <= 2" class="mb-4 flex items-start gap-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                  <ExclamationTriangleIcon class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div class="text-sm">
                    <div class="font-semibold text-amber-900 mb-1">
                      {{ infoBono.sesiones_restantes === 1 ? '¡Última sesión del bono!' : '¡Pocas sesiones restantes!' }}
                    </div>
                    <div class="text-amber-800">
                      {{ infoBono.sesiones_restantes === 1 
                        ? 'Esta es la última sesión disponible. Considere informar al paciente para renovar su bono.' 
                        : `Solo quedan ${infoBono.sesiones_restantes} sesiones. Considere informar al paciente para renovar su bono pronto.` }}
                    </div>
                  </div>
                </div>
                
                <!-- Checkbox para descontar de bono -->
                <div class="flex items-start gap-3 p-3 bg-white border-2 border-blue-300 rounded-lg">
                  <input
                    id="descontar-bono"
                    v-model="formulario.descontar_de_bono"
                    type="checkbox"
                    class="mt-1 w-5 h-5 text-blue-600 border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label for="descontar-bono" class="flex-1 cursor-pointer">
                    <div class="text-sm text-blue-900 font-semibold mb-1">
                      Descontar sesión de este bono
                    </div>
                    <div class="text-xs text-blue-700">
                      Al completar esta cita, se descontará automáticamente 1 sesión del bono activo.
                      Quedarán <strong>{{ infoBono.sesiones_restantes - 1 }}</strong> sesiones disponibles.
                    </div>
                  </label>
                </div>
              </div>
              
              <!-- Sin bono activo - Aviso -->
              <div v-else class="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg shadow-sm">
                <div class="flex items-start gap-3">
                  <InformationCircleIcon class="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div class="font-semibold text-amber-900 mb-1">Sin bono activo</div>
                    <div class="text-sm text-amber-800">
                      Este paciente no tiene bonos activos actualmente. Esta sesión se cobrará de forma individual.
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>

        <!-- Selector de Terapeuta (SOLO COORDINADORA) -->
        <div v-if="esCoordinadora" class="space-y-4 pt-4 border-t-2 border-[#5550F2]/30">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-serif text-[#2D3748] font-semibold flex items-center gap-2">
              <span v-if="!terapeutaSeleccionado" class="w-7 h-7 rounded-full bg-[#5550F2] text-white flex items-center justify-center text-sm font-bold">
                {{ props.pacientePreseleccionado ? '2' : '2' }}
              </span>
              <span v-else class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <CheckCircleIcon class="w-5 h-5" />
              </span>
              Asignar Terapeuta
            </h3>
          </div>

          <!-- Info -->
          <div v-if="!terapeutaSeleccionado" class="p-3 bg-purple-50 border-l-4 border-purple-400 rounded">
            <p class="flex items-center gap-2 text-sm text-purple-800">
              <UserGroupIcon class="w-5 h-5 flex-shrink-0" />
              <span>Selecciona el terapeuta que atenderá esta cita</span>
            </p>
          </div>

          <!-- Lista de Terapeutas -->
          <div v-if="!terapeutaSeleccionado" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              v-for="terapeuta in terapeutas"
              :key="terapeuta.id"
              type="button"
              @click="seleccionarTerapeuta(terapeuta)"
              class="p-4 text-left hover:bg-[#5550F2]/10 transition-all border-2 border-[#5550F2]/30 hover:border-[#5550F2] rounded-lg cursor-pointer group bg-white"
            >
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-[#5550F2]/20 group-hover:bg-[#5550F2] flex items-center justify-center transition-colors">
                  <UserIcon class="w-6 h-6 text-[#2D3748] group-hover:text-white transition-colors" />
                </div>
                <div class="flex-1">
                  <div class="font-medium text-[#2D3748] group-hover:text-[#5550F2] transition-colors">
                    {{ terapeuta.nombre_completo }}
                  </div>
                  <div v-if="terapeuta.especialidad" class="text-sm text-[#2D3748]/60">
                    {{ terapeuta.especialidad }}
                  </div>
                  <div class="text-xs text-[#2D3748]/50">
                    {{ terapeuta.email }}
                  </div>
                </div>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-5 h-5 text-[#5550F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          <!-- Terapeuta Seleccionado -->
          <div v-if="terapeutaSeleccionado" class="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 flex-1">
                <div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon class="w-7 h-7 text-white" />
                </div>
                <div class="flex-1">
                  <div class="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Terapeuta Asignado</div>
                  <div class="font-bold text-emerald-900 text-lg">{{ terapeutaSeleccionado.nombre_completo }}</div>
                  <div v-if="terapeutaSeleccionado.especialidad" class="text-sm text-emerald-700 mt-0.5">{{ terapeutaSeleccionado.especialidad }}</div>
                </div>
              </div>
              <button
                type="button"
                @click="terapeutaSeleccionado = null; formulario.terapeuta_id = ''; formulario.terapeuta_nombre = ''"
                class="px-4 py-2 bg-white border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm hover:shadow flex-shrink-0"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Cambiar</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Paso 2/3: Detalles de la Cita -->
        <div class="space-y-6 pt-4 border-t-2 border-[#5550F2]/30">
          <h3 class="text-lg font-serif text-[#2D3748] font-semibold flex items-center gap-2">
            <span 
              v-if="!formularioValido"
              class="w-7 h-7 rounded-full bg-[#5550F2] text-white flex items-center justify-center text-sm font-bold"
            >
              {{ esCoordinadora ? '3' : (props.pacientePreseleccionado ? '1' : '2') }}
            </span>
            <span 
              v-else
              class="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center"
            >
              ✓
            </span>
            Detalles de la Cita
          </h3>

          <!-- Sección: Detalles de Programación -->
          <div class="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm space-y-4">
            <h4 class="text-sm font-bold text-blue-900 flex items-center gap-2">
              <CalendarIcon class="w-5 h-5 text-blue-600" />
              <span>Detalles de Programación</span>
            </h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Fecha -->
            <div>
              <label class="block text-sm font-medium text-[#2D3748] mb-2 flex items-center gap-2">
                <CalendarIcon class="w-4 h-4" />
                <span>Fecha</span>
                <span class="text-red-500">*</span>
              </label>
              <div class="space-y-2">
                <input
                  v-model="formulario.fecha"
                  type="date"
                  required
                  :min="fechaMinima"
                  @keydown.enter.prevent
                  :class="[
                    'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#5550F2] focus:border-transparent bg-white text-base cursor-pointer',
                    camposInvalidos.includes('fecha') ? 'border-red-500 border-2' : 'border-[#5550F2]/30'
                  ]"
                  style="min-height: 44px;"
                  placeholder="dd/mm/aaaa"
                />
                
                <!-- Accesos rápidos de fecha -->
                <div class="flex gap-2 flex-wrap">
                  <button
                    v-for="(opcion, index) in opcionesFechaRapida"
                    :key="index"
                    type="button"
                    @click="formulario.fecha = opcion.fecha"
                    :class="[
                      'text-xs px-3 py-1.5 rounded-lg border transition-all',
                      formulario.fecha === opcion.fecha
                        ? 'bg-[#5550F2] text-white border-[#5550F2] font-semibold'
                        : 'bg-white text-[#2D3748] border-[#5550F2]/30 hover:border-[#5550F2] hover:bg-[#5550F2]/10'
                    ]"
                  >
                    {{ opcion.label }}
                  </button>
                </div>
                
                <!-- Fecha sugerida -->
                <div v-if="fechaSugerida && fechaSugerida !== formulario.fecha" class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="formulario.fecha = fechaSugerida"
                    class="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors"
                  >
                    💡 Usar fecha sugerida: {{ formatearFechaLegible(fechaSugerida) }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Hora de Inicio -->
            <div>
              <label class="block text-sm font-medium text-[#2D3748] mb-2 flex items-center gap-2">
                <ClockIcon class="w-4 h-4" />
                <span>Hora de Inicio</span>
                <span class="text-red-500">*</span>
              </label>
              <div class="space-y-3">
                <!-- Grid de horas disponibles -->
                <div class="grid grid-cols-4 gap-3 max-h-72 overflow-y-auto p-4 bg-white rounded-lg border border-[#5550F2]/20 shadow-inner">
                  <button
                    v-for="hora in horasDisponibles"
                    :key="hora"
                    type="button"
                    @click="formulario.hora_inicio = hora; calcularHoraFin()"
                    :class="[
                      'px-4 py-3 text-sm font-semibold rounded-lg transition-all border-2 flex items-center justify-center min-w-[70px]',
                      formulario.hora_inicio === hora
                        ? 'bg-[#5550F2] text-white border-[#5550F2] shadow-lg transform scale-105 ring-2 ring-[#5550F2]/30'
                        : 'bg-white text-[#2D3748] border-gray-300 hover:border-[#5550F2] hover:bg-[#5550F2]/10 hover:shadow-md hover:scale-102'
                    ]"
                  >
                    {{ hora }}
                  </button>
                </div>
                
                <!-- Input manual alternativo -->
                <details class="text-xs">
                  <summary class="cursor-pointer text-[#2D3748]/60 hover:text-[#2D3748] select-none flex items-center gap-2">
                    <DocumentTextIcon class="w-4 h-4" />
                    <span>Ingresar hora manualmente</span>
                  </summary>
                  <div class="mt-2">
                    <input
                      v-model="formulario.hora_inicio"
                      type="time"
                      step="1800"
                      @change="calcularHoraFin"
                      :class="[
                        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5550F2] focus:border-transparent bg-white',
                        camposInvalidos.includes('hora_inicio') ? 'border-red-500 border-2' : 'border-[#5550F2]/30'
                      ]"
                    />
                  </div>
                </details>
                
                <datalist id="horas-sugeridas">
                  <option v-for="hora in horasDisponibles" :key="hora" :value="hora">
                    {{ hora }}
                  </option>
                </datalist>
                <!-- Hora sugerida -->
                <div v-if="horaSugerida && horaSugerida !== formulario.hora_inicio && cargandoSugerencia === false" class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="formulario.hora_inicio = horaSugerida; calcularHoraFin()"
                    class="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                  >
                    <InformationCircleIcon class="w-4 h-4" />
                    <span>Usar hora sugerida: {{ horaSugerida }}</span>
                  </button>
                </div>
                <div v-if="cargandoSugerencia" class="text-xs text-[#2D3748]/50 flex items-center gap-2">
                  <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buscando horario disponible...
                </div>
              </div>
            </div>

            <!-- Duración -->
            <div>
              <label class="block text-sm font-medium text-[#2D3748] mb-1">
                Duración <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formulario.duracion"
                required
                @change="calcularHoraFin"
                class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:ring-2 focus:ring-[#5550F2] focus:border-transparent bg-white"
              >
                <option value="30">30 minutos</option>
                <option value="60" selected>60 minutos (1 hora)</option>
                <option value="90">90 minutos (1.5 horas)</option>
                <option value="120">120 minutos (2 horas)</option>
              </select>
            </div>

            <!-- Hora de Fin (automática) -->
            <div>
              <label class="block text-sm font-medium text-[#2D3748] mb-1">
                Hora de Fin
              </label>
              <input
                :value="formulario.hora_fin"
                type="text"
                readonly
                class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg bg-gray-100 text-[#2D3748]/60"
                placeholder="Se calculará automáticamente"
              />
            </div>
            </div>
          </div>

          <!-- Sección: Tipo de Sesión y Estado -->
          <div class="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl shadow-sm space-y-4">
            <h4 class="text-sm font-bold text-purple-900 flex items-center gap-2">
              <ComputerDesktopIcon class="w-5 h-5 text-purple-600" />
              <span>Tipo de Sesión y Estado</span>
            </h4>

            <!-- Tipo de Sesión -->
            <div>
              <label class="block text-sm font-medium text-[#2D3748] mb-2 flex items-center gap-2">
                <ComputerDesktopIcon class="w-5 h-5" />
                <span>Tipo de Sesión</span>
                <span class="text-red-500">*</span>
              </label>
              <div :class="[
                'grid grid-cols-3 gap-3',
                camposInvalidos.includes('tipo') ? 'p-3 border-2 border-red-500 bg-red-50 rounded-lg' : ''
              ]">
                <button
                  v-for="tipo in tiposSesion"
                  :key="tipo.valor"
                  type="button"
                  @click="formulario.tipo = tipo.valor"
                  :class="[
                    'p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-2 group',
                    formulario.tipo === tipo.valor
                      ? 'border-[#5550F2] bg-[#5550F2]/20 shadow-md'
                      : 'border-[#5550F2]/30 hover:border-[#5550F2] hover:bg-[#5550F2]/5 bg-white'
                  ]"
                >
                  <component 
                    :is="tipo.componente" 
                    :class="[
                      'w-8 h-8 transition-colors',
                      formulario.tipo === tipo.valor ? 'text-[#5550F2]' : 'text-[#2D3748]/60 group-hover:text-[#5550F2]'
                    ]"
                  />
                  <div class="font-medium text-[#2D3748] text-sm">{{ tipo.nombre }}</div>
                  <div class="text-xs text-[#2D3748]/50">{{ tipo.descripcion }}</div>
                </button>
              </div>
            </div>

            <!-- Estado -->
            <div>
              <label class="block text-sm font-medium text-[#2D3748] mb-2 flex items-center gap-2">
                <CheckCircleIcon class="w-5 h-5" />
                <span>Estado</span>
                <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  v-for="estado in estadosCita"
                  :key="estado.valor"
                  type="button"
                  @click="formulario.estado = estado.valor"
                  :class="[
                    'p-3 border-2 rounded-lg transition-all flex flex-col items-center gap-2',
                    formulario.estado === estado.valor
                      ? estado.claseActivo + ' shadow-md'
                      : estado.claseInactivo
                  ]"
                >
                  <component 
                    :is="estado.componente" 
                    class="w-7 h-7"
                  />
                  <div class="font-medium text-sm">{{ estado.nombre }}</div>
                </button>
              </div>
            </div>
          </div>

          <!-- Sección: Notas -->
          <div class="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm">
            <h4 class="text-sm font-bold text-amber-900 flex items-center gap-2 mb-3">
              <DocumentTextIcon class="w-5 h-5 text-amber-600" />
              <span>Notas Adicionales</span>
            </h4>
            
            <!-- Notas -->
            <div>
              <label class="block text-sm font-medium text-[#2D3748] mb-2 flex items-center gap-2">
                <DocumentTextIcon class="w-4 h-4" />
                <span>Notas (opcional)</span>
              </label>
              <textarea
                v-model="formulario.notas"
                rows="3"
                class="w-full px-4 py-2 border border-[#5550F2]/30 rounded-lg focus:ring-2 focus:ring-[#5550F2] focus:border-transparent bg-white resize-none"
                placeholder="Notas sobre la cita, recordatorios, etc."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Alertas de validación -->
        <div v-if="conflictoHorario" class="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-sm">
          <div class="flex items-start gap-3">
            <ExclamationTriangleIcon class="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <div class="font-semibold text-yellow-900 mb-1 flex items-center gap-2">
                <span>Conflicto de Horario</span>
              </div>
              <div class="text-sm text-yellow-800">
                Ya existe una cita en este horario. Verifica la disponibilidad.
              </div>
            </div>
          </div>
        </div>

        <!-- Mensajes de validación de campos requeridos -->
        <div v-if="camposInvalidos.length > 0 && !formularioValido" class="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
          <div class="flex items-start gap-3">
            <XCircleIcon class="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div class="font-semibold text-red-900 mb-2">
                Completa los campos obligatorios
              </div>
              <ul class="text-sm text-red-800 space-y-1.5">
                <li v-if="!formulario.paciente_id" class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Selecciona un paciente</span>
                </li>
                <li v-if="!formulario.fecha" class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Selecciona una fecha</span>
                </li>
                <li v-if="!formulario.hora_inicio" class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Selecciona la hora de inicio</span>
                </li>
                <li v-if="!formulario.tipo" class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Selecciona el tipo de sesión</span>
                </li>
                <li v-if="!formulario.estado" class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Selecciona el estado de la cita</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Resumen de la cita antes de guardar -->
        <div v-if="formularioValido && !conflictoHorario" class="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
          <div class="flex items-start gap-3">
            <InformationCircleIcon class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <div class="font-semibold text-blue-900 mb-3">
                Resumen de la Cita
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-blue-600 font-medium">Paciente:</span>
                  <div class="text-blue-900 font-semibold">{{ formulario.paciente_nombre }}</div>
                </div>
                <div>
                  <span class="text-blue-600 font-medium">Fecha:</span>
                  <div class="text-blue-900">{{ formatearFechaLegible(formulario.fecha) }}</div>
                </div>
                <div>
                  <span class="text-blue-600 font-medium">Horario:</span>
                  <div class="text-blue-900 font-semibold">{{ formulario.hora_inicio }} - {{ formulario.hora_fin }}</div>
                </div>
                <div>
                  <span class="text-blue-600 font-medium">Duración:</span>
                  <div class="text-blue-900">{{ formulario.duracion }} minutos</div>
                </div>
                <div>
                  <span class="text-blue-600 font-medium">Tipo:</span>
                  <div class="text-blue-900 capitalize">{{ formulario.tipo }}</div>
                </div>
                <div>
                  <span class="text-blue-600 font-medium">Estado:</span>
                  <div class="text-blue-900 capitalize">{{ formulario.estado }}</div>
                </div>
                <div v-if="formulario.descontar_de_bono" class="md:col-span-2 flex items-center gap-2">
                  <TicketIcon class="w-5 h-5 text-blue-600" />
                  <div>
                    <span class="text-blue-600 font-medium">Bono:</span>
                    <span class="text-blue-900 ml-2">Se descontará 1 sesión del bono activo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción (fijos al fondo) -->
        <div class="sticky bottom-0 bg-[#F2F2F2] pt-4 border-t border-[#5550F2]/30 flex gap-3 mt-6">
          <button
            type="button"
            @click="cerrarModal"
            class="flex-1 px-6 py-3 border-2 border-[#5550F2] text-[#2D3748] rounded-lg hover:bg-[#5550F2]/10 transition-colors font-medium"
            aria-label="Cancelar creación de cita"
          >
            Cancelar
          </button>
          <div class="relative flex-1">
            <button
              type="submit"
              :disabled="!formularioValido || guardando || conflictoHorario"
              :class="[
                'w-full px-6 py-3 rounded-lg transition-all font-medium text-white',
                formularioValido && !guardando && !conflictoHorario
                  ? 'bg-[#5550F2] hover:bg-[#5550F2]/90 hover:shadow-lg cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed opacity-60'
              ]"
              :aria-label="formularioValido ? 'Guardar cita' : 'Completa todos los campos requeridos para guardar'"
              @mouseenter="validarCampos"
            >
              {{ guardando ? 'Guardando...' : '✓ Guardar Cita' }}
            </button>
            <!-- Tooltip para botón deshabilitado -->
            <div 
              v-if="!formularioValido && !guardando"
              class="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
            >
              Completa todos los campos obligatorios (*)
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Toast de confirmación -->
    <Transition name="slide-up">
      <div
        v-if="mostrarToast"
        :class="[
          'fixed bottom-6 right-6 max-w-md rounded-lg shadow-2xl p-4 z-[60]',
          toastTipo === 'exito' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
          toastTipo === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
          'bg-gradient-to-r from-blue-500 to-indigo-500'
        ]"
      >
        <div class="flex items-start gap-3 text-white">
          <div class="text-3xl">
            {{ toastTipo === 'exito' ? '✅' : toastTipo === 'error' ? '❌' : 'ℹ️' }}
          </div>
          <div class="flex-1">
            <div class="font-bold text-lg mb-1">{{ toastTitulo }}</div>
            <div class="text-sm opacity-90 mb-3">{{ toastMensaje }}</div>
            
            <!-- Botones de acción -->
            <div v-if="toastAcciones.length > 0" class="flex gap-2">
              <button
                v-for="(accion, index) in toastAcciones"
                :key="index"
                @click="accion.accion"
                class="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-all"
              >
                {{ accion.texto }}
              </button>
            </div>
          </div>
          <button
            @click="mostrarToast = false"
            class="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { type PropType, nextTick } from 'vue'
import { useCitas } from '~/composables/useCitas'
import { 
  UserIcon, 
  CalendarIcon, 
  ClockIcon, 
  ComputerDesktopIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckBadgeIcon,
  TicketIcon,
  CreditCardIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  // Mantener 'mostrar' por compatibilidad pero usar modelValue como primario
  mostrar: {
    type: Boolean,
    default: false
  },
  fechaPreseleccionada: {
    type: String,
    default: ''
  },
  horaPreseleccionada: {
    type: String,
    default: ''
  },
  titulo: {
    type: String,
    default: ''
  },
  // Nuevo: paciente preseleccionado
  pacientePreseleccionado: {
    type: Object as PropType<{
      id: string
      nombre: string
      email: string
      frecuencia?: string
      area_acompanamiento?: string
    }>,
    default: null
  },
  // ID de la cita en edición (para excluirla de verificación de conflictos)
  citaId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['cerrar', 'citaCreada', 'actualizado', 'update:modelValue'])

// Composables
const { crearCita, actualizarCita, getCitasPorDia, verificarBonoActivo, calcularProximaFechaSugerida, sugerirProximoHorario } = useCitas()
const supabase = useSupabaseClient()
const router = useRouter()

// Modo edición
const modoEdicion = computed(() => !!props.citaId)
const cargandoCita = ref(false)

// Estado
const busquedaPaciente = ref('')
const mostrarListaPacientes = ref(false)
const pacienteSeleccionado = ref<any>(null)
const guardando = ref(false)
const conflictoHorario = ref(false)
const cargandoPacientes = ref(false)
const pacientesReales = ref<any[]>([])
const horaSugerida = ref<string | null>(null)
const cargandoSugerencia = ref(false)

// Coordinadora: terapeutas
const esCoordinadora = ref(false)
const terapeutas = ref<any[]>([])
const cargandoTerapeutas = ref(false)
const terapeutaSeleccionado = ref<any>(null)

// Toast
const mostrarToast = ref(false)
const toastTitulo = ref('')
const toastMensaje = ref('')
const toastTipo = ref<'exito' | 'error' | 'info'>('exito')
const toastAcciones = ref<Array<{ texto: string; accion: () => void }>>([])

const infoBono = ref<{
  tiene_bono: boolean
  sesiones_restantes: number
  sesiones_totales: number
  tipo_bono: string
  bono_id?: string
}>({
  tiene_bono: false,
  sesiones_restantes: 0,
  sesiones_totales: 0,
  tipo_bono: '',
  bono_id: undefined
})

const formulario = ref({
  paciente_id: '',
  paciente_nombre: '',
  terapeuta_id: '', // Para coordinadora
  terapeuta_nombre: '', // Para coordinadora
  fecha: props.fechaPreseleccionada || formatearFecha(new Date()),
  fecha_manual: '', // Nueva: para entrada manual de fecha
  hora_inicio: props.horaPreseleccionada || '',
  hora_fin: '',
  duracion: '60',
  tipo: 'presencial',
  estado: 'pendiente',
  notas: '',
  descontar_de_bono: false,
  bono_id: undefined as string | undefined
})

// Nueva: fecha sugerida
const fechaSugerida = ref<string | null>(null)
const mostrarResumen = ref(false)
const camposInvalidos = ref<string[]>([])

// Configuración de horarios disponibles
// Horario laboral: 11:00 - 22:00 con descanso de 14:00 - 17:00
const horasDisponibles = [
  // Mañana: 11:00 - 13:30 (antes del descanso)
  '11:00', '11:30', 
  '12:00', '12:30', 
  '13:00', '13:30',
  // Descanso: 14:00 - 17:00 (no disponible)
  // Tarde/Noche: 17:00 - 22:00 (después del descanso)
  '17:00', '17:30', 
  '18:00', '18:30', 
  '19:00', '19:30',
  '20:00', '20:30',
  '21:00', '21:30',
  '22:00'
]

const tiposSesion = [
  { 
    valor: 'presencial', 
    nombre: 'Presencial', 
    componente: BuildingOfficeIcon,
    descripcion: 'Sesión presencial en consultorio'
  },
  { 
    valor: 'online', 
    nombre: 'Online', 
    componente: ComputerDesktopIcon,
    descripcion: 'Videollamada por plataforma digital'
  },
  { 
    valor: 'telefonica', 
    nombre: 'Telefónica', 
    componente: PhoneIcon,
    descripcion: 'Llamada telefónica'
  }
]

const estadosCita = [
  { 
    valor: 'confirmada', 
    nombre: 'Confirmada', 
    componente: CheckBadgeIcon, 
    claseActivo: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    claseInactivo: 'border-gray-300 hover:border-emerald-400 bg-white'
  },
  { 
    valor: 'pendiente', 
    nombre: 'Pendiente', 
    componente: ClockIcon, 
    claseActivo: 'border-amber-500 bg-amber-50 text-amber-700',
    claseInactivo: 'border-gray-300 hover:border-amber-400 bg-white'
  },
  { 
    valor: 'cancelada', 
    nombre: 'Cancelada', 
    componente: XCircleIcon, 
    claseActivo: 'border-red-500 bg-red-50 text-red-700',
    claseInactivo: 'border-gray-300 hover:border-red-400 bg-white'
  },
  { 
    valor: 'completada', 
    nombre: 'Completada', 
    componente: CheckCircleIcon, 
    claseActivo: 'border-blue-500 bg-blue-50 text-blue-700',
    claseInactivo: 'border-gray-300 hover:border-blue-400 bg-white'
  }
]

// Computed
const fechaMinima = computed(() => {
  return formatearFecha(new Date())
})

// Opciones de fecha rápida
const opcionesFechaRapida = computed(() => {
  const hoy = new Date()
  const opciones = []
  
  // Hoy
  opciones.push({
    label: 'Hoy',
    fecha: formatearFecha(hoy)
  })
  
  // Mañana
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)
  opciones.push({
    label: 'Mañana',
    fecha: formatearFecha(manana)
  })
  
  // Próximos 5 días laborables
  const diasLaborables = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
  let fecha = new Date(hoy)
  let contadorDias = 0
  
  while (contadorDias < 5) {
    fecha.setDate(fecha.getDate() + 1)
    const diaSemana = fecha.getDay()
    
    // Solo días laborables (1-5 = Lun-Vie)
    if (diaSemana >= 1 && diaSemana <= 5) {
      opciones.push({
        label: `${diasLaborables[diaSemana - 1]} ${fecha.getDate()}`,
        fecha: formatearFecha(fecha)
      })
      contadorDias++
    }
  }
  
  return opciones
})

const pacientesFiltrados = computed(() => {
  if (!busquedaPaciente.value) return []
  
  const busqueda = busquedaPaciente.value.toLowerCase().trim()
  
  // Si la búsqueda es muy corta, no filtrar
  if (busqueda.length < 2) return []
  
  return pacientesReales.value.filter((p: any) => 
    p.nombre.toLowerCase().includes(busqueda) ||
    p.email.toLowerCase().includes(busqueda)
  )
})

const formularioValido = computed(() => {
  // Validar paciente
  const validoPaciente = formulario.value.paciente_id
  
  // Validar terapeuta solo si es coordinadora
  const validoTerapeuta = esCoordinadora.value ? formulario.value.terapeuta_id : true

  return validoPaciente &&
    validoTerapeuta &&
    formulario.value.fecha &&
    formulario.value.hora_inicio &&
    formulario.value.hora_fin &&
    formulario.value.tipo &&
    formulario.value.estado
})

// Métodos
async function cargarPacientes() {
  console.log('📋 Cargando pacientes...')
  cargandoPacientes.value = true
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('❌ No hay usuario autenticado')
      return
    }

    console.log('👤 Usuario ID:', user.id)

    // Usar el composable para obtener el perfil con el rol correcto
    const { userProfile } = useSupabase()

    console.log('🎭 Rol de usuario:', userProfile.value?.rol || 'desconocido')

    let query = supabase
      .from('pacientes')
      .select(`
        id,
        nombre_completo,
        email,
        metadata
      `)
      .eq('activo', true)
      .order('created_at', { ascending: false })

    // Si NO es coordinadora, filtrar por terapeuta_id
    if (userProfile.value?.rol !== 'coordinadora') {
      console.log('👨‍⚕️ Filtrando por terapeuta_id:', user.id)
      query = query.eq('terapeuta_id', user.id)
    } else {
      console.log('🌟 Coordinadora - cargando TODOS los pacientes')
    }
    // Si es coordinadora, cargar TODOS los pacientes activos

    const { data, error } = await query

    if (error) {
      console.error('❌ Error al cargar pacientes:', error)
      return
    }

    // Transformar los datos para tener una estructura uniforme
    pacientesReales.value = (data || []).map((p: any) => ({
      id: p.id,
      nombre: p.nombre_completo || 'Sin nombre',
      email: p.email || '',
      frecuencia: p.metadata?.frecuencia || 'No definida',
      area_acompanamiento: p.metadata?.area_de_acompanamiento || ''
    }))
    
    console.log(`✅ ${pacientesReales.value.length} pacientes cargados (rol: ${userProfile.value?.rol || 'desconocido'})`)
    console.log('📝 Pacientes:', pacientesReales.value)
  } catch (error) {
    console.error('❌ Error al cargar pacientes:', error)
  } finally {
    cargandoPacientes.value = false
  }
}

function onBusquedaInput() {
  // Mostrar lista automáticamente cuando se escribe
  if (busquedaPaciente.value.length >= 2) {
    mostrarListaPacientes.value = true
  } else {
    mostrarListaPacientes.value = false
  }
}

async function seleccionarPaciente(paciente: any) {
  pacienteSeleccionado.value = paciente
  formulario.value.paciente_id = paciente.id
  formulario.value.paciente_nombre = paciente.nombre
  busquedaPaciente.value = paciente.nombre
  mostrarListaPacientes.value = false
  
  // Verificar si tiene bono activo
  const resultadoBono = await verificarBonoActivo(paciente.id)
  infoBono.value = resultadoBono
  
  // Pre-seleccionar descontar de bono si tiene bono activo
  if (resultadoBono.tiene_bono && resultadoBono.sesiones_restantes > 0) {
    formulario.value.descontar_de_bono = true
    formulario.value.bono_id = resultadoBono.bono_id
  }

  // Sugerir próximo horario disponible basado en frecuencia
  if (paciente.frecuencia && !props.fechaPreseleccionada) {
    cargandoSugerencia.value = true
    try {
      const sugerencia = await sugerirProximoHorario(paciente.id, paciente.frecuencia)
      if (sugerencia) {
        fechaSugerida.value = sugerencia.fecha
        horaSugerida.value = sugerencia.hora
        formulario.value.fecha = sugerencia.fecha
        formulario.value.hora_inicio = sugerencia.hora
        calcularHoraFin()
        console.log('💡 Horario sugerido:', sugerencia)
      }
    } catch (error) {
      console.error('Error al sugerir horario:', error)
    } finally {
      cargandoSugerencia.value = false
    }
  }
  
  console.log('✅ Paciente seleccionado:', paciente.nombre)
}

async function deseleccionarPaciente() {
  // Limpiar en el orden correcto
  pacienteSeleccionado.value = null
  formulario.value.paciente_id = ''
  formulario.value.paciente_nombre = ''
  formulario.value.descontar_de_bono = false
  formulario.value.bono_id = undefined
  infoBono.value = {
    tiene_bono: false,
    sesiones_restantes: 0,
    sesiones_totales: 0,
    tipo_bono: '',
    bono_id: undefined
  }
  fechaSugerida.value = null
  horaSugerida.value = null
  
  // Esperar a que Vue actualice el DOM
  await nextTick()
  
  // Limpiar búsqueda al final y enfocar el input
  busquedaPaciente.value = ''
  mostrarListaPacientes.value = false
}

// Función para mostrar toast
function mostrarToastExito(titulo: string, mensaje: string, acciones: Array<{ texto: string; accion: () => void }> = []) {
  toastTitulo.value = titulo
  toastMensaje.value = mensaje
  toastTipo.value = 'exito'
  toastAcciones.value = acciones
  mostrarToast.value = true
  setTimeout(() => { mostrarToast.value = false }, 5000)
}

function mostrarToastError(titulo: string, mensaje: string) {
  toastTitulo.value = titulo
  toastMensaje.value = mensaje
  toastTipo.value = 'error'
  toastAcciones.value = []
  mostrarToast.value = true
  setTimeout(() => { mostrarToast.value = false }, 4000)
}

function calcularHoraFin() {
  if (!formulario.value.hora_inicio || !formulario.value.duracion) return

  const partes = formulario.value.hora_inicio.split(':').map(Number)
  const horas = partes[0] || 0
  const minutos = partes[1] || 0
  const duracionMinutos = parseInt(formulario.value.duracion)
  
  const fechaInicio = new Date()
  fechaInicio.setHours(horas, minutos, 0, 0)
  
  const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000)
  
  const horaFin = String(fechaFin.getHours()).padStart(2, '0')
  const minutosFin = String(fechaFin.getMinutes()).padStart(2, '0')
  
  formulario.value.hora_fin = `${horaFin}:${minutosFin}`
}

async function verificarConflicto() {
  // Si no hay fecha u hora, no hay conflicto que verificar
  if (!formulario.value.fecha || !formulario.value.hora_inicio || !formulario.value.hora_fin) {
    conflictoHorario.value = false
    return
  }

  try {
    const citas = await getCitasPorDia(formulario.value.fecha)
    
    // Filtrar solo citas confirmadas o pendientes (no canceladas, no en estado borrador)
    // Y excluir la cita actual si estamos editando
    const citasActivas = citas.filter((cita: any) => 
      cita.estado !== 'cancelada' && 
      cita.estado !== 'borrador' &&
      cita.estado !== null &&
      // Excluir la cita actual si existe citaId (estamos editando)
      cita.id !== props.citaId
    )
    
    const inicioNueva = formulario.value.hora_inicio
    const finNueva = formulario.value.hora_fin
    
    // Verificar solapamiento con lógica mejorada
    conflictoHorario.value = citasActivas.some((cita: any) => {
      const inicioExistente = cita.hora_inicio
      const finExistente = cita.hora_fin
      
      // Convertir horas a minutos para comparación precisa
      const minNuevaInicio = horaAMinutos(inicioNueva)
      const minNuevaFin = horaAMinutos(finNueva)
      const minExistenteInicio = horaAMinutos(inicioExistente)
      const minExistenteFin = horaAMinutos(finExistente)
      
      // Verificar solapamiento real
      // Dos intervalos se solapan si:
      // - El inicio de uno está dentro del otro O
      // - El fin de uno está dentro del otro O
      // - Uno contiene completamente al otro
      const haySolapamiento = (
        (minNuevaInicio >= minExistenteInicio && minNuevaInicio < minExistenteFin) || // Inicia durante otra cita
        (minNuevaFin > minExistenteInicio && minNuevaFin <= minExistenteFin) ||        // Termina durante otra cita
        (minNuevaInicio <= minExistenteInicio && minNuevaFin >= minExistenteFin) ||    // Contiene otra cita
        (minNuevaInicio === minExistenteInicio && minNuevaFin === minExistenteFin)     // Exactamente igual
      )
      
      if (haySolapamiento) {
        console.log('⚠️ Conflicto detectado:', {
          nueva: `${inicioNueva} - ${finNueva}`,
          existente: `${inicioExistente} - ${finExistente}`,
          estado: cita.estado,
          paciente: cita.paciente_nombre || 'Desconocido'
        })
      }
      
      return haySolapamiento
    })
    
    if (conflictoHorario.value) {
      console.warn('⚠️ Hay conflicto de horario')
    }
  } catch (error) {
    console.error('❌ Error al verificar conflicto:', error)
    conflictoHorario.value = false
  }
}

// Función auxiliar para convertir hora en formato HH:MM a minutos totales
function horaAMinutos(hora: string): number {
  if (!hora || !hora.includes(':')) return 0
  const [horas, minutos] = hora.split(':').map(Number)
  return (horas || 0) * 60 + (minutos || 0)
}

async function guardarCita() {
  guardando.value = true
  
  try {
    // Validar campos requeridos
    if (!formulario.value.paciente_id) {
      mostrarToastError('Paciente requerido', 'Por favor, selecciona un paciente antes de continuar.')
      guardando.value = false
      return
    }

    if (!formulario.value.fecha || !formulario.value.hora_inicio || !formulario.value.hora_fin) {
      mostrarToastError('Datos incompletos', 'Por favor, completa la fecha y hora de la cita.')
      guardando.value = false
      return
    }
    
    // Validar que la coordinadora seleccione un terapeuta
    if (esCoordinadora.value && !formulario.value.terapeuta_id) {
      mostrarToastError('Terapeuta requerido', 'Por favor, selecciona un terapeuta antes de continuar.')
      guardando.value = false
      return
    }
    
    // Verificar conflictos de horario
    await verificarConflicto()
    
    if (conflictoHorario.value) {
      mostrarToastError('Conflicto de Horario', 'Ya existe una cita en este horario. Por favor, selecciona otro.')
      guardando.value = false
      return
    }
    
    // Preparar datos de la cita
    const datosCita: any = {
      paciente_id: formulario.value.paciente_id,
      paciente_nombre: formulario.value.paciente_nombre || pacienteSeleccionado.value?.nombre || 'Sin nombre',
      fecha_cita: formulario.value.fecha,
      hora_inicio: formulario.value.hora_inicio,
      hora_fin: formulario.value.hora_fin,
      duracion: parseInt(formulario.value.duracion),
      modalidad: formulario.value.tipo as 'presencial' | 'online' | 'telefonica',
      estado: (formulario.value.estado === 'completada' ? 'realizada' : formulario.value.estado) as 'confirmada' | 'pendiente' | 'cancelada' | 'realizada',
      observaciones: formulario.value.notas,
      bono_id: formulario.value.bono_id
    }
    
    // Si es coordinadora, agregar terapeuta_id explícitamente
    if (esCoordinadora.value && formulario.value.terapeuta_id) {
      datosCita.terapeuta_id = formulario.value.terapeuta_id
    }
    
    let resultado
    
    // MODO EDICIÓN: Actualizar cita existente
    if (modoEdicion.value && props.citaId) {
      console.log('📝 [ModalNuevaCita] Actualizando cita con ID:', props.citaId, datosCita)
      
      resultado = await actualizarCita(props.citaId, datosCita)
      
      if (resultado.success) {
        // Limpiar localStorage
        localStorage.removeItem('nueva_cita_temp')
        
        const fechaLegible = formatearFechaLegible(formulario.value.fecha)
        const modalidadIcono = formulario.value.tipo === 'presencial' ? '🏥' : formulario.value.tipo === 'online' ? '💻' : '📞'
        const nombrePaciente = formulario.value.paciente_nombre || pacienteSeleccionado.value?.nombre || 'Paciente'
        
        mostrarToastExito(
          '✅ Cita actualizada con éxito',
          `${nombrePaciente} – ${fechaLegible}, ${formulario.value.hora_inicio} (${modalidadIcono} ${formulario.value.tipo})`,
          []
        )
        
        // Emitir eventos
        emit('actualizado')
        emit('citaCreada', resultado.data) // Mantener compatibilidad
        
        console.log('✅ [ModalNuevaCita] Cita actualizada exitosamente')
        
        // Cerrar el modal
        setTimeout(() => {
          cerrarModal()
        }, 1000)
      } else {
        mostrarToastError('Error al actualizar', resultado.error || 'No se pudo actualizar la cita. Intenta de nuevo.')
      }
    } 
    // MODO CREACIÓN: Crear nueva cita
    else {
      console.log('🚀 [ModalNuevaCita] Creando nueva cita:', datosCita)
      
      // Agregar campo de descuento de bono solo al crear
      const datosConBono: any = {
        paciente_id: formulario.value.paciente_id,
        paciente_nombre: formulario.value.paciente_nombre || pacienteSeleccionado.value?.nombre || 'Sin nombre',
        fecha: formulario.value.fecha, // crearCita espera 'fecha' no 'fecha_cita'
        hora_inicio: formulario.value.hora_inicio,
        hora_fin: formulario.value.hora_fin,
        modalidad: formulario.value.tipo as 'presencial' | 'online' | 'telefonica',
        estado: (formulario.value.estado === 'completada' ? 'realizada' : formulario.value.estado) as 'confirmada' | 'pendiente' | 'cancelada' | 'realizada',
        notas: formulario.value.notas,
        descontar_de_bono: formulario.value.descontar_de_bono,
        bono_id: formulario.value.bono_id
      }
      
      // Si es coordinadora, agregar terapeuta_id
      if (esCoordinadora.value && formulario.value.terapeuta_id) {
        datosConBono.terapeuta_id = formulario.value.terapeuta_id
      }
      
      resultado = await crearCita(datosConBono)
      
      if (resultado.success) {
        // Limpiar localStorage
        localStorage.removeItem('nueva_cita_temp')
        
        const fechaLegible = formatearFechaLegible(formulario.value.fecha)
        const modalidadIcono = formulario.value.tipo === 'presencial' ? '🏥' : formulario.value.tipo === 'online' ? '💻' : '📞'
        const nombrePaciente = formulario.value.paciente_nombre || pacienteSeleccionado.value?.nombre || 'Paciente'
        
        const mensajeExito = `${nombrePaciente} – ${fechaLegible}, ${formulario.value.hora_inicio} (${modalidadIcono} ${formulario.value.tipo})`
        
        let mensajeFinal = mensajeExito
        if (resultado.data?.bono_id && infoBono.value.tiene_bono) {
          const sesionesRestantes = infoBono.value.sesiones_restantes - 1
          mensajeFinal += `\n🎫 Bono activo: ${sesionesRestantes} sesiones restantes después de esta`
        }
        
        mostrarToastExito(
          '✅ Cita creada con éxito',
          mensajeFinal,
          [
            {
              texto: '📅 Ver en Agenda',
              accion: () => {
                router.push('/agenda')
                mostrarToast.value = false
              }
            },
            {
              texto: '➕ Nueva Cita',
              accion: () => {
                mostrarToast.value = false
                resetFormulario()
              }
            }
          ]
        )
        
        emit('citaCreada', resultado.data)
        emit('actualizado')
        
        console.log('✅ [ModalNuevaCita] Cita creada exitosamente:', resultado.data)
        
        setTimeout(() => {
          cerrarModal()
        }, 1000)
      } else {
        mostrarToastError('Error al crear', resultado.error || 'No se pudo crear la cita. Intenta de nuevo.')
      }
    }
  } catch (error: any) {
    console.error('❌ Error al guardar cita:', error)
    mostrarToastError('Error inesperado', error.message || 'Ocurrió un error al guardar la cita')
  } finally {
    guardando.value = false
  }
}

// Cargar datos de cita existente para edición
async function cargarCitaExistente() {
  if (!props.citaId) return
  
  try {
    cargandoCita.value = true
    
    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        paciente:pacientes!citas_paciente_id_fkey (
          id,
          nombre_completo,
          email,
          telefono,
          frecuencia,
          area_acompanamiento
        ),
        bono:bonos!citas_bono_id_fkey (
          id,
          tipo,
          sesiones_totales,
          sesiones_restantes
        )
      `)
      .eq('id', props.citaId)
      .single()
    
    if (error) throw error
    
    if (data) {
      // Cargar datos en el formulario
      formulario.value = {
        paciente_id: data.paciente_id,
        paciente_nombre: data.paciente?.nombre_completo || data.paciente_nombre || '',
        terapeuta_id: data.terapeuta_id || '',
        terapeuta_nombre: '',
        fecha: data.fecha_cita,
        fecha_manual: '',
        hora_inicio: data.hora_inicio?.substring(0, 5) || '',
        hora_fin: data.hora_fin?.substring(0, 5) || '',
        duracion: String(data.duracion || 60),
        tipo: data.modalidad || 'presencial',
        estado: data.estado || 'pendiente',
        notas: data.observaciones || '',
        descontar_de_bono: false,
        bono_id: data.bono_id || undefined
      }
      
      // Seleccionar paciente
      if (data.paciente) {
        pacienteSeleccionado.value = {
          id: data.paciente.id,
          nombre: data.paciente.nombre_completo,
          email: data.paciente.email,
          telefono: data.paciente.telefono,
          frecuencia: data.paciente.frecuencia,
          area_acompanamiento: data.paciente.area_acompanamiento
        }
        
        // Cargar info del bono
        const resultadoBono = await verificarBonoActivo(data.paciente.id)
        infoBono.value = resultadoBono
      }
    }
  } catch (error) {
    console.error('Error al cargar cita:', error)
    mostrarToastError('Error', 'No se pudo cargar la cita para editar')
  } finally {
    cargandoCita.value = false
  }
}

function cerrarModal() {
  // Guardar en localStorage si hay datos sin guardar
  if (formulario.value.paciente_id || formulario.value.fecha !== formatearFecha(new Date())) {
    localStorage.setItem('nueva_cita_temp', JSON.stringify({
      ...formulario.value,
      timestamp: Date.now()
    }))
  }
  
  emit('cerrar')
  emit('update:modelValue', false) // Para compatibilidad con v-model
  resetFormulario()
}

function resetFormulario() {
  formulario.value = {
    paciente_id: '',
    paciente_nombre: '',
    terapeuta_id: '',
    terapeuta_nombre: '',
    fecha: formatearFecha(new Date()),
    fecha_manual: '',
    hora_inicio: '',
    hora_fin: '',
    duracion: '60',
    tipo: 'presencial',
    estado: 'pendiente',
    notas: '',
    descontar_de_bono: false,
    bono_id: undefined
  }
  
  busquedaPaciente.value = ''
  pacienteSeleccionado.value = null
  terapeutaSeleccionado.value = null
  conflictoHorario.value = false
  fechaSugerida.value = null
  horaSugerida.value = null
  camposInvalidos.value = []
  infoBono.value = {
    tiene_bono: false,
    sesiones_restantes: 0,
    sesiones_totales: 0,
    tipo_bono: '',
    bono_id: undefined
  }
}

// Función para cargar datos temporales
function cargarDatosTemporales() {
  const datosTemp = localStorage.getItem('nueva_cita_temp')
  if (datosTemp) {
    try {
      const datos = JSON.parse(datosTemp)
      // Solo cargar si no han pasado más de 24 horas
      if (Date.now() - datos.timestamp < 24 * 60 * 60 * 1000) {
        // Aquí podrías mostrar un diálogo preguntando si quiere recuperar
        console.log('💾 Datos temporales disponibles')
      } else {
        localStorage.removeItem('nueva_cita_temp')
      }
    } catch (error) {
      console.error('Error al cargar datos temporales:', error)
    }
  }
}

function formatearFecha(fecha: Date): string {
  const resultado = fecha.toISOString().split('T')[0]
  return resultado || ''
}

function formatearFechaLegible(fecha: string): string {
  const date = new Date(fecha + 'T00:00:00')
  const opciones: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('es-MX', opciones)
}

function validarCampos() {
  const invalidos: string[] = []
  
  if (!formulario.value.paciente_id) invalidos.push('paciente')
  if (!formulario.value.fecha) invalidos.push('fecha')
  if (!formulario.value.hora_inicio) invalidos.push('hora_inicio')
  if (!formulario.value.tipo) invalidos.push('tipo')
  if (!formulario.value.estado) invalidos.push('estado')
  
  camposInvalidos.value = invalidos
  return invalidos.length === 0
}

// Cargar terapeutas (solo para coordinadora)
async function cargarTerapeutas() {
  cargandoTerapeutas.value = true
  
  try {
    const { data, error } = await supabase
      .from('terapeutas')
      .select('id, nombre_completo, email, especialidad')
      .eq('activo', true)
      .order('nombre_completo', { ascending: true })

    if (error) {
      console.error('Error al cargar terapeutas:', error)
      return
    }

    terapeutas.value = data || []
    console.log(`✅ ${terapeutas.value.length} terapeutas cargados`)
  } catch (error) {
    console.error('Error al cargar terapeutas:', error)
  } finally {
    cargandoTerapeutas.value = false
  }
}

// Detectar si el usuario es coordinadora
async function verificarRolUsuario() {
  try {
    console.log('🔍 Verificando rol de usuario...')
    
    // Usar el composable useSupabase que ya tiene la lógica correcta
    const { userProfile } = useSupabase()
    
    if (!userProfile.value) {
      console.warn('⚠️ No hay perfil cargado')
      esCoordinadora.value = false
      return
    }

    console.log('👤 Usuario:', userProfile.value.email)
    console.log('🎭 Rol del perfil:', userProfile.value.rol)

    esCoordinadora.value = userProfile.value.rol === 'coordinadora'
    
    console.log(`✅ ¿Es coordinadora? ${esCoordinadora.value}`)
    
    if (esCoordinadora.value) {
      console.log('🌟 Usuario es coordinadora - cargando terapeutas')
      await cargarTerapeutas()
    }
  } catch (error) {
    console.error('❌ Error al verificar rol:', error)
    esCoordinadora.value = false
  }
}

// Seleccionar terapeuta (coordinadora)
function seleccionarTerapeuta(terapeuta: any) {
  terapeutaSeleccionado.value = terapeuta
  formulario.value.terapeuta_id = terapeuta.id
  formulario.value.terapeuta_nombre = terapeuta.nombre_completo
  console.log('✅ Terapeuta seleccionado:', terapeuta.nombre_completo)
}

// Watchers
watch([() => formulario.value.fecha, () => formulario.value.hora_inicio, () => formulario.value.hora_fin], () => {
  if (formulario.value.fecha && formulario.value.hora_inicio && formulario.value.hora_fin) {
    verificarConflicto()
  }
})

watch(() => props.fechaPreseleccionada, (nueva) => {
  if (nueva) {
    formulario.value.fecha = nueva
  }
})

watch(() => props.horaPreseleccionada, (nueva) => {
  if (nueva) {
    formulario.value.hora_inicio = nueva
    calcularHoraFin()
  }
})

// Inicializar
onMounted(async () => {
  await verificarRolUsuario()
  cargarPacientes()
  cargarDatosTemporales()
  
  if (props.horaPreseleccionada) {
    calcularHoraFin()
  }
  
  // Cerrar lista de pacientes al hacer clic fuera
  document.addEventListener('click', cerrarListaPacientes)
  
  // Atajos de teclado
  document.addEventListener('keydown', manejarAtajosTeclado)
})

onUnmounted(() => {
  document.removeEventListener('click', cerrarListaPacientes)
  document.removeEventListener('keydown', manejarAtajosTeclado)
})

// Manejar atajos de teclado
function manejarAtajosTeclado(event: KeyboardEvent) {
  if (!props.mostrar) return
  
  // ESC - Cerrar modal
  if (event.key === 'Escape') {
    cerrarModal()
  }
  
  // ENTER - Prevenir envío del formulario si está escribiendo en inputs o textarea
  if (event.key === 'Enter' && !event.shiftKey) {
    const target = event.target as HTMLElement
    const tagName = target.tagName
    
    // Si está en un campo de entrada, prevenir envío
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
      event.preventDefault()
      return
    }
    
    // Solo permitir guardar con Enter desde botones o fuera de campos
    if (formularioValido.value && !guardando.value) {
      event.preventDefault()
      guardarCita()
    }
  }
}

// Cerrar lista al hacer clic fuera
function cerrarListaPacientes() {
  if (mostrarListaPacientes.value) {
    mostrarListaPacientes.value = false
  }
}

// Recargar pacientes cuando se abre el modal
watch(() => props.mostrar, (nuevo) => {
  if (nuevo) {
    console.log('🎯 Modal abierto - verificando rol y cargando datos')
    verificarRolUsuario()
    cargarPacientes()
    
    // Si hay paciente preseleccionado, cargarlo automáticamente
    if (props.pacientePreseleccionado) {
      nextTick(() => {
        seleccionarPaciente({
          id: props.pacientePreseleccionado.id,
          nombre: props.pacientePreseleccionado.nombre,
          email: props.pacientePreseleccionado.email,
          frecuencia: props.pacientePreseleccionado.frecuencia || 'No definida',
          area_acompanamiento: props.pacientePreseleccionado.area_acompanamiento || ''
        })
      })
    }
  }
})
</script>

<style scoped>
/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.fixed {
  animation: fadeIn 0.2s ease-out;
}

.bg-\[\#F2F2F2\] {
  animation: slideUp 0.3s ease-out;
}

/* Transiciones para toast */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
