import { g as useSupabaseClient, _ as __nuxt_component_0 } from './server.mjs';
import { _ as __nuxt_component_2 } from './ModalNuevaCita-C_vZiTWN.mjs';
import { defineComponent, ref, watch, withCtx, unref, createVNode, createBlock, withDirectives, isRef, openBlock, Fragment, renderList, toDisplayString, vModelSelect, createTextVNode, vModelText, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useCitas } from './useCitas-qKbOQyT7.mjs';
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
import '@heroicons/vue/24/outline';
import './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "agenda",
  __ssrInlineRender: true,
  setup(__props) {
    const { getCitasPorDia } = useCitas();
    const supabase = useSupabaseClient();
    const vistaActual = ref("dia");
    const fechaSeleccionada = ref(formatearFecha(/* @__PURE__ */ new Date()));
    const terapeutaFiltro = ref("");
    const cargando = ref(false);
    const citasDelDia = ref([]);
    const terapeutas = ref([]);
    ref(null);
    const modalNuevaCitaAbierto = ref(false);
    const fechaModalCita = ref("");
    const horaModalCita = ref("");
    const vistas = [
      { id: "dia", nombre: "D\xEDa", icono: "\u{1F4C5}" },
      { id: "semana", nombre: "Semana", icono: "\u{1F4C6}" },
      { id: "mes", nombre: "Mes", icono: "\u{1F5D3}\uFE0F" }
    ];
    async function cargarCitasDelDia() {
      cargando.value = true;
      try {
        if (terapeutaFiltro.value) {
          citasDelDia.value = await getCitasPorDia(fechaSeleccionada.value, terapeutaFiltro.value);
        } else {
          const { data, error } = await supabase.from("vista_agenda_terapeutas").select("*").eq("fecha_cita", fechaSeleccionada.value).neq("estado", "cancelada").order("hora_inicio", { ascending: true });
          if (error) {
            console.error("Error al cargar citas:", error);
            citasDelDia.value = [];
          } else {
            citasDelDia.value = data || [];
          }
        }
      } finally {
        cargando.value = false;
      }
    }
    function cargarCitasSegunVista() {
      if (vistaActual.value === "dia") {
        cargarCitasDelDia();
      }
    }
    function cambiarDia(direccion) {
      const fecha = new Date(fechaSeleccionada.value);
      fecha.setDate(fecha.getDate() + direccion);
      fechaSeleccionada.value = formatearFecha(fecha);
      cargarCitasDelDia();
    }
    function irHoy() {
      fechaSeleccionada.value = formatearFecha(/* @__PURE__ */ new Date());
      cargarCitasDelDia();
    }
    function abrirModalNuevaCita(fecha) {
      fechaModalCita.value = fechaSeleccionada.value;
      modalNuevaCitaAbierto.value = true;
    }
    function cerrarModalNuevaCita() {
      modalNuevaCitaAbierto.value = false;
      fechaModalCita.value = "";
    }
    function onCitaCreada() {
      cargarCitasDelDia();
    }
    function formatearFecha(fecha) {
      return fecha.toISOString().split("T")[0] || "";
    }
    function formatearFechaLegible(fecha) {
      const date = /* @__PURE__ */ new Date(fecha + "T00:00:00");
      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
      ];
      return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
    }
    function obtenerIconoTipo(tipo) {
      const iconos = {
        presencial: "\u{1F3E5}",
        online: "\u{1F4BB}",
        telefonica: "\u{1F4DE}"
      };
      return iconos[tipo] || "\u{1F4C5}";
    }
    function obtenerColorEstado(estado) {
      const colores = {
        confirmada: "border-green-400",
        pendiente: "border-yellow-400",
        cancelada: "border-red-400",
        realizada: "border-blue-400"
      };
      return colores[estado] || "border-gray-400";
    }
    function obtenerEstiloEstado(estado) {
      const estilos = {
        confirmada: "bg-green-100 text-green-700",
        pendiente: "bg-yellow-100 text-yellow-700",
        cancelada: "bg-red-100 text-red-700",
        realizada: "bg-blue-100 text-blue-700"
      };
      return estilos[estado] || "bg-gray-100 text-gray-700";
    }
    watch([vistaActual, fechaSeleccionada, terapeutaFiltro], () => {
      cargarCitasSegunVista();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLayout = __nuxt_component_0;
      const _component_ModalNuevaCita = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_NuxtLayout, { name: "coordinacion" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="mb-8"${_scopeId}><h1 class="text-4xl font-serif font-bold text-cafe mb-2"${_scopeId}> Agenda Global </h1><p class="text-lg text-cafe/70"${_scopeId}> Gesti\xF3n y coordinaci\xF3n de todas las sesiones de terapeutas </p></div><div class="mb-6 flex flex-wrap gap-3"${_scopeId}><select class="px-4 py-2 rounded-lg border border-[#EAD5D3]/40 bg-white text-cafe focus:ring-2 focus:ring-terracota focus:border-transparent"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(terapeutaFiltro)) ? ssrLooseContain(unref(terapeutaFiltro), "") : ssrLooseEqual(unref(terapeutaFiltro), "")) ? " selected" : ""}${_scopeId}>Todos los terapeutas</option><!--[-->`);
            ssrRenderList(unref(terapeutas), (terapeuta) => {
              _push2(`<option${ssrRenderAttr("value", terapeuta.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(terapeutaFiltro)) ? ssrLooseContain(unref(terapeutaFiltro), terapeuta.id) : ssrLooseEqual(unref(terapeutaFiltro), terapeuta.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(terapeuta.nombre_completo)}</option>`);
            });
            _push2(`<!--]--></select><!--[-->`);
            ssrRenderList(vistas, (vista) => {
              _push2(`<button class="${ssrRenderClass([
                "px-5 py-2.5 rounded-lg font-medium transition-all",
                unref(vistaActual) === vista.id ? "bg-terracota text-white shadow-md" : "bg-white text-cafe hover:bg-terracota/10 border border-[#EAD5D3]/40"
              ])}"${_scopeId}><span class="mr-2"${_scopeId}>${ssrInterpolate(vista.icono)}</span> ${ssrInterpolate(vista.nombre)}</button>`);
            });
            _push2(`<!--]--><button class="ml-auto px-5 py-2.5 rounded-lg font-medium bg-gradient-to-r from-terracota to-rosa text-white hover:from-terracota/90 hover:to-rosa/90 shadow-md transition-all"${_scopeId}><span class="mr-2"${_scopeId}>+</span> Nueva Cita </button></div>`);
            if (unref(vistaActual) === "dia") {
              _push2(`<div class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-6"${_scopeId}><div class="mb-6 flex items-center gap-4"${_scopeId}><button class="p-2 hover:bg-terracota/10 rounded-lg transition-colors"${_scopeId}> \u2190 Anterior </button><input${ssrRenderAttr("value", unref(fechaSeleccionada))} type="date" class="flex-1 px-4 py-2 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20"${_scopeId}><button class="px-4 py-2 bg-terracota/10 text-terracota rounded-lg hover:bg-terracota/20 transition-colors font-medium"${_scopeId}> Hoy </button><button class="p-2 hover:bg-terracota/10 rounded-lg transition-colors"${_scopeId}> Siguiente \u2192 </button></div><div class="mb-6"${_scopeId}><h2 class="text-2xl font-serif font-semibold text-cafe mb-1"${_scopeId}>${ssrInterpolate(formatearFechaLegible(unref(fechaSeleccionada)))}</h2><p class="text-cafe/60"${_scopeId}>${ssrInterpolate(unref(citasDelDia).length)} cita${ssrInterpolate(unref(citasDelDia).length !== 1 ? "s" : "")} programada${ssrInterpolate(unref(citasDelDia).length !== 1 ? "s" : "")}</p></div>`);
              if (unref(cargando)) {
                _push2(`<div class="text-center py-12"${_scopeId}><div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-terracota"${_scopeId}></div></div>`);
              } else if (unref(citasDelDia).length === 0) {
                _push2(`<div class="text-center py-12"${_scopeId}><span class="text-6xl mb-4 block"${_scopeId}>\u{1F4C5}</span><p class="text-lg text-cafe font-medium mb-2"${_scopeId}>Sin citas programadas</p><p class="text-cafe/60"${_scopeId}>No hay citas para ${ssrInterpolate(formatearFechaLegible(unref(fechaSeleccionada)))}</p></div>`);
              } else {
                _push2(`<div class="space-y-4"${_scopeId}><!--[-->`);
                ssrRenderList(unref(citasDelDia), (cita) => {
                  _push2(`<div class="${ssrRenderClass([obtenerColorEstado(cita.estado), "bg-gradient-to-r from-base-bg to-white rounded-lg p-5 border-l-4 hover:shadow-md transition-all"])}"${_scopeId}><div class="flex items-start justify-between"${_scopeId}><div class="flex-1"${_scopeId}><div class="flex items-center gap-3 mb-2"${_scopeId}><span class="text-3xl"${_scopeId}>${ssrInterpolate(obtenerIconoTipo(cita.modalidad))}</span><div${_scopeId}><h3 class="text-lg font-semibold text-cafe"${_scopeId}>${ssrInterpolate(cita.paciente_nombre)}</h3><p class="text-sm text-cafe/60"${_scopeId}>${ssrInterpolate(cita.hora_inicio)} - ${ssrInterpolate(cita.hora_fin)} \xB7 ${ssrInterpolate(cita.terapeuta_nombre)}</p></div></div>`);
                  if (cita.observaciones) {
                    _push2(`<div class="mt-3 p-3 bg-white/50 rounded-lg"${_scopeId}><p class="text-sm text-cafe/70"${_scopeId}><span class="font-medium"${_scopeId}>Notas:</span> ${ssrInterpolate(cita.observaciones)}</p></div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div><div class="flex flex-col gap-2"${_scopeId}><span class="${ssrRenderClass([
                    "px-3 py-1 rounded-full text-xs font-medium",
                    obtenerEstiloEstado(cita.estado)
                  ])}"${_scopeId}>${ssrInterpolate(cita.estado)}</span></div></div></div>`);
                });
                _push2(`<!--]--></div>`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<div class="bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-6"${_scopeId}><div class="text-center py-12"${_scopeId}><span class="text-6xl mb-4 block"${_scopeId}>\u{1F5D3}\uFE0F</span><p class="text-lg text-cafe font-medium mb-2"${_scopeId}>Vista en desarrollo</p><p class="text-cafe/60"${_scopeId}>La vista ${ssrInterpolate(unref(vistaActual))} estar\xE1 disponible pronto</p></div></div>`);
            }
            _push2(ssrRenderComponent(_component_ModalNuevaCita, {
              mostrar: unref(modalNuevaCitaAbierto),
              "fecha-preseleccionada": unref(fechaModalCita),
              "hora-preseleccionada": unref(horaModalCita),
              onCerrar: cerrarModalNuevaCita,
              onCitaCreada
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "mb-8" }, [
                createVNode("h1", { class: "text-4xl font-serif font-bold text-cafe mb-2" }, " Agenda Global "),
                createVNode("p", { class: "text-lg text-cafe/70" }, " Gesti\xF3n y coordinaci\xF3n de todas las sesiones de terapeutas ")
              ]),
              createVNode("div", { class: "mb-6 flex flex-wrap gap-3" }, [
                withDirectives(createVNode("select", {
                  "onUpdate:modelValue": ($event) => isRef(terapeutaFiltro) ? terapeutaFiltro.value = $event : null,
                  class: "px-4 py-2 rounded-lg border border-[#EAD5D3]/40 bg-white text-cafe focus:ring-2 focus:ring-terracota focus:border-transparent",
                  onChange: cargarCitasSegunVista
                }, [
                  createVNode("option", { value: "" }, "Todos los terapeutas"),
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(terapeutas), (terapeuta) => {
                    return openBlock(), createBlock("option", {
                      key: terapeuta.id,
                      value: terapeuta.id
                    }, toDisplayString(terapeuta.nombre_completo), 9, ["value"]);
                  }), 128))
                ], 40, ["onUpdate:modelValue"]), [
                  [vModelSelect, unref(terapeutaFiltro)]
                ]),
                (openBlock(), createBlock(Fragment, null, renderList(vistas, (vista) => {
                  return createVNode("button", {
                    key: vista.id,
                    onClick: ($event) => vistaActual.value = vista.id,
                    class: [
                      "px-5 py-2.5 rounded-lg font-medium transition-all",
                      unref(vistaActual) === vista.id ? "bg-terracota text-white shadow-md" : "bg-white text-cafe hover:bg-terracota/10 border border-[#EAD5D3]/40"
                    ]
                  }, [
                    createVNode("span", { class: "mr-2" }, toDisplayString(vista.icono), 1),
                    createTextVNode(" " + toDisplayString(vista.nombre), 1)
                  ], 10, ["onClick"]);
                }), 64)),
                createVNode("button", {
                  onClick: ($event) => abrirModalNuevaCita(),
                  class: "ml-auto px-5 py-2.5 rounded-lg font-medium bg-gradient-to-r from-terracota to-rosa text-white hover:from-terracota/90 hover:to-rosa/90 shadow-md transition-all"
                }, [
                  createVNode("span", { class: "mr-2" }, "+"),
                  createTextVNode(" Nueva Cita ")
                ], 8, ["onClick"])
              ]),
              unref(vistaActual) === "dia" ? (openBlock(), createBlock("div", {
                key: 0,
                class: "bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-6"
              }, [
                createVNode("div", { class: "mb-6 flex items-center gap-4" }, [
                  createVNode("button", {
                    onClick: ($event) => cambiarDia(-1),
                    class: "p-2 hover:bg-terracota/10 rounded-lg transition-colors"
                  }, " \u2190 Anterior ", 8, ["onClick"]),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => isRef(fechaSeleccionada) ? fechaSeleccionada.value = $event : null,
                    type: "date",
                    class: "flex-1 px-4 py-2 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, unref(fechaSeleccionada)]
                  ]),
                  createVNode("button", {
                    onClick: irHoy,
                    class: "px-4 py-2 bg-terracota/10 text-terracota rounded-lg hover:bg-terracota/20 transition-colors font-medium"
                  }, " Hoy "),
                  createVNode("button", {
                    onClick: ($event) => cambiarDia(1),
                    class: "p-2 hover:bg-terracota/10 rounded-lg transition-colors"
                  }, " Siguiente \u2192 ", 8, ["onClick"])
                ]),
                createVNode("div", { class: "mb-6" }, [
                  createVNode("h2", { class: "text-2xl font-serif font-semibold text-cafe mb-1" }, toDisplayString(formatearFechaLegible(unref(fechaSeleccionada))), 1),
                  createVNode("p", { class: "text-cafe/60" }, toDisplayString(unref(citasDelDia).length) + " cita" + toDisplayString(unref(citasDelDia).length !== 1 ? "s" : "") + " programada" + toDisplayString(unref(citasDelDia).length !== 1 ? "s" : ""), 1)
                ]),
                unref(cargando) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "text-center py-12"
                }, [
                  createVNode("div", { class: "inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-terracota" })
                ])) : unref(citasDelDia).length === 0 ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "text-center py-12"
                }, [
                  createVNode("span", { class: "text-6xl mb-4 block" }, "\u{1F4C5}"),
                  createVNode("p", { class: "text-lg text-cafe font-medium mb-2" }, "Sin citas programadas"),
                  createVNode("p", { class: "text-cafe/60" }, "No hay citas para " + toDisplayString(formatearFechaLegible(unref(fechaSeleccionada))), 1)
                ])) : (openBlock(), createBlock("div", {
                  key: 2,
                  class: "space-y-4"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(citasDelDia), (cita) => {
                    return openBlock(), createBlock("div", {
                      key: cita.cita_id,
                      class: ["bg-gradient-to-r from-base-bg to-white rounded-lg p-5 border-l-4 hover:shadow-md transition-all", obtenerColorEstado(cita.estado)]
                    }, [
                      createVNode("div", { class: "flex items-start justify-between" }, [
                        createVNode("div", { class: "flex-1" }, [
                          createVNode("div", { class: "flex items-center gap-3 mb-2" }, [
                            createVNode("span", { class: "text-3xl" }, toDisplayString(obtenerIconoTipo(cita.modalidad)), 1),
                            createVNode("div", null, [
                              createVNode("h3", { class: "text-lg font-semibold text-cafe" }, toDisplayString(cita.paciente_nombre), 1),
                              createVNode("p", { class: "text-sm text-cafe/60" }, toDisplayString(cita.hora_inicio) + " - " + toDisplayString(cita.hora_fin) + " \xB7 " + toDisplayString(cita.terapeuta_nombre), 1)
                            ])
                          ]),
                          cita.observaciones ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "mt-3 p-3 bg-white/50 rounded-lg"
                          }, [
                            createVNode("p", { class: "text-sm text-cafe/70" }, [
                              createVNode("span", { class: "font-medium" }, "Notas:"),
                              createTextVNode(" " + toDisplayString(cita.observaciones), 1)
                            ])
                          ])) : createCommentVNode("", true)
                        ]),
                        createVNode("div", { class: "flex flex-col gap-2" }, [
                          createVNode("span", {
                            class: [
                              "px-3 py-1 rounded-full text-xs font-medium",
                              obtenerEstiloEstado(cita.estado)
                            ]
                          }, toDisplayString(cita.estado), 3)
                        ])
                      ])
                    ], 2);
                  }), 128))
                ]))
              ])) : (openBlock(), createBlock("div", {
                key: 1,
                class: "bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-6"
              }, [
                createVNode("div", { class: "text-center py-12" }, [
                  createVNode("span", { class: "text-6xl mb-4 block" }, "\u{1F5D3}\uFE0F"),
                  createVNode("p", { class: "text-lg text-cafe font-medium mb-2" }, "Vista en desarrollo"),
                  createVNode("p", { class: "text-cafe/60" }, "La vista " + toDisplayString(unref(vistaActual)) + " estar\xE1 disponible pronto", 1)
                ])
              ])),
              createVNode(_component_ModalNuevaCita, {
                mostrar: unref(modalNuevaCitaAbierto),
                "fecha-preseleccionada": unref(fechaModalCita),
                "hora-preseleccionada": unref(horaModalCita),
                onCerrar: cerrarModalNuevaCita,
                onCitaCreada
              }, null, 8, ["mostrar", "fecha-preseleccionada", "hora-preseleccionada"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinacion/agenda.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=agenda-iIfpoO_x.mjs.map
