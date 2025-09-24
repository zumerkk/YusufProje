-- Add demo teachers and students data
-- This migration adds demo users to the public.users table

-- Insert demo teacher users
INSERT INTO public.users (
  id,
  email,
  password_hash,
  role,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'teacher1@demo.com',
  crypt('demo123', gen_salt('bf')),
  'teacher',
  true,
  NOW(),
  NOW()
),
(
  '22222222-2222-2222-2222-222222222222',
  'teacher2@demo.com',
  crypt('demo123', gen_salt('bf')),
  'teacher',
  true,
  NOW(),
  NOW()
),
(
  '33333333-3333-3333-3333-333333333333',
  'teacher3@demo.com',
  crypt('demo123', gen_salt('bf')),
  'teacher',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insert demo student users
INSERT INTO public.users (
  id,
  email,
  password_hash,
  role,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  '44444444-4444-4444-4444-444444444444',
  'student1@demo.com',
  crypt('demo123', gen_salt('bf')),
  'student',
  true,
  NOW(),
  NOW()
),
(
  '55555555-5555-5555-5555-555555555555',
  'student2@demo.com',
  crypt('demo123', gen_salt('bf')),
  'student',
  true,
  NOW(),
  NOW()
),
(
  '66666666-6666-6666-6666-666666666666',
  'student3@demo.com',
  crypt('demo123', gen_salt('bf')),
  'student',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insert corresponding profiles for teachers
INSERT INTO public.profiles (
  user_id,
  first_name,
  last_name
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'Ahmet',
  'Yılmaz'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Fatma',
  'Kaya'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Mehmet',
  'Demir'
);

-- Insert corresponding profiles for students
INSERT INTO public.profiles (
  user_id,
  first_name,
  last_name
) VALUES 
(
  '44444444-4444-4444-4444-444444444444',
  'Ali',
  'Özkan'
),
(
  '55555555-5555-5555-5555-555555555555',
  'Ayşe',
  'Şahin'
),
(
  '66666666-6666-6666-6666-666666666666',
  'Emre',
  'Yıldız'
);

-- Insert teacher records
INSERT INTO public.teachers (
  user_id,
  bio,
  experience_years,
  education,
  hourly_rate,
  is_verified
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'Experienced mathematics teacher with passion for helping students excel.',
  5,
  'Mathematics Education, Ankara University',
  50.00,
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'English language specialist with international teaching experience.',
  8,
  'English Literature, Middle East Technical University',
  45.00,
  true
),
(
  '33333333-3333-3333-3333-333333333333',
  'Physics teacher focused on making complex concepts simple.',
  3,
  'Physics, Istanbul Technical University',
  55.00,
  false
);

-- Insert student records
INSERT INTO public.students (
  user_id,
  grade_level,
  school_name,
  parent_name,
  parent_phone,
  parent_email
) VALUES 
(
  '44444444-4444-4444-4444-444444444444',
  '10',
  'Atatürk Lisesi',
  'Mehmet Özkan',
  '+90 532 123 4567',
  'mehmet.ozkan@email.com'
),
(
  '55555555-5555-5555-5555-555555555555',
  '11',
  'Gazi Lisesi',
  'Hasan Şahin',
  '+90 533 234 5678',
  'hasan.sahin@email.com'
),
(
  '66666666-6666-6666-6666-666666666666',
  '12',
  'Cumhuriyet Lisesi',
  'Ayhan Yıldız',
  '+90 534 345 6789',
  'ayhan.yildiz@email.com'
);

-- Insert demo student packages data using correct column names
INSERT INTO public.student_packages (
  student_id, 
  package_id, 
  start_date, 
  end_date, 
  status, 
  total_lessons, 
  lessons_used, 
  remaining_lessons
) 
SELECT 
  '44444444-4444-4444-4444-444444444444',
  p.id,
  NOW(),
  NOW() + INTERVAL '12 months',
  'active',
  48,
  12,
  36
FROM public.packages p 
LIMIT 1;

INSERT INTO public.student_packages (
  student_id, 
  package_id, 
  start_date, 
  end_date, 
  status, 
  total_lessons, 
  lessons_used, 
  remaining_lessons
) 
SELECT 
  '55555555-5555-5555-5555-555555555555',
  p.id,
  NOW(),
  NOW() + INTERVAL '12 months',
  'active',
  48,
  28,
  20
FROM public.packages p 
OFFSET 1
LIMIT 1;

-- Add some completed packages
INSERT INTO public.student_packages (
  student_id, 
  package_id, 
  start_date, 
  end_date, 
  status, 
  total_lessons, 
  lessons_used, 
  remaining_lessons
) 
SELECT 
  '66666666-6666-6666-6666-666666666666',
  p.id,
  NOW() - INTERVAL '6 months',
  NOW() + INTERVAL '6 months',
  'active',
  48,
  48,
  0
FROM public.packages p 
OFFSET 2
LIMIT 1;