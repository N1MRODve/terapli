-- Verificar usuarios y sus roles
SELECT 
  id,
  email,
  rol as user_role,
  nombre_completo,
  created_at
FROM profiles
ORDER BY created_at DESC;
