// ~/composables/usePacientes.ts

// IMPORTANT: This is a placeholder file.
// You need to implement the logic to fetch data from your Supabase backend.

export const usePacientes = () => {
  /**
   * Fetches the bonos for the currently logged-in user.
   *
   * TODO: Implement the actual Supabase query.
   * This should fetch from the 'bonos' table where 'paciente_id' matches the current user's ID.
   */
  const getBonos = async () => {
    if (!process.client) return [];
    
    const supabase = useSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not logged in');
      return [];
    }

    // --- THIS IS EXAMPLE LOGIC ---
    // --- REPLACE WITH YOUR ACTUAL QUERY ---
    /*
    const { data, error } = await supabase
      .from('bonos')
      .select('*')
      .eq('paciente_id', user.id);

    if (error) {
      console.error('Error fetching bonos:', error);
      return [];
    }
    return data;
    */

    // Returning mock data for now.
    console.warn('getBonos() is using mock data. Implement Supabase logic in composables/usePacientes.ts');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    return [
      {
        id: 'b0n0-act1v0-1234',
        total_sesiones: 10,
        sesiones_restantes: 7,
        precio_total: 450.00,
        estado: 'activo',
        created_at: new Date().toISOString(),
        fecha_expiracion: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
      },
      {
        id: 'b0n0-ant3r10r-5678',
        total_sesiones: 5,
        sesiones_restantes: 0,
        precio_total: 250.00,
        estado: 'agotado',
        created_at: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
        fecha_expiracion: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
      }
    ];
  };

  /**
   * Fetches the recursos (resources) shared with the currently logged-in patient.
   */
  const getRecursos = async () => {
    if (!process.client) return [];
    
    const supabase = useSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not logged in');
      return [];
    }

    try {
      // Primero obtenemos el paciente_id del usuario actual
      const { data: pacienteData, error: pacienteError } = await supabase
        .from('pacientes')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (pacienteError || !pacienteData) {
        console.error('Error obteniendo paciente:', pacienteError);
        return [];
      }

      // Luego obtenemos los recursos compartidos con este paciente
      const { data, error } = await supabase
        .from('recursos_compartidos' as any)
        .select(`
          id,
          nota_personal,
          visto,
          compartido_at,
          recurso:recursos_repositorio(
            id,
            titulo,
            descripcion,
            tipo,
            icono,
            url,
            categoria,
            tags
          )
        `)
        .eq('paciente_id', pacienteData.id)
        .eq('archivado', false)
        .order('compartido_at', { ascending: false });

      if (error) {
        console.error('Error fetching recursos compartidos:', error);
        return [];
      }

      // Transformar datos para compatibilidad
      return (data || []).map((rc: any) => ({
        id: rc.id,
        titulo: rc.recurso?.titulo || 'Sin título',
        descripcion: rc.recurso?.descripcion || '',
        tipo: rc.recurso?.tipo || 'pdf',
        icono: rc.recurso?.icono || '📄',
        url: rc.recurso?.url || '#',
        categoria: rc.recurso?.categoria,
        tags: rc.recurso?.tags || [],
        nota_personal: rc.nota_personal,
        visto: rc.visto,
        compartido_at: rc.compartido_at,
        recurso_id: rc.recurso?.id
      }));
    } catch (error) {
      console.error('Error en getRecursos:', error);
      return [];
    }
  };

  /**
   * DEPRECATED: Mock data fallback (mantener por compatibilidad)
   */
  const getRecursosMock = async () => {
    console.warn('getRecursosMock() - Using fallback mock data');
    await new Promise(resolve => setTimeout(resolve, 800));

    return [
      {
        id: 'rec-001',
        titulo: 'Ejercicios de respiración para la ansiedad',
        descripcion: 'Guía práctica con 5 técnicas de respiración profunda para gestionar momentos de ansiedad.',
        tipo: 'pdf',
        storage_path: '/recursos/ejercicios-respiracion.pdf',
        created_at: new Date().toISOString(),
        psicologa: { nombre_completo: 'Dra. Karem' }
      },
      {
        id: 'rec-002',
        titulo: 'Meditación guiada - 10 minutos',
        descripcion: 'Audio de meditación guiada para practicar mindfulness y reducir el estrés.',
        tipo: 'audio',
        storage_path: '/recursos/meditacion-10min.mp3',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        psicologa: { nombre_completo: 'Dra. Karem' }
      },
      {
        id: 'rec-003',
        titulo: 'Charla TED: El poder de la vulnerabilidad',
        descripcion: 'Brené Brown habla sobre cómo la vulnerabilidad puede transformar nuestra vida.',
        tipo: 'link',
        storage_path: 'https://www.ted.com/talks/brene_brown_the_power_of_vulnerability',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        psicologa: { nombre_completo: 'Dra. Karem' }
      },
      {
        id: 'rec-004',
        titulo: 'Diario de gratitud - Plantilla',
        descripcion: 'Plantilla descargable para llevar un registro diario de gratitud y reflexión.',
        tipo: 'pdf',
        storage_path: '/recursos/diario-gratitud.pdf',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        psicologa: { nombre_completo: 'Dra. Karem' }
      }
    ];
  };

  /**
   * Fetches messages for the currently logged-in user.
   */
  const getMensajes = async () => {
    if (!process.client) return [];
    
    const supabase = useSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not logged in');
      return [];
    }

    // TODO: Implement the actual Supabase query
    // const { data, error } = await supabase
    //   .from('mensajes')
    //   .select('*, autor:autor_id(nombre_completo, rol), receptor:receptor_id(nombre_completo, rol)')
    //   .or(`autor_id.eq.${user.id},receptor_id.eq.${user.id}`)
    //   .order('created_at', { ascending: true });

    // Returning mock data for now
    console.warn('getMensajes() is using mock data. Implement Supabase logic in composables/usePacientes.ts');
    await new Promise(resolve => setTimeout(resolve, 600));

    const userId = user.id;
    const coordId = 'coord-uuid-1234';

    return [
      {
        id: 'msg-001',
        autor_id: coordId,
        receptor_id: userId,
        contenido: '¡Hola! Bienvenida a la plataforma. Estoy aquí para ayudarte con cualquier duda que tengas sobre tus sesiones o bonos.',
        leido: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        autor: { nombre_completo: 'Coordinadora', rol: 'coordinadora' }
      },
      {
        id: 'msg-002',
        autor_id: userId,
        receptor_id: coordId,
        contenido: 'Gracias! Tengo una duda sobre cómo reservar mi próxima sesión.',
        leido: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        autor: { nombre_completo: 'Tú', rol: 'paciente' }
      },
      {
        id: 'msg-003',
        autor_id: coordId,
        receptor_id: userId,
        contenido: 'Por supuesto! Puedes ir a la sección "Mis Sesiones" y allí encontrarás el botón para agendar. Si tienes problemas, avísame.',
        leido: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        autor: { nombre_completo: 'Coordinadora', rol: 'coordinadora' }
      },
      {
        id: 'msg-004',
        autor_id: userId,
        receptor_id: coordId,
        contenido: 'Perfecto, muchas gracias! Ya pude agendar.',
        leido: true,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        autor: { nombre_completo: 'Tú', rol: 'paciente' }
      },
      {
        id: 'msg-005',
        autor_id: coordId,
        receptor_id: userId,
        contenido: 'Excelente! Nos vemos en tu próxima sesión. Cualquier cosa, aquí estoy 😊',
        leido: false,
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        autor: { nombre_completo: 'Coordinadora', rol: 'coordinadora' }
      }
    ];
  };

  /**
   * Sends a new message.
   */
  const enviarMensaje = async (contenido: string, receptorId: string) => {
    if (!process.client) throw new Error('Client only function');
    
    const supabase = useSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not logged in');
    }

    // TODO: Implement the actual Supabase query
    // const { data, error } = await supabase
    //   .from('mensajes')
    //   .insert({
    //     autor_id: user.id,
    //     receptor_id: receptorId,
    //     contenido,
    //   })
    //   .select('*, autor:autor_id(nombre_completo, rol)')
    //   .single();

    // Simulate sending message
    console.warn('enviarMensaje() is using mock data. Implement Supabase logic in composables/usePacientes.ts');
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      id: `msg-${Date.now()}`,
      autor_id: user.id,
      receptor_id: receptorId,
      contenido,
      leido: false,
      created_at: new Date().toISOString(),
      autor: { nombre_completo: 'Tú', rol: 'paciente' }
    };
  };

  /**
   * Marks messages as read.
   */
  const marcarComoLeido = async (mensajesIds: string[]) => {
    // TODO: Implement the actual Supabase query
    // const { error } = await supabase
    //   .from('mensajes')
    //   .update({ leido: true })
    //   .in('id', mensajesIds);

    console.warn('marcarComoLeido() is using mock data. Implement Supabase logic in composables/usePacientes.ts');
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  };

  /**
   * Fetches all sesiones (sessions) for the currently logged-in user.
   */
  const getSesiones = async () => {
    if (!process.client) return { data: [], error: null };
    
    const supabase = useSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not logged in');
      return { data: [], error: null };
    }

    // TODO: Implement the actual Supabase query
    // const { data, error } = await supabase
    //   .from('sesiones')
    //   .select('*')
    //   .eq('paciente_id', user.id)
    //   .order('fecha', { ascending: false });

    // Returning mock data for now
    console.warn('getSesiones() is using mock data. Implement Supabase logic in composables/usePacientes.ts');
    await new Promise(resolve => setTimeout(resolve, 800));

    const ahora = new Date();
    
    return {
      data: [
        {
          id: 'ses-001',
          fecha: new Date(ahora.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // En 2 días
          duracion_min: 50,
          modalidad: 'online',
          ubicacion: 'https://meet.google.com/abc-defg-hij',
          estado: 'confirmada',
          nota_terapeuta: null,
          created_at: new Date().toISOString()
        },
        {
          id: 'ses-002',
          fecha: new Date(ahora.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(), // En 9 días
          duracion_min: 50,
          modalidad: 'online',
          ubicacion: 'https://meet.google.com/abc-defg-hij',
          estado: 'pendiente',
          nota_terapeuta: null,
          created_at: new Date().toISOString()
        },
        {
          id: 'ses-003',
          fecha: new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Hace 7 días
          duracion_min: 50,
          modalidad: 'presencial',
          ubicacion: 'Calle Ejemplo 123, Madrid',
          estado: 'realizada',
          nota_terapeuta: 'Sesión muy productiva. Hemos trabajado técnicas de respiración y manejo de la ansiedad. Continuar practicando los ejercicios diarios.',
          created_at: new Date(ahora.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'ses-004',
          fecha: new Date(ahora.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), // Hace 14 días
          duracion_min: 50,
          modalidad: 'online',
          ubicacion: 'https://meet.google.com/abc-defg-hij',
          estado: 'realizada',
          nota_terapeuta: 'Primera sesión de evaluación. Se identificaron áreas de trabajo: ansiedad social y autoestima. Plan de tratamiento establecido.',
          created_at: new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'ses-005',
          fecha: new Date(ahora.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(), // Hace 21 días
          duracion_min: 50,
          modalidad: 'online',
          ubicacion: 'https://meet.google.com/abc-defg-hij',
          estado: 'cancelada',
          nota_terapeuta: null,
          created_at: new Date(ahora.getTime() - 22 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      error: null
    };
  };

  /**
   * Fetches upcoming sesiones for the currently logged-in user.
   */
  const getProximasSesiones = async () => {
    if (!process.client) return { data: [], error: null };
    
    const supabase = useSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not logged in');
      return { data: [], error: null };
    }

    // TODO: Implement the actual Supabase query
    // const ahora = new Date().toISOString();
    // const { data, error } = await supabase
    //   .from('sesiones')
    //   .select('*')
    //   .eq('paciente_id', user.id)
    //   .gte('fecha', ahora)
    //   .order('fecha', { ascending: true });

    // Returning mock data for now
    console.warn('getProximasSesiones() is using mock data. Implement Supabase logic in composables/usePacientes.ts');
    await new Promise(resolve => setTimeout(resolve, 600));

    const ahora = new Date();
    
    return {
      data: [
        {
          id: 'ses-001',
          fecha: new Date(ahora.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          duracion_min: 50,
          modalidad: 'online',
          ubicacion: 'https://meet.google.com/abc-defg-hij',
          estado: 'confirmada',
          nota_terapeuta: null,
          created_at: new Date().toISOString()
        },
        {
          id: 'ses-002',
          fecha: new Date(ahora.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
          duracion_min: 50,
          modalidad: 'online',
          ubicacion: 'https://meet.google.com/abc-defg-hij',
          estado: 'pendiente',
          nota_terapeuta: null,
          created_at: new Date().toISOString()
        }
      ],
      error: null
    };
  };

  /**
   * Marca un recurso compartido como visto por el paciente
   */
  const marcarRecursoComoVisto = async (recursoCompartidoId: string) => {
    if (!process.client) return { success: false };
    
    const supabase = useSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not logged in');
      return { success: false };
    }

    try {
      const { error } = await supabase
        .from('recursos_compartidos' as any)
        .update({ 
          visto: true,
          visto_at: new Date().toISOString()
        })
        .eq('id', recursoCompartidoId);

      if (error) {
        console.error('Error marcando recurso como visto:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error en marcarRecursoComoVisto:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    getBonos,
    getRecursos,
    marcarRecursoComoVisto,
    getMensajes,
    enviarMensaje,
    marcarComoLeido,
    getSesiones,
    getProximasSesiones
  };
};