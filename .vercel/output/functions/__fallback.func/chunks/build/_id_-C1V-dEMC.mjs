import { _ as _sfc_main$2 } from './DashboardCard-CYAu_T60.mjs';
import { defineComponent, computed, ref, watch, mergeProps, unref, withCtx, createVNode, toDisplayString, createBlock, createCommentVNode, openBlock, createTextVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { _ as __nuxt_component_2 } from './ModalNuevaCita-C_vZiTWN.mjs';
import { M as ModalDetallesCita } from './ModalDetallesCita-BbVvkA8W.mjs';
import { u as useCitas } from './useCitas-qKbOQyT7.mjs';
import { i as useRoute, a as useRouter, g as useSupabaseClient, h as useSupabaseUser } from './server.mjs';
import '@heroicons/vue/24/outline';
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

const _sfc_main$1 = {
  __name: "NotasPrivadas",
  __ssrInlineRender: true,
  props: {
    pacienteId: {
      type: String,
      required: true
    },
    contenido: {
      type: String,
      default: ""
    },
    ultimaActualizacion: {
      type: String,
      default: null
    }
  },
  emits: ["guardar", "actualizar"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const editando = ref(false);
    const guardando = ref(false);
    const contenidoLocal = ref(props.contenido);
    const contenidoOriginal = ref(props.contenido);
    ref(null);
    watch(() => props.contenido, (nuevoContenido) => {
      if (!editando.value) {
        contenidoLocal.value = nuevoContenido;
        contenidoOriginal.value = nuevoContenido;
      }
    });
    const formatearFecha = (fechaStr) => {
      if (!fechaStr) return "";
      const fecha = new Date(fechaStr);
      return fecha.toLocaleString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-6" }, _attrs))} data-v-a439e157><div class="flex items-center justify-between mb-4" data-v-a439e157><h3 class="font-serif text-lg font-semibold text-cafe flex items-center gap-2" data-v-a439e157><span class="text-xl" data-v-a439e157>\u{1F4DD}</span> Notas Cl\xEDnicas Privadas </h3>`);
      if (!unref(editando)) {
        _push(`<button class="px-3 py-1.5 text-sm bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors" data-v-a439e157> \u270F\uFE0F Editar </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="mb-4 p-3 bg-rosa/20 border border-rosa rounded-lg" data-v-a439e157><p class="text-xs text-cafe/70 flex items-start gap-2" data-v-a439e157><span class="text-terracota" data-v-a439e157>\u{1F512}</span><span data-v-a439e157> Esta informaci\xF3n es estrictamente confidencial y solo visible para ti como terapeuta. Cumple con los est\xE1ndares de protecci\xF3n de datos cl\xEDnicos. </span></p></div>`);
      if (!unref(editando)) {
        _push(`<div class="min-h-[200px]" data-v-a439e157>`);
        if (unref(contenidoLocal)) {
          _push(`<div class="prose prose-sm max-w-none text-cafe/80 whitespace-pre-wrap" data-v-a439e157>${ssrInterpolate(unref(contenidoLocal))}</div>`);
        } else {
          _push(`<div class="text-center py-8" data-v-a439e157><span class="text-5xl mb-3 block opacity-40" data-v-a439e157>\u{1F4CB}</span><p class="text-cafe/50 italic" data-v-a439e157> A\xFAn no hay notas registradas para este paciente </p><button class="mt-4 px-4 py-2 text-sm bg-terracota/10 text-terracota rounded-lg hover:bg-terracota/20 transition-colors" data-v-a439e157> A\xF1adir primera nota </button></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<div data-v-a439e157><textarea placeholder="Anota observaciones, reflexiones o aspectos a seguir trabajando...

\u2022 Progreso observado en la sesi\xF3n
\u2022 Temas pendientes de abordar
\u2022 Estrategias que funcionan
\u2022 Aspectos que requieren atenci\xF3n" class="w-full min-h-[300px] px-4 py-3 bg-base-bg rounded-lg border border-terracota/30 focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all text-cafe resize-y" data-v-a439e157>${ssrInterpolate(unref(contenidoLocal))}</textarea><div class="mt-2 flex items-center justify-between text-xs text-cafe/60" data-v-a439e157><span data-v-a439e157> \u{1F4A1} Presiona Cmd/Ctrl + Enter para guardar r\xE1pidamente </span>`);
        if (__props.ultimaActualizacion) {
          _push(`<span data-v-a439e157> \xDAltima actualizaci\xF3n: ${ssrInterpolate(formatearFecha(__props.ultimaActualizacion))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="mt-4 flex items-center gap-3" data-v-a439e157><button${ssrIncludeBooleanAttr(unref(guardando)) ? " disabled" : ""} class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" data-v-a439e157>`);
        if (unref(guardando)) {
          _push(`<span data-v-a439e157>\u23F3</span>`);
        } else {
          _push(`<span data-v-a439e157>\u{1F4BE}</span>`);
        }
        _push(`<span data-v-a439e157>${ssrInterpolate(unref(guardando) ? "Guardando..." : "Guardar cambios")}</span></button><button${ssrIncludeBooleanAttr(unref(guardando)) ? " disabled" : ""} class="px-4 py-2 bg-white border border-cafe/20 text-cafe rounded-lg hover:bg-gray-50 transition-colors" data-v-a439e157> Cancelar </button></div></div>`);
      }
      if (!unref(editando) && __props.ultimaActualizacion) {
        _push(`<div class="mt-4 pt-4 border-t border-gray-100" data-v-a439e157><p class="text-xs text-cafe/50" data-v-a439e157> \xDAltima modificaci\xF3n: ${ssrInterpolate(formatearFecha(__props.ultimaActualizacion))}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/NotasPrivadas.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-a439e157"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    const { getCitas } = useCitas();
    const pacienteId = computed(() => route.params.id);
    const cargando = ref(true);
    const error = ref(null);
    const pacienteData = ref(null);
    const bonoActivo = ref(null);
    const todasLasCitas = ref([]);
    const notasClinicas = ref("");
    const notasActualizacion = ref(null);
    const tabActiva = ref("proximas");
    const modalCitaAbierto = ref(false);
    const pacienteParaCita = ref(null);
    const modalDetallesAbierto = ref(false);
    const citaSeleccionada = ref(null);
    const tabs = computed(() => [
      {
        id: "proximas",
        nombre: "Pr\xF3ximas Sesiones",
        icono: "\u{1F4C5}",
        badge: estadisticas.value.proximas || null
      },
      {
        id: "completadas",
        nombre: "Completadas",
        icono: "\u2705",
        badge: estadisticas.value.completadas || null
      },
      {
        id: "pendientes",
        nombre: "Pendientes",
        icono: "\u23F3",
        badge: estadisticas.value.pendientes || null
      },
      {
        id: "anteriores",
        nombre: "Historial",
        icono: "\u{1F4DA}",
        badge: null
      }
    ]);
    const cargarDatosPaciente = async () => {
      cargando.value = true;
      error.value = null;
      try {
        if (!user.value) {
          error.value = "Usuario no autenticado";
          return;
        }
        const { data: paciente, error: errorPaciente } = await supabase.from("pacientes").select("*").eq("id", pacienteId.value).single();
        if (errorPaciente) throw errorPaciente;
        const nombreCompleto2 = paciente.nombre || paciente.email || "Sin nombre";
        pacienteData.value = {
          ...paciente,
          nombre_completo: nombreCompleto2,
          email: paciente.email || "",
          telefono: paciente.telefono || ""
        };
        const citas = await getCitas();
        todasLasCitas.value = citas.filter((c) => c.paciente_id === pacienteId.value);
        await cargarBonoActivo();
        await cargarNotas();
      } catch (err) {
        console.error("Error al cargar paciente:", err);
        error.value = err.message || "Error desconocido";
      } finally {
        cargando.value = false;
      }
    };
    const cargarBonoActivo = async () => {
      try {
        const { data: bono, error: bonoError } = await supabase.from("bonos").select("*").eq("paciente_id", pacienteId.value).eq("estado", "activo").maybeSingle();
        if (bonoError) {
          console.warn("[Bonos] Error en consulta:", bonoError.message);
          return;
        }
        if (bono) {
          const sesionesUsadas = bono.sesiones_usadas || 0;
          const sesionesTotales = bono.sesiones_totales || 0;
          const sesionesDisponibles = sesionesTotales - sesionesUsadas;
          bonoActivo.value = {
            ...bono,
            sesiones_disponibles: sesionesDisponibles,
            porcentaje_uso: sesionesTotales > 0 ? Math.round(sesionesUsadas / sesionesTotales * 100) : 0
          };
        }
      } catch (err) {
        console.warn("[Bonos] Error inesperado:", err);
      }
    };
    const cargarNotas = async () => {
      var _a;
      try {
        const { data } = await supabase.from("notas_terapeuticas").select("contenido, updated_at").eq("paciente_id", pacienteId.value).eq("terapeuta_id", (_a = user.value) == null ? void 0 : _a.id).order("updated_at", { ascending: false }).limit(1).maybeSingle();
        if (data) {
          notasClinicas.value = data.contenido || "";
          notasActualizacion.value = data.updated_at;
        }
      } catch (err) {
        console.error("Error al cargar notas:", err);
      }
    };
    const guardarNotas = async ({ pacienteId: pacienteId2, contenido }) => {
      var _a, _b;
      try {
        const { data: existing } = await supabase.from("notas_terapeuticas").select("id").eq("paciente_id", pacienteId2).eq("terapeuta_id", (_a = user.value) == null ? void 0 : _a.id).maybeSingle();
        if (existing) {
          await supabase.from("notas_terapeuticas").update({ contenido, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", existing.id);
        } else {
          await supabase.from("notas_terapeuticas").insert({
            paciente_id: pacienteId2,
            terapeuta_id: (_b = user.value) == null ? void 0 : _b.id,
            contenido
          });
        }
        notasClinicas.value = contenido;
        notasActualizacion.value = (/* @__PURE__ */ new Date()).toISOString();
      } catch (err) {
        console.error("Error al guardar notas:", err);
        throw err;
      }
    };
    const sesionesProximas = computed(() => {
      const hoy = /* @__PURE__ */ new Date();
      return todasLasCitas.value.filter(
        (c) => ["pendiente", "confirmada"].includes(c.estado) && new Date(c.fecha_cita) >= hoy
      ).sort((a, b) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime());
    });
    const sesionesCompletadas = computed(() => {
      return todasLasCitas.value.filter((c) => c.estado === "realizada").sort((a, b) => new Date(b.fecha_cita).getTime() - new Date(a.fecha_cita).getTime());
    });
    const sesionesPendientes = computed(() => {
      return todasLasCitas.value.filter((c) => c.estado === "pendiente").sort((a, b) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime());
    });
    const todasLasSesiones = computed(() => {
      return todasLasCitas.value.sort((a, b) => new Date(b.fecha_cita).getTime() - new Date(a.fecha_cita).getTime());
    });
    const estadisticas = computed(() => ({
      total: todasLasCitas.value.length,
      completadas: sesionesCompletadas.value.length,
      pendientes: sesionesPendientes.value.length,
      proximas: sesionesProximas.value.length
    }));
    const primeraSesion = computed(() => {
      const completadas = sesionesCompletadas.value;
      return completadas.length > 0 ? completadas[completadas.length - 1].fecha_cita : null;
    });
    const ultimaSesion = computed(() => {
      const completadas = sesionesCompletadas.value;
      return completadas.length > 0 ? completadas[0].fecha_cita : null;
    });
    const proximaSesion = computed(() => {
      return sesionesProximas.value.length > 0 ? sesionesProximas.value[0] : null;
    });
    const nombreCompleto = computed(() => {
      var _a;
      return ((_a = pacienteData.value) == null ? void 0 : _a.nombre_completo) || "Sin nombre";
    });
    const iniciales = computed(() => {
      if (!nombreCompleto.value) return "?";
      const partes = nombreCompleto.value.split(" ");
      if (partes.length >= 2 && partes[0] && partes[1]) {
        return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
      }
      return nombreCompleto.value.substring(0, 2).toUpperCase();
    });
    const avatarColor = computed(() => {
      const colors = ["#D8AFA0", "#C89B8A", "#B7C6B0", "#A8C5B5", "#D4A5A5", "#C4B5A0"];
      const index = pacienteId.value.charCodeAt(0) % colors.length;
      return colors[index];
    });
    const estadoTexto = computed(() => {
      var _a;
      if (!pacienteData.value) return "";
      if (!pacienteData.value.activo) return "Finalizado";
      if ((_a = pacienteData.value.metadata) == null ? void 0 : _a.en_pausa) return "En pausa";
      return "En proceso";
    });
    const estadoClasses = computed(() => {
      var _a;
      if (!pacienteData.value) return "";
      if (!pacienteData.value.activo) return "bg-gray-100 text-gray-600";
      if ((_a = pacienteData.value.metadata) == null ? void 0 : _a.en_pausa) return "bg-yellow-100 text-yellow-700";
      return "bg-green-100 text-green-700";
    });
    const tipoBono = computed(() => {
      var _a;
      if (!((_a = pacienteData.value) == null ? void 0 : _a.tipo_bono)) return "";
      const nombres = {
        "a_demanda": "A Demanda (1 sesi\xF3n)",
        "quincenal": "Quincenal (2 sesiones/mes)",
        "semanal": "Semanal (4 sesiones/mes)"
      };
      return nombres[pacienteData.value.tipo_bono] || pacienteData.value.tipo_bono;
    });
    const formatearFecha = (fecha) => {
      if (!fecha) return "";
      try {
        const date = /* @__PURE__ */ new Date(fecha + "T00:00:00");
        return date.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric"
        });
      } catch {
        return fecha;
      }
    };
    const formatearFechaCompleta = (fecha, hora) => {
      if (!fecha) return "";
      try {
        const date = /* @__PURE__ */ new Date(fecha + "T" + (hora || "00:00:00"));
        return date.toLocaleString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      } catch {
        return fecha;
      }
    };
    const formatearPrecio = (precio) => {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
      }).format(precio || 0);
    };
    const calcularTiempoProceso = (fechaInicio) => {
      if (!fechaInicio) return "";
      const inicio = new Date(fechaInicio);
      const ahora = /* @__PURE__ */ new Date();
      const dias = Math.floor((ahora.getTime() - inicio.getTime()) / (1e3 * 60 * 60 * 24));
      if (dias < 30) return `${dias} d\xEDas`;
      if (dias < 365) return `${Math.floor(dias / 30)} meses`;
      return `${Math.floor(dias / 365)} a\xF1os`;
    };
    const obtenerIconoModalidad = (modalidad) => {
      const iconos = {
        "presencial": "\u{1F3E5}",
        "online": "\u{1F4BB}",
        "telefonica": "\u{1F4DE}"
      };
      return iconos[modalidad] || "\u{1F4CB}";
    };
    const obtenerEstiloModalidad = (modalidad) => {
      const estilos = {
        "presencial": "bg-green-100 text-green-700",
        "online": "bg-terracota/20 text-terracota",
        "telefonica": "bg-blue-100 text-blue-700"
      };
      return estilos[modalidad] || "bg-gray-100 text-gray-700";
    };
    const obtenerEstiloEstado = (estado) => {
      const estilos = {
        "pendiente": "bg-yellow-100 text-yellow-700",
        "confirmada": "bg-green-100 text-green-700",
        "realizada": "bg-blue-100 text-blue-700",
        "cancelada": "bg-red-100 text-red-700"
      };
      return estilos[estado] || "bg-gray-100 text-gray-700";
    };
    const irABonos = () => {
      router.push(`/terapeuta/pacientes/${pacienteId.value}/bonos`);
    };
    const abrirWhatsApp = () => {
      var _a;
      const telefono = (_a = pacienteData.value) == null ? void 0 : _a.telefono;
      if (!telefono) {
        alert("Este paciente no tiene tel\xE9fono registrado");
        return;
      }
      const numeroLimpio = telefono.replace(/\D/g, "");
      const mensaje = encodeURIComponent(`Hola ${nombreCompleto.value}, \xBFc\xF3mo est\xE1s?`);
      const url = `https://wa.me/${numeroLimpio}?text=${mensaje}`;
      (void 0).open(url, "_blank");
    };
    const agendarSesion = () => {
      if (!pacienteData.value) return;
      pacienteParaCita.value = {
        id: pacienteData.value.id,
        nombre: nombreCompleto.value,
        email: pacienteData.value.email,
        telefono: pacienteData.value.telefono,
        frecuencia: pacienteData.value.frecuencia || "semanal",
        area_acompanamiento: pacienteData.value.area_de_acompanamiento
      };
      modalCitaAbierto.value = true;
    };
    const cerrarModalCita = () => {
      modalCitaAbierto.value = false;
      pacienteParaCita.value = null;
    };
    const onCitaCreada = () => {
      cargarDatosPaciente();
    };
    const verDetallesCita = (citaId) => {
      citaSeleccionada.value = citaId;
      modalDetallesAbierto.value = true;
    };
    const cerrarModalDetalles = () => {
      modalDetallesAbierto.value = false;
      citaSeleccionada.value = null;
    };
    const confirmarCita = async (citaId) => {
      try {
        const { data, error: error2 } = await supabase.rpc("confirmar_cita_y_descontar_bono", {
          p_cita_id: citaId
        });
        if (error2) throw error2;
        if (!data.success) {
          console.error("Error en la confirmaci\xF3n:", data.error);
          alert(data.error || "Error al confirmar la cita");
          return;
        }
        let mensaje = `Cita confirmada con ${data.paciente_nombre || "paciente"}`;
        if (data.bono_id) {
          mensaje += `
Sesiones restantes en bono: ${data.sesiones_restantes}`;
          if (data.bono_agotado) {
            mensaje += "\n\u26A0\uFE0F BONO AGOTADO";
          } else if (data.sesiones_restantes <= 2) {
            mensaje += "\n\u26A0\uFE0F Pocas sesiones restantes";
          }
        }
        alert(mensaje);
        await cargarDatosPaciente();
      } catch (err) {
        console.error("Error al confirmar cita:", err);
        alert("Error al confirmar la cita: " + err.message);
      }
    };
    const editarPaciente = () => {
      alert("Funci\xF3n de editar en desarrollo");
    };
    watch(() => route.params.id, () => {
      if (route.params.id) {
        cargarDatosPaciente();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_DashboardCard = _sfc_main$2;
      const _component_NotasPrivadas = __nuxt_component_1;
      const _component_ModalNuevaCita = __nuxt_component_2;
      const _component_ModalDetallesCita = ModalDetallesCita;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "pb-20" }, _attrs))} data-v-cc632d3a><button class="mb-6 flex items-center gap-2 text-cafe hover:text-terracota transition-colors" data-v-cc632d3a><span data-v-cc632d3a>\u2190</span><span data-v-cc632d3a>Volver a lista de pacientes</span></button>`);
      if (unref(cargando)) {
        _push(`<div class="text-center py-12" data-v-cc632d3a><div class="animate-spin w-12 h-12 border-4 border-terracota border-t-transparent rounded-full mx-auto mb-4" data-v-cc632d3a></div><p class="text-cafe/60" data-v-cc632d3a>Cargando informaci\xF3n del paciente...</p></div>`);
      } else if (unref(error)) {
        _push(`<div class="text-center py-12" data-v-cc632d3a>`);
        _push(ssrRenderComponent(_component_DashboardCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-6xl mb-4 block" data-v-cc632d3a${_scopeId}>\u274C</span><h3 class="text-xl font-serif font-semibold text-cafe mb-2" data-v-cc632d3a${_scopeId}> No se pudo cargar la informaci\xF3n </h3><p class="text-cafe/60 mb-4" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(error))}</p><button class="px-6 py-3 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors" data-v-cc632d3a${_scopeId}> Volver a la lista </button>`);
            } else {
              return [
                createVNode("span", { class: "text-6xl mb-4 block" }, "\u274C"),
                createVNode("h3", { class: "text-xl font-serif font-semibold text-cafe mb-2" }, " No se pudo cargar la informaci\xF3n "),
                createVNode("p", { class: "text-cafe/60 mb-4" }, toDisplayString(unref(error)), 1),
                createVNode("button", {
                  onClick: ($event) => _ctx.$router.push("/terapeuta/pacientes"),
                  class: "px-6 py-3 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors"
                }, " Volver a la lista ", 8, ["onClick"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (unref(pacienteData)) {
        _push(`<div data-v-cc632d3a>`);
        _push(ssrRenderComponent(_component_DashboardCard, { class: "mb-6" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6" data-v-cc632d3a${_scopeId}><div class="flex items-start gap-4" data-v-cc632d3a${_scopeId}><div class="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0" style="${ssrRenderStyle({ backgroundColor: unref(avatarColor) })}" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(iniciales))}</div><div data-v-cc632d3a${_scopeId}><h1 class="text-3xl font-serif font-bold text-cafe mb-2" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(nombreCompleto))}</h1><div class="flex flex-wrap items-center gap-3 mb-3" data-v-cc632d3a${_scopeId}><span class="${ssrRenderClass([unref(estadoClasses), "px-3 py-1 text-sm font-medium rounded-full"])}" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(estadoTexto))}</span><span class="text-cafe/60 text-sm flex items-center gap-1" data-v-cc632d3a${_scopeId}><span data-v-cc632d3a${_scopeId}>\u{1F4E7}</span><span data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(pacienteData).email)}</span></span></div><div class="space-y-1 text-sm" data-v-cc632d3a${_scopeId}>`);
              if (unref(pacienteData).telefono) {
                _push2(`<div class="text-cafe/70 flex items-center gap-2" data-v-cc632d3a${_scopeId}><span data-v-cc632d3a${_scopeId}>\u{1F4F1}</span><span data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(pacienteData).telefono)}</span></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(pacienteData).area_de_acompanamiento) {
                _push2(`<div class="text-cafe/70 flex items-center gap-2" data-v-cc632d3a${_scopeId}><span data-v-cc632d3a${_scopeId}>\u{1F3AF}</span><span data-v-cc632d3a${_scopeId}><strong data-v-cc632d3a${_scopeId}>\xC1rea:</strong> ${ssrInterpolate(unref(pacienteData).area_de_acompanamiento)}</span></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(pacienteData).tipo_bono) {
                _push2(`<div class="text-cafe/70 flex items-center gap-2" data-v-cc632d3a${_scopeId}><span data-v-cc632d3a${_scopeId}>\u{1F3AB}</span><span data-v-cc632d3a${_scopeId}><strong data-v-cc632d3a${_scopeId}>Tipo de Bono:</strong> ${ssrInterpolate(unref(tipoBono))}</span></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div></div><div class="flex flex-wrap gap-2" data-v-cc632d3a${_scopeId}><button class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm flex items-center gap-2" data-v-cc632d3a${_scopeId}><span data-v-cc632d3a${_scopeId}>\u{1F3AB}</span><span data-v-cc632d3a${_scopeId}>Gestionar Bonos</span></button><button class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2" data-v-cc632d3a${_scopeId}><span data-v-cc632d3a${_scopeId}>\u{1F4AC}</span><span data-v-cc632d3a${_scopeId}>WhatsApp</span></button><button class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors text-sm flex items-center gap-2" data-v-cc632d3a${_scopeId}><span data-v-cc632d3a${_scopeId}>\u{1F4C5}</span><span data-v-cc632d3a${_scopeId}>Agendar sesi\xF3n</span></button><button class="px-4 py-2 bg-white border border-terracota/30 text-terracota rounded-lg hover:bg-terracota/5 transition-colors text-sm flex items-center gap-2" data-v-cc632d3a${_scopeId}><span data-v-cc632d3a${_scopeId}>\u270F\uFE0F</span><span data-v-cc632d3a${_scopeId}>Editar</span></button></div></div>`);
            } else {
              return [
                createVNode("div", { class: "flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6" }, [
                  createVNode("div", { class: "flex items-start gap-4" }, [
                    createVNode("div", {
                      class: "w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0",
                      style: { backgroundColor: unref(avatarColor) }
                    }, toDisplayString(unref(iniciales)), 5),
                    createVNode("div", null, [
                      createVNode("h1", { class: "text-3xl font-serif font-bold text-cafe mb-2" }, toDisplayString(unref(nombreCompleto)), 1),
                      createVNode("div", { class: "flex flex-wrap items-center gap-3 mb-3" }, [
                        createVNode("span", {
                          class: ["px-3 py-1 text-sm font-medium rounded-full", unref(estadoClasses)]
                        }, toDisplayString(unref(estadoTexto)), 3),
                        createVNode("span", { class: "text-cafe/60 text-sm flex items-center gap-1" }, [
                          createVNode("span", null, "\u{1F4E7}"),
                          createVNode("span", null, toDisplayString(unref(pacienteData).email), 1)
                        ])
                      ]),
                      createVNode("div", { class: "space-y-1 text-sm" }, [
                        unref(pacienteData).telefono ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "text-cafe/70 flex items-center gap-2"
                        }, [
                          createVNode("span", null, "\u{1F4F1}"),
                          createVNode("span", null, toDisplayString(unref(pacienteData).telefono), 1)
                        ])) : createCommentVNode("", true),
                        unref(pacienteData).area_de_acompanamiento ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: "text-cafe/70 flex items-center gap-2"
                        }, [
                          createVNode("span", null, "\u{1F3AF}"),
                          createVNode("span", null, [
                            createVNode("strong", null, "\xC1rea:"),
                            createTextVNode(" " + toDisplayString(unref(pacienteData).area_de_acompanamiento), 1)
                          ])
                        ])) : createCommentVNode("", true),
                        unref(pacienteData).tipo_bono ? (openBlock(), createBlock("div", {
                          key: 2,
                          class: "text-cafe/70 flex items-center gap-2"
                        }, [
                          createVNode("span", null, "\u{1F3AB}"),
                          createVNode("span", null, [
                            createVNode("strong", null, "Tipo de Bono:"),
                            createTextVNode(" " + toDisplayString(unref(tipoBono)), 1)
                          ])
                        ])) : createCommentVNode("", true)
                      ])
                    ])
                  ]),
                  createVNode("div", { class: "flex flex-wrap gap-2" }, [
                    createVNode("button", {
                      onClick: irABonos,
                      class: "px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm flex items-center gap-2"
                    }, [
                      createVNode("span", null, "\u{1F3AB}"),
                      createVNode("span", null, "Gestionar Bonos")
                    ]),
                    createVNode("button", {
                      onClick: abrirWhatsApp,
                      class: "px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2"
                    }, [
                      createVNode("span", null, "\u{1F4AC}"),
                      createVNode("span", null, "WhatsApp")
                    ]),
                    createVNode("button", {
                      onClick: agendarSesion,
                      class: "px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors text-sm flex items-center gap-2"
                    }, [
                      createVNode("span", null, "\u{1F4C5}"),
                      createVNode("span", null, "Agendar sesi\xF3n")
                    ]),
                    createVNode("button", {
                      onClick: editarPaciente,
                      class: "px-4 py-2 bg-white border border-terracota/30 text-terracota rounded-lg hover:bg-terracota/5 transition-colors text-sm flex items-center gap-2"
                    }, [
                      createVNode("span", null, "\u270F\uFE0F"),
                      createVNode("span", null, "Editar")
                    ])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" data-v-cc632d3a>`);
        _push(ssrRenderComponent(_component_DashboardCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 class="font-serif text-xl font-semibold text-cafe flex items-center gap-2 mb-4" data-v-cc632d3a${_scopeId}><span class="text-2xl" data-v-cc632d3a${_scopeId}>\u{1F4CA}</span> Resumen </h2><div class="space-y-3" data-v-cc632d3a${_scopeId}><div class="flex items-center justify-between p-3 bg-base-bg rounded-lg" data-v-cc632d3a${_scopeId}><span class="text-sm text-cafe/70" data-v-cc632d3a${_scopeId}>Total sesiones</span><span class="font-bold text-cafe text-lg" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(estadisticas).total)}</span></div><div class="flex items-center justify-between p-3 bg-green-50 rounded-lg" data-v-cc632d3a${_scopeId}><span class="text-sm text-cafe/70" data-v-cc632d3a${_scopeId}>Completadas</span><span class="font-bold text-green-600 text-lg" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(estadisticas).completadas)}</span></div><div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg" data-v-cc632d3a${_scopeId}><span class="text-sm text-cafe/70" data-v-cc632d3a${_scopeId}>Pendientes</span><span class="font-bold text-yellow-600 text-lg" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(estadisticas).pendientes)}</span></div><div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg" data-v-cc632d3a${_scopeId}><span class="text-sm text-cafe/70" data-v-cc632d3a${_scopeId}>Pr\xF3ximas</span><span class="font-bold text-blue-600 text-lg" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(estadisticas).proximas)}</span></div></div>`);
            } else {
              return [
                createVNode("h2", { class: "font-serif text-xl font-semibold text-cafe flex items-center gap-2 mb-4" }, [
                  createVNode("span", { class: "text-2xl" }, "\u{1F4CA}"),
                  createTextVNode(" Resumen ")
                ]),
                createVNode("div", { class: "space-y-3" }, [
                  createVNode("div", { class: "flex items-center justify-between p-3 bg-base-bg rounded-lg" }, [
                    createVNode("span", { class: "text-sm text-cafe/70" }, "Total sesiones"),
                    createVNode("span", { class: "font-bold text-cafe text-lg" }, toDisplayString(unref(estadisticas).total), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between p-3 bg-green-50 rounded-lg" }, [
                    createVNode("span", { class: "text-sm text-cafe/70" }, "Completadas"),
                    createVNode("span", { class: "font-bold text-green-600 text-lg" }, toDisplayString(unref(estadisticas).completadas), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between p-3 bg-yellow-50 rounded-lg" }, [
                    createVNode("span", { class: "text-sm text-cafe/70" }, "Pendientes"),
                    createVNode("span", { class: "font-bold text-yellow-600 text-lg" }, toDisplayString(unref(estadisticas).pendientes), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between p-3 bg-blue-50 rounded-lg" }, [
                    createVNode("span", { class: "text-sm text-cafe/70" }, "Pr\xF3ximas"),
                    createVNode("span", { class: "font-bold text-blue-600 text-lg" }, toDisplayString(unref(estadisticas).proximas), 1)
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_DashboardCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 class="font-serif text-xl font-semibold text-cafe flex items-center gap-2 mb-4" data-v-cc632d3a${_scopeId}><span class="text-2xl" data-v-cc632d3a${_scopeId}>\u{1F3AB}</span> Bono Contratado </h2>`);
              if (unref(bonoActivo)) {
                _push2(`<div class="space-y-4" data-v-cc632d3a${_scopeId}><div class="p-3 bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-lg" data-v-cc632d3a${_scopeId}><div class="text-xs text-purple-700 font-medium mb-1" data-v-cc632d3a${_scopeId}>Tipo de Bono</div><div class="text-sm font-bold text-purple-900" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(tipoBono))}</div></div><div class="text-center p-4 bg-gradient-to-br from-terracota/10 to-rosa/20 rounded-xl" data-v-cc632d3a${_scopeId}><div class="text-4xl font-bold text-terracota mb-1" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(bonoActivo).sesiones_disponibles)}</div><div class="text-sm text-cafe/70" data-v-cc632d3a${_scopeId}> de ${ssrInterpolate(unref(bonoActivo).sesiones_totales)} sesiones disponibles </div></div><div class="space-y-2" data-v-cc632d3a${_scopeId}><div class="flex justify-between text-sm" data-v-cc632d3a${_scopeId}><span class="text-cafe/70" data-v-cc632d3a${_scopeId}>Progreso</span><span class="font-medium text-cafe" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(bonoActivo).porcentaje_uso)}%</span></div><div class="w-full bg-gray-200 rounded-full h-2.5" data-v-cc632d3a${_scopeId}><div class="h-2.5 rounded-full bg-gradient-to-r from-terracota to-rosa transition-all" style="${ssrRenderStyle({ width: `${unref(bonoActivo).porcentaje_uso}%` })}" data-v-cc632d3a${_scopeId}></div></div></div><div class="pt-3 border-t space-y-2 text-sm" data-v-cc632d3a${_scopeId}><div class="flex justify-between" data-v-cc632d3a${_scopeId}><span class="text-cafe/70" data-v-cc632d3a${_scopeId}>Sesiones usadas:</span><span class="font-medium text-cafe" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(bonoActivo).sesiones_usadas)}</span></div><div class="flex justify-between" data-v-cc632d3a${_scopeId}><span class="text-cafe/70" data-v-cc632d3a${_scopeId}>Monto total:</span><span class="font-medium text-cafe" data-v-cc632d3a${_scopeId}>${ssrInterpolate(formatearPrecio(unref(bonoActivo).monto_total || unref(bonoActivo).precio))}</span></div><div class="flex justify-between" data-v-cc632d3a${_scopeId}><span class="text-cafe/70" data-v-cc632d3a${_scopeId}>Precio por sesi\xF3n:</span><span class="font-medium text-cafe" data-v-cc632d3a${_scopeId}>${ssrInterpolate(formatearPrecio((unref(bonoActivo).monto_total || unref(bonoActivo).precio) / unref(bonoActivo).sesiones_totales))}</span></div><div class="flex justify-between" data-v-cc632d3a${_scopeId}><span class="text-cafe/70" data-v-cc632d3a${_scopeId}>Estado:</span><span class="${ssrRenderClass([{
                  "text-green-600": unref(bonoActivo).estado === "activo",
                  "text-yellow-600": unref(bonoActivo).estado === "pendiente",
                  "text-gray-600": unref(bonoActivo).estado === "vencido"
                }, "font-medium capitalize"])}" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(bonoActivo).estado)}</span></div></div></div>`);
              } else {
                _push2(`<div class="text-center py-8" data-v-cc632d3a${_scopeId}><span class="text-5xl mb-3 block opacity-40" data-v-cc632d3a${_scopeId}>\u{1F3AB}</span><p class="text-sm text-cafe/50 mb-2" data-v-cc632d3a${_scopeId}>No hay bono activo</p><p class="text-xs text-cafe/40 mb-4" data-v-cc632d3a${_scopeId}> Tipo de bono del paciente: <strong data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(tipoBono) || "No definido")}</strong></p><button class="mt-2 text-sm text-terracota hover:text-cafe transition-colors font-medium" data-v-cc632d3a${_scopeId}> Gestionar bonos \u2192 </button></div>`);
              }
            } else {
              return [
                createVNode("h2", { class: "font-serif text-xl font-semibold text-cafe flex items-center gap-2 mb-4" }, [
                  createVNode("span", { class: "text-2xl" }, "\u{1F3AB}"),
                  createTextVNode(" Bono Contratado ")
                ]),
                unref(bonoActivo) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "space-y-4"
                }, [
                  createVNode("div", { class: "p-3 bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-lg" }, [
                    createVNode("div", { class: "text-xs text-purple-700 font-medium mb-1" }, "Tipo de Bono"),
                    createVNode("div", { class: "text-sm font-bold text-purple-900" }, toDisplayString(unref(tipoBono)), 1)
                  ]),
                  createVNode("div", { class: "text-center p-4 bg-gradient-to-br from-terracota/10 to-rosa/20 rounded-xl" }, [
                    createVNode("div", { class: "text-4xl font-bold text-terracota mb-1" }, toDisplayString(unref(bonoActivo).sesiones_disponibles), 1),
                    createVNode("div", { class: "text-sm text-cafe/70" }, " de " + toDisplayString(unref(bonoActivo).sesiones_totales) + " sesiones disponibles ", 1)
                  ]),
                  createVNode("div", { class: "space-y-2" }, [
                    createVNode("div", { class: "flex justify-between text-sm" }, [
                      createVNode("span", { class: "text-cafe/70" }, "Progreso"),
                      createVNode("span", { class: "font-medium text-cafe" }, toDisplayString(unref(bonoActivo).porcentaje_uso) + "%", 1)
                    ]),
                    createVNode("div", { class: "w-full bg-gray-200 rounded-full h-2.5" }, [
                      createVNode("div", {
                        class: "h-2.5 rounded-full bg-gradient-to-r from-terracota to-rosa transition-all",
                        style: { width: `${unref(bonoActivo).porcentaje_uso}%` }
                      }, null, 4)
                    ])
                  ]),
                  createVNode("div", { class: "pt-3 border-t space-y-2 text-sm" }, [
                    createVNode("div", { class: "flex justify-between" }, [
                      createVNode("span", { class: "text-cafe/70" }, "Sesiones usadas:"),
                      createVNode("span", { class: "font-medium text-cafe" }, toDisplayString(unref(bonoActivo).sesiones_usadas), 1)
                    ]),
                    createVNode("div", { class: "flex justify-between" }, [
                      createVNode("span", { class: "text-cafe/70" }, "Monto total:"),
                      createVNode("span", { class: "font-medium text-cafe" }, toDisplayString(formatearPrecio(unref(bonoActivo).monto_total || unref(bonoActivo).precio)), 1)
                    ]),
                    createVNode("div", { class: "flex justify-between" }, [
                      createVNode("span", { class: "text-cafe/70" }, "Precio por sesi\xF3n:"),
                      createVNode("span", { class: "font-medium text-cafe" }, toDisplayString(formatearPrecio((unref(bonoActivo).monto_total || unref(bonoActivo).precio) / unref(bonoActivo).sesiones_totales)), 1)
                    ]),
                    createVNode("div", { class: "flex justify-between" }, [
                      createVNode("span", { class: "text-cafe/70" }, "Estado:"),
                      createVNode("span", {
                        class: ["font-medium capitalize", {
                          "text-green-600": unref(bonoActivo).estado === "activo",
                          "text-yellow-600": unref(bonoActivo).estado === "pendiente",
                          "text-gray-600": unref(bonoActivo).estado === "vencido"
                        }]
                      }, toDisplayString(unref(bonoActivo).estado), 3)
                    ])
                  ])
                ])) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "text-center py-8"
                }, [
                  createVNode("span", { class: "text-5xl mb-3 block opacity-40" }, "\u{1F3AB}"),
                  createVNode("p", { class: "text-sm text-cafe/50 mb-2" }, "No hay bono activo"),
                  createVNode("p", { class: "text-xs text-cafe/40 mb-4" }, [
                    createTextVNode(" Tipo de bono del paciente: "),
                    createVNode("strong", null, toDisplayString(unref(tipoBono) || "No definido"), 1)
                  ]),
                  createVNode("button", {
                    onClick: irABonos,
                    class: "mt-2 text-sm text-terracota hover:text-cafe transition-colors font-medium"
                  }, " Gestionar bonos \u2192 ")
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_DashboardCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 class="font-serif text-xl font-semibold text-cafe flex items-center gap-2 mb-4" data-v-cc632d3a${_scopeId}><span class="text-2xl" data-v-cc632d3a${_scopeId}>\u{1F4CB}</span> Datos del Proceso </h2><div class="space-y-3" data-v-cc632d3a${_scopeId}><div class="p-3 bg-base-bg rounded-lg" data-v-cc632d3a${_scopeId}><div class="text-xs text-cafe/60 mb-1" data-v-cc632d3a${_scopeId}>Primera sesi\xF3n</div><div class="text-sm font-medium text-cafe" data-v-cc632d3a${_scopeId}>${ssrInterpolate(formatearFecha(unref(primeraSesion)) || "Sin registro")}</div></div><div class="p-3 bg-base-bg rounded-lg" data-v-cc632d3a${_scopeId}><div class="text-xs text-cafe/60 mb-1" data-v-cc632d3a${_scopeId}>\xDAltima sesi\xF3n</div><div class="text-sm font-medium text-cafe" data-v-cc632d3a${_scopeId}>${ssrInterpolate(formatearFecha(unref(ultimaSesion)) || "Sin registro")}</div></div>`);
              if (unref(proximaSesion)) {
                _push2(`<div class="p-4 bg-gradient-to-br from-terracota/20 to-rosa/20 border-2 border-terracota/40 rounded-lg" data-v-cc632d3a${_scopeId}><div class="text-xs font-medium text-terracota mb-2 flex items-center gap-1" data-v-cc632d3a${_scopeId}><span data-v-cc632d3a${_scopeId}>\u{1F4C5}</span><span data-v-cc632d3a${_scopeId}>Pr\xF3xima sesi\xF3n agendada</span></div><div class="text-base font-bold text-cafe mb-3" data-v-cc632d3a${_scopeId}>${ssrInterpolate(formatearFechaCompleta(unref(proximaSesion).fecha_cita, unref(proximaSesion).hora_inicio))}</div><div class="flex items-center gap-2 flex-wrap" data-v-cc632d3a${_scopeId}><span class="text-xs px-3 py-1.5 bg-white border border-terracota/30 rounded-full font-medium flex items-center gap-1" data-v-cc632d3a${_scopeId}>${ssrInterpolate(obtenerIconoModalidad(unref(proximaSesion).modalidad))} ${ssrInterpolate(unref(proximaSesion).modalidad)}</span><span class="${ssrRenderClass([{
                  "text-green-600 border-green-300": unref(proximaSesion).estado === "confirmada",
                  "text-yellow-600 border-yellow-300": unref(proximaSesion).estado === "pendiente",
                  "text-blue-600 border-blue-300": unref(proximaSesion).estado === "programada"
                }, "text-xs px-3 py-1.5 bg-white border border-terracota/30 rounded-full capitalize font-medium"])}" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(proximaSesion).estado)}</span></div>`);
                if (unref(proximaSesion).notas) {
                  _push2(`<div class="mt-3 pt-3 border-t border-terracota/20" data-v-cc632d3a${_scopeId}><div class="text-xs text-cafe/70 mb-1" data-v-cc632d3a${_scopeId}>Notas:</div><div class="text-xs text-cafe" data-v-cc632d3a${_scopeId}>${ssrInterpolate(unref(proximaSesion).notas)}</div></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                _push2(`<div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg" data-v-cc632d3a${_scopeId}><div class="text-center" data-v-cc632d3a${_scopeId}><span class="text-3xl mb-2 block" data-v-cc632d3a${_scopeId}>\u23F0</span><div class="text-sm font-medium text-yellow-800 mb-1" data-v-cc632d3a${_scopeId}>No hay sesi\xF3n agendada</div><div class="text-xs text-yellow-700" data-v-cc632d3a${_scopeId}>Recuerda agendar la pr\xF3xima sesi\xF3n</div><button class="mt-3 px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors text-xs font-medium" data-v-cc632d3a${_scopeId}> Agendar ahora </button></div></div>`);
              }
              _push2(`<div class="p-3 bg-base-bg rounded-lg" data-v-cc632d3a${_scopeId}><div class="text-xs text-cafe/60 mb-1" data-v-cc632d3a${_scopeId}>En proceso desde</div><div class="text-sm font-medium text-cafe" data-v-cc632d3a${_scopeId}>${ssrInterpolate(calcularTiempoProceso(unref(pacienteData).created_at))}</div></div></div>`);
            } else {
              return [
                createVNode("h2", { class: "font-serif text-xl font-semibold text-cafe flex items-center gap-2 mb-4" }, [
                  createVNode("span", { class: "text-2xl" }, "\u{1F4CB}"),
                  createTextVNode(" Datos del Proceso ")
                ]),
                createVNode("div", { class: "space-y-3" }, [
                  createVNode("div", { class: "p-3 bg-base-bg rounded-lg" }, [
                    createVNode("div", { class: "text-xs text-cafe/60 mb-1" }, "Primera sesi\xF3n"),
                    createVNode("div", { class: "text-sm font-medium text-cafe" }, toDisplayString(formatearFecha(unref(primeraSesion)) || "Sin registro"), 1)
                  ]),
                  createVNode("div", { class: "p-3 bg-base-bg rounded-lg" }, [
                    createVNode("div", { class: "text-xs text-cafe/60 mb-1" }, "\xDAltima sesi\xF3n"),
                    createVNode("div", { class: "text-sm font-medium text-cafe" }, toDisplayString(formatearFecha(unref(ultimaSesion)) || "Sin registro"), 1)
                  ]),
                  unref(proximaSesion) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "p-4 bg-gradient-to-br from-terracota/20 to-rosa/20 border-2 border-terracota/40 rounded-lg"
                  }, [
                    createVNode("div", { class: "text-xs font-medium text-terracota mb-2 flex items-center gap-1" }, [
                      createVNode("span", null, "\u{1F4C5}"),
                      createVNode("span", null, "Pr\xF3xima sesi\xF3n agendada")
                    ]),
                    createVNode("div", { class: "text-base font-bold text-cafe mb-3" }, toDisplayString(formatearFechaCompleta(unref(proximaSesion).fecha_cita, unref(proximaSesion).hora_inicio)), 1),
                    createVNode("div", { class: "flex items-center gap-2 flex-wrap" }, [
                      createVNode("span", { class: "text-xs px-3 py-1.5 bg-white border border-terracota/30 rounded-full font-medium flex items-center gap-1" }, toDisplayString(obtenerIconoModalidad(unref(proximaSesion).modalidad)) + " " + toDisplayString(unref(proximaSesion).modalidad), 1),
                      createVNode("span", {
                        class: ["text-xs px-3 py-1.5 bg-white border border-terracota/30 rounded-full capitalize font-medium", {
                          "text-green-600 border-green-300": unref(proximaSesion).estado === "confirmada",
                          "text-yellow-600 border-yellow-300": unref(proximaSesion).estado === "pendiente",
                          "text-blue-600 border-blue-300": unref(proximaSesion).estado === "programada"
                        }]
                      }, toDisplayString(unref(proximaSesion).estado), 3)
                    ]),
                    unref(proximaSesion).notas ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "mt-3 pt-3 border-t border-terracota/20"
                    }, [
                      createVNode("div", { class: "text-xs text-cafe/70 mb-1" }, "Notas:"),
                      createVNode("div", { class: "text-xs text-cafe" }, toDisplayString(unref(proximaSesion).notas), 1)
                    ])) : createCommentVNode("", true)
                  ])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  }, [
                    createVNode("div", { class: "text-center" }, [
                      createVNode("span", { class: "text-3xl mb-2 block" }, "\u23F0"),
                      createVNode("div", { class: "text-sm font-medium text-yellow-800 mb-1" }, "No hay sesi\xF3n agendada"),
                      createVNode("div", { class: "text-xs text-yellow-700" }, "Recuerda agendar la pr\xF3xima sesi\xF3n"),
                      createVNode("button", {
                        onClick: agendarSesion,
                        class: "mt-3 px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors text-xs font-medium"
                      }, " Agendar ahora ")
                    ])
                  ])),
                  createVNode("div", { class: "p-3 bg-base-bg rounded-lg" }, [
                    createVNode("div", { class: "text-xs text-cafe/60 mb-1" }, "En proceso desde"),
                    createVNode("div", { class: "text-sm font-medium text-cafe" }, toDisplayString(calcularTiempoProceso(unref(pacienteData).created_at)), 1)
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="mb-6" data-v-cc632d3a><div class="border-b border-gray-200" data-v-cc632d3a><nav class="-mb-px flex space-x-8 overflow-x-auto" data-v-cc632d3a><!--[-->`);
        ssrRenderList(unref(tabs), (tab) => {
          _push(`<button class="${ssrRenderClass([unref(tabActiva) === tab.id ? "border-terracota text-terracota" : "border-transparent text-cafe/60 hover:text-cafe hover:border-gray-300", "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"])}" data-v-cc632d3a><span class="mr-2" data-v-cc632d3a>${ssrInterpolate(tab.icono)}</span><span data-v-cc632d3a>${ssrInterpolate(tab.nombre)}</span>`);
          if (tab.badge) {
            _push(`<span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-terracota text-white" data-v-cc632d3a>${ssrInterpolate(tab.badge)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button>`);
        });
        _push(`<!--]--></nav></div></div><div class="space-y-6" data-v-cc632d3a>`);
        if (unref(tabActiva) === "proximas") {
          _push(`<div data-v-cc632d3a>`);
          _push(ssrRenderComponent(_component_DashboardCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-center justify-between mb-4" data-v-cc632d3a${_scopeId}><h3 class="text-lg font-serif font-semibold text-cafe" data-v-cc632d3a${_scopeId}>Pr\xF3ximas Sesiones Agendadas</h3><button class="text-sm text-terracota hover:text-cafe transition-colors" data-v-cc632d3a${_scopeId}> + Nueva sesi\xF3n </button></div>`);
                if (unref(sesionesProximas).length > 0) {
                  _push2(`<div class="space-y-3" data-v-cc632d3a${_scopeId}><!--[-->`);
                  ssrRenderList(unref(sesionesProximas), (sesion) => {
                    _push2(`<div class="p-4 bg-base-bg rounded-lg hover:bg-rosa/20 transition-colors" data-v-cc632d3a${_scopeId}><div class="flex items-start justify-between gap-4" data-v-cc632d3a${_scopeId}><div class="flex-1" data-v-cc632d3a${_scopeId}><div class="flex items-center gap-2 mb-2" data-v-cc632d3a${_scopeId}><span class="text-lg font-semibold text-cafe" data-v-cc632d3a${_scopeId}>${ssrInterpolate(formatearFecha(sesion.fecha_cita))}</span><span class="text-base font-medium text-terracota" data-v-cc632d3a${_scopeId}>${ssrInterpolate(sesion.hora_inicio)} - ${ssrInterpolate(sesion.hora_fin)}</span></div><div class="flex flex-wrap items-center gap-2 mb-2" data-v-cc632d3a${_scopeId}><span class="${ssrRenderClass([obtenerEstiloModalidad(sesion.modalidad), "px-2 py-0.5 text-xs rounded-full"])}" data-v-cc632d3a${_scopeId}>${ssrInterpolate(obtenerIconoModalidad(sesion.modalidad))} ${ssrInterpolate(sesion.modalidad)}</span><span class="${ssrRenderClass([obtenerEstiloEstado(sesion.estado), "px-2 py-0.5 text-xs rounded-full capitalize"])}" data-v-cc632d3a${_scopeId}>${ssrInterpolate(sesion.estado)}</span></div>`);
                    if (sesion.observaciones) {
                      _push2(`<p class="text-sm text-cafe/60 mt-2" data-v-cc632d3a${_scopeId}>${ssrInterpolate(sesion.observaciones)}</p>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`</div><button class="px-3 py-1.5 text-sm bg-white border border-terracota/30 text-terracota hover:bg-terracota hover:text-white rounded-lg transition-colors" data-v-cc632d3a${_scopeId}> Ver detalles </button></div></div>`);
                  });
                  _push2(`<!--]--></div>`);
                } else {
                  _push2(`<div class="text-center py-12" data-v-cc632d3a${_scopeId}><span class="text-6xl mb-3 block opacity-40" data-v-cc632d3a${_scopeId}>\u{1F4C5}</span><p class="text-cafe/60 mb-4" data-v-cc632d3a${_scopeId}>No hay sesiones pr\xF3ximas agendadas</p><button class="px-6 py-3 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors" data-v-cc632d3a${_scopeId}> Agendar primera sesi\xF3n </button></div>`);
                }
              } else {
                return [
                  createVNode("div", { class: "flex items-center justify-between mb-4" }, [
                    createVNode("h3", { class: "text-lg font-serif font-semibold text-cafe" }, "Pr\xF3ximas Sesiones Agendadas"),
                    createVNode("button", {
                      onClick: agendarSesion,
                      class: "text-sm text-terracota hover:text-cafe transition-colors"
                    }, " + Nueva sesi\xF3n ")
                  ]),
                  unref(sesionesProximas).length > 0 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "space-y-3"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(sesionesProximas), (sesion) => {
                      return openBlock(), createBlock("div", {
                        key: sesion.id,
                        class: "p-4 bg-base-bg rounded-lg hover:bg-rosa/20 transition-colors"
                      }, [
                        createVNode("div", { class: "flex items-start justify-between gap-4" }, [
                          createVNode("div", { class: "flex-1" }, [
                            createVNode("div", { class: "flex items-center gap-2 mb-2" }, [
                              createVNode("span", { class: "text-lg font-semibold text-cafe" }, toDisplayString(formatearFecha(sesion.fecha_cita)), 1),
                              createVNode("span", { class: "text-base font-medium text-terracota" }, toDisplayString(sesion.hora_inicio) + " - " + toDisplayString(sesion.hora_fin), 1)
                            ]),
                            createVNode("div", { class: "flex flex-wrap items-center gap-2 mb-2" }, [
                              createVNode("span", {
                                class: ["px-2 py-0.5 text-xs rounded-full", obtenerEstiloModalidad(sesion.modalidad)]
                              }, toDisplayString(obtenerIconoModalidad(sesion.modalidad)) + " " + toDisplayString(sesion.modalidad), 3),
                              createVNode("span", {
                                class: ["px-2 py-0.5 text-xs rounded-full capitalize", obtenerEstiloEstado(sesion.estado)]
                              }, toDisplayString(sesion.estado), 3)
                            ]),
                            sesion.observaciones ? (openBlock(), createBlock("p", {
                              key: 0,
                              class: "text-sm text-cafe/60 mt-2"
                            }, toDisplayString(sesion.observaciones), 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("button", {
                            onClick: ($event) => verDetallesCita(sesion.id),
                            class: "px-3 py-1.5 text-sm bg-white border border-terracota/30 text-terracota hover:bg-terracota hover:text-white rounded-lg transition-colors"
                          }, " Ver detalles ", 8, ["onClick"])
                        ])
                      ]);
                    }), 128))
                  ])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "text-center py-12"
                  }, [
                    createVNode("span", { class: "text-6xl mb-3 block opacity-40" }, "\u{1F4C5}"),
                    createVNode("p", { class: "text-cafe/60 mb-4" }, "No hay sesiones pr\xF3ximas agendadas"),
                    createVNode("button", {
                      onClick: agendarSesion,
                      class: "px-6 py-3 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors"
                    }, " Agendar primera sesi\xF3n ")
                  ]))
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(tabActiva) === "completadas") {
          _push(`<div data-v-cc632d3a>`);
          _push(ssrRenderComponent(_component_DashboardCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h3 class="text-lg font-serif font-semibold text-cafe mb-4" data-v-cc632d3a${_scopeId}>Historial de Sesiones Completadas</h3>`);
                if (unref(sesionesCompletadas).length > 0) {
                  _push2(`<div class="space-y-3" data-v-cc632d3a${_scopeId}><!--[-->`);
                  ssrRenderList(unref(sesionesCompletadas), (sesion) => {
                    _push2(`<div class="p-4 bg-base-bg rounded-lg hover:bg-rosa/20 transition-colors" data-v-cc632d3a${_scopeId}><div class="flex items-start justify-between gap-4" data-v-cc632d3a${_scopeId}><div class="flex-1" data-v-cc632d3a${_scopeId}><div class="flex items-center gap-2 mb-2" data-v-cc632d3a${_scopeId}><span class="text-base font-semibold text-cafe" data-v-cc632d3a${_scopeId}>${ssrInterpolate(formatearFecha(sesion.fecha_cita))}</span><span class="text-sm text-cafe/60" data-v-cc632d3a${_scopeId}>${ssrInterpolate(sesion.hora_inicio)} - ${ssrInterpolate(sesion.hora_fin)}</span><span class="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700" data-v-cc632d3a${_scopeId}> \u2713 Realizada </span></div><div class="flex items-center gap-2 mb-2" data-v-cc632d3a${_scopeId}><span class="${ssrRenderClass([obtenerEstiloModalidad(sesion.modalidad), "px-2 py-0.5 text-xs rounded-full"])}" data-v-cc632d3a${_scopeId}>${ssrInterpolate(obtenerIconoModalidad(sesion.modalidad))} ${ssrInterpolate(sesion.modalidad)}</span></div>`);
                    if (sesion.notas_terapeuta) {
                      _push2(`<p class="text-sm text-cafe/70 mt-2 bg-white p-3 rounded-lg border border-gray-100" data-v-cc632d3a${_scopeId}><strong class="text-cafe" data-v-cc632d3a${_scopeId}>Notas:</strong> ${ssrInterpolate(sesion.notas_terapeuta)}</p>`);
                    } else if (sesion.observaciones) {
                      _push2(`<p class="text-sm text-cafe/60 mt-2" data-v-cc632d3a${_scopeId}>${ssrInterpolate(sesion.observaciones)}</p>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`</div></div></div>`);
                  });
                  _push2(`<!--]--></div>`);
                } else {
                  _push2(`<div class="text-center py-12" data-v-cc632d3a${_scopeId}><span class="text-6xl mb-3 block opacity-40" data-v-cc632d3a${_scopeId}>\u{1F4DD}</span><p class="text-cafe/60" data-v-cc632d3a${_scopeId}>A\xFAn no hay sesiones completadas</p></div>`);
                }
              } else {
                return [
                  createVNode("h3", { class: "text-lg font-serif font-semibold text-cafe mb-4" }, "Historial de Sesiones Completadas"),
                  unref(sesionesCompletadas).length > 0 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "space-y-3"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(sesionesCompletadas), (sesion) => {
                      return openBlock(), createBlock("div", {
                        key: sesion.id,
                        class: "p-4 bg-base-bg rounded-lg hover:bg-rosa/20 transition-colors"
                      }, [
                        createVNode("div", { class: "flex items-start justify-between gap-4" }, [
                          createVNode("div", { class: "flex-1" }, [
                            createVNode("div", { class: "flex items-center gap-2 mb-2" }, [
                              createVNode("span", { class: "text-base font-semibold text-cafe" }, toDisplayString(formatearFecha(sesion.fecha_cita)), 1),
                              createVNode("span", { class: "text-sm text-cafe/60" }, toDisplayString(sesion.hora_inicio) + " - " + toDisplayString(sesion.hora_fin), 1),
                              createVNode("span", { class: "px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700" }, " \u2713 Realizada ")
                            ]),
                            createVNode("div", { class: "flex items-center gap-2 mb-2" }, [
                              createVNode("span", {
                                class: ["px-2 py-0.5 text-xs rounded-full", obtenerEstiloModalidad(sesion.modalidad)]
                              }, toDisplayString(obtenerIconoModalidad(sesion.modalidad)) + " " + toDisplayString(sesion.modalidad), 3)
                            ]),
                            sesion.notas_terapeuta ? (openBlock(), createBlock("p", {
                              key: 0,
                              class: "text-sm text-cafe/70 mt-2 bg-white p-3 rounded-lg border border-gray-100"
                            }, [
                              createVNode("strong", { class: "text-cafe" }, "Notas:"),
                              createTextVNode(" " + toDisplayString(sesion.notas_terapeuta), 1)
                            ])) : sesion.observaciones ? (openBlock(), createBlock("p", {
                              key: 1,
                              class: "text-sm text-cafe/60 mt-2"
                            }, toDisplayString(sesion.observaciones), 1)) : createCommentVNode("", true)
                          ])
                        ])
                      ]);
                    }), 128))
                  ])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "text-center py-12"
                  }, [
                    createVNode("span", { class: "text-6xl mb-3 block opacity-40" }, "\u{1F4DD}"),
                    createVNode("p", { class: "text-cafe/60" }, "A\xFAn no hay sesiones completadas")
                  ]))
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(tabActiva) === "pendientes") {
          _push(`<div data-v-cc632d3a>`);
          _push(ssrRenderComponent(_component_DashboardCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h3 class="text-lg font-serif font-semibold text-cafe mb-4" data-v-cc632d3a${_scopeId}>Sesiones Pendientes de Confirmaci\xF3n</h3>`);
                if (unref(sesionesPendientes).length > 0) {
                  _push2(`<div class="space-y-3" data-v-cc632d3a${_scopeId}><!--[-->`);
                  ssrRenderList(unref(sesionesPendientes), (sesion) => {
                    _push2(`<div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg" data-v-cc632d3a${_scopeId}><div class="flex items-start justify-between gap-4" data-v-cc632d3a${_scopeId}><div class="flex-1" data-v-cc632d3a${_scopeId}><div class="flex items-center gap-2 mb-2" data-v-cc632d3a${_scopeId}><span class="text-lg" data-v-cc632d3a${_scopeId}>\u23F3</span><span class="text-base font-semibold text-cafe" data-v-cc632d3a${_scopeId}>${ssrInterpolate(formatearFecha(sesion.fecha_cita))}</span><span class="text-base font-medium text-terracota" data-v-cc632d3a${_scopeId}>${ssrInterpolate(sesion.hora_inicio)} - ${ssrInterpolate(sesion.hora_fin)}</span></div><div class="flex items-center gap-2 mb-2" data-v-cc632d3a${_scopeId}><span class="${ssrRenderClass([obtenerEstiloModalidad(sesion.modalidad), "px-2 py-0.5 text-xs rounded-full"])}" data-v-cc632d3a${_scopeId}>${ssrInterpolate(obtenerIconoModalidad(sesion.modalidad))} ${ssrInterpolate(sesion.modalidad)}</span><span class="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700" data-v-cc632d3a${_scopeId}> Pendiente de confirmar </span></div>`);
                    if (sesion.observaciones) {
                      _push2(`<p class="text-sm text-cafe/60 mt-2" data-v-cc632d3a${_scopeId}>${ssrInterpolate(sesion.observaciones)}</p>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`</div><div class="flex gap-2" data-v-cc632d3a${_scopeId}><button class="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors" data-v-cc632d3a${_scopeId}> \u2713 Confirmar </button><button class="px-3 py-1.5 text-sm bg-white border border-terracota/30 text-terracota hover:bg-terracota hover:text-white rounded-lg transition-colors" data-v-cc632d3a${_scopeId}> Ver </button></div></div></div>`);
                  });
                  _push2(`<!--]--></div>`);
                } else {
                  _push2(`<div class="text-center py-12" data-v-cc632d3a${_scopeId}><span class="text-6xl mb-3 block opacity-40" data-v-cc632d3a${_scopeId}>\u2705</span><p class="text-cafe/60" data-v-cc632d3a${_scopeId}>No hay sesiones pendientes de confirmaci\xF3n</p></div>`);
                }
              } else {
                return [
                  createVNode("h3", { class: "text-lg font-serif font-semibold text-cafe mb-4" }, "Sesiones Pendientes de Confirmaci\xF3n"),
                  unref(sesionesPendientes).length > 0 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "space-y-3"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(sesionesPendientes), (sesion) => {
                      return openBlock(), createBlock("div", {
                        key: sesion.id,
                        class: "p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                      }, [
                        createVNode("div", { class: "flex items-start justify-between gap-4" }, [
                          createVNode("div", { class: "flex-1" }, [
                            createVNode("div", { class: "flex items-center gap-2 mb-2" }, [
                              createVNode("span", { class: "text-lg" }, "\u23F3"),
                              createVNode("span", { class: "text-base font-semibold text-cafe" }, toDisplayString(formatearFecha(sesion.fecha_cita)), 1),
                              createVNode("span", { class: "text-base font-medium text-terracota" }, toDisplayString(sesion.hora_inicio) + " - " + toDisplayString(sesion.hora_fin), 1)
                            ]),
                            createVNode("div", { class: "flex items-center gap-2 mb-2" }, [
                              createVNode("span", {
                                class: ["px-2 py-0.5 text-xs rounded-full", obtenerEstiloModalidad(sesion.modalidad)]
                              }, toDisplayString(obtenerIconoModalidad(sesion.modalidad)) + " " + toDisplayString(sesion.modalidad), 3),
                              createVNode("span", { class: "px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700" }, " Pendiente de confirmar ")
                            ]),
                            sesion.observaciones ? (openBlock(), createBlock("p", {
                              key: 0,
                              class: "text-sm text-cafe/60 mt-2"
                            }, toDisplayString(sesion.observaciones), 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("div", { class: "flex gap-2" }, [
                            createVNode("button", {
                              onClick: ($event) => confirmarCita(sesion.id),
                              class: "px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            }, " \u2713 Confirmar ", 8, ["onClick"]),
                            createVNode("button", {
                              onClick: ($event) => verDetallesCita(sesion.id),
                              class: "px-3 py-1.5 text-sm bg-white border border-terracota/30 text-terracota hover:bg-terracota hover:text-white rounded-lg transition-colors"
                            }, " Ver ", 8, ["onClick"])
                          ])
                        ])
                      ]);
                    }), 128))
                  ])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "text-center py-12"
                  }, [
                    createVNode("span", { class: "text-6xl mb-3 block opacity-40" }, "\u2705"),
                    createVNode("p", { class: "text-cafe/60" }, "No hay sesiones pendientes de confirmaci\xF3n")
                  ]))
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(tabActiva) === "anteriores") {
          _push(`<div data-v-cc632d3a>`);
          _push(ssrRenderComponent(_component_DashboardCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h3 class="text-lg font-serif font-semibold text-cafe mb-4" data-v-cc632d3a${_scopeId}> Historial Completo de Sesiones </h3>`);
                if (unref(todasLasSesiones).length > 0) {
                  _push2(`<div class="space-y-3" data-v-cc632d3a${_scopeId}><!--[-->`);
                  ssrRenderList(unref(todasLasSesiones), (sesion) => {
                    _push2(`<div class="p-4 bg-base-bg rounded-lg hover:bg-rosa/20 transition-colors" data-v-cc632d3a${_scopeId}><div class="flex items-start justify-between gap-4" data-v-cc632d3a${_scopeId}><div class="flex-1" data-v-cc632d3a${_scopeId}><div class="flex items-center gap-2 mb-2" data-v-cc632d3a${_scopeId}><span class="text-base font-semibold text-cafe" data-v-cc632d3a${_scopeId}>${ssrInterpolate(formatearFecha(sesion.fecha_cita))}</span><span class="text-sm text-cafe/60" data-v-cc632d3a${_scopeId}>${ssrInterpolate(sesion.hora_inicio)} - ${ssrInterpolate(sesion.hora_fin)}</span></div><div class="flex flex-wrap items-center gap-2" data-v-cc632d3a${_scopeId}><span class="${ssrRenderClass([obtenerEstiloModalidad(sesion.modalidad), "px-2 py-0.5 text-xs rounded-full"])}" data-v-cc632d3a${_scopeId}>${ssrInterpolate(obtenerIconoModalidad(sesion.modalidad))} ${ssrInterpolate(sesion.modalidad)}</span><span class="${ssrRenderClass([obtenerEstiloEstado(sesion.estado), "px-2 py-0.5 text-xs rounded-full capitalize"])}" data-v-cc632d3a${_scopeId}>${ssrInterpolate(sesion.estado)}</span></div></div></div></div>`);
                  });
                  _push2(`<!--]--></div>`);
                } else {
                  _push2(`<div class="text-center py-12" data-v-cc632d3a${_scopeId}><span class="text-6xl mb-3 block opacity-40" data-v-cc632d3a${_scopeId}>\u{1F4DA}</span><p class="text-cafe/60" data-v-cc632d3a${_scopeId}>No hay sesiones registradas</p></div>`);
                }
              } else {
                return [
                  createVNode("h3", { class: "text-lg font-serif font-semibold text-cafe mb-4" }, " Historial Completo de Sesiones "),
                  unref(todasLasSesiones).length > 0 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "space-y-3"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(todasLasSesiones), (sesion) => {
                      return openBlock(), createBlock("div", {
                        key: sesion.id,
                        class: "p-4 bg-base-bg rounded-lg hover:bg-rosa/20 transition-colors"
                      }, [
                        createVNode("div", { class: "flex items-start justify-between gap-4" }, [
                          createVNode("div", { class: "flex-1" }, [
                            createVNode("div", { class: "flex items-center gap-2 mb-2" }, [
                              createVNode("span", { class: "text-base font-semibold text-cafe" }, toDisplayString(formatearFecha(sesion.fecha_cita)), 1),
                              createVNode("span", { class: "text-sm text-cafe/60" }, toDisplayString(sesion.hora_inicio) + " - " + toDisplayString(sesion.hora_fin), 1)
                            ]),
                            createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                              createVNode("span", {
                                class: ["px-2 py-0.5 text-xs rounded-full", obtenerEstiloModalidad(sesion.modalidad)]
                              }, toDisplayString(obtenerIconoModalidad(sesion.modalidad)) + " " + toDisplayString(sesion.modalidad), 3),
                              createVNode("span", {
                                class: ["px-2 py-0.5 text-xs rounded-full capitalize", obtenerEstiloEstado(sesion.estado)]
                              }, toDisplayString(sesion.estado), 3)
                            ])
                          ])
                        ])
                      ]);
                    }), 128))
                  ])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "text-center py-12"
                  }, [
                    createVNode("span", { class: "text-6xl mb-3 block opacity-40" }, "\u{1F4DA}"),
                    createVNode("p", { class: "text-cafe/60" }, "No hay sesiones registradas")
                  ]))
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="mt-6" data-v-cc632d3a>`);
        _push(ssrRenderComponent(_component_DashboardCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h2 class="font-serif text-xl font-semibold text-cafe flex items-center gap-2 mb-4" data-v-cc632d3a${_scopeId}><span class="text-2xl" data-v-cc632d3a${_scopeId}>\u{1F4DD}</span> Notas Cl\xEDnicas Privadas </h2>`);
              _push2(ssrRenderComponent(_component_NotasPrivadas, {
                "paciente-id": unref(pacienteId),
                contenido: unref(notasClinicas),
                "ultima-actualizacion": unref(notasActualizacion) || void 0,
                onGuardar: guardarNotas
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode("h2", { class: "font-serif text-xl font-semibold text-cafe flex items-center gap-2 mb-4" }, [
                  createVNode("span", { class: "text-2xl" }, "\u{1F4DD}"),
                  createTextVNode(" Notas Cl\xEDnicas Privadas ")
                ]),
                createVNode(_component_NotasPrivadas, {
                  "paciente-id": unref(pacienteId),
                  contenido: unref(notasClinicas),
                  "ultima-actualizacion": unref(notasActualizacion) || void 0,
                  onGuardar: guardarNotas
                }, null, 8, ["paciente-id", "contenido", "ultima-actualizacion"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_ModalNuevaCita, {
        mostrar: unref(modalCitaAbierto),
        "paciente-preseleccionado": unref(pacienteParaCita),
        onCerrar: cerrarModalCita,
        onCitaCreada
      }, null, _parent));
      _push(ssrRenderComponent(_component_ModalDetallesCita, {
        "is-open": unref(modalDetallesAbierto),
        "cita-id": unref(citaSeleccionada),
        onClose: cerrarModalDetalles
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/terapeuta/pacientes/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cc632d3a"]]);

export { _id_ as default };
//# sourceMappingURL=_id_-C1V-dEMC.mjs.map
