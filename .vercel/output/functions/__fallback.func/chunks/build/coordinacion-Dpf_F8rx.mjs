import { _ as __nuxt_component_0 } from './nuxt-link-CboeUkiO.mjs';
import { defineComponent, ref, computed, resolveComponent, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';
import { i as useRoute, h as useSupabaseUser, g as useSupabaseClient, a as useRouter, e as useSupabase } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "coordinacion",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const user = useSupabaseUser();
    useSupabaseClient();
    useRouter();
    useSupabase();
    const mostrarNotificaciones = ref(false);
    const mostrarMenuUsuario = ref(false);
    const notificaciones = ref([]);
    const notificacionesNoLeidas = ref(0);
    const nombreUsuario = computed(() => {
      var _a, _b;
      return ((_b = (_a = user.value) == null ? void 0 : _a.user_metadata) == null ? void 0 : _b.nombre) || "Coordinaci\xF3n";
    });
    const emailUsuario = computed(() => {
      var _a;
      return ((_a = user.value) == null ? void 0 : _a.email) || "";
    });
    const iniciales = computed(() => {
      const nombre = nombreUsuario.value;
      return nombre.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
    });
    const menuItems = [
      { path: "/coordinacion/dashboard", label: "Dashboard", icon: "heroicons:home" },
      { path: "/coordinacion/agenda", label: "Agenda", icon: "heroicons:calendar" },
      { path: "/coordinacion/pagos", label: "Pagos", icon: "heroicons:credit-card" },
      { path: "/coordinacion/mensajes", label: "Mensajes", icon: "heroicons:chat-bubble-left-right" }
    ];
    const isActive = (path) => {
      return route.path === path || route.path.startsWith(path + "/");
    };
    const formatearFecha = (fecha) => {
      const date = new Date(fecha);
      const ahora = /* @__PURE__ */ new Date();
      const diff = ahora.getTime() - date.getTime();
      const minutos = Math.floor(diff / 6e4);
      const horas = Math.floor(diff / 36e5);
      const dias = Math.floor(diff / 864e5);
      if (minutos < 1) return "Ahora";
      if (minutos < 60) return `Hace ${minutos} min`;
      if (horas < 24) return `Hace ${horas} h`;
      if (dias < 7) return `Hace ${dias} d`;
      return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_Icon = resolveComponent("Icon");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-[#F9F7F3]" }, _attrs))} data-v-06e2a812><header class="bg-white shadow-sm border-b border-[#E8DFD8]" data-v-06e2a812><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-v-06e2a812><div class="flex justify-between items-center h-16" data-v-06e2a812><div class="flex items-center space-x-3" data-v-06e2a812><div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] flex items-center justify-center" data-v-06e2a812><span class="text-white font-semibold text-lg" data-v-06e2a812>B</span></div><div data-v-06e2a812><h1 class="text-xl font-lora font-semibold text-[#5D4A44]" data-v-06e2a812>Panel de Coordinaci\xF3n</h1><p class="text-xs text-[#8B7470]" data-v-06e2a812>Hola, ${ssrInterpolate(unref(nombreUsuario))} \u{1F338}</p></div></div><nav class="hidden md:flex items-center space-x-1" data-v-06e2a812><!--[-->`);
      ssrRenderList(menuItems, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.path,
          to: item.path,
          class: [
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive(item.path) ? "bg-[#D8AFA0] text-white" : "text-[#5D4A44] hover:bg-[#E8DFD8]"
          ]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Icon, {
                name: item.icon,
                class: "w-4 h-4 inline-block mr-2"
              }, null, _parent2, _scopeId));
              _push2(` ${ssrInterpolate(item.label)}`);
            } else {
              return [
                createVNode(_component_Icon, {
                  name: item.icon,
                  class: "w-4 h-4 inline-block mr-2"
                }, null, 8, ["name"]),
                createTextVNode(" " + toDisplayString(item.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><div class="flex items-center space-x-3" data-v-06e2a812><button class="relative p-2 rounded-lg hover:bg-[#E8DFD8] transition-colors" data-v-06e2a812>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:bell",
        class: "w-5 h-5 text-[#5D4A44]"
      }, null, _parent));
      if (unref(notificacionesNoLeidas) > 0) {
        _push(`<span class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center" data-v-06e2a812>${ssrInterpolate(unref(notificacionesNoLeidas))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button><button class="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#E8DFD8] transition-colors" data-v-06e2a812><div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] flex items-center justify-center" data-v-06e2a812><span class="text-white text-sm font-semibold" data-v-06e2a812>${ssrInterpolate(unref(iniciales))}</span></div>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:chevron-down",
        class: "w-4 h-4 text-[#5D4A44]"
      }, null, _parent));
      _push(`</button></div></div></div><nav class="md:hidden border-t border-[#E8DFD8] bg-white px-4 py-3" data-v-06e2a812><div class="flex overflow-x-auto space-x-2 pb-2" data-v-06e2a812><!--[-->`);
      ssrRenderList(menuItems, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.path,
          to: item.path,
          class: [
            "flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
            isActive(item.path) ? "bg-[#D8AFA0] text-white" : "text-[#5D4A44] hover:bg-[#E8DFD8]"
          ]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Icon, {
                name: item.icon,
                class: "w-4 h-4 mr-2"
              }, null, _parent2, _scopeId));
              _push2(` ${ssrInterpolate(item.label)}`);
            } else {
              return [
                createVNode(_component_Icon, {
                  name: item.icon,
                  class: "w-4 h-4 mr-2"
                }, null, 8, ["name"]),
                createTextVNode(" " + toDisplayString(item.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></nav></header>`);
      if (unref(mostrarNotificaciones)) {
        _push(`<div class="fixed inset-0 z-40" data-v-06e2a812><div class="absolute top-20 right-4 w-80 bg-white rounded-xl shadow-2xl border border-[#E8DFD8] overflow-hidden" data-v-06e2a812><div class="p-4 bg-gradient-to-r from-[#D8AFA0] to-[#C49484]" data-v-06e2a812><h3 class="text-white font-semibold" data-v-06e2a812>Notificaciones</h3></div><div class="max-h-96 overflow-y-auto" data-v-06e2a812><!--[-->`);
        ssrRenderList(unref(notificaciones), (notif) => {
          _push(`<div class="${ssrRenderClass([{ "bg-blue-50": !notif.visto }, "p-4 border-b border-[#E8DFD8] hover:bg-[#F9F7F3] transition-colors cursor-pointer"])}" data-v-06e2a812><p class="text-sm font-medium text-[#5D4A44]" data-v-06e2a812>${ssrInterpolate(notif.titulo)}</p><p class="text-xs text-[#8B7470] mt-1" data-v-06e2a812>${ssrInterpolate(notif.mensaje)}</p><p class="text-xs text-[#A89B97] mt-2" data-v-06e2a812>${ssrInterpolate(formatearFecha(notif.created_at))}</p></div>`);
        });
        _push(`<!--]-->`);
        if (unref(notificaciones).length === 0) {
          _push(`<div class="p-8 text-center text-[#8B7470]" data-v-06e2a812>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "heroicons:bell-slash",
            class: "w-12 h-12 mx-auto mb-2 opacity-30"
          }, null, _parent));
          _push(`<p class="text-sm" data-v-06e2a812>No tienes notificaciones</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(mostrarMenuUsuario)) {
        _push(`<div class="fixed inset-0 z-40" data-v-06e2a812><div class="absolute top-20 right-4 w-64 bg-white rounded-xl shadow-2xl border border-[#E8DFD8] overflow-hidden" data-v-06e2a812><div class="p-4 border-b border-[#E8DFD8]" data-v-06e2a812><p class="font-semibold text-[#5D4A44]" data-v-06e2a812>${ssrInterpolate(unref(nombreUsuario))}</p><p class="text-sm text-[#8B7470]" data-v-06e2a812>${ssrInterpolate(unref(emailUsuario))}</p><span class="inline-block mt-2 px-3 py-1 bg-[#D8AFA0] text-white text-xs rounded-full" data-v-06e2a812> Coordinaci\xF3n </span></div><div class="p-2" data-v-06e2a812><button class="w-full text-left px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center" data-v-06e2a812>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:arrow-right-on-rectangle",
          class: "w-4 h-4 mr-2"
        }, null, _parent));
        _push(` Cerrar sesi\xF3n </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-v-06e2a812>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="mt-12 py-6 border-t border-[#E8DFD8] text-center text-sm text-[#8B7470]" data-v-06e2a812><p data-v-06e2a812>Panel de Coordinaci\xF3n Cl\xEDnica \xB7 Psic\xF3loga Karem</p><p class="mt-1" data-v-06e2a812>Gesti\xF3n de citas, pagos y comunicaci\xF3n con pacientes</p></footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/coordinacion.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const coordinacion = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-06e2a812"]]);

export { coordinacion as default };
//# sourceMappingURL=coordinacion-Dpf_F8rx.mjs.map
