import { _ as _sfc_main$3 } from './LoadingSpinner-5WmFPZGW.mjs';
import { defineComponent, ref, computed, unref, withCtx, createBlock, openBlock, createVNode, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "SesionCard",
  __ssrInlineRender: true,
  props: {
    sesion: {},
    pasada: { type: Boolean }
  },
  emits: ["abrir"],
  setup(__props) {
    const notaExpandida = ref(false);
    const formatearFechaLarga = (fecha) => {
      return new Date(fecha).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long"
      });
    };
    const formatearHora = (fecha) => {
      return new Date(fecha).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const estadoClassExtendido = (estado) => {
      const classes = {
        pendiente: "bg-yellow-100 text-yellow-800",
        confirmada: "bg-blue-100 text-blue-800",
        realizada: "bg-green-100 text-green-800",
        cancelada: "bg-red-100 text-red-800"
      };
      return classes[estado] || classes.pendiente;
    };
    const estadoTextoExtendido = (estado) => {
      const textos = {
        pendiente: "Programada",
        confirmada: "Lista para ti \u2728",
        realizada: "Completada \u{1F4AA}",
        cancelada: "No se realiz\xF3"
      };
      return textos[estado] || "Programada";
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: [
          "bg-white rounded-xl p-5 border transition-all duration-200",
          __props.pasada ? "border-[#EAD5D3]/50 opacity-90" : "border-[#EAD5D3] hover:border-[#D8AFA0]/50 hover:shadow-md"
        ]
      }, _attrs))}><div class="space-y-4"><div class="flex items-start justify-between gap-4"><div class="flex-1"><h4 class="text-base font-[&#39;Lora&#39;] font-medium text-[#5D4A44] mb-1">${ssrInterpolate(formatearFechaLarga(__props.sesion.fecha))}</h4><div class="flex items-center space-x-3 text-sm text-[#5D4A44]/70 font-[&#39;Lato&#39;]"><div class="flex items-center space-x-1.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>${ssrInterpolate(formatearHora(__props.sesion.fecha))}</span></div><span class="text-[#5D4A44]/30">\u2022</span><span>${ssrInterpolate(__props.sesion.duracion_min)} min</span></div></div><span class="${ssrRenderClass([
        "inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap",
        "font-['Lato']",
        estadoClassExtendido(__props.sesion.estado)
      ])}">${ssrInterpolate(estadoTextoExtendido(__props.sesion.estado))}</span></div><div class="flex items-center space-x-2"><span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-[&#39;Lato&#39;] bg-[#F9F7F3] text-[#5D4A44]"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
      if (__props.sesion.modalidad === "online") {
        _push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>`);
      } else {
        _push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>`);
      }
      _push(`</svg><span class="capitalize">${ssrInterpolate(__props.sesion.modalidad)}</span></span></div>`);
      if (__props.sesion.nota_terapeuta && __props.sesion.estado === "realizada") {
        _push(`<div class="bg-[#F9F7F3] rounded-lg p-4 space-y-2 border border-[#EAD5D3]/50"><p class="text-xs font-[&#39;Lato&#39;] font-semibold text-[#D8AFA0] flex items-center space-x-1.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>Notas de la sesi\xF3n</span></p><p class="${ssrRenderClass([
          "text-sm font-['Lato'] text-[#5D4A44]/80 leading-relaxed",
          !unref(notaExpandida) && "line-clamp-2"
        ])}">${ssrInterpolate(__props.sesion.nota_terapeuta)}</p>`);
        if (__props.sesion.nota_terapeuta.length > 120) {
          _push(`<button class="text-xs font-[&#39;Lato&#39;] font-medium text-[#D8AFA0] hover:text-[#c99d8d] transition-colors">${ssrInterpolate(unref(notaExpandida) ? "Ver menos" : "Ver m\xE1s")}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div>`);
      if (__props.sesion.ubicacion && __props.sesion.modalidad === "online" && ["pendiente", "confirmada"].includes(__props.sesion.estado)) {
        _push(`<button class="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#c99d8d] transition-all duration-200 font-[&#39;Lato&#39;] font-medium text-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg><span>Unirme</span></button>`);
      } else if (__props.sesion.ubicacion && __props.sesion.modalidad === "presencial") {
        _push(`<div class="flex items-start space-x-2 text-xs font-[&#39;Lato&#39;] text-[#5D4A44]/60 bg-[#F9F7F3] px-3 py-2 rounded-lg"><svg class="w-4 h-4 text-[#D8AFA0] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg><span>${ssrInterpolate(__props.sesion.ubicacion)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SesionCard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$2, { __name: "SesionCard" });
const _sfc_main$1 = {
  __name: "EmptyState",
  __ssrInlineRender: true,
  props: {
    title: {
      type: String,
      default: "No hay datos disponibles"
    },
    description: {
      type: String,
      default: "Parece que a\xFAn no hay informaci\xF3n para mostrar aqu\xED."
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col items-center justify-center py-12 px-4 text-center" }, _attrs))}><div class="mb-4">`);
      ssrRenderSlot(_ctx.$slots, "icon", {}, () => {
        _push(`<svg class="w-16 h-16 text-[#D8AFA0] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>`);
      }, _push, _parent);
      _push(`</div><h3 class="text-lg font-medium text-[#5D4A44] font-[&#39;Lora&#39;] mb-2">${ssrInterpolate(__props.title)}</h3><p class="text-sm text-[#5D4A44] opacity-70 font-[&#39;Lato&#39;] max-w-md mb-4">${ssrInterpolate(__props.description)}</p>`);
      ssrRenderSlot(_ctx.$slots, "action", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/EmptyState.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "sesiones",
  __ssrInlineRender: true,
  setup(__props) {
    const loading = ref(true);
    const todasLasSesiones = ref([]);
    const filtroActivo = ref("todas");
    const filtros = [
      { value: "todas", label: "Todas" },
      { value: "proximas", label: "Pr\xF3ximas" },
      { value: "pasadas", label: "Pasadas" }
    ];
    const proximaSesion = computed(() => {
      const ahora = /* @__PURE__ */ new Date();
      const proximas = todasLasSesiones.value.filter((s) => new Date(s.fecha) >= ahora).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      return proximas[0] || null;
    });
    const sesionesProximasRestantes = computed(() => {
      const ahora = /* @__PURE__ */ new Date();
      const proximas = todasLasSesiones.value.filter((s) => new Date(s.fecha) >= ahora).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      return proximas.slice(1);
    });
    const sesionesPasadas = computed(() => {
      const ahora = /* @__PURE__ */ new Date();
      return todasLasSesiones.value.filter((s) => new Date(s.fecha) < ahora).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    });
    const sesionesFiltradas = computed(() => {
      const ahora = /* @__PURE__ */ new Date();
      switch (filtroActivo.value) {
        case "proximas":
          return todasLasSesiones.value.filter((s) => new Date(s.fecha) >= ahora);
        case "pasadas":
          return todasLasSesiones.value.filter((s) => new Date(s.fecha) < ahora);
        default:
          return todasLasSesiones.value;
      }
    });
    const tituloVacio = computed(() => {
      switch (filtroActivo.value) {
        case "proximas":
          return "No tienes sesiones programadas todav\xEDa \u{1F4AC}";
        case "pasadas":
          return "A\xFAn no has completado ninguna sesi\xF3n";
        default:
          return "No tienes sesiones registradas";
      }
    });
    const descripcionVacio = computed(() => {
      switch (filtroActivo.value) {
        case "proximas":
          return "Contacta con tu psic\xF3loga para agendar tu primera sesi\xF3n. Estamos aqu\xED para acompa\xF1arte.";
        case "pasadas":
          return "Una vez que completes tus sesiones, podr\xE1s revisar las notas y el progreso aqu\xED.";
        default:
          return "Cuando tengas sesiones programadas, aparecer\xE1n en este espacio.";
      }
    });
    const formatearFechaLarga = (fecha) => {
      return new Date(fecha).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long"
      });
    };
    const formatearHora = (fecha) => {
      return new Date(fecha).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const estaProxima = (fecha) => {
      const ahora = /* @__PURE__ */ new Date();
      const fechaSesion = new Date(fecha);
      const diffHoras = (fechaSesion.getTime() - ahora.getTime()) / (1e3 * 60 * 60);
      return diffHoras > 0 && diffHoras < 24;
    };
    const estadoClassExtendido = (estado) => {
      const classes = {
        pendiente: "bg-yellow-100 text-yellow-800",
        confirmada: "bg-blue-100 text-blue-800",
        realizada: "bg-green-100 text-green-800",
        cancelada: "bg-red-100 text-red-800"
      };
      return classes[estado] || classes.pendiente;
    };
    const estadoTextoExtendido = (estado) => {
      const textos = {
        pendiente: "Programada",
        confirmada: "Lista para ti \u2728",
        realizada: "Completada \u{1F4AA}",
        cancelada: "No se realiz\xF3"
      };
      return textos[estado] || "Programada";
    };
    const abrirSesion = (url) => {
      (void 0).open(url, "_blank");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LoadingSpinner = _sfc_main$3;
      const _component_SesionCard = __nuxt_component_1;
      const _component_EmptyState = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (unref(loading)) {
        _push(ssrRenderComponent(_component_LoadingSpinner, {
          text: "Cargando tus sesiones...",
          "full-height": ""
        }, null, _parent));
      } else {
        _push(`<div class="max-w-4xl mx-auto px-4 py-8 space-y-8"><div class="space-y-4"><div><h1 class="text-3xl font-[&#39;Lora&#39;] font-medium text-[#5D4A44]"> Mis Sesiones </h1><p class="text-sm text-[#5D4A44]/70 font-[&#39;Lato&#39;] mt-2"> Tu espacio de acompa\xF1amiento terap\xE9utico </p></div><div class="flex items-center space-x-1 bg-[#F9F7F3] p-1 rounded-xl w-fit"><!--[-->`);
        ssrRenderList(filtros, (filtro) => {
          _push(`<button class="${ssrRenderClass([unref(filtroActivo) === filtro.value ? "bg-white text-[#5D4A44] shadow-sm" : "text-[#5D4A44]/60 hover:text-[#5D4A44]", "px-5 py-2.5 rounded-lg text-sm font-['Lato'] font-medium transition-all duration-200"])}">${ssrInterpolate(filtro.label)}</button>`);
        });
        _push(`<!--]--></div></div>`);
        if (unref(proximaSesion) && (unref(filtroActivo) === "todas" || unref(filtroActivo) === "proximas")) {
          _push(`<div class="${ssrRenderClass([estaProxima(unref(proximaSesion).fecha) ? "border-[#D8AFA0]" : "border-[#EAD5D3]", "relative bg-gradient-to-br from-[#F9F7F3] to-white rounded-2xl p-6 border-l-4"])}"><div class="absolute top-4 right-4"><span class="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#D8AFA0]/10 text-[#D8AFA0] rounded-full text-xs font-[&#39;Lato&#39;] font-semibold"><svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg><span>Pr\xF3xima sesi\xF3n</span></span></div><div class="space-y-4"><div><h2 class="text-2xl font-[&#39;Lora&#39;] font-medium text-[#5D4A44] mb-1">${ssrInterpolate(formatearFechaLarga(unref(proximaSesion).fecha))}</h2><div class="flex items-center space-x-4 text-[#5D4A44]/70 font-[&#39;Lato&#39;]"><div class="flex items-center space-x-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span class="font-medium">${ssrInterpolate(formatearHora(unref(proximaSesion).fecha))}</span></div><span class="text-[#5D4A44]/40">\u2022</span><span>${ssrInterpolate(unref(proximaSesion).duracion_min)} minutos</span></div></div><div class="flex items-center flex-wrap gap-2"><span class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-[&#39;Lato&#39;] font-medium bg-white border border-[#EAD5D3] text-[#5D4A44]"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">`);
          if (unref(proximaSesion).modalidad === "online") {
            _push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>`);
          } else {
            _push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>`);
          }
          _push(`</svg><span class="capitalize">${ssrInterpolate(unref(proximaSesion).modalidad)}</span></span><span class="${ssrRenderClass([estadoClassExtendido(unref(proximaSesion).estado), "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-['Lato'] font-medium"])}"><span>${ssrInterpolate(estadoTextoExtendido(unref(proximaSesion).estado))}</span></span></div>`);
          if (unref(proximaSesion).ubicacion && unref(proximaSesion).modalidad === "online" && ["pendiente", "confirmada"].includes(unref(proximaSesion).estado)) {
            _push(`<div><button class="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[#D8AFA0] text-white rounded-xl hover:bg-[#c99d8d] transition-all duration-200 font-[&#39;Lato&#39;] font-medium shadow-sm hover:shadow-md"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg><span>Unirme a la sesi\xF3n</span></button></div>`);
          } else if (unref(proximaSesion).ubicacion && unref(proximaSesion).modalidad === "presencial") {
            _push(`<div class="flex items-start space-x-2 text-sm font-[&#39;Lato&#39;] text-[#5D4A44]/70 bg-white px-4 py-3 rounded-lg border border-[#EAD5D3]"><svg class="w-5 h-5 text-[#D8AFA0] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg><span>${ssrInterpolate(unref(proximaSesion).ubicacion)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(sesionesProximasRestantes).length > 0 && (unref(filtroActivo) === "todas" || unref(filtroActivo) === "proximas")) {
          _push(`<div class="space-y-3"><h3 class="text-lg font-[&#39;Lora&#39;] font-medium text-[#5D4A44] flex items-center space-x-2"><svg class="w-5 h-5 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span>Pr\xF3ximas sesiones</span></h3><div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(sesionesProximasRestantes), (sesion) => {
            _push(ssrRenderComponent(_component_SesionCard, {
              key: sesion.id,
              sesion,
              onAbrir: abrirSesion
            }, null, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(sesionesPasadas).length > 0 && (unref(filtroActivo) === "todas" || unref(filtroActivo) === "pasadas")) {
          _push(`<div class="space-y-3"><h3 class="text-lg font-[&#39;Lora&#39;] font-medium text-[#5D4A44] flex items-center space-x-2"><svg class="w-5 h-5 text-[#5D4A44]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>Sesiones pasadas</span></h3><div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(sesionesPasadas), (sesion) => {
            _push(ssrRenderComponent(_component_SesionCard, {
              key: sesion.id,
              sesion,
              pasada: true,
              onAbrir: abrirSesion
            }, null, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(sesionesFiltradas).length === 0) {
          _push(ssrRenderComponent(_component_EmptyState, {
            title: unref(tituloVacio),
            description: unref(descripcionVacio)
          }, {
            icon: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg class="w-16 h-16 text-[#D8AFA0] opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"${_scopeId}></path></svg>`);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    class: "w-16 h-16 text-[#D8AFA0] opacity-40",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "1.5",
                      d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    })
                  ]))
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/paciente/sesiones.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=sesiones-BXjtKdni.mjs.map
