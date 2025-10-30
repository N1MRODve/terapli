<template>
  <div class="min-h-screen bg-base-bg">
    <!-- Encabezado -->
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-cafe mb-2">
        Gestión de Sesiones
      </h1>
      <p class="text-terracota">
        Visualiza y gestiona todas tus sesiones con información financiera
      </p>
    </div>

    <!-- Cards de Resumen Financiero -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Sesiones Pendientes -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">⏳</span>
          </div>
          <span class="text-sm font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
            Pendientes
          </span>
        </div>
        <p class="text-sm text-cafe/60 mb-1">Sesiones pendientes</p>
        <p class="text-3xl font-bold text-cafe mb-2">{{ resumenFinanciero.pendientes }}</p>
        <div class="pt-3 border-t border-gray-100">
          <p class="text-xs text-cafe/50 mb-1">Monto estimado</p>
          <p class="text-xl font-semibold text-yellow-600">
            {{ formatearPrecio(resumenFinanciero.montoPendiente) }}€
          </p>
        </div>
      </div>

      <!-- Sesiones Confirmadas -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">✓</span>
          </div>
          <span class="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
            Confirmadas
          </span>
        </div>
        <p class="text-sm text-cafe/60 mb-1">Sesiones confirmadas</p>
        <p class="text-3xl font-bold text-cafe mb-2">{{ resumenFinanciero.confirmadas }}</p>
        <div class="pt-3 border-t border-gray-100">
          <p class="text-xs text-cafe/50 mb-1">Monto asegurado</p>
          <p class="text-xl font-semibold text-green-600">
            {{ formatearPrecio(resumenFinanciero.montoConfirmado) }}€
          </p>
        </div>
      </div>

      <!-- Sesiones Completadas -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">✔️</span>
          </div>
          <span class="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Completadas
          </span>
        </div>
        <p class="text-sm text-cafe/60 mb-1">Sesiones realizadas</p>
        <p class="text-3xl font-bold text-cafe mb-2">{{ resumenFinanciero.completadas }}</p>
        <div class="pt-3 border-t border-gray-100">
          <p class="text-xs text-cafe/50 mb-1">Monto por cobrar</p>
          <p class="text-xl font-semibold text-blue-600">
            {{ formatearPrecio(resumenFinanciero.montoCompletado) }}€
          </p>
        </div>
      </div>

      <!-- Sesiones Canceladas -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">✕</span>
          </div>
          <span class="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
            Canceladas
          </span>
        </div>
        <p class="text-sm text-cafe/60 mb-1">Sesiones canceladas</p>
        <p class="text-3xl font-bold text-cafe mb-2">{{ resumenFinanciero.canceladas }}</p>
        <div class="pt-3 border-t border-gray-100">
          <p class="text-xs text-cafe/50 mb-1">Monto perdido</p>
          <p class="text-xl font-semibold text-red-600">
            {{ formatearPrecio(resumenFinanciero.montoCancelado) }}€
          </p>
        </div>
      </div>
    </div>

    <!-- Sección de Pagos Confirmados - Rediseño Profesional -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <!-- Header con resumen financiero integrado -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-6 py-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
              <span class="text-2xl">�</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-cafe">Pagos Confirmados</h2>
              <p class="text-sm text-cafe/60 mt-0.5">Bonos procesados por coordinación</p>
            </div>
          </div>
          
          <!-- Resumen financiero compacto -->
          <div class="flex items-center gap-6">
            <div class="text-right">
              <p class="text-xs text-cafe/50 uppercase font-semibold tracking-wide">Total Confirmado</p>
              <p class="text-3xl font-bold text-green-700">{{ formatearPrecio(totalConfirmadoTerapeuta) }}€</p>
              <p class="text-xs text-cafe/60 mt-0.5">{{ bonosPagados.length }} {{ bonosPagados.length === 1 ? 'bono' : 'bonos' }}</p>
            </div>
            <button
              @click="mostrarPagosConfirmados = !mostrarPagosConfirmados"
              class="w-10 h-10 rounded-lg bg-white/80 hover:bg-white border border-green-200 flex items-center justify-center text-green-700 hover:text-green-800 transition-all duration-200"
              :class="{ 'rotate-180': mostrarPagosConfirmados }"
            >
              <span class="text-lg">▼</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de bonos expandible -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-[2000px]"
        leave-from-class="opacity-100 max-h-[2000px]"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-show="mostrarPagosConfirmados">
          <!-- Estado vacío -->
          <div v-if="bonosPagados.length === 0" class="text-center py-12 px-6">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-cafe/5 flex items-center justify-center">
              <span class="text-4xl">📭</span>
            </div>
            <p class="text-cafe/60 font-medium">No hay pagos confirmados aún</p>
            <p class="text-sm text-cafe/40 mt-1">Los bonos pagados aparecerán aquí</p>
          </div>

          <!-- Listado de pagos -->
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="(pago, index) in bonosPagados"
              :key="pago.bono_id"
              class="group hover:bg-green-50/30 transition-colors duration-150"
            >
              <!-- Fila compacta (siempre visible) -->
              <div
                @click="toggleDetallePago(pago.bono_id)"
                class="px-6 py-4 cursor-pointer flex items-center gap-4"
              >
                <!-- Indicador visual de estado -->
                <div class="flex-shrink-0 w-1 h-12 rounded-full bg-green-500"></div>

                <!-- Avatar y nombre del paciente -->
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {{ obtenerIniciales(pago.paciente_nombre) }}
                </div>

                <div class="flex-1 min-w-0 grid grid-cols-5 gap-4 items-center">
                  <!-- Nombre del paciente -->
                  <div class="col-span-2">
                    <p class="font-semibold text-cafe truncate">{{ pago.paciente_nombre }}</p>
                    <p class="text-xs text-cafe/50 truncate">{{ pago.tipo_bono || 'Bono Estándar' }}</p>
                  </div>

                  <!-- Sesiones -->
                  <div class="text-center">
                    <p class="text-sm font-semibold text-cafe">{{ pago.sesiones_usadas }}/{{ pago.bono_sesiones_totales }}</p>
                    <p class="text-xs text-cafe/50">sesiones</p>
                  </div>

                  <!-- Tu parte -->
                  <div class="text-right">
                    <p class="text-lg font-bold text-green-700">{{ formatearPrecio(pago.monto_total_terapeuta) }}€</p>
                    <p class="text-xs text-cafe/50">tu parte (70%)</p>
                  </div>

                  <!-- Fecha y método -->
                  <div class="text-right">
                    <p class="text-sm font-medium text-cafe flex items-center justify-end gap-1.5">
                      <span class="text-cafe/40">📅</span>
                      {{ formatearFecha(pago.bono_fecha_pago) }}
                    </p>
                    <p class="text-xs text-cafe/50 capitalize flex items-center justify-end gap-1.5 mt-0.5">
                      <span>💳</span>
                      {{ pago.bono_metodo_pago || 'No especificado' }}
                    </p>
                  </div>
                </div>

                <!-- Icono expandir -->
                <div class="flex-shrink-0 ml-2">
                  <span
                    class="block w-6 h-6 rounded-full bg-cafe/5 group-hover:bg-cafe/10 flex items-center justify-center text-cafe/40 text-xs transition-all duration-200"
                    :class="{ 'rotate-180': pagoExpandido === pago.bono_id }"
                  >
                    ▼
                  </span>
                </div>
              </div>

              <!-- Panel de detalles expandible -->
              <transition
                enter-active-class="transition-all duration-300 ease-out"
                leave-active-class="transition-all duration-200 ease-in"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-96"
                leave-from-class="opacity-100 max-h-96"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-show="pagoExpandido === pago.bono_id" class="bg-gradient-to-b from-green-50/50 to-transparent">
                  <div class="px-6 pb-6 pt-2 ml-16">
                    <div class="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
                      <div class="grid grid-cols-3 gap-6">
                        <!-- Columna 1: Información del paciente -->
                        <div class="space-y-3">
                          <p class="text-xs text-cafe/40 uppercase font-bold tracking-wider mb-3">📋 Paciente</p>
                          <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                              <span class="text-cafe/60">Nombre:</span>
                              <span class="font-medium text-cafe">{{ pago.paciente_nombre }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                              <span class="text-cafe/60">Email:</span>
                              <span class="font-medium text-cafe text-xs truncate max-w-[150px]" :title="pago.paciente_email">{{ pago.paciente_email }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Columna 2: Detalles del bono -->
                        <div class="space-y-3">
                          <p class="text-xs text-cafe/40 uppercase font-bold tracking-wider mb-3">🧾 Detalles del Bono</p>
                          <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                              <span class="text-cafe/60">Tipo:</span>
                              <span class="font-medium text-cafe">{{ pago.tipo_bono || 'Estándar' }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                              <span class="text-cafe/60">Sesiones totales:</span>
                              <span class="font-medium text-cafe">{{ pago.bono_sesiones_totales }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                              <span class="text-cafe/60">Sesiones usadas:</span>
                              <span class="font-medium text-cafe">{{ pago.sesiones_usadas }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                              <span class="text-cafe/60">Sesiones restantes:</span>
                              <span class="font-semibold text-green-700">{{ pago.bono_sesiones_restantes }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Columna 3: Información financiera -->
                        <div class="space-y-3">
                          <p class="text-xs text-cafe/40 uppercase font-bold tracking-wider mb-3">💰 Financiero</p>
                          <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                              <span class="text-cafe/60">Monto total:</span>
                              <span class="font-bold text-cafe">{{ formatearPrecio(pago.bono_monto_total) }}€</span>
                            </div>
                            <div class="flex justify-between text-sm bg-green-50 px-2 py-1.5 rounded-lg">
                              <span class="text-cafe/60 font-medium">Tu parte (70%):</span>
                              <span class="font-bold text-green-700">{{ formatearPrecio(pago.monto_total_terapeuta) }}€</span>
                            </div>
                            <div class="flex justify-between text-sm">
                              <span class="text-cafe/60">Por sesión:</span>
                              <span class="font-medium text-cafe/80">{{ formatearPrecio(pago.precio_por_sesion) }}€</span>
                            </div>
                            <div class="pt-2 border-t border-green-100 mt-3">
                              <div class="flex justify-between text-xs text-cafe/50 mb-1">
                                <span>Método de pago:</span>
                                <span class="font-medium capitalize">{{ pago.bono_metodo_pago || 'No especificado' }}</span>
                              </div>
                              <div class="flex justify-between text-xs text-cafe/50">
                                <span>Fecha de pago:</span>
                                <span class="font-medium">{{ formatearFecha(pago.bono_fecha_pago) }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Búsqueda -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-cafe mb-2">
            Buscar paciente
          </label>
          <div class="relative">
            <input
              v-model="filtros.busqueda"
              type="text"
              placeholder="Nombre del paciente..."
              class="w-full px-4 py-2 pl-10 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20"
            />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-cafe/50">
              🔍
            </span>
          </div>
        </div>

        <!-- Filtro por Estado -->
        <div>
          <label class="block text-sm font-medium text-cafe mb-2">
            Estado
          </label>
          <select
            v-model="filtros.estado"
            class="w-full px-4 py-2 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20 text-cafe"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="realizada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        <!-- Filtro por Mes -->
        <div>
          <label class="block text-sm font-medium text-cafe mb-2">
            Período
          </label>
          <select
            v-model="filtros.periodo"
            class="w-full px-4 py-2 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20 text-cafe"
          >
            <option value="mes-actual">Mes actual</option>
            <option value="mes-anterior">Mes anterior</option>
            <option value="trimestre">Último trimestre</option>
            <option value="todos">Todos</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="cargando" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-terracota mb-4"></div>
        <p class="text-cafe/60">Cargando sesiones...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
      <div class="flex items-start gap-3">
        <span class="text-2xl">⚠️</span>
        <div>
          <h3 class="font-semibold text-red-800 mb-1">Error al cargar sesiones</h3>
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Lista de Sesiones -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Header de la tabla -->
      <div class="bg-gray-50 border-b border-gray-100 px-6 py-4">
        <h3 class="font-semibold text-cafe">
          Listado de Sesiones
          <span class="text-sm font-normal text-cafe/60 ml-2">
            ({{ sesionesFiltradas.length }} sesiones)
          </span>
        </h3>
      </div>

      <!-- Empty State -->
      <div v-if="sesionesFiltradas.length === 0" class="p-12 text-center">
        <span class="text-6xl mb-4 block">📅</span>
        <h3 class="text-lg font-semibold text-cafe mb-2">
          No hay sesiones para mostrar
        </h3>
        <p class="text-cafe/60 mb-6">
          {{ filtros.busqueda || filtros.estado 
            ? 'Intenta ajustar los filtros de búsqueda' 
            : 'No tienes sesiones programadas aún' }}
        </p>
      </div>

      <!-- Tabla de Sesiones -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Hora
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Paciente
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Modalidad
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Bono
              </th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Monto
              </th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-cafe/70 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr
              v-for="sesion in sesionesFiltradas"
              :key="sesion.id"
              class="hover:bg-gray-50 transition-colors duration-150"
            >
              <!-- Fecha -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-cafe">
                  {{ formatearFecha(sesion.fecha_cita) }}
                </div>
                <div class="text-xs text-cafe/50">
                  {{ formatearDiaSemana(sesion.fecha_cita) }}
                </div>
              </td>

              <!-- Hora -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-cafe">
                  {{ formatearHora(sesion.hora_inicio) }}
                </div>
                <div class="text-xs text-cafe/50">
                  {{ sesion.duracion_minutos || 50 }} min
                </div>
              </td>

              <!-- Paciente -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-terracota/20 text-terracota flex items-center justify-center font-semibold text-sm flex-shrink-0"
                  >
                    {{ obtenerIniciales(sesion.paciente?.nombre_completo || 'NN') }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-cafe">
                      {{ sesion.paciente?.nombre_completo || 'Sin nombre' }}
                    </div>
                    <div v-if="sesion.paciente?.email" class="text-xs text-cafe/50">
                      {{ sesion.paciente.email }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Modalidad -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                    sesion.modalidad === 'online' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-purple-50 text-purple-700'
                  ]"
                >
                  <span>{{ sesion.modalidad === 'online' ? '💻' : '🏢' }}</span>
                  {{ sesion.modalidad === 'online' ? 'Online' : 'Presencial' }}
                </span>
              </td>

              <!-- Estado -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
                    obtenerClaseEstado(sesion.estado)
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="obtenerColorPuntoEstado(sesion.estado)"></span>
                  {{ obtenerTextoEstado(sesion.estado) }}
                </span>
              </td>

              <!-- Bono -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="sesion.bono" class="text-xs space-y-1">
                  <div class="flex items-center gap-1 text-green-600">
                    <span>✓</span>
                    <span>Con bono</span>
                  </div>
                  <div class="text-cafe/50">
                    {{ sesion.bono.sesiones_restantes || 0 }}/{{ sesion.bono.sesiones_totales || 0 }} restantes
                  </div>
                  <!-- Estado de pago del bono -->
                  <div v-if="sesion.bono.pagado" class="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    <span>💳</span>
                    <span class="font-semibold">Pagado</span>
                  </div>
                  <div v-else class="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full animate-pulse">
                    <span>⏳</span>
                    <span class="font-semibold">Pend. pago</span>
                  </div>
                </div>
                <div v-else class="text-xs text-cafe/50">
                  Sin bono
                </div>
              </td>

              <!-- Monto -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-sm font-semibold text-cafe">
                  {{ formatearPrecio(sesion.precio_estimado || PRECIO_SESION_DEFAULT) }}€
                </div>
                <div class="text-xs text-cafe/50">
                  Tu parte: {{ formatearPrecio((sesion.precio_estimado || PRECIO_SESION_DEFAULT) * 0.7) }}€
                </div>
              </td>

              <!-- Acciones -->
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <button
                  @click="verDetalles(sesion)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-terracota hover:bg-terracota/10 rounded-lg transition-colors duration-200"
                >
                  <span>👁️</span>
                  Ver detalles
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Detalles -->
    <ModalDetallesCita
      :is-open="mostrarModalDetalles"
      :cita-id="citaSeleccionada"
      @close="cerrarModalDetalles"
      @actualizado="cargarSesiones"
      @eliminado="cargarSesiones"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ModalDetallesCita from '~/components/ModalDetallesCita.vue'

definePageMeta({
  layout: 'terapeuta',
  middleware: 'auth'
})

// Constantes
const PRECIO_SESION_DEFAULT = 50

// Composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Estado
const cargando = ref(true)
const error = ref<string | null>(null)
const sesiones = ref<any[]>([])
const bonosPagadosDirectos = ref<any[]>([]) // Bonos pagados cargados directamente
const filtros = ref({
  busqueda: '',
  estado: '',
  periodo: 'todos'
})
const mostrarModalDetalles = ref(false)
const citaSeleccionada = ref<string | null>(null)
const mostrarPagosConfirmados = ref(true) // Mostrar por defecto la sección de pagos
const pagoExpandido = ref<string | null>(null) // ID del pago que está expandido

// Computed - Filtrar sesiones
const sesionesFiltradas = computed(() => {
  let resultado = [...sesiones.value]

  // Filtrar por búsqueda
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(s => 
      s.paciente?.nombre_completo?.toLowerCase().includes(busqueda)
    )
  }

  // Filtrar por estado
  if (filtros.value.estado) {
    resultado = resultado.filter(s => s.estado === filtros.value.estado)
  }

  // Filtrar por período
  const ahora = new Date()
  if (filtros.value.periodo === 'mes-actual') {
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0)
    resultado = resultado.filter(s => {
      const fecha = new Date(s.fecha_cita)
      return fecha >= inicioMes && fecha <= finMes
    })
  } else if (filtros.value.periodo === 'mes-anterior') {
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth(), 0)
    resultado = resultado.filter(s => {
      const fecha = new Date(s.fecha_cita)
      return fecha >= inicioMes && fecha <= finMes
    })
  } else if (filtros.value.periodo === 'trimestre') {
    const hace3Meses = new Date(ahora)
    hace3Meses.setMonth(ahora.getMonth() - 3)
    resultado = resultado.filter(s => {
      const fecha = new Date(s.fecha_cita)
      return fecha >= hace3Meses
    })
  }

  // Ordenar por fecha (más recientes primero)
  resultado.sort((a, b) => {
    const fechaA = new Date(a.fecha_cita + 'T' + a.hora_inicio)
    const fechaB = new Date(b.fecha_cita + 'T' + b.hora_inicio)
    return fechaB.getTime() - fechaA.getTime()
  })

  return resultado
})

// Computed - Resumen financiero
const resumenFinanciero = computed(() => {
  const resultado = {
    pendientes: 0,
    confirmadas: 0,
    completadas: 0,
    canceladas: 0,
    montoPendiente: 0,
    montoConfirmado: 0,
    montoCompletado: 0,
    montoCancelado: 0
  }

  sesionesFiltradas.value.forEach(sesion => {
    // Usar el monto calculado para la terapeuta desde la vista
    const montoTerapeuta = sesion.monto_terapeuta || (sesion.precio_estimado || PRECIO_SESION_DEFAULT) * 0.7

    switch (sesion.estado) {
      case 'pendiente':
        resultado.pendientes++
        // Si tiene bono pagado, suma a confirmado, si no a pendiente
        if (sesion.esta_pagado || sesion.bono?.pagado) {
          resultado.montoConfirmado += montoTerapeuta
        } else {
          resultado.montoPendiente += montoTerapeuta
        }
        break
      case 'confirmada':
        resultado.confirmadas++
        // Si tiene bono pagado, es ingreso confirmado
        if (sesion.esta_pagado || sesion.bono?.pagado) {
          resultado.montoConfirmado += montoTerapeuta
        } else {
          resultado.montoPendiente += montoTerapeuta
        }
        break
      case 'realizada':
      case 'completada':
        resultado.completadas++
        // Las completadas con bono pagado van a confirmado, si no a por cobrar
        if (sesion.esta_pagado || sesion.bono?.pagado) {
          resultado.montoConfirmado += montoTerapeuta
        } else {
          resultado.montoCompletado += montoTerapeuta
        }
        break
      case 'cancelada':
        resultado.canceladas++
        resultado.montoCancelado += montoTerapeuta
        break
    }
  })

  return resultado
})

// Computed - Bonos pagados (usa datos cargados directamente de la tabla bonos)
const bonosPagados = computed(() => {
  return bonosPagadosDirectos.value.map(bono => {
    // Calcular sesiones usadas
    const sesionesUsadas = (bono.sesiones_totales || 0) - (bono.sesiones_restantes || 0)
    
    // Calcular precio por sesión y monto para terapeuta
    const precioSesion = bono.sesiones_totales > 0 ? bono.monto_total / bono.sesiones_totales : 0
    const montoTerapeuta = bono.monto_total * 0.7
    
    return {
      bono_id: bono.id,
      paciente_id: bono.paciente_id,
      paciente_nombre: bono.paciente_nombre,
      paciente_email: bono.paciente_email,
      bono_sesiones_totales: bono.sesiones_totales,
      bono_sesiones_restantes: bono.sesiones_restantes,
      bono_monto_total: bono.monto_total,
      bono_fecha_pago: bono.fecha_pago,
      bono_metodo_pago: bono.metodo_pago,
      tipo_bono: bono.tipo_bono || 'Estándar',
      sesiones_usadas: sesionesUsadas,
      precio_por_sesion: precioSesion,
      monto_total_terapeuta: montoTerapeuta
    }
  }).sort((a, b) => {
    // Ordenar por fecha de pago (más reciente primero)
    const fechaA = new Date(a.bono_fecha_pago || 0)
    const fechaB = new Date(b.bono_fecha_pago || 0)
    return fechaB.getTime() - fechaA.getTime()
  })
})

// Computed - Total confirmado para la terapeuta
const totalConfirmadoTerapeuta = computed(() => {
  return bonosPagados.value.reduce((total, bono) => {
    return total + (bono.monto_total_terapeuta || 0)
  }, 0)
})

// Cargar sesiones
const cargarSesiones = async () => {
  try {
    cargando.value = true
    error.value = null

    // Esperar a que el usuario esté disponible
    let intentos = 0
    while (!user.value && intentos < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      intentos++
    }

    if (!user.value) {
      throw new Error('Usuario no autenticado')
    }

    console.log('👤 Usuario verificado:', user.value.id)

    // Obtener el terapeuta usando el email del usuario
    const { data: terapeuta, error: errorTerapeuta } = await supabase
      .from('terapeutas')
      .select('id')
      .eq('email', user.value.email)
      .single()

    if (errorTerapeuta) {
      console.error('❌ Error al buscar terapeuta:', errorTerapeuta)
      throw errorTerapeuta
    }
    
    if (!terapeuta) {
      throw new Error('No se encontró el terapeuta asociado a este usuario')
    }
    
    console.log('🔍 Terapeuta encontrado:', terapeuta)

    // Cargar todas las sesiones usando la vista con información de pago
    const { data, error: errorSesiones } = await supabase
      .from('vista_sesiones_psicologa')
      .select('*')
      .eq('terapeuta_id', terapeuta.id)
      .order('fecha', { ascending: false })

    if (errorSesiones) {
      console.error('❌ Error al cargar sesiones:', errorSesiones)
      throw errorSesiones
    }
    
    console.log('📅 Sesiones cargadas:', data?.length || 0, data)

    // Mapear las sesiones con la información de pago
    sesiones.value = (data || []).map(sesion => {
      console.log('🔍 Sesión individual:', {
        id: sesion.id,
        bono_id: sesion.bono_id,
        bono_pagado: sesion.bono_pagado,
        esta_pagado: sesion.esta_pagado,
        categoria_financiera: sesion.categoria_financiera,
        precio_sesion: sesion.precio_sesion,
        monto_terapeuta: sesion.monto_terapeuta,
        paciente: sesion.paciente_nombre
      })
      
      return {
        ...sesion,
        // Mantener compatibilidad con código existente
        precio_estimado: sesion.precio_sesion || PRECIO_SESION_DEFAULT,
        paciente: {
          id: sesion.paciente_id,
          nombre_completo: sesion.paciente_nombre,
          email: sesion.paciente_email,
          telefono: sesion.paciente_telefono
        },
        bono: sesion.bono_id ? {
          id: sesion.bono_id,
          sesiones_totales: sesion.bono_sesiones_totales,
          sesiones_restantes: sesion.bono_sesiones_restantes,
          monto_total: sesion.bono_monto_total,
          pagado: sesion.bono_pagado,
          fecha_pago: sesion.bono_fecha_pago,
          metodo_pago: sesion.bono_metodo_pago
        } : null
      }
    })
    
    console.log('✅ Sesiones procesadas:', sesiones.value.length)

  } catch (err: any) {
    console.error('Error al cargar sesiones:', err)
    error.value = err.message || 'Error desconocido al cargar las sesiones'
  } finally {
    cargando.value = false
  }
}

// Cargar bonos pagados directamente
const cargarBonosPagados = async () => {
  try {
    // Esperar a que el usuario esté disponible
    if (!user.value) {
      console.log('Usuario no disponible aún para cargar bonos')
      return
    }

    console.log('🔍 Cargando bonos pagados...')

    // Obtener el terapeuta usando el email del usuario
    const { data: terapeuta, error: errorTerapeuta } = await supabase
      .from('terapeutas')
      .select('id')
      .eq('email', user.value.email)
      .single()

    if (errorTerapeuta || !terapeuta) {
      console.error('❌ Error al buscar terapeuta:', errorTerapeuta)
      return
    }

    console.log('👩‍⚕️ Terapeuta encontrado:', terapeuta.id)

    // Primero obtener los IDs de los pacientes de este terapeuta
    const { data: pacientes, error: errorPacientes } = await supabase
      .from('pacientes')
      .select('id')
      .eq('terapeuta_id', terapeuta.id)

    if (errorPacientes || !pacientes || pacientes.length === 0) {
      console.log('No hay pacientes asignados a este terapeuta')
      bonosPagadosDirectos.value = []
      return
    }

    const pacienteIds = pacientes.map(p => p.id)
    console.log('📋 Pacientes encontrados:', pacienteIds.length)

    // Cargar bonos pagados de estos pacientes
    const { data: bonos, error: errorBonos } = await supabase
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
        pagado,
        paciente:pacientes!bonos_paciente_id_fkey (
          nombre_completo,
          email
        )
      `)
      .eq('pagado', true)
      .in('paciente_id', pacienteIds)
      .order('fecha_pago', { ascending: false })

    if (errorBonos) {
      console.error('❌ Error al cargar bonos pagados:', errorBonos)
      return
    }

    console.log('💳 Bonos pagados encontrados:', bonos?.length || 0)

    // Transformar los datos
    bonosPagadosDirectos.value = (bonos || []).map(bono => ({
      ...bono,
      paciente_nombre: bono.paciente?.nombre_completo,
      paciente_email: bono.paciente?.email
    }))

    console.log('✅ Bonos pagados cargados:', bonosPagadosDirectos.value.length)

  } catch (err: any) {
    console.error('Error al cargar bonos pagados:', err)
  }
}

// Ver detalles de sesión
const verDetalles = (sesion: any) => {
  citaSeleccionada.value = sesion.id
  mostrarModalDetalles.value = true
}

// Cerrar modal de detalles
const cerrarModalDetalles = () => {
  mostrarModalDetalles.value = false
  citaSeleccionada.value = null
}

// Toggle detalles de pago
const toggleDetallePago = (bonoId: string) => {
  if (pagoExpandido.value === bonoId) {
    pagoExpandido.value = null
  } else {
    pagoExpandido.value = bonoId
  }
}

// Formatear precio
const formatearPrecio = (precio: number) => {
  return precio.toFixed(2)
}

// Formatear fecha
const formatearFecha = (fecha: string) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Formatear fecha con hora
const formatearFechaHora = (fecha: string) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formatear día de la semana
const formatearDiaSemana = (fecha: string) => {
  const date = new Date(fecha + 'T00:00:00')
  return date.toLocaleDateString('es-ES', {
    weekday: 'long'
  })
}

// Formatear hora
const formatearHora = (hora: string) => {
  if (!hora) return '-'
  return hora.substring(0, 5) // HH:MM
}

// Obtener iniciales
const obtenerIniciales = (nombre: string) => {
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Obtener clase CSS del estado
const obtenerClaseEstado = (estado: string) => {
  const clases = {
    pendiente: 'bg-yellow-50 text-yellow-700',
    confirmada: 'bg-green-50 text-green-700',
    realizada: 'bg-blue-50 text-blue-700',
    completada: 'bg-blue-50 text-blue-700',
    cancelada: 'bg-red-50 text-red-700'
  }
  return clases[estado as keyof typeof clases] || 'bg-gray-50 text-gray-700'
}

// Obtener color del punto de estado
const obtenerColorPuntoEstado = (estado: string) => {
  const colores = {
    pendiente: 'bg-yellow-500',
    confirmada: 'bg-green-500',
    realizada: 'bg-blue-500',
    completada: 'bg-blue-500',
    cancelada: 'bg-red-500'
  }
  return colores[estado as keyof typeof colores] || 'bg-gray-500'
}

// Obtener texto del estado
const obtenerTextoEstado = (estado: string) => {
  const textos = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    realizada: 'Completada',
    completada: 'Completada',
    cancelada: 'Cancelada'
  }
  return textos[estado as keyof typeof textos] || estado
}

// Lifecycle
onMounted(() => {
  cargarSesiones()
  cargarBonosPagados()
})
</script>
