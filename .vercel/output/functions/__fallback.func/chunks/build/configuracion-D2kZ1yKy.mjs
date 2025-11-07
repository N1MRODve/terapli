import { _ as _sfc_main$1 } from './DashboardCard-CYAu_T60.mjs';
import { withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';

const _sfc_main = {
  __name: "configuracion",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_DashboardCard = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="mb-8"><h1 class="text-4xl font-serif font-bold text-cafe mb-2"> Configuración </h1><p class="text-lg text-cafe/70"> Ajustes del perfil y preferencias </p></div>`);
      _push(ssrRenderComponent(_component_DashboardCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="text-center py-12"${_scopeId}><span class="text-6xl mb-4 block"${_scopeId}>⚙️</span><h3 class="text-xl font-serif font-semibold text-cafe mb-2"${_scopeId}> Módulo en construcción </h3><p class="text-cafe/60"${_scopeId}> Esta sección estará disponible próximamente </p></div>`);
          } else {
            return [
              createVNode("div", { class: "text-center py-12" }, [
                createVNode("span", { class: "text-6xl mb-4 block" }, "⚙️"),
                createVNode("h3", { class: "text-xl font-serif font-semibold text-cafe mb-2" }, " Módulo en construcción "),
                createVNode("p", { class: "text-cafe/60" }, " Esta sección estará disponible próximamente ")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/terapeuta/configuracion.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=configuracion-D2kZ1yKy.mjs.map
