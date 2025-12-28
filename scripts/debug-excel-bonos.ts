/**
 * Script de debug para ver el formato exacto de los bonos en el Excel
 */

import XLSX from 'xlsx'

const EXCEL_PATH = '/Users/dieterlorenzo/Downloads/Lista de Sesiones Dic 28 2025.xlsx'

const workbook = XLSX.readFile(EXCEL_PATH)
const sheetName = workbook.SheetNames[0]
const sheet = workbook.Sheets[sheetName]
const data = XLSX.utils.sheet_to_json(sheet) as any[]

console.log('📋 COLUMNAS DEL EXCEL:')
if (data.length > 0) {
  console.log(Object.keys(data[0]).join('\n'))
}

console.log('\n📋 PRIMERAS 5 FILAS:')
for (let i = 0; i < Math.min(5, data.length); i++) {
  console.log(`\n--- Fila ${i + 1} ---`)
  console.log(JSON.stringify(data[i], null, 2))
}

console.log('\n📋 VALORES ÚNICOS DE "Bonos":')
const bonosUnicos = new Set<string>()
for (const row of data) {
  const bono = row['Bonos']?.toString().trim()
  if (bono && bono !== '' && bono !== 'null' && bono !== 'undefined') {
    bonosUnicos.add(bono)
  }
}

if (bonosUnicos.size === 0) {
  console.log('   ⚠️  No se encontraron valores en columna "Bonos"')
  console.log('\n   Buscando en otras columnas...')

  const columnasConBono = new Set<string>()
  for (const row of data) {
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string' && value.toLowerCase().includes('bono')) {
        columnasConBono.add(key)
      }
    }
  }

  if (columnasConBono.size > 0) {
    console.log(`   Columnas que mencionan "bono": ${Array.from(columnasConBono).join(', ')}`)
  }
} else {
  console.log(`   Encontrados ${bonosUnicos.size} valores únicos:`)
  for (const b of bonosUnicos) {
    console.log(`   - "${b}"`)
  }
}

console.log('\n📋 VALORES ÚNICOS DE "Estado":')
const estadosUnicos = new Set<string>()
for (const row of data) {
  const estado = row['Estado']?.toString().trim()
  if (estado && estado !== '' && estado !== 'null') {
    estadosUnicos.add(estado)
  }
}
for (const e of estadosUnicos) {
  console.log(`   - "${e}"`)
}

console.log('\n📋 VALORES ÚNICOS DE "Método de Pago":')
const metodosUnicos = new Set<string>()
for (const row of data) {
  const metodo = row['Método de Pago']?.toString().trim()
  if (metodo && metodo !== '' && metodo !== 'null') {
    metodosUnicos.add(metodo)
  }
}
for (const m of metodosUnicos) {
  console.log(`   - "${m}"`)
}
