import { defineComponent, ref, computed, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { UserGroupIcon, TicketIcon, CurrencyEuroIcon, ChartBarIcon } from '@heroicons/vue/24/outline';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "pacientes",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    const cargando = ref(true);
    const pacientes = ref([]);
    const busqueda = ref("");
    const filtroTerapeuta = ref("");
    const filtroBono = ref("");
    const terapeutasUnicos = computed(() => {
      const terapeutas = /* @__PURE__ */ new Map();
      pacientes.value.forEach((p) => {
        if (p.terapeuta_id && p.terapeuta_nombre) {
          terapeutas.set(p.terapeuta_id, { id: p.terapeuta_id, nombre: p.terapeuta_nombre });
        }
      });
      return Array.from(terapeutas.values());
    });
    const pacientesFiltrados = computed(() => {
      let resultado = [...pacientes.value];
      if (busqueda.value) {
        const busq = busqueda.value.toLowerCase();
        resultado = resultado.filter(
          (p) => p.nombre_completo?.toLowerCase().includes(busq) || p.email?.toLowerCase().includes(busq)
        );
      }
      if (filtroTerapeuta.value) {
        resultado = resultado.filter((p) => p.terapeuta_id === filtroTerapeuta.value);
      }
      if (filtroBono.value === "activo") {
        resultado = resultado.filter((p) => p.bono_activo);
      } else if (filtroBono.value === "sin_bono") {
        resultado = resultado.filter((p) => !p.bono_activo);
      }
      return resultado;
    });
    const pacientesConBonoActivo = computed(() => {
      return pacientes.value.filter((p) => p.bono_activo).length;
    });
    const cltvTotal = computed(() => {
      return pacientes.value.reduce((sum, p) => sum + (p.cltv || 0), 0);
    });
    const cltvPromedio = computed(() => {
      if (pacientes.value.length === 0) return 0;
      return cltvTotal.value / pacientes.value.length;
    });
    const formatNumber = (num) => {
      return num.toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };
    const obtenerIniciales = (nombre) => {
      if (!nombre) return "??";
      return nombre.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
    };
    const formatTipoBono = (tipo) => {
      const tipos = {
        "semanal": "Semanal",
        "quincenal": "Quincenal",
        "mensual": "Mensual",
        "otro": "Otro"
      };
      return tipos[tipo] || tipo;
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="mb-8"><h2 class="text-3xl font-bold text-gray-900 mb-2">Gestión de Pacientes</h2><p class="text-gray-600">Vista completa de todos los pacientes del sistema</p></div>`);
      if (cargando.value) {
        _push(`<div class="flex items-center justify-center py-20"><div class="text-center"><div class="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div><p class="text-gray-600 text-sm">Cargando pacientes...</p></div></div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"><div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"><div class="flex items-center justify-between mb-2"><span class="text-sm font-medium text-blue-700">Total Pacientes</span>`);
        _push(ssrRenderComponent(unref(UserGroupIcon), { class: "w-5 h-5 text-blue-600" }, null, _parent));
        _push(`</div><p class="text-3xl font-bold text-blue-900">${ssrInterpolate(pacientes.value.length)}</p></div><div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"><div class="flex items-center justify-between mb-2"><span class="text-sm font-medium text-green-700">Con Bono Activo</span>`);
        _push(ssrRenderComponent(unref(TicketIcon), { class: "w-5 h-5 text-green-600" }, null, _parent));
        _push(`</div><p class="text-3xl font-bold text-green-900">${ssrInterpolate(pacientesConBonoActivo.value)}</p></div><div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"><div class="flex items-center justify-between mb-2"><span class="text-sm font-medium text-purple-700">CLTV Total</span>`);
        _push(ssrRenderComponent(unref(CurrencyEuroIcon), { class: "w-5 h-5 text-purple-600" }, null, _parent));
        _push(`</div><p class="text-3xl font-bold text-purple-900">${ssrInterpolate(formatNumber(cltvTotal.value))}</p></div><div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200"><div class="flex items-center justify-between mb-2"><span class="text-sm font-medium text-orange-700">CLTV Promedio</span>`);
        _push(ssrRenderComponent(unref(ChartBarIcon), { class: "w-5 h-5 text-orange-600" }, null, _parent));
        _push(`</div><p class="text-3xl font-bold text-orange-900">${ssrInterpolate(formatNumber(cltvPromedio.value))}</p></div></div><div class="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6"><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-2">Buscar paciente</label><input${ssrRenderAttr("value", busqueda.value)} type="text" placeholder="Nombre o email..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"></div><div><label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por terapeuta</label><select class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"><option value=""${ssrIncludeBooleanAttr(Array.isArray(filtroTerapeuta.value) ? ssrLooseContain(filtroTerapeuta.value, "") : ssrLooseEqual(filtroTerapeuta.value, "")) ? " selected" : ""}>Todos los terapeutas</option><!--[-->`);
        ssrRenderList(terapeutasUnicos.value, (terapeuta) => {
          _push(`<option${ssrRenderAttr("value", terapeuta.id)}${ssrIncludeBooleanAttr(Array.isArray(filtroTerapeuta.value) ? ssrLooseContain(filtroTerapeuta.value, terapeuta.id) : ssrLooseEqual(filtroTerapeuta.value, terapeuta.id)) ? " selected" : ""}>${ssrInterpolate(terapeuta.nombre)}</option>`);
        });
        _push(`<!--]--></select></div><div><label class="block text-sm font-medium text-gray-700 mb-2">Estado del bono</label><select class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"><option value=""${ssrIncludeBooleanAttr(Array.isArray(filtroBono.value) ? ssrLooseContain(filtroBono.value, "") : ssrLooseEqual(filtroBono.value, "")) ? " selected" : ""}>Todos</option><option value="activo"${ssrIncludeBooleanAttr(Array.isArray(filtroBono.value) ? ssrLooseContain(filtroBono.value, "activo") : ssrLooseEqual(filtroBono.value, "activo")) ? " selected" : ""}>Con bono activo</option><option value="sin_bono"${ssrIncludeBooleanAttr(Array.isArray(filtroBono.value) ? ssrLooseContain(filtroBono.value, "sin_bono") : ssrLooseEqual(filtroBono.value, "sin_bono")) ? " selected" : ""}>Sin bono activo</option></select></div></div></div><div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"><div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr><th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Paciente </th><th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Terapeuta </th><th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Bono Activo </th><th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Sesiones </th><th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> CLTV </th><th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Estado </th></tr></thead><tbody class="bg-white divide-y divide-gray-200"><!--[-->`);
        ssrRenderList(pacientesFiltrados.value, (paciente) => {
          _push(`<tr class="hover:bg-gray-50 transition-colors"><td class="px-6 py-4 whitespace-nowrap"><div class="flex items-center"><div class="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center"><span class="text-white font-semibold text-sm">${ssrInterpolate(obtenerIniciales(paciente.nombre_completo))}</span></div><div class="ml-4"><div class="text-sm font-medium text-gray-900">${ssrInterpolate(paciente.nombre_completo)}</div><div class="text-sm text-gray-500">${ssrInterpolate(paciente.email)}</div></div></div></td><td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-gray-900">${ssrInterpolate(paciente.terapeuta_nombre || "Sin asignar")}</div></td><td class="px-6 py-4 whitespace-nowrap">`);
          if (paciente.bono_activo) {
            _push(`<div><div class="flex items-center">`);
            _push(ssrRenderComponent(unref(TicketIcon), { class: "w-4 h-4 text-green-600 mr-2" }, null, _parent));
            _push(`<span class="text-sm font-medium text-gray-900">${ssrInterpolate(formatTipoBono(paciente.bono_tipo))}</span></div><div class="text-xs text-gray-500 mt-1">${ssrInterpolate(paciente.bono_estado)}</div></div>`);
          } else {
            _push(`<div class="text-sm text-gray-400 italic">Sin bono activo</div>`);
          }
          _push(`</td><td class="px-6 py-4 whitespace-nowrap">`);
          if (paciente.bono_activo) {
            _push(`<div class="text-sm"><span class="font-semibold text-gray-900">${ssrInterpolate(paciente.sesiones_restantes)}</span><span class="text-gray-500"> / ${ssrInterpolate(paciente.total_sesiones)}</span></div>`);
          } else {
            _push(`<div class="text-sm text-gray-400">-</div>`);
          }
          _push(`</td><td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-semibold text-indigo-600">${ssrInterpolate(formatNumber(paciente.cltv || 0))}</div></td><td class="px-6 py-4 whitespace-nowrap"><span class="${ssrRenderClass([paciente.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800", "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"])}">${ssrInterpolate(paciente.activo ? "Activo" : "Inactivo")}</span></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
        if (pacientesFiltrados.value.length === 0) {
          _push(`<div class="text-center py-12">`);
          _push(ssrRenderComponent(unref(UserGroupIcon), { class: "w-16 h-16 text-gray-300 mx-auto mb-4" }, null, _parent));
          _push(`<p class="text-gray-500 text-sm">No se encontraron pacientes</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="mt-6 text-sm text-gray-500 text-right"> Mostrando ${ssrInterpolate(pacientesFiltrados.value.length)} de ${ssrInterpolate(pacientes.value.length)} pacientes </div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/pacientes.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=pacientes-p7uzohW8.mjs.map
