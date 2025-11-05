import { defineComponent, ref, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { PlusIcon, CheckCircleIcon, UsersIcon, XMarkIcon } from '@heroicons/vue/24/outline';
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
  __name: "terapeutas",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    const cargando = ref(true);
    const mostrarModalCrear = ref(false);
    const creando = ref(false);
    const error = ref("");
    const success = ref("");
    const terapeutas = ref([]);
    const formData = ref({
      nombreCompleto: "",
      email: "",
      password: "",
      telefono: ""
    });
    const formatNumber = (num) => {
      if (num === void 0 || num === null || isNaN(num)) {
        return "\u20AC0,00";
      }
      return num.toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="mb-8 flex items-center justify-between"><div><h2 class="text-3xl font-bold text-gray-900 mb-2">Gesti\xF3n de Terapeutas</h2><p class="text-gray-600">Administrar terapeutas y crear nuevos usuarios</p></div><button class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors">`);
      _push(ssrRenderComponent(unref(PlusIcon), { class: "w-5 h-5" }, null, _parent));
      _push(`<span>Nueva Terapeuta</span></button></div>`);
      if (cargando.value) {
        _push(`<div class="flex items-center justify-center py-24"><div class="text-center"><div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div><p class="text-gray-600 font-medium">Cargando terapeutas...</p></div></div>`);
      } else {
        _push(`<div class="space-y-6"><!--[-->`);
        ssrRenderList(terapeutas.value, (terapeuta) => {
          _push(`<div class="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"><div class="flex items-start justify-between"><div class="flex items-center gap-4"><div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">${ssrInterpolate(terapeuta.iniciales)}</div><div><h3 class="text-xl font-bold text-gray-900">${ssrInterpolate(terapeuta.nombre)}</h3><p class="text-gray-600">${ssrInterpolate(terapeuta.email)}</p><div class="flex items-center gap-2 mt-2"><span class="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">`);
          _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-3 h-3" }, null, _parent));
          _push(` Activa </span></div></div></div><div class="grid grid-cols-4 gap-4"><div class="text-center"><div class="text-2xl font-bold text-gray-900">${ssrInterpolate(terapeuta.totalPacientes)}</div><div class="text-sm text-gray-600">Pacientes</div></div><div class="text-center"><div class="text-2xl font-bold text-emerald-600">${ssrInterpolate(terapeuta.citasRealizadas)}</div><div class="text-sm text-gray-600">Citas realizadas</div></div><div class="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200"><div class="text-lg font-bold text-blue-900">${ssrInterpolate(formatNumber(terapeuta.revenueTerapeuta))}</div><div class="text-xs text-blue-700 font-medium">Terapeuta (70%)</div></div><div class="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200"><div class="text-lg font-bold text-purple-900">${ssrInterpolate(formatNumber(terapeuta.revenueAdmin))}</div><div class="text-xs text-purple-700 font-medium">Comisi\xF3n (30%)</div></div></div></div><div class="mt-4 pt-4 border-t border-gray-200"><div class="grid grid-cols-5 gap-4 text-sm"><div><span class="text-gray-600">Revenue total:</span><span class="ml-2 font-semibold text-indigo-600">${ssrInterpolate(formatNumber(terapeuta.revenue))}</span></div><div><span class="text-gray-600">Pacientes activos:</span><span class="ml-2 font-semibold text-gray-900">${ssrInterpolate(terapeuta.pacientesActivos)}</span></div><div><span class="text-gray-600">Ocupaci\xF3n:</span><span class="ml-2 font-semibold text-gray-900">${ssrInterpolate(terapeuta.ocupacion)}%</span></div><div><span class="text-gray-600">CLTV promedio:</span><span class="ml-2 font-semibold text-indigo-600">${ssrInterpolate(formatNumber(terapeuta.cltvPromedio))}</span></div><div><span class="text-gray-600">Miembro desde:</span><span class="ml-2 font-semibold text-gray-900">${ssrInterpolate(formatDate(terapeuta.createdAt))}</span></div></div></div></div>`);
        });
        _push(`<!--]-->`);
        if (terapeutas.value.length === 0) {
          _push(`<div class="text-center py-12"><div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">`);
          _push(ssrRenderComponent(unref(UsersIcon), { class: "w-8 h-8 text-gray-400" }, null, _parent));
          _push(`</div><p class="text-gray-600 mb-4">No hay terapeutas registradas</p><button class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">`);
          _push(ssrRenderComponent(unref(PlusIcon), { class: "w-5 h-5" }, null, _parent));
          _push(`<span>Crear primera terapeuta</span></button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (mostrarModalCrear.value) {
          _push2(`<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"><div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"><div class="flex items-center justify-between mb-6"><h3 class="text-2xl font-bold text-gray-900">Nueva Terapeuta</h3><button class="text-gray-400 hover:text-gray-600 transition-colors">`);
          _push2(ssrRenderComponent(unref(XMarkIcon), { class: "w-6 h-6" }, null, _parent));
          _push2(`</button></div><form class="space-y-4"><div><label class="block text-sm font-semibold text-gray-700 mb-2"> Nombre completo </label><input${ssrRenderAttr("value", formData.value.nombreCompleto)} type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ej: Mar\xEDa Garc\xEDa L\xF3pez"></div><div><label class="block text-sm font-semibold text-gray-700 mb-2"> Email </label><input${ssrRenderAttr("value", formData.value.email)} type="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="maria@example.com"></div><div><label class="block text-sm font-semibold text-gray-700 mb-2"> Contrase\xF1a temporal </label><input${ssrRenderAttr("value", formData.value.password)} type="password" required minlength="8" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="M\xEDnimo 8 caracteres"><p class="text-xs text-gray-500 mt-1"> La terapeuta deber\xE1 cambiar esta contrase\xF1a en su primer acceso </p></div><div><label class="block text-sm font-semibold text-gray-700 mb-2"> Tel\xE9fono </label><input${ssrRenderAttr("value", formData.value.telefono)} type="tel" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="+52 123 456 7890"></div>`);
          if (error.value) {
            _push2(`<div class="p-4 bg-red-50 border border-red-200 rounded-lg"><p class="text-sm text-red-700">${ssrInterpolate(error.value)}</p></div>`);
          } else {
            _push2(`<!---->`);
          }
          if (success.value) {
            _push2(`<div class="p-4 bg-emerald-50 border border-emerald-200 rounded-lg"><p class="text-sm text-emerald-700">${ssrInterpolate(success.value)}</p></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex gap-3 pt-4"><button type="button" class="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"${ssrIncludeBooleanAttr(creando.value) ? " disabled" : ""}> Cancelar </button><button type="submit" class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"${ssrIncludeBooleanAttr(creando.value) ? " disabled" : ""}>`);
          if (!creando.value) {
            _push2(`<span>Crear Terapeuta</span>`);
          } else {
            _push2(`<span class="flex items-center justify-center gap-2"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creando... </span>`);
          }
          _push2(`</button></div></form></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/terapeutas.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=terapeutas-DGGm7CeC.mjs.map
