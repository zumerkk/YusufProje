-- Check current user's grade level from database
SELECT 
  u.email,
  p.first_name,
  p.last_name,
  s.grade_level
FROM users u
JOIN profiles p ON u.id = p.user_id
JOIN students s ON u.id = s.user_id
WHERE u.email = 'z.kekillioglu@gmail.com';