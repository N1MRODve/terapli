-- Agregar columna monto_total como alias de monto en la tabla bonos
-- Esto mantiene compatibilidad con código existente

-- Opción 1: Renombrar monto a monto_total (recomendado para consistencia)
ALTER TABLE bonos 
RENAME COLUMN monto TO monto_total;

-- Actualizar comentario
COMMENT ON COLUMN bonos.monto_total IS 'Monto total del bono en euros';

-- Actualizar las referencias en funciones y vistas si existen
-- Nota: Las funciones y triggers se actualizarán automáticamente con el nuevo nombre de columna
