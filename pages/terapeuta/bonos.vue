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

      <!-- Quick stats -->
      <div v-if="activeTab === 'bonos' || activeTab === 'resumen'" class="bg-white border border-gray-100 rounded-lg p-3 mb-4">
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500"></span>
            <span class="text-gray-600">Activos:</span>
            <span class="font-semibold text-gray-900">{{ estadisticasBonos.activos }}</span>
          </div>
          <span class="text-gray-200">|</span>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span class="text-gray-600">Pendientes:</span>
            <span class="font-semibold text-gray-900">{{ estadisticasBonos.pendientes }}</span>
          </div>
          <span class="text-gray-200">|</span>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-gray-400"></span>
            <span class="text-gray-600">Completados:</span>
            <span class="font-semibold text-gray-900">{{ estadisticasBonos.completados }}</span>
          </div>
          <div class="ml-auto flex items-center gap-2 pl-4 border-l border-gray-200">
            <span class="text-gray-600">Por cobrar:</span>
            <span class="font-bold text-green-600">{{ formatearPrecio(estadisticasBonos.montoPendiente) }}€</span>
          </div>
        </div>
      </div>
    </header>

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

          <!-- Lista de pacientes -->
          <div class="divide-y divide-gray-50">
            <div
              v-for="paciente in tipoBono.pacientes"
              :key="paciente.bono_id"
              class="px-5 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer flex items-center justify-between"
              @click="irABonoPaciente({ paciente_id: paciente.paciente_id })"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-semibold">
                  {{ getIniciales(paciente.nombre) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ paciente.nombre }}</p>
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <span>{{ paciente.sesiones_usadas }}/{{ paciente.sesiones_totales }} sesiones</span>
                    <span class="text-gray-300">|</span>
                    <span :class="paciente.estado === 'activo' ? 'text-green-600' : 'text-gray-500'">
                      {{ getEstadoTexto(paciente.estado) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <!-- Barra de progreso -->
                <div class="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="paciente.estado === 'activo' ? 'bg-purple-500' : 'bg-gray-400'"
                    :style="{ width: `${(paciente.sesiones_usadas / paciente.sesiones_totales) * 100}%` }"
                  ></div>
                </div>
                <!-- Monto y pago -->
                <div class="text-right min-w-[80px]">
                  <p class="text-sm font-medium text-gray-900">{{ paciente.monto }}€</p>
                  <p class="text-xs" :class="paciente.pagado ? 'text-green-600' : 'text-amber-600'">
                    {{ paciente.pagado ? 'Pagado' : 'Pendiente' }}
                  </p>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- Resumen del tipo -->
          <div class="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-sm">
            <div class="flex items-center gap-4">
              <span class="text-gray-500">
                Precio promedio: <span class="font-medium text-gray-700">{{ formatearPrecio(tipoBono.precioPromedio) }}€</span>
              </span>
              <span class="text-gray-300">|</span>
              <span class="text-gray-500">
                Sesiones promedio: <span class="font-medium text-gray-700">{{ tipoBono.sesionesPromedio }}</span>
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500">Por cobrar:</span>
              <span class="font-semibold text-amber-600">{{ formatearPrecio(tipoBono.montoPendiente) }}€</span>
            </div>
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
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="pendiente">Pendientes</option>
          <option value="completado">Completados</option>
          <option value="vencido">Vencidos</option>
        </select>

        <button
          v-if="busquedaBono || filtroEstado"
          @click="busquedaBono = ''; filtroEstado = ''"
          class="h-10 px-3 text-sm text-gray-500 hover:text-gray-700"
        >
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
  CheckCircleIcon
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
const activeTab = ref<'resumen' | 'plantillas' | 'bonos'>('resumen')

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

// Computed - Agrupacion por tipo de bono
interface TipoBono {
  tipo: string
  pacientes: Array<{
    bono_id: string
    paciente_id: string
    nombre: string
    sesiones_usadas: number
    sesiones_totales: number
    estado: string
    monto: number
    pagado: boolean
  }>
  activos: number
  completados: number
  montoTotal: number
  montoPendiente: number
  precioPromedio: number
  sesionesPromedio: number
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
    grupo.pacientes.push({
      bono_id: bono.id,
      paciente_id: bono.paciente_id,
      nombre: bono.paciente_nombre || 'Desconocido',
      sesiones_usadas: bono.sesiones_totales - bono.sesiones_restantes,
      sesiones_totales: bono.sesiones_totales,
      estado: bono.estado,
      monto: bono.monto_total || 0,
      pagado: bono.pagado
    })

    grupo.montoTotal += bono.monto_total || 0
    if (!bono.pagado) {
      grupo.montoPendiente += bono.monto_total || 0
    }
    if (bono.estado === 'activo') grupo.activos++
    if (bono.estado === 'completado') grupo.completados++
  }

  // Calcular promedios
  for (const grupo of agrupados.values()) {
    if (grupo.pacientes.length > 0) {
      grupo.precioPromedio = grupo.montoTotal / grupo.pacientes.length
      const totalSesiones = grupo.pacientes.reduce((sum, p) => sum + p.sesiones_totales, 0)
      grupo.sesionesPromedio = Math.round(totalSesiones / grupo.pacientes.length)
    }
  }

  // Ordenar por cantidad de pacientes (descendente)
  return Array.from(agrupados.values()).sort((a, b) => b.pacientes.length - a.pacientes.length)
})

// Computed
const bonosActivos = computed(() => todosBonos.value.filter(b => b.estado === 'activo').length)

const estadisticasBonos = computed(() => {
  const activos = todosBonos.value.filter(b => b.estado === 'activo').length
  const pendientes = todosBonos.value.filter(b => b.estado === 'pendiente').length
  const completados = todosBonos.value.filter(b => b.estado === 'completado').length
  const montoPendiente = todosBonos.value
    .filter(b => !b.pagado)
    .reduce((sum, b) => sum + (b.monto_total || 0), 0)

  return { activos, pendientes, completados, montoPendiente }
})

const bonosFiltrados = computed(() => {
  let resultado = todosBonos.value

  if (busquedaBono.value) {
    const busqueda = busquedaBono.value.toLowerCase()
    resultado = resultado.filter(b =>
      b.paciente_nombre?.toLowerCase().includes(busqueda)
    )
  }

  if (filtroEstado.value) {
    resultado = resultado.filter(b => b.estado === filtroEstado.value)
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
  router.push(`/terapeuta/pacientes/${bono.paciente_id}/bonos`)
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
