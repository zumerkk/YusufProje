-- Add new columns to lessons table for schedule integration
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7),
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS lesson_type VARCHAR(20) DEFAULT 'regular' CHECK (lesson_type IN ('regular', 'makeup', 'extra')),
ADD COLUMN IF NOT EXISTS recurring BOOLEAN DEFAULT false;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_class_id ON lessons(class_id);
CREATE INDEX IF NOT EXISTS idx_lessons_day_of_week ON lessons(day_of_week);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_subject ON lessons(teacher_id, subject);
CREATE INDEX IF NOT EXISTS idx_lessons_date_time ON lessons(lesson_date, start_time);

-- Add constraint to ensure time range is valid
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_lesson_time_range' 
        AND table_name = 'lessons'
    ) THEN
        ALTER TABLE lessons 
        ADD CONSTRAINT valid_lesson_time_range 
        CHECK (start_time IS NULL OR end_time IS NULL OR end_time > start_time);
    END IF;
END $$;

-- Update existing lessons to have some sample data
-- This is just for demonstration, in real scenario you'd migrate existing data properly
UPDATE lessons 
SET 
    start_time = '09:00:00',
    end_time = '09:45:00',
    lesson_type = 'regular',
    recurring = true
WHERE start_time IS NULL;

-- Create a view for easier querying of lesson schedules
CREATE OR REPLACE VIEW lesson_schedules AS
SELECT 
    l.id,
    l.teacher_id,
    l.student_id,
    l.subject,
    l.lesson_date,
    l.start_time,
    l.end_time,
    l.status,
    l.lesson_type,
    l.recurring,
    l.class_id,
    l.day_of_week,
    c.name as class_name,
    c.grade_level,
    c.section,
    tp.first_name as teacher_first_name,
    tp.last_name as teacher_last_name,
    ts.subject_name as subject_name
FROM lessons l
LEFT JOIN classes c ON l.class_id = c.id
LEFT JOIN teachers t ON l.teacher_id = t.id
LEFT JOIN profiles tp ON t.user_id = tp.user_id
LEFT JOIN teacher_subjects ts ON l.teacher_id = ts.teacher_id AND l.subject = ts.subject_name;

-- Grant permissions for the view
GRANT SELECT ON lesson_schedules TO anon;
GRANT ALL PRIVILEGES ON lesson_schedules TO authenticated;