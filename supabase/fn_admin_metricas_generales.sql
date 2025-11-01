-- Función para calcular métricas generales del dashboard admin
-- Incluye: ingresos, CLTV, ocupación real, ocupación proyectada, ocupación próxima semana, churn rate

CREATE OR REPLACE FUNCTION fn_admin_metricas_generales()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resultado JSON;
  total_ingresos NUMERIC;
  total_pacientes INTEGER;
  cltv_promedio NUMERIC;
  tasa_ocupacion_real NUMERIC;
  tasa_ocupacion_proyectada NUMERIC;
  ocupacion_proxima_semana NUMERIC;
  churn_rate NUMERIC;
  pacientes_con_bono INTEGER;
  pacientes_nuevos INTEGER;
  total_bonos INTEGER;
  bonos_activos INTEGER;
  bonos_agotados INTEGER;
  total_citas INTEGER;
  citas_realizadas INTEGER;
  citas_canceladas INTEGER;
  num_terapeutas INTEGER;
  horas_disponibles_mes INTEGER;
  horas_disponibles_semana INTEGER;
  horas_ocupadas_real INTEGER;
  horas_ocupadas_proyectadas INTEGER;
  horas_ocupadas_proxima_semana INTEGER;
  fecha_mes_atras DATE;
  fecha_tres_meses_atras DATE;
  fecha_proxima_semana_inicio DATE;
  fecha_proxima_semana_fin DATE;
  pacientes_inactivos INTEGER;
BEGIN
  -- Fechas de referencia
  fecha_mes_atras := CURRENT_DATE - INTERVAL '30 days';
  fecha_tres_meses_atras := CURRENT_DATE - INTERVAL '90 days';
  -- Próxima semana: desde mañana hasta dentro de 7 días
  fecha_proxima_semana_inicio := CURRENT_DATE + INTERVAL '1 day';
  fecha_proxima_semana_fin := CURRENT_DATE + INTERVAL '7 days';
  
  -- === INGRESOS TOTALES (desde bonos pagados) ===
  SELECT COALESCE(SUM(monto_total), 0)
  INTO total_ingresos
  FROM bonos
  WHERE pagado = true;
  
  -- === PACIENTES ===
  SELECT COUNT(*)
  INTO total_pacientes
  FROM pacientes;
  
  -- Pacientes con bono activo
  SELECT COUNT(DISTINCT paciente_id)
  INTO pacientes_con_bono
  FROM bonos
  WHERE estado = 'activo';
  
  -- Pacientes nuevos (último mes)
  SELECT COUNT(*)
  INTO pacientes_nuevos
  FROM pacientes
  WHERE created_at >= fecha_mes_atras;
  
  -- === CLTV PROMEDIO ===
  IF total_pacientes > 0 THEN
    cltv_promedio := total_ingresos / total_pacientes;
  ELSE
    cltv_promedio := 0;
  END IF;
  
  -- === BONOS ===
  SELECT COUNT(*) INTO total_bonos FROM bonos;
  SELECT COUNT(*) INTO bonos_activos FROM bonos WHERE estado = 'activo';
  SELECT COUNT(*) INTO bonos_agotados FROM bonos WHERE estado = 'agotado';
  
  -- === CITAS ===
  SELECT COUNT(*) INTO total_citas FROM citas;
  SELECT COUNT(*) INTO citas_realizadas FROM citas WHERE estado = 'realizada';
  SELECT COUNT(*) INTO citas_canceladas FROM citas WHERE estado = 'cancelada';
  
  -- === TASA DE OCUPACIÓN (últimos 30 días) ===
  -- Horario: 11:00-22:00 con descanso 14:00-17:00 = 9 horas/día
  SELECT COUNT(*) INTO num_terapeutas FROM terapeutas WHERE activo = true;
  
  IF num_terapeutas = 0 THEN
    num_terapeutas := 1; -- Evitar división por cero
  END IF;
  
  horas_disponibles_mes := 30 * 9 * num_terapeutas; -- 30 días * 9 horas * num_terapeutas
  horas_disponibles_semana := 7 * 9 * num_terapeutas; -- 7 días * 9 horas * num_terapeutas
  
  -- OCUPACIÓN REAL: solo confirmadas y realizadas (últimos 30 días)
  SELECT COUNT(*)
  INTO horas_ocupadas_real
  FROM citas
  WHERE fecha_cita >= fecha_mes_atras
    AND estado IN ('realizada', 'confirmada');
  
  IF horas_disponibles_mes > 0 THEN
    tasa_ocupacion_real := ROUND((horas_ocupadas_real::NUMERIC / horas_disponibles_mes::NUMERIC) * 100);
  ELSE
    tasa_ocupacion_real := 0;
  END IF;
  
  -- OCUPACIÓN PROYECTADA: incluye pendientes, confirmadas y realizadas (últimos 30 días)
  SELECT COUNT(*)
  INTO horas_ocupadas_proyectadas
  FROM citas
  WHERE fecha_cita >= fecha_mes_atras
    AND estado IN ('realizada', 'confirmada', 'pendiente');
  
  IF horas_disponibles_mes > 0 THEN
    tasa_ocupacion_proyectada := ROUND((horas_ocupadas_proyectadas::NUMERIC / horas_disponibles_mes::NUMERIC) * 100);
  ELSE
    tasa_ocupacion_proyectada := 0;
  END IF;
  
  -- OCUPACIÓN PRÓXIMA SEMANA: todas las citas programadas (pendientes, confirmadas)
  SELECT COUNT(*)
  INTO horas_ocupadas_proxima_semana
  FROM citas
  WHERE fecha_cita >= fecha_proxima_semana_inicio
    AND fecha_cita <= fecha_proxima_semana_fin
    AND estado IN ('pendiente', 'confirmada');
  
  IF horas_disponibles_semana > 0 THEN
    ocupacion_proxima_semana := ROUND((horas_ocupadas_proxima_semana::NUMERIC / horas_disponibles_semana::NUMERIC) * 100);
  ELSE
    ocupacion_proxima_semana := 0;
  END IF;
  
  -- === CHURN RATE (pacientes sin citas en últimos 3 meses) ===
  SELECT COUNT(DISTINCT p.id)
  INTO pacientes_inactivos
  FROM pacientes p
  WHERE NOT EXISTS (
    SELECT 1 
    FROM citas c 
    WHERE c.paciente_id = p.id 
      AND c.fecha_cita >= fecha_tres_meses_atras
  );
  
  IF total_pacientes > 0 THEN
    churn_rate := ROUND((pacientes_inactivos::NUMERIC / total_pacientes::NUMERIC) * 100);
  ELSE
    churn_rate := 0;
  END IF;
  
  -- Construir JSON de resultado
  resultado := json_build_object(
    'ingresoTotal', total_ingresos,
    'cltvPromedio', cltv_promedio,
    'tasaOcupacionReal', tasa_ocupacion_real,
    'tasaOcupacionProyectada', tasa_ocupacion_proyectada,
    'ocupacionProximaSemana', ocupacion_proxima_semana,
    'churnRate', churn_rate,
    'totalPacientes', total_pacientes,
    'pacientesConBono', pacientes_con_bono,
    'pacientesNuevos', pacientes_nuevos,
    'totalBonos', total_bonos,
    'bonosActivos', bonos_activos,
    'bonosAgotados', bonos_agotados,
    'totalCitas', total_citas,
    'citasRealizadas', citas_realizadas,
    'citasCanceladas', citas_canceladas,
    'numTerapeutas', num_terapeutas,
    'horasDisponiblesMes', horas_disponibles_mes,
    'horasDisponiblesSemana', horas_disponibles_semana,
    'horasOcupadasReal', horas_ocupadas_real,
    'horasOcupadasProyectadas', horas_ocupadas_proyectadas,
    'horasOcupadasProximaSemana', horas_ocupadas_proxima_semana
  );
  
  RETURN resultado;
END;
$$;

-- Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION fn_admin_metricas_generales() TO authenticated;

-- Comentario
COMMENT ON FUNCTION fn_admin_metricas_generales() IS 
'Calcula todas las métricas generales para el dashboard del administrador. 
Incluye ingresos, CLTV, tres tipos de ocupación (real, proyectada, próxima semana), churn rate y estadísticas de pacientes, bonos y citas.
- Ocupación Real: solo citas confirmadas y realizadas
- Ocupación Proyectada: incluye pendientes, confirmadas y realizadas
- Ocupación Próxima Semana: previsión de citas programadas (pendientes + confirmadas) para los próximos 7 días';

DECLARE
  resultado JSON;
  total_ingresos NUMERIC;
  total_pacientes INTEGER;
  cltv_promedio NUMERIC;
  tasa_ocupacion_real NUMERIC;
  tasa_ocupacion_proyectada NUMERIC;
  ocupacion_proxima_semana NUMERIC;
  churn_rate NUMERIC;
  pacientes_con_bono INTEGER;
  pacientes_nuevos INTEGER;
  total_bonos INTEGER;
  bonos_activos INTEGER;
  bonos_agotados INTEGER;
  total_citas INTEGER;
  citas_realizadas INTEGER;
  citas_canceladas INTEGER;
  num_terapeutas INTEGER;
  horas_disponibles_mes INTEGER;
  horas_disponibles_semana INTEGER;
  horas_ocupadas_real INTEGER;
  horas_ocupadas_proyectadas INTEGER;
  horas_ocupadas_proxima_semana INTEGER;
  fecha_mes_atras DATE;
  fecha_tres_meses_atras DATE;
  fecha_proxima_semana_inicio DATE;
  fecha_proxima_semana_fin DATE;
  pacientes_inactivos INTEGER;
BEGIN
  -- Fechas de referencia
  fecha_mes_atras := CURRENT_DATE - INTERVAL '30 days';
  fecha_tres_meses_atras := CURRENT_DATE - INTERVAL '90 days';
  -- Próxima semana: desde mañana hasta dentro de 7 días
  fecha_proxima_semana_inicio := CURRENT_DATE + INTERVAL '1 day';
  fecha_proxima_semana_fin := CURRENT_DATE + INTERVAL '7 days';
  
  -- === INGRESOS TOTALES (desde bonos pagados) ===
  SELECT COALESCE(SUM(monto_total), 0)
  INTO total_ingresos
  FROM bonos
  WHERE pagado = true;
  
  -- === PACIENTES ===
  SELECT COUNT(*)
  INTO total_pacientes
  FROM pacientes;
  
  -- Pacientes con bono activo
  SELECT COUNT(DISTINCT paciente_id)
  INTO pacientes_con_bono
  FROM bonos
  WHERE estado = 'activo';
  
  -- Pacientes nuevos (último mes)
  SELECT COUNT(*)
  INTO pacientes_nuevos
  FROM pacientes
  WHERE created_at >= fecha_mes_atras;
  
  -- === CLTV PROMEDIO ===
  IF total_pacientes > 0 THEN
    cltv_promedio := total_ingresos / total_pacientes;
  ELSE
    cltv_promedio := 0;
  END IF;
  
  -- === BONOS ===
  SELECT COUNT(*) INTO total_bonos FROM bonos;
  SELECT COUNT(*) INTO bonos_activos FROM bonos WHERE estado = 'activo';
  SELECT COUNT(*) INTO bonos_agotados FROM bonos WHERE estado = 'agotado';
  
  -- === CITAS ===
  SELECT COUNT(*) INTO total_citas FROM citas;
  SELECT COUNT(*) INTO citas_realizadas FROM citas WHERE estado = 'realizada';
  SELECT COUNT(*) INTO citas_canceladas FROM citas WHERE estado = 'cancelada';
  
  -- === TASA DE OCUPACIÓN (últimos 30 días) ===
  -- Horario: 11:00-22:00 con descanso 14:00-17:00 = 9 horas/día
  -- Cuenta citas que ocupan espacio: realizadas, confirmadas y pendientes
  SELECT COUNT(*) INTO num_terapeutas FROM terapeutas WHERE activo = true;
  
  IF num_terapeutas = 0 THEN
    num_terapeutas := 1; -- Evitar división por cero
  END IF;
  
  horas_disponibles := 30 * 9 * num_terapeutas; -- 30 días * 9 horas * num_terapeutas
  
  -- Contar citas que ocupan la agenda (excluye canceladas)
  SELECT COUNT(*)
  INTO horas_ocupadas
  FROM citas
  WHERE fecha_cita >= fecha_mes_atras
    AND estado IN ('realizada', 'confirmada', 'pendiente');
  
  IF horas_disponibles > 0 THEN
    tasa_ocupacion := ROUND((horas_ocupadas::NUMERIC / horas_disponibles::NUMERIC) * 100);
  ELSE
    tasa_ocupacion := 0;
  END IF;
  
  -- === CHURN RATE (pacientes sin citas en últimos 3 meses) ===
  SELECT COUNT(DISTINCT p.id)
  INTO pacientes_inactivos
  FROM pacientes p
  WHERE NOT EXISTS (
    SELECT 1 
    FROM citas c 
    WHERE c.paciente_id = p.id 
      AND c.fecha_cita >= fecha_tres_meses_atras
  );
  
  IF total_pacientes > 0 THEN
    churn_rate := ROUND((pacientes_inactivos::NUMERIC / total_pacientes::NUMERIC) * 100);
  ELSE
    churn_rate := 0;
  END IF;
  
  -- Construir JSON de resultado
  resultado := json_build_object(
    'ingresoTotal', total_ingresos,
    'cltvPromedio', cltv_promedio,
    'tasaOcupacion', tasa_ocupacion,
    'churnRate', churn_rate,
    'totalPacientes', total_pacientes,
    'pacientesConBono', pacientes_con_bono,
    'pacientesNuevos', pacientes_nuevos,
    'totalBonos', total_bonos,
    'bonosActivos', bonos_activos,
    'bonosAgotados', bonos_agotados,
    'totalCitas', total_citas,
    'citasRealizadas', citas_realizadas,
    'citasCanceladas', citas_canceladas,
    'numTerapeutas', num_terapeutas,
    'horasDisponibles', horas_disponibles,
    'horasOcupadas', horas_ocupadas
  );
  
  RETURN resultado;
END;
$$;

-- Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION fn_admin_metricas_generales() TO authenticated;

-- Comentario
COMMENT ON FUNCTION fn_admin_metricas_generales() IS 
'Calcula todas las métricas generales para el dashboard del administrador. 
Incluye ingresos, CLTV, ocupación de agenda (9h/día), churn rate y estadísticas de pacientes, bonos y citas.';
