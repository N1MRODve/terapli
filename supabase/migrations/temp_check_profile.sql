-- Verificar si el perfil existe para karemeyde@gmail.com
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created_at,
  p.id as profile_id,
  p.email as profile_email,
  p.rol,
  p.nombre,
  p.created_at as profile_created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'karemeyde@gmail.com';
