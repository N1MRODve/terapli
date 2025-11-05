import { defineComponent, mergeProps, unref, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { u as useAgenda, a as __nuxt_component_1, _ as __nuxt_component_0$1 } from './AgendaTerapeuta-DO67d38s.mjs';
import './useSupabaseClient-DykwVqLQ.mjs';
import './server.mjs';
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
import '@heroicons/vue/24/outline';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "EstadisticasBonos",
  __ssrInlineRender: true,
  props: {
    citas: {}
  },
  setup(__props) {
    const props = __props;
    const estadisticas = computed(() => {
      const citasConBono = props.citas.filter((c) => c.bono);
      const bonosUnicos = /* @__PURE__ */ new Map();
      citasConBono.forEach((c) => {
        if (c.bono) {
          bonosUnicos.set(c.bono.id, c.bono);
        }
      });
      const bonos = Array.from(bonosUnicos.values());
      const totalBonos = bonos.length;
      const bonosActivos = bonos.filter((b) => b.estado === "activo").length;
      const bonosConPocasSesiones = bonos.filter(
        (b) => b.sesiones_restantes <= 2 && b.sesiones_restantes > 0
      ).length;
      const bonosAgotados = bonos.filter(
        (b) => b.sesiones_restantes === 0 || b.estado === "completado"
      ).length;
      const totalSesionesDisponibles = bonos.reduce((sum, b) => sum + b.sesiones_restantes, 0);
      const totalSesionesProgramadas = bonos.reduce((sum, b) => sum + b.sesiones_totales, 0);
      const porcentajeUsado = totalSesionesProgramadas > 0 ? Math.round((totalSesionesProgramadas - totalSesionesDisponibles) / totalSesionesProgramadas * 100) : 0;
      return {
        totalBonos,
        bonosActivos,
        bonosConPocasSesiones,
        bonosAgotados,
        totalSesionesDisponibles,
        totalSesionesProgramadas,
        porcentajeUsado
      };
    });
    const hayAlertas = computed(() => {
      return estadisticas.value.bonosConPocasSesiones > 0 || estadisticas.value.bonosAgotados > 0;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-v-44ce82a9><div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5" data-v-44ce82a9><div class="flex items-center justify-between" data-v-44ce82a9><div data-v-44ce82a9><p class="text-sm font-medium text-gray-600" data-v-44ce82a9>Bonos Activos</p><p class="text-3xl font-bold text-blue-600 mt-1" data-v-44ce82a9>${ssrInterpolate(estadisticas.value.bonosActivos)}</p><p class="text-xs text-gray-500 mt-1" data-v-44ce82a9>de ${ssrInterpolate(estadisticas.value.totalBonos)} totales</p></div><div class="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center" data-v-44ce82a9><svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-44ce82a9><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" data-v-44ce82a9></path></svg></div></div></div><div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5" data-v-44ce82a9><div class="flex items-center justify-between" data-v-44ce82a9><div data-v-44ce82a9><p class="text-sm font-medium text-gray-600" data-v-44ce82a9>Sesiones Disponibles</p><p class="text-3xl font-bold text-green-600 mt-1" data-v-44ce82a9>${ssrInterpolate(estadisticas.value.totalSesionesDisponibles)}</p><p class="text-xs text-gray-500 mt-1" data-v-44ce82a9> de ${ssrInterpolate(estadisticas.value.totalSesionesProgramadas)} programadas </p></div><div class="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center" data-v-44ce82a9><svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-44ce82a9><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" data-v-44ce82a9></path></svg></div></div></div><div class="${ssrRenderClass([
        "rounded-lg shadow-sm border p-5",
        estadisticas.value.bonosConPocasSesiones > 0 ? "bg-yellow-50 border-yellow-300" : "bg-white border-gray-200"
      ])}" data-v-44ce82a9><div class="flex items-center justify-between" data-v-44ce82a9><div data-v-44ce82a9><p class="text-sm font-medium text-gray-600" data-v-44ce82a9>Bonos por Renovar</p><p class="${ssrRenderClass([
        "text-3xl font-bold mt-1",
        estadisticas.value.bonosConPocasSesiones > 0 ? "text-yellow-600" : "text-gray-400"
      ])}" data-v-44ce82a9>${ssrInterpolate(estadisticas.value.bonosConPocasSesiones)}</p><p class="text-xs text-gray-500 mt-1" data-v-44ce82a9>\u22642 sesiones restantes</p></div><div class="${ssrRenderClass([
        "h-12 w-12 rounded-full flex items-center justify-center",
        estadisticas.value.bonosConPocasSesiones > 0 ? "bg-yellow-200" : "bg-gray-100"
      ])}" data-v-44ce82a9><svg class="${ssrRenderClass([
        "h-6 w-6",
        estadisticas.value.bonosConPocasSesiones > 0 ? "text-yellow-600" : "text-gray-400"
      ])}" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-44ce82a9><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" data-v-44ce82a9></path></svg></div></div></div><div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5" data-v-44ce82a9><div class="flex items-center justify-between" data-v-44ce82a9><div data-v-44ce82a9><p class="text-sm font-medium text-gray-600" data-v-44ce82a9>Bonos Completados</p><p class="text-3xl font-bold text-gray-600 mt-1" data-v-44ce82a9>${ssrInterpolate(estadisticas.value.bonosAgotados)}</p><p class="text-xs text-gray-500 mt-1" data-v-44ce82a9>0 sesiones restantes</p></div><div class="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center" data-v-44ce82a9><svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-44ce82a9><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-v-44ce82a9></path></svg></div></div></div>`);
      if (estadisticas.value.totalSesionesProgramadas > 0) {
        _push(`<div class="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-5" data-v-44ce82a9><div class="flex items-center justify-between mb-2" data-v-44ce82a9><p class="text-sm font-medium text-gray-700" data-v-44ce82a9>Uso General de Bonos</p><p class="text-sm font-bold text-gray-900" data-v-44ce82a9>${ssrInterpolate(estadisticas.value.porcentajeUsado)}% usado</p></div><div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden" data-v-44ce82a9><div class="${ssrRenderClass([
          "h-full rounded-full transition-all duration-500",
          estadisticas.value.porcentajeUsado >= 80 ? "bg-red-500" : estadisticas.value.porcentajeUsado >= 60 ? "bg-yellow-500" : "bg-green-500"
        ])}" style="${ssrRenderStyle({ width: `${estadisticas.value.porcentajeUsado}%` })}" data-v-44ce82a9></div></div><div class="flex justify-between text-xs text-gray-500 mt-1" data-v-44ce82a9><span data-v-44ce82a9>${ssrInterpolate(estadisticas.value.totalSesionesProgramadas - estadisticas.value.totalSesionesDisponibles)} usadas</span><span data-v-44ce82a9>${ssrInterpolate(estadisticas.value.totalSesionesDisponibles)} disponibles</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (hayAlertas.value) {
        _push(`<div class="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-r-lg" data-v-44ce82a9><div class="flex items-start" data-v-44ce82a9><div class="flex-shrink-0" data-v-44ce82a9><svg class="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20" data-v-44ce82a9><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" data-v-44ce82a9></path></svg></div><div class="ml-3 flex-1" data-v-44ce82a9><h3 class="text-sm font-medium text-yellow-800" data-v-44ce82a9> Acci\xF3n Requerida </h3><div class="mt-2 text-sm text-yellow-700" data-v-44ce82a9><p data-v-44ce82a9>`);
        if (estadisticas.value.bonosConPocasSesiones > 0) {
          _push(`<strong data-v-44ce82a9>${ssrInterpolate(estadisticas.value.bonosConPocasSesiones)} bono${ssrInterpolate(estadisticas.value.bonosConPocasSesiones > 1 ? "s" : "")}</strong>`);
        } else {
          _push(`<!---->`);
        }
        if (estadisticas.value.bonosConPocasSesiones > 0) {
          _push(`<span data-v-44ce82a9>${ssrInterpolate(estadisticas.value.bonosConPocasSesiones > 1 ? " necesitan" : " necesita")} renovaci\xF3n pronto. </span>`);
        } else {
          _push(`<!---->`);
        }
        if (estadisticas.value.bonosAgotados > 0) {
          _push(`<strong class="ml-2" data-v-44ce82a9>${ssrInterpolate(estadisticas.value.bonosAgotados)} bono${ssrInterpolate(estadisticas.value.bonosAgotados > 1 ? "s" : "")} completado${ssrInterpolate(estadisticas.value.bonosAgotados > 1 ? "s" : "")}. </strong>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p><p class="mt-1 text-xs" data-v-44ce82a9> \u{1F4A1} Contacta a los pacientes para ofrecer renovaci\xF3n de bonos </p></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/EstadisticasBonos.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-44ce82a9"]]), { __name: "EstadisticasBonos" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ejemplo-agenda",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      citas,
      citasDelDia
    } = useAgenda();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_EstadisticasBonos = __nuxt_component_0;
      const _component_TarjetaCita = __nuxt_component_1;
      const _component_AgendaTerapeuta = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 max-w-7xl mx-auto" }, _attrs))}><h1 class="text-3xl font-bold mb-6">Dashboard - Ejemplo</h1>`);
      _push(ssrRenderComponent(_component_EstadisticasBonos, {
        citas: unref(citas),
        class: "mb-8"
      }, null, _parent));
      _push(`<section class="mb-8"><h2 class="text-xl font-bold mb-4">Citas de Hoy (${ssrInterpolate(unref(citasDelDia).length)})</h2><div class="space-y-4"><!--[-->`);
      ssrRenderList(unref(citasDelDia), (cita) => {
        _push(ssrRenderComponent(_component_TarjetaCita, {
          key: cita.id,
          cita,
          onCompletar: (id) => console.log("Completar:", id),
          onVerHistorial: (id) => console.log("Historial:", id)
        }, null, _parent));
      });
      _push(`<!--]--></div></section>`);
      _push(ssrRenderComponent(_component_AgendaTerapeuta, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/ejemplo-agenda.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ejemplo-agenda-BNieH30q.mjs.map
