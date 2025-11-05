import { defineComponent, ref, computed, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { CurrencyDollarIcon, UserIcon, CalendarDaysIcon, CalendarIcon, ArrowTrendingDownIcon, UserGroupIcon, TicketIcon } from '@heroicons/vue/24/outline';
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    const cargando = ref(true);
    const metricas = ref({
      ingresoTotal: 0,
      cltvPromedio: 0,
      tasaOcupacionReal: 0,
      tasaOcupacionProyectada: 0,
      ocupacionProximaSemana: 0,
      churnRate: 0,
      totalPacientes: 0,
      pacientesConBono: 0,
      pacientesNuevos: 0,
      totalBonos: 0,
      bonosActivos: 0,
      bonosAgotados: 0,
      totalCitas: 0,
      citasRealizadas: 0,
      citasCanceladas: 0
    });
    const terapeutas = ref([]);
    const fechaActualizacion = computed(
      () => (/* @__PURE__ */ new Date()).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    );
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
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="mb-8"><h2 class="text-3xl font-bold text-gray-900 mb-2">M\xE9tricas del Negocio</h2><p class="text-gray-600">Vista general del rendimiento y estado del sistema</p></div>`);
      if (cargando.value) {
        _push(`<div class="flex items-center justify-center py-24"><div class="text-center"><div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div><p class="text-gray-600 font-medium">Cargando m\xE9tricas...</p></div></div>`);
      } else {
        _push(`<!--[--><section class="mb-8"><h3 class="text-xl font-bold text-gray-900 mb-4">Indicadores Clave</h3><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><div class="bg-white rounded-xl p-6 shadow-md border border-gray-200"><div class="flex items-center justify-between mb-4"><div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">`);
        _push(ssrRenderComponent(unref(CurrencyDollarIcon), { class: "w-7 h-7 text-emerald-600" }, null, _parent));
        _push(`</div></div><h4 class="text-sm font-semibold text-gray-600 mb-1">Ingresos Totales</h4><p class="text-3xl font-bold text-gray-900">${ssrInterpolate(formatNumber(metricas.value.ingresoTotal))}</p><p class="text-xs text-gray-500 mt-2">Confirmados</p></div><div class="bg-white rounded-xl p-6 shadow-md border border-gray-200"><div class="flex items-center justify-between mb-4"><div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">`);
        _push(ssrRenderComponent(unref(UserIcon), { class: "w-7 h-7 text-blue-600" }, null, _parent));
        _push(`</div></div><h4 class="text-sm font-semibold text-gray-600 mb-1">CLTV Promedio</h4><p class="text-3xl font-bold text-gray-900">${ssrInterpolate(formatNumber(metricas.value.cltvPromedio))}</p><p class="text-xs text-gray-500 mt-2">Por paciente</p></div><div class="bg-white rounded-xl p-6 shadow-md border border-gray-200"><div class="flex items-center justify-between mb-4"><div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">`);
        _push(ssrRenderComponent(unref(CalendarDaysIcon), { class: "w-7 h-7 text-purple-600" }, null, _parent));
        _push(`</div></div><h4 class="text-sm font-semibold text-gray-600 mb-1">Ocupaci\xF3n Real</h4><p class="text-3xl font-bold text-gray-900">${ssrInterpolate(metricas.value.tasaOcupacionReal)}%</p><p class="text-xs text-gray-500 mt-2">Confirmadas + Realizadas</p></div><div class="bg-white rounded-xl p-6 shadow-md border border-gray-200"><div class="flex items-center justify-between mb-4"><div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">`);
        _push(ssrRenderComponent(unref(CalendarIcon), { class: "w-7 h-7 text-blue-600" }, null, _parent));
        _push(`</div></div><h4 class="text-sm font-semibold text-gray-600 mb-1">Ocupaci\xF3n Proyectada</h4><p class="text-3xl font-bold text-gray-900">${ssrInterpolate(metricas.value.tasaOcupacionProyectada)}%</p><p class="text-xs text-gray-500 mt-2">\xDAltimos 30 d\xEDas</p></div><div class="bg-white rounded-xl p-6 shadow-md border border-gray-200"><div class="flex items-center justify-between mb-4"><div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">`);
        _push(ssrRenderComponent(unref(CalendarIcon), { class: "w-7 h-7 text-teal-600" }, null, _parent));
        _push(`</div></div><h4 class="text-sm font-semibold text-gray-600 mb-1">Previsi\xF3n Pr\xF3xima Semana</h4><p class="text-3xl font-bold text-gray-900">${ssrInterpolate(metricas.value.ocupacionProximaSemana)}%</p><p class="text-xs text-gray-500 mt-2">Citas programadas</p></div><div class="bg-white rounded-xl p-6 shadow-md border border-gray-200"><div class="flex items-center justify-between mb-4"><div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">`);
        _push(ssrRenderComponent(unref(ArrowTrendingDownIcon), { class: "w-7 h-7 text-amber-600" }, null, _parent));
        _push(`</div></div><h4 class="text-sm font-semibold text-gray-600 mb-1">Tasa de Abandono</h4><p class="text-3xl font-bold text-gray-900">${ssrInterpolate(metricas.value.churnRate)}%</p><p class="text-xs text-gray-500 mt-2">\xDAltimos 3 meses</p></div></div></section><section class="mb-8"><h3 class="text-xl font-bold text-gray-900 mb-4">Resumen General</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-6"><div class="bg-white rounded-xl p-6 shadow-md border border-gray-200"><div class="flex items-center gap-4 mb-4"><div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">`);
        _push(ssrRenderComponent(unref(UserGroupIcon), { class: "w-7 h-7 text-indigo-600" }, null, _parent));
        _push(`</div><div><h4 class="text-sm font-semibold text-gray-600">Pacientes</h4><p class="text-2xl font-bold text-gray-900">${ssrInterpolate(metricas.value.totalPacientes)}</p></div></div><div class="space-y-2 text-sm"><div class="flex justify-between"><span class="text-gray-600">Activos con bono:</span><span class="font-semibold text-gray-900">${ssrInterpolate(metricas.value.pacientesConBono)}</span></div><div class="flex justify-between"><span class="text-gray-600">Nuevos (mes):</span><span class="font-semibold text-gray-900">${ssrInterpolate(metricas.value.pacientesNuevos)}</span></div></div></div><div class="bg-white rounded-xl p-6 shadow-md border border-gray-200"><div class="flex items-center gap-4 mb-4"><div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">`);
        _push(ssrRenderComponent(unref(TicketIcon), { class: "w-7 h-7 text-purple-600" }, null, _parent));
        _push(`</div><div><h4 class="text-sm font-semibold text-gray-600">Bonos</h4><p class="text-2xl font-bold text-gray-900">${ssrInterpolate(metricas.value.totalBonos)}</p></div></div><div class="space-y-2 text-sm"><div class="flex justify-between"><span class="text-gray-600">Activos:</span><span class="font-semibold text-emerald-600">${ssrInterpolate(metricas.value.bonosActivos)}</span></div><div class="flex justify-between"><span class="text-gray-600">Agotados:</span><span class="font-semibold text-gray-600">${ssrInterpolate(metricas.value.bonosAgotados)}</span></div></div></div><div class="bg-white rounded-xl p-6 shadow-md border border-gray-200"><div class="flex items-center gap-4 mb-4"><div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">`);
        _push(ssrRenderComponent(unref(CalendarIcon), { class: "w-7 h-7 text-emerald-600" }, null, _parent));
        _push(`</div><div><h4 class="text-sm font-semibold text-gray-600">Citas</h4><p class="text-2xl font-bold text-gray-900">${ssrInterpolate(metricas.value.totalCitas)}</p></div></div><div class="space-y-2 text-sm"><div class="flex justify-between"><span class="text-gray-600">Realizadas:</span><span class="font-semibold text-emerald-600">${ssrInterpolate(metricas.value.citasRealizadas)}</span></div><div class="flex justify-between"><span class="text-gray-600">Canceladas:</span><span class="font-semibold text-red-600">${ssrInterpolate(metricas.value.citasCanceladas)}</span></div></div></div></div></section><section class="mb-8"><h3 class="text-xl font-bold text-gray-900 mb-4">Rendimiento por Terapeuta</h3><div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"><div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"> Terapeuta </th><th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"> Pacientes </th><th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"> Citas Realizadas </th><th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"> Ocupaci\xF3n </th><th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"> Revenue </th><th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"> CLTV Promedio </th></tr></thead><tbody class="bg-white divide-y divide-gray-200"><!--[-->`);
        ssrRenderList(terapeutas.value, (terapeuta) => {
          _push(`<tr class="hover:bg-gray-50 transition-colors"><td class="px-6 py-4 whitespace-nowrap"><div class="flex items-center"><div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">${ssrInterpolate(terapeuta.iniciales)}</div><div class="ml-4"><div class="text-sm font-semibold text-gray-900">${ssrInterpolate(terapeuta.nombre)}</div><div class="text-sm text-gray-500">${ssrInterpolate(terapeuta.email)}</div></div></div></td><td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-semibold text-gray-900">${ssrInterpolate(terapeuta.totalPacientes)}</div><div class="text-xs text-gray-500">${ssrInterpolate(terapeuta.pacientesActivos)} activos</div></td><td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-semibold text-gray-900">${ssrInterpolate(terapeuta.citasRealizadas)}</div><div class="text-xs text-gray-500">${ssrInterpolate(terapeuta.citasTotales)} totales</div></td><td class="px-6 py-4 whitespace-nowrap"><div class="flex items-center gap-2"><div class="text-sm font-semibold text-gray-900">${ssrInterpolate(terapeuta.ocupacion)}%</div><div class="w-20 bg-gray-200 rounded-full h-2"><div class="${ssrRenderClass([terapeuta.ocupacion >= 80 ? "bg-emerald-500" : terapeuta.ocupacion >= 50 ? "bg-amber-500" : "bg-red-500", "h-2 rounded-full transition-all"])}" style="${ssrRenderStyle({ width: `${terapeuta.ocupacion}%` })}"></div></div></div></td><td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-semibold text-emerald-600">${ssrInterpolate(formatNumber(terapeuta.revenue))}</div></td><td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-semibold text-indigo-600">${ssrInterpolate(formatNumber(terapeuta.cltvPromedio))}</div></td></tr>`);
        });
        _push(`<!--]-->`);
        if (terapeutas.value.length === 0) {
          _push(`<tr><td colspan="6" class="px-6 py-12 text-center text-gray-500"> No hay terapeutas registradas </td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div></section><div class="text-center text-sm text-gray-500"> \xDAltima actualizaci\xF3n: ${ssrInterpolate(fechaActualizacion.value)}</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DHtKHkHG.mjs.map
