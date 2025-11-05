import { computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = {
  __name: "LoadingSpinner",
  __ssrInlineRender: true,
  props: {
    size: {
      type: String,
      default: "medium",
      // 'small', 'medium', 'large'
      validator: (value) => ["small", "medium", "large"].includes(value)
    },
    text: {
      type: String,
      default: ""
    },
    fullHeight: {
      type: Boolean,
      default: false
    }
  },
  setup(__props) {
    const props = __props;
    const sizeClass = computed(() => {
      switch (props.size) {
        case "small":
          return "w-8 h-8 border-2";
        case "large":
          return "w-16 h-16 border-4";
        default:
          return "w-12 h-12 border-4";
      }
    });
    const containerClass = computed(() => {
      return props.fullHeight ? "min-h-[400px]" : "py-8";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["flex items-center justify-center", unref(containerClass)]
      }, _attrs))}><div class="relative"><div class="${ssrRenderClass([unref(sizeClass), "w-12 h-12 border-4 border-[#EAD5D3] border-t-[#D8AFA0] rounded-full animate-spin"])}"></div>`);
      if (__props.text) {
        _push(`<p class="mt-4 text-sm text-[#5D4A44] font-[&#39;Lato&#39;] text-center">${ssrInterpolate(__props.text)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LoadingSpinner.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=LoadingSpinner-5WmFPZGW.mjs.map
