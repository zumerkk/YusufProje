-- Create test users and profiles

-- Delete existing test users if they exist
DELETE FROM students WHERE user_id IN (
  SELECT id FROM users WHERE email IN ('student@test.com', 'teacher@test.com')
);
DELETE FROM teachers WHERE user_id IN (
  SELECT id FROM users WHERE email IN ('student@test.com', 'teacher@test.com')
);
DELETE FROM profiles WHERE user_id IN (
  SELECT id FROM users WHERE email IN ('student@test.com', 'teacher@test.com')
);
DELETE FROM users WHERE email IN ('student@test.com', 'teacher@test.com');

-- Insert test student user
INSERT INTO users (id, email, password_hash, role, is_active) 
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'student@test.com',
  '$2b$10$K7L/8Y75aO7O8aTAOCR0Ousy8QNwHBp4L8RXGfWMf1YiSqg9S2HuS', -- password123
  'student',
  true
);

-- Insert profile for test student
INSERT INTO profiles (user_id, first_name, last_name, phone, date_of_birth, address)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Test',
  'Student',
  '+90 555 123 4567',
  '2005-01-15',
  'Test Address, Istanbul'
);

-- Insert student record
INSERT INTO students (user_id, grade_level, school_name, parent_name, parent_phone, parent_email, learning_goals, class_section)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '10',
  'Test High School',
  'Test Parent',
  '+90 555 987 6543',
  'parent@test.com',
  'Improve math and science skills',
  'A'
);

-- Insert test teacher user
INSERT INTO users (id, email, password_hash, role, is_active) 
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'teacher@test.com',
  '$2b$10$K7L/8Y75aO7O8aTAOCR0Ousy8QNwHBp4L8RXGfWMf1YiSqg9S2HuS', -- password123
  'teacher',
  true
);

-- Insert profile for test teacher
INSERT INTO profiles (user_id, first_name, last_name, phone, date_of_birth, address)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'Test',
  'Teacher',
  '+90 555 234 5678',
  '1985-05-20',
  'Teacher Address, Istanbul'
);

-- Insert teacher record
INSERT INTO teachers (user_id, bio, experience_years, education, hourly_rate, rating, total_reviews, is_verified, availability_status)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'Experienced math and science teacher',
  8,
  'Mathematics Education, Istanbul University',
  150.00,
  4.8,
  25,
  true,
  'available'
);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON users TO anon;
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON students TO anon;
GRANT SELECT ON teachers TO anon;

GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON profiles TO authenticated;
GRANT ALL PRIVILEGES ON students TO authenticated;
GRANT ALL PRIVILEGES ON teachers TO authenticated;