import { ref, computed, mergeProps, unref, defineComponent, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass, ssrRenderComponent, ssrRenderStyle } from 'vue/server-renderer';
import { g as useSupabaseClient, a as useRouter } from './server.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BonosPaciente",
  __ssrInlineRender: true,
  props: {
    pacienteId: {}
  },
  emits: ["renovar-bono", "ver-detalles", "crear-bono", "confirmar-pago", "revertir-pago"],
  setup(__props) {
    const props = __props;
    const supabase = useSupabaseClient();
    const bonos = ref([]);
    const loading = ref(true);
    const mostrarHistorial = ref(false);
    const bonosActivos = computed(() => {
      return bonos.value.filter(
        (bono) => (bono.estado === "activo" || bono.estado === "pendiente") && bono.sesiones_restantes > 0
      );
    });
    const bonosFinalizados = computed(() => {
      return bonos.value.filter(
        (bono) => bono.estado === "finalizado" || bono.estado === "cancelado" || bono.sesiones_restantes === 0
      );
    });
    const cargarBonos = async () => {
      loading.value = true;
      try {
        const { data, error } = await supabase.from("bonos").select("*").eq("paciente_id", props.pacienteId).order("created_at", { ascending: false });
        if (error) throw error;
        bonos.value = data || [];
      } catch (err) {
        console.error("Error al cargar bonos:", err);
      } finally {
        loading.value = false;
      }
    };
    watch(() => props.pacienteId, () => {
      if (props.pacienteId) {
        cargarBonos();
      }
    }, { immediate: false });
    const getBonoCantidadSesiones = (bono) => {
      const cantidad = bono.sesiones_totales || 0;
      if (cantidad === 1) return "Bono de 1 sesi\xF3n";
      if (cantidad <= 4) return `Bono de ${cantidad} sesiones`;
      if (cantidad <= 8) return `Bono Semanal (${cantidad} sesiones)`;
      return `Bono Quincenal (${cantidad} sesiones)`;
    };
    const calcularSesionesRestantes = (bono) => {
      return bono.sesiones_restantes || 0;
    };
    const calcularPorcentajeProgreso = (bono) => {
      const total = bono.sesiones_totales || 0;
      const restantes = bono.sesiones_restantes || 0;
      const usadas = total - restantes;
      if (total === 0) return 0;
      return Math.round(usadas / total * 100);
    };
    const estaProximoAgotar = (bono) => {
      const restantes = bono.sesiones_restantes || 0;
      const activo = bono.estado === "activo" || bono.estado === "pendiente";
      return activo && restantes > 0 && restantes <= 2;
    };
    const getEstadoLabel = (bono) => {
      if (bono.estado === "finalizado" || bono.estado === "cancelado") return "Finalizado";
      if (bono.sesiones_restantes === 0) return "Agotado";
      if (estaProximoAgotar(bono)) return "Por agotar";
      if (bono.estado === "pendiente") return "Pendiente";
      return "Activo";
    };
    const getEstadoBadgeClasses = (bono) => {
      const estado = getEstadoLabel(bono);
      if (estado === "Activo") {
        return "bg-green-100 text-green-700";
      } else if (estado === "Por agotar") {
        return "bg-yellow-100 text-yellow-700";
      } else if (estado === "Pendiente") {
        return "bg-blue-100 text-blue-700";
      } else if (estado === "Agotado" || estado === "Finalizado") {
        return "bg-gray-100 text-gray-600";
      }
      return "bg-blue-100 text-blue-700";
    };
    const getProgressColorClass = (bono) => {
      const porcentaje = calcularPorcentajeProgreso(bono);
      if (porcentaje >= 80) return "bg-gradient-to-r from-red-400 to-red-600";
      if (porcentaje >= 50) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      return "bg-gradient-to-r from-green-400 to-green-600";
    };
    const formatearPrecio = (precio) => {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
      }).format(precio || 0);
    };
    const formatearFecha = (fecha) => {
      if (!fecha) return "Sin fecha";
      return new Date(fecha).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-gradient-to-br from-white to-cafe/5 rounded-2xl p-6 md:p-8 shadow-lg border border-cafe/10 space-y-6 transition-all duration-300" }, _attrs))} data-v-be9820b5><div class="border-b border-cafe/10 pb-5" data-v-be9820b5><div class="flex items-center gap-3 mb-2" data-v-be9820b5><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-terracota/20 to-terracota/10 flex items-center justify-center" data-v-be9820b5><span class="text-xl" data-v-be9820b5>\u{1F3AB}</span></div><h3 class="font-serif text-2xl font-bold text-cafe" data-v-be9820b5>Bonos del Paciente</h3></div><p class="text-sm text-cafe/60 ml-13" data-v-be9820b5>Gesti\xF3n y seguimiento de sesiones contratadas</p></div>`);
      if (loading.value) {
        _push(`<div class="text-center py-16" data-v-be9820b5><div class="relative inline-block" data-v-be9820b5><div class="w-12 h-12 border-4 border-terracota/20 border-t-terracota rounded-full animate-spin" data-v-be9820b5></div><div class="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-cafe/20 rounded-full animate-spin" style="${ssrRenderStyle({ "animation-duration": "1.5s", "animation-direction": "reverse" })}" data-v-be9820b5></div></div><p class="mt-4 text-sm text-cafe/60 font-medium" data-v-be9820b5>Cargando informaci\xF3n de bonos...</p></div>`);
      } else if (bonosActivos.value.length > 0) {
        _push(`<div class="space-y-4" data-v-be9820b5><div class="flex items-center justify-between mb-2" data-v-be9820b5><h4 class="text-sm font-semibold text-cafe/70 uppercase tracking-wider" data-v-be9820b5>Bonos Activos</h4><span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full" data-v-be9820b5>${ssrInterpolate(bonosActivos.value.length)} ${ssrInterpolate(bonosActivos.value.length === 1 ? "bono" : "bonos")}</span></div><div class="grid grid-cols-1 gap-4" data-v-be9820b5><!--[-->`);
        ssrRenderList(bonosActivos.value, (bono) => {
          _push(`<div class="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-cafe/10 overflow-hidden" data-v-be9820b5><div class="bg-gradient-to-r from-terracota/5 via-white to-terracota/5 px-6 py-4 border-b border-cafe/5" data-v-be9820b5><div class="flex items-start justify-between gap-4" data-v-be9820b5><div class="flex-1" data-v-be9820b5><div class="flex items-center gap-3 mb-2" data-v-be9820b5><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-terracota to-terracota/80 flex items-center justify-center shadow-sm" data-v-be9820b5><span class="text-white text-lg" data-v-be9820b5>\u{1F39F}\uFE0F</span></div><div data-v-be9820b5><h5 class="text-base font-bold text-cafe" data-v-be9820b5>${ssrInterpolate(getBonoCantidadSesiones(bono))}</h5><p class="text-xs text-cafe/60 flex items-center gap-1.5" data-v-be9820b5><span data-v-be9820b5>\u{1F4C5}</span><span data-v-be9820b5>Creado ${ssrInterpolate(formatearFecha(bono.created_at))}</span></p></div></div></div><div class="flex flex-col items-end gap-2" data-v-be9820b5><span class="${ssrRenderClass([getEstadoBadgeClasses(bono), "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm backdrop-blur-sm transition-all duration-200"])}" data-v-be9820b5>${ssrInterpolate(getEstadoLabel(bono))}</span>`);
          if (!bono.pagado) {
            _push(`<span class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border border-orange-200 animate-pulse" title="Pendiente de confirmaci\xF3n de pago" data-v-be9820b5> \u{1F4B3} Sin pagar </span>`);
          } else {
            _push(`<span class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"${ssrRenderAttr("title", `Pagado el ${formatearFecha(bono.fecha_pago)}`)} data-v-be9820b5> \u2713 Pagado </span>`);
          }
          _push(`</div></div></div><div class="px-6 py-5 space-y-5" data-v-be9820b5><div class="bg-gradient-to-br from-cafe/5 to-transparent rounded-xl p-4 space-y-3 border border-cafe/5" data-v-be9820b5><div class="flex justify-between items-center" data-v-be9820b5><span class="text-sm text-cafe/70 flex items-center gap-2" data-v-be9820b5><span class="w-6 h-6 rounded-lg bg-cafe/10 flex items-center justify-center text-xs" data-v-be9820b5>\u{1F4CA}</span> Total de sesiones </span><span class="font-bold text-cafe text-lg" data-v-be9820b5>${ssrInterpolate(bono.sesiones_totales || 0)}</span></div><div class="flex justify-between items-center" data-v-be9820b5><span class="text-sm text-cafe/70 flex items-center gap-2" data-v-be9820b5><span class="w-6 h-6 rounded-lg bg-terracota/10 flex items-center justify-center text-xs" data-v-be9820b5>\u2713</span> Sesiones usadas </span><span class="font-bold text-terracota text-lg" data-v-be9820b5>${ssrInterpolate((bono.sesiones_totales || 0) - (bono.sesiones_restantes || 0))}</span></div><div class="flex justify-between items-center" data-v-be9820b5><span class="text-sm text-cafe/70 flex items-center gap-2" data-v-be9820b5><span class="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center text-xs" data-v-be9820b5>\u23F3</span> Sesiones restantes </span><span class="font-bold text-green-700 text-lg" data-v-be9820b5>${ssrInterpolate(bono.sesiones_restantes || 0)}</span></div><div class="pt-3 border-t border-cafe/10" data-v-be9820b5><div class="flex justify-between items-center" data-v-be9820b5><span class="text-sm text-cafe/70 flex items-center gap-2" data-v-be9820b5><span class="w-6 h-6 rounded-lg bg-cafe/10 flex items-center justify-center text-xs" data-v-be9820b5>\u{1F4B0}</span> Precio total </span><span class="font-bold text-cafe text-lg" data-v-be9820b5>${ssrInterpolate(formatearPrecio(bono.monto_total))}</span></div><div class="flex justify-between items-center mt-2" data-v-be9820b5><span class="text-xs text-cafe/60 pl-8" data-v-be9820b5>Precio por sesi\xF3n</span><span class="text-sm text-cafe/80 font-medium" data-v-be9820b5>${ssrInterpolate(formatearPrecio((bono.monto_total || 0) / (bono.sesiones_totales || 1)))}</span></div></div></div><div class="space-y-2" data-v-be9820b5><div class="flex justify-between items-center text-xs" data-v-be9820b5><span class="text-cafe/70 font-medium" data-v-be9820b5>Progreso de sesiones</span><span class="text-cafe font-bold" data-v-be9820b5>${ssrInterpolate(calcularPorcentajeProgreso(bono))}%</span></div><div class="relative h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner" data-v-be9820b5><div class="${ssrRenderClass([getProgressColorClass(bono), "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out shadow-sm"])}" style="${ssrRenderStyle({ width: `${calcularPorcentajeProgreso(bono)}%` })}" data-v-be9820b5><div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" data-v-be9820b5></div></div></div></div><div class="space-y-3" data-v-be9820b5>`);
          if (estaProximoAgotar(bono)) {
            _push(`<div class="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-r-xl p-4 flex items-start gap-3 shadow-sm" data-v-be9820b5><div class="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center flex-shrink-0 shadow-sm" data-v-be9820b5><span class="text-white text-lg" data-v-be9820b5>\u26A0\uFE0F</span></div><div class="flex-1" data-v-be9820b5><p class="text-sm font-bold text-yellow-900 mb-1" data-v-be9820b5>Bono pr\xF3ximo a agotar</p><p class="text-xs text-yellow-800" data-v-be9820b5> Quedan <span class="font-bold" data-v-be9820b5>${ssrInterpolate(calcularSesionesRestantes(bono))}</span> sesiones disponibles </p></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (!bono.pagado && (bono.estado === "activo" || bono.estado === "pendiente")) {
            _push(`<div class="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-r-xl p-4 flex items-start gap-3 shadow-sm" data-v-be9820b5><div class="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm" data-v-be9820b5><span class="text-white text-lg" data-v-be9820b5>\u{1F4B3}</span></div><div class="flex-1" data-v-be9820b5><p class="text-sm font-bold text-orange-900 mb-1" data-v-be9820b5>Pendiente de pago</p><p class="text-xs text-orange-800" data-v-be9820b5> Este bono a\xFAn no ha sido pagado. El paciente puede usar las sesiones y pagar al final, o confirma el pago ahora. </p></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="space-y-3 pt-2" data-v-be9820b5>`);
          if (!bono.pagado) {
            _push(`<div class="grid grid-cols-2 gap-3" data-v-be9820b5><button class="group bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 col-span-2" data-v-be9820b5><span class="text-base group-hover:scale-110 transition-transform duration-300" data-v-be9820b5>\u{1F4B3}</span><span data-v-be9820b5>Confirmar pago</span></button></div>`);
          } else {
            _push(`<div class="grid grid-cols-2 gap-3" data-v-be9820b5><button class="group bg-gradient-to-r from-terracota to-orange-500 text-white hover:from-terracota/90 hover:to-orange-600 rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2" data-v-be9820b5><span class="text-base group-hover:rotate-180 transition-transform duration-500" data-v-be9820b5>\u{1F504}</span><span data-v-be9820b5>Renovar</span></button><button class="group bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2" title="Desmarcar como pagado (en caso de error)" data-v-be9820b5><span class="text-base group-hover:scale-110 transition-transform duration-300" data-v-be9820b5>\u21A9\uFE0F</span><span data-v-be9820b5>Revertir pago</span></button></div>`);
          }
          _push(`<div class="grid grid-cols-1" data-v-be9820b5><button class="group bg-cafe/10 text-cafe hover:bg-cafe/20 rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-300 border border-cafe/20 hover:border-cafe/40 flex items-center justify-center gap-2" data-v-be9820b5><span class="text-base group-hover:scale-110 transition-transform duration-300" data-v-be9820b5>\u{1F441}\uFE0F</span><span data-v-be9820b5>Ver detalles</span></button></div></div></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<div class="text-center bg-gradient-to-br from-white to-gray-50 rounded-2xl py-16 px-6 border-2 border-dashed border-cafe/20" data-v-be9820b5><div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-terracota/10 to-terracota/5 flex items-center justify-center" data-v-be9820b5><span class="text-5xl" data-v-be9820b5>\u{1F3AB}</span></div><h4 class="text-xl font-bold text-cafe mb-3" data-v-be9820b5>No hay bonos activos</h4><p class="text-sm text-cafe/60 mb-6 max-w-sm mx-auto" data-v-be9820b5> Este paciente no tiene bonos registrados en este momento. Puedes crear uno nuevo para comenzar. </p><button class="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-terracota to-orange-500 text-white rounded-xl hover:from-terracota/90 hover:to-orange-600 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-1" data-v-be9820b5><span class="group-hover:rotate-90 transition-transform duration-300" data-v-be9820b5>\u2795</span><span data-v-be9820b5>Crear Nuevo Bono</span></button></div>`);
      }
      if (!loading.value && bonosFinalizados.value.length > 0) {
        _push(`<div class="pt-8 border-t border-cafe/10" data-v-be9820b5><button class="group flex items-center justify-between w-full text-left bg-gradient-to-r from-cafe/5 to-transparent hover:from-cafe/10 rounded-xl px-5 py-4 transition-all duration-300" data-v-be9820b5><div class="flex items-center gap-3" data-v-be9820b5><div class="w-8 h-8 rounded-lg bg-cafe/10 flex items-center justify-center" data-v-be9820b5><span class="text-sm" data-v-be9820b5>\u{1F4E6}</span></div><div data-v-be9820b5><span class="font-bold text-cafe text-sm" data-v-be9820b5>Historial de bonos finalizados</span><span class="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold" data-v-be9820b5>${ssrInterpolate(bonosFinalizados.value.length)}</span></div></div><span class="${ssrRenderClass([{ "rotate-180": mostrarHistorial.value }, "text-lg transition-transform duration-300 text-cafe/60 group-hover:text-cafe"])}" data-v-be9820b5> \u25BC </span></button><div class="mt-4 space-y-3 animate-fadeIn" style="${ssrRenderStyle(mostrarHistorial.value ? null : { display: "none" })}" data-v-be9820b5><!--[-->`);
        ssrRenderList(bonosFinalizados.value, (bono) => {
          _push(`<div class="group bg-white border border-gray-200 hover:border-cafe/30 rounded-xl p-5 transition-all duration-300 hover:shadow-md" data-v-be9820b5><div class="flex items-start justify-between gap-4" data-v-be9820b5><div class="flex-1" data-v-be9820b5><div class="flex items-center gap-2 mb-2" data-v-be9820b5><div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center" data-v-be9820b5><span class="text-sm" data-v-be9820b5>\u{1F3C1}</span></div><p class="text-sm font-bold text-cafe" data-v-be9820b5>${ssrInterpolate(getBonoCantidadSesiones(bono))}</p></div><p class="text-xs text-cafe/60 mb-1 flex items-center gap-1.5" data-v-be9820b5><span data-v-be9820b5>\u{1F4C5}</span><span data-v-be9820b5>Finalizado el ${ssrInterpolate(formatearFecha(bono.updated_at))}</span></p><div class="flex items-center gap-4 mt-3" data-v-be9820b5><div class="flex items-center gap-1.5 text-xs" data-v-be9820b5><span class="text-cafe/60" data-v-be9820b5>Sesiones:</span><span class="font-bold text-cafe" data-v-be9820b5>${ssrInterpolate((bono.sesiones_totales || 0) - (bono.sesiones_restantes || 0))} / ${ssrInterpolate(bono.sesiones_totales || 0)}</span></div><div class="flex items-center gap-1.5 text-xs" data-v-be9820b5><span class="text-cafe/60" data-v-be9820b5>Monto:</span><span class="font-bold text-cafe" data-v-be9820b5>${ssrInterpolate(formatearPrecio(bono.monto_total))}</span></div></div></div><span class="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wide" data-v-be9820b5> Finalizado </span></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BonosPaciente.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-be9820b5"]]), { __name: "BonosPaciente" });
const itemsPorPagina = 12;
const _sfc_main = {
  __name: "pacientes-old",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    useRouter();
    const cargando = ref(true);
    const pacientes = ref([]);
    const terapeutas = ref([]);
    const busqueda = ref("");
    const filtroEstado = ref("");
    const filtroTerapeuta = ref("");
    const ordenarPor = ref("nombre");
    const paginaActual = ref(1);
    const panelAbierto = ref(false);
    const pacienteSeleccionado = ref(null);
    ref(null);
    const bonosKey = ref(0);
    const totalPacientes = computed(() => pacientes.value.length);
    const pacientesActivos = computed(
      () => pacientes.value.filter((p) => p.estado === "activo" || p.activo).length
    );
    const promedioPorTerapeuta = computed(() => {
      if (terapeutas.value.length === 0) return 0;
      return Math.round(totalPacientes.value / terapeutas.value.length);
    });
    const bonosActivos = computed(
      () => pacientes.value.filter((p) => p.bono_activo && p.bono_activo.sesiones_restantes > 0).length
    );
    const pacientesFiltrados = computed(() => {
      let resultado = [...pacientes.value];
      if (busqueda.value.trim()) {
        const query = busqueda.value.toLowerCase();
        resultado = resultado.filter(
          (p) => {
            var _a, _b, _c, _d;
            return ((_a = p.nombre_completo) == null ? void 0 : _a.toLowerCase().includes(query)) || ((_b = p.email) == null ? void 0 : _b.toLowerCase().includes(query)) || ((_c = p.telefono) == null ? void 0 : _c.includes(query)) || ((_d = p.terapeuta_nombre) == null ? void 0 : _d.toLowerCase().includes(query));
          }
        );
      }
      if (filtroEstado.value === "activo") {
        resultado = resultado.filter((p) => p.estado === "activo" || p.activo);
      } else if (filtroEstado.value === "inactivo") {
        resultado = resultado.filter((p) => p.estado === "inactivo" || !p.activo);
      } else if (filtroEstado.value === "pausa") {
        resultado = resultado.filter((p) => p.estado === "pausa");
      }
      if (filtroTerapeuta.value) {
        resultado = resultado.filter((p) => p.terapeuta_id === filtroTerapeuta.value);
      }
      if (ordenarPor.value === "nombre") {
        resultado.sort(
          (a, b) => (a.nombre_completo || "").localeCompare(b.nombre_completo || "")
        );
      } else if (ordenarPor.value === "fecha") {
        resultado.sort((a, b) => {
          const fechaA = a.ultima_cita ? new Date(a.ultima_cita) : /* @__PURE__ */ new Date(0);
          const fechaB = b.ultima_cita ? new Date(b.ultima_cita) : /* @__PURE__ */ new Date(0);
          return fechaB - fechaA;
        });
      } else if (ordenarPor.value === "citas") {
        resultado.sort((a, b) => (b.total_citas || 0) - (a.total_citas || 0));
      }
      const inicio = (paginaActual.value - 1) * itemsPorPagina;
      const fin = inicio + itemsPorPagina;
      return resultado.slice(inicio, fin);
    });
    const totalPaginas = computed(() => {
      const total = pacientes.value.length;
      return Math.ceil(total / itemsPorPagina);
    });
    const obtenerIniciales = (nombre) => {
      if (!nombre) return "PA";
      return nombre.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
    };
    const formatearFecha = (fecha) => {
      if (!fecha) return "Sin registro";
      const date = new Date(fecha);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    };
    const getEstadoClasses = (estado) => {
      const estadoNormalizado = (estado == null ? void 0 : estado.toLowerCase()) || "inactivo";
      if (estadoNormalizado === "activo") {
        return "bg-green-100 text-green-700";
      } else if (estadoNormalizado === "pausa" || estadoNormalizado === "en pausa") {
        return "bg-yellow-100 text-yellow-700";
      } else {
        return "bg-gray-100 text-gray-700";
      }
    };
    const getEstadoLabel = (estado) => {
      const estadoNormalizado = (estado == null ? void 0 : estado.toLowerCase()) || "inactivo";
      if (estadoNormalizado === "activo") return "Activo";
      if (estadoNormalizado === "pausa" || estadoNormalizado === "en pausa") return "En pausa";
      return "Inactivo";
    };
    const handleRenovarBono = (bono) => {
      console.log("Renovar bono:", bono);
      alert(`Funcionalidad de renovaci\xF3n de bono pr\xF3ximamente disponible`);
    };
    const handleVerDetallesBono = (bono) => {
      console.log("Ver detalles de bono:", bono);
      alert(`Detalles del bono: ${bono.sesiones_totales} sesiones - ${bono.sesiones_usadas} usadas`);
    };
    const handleCrearBono = () => {
      console.log("Crear nuevo bono para:", pacienteSeleccionado.value);
      alert(`Funcionalidad de creaci\xF3n de bono pr\xF3ximamente disponible`);
    };
    const handleConfirmarPago = async (bono) => {
      var _a;
      console.log("Confirmar pago de bono:", bono);
      const metodoPago = prompt(
        "M\xE9todo de pago:\n1. Transferencia\n2. Tarjeta\n3. Efectivo\n4. Bizum\n5. PayPal\n6. Otro\n\nIngrese el n\xFAmero del m\xE9todo:",
        "1"
      );
      if (!metodoPago) return;
      const metodos = {
        "1": "transferencia",
        "2": "tarjeta",
        "3": "efectivo",
        "4": "bizum",
        "5": "paypal",
        "6": "otro"
      };
      const metodoSeleccionado = metodos[metodoPago] || "transferencia";
      try {
        const { data, error } = await supabase.rpc("confirmar_pago_bono", {
          p_bono_id: bono.id,
          p_metodo_pago: metodoSeleccionado
        });
        if (error) throw error;
        if (data && data.success) {
          alert(`\u2705 Pago confirmado correctamente

M\xE9todo: ${metodoSeleccionado}
Fecha: ${(/* @__PURE__ */ new Date()).toLocaleDateString("es-ES")}`);
          bonosKey.value++;
          if ((_a = pacienteSeleccionado.value) == null ? void 0 : _a.id) {
            await cargarDetallesPaciente(pacienteSeleccionado.value);
          }
        } else {
          alert(`\u274C Error: ${(data == null ? void 0 : data.error) || "No se pudo confirmar el pago"}`);
        }
      } catch (err) {
        console.error("Error al confirmar pago:", err);
        alert(`\u274C Error al confirmar el pago: ${err.message}`);
      }
    };
    const handleRevertirPago = async (bono) => {
      var _a;
      console.log("Revertir pago de bono:", bono);
      const confirmacion = confirm(
        `\u26A0\uFE0F \xBFEst\xE1s seguro de que quieres revertir el pago de este bono?

Esta acci\xF3n marcar\xE1 el bono como "NO PAGADO" y eliminar\xE1:
- Fecha de pago
- M\xE9todo de pago
- Registro de qui\xE9n confirm\xF3 el pago

Esta acci\xF3n es \xFAtil si marcaste el pago por error.`
      );
      if (!confirmacion) return;
      try {
        const { data, error } = await supabase.rpc("revertir_pago_bono", {
          p_bono_id: bono.id
        });
        if (error) throw error;
        if (data && data.success) {
          alert(`\u2705 Pago revertido correctamente

El bono ahora est\xE1 marcado como "NO PAGADO"`);
          bonosKey.value++;
          if ((_a = pacienteSeleccionado.value) == null ? void 0 : _a.id) {
            await cargarDetallesPaciente(pacienteSeleccionado.value);
          }
        } else {
          alert(`\u274C Error: ${(data == null ? void 0 : data.error) || "No se pudo revertir el pago"}`);
        }
      } catch (err) {
        console.error("Error al revertir pago:", err);
        alert(`\u274C Error al revertir el pago: ${err.message}`);
      }
    };
    const cargarDetallesPaciente = async (pacienteId) => {
      try {
        const { data: sesiones, error } = await supabase.from("sesiones").select("id, fecha, hora_inicio, hora_fin, estado, notas_terapeuta").eq("paciente_id", pacienteId).order("fecha", { ascending: false }).limit(5);
        if (error) throw error;
        if (pacienteSeleccionado.value) {
          pacienteSeleccionado.value.ultimas_sesiones = (sesiones == null ? void 0 : sesiones.map((s) => ({
            id: s.id,
            fecha_cita: s.fecha,
            hora_inicio: s.hora_inicio,
            hora_fin: s.hora_fin,
            estado: s.estado,
            notas: s.notas_terapeuta
          }))) || [];
        }
      } catch (error) {
        console.error("Error al cargar detalles del paciente:", error);
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_BonosPaciente = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-ef92321c><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6" data-v-ef92321c><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" data-v-ef92321c><div data-v-ef92321c><h1 class="text-2xl font-serif font-bold text-cafe" data-v-ef92321c>Gesti\xF3n de Pacientes</h1><p class="text-sm text-gray-600 mt-1" data-v-ef92321c>${ssrInterpolate(unref(totalPacientes))} pacientes registrados \u2014 ${ssrInterpolate(unref(pacientesActivos))} activos </p></div><div class="flex flex-wrap items-center gap-3" data-v-ef92321c><div class="relative flex-1 min-w-[250px]" data-v-ef92321c><input${ssrRenderAttr("value", unref(busqueda))} type="text" placeholder="Buscar por nombre, email, terapeuta o tel\xE9fono..." class="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all duration-200" data-v-ef92321c><span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" data-v-ef92321c> \u{1F50D} </span></div><button class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-all duration-200 text-sm font-medium whitespace-nowrap flex items-center gap-2" data-v-ef92321c><span data-v-ef92321c>\u2795</span><span data-v-ef92321c>Nuevo Paciente</span></button></div></div><div class="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100" data-v-ef92321c><select class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all duration-200" data-v-ef92321c><option value="" data-v-ef92321c${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "") : ssrLooseEqual(unref(filtroEstado), "")) ? " selected" : ""}>Todos los estados</option><option value="activo" data-v-ef92321c${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "activo") : ssrLooseEqual(unref(filtroEstado), "activo")) ? " selected" : ""}>\u2705 Activos</option><option value="inactivo" data-v-ef92321c${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "inactivo") : ssrLooseEqual(unref(filtroEstado), "inactivo")) ? " selected" : ""}>\u23F8\uFE0F Inactivos</option><option value="pausa" data-v-ef92321c${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "pausa") : ssrLooseEqual(unref(filtroEstado), "pausa")) ? " selected" : ""}>\u23F8\uFE0F En pausa</option></select><select class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all duration-200" data-v-ef92321c><option value="" data-v-ef92321c${ssrIncludeBooleanAttr(Array.isArray(unref(filtroTerapeuta)) ? ssrLooseContain(unref(filtroTerapeuta), "") : ssrLooseEqual(unref(filtroTerapeuta), "")) ? " selected" : ""}>Todos los terapeutas</option><!--[-->`);
      ssrRenderList(unref(terapeutas), (terapeuta) => {
        _push(`<option${ssrRenderAttr("value", terapeuta.id)} data-v-ef92321c${ssrIncludeBooleanAttr(Array.isArray(unref(filtroTerapeuta)) ? ssrLooseContain(unref(filtroTerapeuta), terapeuta.id) : ssrLooseEqual(unref(filtroTerapeuta), terapeuta.id)) ? " selected" : ""}>${ssrInterpolate(terapeuta.nombre)}</option>`);
      });
      _push(`<!--]--></select><select class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all duration-200" data-v-ef92321c><option value="nombre" data-v-ef92321c${ssrIncludeBooleanAttr(Array.isArray(unref(ordenarPor)) ? ssrLooseContain(unref(ordenarPor), "nombre") : ssrLooseEqual(unref(ordenarPor), "nombre")) ? " selected" : ""}>Ordenar por nombre</option><option value="fecha" data-v-ef92321c${ssrIncludeBooleanAttr(Array.isArray(unref(ordenarPor)) ? ssrLooseContain(unref(ordenarPor), "fecha") : ssrLooseEqual(unref(ordenarPor), "fecha")) ? " selected" : ""}>Fecha \xFAltima sesi\xF3n</option><option value="citas" data-v-ef92321c${ssrIncludeBooleanAttr(Array.isArray(unref(ordenarPor)) ? ssrLooseContain(unref(ordenarPor), "citas") : ssrLooseEqual(unref(ordenarPor), "citas")) ? " selected" : ""}>M\xE1s citas</option></select></div></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4" data-v-ef92321c><div class="bg-terracota/5 rounded-xl p-4 border border-terracota/10 transition-all duration-300 hover:shadow-md" data-v-ef92321c><div class="flex items-center gap-3" data-v-ef92321c><div class="text-3xl" data-v-ef92321c>\u{1F465}</div><div class="flex-1" data-v-ef92321c><div class="text-2xl font-bold text-cafe" data-v-ef92321c>${ssrInterpolate(unref(totalPacientes))}</div><div class="text-sm text-cafe/60" data-v-ef92321c>Total pacientes</div></div></div></div><div class="bg-green-50 rounded-xl p-4 border border-green-100 transition-all duration-300 hover:shadow-md" data-v-ef92321c><div class="flex items-center gap-3" data-v-ef92321c><div class="text-3xl" data-v-ef92321c>\u{1F7E2}</div><div class="flex-1" data-v-ef92321c><div class="text-2xl font-bold text-green-700" data-v-ef92321c>${ssrInterpolate(unref(pacientesActivos))}</div><div class="text-sm text-green-600/80" data-v-ef92321c>Activos</div></div></div></div><div class="bg-blue-50 rounded-xl p-4 border border-blue-100 transition-all duration-300 hover:shadow-md" data-v-ef92321c><div class="flex items-center gap-3" data-v-ef92321c><div class="text-3xl" data-v-ef92321c>\u{1F9D1}\u200D\u2695\uFE0F</div><div class="flex-1" data-v-ef92321c><div class="text-2xl font-bold text-blue-700" data-v-ef92321c>${ssrInterpolate(unref(promedioPorTerapeuta))}</div><div class="text-sm text-blue-600/80" data-v-ef92321c>Prom. por terapeuta</div></div></div></div><div class="bg-purple-50 rounded-xl p-4 border border-purple-100 transition-all duration-300 hover:shadow-md" data-v-ef92321c><div class="flex items-center gap-3" data-v-ef92321c><div class="text-3xl" data-v-ef92321c>\u{1F4B3}</div><div class="flex-1" data-v-ef92321c><div class="text-2xl font-bold text-purple-700" data-v-ef92321c>${ssrInterpolate(unref(bonosActivos))}</div><div class="text-sm text-purple-600/80" data-v-ef92321c>Bonos activos</div></div></div></div></div>`);
      if (unref(cargando)) {
        _push(`<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12" data-v-ef92321c><div class="text-center text-gray-400 animate-pulse" data-v-ef92321c><span class="text-4xl block mb-2" data-v-ef92321c>\u23F3</span><p data-v-ef92321c>Cargando pacientes...</p></div></div>`);
      } else if (unref(pacientesFiltrados).length === 0) {
        _push(`<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12" data-v-ef92321c><div class="text-center text-gray-400" data-v-ef92321c><span class="text-6xl block mb-4" data-v-ef92321c>\u{1F465}</span><h3 class="text-xl font-semibold text-cafe mb-2" data-v-ef92321c> No se encontraron pacientes </h3><p class="text-gray-600 mb-4" data-v-ef92321c>${ssrInterpolate(unref(busqueda) ? "Intenta con otros t\xE9rminos de b\xFAsqueda" : "Comienza agregando tu primer paciente")}</p>`);
        if (!unref(busqueda)) {
          _push(`<button class="inline-flex items-center px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-all duration-200" data-v-ef92321c> + Crear Primer Paciente </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-v-ef92321c><!--[-->`);
        ssrRenderList(unref(pacientesFiltrados), (paciente) => {
          _push(`<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1" data-v-ef92321c><div class="flex items-start gap-4 mb-4" data-v-ef92321c><div class="w-16 h-16 rounded-full bg-gradient-to-br from-terracota to-cafe flex items-center justify-center flex-shrink-0 shadow-md" data-v-ef92321c><span class="text-white text-xl font-semibold" data-v-ef92321c>${ssrInterpolate(obtenerIniciales(paciente.nombre_completo))}</span></div><div class="flex-1 min-w-0" data-v-ef92321c><h3 class="font-semibold text-cafe text-lg truncate" data-v-ef92321c>${ssrInterpolate(paciente.nombre_completo)}</h3><p class="text-sm text-gray-600 truncate" data-v-ef92321c>${ssrInterpolate(paciente.email)}</p>`);
          if (paciente.telefono) {
            _push(`<p class="text-sm text-gray-500 mt-1" data-v-ef92321c> \u{1F4F1} ${ssrInterpolate(paciente.telefono)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
          if (paciente.terapeuta_nombre) {
            _push(`<div class="mb-3 flex items-center gap-2 text-sm bg-cafe/5 px-3 py-2 rounded-lg" data-v-ef92321c><span class="text-cafe/60" data-v-ef92321c>\u{1F9D1}\u200D\u2695\uFE0F</span><span class="text-cafe font-medium" data-v-ef92321c>${ssrInterpolate(paciente.terapeuta_nombre)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="space-y-2 mb-4" data-v-ef92321c>`);
          if (paciente.area_de_acompanamiento) {
            _push(`<div class="flex items-center gap-2 text-sm" data-v-ef92321c><span class="text-gray-400" data-v-ef92321c>\u{1F3AF}</span><span class="text-gray-700 truncate" data-v-ef92321c>${ssrInterpolate(paciente.area_de_acompanamiento)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex items-center gap-2 text-sm" data-v-ef92321c><span class="text-gray-400" data-v-ef92321c>\u{1F4C5}</span><span class="text-gray-700" data-v-ef92321c>${ssrInterpolate(paciente.total_citas || 0)} sesiones</span></div>`);
          if (paciente.ultima_cita) {
            _push(`<div class="flex items-center gap-2 text-sm" data-v-ef92321c><span class="text-gray-400" data-v-ef92321c>\u{1F550}</span><span class="text-gray-700" data-v-ef92321c>\xDAltima: ${ssrInterpolate(formatearFecha(paciente.ultima_cita))}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (paciente.proxima_cita) {
            _push(`<div class="flex items-center gap-2 text-sm" data-v-ef92321c><span class="text-gray-400" data-v-ef92321c>\u{1F4C6}</span><span class="text-gray-700" data-v-ef92321c>Pr\xF3xima: ${ssrInterpolate(formatearFecha(paciente.proxima_cita))}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex items-center justify-between pt-4 border-t border-gray-100" data-v-ef92321c><span class="${ssrRenderClass([getEstadoClasses(paciente.estado), "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"])}" data-v-ef92321c>${ssrInterpolate(getEstadoLabel(paciente.estado))}</span><div class="flex gap-2" data-v-ef92321c><button class="p-2 text-terracota hover:bg-terracota/10 rounded-lg transition-all duration-200" title="Ver agenda" data-v-ef92321c> \uFFFD </button><button class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200" title="Abrir WhatsApp" data-v-ef92321c> \u{1F4AC} </button><button class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" title="Ver detalles" data-v-ef92321c> \u{1F441}\uFE0F </button></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      if (unref(pacientesFiltrados).length > 0 && unref(totalPaginas) > 1) {
        _push(`<div class="flex justify-center gap-2" data-v-ef92321c><!--[-->`);
        ssrRenderList(unref(totalPaginas), (pagina) => {
          _push(`<button class="${ssrRenderClass([unref(paginaActual) === pagina ? "bg-terracota text-white shadow-md" : "bg-white border border-gray-200 text-cafe hover:bg-gray-50", "px-4 py-2 rounded-lg transition-all duration-200"])}" data-v-ef92321c>${ssrInterpolate(pagina)}</button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(panelAbierto) && unref(pacienteSeleccionado)) {
        _push(`<div class="fixed right-0 top-0 h-screen w-full md:w-2/3 lg:w-1/2 bg-white rounded-l-3xl shadow-2xl shadow-black/5 z-50 overflow-y-auto scroll-smooth" role="dialog" aria-modal="true" aria-labelledby="panel-title" tabindex="0" data-v-ef92321c><div class="sticky top-0 bg-white/80 backdrop-blur-md pb-6 pt-8 px-8 md:px-10 border-b border-cafe/10 z-10" data-v-ef92321c><div class="flex items-start justify-between gap-6" data-v-ef92321c><div class="flex items-center gap-5 flex-1" data-v-ef92321c><div class="w-16 h-16 rounded-full bg-cafe text-white flex items-center justify-center text-xl font-bold shadow-sm flex-shrink-0" data-v-ef92321c>${ssrInterpolate(obtenerIniciales(unref(pacienteSeleccionado).nombre_completo))}</div><div class="flex-1 min-w-0" data-v-ef92321c><h2 id="panel-title" class="font-serif text-2xl font-bold text-cafe mb-2 truncate" data-v-ef92321c>${ssrInterpolate(unref(pacienteSeleccionado).nombre_completo)}</h2><div class="flex items-center gap-3 flex-wrap" data-v-ef92321c><span class="${ssrRenderClass([getEstadoClasses(unref(pacienteSeleccionado).estado), "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"])}" data-v-ef92321c>${ssrInterpolate(getEstadoLabel(unref(pacienteSeleccionado).estado))}</span>`);
        if (unref(pacienteSeleccionado).terapeuta_nombre) {
          _push(`<span class="text-sm text-cafe/70" data-v-ef92321c> \u{1F9D1}\u200D\u2695\uFE0F ${ssrInterpolate(unref(pacienteSeleccionado).terapeuta_nombre)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><button class="text-cafe/40 hover:text-cafe transition-all duration-200 text-2xl leading-none w-10 h-10 rounded-full flex items-center justify-center hover:bg-cafe/5 hover:rotate-90" aria-label="Cerrar panel" data-v-ef92321c> \u2715 </button></div></div><div class="p-8 md:p-10 space-y-8" data-v-ef92321c><section class="bg-white border border-cafe/10 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1" data-v-ef92321c><h3 class="font-serif font-semibold text-cafe text-lg mb-4 flex items-center gap-2" data-v-ef92321c><span class="text-xl" data-v-ef92321c>\u{1F4DE}</span><span data-v-ef92321c>Informaci\xF3n de Contacto</span></h3><div class="space-y-3" data-v-ef92321c><div class="flex items-center gap-3 text-cafe/80" data-v-ef92321c><span class="w-6 text-lg" data-v-ef92321c>\u2709\uFE0F</span><span class="text-sm" data-v-ef92321c>${ssrInterpolate(unref(pacienteSeleccionado).email)}</span></div>`);
        if (unref(pacienteSeleccionado).telefono) {
          _push(`<div class="flex items-center gap-3 text-cafe/80" data-v-ef92321c><span class="w-6 text-lg" data-v-ef92321c>\u{1F4F1}</span><span class="text-sm" data-v-ef92321c>${ssrInterpolate(unref(pacienteSeleccionado).telefono)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></section>`);
        if (unref(pacienteSeleccionado).area_de_acompanamiento) {
          _push(`<section class="bg-blue-50/50 rounded-xl p-4 border border-blue-100 transition-all duration-300 hover:shadow-md" data-v-ef92321c><h3 class="font-serif font-semibold text-cafe text-lg mb-3 flex items-center gap-2" data-v-ef92321c><span class="text-xl" data-v-ef92321c>\u{1F3AF}</span><span data-v-ef92321c>\xC1rea de Acompa\xF1amiento</span></h3><p class="text-cafe text-sm leading-relaxed" data-v-ef92321c>${ssrInterpolate(unref(pacienteSeleccionado).area_de_acompanamiento)}</p></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<section class="bg-green-50/50 rounded-xl p-5 border border-green-100 transition-all duration-300 hover:shadow-md" data-v-ef92321c><h3 class="font-serif font-semibold text-cafe text-lg mb-4 flex items-center gap-2" data-v-ef92321c><span class="text-xl" data-v-ef92321c>\uFFFD</span><span data-v-ef92321c>Estad\xEDsticas</span></h3><div class="space-y-4" data-v-ef92321c><div class="flex items-center justify-between" data-v-ef92321c><span class="text-sm text-cafe/70" data-v-ef92321c>Total de sesiones</span><span class="text-3xl font-bold text-cafe" data-v-ef92321c>${ssrInterpolate(unref(pacienteSeleccionado).total_citas || 0)}</span></div><div class="flex items-center justify-between" data-v-ef92321c><span class="text-sm text-cafe/70" data-v-ef92321c>Completadas</span><span class="text-lg font-semibold text-green-700" data-v-ef92321c>${ssrInterpolate(unref(pacienteSeleccionado).sesiones_completadas || 0)}</span></div>`);
        if (unref(pacienteSeleccionado).proxima_cita) {
          _push(`<div class="flex items-center gap-2 pt-2 border-t border-green-200" data-v-ef92321c><span class="text-lg" data-v-ef92321c>\u{1F4C5}</span><div data-v-ef92321c><p class="text-xs text-cafe/60 uppercase tracking-wide" data-v-ef92321c>Pr\xF3xima sesi\xF3n</p><p class="text-sm font-medium text-cafe" data-v-ef92321c>${ssrInterpolate(formatearFecha(unref(pacienteSeleccionado).proxima_cita))}</p></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></section>`);
        if (unref(pacienteSeleccionado).bono_activo) {
          _push(`<section class="bg-white border border-cafe/10 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1" data-v-ef92321c><h3 class="font-serif font-semibold text-cafe text-lg mb-4 flex items-center gap-2" data-v-ef92321c><span class="text-xl" data-v-ef92321c>\uFFFD</span><span data-v-ef92321c>Bono Activo</span></h3><div class="space-y-3" data-v-ef92321c><div class="flex justify-between items-center p-4 bg-purple-50 rounded-lg" data-v-ef92321c><span class="text-sm text-cafe/70" data-v-ef92321c>Sesiones disponibles</span><span class="text-2xl font-bold text-purple-700" data-v-ef92321c>${ssrInterpolate(unref(pacienteSeleccionado).bono_activo.sesiones_restantes)}</span></div><div class="flex justify-between items-center text-sm text-cafe/70" data-v-ef92321c><span data-v-ef92321c>Fecha de compra</span><span class="font-medium" data-v-ef92321c>${ssrInterpolate(formatearFecha(unref(pacienteSeleccionado).bono_activo.fecha_compra))}</span></div></div></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<section class="bg-white border border-cafe/10 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300" data-v-ef92321c><h3 class="font-serif font-semibold text-cafe text-lg mb-5 flex items-center gap-2" data-v-ef92321c><span class="text-xl" data-v-ef92321c>\u{1F553}</span><span data-v-ef92321c>Historial de Sesiones</span></h3>`);
        if ((_a = unref(pacienteSeleccionado).ultimas_sesiones) == null ? void 0 : _a.length) {
          _push(`<div class="space-y-4" data-v-ef92321c><!--[-->`);
          ssrRenderList(unref(pacienteSeleccionado).ultimas_sesiones, (sesion, index) => {
            _push(`<div class="flex gap-4 group" data-v-ef92321c><div class="flex flex-col items-center" data-v-ef92321c><div class="${ssrRenderClass([{
              "bg-green-500": sesion.estado === "completada",
              "bg-red-500": sesion.estado === "cancelada",
              "bg-yellow-500": sesion.estado === "pendiente",
              "bg-blue-500": sesion.estado === "confirmada"
            }, "w-3 h-3 rounded-full mt-1.5 flex-shrink-0"])}" data-v-ef92321c></div>`);
            if (index < unref(pacienteSeleccionado).ultimas_sesiones.length - 1) {
              _push(`<div class="w-px h-full bg-cafe/10 mt-1" data-v-ef92321c></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="flex-1 pb-6" data-v-ef92321c><div class="flex items-start justify-between gap-3" data-v-ef92321c><div class="flex-1" data-v-ef92321c><p class="text-sm font-medium text-cafe" data-v-ef92321c>${ssrInterpolate(formatearFecha(sesion.fecha_cita))}</p><p class="text-xs text-cafe/60 mt-0.5" data-v-ef92321c>${ssrInterpolate(sesion.hora_inicio)} - ${ssrInterpolate(sesion.hora_fin)}</p></div><span class="${ssrRenderClass([{
              "text-green-700 bg-green-100": sesion.estado === "completada",
              "text-red-700 bg-red-100": sesion.estado === "cancelada",
              "text-yellow-700 bg-yellow-100": sesion.estado === "pendiente",
              "text-blue-700 bg-blue-100": sesion.estado === "confirmada"
            }, "text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap"])}" data-v-ef92321c>${ssrInterpolate(sesion.estado)}</span></div>`);
            if (sesion.notas) {
              _push(`<p class="text-xs text-cafe/70 mt-2 leading-relaxed" data-v-ef92321c>${ssrInterpolate(sesion.notas)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-8" data-v-ef92321c><span class="text-4xl block mb-3 opacity-50" data-v-ef92321c>\u{1F4C5}</span><p class="text-sm text-cafe/60" data-v-ef92321c>No hay sesiones registradas a\xFAn</p></div>`);
        }
        _push(`</section>`);
        if (unref(pacienteSeleccionado).id) {
          _push(ssrRenderComponent(_component_BonosPaciente, {
            key: `bonos-${unref(pacienteSeleccionado).id}-${unref(bonosKey)}`,
            "paciente-id": unref(pacienteSeleccionado).id,
            onRenovarBono: handleRenovarBono,
            onVerDetalles: handleVerDetallesBono,
            onCrearBono: handleCrearBono,
            onConfirmarPago: handleConfirmarPago,
            onRevertirPago: handleRevertirPago
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<section class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4" data-v-ef92321c><button class="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" data-v-ef92321c><span class="text-lg" data-v-ef92321c>\u{1F514}</span><span class="text-sm" data-v-ef92321c>Recordatorio</span></button><button class="px-4 py-3 bg-terracota hover:bg-terracota/90 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" data-v-ef92321c><span class="text-lg" data-v-ef92321c>\u{1F4C5}</span><span class="text-sm" data-v-ef92321c>Ver Agenda</span></button><button class="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" data-v-ef92321c><span class="text-lg" data-v-ef92321c>\u{1F4AC}</span><span class="text-sm" data-v-ef92321c>WhatsApp</span></button></section></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(panelAbierto)) {
        _push(`<div class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" data-v-ef92321c></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinadora/pacientes-old.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const pacientesOld = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ef92321c"]]);

export { pacientesOld as default };
//# sourceMappingURL=pacientes-old-CHCZ5uY4.mjs.map
