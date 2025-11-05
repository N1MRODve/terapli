import { _ as __nuxt_component_0 } from './nuxt-link-CboeUkiO.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent } from 'vue/server-renderer';
import { e as useSupabase } from './server.mjs';
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
    useSupabase();
    const email = ref("");
    const password = ref("");
    const resetEmail = ref("");
    const isLoading = ref(false);
    const isResetting = ref(false);
    const errorMessage = ref("");
    const successMessage = ref("");
    const showResetPassword = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center bg-[#F9F7F3]" }, _attrs))}><div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8"><div class="text-center mb-8"><h1 class="text-3xl font-[&#39;Lora&#39;] font-medium text-[#5D4A44]">Bienvenida</h1><p class="font-[&#39;Lato&#39;] text-[#5D4A44] opacity-70 mt-2"> Inicia sesi\xF3n para acceder a tu espacio </p><p class="font-[&#39;Lato&#39;] text-sm text-[#D8AFA0] mt-3"> Sistema de gesti\xF3n para psic\xF3logas y espacio de bienestar para pacientes </p></div><form class="space-y-6"><div><label for="email" class="block font-[&#39;Lato&#39;] text-sm font-medium text-[#5D4A44] mb-2"> Correo electr\xF3nico </label><input id="email"${ssrRenderAttr("value", unref(email))} type="email" required class="w-full px-4 py-3 border border-[#EAD5D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] transition-all font-[&#39;Lato&#39;]" placeholder="tu@email.com"></div><div><label for="password" class="block font-[&#39;Lato&#39;] text-sm font-medium text-[#5D4A44] mb-2"> Contrase\xF1a </label><input id="password"${ssrRenderAttr("value", unref(password))} type="password" required class="w-full px-4 py-3 border border-[#EAD5D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] transition-all font-[&#39;Lato&#39;]" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"></div>`);
      if (unref(errorMessage)) {
        _push(`<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-[&#39;Lato&#39;]">${ssrInterpolate(unref(errorMessage))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(successMessage)) {
        _push(`<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-[&#39;Lato&#39;]">${ssrInterpolate(unref(successMessage))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(isLoading)) ? " disabled" : ""} class="w-full bg-[#D8AFA0] hover:bg-[#c99d8d] text-white py-3 rounded-lg transition-all duration-300 font-[&#39;Lato&#39;] font-medium disabled:opacity-50 disabled:cursor-not-allowed">${ssrInterpolate(unref(isLoading) ? "Iniciando sesi\xF3n..." : "Iniciar Sesi\xF3n")}</button></form><div class="mt-6 text-center space-y-2"><button class="text-sm font-[&#39;Lato&#39;] text-[#5D4A44] hover:text-[#D8AFA0] underline"> \xBFOlvidaste tu contrase\xF1a? </button><p class="text-sm font-[&#39;Lato&#39;] text-[#5D4A44] opacity-70"> \xBFNecesitas acceso? `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/contacto",
        class: "text-[#D8AFA0] hover:text-[#c99d8d] font-medium"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Cont\xE1ctame `);
          } else {
            return [
              createTextVNode(" Cont\xE1ctame ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div>`);
      if (unref(showResetPassword)) {
        _push(`<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"><div class="bg-white rounded-lg p-6 max-w-md w-full"><h3 class="text-xl font-[&#39;Lora&#39;] font-medium text-[#5D4A44] mb-4">Recuperar Contrase\xF1a</h3><p class="font-[&#39;Lato&#39;] text-[#5D4A44] opacity-70 mb-4"> Ingresa tu correo electr\xF3nico y te enviaremos un enlace para restablecer tu contrase\xF1a. </p><form class="space-y-4"><input${ssrRenderAttr("value", unref(resetEmail))} type="email" required class="w-full px-4 py-3 border border-[#EAD5D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] font-[&#39;Lato&#39;]" placeholder="tu@email.com"><div class="flex gap-3"><button type="button" class="flex-1 px-4 py-2 border border-[#EAD5D3] text-[#5D4A44] rounded-lg hover:bg-[#F9F7F3] transition-colors font-[&#39;Lato&#39;]"> Cancelar </button><button type="submit"${ssrIncludeBooleanAttr(unref(isResetting)) ? " disabled" : ""} class="flex-1 px-4 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#c99d8d] transition-colors disabled:opacity-50 font-[&#39;Lato&#39;]">${ssrInterpolate(unref(isResetting) ? "Enviando..." : "Enviar")}</button></div></form></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-tzk8Uxx6.mjs.map
