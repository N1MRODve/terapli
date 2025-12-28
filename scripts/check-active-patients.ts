/**
 * Script para verificar pacientes activos desde el Excel
 * y compararlos con los existentes en Teraplí
 */

import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pcbchuaezokqppwsbnty.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Falta SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

const EXCEL_PATH = '/Users/dieterlorenzo/Downloads/Lista de Sesiones Dic 28 2025.xlsx'

interface PatientStatus {
  nombre: string
  enExcel: boolean
  enTerapli: boolean
  tieneCitas: boolean
  tieneBono: boolean
  ultimaCita: string | null
  estado: 'activo' | 'inactivo' | 'solo_excel' | 'solo_terapli'
}

async function checkActivePatients() {
  console.log('🔍 Verificando pacientes activos...\n')

  // 1. Leer pacientes del Excel
  console.log('📖 Leyendo Excel...')
  const workbook = XLSX.readFile(EXCEL_PATH)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet) as any[]

  const pacientesExcel = new Set<string>()
  for (const row of data) {
    const nombre = row['Paciente']?.toString().trim()
    if (nombre && nombre !== '77') {
      pacientesExcel.add(nombre)
    }
  }

  console.log('   Pacientes en Excel: ' + pacientesExcel.size + '\n')

  // 2. Obtener pacientes de Teraplí
  console.log('📊 Consultando Teraplí...')
  const { data: pacientesTerapli, error: errPacientes } = await supabase
    .from('pacientes')
    .select('id, nombre_completo, activo')
    .order('nombre_completo')

  if (errPacientes) {
    console.error('❌ Error obteniendo pacientes:', errPacientes.message)
    return
  }

  console.log('   Pacientes en Teraplí: ' + (pacientesTerapli?.length || 0) + '\n')

  // 3. Obtener citas recientes (últimos 2 meses)
  const fechaLimite = new Date()
  fechaLimite.setMonth(fechaLimite.getMonth() - 2)
  const fechaLimiteStr = fechaLimite.toISOString().split('T')[0]

  const { data: citasRecientes, error: errCitas } = await supabase
    .from('citas')
    .select('paciente_id, fecha_cita')
    .gte('fecha_cita', fechaLimiteStr)
    .order('fecha_cita', { ascending: false })

  const citasPorPaciente = new Map<string, string>()
  for (const cita of citasRecientes || []) {
    if (!citasPorPaciente.has(cita.paciente_id)) {
      citasPorPaciente.set(cita.paciente_id, cita.fecha_cita)
    }
  }

  // 4. Obtener bonos activos
  const { data: bonosActivos, error: errBonos } = await supabase
    .from('bonos')
    .select('paciente_id')
    .eq('estado', 'activo')

  const pacientesConBono = new Set<string>()
  for (const bono of bonosActivos || []) {
    pacientesConBono.add(bono.paciente_id)
  }

  // 5. Crear reporte de estado
  console.log('=' .repeat(80))
  console.log('📋 REPORTE DE PACIENTES ACTIVOS')
  console.log('=' .repeat(80))

  const estados: PatientStatus[] = []

  // Procesar pacientes de Teraplí
  for (const paciente of pacientesTerapli || []) {
    const nombre = paciente.nombre_completo
    const enExcel = Array.from(pacientesExcel).some(n => {
      const nLower = n.toLowerCase()
      const nombreLower = nombre.toLowerCase()
      return nLower === nombreLower ||
             nombreLower.includes(nLower) ||
             nLower.includes(nombreLower) ||
             // Comparar solo primer nombre y primer apellido
             nLower.split(' ')[0] === nombreLower.split(' ')[0]
    })

    const tieneCitas = citasPorPaciente.has(paciente.id)
    const tieneBono = pacientesConBono.has(paciente.id)
    const ultimaCita = citasPorPaciente.get(paciente.id) || null

    let estado: PatientStatus['estado']
    if (enExcel && tieneCitas) {
      estado = 'activo'
    } else if (enExcel && !tieneCitas) {
      estado = 'solo_excel'
    } else if (!enExcel && tieneCitas) {
      estado = 'solo_terapli'
    } else {
      estado = 'inactivo'
    }

    estados.push({
      nombre,
      enExcel,
      enTerapli: true,
      tieneCitas,
      tieneBono,
      ultimaCita,
      estado
    })
  }

  // Encontrar pacientes solo en Excel
  for (const nombreExcel of pacientesExcel) {
    const yaExiste = estados.some(e => {
      const nLower = nombreExcel.toLowerCase()
      const nombreLower = e.nombre.toLowerCase()
      return nLower === nombreLower ||
             nombreLower.includes(nLower) ||
             nLower.includes(nombreLower)
    })

    if (!yaExiste) {
      estados.push({
        nombre: nombreExcel,
        enExcel: true,
        enTerapli: false,
        tieneCitas: false,
        tieneBono: false,
        ultimaCita: null,
        estado: 'solo_excel'
      })
    }
  }

  // Agrupar por estado
  const activos = estados.filter(e => e.estado === 'activo')
  const inactivos = estados.filter(e => e.estado === 'inactivo')
  const soloExcel = estados.filter(e => e.estado === 'solo_excel')
  const soloTerapli = estados.filter(e => e.estado === 'solo_terapli')

  console.log('\n✅ PACIENTES ACTIVOS (' + activos.length + ')')
  console.log('-'.repeat(50))
  for (const p of activos.slice(0, 20)) {
    const bono = p.tieneBono ? '🎟️' : '  '
    console.log('   ' + bono + ' ' + p.nombre + ' (última: ' + p.ultimaCita + ')')
  }
  if (activos.length > 20) {
    console.log('   ... y ' + (activos.length - 20) + ' más')
  }

  console.log('\n⚠️  SOLO EN EXCEL - No en Teraplí (' + soloExcel.filter(e => !e.enTerapli).length + ')')
  console.log('-'.repeat(50))
  for (const p of soloExcel.filter(e => !e.enTerapli)) {
    console.log('   📋 ' + p.nombre)
  }

  console.log('\n⚠️  SOLO EN TERAPLÍ - Sin citas recientes (' + soloTerapli.length + ')')
  console.log('-'.repeat(50))
  for (const p of soloTerapli.slice(0, 10)) {
    console.log('   📊 ' + p.nombre + ' (última: ' + (p.ultimaCita || 'sin citas'))
  }
  if (soloTerapli.length > 10) {
    console.log('   ... y ' + (soloTerapli.length - 10) + ' más')
  }

  console.log('\n😴 INACTIVOS (' + inactivos.length + ')')
  console.log('-'.repeat(50))
  console.log('   Pacientes sin actividad reciente ni en Excel')

  // Resumen
  console.log('\n' + '=' .repeat(80))
  console.log('📊 RESUMEN')
  console.log('=' .repeat(80))
  console.log('   ✅ Activos (Excel + Citas): ' + activos.length)
  console.log('   🎟️  Con bono activo: ' + estados.filter(e => e.tieneBono).length)
  console.log('   ⚠️  Solo en Excel: ' + soloExcel.filter(e => !e.enTerapli).length)
  console.log('   ⚠️  Solo en Teraplí: ' + soloTerapli.length)
  console.log('   😴 Inactivos: ' + inactivos.length)
  console.log('   📊 Total en Teraplí: ' + (pacientesTerapli?.length || 0))
  console.log('   📋 Total en Excel: ' + pacientesExcel.size)

  // Exportar reporte
  console.log('\n📁 Exportando reporte...')

  const reportData = estados.map(p => ({
    'Nombre': p.nombre,
    'En Excel': p.enExcel ? 'Sí' : 'No',
    'En Teraplí': p.enTerapli ? 'Sí' : 'No',
    'Tiene Citas Recientes': p.tieneCitas ? 'Sí' : 'No',
    'Tiene Bono Activo': p.tieneBono ? 'Sí' : 'No',
    'Última Cita': p.ultimaCita || '',
    'Estado': p.estado.toUpperCase()
  }))

  const ws = XLSX.utils.json_to_sheet(reportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Pacientes Activos')

  const outputPath = '/Users/dieterlorenzo/Downloads/Reporte_Pacientes_Activos.xlsx'
  XLSX.writeFile(wb, outputPath)

  console.log('✅ Reporte exportado a: ' + outputPath)
}

checkActivePatients().catch(console.error)
