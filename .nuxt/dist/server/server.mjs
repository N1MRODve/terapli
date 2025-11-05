import { hasInjectionContext, getCurrentInstance, shallowReactive, reactive, effectScope, getCurrentScope, inject, toRef, isRef, shallowRef, isReadonly, isShallow, isReactive, toRaw, useSSRContext, defineAsyncComponent, defineComponent, h, computed, unref, provide, Suspense, nextTick, mergeProps, ref, Fragment, onErrorCaptured, withCtx, createVNode, toDisplayString, onServerPrefetch, resolveDynamicComponent, createApp } from "vue";
import { $fetch } from "/Users/dieterlorenzo/terapli/node_modules/ofetch/dist/node.mjs";
import { baseURL } from "#internal/nuxt/paths";
import { createHooks } from "/Users/dieterlorenzo/terapli/node_modules/hookable/dist/index.mjs";
import { getContext, executeAsync } from "/Users/dieterlorenzo/terapli/node_modules/unctx/dist/index.mjs";
import { sanitizeStatusCode, createError as createError$1, setCookie, getHeader } from "/Users/dieterlorenzo/terapli/node_modules/h3/dist/index.mjs";
import { START_LOCATION, createMemoryHistory, createRouter as createRouter$1, useRoute as useRoute$1, RouterView } from "vue-router";
import { toRouteMatcher, createRouter } from "/Users/dieterlorenzo/terapli/node_modules/radix3/dist/index.mjs";
import { defu } from "/Users/dieterlorenzo/terapli/node_modules/defu/dist/defu.mjs";
import { withQuery, hasProtocol, isScriptProtocol, joinURL } from "/Users/dieterlorenzo/terapli/node_modules/ufo/dist/index.mjs";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { ssrRenderSlot, ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSuspense, ssrRenderVNode } from "vue/server-renderer";
import { Analytics } from "@vercel/analytics/nuxt";
import { useHead as useHead$1, useSeoMeta as useSeoMeta$1, headSymbol } from "/Users/dieterlorenzo/terapli/node_modules/@unhead/vue/dist/index.mjs";
if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const appLayoutTransition = false;
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    versions: {
      get nuxt() {
        return "4.1.3";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    const unresolvedPluginsForThisPlugin = plugin2.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.add(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin2.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin2.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const LayoutMetaSymbol = Symbol("layout-meta");
const PageRouteSymbol = Symbol("route");
import.meta.url.replace(/\/app\/.*$/, "/");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const URL_QUOTE_RE = /"/g;
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(URL_QUOTE_RE, "%22");
        const encodedHeader = encodeURL(location2, isExternalHost);
        nuxtApp.ssrContext._renderResponse = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  return options?.replace ? router.replace(to) : router.push(to);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  return nuxtError;
};
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    nuxtApp.vueApp.use(head);
  }
});
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
async function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  {
    useNuxtApp().ssrContext._preloadManifest = true;
    const _routeRulesMatcher = toRouteMatcher(
      createRouter({ routes: (/* @__PURE__ */ useRuntimeConfig()).nitro.routeRules })
    );
    return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
  }
}
const __nuxt_page_meta$A = {
  middleware: async () => {
    return navigateTo("/login");
  }
};
const __nuxt_page_meta$z = {
  layout: false
};
const __nuxt_page_meta$y = {
  layout: "default"
};
const __nuxt_page_meta$x = {
  layout: "admin"
};
const __nuxt_page_meta$w = {
  layout: "terapeuta"
};
const __nuxt_page_meta$v = {
  layout: "paciente"
};
const __nuxt_page_meta$u = {
  layout: "admin"
};
const __nuxt_page_meta$t = {
  layout: "admin"
};
const __nuxt_page_meta$s = {
  layout: false
  // Sin layout para página de login
  // Sin middleware para permitir acceso
};
const __nuxt_page_meta$r = {
  layout: "admin"
};
const __nuxt_page_meta$q = {
  layout: "terapeuta"
};
const __nuxt_page_meta$p = {
  layout: "paciente"
};
const __nuxt_page_meta$o = {
  layout: "paciente"
};
const __nuxt_page_meta$n = {
  layout: "paciente"
};
const __nuxt_page_meta$m = {
  layout: false
};
const __nuxt_page_meta$l = {
  layout: "coordinadora"
};
const __nuxt_page_meta$k = {
  layout: "paciente"
};
const __nuxt_page_meta$j = {
  layout: "terapeuta"
};
const __nuxt_page_meta$i = {
  layout: "terapeuta"
};
const __nuxt_page_meta$h = {
  layout: "coordinacion"
};
const __nuxt_page_meta$g = {
  layout: "coordinadora"
};
const __nuxt_page_meta$f = {
  layout: "terapeuta"
};
const __nuxt_page_meta$e = {
  layout: "terapeuta"
};
const __nuxt_page_meta$d = {
  layout: "terapeuta"
};
const __nuxt_page_meta$c = {
  layout: "terapeuta"
};
const __nuxt_page_meta$b = {
  layout: "coordinadora"
};
const __nuxt_page_meta$a = {
  layout: "coordinadora"
};
const __nuxt_page_meta$9 = {
  layout: "coordinadora"
};
const __nuxt_page_meta$8 = {
  layout: "coordinadora"
};
const __nuxt_page_meta$7 = {
  layout: "coordinadora"
};
const __nuxt_page_meta$6 = {
  layout: "terapeuta"
};
const __nuxt_page_meta$5 = {
  layout: "terapeuta"
};
const __nuxt_page_meta$4 = {
  layout: "terapeuta"
};
const __nuxt_page_meta$3 = {
  layout: "coordinadora"
};
const __nuxt_page_meta$2 = {
  layout: "coordinadora"
};
const __nuxt_page_meta$1 = {
  layout: "coordinadora"
};
const __nuxt_page_meta = {
  layout: "dashboard"
};
const _routes = [
  {
    name: "index",
    path: "/",
    meta: __nuxt_page_meta$A || {},
    component: () => import("./_nuxt/index-CwXkOUo-.js")
  },
  {
    name: "login",
    path: "/login",
    meta: __nuxt_page_meta$z || {},
    component: () => import("./_nuxt/login-BEgPp5OT.js")
  },
  {
    name: "contacto",
    path: "/contacto",
    meta: __nuxt_page_meta$y || {},
    component: () => import("./_nuxt/contacto-C86lbK82.js")
  },
  {
    name: "dashboard",
    path: "/dashboard",
    meta: { "middleware": ["auth", "auth-role"] },
    component: () => import("./_nuxt/dashboard-BbbLLB-J.js")
  },
  {
    name: "admin",
    path: "/admin",
    meta: { ...__nuxt_page_meta$x || {}, ...{ "middleware": ["admin-auth"] } },
    component: () => import("./_nuxt/index-Cr-c_zBi.js")
  },
  {
    name: "agenda",
    path: "/agenda",
    meta: { ...__nuxt_page_meta$w || {}, ...{ "middleware": "auth" } },
    component: () => import("./_nuxt/index-zH4ko6Cv.js")
  },
  {
    name: "legal-cookies",
    path: "/legal/cookies",
    component: () => import("./_nuxt/cookies-D679jad1.js")
  },
  {
    name: "paciente-bono",
    path: "/paciente/bono",
    meta: { ...__nuxt_page_meta$v || {}, ...{ "middleware": "auth" } },
    component: () => import("./_nuxt/bono-w-_Tb6TR.js")
  },
  {
    name: "admin-finanzas",
    path: "/admin/finanzas",
    meta: { ...__nuxt_page_meta$u || {}, ...{ "middleware": ["admin-auth"] } },
    component: () => import("./_nuxt/finanzas-DACMPLO4.js")
  },
  {
    name: "ejemplo-agenda",
    path: "/ejemplo-agenda",
    meta: { "middleware": "auth" },
    component: () => import("./_nuxt/ejemplo-agenda-BNieH30q.js")
  },
  {
    name: "paciente",
    path: "/paciente",
    meta: { "middleware": "auth" },
    component: () => import("./_nuxt/index-xRncg1ww.js")
  },
  {
    name: "admin-pacientes",
    path: "/admin/pacientes",
    meta: { ...__nuxt_page_meta$t || {}, ...{ "middleware": ["admin-auth"] } },
    component: () => import("./_nuxt/pacientes-p7uzohW8.js")
  },
  {
    name: "terapeuta-login",
    path: "/terapeuta/login",
    meta: { ...__nuxt_page_meta$s || {}, ...{ "middleware": [] } },
    component: () => import("./_nuxt/login-DUaceMoY.js")
  },
  {
    name: "admin-terapeutas",
    path: "/admin/terapeutas",
    meta: { ...__nuxt_page_meta$r || {}, ...{ "middleware": ["admin-auth"] } },
    component: () => import("./_nuxt/terapeutas-53kPHukX.js")
  },
  {
    name: "legal-privacidad",
    path: "/legal/privacidad",
    component: () => import("./_nuxt/privacidad-TL4vVrcE.js")
  },
  {
    name: "terapeuta-agenda",
    path: "/terapeuta/agenda",
    meta: { ...__nuxt_page_meta$q || {}, ...{ "middleware": "auth" } },
    component: () => import("./_nuxt/agenda-BZLj3pN4.js")
  },
  {
    name: "legal-aviso-legal",
    path: "/legal/aviso-legal",
    component: () => import("./_nuxt/aviso-legal-DRgaYeMg.js")
  },
  {
    name: "paciente-mensajes",
    path: "/paciente/mensajes",
    meta: { ...__nuxt_page_meta$p || {}, ...{ "middleware": "auth" } },
    component: () => import("./_nuxt/mensajes-I9VgYl8k.js")
  },
  {
    name: "paciente-recursos",
    path: "/paciente/recursos",
    meta: { ...__nuxt_page_meta$o || {}, ...{ "middleware": "auth" } },
    component: () => import("./_nuxt/recursos-yNY2-4tu.js")
  },
  {
    name: "paciente-sesiones",
    path: "/paciente/sesiones",
    meta: { ...__nuxt_page_meta$n || {}, ...{ "middleware": "auth" } },
    component: () => import("./_nuxt/sesiones-BXjtKdni.js")
  },
  {
    name: "coordinacion-login",
    path: "/coordinacion/login",
    meta: __nuxt_page_meta$m || {},
    component: () => import("./_nuxt/login-CLyQphrm.js")
  },
  {
    name: "coordinacion-pagos",
    path: "/coordinacion/pagos",
    component: () => import("./_nuxt/pagos-BinS2ZXw.js")
  },
  {
    name: "coordinadora-pagos",
    path: "/coordinadora/pagos",
    meta: { ...__nuxt_page_meta$l || {}, ...{ "middleware": ["auth", "role-coordinadora"] } },
    component: () => import("./_nuxt/pagos-C7Ce3SnS.js")
  },
  {
    name: "paciente-dashboard",
    path: "/paciente/dashboard",
    meta: { ...__nuxt_page_meta$k || {}, ...{ "middleware": "auth" } },
    component: () => import("./_nuxt/dashboard-ePiwUDY5.js")
  },
  {
    name: "terapeuta-mensajes",
    path: "/terapeuta/mensajes",
    meta: { ...__nuxt_page_meta$j || {}, ...{ "middleware": "auth" } },
    component: () => import("./_nuxt/mensajes-KvctJL5Z.js")
  },
  {
    name: "terapeuta-recursos",
    path: "/terapeuta/recursos",
    meta: { ...__nuxt_page_meta$i || {}, ...{ "middleware": "auth" } },
    component: () => import("./_nuxt/recursos-QLHBG_-x.js")
  },
  {
    name: "coordinacion-agenda",
    path: "/coordinacion/agenda",
    meta: __nuxt_page_meta$h || {},
    component: () => import("./_nuxt/agenda-BIm77Ave.js")
  },
  {
    name: "coordinadora-agenda",
    path: "/coordinadora/agenda",
    meta: { ...__nuxt_page_meta$g || {}, ...{ "middleware": ["auth", "role-coordinadora"] } },
    component: () => import("./_nuxt/agenda-Dylwur4O.js")
  },
  {
    name: "terapeuta-dashboard",
    path: "/terapeuta/dashboard",
    meta: { ...__nuxt_page_meta$f || {}, ...{ "middleware": ["auth-terapeuta"] } },
    component: () => import("./_nuxt/dashboard-DE0q7763.js")
  },
  {
    name: "terapeuta-pacientes",
    path: "/terapeuta/pacientes",
    meta: __nuxt_page_meta$c || {},
    component: () => import("./_nuxt/pacientes-BPB0IjLK.js"),
    children: [
      {
        name: "terapeuta-pacientes-id",
        path: ":id()",
        meta: __nuxt_page_meta$d || {},
        component: () => import("./_nuxt/_id_-Dkiqj3ie.js"),
        children: [
          {
            name: "terapeuta-pacientes-id-bonos",
            path: "bonos",
            meta: __nuxt_page_meta$e || {},
            component: () => import("./_nuxt/bonos-0bodcLXQ.js")
          }
        ]
      }
    ]
  },
  {
    name: "coordinacion-mensajes",
    path: "/coordinacion/mensajes",
    component: () => import("./_nuxt/mensajes-CcOwygxE.js")
  },
  {
    name: "coordinadora-mensajes",
    path: "/coordinadora/mensajes",
    meta: { ...__nuxt_page_meta$b || {}, ...{ "middleware": ["auth", "role-coordinadora"] } },
    component: () => import("./_nuxt/mensajes-KCUB3WM6.js")
  },
  {
    name: "coordinacion-dashboard",
    path: "/coordinacion/dashboard",
    component: () => import("./_nuxt/dashboard-DceEhoEM.js")
  },
  {
    name: "coordinadora-dashboard",
    path: "/coordinadora/dashboard",
    meta: { ...__nuxt_page_meta$a || {}, ...{ "middleware": ["auth", "role-coordinadora"] } },
    component: () => import("./_nuxt/dashboard-CS5udT1O.js")
  },
  {
    name: "coordinadora-pacientes",
    path: "/coordinadora/pacientes",
    meta: { ...__nuxt_page_meta$7 || {}, ...{ "middleware": ["auth", "role-coordinadora"] } },
    component: () => import("./_nuxt/pacientes-Q2Wjet9i.js"),
    children: [
      {
        name: "coordinadora-pacientes-id",
        path: ":id()",
        meta: { ...__nuxt_page_meta$9 || {}, ...{ "middleware": ["auth", "role-coordinadora"] } },
        component: () => import("./_nuxt/_id_-CnwAzCzu.js")
      },
      {
        name: "coordinadora-pacientes-nuevo",
        path: "nuevo",
        meta: { ...__nuxt_page_meta$8 || {}, ...{ "middleware": ["auth", "role-coordinadora"] } },
        component: () => import("./_nuxt/nuevo-9hWhc-Gp.js")
      }
    ]
  },
  {
    name: "ejemplo-sistema-diseno",
    path: "/ejemplo-sistema-diseno",
    component: () => import("./_nuxt/ejemplo-sistema-diseno-DvvUhV3B.js")
  },
  {
    name: "terapeuta-configuracion",
    path: "/terapeuta/configuracion",
    meta: __nuxt_page_meta$6 || {},
    component: () => import("./_nuxt/configuracion-D2kZ1yKy.js")
  },
  {
    name: "terapeuta-sesiones-id",
    path: "/terapeuta/sesiones/:id()",
    meta: { ...__nuxt_page_meta$5 || {}, ...{ "middleware": ["auth-terapeuta"] } },
    component: () => import("./_nuxt/_id_-BgdLq3Xu.js")
  },
  {
    name: "terapeuta-sesiones",
    path: "/terapeuta/sesiones",
    meta: { ...__nuxt_page_meta$4 || {}, ...{ "middleware": "auth" } },
    component: () => import("./_nuxt/index-DNqz321y.js")
  },
  {
    name: "coordinadora-pacientes-old",
    path: "/coordinadora/pacientes-old",
    meta: { ...__nuxt_page_meta$3 || {}, ...{ "middleware": ["auth", "role-coordinadora"] } },
    component: () => import("./_nuxt/pacientes-old-qq4FLqx6.js")
  },
  {
    name: "coordinadora-recordatorios",
    path: "/coordinadora/recordatorios",
    meta: { ...__nuxt_page_meta$2 || {}, ...{ "middleware": ["auth", "role-coordinadora"] } },
    component: () => import("./_nuxt/recordatorios-DSvEb2sg.js")
  },
  {
    name: "coordinadora-confirmaciones",
    path: "/coordinadora/confirmaciones",
    meta: { ...__nuxt_page_meta$1 || {}, ...{ "middleware": ["auth", "role-coordinadora"] } },
    component: () => import("./_nuxt/confirmaciones-D296wk2n.js")
  },
  {
    name: "coordinadora-notificaciones",
    path: "/coordinadora/notificaciones",
    meta: { ...__nuxt_page_meta || {}, ...{ "middleware": "auth" } },
    component: () => import("./_nuxt/notificaciones-BmTzPzv5.js")
  }
];
const _wrapInTransition = (props, children) => {
  return { default: () => children.default?.() };
};
const ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE = /:\w+/g;
function generateRouteKey(route) {
  const source = route?.meta.key ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => route.params[r.slice(1)]?.toString() || "");
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to, from) {
  if (to === from || from === START_LOCATION) {
    return false;
  }
  if (generateRouteKey(to) !== generateRouteKey(from)) {
    return true;
  }
  const areComponentsSame = to.matched.every(
    (comp, index) => comp.components && comp.components.default === from.matched[index]?.components?.default
  );
  if (areComponentsSame) {
    return false;
  }
  return true;
}
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();
    const hashScrollBehaviour = useRouter().options?.scrollBehaviorType ?? "auto";
    if (to.path.replace(/\/$/, "") === from.path.replace(/\/$/, "")) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior: hashScrollBehaviour };
      }
      return false;
    }
    const routeAllowsScrollToTop = typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop;
    if (routeAllowsScrollToTop === false) {
      return false;
    }
    const hookToWait = nuxtApp._runningTransition ? "page:transition:finish" : "page:loading:end";
    return new Promise((resolve) => {
      if (from === START_LOCATION) {
        resolve(_calculatePosition(to, from, savedPosition, hashScrollBehaviour));
        return;
      }
      nuxtApp.hooks.hookOnce(hookToWait, () => {
        requestAnimationFrame(() => resolve(_calculatePosition(to, from, savedPosition, hashScrollBehaviour)));
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = (void 0).querySelector(selector);
    if (elem) {
      return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
    }
  } catch {
  }
  return 0;
}
function _calculatePosition(to, from, savedPosition, defaultHashScrollBehaviour) {
  if (savedPosition) {
    return savedPosition;
  }
  const isPageNavigation = isChangingPage(to, from);
  if (to.hash) {
    return {
      el: to.hash,
      top: _getHashElementScrollMarginTop(to.hash),
      behavior: isPageNavigation ? defaultHashScrollBehaviour : "instant"
    };
  }
  return {
    left: 0,
    top: 0
  };
}
const configRouterOptions = {
  scrollBehaviorType: "smooth",
  hashMode: false
};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to, from) => {
  let __temp, __restore;
  if (!to.meta?.validate) {
    return;
  }
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  const error = createError({
    fatal: false,
    statusCode: result && result.statusCode || 404,
    statusMessage: result && result.statusMessage || `Page Not Found: ${to.fullPath}`,
    data: {
      path: to.fullPath
    }
  });
  return error;
});
const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const useSupabaseUser = () => useState("supabase_user", () => null);
const auth_45coordinacion_45global = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/coordinacion")) {
    return;
  }
  if (to.path === "/coordinacion/login") {
    return;
  }
  const user = useSupabaseUser();
  if (!user.value) {
    return navigateTo("/coordinacion/login");
  }
  try {
    const userMetadata = user.value.user_metadata || {};
    const appMetadata = user.value.app_metadata || {};
    const rol = userMetadata.rol || appMetadata.rol;
    if (rol !== "coordinacion") {
      console.warn("Usuario intentó acceder a coordinación sin permisos");
      return navigateTo("/");
    }
    return;
  } catch (error) {
    console.error("Error en middleware de coordinación:", error);
    return navigateTo("/coordinacion/login");
  }
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  {
    return;
  }
});
const globalMiddleware = [
  validate,
  auth_45coordinacion_45global,
  manifest_45route_45rule
];
const namedMiddleware = {
  "admin-auth": () => import("./_nuxt/admin-auth-ChkobtFH.js"),
  "auth-role": () => import("./_nuxt/auth-role-BZkJ8HXi.js"),
  "auth-terapeuta": () => import("./_nuxt/auth-terapeuta-CwgvpQQv.js"),
  auth: () => import("./_nuxt/auth-BkiEt3kg.js"),
  "role-coordinadora": () => import("./_nuxt/role-coordinadora-CcWU2Byb.js")
};
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    let __temp, __restore;
    let routerBase = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const history = routerOptions.history?.(routerBase) ?? createMemoryHistory(routerBase);
    const routes = routerOptions.routes ? ([__temp, __restore] = executeAsync(() => routerOptions.routes(_routes)), __temp = await __temp, __restore(), __temp) ?? _routes : _routes;
    let startPosition;
    const router = createRouter$1({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
        if (from === START_LOCATION) {
          startPosition = savedPosition;
          return;
        }
        if (routerOptions.scrollBehavior) {
          router.options.scrollBehavior = routerOptions.scrollBehavior;
          if ("scrollRestoration" in (void 0).history) {
            const unsub = router.beforeEach(() => {
              unsub();
              (void 0).history.scrollRestoration = "manual";
            });
          }
          return routerOptions.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
        }
      },
      history,
      routes
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const initialURL = nuxtApp.ssrContext.url;
    const _route = shallowRef(router.currentRoute.value);
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    nuxtApp.hook("page:finish", syncCurrentRoute);
    router.afterEach((to, from) => {
      if (to.matched[to.matched.length - 1]?.components?.default === from.matched[from.matched.length - 1]?.components?.default) {
        syncCurrentRoute();
      }
    });
    const route = {};
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key],
        enumerable: true
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    if (!nuxtApp.ssrContext?.islandContext) {
      router.afterEach(async (to, _from, failure) => {
        delete nuxtApp._processingMiddleware;
        if (failure) {
          await nuxtApp.callHook("page:loading:end");
        }
        if (failure?.type === 4) {
          return;
        }
        if (to.redirectedFrom && to.fullPath !== initialURL) {
          await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
        }
      });
    }
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const resolvedInitialRoute = router.currentRoute.value;
    syncCurrentRoute();
    if (nuxtApp.ssrContext?.islandContext) {
      return { provide: { router } };
    }
    const initialLayout = nuxtApp.payload.state._layout;
    router.beforeEach(async (to, from) => {
      await nuxtApp.callHook("page:loading:start");
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout;
      }
      nuxtApp._processingMiddleware = true;
      if (!nuxtApp.ssrContext?.islandContext) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          for (const entry2 of toArray(componentMiddleware)) {
            middlewareEntries.add(entry2);
          }
        }
        {
          const routeRules = await nuxtApp.runWithContext(() => getRouteRules({ path: to.path }));
          if (routeRules.appMiddleware) {
            for (const key in routeRules.appMiddleware) {
              if (routeRules.appMiddleware[key]) {
                middlewareEntries.add(key);
              } else {
                middlewareEntries.delete(key);
              }
            }
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await namedMiddleware[entry2]?.().then((r) => r.default || r) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          try {
            if (false) ;
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            if (true) {
              if (result === false || result instanceof Error) {
                const error2 = result || createError({
                  statusCode: 404,
                  statusMessage: `Page Not Found: ${initialURL}`
                });
                await nuxtApp.runWithContext(() => showError(error2));
                return false;
              }
            }
            if (result === true) {
              continue;
            }
            if (result === false) {
              return result;
            }
            if (result) {
              if (isNuxtError(result) && result.fatal) {
                await nuxtApp.runWithContext(() => showError(result));
              }
              return result;
            }
          } catch (err) {
            const error2 = createError(err);
            if (error2.fatal) {
              await nuxtApp.runWithContext(() => showError(error2));
            }
            return error2;
          }
        }
      }
    });
    router.onError(async () => {
      delete nuxtApp._processingMiddleware;
      await nuxtApp.callHook("page:loading:end");
    });
    router.afterEach((to) => {
      if (to.matched.length === 0) {
        return nuxtApp.runWithContext(() => showError(createError({
          statusCode: 404,
          fatal: false,
          statusMessage: `Page not found: ${to.fullPath}`,
          data: {
            path: to.fullPath
          }
        })));
      }
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        if ("name" in resolvedInitialRoute) {
          resolvedInitialRoute.name = void 0;
        }
        await router.replace({
          ...resolvedInitialRoute,
          force: true
        });
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
async function fetchWithRetry(req, init) {
  const retries = 3;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(req, init);
    } catch (error) {
      if (init?.signal?.aborted) {
        throw error;
      }
      if (attempt === retries) {
        console.error(`Error fetching request ${req}`, error, init);
        throw error;
      }
      console.warn(`Retrying fetch attempt ${attempt + 1} for request: ${req}`);
      await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
    }
  }
  throw new Error("Unreachable code");
}
function setCookies(event, cookies) {
  const response = event.node.res;
  const headersWritable = () => !response.headersSent && !response.writableEnded;
  if (!headersWritable()) {
    return;
  }
  for (const { name, value, options } of cookies) {
    if (!headersWritable()) {
      break;
    }
    setCookie(event, name, value, options);
  }
}
const serverSupabaseClient = async (event) => {
  if (!event.context._supabaseClient) {
    const { url, key, cookiePrefix, cookieOptions, clientOptions: { auth = {}, global = {} } } = (/* @__PURE__ */ useRuntimeConfig()).public.supabase;
    event.context._supabaseClient = createServerClient(url, key, {
      auth,
      cookies: {
        getAll: () => parseCookieHeader(getHeader(event, "Cookie") ?? ""),
        setAll: (cookies) => setCookies(event, cookies)
      },
      cookieOptions: {
        ...cookieOptions,
        name: cookiePrefix
      },
      global: {
        fetch: fetchWithRetry,
        ...global
      }
    });
  }
  return event.context._supabaseClient;
};
const serverSupabaseUser = async (event) => {
  const client = await serverSupabaseClient(event);
  const { data, error } = await client.auth.getClaims();
  if (error) {
    throw createError$1({ statusMessage: error?.message });
  }
  return data?.claims ?? null;
};
const serverSupabaseSession = async (event) => {
  const client = await serverSupabaseClient(event);
  const { data: { session }, error } = await client.auth.getSession();
  if (error) {
    throw createError$1({ statusMessage: error?.message });
  }
  delete session?.user;
  return session;
};
const useSupabaseSession = () => useState("supabase_session", () => null);
function injectHead(nuxtApp) {
  const nuxt = nuxtApp || useNuxtApp();
  return nuxt.ssrContext?.head || nuxt.runWithContext(() => {
    if (hasInjectionContext()) {
      const head = inject(headSymbol);
      if (!head) {
        throw new Error("[nuxt] [unhead] Missing Unhead instance.");
      }
      return head;
    }
  });
}
function useHead(input, options = {}) {
  const head = options.head || injectHead(options.nuxt);
  return useHead$1(input, { head, ...options });
}
function useSeoMeta(input, options = {}) {
  const head = options.head || injectHead(options.nuxt);
  return useSeoMeta$1(input, { head, ...options });
}
function useRequestEvent(nuxtApp) {
  nuxtApp ||= useNuxtApp();
  return nuxtApp.ssrContext?.event;
}
const supabase_server_NZuw_NDm2ZtOgvg4QqXN_Xqdg_KPvGuBBWKrLH15GWY = /* @__PURE__ */ defineNuxtPlugin({
  name: "supabase",
  enforce: "pre",
  async setup({ provide: provide2 }) {
    let __temp, __restore;
    const { url, key, cookiePrefix, useSsrCookies, cookieOptions, clientOptions } = (/* @__PURE__ */ useRuntimeConfig()).public.supabase;
    const event = useRequestEvent();
    const client = createServerClient(url, key, {
      ...clientOptions,
      cookies: {
        getAll: () => parseCookieHeader(getHeader(event, "Cookie") ?? ""),
        setAll: (cookies) => setCookies(event, cookies)
      },
      cookieOptions: {
        ...cookieOptions,
        name: cookiePrefix
      },
      global: {
        fetch: fetchWithRetry,
        ...clientOptions.global
      }
    });
    provide2("supabase", { client });
    if (useSsrCookies) {
      const [
        session,
        user
      ] = ([__temp, __restore] = executeAsync(() => Promise.all([
        serverSupabaseSession(event).catch(() => null),
        serverSupabaseUser(event).catch(() => null)
      ])), __temp = await __temp, __restore(), __temp);
      useSupabaseSession().value = session;
      useSupabaseUser().value = user;
    }
  }
});
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext._payloadReducers[name] = reduce;
  }
}
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
const components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const pwa_icons_plugin_C24GcIKjcI2zsa8A86om0L2LZjx1chWtzYxD11T7Txg = /* @__PURE__ */ defineNuxtPlugin(() => {
  return {
    provide: {
      pwaIcons: {
        transparent: {},
        maskable: {},
        favicon: {},
        apple: {},
        appleSplashScreen: {}
      }
    }
  };
});
const plugins = [
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  plugin,
  supabase_server_NZuw_NDm2ZtOgvg4QqXN_Xqdg_KPvGuBBWKrLH15GWY,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4,
  pwa_icons_plugin_C24GcIKjcI2zsa8A86om0L2LZjx1chWtzYxD11T7Txg
];
const _sfc_main$3 = /* @__PURE__ */ Object.assign({
  name: "NuxtErrorBoundary",
  inheritAttrs: false
}, {
  __name: "NuxtErrorBoundary",
  __ssrInlineRender: true,
  emits: ["error"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const error = shallowRef(null);
    function clearError() {
      error.value = null;
    }
    __expose({ error, clearError });
    return (_ctx, _push, _parent, _attrs) => {
      if (error.value) {
        ssrRenderSlot(_ctx.$slots, "error", { error: error.value, clearError }, null, _push, _parent);
      } else {
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      }
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const layouts = {
  admin: defineAsyncComponent(() => import("./_nuxt/admin-COSaxqMY.js").then((m) => m.default || m)),
  coordinacion: defineAsyncComponent(() => import("./_nuxt/coordinacion-D2PQmYDi.js").then((m) => m.default || m)),
  coordinadora: defineAsyncComponent(() => import("./_nuxt/coordinadora-B99pHcHp.js").then((m) => m.default || m)),
  default: defineAsyncComponent(() => import("./_nuxt/default-CqTbvf_d.js").then((m) => m.default || m)),
  paciente: defineAsyncComponent(() => import("./_nuxt/paciente-CzG8wURd.js").then((m) => m.default || m)),
  terapeuta: defineAsyncComponent(() => import("./_nuxt/terapeuta-Ch9zBeoS.js").then((m) => m.default || m))
};
const LayoutLoader = defineComponent({
  name: "LayoutLoader",
  inheritAttrs: false,
  props: {
    name: String,
    layoutProps: Object
  },
  setup(props, context) {
    return () => h(layouts[props.name], props.layoutProps, context.slots);
  }
});
const nuxtLayoutProps = {
  name: {
    type: [String, Boolean, Object],
    default: null
  },
  fallback: {
    type: [String, Object],
    default: null
  }
};
const __nuxt_component_0 = defineComponent({
  name: "NuxtLayout",
  inheritAttrs: false,
  props: nuxtLayoutProps,
  setup(props, context) {
    const nuxtApp = useNuxtApp();
    const injectedRoute = inject(PageRouteSymbol);
    const shouldUseEagerRoute = !injectedRoute || injectedRoute === useRoute();
    const route = shouldUseEagerRoute ? useRoute$1() : injectedRoute;
    const layout = computed(() => {
      let layout2 = unref(props.name) ?? route?.meta.layout ?? "default";
      if (layout2 && !(layout2 in layouts)) {
        if (props.fallback) {
          layout2 = unref(props.fallback);
        }
      }
      return layout2;
    });
    const layoutRef = shallowRef();
    context.expose({ layoutRef });
    const done = nuxtApp.deferHydration();
    let lastLayout;
    return () => {
      const hasLayout = layout.value && layout.value in layouts;
      const transitionProps = route?.meta.layoutTransition ?? appLayoutTransition;
      const previouslyRenderedLayout = lastLayout;
      lastLayout = layout.value;
      return _wrapInTransition(hasLayout && transitionProps, {
        default: () => h(Suspense, { suspensible: true, onResolve: () => {
          nextTick(done);
        } }, {
          default: () => h(
            LayoutProvider,
            {
              layoutProps: mergeProps(context.attrs, { ref: layoutRef }),
              key: layout.value || void 0,
              name: layout.value,
              shouldProvide: !props.name,
              isRenderingNewLayout: (name) => {
                return name !== previouslyRenderedLayout && name === layout.value;
              },
              hasTransition: !!transitionProps
            },
            context.slots
          )
        })
      }).default();
    };
  }
});
const LayoutProvider = defineComponent({
  name: "NuxtLayoutProvider",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean]
    },
    layoutProps: {
      type: Object
    },
    hasTransition: {
      type: Boolean
    },
    shouldProvide: {
      type: Boolean
    },
    isRenderingNewLayout: {
      type: Function,
      required: true
    }
  },
  setup(props, context) {
    const name = props.name;
    if (props.shouldProvide) {
      provide(LayoutMetaSymbol, {
        isCurrent: (route) => name === (route.meta.layout ?? "default")
      });
    }
    const injectedRoute = inject(PageRouteSymbol);
    const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute();
    if (isNotWithinNuxtPage) {
      const vueRouterRoute = useRoute$1();
      const reactiveChildRoute = {};
      for (const _key in vueRouterRoute) {
        const key = _key;
        Object.defineProperty(reactiveChildRoute, key, {
          enumerable: true,
          get: () => {
            return props.isRenderingNewLayout(props.name) ? vueRouterRoute[key] : injectedRoute[key];
          }
        });
      }
      provide(PageRouteSymbol, shallowReactive(reactiveChildRoute));
    }
    return () => {
      if (!name || typeof name === "string" && !(name in layouts)) {
        return context.slots.default?.();
      }
      return h(
        LayoutLoader,
        { key: name, layoutProps: props.layoutProps, name },
        context.slots
      );
    };
  }
});
const defineRouteProvider = (name = "RouteProvider") => defineComponent({
  name,
  props: {
    route: {
      type: Object,
      required: true
    },
    vnode: Object,
    vnodeRef: Object,
    renderKey: String,
    trackRootNodes: Boolean
  },
  setup(props) {
    const previousKey = props.renderKey;
    const previousRoute = props.route;
    const route = {};
    for (const key in props.route) {
      Object.defineProperty(route, key, {
        get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
        enumerable: true
      });
    }
    provide(PageRouteSymbol, shallowReactive(route));
    return () => {
      if (!props.vnode) {
        return props.vnode;
      }
      return h(props.vnode, { ref: props.vnodeRef });
    };
  }
});
const RouteProvider = defineRouteProvider();
const __nuxt_component_2 = defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    inject(PageRouteSymbol, null);
    expose({ pageRef });
    inject(LayoutMetaSymbol, null);
    nuxtApp.deferHydration();
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          return h(Suspense, { suspensible: true }, {
            default() {
              return h(RouteProvider, {
                vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
                route: routeProps.route,
                vnodeRef: pageRef
              });
            }
          });
        }
      });
    };
  }
});
function normalizeSlot(slot, data) {
  const slotContent = slot(data);
  return slotContent.length === 1 ? h(slotContent[0]) : h(Fragment, void 0, slotContent);
}
const _sfc_main$2 = {
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    ref(process.env.NODE_ENV === "development");
    onErrorCaptured((error, instance, info) => {
      console.error("Error capturado en app:", error, info);
      return false;
    });
    useHead({
      meta: [
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        { name: "apple-mobile-web-app-title", content: "Teraplí" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "theme-color", content: "#D8AFA0" }
      ],
      link: [
        { rel: "apple-touch-icon", href: "/icons/icon-512x512.png" },
        { rel: "apple-touch-icon", sizes: "192x192", href: "/icons/icon-192x192.png" },
        { rel: "apple-touch-icon", sizes: "512x512", href: "/icons/icon-512x512.png" }
      ]
    });
    ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtErrorBoundary = _sfc_main$3;
      const _component_NuxtLayout = __nuxt_component_0;
      const _component_NuxtPage = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-fondo min-h-screen" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_NuxtErrorBoundary, null, {
        error: withCtx(({ error }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="min-h-screen flex items-center justify-center bg-fondo"${_scopeId}><div class="text-center p-8"${_scopeId}><h1 class="text-2xl font-semibold text-cafe mb-4"${_scopeId}>Oops! Algo salió mal</h1><p class="text-cafe/70 mb-6"${_scopeId}>Ha ocurrido un error inesperado. Por favor, recarga la página.</p><button class="btn btn-primary"${_scopeId}> Recargar página </button><details class="mt-4 text-xs text-cafe/50 cursor-pointer"${_scopeId}><summary${_scopeId}>Detalles del error</summary><pre class="mt-2 text-left bg-cafe/5 p-3 rounded"${_scopeId}>${ssrInterpolate(error)}</pre></details></div></div>`);
          } else {
            return [
              createVNode("div", { class: "min-h-screen flex items-center justify-center bg-fondo" }, [
                createVNode("div", { class: "text-center p-8" }, [
                  createVNode("h1", { class: "text-2xl font-semibold text-cafe mb-4" }, "Oops! Algo salió mal"),
                  createVNode("p", { class: "text-cafe/70 mb-6" }, "Ha ocurrido un error inesperado. Por favor, recarga la página."),
                  createVNode("button", {
                    onClick: ($event) => _ctx.$router.go(0),
                    class: "btn btn-primary"
                  }, " Recargar página ", 8, ["onClick"]),
                  createVNode("details", { class: "mt-4 text-xs text-cafe/50 cursor-pointer" }, [
                    createVNode("summary", null, "Detalles del error"),
                    createVNode("pre", { class: "mt-2 text-left bg-cafe/5 p-3 rounded" }, toDisplayString(error), 1)
                  ])
                ])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLayout, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_NuxtPage, { transition: {
                    name: "fade-route",
                    mode: "out-in"
                  } }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_NuxtPage, { transition: {
                      name: "fade-route",
                      mode: "out-in"
                    } })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLayout, null, {
                default: withCtx(() => [
                  createVNode(_component_NuxtPage, { transition: {
                    name: "fade-route",
                    mode: "out-in"
                  } })
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Analytics), null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    _error.stack ? _error.stack.split("\n").splice(1).map((line) => {
      const text = line.replace("webpack:/", "").replace(".vue", ".js").trim();
      return {
        text,
        internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
      };
    }).map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n") : "";
    const statusCode = Number(_error.statusCode || 500);
    const is404 = statusCode === 404;
    const statusMessage = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import("./_nuxt/error-404-c0KjqOO8.js"));
    const _Error = defineAsyncComponent(() => import("./_nuxt/error-500-CIgul59d.js"));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ statusCode: unref(statusCode), statusMessage: unref(statusMessage), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = /* @__PURE__ */ useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext?._renderResponse) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry$1 = (ssrContext) => entry(ssrContext);
export {
  __nuxt_component_0 as _,
  useRouter as a,
  useNuxtApp as b,
  useRuntimeConfig as c,
  nuxtLinkDefaults as d,
  entry$1 as default,
  useSupabaseUser as e,
  useState as f,
  useSeoMeta as g,
  useRoute as h,
  defineNuxtRouteMiddleware as i,
  navigateTo as n,
  resolveRouteObject as r,
  useHead as u
};
//# sourceMappingURL=server.mjs.map
