import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';

const useCitas = () => {
  const supabase = useSupabaseClient();
  const getTerapeutas = async () => {
    return [];
  };
  const getTerapeuta = async (terapeutaId) => {
    return null;
  };
  const getTerapeutaActual = async () => {
    return null;
  };
  const getCitas = async (terapeutaId) => {
    return [];
  };
  const getCitasPorDia = async (fecha, terapeutaId) => {
    return [];
  };
  const getCitasRango = async (fechaInicio, fechaFin, terapeutaId) => {
    return [];
  };
  const getCitasPaciente = async (pacienteId) => {
    return [];
  };
  const crearCita = async (params) => {
    return { success: false, error: "Not client" };
  };
  const actualizarEstadoCita = async (citaId, nuevoEstado) => {
    return { success: false };
  };
  const actualizarCita = async (citaId, updates) => {
    return { success: false };
  };
  const cancelarCita = async (citaId, motivo) => {
    return { success: false };
  };
  const cancelarCitaConReintegro = async (citaId, bonoId, reintegrar = false) => {
    return { success: false };
  };
  const eliminarCita = async (citaId) => {
    return { success: false };
  };
  const obtenerBonoActivoId = async (pacienteId) => {
    return null;
  };
  const obtenerBonoActivo = async (pacienteId) => {
    return null;
  };
  const verificarBonoActivo = async (pacienteId) => {
    const bono = await obtenerBonoActivo();
    if (!bono) {
      return {
        tiene_bono: false,
        sesiones_restantes: 0,
        sesiones_totales: 0,
        tipo_bono: "",
        bono_id: void 0
      };
    }
    try {
      const { data: paciente } = await supabase.from("pacientes").select("metadata, area_de_acompanamiento, frecuencia").eq("id", pacienteId).single();
      const tipoBono = bono.tipo_bono || paciente?.frecuencia || paciente?.metadata?.frecuencia || "mensual";
      return {
        tiene_bono: true,
        sesiones_restantes: bono.sesiones_restantes || 0,
        sesiones_totales: bono.sesiones_totales || 0,
        tipo_bono: tipoBono,
        bono_id: bono.id
      };
    } catch (error) {
      console.error("❌ Error al verificar bono:", error);
      return {
        tiene_bono: false,
        sesiones_restantes: 0,
        sesiones_totales: 0,
        tipo_bono: "",
        bono_id: void 0
      };
    }
  };
  const obtenerEstadisticasBono = async (bonoId) => {
    return null;
  };
  const getBonosPaciente = async (pacienteId) => {
    return [];
  };
  const verificarDisponibilidadTerapeuta = async (terapeutaId, fecha, horaInicio, horaFin) => {
    return false;
  };
  const buscarDisponibilidad = async (terapeutaId, dias = 14, duracion = 60) => {
    return [];
  };
  const sugerirProximoHorario = async (pacienteId, frecuencia, terapeutaId) => {
    return null;
  };
  const getProximasCitasPaciente = async (pacienteId, limite = 10) => {
    return [];
  };
  const getUltimaCitaPaciente = async (pacienteId) => {
    return null;
  };
  const calcularProximaFechaSugerida = async (pacienteId, frecuencia) => {
    return null;
  };
  function formatearFecha(fecha) {
    const resultado = fecha.toISOString().split("T")[0];
    return resultado || "";
  }
  function calcularHoraFin(horaInicio, duracionMinutos) {
    const [horas = 0, minutos = 0] = horaInicio.split(":").map(Number);
    const fecha = /* @__PURE__ */ new Date();
    fecha.setHours(horas, minutos, 0, 0);
    fecha.setMinutes(fecha.getMinutes() + duracionMinutos);
    const horaFin = String(fecha.getHours()).padStart(2, "0");
    const minutosFin = String(fecha.getMinutes()).padStart(2, "0");
    return `${horaFin}:${minutosFin}`;
  }
  function obtenerNombreDia(fecha) {
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const date = /* @__PURE__ */ new Date(fecha + "T00:00:00");
    return dias[date.getDay()] || "Desconocido";
  }
  const listenRealtimeCitas = (terapeutaId, callback) => {
    return null;
  };
  const listenRealtimeCitasGlobal = (callback) => {
    return null;
  };
  return {
    // Terapeutas
    getTerapeutas,
    getTerapeuta,
    getTerapeutaActual,
    // Citas - Lectura
    getCitas,
    getCitasPorDia,
    getCitasRango,
    getCitasPaciente,
    getProximasCitasPaciente,
    getUltimaCitaPaciente,
    // Citas - Escritura
    crearCita,
    actualizarEstadoCita,
    actualizarCita,
    cancelarCita,
    cancelarCitaConReintegro,
    eliminarCita,
    // Bonos
    obtenerBonoActivoId,
    obtenerBonoActivo,
    verificarBonoActivo,
    obtenerEstadisticasBono,
    getBonosPaciente,
    // Disponibilidad
    verificarDisponibilidadTerapeuta,
    buscarDisponibilidad,
    calcularProximaFechaSugerida,
    sugerirProximoHorario,
    // Realtime
    listenRealtimeCitas,
    listenRealtimeCitasGlobal,
    // Utilidades
    formatearFecha,
    calcularHoraFin,
    obtenerNombreDia
  };
};

export { useCitas as u };
//# sourceMappingURL=useCitas-DyEZH6RI.mjs.map
