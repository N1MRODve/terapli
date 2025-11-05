import { watch, ref, computed, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { MagnifyingGlassIcon, UserGroupIcon, CalendarDaysIcon, CalendarIcon, ClockIcon, CheckCircleIcon, TicketIcon, CurrencyDollarIcon, ChartBarIcon, ExclamationTriangleIcon, ExclamationCircleIcon, BellAlertIcon } from '@heroicons/vue/24/outline';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { _ as __nuxt_component_2$1 } from './ModalNuevaCita-C_vZiTWN.mjs';
import { a as useRouter, g as useSupabaseClient, e as useSupabase, h as useSupabaseUser } from './server.mjs';
import { u as useBonos } from './useBonos-DTBWQlOT.mjs';
import { u as useCitas } from './useCitas-qKbOQyT7.mjs';
import { _ as __nuxt_component_5 } from './ModalEditarCita-hzUHhZ4g.mjs';
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

const _sfc_main$4 = {
  __name: "PacienteCard",
  __ssrInlineRender: true,
  props: {
    paciente: {
      type: Object,
      required: true
    }
  },
  emits: ["editar", "eliminar", "ver-citas", "gestionar-bonos", "editar-cita"],
  setup(__props) {
    const props = __props;
    const nombreMostrar = computed(() => {
      const nombreCompleto = props.paciente.nombre || "Sin nombre";
      if (nombreCompleto === "Sin nombre") return "Sin nombre";
      const partes = nombreCompleto.trim().split(" ");
      if (partes.length > 2) {
        const nombre = partes[0];
        const apellido1 = partes[1];
        const apellido2Inicial = partes[partes.length - 1].charAt(0);
        return `${nombre} ${apellido1} ${apellido2Inicial}.`;
      }
      return nombreCompleto;
    });
    const iniciales = computed(() => {
      var _a, _b;
      const nombreCompleto = props.paciente.nombre || "";
      if (!nombreCompleto) return "??";
      const partes = nombreCompleto.trim().split(" ");
      const nombreInicial = ((_a = partes[0]) == null ? void 0 : _a.charAt(0).toUpperCase()) || "?";
      const apellidoInicial = ((_b = partes[1]) == null ? void 0 : _b.charAt(0).toUpperCase()) || "";
      return `${nombreInicial}${apellidoInicial}`;
    });
    const avatarColor = computed(() => {
      const colors = ["#D8AFA0", "#C89B8A", "#B7C6B0", "#A8C5B5", "#D4A5A5", "#C4B5A0"];
      const index = props.paciente.id.charCodeAt(0) % colors.length;
      return colors[index];
    });
    const estadoEmocional = computed(() => {
      const promedio = props.paciente.estado_emocional_promedio || 3;
      if (promedio >= 4) return "\uFFFD";
      if (promedio >= 3) return "\u{1F610}";
      return "\uFFFD";
    });
    const estadoEmocionalTexto = computed(() => {
      const promedio = props.paciente.estado_emocional_promedio || 3;
      if (promedio >= 4) return "Estado positivo";
      if (promedio >= 3) return "Estado neutro";
      return "Requiere atenci\xF3n";
    });
    const estadoVinculoTexto = computed(() => {
      if (!props.paciente.activo) return "Finalizado";
      if (props.paciente.en_pausa) return "En pausa";
      return "Activo";
    });
    const estadoVinculoClasses = computed(() => {
      if (!props.paciente.activo) {
        return "bg-gray-100 text-gray-600";
      }
      if (props.paciente.en_pausa) {
        return "bg-yellow-100 text-yellow-700";
      }
      return "bg-green-100 text-green-700";
    });
    const areaAcompanamiento = computed(() => {
      return props.paciente.area_de_acompanamiento || null;
    });
    const ultimaSesion = computed(() => {
      if (!props.paciente.ultima_sesion) return "Sin registro";
      const fecha = new Date(props.paciente.ultima_sesion);
      const ahora = /* @__PURE__ */ new Date();
      const diffDias = Math.floor((ahora - fecha) / (1e3 * 60 * 60 * 24));
      if (diffDias === 0) return "Hoy";
      if (diffDias === 1) return "Ayer";
      if (diffDias < 7) return `Hace ${diffDias} d\xEDas`;
      if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`;
      return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    });
    const proximaSesion = computed(() => {
      if (!props.paciente.proxima_sesion) return null;
      try {
        let fechaStr = props.paciente.proxima_sesion;
        if (!fechaStr.includes("T")) {
          fechaStr += "T00:00:00";
        }
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) {
          console.warn("Fecha inv\xE1lida en pr\xF3xima sesi\xF3n:", props.paciente.proxima_sesion);
          return null;
        }
        return fecha.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        });
      } catch (error) {
        console.error("Error al formatear pr\xF3xima sesi\xF3n:", error, props.paciente.proxima_sesion);
        return null;
      }
    });
    const totalSesiones = computed(() => {
      return props.paciente.total_sesiones || 0;
    });
    const evolucionPorcentaje = computed(() => {
      return props.paciente.evolucion_porcentaje || 50;
    });
    const evolucionColor = computed(() => {
      const valor = evolucionPorcentaje.value;
      if (valor >= 70) return "bg-green-500";
      if (valor >= 50) return "bg-yellow-500";
      return "bg-orange-500";
    });
    const diasInactividad = computed(() => {
      if (!props.paciente.ultima_sesion) return 0;
      const fecha = new Date(props.paciente.ultima_sesion);
      const ahora = /* @__PURE__ */ new Date();
      return Math.floor((ahora - fecha) / (1e3 * 60 * 60 * 24));
    });
    const tieneAlertaInactividad = computed(() => {
      if (!props.paciente.activo || props.paciente.en_pausa) return false;
      return diasInactividad.value > 30;
    });
    const tieneAlertaEmocional = computed(() => {
      return props.paciente.requiere_atencion || false;
    });
    const bonoActivo = computed(() => {
      return props.paciente.bono_activo || null;
    });
    const tipoBonoTexto = computed(() => {
      var _a;
      if (!((_a = bonoActivo.value) == null ? void 0 : _a.tipo)) return "Sin tipo";
      const tipoMap = {
        "otro": "A demanda",
        "quincenal": "Quincenal",
        "semanal": "Semanal",
        "mensual": "Mensual",
        "personalizado": "Personalizado"
      };
      return tipoMap[bonoActivo.value.tipo] || bonoActivo.value.tipo;
    });
    const tipoBonoClasses = computed(() => {
      var _a;
      if (!((_a = bonoActivo.value) == null ? void 0 : _a.tipo)) return "bg-gray-100 text-gray-600";
      const classMap = {
        "otro": "bg-blue-100 text-blue-700",
        "quincenal": "bg-purple-100 text-purple-700",
        "semanal": "bg-indigo-100 text-indigo-700",
        "mensual": "bg-teal-100 text-teal-700",
        "personalizado": "bg-pink-100 text-pink-700"
      };
      return classMap[bonoActivo.value.tipo] || "bg-gray-100 text-gray-600";
    });
    const estadoBonoTexto = computed(() => {
      var _a;
      if (!((_a = bonoActivo.value) == null ? void 0 : _a.estado)) return "Sin estado";
      const estadoMap = {
        "activo": "Activo",
        "pendiente": "Pendiente",
        "vencido": "Vencido",
        "completado": "Completado"
      };
      return estadoMap[bonoActivo.value.estado] || bonoActivo.value.estado;
    });
    const estadoBonoClasses = computed(() => {
      var _a;
      if (!((_a = bonoActivo.value) == null ? void 0 : _a.estado)) return "bg-gray-100 text-gray-600";
      const classMap = {
        "activo": "bg-green-100 text-green-700",
        "pendiente": "bg-yellow-100 text-yellow-700",
        "vencido": "bg-red-100 text-red-700",
        "completado": "bg-gray-100 text-gray-600"
      };
      return classMap[bonoActivo.value.estado] || "bg-gray-100 text-gray-600";
    });
    const fechaFinTexto = computed(() => {
      var _a;
      if (!((_a = bonoActivo.value) == null ? void 0 : _a.fecha_fin)) return "Sin fecha";
      try {
        const fecha = new Date(bonoActivo.value.fecha_fin);
        return fecha.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });
      } catch (error) {
        return "Fecha inv\xE1lida";
      }
    });
    computed(() => {
      var _a;
      if (!((_a = bonoActivo.value) == null ? void 0 : _a.fecha_fin)) return "text-cafe/60";
      const fecha = new Date(bonoActivo.value.fecha_fin);
      const ahora = /* @__PURE__ */ new Date();
      const diasRestantes = Math.floor((fecha - ahora) / (1e3 * 60 * 60 * 24));
      if (diasRestantes < 0) return "text-red-600 font-semibold";
      if (diasRestantes <= 7) return "text-orange-600 font-semibold";
      if (diasRestantes <= 14) return "text-amber-600";
      return "text-cafe/80";
    });
    const sesionesUsadas = computed(() => {
      if (!bonoActivo.value) return 0;
      return bonoActivo.value.sesiones_totales - bonoActivo.value.sesiones_restantes;
    });
    const sesionesTotales = computed(() => {
      var _a;
      return ((_a = bonoActivo.value) == null ? void 0 : _a.sesiones_totales) || 0;
    });
    const sesionesColorClass = computed(() => {
      if (!bonoActivo.value) return "text-terracota";
      const restantes = bonoActivo.value.sesiones_restantes;
      if (restantes === 0) return "text-red-600 font-bold";
      if (restantes === 1) return "text-red-600 font-semibold";
      if (restantes === 2) return "text-orange-600 font-semibold";
      return "text-terracota font-semibold";
    });
    const progresoBono = computed(() => {
      if (!bonoActivo.value) return 0;
      const total = bonoActivo.value.sesiones_totales;
      const restantes = bonoActivo.value.sesiones_restantes;
      if (total === 0) return 0;
      const usadas = total - restantes;
      return Math.round(usadas / total * 100);
    });
    const progresoBonoTexto = computed(() => {
      return progresoBono.value.toString();
    });
    const progresoBonoColorClass = computed(() => {
      if (!bonoActivo.value) return "bg-gray-400";
      const estado = bonoActivo.value.estado;
      const colorMap = {
        "activo": "bg-green-500",
        "pendiente": "bg-yellow-500",
        "vencido": "bg-red-500",
        "completado": "bg-gray-400"
      };
      return colorMap[estado] || "bg-gray-400";
    });
    const tieneAlertaBonoCritica = computed(() => {
      if (!bonoActivo.value) return false;
      return bonoActivo.value.sesiones_restantes === 1;
    });
    const tieneAlertaBonoAdvertencia = computed(() => {
      if (!bonoActivo.value) return false;
      return bonoActivo.value.sesiones_restantes === 2;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group relative cursor-pointer" }, _attrs))} data-v-e4c2174f><div class="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10" data-v-e4c2174f><button class="p-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-md hover:shadow-lg" title="Gestionar bonos" data-v-e4c2174f><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-e4c2174f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" data-v-e4c2174f></path></svg></button><button class="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg" title="Editar paciente" data-v-e4c2174f><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-e4c2174f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" data-v-e4c2174f></path></svg></button><button class="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg" title="Eliminar paciente" data-v-e4c2174f><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-e4c2174f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-e4c2174f></path></svg></button></div><div class="flex items-start justify-between mb-5" data-v-e4c2174f><div class="flex items-center gap-3" data-v-e4c2174f><div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 shadow-sm" style="${ssrRenderStyle({ backgroundColor: unref(avatarColor) })}" data-v-e4c2174f>${ssrInterpolate(unref(iniciales))}</div><div data-v-e4c2174f><h3 class="font-serif text-lg font-semibold text-cafe group-hover:text-terracota transition-colors leading-tight" data-v-e4c2174f>${ssrInterpolate(unref(nombreMostrar))}</h3><div class="flex items-center gap-2 mt-1" data-v-e4c2174f><span class="text-lg"${ssrRenderAttr("title", unref(estadoEmocionalTexto))} data-v-e4c2174f>${ssrInterpolate(unref(estadoEmocional))}</span><span class="text-xs text-gray-500" data-v-e4c2174f>${ssrInterpolate(unref(estadoEmocionalTexto))}</span></div></div></div><span class="${ssrRenderClass([unref(estadoVinculoClasses), "px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap"])}" data-v-e4c2174f>${ssrInterpolate(unref(estadoVinculoTexto))}</span></div>`);
      if (unref(areaAcompanamiento)) {
        _push(`<div class="mb-4 flex items-center gap-2" data-v-e4c2174f><span class="text-xs text-gray-400 uppercase tracking-wide" data-v-e4c2174f>\xC1rea:</span><span class="text-sm text-gray-700 font-medium" data-v-e4c2174f>${ssrInterpolate(unref(areaAcompanamiento))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="space-y-3 mb-5" data-v-e4c2174f><div class="flex items-center gap-2 text-sm text-gray-600" data-v-e4c2174f>`);
      _push(ssrRenderComponent(unref(CalendarIcon), { class: "w-4 h-4 text-terracota flex-shrink-0" }, null, _parent));
      _push(`<span data-v-e4c2174f>\xDAltima sesi\xF3n: </span><span class="font-medium" data-v-e4c2174f>${ssrInterpolate(unref(ultimaSesion))}</span></div><div class="flex items-center gap-2 text-sm text-gray-600" data-v-e4c2174f>`);
      _push(ssrRenderComponent(unref(ClockIcon), { class: "w-4 h-4 text-terracota flex-shrink-0" }, null, _parent));
      _push(`<span data-v-e4c2174f>Pr\xF3xima: </span>`);
      if (unref(proximaSesion)) {
        _push(`<button class="text-terracota hover:text-cafe font-medium hover:underline transition-colors flex-shrink-0"${ssrRenderAttr("title", `Editar cita del ${unref(proximaSesion)}`)} data-v-e4c2174f>${ssrInterpolate(unref(proximaSesion))}</button>`);
      } else {
        _push(`<span class="text-gray-400 font-medium" data-v-e4c2174f>No programada</span>`);
      }
      _push(`<button class="ml-auto text-xs text-terracota hover:text-cafe hover:underline transition-colors flex-shrink-0" title="Ver todas las citas" data-v-e4c2174f> Ver citas \u2192 </button></div><div class="flex items-center gap-2 text-sm text-gray-600" data-v-e4c2174f>`);
      _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-4 h-4 text-terracota flex-shrink-0" }, null, _parent));
      _push(`<span data-v-e4c2174f>${ssrInterpolate(unref(totalSesiones))} sesiones completadas</span></div></div>`);
      if (unref(bonoActivo)) {
        _push(`<div class="mb-5 p-4 bg-gradient-to-br from-terracota/8 to-rosa/12 rounded-xl border border-terracota/15" data-v-e4c2174f><div class="space-y-3" data-v-e4c2174f><div class="flex items-center justify-between" data-v-e4c2174f><div class="flex items-center gap-2" data-v-e4c2174f>`);
        _push(ssrRenderComponent(unref(TicketIcon), { class: "w-4 h-4 text-terracota flex-shrink-0" }, null, _parent));
        _push(`<span class="text-sm font-medium text-gray-700" data-v-e4c2174f>Bono:</span><span class="${ssrRenderClass([unref(tipoBonoClasses), "px-2.5 py-1 rounded-lg text-xs font-semibold"])}" data-v-e4c2174f>${ssrInterpolate(unref(tipoBonoTexto))}</span></div><span class="${ssrRenderClass([unref(estadoBonoClasses), "px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"])}" data-v-e4c2174f>`);
        _push(ssrRenderComponent(unref(CurrencyDollarIcon), { class: "w-3 h-3" }, null, _parent));
        _push(`<span data-v-e4c2174f>${ssrInterpolate(unref(estadoBonoTexto))}</span></span></div><div class="grid grid-cols-1 gap-2" data-v-e4c2174f><div class="flex items-center gap-2 text-sm" data-v-e4c2174f>`);
        _push(ssrRenderComponent(unref(CalendarIcon), { class: "w-4 h-4 text-terracota flex-shrink-0" }, null, _parent));
        _push(`<span class="text-gray-600" data-v-e4c2174f>Vigencia:</span><span class="${ssrRenderClass([_ctx.fechaFinClases, "font-medium"])}" data-v-e4c2174f>${ssrInterpolate(unref(fechaFinTexto))}</span></div><div class="flex items-center gap-2 text-sm" data-v-e4c2174f>`);
        _push(ssrRenderComponent(unref(ChartBarIcon), { class: "w-4 h-4 text-terracota flex-shrink-0" }, null, _parent));
        _push(`<span class="text-gray-600" data-v-e4c2174f>Sesiones:</span><span class="${ssrRenderClass([unref(sesionesColorClass), "font-semibold"])}" data-v-e4c2174f>${ssrInterpolate(unref(sesionesUsadas))}/${ssrInterpolate(unref(sesionesTotales))}</span></div></div><div class="pt-1" data-v-e4c2174f><div class="flex items-center justify-between text-xs text-gray-500 mb-2" data-v-e4c2174f><span data-v-e4c2174f>Progreso del bono</span><span class="font-semibold text-gray-700" data-v-e4c2174f>${ssrInterpolate(unref(progresoBonoTexto))}%</span></div><div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden" data-v-e4c2174f><div class="${ssrRenderClass([unref(progresoBonoColorClass), "h-2 rounded-full transition-all duration-500"])}" style="${ssrRenderStyle({ width: `${unref(progresoBono)}%` })}" data-v-e4c2174f></div></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="pt-5 border-t border-gray-100" data-v-e4c2174f><div class="flex items-center justify-between text-xs text-gray-500 mb-2" data-v-e4c2174f><span data-v-e4c2174f>Evoluci\xF3n general</span><span class="font-semibold text-gray-700" data-v-e4c2174f>${ssrInterpolate(unref(evolucionPorcentaje))}%</span></div><div class="w-full bg-gray-200 rounded-full h-2" data-v-e4c2174f><div class="${ssrRenderClass([unref(evolucionColor), "h-2 rounded-full transition-all duration-500"])}" style="${ssrRenderStyle({ width: `${unref(evolucionPorcentaje)}%` })}" data-v-e4c2174f></div></div></div><div class="mt-5 space-y-2" data-v-e4c2174f>`);
      if (unref(tieneAlertaBonoCritica)) {
        _push(`<div class="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-pulse-subtle" data-v-e4c2174f>`);
        _push(ssrRenderComponent(unref(ExclamationTriangleIcon), { class: "w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" }, null, _parent));
        _push(`<div class="flex-1" data-v-e4c2174f><p class="text-xs font-semibold text-red-800 mb-1" data-v-e4c2174f> Bono casi agotado </p><p class="text-xs text-red-700" data-v-e4c2174f> Solo queda ${ssrInterpolate(unref(bonoActivo).sesiones_restantes)} sesi\xF3n. Informar para renovaci\xF3n. </p></div></div>`);
      } else if (unref(tieneAlertaBonoAdvertencia)) {
        _push(`<div class="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg" data-v-e4c2174f>`);
        _push(ssrRenderComponent(unref(ExclamationCircleIcon), { class: "w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" }, null, _parent));
        _push(`<div class="flex-1" data-v-e4c2174f><p class="text-xs font-semibold text-amber-800 mb-1" data-v-e4c2174f> Bono pr\xF3ximo a agotar </p><p class="text-xs text-amber-700" data-v-e4c2174f> Quedan ${ssrInterpolate(unref(bonoActivo).sesiones_restantes)} sesiones. Considerar renovaci\xF3n. </p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tieneAlertaInactividad)) {
        _push(`<div class="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-pulse-subtle" data-v-e4c2174f>`);
        _push(ssrRenderComponent(unref(BellAlertIcon), { class: "w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" }, null, _parent));
        _push(`<div class="flex-1" data-v-e4c2174f><p class="text-xs font-semibold text-red-800 mb-1" data-v-e4c2174f> Riesgo de abandono </p><p class="text-xs text-red-700" data-v-e4c2174f>${ssrInterpolate(unref(diasInactividad))} d\xEDas sin sesi\xF3n. Considera contactar pronto. </p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tieneAlertaEmocional)) {
        _push(`<div class="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg" data-v-e4c2174f>`);
        _push(ssrRenderComponent(unref(ExclamationCircleIcon), { class: "w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" }, null, _parent));
        _push(`<div class="flex-1" data-v-e4c2174f><p class="text-xs font-semibold text-orange-800" data-v-e4c2174f> Requiere seguimiento especial por estado emocional </p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PacienteCard.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-e4c2174f"]]);
const _sfc_main$3 = {
  __name: "ModalNuevoPaciente",
  __ssrInlineRender: true,
  props: {
    mostrar: {
      type: Boolean,
      default: false
    }
  },
  emits: ["cerrar", "paciente-creado"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    useSupabase();
    useBonos();
    useCitas();
    useSupabaseUser();
    const formulario = ref({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      fecha_nacimiento: "",
      area_acompanamiento: "",
      tipo_bono: "",
      primera_sesion: "",
      activo: true,
      notas_iniciales: "",
      crear_bono: false,
      bono_monto: 0,
      bono_renovacion_automatica: false
    });
    const guardando = ref(false);
    const error = ref("");
    const PRECIOS_BASE = {
      otro: 60,
      // €60 por 1 sesión (A Demanda) - Sin compromiso
      quincenal: 100,
      // €100 por 2 sesiones (€50/sesión)
      semanal: 160,
      // €160 por 4 sesiones (€40/sesión)
      mensual: 180
      // €180 por 4 sesiones mensuales
    };
    const sesionesSegunTipo = computed(() => {
      const tipo = formulario.value.tipo_bono;
      if (!tipo) return 0;
      const mapeo = {
        otro: 1,
        // A Demanda
        quincenal: 2,
        semanal: 4,
        mensual: 4
      };
      return mapeo[tipo] || 0;
    });
    const nombreTipoBono = computed(() => {
      const tipo = formulario.value.tipo_bono;
      const nombres = {
        otro: "A Demanda",
        quincenal: "Quincenal",
        semanal: "Semanal",
        mensual: "Mensual"
      };
      return nombres[tipo] || "No seleccionado";
    });
    const precioPorSesionBono = computed(() => {
      const sesiones = sesionesSegunTipo.value;
      const monto = formulario.value.bono_monto;
      if (!sesiones || !monto || sesiones <= 0) return "0.00";
      return (monto / sesiones).toFixed(2);
    });
    const precioSugeridoBono = computed(() => {
      const tipo = formulario.value.tipo_bono;
      if (!tipo) return 0;
      return PRECIOS_BASE[tipo] || 0;
    });
    const esADemanda = computed(() => {
      return formulario.value.tipo_bono === "otro";
    });
    const opcionesHorarioRapido = computed(() => {
      const hoy = /* @__PURE__ */ new Date();
      const opciones = [];
      const formatearDateTime = (fecha, hora) => {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, "0");
        const day = String(fecha.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}T${hora}`;
      };
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);
      opciones.push({
        label: "\u{1F305} Ma\xF1ana 10:00",
        datetime: formatearDateTime(manana, "10:00")
      });
      const proximoLunes = new Date(hoy);
      const diasHastaLunes = (8 - proximoLunes.getDay()) % 7;
      proximoLunes.setDate(proximoLunes.getDate() + (diasHastaLunes || 7));
      opciones.push({
        label: "\u{1F4C5} Pr\xF3ximo Lun 09:00",
        datetime: formatearDateTime(proximoLunes, "09:00")
      });
      const unaSemana = new Date(hoy);
      unaSemana.setDate(unaSemana.getDate() + 7);
      opciones.push({
        label: "\u{1F5D3}\uFE0F En 7 d\xEDas 16:00",
        datetime: formatearDateTime(unaSemana, "16:00")
      });
      return opciones;
    });
    const formularioValido = computed(() => {
      const base = formulario.value.nombre && formulario.value.apellido && formulario.value.email && formulario.value.area_acompanamiento && formulario.value.tipo_bono && formulario.value.primera_sesion;
      if (formulario.value.crear_bono) {
        return base && formulario.value.bono_monto > 0;
      }
      return base;
    });
    watch(() => formulario.value.tipo_bono, (nuevoTipo) => {
      if (nuevoTipo === "otro") {
        formulario.value.crear_bono = false;
        formulario.value.bono_monto = 0;
      } else if (formulario.value.crear_bono && formulario.value.bono_monto === 0) {
        formulario.value.bono_monto = PRECIOS_BASE[nuevoTipo] || 0;
      }
    });
    watch(() => formulario.value.crear_bono, (crear) => {
      if (crear && formulario.value.tipo_bono && formulario.value.bono_monto === 0) {
        formulario.value.bono_monto = PRECIOS_BASE[formulario.value.tipo_bono] || 0;
      }
    });
    watch(() => props.mostrar, (nuevo) => {
      if (nuevo) {
        resetearFormulario();
      }
    });
    const resetearFormulario = () => {
      formulario.value = {
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        fecha_nacimiento: "",
        area_acompanamiento: "",
        tipo_bono: "",
        primera_sesion: "",
        activo: true,
        notas_iniciales: "",
        crear_bono: false,
        bono_monto: 0,
        bono_renovacion_automatica: false
      };
      error.value = "";
    };
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.mostrar) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" }, _attrs))}><div class="bg-[#F9F7F3] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"><div class="sticky top-0 bg-[#F9F7F3] border-b border-[#D8AFA0]/30 px-6 py-4 flex justify-between items-center"><h2 class="text-2xl font-[&#39;Lora&#39;] text-[#5D4A44] font-semibold"> Nuevo Paciente </h2><button class="text-[#5D4A44] hover:text-[#D8AFA0] transition-colors" aria-label="Cerrar modal"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><form class="px-6 py-6 space-y-6"><div class="space-y-4"><h3 class="text-lg font-[&#39;Lora&#39;] text-[#5D4A44] font-semibold"> Informaci\xF3n Personal </h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label for="nombre" class="block text-sm font-medium text-[#5D4A44] mb-1"> Nombre <span class="text-red-500">*</span></label><input id="nombre"${ssrRenderAttr("value", formulario.value.nombre)} type="text" required class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white" placeholder="Nombre del paciente"></div><div><label for="apellido" class="block text-sm font-medium text-[#5D4A44] mb-1"> Apellido <span class="text-red-500">*</span></label><input id="apellido"${ssrRenderAttr("value", formulario.value.apellido)} type="text" required class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white" placeholder="Apellido(s) del paciente"></div><div><label for="email" class="block text-sm font-medium text-[#5D4A44] mb-1"> Email <span class="text-red-500">*</span></label><input id="email"${ssrRenderAttr("value", formulario.value.email)} type="email" required class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white" placeholder="correo@ejemplo.com"></div><div><label for="telefono" class="block text-sm font-medium text-[#5D4A44] mb-1"> Tel\xE9fono </label><input id="telefono"${ssrRenderAttr("value", formulario.value.telefono)} type="tel" class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white" placeholder="+52 123 456 7890"></div><div><label for="fecha_nacimiento" class="block text-sm font-medium text-[#5D4A44] mb-1"> Fecha de Nacimiento </label><div class="relative"><input id="fecha_nacimiento"${ssrRenderAttr("value", formulario.value.fecha_nacimiento)} type="date" class="w-full px-4 py-2 pr-12 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white cursor-pointer"><button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#D8AFA0] hover:text-[#5D4A44] transition-colors" title="Abrir calendario"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></button></div><p class="text-xs text-cafe/60 mt-1"> \u{1F4A1} Puedes escribir la fecha o usar el calendario </p></div></div></div><div class="space-y-4 pt-4 border-t border-[#D8AFA0]/30"><h3 class="text-lg font-[&#39;Lora&#39;] text-[#5D4A44] font-semibold"> Informaci\xF3n Terap\xE9utica </h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="md:col-span-2"><label for="area_acompanamiento" class="block text-sm font-medium text-[#5D4A44] mb-1"> \xC1rea de Acompa\xF1amiento <span class="text-red-500">*</span></label><select id="area_acompanamiento" required class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"><option value=""${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "") : ssrLooseEqual(formulario.value.area_acompanamiento, "")) ? " selected" : ""}>Selecciona un \xE1rea</option><option value="Ansiedad"${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Ansiedad") : ssrLooseEqual(formulario.value.area_acompanamiento, "Ansiedad")) ? " selected" : ""}>Ansiedad</option><option value="Depresi\xF3n"${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Depresi\xF3n") : ssrLooseEqual(formulario.value.area_acompanamiento, "Depresi\xF3n")) ? " selected" : ""}>Depresi\xF3n</option><option value="Autoestima"${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Autoestima") : ssrLooseEqual(formulario.value.area_acompanamiento, "Autoestima")) ? " selected" : ""}>Autoestima</option><option value="Relaciones"${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Relaciones") : ssrLooseEqual(formulario.value.area_acompanamiento, "Relaciones")) ? " selected" : ""}>Relaciones</option><option value="Duelo"${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Duelo") : ssrLooseEqual(formulario.value.area_acompanamiento, "Duelo")) ? " selected" : ""}>Duelo</option><option value="Estr\xE9s Laboral"${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Estr\xE9s Laboral") : ssrLooseEqual(formulario.value.area_acompanamiento, "Estr\xE9s Laboral")) ? " selected" : ""}>Estr\xE9s Laboral</option><option value="Crecimiento Personal"${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Crecimiento Personal") : ssrLooseEqual(formulario.value.area_acompanamiento, "Crecimiento Personal")) ? " selected" : ""}>Crecimiento Personal</option><option value="Otro"${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Otro") : ssrLooseEqual(formulario.value.area_acompanamiento, "Otro")) ? " selected" : ""}>Otro</option></select></div><div><label for="tipo_bono" class="block text-sm font-medium text-[#5D4A44] mb-1"> Tipo de Bono <span class="text-red-500">*</span></label><select id="tipo_bono" required class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white"><option value=""${ssrIncludeBooleanAttr(Array.isArray(formulario.value.tipo_bono) ? ssrLooseContain(formulario.value.tipo_bono, "") : ssrLooseEqual(formulario.value.tipo_bono, "")) ? " selected" : ""}>Selecciona tipo de bono</option><option value="otro"${ssrIncludeBooleanAttr(Array.isArray(formulario.value.tipo_bono) ? ssrLooseContain(formulario.value.tipo_bono, "otro") : ssrLooseEqual(formulario.value.tipo_bono, "otro")) ? " selected" : ""}>A Demanda (1 sesi\xF3n - 60\u20AC - sin compromiso)</option><option value="quincenal"${ssrIncludeBooleanAttr(Array.isArray(formulario.value.tipo_bono) ? ssrLooseContain(formulario.value.tipo_bono, "quincenal") : ssrLooseEqual(formulario.value.tipo_bono, "quincenal")) ? " selected" : ""}>Quincenal (2 sesiones/mes - 100\u20AC)</option><option value="semanal"${ssrIncludeBooleanAttr(Array.isArray(formulario.value.tipo_bono) ? ssrLooseContain(formulario.value.tipo_bono, "semanal") : ssrLooseEqual(formulario.value.tipo_bono, "semanal")) ? " selected" : ""}>Semanal (4 sesiones/mes - 160\u20AC)</option><option value="mensual"${ssrIncludeBooleanAttr(Array.isArray(formulario.value.tipo_bono) ? ssrLooseContain(formulario.value.tipo_bono, "mensual") : ssrLooseEqual(formulario.value.tipo_bono, "mensual")) ? " selected" : ""}>Mensual</option></select><p class="text-xs text-cafe/60 mt-1"> \u{1F3AB} Define el tipo de bono del paciente </p></div><div><label for="primera_sesion" class="block text-sm font-medium text-[#5D4A44] mb-1"> Primera Sesi\xF3n <span class="text-red-500">*</span></label><div class="relative"><input id="primera_sesion"${ssrRenderAttr("value", formulario.value.primera_sesion)} type="datetime-local" required step="1800" class="w-full px-4 py-2 pr-12 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white cursor-pointer"><button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#D8AFA0] hover:text-[#5D4A44] transition-colors" title="Abrir selector de fecha y hora"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></button></div><div class="flex gap-2 flex-wrap mt-2"><!--[-->`);
        ssrRenderList(unref(opcionesHorarioRapido), (opcion, index) => {
          _push(`<button type="button" class="${ssrRenderClass([
            "text-xs px-3 py-1.5 rounded-lg border transition-all",
            formulario.value.primera_sesion === opcion.datetime ? "bg-[#D8AFA0] text-white border-[#D8AFA0] font-semibold" : "bg-white text-[#5D4A44] border-[#D8AFA0]/30 hover:border-[#D8AFA0] hover:bg-[#D8AFA0]/10"
          ])}">${ssrInterpolate(opcion.label)}</button>`);
        });
        _push(`<!--]--></div><p class="text-xs text-cafe/60 mt-1"> \u{1F4A1} Puedes escribir la fecha/hora o usar el selector </p></div></div></div><div class="space-y-4 pt-4 border-t border-[#D8AFA0]/30"><div class="border-t pt-6"><h3 class="text-lg font-[&#39;Lora&#39;] text-[#5D4A44] font-semibold mb-2"> \u{1F4B3} Bono Inicial (Opcional) </h3>`);
        if (unref(esADemanda)) {
          _push(`<div class="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-3"><div class="flex items-start gap-3"><span class="text-2xl">\u2139\uFE0F</span><div><p class="text-sm font-semibold text-amber-900 mb-1"> Sesi\xF3n &quot;A Demanda&quot; seleccionada </p><p class="text-sm text-amber-800"> Las sesiones a demanda son <strong>sin compromiso</strong> y se pagan individualmente (60\u20AC por sesi\xF3n). No es necesario crear un bono prepagado. </p></div></div></div>`);
        } else {
          _push(`<p class="text-sm text-cafe/70 mb-3"> Crea un bono prepagado para que el paciente empiece su tratamiento. Podr\xE1s confirmar el pago despu\xE9s. </p>`);
        }
        _push(`<label class="${ssrRenderClass([unref(esADemanda) ? "bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-60" : "bg-purple-50 border-2 border-purple-200 cursor-pointer hover:bg-purple-100", "flex items-center gap-3 p-3 rounded-lg transition-colors"])}"><input${ssrIncludeBooleanAttr(Array.isArray(formulario.value.crear_bono) ? ssrLooseContain(formulario.value.crear_bono, null) : formulario.value.crear_bono) ? " checked" : ""} type="checkbox"${ssrIncludeBooleanAttr(unref(esADemanda)) ? " disabled" : ""} class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"><span class="${ssrRenderClass([unref(esADemanda) ? "text-gray-500" : "text-purple-700", "text-sm font-semibold"])}"> \u2705 S\xED, crear bono prepagado para este paciente </span></label></div>`);
        if (formulario.value.crear_bono) {
          _push(`<div class="border-2 border-purple-400/40 rounded-lg p-5 space-y-4 bg-gradient-to-br from-purple-50 to-purple-100/50"><div class="bg-white border-2 border-purple-300 rounded-lg p-4 shadow-sm"><div class="flex items-start gap-3"><div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"><span class="text-white text-xl">\u{1F39F}\uFE0F</span></div><div class="flex-1"><h4 class="font-semibold text-purple-900 mb-1"> Tipo de Bono: ${ssrInterpolate(unref(nombreTipoBono) || "Selecciona un tipo arriba")}</h4><div class="grid grid-cols-2 gap-3 text-sm"><div class="flex items-center gap-2"><span class="text-purple-600">\u{1F4CA}</span><span class="text-purple-800"><strong>${ssrInterpolate(unref(sesionesSegunTipo))}</strong> ${ssrInterpolate(unref(sesionesSegunTipo) === 1 ? "sesi\xF3n" : "sesiones")}</span></div>`);
          if (unref(precioSugeridoBono) > 0) {
            _push(`<div class="flex items-center gap-2"><span class="text-purple-600">\u{1F4B0}</span><span class="text-purple-800"> Precio sugerido: <strong>\u20AC${ssrInterpolate(unref(precioSugeridoBono))}</strong></span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><p class="text-xs text-purple-600 mt-2 bg-purple-50 p-2 rounded"> \u{1F4A1} <strong>Tip:</strong> Los precios se calcular\xE1n autom\xE1ticamente seg\xFAn el tipo de bono </p></div></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label for="bono_monto" class="block text-sm font-medium text-[#5D4A44] mb-1"> Monto Total <span class="text-red-500">*</span></label><div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5D4A44]/60">\u20AC</span><input id="bono_monto"${ssrRenderAttr("value", formulario.value.bono_monto)} type="number" min="0" step="0.01"${ssrIncludeBooleanAttr(formulario.value.crear_bono) ? " required" : ""} placeholder="0.00" class="w-full pl-8 pr-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"></div></div><div><label class="block text-sm font-medium text-[#5D4A44] mb-1"> Precio por Sesi\xF3n </label><div class="px-4 py-2 bg-purple-100 rounded-lg border border-purple-300"><span class="text-lg font-bold text-purple-700">\u20AC${ssrInterpolate(unref(precioPorSesionBono))}</span></div></div><div class="md:col-span-2"><label class="flex items-start gap-3 p-4 bg-white border-2 border-purple-200 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all"><input${ssrIncludeBooleanAttr(Array.isArray(formulario.value.bono_renovacion_automatica) ? ssrLooseContain(formulario.value.bono_renovacion_automatica, null) : formulario.value.bono_renovacion_automatica) ? " checked" : ""} type="checkbox" class="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"><div class="flex-1"><div class="flex items-center gap-2 mb-1"><span class="text-lg">\u{1F504}</span><span class="text-sm font-semibold text-purple-900"> Renovaci\xF3n Autom\xE1tica </span><span class="ml-auto px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded"> Recomendado </span></div><div class="text-xs text-[#5D4A44]/70 space-y-1"><p>\u2713 El bono se renovar\xE1 autom\xE1ticamente cuando se agoten las sesiones o expire</p><p>\u2713 Mantiene la continuidad del tratamiento sin interrupciones</p><p>\u2713 Puedes desactivar la renovaci\xF3n en cualquier momento</p></div></div></label></div></div>`);
          if (unref(sesionesSegunTipo) > 0 && formulario.value.bono_monto > 0) {
            _push(`<div class="p-3 bg-white rounded-lg border border-purple-300"><div class="text-xs font-medium text-purple-800 mb-2">\u{1F4CB} Resumen del Bono</div><div class="grid grid-cols-3 gap-2 text-xs"><div><span class="text-[#5D4A44]/60">Tipo:</span><span class="font-medium text-[#5D4A44] ml-1">${ssrInterpolate(unref(nombreTipoBono))}</span></div><div><span class="text-[#5D4A44]/60">Sesiones:</span><span class="font-medium text-[#5D4A44] ml-1">${ssrInterpolate(unref(sesionesSegunTipo))}</span></div><div><span class="text-[#5D4A44]/60">Total:</span><span class="font-medium text-[#5D4A44] ml-1">\u20AC${ssrInterpolate(formulario.value.bono_monto)}</span></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-4 pt-4 border-t border-[#D8AFA0]/30"><h3 class="text-lg font-[&#39;Lora&#39;] text-[#5D4A44] font-semibold"> Notas Iniciales </h3><div><label for="notas_iniciales" class="block text-sm font-medium text-[#5D4A44] mb-1"> Observaciones (Opcional) </label><textarea id="notas_iniciales" rows="3" class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white resize-none" placeholder="Observaciones iniciales, motivo de consulta, etc.">${ssrInterpolate(formulario.value.notas_iniciales)}</textarea></div></div>`);
        if (error.value) {
          _push(`<div class="bg-red-50 border border-red-200 rounded-lg p-4"><p class="text-sm text-red-600">${ssrInterpolate(error.value)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="sticky bottom-0 bg-[#F9F7F3] pt-4 pb-2 border-t-2 border-[#D8AFA0]/30 -mx-6 px-6 mt-6"><div class="flex justify-between items-center gap-3"><div class="text-xs text-cafe/60"><span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span> Los campos con * son obligatorios </div><div class="flex gap-3"><button type="button"${ssrIncludeBooleanAttr(guardando.value) ? " disabled" : ""} class="px-6 py-2.5 border-2 border-[#D8AFA0] text-[#5D4A44] font-medium rounded-lg hover:bg-[#D8AFA0]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"> Cancelar </button><button type="submit"${ssrIncludeBooleanAttr(guardando.value || !unref(formularioValido)) ? " disabled" : ""} class="px-8 py-2.5 bg-[#D8AFA0] text-white font-semibold rounded-lg hover:bg-[#C69F91] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg">`);
        if (guardando.value) {
          _push(`<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>`);
        } else {
          _push(`<span>\u2713</span>`);
        }
        _push(` ${ssrInterpolate(guardando.value ? "Creando paciente..." : "Crear Paciente")}</button></div></div></div></form></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalNuevoPaciente.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$3, { __name: "ModalNuevoPaciente" });
const _sfc_main$2 = {
  __name: "ModalEditarPaciente",
  __ssrInlineRender: true,
  props: {
    mostrar: {
      type: Boolean,
      default: false
    },
    paciente: {
      type: Object,
      default: null
    }
  },
  emits: ["cerrar", "paciente-actualizado"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    useSupabase();
    useBonos();
    const formulario = ref({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      fecha_nacimiento: "",
      area_acompanamiento: "",
      tipo_bono: "",
      activo: true,
      en_pausa: false,
      crear_bono: false,
      bono_monto: null,
      bono_renovacion_automatica: false
    });
    const sesionesAutomaticas = computed(() => {
      const tipo = formulario.value.tipo_bono;
      if (!tipo) return "Selecciona tipo";
      const mapeo = {
        a_demanda: 1,
        quincenal: 2,
        semanal: 4
      };
      return mapeo[tipo] || 0;
    });
    const nombreTipoBono = computed(() => {
      const tipo = formulario.value.tipo_bono;
      const nombres = {
        a_demanda: "A Demanda",
        quincenal: "Quincenal",
        semanal: "Semanal"
      };
      return nombres[tipo] || "";
    });
    const precioPorSesion = computed(() => {
      const sesiones = sesionesAutomaticas.value;
      const monto = formulario.value.bono_monto;
      if (sesiones === "Selecciona tipo" || !monto || sesiones <= 0) return "0.00";
      return (monto / sesiones).toFixed(2);
    });
    const guardando = ref(false);
    const error = ref("");
    watch(() => props.mostrar, (nuevo) => {
      if (nuevo && props.paciente) {
        cargarDatosPaciente();
      }
    });
    const cargarDatosPaciente = () => {
      var _a;
      const p = props.paciente;
      const metadata = p.metadata || {};
      const nombreCompleto = p.nombre_completo || p.nombre || "";
      const partes = nombreCompleto.split(" ");
      const nombre = partes[0] || metadata.nombre || "";
      const apellido = partes.slice(1).join(" ") || metadata.apellido || metadata.apellido_paterno || "";
      formulario.value = {
        nombre,
        apellido,
        email: p.email || "",
        telefono: p.telefono || "",
        fecha_nacimiento: metadata.fecha_nacimiento || "",
        area_acompanamiento: p.area_de_acompanamiento || p.area_acompanamiento || "",
        tipo_bono: p.tipo_bono || "",
        activo: (_a = p.activo) != null ? _a : true,
        en_pausa: p.en_pausa || metadata.en_pausa || false,
        crear_bono: false,
        bono_monto: null,
        bono_renovacion_automatica: false
      };
      error.value = "";
    };
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.mostrar) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" }, _attrs))} data-v-931716c5><div class="bg-[#F9F7F3] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" data-v-931716c5><div class="sticky top-0 bg-[#F9F7F3] border-b border-[#D8AFA0]/30 px-6 py-4 flex justify-between items-center" data-v-931716c5><h2 class="text-2xl font-[&#39;Lora&#39;] text-[#5D4A44] font-semibold" data-v-931716c5> Editar Paciente </h2><button class="text-[#5D4A44] hover:text-[#D8AFA0] transition-colors" aria-label="Cerrar modal" data-v-931716c5><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-931716c5><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-931716c5></path></svg></button></div><form class="px-6 py-6 space-y-6" data-v-931716c5><div class="space-y-4" data-v-931716c5><h3 class="text-lg font-[&#39;Lora&#39;] text-[#5D4A44] font-semibold" data-v-931716c5> Informaci\xF3n Personal </h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-v-931716c5><div data-v-931716c5><label for="nombre" class="block text-sm font-medium text-[#5D4A44] mb-1" data-v-931716c5> Nombre <span class="text-red-500" data-v-931716c5>*</span></label><input id="nombre"${ssrRenderAttr("value", formulario.value.nombre)} type="text" required class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white" placeholder="Nombre del paciente" data-v-931716c5></div><div data-v-931716c5><label for="apellido" class="block text-sm font-medium text-[#5D4A44] mb-1" data-v-931716c5> Apellido <span class="text-red-500" data-v-931716c5>*</span></label><input id="apellido"${ssrRenderAttr("value", formulario.value.apellido)} type="text" required class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white" placeholder="Apellido(s) del paciente" data-v-931716c5></div><div data-v-931716c5><label for="email" class="block text-sm font-medium text-[#5D4A44] mb-1" data-v-931716c5> Email <span class="text-red-500" data-v-931716c5>*</span></label><input id="email"${ssrRenderAttr("value", formulario.value.email)} type="email" required class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white" placeholder="correo@ejemplo.com" data-v-931716c5></div><div data-v-931716c5><label for="telefono" class="block text-sm font-medium text-[#5D4A44] mb-1" data-v-931716c5> Tel\xE9fono </label><input id="telefono"${ssrRenderAttr("value", formulario.value.telefono)} type="tel" class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white" placeholder="+52 123 456 7890" data-v-931716c5></div><div data-v-931716c5><label for="fecha_nacimiento" class="block text-sm font-medium text-[#5D4A44] mb-1" data-v-931716c5> Fecha de Nacimiento </label><input id="fecha_nacimiento"${ssrRenderAttr("value", formulario.value.fecha_nacimiento)} type="date" class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white" data-v-931716c5></div></div></div><div class="space-y-4 pt-4 border-t border-[#D8AFA0]/30" data-v-931716c5><h3 class="text-lg font-[&#39;Lora&#39;] text-[#5D4A44] font-semibold" data-v-931716c5> Informaci\xF3n Terap\xE9utica </h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-v-931716c5><div class="md:col-span-2" data-v-931716c5><label for="area_acompanamiento" class="block text-sm font-medium text-[#5D4A44] mb-1" data-v-931716c5> \xC1rea de Acompa\xF1amiento <span class="text-red-500" data-v-931716c5>*</span></label><select id="area_acompanamiento" required class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white" data-v-931716c5><option value="" data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "") : ssrLooseEqual(formulario.value.area_acompanamiento, "")) ? " selected" : ""}>Selecciona un \xE1rea</option><option value="Ansiedad" data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Ansiedad") : ssrLooseEqual(formulario.value.area_acompanamiento, "Ansiedad")) ? " selected" : ""}>Ansiedad</option><option value="Depresi\xF3n" data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Depresi\xF3n") : ssrLooseEqual(formulario.value.area_acompanamiento, "Depresi\xF3n")) ? " selected" : ""}>Depresi\xF3n</option><option value="Autoestima" data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Autoestima") : ssrLooseEqual(formulario.value.area_acompanamiento, "Autoestima")) ? " selected" : ""}>Autoestima</option><option value="Relaciones" data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Relaciones") : ssrLooseEqual(formulario.value.area_acompanamiento, "Relaciones")) ? " selected" : ""}>Relaciones</option><option value="Duelo" data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Duelo") : ssrLooseEqual(formulario.value.area_acompanamiento, "Duelo")) ? " selected" : ""}>Duelo</option><option value="Estr\xE9s Laboral" data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Estr\xE9s Laboral") : ssrLooseEqual(formulario.value.area_acompanamiento, "Estr\xE9s Laboral")) ? " selected" : ""}>Estr\xE9s Laboral</option><option value="Crecimiento Personal" data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Crecimiento Personal") : ssrLooseEqual(formulario.value.area_acompanamiento, "Crecimiento Personal")) ? " selected" : ""}>Crecimiento Personal</option><option value="Otro" data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.area_acompanamiento) ? ssrLooseContain(formulario.value.area_acompanamiento, "Otro") : ssrLooseEqual(formulario.value.area_acompanamiento, "Otro")) ? " selected" : ""}>Otro</option></select></div><div data-v-931716c5><label for="tipo_bono" class="block text-sm font-medium text-[#5D4A44] mb-1" data-v-931716c5> Tipo de Bono <span class="text-red-500" data-v-931716c5>*</span></label><select id="tipo_bono" required class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white" data-v-931716c5><option value="" data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.tipo_bono) ? ssrLooseContain(formulario.value.tipo_bono, "") : ssrLooseEqual(formulario.value.tipo_bono, "")) ? " selected" : ""}>Selecciona tipo de bono</option><option value="a_demanda" data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.tipo_bono) ? ssrLooseContain(formulario.value.tipo_bono, "a_demanda") : ssrLooseEqual(formulario.value.tipo_bono, "a_demanda")) ? " selected" : ""}>A Demanda (1 sesi\xF3n)</option><option value="quincenal" data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.tipo_bono) ? ssrLooseContain(formulario.value.tipo_bono, "quincenal") : ssrLooseEqual(formulario.value.tipo_bono, "quincenal")) ? " selected" : ""}>Quincenal (2 sesiones/mes)</option><option value="semanal" data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.tipo_bono) ? ssrLooseContain(formulario.value.tipo_bono, "semanal") : ssrLooseEqual(formulario.value.tipo_bono, "semanal")) ? " selected" : ""}>Semanal (4 sesiones/mes)</option></select></div><div data-v-931716c5><label for="activo" class="block text-sm font-medium text-[#5D4A44] mb-1" data-v-931716c5> Estado </label><select id="activo" class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white" data-v-931716c5><option${ssrRenderAttr("value", true)} data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.activo) ? ssrLooseContain(formulario.value.activo, true) : ssrLooseEqual(formulario.value.activo, true)) ? " selected" : ""}>Activo</option><option${ssrRenderAttr("value", false)} data-v-931716c5${ssrIncludeBooleanAttr(Array.isArray(formulario.value.activo) ? ssrLooseContain(formulario.value.activo, false) : ssrLooseEqual(formulario.value.activo, false)) ? " selected" : ""}>Inactivo</option></select></div><div class="md:col-span-2" data-v-931716c5><label class="flex items-center gap-2 cursor-pointer" data-v-931716c5><input${ssrIncludeBooleanAttr(Array.isArray(formulario.value.en_pausa) ? ssrLooseContain(formulario.value.en_pausa, null) : formulario.value.en_pausa) ? " checked" : ""} type="checkbox" class="w-4 h-4 text-[#D8AFA0] border-gray-300 rounded focus:ring-[#D8AFA0]" data-v-931716c5><span class="text-sm font-medium text-[#5D4A44]" data-v-931716c5> Proceso en pausa temporal </span></label><p class="text-xs text-cafe/60 mt-1 ml-6" data-v-931716c5> \u23F8\uFE0F Marca esta opci\xF3n si el seguimiento est\xE1 pausado temporalmente </p></div></div></div><div class="space-y-4 pt-4 border-t border-[#D8AFA0]/30" data-v-931716c5><div class="flex items-center justify-between" data-v-931716c5><h3 class="text-lg font-[&#39;Lora&#39;] text-[#5D4A44] font-semibold" data-v-931716c5> Gesti\xF3n de Bonos </h3><label class="flex items-center gap-2 cursor-pointer" data-v-931716c5><input${ssrIncludeBooleanAttr(Array.isArray(formulario.value.crear_bono) ? ssrLooseContain(formulario.value.crear_bono, null) : formulario.value.crear_bono) ? " checked" : ""} type="checkbox" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" data-v-931716c5><span class="text-sm font-medium text-[#5D4A44]" data-v-931716c5> \u{1F3AB} Crear nuevo bono para este paciente </span></label></div>`);
        if (formulario.value.crear_bono) {
          _push(`<div class="border-2 border-purple-400/40 rounded-lg p-4 space-y-4 bg-purple-50/30" data-v-931716c5><div class="bg-purple-100 border border-purple-300 rounded-lg p-3 flex items-start gap-2" data-v-931716c5><svg class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" data-v-931716c5><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" data-v-931716c5></path></svg><div class="text-sm text-purple-800" data-v-931716c5><p class="font-medium" data-v-931716c5>El bono usar\xE1 el tipo seleccionado arriba: <strong data-v-931716c5>${ssrInterpolate(nombreTipoBono.value || "Selecciona un tipo primero")}</strong></p><p class="text-xs text-purple-700 mt-1" data-v-931716c5> Sesiones incluidas: ${ssrInterpolate(sesionesAutomaticas.value === "Selecciona tipo" ? "N/A" : sesionesAutomaticas.value)}</p></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-v-931716c5><div data-v-931716c5><label for="bono_monto" class="block text-sm font-medium text-[#5D4A44] mb-1" data-v-931716c5> Monto Total <span class="text-red-500" data-v-931716c5>*</span></label><div class="relative" data-v-931716c5><span class="absolute left-3 top-2.5 text-[#5D4A44] font-medium" data-v-931716c5>\u20AC</span><input id="bono_monto"${ssrRenderAttr("value", formulario.value.bono_monto)} type="number" min="0" step="0.01"${ssrIncludeBooleanAttr(formulario.value.crear_bono) ? " required" : ""} class="w-full pl-8 pr-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white" placeholder="0.00" data-v-931716c5></div></div><div data-v-931716c5><label class="block text-sm font-medium text-[#5D4A44] mb-1" data-v-931716c5> Precio por Sesi\xF3n </label><div class="px-4 py-2 bg-purple-100 border-2 border-purple-300 rounded-lg text-purple-900 font-bold" data-v-931716c5> \u20AC${ssrInterpolate(precioPorSesion.value)}</div></div><div class="md:col-span-2" data-v-931716c5><label class="flex items-center gap-2 cursor-pointer" data-v-931716c5><input${ssrIncludeBooleanAttr(Array.isArray(formulario.value.bono_renovacion_automatica) ? ssrLooseContain(formulario.value.bono_renovacion_automatica, null) : formulario.value.bono_renovacion_automatica) ? " checked" : ""} type="checkbox" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" data-v-931716c5><span class="text-sm font-medium text-[#5D4A44]" data-v-931716c5> \u{1F504} Renovaci\xF3n autom\xE1tica al vencer </span></label><p class="text-xs text-cafe/60 mt-1 ml-6" data-v-931716c5> El sistema crear\xE1 un nuevo bono id\xE9ntico cuando este expire </p></div></div>`);
          if (sesionesAutomaticas.value && formulario.value.bono_monto) {
            _push(`<div class="bg-white border border-purple-300 rounded-lg p-4" data-v-931716c5><p class="text-sm font-medium text-[#5D4A44] mb-2" data-v-931716c5>\u{1F4CB} Resumen del Bono:</p><div class="text-sm text-cafe/80 space-y-1" data-v-931716c5><p data-v-931716c5>\u2022 <strong data-v-931716c5>Tipo:</strong> ${ssrInterpolate(nombreTipoBono.value)}</p><p data-v-931716c5>\u2022 <strong data-v-931716c5>Sesiones:</strong> ${ssrInterpolate(sesionesAutomaticas.value)}</p><p data-v-931716c5>\u2022 <strong data-v-931716c5>Total:</strong> \u20AC${ssrInterpolate(formulario.value.bono_monto.toFixed(2))}</p><p data-v-931716c5>\u2022 <strong data-v-931716c5>Por sesi\xF3n:</strong> \u20AC${ssrInterpolate(precioPorSesion.value)}</p>`);
            if (formulario.value.bono_renovacion_automatica) {
              _push(`<p class="text-purple-700" data-v-931716c5>\u2022 \u2705 Con renovaci\xF3n autom\xE1tica</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (error.value) {
          _push(`<div class="bg-red-50 border border-red-200 rounded-lg p-4" data-v-931716c5><p class="text-sm text-red-600" data-v-931716c5>${ssrInterpolate(error.value)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-end gap-3 pt-4 border-t border-[#D8AFA0]/30" data-v-931716c5><button type="button"${ssrIncludeBooleanAttr(guardando.value) ? " disabled" : ""} class="px-6 py-2 border border-[#D8AFA0] text-[#5D4A44] rounded-lg hover:bg-[#D8AFA0]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" data-v-931716c5> Cancelar </button><button type="submit"${ssrIncludeBooleanAttr(guardando.value) ? " disabled" : ""} class="px-6 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C69F91] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" data-v-931716c5>`);
        if (guardando.value) {
          _push(`<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" data-v-931716c5></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(guardando.value ? "Actualizando..." : "Guardar Cambios")}</button></div></form></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalEditarPaciente.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-931716c5"]]);
const _sfc_main$1 = {
  __name: "ModalEliminarPaciente",
  __ssrInlineRender: true,
  props: {
    mostrar: {
      type: Boolean,
      default: false
    },
    paciente: {
      type: Object,
      default: null
    }
  },
  emits: ["cerrar", "paciente-eliminado", "paciente-desactivado"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    useSupabase();
    const procesando = ref(false);
    const error = ref("");
    const pacienteNombre = computed(() => {
      if (!props.paciente) return "";
      return props.paciente.nombre_completo || props.paciente.nombre || props.paciente.email || "este paciente";
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.mostrar) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" }, _attrs))} data-v-650451a2><div class="bg-[#F9F7F3] rounded-lg shadow-xl max-w-md w-full" data-v-650451a2><div class="px-6 py-4 border-b border-[#D8AFA0]/30" data-v-650451a2><div class="flex items-center gap-3" data-v-650451a2><span class="text-3xl" data-v-650451a2>\u26A0\uFE0F</span><h2 class="text-2xl font-[&#39;Lora&#39;] text-[#5D4A44] font-semibold" data-v-650451a2> Eliminar Paciente </h2></div></div><div class="px-6 py-6 space-y-4" data-v-650451a2><p class="text-[#5D4A44]" data-v-650451a2> \xBFEst\xE1s seguro de que deseas eliminar a <strong class="font-semibold" data-v-650451a2>${ssrInterpolate(pacienteNombre.value)}</strong>? </p><div class="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2" data-v-650451a2><p class="text-sm text-red-800 font-medium" data-v-650451a2> Esta acci\xF3n no se puede deshacer y eliminar\xE1: </p><ul class="text-sm text-red-700 space-y-1 ml-4 list-disc" data-v-650451a2><li data-v-650451a2>Todos los datos personales del paciente</li><li data-v-650451a2>El historial de sesiones</li><li data-v-650451a2>Las notas terap\xE9uticas</li><li data-v-650451a2>Las m\xE9tricas de bienestar</li><li data-v-650451a2>Los bonos asociados</li></ul></div><div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-v-650451a2><p class="text-sm text-blue-800 font-medium mb-2" data-v-650451a2> \u{1F4A1} Recomendaci\xF3n: </p><p class="text-sm text-blue-700 mb-3" data-v-650451a2> En lugar de eliminar, considera <strong data-v-650451a2>desactivar</strong> al paciente. Esto preservar\xE1 el historial para consultas futuras. </p><button type="button"${ssrIncludeBooleanAttr(procesando.value) ? " disabled" : ""} class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm" data-v-650451a2> Desactivar en lugar de eliminar </button></div>`);
        if (error.value) {
          _push(`<div class="bg-red-50 border border-red-200 rounded-lg p-3" data-v-650451a2><p class="text-sm text-red-600" data-v-650451a2>${ssrInterpolate(error.value)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="px-6 py-4 border-t border-[#D8AFA0]/30 flex justify-end gap-3" data-v-650451a2><button type="button"${ssrIncludeBooleanAttr(procesando.value) ? " disabled" : ""} class="px-6 py-2 border border-[#D8AFA0] text-[#5D4A44] rounded-lg hover:bg-[#D8AFA0]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" data-v-650451a2> Cancelar </button><button type="button"${ssrIncludeBooleanAttr(procesando.value) ? " disabled" : ""} class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" data-v-650451a2>`);
        if (procesando.value) {
          _push(`<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" data-v-650451a2></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(procesando.value ? "Eliminando..." : "Eliminar Definitivamente")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalEliminarPaciente.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-650451a2"]]);
const _sfc_main = {
  __name: "pacientes",
  __ssrInlineRender: true,
  setup(__props) {
    var _a;
    const router = useRouter();
    const supabase = useSupabaseClient();
    const { getUserId } = useSupabase();
    const user = useSupabaseUser();
    console.log("[Pacientes] Estado inicial del usuario:", {
      existe: !!user.value,
      id: getUserId(),
      email: (_a = user.value) == null ? void 0 : _a.email
    });
    watch(user, (newUser, oldUser) => {
      console.log("[Pacientes] Usuario cambi\xF3:", {
        antes: (oldUser == null ? void 0 : oldUser.email) || "null",
        ahora: (newUser == null ? void 0 : newUser.email) || "null",
        id: getUserId()
      });
    });
    const mostrarModalNuevo = ref(false);
    const mostrarModalEditar = ref(false);
    const mostrarModalEliminar = ref(false);
    const mostrarModalAsignarCita = ref(false);
    const mostrarModalEditarCita = ref(false);
    const citaIdSeleccionada = ref(null);
    const pacienteSeleccionado = ref(null);
    const pacienteSeleccionadoCita = ref(null);
    const pacientes2 = ref([]);
    const loading = ref(true);
    const busqueda = ref("");
    const estadoSeleccionado = ref("todos");
    const filtrosEstado = [
      { valor: "todos", label: "Todos" },
      { valor: "activo", label: "Activos" },
      { valor: "pausa", label: "En pausa" },
      { valor: "finalizado", label: "Finalizados" }
    ];
    const cargarPacientes = async () => {
      var _a2;
      loading.value = true;
      try {
        const userId = getUserId();
        console.log("[Pacientes] Iniciando carga de pacientes...");
        console.log("[Pacientes] Usuario actual:", {
          existe: !!user.value,
          id: userId,
          email: (_a2 = user.value) == null ? void 0 : _a2.email
        });
        if (!userId) {
          console.error("[Pacientes] Usuario no autenticado");
          loading.value = false;
          return;
        }
        console.log("\u2705 [Pacientes] Usuario verificado, consultando database...");
        const { data: pacientesData, error: pacientesError } = await supabase.from("pacientes").select(`
        id,
        created_at,
        activo,
        email,
        nombre_completo,
        telefono,
        area_de_acompanamiento,
        frecuencia,
        metadata
      `).eq("terapeuta_id", userId).order("created_at", { ascending: false });
        if (pacientesError) throw pacientesError;
        const pacientesEnriquecidos = await Promise.all(
          pacientesData.map(async (paciente) => {
            var _a3, _b;
            const { data: ultimaCita } = await supabase.from("citas").select("fecha_cita").eq("paciente_id", paciente.id).eq("estado", "realizada").order("fecha_cita", { ascending: false }).limit(1).maybeSingle();
            const { data: proximaCita } = await supabase.from("citas").select("id, fecha_cita, hora_inicio").eq("paciente_id", paciente.id).in("estado", ["pendiente", "confirmada"]).gte("fecha_cita", (/* @__PURE__ */ new Date()).toISOString().split("T")[0]).order("fecha_cita", { ascending: true }).order("hora_inicio", { ascending: true }).limit(1).maybeSingle();
            const { count: totalSesiones } = await supabase.from("citas").select("*", { count: "exact", head: true }).eq("paciente_id", paciente.id).eq("estado", "realizada");
            let bonoActivo = null;
            try {
              const { data: todosLosBonos } = await supabase.from("bonos").select("id, tipo, estado, sesiones_totales, sesiones_restantes, fecha_fin, created_at").eq("paciente_id", paciente.id).order("created_at", { ascending: false });
              console.log(`[Bonos] Paciente ${paciente.nombre_completo}:`, todosLosBonos);
              const { data: bonoData, error: bonoError } = await supabase.from("bonos").select("id, tipo, estado, sesiones_totales, sesiones_restantes, fecha_fin, created_at").eq("paciente_id", paciente.id).in("estado", ["activo", "pendiente"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
              if (bonoError) {
                console.warn("[Bonos] Error en consulta:", bonoError.message);
              } else {
                bonoActivo = bonoData;
                console.log(`\u2705 [Bonos] Bono activo encontrado:`, bonoActivo);
              }
            } catch (error) {
              console.warn("[Bonos] Error inesperado:", error);
            }
            let sesionesCompletadasBono = 0;
            let totalSesionesBono = 0;
            if (bonoActivo) {
              totalSesionesBono = bonoActivo.sesiones_totales;
              sesionesCompletadasBono = totalSesionesBono - bonoActivo.sesiones_restantes;
            }
            const hace7Dias = /* @__PURE__ */ new Date();
            hace7Dias.setDate(hace7Dias.getDate() - 7);
            const { data: emocionesRecientes } = await supabase.from("metricas_bienestar").select("estado_animo, nivel_energia, nivel_estres").eq("paciente_id", paciente.id).gte("fecha", hace7Dias.toISOString());
            let estadoEmocionalPromedio = 3;
            let requiereAtencion = false;
            let evolucionPorcentaje = 50;
            if (emocionesRecientes && emocionesRecientes.length > 0) {
              const promedioAnimo = emocionesRecientes.reduce((sum, e) => sum + e.estado_animo, 0) / emocionesRecientes.length;
              estadoEmocionalPromedio = promedioAnimo;
              evolucionPorcentaje = Math.round(promedioAnimo / 10 * 100);
              const ultimosTres = emocionesRecientes.slice(-3);
              if (ultimosTres.length >= 3) {
                requiereAtencion = ultimosTres.every((e) => e.estado_animo <= 4);
              }
            }
            const nombreCompleto = paciente.nombre_completo || ((_a3 = paciente.metadata) == null ? void 0 : _a3.nombre_completo) || paciente.email;
            return {
              id: paciente.id,
              nombre: nombreCompleto,
              apellidos: "",
              // Deprecado - ya no se usa
              email: paciente.email,
              telefono: paciente.telefono,
              activo: paciente.activo,
              en_pausa: ((_b = paciente.metadata) == null ? void 0 : _b.en_pausa) || false,
              area_de_acompanamiento: paciente.area_de_acompanamiento,
              frecuencia: paciente.frecuencia,
              ultima_sesion: (ultimaCita == null ? void 0 : ultimaCita.fecha_cita) || null,
              proxima_sesion: proximaCita ? `${proximaCita.fecha_cita}T${proximaCita.hora_inicio}` : null,
              proxima_cita_id: (proximaCita == null ? void 0 : proximaCita.id) || null,
              // ID de la próxima cita para edición
              total_sesiones: totalSesiones || 0,
              estado_emocional_promedio: estadoEmocionalPromedio,
              evolucion_porcentaje: evolucionPorcentaje,
              requiere_atencion: requiereAtencion,
              created_at: paciente.created_at,
              bono_activo: bonoActivo ? {
                tipo: bonoActivo.tipo,
                estado: bonoActivo.estado,
                fecha_fin: bonoActivo.fecha_fin,
                sesiones_completadas: sesionesCompletadasBono,
                sesiones_totales: totalSesionesBono,
                sesiones_restantes: bonoActivo.sesiones_restantes
              } : null
            };
          })
        );
        pacientes2.value = pacientesEnriquecidos;
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
        alert("Hubo un error al cargar los pacientes. Por favor, recarga la p\xE1gina.");
      } finally {
        loading.value = false;
      }
    };
    const pacientesFiltrados = computed(() => {
      let resultado = pacientes2.value;
      if (busqueda.value) {
        const busquedaLower = busqueda.value.toLowerCase();
        resultado = resultado.filter((p) => {
          const nombreCompleto = (p.nombre || "").toLowerCase();
          return nombreCompleto.includes(busquedaLower) || (p.email || "").toLowerCase().includes(busquedaLower);
        });
      }
      if (estadoSeleccionado.value !== "todos") {
        resultado = resultado.filter((p) => {
          if (estadoSeleccionado.value === "activo") {
            return p.activo && !p.en_pausa;
          } else if (estadoSeleccionado.value === "pausa") {
            return p.activo && p.en_pausa;
          } else if (estadoSeleccionado.value === "finalizado") {
            return !p.activo;
          }
          return true;
        });
      }
      return resultado;
    });
    const totalPacientes = computed(() => pacientes2.value.length);
    const cerrarModalNuevo = () => {
      mostrarModalNuevo.value = false;
    };
    const abrirModalEditar = (paciente) => {
      console.log("Abriendo modal de edici\xF3n para:", paciente);
      pacienteSeleccionado.value = paciente;
      mostrarModalEditar.value = true;
    };
    const cerrarModalEditar = () => {
      mostrarModalEditar.value = false;
      pacienteSeleccionado.value = null;
    };
    const abrirModalEliminar = (paciente) => {
      console.log("Abriendo modal de eliminaci\xF3n para:", paciente);
      pacienteSeleccionado.value = paciente;
      mostrarModalEliminar.value = true;
    };
    const cerrarModalEliminar = () => {
      mostrarModalEliminar.value = false;
      pacienteSeleccionado.value = null;
    };
    const manejarPacienteCreado = async (nuevoPaciente) => {
      console.log("Nuevo paciente creado:", nuevoPaciente);
      await cargarPacientes();
    };
    const manejarPacienteActualizado = async (pacienteActualizado) => {
      console.log("Paciente actualizado:", pacienteActualizado);
      await cargarPacientes();
    };
    const manejarPacienteEliminado = async (pacienteId) => {
      console.log("Paciente eliminado:", pacienteId);
      pacientes2.value = pacientes2.value.filter((p) => p.id !== pacienteId);
    };
    const manejarPacienteDesactivado = async (pacienteId) => {
      console.log("Paciente desactivado:", pacienteId);
      await cargarPacientes();
    };
    const cerrarModalAsignarCita = () => {
      mostrarModalAsignarCita.value = false;
      pacienteSeleccionadoCita.value = null;
    };
    const manejarCitaCreada = async (nuevaCita) => {
      console.log("Nueva cita creada:", nuevaCita);
      await cargarPacientes();
      cerrarModalAsignarCita();
    };
    const verCitasPaciente = (paciente) => {
      router.push(`/agenda?paciente=${paciente.id}`);
    };
    const gestionarBonosPaciente = (paciente) => {
      router.push(`/terapeuta/pacientes/${paciente.id}/bonos`);
    };
    const abrirModalEditarCita = (citaId) => {
      console.log("Abriendo modal de edici\xF3n de cita:", citaId);
      citaIdSeleccionada.value = citaId;
      mostrarModalEditarCita.value = true;
    };
    const cerrarModalEditarCita = () => {
      mostrarModalEditarCita.value = false;
      citaIdSeleccionada.value = null;
    };
    const handleCitaActualizada = async () => {
      console.log("Cita actualizada, recargando pacientes...");
      await cargarPacientes();
      cerrarModalEditarCita();
    };
    watch(() => getUserId(), (newUserId, oldUserId) => {
      console.log("[Pacientes] ID de usuario cambi\xF3:", {
        antes: oldUserId,
        ahora: newUserId
      });
      if (newUserId && pacientes2.value.length === 0) {
        console.log("[Pacientes] Recargando pacientes por cambio de usuario...");
        cargarPacientes();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PacienteCard = __nuxt_component_0;
      const _component_ModalNuevaCita = __nuxt_component_2$1;
      const _component_ModalNuevoPaciente = __nuxt_component_2;
      const _component_ModalEditarPaciente = __nuxt_component_3;
      const _component_ModalEliminarPaciente = __nuxt_component_4;
      const _component_ModalEditarCita = __nuxt_component_5;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-da126003><header class="mb-8" data-v-da126003><h1 class="text-3xl font-serif font-bold text-cafe mb-2" data-v-da126003> Pacientes </h1><p class="text-cafe/60" data-v-da126003> Gesti\xF3n de pacientes activos </p></header><section class="mb-8" data-v-da126003><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6" data-v-da126003><div class="flex flex-col lg:flex-row gap-4" data-v-da126003><div class="flex-1" data-v-da126003><div class="relative" data-v-da126003><input${ssrRenderAttr("value", unref(busqueda))} type="text" placeholder="Buscar paciente por nombre o email..." class="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-lg focus:border-terracota focus:ring-2 focus:ring-terracota/20 focus:bg-white transition-all text-cafe placeholder-gray-400" data-v-da126003>`);
      _push(ssrRenderComponent(unref(MagnifyingGlassIcon), { class: "w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }, null, _parent));
      _push(`</div></div><div class="flex flex-wrap gap-2" data-v-da126003><!--[-->`);
      ssrRenderList(filtrosEstado, (filtro) => {
        _push(`<button class="${ssrRenderClass([unref(estadoSeleccionado) === filtro.valor ? "bg-terracota text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200", "px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"])}" data-v-da126003>${ssrInterpolate(filtro.label)}</button>`);
      });
      _push(`<!--]--></div><button class="px-6 py-2.5 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-all flex items-center gap-2 whitespace-nowrap font-medium shadow-sm hover:shadow-md" data-v-da126003><span class="text-lg leading-none" data-v-da126003>+</span><span data-v-da126003>Nuevo Paciente</span></button></div></div></section><section data-v-da126003>`);
      if (unref(loading)) {
        _push(`<div class="flex flex-col items-center justify-center py-16" data-v-da126003><div class="animate-spin w-12 h-12 border-4 border-terracota border-t-transparent rounded-full mb-6" data-v-da126003></div><p class="text-gray-500 font-medium" data-v-da126003>Cargando pacientes...</p></div>`);
      } else if (unref(pacientesFiltrados).length === 0) {
        _push(`<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center" data-v-da126003>`);
        _push(ssrRenderComponent(unref(UserGroupIcon), { class: "w-20 h-20 mx-auto mb-6 text-gray-300" }, null, _parent));
        _push(`<h3 class="text-xl font-serif font-semibold text-cafe mb-3" data-v-da126003>${ssrInterpolate(unref(busqueda) || unref(estadoSeleccionado) !== "todos" ? "No se encontraron pacientes" : "A\xFAn no tienes pacientes registrados")}</h3><p class="text-gray-500 mb-6 max-w-md mx-auto" data-v-da126003>${ssrInterpolate(unref(busqueda) || unref(estadoSeleccionado) !== "todos" ? "Intenta ajustar los filtros de b\xFAsqueda para encontrar lo que buscas" : "Comienza a\xF1adiendo tu primer paciente para gestionar su proceso terap\xE9utico")}</p>`);
        if (!unref(busqueda) && unref(estadoSeleccionado) === "todos") {
          _push(`<button class="px-6 py-3 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-all font-medium shadow-sm hover:shadow-md" data-v-da126003> + A\xF1adir Primer Paciente </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-v-da126003><!--[-->`);
        ssrRenderList(unref(pacientesFiltrados), (paciente) => {
          _push(`<div class="relative group cursor-pointer" data-v-da126003>`);
          _push(ssrRenderComponent(_component_PacienteCard, {
            paciente,
            onEditar: abrirModalEditar,
            onEliminar: abrirModalEliminar,
            onVerCitas: verCitasPaciente,
            onGestionarBonos: gestionarBonosPaciente,
            onEditarCita: abrirModalEditarCita
          }, null, _parent));
          if (paciente.activo && !paciente.en_pausa) {
            _push(`<button class="hidden md:flex absolute bottom-4 right-4 px-3 py-2 bg-gradient-to-r from-terracota to-rosa text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 items-center gap-2 z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto" title="Asignar nueva cita" data-v-da126003>`);
            _push(ssrRenderComponent(unref(CalendarDaysIcon), { class: "w-4 h-4" }, null, _parent));
            _push(`<span data-v-da126003>Asignar Cita</span></button>`);
          } else {
            _push(`<!---->`);
          }
          if (paciente.activo && !paciente.en_pausa) {
            _push(`<button class="md:hidden absolute bottom-4 right-4 px-3 py-2 bg-gradient-to-r from-terracota to-rosa text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 z-10" title="Asignar nueva cita" data-v-da126003>`);
            _push(ssrRenderComponent(unref(CalendarDaysIcon), { class: "w-4 h-4" }, null, _parent));
            _push(`<span data-v-da126003>Asignar Cita</span></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      if (unref(pacientesFiltrados).length > 0) {
        _push(`<footer class="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between" data-v-da126003><p class="text-sm text-gray-500" data-v-da126003> Mostrando ${ssrInterpolate(unref(pacientesFiltrados).length)} de ${ssrInterpolate(unref(totalPacientes))} pacientes </p>`);
        if (unref(totalPacientes) > unref(pacientesFiltrados).length) {
          _push(`<div class="flex gap-2" data-v-da126003><button class="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium" data-v-da126003> Ver m\xE1s </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</footer>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
      _push(ssrRenderComponent(_component_ModalNuevaCita, {
        mostrar: unref(mostrarModalAsignarCita),
        "paciente-preseleccionado": unref(pacienteSeleccionadoCita),
        onCerrar: cerrarModalAsignarCita,
        onCitaCreada: manejarCitaCreada
      }, null, _parent));
      _push(ssrRenderComponent(_component_ModalNuevoPaciente, {
        mostrar: unref(mostrarModalNuevo),
        onCerrar: cerrarModalNuevo,
        onPacienteCreado: manejarPacienteCreado
      }, null, _parent));
      _push(ssrRenderComponent(_component_ModalEditarPaciente, {
        mostrar: unref(mostrarModalEditar),
        paciente: unref(pacienteSeleccionado),
        onCerrar: cerrarModalEditar,
        onPacienteActualizado: manejarPacienteActualizado
      }, null, _parent));
      _push(ssrRenderComponent(_component_ModalEliminarPaciente, {
        mostrar: unref(mostrarModalEliminar),
        paciente: unref(pacienteSeleccionado),
        onCerrar: cerrarModalEliminar,
        onPacienteEliminado: manejarPacienteEliminado,
        onPacienteDesactivado: manejarPacienteDesactivado
      }, null, _parent));
      _push(ssrRenderComponent(_component_ModalEditarCita, {
        isOpen: unref(mostrarModalEditarCita),
        citaId: unref(citaIdSeleccionada),
        onClose: cerrarModalEditarCita,
        onActualizado: handleCitaActualizada
      }, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/terapeuta/pacientes.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const pacientes = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-da126003"]]);

export { pacientes as default };
//# sourceMappingURL=pacientes-Y7MLjuJN.mjs.map
