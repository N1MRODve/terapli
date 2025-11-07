import { ssrRenderAttrs } from 'vue/server-renderer';
import { useSSRContext } from 'vue';

const _sfc_main = {
  __name: "mensajes",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8"><div class="text-center text-gray-400"><span class="text-6xl mb-4 block">💬</span><h3 class="text-xl font-semibold text-cafe mb-2"> Mensajería con Pacientes </h3><p class="text-gray-600"> Aquí se mostrará el sistema de mensajes con pacientes </p></div></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/coordinadora/mensajes.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=mensajes-KCUB3WM6.mjs.map
