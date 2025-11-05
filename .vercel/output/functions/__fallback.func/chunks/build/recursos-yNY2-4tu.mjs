import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "recursos",
  __ssrInlineRender: true,
  setup(__props) {
    const loading = ref(true);
    const recursos = ref([]);
    [
      {
        id: "demo-compartido-1",
        titulo: "Gu\xEDa de Respiraci\xF3n Consciente",
        descripcion: "Ejercicios de respiraci\xF3n para manejo de ansiedad y momentos de estr\xE9s",
        tipo: "Gu\xEDa",
        icono: "\u{1F4CB}",
        url: "https://www.youtube.com/watch?v=YRPh_GaiL8s",
        categoria: "Ansiedad",
        tags: ["respiraci\xF3n", "ansiedad", "mindfulness"],
        nota_personal: "\xA1Hola! Te comparto este recurso para que practiques cuando sientas ansiedad. Los ejercicios de respiraci\xF3n son muy efectivos. Prueba hacer el ejercicio 3 veces al d\xEDa.",
        visto: false,
        compartido_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString()
      },
      {
        id: "demo-compartido-2",
        titulo: "Meditaci\xF3n Guiada 10min",
        descripcion: "Audio de meditaci\xF3n para principiantes y pr\xE1ctica diaria",
        tipo: "Audio",
        icono: "\u{1F3B5}",
        url: "https://www.youtube.com/watch?v=O-6f5wQXSu8",
        categoria: "Mindfulness",
        tags: ["meditaci\xF3n", "mindfulness", "relajaci\xF3n"],
        nota_personal: "Esta meditaci\xF3n es perfecta para comenzar tu d\xEDa con calma. Te sugiero hacerla por las ma\xF1anas.",
        visto: true,
        compartido_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString()
      }
    ];
    const formatearFecha = (fecha) => {
      if (!fecha) return "";
      return new Date(fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    };
    const getTipoClass = (tipo) => {
      const clases = {
        pdf: "bg-red-50 text-red-700",
        audio: "bg-purple-50 text-purple-700",
        video: "bg-blue-50 text-blue-700",
        link: "bg-green-50 text-green-700"
      };
      return clases[tipo] || "bg-gray-50 text-gray-700";
    };
    const getTipoTexto = (tipo) => {
      const textos = {
        pdf: "PDF",
        audio: "Audio",
        video: "Video",
        link: "Enlace"
      };
      return textos[tipo] || tipo;
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-4xl mx-auto space-y-6 px-4 py-8" }, _attrs))}>`);
      if (unref(loading)) {
        _push(`<div class="flex flex-col items-center justify-center min-h-[40vh]"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D8AFA0]"></div><p class="mt-4 text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;]">Cargando recursos...</p></div>`);
      } else {
        _push(`<div>`);
        if (unref(recursos).length > 0 && ((_b = (_a = unref(recursos)[0]) == null ? void 0 : _a.id) == null ? void 0 : _b.startsWith("demo"))) {
          _push(`<div class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl"><div class="flex items-start gap-3"><span class="text-3xl">\u{1F3AD}</span><div class="flex-1"><h3 class="font-[&#39;Lora&#39;] text-lg font-semibold text-purple-900 mb-1"> Vista de Demostraci\xF3n </h3><p class="text-sm text-purple-700 leading-relaxed"> Est\xE1s viendo <strong>recursos de ejemplo</strong> para probar la funcionalidad. Cuando tu terapeuta comparta recursos reales contigo, aparecer\xE1n aqu\xED con sus notas personales. </p></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<header class="mb-8"><h1 class="text-2xl sm:text-3xl font-[&#39;Lora&#39;] font-medium text-[#5D4A44]"> Mis Recursos </h1><p class="text-sm text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;] mt-1"> Material compartido por tu psic\xF3loga para apoyar tu proceso </p></header>`);
        if (unref(recursos).length > 0) {
          _push(`<div class="space-y-4"><!--[-->`);
          ssrRenderList(unref(recursos), (recurso) => {
            var _a2, _b2;
            _push(`<article class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/30 p-6 hover:shadow-md transition-shadow"><div class="flex items-start gap-4"><div class="flex-shrink-0 w-12 h-12 rounded-lg bg-[#D8AFA0]/10 flex items-center justify-center">`);
            if (recurso.tipo === "pdf") {
              _push(`<svg class="w-6 h-6 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>`);
            } else if (recurso.tipo === "audio") {
              _push(`<svg class="w-6 h-6 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>`);
            } else if (recurso.tipo === "video") {
              _push(`<svg class="w-6 h-6 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`);
            } else {
              _push(`<svg class="w-6 h-6 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>`);
            }
            _push(`</div><div class="flex-1 min-w-0"><div class="flex items-start justify-between gap-4 mb-2"><h3 class="text-lg font-[&#39;Lora&#39;] font-medium text-[#5D4A44]">${ssrInterpolate(recurso.titulo)}</h3><span class="${ssrRenderClass([getTipoClass(recurso.tipo), "flex-shrink-0 px-2 py-1 rounded-full text-xs font-['Lato'] font-medium"])}">${ssrInterpolate(getTipoTexto(recurso.tipo))}</span></div>`);
            if (recurso.descripcion) {
              _push(`<p class="text-sm text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;] mb-3">${ssrInterpolate(recurso.descripcion)}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (recurso.nota_personal) {
              _push(`<div class="bg-[#D8AFA0]/10 border-l-4 border-[#D8AFA0] p-3 mb-3 rounded-r"><p class="text-xs font-semibold text-[#5D4A44] mb-1">\u{1F4AC} Nota de tu terapeuta:</p><p class="text-sm text-[#5D4A44] italic">${ssrInterpolate(recurso.nota_personal)}</p></div>`);
            } else {
              _push(`<!---->`);
            }
            if (recurso.categoria || ((_a2 = recurso.tags) == null ? void 0 : _a2.length)) {
              _push(`<div class="mb-3 flex flex-wrap gap-2">`);
              if (recurso.categoria) {
                _push(`<span class="px-2 py-1 bg-[#EAD5D3]/30 text-[#5D4A44] rounded text-xs">${ssrInterpolate(recurso.categoria)}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--[-->`);
              ssrRenderList((_b2 = recurso.tags) == null ? void 0 : _b2.slice(0, 3), (tag) => {
                _push(`<span class="px-2 py-1 bg-[#F9F7F3] text-[#5D4A44]/70 rounded text-xs"> #${ssrInterpolate(tag)}</span>`);
              });
              _push(`<!--]--></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="flex items-center gap-4 text-xs text-[#5D4A44] opacity-60 font-[&#39;Lato&#39;] mb-4"><span class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Compartido ${ssrInterpolate(formatearFecha(recurso.compartido_at || recurso.created_at || ""))}</span>`);
            if (!recurso.visto) {
              _push(`<span class="px-2 py-0.5 bg-[#D8AFA0] text-white rounded-full text-xs font-medium"> Nuevo </span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="flex gap-2"><a${ssrRenderAttr("href", recurso.url || recurso.storage_path)} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-[#D8AFA0] hover:bg-[#C89B8A] text-white rounded-lg text-sm font-[&#39;Lato&#39;] font-medium transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg> Ver recurso </a></div></div></div></article>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="flex flex-col items-center justify-center text-center py-16"><div class="w-20 h-20 rounded-full bg-[#EAD5D3]/30 flex items-center justify-center mb-4"><svg class="w-10 h-10 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div><h3 class="text-xl font-[&#39;Lora&#39;] font-medium text-[#5D4A44] mb-2">No hay recursos disponibles</h3><p class="text-sm text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;] max-w-md"> Tu psic\xF3loga compartir\xE1 material de apoyo contigo durante el proceso terap\xE9utico. </p></div>`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/paciente/recursos.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=recursos-yNY2-4tu.mjs.map
