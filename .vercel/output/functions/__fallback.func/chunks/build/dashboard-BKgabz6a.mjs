import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderClass } from 'vue/server-renderer';
import { CalendarDaysIcon, CheckCircleIcon, CurrencyDollarIcon, BellAlertIcon, ClockIcon, ExclamationTriangleIcon, ArrowRightIcon, UserGroupIcon, TicketIcon } from '@heroicons/vue/24/outline';
import { g as useSupabaseClient } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';
import 'vue-router';
import '@supabase/ssr';
import '@vercel/analytics/nuxt';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dashboard",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    const cargando = ref(true);
    const citasHoy = ref(0);
    const citasConfirmadas = ref(0);
    const citasPendientes = ref(0);
    const totalPacientes = ref(0);
    const pagosPendientes = ref(0);
    const totalPendiente = ref(0);
    const bonosActivos = ref(0);
    const citasPorConfirmar4h = ref([]);
    const citasPorConfirmar24h = ref([]);
    const fechaFormateada = computed(
      () => (/* @__PURE__ */ new Date()).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    );
    const formatNumber = (num) => {
      return num.toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };
    const tieneAccionesUrgentes = computed(
      () => citasPorConfirmar4h.value.length > 0 || citasPorConfirmar24h.value.length > 0 || pagosPendientes.value > 0
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50 p-4 sm:p-6" }, _attrs))}><div class="max-w-7xl mx-auto"><div class="mb-6"><h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1"> \xA1Bienvenida! \u{1F44B} </h1><p class="text-sm text-gray-600">${ssrInterpolate(fechaFormateada.value)}</p></div>`);
      if (cargando.value) {
        _push(`<div class="flex items-center justify-center py-20"><div class="text-center"><div class="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div><p class="text-gray-600 text-sm">Cargando informaci\xF3n...</p></div></div>`);
      } else {
        _push(`<!--[--><section aria-label="Accesos r\xE1pidos" class="mb-6"><div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><button class="bg-white border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200 text-left group" aria-label="Ir a la agenda"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">`);
        _push(ssrRenderComponent(unref(CalendarDaysIcon), {
          class: "w-5 h-5 text-blue-600",
          "aria-hidden": "true"
        }, null, _parent));
        _push(`</div><div><h3 class="text-sm font-semibold text-gray-900">Agenda</h3><p class="text-xs text-gray-500">Gestionar citas</p></div></div></button><button class="bg-white border-2 border-emerald-200 rounded-lg p-4 hover:border-emerald-400 hover:shadow-md transition-all duration-200 text-left group" aria-label="Ir a confirmaciones"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">`);
        _push(ssrRenderComponent(unref(CheckCircleIcon), {
          class: "w-5 h-5 text-emerald-600",
          "aria-hidden": "true"
        }, null, _parent));
        _push(`</div><div><h3 class="text-sm font-semibold text-gray-900">Confirmaciones</h3><p class="text-xs text-gray-500">Confirmar citas</p></div></div></button><button class="bg-white border-2 border-purple-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all duration-200 text-left group" aria-label="Ir a pagos"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">`);
        _push(ssrRenderComponent(unref(CurrencyDollarIcon), {
          class: "w-5 h-5 text-purple-600",
          "aria-hidden": "true"
        }, null, _parent));
        _push(`</div><div><h3 class="text-sm font-semibold text-gray-900">Pagos</h3><p class="text-xs text-gray-500">Gestionar pagos</p></div></div></button></div></section><section aria-label="Panel de control" class="mb-6"><h2 class="text-lg font-bold text-gray-900 mb-3">Panel de Control</h2>`);
        if (!tieneAccionesUrgentes.value) {
          _push(`<div class="bg-white border border-gray-200 rounded-lg p-6 text-center"><div class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">`);
          _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-6 h-6 text-emerald-600" }, null, _parent));
          _push(`</div><h3 class="text-base font-semibold text-gray-900 mb-1">\xA1Todo al d\xEDa!</h3><p class="text-sm text-gray-600"> No tienes acciones urgentes pendientes. </p></div>`);
        } else {
          _push(`<div class="grid grid-cols-1 md:grid-cols-3 gap-4">`);
          if (citasPorConfirmar4h.value.length > 0) {
            _push(`<div class="bg-white border-2 border-red-200 rounded-lg p-4 cursor-pointer hover:border-red-400 hover:shadow-md transition-all duration-200" role="button" aria-label="Ver citas urgentes en menos de 4 horas" tabindex="0"><div class="flex items-start justify-between mb-3"><div class="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">`);
            _push(ssrRenderComponent(unref(BellAlertIcon), {
              class: "w-5 h-5 text-red-600",
              "aria-hidden": "true"
            }, null, _parent));
            _push(`</div><span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">URGENTE</span></div><h3 class="text-2xl font-bold text-gray-900 mb-1">${ssrInterpolate(citasPorConfirmar4h.value.length)}</h3><p class="text-sm text-gray-700 font-medium mb-2">Citas en menos de 4 horas</p><div class="flex items-center gap-1 text-xs text-gray-500">`);
            _push(ssrRenderComponent(unref(ClockIcon), {
              class: "w-3.5 h-3.5",
              "aria-hidden": "true"
            }, null, _parent));
            _push(`<span>Confirmar ahora</span></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (citasPorConfirmar24h.value.length > 0) {
            _push(`<div class="bg-white border-2 border-orange-200 rounded-lg p-4 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all duration-200" role="button" aria-label="Ver citas en las pr\xF3ximas 24 horas" tabindex="0"><div class="flex items-start justify-between mb-3"><div class="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">`);
            _push(ssrRenderComponent(unref(ExclamationTriangleIcon), {
              class: "w-5 h-5 text-orange-600",
              "aria-hidden": "true"
            }, null, _parent));
            _push(`</div><span class="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">HOY</span></div><h3 class="text-2xl font-bold text-gray-900 mb-1">${ssrInterpolate(citasPorConfirmar24h.value.length)}</h3><p class="text-sm text-gray-700 font-medium mb-2">Citas en 24 horas</p><div class="flex items-center gap-1 text-xs text-gray-500">`);
            _push(ssrRenderComponent(unref(ClockIcon), {
              class: "w-3.5 h-3.5",
              "aria-hidden": "true"
            }, null, _parent));
            _push(`<span>Confirmar hoy</span></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (pagosPendientes.value > 0) {
            _push(`<div class="bg-white border-2 border-purple-200 rounded-lg p-4 cursor-pointer hover:border-purple-400 hover:shadow-md transition-all duration-200" role="button" aria-label="Ver pagos pendientes de confirmaci\xF3n" tabindex="0"><div class="flex items-start justify-between mb-3"><div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">`);
            _push(ssrRenderComponent(unref(CurrencyDollarIcon), {
              class: "w-5 h-5 text-purple-600",
              "aria-hidden": "true"
            }, null, _parent));
            _push(`</div><span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">PAGOS</span></div><h3 class="text-2xl font-bold text-gray-900 mb-1">${ssrInterpolate(pagosPendientes.value)}</h3><p class="text-sm text-gray-700 font-medium mb-2">Pagos por confirmar</p><div class="text-xs text-gray-500 font-mono">${ssrInterpolate(formatNumber(totalPendiente.value))}</div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        _push(`</section><section aria-label="Vista r\xE1pida del d\xEDa"><h2 class="text-lg font-bold text-gray-900 mb-3">Vista R\xE1pida del D\xEDa</h2><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><button class="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group" aria-label="Ver agenda de citas de hoy"><div class="flex items-center justify-between mb-3"><div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">`);
        _push(ssrRenderComponent(unref(CalendarDaysIcon), {
          class: "w-5 h-5 text-blue-600",
          "aria-hidden": "true"
        }, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(unref(ArrowRightIcon), {
          class: "w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors",
          "aria-hidden": "true"
        }, null, _parent));
        _push(`</div><h3 class="text-2xl font-bold text-gray-900 mb-1">${ssrInterpolate(citasHoy.value)}</h3><p class="text-sm text-gray-600 font-medium mb-2">Citas hoy</p><span class="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold">${ssrInterpolate(citasConfirmadas.value)} confirmadas </span></button><button class="bg-white border border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-md transition-all duration-200 text-left group" aria-label="Ver citas sin confirmar"><div class="flex items-center justify-between mb-3"><div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">`);
        _push(ssrRenderComponent(unref(ClockIcon), {
          class: "w-5 h-5 text-amber-600",
          "aria-hidden": "true"
        }, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(unref(ArrowRightIcon), {
          class: "w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors",
          "aria-hidden": "true"
        }, null, _parent));
        _push(`</div><h3 class="text-2xl font-bold text-gray-900 mb-1">${ssrInterpolate(citasPendientes.value)}</h3><p class="text-sm text-gray-600 font-medium mb-2">Sin confirmar</p><span class="${ssrRenderClass([citasPendientes.value > 0 ? "text-amber-600" : "text-emerald-600", "text-xs font-semibold"])}">${ssrInterpolate(citasPendientes.value > 0 ? "Requiere seguimiento" : "\u2713 Todo confirmado")}</span></button><button class="bg-white border border-gray-200 rounded-lg p-4 hover:border-emerald-300 hover:shadow-md transition-all duration-200 text-left group" aria-label="Ver lista de pacientes"><div class="flex items-center justify-between mb-3"><div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">`);
        _push(ssrRenderComponent(unref(UserGroupIcon), {
          class: "w-5 h-5 text-emerald-600",
          "aria-hidden": "true"
        }, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(unref(ArrowRightIcon), {
          class: "w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors",
          "aria-hidden": "true"
        }, null, _parent));
        _push(`</div><h3 class="text-2xl font-bold text-gray-900 mb-1">${ssrInterpolate(totalPacientes.value)}</h3><p class="text-sm text-gray-600 font-medium mb-2">Pacientes</p><span class="text-xs text-gray-500">En seguimiento</span></button><button class="bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left group" aria-label="Ver bonos activos"><div class="flex items-center justify-between mb-3"><div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">`);
        _push(ssrRenderComponent(unref(TicketIcon), {
          class: "w-5 h-5 text-purple-600",
          "aria-hidden": "true"
        }, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(unref(ArrowRightIcon), {
          class: "w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors",
          "aria-hidden": "true"
        }, null, _parent));
        _push(`</div><h3 class="text-2xl font-bold text-gray-900 mb-1">${ssrInterpolate(bonosActivos.value)}</h3><p class="text-sm text-gray-600 font-medium mb-2">Bonos activos</p><span class="text-xs text-gray-500">Con sesiones</span></button></div></section><!--]-->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinadora/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=dashboard-BKgabz6a.mjs.map
