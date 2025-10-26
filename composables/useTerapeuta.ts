// ~/composables/useTerapeuta.ts

/**
 * Composable para funcionalidades del terapeuta
 * Gestión de pacientes, recursos y recursos compartidos
 */
export const useTerapeuta = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const { getUserId } = useSupabase();

  /**
   * Obtiene la lista de todos los pacientes del terapeuta
   */
  const getPacientes = async () => {
    if (!process.client) return [];
    
    if (!user.value) {
      console.error('User not logged in');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nombre, apellidos, email, activo, en_pausa, area_de_acompanamiento')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error fetching pacientes:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error en getPacientes:', error);
      return [];
    }
  };

  /**
   * Obtiene todos los recursos del repositorio
   */
  const getRecursosRepositorio = async () => {
    if (!process.client) return [];
    
    if (!user.value) {
      console.error('User not logged in');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('recursos_repositorio' as any)
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recursos repositorio:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error en getRecursosRepositorio:', error);
      return [];
    }
  };

  /**
   * Comparte un recurso con uno o varios pacientes
   */
  const compartirRecurso = async (recursoId: string, pacientesIds: string[], notaPersonal?: string) => {
    if (!process.client) return { success: false, error: 'Not client side' };
    
    if (!user.value) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const userId = getUserId()
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' }
      }
      
      // Crear registros de recursos compartidos para cada paciente
      const recursosCompartidos = pacientesIds.map(pacienteId => ({
        recurso_id: recursoId,
        paciente_id: pacienteId,
        terapeuta_id: userId,
        nota_personal: notaPersonal || null,
        compartido_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('recursos_compartidos' as any)
        .insert(recursosCompartidos)
        .select();

      if (error) {
        // Si es error de duplicado, lo manejamos de forma especial
        if (error.code === '23505') {
          return { 
            success: false, 
            error: 'Uno o más pacientes ya tienen este recurso compartido' 
          };
        }
        console.error('Error compartiendo recurso:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error en compartirRecurso:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Obtiene los recursos compartidos con un paciente específico
   */
  const getRecursosCompartidosPaciente = async (pacienteId: string) => {
    if (!process.client) return [];
    
    if (!user.value) {
      console.error('User not logged in');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('recursos_compartidos' as any)
        .select(`
          *,
          recurso:recursos_repositorio(*)
        `)
        .eq('paciente_id', pacienteId)
        .eq('archivado', false)
        .order('compartido_at', { ascending: false });

      if (error) {
        console.error('Error fetching recursos compartidos:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error en getRecursosCompartidosPaciente:', error);
      return [];
    }
  };

  /**
   * Obtiene estadísticas de recursos compartidos
   */
  const getEstadisticasRecursos = async () => {
    if (!process.client) return null;
    
    if (!user.value) {
      console.error('User not logged in');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('recursos_compartidos' as any)
        .select('visto, compartido_at')
        .eq('terapeuta_id', user.value.id)
        .eq('archivado', false);

      if (error) {
        console.error('Error fetching estadísticas:', error);
        return null;
      }

      const total = data.length;
      const vistos = data.filter((r: any) => r.visto).length;
      const pendientes = total - vistos;

      return {
        total,
        vistos,
        pendientes,
        porcentajeVisto: total > 0 ? Math.round((vistos / total) * 100) : 0
      };
    } catch (error) {
      console.error('Error en getEstadisticasRecursos:', error);
      return null;
    }
  };

  /**
   * Descomparte (archiva) un recurso de un paciente
   */
  const descompartirRecurso = async (recursoCompartidoId: string) => {
    if (!process.client) return { success: false };
    
    if (!user.value) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const { error } = await supabase
        .from('recursos_compartidos' as any)
        .update({ archivado: true })
        .eq('id', recursoCompartidoId)
        .eq('terapeuta_id', user.value.id);

      if (error) {
        console.error('Error descompartiendo recurso:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error en descompartirRecurso:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Crea un nuevo recurso en el repositorio
   */
  const crearRecurso = async (recursoData: {
    titulo: string;
    descripcion: string;
    tipo: string;
    icono?: string;
    url: string;
    categoria?: string;
    tags?: string[];
  }) => {
    if (!process.client) return { success: false };
    
    const userId = getUserId()
    if (!userId) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const { data, error } = await supabase
        .from('recursos_repositorio' as any)
        .insert({
          ...recursoData,
          created_by: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando recurso:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error en crearRecurso:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Actualiza un recurso existente en el repositorio
   */
  const actualizarRecurso = async (recursoId: string, recursoData: {
    titulo?: string;
    descripcion?: string;
    tipo?: string;
    icono?: string;
    url?: string;
    categoria?: string;
    tags?: string[];
  }) => {
    if (!process.client) return { success: false };
    
    if (!user.value) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const { data, error } = await supabase
        .from('recursos_repositorio' as any)
        .update({
          ...recursoData,
          updated_at: new Date().toISOString()
        })
        .eq('id', recursoId)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando recurso:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error en actualizarRecurso:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Elimina (desactiva) un recurso del repositorio
   */
  const eliminarRecurso = async (recursoId: string) => {
    if (!process.client) return { success: false };
    
    if (!user.value) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const { error } = await supabase
        .from('recursos_repositorio' as any)
        .update({ activo: false })
        .eq('id', recursoId)
        .eq('created_by', user.value.id);

      if (error) {
        console.error('Error eliminando recurso:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error en eliminarRecurso:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    getPacientes,
    getRecursosRepositorio,
    compartirRecurso,
    getRecursosCompartidosPaciente,
    getEstadisticasRecursos,
    descompartirRecurso,
    crearRecurso,
    actualizarRecurso,
    eliminarRecurso
  };
};
