-- Create class_students table for managing student assignments to classes
CREATE TABLE IF NOT EXISTS class_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to prevent duplicate assignments
ALTER TABLE class_students ADD CONSTRAINT unique_class_student 
    UNIQUE (class_id, student_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_class_students_class_id ON class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student_id ON class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_class_students_status ON class_students(status);
CREATE INDEX IF NOT EXISTS idx_class_students_assigned_at ON class_students(assigned_at);

-- Enable RLS (Row Level Security)
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admin can see all class assignments
CREATE POLICY "Admin can view all class assignments" ON class_students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Admin can manage all class assignments
CREATE POLICY "Admin can manage class assignments" ON class_students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Teachers can view assignments for classes they teach (based on lessons table)
CREATE POLICY "Teachers can view their class assignments" ON class_students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lessons l
            JOIN users u ON u.id = auth.uid()
            WHERE l.class_id = class_students.class_id
            AND l.teacher_id = u.id
            AND u.role = 'teacher'
        )
    );

-- Students can view their own assignments
CREATE POLICY "Students can view their own assignments" ON class_students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s
            JOIN users u ON u.id = auth.uid()
            WHERE s.id = class_students.student_id
            AND s.user_id = u.id
            AND u.role = 'student'
        )
    );

-- Grant permissions to roles
GRANT SELECT ON class_students TO anon;
GRANT ALL PRIVILEGES ON class_students TO authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_class_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_class_students_updated_at_trigger
    BEFORE UPDATE ON class_students
    FOR EACH ROW
    EXECUTE FUNCTION update_class_students_updated_at();

-- Sample data will be added later through the application
-- due to grade_level format differences between tables

COMMIT;