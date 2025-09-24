-- Create classes table for managing school classes
CREATE TABLE IF NOT EXISTS classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., "9-A", "10-B"
    grade_level INTEGER NOT NULL CHECK (grade_level >= 1 AND grade_level <= 12),
    section VARCHAR(10) NOT NULL, -- e.g., "A", "B", "C"
    student_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(grade_level, section)
);

-- Create schedules table for managing weekly schedules
CREATE TABLE IF NOT EXISTS schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7), -- 1=Monday, 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create schedule_lessons table to link schedules with actual lesson instances
CREATE TABLE IF NOT EXISTS schedule_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    lesson_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(schedule_id, lesson_date)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_grade_section ON classes(grade_level, section);
CREATE INDEX IF NOT EXISTS idx_schedules_class_id ON schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher_id ON schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day_time ON schedules(day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_schedule_lessons_schedule_id ON schedule_lessons(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_lessons_lesson_id ON schedule_lessons(lesson_id);
CREATE INDEX IF NOT EXISTS idx_schedule_lessons_date ON schedule_lessons(lesson_date);

-- Enable RLS (Row Level Security)
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_lessons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for classes
CREATE POLICY "Classes are viewable by authenticated users" ON classes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Classes are manageable by teachers" ON classes
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid())
    );

-- Create RLS policies for schedules
CREATE POLICY "Schedules are viewable by authenticated users" ON schedules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Teachers can manage their own schedules" ON schedules
    FOR ALL USING (
        auth.role() = 'authenticated' AND teacher_id = auth.uid()
    );

-- Create RLS policies for schedule_lessons
CREATE POLICY "Schedule lessons are viewable by authenticated users" ON schedule_lessons
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Teachers can manage their schedule lessons" ON schedule_lessons
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (SELECT 1 FROM schedules s WHERE s.id = schedule_id AND s.teacher_id = auth.uid())
    );

-- Insert some sample classes
INSERT INTO classes (name, grade_level, section, student_count) VALUES
    ('9-A', 9, 'A', 25),
    ('9-B', 9, 'B', 23),
    ('10-A', 10, 'A', 27),
    ('10-B', 10, 'B', 24),
    ('11-A', 11, 'A', 22),
    ('11-B', 11, 'B', 26),
    ('12-A', 12, 'A', 20),
    ('12-B', 12, 'B', 21)
ON CONFLICT (grade_level, section) DO NOTHING;

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON classes TO anon;
GRANT ALL PRIVILEGES ON classes TO authenticated;

GRANT SELECT ON schedules TO anon;
GRANT ALL PRIVILEGES ON schedules TO authenticated;

GRANT SELECT ON schedule_lessons TO anon;
GRANT ALL PRIVILEGES ON schedule_lessons TO authenticated;