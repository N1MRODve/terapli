import { _ as _sfc_main$6 } from './LoadingSpinner-5WmFPZGW.mjs';
import { ref, mergeProps, defineComponent, computed, shallowRef, getCurrentInstance, provide, cloneVNode, h, createElementBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrIncludeBooleanAttr, ssrRenderList } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = Symbol.for("nuxt:client-only");
const __nuxt_component_1 = defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  ...false,
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) {
      vm._nuxtClientOnly = true;
    }
    provide(clientOnlySymbol, true);
    return () => {
      var _a;
      if (mounted.value) {
        const vnodes = (_a = slots.default) == null ? void 0 : _a.call(slots);
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0], attrs)];
        }
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h(slot);
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
const _sfc_main$5 = {
  __name: "DashboardDailyQuote",
  __ssrInlineRender: true,
  setup(__props) {
    const quotes = [
      {
        text: "Mereces paz, amor y comprensi\xF3n. Empieza por d\xE1rtela a ti misma.",
        author: "\u2014 Recordatorio de bienestar"
      },
      {
        text: "Eres m\xE1s fuerte de lo que crees. Conf\xEDa en tu proceso.",
        author: "\u2014 Afirmaci\xF3n del d\xEDa"
      },
      {
        text: "Est\xE1 bien no estar bien. Lo importante es permitirte sentir.",
        author: "\u2014 Recordatorio de autocuidado"
      },
      {
        text: "Cada paso que das hacia tu bienestar es un acto de amor propio.",
        author: "\u2014 Reflexi\xF3n diaria"
      },
      {
        text: "Tus emociones son mensajeras, no enemigas. Esc\xFAchalas con compasi\xF3n.",
        author: "\u2014 Sabidur\xEDa emocional"
      },
      {
        text: "El autocuidado no es ego\xEDsmo, es responsabilidad hacia ti misma.",
        author: "\u2014 Recordatorio de bienestar"
      },
      {
        text: "No tienes que ser perfecta para ser valiosa.",
        author: "\u2014 Afirmaci\xF3n del d\xEDa"
      }
    ];
    const quote = computed(() => {
      const dayOfYear = Math.floor((Date.now() - new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 0)) / 864e5);
      return quotes[dayOfYear % quotes.length];
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#D8AFA0] via-[#F9F7F3] to-[#F9F7F3] p-8 sm:p-10 shadow-[0_2px_6px_rgba(0,0,0,0.05)] border border-[#EAD5D3]/30" }, _attrs))} data-v-d394bb91><div class="absolute top-6 right-6 text-5xl opacity-15" data-v-d394bb91>\u2728</div><div class="relative z-10 text-center max-w-3xl mx-auto" data-v-d394bb91><p class="font-[&#39;Lora&#39;] text-2xl sm:text-3xl text-[#5D4A44] italic mb-3 leading-relaxed" data-v-d394bb91> &quot;${ssrInterpolate(quote.value.text)}&quot; </p><p class="font-[&#39;Lato&#39;] text-sm sm:text-base text-[#5D4A44]/60" data-v-d394bb91>${ssrInterpolate(quote.value.author)}</p></div><div class="absolute -left-8 -bottom-8 w-32 h-32 bg-white/30 rounded-full blur-2xl" data-v-d394bb91></div><div class="absolute -right-4 top-1/2 w-20 h-20 bg-[#D8AFA0]/20 rounded-full blur-xl" data-v-d394bb91></div></div>`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/DailyQuote.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const DailyQuote = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-d394bb91"]]);
const _sfc_main$4 = {
  __name: "DashboardNextSessionCard",
  __ssrInlineRender: true,
  setup(__props) {
    const nextSession = ref({
      date: new Date(2025, 9, 22, 16, 0),
      // 22 de octubre, 16:00
      time: "16:00 - 17:00",
      modality: "Videollamada",
      duration: 60,
      note: "Recuerda tener tu diario emocional a mano para revisar juntas.",
      meetingLink: "https://meet.google.com/example"
    });
    const currentTime = ref(/* @__PURE__ */ new Date());
    const formatDate = (date) => {
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString("es-ES", options);
    };
    const canJoin = computed(() => {
      if (!nextSession.value) return false;
      const sessionDate = new Date(nextSession.value.date);
      const now = currentTime.value;
      const diffMinutes = (sessionDate - now) / (1e3 * 60);
      return diffMinutes <= 15 && diffMinutes > -60;
    });
    const actionButtonText = computed(() => {
      if (!nextSession.value) return "Agendar sesi\xF3n";
      if (canJoin.value) return "Unirme a la sesi\xF3n";
      return "Ver detalles";
    });
    const timeUntilSession = computed(() => {
      if (!nextSession.value) return null;
      const sessionDate = new Date(nextSession.value.date);
      const now = currentTime.value;
      const diff = sessionDate - now;
      if (diff < 0) return "Sesi\xF3n en curso o pasada";
      const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
      const hours = Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
      const minutes = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
      if (days > 0) return `Faltan ${days} d\xEDa${days > 1 ? "s" : ""} y ${hours} hora${hours !== 1 ? "s" : ""}`;
      if (hours > 0) return `Faltan ${hours} hora${hours !== 1 ? "s" : ""} y ${minutes} minuto${minutes !== 1 ? "s" : ""}`;
      return `Faltan ${minutes} minuto${minutes !== 1 ? "s" : ""}`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.05)] border border-[#EAD5D3]/30 p-5" }, _attrs))}><div class="flex items-start justify-between mb-4"><h2 class="font-[&#39;Lora&#39;] text-xl text-[#5D4A44]"> Pr\xF3xima sesi\xF3n </h2><div class="flex items-center gap-1 text-[#D8AFA0]"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div></div>`);
      if (nextSession.value) {
        _push(`<div><div class="mb-4"><p class="font-[&#39;Lora&#39;] text-lg font-medium text-[#5D4A44] mb-1">${ssrInterpolate(formatDate(nextSession.value.date))}</p><div class="flex items-center gap-4 text-sm font-[&#39;Lato&#39;] text-[#5D4A44]/70"><div class="flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>${ssrInterpolate(nextSession.value.time)}</span></div><span class="text-[#5D4A44]/30">\u2022</span><div class="flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg><span class="capitalize">${ssrInterpolate(nextSession.value.modality)}</span></div><span class="text-[#5D4A44]/30">\u2022</span><span>${ssrInterpolate(nextSession.value.duration)} min</span></div></div>`);
        if (nextSession.value.note) {
          _push(`<div class="mb-4 p-3 bg-[#F9F7F3] rounded-xl border-l-4 border-[#D8AFA0]"><p class="font-[&#39;Lato&#39;] text-sm text-[#5D4A44]/80">${ssrInterpolate(nextSession.value.note)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex items-center gap-3"><button${ssrIncludeBooleanAttr(!canJoin.value) ? " disabled" : ""} class="${ssrRenderClass([
          "flex-1 py-2.5 rounded-xl font-medium text-white transition-all duration-300 ease-in-out",
          canJoin.value ? "bg-[#D8AFA0] hover:bg-[#C99F90] hover:shadow-md hover:scale-[1.02]" : "bg-[#D8AFA0]/50 cursor-not-allowed"
        ])}" style="${ssrRenderStyle({ "font-family": "'Lato', sans-serif" })}">${ssrInterpolate(actionButtonText.value)}</button>`);
        if (timeUntilSession.value) {
          _push(`<div class="text-right"><p class="font-[&#39;Lato&#39;] text-xs text-[#5D4A44]/60 whitespace-nowrap">${ssrInterpolate(timeUntilSession.value)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<div class="text-center py-6"><div class="inline-block mb-3 text-4xl opacity-30">\u{1F4C5}</div><p class="font-[&#39;Lato&#39;] text-sm text-[#5D4A44]/60 mb-3"> No tienes sesiones programadas pr\xF3ximamente </p><button class="px-5 py-2 rounded-full bg-[#D8AFA0] text-white font-medium text-sm hover:bg-[#C99F90] transition-all duration-300 ease-in-out hover:scale-105" style="${ssrRenderStyle({ "font-family": "'Lato', sans-serif" })}"> Agendar sesi\xF3n </button></div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/NextSessionCard.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = {
  __name: "DashboardHeaderGreeting",
  __ssrInlineRender: true,
  props: {
    userName: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    const hour = (/* @__PURE__ */ new Date()).getHours();
    const greeting = computed(() => {
      if (hour < 12) return "Buenos d\xEDas";
      if (hour < 19) return "Buenas tardes";
      return "Buenas noches";
    });
    const greetingIcon = computed(() => {
      if (hour < 12) return "\u{1F33F}";
      if (hour < 19) return "\u2600\uFE0F";
      return "\u{1F319}";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mb-6" }, _attrs))} data-v-4c863cfb><h1 class="font-[&#39;Lato&#39;] text-2xl sm:text-3xl text-[#5D4A44] mb-1 flex items-center gap-2" data-v-4c863cfb>${ssrInterpolate(greeting.value)} <span class="text-3xl" data-v-4c863cfb>${ssrInterpolate(greetingIcon.value)}</span></h1></div>`);
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/HeaderGreeting.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const HeaderGreeting = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-4c863cfb"]]);
const _sfc_main$2 = {
  __name: "DashboardEmotionTracker",
  __ssrInlineRender: true,
  setup(__props) {
    const selectedEmotion = ref(null);
    const selectedTags = ref([]);
    const reflection = ref("");
    const submitted = ref(false);
    const isSubmitting = ref(false);
    const mainEmotions = [
      { value: 5, emoji: "\u{1F600}", label: "Muy bien" },
      { value: 4, emoji: "\u{1F60C}", label: "Bien" },
      { value: 3, emoji: "\u{1F610}", label: "Normal" },
      { value: 2, emoji: "\u{1F614}", label: "Triste" },
      { value: 1, emoji: "\u{1F62D}", label: "Muy mal" }
    ];
    const emotionTags = [
      "Tranquilo/a",
      "Ansioso/a",
      "Esperanzado/a",
      "Cansado/a",
      "Motivado/a",
      "Abrumado/a",
      "Agradecido/a",
      "Confundido/a"
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.05)] border border-[#EAD5D3]/30 p-6" }, _attrs))} data-v-2fde22bb><h2 class="font-[&#39;Lora&#39;] text-2xl text-[#5D4A44] mb-6" data-v-2fde22bb> \xBFC\xF3mo te sientes hoy? </h2>`);
      if (!submitted.value) {
        _push(`<div data-v-2fde22bb><div class="mb-6" data-v-2fde22bb><div class="flex justify-around gap-3" data-v-2fde22bb><!--[-->`);
        ssrRenderList(mainEmotions, (emotion) => {
          _push(`<button class="${ssrRenderClass([
            "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 ease-in-out",
            selectedEmotion.value === emotion.value ? "bg-[#D8AFA0]/20 ring-2 ring-[#D8AFA0] scale-110" : "bg-[#F9F7F3] hover:bg-[#EAD5D3]/30 hover:scale-105"
          ])}" data-v-2fde22bb><span class="text-6xl transition-transform duration-300 ease-in-out hover:scale-110" data-v-2fde22bb>${ssrInterpolate(emotion.emoji)}</span><span class="font-[&#39;Lato&#39;] text-xs text-[#5D4A44]/70" data-v-2fde22bb>${ssrInterpolate(emotion.label)}</span></button>`);
        });
        _push(`<!--]--></div></div><div class="mb-6" data-v-2fde22bb><p class="font-[&#39;Lato&#39;] text-sm text-[#5D4A44]/70 mb-3" data-v-2fde22bb> Emociones espec\xEDficas (opcional) </p><div class="flex overflow-x-auto snap-x snap-mandatory gap-2 pb-2 -mx-1 px-1 scrollbar-hide" data-v-2fde22bb><!--[-->`);
        ssrRenderList(emotionTags, (tag) => {
          _push(`<button class="${ssrRenderClass([
            "flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm transition-all duration-300 ease-in-out",
            selectedTags.value.includes(tag) ? "bg-[#D8AFA0] text-white scale-105" : "bg-[#F9F7F3] text-[#5D4A44]/70 hover:bg-[#EAD5D3]/50"
          ])}" style="${ssrRenderStyle({ "font-family": "'Lato', sans-serif" })}" data-v-2fde22bb>${ssrInterpolate(tag)}</button>`);
        });
        _push(`<!--]--></div></div><div class="mb-6" data-v-2fde22bb><textarea rows="3" placeholder="Escribe lo que sientes, sin juicios\u2026" class="w-full px-4 py-3 rounded-xl border border-[#EAD5D3]/50 bg-[#F9F7F3]/50 font-[&#39;Lato&#39;] text-[#5D4A44] placeholder:text-[#5D4A44]/40 focus:outline-none focus:ring-2 focus:ring-[#D8AFA0] focus:border-transparent transition-all duration-300 ease-in-out" data-v-2fde22bb>${ssrInterpolate(reflection.value)}</textarea></div><button${ssrIncludeBooleanAttr(!selectedEmotion.value || isSubmitting.value) ? " disabled" : ""} class="${ssrRenderClass([
          "w-full py-3 rounded-xl font-medium text-white transition-all duration-300 ease-in-out",
          selectedEmotion.value && !isSubmitting.value ? "bg-[#D8AFA0] hover:bg-[#C99F90] hover:shadow-md hover:scale-[1.02]" : "bg-[#D8AFA0]/50 cursor-not-allowed"
        ])}" style="${ssrRenderStyle({ "font-family": "'Lato', sans-serif" })}" data-v-2fde22bb>${ssrInterpolate(isSubmitting.value ? "Registrando..." : "Registrar")}</button></div>`);
      } else {
        _push(`<div class="text-center py-8 animate-fadeIn" data-v-2fde22bb><div class="inline-block mb-4 text-6xl animate-float" data-v-2fde22bb>\u{1F33F}</div><p class="font-[&#39;Lato&#39;] text-base text-[#5D4A44] mb-2" data-v-2fde22bb> Gracias por compartir c\xF3mo te sientes hoy. </p><button class="mt-4 px-6 py-2 rounded-full bg-[#D8AFA0]/20 text-[#D8AFA0] font-[&#39;Lato&#39;] text-sm hover:bg-[#D8AFA0]/30 transition-all duration-300 ease-in-out" data-v-2fde22bb> Registrar otro momento </button></div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/EmotionTracker.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const EmotionTracker = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-2fde22bb"]]);
const _sfc_main$1 = {
  __name: "DashboardResourceGrid",
  __ssrInlineRender: true,
  setup(__props) {
    const resources = ref([
      {
        id: 1,
        icon: "\u{1F9D8}\u200D\u2640\uFE0F",
        category: "Meditaci\xF3n",
        title: "Respiraci\xF3n consciente",
        description: "Ejercicio guiado para calmar la ansiedad y centrarte en el presente.",
        duration: "5 min",
        isNew: true,
        link: "/recursos/respiracion-consciente"
      },
      {
        id: 2,
        icon: "\u{1F4D6}",
        category: "Lectura",
        title: "Gesti\xF3n de emociones",
        description: "Art\xEDculo sobre c\xF3mo identificar y validar tus emociones sin juzgarlas.",
        duration: "8 min",
        isNew: false,
        link: "/recursos/gestion-emociones"
      },
      {
        id: 3,
        icon: "\u{1F3A7}",
        category: "Audio",
        title: "Meditaci\xF3n para dormir",
        description: "Audio relajante que te ayudar\xE1 a desconectar y descansar profundamente.",
        duration: "15 min",
        isNew: true,
        link: "/recursos/meditacion-dormir"
      }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.05)] border border-[#EAD5D3]/30 p-5" }, _attrs))} data-v-776bb26f><div class="flex items-center justify-between mb-4" data-v-776bb26f><h2 class="font-[&#39;Lora&#39;] text-xl text-[#5D4A44]" data-v-776bb26f> Recursos para ti </h2><button class="font-[&#39;Lato&#39;] text-sm text-[#D8AFA0] hover:text-[#C99F90] transition-colors flex items-center gap-1" data-v-776bb26f> Ver todos <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-776bb26f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-v-776bb26f></path></svg></button></div>`);
      if (resources.value.length > 0) {
        _push(`<div class="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-1 px-1 scrollbar-hide" data-v-776bb26f><!--[-->`);
        ssrRenderList(resources.value, (resource) => {
          _push(`<div class="flex-shrink-0 snap-start w-64 group p-4 bg-[#F9F7F3] rounded-2xl border border-transparent hover:border-[#D8AFA0]/30 hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer" data-v-776bb26f><div class="mb-3 w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 ease-in-out" data-v-776bb26f>${ssrInterpolate(resource.icon)}</div><span class="inline-block px-2.5 py-1 mb-2 text-xs font-[&#39;Lato&#39;] rounded-full bg-[#D8AFA0]/20 text-[#D8AFA0]" data-v-776bb26f>${ssrInterpolate(resource.category)}</span><h3 class="font-[&#39;Lora&#39;] text-base text-[#5D4A44] mb-2 group-hover:text-[#D8AFA0] transition-colors line-clamp-2" data-v-776bb26f>${ssrInterpolate(resource.title)}</h3><p class="font-[&#39;Lato&#39;] text-sm text-[#5D4A44]/70 mb-3 line-clamp-2" data-v-776bb26f>${ssrInterpolate(resource.description)}</p><div class="flex items-center gap-3 text-xs font-[&#39;Lato&#39;] text-[#5D4A44]/50" data-v-776bb26f>`);
          if (resource.duration) {
            _push(`<span class="flex items-center gap-1" data-v-776bb26f><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-776bb26f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" data-v-776bb26f></path></svg> ${ssrInterpolate(resource.duration)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (resource.isNew) {
            _push(`<span class="px-2 py-0.5 bg-[#D8AFA0] text-white rounded-full" data-v-776bb26f> Nuevo </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="text-center py-6" data-v-776bb26f><div class="inline-block mb-3 text-4xl opacity-30" data-v-776bb26f>\u{1F4DA}</div><p class="font-[&#39;Lato&#39;] text-sm text-[#5D4A44]/60" data-v-776bb26f> No hay recursos disponibles en este momento </p></div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/ResourceGrid.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ResourceGrid = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-776bb26f"]]);
const _sfc_main = {
  __name: "dashboard",
  __ssrInlineRender: true,
  setup(__props) {
    const loading = ref(true);
    const nombrePaciente = ref("");
    ref("stable");
    ref(3);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LoadingSpinner = _sfc_main$6;
      const _component_ClientOnly = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-[#F9F7F3]" }, _attrs))} data-v-7517bdb5>`);
      if (loading.value) {
        _push(ssrRenderComponent(_component_LoadingSpinner, {
          text: "Cargando tu espacio personal...",
          "full-height": ""
        }, null, _parent));
      } else {
        _push(`<div class="max-w-5xl mx-auto px-4 py-6 sm:px-8 space-y-6" data-v-7517bdb5>`);
        _push(ssrRenderComponent(DailyQuote, null, null, _parent));
        _push(ssrRenderComponent(_sfc_main$4, null, null, _parent));
        _push(ssrRenderComponent(HeaderGreeting, { "user-name": nombrePaciente.value }, null, _parent));
        _push(ssrRenderComponent(EmotionTracker, null, null, _parent));
        _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
        _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
        _push(ssrRenderComponent(ResourceGrid, null, null, _parent));
        _push(`<div class="text-center py-4" data-v-7517bdb5><p class="font-[&#39;Lato&#39;] text-sm text-[#5D4A44]/60" data-v-7517bdb5> Tu bienestar es un camino, no una meta. \u{1F33F} </p></div></div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/paciente/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const dashboard = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7517bdb5"]]);

export { dashboard as default };
//# sourceMappingURL=dashboard-ePiwUDY5.mjs.map
