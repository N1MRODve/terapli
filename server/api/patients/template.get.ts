import { readFile } from 'fs/promises'
import { join } from 'path'
import * as XLSX from 'xlsx'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const format = (query.format as string) || 'csv'

  if (!['csv', 'xlsx'].includes(format)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Formato no válido. Use csv o xlsx'
    })
  }

  const templateData = [
    {
      nombre_completo: 'María García López',
      email: 'maria.garcia@example.com',
      telefono: '+34 612 345 678',
      area_de_acompanamiento: 'Ansiedad',
      frecuencia: 'Semanal',
      activo: 'true',
      notas: 'Paciente con seguimiento regular'
    },
    {
      nombre_completo: 'Juan Pérez Martínez',
      email: 'juan.perez@example.com',
      telefono: '+34 623 456 789',
      area_de_acompanamiento: 'Depresión',
      frecuencia: 'Quincenal',
      activo: 'true',
      notas: 'Primera sesión próximamente'
    },
    {
      nombre_completo: 'Ana Rodríguez',
      email: 'ana.rodriguez@example.com',
      telefono: '+34 634 567 890',
      area_de_acompanamiento: 'Trastornos del sueño',
      frecuencia: 'Mensual',
      activo: 'false',
      notas: 'Tratamiento finalizado'
    }
  ]

  if (format === 'csv') {
    // Generate CSV
    const headers = Object.keys(templateData[0])
    const csvRows = [
      headers.join(','),
      ...templateData.map(row =>
        headers.map(header => {
          const value = row[header as keyof typeof row]
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value).replace(/"/g, '""')
          return escaped.includes(',') ? `"${escaped}"` : escaped
        }).join(',')
      )
    ]

    const csvContent = csvRows.join('\n')

    setResponseHeaders(event, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="plantilla_pacientes.csv"'
    })

    return csvContent
  } else {
    // Generate XLSX
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(templateData)

    // Auto-size columns
    const colWidths = Object.keys(templateData[0]).map(key => ({
      wch: Math.max(key.length, ...templateData.map(row => String(row[key as keyof typeof row]).length)) + 2
    }))
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes')

    const xlsxBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

    setResponseHeaders(event, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="plantilla_pacientes.xlsx"'
    })

    return xlsxBuffer
  }
})
