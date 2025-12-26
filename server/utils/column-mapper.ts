/**
 * =============================================================================
 * UTILIDAD: Auto-mapeo Inteligente de Columnas
 * =============================================================================
 * Algoritmo que detecta automáticamente qué columnas del archivo del usuario
 * corresponden a qué campos del modelo Paciente usando fuzzy matching.
 */

import type { PacienteField, ColumnMapping } from '~/types/import-mapping.types'

/**
 * Diccionario de sinónimos y variaciones para cada campo
 * Usado para matching fuzzy entre nombres de columna
 */
const FIELD_SYNONYMS: Record<PacienteField, string[]> = {
  // Nombre completo
  nombre_completo: [
    'nombre',
    'nombre completo',
    'nombre y apellido',
    'nombre apellido',
    'paciente',
    'full name',
    'name',
    'cliente',
    'persona'
  ],

  // Email
  email: [
    'email',
    'e-mail',
    'correo',
    'correo electrónico',
    'correo electronico',
    'mail',
    'e mail'
  ],

  // Teléfono
  telefono: [
    'teléfono',
    'telefono',
    'tel',
    'celular',
    'móvil',
    'movil',
    'phone',
    'número de teléfono',
    'numero de telefono',
    'contacto'
  ],

  // Documento de identidad
  documento_identidad: [
    'documento',
    'documento de identidad',
    'dni',
    'nie',
    'pasaporte',
    'identificación',
    'identificacion',
    'id',
    'cédula',
    'cedula',
    'rut',
    'ci'
  ],

  // Fecha de nacimiento
  fecha_nacimiento: [
    'fecha de nacimiento',
    'fecha nacimiento',
    'nacimiento',
    'fecha nac',
    'fec nac',
    'birth date',
    'birthday',
    'edad' // Nota: puede ser edad en años, pero se infiere
  ],

  // Dirección
  direccion: [
    'dirección',
    'direccion',
    'domicilio',
    'address',
    'calle'
  ],

  // Contacto de emergencia
  contacto_emergencia: [
    'contacto emergencia',
    'contacto de emergencia',
    'emergencia',
    'contacto familiar',
    'familiar',
    'emergency contact'
  ],

  // Área de acompañamiento
  area_de_acompanamiento: [
    'área',
    'area',
    'área de acompañamiento',
    'area de acompanamiento',
    'motivo',
    'motivo consulta',
    'motivo de consulta',
    'diagnóstico',
    'diagnostico',
    'problema',
    'tratamiento'
  ],

  // Frecuencia
  frecuencia: [
    'frecuencia',
    'periodicidad',
    'frecuencia sesiones',
    'frequency'
  ],

  // Activo
  activo: [
    'activo',
    'estado',
    'status',
    'active',
    'vigente'
  ],

  // Derivación
  derivacion: [
    'derivación',
    'derivacion',
    'derivado por',
    'referido por',
    'referral'
  ],

  // Medicación
  medicacion: [
    'medicación',
    'medicacion',
    'medicamentos',
    'medication',
    'fármacos',
    'farmacos'
  ],

  // Orientación diagnóstica
  orientacion_diagnostica: [
    'orientación diagnóstica',
    'orientacion diagnostica',
    'diagnóstico',
    'diagnostico',
    'diagnosis',
    'hipótesis',
    'hipotesis'
  ],

  // Inicio del tratamiento
  inicio_tratamiento: [
    'inicio',
    'inicio tratamiento',
    'inicio del tratamiento',
    'fecha inicio',
    'start date'
  ],

  // Precio por sesión
  precio_sesion: [
    'precio',
    'precio sesión',
    'precio sesion',
    'tarifa',
    'coste',
    'costo',
    'price',
    'fee'
  ],

  // Comisión
  comision: [
    'comisión',
    'comision',
    'descuento',
    'commission'
  ],

  // Notas
  notas: [
    'notas',
    'observaciones',
    'comentarios',
    'notes',
    'remarks'
  ]
}

/**
 * Normaliza un texto para comparación fuzzy:
 * - Lowercase
 * - Quita acentos
 * - Quita puntuación
 * - Trim
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Quita marcas diacríticas
    .replace(/[^a-z0-9\s]/g, '') // Quita puntuación
    .trim()
}

/**
 * Calcula el score de similitud entre un nombre de columna y un sinónimo
 * Usa varios criterios:
 * - Coincidencia exacta: 1.0
 * - Contiene el sinónimo: 0.8
 * - Sinónimo contiene la columna: 0.6
 * - No coincide: 0.0
 */
function calculateSimilarityScore(columnName: string, synonym: string): number {
  const normalizedColumn = normalizeText(columnName)
  const normalizedSynonym = normalizeText(synonym)

  // Coincidencia exacta
  if (normalizedColumn === normalizedSynonym) {
    return 1.0
  }

  // La columna contiene el sinónimo completo
  if (normalizedColumn.includes(normalizedSynonym)) {
    return 0.8
  }

  // El sinónimo contiene la columna completa
  if (normalizedSynonym.includes(normalizedColumn)) {
    return 0.6
  }

  // Palabras en común (word-level matching)
  const columnWords = normalizedColumn.split(/\s+/)
  const synonymWords = normalizedSynonym.split(/\s+/)
  const commonWords = columnWords.filter(word => synonymWords.includes(word))

  if (commonWords.length > 0) {
    // Score basado en proporción de palabras en común
    const avgLength = (columnWords.length + synonymWords.length) / 2
    return (commonWords.length / avgLength) * 0.5
  }

  return 0.0
}

/**
 * Sugiere el mejor mapeo para un nombre de columna
 * Retorna el PacienteField con mayor score, o null si ninguno supera el umbral
 *
 * @param columnName Nombre de la columna en el archivo del usuario
 * @param threshold Umbral mínimo de similitud (default: 0.5)
 * @returns PacienteField sugerido o null
 */
export function suggestMapping(
  columnName: string,
  threshold: number = 0.5
): PacienteField | null {
  let bestField: PacienteField | null = null
  let bestScore = 0

  // Evaluar cada campo del diccionario
  for (const [field, synonyms] of Object.entries(FIELD_SYNONYMS) as [PacienteField, string[]][]) {
    // Calcular score máximo contra todos los sinónimos
    const maxScore = Math.max(
      ...synonyms.map(synonym => calculateSimilarityScore(columnName, synonym))
    )

    // Actualizar mejor campo si supera el score anterior
    if (maxScore > bestScore) {
      bestScore = maxScore
      bestField = field
    }
  }

  // Solo retornar si supera el umbral
  return bestScore >= threshold ? bestField : null
}

/**
 * Auto-mapea todas las columnas detectadas a campos Teraplí
 *
 * @param detectedColumns Array de nombres de columnas del archivo
 * @returns Array de ColumnMapping con mapeos sugeridos
 */
export function autoMapColumns(detectedColumns: string[]): ColumnMapping[] {
  const mappings: ColumnMapping[] = []
  const usedFields = new Set<PacienteField>()

  // Primera pasada: mapear columnas con alta confianza
  for (const columnName of detectedColumns) {
    const suggestedField = suggestMapping(columnName, 0.7) // Umbral alto

    if (suggestedField && !usedFields.has(suggestedField)) {
      mappings.push({
        sourceColumn: columnName,
        targetField: suggestedField
      })
      usedFields.add(suggestedField)
    }
  }

  // Segunda pasada: mapear columnas restantes con umbral más bajo
  for (const columnName of detectedColumns) {
    // Skip si ya fue mapeada
    if (mappings.some(m => m.sourceColumn === columnName)) {
      continue
    }

    const suggestedField = suggestMapping(columnName, 0.5) // Umbral normal

    if (suggestedField && !usedFields.has(suggestedField)) {
      mappings.push({
        sourceColumn: columnName,
        targetField: suggestedField
      })
      usedFields.add(suggestedField)
    } else {
      // No se pudo mapear, dejar vacío
      mappings.push({
        sourceColumn: columnName,
        targetField: ''
      })
    }
  }

  return mappings
}

/**
 * Valida que un mapeo tenga los campos obligatorios
 *
 * @param mappings Array de mapeos a validar
 * @returns true si tiene nombre_completo Y (email O telefono)
 */
export function hasRequiredFieldsMapped(mappings: ColumnMapping[]): boolean {
  const mappedFields = mappings
    .map(m => m.targetField)
    .filter(f => f !== '')

  const hasNombre = mappedFields.includes('nombre_completo')
  const hasEmail = mappedFields.includes('email')
  const hasTelefono = mappedFields.includes('telefono')

  return hasNombre && (hasEmail || hasTelefono)
}

/**
 * Obtiene los campos obligatorios que faltan en un mapeo
 *
 * @param mappings Array de mapeos a validar
 * @returns Array de campos obligatorios faltantes
 */
export function getMissingRequiredFields(mappings: ColumnMapping[]): PacienteField[] {
  const mappedFields = new Set(
    mappings
      .map(m => m.targetField)
      .filter(f => f !== '')
  )

  const missing: PacienteField[] = []

  if (!mappedFields.has('nombre_completo')) {
    missing.push('nombre_completo')
  }

  if (!mappedFields.has('email') && !mappedFields.has('telefono')) {
    missing.push('email') // O telefono, pero mostramos email como hint
  }

  return missing
}

/**
 * Obtiene los campos necesarios para perfil completo que faltan
 *
 * @param mappings Array de mapeos a validar
 * @returns Array de campos para perfil completo faltantes
 */
export function getMissingProfileFields(mappings: ColumnMapping[]): PacienteField[] {
  const mappedFields = new Set(
    mappings
      .map(m => m.targetField)
      .filter(f => f !== '')
  )

  const missing: PacienteField[] = []

  // Campos críticos para perfil completo
  const profileFields: PacienteField[] = [
    'nombre_completo',
    'email',
    'telefono',
    'documento_identidad'
  ]

  for (const field of profileFields) {
    if (!mappedFields.has(field)) {
      missing.push(field)
    }
  }

  return missing
}
