import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

/**
 * Edge Function: Recordatorios automáticos de sesiones
 * Se ejecuta cada hora mediante cron job de Supabase
 * Envía notificaciones 24h y 4h antes de las sesiones confirmadas
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializar cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const ahora = new Date()
    const ventana24h = {
      inicio: new Date(ahora.getTime() + 23 * 60 * 60 * 1000 + 55 * 60 * 1000), // 23h 55min
      fin: new Date(ahora.getTime() + 24 * 60 * 60 * 1000 + 5 * 60 * 1000), // 24h 5min
    }
    const ventana4h = {
      inicio: new Date(ahora.getTime() + 3 * 60 * 60 * 1000 + 55 * 60 * 1000), // 3h 55min
      fin: new Date(ahora.getTime() + 4 * 60 * 60 * 1000 + 5 * 60 * 1000), // 4h 5min
    }

    console.log('Buscando sesiones para recordatorios...')

    // Buscar recordatorios pendientes que deben enviarse ahora
    const { data: recordatoriosPendientes, error: errorRecordatorios } = await supabase
      .from('recordatorios')
      .select(`
        *,
        sesion:sesion_id(
          *,
          paciente:paciente_id(nombre, telefono, email),
          terapeuta:terapeuta_id(nombre)
        )
      `)
      .eq('enviado', false)
      .lte('fecha_envio', ahora.toISOString())

    if (errorRecordatorios) {
      console.error('Error al buscar recordatorios:', errorRecordatorios)
      throw errorRecordatorios
    }

    console.log(`Encontrados ${recordatoriosPendientes?.length || 0} recordatorios pendientes`)

    let notificacionesEnviadas = 0

    // Procesar cada recordatorio
    for (const recordatorio of recordatoriosPendientes || []) {
      try {
        const sesion = recordatorio.sesion
        const paciente = sesion.paciente

        // Crear notificación interna
        await supabase.from('notificaciones').insert({
          usuario_id: recordatorio.paciente_id,
          titulo: recordatorio.tipo === '24h' ? 'Recordatorio: Sesión mañana' : 'Recordatorio: Sesión en 4 horas',
          mensaje: recordatorio.mensaje,
          tipo: 'recordatorio',
          referencia_id: recordatorio.sesion_id,
        })

        // Aquí se podría integrar con WhatsApp API (Twilio, Wati, etc.)
        // Ejemplo con Twilio:
        // await enviarWhatsApp(paciente.telefono, recordatorio.mensaje)

        // Marcar como enviado
        await supabase
          .from('recordatorios')
          .update({
            enviado: true,
            enviado_at: new Date().toISOString(),
          })
          .eq('id', recordatorio.id)

        notificacionesEnviadas++
        console.log(`✅ Recordatorio enviado a ${paciente.nombre}`)
      } catch (error) {
        console.error(`Error procesando recordatorio ${recordatorio.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        mensaje: `Proceso completado: ${notificacionesEnviadas} recordatorios enviados`,
        timestamp: ahora.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error general:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Función auxiliar para enviar WhatsApp (requiere configuración de Twilio o similar)
async function enviarWhatsApp(telefono: string, mensaje: string): Promise<void> {
  // Implementar integración con API de WhatsApp
  // Ejemplo con Twilio:
  /*
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const twilioNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER')
  
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  
  const body = new URLSearchParams({
    From: `whatsapp:${twilioNumber}`,
    To: `whatsapp:${telefono}`,
    Body: mensaje
  })
  
  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  })
  */
  
  console.log(`WhatsApp pendiente de configuración: ${telefono}`)
}
