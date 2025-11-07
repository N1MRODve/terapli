import { u as useSupabaseClient } from './useSupabaseClient-DykwVqLQ.mjs';
import { e as useSupabaseUser, f as useState } from './server.mjs';
import { computed, readonly } from 'vue';

let isLoadingProfile = false;
const useSupabase = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const session = useState("supabase-session", () => null);
  const userProfile = useState("user-profile", () => null);
  const loadUserProfile = async () => {
    if (userProfile.value) {
      return userProfile.value;
    }
    if (isLoadingProfile) {
      let attempts = 0;
      while (isLoadingProfile && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }
      if (userProfile.value) {
        return userProfile.value;
      }
    }
    isLoadingProfile = true;
    try {
      let attempts = 0;
      while (!user.value && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }
      const userId = user.value?.id || user.value?.sub;
      if (!userId) {
        console.warn("[useSupabase] No hay usuario autenticado o ID inválido después de esperar");
        console.warn("[useSupabase] user.value:", user.value);
        userProfile.value = null;
        return null;
      }
      console.log("[useSupabase] Cargando perfil para usuario:", userId);
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (error) {
        console.error("[useSupabase] Error al cargar perfil:", error);
        console.error("[useSupabase] Error code:", error.code);
        console.error("[useSupabase] Error message:", error.message);
        console.error("[useSupabase] Error details:", error.details);
        console.error("[useSupabase] User ID:", userId);
        userProfile.value = null;
        return null;
      }
      if (!data) {
        console.warn("[useSupabase] No se encontró perfil para el usuario:", userId);
        console.warn("[useSupabase] El usuario existe en auth pero no tiene perfil en la tabla profiles");
        userProfile.value = null;
        return null;
      }
      userProfile.value = data;
      console.log("[useSupabase] ✅ Perfil cargado correctamente:", data.email, "Rol:", data.rol);
      if (data.rol === "psicologa") {
        await syncTerapeutaProfile(data);
      }
      return data;
    } catch (err) {
      console.error("[useSupabase] Error en loadUserProfile:", err);
      userProfile.value = null;
      return null;
    } finally {
      isLoadingProfile = false;
    }
  };
  const syncTerapeutaProfile = async (profile) => {
    try {
      console.log("[Sync] Verificando sincronización con tabla terapeutas...");
      if (!profile.email) {
        console.warn("[Sync] No se puede sincronizar: email faltante");
        return;
      }
      const supabaseClient = supabase;
      const { data: existingTerapeuta, error: searchError } = await supabaseClient.from("terapeutas").select("*").eq("email", profile.email).maybeSingle();
      if (searchError && searchError.code !== "PGRST116") {
        console.warn("[Sync] Error al buscar terapeuta:", searchError);
        return;
      }
      const terapeutaData = {
        id: profile.id,
        nombre_completo: profile.nombre || profile.email.split("@")[0] || "Psicóloga",
        email: profile.email,
        telefono: null,
        especialidad: null,
        num_colegiada: null,
        disponibilidad: null,
        activo: true,
        metadata: {
          sincronizado_desde_profile: true,
          ultima_sincronizacion: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
      if (!existingTerapeuta) {
        console.log("[Sync] Creando nuevo registro en tabla terapeutas...");
        const { error: insertError } = await supabaseClient.from("terapeutas").insert(terapeutaData);
        if (insertError) {
          if (insertError.code === "23505") {
            console.log("[Sync] El terapeuta ya existe por ID, actualizando...");
            const { error: updateError } = await supabaseClient.from("terapeutas").update({
              nombre_completo: terapeutaData.nombre_completo,
              email: terapeutaData.email,
              activo: true,
              metadata: terapeutaData.metadata
            }).eq("id", profile.id);
            if (updateError) {
              console.warn("[Sync] No se pudo actualizar el terapeuta:", updateError);
            } else {
              console.log("[Sync] ✅ Terapeuta actualizado correctamente");
            }
          } else {
            console.warn("[Sync] No se pudo insertar el terapeuta:", insertError);
          }
        } else {
          console.log("[Sync] ✅ Terapeuta creado correctamente en la tabla terapeutas");
        }
      } else {
        const needsUpdate = existingTerapeuta.nombre_completo !== terapeutaData.nombre_completo || existingTerapeuta.email !== terapeutaData.email || !existingTerapeuta.activo;
        if (needsUpdate) {
          console.log("[Sync] Actualizando registro existente en tabla terapeutas...");
          const { error: updateError } = await supabaseClient.from("terapeutas").update({
            nombre_completo: terapeutaData.nombre_completo,
            email: terapeutaData.email,
            activo: true,
            metadata: terapeutaData.metadata
          }).eq("id", profile.id);
          if (updateError) {
            console.warn("[Sync] No se pudo actualizar el terapeuta:", updateError);
          } else {
            console.log("[Sync] ✅ Terapeuta actualizado correctamente");
          }
        } else {
          console.log("[Sync] ✅ Terapeuta ya está sincronizado correctamente");
        }
      }
    } catch (err) {
      console.warn("[Sync] Error al sincronizar terapeuta:", err);
    }
  };
  const getUserRole = async () => {
    const userId = user.value?.id || user.value?.sub;
    if (!userId) {
      console.warn("[useSupabase] getUserRole: No hay usuario autenticado");
      return null;
    }
    if (userProfile.value) {
      return userProfile.value.rol;
    }
    const profile = await loadUserProfile();
    return profile?.rol || null;
  };
  const signInWithEmail = async (email, password) => {
    console.log("🧹 [Auth] Limpiando estado antes del login...");
    userProfile.value = null;
    session.value = null;
    isLoadingProfile = false;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (!error && data.session) {
      console.log("✅ [Auth] Login exitoso, estableciendo nueva sesión");
      session.value = data.session;
    }
    return { data, error };
  };
  const signUpWithEmail = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  };
  const signOut = async () => {
    console.log("🚪 [Auth] Iniciando cierre de sesión...");
    const { error } = await supabase.auth.signOut();
    if (!error) {
      console.log("✅ [Auth] Sesión cerrada en Supabase, limpiando estado local...");
      session.value = null;
      userProfile.value = null;
      isLoadingProfile = false;
      console.log("🧹 [Auth] Estado completamente limpiado");
    } else {
      console.error("❌ [Auth] Error al cerrar sesión:", error);
    }
    return { error };
  };
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${(void 0).location.origin}/reset-password`
    });
    return { data, error };
  };
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { data, error };
  };
  const waitForUser = async (maxAttempts = 20) => {
    let attempts = 0;
    while (!user.value && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    return user.value;
  };
  const getUserId = () => {
    return user.value?.id || user.value?.sub || null;
  };
  return {
    supabase,
    user: readonly(user),
    session: readonly(session),
    userProfile: readonly(userProfile),
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    updatePassword,
    loadUserProfile,
    getUserRole,
    waitForUser,
    getUserId,
    // Nueva función helper
    isAuthenticated: computed(() => !!user.value)
  };
};

export { useSupabase as u };
//# sourceMappingURL=useSupabase-DljD0dj8.mjs.map
