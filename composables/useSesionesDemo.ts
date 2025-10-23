import type { SesionDetallada } from './useSesiones'

export const useSesionesDemo = () => {
  /**
   * Genera datos de demo para el módulo de sesiones
   */
  const generarSesionesDemo = (): SesionDetallada[] => {
    const pacientes = [
      { nombre: 'María', apellido: 'Pérez' },
      { nombre: 'Luis', apellido: 'García' },
      { nombre: 'Ana', apellido: 'Rodríguez' },
      { nombre: 'Carlos', apellido: 'Martínez' },
      { nombre: 'Laura', apellido: 'López' },
      { nombre: 'Jorge', apellido: 'Sánchez' },
      { nombre: 'Elena', apellido: 'Fernández' },
      { nombre: 'Pablo', apellido: 'González' },
      { nombre: 'Carmen', apellido: 'Díaz' },
      { nombre: 'Miguel', apellido: 'Torres' }
    ]

    const observaciones = [
      'Primera sesión de evaluación',
      'Seguimiento de evolución positiva',
      'Trabajo en técnicas de relajación',
      'Sesión de cierre de ciclo terapéutico',
      'Evaluación de progreso mensual',
      'Sesión centrada en mindfulness',
      'Paciente canceló con 48h de antelación',
      'Trabajo en gestión emocional',
      'Revisión de objetivos terapéuticos',
      'Sesión de mantenimiento'
    ]

    const sesiones: SesionDetallada[] = []
    const ahora = new Date()

    // Generar 25 sesiones de ejemplo
    for (let i = 0; i < 25; i++) {
      const paciente = pacientes[Math.floor(Math.random() * pacientes.length)]
      const diasOffset = Math.floor(Math.random() * 60) - 30 // Entre -30 y +30 días
      const fecha = new Date(ahora)
      fecha.setDate(fecha.getDate() + diasOffset)

      // Determinar estado basado en la fecha
      let estado: 'pendiente' | 'confirmada' | 'anulada' | 'completada'
      let pagoConfirmado = false

      if (diasOffset > 0) {
        // Sesiones futuras
        estado = Math.random() > 0.2 ? 'pendiente' : 'confirmada'
        pagoConfirmado = estado === 'confirmada'
      } else {
        // Sesiones pasadas
        const rand = Math.random()
        if (rand < 0.15) {
          estado = 'anulada'
        } else if (rand < 0.70) {
          estado = 'confirmada'
          pagoConfirmado = true
        } else {
          estado = 'completada'
          pagoConfirmado = true
        }
      }

      // Precio aleatorio entre 45€ y 65€
      const precioBase = [45, 50, 55, 60, 65]
      const precio = precioBase[Math.floor(Math.random() * precioBase.length)] || 50

      sesiones.push({
        id: `demo-${i}-${Date.now()}`,
        paciente_id: `paciente-demo-${i}`,
        terapeuta_id: 'terapeuta-demo',
        fecha: fecha.toISOString(),
        estado,
        modalidad: Math.random() > 0.4 ? 'online' : 'presencial',
        precio_total: precio,
        observaciones: estado === 'anulada' 
          ? 'Paciente canceló con antelación' 
          : observaciones[Math.floor(Math.random() * observaciones.length)],
        pago_confirmado: pagoConfirmado,
        created_at: new Date().toISOString(),
        paciente_nombre: paciente?.nombre || 'Paciente',
        paciente_apellido: paciente?.apellido || 'Demo'
      })
    }

    // Ordenar por fecha descendente
    return sesiones.sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )
  }

  /**
   * Verifica si el modo demo está activo
   */
  const esModoDemo = (): boolean => {
    if (process.client) {
      return localStorage.getItem('sesiones_modo_demo') === 'true'
    }
    return false
  }

  /**
   * Activa el modo demo
   */
  const activarModoDemo = () => {
    if (process.client) {
      localStorage.setItem('sesiones_modo_demo', 'true')
      console.log('✅ Modo demo de sesiones activado')
    }
  }

  /**
   * Desactiva el modo demo
   */
  const desactivarModoDemo = () => {
    if (process.client) {
      localStorage.removeItem('sesiones_modo_demo')
      console.log('✅ Modo demo de sesiones desactivado')
    }
  }

  /**
   * Alterna el modo demo
   */
  const toggleModoDemo = () => {
    if (esModoDemo()) {
      desactivarModoDemo()
    } else {
      activarModoDemo()
    }
  }

  return {
    generarSesionesDemo,
    esModoDemo,
    activarModoDemo,
    desactivarModoDemo,
    toggleModoDemo
  }
}
