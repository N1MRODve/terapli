<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
          Configuracion
        </h1>
        <p class="text-gray-500 mt-1">
          Ajustes de tarifas, pagos y preferencias
        </p>
      </header>

      <!-- Loading -->
      <div v-if="cargando" class="flex flex-col items-center justify-center py-16">
        <div class="w-10 h-10 border-3 border-gray-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
        <p class="text-gray-500">Cargando configuracion...</p>
      </div>

      <!-- Contenido -->
      <div v-else class="space-y-6">

        <!-- Seccion: Precios por Frecuencia -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Precios por Frecuencia</h2>
              <p class="text-sm text-gray-500">Configura el precio de cada sesion segun la frecuencia del paciente</p>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Precio Semanal -->
              <div class="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-3">
                  <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span class="font-semibold text-blue-900">Semanal</span>
                </div>
                <div class="relative">
                  <input
                    v-model.number="config.precios_frecuencia.semanal"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full pl-4 pr-12 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-bold text-blue-900 bg-white"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 font-medium">EUR</span>
                </div>
                <p class="mt-2 text-xs text-blue-700">Pacientes con cita cada semana</p>
              </div>

              <!-- Precio Quincenal -->
              <div class="border border-green-200 bg-green-50 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-3">
                  <span class="w-3 h-3 rounded-full bg-green-500"></span>
                  <span class="font-semibold text-green-900">Quincenal</span>
                </div>
                <div class="relative">
                  <input
                    v-model.number="config.precios_frecuencia.quincenal"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full pl-4 pr-12 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-bold text-green-900 bg-white"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 font-medium">EUR</span>
                </div>
                <p class="mt-2 text-xs text-green-700">Pacientes con cita cada 2 semanas</p>
              </div>

              <!-- Precio Sesion Unica -->
              <div class="border border-purple-200 bg-purple-50 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-3">
                  <span class="w-3 h-3 rounded-full bg-purple-500"></span>
                  <span class="font-semibold text-purple-900">Sesion Unica</span>
                </div>
                <div class="relative">
                  <input
                    v-model.number="config.precios_frecuencia.unica"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full pl-4 pr-12 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg font-bold text-purple-900 bg-white"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 font-medium">EUR</span>
                </div>
                <p class="mt-2 text-xs text-purple-700">Sesiones puntuales o esporadicas</p>
              </div>
            </div>

            <!-- Info sobre precio base -->
            <div class="mt-4 p-3 bg-gray-100 rounded-lg">
              <p class="text-sm text-gray-600">
                <strong>Precio base por defecto:</strong> {{ formatearPrecio(config.precio_sesion_base) }} EUR
                <span class="text-gray-400 ml-2">(usado cuando no se especifica frecuencia)</span>
              </p>
            </div>
          </div>
        </section>

        <!-- Seccion: Configuracion General -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Configuracion General</h2>
              <p class="text-sm text-gray-500">Ajustes generales de sesiones</p>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Precio por sesion base -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Precio base por defecto
                </label>
                <div class="relative">
                  <input
                    v-model.number="config.precio_sesion_base"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    placeholder="50.00"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">EUR</span>
                </div>
                <p class="mt-1.5 text-xs text-gray-500">
                  Precio por defecto si no hay frecuencia asignada
                </p>
              </div>

              <!-- Duracion de sesion -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Duracion estandar de sesion
                </label>
                <select
                  v-model.number="config.duracion_sesion_minutos"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                >
                  <option :value="30">30 minutos</option>
                  <option :value="45">45 minutos</option>
                  <option :value="60">60 minutos (recomendado)</option>
                  <option :value="90">90 minutos</option>
                  <option :value="120">2 horas</option>
                </select>
              </div>
            </div>

            <!-- Comision plataforma (solo lectura) -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-700">Comision de la plataforma</p>
                  <p class="text-xs text-gray-500 mt-0.5">Porcentaje que retiene Terapli por cada sesion</p>
                </div>
                <span class="text-2xl font-bold text-gray-900">{{ config.porcentaje_comision }}%</span>
              </div>
              <div class="mt-3 pt-3 border-t border-gray-200">
                <div class="grid grid-cols-3 gap-2 text-sm">
                  <div class="text-center p-2 bg-blue-50 rounded">
                    <p class="text-xs text-blue-600">Semanal (40 EUR)</p>
                    <p class="font-bold text-blue-900">{{ formatearPrecio(calcularIngresoNeto(config.precios_frecuencia.semanal)) }} EUR</p>
                  </div>
                  <div class="text-center p-2 bg-green-50 rounded">
                    <p class="text-xs text-green-600">Quincenal (50 EUR)</p>
                    <p class="font-bold text-green-900">{{ formatearPrecio(calcularIngresoNeto(config.precios_frecuencia.quincenal)) }} EUR</p>
                  </div>
                  <div class="text-center p-2 bg-purple-50 rounded">
                    <p class="text-xs text-purple-600">Unica (60 EUR)</p>
                    <p class="font-bold text-purple-900">{{ formatearPrecio(calcularIngresoNeto(config.precios_frecuencia.unica)) }} EUR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Seccion: Metodos de Pago -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Metodos de Pago</h2>
              <p class="text-sm text-gray-500">Selecciona los metodos que aceptas de tus pacientes</p>
            </div>
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
          </div>
        </section>

        <!-- Seccion: Datos Fiscales para Facturacion -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Datos Fiscales</h2>
              <p class="text-sm text-gray-500">Informacion para emitir facturas a tus pacientes</p>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <!-- Datos personales/empresa -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- NIF/DNI -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  NIF / DNI <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="datosFiscales.nif"
                  type="text"
                  placeholder="12345678A"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                  :class="nifError ? 'border-red-300 bg-red-50' : 'border-gray-300'"
                  @blur="validarNIF"
                />
                <p v-if="nifError" class="mt-1 text-xs text-red-600">{{ nifError }}</p>
              </div>

              <!-- Razon Social / Nombre -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nombre o Razon Social <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="datosFiscales.razon_social"
                  type="text"
                  placeholder="Tu nombre completo o razon social"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <!-- Direccion -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Direccion fiscal
              </label>
              <input
                v-model="datosFiscales.direccion"
                type="text"
                placeholder="Calle, numero, piso..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <!-- CP, Ciudad, Provincia -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Codigo Postal
                </label>
                <input
                  v-model="datosFiscales.codigo_postal"
                  type="text"
                  placeholder="28001"
                  maxlength="5"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  v-model="datosFiscales.ciudad"
                  type="text"
                  placeholder="Madrid"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Provincia
                </label>
                <input
                  v-model="datosFiscales.provincia"
                  type="text"
                  placeholder="Madrid"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <!-- Numero Colegiado (opcional) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Numero de Colegiado
                  <span class="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  v-model="datosFiscales.numero_colegiado"
                  type="text"
                  placeholder="Ej: M-12345"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p class="mt-1 text-xs text-gray-500">Aparecera en tus facturas</p>
              </div>

              <!-- Regimen IVA -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Regimen de IVA
                </label>
                <div class="space-y-2">
                  <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all"
                    :class="datosFiscales.regimen_iva === 'exento' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'">
                    <input
                      type="radio"
                      v-model="datosFiscales.regimen_iva"
                      value="exento"
                      class="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span class="text-sm font-medium text-gray-900">Exento de IVA</span>
                      <p class="text-xs text-gray-500">Servicios sanitarios (Art. 20.1.3 LIVA)</p>
                    </div>
                  </label>
                  <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all"
                    :class="datosFiscales.regimen_iva === 'general' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'">
                    <input
                      type="radio"
                      v-model="datosFiscales.regimen_iva"
                      value="general"
                      class="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span class="text-sm font-medium text-gray-900">Regimen General (21% IVA)</span>
                      <p class="text-xs text-gray-500">Para otros servicios no sanitarios</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Info sobre facturacion -->
            <div class="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm text-indigo-800">
                  <p class="font-medium mb-1">Sobre la facturacion:</p>
                  <ul class="list-disc list-inside space-y-1 text-indigo-700">
                    <li><strong>Particulares:</strong> {{ datosFiscales.regimen_iva === 'exento' ? 'IVA exento por servicios sanitarios' : 'IVA 21%' }}</li>
                    <li><strong>Empresas:</strong> IVA 21% + Retencion IRPF 15%</li>
                    <li>Las facturas se numeran automaticamente</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Boton guardar datos fiscales -->
            <div class="flex justify-end">
              <button
                @click="guardarDatosFiscales"
                :disabled="guardandoFiscales"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <svg v-if="guardandoFiscales" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <svg v-else-if="fiscalesGuardados" class="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ fiscalesGuardados ? 'Guardado' : (guardandoFiscales ? 'Guardando...' : 'Guardar datos fiscales') }}
              </button>
            </div>
          </div>
        </section>

        <!-- Seccion: Plantillas de Bonos -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Plantillas de Bonos</h2>
                <p class="text-sm text-gray-500">Crea bonos que puedes asignar a tus pacientes</p>
              </div>
            </div>
            <button
              @click="agregarPlantillaBono"
              class="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nueva Plantilla
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- Lista de plantillas de bonos -->
            <div
              v-for="(plantilla, index) in config.plantillas_bonos"
              :key="index"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <!-- Nombre del bono -->
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                    <input
                      v-model="plantilla.nombre"
                      type="text"
                      placeholder="Ej: Bono 4 sesiones"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <!-- Sesiones incluidas -->
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Sesiones</label>
                    <input
                      v-model.number="plantilla.sesiones"
                      type="number"
                      min="1"
                      max="50"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <!-- Precio total -->
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Precio Total (EUR)</label>
                    <input
                      v-model.number="plantilla.precio"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <!-- Frecuencia asociada -->
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Frecuencia</label>
                    <select
                      v-model="plantilla.frecuencia"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="semanal">Semanal</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="mensual">Mensual</option>
                      <option value="cualquiera">Cualquier frecuencia</option>
                    </select>
                  </div>
                </div>

                <!-- Boton eliminar -->
                <button
                  @click="eliminarPlantillaBono(index)"
                  class="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Eliminar plantilla"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <!-- Info del bono -->
              <div class="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>
                  Precio por sesion: <strong class="text-gray-700">{{ formatearPrecio(plantilla.precio / plantilla.sesiones) }} EUR</strong>
                </span>
                <span v-if="plantilla.sesiones > 0">
                  Ahorro vs sesion unica: <strong class="text-emerald-600">{{ formatearPrecio((config.precios_frecuencia.unica * plantilla.sesiones) - plantilla.precio) }} EUR</strong>
                </span>
              </div>
            </div>

            <!-- Mensaje si no hay plantillas -->
            <div v-if="config.plantillas_bonos.length === 0" class="text-center py-8 text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <p>No tienes plantillas de bonos configuradas</p>
              <p class="text-sm">Crea una plantilla para poder asignarla a tus pacientes</p>
            </div>

            <!-- Plantillas predefinidas sugeridas -->
            <div class="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p class="text-sm font-medium text-amber-800 mb-2">Plantillas sugeridas:</p>
              <div class="flex flex-wrap gap-2">
                <button
                  @click="agregarPlantillaPredefinida('4 sesiones semanales', 4, 160, 'semanal')"
                  class="px-3 py-1.5 bg-white border border-amber-300 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
                >
                  + 4 sesiones semanales (160 EUR)
                </button>
                <button
                  @click="agregarPlantillaPredefinida('8 sesiones quincenales', 8, 380, 'quincenal')"
                  class="px-3 py-1.5 bg-white border border-amber-300 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
                >
                  + 8 sesiones quincenales (380 EUR)
                </button>
                <button
                  @click="agregarPlantillaPredefinida('10 sesiones', 10, 500, 'cualquiera')"
                  class="px-3 py-1.5 bg-white border border-amber-300 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
                >
                  + 10 sesiones flex (500 EUR)
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Seccion: Bonos Predefinidos (legacy) -->
        <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Tipos de Bono Estandar</h2>
              <p class="text-sm text-gray-500">Configuracion de bonos por tipo de frecuencia</p>
            </div>
          </div>

          <div class="p-6 space-y-4">
            <!-- Bono Semanal -->
            <div class="border border-blue-200 rounded-lg p-4 bg-blue-50/50">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span class="font-semibold text-blue-900">Bono Semanal</span>
                  <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {{ config.configuracion_bonos.semanal.sesiones }} sesiones
                  </span>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-blue-700 mb-1">Sesiones</label>
                  <input
                    v-model.number="config.configuracion_bonos.semanal.sesiones"
                    type="number"
                    min="1"
                    max="10"
                    class="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blue-700 mb-1">Precio (EUR)</label>
                  <input
                    v-model.number="config.configuracion_bonos.semanal.precio"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <p class="mt-2 text-xs text-blue-600">
                {{ formatearPrecio(config.configuracion_bonos.semanal.precio / config.configuracion_bonos.semanal.sesiones) }} EUR/sesion
              </p>
            </div>

            <!-- Bono Quincenal -->
            <div class="border border-green-200 rounded-lg p-4 bg-green-50/50">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-green-500"></span>
                  <span class="font-semibold text-green-900">Bono Quincenal</span>
                  <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                    {{ config.configuracion_bonos.quincenal.sesiones }} sesiones
                  </span>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-green-700 mb-1">Sesiones</label>
                  <input
                    v-model.number="config.configuracion_bonos.quincenal.sesiones"
                    type="number"
                    min="1"
                    max="10"
                    class="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-green-700 mb-1">Precio (EUR)</label>
                  <input
                    v-model.number="config.configuracion_bonos.quincenal.precio"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <p class="mt-2 text-xs text-green-600">
                {{ formatearPrecio(config.configuracion_bonos.quincenal.precio / config.configuracion_bonos.quincenal.sesiones) }} EUR/sesion
              </p>
            </div>

            <!-- Bono Mensual -->
            <div class="border border-purple-200 rounded-lg p-4 bg-purple-50/50">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-purple-500"></span>
                  <span class="font-semibold text-purple-900">Bono Mensual</span>
                  <span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                    {{ config.configuracion_bonos.mensual.sesiones }} sesiones
                  </span>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-purple-700 mb-1">Sesiones</label>
                  <input
                    v-model.number="config.configuracion_bonos.mensual.sesiones"
                    type="number"
                    min="1"
                    max="20"
                    class="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-purple-700 mb-1">Precio (EUR)</label>
                  <input
                    v-model.number="config.configuracion_bonos.mensual.precio"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <p class="mt-2 text-xs text-purple-600">
                {{ formatearPrecio(config.configuracion_bonos.mensual.precio / config.configuracion_bonos.mensual.sesiones) }} EUR/sesion
              </p>
            </div>
          </div>
        </section>

        <!-- Boton Guardar -->
        <div class="flex items-center justify-between pt-4">
          <p v-if="ultimaActualizacion" class="text-sm text-gray-500">
            Ultima actualizacion: {{ ultimaActualizacion }}
          </p>
          <div class="flex items-center gap-3">
            <span v-if="guardadoExitoso" class="text-sm text-emerald-600 flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Guardado
            </span>
            <button
              @click="guardarConfiguracion"
              :disabled="guardando"
              class="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="guardando" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
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

// Tipos
interface PlantillaBono {
  nombre: string
  sesiones: number
  precio: number
  frecuencia: 'semanal' | 'quincenal' | 'mensual' | 'cualquiera'
}

// Estado
const cargando = ref(true)
const guardando = ref(false)
const guardadoExitoso = ref(false)
const ultimaActualizacion = ref<string | null>(null)
const terapeutaId = ref<string | null>(null)

// Estado para datos fiscales
const guardandoFiscales = ref(false)
const fiscalesGuardados = ref(false)
const nifError = ref<string | null>(null)

// Datos fiscales del terapeuta
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

// Configuracion del terapeuta
const config = ref({
  precio_sesion_base: 50.00,
  duracion_sesion_minutos: 60,
  porcentaje_comision: 30.00,
  metodos_pago_aceptados: ['efectivo', 'transferencia', 'bizum'] as string[],
  // Nuevos precios por frecuencia
  precios_frecuencia: {
    semanal: 40.00,
    quincenal: 50.00,
    unica: 60.00
  },
  // Plantillas de bonos personalizadas
  plantillas_bonos: [] as PlantillaBono[],
  // Bonos estandar por tipo
  configuracion_bonos: {
    semanal: { sesiones: 4, precio: 160, descuento_porcentaje: 0 },
    quincenal: { sesiones: 4, precio: 200, descuento_porcentaje: 0 },
    mensual: { sesiones: 4, precio: 240, descuento_porcentaje: 0 }
  }
})

// Metodos de pago disponibles
const metodosDisponibles = [
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { value: 'bizum', label: 'Bizum', icon: '📱' },
  { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
  { value: 'paypal', label: 'PayPal', icon: '🅿️' },
  { value: 'otro', label: 'Otro', icon: '📋' }
]

// Funciones de utilidad
const formatearPrecio = (precio: number) => {
  if (!precio || isNaN(precio)) return '0.00'
  return precio.toFixed(2)
}

const calcularIngresoNeto = (precioBase: number) => {
  if (!precioBase || isNaN(precioBase)) return 0
  return precioBase * (1 - config.value.porcentaje_comision / 100)
}

// Funciones para plantillas de bonos
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
  // Verificar si ya existe
  const existe = config.value.plantillas_bonos.some(p => p.nombre === nombre)
  if (!existe) {
    config.value.plantillas_bonos.push({ nombre, sesiones, precio, frecuencia })
  }
}

// Validar NIF/DNI/NIE español
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

  // DNI: 8 números + letra
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

  // NIE: X/Y/Z + 7 números + letra
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
  if (nieRegex.test(nif)) {
    let numeroStr = nif.substring(1, 8)
    if (nif[0] === 'X') numeroStr = '0' + numeroStr
    else if (nif[0] === 'Y') numeroStr = '1' + numeroStr
    else if (nif[0] === 'Z') numeroStr = '2' + numeroStr

    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE'
    const numero = parseInt(numeroStr)
    const letraCalculada = letras[numero % 23]
    if (nif[8] !== letraCalculada) {
      nifError.value = 'La letra del NIE no es correcta'
      return false
    }
    nifError.value = null
    return true
  }

  // CIF: Letra + 7 números + control
  const cifRegex = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[A-J0-9]$/
  if (cifRegex.test(nif)) {
    nifError.value = null
    return true
  }

  nifError.value = 'Formato de NIF/DNI/NIE no valido'
  return false
}

// Guardar datos fiscales
async function guardarDatosFiscales() {
  if (!terapeutaId.value) {
    alert('Error: No se pudo identificar el terapeuta')
    return
  }

  // Validar NIF si hay algo escrito
  if (datosFiscales.value.nif && !validarNIF()) {
    return
  }

  try {
    guardandoFiscales.value = true
    fiscalesGuardados.value = false

    const { error } = await supabase
      .from('terapeutas')
      .update({
        datos_fiscales: {
          nif: datosFiscales.value.nif.toUpperCase().replace(/[^A-Z0-9]/g, ''),
          razon_social: datosFiscales.value.razon_social,
          direccion: datosFiscales.value.direccion,
          codigo_postal: datosFiscales.value.codigo_postal,
          ciudad: datosFiscales.value.ciudad,
          provincia: datosFiscales.value.provincia,
          regimen_iva: datosFiscales.value.regimen_iva,
          numero_colegiado: datosFiscales.value.numero_colegiado
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', terapeutaId.value)

    if (error) throw error

    fiscalesGuardados.value = true

    // Ocultar mensaje despues de 3 segundos
    setTimeout(() => {
      fiscalesGuardados.value = false
    }, 3000)
  } catch (error: any) {
    console.error('Error al guardar datos fiscales:', error)
    alert(`Error al guardar: ${error.message}`)
  } finally {
    guardandoFiscales.value = false
  }
}

// Cargar configuracion
async function cargarConfiguracion() {
  try {
    cargando.value = true

    if (!user.value?.email) {
      console.warn('No hay usuario logueado')
      return
    }

    // Obtener terapeuta por email
    const { data: terapeutaData, error: terapeutaError } = await supabase
      .from('terapeutas')
      .select('id, precio_sesion_base, duracion_sesion_minutos, porcentaje_comision, metodos_pago_aceptados, configuracion_bonos, precios_frecuencia, plantillas_bonos, datos_fiscales, updated_at')
      .eq('email', user.value.email)
      .single()

    if (terapeutaError) {
      console.error('Error al cargar terapeuta:', terapeutaError)
      if (terapeutaError.code === 'PGRST116') {
        console.log('Terapeuta no encontrado, usando valores por defecto')
      }
      return
    }

    if (terapeutaData) {
      terapeutaId.value = terapeutaData.id

      // Actualizar configuracion con datos de la BD
      if (terapeutaData.precio_sesion_base !== null) {
        config.value.precio_sesion_base = terapeutaData.precio_sesion_base
      }
      if (terapeutaData.duracion_sesion_minutos !== null) {
        config.value.duracion_sesion_minutos = terapeutaData.duracion_sesion_minutos
      }
      if (terapeutaData.porcentaje_comision !== null) {
        config.value.porcentaje_comision = terapeutaData.porcentaje_comision
      }
      if (terapeutaData.metodos_pago_aceptados) {
        config.value.metodos_pago_aceptados = terapeutaData.metodos_pago_aceptados
      }
      if (terapeutaData.configuracion_bonos) {
        config.value.configuracion_bonos = {
          ...config.value.configuracion_bonos,
          ...terapeutaData.configuracion_bonos
        }
      }
      if (terapeutaData.precios_frecuencia) {
        config.value.precios_frecuencia = {
          ...config.value.precios_frecuencia,
          ...terapeutaData.precios_frecuencia
        }
      }
      if (terapeutaData.plantillas_bonos) {
        config.value.plantillas_bonos = terapeutaData.plantillas_bonos
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
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }
  } catch (error) {
    console.error('Error al cargar configuracion:', error)
  } finally {
    cargando.value = false
  }
}

// Guardar configuracion
async function guardarConfiguracion() {
  if (!terapeutaId.value) {
    alert('Error: No se pudo identificar el terapeuta')
    return
  }

  try {
    guardando.value = true
    guardadoExitoso.value = false

    // Recalcular descuentos basados en precios
    const precioSemanal = config.value.precios_frecuencia.semanal
    const precioQuincenal = config.value.precios_frecuencia.quincenal

    config.value.configuracion_bonos.semanal.descuento_porcentaje = Math.round(
      ((precioSemanal * config.value.configuracion_bonos.semanal.sesiones - config.value.configuracion_bonos.semanal.precio) /
        (precioSemanal * config.value.configuracion_bonos.semanal.sesiones)) * 100
    )
    config.value.configuracion_bonos.quincenal.descuento_porcentaje = Math.round(
      ((precioQuincenal * config.value.configuracion_bonos.quincenal.sesiones - config.value.configuracion_bonos.quincenal.precio) /
        (precioQuincenal * config.value.configuracion_bonos.quincenal.sesiones)) * 100
    )

    const { error } = await supabase
      .from('terapeutas')
      .update({
        precio_sesion_base: config.value.precio_sesion_base,
        duracion_sesion_minutos: config.value.duracion_sesion_minutos,
        metodos_pago_aceptados: config.value.metodos_pago_aceptados,
        configuracion_bonos: config.value.configuracion_bonos,
        precios_frecuencia: config.value.precios_frecuencia,
        plantillas_bonos: config.value.plantillas_bonos,
        updated_at: new Date().toISOString()
      })
      .eq('id', terapeutaId.value)

    if (error) throw error

    guardadoExitoso.value = true
    ultimaActualizacion.value = new Date().toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Ocultar mensaje de exito despues de 3 segundos
    setTimeout(() => {
      guardadoExitoso.value = false
    }, 3000)
  } catch (error: any) {
    console.error('Error al guardar configuracion:', error)
    alert(`Error al guardar: ${error.message}`)
  } finally {
    guardando.value = false
  }
}

// Cargar datos al montar
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
