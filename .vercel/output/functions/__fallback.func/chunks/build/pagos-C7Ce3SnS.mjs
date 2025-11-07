import { _ as __nuxt_component_0 } from './nuxt-link-CboeUkiO.mjs';
import { ref, computed, mergeProps, unref, withCtx, createVNode, createBlock, openBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderStyle, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderComponent, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import '@supabase/ssr';
import '@vercel/analytics/nuxt';

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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-[#F2F2F2] via-[#FAFAFA] to-[#F8F9FA] p-6 md:p-8 space-y-8 relative overflow-hidden" }, _attrs))} data-v-efdf5c5d><div class="absolute inset-0 overflow-hidden pointer-events-none" data-v-efdf5c5d><div class="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-[#5550F2]/10 to-[#027368]/5 rounded-full blur-3xl" data-v-efdf5c5d></div><div class="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-[#04BF9D]/10 to-[#F2B33D]/5 rounded-full blur-3xl" data-v-efdf5c5d></div><div class="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-[#027368]/8 to-[#5550F2]/8 rounded-full blur-2xl" data-v-efdf5c5d></div></div><div class="relative z-10 bg-white/85 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:bg-white/90" data-v-efdf5c5d><div class="sticky top-0 z-20 bg-gradient-to-r from-[#5550F2]/5 via-[#027368]/5 to-[#04BF9D]/5 backdrop-blur-md border-t-4 border-gradient-to-r from-[#5550F2] to-[#027368] px-6 md:px-8 py-6 shadow-lg" data-v-efdf5c5d><div class="flex items-start justify-between gap-4 mb-4" data-v-efdf5c5d><div class="flex-1" data-v-efdf5c5d><div class="flex items-center gap-3 mb-2" data-v-efdf5c5d><div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5550F2] to-[#027368] shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all duration-300" data-v-efdf5c5d><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-efdf5c5d><circle cx="12" cy="12" r="10" data-v-efdf5c5d></circle><polyline points="12 6 12 12 16 14" data-v-efdf5c5d></polyline></svg></div><h2 class="text-2xl font-[&#39;Elms_Sans&#39;] font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent" data-v-efdf5c5d> Bonos Pendientes de Confirmar </h2></div><p class="text-sm font-[&#39;Lato&#39;] text-gray-600 leading-relaxed ml-15" data-v-efdf5c5d> Gestiona aquí los pagos pendientes y el seguimiento financiero de cada paciente. </p></div><div class="text-right flex-shrink-0" data-v-efdf5c5d><p class="text-xs font-[&#39;Lato&#39;] text-gray-500 uppercase tracking-wider font-semibold mb-1" data-v-efdf5c5d>Pendientes</p><div class="relative" data-v-efdf5c5d><p class="text-5xl font-bold bg-gradient-to-r from-[#F2B33D] to-[#5550F2] bg-clip-text text-transparent leading-none" data-v-efdf5c5d>${ssrInterpolate(unref(bonosPendientesFiltrados).length)}</p><div class="absolute -inset-2 bg-gradient-to-r from-[#F2B33D]/20 to-[#5550F2]/20 rounded-xl blur opacity-60" data-v-efdf5c5d></div></div></div></div><div class="relative group" data-v-efdf5c5d><div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none" data-v-efdf5c5d><svg class="w-5 h-5 text-[#027368] group-focus-within:text-[#5550F2] transition-colors duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><circle cx="11" cy="11" r="8" data-v-efdf5c5d></circle><path d="m21 21-4.35-4.35" data-v-efdf5c5d></path></svg></div><input${ssrRenderAttr("value", unref(busquedaPendientes))} type="text" placeholder="Buscar paciente en bonos pendientes..." class="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl text-sm font-[&#39;Lato&#39;] focus:ring-2 focus:ring-[#5550F2]/20 focus:border-[#5550F2] transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder:text-gray-400 hover:bg-white/90 shadow-sm hover:shadow-md" data-v-efdf5c5d>`);
      if (unref(busquedaPendientes)) {
        _push(`<div class="absolute inset-y-0 right-0 flex items-center pr-4" data-v-efdf5c5d><span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-[&#39;Lato&#39;] font-semibold bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white shadow-lg" data-v-efdf5c5d>${ssrInterpolate(unref(bonosPendientesFiltrados).length)} resultado${ssrInterpolate(unref(bonosPendientesFiltrados).length !== 1 ? "s" : "")}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(bonosPendientes).length > 0 || unref(bonosConfirmados).length > 0) {
        _push(`<div class="bg-gradient-to-r from-gray-100 to-gray-50 h-2 relative overflow-hidden" data-v-efdf5c5d><div class="absolute inset-y-0 left-0 bg-gradient-to-r from-[#04BF9D] via-[#027368] to-[#5550F2] transition-all duration-700 ease-out shadow-lg" style="${ssrRenderStyle({ width: `${unref(progresoConfirmados)}%` })}" data-v-efdf5c5d></div><div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" data-v-efdf5c5d></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="px-6 md:px-8 py-8 bg-gradient-to-b from-white/50 to-white/80 backdrop-blur-sm" data-v-efdf5c5d><div class="overflow-x-auto -mx-2 px-2 pb-2" data-v-efdf5c5d><div class="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-max md:min-w-0" data-v-efdf5c5d><div class="group bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md hover:bg-white/95 transition-all duration-300 min-w-[280px] md:min-w-0 relative overflow-hidden" data-v-efdf5c5d><div class="absolute inset-0 bg-gradient-to-br from-[#F2B33D]/5 to-[#5550F2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-v-efdf5c5d></div><div class="relative flex items-center gap-4" data-v-efdf5c5d><div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F2B33D] to-[#F2B33D]/70 shadow-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300" data-v-efdf5c5d><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-efdf5c5d><circle cx="12" cy="12" r="10" data-v-efdf5c5d></circle><polyline points="12 6 12 12 16 14" data-v-efdf5c5d></polyline></svg></div><div class="flex-1" data-v-efdf5c5d><p class="text-xs font-[&#39;Lato&#39;] text-gray-500 uppercase font-semibold tracking-wider mb-2" data-v-efdf5c5d>Bonos Pendientes</p><p class="text-3xl font-[&#39;Elms_Sans&#39;] font-bold bg-gradient-to-r from-[#F2B33D] to-[#5550F2] bg-clip-text text-transparent" data-v-efdf5c5d>${ssrInterpolate(unref(bonosPendientes).length)}</p></div></div></div><div class="group bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md hover:bg-white/95 transition-all duration-300 min-w-[280px] md:min-w-0 relative overflow-hidden" data-v-efdf5c5d><div class="absolute inset-0 bg-gradient-to-br from-[#027368]/5 to-[#04BF9D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-v-efdf5c5d></div><div class="relative flex items-center gap-4" data-v-efdf5c5d><div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#027368] to-[#04BF9D] shadow-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300" data-v-efdf5c5d><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-efdf5c5d><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" data-v-efdf5c5d></path></svg></div><div class="flex-1" data-v-efdf5c5d><p class="text-xs font-[&#39;Lato&#39;] text-gray-500 uppercase font-semibold tracking-wider mb-2" data-v-efdf5c5d>Total por Confirmar</p><p class="text-3xl font-[&#39;Elms_Sans&#39;] font-bold bg-gradient-to-r from-[#027368] to-[#04BF9D] bg-clip-text text-transparent" data-v-efdf5c5d>${ssrInterpolate(formatearPrecio(unref(totalPorConfirmarFiltrado)))}€</p>`);
      if (unref(busquedaPendientes)) {
        _push(`<p class="text-xs font-[&#39;Lato&#39;] text-gray-500 mt-1" data-v-efdf5c5d>de ${ssrInterpolate(formatearPrecio(unref(totalPorConfirmar)))}€ total</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="group bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl hover:bg-white/95 transition-all duration-300 min-w-[280px] md:min-w-0 relative overflow-hidden" data-v-efdf5c5d><div class="absolute inset-0 bg-gradient-to-br from-[#F2B33D]/5 to-[#5550F2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-v-efdf5c5d></div><div class="relative flex items-center gap-4" data-v-efdf5c5d><div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F2B33D] to-[#5550F2] shadow-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300" data-v-efdf5c5d><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-efdf5c5d><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" data-v-efdf5c5d></path><path d="M12 9v4" data-v-efdf5c5d></path><path d="M12 17h.01" data-v-efdf5c5d></path></svg></div><div class="flex-1" data-v-efdf5c5d><p class="text-xs font-[&#39;Lato&#39;] text-gray-500 uppercase font-semibold tracking-wider mb-2" data-v-efdf5c5d>Requieren Atención</p><p class="text-3xl font-[&#39;Elms_Sans&#39;] font-bold bg-gradient-to-r from-[#F2B33D] to-[#5550F2] bg-clip-text text-transparent" data-v-efdf5c5d>${ssrInterpolate(unref(bonosUrgentesFiltrados))}</p><p class="text-xs font-[&#39;Lato&#39;] text-gray-500 mt-1" data-v-efdf5c5d>${ssrInterpolate(unref(busquedaPendientes) ? "en resultados" : "Pocas sesiones restantes")}</p></div></div></div></div></div></div><div class="px-6 md:px-8 py-6" data-v-efdf5c5d>`);
      if (unref(cargandoPendientes)) {
        _push(`<div class="space-y-4" data-v-efdf5c5d><!--[-->`);
        ssrRenderList(3, (i) => {
          _push(`<div class="animate-pulse" data-v-efdf5c5d><div class="bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] rounded-xl h-32 animate-shimmer" data-v-efdf5c5d></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(bonosPendientesFiltrados).length > 0) {
        _push(`<div class="space-y-4" data-v-efdf5c5d><!--[-->`);
        ssrRenderList(unref(bonosPendientesFiltrados), (bono) => {
          _push(`<div class="group relative bg-white rounded-xl p-5 md:p-6 hover:shadow-md transition-all duration-300 border border-neutral-200/50 hover:border-[#5550F2]/30 shadow-sm" data-v-efdf5c5d><div class="${ssrRenderClass([{
            "bg-red-500": bono.sesiones_restantes === 0,
            "bg-orange-500": bono.sesiones_restantes === 1,
            "bg-amber-500": bono.sesiones_restantes === 2,
            "bg-gradient-to-b from-[#04BF9D] to-[#027368]": bono.sesiones_restantes > 2
          }, "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"])}" data-v-efdf5c5d></div><div class="flex flex-col md:flex-row md:items-center gap-5 ml-2" data-v-efdf5c5d><div class="relative flex-shrink-0" data-v-efdf5c5d><div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#04BF9D] to-[#027368] flex items-center justify-center text-white font-bold shadow-sm text-xl" data-v-efdf5c5d>${ssrInterpolate(obtenerIniciales(bono.paciente_nombre))}</div>`);
          if (bono.sesiones_restantes <= 1) {
            _push(`<div class="${ssrRenderClass([{
              "bg-red-500": bono.sesiones_restantes === 0,
              "bg-orange-500": bono.sesiones_restantes === 1
            }, "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md"])}" data-v-efdf5c5d><span class="text-white text-xs font-bold" data-v-efdf5c5d>!</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4" data-v-efdf5c5d><div data-v-efdf5c5d><p class="font-bold text-neutral-800 text-lg mb-1" data-v-efdf5c5d>${ssrInterpolate(bono.paciente_nombre)}</p><p class="text-sm text-neutral-500 capitalize flex items-center gap-1.5" data-v-efdf5c5d><span class="w-1.5 h-1.5 rounded-full bg-[#04BF9D]" data-v-efdf5c5d></span> ${ssrInterpolate(bono.tipo_bono || "Bono Estándar")}</p></div><div data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-efdf5c5d>Terapeuta</p><p class="text-sm font-medium text-neutral-700" data-v-efdf5c5d>${ssrInterpolate(bono.terapeuta_nombre || "No asignado")}</p></div><div data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-efdf5c5d>Estado</p><span class="${ssrRenderClass([{
            "bg-green-100 text-green-700": bono.estado === "activo",
            "bg-amber-100 text-amber-700": bono.estado === "pendiente",
            "bg-neutral-100 text-neutral-700": bono.estado === "agotado"
          }, "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"])}" data-v-efdf5c5d><span class="${ssrRenderClass([{
            "bg-green-500": bono.estado === "activo",
            "bg-amber-500": bono.estado === "pendiente",
            "bg-neutral-500": bono.estado === "agotado"
          }, "w-1.5 h-1.5 rounded-full"])}" data-v-efdf5c5d></span><span class="capitalize" data-v-efdf5c5d>${ssrInterpolate(bono.estado)}</span></span></div><div data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-efdf5c5d>Sesiones</p><div class="flex items-center gap-2" data-v-efdf5c5d><p class="${ssrRenderClass([{
            "text-red-600": bono.sesiones_restantes === 0,
            "text-orange-600": bono.sesiones_restantes === 1,
            "text-amber-600": bono.sesiones_restantes === 2,
            "text-[#027368]": bono.sesiones_restantes > 2
          }, "text-base font-bold"])}" data-v-efdf5c5d>${ssrInterpolate(bono.sesiones_restantes)}</p><p class="text-sm text-neutral-500" data-v-efdf5c5d>/ ${ssrInterpolate(bono.sesiones_totales)}</p></div>`);
          if (bono.sesiones_restantes <= 1) {
            _push(`<div class="${ssrRenderClass([{
              "text-red-600": bono.sesiones_restantes === 0,
              "text-orange-600": bono.sesiones_restantes === 1
            }, "flex items-center gap-1 text-xs font-semibold mt-1"])}" data-v-efdf5c5d><svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" data-v-efdf5c5d></path><path d="M12 9v4" data-v-efdf5c5d></path><path d="M12 17h.01" data-v-efdf5c5d></path></svg><span data-v-efdf5c5d>${ssrInterpolate(bono.sesiones_restantes === 0 ? "¡AGOTADO!" : "¡ÚLTIMA!")}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="text-left md:text-right" data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-efdf5c5d>Monto</p><p class="text-2xl font-bold text-[#B46E4B]" data-v-efdf5c5d>${ssrInterpolate(formatearPrecio(bono.monto_total))}€</p><p class="text-xs text-[#C57A3E] font-medium mt-0.5" data-v-efdf5c5d>Por confirmar</p></div></div><div class="flex-shrink-0" data-v-efdf5c5d><button${ssrIncludeBooleanAttr(unref(procesandoConfirmacion)) ? " disabled" : ""} class="group/btn w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white rounded-xl hover:from-[#027368] hover:to-[#5550F2] transition-all duration-300 font-[&#39;Lato&#39;] font-semibold text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border border-white/20 backdrop-blur-sm" data-v-efdf5c5d><svg class="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-efdf5c5d><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-v-efdf5c5d></path></svg><span data-v-efdf5c5d>Confirmar Pago</span></button></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(busquedaPendientes) && unref(bonosPendientesFiltrados).length === 0) {
        _push(`<div class="text-center py-16" data-v-efdf5c5d><div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-50 mb-5" data-v-efdf5c5d><svg class="w-12 h-12 text-[#C57A3E]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><circle cx="11" cy="11" r="8" data-v-efdf5c5d></circle><path d="m21 21-4.35-4.35" data-v-efdf5c5d></path></svg></div><h3 class="text-2xl font-serif font-bold text-neutral-800 mb-2" data-v-efdf5c5d> No se encontraron resultados </h3><p class="text-neutral-600 mb-6 text-base" data-v-efdf5c5d> No hay bonos pendientes para &quot;${ssrInterpolate(unref(busquedaPendientes))}&quot; </p><button class="group/btn inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5550F2] to-[#027368] text-white rounded-xl hover:from-[#027368] hover:to-[#04BF9D] transition-all duration-300 font-[&#39;Lato&#39;] font-semibold shadow-sm hover:shadow-md hover:scale-105 border border-white/20 backdrop-blur-sm" data-v-efdf5c5d><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><path d="M18 6 6 18" data-v-efdf5c5d></path><path d="m6 6 12 12" data-v-efdf5c5d></path></svg><span data-v-efdf5c5d>Limpiar búsqueda</span></button></div>`);
      } else {
        _push(`<div class="text-center py-16" data-v-efdf5c5d><div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F8FFF9] mb-5" data-v-efdf5c5d><svg class="w-12 h-12 text-[#027368]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-v-efdf5c5d></path></svg></div><h3 class="text-2xl font-serif font-bold text-neutral-800 mb-2" data-v-efdf5c5d> Todo al día 🧾 </h3><p class="text-neutral-600 mb-6 text-base" data-v-efdf5c5d> No hay bonos pendientes de confirmar pago. </p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/coordinadora/pacientes",
          class: "group/btn inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5550F2] to-[#027368] text-white rounded-xl hover:from-[#027368] hover:to-[#04BF9D] transition-all duration-300 font-['Lato'] font-semibold shadow-sm hover:shadow-md hover:scale-105 border border-white/20 backdrop-blur-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span data-v-efdf5c5d${_scopeId}>Gestionar Pacientes</span><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d${_scopeId}><path d="M5 12h14" data-v-efdf5c5d${_scopeId}></path><path d="m12 5 7 7-7 7" data-v-efdf5c5d${_scopeId}></path></svg>`);
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
      _push(`</div></div><div class="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden mt-8" data-v-efdf5c5d><div class="sticky top-0 z-20 bg-gradient-to-r from-green-50 to-emerald-50/50 px-6 md:px-8 py-6 border-b border-neutral-200 shadow-md" data-v-efdf5c5d><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4" data-v-efdf5c5d><div data-v-efdf5c5d><h2 class="text-xl font-serif font-bold text-neutral-800 flex items-center gap-2.5 mb-1" data-v-efdf5c5d><svg class="w-6 h-6 text-[#027368]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><path d="M3 3v18h18" data-v-efdf5c5d></path><path d="m19 9-5 5-4-4-3 3" data-v-efdf5c5d></path></svg><span data-v-efdf5c5d>Historial de Pagos Confirmados</span></h2><p class="text-sm text-neutral-600 leading-relaxed" data-v-efdf5c5d> Bonos ya registrados y confirmados por coordinación. </p></div><select class="px-4 py-2.5 border border-neutral-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#027368]/20 focus:border-[#027368] transition-all bg-white hover:border-[#027368] cursor-pointer" data-v-efdf5c5d><option value="" data-v-efdf5c5d${ssrIncludeBooleanAttr(Array.isArray(unref(mesSeleccionado)) ? ssrLooseContain(unref(mesSeleccionado), "") : ssrLooseEqual(unref(mesSeleccionado), "")) ? " selected" : ""}>📅 Todos los meses</option><!--[-->`);
      ssrRenderList(unref(mesesDisponibles), (mes) => {
        _push(`<option${ssrRenderAttr("value", mes.valor)} data-v-efdf5c5d${ssrIncludeBooleanAttr(Array.isArray(unref(mesSeleccionado)) ? ssrLooseContain(unref(mesSeleccionado), mes.valor) : ssrLooseEqual(unref(mesSeleccionado), mes.valor)) ? " selected" : ""}>${ssrInterpolate(mes.nombre)}</option>`);
      });
      _push(`<!--]--></select></div><div class="relative" data-v-efdf5c5d><div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none" data-v-efdf5c5d><svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><circle cx="11" cy="11" r="8" data-v-efdf5c5d></circle><path d="m21 21-4.35-4.35" data-v-efdf5c5d></path></svg></div><input${ssrRenderAttr("value", unref(busquedaConfirmados))} type="text" placeholder="Buscar paciente en pagos confirmados..." class="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#027368]/20 focus:border-[#027368] transition-all bg-white placeholder:text-neutral-400" data-v-efdf5c5d>`);
      if (unref(busquedaConfirmados)) {
        _push(`<div class="absolute inset-y-0 right-0 flex items-center pr-4" data-v-efdf5c5d><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#027368] text-white" data-v-efdf5c5d>${ssrInterpolate(unref(bonosConfirmadosFiltrados).length)} resultado${ssrInterpolate(unref(bonosConfirmadosFiltrados).length !== 1 ? "s" : "")}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="px-6 md:px-8 py-6 bg-gradient-to-b from-green-50/50 to-white border-b border-green-100" data-v-efdf5c5d><div class="overflow-x-auto -mx-2 px-2 pb-2" data-v-efdf5c5d><div class="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-max md:min-w-0" data-v-efdf5c5d><div class="bg-white rounded-xl p-5 shadow-sm border border-green-200 hover:shadow-md transition-all duration-200 min-w-[280px] md:min-w-0" data-v-efdf5c5d><div class="flex items-center gap-4" data-v-efdf5c5d><div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#027368]/20 to-[#027368]/10 flex items-center justify-center flex-shrink-0" data-v-efdf5c5d><svg class="w-7 h-7 text-[#027368]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-v-efdf5c5d></path></svg></div><div data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1" data-v-efdf5c5d>Bonos Confirmados</p><p class="text-3xl font-bold text-neutral-800" data-v-efdf5c5d>${ssrInterpolate(unref(bonosConfirmadosFiltrados).length)}</p>`);
      if (unref(busquedaConfirmados)) {
        _push(`<p class="text-xs text-neutral-500 mt-0.5" data-v-efdf5c5d>de ${ssrInterpolate(unref(bonosConfirmados).length)} total</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="bg-white rounded-xl p-5 shadow-sm border border-green-200 hover:shadow-md transition-all duration-200 min-w-[280px] md:min-w-0" data-v-efdf5c5d><div class="flex items-center gap-4" data-v-efdf5c5d><div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#027368]/30 to-[#027368]/15 flex items-center justify-center flex-shrink-0" data-v-efdf5c5d><svg class="w-7 h-7 text-[#027368]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" data-v-efdf5c5d></path></svg></div><div data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1" data-v-efdf5c5d>Total Confirmado</p><p class="text-3xl font-bold text-[#027368]" data-v-efdf5c5d>${ssrInterpolate(formatearPrecio(unref(totalConfirmadoFiltrado)))}€</p>`);
      if (unref(busquedaConfirmados)) {
        _push(`<p class="text-xs text-neutral-500 mt-0.5" data-v-efdf5c5d>de ${ssrInterpolate(formatearPrecio(unref(totalConfirmado)))}€ total</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="bg-white rounded-xl p-5 shadow-sm border border-blue-200 hover:shadow-md transition-all duration-200 min-w-[280px] md:min-w-0" data-v-efdf5c5d><div class="flex items-center gap-4" data-v-efdf5c5d><div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center flex-shrink-0" data-v-efdf5c5d><svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><path d="M3 3v18h18" data-v-efdf5c5d></path><path d="M18 17V9" data-v-efdf5c5d></path><path d="M13 17V5" data-v-efdf5c5d></path><path d="M8 17v-3" data-v-efdf5c5d></path></svg></div><div data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1" data-v-efdf5c5d>Promedio por Bono</p><p class="text-3xl font-bold text-blue-600" data-v-efdf5c5d>${ssrInterpolate(formatearPrecio(unref(promedioPorBonoFiltrado)))}€</p>`);
      if (unref(busquedaConfirmados)) {
        _push(`<p class="text-xs text-neutral-500 mt-0.5" data-v-efdf5c5d>de ${ssrInterpolate(formatearPrecio(unref(promedioPorBono)))}€ total</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></div></div></div><div class="px-6 md:px-8 py-6" data-v-efdf5c5d>`);
      if (unref(cargando)) {
        _push(`<div class="space-y-3" data-v-efdf5c5d><!--[-->`);
        ssrRenderList(4, (i) => {
          _push(`<div class="animate-pulse" data-v-efdf5c5d><div class="bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] rounded-lg h-24 animate-shimmer" data-v-efdf5c5d></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(bonosConfirmadosFiltrados).length > 0) {
        _push(`<div class="space-y-4" data-v-efdf5c5d><!--[-->`);
        ssrRenderList(unref(bonosConfirmadosFiltrados), (bono) => {
          _push(`<div class="group relative bg-white rounded-xl p-5 md:p-6 hover:shadow-md transition-all duration-200 cursor-pointer border border-green-100 hover:border-[#027368] shadow-sm" data-v-efdf5c5d><div class="absolute left-0 top-0 bottom-0 w-1 bg-[#027368] rounded-l-xl" data-v-efdf5c5d></div><div class="flex flex-col md:flex-row md:items-center gap-5 ml-2" data-v-efdf5c5d><div class="relative flex-shrink-0" data-v-efdf5c5d><div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#027368] to-[#04BF9D] flex items-center justify-center text-white font-bold shadow-sm text-xl" data-v-efdf5c5d>${ssrInterpolate(obtenerIniciales(bono.paciente_nombre))}</div><div class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#027368] flex items-center justify-center shadow-md" data-v-efdf5c5d><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-efdf5c5d><path d="M5 13l4 4L19 7" data-v-efdf5c5d></path></svg></div></div><div class="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4" data-v-efdf5c5d><div data-v-efdf5c5d><p class="font-bold text-neutral-800 text-lg mb-1" data-v-efdf5c5d>${ssrInterpolate(bono.paciente_nombre)}</p><p class="text-sm text-neutral-500 capitalize flex items-center gap-1.5" data-v-efdf5c5d><span class="w-1.5 h-1.5 rounded-full bg-[#027368]" data-v-efdf5c5d></span> ${ssrInterpolate(bono.tipo_bono || "Bono Estándar")}</p></div><div data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-efdf5c5d>Terapeuta</p><p class="text-sm font-medium text-neutral-700" data-v-efdf5c5d>${ssrInterpolate(bono.terapeuta_nombre || "No asignado")}</p></div><div data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-efdf5c5d>Estado</p><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#027368]/10 text-[#027368]" data-v-efdf5c5d><span class="w-1.5 h-1.5 rounded-full bg-[#027368]" data-v-efdf5c5d></span><span data-v-efdf5c5d>Confirmado</span></span></div><div data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-efdf5c5d>Sesiones</p><div class="flex items-center gap-2" data-v-efdf5c5d><p class="${ssrRenderClass([{
            "text-red-600": bono.sesiones_restantes === 0,
            "text-orange-600": bono.sesiones_restantes === 1,
            "text-amber-600": bono.sesiones_restantes === 2,
            "text-[#027368]": bono.sesiones_restantes > 2
          }, "text-base font-bold"])}" data-v-efdf5c5d>${ssrInterpolate(bono.sesiones_restantes)}</p><p class="text-sm text-neutral-500" data-v-efdf5c5d>/ ${ssrInterpolate(bono.sesiones_totales)}</p></div>`);
          if (bono.sesiones_restantes <= 1) {
            _push(`<div class="${ssrRenderClass([{
              "text-red-600": bono.sesiones_restantes === 0,
              "text-orange-600": bono.sesiones_restantes === 1
            }, "flex items-center gap-1 text-xs font-semibold mt-1"])}" data-v-efdf5c5d><svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" data-v-efdf5c5d></path><path d="M12 9v4" data-v-efdf5c5d></path><path d="M12 17h.01" data-v-efdf5c5d></path></svg><span data-v-efdf5c5d>${ssrInterpolate(bono.sesiones_restantes === 0 ? "¡AGOTADO!" : "¡RENOVAR!")}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="text-left md:text-right" data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-efdf5c5d>Pago Confirmado</p><p class="text-2xl font-bold text-[#027368]" data-v-efdf5c5d>${ssrInterpolate(formatearPrecio(bono.monto_total))}€</p><p class="text-xs text-neutral-500 mt-1 flex items-center md:justify-end gap-1.5" data-v-efdf5c5d><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><rect width="18" height="18" x="3" y="4" rx="2" ry="2" data-v-efdf5c5d></rect><line x1="16" x2="16" y1="2" y2="6" data-v-efdf5c5d></line><line x1="8" x2="8" y1="2" y2="6" data-v-efdf5c5d></line><line x1="3" x2="21" y1="10" y2="10" data-v-efdf5c5d></line></svg><span data-v-efdf5c5d>${ssrInterpolate(formatearFecha(bono.fecha_pago))}</span></p></div></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(busquedaConfirmados) && unref(bonosConfirmadosFiltrados).length === 0) {
        _push(`<div class="text-center py-16" data-v-efdf5c5d><div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-5" data-v-efdf5c5d><svg class="w-12 h-12 text-[#027368]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><circle cx="11" cy="11" r="8" data-v-efdf5c5d></circle><path d="m21 21-4.35-4.35" data-v-efdf5c5d></path></svg></div><h3 class="text-xl font-semibold text-neutral-800 mb-2" data-v-efdf5c5d> No se encontraron resultados </h3><p class="text-neutral-600 mb-6" data-v-efdf5c5d> No hay pagos confirmados para &quot;${ssrInterpolate(unref(busquedaConfirmados))}&quot; </p><button class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white rounded-xl hover:from-[#027368] hover:to-[#04BF9D] transition-all duration-200 font-semibold shadow-sm hover:shadow-md" data-v-efdf5c5d><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><path d="M18 6 6 18" data-v-efdf5c5d></path><path d="m6 6 12 12" data-v-efdf5c5d></path></svg><span data-v-efdf5c5d>Limpiar búsqueda</span></button></div>`);
      } else {
        _push(`<div class="text-center py-16" data-v-efdf5c5d><div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-5" data-v-efdf5c5d><svg class="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" data-v-efdf5c5d></path><circle cx="12" cy="7" r="4" data-v-efdf5c5d></circle></svg></div><h3 class="text-xl font-semibold text-neutral-800 mb-2" data-v-efdf5c5d> Sin pagos registrados </h3><p class="text-neutral-600" data-v-efdf5c5d>${ssrInterpolate(unref(mesSeleccionado) ? "No hay pagos confirmados en este mes" : "No hay pagos confirmados aún")}</p></div>`);
      }
      _push(`</div></div>`);
      if (unref(modalDetalleAbierto)) {
        _push(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" data-v-efdf5c5d>`);
        if (unref(modalDetalleAbierto)) {
          _push(`<div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8" data-v-efdf5c5d><div class="flex items-center justify-between mb-6" data-v-efdf5c5d><div class="flex items-center gap-3" data-v-efdf5c5d><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#027368]/20 to-[#027368]/10 flex items-center justify-center" data-v-efdf5c5d><svg class="w-6 h-6 text-[#027368]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-v-efdf5c5d></path></svg></div><h3 class="text-xl font-serif font-bold text-neutral-800" data-v-efdf5c5d>Detalle del Pago</h3></div><button class="p-2 hover:bg-neutral-100 rounded-lg transition-colors" data-v-efdf5c5d><svg class="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-efdf5c5d><path d="M18 6 6 18" data-v-efdf5c5d></path><path d="m6 6 12 12" data-v-efdf5c5d></path></svg></button></div>`);
          if (unref(bonoSeleccionado)) {
            _push(`<div class="space-y-6" data-v-efdf5c5d><div class="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl border border-green-100" data-v-efdf5c5d><div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#027368] to-[#04BF9D] flex items-center justify-center text-white font-bold shadow-sm text-2xl" data-v-efdf5c5d>${ssrInterpolate(obtenerIniciales(unref(bonoSeleccionado).paciente_nombre))}</div><div data-v-efdf5c5d><p class="text-lg font-bold text-neutral-800" data-v-efdf5c5d>${ssrInterpolate(unref(bonoSeleccionado).paciente_nombre)}</p><p class="text-sm text-neutral-600 capitalize" data-v-efdf5c5d>${ssrInterpolate(unref(bonoSeleccionado).tipo_bono)}</p></div></div><div class="grid grid-cols-2 gap-4" data-v-efdf5c5d><div class="p-4 bg-neutral-50 rounded-xl border border-neutral-200" data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-efdf5c5d>Monto Total</p><p class="text-2xl font-bold text-[#027368]" data-v-efdf5c5d>${ssrInterpolate(formatearPrecio(unref(bonoSeleccionado).monto_total))}€</p></div><div class="p-4 bg-neutral-50 rounded-xl border border-neutral-200" data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-efdf5c5d>Fecha de Pago</p><p class="text-base font-semibold text-neutral-800" data-v-efdf5c5d>${ssrInterpolate(formatearFecha(unref(bonoSeleccionado).fecha_pago))}</p></div><div class="p-4 bg-neutral-50 rounded-xl border border-neutral-200" data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-efdf5c5d>Sesiones Totales</p><p class="text-2xl font-bold text-neutral-800" data-v-efdf5c5d>${ssrInterpolate(unref(bonoSeleccionado).sesiones_totales)}</p></div><div class="p-4 bg-neutral-50 rounded-xl border border-neutral-200" data-v-efdf5c5d><p class="text-xs text-neutral-500 uppercase font-semibold mb-1" data-v-efdf5c5d>Sesiones Restantes</p><p class="${ssrRenderClass([{
              "text-red-600": unref(bonoSeleccionado).sesiones_restantes === 0,
              "text-orange-600": unref(bonoSeleccionado).sesiones_restantes === 1,
              "text-amber-600": unref(bonoSeleccionado).sesiones_restantes === 2,
              "text-[#027368]": unref(bonoSeleccionado).sesiones_restantes > 2
            }, "text-2xl font-bold"])}" data-v-efdf5c5d>${ssrInterpolate(unref(bonoSeleccionado).sesiones_restantes)}</p></div></div><div class="flex justify-end pt-4" data-v-efdf5c5d><button class="px-6 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl transition-colors font-semibold" data-v-efdf5c5d> Cerrar </button></div></div>`);
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
const pagos = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-efdf5c5d"]]);

export { pagos as default };
//# sourceMappingURL=pagos-C7Ce3SnS.mjs.map
