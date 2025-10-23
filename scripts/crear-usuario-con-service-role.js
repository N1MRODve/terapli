/**
 * Script para crear un usuario terapeuta usando la Service Role Key
 * 
 * Este script usa la clave de servicio de Supabase para crear usuarios
 * sin necesidad de confirmación por email.
 * 
 * Uso: node scripts/crear-usuario-con-service-role.js
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  console.log('\n🔐 Creador de Usuario Terapeuta - PsicoKarem')
  console.log('=' .repeat(70) + '\n')
  
  // Leer variables de entorno
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Faltan variables de entorno necesarias\n')
    console.log('Asegúrate de tener en tu archivo .env:')
    console.log('  - NUXT_PUBLIC_SUPABASE_URL')
    console.log('  - SUPABASE_SERVICE_ROLE_KEY\n')
    process.exit(1)
  }
  
  console.log('✅ Variables de entorno encontradas')
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`)
  console.log('=' .repeat(70) + '\n')
  
  // Solicitar datos del usuario
  console.log('Por favor, ingresa los datos del nuevo terapeuta:\n')
  
  const email = await question('📧 Email: ')
  if (!email || !email.includes('@')) {
    console.error('\n❌ Email inválido')
    rl.close()
    return
  }
  
  const password = await question('🔑 Contraseña (mínimo 6 caracteres): ')
  if (!password || password.length < 6) {
    console.error('\n❌ La contraseña debe tener al menos 6 caracteres')
    rl.close()
    return
  }
  
  const nombre = await question('👤 Nombre completo: ')
  const telefono = await question('📱 Teléfono (opcional, presiona Enter para omitir): ')
  
  console.log('\n' + '='.repeat(70))
  console.log('📋 Resumen de datos:')
  console.log('  Email:', email)
  console.log('  Nombre:', nombre || '(sin especificar)')
  console.log('  Teléfono:', telefono || '(sin especificar)')
  console.log('  Rol: psicologa')
  console.log('=' .repeat(70) + '\n')
  
  const confirmar = await question('¿Deseas crear este usuario? (s/n): ')
  if (confirmar.toLowerCase() !== 's' && confirmar.toLowerCase() !== 'si') {
    console.log('\n❌ Operación cancelada')
    rl.close()
    return
  }
  
  console.log('\n⏳ Creando usuario...\n')
  
  // Crear cliente de Supabase con Service Role Key
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  try {
    // Crear usuario con la API de administración
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirmar el email
      user_metadata: {
        nombre: nombre
      }
    })
    
    if (authError) {
      console.error('❌ Error al crear usuario:', authError.message)
      rl.close()
      return
    }
    
    console.log('✅ Usuario creado en Supabase Auth')
    console.log(`   ID: ${authData.user?.id}`)
    console.log(`   Email: ${authData.user?.email}\n`)
    
    // Esperar un momento para que se cree el perfil automáticamente
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Actualizar el perfil con el rol y datos adicionales
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nombre: nombre || null,
          telefono: telefono || null,
          rol: 'psicologa',
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id)
      
      if (profileError) {
        console.error('⚠️  Advertencia al actualizar perfil:', profileError.message)
        console.log('   Intentando crear el perfil manualmente...\n')
        
        // Intentar insertar el perfil si no existe
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email,
            nombre: nombre || null,
            telefono: telefono || null,
            rol: 'psicologa'
          })
        
        if (insertError) {
          console.error('❌ Error al crear perfil:', insertError.message)
          console.log('\n⚠️  El usuario se creó pero sin perfil completo.')
          console.log('   Por favor, actualiza manualmente en Supabase Dashboard:')
          console.log('   1. Ve a Table Editor > profiles')
          console.log(`   2. Busca el usuario con email: ${email}`)
          console.log('   3. Actualiza el campo "rol" a "psicologa"\n')
        } else {
          console.log('✅ Perfil creado exitosamente')
        }
      } else {
        console.log('✅ Perfil actualizado con rol "psicologa"')
      }
      
      // Verificar que el perfil esté correcto
      const { data: profile, error: checkError } = await supabase
        .from('profiles')
        .select('id, email, nombre, rol, telefono')
        .eq('id', authData.user.id)
        .single()
      
      if (checkError) {
        console.error('\n⚠️  No se pudo verificar el perfil:', checkError.message)
      } else if (profile) {
        console.log('\n✅ Verificación del perfil:')
        console.log('   Nombre:', profile.nombre || '(no especificado)')
        console.log('   Email:', profile.email)
        console.log('   Rol:', profile.rol)
        console.log('   Teléfono:', profile.telefono || '(no especificado)')
      }
    }
    
    console.log('\n' + '='.repeat(70))
    console.log('🎉 ¡Usuario creado exitosamente!\n')
    console.log('📝 Credenciales de acceso:')
    console.log(`   Email: ${email}`)
    console.log(`   Contraseña: ${password}\n`)
    console.log('🌐 Accede al panel en:')
    console.log('   http://localhost:3000/terapeuta/login\n')
    console.log('💡 Guarda estas credenciales en un lugar seguro')
    console.log('=' .repeat(70) + '\n')
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message || error)
  }
  
  rl.close()
}

main().catch(error => {
  console.error('\n❌ Error fatal:', error)
  process.exit(1)
})
