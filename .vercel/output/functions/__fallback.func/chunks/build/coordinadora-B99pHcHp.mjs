import { _ as __nuxt_component_0 } from './nuxt-link-CboeUkiO.mjs';
import { ref, watch, computed, mergeProps, withCtx, unref, createVNode, createBlock, openBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { HomeIcon, CalendarIcon, UserGroupIcon, BellIcon, ChatBubbleLeftRightIcon, CreditCardIcon, ArrowRightOnRectangleIcon, XMarkIcon, Bars3Icon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
import { a as useRouter, h as useRoute, e as useSupabaseUser } from './server.mjs';
import { u as useSupabase } from './useSupabase-DljD0dj8.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import './useSupabaseClient-DykwVqLQ.mjs';

const _sfc_main = {
  __name: "coordinadora",
  __ssrInlineRender: true,
  setup(__props) {
    const mobileMenuOpen = ref(false);
    useRouter();
    const route = useRoute();
    const user = useSupabaseUser();
    useSupabase();
    watch(() => route.path, () => {
      mobileMenuOpen.value = false;
    });
    const pageTitle = computed(() => {
      const path = route.path;
      if (path.includes("/dashboard")) return "Dashboard";
      if (path.includes("/agenda")) return "Agenda";
      if (path.includes("/confirmaciones")) return "Confirmaciones";
      if (path.includes("/pacientes")) return "Pacientes";
      if (path.includes("/recordatorios")) return "Recordatorios";
      if (path.includes("/mensajes")) return "Mensajes";
      if (path.includes("/pagos")) return "Pagos";
      return "Coordinaci\xF3n";
    });
    const userInitials = computed(() => {
      var _a;
      if (!((_a = user.value) == null ? void 0 : _a.email)) return "CO";
      return user.value.email.substring(0, 2).toUpperCase();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-base-bg flex overflow-hidden" }, _attrs))} data-v-26eaaf0c><aside class="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white shadow-lg flex-col z-30" data-v-26eaaf0c><div class="p-6 border-b border-gray-100" data-v-26eaaf0c><h1 class="text-xl font-serif font-bold text-cafe" data-v-26eaaf0c> Psic\xF3loga Karem </h1><p class="text-sm text-terracota mt-1" data-v-26eaaf0c> Panel de Coordinaci\xF3n </p></div><nav class="flex-1 p-4 overflow-y-auto" data-v-26eaaf0c><ul class="space-y-2" data-v-26eaaf0c><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/dashboard",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(HomeIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-26eaaf0c${_scopeId}>Dashboard</span>`);
          } else {
            return [
              createVNode(unref(HomeIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Dashboard")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/agenda",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(CalendarIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-26eaaf0c${_scopeId}>Agenda</span>`);
          } else {
            return [
              createVNode(unref(CalendarIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Agenda")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/confirmaciones",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-26eaaf0c${_scopeId}><path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" data-v-26eaaf0c${_scopeId}></path></svg><span class="font-medium" data-v-26eaaf0c${_scopeId}>Confirmaciones</span>`);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                class: "w-5 h-5",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2",
                viewBox: "0 0 24 24"
              }, [
                createVNode("path", { d: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" })
              ])),
              createVNode("span", { class: "font-medium" }, "Confirmaciones")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/pacientes",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(UserGroupIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-26eaaf0c${_scopeId}>Pacientes</span>`);
          } else {
            return [
              createVNode(unref(UserGroupIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Pacientes")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/recordatorios",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(BellIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-26eaaf0c${_scopeId}>Recordatorios</span>`);
          } else {
            return [
              createVNode(unref(BellIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Recordatorios")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/mensajes",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(ChatBubbleLeftRightIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-26eaaf0c${_scopeId}>Mensajes</span>`);
          } else {
            return [
              createVNode(unref(ChatBubbleLeftRightIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Mensajes")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/pagos",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(CreditCardIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-26eaaf0c${_scopeId}>Pagos</span>`);
          } else {
            return [
              createVNode(unref(CreditCardIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Pagos")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></nav><div class="p-4 border-t border-gray-100" data-v-26eaaf0c><button class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200" data-v-26eaaf0c>`);
      _push(ssrRenderComponent(unref(ArrowRightOnRectangleIcon), { class: "w-5 h-5" }, null, _parent));
      _push(`<span class="font-medium" data-v-26eaaf0c>Cerrar sesi\xF3n</span></button></div></aside>`);
      if (unref(mobileMenuOpen)) {
        _push(`<div class="lg:hidden fixed inset-0 bg-cafe/50 backdrop-blur-sm z-40" data-v-26eaaf0c></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<aside class="${ssrRenderClass([unref(mobileMenuOpen) ? "translate-x-0" : "-translate-x-full", "lg:hidden fixed left-0 top-0 h-screen w-64 bg-white shadow-2xl flex-col z-50 transform transition-transform duration-300"])}" data-v-26eaaf0c><div class="p-6 border-b border-gray-100 flex items-center justify-between" data-v-26eaaf0c><div data-v-26eaaf0c><h1 class="text-xl font-serif font-bold text-cafe" data-v-26eaaf0c> Psic\xF3loga Karem </h1><p class="text-sm text-terracota mt-1" data-v-26eaaf0c> Panel de Coordinaci\xF3n </p></div><button class="text-cafe hover:text-terracota transition-colors" data-v-26eaaf0c>`);
      _push(ssrRenderComponent(unref(XMarkIcon), { class: "w-6 h-6" }, null, _parent));
      _push(`</button></div><nav class="flex-1 p-4 overflow-y-auto" data-v-26eaaf0c><ul class="space-y-2" data-v-26eaaf0c><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/dashboard",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(HomeIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-26eaaf0c${_scopeId}>Dashboard</span>`);
          } else {
            return [
              createVNode(unref(HomeIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Dashboard")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/agenda",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(CalendarIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-26eaaf0c${_scopeId}>Agenda</span>`);
          } else {
            return [
              createVNode(unref(CalendarIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Agenda")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/confirmaciones",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-26eaaf0c${_scopeId}><path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" data-v-26eaaf0c${_scopeId}></path></svg><span class="font-medium" data-v-26eaaf0c${_scopeId}>Confirmaciones</span>`);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                class: "w-5 h-5",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2",
                viewBox: "0 0 24 24"
              }, [
                createVNode("path", { d: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" })
              ])),
              createVNode("span", { class: "font-medium" }, "Confirmaciones")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/pacientes",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(UserGroupIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-26eaaf0c${_scopeId}>Pacientes</span>`);
          } else {
            return [
              createVNode(unref(UserGroupIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Pacientes")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/recordatorios",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(BellIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-26eaaf0c${_scopeId}>Recordatorios</span>`);
          } else {
            return [
              createVNode(unref(BellIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Recordatorios")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/mensajes",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(ChatBubbleLeftRightIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-26eaaf0c${_scopeId}>Mensajes</span>`);
          } else {
            return [
              createVNode(unref(ChatBubbleLeftRightIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Mensajes")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-26eaaf0c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/pagos",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-cafe/5 transition-colors duration-200",
        "active-class": "bg-cafe/10 text-cafe font-semibold",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(CreditCardIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-26eaaf0c${_scopeId}>Pagos</span>`);
          } else {
            return [
              createVNode(unref(CreditCardIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Pagos")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></nav><div class="p-4 border-t border-gray-100" data-v-26eaaf0c><button class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200" data-v-26eaaf0c>`);
      _push(ssrRenderComponent(unref(ArrowRightOnRectangleIcon), { class: "w-5 h-5" }, null, _parent));
      _push(`<span class="font-medium" data-v-26eaaf0c>Cerrar sesi\xF3n</span></button></div></aside><div class="flex-1 lg:ml-64 flex flex-col h-screen" data-v-26eaaf0c><header class="sticky top-0 bg-white shadow-sm z-20 flex-shrink-0" data-v-26eaaf0c><div class="px-4 lg:px-8 py-4" data-v-26eaaf0c><div class="flex items-center justify-between gap-4" data-v-26eaaf0c><button class="lg:hidden text-cafe hover:text-terracota transition-colors" data-v-26eaaf0c>`);
      _push(ssrRenderComponent(unref(Bars3Icon), { class: "w-6 h-6" }, null, _parent));
      _push(`</button><div class="flex-1" data-v-26eaaf0c><h2 class="text-lg lg:text-xl font-serif font-semibold text-cafe" data-v-26eaaf0c>${ssrInterpolate(unref(pageTitle))}</h2></div><div class="hidden md:block flex-1 max-w-md" data-v-26eaaf0c><div class="relative" data-v-26eaaf0c><input type="text" placeholder="Buscar paciente, cita\u2026" class="w-full px-4 py-2 pl-10 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all text-sm text-cafe placeholder-cafe/50" data-v-26eaaf0c>`);
      _push(ssrRenderComponent(unref(MagnifyingGlassIcon), { class: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cafe/50" }, null, _parent));
      _push(`</div></div><button class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors duration-200 text-sm font-medium whitespace-nowrap" data-v-26eaaf0c> + Nueva tarea </button><div class="w-10 h-10 rounded-full bg-terracota text-white flex items-center justify-center font-semibold text-sm flex-shrink-0" data-v-26eaaf0c>${ssrInterpolate(unref(userInitials))}</div></div></div></header><main class="flex-1 overflow-auto px-4 lg:px-8 py-6" data-v-26eaaf0c>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/coordinadora.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const coordinadora = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-26eaaf0c"]]);

export { coordinadora as default };
//# sourceMappingURL=coordinadora-B99pHcHp.mjs.map
