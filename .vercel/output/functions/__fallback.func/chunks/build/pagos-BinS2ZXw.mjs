import { e as useSupabaseUser, _ as __nuxt_component_0 } from './server.mjs';
import { defineComponent, ref, computed, resolveComponent, withCtx, unref, createVNode, withDirectives, isRef, vModelSelect, vModelText, createBlock, createCommentVNode, openBlock, Fragment, renderList, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "pagos",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    const { getUserId } = useSupabase();
    const pagos = ref([]);
    const filtroEstado = ref("");
    const busqueda = ref("");
    const fechaDesde = ref("");
    const fechaHasta = ref("");
    const mostrarModalNuevoPago = ref(false);
    const cargando = ref(true);
    const pagosFiltrados = computed(() => {
      let resultado = [...pagos.value];
      if (filtroEstado.value) {
        resultado = resultado.filter((p) => p.estado === filtroEstado.value);
      }
      if (busqueda.value) {
        const termino = busqueda.value.toLowerCase();
        resultado = resultado.filter(
          (p) => p.paciente_nombre.toLowerCase().includes(termino)
        );
      }
      if (fechaDesde.value) {
        resultado = resultado.filter(
          (p) => new Date(p.created_at) >= new Date(fechaDesde.value)
        );
      }
      if (fechaHasta.value) {
        resultado = resultado.filter(
          (p) => new Date(p.created_at) <= new Date(fechaHasta.value)
        );
      }
      return resultado;
    });
    const totalConfirmadosHoy = computed(() => {
      const hoy = (/* @__PURE__ */ new Date()).toDateString();
      return pagos.value.filter((p) => new Date(p.created_at).toDateString() === hoy && p.estado === "confirmado_admin").reduce((sum, p) => sum + parseFloat(p.monto), 0);
    });
    const totalDelMes = computed(() => {
      const hoy = /* @__PURE__ */ new Date();
      const mesActual = hoy.getMonth();
      const a\u00F1oActual = hoy.getFullYear();
      return pagos.value.filter((p) => {
        const fecha = new Date(p.created_at);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === a\u00F1oActual;
      }).reduce((sum, p) => sum + parseFloat(p.monto), 0);
    });
    const formatearFecha = (fecha) => {
      return new Date(fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    };
    const obtenerIniciales = (nombre) => {
      return nombre.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
    };
    const formatNumber = (num) => {
      return num.toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };
    const getEstadoClass = (estado) => {
      const classes = {
        "pendiente": "bg-yellow-100 text-yellow-700",
        "confirmado_paciente": "bg-blue-100 text-blue-700",
        "confirmado_admin": "bg-green-100 text-green-700",
        "rechazado": "bg-red-100 text-red-700"
      };
      return classes[estado] || "bg-gray-100 text-gray-700";
    };
    const getEstadoTexto = (estado) => {
      const textos = {
        "pendiente": "Pendiente",
        "confirmado_paciente": "Confirmado",
        "confirmado_admin": "Verificado",
        "rechazado": "Rechazado"
      };
      return textos[estado] || estado;
    };
    const totalPorEstado = (estado) => {
      return pagos.value.filter((p) => p.estado === estado).reduce((sum, p) => sum + parseFloat(p.monto), 0);
    };
    const confirmarPago = async (pago) => {
      try {
        const userId = getUserId();
        if (!userId) {
          alert("\u274C No est\xE1s autenticado");
          return;
        }
        const { error } = await supabase.from("pagos").update({
          estado: "confirmado_paciente",
          confirmado_por: userId,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", pago.id);
        if (error) throw error;
        alert("\u2705 Pago confirmado exitosamente");
        cargarPagos();
      } catch (error) {
        console.error("Error:", error);
        alert("\u274C Error al confirmar pago");
      }
    };
    const enviarAAdministracion = async (pago) => {
      alert("Esta funcionalidad requiere configurar notificaciones a administraci\xF3n");
    };
    const verDetalles = (pago) => {
      alert(`Detalles del pago:

Paciente: ${pago.paciente_nombre}
Monto: ${formatNumber(parseFloat(pago.monto))}
Estado: ${pago.estado}

(Modal de detalles en desarrollo)`);
    };
    const cargarPagos = async () => {
      if (!user.value) return;
      cargando.value = true;
      try {
        const { data, error } = await supabase.from("pagos").select(`
        *,
        paciente:paciente_id(nombre),
        terapeuta:terapeuta_id(nombre)
      `).order("created_at", { ascending: false });
        if (error) throw error;
        if (data) {
          pagos.value = data.map((p) => {
            var _a, _b;
            return {
              ...p,
              paciente_nombre: ((_a = p.paciente) == null ? void 0 : _a.nombre) || "Sin paciente",
              terapeuta_nombre: ((_b = p.terapeuta) == null ? void 0 : _b.nombre) || "Sin terapeuta"
            };
          });
        }
      } catch (error) {
        console.error("Error al cargar pagos:", error);
      } finally {
        cargando.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLayout = __nuxt_component_0;
      const _component_Icon = resolveComponent("Icon");
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_NuxtLayout, { name: "coordinacion" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="mb-10 flex items-center justify-between"${_scopeId}><div${_scopeId}><div class="flex items-center gap-4 mb-3"${_scopeId}><div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5550F2] to-[#027368] shadow-lg flex items-center justify-center"${_scopeId}><span class="text-2xl"${_scopeId}>\u{1F4B0}</span></div><h1 class="text-4xl font-[&#39;Elms_Sans&#39;] font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent"${_scopeId}> Gesti\xF3n de Pagos </h1></div><p class="font-[&#39;Lato&#39;] text-gray-600 ml-18"${_scopeId}> Registro y confirmaci\xF3n de pagos de sesiones con Terapl\xED </p></div><button class="group px-8 py-4 bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white rounded-2xl hover:shadow-xl transition-all duration-300 flex items-center space-x-3 hover:scale-105 backdrop-blur-sm border border-white/20"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "heroicons:plus",
              class: "w-6 h-6 group-hover:scale-110 transition-transform duration-300"
            }, null, _parent2, _scopeId));
            _push2(`<span class="font-[&#39;Lato&#39;] font-semibold"${_scopeId}>Registrar pago</span></button></div><div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-8 mb-8 relative overflow-hidden"${_scopeId}><div class="absolute inset-0 bg-gradient-to-br from-[#5550F2]/5 via-transparent to-[#04BF9D]/5"${_scopeId}></div><div class="relative grid grid-cols-1 md:grid-cols-4 gap-6"${_scopeId}><div${_scopeId}><label class="block text-sm font-[&#39;Lato&#39;] font-semibold text-gray-700 mb-3"${_scopeId}>Estado</label><select class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5550F2]/20 focus:border-[#5550F2] bg-white/80 backdrop-blur-sm transition-all duration-300 font-[&#39;Lato&#39;] hover:bg-white shadow-sm hover:shadow-md"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "") : ssrLooseEqual(unref(filtroEstado), "")) ? " selected" : ""}${_scopeId}>Todos</option><option value="pendiente"${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "pendiente") : ssrLooseEqual(unref(filtroEstado), "pendiente")) ? " selected" : ""}${_scopeId}>Pendiente</option><option value="confirmado_paciente"${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "confirmado_paciente") : ssrLooseEqual(unref(filtroEstado), "confirmado_paciente")) ? " selected" : ""}${_scopeId}>Confirmado por paciente</option><option value="confirmado_admin"${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "confirmado_admin") : ssrLooseEqual(unref(filtroEstado), "confirmado_admin")) ? " selected" : ""}${_scopeId}>Confirmado</option><option value="rechazado"${ssrIncludeBooleanAttr(Array.isArray(unref(filtroEstado)) ? ssrLooseContain(unref(filtroEstado), "rechazado") : ssrLooseEqual(unref(filtroEstado), "rechazado")) ? " selected" : ""}${_scopeId}>Rechazado</option></select></div><div${_scopeId}><label class="block text-sm font-[&#39;Lato&#39;] font-semibold text-gray-700 mb-3"${_scopeId}>B\xFAsqueda</label><input${ssrRenderAttr("value", unref(busqueda))} type="text" placeholder="Nombre del paciente..." class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5550F2]/20 focus:border-[#5550F2] bg-white/80 backdrop-blur-sm transition-all duration-300 font-[&#39;Lato&#39;] hover:bg-white shadow-sm hover:shadow-md placeholder:text-gray-400"${_scopeId}></div><div${_scopeId}><label class="block text-sm font-medium text-[#5D4A44] mb-2"${_scopeId}>Fecha desde</label><input${ssrRenderAttr("value", unref(fechaDesde))} type="date" class="w-full px-4 py-2 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent"${_scopeId}></div><div${_scopeId}><label class="block text-sm font-medium text-[#5D4A44] mb-2"${_scopeId}>Fecha hasta</label><input${ssrRenderAttr("value", unref(fechaHasta))} type="date" class="w-full px-4 py-2 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent"${_scopeId}></div></div></div><div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] overflow-hidden"${_scopeId}><div class="overflow-x-auto"${_scopeId}><table class="w-full"${_scopeId}><thead class="bg-[#F9F7F3] border-b border-[#E8DFD8]"${_scopeId}><tr${_scopeId}><th class="px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider"${_scopeId}> Fecha </th><th class="px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider"${_scopeId}> Paciente </th><th class="px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider"${_scopeId}> Terapeuta </th><th class="px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider"${_scopeId}> Monto </th><th class="px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider"${_scopeId}> Estado </th><th class="px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider"${_scopeId}> M\xE9todo </th><th class="px-6 py-4 text-right text-xs font-medium text-[#5D4A44] uppercase tracking-wider"${_scopeId}> Acciones </th></tr></thead><tbody class="divide-y divide-[#E8DFD8]"${_scopeId}><!--[-->`);
            ssrRenderList(unref(pagosFiltrados), (pago) => {
              _push2(`<tr class="hover:bg-[#F9F7F3] transition-colors"${_scopeId}><td class="px-6 py-4 whitespace-nowrap text-sm text-[#5D4A44]"${_scopeId}>${ssrInterpolate(formatearFecha(pago.created_at))}</td><td class="px-6 py-4 whitespace-nowrap"${_scopeId}><div class="flex items-center space-x-3"${_scopeId}><div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] flex items-center justify-center flex-shrink-0"${_scopeId}><span class="text-white text-xs font-semibold"${_scopeId}>${ssrInterpolate(obtenerIniciales(pago.paciente_nombre))}</span></div><div${_scopeId}><p class="text-sm font-medium text-[#5D4A44]"${_scopeId}>${ssrInterpolate(pago.paciente_nombre)}</p></div></div></td><td class="px-6 py-4 whitespace-nowrap text-sm text-[#8B7470]"${_scopeId}>${ssrInterpolate(pago.terapeuta_nombre)}</td><td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#5D4A44]"${_scopeId}>${ssrInterpolate(formatNumber(parseFloat(pago.monto)))}</td><td class="px-6 py-4 whitespace-nowrap"${_scopeId}><span class="${ssrRenderClass([getEstadoClass(pago.estado), "px-3 py-1 rounded-full text-xs font-medium"])}"${_scopeId}>${ssrInterpolate(getEstadoTexto(pago.estado))}</span></td><td class="px-6 py-4 whitespace-nowrap text-sm text-[#8B7470]"${_scopeId}>${ssrInterpolate(pago.metodo_pago || "No especificado")}</td><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2"${_scopeId}>`);
              if (pago.estado === "pendiente") {
                _push2(`<button class="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Confirmar pago de paciente"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "heroicons:check-circle",
                  class: "w-4 h-4 inline"
                }, null, _parent2, _scopeId));
                _push2(`</button>`);
              } else {
                _push2(`<!---->`);
              }
              if (pago.estado === "confirmado_paciente") {
                _push2(`<button class="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Enviar a administraci\xF3n"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "heroicons:arrow-right-circle",
                  class: "w-4 h-4 inline"
                }, null, _parent2, _scopeId));
                _push2(`</button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<button class="px-3 py-1 bg-[#F9F7F3] text-[#5D4A44] rounded-lg hover:bg-[#E8DFD8] transition-colors" title="Ver detalles"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "heroicons:eye",
                class: "w-4 h-4 inline"
              }, null, _parent2, _scopeId));
              _push2(`</button></td></tr>`);
            });
            _push2(`<!--]--></tbody></table></div>`);
            if (unref(pagosFiltrados).length === 0) {
              _push2(`<div class="text-center py-12"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "heroicons:credit-card",
                class: "w-16 h-16 text-[#D8AFA0] mx-auto mb-4 opacity-30"
              }, null, _parent2, _scopeId));
              _push2(`<p class="text-[#8B7470] mb-4"${_scopeId}>No se encontraron pagos</p></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"${_scopeId}><div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"${_scopeId}><p class="text-sm text-blue-700 mb-1"${_scopeId}>Total pendiente</p><p class="text-3xl font-bold font-lora text-blue-900"${_scopeId}>${ssrInterpolate(formatNumber(totalPorEstado("pendiente")))}</p></div><div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"${_scopeId}><p class="text-sm text-green-700 mb-1"${_scopeId}>Confirmados hoy</p><p class="text-3xl font-bold font-lora text-green-900"${_scopeId}>${ssrInterpolate(formatNumber(unref(totalConfirmadosHoy)))}</p></div><div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"${_scopeId}><p class="text-sm text-purple-700 mb-1"${_scopeId}>Total del mes</p><p class="text-3xl font-bold font-lora text-purple-900"${_scopeId}>${ssrInterpolate(formatNumber(unref(totalDelMes)))}</p></div></div>`);
          } else {
            return [
              createVNode("div", { class: "mb-10 flex items-center justify-between" }, [
                createVNode("div", null, [
                  createVNode("div", { class: "flex items-center gap-4 mb-3" }, [
                    createVNode("div", { class: "w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5550F2] to-[#027368] shadow-lg flex items-center justify-center" }, [
                      createVNode("span", { class: "text-2xl" }, "\u{1F4B0}")
                    ]),
                    createVNode("h1", { class: "text-4xl font-['Elms_Sans'] font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent" }, " Gesti\xF3n de Pagos ")
                  ]),
                  createVNode("p", { class: "font-['Lato'] text-gray-600 ml-18" }, " Registro y confirmaci\xF3n de pagos de sesiones con Terapl\xED ")
                ]),
                createVNode("button", {
                  onClick: ($event) => mostrarModalNuevoPago.value = true,
                  class: "group px-8 py-4 bg-gradient-to-r from-[#04BF9D] to-[#027368] text-white rounded-2xl hover:shadow-xl transition-all duration-300 flex items-center space-x-3 hover:scale-105 backdrop-blur-sm border border-white/20"
                }, [
                  createVNode(_component_Icon, {
                    name: "heroicons:plus",
                    class: "w-6 h-6 group-hover:scale-110 transition-transform duration-300"
                  }),
                  createVNode("span", { class: "font-['Lato'] font-semibold" }, "Registrar pago")
                ], 8, ["onClick"])
              ]),
              createVNode("div", { class: "bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-8 mb-8 relative overflow-hidden" }, [
                createVNode("div", { class: "absolute inset-0 bg-gradient-to-br from-[#5550F2]/5 via-transparent to-[#04BF9D]/5" }),
                createVNode("div", { class: "relative grid grid-cols-1 md:grid-cols-4 gap-6" }, [
                  createVNode("div", null, [
                    createVNode("label", { class: "block text-sm font-['Lato'] font-semibold text-gray-700 mb-3" }, "Estado"),
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => isRef(filtroEstado) ? filtroEstado.value = $event : null,
                      class: "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5550F2]/20 focus:border-[#5550F2] bg-white/80 backdrop-blur-sm transition-all duration-300 font-['Lato'] hover:bg-white shadow-sm hover:shadow-md"
                    }, [
                      createVNode("option", { value: "" }, "Todos"),
                      createVNode("option", { value: "pendiente" }, "Pendiente"),
                      createVNode("option", { value: "confirmado_paciente" }, "Confirmado por paciente"),
                      createVNode("option", { value: "confirmado_admin" }, "Confirmado"),
                      createVNode("option", { value: "rechazado" }, "Rechazado")
                    ], 8, ["onUpdate:modelValue"]), [
                      [vModelSelect, unref(filtroEstado)]
                    ])
                  ]),
                  createVNode("div", null, [
                    createVNode("label", { class: "block text-sm font-['Lato'] font-semibold text-gray-700 mb-3" }, "B\xFAsqueda"),
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => isRef(busqueda) ? busqueda.value = $event : null,
                      type: "text",
                      placeholder: "Nombre del paciente...",
                      class: "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5550F2]/20 focus:border-[#5550F2] bg-white/80 backdrop-blur-sm transition-all duration-300 font-['Lato'] hover:bg-white shadow-sm hover:shadow-md placeholder:text-gray-400"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, unref(busqueda)]
                    ])
                  ]),
                  createVNode("div", null, [
                    createVNode("label", { class: "block text-sm font-medium text-[#5D4A44] mb-2" }, "Fecha desde"),
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => isRef(fechaDesde) ? fechaDesde.value = $event : null,
                      type: "date",
                      class: "w-full px-4 py-2 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, unref(fechaDesde)]
                    ])
                  ]),
                  createVNode("div", null, [
                    createVNode("label", { class: "block text-sm font-medium text-[#5D4A44] mb-2" }, "Fecha hasta"),
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => isRef(fechaHasta) ? fechaHasta.value = $event : null,
                      type: "date",
                      class: "w-full px-4 py-2 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, unref(fechaHasta)]
                    ])
                  ])
                ])
              ]),
              createVNode("div", { class: "bg-white rounded-xl shadow-md border border-[#E8DFD8] overflow-hidden" }, [
                createVNode("div", { class: "overflow-x-auto" }, [
                  createVNode("table", { class: "w-full" }, [
                    createVNode("thead", { class: "bg-[#F9F7F3] border-b border-[#E8DFD8]" }, [
                      createVNode("tr", null, [
                        createVNode("th", { class: "px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider" }, " Fecha "),
                        createVNode("th", { class: "px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider" }, " Paciente "),
                        createVNode("th", { class: "px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider" }, " Terapeuta "),
                        createVNode("th", { class: "px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider" }, " Monto "),
                        createVNode("th", { class: "px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider" }, " Estado "),
                        createVNode("th", { class: "px-6 py-4 text-left text-xs font-medium text-[#5D4A44] uppercase tracking-wider" }, " M\xE9todo "),
                        createVNode("th", { class: "px-6 py-4 text-right text-xs font-medium text-[#5D4A44] uppercase tracking-wider" }, " Acciones ")
                      ])
                    ]),
                    createVNode("tbody", { class: "divide-y divide-[#E8DFD8]" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(pagosFiltrados), (pago) => {
                        return openBlock(), createBlock("tr", {
                          key: pago.id,
                          class: "hover:bg-[#F9F7F3] transition-colors"
                        }, [
                          createVNode("td", { class: "px-6 py-4 whitespace-nowrap text-sm text-[#5D4A44]" }, toDisplayString(formatearFecha(pago.created_at)), 1),
                          createVNode("td", { class: "px-6 py-4 whitespace-nowrap" }, [
                            createVNode("div", { class: "flex items-center space-x-3" }, [
                              createVNode("div", { class: "w-8 h-8 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] flex items-center justify-center flex-shrink-0" }, [
                                createVNode("span", { class: "text-white text-xs font-semibold" }, toDisplayString(obtenerIniciales(pago.paciente_nombre)), 1)
                              ]),
                              createVNode("div", null, [
                                createVNode("p", { class: "text-sm font-medium text-[#5D4A44]" }, toDisplayString(pago.paciente_nombre), 1)
                              ])
                            ])
                          ]),
                          createVNode("td", { class: "px-6 py-4 whitespace-nowrap text-sm text-[#8B7470]" }, toDisplayString(pago.terapeuta_nombre), 1),
                          createVNode("td", { class: "px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#5D4A44]" }, toDisplayString(formatNumber(parseFloat(pago.monto))), 1),
                          createVNode("td", { class: "px-6 py-4 whitespace-nowrap" }, [
                            createVNode("span", {
                              class: ["px-3 py-1 rounded-full text-xs font-medium", getEstadoClass(pago.estado)]
                            }, toDisplayString(getEstadoTexto(pago.estado)), 3)
                          ]),
                          createVNode("td", { class: "px-6 py-4 whitespace-nowrap text-sm text-[#8B7470]" }, toDisplayString(pago.metodo_pago || "No especificado"), 1),
                          createVNode("td", { class: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2" }, [
                            pago.estado === "pendiente" ? (openBlock(), createBlock("button", {
                              key: 0,
                              onClick: ($event) => confirmarPago(pago),
                              class: "px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors",
                              title: "Confirmar pago de paciente"
                            }, [
                              createVNode(_component_Icon, {
                                name: "heroicons:check-circle",
                                class: "w-4 h-4 inline"
                              })
                            ], 8, ["onClick"])) : createCommentVNode("", true),
                            pago.estado === "confirmado_paciente" ? (openBlock(), createBlock("button", {
                              key: 1,
                              onClick: ($event) => enviarAAdministracion(),
                              class: "px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors",
                              title: "Enviar a administraci\xF3n"
                            }, [
                              createVNode(_component_Icon, {
                                name: "heroicons:arrow-right-circle",
                                class: "w-4 h-4 inline"
                              })
                            ], 8, ["onClick"])) : createCommentVNode("", true),
                            createVNode("button", {
                              onClick: ($event) => verDetalles(pago),
                              class: "px-3 py-1 bg-[#F9F7F3] text-[#5D4A44] rounded-lg hover:bg-[#E8DFD8] transition-colors",
                              title: "Ver detalles"
                            }, [
                              createVNode(_component_Icon, {
                                name: "heroicons:eye",
                                class: "w-4 h-4 inline"
                              })
                            ], 8, ["onClick"])
                          ])
                        ]);
                      }), 128))
                    ])
                  ])
                ]),
                unref(pagosFiltrados).length === 0 ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "text-center py-12"
                }, [
                  createVNode(_component_Icon, {
                    name: "heroicons:credit-card",
                    class: "w-16 h-16 text-[#D8AFA0] mx-auto mb-4 opacity-30"
                  }),
                  createVNode("p", { class: "text-[#8B7470] mb-4" }, "No se encontraron pagos")
                ])) : createCommentVNode("", true)
              ]),
              createVNode("div", { class: "mt-6 grid grid-cols-1 md:grid-cols-3 gap-6" }, [
                createVNode("div", { class: "bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200" }, [
                  createVNode("p", { class: "text-sm text-blue-700 mb-1" }, "Total pendiente"),
                  createVNode("p", { class: "text-3xl font-bold font-lora text-blue-900" }, toDisplayString(formatNumber(totalPorEstado("pendiente"))), 1)
                ]),
                createVNode("div", { class: "bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200" }, [
                  createVNode("p", { class: "text-sm text-green-700 mb-1" }, "Confirmados hoy"),
                  createVNode("p", { class: "text-3xl font-bold font-lora text-green-900" }, toDisplayString(formatNumber(unref(totalConfirmadosHoy))), 1)
                ]),
                createVNode("div", { class: "bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200" }, [
                  createVNode("p", { class: "text-sm text-purple-700 mb-1" }, "Total del mes"),
                  createVNode("p", { class: "text-3xl font-bold font-lora text-purple-900" }, toDisplayString(formatNumber(unref(totalDelMes))), 1)
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(mostrarModalNuevoPago)) {
          _push2(`<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div class="bg-white rounded-xl max-w-md w-full p-6"><h3 class="text-xl font-lora font-semibold text-[#5D4A44] mb-4"> Registrar nuevo pago </h3><p class="text-sm text-[#8B7470]">Funcionalidad en desarrollo...</p><button class="mt-4 w-full px-4 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C49484] transition-colors"> Cerrar </button></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinacion/pagos.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=pagos-BinS2ZXw.mjs.map
