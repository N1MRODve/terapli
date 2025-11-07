import { defineComponent, ref, resolveComponent, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderDynamicModel, ssrInterpolate } from 'vue/server-renderer';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { a as useRouter } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    useRouter();
    useSupabase();
    const email = ref("");
    const password = ref("");
    const mostrarPassword = ref(false);
    const cargando = ref(false);
    const error = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = resolveComponent("Icon");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-[#F9F7F3] to-[#E8DFD8] flex items-center justify-center p-4" }, _attrs))} data-v-1de7f2fa><div class="max-w-md w-full" data-v-1de7f2fa><div class="text-center mb-8" data-v-1de7f2fa><div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] mb-4 shadow-lg" data-v-1de7f2fa>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:calendar-days",
        class: "w-10 h-10 text-white"
      }, null, _parent));
      _push(`</div><h1 class="text-3xl font-lora font-bold text-[#5D4A44] mb-2" data-v-1de7f2fa> Panel de Coordinación </h1><p class="text-[#8B7470]" data-v-1de7f2fa> Gestión de citas y comunicación con pacientes </p></div><div class="bg-white rounded-2xl shadow-xl p-8 border border-[#E8DFD8]" data-v-1de7f2fa><form class="space-y-6" data-v-1de7f2fa><div data-v-1de7f2fa><label for="email" class="block text-sm font-medium text-[#5D4A44] mb-2" data-v-1de7f2fa> Correo electrónico </label><div class="relative" data-v-1de7f2fa><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-v-1de7f2fa>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:envelope",
        class: "w-5 h-5 text-[#8B7470]"
      }, null, _parent));
      _push(`</div><input id="email"${ssrRenderAttr("value", unref(email))} type="email" required placeholder="tu-email@ejemplo.com" class="w-full pl-10 pr-4 py-3 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent transition-all"${ssrIncludeBooleanAttr(unref(cargando)) ? " disabled" : ""} data-v-1de7f2fa></div></div><div data-v-1de7f2fa><label for="password" class="block text-sm font-medium text-[#5D4A44] mb-2" data-v-1de7f2fa> Contraseña </label><div class="relative" data-v-1de7f2fa><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-v-1de7f2fa>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:lock-closed",
        class: "w-5 h-5 text-[#8B7470]"
      }, null, _parent));
      _push(`</div><input id="password"${ssrRenderDynamicModel(unref(mostrarPassword) ? "text" : "password", unref(password), null)}${ssrRenderAttr("type", unref(mostrarPassword) ? "text" : "password")} required placeholder="••••••••" class="w-full pl-10 pr-12 py-3 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent transition-all"${ssrIncludeBooleanAttr(unref(cargando)) ? " disabled" : ""} data-v-1de7f2fa><button type="button" class="absolute inset-y-0 right-0 pr-3 flex items-center"${ssrIncludeBooleanAttr(unref(cargando)) ? " disabled" : ""} data-v-1de7f2fa>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: unref(mostrarPassword) ? "heroicons:eye-slash" : "heroicons:eye",
        class: "w-5 h-5 text-[#8B7470] hover:text-[#5D4A44] transition-colors"
      }, null, _parent));
      _push(`</button></div></div>`);
      if (unref(error)) {
        _push(`<div class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3" data-v-1de7f2fa>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:exclamation-circle",
          class: "w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
        }, null, _parent));
        _push(`<p class="text-sm text-red-700" data-v-1de7f2fa>${ssrInterpolate(unref(error))}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(cargando) || !unref(email) || !unref(password)) ? " disabled" : ""} class="w-full py-3 px-4 bg-gradient-to-r from-[#D8AFA0] to-[#C49484] text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2" data-v-1de7f2fa>`);
      if (unref(cargando)) {
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:arrow-path",
          class: "w-5 h-5 animate-spin"
        }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:arrow-right-on-rectangle",
          class: "w-5 h-5"
        }, null, _parent));
      }
      _push(`<span data-v-1de7f2fa>${ssrInterpolate(unref(cargando) ? "Verificando..." : "Iniciar sesión")}</span></button></form><div class="mt-6 pt-6 border-t border-[#E8DFD8]" data-v-1de7f2fa><p class="text-xs text-center text-[#8B7470]" data-v-1de7f2fa> Este panel es exclusivo para personal de coordinación. </p><p class="text-xs text-center text-[#8B7470] mt-2" data-v-1de7f2fa> Si necesitas ayuda, contacta a tu administrador. </p></div></div><div class="mt-8 text-center text-sm text-[#8B7470]" data-v-1de7f2fa><p data-v-1de7f2fa>Psicóloga Karem · Sistema de gestión clínica</p></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinacion/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1de7f2fa"]]);

export { login as default };
//# sourceMappingURL=login-CLyQphrm.mjs.map
