<template>
  <div>
    <!-- Section 1: Citas por Confirmar (del dashboard) -->
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
            v-for="cita in citasPorConfirmar"
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

    <!-- Section 2: Citas Confirmadas (del dashboard) -->
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
            v-for="cita in citasConfirmadasDetalle"
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
                  <div class="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-3 items-center">
                    <!-- Columna 1: Paciente y Terapeuta -->
                    <div class="lg:col-span-2">
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

                    <!-- Columna 4: Estado del Bono (nuevo) -->
                    <div>
                      <div v-if="cita.bono" class="flex flex-col gap-1">
                        <div class="flex items-center gap-1.5">
                          <span class="text-xs text-cafe/60">🎫 Bono:</span>
                          <span 
                            class="text-xs font-semibold"
                            :class="{
                              'text-red-600': cita.bono.sesiones_restantes === 0,
                              'text-orange-600': cita.bono.sesiones_restantes === 1,
                              'text-amber-600': cita.bono.sesiones_restantes === 2,
                              'text-verde': cita.bono.sesiones_restantes > 2
                            }"
                          >
                            {{ cita.bono.sesiones_restantes }}/{{ cita.bono.sesiones_totales }}
                          </span>
                        </div>
                        <div class="flex items-center gap-1">
                          <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              class="h-full transition-all duration-300 rounded-full"
                              :class="{
                                'bg-red-500': cita.bono.sesiones_restantes === 0,
                                'bg-orange-500': cita.bono.sesiones_restantes === 1,
                                'bg-amber-500': cita.bono.sesiones_restantes === 2,
                                'bg-verde': cita.bono.sesiones_restantes > 2
                              }"
                              :style="{ width: `${(cita.bono.sesiones_restantes / cita.bono.sesiones_totales) * 100}%` }"
                            ></div>
                          </div>
                        </div>
                        <span 
                          v-if="cita.bono.sesiones_restantes <= 2"
                          class="text-[10px] font-medium"
                          :class="{
                            'text-red-600': cita.bono.sesiones_restantes === 0,
                            'text-orange-600': cita.bono.sesiones_restantes === 1,
                            'text-amber-600': cita.bono.sesiones_restantes === 2
                          }"
                        >
                          {{ cita.bono.sesiones_restantes === 0 ? '⚠️ Agotado' : '⚠️ Renovar pronto' }}
                        </span>
                      </div>
                      <div v-else class="text-xs text-cafe/40 italic">
                        Sin bono
                      </div>
                    </div>

                    <!-- Columna 5: Badge confirmada -->
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

    <!-- Modal de Cancelación de Cita con Reintegro -->
    <ModalCancelarCita
      v-if="citaParaCancelar"
      :cita="citaParaCancelar"
      :is-open="modalCancelarCita"
      @close="cerrarModalCancelar"
      @cancelada="handleCitaCancelada"
    />

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
  ClockIcon,
  CheckCircleIcon,
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

// Estado para Citas por Confirmar
const citasPorConfirmar = ref([])
const citasUrgentesCount = ref(0)
const proximaCitaTiempo = ref('--')
const citasConWhatsApp = ref(0)

// Estado para modal de cancelación
const modalCancelarCita = ref(false)
const citaSeleccionada = ref(null)
const citaParaCancelar = ref(null)
const motivoCancelacion = ref('')
const procesandoCancelacion = ref(false)

// Estado para Citas Confirmadas (detalle)
const citasConfirmadasDetalle = ref([])
const citasProximos7Dias = ref(0)
const citasConfirmadasHoy = ref(0)
const citasOnlineConfirmadas = ref(0)
const citasPresencialConfirmadas = ref(0)
const citasListasParaRecordatorio = ref(0)

// Estado para notificaciones toast
const notificacion = ref({
  visible: false,
  tipo: 'success',
  titulo: '',
  mensaje: ''
})

// Función helper para mostrar notificaciones
const mostrarNotificacion = (titulo, mensaje, tipo = 'success') => {
  notificacion.value = {
    visible: true,
    tipo: tipo,
    titulo: titulo,
    mensaje: mensaje
  }
  
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

const formatearFechaCita = (fecha) => {
  if (!fecha) return 'Sin fecha'
  const date = new Date(fecha)
  const hoy = new Date()
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)
  
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

const estaListaParaConfirmar = (fecha, hora) => {
  if (!fecha || !hora) return false
  
  const ahora = new Date()
  const fechaCita = new Date(`${fecha}T${hora}`)
  const diff = fechaCita - ahora
  
  const dentroD24Horas = diff > 0 && diff <= 86400000
  
  return dentroD24Horas
}

const estaListaParaRecordatorio = (fecha, hora) => {
  if (!fecha || !hora) return false
  
  const ahora = new Date()
  const fechaCita = new Date(`${fecha}T${hora}`)
  const diff = fechaCita - ahora
  
  const dentro4Horas = diff > 0 && diff <= 14400000
  
  return dentro4Horas
}

// Cargar citas pendientes de confirmación
const cargarCitasPorConfirmar = async () => {
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaHoy = hoy.toISOString().split('T')[0]
    
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
      .limit(50)
    
    if (citasError) throw citasError
    
    if (!citas || citas.length === 0) {
      citasPorConfirmar.value = []
      citasUrgentesCount.value = 0
      proximaCitaTiempo.value = '--'
      citasConWhatsApp.value = 0
      return
    }
    
    const pacienteIds = [...new Set(citas.map(c => c.paciente_id))]
    const terapeutaIds = [...new Set(citas.map(c => c.terapeuta_id).filter(Boolean))]
    
    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, telefono, email')
      .in('id', pacienteIds)
    
    let terapeutas = []
    if (terapeutaIds.length > 0) {
      const { data: terapeutasData } = await supabase
        .from('terapeutas')
        .select('id, nombre_completo')
        .in('id', terapeutaIds)
      
      terapeutas = terapeutasData || []
    }
    
    const pacientesMap = new Map(pacientes?.map(p => [p.id, p]) || [])
    const terapeutasMap = new Map(terapeutas.map(t => [t.id, t]))
    
    citasPorConfirmar.value = citas.map(cita => {
      const paciente = pacientesMap.get(cita.paciente_id)
      const terapeuta = cita.terapeuta_id ? terapeutasMap.get(cita.terapeuta_id) : null
      
      const manana = new Date(hoy)
      manana.setDate(manana.getDate() + 2)
      const fechaManana = manana.toISOString().split('T')[0]
      
      return {
        id: cita.id,
        fecha: cita.fecha_cita,
        hora_inicio: cita.hora_inicio,
        modalidad: cita.modalidad,
        estado: cita.estado,
        esUrgente: cita.fecha_cita < fechaManana,
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
    
    citasUrgentesCount.value = citasPorConfirmar.value.filter(c => c.esUrgente).length
    
    if (citasPorConfirmar.value.length > 0) {
      const proxima = citasPorConfirmar.value[0]
      proximaCitaTiempo.value = calcularTiempoRestante(proxima.fecha, proxima.hora_inicio)
    }
    
    citasConWhatsApp.value = citasPorConfirmar.value.filter(cita => 
      cita.listaParaConfirmar && cita.paciente?.telefono
    ).length
  } catch (error) {
    console.error('Error al cargar citas por confirmar:', error)
  } finally {
    cargando.value = false
  }
}

const enviarWhatsApp = (cita) => {
  const telefono = cita.paciente?.telefono
  if (!telefono) {
    mostrarNotificacion('Sin Teléfono', 'Este paciente no tiene teléfono registrado', 'error')
    return
  }
  
  const numeroLimpio = telefono.replace(/\D/g, '')
  const nombrePaciente = cita.paciente.nombre.split(' ')[0]
  const nombreTerapeuta = cita.terapeuta.nombre
  const fechaFormateada = formatearFechaCita(cita.fecha)
  const hora = cita.hora_inicio
  
  const mensaje = `Hola ${nombrePaciente}, te escribo desde el equipo de Psicóloga Karem Peña.
Solo quería confirmar tu sesión programada para ${fechaFormateada} a las ${hora} con ${nombreTerapeuta}.
¿Podrías confirmarme si podrás asistir?`
  
  const mensajeCodificado = encodeURIComponent(mensaje)
  const urlWhatsApp = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`
  
  window.open(urlWhatsApp, '_blank')
}

const enviarRecordatorio = (cita) => {
  const telefono = cita.paciente?.telefono
  if (!telefono) {
    mostrarNotificacion('Sin Teléfono', 'Este paciente no tiene teléfono registrado', 'error')
    return
  }
  
  const numeroLimpio = telefono.replace(/\D/g, '')
  const nombrePaciente = cita.paciente.nombre.split(' ')[0]
  const nombreTerapeuta = cita.terapeuta.nombre
  const hora = cita.hora_inicio
  
  const mensaje = `Hola ${nombrePaciente}, te escribo desde el equipo de Psicóloga Karem Peña.
Solo quería recordarte que tienes tu sesión hoy a las ${hora} con ${nombreTerapeuta}.
¡Te esperamos!`
  
  const mensajeCodificado = encodeURIComponent(mensaje)
  const urlWhatsApp = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`
  
  window.open(urlWhatsApp, '_blank')
}

const marcarComoConfirmada = async (cita) => {
  try {
    const { data, error } = await supabase
      .rpc('confirmar_cita_y_descontar_bono', {
        p_cita_id: cita.id
      })
    
    if (error) throw error
    
    if (!data.success) {
      mostrarNotificacion('✗ Error', data.error || 'Error al confirmar la cita', 'error')
      return
    }
    
    let mensaje = `Cita con ${data.paciente_nombre} confirmada.`
    
    if (data.bono_id) {
      mensaje += ` Sesiones restantes en bono: ${data.sesiones_restantes}`
      
      if (data.bono_agotado) {
        mensaje += ' ⚠️ BONO AGOTADO'
      } else if (data.sesiones_restantes <= 2) {
        mensaje += ' ⚠️ Pocas sesiones'
      }
    }
    
    mostrarNotificacion('✓ Cita Confirmada', mensaje, 'success')
    
    await Promise.all([
      cargarCitasPorConfirmar(),
      cargarCitasConfirmadas()
    ])
    
  } catch (error) {
    console.error('Error al confirmar cita:', error)
    mostrarNotificacion('✗ Error', 'Error al confirmar la cita', 'error')
  }
}

const abrirModalCancelar = (cita) => {
  citaSeleccionada.value = cita
  citaParaCancelar.value = {
    id: cita.id,
    fecha_cita: cita.fecha,
    hora_inicio: cita.hora_inicio,
    hora_fin: cita.hora_fin || '00:00',
    bono_id: cita.bono_id || null,
    paciente_nombre: cita.paciente?.nombre || 'Paciente',
    terapeuta_nombre: cita.terapeuta?.nombre || 'Sin asignar',
    modalidad: cita.modalidad,
    estado: cita.estado
  }
  motivoCancelacion.value = ''
  modalCancelarCita.value = true
}

const cerrarModalCancelar = () => {
  modalCancelarCita.value = false
  citaSeleccionada.value = null
  citaParaCancelar.value = null
  motivoCancelacion.value = ''
}

const handleCitaCancelada = (resultado) => {
  cerrarModalCancelar()
  
  const mensaje = resultado?.reintegrada 
    ? '✓ Cita cancelada y sesión reintegrada al bono' 
    : '✓ Cita cancelada exitosamente'
  
  const descripcion = resultado?.reintegrada
    ? `Se devolvió 1 sesión al bono del paciente`
    : `La sesión se descontó del bono según política de cancelación`
  
  mostrarNotificacion('Cita Cancelada', descripcion, 'success')
  
  // Recargar las listas
  cargarCitasPorConfirmar()
  cargarCitasConfirmadas()
}

const cargarCitasConfirmadas = async () => {
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaHoy = hoy.toISOString().split('T')[0]
    
    const { data: citas, error: citasError } = await supabase
      .from('citas')
      .select(`
        id,
        fecha_cita,
        hora_inicio,
        modalidad,
        estado,
        paciente_id,
        terapeuta_id,
        bono_id
      `)
      .eq('estado', 'confirmada')
      .gte('fecha_cita', fechaHoy)
      .order('fecha_cita', { ascending: true })
      .order('hora_inicio', { ascending: true })
      .limit(50)
    
    if (citasError) throw citasError
    
    if (!citas || citas.length === 0) {
      citasConfirmadasDetalle.value = []
      citasConfirmadasHoy.value = 0
      citasProximos7Dias.value = 0
      return
    }
    
    const pacienteIds = [...new Set(citas.map(c => c.paciente_id))]
    const terapeutaIds = [...new Set(citas.map(c => c.terapeuta_id).filter(Boolean))]
    const bonoIds = [...new Set(citas.map(c => c.bono_id).filter(Boolean))]
    
    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, telefono')
      .in('id', pacienteIds)
    
    let bonos = []
    if (bonoIds.length > 0) {
      const { data: bonosData } = await supabase
        .from('bonos')
        .select('id, sesiones_totales, sesiones_restantes, estado')
        .in('id', bonoIds)
      
      bonos = bonosData || []
    }
    
    let terapeutas = []
    if (terapeutaIds.length > 0) {
      const { data: terapeutasData } = await supabase
        .from('terapeutas')
        .select('id, nombre_completo')
        .in('id', terapeutaIds)
      
      terapeutas = terapeutasData || []
    }
    
    const pacientesMap = new Map(pacientes?.map(p => [p.id, p]) || [])
    const terapeutasMap = new Map(terapeutas.map(t => [t.id, t]))
    const bonosMap = new Map(bonos.map(b => [b.id, b]))
    
    citasConfirmadasDetalle.value = citas.map(cita => {
      const paciente = pacientesMap.get(cita.paciente_id)
      const terapeuta = cita.terapeuta_id ? terapeutasMap.get(cita.terapeuta_id) : null
      const bono = cita.bono_id ? bonosMap.get(cita.bono_id) : null
      
      return {
        id: cita.id,
        fecha: cita.fecha_cita,
        hora_inicio: cita.hora_inicio,
        modalidad: cita.modalidad,
        estado: cita.estado,
        listaParaRecordatorio: estaListaParaRecordatorio(cita.fecha_cita, cita.hora_inicio),
        paciente: {
          nombre: paciente?.nombre_completo || 'Sin nombre',
          telefono: paciente?.telefono
        },
        terapeuta: {
          nombre: terapeuta?.nombre_completo || 'Sin terapeuta'
        },
        bono: bono ? {
          id: bono.id,
          sesiones_totales: bono.sesiones_totales,
          sesiones_restantes: bono.sesiones_restantes,
          estado: bono.estado,
          tiene_bono: true
        } : null
      }
    })
    
    citasConfirmadasHoy.value = citasConfirmadasDetalle.value.filter(cita => 
      cita.fecha === fechaHoy
    ).length
    
    const fecha7Dias = new Date(hoy)
    fecha7Dias.setDate(fecha7Dias.getDate() + 7)
    const fecha7DiasStr = fecha7Dias.toISOString().split('T')[0]
    
    citasProximos7Dias.value = citasConfirmadasDetalle.value.filter(cita => 
      cita.fecha <= fecha7DiasStr
    ).length
    
    citasListasParaRecordatorio.value = citasConfirmadasDetalle.value.filter(cita =>
      cita.listaParaRecordatorio && cita.paciente?.telefono
    ).length
    
  } catch (error) {
    console.error('Error al cargar citas confirmadas:', error)
  }
}

const revertirConfirmacion = async (cita) => {
  let mensaje = `¿Volver la cita de ${cita.paciente.nombre} a estado PENDIENTE?`
  
  if (cita.bono && cita.bono.tiene_bono) {
    mensaje += `\n\n✅ Se devolverá 1 sesión al bono`
  }
  
  if (!confirm(mensaje)) return
  
  try {
    const { data, error } = await supabase
      .rpc('revertir_confirmacion_y_devolver_sesion', {
        p_cita_id: cita.id
      })
    
    if (error) throw error
    
    if (!data.success) {
      mostrarNotificacion('✗ Error', data.error || 'Error al revertir la confirmación', 'error')
      return
    }
    
    mostrarNotificacion('↩ Cita Revertida', `Cita de ${data.paciente_nombre} marcada como PENDIENTE`, 'success')
    
    await Promise.all([
      cargarCitasPorConfirmar(),
      cargarCitasConfirmadas()
    ])
    
  } catch (error) {
    console.error('Error al revertir confirmación:', error)
    mostrarNotificacion('✗ Error', 'Error al revertir la confirmación', 'error')
  }
}

onMounted(() => {
  cargarCitasPorConfirmar()
  cargarCitasConfirmadas()
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
