import { y as executeAsync } from '../nitro/nitro.mjs';
import { j as defineNuxtRouteMiddleware, h as useSupabaseUser, g as useSupabaseClient, n as navigateTo } from './server.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';
import 'vue';
import 'vue-router';
import '@supabase/ssr';
import 'vue/server-renderer';
import '@vercel/analytics/nuxt';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const authTerapeuta = defineNuxtRouteMiddleware(async (to, from) => {
  var _a, _b;
  let __temp, __restore;
  if (!to.path.startsWith("/terapeuta") || to.path === "/terapeuta/login") {
    return;
  }
  const user = useSupabaseUser();
  const supabase = useSupabaseClient();
  if (!user.value) {
    console.log("[Middleware] Usuario no autenticado, redirigiendo a login");
    return navigateTo("/terapeuta/login", { replace: true });
  }
  try {
    const userId = ((_a = user.value) == null ? void 0 : _a.id) || ((_b = user.value) == null ? void 0 : _b.sub);
    if (!userId) {
      console.error("[Middleware] No se pudo obtener el ID del usuario:", user.value);
      return navigateTo("/terapeuta/login", { replace: true });
    }
    const { data: profileData, error: profileError } = ([__temp, __restore] = executeAsync(() => supabase.from("profiles").select("rol, nombre").eq("id", userId).single()), __temp = await __temp, __restore(), __temp);
    if (profileError) {
      console.error("[Middleware] Error al obtener perfil:", profileError);
      return navigateTo("/terapeuta/login", { replace: true });
    }
    const userRole = profileData == null ? void 0 : profileData.rol;
    const rolesPermitidos = ["terapeuta", "psicologa", "admin", "coordinadora"];
    if (!userRole || !rolesPermitidos.includes(userRole)) {
      console.log(`[Middleware] Usuario con rol '${userRole}' sin acceso, redirigiendo a home`);
      return navigateTo("/", { replace: true });
    }
    console.log(`[Middleware] Acceso autorizado para: ${(profileData == null ? void 0 : profileData.nombre) || "profesional"} (${userRole})`);
  } catch (err) {
    console.error("[Middleware] Error inesperado:", err);
    return navigateTo("/terapeuta/login", { replace: true });
  }
});

export { authTerapeuta as default };
//# sourceMappingURL=auth-terapeuta-KKOfByx5.mjs.map
