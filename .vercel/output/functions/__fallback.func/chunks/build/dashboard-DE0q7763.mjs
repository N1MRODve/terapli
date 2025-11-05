import { _ as __nuxt_component_0 } from './nuxt-link-CboeUkiO.mjs';
import { M as ModalDetallesCita } from './ModalDetallesCita-4YIA-weF.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { a as useRouter, e as useSupabaseUser } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@heroicons/vue/24/outline';
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
  __name: "dashboard",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    useRouter();
    useSupabaseUser();
    const terapeuta = ref(null);
    const cargandoSesiones = ref(true);
    const cargandoPacientes = ref(true);
    const proximasSesiones = ref([]);
    const pacientesActivos = ref([]);
    const totalPacientes = ref(0);
    const totalSesionesMes = ref(0);
    const porcentajeAsistencia = ref(0);
    const modalDetallesAbierto = ref(false);
    const citaSeleccionada = ref(null);
    const totalConfirmado = ref(0);
    const totalBonosPagados = ref(0);
    const recordatorios = ref([]);
    const cargandoRecordatorios = ref(true);
    const cerrarModalDetalles = () => {
      modalDetallesAbierto.value = false;
      citaSeleccionada.value = null;
    };
    const formatearPrecio = (precio) => {
      return precio.toFixed(2);
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ModalDetallesCita = ModalDetallesCita;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-8" }, _attrs))} data-v-d953f9ea><div class="flex items-center justify-between" data-v-d953f9ea><div data-v-d953f9ea><h1 class="text-3xl font-serif font-bold text-cafe" data-v-d953f9ea>Dashboard</h1><p class="text-cafe/70 mt-1" data-v-d953f9ea>Bienvenida de nuevo, ${ssrInterpolate(((_a = unref(terapeuta)) == null ? void 0 : _a.nombre) || "Karem")} \u{1F44B}</p></div><div class="flex gap-2" data-v-d953f9ea><button class="btn-primary" data-v-d953f9ea>+ Nueva Cita</button><button class="btn-outline" data-v-d953f9ea>+ Nuevo Paciente</button></div></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6" data-v-d953f9ea><section class="card lg:col-span-2" data-v-d953f9ea><header class="flex justify-between items-center mb-4" data-v-d953f9ea><h2 class="text-xl font-semibold text-cafe" data-v-d953f9ea>\uFFFD\uFE0F Pr\xF3ximas Sesiones</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/agenda",
        class: "text-terracota text-sm hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Ver agenda \u2192 `);
          } else {
            return [
              createTextVNode(" Ver agenda \u2192 ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header>`);
      if (unref(cargandoSesiones)) {
        _push(`<div class="text-cafe/60 text-sm py-8 text-center" data-v-d953f9ea>Cargando sesiones...</div>`);
      } else if (unref(proximasSesiones).length === 0) {
        _push(`<div class="text-cafe/50 text-center py-10" data-v-d953f9ea>No hay sesiones pr\xF3ximas.</div>`);
      } else {
        _push(`<div class="space-y-4" data-v-d953f9ea><!--[-->`);
        ssrRenderList(unref(proximasSesiones), (cita) => {
          _push(`<div class="flex items-center justify-between bg-terracota/5 rounded-xl p-4 hover:bg-terracota/10 transition" data-v-d953f9ea><div data-v-d953f9ea><p class="text-lg font-semibold text-cafe" data-v-d953f9ea>${ssrInterpolate(cita.hora_inicio)} \u2014 ${ssrInterpolate(cita.paciente_nombre)}</p><p class="text-sm text-cafe/70" data-v-d953f9ea>${ssrInterpolate(cita.modalidad === "online" ? "Online \u{1F4BB}" : "Presencial \u{1F3E5}")}</p></div><button class="px-3 py-1 text-sm border border-terracota/30 rounded-lg text-terracota hover:bg-terracota hover:text-white transition" data-v-d953f9ea> Ver detalles </button></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</section><section class="card" data-v-d953f9ea><header class="flex justify-between items-center mb-4" data-v-d953f9ea><h2 class="text-xl font-semibold text-cafe" data-v-d953f9ea>\u{1F9CD} Pacientes Activos</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/pacientes",
        class: "text-terracota text-sm hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Ver todos \u2192 `);
          } else {
            return [
              createTextVNode(" Ver todos \u2192 ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header>`);
      if (unref(cargandoPacientes)) {
        _push(`<div class="text-cafe/60 text-sm py-8 text-center" data-v-d953f9ea>Cargando pacientes...</div>`);
      } else if (unref(pacientesActivos).length === 0) {
        _push(`<div class="text-cafe/50 text-center py-10" data-v-d953f9ea>No hay pacientes activos.</div>`);
      } else {
        _push(`<div class="space-y-3" data-v-d953f9ea><!--[-->`);
        ssrRenderList(unref(pacientesActivos), (paciente) => {
          _push(`<div class="flex items-center justify-between bg-white border border-cafe/5 rounded-xl p-4 hover:shadow-sm transition" data-v-d953f9ea><div class="flex-1" data-v-d953f9ea><p class="font-semibold text-cafe" data-v-d953f9ea>${ssrInterpolate(paciente.nombre_completo)}</p><p class="text-sm text-cafe/60" data-v-d953f9ea>\xDAltima sesi\xF3n: ${ssrInterpolate(paciente.ultima_sesion || "Sin registro")}</p><div class="w-full bg-base-bg h-1 mt-2 rounded-full" data-v-d953f9ea><div class="h-1 rounded-full bg-green-500 transition-all" style="${ssrRenderStyle({ width: `${paciente.progreso_bono || 0}%` })}" data-v-d953f9ea></div></div></div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/terapeuta/pacientes/${paciente.id}`,
            class: "px-3 py-1 text-sm border border-cafe/10 text-cafe rounded-lg hover:bg-cafe/5 ml-3"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Ver perfil `);
              } else {
                return [
                  createTextVNode(" Ver perfil ")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</section></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6" data-v-d953f9ea><section class="card lg:col-span-2" data-v-d953f9ea><header class="flex justify-between items-center mb-4" data-v-d953f9ea><h2 class="text-xl font-semibold text-cafe" data-v-d953f9ea>\u{1F4CA} Anal\xEDtica del Profesional</h2></header><div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center" data-v-d953f9ea><div class="p-4 bg-terracota/5 rounded-xl" data-v-d953f9ea><p class="text-2xl font-bold text-cafe" data-v-d953f9ea>${ssrInterpolate(unref(totalPacientes))}</p><p class="text-sm text-cafe/60" data-v-d953f9ea>Pacientes activos</p></div><div class="p-4 bg-terracota/5 rounded-xl" data-v-d953f9ea><p class="text-2xl font-bold text-cafe" data-v-d953f9ea>${ssrInterpolate(unref(totalSesionesMes))}</p><p class="text-sm text-cafe/60" data-v-d953f9ea>Sesiones este mes</p></div><div class="p-4 bg-terracota/5 rounded-xl" data-v-d953f9ea><p class="text-2xl font-bold text-cafe" data-v-d953f9ea>${ssrInterpolate(unref(porcentajeAsistencia))}%</p><p class="text-sm text-cafe/60" data-v-d953f9ea>Asistencia promedio</p></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/sesiones",
        class: "p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all hover:shadow-md group"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center justify-center gap-2 mb-1" data-v-d953f9ea${_scopeId}><span class="text-2xl group-hover:scale-110 transition-transform" data-v-d953f9ea${_scopeId}>\u{1F4B6}</span><p class="text-2xl font-bold text-green-700" data-v-d953f9ea${_scopeId}>${ssrInterpolate(formatearPrecio(unref(totalConfirmado)))}\u20AC</p></div><p class="text-sm text-cafe/60" data-v-d953f9ea${_scopeId}>Pagos confirmados</p><p class="text-xs text-green-700 font-medium mt-1" data-v-d953f9ea${_scopeId}>${ssrInterpolate(unref(totalBonosPagados))} ${ssrInterpolate(unref(totalBonosPagados) === 1 ? "bono" : "bonos")}</p>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center justify-center gap-2 mb-1" }, [
                createVNode("span", { class: "text-2xl group-hover:scale-110 transition-transform" }, "\u{1F4B6}"),
                createVNode("p", { class: "text-2xl font-bold text-green-700" }, toDisplayString(formatearPrecio(unref(totalConfirmado))) + "\u20AC", 1)
              ]),
              createVNode("p", { class: "text-sm text-cafe/60" }, "Pagos confirmados"),
              createVNode("p", { class: "text-xs text-green-700 font-medium mt-1" }, toDisplayString(unref(totalBonosPagados)) + " " + toDisplayString(unref(totalBonosPagados) === 1 ? "bono" : "bonos"), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></section><section class="card" data-v-d953f9ea><header class="flex justify-between items-center mb-4" data-v-d953f9ea><h2 class="text-xl font-semibold text-cafe" data-v-d953f9ea>\u{1F4AC} Recordatorios</h2>`);
      if (!unref(cargandoRecordatorios)) {
        _push(`<button class="text-xs text-terracota hover:text-cafe transition" title="Actualizar recordatorios" data-v-d953f9ea> \u{1F504} </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header>`);
      if (unref(cargandoRecordatorios)) {
        _push(`<div class="text-cafe/60 text-sm py-8 text-center" data-v-d953f9ea> Cargando recordatorios... </div>`);
      } else if (unref(recordatorios).length) {
        _push(`<ul class="space-y-3 text-sm text-cafe/80" data-v-d953f9ea><!--[-->`);
        ssrRenderList(unref(recordatorios), (msg, i) => {
          _push(`<li class="flex items-start gap-2 bg-terracota/5 rounded-lg px-3 py-2 hover:bg-terracota/10 transition" data-v-d953f9ea><span class="flex-shrink-0 mt-0.5" data-v-d953f9ea>\u{1F514}</span><span class="flex-1" data-v-d953f9ea>${ssrInterpolate(msg)}</span></li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<div class="text-cafe/60 text-sm py-8 text-center" data-v-d953f9ea> No hay recordatorios pendientes \u{1F389} </div>`);
      }
      _push(`</section></div>`);
      _push(ssrRenderComponent(_component_ModalDetallesCita, {
        "is-open": unref(modalDetallesAbierto),
        "cita-id": unref(citaSeleccionada),
        onClose: cerrarModalDetalles
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/terapeuta/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const dashboard = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d953f9ea"]]);

export { dashboard as default };
//# sourceMappingURL=dashboard-DE0q7763.mjs.map
