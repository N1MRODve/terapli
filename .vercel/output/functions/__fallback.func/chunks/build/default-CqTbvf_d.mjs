import { _ as __nuxt_component_0$2 } from './nuxt-link-CboeUkiO.mjs';
import { mergeProps, unref, ref, withCtx, createVNode, createTextVNode, createBlock, openBlock, computed, toDisplayString, defineComponent, resolveDynamicComponent, renderSlot, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderVNode } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import '@supabase/ssr';
import '@vercel/analytics/nuxt';

const _sfc_main$5 = {
  __name: "Header",
  __ssrInlineRender: true,
  setup(__props) {
    const menuOpen = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "fixed top-0 left-0 right-0 z-50 bg-[#F9F7F3] shadow-sm transition-all duration-300" }, _attrs))} data-v-d5df1b11><nav class="flex items-center justify-between w-full h-20 px-6 md:px-10 max-w-[1600px] mx-auto" data-v-d5df1b11>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center h-full hover:opacity-80 transition-opacity duration-300"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-2xl md:text-3xl font-[&#39;Elms_Sans&#39;] font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent" data-v-d5df1b11${_scopeId}> Teraplí </span>`);
          } else {
            return [
              createVNode("span", { class: "text-2xl md:text-3xl font-['Elms_Sans'] font-bold bg-gradient-to-r from-[#5550F2] to-[#027368] bg-clip-text text-transparent" }, " Teraplí ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="hidden md:flex items-center justify-center gap-6 lg:gap-8 font-[&#39;Lato&#39;] text-base text-[#5D4A44]" data-v-d5df1b11>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "nav-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Inicio `);
          } else {
            return [
              createTextVNode(" Inicio ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/sentirse",
        class: "nav-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Cómo te sientes `);
          } else {
            return [
              createTextVNode(" Cómo te sientes ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/conoceme",
        class: "nav-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Conóceme `);
          } else {
            return [
              createTextVNode(" Conóceme ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/como-empezar",
        class: "nav-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Cómo empezar `);
          } else {
            return [
              createTextVNode(" Cómo empezar ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/contacto",
        class: "nav-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Contacto `);
          } else {
            return [
              createTextVNode(" Contacto ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="hidden md:flex items-center gap-4" data-v-d5df1b11>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/login",
        class: "flex items-center gap-1.5 text-[#5D4A44] hover:text-[#D8AFA0] transition-colors duration-300 font-['Lato'] text-sm lg:text-base"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-d5df1b11${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" data-v-d5df1b11${_scopeId}></path></svg><span data-v-d5df1b11${_scopeId}>Tu espacio</span>`);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                class: "w-4 h-4",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24"
              }, [
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "stroke-width": "2",
                  d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                })
              ])),
              createVNode("span", null, "Tu espacio")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/reservar",
        class: "px-6 py-2.5 bg-[#D8AFA0] hover:bg-[#C89B8A] text-white rounded-full font-['Lato'] font-medium transition-all duration-300 text-sm lg:text-base whitespace-nowrap"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Reservar cita `);
          } else {
            return [
              createTextVNode(" Reservar cita ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><button class="md:hidden text-[#5D4A44] hover:text-[#D8AFA0] transition-colors p-2" aria-label="Toggle menu" data-v-d5df1b11><svg class="${ssrRenderClass([{ "rotate-90": menuOpen.value }, "w-6 h-6 transition-transform duration-300"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-d5df1b11>`);
      if (!menuOpen.value) {
        _push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" data-v-d5df1b11></path>`);
      } else {
        _push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-d5df1b11></path>`);
      }
      _push(`</svg></button></nav>`);
      if (menuOpen.value) {
        _push(`<div class="fixed inset-0 top-20 z-40 bg-[#5D4A44]/10 backdrop-blur-sm md:hidden" data-v-d5df1b11><div class="bg-[#F9F7F3] shadow-lg mx-4 mt-4 rounded-2xl p-6" data-v-d5df1b11><nav class="flex flex-col gap-3 w-full" data-v-d5df1b11>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/",
          class: "mobile-nav-link",
          onClick: ($event) => menuOpen.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Inicio `);
            } else {
              return [
                createTextVNode(" Inicio ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/sentirse",
          class: "mobile-nav-link",
          onClick: ($event) => menuOpen.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Cómo te sientes `);
            } else {
              return [
                createTextVNode(" Cómo te sientes ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/conoceme",
          class: "mobile-nav-link",
          onClick: ($event) => menuOpen.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Conóceme `);
            } else {
              return [
                createTextVNode(" Conóceme ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/como-empezar",
          class: "mobile-nav-link",
          onClick: ($event) => menuOpen.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Cómo empezar `);
            } else {
              return [
                createTextVNode(" Cómo empezar ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/contacto",
          class: "mobile-nav-link",
          onClick: ($event) => menuOpen.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Contacto `);
            } else {
              return [
                createTextVNode(" Contacto ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="h-px bg-[#D8AFA0]/20 my-2" data-v-d5df1b11></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "mobile-nav-link-therapeutic",
          onClick: ($event) => menuOpen.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-d5df1b11${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" data-v-d5df1b11${_scopeId}></path></svg><span data-v-d5df1b11${_scopeId}>Tu espacio terapéutico</span>`);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  class: "w-5 h-5",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    "stroke-width": "2",
                    d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  })
                ])),
                createVNode("span", null, "Tu espacio terapéutico")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</nav><div class="mt-6" data-v-d5df1b11>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/reservar",
          class: "block w-full px-6 py-3.5 bg-[#D8AFA0] hover:bg-[#C89B8A] text-white rounded-full font-['Lato'] font-semibold text-center transition-all duration-300 shadow-md",
          onClick: ($event) => menuOpen.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Reservar cita `);
            } else {
              return [
                createTextVNode(" Reservar cita ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header>`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Header.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-d5df1b11"]]);
const visitorName = ref("");
const lastVisit = ref("");
const deviceType = ref("desktop");
const greeting = ref("");
const isFirstVisit = ref(true);
function useVisitorContext() {
  const setName = (name) => {
    if (!name || !name.trim()) return;
    visitorName.value = name.trim();
    updateGreeting();
  };
  const getTimeOfDay = () => {
    const hour = (/* @__PURE__ */ new Date()).getHours();
    if (hour < 12) return "morning";
    if (hour < 19) return "afternoon";
    return "night";
  };
  const hasReturned = () => {
    if (!lastVisit.value) return false;
    const lastVisitDate = new Date(lastVisit.value);
    const now = /* @__PURE__ */ new Date();
    const daysSinceLastVisit = (now - lastVisitDate) / (1e3 * 60 * 60 * 24);
    return daysSinceLastVisit > 1;
  };
  const updateGreeting = () => {
    const timeOfDay = getTimeOfDay();
    const isReturning = hasReturned();
    const name = visitorName.value;
    let greetingText = "";
    if (!name) {
      greetingText = "Me alegra que estés aquí";
    } else if (isReturning) {
      greetingText = `Qué alegría verte de nuevo, ${name}`;
    } else if (timeOfDay === "morning") {
      greetingText = `${name}, espero que tu mañana esté siendo tranquila`;
    } else if (timeOfDay === "afternoon") {
      greetingText = `${name}, me alegra que estés aquí`;
    } else {
      greetingText = `${name}, espero que tu día haya ido bien`;
    }
    if (deviceType.value === "mobile" && name) {
      greeting.value = `${greetingText}. Si lo prefieres, puedes escribirme directamente por WhatsApp 📱`;
    } else {
      greeting.value = greetingText;
    }
  };
  const clearVisitorData = () => {
  };
  const personalized = (neutral, withName) => {
    return visitorName.value ? withName.replace("{name}", visitorName.value) : neutral;
  };
  return {
    visitorName: computed(() => visitorName.value),
    setName,
    greeting: computed(() => greeting.value),
    deviceType: computed(() => deviceType.value),
    isFirstVisit: computed(() => isFirstVisit.value),
    updateGreeting,
    clearVisitorData,
    getTimeOfDay,
    personalized
  };
}
const _sfc_main$4 = {
  __name: "Footer",
  __ssrInlineRender: true,
  setup(__props) {
    const { personalized } = useVisitorContext();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "bg-terracota text-fondo" }, _attrs))}><div class="max-w-7xl mx-auto px-6 py-12"><div class="grid md:grid-cols-3 gap-8 text-center md:text-left"><div><h3 class="text-xl font-serif text-white mb-4">Karem Peña</h3><p class="text-sm leading-relaxed text-fondo/90">Psicóloga colegiada especializada en terapia individual con enfoque humanista e integrador.</p></div><div><h4 class="text-white font-semibold mb-4">Enlaces</h4><ul class="space-y-2 text-sm"><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/conoceme",
        class: "text-fondo/90 hover:text-white transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Conóceme`);
          } else {
            return [
              createTextVNode("Conóceme")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/como-empezar",
        class: "text-fondo/90 hover:text-white transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Cómo empezar`);
          } else {
            return [
              createTextVNode("Cómo empezar")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/blog",
        class: "text-fondo/90 hover:text-white transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Blog`);
          } else {
            return [
              createTextVNode("Blog")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/contacto",
        class: "text-fondo/90 hover:text-white transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Contacto`);
          } else {
            return [
              createTextVNode("Contacto")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></div><div><h4 class="text-white font-semibold mb-4">Legal</h4><ul class="space-y-2 text-sm"><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/legal/aviso-legal",
        class: "text-fondo/90 hover:text-white transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Aviso legal`);
          } else {
            return [
              createTextVNode("Aviso legal")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/legal/privacidad",
        class: "text-fondo/90 hover:text-white transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Política de privacidad`);
          } else {
            return [
              createTextVNode("Política de privacidad")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/legal/cookies",
        class: "text-fondo/90 hover:text-white transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Cookies`);
          } else {
            return [
              createTextVNode("Cookies")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/politica-de-cancelacion",
        class: "text-fondo/90 hover:text-white transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Política de cancelación`);
          } else {
            return [
              createTextVNode("Política de cancelación")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li><button class="text-fondo/90 hover:text-white transition text-left"> ⚙️ Configurar cookies </button></li></ul></div></div><div class="mt-8 pt-8 border-t border-fondo/20 text-center text-sm text-fondo/80"><p class="mb-2">${ssrInterpolate(unref(personalized)(
        "Gracias por visitar este espacio. Espero que te acompañe en tu camino.",
        "Gracias por visitar este espacio, {name}. Espero que te acompañe en tu camino."
      ))}</p><p>© ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} Karem Peña - Psicóloga. Todos los derechos reservados.</p></div></div></footer>`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Footer.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$4, { __name: "Footer" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "CalmButton",
  __ssrInlineRender: true,
  props: {
    to: {},
    variant: { default: "primary" },
    size: { default: "md" },
    disabled: { type: Boolean, default: false }
  },
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const buttonClasses = computed(() => {
      const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
      const variants = {
        primary: "bg-[#D8AFA0] hover:bg-[#C5968B] text-white focus:ring-[#D8AFA0]/50",
        secondary: "border-2 border-[#D8AFA0] text-[#D8AFA0] hover:bg-[#D8AFA0] hover:text-white focus:ring-[#D8AFA0]/50",
        tertiary: "text-[#5D4A44] hover:text-[#D8AFA0] hover:bg-[#D8AFA0]/10 focus:ring-[#D8AFA0]/50"
      };
      const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
      };
      const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed" : "";
      return [base, variants[props.variant], sizes[props.size], disabledClasses].join(" ");
    });
    const handleClick = (event) => {
      if (!props.disabled) {
        emit("click", event);
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(__props.to ? "NuxtLink" : "button"), mergeProps({
        to: __props.to,
        type: !__props.to ? "button" : void 0,
        class: unref(buttonClasses)
      }, _ctx.$attrs, { onClick: handleClick }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }), _parent);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CalmButton.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$3, { __name: "CalmButton" });
const _sfc_main$2 = {
  __name: "InactivityModal",
  __ssrInlineRender: true,
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ["confirm"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const { personalized } = useVisitorContext();
    const title = computed(() => {
      return personalized(
        "¿Sigues ahí?",
        "¿Sigues ahí, {name}?"
      );
    });
    const message = computed(() => {
      return personalized(
        "He notado que llevas un momento sin moverte. ¿Todo está bien? Si necesitas un descanso, está bien. Aquí estaré cuando estés listo/a.",
        "{name}, he notado que llevas un momento sin moverte. ¿Todo está bien? Si necesitas un descanso, está bien. Aquí estaré cuando estés listo/a."
      );
    });
    const buttonText = computed(() => {
      return personalized(
        "Sí, sigo aquí",
        "Sí, aquí estoy"
      );
    });
    const handleConfirm = () => {
      emit("confirm");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CalmButton = __nuxt_component_0;
      if (__props.show) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" }, _attrs))} data-v-c1106993><div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10 animate-fade-in-up border border-[#EAD5D3]/30" role="dialog" aria-labelledby="inactivity-title" aria-modal="true" data-v-c1106993><div class="text-center" data-v-c1106993><div class="text-6xl mb-4 animate-pulse-slow" data-v-c1106993>💭</div><h2 id="inactivity-title" class="text-2xl md:text-3xl font-serif text-[#5D4A44] mb-4" data-v-c1106993>${ssrInterpolate(title.value)}</h2><p class="text-[#5D4A44]/80 leading-relaxed mb-6" data-v-c1106993>${ssrInterpolate(message.value)}</p>`);
        _push(ssrRenderComponent(_component_CalmButton, {
          onClick: handleConfirm,
          size: "lg",
          class: "w-full"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(buttonText.value)}`);
            } else {
              return [
                createTextVNode(toDisplayString(buttonText.value), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<p class="text-xs text-[#5D4A44]/50 mt-4 leading-relaxed" data-v-c1106993> Tómate el tiempo que necesites. Este espacio estará aquí cuando lo necesites. </p></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/InactivityModal.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-c1106993"]]);
const _sfc_main$1 = {
  __name: "CookieConsent",
  __ssrInlineRender: true,
  setup(__props, { expose: __expose }) {
    const showBanner = ref(false);
    const showSettings = ref(false);
    const preferences = ref({
      necessary: true,
      // Siempre activadas
      analytics: false,
      personalization: false
    });
    __expose({
      openSettings: () => {
        showSettings.value = true;
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      _push(`<!--[-->`);
      if (showBanner.value) {
        _push(`<div class="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 bg-[#F9F7F3] text-[#5D4A44] border border-[#EAD5D3] rounded-2xl shadow-2xl p-6 z-50 max-w-3xl mx-auto backdrop-blur-sm" data-v-2e8c3cfe><div class="flex items-start gap-4" data-v-2e8c3cfe><div class="flex-shrink-0 w-12 h-12 bg-[#D8AFA0]/20 rounded-full flex items-center justify-center" data-v-2e8c3cfe><svg class="w-6 h-6 text-[#D8AFA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-2e8c3cfe><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-v-2e8c3cfe></path></svg></div><div class="flex-1" data-v-2e8c3cfe><h3 class="font-serif text-lg font-semibold mb-2 text-[#5D4A44]" data-v-2e8c3cfe> 🍪 Uso de cookies </h3><p class="font-sans text-sm leading-relaxed mb-4" data-v-2e8c3cfe> Utilizamos cookies propias y de terceros para mejorar tu experiencia y analizar el uso del sitio. Puedes aceptar todas las cookies o configurarlas según tus preferencias. </p><div class="flex flex-wrap gap-3 items-center" data-v-2e8c3cfe><button class="bg-[#D8AFA0] text-white px-5 py-2.5 rounded-xl font-sans font-medium hover:bg-[#EFA08B] transition-all shadow-md hover:shadow-lg" data-v-2e8c3cfe> Aceptar todas </button><button class="bg-transparent border border-[#D8AFA0] text-[#5D4A44] px-5 py-2.5 rounded-xl font-sans hover:bg-[#EAD5D3] transition-all" data-v-2e8c3cfe> Configurar </button><button class="text-sm text-[#5D4A44]/70 hover:text-[#5D4A44] underline font-sans" data-v-2e8c3cfe> Rechazar no esenciales </button></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (showSettings.value) {
        _push(`<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" data-v-2e8c3cfe><div class="bg-[#F9F7F3] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" data-v-2e8c3cfe><div class="sticky top-0 bg-[#F9F7F3] border-b border-[#EAD5D3] p-6" data-v-2e8c3cfe><div class="flex items-center justify-between" data-v-2e8c3cfe><h2 class="font-serif text-2xl font-semibold text-[#5D4A44]" data-v-2e8c3cfe> Configuración de Cookies </h2><button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EAD5D3] transition-colors" data-v-2e8c3cfe><svg class="w-5 h-5 text-[#5D4A44]" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-2e8c3cfe><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-2e8c3cfe></path></svg></button></div></div><div class="p-6 space-y-6" data-v-2e8c3cfe><p class="font-sans text-sm text-[#5D4A44]/80 leading-relaxed" data-v-2e8c3cfe> Aquí puedes gestionar tus preferencias de cookies. Las cookies técnicas son necesarias para el funcionamiento del sitio y no pueden desactivarse. </p><div class="bg-white/40 p-5 rounded-2xl border border-[#EAD5D3]" data-v-2e8c3cfe><div class="flex items-center justify-between mb-3" data-v-2e8c3cfe><div data-v-2e8c3cfe><h3 class="font-serif text-lg font-semibold text-[#5D4A44]" data-v-2e8c3cfe> Cookies necesarias </h3><p class="font-sans text-sm text-[#5D4A44]/70 mt-1" data-v-2e8c3cfe> Esenciales para el funcionamiento del sitio </p></div><div class="bg-[#D8AFA0]/20 px-4 py-1.5 rounded-full" data-v-2e8c3cfe><span class="font-sans text-sm font-medium text-[#5D4A44]" data-v-2e8c3cfe>Siempre activas</span></div></div><p class="font-sans text-sm text-[#5D4A44]/70 leading-relaxed" data-v-2e8c3cfe> Permiten la navegación básica y el acceso a áreas seguras. Sin estas cookies, el sitio no puede funcionar correctamente. </p></div><div class="bg-white/40 p-5 rounded-2xl border border-[#EAD5D3]" data-v-2e8c3cfe><div class="flex items-center justify-between mb-3" data-v-2e8c3cfe><div class="flex-1" data-v-2e8c3cfe><h3 class="font-serif text-lg font-semibold text-[#5D4A44]" data-v-2e8c3cfe> Cookies de análisis </h3><p class="font-sans text-sm text-[#5D4A44]/70 mt-1" data-v-2e8c3cfe> Nos ayudan a mejorar el rendimiento del sitio </p></div><label class="relative inline-flex items-center cursor-pointer" data-v-2e8c3cfe><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(preferences.value.analytics) ? ssrLooseContain(preferences.value.analytics, null) : preferences.value.analytics) ? " checked" : ""} class="sr-only peer" data-v-2e8c3cfe><div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D8AFA0]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D8AFA0]" data-v-2e8c3cfe></div></label></div><p class="font-sans text-sm text-[#5D4A44]/70 leading-relaxed" data-v-2e8c3cfe> Recopilan información anónima sobre cómo utilizas el sitio para ayudarnos a mejorarlo (ej. Google Analytics). </p></div><div class="bg-white/40 p-5 rounded-2xl border border-[#EAD5D3]" data-v-2e8c3cfe><div class="flex items-center justify-between mb-3" data-v-2e8c3cfe><div class="flex-1" data-v-2e8c3cfe><h3 class="font-serif text-lg font-semibold text-[#5D4A44]" data-v-2e8c3cfe> Cookies de personalización </h3><p class="font-sans text-sm text-[#5D4A44]/70 mt-1" data-v-2e8c3cfe> Adaptan la experiencia a tus preferencias </p></div><label class="relative inline-flex items-center cursor-pointer" data-v-2e8c3cfe><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(preferences.value.personalization) ? ssrLooseContain(preferences.value.personalization, null) : preferences.value.personalization) ? " checked" : ""} class="sr-only peer" data-v-2e8c3cfe><div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D8AFA0]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D8AFA0]" data-v-2e8c3cfe></div></label></div><p class="font-sans text-sm text-[#5D4A44]/70 leading-relaxed" data-v-2e8c3cfe> Recuerdan tus elecciones y preferencias para ofrecerte una experiencia más personalizada. </p></div><div class="bg-[#EAD5D3]/20 border-l-4 border-[#D8AFA0] p-4 rounded-r-xl" data-v-2e8c3cfe><p class="font-sans text-sm text-[#5D4A44]/80" data-v-2e8c3cfe> Puedes cambiar estas preferencias en cualquier momento desde el pie de página del sitio. `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/legal/cookies",
          class: "text-[#D8AFA0] hover:text-[#EFA08B] underline font-semibold"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Ver política completa → `);
            } else {
              return [
                createTextVNode(" Ver política completa → ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</p></div></div><div class="sticky bottom-0 bg-[#F9F7F3] border-t border-[#EAD5D3] p-6 flex gap-3 justify-end" data-v-2e8c3cfe><button class="bg-[#D8AFA0] text-white px-6 py-2.5 rounded-xl font-sans font-medium hover:bg-[#EFA08B] transition-all shadow-md hover:shadow-lg" data-v-2e8c3cfe> Guardar preferencias </button><button class="bg-transparent border border-[#D8AFA0] text-[#5D4A44] px-6 py-2.5 rounded-xl font-sans hover:bg-[#EAD5D3] transition-all" data-v-2e8c3cfe> Cancelar </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CookieConsent.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-2e8c3cfe"]]), { __name: "CookieConsent" });
const INACTIVITY_TIMEOUT = 3 * 60 * 1e3;
let inactivityTimer = null;
const showInactivityModal = ref(false);
const isActive = ref(true);
function useInactivityDetector() {
  const resetTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    if (showInactivityModal.value) {
      showInactivityModal.value = false;
      isActive.value = true;
    }
    inactivityTimer = setTimeout(() => {
    }, INACTIVITY_TIMEOUT);
  };
  const confirmStillHere = () => {
    showInactivityModal.value = false;
    isActive.value = true;
    resetTimer();
  };
  return {
    showInactivityModal,
    isActive,
    confirmStillHere,
    resetTimer
  };
}
const _sfc_main = {
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const { showInactivityModal: showInactivityModal2, confirmStillHere } = useInactivityDetector();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Header = __nuxt_component_0$1;
      const _component_Footer = __nuxt_component_1;
      const _component_InactivityModal = __nuxt_component_2;
      const _component_CookieConsent = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-[#F9F7F3] min-h-screen text-[#5D4A44]" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_Header, null, null, _parent));
      _push(`<main>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      _push(ssrRenderComponent(_component_Footer, null, null, _parent));
      _push(ssrRenderComponent(_component_InactivityModal, {
        show: unref(showInactivityModal2),
        onConfirm: unref(confirmStillHere)
      }, null, _parent));
      _push(ssrRenderComponent(_component_CookieConsent, null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-CqTbvf_d.mjs.map
