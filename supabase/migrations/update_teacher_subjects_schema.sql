-- Update teacher_subjects table to match technical documentation schema

-- First, drop any existing policies that depend on columns we want to remove
DROP POLICY IF EXISTS "Anyone can view teacher subjects" ON teacher_subjects;
DROP POLICY IF EXISTS "Teachers can manage own subjects" ON teacher_subjects;
DROP POLICY IF EXISTS "Public can view teacher subjects" ON teacher_subjects;

-- Add missing columns to teacher_subjects table
ALTER TABLE teacher_subjects 
ADD COLUMN IF NOT EXISTS proficiency_level VARCHAR(20) DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS certification_url TEXT;

-- Remove columns that are not in the documentation
ALTER TABLE teacher_subjects 
DROP COLUMN IF EXISTS grade_levels CASCADE,
DROP COLUMN IF EXISTS description CASCADE,
DROP COLUMN IF EXISTS is_active CASCADE,
DROP COLUMN IF EXISTS updated_at CASCADE;

-- Add unique constraint as specified in documentation
ALTER TABLE teacher_subjects 
ADD CONSTRAINT teacher_subjects_unique_teacher_subject 
UNIQUE(teacher_id, subject_name);

-- Update existing data with default values
UPDATE teacher_subjects 
SET proficiency_level = 'intermediate', 
    years_experience = 0 
WHERE proficiency_level IS NULL OR years_experience IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_proficiency ON teacher_subjects(proficiency_level);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_experience ON teacher_subjects(years_experience DESC);

-- Recreate policies according to technical documentation
CREATE POLICY "Teachers can manage own subjects" ON teacher_subjects FOR ALL USING (
    EXISTS (SELECT 1 FROM teachers WHERE teachers.id = teacher_subjects.teacher_id AND teachers.user_id = auth.uid())
);

CREATE POLICY "Public can view teacher subjects" ON teacher_subjects FOR SELECT USING (true);