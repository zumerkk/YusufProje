-- Add class_section column to students table if it doesn't exist
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS class_section VARCHAR(10);

-- Update existing students with sample class sections
UPDATE students 
SET class_section = CASE 
    WHEN grade_level = '9' THEN 'A'
    WHEN grade_level = '10' THEN 'B'
    WHEN grade_level = '11' THEN 'A'
    WHEN grade_level = '12' THEN 'C'
    ELSE 'A'
END
WHERE class_section IS NULL;

-- Add some sample data for testing
INSERT INTO students (user_id, grade_level, class_section, school_name, parent_name, parent_phone, parent_email, learning_goals)
SELECT 
    gen_random_uuid(),
    '9',
    'A',
    'Atatürk Lisesi',
    'Ahmet Yılmaz',
    '0532-123-4567',
    'ahmet@example.com',
    'Matematik dersinde başarılı olmak'
WHERE NOT EXISTS (
    SELECT 1 FROM students WHERE grade_level = '9' AND class_section = 'A' LIMIT 5
);

INSERT INTO students (user_id, grade_level, class_section, school_name, parent_name, parent_phone, parent_email, learning_goals)
SELECT 
    gen_random_uuid(),
    '10',
    'B',
    'Atatürk Lisesi',
    'Fatma Demir',
    '0533-234-5678',
    'fatma@example.com',
    'Fizik dersinde gelişim sağlamak'
WHERE NOT EXISTS (
    SELECT 1 FROM students WHERE grade_level = '10' AND class_section = 'B' LIMIT 3
);