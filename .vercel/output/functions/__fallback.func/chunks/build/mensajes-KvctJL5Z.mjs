import { defineComponent, ref, watch, mergeProps, unref, nextTick, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderComponent, ssrRenderStyle, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { e as useSupabaseUser } from './server.mjs';
import { u as useSupabase } from './useSupabase-DljD0dj8.mjs';
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

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "MensajeCard",
  __ssrInlineRender: true,
  props: {
    texto: {},
    fecha: {},
    remitente: { type: Boolean },
    visto: { type: Boolean, default: false }
  },
  setup(__props) {
    const formatearFecha = (fecha) => {
      const date = typeof fecha === "string" ? new Date(fecha) : fecha;
      const ahora = /* @__PURE__ */ new Date();
      const diferencia = ahora.getTime() - date.getTime();
      const minutos = Math.floor(diferencia / 6e4);
      const horas = Math.floor(diferencia / 36e5);
      const dias = Math.floor(diferencia / 864e5);
      if (minutos < 1) return "Ahora";
      if (minutos < 60) return `Hace ${minutos}m`;
      if (horas < 24) return `Hace ${horas}h`;
      if (dias < 7) return `Hace ${dias}d`;
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: date.getFullYear() !== ahora.getFullYear() ? "numeric" : void 0
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: [
          "p-4 rounded-lg max-w-[80%] transition-all duration-200",
          __props.remitente ? "bg-[#EAD5D3]/50 self-end text-right ml-auto" : "bg-white border border-[#EAD5D3]/40 self-start shadow-sm"
        ]
      }, _attrs))} data-v-0713e701><p class="text-[#5D4A44] font-[&#39;Lato&#39;] text-sm leading-relaxed whitespace-pre-wrap break-words" data-v-0713e701>${ssrInterpolate(__props.texto)}</p><div class="${ssrRenderClass([__props.remitente ? "justify-end" : "justify-start", "flex items-center gap-2 mt-2"])}" data-v-0713e701><p class="text-[10px] text-[#5D4A44]/50 font-[&#39;Lato&#39;]" data-v-0713e701>${ssrInterpolate(formatearFecha(__props.fecha))}</p>`);
      if (__props.remitente && !__props.visto) {
        _push(`<span class="inline-block w-2 h-2 bg-[#D8AFA0] rounded-full" title="Enviado" data-v-0713e701></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MensajeCard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-0713e701"]]), { __name: "MensajeCard" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "MensajeInput",
  __ssrInlineRender: true,
  props: {
    destinatarioId: {},
    placeholder: { default: "Escribe tu mensaje aqu\xED..." }
  },
  emits: ["mensajeEnviado"],
  setup(__props, { emit: __emit }) {
    const { enviarMensaje: enviarMensajeApi } = useMensajeria();
    const contenido = ref("");
    const enviando = ref(false);
    ref(null);
    const puedeEnviar = computed(() => {
      const textoLimpio = contenido.value.trim();
      return textoLimpio.length > 0 && textoLimpio.length <= 2e3 && !enviando.value;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-end gap-3 border-t border-[#EAD5D3]/30 pt-4 bg-[#F9F7F3]" }, _attrs))} data-v-624391a0><div class="flex-1 relative" data-v-624391a0><textarea${ssrRenderAttr("placeholder", __props.placeholder)} class="${ssrRenderClass([{ "opacity-50 cursor-not-allowed": enviando.value }, "w-full border border-[#EAD5D3]/40 rounded-lg p-3 bg-white resize-none text-sm text-[#5D4A44] font-['Lato'] focus:outline-none focus:ring-2 focus:ring-[#D8AFA0]/50 focus:border-[#D8AFA0] transition-all"])}"${ssrIncludeBooleanAttr(enviando.value) ? " disabled" : ""} rows="1" style="${ssrRenderStyle({ "min-height": "44px", "max-height": "120px" })}" data-v-624391a0>${ssrInterpolate(contenido.value)}</textarea>`);
      if (contenido.value.length > 0) {
        _push(`<div class="absolute bottom-2 right-2 text-[10px] text-[#5D4A44]/40 font-[&#39;Lato&#39;]" data-v-624391a0>${ssrInterpolate(contenido.value.length)}/2000 </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><button${ssrIncludeBooleanAttr(!puedeEnviar.value || enviando.value) ? " disabled" : ""} class="${ssrRenderClass([{ "animate-pulse": enviando.value }, "bg-[#D8AFA0] hover:bg-[#C89B8A] text-white px-5 py-3 rounded-lg transition-all duration-200 font-['Lato'] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"])}" data-v-624391a0>`);
      if (!enviando.value) {
        _push(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-624391a0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" data-v-624391a0></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      if (!enviando.value) {
        _push(`<span data-v-624391a0>Enviar</span>`);
      } else {
        _push(`<span data-v-624391a0>Enviando...</span>`);
      }
      _push(`</button></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MensajeInput.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-624391a0"]]), { __name: "MensajeInput" });
const useMensajes = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const mensajes2 = ref([]);
  const conversaciones = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const canal = ref(null);
  const listarConversacion = async (participanteId) => {
    if (!user.value) {
      error.value = "Usuario no autenticado";
      return [];
    }
    loading.value = true;
    error.value = null;
    try {
      const { data, error: fetchError } = await supabase.from("mensajes").select(`
          *,
          remitente:profiles!mensajes_remitente_id_fkey(id, nombre, avatar_url, rol),
          destinatario:profiles!mensajes_destinatario_id_fkey(id, nombre, avatar_url, rol)
        `).or(`and(remitente_id.eq.${user.value.id},destinatario_id.eq.${participanteId}),and(remitente_id.eq.${participanteId},destinatario_id.eq.${user.value.id})`).order("created_at", { ascending: true });
      if (fetchError) throw fetchError;
      mensajes2.value = data || [];
      return data || [];
    } catch (e) {
      error.value = e.message || "Error al cargar conversaci\xF3n";
      console.error("Error en listarConversacion:", e);
      return [];
    } finally {
      loading.value = false;
    }
  };
  const enviar = async (destinatarioId, contenido, sesionId) => {
    if (!user.value) {
      error.value = "Usuario no autenticado";
      return null;
    }
    if (!contenido.trim()) {
      error.value = "El mensaje no puede estar vac\xEDo";
      return null;
    }
    loading.value = true;
    error.value = null;
    try {
      const { data, error: insertError } = await supabase.from("mensajes").insert({
        remitente_id: user.value.id,
        destinatario_id: destinatarioId,
        mensaje: contenido.trim(),
        sesion_id: sesionId || null,
        visto: false
      }).select(`
          *,
          remitente:profiles!mensajes_remitente_id_fkey(id, nombre, avatar_url, rol),
          destinatario:profiles!mensajes_destinatario_id_fkey(id, nombre, avatar_url, rol)
        `).single();
      if (insertError) throw insertError;
      if (data) {
        mensajes2.value.push(data);
      }
      return data;
    } catch (e) {
      error.value = e.message || "Error al enviar mensaje";
      console.error("Error en enviar:", e);
      return null;
    } finally {
      loading.value = false;
    }
  };
  const marcarVistos = async (participanteId) => {
    if (!user.value) return;
    try {
      const { error: updateError } = await supabase.from("mensajes").update({ visto: true }).eq("destinatario_id", user.value.id).eq("remitente_id", participanteId).eq("visto", false);
      if (updateError) throw updateError;
      mensajes2.value = mensajes2.value.map((m) => {
        if (m.remitente_id === participanteId && m.destinatario_id === user.value.id) {
          return { ...m, visto: true };
        }
        return m;
      });
    } catch (e) {
      console.error("Error al marcar mensajes como vistos:", e);
    }
  };
  const listarConversaciones = async () => {
    if (!user.value) {
      error.value = "Usuario no autenticado";
      return [];
    }
    loading.value = true;
    error.value = null;
    try {
      const { data, error: fetchError } = await supabase.rpc("obtener_ultimas_conversaciones", {
        usuario_id: user.value.id
      });
      if (fetchError) throw fetchError;
      conversaciones.value = data || [];
      return data || [];
    } catch (e) {
      console.warn("Usando m\xE9todo alternativo para conversaciones:", e);
      return await listarConversacionesAlternativo();
    } finally {
      loading.value = false;
    }
  };
  const listarConversacionesAlternativo = async () => {
    if (!user.value) return [];
    try {
      const { data, error: fetchError } = await supabase.from("mensajes").select(`
          *,
          remitente:profiles!mensajes_remitente_id_fkey(id, nombre, avatar_url),
          destinatario:profiles!mensajes_destinatario_id_fkey(id, nombre, avatar_url)
        `).or(`remitente_id.eq.${user.value.id},destinatario_id.eq.${user.value.id}`).order("created_at", { ascending: false });
      if (fetchError) throw fetchError;
      const conversacionesMap = /* @__PURE__ */ new Map();
      data == null ? void 0 : data.forEach((m) => {
        const esRemitente = m.remitente_id === user.value.id;
        const otroUsuarioId = esRemitente ? m.destinatario_id : m.remitente_id;
        const otroUsuario = esRemitente ? m.destinatario : m.remitente;
        if (!conversacionesMap.has(otroUsuarioId)) {
          conversacionesMap.set(otroUsuarioId, {
            otro_usuario_id: otroUsuarioId,
            otro_usuario_nombre: (otroUsuario == null ? void 0 : otroUsuario.nombre) || "Usuario",
            otro_usuario_avatar: otroUsuario == null ? void 0 : otroUsuario.avatar_url,
            ultimo_mensaje: m.mensaje,
            ultimo_mensaje_fecha: m.created_at,
            mensajes_no_vistos: 0
          });
        }
        if (!esRemitente && !m.visto) {
          const conv = conversacionesMap.get(otroUsuarioId);
          conv.mensajes_no_vistos++;
        }
      });
      conversaciones.value = Array.from(conversacionesMap.values());
      return conversaciones.value;
    } catch (e) {
      error.value = e.message || "Error al cargar conversaciones";
      console.error("Error en listarConversacionesAlternativo:", e);
      return [];
    }
  };
  const contarNoVistos = async () => {
    if (!user.value) return 0;
    try {
      const { count, error: countError } = await supabase.from("mensajes").select("*", { count: "exact", head: true }).eq("destinatario_id", user.value.id).eq("visto", false);
      if (countError) throw countError;
      return count || 0;
    } catch (e) {
      console.error("Error al contar mensajes no vistos:", e);
      return 0;
    }
  };
  const suscribirseAConversacion = (participanteId) => {
    if (!user.value || canal.value) return;
    canal.value = supabase.channel(`mensajes:${user.value.id}:${participanteId}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "mensajes",
        filter: `destinatario_id=eq.${user.value.id}`
      },
      async (payload) => {
        const { data } = await supabase.from("mensajes").select(`
              *,
              remitente:profiles!mensajes_remitente_id_fkey(id, nombre, avatar_url, rol),
              destinatario:profiles!mensajes_destinatario_id_fkey(id, nombre, avatar_url, rol)
            `).eq("id", payload.new.id).single();
        if (data) {
          mensajes2.value.push(data);
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
  return {
    mensajes: mensajes2,
    conversaciones,
    loading,
    error,
    listarConversacion,
    enviar,
    marcarVistos,
    listarConversaciones,
    contarNoVistos,
    suscribirseAConversacion,
    desuscribirse
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "mensajes",
  __ssrInlineRender: true,
  setup(__props) {
    const { conversaciones, mensajes: mensajes2, loadingConversaciones, loadingMensajes, listarConversaciones } = useMensajes();
    useSupabaseUser();
    const { getUserId } = useSupabase();
    const pacienteSeleccionado = ref(null);
    const mensajesContainer = ref(null);
    const esMensajeMio = (mensaje) => {
      return mensaje.remitente_id === getUserId();
    };
    const scrollToBottom = () => {
      if (mensajesContainer.value) {
        mensajesContainer.value.scrollTop = mensajesContainer.value.scrollHeight;
      }
    };
    const handleMensajeEnviado = () => {
      nextTick(() => {
        scrollToBottom();
      });
    };
    const obtenerIniciales = (nombre) => {
      return nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
    };
    const formatearFecha = (fecha) => {
      const date = new Date(fecha);
      const ahora = /* @__PURE__ */ new Date();
      const diferencia = ahora.getTime() - date.getTime();
      const minutos = Math.floor(diferencia / 6e4);
      const horas = Math.floor(diferencia / 36e5);
      const dias = Math.floor(diferencia / 864e5);
      if (minutos < 1) return "Ahora";
      if (minutos < 60) return `${minutos}m`;
      if (horas < 24) return `${horas}h`;
      if (dias < 7) return `${dias}d`;
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short"
      });
    };
    watch(mensajes2, () => {
      if (mensajes2.value.length > 0) {
        listarConversaciones();
      }
    }, { deep: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_MensajeCard = __nuxt_component_0;
      const _component_MensajeInput = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex h-[calc(100vh-8rem)] max-w-7xl mx-auto px-4 py-8 gap-6" }, _attrs))} data-v-130b4f21><aside class="${ssrRenderClass([{ "hidden lg:block": unref(pacienteSeleccionado) }, "w-80 bg-white rounded-xl shadow-sm border border-[#EAD5D3]/30 overflow-hidden flex-shrink-0"])}" data-v-130b4f21><div class="px-4 py-5 border-b border-[#EAD5D3]/30 bg-[#F9F7F3]" data-v-130b4f21><h2 class="text-lg font-lora font-semibold text-[#5D4A44]" data-v-130b4f21> Conversaciones </h2><p class="text-xs text-[#5D4A44]/60 font-lato mt-1" data-v-130b4f21>${ssrInterpolate(unref(conversaciones).length)} pacientes </p></div><div class="overflow-y-auto h-[calc(100%-5rem)]" data-v-130b4f21>`);
      if (unref(loadingConversaciones)) {
        _push(`<div class="p-8 text-center" data-v-130b4f21><div class="inline-block w-8 h-8 border-4 border-[#EAD5D3] border-t-[#D8AFA0] rounded-full animate-spin" data-v-130b4f21></div></div>`);
      } else if (unref(conversaciones).length === 0) {
        _push(`<div class="p-8 text-center text-[#5D4A44]/60 font-lato text-sm" data-v-130b4f21><svg class="w-12 h-12 mx-auto mb-3 text-[#EAD5D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-130b4f21><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" data-v-130b4f21></path></svg><p data-v-130b4f21>No tienes conversaciones activas</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(conversaciones), (conv) => {
        var _a;
        _push(`<button class="${ssrRenderClass([{
          "bg-[#EAD5D3]/20 hover:bg-[#EAD5D3]/30": ((_a = unref(pacienteSeleccionado)) == null ? void 0 : _a.otro_usuario_id) === conv.otro_usuario_id
        }, "w-full px-4 py-4 hover:bg-[#F9F7F3] transition-colors border-b border-[#EAD5D3]/20 text-left group"])}" data-v-130b4f21><div class="flex items-start gap-3" data-v-130b4f21><div class="flex-shrink-0" data-v-130b4f21>`);
        if (conv.otro_usuario_avatar) {
          _push(`<div class="w-12 h-12 rounded-full overflow-hidden" data-v-130b4f21><img${ssrRenderAttr("src", conv.otro_usuario_avatar)}${ssrRenderAttr("alt", conv.otro_usuario_nombre)} class="w-full h-full object-cover" data-v-130b4f21></div>`);
        } else {
          _push(`<div class="w-12 h-12 rounded-full bg-[#D8AFA0]/30 flex items-center justify-center" data-v-130b4f21><span class="text-[#5D4A44] font-lora text-lg font-medium" data-v-130b4f21>${ssrInterpolate(obtenerIniciales(conv.otro_usuario_nombre))}</span></div>`);
        }
        _push(`</div><div class="flex-1 min-w-0" data-v-130b4f21><div class="flex items-start justify-between gap-2" data-v-130b4f21><h3 class="${ssrRenderClass([{ "font-semibold": conv.mensajes_no_vistos > 0 }, "text-sm font-medium text-[#5D4A44] font-lato truncate"])}" data-v-130b4f21>${ssrInterpolate(conv.otro_usuario_nombre)}</h3><span class="text-xs text-[#5D4A44]/50 font-lato flex-shrink-0" data-v-130b4f21>${ssrInterpolate(formatearFecha(conv.ultimo_mensaje_fecha))}</span></div><p class="${ssrRenderClass([{ "font-medium": conv.mensajes_no_vistos > 0 }, "text-xs text-[#5D4A44]/70 font-lato mt-1 truncate"])}" data-v-130b4f21>${ssrInterpolate(conv.ultimo_mensaje)}</p>`);
        if (conv.mensajes_no_vistos > 0) {
          _push(`<div class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#D8AFA0] rounded-full mt-2" data-v-130b4f21>${ssrInterpolate(conv.mensajes_no_vistos)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></button>`);
      });
      _push(`<!--]--></div></aside><main class="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-[#EAD5D3]/30 overflow-hidden" data-v-130b4f21>`);
      if (!unref(pacienteSeleccionado)) {
        _push(`<div class="flex-1 flex flex-col items-center justify-center p-8 text-center" data-v-130b4f21><div class="w-24 h-24 rounded-full bg-[#EAD5D3]/30 flex items-center justify-center mb-6" data-v-130b4f21><svg class="w-12 h-12 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-130b4f21><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" data-v-130b4f21></path></svg></div><h3 class="text-xl font-lora font-medium text-[#5D4A44] mb-2" data-v-130b4f21> Selecciona una conversaci\xF3n </h3><p class="text-sm text-[#5D4A44]/60 font-lato max-w-md" data-v-130b4f21> Elige un paciente de la lista para ver su conversaci\xF3n y responder sus mensajes. </p></div>`);
      } else {
        _push(`<div class="flex-1 flex flex-col" data-v-130b4f21><header class="px-6 py-4 border-b border-[#EAD5D3]/30 bg-[#F9F7F3] flex items-center gap-4" data-v-130b4f21><button class="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/50 transition-colors" data-v-130b4f21><svg class="w-5 h-5 text-[#5D4A44]" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-130b4f21><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" data-v-130b4f21></path></svg></button><div class="flex items-center gap-3 flex-1" data-v-130b4f21>`);
        if (unref(pacienteSeleccionado).otro_usuario_avatar) {
          _push(`<div class="w-10 h-10 rounded-full overflow-hidden" data-v-130b4f21><img${ssrRenderAttr("src", unref(pacienteSeleccionado).otro_usuario_avatar)}${ssrRenderAttr("alt", unref(pacienteSeleccionado).otro_usuario_nombre)} class="w-full h-full object-cover" data-v-130b4f21></div>`);
        } else {
          _push(`<div class="w-10 h-10 rounded-full bg-[#D8AFA0]/30 flex items-center justify-center" data-v-130b4f21><span class="text-[#5D4A44] font-lora text-sm font-medium" data-v-130b4f21>${ssrInterpolate(obtenerIniciales(unref(pacienteSeleccionado).otro_usuario_nombre))}</span></div>`);
        }
        _push(`<div data-v-130b4f21><h2 class="text-base font-lato font-semibold text-[#5D4A44]" data-v-130b4f21>${ssrInterpolate(unref(pacienteSeleccionado).otro_usuario_nombre)}</h2><p class="text-xs text-[#5D4A44]/60 font-lato" data-v-130b4f21> Paciente </p></div></div></header><div class="flex-1 overflow-y-auto p-6 space-y-3 bg-[#F9F7F3]/30" data-v-130b4f21>`);
        if (unref(loadingMensajes)) {
          _push(`<div class="flex items-center justify-center h-full" data-v-130b4f21><div class="inline-block w-8 h-8 border-4 border-[#EAD5D3] border-t-[#D8AFA0] rounded-full animate-spin" data-v-130b4f21></div></div>`);
        } else {
          _push(`<!--[-->`);
          ssrRenderList(unref(mensajes2), (mensaje) => {
            _push(ssrRenderComponent(_component_MensajeCard, {
              key: mensaje.id,
              texto: mensaje.mensaje,
              fecha: mensaje.created_at,
              remitente: esMensajeMio(mensaje),
              visto: mensaje.visto
            }, null, _parent));
          });
          _push(`<!--]-->`);
        }
        _push(`</div><div class="px-6 py-4 border-t border-[#EAD5D3]/30 bg-white" data-v-130b4f21>`);
        if (unref(pacienteSeleccionado)) {
          _push(ssrRenderComponent(_component_MensajeInput, {
            "destinatario-id": unref(pacienteSeleccionado).otro_usuario_id,
            placeholder: "Escribe tu respuesta con calma...",
            onMensajeEnviado: handleMensajeEnviado
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      }
      _push(`</main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/terapeuta/mensajes.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const mensajes = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-130b4f21"]]);

export { mensajes as default };
//# sourceMappingURL=mensajes-KvctJL5Z.mjs.map
