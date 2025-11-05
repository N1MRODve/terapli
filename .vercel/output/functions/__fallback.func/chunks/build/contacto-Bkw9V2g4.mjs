import { _ as __nuxt_component_0 } from './nuxt-link-CboeUkiO.mjs';
import { ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent } from 'vue/server-renderer';
import { f as useSeoMeta } from './server.mjs';
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

const _sfc_main = {
  __name: "contacto",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "Contacto - Psic\xF3loga Karem",
      description: "Ponte en contacto conmigo para agendar tu primera sesi\xF3n o resolver cualquier duda sobre terapia psicol\xF3gica.",
      ogTitle: "Contacto - Psic\xF3loga Karem",
      ogDescription: "Ponte en contacto conmigo para agendar tu primera sesi\xF3n o resolver cualquier duda sobre terapia psicol\xF3gica.",
      ogImage: "/og-image.jpg",
      twitterCard: "summary_large_image"
    });
    const form = ref({
      nombre: "",
      email: "",
      telefono: "",
      mensaje: ""
    });
    const enviando = ref(false);
    const mensajeEnviado = ref(false);
    const error = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-fondo" }, _attrs))}><section class="pt-24 pb-16 px-4"><div class="max-w-6xl mx-auto"><div class="text-center mb-12"><h1 class="font-serif text-4xl md:text-5xl font-bold text-cafe mb-4"> Contacto </h1><p class="text-lg text-cafe/70 max-w-2xl mx-auto"> \xBFTienes preguntas? Estoy aqu\xED para acompa\xF1arte en tu proceso. Cont\xE1ctame y juntos encontraremos el mejor camino. </p></div><div class="grid md:grid-cols-2 gap-8"><div class="bg-white rounded-2xl shadow-lg p-8 space-y-6"><h2 class="font-serif text-2xl font-semibold text-cafe mb-6"> Informaci\xF3n de Contacto </h2><div class="flex items-start gap-4"><div class="w-12 h-12 bg-terracota/10 rounded-full flex items-center justify-center flex-shrink-0"><svg class="w-6 h-6 text-terracota" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div><div><h3 class="font-semibold text-cafe mb-1">Email</h3><a href="mailto:karemeyde@gmail.com" class="text-terracota hover:text-terracota/80 transition-colors"> karemeyde@gmail.com </a></div></div><div class="flex items-start gap-4"><div class="w-12 h-12 bg-terracota/10 rounded-full flex items-center justify-center flex-shrink-0"><svg class="w-6 h-6 text-terracota" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path></svg></div><div><h3 class="font-semibold text-cafe mb-1">WhatsApp</h3><p class="text-cafe/70"> Escr\xEDbeme para agendar tu cita o resolver dudas </p></div></div><div class="flex items-start gap-4"><div class="w-12 h-12 bg-terracota/10 rounded-full flex items-center justify-center flex-shrink-0"><svg class="w-6 h-6 text-terracota" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><div><h3 class="font-semibold text-cafe mb-1">Horario de Atenci\xF3n</h3><p class="text-cafe/70"> Lunes a Viernes: 9:00 AM - 7:00 PM<br> S\xE1bados: 10:00 AM - 2:00 PM </p></div></div><div class="flex items-start gap-4"><div class="w-12 h-12 bg-terracota/10 rounded-full flex items-center justify-center flex-shrink-0"><svg class="w-6 h-6 text-terracota" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div><div><h3 class="font-semibold text-cafe mb-1">Sesiones</h3><p class="text-cafe/70"> Sesiones presenciales y online<br><span class="text-sm">Adaptadas a tus necesidades</span></p></div></div></div><div class="bg-white rounded-2xl shadow-lg p-8"><h2 class="font-serif text-2xl font-semibold text-cafe mb-6"> Env\xEDame un Mensaje </h2><form class="space-y-4"><div><label for="nombre" class="block text-sm font-medium text-cafe mb-2"> Nombre completo </label><input id="nombre"${ssrRenderAttr("value", unref(form).nombre)} type="text" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracota focus:border-transparent transition-all" placeholder="Tu nombre"></div><div><label for="email" class="block text-sm font-medium text-cafe mb-2"> Email </label><input id="email"${ssrRenderAttr("value", unref(form).email)} type="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracota focus:border-transparent transition-all" placeholder="tu@email.com"></div><div><label for="telefono" class="block text-sm font-medium text-cafe mb-2"> Tel\xE9fono (opcional) </label><input id="telefono"${ssrRenderAttr("value", unref(form).telefono)} type="tel" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracota focus:border-transparent transition-all" placeholder="+34 600 000 000"></div><div><label for="mensaje" class="block text-sm font-medium text-cafe mb-2"> Mensaje </label><textarea id="mensaje" required rows="5" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracota focus:border-transparent transition-all resize-none" placeholder="Cu\xE9ntame en qu\xE9 puedo ayudarte...">${ssrInterpolate(unref(form).mensaje)}</textarea></div><button type="submit"${ssrIncludeBooleanAttr(unref(enviando)) ? " disabled" : ""} class="w-full py-3 bg-terracota hover:bg-terracota/90 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">${ssrInterpolate(unref(enviando) ? "Enviando..." : "Enviar Mensaje")}</button>`);
      if (unref(mensajeEnviado)) {
        _push(`<p class="text-sm text-green-600 text-center"> \u2705 Mensaje enviado correctamente. Te responder\xE9 pronto. </p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="text-sm text-red-600 text-center"> \u274C ${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</form></div></div></div></section><section class="py-16 px-4 bg-white"><div class="max-w-4xl mx-auto text-center"><h2 class="font-serif text-3xl font-semibold text-cafe mb-4"> \xBFLista para comenzar tu proceso? </h2><p class="text-cafe/70 mb-8 max-w-2xl mx-auto"> El primer paso siempre es el m\xE1s importante. Agenda tu primera sesi\xF3n y comencemos juntas este camino de autoconocimiento y crecimiento. </p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/login",
        class: "inline-block px-8 py-4 bg-terracota hover:bg-terracota/90 text-white rounded-lg font-semibold transition-all"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Acceder al Portal `);
          } else {
            return [
              createTextVNode(" Acceder al Portal ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></section></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/contacto.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=contacto-Bkw9V2g4.mjs.map
