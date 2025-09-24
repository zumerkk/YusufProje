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

-- Add sample users and students (only if they don't exist)
DO $$
DECLARE
    user1_id UUID := gen_random_uuid();
    user2_id UUID := gen_random_uuid();
    user3_id UUID := gen_random_uuid();
    user4_id UUID := gen_random_uuid();
    user5_id UUID := gen_random_uuid();
BEGIN
    -- Check if we need to add sample data
    IF (SELECT COUNT(*) FROM students WHERE class_section IS NOT NULL) < 5 THEN
        -- Insert sample users
        INSERT INTO users (id, email, password_hash, role, is_active)
        VALUES 
            (user1_id, 'student1@test.com', '$2b$10$dummy.hash.for.testing', 'student', true),
            (user2_id, 'student2@test.com', '$2b$10$dummy.hash.for.testing', 'student', true),
            (user3_id, 'student3@test.com', '$2b$10$dummy.hash.for.testing', 'student', true),
            (user4_id, 'student4@test.com', '$2b$10$dummy.hash.for.testing', 'student', true),
            (user5_id, 'student5@test.com', '$2b$10$dummy.hash.for.testing', 'student', true)
        ON CONFLICT (email) DO NOTHING;
        
        -- Insert corresponding students
        INSERT INTO students (user_id, grade_level, class_section, school_name, parent_name, parent_phone, parent_email, learning_goals)
        VALUES 
            (user1_id, '9', 'A', 'Atatürk Lisesi', 'Ahmet Yılmaz', '0532-123-4567', 'ahmet@example.com', 'Matematik dersinde başarılı olmak'),
            (user2_id, '9', 'A', 'Atatürk Lisesi', 'Fatma Demir', '0533-234-5678', 'fatma@example.com', 'Fizik dersinde gelişim sağlamak'),
            (user3_id, '10', 'B', 'Gazi Lisesi', 'Mehmet Kaya', '0534-345-6789', 'mehmet@example.com', 'Kimya dersinde ilerlemek'),
            (user4_id, '10', 'B', 'Gazi Lisesi', 'Ayşe Özkan', '0535-456-7890', 'ayse@example.com', 'Biyoloji dersinde başarı'),
            (user5_id, '11', 'A', 'İstiklal Lisesi', 'Ali Çelik', '0536-567-8901', 'ali@example.com', 'Edebiyat dersinde gelişim');
    END IF;
END $$;