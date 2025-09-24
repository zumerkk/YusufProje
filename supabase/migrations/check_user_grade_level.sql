-- Check z.kekillioglu@gmail.com user's grade level
SELECT 
  u.id as user_id,
  u.email,
  u.role,
  p.first_name,
  p.last_name,
  s.grade_level,
  s.school_name
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN students s ON u.id = s.user_id
WHERE u.email = 'z.kekillioglu@gmail.com';

-- If grade_level is null or not 8, update it to 8
UPDATE students 
SET grade_level = '8'
WHERE user_id = (
  SELECT id FROM users WHERE email = 'z.kekillioglu@gmail.com'
) AND (grade_level IS NULL OR grade_level != '8');

-- Verify the update
SELECT 
  u.email,
  s.grade_level
FROM users u
JOIN students s ON u.id = s.user_id
WHERE u.email = 'z.kekillioglu@gmail.com';