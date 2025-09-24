-- Check if student record exists for demo user
SELECT 
  u.id as user_id,
  u.email,
  u.role,
  s.id as student_id,
  s.grade_level,
  s.school_name
FROM users u
LEFT JOIN students s ON u.id = s.user_id
WHERE u.email = 'student@dersatlasi.com';

-- If no student record exists, create one
INSERT INTO students (
  user_id,
  grade_level,
  school_name,
  parent_name,
  parent_phone,
  parent_email,
  learning_goals
)
SELECT 
  u.id,
  '9',
  'Demo Okulu',
  'Demo Veli',
  '+90 555 123 4567',
  'parent@dersatlasi.com',
  'Matematik ve fen bilimleri konularında gelişim'
FROM users u
WHERE u.email = 'student@dersatlasi.com'
  AND NOT EXISTS (
    SELECT 1 FROM students s WHERE s.user_id = u.id
  );

-- Verify the student record
SELECT 
  u.id as user_id,
  u.email,
  u.role,
  s.id as student_id,
  s.grade_level,
  s.school_name,
  s.parent_name
FROM users u
JOIN students s ON u.id = s.user_id
WHERE u.email = 'student@dersatlasi.com';