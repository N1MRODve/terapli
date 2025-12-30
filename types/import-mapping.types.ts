/**
 * =============================================================================
 * TIPOS: Sistema de Importación Flexible de Pacientes
 * =============================================================================
 * Define las interfaces y tipos para el nuevo sistema de mapeo de columnas
 * que permite importar archivos Excel/CSV con cualquier estructura.
 */

// ============================================================================
// DETECCIÓN DE COLUMNAS
// ============================================================================

/**
 * Columna detectada del archivo del usuario
 */
export interface DetectedColumn {
  /** Nombre original de la columna en el archivo Excel/CSV */
  name: string

  /** 3-5 valores de ejemplo de esa columna */
  sampleValues: string[]

  /** Campo Teraplí sugerido automáticamente por el algoritmo */
  suggestedMapping?: string
}

// ============================================================================
// MAPEO DE COLUMNAS
// ============================================================================

/**
 * Mapeo individual: columna origen → campo destino
 */
export interface ColumnMapping {
  /** Nombre de la columna en el archivo del usuario */
  sourceColumn: string

  /** Campo interno del modelo Paciente */
  targetField: PacienteField | ''
}

/**
 * Configuración completa de importación guardada temporalmente
 */
export interface ImportConfig {
  /** UUID único de la configuración */
  id: string

  /** Usuario que creó la configuración */
  userId: string

  /** Nombre del archivo original */
  fileName: string

  /** Columnas detectadas con ejemplos */
  detectedColumns: DetectedColumn[]

  /** Mapeos elegidos/sugeridos */
  mappings: ColumnMapping[]

  /** Fecha de creación */
  createdAt: Date

  /** Fecha de expiración (1 hora después de creación) */
  expiresAt: Date
}

// ============================================================================
// CAMPOS DEL MODELO PACIENTE
// ============================================================================

/**
 * Campos disponibles en el modelo Paciente de Teraplí
 * Incluye campos obligatorios, opcionales y metadata
 */
export type PacienteField =
  // Campos obligatorios
  | 'nombre_completo'
  | 'email'
  | 'telefono'

  // Campos de tratamiento
  | 'area_de_acompanamiento'
  | 'frecuencia'
  | 'activo'

  // Campos de perfil extendido
  | 'fecha_nacimiento'
  | 'documento_identidad'
  | 'direccion'
  | 'contacto_emergencia'
  | 'derivacion'
  | 'medicacion'
  | 'orientacion_diagnostica'
  | 'inicio_tratamiento'

  // Campos financieros
  | 'precio_sesion'
  | 'descuento'

  // Metadata y notas
  | 'notas'

/**
 * Metadatos sobre un campo del modelo Paciente
 */
export interface PacienteFieldMetadata {
  /** Nombre interno del campo */
  field: PacienteField

  /** Nombre amigable para mostrar en UI */
  label: string

  /** Descripción del campo */
  description: string

  /** Si es obligatorio para crear un paciente */
  required: boolean

  /** Si es necesario para perfil completo */
  requiredForCompleteProfile: boolean

  /** Grupo al que pertenece (para organizar en UI) */
  group: 'basico' | 'contacto' | 'tratamiento' | 'financiero' | 'metadata'
}

/**
 * Catálogo completo de campos disponibles
 */
export const PACIENTE_FIELDS_CATALOG: PacienteFieldMetadata[] = [
  // Grupo: Básico
  {
    field: 'nombre_completo',
    label: 'Nombre Completo',
    description: 'Nombre y apellidos del paciente',
    required: true,
    requiredForCompleteProfile: true,
    group: 'basico'
  },
  {
    field: 'documento_identidad',
    label: 'Documento de Identidad',
    description: 'DNI, NIE, Pasaporte, etc.',
    required: false,
    requiredForCompleteProfile: true,
    group: 'basico'
  },
  {
    field: 'fecha_nacimiento',
    label: 'Fecha de Nacimiento',
    description: 'Fecha de nacimiento del paciente',
    required: false,
    requiredForCompleteProfile: false,
    group: 'basico'
  },

  // Grupo: Contacto
  {
    field: 'email',
    label: 'Email',
    description: 'Correo electrónico del paciente',
    required: false, // Pero se requiere email O teléfono
    requiredForCompleteProfile: true,
    group: 'contacto'
  },
  {
    field: 'telefono',
    label: 'Teléfono',
    description: 'Teléfono de contacto',
    required: false, // Pero se requiere email O teléfono
    requiredForCompleteProfile: true,
    group: 'contacto'
  },
  {
    field: 'direccion',
    label: 'Dirección',
    description: 'Dirección postal del paciente',
    required: false,
    requiredForCompleteProfile: false,
    group: 'contacto'
  },
  {
    field: 'contacto_emergencia',
    label: 'Contacto de Emergencia',
    description: 'Persona de contacto en caso de emergencia',
    required: false,
    requiredForCompleteProfile: false,
    group: 'contacto'
  },

  // Grupo: Tratamiento
  {
    field: 'area_de_acompanamiento',
    label: 'Área de Acompañamiento',
    description: 'Motivo de consulta o área de tratamiento',
    required: false,
    requiredForCompleteProfile: false,
    group: 'tratamiento'
  },
  {
    field: 'frecuencia',
    label: 'Frecuencia de Sesiones',
    description: 'Frecuencia de las sesiones (Semanal, Quincenal, etc.)',
    required: false,
    requiredForCompleteProfile: false,
    group: 'tratamiento'
  },
  {
    field: 'activo',
    label: 'Estado',
    description: 'Si el paciente está activo o inactivo',
    required: false,
    requiredForCompleteProfile: false,
    group: 'tratamiento'
  },
  {
    field: 'derivacion',
    label: 'Derivación',
    description: 'Quién derivó al paciente',
    required: false,
    requiredForCompleteProfile: false,
    group: 'tratamiento'
  },
  {
    field: 'medicacion',
    label: 'Medicación',
    description: 'Medicación actual del paciente',
    required: false,
    requiredForCompleteProfile: false,
    group: 'tratamiento'
  },
  {
    field: 'orientacion_diagnostica',
    label: 'Orientación Diagnóstica',
    description: 'Diagnóstico o hipótesis diagnóstica',
    required: false,
    requiredForCompleteProfile: false,
    group: 'tratamiento'
  },
  {
    field: 'inicio_tratamiento',
    label: 'Inicio del Tratamiento',
    description: 'Fecha de inicio del tratamiento',
    required: false,
    requiredForCompleteProfile: false,
    group: 'tratamiento'
  },

  // Grupo: Financiero
  {
    field: 'precio_sesion',
    label: 'Precio por Sesión',
    description: 'Precio acordado por sesión',
    required: false,
    requiredForCompleteProfile: false,
    group: 'financiero'
  },
  {
    field: 'descuento',
    label: 'Descuento',
    description: 'Descuento aplicable al paciente',
    required: false,
    requiredForCompleteProfile: false,
    group: 'financiero'
  },

  // Grupo: Metadata
  {
    field: 'notas',
    label: 'Notas',
    description: 'Observaciones adicionales',
    required: false,
    requiredForCompleteProfile: false,
    group: 'metadata'
  }
]

// ============================================================================
// VALIDACIÓN DE MAPEO
// ============================================================================

/**
 * Resultado de la validación del mapeo
 */
export interface MappingValidation {
  /** Si el mapeo es válido para importar */
  isValid: boolean

  /** Errores que impiden la importación */
  errors: string[]

  /** Advertencias que no impiden pero informan al usuario */
  warnings: string[]

  /** Si los campos obligatorios están mapeados */
  requiredFieldsMapped: boolean

  /** Campos obligatorios que faltan */
  missingRequiredFields?: PacienteField[]

  /** Campos para perfil completo que faltan */
  missingProfileFields?: PacienteField[]
}

// ============================================================================
// PERFILES INCOMPLETOS
// ============================================================================

/**
 * Paciente con perfil incompleto tras importación
 */
export interface IncompletePatientProfile {
  /** Número de fila en el archivo original */
  rowNumber: number

  /** Nombre del paciente */
  nombre_completo: string

  /** Campos que faltan para perfil completo */
  missingFields: PacienteField[]

  /** ID del paciente creado (si aplica) */
  patientId?: string
}

/**
 * Resumen de importación con perfiles incompletos
 */
export interface ImportResultWithProfiles {
  /** Total de filas procesadas */
  total: number

  /** Pacientes creados exitosamente */
  created: number

  /** Pacientes actualizados */
  updated: number

  /** Pacientes omitidos */
  skipped: number

  /** Errores durante la importación */
  errors: Array<{
    row: number
    error: string
  }>

  /** Pacientes con perfil incompleto */
  incompleteProfiles: IncompletePatientProfile[]
}

// ============================================================================
// DATOS PARSEADOS
// ============================================================================

/**
 * Archivo parseado con headers y datos de muestra
 */
export interface ParsedFilePreview {
  /** Nombre del archivo */
  fileName: string

  /** Headers detectados */
  headers: string[]

  /** Primeras 5 filas de datos */
  sampleRows: Record<string, any>[]

  /** Total de filas en el archivo */
  totalRows: number
}

/**
 * Fila del archivo mapeada a campos Teraplí
 */
export interface MappedPatientRow {
  /** Fila original con nombres de columna del usuario */
  originalRow: Record<string, any>

  /** Fila mapeada a campos Teraplí */
  mappedRow: Partial<Record<PacienteField, any>>

  /** Número de fila en el archivo */
  rowNumber: number
}
