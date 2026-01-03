/**
 * useFichaPaciente.ts
 * Composable para manejar el modal de ficha de paciente de forma global
 * Permite abrir el modal desde cualquier parte de la aplicación
 */

// Estado global del modal
const modalAbierto = ref(false)
const pacienteIdActual = ref<string | null>(null)

export const useFichaPaciente = () => {
  /**
   * Abre el modal con la ficha del paciente
   * @param pacienteId - ID del paciente a mostrar
   */
  const abrirFichaPaciente = (pacienteId: string) => {
    pacienteIdActual.value = pacienteId
    modalAbierto.value = true
  }

  /**
   * Cierra el modal
   */
  const cerrarFichaPaciente = () => {
    modalAbierto.value = false
    // Limpiar ID después de la animación
    setTimeout(() => {
      pacienteIdActual.value = null
    }, 200)
  }

  return {
    // Estado
    modalAbierto: readonly(modalAbierto),
    pacienteIdActual: readonly(pacienteIdActual),

    // Acciones
    abrirFichaPaciente,
    cerrarFichaPaciente
  }
}
