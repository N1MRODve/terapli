import { e as useSupabaseUser, _ as __nuxt_component_0 } from './server.mjs';
import { defineComponent, ref, resolveComponent, withCtx, unref, createVNode, createBlock, withDirectives, isRef, openBlock, Fragment, renderList, toDisplayString, vModelSelect, vModelText, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
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
  __name: "mensajes",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    useSupabaseUser();
    const { getUserId } = useSupabase();
    const pacientes = ref([]);
    const pacienteSeleccionado = ref(null);
    const mensaje = ref("");
    const obtenerIniciales = (nombre) => {
      return nombre.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
    };
    const enviarMensajeInterno = async () => {
      if (!mensaje.value.trim() || !pacienteSeleccionado.value) return;
      try {
        const userId = getUserId();
        if (!userId) {
          alert("❌ No estás autenticado");
          return;
        }
        const { error } = await supabase.from("mensajes").insert({
          remitente_id: userId,
          destinatario_id: pacienteSeleccionado.value.id,
          mensaje: mensaje.value,
          visto: false
        });
        if (error) throw error;
        alert("✅ Mensaje enviado exitosamente");
        mensaje.value = "";
      } catch (error) {
        console.error("Error:", error);
        alert("❌ Error al enviar mensaje");
      }
    };
    const abrirWhatsApp = () => {
      if (!mensaje.value.trim() || !pacienteSeleccionado.value.telefono) return;
      const numero = pacienteSeleccionado.value.telefono.replace(/\D/g, "");
      const texto = encodeURIComponent(mensaje.value);
      (void 0).open(`https://wa.me/${numero}?text=${texto}`, "_blank");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLayout = __nuxt_component_0;
      const _component_Icon = resolveComponent("Icon");
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_NuxtLayout, { name: "coordinacion" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="mb-8"${_scopeId}><h1 class="text-3xl font-lora font-bold text-[#5D4A44] mb-2"${_scopeId}> Mensajería </h1><p class="text-[#8B7470]"${_scopeId}> Comunicación con pacientes y terapeutas </p></div><div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6 mb-6"${_scopeId}><label class="block text-sm font-medium text-[#5D4A44] mb-3"${_scopeId}> Seleccionar paciente </label><select class="w-full px-4 py-3 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(pacienteSeleccionado)) ? ssrLooseContain(unref(pacienteSeleccionado), "") : ssrLooseEqual(unref(pacienteSeleccionado), "")) ? " selected" : ""}${_scopeId}>-- Selecciona un paciente --</option><!--[-->`);
            ssrRenderList(unref(pacientes), (paciente) => {
              _push2(`<option${ssrRenderAttr("value", paciente)}${ssrIncludeBooleanAttr(Array.isArray(unref(pacienteSeleccionado)) ? ssrLooseContain(unref(pacienteSeleccionado), paciente) : ssrLooseEqual(unref(pacienteSeleccionado), paciente)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(paciente.nombre)}</option>`);
            });
            _push2(`<!--]--></select></div>`);
            if (unref(pacienteSeleccionado)) {
              _push2(`<div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6"${_scopeId}><div class="mb-4 flex items-center space-x-3"${_scopeId}><div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] flex items-center justify-center"${_scopeId}><span class="text-white font-semibold"${_scopeId}>${ssrInterpolate(obtenerIniciales(unref(pacienteSeleccionado).nombre))}</span></div><div${_scopeId}><p class="font-semibold text-[#5D4A44]"${_scopeId}>${ssrInterpolate(unref(pacienteSeleccionado).nombre)}</p><p class="text-sm text-[#8B7470]"${_scopeId}>${ssrInterpolate(unref(pacienteSeleccionado).telefono)}</p></div></div><textarea placeholder="Escribe tu mensaje aquí..." rows="5" class="w-full px-4 py-3 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent resize-none mb-4"${_scopeId}>${ssrInterpolate(unref(mensaje))}</textarea><div class="flex space-x-3"${_scopeId}><button${ssrIncludeBooleanAttr(!unref(mensaje).trim()) ? " disabled" : ""} class="flex-1 px-6 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C49484] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "heroicons:paper-airplane",
                class: "w-5 h-5"
              }, null, _parent2, _scopeId));
              _push2(`<span${_scopeId}>Enviar mensaje interno</span></button><button${ssrIncludeBooleanAttr(!unref(mensaje).trim()) ? " disabled" : ""} class="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "heroicons:chat-bubble-oval-left-ellipsis",
                class: "w-5 h-5"
              }, null, _parent2, _scopeId));
              _push2(`<span${_scopeId}>Abrir WhatsApp</span></button></div></div>`);
            } else {
              _push2(`<div class="bg-white rounded-xl shadow-md border border-[#E8DFD8] p-12 text-center"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "heroicons:chat-bubble-left-right",
                class: "w-20 h-20 mx-auto text-[#D8AFA0] opacity-30 mb-4"
              }, null, _parent2, _scopeId));
              _push2(`<p class="text-[#8B7470]"${_scopeId}>Selecciona un paciente para comenzar</p></div>`);
            }
          } else {
            return [
              createVNode("div", { class: "mb-8" }, [
                createVNode("h1", { class: "text-3xl font-lora font-bold text-[#5D4A44] mb-2" }, " Mensajería "),
                createVNode("p", { class: "text-[#8B7470]" }, " Comunicación con pacientes y terapeutas ")
              ]),
              createVNode("div", { class: "bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6 mb-6" }, [
                createVNode("label", { class: "block text-sm font-medium text-[#5D4A44] mb-3" }, " Seleccionar paciente "),
                withDirectives(createVNode("select", {
                  "onUpdate:modelValue": ($event) => isRef(pacienteSeleccionado) ? pacienteSeleccionado.value = $event : null,
                  class: "w-full px-4 py-3 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent"
                }, [
                  createVNode("option", { value: "" }, "-- Selecciona un paciente --"),
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(pacientes), (paciente) => {
                    return openBlock(), createBlock("option", {
                      key: paciente.id,
                      value: paciente
                    }, toDisplayString(paciente.nombre), 9, ["value"]);
                  }), 128))
                ], 8, ["onUpdate:modelValue"]), [
                  [vModelSelect, unref(pacienteSeleccionado)]
                ])
              ]),
              unref(pacienteSeleccionado) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "bg-white rounded-xl shadow-md border border-[#E8DFD8] p-6"
              }, [
                createVNode("div", { class: "mb-4 flex items-center space-x-3" }, [
                  createVNode("div", { class: "w-12 h-12 rounded-full bg-gradient-to-br from-[#D8AFA0] to-[#C49484] flex items-center justify-center" }, [
                    createVNode("span", { class: "text-white font-semibold" }, toDisplayString(obtenerIniciales(unref(pacienteSeleccionado).nombre)), 1)
                  ]),
                  createVNode("div", null, [
                    createVNode("p", { class: "font-semibold text-[#5D4A44]" }, toDisplayString(unref(pacienteSeleccionado).nombre), 1),
                    createVNode("p", { class: "text-sm text-[#8B7470]" }, toDisplayString(unref(pacienteSeleccionado).telefono), 1)
                  ])
                ]),
                withDirectives(createVNode("textarea", {
                  "onUpdate:modelValue": ($event) => isRef(mensaje) ? mensaje.value = $event : null,
                  placeholder: "Escribe tu mensaje aquí...",
                  rows: "5",
                  class: "w-full px-4 py-3 border border-[#E8DFD8] rounded-lg focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent resize-none mb-4"
                }, null, 8, ["onUpdate:modelValue"]), [
                  [vModelText, unref(mensaje)]
                ]),
                createVNode("div", { class: "flex space-x-3" }, [
                  createVNode("button", {
                    onClick: enviarMensajeInterno,
                    disabled: !unref(mensaje).trim(),
                    class: "flex-1 px-6 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#C49484] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  }, [
                    createVNode(_component_Icon, {
                      name: "heroicons:paper-airplane",
                      class: "w-5 h-5"
                    }),
                    createVNode("span", null, "Enviar mensaje interno")
                  ], 8, ["disabled"]),
                  createVNode("button", {
                    onClick: abrirWhatsApp,
                    disabled: !unref(mensaje).trim(),
                    class: "flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  }, [
                    createVNode(_component_Icon, {
                      name: "heroicons:chat-bubble-oval-left-ellipsis",
                      class: "w-5 h-5"
                    }),
                    createVNode("span", null, "Abrir WhatsApp")
                  ], 8, ["disabled"])
                ])
              ])) : (openBlock(), createBlock("div", {
                key: 1,
                class: "bg-white rounded-xl shadow-md border border-[#E8DFD8] p-12 text-center"
              }, [
                createVNode(_component_Icon, {
                  name: "heroicons:chat-bubble-left-right",
                  class: "w-20 h-20 mx-auto text-[#D8AFA0] opacity-30 mb-4"
                }),
                createVNode("p", { class: "text-[#8B7470]" }, "Selecciona un paciente para comenzar")
              ]))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinacion/mensajes.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=mensajes-CcOwygxE.mjs.map
