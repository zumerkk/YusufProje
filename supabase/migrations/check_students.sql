-- Mevcut öğrencileri kontrol et
SELECT 
  u.id,
  u.email,
  u.role,
  u.is_active,
  p.first_name,
  p.last_name,
  s.grade_level,
  s.school_name
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN students s ON u.id = s.user_id
WHERE u.role = 'student'
ORDER BY s.grade_level, p.first_name;

-- Zümer adlı öğrenciyi ara
SELECT 
  u.id,
  u.email,
  p.first_name,
  p.last_name,
  s.grade_level
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN students s ON u.id = s.user_id
WHERE u.role = 'student'
  AND (p.first_name ILIKE '%zümer%' OR p.last_name ILIKE '%zümer%' OR u.email ILIKE '%zümer%');

-- 8. sınıf öğrencilerini kontrol et
SELECT 
  u.id,
  u.email,
  p.first_name,
  p.last_name,
  s.grade_level
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN students s ON u.id = s.user_id
WHERE u.role = 'student'
  AND s.grade_level LIKE '8%';