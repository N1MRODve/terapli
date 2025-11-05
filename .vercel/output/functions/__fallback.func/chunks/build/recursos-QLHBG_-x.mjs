import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderComponent, ssrRenderTeleport, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { ref, computed, mergeProps, unref, isRef, watch, useSSRContext } from 'vue';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { e as useSupabaseUser } from './server.mjs';
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

const useTerapeuta = () => {
  useSupabaseClient();
  useSupabaseUser();
  useSupabase();
  const getPacientes = async () => {
    return [];
  };
  const getRecursosRepositorio = async () => {
    return [];
  };
  const compartirRecurso = async (recursoId, pacientesIds, notaPersonal) => {
    return { success: false, error: "Not client side" };
  };
  const getRecursosCompartidosPaciente = async (pacienteId) => {
    return [];
  };
  const getEstadisticasRecursos = async () => {
    return null;
  };
  const descompartirRecurso = async (recursoCompartidoId) => {
    return { success: false };
  };
  const crearRecurso = async (recursoData) => {
    return { success: false };
  };
  const actualizarRecurso = async (recursoId, recursoData) => {
    return { success: false };
  };
  const eliminarRecurso = async (recursoId) => {
    return { success: false };
  };
  return {
    getPacientes,
    getRecursosRepositorio,
    compartirRecurso,
    getRecursosCompartidosPaciente,
    getEstadisticasRecursos,
    descompartirRecurso,
    crearRecurso,
    actualizarRecurso,
    eliminarRecurso
  };
};
const _sfc_main$2 = {
  __name: "ModalCompartirRecurso",
  __ssrInlineRender: true,
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    recurso: {
      type: Object,
      default: null
    }
  },
  emits: ["update:modelValue", "compartido"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { getPacientes } = useTerapeuta();
    const pacientes = ref([]);
    const busqueda = ref("");
    const pacientesSeleccionados = ref([]);
    const mensaje = ref("");
    const cargandoPacientes = ref(false);
    const compartiendo = ref(false);
    const error = ref("");
    const pacientesFiltrados = computed(() => {
      if (!busqueda.value) return pacientes.value;
      const termino = busqueda.value.toLowerCase();
      return pacientes.value.filter(
        (p) => (p.nombre || "").toLowerCase().includes(termino) || (p.email || "").toLowerCase().includes(termino) || (p.area_de_acompanamiento || "").toLowerCase().includes(termino)
      );
    });
    watch(() => props.modelValue, async (nuevoValor) => {
      if (nuevoValor) {
        await cargarPacientes();
      } else {
        resetear();
      }
    });
    const cargarPacientes = async () => {
      cargandoPacientes.value = true;
      error.value = "";
      try {
        const data = await getPacientes();
        pacientes.value = data || [];
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
        error.value = "Error al cargar la lista de pacientes";
      } finally {
        cargandoPacientes.value = false;
      }
    };
    const resetear = () => {
      pacientesSeleccionados.value = [];
      mensaje.value = "";
      busqueda.value = "";
      error.value = "";
    };
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        var _a;
        if (__props.modelValue) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" data-v-0b1ffb67><div class="bg-[#F9F7F3] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" data-v-0b1ffb67><div class="bg-gradient-to-r from-[#D8AFA0] to-[#EAD5D3] px-6 py-5" data-v-0b1ffb67><div class="flex items-center justify-between" data-v-0b1ffb67><div data-v-0b1ffb67><h2 class="text-2xl font-[&#39;Lora&#39;] text-white" data-v-0b1ffb67>Compartir Recurso</h2><p class="text-sm text-white/90 mt-1" data-v-0b1ffb67>${ssrInterpolate((_a = __props.recurso) == null ? void 0 : _a.titulo)}</p></div><button class="text-white hover:bg-white/20 rounded-lg p-2 transition" data-v-0b1ffb67><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-0b1ffb67><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-0b1ffb67></path></svg></button></div></div><div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]" data-v-0b1ffb67><div class="space-y-5" data-v-0b1ffb67><div data-v-0b1ffb67><label class="block text-sm font-[&#39;Lato&#39;] font-semibold text-[#5D4A44] mb-2" data-v-0b1ffb67> Buscar paciente </label><div class="relative" data-v-0b1ffb67><input${ssrRenderAttr("value", busqueda.value)} type="text" placeholder="Buscar por nombre..." class="w-full px-4 py-3 pl-10 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]" data-v-0b1ffb67><svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5D4A44]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-0b1ffb67><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-v-0b1ffb67></path></svg></div></div><div data-v-0b1ffb67><label class="block text-sm font-[&#39;Lato&#39;] font-semibold text-[#5D4A44] mb-2" data-v-0b1ffb67> Seleccionar pacientes * </label>`);
          if (cargandoPacientes.value) {
            _push2(`<div class="text-center py-8" data-v-0b1ffb67><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D8AFA0] mx-auto" data-v-0b1ffb67></div><p class="text-sm text-[#5D4A44]/60 mt-2" data-v-0b1ffb67>Cargando pacientes...</p></div>`);
          } else if (pacientesFiltrados.value.length === 0) {
            _push2(`<div class="text-center py-8" data-v-0b1ffb67><p class="text-sm text-[#5D4A44]/60" data-v-0b1ffb67>No se encontraron pacientes</p></div>`);
          } else {
            _push2(`<div class="bg-white border border-[#EAD5D3]/50 rounded-xl max-h-60 overflow-y-auto" data-v-0b1ffb67><!--[-->`);
            ssrRenderList(pacientesFiltrados.value, (paciente) => {
              _push2(`<label class="flex items-center gap-3 p-4 hover:bg-[#F9F7F3] cursor-pointer border-b border-[#EAD5D3]/30 last:border-0 transition" data-v-0b1ffb67><input type="checkbox"${ssrRenderAttr("value", paciente.id)}${ssrIncludeBooleanAttr(Array.isArray(pacientesSeleccionados.value) ? ssrLooseContain(pacientesSeleccionados.value, paciente.id) : pacientesSeleccionados.value) ? " checked" : ""} class="w-5 h-5 text-[#D8AFA0] rounded focus:ring-2 focus:ring-[#D8AFA0]" data-v-0b1ffb67><div class="flex-1" data-v-0b1ffb67><p class="font-medium text-[#5D4A44]" data-v-0b1ffb67>${ssrInterpolate(paciente.nombre)}</p>`);
              if (paciente.email) {
                _push2(`<p class="text-sm text-[#5D4A44]/60" data-v-0b1ffb67>${ssrInterpolate(paciente.email)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></label>`);
            });
            _push2(`<!--]--></div>`);
          }
          if (pacientesSeleccionados.value.length > 0) {
            _push2(`<p class="text-sm text-[#5D4A44]/70 mt-2" data-v-0b1ffb67>${ssrInterpolate(pacientesSeleccionados.value.length)} paciente(s) seleccionado(s) </p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div data-v-0b1ffb67><label class="block text-sm font-[&#39;Lato&#39;] font-semibold text-[#5D4A44] mb-2" data-v-0b1ffb67> Mensaje opcional </label><textarea rows="3" placeholder="A\xF1ade un mensaje personalizado para el paciente..." class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44] resize-none" data-v-0b1ffb67>${ssrInterpolate(mensaje.value)}</textarea><p class="text-xs text-[#5D4A44]/60 mt-1" data-v-0b1ffb67> Este mensaje se incluir\xE1 en la notificaci\xF3n que recibir\xE1 el paciente </p></div>`);
          if (error.value) {
            _push2(`<div class="bg-red-50 border border-red-200 rounded-xl p-4" data-v-0b1ffb67><div class="flex items-start gap-3" data-v-0b1ffb67><svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" data-v-0b1ffb67><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" data-v-0b1ffb67></path></svg><p class="text-sm text-red-800" data-v-0b1ffb67>${ssrInterpolate(error.value)}</p></div></div>`);
          } else {
            _push2(`<!---->`);
          }
          if (compartiendo.value) {
            _push2(`<div class="bg-[#D8AFA0]/10 border border-[#D8AFA0]/30 rounded-xl p-4" data-v-0b1ffb67><div class="flex items-center gap-3" data-v-0b1ffb67><div class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#D8AFA0]" data-v-0b1ffb67></div><span class="text-sm text-[#5D4A44]" data-v-0b1ffb67>Compartiendo recurso...</span></div></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div><div class="bg-white border-t border-[#EAD5D3]/30 px-6 py-4 flex items-center justify-between" data-v-0b1ffb67><p class="text-sm text-[#5D4A44]/70" data-v-0b1ffb67> Los pacientes recibir\xE1n una notificaci\xF3n autom\xE1tica </p><div class="flex items-center gap-3" data-v-0b1ffb67><button type="button"${ssrIncludeBooleanAttr(compartiendo.value) ? " disabled" : ""} class="px-6 py-2.5 text-[#5D4A44] font-[&#39;Lato&#39;] rounded-xl hover:bg-[#F9F7F3] transition disabled:opacity-50" data-v-0b1ffb67> Cancelar </button><button${ssrIncludeBooleanAttr(compartiendo.value || pacientesSeleccionados.value.length === 0) ? " disabled" : ""} class="px-6 py-2.5 bg-[#D8AFA0] text-white font-[&#39;Lato&#39;] font-semibold rounded-xl hover:bg-[#D8AFA0]/90 transition disabled:opacity-50 disabled:cursor-not-allowed" data-v-0b1ffb67>${ssrInterpolate(compartiendo.value ? "Compartiendo..." : "Enviar Recurso")}</button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalCompartirRecurso.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-0b1ffb67"]]);
const _sfc_main$1 = {
  __name: "ModalRecurso",
  __ssrInlineRender: true,
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    recurso: {
      type: Object,
      default: null
    }
  },
  emits: ["update:modelValue", "guardado"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    useTerapeuta();
    const form = ref({
      titulo: "",
      descripcion: "",
      tipo: "",
      categoria: "",
      url: "",
      icono: "\u{1F4C4}",
      tags: []
    });
    const tagsInput = ref("");
    const guardando = ref(false);
    const error = ref("");
    const iconosSugeridos = ["\u{1F4CB}", "\u{1F3B5}", "\u{1F3A5}", "\u{1F9D8}", "\u{1F4D6}", "\u{1F4C4}", "\u{1F31F}", "\u{1F4A1}", "\u{1F3AF}", "\u2728"];
    const esEdicion = computed(() => !!props.recurso);
    const formularioValido = computed(() => {
      return form.value.titulo.trim() !== "" && form.value.descripcion.trim() !== "" && form.value.tipo !== "" && form.value.url.trim() !== "";
    });
    watch(tagsInput, (nuevoValor) => {
      if (nuevoValor.includes(",")) {
        const tags = nuevoValor.split(",").map((t) => t.trim()).filter((t) => t !== "" && !form.value.tags.includes(t));
        form.value.tags.push(...tags);
        tagsInput.value = "";
      }
    });
    watch(() => props.modelValue, (mostrar) => {
      if (mostrar) {
        if (props.recurso) {
          form.value = {
            titulo: props.recurso.titulo || "",
            descripcion: props.recurso.descripcion || "",
            tipo: props.recurso.tipo || "",
            categoria: props.recurso.categoria || "",
            url: props.recurso.url || "",
            icono: props.recurso.icono || "\u{1F4C4}",
            tags: props.recurso.tags ? [...props.recurso.tags] : []
          };
        } else {
          resetear();
        }
      }
    });
    const resetear = () => {
      form.value = {
        titulo: "",
        descripcion: "",
        tipo: "",
        categoria: "",
        url: "",
        icono: "\u{1F4C4}",
        tags: []
      };
      tagsInput.value = "";
      error.value = "";
    };
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.modelValue) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" data-v-bba9cf3f><div class="bg-[#F9F7F3] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" data-v-bba9cf3f><div class="bg-gradient-to-r from-[#D8AFA0] to-[#EAD5D3] px-6 py-5" data-v-bba9cf3f><div class="flex items-center justify-between" data-v-bba9cf3f><div data-v-bba9cf3f><h2 class="text-2xl font-[&#39;Lora&#39;] text-white" data-v-bba9cf3f>${ssrInterpolate(esEdicion.value ? "\u270F\uFE0F Editar Recurso" : "\u2795 Nuevo Recurso")}</h2><p class="text-sm text-white/90 mt-1" data-v-bba9cf3f>${ssrInterpolate(esEdicion.value ? "Modifica la informaci\xF3n del recurso" : "A\xF1ade un nuevo recurso al repositorio")}</p></div><button class="text-white hover:bg-white/20 rounded-lg p-2 transition" data-v-bba9cf3f><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-bba9cf3f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-bba9cf3f></path></svg></button></div></div><form class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]" data-v-bba9cf3f><div class="space-y-5" data-v-bba9cf3f><div data-v-bba9cf3f><label class="block text-sm font-[&#39;Lato&#39;] font-semibold text-[#5D4A44] mb-2" data-v-bba9cf3f> T\xEDtulo del recurso * </label><input${ssrRenderAttr("value", form.value.titulo)} type="text" required placeholder="Ej: Gu\xEDa de respiraci\xF3n consciente" class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]" data-v-bba9cf3f></div><div data-v-bba9cf3f><label class="block text-sm font-[&#39;Lato&#39;] font-semibold text-[#5D4A44] mb-2" data-v-bba9cf3f> Descripci\xF3n * </label><textarea rows="3" required placeholder="Describe brevemente el contenido del recurso..." class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44] resize-none" data-v-bba9cf3f>${ssrInterpolate(form.value.descripcion)}</textarea></div><div class="grid grid-cols-2 gap-4" data-v-bba9cf3f><div data-v-bba9cf3f><label class="block text-sm font-[&#39;Lato&#39;] font-semibold text-[#5D4A44] mb-2" data-v-bba9cf3f> Tipo * </label><select required class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]" data-v-bba9cf3f><option value="" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.tipo) ? ssrLooseContain(form.value.tipo, "") : ssrLooseEqual(form.value.tipo, "")) ? " selected" : ""}>Seleccionar...</option><option value="Gu\xEDa" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.tipo) ? ssrLooseContain(form.value.tipo, "Gu\xEDa") : ssrLooseEqual(form.value.tipo, "Gu\xEDa")) ? " selected" : ""}>\u{1F4CB} Gu\xEDa</option><option value="Audio" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.tipo) ? ssrLooseContain(form.value.tipo, "Audio") : ssrLooseEqual(form.value.tipo, "Audio")) ? " selected" : ""}>\u{1F3B5} Audio</option><option value="Video" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.tipo) ? ssrLooseContain(form.value.tipo, "Video") : ssrLooseEqual(form.value.tipo, "Video")) ? " selected" : ""}>\u{1F3A5} Video</option><option value="Ejercicio" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.tipo) ? ssrLooseContain(form.value.tipo, "Ejercicio") : ssrLooseEqual(form.value.tipo, "Ejercicio")) ? " selected" : ""}>\u{1F9D8} Ejercicio</option><option value="Lectura" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.tipo) ? ssrLooseContain(form.value.tipo, "Lectura") : ssrLooseEqual(form.value.tipo, "Lectura")) ? " selected" : ""}>\u{1F4D6} Lectura</option><option value="PDF" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.tipo) ? ssrLooseContain(form.value.tipo, "PDF") : ssrLooseEqual(form.value.tipo, "PDF")) ? " selected" : ""}>\u{1F4C4} PDF</option></select></div><div data-v-bba9cf3f><label class="block text-sm font-[&#39;Lato&#39;] font-semibold text-[#5D4A44] mb-2" data-v-bba9cf3f> Categor\xEDa </label><select class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]" data-v-bba9cf3f><option value="" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.categoria) ? ssrLooseContain(form.value.categoria, "") : ssrLooseEqual(form.value.categoria, "")) ? " selected" : ""}>Sin categor\xEDa</option><option value="Ansiedad" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.categoria) ? ssrLooseContain(form.value.categoria, "Ansiedad") : ssrLooseEqual(form.value.categoria, "Ansiedad")) ? " selected" : ""}>Ansiedad</option><option value="Mindfulness" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.categoria) ? ssrLooseContain(form.value.categoria, "Mindfulness") : ssrLooseEqual(form.value.categoria, "Mindfulness")) ? " selected" : ""}>Mindfulness</option><option value="Relajaci\xF3n" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.categoria) ? ssrLooseContain(form.value.categoria, "Relajaci\xF3n") : ssrLooseEqual(form.value.categoria, "Relajaci\xF3n")) ? " selected" : ""}>Relajaci\xF3n</option><option value="Autoestima" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.categoria) ? ssrLooseContain(form.value.categoria, "Autoestima") : ssrLooseEqual(form.value.categoria, "Autoestima")) ? " selected" : ""}>Autoestima</option><option value="TCC" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.categoria) ? ssrLooseContain(form.value.categoria, "TCC") : ssrLooseEqual(form.value.categoria, "TCC")) ? " selected" : ""}>TCC</option><option value="Estr\xE9s" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.categoria) ? ssrLooseContain(form.value.categoria, "Estr\xE9s") : ssrLooseEqual(form.value.categoria, "Estr\xE9s")) ? " selected" : ""}>Estr\xE9s</option><option value="Depresi\xF3n" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.categoria) ? ssrLooseContain(form.value.categoria, "Depresi\xF3n") : ssrLooseEqual(form.value.categoria, "Depresi\xF3n")) ? " selected" : ""}>Depresi\xF3n</option><option value="Relaciones" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.categoria) ? ssrLooseContain(form.value.categoria, "Relaciones") : ssrLooseEqual(form.value.categoria, "Relaciones")) ? " selected" : ""}>Relaciones</option><option value="Otro" data-v-bba9cf3f${ssrIncludeBooleanAttr(Array.isArray(form.value.categoria) ? ssrLooseContain(form.value.categoria, "Otro") : ssrLooseEqual(form.value.categoria, "Otro")) ? " selected" : ""}>Otro</option></select></div></div><div data-v-bba9cf3f><label class="block text-sm font-[&#39;Lato&#39;] font-semibold text-[#5D4A44] mb-2" data-v-bba9cf3f> URL del recurso * </label><input${ssrRenderAttr("value", form.value.url)} type="url" required placeholder="https://..." class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]" data-v-bba9cf3f><p class="text-xs text-[#5D4A44]/60 mt-1" data-v-bba9cf3f> Enlace directo al recurso (YouTube, PDF, art\xEDculo web, etc.) </p></div><div data-v-bba9cf3f><label class="block text-sm font-[&#39;Lato&#39;] font-semibold text-[#5D4A44] mb-2" data-v-bba9cf3f> Icono (emoji) </label><div class="flex gap-2" data-v-bba9cf3f><input${ssrRenderAttr("value", form.value.icono)} type="text" maxlength="2" placeholder="\u{1F4DA}" class="w-20 px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-center text-2xl" data-v-bba9cf3f><div class="flex flex-wrap gap-2 flex-1" data-v-bba9cf3f><!--[-->`);
          ssrRenderList(iconosSugeridos, (emoji) => {
            _push2(`<button type="button" class="px-3 py-2 text-2xl hover:bg-[#EAD5D3]/30 rounded-lg transition" data-v-bba9cf3f>${ssrInterpolate(emoji)}</button>`);
          });
          _push2(`<!--]--></div></div></div><div data-v-bba9cf3f><label class="block text-sm font-[&#39;Lato&#39;] font-semibold text-[#5D4A44] mb-2" data-v-bba9cf3f> Etiquetas </label><input${ssrRenderAttr("value", tagsInput.value)} type="text" placeholder="respiraci\xF3n, mindfulness, ansiedad (separadas por comas)" class="w-full px-4 py-3 bg-white border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] text-[#5D4A44]" data-v-bba9cf3f><p class="text-xs text-[#5D4A44]/60 mt-1" data-v-bba9cf3f> Separa las etiquetas con comas </p>`);
          if (form.value.tags.length > 0) {
            _push2(`<div class="flex flex-wrap gap-2 mt-2" data-v-bba9cf3f><!--[-->`);
            ssrRenderList(form.value.tags, (tag, index) => {
              _push2(`<span class="px-3 py-1 bg-[#D8AFA0]/20 text-[#5D4A44] rounded-full text-sm flex items-center gap-2" data-v-bba9cf3f> #${ssrInterpolate(tag)} <button type="button" class="text-[#5D4A44]/50 hover:text-[#5D4A44]" data-v-bba9cf3f> \xD7 </button></span>`);
            });
            _push2(`<!--]--></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
          if (error.value) {
            _push2(`<div class="bg-red-50 border border-red-200 rounded-xl p-4" data-v-bba9cf3f><div class="flex items-start gap-3" data-v-bba9cf3f><svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" data-v-bba9cf3f><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" data-v-bba9cf3f></path></svg><p class="text-sm text-red-800" data-v-bba9cf3f>${ssrInterpolate(error.value)}</p></div></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></form><div class="bg-white border-t border-[#EAD5D3]/30 px-6 py-4 flex items-center justify-end gap-3" data-v-bba9cf3f><button type="button"${ssrIncludeBooleanAttr(guardando.value) ? " disabled" : ""} class="px-6 py-2.5 text-[#5D4A44] font-[&#39;Lato&#39;] rounded-xl hover:bg-[#F9F7F3] transition disabled:opacity-50" data-v-bba9cf3f> Cancelar </button><button${ssrIncludeBooleanAttr(guardando.value || !formularioValido.value) ? " disabled" : ""} class="px-6 py-2.5 bg-[#D8AFA0] text-white font-[&#39;Lato&#39;] font-semibold rounded-xl hover:bg-[#D8AFA0]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" data-v-bba9cf3f>`);
          if (guardando.value) {
            _push2(`<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" data-v-bba9cf3f></span>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<span data-v-bba9cf3f>${ssrInterpolate(guardando.value ? "Guardando..." : esEdicion.value ? "Guardar Cambios" : "Crear Recurso")}</span></button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalRecurso.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-bba9cf3f"]]);
const _sfc_main = {
  __name: "recursos",
  __ssrInlineRender: true,
  setup(__props) {
    const { getEstadisticasRecursos } = useTerapeuta();
    const busqueda = ref("");
    const recursos2 = ref([]);
    const cargando = ref(true);
    const estadisticas = ref(null);
    const modoDemo = ref(false);
    const mostrarModalCompartir = ref(false);
    const recursoSeleccionado = ref(null);
    const mostrarModalRecurso = ref(false);
    const recursoAEditar = ref(null);
    const mostrarConfirmacionEliminar = ref(false);
    ref(null);
    const mostrarToast = ref(false);
    const toastTitulo = ref("");
    const toastMensaje = ref("");
    const recursosFiltrados = computed(() => {
      if (!busqueda.value) return recursos2.value;
      const termino = busqueda.value.toLowerCase();
      return recursos2.value.filter(
        (r) => {
          var _a, _b, _c, _d;
          return ((_a = r.titulo) == null ? void 0 : _a.toLowerCase().includes(termino)) || ((_b = r.descripcion) == null ? void 0 : _b.toLowerCase().includes(termino)) || ((_c = r.categoria) == null ? void 0 : _c.toLowerCase().includes(termino)) || ((_d = r.tipo) == null ? void 0 : _d.toLowerCase().includes(termino));
        }
      );
    });
    const cargarEstadisticas = async () => {
      try {
        const stats = await getEstadisticasRecursos();
        if (stats) {
          estadisticas.value = stats;
        } else {
          estadisticas.value = {
            total: 2,
            vistos: 1,
            pendientes: 1,
            porcentajeVisto: 50
          };
        }
      } catch (error) {
        console.error("Error cargando estad\xEDsticas:", error);
        estadisticas.value = {
          total: 0,
          vistos: 0,
          pendientes: 0,
          porcentajeVisto: 0
        };
      }
    };
    const handleCompartido = (data) => {
      mostrarToastExito("\xA1Recurso compartido!", `Compartido con ${data.cantidad} paciente${data.cantidad > 1 ? "s" : ""}`);
      cargarEstadisticas();
    };
    const handleRecursoGuardado = (recurso) => {
      if (recursoAEditar.value) {
        const index = recursos2.value.findIndex((r) => r.id === recurso.id);
        if (index !== -1) {
          recursos2.value[index] = recurso;
        }
        mostrarToastExito("\xA1Recurso actualizado!", "Los cambios se han guardado correctamente");
      } else {
        recursos2.value.unshift(recurso);
        mostrarToastExito("\xA1Recurso creado!", "El nuevo recurso est\xE1 listo para compartir");
      }
      cargarEstadisticas();
    };
    const mostrarToastExito = (titulo, mensaje) => {
      toastTitulo.value = titulo;
      toastMensaje.value = mensaje;
      mostrarToast.value = true;
      setTimeout(() => {
        mostrarToast.value = false;
      }, 3e3);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ModalCompartirRecurso = __nuxt_component_0;
      const _component_ModalRecurso = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-[#F9F7F3] py-8" }, _attrs))} data-v-ce5bceaf><div class="container mx-auto px-4 max-w-7xl" data-v-ce5bceaf>`);
      if (unref(modoDemo)) {
        _push(`<div class="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl" data-v-ce5bceaf><div class="flex items-start gap-3" data-v-ce5bceaf><span class="text-3xl" data-v-ce5bceaf>\u{1F3AD}</span><div class="flex-1" data-v-ce5bceaf><h3 class="font-[&#39;Lora&#39;] text-lg font-semibold text-blue-900 mb-1" data-v-ce5bceaf> Modo Demostraci\xF3n - Recursos Precargados </h3><p class="text-sm text-blue-700 leading-relaxed" data-v-ce5bceaf> Est\xE1s viendo <strong data-v-ce5bceaf>6 recursos de ejemplo</strong> listos para compartir con tus pacientes. Para usar el repositorio real, ejecuta la migraci\xF3n SQL en Supabase: <code class="px-2 py-0.5 bg-blue-100 rounded" data-v-ce5bceaf>supabase/migrations/20251019_recursos_compartidos.sql</code></p></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mb-8 flex items-start justify-between" data-v-ce5bceaf><div data-v-ce5bceaf><h1 class="text-4xl font-[&#39;Lora&#39;] text-[#5D4A44] mb-2" data-v-ce5bceaf>\u{1F4DA} Recursos Terap\xE9uticos</h1><p class="text-[#5D4A44]/70" data-v-ce5bceaf>Biblioteca de materiales para compartir con tus pacientes</p></div><button class="px-6 py-3 bg-[#D8AFA0] text-white rounded-xl hover:bg-[#D8AFA0]/90 transition-colors flex items-center gap-2 whitespace-nowrap" data-v-ce5bceaf><span class="text-xl" data-v-ce5bceaf>\u2795</span><span class="font-[&#39;Lato&#39;] font-semibold" data-v-ce5bceaf>Nuevo Recurso</span></button></div>`);
      if (unref(estadisticas)) {
        _push(`<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" data-v-ce5bceaf><div class="bg-white rounded-xl p-4 border border-[#EAD5D3]/30" data-v-ce5bceaf><div class="flex items-center gap-3" data-v-ce5bceaf><span class="text-3xl" data-v-ce5bceaf>\u{1F4E4}</span><div data-v-ce5bceaf><p class="text-2xl font-[&#39;Lora&#39;] font-bold text-[#5D4A44]" data-v-ce5bceaf>${ssrInterpolate(unref(estadisticas).total)}</p><p class="text-sm text-[#5D4A44]/70" data-v-ce5bceaf>Recursos compartidos</p></div></div></div><div class="bg-white rounded-xl p-4 border border-[#EAD5D3]/30" data-v-ce5bceaf><div class="flex items-center gap-3" data-v-ce5bceaf><span class="text-3xl" data-v-ce5bceaf>\u{1F441}\uFE0F</span><div data-v-ce5bceaf><p class="text-2xl font-[&#39;Lora&#39;] font-bold text-[#5D4A44]" data-v-ce5bceaf>${ssrInterpolate(unref(estadisticas).vistos)}</p><p class="text-sm text-[#5D4A44]/70" data-v-ce5bceaf>Vistos por pacientes</p></div></div></div><div class="bg-white rounded-xl p-4 border border-[#EAD5D3]/30" data-v-ce5bceaf><div class="flex items-center gap-3" data-v-ce5bceaf><span class="text-3xl" data-v-ce5bceaf>\u23F3</span><div data-v-ce5bceaf><p class="text-2xl font-[&#39;Lora&#39;] font-bold text-[#5D4A44]" data-v-ce5bceaf>${ssrInterpolate(unref(estadisticas).pendientes)}</p><p class="text-sm text-[#5D4A44]/70" data-v-ce5bceaf>Pendientes de ver</p></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="bg-white rounded-xl p-6 mb-6 border border-[#EAD5D3]/30" data-v-ce5bceaf><input${ssrRenderAttr("value", unref(busqueda))} type="text" placeholder="Buscar recursos por t\xEDtulo, descripci\xF3n o categor\xEDa..." class="w-full px-4 py-3 bg-[#F9F7F3] border border-[#EAD5D3]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]" data-v-ce5bceaf></div>`);
      if (unref(cargando)) {
        _push(`<div class="text-center py-12" data-v-ce5bceaf><div class="animate-spin w-12 h-12 border-4 border-[#D8AFA0] border-t-transparent rounded-full mx-auto mb-4" data-v-ce5bceaf></div><p class="text-[#5D4A44]/60" data-v-ce5bceaf>Cargando recursos...</p></div>`);
      } else if (unref(recursosFiltrados).length > 0) {
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-v-ce5bceaf><!--[-->`);
        ssrRenderList(unref(recursosFiltrados), (recurso) => {
          var _a;
          _push(`<div class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/30 p-6 hover:shadow-md transition-shadow" data-v-ce5bceaf><div class="flex justify-between mb-3" data-v-ce5bceaf><span class="text-2xl" data-v-ce5bceaf>${ssrInterpolate(recurso.icono)}</span><span class="text-xs px-3 py-1 rounded-full bg-[#EAD5D3]/50" data-v-ce5bceaf>${ssrInterpolate(recurso.tipo)}</span></div><h3 class="font-[&#39;Lora&#39;] text-lg text-[#5D4A44] mb-2" data-v-ce5bceaf>${ssrInterpolate(recurso.titulo)}</h3><p class="text-sm text-[#5D4A44]/70 mb-4 line-clamp-2" data-v-ce5bceaf>${ssrInterpolate(recurso.descripcion)}</p>`);
          if (recurso.categoria) {
            _push(`<div class="mb-4" data-v-ce5bceaf><span class="text-xs px-2 py-1 bg-[#D8AFA0]/20 text-[#5D4A44] rounded" data-v-ce5bceaf>${ssrInterpolate(recurso.categoria)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex flex-col gap-2" data-v-ce5bceaf><div class="flex gap-2" data-v-ce5bceaf><a${ssrRenderAttr("href", recurso.url)} target="_blank" class="flex-1 text-center px-3 py-2 text-sm bg-[#F9F7F3] text-[#5D4A44] rounded-lg hover:bg-[#EAD5D3]/30 transition-colors" data-v-ce5bceaf> \u{1F441}\uFE0F Ver </a><button class="flex-1 px-3 py-2 text-sm bg-[#D8AFA0] text-white rounded-lg hover:bg-[#D8AFA0]/90 transition-colors" data-v-ce5bceaf> \u{1F4E4} Compartir </button></div><div class="flex gap-2" data-v-ce5bceaf><button class="flex-1 px-3 py-2 text-sm bg-white border border-[#EAD5D3] text-[#5D4A44] rounded-lg hover:bg-[#F9F7F3] transition-colors" data-v-ce5bceaf> \u270F\uFE0F Editar </button>`);
          if (!((_a = recurso.id) == null ? void 0 : _a.startsWith("demo"))) {
            _push(`<button class="flex-1 px-3 py-2 text-sm bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors" data-v-ce5bceaf> \u{1F5D1}\uFE0F Eliminar </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="text-center py-12" data-v-ce5bceaf><span class="text-6xl block mb-4 opacity-40" data-v-ce5bceaf>\u{1F4DA}</span><h3 class="text-xl font-[&#39;Lora&#39;] font-semibold text-[#5D4A44] mb-2" data-v-ce5bceaf>${ssrInterpolate(unref(busqueda) ? "No se encontraron recursos" : "No hay recursos disponibles")}</h3><p class="text-[#5D4A44]/60" data-v-ce5bceaf>${ssrInterpolate(unref(busqueda) ? "Intenta con otros t\xE9rminos de b\xFAsqueda" : "Los recursos se cargar\xE1n autom\xE1ticamente")}</p></div>`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_component_ModalCompartirRecurso, {
        modelValue: unref(mostrarModalCompartir),
        "onUpdate:modelValue": ($event) => isRef(mostrarModalCompartir) ? mostrarModalCompartir.value = $event : null,
        recurso: unref(recursoSeleccionado),
        onCompartido: handleCompartido
      }, null, _parent));
      _push(ssrRenderComponent(_component_ModalRecurso, {
        modelValue: unref(mostrarModalRecurso),
        "onUpdate:modelValue": ($event) => isRef(mostrarModalRecurso) ? mostrarModalRecurso.value = $event : null,
        recurso: unref(recursoAEditar),
        onGuardado: handleRecursoGuardado
      }, null, _parent));
      if (unref(mostrarToast)) {
        _push(`<div class="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50" data-v-ce5bceaf><span class="text-2xl" data-v-ce5bceaf>\u2705</span><div data-v-ce5bceaf><p class="font-semibold" data-v-ce5bceaf>${ssrInterpolate(unref(toastTitulo))}</p><p class="text-sm opacity-90" data-v-ce5bceaf>${ssrInterpolate(unref(toastMensaje))}</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(mostrarConfirmacionEliminar)) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" data-v-ce5bceaf><div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" data-v-ce5bceaf><div class="text-center mb-6" data-v-ce5bceaf><span class="text-6xl block mb-4" data-v-ce5bceaf>\u26A0\uFE0F</span><h3 class="text-xl font-[&#39;Lora&#39;] font-semibold text-[#5D4A44] mb-2" data-v-ce5bceaf> \xBFEliminar recurso? </h3><p class="text-sm text-[#5D4A44]/70" data-v-ce5bceaf> Esta acci\xF3n no se puede deshacer. El recurso se ocultar\xE1 del repositorio. </p></div><div class="flex gap-3" data-v-ce5bceaf><button class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-[&#39;Lato&#39;] font-medium" data-v-ce5bceaf> Cancelar </button><button class="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-[&#39;Lato&#39;] font-semibold" data-v-ce5bceaf> Eliminar </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/terapeuta/recursos.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const recursos = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ce5bceaf"]]);

export { recursos as default };
//# sourceMappingURL=recursos-QLHBG_-x.mjs.map
