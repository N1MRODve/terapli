/**
 * Script para crear un usuario terapeuta de prueba
 * 
 * Este script crea un usuario en Supabase Auth y lo registra en la tabla profiles
 * con el rol de 'psicologa' para acceder al panel del terapeuta.
 * 
 * Uso: node scripts/crear-usuario-terapeuta.js
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  console.log('\n🔐 Creador de Usuario Terapeuta - PsicoKarem\n')
  console.log('=' .repeat(60))
  
  // Leer variables de entorno
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Error: No se encontraron las variables de entorno')
    console.log('\nAsegúrate de tener configurado:')
    console.log('  - NUXT_PUBLIC_SUPABASE_URL')
    console.log('  - NUXT_PUBLIC_SUPABASE_ANON_KEY')
    console.log('\nPuedes crearlas en un archivo .env en la raíz del proyecto')
    process.exit(1)
  }
  
  console.log('✅ Variables de entorno encontradas')
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`)
  
  // Solicitar datos del usuario
  const email = await question('📧 Email del terapeuta: ')
  const password = await question('🔑 Contraseña (mínimo 6 caracteres): ')
  const nombre = await question('👤 Nombre completo: ')
  const telefono = await question('📱 Teléfono (opcional): ')
  
  console.log('\n⏳ Creando usuario...\n')
  
  // Crear cliente de Supabase (se necesita la Service Role Key para crear usuarios)
  // NOTA: Para producción, esto debería hacerse desde el backend o Supabase Dashboard
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Intentar crear el usuario
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          nombre: nombre,
          rol: 'psicologa'
        }
      }
    })
    
    if (authError) {
      console.error('❌ Error al crear usuario:', authError.message)
      rl.close()
      return
    }
    
    console.log('✅ Usuario creado en Supabase Auth')
    console.log(`   ID: ${authData.user?.id}`)
    
    // Actualizar el perfil con el rol y datos adicionales
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nombre: nombre,
          telefono: telefono || null,
          rol: 'psicologa'
        })
        .eq('id', authData.user.id)
      
      if (profileError) {
        console.error('⚠️  Advertencia: No se pudo actualizar el perfil:', profileError.message)
        console.log('   Puedes hacerlo manualmente desde Supabase Dashboard')
      } else {
        console.log('✅ Perfil actualizado con rol "psicologa"')
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('✨ ¡Usuario creado exitosamente!')
    console.log('\n📝 Credenciales de acceso:')
    console.log(`   Email: ${email}`)
    console.log(`   Contraseña: ${password}`)
    console.log('\n🌐 Puedes iniciar sesión en:')
    console.log('   http://localhost:3000/terapeuta/login')
    console.log('\n📧 Verifica tu email si Supabase requiere confirmación')
    console.log('=' .repeat(60) + '\n')
    
  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
  
  rl.close()
}

main().catch(console.error)
