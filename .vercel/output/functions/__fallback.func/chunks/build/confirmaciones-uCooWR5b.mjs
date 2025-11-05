import { _ as __nuxt_component_0 } from './nuxt-link-CboeUkiO.mjs';
import { _ as __nuxt_component_1 } from './ModalCancelarCita-CCQBpZ7H.mjs';
import { ref, unref, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrRenderStyle, ssrRenderTeleport } from 'vue/server-renderer';
import { ClockIcon, BoltIcon, CalendarIcon, ChatBubbleLeftRightIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/vue/24/outline';
import { g as useSupabaseClient, h as useSupabaseUser } from './server.mjs';
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
import './useCitas-qKbOQyT7.mjs';
import 'vue-router';
import '@supabase/ssr';
import '@vercel/analytics/nuxt';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const _sfc_main = {
  __name: "confirmaciones",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    useSupabaseUser();
    const cargando = ref(true);
    const citasPorConfirmar = ref([]);
    const citasUrgentesCount = ref(0);
    const proximaCitaTiempo = ref("--");
    const citasConWhatsApp = ref(0);
    const modalCancelarCita = ref(false);
    const citaSeleccionada = ref(null);
    const citaParaCancelar = ref(null);
    const motivoCancelacion = ref("");
    ref(false);
    const citasConfirmadasDetalle = ref([]);
    const citasProximos7Dias = ref(0);
    const citasConfirmadasHoy = ref(0);
    ref(0);
    ref(0);
    const citasListasParaRecordatorio = ref(0);
    const notificacion = ref({
      visible: false,
      tipo: "success",
      titulo: "",
      mensaje: ""
    });
    const mostrarNotificacion = (titulo, mensaje, tipo = "success") => {
      notificacion.value = {
        visible: true,
        tipo,
        titulo,
        mensaje
      };
      setTimeout(() => {
        notificacion.value.visible = false;
      }, 5e3);
    };
    const obtenerIniciales = (nombre) => {
      if (!nombre) return "PA";
      return nombre.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
    };
    const formatearFechaCita = (fecha) => {
      if (!fecha) return "Sin fecha";
      const date = new Date(fecha);
      const hoy = /* @__PURE__ */ new Date();
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);
      hoy.setHours(0, 0, 0, 0);
      manana.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      if (date.getTime() === hoy.getTime()) {
        return "Hoy";
      } else if (date.getTime() === manana.getTime()) {
        return "Ma\xF1ana";
      } else {
        return date.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "short"
        });
      }
    };
    const calcularTiempoRestante = (fecha, hora) => {
      if (!fecha || !hora) return "--";
      const ahora = /* @__PURE__ */ new Date();
      const fechaCita = /* @__PURE__ */ new Date(`${fecha}T${hora}`);
      const diff = fechaCita - ahora;
      if (diff < 0) return "Pasada";
      const horas = Math.floor(diff / (1e3 * 60 * 60));
      const minutos = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
      if (horas < 1) {
        return `${minutos}min`;
      } else if (horas < 24) {
        return `${horas}h ${minutos}min`;
      } else {
        const dias = Math.floor(horas / 24);
        return `${dias} d\xEDa${dias > 1 ? "s" : ""}`;
      }
    };
    const estaListaParaConfirmar = (fecha, hora) => {
      if (!fecha || !hora) return false;
      const ahora = /* @__PURE__ */ new Date();
      const fechaCita = /* @__PURE__ */ new Date(`${fecha}T${hora}`);
      const diff = fechaCita - ahora;
      const dentroD24Horas = diff > 0 && diff <= 864e5;
      return dentroD24Horas;
    };
    const estaListaParaRecordatorio = (fecha, hora) => {
      if (!fecha || !hora) return false;
      const ahora = /* @__PURE__ */ new Date();
      const fechaCita = /* @__PURE__ */ new Date(`${fecha}T${hora}`);
      const diff = fechaCita - ahora;
      const dentro4Horas = diff > 0 && diff <= 144e5;
      return dentro4Horas;
    };
    const cargarCitasPorConfirmar = async () => {
      try {
        const hoy = /* @__PURE__ */ new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaHoy = hoy.toISOString().split("T")[0];
        const { data: citas, error: citasError } = await supabase.from("citas").select(`
        id,
        fecha_cita,
        hora_inicio,
        modalidad,
        estado,
        paciente_id,
        terapeuta_id
      `).eq("estado", "pendiente").gte("fecha_cita", fechaHoy).order("fecha_cita", { ascending: true }).order("hora_inicio", { ascending: true }).limit(50);
        if (citasError) throw citasError;
        if (!citas || citas.length === 0) {
          citasPorConfirmar.value = [];
          citasUrgentesCount.value = 0;
          proximaCitaTiempo.value = "--";
          citasConWhatsApp.value = 0;
          return;
        }
        const pacienteIds = [...new Set(citas.map((c) => c.paciente_id))];
        const terapeutaIds = [...new Set(citas.map((c) => c.terapeuta_id).filter(Boolean))];
        const { data: pacientes } = await supabase.from("pacientes").select("id, nombre_completo, telefono, email").in("id", pacienteIds);
        let terapeutas = [];
        if (terapeutaIds.length > 0) {
          const { data: terapeutasData } = await supabase.from("terapeutas").select("id, nombre_completo").in("id", terapeutaIds);
          terapeutas = terapeutasData || [];
        }
        const pacientesMap = new Map((pacientes == null ? void 0 : pacientes.map((p) => [p.id, p])) || []);
        const terapeutasMap = new Map(terapeutas.map((t) => [t.id, t]));
        citasPorConfirmar.value = citas.map((cita) => {
          const paciente = pacientesMap.get(cita.paciente_id);
          const terapeuta = cita.terapeuta_id ? terapeutasMap.get(cita.terapeuta_id) : null;
          const manana = new Date(hoy);
          manana.setDate(manana.getDate() + 2);
          const fechaManana = manana.toISOString().split("T")[0];
          return {
            id: cita.id,
            fecha: cita.fecha_cita,
            hora_inicio: cita.hora_inicio,
            modalidad: cita.modalidad,
            estado: cita.estado,
            esUrgente: cita.fecha_cita < fechaManana,
            listaParaConfirmar: estaListaParaConfirmar(cita.fecha_cita, cita.hora_inicio),
            paciente: {
              nombre: (paciente == null ? void 0 : paciente.nombre_completo) || "Sin nombre",
              telefono: paciente == null ? void 0 : paciente.telefono,
              email: paciente == null ? void 0 : paciente.email
            },
            terapeuta: {
              nombre: (terapeuta == null ? void 0 : terapeuta.nombre_completo) || "Sin terapeuta"
            }
          };
        });
        citasUrgentesCount.value = citasPorConfirmar.value.filter((c) => c.esUrgente).length;
        if (citasPorConfirmar.value.length > 0) {
          const proxima = citasPorConfirmar.value[0];
          proximaCitaTiempo.value = calcularTiempoRestante(proxima.fecha, proxima.hora_inicio);
        }
        citasConWhatsApp.value = citasPorConfirmar.value.filter(
          (cita) => {
            var _a;
            return cita.listaParaConfirmar && ((_a = cita.paciente) == null ? void 0 : _a.telefono);
          }
        ).length;
      } catch (error) {
        console.error("Error al cargar citas por confirmar:", error);
      } finally {
        cargando.value = false;
      }
    };
    const cerrarModalCancelar = () => {
      modalCancelarCita.value = false;
      citaSeleccionada.value = null;
      citaParaCancelar.value = null;
      motivoCancelacion.value = "";
    };
    const handleCitaCancelada = (resultado) => {
      cerrarModalCancelar();
      (resultado == null ? void 0 : resultado.reintegrada) ? "\u2713 Cita cancelada y sesi\xF3n reintegrada al bono" : "\u2713 Cita cancelada exitosamente";
      const descripcion = (resultado == null ? void 0 : resultado.reintegrada) ? `Se devolvi\xF3 1 sesi\xF3n al bono del paciente` : `La sesi\xF3n se descont\xF3 del bono seg\xFAn pol\xEDtica de cancelaci\xF3n`;
      mostrarNotificacion("Cita Cancelada", descripcion, "success");
      cargarCitasPorConfirmar();
      cargarCitasConfirmadas();
    };
    const cargarCitasConfirmadas = async () => {
      try {
        const hoy = /* @__PURE__ */ new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaHoy = hoy.toISOString().split("T")[0];
        const { data: citas, error: citasError } = await supabase.from("citas").select(`
        id,
        fecha_cita,
        hora_inicio,
        modalidad,
        estado,
        paciente_id,
        terapeuta_id,
        bono_id
      `).eq("estado", "confirmada").gte("fecha_cita", fechaHoy).order("fecha_cita", { ascending: true }).order("hora_inicio", { ascending: true }).limit(50);
        if (citasError) throw citasError;
        if (!citas || citas.length === 0) {
          citasConfirmadasDetalle.value = [];
          citasConfirmadasHoy.value = 0;
          citasProximos7Dias.value = 0;
          return;
        }
        const pacienteIds = [...new Set(citas.map((c) => c.paciente_id))];
        const terapeutaIds = [...new Set(citas.map((c) => c.terapeuta_id).filter(Boolean))];
        const bonoIds = [...new Set(citas.map((c) => c.bono_id).filter(Boolean))];
        const { data: pacientes } = await supabase.from("pacientes").select("id, nombre_completo, telefono").in("id", pacienteIds);
        let bonos = [];
        if (bonoIds.length > 0) {
          const { data: bonosData } = await supabase.from("bonos").select("id, sesiones_totales, sesiones_restantes, estado").in("id", bonoIds);
          bonos = bonosData || [];
        }
        let terapeutas = [];
        if (terapeutaIds.length > 0) {
          const { data: terapeutasData } = await supabase.from("terapeutas").select("id, nombre_completo").in("id", terapeutaIds);
          terapeutas = terapeutasData || [];
        }
        const pacientesMap = new Map((pacientes == null ? void 0 : pacientes.map((p) => [p.id, p])) || []);
        const terapeutasMap = new Map(terapeutas.map((t) => [t.id, t]));
        const bonosMap = new Map(bonos.map((b) => [b.id, b]));
        citasConfirmadasDetalle.value = citas.map((cita) => {
          const paciente = pacientesMap.get(cita.paciente_id);
          const terapeuta = cita.terapeuta_id ? terapeutasMap.get(cita.terapeuta_id) : null;
          const bono = cita.bono_id ? bonosMap.get(cita.bono_id) : null;
          return {
            id: cita.id,
            fecha: cita.fecha_cita,
            hora_inicio: cita.hora_inicio,
            modalidad: cita.modalidad,
            estado: cita.estado,
            listaParaRecordatorio: estaListaParaRecordatorio(cita.fecha_cita, cita.hora_inicio),
            paciente: {
              nombre: (paciente == null ? void 0 : paciente.nombre_completo) || "Sin nombre",
              telefono: paciente == null ? void 0 : paciente.telefono
            },
            terapeuta: {
              nombre: (terapeuta == null ? void 0 : terapeuta.nombre_completo) || "Sin terapeuta"
            },
            bono: bono ? {
              id: bono.id,
              sesiones_totales: bono.sesiones_totales,
              sesiones_restantes: bono.sesiones_restantes,
              estado: bono.estado,
              tiene_bono: true
            } : null
          };
        });
        citasConfirmadasHoy.value = citasConfirmadasDetalle.value.filter(
          (cita) => cita.fecha === fechaHoy
        ).length;
        const fecha7Dias = new Date(hoy);
        fecha7Dias.setDate(fecha7Dias.getDate() + 7);
        const fecha7DiasStr = fecha7Dias.toISOString().split("T")[0];
        citasProximos7Dias.value = citasConfirmadasDetalle.value.filter(
          (cita) => cita.fecha <= fecha7DiasStr
        ).length;
        citasListasParaRecordatorio.value = citasConfirmadasDetalle.value.filter(
          (cita) => {
            var _a;
            return cita.listaParaRecordatorio && ((_a = cita.paciente) == null ? void 0 : _a.telefono);
          }
        ).length;
      } catch (error) {
        console.error("Error al cargar citas confirmadas:", error);
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ModalCancelarCita = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-6d26ebe1><div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8" data-v-6d26ebe1><div class="px-8 py-6 border-b border-gray-100" data-v-6d26ebe1><div class="flex items-center justify-between" data-v-6d26ebe1><div class="flex items-center gap-3" data-v-6d26ebe1><div class="w-12 h-12 bg-arena rounded-xl flex items-center justify-center" data-v-6d26ebe1>`);
      _push(ssrRenderComponent(unref(ClockIcon), { class: "w-7 h-7 text-terracota" }, null, _parent));
      _push(`</div><div data-v-6d26ebe1><h2 class="text-xl font-semibold text-cafe" data-v-6d26ebe1> Citas pendientes de confirmaci\xF3n </h2><p class="text-sm text-cafe/60 mt-0.5" data-v-6d26ebe1> Gestiona las citas que requieren confirmaci\xF3n con el paciente </p></div></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/agenda",
        class: "text-sm text-terracota hover:text-terracota/80 font-medium transition-colors flex items-center gap-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span data-v-6d26ebe1${_scopeId}>Ver agenda completa</span><span data-v-6d26ebe1${_scopeId}>\u2192</span>`);
          } else {
            return [
              createVNode("span", null, "Ver agenda completa"),
              createVNode("span", null, "\u2192")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="px-8 py-6" data-v-6d26ebe1><div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" data-v-6d26ebe1><div class="bg-arena/30 rounded-xl p-4 hover:shadow-sm transition-shadow" data-v-6d26ebe1><div class="flex items-center gap-3" data-v-6d26ebe1><div class="w-10 h-10 bg-terracota/10 rounded-lg flex items-center justify-center flex-shrink-0" data-v-6d26ebe1>`);
      _push(ssrRenderComponent(unref(ClockIcon), { class: "w-6 h-6 text-terracota" }, null, _parent));
      _push(`</div><div class="flex-1 min-w-0" data-v-6d26ebe1><p class="text-2xl font-semibold text-cafe" data-v-6d26ebe1>${ssrInterpolate(unref(citasPorConfirmar).length)}</p><p class="text-xs text-cafe/60 font-medium" data-v-6d26ebe1>Pendientes</p></div></div></div><div class="bg-orange-50/50 rounded-xl p-4 hover:shadow-sm transition-shadow" data-v-6d26ebe1><div class="flex items-center gap-3" data-v-6d26ebe1><div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0" data-v-6d26ebe1>`);
      _push(ssrRenderComponent(unref(BoltIcon), { class: "w-6 h-6 text-orange-600" }, null, _parent));
      _push(`</div><div class="flex-1 min-w-0" data-v-6d26ebe1><p class="text-2xl font-semibold text-cafe" data-v-6d26ebe1>${ssrInterpolate(unref(citasUrgentesCount))}</p><p class="text-xs text-cafe/60 font-medium" data-v-6d26ebe1>Urgentes</p></div></div></div><div class="bg-verde/10 rounded-xl p-4 hover:shadow-sm transition-shadow" data-v-6d26ebe1><div class="flex items-center gap-3" data-v-6d26ebe1><div class="w-10 h-10 bg-verde/20 rounded-lg flex items-center justify-center flex-shrink-0" data-v-6d26ebe1>`);
      _push(ssrRenderComponent(unref(CalendarIcon), { class: "w-6 h-6 text-verde" }, null, _parent));
      _push(`</div><div class="flex-1 min-w-0" data-v-6d26ebe1><p class="text-lg font-semibold text-cafe truncate" data-v-6d26ebe1>${ssrInterpolate(unref(proximaCitaTiempo))}</p><p class="text-xs text-cafe/60 font-medium" data-v-6d26ebe1>Pr\xF3xima cita</p></div></div></div><div class="bg-green-50/50 rounded-xl p-4 hover:shadow-sm transition-shadow" data-v-6d26ebe1><div class="flex items-center gap-3" data-v-6d26ebe1><div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0" data-v-6d26ebe1>`);
      _push(ssrRenderComponent(unref(ChatBubbleLeftRightIcon), { class: "w-6 h-6 text-green-600" }, null, _parent));
      _push(`</div><div class="flex-1 min-w-0" data-v-6d26ebe1><p class="text-2xl font-semibold text-cafe" data-v-6d26ebe1>${ssrInterpolate(unref(citasConWhatsApp))}</p><p class="text-xs text-cafe/60 font-medium" data-v-6d26ebe1>Listas para confirmar</p></div></div></div></div>`);
      if (unref(cargando)) {
        _push(`<div class="text-center py-12" data-v-6d26ebe1><div class="inline-flex flex-col items-center gap-3" data-v-6d26ebe1><div class="w-12 h-12 border-3 border-terracota/20 border-t-terracota rounded-full animate-spin" data-v-6d26ebe1></div><p class="text-cafe/60 font-medium text-sm" data-v-6d26ebe1>Cargando citas...</p></div></div>`);
      } else if (unref(citasPorConfirmar).length > 0) {
        _push(`<div class="space-y-3" data-v-6d26ebe1><!--[-->`);
        ssrRenderList(unref(citasPorConfirmar), (cita) => {
          _push(`<div class="group bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden" data-v-6d26ebe1><div class="flex items-stretch" data-v-6d26ebe1><div class="${ssrRenderClass([{
            "bg-terracota": cita.esUrgente,
            "bg-verde": !cita.esUrgente
          }, "w-1 flex-shrink-0"])}" data-v-6d26ebe1></div><div class="flex-1 p-5" data-v-6d26ebe1><div class="flex items-center gap-4" data-v-6d26ebe1><div class="flex-shrink-0" data-v-6d26ebe1><div class="${ssrRenderClass([{
            "bg-terracota": cita.esUrgente,
            "bg-cafe/80": !cita.esUrgente
          }, "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-sm"])}" data-v-6d26ebe1>${ssrInterpolate(obtenerIniciales(cita.paciente.nombre))}</div></div><div class="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center" data-v-6d26ebe1><div class="md:col-span-2" data-v-6d26ebe1><div class="flex items-center gap-2 mb-1" data-v-6d26ebe1><h4 class="font-semibold text-cafe" data-v-6d26ebe1>${ssrInterpolate(cita.paciente.nombre)}</h4>`);
          if (cita.esUrgente) {
            _push(`<span class="px-2 py-0.5 bg-terracota/10 text-terracota text-xs font-medium rounded-full" data-v-6d26ebe1> Urgente </span>`);
          } else {
            _push(`<!---->`);
          }
          if (cita.listaParaConfirmar) {
            _push(`<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full animate-pulse" data-v-6d26ebe1><span data-v-6d26ebe1>\u{1F514}</span><span data-v-6d26ebe1>Lista para confirmar</span></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><p class="text-sm text-cafe/60" data-v-6d26ebe1>${ssrInterpolate(cita.terapeuta.nombre)}</p></div><div data-v-6d26ebe1><p class="text-sm font-medium text-cafe mb-0.5" data-v-6d26ebe1>${ssrInterpolate(formatearFechaCita(cita.fecha))}</p><p class="text-sm text-cafe/60" data-v-6d26ebe1>${ssrInterpolate(cita.hora_inicio)}</p></div><div data-v-6d26ebe1><span class="${ssrRenderClass([{
            "bg-purple-50 text-purple-700": cita.modalidad === "online",
            "bg-verde/10 text-verde": cita.modalidad === "presencial"
          }, "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"])}" data-v-6d26ebe1><span data-v-6d26ebe1>${ssrInterpolate(cita.modalidad === "online" ? "\u{1F4BB}" : "\u{1F3E5}")}</span><span class="capitalize" data-v-6d26ebe1>${ssrInterpolate(cita.modalidad)}</span></span></div><div class="text-right" data-v-6d26ebe1><p class="${ssrRenderClass([{
            "text-terracota": cita.esUrgente,
            "text-cafe/70": !cita.esUrgente
          }, "text-sm font-semibold"])}" data-v-6d26ebe1>${ssrInterpolate(calcularTiempoRestante(cita.fecha, cita.hora_inicio))}</p><p class="text-xs text-cafe/50" data-v-6d26ebe1>restante</p></div></div><div class="flex-shrink-0 flex items-center gap-2" data-v-6d26ebe1><div class="relative" data-v-6d26ebe1>`);
          if (cita.paciente.telefono) {
            _push(`<button class="${ssrRenderClass([
              "p-2.5 rounded-lg transition-colors",
              cita.listaParaConfirmar ? "bg-green-500 text-white hover:bg-green-600 animate-pulse" : "bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white"
            ])}"${ssrRenderAttr("title", cita.listaParaConfirmar ? "\xA1Lista para confirmar! Enviar WhatsApp" : "Enviar WhatsApp")} data-v-6d26ebe1><span class="text-lg" data-v-6d26ebe1>\u{1F4AC}</span></button>`);
          } else {
            _push(`<!---->`);
          }
          if (cita.listaParaConfirmar) {
            _push(`<span class="absolute -top-1 -right-1 flex h-3 w-3" data-v-6d26ebe1><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" data-v-6d26ebe1></span><span class="relative inline-flex rounded-full h-3 w-3 bg-red-500" data-v-6d26ebe1></span></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><button class="p-2.5 bg-verde/10 text-verde hover:bg-verde hover:text-white rounded-lg transition-colors" title="Confirmar cita" data-v-6d26ebe1><span class="text-lg" data-v-6d26ebe1>\u2713</span></button><button class="p-2.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Cancelar cita" data-v-6d26ebe1><span class="text-lg" data-v-6d26ebe1>\u2715</span></button></div></div></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="text-center py-16" data-v-6d26ebe1><div class="inline-flex flex-col items-center gap-4" data-v-6d26ebe1><div class="w-20 h-20 bg-verde/10 rounded-2xl flex items-center justify-center" data-v-6d26ebe1>`);
        _push(ssrRenderComponent(unref(SparklesIcon), { class: "w-12 h-12 text-verde" }, null, _parent));
        _push(`</div><div class="space-y-1" data-v-6d26ebe1><h3 class="text-lg font-semibold text-cafe" data-v-6d26ebe1> No hay citas pendientes por confirmar </h3><p class="text-sm text-cafe/60 max-w-sm" data-v-6d26ebe1> Todo est\xE1 organizado, puedes revisar la agenda completa </p></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/coordinadora/agenda",
          class: "mt-2 px-5 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors font-medium text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Ver agenda `);
            } else {
              return [
                createTextVNode(" Ver agenda ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      }
      _push(`</div></div><div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8" data-v-6d26ebe1><div class="px-8 py-6 border-b border-gray-100" data-v-6d26ebe1><div class="flex items-center justify-between" data-v-6d26ebe1><div class="flex items-center gap-3" data-v-6d26ebe1><div class="w-12 h-12 bg-verde/10 rounded-xl flex items-center justify-center" data-v-6d26ebe1>`);
      _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-7 h-7 text-verde" }, null, _parent));
      _push(`</div><div data-v-6d26ebe1><h2 class="text-xl font-semibold text-cafe" data-v-6d26ebe1> Citas confirmadas </h2><p class="text-sm text-cafe/60 mt-0.5" data-v-6d26ebe1> Citas ya confirmadas con los pacientes </p></div></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/coordinadora/agenda?estado=confirmada",
        class: "text-sm text-verde hover:text-verde/80 font-medium transition-colors flex items-center gap-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span data-v-6d26ebe1${_scopeId}>Ver todas</span><span data-v-6d26ebe1${_scopeId}>\u2192</span>`);
          } else {
            return [
              createVNode("span", null, "Ver todas"),
              createVNode("span", null, "\u2192")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="px-8 py-6" data-v-6d26ebe1><div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" data-v-6d26ebe1><div class="bg-verde/10 rounded-xl p-4 hover:shadow-sm transition-shadow" data-v-6d26ebe1><div class="flex items-center gap-3" data-v-6d26ebe1><div class="w-10 h-10 bg-verde/20 rounded-lg flex items-center justify-center flex-shrink-0" data-v-6d26ebe1>`);
      _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-6 h-6 text-verde" }, null, _parent));
      _push(`</div><div class="flex-1 min-w-0" data-v-6d26ebe1><p class="text-2xl font-semibold text-cafe" data-v-6d26ebe1>${ssrInterpolate(unref(citasConfirmadasDetalle).length)}</p><p class="text-xs text-cafe/60 font-medium" data-v-6d26ebe1>Confirmadas</p></div></div></div><div class="bg-blue-50/50 rounded-xl p-4 hover:shadow-sm transition-shadow" data-v-6d26ebe1><div class="flex items-center gap-3" data-v-6d26ebe1><div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0" data-v-6d26ebe1>`);
      _push(ssrRenderComponent(unref(CalendarIcon), { class: "w-6 h-6 text-blue-600" }, null, _parent));
      _push(`</div><div class="flex-1 min-w-0" data-v-6d26ebe1><p class="text-2xl font-semibold text-cafe" data-v-6d26ebe1>${ssrInterpolate(unref(citasProximos7Dias))}</p><p class="text-xs text-cafe/60 font-medium" data-v-6d26ebe1>Pr\xF3ximos 7 d\xEDas</p></div></div></div><div class="bg-purple-50/50 rounded-xl p-4 hover:shadow-sm transition-shadow" data-v-6d26ebe1><div class="flex items-center gap-3" data-v-6d26ebe1><div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0" data-v-6d26ebe1>`);
      _push(ssrRenderComponent(unref(ClockIcon), { class: "w-6 h-6 text-purple-600" }, null, _parent));
      _push(`</div><div class="flex-1 min-w-0" data-v-6d26ebe1><p class="text-2xl font-semibold text-cafe" data-v-6d26ebe1>${ssrInterpolate(unref(citasConfirmadasHoy))}</p><p class="text-xs text-cafe/60 font-medium" data-v-6d26ebe1>Hoy</p></div></div></div><div class="bg-amber-50/50 rounded-xl p-4 hover:shadow-sm transition-shadow" data-v-6d26ebe1><div class="flex items-center gap-3" data-v-6d26ebe1><div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0" data-v-6d26ebe1>`);
      _push(ssrRenderComponent(unref(ChatBubbleLeftRightIcon), { class: "w-6 h-6 text-amber-600" }, null, _parent));
      _push(`</div><div class="flex-1 min-w-0" data-v-6d26ebe1><p class="text-2xl font-semibold text-cafe" data-v-6d26ebe1>${ssrInterpolate(unref(citasListasParaRecordatorio))}</p><p class="text-xs text-cafe/60 font-medium" data-v-6d26ebe1>Recordatorios listos</p></div></div></div></div>`);
      if (unref(citasConfirmadasDetalle).length > 0) {
        _push(`<div data-v-6d26ebe1><div class="space-y-3" data-v-6d26ebe1><!--[-->`);
        ssrRenderList(unref(citasConfirmadasDetalle), (cita) => {
          _push(`<div class="group bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden" data-v-6d26ebe1><div class="flex items-stretch" data-v-6d26ebe1><div class="w-1 bg-verde flex-shrink-0" data-v-6d26ebe1></div><div class="flex-1 p-5" data-v-6d26ebe1><div class="flex items-center gap-4" data-v-6d26ebe1><div class="flex-shrink-0 relative" data-v-6d26ebe1><div class="w-12 h-12 rounded-full bg-verde flex items-center justify-center text-white font-semibold shadow-sm" data-v-6d26ebe1>${ssrInterpolate(obtenerIniciales(cita.paciente.nombre))}</div><div class="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm" data-v-6d26ebe1><span class="text-verde text-xs" data-v-6d26ebe1>\u2713</span></div></div><div class="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-3 items-center" data-v-6d26ebe1><div class="lg:col-span-2" data-v-6d26ebe1><div class="flex items-center gap-2 mb-1" data-v-6d26ebe1><h4 class="font-semibold text-cafe" data-v-6d26ebe1>${ssrInterpolate(cita.paciente.nombre)}</h4>`);
          if (cita.listaParaRecordatorio) {
            _push(`<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full animate-pulse" data-v-6d26ebe1><span data-v-6d26ebe1>\u23F0</span><span data-v-6d26ebe1>Enviar recordatorio</span></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><p class="text-sm text-cafe/60" data-v-6d26ebe1>${ssrInterpolate(cita.terapeuta.nombre)}</p></div><div data-v-6d26ebe1><p class="text-sm font-medium text-cafe mb-0.5" data-v-6d26ebe1>${ssrInterpolate(formatearFechaCita(cita.fecha))}</p><p class="text-sm text-cafe/60" data-v-6d26ebe1>${ssrInterpolate(cita.hora_inicio)}</p></div><div data-v-6d26ebe1><span class="${ssrRenderClass([{
            "bg-purple-50 text-purple-700": cita.modalidad === "online",
            "bg-verde/10 text-verde": cita.modalidad === "presencial"
          }, "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"])}" data-v-6d26ebe1><span data-v-6d26ebe1>${ssrInterpolate(cita.modalidad === "online" ? "\u{1F4BB}" : "\u{1F3E5}")}</span><span class="capitalize" data-v-6d26ebe1>${ssrInterpolate(cita.modalidad)}</span></span></div><div data-v-6d26ebe1>`);
          if (cita.bono) {
            _push(`<div class="flex flex-col gap-1" data-v-6d26ebe1><div class="flex items-center gap-1.5" data-v-6d26ebe1><span class="text-xs text-cafe/60" data-v-6d26ebe1>\u{1F3AB} Bono:</span><span class="${ssrRenderClass([{
              "text-red-600": cita.bono.sesiones_restantes === 0,
              "text-orange-600": cita.bono.sesiones_restantes === 1,
              "text-amber-600": cita.bono.sesiones_restantes === 2,
              "text-verde": cita.bono.sesiones_restantes > 2
            }, "text-xs font-semibold"])}" data-v-6d26ebe1>${ssrInterpolate(cita.bono.sesiones_restantes)}/${ssrInterpolate(cita.bono.sesiones_totales)}</span></div><div class="flex items-center gap-1" data-v-6d26ebe1><div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden" data-v-6d26ebe1><div class="${ssrRenderClass([{
              "bg-red-500": cita.bono.sesiones_restantes === 0,
              "bg-orange-500": cita.bono.sesiones_restantes === 1,
              "bg-amber-500": cita.bono.sesiones_restantes === 2,
              "bg-verde": cita.bono.sesiones_restantes > 2
            }, "h-full transition-all duration-300 rounded-full"])}" style="${ssrRenderStyle({ width: `${cita.bono.sesiones_restantes / cita.bono.sesiones_totales * 100}%` })}" data-v-6d26ebe1></div></div></div>`);
            if (cita.bono.sesiones_restantes <= 2) {
              _push(`<span class="${ssrRenderClass([{
                "text-red-600": cita.bono.sesiones_restantes === 0,
                "text-orange-600": cita.bono.sesiones_restantes === 1,
                "text-amber-600": cita.bono.sesiones_restantes === 2
              }, "text-[10px] font-medium"])}" data-v-6d26ebe1>${ssrInterpolate(cita.bono.sesiones_restantes === 0 ? "\u26A0\uFE0F Agotado" : "\u26A0\uFE0F Renovar pronto")}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<div class="text-xs text-cafe/40 italic" data-v-6d26ebe1> Sin bono </div>`);
          }
          _push(`</div><div class="text-right" data-v-6d26ebe1><span class="inline-flex items-center gap-1 px-2.5 py-1 bg-verde/10 text-verde rounded-full text-xs font-medium" data-v-6d26ebe1><span data-v-6d26ebe1>\u2713</span><span data-v-6d26ebe1>Confirmada</span></span></div></div><div class="flex-shrink-0 flex items-center gap-2" data-v-6d26ebe1>`);
          if (cita.paciente.telefono) {
            _push(`<div class="relative" data-v-6d26ebe1><button class="${ssrRenderClass([
              "p-2.5 rounded-lg transition-colors",
              cita.listaParaRecordatorio ? "bg-blue-500 text-white hover:bg-blue-600 animate-pulse" : "bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white"
            ])}"${ssrRenderAttr("title", cita.listaParaRecordatorio ? "\xA1Lista para recordatorio! Enviar WhatsApp" : "Enviar recordatorio por WhatsApp")} data-v-6d26ebe1><span class="text-lg" data-v-6d26ebe1>\u{1F4AC}</span></button>`);
            if (cita.listaParaRecordatorio) {
              _push(`<span class="absolute -top-1 -right-1 flex h-3 w-3" data-v-6d26ebe1><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" data-v-6d26ebe1></span><span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500" data-v-6d26ebe1></span></span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="p-2.5 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white rounded-lg transition-colors" title="Volver a pendiente" data-v-6d26ebe1><span class="text-lg" data-v-6d26ebe1>\u21BA</span></button></div></div></div></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<div class="text-center py-16" data-v-6d26ebe1><div class="inline-flex flex-col items-center gap-4" data-v-6d26ebe1><div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center" data-v-6d26ebe1><span class="text-4xl" data-v-6d26ebe1>\u{1F4CB}</span></div><div class="space-y-1" data-v-6d26ebe1><h3 class="text-lg font-semibold text-cafe" data-v-6d26ebe1> No hay citas confirmadas </h3><p class="text-sm text-cafe/60 max-w-sm" data-v-6d26ebe1> Las citas confirmadas con los pacientes aparecer\xE1n aqu\xED </p></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/coordinadora/agenda",
          class: "mt-2 px-5 py-2 bg-verde text-white rounded-lg hover:bg-verde/90 transition-colors font-medium text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Ver agenda completa `);
            } else {
              return [
                createTextVNode(" Ver agenda completa ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      }
      _push(`</div></div>`);
      if (unref(citaParaCancelar)) {
        _push(ssrRenderComponent(_component_ModalCancelarCita, {
          cita: unref(citaParaCancelar),
          "is-open": unref(modalCancelarCita),
          onClose: cerrarModalCancelar,
          onCancelada: handleCitaCancelada
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(notificacion).visible) {
          _push2(`<div class="fixed top-4 right-4 z-[70] animate-[slideIn_0.3s_ease-out]" data-v-6d26ebe1><div class="${ssrRenderClass([{
            "border-green-500": unref(notificacion).tipo === "success",
            "border-red-500": unref(notificacion).tipo === "error"
          }, "bg-white rounded-lg shadow-2xl border-l-4 p-4 min-w-[320px] max-w-md"])}" data-v-6d26ebe1><div class="flex items-start gap-3" data-v-6d26ebe1><div class="${ssrRenderClass([{
            "bg-green-100": unref(notificacion).tipo === "success",
            "bg-red-100": unref(notificacion).tipo === "error"
          }, "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"])}" data-v-6d26ebe1><span class="text-2xl" data-v-6d26ebe1>${ssrInterpolate(unref(notificacion).tipo === "success" ? "\u2713" : "\u2717")}</span></div><div class="flex-1" data-v-6d26ebe1><p class="${ssrRenderClass([{
            "text-green-700": unref(notificacion).tipo === "success",
            "text-red-700": unref(notificacion).tipo === "error"
          }, "font-bold mb-1"])}" data-v-6d26ebe1>${ssrInterpolate(unref(notificacion).titulo)}</p><p class="text-sm text-cafe/70" data-v-6d26ebe1>${ssrInterpolate(unref(notificacion).mensaje)}</p></div><button class="text-cafe/40 hover:text-cafe/60 transition-colors" data-v-6d26ebe1><span class="text-xl" data-v-6d26ebe1>\xD7</span></button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinadora/confirmaciones.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const confirmaciones = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6d26ebe1"]]);

export { confirmaciones as default };
//# sourceMappingURL=confirmaciones-uCooWR5b.mjs.map
