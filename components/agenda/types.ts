// =============================================================================
// TIPOS COMPARTIDOS - Sistema de Agenda Rediseñado
// =============================================================================
// Interfaces TypeScript para componentes de agenda

export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'realizada'
export type VistaAgenda = 'dia' | '5dias' | 'semana' | 'mes'
export type Modalidad = 'online' | 'presencial'

export interface AgendaEvent {
  id: string
  pacienteNombre: string
  pacienteId: string
  estado: EstadoCita
  fecha: string // ISO date
  horaInicio: string // 'HH:mm'
  horaFin: string // 'HH:mm'
  modalidad?: Modalidad
  bono?: {
    id: string
    sesionesRestantes?: number
    sesionesTotales?: number
  } | null
  terapeuta?: {
    id: string
    nombre: string
  } | null
  enlace?: string
  notas?: string
  areaTerapeutica?: string
  tipoSesion?: 'individual' | 'pareja' | 'familia' | 'grupal'
}

export interface FiltrosAgenda {
  estados?: EstadoCita[]
  terapeutaId?: string
  pacienteId?: string
  modalidad?: Modalidad
  busqueda?: string
  fechaDesde?: string
  fechaHasta?: string
}

export interface TimeSlot {
  date: string
  horaInicio: string
}

// Constantes de colores por estado
export const COLORES_ESTADO = {
  pendiente: {
    border: 'border-amber-200 dark:border-amber-800',
    bg: 'bg-white dark:bg-zinc-800',
    badge: 'bg-amber-400 dark:bg-amber-500',
    dot: 'bg-amber-400 dark:bg-amber-500',
    hover: 'hover:bg-amber-50 dark:hover:bg-amber-950/20'
  },
  confirmada: {
    border: 'border-emerald-200 dark:border-emerald-800',
    bg: 'bg-white dark:bg-zinc-800',
    badge: 'bg-emerald-400 dark:bg-emerald-500',
    dot: 'bg-emerald-400 dark:bg-emerald-500',
    hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
  },
  cancelada: {
    border: 'border-rose-200 dark:border-rose-800',
    bg: 'bg-white dark:bg-zinc-800',
    badge: 'bg-rose-400 dark:bg-rose-500',
    dot: 'bg-rose-400 dark:bg-rose-500',
    hover: 'hover:bg-rose-50 dark:hover:bg-rose-950/20'
  },
  realizada: {
    border: 'border-blue-200 dark:border-blue-800',
    bg: 'bg-white dark:bg-zinc-800',
    badge: 'bg-blue-400 dark:bg-blue-500',
    dot: 'bg-blue-400 dark:bg-blue-500',
    hover: 'hover:bg-blue-50 dark:hover:bg-blue-950/20'
  }
} as const

// Utilidades de fecha
export const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha + 'T00:00:00')
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export const formatearMesAnio = (fecha: string): string => {
  const date = new Date(fecha + 'T00:00:00')
  return date.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  })
}

export const formatearDiaSemana = (fecha: string): string => {
  const date = new Date(fecha + 'T00:00:00')
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  })
}

export const obtenerNumeroSemana = (fecha: string): number => {
  const date = new Date(fecha + 'T00:00:00')
  const inicioAnio = new Date(date.getFullYear(), 0, 1)
  const diferencia = date.getTime() - inicioAnio.getTime()
  const unDia = 1000 * 60 * 60 * 24
  return Math.ceil((diferencia / unDia + inicioAnio.getDay() + 1) / 7)
}

export const obtenerTituloAgenda = (vista: VistaAgenda, fecha: Date | string): string => {
  // Convertir Date a string ISO si es necesario
  const fechaStr = typeof fecha === 'string' ? fecha : fecha.toISOString().split('T')[0]!

  switch (vista) {
    case 'dia':
      return formatearFecha(fechaStr)
    case '5dias':
      return `${formatearMesAnio(fechaStr)} — 5 días`
    case 'semana':
      return `${formatearMesAnio(fechaStr)} — Semana ${obtenerNumeroSemana(fechaStr)}`
    case 'mes':
      return formatearMesAnio(fechaStr)
    default:
      return ''
  }
}

// Utilidades de horarios
export const generarBloquesHorarios = (inicio: string = '08:00', fin: string = '20:00', intervalo: number = 30): string[] => {
  const bloques: string[] = []
  const [horaInicio, minInicio] = inicio.split(':').map(Number)
  const [horaFin, minFin] = fin.split(':').map(Number)
  
  let horaActual = horaInicio!
  let minActual = minInicio!
  
  while (horaActual < horaFin! || (horaActual === horaFin! && minActual < minFin!)) {
    bloques.push(`${String(horaActual).padStart(2, '0')}:${String(minActual).padStart(2, '0')}`)
    
    minActual += intervalo
    if (minActual >= 60) {
      horaActual++
      minActual -= 60
    }
  }
  
  return bloques
}

export const calcularDuracionMinutos = (horaInicio: string, horaFin: string): number => {
  const [hi, mi] = horaInicio.split(':').map(Number)
  const [hf, mf] = horaFin.split(':').map(Number)
  return (hf! * 60 + mf!) - (hi! * 60 + mi!)
}

// Utilidades de navegación temporal
export const agregarDias = (fecha: string, dias: number): string => {
  const date = new Date(fecha + 'T00:00:00')
  date.setDate(date.getDate() + dias)
  return date.toISOString().split('T')[0]!
}

export const inicioSemana = (fecha: string): string => {
  const date = new Date(fecha + 'T00:00:00')
  const dia = date.getDay()
  const diff = dia === 0 ? -6 : 1 - dia // Lunes como inicio
  date.setDate(date.getDate() + diff)
  return date.toISOString().split('T')[0]!
}

export const inicioMes = (fecha: string): string => {
  const date = new Date(fecha + 'T00:00:00')
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]!
}

export const hoy = (): string => {
  return new Date().toISOString().split('T')[0]!
}
