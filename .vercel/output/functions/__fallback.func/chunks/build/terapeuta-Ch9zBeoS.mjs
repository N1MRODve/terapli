import { _ as __nuxt_component_0 } from './nuxt-link-CboeUkiO.mjs';
import { _ as __nuxt_component_1 } from './NotificacionesBell-C-K-wOkY.mjs';
import { useSSRContext, ref, watch, mergeProps, withCtx, unref, createVNode } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';
import { HomeIcon, UserGroupIcon, CalendarIcon, ChatBubbleLeftRightIcon, EnvelopeIcon, BookOpenIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, XMarkIcon, Bars3Icon } from '@heroicons/vue/24/outline';
import { u as useSupabase } from './useSupabase-DljD0dj8.mjs';
import { h as useRoute } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import './useNotificaciones-CrhSSwYp.mjs';
import './useSupabaseClient-DykwVqLQ.mjs';
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
  __name: "terapeuta",
  __ssrInlineRender: true,
  setup(__props) {
    const mobileMenuOpen = ref(false);
    useSupabase();
    const route = useRoute();
    watch(() => route.path, () => {
      mobileMenuOpen.value = false;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_NotificacionesBell = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-base-bg flex" }, _attrs))} data-v-5f877428><aside class="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-white shadow-lg flex-col z-30" data-v-5f877428><div class="p-6 border-b border-gray-100" data-v-5f877428><h1 class="text-2xl font-serif font-bold text-cafe" data-v-5f877428> Psic\xF3loga Karem </h1><p class="text-sm text-terracota mt-1" data-v-5f877428> Espacio de gesti\xF3n </p></div><nav class="flex-1 p-4 overflow-y-auto" data-v-5f877428><ul class="space-y-2" data-v-5f877428><li data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/dashboard",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(HomeIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Inicio</span>`);
          } else {
            return [
              createVNode(unref(HomeIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Inicio")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/pacientes",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(UserGroupIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Pacientes</span>`);
          } else {
            return [
              createVNode(unref(UserGroupIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Pacientes")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/agenda",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(CalendarIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Agenda</span>`);
          } else {
            return [
              createVNode(unref(CalendarIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Agenda")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/sesiones",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(ChatBubbleLeftRightIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Sesiones</span>`);
          } else {
            return [
              createVNode(unref(ChatBubbleLeftRightIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Sesiones")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/mensajes",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(EnvelopeIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Mensajer\xEDa</span>`);
          } else {
            return [
              createVNode(unref(EnvelopeIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Mensajer\xEDa")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/recursos",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(BookOpenIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Recursos</span>`);
          } else {
            return [
              createVNode(unref(BookOpenIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Recursos")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></nav><div class="p-4 border-t border-gray-100 space-y-2" data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/configuracion",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(Cog6ToothIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Configuraci\xF3n</span>`);
          } else {
            return [
              createVNode(unref(Cog6ToothIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Configuraci\xF3n")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200" data-v-5f877428>`);
      _push(ssrRenderComponent(unref(ArrowRightOnRectangleIcon), { class: "w-5 h-5" }, null, _parent));
      _push(`<span class="font-medium" data-v-5f877428>Cerrar sesi\xF3n</span></button></div></aside>`);
      if (unref(mobileMenuOpen)) {
        _push(`<div class="lg:hidden fixed inset-0 bg-cafe/50 backdrop-blur-sm z-40" data-v-5f877428></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<aside class="${ssrRenderClass([unref(mobileMenuOpen) ? "translate-x-0" : "-translate-x-full", "lg:hidden fixed left-0 top-0 h-screen w-72 bg-white shadow-2xl flex-col z-50 transform transition-transform duration-300"])}" data-v-5f877428><div class="p-6 border-b border-gray-100 flex items-center justify-between" data-v-5f877428><div data-v-5f877428><h1 class="text-2xl font-serif font-bold text-cafe" data-v-5f877428> Karem Pe\xF1a </h1><p class="text-sm text-terracota mt-1" data-v-5f877428> Espacio Cl\xEDnico </p></div><button class="text-cafe hover:text-terracota transition-colors" data-v-5f877428>`);
      _push(ssrRenderComponent(unref(XMarkIcon), { class: "w-6 h-6" }, null, _parent));
      _push(`</button></div><nav class="flex-1 p-4 overflow-y-auto" data-v-5f877428><ul class="space-y-2" data-v-5f877428><li data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/dashboard",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(HomeIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Inicio</span>`);
          } else {
            return [
              createVNode(unref(HomeIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Inicio")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/pacientes",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(UserGroupIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Pacientes</span>`);
          } else {
            return [
              createVNode(unref(UserGroupIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Pacientes")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/agenda",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(CalendarIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Agenda</span>`);
          } else {
            return [
              createVNode(unref(CalendarIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Agenda")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/sesiones",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(ChatBubbleLeftRightIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Sesiones</span>`);
          } else {
            return [
              createVNode(unref(ChatBubbleLeftRightIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Sesiones")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/mensajes",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(EnvelopeIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Mensajer\xEDa</span>`);
          } else {
            return [
              createVNode(unref(EnvelopeIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Mensajer\xEDa")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/recursos",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(BookOpenIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Recursos</span>`);
          } else {
            return [
              createVNode(unref(BookOpenIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Recursos")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></nav><div class="p-4 border-t border-gray-100 space-y-2" data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terapeuta/configuracion",
        class: "flex items-center gap-3 px-4 py-3 rounded-lg text-cafe hover:bg-rosa/30 transition-colors duration-200",
        "active-class": "bg-terracota text-white hover:bg-terracota",
        onClick: ($event) => mobileMenuOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(Cog6ToothIcon), { class: "w-5 h-5" }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-5f877428${_scopeId}>Configuraci\xF3n</span>`);
          } else {
            return [
              createVNode(unref(Cog6ToothIcon), { class: "w-5 h-5" }),
              createVNode("span", { class: "font-medium" }, "Configuraci\xF3n")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200" data-v-5f877428>`);
      _push(ssrRenderComponent(unref(ArrowRightOnRectangleIcon), { class: "w-5 h-5" }, null, _parent));
      _push(`<span class="font-medium" data-v-5f877428>Cerrar sesi\xF3n</span></button></div></aside><div class="flex-1 lg:ml-72" data-v-5f877428><header class="sticky top-0 bg-white shadow-sm z-20" data-v-5f877428><div class="px-4 lg:px-8 py-4" data-v-5f877428><div class="flex items-center justify-between gap-4" data-v-5f877428><button class="lg:hidden text-cafe hover:text-terracota transition-colors" data-v-5f877428>`);
      _push(ssrRenderComponent(unref(Bars3Icon), { class: "w-6 h-6" }, null, _parent));
      _push(`</button><div class="hidden lg:flex items-center gap-3" data-v-5f877428><div class="text-right" data-v-5f877428><h2 class="font-serif font-semibold text-cafe" data-v-5f877428> Karem Pe\xF1a </h2><p class="text-sm text-terracota flex items-center gap-1.5" data-v-5f877428><span class="inline-block w-2 h-2 bg-green-500 rounded-full" data-v-5f877428></span> Online hoy </p></div></div><div class="flex-1 max-w-md" data-v-5f877428><div class="relative" data-v-5f877428><input type="text" placeholder="Buscar paciente o sesi\xF3n\u2026" class="w-full px-4 py-2.5 pl-10 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all text-cafe placeholder-cafe/50" data-v-5f877428><span class="absolute left-3 top-1/2 -translate-y-1/2 text-cafe/50" data-v-5f877428> \u{1F50D} </span></div></div><div class="flex items-center gap-4" data-v-5f877428>`);
      _push(ssrRenderComponent(_component_NotificacionesBell, null, null, _parent));
      _push(`<div class="w-10 h-10 rounded-full bg-terracota text-white flex items-center justify-center font-semibold text-sm" data-v-5f877428> KP </div></div></div></div></header><main class="px-4 lg:px-8 py-8" data-v-5f877428>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/terapeuta.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const terapeuta = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5f877428"]]);

export { terapeuta as default };
//# sourceMappingURL=terapeuta-Ch9zBeoS.mjs.map
