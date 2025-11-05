<template>
  <div class="min-h-screen bg-gradient-to-br from-[#F2F2F2] via-[#FAFAFA] to-[#F8F9FA] p-6 md:p-8 space-y-8 relative overflow-hidden">
    <!-- Elementos decorativos de fondo -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-[#5550F2]/10 to-[#027368]/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-[#04BF9D]/10 to-[#F2B33D]/5 rounded-full blur-3xl"></div>
      <div class="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-[#027368]/8 to-[#5550F2]/8 rounded-full blur-2xl"></div>
    </div>

    <!-- Sección de Bonos Pendientes de Pago (PRIORITARIO) -->
    <div class="relative z-10 bg-white/85 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:bg-white/90">
      <!-- Header moderno con glassmorphism - STICKY -->
      <div class="sticky top-0 z-20 bg-gradient-to-r from-[#5550F2]/5 via-[#027368]/5 to-[#04BF9D]/5 backdrop-blur-md border-t-4 border-gradient-to-r from-[#5550F2] to-[#027368] px-6 md:px-8 py-6 shadow-lg">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <!-- Ícono moderno con gradiente -->
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5550F2] to-[#027368] shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all duration-300">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h2 class="text-2xl font-['Elms_Sans'] font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent">
                Bonos Pendientes de Confirmar
              </h2>
            </div>
            <p class="text-sm font-['Lato'] text-gray-600 leading-relaxed ml-15">
              Gestiona aquí los pagos pendientes y el seguimiento financiero de cada paciente.
            </p>
          </div>
          <!-- Contador moderno con gradiente -->
          <div class="text-right flex-shrink-0">
            <p class="text-xs font-['Lato'] text-gray-500 uppercase tracking-wider font-semibold mb-1">Pendientes</p>
            <div class="relative">
              <p class="text-5xl font-bold bg-gradient-to-r from-[#F2B33D] to-[#5550F2] bg-clip-text text-transparent leading-none">{{ bonosPendientesFiltrados.length }}</p>
              <div class="absolute -inset-2 bg-gradient-to-r from-[#F2B33D]/20 to-[#5550F2]/20 rounded-xl blur opacity-60"></div>
            </div>
          </div>
        </div>
        
        <!-- Barra de búsqueda moderna -->
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg class="w-5 h-5 text-[#027368] group-focus-within:text-[#5550F2] transition-colors duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <input
            v-model="busquedaPendientes"
            type="text"
            placeholder="Buscar paciente en bonos pendientes..."
            class="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl text-sm font-['Lato'] focus:ring-2 focus:ring-[#5550F2]/20 focus:border-[#5550F2] transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 hover:bg-white/90 shadow-sm hover:shadow-md"
          />
          <!-- Badge moderno con resultados -->
          <div v-if="busquedaPendientes" class="absolute inset-y-0 right-0 flex items-center pr-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-['Lato'] font-semibold bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white shadow-lg">
              {{ bonosPendientesFiltrados.length }} resultado{{ bonosPendientesFiltrados.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Barra de progreso moderna -->
      <div v-if="bonosPendientes.length > 0 || bonosConfirmados.length > 0" class="bg-gradient-to-r from-gray-100 to-gray-50 h-2 relative overflow-hidden">
        <div 
          class="absolute inset-y-0 left-0 bg-gradient-to-r from-[#04BF9D] via-[#027368] to-[#5550F2] transition-all duration-700 ease-out shadow-lg"
          :style="{ width: `${progresoConfirmados}%` }"
        ></div>
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
      </div>

      <!-- Tarjetas resumen modernas -->
      <div class="px-6 md:px-8 py-8 bg-gradient-to-b from-white/50 to-white/80 backdrop-blur-sm">
        <!-- Scroll horizontal en móvil -->
        <div class="overflow-x-auto -mx-2 px-2 pb-2">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-max md:min-w-0">
            <!-- Tarjeta: Bonos Pendientes -->
            <div class="group bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md hover:bg-white/95 transition-all duration-300 min-w-[280px] md:min-w-0 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-[#F2B33D]/5 to-[#5550F2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F2B33D] to-[#F2B33D]/70 shadow-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-xs font-['Lato'] text-gray-500 uppercase font-semibold tracking-wider mb-2">Bonos Pendientes</p>
                  <p class="text-3xl font-['Elms_Sans'] font-bold bg-gradient-to-r from-[#F2B33D] to-[#5550F2] bg-clip-text text-transparent">{{ bonosPendientes.length }}</p>
                </div>
              </div>
            </div>

            <!-- Tarjeta: Total por Confirmar -->
            <div class="group bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md hover:bg-white/95 transition-all duration-300 min-w-[280px] md:min-w-0 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-[#027368]/5 to-[#04BF9D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#027368] to-[#04BF9D] shadow-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-xs font-['Lato'] text-gray-500 uppercase font-semibold tracking-wider mb-2">Total por Confirmar</p>
                  <p class="text-3xl font-['Elms_Sans'] font-bold bg-gradient-to-r from-[#027368] to-[#04BF9D] bg-clip-text text-transparent">{{ formatearPrecio(totalPorConfirmarFiltrado) }}€</p>
                  <p v-if="busquedaPendientes" class="text-xs font-['Lato'] text-gray-500 mt-1">de {{ formatearPrecio(totalPorConfirmar) }}€ total</p>
                </div>
              </div>
            </div>

            <!-- Tarjeta: Requieren Atención -->
            <div class="group bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl hover:bg-white/95 transition-all duration-300 min-w-[280px] md:min-w-0 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-[#F2B33D]/5 to-[#5550F2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F2B33D] to-[#5550F2] shadow-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <path d="M12 9v4"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-xs font-['Lato'] text-gray-500 uppercase font-semibold tracking-wider mb-2">Requieren Atención</p>
                  <p class="text-3xl font-['Elms_Sans'] font-bold bg-gradient-to-r from-[#F2B33D] to-[#5550F2] bg-clip-text text-transparent">{{ bonosUrgentesFiltrados }}</p>
                  <p class="text-xs font-['Lato'] text-gray-500 mt-1">{{ busquedaPendientes ? 'en resultados' : 'Pocas sesiones restantes' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Bonos Pendientes -->
      <div class="px-6 md:px-8 py-6">
        <!-- Shimmer Loading -->
        <div v-if="cargandoPendientes" class="space-y-4">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div class="bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] rounded-xl h-32 animate-shimmer"></div>
          </div>
        </div>

        <div v-else-if="bonosPendientesFiltrados.length > 0" class="space-y-4">
          <div
            v-for="bono in bonosPendientesFiltrados"
            :key="bono.id"
            class="group relative bg-white rounded-xl p-5 md:p-6 hover:shadow-md transition-all duration-300 border border-neutral-200/50 hover:border-[#5550F2]/30 shadow-sm"
          >
            <!-- Indicador de prioridad lateral -->
            <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
              :class="{
                'bg-red-500': bono.sesiones_restantes === 0,
                'bg-orange-500': bono.sesiones_restantes === 1,
                'bg-amber-500': bono.sesiones_restantes === 2,
                'bg-gradient-to-b from-[#04BF9D] to-[#027368]': bono.sesiones_restantes > 2
              }"
            ></div>

            <div class="flex flex-col md:flex-row md:items-center gap-5 ml-2">
              <!-- Avatar del paciente -->
              <div class="relative flex-shrink-0">
                <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#04BF9D] to-[#027368] flex items-center justify-center text-white font-bold shadow-sm text-xl">
                  {{ obtenerIniciales(bono.paciente_nombre) }}
                </div>
                <!-- Badge de urgencia -->
                <div v-if="bono.sesiones_restantes <= 1" class="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                  :class="{
                    'bg-red-500': bono.sesiones_restantes === 0,
                    'bg-orange-500': bono.sesiones_restantes === 1
                  }"
                >
                  <span class="text-white text-xs font-bold">!</span>
                </div>
              </div>

              <!-- Información principal -->
              <div class="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                <!-- Paciente -->
                <div>
                  <p class="font-bold text-neutral-800 text-lg mb-1">{{ bono.paciente_nombre }}</p>
                  <p class="text-sm text-neutral-500 capitalize flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#04BF9D]"></span>
                    {{ bono.tipo_bono || 'Bono Estándar' }}
                  </p>
                </div>

                <!-- Terapeuta -->
                <div>
                  <p class="text-xs text-neutral-500 uppercase font-semibold mb-1">Terapeuta</p>
                  <p class="text-sm font-medium text-neutral-700">{{ bono.terapeuta_nombre || 'No asignado' }}</p>
                </div>

                <!-- Estado del Bono -->
                <div>
                  <p class="text-xs text-neutral-500 uppercase font-semibold mb-1">Estado</p>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-700': bono.estado === 'activo',
                      'bg-amber-100 text-amber-700': bono.estado === 'pendiente',
                      'bg-neutral-100 text-neutral-700': bono.estado === 'agotado'
                    }"
                  >
                    <span class="w-1.5 h-1.5 rounded-full"
                      :class="{
                        'bg-green-500': bono.estado === 'activo',
                        'bg-amber-500': bono.estado === 'pendiente',
                        'bg-neutral-500': bono.estado === 'agotado'
                      }"
                    ></span>
                    <span class="capitalize">{{ bono.estado }}</span>
                  </span>
                </div>

                <!-- Sesiones -->
                <div>
                  <p class="text-xs text-neutral-500 uppercase font-semibold mb-1">Sesiones</p>
                  <div class="flex items-center gap-2">
                    <p class="text-base font-bold"
                      :class="{
                        'text-red-600': bono.sesiones_restantes === 0,
                        'text-orange-600': bono.sesiones_restantes === 1,
                        'text-amber-600': bono.sesiones_restantes === 2,
                        'text-[#027368]': bono.sesiones_restantes > 2
                      }"
                    >
                      {{ bono.sesiones_restantes }}
                    </p>
                    <p class="text-sm text-neutral-500">/ {{ bono.sesiones_totales }}</p>
                  </div>
                  <div v-if="bono.sesiones_restantes <= 1" class="flex items-center gap-1 text-xs font-semibold mt-1"
                    :class="{
                      'text-red-600': bono.sesiones_restantes === 0,
                      'text-orange-600': bono.sesiones_restantes === 1
                    }"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                      <path d="M12 9v4"></path>
                      <path d="M12 17h.01"></path>
                    </svg>
                    <span>{{ bono.sesiones_restantes === 0 ? '¡AGOTADO!' : '¡ÚLTIMA!' }}</span>
                  </div>
                </div>

                <!-- Monto -->
                <div class="text-left md:text-right">
                  <p class="text-xs text-neutral-500 uppercase font-semibold mb-1">Monto</p>
                  <p class="text-2xl font-bold text-[#B46E4B]">{{ formatearPrecio(bono.monto_total) }}€</p>
                  <p class="text-xs text-[#C57A3E] font-medium mt-0.5">Por confirmar</p>
                </div>
              </div>

              <!-- Botón de acción -->
              <div class="flex-shrink-0">
                <button
                  @click.stop="confirmarPagoRapido(bono)"
                  :disabled="procesandoConfirmacion"
                  class="group/btn w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white rounded-xl hover:from-[#027368] hover:to-[#5550F2] transition-all duration-300 font-['Lato'] font-semibold text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border border-white/20 backdrop-blur-sm"
                >
                  <svg class="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Confirmar Pago</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado: Sin resultados de búsqueda -->
        <div v-else-if="busquedaPendientes && bonosPendientesFiltrados.length === 0" class="text-center py-16">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-50 mb-5">
            <svg class="w-12 h-12 text-[#C57A3E]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-serif font-bold text-neutral-800 mb-2">
            No se encontraron resultados
          </h3>
          <p class="text-neutral-600 mb-6 text-base">
            No hay bonos pendientes para "{{ busquedaPendientes }}"
          </p>
          <button
            @click="busquedaPendientes = ''"
            class="group/btn inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5550F2] to-[#027368] text-white rounded-xl hover:from-[#027368] hover:to-[#04BF9D] transition-all duration-300 font-['Lato'] font-semibold shadow-sm hover:shadow-md hover:scale-105 border border-white/20 backdrop-blur-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
            <span>Limpiar búsqueda</span>
          </button>
        </div>

        <!-- Estado: Todo al día -->
        <div v-else class="text-center py-16">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F8FFF9] mb-5">
            <svg class="w-12 h-12 text-[#027368]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-serif font-bold text-neutral-800 mb-2">
            Todo al día 🧾
          </h3>
          <p class="text-neutral-600 mb-6 text-base">
            No hay bonos pendientes de confirmar pago.
          </p>
          <NuxtLink
            to="/coordinadora/pacientes"
            class="group/btn inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5550F2] to-[#027368] text-white rounded-xl hover:from-[#027368] hover:to-[#04BF9D] transition-all duration-300 font-['Lato'] font-semibold shadow-sm hover:shadow-md hover:scale-105 border border-white/20 backdrop-blur-sm"
          >
            <span>Gestionar Pacientes</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Historial de Pagos Confirmados -->
    <div class="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden mt-8">
      <!-- Header con filtro - STICKY -->
      <div class="sticky top-0 z-20 bg-gradient-to-r from-green-50 to-emerald-50/50 px-6 md:px-8 py-6 border-b border-neutral-200 shadow-md">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 class="text-xl font-serif font-bold text-neutral-800 flex items-center gap-2.5 mb-1">
              <svg class="w-6 h-6 text-[#027368]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M3 3v18h18"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
              <span>Historial de Pagos Confirmados</span>
            </h2>
            <p class="text-sm text-neutral-600 leading-relaxed">
              Bonos ya registrados y confirmados por coordinación.
            </p>
          </div>
          
          <!-- Filtro de mes -->
          <select
            v-model="mesSeleccionado"
            @change="cargarBonosPorMes"
            class="px-4 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#027368]/20 focus:border-[#027368] transition-all bg-white hover:border-[#027368] cursor-pointer"
          >
            <option value="">📅 Todos los meses</option>
            <option v-for="mes in mesesDisponibles" :key="mes.valor" :value="mes.valor">
              {{ mes.nombre }}
            </option>
          </select>
        </div>
        
        <!-- Barra de búsqueda -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <input
            v-model="busquedaConfirmados"
            type="text"
            placeholder="Buscar paciente en pagos confirmados..."
            class="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#027368]/20 focus:border-[#027368] transition-all bg-white placeholder:text-neutral-400"
          />
          <!-- Badge con resultados -->
          <div v-if="busquedaConfirmados" class="absolute inset-y-0 right-0 flex items-center pr-4">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#027368] text-white">
              {{ bonosConfirmadosFiltrados.length }} resultado{{ bonosConfirmadosFiltrados.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Resumen Financiero -->
      <div class="px-6 md:px-8 py-6 bg-gradient-to-b from-green-50/50 to-white border-b border-green-100">
        <div class="overflow-x-auto -mx-2 px-2 pb-2">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-max md:min-w-0">
            <div class="bg-white rounded-xl p-5 shadow-sm border border-green-200 hover:shadow-md transition-all duration-200 min-w-[280px] md:min-w-0">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#027368]/20 to-[#027368]/10 flex items-center justify-center flex-shrink-0">
                  <svg class="w-7 h-7 text-[#027368]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1">Bonos Confirmados</p>
                  <p class="text-3xl font-bold text-neutral-800">{{ bonosConfirmadosFiltrados.length }}</p>
                  <p v-if="busquedaConfirmados" class="text-xs text-neutral-500 mt-0.5">de {{ bonosConfirmados.length }} total</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-5 shadow-sm border border-green-200 hover:shadow-md transition-all duration-200 min-w-[280px] md:min-w-0">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#027368]/30 to-[#027368]/15 flex items-center justify-center flex-shrink-0">
                  <svg class="w-7 h-7 text-[#027368]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1">Total Confirmado</p>
                  <p class="text-3xl font-bold text-[#027368]">{{ formatearPrecio(totalConfirmadoFiltrado) }}€</p>
                  <p v-if="busquedaConfirmados" class="text-xs text-neutral-500 mt-0.5">de {{ formatearPrecio(totalConfirmado) }}€ total</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-200 hover:shadow-md transition-all duration-200 min-w-[280px] md:min-w-0">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M3 3v18h18"></path>
                    <path d="M18 17V9"></path>
                    <path d="M13 17V5"></path>
                    <path d="M8 17v-3"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1">Promedio por Bono</p>
                  <p class="text-3xl font-bold text-blue-600">{{ formatearPrecio(promedioPorBonoFiltrado) }}€</p>
                  <p v-if="busquedaConfirmados" class="text-xs text-neutral-500 mt-0.5">de {{ formatearPrecio(promedioPorBono) }}€ total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de pagos confirmados -->
      <div class="px-6 md:px-8 py-6">
        <!-- Shimmer Loading -->
        <div v-if="cargando" class="space-y-3">
          <div v-for="i in 4" :key="i" class="animate-pulse">
            <div class="bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] rounded-lg h-24 animate-shimmer"></div>
          </div>
        </div>

        <div v-else-if="bonosConfirmadosFiltrados.length > 0" class="space-y-4">
          <div
            v-for="bono in bonosConfirmadosFiltrados"
            :key="bono.id"
            class="group relative bg-white rounded-xl p-5 md:p-6 hover:shadow-md transition-all duration-200 cursor-pointer border border-green-100 hover:border-[#027368] shadow-sm"
            @click="abrirDetallePago(bono)"
          >
            <!-- Indicador lateral verde -->
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#027368] rounded-l-xl"></div>

            <div class="flex flex-col md:flex-row md:items-center gap-5 ml-2">
              <!-- Avatar del paciente -->
              <div class="relative flex-shrink-0">
                <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#027368] to-[#04BF9D] flex items-center justify-center text-white font-bold shadow-sm text-xl">
                  {{ obtenerIniciales(bono.paciente_nombre) }}
                </div>
                <!-- Badge de confirmado -->
                <div class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#027368] flex items-center justify-center shadow-md">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>

              <!-- Información principal -->
              <div class="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                <!-- Paciente -->
                <div>
                  <p class="font-bold text-neutral-800 text-lg mb-1">{{ bono.paciente_nombre }}</p>
                  <p class="text-sm text-neutral-500 capitalize flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#027368]"></span>
                    {{ bono.tipo_bono || 'Bono Estándar' }}
                  </p>
                </div>

                <!-- Terapeuta -->
                <div>
                  <p class="text-xs text-neutral-500 uppercase font-semibold mb-1">Terapeuta</p>
                  <p class="text-sm font-medium text-neutral-700">{{ bono.terapeuta_nombre || 'No asignado' }}</p>
                </div>

                <!-- Estado Confirmado -->
                <div>
                  <p class="text-xs text-neutral-500 uppercase font-semibold mb-1">Estado</p>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#027368]/10 text-[#027368]">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#027368]"></span>
                    <span>Confirmado</span>
                  </span>
                </div>

                <!-- Sesiones -->
                <div>
                  <p class="text-xs text-neutral-500 uppercase font-semibold mb-1">Sesiones</p>
                  <div class="flex items-center gap-2">
                    <p class="text-base font-bold"
                      :class="{
                        'text-red-600': bono.sesiones_restantes === 0,
                        'text-orange-600': bono.sesiones_restantes === 1,
                        'text-amber-600': bono.sesiones_restantes === 2,
                        'text-[#027368]': bono.sesiones_restantes > 2
                      }"
                    >
                      {{ bono.sesiones_restantes }}
                    </p>
                    <p class="text-sm text-neutral-500">/ {{ bono.sesiones_totales }}</p>
                  </div>
                  <div v-if="bono.sesiones_restantes <= 1" class="flex items-center gap-1 text-xs font-semibold mt-1"
                    :class="{
                      'text-red-600': bono.sesiones_restantes === 0,
                      'text-orange-600': bono.sesiones_restantes === 1
                    }"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                      <path d="M12 9v4"></path>
                      <path d="M12 17h.01"></path>
                    </svg>
                    <span>{{ bono.sesiones_restantes === 0 ? '¡AGOTADO!' : '¡RENOVAR!' }}</span>
                  </div>
                </div>

                <!-- Monto y fecha -->
                <div class="text-left md:text-right">
                  <p class="text-xs text-neutral-500 uppercase font-semibold mb-1">Pago Confirmado</p>
                  <p class="text-2xl font-bold text-[#027368]">{{ formatearPrecio(bono.monto_total) }}€</p>
                  <p class="text-xs text-neutral-500 mt-1 flex items-center md:justify-end gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                      <line x1="16" x2="16" y1="2" y2="6"></line>
                      <line x1="8" x2="8" y1="2" y2="6"></line>
                      <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                    <span>{{ formatearFecha(bono.fecha_pago) }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else-if="busquedaConfirmados && bonosConfirmadosFiltrados.length === 0" class="text-center py-16">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-5">
            <svg class="w-12 h-12 text-[#027368]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-neutral-800 mb-2">
            No se encontraron resultados
          </h3>
          <p class="text-neutral-600 mb-6">
            No hay pagos confirmados para "{{ busquedaConfirmados }}"
          </p>
          <button
            @click="busquedaConfirmados = ''"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white rounded-xl hover:from-[#027368] hover:to-[#04BF9D] transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
            <span>Limpiar búsqueda</span>
          </button>
        </div>

        <div v-else class="text-center py-16">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-5">
            <svg class="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-neutral-800 mb-2">
            Sin pagos registrados
          </h3>
          <p class="text-neutral-600">
            {{ mesSeleccionado ? 'No hay pagos confirmados en este mes' : 'No hay pagos confirmados aún' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Modal de Detalle Mejorado -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modalDetalleAbierto"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="cerrarDetallePago"
      >
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="modalDetalleAbierto" class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8">
            <!-- Header del modal -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#027368]/20 to-[#027368]/10 flex items-center justify-center">
                  <svg class="w-6 h-6 text-[#027368]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-serif font-bold text-neutral-800">Detalle del Pago</h3>
              </div>
              <button
                @click="cerrarDetallePago"
                class="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
            
            <!-- Contenido del modal -->
            <div v-if="bonoSeleccionado" class="space-y-6">
              <!-- Avatar y nombre del paciente -->
              <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl border border-green-100">
                <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#027368] to-[#04BF9D] flex items-center justify-center text-white font-bold shadow-sm text-2xl">
                  {{ obtenerIniciales(bonoSeleccionado.paciente_nombre) }}
                </div>
                <div>
                  <p class="text-lg font-bold text-neutral-800">{{ bonoSeleccionado.paciente_nombre }}</p>
                  <p class="text-sm text-neutral-600 capitalize">{{ bonoSeleccionado.tipo_bono }}</p>
                </div>
              </div>

              <!-- Grid de información -->
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <p class="text-xs text-neutral-500 uppercase font-semibold mb-1">Monto Total</p>
                  <p class="text-2xl font-bold text-[#027368]">{{ formatearPrecio(bonoSeleccionado.monto_total) }}€</p>
                </div>
                <div class="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <p class="text-xs text-neutral-500 uppercase font-semibold mb-1">Fecha de Pago</p>
                  <p class="text-base font-semibold text-neutral-800">{{ formatearFecha(bonoSeleccionado.fecha_pago) }}</p>
                </div>
                <div class="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <p class="text-xs text-neutral-500 uppercase font-semibold mb-1">Sesiones Totales</p>
                  <p class="text-2xl font-bold text-neutral-800">{{ bonoSeleccionado.sesiones_totales }}</p>
                </div>
                <div class="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <p class="text-xs text-neutral-500 uppercase font-semibold mb-1">Sesiones Restantes</p>
                  <p class="text-2xl font-bold"
                    :class="{
                      'text-red-600': bonoSeleccionado.sesiones_restantes === 0,
                      'text-orange-600': bonoSeleccionado.sesiones_restantes === 1,
                      'text-amber-600': bonoSeleccionado.sesiones_restantes === 2,
                      'text-[#027368]': bonoSeleccionado.sesiones_restantes > 2
                    }"
                  >
                    {{ bonoSeleccionado.sesiones_restantes }}
                  </p>
                </div>
              </div>

              <!-- Botón de cerrar -->
              <div class="flex justify-end pt-4">
                <button
                  @click="cerrarDetallePago"
                  class="px-6 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl transition-colors font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()

definePageMeta({
  layout: 'coordinadora',
  middleware: ['auth', 'role-coordinadora']
})

// Estado
const cargando = ref(true)
const bonosConfirmados = ref([])
const totalConfirmado = ref(0)
const promedioPorBono = ref(0)
const mesSeleccionado = ref('')
const mesesDisponibles = ref([])
const modalDetalleAbierto = ref(false)
const bonoSeleccionado = ref(null)

// Estado de bonos pendientes
const cargandoPendientes = ref(true)
const bonosPendientes = ref([])
const totalPorConfirmar = ref(0)
const bonosUrgentes = ref(0)

// Búsquedas
const busquedaPendientes = ref('')
const busquedaConfirmados = ref('')

// Modal de confirmación de pago
const modalConfirmarPago = ref(false)
const metodoPagoSeleccionado = ref('')
const procesandoConfirmacion = ref(false)

// Computed: Progreso de confirmación de pagos (para la barra)
const progresoConfirmados = computed(() => {
  const total = bonosPendientes.value.length + bonosConfirmados.value.length
  if (total === 0) return 100
  return Math.round((bonosConfirmados.value.length / total) * 100)
})

// Computed: Filtrar bonos pendientes
const bonosPendientesFiltrados = computed(() => {
  if (!busquedaPendientes.value.trim()) {
    return bonosPendientes.value
  }
  
  const busqueda = busquedaPendientes.value.toLowerCase().trim()
  return bonosPendientes.value.filter(bono => {
    const nombrePaciente = (bono.paciente_nombre || '').toLowerCase()
    const nombreTerapeuta = (bono.terapeuta_nombre || '').toLowerCase()
    const tipoBono = (bono.tipo_bono || '').toLowerCase()
    
    return nombrePaciente.includes(busqueda) || 
           nombreTerapeuta.includes(busqueda) ||
           tipoBono.includes(busqueda)
  })
})

// Computed: Filtrar bonos confirmados
const bonosConfirmadosFiltrados = computed(() => {
  if (!busquedaConfirmados.value.trim()) {
    return bonosConfirmados.value
  }
  
  const busqueda = busquedaConfirmados.value.toLowerCase().trim()
  return bonosConfirmados.value.filter(bono => {
    const nombrePaciente = (bono.paciente_nombre || '').toLowerCase()
    const nombreTerapeuta = (bono.terapeuta_nombre || '').toLowerCase()
    const tipoBono = (bono.tipo_bono || '').toLowerCase()
    
    return nombrePaciente.includes(busqueda) || 
           nombreTerapeuta.includes(busqueda) ||
           tipoBono.includes(busqueda)
  })
})

// Computed: Total por confirmar (filtrado)
const totalPorConfirmarFiltrado = computed(() => {
  return bonosPendientesFiltrados.value.reduce((sum, bono) => {
    return sum + (Number(bono.monto_total) || 0)
  }, 0)
})

// Computed: Bonos urgentes (filtrado)
const bonosUrgentesFiltrados = computed(() => {
  return bonosPendientesFiltrados.value.filter(bono => 
    bono.sesiones_restantes <= 1
  ).length
})

// Computed: Total confirmado (filtrado)
const totalConfirmadoFiltrado = computed(() => {
  return bonosConfirmadosFiltrados.value.reduce((sum, bono) => {
    return sum + (Number(bono.monto_total) || 0)
  }, 0)
})

// Computed: Promedio por bono (filtrado)
const promedioPorBonoFiltrado = computed(() => {
  if (bonosConfirmadosFiltrados.value.length === 0) return 0
  return totalConfirmadoFiltrado.value / bonosConfirmadosFiltrados.value.length
})

// Funciones de utilidad
const formatearPrecio = (valor) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor || 0)
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'No especificada'
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const obtenerIniciales = (nombre) => {
  if (!nombre) return '?'
  const partes = nombre.split(' ')
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
}

// Cargar bonos confirmados
const cargarBonosConfirmados = async () => {
  try {
    cargando.value = true

    let query = supabase
      .from('bonos')
      .select('*')
      .eq('estado_pago', 'pagado')
      .order('fecha_pago', { ascending: false })

    // Filtrar por mes si está seleccionado
    if (mesSeleccionado.value) {
      const [year, month] = mesSeleccionado.value.split('-')
      const fechaInicio = new Date(parseInt(year), parseInt(month) - 1, 1)
      const fechaFin = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      
      query = query
        .gte('fecha_pago', fechaInicio.toISOString())
        .lte('fecha_pago', fechaFin.toISOString())
    }

    const { data: bonos, error: bonosError } = await query

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
  } finally {
    cargando.value = false
  }
}

// Cargar meses disponibles
const cargarMesesDisponibles = async () => {
  try {
    const { data, error } = await supabase
      .from('bonos')
      .select('fecha_pago')
      .eq('estado_pago', 'pagado')
      .not('fecha_pago', 'is', null)
      .order('fecha_pago', { ascending: false })

    if (error) {
      console.error('Error al cargar meses:', error)
      return
    }

    if (!data || data.length === 0) {
      mesesDisponibles.value = []
      return
    }

    // Extraer meses únicos
    const mesesSet = new Set()
    data.forEach(bono => {
      if (bono.fecha_pago) {
        const fecha = new Date(bono.fecha_pago)
        const mesValor = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
        mesesSet.add(mesValor)
      }
    })

    // Convertir a array y formatear
    const mesesArray = Array.from(mesesSet).sort().reverse()
    mesesDisponibles.value = mesesArray.map(mesValor => {
      const [year, month] = mesValor.split('-')
      const fecha = new Date(parseInt(year), parseInt(month) - 1)
      const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      return {
        valor: mesValor,
        nombre: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)
      }
    })
  } catch (error) {
    console.error('Error al cargar meses disponibles:', error)
  }
}

// Función para cambiar de mes
const cargarBonosPorMes = async () => {
  await cargarBonosConfirmados()
}

// Funciones de modal
const abrirDetallePago = (bono) => {
  bonoSeleccionado.value = bono
  modalDetalleAbierto.value = true
}

const cerrarDetallePago = () => {
  modalDetalleAbierto.value = false
  bonoSeleccionado.value = null
}

// Cargar bonos pendientes de pago
const cargarBonosPendientes = async () => {
  try {
    cargandoPendientes.value = true

    // Obtener bonos con estado "pendiente" (pendientes de confirmar pago)
    const { data: bonos, error: bonosError } = await supabase
      .from('bonos')
      .select('*')
      .eq('estado_pago', 'pendiente')
      .in('estado', ['activo', 'pendiente'])
      .order('created_at', { ascending: false })

    if (bonosError) {
      console.error('Error al cargar bonos pendientes:', bonosError)
      return
    }

    if (!bonos || bonos.length === 0) {
      bonosPendientes.value = []
      totalPorConfirmar.value = 0
      bonosUrgentes.value = 0
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
        estado: bono.estado,
        created_at: bono.created_at
      }
    })

    // Calcular totales
    totalPorConfirmar.value = bonosPendientes.value.reduce((sum, bono) => {
      return sum + (Number(bono.monto_total) || 0)
    }, 0)

    // Contar bonos urgentes (con 1 o menos sesiones restantes)
    bonosUrgentes.value = bonosPendientes.value.filter(bono => 
      bono.sesiones_restantes <= 1
    ).length

  } catch (error) {
    console.error('Error al cargar bonos pendientes:', error)
  } finally {
    cargandoPendientes.value = false
  }
}

// Abrir modal de confirmación de pago
const abrirConfirmarPago = (bono) => {
  bonoSeleccionado.value = bono
  modalConfirmarPago.value = true
  metodoPagoSeleccionado.value = ''
}

// Confirmar pago rápido con toast notification
const confirmarPagoRapido = async (bono) => {
  try {
    procesandoConfirmacion.value = true
    
    const { error } = await supabase
      .from('bonos')
      .update({ 
        estado_pago: 'pagado',
        fecha_pago: new Date().toISOString()
      })
      .eq('id', bono.id)

    if (error) throw error

    // Recargar ambas listas
    await Promise.all([
      cargarBonosPendientes(),
      cargarBonosConfirmados()
    ])

    // Mostrar notificación de éxito
    mostrarToast('✅ Pago confirmado exitosamente', 'success')
  } catch (error) {
    console.error('Error al confirmar pago:', error)
    mostrarToast('❌ Error al confirmar pago: ' + error.message, 'error')
  } finally {
    procesandoConfirmacion.value = false
  }
}

// Sistema de toast notifications simple
const mostrarToast = (mensaje, tipo = 'info') => {
  // Crear elemento toast
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 ${
    tipo === 'success' ? 'bg-[#027368] text-white' : 
    tipo === 'error' ? 'bg-red-500 text-white' : 
    'bg-neutral-800 text-white'
  }`
  toast.innerHTML = `
    <span class="text-lg">${tipo === 'success' ? '✓' : tipo === 'error' ? '✕' : 'ℹ'}</span>
    <span class="font-medium">${mensaje}</span>
  `
  
  document.body.appendChild(toast)
  
  // Animar entrada
  setTimeout(() => {
    toast.style.transform = 'translateX(0)'
  }, 10)
  
  // Remover después de 3 segundos
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

// Cargar datos al montar
onMounted(() => {
  cargarMesesDisponibles()
  cargarBonosConfirmados()
  cargarBonosPendientes()
})
</script>

<style scoped>
/* Animación shimmer para loading states */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}

/* Mejora de transiciones */
* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scroll suave para las tarjetas en móvil */
@media (max-width: 768px) {
  .overflow-x-auto::-webkit-scrollbar {
    display: none;
  }
  
  .overflow-x-auto {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
</style>
