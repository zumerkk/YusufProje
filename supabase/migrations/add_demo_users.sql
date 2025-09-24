-- Demo kullanıcı verilerini ekle
-- Bu dosya demo admin, teacher ve student kullanıcıları oluşturur

-- Insert demo users into public.users
INSERT INTO public.users (
  id, email, password_hash, role, is_active
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'admin@dersatlasi.com',
  crypt('admin123', gen_salt('bf')),
  'admin',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'teacher@dersatlasi.com',
  crypt('teacher123', gen_salt('bf')),
  'teacher',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'student@dersatlasi.com',
  crypt('student123', gen_salt('bf')),
  'student',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Demo paket kategorileri ekle (eğer yoksa)
INSERT INTO package_categories (id, name, description, icon, color, is_active)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440101', 'Matematik', 'Matematik dersleri ve kursları', 'calculator', '#3B82F6', true),
  ('550e8400-e29b-41d4-a716-446655440102', 'Fen Bilimleri', 'Fizik, Kimya, Biyoloji dersleri', 'flask', '#10B981', true),
  ('550e8400-e29b-41d4-a716-446655440103', 'Dil ve Edebiyat', 'Türkçe ve yabancı dil dersleri', 'book', '#F59E0B', true)
ON CONFLICT (id) DO NOTHING;

-- Demo paketler ekle
INSERT INTO packages (
  id, name, subtitle, description, price, original_price, duration, 
  features, is_popular, is_premium, icon, gradient, category_id, 
  difficulty_level, certificate_provided, is_active
)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440201',
  'Temel Matematik',
  'Matematik temelleri',
  'Temel matematik konularını kapsayan kapsamlı kurs',
  299.99,
  399.99,
  30,
  '["Video dersler", "Alıştırmalar", "Sınav hazırlığı"]',
  true,
  false,
  'calculator',
  'from-blue-500 to-purple-600',
  '550e8400-e29b-41d4-a716-446655440101',
  'beginner',
  true,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440202',
  'İleri Fizik',
  'Fizik dersleri',
  'Lise ve üniversite seviyesi fizik konuları',
  499.99,
  699.99,
  45,
  '["Laboratuvar simülasyonları", "Problem çözümleri", "Sınav hazırlığı"]',
  false,
  true,
  'zap',
  'from-green-500 to-blue-600',
  '550e8400-e29b-41d4-a716-446655440102',
  'advanced',
  true,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'Temel Matematik Paketi',
  'İlkokul matematik',
  'İlkokul seviyesi matematik dersleri',
  299,
  399,
  90,
  '["Temel işlemler", "Geometri", "Problem çözme"]',
  false,
  false,
  'calculator',
  'from-blue-400 to-purple-500',
  '550e8400-e29b-41d4-a716-446655440101',
  'beginner',
  true,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  'İleri Matematik Paketi',
  'Ortaokul matematik',
  'Ortaokul seviyesi matematik dersleri',
  499,
  699,
  180,
  '["Cebir", "Geometri", "İstatistik"]',
  false,
  false,
  'calculator',
  'from-blue-600 to-purple-700',
  '550e8400-e29b-41d4-a716-446655440101',
  'intermediate',
  true,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Insert student package
INSERT INTO student_packages (
  id, student_id, package_id, start_date, end_date, status,
  expiry_date, total_lessons, remaining_lessons, lessons_used,
  original_amount, final_amount
) VALUES (
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440005',
  NOW(),
  NOW() + INTERVAL '30 days',
  'active',
  NOW() + INTERVAL '30 days',
  10,
  8,
  2,
  500,
  450
);