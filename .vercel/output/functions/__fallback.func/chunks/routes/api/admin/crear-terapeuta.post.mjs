import { u as useRuntimeConfig, d as defineEventHandler, g as getMethod, c as createError, r as readBody } from '../../../nitro/nitro.mjs';
import { createClient } from '@supabase/supabase-js';
import { f as fetchWithRetry, s as serverSupabaseClient } from '../../../_/serverSupabaseClient.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';

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
  var _a, _b, _c;
  console.log("[Server] Iniciando crear-terapeuta handler");
  if (getMethod(event) !== "POST") {
    console.error("[Server Error] M\xE9todo no permitido:", getMethod(event));
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed"
    });
  }
  try {
    console.log("[Server] Leyendo body de la petici\xF3n...");
    let body;
    try {
      body = await readBody(event);
    } catch (bodyError) {
      console.error("[Server Error] Error al leer body:", bodyError);
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request body"
      });
    }
    console.log("[Server] Body recibido, validando campos...");
    const { nombreCompleto, email, password, telefono } = body || {};
    if (!body || typeof body !== "object") {
      console.error("[Server Error] Body inv\xE1lido:", typeof body);
      throw createError({
        statusCode: 400,
        statusMessage: "Request body must be a valid JSON object"
      });
    }
    if (!nombreCompleto || typeof nombreCompleto !== "string" || nombreCompleto.trim().length < 2) {
      console.error("[Server Error] Nombre completo inv\xE1lido:", nombreCompleto);
      throw createError({
        statusCode: 400,
        statusMessage: "nombreCompleto debe ser un string v\xE1lido con al menos 2 caracteres"
      });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      console.error("[Server Error] Email inv\xE1lido:", email);
      throw createError({
        statusCode: 400,
        statusMessage: "email debe ser una direcci\xF3n v\xE1lida"
      });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      console.error("[Server Error] Password inv\xE1lido:", password ? "[HIDDEN]" : "undefined");
      throw createError({
        statusCode: 400,
        statusMessage: "password debe tener al menos 6 caracteres"
      });
    }
    console.log("[Server] \u2705 Campos validados, creando terapeuta:", email);
    console.log("[Server] Verificando variables de entorno...");
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[Server Error] SUPABASE_SERVICE_ROLE_KEY no configurada");
      throw createError({
        statusCode: 500,
        statusMessage: "Server configuration error: Missing service role key"
      });
    }
    if (!process.env.SUPABASE_URL) {
      console.error("[Server Error] SUPABASE_URL no configurada");
      throw createError({
        statusCode: 500,
        statusMessage: "Server configuration error: Missing Supabase URL"
      });
    }
    console.log("[Server] Inicializando cliente Supabase admin...");
    let supabaseAdmin;
    try {
      supabaseAdmin = serverSupabaseServiceRole(event);
    } catch (adminError) {
      console.error("[Server Error] Error al inicializar cliente admin:", adminError);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to initialize admin client"
      });
    }
    console.log("[Server] Obteniendo cliente de usuario autenticado...");
    let supabaseClient;
    try {
      supabaseClient = await serverSupabaseClient(event);
    } catch (clientError) {
      console.error("[Server Error] Error al obtener cliente de usuario:", clientError);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to initialize user client"
      });
    }
    console.log("[Server] Verificando autenticaci\xF3n del usuario...");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError) {
      console.error("[Server Error] Error al obtener usuario:", userError);
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication failed"
      });
    }
    const user = userData == null ? void 0 : userData.user;
    if (!user || !user.id) {
      console.error("[Server Error] Usuario no encontrado o sin ID");
      throw createError({
        statusCode: 401,
        statusMessage: "User not authenticated"
      });
    }
    console.log("[Server] Verificando rol de admin para usuario:", user.id);
    const { data: profile, error: profileError } = await supabaseClient.from("profiles").select("rol").eq("id", user.id).single();
    if (profileError) {
      console.error("[Server Error] Error al obtener perfil:", profileError);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to verify user permissions"
      });
    }
    if (!profile || profile.rol !== "admin") {
      console.error("[Server Error] Acceso denegado, rol:", profile == null ? void 0 : profile.rol);
      throw createError({
        statusCode: 403,
        statusMessage: "Access denied. Admin role required"
      });
    }
    console.log("[Server] \u2705 Usuario admin verificado:", user.email);
    console.log("[Server] Creando usuario en Auth...");
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password.trim(),
      email_confirm: true,
      user_metadata: {
        nombre: nombreCompleto.trim(),
        telefono: telefono ? String(telefono).trim() : "",
        rol: "psicologa"
      }
    });
    if (authError) {
      console.error("[Server Error] Error al crear usuario en Auth:", authError);
      if ((_a = authError.message) == null ? void 0 : _a.includes("already registered")) {
        throw createError({
          statusCode: 409,
          statusMessage: `Email ${email} ya est\xE1 registrado`
        });
      }
      if ((_b = authError.message) == null ? void 0 : _b.includes("Password should be")) {
        throw createError({
          statusCode: 400,
          statusMessage: "Password no cumple con los requisitos m\xEDnimos"
        });
      }
      throw createError({
        statusCode: 500,
        statusMessage: `Error al crear usuario: ${authError.message}`
      });
    }
    if (!((_c = authData == null ? void 0 : authData.user) == null ? void 0 : _c.id)) {
      console.error("[Server Error] Usuario creado pero sin datos v\xE1lidos");
      throw createError({
        statusCode: 500,
        statusMessage: "User creation failed: Invalid response data"
      });
    }
    console.log("[Server] \u2705 Usuario Auth creado:", authData.user.id);
    console.log("[Server] Esperando a triggers de BD...");
    let profileData;
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 1e3;
    while (retryCount < maxRetries) {
      try {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        console.log(`[Server] Verificando profile (intento ${retryCount + 1}/${maxRetries})...`);
        const { data: profileResult, error: profileCheckError } = await supabaseAdmin.from("profiles").select("*").eq("id", authData.user.id).single();
        if (profileCheckError) {
          if (profileCheckError.code === "PGRST116") {
            console.log("[Server] Profile no encontrado a\xFAn, reintentando...");
            retryCount++;
            continue;
          } else {
            console.error("[Server Error] Error al verificar profile:", profileCheckError);
            throw createError({
              statusCode: 500,
              statusMessage: `Profile verification failed: ${profileCheckError.message}`
            });
          }
        }
        profileData = profileResult;
        break;
      } catch (retryError) {
        console.error(`[Server Error] Error en intento ${retryCount + 1}:`, retryError);
        if (retryCount >= maxRetries - 1) {
          throw retryError;
        }
        retryCount++;
      }
    }
    if (!profileData) {
      console.error("[Server Error] Profile no se cre\xF3 despu\xE9s de m\xFAltiples intentos");
      throw createError({
        statusCode: 500,
        statusMessage: "Profile creation timeout: Database triggers may not be working"
      });
    }
    console.log("[Server] \u2705 Profile verificado:", profileData.email);
    console.log("[Server] Verificando registro de terapeuta...");
    let terapeutaData;
    retryCount = 0;
    while (retryCount < maxRetries) {
      try {
        const { data: terapeutaExistente, error: checkError } = await supabaseAdmin.from("terapeutas").select("*").eq("email", email.trim().toLowerCase()).single();
        if (checkError && checkError.code === "PGRST116") {
          console.log("[Server] Trigger no cre\xF3 terapeuta, creando manualmente...");
          const { data: nuevaTerapeuta, error: terapeutaError } = await supabaseAdmin.from("terapeutas").insert({
            nombre_completo: nombreCompleto.trim(),
            email: email.trim().toLowerCase(),
            telefono: telefono ? String(telefono).trim() : null,
            activo: true,
            metadata: {
              auth_user_id: authData.user.id,
              created_by_admin: true,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            }
          }).select().single();
          if (terapeutaError) {
            if (terapeutaError.code === "23505") {
              console.log("[Server] Terapeuta ya existe, reintentando obtenci\xF3n...");
              retryCount++;
              continue;
            }
            console.error("[Server Error] Error al crear terapeuta:", terapeutaError);
            throw createError({
              statusCode: 500,
              statusMessage: `Failed to create therapist record: ${terapeutaError.message}`
            });
          }
          terapeutaData = nuevaTerapeuta;
          break;
        } else if (checkError) {
          console.error("[Server Error] Error al verificar terapeuta:", checkError);
          throw createError({
            statusCode: 500,
            statusMessage: `Therapist verification failed: ${checkError.message}`
          });
        } else {
          terapeutaData = terapeutaExistente;
          break;
        }
      } catch (retryError) {
        console.error(`[Server Error] Error en verificaci\xF3n de terapeuta (intento ${retryCount + 1}):`, retryError);
        if (retryCount >= maxRetries - 1) {
          throw retryError;
        }
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
    if (!terapeutaData) {
      console.error("[Server Error] No se pudo crear/verificar registro de terapeuta");
      throw createError({
        statusCode: 500,
        statusMessage: "Therapist record creation failed after multiple attempts"
      });
    }
    console.log("[Server] \u2705 Terapeuta creada/verificada:", terapeutaData.email);
    console.log("[Server] \u2705 Proceso completado exitosamente");
    const responseData = {
      success: true,
      message: "Terapeuta creada exitosamente",
      data: {
        authUserId: authData.user.id,
        terapeutaId: terapeutaData.id,
        email: email.trim().toLowerCase(),
        nombreCompleto: nombreCompleto.trim(),
        telefono: telefono ? String(telefono).trim() : null
      }
    };
    console.log("[Server] Enviando respuesta exitosa");
    return responseData;
  } catch (error) {
    console.error("[Server Error] Error en crear-terapeuta:", error);
    if (error.statusCode && error.statusMessage) {
      throw error;
    }
    if (error.code || error.message) {
      console.error("[Server Error] Error de Supabase:", {
        code: error.code,
        message: error.message,
        details: error.details
      });
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${error.message || "Unknown error"}`
      });
    }
    console.error("[Server Error] Error no identificado:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error occurred"
    });
  } finally {
    console.log("[Server] Finalizando handler crear-terapeuta");
  }
});

export { crearTerapeuta_post as default };
//# sourceMappingURL=crear-terapeuta.post.mjs.map
