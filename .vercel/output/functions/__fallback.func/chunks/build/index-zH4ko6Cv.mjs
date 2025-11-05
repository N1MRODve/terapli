import { defineComponent, ref, computed, watch, mergeProps, unref, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrRenderTeleport, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
import { useRoute, useRouter } from 'vue-router';
import { u as useCitas } from './useCitas-DyEZH6RI.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { _ as __nuxt_component_0 } from './AgendaTerapeuta-DO67d38s.mjs';
import { _ as __nuxt_component_2 } from './ModalNuevaCita-6Mm-k6WH.mjs';
import { M as ModalDetallesCita } from './ModalDetallesCita-4YIA-weF.mjs';
import './useSupabaseClient-DykwVqLQ.mjs';
import './server.mjs';
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
import '@supabase/ssr';
import '@vercel/analytics/nuxt';
import '@heroicons/vue/24/outline';
import './useSupabase-DljD0dj8.mjs';

const COLORES_ESTADO = {
  pendiente: {
    border: "border-amber-200 dark:border-amber-800",
    bg: "bg-white dark:bg-zinc-800",
    badge: "bg-amber-400 dark:bg-amber-500",
    dot: "bg-amber-400 dark:bg-amber-500",
    hover: "hover:bg-amber-50 dark:hover:bg-amber-950/20"
  },
  confirmada: {
    border: "border-emerald-200 dark:border-emerald-800",
    bg: "bg-white dark:bg-zinc-800",
    badge: "bg-emerald-400 dark:bg-emerald-500",
    dot: "bg-emerald-400 dark:bg-emerald-500",
    hover: "hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
  },
  cancelada: {
    border: "border-rose-200 dark:border-rose-800",
    bg: "bg-white dark:bg-zinc-800",
    badge: "bg-rose-400 dark:bg-rose-500",
    dot: "bg-rose-400 dark:bg-rose-500",
    hover: "hover:bg-rose-50 dark:hover:bg-rose-950/20"
  },
  realizada: {
    border: "border-blue-200 dark:border-blue-800",
    bg: "bg-white dark:bg-zinc-800",
    badge: "bg-blue-400 dark:bg-blue-500",
    dot: "bg-blue-400 dark:bg-blue-500",
    hover: "hover:bg-blue-50 dark:hover:bg-blue-950/20"
  }
};
const formatearFecha = (fecha) => {
  const date = /* @__PURE__ */ new Date(fecha + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};
const formatearMesAnio = (fecha) => {
  const date = /* @__PURE__ */ new Date(fecha + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric"
  });
};
const formatearDiaSemana = (fecha) => {
  const date = /* @__PURE__ */ new Date(fecha + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short"
  });
};
const obtenerNumeroSemana = (fecha) => {
  const date = /* @__PURE__ */ new Date(fecha + "T00:00:00");
  const inicioAnio = new Date(date.getFullYear(), 0, 1);
  const diferencia = date.getTime() - inicioAnio.getTime();
  const unDia = 1e3 * 60 * 60 * 24;
  return Math.ceil((diferencia / unDia + inicioAnio.getDay() + 1) / 7);
};
const obtenerTituloAgenda = (vista, fecha) => {
  const fechaStr = typeof fecha === "string" ? fecha : fecha.toISOString().split("T")[0];
  switch (vista) {
    case "dia":
      return formatearFecha(fechaStr);
    case "semana":
      return `${formatearMesAnio(fechaStr)} \u2014 Semana ${obtenerNumeroSemana(fechaStr)}`;
    case "mes":
      return formatearMesAnio(fechaStr);
    default:
      return "";
  }
};
const generarBloquesHorarios = (inicio = "08:00", fin = "20:00", intervalo = 30) => {
  const bloques = [];
  const [horaInicio, minInicio] = inicio.split(":").map(Number);
  const [horaFin, minFin] = fin.split(":").map(Number);
  let horaActual = horaInicio;
  let minActual = minInicio;
  while (horaActual < horaFin || horaActual === horaFin && minActual < minFin) {
    bloques.push(`${String(horaActual).padStart(2, "0")}:${String(minActual).padStart(2, "0")}`);
    minActual += intervalo;
    if (minActual >= 60) {
      horaActual++;
      minActual -= 60;
    }
  }
  return bloques;
};
const agregarDias = (fecha, dias) => {
  const date = /* @__PURE__ */ new Date(fecha + "T00:00:00");
  date.setDate(date.getDate() + dias);
  return date.toISOString().split("T")[0];
};
const inicioSemana = (fecha) => {
  const date = /* @__PURE__ */ new Date(fecha + "T00:00:00");
  const dia = date.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split("T")[0];
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "AgendaHeader",
  __ssrInlineRender: true,
  props: {
    vista: {},
    fechaActual: {},
    darkMode: { type: Boolean }
  },
  emits: ["update:vista", "update:fechaActual", "update:darkMode", "nueva-cita"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const titulo = computed(() => {
      return obtenerTituloAgenda(props.vista, props.fechaActual);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "sticky top-0 z-20 bg-white/70 dark:bg-gray-950/70 backdrop-blur-md border-b border-cafe/10 dark:border-gray-800 shadow-sm" }, _attrs))} data-v-9c60bdb2><div class="px-4 py-2.5 sm:px-6 lg:px-6" data-v-9c60bdb2><div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" data-v-9c60bdb2><div class="flex items-center gap-2.5" data-v-9c60bdb2><div class="flex items-center gap-0.5" data-v-9c60bdb2><button class="px-2.5 py-1.5 border border-cafe/20 dark:border-gray-700 rounded-lg hover:bg-terracota/10 dark:hover:bg-gray-800 hover:border-terracota transition-all duration-200" aria-label="Periodo anterior" data-v-9c60bdb2><svg class="w-4 h-4 text-cafe dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-9c60bdb2><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" data-v-9c60bdb2></path></svg></button><button class="px-3.5 py-1.5 mx-1 border border-cafe/20 dark:border-gray-700 rounded-lg hover:bg-terracota/10 dark:hover:bg-gray-800 hover:border-terracota transition-all duration-200 text-sm font-medium text-cafe dark:text-gray-300" data-v-9c60bdb2> Hoy </button><button class="px-2.5 py-1.5 border border-cafe/20 dark:border-gray-700 rounded-lg hover:bg-terracota/10 dark:hover:bg-gray-800 hover:border-terracota transition-all duration-200" aria-label="Periodo siguiente" data-v-9c60bdb2><svg class="w-4 h-4 text-cafe dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-9c60bdb2><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-v-9c60bdb2></path></svg></button></div><h1 class="text-lg sm:text-xl font-serif font-bold text-cafe dark:text-gray-100 ml-1" data-v-9c60bdb2>${ssrInterpolate(titulo.value)}</h1></div><div class="flex items-center gap-2.5 w-full sm:w-auto" data-v-9c60bdb2><div class="flex border border-cafe/20 dark:border-gray-700 rounded-xl overflow-hidden shadow-xs" data-v-9c60bdb2><button class="${ssrRenderClass([
        "px-3 py-1.5 text-sm font-medium transition-all duration-200",
        __props.vista === "dia" ? "bg-terracota text-white shadow-sm" : "bg-white dark:bg-gray-900 text-cafe dark:text-gray-300 hover:bg-terracota/10 dark:hover:bg-gray-800"
      ])}" aria-label="Vista de d\xEDa" data-v-9c60bdb2> \u{1F4C5} D\xEDa </button><button class="${ssrRenderClass([
        "px-3 py-1.5 text-sm font-medium transition-all duration-200 border-l border-cafe/10 dark:border-gray-700",
        __props.vista === "semana" ? "bg-terracota text-white shadow-sm" : "bg-white dark:bg-gray-900 text-cafe dark:text-gray-300 hover:bg-terracota/10 dark:hover:bg-gray-800"
      ])}" aria-label="Vista de semana" data-v-9c60bdb2> \u{1F4C6} Semana </button><button class="${ssrRenderClass([
        "px-3 py-1.5 text-sm font-medium transition-all duration-200 border-l border-cafe/10 dark:border-gray-700",
        __props.vista === "mes" ? "bg-terracota text-white shadow-sm" : "bg-white dark:bg-gray-900 text-cafe dark:text-gray-300 hover:bg-terracota/10 dark:hover:bg-gray-800"
      ])}" aria-label="Vista de mes" data-v-9c60bdb2> \u{1F5D3}\uFE0F Mes </button></div><button class="flex items-center gap-2 px-2.5 py-1.5 border border-cafe/20 dark:border-gray-700 rounded-xl hover:bg-terracota/10 dark:hover:bg-gray-800 hover:border-terracota transition-all duration-200"${ssrRenderAttr("aria-label", __props.darkMode ? "Desactivar modo oscuro" : "Activar modo oscuro")} data-v-9c60bdb2>`);
      if (__props.darkMode) {
        _push(`<span class="text-lg" data-v-9c60bdb2>\u{1F319}</span>`);
      } else {
        _push(`<span class="text-lg" data-v-9c60bdb2>\u2600\uFE0F</span>`);
      }
      _push(`</button><button class="flex items-center gap-2 px-4 py-1.5 bg-terracota hover:bg-terracota/90 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm" data-v-9c60bdb2><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-9c60bdb2><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" data-v-9c60bdb2></path></svg> Nueva Cita </button></div></div></div></header>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/agenda/AgendaHeader.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const AgendaHeader = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$5, [["__scopeId", "data-v-9c60bdb2"]]), { __name: "AgendaHeader" });
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "AgendaFilters",
  __ssrInlineRender: true,
  props: {
    filtros: {},
    terapeutas: {},
    pacientes: {}
  },
  emits: ["update:filtros", "update:busqueda"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const busqueda = ref("");
    const mostrarFiltrosAvanzados = ref(false);
    const modalidadesDisponibles = [
      { value: "online", label: "Online", emoji: "\u{1F4BB}" },
      { value: "presencial", label: "Presencial", emoji: "\u{1F3E2}" }
    ];
    const pacienteSeleccionado = computed({
      get: () => props.filtros.pacienteId || "",
      set: (value) => actualizarFiltro("pacienteId", value || void 0)
    });
    const modalidadSeleccionada = computed({
      get: () => props.filtros.modalidad || "",
      set: (value) => actualizarFiltro("modalidad", value || void 0)
    });
    const fechaDesde = computed({
      get: () => props.filtros.fechaDesde || "",
      set: (value) => actualizarFiltro("fechaDesde", value || void 0)
    });
    const fechaHasta = computed({
      get: () => props.filtros.fechaHasta || "",
      set: (value) => actualizarFiltro("fechaHasta", value || void 0)
    });
    const contadorFiltrosActivos = computed(() => {
      let count = 0;
      if (pacienteSeleccionado.value) count++;
      if (modalidadSeleccionada.value) count++;
      if (fechaDesde.value || fechaHasta.value) count++;
      return count;
    });
    const actualizarFiltro = (key, value) => {
      emit("update:filtros", {
        ...props.filtros,
        [key]: value
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm border-b border-cafe/5 dark:border-gray-800 shadow-sm" }, _attrs))} data-v-fb697357><div class="px-4 py-2 sm:px-6 lg:px-6 space-y-2" data-v-fb697357><div class="flex items-center gap-3" data-v-fb697357><div class="flex-1 relative" data-v-fb697357><input${ssrRenderAttr("value", busqueda.value)} type="text" placeholder="Buscar por paciente, terapeuta, notas..." class="w-full px-3 py-1.5 pl-9 text-sm border border-cafe/20 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-terracota focus:border-terracota bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all" data-v-fb697357><svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cafe/50 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-fb697357><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-v-fb697357></path></svg></div><button class="${ssrRenderClass([{ "bg-terracota/10 border-terracota text-terracota": contadorFiltrosActivos.value > 0 }, "flex items-center gap-1.5 px-3 py-1.5 text-sm border border-cafe/20 dark:border-gray-700 rounded-lg hover:bg-terracota/10 dark:hover:bg-gray-800 hover:border-terracota transition-all duration-200"])}" data-v-fb697357><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-fb697357><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" data-v-fb697357></path></svg><span data-v-fb697357>Filtros</span>`);
      if (contadorFiltrosActivos.value > 0) {
        _push(`<span class="px-1.5 py-0.5 bg-terracota text-white text-xs rounded-full" data-v-fb697357>${ssrInterpolate(contadorFiltrosActivos.value)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button>`);
      if (contadorFiltrosActivos.value > 0 || busqueda.value) {
        _push(`<button class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-200" data-v-fb697357> Limpiar </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (mostrarFiltrosAvanzados.value) {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2" data-v-fb697357><div data-v-fb697357><label class="block text-xs font-medium text-cafe/70 dark:text-gray-300 mb-1" data-v-fb697357> Paciente </label><select class="w-full px-3 py-1.5 text-sm border border-cafe/20 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-terracota focus:border-terracota bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" data-v-fb697357><option value="" data-v-fb697357${ssrIncludeBooleanAttr(Array.isArray(pacienteSeleccionado.value) ? ssrLooseContain(pacienteSeleccionado.value, "") : ssrLooseEqual(pacienteSeleccionado.value, "")) ? " selected" : ""}>Todos los pacientes</option><!--[-->`);
        ssrRenderList(__props.pacientes, (p) => {
          _push(`<option${ssrRenderAttr("value", p.id)} data-v-fb697357${ssrIncludeBooleanAttr(Array.isArray(pacienteSeleccionado.value) ? ssrLooseContain(pacienteSeleccionado.value, p.id) : ssrLooseEqual(pacienteSeleccionado.value, p.id)) ? " selected" : ""}>${ssrInterpolate(p.nombre)}</option>`);
        });
        _push(`<!--]--></select></div><div data-v-fb697357><label class="block text-xs font-medium text-cafe/70 dark:text-gray-300 mb-1" data-v-fb697357> Modalidad </label><select class="w-full px-3 py-1.5 text-sm border border-cafe/20 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-terracota focus:border-terracota bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" data-v-fb697357><option value="" data-v-fb697357${ssrIncludeBooleanAttr(Array.isArray(modalidadSeleccionada.value) ? ssrLooseContain(modalidadSeleccionada.value, "") : ssrLooseEqual(modalidadSeleccionada.value, "")) ? " selected" : ""}>Todas las modalidades</option><!--[-->`);
        ssrRenderList(modalidadesDisponibles, (m) => {
          _push(`<option${ssrRenderAttr("value", m.value)} data-v-fb697357${ssrIncludeBooleanAttr(Array.isArray(modalidadSeleccionada.value) ? ssrLooseContain(modalidadSeleccionada.value, m.value) : ssrLooseEqual(modalidadSeleccionada.value, m.value)) ? " selected" : ""}>${ssrInterpolate(m.emoji)} ${ssrInterpolate(m.label)}</option>`);
        });
        _push(`<!--]--></select></div><div data-v-fb697357><label class="block text-xs font-medium text-cafe/70 dark:text-gray-300 mb-1" data-v-fb697357> Rango de fechas </label><div class="flex gap-2" data-v-fb697357><input${ssrRenderAttr("value", fechaDesde.value)} type="date" class="flex-1 px-3 py-1.5 text-sm border border-cafe/20 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-terracota focus:border-terracota bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" data-v-fb697357><input${ssrRenderAttr("value", fechaHasta.value)} type="date" class="flex-1 px-3 py-1.5 text-sm border border-cafe/20 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-terracota focus:border-terracota bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" data-v-fb697357></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/agenda/AgendaFilters.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const AgendaFilters = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$4, [["__scopeId", "data-v-fb697357"]]), { __name: "AgendaFilters" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "AgendaLegend",
  __ssrInlineRender: true,
  setup(__props) {
    const leyenda = [
      { key: "pendiente", label: "Pendiente", emoji: "\u{1F7E1}", bgClass: "bg-yellow-100", textClass: "text-yellow-800" },
      { key: "confirmada", label: "Confirmada", emoji: "\u{1F7E2}", bgClass: "bg-green-100", textClass: "text-green-700" },
      { key: "realizada", label: "Realizada", emoji: "\u{1F535}", bgClass: "bg-blue-100", textClass: "text-blue-700" },
      { key: "cancelada", label: "Cancelada", emoji: "\u{1F534}", bgClass: "bg-red-100", textClass: "text-red-700" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-wrap gap-2 items-center py-1.5" }, _attrs))} data-v-5f57fa35><!--[-->`);
      ssrRenderList(leyenda, (item) => {
        _push(`<div class="${ssrRenderClass(["flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105", item.bgClass, item.textClass])}" data-v-5f57fa35><span class="text-base" data-v-5f57fa35>${ssrInterpolate(item.emoji)}</span><span data-v-5f57fa35>${ssrInterpolate(item.label)}</span></div>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/agenda/AgendaLegend.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const AgendaLegend = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["__scopeId", "data-v-5f57fa35"]]), { __name: "AgendaLegend" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AgendaEventCard",
  __ssrInlineRender: true,
  props: {
    event: {},
    compact: { type: Boolean },
    draggable: { type: Boolean }
  },
  emits: ["open", "menu"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    computed(() => {
      return COLORES_ESTADO[props.event.estado] || COLORES_ESTADO.cancelada;
    });
    const horaFormateada = computed(() => {
      return `${props.event.horaInicio} \u2013 ${props.event.horaFin}`;
    });
    const horaInicio = computed(() => {
      return props.event.horaInicio;
    });
    const nombrePaciente = computed(() => {
      return props.event.pacienteNombre || "Paciente sin nombre";
    });
    computed(() => {
      const iconos = {
        pendiente: "\u{1F7E1}",
        confirmada: "\u{1F7E2}",
        cancelada: "\u{1F534}",
        completada: "\u26AA",
        realizada: "\u{1F535}"
      };
      return iconos[props.event.estado] || "\u26AA";
    });
    const tieneBono = computed(() => {
      return props.event.bono && props.event.bono.sesionesRestantes !== void 0;
    });
    const colorSesiones = computed(() => {
      if (!props.event.bono) return "green";
      const restantes = props.event.bono.sesionesRestantes || 0;
      if (restantes === 0) return "red";
      if (restantes === 1) return "orange";
      if (restantes <= 2) return "yellow";
      return "green";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "agenda-event group",
        "data-estado": __props.event.estado,
        "data-compact": __props.compact,
        draggable: __props.draggable,
        role: "button",
        tabindex: "0",
        title: `${nombrePaciente.value} - ${horaFormateada.value}`
      }, _attrs))} data-v-720e5f4d><div class="${ssrRenderClass(["flex flex-col justify-center", __props.compact ? "gap-0.5" : "gap-1"])}" data-v-720e5f4d><span class="hora" data-v-720e5f4d>${ssrInterpolate(__props.compact ? horaInicio.value : horaFormateada.value)}</span><span class="nombre" data-v-720e5f4d><span class="estado-dot" data-v-720e5f4d></span> ${ssrInterpolate(nombrePaciente.value)}</span>`);
      if (!__props.compact) {
        _push(`<div class="info-adicional" data-v-720e5f4d>`);
        if (__props.event.modalidad) {
          _push(`<span class="modalidad" data-v-720e5f4d>`);
          if (__props.event.modalidad === "online") {
            _push(`<span data-v-720e5f4d>\u{1F4BB}</span>`);
          } else {
            _push(`<span data-v-720e5f4d>\u{1F3E5}</span>`);
          }
          _push(` ${ssrInterpolate(__props.event.modalidad === "online" ? "Online" : "Presencial")}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.event.areaTerapeutica) {
          _push(`<span class="area" data-v-720e5f4d>${ssrInterpolate(__props.event.areaTerapeutica)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (tieneBono.value) {
          _push(`<span class="bono-info"${ssrRenderAttr("data-color", colorSesiones.value)} data-v-720e5f4d>${ssrInterpolate(__props.event.bono.sesionesRestantes)}/${ssrInterpolate(__props.event.bono.sesionesTotales)} sesiones </span>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.event.notas || __props.event.terapeuta) {
          _push(`<div class="indicadores" data-v-720e5f4d>`);
          if (__props.event.notas) {
            _push(`<span title="Tiene notas" data-v-720e5f4d>\u{1F4DD}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (__props.event.terapeuta) {
            _push(`<span${ssrRenderAttr("title", `Terapeuta: ${__props.event.terapeuta.nombre}`)} data-v-720e5f4d>\u{1F464}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (!__props.compact) {
        _push(`<button class="menu-btn" aria-label="Abrir men\xFA de acciones" type="button" data-v-720e5f4d><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" data-v-720e5f4d><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" data-v-720e5f4d></path></svg></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/agenda/AgendaEventCard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const AgendaEventCard = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-720e5f4d"]]), { __name: "AgendaEventCard" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AgendaGrid",
  __ssrInlineRender: true,
  props: {
    eventos: {},
    vista: {},
    fechaActual: {},
    cargando: { type: Boolean },
    draggable: { type: Boolean }
  },
  emits: ["evento-click", "evento-menu", "slot-click", "evento-drop"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    ref(null);
    const zoomLevel = ref("normal");
    const gridContainer = ref(null);
    const lineaTiempoTop = ref("0px");
    const lineaTiempoVisible = ref(false);
    const citasActivas = ref(/* @__PURE__ */ new Set());
    const HORAS_TRABAJO = generarBloquesHorarios("08:00", "22:30", 30);
    computed(() => {
      switch (zoomLevel.value) {
        case "compact":
          return "h-8";
        case "normal":
          return "h-10";
        case "comfortable":
          return "h-16";
        default:
          return "h-10";
      }
    });
    const fechas = computed(() => {
      const fechaStr = props.fechaActual.toISOString().split("T")[0];
      if (props.vista === "dia") {
        return [fechaStr];
      } else if (props.vista === "semana") {
        const inicio = inicioSemana(fechaStr);
        return Array.from({ length: 7 }, (_, i) => agregarDias(inicio, i));
      } else {
        const primerDia = new Date(props.fechaActual.getFullYear(), props.fechaActual.getMonth(), 1);
        const ultimoDia = new Date(props.fechaActual.getFullYear(), props.fechaActual.getMonth() + 1, 0);
        let primerDiaSemana = primerDia.getDay();
        primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
        let ultimoDiaSemana = ultimoDia.getDay();
        ultimoDiaSemana = ultimoDiaSemana === 0 ? 6 : ultimoDiaSemana - 1;
        const dias = [];
        for (let i = primerDiaSemana - 1; i >= 0; i--) {
          const fecha = new Date(primerDia);
          fecha.setDate(fecha.getDate() - (i + 1));
          dias.push(fecha.toISOString().split("T")[0]);
        }
        for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
          dias.push(d.toISOString().split("T")[0]);
        }
        const diasParaCompletar = 6 - ultimoDiaSemana;
        for (let i = 1; i <= diasParaCompletar; i++) {
          const fecha = new Date(ultimoDia);
          fecha.setDate(fecha.getDate() + i);
          dias.push(fecha.toISOString().split("T")[0]);
        }
        return dias;
      }
    });
    const eventosPorFecha = computed(() => {
      const mapa = /* @__PURE__ */ new Map();
      props.eventos.forEach((evento) => {
        const fecha = evento.fecha;
        if (!mapa.has(fecha)) {
          mapa.set(fecha, []);
        }
        mapa.get(fecha).push(evento);
      });
      mapa.forEach((eventos, fecha) => {
        eventos.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
      });
      return mapa;
    });
    const obtenerEventosEnSlot = (fecha, hora) => {
      const eventos = eventosPorFecha.value.get(fecha) || [];
      return eventos.filter((e) => e.horaInicio === hora);
    };
    const esFechaHoy = (fecha) => {
      const hoy = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      return fecha === hoy;
    };
    const esMesActual = (fecha) => {
      const fechaDate = /* @__PURE__ */ new Date(fecha + "T00:00:00");
      return fechaDate.getMonth() === props.fechaActual.getMonth() && fechaDate.getFullYear() === props.fechaActual.getFullYear();
    };
    const calcularAlturaEvento = (horaInicio, horaFin) => {
      try {
        const inicio = /* @__PURE__ */ new Date(`1970-01-01T${horaInicio}:00`);
        const fin = /* @__PURE__ */ new Date(`1970-01-01T${horaFin}:00`);
        const duracionMinutos = (fin.getTime() - inicio.getTime()) / 6e4;
        const alturaPorCelda = zoomLevel.value === "compact" ? 2.25 : zoomLevel.value === "normal" ? 3.5 : 5;
        const alturaPor30Min = alturaPorCelda;
        const alturaPorMinuto = alturaPor30Min / 30;
        const alturaCalculada = duracionMinutos * alturaPorMinuto;
        return `${alturaCalculada}rem`;
      } catch {
        return "2.5rem";
      }
    };
    const calcularTopEvento = (horaInicio, horaSlot) => {
      try {
        const inicio = /* @__PURE__ */ new Date(`1970-01-01T${horaInicio}:00`);
        const slot = /* @__PURE__ */ new Date(`1970-01-01T${horaSlot}:00`);
        const minutosDesdeSlot = (inicio.getTime() - slot.getTime()) / 6e4;
        if (minutosDesdeSlot <= 0) return "0";
        const alturaPorCelda = zoomLevel.value === "compact" ? 2.25 : zoomLevel.value === "normal" ? 3.5 : 5;
        const alturaPorMinuto = alturaPorCelda / 30;
        return `${minutosDesdeSlot * alturaPorMinuto}rem`;
      } catch {
        return "0";
      }
    };
    const scrollToCurrentTime = async () => {
      await nextTick();
      if (!gridContainer.value || props.cargando) return;
      const now = /* @__PURE__ */ new Date();
      const horaActual = `${String(now.getHours()).padStart(2, "0")}:${String(Math.floor(now.getMinutes() / 30) * 30).padStart(2, "0")}`;
      const indiceHora = HORAS_TRABAJO.findIndex((h) => h >= horaActual);
      if (indiceHora !== -1) {
        const alturaPromedio = zoomLevel.value === "compact" ? 40 : zoomLevel.value === "normal" ? 56 : 80;
        const scrollPosition = Math.max(0, (indiceHora - 2) * alturaPromedio);
        gridContainer.value.scrollTop = scrollPosition;
      }
    };
    const scrollToToday = async () => {
      await nextTick();
      if (props.vista !== "mes") return;
      const hoy = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const contenedorMes = (void 0).querySelector(".agenda-mes-grid");
      const diaActual = (void 0).querySelector(`[data-fecha="${hoy}"]`);
      if (diaActual && contenedorMes) {
        diaActual.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
    };
    const esCitaActiva = (eventoId) => {
      return citasActivas.value.has(eventoId);
    };
    watch([() => props.vista, () => props.cargando, zoomLevel], () => {
      if (!props.cargando) {
        setTimeout(() => {
          if (props.vista === "mes") {
            scrollToToday();
          } else {
            scrollToCurrentTime();
          }
        }, 100);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex-1 flex flex-col overflow-hidden bg-[#FFF9F6] dark:bg-gray-900" }, _attrs))} data-v-e146059a>`);
      if (__props.cargando) {
        _push(`<div class="flex items-center justify-center h-full" data-v-e146059a><div class="text-center space-y-3" data-v-e146059a><div class="w-12 h-12 border-4 border-terracota/20 border-t-terracota rounded-full animate-spin mx-auto" data-v-e146059a></div><p class="text-cafe/60 dark:text-gray-400" data-v-e146059a>Cargando agenda...</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!__props.cargando) {
        _push(`<div class="agenda-controls" data-v-e146059a><div class="leyenda-estados" data-v-e146059a><div class="estado" data-v-e146059a><span class="dot" data-color="pendiente" data-v-e146059a></span><span data-v-e146059a>Pendiente</span></div><div class="estado" data-v-e146059a><span class="dot" data-color="confirmada" data-v-e146059a></span><span data-v-e146059a>Confirmada</span></div><div class="estado" data-v-e146059a><span class="dot" data-color="realizada" data-v-e146059a></span><span data-v-e146059a>Realizada</span></div><div class="estado" data-v-e146059a><span class="dot" data-color="cancelada" data-v-e146059a></span><span data-v-e146059a>Cancelada</span></div></div><div class="zoom-toggle" data-v-e146059a><span class="text-xs text-cafe/60" data-v-e146059a>Zoom:</span><button class="${ssrRenderClass([
          "px-2 py-1 rounded-md transition-all",
          zoomLevel.value === "compact" ? "bg-terracota text-white" : "hover:bg-terracota/10"
        ])}" data-v-e146059a> Compacto </button><button class="${ssrRenderClass([
          "px-2 py-1 rounded-md transition-all",
          zoomLevel.value === "normal" ? "bg-terracota text-white" : "hover:bg-terracota/10"
        ])}" data-v-e146059a> Normal </button><button class="${ssrRenderClass([
          "px-2 py-1 rounded-md transition-all",
          zoomLevel.value === "comfortable" ? "bg-terracota text-white" : "hover:bg-terracota/10"
        ])}" data-v-e146059a> C\xF3modo </button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!__props.cargando && __props.vista === "dia") {
        _push(`<div class="agenda-container" data-v-e146059a><div class="agenda-grid-dia" data-v-e146059a>`);
        if (lineaTiempoVisible.value) {
          _push(`<div class="linea-tiempo-actual" style="${ssrRenderStyle({ top: lineaTiempoTop.value })}" data-v-e146059a><div class="circulo-tiempo" data-v-e146059a></div><div class="texto-tiempo" data-v-e146059a>${ssrInterpolate((/* @__PURE__ */ new Date()).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }))}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(HORAS_TRABAJO), (hora, idx) => {
          _push(`<div class="${ssrRenderClass([idx % 2 === 0 ? "bg-white" : "bg-[#FFFAF7]", "agenda-cell-dia"])}" style="${ssrRenderStyle({ minHeight: zoomLevel.value === "compact" ? "2.5rem" : zoomLevel.value === "normal" ? "3.5rem" : "5rem" })}" data-v-e146059a><div class="hora-dia" data-v-e146059a>${ssrInterpolate(hora)}</div><div class="eventos-container" data-v-e146059a><!--[-->`);
          ssrRenderList(obtenerEventosEnSlot(fechas.value[0], hora), (evento, idx2) => {
            _push(`<div class="${ssrRenderClass([{ "cita-activa": esCitaActiva(evento.id) }, "agenda-event-dia"])}"${ssrRenderAttr("data-estado", evento.estado)} style="${ssrRenderStyle({
              "--event-height": calcularAlturaEvento(evento.horaInicio, evento.horaFin)
            })}" data-v-e146059a><span class="hora" data-v-e146059a>${ssrInterpolate(evento.horaInicio)} - ${ssrInterpolate(evento.horaFin)}</span><span class="nombre" data-v-e146059a>${ssrInterpolate(evento.pacienteNombre)}</span>`);
            if (zoomLevel.value !== "compact") {
              _push(`<div class="info-extra" data-v-e146059a>`);
              if (evento.modalidad) {
                _push(`<span class="text-[10px]" data-v-e146059a>${ssrInterpolate(evento.modalidad === "online" ? "\u{1F4BB}" : "\u{1F3E5}")}</span>`);
              } else {
                _push(`<!---->`);
              }
              if (evento.areaTerapeutica) {
                _push(`<span class="text-[10px] text-cafe/60" data-v-e146059a>${ssrInterpolate(evento.areaTerapeutica)}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="tooltip" data-v-e146059a><div class="font-semibold" data-v-e146059a>${ssrInterpolate(evento.pacienteNombre)}</div><div data-v-e146059a>${ssrInterpolate(evento.horaInicio)} - ${ssrInterpolate(evento.horaFin)}</div>`);
            if (evento.modalidad) {
              _push(`<div data-v-e146059a>${ssrInterpolate(evento.modalidad === "online" ? "\u{1F4BB} Online" : "\u{1F3E5} Presencial")}</div>`);
            } else {
              _push(`<!---->`);
            }
            if (evento.areaTerapeutica) {
              _push(`<div class="text-[10px] opacity-80" data-v-e146059a>${ssrInterpolate(evento.areaTerapeutica)}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!__props.cargando && __props.vista === "semana") {
        _push(`<div class="agenda-container" data-v-e146059a><div class="agenda-days" data-v-e146059a><div class="col-span-1" data-v-e146059a></div><!--[-->`);
        ssrRenderList(fechas.value, (fecha) => {
          _push(`<div class="${ssrRenderClass([esFechaHoy(fecha) ? "bg-terracota/5 border-b-2 border-terracota" : "", "py-2 px-1"])}" data-v-e146059a><div class="text-xs font-medium text-cafe/70" data-v-e146059a>${ssrInterpolate(unref(formatearDiaSemana)(fecha).split(",")[0])}</div><div class="text-sm font-bold text-cafe" data-v-e146059a>${ssrInterpolate((/* @__PURE__ */ new Date(fecha + "T00:00:00")).getDate())}</div></div>`);
        });
        _push(`<!--]--></div><div class="agenda-grid" data-v-e146059a>`);
        if (lineaTiempoVisible.value) {
          _push(`<div class="linea-tiempo-actual" style="${ssrRenderStyle({ top: lineaTiempoTop.value, left: "0", right: "0", gridColumn: "1 / -1" })}" data-v-e146059a><div class="circulo-tiempo" data-v-e146059a></div><div class="texto-tiempo" data-v-e146059a>${ssrInterpolate((/* @__PURE__ */ new Date()).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }))}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(HORAS_TRABAJO), (hora, idx) => {
          _push(`<!--[--><div class="agenda-hours" data-v-e146059a>${ssrInterpolate(hora)}</div><!--[-->`);
          ssrRenderList(fechas.value, (fecha) => {
            _push(`<div class="${ssrRenderClass([idx % 2 === 0 ? "bg-white" : "bg-[#FFFAF7]", "agenda-cell"])}" data-v-e146059a><!--[-->`);
            ssrRenderList(obtenerEventosEnSlot(fecha, hora), (evento) => {
              _push(`<div class="${ssrRenderClass([{ "cita-activa": esCitaActiva(evento.id) }, "agenda-event"])}"${ssrRenderAttr("data-estado", evento.estado)} style="${ssrRenderStyle({
                "--event-height": calcularAlturaEvento(evento.horaInicio, evento.horaFin),
                "top": calcularTopEvento(evento.horaInicio, hora)
              })}" data-v-e146059a><span class="hora" data-v-e146059a>${ssrInterpolate(evento.horaInicio)} - ${ssrInterpolate(evento.horaFin)}</span><span class="nombre" data-v-e146059a>${ssrInterpolate(evento.pacienteNombre)}</span><div class="tooltip" data-v-e146059a><div class="font-semibold" data-v-e146059a>${ssrInterpolate(evento.pacienteNombre)}</div><div data-v-e146059a>${ssrInterpolate(evento.horaInicio)} - ${ssrInterpolate(evento.horaFin)}</div>`);
              if (evento.modalidad) {
                _push(`<div data-v-e146059a>${ssrInterpolate(evento.modalidad === "online" ? "\u{1F4BB} Online" : "\u{1F3E5} Presencial")}</div>`);
              } else {
                _push(`<!---->`);
              }
              if (evento.areaTerapeutica) {
                _push(`<div class="text-[10px] opacity-80" data-v-e146059a>${ssrInterpolate(evento.areaTerapeutica)}</div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div>`);
            });
            _push(`<!--]--></div>`);
          });
          _push(`<!--]--><!--]-->`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!__props.cargando && __props.vista === "mes") {
        _push(`<div class="agenda-mes-container" data-v-e146059a><div class="agenda-mes-grid" data-v-e146059a><!--[-->`);
        ssrRenderList(["Lun", "Mar", "Mi\xE9", "Jue", "Vie", "S\xE1b", "Dom"], (dia) => {
          _push(`<div class="agenda-mes-header" data-v-e146059a>${ssrInterpolate(dia)}</div>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(fechas.value, (fecha) => {
          _push(`<div${ssrRenderAttr("data-fecha", fecha)} class="${ssrRenderClass([[
            esFechaHoy(fecha) ? "dia-hoy" : "",
            !esMesActual(fecha) ? "dia-otro-mes" : ""
          ], "agenda-dia-mes"])}" data-v-e146059a><div class="agenda-dia-header" data-v-e146059a><span class="dia-numero" data-v-e146059a>${ssrInterpolate((/* @__PURE__ */ new Date(fecha + "T00:00:00")).getDate())}</span><div class="flex items-center gap-1" data-v-e146059a>`);
          if ((eventosPorFecha.value.get(fecha) || []).length > 0) {
            _push(`<span class="contador-citas"${ssrRenderAttr("title", `${(eventosPorFecha.value.get(fecha) || []).length} cita${(eventosPorFecha.value.get(fecha) || []).length > 1 ? "s" : ""}`)} data-v-e146059a>${ssrInterpolate((eventosPorFecha.value.get(fecha) || []).length)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (esFechaHoy(fecha)) {
            _push(`<span class="dia-hoy-badge" data-v-e146059a>Hoy</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="agenda-dia-eventos" data-v-e146059a><!--[-->`);
          ssrRenderList((eventosPorFecha.value.get(fecha) || []).slice(0, 2), (evento) => {
            _push(ssrRenderComponent(AgendaEventCard, {
              key: evento.id,
              event: evento,
              compact: true,
              onOpen: ($event) => _ctx.$emit("evento-click", evento.id)
            }, null, _parent));
          });
          _push(`<!--]-->`);
          if ((eventosPorFecha.value.get(fecha) || []).length > 2) {
            _push(`<button class="mas-eventos"${ssrRenderAttr("title", `Ver todas las ${(eventosPorFecha.value.get(fecha) || []).length} citas de este d\xEDa`)} data-v-e146059a> +${ssrInterpolate((eventosPorFecha.value.get(fecha) || []).length - 2)} m\xE1s </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/agenda/AgendaGrid.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const AgendaGrid = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-e146059a"]]), { __name: "AgendaGrid" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  props: {
    legacyFallback: { type: Boolean }
  },
  setup(__props) {
    useRoute();
    useRouter();
    const {
      getCitasRango
    } = useCitas();
    const citasAgenda = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const vista = ref("semana");
    const fechaActual = ref(/* @__PURE__ */ new Date());
    const darkMode = ref(false);
    const filtros = ref({});
    const busqueda = ref("");
    const mostrarModalNueva = ref(false);
    const mostrarModalDetalles = ref(false);
    const citaSeleccionada = ref(null);
    const slotSeleccionado = ref(null);
    const menuVisible = ref(false);
    const menuPosicion = ref({ x: 0, y: 0 });
    const eventoMenu = ref(null);
    const eventosMapeados = computed(() => {
      var _a;
      if (!((_a = citasAgenda.value) == null ? void 0 : _a.length)) return [];
      return citasAgenda.value.map((cita) => {
        var _a2, _b;
        return {
          id: cita.cita_id || cita.id,
          pacienteNombre: cita.paciente_nombre || "Sin paciente",
          pacienteId: cita.paciente_id,
          estado: cita.estado,
          fecha: cita.fecha_cita,
          horaInicio: ((_a2 = cita.hora_inicio) == null ? void 0 : _a2.substring(0, 5)) || cita.hora_inicio,
          // Normalizar HH:MM:SS a HH:MM
          horaFin: ((_b = cita.hora_fin) == null ? void 0 : _b.substring(0, 5)) || cita.hora_fin,
          modalidad: cita.modalidad,
          bono: cita.bono_id ? {
            id: cita.bono_id,
            sesionesRestantes: cita.bono_sesiones_restantes,
            sesionesTotales: cita.bono_sesiones_totales
          } : null,
          terapeuta: cita.terapeuta_id ? {
            id: cita.terapeuta_id,
            nombre: cita.terapeuta_nombre
          } : void 0,
          notas: cita.observaciones || void 0,
          areaTerapeutica: cita.paciente_area || void 0,
          tipoSesion: cita.tipo_sesion || void 0
        };
      });
    });
    const eventosFiltrados = computed(() => {
      var _a;
      let eventos = eventosMapeados.value;
      if (busqueda.value.trim()) {
        const query = busqueda.value.toLowerCase();
        eventos = eventos.filter(
          (e) => {
            var _a2, _b;
            return e.pacienteNombre.toLowerCase().includes(query) || ((_a2 = e.terapeuta) == null ? void 0 : _a2.nombre.toLowerCase().includes(query)) || ((_b = e.notas) == null ? void 0 : _b.toLowerCase().includes(query));
          }
        );
      }
      if ((_a = filtros.value.estados) == null ? void 0 : _a.length) {
        eventos = eventos.filter((e) => filtros.value.estados.includes(e.estado));
      }
      if (filtros.value.terapeutaId) {
        eventos = eventos.filter((e) => {
          var _a2;
          return ((_a2 = e.terapeuta) == null ? void 0 : _a2.id) === filtros.value.terapeutaId;
        });
      }
      if (filtros.value.pacienteId) {
        eventos = eventos.filter((e) => e.pacienteId === filtros.value.pacienteId);
      }
      if (filtros.value.modalidad) {
        eventos = eventos.filter((e) => e.modalidad === filtros.value.modalidad);
      }
      if (filtros.value.fechaDesde) {
        eventos = eventos.filter((e) => e.fecha >= filtros.value.fechaDesde);
      }
      if (filtros.value.fechaHasta) {
        eventos = eventos.filter((e) => e.fecha <= filtros.value.fechaHasta);
      }
      return eventos;
    });
    const terapeutas = computed(() => {
      return [];
    });
    const pacientes = computed(() => {
      var _a;
      const uniquePacientes = /* @__PURE__ */ new Map();
      (_a = citasAgenda.value) == null ? void 0 : _a.forEach((cita) => {
        if (cita.paciente_id) {
          uniquePacientes.set(cita.paciente_id, {
            id: cita.paciente_id,
            nombre: cita.paciente_nombre || "Sin nombre"
          });
        }
      });
      return Array.from(uniquePacientes.values());
    });
    const cargarCitas = async () => {
      try {
        loading.value = true;
        error.value = null;
        const hoy2 = /* @__PURE__ */ new Date();
        let fechaInicio;
        let fechaFin;
        if (vista.value === "dia") {
          fechaInicio = fechaFin = fechaActual.value.toISOString().split("T")[0];
        } else if (vista.value === "semana") {
          const inicioSemana2 = new Date(fechaActual.value);
          inicioSemana2.setDate(inicioSemana2.getDate() - inicioSemana2.getDay());
          fechaInicio = inicioSemana2.toISOString().split("T")[0];
          const finSemana = new Date(inicioSemana2);
          finSemana.setDate(finSemana.getDate() + 6);
          fechaFin = finSemana.toISOString().split("T")[0];
        } else {
          const inicioMes = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth(), 1);
          const finMes = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth() + 1, 0);
          fechaInicio = inicioMes.toISOString().split("T")[0];
          fechaFin = finMes.toISOString().split("T")[0];
        }
        const citas = await getCitasRango(fechaInicio, fechaFin);
        citasAgenda.value = citas.filter(
          (cita) => cita.estado !== "cancelada" && cita.estado !== "borrador" && cita.estado !== null
        );
      } catch (err) {
        console.error("\u274C Error al cargar citas:", err);
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };
    watch(vista, (newVista) => {
      cargarCitas();
    });
    watch(fechaActual, () => {
      cargarCitas();
    });
    watch(fechaActual, (newFecha) => {
    });
    watch(darkMode, (newDarkMode) => {
    });
    watch(filtros, (newFiltros) => {
    }, { deep: true });
    const abrirModalNuevaCita = () => {
      slotSeleccionado.value = null;
      mostrarModalNueva.value = true;
    };
    const crearCitaEnSlot = (slot) => {
      const slotOcupado = eventosFiltrados.value.some(
        (evento) => evento.fecha === slot.date && evento.horaInicio === slot.horaInicio
      );
      if (slotOcupado) {
        return;
      }
      slotSeleccionado.value = slot;
      mostrarModalNueva.value = true;
    };
    const abrirDetalles = (eventoId) => {
      citaSeleccionada.value = eventoId;
      mostrarModalDetalles.value = true;
    };
    const abrirMenu = (eventoId, event) => {
      eventoMenu.value = eventoId;
      menuPosicion.value = { x: event.clientX, y: event.clientY };
      menuVisible.value = true;
    };
    const moverCita = async (eventoId, nuevoSlot) => {
      try {
        console.log("Reprogramar cita:", eventoId, nuevoSlot);
        await cargarCitas();
      } catch (error2) {
        console.error("Error al reprogramar cita:", error2);
        alert("No se pudo reprogramar la cita. Intenta nuevamente.");
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-644cee40>`);
      if (__props.legacyFallback) {
        _push(ssrRenderComponent(__nuxt_component_0, null, null, _parent));
      } else {
        _push(`<div class="${ssrRenderClass([{ "dark": darkMode.value }, "h-screen flex flex-col overflow-hidden bg-[#FFF9F6] dark:bg-gray-950"])}" data-v-644cee40>`);
        _push(ssrRenderComponent(AgendaHeader, {
          vista: vista.value,
          "onUpdate:vista": ($event) => vista.value = $event,
          fechaActual: fechaActual.value,
          "onUpdate:fechaActual": ($event) => fechaActual.value = $event,
          darkMode: darkMode.value,
          "onUpdate:darkMode": ($event) => darkMode.value = $event,
          onNuevaCita: abrirModalNuevaCita
        }, null, _parent));
        _push(ssrRenderComponent(AgendaFilters, {
          filtros: filtros.value,
          "onUpdate:filtros": ($event) => filtros.value = $event,
          "onUpdate:busqueda": ($event) => busqueda.value = $event,
          terapeutas: terapeutas.value,
          pacientes: pacientes.value
        }, null, _parent));
        _push(`<div class="px-4 py-2 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm border-b border-cafe/5 dark:border-gray-800" data-v-644cee40>`);
        _push(ssrRenderComponent(AgendaLegend, null, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(AgendaGrid, {
          eventos: eventosFiltrados.value,
          vista: vista.value,
          fechaActual: fechaActual.value,
          cargando: loading.value,
          draggable: true,
          onEventoClick: abrirDetalles,
          onEventoMenu: abrirMenu,
          onSlotClick: crearCitaEnSlot,
          onEventoDrop: moverCita
        }, null, _parent));
        _push(ssrRenderComponent(__nuxt_component_2, {
          modelValue: mostrarModalNueva.value,
          "onUpdate:modelValue": ($event) => mostrarModalNueva.value = $event,
          "fecha-inicial": (_a = slotSeleccionado.value) == null ? void 0 : _a.date,
          "hora-inicial": (_b = slotSeleccionado.value) == null ? void 0 : _b.horaInicio,
          onGuardado: cargarCitas
        }, null, _parent));
        _push(ssrRenderComponent(ModalDetallesCita, {
          isOpen: mostrarModalDetalles.value,
          citaId: citaSeleccionada.value,
          onClose: ($event) => {
            mostrarModalDetalles.value = false;
            citaSeleccionada.value = null;
          },
          onActualizado: cargarCitas,
          onEliminado: cargarCitas
        }, null, _parent));
        ssrRenderTeleport(_push, (_push2) => {
          if (menuVisible.value) {
            _push2(`<div style="${ssrRenderStyle({ top: `${menuPosicion.value.y}px`, left: `${menuPosicion.value.x}px` })}" class="fixed z-50 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px]" data-v-644cee40><button class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition" data-v-644cee40> Ver detalles </button><button class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition" data-v-644cee40> Reprogramar </button><button class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition text-red-600" data-v-644cee40> Cancelar cita </button></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        _push(`<div class="fixed bottom-4 right-4 bg-gray-900/90 dark:bg-gray-100/90 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-xs opacity-0 hover:opacity-100 transition-opacity" data-v-644cee40><kbd data-v-644cee40>j/k</kbd> navegar \xB7 <kbd data-v-644cee40>t</kbd> hoy \xB7 <kbd data-v-644cee40>1/2/3</kbd> vistas \xB7 <kbd data-v-644cee40>n</kbd> nueva \xB7 <kbd data-v-644cee40>f</kbd> buscar </div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/agenda/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-644cee40"]]);

export { index as default };
//# sourceMappingURL=index-zH4ko6Cv.mjs.map
