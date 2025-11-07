import { defineComponent, ref, computed, watch, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useCitas } from './useCitas-DyEZH6RI.mjs';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ModalEditarCita",
  __ssrInlineRender: true,
  props: {
    isOpen: { type: Boolean },
    citaId: {}
  },
  emits: ["close", "actualizado"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const supabase = useSupabaseClient();
    const { getCitasPorDia } = useCitas();
    const cita = ref(null);
    const cargando = ref(false);
    const guardando = ref(false);
    const conflictoHorario = ref(false);
    const formulario = ref({
      fecha_cita: "",
      hora_inicio: "",
      hora_fin: "",
      duracion: 60,
      modalidad: "presencial",
      estado: "pendiente",
      observaciones: ""
    });
    const fechaFormateada = computed(() => {
      if (!formulario.value.fecha_cita) return "";
      const fecha = /* @__PURE__ */ new Date(formulario.value.fecha_cita + "T00:00:00");
      return fecha.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    });
    const opcionesFechaRapida = computed(() => {
      const hoy = /* @__PURE__ */ new Date();
      const opciones = [];
      const formatearFecha = (fecha2) => {
        return fecha2.toISOString().split("T")[0];
      };
      opciones.push({
        label: "Hoy",
        fecha: formatearFecha(hoy)
      });
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);
      opciones.push({
        label: "Mañana",
        fecha: formatearFecha(manana)
      });
      const diasLaborables = ["Lun", "Mar", "Mié", "Jue", "Vie"];
      let fecha = new Date(hoy);
      let contadorDias = 0;
      while (contadorDias < 5) {
        fecha.setDate(fecha.getDate() + 1);
        const diaSemana = fecha.getDay();
        if (diaSemana >= 1 && diaSemana <= 5) {
          opciones.push({
            label: `${diasLaborables[diaSemana - 1]} ${fecha.getDate()}`,
            fecha: formatearFecha(fecha)
          });
          contadorDias++;
        }
      }
      return opciones;
    });
    const horasDisponibles = [
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
      "19:00",
      "19:30",
      "20:00",
      "20:30",
      "21:00",
      "21:30",
      "22:00"
    ];
    const cargarCita = async () => {
      console.log("🔍 [ModalEditarCita] Cargando cita con ID:", props.citaId);
      if (!props.citaId) {
        console.warn("⚠️ [ModalEditarCita] No hay citaId proporcionado");
        return;
      }
      try {
        cargando.value = true;
        const { data, error } = await supabase.from("citas").select(`
        *,
        paciente:pacientes!citas_paciente_id_fkey (
          id,
          nombre_completo,
          email,
          telefono
        )
      `).eq("id", props.citaId).single();
        if (error) {
          console.error("❌ [ModalEditarCita] Error en query:", error);
          throw error;
        }
        console.log("✅ [ModalEditarCita] Cita cargada:", data);
        if (data) {
          cita.value = data;
          formulario.value = {
            fecha_cita: data.fecha_cita,
            hora_inicio: data.hora_inicio?.substring(0, 5) || "",
            hora_fin: data.hora_fin?.substring(0, 5) || "",
            duracion: data.duracion || 60,
            modalidad: data.modalidad || "presencial",
            estado: data.estado || "pendiente",
            observaciones: data.observaciones || ""
          };
          console.log("📝 [ModalEditarCita] Formulario llenado:", formulario.value);
        }
      } catch (error) {
        console.error("💥 [ModalEditarCita] Error al cargar cita:", error);
      } finally {
        cargando.value = false;
      }
    };
    const verificarConflicto = async () => {
      if (!formulario.value.fecha_cita || !formulario.value.hora_inicio || !formulario.value.hora_fin) {
        conflictoHorario.value = false;
        return;
      }
      try {
        const citas = await getCitasPorDia(formulario.value.fecha_cita);
        const citasActivas = citas.filter(
          (c) => c.estado !== "cancelada" && c.id !== props.citaId
          // Excluir la cita que estamos editando
        );
        const inicioNueva = formulario.value.hora_inicio;
        const finNueva = formulario.value.hora_fin;
        conflictoHorario.value = citasActivas.some((c) => {
          const inicioExistente = c.hora_inicio?.substring(0, 5);
          const finExistente = c.hora_fin?.substring(0, 5);
          const minNuevaInicio = horaAMinutos(inicioNueva);
          const minNuevaFin = horaAMinutos(finNueva);
          const minExistenteInicio = horaAMinutos(inicioExistente);
          const minExistenteFin = horaAMinutos(finExistente);
          return minNuevaInicio >= minExistenteInicio && minNuevaInicio < minExistenteFin || minNuevaFin > minExistenteInicio && minNuevaFin <= minExistenteFin || minNuevaInicio <= minExistenteInicio && minNuevaFin >= minExistenteFin;
        });
      } catch (error) {
        console.error("Error al verificar conflicto:", error);
        conflictoHorario.value = false;
      }
    };
    const horaAMinutos = (hora) => {
      if (!hora || !hora.includes(":")) return 0;
      const [horas, minutos] = hora.split(":").map(Number);
      return (horas || 0) * 60 + (minutos || 0);
    };
    watch(() => formulario.value.hora_inicio, (nuevaHora) => {
      if (nuevaHora && formulario.value.duracion) {
        const [horas, minutos] = nuevaHora.split(":").map(Number);
        const totalMinutos = (horas || 0) * 60 + (minutos || 0) + formulario.value.duracion;
        const horaFin = Math.floor(totalMinutos / 60);
        const minutosFin = totalMinutos % 60;
        formulario.value.hora_fin = `${String(horaFin).padStart(2, "0")}:${String(minutosFin).padStart(2, "0")}`;
      }
    });
    watch(() => formulario.value.duracion, (nuevaDuracion) => {
      if (formulario.value.hora_inicio && nuevaDuracion) {
        const [horas, minutos] = formulario.value.hora_inicio.split(":").map(Number);
        const totalMinutos = (horas || 0) * 60 + (minutos || 0) + nuevaDuracion;
        const horaFin = Math.floor(totalMinutos / 60);
        const minutosFin = totalMinutos % 60;
        formulario.value.hora_fin = `${String(horaFin).padStart(2, "0")}:${String(minutosFin).padStart(2, "0")}`;
      }
    });
    watch([() => formulario.value.fecha_cita, () => formulario.value.hora_inicio, () => formulario.value.hora_fin], () => {
      verificarConflicto();
    });
    watch(() => props.isOpen, (isOpen) => {
      console.log("👁️ [ModalEditarCita] Modal abierto:", isOpen, "citaId:", props.citaId);
      if (isOpen && props.citaId) {
        cargarCita();
      }
    });
    watch(() => props.citaId, (nuevoCitaId) => {
      console.log("🔄 [ModalEditarCita] citaId cambió a:", nuevoCitaId);
      if (props.isOpen && nuevoCitaId) {
        cargarCita();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.isOpen) {
          _push2(`<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-v-90d0f873><div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" data-v-90d0f873><div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20" data-v-90d0f873><div data-v-90d0f873><h2 class="text-2xl font-bold text-gray-900 dark:text-white" data-v-90d0f873>✏️ Editar Cita</h2>`);
          if (cita.value) {
            _push2(`<p class="text-sm text-gray-600 dark:text-gray-400 mt-1" data-v-90d0f873>${ssrInterpolate(cita.value.paciente?.nombre_completo || cita.value.paciente_nombre)}</p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Cerrar" data-v-90d0f873><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-90d0f873><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-90d0f873></path></svg></button></div>`);
          if (cargando.value) {
            _push2(`<div class="p-12 flex flex-col items-center justify-center" data-v-90d0f873><div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" data-v-90d0f873></div><p class="text-gray-600 dark:text-gray-400" data-v-90d0f873>Cargando...</p></div>`);
          } else if (cita.value) {
            _push2(`<form class="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]" data-v-90d0f873><div class="space-y-6" data-v-90d0f873><div data-v-90d0f873><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" data-v-90d0f873> 📅 Fecha </label><div class="space-y-2" data-v-90d0f873><input${ssrRenderAttr("value", formulario.value.fecha_cita)} type="date" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white cursor-pointer" data-v-90d0f873><div class="flex gap-2 flex-wrap" data-v-90d0f873><!--[-->`);
            ssrRenderList(opcionesFechaRapida.value, (opcion, index) => {
              _push2(`<button type="button" class="${ssrRenderClass([
                "text-xs px-3 py-1.5 rounded-lg border transition-all",
                formulario.value.fecha_cita === opcion.fecha ? "bg-purple-600 text-white border-purple-600 font-semibold" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              ])}" data-v-90d0f873>${ssrInterpolate(opcion.label)}</button>`);
            });
            _push2(`<!--]--></div><p class="text-xs text-gray-500 dark:text-gray-400 capitalize" data-v-90d0f873>${ssrInterpolate(fechaFormateada.value)}</p></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4" data-v-90d0f873><div class="md:col-span-2" data-v-90d0f873><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" data-v-90d0f873> 🕐 Hora Inicio </label><div class="space-y-3" data-v-90d0f873><div class="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700" data-v-90d0f873><!--[-->`);
            ssrRenderList(horasDisponibles, (hora) => {
              _push2(`<button type="button" class="${ssrRenderClass([
                "px-3 py-2 text-sm font-medium rounded-lg transition-all border-2",
                formulario.value.hora_inicio === hora ? "bg-purple-600 text-white border-purple-600 shadow-md transform scale-105" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow"
              ])}" data-v-90d0f873>${ssrInterpolate(hora)}</button>`);
            });
            _push2(`<!--]--></div><details class="text-xs" data-v-90d0f873><summary class="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 select-none flex items-center gap-1" data-v-90d0f873><span data-v-90d0f873>⌨️</span><span data-v-90d0f873>Ingresar hora manualmente</span></summary><div class="mt-2" data-v-90d0f873><input${ssrRenderAttr("value", formulario.value.hora_inicio)} type="time" required step="1800" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white" data-v-90d0f873></div></details></div></div><div data-v-90d0f873><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" data-v-90d0f873> ⏱️ Duración (min) </label><select class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white" data-v-90d0f873><option${ssrRenderAttr("value", 30)} data-v-90d0f873${ssrIncludeBooleanAttr(Array.isArray(formulario.value.duracion) ? ssrLooseContain(formulario.value.duracion, 30) : ssrLooseEqual(formulario.value.duracion, 30)) ? " selected" : ""}>30 min</option><option${ssrRenderAttr("value", 45)} data-v-90d0f873${ssrIncludeBooleanAttr(Array.isArray(formulario.value.duracion) ? ssrLooseContain(formulario.value.duracion, 45) : ssrLooseEqual(formulario.value.duracion, 45)) ? " selected" : ""}>45 min</option><option${ssrRenderAttr("value", 60)} data-v-90d0f873${ssrIncludeBooleanAttr(Array.isArray(formulario.value.duracion) ? ssrLooseContain(formulario.value.duracion, 60) : ssrLooseEqual(formulario.value.duracion, 60)) ? " selected" : ""}>60 min</option><option${ssrRenderAttr("value", 90)} data-v-90d0f873${ssrIncludeBooleanAttr(Array.isArray(formulario.value.duracion) ? ssrLooseContain(formulario.value.duracion, 90) : ssrLooseEqual(formulario.value.duracion, 90)) ? " selected" : ""}>90 min</option></select></div><div data-v-90d0f873><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" data-v-90d0f873> 🕑 Hora Fin </label><input${ssrRenderAttr("value", formulario.value.hora_fin)} type="time" required readonly step="1800" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white" data-v-90d0f873></div></div>`);
            if (conflictoHorario.value) {
              _push2(`<div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg" data-v-90d0f873><div class="flex items-start gap-3" data-v-90d0f873><span class="text-2xl" data-v-90d0f873>⚠️</span><div data-v-90d0f873><div class="font-semibold text-yellow-800 dark:text-yellow-300 mb-1" data-v-90d0f873> Conflicto de Horario </div><div class="text-sm text-yellow-700 dark:text-yellow-400" data-v-90d0f873> Ya existe otra cita en este horario. Por favor, selecciona otro horario. </div></div></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div data-v-90d0f873><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" data-v-90d0f873> 💻 Modalidad </label><div class="grid grid-cols-3 gap-3" data-v-90d0f873><!--[-->`);
            ssrRenderList([
              { valor: "presencial", icono: "🏥", nombre: "Presencial" },
              { valor: "online", icono: "💻", nombre: "Online" },
              { valor: "telefonica", icono: "📞", nombre: "Teléfono" }
            ], (tipo) => {
              _push2(`<button type="button" class="${ssrRenderClass([
                "p-3 border-2 rounded-lg transition-all",
                formulario.value.modalidad === tipo.valor ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20" : "border-gray-300 dark:border-gray-700 hover:border-purple-400"
              ])}" data-v-90d0f873><div class="text-2xl mb-1" data-v-90d0f873>${ssrInterpolate(tipo.icono)}</div><div class="text-sm font-medium text-gray-900 dark:text-white" data-v-90d0f873>${ssrInterpolate(tipo.nombre)}</div></button>`);
            });
            _push2(`<!--]--></div></div><div data-v-90d0f873><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" data-v-90d0f873> 📊 Estado </label><div class="grid grid-cols-2 md:grid-cols-4 gap-3" data-v-90d0f873><!--[-->`);
            ssrRenderList([
              { valor: "pendiente", icono: "⏳", nombre: "Pendiente" },
              { valor: "confirmada", icono: "✅", nombre: "Confirmada" },
              { valor: "realizada", icono: "✓", nombre: "Realizada" },
              { valor: "cancelada", icono: "❌", nombre: "Cancelada" }
            ], (estado) => {
              _push2(`<button type="button" class="${ssrRenderClass([
                "p-2 border-2 rounded-lg transition-all",
                formulario.value.estado === estado.valor ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20" : "border-gray-300 dark:border-gray-700 hover:border-purple-400"
              ])}" data-v-90d0f873><div class="text-xl mb-1" data-v-90d0f873>${ssrInterpolate(estado.icono)}</div><div class="text-xs font-medium text-gray-900 dark:text-white" data-v-90d0f873>${ssrInterpolate(estado.nombre)}</div></button>`);
            });
            _push2(`<!--]--></div></div><div data-v-90d0f873><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" data-v-90d0f873> 📝 Observaciones </label><textarea rows="3" placeholder="Notas adicionales sobre la cita..." class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white" data-v-90d0f873>${ssrInterpolate(formulario.value.observaciones)}</textarea></div></div></form>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-3 bg-gray-50 dark:bg-gray-800" data-v-90d0f873><button type="button" class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium" data-v-90d0f873> Cancelar </button><button${ssrIncludeBooleanAttr(guardando.value || conflictoHorario.value) ? " disabled" : ""} class="${ssrRenderClass([
            "flex-1 px-4 py-2 rounded-lg font-medium transition-colors",
            guardando.value || conflictoHorario.value ? "bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 text-white"
          ])}" data-v-90d0f873>`);
          if (guardando.value) {
            _push2(`<span data-v-90d0f873>Guardando...</span>`);
          } else {
            _push2(`<span data-v-90d0f873>💾 Guardar Cambios</span>`);
          }
          _push2(`</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalEditarCita.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-90d0f873"]]), { __name: "ModalEditarCita" });

export { __nuxt_component_5 as _ };
//# sourceMappingURL=ModalEditarCita-Dnm8mnH7.mjs.map
