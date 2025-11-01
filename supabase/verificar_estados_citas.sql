-- Ver todos los estados de citas que existen
SELECT DISTINCT estado, COUNT(*) as cantidad
FROM citas
GROUP BY estado
ORDER BY cantidad DESC;
