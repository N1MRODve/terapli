import { defineComponent, computed, ref, watch, nextTick, mergeProps, unref, createVNode, resolveDynamicComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderVNode } from 'vue/server-renderer';
import { u as useCitas } from './useCitas-DyEZH6RI.mjs';
import { CheckCircleIcon, CalendarIcon, TicketIcon, MagnifyingGlassIcon, InformationCircleIcon, UserIcon, ExclamationTriangleIcon, UserGroupIcon, ClockIcon, DocumentTextIcon, ComputerDesktopIcon, BuildingOfficeIcon, PhoneIcon, CheckBadgeIcon, XCircleIcon } from '@heroicons/vue/24/outline';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { a as useRouter } from './server.mjs';
import { u as useSupabase } from './useSupabase-DljD0dj8.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ModalNuevaCita",
  __ssrInlineRender: true,
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    // Mantener 'mostrar' por compatibilidad pero usar modelValue como primario
    mostrar: {
      type: Boolean,
      default: false
    },
    fechaPreseleccionada: {
      type: String,
      default: ""
    },
    horaPreseleccionada: {
      type: String,
      default: ""
    },
    titulo: {
      type: String,
      default: ""
    },
    // Nuevo: paciente preseleccionado
    pacientePreseleccionado: {
      type: Object,
      default: null
    },
    // ID de la cita en edición (para excluirla de verificación de conflictos)
    citaId: {
      type: String,
      default: null
    }
  },
  emits: ["cerrar", "citaCreada", "actualizado", "update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { getCitasPorDia, verificarBonoActivo, sugerirProximoHorario } = useCitas();
    const supabase = useSupabaseClient();
    useRouter();
    computed(() => !!props.citaId);
    ref(false);
    const busquedaPaciente = ref("");
    const mostrarListaPacientes = ref(false);
    const pacienteSeleccionado = ref(null);
    const guardando = ref(false);
    const conflictoHorario = ref(false);
    const cargandoPacientes = ref(false);
    const pacientesReales = ref([]);
    const horaSugerida = ref(null);
    const cargandoSugerencia = ref(false);
    const esCoordinadora = ref(false);
    const terapeutas = ref([]);
    const cargandoTerapeutas = ref(false);
    const terapeutaSeleccionado = ref(null);
    const mostrarToast = ref(false);
    const toastTitulo = ref("");
    const toastMensaje = ref("");
    const toastTipo = ref("exito");
    const toastAcciones = ref([]);
    const infoBono = ref({
      tiene_bono: false,
      sesiones_restantes: 0,
      sesiones_totales: 0,
      tipo_bono: "",
      bono_id: void 0
    });
    const formulario = ref({
      paciente_id: "",
      paciente_nombre: "",
      terapeuta_id: "",
      // Para coordinadora
      terapeuta_nombre: "",
      // Para coordinadora
      fecha: props.fechaPreseleccionada || formatearFecha(/* @__PURE__ */ new Date()),
      fecha_manual: "",
      // Nueva: para entrada manual de fecha
      hora_inicio: props.horaPreseleccionada || "",
      hora_fin: "",
      duracion: "60",
      tipo: "presencial",
      estado: "pendiente",
      notas: "",
      descontar_de_bono: false,
      bono_id: void 0
    });
    const fechaSugerida = ref(null);
    ref(false);
    const camposInvalidos = ref([]);
    const horasDisponibles = [
      // Mañana: 11:00 - 13:30 (antes del descanso)
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      // Descanso: 14:00 - 17:00 (no disponible)
      // Tarde/Noche: 17:00 - 22:00 (después del descanso)
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
    const tiposSesion = [
      {
        valor: "presencial",
        nombre: "Presencial",
        componente: BuildingOfficeIcon,
        descripcion: "Sesi\xF3n presencial en consultorio"
      },
      {
        valor: "online",
        nombre: "Online",
        componente: ComputerDesktopIcon,
        descripcion: "Videollamada por plataforma digital"
      },
      {
        valor: "telefonica",
        nombre: "Telef\xF3nica",
        componente: PhoneIcon,
        descripcion: "Llamada telef\xF3nica"
      }
    ];
    const estadosCita = [
      {
        valor: "confirmada",
        nombre: "Confirmada",
        componente: CheckBadgeIcon,
        claseActivo: "border-emerald-500 bg-emerald-50 text-emerald-700",
        claseInactivo: "border-gray-300 hover:border-emerald-400 bg-white"
      },
      {
        valor: "pendiente",
        nombre: "Pendiente",
        componente: ClockIcon,
        claseActivo: "border-amber-500 bg-amber-50 text-amber-700",
        claseInactivo: "border-gray-300 hover:border-amber-400 bg-white"
      },
      {
        valor: "cancelada",
        nombre: "Cancelada",
        componente: XCircleIcon,
        claseActivo: "border-red-500 bg-red-50 text-red-700",
        claseInactivo: "border-gray-300 hover:border-red-400 bg-white"
      },
      {
        valor: "completada",
        nombre: "Completada",
        componente: CheckCircleIcon,
        claseActivo: "border-blue-500 bg-blue-50 text-blue-700",
        claseInactivo: "border-gray-300 hover:border-blue-400 bg-white"
      }
    ];
    const fechaMinima = computed(() => {
      return formatearFecha(/* @__PURE__ */ new Date());
    });
    const opcionesFechaRapida = computed(() => {
      const hoy = /* @__PURE__ */ new Date();
      const opciones = [];
      opciones.push({
        label: "Hoy",
        fecha: formatearFecha(hoy)
      });
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);
      opciones.push({
        label: "Ma\xF1ana",
        fecha: formatearFecha(manana)
      });
      const diasLaborables = ["Lun", "Mar", "Mi\xE9", "Jue", "Vie"];
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
    const pacientesFiltrados = computed(() => {
      if (!busquedaPaciente.value) return [];
      const busqueda = busquedaPaciente.value.toLowerCase().trim();
      if (busqueda.length < 2) return [];
      return pacientesReales.value.filter(
        (p) => p.nombre.toLowerCase().includes(busqueda) || p.email.toLowerCase().includes(busqueda)
      );
    });
    const formularioValido = computed(() => {
      const validoPaciente = formulario.value.paciente_id;
      const validoTerapeuta = esCoordinadora.value ? formulario.value.terapeuta_id : true;
      return validoPaciente && validoTerapeuta && formulario.value.fecha && formulario.value.hora_inicio && formulario.value.hora_fin && formulario.value.tipo && formulario.value.estado;
    });
    async function cargarPacientes() {
      var _a, _b, _c;
      console.log("\u{1F4CB} Cargando pacientes...");
      cargandoPacientes.value = true;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error("\u274C No hay usuario autenticado");
          return;
        }
        console.log("\u{1F464} Usuario ID:", user.id);
        const { userProfile } = useSupabase();
        console.log("\u{1F3AD} Rol de usuario:", ((_a = userProfile.value) == null ? void 0 : _a.rol) || "desconocido");
        let query = supabase.from("pacientes").select(`
        id,
        nombre_completo,
        email,
        metadata
      `).eq("activo", true).order("created_at", { ascending: false });
        if (((_b = userProfile.value) == null ? void 0 : _b.rol) !== "coordinadora") {
          console.log("\u{1F468}\u200D\u2695\uFE0F Filtrando por terapeuta_id:", user.id);
          query = query.eq("terapeuta_id", user.id);
        } else {
          console.log("\u{1F31F} Coordinadora - cargando TODOS los pacientes");
        }
        const { data, error } = await query;
        if (error) {
          console.error("\u274C Error al cargar pacientes:", error);
          return;
        }
        pacientesReales.value = (data || []).map((p) => {
          var _a2, _b2;
          return {
            id: p.id,
            nombre: p.nombre_completo || "Sin nombre",
            email: p.email || "",
            frecuencia: ((_a2 = p.metadata) == null ? void 0 : _a2.frecuencia) || "No definida",
            area_acompanamiento: ((_b2 = p.metadata) == null ? void 0 : _b2.area_de_acompanamiento) || ""
          };
        });
        console.log(`\u2705 ${pacientesReales.value.length} pacientes cargados (rol: ${((_c = userProfile.value) == null ? void 0 : _c.rol) || "desconocido"})`);
        console.log("\u{1F4DD} Pacientes:", pacientesReales.value);
      } catch (error) {
        console.error("\u274C Error al cargar pacientes:", error);
      } finally {
        cargandoPacientes.value = false;
      }
    }
    async function seleccionarPaciente(paciente) {
      pacienteSeleccionado.value = paciente;
      formulario.value.paciente_id = paciente.id;
      formulario.value.paciente_nombre = paciente.nombre;
      busquedaPaciente.value = paciente.nombre;
      mostrarListaPacientes.value = false;
      const resultadoBono = await verificarBonoActivo(paciente.id);
      infoBono.value = resultadoBono;
      if (resultadoBono.tiene_bono && resultadoBono.sesiones_restantes > 0) {
        formulario.value.descontar_de_bono = true;
        formulario.value.bono_id = resultadoBono.bono_id;
      }
      if (paciente.frecuencia && !props.fechaPreseleccionada) {
        cargandoSugerencia.value = true;
        try {
          const sugerencia = await sugerirProximoHorario(paciente.id, paciente.frecuencia);
          if (sugerencia) {
            fechaSugerida.value = sugerencia.fecha;
            horaSugerida.value = sugerencia.hora;
            formulario.value.fecha = sugerencia.fecha;
            formulario.value.hora_inicio = sugerencia.hora;
            calcularHoraFin();
            console.log("\u{1F4A1} Horario sugerido:", sugerencia);
          }
        } catch (error) {
          console.error("Error al sugerir horario:", error);
        } finally {
          cargandoSugerencia.value = false;
        }
      }
      console.log("\u2705 Paciente seleccionado:", paciente.nombre);
    }
    function calcularHoraFin() {
      if (!formulario.value.hora_inicio || !formulario.value.duracion) return;
      const partes = formulario.value.hora_inicio.split(":").map(Number);
      const horas = partes[0] || 0;
      const minutos = partes[1] || 0;
      const duracionMinutos = parseInt(formulario.value.duracion);
      const fechaInicio = /* @__PURE__ */ new Date();
      fechaInicio.setHours(horas, minutos, 0, 0);
      const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 6e4);
      const horaFin = String(fechaFin.getHours()).padStart(2, "0");
      const minutosFin = String(fechaFin.getMinutes()).padStart(2, "0");
      formulario.value.hora_fin = `${horaFin}:${minutosFin}`;
    }
    async function verificarConflicto() {
      if (!formulario.value.fecha || !formulario.value.hora_inicio || !formulario.value.hora_fin) {
        conflictoHorario.value = false;
        return;
      }
      try {
        const citas = await getCitasPorDia(formulario.value.fecha);
        const citasActivas = citas.filter(
          (cita) => cita.estado !== "cancelada" && cita.estado !== "borrador" && cita.estado !== null && // Excluir la cita actual si existe citaId (estamos editando)
          cita.id !== props.citaId
        );
        const inicioNueva = formulario.value.hora_inicio;
        const finNueva = formulario.value.hora_fin;
        conflictoHorario.value = citasActivas.some((cita) => {
          const inicioExistente = cita.hora_inicio;
          const finExistente = cita.hora_fin;
          const minNuevaInicio = horaAMinutos(inicioNueva);
          const minNuevaFin = horaAMinutos(finNueva);
          const minExistenteInicio = horaAMinutos(inicioExistente);
          const minExistenteFin = horaAMinutos(finExistente);
          const haySolapamiento = minNuevaInicio >= minExistenteInicio && minNuevaInicio < minExistenteFin || // Inicia durante otra cita
          minNuevaFin > minExistenteInicio && minNuevaFin <= minExistenteFin || // Termina durante otra cita
          minNuevaInicio <= minExistenteInicio && minNuevaFin >= minExistenteFin || // Contiene otra cita
          minNuevaInicio === minExistenteInicio && minNuevaFin === minExistenteFin;
          if (haySolapamiento) {
            console.log("\u26A0\uFE0F Conflicto detectado:", {
              nueva: `${inicioNueva} - ${finNueva}`,
              existente: `${inicioExistente} - ${finExistente}`,
              estado: cita.estado,
              paciente: cita.paciente_nombre || "Desconocido"
            });
          }
          return haySolapamiento;
        });
        if (conflictoHorario.value) {
          console.warn("\u26A0\uFE0F Hay conflicto de horario");
        }
      } catch (error) {
        console.error("\u274C Error al verificar conflicto:", error);
        conflictoHorario.value = false;
      }
    }
    function horaAMinutos(hora) {
      if (!hora || !hora.includes(":")) return 0;
      const [horas, minutos] = hora.split(":").map(Number);
      return (horas || 0) * 60 + (minutos || 0);
    }
    function formatearFecha(fecha) {
      const resultado = fecha.toISOString().split("T")[0];
      return resultado || "";
    }
    function formatearFechaLegible(fecha) {
      const date = /* @__PURE__ */ new Date(fecha + "T00:00:00");
      const opciones = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      };
      return date.toLocaleDateString("es-MX", opciones);
    }
    async function cargarTerapeutas() {
      cargandoTerapeutas.value = true;
      try {
        const { data, error } = await supabase.from("terapeutas").select("id, nombre_completo, email, especialidad").eq("activo", true).order("nombre_completo", { ascending: true });
        if (error) {
          console.error("Error al cargar terapeutas:", error);
          return;
        }
        terapeutas.value = data || [];
        console.log(`\u2705 ${terapeutas.value.length} terapeutas cargados`);
      } catch (error) {
        console.error("Error al cargar terapeutas:", error);
      } finally {
        cargandoTerapeutas.value = false;
      }
    }
    async function verificarRolUsuario() {
      try {
        console.log("\u{1F50D} Verificando rol de usuario...");
        const { userProfile } = useSupabase();
        if (!userProfile.value) {
          console.warn("\u26A0\uFE0F No hay perfil cargado");
          esCoordinadora.value = false;
          return;
        }
        console.log("\u{1F464} Usuario:", userProfile.value.email);
        console.log("\u{1F3AD} Rol del perfil:", userProfile.value.rol);
        esCoordinadora.value = userProfile.value.rol === "coordinadora";
        console.log(`\u2705 \xBFEs coordinadora? ${esCoordinadora.value}`);
        if (esCoordinadora.value) {
          console.log("\u{1F31F} Usuario es coordinadora - cargando terapeutas");
          await cargarTerapeutas();
        }
      } catch (error) {
        console.error("\u274C Error al verificar rol:", error);
        esCoordinadora.value = false;
      }
    }
    watch([() => formulario.value.fecha, () => formulario.value.hora_inicio, () => formulario.value.hora_fin], () => {
      if (formulario.value.fecha && formulario.value.hora_inicio && formulario.value.hora_fin) {
        verificarConflicto();
      }
    });
    watch(() => props.fechaPreseleccionada, (nueva) => {
      if (nueva) {
        formulario.value.fecha = nueva;
      }
    });
    watch(() => props.horaPreseleccionada, (nueva) => {
      if (nueva) {
        formulario.value.hora_inicio = nueva;
        calcularHoraFin();
      }
    });
    watch(() => props.mostrar, (nuevo) => {
      if (nuevo) {
        console.log("\u{1F3AF} Modal abierto - verificando rol y cargando datos");
        verificarRolUsuario();
        cargarPacientes();
        if (props.pacientePreseleccionado) {
          nextTick(() => {
            seleccionarPaciente({
              id: props.pacientePreseleccionado.id,
              nombre: props.pacientePreseleccionado.nombre,
              email: props.pacientePreseleccionado.email,
              frecuencia: props.pacientePreseleccionado.frecuencia || "No definida",
              area_acompanamiento: props.pacientePreseleccionado.area_acompanamiento || ""
            });
          });
        }
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.modelValue || __props.mostrar) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" }, _attrs))} data-v-75e79c96><div class="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/30" data-v-75e79c96><div class="sticky top-0 bg-gradient-to-r from-[#5550F2]/5 via-[#027368]/5 to-[#04BF9D]/5 backdrop-blur-md border-b border-neutral-200 px-6 py-4 flex justify-between items-center shadow-sm" data-v-75e79c96><div data-v-75e79c96><h2 class="text-2xl font-[&#39;Elms_Sans&#39;] text-neutral-800 font-semibold" data-v-75e79c96>${ssrInterpolate(__props.titulo || "Nueva Cita")}</h2>`);
        if (__props.fechaPreseleccionada) {
          _push(`<p class="text-sm text-neutral-600 mt-1" data-v-75e79c96>${ssrInterpolate(formatearFechaLegible(__props.fechaPreseleccionada))} a las ${ssrInterpolate(__props.horaPreseleccionada)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><button class="text-neutral-600 hover:text-[#027368] transition-colors p-2 hover:bg-white/50 rounded-lg" aria-label="Cerrar modal" data-v-75e79c96><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-75e79c96><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-75e79c96></path></svg></button></div><form class="px-6 py-6 space-y-6 bg-gradient-to-b from-white/50 to-transparent" data-v-75e79c96>`);
        if (props.pacientePreseleccionado && unref(pacienteSeleccionado)) {
          _push(`<div class="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm" data-v-75e79c96><div class="flex items-center justify-between" data-v-75e79c96><div class="flex items-center gap-3" data-v-75e79c96><div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0" data-v-75e79c96>`);
          _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-7 h-7 text-white" }, null, _parent));
          _push(`</div><div data-v-75e79c96><div class="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1" data-v-75e79c96>Paciente Seleccionado</div><div class="font-bold text-emerald-900 text-lg" data-v-75e79c96>${ssrInterpolate(unref(pacienteSeleccionado).nombre)}</div><div class="text-sm text-emerald-700 flex items-center gap-1 mt-0.5" data-v-75e79c96><span data-v-75e79c96>${ssrInterpolate(unref(pacienteSeleccionado).email)}</span></div>`);
          if (unref(pacienteSeleccionado).frecuencia) {
            _push(`<div class="mt-2 flex items-center gap-2 text-xs" data-v-75e79c96>`);
            _push(ssrRenderComponent(unref(CalendarIcon), { class: "w-4 h-4 text-emerald-600" }, null, _parent));
            _push(`<span class="text-emerald-700" data-v-75e79c96>Frecuencia: <strong class="capitalize" data-v-75e79c96>${ssrInterpolate(unref(pacienteSeleccionado).frecuencia)}</strong></span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="text-right" data-v-75e79c96>`);
          if (unref(infoBono).tiene_bono) {
            _push(`<div class="flex items-center gap-1 text-xs text-emerald-700 font-semibold mb-1" data-v-75e79c96>`);
            _push(ssrRenderComponent(unref(TicketIcon), { class: "w-4 h-4" }, null, _parent));
            _push(`<span data-v-75e79c96>BONO ACTIVO</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(infoBono).tiene_bono) {
            _push(`<div class="text-2xl font-bold text-emerald-900" data-v-75e79c96>${ssrInterpolate(unref(infoBono).sesiones_restantes)}/${ssrInterpolate(unref(infoBono).sesiones_totales)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(infoBono).tiene_bono) {
            _push(`<div class="text-xs text-emerald-600" data-v-75e79c96>sesiones</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (!props.pacientePreseleccionado) {
          _push(`<div class="space-y-4" data-v-75e79c96><div class="flex items-center justify-between" data-v-75e79c96><h3 class="text-lg font-[&#39;Elms_Sans&#39;] text-neutral-800 font-semibold flex items-center gap-2" data-v-75e79c96>`);
          if (!unref(pacienteSeleccionado)) {
            _push(`<span class="w-7 h-7 rounded-full bg-gradient-to-r from-[#5550F2] to-[#027368] text-white flex items-center justify-center text-sm font-bold shadow-sm" data-v-75e79c96> 1 </span>`);
          } else {
            _push(`<span class="w-7 h-7 rounded-full bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white flex items-center justify-center shadow-sm" data-v-75e79c96>`);
            _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-5 h-5" }, null, _parent));
            _push(`</span>`);
          }
          _push(` Seleccionar Paciente </h3></div>`);
          if (!unref(pacienteSeleccionado)) {
            _push(`<div class="p-3 bg-blue-50 border-l-4 border-blue-400 rounded" data-v-75e79c96><p class="flex items-center gap-2 text-sm text-blue-800" data-v-75e79c96>`);
            _push(ssrRenderComponent(unref(MagnifyingGlassIcon), { class: "w-5 h-5 flex-shrink-0" }, null, _parent));
            _push(`<span data-v-75e79c96>Busca y selecciona un paciente ya registrado en el sistema</span></p><p class="text-xs text-blue-700 mt-1.5 ml-7" data-v-75e79c96> Para crear un paciente nuevo, ve a la secci\xF3n <strong data-v-75e79c96>Pacientes</strong> en el men\xFA principal </p></div>`);
          } else {
            _push(`<!---->`);
          }
          if (!unref(pacienteSeleccionado)) {
            _push(`<div class="space-y-3" data-v-75e79c96><div class="relative" data-v-75e79c96><input${ssrRenderAttr("value", unref(busquedaPaciente))} type="text" placeholder="Buscar paciente por nombre o email..." class="w-full px-4 py-2.5 pl-10 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#027368]/20 focus:border-[#027368] bg-white/90 backdrop-blur-sm transition-all shadow-sm" autocomplete="off" data-v-75e79c96><span class="absolute left-3 top-1/2 -translate-y-1/2" data-v-75e79c96>`);
            _push(ssrRenderComponent(unref(MagnifyingGlassIcon), { class: "w-5 h-5 text-neutral-400" }, null, _parent));
            _push(`</span>`);
            if (unref(cargandoPacientes)) {
              _push(`<span class="absolute right-3 top-1/2 -translate-y-1/2" data-v-75e79c96><svg class="animate-spin h-5 w-5 text-[#027368]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-75e79c96><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-75e79c96></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-75e79c96></path></svg></span>`);
            } else {
              _push(`<!---->`);
            }
            if (!unref(busquedaPaciente) && !unref(cargandoPacientes)) {
              _push(`<div class="mt-1 flex items-center gap-2 text-xs text-neutral-500" data-v-75e79c96>`);
              _push(ssrRenderComponent(unref(InformationCircleIcon), { class: "w-4 h-4 flex-shrink-0" }, null, _parent));
              _push(`<span data-v-75e79c96>Escribe al menos 2 caracteres para buscar</span></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
            if (unref(mostrarListaPacientes) && unref(busquedaPaciente) && unref(pacientesFiltrados).length > 0) {
              _push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-3" data-v-75e79c96><!--[-->`);
              ssrRenderList(unref(pacientesFiltrados), (paciente) => {
                _push(`<button type="button" class="p-4 text-left hover:bg-[#027368]/5 transition-all border-2 border-neutral-200 hover:border-[#027368] rounded-xl cursor-pointer group bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md" data-v-75e79c96><div class="flex items-center gap-3" data-v-75e79c96><div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#027368]/20 to-[#04BF9D]/20 group-hover:from-[#027368] group-hover:to-[#04BF9D] flex items-center justify-center transition-all" data-v-75e79c96>`);
                _push(ssrRenderComponent(unref(UserIcon), { class: "w-6 h-6 text-[#027368] group-hover:text-white transition-colors" }, null, _parent));
                _push(`</div><div class="flex-1" data-v-75e79c96><div class="font-medium text-neutral-800 group-hover:text-[#027368] transition-colors" data-v-75e79c96>${ssrInterpolate(paciente.nombre)}</div><div class="text-sm text-neutral-600" data-v-75e79c96>${ssrInterpolate(paciente.email)}</div>`);
                if (paciente.frecuencia) {
                  _push(`<div class="text-xs text-neutral-500 mt-1 flex items-center gap-1" data-v-75e79c96>`);
                  _push(ssrRenderComponent(unref(CalendarIcon), { class: "w-3 h-3" }, null, _parent));
                  _push(`<span class="font-medium capitalize" data-v-75e79c96>${ssrInterpolate(paciente.frecuencia)}</span></div>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`</div><div class="opacity-0 group-hover:opacity-100 transition-opacity" data-v-75e79c96><svg class="w-5 h-5 text-[#027368]" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-75e79c96><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-v-75e79c96></path></svg></div></div></button>`);
              });
              _push(`<!--]--></div>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(mostrarListaPacientes) && unref(busquedaPaciente) && unref(pacientesFiltrados).length === 0 && !unref(cargandoPacientes)) {
              _push(`<div class="border border-neutral-200 rounded-xl bg-white/90 backdrop-blur-sm p-6 text-center text-sm text-neutral-600 shadow-sm" data-v-75e79c96>`);
              _push(ssrRenderComponent(unref(MagnifyingGlassIcon), { class: "w-12 h-12 mx-auto mb-2 text-neutral-400" }, null, _parent));
              _push(`<p data-v-75e79c96>No se encontraron pacientes con &quot;<strong data-v-75e79c96>${ssrInterpolate(unref(busquedaPaciente))}</strong>&quot;</p></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(formulario).paciente_id && unref(pacienteSeleccionado) && !props.pacientePreseleccionado) {
            _push(`<div class="space-y-3" data-v-75e79c96><div class="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm" data-v-75e79c96><div class="flex items-start justify-between gap-3" data-v-75e79c96><div class="flex items-center gap-3 flex-1" data-v-75e79c96><div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0" data-v-75e79c96>`);
            _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-7 h-7 text-white" }, null, _parent));
            _push(`</div><div class="flex-1" data-v-75e79c96><div class="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1" data-v-75e79c96>Paciente Seleccionado</div><div class="font-bold text-emerald-900 text-lg" data-v-75e79c96>${ssrInterpolate(unref(pacienteSeleccionado).nombre)}</div><div class="text-sm text-emerald-700 flex items-center gap-1 mt-0.5" data-v-75e79c96><span data-v-75e79c96>${ssrInterpolate(unref(pacienteSeleccionado).email)}</span></div>`);
            if (unref(pacienteSeleccionado).frecuencia) {
              _push(`<div class="mt-2 flex items-center gap-2 text-sm" data-v-75e79c96>`);
              _push(ssrRenderComponent(unref(CalendarIcon), { class: "w-4 h-4 text-emerald-600" }, null, _parent));
              _push(`<span class="font-medium text-emerald-800" data-v-75e79c96>Frecuencia:</span><span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg font-medium capitalize" data-v-75e79c96>${ssrInterpolate(unref(pacienteSeleccionado).frecuencia)}</span></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div><button type="button" class="px-4 py-2 bg-white border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm hover:shadow flex-shrink-0" data-v-75e79c96><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-75e79c96><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" data-v-75e79c96></path></svg><span data-v-75e79c96>Cambiar</span></button></div></div>`);
            if (unref(infoBono).tiene_bono) {
              _push(`<div class="p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-xl shadow-md" data-v-75e79c96><div class="flex items-center justify-between mb-4" data-v-75e79c96><div class="flex items-center gap-3" data-v-75e79c96><div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center" data-v-75e79c96>`);
              _push(ssrRenderComponent(unref(TicketIcon), { class: "w-6 h-6 text-white" }, null, _parent));
              _push(`</div><div data-v-75e79c96><div class="text-sm font-bold text-blue-900 uppercase tracking-wide" data-v-75e79c96>Bono Activo</div><div class="text-xs text-blue-600" data-v-75e79c96>El paciente tiene sesiones disponibles</div></div></div><div class="text-right" data-v-75e79c96><div class="text-xs text-blue-600 mb-1" data-v-75e79c96>Sesiones Disponibles</div><div class="${ssrRenderClass([
                "text-3xl font-bold",
                unref(infoBono).sesiones_restantes <= 1 ? "text-red-600" : unref(infoBono).sesiones_restantes <= 2 ? "text-amber-600" : "text-blue-700"
              ])}" data-v-75e79c96>${ssrInterpolate(unref(infoBono).sesiones_restantes)}</div></div></div><div class="grid grid-cols-3 gap-3 mb-4" data-v-75e79c96><div class="bg-white p-3 rounded-lg border border-blue-200" data-v-75e79c96><div class="text-xs text-blue-600 mb-1 font-medium" data-v-75e79c96>Tipo de Bono</div><div class="font-bold text-blue-900 capitalize text-sm" data-v-75e79c96>${ssrInterpolate(unref(infoBono).tipo_bono || "N/A")}</div></div><div class="bg-white p-3 rounded-lg border border-blue-200" data-v-75e79c96><div class="text-xs text-blue-600 mb-1 font-medium" data-v-75e79c96>Total Sesiones</div><div class="font-bold text-blue-900 text-sm" data-v-75e79c96>${ssrInterpolate(unref(infoBono).sesiones_totales || "?")}</div></div><div class="bg-white p-3 rounded-lg border border-blue-200" data-v-75e79c96><div class="text-xs text-blue-600 mb-1 font-medium" data-v-75e79c96>Utilizadas</div><div class="font-bold text-blue-900 text-sm" data-v-75e79c96>${ssrInterpolate((unref(infoBono).sesiones_totales || 0) - (unref(infoBono).sesiones_restantes || 0))}</div></div></div><div class="mb-4" data-v-75e79c96><div class="flex justify-between text-xs text-blue-700 mb-1" data-v-75e79c96><span data-v-75e79c96>Progreso del bono</span><span class="font-semibold" data-v-75e79c96>${ssrInterpolate(Math.round((unref(infoBono).sesiones_totales - unref(infoBono).sesiones_restantes) / unref(infoBono).sesiones_totales * 100))}%</span></div><div class="w-full bg-blue-200 rounded-full h-3 overflow-hidden" data-v-75e79c96><div class="${ssrRenderClass([[
                unref(infoBono).sesiones_restantes <= 1 ? "bg-red-500" : unref(infoBono).sesiones_restantes <= 2 ? "bg-amber-500" : "bg-blue-500"
              ], "h-full rounded-full transition-all duration-500"])}" style="${ssrRenderStyle({ width: `${(unref(infoBono).sesiones_totales - unref(infoBono).sesiones_restantes) / unref(infoBono).sesiones_totales * 100}%` })}" data-v-75e79c96></div></div></div>`);
              if (unref(infoBono).sesiones_restantes <= 2) {
                _push(`<div class="mb-4 flex items-start gap-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-lg" data-v-75e79c96>`);
                _push(ssrRenderComponent(unref(ExclamationTriangleIcon), { class: "w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" }, null, _parent));
                _push(`<div class="text-sm" data-v-75e79c96><div class="font-semibold text-amber-900 mb-1" data-v-75e79c96>${ssrInterpolate(unref(infoBono).sesiones_restantes === 1 ? "\xA1\xDAltima sesi\xF3n del bono!" : "\xA1Pocas sesiones restantes!")}</div><div class="text-amber-800" data-v-75e79c96>${ssrInterpolate(unref(infoBono).sesiones_restantes === 1 ? "Esta es la \xFAltima sesi\xF3n disponible. Considere informar al paciente para renovar su bono." : `Solo quedan ${unref(infoBono).sesiones_restantes} sesiones. Considere informar al paciente para renovar su bono pronto.`)}</div></div></div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<div class="flex items-start gap-3 p-3 bg-white border-2 border-blue-300 rounded-lg" data-v-75e79c96><input id="descontar-bono"${ssrIncludeBooleanAttr(Array.isArray(unref(formulario).descontar_de_bono) ? ssrLooseContain(unref(formulario).descontar_de_bono, null) : unref(formulario).descontar_de_bono) ? " checked" : ""} type="checkbox" class="mt-1 w-5 h-5 text-blue-600 border-blue-300 rounded focus:ring-blue-500 focus:ring-2" data-v-75e79c96><label for="descontar-bono" class="flex-1 cursor-pointer" data-v-75e79c96><div class="text-sm text-blue-900 font-semibold mb-1" data-v-75e79c96> Descontar sesi\xF3n de este bono </div><div class="text-xs text-blue-700" data-v-75e79c96> Al completar esta cita, se descontar\xE1 autom\xE1ticamente 1 sesi\xF3n del bono activo. Quedar\xE1n <strong data-v-75e79c96>${ssrInterpolate(unref(infoBono).sesiones_restantes - 1)}</strong> sesiones disponibles. </div></label></div></div>`);
            } else {
              _push(`<div class="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg shadow-sm" data-v-75e79c96><div class="flex items-start gap-3" data-v-75e79c96>`);
              _push(ssrRenderComponent(unref(InformationCircleIcon), { class: "w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" }, null, _parent));
              _push(`<div data-v-75e79c96><div class="font-semibold text-amber-900 mb-1" data-v-75e79c96>Sin bono activo</div><div class="text-sm text-amber-800" data-v-75e79c96> Este paciente no tiene bonos activos actualmente. Esta sesi\xF3n se cobrar\xE1 de forma individual. </div></div></div></div>`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(esCoordinadora)) {
          _push(`<div class="space-y-4 pt-4 border-t-2 border-[#D8AFA0]/30" data-v-75e79c96><div class="flex items-center justify-between" data-v-75e79c96><h3 class="text-lg font-[&#39;Lora&#39;] text-[#5D4A44] font-semibold flex items-center gap-2" data-v-75e79c96>`);
          if (!unref(terapeutaSeleccionado)) {
            _push(`<span class="w-7 h-7 rounded-full bg-[#D8AFA0] text-white flex items-center justify-center text-sm font-bold" data-v-75e79c96>${ssrInterpolate(props.pacientePreseleccionado ? "2" : "2")}</span>`);
          } else {
            _push(`<span class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center" data-v-75e79c96>`);
            _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-5 h-5" }, null, _parent));
            _push(`</span>`);
          }
          _push(` Asignar Terapeuta </h3></div>`);
          if (!unref(terapeutaSeleccionado)) {
            _push(`<div class="p-3 bg-purple-50 border-l-4 border-purple-400 rounded" data-v-75e79c96><p class="flex items-center gap-2 text-sm text-purple-800" data-v-75e79c96>`);
            _push(ssrRenderComponent(unref(UserGroupIcon), { class: "w-5 h-5 flex-shrink-0" }, null, _parent));
            _push(`<span data-v-75e79c96>Selecciona el terapeuta que atender\xE1 esta cita</span></p></div>`);
          } else {
            _push(`<!---->`);
          }
          if (!unref(terapeutaSeleccionado)) {
            _push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-3" data-v-75e79c96><!--[-->`);
            ssrRenderList(unref(terapeutas), (terapeuta) => {
              _push(`<button type="button" class="p-4 text-left hover:bg-[#D8AFA0]/10 transition-all border-2 border-[#D8AFA0]/30 hover:border-[#D8AFA0] rounded-lg cursor-pointer group bg-white" data-v-75e79c96><div class="flex items-center gap-3" data-v-75e79c96><div class="w-12 h-12 rounded-full bg-[#D8AFA0]/20 group-hover:bg-[#D8AFA0] flex items-center justify-center transition-colors" data-v-75e79c96>`);
              _push(ssrRenderComponent(unref(UserIcon), { class: "w-6 h-6 text-[#5D4A44] group-hover:text-white transition-colors" }, null, _parent));
              _push(`</div><div class="flex-1" data-v-75e79c96><div class="font-medium text-[#5D4A44] group-hover:text-[#D8AFA0] transition-colors" data-v-75e79c96>${ssrInterpolate(terapeuta.nombre_completo)}</div>`);
              if (terapeuta.especialidad) {
                _push(`<div class="text-sm text-[#5D4A44]/60" data-v-75e79c96>${ssrInterpolate(terapeuta.especialidad)}</div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<div class="text-xs text-[#5D4A44]/50" data-v-75e79c96>${ssrInterpolate(terapeuta.email)}</div></div><div class="opacity-0 group-hover:opacity-100 transition-opacity" data-v-75e79c96><svg class="w-5 h-5 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-75e79c96><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-v-75e79c96></path></svg></div></div></button>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(terapeutaSeleccionado)) {
            _push(`<div class="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm" data-v-75e79c96><div class="flex items-start justify-between gap-3" data-v-75e79c96><div class="flex items-center gap-3 flex-1" data-v-75e79c96><div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0" data-v-75e79c96>`);
            _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-7 h-7 text-white" }, null, _parent));
            _push(`</div><div class="flex-1" data-v-75e79c96><div class="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1" data-v-75e79c96>Terapeuta Asignado</div><div class="font-bold text-emerald-900 text-lg" data-v-75e79c96>${ssrInterpolate(unref(terapeutaSeleccionado).nombre_completo)}</div>`);
            if (unref(terapeutaSeleccionado).especialidad) {
              _push(`<div class="text-sm text-emerald-700 mt-0.5" data-v-75e79c96>${ssrInterpolate(unref(terapeutaSeleccionado).especialidad)}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div><button type="button" class="px-4 py-2 bg-white border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm hover:shadow flex-shrink-0" data-v-75e79c96><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-75e79c96><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" data-v-75e79c96></path></svg><span data-v-75e79c96>Cambiar</span></button></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="space-y-6 pt-4 border-t-2 border-[#D8AFA0]/30" data-v-75e79c96><h3 class="text-lg font-[&#39;Lora&#39;] text-[#5D4A44] font-semibold flex items-center gap-2" data-v-75e79c96>`);
        if (!unref(formularioValido)) {
          _push(`<span class="w-7 h-7 rounded-full bg-[#D8AFA0] text-white flex items-center justify-center text-sm font-bold" data-v-75e79c96>${ssrInterpolate(unref(esCoordinadora) ? "3" : props.pacientePreseleccionado ? "1" : "2")}</span>`);
        } else {
          _push(`<span class="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center" data-v-75e79c96> \u2713 </span>`);
        }
        _push(` Detalles de la Cita </h3><div class="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm space-y-4" data-v-75e79c96><h4 class="text-sm font-bold text-blue-900 flex items-center gap-2" data-v-75e79c96>`);
        _push(ssrRenderComponent(unref(CalendarIcon), { class: "w-5 h-5 text-blue-600" }, null, _parent));
        _push(`<span data-v-75e79c96>Detalles de Programaci\xF3n</span></h4><div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-v-75e79c96><div data-v-75e79c96><label class="block text-sm font-medium text-[#5D4A44] mb-2 flex items-center gap-2" data-v-75e79c96>`);
        _push(ssrRenderComponent(unref(CalendarIcon), { class: "w-4 h-4" }, null, _parent));
        _push(`<span data-v-75e79c96>Fecha</span><span class="text-red-500" data-v-75e79c96>*</span></label><div class="space-y-2" data-v-75e79c96><input${ssrRenderAttr("value", unref(formulario).fecha)} type="date" required${ssrRenderAttr("min", unref(fechaMinima))} class="${ssrRenderClass([
          "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white text-base cursor-pointer",
          unref(camposInvalidos).includes("fecha") ? "border-red-500 border-2" : "border-[#D8AFA0]/30"
        ])}" style="${ssrRenderStyle({ "min-height": "44px" })}" placeholder="dd/mm/aaaa" data-v-75e79c96><div class="flex gap-2 flex-wrap" data-v-75e79c96><!--[-->`);
        ssrRenderList(unref(opcionesFechaRapida), (opcion, index) => {
          _push(`<button type="button" class="${ssrRenderClass([
            "text-xs px-3 py-1.5 rounded-lg border transition-all",
            unref(formulario).fecha === opcion.fecha ? "bg-[#D8AFA0] text-white border-[#D8AFA0] font-semibold" : "bg-white text-[#5D4A44] border-[#D8AFA0]/30 hover:border-[#D8AFA0] hover:bg-[#D8AFA0]/10"
          ])}" data-v-75e79c96>${ssrInterpolate(opcion.label)}</button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(fechaSugerida) && unref(fechaSugerida) !== unref(formulario).fecha) {
          _push(`<div class="flex items-center gap-2" data-v-75e79c96><button type="button" class="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors" data-v-75e79c96> \u{1F4A1} Usar fecha sugerida: ${ssrInterpolate(formatearFechaLegible(unref(fechaSugerida)))}</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div data-v-75e79c96><label class="block text-sm font-medium text-[#5D4A44] mb-2 flex items-center gap-2" data-v-75e79c96>`);
        _push(ssrRenderComponent(unref(ClockIcon), { class: "w-4 h-4" }, null, _parent));
        _push(`<span data-v-75e79c96>Hora de Inicio</span><span class="text-red-500" data-v-75e79c96>*</span></label><div class="space-y-3" data-v-75e79c96><div class="grid grid-cols-4 gap-3 max-h-72 overflow-y-auto p-4 bg-white rounded-lg border border-[#D8AFA0]/20 shadow-inner" data-v-75e79c96><!--[-->`);
        ssrRenderList(horasDisponibles, (hora) => {
          _push(`<button type="button" class="${ssrRenderClass([
            "px-4 py-3 text-sm font-semibold rounded-lg transition-all border-2 flex items-center justify-center min-w-[70px]",
            unref(formulario).hora_inicio === hora ? "bg-[#D8AFA0] text-white border-[#D8AFA0] shadow-lg transform scale-105 ring-2 ring-[#D8AFA0]/30" : "bg-white text-[#5D4A44] border-gray-300 hover:border-[#D8AFA0] hover:bg-[#D8AFA0]/10 hover:shadow-md hover:scale-102"
          ])}" data-v-75e79c96>${ssrInterpolate(hora)}</button>`);
        });
        _push(`<!--]--></div><details class="text-xs" data-v-75e79c96><summary class="cursor-pointer text-[#5D4A44]/60 hover:text-[#5D4A44] select-none flex items-center gap-2" data-v-75e79c96>`);
        _push(ssrRenderComponent(unref(DocumentTextIcon), { class: "w-4 h-4" }, null, _parent));
        _push(`<span data-v-75e79c96>Ingresar hora manualmente</span></summary><div class="mt-2" data-v-75e79c96><input${ssrRenderAttr("value", unref(formulario).hora_inicio)} type="time" step="1800" class="${ssrRenderClass([
          "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white",
          unref(camposInvalidos).includes("hora_inicio") ? "border-red-500 border-2" : "border-[#D8AFA0]/30"
        ])}" data-v-75e79c96></div></details><datalist id="horas-sugeridas" data-v-75e79c96><!--[-->`);
        ssrRenderList(horasDisponibles, (hora) => {
          _push(`<option${ssrRenderAttr("value", hora)} data-v-75e79c96>${ssrInterpolate(hora)}</option>`);
        });
        _push(`<!--]--></datalist>`);
        if (unref(horaSugerida) && unref(horaSugerida) !== unref(formulario).hora_inicio && unref(cargandoSugerencia) === false) {
          _push(`<div class="flex items-center gap-2" data-v-75e79c96><button type="button" class="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors font-medium" data-v-75e79c96>`);
          _push(ssrRenderComponent(unref(InformationCircleIcon), { class: "w-4 h-4" }, null, _parent));
          _push(`<span data-v-75e79c96>Usar hora sugerida: ${ssrInterpolate(unref(horaSugerida))}</span></button></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(cargandoSugerencia)) {
          _push(`<div class="text-xs text-[#5D4A44]/50 flex items-center gap-2" data-v-75e79c96><svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-75e79c96><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-75e79c96></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-75e79c96></path></svg> Buscando horario disponible... </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div data-v-75e79c96><label class="block text-sm font-medium text-[#5D4A44] mb-1" data-v-75e79c96> Duraci\xF3n <span class="text-red-500" data-v-75e79c96>*</span></label><select required class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white" data-v-75e79c96><option value="30" data-v-75e79c96${ssrIncludeBooleanAttr(Array.isArray(unref(formulario).duracion) ? ssrLooseContain(unref(formulario).duracion, "30") : ssrLooseEqual(unref(formulario).duracion, "30")) ? " selected" : ""}>30 minutos</option><option value="60" selected data-v-75e79c96>60 minutos (1 hora)</option><option value="90" data-v-75e79c96${ssrIncludeBooleanAttr(Array.isArray(unref(formulario).duracion) ? ssrLooseContain(unref(formulario).duracion, "90") : ssrLooseEqual(unref(formulario).duracion, "90")) ? " selected" : ""}>90 minutos (1.5 horas)</option><option value="120" data-v-75e79c96${ssrIncludeBooleanAttr(Array.isArray(unref(formulario).duracion) ? ssrLooseContain(unref(formulario).duracion, "120") : ssrLooseEqual(unref(formulario).duracion, "120")) ? " selected" : ""}>120 minutos (2 horas)</option></select></div><div data-v-75e79c96><label class="block text-sm font-medium text-[#5D4A44] mb-1" data-v-75e79c96> Hora de Fin </label><input${ssrRenderAttr("value", unref(formulario).hora_fin)} type="text" readonly class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg bg-gray-100 text-[#5D4A44]/60" placeholder="Se calcular\xE1 autom\xE1ticamente" data-v-75e79c96></div></div></div><div class="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl shadow-sm space-y-4" data-v-75e79c96><h4 class="text-sm font-bold text-purple-900 flex items-center gap-2" data-v-75e79c96>`);
        _push(ssrRenderComponent(unref(ComputerDesktopIcon), { class: "w-5 h-5 text-purple-600" }, null, _parent));
        _push(`<span data-v-75e79c96>Tipo de Sesi\xF3n y Estado</span></h4><div data-v-75e79c96><label class="block text-sm font-medium text-[#5D4A44] mb-2 flex items-center gap-2" data-v-75e79c96>`);
        _push(ssrRenderComponent(unref(ComputerDesktopIcon), { class: "w-5 h-5" }, null, _parent));
        _push(`<span data-v-75e79c96>Tipo de Sesi\xF3n</span><span class="text-red-500" data-v-75e79c96>*</span></label><div class="${ssrRenderClass([
          "grid grid-cols-3 gap-3",
          unref(camposInvalidos).includes("tipo") ? "p-3 border-2 border-red-500 bg-red-50 rounded-lg" : ""
        ])}" data-v-75e79c96><!--[-->`);
        ssrRenderList(tiposSesion, (tipo) => {
          _push(`<button type="button" class="${ssrRenderClass([
            "p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-2 group",
            unref(formulario).tipo === tipo.valor ? "border-[#D8AFA0] bg-[#D8AFA0]/20 shadow-md" : "border-[#D8AFA0]/30 hover:border-[#D8AFA0] hover:bg-[#D8AFA0]/5 bg-white"
          ])}" data-v-75e79c96>`);
          ssrRenderVNode(_push, createVNode(resolveDynamicComponent(tipo.componente), {
            class: [
              "w-8 h-8 transition-colors",
              unref(formulario).tipo === tipo.valor ? "text-[#D8AFA0]" : "text-[#5D4A44]/60 group-hover:text-[#D8AFA0]"
            ]
          }, null), _parent);
          _push(`<div class="font-medium text-[#5D4A44] text-sm" data-v-75e79c96>${ssrInterpolate(tipo.nombre)}</div><div class="text-xs text-[#5D4A44]/50" data-v-75e79c96>${ssrInterpolate(tipo.descripcion)}</div></button>`);
        });
        _push(`<!--]--></div></div><div data-v-75e79c96><label class="block text-sm font-medium text-[#5D4A44] mb-2 flex items-center gap-2" data-v-75e79c96>`);
        _push(ssrRenderComponent(unref(CheckCircleIcon), { class: "w-5 h-5" }, null, _parent));
        _push(`<span data-v-75e79c96>Estado</span><span class="text-red-500" data-v-75e79c96>*</span></label><div class="grid grid-cols-2 md:grid-cols-4 gap-3" data-v-75e79c96><!--[-->`);
        ssrRenderList(estadosCita, (estado) => {
          _push(`<button type="button" class="${ssrRenderClass([
            "p-3 border-2 rounded-lg transition-all flex flex-col items-center gap-2",
            unref(formulario).estado === estado.valor ? estado.claseActivo + " shadow-md" : estado.claseInactivo
          ])}" data-v-75e79c96>`);
          ssrRenderVNode(_push, createVNode(resolveDynamicComponent(estado.componente), { class: "w-7 h-7" }, null), _parent);
          _push(`<div class="font-medium text-sm" data-v-75e79c96>${ssrInterpolate(estado.nombre)}</div></button>`);
        });
        _push(`<!--]--></div></div></div><div class="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm" data-v-75e79c96><h4 class="text-sm font-bold text-amber-900 flex items-center gap-2 mb-3" data-v-75e79c96>`);
        _push(ssrRenderComponent(unref(DocumentTextIcon), { class: "w-5 h-5 text-amber-600" }, null, _parent));
        _push(`<span data-v-75e79c96>Notas Adicionales</span></h4><div data-v-75e79c96><label class="block text-sm font-medium text-[#5D4A44] mb-2 flex items-center gap-2" data-v-75e79c96>`);
        _push(ssrRenderComponent(unref(DocumentTextIcon), { class: "w-4 h-4" }, null, _parent));
        _push(`<span data-v-75e79c96>Notas (opcional)</span></label><textarea rows="3" class="w-full px-4 py-2 border border-[#D8AFA0]/30 rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent bg-white resize-none" placeholder="Notas sobre la cita, recordatorios, etc." data-v-75e79c96>${ssrInterpolate(unref(formulario).notas)}</textarea></div></div></div>`);
        if (unref(conflictoHorario)) {
          _push(`<div class="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-sm" data-v-75e79c96><div class="flex items-start gap-3" data-v-75e79c96>`);
          _push(ssrRenderComponent(unref(ExclamationTriangleIcon), { class: "w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" }, null, _parent));
          _push(`<div data-v-75e79c96><div class="font-semibold text-yellow-900 mb-1 flex items-center gap-2" data-v-75e79c96><span data-v-75e79c96>Conflicto de Horario</span></div><div class="text-sm text-yellow-800" data-v-75e79c96> Ya existe una cita en este horario. Verifica la disponibilidad. </div></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(camposInvalidos).length > 0 && !unref(formularioValido)) {
          _push(`<div class="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm" data-v-75e79c96><div class="flex items-start gap-3" data-v-75e79c96>`);
          _push(ssrRenderComponent(unref(XCircleIcon), { class: "w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" }, null, _parent));
          _push(`<div data-v-75e79c96><div class="font-semibold text-red-900 mb-2" data-v-75e79c96> Completa los campos obligatorios </div><ul class="text-sm text-red-800 space-y-1.5" data-v-75e79c96>`);
          if (!unref(formulario).paciente_id) {
            _push(`<li class="flex items-center gap-2" data-v-75e79c96><span class="w-1.5 h-1.5 rounded-full bg-red-500" data-v-75e79c96></span><span data-v-75e79c96>Selecciona un paciente</span></li>`);
          } else {
            _push(`<!---->`);
          }
          if (!unref(formulario).fecha) {
            _push(`<li class="flex items-center gap-2" data-v-75e79c96><span class="w-1.5 h-1.5 rounded-full bg-red-500" data-v-75e79c96></span><span data-v-75e79c96>Selecciona una fecha</span></li>`);
          } else {
            _push(`<!---->`);
          }
          if (!unref(formulario).hora_inicio) {
            _push(`<li class="flex items-center gap-2" data-v-75e79c96><span class="w-1.5 h-1.5 rounded-full bg-red-500" data-v-75e79c96></span><span data-v-75e79c96>Selecciona la hora de inicio</span></li>`);
          } else {
            _push(`<!---->`);
          }
          if (!unref(formulario).tipo) {
            _push(`<li class="flex items-center gap-2" data-v-75e79c96><span class="w-1.5 h-1.5 rounded-full bg-red-500" data-v-75e79c96></span><span data-v-75e79c96>Selecciona el tipo de sesi\xF3n</span></li>`);
          } else {
            _push(`<!---->`);
          }
          if (!unref(formulario).estado) {
            _push(`<li class="flex items-center gap-2" data-v-75e79c96><span class="w-1.5 h-1.5 rounded-full bg-red-500" data-v-75e79c96></span><span data-v-75e79c96>Selecciona el estado de la cita</span></li>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</ul></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(formularioValido) && !unref(conflictoHorario)) {
          _push(`<div class="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-sm" data-v-75e79c96><div class="flex items-start gap-3" data-v-75e79c96>`);
          _push(ssrRenderComponent(unref(InformationCircleIcon), { class: "w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" }, null, _parent));
          _push(`<div class="flex-1" data-v-75e79c96><div class="font-semibold text-blue-900 mb-3" data-v-75e79c96> Resumen de la Cita </div><div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm" data-v-75e79c96><div data-v-75e79c96><span class="text-blue-600 font-medium" data-v-75e79c96>Paciente:</span><div class="text-blue-900 font-semibold" data-v-75e79c96>${ssrInterpolate(unref(formulario).paciente_nombre)}</div></div><div data-v-75e79c96><span class="text-blue-600 font-medium" data-v-75e79c96>Fecha:</span><div class="text-blue-900" data-v-75e79c96>${ssrInterpolate(formatearFechaLegible(unref(formulario).fecha))}</div></div><div data-v-75e79c96><span class="text-blue-600 font-medium" data-v-75e79c96>Horario:</span><div class="text-blue-900 font-semibold" data-v-75e79c96>${ssrInterpolate(unref(formulario).hora_inicio)} - ${ssrInterpolate(unref(formulario).hora_fin)}</div></div><div data-v-75e79c96><span class="text-blue-600 font-medium" data-v-75e79c96>Duraci\xF3n:</span><div class="text-blue-900" data-v-75e79c96>${ssrInterpolate(unref(formulario).duracion)} minutos</div></div><div data-v-75e79c96><span class="text-blue-600 font-medium" data-v-75e79c96>Tipo:</span><div class="text-blue-900 capitalize" data-v-75e79c96>${ssrInterpolate(unref(formulario).tipo)}</div></div><div data-v-75e79c96><span class="text-blue-600 font-medium" data-v-75e79c96>Estado:</span><div class="text-blue-900 capitalize" data-v-75e79c96>${ssrInterpolate(unref(formulario).estado)}</div></div>`);
          if (unref(formulario).descontar_de_bono) {
            _push(`<div class="md:col-span-2 flex items-center gap-2" data-v-75e79c96>`);
            _push(ssrRenderComponent(unref(TicketIcon), { class: "w-5 h-5 text-blue-600" }, null, _parent));
            _push(`<div data-v-75e79c96><span class="text-blue-600 font-medium" data-v-75e79c96>Bono:</span><span class="text-blue-900 ml-2" data-v-75e79c96>Se descontar\xE1 1 sesi\xF3n del bono activo</span></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="sticky bottom-0 bg-[#F9F7F3] pt-4 border-t border-[#D8AFA0]/30 flex gap-3 mt-6" data-v-75e79c96><button type="button" class="flex-1 px-6 py-3 border-2 border-[#D8AFA0] text-[#5D4A44] rounded-lg hover:bg-[#D8AFA0]/10 transition-colors font-medium" aria-label="Cancelar creaci\xF3n de cita" data-v-75e79c96> Cancelar </button><div class="relative flex-1" data-v-75e79c96><button type="submit"${ssrIncludeBooleanAttr(!unref(formularioValido) || unref(guardando) || unref(conflictoHorario)) ? " disabled" : ""} class="${ssrRenderClass([
          "w-full px-6 py-3 rounded-lg transition-all font-medium text-white",
          unref(formularioValido) && !unref(guardando) && !unref(conflictoHorario) ? "bg-[#D8AFA0] hover:bg-[#D8AFA0]/90 hover:shadow-lg cursor-pointer" : "bg-gray-400 cursor-not-allowed opacity-60"
        ])}"${ssrRenderAttr("aria-label", unref(formularioValido) ? "Guardar cita" : "Completa todos los campos requeridos para guardar")} data-v-75e79c96>${ssrInterpolate(unref(guardando) ? "Guardando..." : "\u2713 Guardar Cita")}</button>`);
        if (!unref(formularioValido) && !unref(guardando)) {
          _push(`<div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none" data-v-75e79c96> Completa todos los campos obligatorios (*) </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></form></div>`);
        if (unref(mostrarToast)) {
          _push(`<div class="${ssrRenderClass([
            "fixed bottom-6 right-6 max-w-md rounded-lg shadow-2xl p-4 z-[60]",
            unref(toastTipo) === "exito" ? "bg-gradient-to-r from-green-500 to-emerald-500" : unref(toastTipo) === "error" ? "bg-gradient-to-r from-red-500 to-rose-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"
          ])}" data-v-75e79c96><div class="flex items-start gap-3 text-white" data-v-75e79c96><div class="text-3xl" data-v-75e79c96>${ssrInterpolate(unref(toastTipo) === "exito" ? "\u2705" : unref(toastTipo) === "error" ? "\u274C" : "\u2139\uFE0F")}</div><div class="flex-1" data-v-75e79c96><div class="font-bold text-lg mb-1" data-v-75e79c96>${ssrInterpolate(unref(toastTitulo))}</div><div class="text-sm opacity-90 mb-3" data-v-75e79c96>${ssrInterpolate(unref(toastMensaje))}</div>`);
          if (unref(toastAcciones).length > 0) {
            _push(`<div class="flex gap-2" data-v-75e79c96><!--[-->`);
            ssrRenderList(unref(toastAcciones), (accion, index) => {
              _push(`<button class="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-all" data-v-75e79c96>${ssrInterpolate(accion.texto)}</button>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><button class="text-white/80 hover:text-white transition-colors" data-v-75e79c96> \u2715 </button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModalNuevaCita.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-75e79c96"]]), { __name: "ModalNuevaCita" });

export { __nuxt_component_2 as _ };
//# sourceMappingURL=ModalNuevaCita-6Mm-k6WH.mjs.map
