/**
 * Utilidades para el manejo de datos de pacientes
 * Incluye funciones de retrocompatibilidad con el esquema anterior
 */

/**
 * Obtiene el nombre completo de un paciente, con retrocompatibilidad
 * para datos antiguos que puedan tener apellidos separados en metadata
 * 
 * @param paciente - Objeto paciente de Supabase
 * @returns Nombre completo del paciente o email como fallback
 */
export function getNombreCompletoPaciente(paciente: any): string {
  // Prioridad 1: nombre_completo en la tabla principal
  if (paciente.nombre_completo) {
    return paciente.nombre_completo
  }

  // Prioridad 2: nombre_completo en metadata (para compatibilidad)
  if (paciente.metadata?.nombre_completo) {
    return paciente.metadata.nombre_completo
  }

  // Prioridad 3: Construir desde metadata (datos antiguos)
  if (paciente.metadata?.nombre || paciente.metadata?.apellido_paterno) {
    const nombre = paciente.metadata.nombre || ''
    const apellidoPaterno = paciente.metadata.apellido_paterno || ''
    const apellidoMaterno = paciente.metadata.apellido_materno || ''
    
    return [nombre, apellidoPaterno, apellidoMaterno]
      .filter(Boolean)
      .join(' ')
      .trim()
  }

  // Prioridad 4: nombre solo (si existe en la tabla antigua)
  if (paciente.nombre) {
    return paciente.nombre
  }

  // Fallback: email
  return paciente.email || 'Sin nombre'
}

/**
 * Descompone un nombre completo en nombre y apellido
 * Útil para formularios de edición
 * 
 * @param nombreCompleto - Nombre completo del paciente
 * @returns Objeto con nombre y apellido separados
 */
export function descomponerNombreCompleto(nombreCompleto: string): { nombre: string; apellido: string } {
  if (!nombreCompleto || nombreCompleto.trim() === '') {
    return { nombre: '', apellido: '' }
  }

  const partes = nombreCompleto.trim().split(' ')
  
  if (partes.length === 0) {
    return { nombre: '', apellido: '' }
  }

  if (partes.length === 1) {
    return { nombre: partes[0] || '', apellido: '' }
  }

  // Primera palabra es el nombre, el resto son apellidos
  const nombre = partes[0] || ''
  const apellido = partes.slice(1).join(' ')

  return { nombre, apellido }
}

/**
 * Construye el nombre completo desde nombre y apellido
 * 
 * @param nombre - Nombre del paciente
 * @param apellido - Apellido(s) del paciente
 * @returns Nombre completo concatenado y limpio
 */
export function construirNombreCompleto(nombre: string, apellido: string): string {
  const nombreLimpio = (nombre || '').trim()
  const apellidoLimpio = (apellido || '').trim()

  if (!nombreLimpio && !apellidoLimpio) {
    return ''
  }

  if (!apellidoLimpio) {
    return nombreLimpio
  }

  if (!nombreLimpio) {
    return apellidoLimpio
  }

  return `${nombreLimpio} ${apellidoLimpio}`
}

/**
 * Formatea el nombre completo para mostrar con inicial del último apellido
 * Ejemplo: "María García López" -> "María García L."
 * 
 * @param nombreCompleto - Nombre completo del paciente
 * @returns Nombre formateado con inicial
 */
export function formatearNombreConInicial(nombreCompleto: string): string {
  if (!nombreCompleto || nombreCompleto.trim() === '') {
    return 'Sin nombre'
  }

  const partes = nombreCompleto.trim().split(' ')

  if (partes.length <= 2) {
    return nombreCompleto
  }

  // Si tiene más de 2 palabras, mostrar todo menos el último apellido con inicial
  const inicio = partes.slice(0, -1).join(' ')
  const ultimaPalabra = partes[partes.length - 1]
  const ultimaInicial = ultimaPalabra ? ultimaPalabra.charAt(0).toUpperCase() : ''

  return `${inicio} ${ultimaInicial}.`
}

/**
 * Obtiene las iniciales de un nombre completo para avatares
 * 
 * @param nombreCompleto - Nombre completo del paciente
 * @returns Iniciales (máximo 2 caracteres)
 */
export function getInicialesNombre(nombreCompleto: string): string {
  if (!nombreCompleto || nombreCompleto.trim() === '') {
    return '??'
  }

  const partes = nombreCompleto.trim().split(' ')

  if (partes.length === 0) {
    return '??'
  }

  if (partes.length === 1) {
    // Solo un nombre: usar las primeras 2 letras
    const palabra = partes[0] || ''
    return palabra.substring(0, 2).toUpperCase()
  }

  // Nombre y apellido: primera letra de cada uno
  const inicial1 = (partes[0] || '').charAt(0).toUpperCase()
  const inicial2 = (partes[1] || '').charAt(0).toUpperCase()

  return `${inicial1}${inicial2}`
}
