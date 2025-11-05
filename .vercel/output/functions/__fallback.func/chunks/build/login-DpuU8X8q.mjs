import { defineComponent, ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrInterpolate } from 'vue/server-renderer';
import { u as useHead, a as useRouter, g as useSupabaseClient, h as useSupabaseUser, e as useSupabase } from './server.mjs';
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
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Login Terapeutas | Karem Pe\xF1a",
      meta: [
        { name: "description", content: "Acceso exclusivo para terapeutas de la plataforma de gesti\xF3n cl\xEDnica" },
        { name: "robots", content: "noindex, nofollow" }
      ]
    });
    useRouter();
    useSupabaseClient();
    useSupabaseUser();
    useSupabase();
    const email = ref("");
    const password = ref("");
    const error = ref(null);
    const loading = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex flex-col items-center justify-center bg-[#F9F7F3] px-6" }, _attrs))} data-v-bf719394><div class="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-[#EAD5D3]/40" data-v-bf719394><div class="text-center mb-8" data-v-bf719394><h1 class="text-3xl font-[&#39;Lora&#39;] text-[#5D4A44] mb-2" data-v-bf719394>\xC1rea de Terapeutas</h1><p class="text-sm text-[#5D4A44]/70 font-[&#39;Lato&#39;]" data-v-bf719394>Acceso exclusivo para profesionales</p></div><form class="space-y-5" data-v-bf719394><div data-v-bf719394><label for="email" class="block text-sm font-medium text-[#5D4A44] font-[&#39;Lato&#39;] mb-1" data-v-bf719394> Correo electr\xF3nico </label><input id="email"${ssrRenderAttr("value", email.value)} type="email" placeholder="tu@email.com" class="w-full px-4 py-3 border border-[#EAD5D3] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent transition-all outline-none font-[&#39;Lato&#39;]" required${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} data-v-bf719394></div><div data-v-bf719394><label for="password" class="block text-sm font-medium text-[#5D4A44] font-[&#39;Lato&#39;] mb-1" data-v-bf719394> Contrase\xF1a </label><input id="password"${ssrRenderAttr("value", password.value)} type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" class="w-full px-4 py-3 border border-[#EAD5D3] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent transition-all outline-none font-[&#39;Lato&#39;]" required${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} data-v-bf719394></div>`);
      if (error.value) {
        _push(`<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-[&#39;Lato&#39;] flex items-start gap-2" data-v-bf719394><svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" data-v-bf719394><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" data-v-bf719394></path></svg><span data-v-bf719394>${ssrInterpolate(error.value)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit" class="w-full py-3 bg-[#D8AFA0] hover:bg-[#C89B8A] text-white font-[&#39;Lato&#39;] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} data-v-bf719394>`);
      if (loading.value) {
        _push(`<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-bf719394><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-bf719394></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-bf719394></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span data-v-bf719394>${ssrInterpolate(loading.value ? "Iniciando sesi\xF3n..." : "Iniciar sesi\xF3n")}</span></button></form><div class="mt-6 text-center" data-v-bf719394><p class="text-xs text-[#5D4A44]/60 font-[&#39;Lato&#39;]" data-v-bf719394> \xBFProblemas para acceder? Contacta a soporte </p></div></div><div class="mt-8 text-center" data-v-bf719394><p class="text-sm text-[#5D4A44]/50 font-[&#39;Lato&#39;]" data-v-bf719394> \xA9 ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} Karem Pe\xF1a | Gesti\xF3n Cl\xEDnica </p></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/terapeuta/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-bf719394"]]);

export { login as default };
//# sourceMappingURL=login-DpuU8X8q.mjs.map
