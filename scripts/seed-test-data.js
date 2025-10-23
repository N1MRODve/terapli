/**
 * Script para crear datos de prueba en Supabase
 * 
 * Ejecutar con: node scripts/seed-test-data.js
 * 
 * Creará:
 * - Usuario paciente de prueba
 * - Bonos (activo y anterior)
 * - Sesiones (próximas y pasadas)
 * - Recursos compartidos
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Necesitarás esta clave

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan las credenciales de Supabase')
  console.log('Asegúrate de tener en .env:')
  console.log('- NUXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY (necesitas agregarla desde el dashboard de Supabase)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedData() {
  console.log('🌱 Iniciando seed de datos de prueba...\n')

  try {
    // 1. Crear usuario de prueba
    console.log('👤 Creando usuario paciente de prueba...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'paciente@test.com',
      password: 'Test123456!',
      email_confirm: true,
      user_metadata: {
        nombre: 'María',
        apellidos: 'García López'
      }
    })

    if (authError) {
      console.error('Error creando usuario:', authError.message)
      return
    }

    const userId = authData.user.id
    console.log('✅ Usuario creado:', authData.user.email)
    console.log('   ID:', userId)

    // 2. Crear perfil base
    console.log('\n📋 Creando perfil base...')
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: 'paciente@test.com',
        nombre: 'María García López',
        telefono: '+34 600 123 456',
        rol: 'paciente'
      })

    if (profileError) {
      console.error('Error creando profile:', profileError.message)
      return
    }
    console.log('✅ Profile creado')

    // 3. Crear perfil de paciente
    console.log('\n📋 Creando perfil de paciente...')
    const { data: pacienteData, error: pacienteError } = await supabase
      .from('pacientes')
      .insert({
        id: userId,
        area_de_acompanamiento: 'Ansiedad, Desarrollo personal',
        frecuencia: 'semanal',
        activo: true,
        metadata: {
          fecha_nacimiento: '1990-05-15',
          notas: 'Paciente de prueba para desarrollo'
        }
      })
      .select()
      .single()

    if (pacienteError) {
      console.error('Error creando paciente:', pacienteError.message)
      return
    }

    const pacienteId = pacienteData.id
    console.log('✅ Paciente creado con ID:', pacienteId)

    // 3. Crear bono activo
    console.log('\n🎫 Creando bono activo...')
    const { data: bonoActivo, error: bonoError } = await supabase
      .from('bonos')
      .insert({
        paciente_id: pacienteId,
        total_sesiones: 10,
        sesiones_restantes: 6,
        precio_total: 450.00,
        estado: 'activo'
      })
      .select()
      .single()

    if (bonoError) {
      console.error('Error creando bono activo:', bonoError.message)
    } else {
      console.log('✅ Bono activo creado: 10 sesiones, 6 restantes')
    }

    // 4. Crear bono anterior (completado)
    console.log('\n🎫 Creando bono anterior...')
    const { error: bonoAntError } = await supabase
      .from('bonos')
      .insert({
        paciente_id: pacienteId,
        total_sesiones: 8,
        sesiones_restantes: 0,
        precio_total: 360.00,
        estado: 'agotado',
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 3 meses atrás
      })

    if (bonoAntError) {
      console.error('Error creando bono anterior:', bonoAntError.message)
    } else {
      console.log('✅ Bono anterior creado: 8 sesiones, agotado')
    }

    // 5. Obtener psicóloga (asumimos que existe una)
    console.log('\n👩‍⚕️ Buscando psicóloga...')
    const { data: psicologas, error: psicologaError } = await supabase
      .from('psicologas')
      .select('id')
      .limit(1)

    let psicologaId = null
    if (psicologaError || !psicologas || psicologas.length === 0) {
      console.log('⚠️  No hay psicólogas registradas, creando una de prueba...')
      
      // Primero crear el usuario auth
      const { data: psicologaAuth, error: psicologaAuthError } = await supabase.auth.admin.createUser({
        email: 'karem@psicologakarem.com',
        password: 'Karem123456!',
        email_confirm: true,
        user_metadata: {
          nombre: 'Karem Psicóloga'
        }
      })

      if (psicologaAuthError) {
        console.error('Error creando usuario psicóloga:', psicologaAuthError.message)
        return
      }

      const psicologaUserId = psicologaAuth.user.id

      // Crear profile
      const { error: psicologaProfileError } = await supabase
        .from('profiles')
        .insert({
          id: psicologaUserId,
          email: 'karem@psicologakarem.com',
          nombre: 'Karem',
          telefono: '+34 600 000 000',
          rol: 'psicologa'
        })

      if (psicologaProfileError) {
        console.error('Error creando profile psicóloga:', psicologaProfileError.message)
        return
      }

      // Crear psicóloga
      const { data: newPsicologa, error: newPsicologaError } = await supabase
        .from('psicologas')
        .insert({
          id: psicologaUserId,
          num_colegiada: 'M-12345',
          bio: 'Psicóloga especializada en ansiedad y desarrollo personal',
          metadata: {
            especialidades: ['Ansiedad', 'Depresión', 'Terapia de pareja']
          }
        })
        .select()
        .single()

      if (newPsicologaError) {
        console.error('Error creando psicóloga:', newPsicologaError.message)
        return
      }
      psicologaId = newPsicologa.id
      console.log('✅ Psicóloga creada con ID:', psicologaId)
    } else {
      psicologaId = psicologas[0].id
      console.log('✅ Psicóloga encontrada con ID:', psicologaId)
    }

    // 6. Crear sesiones
    console.log('\n📅 Creando sesiones...')
    
    // Sesión próxima (en 2 días)
    const proximaSesion = new Date()
    proximaSesion.setDate(proximaSesion.getDate() + 2)
    proximaSesion.setHours(17, 0, 0, 0)

    const { error: sesion1Error } = await supabase
      .from('sesiones')
      .insert({
        paciente_id: pacienteId,
        psicologa_id: psicologaId,
        fecha_hora: proximaSesion.toISOString(),
        duracion_minutos: 60,
        modalidad: 'online',
        estado: 'confirmada',
        enlace_videollamada: 'https://meet.google.com/abc-defg-hij',
        notas_psicologa: 'Continuaremos trabajando en técnicas de gestión de ansiedad'
      })

    if (sesion1Error) {
      console.error('Error creando sesión próxima:', sesion1Error.message)
    } else {
      console.log('✅ Sesión próxima creada:', proximaSesion.toLocaleString('es-ES'))
    }

    // Sesión pasada (hace 1 semana)
    const sesionPasada = new Date()
    sesionPasada.setDate(sesionPasada.getDate() - 7)
    sesionPasada.setHours(16, 0, 0, 0)

    const { error: sesion2Error } = await supabase
      .from('sesiones')
      .insert({
        paciente_id: pacienteId,
        psicologa_id: psicologaId,
        fecha_hora: sesionPasada.toISOString(),
        duracion_minutos: 60,
        modalidad: 'presencial',
        estado: 'realizada',
        ubicacion: 'Consulta Madrid Centro',
        notas_psicologa: 'Sesión muy productiva. La paciente mostró avances significativos en el reconocimiento de patrones de pensamiento. Continuaremos con ejercicios de reestructuración cognitiva.'
      })

    if (sesion2Error) {
      console.error('Error creando sesión pasada:', sesion2Error.message)
    } else {
      console.log('✅ Sesión pasada creada:', sesionPasada.toLocaleString('es-ES'))
    }

    // Otra sesión pasada (hace 2 semanas)
    const sesionPasada2 = new Date()
    sesionPasada2.setDate(sesionPasada2.getDate() - 14)
    sesionPasada2.setHours(17, 30, 0, 0)

    const { error: sesion3Error } = await supabase
      .from('sesiones')
      .insert({
        paciente_id: pacienteId,
        psicologa_id: psicologaId,
        fecha_hora: sesionPasada2.toISOString(),
        duracion_minutos: 60,
        modalidad: 'online',
        estado: 'realizada',
        enlace_videollamada: 'https://meet.google.com/xyz-abcd-efg',
        notas_psicologa: 'Primera sesión. Establecimiento de rapport y evaluación inicial.'
      })

    if (sesion3Error) {
      console.error('Error creando segunda sesión pasada:', sesion3Error.message)
    } else {
      console.log('✅ Segunda sesión pasada creada:', sesionPasada2.toLocaleString('es-ES'))
    }

    // 7. Crear recursos
    console.log('\n📚 Creando recursos...')

    const recursos = [
      {
        titulo: 'Guía de Técnicas de Respiración',
        descripcion: 'Ejercicios prácticos de respiración para gestionar la ansiedad',
        tipo: 'pdf',
        url_recurso: 'https://ejemplo.com/recursos/respiracion.pdf',
        publico: false,
        compartido_con: [pacienteId]
      },
      {
        titulo: 'Audio de Meditación Guiada',
        descripcion: 'Meditación de 10 minutos para reducir el estrés',
        tipo: 'audio',
        url_recurso: 'https://ejemplo.com/recursos/meditacion.mp3',
        publico: false,
        compartido_con: [pacienteId]
      },
      {
        titulo: 'Diario de Emociones (Plantilla)',
        descripcion: 'Plantilla para registrar y analizar tus emociones diarias',
        tipo: 'pdf',
        url_recurso: 'https://ejemplo.com/recursos/diario.pdf',
        publico: false,
        compartido_con: [pacienteId]
      }
    ]

    for (const recurso of recursos) {
      const { error: recursoError } = await supabase
        .from('recursos')
        .insert(recurso)

      if (recursoError) {
        console.error(`Error creando recurso "${recurso.titulo}":`, recursoError.message)
      } else {
        console.log(`✅ Recurso creado: ${recurso.titulo}`)
      }
    }

    // 8. Crear un mensaje
    console.log('\n💬 Creando mensaje de ejemplo...')
    const { error: mensajeError } = await supabase
      .from('mensajes')
      .insert({
        paciente_id: pacienteId,
        remitente: 'psicologa',
        contenido: '¡Hola María! Te he compartido algunos recursos que te pueden ayudar con los ejercicios que vimos en la última sesión. No dudes en escribirme si tienes alguna duda.',
        leido: false
      })

    if (mensajeError) {
      console.error('Error creando mensaje:', mensajeError.message)
    } else {
      console.log('✅ Mensaje creado')
    }

    // Resumen final
    console.log('\n' + '='.repeat(60))
    console.log('✨ ¡Datos de prueba creados exitosamente!')
    console.log('='.repeat(60))
    console.log('\n📧 Credenciales de acceso:')
    console.log('   Email:    paciente@test.com')
    console.log('   Password: Test123456!')
    console.log('\n🔗 Accede en: http://localhost:3000/login')
    console.log('\n' + '='.repeat(60))

  } catch (error) {
    console.error('\n❌ Error general:', error.message)
    console.error(error)
  }
}

// Ejecutar
seedData()
