import { ref, computed, watchEffect, defineComponent, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderStyle, ssrRenderAttr, ssrRenderComponent, ssrRenderTeleport } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { e as useSupabaseUser } from './server.mjs';
import { ArrowsPointingOutIcon } from '@heroicons/vue/24/outline';

function useAgenda() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const citas = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const realtimeChannel = ref(null);
  const filtros = ref({});
  ref(/* @__PURE__ */ new Map());
  const citasDelDia = computed(() => {
    const hoy = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    return citas.value.filter((c) => c.fecha_cita === hoy);
  });
  const citasPendientes = computed(() => {
    return citas.value.filter(
      (c) => c.estado === "pendiente" || c.estado === "confirmada"
    );
  });
  const citasCompletadas = computed(() => {
    return citas.value.filter(
      (c) => c.estado === "completada" || c.estado === "realizada"
    );
  });
  const citasConBonoProximoAgotar = computed(() => {
    return citas.value.filter(
      (c) => c.bono && c.bono.sesiones_restantes <= 2 && c.bono.sesiones_restantes > 0 && (c.estado === "pendiente" || c.estado === "confirmada")
    );
  });
  const getCitasDelTerapeuta = async (opciones) => {
    var _a;
    try {
      loading.value = true;
      error.value = null;
      if (!((_a = user.value) == null ? void 0 : _a.id)) {
        throw new Error("Usuario no autenticado");
      }
      let query = supabase.from("citas").select(`
          id,
          fecha_cita,
          hora_inicio,
          hora_fin,
          estado,
          modalidad,
          observaciones,
          paciente_id,
          terapeuta_id,
          bono_id,
          sesion_descontada,
          consumo_registrado,
          paciente:pacientes (
            id,
            nombre_completo,
            telefono,
            email
          ),
          bono:bonos (
            id,
            sesiones_restantes,
            sesiones_totales,
            estado
          )
        `).eq("terapeuta_id", user.value.id);
      if (opciones == null ? void 0 : opciones.fechaInicio) {
        query = query.gte("fecha_cita", opciones.fechaInicio);
      }
      if (opciones == null ? void 0 : opciones.fechaFin) {
        query = query.lte("fecha_cita", opciones.fechaFin);
      }
      if (!(opciones == null ? void 0 : opciones.incluirCompletadas)) {
        query = query.in("estado", ["pendiente", "confirmada"]);
      }
      query = query.order("fecha_cita", { ascending: true }).order("hora_inicio", { ascending: true });
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      citas.value = data || [];
      console.log(`\u2705 [Agenda] Cargadas ${citas.value.length} citas`);
      return citas.value;
    } catch (err) {
      console.error("\u274C [Agenda] Error al cargar citas:", err);
      error.value = err.message || "Error al cargar citas";
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const completarCita = async (citaId) => {
    try {
      console.log(`\u{1F504} [Agenda] Completando cita: ${citaId}`);
      const { data, error: rpcError } = await supabase.rpc("completar_cita", {
        p_cita_id: citaId
      });
      if (rpcError) {
        console.error("\u274C [Agenda] Error en RPC:", rpcError);
        throw rpcError;
      }
      const resultado = data;
      if (resultado.success) {
        console.log("\u2705 [Agenda] Cita completada exitosamente");
        const index = citas.value.findIndex((c) => c.id === citaId);
        if (index !== -1) {
          const cita = citas.value[index];
          if (cita) {
            cita.estado = "completada";
            cita.sesion_descontada = true;
            cita.consumo_registrado = true;
            if (cita.bono && resultado.sesiones_despues !== void 0) {
              cita.bono.sesiones_restantes = resultado.sesiones_despues;
              if (resultado.bono_completado) {
                cita.bono.estado = "completado";
              }
            }
          }
        }
        if (resultado.alerta) {
          mostrarAlerta(resultado);
        } else {
          mostrarNotificacion("success", resultado.message);
        }
        await getCitasDelTerapeuta();
        return resultado;
      } else {
        if (resultado.warning) {
          console.warn("\u26A0\uFE0F [Agenda] Advertencia:", resultado.message);
          mostrarNotificacion("warning", resultado.message);
        } else {
          console.error("\u274C [Agenda] Error:", resultado.message);
          mostrarNotificacion("error", resultado.message || "No se pudo completar la cita");
        }
        return resultado;
      }
    } catch (err) {
      console.error("\u274C [Agenda] Error al completar cita:", err);
      const errorMsg = err.message || "Error desconocido al completar cita";
      mostrarNotificacion("error", errorMsg);
      return {
        success: false,
        message: errorMsg,
        error: err.code || "unknown_error"
      };
    }
  };
  const obtenerHistorialBono = async (bonoId) => {
    try {
      const { data, error: rpcError } = await supabase.rpc("obtener_historial_bono", {
        p_bono_id: bonoId
      });
      if (rpcError) throw rpcError;
      console.log(`\u2705 [Agenda] Historial de bono obtenido: ${(data == null ? void 0 : data.length) || 0} movimientos`);
      return data || [];
    } catch (err) {
      console.error("\u274C [Agenda] Error al obtener historial:", err);
      throw err;
    }
  };
  const verificarBonoCitas = async (bonoId) => {
    try {
      const { data, error: rpcError } = await supabase.rpc("verificar_bono_citas", {
        p_bono_id: bonoId
      });
      if (rpcError) throw rpcError;
      console.log("\u2705 [Agenda] Verificaci\xF3n de bono:", data);
      if (data == null ? void 0 : data.alerta) {
        console.warn("\u26A0\uFE0F [Agenda] Alerta en bono:", data.mensaje_alerta);
      }
      return data;
    } catch (err) {
      console.error("\u274C [Agenda] Error al verificar bono:", err);
      throw err;
    }
  };
  const citasPendientesSync = ref([]);
  const detectarInconsistencias = async () => {
    var _a;
    try {
      console.log("\u{1F50D} [Agenda] Detectando inconsistencias...");
      const { data, error: error2 } = await supabase.from("citas").select(`
          id,
          fecha_cita,
          hora_inicio,
          hora_fin,
          estado,
          modalidad,
          observaciones,
          paciente_id,
          terapeuta_id,
          bono_id,
          sesion_descontada,
          consumo_registrado,
          paciente:pacientes (
            id,
            nombre_completo,
            telefono,
            email
          ),
          bono:bonos (
            id,
            sesiones_restantes,
            sesiones_totales,
            estado
          )
        `).in("estado", ["completada", "realizada"]).not("bono_id", "is", null).or("sesion_descontada.eq.false,consumo_registrado.eq.false").eq("terapeuta_id", ((_a = user.value) == null ? void 0 : _a.id) || "");
      if (error2) throw error2;
      citasPendientesSync.value = data || [];
      if (citasPendientesSync.value.length > 0) {
        console.warn(
          `\u26A0\uFE0F [Agenda] ${citasPendientesSync.value.length} cita(s) con inconsistencias detectadas`
        );
      } else {
        console.log("\u2705 [Agenda] No se detectaron inconsistencias");
      }
      return citasPendientesSync.value;
    } catch (err) {
      console.error("\u274C [Agenda] Error al detectar inconsistencias:", err);
      citasPendientesSync.value = [];
      return [];
    }
  };
  const resincronizarBono = async (citaId) => {
    try {
      console.log(`\u{1F504} [Agenda] Re-sincronizando bono para cita: ${citaId}`);
      const { data, error: error2 } = await supabase.rpc("actualizar_bono_por_cita", {
        p_cita_id: citaId
      });
      if (error2) throw error2;
      const resultado = data;
      if (resultado.success) {
        console.log("\u2705 [Agenda] Bono re-sincronizado exitosamente");
        if (resultado.warning === "ya_descontada") {
          mostrarNotificacion("info", "Esta sesi\xF3n ya estaba descontada");
        } else {
          mostrarNotificacion("success", "Bono re-sincronizado correctamente");
          if (resultado.alerta && resultado.mensaje_alerta) {
            setTimeout(() => {
              mostrarNotificacion("warning", resultado.mensaje_alerta);
            }, 500);
          }
        }
        await Promise.all([
          getCitasDelTerapeuta(),
          detectarInconsistencias()
        ]);
        return resultado;
      } else {
        console.warn("\u26A0\uFE0F [Agenda] No se pudo re-sincronizar:", resultado.message);
        mostrarNotificacion("warning", resultado.message || "No se pudo re-sincronizar");
        return resultado;
      }
    } catch (err) {
      console.error("\u274C [Agenda] Error al re-sincronizar bono:", err);
      mostrarNotificacion("error", "Error al re-sincronizar el bono");
      throw err;
    }
  };
  const resincronizarTodos = async () => {
    if (citasPendientesSync.value.length === 0) {
      mostrarNotificacion("info", "No hay citas pendientes de sincronizaci\xF3n");
      return;
    }
    try {
      console.log(`\u{1F504} [Agenda] Re-sincronizando ${citasPendientesSync.value.length} citas...`);
      let exitosos = 0;
      let fallidos = 0;
      let yaDescontados = 0;
      for (const cita of citasPendientesSync.value) {
        try {
          const resultado = await resincronizarBono(cita.id);
          if (resultado.success) {
            if (resultado.warning === "ya_descontada") {
              yaDescontados++;
            } else {
              exitosos++;
            }
          } else {
            fallidos++;
          }
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch {
          fallidos++;
        }
      }
      const mensajes = [];
      if (exitosos > 0) mensajes.push(`${exitosos} sincronizada(s)`);
      if (yaDescontados > 0) mensajes.push(`${yaDescontados} ya estaba(n) descontada(s)`);
      if (fallidos > 0) mensajes.push(`${fallidos} fallida(s)`);
      const mensaje = `\u2705 Re-sincronizaci\xF3n completa: ${mensajes.join(", ")}`;
      if (fallidos === 0) {
        mostrarNotificacion("success", mensaje);
      } else {
        mostrarNotificacion("warning", mensaje);
      }
      console.log("\u2705 [Agenda] Re-sincronizaci\xF3n masiva completada:", {
        exitosos,
        yaDescontados,
        fallidos
      });
    } catch (err) {
      console.error("\u274C [Agenda] Error en re-sincronizaci\xF3n masiva:", err);
      mostrarNotificacion("error", "Error al re-sincronizar todas las citas");
    }
  };
  const suscribirCitasRealtime = () => {
    var _a;
    if (!((_a = user.value) == null ? void 0 : _a.id)) {
      console.warn("\u26A0\uFE0F [Agenda] No se puede suscribir sin usuario autenticado");
      return;
    }
    if (realtimeChannel.value) {
      supabase.removeChannel(realtimeChannel.value);
    }
    console.log("\u{1F4E1} [Agenda] Iniciando suscripci\xF3n Realtime...");
    realtimeChannel.value = supabase.channel(`citas_terapeuta_${user.value.id}`).on(
      "postgres_changes",
      {
        event: "*",
        // INSERT, UPDATE, DELETE
        schema: "public",
        table: "citas",
        filter: `terapeuta_id=eq.${user.value.id}`
      },
      async (payload) => {
        console.log("\u{1F4E1} [Realtime] Cambio detectado en citas:", payload.eventType);
        await getCitasDelTerapeuta();
        if (payload.eventType === "INSERT") {
          mostrarNotificacion("info", "Nueva cita agregada a tu agenda");
        } else if (payload.eventType === "UPDATE") {
          mostrarNotificacion("info", "Una cita ha sido actualizada");
        } else if (payload.eventType === "DELETE") {
          mostrarNotificacion("warning", "Una cita ha sido eliminada");
        }
      }
    ).subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("\u2705 [Realtime] Suscripci\xF3n activa");
      } else if (status === "CHANNEL_ERROR") {
        console.error("\u274C [Realtime] Error en suscripci\xF3n");
      } else if (status === "TIMED_OUT") {
        console.warn("\u26A0\uFE0F [Realtime] Tiempo de espera agotado");
      }
    });
  };
  const desuscribirCitasRealtime = () => {
    if (realtimeChannel.value) {
      console.log("\u{1F4E1} [Realtime] Cerrando suscripci\xF3n...");
      supabase.removeChannel(realtimeChannel.value);
      realtimeChannel.value = null;
    }
  };
  const mostrarNotificacion = (tipo, mensaje) => {
    {
      const emoji = {
        success: "\u2705",
        error: "\u274C",
        warning: "\u26A0\uFE0F",
        info: "\u2139\uFE0F"
      };
      console.log(`${emoji[tipo]} [Agenda] ${mensaje}`);
    }
  };
  const mostrarAlerta = (resultado) => {
    if (!resultado.alerta || !resultado.mensaje_alerta) return;
    const tipoNotificacion = resultado.tipo_alerta === "bono_agotado" ? "success" : resultado.tipo_alerta === "ultima_sesion" ? "warning" : "warning";
    mostrarNotificacion(tipoNotificacion, resultado.mensaje_alerta);
  };
  watchEffect(() => {
    var _a;
    if ((_a = user.value) == null ? void 0 : _a.id) {
      getCitasDelTerapeuta();
      suscribirCitasRealtime();
    }
  });
  const citasFiltradas = computed(() => {
    let resultado = citas.value;
    if (filtros.value.paciente) {
      resultado = resultado.filter(
        (c) => {
          var _a;
          return (_a = c.paciente) == null ? void 0 : _a.nombre_completo.toLowerCase().includes(filtros.value.paciente.toLowerCase());
        }
      );
    }
    if (filtros.value.busqueda) {
      const busq = filtros.value.busqueda.toLowerCase();
      resultado = resultado.filter(
        (c) => {
          var _a, _b;
          return ((_a = c.paciente) == null ? void 0 : _a.nombre_completo.toLowerCase().includes(busq)) || ((_b = c.observaciones) == null ? void 0 : _b.toLowerCase().includes(busq)) || c.fecha_cita.includes(busq);
        }
      );
    }
    if (filtros.value.estado && filtros.value.estado.length > 0) {
      resultado = resultado.filter((c) => filtros.value.estado.includes(c.estado));
    }
    if (filtros.value.area_terapeutica) {
      resultado = resultado.filter((c) => c.area_terapeutica === filtros.value.area_terapeutica);
    }
    if (filtros.value.tipo_sesion && filtros.value.tipo_sesion.length > 0) {
      resultado = resultado.filter(
        (c) => c.tipo_sesion && filtros.value.tipo_sesion.includes(c.tipo_sesion)
      );
    }
    if (filtros.value.fecha_desde) {
      resultado = resultado.filter((c) => c.fecha_cita >= filtros.value.fecha_desde);
    }
    if (filtros.value.fecha_hasta) {
      resultado = resultado.filter((c) => c.fecha_cita <= filtros.value.fecha_hasta);
    }
    return resultado;
  });
  const aplicarFiltros = (nuevosFiltros) => {
    filtros.value = { ...nuevosFiltros };
  };
  const limpiarFiltros = () => {
    filtros.value = {};
  };
  const reprogramarCita = async (citaId, nuevaFecha, nuevaHoraInicio, nuevaHoraFin) => {
    try {
      loading.value = true;
      const { data, error: err } = await supabase.from("citas").update({
        fecha_cita: nuevaFecha,
        hora_inicio: nuevaHoraInicio,
        hora_fin: nuevaHoraFin || nuevaHoraInicio,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", citaId).select().single();
      if (err) throw err;
      const index = citas.value.findIndex((c) => c.id === citaId);
      if (index !== -1 && data) {
        citas.value[index] = { ...citas.value[index], ...data };
      }
      return { success: true, cita: data };
    } catch (e) {
      console.error("Error al reprogramar cita:", e);
      return { success: false, error: e.message };
    } finally {
      loading.value = false;
    }
  };
  const actualizarNotasRapidas = async (citaId, notas, enlace) => {
    try {
      const { data, error: err } = await supabase.from("citas").update({
        notas_rapidas: notas,
        enlace_videollamada: enlace,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", citaId).select().single();
      if (err) throw err;
      const index = citas.value.findIndex((c) => c.id === citaId);
      if (index !== -1 && data) {
        citas.value[index] = { ...citas.value[index], ...data };
      }
      return { success: true };
    } catch (e) {
      console.error("Error al actualizar notas:", e);
      return { success: false, error: e.message };
    }
  };
  const obtenerDisponibilidad = async (terapeutaId) => {
    var _a;
    try {
      const id = terapeutaId || ((_a = user.value) == null ? void 0 : _a.id);
      if (!id) throw new Error("ID de terapeuta requerido");
      const { data, error: err } = await supabase.from("terapeutas").select("disponibilidad").eq("id", id).single();
      if (err) throw err;
      return (data == null ? void 0 : data.disponibilidad) || [];
    } catch (e) {
      console.error("Error al obtener disponibilidad:", e);
      return [];
    }
  };
  const calcularHuecosLibres = (fecha, disponibilidad) => {
    const diaSemana = (/* @__PURE__ */ new Date(fecha + "T00:00:00")).getDay();
    const citasDelDia2 = citas.value.filter((c) => c.fecha_cita === fecha);
    const disponibleDia = disponibilidad.filter((d) => d.dia_semana === diaSemana && d.disponible);
    if (disponibleDia.length === 0) return [];
    const huecos = [];
    disponibleDia.forEach((slot) => {
      const inicio = slot.hora_inicio;
      const fin = slot.hora_fin;
      const ocupado = citasDelDia2.some((c) => {
        return c.hora_inicio >= inicio && c.hora_inicio < fin || c.hora_fin > inicio && c.hora_fin <= fin || c.hora_inicio <= inicio && c.hora_fin >= fin;
      });
      if (!ocupado) {
        huecos.push({ hora_inicio: inicio, hora_fin: fin });
      }
    });
    return huecos;
  };
  const programarRecordatorios = async (citaId) => {
    try {
      const cita = citas.value.find((c) => c.id === citaId);
      if (!cita || !cita.paciente) return { success: false, error: "Cita no encontrada" };
      const fechaCita = /* @__PURE__ */ new Date(cita.fecha_cita + "T" + cita.hora_inicio);
      const ahora = /* @__PURE__ */ new Date();
      const recordatorio24h = new Date(fechaCita.getTime() - 24 * 60 * 60 * 1e3);
      if (recordatorio24h > ahora && !cita.recordatorio_24h_enviado) {
        await supabase.from("notificaciones").insert({
          usuario_id: cita.paciente_id,
          tipo: "cita",
          titulo: "\u{1F4C5} Recordatorio: Cita ma\xF1ana",
          mensaje: `Tu cita est\xE1 programada para ma\xF1ana ${cita.fecha_cita} a las ${cita.hora_inicio}`,
          metadata: {
            cita_id: citaId,
            tipo_recordatorio: "24h",
            fecha_cita: cita.fecha_cita,
            hora: cita.hora_inicio
          }
        });
        await supabase.from("citas").update({ recordatorio_24h_enviado: true }).eq("id", citaId);
      }
      const recordatorio4h = new Date(fechaCita.getTime() - 4 * 60 * 60 * 1e3);
      if (recordatorio4h > ahora && !cita.recordatorio_4h_enviado) {
        await supabase.from("notificaciones").insert({
          usuario_id: cita.paciente_id,
          tipo: "cita",
          titulo: "\u23F0 Recordatorio: Cita en 4 horas",
          mensaje: `Tu cita est\xE1 programada para hoy ${cita.fecha_cita} a las ${cita.hora_inicio}`,
          metadata: {
            cita_id: citaId,
            tipo_recordatorio: "4h",
            fecha_cita: cita.fecha_cita,
            hora: cita.hora_inicio,
            enlace_videollamada: cita.enlace_videollamada
          }
        });
        await supabase.from("citas").update({ recordatorio_4h_enviado: true }).eq("id", citaId);
      }
      return { success: true };
    } catch (e) {
      console.error("Error al programar recordatorios:", e);
      return { success: false, error: e.message };
    }
  };
  const calcularCargaDiaria = (fecha, terapeutaId) => {
    const citasDelDia2 = citas.value.filter((c) => {
      const coincideFecha = c.fecha_cita === fecha;
      const coincideTerapeuta = terapeutaId ? c.terapeuta_id === terapeutaId : true;
      const esActiva = ["pendiente", "confirmada"].includes(c.estado);
      return coincideFecha && coincideTerapeuta && esActiva;
    });
    return {
      total: citasDelDia2.length,
      confirmadas: citasDelDia2.filter((c) => c.estado === "confirmada").length,
      pendientes: citasDelDia2.filter((c) => c.estado === "pendiente").length
    };
  };
  const obtenerResumenSemanal = (fechaInicio) => {
    const inicio = /* @__PURE__ */ new Date(fechaInicio + "T00:00:00");
    const resumen = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + i);
      const fechaStr = fecha.toISOString().split("T")[0] || "";
      if (!fechaStr) continue;
      const carga = calcularCargaDiaria(fechaStr);
      resumen.push({
        fecha: fechaStr,
        dia: fecha.toLocaleDateString("es-ES", { weekday: "short" }),
        citas: carga.total,
        confirmadas: carga.confirmadas,
        pendientes: carga.pendientes
      });
    }
    return resumen;
  };
  const obtenerResumenMensual = (year, month) => {
    const ultimoDia = new Date(year, month + 1, 0);
    const resumen = /* @__PURE__ */ new Map();
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(year, month, dia);
      const fechaStr = fecha.toISOString().split("T")[0] || "";
      if (!fechaStr) continue;
      const carga = calcularCargaDiaria(fechaStr);
      resumen.set(fechaStr, {
        dia,
        citas: carga.total,
        confirmadas: carga.confirmadas,
        pendientes: carga.pendientes
      });
    }
    return resumen;
  };
  return {
    // Estado
    citas,
    loading,
    error,
    filtros,
    // Computadas
    citasDelDia,
    citasPendientes,
    citasCompletadas,
    citasConBonoProximoAgotar,
    citasFiltradas,
    // Métodos principales
    getCitasDelTerapeuta,
    completarCita,
    obtenerHistorialBono,
    verificarBonoCitas,
    // Detección y reparación de inconsistencias
    citasPendientesSync,
    detectarInconsistencias,
    resincronizarBono,
    resincronizarTodos,
    // Nuevas funcionalidades
    aplicarFiltros,
    limpiarFiltros,
    reprogramarCita,
    actualizarNotasRapidas,
    obtenerDisponibilidad,
    calcularHuecosLibres,
    programarRecordatorios,
    calcularCargaDiaria,
    obtenerResumenSemanal,
    obtenerResumenMensual,
    // Realtime
    suscribirCitasRealtime,
    desuscribirCitasRealtime
  };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TarjetaCita",
  __ssrInlineRender: true,
  props: {
    cita: {},
    compact: { type: Boolean }
  },
  emits: ["completar", "verHistorial"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const formatearHora = (hora) => {
      return hora.substring(0, 5);
    };
    const claseEstadoCita = computed(() => {
      const estado = props.cita.estado;
      const clases = {
        pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
        confirmada: "bg-blue-100 text-blue-800 border-blue-300",
        completada: "bg-green-100 text-green-800 border-green-300",
        realizada: "bg-green-100 text-green-800 border-green-300",
        cancelada: "bg-red-100 text-red-800 border-red-300"
      };
      return clases[estado] || "bg-gray-100 text-gray-800 border-gray-300";
    });
    const estadoBono = computed(() => {
      if (!props.cita.bono) return null;
      const sesiones = props.cita.bono.sesiones_restantes;
      const estado = props.cita.bono.estado;
      if (estado === "completado" || sesiones === 0) {
        return {
          color: "text-red-600",
          icono: "\u{1F6AB}",
          alerta: true,
          mensajeAlerta: "Bono agotado",
          clase: "bg-red-50 border-red-200"
        };
      } else if (sesiones === 1) {
        return {
          color: "text-orange-600",
          icono: "\u26A0\uFE0F",
          alerta: true,
          mensajeAlerta: "\xDAltima sesi\xF3n del bono",
          clase: "bg-orange-50 border-orange-200"
        };
      } else if (sesiones <= 2) {
        return {
          color: "text-yellow-600",
          icono: "\u26A0\uFE0F",
          alerta: true,
          mensajeAlerta: "Pocas sesiones restantes",
          clase: "bg-yellow-50 border-yellow-200"
        };
      } else if (estado === "activo") {
        return {
          color: "text-green-600",
          icono: "\u2713",
          alerta: false,
          mensajeAlerta: null,
          clase: "bg-green-50 border-green-200"
        };
      }
      return {
        color: "text-gray-600",
        icono: "\u2139\uFE0F",
        alerta: false,
        mensajeAlerta: null,
        clase: "bg-gray-50 border-gray-200"
      };
    });
    const puedeCompletar = computed(() => {
      return props.cita.estado === "pendiente" || props.cita.estado === "confirmada";
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: [
          "border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-white overflow-hidden",
          __props.compact ? "p-3" : "p-5"
        ]
      }, _attrs))} data-v-3085384e><div class="flex items-start justify-between gap-4" data-v-3085384e><div class="flex-1 min-w-0" data-v-3085384e><div class="flex items-center gap-3 mb-2 flex-wrap" data-v-3085384e><h3 class="${ssrRenderClass([__props.compact ? "text-base" : "text-lg", "font-semibold text-gray-900 truncate"])}" data-v-3085384e>${ssrInterpolate(((_a = __props.cita.paciente) == null ? void 0 : _a.nombre_completo) || "Paciente")}</h3><span class="${ssrRenderClass([
        "px-3 py-1 text-xs font-medium rounded-full border",
        unref(claseEstadoCita)
      ])}" data-v-3085384e>${ssrInterpolate(__props.cita.estado.toUpperCase())}</span></div><div class="${ssrRenderClass(["space-y-1", __props.compact ? "text-xs" : "text-sm", "text-gray-600"])}" data-v-3085384e><div class="flex items-center gap-2" data-v-3085384e><svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-3085384e><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" data-v-3085384e></path></svg><span class="truncate" data-v-3085384e>${ssrInterpolate(formatearHora(__props.cita.hora_inicio))} - ${ssrInterpolate(formatearHora(__props.cita.hora_fin))}</span>`);
      if (__props.cita.modalidad) {
        _push(`<span class="text-gray-400" data-v-3085384e>\u2022</span>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.cita.modalidad) {
        _push(`<span class="capitalize truncate" data-v-3085384e>${ssrInterpolate(__props.cita.modalidad)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (((_b = __props.cita.paciente) == null ? void 0 : _b.telefono) && !__props.compact) {
        _push(`<div class="flex items-center gap-2" data-v-3085384e><svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-3085384e><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" data-v-3085384e></path></svg><span class="truncate" data-v-3085384e>${ssrInterpolate(__props.cita.paciente.telefono)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.cita.bono) {
        _push(`<div class="${ssrRenderClass(["mt-3 p-3 rounded-lg border", ((_c = unref(estadoBono)) == null ? void 0 : _c.clase) || "bg-gray-50 border-gray-200"])}" data-v-3085384e><div class="flex items-center justify-between gap-2" data-v-3085384e><div class="flex-1 min-w-0" data-v-3085384e><p class="text-xs font-medium text-gray-700 mb-1" data-v-3085384e>${ssrInterpolate((_d = unref(estadoBono)) == null ? void 0 : _d.icono)} Bono de Sesiones </p><div class="flex items-center gap-2 flex-wrap" data-v-3085384e><p class="${ssrRenderClass(["text-sm font-semibold", ((_e = unref(estadoBono)) == null ? void 0 : _e.color) || "text-gray-900"])}" data-v-3085384e>${ssrInterpolate(__props.cita.bono.sesiones_restantes)} / ${ssrInterpolate(__props.cita.bono.sesiones_totales)} sesiones </p><span class="text-xs text-gray-500 capitalize" data-v-3085384e> (${ssrInterpolate(__props.cita.bono.estado)}) </span></div>`);
        if ((_f = unref(estadoBono)) == null ? void 0 : _f.alerta) {
          _push(`<p class="${ssrRenderClass(["mt-2 text-xs font-medium", unref(estadoBono).color])}" data-v-3085384e>${ssrInterpolate(unref(estadoBono).mensajeAlerta)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (!__props.compact) {
          _push(`<button class="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap px-2 py-1 hover:bg-blue-50 rounded transition-colors" type="button" data-v-3085384e> \u{1F4CA} Historial </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<div class="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg" data-v-3085384e><p class="text-xs text-gray-500 italic flex items-center gap-2" data-v-3085384e><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-3085384e><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-v-3085384e></path></svg> Sin bono activo - Consulta individual </p></div>`);
      }
      if (__props.cita.observaciones && !__props.compact) {
        _push(`<div class="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700" data-v-3085384e><p class="font-medium text-gray-500 mb-1" data-v-3085384e>Observaciones:</p> ${ssrInterpolate(__props.cita.observaciones)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex flex-col gap-2" data-v-3085384e>`);
      if (unref(puedeCompletar)) {
        _push(`<button class="${ssrRenderClass([
          "px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors",
          __props.compact ? "text-xs" : "text-sm"
        ])}" type="button" data-v-3085384e> \u2705 Completar </button>`);
      } else if (__props.cita.estado === "completada" || __props.cita.estado === "realizada") {
        _push(`<span class="${ssrRenderClass([
          "px-4 py-2 bg-green-100 text-green-800 font-medium rounded-lg text-center",
          __props.compact ? "text-xs" : "text-sm"
        ])}" data-v-3085384e> \u2713 Completada </span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TarjetaCita.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-3085384e"]]), { __name: "TarjetaCita" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AgendaTerapeuta",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      citas,
      loading,
      error,
      citasDelDia,
      citasPendientes,
      citasCompletadas,
      citasConBonoProximoAgotar,
      completarCita,
      obtenerHistorialBono,
      verificarBonoCitas
    } = useAgenda();
    useSupabaseClient();
    const filtroActivo = ref("hoy");
    const vista = ref("calendario");
    const fechaSeleccionada = ref(/* @__PURE__ */ new Date());
    const mostrarModalHistorial = ref(false);
    const bonoSeleccionado = ref(null);
    const historialBono = ref([]);
    const verificacionBono = ref(null);
    const cargandoModal = ref(false);
    ref(null);
    const celdaObjetivo = ref(null);
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
    const diasSemana = computed(() => {
      const inicio = new Date(fechaSeleccionada.value);
      const diaSemana = inicio.getDay();
      const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
      inicio.setDate(inicio.getDate() + diff);
      const dias = [];
      for (let i = 0; i < 7; i++) {
        const fecha = new Date(inicio);
        fecha.setDate(inicio.getDate() + i);
        dias.push({
          fecha: fecha.toISOString().split("T")[0],
          nombreDia: fecha.toLocaleDateString("es-ES", { weekday: "short" }),
          numeroDia: fecha.getDate(),
          mes: fecha.toLocaleDateString("es-ES", { month: "short" })
        });
      }
      return dias;
    });
    const citasFiltradas = computed(() => {
      switch (filtroActivo.value) {
        case "hoy":
          return citasDelDia.value;
        case "pendientes":
          return citasPendientes.value;
        case "completadas":
          return citasCompletadas.value;
        default:
          return citas.value;
      }
    });
    const formatearHora = (hora) => {
      return hora.substring(0, 5);
    };
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
    const getBadgeEstado = (estado) => {
      const clases = {
        pendiente: "bg-amber-100 text-amber-700 border border-amber-200",
        confirmada: "bg-green-100 text-green-700 border border-green-200",
        completada: "bg-blue-100 text-blue-700 border border-blue-200",
        realizada: "bg-blue-100 text-blue-700 border border-blue-200",
        cancelada: "bg-red-100 text-red-700 border border-red-200"
      };
      return clases[estado] || "bg-gray-100 text-gray-700 border border-gray-200";
    };
    const esHoy = (fecha) => {
      const hoy = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      return fecha === hoy;
    };
    const citasPorHora = (hora) => {
      const fechaStr = fechaSeleccionada.value.toISOString().split("T")[0];
      return citas.value.filter(
        (c) => {
          var _a;
          return c.fecha_cita === fechaStr && ((_a = c.hora_inicio) == null ? void 0 : _a.startsWith(hora));
        }
      );
    };
    const getClasesCita = (estado) => {
      const clases = {
        pendiente: "bg-yellow-100 border-l-4 border-yellow-500",
        confirmada: "bg-green-100 border-l-4 border-green-500",
        completada: "bg-blue-100 border-l-4 border-blue-500",
        realizada: "bg-blue-100 border-l-4 border-blue-500",
        cancelada: "bg-red-100 border-l-4 border-red-500"
      };
      return clases[estado] || "bg-gray-100 border-l-4 border-gray-500";
    };
    const getEstadoLabel = (estado) => {
      const labels = {
        pendiente: "Pendiente",
        confirmada: "Confirmada",
        completada: "Completada",
        realizada: "Realizada",
        cancelada: "Cancelada"
      };
      return labels[estado] || estado;
    };
    const claseSesionesRestantes = (sesiones) => {
      if (sesiones === 0) return "text-red-600 font-bold";
      if (sesiones === 1) return "text-orange-600 font-semibold";
      if (sesiones <= 2) return "text-yellow-600 font-medium";
      return "text-green-600";
    };
    const citasPorDiaHora = (fecha, hora) => {
      return citas.value.filter(
        (c) => {
          var _a;
          return c.fecha_cita === fecha && ((_a = c.hora_inicio) == null ? void 0 : _a.startsWith(hora));
        }
      );
    };
    const esCeldaObjetivo = (fecha, hora) => {
      var _a, _b;
      return ((_a = celdaObjetivo.value) == null ? void 0 : _a.fecha) === fecha && ((_b = celdaObjetivo.value) == null ? void 0 : _b.hora) === hora;
    };
    const handleCompletarCita = async (citaId) => {
      if (!confirm("\xBFEst\xE1s seguro de marcar esta cita como completada?")) return;
      try {
        const resultado = await completarCita(citaId);
        if (resultado.success) {
          console.log("Cita completada");
        }
      } catch (error2) {
        console.error("Error al completar cita:", error2);
      }
    };
    const abrirHistorial = async (bonoId) => {
      try {
        cargandoModal.value = true;
        bonoSeleccionado.value = bonoId;
        mostrarModalHistorial.value = true;
        const [historial, verificacion] = await Promise.all([
          obtenerHistorialBono(bonoId),
          verificarBonoCitas(bonoId)
        ]);
        historialBono.value = historial;
        verificacionBono.value = verificacion;
      } catch (error2) {
        console.error("Error al cargar historial:", error2);
      } finally {
        cargandoModal.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TarjetaCita = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-3" }, _attrs))} data-v-040d0550><div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/30 p-4" data-v-040d0550><div class="flex items-center justify-between gap-3 mb-3" data-v-040d0550><div class="flex items-center gap-3" data-v-040d0550><h1 class="text-xl font-[&#39;Elms_Sans&#39;] font-bold text-neutral-800" data-v-040d0550>Mi Agenda</h1><span class="text-sm text-neutral-600" data-v-040d0550>${ssrInterpolate(formatearFechaLarga(fechaSeleccionada.value))}</span></div><div class="flex items-center gap-2" data-v-040d0550><div class="flex bg-neutral-100 rounded-xl p-1" data-v-040d0550><button class="${ssrRenderClass([vista.value === "dia" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-600 hover:text-neutral-800", "px-3 py-1.5 rounded-lg text-sm font-medium transition-all"])}" data-v-040d0550> D\xEDa </button><button class="${ssrRenderClass([vista.value === "calendario" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-600 hover:text-neutral-800", "px-3 py-1.5 rounded-lg text-sm font-medium transition-all"])}" data-v-040d0550> Semana </button><button class="${ssrRenderClass([vista.value === "lista" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-600 hover:text-neutral-800", "px-3 py-1.5 rounded-lg text-sm font-medium transition-all"])}" data-v-040d0550> Lista </button></div><div class="flex items-center gap-1" data-v-040d0550><button class="p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-all" title="Anterior" data-v-040d0550> \u2190 </button><button class="px-3 py-1.5 bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white hover:from-[#027368] hover:to-[#04BF9D] rounded-lg text-sm font-medium transition-all" data-v-040d0550> Hoy </button><button class="p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-all" title="Siguiente" data-v-040d0550> \u2192 </button></div><button class="px-4 py-2 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all text-sm font-medium shadow-sm"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} data-v-040d0550>`);
      if (unref(loading)) {
        _push(`<span data-v-040d0550>Actualizando...</span>`);
      } else {
        _push(`<span data-v-040d0550>\u21BB Actualizar</span>`);
      }
      _push(`</button></div></div>`);
      if (vista.value === "lista") {
        _push(`<div class="flex flex-wrap gap-2" data-v-040d0550><!--[-->`);
        ssrRenderList([
          { key: "hoy", label: "Hoy", count: unref(citasDelDia).length },
          { key: "pendientes", label: "Pendientes", count: unref(citasPendientes).length },
          { key: "completadas", label: "Completadas", count: unref(citasCompletadas).length },
          { key: "todas", label: "Todas", count: unref(citas).length }
        ], (filtro) => {
          _push(`<button class="${ssrRenderClass([
            "px-3 py-1.5 rounded-xl text-sm font-medium transition-all shadow-sm",
            filtroActivo.value === filtro.key ? "bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white" : "bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200"
          ])}" data-v-040d0550>${ssrInterpolate(filtro.label)} (${ssrInterpolate(filtro.count)}) </button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(citasConBonoProximoAgotar).length > 0) {
        _push(`<div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-4 shadow-sm" data-v-040d0550><div class="flex items-center gap-3" data-v-040d0550><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F2B33D] to-[#F2B33D]/70 flex items-center justify-center flex-shrink-0" data-v-040d0550><svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20" data-v-040d0550><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" data-v-040d0550></path></svg></div><div class="flex-1" data-v-040d0550><p class="text-sm font-medium text-amber-900" data-v-040d0550> Atenci\xF3n: ${ssrInterpolate(unref(citasConBonoProximoAgotar).length)} paciente(s) con pocas sesiones restantes </p><p class="text-xs text-amber-700 mt-1" data-v-040d0550> Considera informar a estos pacientes para renovar sus bonos </p></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (vista.value === "dia") {
        _push(`<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/30 overflow-hidden flex flex-col" style="${ssrRenderStyle({ "height": "calc(100vh - 200px)" })}" data-v-040d0550><div class="sticky top-0 z-10 bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm p-4" data-v-040d0550><div class="flex items-center justify-between" data-v-040d0550><div data-v-040d0550><h3 class="font-[&#39;Elms_Sans&#39;] font-semibold text-lg text-neutral-800" data-v-040d0550>${ssrInterpolate(formatearFechaCompleta(fechaSeleccionada.value))}</h3><p class="text-sm text-neutral-600 mt-1" data-v-040d0550>${ssrInterpolate(citasPorHora ? Object.values(horasDelDia).reduce((total, hora) => total + citasPorHora(hora).length, 0) : 0)} citas programadas </p></div></div></div><div class="flex-1 overflow-y-auto" data-v-040d0550>`);
        if (citasFiltradas.value.length === 0) {
          _push(`<div class="flex items-center justify-center py-16" data-v-040d0550><div class="text-center" data-v-040d0550><div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#027368]/10 to-[#04BF9D]/10 flex items-center justify-center" data-v-040d0550><svg class="w-8 h-8 text-[#027368]" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-040d0550><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" data-v-040d0550></path></svg></div><h3 class="font-[&#39;Elms_Sans&#39;] font-medium text-neutral-800 mb-2" data-v-040d0550>No hay citas programadas</h3><p class="text-neutral-600 text-sm" data-v-040d0550>${ssrInterpolate(formatearFechaCompleta(fechaSeleccionada.value))} est\xE1 libre</p></div></div>`);
        } else {
          _push(`<div class="divide-y divide-neutral-100" data-v-040d0550><!--[-->`);
          ssrRenderList(horasDelDia, (hora, index) => {
            _push(`<div${ssrRenderAttr("data-hora", hora)} class="flex hover:bg-neutral-50/50 transition-colors" data-v-040d0550><div class="w-20 p-3 text-sm font-medium text-neutral-600 border-r border-neutral-200 bg-neutral-50/50 flex-shrink-0" data-v-040d0550>${ssrInterpolate(hora)}</div><div class="flex-1 p-3 cursor-pointer hover:bg-[#027368]/5 transition-colors relative group/cell" data-v-040d0550>`);
            if (citasPorHora(hora).length === 0) {
              _push(`<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none" data-v-040d0550><span class="text-xs text-[#027368] font-medium bg-white px-3 py-1.5 rounded-full shadow-sm border border-white/50" data-v-040d0550> Horario libre </span></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--[-->`);
            ssrRenderList(citasPorHora(hora), (cita) => {
              var _a;
              _push(`<div draggable="true" class="${ssrRenderClass([getClasesCita(cita.estado), "mb-2 p-3 rounded-xl transition-all hover:shadow-md hover:ring-2 hover:ring-[#027368]/30 group relative cursor-move backdrop-blur-sm"])}" title="Arrastra para mover a otra hora" data-v-040d0550><div class="flex items-start justify-between gap-3" data-v-040d0550><div class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" data-v-040d0550>`);
              _push(ssrRenderComponent(unref(ArrowsPointingOutIcon), { class: "w-4 h-4 text-neutral-500" }, null, _parent));
              _push(`</div><div class="flex-1" data-v-040d0550><p class="font-medium text-sm text-neutral-800" data-v-040d0550>${ssrInterpolate(((_a = cita.paciente) == null ? void 0 : _a.nombre_completo) || "Sin nombre")}</p><div class="flex items-center gap-2 mt-1" data-v-040d0550><span class="text-xs text-neutral-600 font-medium" data-v-040d0550>${ssrInterpolate(formatearHora(cita.hora_inicio))} - ${ssrInterpolate(formatearHora(cita.hora_fin))}</span><span class="text-xs px-2 py-1 rounded-lg bg-white/60 text-neutral-700" data-v-040d0550>${ssrInterpolate(cita.modalidad)}</span></div></div><div class="flex items-center gap-2" data-v-040d0550><span class="${ssrRenderClass([getBadgeEstado(cita.estado), "text-xs px-2 py-1 rounded-lg font-medium whitespace-nowrap"])}" data-v-040d0550>${ssrInterpolate(getEstadoLabel(cita.estado))}</span></div></div></div>`);
            });
            _push(`<!--]-->`);
            if (citasPorHora(hora).length === 0) {
              _push(`<div class="text-xs text-neutral-400 italic" data-v-040d0550> Sin citas programadas </div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div></div>`);
      } else if (vista.value === "calendario") {
        _push(`<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/30 overflow-hidden flex flex-col" style="${ssrRenderStyle({ "height": "calc(100vh - 200px)" })}" data-v-040d0550><div class="min-w-[800px] overflow-x-auto flex-1 flex flex-col" data-v-040d0550><div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm" data-v-040d0550><div class="grid grid-cols-8" data-v-040d0550><div class="p-2 border-r border-gray-200 bg-gray-50" data-v-040d0550></div><!--[-->`);
        ssrRenderList(diasSemana.value, (dia) => {
          _push(`<div class="${ssrRenderClass([esHoy(dia.fecha) ? "bg-blue-50" : "bg-white", "p-2 text-center border-r border-gray-200 last:border-r-0"])}" data-v-040d0550><div class="flex items-center justify-center gap-1" data-v-040d0550><span class="text-xs font-medium text-gray-600 uppercase" data-v-040d0550>${ssrInterpolate(dia.nombreDia)}</span><span class="${ssrRenderClass([esHoy(dia.fecha) ? "text-blue-600" : "", "text-lg font-bold text-gray-900"])}" data-v-040d0550>${ssrInterpolate(dia.numeroDia)}</span></div><div class="text-xs text-gray-500" data-v-040d0550>${ssrInterpolate(dia.mes)}</div></div>`);
        });
        _push(`<!--]--></div></div><div class="flex-1 overflow-y-auto" data-v-040d0550><div class="divide-y divide-gray-100" data-v-040d0550><!--[-->`);
        ssrRenderList(horasDelDia, (hora) => {
          _push(`<div${ssrRenderAttr("data-hora", hora)} class="grid grid-cols-8" data-v-040d0550><div class="p-3 text-sm font-medium text-gray-600 border-r border-gray-100 bg-gray-50 sticky left-0" data-v-040d0550>${ssrInterpolate(hora)}</div><!--[-->`);
          ssrRenderList(diasSemana.value, (dia) => {
            _push(`<div class="${ssrRenderClass([[
              esHoy(dia.fecha) ? "bg-blue-50/20" : "",
              esCeldaObjetivo(dia.fecha, hora) ? "bg-blue-100 ring-2 ring-blue-500 ring-inset" : ""
            ], "p-2 border-r border-gray-100 last:border-r-0 hover:bg-blue-50/30 transition-colors min-h-[70px] cursor-pointer relative group/cell"])}" data-v-040d0550>`);
            if (citasPorDiaHora(dia.fecha, hora).length === 0) {
              _push(`<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none" data-v-040d0550><span class="text-xs text-blue-600 font-medium bg-white px-2 py-1 rounded-full shadow-sm" data-v-040d0550> Libre </span></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--[-->`);
            ssrRenderList(citasPorDiaHora(dia.fecha, hora), (cita) => {
              var _a;
              _push(`<div draggable="true" class="${ssrRenderClass([getClasesCita(cita.estado), "text-xs p-2 rounded-lg mb-1.5 hover:shadow-lg hover:ring-2 hover:ring-blue-400 transition-all group relative cursor-move"])}" title="Arrastra para mover" data-v-040d0550><div class="opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 left-1" data-v-040d0550>`);
              _push(ssrRenderComponent(unref(ArrowsPointingOutIcon), { class: "w-3 h-3 text-gray-500" }, null, _parent));
              _push(`</div><div class="pl-5" data-v-040d0550><p class="font-semibold truncate text-sm" data-v-040d0550>${ssrInterpolate(((_a = cita.paciente) == null ? void 0 : _a.nombre_completo) || "Sin nombre")}</p><p class="text-xs text-gray-600 mt-0.5" data-v-040d0550>${ssrInterpolate(formatearHora(cita.hora_inicio))} - ${ssrInterpolate(formatearHora(cita.hora_fin))}</p><div class="flex items-center gap-1 mt-1" data-v-040d0550><span class="text-xs px-1.5 py-0.5 rounded-full bg-white/60" data-v-040d0550>${ssrInterpolate(cita.modalidad)}</span>`);
              if (cita.bono) {
                _push(`<span class="text-xs text-green-700" data-v-040d0550> Bono </span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div></div>`);
            });
            _push(`<!--]--></div>`);
          });
          _push(`<!--]--></div>`);
        });
        _push(`<!--]--></div></div></div></div>`);
      } else {
        _push(`<div data-v-040d0550><div class="flex flex-wrap gap-2 mb-6" data-v-040d0550><!--[-->`);
        ssrRenderList([
          { key: "hoy", label: "Hoy", count: unref(citasDelDia).length },
          { key: "pendientes", label: "Pendientes", count: unref(citasPendientes).length },
          { key: "completadas", label: "Completadas", count: unref(citasCompletadas).length },
          { key: "todas", label: "Todas", count: unref(citas).length }
        ], (filtro) => {
          _push(`<button class="${ssrRenderClass([
            "px-4 py-2 rounded-lg font-medium transition-colors",
            filtroActivo.value === filtro.key ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          ])}" data-v-040d0550>${ssrInterpolate(filtro.label)} (${ssrInterpolate(filtro.count)}) </button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(error)) {
          _push(`<div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6" data-v-040d0550><p class="text-red-700" data-v-040d0550>${ssrInterpolate(unref(error))}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(loading) && unref(citas).length === 0) {
          _push(`<div class="text-center py-12" data-v-040d0550><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" data-v-040d0550></div><p class="text-gray-600" data-v-040d0550>Cargando citas...</p></div>`);
        } else if (citasFiltradas.value.length === 0) {
          _push(`<div class="text-center py-12 bg-gray-50 rounded-lg" data-v-040d0550><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-040d0550><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" data-v-040d0550></path></svg><h3 class="mt-2 text-sm font-medium text-gray-900" data-v-040d0550>No hay citas</h3><p class="mt-1 text-sm text-gray-500" data-v-040d0550>${ssrInterpolate(filtroActivo.value === "hoy" ? "No tienes citas programadas para hoy." : "No hay citas en esta categor\xEDa.")}</p></div>`);
        } else {
          _push(`<div class="space-y-4" data-v-040d0550><!--[-->`);
          ssrRenderList(citasFiltradas.value, (cita) => {
            _push(ssrRenderComponent(_component_TarjetaCita, {
              key: cita.id,
              cita,
              onCompletar: handleCompletarCita,
              onVerHistorial: abrirHistorial
            }, null, _parent));
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div>`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (mostrarModalHistorial.value) {
          _push2(`<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-v-040d0550><div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden" data-v-040d0550><div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between" data-v-040d0550><h2 class="text-xl font-bold text-gray-900" data-v-040d0550>Historial del Bono</h2><button class="text-gray-400 hover:text-gray-600 transition-colors" data-v-040d0550><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-040d0550><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-040d0550></path></svg></button></div><div class="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]" data-v-040d0550>`);
          if (cargandoModal.value) {
            _push2(`<div class="text-center py-8" data-v-040d0550><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" data-v-040d0550></div></div>`);
          } else {
            _push2(`<div data-v-040d0550>`);
            if (verificacionBono.value) {
              _push2(`<div class="mb-6 p-4 bg-blue-50 rounded-lg" data-v-040d0550><h3 class="font-semibold text-gray-900 mb-3" data-v-040d0550>Resumen</h3><div class="grid grid-cols-3 gap-4 text-center" data-v-040d0550><div data-v-040d0550><p class="text-2xl font-bold text-blue-600" data-v-040d0550>${ssrInterpolate(verificacionBono.value.bono.sesiones_totales)}</p><p class="text-xs text-gray-600" data-v-040d0550>Sesiones Totales</p></div><div data-v-040d0550><p class="text-2xl font-bold text-green-600" data-v-040d0550>${ssrInterpolate(verificacionBono.value.bono.sesiones_usadas)}</p><p class="text-xs text-gray-600" data-v-040d0550>Sesiones Usadas</p></div><div data-v-040d0550><p class="${ssrRenderClass(["text-2xl font-bold", claseSesionesRestantes(verificacionBono.value.bono.sesiones_restantes)])}" data-v-040d0550>${ssrInterpolate(verificacionBono.value.bono.sesiones_restantes)}</p><p class="text-xs text-gray-600" data-v-040d0550>Sesiones Restantes</p></div></div>`);
              if (verificacionBono.value.alerta) {
                _push2(`<div class="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800" data-v-040d0550>${ssrInterpolate(verificacionBono.value.mensaje_alerta)}</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div data-v-040d0550><h3 class="font-semibold text-gray-900 mb-3" data-v-040d0550>Movimientos</h3>`);
            if (historialBono.value.length === 0) {
              _push2(`<div class="text-center py-8 text-gray-500" data-v-040d0550> No hay movimientos registrados </div>`);
            } else {
              _push2(`<div class="space-y-3" data-v-040d0550><!--[-->`);
              ssrRenderList(historialBono.value, (mov) => {
                _push2(`<div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors" data-v-040d0550><div class="flex items-start justify-between" data-v-040d0550><div class="flex-1" data-v-040d0550><div class="flex items-center gap-2 mb-1" data-v-040d0550><span class="${ssrRenderClass([
                  "px-2 py-1 text-xs font-medium rounded",
                  mov.tipo_movimiento === "descuento" ? "bg-red-100 text-red-700" : mov.tipo_movimiento === "reembolso" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                ])}" data-v-040d0550>${ssrInterpolate(mov.tipo_movimiento)}</span><span class="text-xs text-gray-500" data-v-040d0550>${ssrInterpolate(new Date(mov.fecha).toLocaleString("es-ES"))}</span></div><p class="text-sm text-gray-700" data-v-040d0550>${ssrInterpolate(mov.motivo)}</p></div><div class="text-right ml-4" data-v-040d0550><p class="text-sm font-semibold text-gray-900" data-v-040d0550>${ssrInterpolate(mov.sesiones_antes)} \u2192 ${ssrInterpolate(mov.sesiones_despues)}</p><p class="${ssrRenderClass([
                  "text-xs font-medium",
                  mov.sesiones_modificadas > 0 ? "text-red-600" : "text-green-600"
                ])}" data-v-040d0550>${ssrInterpolate(mov.sesiones_modificadas > 0 ? "-" : "+")}${ssrInterpolate(Math.abs(mov.sesiones_modificadas))}</p></div></div></div>`);
              });
              _push2(`<!--]--></div>`);
            }
            _push2(`</div></div>`);
          }
          _push2(`</div><div class="px-6 py-4 border-t border-gray-200 flex justify-end" data-v-040d0550><button class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors" data-v-040d0550> Cerrar </button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AgendaTerapeuta.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-040d0550"]]), { __name: "AgendaTerapeuta" });

export { __nuxt_component_0 as _, __nuxt_component_1 as a, useAgenda as u };
//# sourceMappingURL=AgendaTerapeuta-DO67d38s.mjs.map
