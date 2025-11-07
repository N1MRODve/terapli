import { ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { h as useRoute, a as useRouter } from './server.mjs';
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
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    const route = useRoute();
    useRouter();
    const cargando = ref(true);
    const cargandoCitas = ref(true);
    const cargandoBonos = ref(true);
    const cargandoPagos = ref(true);
    const cargandoSesiones = ref(true);
    const error = ref(null);
    const pacienteData = ref(null);
    const citas = ref([]);
    const bonos = ref([]);
    const pagos = ref([]);
    const sesiones = ref([]);
    const tabActual = ref("info");
    const modalEdicion = ref(false);
    const guardandoCambios = ref(false);
    const errorEdicion = ref("");
    const formEdicion = ref({
      nombre_completo: "",
      email: "",
      telefono: "",
      area_de_acompanamiento: "",
      frecuencia: "",
      activo: true
    });
    const tabs = [
      { id: "info", label: "Información", icon: "👤" },
      { id: "citas", label: "Citas", icon: "📅" },
      { id: "bonos", label: "Bonos", icon: "🎟️" },
      { id: "pagos", label: "Pagos", icon: "💳" },
      { id: "sesiones", label: "Sesiones", icon: "📝" }
    ];
    computed(() => route.params.id);
    const nombreCompleto = computed(() => pacienteData.value?.nombre_completo || "Sin nombre");
    const iniciales = computed(() => {
      const nombre = nombreCompleto.value;
      return nombre.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
    });
    const totalCitas = computed(() => citas.value.length);
    const citasCompletadas = computed(() => citas.value.filter((c) => c.estado === "completada").length);
    const proximaCitaTexto = computed(() => {
      const futuras = citas.value.filter((c) => new Date(c.fecha_cita) > /* @__PURE__ */ new Date() && c.estado !== "cancelada");
      if (futuras.length === 0) return "Sin citas programadas";
      return formatearFechaCorta(futuras[0].fecha_cita);
    });
    const bonosActivos = computed(() => bonos.value.filter((b) => b.estado === "activo" && b.sesiones_restantes > 0));
    const formatearFecha = (fecha) => {
      if (!fecha) return "Sin fecha";
      const date = new Date(fecha);
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    };
    const formatearFechaCorta = (fecha) => {
      if (!fecha) return "N/A";
      const date = new Date(fecha);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    };
    const getEstadoLabel = (estado) => {
      const labels = { pendiente: "Pendiente", confirmada: "Confirmada", completada: "Completada", cancelada: "Cancelada" };
      return labels[estado] || estado;
    };
    const getEstadoClasses = (estado) => {
      const classes = {
        pendiente: "bg-yellow-100 text-yellow-700",
        confirmada: "bg-green-100 text-green-700",
        completada: "bg-blue-100 text-blue-700",
        cancelada: "bg-red-100 text-red-700"
      };
      return classes[estado] || "bg-gray-100 text-gray-700";
    };
    const getBonoEstadoLabel = (estado) => {
      const labels = { activo: "Activo", agotado: "Agotado", expirado: "Expirado", cancelado: "Cancelado" };
      return labels[estado] || estado;
    };
    const getBonoEstadoClasses = (estado) => {
      const classes = {
        activo: "bg-green-100 text-green-700",
        agotado: "bg-orange-100 text-orange-700",
        expirado: "bg-red-100 text-red-700",
        cancelado: "bg-gray-100 text-gray-700"
      };
      return classes[estado] || "bg-gray-100 text-gray-700";
    };
    const getPagoEstadoLabel = (estado) => {
      const labels = { pendiente: "Pendiente", completado: "Completado", cancelado: "Cancelado" };
      return labels[estado] || estado;
    };
    const getPagoEstadoClasses = (estado) => {
      const classes = {
        pendiente: "bg-yellow-100 text-yellow-700",
        completado: "bg-green-100 text-green-700",
        cancelado: "bg-red-100 text-red-700"
      };
      return classes[estado] || "bg-gray-100 text-gray-700";
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "pb-20" }, _attrs))}><button class="mb-6 flex items-center gap-2 text-cafe hover:text-terracota transition-colors"><span>←</span><span>Volver a lista de pacientes</span></button>`);
      if (unref(cargando)) {
        _push(`<div class="text-center py-12"><div class="animate-spin w-12 h-12 border-4 border-terracota border-t-transparent rounded-full mx-auto mb-4"></div><p class="text-cafe/60">Cargando información del paciente...</p></div>`);
      } else if (unref(error)) {
        _push(`<div class="text-center py-12"><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8"><span class="text-6xl mb-4 block">❌</span><h3 class="text-xl font-serif font-semibold text-cafe mb-2">No se pudo cargar la información</h3><p class="text-cafe/60 mb-4">${ssrInterpolate(unref(error))}</p><button class="px-6 py-3 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors"> Volver a la lista </button></div></div>`);
      } else if (unref(pacienteData)) {
        _push(`<div class="space-y-6"><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6"><div class="flex items-start gap-4 flex-1"><div class="w-20 h-20 rounded-full bg-gradient-to-br from-terracota to-cafe flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">${ssrInterpolate(unref(iniciales))}</div><div class="flex-1"><div class="flex items-center gap-3 mb-2"><h1 class="text-3xl font-serif font-bold text-cafe">${ssrInterpolate(unref(nombreCompleto))}</h1><button class="text-gray-400 hover:text-terracota transition-colors" title="Editar información"><span class="text-xl">✏️</span></button></div><div class="flex flex-wrap items-center gap-3 mb-3"><span class="${ssrRenderClass([unref(pacienteData).activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700", "px-3 py-1 text-sm font-medium rounded-full"])}">${ssrInterpolate(unref(pacienteData).activo ? "Activo" : "Inactivo")}</span><span class="text-cafe/60 text-sm flex items-center gap-1"><span>📧</span><span>${ssrInterpolate(unref(pacienteData).email)}</span></span></div><div class="space-y-1 text-sm">`);
        if (unref(pacienteData).telefono) {
          _push(`<div class="text-cafe/70 flex items-center gap-2"><span>📱</span><span>${ssrInterpolate(unref(pacienteData).telefono)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(pacienteData).area_de_acompanamiento) {
          _push(`<div class="text-cafe/70 flex items-center gap-2"><span>🎯</span><span><strong>Área:</strong> ${ssrInterpolate(unref(pacienteData).area_de_acompanamiento)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(pacienteData).frecuencia) {
          _push(`<div class="text-cafe/70 flex items-center gap-2"><span>📆</span><span><strong>Frecuencia:</strong> ${ssrInterpolate(unref(pacienteData).frecuencia)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><div class="flex flex-col gap-2">`);
        if (unref(pacienteData).telefono) {
          _push(`<button class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2 justify-center"><span>💬</span><span>WhatsApp</span></button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors text-sm flex items-center gap-2 justify-center"><span>📅</span><span>Agendar Cita</span></button></div></div></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><div class="flex items-center gap-3"><span class="text-3xl">📊</span><div><p class="text-sm text-gray-600">Total Citas</p><p class="text-2xl font-bold text-cafe">${ssrInterpolate(unref(totalCitas))}</p></div></div></div><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><div class="flex items-center gap-3"><span class="text-3xl">✅</span><div><p class="text-sm text-gray-600">Completadas</p><p class="text-2xl font-bold text-green-600">${ssrInterpolate(unref(citasCompletadas))}</p></div></div></div><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><div class="flex items-center gap-3"><span class="text-3xl">📅</span><div><p class="text-sm text-gray-600">Próxima Cita</p><p class="text-sm font-semibold text-cafe">${ssrInterpolate(unref(proximaCitaTexto))}</p></div></div></div><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><div class="flex items-center gap-3"><span class="text-3xl">🎟️</span><div><p class="text-sm text-gray-600">Bonos Activos</p><p class="text-2xl font-bold text-terracota">${ssrInterpolate(unref(bonosActivos).length)}</p></div></div></div></div><div class="bg-white rounded-xl shadow-sm border border-gray-100"><div class="flex border-b border-gray-200 overflow-x-auto"><!--[-->`);
        ssrRenderList(tabs, (tab) => {
          _push(`<button class="${ssrRenderClass([unref(tabActual) === tab.id ? "text-terracota border-b-2 border-terracota" : "text-gray-600 hover:text-cafe", "px-6 py-4 font-medium transition-colors whitespace-nowrap flex items-center gap-2"])}"><span>${ssrInterpolate(tab.icon)}</span><span>${ssrInterpolate(tab.label)}</span></button>`);
        });
        _push(`<!--]--></div><div class="p-6">`);
        if (unref(tabActual) === "info") {
          _push(`<div><h3 class="text-lg font-semibold text-cafe mb-4">Información Personal</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="p-4 bg-gray-50 rounded-lg"><p class="text-sm text-gray-600 mb-1">Nombre Completo</p><p class="font-medium text-cafe">${ssrInterpolate(unref(pacienteData).nombre_completo || "No especificado")}</p></div><div class="p-4 bg-gray-50 rounded-lg"><p class="text-sm text-gray-600 mb-1">Email</p><p class="font-medium text-cafe">${ssrInterpolate(unref(pacienteData).email || "No especificado")}</p></div><div class="p-4 bg-gray-50 rounded-lg"><p class="text-sm text-gray-600 mb-1">Teléfono</p><p class="font-medium text-cafe">${ssrInterpolate(unref(pacienteData).telefono || "No especificado")}</p></div><div class="p-4 bg-gray-50 rounded-lg"><p class="text-sm text-gray-600 mb-1">Área de Acompañamiento</p><p class="font-medium text-cafe">${ssrInterpolate(unref(pacienteData).area_de_acompanamiento || "No especificado")}</p></div><div class="p-4 bg-gray-50 rounded-lg"><p class="text-sm text-gray-600 mb-1">Frecuencia de Sesiones</p><p class="font-medium text-cafe">${ssrInterpolate(unref(pacienteData).frecuencia || "No especificado")}</p></div><div class="p-4 bg-gray-50 rounded-lg"><p class="text-sm text-gray-600 mb-1">Estado</p><p class="${ssrRenderClass([unref(pacienteData).activo ? "text-green-600" : "text-gray-600", "font-medium"])}">${ssrInterpolate(unref(pacienteData).activo ? "Activo" : "Inactivo")}</p></div>`);
          if (unref(pacienteData).created_at) {
            _push(`<div class="p-4 bg-gray-50 rounded-lg col-span-full"><p class="text-sm text-gray-600 mb-1">Fecha de Registro</p><p class="font-medium text-cafe">${ssrInterpolate(formatearFecha(unref(pacienteData).created_at))}</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(tabActual) === "citas") {
          _push(`<div><div class="flex items-center justify-between mb-6"><h3 class="text-lg font-semibold text-cafe">Historial de Citas (${ssrInterpolate(unref(totalCitas))})</h3><button class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors text-sm"> + Nueva Cita </button></div>`);
          if (unref(cargandoCitas)) {
            _push(`<div class="text-center py-8 text-gray-400"><p>Cargando historial...</p></div>`);
          } else if (unref(citas).length === 0) {
            _push(`<div class="text-center py-12 text-gray-400"><span class="text-6xl block mb-4">📅</span><p class="mb-4">No hay citas registradas</p><button class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors"> Agendar Primera Cita </button></div>`);
          } else {
            _push(`<div class="space-y-3"><!--[-->`);
            ssrRenderList(unref(citas), (cita) => {
              _push(`<div class="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"><div class="flex items-start justify-between gap-4"><div class="flex-1"><div class="flex items-center gap-3 mb-2"><span class="text-lg">📅</span><div><p class="font-semibold text-cafe">${ssrInterpolate(formatearFecha(cita.fecha_cita))}</p><p class="text-sm text-gray-600">${ssrInterpolate(cita.hora_inicio)} - ${ssrInterpolate(cita.hora_fin)}</p></div></div><div class="flex flex-wrap gap-2 mt-2"><span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">${ssrInterpolate(cita.modalidad || "presencial")}</span><span class="${ssrRenderClass([getEstadoClasses(cita.estado), "px-2 py-1 text-xs rounded-full"])}">${ssrInterpolate(getEstadoLabel(cita.estado))}</span></div>`);
              if (cita.observaciones) {
                _push(`<p class="text-sm text-gray-600 mt-2">${ssrInterpolate(cita.observaciones)}</p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div></div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(tabActual) === "bonos") {
          _push(`<div><div class="flex items-center justify-between mb-6"><h3 class="text-lg font-semibold text-cafe">Bonos Contratados</h3></div>`);
          if (unref(cargandoBonos)) {
            _push(`<div class="text-center py-8 text-gray-400"><p>Cargando bonos...</p></div>`);
          } else if (unref(bonos).length === 0) {
            _push(`<div class="text-center py-12 text-gray-400"><span class="text-6xl block mb-4">🎟️</span><p class="mb-4">No hay bonos registrados</p></div>`);
          } else {
            _push(`<div class="space-y-4"><!--[-->`);
            ssrRenderList(unref(bonos), (bono) => {
              _push(`<div class="p-6 border border-gray-200 rounded-lg"><div class="flex items-start justify-between mb-4"><div><h4 class="font-semibold text-cafe text-lg mb-1">Bono de ${ssrInterpolate(bono.sesiones_totales)} Sesiones</h4><span class="${ssrRenderClass([getBonoEstadoClasses(bono.estado), "px-3 py-1 text-sm rounded-full"])}">${ssrInterpolate(getBonoEstadoLabel(bono.estado))}</span></div><div class="text-right"><p class="text-2xl font-bold text-terracota">${ssrInterpolate(bono.sesiones_restantes)}</p><p class="text-sm text-gray-600">sesiones restantes</p></div></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4"><div><p class="text-xs text-gray-600">Total Sesiones</p><p class="font-semibold text-cafe">${ssrInterpolate(bono.sesiones_totales)}</p></div><div><p class="text-xs text-gray-600">Sesiones Usadas</p><p class="font-semibold text-cafe">${ssrInterpolate(bono.sesiones_totales - bono.sesiones_restantes)}</p></div><div><p class="text-xs text-gray-600">Precio</p><p class="font-semibold text-cafe">${ssrInterpolate(bono.precio_total ? `${bono.precio_total}€` : "N/A")}</p></div><div><p class="text-xs text-gray-600">Fecha Compra</p><p class="font-semibold text-cafe text-sm">${ssrInterpolate(formatearFechaCorta(bono.fecha_compra))}</p></div></div>`);
              if (bono.fecha_expiracion) {
                _push(`<div class="mt-3 text-sm text-gray-600"><span>📅 Expira: ${ssrInterpolate(formatearFechaCorta(bono.fecha_expiracion))}</span></div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<div class="mt-4"><div class="w-full bg-gray-200 rounded-full h-2"><div class="bg-terracota h-2 rounded-full" style="${ssrRenderStyle({ width: `${(bono.sesiones_totales - bono.sesiones_restantes) / bono.sesiones_totales * 100}%` })}"></div></div></div></div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(tabActual) === "pagos") {
          _push(`<div><div class="flex items-center justify-between mb-6"><h3 class="text-lg font-semibold text-cafe">Historial de Pagos</h3></div>`);
          if (unref(cargandoPagos)) {
            _push(`<div class="text-center py-8 text-gray-400"><p>Cargando pagos...</p></div>`);
          } else if (unref(pagos).length === 0) {
            _push(`<div class="text-center py-12 text-gray-400"><span class="text-6xl block mb-4">💳</span><p class="mb-4">No hay pagos registrados</p></div>`);
          } else {
            _push(`<div class="space-y-3"><!--[-->`);
            ssrRenderList(unref(pagos), (pago) => {
              _push(`<div class="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"><div class="flex items-start justify-between"><div class="flex-1"><div class="flex items-center gap-3 mb-2"><span class="text-lg">💳</span><div><p class="font-semibold text-cafe">${ssrInterpolate(pago.concepto || "Pago de sesión")}</p><p class="text-sm text-gray-600">${ssrInterpolate(formatearFecha(pago.fecha))}</p></div></div><div class="flex items-center gap-2 mt-2"><span class="${ssrRenderClass([getPagoEstadoClasses(pago.estado), "px-2 py-1 text-xs rounded-full"])}">${ssrInterpolate(getPagoEstadoLabel(pago.estado))}</span>`);
              if (pago.metodo_pago) {
                _push(`<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">${ssrInterpolate(pago.metodo_pago)}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div><div class="text-right"><p class="text-xl font-bold text-cafe">${ssrInterpolate(pago.monto)}€</p></div></div></div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(tabActual) === "sesiones") {
          _push(`<div><div class="flex items-center justify-between mb-6"><h3 class="text-lg font-semibold text-cafe">Sesiones y Notas</h3></div>`);
          if (unref(cargandoSesiones)) {
            _push(`<div class="text-center py-8 text-gray-400"><p>Cargando sesiones...</p></div>`);
          } else if (unref(sesiones).length === 0) {
            _push(`<div class="text-center py-12 text-gray-400"><span class="text-6xl block mb-4">📝</span><p class="mb-4">No hay sesiones registradas</p></div>`);
          } else {
            _push(`<div class="space-y-4"><!--[-->`);
            ssrRenderList(unref(sesiones), (sesion) => {
              _push(`<div class="p-4 border border-gray-100 rounded-lg"><div class="flex items-start justify-between mb-3"><div><p class="font-semibold text-cafe">${ssrInterpolate(formatearFecha(sesion.fecha))}</p>`);
              if (sesion.tipo) {
                _push(`<p class="text-sm text-gray-600">${ssrInterpolate(sesion.tipo)}</p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div>`);
              if (sesion.notas) {
                _push(`<div class="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">${ssrInterpolate(sesion.notas)}</div>`);
              } else {
                _push(`<div class="text-sm text-gray-400 italic">Sin notas</div>`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(modalEdicion)) {
        _push(`<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"><div class="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between"><h2 class="text-2xl font-serif font-bold text-cafe">Editar Paciente</h2><button class="text-gray-400 hover:text-cafe transition-colors"><span class="text-2xl">×</span></button></div><form class="p-6 space-y-6"><div><label class="block text-sm font-medium text-cafe mb-2">Nombre Completo *</label><input${ssrRenderAttr("value", unref(formEdicion).nombre_completo)} type="text" required class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota"></div><div><label class="block text-sm font-medium text-cafe mb-2">Email *</label><input${ssrRenderAttr("value", unref(formEdicion).email)} type="email" required class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota"></div><div><label class="block text-sm font-medium text-cafe mb-2">Teléfono</label><input${ssrRenderAttr("value", unref(formEdicion).telefono)} type="tel" class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota"></div><div><label class="block text-sm font-medium text-cafe mb-2">Área de Acompañamiento</label><select class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).area_de_acompanamiento) ? ssrLooseContain(unref(formEdicion).area_de_acompanamiento, "") : ssrLooseEqual(unref(formEdicion).area_de_acompanamiento, "")) ? " selected" : ""}>Selecciona un área</option><option value="Ansiedad"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).area_de_acompanamiento) ? ssrLooseContain(unref(formEdicion).area_de_acompanamiento, "Ansiedad") : ssrLooseEqual(unref(formEdicion).area_de_acompanamiento, "Ansiedad")) ? " selected" : ""}>Ansiedad</option><option value="Depresión"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).area_de_acompanamiento) ? ssrLooseContain(unref(formEdicion).area_de_acompanamiento, "Depresión") : ssrLooseEqual(unref(formEdicion).area_de_acompanamiento, "Depresión")) ? " selected" : ""}>Depresión</option><option value="Duelo"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).area_de_acompanamiento) ? ssrLooseContain(unref(formEdicion).area_de_acompanamiento, "Duelo") : ssrLooseEqual(unref(formEdicion).area_de_acompanamiento, "Duelo")) ? " selected" : ""}>Duelo</option><option value="Autoestima"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).area_de_acompanamiento) ? ssrLooseContain(unref(formEdicion).area_de_acompanamiento, "Autoestima") : ssrLooseEqual(unref(formEdicion).area_de_acompanamiento, "Autoestima")) ? " selected" : ""}>Autoestima</option><option value="Relaciones"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).area_de_acompanamiento) ? ssrLooseContain(unref(formEdicion).area_de_acompanamiento, "Relaciones") : ssrLooseEqual(unref(formEdicion).area_de_acompanamiento, "Relaciones")) ? " selected" : ""}>Relaciones</option><option value="Familia"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).area_de_acompanamiento) ? ssrLooseContain(unref(formEdicion).area_de_acompanamiento, "Familia") : ssrLooseEqual(unref(formEdicion).area_de_acompanamiento, "Familia")) ? " selected" : ""}>Familia</option><option value="Trauma"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).area_de_acompanamiento) ? ssrLooseContain(unref(formEdicion).area_de_acompanamiento, "Trauma") : ssrLooseEqual(unref(formEdicion).area_de_acompanamiento, "Trauma")) ? " selected" : ""}>Trauma</option><option value="Estrés"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).area_de_acompanamiento) ? ssrLooseContain(unref(formEdicion).area_de_acompanamiento, "Estrés") : ssrLooseEqual(unref(formEdicion).area_de_acompanamiento, "Estrés")) ? " selected" : ""}>Estrés</option><option value="Desarrollo Personal"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).area_de_acompanamiento) ? ssrLooseContain(unref(formEdicion).area_de_acompanamiento, "Desarrollo Personal") : ssrLooseEqual(unref(formEdicion).area_de_acompanamiento, "Desarrollo Personal")) ? " selected" : ""}>Desarrollo Personal</option><option value="Otro"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).area_de_acompanamiento) ? ssrLooseContain(unref(formEdicion).area_de_acompanamiento, "Otro") : ssrLooseEqual(unref(formEdicion).area_de_acompanamiento, "Otro")) ? " selected" : ""}>Otro</option></select></div><div><label class="block text-sm font-medium text-cafe mb-2">Frecuencia de Sesiones</label><select class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracota"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).frecuencia) ? ssrLooseContain(unref(formEdicion).frecuencia, "") : ssrLooseEqual(unref(formEdicion).frecuencia, "")) ? " selected" : ""}>Selecciona una frecuencia</option><option value="semanal"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).frecuencia) ? ssrLooseContain(unref(formEdicion).frecuencia, "semanal") : ssrLooseEqual(unref(formEdicion).frecuencia, "semanal")) ? " selected" : ""}>Semanal</option><option value="quincenal"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).frecuencia) ? ssrLooseContain(unref(formEdicion).frecuencia, "quincenal") : ssrLooseEqual(unref(formEdicion).frecuencia, "quincenal")) ? " selected" : ""}>Quincenal</option><option value="mensual"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).frecuencia) ? ssrLooseContain(unref(formEdicion).frecuencia, "mensual") : ssrLooseEqual(unref(formEdicion).frecuencia, "mensual")) ? " selected" : ""}>Mensual</option><option value="ocasional"${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).frecuencia) ? ssrLooseContain(unref(formEdicion).frecuencia, "ocasional") : ssrLooseEqual(unref(formEdicion).frecuencia, "ocasional")) ? " selected" : ""}>Ocasional</option></select></div><div class="flex items-center gap-3"><input${ssrIncludeBooleanAttr(Array.isArray(unref(formEdicion).activo) ? ssrLooseContain(unref(formEdicion).activo, null) : unref(formEdicion).activo) ? " checked" : ""} type="checkbox" id="activo-edit" class="w-5 h-5 text-terracota border-gray-300 rounded focus:ring-2 focus:ring-terracota"><label for="activo-edit" class="text-sm font-medium text-cafe cursor-pointer">Paciente activo</label></div>`);
        if (unref(errorEdicion)) {
          _push(`<div class="p-4 bg-red-50 border border-red-200 rounded-lg"><p class="text-sm text-red-600">${ssrInterpolate(unref(errorEdicion))}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-3 pt-4"><button type="button"${ssrIncludeBooleanAttr(unref(guardandoCambios)) ? " disabled" : ""} class="flex-1 px-6 py-3 border border-gray-300 text-cafe rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"> Cancelar </button><button type="submit"${ssrIncludeBooleanAttr(unref(guardandoCambios)) ? " disabled" : ""} class="flex-1 px-6 py-3 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">`);
        if (unref(guardandoCambios)) {
          _push(`<span class="animate-spin">⏳</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span>${ssrInterpolate(unref(guardandoCambios) ? "Guardando..." : "Guardar Cambios")}</span></button></div></form></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinadora/pacientes/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-CnwAzCzu.mjs.map
