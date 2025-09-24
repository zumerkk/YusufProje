-- Add class_level and class_section columns to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS class_level VARCHAR(10),
ADD COLUMN IF NOT EXISTS class_section VARCHAR(10);

-- Update existing lessons with sample class info based on student data
UPDATE lessons 
SET 
    class_level = s.grade_level,
    class_section = s.class_section
FROM students s
WHERE lessons.student_id = s.id
AND (lessons.class_level IS NULL OR lessons.class_section IS NULL);

-- Grant permissions for the updated table structure
GRANT ALL PRIVILEGES ON lessons TO authenticated;
GRANT SELECT ON lessons TO anon;