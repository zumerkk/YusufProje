-- Create USERS table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create PROFILES table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    date_of_birth DATE,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create TEACHERS table
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    experience_years INTEGER DEFAULT 0,
    education TEXT,
    hourly_rate DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create STUDENTS table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grade_level VARCHAR(20),
    school_name VARCHAR(200),
    parent_name VARCHAR(200),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    learning_goals TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create TEACHER_SUBJECTS table
CREATE TABLE teacher_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_name VARCHAR(100) NOT NULL,
    grade_levels TEXT[], -- Array of grade levels
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create LESSONS table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    lesson_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    lesson_notes TEXT,
    homework_assigned TEXT,
    price DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create LESSON_REVIEWS table
CREATE TABLE lesson_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_rating ON teachers(rating);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_teacher_subjects_teacher_id ON teacher_subjects(teacher_id);
CREATE INDEX idx_teacher_subjects_subject_name ON teacher_subjects(subject_name);
CREATE INDEX idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX idx_lessons_student_id ON lessons(student_id);
CREATE INDEX idx_lessons_date ON lessons(lesson_date);
CREATE INDEX idx_lessons_status ON lessons(status);
CREATE INDEX idx_lesson_reviews_lesson_id ON lesson_reviews(lesson_id);
CREATE INDEX idx_lesson_reviews_reviewer_id ON lesson_reviews(reviewer_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Teachers policies
CREATE POLICY "Anyone can view active teachers" ON teachers
    FOR SELECT USING (true);

CREATE POLICY "Teachers can update their own profile" ON teachers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Teachers can insert their own profile" ON teachers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Students policies
CREATE POLICY "Students can view their own profile" ON students
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can update their own profile" ON students
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own profile" ON students
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Teacher subjects policies
CREATE POLICY "Anyone can view teacher subjects" ON teacher_subjects
    FOR SELECT USING (is_active = true);

CREATE POLICY "Teachers can manage their own subjects" ON teacher_subjects
    FOR ALL USING (auth.uid() IN (SELECT user_id FROM teachers WHERE id = teacher_id));

-- Lessons policies
CREATE POLICY "Users can view their own lessons" ON lessons
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM teachers WHERE id = teacher_id
            UNION
            SELECT user_id FROM students WHERE id = student_id
        )
    );

CREATE POLICY "Teachers can manage lessons they teach" ON lessons
    FOR ALL USING (auth.uid() IN (SELECT user_id FROM teachers WHERE id = teacher_id));

CREATE POLICY "Students can view and update their lessons" ON lessons
    FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM students WHERE id = student_id));

-- Lesson reviews policies
CREATE POLICY "Anyone can view public reviews" ON lesson_reviews
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own reviews" ON lesson_reviews
    FOR SELECT USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can create reviews for their lessons" ON lesson_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND
        auth.uid() IN (
            SELECT t.user_id FROM lessons l
            JOIN teachers t ON l.teacher_id = t.id
            WHERE l.id = lesson_id
            UNION
            SELECT s.user_id FROM lessons l
            JOIN students s ON l.student_id = s.id
            WHERE l.id = lesson_id
        )
    );

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_subjects_updated_at BEFORE UPDATE ON teacher_subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_reviews_updated_at BEFORE UPDATE ON lesson_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();