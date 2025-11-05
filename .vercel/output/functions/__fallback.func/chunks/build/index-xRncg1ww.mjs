import { _ as _sfc_main$1 } from './LoadingSpinner-5WmFPZGW.mjs';
import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';

const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LoadingSpinner = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center min-h-screen" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_LoadingSpinner, { text: "Redirigiendo a tu dashboard..." }, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/paciente/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-xRncg1ww.mjs.map
