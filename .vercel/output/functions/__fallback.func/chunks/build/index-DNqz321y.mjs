import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { ClockIcon, CheckCircleIcon, MagnifyingGlassIcon, ExclamationTriangleIcon, CalendarDaysIcon, EyeIcon } from '@heroicons/vue/24/outline';
import { M as ModalDetallesCita } from './ModalDetallesCita-4YIA-weF.mjs';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { e as useSupabaseUser } from './server.mjs';
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

const PRECIO_SESION_DEFAULT = 50;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    const cargando = ref(true);
    const error = ref(null);
    const sesiones = ref([]);
    const bonosPagadosDirectos = ref([]);
    const filtros = ref({
      busqueda: "",
      estado: "",
      periodo: "todos"
    });
    const mostrarModalDetalles = ref(false);
    const citaSeleccionada = ref(null);
    const mostrarPagosConfirmados = ref(true);
    const pagoExpandido = ref(null);
    const sesionesFiltradas = computed(() => {
      let resultado = [...sesiones.value];
      if (filtros.value.busqueda) {
        const busqueda = filtros.value.busqueda.toLowerCase();
        resultado = resultado.filter(
          (s) => s.paciente?.nombre_completo?.toLowerCase().includes(busqueda)
        );
      }
      if (filtros.value.estado) {
        resultado = resultado.filter((s) => s.estado === filtros.value.estado);
      }
      const ahora = /* @__PURE__ */ new Date();
      if (filtros.value.periodo === "mes-actual") {
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
        resultado = resultado.filter((s) => {
          const fecha = new Date(s.fecha_cita);
          return fecha >= inicioMes && fecha <= finMes;
        });
      } else if (filtros.value.periodo === "mes-anterior") {
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth(), 0);
        resultado = resultado.filter((s) => {
          const fecha = new Date(s.fecha_cita);
          return fecha >= inicioMes && fecha <= finMes;
        });
      } else if (filtros.value.periodo === "trimestre") {
        const hace3Meses = new Date(ahora);
        hace3Meses.setMonth(ahora.getMonth() - 3);
        resultado = resultado.filter((s) => {
          const fecha = new Date(s.fecha_cita);
          return fecha >= hace3Meses;
        });
      }
      resultado.sort((a, b) => {
        const fechaA = /* @__PURE__ */ new Date(a.fecha_cita + "T" + a.hora_inicio);
        const fechaB = /* @__PURE__ */ new Date(b.fecha_cita + "T" + b.hora_inicio);
        return fechaB.getTime() - fechaA.getTime();
      });
      return resultado;
    });
    const resumenFinanciero = computed(() => {
      const resultado = {
        pendientes: 0,
        confirmadas: 0,
        completadas: 0,
        canceladas: 0,
        montoPendiente: 0,
        montoConfirmado: 0,
        montoCompletado: 0,
        montoCancelado: 0
      };
      sesionesFiltradas.value.forEach((sesion) => {
        const montoTerapeuta = sesion.monto_terapeuta || (sesion.precio_estimado || PRECIO_SESION_DEFAULT) * 0.7;
        switch (sesion.estado) {
          case "pendiente":
            resultado.pendientes++;
            if (sesion.esta_pagado || sesion.bono?.pagado) {
              resultado.montoConfirmado += montoTerapeuta;
            } else {
              resultado.montoPendiente += montoTerapeuta;
            }
            break;
          case "confirmada":
            resultado.confirmadas++;
            if (sesion.esta_pagado || sesion.bono?.pagado) {
              resultado.montoConfirmado += montoTerapeuta;
            } else {
              resultado.montoPendiente += montoTerapeuta;
            }
            break;
          case "realizada":
          case "completada":
            resultado.completadas++;
            if (sesion.esta_pagado || sesion.bono?.pagado) {
              resultado.montoConfirmado += montoTerapeuta;
            } else {
              resultado.montoCompletado += montoTerapeuta;
            }
            break;
          case "cancelada":
            resultado.canceladas++;
            resultado.montoCancelado += montoTerapeuta;
            break;
        }
      });
      return resultado;
    });
    const bonosPagados = computed(() => {
      return bonosPagadosDirectos.value.map((bono) => {
        const sesionesUsadas = (bono.sesiones_totales || 0) - (bono.sesiones_restantes || 0);
        const precioSesion = bono.sesiones_totales > 0 ? bono.monto_total / bono.sesiones_totales : 0;
        const montoTerapeuta = bono.monto_total * 0.7;
        return {
          bono_id: bono.id,
          paciente_id: bono.paciente_id,
          paciente_nombre: bono.paciente_nombre,
          paciente_email: bono.paciente_email,
          bono_sesiones_totales: bono.sesiones_totales,
          bono_sesiones_restantes: bono.sesiones_restantes,
          bono_monto_total: bono.monto_total,
          bono_fecha_pago: bono.fecha_pago,
          bono_metodo_pago: bono.metodo_pago,
          tipo_bono: bono.tipo_bono || "Estándar",
          sesiones_usadas: sesionesUsadas,
          precio_por_sesion: precioSesion,
          monto_total_terapeuta: montoTerapeuta
        };
      }).sort((a, b) => {
        const fechaA = new Date(a.bono_fecha_pago || 0);
        const fechaB = new Date(b.bono_fecha_pago || 0);
        return fechaB.getTime() - fechaA.getTime();
      });
    });
    const totalConfirmadoTerapeuta = computed(() => {
      return bonosPagados.value.reduce((total, bono) => {
        return total + (bono.monto_total_terapeuta || 0);
      }, 0);
    });
    const cargarSesiones = async () => {
      try {
        cargando.value = true;
        error.value = null;
        let intentos = 0;
        while (!user.value && intentos < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          intentos++;
        }
        if (!user.value) {
          throw new Error("Usuario no autenticado");
        }
        console.log("👤 Usuario verificado:", user.value.id);
        const { data: terapeuta, error: errorTerapeuta } = await supabase.from("terapeutas").select("id").eq("email", user.value.email).single();
        if (errorTerapeuta) {
          console.error("Error al buscar terapeuta:", errorTerapeuta);
          throw errorTerapeuta;
        }
        if (!terapeuta) {
          throw new Error("No se encontró el terapeuta asociado a este usuario");
        }
        console.log("Terapeuta encontrado:", terapeuta);
        const { data, error: errorSesiones } = await supabase.from("vista_sesiones_psicologa").select("*").eq("terapeuta_id", terapeuta.id).order("fecha", { ascending: false });
        if (errorSesiones) {
          console.error("Error al cargar sesiones:", errorSesiones);
          throw errorSesiones;
        }
        console.log("Sesiones cargadas:", data?.length || 0, data);
        sesiones.value = (data || []).map((sesion) => {
          console.log("Sesión individual:", {
            id: sesion.id,
            bono_id: sesion.bono_id,
            bono_pagado: sesion.bono_pagado,
            esta_pagado: sesion.esta_pagado,
            categoria_financiera: sesion.categoria_financiera,
            precio_sesion: sesion.precio_sesion,
            monto_terapeuta: sesion.monto_terapeuta,
            paciente: sesion.paciente_nombre
          });
          return {
            ...sesion,
            // Mantener compatibilidad con código existente
            precio_estimado: sesion.precio_sesion || PRECIO_SESION_DEFAULT,
            paciente: {
              id: sesion.paciente_id,
              nombre_completo: sesion.paciente_nombre,
              email: sesion.paciente_email,
              telefono: sesion.paciente_telefono
            },
            bono: sesion.bono_id ? {
              id: sesion.bono_id,
              sesiones_totales: sesion.bono_sesiones_totales,
              sesiones_restantes: sesion.bono_sesiones_restantes,
              monto_total: sesion.bono_monto_total,
              pagado: sesion.bono_pagado,
              fecha_pago: sesion.bono_fecha_pago,
              metodo_pago: sesion.bono_metodo_pago
            } : null
          };
        });
        console.log("Sesiones procesadas:", sesiones.value.length);
      } catch (err) {
        console.error("Error al cargar sesiones:", err);
        error.value = err.message || "Error desconocido al cargar las sesiones";
      } finally {
        cargando.value = false;
      }
    };
    const cerrarModalDetalles = () => {
      mostrarModalDetalles.value = false;
      citaSeleccionada.value = null;
    };
    const formatearPrecio = (precio) => {
      return precio.toFixed(2);
    };
    const formatearFecha = (fecha) => {
      if (!fecha) return "-";
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    };
    const formatearDiaSemana = (fecha) => {
      const date = /* @__PURE__ */ new Date(fecha + "T00:00:00");
      return date.toLocaleDateString("es-ES", {
        weekday: "long"
      });
    };
    const formatearHora = (hora) => {
      if (!hora) return "-";
      return hora.substring(0, 5);
    };
    const obtenerIniciales = (nombre) => {
      return nombre.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
    };
    const obtenerClaseEstado = (estado) => {
      const clases = {
        pendiente: "bg-yellow-50 text-yellow-700",
        confirmada: "bg-green-50 text-green-700",
        realizada: "bg-blue-50 text-blue-700",
        completada: "bg-blue-50 text-blue-700",
        cancelada: "bg-red-50 text-red-700"
      };
      return clases[estado] || "bg-gray-50 text-gray-700";
    };
    const obtenerColorPuntoEstado = (estado) => {
      const colores = {
        pendiente: "bg-yellow-500",
        confirmada: "bg-green-500",
        realizada: "bg-blue-500",
        completada: "bg-blue-500",
        cancelada: "bg-red-500"
      };
      return colores[estado] || "bg-gray-500";
    };
    const obtenerTextoEstado = (estado) => {
      const textos = {
        pendiente: "Pendiente",
        confirmada: "Confirmada",
        realizada: "Completada",
        completada: "Completada",
        cancelada: "Cancelada"
      };
      return textos[estado] || estado;
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-base-bg" }, _attrs))}><div class="mb-8"><h1 class="text-3xl font-serif font-bold text-cafe mb-2"> Gestión de Sesiones </h1><p class="text-terracota"> Visualiza y gestiona todas tus sesiones con información financiera </p></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><div class="flex items-center justify-between mb-4"><div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">`);
      _push(ssrRenderComponent(unref(ClockIcon), { class: "w-6 h-6 text-yellow-600" }, null, _parent));
      _push(`</div><span class="text-sm font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full"> Pendientes </span></div><p class="text-sm text-cafe/60 mb-1">Sesiones pendientes</p><p class="text-3xl font-bold text-cafe mb-2">${ssrInterpolate(resumenFinanciero.value.pendientes)}</p><div class="pt-3 border-t border-gray-100"><p class="text-xs text-cafe/50 mb-1">Monto estimado</p><p class="text-xl font-semibold text-yellow-600">${ssrInterpolate(formatearPrecio(resumenFinanciero.value.montoPendiente))}€ </p></div></div><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><div class="flex items-center justify-between mb-4"><div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">`);
      _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-6 h-6 text-green-600" }, null, _parent));
      _push(`</div><span class="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full"> Confirmadas </span></div><p class="text-sm text-cafe/60 mb-1">Sesiones confirmadas</p><p class="text-3xl font-bold text-cafe mb-2">${ssrInterpolate(resumenFinanciero.value.confirmadas)}</p><div class="pt-3 border-t border-gray-100"><p class="text-xs text-cafe/50 mb-1">Monto asegurado</p><p class="text-xl font-semibold text-green-600">${ssrInterpolate(formatearPrecio(resumenFinanciero.value.montoConfirmado))}€ </p></div></div><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><div class="flex items-center justify-between mb-4"><div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">`);
      _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-6 h-6 text-blue-600" }, null, _parent));
      _push(`</div><span class="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full"> Completadas </span></div><p class="text-sm text-cafe/60 mb-1">Sesiones realizadas</p><p class="text-3xl font-bold text-cafe mb-2">${ssrInterpolate(resumenFinanciero.value.completadas)}</p><div class="pt-3 border-t border-gray-100"><p class="text-xs text-cafe/50 mb-1">Monto por cobrar</p><p class="text-xl font-semibold text-blue-600">${ssrInterpolate(formatearPrecio(resumenFinanciero.value.montoCompletado))}€ </p></div></div><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><div class="flex items-center justify-between mb-4"><div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"><span class="text-2xl">✕</span></div><span class="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full"> Canceladas </span></div><p class="text-sm text-cafe/60 mb-1">Sesiones canceladas</p><p class="text-3xl font-bold text-cafe mb-2">${ssrInterpolate(resumenFinanciero.value.canceladas)}</p><div class="pt-3 border-t border-gray-100"><p class="text-xs text-cafe/50 mb-1">Monto perdido</p><p class="text-xl font-semibold text-red-600">${ssrInterpolate(formatearPrecio(resumenFinanciero.value.montoCancelado))}€ </p></div></div></div><div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6"><div class="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-6 py-5"><div class="flex items-center justify-between"><div class="flex items-center gap-4"><div class="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">`);
      _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-6 h-6 text-white" }, null, _parent));
      _push(`</div><div><h2 class="text-xl font-bold text-cafe">Pagos Confirmados</h2><p class="text-sm text-cafe/60 mt-0.5">Bonos procesados por coordinación</p></div></div><div class="flex items-center gap-6"><div class="text-right"><p class="text-xs text-cafe/50 uppercase font-semibold tracking-wide">Total Confirmado</p><p class="text-3xl font-bold text-green-700">${ssrInterpolate(formatearPrecio(totalConfirmadoTerapeuta.value))}€</p><p class="text-xs text-cafe/60 mt-0.5">${ssrInterpolate(bonosPagados.value.length)} ${ssrInterpolate(bonosPagados.value.length === 1 ? "bono" : "bonos")}</p></div><button class="${ssrRenderClass([{ "rotate-180": mostrarPagosConfirmados.value }, "w-10 h-10 rounded-lg bg-white/80 hover:bg-white border border-green-200 flex items-center justify-center text-green-700 hover:text-green-800 transition-all duration-200"])}"><span class="text-lg">▼</span></button></div></div></div><div style="${ssrRenderStyle(mostrarPagosConfirmados.value ? null : { display: "none" })}">`);
      if (bonosPagados.value.length === 0) {
        _push(`<div class="text-center py-12 px-6"><div class="w-20 h-20 mx-auto mb-4 rounded-full bg-cafe/5 flex items-center justify-center"><span class="text-4xl">📭</span></div><p class="text-cafe/60 font-medium">No hay pagos confirmados aún</p><p class="text-sm text-cafe/40 mt-1">Los bonos pagados aparecerán aquí</p></div>`);
      } else {
        _push(`<div class="divide-y divide-gray-100"><!--[-->`);
        ssrRenderList(bonosPagados.value, (pago, index) => {
          _push(`<div class="group hover:bg-green-50/30 transition-colors duration-150"><div class="px-6 py-4 cursor-pointer flex items-center gap-4"><div class="flex-shrink-0 w-1 h-12 rounded-full bg-green-500"></div><div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">${ssrInterpolate(obtenerIniciales(pago.paciente_nombre))}</div><div class="flex-1 min-w-0 grid grid-cols-5 gap-4 items-center"><div class="col-span-2"><p class="font-semibold text-cafe truncate">${ssrInterpolate(pago.paciente_nombre)}</p><p class="text-xs text-cafe/50 truncate">${ssrInterpolate(pago.tipo_bono || "Bono Estándar")}</p></div><div class="text-center"><p class="text-sm font-semibold text-cafe">${ssrInterpolate(pago.sesiones_usadas)}/${ssrInterpolate(pago.bono_sesiones_totales)}</p><p class="text-xs text-cafe/50">sesiones</p></div><div class="text-right"><p class="text-lg font-bold text-green-700">${ssrInterpolate(formatearPrecio(pago.monto_total_terapeuta))}€</p><p class="text-xs text-cafe/50">tu parte (70%)</p></div><div class="text-right"><p class="text-sm font-medium text-cafe flex items-center justify-end gap-1.5">${ssrInterpolate(formatearFecha(pago.bono_fecha_pago))}</p><p class="text-xs text-cafe/50 capitalize flex items-center justify-end gap-1.5 mt-0.5">${ssrInterpolate(pago.bono_metodo_pago || "No especificado")}</p></div></div><div class="flex-shrink-0 ml-2"><span class="${ssrRenderClass([{ "rotate-180": pagoExpandido.value === pago.bono_id }, "block w-6 h-6 rounded-full bg-cafe/5 group-hover:bg-cafe/10 flex items-center justify-center text-cafe/40 text-xs transition-all duration-200"])}"> ▼ </span></div></div><div class="bg-gradient-to-b from-green-50/50 to-transparent" style="${ssrRenderStyle(pagoExpandido.value === pago.bono_id ? null : { display: "none" })}"><div class="px-6 pb-6 pt-2 ml-16"><div class="bg-white rounded-xl border border-green-100 p-5 shadow-sm"><div class="grid grid-cols-3 gap-6"><div class="space-y-3"><p class="text-xs text-cafe/40 uppercase font-bold tracking-wider mb-3">📋 Paciente</p><div class="space-y-2"><div class="flex justify-between text-sm"><span class="text-cafe/60">Nombre:</span><span class="font-medium text-cafe">${ssrInterpolate(pago.paciente_nombre)}</span></div><div class="flex justify-between text-sm"><span class="text-cafe/60">Email:</span><span class="font-medium text-cafe text-xs truncate max-w-[150px]"${ssrRenderAttr("title", pago.paciente_email)}>${ssrInterpolate(pago.paciente_email)}</span></div></div></div><div class="space-y-3"><p class="text-xs text-cafe/40 uppercase font-bold tracking-wider mb-3">🧾 Detalles del Bono</p><div class="space-y-2"><div class="flex justify-between text-sm"><span class="text-cafe/60">Tipo:</span><span class="font-medium text-cafe">${ssrInterpolate(pago.tipo_bono || "Estándar")}</span></div><div class="flex justify-between text-sm"><span class="text-cafe/60">Sesiones totales:</span><span class="font-medium text-cafe">${ssrInterpolate(pago.bono_sesiones_totales)}</span></div><div class="flex justify-between text-sm"><span class="text-cafe/60">Sesiones usadas:</span><span class="font-medium text-cafe">${ssrInterpolate(pago.sesiones_usadas)}</span></div><div class="flex justify-between text-sm"><span class="text-cafe/60">Sesiones restantes:</span><span class="font-semibold text-green-700">${ssrInterpolate(pago.bono_sesiones_restantes)}</span></div></div></div><div class="space-y-3"><p class="text-xs text-cafe/40 uppercase font-bold tracking-wider mb-3">Financiero</p><div class="space-y-2"><div class="flex justify-between text-sm"><span class="text-cafe/60">Monto total:</span><span class="font-bold text-cafe">${ssrInterpolate(formatearPrecio(pago.bono_monto_total))}€</span></div><div class="flex justify-between text-sm bg-green-50 px-2 py-1.5 rounded-lg"><span class="text-cafe/60 font-medium">Tu parte (70%):</span><span class="font-bold text-green-700">${ssrInterpolate(formatearPrecio(pago.monto_total_terapeuta))}€</span></div><div class="flex justify-between text-sm"><span class="text-cafe/60">Por sesión:</span><span class="font-medium text-cafe/80">${ssrInterpolate(formatearPrecio(pago.precio_por_sesion))}€</span></div><div class="pt-2 border-t border-green-100 mt-3"><div class="flex justify-between text-xs text-cafe/50 mb-1"><span>Método de pago:</span><span class="font-medium capitalize">${ssrInterpolate(pago.bono_metodo_pago || "No especificado")}</span></div><div class="flex justify-between text-xs text-cafe/50"><span>Fecha de pago:</span><span class="font-medium">${ssrInterpolate(formatearFecha(pago.bono_fecha_pago))}</span></div></div></div></div></div></div></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"><div class="grid grid-cols-1 md:grid-cols-4 gap-4"><div class="md:col-span-2"><label class="block text-sm font-medium text-cafe mb-2"> Buscar paciente </label><div class="relative"><input${ssrRenderAttr("value", filtros.value.busqueda)} type="text" placeholder="Nombre del paciente..." class="w-full px-4 py-2 pl-10 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20">`);
      _push(ssrRenderComponent(unref(MagnifyingGlassIcon), { class: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cafe/50" }, null, _parent));
      _push(`</div></div><div><label class="block text-sm font-medium text-cafe mb-2"> Estado </label><select class="w-full px-4 py-2 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20 text-cafe"><option value=""${ssrIncludeBooleanAttr(Array.isArray(filtros.value.estado) ? ssrLooseContain(filtros.value.estado, "") : ssrLooseEqual(filtros.value.estado, "")) ? " selected" : ""}>Todos los estados</option><option value="pendiente"${ssrIncludeBooleanAttr(Array.isArray(filtros.value.estado) ? ssrLooseContain(filtros.value.estado, "pendiente") : ssrLooseEqual(filtros.value.estado, "pendiente")) ? " selected" : ""}>Pendiente</option><option value="confirmada"${ssrIncludeBooleanAttr(Array.isArray(filtros.value.estado) ? ssrLooseContain(filtros.value.estado, "confirmada") : ssrLooseEqual(filtros.value.estado, "confirmada")) ? " selected" : ""}>Confirmada</option><option value="realizada"${ssrIncludeBooleanAttr(Array.isArray(filtros.value.estado) ? ssrLooseContain(filtros.value.estado, "realizada") : ssrLooseEqual(filtros.value.estado, "realizada")) ? " selected" : ""}>Completada</option><option value="cancelada"${ssrIncludeBooleanAttr(Array.isArray(filtros.value.estado) ? ssrLooseContain(filtros.value.estado, "cancelada") : ssrLooseEqual(filtros.value.estado, "cancelada")) ? " selected" : ""}>Cancelada</option></select></div><div><label class="block text-sm font-medium text-cafe mb-2"> Período </label><select class="w-full px-4 py-2 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20 text-cafe"><option value="mes-actual"${ssrIncludeBooleanAttr(Array.isArray(filtros.value.periodo) ? ssrLooseContain(filtros.value.periodo, "mes-actual") : ssrLooseEqual(filtros.value.periodo, "mes-actual")) ? " selected" : ""}>Mes actual</option><option value="mes-anterior"${ssrIncludeBooleanAttr(Array.isArray(filtros.value.periodo) ? ssrLooseContain(filtros.value.periodo, "mes-anterior") : ssrLooseEqual(filtros.value.periodo, "mes-anterior")) ? " selected" : ""}>Mes anterior</option><option value="trimestre"${ssrIncludeBooleanAttr(Array.isArray(filtros.value.periodo) ? ssrLooseContain(filtros.value.periodo, "trimestre") : ssrLooseEqual(filtros.value.periodo, "trimestre")) ? " selected" : ""}>Último trimestre</option><option value="todos"${ssrIncludeBooleanAttr(Array.isArray(filtros.value.periodo) ? ssrLooseContain(filtros.value.periodo, "todos") : ssrLooseEqual(filtros.value.periodo, "todos")) ? " selected" : ""}>Todos</option></select></div></div></div>`);
      if (cargando.value) {
        _push(`<div class="flex items-center justify-center py-12"><div class="text-center"><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-terracota mb-4"></div><p class="text-cafe/60">Cargando sesiones...</p></div></div>`);
      } else if (error.value) {
        _push(`<div class="bg-red-50 border border-red-200 rounded-xl p-6"><div class="flex items-start gap-3">`);
        _push(ssrRenderComponent(unref(ExclamationTriangleIcon), { class: "w-6 h-6 text-red-600" }, null, _parent));
        _push(`<div><h3 class="font-semibold text-red-800 mb-1">Error al cargar sesiones</h3><p class="text-sm text-red-600">${ssrInterpolate(error.value)}</p></div></div></div>`);
      } else {
        _push(`<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div class="bg-gray-50 border-b border-gray-100 px-6 py-4"><h3 class="font-semibold text-cafe"> Listado de Sesiones <span class="text-sm font-normal text-cafe/60 ml-2"> (${ssrInterpolate(sesionesFiltradas.value.length)} sesiones) </span></h3></div>`);
        if (sesionesFiltradas.value.length === 0) {
          _push(`<div class="p-12 text-center"><div class="w-16 h-16 bg-cafe-claro/20 rounded-full flex items-center justify-center mx-auto mb-4">`);
          _push(ssrRenderComponent(unref(CalendarDaysIcon), { class: "w-8 h-8 text-cafe/40" }, null, _parent));
          _push(`</div><h3 class="text-lg font-semibold text-cafe mb-2"> No hay sesiones para mostrar </h3><p class="text-cafe/60 mb-6">${ssrInterpolate(filtros.value.busqueda || filtros.value.estado ? "Intenta ajustar los filtros de búsqueda" : "No tienes sesiones programadas aún")}</p></div>`);
        } else {
          _push(`<div class="overflow-x-auto"><table class="w-full"><thead class="bg-gray-50 border-b border-gray-200"><tr><th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider"> Fecha </th><th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider"> Hora </th><th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider"> Paciente </th><th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider"> Modalidad </th><th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider"> Estado </th><th class="px-6 py-3 text-left text-xs font-semibold text-cafe/70 uppercase tracking-wider"> Bono </th><th class="px-6 py-3 text-right text-xs font-semibold text-cafe/70 uppercase tracking-wider"> Monto </th><th class="px-6 py-3 text-center text-xs font-semibold text-cafe/70 uppercase tracking-wider"> Acciones </th></tr></thead><tbody class="bg-white divide-y divide-gray-100"><!--[-->`);
          ssrRenderList(sesionesFiltradas.value, (sesion) => {
            _push(`<tr class="hover:bg-gray-50 transition-colors duration-150"><td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-cafe">${ssrInterpolate(formatearFecha(sesion.fecha_cita))}</div><div class="text-xs text-cafe/50">${ssrInterpolate(formatearDiaSemana(sesion.fecha_cita))}</div></td><td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-cafe">${ssrInterpolate(formatearHora(sesion.hora_inicio))}</div><div class="text-xs text-cafe/50">${ssrInterpolate(sesion.duracion_minutos || 50)} min </div></td><td class="px-6 py-4"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-terracota/20 text-terracota flex items-center justify-center font-semibold text-sm flex-shrink-0">${ssrInterpolate(obtenerIniciales(sesion.paciente?.nombre_completo || "NN"))}</div><div><div class="text-sm font-medium text-cafe">${ssrInterpolate(sesion.paciente?.nombre_completo || "Sin nombre")}</div>`);
            if (sesion.paciente?.email) {
              _push(`<div class="text-xs text-cafe/50">${ssrInterpolate(sesion.paciente.email)}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div></td><td class="px-6 py-4 whitespace-nowrap"><span class="${ssrRenderClass([
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
              sesion.modalidad === "online" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
            ])}"><span>${ssrInterpolate(sesion.modalidad === "online" ? "💻" : "🏢")}</span> ${ssrInterpolate(sesion.modalidad === "online" ? "Online" : "Presencial")}</span></td><td class="px-6 py-4 whitespace-nowrap"><span class="${ssrRenderClass([
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
              obtenerClaseEstado(sesion.estado)
            ])}"><span class="${ssrRenderClass([obtenerColorPuntoEstado(sesion.estado), "w-1.5 h-1.5 rounded-full"])}"></span> ${ssrInterpolate(obtenerTextoEstado(sesion.estado))}</span></td><td class="px-6 py-4 whitespace-nowrap">`);
            if (sesion.bono) {
              _push(`<div class="text-xs space-y-1"><div class="flex items-center gap-1 text-green-600">`);
              _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-4 h-4" }, null, _parent));
              _push(`<span>Con bono</span></div><div class="text-cafe/50">${ssrInterpolate(sesion.bono.sesiones_restantes || 0)}/${ssrInterpolate(sesion.bono.sesiones_totales || 0)} restantes </div>`);
              if (sesion.bono.pagado) {
                _push(`<div class="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full">`);
                _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-4 h-4" }, null, _parent));
                _push(`<span class="font-semibold">Pagado</span></div>`);
              } else {
                _push(`<div class="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full animate-pulse">`);
                _push(ssrRenderComponent(unref(ClockIcon), { class: "w-4 h-4" }, null, _parent));
                _push(`<span class="font-semibold">Pend. pago</span></div>`);
              }
              _push(`</div>`);
            } else {
              _push(`<div class="text-xs text-cafe/50"> Sin bono </div>`);
            }
            _push(`</td><td class="px-6 py-4 whitespace-nowrap text-right"><div class="text-sm font-semibold text-cafe">${ssrInterpolate(formatearPrecio(sesion.precio_estimado || PRECIO_SESION_DEFAULT))}€ </div><div class="text-xs text-cafe/50"> Tu parte: ${ssrInterpolate(formatearPrecio((sesion.precio_estimado || PRECIO_SESION_DEFAULT) * 0.7))}€ </div></td><td class="px-6 py-4 whitespace-nowrap text-center"><button class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-terracota hover:bg-terracota/10 rounded-lg transition-colors duration-200">`);
            _push(ssrRenderComponent(unref(EyeIcon), { class: "w-4 h-4" }, null, _parent));
            _push(` Ver detalles </button></td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
        }
        _push(`</div>`);
      }
      _push(ssrRenderComponent(ModalDetallesCita, {
        "is-open": mostrarModalDetalles.value,
        "cita-id": citaSeleccionada.value,
        onClose: cerrarModalDetalles,
        onActualizado: cargarSesiones,
        onEliminado: cargarSesiones
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/terapeuta/sesiones/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DNqz321y.mjs.map
