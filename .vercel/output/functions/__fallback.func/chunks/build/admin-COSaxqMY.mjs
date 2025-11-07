import { _ as __nuxt_component_0 } from './nuxt-link-CboeUkiO.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { useRouter, useRoute } from 'vue-router';
import { ChartBarIcon, ArrowRightOnRectangleIcon, UsersIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline';
import { u as useSupabase } from './useSupabase-DljD0dj8.mjs';
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
import '@supabase/ssr';
import '@vercel/analytics/nuxt';
import './useSupabaseClient-DykwVqLQ.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const route = useRoute();
    useSupabase();
    const usuario = ref(null);
    const rutaActual = computed(() => route.path);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" }, _attrs))}><nav class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-16"><div class="flex items-center gap-4"><div class="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">`);
      _push(ssrRenderComponent(unref(ChartBarIcon), {
        class: "w-6 h-6 text-white",
        "aria-hidden": "true"
      }, null, _parent));
      _push(`</div><div><h1 class="text-xl font-bold text-gray-900">Panel de Administración</h1><p class="text-xs text-gray-500">Sistema de gestión</p></div></div><div class="flex items-center gap-4"><div class="text-right hidden sm:block"><p class="text-sm font-semibold text-gray-900">${ssrInterpolate(usuario.value?.email || "Admin")}</p><p class="text-xs text-gray-500">Administrador</p></div><button class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium">`);
      _push(ssrRenderComponent(unref(ArrowRightOnRectangleIcon), {
        class: "w-4 h-4",
        "aria-hidden": "true"
      }, null, _parent));
      _push(`<span class="hidden sm:inline">Cerrar sesión</span></button></div></div></div></nav><div class="bg-white border-b border-gray-200 shadow-sm"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><nav class="flex gap-1 -mb-px" aria-label="Tabs">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin",
        exact: "",
        class: ["group inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-all", rutaActual.value === "/admin" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(ChartBarIcon), {
              class: "w-5 h-5",
              "aria-hidden": "true"
            }, null, _parent2, _scopeId));
            _push2(`<span${_scopeId}>Métricas</span>`);
          } else {
            return [
              createVNode(unref(ChartBarIcon), {
                class: "w-5 h-5",
                "aria-hidden": "true"
              }),
              createVNode("span", null, "Métricas")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/terapeutas",
        class: ["group inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-all", rutaActual.value.startsWith("/admin/terapeutas") ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(UsersIcon), {
              class: "w-5 h-5",
              "aria-hidden": "true"
            }, null, _parent2, _scopeId));
            _push2(`<span${_scopeId}>Terapeutas</span>`);
          } else {
            return [
              createVNode(unref(UsersIcon), {
                class: "w-5 h-5",
                "aria-hidden": "true"
              }),
              createVNode("span", null, "Terapeutas")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/pacientes",
        class: ["group inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-all", rutaActual.value.startsWith("/admin/pacientes") ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(UserGroupIcon), {
              class: "w-5 h-5",
              "aria-hidden": "true"
            }, null, _parent2, _scopeId));
            _push2(`<span${_scopeId}>Pacientes</span>`);
          } else {
            return [
              createVNode(unref(UserGroupIcon), {
                class: "w-5 h-5",
                "aria-hidden": "true"
              }),
              createVNode("span", null, "Pacientes")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/finanzas",
        class: ["group inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-all", rutaActual.value.startsWith("/admin/finanzas") ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(CurrencyDollarIcon), {
              class: "w-5 h-5",
              "aria-hidden": "true"
            }, null, _parent2, _scopeId));
            _push2(`<span${_scopeId}>Finanzas</span>`);
          } else {
            return [
              createVNode(unref(CurrencyDollarIcon), {
                class: "w-5 h-5",
                "aria-hidden": "true"
              }),
              createVNode("span", null, "Finanzas")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav></div></div><main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=admin-COSaxqMY.mjs.map
