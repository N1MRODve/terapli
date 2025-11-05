import { d as defineEventHandler, g as getMethod, c as createError, r as readBody } from '../../../nitro/nitro.mjs';
import { s as serverSupabaseClient } from '../../../_/serverSupabaseClient.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';

const confirmar_post = defineEventHandler(async (event) => {
  console.log("[Server] Iniciando confirmar-pago handler");
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
    const { bonoId, metodoPago } = body || {};
    if (!body || typeof body !== "object") {
      console.error("[Server Error] Body inv\xE1lido:", typeof body);
      throw createError({
        statusCode: 400,
        statusMessage: "Request body must be a valid JSON object"
      });
    }
    if (!bonoId || typeof bonoId !== "string" && typeof bonoId !== "number") {
      console.error("[Server Error] bonoId inv\xE1lido:", bonoId);
      throw createError({
        statusCode: 400,
        statusMessage: "bonoId es requerido y debe ser v\xE1lido"
      });
    }
    const metodoFinal = metodoPago && typeof metodoPago === "string" ? metodoPago.trim() : "no_especificado";
    console.log("[Server] \u2705 Campos validados, confirmando pago para bono:", bonoId);
    console.log("[Server] Verificando variables de entorno...");
    if (!process.env.SUPABASE_URL) {
      console.error("[Server Error] SUPABASE_URL no configurada");
      throw createError({
        statusCode: 500,
        statusMessage: "Server configuration error: Missing Supabase URL"
      });
    }
    console.log("[Server] Inicializando cliente Supabase...");
    let supabase;
    try {
      supabase = await serverSupabaseClient(event);
    } catch (clientError) {
      console.error("[Server Error] Error al inicializar cliente:", clientError);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to initialize Supabase client"
      });
    }
    console.log("[Server] Verificando autenticaci\xF3n del usuario...");
    const { data: userData, error: userError } = await supabase.auth.getUser();
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
    console.log("[Server] Verificando rol de coordinadora para usuario:", user.id);
    const { data: profile, error: profileError } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
    if (profileError) {
      console.error("[Server Error] Error al obtener perfil:", profileError);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to verify user permissions"
      });
    }
    if (!profile || profile.rol !== "coordinadora") {
      console.error("[Server Error] Acceso denegado, rol:", profile == null ? void 0 : profile.rol);
      throw createError({
        statusCode: 403,
        statusMessage: "Access denied. Coordinadora role required"
      });
    }
    console.log("[Server] \u2705 Usuario coordinadora verificado:", user.email);
    console.log("[Server] Verificando estado del bono...");
    const { data: bonoActual, error: bonoError } = await supabase.from("bonos").select("id, paciente_id, estado_pago, monto_total, estado").eq("id", bonoId).single();
    if (bonoError) {
      if (bonoError.code === "PGRST116") {
        console.error("[Server Error] Bono no encontrado:", bonoId);
        throw createError({
          statusCode: 404,
          statusMessage: "Bono no encontrado"
        });
      }
      console.error("[Server Error] Error al obtener bono:", bonoError);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch bono data"
      });
    }
    if (!bonoActual || bonoActual.estado_pago !== "pendiente") {
      console.error("[Server Error] Bono no v\xE1lido para confirmaci\xF3n:", {
        existe: !!bonoActual,
        estado_pago: bonoActual == null ? void 0 : bonoActual.estado_pago
      });
      throw createError({
        statusCode: 400,
        statusMessage: "Bono no est\xE1 en estado pendiente de pago"
      });
    }
    console.log("[Server] \u2705 Bono v\xE1lido para confirmaci\xF3n");
    console.log("[Server] Actualizando estado del pago...");
    const fechaPago = (/* @__PURE__ */ new Date()).toISOString();
    const { data: bonoActualizado, error: updateError } = await supabase.from("bonos").update({
      estado_pago: "pagado",
      fecha_pago: fechaPago,
      metodo_pago: metodoFinal,
      confirmado_por: user.id,
      updated_at: fechaPago
    }).eq("id", bonoId).eq("estado_pago", "pendiente").select().single();
    if (updateError) {
      console.error("[Server Error] Error al actualizar bono:", updateError);
      if (updateError.code === "PGRST116") {
        throw createError({
          statusCode: 409,
          statusMessage: "El bono ya fue confirmado por otro usuario"
        });
      }
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update bono: ${updateError.message}`
      });
    }
    if (!bonoActualizado) {
      console.error("[Server Error] Bono no actualizado - posible race condition");
      throw createError({
        statusCode: 409,
        statusMessage: "El bono ya fue confirmado por otro usuario"
      });
    }
    console.log("[Server] \u2705 Pago confirmado exitosamente");
    const responseData = {
      success: true,
      message: "Pago confirmado exitosamente",
      data: {
        bonoId: bonoActualizado.id,
        fechaPago,
        metodoPago: metodoFinal,
        montoTotal: bonoActualizado.monto_total,
        confirmadoPor: user.id
      }
    };
    console.log("[Server] Enviando respuesta exitosa");
    return responseData;
  } catch (error) {
    console.error("[Server Error] Error en confirmar-pago:", error);
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
    console.log("[Server] Finalizando handler confirmar-pago");
  }
});

export { confirmar_post as default };
//# sourceMappingURL=confirmar.post.mjs.map
