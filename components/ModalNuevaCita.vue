<template>
  <div
    v-if="modelValue || mostrar"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="cerrarModal"
  >
    <div class="bg-[#F9F7F3] rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-[#F9F7F3] border-b border-[#D8AFA0]/30 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-['Lora'] text-[#5D4A44] font-semibold">
            {{ titulo || 'Nueva Cita' }}
          </h2>
          <p v-if="fechaPreseleccionada" class="text-sm text-[#5D4A44]/60 mt-1">
            {{ formatearFechaLegible(fechaPreseleccionada) }} a las {{ horaPreseleccionada }}
          </p>
        </div>
        <button
          @click="cerrarModal"
          class="text-[#5D4A44] hover:text-[#D8AFA0] transition-colors"
          aria-label="Cerrar modal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Contenido -->
      <form @submit.prevent="guardarCita" class="px-6 py-6 space-y-6">
        <!-- Indicador de Paciente Preseleccionado (desde ficha) -->
        <div v-if="props.pacientePreseleccionado && pacienteSeleccionado" class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl">
                ✓
              </div>
              <div>
                <div class="text-xs text-green-600 font-medium mb-1">PACIENTE SELECCIONADO</div>
                <div class="font-bold text-green-900 text-lg">{{ pacienteSeleccionado.nombre }}</div>
                <div class="text-sm text-green-700">{{ pacienteSeleccionado.email }}</div>
                <div v-if="pacienteSeleccionado.frecuencia" class="mt-1 flex items-center gap-2 text-xs">
                  <span>📅</span>
                  <span class="text-green-700">Frecuencia: <strong class="capitalize">{{ pacienteSeleccionado.frecuencia }}</strong></span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div v-if="infoBono.tiene_bono" class="text-xs text-green-600 mb-1">🎫 BONO ACTIVO</div>
              <div v-if="infoBono.tiene_bono" class="text-2xl font-bold text-green-900">
                {{ infoBono.sesiones_restantes }}/{{ infoBono.sesiones_totales }}
              </div>
              <div v-if="infoBono.tiene_bono" class="text-xs text-green-600">sesiones</div>
            </div>
          </div>
        </div>

        <!-- Paso 1: Selección de Paciente (SOLO SI NO HAY PRESELECCIONADO) -->
        <div v-if="!props.pacientePreseleccionado" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-['Lora'] text-[#5D4A44] font-semibold flex items-center gap-2">
              <span v-if="!pacienteSeleccionado" class="w-7 h-7 rounded-full bg-[#D8AFA0] text-white flex items-center justify-center text-sm font-bold">1</span>
              <span v-else class="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center">✓</span>
              {{ pacienteSeleccionado ? 'Paciente Seleccionado' : 'Seleccionar Paciente' }}
            </h3>
          </div>

          <!-- Info: Solo pacientes existentes -->
          <div v-if="!pacienteSeleccionado" class="pt-2 pb-3 text-sm text-[#5D4A44]/60">
            <p class="flex items-center gap-2">
              <span>�</span>
              <span>Busca y selecciona un paciente ya registrado en el sistema</span>
            </p>
            <p class="text-xs text-[#5D4A44]/50 mt-2 flex items-center gap-2">
              <span>ℹ️</span>
              <span>Para crear un paciente nuevo, ve a la sección <strong>Pacientes</strong> en el menú principal</span>
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
                class="w-full px-4 py-2.5 pl-10 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
                @focus="mostrarListaPacientes = true"
                @input="onBusquedaInput"
                autocomplete="off"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5D4A44]/50">
                🔍
              </span>
              
              <!-- Indicador de carga -->
              <span v-if="cargandoPacientes" class="absolute right-3 top-1/2 -translate-y-1/2">
                <svg class="animate-spin h-5 w-5 text-[#D8AFA0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              
              <!-- Tooltip de ayuda -->
              <div v-if="!busquedaPaciente && !cargandoPacientes" class="mt-1 text-xs text-[#5D4A44]/50">
                💡 Escribe al menos 2 caracteres para buscar
              </div>
            </div>

            <!-- Lista de pacientes filtrados -->
            <div
              v-if="mostrarListaPacientes && busquedaPaciente && pacientesFiltrados.length > 0"
              class="border border-[#D8AFA0]/30 rounded-lg bg-white max-h-60 overflow-y-auto shadow-lg"
              @click.stop
            >
              <button
                v-for="paciente in pacientesFiltrados"
                :key="paciente.id"
                type="button"
                @click="seleccionarPaciente(paciente)"
                class="w-full px-4 py-3 text-left hover:bg-[#D8AFA0]/10 hover:border-l-4 hover:border-l-[#D8AFA0] transition-all border-b border-[#D8AFA0]/20 last:border-b-0 cursor-pointer group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-[#D8AFA0]/20 group-hover:bg-[#D8AFA0] flex items-center justify-center transition-colors">
                    <span class="text-2xl group-hover:scale-110 transition-transform">👤</span>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-[#5D4A44] group-hover:text-[#D8AFA0] transition-colors">
                      {{ paciente.nombre }}
                    </div>
                    <div class="text-sm text-[#5D4A44]/60">
                      {{ paciente.email }}
                    </div>
                    <div v-if="paciente.frecuencia" class="text-xs text-[#D8AFA0] mt-1 flex items-center gap-1">
                      <span>📅</span>
                      <span class="font-medium">Frecuencia: {{ paciente.frecuencia }}</span>
                    </div>
                  </div>
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-[#D8AFA0]">→</span>
                  </div>
                </div>
              </button>
            </div>
            
            <!-- Mensaje cuando no hay resultados -->
            <div
              v-if="mostrarListaPacientes && busquedaPaciente && pacientesFiltrados.length === 0 && !cargandoPacientes"
              class="border border-[#D8AFA0]/30 rounded-lg bg-white p-4 text-center text-sm text-[#5D4A44]/60"
            >
              <span class="text-2xl mb-2 block">🔍</span>
              No se encontraron pacientes con "{{ busquedaPaciente }}"
            </div>

            <!-- Paciente seleccionado (desde búsqueda) -->
            <div
              v-if="formulario.paciente_id && pacienteSeleccionado && !props.pacientePreseleccionado"
              class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl flex-shrink-0">
                    ✓
                  </div>
                  <div class="flex-1">
                    <div class="text-xs text-green-600 font-medium mb-1">PACIENTE SELECCIONADO</div>
                    <div class="font-bold text-green-900 text-lg">
                      {{ pacienteSeleccionado.nombre }}
                    </div>
                    <div class="text-sm text-green-700">
                      {{ pacienteSeleccionado.email }}
                    </div>
                  
                    <!-- Frecuencia del paciente -->
                    <div v-if="pacienteSeleccionado.frecuencia" class="mt-2 flex items-center gap-2 text-sm">
                      <span>📅</span>
                      <span class="font-medium text-green-800">Frecuencia:</span>
                      <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded font-medium capitalize">
                        {{ pacienteSeleccionado.frecuencia }}
                      </span>
                    </div>
                  
                  <!-- Información de bono si existe -->
                  <div v-if="infoBono.tiene_bono" class="mt-3 p-3 bg-white rounded border border-green-300">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-lg">🎫</span>
                      <span class="font-semibold text-green-800">Bono Activo</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 mb-2">
                      <div class="bg-green-50 p-2 rounded">
                        <div class="text-xs text-green-600 mb-1">Tipo de Bono</div>
                        <div class="font-bold text-green-800 capitalize">
                          {{ infoBono.tipo_bono || 'N/A' }}
                        </div>
                      </div>
                      <div class="bg-green-50 p-2 rounded">
                        <div class="text-xs text-green-600 mb-1">Sesiones Restantes</div>
                        <div :class="[
                          'font-bold text-2xl',
                          infoBono.sesiones_restantes <= 1 ? 'text-red-600' : 
                          infoBono.sesiones_restantes <= 2 ? 'text-amber-600' : 'text-green-700'
                        ]">
                          {{ infoBono.sesiones_restantes }} / {{ infoBono.sesiones_totales || '?' }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Alerta si quedan pocas sesiones -->
                    <div v-if="infoBono.sesiones_restantes <= 2" class="mt-2 flex items-start gap-2 p-2 bg-amber-50 border border-amber-300 rounded text-xs">
                      <span>⚠️</span>
                      <span class="text-amber-800">
                        {{ infoBono.sesiones_restantes === 1 
                          ? '¡Última sesión del bono! Considere informar al paciente para renovar.' 
                          : 'Quedan pocas sesiones. Considere informar al paciente para renovar su bono.' }}
                      </span>
                    </div>
                    
                    <!-- Checkbox para descontar de bono -->
                    <div class="mt-3 flex items-center gap-2 p-2 bg-green-50 rounded">
                      <input
                        id="descontar-bono"
                        v-model="formulario.descontar_de_bono"
                        type="checkbox"
                        class="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                      />
                      <label for="descontar-bono" class="text-sm text-green-800 font-medium flex-1">
                        Descontar sesión de este bono al completar la cita
                      </label>
                    </div>
                  </div>
                  
                  <!-- Sin bono activo -->
                  <div v-else class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div class="flex items-center gap-2 text-sm text-blue-800">
                      <span class="text-lg">💳</span>
                      <div>
                        <div class="font-medium">Sin bono activo</div>
                        <div class="text-xs text-blue-600 mt-1">
                          Esta sesión se cobrará individualmente
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
                <button
                  type="button"
                  @click="deseleccionarPaciente"
                  class="text-green-600 hover:text-green-800 text-sm ml-2"
                >
                  Cambiar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Paso 2: Detalles de la Cita -->
        <div class="space-y-6 pt-4 border-t-2 border-[#D8AFA0]/30">
          <h3 class="text-lg font-['Lora'] text-[#5D4A44] font-semibold flex items-center gap-2">
            <span 
              v-if="!formularioValido"
              class="w-7 h-7 rounded-full bg-[#D8AFA0] text-white flex items-center justify-center text-sm font-bold"
            >
              {{ props.pacientePreseleccionado ? '1' : '2' }}
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
          <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-lg space-y-4">
            <h4 class="text-sm font-bold text-blue-800 flex items-center gap-2">
              <span>🗓️</span>
              Detalles de Programación
            </h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Fecha -->
            <div>
              <label class="block text-sm font-medium text-[#5D4A44] mb-2 flex items-center gap-2">
                <span>📅 Fecha</span>
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
                    'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white text-base cursor-pointer',
                    camposInvalidos.includes('fecha') ? 'border-red-500 border-2' : 'border-[#D8AFA0]/30'
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
                        ? 'bg-[#D8AFA0] text-white border-[#D8AFA0] font-semibold'
                        : 'bg-white text-[#5D4A44] border-[#D8AFA0]/30 hover:border-[#D8AFA0] hover:bg-[#D8AFA0]/10'
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
              <label class="block text-sm font-medium text-[#5D4A44] mb-2 flex items-center gap-2">
                <span>🕐 Hora de Inicio</span>
                <span class="text-red-500">*</span>
              </label>
              <div class="space-y-3">
                <!-- Grid de horas disponibles -->
                <div class="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-[#D8AFA0]/20">
                  <button
                    v-for="hora in horasDisponibles"
                    :key="hora"
                    type="button"
                    @click="formulario.hora_inicio = hora; calcularHoraFin()"
                    :class="[
                      'px-3 py-2.5 text-sm font-medium rounded-lg transition-all border-2',
                      formulario.hora_inicio === hora
                        ? 'bg-[#D8AFA0] text-white border-[#D8AFA0] shadow-md transform scale-105'
                        : 'bg-white text-[#5D4A44] border-gray-200 hover:border-[#D8AFA0] hover:bg-[#D8AFA0]/10 hover:shadow'
                    ]"
                  >
                    {{ hora }}
                  </button>
                </div>
                
                <!-- Input manual alternativo -->
                <details class="text-xs">
                  <summary class="cursor-pointer text-[#5D4A44]/60 hover:text-[#5D4A44] select-none flex items-center gap-1">
                    <span>⌨️</span>
                    <span>Ingresar hora manualmente</span>
                  </summary>
                  <div class="mt-2">
                    <input
                      v-model="formulario.hora_inicio"
                      type="time"
                      step="1800"
                      @change="calcularHoraFin"
                      :class="[
                        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white',
                        camposInvalidos.includes('hora_inicio') ? 'border-red-500 border-2' : 'border-[#D8AFA0]/30'
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
                    class="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors"
                  >
                    💡 Usar hora sugerida: {{ horaSugerida }}
                  </button>
                </div>
                <div v-if="cargandoSugerencia" class="text-xs text-[#5D4A44]/50 flex items-center gap-2">
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
              <label class="block text-sm font-medium text-[#5D4A44] mb-1">
                Duración <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formulario.duracion"
                required
                @change="calcularHoraFin"
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"
              >
                <option value="30">30 minutos</option>
                <option value="60" selected>60 minutos (1 hora)</option>
                <option value="90">90 minutos (1.5 horas)</option>
                <option value="120">120 minutos (2 horas)</option>
              </select>
            </div>

            <!-- Hora de Fin (automática) -->
            <div>
              <label class="block text-sm font-medium text-[#5D4A44] mb-1">
                Hora de Fin
              </label>
              <input
                :value="formulario.hora_fin"
                type="text"
                readonly
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg bg-gray-100 text-[#5D4A44]/60"
                placeholder="Se calculará automáticamente"
              />
            </div>
            </div>
          </div>

          <!-- Sección: Tipo de Sesión y Estado -->
          <div class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 rounded-lg space-y-4">
            <h4 class="text-sm font-bold text-purple-800 flex items-center gap-2">
              <span>💻</span>
              Tipo de Sesión y Estado
            </h4>

            <!-- Tipo de Sesión -->
            <div>
              <label class="block text-sm font-medium text-[#5D4A44] mb-2">
                Tipo de Sesión <span class="text-red-500">*</span>
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
                    'p-4 border-2 rounded-lg transition-all text-center',
                    formulario.tipo === tipo.valor
                      ? 'border-[#D8AFA0] bg-[#D8AFA0]/20 shadow-md'
                      : 'border-[#D8AFA0]/30 hover:border-[#D8AFA0]/50 bg-white'
                  ]"
                >
                  <div class="text-3xl mb-2">{{ tipo.icono }}</div>
                  <div class="font-medium text-[#5D4A44]">{{ tipo.nombre }}</div>
                </button>
              </div>
            </div>

            <!-- Estado -->
            <div>
              <label class="block text-sm font-medium text-[#5D4A44] mb-2">
                Estado <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  v-for="estado in estadosCita"
                  :key="estado.valor"
                  type="button"
                  @click="formulario.estado = estado.valor"
                  :class="[
                    'p-3 border-2 rounded-lg transition-all text-center',
                    formulario.estado === estado.valor
                      ? estado.claseActivo + ' shadow-md'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  ]"
                >
                  <div class="text-2xl mb-1">{{ estado.icono }}</div>
                  <div class="font-medium text-sm text-[#5D4A44]">{{ estado.nombre }}</div>
                </button>
              </div>
            </div>
          </div>

          <!-- Sección: Notas -->
          <div class="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg">
            <h4 class="text-sm font-bold text-amber-800 flex items-center gap-2 mb-3">
              <span>📝</span>
              Notas Adicionales
            </h4>
            
            <!-- Notas -->
            <div>
              <label class="block text-sm font-medium text-[#5D4A44] mb-1">
                Notas (opcional)
              </label>
              <textarea
                v-model="formulario.notas"
                rows="3"
                class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white resize-none"
                placeholder="Notas sobre la cita, recordatorios, etc."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Alertas de validación -->
        <div v-if="conflictoHorario" class="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <div class="flex items-start gap-3">
            <span class="text-2xl">⚠️</span>
            <div>
              <div class="font-semibold text-yellow-800 mb-1">
                Conflicto de Horario
              </div>
              <div class="text-sm text-yellow-700">
                Ya existe una cita en este horario. Verifica la disponibilidad.
              </div>
            </div>
          </div>
        </div>

        <!-- Mensajes de validación de campos requeridos -->
        <div v-if="camposInvalidos.length > 0 && !formularioValido" class="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <div class="flex items-start gap-3">
            <span class="text-2xl">❌</span>
            <div>
              <div class="font-semibold text-red-800 mb-2">
                Completa los campos obligatorios
              </div>
              <ul class="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li v-if="!formulario.paciente_id">Selecciona un paciente</li>
                <li v-if="!formulario.fecha">Selecciona una fecha</li>
                <li v-if="!formulario.hora_inicio">Selecciona la hora de inicio</li>
                <li v-if="!formulario.tipo">Selecciona el tipo de sesión</li>
                <li v-if="!formulario.estado">Selecciona el estado de la cita</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Resumen de la cita antes de guardar -->
        <div v-if="formularioValido && !conflictoHorario" class="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <div class="flex items-start gap-3">
            <span class="text-2xl">📋</span>
            <div class="flex-1">
              <div class="font-semibold text-blue-800 mb-3">
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
                <div v-if="formulario.descontar_de_bono" class="md:col-span-2">
                  <span class="text-blue-600 font-medium">🎫 Bono:</span>
                  <div class="text-blue-900">Se descontará 1 sesión del bono activo</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción (fijos al fondo) -->
        <div class="sticky bottom-0 bg-[#F9F7F3] pt-4 border-t border-[#D8AFA0]/30 flex gap-3 mt-6">
          <button
            type="button"
            @click="cerrarModal"
            class="flex-1 px-6 py-3 border-2 border-[#D8AFA0] text-[#5D4A44] rounded-lg hover:bg-[#D8AFA0]/10 transition-colors font-medium"
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
                  ? 'bg-[#D8AFA0] hover:bg-[#D8AFA0]/90 hover:shadow-lg cursor-pointer'
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
import { type PropType } from 'vue'
import { useCitas } from '~/composables/useCitas'

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

// Configuración
const horasDisponibles = [
  '08:00', '08:30', 
  '09:00', '09:30', 
  '10:00', '10:30',
  '11:00', '11:30', 
  '12:00', '12:30', 
  '13:00', '13:30',
  '14:00', '14:30', 
  '15:00', '15:30', 
  '16:00', '16:30',
  '17:00', '17:30', 
  '18:00', '18:30', 
  '19:00', '19:30',
  '20:00', '20:30',
  '21:00', '21:30',
  '22:00'
]

const tiposSesion = [
  { valor: 'presencial', nombre: 'Presencial', icono: '🏥' },
  { valor: 'online', nombre: 'Online', icono: '💻' },
  { valor: 'telefonica', nombre: 'Telefónica', icono: '📞' }
]

const estadosCita = [
  { valor: 'confirmada', nombre: 'Confirmada', icono: '✅', claseActivo: 'border-green-500 bg-green-50' },
  { valor: 'pendiente', nombre: 'Pendiente', icono: '⏳', claseActivo: 'border-yellow-500 bg-yellow-50' },
  { valor: 'cancelada', nombre: 'Cancelada', icono: '❌', claseActivo: 'border-red-500 bg-red-50' },
  { valor: 'completada', nombre: 'Completada', icono: '✓', claseActivo: 'border-blue-500 bg-blue-50' }
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
  // Solo validar que el paciente esté seleccionado
  const validoPaciente = formulario.value.paciente_id

  return validoPaciente &&
    formulario.value.fecha &&
    formulario.value.hora_inicio &&
    formulario.value.hora_fin &&
    formulario.value.tipo &&
    formulario.value.estado
})

// Métodos
async function cargarPacientes() {
  cargandoPacientes.value = true
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('No hay usuario autenticado')
      return
    }

    const { data, error } = await supabase
      .from('pacientes')
      .select(`
        id,
        nombre_completo,
        email,
        metadata
      `)
      .eq('terapeuta_id', user.id)
      .eq('activo', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al cargar pacientes:', error)
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
    
    console.log(`✅ ${pacientesReales.value.length} pacientes cargados:`, pacientesReales.value)
  } catch (error) {
    console.error('Error al cargar pacientes:', error)
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

function deseleccionarPaciente() {
  pacienteSeleccionado.value = null
  formulario.value.paciente_id = ''
  formulario.value.paciente_nombre = ''
  formulario.value.descontar_de_bono = false
  formulario.value.bono_id = undefined
  busquedaPaciente.value = ''
  fechaSugerida.value = null
  horaSugerida.value = null
  infoBono.value = {
    tiene_bono: false,
    sesiones_restantes: 0,
    sesiones_totales: 0,
    tipo_bono: '',
    bono_id: undefined
  }
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
    
    // Verificar conflictos de horario
    await verificarConflicto()
    
    if (conflictoHorario.value) {
      mostrarToastError('Conflicto de Horario', 'Ya existe una cita en este horario. Por favor, selecciona otro.')
      guardando.value = false
      return
    }
    
    // Preparar datos de la cita
    const datosCita = {
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
      const datosConBono = {
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
onMounted(() => {
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

.bg-\[\#F9F7F3\] {
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
