<template>
  <div class="min-h-screen bg-gray-50 p-6 space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-serif font-bold text-cafe">Gestión de Pacientes</h1>
          <p class="text-sm text-gray-600 mt-1">
            {{ totalPacientes }} pacientes registrados · {{ pacientesActivos }} activos
          </p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <!-- Buscador -->
          <div class="relative flex-1 min-w-[300px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              class="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300/20 transition-all duration-200"
            />
          </div>

          <!-- Botón nuevo paciente -->
          <button
            @click="mostrarModalNuevoPaciente = true"
            class="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-all duration-200 text-sm font-medium whitespace-nowrap flex items-center gap-2 shadow-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Nuevo Paciente</span>
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
        <select
          v-model="filtroEstado"
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/20 transition-all duration-200"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>

        <select
          v-model="filtroTerapeuta"
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300/20 transition-all duration-200"
        >
          <option value="">Todos los terapeutas</option>
          <option v-for="terapeuta in terapeutas" :key="terapeuta.id" :value="terapeuta.id">
            {{ terapeuta.nombre }}
          </option>
        </select>

        <button
          v-if="busqueda || filtroEstado || filtroTerapeuta"
          @click="limpiarFiltros"
          class="px-3 py-2 text-sm text-gray-600 hover:text-cafe transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-purple-600/10 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-cafe">{{ totalPacientes }}</div>
            <div class="text-xs text-gray-600">Total pacientes</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-700">{{ pacientesActivos }}</div>
            <div class="text-xs text-green-600/80">Activos</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-purple-100 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-700">{{ bonosActivos }}</div>
            <div class="text-xs text-purple-600/80">Bonos activos</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-orange-100 rounded-lg">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-orange-600">{{ bonosPorAgotar }}</div>
            <div class="text-xs text-orange-600/80">Bonos por agotar</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de pacientes -->
    <div v-if="cargando" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
      <div class="text-center text-gray-400 animate-pulse">
        <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <p>Cargando pacientes...</p>
      </div>
    </div>

    <div v-else-if="pacientesFiltrados.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
      <div class="text-center text-gray-400">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <h3 class="text-xl font-semibold text-cafe mb-2">
          No se encontraron pacientes
        </h3>
        <p class="text-gray-600 mb-4">
          {{ busqueda ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer paciente' }}
        </p>
      </div>
    </div>

    <!-- Lista en formato tabla/lista -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Paciente
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contacto
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Terapeuta
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Estado Bono
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Sesiones
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="paciente in pacientesFiltrados"
              :key="paciente.id"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
              @click="verDetallePaciente(paciente)"
            >
              <!-- Paciente -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cafe flex items-center justify-center flex-shrink-0">
                    <span class="text-white text-sm font-semibold">
                      {{ obtenerIniciales(paciente.nombre_completo) }}
                    </span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-cafe truncate">{{ paciente.nombre_completo }}</p>
                    <p class="text-sm text-gray-500 truncate">{{ paciente.area_de_acompanamiento || 'Sin área' }}</p>
                  </div>
                </div>
              </td>

              <!-- Contacto -->
              <td class="px-6 py-4">
                <div class="space-y-1">
                  <p class="text-sm text-gray-700 flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span class="truncate">{{ paciente.email }}</span>
                  </p>
                  <p v-if="paciente.telefono" class="text-sm text-gray-700 flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    {{ paciente.telefono }}
                  </p>
                </div>
              </td>

              <!-- Terapeuta -->
              <td class="px-6 py-4">
                <span v-if="paciente.terapeuta_nombre" class="text-sm text-gray-700">
                  {{ paciente.terapeuta_nombre }}
                </span>
                <span v-else class="text-sm text-gray-400 italic">Sin asignar</span>
              </td>

              <!-- Estado Bono -->
              <td class="px-6 py-4">
                <div v-if="paciente.bono_activo" class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold" :class="{
                      'text-red-600': paciente.bono_activo.sesiones_restantes === 0,
                      'text-orange-600': paciente.bono_activo.sesiones_restantes === 1,
                      'text-amber-600': paciente.bono_activo.sesiones_restantes === 2,
                      'text-verde': paciente.bono_activo.sesiones_restantes > 2
                    }">
                      {{ paciente.bono_activo.sesiones_restantes }}/{{ paciente.bono_activo.sesiones_totales }}
                    </span>
                  </div>
                  <!-- Barra de progreso -->
                  <div class="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full transition-all duration-300 rounded-full"
                      :class="{
                        'bg-red-500': paciente.bono_activo.sesiones_restantes === 0,
                        'bg-orange-500': paciente.bono_activo.sesiones_restantes === 1,
                        'bg-amber-500': paciente.bono_activo.sesiones_restantes === 2,
                        'bg-verde': paciente.bono_activo.sesiones_restantes > 2
                      }"
                      :style="{ width: `${(paciente.bono_activo.sesiones_restantes / paciente.bono_activo.sesiones_totales) * 100}%` }"
                    ></div>
                  </div>
                  <!-- Alerta si queda 1 sesión -->
                  <div v-if="paciente.bono_activo.sesiones_restantes <= 1" class="flex items-center gap-1 text-xs font-medium text-orange-600">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    {{ paciente.bono_activo.sesiones_restantes === 0 ? 'Agotado' : 'Renovar' }}
                  </div>
                </div>
                <span v-else class="text-sm text-gray-400 italic">Sin bono</span>
              </td>

              <!-- Sesiones -->
              <td class="px-6 py-4">
                <div class="text-sm">
                  <p class="font-medium text-cafe">{{ paciente.total_citas || 0 }}</p>
                  <p class="text-xs text-gray-500">{{ paciente.sesiones_completadas || 0 }} completadas</p>
                </div>
              </td>

              <!-- Estado -->
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="getEstadoClasses(paciente.estado)"
                >
                  {{ getEstadoLabel(paciente.estado) }}
                </span>
              </td>

              <!-- Acciones -->
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click.stop="enviarWhatsApp(paciente)"
                    class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    title="WhatsApp"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </button>
                  <button
                    @click.stop="verDetallePaciente(paciente)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Ver detalles"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button
                    @click.stop="confirmarEliminarPaciente(paciente)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Eliminar paciente"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Detalle del Paciente -->
    <div
      v-if="mostrarModalDetalle && pacienteSeleccionado"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="cerrarModalDetalle"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header del Modal -->
        <div class="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-cafe flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {{ obtenerIniciales(pacienteSeleccionado.nombre_completo) }}
            </div>
            <div>
              <h2 class="text-2xl font-serif font-bold text-cafe">{{ pacienteSeleccionado.nombre_completo }}</h2>
              <p class="text-gray-600 text-sm">{{ modoEdicion ? 'Editando información del paciente' : 'Información del paciente' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="!modoEdicion"
              @click="activarEdicion"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-purple-600"
              title="Editar paciente"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button
              @click="cerrarModalDetalle"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Contenido del Modal -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          
          <!-- Formulario de Edición -->
          <div v-if="modoEdicion" class="space-y-6">
            <!-- Alerta de modo edición -->
            <div class="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="flex-1">
                <p class="text-sm font-semibold text-blue-800">Modo de edición activado</p>
                <p class="text-xs text-blue-700 mt-0.5">Modifica los campos necesarios y guarda los cambios</p>
              </div>
            </div>

            <!-- Información Personal -->
            <div>
              <h3 class="text-base font-semibold text-cafe mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Información Personal
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-700 mb-2 font-medium uppercase tracking-wide">
                    Nombre Completo <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="datosEdicion.nombre_completo"
                    type="text"
                    required
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
                    placeholder="Nombre completo del paciente"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-700 mb-2 font-medium uppercase tracking-wide">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="datosEdicion.email"
                    type="email"
                    required
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-700 mb-2 font-medium uppercase tracking-wide">
                    Teléfono
                  </label>
                  <input
                    v-model="datosEdicion.telefono"
                    type="tel"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
                    placeholder="+34 600 000 000"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-700 mb-2 font-medium uppercase tracking-wide">
                    Terapeuta Asignado
                  </label>
                  <select
                    v-model="datosEdicion.terapeuta_id"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
                  >
                    <option :value="null">Sin asignar</option>
                    <option v-for="terapeuta in terapeutas" :key="terapeuta.id" :value="terapeuta.id">
                      {{ terapeuta.nombre }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-700 mb-2 font-medium uppercase tracking-wide">
                    Área de Acompañamiento
                  </label>
                  <input
                    v-model="datosEdicion.area_de_acompanamiento"
                    type="text"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
                    placeholder="Ej: Ansiedad, Depresión, etc."
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-700 mb-2 font-medium uppercase tracking-wide">
                    Frecuencia
                  </label>
                  <select
                    v-model="datosEdicion.frecuencia"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="semanal">Semanal</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="mensual">Mensual</option>
                    <option value="ocasional">Ocasional</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Estado -->
            <div>
              <h3 class="text-base font-semibold text-cafe mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Estado del Paciente
              </h3>
              <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  v-model="datosEdicion.activo"
                  type="checkbox"
                  id="activo-edicion"
                  class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-300"
                />
                <label for="activo-edicion" class="text-sm font-medium text-cafe cursor-pointer">
                  Paciente activo
                </label>
                <span class="text-xs text-gray-500 ml-auto">
                  {{ datosEdicion.activo ? 'El paciente está activo' : 'El paciente está inactivo' }}
                </span>
              </div>
            </div>

            <!-- Botones de acción del formulario -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                @click="cancelarEdicion"
                :disabled="guardandoEdicion"
                class="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                @click="guardarEdicion"
                :disabled="guardandoEdicion"
                class="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors font-medium flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <svg v-if="guardandoEdicion" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>{{ guardandoEdicion ? 'Guardando...' : 'Guardar Cambios' }}</span>
              </button>
            </div>
          </div>

          <!-- Vista Normal (Solo lectura) -->
          <div v-else>
          <!-- Estado y Acciones Rápidas -->
          <div class="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200">
            <div class="flex flex-wrap items-center gap-3">
              <span
                class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                :class="getEstadoClasses(pacienteSeleccionado.estado)"
              >
                <svg class="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="6"/>
                </svg>
                {{ getEstadoLabel(pacienteSeleccionado.estado) }}
              </span>
              <span v-if="pacienteSeleccionado.bono_activo" class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                </svg>
                Bono: {{ pacienteSeleccionado.bono_activo.sesiones_restantes }}/{{ pacienteSeleccionado.bono_activo.sesiones_totales }}
              </span>
            </div>
            <div class="flex gap-2">
              <button
                v-if="pacienteSeleccionado.telefono"
                @click="enviarWhatsApp(pacienteSeleccionado)"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2 shadow-sm"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp</span>
              </button>
              <button
                @click="() => { cerrarModalDetalle(); router.push(`/coordinadora/pacientes/${pacienteSeleccionado.id}`); }"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors text-sm flex items-center gap-2 shadow-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span>Historial Completo</span>
              </button>
            </div>
          </div>

          <!-- Información Personal -->
          <div>
            <h3 class="text-base font-semibold text-cafe mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Información Personal
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Nombre Completo</p>
                <p class="text-sm text-cafe font-semibold">{{ pacienteSeleccionado.nombre_completo || 'No especificado' }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Email</p>
                <p class="text-sm text-cafe break-all">{{ pacienteSeleccionado.email || 'No especificado' }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Teléfono</p>
                <p class="text-sm text-cafe">{{ pacienteSeleccionado.telefono || 'No especificado' }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Terapeuta Asignado</p>
                <p class="text-sm text-cafe font-semibold">{{ pacienteSeleccionado.terapeuta_nombre || 'Sin asignar' }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Área de Acompañamiento</p>
                <p class="text-sm text-cafe">{{ pacienteSeleccionado.area_de_acompanamiento || 'No especificado' }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Frecuencia</p>
                <p class="text-sm text-cafe capitalize">{{ pacienteSeleccionado.frecuencia || 'No especificada' }}</p>
              </div>
            </div>
          </div>

          <!-- Información de Sesiones -->
          <div>
            <h3 class="text-base font-semibold text-cafe mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Estadísticas de Sesiones
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200 text-center">
                <p class="text-3xl font-bold text-blue-700">{{ pacienteSeleccionado.total_citas || 0 }}</p>
                <p class="text-xs text-blue-600 mt-1.5 font-medium">Total Citas</p>
              </div>
              <div class="p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200 text-center">
                <p class="text-3xl font-bold text-green-700">{{ pacienteSeleccionado.sesiones_completadas || 0 }}</p>
                <p class="text-xs text-green-600 mt-1.5 font-medium">Completadas</p>
              </div>
              <div class="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-200 text-center">
                <p class="text-3xl font-bold text-purple-700">
                  {{ pacienteSeleccionado.bono_activo ? pacienteSeleccionado.bono_activo.sesiones_restantes : 0 }}
                </p>
                <p class="text-xs text-purple-600 mt-1.5 font-medium">Restantes</p>
              </div>
              <div class="p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg border border-orange-200 text-center">
                <p class="text-3xl font-bold text-orange-700">
                  {{ pacienteSeleccionado.bono_activo ? pacienteSeleccionado.bono_activo.sesiones_totales : 0 }}
                </p>
                <p class="text-xs text-orange-600 mt-1.5 font-medium">Total Bono</p>
              </div>
            </div>
          </div>

          <!-- Estado del Bono Actual -->
          <div v-if="pacienteSeleccionado.bono_activo">
            <h3 class="text-base font-semibold text-cafe mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
              </svg>
              Bono Activo
            </h3>
            <div class="p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Progreso del Bono</p>
                  <p class="text-2xl font-bold text-cafe">
                    {{ pacienteSeleccionado.bono_activo.sesiones_restantes }} / {{ pacienteSeleccionado.bono_activo.sesiones_totales }}
                  </p>
                  <p class="text-sm text-gray-600 mt-0.5">sesiones disponibles</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Consumido</p>
                  <p class="text-3xl font-bold text-purple-600">
                    {{ Math.round(((pacienteSeleccionado.bono_activo.sesiones_totales - pacienteSeleccionado.bono_activo.sesiones_restantes) / pacienteSeleccionado.bono_activo.sesiones_totales) * 100) }}%
                  </p>
                </div>
              </div>
              
              <!-- Barra de progreso -->
              <div class="mb-5">
                <div class="flex justify-between text-xs text-gray-600 mb-2">
                  <span class="font-medium">{{ pacienteSeleccionado.bono_activo.sesiones_totales - pacienteSeleccionado.bono_activo.sesiones_restantes }} usadas</span>
                  <span class="font-medium">{{ pacienteSeleccionado.bono_activo.sesiones_restantes }} restantes</span>
                </div>
                <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full transition-all duration-500 rounded-full"
                    :class="{
                      'bg-red-500': pacienteSeleccionado.bono_activo.sesiones_restantes === 0,
                      'bg-orange-500': pacienteSeleccionado.bono_activo.sesiones_restantes === 1,
                      'bg-amber-500': pacienteSeleccionado.bono_activo.sesiones_restantes === 2,
                      'bg-verde': pacienteSeleccionado.bono_activo.sesiones_restantes > 2
                    }"
                    :style="{ width: `${((pacienteSeleccionado.bono_activo.sesiones_totales - pacienteSeleccionado.bono_activo.sesiones_restantes) / pacienteSeleccionado.bono_activo.sesiones_totales) * 100}%` }"
                  ></div>
                </div>
              </div>

              <!-- Alerta si está por agotarse -->
              <div v-if="pacienteSeleccionado.bono_activo.sesiones_restantes <= 1" class="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg mb-5">
                <svg class="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-orange-800">
                    {{ pacienteSeleccionado.bono_activo.sesiones_restantes === 0 ? 'Bono agotado' : 'Solo queda 1 sesión' }}
                  </p>
                  <p class="text-xs text-orange-700 mt-0.5">Se recomienda renovar el bono para continuar las sesiones</p>
                </div>
              </div>

              <!-- Información adicional del bono -->
              <div class="grid grid-cols-2 gap-4 pt-5 border-t border-gray-200">
                <div>
                  <p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Fecha de Compra</p>
                  <p class="text-sm font-semibold text-cafe">{{ formatearFechaCorta(pacienteSeleccionado.bono_activo.created_at) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Estado</p>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 capitalize">
                    {{ pacienteSeleccionado.bono_activo.estado }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-center">
              <svg class="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
              </svg>
              <p class="text-gray-600 font-medium mb-1">Sin bono activo</p>
              <p class="text-sm text-gray-500">El paciente no tiene un bono de sesiones activo</p>
            </div>
          </div>

          <!-- Metadata adicional (si existe) -->
          <div v-if="pacienteSeleccionado.metadata">
            <h3 class="text-base font-semibold text-cafe mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Información Adicional
            </h3>
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <pre class="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto font-mono">{{ JSON.stringify(pacienteSeleccionado.metadata, null, 2) }}</pre>
            </div>
          </div>

          <!-- Fechas del Sistema -->
          <div>
            <h3 class="text-base font-semibold text-cafe mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Fechas del Sistema
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Fecha de Registro</p>
                <p class="text-sm text-cafe font-semibold">{{ formatearFechaCorta(pacienteSeleccionado.created_at) }}</p>
              </div>
              <div v-if="pacienteSeleccionado.updated_at" class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Última Actualización</p>
                <p class="text-sm text-cafe font-semibold">{{ formatearFechaCorta(pacienteSeleccionado.updated_at) }}</p>
              </div>
            </div>
          </div>

          <!-- ID del Paciente (útil para debugging) -->
          <div class="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
              </svg>
              <p class="text-xs text-blue-700 font-medium uppercase tracking-wide">ID del Paciente</p>
            </div>
            <code class="mt-2 block px-3 py-2 bg-white border border-blue-200 rounded text-xs text-blue-800 font-mono break-all">{{ pacienteSeleccionado.id }}</code>
          </div>
          </div>
          <!-- Fin Vista Normal -->
        </div>

        <!-- Footer del Modal -->
        <div class="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-3">
          <button
            @click="cerrarModalDetalle"
            class="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cerrar
          </button>
          <button
            v-if="!modoEdicion"
            @click="() => { cerrarModalDetalle(); router.push(`/coordinadora/pacientes/${pacienteSeleccionado.id}`); }"
            class="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-600/90 transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            <span>Ver Historial Completo</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Paciente -->
    <div
      v-if="mostrarModalNuevoPaciente"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="cerrarModal"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header del Modal -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-serif font-bold text-cafe">Crear Nuevo Paciente</h2>
          <button
            @click="cerrarModal"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="crearPaciente" class="p-6 space-y-6">
          <!-- Información Personal -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-cafe uppercase tracking-wide">Información Personal</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-cafe mb-1">
                  Nombre Completo <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="nuevoPaciente.nombre_completo"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
                  placeholder="Ej: Juan Pérez García"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-cafe mb-1">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="nuevoPaciente.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-cafe mb-1">
                  Teléfono <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="nuevoPaciente.telefono"
                  type="tel"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
                  placeholder="+34 612 345 678"
                />
              </div>
            </div>
          </div>

          <!-- Asignación de Terapeuta -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-cafe uppercase tracking-wide">Asignación</h3>
            
            <div>
              <label class="block text-sm font-medium text-cafe mb-1">
                Terapeuta Asignado
              </label>
              <select
                v-model="nuevoPaciente.terapeuta_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
              >
                <option :value="null">Sin asignar</option>
                <option v-for="terapeuta in terapeutas" :key="terapeuta.id" :value="terapeuta.id">
                  {{ terapeuta.nombre }}
                </option>
              </select>
            </div>
          </div>

          <!-- Migración de Bono (Opcional) -->
          <div class="space-y-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div class="flex items-start gap-2">
              <svg class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-amber-800 uppercase tracking-wide">Migración de Datos (Opcional)</h3>
                <p class="text-xs text-amber-700 mt-1">Si el paciente viene con un bono existente, completa esta información</p>
              </div>
              <input
                v-model="nuevoPaciente.tiene_bono_existente"
                type="checkbox"
                id="tiene_bono"
                class="w-4 h-4 text-purple-600 border-amber-300 rounded focus:ring-purple-300 mt-0.5"
              />
            </div>

            <div v-if="nuevoPaciente.tiene_bono_existente" class="space-y-4 pt-2">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-cafe mb-1">
                    Tipo de Bono <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="nuevoPaciente.bono.tipo"
                    @change="actualizarSesionesTotales"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="semanal">Semanal (4 sesiones/mes)</option>
                    <option value="quincenal">Quincenal (2 sesiones/mes)</option>
                    <option value="mensual">Mensual (1 sesión/mes)</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-cafe mb-1">
                    Sesiones Totales
                  </label>
                  <input
                    :value="nuevoPaciente.bono.sesiones_totales"
                    type="number"
                    disabled
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Selecciona tipo de bono"
                  />
                  <p class="text-xs text-gray-500 mt-1">Se asigna automáticamente</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-cafe mb-1">
                    Sesiones ya Consumidas <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model.number="nuevoPaciente.bono.sesiones_consumidas"
                    type="number"
                    min="0"
                    :max="nuevoPaciente.bono.sesiones_totales || 0"
                    required
                    :disabled="!nuevoPaciente.bono.tipo"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Ej: 2"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Sesiones restantes: {{ (nuevoPaciente.bono.sesiones_totales || 0) - (nuevoPaciente.bono.sesiones_consumidas || 0) }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-cafe mb-1">
                    Fecha del Último Pago
                  </label>
                  <input
                    v-model="nuevoPaciente.bono.fecha_compra"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-cafe mb-1">
                    Monto Pagado (€)
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                    <input
                      v-model.number="nuevoPaciente.bono.monto_total"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-cafe mb-1">
                    Estado del Pago
                  </label>
                  <select
                    v-model="nuevoPaciente.bono.estado_pago"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all"
                  >
                    <option value="pagado">Pagado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="parcial">Pago Parcial</option>
                  </select>
                </div>
              </div>

              <!-- Resumen visual del bono -->
              <div class="bg-white rounded-lg p-3 border border-amber-200">
                <p class="text-xs font-medium text-gray-600 mb-2">Resumen del Bono:</p>
                <div class="flex items-center gap-3">
                  <div class="flex-1">
                    <div class="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{{ nuevoPaciente.bono.sesiones_consumidas || 0 }} consumidas</span>
                      <span>{{ (nuevoPaciente.bono.sesiones_totales || 0) - (nuevoPaciente.bono.sesiones_consumidas || 0) }} restantes</span>
                    </div>
                    <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-purple-600 transition-all duration-300"
                        :style="{ 
                          width: `${nuevoPaciente.bono.sesiones_totales > 0 ? (nuevoPaciente.bono.sesiones_consumidas / nuevoPaciente.bono.sesiones_totales) * 100 : 0}%` 
                        }"
                      ></div>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-bold text-purple-600">{{ (nuevoPaciente.bono.sesiones_totales || 0) - (nuevoPaciente.bono.sesiones_consumidas || 0) }}</p>
                    <p class="text-xs text-gray-500">de {{ nuevoPaciente.bono.sesiones_totales || 0 }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Información Adicional -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-cafe uppercase tracking-wide">Información Adicional</h3>
            
            <div>
              <label class="block text-sm font-medium text-cafe mb-1">
                Notas
              </label>
              <textarea
                v-model="nuevoPaciente.notas"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300/20 focus:border-purple-600 transition-all resize-none"
                placeholder="Notas adicionales sobre el paciente..."
              ></textarea>
            </div>

            <div class="flex items-center gap-2">
              <input
                v-model="nuevoPaciente.activo"
                type="checkbox"
                id="activo"
                class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-300"
              />
              <label for="activo" class="text-sm font-medium text-cafe cursor-pointer">
                Paciente Activo
              </label>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="cerrarModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="guardando"
              class="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-600/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="guardando" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ guardando ? 'Creando...' : 'Crear Paciente' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const router = useRouter()

definePageMeta({
  layout: 'coordinadora',
  middleware: ['auth', 'role-coordinadora']
})

// Estado
const cargando = ref(true)
const pacientes = ref([])
const terapeutas = ref([])
const busqueda = ref('')
const filtroEstado = ref('')
const filtroTerapeuta = ref('')
const mostrarModalNuevoPaciente = ref(false)
const guardando = ref(false)
const nuevoPaciente = ref({
  nombre_completo: '',
  email: '',
  telefono: '+34 ',
  terapeuta_id: null,
  notas: '',
  activo: true,
  tiene_bono_existente: false,
  bono: {
    tipo: '',
    sesiones_totales: 0,
    sesiones_consumidas: 0,
    fecha_compra: null,
    monto_total: 0,
    estado_pago: 'pagado'
  }
})

// Computed
const totalPacientes = computed(() => pacientes.value.length)
const pacientesActivos = computed(() => 
  pacientes.value.filter(p => p.estado === 'activo' || p.activo).length
)

const bonosActivos = computed(() => 
  pacientes.value.filter(p => p.bono_activo && p.bono_activo.sesiones_restantes > 0).length
)

const bonosPorAgotar = computed(() => 
  pacientes.value.filter(p => p.bono_activo && p.bono_activo.sesiones_restantes <= 1).length
)

const pacientesFiltrados = computed(() => {
  let resultado = [...pacientes.value]

  if (busqueda.value.trim()) {
    const query = busqueda.value.toLowerCase()
    resultado = resultado.filter(p =>
      p.nombre_completo?.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query) ||
      p.telefono?.includes(query)
    )
  }

  if (filtroEstado.value === 'activo') {
    resultado = resultado.filter(p => p.estado === 'activo' || p.activo)
  } else if (filtroEstado.value === 'inactivo') {
    resultado = resultado.filter(p => p.estado === 'inactivo' || !p.activo)
  }

  if (filtroTerapeuta.value) {
    resultado = resultado.filter(p => p.terapeuta_id === filtroTerapeuta.value)
  }

  return resultado
})

// Funciones
const obtenerIniciales = (nombre) => {
  if (!nombre) return 'PA'
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const getEstadoClasses = (estado) => {
  const estadoNormalizado = estado?.toLowerCase() || 'inactivo'
  if (estadoNormalizado === 'activo') return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-700'
}

const getEstadoLabel = (estado) => {
  const estadoNormalizado = estado?.toLowerCase() || 'inactivo'
  if (estadoNormalizado === 'activo') return 'Activo'
  return 'Inactivo'
}

const limpiarFiltros = () => {
  busqueda.value = ''
  filtroEstado.value = ''
  filtroTerapeuta.value = ''
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'No especificada'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatearFechaCorta = (fecha) => {
  if (!fecha) return 'No especificada'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const pacienteSeleccionado = ref(null)
const mostrarModalDetalle = ref(false)
const modoEdicion = ref(false)
const datosEdicion = ref({})
const guardandoEdicion = ref(false)

const verDetallePaciente = (paciente) => {
  pacienteSeleccionado.value = paciente
  mostrarModalDetalle.value = true
  modoEdicion.value = false
}

const cerrarModalDetalle = () => {
  mostrarModalDetalle.value = false
  modoEdicion.value = false
  setTimeout(() => {
    pacienteSeleccionado.value = null
  }, 300)
}

const activarEdicion = () => {
  datosEdicion.value = {
    nombre_completo: pacienteSeleccionado.value.nombre_completo || '',
    email: pacienteSeleccionado.value.email || '',
    telefono: pacienteSeleccionado.value.telefono || '',
    terapeuta_id: pacienteSeleccionado.value.terapeuta_id || null,
    area_de_acompanamiento: pacienteSeleccionado.value.area_de_acompanamiento || '',
    frecuencia: pacienteSeleccionado.value.frecuencia || '',
    activo: pacienteSeleccionado.value.activo ?? true
  }
  modoEdicion.value = true
}

const cancelarEdicion = () => {
  modoEdicion.value = false
  datosEdicion.value = {}
}

const guardarEdicion = async () => {
  if (!datosEdicion.value.nombre_completo || !datosEdicion.value.email) {
    alert('El nombre y el email son obligatorios')
    return
  }

  guardandoEdicion.value = true

  try {
    const { error } = await supabase
      .from('pacientes')
      .update({
        nombre_completo: datosEdicion.value.nombre_completo.trim(),
        email: datosEdicion.value.email.trim().toLowerCase(),
        telefono: datosEdicion.value.telefono?.trim() || null,
        terapeuta_id: datosEdicion.value.terapeuta_id || null,
        area_de_acompanamiento: datosEdicion.value.area_de_acompanamiento || null,
        frecuencia: datosEdicion.value.frecuencia || null,
        activo: datosEdicion.value.activo,
        updated_at: new Date().toISOString()
      })
      .eq('id', pacienteSeleccionado.value.id)

    if (error) throw error

    alert('✅ Paciente actualizado correctamente')
    
    // Actualizar el paciente seleccionado con los nuevos datos
    Object.assign(pacienteSeleccionado.value, datosEdicion.value)
    
    // Recargar la lista de pacientes
    await cargarPacientes()
    
    // Salir del modo edición
    modoEdicion.value = false
  } catch (error) {
    console.error('Error al actualizar paciente:', error)
    alert(`❌ Error al actualizar: ${error.message}`)
  } finally {
    guardandoEdicion.value = false
  }
}

const irANuevoPaciente = () => {
  router.push('/coordinadora/pacientes/nuevo')
}

const cerrarModal = () => {
  mostrarModalNuevoPaciente.value = false
  // Resetear formulario
  nuevoPaciente.value = {
    nombre_completo: '',
    email: '',
    telefono: '+34 ',
    terapeuta_id: null,
    notas: '',
    activo: true,
    tiene_bono_existente: false,
    bono: {
      tipo: '',
      sesiones_totales: 0,
      sesiones_consumidas: 0,
      fecha_compra: null,
      monto_total: 0,
      estado_pago: 'pagado'
    }
  }
}

const actualizarSesionesTotales = () => {
  const tipo = nuevoPaciente.value.bono.tipo
  
  // Asignar sesiones según el tipo de bono
  switch (tipo) {
    case 'semanal':
      nuevoPaciente.value.bono.sesiones_totales = 4
      break
    case 'quincenal':
      nuevoPaciente.value.bono.sesiones_totales = 2
      break
    case 'mensual':
      nuevoPaciente.value.bono.sesiones_totales = 1
      break
    default:
      nuevoPaciente.value.bono.sesiones_totales = 0
  }
  
  // Resetear sesiones consumidas si excede el nuevo total
  if (nuevoPaciente.value.bono.sesiones_consumidas > nuevoPaciente.value.bono.sesiones_totales) {
    nuevoPaciente.value.bono.sesiones_consumidas = 0
  }
}

const crearPaciente = async () => {
  guardando.value = true
  
  try {
    // Validar sesiones si tiene bono
    if (nuevoPaciente.value.tiene_bono_existente) {
      if (nuevoPaciente.value.bono.sesiones_consumidas > nuevoPaciente.value.bono.sesiones_totales) {
        alert('❌ Las sesiones consumidas no pueden ser mayores a las sesiones totales')
        guardando.value = false
        return
      }
      if (!nuevoPaciente.value.bono.tipo) {
        alert('❌ Debe seleccionar el tipo de bono')
        guardando.value = false
        return
      }
    }

    // Preparar datos del paciente
    const pacienteData = {
      nombre_completo: nuevoPaciente.value.nombre_completo.trim(),
      email: nuevoPaciente.value.email.trim().toLowerCase(),
      telefono: nuevoPaciente.value.telefono.trim(),
      terapeuta_id: nuevoPaciente.value.terapeuta_id || null,
      notas: nuevoPaciente.value.notas.trim() || null,
      activo: nuevoPaciente.value.activo,
      created_at: new Date().toISOString()
    }

    // 1. Crear el paciente
    const { data: pacienteCreado, error: errorPaciente } = await supabase
      .from('pacientes')
      .insert([pacienteData])
      .select()
      .single()

    if (errorPaciente) throw errorPaciente

    // 2. Si tiene bono existente, crear el bono
    if (nuevoPaciente.value.tiene_bono_existente) {
      const sesionesRestantes = nuevoPaciente.value.bono.sesiones_totales - nuevoPaciente.value.bono.sesiones_consumidas
      
      const bonoData = {
        paciente_id: pacienteCreado.id,
        tipo_bono: nuevoPaciente.value.bono.tipo,
        sesiones_totales: nuevoPaciente.value.bono.sesiones_totales,
        sesiones_restantes: sesionesRestantes,
        estado: sesionesRestantes > 0 ? 'activo' : 'agotado',
        monto_total: nuevoPaciente.value.bono.monto_total || 0,
        estado_pago: nuevoPaciente.value.bono.estado_pago,
        fecha_pago: nuevoPaciente.value.bono.fecha_compra || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: errorBono } = await supabase
        .from('bonos')
        .insert([bonoData])

      if (errorBono) {
        console.error('Error al crear bono:', errorBono)
        alert(`⚠️ Paciente creado, pero hubo un error al crear el bono: ${errorBono.message}`)
      }
    }

    // Mostrar mensaje de éxito
    const mensaje = nuevoPaciente.value.tiene_bono_existente
      ? `✅ Paciente y bono creados exitosamente: ${pacienteCreado.nombre_completo}\n🎫 Bono: ${nuevoPaciente.value.bono.sesiones_totales - nuevoPaciente.value.bono.sesiones_consumidas} sesiones restantes`
      : `✅ Paciente creado exitosamente: ${pacienteCreado.nombre_completo}`
    
    alert(mensaje)
    
    // Cerrar modal
    cerrarModal()
    
    // Recargar lista de pacientes
    await cargarPacientes()
  } catch (error) {
    console.error('Error al crear paciente:', error)
    alert(`❌ Error al crear el paciente: ${error.message}`)
  } finally {
    guardando.value = false
  }
}

const enviarWhatsApp = (paciente) => {
  if (!paciente.telefono) {
    alert('Este paciente no tiene teléfono registrado')
    return
  }
  const numero = paciente.telefono.replace(/\D/g, '')
  const mensaje = encodeURIComponent(`Hola ${paciente.nombre_completo}, te escribo desde el consultorio de Psicóloga Karem.`)
  window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank')
}

const confirmarEliminarPaciente = (paciente) => {
  const confirmacion = confirm(
    `⚠️ ¿Estás seguro de que deseas eliminar a ${paciente.nombre_completo}?\n\n` +
    `Esta acción eliminará:\n` +
    `• El paciente\n` +
    `• Todos sus bonos\n` +
    `• Todas sus citas\n` +
    `• Todo su historial\n\n` +
    `Esta acción NO se puede deshacer.`
  )
  
  if (confirmacion) {
    eliminarPaciente(paciente)
  }
}

const eliminarPaciente = async (paciente) => {
  try {
    // 1. Eliminar bonos del paciente
    const { error: errorBonos } = await supabase
      .from('bonos')
      .delete()
      .eq('paciente_id', paciente.id)
    
    if (errorBonos) {
      console.error('Error al eliminar bonos:', errorBonos)
      // Continuamos aunque falle, para intentar eliminar el paciente
    }
    
    // 2. Eliminar citas del paciente
    const { error: errorCitas } = await supabase
      .from('citas')
      .delete()
      .eq('paciente_id', paciente.id)
    
    if (errorCitas) {
      console.error('Error al eliminar citas:', errorCitas)
      // Continuamos aunque falle
    }
    
    // 3. Eliminar el paciente
    const { error: errorPaciente } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', paciente.id)
    
    if (errorPaciente) throw errorPaciente
    
    // Mostrar mensaje de éxito
    alert(`✅ Paciente ${paciente.nombre_completo} eliminado exitosamente`)
    
    // Recargar lista
    await cargarPacientes()
  } catch (error) {
    console.error('Error al eliminar paciente:', error)
    alert(`❌ Error al eliminar el paciente: ${error.message}`)
  }
}

// Cargar datos
const cargarTerapeutas = async () => {
  try {
    const { data, error } = await supabase
      .from('terapeutas')
      .select('id, nombre_completo')
      .order('nombre_completo', { ascending: true })
    
    if (error) throw error
    terapeutas.value = data?.map(t => ({ id: t.id, nombre: t.nombre_completo })) || []
  } catch (error) {
    console.error('Error al cargar terapeutas:', error)
    terapeutas.value = []
  }
}

const cargarPacientes = async () => {
  cargando.value = true
  
  try {
    const { data: pacientesData, error } = await supabase
      .from('pacientes')
      .select('*')
      .order('nombre_completo', { ascending: true })
    
    if (error) throw error
    
    if (!pacientesData) {
      pacientes.value = []
      return
    }
    
    // Cargar información adicional
    const terapeutaIds = [...new Set(pacientesData.map(p => p.terapeuta_id).filter(Boolean))]
    const terapeutasMap = new Map()
    
    if (terapeutaIds.length > 0) {
      const { data: terapeutasData } = await supabase
        .from('terapeutas')
        .select('id, nombre_completo')
        .in('id', terapeutaIds)
      
      terapeutasData?.forEach(t => terapeutasMap.set(t.id, t.nombre_completo))
    }
    
    // Procesar pacientes
    const pacientesConDatos = await Promise.all(
      pacientesData.map(async (paciente) => {
        // Cargar bonos activos
        const { data: bonoData } = await supabase
          .from('bonos')
          .select('id, sesiones_totales, sesiones_restantes, created_at, estado')
          .eq('paciente_id', paciente.id)
          .in('estado', ['activo', 'pendiente'])
          .gt('sesiones_restantes', 0)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        // Contar citas
        const { count: totalCitas } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .eq('paciente_id', paciente.id)
        
        const { count: completadas } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')
        
        return {
          ...paciente,
          terapeuta_nombre: terapeutasMap.get(paciente.terapeuta_id) || null,
          estado: paciente.activo ? 'activo' : 'inactivo',
          total_citas: totalCitas || 0,
          sesiones_completadas: completadas || 0,
          bono_activo: bonoData ? {
            ...bonoData,
            fecha_compra: bonoData.created_at
          } : null
        }
      })
    )
    
    pacientes.value = pacientesConDatos
  } catch (error) {
    console.error('Error al cargar pacientes:', error)
    pacientes.value = []
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarTerapeutas()
  cargarPacientes()
})
</script>
