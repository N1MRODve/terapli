import { _ as __nuxt_component_0 } from './nuxt-link-CboeUkiO.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';
import './server.mjs';
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
  __name: "bono",
  __ssrInlineRender: true,
  setup(__props) {
    const loading = ref(true);
    const bonos = ref([]);
    const bonoActivo = computed(() => bonos.value.find((b) => b.estado === "activo"));
    const bonosAnteriores = computed(
      () => bonos.value.filter((b) => b.estado !== "activo").sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );
    const formatearFecha = (fecha) => {
      if (!fecha) return "";
      return new Date(fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    };
    const formatearPrecio = (precio) => {
      try {
        return new Intl.NumberFormat("es-ES", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(precio);
      } catch {
        return precio;
      }
    };
    const estadoBonoTexto = (estado) => {
      const estados = { activo: "Activo", agotado: "Agotado", expirado: "Expirado", cancelado: "Cancelado" };
      return estados[estado] || estado;
    };
    const estadoBonoClass = (estado) => {
      const clases = {
        activo: "bg-green-100 text-green-800",
        agotado: "bg-red-100 text-red-800",
        expirado: "bg-gray-100 text-gray-800",
        cancelado: "bg-orange-100 text-orange-800"
      };
      return clases[estado] || "bg-gray-100 text-gray-800";
    };
    const getProgressColor = (restantes, total) => {
      const porcentaje = restantes / total * 100;
      if (porcentaje > 50) return "bg-[#D8AFA0]";
      if (porcentaje > 25) return "bg-amber-500";
      return "bg-red-500";
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-4xl mx-auto space-y-6 px-4 py-8" }, _attrs))}>`);
      if (unref(loading)) {
        _push(`<div class="flex flex-col items-center justify-center min-h-[40vh]"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D8AFA0]"></div><p class="mt-4 text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;]">Cargando tu bono...</p></div>`);
      } else {
        _push(`<div><header class="mb-8"><h1 class="text-2xl sm:text-3xl font-[&#39;Lora&#39;] font-medium text-[#5D4A44]"> Mi Bono </h1><p class="text-sm text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;] mt-1"> Gestiona y consulta tu bono de sesiones </p></header>`);
        if (unref(bonoActivo)) {
          _push(`<section class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/30 p-6 mb-8"><header class="flex items-center justify-between mb-4"><div><h2 class="text-xl font-[&#39;Lora&#39;] font-medium text-[#5D4A44]">Bono de ${ssrInterpolate(unref(bonoActivo).total_sesiones)} Sesiones</h2><p class="text-sm text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;]">Contratado el ${ssrInterpolate(formatearFecha(unref(bonoActivo).created_at))}</p></div><div><span class="${ssrRenderClass([estadoBonoClass(unref(bonoActivo).estado), "px-3 py-1 rounded-full text-xs font-['Lato'] font-medium"])}">${ssrInterpolate(estadoBonoTexto(unref(bonoActivo).estado))}</span></div></header><div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6"><div class="text-center"><p class="text-4xl font-[&#39;Lora&#39;] font-bold text-[#D8AFA0]">${ssrInterpolate(unref(bonoActivo).sesiones_restantes)}</p><p class="text-sm text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;] mt-1">Disponibles</p></div><div class="text-center"><p class="text-4xl font-[&#39;Lora&#39;] font-bold text-[#5D4A44]">${ssrInterpolate(unref(bonoActivo).total_sesiones)}</p><p class="text-sm text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;] mt-1">Totales</p></div><div class="text-center"><p class="text-4xl font-[&#39;Lora&#39;] font-bold text-[#5D4A44] opacity-50">${ssrInterpolate(unref(bonoActivo).sesiones_usadas)}</p><p class="text-sm text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;] mt-1">Completadas</p></div></div><div class="space-y-2"><div class="flex justify-between text-xs font-[&#39;Lato&#39;] text-[#5D4A44] opacity-70"><span>Progreso del bono</span><span>${ssrInterpolate(Math.round(unref(bonoActivo).sesiones_usadas / unref(bonoActivo).total_sesiones * 100))}%</span></div><div class="w-full bg-[#EAD5D3]/30 rounded-full h-3 overflow-hidden"><div class="${ssrRenderClass([getProgressColor(unref(bonoActivo).sesiones_restantes, unref(bonoActivo).total_sesiones), "h-full rounded-full transition-all duration-500"])}" style="${ssrRenderStyle({ width: `${unref(bonoActivo).sesiones_usadas / unref(bonoActivo).total_sesiones * 100}%` })}"></div></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"><div class="flex items-center space-x-3 p-4 bg-[#F9F7F3] rounded-lg"><div class="w-10 h-10 rounded-full bg-[#D8AFA0]/20 flex items-center justify-center flex-shrink-0"><svg class="w-5 h-5 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><div><p class="text-xs text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;]">Precio total</p><p class="text-lg font-[&#39;Lora&#39;] font-medium text-[#5D4A44]">${ssrInterpolate(formatearPrecio(unref(bonoActivo).precio_total))}\u20AC</p><p class="text-xs text-[#5D4A44] opacity-50 font-[&#39;Lato&#39;]">${ssrInterpolate(formatearPrecio(unref(bonoActivo).precio_total / unref(bonoActivo).total_sesiones))}\u20AC por sesi\xF3n</p></div></div><div class="flex items-center space-x-3 p-4 bg-[#F9F7F3] rounded-lg"><div class="w-10 h-10 rounded-full bg-[#D8AFA0]/20 flex items-center justify-center flex-shrink-0"><svg class="w-5 h-5 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><div><p class="text-xs text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;]">Estado</p><p class="text-lg font-[&#39;Lora&#39;] font-medium text-[#5D4A44]">${ssrInterpolate(estadoBonoTexto(unref(bonoActivo).estado))}</p>`);
          if (unref(bonoActivo).fecha_expiracion) {
            _push(`<p class="text-xs text-[#5D4A44] opacity-50 font-[&#39;Lato&#39;]">V\xE1lido hasta ${ssrInterpolate(formatearFecha(unref(bonoActivo).fecha_expiracion))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div>`);
          if (unref(bonoActivo).sesiones_restantes <= 2 && unref(bonoActivo).sesiones_restantes > 0) {
            _push(`<div class="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mt-6"><svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg><div><p class="text-sm font-[&#39;Lato&#39;] font-medium text-amber-900">Quedan pocas sesiones</p><p class="text-xs font-[&#39;Lato&#39;] text-amber-700 mt-1">Considera renovar tu bono pronto para mantener la continuidad.</p></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(bonoActivo).sesiones_restantes === 0) {
            _push(`<div class="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg mt-6"><svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><div><p class="text-sm font-[&#39;Lato&#39;] font-medium text-red-900">Bono agotado</p><p class="text-xs font-[&#39;Lato&#39;] text-red-700 mt-1">Has utilizado todas las sesiones. Contacta para adquirir uno nuevo.</p></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(bonoActivo).sesiones_restantes <= 2) {
            _push(`<div class="pt-4 border-t border-[#EAD5D3]/30 mt-6">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: "/como-empezar",
              class: "block w-full text-center px-6 py-3 bg-[#D8AFA0] hover:bg-[#C89B8A] text-white rounded-lg font-['Lato'] font-medium transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`Renovar Bono`);
                } else {
                  return [
                    createTextVNode("Renovar Bono")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</section>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(bonosAnteriores).length > 0) {
          _push(`<section class="space-y-4"><h2 class="text-lg font-[&#39;Lora&#39;] font-medium text-[#5D4A44] mb-2">Historial de Bonos</h2><div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(bonosAnteriores), (bono) => {
            _push(`<article class="bg-white rounded-lg shadow-sm border border-[#EAD5D3]/30 p-4"><div class="flex items-center justify-between mb-3"><div><h3 class="text-base font-[&#39;Lato&#39;] font-medium text-[#5D4A44]">Bono de ${ssrInterpolate(bono.total_sesiones)} Sesiones</h3><p class="text-xs text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;]">${ssrInterpolate(formatearFecha(bono.created_at))}</p></div><div class="text-right"><p class="text-sm font-[&#39;Lora&#39;] font-medium text-[#5D4A44]">${ssrInterpolate(bono.sesiones_usadas)}/${ssrInterpolate(bono.total_sesiones)}</p><p class="text-xs text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;]">sesiones</p></div></div><div class="w-full bg-[#EAD5D3]/30 rounded-full h-2"><div class="h-full bg-[#5D4A44] opacity-30 rounded-full" style="${ssrRenderStyle({ width: `${bono.sesiones_usadas / bono.total_sesiones * 100}%` })}"></div></div><div class="flex items-center space-x-2 mt-2 text-xs text-[#5D4A44] opacity-60 font-[&#39;Lato&#39;]"><span class="${ssrRenderClass([estadoBonoClass(bono.estado), "px-2 py-0.5 rounded-full font-medium"])}">${ssrInterpolate(estadoBonoTexto(bono.estado))}</span><span>\xB7</span><span>Contratado: ${ssrInterpolate(formatearFecha(bono.created_at))}</span>`);
            if (bono.fecha_expiracion) {
              _push(`<span>\xB7 Expira: ${ssrInterpolate(formatearFecha(bono.fecha_expiracion))}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></article>`);
          });
          _push(`<!--]--></div></section>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(bonoActivo) && unref(bonosAnteriores).length === 0) {
          _push(`<div class="flex flex-col items-center justify-center text-center py-16"><div class="w-20 h-20 rounded-full bg-[#EAD5D3]/30 flex items-center justify-center mb-4"><svg class="w-10 h-10 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg></div><h3 class="text-xl font-[&#39;Lora&#39;] font-medium text-[#5D4A44] mb-2">No tienes bonos activos</h3><p class="text-sm text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;] max-w-md mb-6">Adquiere un bono para comenzar tu proceso terap\xE9utico.</p>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/contacto",
            class: "px-6 py-3 bg-[#D8AFA0] hover:bg-[#C89B8A] text-white rounded-lg font-['Lato'] font-medium transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Contactar`);
              } else {
                return [
                  createTextVNode("Contactar")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/paciente/bono.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=bono-w-_Tb6TR.mjs.map
