import { s as setCookie, u as useRuntimeConfig, g as getHeader, d as defineEventHandler, r as readBody, c as createError } from '../../../nitro/nitro.mjs';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';

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
    const { url, key, cookiePrefix, cookieOptions, clientOptions: { auth = {}, global = {} } } = useRuntimeConfig(event).public.supabase;
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

const serverSupabaseServiceRole = (event) => {
  const config = useRuntimeConfig(event);
  const secretKey = config.supabase.secretKey;
  const serviceKey = config.supabase.serviceKey;
  const url = config.public.supabase.url;
  const serverKey = secretKey || serviceKey;
  if (!serverKey) {
    throw new Error("Missing server key. Set either `SUPABASE_SECRET_KEY` (recommended) or `SUPABASE_SERVICE_KEY` (deprecated) in your environment variables.");
  }
  if (!event.context._supabaseServiceRole) {
    event.context._supabaseServiceRole = createClient(url, serverKey, {
      auth: {
        detectSessionInUrl: false,
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        fetch: fetchWithRetry
      }
    });
  }
  return event.context._supabaseServiceRole;
};

const crearTerapeuta_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { nombreCompleto, email, password, telefono } = body;
    if (!nombreCompleto || !email || !password) {
      throw createError({
        statusCode: 400,
        message: "Faltan campos requeridos: nombreCompleto, email, password"
      });
    }
    console.log("\u{1F4DD} Creando terapeuta:", email);
    const supabaseAdmin = serverSupabaseServiceRole(event);
    const supabaseClient = await serverSupabaseClient(event);
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw createError({
        statusCode: 401,
        message: "No autenticado"
      });
    }
    const { data: profile, error: profileError } = await supabaseClient.from("profiles").select("rol").eq("id", user.id).single();
    if (profileError || (profile == null ? void 0 : profile.rol) !== "admin") {
      throw createError({
        statusCode: 403,
        message: "Acceso denegado. Solo administradores pueden crear terapeutas."
      });
    }
    console.log("\u2705 Usuario admin verificado:", user.email);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre: nombreCompleto,
        telefono: telefono || "",
        rol: "psicologa"
      }
    });
    if (authError) {
      console.error("\u274C Error al crear usuario en Auth:", authError);
      throw createError({
        statusCode: 500,
        message: `Error al crear usuario: ${authError.message}`
      });
    }
    console.log("\u2705 Usuario Auth creado:", authData.user.id);
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    const { data: profileData, error: profileCheckError } = await supabaseAdmin.from("profiles").select("*").eq("id", authData.user.id).single();
    if (profileCheckError) {
      console.error("\u274C Error al verificar profile:", profileCheckError);
      throw createError({
        statusCode: 500,
        message: "El perfil no se cre\xF3 correctamente"
      });
    }
    console.log("\u2705 Profile verificado:", profileData.email);
    const { data: terapeutaExistente, error: checkError } = await supabaseAdmin.from("terapeutas").select("*").eq("email", email).single();
    let terapeutaData = terapeutaExistente;
    if (checkError && checkError.code === "PGRST116") {
      console.log("\u26A0\uFE0F Trigger no cre\xF3 terapeuta, creando manualmente...");
      const { data: nuevaTerapeuta, error: terapeutaError } = await supabaseAdmin.from("terapeutas").insert({
        nombre_completo: nombreCompleto,
        email,
        telefono: telefono || null,
        activo: true,
        metadata: {
          auth_user_id: authData.user.id,
          created_by_admin: true,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      }).select().single();
      if (terapeutaError) {
        console.error("\u274C Error al crear terapeuta:", terapeutaError);
        throw createError({
          statusCode: 500,
          message: `Error al crear registro de terapeuta: ${terapeutaError.message}`
        });
      }
      terapeutaData = nuevaTerapeuta;
    }
    console.log("\u2705 Terapeuta creada/verificada:", terapeutaData.email);
    return {
      success: true,
      message: "Terapeuta creada exitosamente",
      data: {
        authUserId: authData.user.id,
        terapeutaId: terapeutaData.id,
        email,
        nombreCompleto
      }
    };
  } catch (error) {
    console.error("\u274C Error en crear-terapeuta:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: error.message || "Error al crear terapeuta"
    });
  }
});

export { crearTerapeuta_post as default };
//# sourceMappingURL=crear-terapeuta.post.mjs.map
