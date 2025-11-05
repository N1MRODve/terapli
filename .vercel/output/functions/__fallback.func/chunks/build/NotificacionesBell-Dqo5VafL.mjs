import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useNotificaciones } from './useNotificaciones-BrQVNIqm.mjs';
import { a as useRouter } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "NotificacionesBell",
  __ssrInlineRender: true,
  setup(__props) {
    const { notificaciones, totalNoVistas, loading } = useNotificaciones();
    useRouter();
    const mostrarDropdown = ref(false);
    const formatearFecha = (fecha) => {
      const date = new Date(fecha);
      const ahora = /* @__PURE__ */ new Date();
      const diferencia = ahora.getTime() - date.getTime();
      const minutos = Math.floor(diferencia / 6e4);
      const horas = Math.floor(diferencia / 36e5);
      const dias = Math.floor(diferencia / 864e5);
      if (minutos < 1) return "Ahora";
      if (minutos < 60) return `Hace ${minutos}m`;
      if (horas < 24) return `Hace ${horas}h`;
      if (dias < 7) return `Hace ${dias}d`;
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short"
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative" }, _attrs))} data-v-a17051d2><button class="${ssrRenderClass([{ "bg-[#EAD5D3]/20": unref(mostrarDropdown) }, "relative p-2 rounded-full hover:bg-[#EAD5D3]/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]/50"])}" aria-label="Notificaciones" data-v-a17051d2><svg class="w-6 h-6 text-[#5D4A44]" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-a17051d2><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" data-v-a17051d2></path></svg>`);
      if (unref(totalNoVistas) > 0) {
        _push(`<span class="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#D8AFA0] rounded-full border-2 border-[#F9F7F3]" data-v-a17051d2>${ssrInterpolate(unref(totalNoVistas) > 9 ? "9+" : unref(totalNoVistas))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button>`);
      if (unref(mostrarDropdown)) {
        _push(`<div class="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-lg shadow-xl border border-[#EAD5D3]/40 z-50 overflow-hidden" data-v-a17051d2><div class="px-4 py-3 border-b border-[#EAD5D3]/30 flex items-center justify-between bg-[#F9F7F3]" data-v-a17051d2><h3 class="text-sm font-semibold text-[#5D4A44] font-lora" data-v-a17051d2> Notificaciones </h3>`);
        if (unref(notificaciones).length > 0) {
          _push(`<button class="text-xs text-[#D8AFA0] hover:text-[#C89B8A] font-lato transition-colors" data-v-a17051d2> Marcar todas como le\xEDdas </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="max-h-[400px] overflow-y-auto" data-v-a17051d2>`);
        if (unref(loading)) {
          _push(`<div class="p-8 text-center" data-v-a17051d2><div class="inline-block w-8 h-8 border-4 border-[#EAD5D3] border-t-[#D8AFA0] rounded-full animate-spin" data-v-a17051d2></div></div>`);
        } else if (unref(notificaciones).length === 0) {
          _push(`<div class="p-8 text-center text-[#5D4A44]/60 font-lato text-sm" data-v-a17051d2><svg class="w-12 h-12 mx-auto mb-3 text-[#EAD5D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-a17051d2><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" data-v-a17051d2></path></svg><p data-v-a17051d2>No tienes notificaciones</p></div>`);
        } else {
          _push(`<div data-v-a17051d2><!--[-->`);
          ssrRenderList(unref(notificaciones), (notif) => {
            _push(`<button class="${ssrRenderClass([{ "bg-[#EAD5D3]/10": !notif.visto }, "w-full px-4 py-3 hover:bg-[#F9F7F3] transition-colors border-b border-[#EAD5D3]/20 text-left group"])}" data-v-a17051d2><div class="flex items-start gap-3" data-v-a17051d2><div class="${ssrRenderClass([
              notif.tipo === "mensaje" ? "bg-[#D8AFA0]/20 text-[#D8AFA0]" : "bg-[#8A9A5B]/20 text-[#8A9A5B]",
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            ])}" data-v-a17051d2>`);
            if (notif.tipo === "mensaje") {
              _push(`<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" data-v-a17051d2><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" data-v-a17051d2></path></svg>`);
            } else {
              _push(`<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" data-v-a17051d2><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" data-v-a17051d2></path></svg>`);
            }
            _push(`</div><div class="flex-1 min-w-0" data-v-a17051d2><p class="${ssrRenderClass([{ "font-semibold": !notif.visto }, "text-sm font-medium text-[#5D4A44] font-lato"])}" data-v-a17051d2>${ssrInterpolate(notif.titulo)}</p>`);
            if (notif.mensaje) {
              _push(`<p class="text-xs text-[#5D4A44]/70 font-lato mt-1 line-clamp-2" data-v-a17051d2>${ssrInterpolate(notif.mensaje)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<p class="text-xs text-[#5D4A44]/50 font-lato mt-1" data-v-a17051d2>${ssrInterpolate(formatearFecha(notif.created_at))}</p></div>`);
            if (!notif.visto) {
              _push(`<div class="flex-shrink-0 w-2 h-2 bg-[#D8AFA0] rounded-full mt-2" data-v-a17051d2></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></button>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div>`);
        if (unref(notificaciones).length > 0) {
          _push(`<div class="px-4 py-2 border-t border-[#EAD5D3]/30 bg-[#F9F7F3] text-center" data-v-a17051d2><button class="text-xs text-[#D8AFA0] hover:text-[#C89B8A] font-lato font-medium transition-colors" data-v-a17051d2> Ver todas las notificaciones </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(mostrarDropdown)) {
        _push(`<div class="fixed inset-0 z-40" data-v-a17051d2></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/NotificacionesBell.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-a17051d2"]]), { __name: "NotificacionesBell" });

export { __nuxt_component_1 as _ };
//# sourceMappingURL=NotificacionesBell-Dqo5VafL.mjs.map
