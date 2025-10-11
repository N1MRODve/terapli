/*
  # Esquema base para plataforma de psicología

  ## Tablas creadas
  
  ### 1. `pacientes`
  - `id` (uuid, PK) - ID único del paciente
  - `email` (text, unique) - Email del paciente
  - `nombre` (text) - Nombre completo
  - `telefono` (text) - Teléfono de contacto
  - `notas_iniciales` (text) - Notas de primera consulta
  - `created_at` (timestamptz) - Fecha de registro
  
  ### 2. `bonos`
  - `id` (uuid, PK) - ID único del bono
  - `paciente_id` (uuid, FK) - Referencia al paciente
  - `sesiones_totales` (int) - Total de sesiones del bono
  - `sesiones_usadas` (int) - Sesiones ya utilizadas
  - `precio` (numeric) - Precio del bono
  - `activo` (boolean) - Si el bono está activo
  - `created_at` (timestamptz) - Fecha de compra
  
  ### 3. `sesiones`
  - `id` (uuid, PK) - ID único de la sesión
  - `paciente_id` (uuid, FK) - Referencia al paciente
  - `bono_id` (uuid, FK, nullable) - Bono asociado si aplica
  - `fecha` (timestamptz) - Fecha y hora de la sesión
  - `estado` (text) - Estado: programada, completada, cancelada
  - `notas` (text) - Notas de la sesión
  - `created_at` (timestamptz)
  
  ### 4. `pagos`
  - `id` (uuid, PK) - ID único del pago
  - `paciente_id` (uuid, FK) - Referencia al paciente
  - `bono_id` (uuid, FK, nullable) - Bono asociado
  - `monto` (numeric) - Monto pagado
  - `metodo` (text) - Método de pago
  - `estado` (text) - Estado: pendiente, completado, fallido
  - `created_at` (timestamptz)
  
  ### 5. `recursos`
  - `id` (uuid, PK) - ID único del recurso
  - `titulo` (text) - Título del recurso
  - `descripcion` (text) - Descripción
  - `url` (text) - URL del recurso
  - `tipo` (text) - Tipo: ejercicio, lectura, audio
  - `publico` (boolean) - Si es visible para todos los pacientes
  - `created_at` (timestamptz)
  
  ### 6. `mensajes`
  - `id` (uuid, PK) - ID único del mensaje
  - `paciente_id` (uuid, FK) - Referencia al paciente
  - `contenido` (text) - Contenido del mensaje
  - `de_psicologa` (boolean) - Si el mensaje es de la psicóloga
  - `leido` (boolean) - Si fue leído
  - `created_at` (timestamptz)

  ## Seguridad
  - RLS habilitado en todas las tablas
  - Pacientes solo ven sus propios datos
  - Recursos públicos visibles para todos los autenticados
*/

CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  nombre text NOT NULL,
  telefono text,
  notas_iniciales text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bonos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
  sesiones_totales int NOT NULL DEFAULT 0,
  sesiones_usadas int NOT NULL DEFAULT 0,
  precio numeric(10,2) NOT NULL DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sesiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
  bono_id uuid REFERENCES bonos(id) ON DELETE SET NULL,
  fecha timestamptz NOT NULL,
  estado text NOT NULL DEFAULT 'programada',
  notas text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
  bono_id uuid REFERENCES bonos(id) ON DELETE SET NULL,
  monto numeric(10,2) NOT NULL DEFAULT 0,
  metodo text NOT NULL DEFAULT '',
  estado text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recursos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  url text NOT NULL,
  tipo text NOT NULL DEFAULT 'lectura',
  publico boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mensajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
  contenido text NOT NULL,
  de_psicologa boolean DEFAULT false,
  leido boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pacientes can view own data"
  ON pacientes FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Pacientes can update own data"
  ON pacientes FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Pacientes can view own bonos"
  ON bonos FOR SELECT
  TO authenticated
  USING (paciente_id = auth.uid());

CREATE POLICY "Pacientes can view own sesiones"
  ON sesiones FOR SELECT
  TO authenticated
  USING (paciente_id = auth.uid());

CREATE POLICY "Pacientes can view own pagos"
  ON pagos FOR SELECT
  TO authenticated
  USING (paciente_id = auth.uid());

CREATE POLICY "Pacientes can view public recursos"
  ON recursos FOR SELECT
  TO authenticated
  USING (publico = true);

CREATE POLICY "Pacientes can view own mensajes"
  ON mensajes FOR SELECT
  TO authenticated
  USING (paciente_id = auth.uid());

CREATE POLICY "Pacientes can insert own mensajes"
  ON mensajes FOR INSERT
  TO authenticated
  WITH CHECK (paciente_id = auth.uid() AND de_psicologa = false);

CREATE POLICY "Pacientes can update leido status"
  ON mensajes FOR UPDATE
  TO authenticated
  USING (paciente_id = auth.uid())
  WITH CHECK (paciente_id = auth.uid());