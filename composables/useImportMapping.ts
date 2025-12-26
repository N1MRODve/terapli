/**
 * =============================================================================
 * COMPOSABLE: useImportMapping
 * =============================================================================
 * Maneja el flujo de importación flexible con mapeo de columnas.
 * Conecta con los endpoints de la API para detectar columnas, validar mapeo
 * y ejecutar la importación.
 */

import type {
  ImportConfig,
  ColumnMapping,
  MappingValidation,
  ImportResultWithProfiles,
  PacienteField,
  PACIENTE_FIELDS_CATALOG
} from '~/types/import-mapping.types'

export interface UseImportMappingReturn {
  // Estado
  config: Ref<ImportConfig | null>
  mappings: Ref<ColumnMapping[]>
  validation: Ref<MappingValidation | null>
  importResult: Ref<ImportResultWithProfiles | null>

  // Estados de carga
  detecting: Ref<boolean>
  validating: Ref<boolean>
  importing: Ref<boolean>

  // Errores
  error: Ref<string | null>

  // Acciones
  detectColumns: (file: File) => Promise<boolean>
  updateMapping: (sourceColumn: string, targetField: PacienteField | '') => void
  validateMapping: () => Promise<boolean>
  executeImport: (file: File, action: 'update' | 'skip') => Promise<boolean>
  reset: () => void

  // Helpers
  getMappedField: (sourceColumn: string) => PacienteField | ''
  getPreviewData: () => Record<string, any>[]
  hasRequiredFields: ComputedRef<boolean>
}

export function useImportMapping(): UseImportMappingReturn {
  // Estado
  const config = ref<ImportConfig | null>(null)
  const mappings = ref<ColumnMapping[]>([])
  const validation = ref<MappingValidation | null>(null)
  const importResult = ref<ImportResultWithProfiles | null>(null)

  // Estados de carga
  const detecting = ref(false)
  const validating = ref(false)
  const importing = ref(false)

  // Errores
  const error = ref<string | null>(null)

  /**
   * Detecta columnas del archivo y genera mapeo automático
   */
  const detectColumns = async (file: File): Promise<boolean> => {
    detecting.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/patients/import/detect-columns', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.statusMessage || 'Error al detectar columnas')
      }

      const data = await response.json()

      if (!data.success || !data.config) {
        throw new Error('Respuesta inválida del servidor')
      }

      config.value = data.config
      mappings.value = data.config.mappings || []

      // Validar automáticamente después de detectar
      await validateMapping()

      return true
    } catch (err: any) {
      error.value = err.message || 'Error al detectar columnas'
      console.error('Error en detectColumns:', err)
      return false
    } finally {
      detecting.value = false
    }
  }

  /**
   * Actualiza un mapeo individual
   */
  const updateMapping = (sourceColumn: string, targetField: PacienteField | '') => {
    const index = mappings.value.findIndex(m => m.sourceColumn === sourceColumn)

    if (index >= 0) {
      mappings.value[index] = { sourceColumn, targetField }
    } else {
      mappings.value.push({ sourceColumn, targetField })
    }

    // Revalidar después de cambiar
    validateMapping()
  }

  /**
   * Valida el mapeo actual contra el servidor
   */
  const validateMapping = async (): Promise<boolean> => {
    if (!config.value) {
      error.value = 'No hay configuración de importación'
      return false
    }

    validating.value = true
    error.value = null

    try {
      const response = await fetch('/api/patients/import/validate-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          configId: config.value.id,
          mappings: mappings.value
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.statusMessage || 'Error al validar mapeo')
      }

      const data = await response.json()
      validation.value = data.validation

      return data.validation?.isValid || false
    } catch (err: any) {
      error.value = err.message || 'Error al validar mapeo'
      console.error('Error en validateMapping:', err)
      return false
    } finally {
      validating.value = false
    }
  }

  /**
   * Ejecuta la importación con el mapeo configurado
   */
  const executeImport = async (file: File, action: 'update' | 'skip'): Promise<boolean> => {
    if (!config.value) {
      error.value = 'No hay configuración de importación'
      return false
    }

    if (!validation.value?.isValid) {
      error.value = 'El mapeo no es válido'
      return false
    }

    importing.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('configId', config.value.id)
      formData.append('action', action)
      // Enviar mappings como fallback en caso de que la BD no tenga la config
      formData.append('mappings', JSON.stringify(mappings.value))

      const response = await fetch('/api/patients/import/execute', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.statusMessage || 'Error al importar pacientes')
      }

      const data = await response.json()
      importResult.value = data.results

      return data.success
    } catch (err: any) {
      error.value = err.message || 'Error al importar pacientes'
      console.error('Error en executeImport:', err)
      return false
    } finally {
      importing.value = false
    }
  }

  /**
   * Resetea todo el estado
   */
  const reset = () => {
    config.value = null
    mappings.value = []
    validation.value = null
    importResult.value = null
    detecting.value = false
    validating.value = false
    importing.value = false
    error.value = null
  }

  /**
   * Obtiene el campo mapeado para una columna
   */
  const getMappedField = (sourceColumn: string): PacienteField | '' => {
    const mapping = mappings.value.find(m => m.sourceColumn === sourceColumn)
    return (mapping?.targetField as PacienteField) || ''
  }

  /**
   * Obtiene datos de vista previa con el mapeo aplicado
   */
  const getPreviewData = (): Record<string, any>[] => {
    if (!config.value?.detectedColumns) return []

    const sampleCount = Math.min(
      config.value.detectedColumns[0]?.sampleValues?.length || 0,
      3
    )

    const preview: Record<string, any>[] = []

    for (let i = 0; i < sampleCount; i++) {
      const row: Record<string, any> = {}

      for (const mapping of mappings.value) {
        if (mapping.targetField) {
          const column = config.value.detectedColumns.find(
            c => c.name === mapping.sourceColumn
          )
          row[mapping.targetField] = column?.sampleValues?.[i] || ''
        }
      }

      preview.push(row)
    }

    return preview
  }

  /**
   * Verifica si los campos obligatorios están mapeados
   */
  const hasRequiredFields = computed(() => {
    const mappedFields = new Set(
      mappings.value
        .map(m => m.targetField)
        .filter(f => f !== '')
    )

    const hasNombre = mappedFields.has('nombre_completo')
    const hasContacto = mappedFields.has('email') || mappedFields.has('telefono')

    return hasNombre && hasContacto
  })

  return {
    // Estado
    config,
    mappings,
    validation,
    importResult,

    // Estados de carga
    detecting,
    validating,
    importing,

    // Errores
    error,

    // Acciones
    detectColumns,
    updateMapping,
    validateMapping,
    executeImport,
    reset,

    // Helpers
    getMappedField,
    getPreviewData,
    hasRequiredFields
  }
}
