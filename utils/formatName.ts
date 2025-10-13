/**
 * Capitaliza la primera letra de cada palabra en un nombre
 * Convierte el resto de las letras a minúsculas
 * @param name - El nombre a formatear
 * @returns El nombre con formato capitalizado
 */
export function capitalizeName(name: string): string {
  if (!name) return ''
  
  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return ''
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .filter(word => word.length > 0) // Eliminar espacios múltiples
    .join(' ')
}
