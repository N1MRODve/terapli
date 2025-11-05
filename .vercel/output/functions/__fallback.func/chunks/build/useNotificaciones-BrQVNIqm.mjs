import { g as useSupabaseClient, h as useSupabaseUser, e as useSupabase } from './server.mjs';
import { ref, computed } from 'vue';

const useNotificaciones = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const { getUserId } = useSupabase();
  const notificaciones = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const canal = ref(null);
  const totalNoVistas = ref(0);
  const noLeidas = computed(() => notificaciones.value.filter((n) => !n.leido));
  const urgentes = computed(
    () => noLeidas.value.filter(
      (n) => {
        var _a, _b;
        return n.tipo === "bono" && (((_a = n.metadata) == null ? void 0 : _a.urgencia) === "alta" || ((_b = n.metadata) == null ? void 0 : _b.sesiones_restantes) === 0);
      }
    )
  );
  const tieneUrgentes = computed(() => urgentes.value.length > 0);
  const listar = async (limite = 20) => {
    var _a;
    const userId = getUserId();
    if (!userId) {
      console.warn("Usuario no autenticado o ID no disponible");
      error.value = "Usuario no autenticado";
      return [];
    }
    loading.value = true;
    error.value = null;
    try {
      const { data, error: fetchError } = await supabase.from("notificaciones").select("*").eq("usuario_id", userId).order("created_at", { ascending: false }).limit(limite);
      if (fetchError) {
        if (fetchError.code === "PGRST116" || fetchError.message.includes("does not exist")) {
          console.warn("\u26A0\uFE0F Tabla notificaciones no existe a\xFAn. Retornando vac\xEDo.");
          notificaciones.value = [];
          totalNoVistas.value = 0;
          return [];
        }
        throw fetchError;
      }
      notificaciones.value = data || [];
      totalNoVistas.value = (data || []).filter((n) => !n.visto && !n.leido).length;
      return data || [];
    } catch (e) {
      if (!((_a = e.message) == null ? void 0 : _a.includes("does not exist"))) {
        error.value = e.message || "Error al cargar notificaciones";
        console.error("Error en listar notificaciones:", e);
      }
      return [];
    } finally {
      loading.value = false;
    }
  };
  const crear = async (usuarioId, titulo, mensaje, tipo = "mensaje", referenciaId) => {
    if (!user.value) {
      error.value = "Usuario no autenticado";
      return null;
    }
    loading.value = true;
    error.value = null;
    try {
      const { data, error: insertError } = await supabase.from("notificaciones").insert({
        usuario_id: usuarioId,
        titulo,
        mensaje,
        tipo,
        referencia_id: referenciaId || null,
        visto: false
      }).select().single();
      if (insertError) throw insertError;
      return data;
    } catch (e) {
      error.value = e.message || "Error al crear notificaci\xF3n";
      console.error("Error en crear notificaci\xF3n:", e);
      return null;
    } finally {
      loading.value = false;
    }
  };
  const marcarVista = async (notificacionId) => {
    if (!user.value) return;
    try {
      const { data, error: rpcError } = await supabase.rpc("marcar_notificacion_leida", {
        p_notificacion_id: notificacionId
      });
      if (rpcError) throw rpcError;
      notificaciones.value = notificaciones.value.map(
        (n) => n.id === notificacionId ? { ...n, leido: true, leido_at: (/* @__PURE__ */ new Date()).toISOString() } : n
      );
      totalNoVistas.value = Math.max(0, totalNoVistas.value - 1);
    } catch (e) {
      console.error("Error al marcar notificaci\xF3n como le\xEDda:", e);
    }
  };
  const marcarComoLeida = marcarVista;
  const marcarTodasVistas = async () => {
    if (!user.value) return;
    try {
      const { data, error: rpcError } = await supabase.rpc("marcar_todas_notificaciones_leidas");
      if (rpcError) throw rpcError;
      notificaciones.value = notificaciones.value.map((n) => ({
        ...n,
        leido: true,
        leido_at: n.leido_at || (/* @__PURE__ */ new Date()).toISOString()
      }));
      totalNoVistas.value = 0;
      return { success: true, marcadas: (data == null ? void 0 : data.marcadas) || 0 };
    } catch (e) {
      console.error("Error al marcar todas las notificaciones como le\xEDdas:", e);
      return { success: false, error: e.message };
    }
  };
  const marcarTodasComoLeidas = marcarTodasVistas;
  const contarNoVistas = async () => {
    if (!user.value) return 0;
    try {
      const { data, error: rpcError } = await supabase.rpc("contar_notificaciones_no_leidas");
      if (rpcError) throw rpcError;
      totalNoVistas.value = data || 0;
      return data || 0;
    } catch (e) {
      console.error("Error al contar notificaciones no le\xEDdas:", e);
      return 0;
    }
  };
  const obtenerContador = contarNoVistas;
  const eliminar = async (notificacionId) => {
    if (!user.value) return;
    try {
      const { error: deleteError } = await supabase.from("notificaciones").delete().eq("id", notificacionId).eq("usuario_id", user.value.id);
      if (deleteError) throw deleteError;
      const notificacionEliminada = notificaciones.value.find((n) => n.id === notificacionId);
      if (notificacionEliminada && !notificacionEliminada.leido && !notificacionEliminada.visto) {
        totalNoVistas.value = Math.max(0, totalNoVistas.value - 1);
      }
      notificaciones.value = notificaciones.value.filter((n) => n.id !== notificacionId);
    } catch (e) {
      console.error("Error al eliminar notificaci\xF3n:", e);
    }
  };
  const eliminarVistas = async () => {
    if (!user.value) return;
    try {
      const { error: deleteError } = await supabase.from("notificaciones").delete().eq("usuario_id", user.value.id).eq("leido", true);
      if (deleteError) throw deleteError;
      notificaciones.value = notificaciones.value.filter((n) => !n.leido);
    } catch (e) {
      console.error("Error al eliminar notificaciones vistas:", e);
    }
  };
  const suscribirse = () => {
    if (!user.value || canal.value) return;
    canal.value = supabase.channel(`notificaciones:${user.value.id}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notificaciones",
        filter: `usuario_id=eq.${user.value.id}`
      },
      (payload) => {
        var _a;
        const nuevaNotificacion = payload.new;
        notificaciones.value.unshift(nuevaNotificacion);
        totalNoVistas.value++;
        if ("Notification" in void 0 && Notification.permission === "granted") {
          new Notification(nuevaNotificacion.titulo, {
            body: nuevaNotificacion.mensaje,
            icon: "/icon-notification.png",
            badge: nuevaNotificacion.tipo === "bono" && ((_a = nuevaNotificacion.metadata) == null ? void 0 : _a.urgencia) === "alta" ? "\u{1F534}" : "\u{1F514}"
          });
        }
      }
    ).on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notificaciones",
        filter: `usuario_id=eq.${user.value.id}`
      },
      (payload) => {
        const notificacionActualizada = payload.new;
        const index = notificaciones.value.findIndex((n) => n.id === notificacionActualizada.id);
        if (index !== -1) {
          notificaciones.value[index] = notificacionActualizada;
        }
      }
    ).subscribe();
  };
  const desuscribirse = async () => {
    if (canal.value) {
      await supabase.removeChannel(canal.value);
      canal.value = null;
    }
  };
  const solicitarPermisosNotificaciones = async () => {
    if ("Notification" in void 0 && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };
  return {
    // Estado
    notificaciones,
    totalNoVistas,
    loading,
    error,
    // Computadas
    noLeidas,
    urgentes,
    tieneUrgentes,
    // Métodos principales
    listar,
    crear,
    marcarVista,
    marcarComoLeida,
    // Alias
    marcarTodasVistas,
    marcarTodasComoLeidas,
    // Alias
    contarNoVistas,
    obtenerContador,
    // Alias
    eliminar,
    eliminarVistas,
    suscribirse,
    desuscribirse,
    solicitarPermisosNotificaciones
  };
};

export { useNotificaciones as u };
//# sourceMappingURL=useNotificaciones-BrQVNIqm.mjs.map
