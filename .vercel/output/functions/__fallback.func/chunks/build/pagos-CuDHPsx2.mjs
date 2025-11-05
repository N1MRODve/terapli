import { _ as __nuxt_component_0 } from './nuxt-link-CboeUkiO.mjs';
import { ref, computed, mergeProps, unref, withCtx, createVNode, createBlock, openBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderStyle, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderComponent, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { g as useSupabaseClient } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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

const _sfc_main = {
  __name: "pagos",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    const cargando = ref(true);
    const bonosConfirmados = ref([]);
    const totalConfirmado = ref(0);
    const promedioPorBono = ref(0);
    const mesSeleccionado = ref("");
    const mesesDisponibles = ref([]);
    const modalDetalleAbierto = ref(false);
    const bonoSeleccionado = ref(null);
    const cargandoPendientes = ref(true);
    const bonosPendientes = ref([]);
    const totalPorConfirmar = ref(0);
    ref(0);
    const busquedaPendientes = ref("");
    const busquedaConfirmados = ref("");
    ref(false);
    ref("");
    const procesandoConfirmacion = ref(false);
    const progresoConfirmados = computed(() => {
      const total = bonosPendientes.value.length + bonosConfirmados.value.length;
      if (total === 0) return 100;
      return Math.round(bonosConfirmados.value.length / total * 100);
    });
    const bonosPendientesFiltrados = computed(() => {
      if (!busquedaPendientes.value.trim()) {
        return bonosPendientes.value;
      }
      const busqueda = busquedaPendientes.value.toLowerCase().trim();
      return bonosPendientes.value.filter((bono) => {
        const nombrePaciente = (bono.paciente_nombre || "").toLowerCase();
        const nombreTerapeuta = (bono.terapeuta_nombre || "").toLowerCase();
        const tipoBono = (bono.tipo_bono || "").toLowerCase();
        return nombrePaciente.includes(busqueda) || nombreTerapeuta.includes(busqueda) || tipoBono.includes(busqueda);
      });
    });
    const bonosConfirmadosFiltrados = computed(() => {
      if (!busquedaConfirmados.value.trim()) {
        return bonosConfirmados.value;
      }
      const busqueda = busquedaConfirmados.value.toLowerCase().trim();
      return bonosConfirmados.value.filter((bono) => {
        const nombrePaciente = (bono.paciente_nombre || "").toLowerCase();
        const nombreTerapeuta = (bono.terapeuta_nombre || "").toLowerCase();
        const tipoBono = (bono.tipo_bono || "").toLowerCase();
        return nombrePaciente.includes(busqueda) || nombreTerapeuta.includes(busqueda) || tipoBono.includes(busqueda);
      });
    });
    const totalPorConfirmarFiltrado = computed(() => {
      return bonosPendientesFiltrados.value.reduce((sum, bono) => {
        return sum + (Number(bono.monto_total) || 0);
      }, 0);
    });
    const bonosUrgentesFiltrados = computed(() => {
      return bonosPendientesFiltrados.value.filter(
        (bono) => bono.sesiones_restantes <= 1
      ).length;
    });
    const totalConfirmadoFiltrado = computed(() => {
      return bonosConfirmadosFiltrados.value.reduce((sum, bono) => {
        return sum + (Number(bono.monto_total) || 0);
      }, 0);
    });
    const promedioPorBonoFiltrado = computed(() => {
      if (bonosConfirmadosFiltrados.value.length === 0) return 0;
      return totalConfirmadoFiltrado.value / bonosConfirmadosFiltrados.value.length;
    });
    const formatearPrecio = (valor) => {
      return new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(valor || 0);
    };
    const formatearFecha = (fecha) => {
      if (!fecha) return "No especificada";
      return new Date(fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    };
    const obtenerIniciales = (nombre) => {
      if (!nombre) return "?";
      const partes = nombre.split(" ");
      if (partes.length >= 2) {
        return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
      }
      return nombre.substring(0, 2).toUpperCase();
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-neutral-50 via-orange-50/30 to-terracota-50/20 p-6 md:p-8 space-y-8" }, _attrs))} data-v-2c341127><div class="bg-white rounded-2xl shadow-sm border border-[#EFCB9D] overflow-hidden transition-all duration-300 hover:shadow-lg" data-v-2c341127><div class="sticky top-0 z-20 bg-[#FFF6EC] border-t-4 border-[#EFCB9D] px-6 md:px-8 py-6 shadow-md" data-v-2c341127><div class="flex items-start justify-between gap-4 mb-4" data-v-2c341127><div class="flex-1" data-v-2c341127><div class="flex items-center gap-3 mb-2" data-v-2c341127><div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center" data-v-2c341127><svg class="w-6 h-6 text-[#C57A3E]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><circle cx="12" cy="12" r="10" data-v-2c341127></circle><polyline points="12 6 12 12 16 14" data-v-2c341127></polyline></svg></div><h2 class="text-2xl font-serif font-bold text-[#C57A3E]" data-v-2c341127> Bonos Pendientes de Confirmar </h2></div><p class="text-sm text-neutral-600 leading-relaxed ml-13" data-v-2c341127> Gestiona aqu\xED los pagos pendientes y el seguimiento financiero de cada paciente. </p></div><div class="text-right flex-shrink-0" data-v-2c341127><p class="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1" data-v-2c341127>Pendientes</p><p class="text-5xl font-bold text-[#C57A3E] leading-none" data-v-2c341127>${ssrInterpolate(unref(bonosPendientesFiltrados).length)}</p></div></div><div class="relative" data-v-2c341127><div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none" data-v-2c341127><svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><circle cx="11" cy="11" r="8" data-v-2c341127></circle><path d="m21 21-4.35-4.35" data-v-2c341127></path></svg></div><input${ssrRenderAttr("value", unref(busquedaPendientes))} type="text" placeholder="Buscar paciente en bonos pendientes..." class="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#C57A3E]/20 focus:border-[#C57A3E] transition-all bg-white placeholder:text-neutral-400" data-v-2c341127>`);
      if (unref(busquedaPendientes)) {
        _push(`<div class="absolute inset-y-0 right-0 flex items-center pr-4" data-v-2c341127><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#C57A3E] text-white" data-v-2c341127>${ssrInterpolate(unref(bonosPendientesFiltrados).length)} resultado${ssrInterpolate(unref(bonosPendientesFiltrados).length !== 1 ? "s" : "")}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(bonosPendientes).length > 0 || unref(bonosConfirmados).length > 0) {
        _push(`<div class="bg-neutral-100 h-1.5 relative overflow-hidden" data-v-2c341127><div class="absolute inset-y-0 left-0 bg-gradient-to-r from-[#54BF83] to-[#B46E4B] transition-all duration-700 ease-out" style="${ssrRenderStyle({ width: `${unref(progresoConfirmados)}%` })}" data-v-2c341127></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="px-6 md:px-8 py-6 bg-gradient-to-b from-neutral-50 to-white" data-v-2c341127><div class="overflow-x-auto -mx-2 px-2 pb-2" data-v-2c341127><div class="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-max md:min-w-0" data-v-2c341127><div class="bg-white rounded-xl p-5 shadow-sm border border-neutral-200 hover:shadow-md transition-all duration-200 min-w-[280px] md:min-w-0" data-v-2c341127><div class="flex items-center gap-4" data-v-2c341127><div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F4A261]/20 to-[#F4A261]/10 flex items-center justify-center flex-shrink-0" data-v-2c341127><svg class="w-7 h-7 text-[#F4A261]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><circle cx="12" cy="12" r="10" data-v-2c341127></circle><polyline points="12 6 12 12 16 14" data-v-2c341127></polyline></svg></div><div class="flex-1" data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1" data-v-2c341127>Bonos Pendientes</p><p class="text-3xl font-bold text-neutral-800" data-v-2c341127>${ssrInterpolate(unref(bonosPendientes).length)}</p></div></div></div><div class="bg-white rounded-xl p-5 shadow-sm border border-neutral-200 hover:shadow-md transition-all duration-200 min-w-[280px] md:min-w-0" data-v-2c341127><div class="flex items-center gap-4" data-v-2c341127><div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#B46E4B]/20 to-[#B46E4B]/10 flex items-center justify-center flex-shrink-0" data-v-2c341127><svg class="w-7 h-7 text-[#B46E4B]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" data-v-2c341127></path></svg></div><div class="flex-1" data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1" data-v-2c341127>Total por Confirmar</p><p class="text-3xl font-bold text-[#B46E4B]" data-v-2c341127>${ssrInterpolate(formatearPrecio(unref(totalPorConfirmarFiltrado)))}\u20AC</p>`);
      if (unref(busquedaPendientes)) {
        _push(`<p class="text-xs text-neutral-500 mt-0.5" data-v-2c341127>de ${ssrInterpolate(formatearPrecio(unref(totalPorConfirmar)))}\u20AC total</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="bg-white rounded-xl p-5 shadow-sm border border-neutral-200 hover:shadow-md transition-all duration-200 min-w-[280px] md:min-w-0" data-v-2c341127><div class="flex items-center gap-4" data-v-2c341127><div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#E9C46A]/20 to-[#E9C46A]/10 flex items-center justify-center flex-shrink-0" data-v-2c341127><svg class="w-7 h-7 text-[#E9C46A]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" data-v-2c341127></path><path d="M12 9v4" data-v-2c341127></path><path d="M12 17h.01" data-v-2c341127></path></svg></div><div class="flex-1" data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1" data-v-2c341127>Requieren Atenci\xF3n</p><p class="text-3xl font-bold text-[#E9C46A]" data-v-2c341127>${ssrInterpolate(unref(bonosUrgentesFiltrados))}</p><p class="text-xs text-neutral-500 mt-0.5" data-v-2c341127>${ssrInterpolate(unref(busquedaPendientes) ? "en resultados" : "Pocas sesiones restantes")}</p></div></div></div></div></div></div><div class="px-6 md:px-8 py-6" data-v-2c341127>`);
      if (unref(cargandoPendientes)) {
        _push(`<div class="space-y-4" data-v-2c341127><!--[-->`);
        ssrRenderList(3, (i) => {
          _push(`<div class="animate-pulse" data-v-2c341127><div class="bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] rounded-xl h-32 animate-shimmer" data-v-2c341127></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(bonosPendientesFiltrados).length > 0) {
        _push(`<div class="space-y-4" data-v-2c341127><!--[-->`);
        ssrRenderList(unref(bonosPendientesFiltrados), (bono) => {
          _push(`<div class="group relative bg-white rounded-xl p-5 md:p-6 hover:shadow-lg transition-all duration-200 border border-neutral-200 hover:border-[#C57A3E]" data-v-2c341127><div class="${ssrRenderClass([{
            "bg-red-500": bono.sesiones_restantes === 0,
            "bg-orange-500": bono.sesiones_restantes === 1,
            "bg-amber-500": bono.sesiones_restantes === 2,
            "bg-[#C57A3E]": bono.sesiones_restantes > 2
          }, "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"])}" data-v-2c341127></div><div class="flex flex-col md:flex-row md:items-center gap-5 ml-2" data-v-2c341127><div class="relative flex-shrink-0" data-v-2c341127><div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#C57A3E] to-[#B46E4B] flex items-center justify-center text-white font-bold shadow-sm text-xl" data-v-2c341127>${ssrInterpolate(obtenerIniciales(bono.paciente_nombre))}</div>`);
          if (bono.sesiones_restantes <= 1) {
            _push(`<div class="${ssrRenderClass([{
              "bg-red-500": bono.sesiones_restantes === 0,
              "bg-orange-500": bono.sesiones_restantes === 1
            }, "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md"])}" data-v-2c341127><span class="text-white text-xs font-bold" data-v-2c341127>!</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4" data-v-2c341127><div data-v-2c341127><p class="font-bold text-neutral-800 text-lg mb-1" data-v-2c341127>${ssrInterpolate(bono.paciente_nombre)}</p><p class="text-sm text-neutral-500 capitalize flex items-center gap-1.5" data-v-2c341127><span class="w-1.5 h-1.5 rounded-full bg-[#C57A3E]" data-v-2c341127></span> ${ssrInterpolate(bono.tipo_bono || "Bono Est\xE1ndar")}</p></div><div data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-2c341127>Terapeuta</p><p class="text-sm font-medium text-neutral-700" data-v-2c341127>${ssrInterpolate(bono.terapeuta_nombre || "No asignado")}</p></div><div data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-2c341127>Estado</p><span class="${ssrRenderClass([{
            "bg-green-100 text-green-700": bono.estado === "activo",
            "bg-amber-100 text-amber-700": bono.estado === "pendiente",
            "bg-neutral-100 text-neutral-700": bono.estado === "agotado"
          }, "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"])}" data-v-2c341127><span class="${ssrRenderClass([{
            "bg-green-500": bono.estado === "activo",
            "bg-amber-500": bono.estado === "pendiente",
            "bg-neutral-500": bono.estado === "agotado"
          }, "w-1.5 h-1.5 rounded-full"])}" data-v-2c341127></span><span class="capitalize" data-v-2c341127>${ssrInterpolate(bono.estado)}</span></span></div><div data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-2c341127>Sesiones</p><div class="flex items-center gap-2" data-v-2c341127><p class="${ssrRenderClass([{
            "text-red-600": bono.sesiones_restantes === 0,
            "text-orange-600": bono.sesiones_restantes === 1,
            "text-amber-600": bono.sesiones_restantes === 2,
            "text-green-600": bono.sesiones_restantes > 2
          }, "text-base font-bold"])}" data-v-2c341127>${ssrInterpolate(bono.sesiones_restantes)}</p><p class="text-sm text-neutral-500" data-v-2c341127>/ ${ssrInterpolate(bono.sesiones_totales)}</p></div>`);
          if (bono.sesiones_restantes <= 1) {
            _push(`<div class="${ssrRenderClass([{
              "text-red-600": bono.sesiones_restantes === 0,
              "text-orange-600": bono.sesiones_restantes === 1
            }, "flex items-center gap-1 text-xs font-semibold mt-1"])}" data-v-2c341127><svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" data-v-2c341127></path><path d="M12 9v4" data-v-2c341127></path><path d="M12 17h.01" data-v-2c341127></path></svg><span data-v-2c341127>${ssrInterpolate(bono.sesiones_restantes === 0 ? "\xA1AGOTADO!" : "\xA1\xDALTIMA!")}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="text-left md:text-right" data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-2c341127>Monto</p><p class="text-2xl font-bold text-[#B46E4B]" data-v-2c341127>${ssrInterpolate(formatearPrecio(bono.monto_total))}\u20AC</p><p class="text-xs text-[#C57A3E] font-medium mt-0.5" data-v-2c341127>Por confirmar</p></div></div><div class="flex-shrink-0" data-v-2c341127><button${ssrIncludeBooleanAttr(unref(procesandoConfirmacion)) ? " disabled" : ""} class="w-full md:w-auto px-6 py-3 bg-[#B46E4B] text-white rounded-xl hover:bg-[#C57A3E] transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-105" data-v-2c341127><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-v-2c341127></path></svg><span data-v-2c341127>Confirmar Pago</span></button></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(busquedaPendientes) && unref(bonosPendientesFiltrados).length === 0) {
        _push(`<div class="text-center py-16" data-v-2c341127><div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-50 mb-5" data-v-2c341127><svg class="w-12 h-12 text-[#C57A3E]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><circle cx="11" cy="11" r="8" data-v-2c341127></circle><path d="m21 21-4.35-4.35" data-v-2c341127></path></svg></div><h3 class="text-2xl font-serif font-bold text-neutral-800 mb-2" data-v-2c341127> No se encontraron resultados </h3><p class="text-neutral-600 mb-6 text-base" data-v-2c341127> No hay bonos pendientes para &quot;${ssrInterpolate(unref(busquedaPendientes))}&quot; </p><button class="inline-flex items-center gap-2 px-6 py-3 bg-[#B46E4B] text-white rounded-xl hover:bg-[#C57A3E] transition-all duration-200 font-semibold shadow-sm hover:shadow-md" data-v-2c341127><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="M18 6 6 18" data-v-2c341127></path><path d="m6 6 12 12" data-v-2c341127></path></svg><span data-v-2c341127>Limpiar b\xFAsqueda</span></button></div>`);
      } else {
        _push(`<div class="text-center py-16" data-v-2c341127><div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F8FFF9] mb-5" data-v-2c341127><svg class="w-12 h-12 text-[#54BF83]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-v-2c341127></path></svg></div><h3 class="text-2xl font-serif font-bold text-neutral-800 mb-2" data-v-2c341127> Todo al d\xEDa \u{1F9FE} </h3><p class="text-neutral-600 mb-6 text-base" data-v-2c341127> No hay bonos pendientes de confirmar pago. </p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/coordinadora/pacientes",
          class: "inline-flex items-center gap-2 px-6 py-3 bg-[#B46E4B] text-white rounded-xl hover:bg-[#C57A3E] transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span data-v-2c341127${_scopeId}>Gestionar Pacientes</span><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127${_scopeId}><path d="M5 12h14" data-v-2c341127${_scopeId}></path><path d="m12 5 7 7-7 7" data-v-2c341127${_scopeId}></path></svg>`);
            } else {
              return [
                createVNode("span", null, "Gestionar Pacientes"),
                (openBlock(), createBlock("svg", {
                  class: "w-5 h-5",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", { d: "M5 12h14" }),
                  createVNode("path", { d: "m12 5 7 7-7 7" })
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</div></div><div class="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden mt-8" data-v-2c341127><div class="sticky top-0 z-20 bg-gradient-to-r from-green-50 to-emerald-50/50 px-6 md:px-8 py-6 border-b border-neutral-200 shadow-md" data-v-2c341127><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4" data-v-2c341127><div data-v-2c341127><h2 class="text-xl font-serif font-bold text-neutral-800 flex items-center gap-2.5 mb-1" data-v-2c341127><svg class="w-6 h-6 text-[#54BF83]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="M3 3v18h18" data-v-2c341127></path><path d="m19 9-5 5-4-4-3 3" data-v-2c341127></path></svg><span data-v-2c341127>Historial de Pagos Confirmados</span></h2><p class="text-sm text-neutral-600 leading-relaxed" data-v-2c341127> Bonos ya registrados y confirmados por coordinaci\xF3n. </p></div><select class="px-4 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#54BF83]/20 focus:border-[#54BF83] transition-all bg-white hover:border-[#54BF83] cursor-pointer" data-v-2c341127><option value="" data-v-2c341127${ssrIncludeBooleanAttr(Array.isArray(unref(mesSeleccionado)) ? ssrLooseContain(unref(mesSeleccionado), "") : ssrLooseEqual(unref(mesSeleccionado), "")) ? " selected" : ""}>\u{1F4C5} Todos los meses</option><!--[-->`);
      ssrRenderList(unref(mesesDisponibles), (mes) => {
        _push(`<option${ssrRenderAttr("value", mes.valor)} data-v-2c341127${ssrIncludeBooleanAttr(Array.isArray(unref(mesSeleccionado)) ? ssrLooseContain(unref(mesSeleccionado), mes.valor) : ssrLooseEqual(unref(mesSeleccionado), mes.valor)) ? " selected" : ""}>${ssrInterpolate(mes.nombre)}</option>`);
      });
      _push(`<!--]--></select></div><div class="relative" data-v-2c341127><div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none" data-v-2c341127><svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><circle cx="11" cy="11" r="8" data-v-2c341127></circle><path d="m21 21-4.35-4.35" data-v-2c341127></path></svg></div><input${ssrRenderAttr("value", unref(busquedaConfirmados))} type="text" placeholder="Buscar paciente en pagos confirmados..." class="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#54BF83]/20 focus:border-[#54BF83] transition-all bg-white placeholder:text-neutral-400" data-v-2c341127>`);
      if (unref(busquedaConfirmados)) {
        _push(`<div class="absolute inset-y-0 right-0 flex items-center pr-4" data-v-2c341127><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#54BF83] text-white" data-v-2c341127>${ssrInterpolate(unref(bonosConfirmadosFiltrados).length)} resultado${ssrInterpolate(unref(bonosConfirmadosFiltrados).length !== 1 ? "s" : "")}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="px-6 md:px-8 py-6 bg-gradient-to-b from-green-50/50 to-white border-b border-green-100" data-v-2c341127><div class="overflow-x-auto -mx-2 px-2 pb-2" data-v-2c341127><div class="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-max md:min-w-0" data-v-2c341127><div class="bg-white rounded-xl p-5 shadow-sm border border-green-200 hover:shadow-md transition-all duration-200 min-w-[280px] md:min-w-0" data-v-2c341127><div class="flex items-center gap-4" data-v-2c341127><div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#54BF83]/20 to-[#54BF83]/10 flex items-center justify-center flex-shrink-0" data-v-2c341127><svg class="w-7 h-7 text-[#54BF83]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-v-2c341127></path></svg></div><div data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1" data-v-2c341127>Bonos Confirmados</p><p class="text-3xl font-bold text-neutral-800" data-v-2c341127>${ssrInterpolate(unref(bonosConfirmadosFiltrados).length)}</p>`);
      if (unref(busquedaConfirmados)) {
        _push(`<p class="text-xs text-neutral-500 mt-0.5" data-v-2c341127>de ${ssrInterpolate(unref(bonosConfirmados).length)} total</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="bg-white rounded-xl p-5 shadow-sm border border-green-200 hover:shadow-md transition-all duration-200 min-w-[280px] md:min-w-0" data-v-2c341127><div class="flex items-center gap-4" data-v-2c341127><div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#54BF83]/30 to-[#54BF83]/15 flex items-center justify-center flex-shrink-0" data-v-2c341127><svg class="w-7 h-7 text-[#54BF83]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" data-v-2c341127></path></svg></div><div data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1" data-v-2c341127>Total Confirmado</p><p class="text-3xl font-bold text-[#54BF83]" data-v-2c341127>${ssrInterpolate(formatearPrecio(unref(totalConfirmadoFiltrado)))}\u20AC</p>`);
      if (unref(busquedaConfirmados)) {
        _push(`<p class="text-xs text-neutral-500 mt-0.5" data-v-2c341127>de ${ssrInterpolate(formatearPrecio(unref(totalConfirmado)))}\u20AC total</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="bg-white rounded-xl p-5 shadow-sm border border-blue-200 hover:shadow-md transition-all duration-200 min-w-[280px] md:min-w-0" data-v-2c341127><div class="flex items-center gap-4" data-v-2c341127><div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center flex-shrink-0" data-v-2c341127><svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="M3 3v18h18" data-v-2c341127></path><path d="M18 17V9" data-v-2c341127></path><path d="M13 17V5" data-v-2c341127></path><path d="M8 17v-3" data-v-2c341127></path></svg></div><div data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1" data-v-2c341127>Promedio por Bono</p><p class="text-3xl font-bold text-blue-600" data-v-2c341127>${ssrInterpolate(formatearPrecio(unref(promedioPorBonoFiltrado)))}\u20AC</p>`);
      if (unref(busquedaConfirmados)) {
        _push(`<p class="text-xs text-neutral-500 mt-0.5" data-v-2c341127>de ${ssrInterpolate(formatearPrecio(unref(promedioPorBono)))}\u20AC total</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></div></div></div><div class="px-6 md:px-8 py-6" data-v-2c341127>`);
      if (unref(cargando)) {
        _push(`<div class="space-y-3" data-v-2c341127><!--[-->`);
        ssrRenderList(4, (i) => {
          _push(`<div class="animate-pulse" data-v-2c341127><div class="bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] rounded-lg h-24 animate-shimmer" data-v-2c341127></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(bonosConfirmadosFiltrados).length > 0) {
        _push(`<div class="space-y-4" data-v-2c341127><!--[-->`);
        ssrRenderList(unref(bonosConfirmadosFiltrados), (bono) => {
          _push(`<div class="group relative bg-white rounded-xl p-5 md:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border border-green-100 hover:border-[#54BF83]" data-v-2c341127><div class="absolute left-0 top-0 bottom-0 w-1 bg-[#54BF83] rounded-l-xl" data-v-2c341127></div><div class="flex flex-col md:flex-row md:items-center gap-5 ml-2" data-v-2c341127><div class="relative flex-shrink-0" data-v-2c341127><div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#54BF83] to-emerald-600 flex items-center justify-center text-white font-bold shadow-sm text-xl" data-v-2c341127>${ssrInterpolate(obtenerIniciales(bono.paciente_nombre))}</div><div class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#54BF83] flex items-center justify-center shadow-md" data-v-2c341127><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-2c341127><path d="M5 13l4 4L19 7" data-v-2c341127></path></svg></div></div><div class="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4" data-v-2c341127><div data-v-2c341127><p class="font-bold text-neutral-800 text-lg mb-1" data-v-2c341127>${ssrInterpolate(bono.paciente_nombre)}</p><p class="text-sm text-neutral-500 capitalize flex items-center gap-1.5" data-v-2c341127><span class="w-1.5 h-1.5 rounded-full bg-[#54BF83]" data-v-2c341127></span> ${ssrInterpolate(bono.tipo_bono || "Bono Est\xE1ndar")}</p></div><div data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-2c341127>Terapeuta</p><p class="text-sm font-medium text-neutral-700" data-v-2c341127>${ssrInterpolate(bono.terapeuta_nombre || "No asignado")}</p></div><div data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-2c341127>Estado</p><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700" data-v-2c341127><span class="w-1.5 h-1.5 rounded-full bg-green-500" data-v-2c341127></span><span data-v-2c341127>Confirmado</span></span></div><div data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-2c341127>Sesiones</p><div class="flex items-center gap-2" data-v-2c341127><p class="${ssrRenderClass([{
            "text-red-600": bono.sesiones_restantes === 0,
            "text-orange-600": bono.sesiones_restantes === 1,
            "text-amber-600": bono.sesiones_restantes === 2,
            "text-green-600": bono.sesiones_restantes > 2
          }, "text-base font-bold"])}" data-v-2c341127>${ssrInterpolate(bono.sesiones_restantes)}</p><p class="text-sm text-neutral-500" data-v-2c341127>/ ${ssrInterpolate(bono.sesiones_totales)}</p></div>`);
          if (bono.sesiones_restantes <= 1) {
            _push(`<div class="${ssrRenderClass([{
              "text-red-600": bono.sesiones_restantes === 0,
              "text-orange-600": bono.sesiones_restantes === 1
            }, "flex items-center gap-1 text-xs font-semibold mt-1"])}" data-v-2c341127><svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" data-v-2c341127></path><path d="M12 9v4" data-v-2c341127></path><path d="M12 17h.01" data-v-2c341127></path></svg><span data-v-2c341127>${ssrInterpolate(bono.sesiones_restantes === 0 ? "\xA1AGOTADO!" : "\xA1RENOVAR!")}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="text-left md:text-right" data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-2c341127>Pago Confirmado</p><p class="text-2xl font-bold text-[#54BF83]" data-v-2c341127>${ssrInterpolate(formatearPrecio(bono.monto_total))}\u20AC</p><p class="text-xs text-neutral-500 mt-1 flex items-center md:justify-end gap-1.5" data-v-2c341127><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><rect width="18" height="18" x="3" y="4" rx="2" ry="2" data-v-2c341127></rect><line x1="16" x2="16" y1="2" y2="6" data-v-2c341127></line><line x1="8" x2="8" y1="2" y2="6" data-v-2c341127></line><line x1="3" x2="21" y1="10" y2="10" data-v-2c341127></line></svg><span data-v-2c341127>${ssrInterpolate(formatearFecha(bono.fecha_pago))}</span></p></div></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(busquedaConfirmados) && unref(bonosConfirmadosFiltrados).length === 0) {
        _push(`<div class="text-center py-16" data-v-2c341127><div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-5" data-v-2c341127><svg class="w-12 h-12 text-[#54BF83]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><circle cx="11" cy="11" r="8" data-v-2c341127></circle><path d="m21 21-4.35-4.35" data-v-2c341127></path></svg></div><h3 class="text-xl font-semibold text-neutral-800 mb-2" data-v-2c341127> No se encontraron resultados </h3><p class="text-neutral-600 mb-6" data-v-2c341127> No hay pagos confirmados para &quot;${ssrInterpolate(unref(busquedaConfirmados))}&quot; </p><button class="inline-flex items-center gap-2 px-6 py-3 bg-[#54BF83] text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 font-semibold shadow-sm hover:shadow-md" data-v-2c341127><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="M18 6 6 18" data-v-2c341127></path><path d="m6 6 12 12" data-v-2c341127></path></svg><span data-v-2c341127>Limpiar b\xFAsqueda</span></button></div>`);
      } else {
        _push(`<div class="text-center py-16" data-v-2c341127><div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-5" data-v-2c341127><svg class="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" data-v-2c341127></path><circle cx="12" cy="7" r="4" data-v-2c341127></circle></svg></div><h3 class="text-xl font-semibold text-neutral-800 mb-2" data-v-2c341127> Sin pagos registrados </h3><p class="text-neutral-600" data-v-2c341127>${ssrInterpolate(unref(mesSeleccionado) ? "No hay pagos confirmados en este mes" : "No hay pagos confirmados a\xFAn")}</p></div>`);
      }
      _push(`</div></div>`);
      if (unref(modalDetalleAbierto)) {
        _push(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" data-v-2c341127>`);
        if (unref(modalDetalleAbierto)) {
          _push(`<div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8" data-v-2c341127><div class="flex items-center justify-between mb-6" data-v-2c341127><div class="flex items-center gap-3" data-v-2c341127><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#54BF83]/20 to-[#54BF83]/10 flex items-center justify-center" data-v-2c341127><svg class="w-6 h-6 text-[#54BF83]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-v-2c341127></path></svg></div><h3 class="text-xl font-serif font-bold text-neutral-800" data-v-2c341127>Detalle del Pago</h3></div><button class="p-2 hover:bg-neutral-100 rounded-lg transition-colors" data-v-2c341127><svg class="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c341127><path d="M18 6 6 18" data-v-2c341127></path><path d="m6 6 12 12" data-v-2c341127></path></svg></button></div>`);
          if (unref(bonoSeleccionado)) {
            _push(`<div class="space-y-6" data-v-2c341127><div class="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl border border-green-100" data-v-2c341127><div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#54BF83] to-emerald-600 flex items-center justify-center text-white font-bold shadow-sm text-2xl" data-v-2c341127>${ssrInterpolate(obtenerIniciales(unref(bonoSeleccionado).paciente_nombre))}</div><div data-v-2c341127><p class="text-lg font-bold text-neutral-800" data-v-2c341127>${ssrInterpolate(unref(bonoSeleccionado).paciente_nombre)}</p><p class="text-sm text-neutral-600 capitalize" data-v-2c341127>${ssrInterpolate(unref(bonoSeleccionado).tipo_bono)}</p></div></div><div class="grid grid-cols-2 gap-4" data-v-2c341127><div class="p-4 bg-neutral-50 rounded-xl border border-neutral-200" data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-2c341127>Monto Total</p><p class="text-2xl font-bold text-[#54BF83]" data-v-2c341127>${ssrInterpolate(formatearPrecio(unref(bonoSeleccionado).monto_total))}\u20AC</p></div><div class="p-4 bg-neutral-50 rounded-xl border border-neutral-200" data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-2c341127>Fecha de Pago</p><p class="text-base font-semibold text-neutral-800" data-v-2c341127>${ssrInterpolate(formatearFecha(unref(bonoSeleccionado).fecha_pago))}</p></div><div class="p-4 bg-neutral-50 rounded-xl border border-neutral-200" data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-2c341127>Sesiones Totales</p><p class="text-2xl font-bold text-neutral-800" data-v-2c341127>${ssrInterpolate(unref(bonoSeleccionado).sesiones_totales)}</p></div><div class="p-4 bg-neutral-50 rounded-xl border border-neutral-200" data-v-2c341127><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-2c341127>Sesiones Restantes</p><p class="${ssrRenderClass([{
              "text-red-600": unref(bonoSeleccionado).sesiones_restantes === 0,
              "text-orange-600": unref(bonoSeleccionado).sesiones_restantes === 1,
              "text-amber-600": unref(bonoSeleccionado).sesiones_restantes === 2,
              "text-green-600": unref(bonoSeleccionado).sesiones_restantes > 2
            }, "text-2xl font-bold"])}" data-v-2c341127>${ssrInterpolate(unref(bonoSeleccionado).sesiones_restantes)}</p></div></div><div class="flex justify-end pt-4" data-v-2c341127><button class="px-6 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl transition-colors font-semibold" data-v-2c341127> Cerrar </button></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinadora/pagos.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const pagos = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-2c341127"]]);

export { pagos as default };
//# sourceMappingURL=pagos-CuDHPsx2.mjs.map
