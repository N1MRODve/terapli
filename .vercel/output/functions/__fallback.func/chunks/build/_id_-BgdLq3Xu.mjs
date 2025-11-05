import { _ as __nuxt_component_0 } from './nuxt-link-CboeUkiO.mjs';
import { defineComponent, ref, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { h as useRoute } from './server.mjs';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import '@supabase/ssr';
import '@vercel/analytics/nuxt';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    useRoute();
    useSupabaseClient();
    const sesion = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const notas = ref("");
    const guardandoNotas = ref(false);
    const formatearFecha = (fecha) => {
      if (!fecha) return "Fecha no disponible";
      return new Date(fecha).toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    };
    const formatearHora = (fecha) => {
      if (!fecha) return "--:--";
      return new Date(fecha).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const formatearPrecio = (precio) => {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
      }).format(precio);
    };
    const getEstadoClase = (estado) => {
      const clases = {
        pendiente: "bg-yellow-100 text-yellow-700",
        confirmada: "bg-blue-100 text-blue-700",
        realizada: "bg-green-100 text-green-700",
        cancelada: "bg-red-100 text-red-700"
      };
      return clases[estado] || "bg-gray-100 text-gray-700";
    };
    const getEstadoTexto = (estado) => {
      const textos = {
        pendiente: "\u23F3 Pendiente",
        confirmada: "\u2713 Confirmada",
        realizada: "\u2713 Realizada",
        cancelada: "\u2715 Cancelada"
      };
      return textos[estado] || estado;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-f7095ca9><nav class="mb-6 flex items-center gap-2 text-sm text-[#5D4A44]/60" data-v-f7095ca9>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/dashboard",
        class: "hover:text-[#D8AFA0] transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Dashboard `);
          } else {
            return [
              createTextVNode(" Dashboard ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<span data-v-f7095ca9>/</span>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/sesiones",
        class: "hover:text-[#D8AFA0] transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Sesiones `);
          } else {
            return [
              createTextVNode(" Sesiones ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<span data-v-f7095ca9>/</span><span class="text-[#5D4A44]" data-v-f7095ca9>Detalle</span></nav>`);
      if (loading.value) {
        _push(`<div class="flex items-center justify-center py-20" data-v-f7095ca9><div class="text-center" data-v-f7095ca9><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#D8AFA0]" data-v-f7095ca9></div><p class="mt-4 text-[#5D4A44]/60" data-v-f7095ca9>Cargando sesi\xF3n...</p></div></div>`);
      } else if (error.value) {
        _push(`<div class="bg-red-50 border border-red-200 rounded-xl p-6" data-v-f7095ca9><h3 class="text-red-800 font-[&#39;Lora&#39;] text-lg mb-2" data-v-f7095ca9>Error al cargar la sesi\xF3n</h3><p class="text-red-600 text-sm" data-v-f7095ca9>${ssrInterpolate(error.value)}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/terapeuta/sesiones",
          class: "mt-4 inline-block text-red-700 hover:text-red-900 text-sm font-medium"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u2190 Volver a sesiones `);
            } else {
              return [
                createTextVNode(" \u2190 Volver a sesiones ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (sesion.value) {
        _push(`<div class="space-y-6" data-v-f7095ca9><div class="bg-white rounded-xl shadow-sm p-6 border border-[#EAD5D3]/40" data-v-f7095ca9><div class="flex items-start justify-between mb-4" data-v-f7095ca9><div data-v-f7095ca9><h1 class="text-3xl font-[&#39;Lora&#39;] text-[#5D4A44] mb-2" data-v-f7095ca9> Sesi\xF3n #${ssrInterpolate(sesion.value.id.slice(0, 8))}</h1><p class="text-[#5D4A44]/70" data-v-f7095ca9>${ssrInterpolate(formatearFecha(sesion.value.fecha))} a las ${ssrInterpolate(formatearHora(sesion.value.fecha))}</p></div><span class="${ssrRenderClass([getEstadoClase(sesion.value.estado), "px-4 py-2 rounded-full text-sm font-medium"])}" data-v-f7095ca9>${ssrInterpolate(getEstadoTexto(sesion.value.estado))}</span></div></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6" data-v-f7095ca9><div class="lg:col-span-2 space-y-6" data-v-f7095ca9><div class="bg-white rounded-xl shadow-sm p-6 border border-[#EAD5D3]/40" data-v-f7095ca9><h2 class="font-[&#39;Lora&#39;] text-xl text-[#5D4A44] mb-4 flex items-center gap-2" data-v-f7095ca9><span class="text-2xl" data-v-f7095ca9>\u{1F4CB}</span> Detalles de la Sesi\xF3n </h2><div class="grid grid-cols-2 gap-4 text-[#5D4A44]" data-v-f7095ca9><div data-v-f7095ca9><p class="text-sm text-[#5D4A44]/60 mb-1" data-v-f7095ca9>Paciente</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/terapeuta/pacientes/${sesion.value.paciente_id}`,
          class: "font-medium hover:text-[#D8AFA0] transition-colors flex items-center gap-1"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a, _b;
            if (_push2) {
              _push2(`${ssrInterpolate(((_a = sesion.value.pacientes) == null ? void 0 : _a.nombre) || "Sin nombre")} <span class="text-xs" data-v-f7095ca9${_scopeId}>\u2192</span>`);
            } else {
              return [
                createTextVNode(toDisplayString(((_b = sesion.value.pacientes) == null ? void 0 : _b.nombre) || "Sin nombre") + " ", 1),
                createVNode("span", { class: "text-xs" }, "\u2192")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div data-v-f7095ca9><p class="text-sm text-[#5D4A44]/60 mb-1" data-v-f7095ca9>Fecha</p><p class="font-medium" data-v-f7095ca9>${ssrInterpolate(formatearFecha(sesion.value.fecha))}</p></div><div data-v-f7095ca9><p class="text-sm text-[#5D4A44]/60 mb-1" data-v-f7095ca9>Hora</p><p class="font-medium" data-v-f7095ca9>${ssrInterpolate(formatearHora(sesion.value.fecha))}</p></div><div data-v-f7095ca9><p class="text-sm text-[#5D4A44]/60 mb-1" data-v-f7095ca9>Modalidad</p><span class="inline-flex items-center gap-1 px-3 py-1 bg-[#F9F7F3] rounded-full text-sm" data-v-f7095ca9><span data-v-f7095ca9>${ssrInterpolate(sesion.value.modalidad === "online" ? "\u{1F4BB}" : "\u{1F3E5}")}</span><span data-v-f7095ca9>${ssrInterpolate(sesion.value.modalidad === "online" ? "Online" : "Presencial")}</span></span></div><div data-v-f7095ca9><p class="text-sm text-[#5D4A44]/60 mb-1" data-v-f7095ca9>Duraci\xF3n</p><p class="font-medium" data-v-f7095ca9>${ssrInterpolate(sesion.value.duracion || 50)} minutos</p></div><div data-v-f7095ca9><p class="text-sm text-[#5D4A44]/60 mb-1" data-v-f7095ca9>Bono vinculado</p><p class="font-medium" data-v-f7095ca9>${ssrInterpolate(sesion.value.bono_id ? "S\xED" : "Sesi\xF3n individual")}</p></div></div></div><div class="bg-gradient-to-br from-[#D8AFA0]/10 to-[#EAD5D3]/20 rounded-xl shadow-sm p-6 border border-[#EAD5D3]/40" data-v-f7095ca9><h3 class="text-lg font-[&#39;Lora&#39;] text-[#5D4A44] mb-4 flex items-center gap-2" data-v-f7095ca9><span class="text-2xl" data-v-f7095ca9>\u{1F4B0}</span> Resumen Financiero </h3><div class="space-y-3" data-v-f7095ca9><div class="flex justify-between items-center" data-v-f7095ca9><span class="text-[#5D4A44]/70" data-v-f7095ca9>Precio total de la sesi\xF3n</span><span class="text-xl font-bold text-[#5D4A44]" data-v-f7095ca9>${ssrInterpolate(formatearPrecio(sesion.value.precio_total || 50))}</span></div><div class="border-t border-[#EAD5D3]/40 pt-3 space-y-2" data-v-f7095ca9><div class="flex justify-between items-center" data-v-f7095ca9><span class="text-[#5D4A44]/70" data-v-f7095ca9>Terapeuta (70%)</span><span class="text-lg font-semibold text-green-700" data-v-f7095ca9>${ssrInterpolate(formatearPrecio((sesion.value.precio_total || 50) * 0.7))}</span></div><div class="flex justify-between items-center" data-v-f7095ca9><span class="text-[#5D4A44]/70" data-v-f7095ca9>Consulta (30%)</span><span class="text-lg font-medium text-[#5D4A44]/80" data-v-f7095ca9>${ssrInterpolate(formatearPrecio((sesion.value.precio_total || 50) * 0.3))}</span></div></div><div class="border-t border-[#EAD5D3]/40 pt-3" data-v-f7095ca9><div class="flex justify-between items-center" data-v-f7095ca9><span class="text-[#5D4A44]/70" data-v-f7095ca9>Estado del pago</span><span class="${ssrRenderClass([sesion.value.pagado ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700", "px-3 py-1 rounded-full text-sm font-medium"])}" data-v-f7095ca9>${ssrInterpolate(sesion.value.pagado ? "\u2713 Pagado" : "\u23F3 Pendiente")}</span></div></div></div></div><div class="bg-white rounded-xl shadow-sm p-6 border border-[#EAD5D3]/40" data-v-f7095ca9><div class="flex items-center justify-between mb-4" data-v-f7095ca9><h3 class="text-lg font-[&#39;Lora&#39;] text-[#5D4A44] flex items-center gap-2" data-v-f7095ca9><span class="text-2xl" data-v-f7095ca9>\u{1F4DD}</span> Notas Privadas del Terapeuta </h3>`);
        if (guardandoNotas.value) {
          _push(`<span class="text-sm text-green-600 flex items-center gap-1" data-v-f7095ca9><svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-f7095ca9><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-f7095ca9></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-f7095ca9></path></svg> Guardando... </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><textarea class="w-full h-48 border border-[#EAD5D3] rounded-lg p-4 bg-[#F9F7F3] font-[&#39;Lato&#39;] text-[#5D4A44] focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent outline-none resize-none" placeholder="Anota observaciones, temas tratados, tareas asignadas, aspectos a trabajar en pr\xF3ximas sesiones..." data-v-f7095ca9>${ssrInterpolate(notas.value)}</textarea><div class="mt-3 flex items-center justify-between" data-v-f7095ca9><p class="text-xs text-[#5D4A44]/50" data-v-f7095ca9> Las notas se guardan autom\xE1ticamente. Solo t\xFA puedes verlas. </p><button class="px-4 py-2 bg-[#D8AFA0] hover:bg-[#C89B8A] text-white rounded-lg transition-colors text-sm font-medium" data-v-f7095ca9> Guardar ahora </button></div></div></div><div class="space-y-6" data-v-f7095ca9><div class="bg-white rounded-xl shadow-sm p-6 border border-[#EAD5D3]/40" data-v-f7095ca9><h3 class="font-[&#39;Lora&#39;] text-lg text-[#5D4A44] mb-4" data-v-f7095ca9>Acciones</h3><div class="space-y-3" data-v-f7095ca9>`);
        if (sesion.value.estado === "pendiente") {
          _push(`<button class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium" data-v-f7095ca9> \u2713 Confirmar Sesi\xF3n </button>`);
        } else {
          _push(`<!---->`);
        }
        if (sesion.value.estado === "confirmada") {
          _push(`<button class="w-full px-4 py-2 bg-[#D8AFA0] hover:bg-[#C89B8A] text-white rounded-lg transition-colors text-sm font-medium" data-v-f7095ca9> \u2713 Marcar como Realizada </button>`);
        } else {
          _push(`<!---->`);
        }
        if (["pendiente", "confirmada"].includes(sesion.value.estado)) {
          _push(`<button class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium" data-v-f7095ca9> \u2715 Cancelar Sesi\xF3n </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/terapeuta/pacientes/${sesion.value.paciente_id}`,
          class: "w-full block px-4 py-2 bg-white border border-[#EAD5D3] text-[#5D4A44] hover:bg-[#F9F7F3] rounded-lg transition-colors text-sm font-medium text-center"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Ver Perfil del Paciente `);
            } else {
              return [
                createTextVNode(" Ver Perfil del Paciente ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<button class="w-full px-4 py-2 bg-white border border-[#EAD5D3] text-[#5D4A44] hover:bg-[#F9F7F3] rounded-lg transition-colors text-sm font-medium" data-v-f7095ca9> \u{1F4C4} Generar Recibo </button></div></div><div class="bg-[#F9F7F3] rounded-xl p-6 border border-[#EAD5D3]/40" data-v-f7095ca9><h4 class="font-[&#39;Lora&#39;] text-sm text-[#5D4A44] mb-3" data-v-f7095ca9>Informaci\xF3n</h4><div class="space-y-2 text-xs text-[#5D4A44]/70" data-v-f7095ca9><p data-v-f7095ca9>\u2022 Creada: ${ssrInterpolate(formatearFecha(sesion.value.created_at))}</p><p data-v-f7095ca9>\u2022 ID: ${ssrInterpolate(sesion.value.id)}</p>`);
        if (sesion.value.bono_id) {
          _push(`<p data-v-f7095ca9>\u2022 Bono: ${ssrInterpolate(sesion.value.bono_id.slice(0, 8))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/terapeuta/sesiones/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f7095ca9"]]);

export { _id_ as default };
//# sourceMappingURL=_id_-BgdLq3Xu.mjs.map
