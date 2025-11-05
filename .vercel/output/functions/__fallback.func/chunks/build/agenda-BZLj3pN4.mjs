import { _ as __nuxt_component_0 } from './AgendaTerapeuta-DO67d38s.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './useSupabaseClient-DykwVqLQ.mjs';
import './server.mjs';
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
import '@heroicons/vue/24/outline';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "agenda",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AgendaTerapeuta = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "agenda-page" }, _attrs))} data-v-e9c5b3bd>`);
      _push(ssrRenderComponent(_component_AgendaTerapeuta, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/terapeuta/agenda.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const agenda = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e9c5b3bd"]]);

export { agenda as default };
//# sourceMappingURL=agenda-BZLj3pN4.mjs.map
