import { _ as __nuxt_component_1 } from './NotificacionesBell-C-K-wOkY.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-CboeUkiO.mjs';
import { ref, mergeProps, withCtx, createVNode, resolveDynamicComponent, createBlock, openBlock, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderVNode, ssrRenderSlot } from 'vue/server-renderer';
import { h as useRoute } from './server.mjs';
import { u as useSupabase } from './useSupabase-DljD0dj8.mjs';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import './useNotificaciones-CrhSSwYp.mjs';
import './_plugin-vue_export-helper-1tPrXgE0.mjs';
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

const _sfc_main = {
  __name: "paciente",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useSupabase();
    useSupabaseClient();
    const sidebarOpen = ref(false);
    const nombrePaciente = ref("Cargando...");
    const menuItems = [
      {
        path: "/paciente/dashboard",
        label: "Inicio",
        icon: "IconHome"
      },
      {
        path: "/paciente/sesiones",
        label: "Mis Sesiones",
        icon: "IconCalendar"
      },
      {
        path: "/paciente/bono",
        label: "Mi Bono",
        icon: "IconTicket"
      },
      {
        path: "/paciente/recursos",
        label: "Mis Recursos",
        icon: "IconBook"
      },
      {
        path: "/paciente/mensajes",
        label: "Mensajes",
        icon: "IconMessage"
      }
    ];
    const isActive = (path) => {
      return route.path === path;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NotificacionesBell = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-[#F9F7F3]" }, _attrs))}><header class="bg-white border-b border-[#EAD5D3] sticky top-0 z-40 shadow-sm"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-16"><div class="flex items-center"><button class="mr-4 lg:hidden text-[#5D4A44] hover:text-[#D8AFA0] transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button><h1 class="text-xl font-[&#39;Lora&#39;] font-medium text-[#5D4A44]"> Mi Espacio Terap\xE9utico </h1></div><div class="flex items-center space-x-3">`);
      _push(ssrRenderComponent(_component_NotificacionesBell, null, null, _parent));
      _push(`<div class="hidden sm:block text-right"><p class="text-sm font-medium text-[#5D4A44] font-[&#39;Lato&#39;]">${ssrInterpolate(nombrePaciente.value)}</p><p class="text-xs text-[#5D4A44] opacity-60"> Paciente </p></div><button class="flex items-center space-x-2 px-4 py-2 text-sm font-[&#39;Lato&#39;] text-[#5D4A44] hover:text-[#D8AFA0] transition-colors" title="Cerrar sesi\xF3n"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg><span class="hidden sm:inline">Salir</span></button></div></div></div></header><div class="flex"><aside class="hidden lg:flex lg:flex-shrink-0"><div class="flex flex-col w-64 border-r border-[#EAD5D3] bg-white min-h-[calc(100vh-4rem)]"><nav class="flex-1 px-4 py-6 space-y-2"><!--[-->`);
      ssrRenderList(menuItems, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.path,
          to: item.path,
          class: ["flex items-center space-x-3 px-4 py-3 rounded-lg font-['Lato'] text-sm transition-all duration-200", isActive(item.path) ? "bg-[#EAD5D3] text-[#5D4A44] font-medium" : "text-[#5D4A44] hover:bg-[#F9F7F3]"]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(item.icon), { class: "w-5 h-5" }, null), _parent2, _scopeId);
              _push2(`<span${_scopeId}>${ssrInterpolate(item.label)}</span>`);
            } else {
              return [
                (openBlock(), createBlock(resolveDynamicComponent(item.icon), { class: "w-5 h-5" })),
                createVNode("span", null, toDisplayString(item.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav></div></aside>`);
      if (sidebarOpen.value) {
        _push(`<div class="fixed inset-0 z-50 lg:hidden"><div class="fixed inset-0 bg-black/50"></div><div class="fixed inset-y-0 left-0 w-64 bg-white border-r border-[#EAD5D3]"><div class="flex items-center justify-between p-4 border-b border-[#EAD5D3]"><h2 class="text-lg font-[&#39;Lora&#39;] font-medium text-[#5D4A44]"> Men\xFA </h2><button class="text-[#5D4A44] hover:text-[#D8AFA0]"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><nav class="flex-1 px-4 py-6 space-y-2"><!--[-->`);
        ssrRenderList(menuItems, (item) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: item.path,
            to: item.path,
            class: ["flex items-center space-x-3 px-4 py-3 rounded-lg font-['Lato'] text-sm transition-all duration-200", isActive(item.path) ? "bg-[#EAD5D3] text-[#5D4A44] font-medium" : "text-[#5D4A44] hover:bg-[#F9F7F3]"],
            onClick: ($event) => sidebarOpen.value = false
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(item.icon), { class: "w-5 h-5" }, null), _parent2, _scopeId);
                _push2(`<span${_scopeId}>${ssrInterpolate(item.label)}</span>`);
              } else {
                return [
                  (openBlock(), createBlock(resolveDynamicComponent(item.icon), { class: "w-5 h-5" })),
                  createVNode("span", null, toDisplayString(item.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></nav></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<main class="flex-1 p-4 sm:p-6 lg:p-8">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/paciente.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=paciente-CzG8wURd.mjs.map
