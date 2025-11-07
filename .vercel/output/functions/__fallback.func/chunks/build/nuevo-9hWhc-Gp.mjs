import { ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { a as useRouter } from './server.mjs';
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
  __name: "nuevo",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    useRouter();
    const form = ref({
      nombre_completo: "",
      email: "",
      telefono: "",
      area_de_acompanamiento: "",
      frecuencia: "",
      notas_iniciales: "",
      activo: true
    });
    const guardando = ref(false);
    const errorMensaje = ref("");
    const formularioValido = computed(() => {
      return form.value.nombre_completo.trim() !== "" && form.value.email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-3xl mx-auto pb-20" }, _attrs))}><button class="mb-6 flex items-center gap-2 text-cafe hover:text-terracota transition-colors"><span>←</span><span>Volver a lista de pacientes</span></button><div class="mb-8"><h1 class="text-3xl font-serif font-bold text-cafe mb-2"> Nuevo Paciente </h1><p class="text-cafe/60"> Completa la información del nuevo paciente </p></div><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><form class="space-y-6"><div><label class="block text-sm font-medium text-cafe mb-2"> Nombre Completo <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", unref(form).nombre_completo)} type="text" required placeholder="Ej: María García López" class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota focus:border-transparent"></div><div><label class="block text-sm font-medium text-cafe mb-2"> Email <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", unref(form).email)} type="email" required placeholder="ejemplo@correo.com" class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota focus:border-transparent"></div><div><label class="block text-sm font-medium text-cafe mb-2"> Teléfono </label><input${ssrRenderAttr("value", unref(form).telefono)} type="tel" placeholder="+34 600 000 000" class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota focus:border-transparent"><p class="text-xs text-gray-500 mt-1"> Incluye el código de país para WhatsApp </p></div><div><label class="block text-sm font-medium text-cafe mb-2"> Área de Acompañamiento </label><select class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota focus:border-transparent"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).area_de_acompanamiento) ? ssrLooseContain(unref(form).area_de_acompanamiento, "") : ssrLooseEqual(unref(form).area_de_acompanamiento, "")) ? " selected" : ""}>Selecciona un área</option><option value="Ansiedad"${ssrIncludeBooleanAttr(Array.isArray(unref(form).area_de_acompanamiento) ? ssrLooseContain(unref(form).area_de_acompanamiento, "Ansiedad") : ssrLooseEqual(unref(form).area_de_acompanamiento, "Ansiedad")) ? " selected" : ""}>Ansiedad</option><option value="Depresión"${ssrIncludeBooleanAttr(Array.isArray(unref(form).area_de_acompanamiento) ? ssrLooseContain(unref(form).area_de_acompanamiento, "Depresión") : ssrLooseEqual(unref(form).area_de_acompanamiento, "Depresión")) ? " selected" : ""}>Depresión</option><option value="Duelo"${ssrIncludeBooleanAttr(Array.isArray(unref(form).area_de_acompanamiento) ? ssrLooseContain(unref(form).area_de_acompanamiento, "Duelo") : ssrLooseEqual(unref(form).area_de_acompanamiento, "Duelo")) ? " selected" : ""}>Duelo</option><option value="Autoestima"${ssrIncludeBooleanAttr(Array.isArray(unref(form).area_de_acompanamiento) ? ssrLooseContain(unref(form).area_de_acompanamiento, "Autoestima") : ssrLooseEqual(unref(form).area_de_acompanamiento, "Autoestima")) ? " selected" : ""}>Autoestima</option><option value="Relaciones"${ssrIncludeBooleanAttr(Array.isArray(unref(form).area_de_acompanamiento) ? ssrLooseContain(unref(form).area_de_acompanamiento, "Relaciones") : ssrLooseEqual(unref(form).area_de_acompanamiento, "Relaciones")) ? " selected" : ""}>Relaciones</option><option value="Familia"${ssrIncludeBooleanAttr(Array.isArray(unref(form).area_de_acompanamiento) ? ssrLooseContain(unref(form).area_de_acompanamiento, "Familia") : ssrLooseEqual(unref(form).area_de_acompanamiento, "Familia")) ? " selected" : ""}>Familia</option><option value="Trauma"${ssrIncludeBooleanAttr(Array.isArray(unref(form).area_de_acompanamiento) ? ssrLooseContain(unref(form).area_de_acompanamiento, "Trauma") : ssrLooseEqual(unref(form).area_de_acompanamiento, "Trauma")) ? " selected" : ""}>Trauma</option><option value="Estrés"${ssrIncludeBooleanAttr(Array.isArray(unref(form).area_de_acompanamiento) ? ssrLooseContain(unref(form).area_de_acompanamiento, "Estrés") : ssrLooseEqual(unref(form).area_de_acompanamiento, "Estrés")) ? " selected" : ""}>Estrés</option><option value="Desarrollo Personal"${ssrIncludeBooleanAttr(Array.isArray(unref(form).area_de_acompanamiento) ? ssrLooseContain(unref(form).area_de_acompanamiento, "Desarrollo Personal") : ssrLooseEqual(unref(form).area_de_acompanamiento, "Desarrollo Personal")) ? " selected" : ""}>Desarrollo Personal</option><option value="Otro"${ssrIncludeBooleanAttr(Array.isArray(unref(form).area_de_acompanamiento) ? ssrLooseContain(unref(form).area_de_acompanamiento, "Otro") : ssrLooseEqual(unref(form).area_de_acompanamiento, "Otro")) ? " selected" : ""}>Otro</option></select></div><div><label class="block text-sm font-medium text-cafe mb-2"> Frecuencia de Sesiones </label><select class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota focus:border-transparent"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).frecuencia) ? ssrLooseContain(unref(form).frecuencia, "") : ssrLooseEqual(unref(form).frecuencia, "")) ? " selected" : ""}>Selecciona una frecuencia</option><option value="semanal"${ssrIncludeBooleanAttr(Array.isArray(unref(form).frecuencia) ? ssrLooseContain(unref(form).frecuencia, "semanal") : ssrLooseEqual(unref(form).frecuencia, "semanal")) ? " selected" : ""}>Semanal</option><option value="quincenal"${ssrIncludeBooleanAttr(Array.isArray(unref(form).frecuencia) ? ssrLooseContain(unref(form).frecuencia, "quincenal") : ssrLooseEqual(unref(form).frecuencia, "quincenal")) ? " selected" : ""}>Quincenal</option><option value="mensual"${ssrIncludeBooleanAttr(Array.isArray(unref(form).frecuencia) ? ssrLooseContain(unref(form).frecuencia, "mensual") : ssrLooseEqual(unref(form).frecuencia, "mensual")) ? " selected" : ""}>Mensual</option><option value="ocasional"${ssrIncludeBooleanAttr(Array.isArray(unref(form).frecuencia) ? ssrLooseContain(unref(form).frecuencia, "ocasional") : ssrLooseEqual(unref(form).frecuencia, "ocasional")) ? " selected" : ""}>Ocasional</option></select></div><div><label class="block text-sm font-medium text-cafe mb-2"> Notas Iniciales </label><textarea rows="4" placeholder="Información relevante sobre el paciente..." class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota focus:border-transparent resize-none">${ssrInterpolate(unref(form).notas_iniciales)}</textarea></div><div class="flex items-center gap-3"><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).activo) ? ssrLooseContain(unref(form).activo, null) : unref(form).activo) ? " checked" : ""} type="checkbox" id="activo" class="w-5 h-5 text-terracota border-gray-300 rounded focus:ring-2 focus:ring-terracota"><label for="activo" class="text-sm font-medium text-cafe cursor-pointer"> Paciente activo </label></div>`);
      if (unref(errorMensaje)) {
        _push(`<div class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"><span class="text-red-500 text-lg">⚠️</span><div class="flex-1"><p class="text-sm font-medium text-red-800">Error al guardar</p><p class="text-sm text-red-600 mt-1">${ssrInterpolate(unref(errorMensaje))}</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex gap-3 pt-4"><button type="button"${ssrIncludeBooleanAttr(unref(guardando)) ? " disabled" : ""} class="flex-1 px-6 py-3 border border-gray-300 text-cafe rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"> Cancelar </button><button type="submit"${ssrIncludeBooleanAttr(unref(guardando) || !unref(formularioValido)) ? " disabled" : ""} class="flex-1 px-6 py-3 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">`);
      if (unref(guardando)) {
        _push(`<span class="animate-spin">⏳</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span>${ssrInterpolate(unref(guardando) ? "Guardando..." : "Guardar Paciente")}</span></button></div></form></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinadora/pacientes/nuevo.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=nuevo-9hWhc-Gp.mjs.map
