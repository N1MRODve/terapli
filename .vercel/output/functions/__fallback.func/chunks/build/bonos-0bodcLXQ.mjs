import { _ as _sfc_main$5 } from './DashboardCard-CYAu_T60.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createVNode, toDisplayString, withDirectives, isRef, vModelSelect, createBlock, openBlock, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderAttr } from 'vue/server-renderer';
import { u as useBonos, a as useRoles } from './useBonos-BFarM2bD.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { u as useSupabase } from './useSupabase-DljD0dj8.mjs';
import { h as useRoute, a as useRouter } from './server.mjs';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
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

const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "BonoCard",
  __ssrInlineRender: true,
  props: {
    bono: {}
  },
  emits: ["renovar", "verPagos", "editar"],
  setup(__props) {
    const props = __props;
    const { getEstadoColor, getEstadoTexto, calcularPorcentajeUso, puedeGestionarBonos, puedeConfirmarPagos } = useBonos();
    const { isCoordinadora } = useRoles();
    const tipoTexto = computed(() => {
      const tipos = {
        "quincenal": "Quincenal",
        "mensual": "Mensual",
        "semestral": "Semestral"
      };
      return tipos[props.bono.tipo] || props.bono.tipo || "Est\xE1ndar";
    });
    const estadoColor = computed(() => getEstadoColor(props.bono.estado));
    const estadoTexto = computed(() => getEstadoTexto(props.bono.estado));
    const estadoIcono = computed(() => {
      const iconos = {
        "pendiente": "\u23F3",
        "activo": "\u2705",
        "completado": "\u2714\uFE0F",
        "vencido": "\u274C",
        "cancelado": "\u{1F6AB}"
      };
      return iconos[props.bono.estado] || "\u{1F4CB}";
    });
    const borderColor = computed(() => {
      const colores = {
        "pendiente": "border-yellow-300",
        "activo": "border-green-300",
        "completado": "border-gray-300",
        "vencido": "border-red-300",
        "cancelado": "border-gray-400"
      };
      return colores[props.bono.estado] || "border-gray-300";
    });
    const sesionesRestantes = computed(() => {
      var _a;
      return (_a = props.bono.sesiones_restantes) != null ? _a : 0;
    });
    const sesionesUsadas = computed(() => (props.bono.sesiones_totales || 0) - sesionesRestantes.value);
    const porcentajeUsado = computed(() => calcularPorcentajeUso(props.bono));
    const barraProgresoColor = computed(() => {
      const porcentaje = porcentajeUsado.value;
      if (porcentaje >= 90) return "bg-red-500";
      if (porcentaje >= 70) return "bg-orange-500";
      if (porcentaje >= 50) return "bg-yellow-500";
      return "bg-gradient-to-r from-[#D8AFA0] to-[#ECC8BA]";
    });
    const diasRestantes = computed(() => {
      if (!props.bono.fecha_fin) return null;
      const hoy = /* @__PURE__ */ new Date();
      const fechaFin = new Date(props.bono.fecha_fin);
      const diferencia = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1e3 * 60 * 60 * 24));
      return diferencia;
    });
    const proximoAVencer = computed(() => {
      if (props.bono.estado !== "activo" || diasRestantes.value === null) return false;
      return diasRestantes.value >= 0 && diasRestantes.value <= 7;
    });
    const pocasSesiones = computed(() => {
      return props.bono.estado === "activo" && sesionesRestantes.value > 0 && sesionesRestantes.value <= 2;
    });
    const puedeVerPagos = computed(() => puedeGestionarBonos.value || puedeConfirmarPagos.value);
    const puedeRenovar = computed(() => puedeGestionarBonos.value);
    const puedeEditar = computed(() => isCoordinadora.value);
    const formatearFecha = (fecha) => {
      if (!fecha) return "";
      try {
        const date = /* @__PURE__ */ new Date(fecha + "T00:00:00");
        return date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });
      } catch {
        return fecha;
      }
    };
    const formatearMonto = (monto) => {
      if (!monto) return "$ 0";
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
      }).format(monto);
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["group bono-card bg-white/90 backdrop-blur-md border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 relative overflow-hidden hover:bg-white/95 hover:scale-[1.02]", [unref(borderColor), { "opacity-60": __props.bono.estado === "cancelado" }]]
      }, _attrs))} data-v-a85fab0a><div class="absolute inset-0 bg-gradient-to-br from-[#5550F2]/5 via-transparent to-[#04BF9D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" data-v-a85fab0a></div><div class="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#F2B33D]/10 to-[#5550F2]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-700" data-v-a85fab0a></div><div class="relative flex items-start justify-between mb-6" data-v-a85fab0a><div class="flex-1" data-v-a85fab0a><div class="flex items-center gap-4 mb-3" data-v-a85fab0a><div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5550F2] to-[#027368] shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300" data-v-a85fab0a><span class="text-xl" data-v-a85fab0a>\u{1F3AB}</span></div><h3 class="font-[&#39;Elms_Sans&#39;] text-xl font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent" data-v-a85fab0a> Bono ${ssrInterpolate(unref(tipoTexto))}</h3></div><div class="flex items-center gap-3 flex-wrap" data-v-a85fab0a><span class="${ssrRenderClass([unref(estadoColor), "inline-flex items-center px-4 py-2 rounded-xl text-xs font-['Lato'] font-semibold border backdrop-blur-sm shadow-sm"])}" data-v-a85fab0a>${ssrInterpolate(unref(estadoIcono))} ${ssrInterpolate(unref(estadoTexto))}</span>`);
      if (unref(proximoAVencer)) {
        _push(`<span class="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-[&#39;Lato&#39;] font-semibold bg-gradient-to-r from-[#F2B33D]/20 to-[#F2B33D]/10 text-[#F2B33D] border border-[#F2B33D]/30 backdrop-blur-sm shadow-sm" data-v-a85fab0a> \u26A0\uFE0F Vence pronto </span>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(pocasSesiones)) {
        _push(`<span class="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-[&#39;Lato&#39;] font-semibold bg-gradient-to-r from-[#04BF9D]/20 to-[#027368]/10 text-[#027368] border border-[#04BF9D]/30 backdrop-blur-sm shadow-sm" data-v-a85fab0a> \u{1F4CA} Pocas sesiones </span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="flex gap-3" data-v-a85fab0a>`);
      if (unref(puedeVerPagos)) {
        _push(`<button class="p-3 hover:bg-gradient-to-br from-[#5550F2]/10 to-[#027368]/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/50 hover:shadow-lg hover:scale-110 group/btn" title="Ver pagos" data-v-a85fab0a><span class="text-lg group-hover/btn:scale-110 transition-transform duration-300" data-v-a85fab0a>\u{1F4B0}</span></button>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(puedeRenovar)) {
        _push(`<button class="p-3 hover:bg-gradient-to-br from-[#04BF9D]/10 to-[#F2B33D]/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/50 hover:shadow-lg hover:scale-110 group/btn" title="Renovar bono" data-v-a85fab0a><span class="text-lg group-hover/btn:scale-110 transition-transform duration-300" data-v-a85fab0a>\u{1F504}</span></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="relative mb-6" data-v-a85fab0a><div class="flex items-center justify-between mb-3" data-v-a85fab0a><span class="text-sm font-[&#39;Lato&#39;] text-gray-600 font-medium" data-v-a85fab0a>Sesiones</span><span class="text-sm font-[&#39;Lato&#39;] font-semibold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent" data-v-a85fab0a>${ssrInterpolate(unref(sesionesRestantes))} / ${ssrInterpolate(__props.bono.sesiones_totales)} disponibles </span></div><div class="relative w-full bg-gradient-to-r from-gray-100 to-gray-50 rounded-full h-4 overflow-hidden shadow-inner" data-v-a85fab0a><div class="${ssrRenderClass([unref(barraProgresoColor), "h-4 rounded-full transition-all duration-700 ease-out shadow-lg relative overflow-hidden"])}" style="${ssrRenderStyle({ width: unref(porcentajeUsado) + "%" })}" data-v-a85fab0a><div class="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent" data-v-a85fab0a></div><div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" data-v-a85fab0a></div></div></div><div class="flex justify-between mt-2 text-xs font-[&#39;Lato&#39;] text-gray-600" data-v-a85fab0a><span data-v-a85fab0a>${ssrInterpolate(unref(sesionesUsadas))} usadas</span><span class="font-semibold" data-v-a85fab0a>${ssrInterpolate(unref(porcentajeUsado))}% completado</span></div></div><div class="relative grid grid-cols-2 gap-4 mb-6" data-v-a85fab0a><div class="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm group-hover:shadow-md transition-all duration-300" data-v-a85fab0a><div class="text-xs font-[&#39;Lato&#39;] text-gray-500 uppercase tracking-wider mb-2" data-v-a85fab0a>Tipo</div><div class="text-sm font-[&#39;Lato&#39;] font-semibold text-gray-800 capitalize" data-v-a85fab0a>${ssrInterpolate(__props.bono.tipo || "Est\xE1ndar")}</div></div><div class="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm group-hover:shadow-md transition-all duration-300" data-v-a85fab0a><div class="text-xs font-[&#39;Lato&#39;] text-gray-500 uppercase tracking-wider mb-2" data-v-a85fab0a>Frecuencia</div><div class="text-sm font-[&#39;Lato&#39;] font-semibold text-gray-800 capitalize" data-v-a85fab0a>${ssrInterpolate(__props.bono.frecuencia || "Semanal")}</div></div><div class="p-3 bg-white rounded-lg border border-[#D8AFA0]/20" data-v-a85fab0a><div class="text-xs text-[#5D4A44]/60 mb-1" data-v-a85fab0a>Monto</div><div class="text-sm font-medium text-[#5D4A44]" data-v-a85fab0a>${ssrInterpolate(formatearMonto(__props.bono.monto))}</div></div><div class="p-3 bg-white rounded-lg border border-[#D8AFA0]/20" data-v-a85fab0a><div class="text-xs text-[#5D4A44]/60 mb-1" data-v-a85fab0a>Pago</div><div class="${ssrRenderClass([__props.bono.pagado ? "text-green-600" : "text-orange-600", "text-sm font-medium flex items-center gap-1"])}" data-v-a85fab0a>${ssrInterpolate(__props.bono.pagado ? "\u2713 Pagado" : "\u23F3 Pendiente")}</div></div></div>`);
      if (__props.bono.fecha_inicio || __props.bono.fecha_fin) {
        _push(`<div class="mb-4 p-3 bg-gradient-to-r from-[#D8AFA0]/10 to-[#ECC8BA]/10 rounded-lg" data-v-a85fab0a><div class="flex items-center justify-between text-sm" data-v-a85fab0a>`);
        if (__props.bono.fecha_inicio) {
          _push(`<div data-v-a85fab0a><span class="text-[#5D4A44]/60" data-v-a85fab0a>Inicio:</span><span class="font-medium text-[#5D4A44] ml-1" data-v-a85fab0a>${ssrInterpolate(formatearFecha(__props.bono.fecha_inicio))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.bono.fecha_fin) {
          _push(`<div data-v-a85fab0a><span class="text-[#5D4A44]/60" data-v-a85fab0a>Vence:</span><span class="${ssrRenderClass([unref(proximoAVencer) ? "text-orange-600" : "text-[#5D4A44]", "font-medium ml-1"])}" data-v-a85fab0a>${ssrInterpolate(formatearFecha(__props.bono.fecha_fin))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(diasRestantes) !== null && __props.bono.estado === "activo") {
          _push(`<div class="mt-2 text-xs text-center text-[#5D4A44]/60" data-v-a85fab0a>${ssrInterpolate(unref(diasRestantes) > 0 ? `${unref(diasRestantes)} d\xEDas restantes` : "Vencido")}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.bono.renovacion_automatica) {
        _push(`<div class="flex items-center gap-2 mb-4 p-2 bg-purple-50 border border-purple-200 rounded-lg" data-v-a85fab0a><span class="text-sm" data-v-a85fab0a>\u{1F504}</span><span class="text-xs text-purple-700 font-medium" data-v-a85fab0a>Renovaci\xF3n autom\xE1tica activada</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.bono.notas) {
        _push(`<div class="mb-4" data-v-a85fab0a><div class="text-xs text-[#5D4A44]/60 mb-1" data-v-a85fab0a>Notas</div><div class="text-sm text-[#5D4A44]/80 p-2 bg-white rounded-lg border border-[#D8AFA0]/20" data-v-a85fab0a>${ssrInterpolate(__props.bono.notas)}</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex gap-2 pt-3 border-t border-[#D8AFA0]/20" data-v-a85fab0a>`);
      if (unref(puedeVerPagos)) {
        _push(`<button class="flex-1 px-4 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors text-sm font-medium flex items-center justify-center gap-2" data-v-a85fab0a><span data-v-a85fab0a>\u{1F4B0}</span><span data-v-a85fab0a>Ver Pagos</span></button>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(puedeRenovar) && __props.bono.estado !== "activo") {
        _push(`<button class="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex items-center justify-center gap-2" data-v-a85fab0a><span data-v-a85fab0a>\u{1F504}</span><span data-v-a85fab0a>Renovar</span></button>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(puedeEditar)) {
        _push(`<button class="px-4 py-2 bg-white border border-[#D8AFA0]/30 text-[#5D4A44] rounded-lg hover:bg-[#D8AFA0]/10 transition-colors text-sm font-medium" data-v-a85fab0a> \u270F\uFE0F </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BonoCard.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$4, [["__scopeId", "data-v-a85fab0a"]]), { __name: "BonoCard" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ModalNuevoBono",
  __ssrInlineRender: true,
  props: {
    mostrar: { type: Boolean },
    pacienteId: {},
    pacienteNombre: {},
    psicologaId: {}
  },
  emits: ["close", "created"],
  setup(__props, { emit: __emit }) {
    useBonos();
    useSupabase();
    const formData = ref({
      tipo: "mensual",
      frecuencia: "semanal",
      sesiones_totales: 4,
      monto: 0,
      fecha_inicio: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      fecha_fin: "",
      estado: "pendiente",
      renovacion_automatica: false,
      notas: ""
    });
    const guardando = ref(false);
    const errorMensaje = ref("");
    const resumenVisible = computed(() => {
      return formData.value.tipo && formData.value.sesiones_totales && formData.value.monto;
    });
    const precioSesion = computed(() => {
      if (!formData.value.sesiones_totales || !formData.value.monto) return "0.00";
      const precio = formData.value.monto / formData.value.sesiones_totales;
      return precio.toFixed(2);
    });
    const formularioValido = computed(() => {
      return !!(formData.value.tipo && formData.value.frecuencia && formData.value.sesiones_totales > 0 && formData.value.monto > 0 && formData.value.estado);
    });
    watch(() => formData.value.tipo, (nuevoTipo) => {
      if (formData.value.fecha_inicio && nuevoTipo) {
        const inicio = new Date(formData.value.fecha_inicio);
        let fin = new Date(inicio);
        switch (nuevoTipo) {
          case "quincenal":
            fin.setDate(fin.getDate() + 15);
            break;
          case "mensual":
            fin.setMonth(fin.getMonth() + 1);
            break;
          case "semestral":
            fin.setMonth(fin.getMonth() + 6);
            break;
        }
        formData.value.fecha_fin = (fin == null ? void 0 : fin.toISOString().split("T")[0]) || "";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.mostrar) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" }, _attrs))}><div class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 max-w-3xl w-full max-h-[90vh] overflow-hidden relative"><div class="absolute inset-0 bg-gradient-to-br from-[#5550F2]/5 via-transparent to-[#04BF9D]/5 pointer-events-none"></div><div class="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#F2B33D]/20 to-[#5550F2]/20 rounded-full blur-2xl"></div><div class="relative max-h-[90vh] overflow-y-auto"><div class="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-8 py-6 flex justify-between items-center z-10"><div class="flex items-center gap-4"><div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5550F2] to-[#027368] shadow-lg flex items-center justify-center"><span class="text-2xl">\u{1F3AB}</span></div><div><h2 class="text-3xl font-[&#39;Elms_Sans&#39;] font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent"> Nuevo Bono </h2><p class="text-sm font-[&#39;Lato&#39;] text-gray-600 mt-1"> Crea un nuevo bono para ${ssrInterpolate(__props.pacienteNombre)}</p></div></div><button class="p-3 text-gray-500 hover:text-[#5550F2] hover:bg-gradient-to-br from-[#5550F2]/10 to-[#027368]/10 rounded-2xl transition-all duration-300 backdrop-blur-sm border border-white/50 hover:shadow-lg" aria-label="Cerrar modal"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><form class="px-8 py-8 space-y-8"><div class="grid grid-cols-2 gap-6"><div><label class="block text-sm font-[&#39;Lato&#39;] font-semibold text-gray-700 mb-3"> Tipo de Bono <span class="text-[#F2B33D]">*</span></label><select required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5550F2]/20 focus:border-[#5550F2] bg-white/80 backdrop-blur-sm transition-all duration-300 font-[&#39;Lato&#39;] hover:bg-white shadow-sm hover:shadow-md"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(formData).tipo) ? ssrLooseContain(unref(formData).tipo, "") : ssrLooseEqual(unref(formData).tipo, "")) ? " selected" : ""}>Seleccionar tipo</option><option value="quincenal"${ssrIncludeBooleanAttr(Array.isArray(unref(formData).tipo) ? ssrLooseContain(unref(formData).tipo, "quincenal") : ssrLooseEqual(unref(formData).tipo, "quincenal")) ? " selected" : ""}>Quincenal</option><option value="mensual"${ssrIncludeBooleanAttr(Array.isArray(unref(formData).tipo) ? ssrLooseContain(unref(formData).tipo, "mensual") : ssrLooseEqual(unref(formData).tipo, "mensual")) ? " selected" : ""}>Mensual</option><option value="semestral"${ssrIncludeBooleanAttr(Array.isArray(unref(formData).tipo) ? ssrLooseContain(unref(formData).tipo, "semestral") : ssrLooseEqual(unref(formData).tipo, "semestral")) ? " selected" : ""}>Semestral</option></select></div><div><label class="block text-sm font-medium text-[#5D4A44] mb-2"> Frecuencia Sugerida <span class="text-red-500">*</span></label><select required class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(formData).frecuencia) ? ssrLooseContain(unref(formData).frecuencia, "") : ssrLooseEqual(unref(formData).frecuencia, "")) ? " selected" : ""}>Seleccionar frecuencia</option><option value="semanal"${ssrIncludeBooleanAttr(Array.isArray(unref(formData).frecuencia) ? ssrLooseContain(unref(formData).frecuencia, "semanal") : ssrLooseEqual(unref(formData).frecuencia, "semanal")) ? " selected" : ""}>Semanal</option><option value="quincenal"${ssrIncludeBooleanAttr(Array.isArray(unref(formData).frecuencia) ? ssrLooseContain(unref(formData).frecuencia, "quincenal") : ssrLooseEqual(unref(formData).frecuencia, "quincenal")) ? " selected" : ""}>Quincenal</option><option value="mensual"${ssrIncludeBooleanAttr(Array.isArray(unref(formData).frecuencia) ? ssrLooseContain(unref(formData).frecuencia, "mensual") : ssrLooseEqual(unref(formData).frecuencia, "mensual")) ? " selected" : ""}>Mensual</option></select></div></div><div><label class="block text-sm font-medium text-[#5D4A44] mb-2"> Sesiones Totales <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", unref(formData).sesiones_totales)} type="number" min="1" max="100" required placeholder="Ej: 4, 8, 12..." class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]"><p class="text-xs text-[#5D4A44]/60 mt-1"> N\xFAmero de sesiones incluidas en el bono </p></div><div><label class="block text-sm font-medium text-[#5D4A44] mb-2"> Monto Total <span class="text-red-500">*</span></label><div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5D4A44]/60">\u20AC</span><input${ssrRenderAttr("value", unref(formData).monto)} type="number" min="0" step="0.01" required placeholder="0.00" class="w-full pl-8 pr-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]"></div><p class="text-xs text-[#5D4A44]/60 mt-1"> Precio total del bono (todas las sesiones) </p></div><div class="grid grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-[#5D4A44] mb-2"> Fecha de Inicio </label><input${ssrRenderAttr("value", unref(formData).fecha_inicio)} type="date" class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]"></div><div><label class="block text-sm font-medium text-[#5D4A44] mb-2"> Fecha de Vencimiento </label><input${ssrRenderAttr("value", unref(formData).fecha_fin)} type="date"${ssrRenderAttr("min", unref(formData).fecha_inicio)} class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]"></div></div><div class="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg"><input${ssrIncludeBooleanAttr(Array.isArray(unref(formData).renovacion_automatica) ? ssrLooseContain(unref(formData).renovacion_automatica, null) : unref(formData).renovacion_automatica) ? " checked" : ""} type="checkbox" id="renovacion-auto" class="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"><label for="renovacion-auto" class="flex-1 cursor-pointer"><div class="text-sm font-medium text-purple-900"> \u{1F504} Renovaci\xF3n Autom\xE1tica </div><div class="text-xs text-purple-700 mt-1"> El bono se renovar\xE1 autom\xE1ticamente cuando se complete o venza </div></label></div><div><label class="block text-sm font-medium text-[#5D4A44] mb-2"> Estado Inicial </label><div class="grid grid-cols-2 gap-3"><label class="${ssrRenderClass([unref(formData).estado === "pendiente" ? "border-yellow-400 bg-yellow-50" : "border-gray-300 hover:border-yellow-300", "flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all"])}"><input${ssrIncludeBooleanAttr(ssrLooseEqual(unref(formData).estado, "pendiente")) ? " checked" : ""} type="radio" value="pendiente" class="w-4 h-4 text-yellow-600"><div><div class="text-sm font-medium text-[#5D4A44]">\u23F3 Pendiente</div><div class="text-xs text-[#5D4A44]/60">Requiere pago</div></div></label><label class="${ssrRenderClass([unref(formData).estado === "activo" ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-green-300", "flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all"])}"><input${ssrIncludeBooleanAttr(ssrLooseEqual(unref(formData).estado, "activo")) ? " checked" : ""} type="radio" value="activo" class="w-4 h-4 text-green-600"><div><div class="text-sm font-medium text-[#5D4A44]">\u2705 Activo</div><div class="text-xs text-[#5D4A44]/60">Ya pagado</div></div></label></div></div><div><label class="block text-sm font-medium text-[#5D4A44] mb-2"> Notas (Opcional) </label><textarea rows="3" placeholder="Informaci\xF3n adicional sobre el bono..." class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] resize-none">${ssrInterpolate(unref(formData).notas)}</textarea></div>`);
        if (unref(resumenVisible)) {
          _push(`<div class="p-4 bg-gradient-to-r from-[#D8AFA0]/10 to-[#ECC8BA]/10 rounded-lg border border-[#D8AFA0]/30"><div class="font-medium text-[#5D4A44] mb-3 flex items-center gap-2"><span>\u{1F4CB}</span> Resumen del Bono </div><div class="grid grid-cols-2 gap-3 text-sm"><div><span class="text-[#5D4A44]/60">Tipo:</span><span class="font-medium text-[#5D4A44] ml-1 capitalize">${ssrInterpolate(unref(formData).tipo || "-")}</span></div><div><span class="text-[#5D4A44]/60">Frecuencia:</span><span class="font-medium text-[#5D4A44] ml-1 capitalize">${ssrInterpolate(unref(formData).frecuencia || "-")}</span></div><div><span class="text-[#5D4A44]/60">Sesiones:</span><span class="font-medium text-[#5D4A44] ml-1">${ssrInterpolate(unref(formData).sesiones_totales || 0)}</span></div><div><span class="text-[#5D4A44]/60">Monto:</span><span class="font-medium text-[#5D4A44] ml-1">\u20AC${ssrInterpolate(unref(formData).monto || 0)}</span></div><div><span class="text-[#5D4A44]/60">Precio/sesi\xF3n:</span><span class="font-medium text-[#5D4A44] ml-1">\u20AC${ssrInterpolate(unref(precioSesion))}</span></div><div><span class="text-[#5D4A44]/60">Estado:</span><span class="${ssrRenderClass([unref(formData).estado === "activo" ? "text-green-600" : "text-yellow-600", "font-medium capitalize ml-1"])}">${ssrInterpolate(unref(formData).estado || "-")}</span></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(errorMensaje)) {
          _push(`<div class="p-4 bg-red-50 border border-red-200 rounded-lg"><p class="text-sm text-red-700 flex items-center gap-2"><span>\u274C</span> ${ssrInterpolate(unref(errorMensaje))}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-3 pt-4 border-t border-[#D8AFA0]/30"><button type="button" class="flex-1 px-6 py-3 bg-white border border-[#D8AFA0]/30 text-[#5D4A44] rounded-lg hover:bg-[#D8AFA0]/10 transition-colors font-medium"${ssrIncludeBooleanAttr(unref(guardando)) ? " disabled" : ""}> Cancelar </button><button type="submit" class="flex-1 px-6 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"${ssrIncludeBooleanAttr(unref(guardando) || !unref(formularioValido)) ? " disabled" : ""}>${ssrInterpolate(unref(guardando) ? "Creando..." : "Crear Bono")}</button></div></form></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalNuevoBono.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$3, { __name: "ModalNuevoBono" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ModalPagosBono",
  __ssrInlineRender: true,
  props: {
    mostrar: { type: Boolean },
    bono: {}
  },
  emits: ["close", "updated"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { getPagosPorBono, puedeGestionarBonos, puedeConfirmarPagos } = useBonos();
    const pagos = ref([]);
    const cargando = ref(false);
    const mostrarFormularioPago = ref(false);
    const guardandoPago = ref(false);
    const confirmandoPago = ref(null);
    const errorMensaje = ref("");
    const exitoMensaje = ref("");
    const nuevoPago = ref({
      monto: 0,
      metodo: "",
      confirmado: false
    });
    const pagosOrdenados = computed(() => {
      return [...pagos.value].sort((a, b) => {
        return new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime();
      });
    });
    const totalPagado = computed(() => {
      return pagos.value.filter((p) => p.confirmado).reduce((sum, p) => sum + (p.monto || 0), 0);
    });
    const montoPendiente = computed(() => {
      var _a;
      const total = ((_a = props.bono) == null ? void 0 : _a.monto) || 0;
      return Math.max(0, total - totalPagado.value);
    });
    const porcentajePagado = computed(() => {
      var _a;
      const total = ((_a = props.bono) == null ? void 0 : _a.monto) || 0;
      if (total === 0) return 0;
      return Math.round(totalPagado.value / total * 100);
    });
    const cargarPagos = async () => {
      var _a;
      if (!((_a = props.bono) == null ? void 0 : _a.id)) return;
      try {
        cargando.value = true;
        errorMensaje.value = "";
        pagos.value = await getPagosPorBono(props.bono.id);
      } catch (err) {
        console.error("[ModalPagosBono] Error al cargar pagos:", err);
        errorMensaje.value = "Error al cargar los pagos";
      } finally {
        cargando.value = false;
      }
    };
    const formatearFecha = (fecha) => {
      if (!fecha) return "";
      try {
        const date = new Date(fecha);
        return date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });
      } catch {
        return fecha;
      }
    };
    const formatearMonto = (monto) => {
      if (!monto) return "\u20AC 0.00";
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
      }).format(monto);
    };
    const obtenerMetodoPagoTexto = (metodo) => {
      const textos = {
        "efectivo": "Efectivo",
        "transferencia": "Transferencia Bancaria",
        "tarjeta": "Tarjeta de Cr\xE9dito/D\xE9bito",
        "bizum": "Bizum",
        "paypal": "PayPal"
      };
      return textos[metodo] || metodo;
    };
    watch(() => props.mostrar, (nuevoValor) => {
      if (nuevoValor) {
        cargarPagos();
      }
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.mostrar) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" }, _attrs))} data-v-46056b94><div class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 max-w-4xl w-full max-h-[90vh] overflow-hidden relative" data-v-46056b94><div class="absolute inset-0 bg-gradient-to-br from-[#5550F2]/5 via-transparent to-[#04BF9D]/5 pointer-events-none" data-v-46056b94></div><div class="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#F2B33D]/20 to-[#5550F2]/20 rounded-full blur-2xl" data-v-46056b94></div><div class="relative max-h-[90vh] overflow-y-auto" data-v-46056b94><div class="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-8 py-6 z-10" data-v-46056b94><div class="flex justify-between items-start" data-v-46056b94><div class="flex-1" data-v-46056b94><div class="flex items-center gap-4 mb-3" data-v-46056b94><div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5550F2] to-[#027368] shadow-lg flex items-center justify-center" data-v-46056b94><span class="text-2xl" data-v-46056b94>\u{1F4B0}</span></div><h2 class="text-3xl font-[&#39;Elms_Sans&#39;] font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent" data-v-46056b94> Pagos del Bono </h2></div><p class="text-sm font-[&#39;Lato&#39;] text-gray-600 ml-18" data-v-46056b94> Gestiona los pagos y confirma transacciones de forma segura </p></div><button class="p-3 text-gray-500 hover:text-[#5550F2] hover:bg-gradient-to-br from-[#5550F2]/10 to-[#027368]/10 rounded-2xl transition-all duration-300 backdrop-blur-sm border border-white/50 hover:shadow-lg" aria-label="Cerrar modal" data-v-46056b94><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-46056b94><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-46056b94></path></svg></button></div>`);
        if (__props.bono) {
          _push(`<div class="mt-6 p-6 bg-gradient-to-r from-[#5550F2]/5 via-[#027368]/5 to-[#04BF9D]/5 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg" data-v-46056b94><div class="grid grid-cols-3 gap-6 text-sm" data-v-46056b94><div class="text-center" data-v-46056b94><div class="text-xs font-[&#39;Lato&#39;] text-gray-500 uppercase tracking-wider mb-2" data-v-46056b94>Tipo</div><div class="font-[&#39;Lato&#39;] font-semibold text-gray-800 capitalize text-lg" data-v-46056b94>${ssrInterpolate(__props.bono.tipo)}</div></div><div class="text-center" data-v-46056b94><div class="text-xs font-[&#39;Lato&#39;] text-gray-500 uppercase tracking-wider mb-2" data-v-46056b94>Monto Total</div><div class="font-[&#39;Elms_Sans&#39;] font-bold bg-gradient-to-r from-[#F2B33D] to-[#5550F2] bg-clip-text text-transparent text-2xl" data-v-46056b94>${ssrInterpolate(formatearMonto(__props.bono.monto))}</div></div><div class="text-center" data-v-46056b94><div class="text-xs font-[&#39;Lato&#39;] text-gray-500 uppercase tracking-wider mb-2" data-v-46056b94>Estado</div><div class="${ssrRenderClass([__props.bono.pagado ? "text-[#04BF9D]" : "text-[#F2B33D]", "font-['Lato'] font-semibold text-lg capitalize"])}" data-v-46056b94>${ssrInterpolate(__props.bono.pagado ? "\u2713 Pagado" : "\u23F3 Pendiente")}</div></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="px-6 py-6 space-y-6" data-v-46056b94><div class="p-4 bg-white border-2 border-[#D8AFA0]/30 rounded-xl" data-v-46056b94><div class="grid grid-cols-3 gap-4 text-center" data-v-46056b94><div data-v-46056b94><div class="text-2xl font-bold text-green-600" data-v-46056b94>${ssrInterpolate(formatearMonto(unref(totalPagado)))}</div><div class="text-xs text-[#5D4A44]/60 mt-1" data-v-46056b94>Total Pagado</div></div><div data-v-46056b94><div class="text-2xl font-bold text-orange-600" data-v-46056b94>${ssrInterpolate(formatearMonto(unref(montoPendiente)))}</div><div class="text-xs text-[#5D4A44]/60 mt-1" data-v-46056b94>Pendiente</div></div><div data-v-46056b94><div class="text-2xl font-bold text-[#5D4A44]" data-v-46056b94>${ssrInterpolate(unref(pagos).length)}</div><div class="text-xs text-[#5D4A44]/60 mt-1" data-v-46056b94>Transacciones</div></div></div><div class="mt-4" data-v-46056b94><div class="flex justify-between text-xs text-[#5D4A44]/60 mb-1" data-v-46056b94><span data-v-46056b94>Progreso de pago</span><span data-v-46056b94>${ssrInterpolate(unref(porcentajePagado))}%</span></div><div class="w-full bg-gray-200 rounded-full h-2" data-v-46056b94><div class="${ssrRenderClass([unref(porcentajePagado) >= 100 ? "bg-green-500" : "bg-gradient-to-r from-[#D8AFA0] to-[#ECC8BA]", "h-2 rounded-full transition-all duration-500"])}" style="${ssrRenderStyle({ width: Math.min(unref(porcentajePagado), 100) + "%" })}" data-v-46056b94></div></div></div></div>`);
        if (unref(puedeGestionarBonos)) {
          _push(`<div class="flex justify-end" data-v-46056b94><button class="px-4 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors font-medium flex items-center gap-2" data-v-46056b94><span data-v-46056b94>${ssrInterpolate(unref(mostrarFormularioPago) ? "\u2715" : "+")}</span><span data-v-46056b94>${ssrInterpolate(unref(mostrarFormularioPago) ? "Cancelar" : "Registrar Pago")}</span></button></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(mostrarFormularioPago)) {
          _push(`<div class="p-5 bg-green-50 border-2 border-green-300 rounded-xl" data-v-46056b94><h3 class="font-[&#39;Lora&#39;] text-lg font-semibold text-[#5D4A44] mb-4 flex items-center gap-2" data-v-46056b94><span data-v-46056b94>\u{1F4B3}</span> Registrar Nuevo Pago </h3><form class="space-y-4" data-v-46056b94><div class="grid grid-cols-2 gap-4" data-v-46056b94><div data-v-46056b94><label class="block text-sm font-medium text-[#5D4A44] mb-2" data-v-46056b94> Monto <span class="text-red-500" data-v-46056b94>*</span></label><div class="relative" data-v-46056b94><span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5D4A44]/60" data-v-46056b94>\u20AC</span><input${ssrRenderAttr("value", unref(nuevoPago).monto)} type="number" min="0" step="0.01" required placeholder="0.00" class="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white" data-v-46056b94></div></div><div data-v-46056b94><label class="block text-sm font-medium text-[#5D4A44] mb-2" data-v-46056b94> M\xE9todo de Pago <span class="text-red-500" data-v-46056b94>*</span></label><select required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white" data-v-46056b94><option value="" data-v-46056b94${ssrIncludeBooleanAttr(Array.isArray(unref(nuevoPago).metodo) ? ssrLooseContain(unref(nuevoPago).metodo, "") : ssrLooseEqual(unref(nuevoPago).metodo, "")) ? " selected" : ""}>Seleccionar m\xE9todo</option><option value="efectivo" data-v-46056b94${ssrIncludeBooleanAttr(Array.isArray(unref(nuevoPago).metodo) ? ssrLooseContain(unref(nuevoPago).metodo, "efectivo") : ssrLooseEqual(unref(nuevoPago).metodo, "efectivo")) ? " selected" : ""}>\u{1F4B5} Efectivo</option><option value="transferencia" data-v-46056b94${ssrIncludeBooleanAttr(Array.isArray(unref(nuevoPago).metodo) ? ssrLooseContain(unref(nuevoPago).metodo, "transferencia") : ssrLooseEqual(unref(nuevoPago).metodo, "transferencia")) ? " selected" : ""}>\u{1F3E6} Transferencia</option><option value="tarjeta" data-v-46056b94${ssrIncludeBooleanAttr(Array.isArray(unref(nuevoPago).metodo) ? ssrLooseContain(unref(nuevoPago).metodo, "tarjeta") : ssrLooseEqual(unref(nuevoPago).metodo, "tarjeta")) ? " selected" : ""}>\u{1F4B3} Tarjeta</option><option value="bizum" data-v-46056b94${ssrIncludeBooleanAttr(Array.isArray(unref(nuevoPago).metodo) ? ssrLooseContain(unref(nuevoPago).metodo, "bizum") : ssrLooseEqual(unref(nuevoPago).metodo, "bizum")) ? " selected" : ""}>\u{1F4F1} Bizum</option><option value="paypal" data-v-46056b94${ssrIncludeBooleanAttr(Array.isArray(unref(nuevoPago).metodo) ? ssrLooseContain(unref(nuevoPago).metodo, "paypal") : ssrLooseEqual(unref(nuevoPago).metodo, "paypal")) ? " selected" : ""}>\u{1F17F}\uFE0F PayPal</option></select></div></div>`);
          if (unref(puedeConfirmarPagos)) {
            _push(`<div class="flex items-center gap-2 p-3 bg-white border border-green-300 rounded-lg" data-v-46056b94><input${ssrIncludeBooleanAttr(Array.isArray(unref(nuevoPago).confirmado) ? ssrLooseContain(unref(nuevoPago).confirmado, null) : unref(nuevoPago).confirmado) ? " checked" : ""} type="checkbox" id="confirmar-pago" class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" data-v-46056b94><label for="confirmar-pago" class="text-sm text-[#5D4A44] cursor-pointer" data-v-46056b94> \u2713 Confirmar pago inmediatamente (ya verificado) </label></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex gap-3" data-v-46056b94><button type="button" class="flex-1 px-4 py-2 bg-white border border-gray-300 text-[#5D4A44] rounded-lg hover:bg-gray-50 transition-colors" data-v-46056b94> Cancelar </button><button type="submit" class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"${ssrIncludeBooleanAttr(unref(guardandoPago)) ? " disabled" : ""} data-v-46056b94>${ssrInterpolate(unref(guardandoPago) ? "Registrando..." : "Guardar Pago")}</button></div></form></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div data-v-46056b94><h3 class="font-[&#39;Lora&#39;] text-lg font-semibold text-[#5D4A44] mb-4 flex items-center gap-2" data-v-46056b94><span data-v-46056b94>\u{1F4DC}</span> Historial de Pagos (${ssrInterpolate(unref(pagos).length)}) </h3>`);
        if (unref(cargando)) {
          _push(`<div class="text-center py-8" data-v-46056b94><div class="animate-spin w-10 h-10 border-4 border-[#D8AFA0] border-t-transparent rounded-full mx-auto mb-3" data-v-46056b94></div><p class="text-[#5D4A44]/60" data-v-46056b94>Cargando pagos...</p></div>`);
        } else if (unref(pagos).length === 0) {
          _push(`<div class="text-center py-12" data-v-46056b94><span class="text-6xl mb-3 block opacity-40" data-v-46056b94>\u{1F4B8}</span><p class="text-[#5D4A44]/60" data-v-46056b94>No hay pagos registrados a\xFAn</p></div>`);
        } else {
          _push(`<div class="space-y-3" data-v-46056b94><!--[-->`);
          ssrRenderList(unref(pagosOrdenados), (pago) => {
            _push(`<div class="${ssrRenderClass([pago.confirmado ? "bg-green-50 border-green-300" : "bg-yellow-50 border-yellow-300", "p-4 border-2 rounded-lg transition-all"])}" data-v-46056b94><div class="flex items-start justify-between gap-4" data-v-46056b94><div class="flex-1" data-v-46056b94><div class="flex items-center gap-3 mb-2" data-v-46056b94><span class="${ssrRenderClass([pago.confirmado ? "text-green-600" : "text-yellow-600", "text-2xl font-bold"])}" data-v-46056b94>${ssrInterpolate(formatearMonto(pago.monto))}</span><span class="${ssrRenderClass([pago.confirmado ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800", "px-2 py-1 rounded-full text-xs font-medium capitalize"])}" data-v-46056b94>${ssrInterpolate(pago.confirmado ? "\u2713 Confirmado" : "\u23F3 Pendiente")}</span></div><div class="space-y-1 text-sm text-[#5D4A44]/70" data-v-46056b94><div class="flex items-center gap-2" data-v-46056b94><span data-v-46056b94>\u{1F4B3}</span><span class="capitalize" data-v-46056b94>${ssrInterpolate(obtenerMetodoPagoTexto(pago.metodo_pago))}</span></div><div class="flex items-center gap-2" data-v-46056b94><span data-v-46056b94>\u{1F4C5}</span><span data-v-46056b94>${ssrInterpolate(formatearFecha(pago.fecha_pago))}</span></div>`);
            if (pago.confirmado && pago.fecha_confirmacion) {
              _push(`<div class="flex items-center gap-2" data-v-46056b94><span data-v-46056b94>\u2705</span><span data-v-46056b94>Confirmado el ${ssrInterpolate(formatearFecha(pago.fecha_confirmacion))}</span></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
            if (unref(puedeConfirmarPagos) && !pago.confirmado) {
              _push(`<div data-v-46056b94><button class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"${ssrIncludeBooleanAttr(unref(confirmandoPago) === pago.id) ? " disabled" : ""} data-v-46056b94>${ssrInterpolate(unref(confirmandoPago) === pago.id ? "Confirmando..." : "\u2713 Confirmar")}</button></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div>`);
        if (unref(errorMensaje)) {
          _push(`<div class="p-4 bg-red-50 border border-red-200 rounded-lg" data-v-46056b94><p class="text-sm text-red-700 flex items-center gap-2" data-v-46056b94><span data-v-46056b94>\u274C</span> ${ssrInterpolate(unref(errorMensaje))}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(exitoMensaje)) {
          _push(`<div class="p-4 bg-green-50 border border-green-200 rounded-lg" data-v-46056b94><p class="text-sm text-green-700 flex items-center gap-2" data-v-46056b94><span data-v-46056b94>\u2705</span> ${ssrInterpolate(unref(exitoMensaje))}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="sticky bottom-0 bg-[#F9F7F3] border-t border-[#D8AFA0]/30 px-6 py-4" data-v-46056b94><button class="w-full px-6 py-3 bg-[#5D4A44] text-white rounded-lg hover:bg-[#4A3A34] transition-colors font-medium" data-v-46056b94> Cerrar </button></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalPagosBono.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-46056b94"]]), { __name: "ModalPagosBono" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ModalRenovacionBono",
  __ssrInlineRender: true,
  props: {
    mostrar: { type: Boolean },
    bono: {}
  },
  emits: ["close", "renovated"],
  setup(__props, { emit: __emit }) {
    var _a, _b;
    const props = __props;
    useBonos();
    const mantenerValoresOriginales = ref(true);
    const renovando = ref(false);
    const errorMensaje = ref("");
    const formData = ref({
      sesiones_nuevas: ((_a = props.bono) == null ? void 0 : _a.sesiones_totales) || 0,
      monto_nuevo: ((_b = props.bono) == null ? void 0 : _b.monto) || 0,
      motivo: ""
    });
    const estadoColor = computed(() => {
      var _a2;
      const colores = {
        "pendiente": "text-yellow-600",
        "activo": "text-green-600",
        "completado": "text-gray-600",
        "vencido": "text-red-600",
        "cancelado": "text-gray-500"
      };
      return colores[(_a2 = props.bono) == null ? void 0 : _a2.estado] || "text-gray-600";
    });
    const precioSesionOriginal = computed(() => {
      var _a2, _b2;
      if (!((_a2 = props.bono) == null ? void 0 : _a2.sesiones_totales) || !((_b2 = props.bono) == null ? void 0 : _b2.monto)) return "0.00";
      const precio = props.bono.monto / props.bono.sesiones_totales;
      return precio.toFixed(2);
    });
    const precioSesionNuevo = computed(() => {
      if (!formData.value.sesiones_nuevas || !formData.value.monto_nuevo) return "0.00";
      const precio = formData.value.monto_nuevo / formData.value.sesiones_nuevas;
      return precio.toFixed(2);
    });
    const formatearMonto = (monto) => {
      if (!monto) return "\u20AC 0.00";
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
      }).format(monto);
    };
    watch(() => props.bono, (nuevoBono) => {
      if (nuevoBono) {
        formData.value.sesiones_nuevas = nuevoBono.sesiones_totales || 0;
        formData.value.monto_nuevo = nuevoBono.monto || 0;
      }
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.mostrar) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" }, _attrs))}><div class="bg-[#F9F7F3] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"><div class="sticky top-0 bg-[#F9F7F3] border-b border-[#D8AFA0]/30 px-6 py-4 flex justify-between items-center"><div><h2 class="text-2xl font-[&#39;Lora&#39;] text-[#5D4A44] font-semibold flex items-center gap-2"><span class="text-2xl">\u{1F504}</span> Renovar Bono </h2><p class="text-sm text-[#5D4A44]/60 mt-1"> Crea una nueva renovaci\xF3n basada en el bono actual </p></div><button class="text-[#5D4A44] hover:text-[#D8AFA0] transition-colors" aria-label="Cerrar modal"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="px-6 py-6 space-y-6"><div class="p-5 bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-300 rounded-xl"><h3 class="font-[&#39;Lora&#39;] text-lg font-semibold text-[#5D4A44] mb-4 flex items-center gap-2"><span>\u{1F4CB}</span> Bono Actual </h3><div class="grid grid-cols-2 gap-4 text-sm"><div class="p-3 bg-white rounded-lg"><div class="text-[#5D4A44]/60 mb-1">Tipo</div><div class="font-medium text-[#5D4A44] capitalize">${ssrInterpolate(__props.bono.tipo)}</div></div><div class="p-3 bg-white rounded-lg"><div class="text-[#5D4A44]/60 mb-1">Frecuencia</div><div class="font-medium text-[#5D4A44] capitalize">${ssrInterpolate(__props.bono.frecuencia)}</div></div><div class="p-3 bg-white rounded-lg"><div class="text-[#5D4A44]/60 mb-1">Sesiones Totales</div><div class="font-medium text-[#5D4A44]">${ssrInterpolate(__props.bono.sesiones_totales)}</div></div><div class="p-3 bg-white rounded-lg"><div class="text-[#5D4A44]/60 mb-1">Sesiones Restantes</div><div class="font-medium text-[#5D4A44]">${ssrInterpolate(__props.bono.sesiones_restantes || 0)}</div></div><div class="p-3 bg-white rounded-lg"><div class="text-[#5D4A44]/60 mb-1">Monto</div><div class="font-bold text-[#D8AFA0] text-lg">${ssrInterpolate(formatearMonto(__props.bono.monto))}</div></div><div class="p-3 bg-white rounded-lg"><div class="text-[#5D4A44]/60 mb-1">Estado</div><div class="${ssrRenderClass([unref(estadoColor), "font-medium capitalize"])}">${ssrInterpolate(__props.bono.estado)}</div></div></div></div><form class="space-y-5"><div class="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl"><h3 class="font-[&#39;Lora&#39;] text-lg font-semibold text-[#5D4A44] mb-4 flex items-center gap-2"><span>\u2728</span> Datos del Nuevo Bono </h3><div class="mb-5 p-3 bg-white border border-purple-200 rounded-lg"><label class="flex items-center gap-3 cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(unref(mantenerValoresOriginales)) ? ssrLooseContain(unref(mantenerValoresOriginales), null) : unref(mantenerValoresOriginales)) ? " checked" : ""} type="checkbox" class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"><div><div class="text-sm font-medium text-[#5D4A44]"> Mantener los mismos valores del bono original </div><div class="text-xs text-[#5D4A44]/60 mt-1"> Si lo desmarcas, podr\xE1s personalizar las sesiones y el monto </div></div></label></div>`);
        if (!unref(mantenerValoresOriginales)) {
          _push(`<div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-[#5D4A44] mb-2"> Sesiones Totales </label><input${ssrRenderAttr("value", unref(formData).sesiones_nuevas)} type="number" min="1" max="100" required class="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"></div><div><label class="block text-sm font-medium text-[#5D4A44] mb-2"> Monto Total </label><div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5D4A44]/60">\u20AC</span><input${ssrRenderAttr("value", unref(formData).monto_nuevo)} type="number" min="0" step="0.01" required placeholder="0.00" class="w-full pl-8 pr-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"></div></div></div><div class="p-3 bg-purple-100 rounded-lg text-sm"><div class="flex justify-between mb-1"><span class="text-[#5D4A44]/70">Precio por sesi\xF3n (nuevo):</span><span class="font-bold text-purple-700">\u20AC${ssrInterpolate(unref(precioSesionNuevo))}</span></div><div class="flex justify-between"><span class="text-[#5D4A44]/70">Precio por sesi\xF3n (original):</span><span class="font-medium text-[#5D4A44]/60">\u20AC${ssrInterpolate(unref(precioSesionOriginal))}</span></div></div></div>`);
        } else {
          _push(`<div class="p-4 bg-green-50 border border-green-300 rounded-lg"><p class="text-sm text-green-700 flex items-center gap-2"><span>\u2713</span> Se duplicar\xE1n los valores originales: <strong>${ssrInterpolate(__props.bono.sesiones_totales)} sesiones</strong> por <strong>${ssrInterpolate(formatearMonto(__props.bono.monto))}</strong></p></div>`);
        }
        _push(`</div><div><label class="block text-sm font-medium text-[#5D4A44] mb-2"> Motivo de la Renovaci\xF3n (Opcional) </label><textarea rows="3" placeholder="Explica por qu\xE9 se renueva este bono..." class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] resize-none">${ssrInterpolate(unref(formData).motivo)}</textarea></div><div class="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg"><h4 class="font-medium text-blue-900 mb-2 flex items-center gap-2"><span>\u2139\uFE0F</span> Informaci\xF3n Importante </h4><ul class="text-sm text-blue-800 space-y-1.5"><li class="flex items-start gap-2"><span class="mt-0.5">\u2022</span><span>El bono actual se marcar\xE1 como <strong>completado</strong></span></li><li class="flex items-start gap-2"><span class="mt-0.5">\u2022</span><span>Se crear\xE1 un <strong>nuevo bono</strong> con estado <strong>pendiente</strong> hasta que se confirme el pago</span></li><li class="flex items-start gap-2"><span class="mt-0.5">\u2022</span><span>La fecha de inicio ser\xE1 <strong>hoy</strong> y la de vencimiento se calcular\xE1 autom\xE1ticamente</span></li><li class="flex items-start gap-2"><span class="mt-0.5">\u2022</span><span>Se guardar\xE1 un registro en el historial de renovaciones</span></li></ul></div>`);
        if (unref(errorMensaje)) {
          _push(`<div class="p-4 bg-red-50 border border-red-200 rounded-lg"><p class="text-sm text-red-700 flex items-center gap-2"><span>\u274C</span> ${ssrInterpolate(unref(errorMensaje))}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-3 pt-4 border-t border-[#D8AFA0]/30"><button type="button" class="flex-1 px-6 py-3 bg-white border border-[#D8AFA0]/30 text-[#5D4A44] rounded-lg hover:bg-[#D8AFA0]/10 transition-colors font-medium"${ssrIncludeBooleanAttr(unref(renovando)) ? " disabled" : ""}> Cancelar </button><button type="submit" class="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"${ssrIncludeBooleanAttr(unref(renovando)) ? " disabled" : ""}>`);
        if (unref(renovando)) {
          _push(`<span>\u23F3</span>`);
        } else {
          _push(`<span>\u{1F504}</span>`);
        }
        _push(`<span>${ssrInterpolate(unref(renovando) ? "Renovando..." : "Confirmar Renovaci\xF3n")}</span></button></div></form></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalRenovacionBono.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$1, { __name: "ModalRenovacionBono" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "bonos",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    const supabase = useSupabaseClient();
    const { userProfile } = useSupabase();
    const {
      getBonosPorPaciente,
      calcularMetricas,
      puedeGestionarBonos
    } = useBonos();
    const pacienteId = computed(() => route.params.id);
    const psicologaId = computed(() => {
      var _a;
      return ((_a = userProfile.value) == null ? void 0 : _a.id) || "";
    });
    const cargando = ref(true);
    const error = ref(null);
    const bonos2 = ref([]);
    const pacienteNombre = ref("");
    const metricas = ref({
      total: 0,
      activos: 0,
      completados: 0,
      vencidos: 0,
      pendientes: 0,
      proximosAVencer: 0,
      pocasSesiones: 0
    });
    const filtroEstado = ref("todos");
    const filtroTipo = ref("todos");
    const ordenamiento = ref("reciente");
    const modalNuevoBonoAbierto = ref(false);
    const modalPagosAbierto = ref(false);
    const modalRenovacionAbierto = ref(false);
    const bonoSeleccionado = ref(null);
    const bonosFiltrados = computed(() => {
      let resultado = [...bonos2.value];
      if (filtroEstado.value !== "todos") {
        resultado = resultado.filter((b) => b.estado === filtroEstado.value);
      }
      if (filtroTipo.value !== "todos") {
        resultado = resultado.filter((b) => b.tipo === filtroTipo.value);
      }
      if (ordenamiento.value === "reciente") {
        resultado.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (ordenamiento.value === "antiguo") {
        resultado.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      } else if (ordenamiento.value === "vencimiento") {
        resultado.sort((a, b) => {
          if (!a.fecha_fin) return 1;
          if (!b.fecha_fin) return -1;
          return new Date(a.fecha_fin).getTime() - new Date(b.fecha_fin).getTime();
        });
      }
      return resultado;
    });
    const alertasVisibles = computed(() => {
      return metricas.value.proximosAVencer > 0 || metricas.value.pocasSesiones > 0;
    });
    const cargarBonos = async () => {
      try {
        cargando.value = true;
        error.value = null;
        const { data: paciente, error: errorPaciente } = await supabase.from("pacientes").select("nombre, email").eq("id", pacienteId.value).single();
        if (errorPaciente) throw errorPaciente;
        pacienteNombre.value = (paciente == null ? void 0 : paciente.nombre) || (paciente == null ? void 0 : paciente.email) || "Paciente";
        bonos2.value = await getBonosPorPaciente(pacienteId.value);
        metricas.value = await calcularMetricas(pacienteId.value);
      } catch (err) {
        console.error("[BonosPage] Error al cargar bonos:", err);
        error.value = err.message || "Error al cargar los bonos";
      } finally {
        cargando.value = false;
      }
    };
    const limpiarFiltros = () => {
      filtroEstado.value = "todos";
      filtroTipo.value = "todos";
      ordenamiento.value = "reciente";
    };
    const abrirModalNuevoBono = () => {
      modalNuevoBonoAbierto.value = true;
    };
    const cerrarModalNuevoBono = () => {
      modalNuevoBonoAbierto.value = false;
    };
    const onBonoCreado = async () => {
      await cargarBonos();
    };
    const abrirModalPagos = (bono) => {
      bonoSeleccionado.value = bono;
      modalPagosAbierto.value = true;
    };
    const cerrarModalPagos = () => {
      modalPagosAbierto.value = false;
      bonoSeleccionado.value = null;
    };
    const onPagosActualizados = async () => {
      await cargarBonos();
    };
    const abrirModalRenovacion = (bono) => {
      bonoSeleccionado.value = bono;
      modalRenovacionAbierto.value = true;
    };
    const cerrarModalRenovacion = () => {
      modalRenovacionAbierto.value = false;
      bonoSeleccionado.value = null;
    };
    const onBonoRenovado = async () => {
      await cargarBonos();
    };
    const editarBono = (bono) => {
      console.log("Editar bono:", bono);
      alert("Funci\xF3n de edici\xF3n en desarrollo");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_DashboardCard = _sfc_main$5;
      const _component_BonoCard = __nuxt_component_1;
      const _component_ModalNuevoBono = __nuxt_component_2;
      const _component_ModalPagosBono = __nuxt_component_3;
      const _component_ModalRenovacionBono = __nuxt_component_4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bonos-container pb-20" }, _attrs))} data-v-64cfe15d><button class="mb-6 flex items-center gap-2 text-[#5D4A44] hover:text-[#D8AFA0] transition-colors" data-v-64cfe15d><span data-v-64cfe15d>\u2190</span><span data-v-64cfe15d>Volver a ficha del paciente</span></button><header class="mb-6" data-v-64cfe15d><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" data-v-64cfe15d><div data-v-64cfe15d><h1 class="text-3xl font-[&#39;Lora&#39;] font-bold text-[#5D4A44] mb-2 flex items-center gap-3" data-v-64cfe15d><span class="text-4xl" data-v-64cfe15d>\u{1F3AB}</span> Bonos de ${ssrInterpolate(unref(pacienteNombre))}</h1><p class="text-[#5D4A44]/60" data-v-64cfe15d> Gestiona los bonos, pagos y renovaciones del paciente </p></div>`);
      if (unref(puedeGestionarBonos)) {
        _push(`<button class="px-6 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors font-medium flex items-center gap-2 shadow-lg" data-v-64cfe15d><span class="text-xl" data-v-64cfe15d>+</span><span data-v-64cfe15d>Nuevo Bono</span></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></header>`);
      if (unref(cargando)) {
        _push(`<div class="text-center py-16" data-v-64cfe15d><div class="animate-spin w-16 h-16 border-4 border-[#D8AFA0] border-t-transparent rounded-full mx-auto mb-4" data-v-64cfe15d></div><p class="text-[#5D4A44]/60" data-v-64cfe15d>Cargando bonos...</p></div>`);
      } else if (unref(error)) {
        _push(`<div class="text-center py-16" data-v-64cfe15d>`);
        _push(ssrRenderComponent(_component_DashboardCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-7xl mb-4 block" data-v-64cfe15d${_scopeId}>\u274C</span><h3 class="text-xl font-[&#39;Lora&#39;] font-semibold text-[#5D4A44] mb-2" data-v-64cfe15d${_scopeId}> Error al cargar bonos </h3><p class="text-[#5D4A44]/60 mb-4" data-v-64cfe15d${_scopeId}>${ssrInterpolate(unref(error))}</p><button class="px-6 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors" data-v-64cfe15d${_scopeId}> Intentar de nuevo </button>`);
            } else {
              return [
                createVNode("span", { class: "text-7xl mb-4 block" }, "\u274C"),
                createVNode("h3", { class: "text-xl font-['Lora'] font-semibold text-[#5D4A44] mb-2" }, " Error al cargar bonos "),
                createVNode("p", { class: "text-[#5D4A44]/60 mb-4" }, toDisplayString(unref(error)), 1),
                createVNode("button", {
                  onClick: cargarBonos,
                  class: "px-6 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors"
                }, " Intentar de nuevo ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div data-v-64cfe15d><section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-v-64cfe15d>`);
        _push(ssrRenderComponent(_component_DashboardCard, { class: "bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center justify-between" data-v-64cfe15d${_scopeId}><div data-v-64cfe15d${_scopeId}><p class="text-sm text-purple-600 font-medium mb-1" data-v-64cfe15d${_scopeId}>Total Bonos</p><p class="text-3xl font-bold text-purple-700" data-v-64cfe15d${_scopeId}>${ssrInterpolate(unref(metricas).total)}</p></div><span class="text-4xl" data-v-64cfe15d${_scopeId}>\u{1F3AB}</span></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center justify-between" }, [
                  createVNode("div", null, [
                    createVNode("p", { class: "text-sm text-purple-600 font-medium mb-1" }, "Total Bonos"),
                    createVNode("p", { class: "text-3xl font-bold text-purple-700" }, toDisplayString(unref(metricas).total), 1)
                  ]),
                  createVNode("span", { class: "text-4xl" }, "\u{1F3AB}")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_DashboardCard, { class: "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center justify-between" data-v-64cfe15d${_scopeId}><div data-v-64cfe15d${_scopeId}><p class="text-sm text-green-600 font-medium mb-1" data-v-64cfe15d${_scopeId}>Activos</p><p class="text-3xl font-bold text-green-700" data-v-64cfe15d${_scopeId}>${ssrInterpolate(unref(metricas).activos)}</p></div><span class="text-4xl" data-v-64cfe15d${_scopeId}>\u2705</span></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center justify-between" }, [
                  createVNode("div", null, [
                    createVNode("p", { class: "text-sm text-green-600 font-medium mb-1" }, "Activos"),
                    createVNode("p", { class: "text-3xl font-bold text-green-700" }, toDisplayString(unref(metricas).activos), 1)
                  ]),
                  createVNode("span", { class: "text-4xl" }, "\u2705")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_DashboardCard, { class: "bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center justify-between" data-v-64cfe15d${_scopeId}><div data-v-64cfe15d${_scopeId}><p class="text-sm text-orange-600 font-medium mb-1" data-v-64cfe15d${_scopeId}>Por Vencer</p><p class="text-3xl font-bold text-orange-700" data-v-64cfe15d${_scopeId}>${ssrInterpolate(unref(metricas).proximosAVencer)}</p></div><span class="text-4xl" data-v-64cfe15d${_scopeId}>\u26A0\uFE0F</span></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center justify-between" }, [
                  createVNode("div", null, [
                    createVNode("p", { class: "text-sm text-orange-600 font-medium mb-1" }, "Por Vencer"),
                    createVNode("p", { class: "text-3xl font-bold text-orange-700" }, toDisplayString(unref(metricas).proximosAVencer), 1)
                  ]),
                  createVNode("span", { class: "text-4xl" }, "\u26A0\uFE0F")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_DashboardCard, { class: "bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center justify-between" data-v-64cfe15d${_scopeId}><div data-v-64cfe15d${_scopeId}><p class="text-sm text-yellow-600 font-medium mb-1" data-v-64cfe15d${_scopeId}>Pendientes</p><p class="text-3xl font-bold text-yellow-700" data-v-64cfe15d${_scopeId}>${ssrInterpolate(unref(metricas).pendientes)}</p></div><span class="text-4xl" data-v-64cfe15d${_scopeId}>\u23F3</span></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center justify-between" }, [
                  createVNode("div", null, [
                    createVNode("p", { class: "text-sm text-yellow-600 font-medium mb-1" }, "Pendientes"),
                    createVNode("p", { class: "text-3xl font-bold text-yellow-700" }, toDisplayString(unref(metricas).pendientes), 1)
                  ]),
                  createVNode("span", { class: "text-4xl" }, "\u23F3")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</section><section class="mb-6" data-v-64cfe15d>`);
        _push(ssrRenderComponent(_component_DashboardCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex flex-col md:flex-row gap-4" data-v-64cfe15d${_scopeId}><div class="flex-1" data-v-64cfe15d${_scopeId}><label class="block text-sm font-medium text-[#5D4A44] mb-2" data-v-64cfe15d${_scopeId}> Filtrar por Estado </label><select class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white" data-v-64cfe15d${_scopeId}><option value="todos" data-v-64cfe15d${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "todos") : ssrLooseEqual(unref(filtroEstado), "todos")) ? " selected" : ""}${_scopeId}>Todos los estados</option><option value="activo" data-v-64cfe15d${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "activo") : ssrLooseEqual(unref(filtroEstado), "activo")) ? " selected" : ""}${_scopeId}>\u2705 Activos</option><option value="pendiente" data-v-64cfe15d${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "pendiente") : ssrLooseEqual(unref(filtroEstado), "pendiente")) ? " selected" : ""}${_scopeId}>\u23F3 Pendientes</option><option value="completado" data-v-64cfe15d${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "completado") : ssrLooseEqual(unref(filtroEstado), "completado")) ? " selected" : ""}${_scopeId}>\u2714\uFE0F Completados</option><option value="vencido" data-v-64cfe15d${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "vencido") : ssrLooseEqual(unref(filtroEstado), "vencido")) ? " selected" : ""}${_scopeId}>\u274C Vencidos</option><option value="cancelado" data-v-64cfe15d${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "cancelado") : ssrLooseEqual(unref(filtroEstado), "cancelado")) ? " selected" : ""}${_scopeId}>\u{1F6AB} Cancelados</option></select></div><div class="flex-1" data-v-64cfe15d${_scopeId}><label class="block text-sm font-medium text-[#5D4A44] mb-2" data-v-64cfe15d${_scopeId}> Filtrar por Tipo </label><select class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white" data-v-64cfe15d${_scopeId}><option value="todos" data-v-64cfe15d${ssrIncludeBooleanAttr(Array.isArray(unref(filtroTipo)) ? ssrLooseContain(unref(filtroTipo), "todos") : ssrLooseEqual(unref(filtroTipo), "todos")) ? " selected" : ""}${_scopeId}>Todos los tipos</option><option value="quincenal" data-v-64cfe15d${ssrIncludeBooleanAttr(Array.isArray(unref(filtroTipo)) ? ssrLooseContain(unref(filtroTipo), "quincenal") : ssrLooseEqual(unref(filtroTipo), "quincenal")) ? " selected" : ""}${_scopeId}>Quincenal</option><option value="mensual" data-v-64cfe15d${ssrIncludeBooleanAttr(Array.isArray(unref(filtroTipo)) ? ssrLooseContain(unref(filtroTipo), "mensual") : ssrLooseEqual(unref(filtroTipo), "mensual")) ? " selected" : ""}${_scopeId}>Mensual</option><option value="semestral" data-v-64cfe15d${ssrIncludeBooleanAttr(Array.isArray(unref(filtroTipo)) ? ssrLooseContain(unref(filtroTipo), "semestral") : ssrLooseEqual(unref(filtroTipo), "semestral")) ? " selected" : ""}${_scopeId}>Semestral</option></select></div><div class="flex-1" data-v-64cfe15d${_scopeId}><label class="block text-sm font-medium text-[#5D4A44] mb-2" data-v-64cfe15d${_scopeId}> Ordenar por </label><select class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white" data-v-64cfe15d${_scopeId}><option value="reciente" data-v-64cfe15d${ssrIncludeBooleanAttr(Array.isArray(unref(ordenamiento)) ? ssrLooseContain(unref(ordenamiento), "reciente") : ssrLooseEqual(unref(ordenamiento), "reciente")) ? " selected" : ""}${_scopeId}>M\xE1s recientes</option><option value="antiguo" data-v-64cfe15d${ssrIncludeBooleanAttr(Array.isArray(unref(ordenamiento)) ? ssrLooseContain(unref(ordenamiento), "antiguo") : ssrLooseEqual(unref(ordenamiento), "antiguo")) ? " selected" : ""}${_scopeId}>M\xE1s antiguos</option><option value="vencimiento" data-v-64cfe15d${ssrIncludeBooleanAttr(Array.isArray(unref(ordenamiento)) ? ssrLooseContain(unref(ordenamiento), "vencimiento") : ssrLooseEqual(unref(ordenamiento), "vencimiento")) ? " selected" : ""}${_scopeId}>Por vencimiento</option></select></div></div>`);
            } else {
              return [
                createVNode("div", { class: "flex flex-col md:flex-row gap-4" }, [
                  createVNode("div", { class: "flex-1" }, [
                    createVNode("label", { class: "block text-sm font-medium text-[#5D4A44] mb-2" }, " Filtrar por Estado "),
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => isRef(filtroEstado) ? filtroEstado.value = $event : null,
                      class: "w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white"
                    }, [
                      createVNode("option", { value: "todos" }, "Todos los estados"),
                      createVNode("option", { value: "activo" }, "\u2705 Activos"),
                      createVNode("option", { value: "pendiente" }, "\u23F3 Pendientes"),
                      createVNode("option", { value: "completado" }, "\u2714\uFE0F Completados"),
                      createVNode("option", { value: "vencido" }, "\u274C Vencidos"),
                      createVNode("option", { value: "cancelado" }, "\u{1F6AB} Cancelados")
                    ], 8, ["onUpdate:modelValue"]), [
                      [vModelSelect, unref(filtroEstado)]
                    ])
                  ]),
                  createVNode("div", { class: "flex-1" }, [
                    createVNode("label", { class: "block text-sm font-medium text-[#5D4A44] mb-2" }, " Filtrar por Tipo "),
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => isRef(filtroTipo) ? filtroTipo.value = $event : null,
                      class: "w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white"
                    }, [
                      createVNode("option", { value: "todos" }, "Todos los tipos"),
                      createVNode("option", { value: "quincenal" }, "Quincenal"),
                      createVNode("option", { value: "mensual" }, "Mensual"),
                      createVNode("option", { value: "semestral" }, "Semestral")
                    ], 8, ["onUpdate:modelValue"]), [
                      [vModelSelect, unref(filtroTipo)]
                    ])
                  ]),
                  createVNode("div", { class: "flex-1" }, [
                    createVNode("label", { class: "block text-sm font-medium text-[#5D4A44] mb-2" }, " Ordenar por "),
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => isRef(ordenamiento) ? ordenamiento.value = $event : null,
                      class: "w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] bg-white"
                    }, [
                      createVNode("option", { value: "reciente" }, "M\xE1s recientes"),
                      createVNode("option", { value: "antiguo" }, "M\xE1s antiguos"),
                      createVNode("option", { value: "vencimiento" }, "Por vencimiento")
                    ], 8, ["onUpdate:modelValue"]), [
                      [vModelSelect, unref(ordenamiento)]
                    ])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</section>`);
        if (unref(bonosFiltrados).length > 0) {
          _push(`<section class="grid grid-cols-1 lg:grid-cols-2 gap-6" data-v-64cfe15d><!--[-->`);
          ssrRenderList(unref(bonosFiltrados), (bono) => {
            _push(ssrRenderComponent(_component_BonoCard, {
              key: bono.id,
              bono,
              onRenovar: abrirModalRenovacion,
              onVerPagos: abrirModalPagos,
              onEditar: editarBono
            }, null, _parent));
          });
          _push(`<!--]--></section>`);
        } else {
          _push(`<section class="text-center py-16" data-v-64cfe15d>`);
          _push(ssrRenderComponent(_component_DashboardCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="text-7xl mb-4 block opacity-40" data-v-64cfe15d${_scopeId}>\u{1F3AB}</span><h3 class="text-xl font-[&#39;Lora&#39;] font-semibold text-[#5D4A44] mb-2" data-v-64cfe15d${_scopeId}>${ssrInterpolate(unref(bonos2).length === 0 ? "No hay bonos registrados" : "No hay bonos con estos filtros")}</h3><p class="text-[#5D4A44]/60 mb-6" data-v-64cfe15d${_scopeId}>${ssrInterpolate(unref(bonos2).length === 0 ? "Crea el primer bono para este paciente" : "Intenta cambiar los filtros para ver m\xE1s bonos")}</p>`);
                if (unref(bonos2).length === 0 && unref(puedeGestionarBonos)) {
                  _push2(`<button class="px-8 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors font-medium" data-v-64cfe15d${_scopeId}> + Crear Primer Bono </button>`);
                } else {
                  _push2(`<button class="px-8 py-3 bg-[#5D4A44] text-white rounded-lg hover:bg-[#4A3A34] transition-colors font-medium" data-v-64cfe15d${_scopeId}> Limpiar Filtros </button>`);
                }
              } else {
                return [
                  createVNode("span", { class: "text-7xl mb-4 block opacity-40" }, "\u{1F3AB}"),
                  createVNode("h3", { class: "text-xl font-['Lora'] font-semibold text-[#5D4A44] mb-2" }, toDisplayString(unref(bonos2).length === 0 ? "No hay bonos registrados" : "No hay bonos con estos filtros"), 1),
                  createVNode("p", { class: "text-[#5D4A44]/60 mb-6" }, toDisplayString(unref(bonos2).length === 0 ? "Crea el primer bono para este paciente" : "Intenta cambiar los filtros para ver m\xE1s bonos"), 1),
                  unref(bonos2).length === 0 && unref(puedeGestionarBonos) ? (openBlock(), createBlock("button", {
                    key: 0,
                    onClick: abrirModalNuevoBono,
                    class: "px-8 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C89B8A] transition-colors font-medium"
                  }, " + Crear Primer Bono ")) : (openBlock(), createBlock("button", {
                    key: 1,
                    onClick: limpiarFiltros,
                    class: "px-8 py-3 bg-[#5D4A44] text-white rounded-lg hover:bg-[#4A3A34] transition-colors font-medium"
                  }, " Limpiar Filtros "))
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</section>`);
        }
        if (unref(alertasVisibles)) {
          _push(`<section class="mt-8 space-y-3" data-v-64cfe15d>`);
          if (unref(metricas).proximosAVencer > 0) {
            _push(`<div class="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg" data-v-64cfe15d><div class="flex items-start gap-3" data-v-64cfe15d><span class="text-2xl" data-v-64cfe15d>\u26A0\uFE0F</span><div class="flex-1" data-v-64cfe15d><h4 class="font-medium text-orange-900 mb-1" data-v-64cfe15d>${ssrInterpolate(unref(metricas).proximosAVencer)} bono(s) pr\xF3ximo(s) a vencer </h4><p class="text-sm text-orange-700" data-v-64cfe15d> Hay bonos que vencer\xE1n en los pr\xF3ximos 7 d\xEDas. Considera renovarlos. </p></div><button class="text-sm text-orange-700 hover:text-orange-900 underline" data-v-64cfe15d> Ver bonos activos </button></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(metricas).pocasSesiones > 0) {
            _push(`<div class="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg" data-v-64cfe15d><div class="flex items-start gap-3" data-v-64cfe15d><span class="text-2xl" data-v-64cfe15d>\u{1F4CA}</span><div class="flex-1" data-v-64cfe15d><h4 class="font-medium text-blue-900 mb-1" data-v-64cfe15d>${ssrInterpolate(unref(metricas).pocasSesiones)} bono(s) con pocas sesiones </h4><p class="text-sm text-blue-700" data-v-64cfe15d> Algunos bonos tienen 2 o menos sesiones restantes. </p></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(ssrRenderComponent(_component_ModalNuevoBono, {
        mostrar: unref(modalNuevoBonoAbierto),
        "paciente-id": unref(pacienteId),
        "paciente-nombre": unref(pacienteNombre),
        "psicologa-id": unref(psicologaId),
        onClose: cerrarModalNuevoBono,
        onCreated: onBonoCreado
      }, null, _parent));
      _push(ssrRenderComponent(_component_ModalPagosBono, {
        mostrar: unref(modalPagosAbierto),
        bono: unref(bonoSeleccionado),
        onClose: cerrarModalPagos,
        onUpdated: onPagosActualizados
      }, null, _parent));
      _push(ssrRenderComponent(_component_ModalRenovacionBono, {
        mostrar: unref(modalRenovacionAbierto),
        bono: unref(bonoSeleccionado),
        onClose: cerrarModalRenovacion,
        onRenovated: onBonoRenovado
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/terapeuta/pacientes/[id]/bonos.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const bonos = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-64cfe15d"]]);

export { bonos as default };
//# sourceMappingURL=bonos-0bodcLXQ.mjs.map
