import { g as useSupabaseClient, h as useSupabaseUser, _ as __nuxt_component_0 } from './server.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-CboeUkiO.mjs';
import { defineComponent, ref, computed, resolveComponent, withCtx, unref, createVNode, createTextVNode, toDisplayString, createBlock, openBlock, createCommentVNode, Fragment, renderList, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';
import 'vue-router';
import '@supabase/ssr';
import '@vercel/analytics/nuxt';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "DashboardCard",
  __ssrInlineRender: true,
  props: {
    title: {},
    count: {},
    icon: {},
    to: {},
    subtitle: {},
    badge: {},
    variant: { default: "default" }
  },
  setup(__props) {
    const props = __props;
    const colorClass = computed(() => {
      const classes = {
        default: "border-[#E8DFD8]",
        warning: "border-yellow-200",
        success: "border-green-200",
        danger: "border-red-200"
      };
      return classes[props.variant];
    });
    const iconBgClass = computed(() => {
      const classes = {
        default: "bg-gradient-to-br from-[#D8AFA0] to-[#C49484]",
        warning: "bg-gradient-to-br from-yellow-400 to-yellow-500",
        success: "bg-gradient-to-br from-green-400 to-green-500",
        danger: "bg-gradient-to-br from-red-400 to-red-500"
      };
      return classes[props.variant];
    });
    const iconColorClass = computed(() => {
      return "text-white";
    });
    const badgeClass = computed(() => {
      const classes = {
        default: "bg-blue-50 text-blue-700",
        warning: "bg-yellow-50 text-yellow-700",
        success: "bg-green-50 text-green-700",
        danger: "bg-red-50 text-red-700"
      };
      return classes[props.variant];
    });
    const badgeDotClass = computed(() => {
      const classes = {
        default: "bg-blue-500",
        warning: "bg-yellow-500",
        success: "bg-green-500",
        danger: "bg-red-500"
      };
      return classes[props.variant];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_Icon = resolveComponent("Icon");
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: __props.to,
        class: ["group block bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200", unref(colorClass)]
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-start justify-between"${_scopeId}><div class="flex-1"${_scopeId}><div class="flex items-center space-x-3 mb-3"${_scopeId}><div class="${ssrRenderClass([unref(iconBgClass), "w-12 h-12 rounded-lg flex items-center justify-center"])}"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: __props.icon,
              class: ["w-6 h-6", unref(iconColorClass)]
            }, null, _parent2, _scopeId));
            _push2(`</div><div${_scopeId}><h3 class="text-sm font-medium text-[#8B7470]"${_scopeId}>${ssrInterpolate(__props.title)}</h3><p class="text-3xl font-bold font-lora text-[#5D4A44] mt-1"${_scopeId}>${ssrInterpolate(__props.count)}</p></div></div>`);
            if (__props.subtitle) {
              _push2(`<p class="text-sm text-[#8B7470] mt-2"${_scopeId}>${ssrInterpolate(__props.subtitle)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "heroicons:arrow-right",
              class: "w-5 h-5 text-[#A89B97] opacity-0 group-hover:opacity-100 transition-opacity"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
            if (__props.badge) {
              _push2(`<div class="mt-4 pt-4 border-t border-[#E8DFD8]"${_scopeId}><span class="${ssrRenderClass([unref(badgeClass), "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"])}"${_scopeId}><span class="${ssrRenderClass([unref(badgeDotClass), "w-2 h-2 rounded-full mr-2"])}"${_scopeId}></span> ${ssrInterpolate(__props.badge)}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", { class: "flex items-start justify-between" }, [
                createVNode("div", { class: "flex-1" }, [
                  createVNode("div", { class: "flex items-center space-x-3 mb-3" }, [
                    createVNode("div", {
                      class: ["w-12 h-12 rounded-lg flex items-center justify-center", unref(iconBgClass)]
                    }, [
                      createVNode(_component_Icon, {
                        name: __props.icon,
                        class: ["w-6 h-6", unref(iconColorClass)]
                      }, null, 8, ["name", "class"])
                    ], 2),
                    createVNode("div", null, [
                      createVNode("h3", { class: "text-sm font-medium text-[#8B7470]" }, toDisplayString(__props.title), 1),
                      createVNode("p", { class: "text-3xl font-bold font-lora text-[#5D4A44] mt-1" }, toDisplayString(__props.count), 1)
                    ])
                  ]),
                  __props.subtitle ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-sm text-[#8B7470] mt-2"
                  }, toDisplayString(__props.subtitle), 1)) : createCommentVNode("", true)
                ]),
                createVNode(_component_Icon, {
                  name: "heroicons:arrow-right",
                  class: "w-5 h-5 text-[#A89B97] opacity-0 group-hover:opacity-100 transition-opacity"
                })
              ]),
              __props.badge ? (openBlock(), createBlock("div", {
                key: 0,
                class: "mt-4 pt-4 border-t border-[#E8DFD8]"
              }, [
                createVNode("span", {
                  class: ["inline-flex items-center px-3 py-1 rounded-full text-xs font-medium", unref(badgeClass)]
                }, [
                  createVNode("span", {
                    class: ["w-2 h-2 rounded-full mr-2", unref(badgeDotClass)]
                  }, null, 2),
                  createTextVNode(" " + toDisplayString(__props.badge), 1)
                ], 2)
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/coordinacion/DashboardCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const DashboardCard = Object.assign(_sfc_main$1, { __name: "CoordinacionDashboardCard" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dashboard",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    useSupabaseUser();
    const sesionesHoy = ref([]);
    const pagosPendientes = ref([]);
    const pagosRecientes = ref([]);
    const mensajesNoVistos = ref(0);
    const recordatoriosPendientes = ref(0);
    ref(true);
    const fechaActual = computed(() => {
      const hoy = /* @__PURE__ */ new Date();
      return hoy.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    });
    const sesionesConfirmadas = computed(() => {
      return sesionesHoy.value.filter((s) => s.estado === "confirmada").length;
    });
    const proximaSesion = computed(() => {
      if (sesionesHoy.value.length === 0) return "---";
      const proxima = sesionesHoy.value[0];
      return formatearHora(proxima.fecha);
    });
    const totalPendiente = computed(() => {
      return pagosPendientes.value.reduce((sum, p) => sum + parseFloat(p.monto), 0);
    });
    const formatearHora = (fecha) => {
      return new Date(fecha).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const formatearFechaCorta = (fecha) => {
      return new Date(fecha).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short"
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
        "confirmada": "bg-green-100 text-green-700",
        "pendiente": "bg-yellow-100 text-yellow-700",
        "cancelada": "bg-red-100 text-red-700",
        "completada": "bg-blue-100 text-blue-700"
      };
      return classes[estado] || "bg-gray-100 text-gray-700";
    };
    const getPagoEstadoClass = (estado) => {
      const classes = {
        "pendiente": "bg-yellow-100 text-yellow-700",
        "confirmado_paciente": "bg-blue-100 text-blue-700",
        "confirmado_admin": "bg-green-100 text-green-700",
        "rechazado": "bg-red-100 text-red-700"
      };
      return classes[estado] || "bg-gray-100 text-gray-700";
    };
    const abrirWhatsApp = (telefono) => {
      const numero = telefono.replace(/\D/g, "");
      (void 0).open(`https://wa.me/${numero}`, "_blank");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLayout = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_Icon = resolveComponent("Icon");
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-833d468f>`);
      _push(ssrRenderComponent(_component_NuxtLayout, { name: "coordinacion" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="mb-8" data-v-833d468f${_scopeId}><h1 class="text-3xl font-lora font-bold text-[#5D4A44] mb-2" data-v-833d468f${_scopeId}> Dashboard de Coordinaci\xF3n </h1><p class="text-[#8B7470]" data-v-833d468f${_scopeId}>${ssrInterpolate(unref(fechaActual))} \xB7 Resumen general del d\xEDa </p></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-v-833d468f${_scopeId}>`);
            _push2(ssrRenderComponent(DashboardCard, {
              title: "Sesiones de hoy",
              count: unref(sesionesHoy).length,
              icon: "heroicons:calendar",
              to: "/coordinacion/agenda",
              subtitle: `${unref(sesionesConfirmadas)} confirmadas`,
              badge: unref(sesionesHoy).length > 0 ? `Pr\xF3xima: ${unref(proximaSesion)}` : "Sin sesiones",
              variant: unref(sesionesHoy).length > 0 ? "success" : "default"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(DashboardCard, {
              title: "Pagos pendientes",
              count: unref(pagosPendientes).length,
              icon: "heroicons:credit-card",
              to: "/coordinacion/pagos",
              subtitle: `$${unref(totalPendiente).toFixed(2)} en total`,
              badge: unref(pagosPendientes).length > 0 ? "Requiere atenci\xF3n" : "Todo al d\xEDa",
              variant: unref(pagosPendientes).length > 0 ? "warning" : "success"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(DashboardCard, {
              title: "Mensajes nuevos",
              count: unref(mensajesNoVistos),
              icon: "heroicons:chat-bubble-left-right",
              to: "/coordinacion/mensajes",
              subtitle: "De pacientes",
              badge: unref(mensajesNoVistos) > 0 ? "Responder pronto" : "Sin pendientes",
              variant: unref(mensajesNoVistos) > 5 ? "danger" : "default"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(DashboardCard, {
              title: "Recordatorios",
              count: unref(recordatoriosPendientes),
              icon: "heroicons:bell-alert",
              to: "/coordinacion/agenda",
              subtitle: "Programados para hoy",
              badge: "Autom\xE1ticos",
              variant: "default"
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6 mb-8" data-v-833d468f${_scopeId}><div class="flex items-center justify-between mb-6" data-v-833d468f${_scopeId}><h2 class="text-xl font-lora font-semibold text-[#5D4A44]" data-v-833d468f${_scopeId}> Sesiones de hoy </h2>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/coordinacion/agenda",
              class: "text-sm text-[#D8AFA0] hover:text-[#C49484] font-medium flex items-center space-x-1"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<span data-v-833d468f${_scopeId2}>Ver calendario completo</span>`);
                  _push3(ssrRenderComponent(_component_Icon, {
                    name: "heroicons:arrow-right",
                    class: "w-4 h-4"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode("span", null, "Ver calendario completo"),
                    createVNode(_component_Icon, {
                      name: "heroicons:arrow-right",
                      class: "w-4 h-4"
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            if (unref(sesionesHoy).length > 0) {
              _push2(`<div class="space-y-3" data-v-833d468f${_scopeId}><!--[-->`);
              ssrRenderList(unref(sesionesHoy).slice(0, 5), (sesion) => {
                _push2(`<div class="flex items-center justify-between p-4 bg-[#F9F7F3] rounded-lg hover:bg-[#E8DFD8] transition-colors" data-v-833d468f${_scopeId}><div class="flex items-center space-x-4 flex-1" data-v-833d468f${_scopeId}><div class="text-center min-w-[60px]" data-v-833d468f${_scopeId}><p class="text-sm font-medium text-[#5D4A44]" data-v-833d468f${_scopeId}>${ssrInterpolate(formatearHora(sesion.fecha))}</p><p class="text-xs text-[#8B7470]" data-v-833d468f${_scopeId}>${ssrInterpolate(sesion.modalidad)}</p></div><div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] flex items-center justify-center flex-shrink-0" data-v-833d468f${_scopeId}><span class="text-white text-sm font-semibold" data-v-833d468f${_scopeId}>${ssrInterpolate(obtenerIniciales(sesion.paciente_nombre))}</span></div><div class="flex-1" data-v-833d468f${_scopeId}><p class="font-medium text-[#5D4A44]" data-v-833d468f${_scopeId}>${ssrInterpolate(sesion.paciente_nombre)}</p><p class="text-sm text-[#8B7470]" data-v-833d468f${_scopeId}>Con ${ssrInterpolate(sesion.terapeuta_nombre)}</p></div><div class="flex items-center space-x-2" data-v-833d468f${_scopeId}><span class="${ssrRenderClass([getEstadoClass(sesion.estado), "px-3 py-1 rounded-full text-xs font-medium"])}" data-v-833d468f${_scopeId}>${ssrInterpolate(sesion.estado)}</span>`);
                if (sesion.paciente_telefono) {
                  _push2(`<button class="p-2 rounded-lg hover:bg-green-50 transition-colors group" title="Enviar WhatsApp" data-v-833d468f${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_Icon, {
                    name: "heroicons:chat-bubble-oval-left-ellipsis",
                    class: "w-5 h-5 text-green-600 group-hover:scale-110 transition-transform"
                  }, null, _parent2, _scopeId));
                  _push2(`</button>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div></div>`);
              });
              _push2(`<!--]-->`);
              if (unref(sesionesHoy).length > 5) {
                _push2(`<div class="text-center pt-3" data-v-833d468f${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: "/coordinacion/agenda",
                  class: "text-sm text-[#D8AFA0] hover:text-[#C49484] font-medium"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Ver todas las ${ssrInterpolate(unref(sesionesHoy).length)} sesiones \u2192 `);
                    } else {
                      return [
                        createTextVNode(" Ver todas las " + toDisplayString(unref(sesionesHoy).length) + " sesiones \u2192 ", 1)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<div class="text-center py-12" data-v-833d468f${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "heroicons:calendar-days",
                class: "w-16 h-16 text-[#D8AFA0] mx-auto mb-4 opacity-30"
              }, null, _parent2, _scopeId));
              _push2(`<p class="text-[#8B7470] mb-4" data-v-833d468f${_scopeId}>No hay sesiones programadas para hoy</p>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/coordinacion/agenda",
                class: "inline-flex items-center px-4 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C49484] transition-colors"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_Icon, {
                      name: "heroicons:plus",
                      class: "w-4 h-4 mr-2"
                    }, null, _parent3, _scopeId2));
                    _push3(` Programar sesi\xF3n `);
                  } else {
                    return [
                      createVNode(_component_Icon, {
                        name: "heroicons:plus",
                        class: "w-4 h-4 mr-2"
                      }),
                      createTextVNode(" Programar sesi\xF3n ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            }
            _push2(`</div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6" data-v-833d468f${_scopeId}><div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6" data-v-833d468f${_scopeId}><div class="flex items-center justify-between mb-6" data-v-833d468f${_scopeId}><h2 class="text-xl font-lora font-semibold text-[#5D4A44]" data-v-833d468f${_scopeId}> Pagos recientes </h2>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/coordinacion/pagos",
              class: "text-sm text-[#D8AFA0] hover:text-[#C49484] font-medium flex items-center space-x-1"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<span data-v-833d468f${_scopeId2}>Ver todos</span>`);
                  _push3(ssrRenderComponent(_component_Icon, {
                    name: "heroicons:arrow-right",
                    class: "w-4 h-4"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode("span", null, "Ver todos"),
                    createVNode(_component_Icon, {
                      name: "heroicons:arrow-right",
                      class: "w-4 h-4"
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            if (unref(pagosRecientes).length > 0) {
              _push2(`<div class="space-y-3" data-v-833d468f${_scopeId}><!--[-->`);
              ssrRenderList(unref(pagosRecientes).slice(0, 4), (pago) => {
                _push2(`<div class="flex items-center justify-between p-3 bg-[#F9F7F3] rounded-lg" data-v-833d468f${_scopeId}><div class="flex-1" data-v-833d468f${_scopeId}><p class="font-medium text-[#5D4A44] text-sm" data-v-833d468f${_scopeId}>${ssrInterpolate(pago.paciente_nombre)}</p><p class="text-xs text-[#8B7470]" data-v-833d468f${_scopeId}>${ssrInterpolate(formatearFechaCorta(pago.created_at))}</p></div><div class="text-right" data-v-833d468f${_scopeId}><p class="font-semibold text-[#5D4A44]" data-v-833d468f${_scopeId}>${ssrInterpolate(formatNumber(parseFloat(pago.monto)))}</p><span class="${ssrRenderClass([getPagoEstadoClass(pago.estado), "text-xs px-2 py-1 rounded-full"])}" data-v-833d468f${_scopeId}>${ssrInterpolate(pago.estado)}</span></div></div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<div class="text-center py-8 text-[#8B7470]" data-v-833d468f${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "heroicons:credit-card",
                class: "w-12 h-12 mx-auto mb-2 opacity-30"
              }, null, _parent2, _scopeId));
              _push2(`<p class="text-sm" data-v-833d468f${_scopeId}>No hay pagos recientes</p></div>`);
            }
            _push2(`</div><div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6" data-v-833d468f${_scopeId}><h2 class="text-xl font-lora font-semibold text-[#5D4A44] mb-6" data-v-833d468f${_scopeId}> Acciones r\xE1pidas </h2><div class="space-y-3" data-v-833d468f${_scopeId}><button class="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-[#D8AFA0] to-[#C49484] text-white rounded-lg hover:shadow-lg transition-all" data-v-833d468f${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "heroicons:plus-circle",
              class: "w-6 h-6"
            }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-833d468f${_scopeId}>Programar nueva sesi\xF3n</span></button><button class="w-full flex items-center space-x-3 p-4 bg-white border-2 border-[#D8AFA0] text-[#5D4A44] rounded-lg hover:bg-[#F9F7F3] transition-all" data-v-833d468f${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "heroicons:chat-bubble-left",
              class: "w-6 h-6 text-[#D8AFA0]"
            }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-833d468f${_scopeId}>Enviar mensaje</span></button><button class="w-full flex items-center space-x-3 p-4 bg-white border-2 border-[#D8AFA0] text-[#5D4A44] rounded-lg hover:bg-[#F9F7F3] transition-all" data-v-833d468f${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "heroicons:banknotes",
              class: "w-6 h-6 text-[#D8AFA0]"
            }, null, _parent2, _scopeId));
            _push2(`<span class="font-medium" data-v-833d468f${_scopeId}>Registrar pago</span></button></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "mb-8" }, [
                createVNode("h1", { class: "text-3xl font-lora font-bold text-[#5D4A44] mb-2" }, " Dashboard de Coordinaci\xF3n "),
                createVNode("p", { class: "text-[#8B7470]" }, toDisplayString(unref(fechaActual)) + " \xB7 Resumen general del d\xEDa ", 1)
              ]),
              createVNode("div", { class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" }, [
                createVNode(DashboardCard, {
                  title: "Sesiones de hoy",
                  count: unref(sesionesHoy).length,
                  icon: "heroicons:calendar",
                  to: "/coordinacion/agenda",
                  subtitle: `${unref(sesionesConfirmadas)} confirmadas`,
                  badge: unref(sesionesHoy).length > 0 ? `Pr\xF3xima: ${unref(proximaSesion)}` : "Sin sesiones",
                  variant: unref(sesionesHoy).length > 0 ? "success" : "default"
                }, null, 8, ["count", "subtitle", "badge", "variant"]),
                createVNode(DashboardCard, {
                  title: "Pagos pendientes",
                  count: unref(pagosPendientes).length,
                  icon: "heroicons:credit-card",
                  to: "/coordinacion/pagos",
                  subtitle: `$${unref(totalPendiente).toFixed(2)} en total`,
                  badge: unref(pagosPendientes).length > 0 ? "Requiere atenci\xF3n" : "Todo al d\xEDa",
                  variant: unref(pagosPendientes).length > 0 ? "warning" : "success"
                }, null, 8, ["count", "subtitle", "badge", "variant"]),
                createVNode(DashboardCard, {
                  title: "Mensajes nuevos",
                  count: unref(mensajesNoVistos),
                  icon: "heroicons:chat-bubble-left-right",
                  to: "/coordinacion/mensajes",
                  subtitle: "De pacientes",
                  badge: unref(mensajesNoVistos) > 0 ? "Responder pronto" : "Sin pendientes",
                  variant: unref(mensajesNoVistos) > 5 ? "danger" : "default"
                }, null, 8, ["count", "badge", "variant"]),
                createVNode(DashboardCard, {
                  title: "Recordatorios",
                  count: unref(recordatoriosPendientes),
                  icon: "heroicons:bell-alert",
                  to: "/coordinacion/agenda",
                  subtitle: "Programados para hoy",
                  badge: "Autom\xE1ticos",
                  variant: "default"
                }, null, 8, ["count"])
              ]),
              createVNode("div", { class: "bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6 mb-8" }, [
                createVNode("div", { class: "flex items-center justify-between mb-6" }, [
                  createVNode("h2", { class: "text-xl font-lora font-semibold text-[#5D4A44]" }, " Sesiones de hoy "),
                  createVNode(_component_NuxtLink, {
                    to: "/coordinacion/agenda",
                    class: "text-sm text-[#D8AFA0] hover:text-[#C49484] font-medium flex items-center space-x-1"
                  }, {
                    default: withCtx(() => [
                      createVNode("span", null, "Ver calendario completo"),
                      createVNode(_component_Icon, {
                        name: "heroicons:arrow-right",
                        class: "w-4 h-4"
                      })
                    ]),
                    _: 1
                  })
                ]),
                unref(sesionesHoy).length > 0 ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "space-y-3"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(sesionesHoy).slice(0, 5), (sesion) => {
                    return openBlock(), createBlock("div", {
                      key: sesion.id,
                      class: "flex items-center justify-between p-4 bg-[#F9F7F3] rounded-lg hover:bg-[#E8DFD8] transition-colors"
                    }, [
                      createVNode("div", { class: "flex items-center space-x-4 flex-1" }, [
                        createVNode("div", { class: "text-center min-w-[60px]" }, [
                          createVNode("p", { class: "text-sm font-medium text-[#5D4A44]" }, toDisplayString(formatearHora(sesion.fecha)), 1),
                          createVNode("p", { class: "text-xs text-[#8B7470]" }, toDisplayString(sesion.modalidad), 1)
                        ]),
                        createVNode("div", { class: "w-10 h-10 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] flex items-center justify-center flex-shrink-0" }, [
                          createVNode("span", { class: "text-white text-sm font-semibold" }, toDisplayString(obtenerIniciales(sesion.paciente_nombre)), 1)
                        ]),
                        createVNode("div", { class: "flex-1" }, [
                          createVNode("p", { class: "font-medium text-[#5D4A44]" }, toDisplayString(sesion.paciente_nombre), 1),
                          createVNode("p", { class: "text-sm text-[#8B7470]" }, "Con " + toDisplayString(sesion.terapeuta_nombre), 1)
                        ]),
                        createVNode("div", { class: "flex items-center space-x-2" }, [
                          createVNode("span", {
                            class: ["px-3 py-1 rounded-full text-xs font-medium", getEstadoClass(sesion.estado)]
                          }, toDisplayString(sesion.estado), 3),
                          sesion.paciente_telefono ? (openBlock(), createBlock("button", {
                            key: 0,
                            onClick: ($event) => abrirWhatsApp(sesion.paciente_telefono),
                            class: "p-2 rounded-lg hover:bg-green-50 transition-colors group",
                            title: "Enviar WhatsApp"
                          }, [
                            createVNode(_component_Icon, {
                              name: "heroicons:chat-bubble-oval-left-ellipsis",
                              class: "w-5 h-5 text-green-600 group-hover:scale-110 transition-transform"
                            })
                          ], 8, ["onClick"])) : createCommentVNode("", true)
                        ])
                      ])
                    ]);
                  }), 128)),
                  unref(sesionesHoy).length > 5 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "text-center pt-3"
                  }, [
                    createVNode(_component_NuxtLink, {
                      to: "/coordinacion/agenda",
                      class: "text-sm text-[#D8AFA0] hover:text-[#C49484] font-medium"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Ver todas las " + toDisplayString(unref(sesionesHoy).length) + " sesiones \u2192 ", 1)
                      ]),
                      _: 1
                    })
                  ])) : createCommentVNode("", true)
                ])) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "text-center py-12"
                }, [
                  createVNode(_component_Icon, {
                    name: "heroicons:calendar-days",
                    class: "w-16 h-16 text-[#D8AFA0] mx-auto mb-4 opacity-30"
                  }),
                  createVNode("p", { class: "text-[#8B7470] mb-4" }, "No hay sesiones programadas para hoy"),
                  createVNode(_component_NuxtLink, {
                    to: "/coordinacion/agenda",
                    class: "inline-flex items-center px-4 py-2 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C49484] transition-colors"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_Icon, {
                        name: "heroicons:plus",
                        class: "w-4 h-4 mr-2"
                      }),
                      createTextVNode(" Programar sesi\xF3n ")
                    ]),
                    _: 1
                  })
                ]))
              ]),
              createVNode("div", { class: "grid grid-cols-1 lg:grid-cols-2 gap-6" }, [
                createVNode("div", { class: "bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6" }, [
                  createVNode("div", { class: "flex items-center justify-between mb-6" }, [
                    createVNode("h2", { class: "text-xl font-lora font-semibold text-[#5D4A44]" }, " Pagos recientes "),
                    createVNode(_component_NuxtLink, {
                      to: "/coordinacion/pagos",
                      class: "text-sm text-[#D8AFA0] hover:text-[#C49484] font-medium flex items-center space-x-1"
                    }, {
                      default: withCtx(() => [
                        createVNode("span", null, "Ver todos"),
                        createVNode(_component_Icon, {
                          name: "heroicons:arrow-right",
                          class: "w-4 h-4"
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  unref(pagosRecientes).length > 0 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "space-y-3"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(pagosRecientes).slice(0, 4), (pago) => {
                      return openBlock(), createBlock("div", {
                        key: pago.id,
                        class: "flex items-center justify-between p-3 bg-[#F9F7F3] rounded-lg"
                      }, [
                        createVNode("div", { class: "flex-1" }, [
                          createVNode("p", { class: "font-medium text-[#5D4A44] text-sm" }, toDisplayString(pago.paciente_nombre), 1),
                          createVNode("p", { class: "text-xs text-[#8B7470]" }, toDisplayString(formatearFechaCorta(pago.created_at)), 1)
                        ]),
                        createVNode("div", { class: "text-right" }, [
                          createVNode("p", { class: "font-semibold text-[#5D4A44]" }, toDisplayString(formatNumber(parseFloat(pago.monto))), 1),
                          createVNode("span", {
                            class: ["text-xs px-2 py-1 rounded-full", getPagoEstadoClass(pago.estado)]
                          }, toDisplayString(pago.estado), 3)
                        ])
                      ]);
                    }), 128))
                  ])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "text-center py-8 text-[#8B7470]"
                  }, [
                    createVNode(_component_Icon, {
                      name: "heroicons:credit-card",
                      class: "w-12 h-12 mx-auto mb-2 opacity-30"
                    }),
                    createVNode("p", { class: "text-sm" }, "No hay pagos recientes")
                  ]))
                ]),
                createVNode("div", { class: "bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6" }, [
                  createVNode("h2", { class: "text-xl font-lora font-semibold text-[#5D4A44] mb-6" }, " Acciones r\xE1pidas "),
                  createVNode("div", { class: "space-y-3" }, [
                    createVNode("button", {
                      onClick: ($event) => _ctx.$router.push("/coordinacion/agenda?action=nueva-sesion"),
                      class: "w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-[#D8AFA0] to-[#C49484] text-white rounded-lg hover:shadow-lg transition-all"
                    }, [
                      createVNode(_component_Icon, {
                        name: "heroicons:plus-circle",
                        class: "w-6 h-6"
                      }),
                      createVNode("span", { class: "font-medium" }, "Programar nueva sesi\xF3n")
                    ], 8, ["onClick"]),
                    createVNode("button", {
                      onClick: ($event) => _ctx.$router.push("/coordinacion/mensajes?action=nuevo-mensaje"),
                      class: "w-full flex items-center space-x-3 p-4 bg-white border-2 border-[#D8AFA0] text-[#5D4A44] rounded-lg hover:bg-[#F9F7F3] transition-all"
                    }, [
                      createVNode(_component_Icon, {
                        name: "heroicons:chat-bubble-left",
                        class: "w-6 h-6 text-[#D8AFA0]"
                      }),
                      createVNode("span", { class: "font-medium" }, "Enviar mensaje")
                    ], 8, ["onClick"]),
                    createVNode("button", {
                      onClick: ($event) => _ctx.$router.push("/coordinacion/pagos?action=registrar-pago"),
                      class: "w-full flex items-center space-x-3 p-4 bg-white border-2 border-[#D8AFA0] text-[#5D4A44] rounded-lg hover:bg-[#F9F7F3] transition-all"
                    }, [
                      createVNode(_component_Icon, {
                        name: "heroicons:banknotes",
                        class: "w-6 h-6 text-[#D8AFA0]"
                      }),
                      createVNode("span", { class: "font-medium" }, "Registrar pago")
                    ], 8, ["onClick"])
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinacion/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const dashboard = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-833d468f"]]);

export { dashboard as default };
//# sourceMappingURL=dashboard-D-NFQHXu.mjs.map
