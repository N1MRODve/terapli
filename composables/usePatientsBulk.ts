import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface PatientImportRow {
  nombre_completo: string
  email?: string
  telefono?: string
  area_de_acompanamiento?: string
  frecuencia?: string
  activo?: string | boolean
  notas?: string
}

export interface ValidationError {
  row: number
  field: string
  message: string
  value: any
}

export interface ValidatedPatient extends PatientImportRow {
  isValid: boolean
  errors: ValidationError[]
  action: 'CREATE' | 'UPDATE' | 'SKIP'
  matchedBy?: 'email' | 'phone'
}

export interface ParsedFile {
  rows: PatientImportRow[]
  totalRows: number
  headers: string[]
}

export interface ValidationResult {
  validPatients: ValidatedPatient[]
  invalidPatients: ValidatedPatient[]
  summary: {
    total: number
    valid: number
    invalid: number
    toCreate: number
    toUpdate: number
    toSkip: number
  }
}

export interface ExportOptions {
  format: 'csv' | 'xlsx'
  scope: 'all' | 'filtered' | 'selected'
  fields: string[]
  patients: any[]
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_ROWS = 5000

export const usePatientsBulk = () => {
  /**
   * Parse CSV or XLSX file
   */
  const parseFile = async (file: File): Promise<ParsedFile> => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`El archivo es demasiado grande. Máximo permitido: 10MB`)
    }

    // Validate file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(extension || '')) {
      throw new Error('Formato de archivo no válido. Solo se permiten CSV y XLSX')
    }

    if (extension === 'csv') {
      return parseCSV(file)
    } else {
      return parseXLSX(file)
    }
  }

  /**
   * Parse CSV file using PapaParse
   */
  const parseCSV = (file: File): Promise<ParsedFile> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as PatientImportRow[]

          if (rows.length === 0) {
            reject(new Error('El archivo está vacío'))
            return
          }

          if (rows.length > MAX_ROWS) {
            reject(new Error(`El archivo contiene demasiadas filas. Máximo permitido: ${MAX_ROWS}`))
            return
          }

          resolve({
            rows,
            totalRows: rows.length,
            headers: results.meta.fields || []
          })
        },
        error: (error) => {
          reject(new Error(`Error al leer el archivo CSV: ${error.message}`))
        }
      })
    })
  }

  /**
   * Parse XLSX file using SheetJS
   */
  const parseXLSX = async (file: File): Promise<ParsedFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })

          // Get first sheet
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]

          // Convert to JSON
          const rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: ''
          })

          if (rows.length === 0) {
            reject(new Error('El archivo está vacío'))
            return
          }

          if (rows.length > MAX_ROWS) {
            reject(new Error(`El archivo contiene demasiadas filas. Máximo permitido: ${MAX_ROWS}`))
            return
          }

          // First row is headers
          const headers = rows[0] as string[]
          const dataRows = rows.slice(1) as any[][]

          // Convert to objects
          const parsedRows: PatientImportRow[] = dataRows.map(row => {
            const obj: any = {}
            headers.forEach((header, index) => {
              obj[header] = row[index] || ''
            })
            return obj
          })

          resolve({
            rows: parsedRows,
            totalRows: parsedRows.length,
            headers
          })
        } catch (error: any) {
          reject(new Error(`Error al leer el archivo XLSX: ${error.message}`))
        }
      }

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'))
      }

      reader.readAsBinaryString(file)
    })
  }

  /**
   * Validate patient rows
   */
  const validateRows = (rows: PatientImportRow[], existingPatients: any[] = []): ValidationResult => {
    const validPatients: ValidatedPatient[] = []
    const invalidPatients: ValidatedPatient[] = []

    rows.forEach((row, index) => {
      const errors: ValidationError[] = []
      const rowNumber = index + 2 // +2 because Excel rows start at 1 and we skip header

      // Required field: nombre_completo
      if (!row.nombre_completo || row.nombre_completo.trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'nombre_completo',
          message: 'El nombre completo es obligatorio',
          value: row.nombre_completo
        })
      }

      // At least email or phone must be provided
      if ((!row.email || row.email.trim() === '') && (!row.telefono || row.telefono.trim() === '')) {
        errors.push({
          row: rowNumber,
          field: 'email/telefono',
          message: 'Debe proporcionar al menos email o teléfono',
          value: null
        })
      }

      // Validate email format if provided
      if (row.email && row.email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(row.email)) {
          errors.push({
            row: rowNumber,
            field: 'email',
            message: 'El formato del email no es válido',
            value: row.email
          })
        }
      }

      // Validate phone format if provided (basic validation)
      if (row.telefono && row.telefono.trim() !== '') {
        const phoneRegex = /^[+]?[\d\s\-()]{9,}$/
        if (!phoneRegex.test(row.telefono)) {
          errors.push({
            row: rowNumber,
            field: 'telefono',
            message: 'El formato del teléfono no es válido (mínimo 9 dígitos)',
            value: row.telefono
          })
        }
      }

      // Validate activo field
      if (row.activo !== undefined && row.activo !== '') {
        const activoValue = String(row.activo).toLowerCase()
        if (!['true', 'false', 'sí', 'si', 'no', '1', '0', 'activo', 'inactivo'].includes(activoValue)) {
          errors.push({
            row: rowNumber,
            field: 'activo',
            message: 'El campo activo debe ser: true/false, sí/no, 1/0, activo/inactivo',
            value: row.activo
          })
        }
      }

      // Determine action (CREATE, UPDATE, SKIP)
      let action: 'CREATE' | 'UPDATE' | 'SKIP' = 'CREATE'
      let matchedBy: 'email' | 'phone' | undefined = undefined

      // Check for duplicates in existing patients
      if (errors.length === 0) {
        // Try to match by email first
        if (row.email && row.email.trim() !== '') {
          const existingByEmail = existingPatients.find(p =>
            p.email && p.email.toLowerCase() === row.email!.toLowerCase()
          )
          if (existingByEmail) {
            action = 'UPDATE'
            matchedBy = 'email'
          }
        }

        // If not matched by email, try phone
        if (action === 'CREATE' && row.telefono && row.telefono.trim() !== '') {
          const existingByPhone = existingPatients.find(p =>
            p.telefono && p.telefono === row.telefono
          )
          if (existingByPhone) {
            action = 'UPDATE'
            matchedBy = 'phone'
          }
        }
      }

      const validatedPatient: ValidatedPatient = {
        ...row,
        isValid: errors.length === 0,
        errors,
        action,
        matchedBy
      }

      if (validatedPatient.isValid) {
        validPatients.push(validatedPatient)
      } else {
        invalidPatients.push(validatedPatient)
      }
    })

    return {
      validPatients,
      invalidPatients,
      summary: {
        total: rows.length,
        valid: validPatients.length,
        invalid: invalidPatients.length,
        toCreate: validPatients.filter(p => p.action === 'CREATE').length,
        toUpdate: validPatients.filter(p => p.action === 'UPDATE').length,
        toSkip: validPatients.filter(p => p.action === 'SKIP').length
      }
    }
  }

  /**
   * Build export data
   */
  const buildExport = (options: ExportOptions): any[] => {
    const { fields, patients } = options

    return patients.map(patient => {
      const exportRow: any = {}

      fields.forEach(field => {
        switch (field) {
          case 'nombre_completo':
            exportRow['Nombre Completo'] = patient.nombre || patient.nombre_completo || ''
            break
          case 'email':
            exportRow['Email'] = patient.email || ''
            break
          case 'telefono':
            exportRow['Teléfono'] = patient.telefono || ''
            break
          case 'area_de_acompanamiento':
            exportRow['Área de Acompañamiento'] = patient.area_de_acompanamiento || ''
            break
          case 'frecuencia':
            exportRow['Frecuencia'] = patient.frecuencia || ''
            break
          case 'activo':
            exportRow['Estado'] = patient.activo ? (patient.en_pausa ? 'En pausa' : 'Activo') : 'Finalizado'
            break
          case 'ultima_sesion':
            exportRow['Última Sesión'] = patient.ultima_sesion || 'Sin registro'
            break
          case 'proxima_sesion':
            exportRow['Próxima Sesión'] = patient.proxima_sesion || 'No programada'
            break
          case 'total_sesiones':
            exportRow['Total Sesiones'] = patient.total_sesiones || 0
            break
          case 'created_at':
            exportRow['Fecha de Registro'] = patient.created_at ? new Date(patient.created_at).toLocaleDateString('es-ES') : ''
            break
        }
      })

      return exportRow
    })
  }

  /**
   * Generate CSV export
   */
  const exportToCSV = (data: any[]): string => {
    if (data.length === 0) {
      return ''
    }

    const csv = Papa.unparse(data, {
      quotes: true,
      delimiter: ',',
      header: true
    })

    return csv
  }

  /**
   * Generate XLSX export
   */
  const exportToXLSX = (data: any[]): ArrayBuffer => {
    if (data.length === 0) {
      // Return empty workbook
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet([])
      XLSX.utils.book_append_sheet(wb, ws, 'Pacientes')
      return XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    }

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes')

    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  }

  /**
   * Download file
   */
  const downloadFile = (content: string | ArrayBuffer, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Map validation errors to user-friendly messages
   */
  const mapImportErrors = (errors: ValidationError[]): string[] => {
    return errors.map(error => {
      return `Fila ${error.row}, campo "${error.field}": ${error.message}`
    })
  }

  /**
   * Generate errors CSV for download
   */
  const generateErrorsCSV = (invalidPatients: ValidatedPatient[]): string => {
    const errorsData = invalidPatients.map(patient => {
      return {
        'Nombre Completo': patient.nombre_completo || '',
        'Email': patient.email || '',
        'Teléfono': patient.telefono || '',
        'Errores': patient.errors.map(e => `${e.field}: ${e.message}`).join('; ')
      }
    })

    return Papa.unparse(errorsData, {
      quotes: true,
      delimiter: ',',
      header: true
    })
  }

  return {
    parseFile,
    validateRows,
    buildExport,
    exportToCSV,
    exportToXLSX,
    downloadFile,
    mapImportErrors,
    generateErrorsCSV,
    MAX_FILE_SIZE,
    MAX_ROWS
  }
}
