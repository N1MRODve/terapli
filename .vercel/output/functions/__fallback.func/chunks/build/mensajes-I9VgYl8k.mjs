import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "mensajes",
  __ssrInlineRender: true,
  setup(__props) {
    const loading = ref(true);
    const mensajes2 = ref([]);
    const nuevoMensaje = ref("");
    const enviando = ref(false);
    const estaEscribiendo = ref(false);
    ref(null);
    ref(null);
    const userId = ref("");
    const esMensajeMio = (mensaje) => {
      return mensaje.autor_id === userId.value;
    };
    const formatearHora = (fecha) => {
      if (!fecha) return "";
      const date = new Date(fecha);
      const hoy = /* @__PURE__ */ new Date();
      const ayer = new Date(hoy);
      ayer.setDate(ayer.getDate() - 1);
      if (date.toDateString() === hoy.toDateString()) {
        return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      }
      if (date.toDateString() === ayer.toDateString()) {
        return "Ayer " + date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      }
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto px-4 py-8" }, _attrs))} data-v-4f363c8b><header class="mb-6 flex-shrink-0" data-v-4f363c8b><h1 class="text-2xl sm:text-3xl font-[&#39;Lora&#39;] font-medium text-[#5D4A44]" data-v-4f363c8b> Mensajes </h1><p class="text-sm text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;] mt-1" data-v-4f363c8b> Conversación con tu coordinadora </p></header>`);
      if (unref(loading)) {
        _push(`<div class="flex-1 flex flex-col items-center justify-center" data-v-4f363c8b><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D8AFA0]" data-v-4f363c8b></div><p class="mt-4 text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;]" data-v-4f363c8b>Cargando mensajes...</p></div>`);
      } else {
        _push(`<div class="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-[#EAD5D3]/30 overflow-hidden" data-v-4f363c8b><div class="flex-1 overflow-y-auto p-6 space-y-4" data-v-4f363c8b>`);
        if (unref(mensajes2).length === 0) {
          _push(`<div class="flex flex-col items-center justify-center h-full text-center py-12" data-v-4f363c8b><div class="w-20 h-20 rounded-full bg-[#EAD5D3]/30 flex items-center justify-center mb-4" data-v-4f363c8b><svg class="w-10 h-10 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-4f363c8b><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" data-v-4f363c8b></path></svg></div><h3 class="text-xl font-[&#39;Lora&#39;] font-medium text-[#5D4A44] mb-2" data-v-4f363c8b>No hay mensajes</h3><p class="text-sm text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;] max-w-md" data-v-4f363c8b> Inicia la conversación enviando un mensaje a tu coordinadora. </p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(mensajes2), (mensaje) => {
          _push(`<div class="${ssrRenderClass([
            "flex",
            esMensajeMio(mensaje) ? "justify-end" : "justify-start"
          ])}" data-v-4f363c8b><div class="${ssrRenderClass([
            "max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
            esMensajeMio(mensaje) ? "bg-[#D8AFA0] text-white rounded-br-sm" : "bg-[#F9F7F3] text-[#5D4A44] rounded-bl-sm"
          ])}" data-v-4f363c8b>`);
          if (!esMensajeMio(mensaje)) {
            _push(`<p class="text-xs font-[&#39;Lato&#39;] font-medium mb-1 opacity-70" data-v-4f363c8b>${ssrInterpolate(mensaje.autor?.nombre_completo || "Coordinadora")}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<p class="text-sm font-[&#39;Lato&#39;] whitespace-pre-wrap break-words" data-v-4f363c8b>${ssrInterpolate(mensaje.contenido)}</p><div class="${ssrRenderClass([
            "flex items-center gap-1 mt-1 text-xs",
            "font-['Lato']",
            esMensajeMio(mensaje) ? "text-white/70" : "text-[#5D4A44]/50"
          ])}" data-v-4f363c8b><span data-v-4f363c8b>${ssrInterpolate(formatearHora(mensaje.created_at))}</span>`);
          if (esMensajeMio(mensaje)) {
            _push(`<span data-v-4f363c8b>`);
            if (mensaje.leido) {
              _push(`<svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-4f363c8b><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-v-4f363c8b></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13l4 4L23 7" data-v-4f363c8b></path></svg>`);
            } else {
              _push(`<svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-4f363c8b><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-v-4f363c8b></path></svg>`);
            }
            _push(`</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div>`);
        });
        _push(`<!--]-->`);
        if (unref(estaEscribiendo)) {
          _push(`<div class="flex justify-start" data-v-4f363c8b><div class="bg-[#F9F7F3] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm" data-v-4f363c8b><div class="flex gap-1" data-v-4f363c8b><span class="w-2 h-2 bg-[#D8AFA0] rounded-full animate-bounce" style="${ssrRenderStyle({ "animation-delay": "0ms" })}" data-v-4f363c8b></span><span class="w-2 h-2 bg-[#D8AFA0] rounded-full animate-bounce" style="${ssrRenderStyle({ "animation-delay": "150ms" })}" data-v-4f363c8b></span><span class="w-2 h-2 bg-[#D8AFA0] rounded-full animate-bounce" style="${ssrRenderStyle({ "animation-delay": "300ms" })}" data-v-4f363c8b></span></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex-shrink-0 border-t border-[#EAD5D3]/30 p-4 bg-[#F9F7F3]/30" data-v-4f363c8b><form class="flex gap-2" data-v-4f363c8b><textarea placeholder="Escribe tu mensaje..." rows="1" class="flex-1 px-4 py-3 border border-[#EAD5D3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent resize-none font-[&#39;Lato&#39;] text-[#5D4A44] placeholder:text-[#5D4A44]/40 bg-white" data-v-4f363c8b>${ssrInterpolate(unref(nuevoMensaje))}</textarea><button type="submit"${ssrIncludeBooleanAttr(!unref(nuevoMensaje).trim() || unref(enviando)) ? " disabled" : ""} class="flex-shrink-0 w-12 h-12 bg-[#D8AFA0] hover:bg-[#C89B8A] disabled:bg-[#EAD5D3] disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center" data-v-4f363c8b>`);
        if (!unref(enviando)) {
          _push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-4f363c8b><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" data-v-4f363c8b></path></svg>`);
        } else {
          _push(`<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white" data-v-4f363c8b></div>`);
        }
        _push(`</button></form></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/paciente/mensajes.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const mensajes = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4f363c8b"]]);

export { mensajes as default };
//# sourceMappingURL=mensajes-I9VgYl8k.mjs.map
