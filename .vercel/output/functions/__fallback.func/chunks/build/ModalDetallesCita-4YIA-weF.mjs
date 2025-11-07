import { defineComponent, ref, watch, computed, createVNode, resolveDynamicComponent, unref, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrRenderClass, ssrRenderVNode, ssrInterpolate, ssrRenderComponent, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { XCircleIcon, CheckCircleIcon, ExclamationCircleIcon, CalendarIcon, XMarkIcon, UserIcon, ClockIcon, VideoCameraIcon, MapPinIcon, TicketIcon, DocumentTextIcon, PencilSquareIcon } from '@heroicons/vue/24/outline';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ModalDetallesCita",
  __ssrInlineRender: true,
  props: {
    citaId: {}
  },
  emits: ["close", "cita-actualizada", "cita-eliminada"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const supabase = useSupabaseClient();
    const cita = ref(null);
    const paciente = ref(null);
    const bono = ref(null);
    const cargando = ref(false);
    const modoEdicion = ref(false);
    const formEdicion = ref({
      fecha_cita: "",
      hora_inicio: "",
      hora_fin: "",
      modalidad: "",
      observaciones: "",
      estado: ""
    });
    const cargarCita = async () => {
      console.log("🔍 cargarCita - citaId:", props.citaId);
      if (!props.citaId) {
        console.log("⚠️ No hay citaId, cancelando carga");
        return;
      }
      try {
        cargando.value = true;
        console.log("⏳ Cargando cita...");
        const { data: citaData, error: citaError } = await supabase.from("citas").select(`
        *,
        paciente:pacientes(
          id,
          nombre_completo,
          email,
          telefono,
          frecuencia
        )
      `).eq("id", props.citaId).single();
        console.log("📊 Resultado query cita:", { citaData, citaError });
        if (citaError) {
          console.error("❌ Error detallado:", JSON.stringify(citaError, null, 2));
          throw citaError;
        }
        cita.value = citaData;
        paciente.value = citaData.paciente;
        console.log("✅ Cita cargada:", cita.value);
        console.log("👤 Paciente:", paciente.value);
        if (citaData.bono_id) {
          console.log("🎟️ Cargando bono:", citaData.bono_id);
          const { data: bonoData, error: bonoError } = await supabase.from("bonos").select("*").eq("id", citaData.bono_id).single();
          console.log("📊 Resultado query bono:", { bonoData, bonoError });
          if (!bonoError) {
            bono.value = bonoData;
            console.log("✅ Bono cargado:", bono.value);
            const { data: citasAnteriores, error: citasError } = await supabase.from("citas").select("id, fecha_cita, hora_inicio").eq("bono_id", citaData.bono_id).eq("sesion_descontada", true).order("fecha_cita", { ascending: true }).order("hora_inicio", { ascending: true });
            if (!citasError && citasAnteriores) {
              const indice = citasAnteriores.findIndex((c) => c.id === props.citaId);
              if (indice !== -1) {
                bono.value.numero_sesion = indice + 1;
                console.log("📍 Número de sesión:", bono.value.numero_sesion);
              }
            }
          }
        }
        formEdicion.value = {
          fecha_cita: citaData.fecha_cita,
          hora_inicio: citaData.hora_inicio?.substring(0, 5) || "",
          hora_fin: citaData.hora_fin?.substring(0, 5) || "",
          modalidad: citaData.modalidad,
          observaciones: citaData.observaciones || "",
          estado: citaData.estado
        };
      } catch (error) {
        console.error("❌ Error al cargar cita:", error);
      } finally {
        cargando.value = false;
        console.log("🏁 Carga finalizada. Estado:", { cita: cita.value, paciente: paciente.value, bono: bono.value });
      }
    };
    watch(() => props.citaId, (newId, oldId) => {
      console.log("👀 Watch citaId cambió:", { oldId, newId });
      if (newId) {
        cargarCita();
      } else {
        console.log("🧹 Limpiando estado del modal");
        cita.value = null;
        paciente.value = null;
        bono.value = null;
      }
    }, { immediate: true });
    const fechaFormateada = computed(() => {
      if (!cita.value?.fecha_cita) return "";
      const fecha = /* @__PURE__ */ new Date(cita.value.fecha_cita + "T00:00:00");
      return fecha.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    });
    const claseEstado = computed(() => {
      const estado = cita.value?.estado;
      const clases = {
        pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
        confirmada: "bg-emerald-100 text-emerald-800 border-emerald-300",
        realizada: "bg-blue-100 text-blue-800 border-blue-300",
        cancelada: "bg-red-100 text-red-800 border-red-300"
      };
      return clases[estado] || "bg-gray-100 text-gray-800";
    });
    const colorHeader = computed(() => {
      const estado = cita.value?.estado;
      const colores = {
        pendiente: "from-yellow-500 to-amber-600",
        confirmada: "from-emerald-500 to-teal-600",
        realizada: "from-blue-500 to-indigo-600",
        cancelada: "from-red-500 to-rose-600"
      };
      return colores[estado] || "from-indigo-500 to-purple-600";
    });
    const iconoEstado = computed(() => {
      const estado = cita.value?.estado;
      const iconos = {
        pendiente: ExclamationCircleIcon,
        confirmada: CheckCircleIcon,
        realizada: CheckCircleIcon,
        cancelada: XCircleIcon
      };
      return iconos[estado] || CalendarIcon;
    });
    const estadoLabel = computed(() => {
      const labels = {
        pendiente: "Pendiente",
        confirmada: "Confirmada",
        realizada: "Realizada",
        cancelada: "Cancelada"
      };
      return labels[cita.value?.estado] || cita.value?.estado || "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.citaId) {
          _push2(`<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-v-66c26338><div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden" data-v-66c26338><div class="${ssrRenderClass([
            "sticky top-0 bg-gradient-to-r px-6 py-4 flex items-center justify-between transition-all duration-300",
            cita.value ? colorHeader.value : "from-indigo-500 to-purple-600"
          ])}" data-v-66c26338><div class="flex items-center gap-3" data-v-66c26338>`);
          ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(cita.value ? iconoEstado.value : unref(CalendarIcon)), { class: "w-7 h-7 text-white" }, null), _parent);
          _push2(`<div data-v-66c26338><h2 class="text-xl font-bold text-white" data-v-66c26338>${ssrInterpolate(modoEdicion.value ? "Editar Cita" : "Detalles de la Cita")}</h2><p class="text-xs text-white/80 mt-0.5" data-v-66c26338>${ssrInterpolate(modoEdicion.value ? "Modifica los datos de la sesión" : "Información completa de la sesión")}</p></div></div><button class="text-white/90 hover:text-white transition-colors" aria-label="Cerrar" data-v-66c26338>`);
          _push2(ssrRenderComponent(unref(XMarkIcon), { class: "w-6 h-6" }, null, _parent));
          _push2(`</button></div>`);
          if (cargando.value) {
            _push2(`<div class="p-12 flex flex-col items-center justify-center bg-gray-50" data-v-66c26338><div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" data-v-66c26338></div><p class="text-gray-600" data-v-66c26338>Cargando detalles...</p></div>`);
          } else if (cita.value) {
            _push2(`<div class="px-6 py-5 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4 bg-gray-50" data-v-66c26338>`);
            if (!modoEdicion.value) {
              _push2(`<!--[--><div class="bg-white rounded-xl p-5 shadow-sm border border-gray-200" data-v-66c26338><div class="flex items-start justify-between mb-4" data-v-66c26338><div class="flex items-center gap-3" data-v-66c26338><div class="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center" data-v-66c26338>`);
              _push2(ssrRenderComponent(unref(UserIcon), { class: "w-6 h-6 text-indigo-600" }, null, _parent));
              _push2(`</div><div data-v-66c26338><h3 class="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1" data-v-66c26338>Paciente</h3><p class="text-xl font-bold text-gray-900" data-v-66c26338>${ssrInterpolate(paciente.value?.nombre_completo || "Sin nombre")}</p></div></div><span class="${ssrRenderClass(["px-4 py-2 text-sm font-bold rounded-full shadow-md border-2", claseEstado.value])}" data-v-66c26338>${ssrInterpolate(estadoLabel.value.toUpperCase())}</span></div><div class="flex flex-wrap gap-3 text-sm text-gray-600" data-v-66c26338>`);
              if (paciente.value?.email) {
                _push2(`<div class="flex items-center gap-2" data-v-66c26338><svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-66c26338><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" data-v-66c26338></path></svg><span data-v-66c26338>${ssrInterpolate(paciente.value.email)}</span></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (paciente.value?.telefono) {
                _push2(`<div class="flex items-center gap-2" data-v-66c26338><svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-66c26338><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" data-v-66c26338></path></svg><span data-v-66c26338>${ssrInterpolate(paciente.value.telefono)}</span></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (paciente.value?.frecuencia) {
                _push2(`<div class="flex items-center gap-2 capitalize" data-v-66c26338>`);
                _push2(ssrRenderComponent(unref(ClockIcon), { class: "w-4 h-4 text-gray-400" }, null, _parent));
                _push2(`<span data-v-66c26338>${ssrInterpolate(paciente.value.frecuencia)}</span></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-3" data-v-66c26338><div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200" data-v-66c26338><div class="flex items-center gap-2 mb-2" data-v-66c26338>`);
              _push2(ssrRenderComponent(unref(CalendarIcon), { class: "w-5 h-5 text-blue-500" }, null, _parent));
              _push2(`<p class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-66c26338>Fecha</p></div><p class="font-bold text-gray-900 capitalize" data-v-66c26338>${ssrInterpolate(fechaFormateada.value)}</p></div><div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200" data-v-66c26338><div class="flex items-center gap-2 mb-2" data-v-66c26338>`);
              _push2(ssrRenderComponent(unref(ClockIcon), { class: "w-5 h-5 text-green-500" }, null, _parent));
              _push2(`<p class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-66c26338>Horario</p></div><p class="font-bold text-gray-900" data-v-66c26338>${ssrInterpolate(cita.value.hora_inicio?.substring(0, 5))} - ${ssrInterpolate(cita.value.hora_fin?.substring(0, 5))}</p></div><div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200" data-v-66c26338><div class="flex items-center gap-2 mb-2" data-v-66c26338>`);
              ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(cita.value.modalidad === "virtual" ? unref(VideoCameraIcon) : unref(MapPinIcon)), { class: "w-5 h-5 text-purple-500" }, null), _parent);
              _push2(`<p class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-66c26338>Modalidad</p></div><p class="font-bold text-gray-900 capitalize" data-v-66c26338>${ssrInterpolate(cita.value.modalidad || "No especificada")}</p></div><div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200" data-v-66c26338><div class="flex items-center gap-2 mb-2" data-v-66c26338>`);
              _push2(ssrRenderComponent(unref(ClockIcon), { class: "w-5 h-5 text-orange-500" }, null, _parent));
              _push2(`<p class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-66c26338>Duración</p></div><p class="font-bold text-gray-900" data-v-66c26338>${ssrInterpolate(cita.value.duracion_minutos || 60)} minutos</p></div></div>`);
              if (bono.value) {
                _push2(`<div class="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl p-5 shadow-sm border border-emerald-200" data-v-66c26338><div class="flex items-start justify-between mb-4" data-v-66c26338><div class="flex items-center gap-3" data-v-66c26338><div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center" data-v-66c26338>`);
                _push2(ssrRenderComponent(unref(TicketIcon), { class: "w-5 h-5 text-white" }, null, _parent));
                _push2(`</div><div data-v-66c26338><h3 class="font-bold text-emerald-900 text-lg" data-v-66c26338>Bono Activo</h3><p class="text-xs text-emerald-700" data-v-66c26338>Información del paquete de sesiones</p></div></div>`);
                if (bono.value.numero_sesion) {
                  _push2(`<div class="bg-white px-4 py-2 rounded-full border-2 border-emerald-400 shadow-sm" data-v-66c26338><span class="text-sm font-black text-emerald-700" data-v-66c26338>Sesión #${ssrInterpolate(bono.value.numero_sesion)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><div class="grid grid-cols-3 gap-4 mb-4" data-v-66c26338><div class="bg-white rounded-lg p-3 text-center" data-v-66c26338><p class="text-xs text-emerald-600 mb-1 font-medium" data-v-66c26338>Tipo</p><p class="font-bold text-emerald-900 capitalize text-lg" data-v-66c26338>${ssrInterpolate(bono.value.tipo || "Individual")}</p></div><div class="bg-white rounded-lg p-3 text-center" data-v-66c26338><p class="text-xs text-emerald-600 mb-1 font-medium" data-v-66c26338>Disponibles</p><p class="font-bold text-emerald-900 text-lg" data-v-66c26338>${ssrInterpolate(bono.value.sesiones_restantes)}</p></div><div class="bg-white rounded-lg p-3 text-center" data-v-66c26338><p class="text-xs text-emerald-600 mb-1 font-medium" data-v-66c26338>Total</p><p class="font-bold text-emerald-900 text-lg" data-v-66c26338>${ssrInterpolate(bono.value.sesiones_totales)}</p></div></div><div class="bg-white/70 backdrop-blur rounded-lg p-3" data-v-66c26338><div class="flex items-center justify-between text-xs text-emerald-700 mb-2" data-v-66c26338><span class="font-semibold" data-v-66c26338>Progreso del bono</span><span class="font-bold text-sm" data-v-66c26338>${ssrInterpolate(Math.round((bono.value.sesiones_totales - bono.value.sesiones_restantes) / bono.value.sesiones_totales * 100))}% </span></div><div class="h-3 bg-emerald-100 rounded-full overflow-hidden" data-v-66c26338><div class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full" style="${ssrRenderStyle({ width: `${(bono.value.sesiones_totales - bono.value.sesiones_restantes) / bono.value.sesiones_totales * 100}%` })}" data-v-66c26338></div></div></div></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (cita.value.observaciones) {
                _push2(`<div class="bg-amber-50 rounded-xl p-5 shadow-sm border border-amber-200" data-v-66c26338><div class="flex items-center gap-2 mb-3" data-v-66c26338>`);
                _push2(ssrRenderComponent(unref(DocumentTextIcon), { class: "w-5 h-5 text-amber-600" }, null, _parent));
                _push2(`<h3 class="font-bold text-amber-900" data-v-66c26338>Observaciones</h3></div><p class="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed" data-v-66c26338>${ssrInterpolate(cita.value.observaciones)}</p></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="text-xs text-gray-400 space-y-1 pt-3 border-t border-gray-200" data-v-66c26338><p class="font-mono" data-v-66c26338>ID: ${ssrInterpolate(cita.value.id)}</p><p data-v-66c26338>Creada: ${ssrInterpolate(new Date(cita.value.created_at).toLocaleString("es-ES", { dateStyle: "full", timeStyle: "short" }))}</p>`);
              if (cita.value.updated_at) {
                _push2(`<p data-v-66c26338>Última modificación: ${ssrInterpolate(new Date(cita.value.updated_at).toLocaleString("es-ES", { dateStyle: "full", timeStyle: "short" }))}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><!--]-->`);
            } else {
              _push2(`<form class="space-y-4" data-v-66c26338><div data-v-66c26338><label class="block text-sm font-semibold text-gray-700 mb-2" data-v-66c26338>Fecha de la cita</label><input${ssrRenderAttr("value", formEdicion.value.fecha_cita)} type="date" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all" data-v-66c26338></div><div class="grid grid-cols-2 gap-4" data-v-66c26338><div data-v-66c26338><label class="block text-sm font-semibold text-gray-700 mb-2" data-v-66c26338>Hora de inicio</label><input${ssrRenderAttr("value", formEdicion.value.hora_inicio)} type="time" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all" data-v-66c26338></div><div data-v-66c26338><label class="block text-sm font-semibold text-gray-700 mb-2" data-v-66c26338>Hora de fin</label><input${ssrRenderAttr("value", formEdicion.value.hora_fin)} type="time" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all" data-v-66c26338></div></div><div class="grid grid-cols-2 gap-4" data-v-66c26338><div data-v-66c26338><label class="block text-sm font-semibold text-gray-700 mb-2" data-v-66c26338>Modalidad</label><select required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all" data-v-66c26338><option value="presencial" data-v-66c26338${ssrIncludeBooleanAttr(Array.isArray(formEdicion.value.modalidad) ? ssrLooseContain(formEdicion.value.modalidad, "presencial") : ssrLooseEqual(formEdicion.value.modalidad, "presencial")) ? " selected" : ""}>Presencial</option><option value="virtual" data-v-66c26338${ssrIncludeBooleanAttr(Array.isArray(formEdicion.value.modalidad) ? ssrLooseContain(formEdicion.value.modalidad, "virtual") : ssrLooseEqual(formEdicion.value.modalidad, "virtual")) ? " selected" : ""}>Virtual</option><option value="telefonica" data-v-66c26338${ssrIncludeBooleanAttr(Array.isArray(formEdicion.value.modalidad) ? ssrLooseContain(formEdicion.value.modalidad, "telefonica") : ssrLooseEqual(formEdicion.value.modalidad, "telefonica")) ? " selected" : ""}>Telefónica</option></select></div><div data-v-66c26338><label class="block text-sm font-semibold text-gray-700 mb-2" data-v-66c26338>Estado</label><select required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all" data-v-66c26338><option value="pendiente" data-v-66c26338${ssrIncludeBooleanAttr(Array.isArray(formEdicion.value.estado) ? ssrLooseContain(formEdicion.value.estado, "pendiente") : ssrLooseEqual(formEdicion.value.estado, "pendiente")) ? " selected" : ""}>Pendiente</option><option value="confirmada" data-v-66c26338${ssrIncludeBooleanAttr(Array.isArray(formEdicion.value.estado) ? ssrLooseContain(formEdicion.value.estado, "confirmada") : ssrLooseEqual(formEdicion.value.estado, "confirmada")) ? " selected" : ""}>Confirmada</option><option value="realizada" data-v-66c26338${ssrIncludeBooleanAttr(Array.isArray(formEdicion.value.estado) ? ssrLooseContain(formEdicion.value.estado, "realizada") : ssrLooseEqual(formEdicion.value.estado, "realizada")) ? " selected" : ""}>Realizada</option><option value="cancelada" data-v-66c26338${ssrIncludeBooleanAttr(Array.isArray(formEdicion.value.estado) ? ssrLooseContain(formEdicion.value.estado, "cancelada") : ssrLooseEqual(formEdicion.value.estado, "cancelada")) ? " selected" : ""}>Cancelada</option></select></div></div><div data-v-66c26338><label class="block text-sm font-semibold text-gray-700 mb-2" data-v-66c26338>Observaciones</label><textarea rows="4" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white resize-none transition-all" placeholder="Notas adicionales sobre la cita..." data-v-66c26338>${ssrInterpolate(formEdicion.value.observaciones)}</textarea></div></form>`);
            }
            _push2(`</div>`);
          } else {
            _push2(`<div class="p-12 text-center bg-gray-50" data-v-66c26338><div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4" data-v-66c26338><svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-66c26338><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-v-66c26338></path></svg></div><p class="text-gray-600 font-medium" data-v-66c26338>No se encontraron datos de la cita</p><p class="text-gray-400 text-sm mt-1" data-v-66c26338>ID: ${ssrInterpolate(__props.citaId)}</p><div class="mt-4 text-xs text-left bg-white p-4 rounded border border-gray-200" data-v-66c26338><p class="font-mono" data-v-66c26338>DEBUG:</p><p class="font-mono" data-v-66c26338>cargando: ${ssrInterpolate(cargando.value)}</p><p class="font-mono" data-v-66c26338>cita: ${ssrInterpolate(cita.value ? "existe" : "null")}</p><p class="font-mono" data-v-66c26338>citaId prop: ${ssrInterpolate(__props.citaId)}</p></div></div>`);
          }
          _push2(`<div class="px-6 py-4 border-t border-gray-200 flex gap-3 bg-white" data-v-66c26338>`);
          if (!modoEdicion.value) {
            _push2(`<!--[--><button class="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm" data-v-66c26338> Cerrar </button><button class="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200" data-v-66c26338>`);
            _push2(ssrRenderComponent(unref(PencilSquareIcon), { class: "w-5 h-5" }, null, _parent));
            _push2(` Editar Cita </button><!--]-->`);
          } else {
            _push2(`<!--[--><button type="button" class="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm" data-v-66c26338> Cancelar </button><button type="button"${ssrIncludeBooleanAttr(cargando.value) ? " disabled" : ""} class="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200" data-v-66c26338>${ssrInterpolate(cargando.value ? "Guardando..." : "Guardar Cambios")}</button><!--]-->`);
          }
          _push2(`</div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalDetallesCita.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ModalDetallesCita = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-66c26338"]]), { __name: "ModalDetallesCita" });

export { ModalDetallesCita as M };
//# sourceMappingURL=ModalDetallesCita-4YIA-weF.mjs.map
