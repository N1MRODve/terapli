import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { u as useSupabase } from './useSupabase-DljD0dj8.mjs';
import { computed, readonly } from 'vue';
import { n as navigateTo } from './server.mjs';

const useRoles = () => {
  const { userProfile, getUserRole } = useSupabase();
  const hasRole = (role) => {
    var _a;
    return ((_a = userProfile.value) == null ? void 0 : _a.rol) === role;
  };
  const hasAnyRole = (roles) => {
    return roles.some((role) => {
      var _a;
      return ((_a = userProfile.value) == null ? void 0 : _a.rol) === role;
    });
  };
  const isPsicologa = computed(() => {
    var _a;
    return ((_a = userProfile.value) == null ? void 0 : _a.rol) === "psicologa";
  });
  const isPaciente = computed(() => {
    var _a;
    return ((_a = userProfile.value) == null ? void 0 : _a.rol) === "paciente";
  });
  const isCoordinadora = computed(() => {
    var _a;
    return ((_a = userProfile.value) == null ? void 0 : _a.rol) === "coordinadora";
  });
  const getRoleName = (role) => {
    const nombres = {
      psicologa: "Psic\xF3loga",
      paciente: "Paciente",
      coordinadora: "Coordinadora"
    };
    return role ? nombres[role] : "Desconocido";
  };
  const getDashboardPath = (role) => {
    var _a;
    const rol = role || ((_a = userProfile.value) == null ? void 0 : _a.rol);
    const paths = {
      psicologa: "/terapeuta/dashboard",
      coordinadora: "/coordinadora/dashboard",
      paciente: "/paciente/dashboard"
    };
    return rol ? paths[rol] : "/login";
  };
  const goToDashboard = async () => {
    const path = getDashboardPath();
    await navigateTo(path);
  };
  return {
    // Estado
    userProfile: readonly(userProfile),
    isPsicologa,
    isPaciente,
    isCoordinadora,
    // Métodos
    hasRole,
    hasAnyRole,
    getUserRole,
    getRoleName,
    getDashboardPath,
    goToDashboard
  };
};
const useBonos = () => {
  const supabase = useSupabaseClient();
  const { userProfile } = useSupabase();
  const { isCoordinadora } = useRoles();
  const getBonosPorPaciente = async (pacienteId) => {
    try {
      const { data, error } = await supabase.from("bonos").select("*").eq("paciente_id", pacienteId).order("created_at", { ascending: false });
      if (error) {
        console.warn("[Bonos] Error en consulta getBonosPorPaciente:", error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn("[Bonos] Error inesperado en getBonosPorPaciente:", err);
      return [];
    }
  };
  const getBonoConPagos = async (bonoId) => {
    try {
      const { data: bono, error: errorBono } = await supabase.from("bonos").select("*").eq("id", bonoId).single();
      if (errorBono) {
        console.warn("[Bonos] Error al obtener bono:", errorBono.message);
        return null;
      }
      const { data: pagos, error: errorPagos } = await supabase.from("pagos_bonos").select("*").eq("bono_id", bonoId).order("fecha_pago", { ascending: false });
      if (errorPagos) {
        console.warn("[Bonos] Error al obtener pagos:", errorPagos.message);
      }
      return {
        bono,
        pagos: pagos || []
      };
    } catch (err) {
      console.warn("[Bonos] Error inesperado en getBonoConPagos:", err);
      return null;
    }
  };
  const getBonosActivos = async (pacienteId) => {
    try {
      const { data, error } = await supabase.from("bonos").select("*").eq("paciente_id", pacienteId).eq("estado", "activo").order("created_at", { ascending: false });
      if (error) {
        console.warn("[Bonos] Error en getBonosActivos:", error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn("[Bonos] Error inesperado en getBonosActivos:", err);
      return [];
    }
  };
  const crearBono = async (bonoData) => {
    try {
      const { data, error } = await supabase.from("bonos").insert(bonoData).select().single();
      if (error) {
        console.error("[Bonos] Error al crear bono:", error.message);
        throw new Error(`Error al crear bono: ${error.message}`);
      }
      return data;
    } catch (err) {
      console.error("[Bonos] Error inesperado al crear bono:", err);
      throw new Error(err.message || "Error al crear el bono");
    }
  };
  const actualizarBono = async (bonoId, cambios) => {
    try {
      const { data, error } = await supabase.from("bonos").update({
        ...cambios,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", bonoId).select().single();
      if (error) {
        console.error("[Bonos] Error al actualizar bono:", error.message);
        throw new Error(`Error al actualizar bono: ${error.message}`);
      }
      return data;
    } catch (err) {
      console.error("[Bonos] Error inesperado al actualizar bono:", err);
      throw new Error(err.message || "Error al actualizar el bono");
    }
  };
  const registrarPago = async (bonoId, monto, metodo, confirmado = false) => {
    var _a;
    try {
      const pagoData = {
        bono_id: bonoId,
        monto,
        metodo_pago: metodo,
        confirmado,
        fecha_pago: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        ...confirmado && {
          confirmado_por: (_a = userProfile.value) == null ? void 0 : _a.id,
          fecha_confirmacion: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
      const { data, error } = await supabase.from("pagos_bonos").insert(pagoData).select().single();
      if (error) {
        console.error("[Bonos] Error al registrar pago:", error.message);
        throw new Error(`Error al registrar pago: ${error.message}`);
      }
      return data;
    } catch (err) {
      console.error("[Bonos] Error inesperado al registrar pago:", err);
      throw new Error(err.message || "Error al registrar el pago");
    }
  };
  const confirmarPago = async (pagoId) => {
    try {
      const { data, error } = await supabase.rpc("fn_confirmar_pago_bono", {
        p_pago_id: pagoId
      });
      if (error) {
        console.error("[Bonos] Error al confirmar pago:", error.message);
        throw new Error(`Error al confirmar pago: ${error.message}`);
      }
      const resultado = data;
      if (!resultado.success) {
        throw new Error(resultado.mensaje || "Error al confirmar el pago");
      }
      return resultado;
    } catch (err) {
      console.error("[Bonos] Error inesperado al confirmar pago:", err);
      throw new Error(err.message || "Error al confirmar el pago");
    }
  };
  const renovarBono = async (bonoId, motivo, modificarSesiones, modificarMonto) => {
    var _a;
    try {
      const userId = (_a = userProfile.value) == null ? void 0 : _a.id;
      if (!userId) {
        throw new Error("Usuario no autenticado");
      }
      const { data, error } = await supabase.rpc("fn_renovar_bono_manual", {
        p_bono_id: bonoId,
        p_usuario_id: userId,
        p_motivo: motivo || null,
        p_modificar_sesiones: modificarSesiones || null,
        p_modificar_monto: modificarMonto || null
      });
      if (error) {
        console.error("[Bonos] Error al renovar bono:", error.message);
        throw new Error(`Error al renovar bono: ${error.message}`);
      }
      const resultado = data;
      if (!resultado.success) {
        throw new Error(resultado.mensaje || "Error al renovar el bono");
      }
      return resultado;
    } catch (err) {
      console.error("[Bonos] Error inesperado al renovar bono:", err);
      throw new Error(err.message || "Error al renovar el bono");
    }
  };
  const getRenovaciones = async (bonoId) => {
    try {
      const { data, error } = await supabase.from("renovaciones_bonos").select("*").or(`bono_original_id.eq.${bonoId},nuevo_bono_id.eq.${bonoId}`).order("fecha_renovacion", { ascending: false });
      if (error) {
        console.warn("[Bonos] Error al obtener renovaciones:", error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn("[Bonos] Error inesperado al obtener renovaciones:", err);
      return [];
    }
  };
  const getPagosPorBono = async (bonoId) => {
    try {
      const { data, error } = await supabase.from("pagos_bonos").select("*").eq("bono_id", bonoId).order("fecha_pago", { ascending: false });
      if (error) {
        console.warn("[Bonos] Error al obtener pagos:", error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn("[Bonos] Error inesperado al obtener pagos:", err);
      return [];
    }
  };
  const calcularMetricas = async (pacienteId) => {
    try {
      const bonos = await getBonosPorPaciente(pacienteId);
      const activos = bonos.filter((b) => b.estado === "activo").length;
      const completados = bonos.filter((b) => b.estado === "completado").length;
      const vencidos = bonos.filter((b) => b.estado === "vencido").length;
      const pendientes = bonos.filter((b) => b.estado === "pendiente").length;
      const hoy = /* @__PURE__ */ new Date();
      const proximosAVencer = bonos.filter((b) => {
        if (b.estado !== "activo" || !b.fecha_fin) return false;
        const fechaFin = new Date(b.fecha_fin);
        const diasRestantes = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1e3 * 60 * 60 * 24));
        return diasRestantes >= 0 && diasRestantes <= 7;
      }).length;
      const pocasSesiones = bonos.filter(
        (b) => b.estado === "activo" && b.sesiones_restantes !== null && b.sesiones_restantes <= 2
      ).length;
      return {
        total: bonos.length,
        activos,
        completados,
        vencidos,
        pendientes,
        proximosAVencer,
        pocasSesiones
      };
    } catch (err) {
      console.warn("[Bonos] Error al calcular m\xE9tricas:", err);
      return {
        total: 0,
        activos: 0,
        completados: 0,
        vencidos: 0,
        pendientes: 0,
        proximosAVencer: 0,
        pocasSesiones: 0
      };
    }
  };
  const calcularPorcentajeUso = (bono) => {
    if (!bono.sesiones_totales || bono.sesiones_totales === 0) return 0;
    const sesionesUsadas = bono.sesiones_totales - (bono.sesiones_restantes || 0);
    return Math.round(sesionesUsadas / bono.sesiones_totales * 100);
  };
  const getEstadoColor = (estado) => {
    const colores = {
      "pendiente": "bg-yellow-100 text-yellow-700 border-yellow-300",
      "activo": "bg-green-100 text-green-700 border-green-300",
      "completado": "bg-gray-100 text-gray-600 border-gray-300",
      "vencido": "bg-red-100 text-red-600 border-red-300",
      "cancelado": "bg-gray-200 text-gray-500 border-gray-400 line-through"
    };
    return colores[estado] || "bg-gray-100 text-gray-600";
  };
  const getEstadoTexto = (estado) => {
    const textos = {
      "pendiente": "Pendiente de activaci\xF3n",
      "activo": "Activo",
      "completado": "Completado",
      "vencido": "Vencido",
      "cancelado": "Cancelado"
    };
    return textos[estado] || estado;
  };
  const puedeGestionarBonos = computed(() => {
    var _a;
    return isCoordinadora.value || ((_a = userProfile.value) == null ? void 0 : _a.rol) === "psicologa";
  });
  const puedeConfirmarPagos = computed(() => {
    return isCoordinadora.value;
  });
  return {
    // Funciones de consulta
    getBonosPorPaciente,
    getBonoConPagos,
    getBonosActivos,
    getPagosPorBono,
    getRenovaciones,
    calcularMetricas,
    // Funciones de modificación
    crearBono,
    actualizarBono,
    registrarPago,
    confirmarPago,
    renovarBono,
    // Helpers
    calcularPorcentajeUso,
    getEstadoColor,
    getEstadoTexto,
    // Permisos
    puedeGestionarBonos,
    puedeConfirmarPagos
  };
};

export { useRoles as a, useBonos as u };
//# sourceMappingURL=useBonos-BFarM2bD.mjs.map
