-- Check if student record exists for z.kekillioglu@gmail.com
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

-- If no student record exists, create one
INSERT INTO students (user_id, grade_level, school_name, parent_phone)
SELECT 
    u.id,
    '8',
    'Demo Okulu',
    '+90 555 123 4567'
FROM users u
WHERE u.email = 'z.kekillioglu@gmail.com' 
  AND u.role = 'student'
  AND NOT EXISTS (
    SELECT 1 FROM students s WHERE s.user_id = u.id
  );

-- Verify the result
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