import { defineComponent, ref, computed, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseEqual } from 'vue/server-renderer';
import { u as useCitas } from './useCitas-DyEZH6RI.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ModalCancelarCita",
  __ssrInlineRender: true,
  props: {
    cita: {},
    isOpen: { type: Boolean }
  },
  emits: ["close", "cancelada"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    useCitas();
    const motivoCancelacion = ref("");
    const reintegrarBono = ref(true);
    const procesando = ref(false);
    const horasAnticipacion = computed(() => {
      if (!props.cita) return 0;
      const fechaCita = /* @__PURE__ */ new Date(`${props.cita.fecha_cita}T${props.cita.hora_inicio}`);
      const ahora = /* @__PURE__ */ new Date();
      const diferenciaMilisegundos = fechaCita.getTime() - ahora.getTime();
      return Math.floor(diferenciaMilisegundos / (1e3 * 60 * 60));
    });
    const puedeReintegrar = computed(() => {
      return horasAnticipacion.value >= 24;
    });
    const mensajeAdvertencia = computed(() => {
      var _a;
      if (!((_a = props.cita) == null ? void 0 : _a.bono_id)) {
        return "Esta cita no tiene bono asociado. Se cancelar\xE1 sin afectar ning\xFAn bono.";
      }
      if (horasAnticipacion.value < 24) {
        return `La cita est\xE1 a menos de 24 horas (${horasAnticipacion.value}h). No se puede reintegrar la sesi\xF3n al bono seg\xFAn la pol\xEDtica de cancelaci\xF3n.`;
      }
      if (horasAnticipacion.value < 0) {
        return "Esta cita ya ha pasado. La sesi\xF3n no se puede reintegrar.";
      }
      return `La cita est\xE1 a ${horasAnticipacion.value} horas. Puedes elegir si devolver la sesi\xF3n al bono del paciente.`;
    });
    const formatearFecha = (fecha) => {
      return new Date(fecha).toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.isOpen && __props.cita) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"><div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"><div class="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 px-6 py-5"><div class="flex items-center justify-between"><div class="flex items-center gap-3"><div class="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div><div><h3 class="text-xl font-bold text-cafe">Cancelar Cita</h3><p class="text-sm text-cafe/60">Gesti\xF3n de sesi\xF3n del bono</p></div></div><button class="p-2 hover:bg-red-100 rounded-lg transition-colors" title="Cerrar"><svg class="w-5 h-5 text-cafe" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div><div class="p-6 space-y-5"><div class="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2"><div class="flex items-start gap-2"><svg class="w-5 h-5 text-cafe/60 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg><div class="flex-1"><p class="text-xs text-cafe/60 font-medium">Paciente</p><p class="text-sm font-semibold text-cafe">${ssrInterpolate(__props.cita.paciente_nombre || "Sin nombre")}</p></div></div><div class="flex items-start gap-2"><svg class="w-5 h-5 text-cafe/60 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><div class="flex-1"><p class="text-xs text-cafe/60 font-medium">Fecha y Hora</p><p class="text-sm font-semibold text-cafe capitalize">${ssrInterpolate(formatearFecha(__props.cita.fecha_cita))}</p><p class="text-xs text-cafe/70">${ssrInterpolate(__props.cita.hora_inicio)} - ${ssrInterpolate(__props.cita.hora_fin)}</p></div></div>`);
          if (__props.cita.terapeuta_nombre) {
            _push2(`<div class="flex items-start gap-2"><svg class="w-5 h-5 text-cafe/60 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg><div class="flex-1"><p class="text-xs text-cafe/60 font-medium">Terapeuta</p><p class="text-sm font-semibold text-cafe">${ssrInterpolate(__props.cita.terapeuta_nombre)}</p></div></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div class="${ssrRenderClass([
            "flex items-start gap-3 p-4 rounded-xl border-l-4",
            puedeReintegrar.value ? "bg-blue-50 border-blue-500" : "bg-orange-50 border-orange-500"
          ])}"><svg class="${ssrRenderClass([
            "w-5 h-5 flex-shrink-0 mt-0.5",
            puedeReintegrar.value ? "text-blue-600" : "text-orange-600"
          ])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><div class="flex-1"><p class="${ssrRenderClass([
            "text-sm font-semibold mb-1",
            puedeReintegrar.value ? "text-blue-800" : "text-orange-800"
          ])}">${ssrInterpolate(puedeReintegrar.value ? "\u2713 Cancelaci\xF3n con anticipaci\xF3n" : "\u26A0\uFE0F Cancelaci\xF3n sin anticipaci\xF3n suficiente")}</p><p class="${ssrRenderClass([
            "text-xs",
            puedeReintegrar.value ? "text-blue-700" : "text-orange-700"
          ])}">${ssrInterpolate(mensajeAdvertencia.value)}</p></div></div>`);
          if (__props.cita.bono_id && puedeReintegrar.value) {
            _push2(`<div class="space-y-3"><label class="block text-sm font-semibold text-cafe mb-2"> \xBFDevolver sesi\xF3n al bono? </label><div class="space-y-2"><label class="${ssrRenderClass([
              "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
              reintegrarBono.value ? "border-verde bg-verde/5" : "border-gray-200 hover:border-verde/50"
            ])}"><input type="radio"${ssrRenderAttr("value", true)}${ssrIncludeBooleanAttr(ssrLooseEqual(reintegrarBono.value, true)) ? " checked" : ""} class="mt-1 text-verde focus:ring-verde"><div class="flex-1"><p class="font-semibold text-cafe text-sm">S\xED, devolver sesi\xF3n</p><p class="text-xs text-cafe/70 mt-1"> La sesi\xF3n se reintegrar\xE1 al bono del paciente. Podr\xE1 usarla en otra ocasi\xF3n. </p></div></label><label class="${ssrRenderClass([
              "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
              !reintegrarBono.value ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300"
            ])}"><input type="radio"${ssrRenderAttr("value", false)}${ssrIncludeBooleanAttr(ssrLooseEqual(reintegrarBono.value, false)) ? " checked" : ""} class="mt-1 text-red-500 focus:ring-red-500"><div class="flex-1"><p class="font-semibold text-cafe text-sm">No, descontar sesi\xF3n</p><p class="text-xs text-cafe/70 mt-1"> La sesi\xF3n se descontar\xE1 del bono como si se hubiera realizado. </p></div></label></div></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div><label class="block text-sm font-semibold text-cafe mb-2"> Motivo de cancelaci\xF3n (opcional) </label><textarea rows="3" placeholder="Describe el motivo de la cancelaci\xF3n..." class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cafe/20 focus:border-cafe transition-colors resize-none text-sm">${ssrInterpolate(motivoCancelacion.value)}</textarea></div><div class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"><svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg><div class="flex-1"><p class="text-sm font-semibold text-red-800 mb-1"> Esta acci\xF3n no se puede deshacer </p><p class="text-xs text-red-700"> La cita ser\xE1 marcada como cancelada y ya no aparecer\xE1 en la agenda activa. </p></div></div></div><div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3"><button${ssrIncludeBooleanAttr(procesando.value) ? " disabled" : ""} class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-cafe rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"> Volver </button><button${ssrIncludeBooleanAttr(procesando.value) ? " disabled" : ""} class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">`);
          if (procesando.value) {
            _push2(`<span class="inline-block animate-spin">\u23F3</span>`);
          } else {
            _push2(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`);
          }
          _push2(`<span>${ssrInterpolate(procesando.value ? "Cancelando..." : "Cancelar Cita")}</span></button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalCancelarCita.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main, { __name: "ModalCancelarCita" });

export { __nuxt_component_1 as _ };
//# sourceMappingURL=ModalCancelarCita-CLZyGkL8.mjs.map
