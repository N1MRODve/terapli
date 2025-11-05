import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { u as useNotificaciones } from './useNotificaciones-BrQVNIqm.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './server.mjs';
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
  __name: "notificaciones",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      notificaciones: notificaciones2,
      totalNoVistas,
      noLeidas,
      urgentes
    } = useNotificaciones();
    const cargando = ref(false);
    const filtroActivo = ref("no-leidas");
    const notificacionesFiltradas = computed(() => {
      if (filtroActivo.value === "no-leidas") return noLeidas.value;
      if (filtroActivo.value === "urgentes") return urgentes.value;
      return notificaciones2.value;
    });
    const formatearFechaCompleta = (fecha) => {
      return new Date(fecha).toLocaleString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const getIconoTipo = (tipo) => {
      const iconos = {
        bono: "\u{1F4B3}",
        cita: "\u{1F4C5}",
        pago: "\u{1F4B0}",
        sistema: "\u2699\uFE0F",
        alerta: "\u26A0\uFE0F"
      };
      return iconos[tipo] || "\u{1F514}";
    };
    const getColorUrgencia = (urgencia) => {
      if (urgencia === "alta") return "bg-red-100 border-l-red-500 text-red-900";
      if (urgencia === "media") return "bg-orange-100 border-l-orange-500 text-orange-900";
      return "bg-blue-100 border-l-blue-500 text-blue-900";
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50 py-8" }, _attrs))} data-v-7459c3a8><div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" data-v-7459c3a8><div class="mb-8" data-v-7459c3a8><div class="flex items-center justify-between" data-v-7459c3a8><div data-v-7459c3a8><h1 class="text-3xl font-bold text-gray-900" data-v-7459c3a8>\u{1F514} Notificaciones</h1><p class="mt-2 text-sm text-gray-600" data-v-7459c3a8> Mantente al d\xEDa con las alertas del sistema </p></div><div class="flex gap-2" data-v-7459c3a8>`);
      if (unref(totalNoVistas) > 0) {
        _push(`<button class="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors" type="button" data-v-7459c3a8> \u2713 Marcar todas como le\xEDdas </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" type="button" data-v-7459c3a8> \u{1F5D1}\uFE0F Eliminar le\xEDdas </button></div></div><div class="mt-6 grid grid-cols-3 gap-4" data-v-7459c3a8><div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm" data-v-7459c3a8><div class="flex items-center gap-3" data-v-7459c3a8><div class="p-3 bg-purple-100 rounded-full" data-v-7459c3a8><svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20" data-v-7459c3a8><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" data-v-7459c3a8></path></svg></div><div data-v-7459c3a8><p class="text-sm text-gray-600" data-v-7459c3a8>Total</p><p class="text-2xl font-bold text-gray-900" data-v-7459c3a8>${ssrInterpolate(unref(notificaciones2).length)}</p></div></div></div><div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm" data-v-7459c3a8><div class="flex items-center gap-3" data-v-7459c3a8><div class="p-3 bg-blue-100 rounded-full" data-v-7459c3a8><svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" data-v-7459c3a8><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" data-v-7459c3a8></path></svg></div><div data-v-7459c3a8><p class="text-sm text-gray-600" data-v-7459c3a8>No le\xEDdas</p><p class="text-2xl font-bold text-blue-600" data-v-7459c3a8>${ssrInterpolate(unref(totalNoVistas))}</p></div></div></div><div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm" data-v-7459c3a8><div class="flex items-center gap-3" data-v-7459c3a8><div class="p-3 bg-red-100 rounded-full" data-v-7459c3a8><svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20" data-v-7459c3a8><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" data-v-7459c3a8></path></svg></div><div data-v-7459c3a8><p class="text-sm text-gray-600" data-v-7459c3a8>Urgentes</p><p class="text-2xl font-bold text-red-600" data-v-7459c3a8>${ssrInterpolate(unref(urgentes).length)}</p></div></div></div></div></div><div class="mb-6 flex gap-2" data-v-7459c3a8><button class="${ssrRenderClass([filtroActivo.value === "no-leidas" ? "bg-purple-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200", "px-4 py-2 text-sm font-medium rounded-lg transition-colors"])}" type="button" data-v-7459c3a8> No le\xEDdas (${ssrInterpolate(unref(totalNoVistas))}) </button><button class="${ssrRenderClass([filtroActivo.value === "urgentes" ? "bg-red-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200", "px-4 py-2 text-sm font-medium rounded-lg transition-colors"])}" type="button" data-v-7459c3a8> Urgentes (${ssrInterpolate(unref(urgentes).length)}) </button><button class="${ssrRenderClass([filtroActivo.value === "todas" ? "bg-purple-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200", "px-4 py-2 text-sm font-medium rounded-lg transition-colors"])}" type="button" data-v-7459c3a8> Todas (${ssrInterpolate(unref(notificaciones2).length)}) </button></div>`);
      if (cargando.value) {
        _push(`<div class="flex items-center justify-center py-12" data-v-7459c3a8><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" data-v-7459c3a8></div></div>`);
      } else if (notificacionesFiltradas.value.length > 0) {
        _push(`<div class="space-y-3" data-v-7459c3a8><!--[-->`);
        ssrRenderList(notificacionesFiltradas.value, (notif) => {
          var _a, _b, _c;
          _push(`<div class="${ssrRenderClass([[
            !notif.leido ? "border-l-purple-500 bg-purple-50/30" : "border-l-gray-300",
            getColorUrgencia((_a = notif.metadata) == null ? void 0 : _a.urgencia)
          ], "bg-white rounded-lg border-l-4 shadow-sm overflow-hidden transition-all hover:shadow-md"])}" data-v-7459c3a8><div class="p-5" data-v-7459c3a8><div class="flex items-start gap-4" data-v-7459c3a8><div class="flex-shrink-0 text-3xl mt-1" data-v-7459c3a8>${ssrInterpolate(getIconoTipo(notif.tipo))}</div><div class="flex-1 min-w-0" data-v-7459c3a8><div class="flex items-start justify-between gap-4" data-v-7459c3a8><div class="flex-1" data-v-7459c3a8><h3 class="text-lg font-semibold text-gray-900" data-v-7459c3a8>${ssrInterpolate(notif.titulo)}</h3><p class="mt-2 text-sm text-gray-700 leading-relaxed" data-v-7459c3a8>${ssrInterpolate(notif.mensaje)}</p><div class="mt-3 flex flex-wrap items-center gap-2" data-v-7459c3a8><span class="text-xs text-gray-500" data-v-7459c3a8>${ssrInterpolate(formatearFechaCompleta(notif.created_at))}</span><span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium" data-v-7459c3a8>${ssrInterpolate(notif.tipo.toUpperCase())}</span>`);
          if ((_b = notif.metadata) == null ? void 0 : _b.urgencia) {
            _push(`<span class="${ssrRenderClass([{
              "bg-red-100 text-red-700": notif.metadata.urgencia === "alta",
              "bg-orange-100 text-orange-700": notif.metadata.urgencia === "media",
              "bg-blue-100 text-blue-700": notif.metadata.urgencia === "baja"
            }, "text-xs px-2 py-1 rounded-full font-medium"])}" data-v-7459c3a8>${ssrInterpolate(notif.metadata.urgencia.toUpperCase())}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (notif.tipo === "bono" && ((_c = notif.metadata) == null ? void 0 : _c.sesiones_restantes) !== void 0) {
            _push(`<span class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium" data-v-7459c3a8>${ssrInterpolate(notif.metadata.sesiones_restantes)}/${ssrInterpolate(notif.metadata.sesiones_totales)} sesiones </span>`);
          } else {
            _push(`<!---->`);
          }
          if (notif.leido) {
            _push(`<span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium" data-v-7459c3a8> \u2713 Le\xEDda </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="flex-shrink-0 flex gap-2" data-v-7459c3a8>`);
          if (!notif.leido) {
            _push(`<button class="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors" type="button" title="Marcar como le\xEDda" data-v-7459c3a8><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" data-v-7459c3a8><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" data-v-7459c3a8></path></svg></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" type="button" title="Eliminar" data-v-7459c3a8><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" data-v-7459c3a8><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" data-v-7459c3a8></path></svg></button></div></div></div></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center" data-v-7459c3a8><svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-7459c3a8><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-v-7459c3a8></path></svg><h3 class="mt-4 text-lg font-medium text-gray-900" data-v-7459c3a8>No hay notificaciones</h3><p class="mt-2 text-sm text-gray-600" data-v-7459c3a8>${ssrInterpolate(filtroActivo.value === "todas" ? "No tienes ninguna notificaci\xF3n" : filtroActivo.value === "urgentes" ? "No hay notificaciones urgentes" : "Todas tus notificaciones est\xE1n le\xEDdas")}</p></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinadora/notificaciones.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const notificaciones = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7459c3a8"]]);

export { notificaciones as default };
//# sourceMappingURL=notificaciones-CdB-4r9O.mjs.map
