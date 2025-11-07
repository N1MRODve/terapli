import { ref, computed, watch, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { ArrowsPointingOutIcon, ClockIcon } from '@heroicons/vue/24/outline';
import { _ as __nuxt_component_2 } from './ModalNuevaCita-6Mm-k6WH.mjs';
import { M as ModalDetallesCita } from './ModalDetallesCita-4YIA-weF.mjs';
import { _ as __nuxt_component_5 } from './ModalEditarCita-Dnm8mnH7.mjs';
import { _ as __nuxt_component_1 } from './ModalCancelarCita-CLZyGkL8.mjs';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { a as useRouter } from './server.mjs';
import { u as useCitas } from './useCitas-DyEZH6RI.mjs';
import './useSupabase-DljD0dj8.mjs';
import './_plugin-vue_export-helper-1tPrXgE0.mjs';
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

const _sfc_main = {
  __name: "agenda",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    useRouter();
    const vista = ref("semana");
    const fechaSeleccionada = ref(/* @__PURE__ */ new Date());
    const cargando = ref(true);
    const citas = ref([]);
    const filtroEstado = ref("");
    const filtroModalidad = ref("");
    const busqueda = ref("");
    const mostrarModalNueva = ref(false);
    const mostrarModalDetalles = ref(false);
    const mostrarModalEditar = ref(false);
    const mostrarModalCancelar = ref(false);
    const citaSeleccionada = ref(null);
    const citaParaCancelar = ref(null);
    const mostrarConfirmacionRecordatorios = ref(false);
    const enviandoRecordatorios = ref(false);
    const fechaPreseleccionada = ref(null);
    const horaPreseleccionada = ref(null);
    ref(null);
    const celdaObjetivo = ref(null);
    useCitas();
    const horasDelDia = [
      // Mañana: 11:00 - 13:00 (antes del descanso)
      "11:00",
      "12:00",
      "13:00",
      // Descanso: 14:00 - 16:00 (no mostrar)
      // Tarde/Noche: 17:00 - 22:00 (después del descanso)
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00"
    ];
    const citasFiltradas = computed(() => {
      let resultado = citas.value;
      if (filtroEstado.value) {
        resultado = resultado.filter((c) => c.estado === filtroEstado.value);
      }
      if (filtroModalidad.value) {
        resultado = resultado.filter((c) => c.modalidad === filtroModalidad.value);
      }
      if (busqueda.value.trim()) {
        const query = busqueda.value.toLowerCase();
        resultado = resultado.filter(
          (c) => c.paciente_nombre?.toLowerCase().includes(query)
        );
      }
      return resultado;
    });
    const citasPorEstado = computed(() => {
      return {
        pendiente: citasFiltradas.value.filter((c) => c.estado === "pendiente").length,
        confirmada: citasFiltradas.value.filter((c) => c.estado === "confirmada").length,
        realizada: citasFiltradas.value.filter((c) => c.estado === "realizada").length,
        cancelada: citasFiltradas.value.filter((c) => c.estado === "cancelada").length
      };
    });
    const citasHoyParaRecordatorio = computed(() => {
      const hoy = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      return citasFiltradas.value.filter(
        (c) => c.fecha_cita === hoy && (c.estado === "pendiente" || c.estado === "confirmada")
      );
    });
    const diasSemana = computed(() => {
      const inicio = new Date(fechaSeleccionada.value);
      inicio.setDate(inicio.getDate() - inicio.getDay());
      return Array.from({ length: 7 }, (_, i) => {
        const fecha = new Date(inicio);
        fecha.setDate(inicio.getDate() + i);
        return {
          fecha: fecha.toISOString().split("T")[0],
          nombreDia: fecha.toLocaleDateString("es-ES", { weekday: "short" }),
          numeroDia: fecha.getDate(),
          mes: fecha.toLocaleDateString("es-ES", { month: "short" })
        };
      });
    });
    const diasDelMes = computed(() => {
      const año = fechaSeleccionada.value.getFullYear();
      const mes = fechaSeleccionada.value.getMonth();
      const primerDia = new Date(año, mes, 1);
      const ultimoDia = new Date(año, mes + 1, 0);
      const dias = [];
      for (let dia = primerDia; dia <= ultimoDia; dia.setDate(dia.getDate() + 1)) {
        dias.push({
          fecha: new Date(dia).toISOString().split("T")[0],
          nombreCompleto: new Date(dia).toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long"
          })
        });
      }
      return dias;
    });
    const formatearFechaLarga = (fecha) => {
      return fecha.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    };
    const formatearFechaCompleta = (fecha) => {
      return fecha.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    };
    const filtrosActivos = () => {
      const filtros = [];
      if (filtroEstado.value) filtros.push(getEstadoLabel(filtroEstado.value));
      if (filtroModalidad.value) filtros.push(filtroModalidad.value);
      if (busqueda.value) filtros.push(`"${busqueda.value}"`);
      return filtros.length > 0 ? filtros.join(" · ") : "Sin filtros";
    };
    const esHoy = (fecha) => {
      const hoy = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      return fecha === hoy;
    };
    const citasPorHora = (hora) => {
      const fechaBuscar = fechaSeleccionada.value.toISOString().split("T")[0];
      return citasFiltradas.value.filter(
        (c) => c.fecha_cita === fechaBuscar && c.hora_inicio?.startsWith(hora)
      );
    };
    const citasPorDiaHora = (fecha, hora) => {
      return citasFiltradas.value.filter(
        (c) => c.fecha_cita === fecha && c.hora_inicio?.startsWith(hora)
      );
    };
    const citasPorDia = (fecha) => {
      return citasFiltradas.value.filter((c) => c.fecha_cita === fecha);
    };
    const getClasesCita = (estado) => {
      const clases = {
        pendiente: "bg-yellow-100 border-l-4 border-yellow-500",
        confirmada: "bg-green-100 border-l-4 border-green-500",
        realizada: "bg-blue-100 border-l-4 border-blue-500",
        cancelada: "bg-red-100 border-l-4 border-red-500"
      };
      return clases[estado] || "bg-gray-100 border-l-4 border-gray-500";
    };
    const getBadgeEstado = (estado) => {
      const badges = {
        pendiente: "bg-yellow-200 text-yellow-800",
        confirmada: "bg-green-200 text-green-800",
        realizada: "bg-blue-200 text-blue-800",
        cancelada: "bg-red-200 text-red-800"
      };
      return badges[estado] || "bg-gray-200 text-gray-800";
    };
    const getEstadoLabel = (estado) => {
      const labels = {
        pendiente: "Pendiente",
        confirmada: "Confirmada",
        realizada: "Realizada",
        cancelada: "Cancelada"
      };
      return labels[estado] || estado;
    };
    const esCeldaObjetivo = (fecha, hora) => {
      return celdaObjetivo.value?.fecha === fecha && celdaObjetivo.value?.hora === hora;
    };
    const cerrarModalDetalles = () => {
      mostrarModalDetalles.value = false;
      citaSeleccionada.value = null;
    };
    const cerrarModalEditar = () => {
      mostrarModalEditar.value = false;
      citaSeleccionada.value = null;
    };
    const cerrarModalCancelar = () => {
      mostrarModalCancelar.value = false;
      citaParaCancelar.value = null;
    };
    const handleCitaCancelada = (resultado) => {
      cerrarModalCancelar();
      cargarCitas();
      const mensaje = resultado?.reintegrada ? "Cita cancelada y sesión reintegrada al bono" : "Cita cancelada exitosamente";
      mostrarNotificacion(mensaje, "success");
    };
    const handleCitaCreada = () => {
      mostrarModalNueva.value = false;
      cargarCitas();
      mostrarNotificacion("Cita creada exitosamente", "success");
    };
    const handleCitaActualizada = () => {
      cargarCitas();
      mostrarNotificacion("Cita actualizada exitosamente", "success");
    };
    const handleCitaEliminada = () => {
      cerrarModalDetalles();
      cargarCitas();
      mostrarNotificacion("Cita eliminada exitosamente", "success");
    };
    const mostrarNotificacion = (mensaje, tipo = "info") => {
      const iconos = {
        success: "✅",
        error: "❌",
        info: "ℹ️",
        warning: "⚠️"
      };
      console.log(`${iconos[tipo]} ${mensaje}`);
    };
    const cargarCitas = async () => {
      cargando.value = true;
      try {
        let fechaInicio, fechaFin;
        if (vista.value === "dia") {
          fechaInicio = fechaSeleccionada.value.toISOString().split("T")[0];
          fechaFin = fechaInicio;
        } else if (vista.value === "semana") {
          const inicio = new Date(fechaSeleccionada.value);
          inicio.setDate(inicio.getDate() - inicio.getDay());
          const fin = new Date(inicio);
          fin.setDate(inicio.getDate() + 6);
          fechaInicio = inicio.toISOString().split("T")[0];
          fechaFin = fin.toISOString().split("T")[0];
        } else {
          const año = fechaSeleccionada.value.getFullYear();
          const mes = fechaSeleccionada.value.getMonth();
          fechaInicio = new Date(año, mes, 1).toISOString().split("T")[0];
          fechaFin = new Date(año, mes + 1, 0).toISOString().split("T")[0];
        }
        const { data, error } = await supabase.from("citas").select(`
        id,
        fecha_cita,
        hora_inicio,
        hora_fin,
        modalidad,
        estado,
        observaciones,
        recordatorio_enviado,
        pacientes (
          nombre_completo,
          email,
          telefono
        )
      `).gte("fecha_cita", fechaInicio).lte("fecha_cita", fechaFin).order("fecha_cita", { ascending: true }).order("hora_inicio", { ascending: true });
        if (error) throw error;
        citas.value = (data || []).map((c) => ({
          id: c.id,
          fecha_cita: c.fecha_cita,
          hora_inicio: c.hora_inicio?.substring(0, 5),
          hora_fin: c.hora_fin?.substring(0, 5),
          modalidad: c.modalidad || "presencial",
          estado: c.estado,
          observaciones: c.observaciones,
          recordatorio_enviado: c.recordatorio_enviado,
          paciente_nombre: c.pacientes?.nombre_completo || c.pacientes?.email || "Sin nombre",
          paciente_telefono: c.pacientes?.telefono
        }));
      } catch (error) {
        console.error("Error al cargar citas:", error);
        mostrarNotificacion("Error al cargar citas", "error");
      } finally {
        cargando.value = false;
      }
    };
    watch([vista, fechaSeleccionada], () => {
      cargarCitas();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-3" }, _attrs))}><div class="bg-white rounded-lg shadow-sm border border-gray-100 p-2.5"><div class="flex items-center justify-between gap-3 mb-2"><div class="flex items-center gap-3"><h1 class="text-lg font-serif font-bold text-cafe">Agenda General</h1><span class="text-xs text-gray-500">${ssrInterpolate(formatearFechaLarga(unref(fechaSeleccionada)))}</span></div><div class="flex items-center gap-2"><div class="flex bg-gray-100 rounded-lg p-0.5"><button class="${ssrRenderClass([unref(vista) === "dia" ? "bg-white text-cafe shadow-sm" : "text-gray-600 hover:text-cafe", "px-2.5 py-1 rounded text-xs font-medium transition-colors"])}"> Día </button><button class="${ssrRenderClass([unref(vista) === "semana" ? "bg-white text-cafe shadow-sm" : "text-gray-600 hover:text-cafe", "px-2.5 py-1 rounded text-xs font-medium transition-colors"])}"> Semana </button><button class="${ssrRenderClass([unref(vista) === "mes" ? "bg-white text-cafe shadow-sm" : "text-gray-600 hover:text-cafe", "px-2.5 py-1 rounded text-xs font-medium transition-colors"])}"> Mes </button></div><div class="flex items-center gap-1"><button class="p-1 rounded hover:bg-gray-100 text-cafe text-sm" title="Anterior"> ← </button><button class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-cafe transition-colors"> Hoy </button><button class="p-1 rounded hover:bg-gray-100 text-cafe text-sm" title="Siguiente"> → </button></div><button class="px-3 py-1 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors text-xs font-medium whitespace-nowrap"> + Nueva </button></div></div><div class="flex flex-wrap gap-2"><select class="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-terracota/20"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "") : ssrLooseEqual(unref(filtroEstado), "")) ? " selected" : ""}>Todos estados</option><option value="pendiente"${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "pendiente") : ssrLooseEqual(unref(filtroEstado), "pendiente")) ? " selected" : ""}>Pendientes</option><option value="confirmada"${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "confirmada") : ssrLooseEqual(unref(filtroEstado), "confirmada")) ? " selected" : ""}>Confirmadas</option><option value="realizada"${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "realizada") : ssrLooseEqual(unref(filtroEstado), "realizada")) ? " selected" : ""}>Realizadas</option><option value="cancelada"${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "cancelada") : ssrLooseEqual(unref(filtroEstado), "cancelada")) ? " selected" : ""}>Canceladas</option></select><select class="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-terracota/20"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filtroModalidad)) ? ssrLooseContain(unref(filtroModalidad), "") : ssrLooseEqual(unref(filtroModalidad), "")) ? " selected" : ""}>Modalidades</option><option value="presencial"${ssrIncludeBooleanAttr(Array.isArray(unref(filtroModalidad)) ? ssrLooseContain(unref(filtroModalidad), "presencial") : ssrLooseEqual(unref(filtroModalidad), "presencial")) ? " selected" : ""}>Presencial</option><option value="virtual"${ssrIncludeBooleanAttr(Array.isArray(unref(filtroModalidad)) ? ssrLooseContain(unref(filtroModalidad), "virtual") : ssrLooseEqual(unref(filtroModalidad), "virtual")) ? " selected" : ""}>Virtual</option></select><input${ssrRenderAttr("value", unref(busqueda))} type="text" placeholder="Buscar paciente..." class="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-terracota/20 flex-1 min-w-[150px]"></div></div>`);
      if (unref(cargando)) {
        _push(`<div class="bg-white rounded-lg shadow-sm border border-gray-100 p-8"><div class="text-center text-gray-400"><span class="text-3xl block mb-2">⏳</span><p class="text-sm">Cargando agenda...</p></div></div>`);
      } else if (unref(vista) === "dia") {
        _push(`<div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col" style="${ssrRenderStyle({ "height": "calc(100vh - 180px)" })}"><div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm p-2.5"><div class="flex items-center justify-between"><div><h3 class="font-semibold text-base text-cafe">${ssrInterpolate(formatearFechaCompleta(unref(fechaSeleccionada)))}</h3><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(unref(citasFiltradas).length)} citas programadas </p></div><div class="text-xs text-gray-600"><span class="font-medium">${ssrInterpolate(filtrosActivos())}</span></div></div></div><div class="flex-1 overflow-y-auto"><div class="divide-y divide-gray-100"><!--[-->`);
        ssrRenderList(horasDelDia, (hora) => {
          _push(`<div${ssrRenderAttr("data-hora", hora)} class="flex hover:bg-gray-50 transition-colors"><div class="w-16 p-2 text-xs font-medium text-gray-600 border-r border-gray-100 bg-gray-50 flex-shrink-0">${ssrInterpolate(hora)}</div><div class="${ssrRenderClass([{ "bg-terracota/20 ring-2 ring-terracota": esCeldaObjetivo(unref(fechaSeleccionada).toISOString().split("T")[0], hora) }, "flex-1 p-2 cursor-pointer hover:bg-terracota/5 transition-colors relative group/cell"])}">`);
          if (citasPorHora(hora).length === 0) {
            _push(`<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none"><span class="text-[10px] text-terracota font-medium bg-white px-2 py-1 rounded-full shadow-sm"> + Agregar cita </span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(citasPorHora(hora), (cita) => {
            _push(`<div draggable="true" class="${ssrRenderClass([getClasesCita(cita.estado), "mb-1.5 p-2 rounded-lg transition-all hover:shadow-md hover:ring-2 hover:ring-terracota/30 group relative cursor-move"])}" title="Arrastra para mover a otra hora/día"><div class="flex items-start justify-between gap-2"><div class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">`);
            _push(ssrRenderComponent(unref(ArrowsPointingOutIcon), { class: "w-3 h-3 text-gray-400" }, null, _parent));
            _push(`</div><div class="flex-1 cursor-pointer"><p class="font-medium text-xs">${ssrInterpolate(cita.paciente_nombre)}</p><div class="flex items-center gap-1.5 mt-0.5"><span class="text-[10px] text-gray-600">${ssrInterpolate(cita.hora_inicio)} - ${ssrInterpolate(cita.hora_fin)}</span><span class="text-[10px] px-1.5 py-0.5 rounded-full bg-white/50">${ssrInterpolate(cita.modalidad)}</span></div></div><div class="flex items-center gap-1.5"><span class="${ssrRenderClass([getBadgeEstado(cita.estado), "text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"])}">${ssrInterpolate(getEstadoLabel(cita.estado))}</span>`);
            if (cita.estado !== "cancelada") {
              _push(`<button class="p-1 rounded hover:bg-red-100 text-red-600 transition-colors opacity-0 group-hover:opacity-100" title="Cancelar cita"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div></div>`);
          });
          _push(`<!--]-->`);
          if (citasPorHora(hora).length === 0) {
            _push(`<div class="text-[10px] text-gray-400 italic"> Sin citas </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div></div>`);
      } else if (unref(vista) === "semana") {
        _push(`<div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col" style="${ssrRenderStyle({ "height": "calc(100vh - 180px)" })}"><div class="min-w-[800px] overflow-x-auto flex-1 flex flex-col"><div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm"><div class="grid grid-cols-8"><div class="p-1.5 border-r border-gray-200 bg-gray-50"></div><!--[-->`);
        ssrRenderList(unref(diasSemana), (dia) => {
          _push(`<div class="${ssrRenderClass([esHoy(dia.fecha) ? "bg-terracota/10" : "bg-white", "p-1.5 text-center border-r border-gray-200 last:border-r-0"])}"><div class="flex items-center justify-center gap-1"><span class="text-[10px] font-medium text-gray-600 uppercase">${ssrInterpolate(dia.nombreDia)}</span><span class="${ssrRenderClass([esHoy(dia.fecha) ? "text-terracota" : "", "text-base font-bold text-cafe"])}">${ssrInterpolate(dia.numeroDia)}</span></div><div class="text-[10px] text-gray-500">${ssrInterpolate(dia.mes)}</div></div>`);
        });
        _push(`<!--]--></div></div><div class="flex-1 overflow-y-auto"><div class="divide-y divide-gray-100"><!--[-->`);
        ssrRenderList(horasDelDia, (hora) => {
          _push(`<div${ssrRenderAttr("data-hora", hora)} class="grid grid-cols-8"><div class="p-2 text-xs font-medium text-gray-600 border-r border-gray-100 bg-gray-50 sticky left-0">${ssrInterpolate(hora)}</div><!--[-->`);
          ssrRenderList(unref(diasSemana), (dia) => {
            _push(`<div class="${ssrRenderClass([[
              esHoy(dia.fecha) ? "bg-terracota/5" : "",
              esCeldaObjetivo(dia.fecha, hora) ? "bg-terracota/20 ring-2 ring-terracota ring-inset" : ""
            ], "p-1.5 border-r border-gray-100 last:border-r-0 hover:bg-terracota/5 transition-colors min-h-[60px] cursor-pointer relative group/cell"])}">`);
            if (citasPorDiaHora(dia.fecha, hora).length === 0) {
              _push(`<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none"><span class="text-[9px] text-terracota font-medium bg-white px-1.5 py-0.5 rounded-full shadow-sm"> + </span></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--[-->`);
            ssrRenderList(citasPorDiaHora(dia.fecha, hora), (cita) => {
              _push(`<div draggable="true" class="${ssrRenderClass([getClasesCita(cita.estado), "text-[10px] p-1.5 rounded mb-1 hover:shadow-md hover:ring-2 hover:ring-terracota/30 transition-all group relative cursor-move"])}" title="Arrastra para mover"><div class="cursor-pointer"><p class="font-semibold truncate text-[11px]">${ssrInterpolate(cita.paciente_nombre)}</p><p class="text-[9px] text-gray-600 mt-0.5">${ssrInterpolate(cita.hora_inicio.slice(0, 5))}</p></div>`);
              if (cita.estado !== "cancelada") {
                _push(`<button class="absolute top-0.5 right-0.5 p-0.5 rounded hover:bg-red-100 text-red-600 transition-colors opacity-0 group-hover:opacity-100" title="Cancelar"><svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div>`);
          });
          _push(`<!--]--></div>`);
        });
        _push(`<!--]--></div></div></div></div>`);
      } else {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-3"><!--[-->`);
        ssrRenderList(unref(diasDelMes), (dia) => {
          _push(`<div class="bg-white rounded-lg shadow-sm border border-gray-100 p-3" style="${ssrRenderStyle(citasPorDia(dia.fecha).length > 0 ? null : { display: "none" })}"><h3 class="font-semibold text-sm text-cafe mb-2 flex items-center justify-between"><span>${ssrInterpolate(dia.nombreCompleto)}</span><span class="text-xs text-gray-500">${ssrInterpolate(citasPorDia(dia.fecha).length)} citas</span></h3><div class="space-y-1.5"><!--[-->`);
          ssrRenderList(citasPorDia(dia.fecha), (cita) => {
            _push(`<div class="${ssrRenderClass([getClasesCita(cita.estado), "p-2 rounded-lg transition-all hover:shadow-md group relative"])}"><div class="flex items-center justify-between"><div class="flex-1 cursor-pointer"><p class="font-medium text-xs">${ssrInterpolate(cita.paciente_nombre)}</p><p class="text-[10px] text-gray-600 mt-0.5">${ssrInterpolate(cita.hora_inicio)} - ${ssrInterpolate(cita.hora_fin)} · ${ssrInterpolate(cita.modalidad)}</p></div><div class="flex items-center gap-1.5"><span class="${ssrRenderClass([getBadgeEstado(cita.estado), "text-[10px] px-1.5 py-0.5 rounded-full font-medium"])}">${ssrInterpolate(getEstadoLabel(cita.estado))}</span>`);
            if (cita.estado !== "cancelada") {
              _push(`<button class="p-1 rounded hover:bg-red-100 text-red-600 transition-colors opacity-0 group-hover:opacity-100" title="Cancelar cita"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]-->`);
        if (unref(citasFiltradas).length === 0) {
          _push(`<div class="col-span-full text-center py-8 text-gray-400"><span class="text-4xl block mb-3">📅</span><p class="text-sm">No hay citas en este mes</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`<div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4"><h2 class="text-base font-serif font-bold text-cafe mb-3"> Resumen de Citas </h2><div class="grid grid-cols-2 md:grid-cols-4 gap-3"><div class="text-center p-3 bg-yellow-50 rounded-lg"><p class="text-xl font-bold text-yellow-700">${ssrInterpolate(unref(citasPorEstado).pendiente)}</p><p class="text-[10px] text-yellow-600 mt-1">Pendientes</p></div><div class="text-center p-3 bg-green-50 rounded-lg"><p class="text-xl font-bold text-green-700">${ssrInterpolate(unref(citasPorEstado).confirmada)}</p><p class="text-[10px] text-green-600 mt-1">Confirmadas</p></div><div class="text-center p-3 bg-blue-50 rounded-lg"><p class="text-xl font-bold text-blue-700">${ssrInterpolate(unref(citasPorEstado).realizada)}</p><p class="text-[10px] text-blue-600 mt-1">Realizadas</p></div><div class="text-center p-3 bg-red-50 rounded-lg"><p class="text-xl font-bold text-red-700">${ssrInterpolate(unref(citasPorEstado).cancelada)}</p><p class="text-[10px] text-red-600 mt-1">Canceladas</p></div></div></div>`);
      if (unref(mostrarModalNueva)) {
        _push(ssrRenderComponent(__nuxt_component_2, {
          mostrar: unref(mostrarModalNueva),
          "fecha-preseleccionada": unref(fechaPreseleccionada),
          "hora-preseleccionada": unref(horaPreseleccionada),
          onCerrar: ($event) => mostrarModalNueva.value = false,
          onCitaCreada: handleCitaCreada
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(mostrarModalDetalles) && unref(citaSeleccionada)) {
        _push(ssrRenderComponent(ModalDetallesCita, {
          "cita-id": unref(citaSeleccionada),
          onClose: cerrarModalDetalles,
          onCitaActualizada: handleCitaActualizada,
          onCitaEliminada: handleCitaEliminada
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(mostrarModalEditar) && unref(citaSeleccionada)) {
        _push(ssrRenderComponent(__nuxt_component_5, {
          "cita-id": unref(citaSeleccionada),
          onClose: cerrarModalEditar,
          onCitaActualizada: handleCitaActualizada
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(mostrarModalCancelar) && unref(citaParaCancelar)) {
        _push(ssrRenderComponent(__nuxt_component_1, {
          cita: unref(citaParaCancelar),
          "is-open": unref(mostrarModalCancelar),
          onClose: cerrarModalCancelar,
          onCancelada: handleCitaCancelada
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(mostrarConfirmacionRecordatorios)) {
        _push(`<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"><div class="text-center mb-6"><span class="text-6xl block mb-4">💬</span><h3 class="text-xl font-bold text-cafe mb-2"> ¿Enviar Recordatorios? </h3><p class="text-gray-600"> Se enviará un mensaje de WhatsApp a los pacientes con citas programadas para hoy. </p><p class="text-sm text-terracota mt-2">${ssrInterpolate(unref(citasHoyParaRecordatorio).length)} citas pendientes de recordatorio </p></div><div class="space-y-2 mb-6 max-h-48 overflow-y-auto"><!--[-->`);
        ssrRenderList(unref(citasHoyParaRecordatorio), (cita) => {
          _push(`<div class="flex items-center gap-2 p-2 bg-gray-50 rounded"><span class="text-sm">✓</span><span class="text-sm text-gray-700">${ssrInterpolate(cita.paciente_nombre)}</span><span class="text-xs text-gray-500 ml-auto">${ssrInterpolate(cita.hora_inicio)}</span></div>`);
        });
        _push(`<!--]--></div><div class="flex gap-3"><button class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"> Cancelar </button><button class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"${ssrIncludeBooleanAttr(unref(enviandoRecordatorios)) ? " disabled" : ""}>${ssrInterpolate(unref(enviandoRecordatorios) ? "Enviando..." : "Enviar Ahora")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(vista) !== "mes") {
        _push(`<button class="fixed bottom-8 right-8 w-12 h-12 bg-terracota text-white rounded-full shadow-lg hover:bg-terracota/90 transition-all hover:scale-110 flex items-center justify-center z-20 group" title="Ir a hora actual">`);
        _push(ssrRenderComponent(unref(ClockIcon), { class: "w-6 h-6" }, null, _parent));
        _push(`<span class="absolute -top-10 right-0 bg-cafe text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"> Hora actual </span></button>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinadora/agenda.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=agenda-Dylwur4O.mjs.map
