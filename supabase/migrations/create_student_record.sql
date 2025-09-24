-- Create student record for z.kekillioglu@gmail.com
-- First, check if user exists and get user_id
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Get user record
    SELECT id, email, role INTO user_record
    FROM users 
    WHERE email = 'z.kekillioglu@gmail.com' AND role = 'student';
    
    IF user_record.id IS NOT NULL THEN
        -- Check if student record already exists
        IF NOT EXISTS (SELECT 1 FROM students WHERE user_id = user_record.id) THEN
            -- Insert student record
            INSERT INTO students (user_id, grade_level, school_name, parent_phone)
            VALUES (
                user_record.id,
                '8',
                'Demo Okulu',
                '+90 555 123 4567'
            );
            
            RAISE NOTICE 'Student record created for user: %', user_record.email;
        ELSE
            -- Update existing student record
            UPDATE students 
            SET grade_level = '8',
                school_name = 'Demo Okulu',
                parent_phone = '+90 555 123 4567'
            WHERE user_id = user_record.id;
            
            RAISE NOTICE 'Student record updated for user: %', user_record.email;
        END IF;
    ELSE
        RAISE NOTICE 'User not found or not a student: z.kekillioglu@gmail.com';
    END IF;
END $$;

-- Verify the student record
SELECT 
    u.email,
    u.role,
    s.grade_level,
    s.school_name,
    s.parent_phone
FROM users u
LEFT JOIN students s ON u.id = s.user_id
WHERE u.email = 'z.kekillioglu@gmail.com';