/**
 * Script para exportar listado de pacientes con información de bonos y pagos
 *
 * Uso:
 *   SUPABASE_SERVICE_ROLE_KEY="..." npx tsx scripts/export-patients-with-bonos.ts
 *   SUPABASE_SERVICE_ROLE_KEY="..." npx tsx scripts/export-patients-with-bonos.ts --update  # Actualizar datos
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

// Leer archivo Excel original para obtener info de bonos
const EXCEL_PATH = '/Users/dieterlorenzo/Downloads/Lista de Sesiones Dic 28 2025.xlsx'

interface ExcelBono {
  paciente: string
  tipo_sesion: string
  bono_info: string | null
  precio: number
  metodo_pago: string | null
  estado_pago: string | null
}

interface PatientReport {
  id: string
  nombre_completo: string
  email: string | null
  telefono: string | null
  dni: string | null
  total_citas: number
  citas_realizadas: number
  citas_pendientes: number
  citas_canceladas: number
  tiene_bono: boolean
  bono_tipo: string | null
  bono_sesiones_totales: number
  bono_sesiones_usadas: number
  bono_pagado: boolean
  total_pagado: number
  total_pendiente: number
  metodos_pago: string[]
}

async function readExcelBonos(): Promise<Map<string, ExcelBono[]>> {
  console.log('📖 Leyendo archivo Excel para obtener info de bonos...\n')

  const workbook = XLSX.readFile(EXCEL_PATH)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet) as any[]

  const bonosPorPaciente = new Map<string, ExcelBono[]>()

  for (const row of data) {
    const paciente = row['Paciente']?.toString().trim()
    if (!paciente) continue

    const bono: ExcelBono = {
      paciente,
      tipo_sesion: row['Tipo']?.toString().trim() || '',
      bono_info: row['Bonos']?.toString().trim() || null,
      precio: parseFloat((row['Precio']?.toString() || '0').replace(',', '.')),
      metodo_pago: row['Método de Pago']?.toString().trim() || null,
      estado_pago: row['Estado']?.toString().trim() || null
    }

    if (!bonosPorPaciente.has(paciente)) {
      bonosPorPaciente.set(paciente, [])
    }
    bonosPorPaciente.get(paciente)!.push(bono)
  }

  console.log(`   Encontrados ${bonosPorPaciente.size} pacientes únicos en Excel\n`)
  return bonosPorPaciente
}

function parseBono(bonoStr: string | null): { nombre: string; sesion: number; total: number } | null {
  if (!bonoStr) return null

  // Formato: "Bono 5 Sesiones (300,00€) 2/5" o similar
  const match = bonoStr.match(/Bono\s+(\d+)\s+Sesiones?\s*\([^)]+\)\s*(\d+)\/(\d+)/i)
  if (match) {
    return {
      nombre: `Bono ${match[1]} Sesiones`,
      sesion: parseInt(match[2]),
      total: parseInt(match[3])
    }
  }
  return null
}

async function exportPatients() {
  console.log('🔍 Exportando listado de pacientes con bonos y pagos...\n')

  // Leer datos del Excel
  const excelBonos = await readExcelBonos()

  // Obtener todos los pacientes
  const { data: pacientes, error: errorPacientes } = await supabase
    .from('pacientes')
    .select(`
      id,
      nombre_completo,
      email,
      telefono,
      documento_identidad,
      metadata
    `)
    .order('nombre_completo')

  if (errorPacientes) {
    console.error('❌ Error obteniendo pacientes:', errorPacientes)
    return
  }

  console.log(`📊 Total de pacientes en BD: ${pacientes?.length || 0}\n`)

  // Obtener citas por paciente
  const { data: citas, error: errorCitas } = await supabase
    .from('citas')
    .select('id, paciente_id, estado, metadata')

  if (errorCitas) {
    console.error('❌ Error obteniendo citas:', errorCitas)
    return
  }

  // Obtener bonos
  const { data: bonos, error: errorBonos } = await supabase
    .from('bonos')
    .select('*')

  if (errorBonos) {
    console.error('❌ Error obteniendo bonos:', errorBonos)
    return
  }

  // Procesar datos
  const reports: PatientReport[] = []

  for (const paciente of pacientes || []) {
    const nombreCompleto = paciente.nombre_completo || paciente.email || 'Sin nombre'

    // Buscar en Excel
    const excelData = excelBonos.get(nombreCompleto) || []

    // Contar citas
    const citasPaciente = (citas || []).filter(c => c.paciente_id === paciente.id)
    const realizadas = citasPaciente.filter(c => c.estado === 'realizada' || c.estado === 'completada').length
    const pendientes = citasPaciente.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada').length
    const canceladas = citasPaciente.filter(c => c.estado === 'cancelada').length

    // Buscar bonos
    const bonosPaciente = (bonos || []).filter(b => b.paciente_id === paciente.id)
    const bonoActivo = bonosPaciente.find(b => b.estado === 'activo')

    // Analizar datos del Excel para bonos
    let bonoInfoExcel: { nombre: string; sesion: number; total: number } | null = null
    const metodosPago = new Set<string>()
    let totalPagado = 0
    let totalPendiente = 0

    for (const ex of excelData) {
      if (ex.bono_info) {
        const parsed = parseBono(ex.bono_info)
        if (parsed) bonoInfoExcel = parsed
      }
      if (ex.metodo_pago) metodosPago.add(ex.metodo_pago)

      // Calcular pagos
      if (ex.estado_pago?.toLowerCase().includes('pagad')) {
        totalPagado += ex.precio
      } else {
        totalPendiente += ex.precio
      }
    }

    const report: PatientReport = {
      id: paciente.id,
      nombre_completo: nombreCompleto,
      email: paciente.email,
      telefono: paciente.telefono,
      dni: paciente.documento_identidad || (paciente.metadata as any)?.dni || null,
      total_citas: citasPaciente.length,
      citas_realizadas: realizadas,
      citas_pendientes: pendientes,
      citas_canceladas: canceladas,
      tiene_bono: !!bonoActivo || !!bonoInfoExcel,
      bono_tipo: bonoActivo?.tipo || bonoInfoExcel?.nombre || null,
      bono_sesiones_totales: bonoActivo?.sesiones_totales || bonoInfoExcel?.total || 0,
      bono_sesiones_usadas: bonoActivo ? (bonoActivo.sesiones_totales - bonoActivo.sesiones_restantes) : bonoInfoExcel?.sesion || 0,
      bono_pagado: bonoActivo?.pagado || false,
      total_pagado: totalPagado,
      total_pendiente: totalPendiente,
      metodos_pago: Array.from(metodosPago)
    }

    reports.push(report)
  }

  // Mostrar resumen
  console.log('\n' + '='.repeat(80))
  console.log('📊 RESUMEN DE PACIENTES')
  console.log('='.repeat(80))

  const conBono = reports.filter(r => r.tiene_bono)
  const sinBono = reports.filter(r => !r.tiene_bono)
  const conCitas = reports.filter(r => r.total_citas > 0)

  console.log(`\n📋 Total pacientes: ${reports.length}`)
  console.log(`   - Con bonos: ${conBono.length}`)
  console.log(`   - Sin bonos: ${sinBono.length}`)
  console.log(`   - Con citas: ${conCitas.length}`)

  console.log('\n💰 RESUMEN FINANCIERO:')
  const totalPagadoGeneral = reports.reduce((sum, r) => sum + r.total_pagado, 0)
  const totalPendienteGeneral = reports.reduce((sum, r) => sum + r.total_pendiente, 0)
  console.log(`   - Total pagado: ${totalPagadoGeneral.toFixed(2)}€`)
  console.log(`   - Total pendiente: ${totalPendienteGeneral.toFixed(2)}€`)

  // Exportar a Excel
  console.log('\n📁 Exportando a Excel...')

  const wsData = reports.map(r => ({
    'Nombre Completo': r.nombre_completo,
    'Email': r.email || '',
    'Teléfono': r.telefono || '',
    'DNI': r.dni || '',
    'Total Citas': r.total_citas,
    'Realizadas': r.citas_realizadas,
    'Pendientes': r.citas_pendientes,
    'Canceladas': r.citas_canceladas,
    'Tiene Bono': r.tiene_bono ? 'Sí' : 'No',
    'Tipo Bono': r.bono_tipo || '',
    'Sesiones Bono': r.bono_sesiones_totales > 0 ? `${r.bono_sesiones_usadas}/${r.bono_sesiones_totales}` : '',
    'Bono Pagado': r.bono_pagado ? 'Sí' : 'No',
    'Total Pagado (€)': r.total_pagado.toFixed(2),
    'Total Pendiente (€)': r.total_pendiente.toFixed(2),
    'Métodos de Pago': r.metodos_pago.join(', ')
  }))

  const ws = XLSX.utils.json_to_sheet(wsData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Pacientes')

  const outputPath = '/Users/dieterlorenzo/Downloads/Pacientes_Terapli_Export.xlsx'
  XLSX.writeFile(wb, outputPath)

  console.log(`\n✅ Exportado a: ${outputPath}`)

  // Mostrar pacientes con bonos
  console.log('\n' + '='.repeat(80))
  console.log('🎫 DETALLE DE PACIENTES CON BONOS')
  console.log('='.repeat(80))

  for (const r of conBono) {
    console.log(`\n👤 ${r.nombre_completo}`)
    console.log(`   📧 ${r.email || 'Sin email'}`)
    console.log(`   🎫 ${r.bono_tipo}: ${r.bono_sesiones_usadas}/${r.bono_sesiones_totales} sesiones`)
    console.log(`   💰 Pagado: ${r.total_pagado.toFixed(2)}€ | Pendiente: ${r.total_pendiente.toFixed(2)}€`)
    if (r.metodos_pago.length > 0) {
      console.log(`   💳 Métodos: ${r.metodos_pago.join(', ')}`)
    }
  }

  // Mostrar pacientes sin datos en Teraplí pero en Excel
  console.log('\n' + '='.repeat(80))
  console.log('⚠️  PACIENTES EN EXCEL SIN MATCH EXACTO EN BD')
  console.log('='.repeat(80))

  const nombresEnBD = new Set(reports.map(r => r.nombre_completo.toLowerCase()))
  for (const [nombre, datos] of excelBonos) {
    if (!nombresEnBD.has(nombre.toLowerCase())) {
      const totalExcel = datos.reduce((sum, d) => sum + d.precio, 0)
      const bonos = datos.filter(d => d.bono_info).map(d => d.bono_info)
      console.log(`\n⚠️  ${nombre}`)
      console.log(`   Sesiones en Excel: ${datos.length}`)
      console.log(`   Total: ${totalExcel.toFixed(2)}€`)
      if (bonos.length > 0) console.log(`   Bonos: ${bonos[0]}`)
    }
  }

  return reports
}

// Ejecutar
exportPatients().catch(console.error)
