import { v as executeAsync } from '../nitro/nitro.mjs';
import { i as defineNuxtRouteMiddleware, e as useSupabaseUser, n as navigateTo } from './server.mjs';
import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import '@supabase/ssr';
import '@vercel/analytics/nuxt';

const authTerapeuta = defineNuxtRouteMiddleware(async (to, from) => {
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
    const userId = user.value?.id || user.value?.sub;
    if (!userId) {
      console.error("[Middleware] No se pudo obtener el ID del usuario:", user.value);
      return navigateTo("/terapeuta/login", { replace: true });
    }
    const { data: profileData, error: profileError } = ([__temp, __restore] = executeAsync(() => supabase.from("profiles").select("rol, nombre").eq("id", userId).single()), __temp = await __temp, __restore(), __temp);
    if (profileError) {
      console.error("[Middleware] Error al obtener perfil:", profileError);
      return navigateTo("/terapeuta/login", { replace: true });
    }
    const userRole = profileData?.rol;
    const rolesPermitidos = ["terapeuta", "psicologa", "admin", "coordinadora"];
    if (!userRole || !rolesPermitidos.includes(userRole)) {
      console.log(`[Middleware] Usuario con rol '${userRole}' sin acceso, redirigiendo a home`);
      return navigateTo("/", { replace: true });
    }
    console.log(`[Middleware] Acceso autorizado para: ${profileData?.nombre || "profesional"} (${userRole})`);
  } catch (err) {
    console.error("[Middleware] Error inesperado:", err);
    return navigateTo("/terapeuta/login", { replace: true });
  }
});

export { authTerapeuta as default };
//# sourceMappingURL=auth-terapeuta-CwgvpQQv.mjs.map
