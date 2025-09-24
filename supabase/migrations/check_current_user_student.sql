-- Check current user's student record and grade_level
SELECT 
  u.id as user_id,
  u.email,
  u.role,
  s.id as student_id,
  s.grade_level,
  s.school_name,
  s.parent_phone
FROM users u
LEFT JOIN students s ON u.id = s.user_id
WHERE u.email = 'z.kekillioglu@gmail.com'
ORDER BY u.created_at DESC;

-- If student record doesn't exist, create one
INSERT INTO students (user_id, grade_level, school_name)
SELECT 
  u.id,
  '9. Sınıf' as grade_level,
  'Test Okulu' as school_name
FROM users u
WHERE u.email = 'z.kekillioglu@gmail.com'
  AND u.role = 'student'
  AND NOT EXISTS (
    SELECT 1 FROM students s WHERE s.user_id = u.id
  );

-- Update existing student record if grade_level is null
UPDATE students 
SET grade_level = '9. Sınıf',
    school_name = COALESCE(school_name, 'Test Okulu'),
    updated_at = now()
WHERE user_id IN (
  SELECT id FROM users WHERE email = 'z.kekillioglu@gmail.com' AND role = 'student'
)
AND grade_level IS NULL;

-- Final check
SELECT 
  u.id as user_id,
  u.email,
  u.role,
  s.id as student_id,
  s.grade_level,
  s.school_name,
  s.parent_phone
FROM users u
LEFT JOIN students s ON u.id = s.user_id
WHERE u.email = 'z.kekillioglu@gmail.com';